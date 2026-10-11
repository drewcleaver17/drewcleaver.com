import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterEvents, initialState, paramsFromState, stateFromParams, validateDataset, dateBounds, formatDate, eventDateLabel, yearsCovered, eventBounds, eraFor, readingPathOf, normalizeYouTubeURL } from '../src/lib/ufos.mjs';
import { datasetPath, digest, contentDigest, prepareUpdate, publishValidatedUpdate, assertPermittedPaths } from './ufos-update.mjs';
const data=JSON.parse(readFileSync(datasetPath,'utf8'));
const now=new Date();
// A real, already-audited milestone is withheld only in memory to exercise addition.
const event=structuredClone(data.events.find(e=>e.id==='senate-hearing-2024'));
// The unattended addition fixture carries the audited hearing facts, without
// editorial connections added in this manual release. Those require review.
delete event.supportingFor;delete event.contextLinks;
const base=structuredClone(data); base.events=base.events.filter(e=>e.id!==event.id);
function batch() {return {schemaVersion:1,id:'validation-real-record',baseDigest:digest(base),title:'Validated institutional record',sources:[],changes:[{op:'add',event,reason:'Add the inspected Senate hearing record.'}],riskReview:{consequentialAllegation:false,uncertainInterpretation:false,physicalProofClaim:false},sourceChecks:event.sources.map(s=>({sourceId:s.sourceId,url:data.sources[s.sourceId].url,result:'supporting-text-read',supportedStatement:'The Senate hearing took place November 19, 2024.',location:data.sources[s.sourceId].locator,checkedAt:now.toISOString()}))};}
test('published dataset validates',()=>assert.deepEqual(validateDataset(data),[]));
test('main reading prominence is independent of layer, era and retained records',()=>{
 const main=filterEvents(data,{}), all=filterEvents(data,{view:'history'});
 assert.ok(main.length>0); // Editorial depth is a guide, not a publishing quota.
 assert.ok(all.length>main.length);
 assert.ok(main.some(e=>e.id==='phoenix-lights-1997' && e.layer==='core'));
 assert.ok(main.some(e=>e.id==='jebel-irhoud' && e.layer==='contextual'));
 assert.ok(!main.some(e=>e.id==='ra-book-2-sessions'));
 assert.ok(all.some(e=>e.id==='ra-book-2-sessions'));
 assert.ok(filterEvents(data,{view:'core'}).some(e=>e.id==='nimitz-encounter'));
 assert.ok(filterEvents(data,{view:'story'}).every(e=>!e.context && e.date.start>='2017'));
 assert.deepEqual(filterEvents(data,{context:true}).map(e=>e.id),all.map(e=>e.id));
 for(const e of main)assert.ok(e.contextLinks?.length || e.relatedLinks?.length,e.id);
});
test('deep-time ages retain their measurement uncertainty and navigation convention',()=>{
 const e=data.events.find(e=>e.id==='jebel-irhoud');
 assert.equal(e.date.start,null);assert.equal(e.date.age.estimate,315000);
 assert.equal(e.date.age.uncertainty,34000);assert.equal(e.publicationDate,'2017');
 assert.ok(e.date.age.convention.includes('navigation'));
 assert.equal(eraFor(e).id,'origins');
 assert.ok(eventBounds(e)[1]<eventBounds(data.events.find(e=>e.id==='blombos-drawing'))[0]);
 assert.equal(filterEvents(data,{era:'origins'}).length,2);
 assert.ok(!filterEvents(data,{from:'0001-01-01'}).some(e=>e.date.precision==='age'));
 assert.ok(!yearsCovered([e]).length);
 for(const mutate of [x=>x.date.start='2017',x=>x.date.age.younger=x.date.age.older+1,x=>delete x.date.age.convention,x=>delete x.date.age.estimate]){
  const bad=structuredClone(data);mutate(bad.events.find(x=>x.id===e.id));
  assert.ok(validateDataset(bad).some(x=>x.includes('Invalid evidence age')));
 }
});
test('BCE and approximate calendar dates order correctly without a year zero',()=>{
 const ancient=filterEvents(data,{era:'ancient-texts'});
 assert.ok(ancient.findIndex(e=>e.id==='aristotle-cosmos')<ancient.findIndex(e=>e.id==='epicurus-worlds'));
 assert.equal(formatDate('-0350'),'350 BCE');
 const e=data.events.find(e=>e.id==='epicurus-worlds');assert.match(eventDateLabel(e),/BCE/);assert.match(e.dateNotes,/editorial sorting/);
 const bad=structuredClone(data);bad.events.find(e=>e.id==='aristotle-cosmos').date.start='0000';
 assert.ok(validateDataset(bad).some(x=>x.includes('Invalid event date')));
});
test('canonical people preserve familiar aliases and shared contribution routes',()=>{
 for(const name of ['Āryabhaṭa','Alhazen','Shen Kua','Cecilia H. Payne','Alfred Russel Wallace'])assert.ok(filterEvents(data,{view:'history',q:name}).length,name);
 const wallace=data.entities.find(n=>n.id==='alfred-russel-wallace');assert.ok(wallace.featured);
 assert.ok(filterEvents(data,{view:'history',entity:wallace.id}).some(e=>e.id==='darwin-wallace-1858'));
 const bad=structuredClone(data);delete bad.entities.find(n=>n.id===wallace.id).contribution;
 assert.ok(validateDataset(bad).some(x=>x.includes('Incomplete featured person')));
});
test('supporting links, editorial connections and scoped checks reject dangling references',()=>{
 for(const [key,value,message] of [['supportingFor',['missing-event'],'Invalid supporting record'],['contextLinks',[{eventId:'missing-event',type:'editorial-context',note:'Comparison'}],'Invalid contextual connection']]){
  const bad=structuredClone(data);bad.events.find(e=>e.id==='ra-book-2-sessions')[key]=value;
  assert.ok(validateDataset(bad).some(x=>x.includes(message)));
 }
 const bad=structuredClone(data);bad.events.find(e=>e.id==='crispr-2012').checkReceipt.sourceIds=['missing-source'];
 assert.ok(validateDataset(bad).some(x=>x.includes('Invalid event check receipt')));
 const changed=structuredClone(data);changed.events.find(e=>e.id==='crispr-2012').checkReceipt.finding+=' Revised scope.';
 assert.notEqual(contentDigest(changed),contentDigest(data));
});
test('metadata inspection remains distinct from supporting-text inspection',()=>{
 const source=data.sources['eth-kepler-1609-catalog'];assert.equal(source.verification,'metadata-and-preview-read');
 const bad=structuredClone(data);bad.sourceReviews[source.id].mode='supporting-text';
 assert.ok(validateDataset(bad).some(x=>x.includes('Source text not verified')));
 assert.equal(data.meta.researchCutoff,'2026-09-19');
 assert.ok(data.meta.checkReceipts.at(-1).sourceIds.length<Object.keys(data.sources).length);
});
test('search includes people, institutions, source titles and combined filters',()=>{
  assert.ok(filterEvents(data,{view:'history',q:'Grusch'}).length>=3);
  const result=filterEvents(data,{q:'Grusch',category:'Hearings and oversight',entity:'David Grusch',from:'2023-01-01',to:'2023-12-31',evidence:'Secondhand allegation'});
  assert.deepEqual(result.map(e=>e.id),['house-hearing-2023']);
  assert.ok(filterEvents(data,{q:'Preliminary Assessment'}).some(e=>e.id==='odni-assessment'));
});
test('chronology, reverse, context and empty results',()=>{
  const normal=filterEvents(data,{}); assert.equal(normal[0].id,'jebel-irhoud'); assert.equal(filterEvents(data,{view:'story'})[0].id,'nyt-2017');
  assert.deepEqual(filterEvents(data,{sort:'newest'}).map(e=>e.id),normal.map(e=>e.id).reverse());
  assert.equal(filterEvents(data,{view:'history'})[0].id,'jebel-irhoud');
  assert.ok(filterEvents(data,{context:true}).some(e=>e.id==='nimitz-encounter'));
  assert.equal(filterEvents(data,{q:'zz-no-such-event'}).length,0);
});
test('partial dates overlap a range without inventing a display day',()=>{
  assert.deepEqual(dateBounds('2020-02'),['2020-02-01','2020-02-29']);
  assert.equal(formatDate('2019-03'),'March 2019');
  assert.ok(filterEvents(data,{from:'2019-03-20',to:'2019-03-21'}).some(e=>e.id==='navy-reporting'));
});
test('ancient estimates keep their qualifications and overlap date filters',()=>{
  const e=data.events.find(e=>e.id==='nag-hammadi-codices');
  assert.equal(eventDateLabel(e),'Later fourth century CE · approximate');
  assert.equal(formatDate('0367'),'367');
  assert.ok(filterEvents(data,{view:'history',from:'0367-01-01',to:'0367-12-31'}).some(e=>e.id==='nag-hammadi-codices'));
  const invalid=structuredClone(data); delete invalid.events.find(e=>e.id==='nag-hammadi-codices').dateNotes;
  assert.ok(validateDataset(invalid).some(e=>e.includes('Unqualified approximate date')));
});
test('religious texts are searchable historical context with attributed session dates',()=>{
  const state={...initialState,view:'history',topic:'Religious texts & channeling',entity:'law-of-one',q:'archetypes'};
  assert.deepEqual(stateFromParams(paramsFromState(state)),state);
  assert.deepEqual(filterEvents(data,state).map(e=>e.id),['ra-book-4-sessions']);
  assert.equal(filterEvents(data,{view:'story',topic:'Religious texts & channeling'}).length,0);
  const newer=data.events.filter(e=>e.topics.includes('Religious texts & channeling'));
  assert.ok(newer.length > 0);
  assert.ok(newer.every(e=>e.context && e.automationClass==='review-required'));
  assert.equal(data.events.find(e=>e.id==='ra-final-session').date.role,'session');
  assert.equal(data.events.find(e=>e.id==='ra-book-v-1998').date.start,'1998');
});
test('URL state round trip and reset',()=>{
  const s={...initialState,q:'NASA & UAP',category:'Scientific research',context:true,view:'recent'};
  assert.deepEqual(stateFromParams(paramsFromState(s)),s);
  assert.equal(paramsFromState(initialState).toString(),'');
});
test('recent view uses site revision, not incident date',()=>{
  const d=structuredClone(data);
  const latest=Math.max(...d.events.map(e=>Date.parse(e.revisedAt)));
  d.events.find(e=>e.id==='nyt-2017').revisedAt=new Date(latest+1000).toISOString();
  assert.equal(filterEvents(d,{view:'recent'})[0].id,'nyt-2017');
});
test('valid sourced event, duplicate replay and conflicting duplicate',()=>{
  const b=batch(), result=prepareUpdate(base,b,{now}); assert.equal(result.changed,true);
  const again={...b,baseDigest:digest(result.data)}; assert.equal(prepareUpdate(result.data,again,{now}).changed,false);
  const duplicate={...b,baseDigest:digest(data),id:'duplicate-check',changes:[{...b.changes[0],event:data.events.find(e=>e.id===event.id)}]}; assert.equal(prepareUpdate(data,duplicate,{now}).changed,false);
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

test('historical aliases, strands and combined filters remain separate from modern default',()=>{
  assert.equal(filterEvents(data,{view:'story',q:'INSCOM'}).some(e=>e.id==='gateway-assessment'),false);
  assert.ok(filterEvents(data,{view:'history',q:'Intelligence and Security Command',topic:'Remote viewing & consciousness',entity:'inscom',from:'1983-01-01',to:'1983-12-31'}).some(e=>e.id==='gateway-assessment'));
  assert.ok(filterEvents(data,{view:'history',q:'Jacques Vallee'}).some(e=>e.id==='vallee-rice-donation'));
  assert.ok(filterEvents(data,{view:'history',q:'Stargate'}).some(e=>e.id==='air-remote-viewing-review'));
  assert.equal(filterEvents(data,{view:'story',q:'Magenta'}).some(e=>e.id==='magenta-claim-retelling'),false);
  assert.ok(filterEvents(data,{view:'history',from:'1506-01-01',to:'1506-12-31'}).some(e=>e.id==='leonardo-flight-notebook'));
});
test('full-history URL state and sorting preserve date uncertainty and claimed dates',()=>{
  const s={...initialState,view:'history',topic:'Business & wartime finance',entity:'bbh',sort:'newest'};
  assert.deepEqual(stateFromParams(paramsFromState(s)),s);
  assert.equal(stateFromParams(new URLSearchParams('view=bogus')).view,'journey');
  const e=data.events.find(e=>e.id==='magenta-claim-retelling');assert.equal(e.date.start,'2017-03-21');assert.equal(e.claimDate.start,'1933-06-13');
  assert.equal(formatDate('1931'),'1931');
  const history=filterEvents(data,{view:'history'});assert.deepEqual(filterEvents(data,{view:'history',sort:'newest'}).map(e=>e.id),history.map(e=>e.id).reverse());
});
test('index and relationship references require dates, boundaries and inspected citations',()=>{
  const d=structuredClone(data);d.relationships[0].sources=[];assert.ok(validateDataset(d).some(e=>e.includes('Unsourced relationship')));
  const c=structuredClone(data);c.entities[0].eventIds=['missing'];assert.ok(validateDataset(c).some(e=>e.includes('Unknown entity event')));
  const b=structuredClone(data);b.relationships[0].date.start='1942-02-30';assert.ok(validateDataset(b).some(e=>e.includes('relationship dates')));
  const h=contentDigest(data);const edited=structuredClone(data);edited.entities[0].description+=' Revised.';assert.notEqual(contentDigest(edited),h);
});
test('unattended envelopes cannot revise relationship or entity definitions',()=>{
  const b=batch();b.relationships=[];assert.throws(()=>prepareUpdate(base,b,{now}),/Unsupported envelope/);
  const c=batch();c.changes[0].event={...event,claimDate:{start:'1933',attribution:'Unverified',note:'Claim'}};assert.throws(()=>prepareUpdate(base,c,{now}),/Hold for review/);
});
test('an unchanged source check is idempotent, records its scope, and leaves content unchanged',()=>{
  const b=batch();b.changes=[];b.checkOnly=true;
  const before=structuredClone(data);before.meta.lastCheckedAt=new Date(+now-60000).toISOString();b.baseDigest=digest(before);
  const result=prepareUpdate(before,b,{now});assert.equal(result.changed,true);
  const expected=structuredClone(before);expected.meta.lastCheckedAt=now.toISOString();expected.meta.checkReceipts=result.data.meta.checkReceipts;assert.deepEqual(result.data,expected);assert.equal(result.data.meta.checkReceipts.length,before.meta.checkReceipts.length+b.sourceChecks.length);assert.deepEqual(result.data.meta.checkReceipts.slice(-b.sourceChecks.length).flatMap(r=>r.sourceIds),b.sourceChecks.map(s=>s.sourceId));assert.equal(contentDigest(result.data),contentDigest(before));
  b.baseDigest=digest(result.data);assert.equal(prepareUpdate(result.data,b,{now}).changed,false);
  b.sourceChecks[0].result='unavailable';assert.throws(()=>prepareUpdate(result.data,b,{now}),/failed source/);
});
test('paused publishing and stale check state stop unattended changes',()=>{
  const paused=structuredClone(base);paused.meta.updateStatus='paused';const b=batch();b.baseDigest=digest(paused);assert.throws(()=>prepareUpdate(paused,b,{now}),/Publication paused/);
  const c=batch();c.baseDigest='stale';assert.throws(()=>prepareUpdate(base,c,{now}),/Stale base/);
});

test('layer and era are independent, while legacy presets and names remain compatible',()=>{
  assert.ok(filterEvents(data,{view:'core',era:'archives'}).some(e=>e.id==='nimitz-encounter'));
  assert.ok(!filterEvents(data,{view:'core'}).some(e=>e.id==='gateway-assessment'));
  assert.ok(filterEvents(data,{view:'history',layer:'contextual',era:'experiments'}).some(e=>e.id==='gateway-assessment'));
  assert.deepEqual(filterEvents(data,{view:'history',entity:'david-fravor'}).map(e=>e.id),filterEvents(data,{view:'history',entity:'David Fravor'}).map(e=>e.id));
  const state={...initialState,view:'core',era:'archives',layer:'core',q:'Nimitz'};
  assert.deepEqual(stateFromParams(paramsFromState(state)),state);
  assert.ok(filterEvents(data,{view:'story',context:true}).some(e=>e.id==='nimitz-encounter'));
});
test('year navigation includes intersecting ranges and post-cutoff releases',()=>{
  assert.ok(yearsCovered(data.events).includes('1975'));
  assert.ok(filterEvents(data,{view:'history',from:'1975-01-01',to:'1975-12-31'}).some(e=>e.id==='sri-perceptual-research'));
  assert.ok(filterEvents(data,{view:'history',from:'2026-09-20',to:'2026-12-31'}).some(e=>e.id==='aaro-workshop-records-published-2026'));
});
test('document and assessment dates do not imply public release; false precision is rejected',()=>{
  for(const id of ['gateway-assessment','maison-rouge-report','air-remote-viewing-review','gofast-analysis-2025']) {
    const e=data.events.find(e=>e.id===id);assert.ok(e.documentDate);assert.equal(e.publicReleasedAt,null);
  }
  const d=structuredClone(data);d.events[0].date.precision='day';assert.ok(validateDataset(d).some(e=>e.includes('False date precision')));
  const c=structuredClone(data);c.events[0].documentDate='2004-02-30';assert.ok(validateDataset(c).some(e=>e.includes('documentDate')));
});
test('inspection origins and typed references validate and affect the content digest',()=>{
  const d=structuredClone(data);d.sourceReviews.unknown={...d.sourceReviews.fravor};assert.ok(validateDataset(d).some(e=>e.includes('Unknown reviewed source')));
  const c=structuredClone(data);c.sourceReviews.fravor.originGroup+=' edited';assert.notEqual(contentDigest(c),contentDigest(data));
  c.relationships[0].type='proves-nhi';assert.ok(validateDataset(c).some(e=>e.includes('relationship type')));
  const b=structuredClone(data);b.events[0].relatedLinks=[{eventId:'missing',type:'assessment',note:'Test',sourceIds:['missing']}];assert.ok(validateDataset(b).some(e=>e.includes('typed event link')));
});
test('YouTube forms normalize and occurrence-level limits include supplementary sources',()=>{
  const id='2GRjgBVw9Pk';
  for(const url of [`https://youtu.be/${id}?t=36`,`https://m.youtube.com/watch?v=${id}`,`https://www.youtube.com/embed/${id}`,`https://www.youtube-nocookie.com/embed/${id}`,`https://www.youtube.com/shorts/${id}`]) assert.equal(normalizeYouTubeURL(url).id,id);
  assert.equal(normalizeYouTubeURL(`https://youtube.com/watch?v=${id}&list=PL123`),null);
  const d=structuredClone(data),lazar=d.events.find(e=>e.id==='lazar-klas-interview'),other=d.events.find(e=>e.id==='nimitz-encounter');
  other.occurrenceKey=lazar.occurrenceKey;other.selectedVideo={...lazar.selectedVideo,url:'https://youtu.be/abcdefghijk'};
  assert.ok(validateDataset(d).some(e=>e.includes('Multiple YouTube videos for occurrence')));
  other.occurrenceKey=other.id;assert.ok(!validateDataset(d).some(e=>e.includes('Multiple YouTube videos for occurrence')));
  lazar.supplementaryLinks=['https://www.youtube.com/watch?v=abcdefghijk'];assert.ok(validateDataset(d).some(e=>e.includes('Unannotated supplementary')));
});
test('partial updates preserve broad research coverage and prior publication receipts',()=>{
  const before=structuredClone(base);before.meta.publicationReceipt=data.meta.publicationHistory.at(-1);
  const b=batch();b.baseDigest=digest(before);const result=prepareUpdate(before,b,{now});
  assert.equal(result.data.meta.researchCutoff,before.meta.researchCutoff);
  assert.equal(result.data.meta.publicationReceipt,null);
  assert.deepEqual(result.data.meta.publicationHistory.at(-1),before.meta.publicationReceipt);
  assert.equal(result.data.meta.updateStatus,before.meta.updateStatus);
  const check=structuredClone(data);check.meta.lastCheckedAt=now.toISOString();check.meta.checkReceipts.push({...check.meta.checkReceipts[0],checkedAt:now.toISOString()});assert.equal(contentDigest(check),contentDigest(data));
});
test('legacy event envelopes receive additive model defaults without changing IDs',()=>{
  const b=batch();b.changes[0].event=structuredClone(event);
  for(const key of ['layer','occurrenceKey','claimStatus','documentDate','publicReleasedAt','readingPath']) delete b.changes[0].event[key];
  const result=prepareUpdate(base,b,{now}),e=result.data.events.find(e=>e.id===event.id);
  assert.equal(e.slug,event.slug);assert.equal(e.layer,'core');assert.equal(e.occurrenceKey,event.id);assert.deepEqual(validateDataset(result.data,now),[]);
});
test('unattended updates preserve omitted editorial fields and hold new connections',()=>{
 const b=batch();b.changes[0].event=structuredClone(data.events.find(e=>e.id===event.id));
 assert.throws(()=>prepareUpdate(base,b,{now}),/new editorial connections/);
 const existing=data.events.find(e=>e.id===event.id), revision=structuredClone(existing);
 delete revision.readingPath;delete revision.supportingFor;revision.summary+=' ';
 const next={...batch(),id:'legacy-revision-check',baseDigest:digest(data),changes:[{op:'revise',event:revision,reason:'Exercise omitted legacy presentation fields in memory.'}]};
 const result=prepareUpdate(data,next,{now}).data.events.find(e=>e.id===event.id);
 assert.equal(result.readingPath,existing.readingPath);assert.deepEqual(result.supportingFor,existing.supportingFor);
 revision.readingPath='main';assert.throws(()=>prepareUpdate(data,next,{now}),/editorial reading path/);
});
