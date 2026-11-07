// From the repository root: node --test tests/45north-client.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findIdeas, VisitDeck, voteMessage, tally } from '../public/45north/assets/model.mjs';

const catalog=JSON.parse(readFileSync(new URL('../src/data/45north.json',import.meta.url),'utf8'));
test('plain-language aliases and permanent IDs lead to the relevant ideas',()=>{
  for(const [query,id] of [['Daycare on Sunday',16],['bus home after my shift',7],["my landlord won't fix the heat",35],['idea-007',7],['#45',45]]) {
    assert.equal(findIdeas(catalog,query)[0]?.id,id,query);
  }
  assert.deepEqual(findIdeas(catalog,'quasar spacecraft itineraries'),[]);
});

test('the visit deck covers all 251 ideas once before repeating, including a short last set',()=>{
  const ids=Array.from({length:251},(_,n)=>n+1);
  const deck=new VisitDeck();
  const seen=new Set();
  while(seen.size<ids.length){
    const session=deck.begin(ids);
    assert.equal(session.length,Math.min(3,ids.length-seen.size));
    for(const id of session) { assert.ok(!seen.has(id)); seen.add(id); deck.show(id); }
  }
  assert.ok(seen.has(251));
  assert.equal(deck.begin(ids).length,3);
});

test('a one-card exit leaves the other two eligible and tiny catalogs have no repeats',()=>{
  const deck=new VisitDeck(()=>0.5);
  const [first]=deck.begin([1,2,3]); deck.show(first);
  const rest=deck.begin([1,2,3]);
  assert.equal(rest.length,2); assert.ok(!rest.includes(first));
  assert.deepEqual(deck.begin([7]),[7]);
  const pair=deck.begin([1,2]);
  assert.equal(new Set(pair).size,pair.length);
});

test('vote feedback distinguishes no data, ties with votes, repeats, switches and removal',()=>{
  assert.equal(tally({}),'Totals unavailable');
  assert.equal(tally({higher:0,lower:0,net:0}),'No votes yet');
  assert.equal(tally({higher:22,lower:18,net:4}),'+4 · 40 votes');
  assert.equal(tally({higher:1,lower:1,net:0}),'0 · 2 votes');
  assert.equal(voteMessage({state:1,outcome:'recorded'}),'Upvote recorded.');
  assert.equal(voteMessage({state:1,outcome:'unchanged'}),'Already counted for this connection.');
  assert.equal(voteMessage({state:-1,outcome:'changed'}),'Changed to downvote.');
  assert.equal(voteMessage({state:0,outcome:'removed'}),'Vote removed for this connection.');
});
