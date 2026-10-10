import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { campaign, validateCampaign } from '../src/data/cleaver2028.mjs';
import { cleanCampaignOutput } from '../scripts/prepare-cleaver2028-build.mjs';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
test('rebuilding clears stale campaign output without removing unrelated files', () => {
  const root = mkdtempSync(join(tmpdir(), 'cleaver-build-'));
  try {
    mkdirSync(join(root, 'cleaver2028'));
    writeFileSync(join(root, 'cleaver2028/index.html'), 'old local draft');
    writeFileSync(join(root, 'index.html'), 'existing homepage');
    cleanCampaignOutput(pathToFileURL(root+'/'));
    assert(!existsSync(join(root, 'cleaver2028')));
    assert(existsSync(join(root, 'index.html')));
    cleanCampaignOutput(pathToFileURL(root+'/')); // Idempotent before clean builds.
  } finally { rmSync(root, { recursive:true, force:true }); }
});
test('campaign output follows explicit owner release approval or the local review flag', () => {
  const run = flag => execFileSync(process.execPath, ['--input-type=module', '-e', "import {includeCampaign} from './src/data/cleaver2028.mjs'; console.log(includeCampaign)"], {env:{...process.env, CLEAVER2028_REVIEW:flag}, encoding:'utf8'}).trim();
  assert.equal(run(''), String(campaign.releaseApproved)); assert.equal(run('1'), 'true'); assert.equal(run('true'), String(campaign.releaseApproved));
});
test('filing and release claims require explicit evidence and compliance inputs', () => {
  const value = structuredClone(campaign);
  value.releaseApproved = false;
  validateCampaign(value);
  value.status.recordUrl = 'https://www.fec.gov/';
  assert.throws(() => validateCampaign(value), /Pre-filing/);
  value.status.stage = 'filed'; value.status.filingDate = null;
  assert.throws(() => validateCampaign(value), /date/);
  value.status.filingDate = '2026-10-10'; value.status.recordUrl = 'https://fec.gov.example.org/record';
  assert.throws(() => validateCampaign(value), /official/);
  value.status.recordUrl = 'https://www.fec.gov/data/'; validateCampaign(value);
  value.releaseApproved = true;
  value.compliance = {reviewed:false, disclaimerRequired:null, reviewNote:null};
  assert.throws(() => validateCampaign(value), /compliance/);
  value.compliance = {reviewed:true, disclaimerRequired:true, reviewNote:'Synthetic test determination; not production evidence.'};
  value.disclaimer = null;
  assert.throws(() => validateCampaign(value), /disclaimer/);
  value.disclaimer = 'Synthetic test text'; validateCampaign(value);
});
