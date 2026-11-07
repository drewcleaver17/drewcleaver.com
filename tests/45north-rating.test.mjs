import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IssueVisit, ratingMessage } from '../public/45north/assets/survey-model.mjs';

test('the survey retains all permanent launch IDs with a plain title and one concrete proposal', () => {
  const read=name=>JSON.parse(readFileSync(new URL('../src/data/'+name,import.meta.url)));
  const old=read('45north.json'), instrument=read('45north-survey.json');
  assert.deepEqual(instrument.map(i=>i.id),old.map(i=>i.id));
  assert.equal(new Set(instrument.map(i=>i.title)).size,45);
  for(const item of instrument){
    assert.deepEqual(Object.keys(item).sort(),['action','id','title']);
    assert.ok(item.action.length>20);
    assert.doesNotMatch(item.title,/^#?\d+[.)\s]/);
  }
});

test('every active issue can be drawn first; skipping traverses the whole set without repetitions',()=>{
  const ids=Array.from({length:251},(_,i)=>i+1);
  for(const id of ids) assert.equal(new IssueVisit(()=> (id-.5)/ids.length).draw(ids),id);
  const visit=new IssueVisit(()=>.83);
  const displayed=ids.map(()=>visit.draw(ids));
  assert.equal(new Set(displayed).size,251);
  assert.equal(visit.draw(ids),null);
  assert.equal(visit.back(new Set(ids)),displayed.at(-2));
  assert.equal(visit.draw(ids),displayed.at(-1));
});

test('a confirmation states only this connection’s response',()=>{
  assert.match(ratingMessage({outcome:'recorded',score:7}),/7 out of 10/);
  assert.match(ratingMessage({outcome:'empty',score:null}),/no active rating/i);
  for(const outcome of ['recorded','changed','unchanged','removed','empty']){
    assert.doesNotMatch(ratingMessage({outcome,score:3}),/rank|net|average|median|other people/i);
  }
});
