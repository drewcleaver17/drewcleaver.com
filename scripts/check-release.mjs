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
  assert(!/<a\b[^>]*href=["'][^"']*\/motorsport(?:[\/?#"'])/i.test(html), 'The motorsport pilot must have no inbound site links: ' + file);
  assert(!/<a\b[^>]*href=["'][^"']*\/racingresume(?:[\/?#"'])/i.test(html), 'The racing resume must have no inbound site links: ' + file);
  assert(!/<a\b[^>]*href=["'][^"']*\/proofpath(?:[\/?#"'])/i.test(html), 'The ProofPath brief must have no inbound site links: ' + file);
  assert(!/<a\b[^>]*href=["'][^"']*\/tekmetric(?:[\/?#"'])/i.test(html), 'The Tekmetric pitch must have no inbound site links: ' + file);
  assert(file.endsWith('/ufos/index.html') || !/<a\b[^>]*href=["'][^"']*\/ufos(?:[\/?#"'])/i.test(html), 'The UFO timeline must have no inbound site links: ' + file);
  assert(file.endsWith('/dpc/index.html') || file.endsWith('/metsicare/index.html') || !/<a\b[^>]*href=["'][^"']*\/dpc(?:[\/?#"'])/i.test(html), 'The DPC concept must have no inbound site links: ' + file);
  assert(!/<a\b[^>]*href=["'][^"']*\/metsicare(?:[\/?#"'])/i.test(html), 'The METSI Care concept must have no inbound site links: ' + file);
  assert(file.startsWith(join(root, 'portfolio') + '/') || !/<a\b[^>]*href=["'][^"']*\/portfolio(?:[\/?#"'])/i.test(html), 'The portfolio review must have no inbound links from the rest of the site: ' + file);
}
for (const page of ['index.html', 'hello/index.html', 'contact/index.html', 'buildmine/index.html', 'preview/index.html', 'motorsport/index.html', 'racingresume/index.html', 'proofpath/index.html', 'tekmetric/index.html', 'privacy/index.html', 'sitemap.xml', 'robots.txt', 'drew-cleaver.vcf']) {
  assert(existsSync(join(root, page)), 'Missing required output: ' + page);
}
const pilot = readFileSync(join(root, 'buildmine/index.html'), 'utf8');
assert(!/name="robots" content="noindex/.test(pilot), 'The approved public builder must be discoverable.');
assert(!pilot.includes('id="analytics-choice"'), 'The builder must never initialize analytics.');
const publishing = readFileSync(join(root, 'buildmine/publish/index.html'), 'utf8');
assert(!publishing.includes('id="analytics-choice"'), 'Publishing instructions must not initialize analytics.');
assert(existsSync(join(root, 'buildmine/starter.zip')), 'Missing downloadable starter kit.');
assert(existsSync(join(root, 'p/alex.rivera.example/index.html')), 'Missing named fictional example.');
const example=readFileSync(join(root, 'p/alex.rivera.example/index.html'), 'utf8');
assert(example.includes('Fictional example') && /noindex, nofollow/.test(example), 'Example must be visibly fictional and noindex.');
assert.equal((pilot.match(/class="buildmine-question"/g) || []).length, 7, 'Expected seven pilot questions.');
assert(!pilot.includes('maxlength='), 'Pilot answers must not have a character cap.');
for (const page of ['preview/index.html', 'motorsport/index.html', 'racingresume/index.html', 'proofpath/index.html', 'tekmetric/index.html', 'metsicare/index.html', 'dpc/index.html', 'ufos/index.html']) {
  const html = readFileSync(join(root, page), 'utf8');
  assert(!html.includes('id="analytics-choice"'), 'Unlisted pages must not initialize analytics.');
  assert(/name="robots" content="noindex, nofollow"/.test(html), 'Unlisted pages must ask search engines not to index them: ' + page);
}
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
assert(!/\/(preview|writing|motorsport|racingresume|proofpath|tekmetric|metsicare|dpc|ufos)(?:\/|<)/.test(sitemap), 'Private/unlisted routes must stay out of the sitemap.');
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
assert(dpc.includes('data-dpc-worksheet'), 'The DPC worksheet must be present.');
assert.equal((dpc.match(/data-input="/g)||[]).length,70,'DPC must retain all original inputs for earlier worksheets.');
assert(dpc.includes('data-staffing-controls')&&dpc.includes('revision-history')&&dpc.includes('R05'),'DPC must include the roster editor and revision history.');
const dpcArticle=dpc.slice(dpc.indexOf('<article'),dpc.lastIndexOf('</article>'));
assert(!/<details\b|<summary\b/i.test(dpcArticle),'DPC narrative and worksheet sections must stay fully open.');
const dpcCurrent=dpc.replace(/<section id="revision-history"[\s\S]*?<\/section>/,'');
assert(!/METSI|Garrick/i.test(dpcCurrent), 'The neutral DPC page must not imply practice affiliation.');
assert(readFileSync(join(root,'metsicare-deck.pdf')).equals(readFileSync(join(root,'dpc-deck.pdf'))), 'Old PDF links must deliver the neutral deck.');
assert(sitemap.includes('/buildmine/'), 'Public builder must appear in the sitemap.');
assert(!/\/portfolio(?:\/|<)/.test(sitemap), 'The portfolio review must stay out of the sitemap.');
for (const page of ['index.html', 'higher-hangers/index.html', 'angeline-office/index.html', 'tesloco/index.html', 'spec-tesla-cup/index.html', 'buildmine/index.html']) {
  const file = join(root, 'portfolio', page);
  assert(existsSync(file), 'Missing portfolio review page: ' + page);
  const html = readFileSync(file, 'utf8');
  assert(/name="robots" content="noindex, nofollow"/.test(html), 'Portfolio review must remain noindex: ' + page);
  assert(!/id="analytics-choice"|googletagmanager\.com|google-analytics\.com/.test(html), 'No analytics on the portfolio review: ' + page);
  assert(html.includes('Unlisted · For review'), 'Portfolio review needs a visible status label: ' + page);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    const path = decodeURIComponent(match[1]);
    if (path.startsWith('//')) continue;
    const target = join(root, path.endsWith('/') ? path + 'index.html' : path);
    assert(existsSync(target), 'Broken portfolio link or asset: ' + path + ' in ' + page);
  }
}
assert(!/Disallow:\s*\/portfolio/i.test(readFileSync(join(root, 'robots.txt'), 'utf8')), 'Allow crawlers to read portfolio noindex instructions.');
console.log('Release check passed: Buildmine public; portfolio review and other unlisted routes preserved.');
