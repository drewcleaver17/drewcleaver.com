import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {buildSync} from 'esbuild';
import {filterEvents,initialState} from '../src/lib/ufos.mjs';
import {filterInstitutions} from '../src/lib/ufo-institutions.mjs';
const html=readFileSync(new URL('../dist/nhi/index.html',import.meta.url),'utf8');
const scriptURL=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]).find(s=>s.includes('nhi.astro'));
const script=buildSync({entryPoints:[new URL('../dist'+scriptURL,import.meta.url).pathname],bundle:true,format:'iife',write:false}).outputFiles[0].text;
// Exercise one built page through successive navigations, as a browser does.
// Re-parsing this large archival document for every navigation wastes memory.
let fixture;
after(()=>fixture?.dom.window.close());
function load(query='') {
  if(fixture){
    const {w}=fixture;
    w.history.replaceState(null,'','/nhi/'+query);
    w.dispatchEvent(new w.PopStateEvent('popstate'));
    return fixture;
  }
  const dom=new JSDOM(html,{url:'https://drewcleaver.com/nhi/'+query,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;w.HTMLElement.prototype.scrollIntoView=function(){};
  w.localStorage.setItem('analytics-consent','granted');w.localStorage.setItem('analytics-choice','accepted');
  w.eval(script);fixture={dom,w,doc:w.document,data:JSON.parse(w.document.querySelector('#ufos-data').textContent)};return fixture;
}
function change(w,name,value){const el=w.document.querySelector(`[name="${name}"]`);el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));}
const visible=doc=>[...doc.querySelectorAll('.ufo-event')].filter(n=>!n.hidden && !n.closest('[hidden]')).map(n=>n.id);
test('regional filter combines with search, restores URL state, exposes an empty result and clears with keyboard focus',()=>{
 const {w,doc,data}=load('?view=history&region=maya-world');
 assert.deepEqual(visible(doc),filterEvents(data,{view:'history',region:'maya-world'}).map(e=>e.id));
 assert.ok(doc.querySelector('[name="region"]').closest('label'));
 change(w,'q','Pakal');
 assert.deepEqual(visible(doc),filterEvents(data,{view:'history',region:'maya-world',q:'Pakal'}).map(e=>e.id));
 const saved=w.location.search;
 change(w,'region','egypt');assert.equal(visible(doc).length,0);assert.equal(doc.querySelector('#empty-state').hidden,false);
 w.history.replaceState(null,'','/nhi/'+saved);w.dispatchEvent(new w.PopStateEvent('popstate'));
 assert.equal(doc.querySelector('[name="region"]').value,'maya-world');
 const chip=[...doc.querySelectorAll('.filter-chip')].find(b=>b.textContent.includes('Regional collection'));
 assert.match(chip.textContent,/Maya world/);chip.click();assert.equal(doc.activeElement,doc.querySelector('[name="region"]'));
 doc.querySelector('#timeline-filters button[type="reset"]').click();assert.deepEqual(visible(doc),filterEvents(data,initialState).map(e=>e.id));
 assert.equal(doc.querySelector('[name="region"]').value,'');
 assert.ok(doc.querySelector('#regional-guide a[href*="region=brazil-amazon"]'));
 assert.match(doc.getElementById('casarabe-bolivia-lidar-2022').textContent,/Bolivia/);
});
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
 w.history.replaceState(null,'','/nhi/'+saved);w.dispatchEvent(new w.PopStateEvent('popstate'));assert.deepEqual(visible(doc),['nimitz-encounter']);
 assert.equal(w.gtag,undefined);assert.equal(w.dataLayer,undefined);
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
 assert.ok(!doc.querySelector('meta[name="robots"]')?.content.includes('noindex'));
});
test('range-aware year shortcut reaches post-cutoff records and exports complete model',()=>{
 const {dom,w,doc,data}=load('?view=history');const el=doc.querySelector('#year-shortcut');el.value='2026';el.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.ok(visible(doc).includes('aaro-workshop-records-published-2026'));assert.equal(doc.querySelector('[name="to"]').value,'2026-12-31');
 assert.equal(data.contentModelVersion,6);assert.ok(data.sourceReviews);assert.ok(data.meta.checkReceipts);assert.equal(doc.querySelector('#download-data').hidden,false);
 for(const control of doc.querySelectorAll('#timeline-filters input:not([hidden]),#timeline-filters select'))assert.ok(control.closest('label'));

});
test('main all-era path, people route and supporting anchors remain reachable',()=>{
 const {dom,w,doc,data}=load();
 assert.deepEqual(visible(doc),filterEvents(data,initialState).map(e=>e.id));
 assert.equal(visible(doc)[0],'jebel-irhoud');
 assert.ok(!visible(doc).includes('ra-book-2-sessions'));
 assert.ok(doc.getElementById('jebel-irhoud').textContent.includes('anchors ordering only'));
 assert.ok(!doc.getElementById('epicurus-worlds').querySelector('.event-date').textContent.includes('Year precision'));
 change(w,'entity','alfred-russel-wallace');assert.deepEqual(visible(doc),['darwin-wallace-1858']);
 w.history.replaceState(null,'','/nhi/#entity-alfred-russel-wallace');w.dispatchEvent(new w.HashChangeEvent('hashchange'));
 const person=doc.getElementById('entity-alfred-russel-wallace');assert.equal(doc.activeElement,person);assert.ok(person.querySelector('a[href="/nhi/people/alfred-russel-wallace/"]'));
 w.history.replaceState(null,'','/nhi/?view=history&entity=Alfred%20Russel%20Wallace');w.dispatchEvent(new w.PopStateEvent('popstate'));assert.deepEqual(visible(doc),['darwin-wallace-1858']);
 w.history.replaceState(null,'','/nhi/#ra-book-2-sessions');w.dispatchEvent(new w.HashChangeEvent('hashchange'));
 assert.equal(doc.querySelector('[name="view"]').value,'history');
 assert.ok(visible(doc).includes('ra-book-2-sessions'));assert.ok(doc.getElementById('ra-book-2-sessions').textContent.includes('Supporting record for'));
 assert.equal(new Set([...doc.querySelectorAll('[id]')].map(n=>n.id)).size,doc.querySelectorAll('[id]').length);

});
test('selected correction scopes, documentary dates and one video are visible',()=>{
 const {dom,doc,data}=load('?view=history');
 assert.match(doc.getElementById('phoenix-lights-1997').textContent,/Original 2005 premiere/);
 assert.match(doc.getElementById('phoenix-lights-1997').textContent,/Film, audiovisual evidence and transcript not inspected/);
 assert.match(doc.getElementById('crispr-2012').querySelector('.scoped-check').textContent,/not independently verified/);
 assert.equal(data.events.filter(e=>e.selectedVideo).length,1);
 assert.match(doc.getElementById('lazar-klas-interview').textContent,/2019/);

});
test('people return navigation reveals the event without colliding with the date filter',()=>{
 const {w,doc}=load('?view=history&via=people#nimitz-encounter');
 w.sessionStorage.setItem('ufos.people.return','/ufos/people/?q=Fravor&person=david-fravor#entity-david-fravor');
 w.sessionStorage.setItem('ufos.people.name','David Fravor');
 w.dispatchEvent(new w.PopStateEvent('popstate'));
 assert.ok(visible(doc).includes('nimitz-encounter'));assert.equal(doc.querySelector('[name="from"]').value,'');
 assert.equal(doc.querySelector('#nimitz-encounter .event-detail').open,true);
 assert.equal(doc.querySelector('#people-return').hidden,false);assert.ok(doc.querySelector('#people-return a').href.includes('q=Fravor'));
 change(w,'from','2004-01-01');assert.equal(new URLSearchParams(w.location.search).get('via'),'people');assert.equal(new URLSearchParams(w.location.search).get('from'),'2004-01-01');
 const entry=doc.querySelector('[data-people-entry]');entry.addEventListener('click',e=>e.preventDefault(),{once:true});entry.click();
 assert.ok(w.sessionStorage.getItem('ufos.timeline.return').includes('from=2004-01-01'));
});
const visibleInstitutions=doc=>[...doc.querySelectorAll('[data-institution]')].filter(n=>!n.hidden).map(n=>n.dataset.institution);
test('institutional chronology combines dates and search without losing directory URL state',()=>{
 const {dom,w,doc,data}=load('?view=institutions&iq=NURO');
 assert.deepEqual(visible(doc),filterEvents(data,{view:'institutions'}).map(e=>e.id));
 assert.deepEqual(visibleInstitutions(doc),filterInstitutions(data.entities,{iq:'NURO'}).map(n=>n.id));
 change(w,'sort','newest');assert.ok(w.location.search.includes('iq=NURO'));
 assert.deepEqual(visible(doc),filterEvents(data,{view:'institutions',sort:'newest'}).map(e=>e.id));
 change(w,'idomain','naval');change(w,'iuap','context-only');
 assert.deepEqual(visibleInstitutions(doc),filterInstitutions(data.entities,{iq:'NURO',idomain:'naval',iuap:'context-only'}).map(n=>n.id));
 const saved=w.location.search;
 change(w,'iq','zz-no-such-institution');assert.equal(visibleInstitutions(doc).length,0);assert.equal(doc.querySelector('#institution-empty').hidden,false);
 doc.querySelector('#institution-filters button[type="reset"]').click();assert.equal(visibleInstitutions(doc).length,filterInstitutions(data.entities).length);assert.ok(w.location.search.includes('view=institutions'));
 w.history.replaceState(null,'','/nhi/'+saved);w.dispatchEvent(new w.PopStateEvent('popstate'));
 assert.equal(doc.querySelector('[name="iq"]').value,'NURO');assert.equal(doc.querySelector('[name="idomain"]').value,'naval');
 doc.querySelector('#institution-filters button[type="reset"]').click();
 change(w,'idesignation','FFRDC');change(w,'itype','Research center');
 assert.deepEqual(visibleInstitutions(doc),filterInstitutions(data.entities,{idesignation:'FFRDC',itype:'Research center'}).map(n=>n.id));
 assert.ok(visibleInstitutions(doc).length>0);assert.ok(!visibleInstitutions(doc).includes('mitre'));
 change(w,'sort','oldest');assert.ok(w.location.search.includes('idesignation=FFRDC'));
 doc.querySelector('.institution-heading [data-view="institutions"]').click();
 assert.equal(w.location.hash,'#timeline');assert.equal(doc.activeElement,doc.querySelector('[name="q"]'));
 assert.ok(w.location.search.includes('idesignation=FFRDC'));
 for(const el of doc.querySelectorAll('#institution-filters input,#institution-filters select'))assert.ok(el.closest('label'));

});
test('filtered dossier links reveal a canonical accessible detail and retain source scope',()=>{
 const {dom,w,doc}=load('?iq=zz-no-match#entity-nro');
 assert.equal(doc.querySelector('#reveal-institution').hidden,false);
 doc.querySelector('#reveal-institution').click();
 const dossier=doc.getElementById('entity-nro');assert.equal(dossier.hidden,false);assert.equal(dossier.open,true);assert.equal(doc.activeElement,dossier);
 assert.ok(dossier.querySelector('.institution-sources a[href^="https:"]'));
 assert.match(dossier.querySelector('.institution-evidence').textContent,/UAP|Institutional context/);
 assert.ok(dossier.querySelector('a[href="#nro-agreement"]'));
 assert.equal(doc.querySelectorAll('#entity-nro').length,1);
 w.history.replaceState(null,'','/nhi/#nro-agreement');w.dispatchEvent(new w.HashChangeEvent('hashchange'));
 assert.equal(doc.getElementById('nro-agreement').querySelector('.event-detail').open,true);
 assert.ok(visible(doc).includes('nro-agreement'));
});
test('download contains the complete reviewed model and no analytics runs with saved consent',async()=>{
 const {dom,w,doc,data}=load('?view=institutions');let exported,downloadName;
 w.Blob=class {constructor(parts){exported=parts.join('');}};
 w.URL.createObjectURL=()=> 'blob:review';w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){downloadName=this.download;};
 w.fetch=async()=>({ok:true,text:async()=>readFileSync(new URL('../dist/nhi/data/index.html',import.meta.url),'utf8')});
 doc.querySelector('#download-data').click();await new Promise(resolve=>setTimeout(resolve,20));assert.deepEqual(JSON.parse(exported),JSON.parse(readFileSync(new URL('../src/data/ufos/timeline.json',import.meta.url),'utf8')));assert.match(downloadName,/nhi-index-.*\.json/);
 assert.ok(data.entities.some(n=>n.institutionalProfile));assert.equal(w.gtag,undefined);assert.equal(w.dataLayer,undefined);
 assert.equal(doc.querySelector('script[src*="googletagmanager"],script[src*="google-analytics"]'),null);

});

test('copied event links use the canonical NHI path',async()=>{
 const {w,doc}=load();let copied;
 Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async value=>{copied=value;}},configurable:true});
 doc.querySelector('[data-copy="nimitz-encounter"]').click();await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(copied,'https://drewcleaver.com/nhi/#nimitz-encounter');
});
