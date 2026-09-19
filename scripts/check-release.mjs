import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// This release intentionally has no public writing. Update this check only when
// Drew explicitly approves launching that section.
const output = new URL('../dist/', import.meta.url);
const root = output.pathname;
assert(!existsSync(join(root, 'writing')), 'Unapproved writing routes were generated.');
const files = directory => readdirSync(directory).flatMap(name => {
  const file = join(directory, name);
  return statSync(file).isDirectory() ? files(file) : [file];
});
for (const file of files(root).filter(file => file.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  assert(!/href=["'][^"']*\/writing(?:[\/?#"'])/i.test(html), 'Public writing link in ' + file);
  assert(file.endsWith('/preview/index.html') || !/<a\b[^>]*href=["'][^"']*\/buildmine(?:[\/?#"'])/i.test(html), 'The buildmine pilot must stay out of public navigation: ' + file);
  assert(!/<a\b[^>]*href=["'][^"']*\/motorsport(?:[\/?#"'])/i.test(html), 'The motorsport pilot must have no inbound site links: ' + file);
  assert(!/<a\b[^>]*href=["'][^"']*\/proofpath(?:[\/?#"'])/i.test(html), 'The ProofPath brief must have no inbound site links: ' + file);
  assert(!/<a\b[^>]*href=["'][^"']*\/tekmetric(?:[\/?#"'])/i.test(html), 'The Tekmetric pitch must have no inbound site links: ' + file);
  assert(file.endsWith('/ufos/index.html') || !/<a\b[^>]*href=["'][^"']*\/ufos(?:[\/?#"'])/i.test(html), 'The UFO timeline must have no inbound site links: ' + file);
  assert(file.endsWith('/dpc/index.html') || file.endsWith('/metsicare/index.html') || !/<a\b[^>]*href=["'][^"']*\/dpc(?:[\/?#"'])/i.test(html), 'The DPC concept must have no inbound site links: ' + file);
  assert(!/<a\b[^>]*href=["'][^"']*\/metsicare(?:[\/?#"'])/i.test(html), 'The METSI Care concept must have no inbound site links: ' + file);
}
for (const page of ['index.html', 'hello/index.html', 'contact/index.html', 'buildmine/index.html', 'preview/index.html', 'motorsport/index.html', 'proofpath/index.html', 'tekmetric/index.html', 'privacy/index.html', 'sitemap.xml', 'robots.txt', 'drew-cleaver.vcf']) {
  assert(existsSync(join(root, page)), 'Missing required output: ' + page);
}
const pilot = readFileSync(join(root, 'buildmine/index.html'), 'utf8');
assert(/name="robots" content="noindex, nofollow"/.test(pilot), 'The buildmine pilot must ask search engines not to index it.');
assert.equal((pilot.match(/class="buildmine-question"/g) || []).length, 7, 'Expected seven pilot questions.');
assert(!pilot.includes('maxlength='), 'Pilot answers must not have a character cap.');
for (const page of ['buildmine/index.html', 'preview/index.html', 'motorsport/index.html', 'proofpath/index.html', 'tekmetric/index.html', 'metsicare/index.html', 'dpc/index.html', 'ufos/index.html']) {
  const html = readFileSync(join(root, page), 'utf8');
  assert(!html.includes('id="analytics-choice"'), 'Unlisted pages must not initialize analytics.');
  assert(/name="robots" content="noindex, nofollow"/.test(html), 'Unlisted pages must ask search engines not to index them: ' + page);
}
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
assert(!/\/(buildmine|preview|writing|motorsport|proofpath|tekmetric|metsicare|dpc|ufos)(?:\/|<)/.test(sitemap), 'Private/unlisted routes must stay out of the sitemap.');
const ufoHtml = readFileSync(join(root, 'ufos/index.html'), 'utf8');
const ufoData = JSON.parse(readFileSync(new URL('../src/data/ufos/timeline.json', import.meta.url), 'utf8'));
for (const event of ufoData.events.filter(e => e.publicationStatus === 'published')) {
  assert(ufoHtml.includes('id="' + event.id + '"'), 'Missing static event anchor: ' + event.id);
  assert(ufoHtml.includes(event.title.replaceAll('&', '&amp;')), 'Missing static event text: ' + event.id);
}
assert(!/Disallow:\s*\/ufos/i.test(readFileSync(join(root,'robots.txt'),'utf8')), 'Do not block noindex discovery.');
const youtube = readFileSync(join(root, 'youtube/index.html'), 'utf8');
assert(/name="robots" content="noindex, nofollow"/.test(youtube), 'The initial YouTube collection should remain noindex.');
assert(!youtube.includes('<iframe'), 'YouTube players must load only after a visitor clicks.');
assert(!youtube.includes('id="analytics-choice"'), 'The unlisted YouTube page must not initialize analytics.');
assert(!sitemap.includes('/youtube'), 'The initial YouTube collection should remain out of the sitemap.');
assert(existsSync(join(root, 'metsicare-deck.pdf')), 'Missing METSI Care PDF.');
assert(existsSync(join(root, 'dpc-deck.pdf')), 'Missing DPC PDF.');
const dpc=readFileSync(join(root,'dpc/index.html'),'utf8');
assert(!/METSI|Garrick/i.test(dpc), 'The neutral DPC page must not imply practice affiliation.');
assert(readFileSync(join(root,'metsicare-deck.pdf')).equals(readFileSync(join(root,'dpc-deck.pdf'))), 'Old PDF links must deliver the neutral deck.');
console.log('Release check passed: public routes preserved; all concept, pilot, library and UFO routes remain unlisted and noindex; static chronology present.');
