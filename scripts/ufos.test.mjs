import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterEvents, initialState, paramsFromState, stateFromParams, validateDataset, dateBounds, formatDate } from '../src/lib/ufos.mjs';
import { datasetPath, digest, prepareUpdate, publishValidatedUpdate, assertPermittedPaths } from './ufos-update.mjs';
const data=JSON.parse(readFileSync(datasetPath,'utf8'));
const now=new Date();
// A real, already-audited milestone is withheld only in memory to exercise addition.
const event=data.events.find(e=>e.id==='senate-hearing-2024');
const base=structuredClone(data); base.events=base.events.filter(e=>e.id!==event.id);
function batch() {return {schemaVersion:1,id:'validation-real-record',baseDigest:digest(base),title:'Validated institutional record',sources:[],changes:[{op:'add',event,reason:'Add the inspected Senate hearing record.'}],riskReview:{consequentialAllegation:false,uncertainInterpretation:false,physicalProofClaim:false},sourceChecks:event.sources.map(s=>({sourceId:s.sourceId,url:data.sources[s.sourceId].url,result:'supporting-text-read',supportedStatement:'The Senate hearing took place November 19, 2024.',location:data.sources[s.sourceId].locator,checkedAt:now.toISOString()}))};}
test('published dataset validates',()=>assert.deepEqual(validateDataset(data),[]));
test('search includes people, institutions, source titles and combined filters',()=>{
  assert.ok(filterEvents(data,{q:'Grusch'}).length>=3);
  const result=filterEvents(data,{q:'Grusch',category:'Hearings and oversight',entity:'David Grusch',from:'2023-01-01',to:'2023-12-31',evidence:'Secondhand allegation'});
  assert.deepEqual(result.map(e=>e.id),['house-hearing-2023']);
  assert.ok(filterEvents(data,{q:'Preliminary Assessment'}).some(e=>e.id==='odni-assessment'));
});
test('chronology, reverse, context and empty results',()=>{
  const normal=filterEvents(data,{}); assert.equal(normal[0].id,'nyt-2017');
  assert.deepEqual(filterEvents(data,{sort:'newest'}).map(e=>e.id),normal.map(e=>e.id).reverse());
  assert.equal(filterEvents(data,{context:true})[0].id,'nimitz-encounter');
  assert.equal(filterEvents(data,{q:'zz-no-such-event'}).length,0);
});
test('partial dates overlap a range without inventing a display day',()=>{
  assert.deepEqual(dateBounds('2020-02'),['2020-02-01','2020-02-29']);
  assert.equal(formatDate('2019-03'),'March 2019');
  assert.ok(filterEvents(data,{from:'2019-03-20',to:'2019-03-21'}).some(e=>e.id==='navy-reporting'));
});
test('URL state round trip and reset',()=>{
  const s={...initialState,q:'NASA & UAP',category:'Scientific research',context:true,view:'recent'};
  assert.deepEqual(stateFromParams(paramsFromState(s)),s);
  assert.equal(paramsFromState(initialState).toString(),'');
});
test('recent view uses site revision, not incident date',()=>{
  const d=structuredClone(data); d.events.find(e=>e.id==='nyt-2017').revisedAt='2026-09-20T00:00:00Z';
  assert.equal(filterEvents(d,{view:'recent'})[0].id,'nyt-2017');
});
test('valid sourced event, duplicate replay and conflicting duplicate',()=>{
  const b=batch(), result=prepareUpdate(base,b,{now}); assert.equal(result.changed,true);
  const again={...b,baseDigest:digest(result.data)}; assert.equal(prepareUpdate(result.data,again,{now}).changed,false);
  const duplicate={...b,baseDigest:digest(data),id:'duplicate-check'}; assert.equal(prepareUpdate(data,duplicate,{now}).changed,false);
  duplicate.changes[0].event={...event,summary:'Conflicting replacement'};
  assert.throws(()=>prepareUpdate(data,duplicate,{now}),/Duplicate/);
});
test('malformed dates and missing citation rejected',()=>{
  const b=batch(); b.changes[0].event={...event,date:{start:'2026-02-30',end:null,precision:'day',role:'milestone'}};
  assert.throws(()=>prepareUpdate(base,b,{now}),/Invalid event date/);
  const c=batch(); c.changes[0].event={...event,sources:[]}; assert.throws(()=>prepareUpdate(base,c,{now}),/require inspected primary sources/);
});
test('unsupported claim and consequential allegation held',()=>{
  const b=batch(); b.sourceChecks=[]; assert.throws(()=>prepareUpdate(base,b,{now}),/Unsupported claim/);
  const c=batch(); c.riskReview.physicalProofClaim=true; assert.throws(()=>prepareUpdate(base,c,{now}),/Hold for review/);
});
test('failed source stops deployment; failed deployment never claims published',async()=>{
  let deployed=false;
  await assert.rejects(publishValidatedUpdate(base,batch(),{verifySources:async()=>{throw new Error('Source unavailable');},deploy:async()=>{deployed=true;}},{now}),/Source unavailable/);
  assert.equal(deployed,false);
  await assert.rejects(publishValidatedUpdate(base,batch(),{verifySources:async()=>{},deploy:async()=>{throw new Error('Deployment failed');}},{now}),/Deployment failed/);
  await assert.rejects(publishValidatedUpdate(base,batch(),{verifySources:async()=>{},deploy:async()=>'test-revision',verifyLive:async()=>false},{now}),/Live verification failed/);
  assert.equal(base.events.some(e=>e.id===event.id),false);
});
test('only an acknowledged, live-verified deployment yields published status',async()=>{
  const result=await publishValidatedUpdate(base,batch(),{verifySources:async()=>{},deploy:async()=> 'safe-test-only',verifyLive:async()=>true},{now});
  assert.equal(result.status,'published'); // Adapter simulation, not a real deployment claim.
});
test('scope guard rejects unrelated writes',()=>{
  assert.doesNotThrow(()=>assertPermittedPaths(['src/data/ufos/timeline.json']));
  assert.throws(()=>assertPermittedPaths(['package.json']),/restricted/);
});
