import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { initFkl, readCampaign } from '../src/scripts/fkl-client.mjs';
import { regions } from '../src/data/fkl.mjs';
const html = readFileSync(new URL('../dist/fkl/index.html', import.meta.url), 'utf8');
function setup(search = '', development = false) {
  const dom = new JSDOM(html, { url: 'https://drewcleaver.com/fkl/' + search });
  const doc = dom.window.document; const events = [];
  doc.addEventListener('fkl:funnel', e => events.push(e.detail));
  doc.addEventListener('click', e => { if (e.target.closest('a')) e.preventDefault(); });
  dom.window.fetch = () => { throw new Error('Network must never be called'); };
  dom.window.XMLHttpRequest = class { constructor() { throw new Error('No XHR'); } };
  dom.window.navigator.sendBeacon = () => { throw new Error('No beacon'); };
  initFkl(doc, { development }); return { dom, doc, events };
}
const change = (dom, el, value) => { el.value = value; el.dispatchEvent(new dom.window.Event('change', { bubbles: true })); };
test('campaign context rejects injected, duplicate-encoded, oversized and personal-data-shaped values', () => {
  assert.deepEqual(readCampaign('?utm_source=sms&utm_campaign=first-session&utm_content=parent_A&utm_medium=text'), { utm_source:'sms', utm_medium:'text', utm_campaign:'first-session', utm_content:'parent_A' });
  for (const value of ['<script>', 'person@example.com', 'a'.repeat(81), '%3Cscript%3E', 'hello world', 'x\n']) assert.deepEqual(readCampaign('?utm_source=' + encodeURIComponent(value)), {});
  assert.deepEqual(readCampaign('?email=private@example.com&arbitrary=x'), {});
});
test('primary CTAs navigate locally and emit only allowlisted placements', () => {
  const { dom, doc, events } = setup();
  for (const a of doc.querySelectorAll('[data-primary]')) { assert.equal(a.getAttribute('href'), '#find-session'); a.dispatchEvent(new dom.window.MouseEvent('click', { bubbles:true, cancelable:true })); }
  assert.deepEqual(events.map(e => e.properties.placement), ['hero','closing']);
});
test('every region has a safe official handoff; unavailable selection recovers', () => {
  const { dom, doc, events } = setup();
  const selector = doc.querySelector('#fkl-region');
  for (const region of regions) {
    change(dom, selector, region.id);
    const a = doc.querySelector('#finder-result a');
    assert.equal(a.href, 'https://fat-kartingleague.com/hubs' + (region.id === 'other' ? '' : '/' + region.id));
    a.dispatchEvent(new dom.window.MouseEvent('click', { bubbles:true, cancelable:true }));
    assert.deepEqual(events.at(-1), { name:'official_booking_handoff', properties:{region:region.id} });
  }
  change(dom, selector, ''); assert(!doc.querySelector('#finder-result a'));
  change(dom, doc.querySelector('#finder-age'), 'Outside 5–17 / not sure'); assert.match(doc.querySelector('#age-guidance').textContent, /does not confirm eligibility/);
});
test('invalid inquiry focuses the first error and never demonstrates completion', () => {
  const { dom, doc, events } = setup(); const form = doc.querySelector('form');
  doc.querySelector('#parent-name').value = '  ';
  doc.querySelector('#parent-email').value = 'invalid';
  const event = new dom.window.Event('submit', { bubbles:true, cancelable:true }); form.dispatchEvent(event);
  assert(event.defaultPrevented); assert.equal(doc.activeElement.id, 'parent-name');
  assert.equal(doc.querySelectorAll('[aria-invalid="true"]').length,4);
  assert.equal(events.length,0);
});
test('completion clears personal fields, announces simulation, and keeps all PII out of events and storage', () => {
  const { dom, doc, events } = setup('?utm_source=sms', true);
  const values = { 'parent-name':'Sample Parent', 'parent-email':'sample@example.com', 'parent-phone':'555-0100', 'parent-location':'12345', 'parent-age':'8–11', 'parent-experience':'First time in a kart' };
  for (const [id,value] of Object.entries(values)) change(dom,doc.getElementById(id),value);
  doc.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles:true,cancelable:true }));
  assert.deepEqual(events.map(e=>e.name), ['inquiry_form_start','demo_inquiry_completion']);
  assert.deepEqual(events.map(e=>e.properties), [{},{}]);
  assert(!JSON.stringify(events).includes('sample@example.com'));
  for (const id of Object.keys(values)) assert.equal(doc.getElementById(id).value,'');
  assert.match(doc.querySelector('#form-status').textContent,/not delivered/);
  assert.equal(doc.activeElement.id,'form-status');
  assert.equal(dom.window.localStorage.length,0); assert.equal(dom.window.sessionStorage.length,0); assert.equal(doc.cookie,'');
  assert.equal(doc.querySelector('#fkl-event-inspector').dataset.campaign,'{"utm_source":"sms"}');
  assert(!doc.querySelector('#fkl-event-inspector').textContent.includes('Sample Parent'));
});
test('page exit clears sample details; production has no inspector; native FAQ structure works', () => {
  const { dom, doc } = setup(); doc.querySelector('#parent-email').value='sample@example.com';
  dom.window.dispatchEvent(new dom.window.Event('pagehide'));
  assert.equal(doc.querySelector('#parent-email').value,''); assert(!doc.querySelector('#fkl-event-inspector'));
  assert.equal(doc.querySelectorAll('.faq details').length,7);
  for (const d of doc.querySelectorAll('.faq details')) { assert(d.querySelector('summary')); d.open=true; assert(d.open); }
});
test('output protects no-script submission, metadata, links, assets and discovery', () => {
  const doc = new JSDOM(html).window.document;
  assert(doc.querySelector('#demo-fields').disabled);
  assert.equal(doc.querySelector('meta[name="robots"]').content,'noindex, nofollow');
  assert.equal(doc.querySelectorAll('h1').length,1);
  assert.match(doc.title,/Pilot Demo/); assert.match(doc.querySelector('meta[property="og:description"]').content,/Not an official/);
  assert(!doc.querySelector('form').hasAttribute('action'));
  assert.equal(doc.querySelectorAll('[name]:is(input,select,textarea)').length,0);
  assert.equal(doc.querySelectorAll('iframe').length,0);
  assert.equal(new Set([...doc.querySelectorAll('[id]')].map(e=>e.id)).size,doc.querySelectorAll('[id]').length);
  for (const el of doc.querySelectorAll('input,select')) assert(doc.querySelector(`label[for="${el.id}"]`));
  for (const a of doc.querySelectorAll('a[href^="#"]')) assert(doc.querySelector(a.getAttribute('href')));
  for (const img of doc.querySelectorAll('img')) assert(img.getAttribute('width') && img.getAttribute('height') && img.alt);
  assert(!readFileSync(new URL('../dist/sitemap.xml',import.meta.url),'utf8').includes('/fkl'));
  const visit = dir => readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?visit(new URL(e.name+'/',dir)):[new URL(e.name,dir)]);
  for (const file of visit(new URL('../dist/',import.meta.url)).filter(f=>f.pathname.endsWith('.html')&&!f.pathname.endsWith('/fkl/index.html'))) assert(!/href=["'][^"']*\/fkl(?:[\/?#"'])/.test(readFileSync(file,'utf8')),file.pathname);
  const client = readFileSync(new URL('../src/scripts/fkl-client.mjs',import.meta.url),'utf8');
  assert(!/fetch\(|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|console\.|FormData/.test(client));
  for (const src of [...doc.querySelectorAll('[src]')].map(e=>e.getAttribute('src')).filter(s=>s.startsWith('/'))) assert(readFileSync(new URL('../dist'+src,import.meta.url)).length>0);
});
