import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterEvents,facetCounts,initialState,eventBounds,paramsFromState,stateFromParams,validateDataset} from '../src/lib/ufos.mjs';
import {essentialItems,candidatePriority,validateEditorial} from '../src/lib/nhi-editorial.mjs';
import {prepareUpdate,digest} from './ufos-update.mjs';
const data=JSON.parse(readFileSync(new URL('../src/data/ufos/timeline.json',import.meta.url)));
const ids=state=>filterEvents(data,state).map(e=>e.id);
test('fresh default uses the fixed chronological essential manifest across layers, with no restrictions',()=>{
 assert.equal(initialState.view,'essentials');assert.equal(initialState.sort,'oldest');
 for(const key of ['q','from','to'])assert.equal(initialState[key],'');
 for(const key of ['topic','category','evidence','region','layer','entity'])assert.deepEqual(initialState[key],[]);
 assert.equal(data.events.length,443);assert.equal(essentialItems(data).length,90);
 assert.deepEqual(ids({}),essentialItems(data).map(item=>item.eventId));assert.equal(new Set(ids({})).size,90);
 assert.deepEqual(ids({sort:'newest'}),ids({}).reverse());
 const fixture=structuredClone(data);fixture.events.find(e=>e.id===essentialItems(fixture)[0].eventId).layer='core';
 assert.equal(filterEvents(fixture,{}).length,90); // Layer has no implicit restriction.
});
test('every catalog entry has separate consequence/learning metadata; selected entries have citations and teaching reasons',()=>{
 assert.deepEqual(validateEditorial(data,eventBounds),[]);assert.equal(Object.keys(data.editorial.assessments).length,443);
 for(const item of essentialItems(data)){const a=data.editorial.assessments[item.eventId];assert.equal(a.status,'assessed');assert.ok(a.references.length);assert.ok(item.reason);assert.ok(item.question);}
 const nulls=Object.values(data.editorial.assessments).filter(a=>a.status==='unassessed');assert.equal(nulls.length,222);assert.ok(nulls.every(a=>a.historicalImpact===null&&a.learningValue===null));
 assert.equal(data.editorial.calibration.length,12);
 for(const a of Object.values(data.editorial.assessments).filter(a=>a.historicalImpact===10))assert.ok(a.foundationalJustification);
});
test('manifest and assessment validation reject duplicate/unknown/held IDs, missing rationale, fake scores and unsupported references',()=>{
 for(const mutate of [d=>d.editorial.essentialPath.items.push(d.editorial.essentialPath.items[0]),d=>d.editorial.essentialPath.items[0].eventId='unknown',d=>d.events.find(e=>e.id===d.editorial.essentialPath.items[0].eventId).publicationStatus='held',d=>d.editorial.essentialPath.items[0].reason='',d=>d.editorial.assessments[d.editorial.essentialPath.items[0].eventId].historicalImpact=0,d=>d.editorial.assessments[d.editorial.essentialPath.items[0].eventId].references=[{sourceId:'missing',supports:'claimed'}],d=>d.editorial.essentialPath.items.reverse(),d=>delete d.editorial.assessments[d.events[0].id]]) {
  const bad=structuredClone(data);mutate(bad);assert.ok(validateDataset(bad).length);
 }
});
test('filters intersect a fixed essential set without refilling; contextual counts respect selected scope',()=>{
 const state={view:'essentials',region:['maya-world'],from:'0600',to:'1800',evidence:['Historical record','Textual scholarship']};
 const selected=ids(state);assert.ok(selected.length&&selected.length<90);assert.ok(selected.every(id=>ids({}).includes(id)));
 assert.equal(filterEvents(data,{...state,topic:['UFO reports & disclosure']}).length,0);
 for(const topic of ['Ancient societies & archaeology','Cultural traditions & expression'])assert.equal(facetCounts(data,state,'topic').get(topic)||0,ids({...state,topic:[topic]}).length);
 const absent={view:'essentials',entity:['law-of-one']};assert.equal(ids(absent).length,0);assert.ok(ids({...absent,view:'history'}).length>0);
});
test('explicit older views and essential/full scopes survive repeated-facet URL round trips',()=>{
 for(const view of ['essentials','journey','story','core','history','recent','institutions']) {
  const state={...initialState,view,topic:['Science & invention','Ancient societies & archaeology'],from:'-0500',to:'2026',sort:'newest'};
  const restored=stateFromParams(paramsFromState(state));assert.deepEqual(restored,state);assert.deepEqual(ids(restored),ids(state));
 }
 assert.equal(paramsFromState({...initialState,view:'journey'}).get('view'),'journey');
 assert.ok(ids({view:'journey'}).includes('nimitz-encounter'));
});
test('candidate weights are documented and null assessments do not become zero',()=>{
 assert.equal(candidatePriority({status:'unassessed',historicalImpact:null,learningValue:null}),null);
 assert.equal(candidatePriority({status:'assessed',historicalImpact:10,learningValue:5}),1);
 assert.deepEqual(data.editorial.rubric.weights,{impact:0.6,learning:0.4});
});
test('newly ingested records are explicit unassessed full-history entries and never displace the path',()=>{
 const now=new Date('2026-10-13T12:00:00Z'),base=structuredClone(data),e=structuredClone(data.events.find(e=>e.id==='aaro-created'));
 base.events=base.events.filter(x=>x.id!==e.id);delete base.editorial.assessments[e.id];
 const batch={schemaVersion:1,id:'test-essential-import',baseDigest:digest(base),title:'Bounded importer fixture',sources:[],changes:[{op:'add',event:e,reason:'Restore a real, source-scoped record into the fixture.'}],riskReview:{consequentialAllegation:false,uncertainInterpretation:false,physicalProofClaim:false},sourceChecks:e.sources.map(ref=>({sourceId:ref.sourceId,result:'supporting-text-read',supportedStatement:ref.supports.join(' '),location:data.sources[ref.sourceId].locator,checkedAt:now.toISOString(),url:data.sources[ref.sourceId].url}))};
 const updated=prepareUpdate(base,batch,{reviewed:true,now}).data;
 assert.equal(updated.editorial.assessments[e.id].status,'unassessed');assert.equal(updated.editorial.assessments[e.id].historicalImpact,null);
 assert.deepEqual(ids({}),filterEvents(updated,{}).map(e=>e.id));assert.ok(filterEvents(updated,{view:'history'}).some(x=>x.id===e.id));
});
