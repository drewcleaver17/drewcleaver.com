import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {directoryIndex,filterPeople,peopleStateFromParams,peopleParams,validatePeople,timelineProjection} from '../src/lib/ufo-people.mjs';
import {contentDigest,prepareUpdate,digest} from './ufos-update.mjs';
const data=JSON.parse(readFileSync(new URL('../src/data/ufos/timeline.json',import.meta.url)));
test('every canonical person has one complete, sourced profile and all assets resolve',()=>{
 assert.deepEqual(validatePeople(data),[]);
 const people=data.entities.filter(n=>n.type==='person');assert.equal(directoryIndex(data).length,people.length);
 assert.equal(new Set(directoryIndex(data).map(n=>n.id)).size,people.length);
 for(const n of people) {
  assert.ok(n.personProfile.contributions.length,n.id);
  if(n.personProfile.portrait)assert.ok(existsSync(new URL('../public'+n.personProfile.portrait.src,import.meta.url)),n.id);
 }
});
test('search reaches names, aliases, works and associated institutions and combines controls',()=>{
 const index=directoryIndex(data);
 for(const n of data.entities.filter(n=>n.type==='person')) {
  assert.ok(filterPeople(index,{q:n.name}).some(r=>r.id===n.id),n.id);
  for(const alias of n.aliases)assert.ok(filterPeople(index,{q:alias}).some(r=>r.id===n.id),alias);
  for(const ref of n.personProfile.workRefs)assert.ok(filterPeople(index,{q:data.works[ref.workId].title}).some(r=>r.id===n.id),ref.workId);
 }
 assert.ok(filterPeople(index,{q:'NASA'}).some(n=>n.id==='katherine-johnson'));
 assert.equal(filterPeople(index,{q:'xyzz-nothing-found'}).length,0);
 for(const n of filterPeople(index,{featured:true,role:'science'}))assert.ok(n.featured&&n.roles.includes('science'));
 assert.deepEqual(filterPeople(index,{sort:'za'}),[...index].reverse());
 const state={q:'Vallée',role:'research',featured:true,sort:'za',person:'vallee'};assert.deepEqual(peopleStateFromParams(peopleParams(state)),state);
});
test('profile/work content is excluded from the initial timeline projection but included in its edition digest',()=>{
 const projected=timelineProjection(data);assert.equal(projected.works,undefined);
 assert.ok(projected.entities.every(n=>!n.personProfile));assert.deepEqual(projected.events,data.events);
 assert.deepEqual(projected.relationships,data.relationships);
 const changed=structuredClone(data);Object.values(changed.works)[0].blurb+=' Revised.';assert.notEqual(contentDigest(changed),contentDigest(data));
});
test('structural validation rejects broken works, false people and incomplete image rights',()=>{
 const changed=structuredClone(data),n=changed.entities.find(n=>n.type==='person');
 n.personProfile.workRefs.push({workId:'missing',role:'Author',relation:'by'});assert.ok(validatePeople(changed).some(e=>e.includes('person/work')));
 n.personProfile.workRefs.pop();n.personProfile.portrait={src:'/external.jpg'};assert.ok(validatePeople(changed).some(e=>e.includes('portrait')));
 const institution=changed.entities.find(n=>n.type!=='person');institution.personProfile=n.personProfile;assert.ok(validatePeople(changed).some(e=>e.includes('Non-person')));
});
test('unattended envelope cannot add or overwrite person profiles, works or portrait metadata',()=>{
 const batch={schemaVersion:1,id:'people-unauthorised-test',baseDigest:digest(data),title:'Test rejected envelope',sources:[],changes:[],checkOnly:true,sourceChecks:[]};
 for(const field of ['entities','works','portraits','peopleReview'])assert.throws(()=>prepareUpdate(data,{...batch,[field]:[]}),/Unsupported envelope/);
});
