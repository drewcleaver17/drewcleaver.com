import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {buildSync} from 'esbuild';
import {runInNewContext} from 'node:vm';
import {filterEvents,initialState} from '../src/lib/ufos.mjs';
const html=readFileSync(new URL('../dist/nhi/index.html',import.meta.url),'utf8');
const entry=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]).find(s=>s.includes('nhi.astro'));
const script=buildSync({entryPoints:[new URL('../dist'+entry,import.meta.url).pathname],bundle:true,format:'iife',write:false}).outputFiles[0].text;
const dom=new JSDOM(html,{url:'https://drewcleaver.com/nhi/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;w.HTMLElement.prototype.scrollIntoView=function(){w.lastScrolled=this.id;};w.scrollBy=(x,y)=>w.lastDelta=y;
w.eval(script);const data=JSON.parse(d.querySelector('#ufos-data').textContent);
after(()=>w.close());
const navigate=query=>{w.history.replaceState(null,'','/nhi/'+query);w.dispatchEvent(new w.PopStateEvent('popstate'));};
const choose=(key,value)=>{const radio=[...d.querySelectorAll(`[data-choice-for="${key}"]`)].find(n=>n.value===value);assert.ok(radio);radio.checked=true;radio.focus();radio.dispatchEvent(new w.Event('change',{bubbles:true}));return radio;};
const visible=()=>[...d.querySelectorAll('.ufo-event')].filter(n=>!n.hidden && !n.closest('[hidden]')).map(n=>n.id);

test('every timeline, People and institutional option is exposed with a native choice and matching labels',()=>{
 for(const form of d.querySelectorAll('[data-choices-ready]'))for(const select of form.querySelectorAll('select')) {
   const radios=[...form.querySelectorAll('[data-choice-for]')].filter(n=>n.dataset.choiceFor===(select.name || select.id));
   assert.deepEqual(radios.map(n=>n.value),[...select.options].map(n=>n.value));
   assert.ok(select.closest('label').hidden);assert.ok(!radios[0].closest('details'));
   assert.ok(radios.every(n=>n.closest('label').textContent.trim()));
 }
 assert.equal(d.querySelector('#timeline-filters .filter-details'),null);
 assert.equal(d.querySelector('.filter-options').lastElementChild.id,'choices-year-shortcut');
 assert.equal(d.querySelectorAll('.catalog-shortcuts a').length,2);
 assert.ok(d.getElementById('choices-category').compareDocumentPosition(d.getElementById('choices-entity')) & w.Node.DOCUMENT_POSITION_FOLLOWING);
 assert.ok(d.querySelector('[name="context"]').closest('label'));
});

test('visible choices narrow results, retain focus, serialize once and synchronize on back/forward',()=>{
 navigate('?view=history');const before=w.history.length;
 const radio=choose('region','maya-world');assert.equal(w.history.length,before+1);assert.equal(d.activeElement,radio);
 assert.deepEqual(visible(),filterEvents(data,{view:'history',region:'maya-world'}).map(n=>n.id));
 choose('topic','Ancient societies & archaeology');
 assert.deepEqual(visible(),filterEvents(data,{view:'history',region:'maya-world',topic:'Ancient societies & archaeology'}).map(n=>n.id));
 navigate('?view=history&region=egypt');assert.equal(d.querySelector('[data-choice-for="region"]:checked').value,'egypt');
 navigate('?view=history&region=unknown&sort=wrong');assert.equal(d.querySelector('[data-choice-for="region"]:checked').value,'');assert.equal(d.querySelector('[data-choice-for="sort"]:checked').value,'oldest');
});

test('persistent search, exact counts, empty recovery, and distinct search clear preserve intentional state',async()=>{
 navigate('?view=history&region=maya-world');const input=d.getElementById('persistent-search');
 input.value='zzzz-no-match';input.dispatchEvent(new w.Event('input',{bubbles:true}));await new Promise(resolve=>setTimeout(resolve,190));
 assert.equal(visible().length,0);assert.equal(d.getElementById('empty-state').hidden,false);assert.equal(d.getElementById('persistent-count').textContent,'0 entries');
 assert.match(d.getElementById('persistent-state').textContent,/Maya world/);
 d.getElementById('clear-search').click();assert.equal(input.value,'');assert.equal(new URLSearchParams(w.location.search).get('region'),'maya-world');assert.ok(visible().length>0);assert.ok(!d.getElementById('link-status').textContent.includes('No entries match'));
 d.getElementById('persistent-reset').click();assert.deepEqual(visible(),filterEvents(data,initialState).map(n=>n.id));assert.equal(w.location.search,'');
});

test('refinement preserves a visible event offset, its disclosure state and control focus; geometry is simulated',()=>{
 navigate('?view=history');const card=d.getElementById('nimitz-encounter');card.querySelector('details').open=true;
 let y=120;card.getBoundingClientRect=()=>({top:y,bottom:y+300,height:300});
 const input=d.querySelector('[name="q"]');input.value='Nimitz';input.focus();y=170;
 // The reference is captured before render; hiding preceding cards simulates an upward shift.
 const descriptor=Object.getOwnPropertyDescriptor(w.HTMLElement.prototype,'hidden');
 Object.defineProperty(card,'getBoundingClientRect',{value:()=>({top:y,bottom:y+300,height:300}),configurable:true});
 const other=d.getElementById('gutenberg-printing');Object.defineProperty(other,'hidden',{get(){return descriptor.get.call(this);},set(value){descriptor.set.call(this,value);if(value)y=80;},configurable:true});
 input.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(d.activeElement,input);assert.equal(card.querySelector('details').open,true);assert.equal(w.lastDelta,-90);
 delete other.hidden;delete card.getBoundingClientRect;
});

test('adjust-filters remembers an entry and provides an explicit return; excluded targets use chronological neighbors',()=>{
 navigate('?view=history');const card=d.getElementById('nimitz-encounter');card.getBoundingClientRect=()=>({top:120,bottom:420,height:300});
 d.getElementById('adjust-filters').click();assert.equal(d.getElementById('return-reading').hidden,false);delete card.getBoundingClientRect;
 w.history.replaceState(null,'','/nhi/?view=history#timeline-filters');
 choose('region','egypt');d.getElementById('return-reading').click();assert.ok(visible().includes(w.lastScrolled));assert.equal(d.activeElement.id,w.lastScrolled);
});

test('green appearance synchronizes both controls, persists, restores before paint, and tolerates blocked storage',()=>{
 d.querySelector('[data-nhi-theme="dark"]').click();assert.equal(d.documentElement.dataset.nhiTheme,'dark');assert.equal(w.localStorage.getItem('nhi.reading.appearance'),'dark');
 assert.ok([...d.querySelectorAll('button[data-nhi-theme="dark"]')].every(n=>n.getAttribute('aria-pressed')==='true'));
 const early=[...d.querySelectorAll('head script:not([src])')].find(n=>n.textContent.includes('nhi.reading.appearance')).textContent;
 const doc={documentElement:{dataset:{}}};runInNewContext(early,{document:doc,localStorage:{getItem:()=> 'dark'}});assert.equal(doc.documentElement.dataset.nhiTheme,'dark');
 assert.doesNotThrow(()=>runInNewContext(early,{document:doc,localStorage:{getItem:()=>{throw Error('blocked');}}}));
 d.querySelector('button[data-nhi-theme="light"]').click();assert.equal(d.documentElement.dataset.nhiTheme,'light');
 const saved=new JSDOM('<html data-nhi data-nhi-theme="dark"><body><button data-nhi-theme="light">Light</button><button data-nhi-theme="dark">Dark green</button></body></html>',{url:'https://drewcleaver.com/nhi/',runScripts:'outside-only'});saved.window.eval(script);saved.window.document.querySelector('button[data-nhi-theme="light"]').click();assert.equal(saved.window.document.documentElement.dataset.nhiTheme,'light');saved.window.close();
});

test('source trails, original event anchors, chapter sharing, starter path and honest scope survive without filtering',()=>{
 assert.equal(d.querySelectorAll('.ufo-event').length,data.events.length);assert.equal(d.querySelectorAll('.chapter-link').length,10);assert.equal(d.querySelectorAll('.starter-path li').length,4);
 for(const a of d.querySelectorAll('.starter-path a,.chapter-link'))assert.ok(d.getElementById(a.hash.slice(1)));
 assert.match(d.querySelector('.index-method-note').textContent,/not independent corroboration/);
 assert.ok(d.querySelector('noscript'));assert.match(d.title,/New History Index/);
 assert.ok(data.events.every(n=>d.getElementById(n.id)?.querySelector('.source-list a')));
});

const luminance=hex=>{const channels=hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return channels.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
test('palette pairs meet measured text/control thresholds and responsive/print branches remain explicit',()=>{
 for(const bg of ['082b24','103b31','17473a','0c3229'])for(const fg of ['f3efe5','c3d3c7'])assert.ok(contrast(bg,fg)>=4.5,`${bg}/${fg}`);
 for(const bg of ['f7f5ee','e9ede2','f0f1e9','fffdf7']){assert.ok(contrast(bg,'203d34')>=4.5);assert.ok(contrast(bg,'536357')>=4.5);assert.ok(contrast(bg,'71846d')>=3);}
 assert.ok(contrast('082b24','c7d8a9')>=4.5);assert.ok(contrast('103b31','7c9e88')>=3);
 const css=readFileSync(new URL('../src/styles/nhi-reading.css',import.meta.url),'utf8');
 assert.match(css,/min-width:1100px.*min-height:760px/);assert.match(css,/max-height:500px/);assert.match(css,/@media print/);assert.ok(!css.includes('filter:invert'));
});

test('filtered sharing has clipboard success/fallback, and printing restores disclosure state',async()=>{
 navigate('?view=history&region=egypt');let copied;
 Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async value=>{copied=value;}},configurable:true});
 d.querySelector('[data-copy-view]').click();await new Promise(resolve=>setTimeout(resolve,0));assert.equal(copied,'https://drewcleaver.com/nhi/?view=history&region=egypt#timeline');
 Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async()=>{throw Error('unavailable');}},configurable:true});d.querySelector('[data-copy-view]').click();await new Promise(resolve=>setTimeout(resolve,0));assert.match(d.getElementById('link-status').textContent,/Copy the browser address/);
 const detail=d.getElementById('khufu-giza-engineering').querySelector('.event-detail');detail.open=false;w.dispatchEvent(new w.Event('beforeprint'));assert.ok(detail.open);w.dispatchEvent(new w.Event('afterprint'));assert.equal(detail.open,false);
});
