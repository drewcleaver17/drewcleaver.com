import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {filterEvents,initialState} from '../src/lib/ufos.mjs';
const html=readFileSync(new URL('../dist/ufos/index.html',import.meta.url),'utf8');
const scriptURL=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]).find(s=>s.includes('ufos.astro'));
const script=readFileSync(new URL('../dist'+scriptURL,import.meta.url),'utf8');
function load(query='') {
  const dom=new JSDOM(html,{url:'https://drewcleaver.com/ufos/'+query,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;w.HTMLElement.prototype.scrollIntoView=function(){};
  w.localStorage.setItem('analytics-consent','granted');w.localStorage.setItem('analytics-choice','accepted');
  w.eval(script);return {dom,w,doc:w.document,data:JSON.parse(w.document.querySelector('#ufos-data').textContent)};
}
function change(w,name,value){const el=w.document.querySelector(`[name="${name}"]`);el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));}
const visible=doc=>[...doc.querySelectorAll('.ufo-event')].filter(n=>!n.hidden && !n.closest('[hidden]')).map(n=>n.id);
test('built interface combines filters, resets, reverses and restores URL state',()=>{
 const {dom,w,doc,data}=load('?view=core');
 assert.deepEqual(visible(doc).sort(),filterEvents(data,{view:'core'}).map(e=>e.id).sort());
 change(w,'era','archives');change(w,'entity','david-fravor');
 assert.deepEqual(visible(doc),['nimitz-encounter']);
 const saved=w.location.search;assert.ok(saved.includes('entity=david-fravor'));
 change(w,'q','zz-no-such-event');assert.equal(visible(doc).length,0);assert.equal(doc.querySelector('#empty-state').hidden,false);
 doc.querySelector('#empty-reset').click();assert.deepEqual(visible(doc),filterEvents(data,initialState).map(e=>e.id));
 change(w,'sort','newest');assert.deepEqual(visible(doc),filterEvents(data,{sort:'newest'}).map(e=>e.id));
 change(w,'view','recent');assert.equal(doc.querySelector('[name="sort"]').disabled,true);assert.deepEqual(visible(doc),filterEvents(data,{view:'recent'}).map(e=>e.id));
 w.history.replaceState(null,'','/ufos/'+saved);w.dispatchEvent(new w.PopStateEvent('popstate'));assert.deepEqual(visible(doc),['nimitz-encounter']);
 assert.equal(w.gtag,undefined);assert.equal(w.dataLayer,undefined);dom.window.close();
});
test('deep-linked filtered entries can be revealed and source/correction links remain intact',()=>{
 const {dom,w,doc,data}=load('?view=story&q=NASA#nimitz-encounter');
 assert.equal(doc.querySelector('#reveal-linked').hidden,false);
 doc.querySelector('#reveal-linked').click();
 const card=doc.getElementById('nimitz-encounter');assert.ok(visible(doc).includes(card.id));assert.equal(card.querySelector('.event-detail').open,true);assert.equal(doc.activeElement,card);
 assert.ok(card.querySelector('.source-list').textContent.includes('radar'));
 assert.ok(card.querySelector('.correction-record').textContent.includes('Previous summary'));
 for(const link of doc.querySelectorAll('a[href^="#"]')) assert.ok(doc.getElementById(decodeURIComponent(link.getAttribute('href').slice(1))),link.getAttribute('href'));
 assert.equal(new Set([...doc.querySelectorAll('.ufo-event')].map(n=>n.id)).size,data.events.length);
 assert.equal(doc.querySelector('meta[name="robots"]').content,'noindex, nofollow');dom.window.close();
});
test('range-aware year shortcut reaches post-cutoff records and exports complete model',()=>{
 const {dom,w,doc,data}=load('?view=history');const el=doc.querySelector('#year-shortcut');el.value='2026';el.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.ok(visible(doc).includes('aaro-workshop-records-published-2026'));assert.equal(doc.querySelector('[name="to"]').value,'2026-12-31');
 assert.equal(data.contentModelVersion,4);assert.ok(data.sourceReviews);assert.ok(data.meta.checkReceipts);assert.equal(doc.querySelector('#download-data').hidden,false);
 for(const control of doc.querySelectorAll('#timeline-filters input:not([hidden]),#timeline-filters select'))assert.ok(control.closest('label'));
 dom.window.close();
});
test('main all-era path, people route and supporting anchors remain reachable',()=>{
 const {dom,w,doc,data}=load();
 assert.deepEqual(visible(doc),filterEvents(data,initialState).map(e=>e.id));
 assert.equal(visible(doc)[0],'jebel-irhoud');
 assert.ok(!visible(doc).includes('ra-book-2-sessions'));
 assert.ok(doc.getElementById('jebel-irhoud').textContent.includes('anchors ordering only'));
 assert.ok(!doc.getElementById('epicurus-worlds').querySelector('.event-date').textContent.includes('Year precision'));
 change(w,'entity','alfred-russel-wallace');assert.deepEqual(visible(doc),['darwin-wallace-1858']);
 w.history.replaceState(null,'','/ufos/#entity-alfred-russel-wallace');w.dispatchEvent(new w.HashChangeEvent('hashchange'));
 const person=doc.getElementById('entity-alfred-russel-wallace');assert.equal(doc.activeElement,person);assert.ok(person.closest('details').open);
 w.history.replaceState(null,'','/ufos/?view=history&entity=Alfred%20Russel%20Wallace');w.dispatchEvent(new w.PopStateEvent('popstate'));assert.deepEqual(visible(doc),['darwin-wallace-1858']);
 w.history.replaceState(null,'','/ufos/#ra-book-2-sessions');w.dispatchEvent(new w.HashChangeEvent('hashchange'));
 assert.equal(doc.querySelector('[name="view"]').value,'history');
 assert.ok(visible(doc).includes('ra-book-2-sessions'));assert.ok(doc.getElementById('ra-book-2-sessions').textContent.includes('Supporting record for'));
 assert.equal(new Set([...doc.querySelectorAll('[id]')].map(n=>n.id)).size,doc.querySelectorAll('[id]').length);
 dom.window.close();
});
test('selected correction scopes, documentary dates and one video are visible',()=>{
 const {dom,doc,data}=load('?view=history');
 assert.match(doc.getElementById('phoenix-lights-1997').textContent,/Original 2005 premiere/);
 assert.match(doc.getElementById('phoenix-lights-1997').textContent,/Film, audiovisual evidence and transcript not inspected/);
 assert.match(doc.getElementById('crispr-2012').querySelector('.scoped-check').textContent,/not independently verified/);
 assert.equal(data.events.filter(e=>e.selectedVideo).length,1);
 assert.match(doc.getElementById('lazar-klas-interview').textContent,/2019/);
 dom.window.close();
});
