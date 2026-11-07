import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountInlineResults, resultComparator} from '../public/45north/assets/issue-list-results.mjs';

const delay = () => new Promise(resolve => setTimeout(resolve, 10));
const counts = (...values) => {
  const result = Array(10).fill(0);
  for (const value of values) result[value-1]++;
  return result;
};
function idea(id, title, values) {
  const n = values.length, ordered = [...values].sort((a,b)=>a-b);
  return {id,title,topic:'Example',counts:counts(...values),n,
    median:n ? (ordered[Math.floor((n-1)/2)]+ordered[Math.floor(n/2)])/2 : null,
    mean:n ? values.reduce((sum,x)=>sum+x,0)/n : null};
}
const base = [idea(7,'Later bus',[1,10]),idea(2,'Childcare',[5,6]),idea(45,'Retirement',[])];
function report(asOf = 1000, ideas = base, snapshotAt = null) {
  return {version:'priority-v2',question:'Common stem',anchors:{low:'Lowest priority',high:'Highest priority'},
    windowDays:30,startedAt:100,asOf,ideas,snapshotAt};
}
function setup(t) {
  const dom = new JSDOM('<button id="prior">Active rating</button><section id="tools" hidden></section><main></main>',{pretendToBeVisual:true,url:'https://example.org/45north/'});
  const doc=dom.window.document, prior=globalThis.document;
  globalThis.document=doc;
  const slots=new Map();
  for(const item of base) {const slot=doc.createElement('div');slot.hidden=true;doc.querySelector('main').append(slot);slots.set(item.id,slot);}
  const previous=doc.querySelector('#prior');previous.focus();
  t.after(()=>{dom.window.close();globalThis.document=prior;});
  return {doc,dom,tools:doc.querySelector('#tools'),getRows:()=>slots,slots,previous};
}

test('median ranking is stable, breaks ties by sample count then permanent ID, and leaves unrated last',()=>{
  const list=[...base,idea(4,'Another',[3,5,6,9]),idea(8,'Highest',[10])];
  const byId=new Map(list.map(item=>[item.id,item]));
  assert.equal(resultComparator('original',byId),null);
  assert.deepEqual(list.map(i=>i.id).sort(resultComparator('median',byId)),[8,4,2,7,45]);
  assert.deepEqual([45,7,2,8].sort(resultComparator('name',byId)),[2,8,7,45]);
  assert.deepEqual([45,7,2,8,4].sort(resultComparator('count',byId)),[4,2,7,8,45]);
});

test('inline disclosure distinguishes equal medians, keeps active focus and restores neutral order on hide',async t=>{
  const h=setup(t), calls=[],sorts=[];
  const request=async(path,options)=>{calls.push({path,options});return Response.json(report(),{headers:{etag:'W/"public"'}});};
  const control=mountInlineResults({...h,request,onSort:(mode,compare)=>sorts.push([mode,compare])});
  t.after(()=>control.destroy());
  await delay();
  assert.deepEqual(calls.map(c=>c.path),['/survey/results']);
  assert.equal(h.doc.activeElement,h.previous);
  assert.equal(h.slots.get(7).querySelector('[data-stat=n]').textContent,'2');
  assert.equal(h.slots.get(7).querySelector('[data-stat=median]').textContent,'5.5');
  assert.equal(h.slots.get(2).querySelector('[data-stat=median]').textContent,'5.5');
  assert.equal(h.slots.get(7).querySelector('tr[data-score="1"] [data-bin-count]').textContent,'1');
  assert.equal(h.slots.get(2).querySelector('tr[data-score="1"] [data-bin-count]').textContent,'0');
  assert.equal(h.slots.get(7).querySelector('tr[data-score="10"] [data-bin-percent]').textContent,'50%');
  assert.equal(h.slots.get(2).querySelector('[data-stat=high]').textContent,'0%');
  assert.equal(h.slots.get(45).querySelector('[data-distribution]'),null);
  assert.equal(h.doc.querySelector('[data-snapshot-csv]').hidden,true);
  const select=h.tools.querySelector('select');select.value='median';select.dispatchEvent(new h.dom.window.Event('change'));
  assert.equal(sorts.at(-1)[0],'median');assert.deepEqual([7,45,2].sort(sorts.at(-1)[1]),[2,7,45]);
  await control.refresh();
  assert.equal(calls.at(-1).options.headers['If-None-Match'],'W/"public"');
  control.destroy();
  assert.equal(h.tools.hidden,true);
  for(const slot of h.slots.values()){assert.equal(slot.hidden,true);assert.equal(slot.textContent,'');}
  assert.equal(sorts.at(-1)[0],'original');assert.equal(sorts.at(-1)[1],null);
});

test('force refresh during a prior read rejects a stale post-write value and triggers a fresh read',async t=>{
  const h=setup(t);let n=0,release;
  const data=[];
  const request=async()=>{
    n++;
    if(n===1)return Response.json(report());
    if(n===2){await new Promise(resolve=>{release=resolve;}); return Response.json(report(1001,[idea(7,'Stale',[1])]))}
    return Response.json(report(1700,[idea(7,'Latest',[9])]));
  };
  const control=mountInlineResults({...h,request,onData:r=>data.push(r.asOf)});
  t.after(()=>control.destroy());
  await delay();
  const prior=control.refresh();await delay();
  await control.refresh({force:true,after:1699});
  release();await prior;await delay();
  assert.deepEqual(data,[1000,1700]);
  assert.equal(h.slots.get(7).querySelector('[data-stat=median]').textContent,'9');
});

test('reader-initiated CSV actions use only the public CSV endpoints, with a save-file fallback',async t=>{
  const h=setup(t);const calls=[],downloads=[];
  h.dom.window.HTMLAnchorElement.prototype.click=function(){ downloads.push([this.href,this.download]);};
  const request=async(path,options)=>{
    calls.push([path,options]);
    if(path==='/survey/results')return Response.json(report(1000,base,900));
    return new Response('heading\r\nvalue\r\n',{headers:{'content-type':'text/csv; charset=utf-8'}});
  };
  const control=mountInlineResults({...h,request});
  t.after(()=>control.destroy());
  await delay();
  assert.equal(h.doc.querySelector('[data-snapshot-csv]').hidden,false);
  h.doc.querySelector('[data-export-csv]').click();await delay();
  h.doc.querySelector('[data-snapshot-csv]').click();await delay();
  assert.deepEqual(calls.map(c=>c[0]),['/survey/results','/survey/export.csv','/survey/snapshots.csv']);
  assert.equal(calls[1][1].cache,'no-store');
  assert.equal(downloads.length,2);
  assert.ok(downloads.every(([href,name])=>href.startsWith('blob:')&&name.endsWith('.csv')));
  assert.equal(h.doc.querySelector('a.ir-save').textContent,'Save CSV file');
});
