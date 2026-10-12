// Production markup and shipped JavaScript in JSDOM: this is not browser geometry.
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {buildSync} from 'esbuild';
import {filterEvents,facetCounts} from '../src/lib/ufos.mjs';
const html=readFileSync(new URL('../dist/nhi/index.html',import.meta.url),'utf8');
const entry=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]).find(s=>s.includes('nhi.astro'));
const script=buildSync({entryPoints:[new URL('../dist'+entry,import.meta.url).pathname],bundle:true,format:'iife',write:false}).outputFiles[0].text;
const dom=new JSDOM(html,{url:'https://drewcleaver.com/nhi/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;w.HTMLElement.prototype.scrollIntoView=function(){w.lastScrolled=this.id;};w.scrollBy=()=>{};
w.eval(script);const data=JSON.parse(d.getElementById('ufos-data').textContent);
const visible=()=>[...d.querySelectorAll('.ufo-event')].filter(n=>!n.hidden&&!n.closest('[hidden]')).map(n=>n.id);
const navigate=query=>{w.history.replaceState(null,'','/nhi/'+query);w.dispatchEvent(new w.PopStateEvent('popstate'));};
after(()=>w.close());
test('newcomer starts at an honest preview before filters, then reaches the first essential entry',()=>{
 assert.equal(d.querySelector('[name=view]').value,'essentials');assert.equal(visible().length,90);assert.equal(visible()[0],'jebel-irhoud');
 assert.match(d.getElementById('result-count').textContent,/90 of 90 essential entries/);
 assert.ok(d.getElementById('start-here').compareDocumentPosition(d.getElementById('timeline-filters')) & w.Node.DOCUMENT_POSITION_FOLLOWING);
 assert.ok(d.querySelector('[data-start-reading]'));d.querySelector('[data-start-reading]').click();assert.equal(d.activeElement.id,'jebel-irhoud');
 assert.equal(d.querySelector('[name=q]').value,'');assert.equal(d.querySelector('[name=from]').value,'');assert.equal(d.querySelectorAll('[data-choice-for]:checked').length,0);
});
test('a learner narrows essentials by region without replacements; count, contextual choices and URL agree',()=>{
 navigate('?region=maya-world');assert.deepEqual(visible(),filterEvents(data,{view:'essentials',region:['maya-world']}).map(e=>e.id));
 assert.match(d.getElementById('result-count').textContent,/of 90 essential entries/);
 const node=d.querySelector('[data-count-for=topic][data-value="Ancient societies & archaeology"]');assert.equal(Number(node.textContent),facetCounts(data,{view:'essentials',region:['maya-world']},'topic').get(node.dataset.value));
 assert.ok(d.querySelector('[data-group-summary=region]').textContent.includes('Maya world'));
 d.getElementById('adjust-filters').click();assert.equal(d.activeElement,d.querySelector('[name=q]'));
 d.querySelector('.filter-jumps a[href="#choices-region"]').click();assert.equal(d.getElementById('choices-region').closest('details').open,true);
});
test('a subject absent from essentials is found by explicit broadening with filters preserved',()=>{
 navigate('?entity=law-of-one');assert.equal(visible().length,0);assert.equal(d.getElementById('empty-all').hidden,false);
 assert.equal(d.querySelector('[name=view]').value,'essentials');assert.ok(d.getElementById('active-filters').textContent.includes('Law of One'));
 d.getElementById('empty-all').click();assert.equal(d.querySelector('[name=view]').value,'history');assert.equal(new URLSearchParams(w.location.search).get('entity'),'law-of-one');
 assert.ok(visible().includes('ra-book-2-sessions'));assert.equal(d.activeElement.id,'results-summary');
});
test('scope links preserve restrictions; reset preserves scope/order/appearance, and back/refresh restore essential state',()=>{
 navigate('?view=essentials&region=maya-world&sort=newest');
 d.querySelector('.hero-actions [data-view=history]').click();assert.equal(new URLSearchParams(w.location.search).get('region'),'maya-world');assert.equal(d.querySelector('[name=sort]').value,'newest');
 assert.deepEqual(visible(),filterEvents(data,{view:'history',region:['maya-world'],sort:'newest'}).map(e=>e.id));
 navigate('?view=essentials&region=egypt&sort=newest');d.querySelector('[data-nhi-theme=light]').click();d.getElementById('persistent-reset').click();
 assert.equal(d.querySelector('[name=view]').value,'essentials');assert.equal(d.querySelector('[name=sort]').value,'newest');assert.equal(d.documentElement.dataset.nhiTheme,'light');assert.equal(visible().length,90);
 navigate('?region=maya-world');assert.deepEqual(visible(),filterEvents(data,{view:'essentials',region:['maya-world']}).map(e=>e.id));
 navigate('');assert.equal(visible().length,90);d.querySelector('[data-nhi-theme=dark]').click();
});
test('no-JavaScript markup exposes exactly the essential chronology and a usable remaining-history archive',()=>{
 const server=new JSDOM(html),doc=server.window.document;
 const main=[...doc.querySelectorAll('#timeline-results .ufo-event')].map(n=>n.id);assert.deepEqual(main,data.editorial.essentialPath.items.map(i=>i.eventId));
 assert.equal(doc.querySelectorAll('#context-list .ufo-event').length,353);assert.ok(doc.querySelector('noscript a[href="#context-records"]'));
 assert.equal(doc.getElementById('timeline-filters').hidden,true);assert.match(doc.getElementById('assessment-method').textContent,/not mean 90% factual certainty/);
 assert.ok(doc.querySelector('#jebel-irhoud .essential-reason'));assert.ok(doc.querySelector('#independent-agriculture .editorial-assessment').textContent.includes('Why a rare 10'));
 server.window.close();
});
