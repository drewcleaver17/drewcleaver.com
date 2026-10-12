import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {buildSync} from 'esbuild';
const base=new URL('../dist/',import.meta.url);
const data=JSON.parse(readFileSync(new URL('../src/data/ufos/timeline.json',import.meta.url)));
const html=readFileSync(new URL('nhi/people/index.html',base),'utf8');
const scriptPaths=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]);
const script=scriptPaths.map(s=>buildSync({entryPoints:[new URL(s.slice(1),base).pathname],bundle:true,format:'iife',write:false}).outputFiles[0].text).join('\n');
const wait=()=>new Promise(resolve=>setTimeout(resolve,20));
function load(query='',saved={}) {
 const dom=new JSDOM(html,{url:'https://drewcleaver.com/nhi/people/'+query,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=()=>{};
 const requests=[];w.fetch=async url=>{requests.push(url);const path=new URL(url,w.location.href).pathname;return {ok:true,text:async()=>readFileSync(new URL(path.slice(1)+'index.html',base),'utf8')};};
 for(const [key,value] of Object.entries(saved))w.sessionStorage.setItem(key,value);
 w.eval(script);return {dom,w,doc:w.document,requests};
}
const visible=doc=>[...doc.querySelectorAll('[data-person]')].filter(n=>!n.hidden);
const change=(w,name,value)=>{const input=w.document.querySelector(`[name="${name}"]`);if(input.type==='checkbox')input.checked=value;else input.value=value;input.dispatchEvent(new w.Event('change',{bubbles:true}));};
test('directory has one canonical card per person and no profile or event/source payload on initial load',()=>{
 const {dom,doc,requests}=load();
 assert.equal(visible(doc).length,data.entities.filter(n=>n.type==='person').length);
 assert.equal(doc.querySelectorAll('[data-profile]').length,0);assert.equal(doc.querySelector('#ufos-data'),null);assert.equal(requests.length,0);
 assert.equal(doc.querySelector('[data-people-entry]').getAttribute('aria-current'),'page');
 assert.equal(doc.querySelectorAll('h1').length,1);assert.ok(doc.querySelector('#people-filters').hidden===false);
 for(const image of doc.querySelectorAll('img')){assert.equal(image.loading || image.getAttribute('loading'),'lazy');assert.ok(image.getAttribute('width'));assert.ok(image.getAttribute('height'));assert.ok(image.src.includes('/images/ufos/people/'));}
 dom.window.close();
});
test('search, roles, featured, reverse order, empty state and reset operate independently of the timeline',()=>{
 const {dom,w,doc}=load('?q=Einstein');assert.ok(visible(doc).some(n=>n.dataset.person==='einstein'));
 change(w,'role','science');change(w,'featured',true);assert.ok(visible(doc).some(n=>n.dataset.person==='einstein'));
 change(w,'q','xyzzz-nonexistent');assert.equal(visible(doc).length,0);assert.equal(doc.querySelector('#people-empty').hidden,false);
 doc.querySelector('#people-empty-reset').click();assert.equal(visible(doc).length,data.entities.filter(n=>n.type==='person').length);
 const first=visible(doc)[0].dataset.person;change(w,'sort','za');assert.equal(visible(doc).at(-1).dataset.person,first);
 assert.equal(doc.querySelector('#timeline-filters'),null);dom.window.close();
});
test('inline profiles preserve directory filters, create stable URLs and restore on back/forward state',async()=>{
 const {dom,w,doc,requests}=load('?q=Einstein');const link=doc.querySelector('[data-person="einstein"] .person-open');link.click();await wait();
 assert.equal(new URLSearchParams(w.location.search).get('q'),'Einstein');assert.equal(new URLSearchParams(w.location.search).get('person'),'einstein');
 assert.equal(doc.querySelector('[data-profile]').dataset.profile,'einstein');assert.equal(doc.activeElement,doc.querySelector('[data-profile]'));
 assert.equal(link.getAttribute('aria-expanded'),'true');assert.equal(doc.querySelectorAll('h1').length,1);assert.equal(requests.length,1);
 const opened=w.location.pathname+w.location.search+w.location.hash;
 doc.querySelector('#close-person').click();assert.equal(doc.querySelector('#people-profile-panel').hidden,true);assert.equal(doc.activeElement,link);assert.ok(w.location.search.includes('q=Einstein'));
 w.history.replaceState(null,'',opened);w.dispatchEvent(new w.PopStateEvent('popstate'));await wait();assert.equal(doc.querySelector('[data-profile]').dataset.profile,'einstein');assert.equal(requests.length,1);
 const event=doc.querySelector('[data-related-event]');const destination=new URL(event.href);assert.equal(destination.searchParams.get('view'),'history');assert.ok(destination.hash.length>1);
 event.addEventListener('click',e=>e.preventDefault());event.click();assert.equal(new URL(event.href).searchParams.get('via'),'people');assert.equal(new URL(event.href).searchParams.get('from'),null);assert.ok(w.sessionStorage.getItem('ufos.people.return').includes('person=einstein'));
 dom.window.close();
});
test('a failed portrait exposes the designed fallback and retains the accessible name',()=>{
 const {dom,w,doc}=load();const image=doc.querySelector('[data-portrait]');
 assert.ok(image);image.dispatchEvent(new w.Event('error'));assert.equal(image.hidden,true);assert.ok(image.parentElement.classList.contains('portrait-unavailable'));assert.ok(image.closest('.person-open').querySelector('h3').textContent);
 dom.window.close();
});
test('refresh/direct profile and out-of-filter target remain readable; errors have a full-page fallback',async()=>{
 const {dom,doc}=load('?q=xyzz&person=einstein#entity-einstein');await wait();assert.equal(doc.querySelector('[data-profile]').dataset.profile,'einstein');assert.match(doc.querySelector('#people-notice').textContent,/alongside/);dom.window.close();
 const f=load('?q=Einstein');f.w.fetch=async()=>{throw new Error('offline');};f.doc.querySelector('[data-person="einstein"] .person-open').click();await wait();assert.ok(f.doc.querySelector('#person-content a[href="/nhi/people/einstein/"]'));f.dom.window.close();
});
test('every static profile works without JavaScript, has sources and valid local destinations, and is indexable with a canonical URL',()=>{
 for(const n of data.entities.filter(n=>n.type==='person')) {
  const path=new URL(`nhi/people/${n.id}/index.html`,base);assert.ok(existsSync(path));
  const doc=new JSDOM(readFileSync(path,'utf8')).window.document;
  assert.equal(doc.querySelectorAll('[data-profile]').length,1);assert.equal(doc.querySelector('[data-profile]').id,'entity-'+n.id);
  assert.equal(doc.querySelectorAll('h1').length,1);assert.ok(!doc.querySelector('meta[name="robots"]')?.content.includes('noindex'));
  assert.ok(doc.querySelector('.profile-sources a[href^="https:"]'));assert.ok(doc.querySelector('[data-person-timeline]'));
  assert.equal(new Set([...doc.querySelectorAll('[id]')].map(n=>n.id)).size,doc.querySelectorAll('[id]').length);
  for(const a of doc.querySelectorAll('a[href^="/"],img[src^="/"]')) {
   const url=new URL(a.getAttribute('href') || a.getAttribute('src'),'https://drewcleaver.com');
   const local=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
   assert.ok(existsSync(new URL(local.slice(1),base)),n.id+': '+local);
  }
  doc.defaultView.close();
 }
 const timeline=readFileSync(new URL('nhi/index.html',base),'utf8');assert.equal((timeline.match(/<img\b/g)||[]).length,0);
 assert.equal(existsSync(new URL('nhi/data.json',base)),false,'Complete export must use the HTML wrapper, with no unused raw JSON route.');
 assert.ok(readFileSync(new URL('sitemap.xml',base),'utf8').includes('/nhi/'));
 const exportDoc=new JSDOM(readFileSync(new URL('nhi/data/index.html',base),'utf8')).window.document;
 assert.ok(!exportDoc.querySelector('meta[name="robots"]')?.content.includes('noindex'));assert.deepEqual(JSON.parse(exportDoc.querySelector('#ufos-export').textContent),data);exportDoc.defaultView.close();
});

test('saved pre-migration timeline navigation keeps its filters and scroll-resume intent',()=>{
 const {dom,doc}=load('',{'ufos.timeline.return':'/ufos/?view=history&q=NASA&from=2004-01-01#nasa-report'});
 const url=new URL(doc.querySelector('[data-return-timeline]').href);
 assert.equal(url.pathname,'/nhi/');assert.equal(url.searchParams.get('q'),'NASA');assert.equal(url.searchParams.get('from'),'2004-01-01');assert.equal(url.searchParams.get('resume'),'1');assert.equal(url.hash,'#nasa-report');
 dom.window.close();
});
