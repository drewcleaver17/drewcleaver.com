import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { JSDOM } from 'jsdom';
import { canonicalNhiURL } from '../src/lib/nhi-routes.mjs';
const root = new URL('../dist/', import.meta.url);
const data = JSON.parse(readFileSync(new URL('../src/data/ufos/timeline.json', import.meta.url)));
const origin = 'https://drewcleaver.com';
const routes = ['/nhi/', '/nhi/people/', '/nhi/data/', ...data.entities.filter(n=>n.type==='person').map(n=>`/nhi/people/${n.id}/`)];
const read = route => readFileSync(new URL(route.slice(1)+'index.html',root),'utf8');

test('every canonical NHI route is indexable, self-canonical and in the sitemap; every old route has a no-JS destination',()=>{
  const sitemap = readFileSync(new URL('sitemap.xml',root),'utf8');
  assert.ok(!sitemap.includes('/ufos/'));
  for (const route of routes) {
    const html = read(route);
    // Parse only the head here; existing tests inspect all full profile documents.
    const head = new JSDOM(html.slice(0,html.indexOf('</head>')+7)).window.document;
    assert.equal(head.querySelector('link[rel="canonical"]').href,origin+route);
    assert.equal(head.querySelector('meta[property="og:url"]').content,origin+route);
    assert.match(head.title,/NHI.*New History Initiative/);
    assert.ok(!head.querySelector('meta[name="robots"]')?.content.match(/noindex|none/));
    assert.ok(sitemap.includes(`<loc>${origin+route}</loc>`));
    assert.ok(!/<a\b[^>]*href="(?:https:\/\/drewcleaver\.com)?\/ufos(?:\/|[?#"])/.test(html));
    head.defaultView.close();
    const old = new JSDOM(read(route.replace('/nhi/','/ufos/'))).window.document;
    assert.equal(old.querySelector('#nhi-destination').getAttribute('href'),route);
    assert.equal(old.querySelector('link[rel="canonical"]').href,origin+route);
    assert.equal(old.querySelector('meta[name="robots"]').content,'noindex, follow');
    assert.ok(old.querySelector('noscript'));
    assert.equal(old.querySelector('meta[http-equiv="refresh"]'),null,'No competing refresh that discards query or hash');
    assert.equal(old.querySelector('#ufos-data'),null,'The old route must not retain a second timeline');
    old.defaultView.close();
  }
});

test('actual static migration script preserves old event, person, institution, directory and export URLs without adding a back-stack entry',()=>{
  const cases = [
    ['/ufos/', '?view=core&entity=david-fravor&sort=newest', '#nimitz-encounter'],
    ['/ufos/', '?iq=NRO&itype=office', '#entity-nro'],
    ['/ufos/', '?view=history', '#entity-einstein'],
    ['/ufos/people/', '?q=Einstein&role=science&person=einstein', '#entity-einstein'],
    ['/ufos/people/einstein/', '?q=a%26b&repeat=1&repeat=2', '#entity-einstein'],
    ['/ufos/data/', '?download=1&next=https%3A%2F%2Fevil.example', '#ufos-export'],
  ];
  for (const [route,search,hash] of cases) {
    const document = new JSDOM(read(route)).window.document;
    const replacements=[];
    const location={origin,search,hash,replace: url=>replacements.push(url)};
    runInNewContext(document.querySelector('[data-nhi-redirect]').textContent,{document,window:{location},URL});
    const expected=origin+route.replace('/ufos/','/nhi/')+search+hash;
    assert.deepEqual(replacements,[expected]);
    assert.equal(document.querySelector('#nhi-destination').href,expected);
    assert.ok(!read(route.replace('/ufos/','/nhi/')).includes('data-nhi-redirect'),'No loop at the destination');
    document.defaultView.close();
  }
});

test('saved old browser destinations upgrade in place, retain state and reject unrelated or external paths',()=>{
  for(const path of ['/ufos/?q=NASA#timeline','/ufos/people/?person=einstein#entity-einstein','/nhi/people/einstein/']) {
    assert.equal(canonicalNhiURL(path,origin)?.href,origin+path.replace('/ufos/','/nhi/'));
  }
  assert.equal(canonicalNhiURL('/ufos',origin)?.pathname,'/nhi/');
  for(const path of ['https://evil.example/ufos/','//evil.example/nhi/','javascript:alert(1)','/ufos-other/','/nhi-other/','/contact/'])assert.equal(canonicalNhiURL(path,origin),null);
});

test('previously opened timeline tabs can still export the same complete dataset from the legacy endpoint',()=>{
  const document = new JSDOM(read('/ufos/data/')).window.document;
  assert.deepEqual(JSON.parse(document.querySelector('#ufos-export').textContent),data);
  document.defaultView.close();
});

test('all event, entity and relationship anchors remain on the complete new resource',()=>{
  const html = read('/nhi/');
  for(const event of data.events)assert.ok(html.includes(`id="${event.id}"`),event.id);
  for(const entity of data.entities)assert.ok(html.includes(`id="entity-${entity.id}"`),entity.id);
  for(const relationship of data.relationships)assert.ok(html.includes(`id="relation-${relationship.id}"`),relationship.id);
});
