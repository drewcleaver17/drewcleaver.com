import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import { centralTimestamp } from '../src/lib/dpc-revision.mjs';

// Run against actual production output, also invoked by the release gate.
const root = new URL('../dist/', import.meta.url).pathname;
const lab = join(root, 'lab');
const read = path => readFileSync(path, 'utf8');
const revision = JSON.parse(read(new URL('../src/data/lab-revisions.json', import.meta.url)));
const current = revision.history.find(entry => entry.id === revision.pageRevision);
assert(current, 'Current Lab revision must exist.');
assert.equal(new Set(revision.history.map(entry => entry.id)).size, revision.history.length);
assert.equal(new Set(revision.history.map(entry => entry.anchor)).size, revision.history.length);
for (const entry of revision.history) {
  centralTimestamp(entry.finalizedAt);
  if (entry.publicationStatus === 'published') {
    assert(entry.publishedAt && entry.evidenceUrl, 'Publication needs timestamp and deployment evidence.');
    centralTimestamp(entry.publishedAt);
  } else {
    assert.equal(entry.publishedAt, null, 'Do not invent unpublished release dates.');
    assert.equal(entry.evidenceUrl, null);
  }
}
assert.equal(current.finalizedAt, revision.updatedAt, 'Current finalization and update times must agree.');
assert.match(centralTimestamp('2026-10-10T14:00:00Z'), /CDT/);
assert.match(centralTimestamp('2026-12-10T14:00:00Z'), /CST/);
// R01 is an immutable published record; later revisions must preserve its evidence.
assert.equal(createHash('sha256').update(JSON.stringify(revision.history.find(entry => entry.id === 'R01'))).digest('hex'),
  '77765bf1f44193616a017f7b0d55d8d9f91d06f555cfdba669896969ce5cb46b');
const documents = new Map();
const paths = ['/lab/', '/lab/healthcare/', '/lab/work/', '/lab/updates/'];
for (const path of paths) {
  const document = new JSDOM(read(join(root, path, 'index.html'))).window.document;
  documents.set(path, document);
  assert.equal(document.querySelector('meta[name="robots"]')?.content, 'noindex, nofollow');
  assert.equal(document.querySelector('link[rel="canonical"]')?.href, 'https://drewcleaver.com' + path);
  assert.equal(document.querySelector('link[rel="manifest"]')?.getAttribute('href'), '/lab/manifest.webmanifest');
  assert.equal(document.querySelector('meta[name="viewport"]')?.content, 'width=device-width, initial-scale=1, viewport-fit=cover');
  assert.equal(document.querySelectorAll('h1').length, 1);
  assert.equal(document.querySelectorAll('main').length, 1);
  assert(document.querySelector('a.skip-link[href="#main"]'));
  const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(new Set(ids).size, ids.length, `Unique durable anchors: ${path}`);
  assert(!document.querySelector('script, form, input, textarea, button'), 'Lab reading and navigation must work without JavaScript or pretend controls.');
  assert.equal(document.querySelector('.lab-revision time')?.getAttribute('datetime'), revision.updatedAt);
  assert(document.querySelector('.lab-revision')?.textContent.includes(centralTimestamp(revision.updatedAt)));
  for (const nav of document.querySelectorAll('.lab-desktop-nav, .lab-bottom-nav')) {
    const links = [...nav.querySelectorAll('a')];
    assert.deepEqual(links.map(link => link.getAttribute('href')), paths);
    assert.equal(nav.querySelectorAll('[aria-current="page"]').length, 1);
    assert.equal(nav.querySelector('[aria-current="page"]')?.getAttribute('href'), path);
    for (const link of links) assert(link.textContent.trim() && !link.hasAttribute('tabindex'));
  }
  for (const node of document.querySelectorAll('[aria-labelledby]')) {
    for (const id of node.getAttribute('aria-labelledby').split(' ')) assert(document.getElementById(id), `Accessible label ${id}`);
  }
  for (const link of document.querySelectorAll('a[href]')) {
    const url = new URL(link.getAttribute('href'), 'https://drewcleaver.com' + path);
    if (url.origin !== 'https://drewcleaver.com') continue;
    const target = join(root, url.pathname, url.pathname.endsWith('/') ? 'index.html' : '');
    assert(existsSync(target), `Broken Lab link: ${url}`);
    if (url.hash) {
      const targetDoc = url.pathname === path ? document : new JSDOM(read(target)).window.document;
      assert(targetDoc.getElementById(decodeURIComponent(url.hash.slice(1))), `Missing anchor: ${url}`);
    }
    if (!url.pathname.startsWith('/lab/')) {
      assert.equal(link.target, '_blank', 'App-scope exits need explicit handling.');
      assert(link.rel.includes('noopener'));
      assert(link.textContent.includes('outside Lab'), 'Scope exit must be labeled.');
    }
  }
}
const categories = [...documents.get('/lab/').querySelectorAll('.lab-topic-card')];
assert.deepEqual(categories.map(card => card.id), ['healthcare', 'housing', 'work', 'education', 'taxes']);
assert.deepEqual(categories.map(card => card.querySelector('h3').textContent.replace('↗', '').trim()),
  ['Healthcare', 'Housing', 'Work', 'Education', 'Taxes']);
assert.deepEqual(categories.filter(card => card.matches('a')).map(card => card.getAttribute('href')),
  ['/lab/healthcare/', '/lab/work/']);
for (const id of ['housing', 'education', 'taxes']) {
  const card = categories.find(card => card.id === id);
  assert(!card.matches('a') && !card.querySelector('a, button, [tabindex], [aria-disabled]'));
  assert.equal(card.querySelector('.eyebrow').textContent.split('/')[1].trim(), 'To explore');
  assert.equal(card.children.length, 2, 'Placeholder contains only its title and status.');
  assert(!existsSync(join(lab, id)), 'Placeholder must not generate a page.');
}
const updates = documents.get('/lab/updates/');
const r01 = revision.history.find(entry => entry.id === 'R01');
assert(updates.querySelector(`#${r01.anchor} time[datetime="${r01.finalizedAt}"]`));
assert(updates.querySelector(`#${r01.anchor} time[datetime="${r01.publishedAt}"]`));
assert(updates.querySelector(`#${r01.anchor} a[href="${r01.evidenceUrl}"]`));
assert(updates.getElementById(current.anchor).textContent.includes(current.publicationStatus));
for (const path of ['/lab/healthcare/', '/lab/work/']) {
  const doc = documents.get(path);
  for (const id of ['position', 'evidence', 'questions', 'pilot', 'decisions', 'next', 'proposals']) assert(doc.getElementById(id));
}
assert(documents.get('/lab/healthcare/').getElementById('funding'));
for (const [topic, source, label] of [['healthcare', 'dpc', 'dpc'], ['work', 'proofpath', 'proofpath']]) {
  const sourceRevision = JSON.parse(read(new URL(`../src/data/${source}-revisions.json`, import.meta.url)));
  const doc = documents.get(`/lab/${topic}/`);
  assert(doc.getElementById(label).textContent.includes(sourceRevision.pageRevision));
  assert.equal(doc.querySelector(`#${label} time`).getAttribute('datetime'), sourceRevision.updatedAt);
}
const walk = directory => readdirSync(directory).flatMap(name => {
  const file = join(directory, name);
  return statSync(file).isDirectory() ? walk(file) : [file];
});
for (const file of walk(root)) {
  if (file.startsWith(lab + '/')) continue;
  if (/\.(html|xml|json|webmanifest|txt)$/.test(file)) {
    assert(!read(file).includes('/lab/'), 'Lab must be absent from public navigation, sitemap and discovery: ' + file);
  }
}
const manifest = JSON.parse(read(join(lab, 'manifest.webmanifest')));
for (const key of ['id', 'start_url', 'scope']) assert.equal(manifest[key], '/lab/');
assert.equal(manifest.display, 'standalone');
assert.equal(manifest.theme_color, '#173e35');
assert.equal(manifest.background_color, '#f7f5ee');
for (const icon of manifest.icons) {
  assert(icon.src.startsWith('/lab/'));
  const bytes = readFileSync(join(root, icon.src));
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  const [width, height] = icon.sizes.split('x').map(Number);
  assert.equal(bytes.readUInt32BE(16), width); assert.equal(bytes.readUInt32BE(20), height);
}
assert.equal(manifest.icons.length, 3);
assert(!walk(lab).some(file => /\.js$/.test(file)), 'No Lab service worker or client cache.');
assert(!/serviceWorker|caches\.open/.test(read(new URL('../src/layouts/Lab.astro', import.meta.url))));
// Rule-based responsive safeguards are not a substitute for browser QA.
const css = read(new URL('../src/styles/lab.css', import.meta.url));
assert(css.includes('safe-area-inset-bottom') && css.includes('safe-area-inset-top'));
assert(css.includes('scroll-margin-block') && css.includes('scroll-margin-top'));
assert.match(css, /\.lab-footer[^}]*padding-block:[^;]*7rem/);
assert.match(css, /\.lab-bottom-nav a[^}]*min-height: 48px/);
assert.match(read(new URL('../src/styles/global.css', import.meta.url)), /:focus-visible\s*\{[^}]*outline: 3px/);
assert(readFileSync(join(root, 'dpc-deck.pdf')).equals(readFileSync(join(root, 'metsicare-deck.pdf'))));
console.log('Lab check passed: five ordered categories, three nonlinked placeholders without routes, preserved R01, four routes, canonical links/anchors, no-JS navigation, fixed revisions, discovery exclusions, scoped manifest and PDF aliases. Browser/device verification is separate.');
