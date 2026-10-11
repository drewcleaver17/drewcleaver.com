import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import { campaign, includeCampaign, isLocalReview } from '../src/data/cleaver2028.mjs';
import { centralTimestamp } from '../src/lib/dpc-revision.mjs';
const revision = JSON.parse(readFileSync(new URL('../src/data/cleaver2028-revisions.json', import.meta.url)));
const root = new URL('../dist/', import.meta.url).pathname;
const file = join(root, 'cleaver2028/index.html');
const logoFile = join(root, 'cleaver2028/logo.jpeg');
assert.equal(existsSync(file), includeCampaign, 'Unapproved campaign route must be absent from ordinary builds.');
assert.equal(existsSync(logoFile), includeCampaign, 'Unreleased campaign logo must be absent from ordinary builds.');
const walk = dir => readdirSync(dir).flatMap(name => { const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : [p]; });
for (const p of walk(root).filter(p => /\.(html|xml|txt|json|webmanifest)$/.test(p) && p !== file)) {
  assert(!readFileSync(p, 'utf8').includes('/cleaver2028'), 'No campaign discovery outside its own page: ' + p);
}
if (includeCampaign) {
  const html = readFileSync(file, 'utf8');
  const document = new JSDOM(html).window.document;
  assert.equal(document.querySelector('link[rel="canonical"]').href, 'https://drewcleaver.com/cleaver2028');
  assert.equal(document.querySelector('meta[name="robots"]').content, 'noindex, nofollow');
  assert.equal(document.querySelectorAll('h1').length, 1);
  assert.equal(document.querySelectorAll('main').length, 1);
  assert(document.querySelector('#main[tabindex="-1"]'));
  assert(document.querySelector('.skip-link[href="#main"]'));
  assert(!document.querySelector('script, form, input, textarea, iframe, link[rel="manifest"]'), 'Static reading only; no collection or integrations.');
  assert.equal(document.querySelector('title').textContent, campaign.title);
  for (const name of ['description','twitter:description']) assert.equal(document.querySelector(`meta[name="${name}"]`).content, campaign.description);
  assert.equal(document.querySelector('meta[property="og:url"]').content, 'https://drewcleaver.com/cleaver2028');
  const logo = document.querySelector('.campaign-brand img');
  assert.equal(logo?.getAttribute('src'), '/cleaver2028/logo.jpeg');
  assert.equal(logo?.getAttribute('width'), '1536');
  assert.equal(logo?.getAttribute('height'), '768');
  assert.equal(logo?.getAttribute('alt'), 'Cleaver 2028 — Reinventing Our Future');
  assert.equal(document.querySelector('meta[property="og:image"]').content, 'https://drewcleaver.com/cleaver2028/logo.jpeg');
  assert.equal(document.querySelector('meta[name="twitter:card"]').content, 'summary_large_image');
  assert(readFileSync(logoFile).equals(readFileSync(new URL('../src/assets/cleaver2028/logo.jpeg', import.meta.url))), 'Retain original supplied logo bytes and proportions.');
  assert(document.querySelector('.planning-status').textContent.includes(campaign.status.label));
  assert(document.querySelector('.ambition').textContent.includes(campaign.status.detail));
  assert(document.querySelector('.faq').textContent.includes(campaign.status.faq));
  if (campaign.status.stage === 'pre-filing') assert(!document.querySelector('.filing-record'));
  assert(!document.querySelector('a[href^="/lab/"]'), 'Only the selected original projects are in this review; the Lab hub is not exposed.');
  const projectLinks = isLocalReview || campaign.labLinksApproved;
  for (const href of [campaign.dpc.href, campaign.dpc.contextHref, campaign.proofpath.href]) assert.equal(!!document.querySelector(`a[href="${href}"]`), projectLinks);
  assert(document.querySelector('a[href="/about/"]'));
  assert(document.querySelector('a[href="/hello/"]'));
  assert.equal(document.querySelectorAll('.intro-photo img').length, 1);
  assert(document.querySelector('.intro-photo img').getAttribute('alt').includes('Drew Cleaver and his dad'));
  const stamp = document.querySelector('.revision-stamp');
  assert(stamp.textContent.includes(revision.pageRevision));
  assert(stamp.textContent.includes(centralTimestamp(revision.updatedAt)));
  assert.equal(stamp.querySelector('time').getAttribute('datetime'), revision.updatedAt);
  if (!campaign.releaseApproved) {
    assert.equal(revision.contentStatus, 'draft');
    assert.equal(revision.publicationStatus, 'unpublished');
    assert.equal(revision.publishedAt, null);
    assert.equal(revision.evidenceUrl, null);
  }
  const sourceUrls = new Set(campaign.biographySources.map(source => source.href));
  const ids = [...document.querySelectorAll('[id]')].map(n => n.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const n of document.querySelectorAll('[aria-labelledby]')) for (const id of n.getAttribute('aria-labelledby').split(' ')) assert(document.getElementById(id));
  for (const a of document.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (href.startsWith('#')) assert(document.getElementById(href.slice(1)));
    else if (href.startsWith('/')) {
      const url = new URL(href, 'https://drewcleaver.com');
      const path = join(root, url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname);
      assert(existsSync(path), 'Broken local destination: ' + href);
      if (url.hash) assert(new JSDOM(readFileSync(path, 'utf8')).window.document.getElementById(url.hash.slice(1)), 'Broken project anchor: ' + href);
    } else assert(href === 'mailto:drew@drewcleaver.com' || sourceUrls.has(href) || href === campaign.status.recordUrl, 'Unexpected external destination: '+href);
  }
  assert.equal(document.querySelectorAll('.method-list>li').length, 3);
  assert.equal(document.querySelectorAll('.vision-group').length, 4);
  assert.equal(document.querySelectorAll('.vision-list>li').length, 7);
  console.log('Cleaver2028 output checks passed: gated route, claims/status, metadata, links, no collection, and discovery exclusions.');
} else console.log('Cleaver2028 exclusion verified: ordinary build has no campaign route or discovery entries.');
