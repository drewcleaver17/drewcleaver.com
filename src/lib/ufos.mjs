export const categories = ['Encounters and observations', 'Reporting and disclosures', 'Hearings and oversight', 'Legislation and executive actions', 'Scientific research', 'Records releases', 'Corrections and case resolutions'];
export const evidenceDefinitions = {
  'Institutional record': 'A hearing, law, policy or release documented by the responsible institution. It verifies an action, not every claim within it.',
  'Institutional assessment': 'An agency’s stated analysis or conclusion, subject to its data and methods.',
  'Firsthand account': 'A person describes something they directly observed. Interpretation and measurement remain separate questions.',
  'Secondhand allegation': 'A claim relayed from other people or described records; underlying material is not publicly authenticated here.',
  'Sensor material': 'Images, video or instrument reports are involved. This label does not mean raw data or calibration are publicly available.',
  'Scientific assessment': 'A scientific study or methodological review, not necessarily a finding about a particular incident.',
  'Original reporting': 'Journalists’ own interviews or document reporting. Authentication of the underlying claims is separately stated.',
  'Reporting inspected': 'Supporting passages in reporting were read; an original may be inaccessible. This label does not imply independent corroboration by multiple outlets.'
};
export const eras = [
  { id: 'attention', label: '01 / Renewed public attention', years: '2017–2021', start: '2017', end: '2021', summary: 'Reporting, released footage and an intelligence assessment put the question in public view.' },
  { id: 'oversight', label: '02 / Formal scrutiny', years: '2022–2024', start: '2022', end: '2024', summary: 'Hearings, scientific studies and legislation create distinct ways to ask for answers.' },
  { id: 'records', label: '03 / The expanding records trail', years: '2025 onward', start: '2025', end: '9999', summary: 'Records collections and disclosure channels grow. More material does not automatically mean more certainty.' }
];
export const initialState = { q: '', from: '', to: '', category: '', entity: '', evidence: '', sort: 'oldest', view: 'story', context: false };
export function dateBounds(value) {
  if (/^\d{4}$/.test(value)) return [value + '-01-01', value + '-12-31'];
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [y, m] = value.split('-').map(Number);
    return [value + '-01', value + '-' + new Date(Date.UTC(y, m, 0)).getUTCDate()];
  }
  return [value, value];
}
export function formatDate(value) {
  if (!value) return 'Not established';
  const options = value.length === 4 ? { year: 'numeric' } : value.length === 7 ? { year: 'numeric', month: 'long' } : { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(dateBounds(value)[0] + 'T12:00:00Z'));
}
export const eventDateLabel = e => formatDate(e.date.start) + (e.date.end ? ' – ' + formatDate(e.date.end) : '');
export function searchText(e, sources) {
  return [e.title, e.summary, e.significance, ...e.established, ...e.limitations, ...e.openQuestions, ...e.people, ...e.institutions, ...e.tags, ...e.categories, ...e.evidenceTypes, ...e.sources.map(s => sources[s.sourceId]?.title || '')].join(' ').normalize('NFKC').toLowerCase();
}
export function filterEvents(data, state) {
  const s = { ...initialState, ...state };
  const terms = s.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return data.events.filter(e => {
    if (e.publicationStatus !== 'published' || (e.context && !s.context)) return false;
    if (s.from && dateBounds(e.date.end || e.date.start)[1] < s.from) return false;
    if (s.to && dateBounds(e.date.start)[0] > s.to) return false;
    if (s.category && !e.categories.includes(s.category)) return false;
    if (s.entity && ![...e.people, ...e.institutions].includes(s.entity)) return false;
    if (s.evidence && !e.evidenceTypes.includes(s.evidence)) return false;
    const haystack = searchText(e, data.sources);
    return terms.every(t => haystack.includes(t));
  }).sort((a, b) => {
    if (s.view === 'recent') return b.revisedAt.localeCompare(a.revisedAt) || b.addedAt.localeCompare(a.addedAt) || a.id.localeCompare(b.id);
    const comparison = dateBounds(a.date.start)[0].localeCompare(dateBounds(b.date.start)[0]) || a.id.localeCompare(b.id);
    return s.sort === 'newest' ? -comparison : comparison;
  });
}
export function stateFromParams(params) {
  const s = { ...initialState };
  for (const key of Object.keys(s)) {
    if (key === 'context') s.context = params.get(key) === '1';
    else if (params.has(key)) s[key] = params.get(key).slice(0, 500);
  }
  if (!['oldest', 'newest'].includes(s.sort)) s.sort = 'oldest';
  if (!['story', 'recent'].includes(s.view)) s.view = 'story';
  for (const key of ['from', 'to']) if (!/^\d{4}-\d{2}-\d{2}$/.test(s[key])) s[key] = '';
  return s;
}
export function paramsFromState(state) {
  const p = new URLSearchParams();
  for (const key of Object.keys(initialState)) if (state[key] !== initialState[key] && state[key]) p.set(key, key === 'context' ? '1' : state[key]);
  return p;
}
export function validateDataset(data, now = new Date()) {
  const errors = [];
  const check = (test, message) => { if (!test) errors.push(message); };
  const string = v => typeof v === 'string' && v.trim().length > 0;
  const date = v => {
    if (typeof v !== 'string' || !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(v)) return false;
    const [low] = dateBounds(v), d = new Date(low + 'T00:00:00Z');
    return !Number.isNaN(+d) && d.toISOString().slice(0, 10) === low && low <= now.toISOString().slice(0, 10);
  };
  const stamp = v => string(v) && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v)) && Date.parse(v) <= +now;
  check(data?.schemaVersion === 1, 'Unsupported schema version');
  if (!Array.isArray(data?.events) || !data?.sources || !data?.meta) return [...errors, 'Missing events, sources or meta'];
  for (const key of ['lastCheckedAt', 'contentUpdatedAt']) check(stamp(data.meta[key]), 'Invalid meta.' + key);
  check(date(data.meta.researchCutoff), 'Invalid research cutoff');
  check(['active', 'awaiting review', 'setup incomplete', 'paused'].includes(data.meta.updateStatus), 'Invalid update status');
  for (const [id, s] of Object.entries(data.sources)) {
    check(s.id === id, 'Source ID mismatch: ' + id);
    for (const k of ['title', 'publisher', 'url', 'locator']) check(string(s[k]), 'Missing source ' + id + '.' + k);
    let safe = false; try { const u = new URL(s.url); safe = u.protocol === 'https:' && !u.username && !u.password; } catch {}
    check(safe, 'Unsafe source URL: ' + id);
    check(s.verification === 'supporting-text-read', 'Source text not verified: ' + id);
    check(['primary', 'reporting', 'original-reporting', 'reprint'].includes(s.kind), 'Invalid source kind: ' + id);
    check(date(s.accessedDate), 'Invalid source access date: ' + id);
    check(s.publicationDate === null || date(s.publicationDate), 'Invalid source publication date: ' + id);
  }
  const ids = new Set(), slugs = new Set(), fingerprints = new Set();
  for (const e of data.events) {
    check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id || ''), 'Invalid ID');
    check(!ids.has(e.id), 'Duplicate event ID: ' + e.id); ids.add(e.id);
    check(e.slug === e.id && !slugs.has(e.slug), 'Invalid or duplicate slug: ' + e.id); slugs.add(e.slug);
    for (const key of ['title', 'summary', 'significance']) check(string(e[key]), 'Missing ' + e.id + '.' + key);
    const fingerprint = e.date?.start + '|' + e.title?.toLowerCase().replace(/\W/g, '');
    check(!fingerprints.has(fingerprint), 'Duplicate milestone: ' + e.id); fingerprints.add(fingerprint);
    check(date(e.date?.start), 'Invalid event date: ' + e.id);
    check(e.date?.end === null || (date(e.date?.end) && e.date.end >= e.date.start), 'Invalid date range: ' + e.id);
    const precision = e.date?.end ? 'range' : ({4:'year',7:'month',10:'day'})[e.date?.start?.length];
    check(e.date?.precision === precision, 'False date precision: ' + e.id);
    check(['milestone', 'incident', 'publication', 'reporting'].includes(e.date?.role), 'Invalid date role: ' + e.id);
    for (const k of ['incidentDate', 'disclosureDate', 'publicationDate']) check(e[k] === null || date(e[k]), 'Invalid ' + k + ': ' + e.id);
    for (const k of ['addedAt', 'revisedAt', 'lastVerifiedAt']) check(stamp(e[k]), 'Invalid ' + k + ': ' + e.id);
    check(e.revisedAt >= e.addedAt, 'Revision predates addition: ' + e.id);
    for (const k of ['established','limitations','openQuestions','categories','people','institutions','evidenceTypes','tags','relatedEventIds','correctionHistory']) check(Array.isArray(e[k]), 'Missing array ' + k + ': ' + e.id);
    check(e.established?.length && e.limitations?.length, 'Missing evidence boundary: ' + e.id);
    check(e.categories?.length && e.categories.every(c => categories.includes(c)), 'Invalid category: ' + e.id);
    check(e.evidenceTypes?.length && e.evidenceTypes.every(k => evidenceDefinitions[k]), 'Invalid evidence type: ' + e.id);
    check(['published','held'].includes(e.publicationStatus), 'Invalid publication status: ' + e.id);
    check(['editor-reviewed','bounded-reviewed','awaiting-review'].includes(e.reviewStatus), 'Invalid review status: ' + e.id);
    check(e.publicationStatus !== 'published' || e.reviewStatus !== 'awaiting-review', 'Unreviewed published record: ' + e.id);
    check(['institutional','review-required'].includes(e.automationClass), 'Missing automation class: ' + e.id);
    check(typeof e.context === 'boolean', 'Missing context flag: ' + e.id);
    check(Array.isArray(e.sources) && e.sources.length > 0, 'Missing citations: ' + e.id);
    for (const ref of e.sources || []) {
      check(Boolean(data.sources[ref.sourceId]), 'Unknown source: ' + ref.sourceId);
      check(Array.isArray(ref.supports) && ref.supports.length > 0 && ref.supports.every(string), 'Missing supported claims: ' + e.id);
    }
    for (const c of e.correctionHistory || []) check(stamp(c.at) && string(c.reason) && string(c.previousSummary), 'Invalid correction history: ' + e.id);
  }
  for (const e of data.events) for (const id of e.relatedEventIds || []) check(ids.has(id) && id !== e.id, 'Unknown/self related event: ' + id);
  check(Array.isArray(data.changeLog), 'Missing public change log');
  for (const c of data.changeLog || []) check(string(c.id) && date(c.date) && string(c.title) && string(c.detail) && c.eventIds?.every(id => ids.has(id)), 'Invalid change-log entry');
  return errors;
}
