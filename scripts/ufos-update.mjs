import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { validateDataset } from '../src/lib/ufos.mjs';

export const datasetPath = fileURLToPath(new URL('../src/data/ufos/timeline.json', import.meta.url));
export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const contentDigest = data => digest({ sources: data.sources, events: data.events, changeLog: data.changeLog });
const fail = text => { throw new Error(text); };
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
export function assertPermittedPaths(paths) {
  if (!paths.length || paths.some(p => p !== 'src/data/ufos/timeline.json')) fail('Automated publication is restricted to the timeline dataset.');
}
export function prepareUpdate(current, batch, { reviewed = false, now = new Date() } = {}) {
  if (batch?.schemaVersion !== 1 || !Array.isArray(batch.changes) || !batch.changes.length) fail('Malformed update envelope');
  if (!batch.id || !/^[a-z0-9-]+$/.test(batch.id)) fail('Missing stable batch ID');
  if (current.meta.appliedBatchIds?.includes(batch.id)) return { data: current, changed: false, reason: 'Batch already applied' };
  if (batch.baseDigest !== digest(current)) fail('Stale base: refresh the dataset before retrying');
  if (!Array.isArray(batch.sourceChecks)) fail('Source-reading attestations are required');
  const next = structuredClone(current);
  const timestamp = now.toISOString();
  const changedIds = [];
  const allowedChangeKeys = ['op', 'event', 'reason'];
  for (const source of batch.sources || []) {
    if (next.sources[source.id] && !equal(next.sources[source.id],source)) fail('Existing source records are immutable; add a new versioned source ID');
    next.sources[source.id] = source;
  }
  for (const change of batch.changes) {
    if (Object.keys(change).some(k => !allowedChangeKeys.includes(k)) || !['add','revise'].includes(change.op)) fail('Unsupported change operation');
    const e = change.event;
    if (!e || !change.reason?.trim()) fail('Event and editorial reason required');
    const existing = next.events.find(item => item.id === e.id);
    if (change.op === 'add' && existing) {
      if (equal(existing,e)) continue;
      fail('Duplicate ID with conflicting content: ' + e.id);
    }
    if (change.op === 'revise' && !existing) fail('Cannot revise a missing event');
    if (existing && equal(existing,e)) continue;
    const collision = next.events.some(item => item.id !== e.id && (item.slug === e.slug || (item.date.start === e.date?.start && item.sources.some(s => e.sources?.some(t => s.sourceId === t.sourceId)))));
    if (collision) fail('Possible duplicate milestone: review instead of adding');
    if (change.op === 'revise' && (e.id !== existing.id || e.slug !== existing.slug)) fail('Stable IDs cannot change');
    if (!reviewed) {
      if (e.automationClass !== 'institutional' || !['editor-reviewed','bounded-reviewed'].includes(e.reviewStatus)) fail('Hold for review: not a bounded institutional update');
      if (!e.sources?.length || e.sources.some(s => next.sources[s.sourceId]?.kind !== 'primary')) fail('Hold for review: automatic entries require inspected primary sources');
      if (e.evidenceTypes?.some(t => ['Firsthand account','Secondhand allegation','Sensor material','Original reporting','Reporting inspected'].includes(t))) fail('Hold for review: testimony, sensor claims or reporting-only support');
      if (e.categories?.includes('Legislation and executive actions')) fail('Hold legal and executive scope interpretations for editorial review');
      if (!batch.riskReview || batch.riskReview.consequentialAllegation !== false || batch.riskReview.uncertainInterpretation !== false || batch.riskReview.physicalProofClaim !== false) fail('Hold for review: explicit risk review required');
    }
    for (const ref of e.sources || []) {
      const check = batch.sourceChecks.find(s => s.sourceId === ref.sourceId);
      if (!check || check.result !== 'supporting-text-read' || !check.supportedStatement?.trim() || !check.location?.trim() || !check.checkedAt || !check.url || check.url !== next.sources[ref.sourceId]?.url) fail('Unsupported claim or failed source: ' + ref.sourceId);
      if (!Number.isFinite(Date.parse(check.checkedAt)) || Date.parse(check.checkedAt) > +now || +now - Date.parse(check.checkedAt) > 7 * 86400000) fail('Stale source check: ' + ref.sourceId);
    }
    const record = structuredClone(e);
    record.addedAt = existing?.addedAt || timestamp; record.revisedAt = timestamp; record.lastVerifiedAt = timestamp;
    record.correctionHistory = existing ? [...existing.correctionHistory, { at: timestamp, reason: change.reason, previousSummary: existing.summary, previousRecordDigest: digest(existing) }] : [];
    record.reviewStatus = reviewed ? 'editor-reviewed' : 'bounded-reviewed';
    if (existing) next.events[next.events.indexOf(existing)] = record; else next.events.push(record);
    changedIds.push(record.id);
  }
  if (!changedIds.length) return { data: current, changed: false, reason: 'No content change' };
  next.meta.lastCheckedAt = timestamp; next.meta.contentUpdatedAt = timestamp; next.meta.researchCutoff = timestamp.slice(0,10);
  next.meta.edition = batch.id; next.meta.publicationReceipt = null;
  next.meta.appliedBatchIds = [...(current.meta.appliedBatchIds || []), batch.id];
  next.changeLog.push({ id: batch.id, date: timestamp.slice(0,10), title: batch.title || 'Source-checked update', detail: batch.changes.map(c => c.reason).join(' '), eventIds: changedIds });
  const errors = validateDataset(next, now); if (errors.length) fail(errors.join('\n'));
  return { data: next, changed: true, changedIds };
}
// Pure orchestration for tests and adapters. A receipt is only returned after both
// the authorized deployment and a fresh check of its live content succeed.
export async function publishValidatedUpdate(current, batch, adapters, options) {
  const prepared = prepareUpdate(current,batch,options);
  if (!prepared.changed) return { status:'unchanged', data:current };
  await adapters.verifySources(batch.sourceChecks);
  const revision = await adapters.deploy(prepared.data);
  if (!await adapters.verifyLive(revision,contentDigest(prepared.data))) fail('Live verification failed; publication is unconfirmed');
  return { status:'published', revision, data:prepared.data };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), current = JSON.parse(readFileSync(datasetPath,'utf8'));
  if (args[0] === '--digest') console.log(digest(current));
  else if (args[0] === '--validate') {
    const errors=validateDataset(current); if(errors.length) fail(errors.join('\n'));
    console.log('UFO dataset valid: ' + current.events.length + ' source-audited entries. Semantic source review remains required.');
  } else {
    const file=args.find(a=>!a.startsWith('--')); if(!file) fail('Usage: node scripts/ufos-update.mjs batch.json [--apply] [--reviewed]');
    const prepared=prepareUpdate(current,JSON.parse(readFileSync(file,'utf8')),{reviewed:args.includes('--reviewed')});
    if(args.includes('--apply') && prepared.changed) {
      const temporary=datasetPath + '.pending'; writeFileSync(temporary,JSON.stringify(prepared.data,null,2)+'\n',{flag:'wx'}); renameSync(temporary,datasetPath);
    }
    console.log(JSON.stringify({mode:args.includes('--apply')?'applied locally; NOT published':'dry run',changed:prepared.changed,events:prepared.changedIds || [],reason:prepared.reason || null}));
  }
}
