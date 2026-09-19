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
  assert(!/<a\b[^>]*href=["'][^"']*\/metsicare(?:[\/?#"'])/i.test(html), 'The METSI Care concept must have no inbound site links: ' + file);
}
for (const page of ['index.html', 'hello/index.html', 'contact/index.html', 'buildmine/index.html', 'preview/index.html', 'motorsport/index.html', 'proofpath/index.html', 'tekmetric/index.html', 'privacy/index.html', 'sitemap.xml', 'robots.txt', 'drew-cleaver.vcf']) {
  assert(existsSync(join(root, page)), 'Missing required output: ' + page);
}
const pilot = readFileSync(join(root, 'buildmine/index.html'), 'utf8');
assert(/name="robots" content="noindex, nofollow"/.test(pilot), 'The buildmine pilot must ask search engines not to index it.');
assert.equal((pilot.match(/class="buildmine-question"/g) || []).length, 7, 'Expected seven pilot questions.');
assert(!pilot.includes('maxlength='), 'Pilot answers must not have a character cap.');
for (const page of ['buildmine/index.html', 'preview/index.html', 'motorsport/index.html', 'proofpath/index.html', 'tekmetric/index.html', 'metsicare/index.html']) {
  const html = readFileSync(join(root, page), 'utf8');
  assert(!html.includes('id="analytics-choice"'), 'Unlisted pages must not initialize analytics.');
  assert(/name="robots" content="noindex, nofollow"/.test(html), 'Unlisted pages must ask search engines not to index them: ' + page);
}
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
assert(!/\/(buildmine|preview|writing|motorsport|proofpath|tekmetric|metsicare)(?:\/|<)/.test(sitemap), 'Private/unlisted routes must stay out of the sitemap.');
assert(existsSync(join(root, 'metsicare-deck.pdf')), 'Missing METSI Care PDF.');
console.log('Release check passed: contact routes present; writing absent; all concept and pilot routes unlisted and noindex.');
