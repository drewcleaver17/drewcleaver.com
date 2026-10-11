export const categories = ['Encounters and observations', 'Reporting and disclosures', 'Hearings and oversight', 'Legislation and executive actions', 'Scientific research', 'Records releases', 'Corrections and case resolutions', 'Institutional history', 'Scientific and technical context', 'Business and financial history', 'Religious and esoteric history'];
export const topics = ['UFO reports & disclosure', 'Remote viewing & consciousness', 'Intelligence & secrecy', 'Nuclear history', 'Space & SETI', 'Science & invention', 'Business & wartime finance', 'Religious texts & channeling'];
export const sourceKindLabels = { primary: 'Primary record', 'archival-history': 'Institutional or archival history', 'participant-account': 'Participant / organizational account', 'primary-mirror': 'Archival copy of a primary record', scholarship: 'Scholarly analysis / reference', reprint: 'Reproduced announcement', 'original-reporting': 'Original reporting', reporting: 'Reporting' };
export const evidenceDefinitions = {
  'Institutional record': 'A hearing, law, policy or release documented by the responsible institution. It verifies an action, not every claim within it.',
  'Institutional assessment': 'An agency’s stated analysis or conclusion, subject to its data and methods.',
  'Firsthand account': 'A person describes something they directly observed. Interpretation and measurement remain separate questions.',
  'Secondhand allegation': 'A claim relayed from other people or described records; underlying material is not publicly authenticated here.',
  'Sensor material': 'Images, video or instrument reports are involved. This label does not mean raw data or calibration are publicly available.',
  'Scientific assessment': 'A scientific study or methodological review, not necessarily a finding about a particular incident.',
  'Original reporting': 'Journalists’ own interviews or document reporting. Authentication of the underlying claims is separately stated.',
  'Reporting inspected': 'Supporting passages in reporting were read; an original may be inaccessible. This label does not imply independent corroboration by multiple outlets.',
  'Historical record': 'A dated document or an archival history supports a historical action. Its author, custodian and access limits matter.',
  'Attributed claim': 'The record establishes who made a claim, not that the claimed event or mechanism occurred.',
  'Organizational account': 'An institution or participant describes its own history or work; its interests and independent corroboration remain relevant.',
  'Textual scholarship': 'Scholars study manuscripts, editions or textual history. Dating and interpretation can remain contested; this is not verification of a text’s religious claims.'
};
export const eras = [
  { id: 'ancient-texts', label: 'Earlier / Texts and transmission', years: 'Ancient history', start: '0001', end: '1499', summary: 'Composition, copying and the later survival of religious texts are distinct questions. Estimated ranges are not exact dates.' },
  { id: 'foundations', label: 'Earlier / Ideas and institutions', years: '1500–1939', start: '1500', end: '1939', summary: 'Selected scientific and financial context. Inclusion here does not imply a UFO connection.' },
  { id: 'war', label: 'History / War and the national-security state', years: '1940–1951', start: '1940', end: '1951', summary: 'Nuclear weapons, intelligence structures and the first postwar UFO investigations develop on different tracks.' },
  { id: 'cold-war', label: 'History / The Cold War and the space age', years: '1952–1969', start: '1952', end: '1969', summary: 'Reconnaissance, civilian spaceflight and official UFO studies expand. Their responsibilities and findings differ.' },
  { id: 'experiments', label: 'History / Experiments and contested results', years: '1970–1995', start: '1970', end: '1995', summary: 'Remote-viewing research, consciousness claims and retrospective record searches generate documents and disagreement.' },
  { id: 'archives', label: 'History / Archives and renewed attention', years: '1996–2016', start: '1996', end: '2016', summary: 'Declassification, encounters and donated collections make parts of the historical record easier to investigate.' },
  { id: 'attention', label: '01 / Renewed public attention', years: '2017–2021', start: '2017', end: '2021', summary: 'Reporting, released footage and an intelligence assessment put the question in public view.' },
  { id: 'oversight', label: '02 / Formal scrutiny', years: '2022–2024', start: '2022', end: '2024', summary: 'Hearings, scientific studies and legislation create distinct ways to ask for answers.' },
  { id: 'records', label: '03 / The expanding records trail', years: '2025 onward', start: '2025', end: '9999', summary: 'Records collections and disclosure channels grow. More material does not automatically mean more certainty.' }
];
export const dateRoles = { milestone:'Milestone', incident:'Reported incident', publication:'Public publication', reporting:'Reporting date', composition:'Estimated composition', manuscript:'Estimated copying', session:'Attributed session dates', document:'Document date', research:'Research period', investigation:'Investigation period', 'field-campaign':'Field campaign', meeting:'Meeting dates', announcement:'Public announcement', statement:'Public statement', assessment:'Assessment date', release:'Public release', 'release-response':'Records-release response' };
export const layerOf = e => e.layer || (e.context ? 'contextual' : 'core');
export const eraFor = e => eras.find(era => e.date.start.slice(0,4) >= era.start && e.date.start.slice(0,4) <= era.end);
export function yearsCovered(events) {
  const years = new Set();
  for (const e of events) for (let year=Number(e.date.start.slice(0,4)); year<=Number((e.date.end || e.date.start).slice(0,4)); year++) years.add(String(year).padStart(4,'0'));
  return [...years].sort();
}
export const initialState = { layer: '', era: '', q: '', from: '', to: '', category: '', topic: '', entity: '', evidence: '', sort: 'oldest', view: 'story', context: false };
export const normalizeSearch = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
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
export const eventDateLabel = e => e.date.approximate ? e.date.label : formatDate(e.date.start) + (e.date.end ? ' – ' + formatDate(e.date.end) : '');
export function searchText(e, sources, entities = []) {
  const names = entities.filter(entity => e.entityIds?.includes(entity.id) || entity.eventIds.includes(e.id));
  return normalizeSearch([e.title, e.summary, e.significance, ...e.established, ...e.limitations, ...e.openQuestions, ...e.people, ...e.institutions, ...e.tags, ...e.categories, ...(e.topics || []), ...e.evidenceTypes, ...names.flatMap(n => [n.name, ...n.aliases, n.description]), ...e.sources.map(s => sources[s.sourceId]?.title || '')].join(' '));
}
export function filterEvents(data, state) {
  const s = { ...initialState, ...state };
  const terms = normalizeSearch(s.q.trim()).split(/\s+/).filter(Boolean);
  return data.events.filter(e => {
    if (e.publicationStatus !== 'published' || (s.view === 'story' && !s.context && (e.context || e.date.start < '2017'))) return false;
    if (s.view === 'core' && layerOf(e) !== 'core') return false;
    if (s.layer && layerOf(e) !== s.layer) return false;
    if (s.era) { const era=eras.find(x=>x.id===s.era); if (!era || dateBounds(e.date.end || e.date.start)[1] < era.start+'-01-01' || dateBounds(e.date.start)[0] > era.end+'-12-31') return false; }
    if (s.from && dateBounds(e.date.end || e.date.start)[1] < s.from) return false;
    if (s.to && dateBounds(e.date.start)[0] > s.to) return false;
    if (s.category && !e.categories.includes(s.category)) return false;
    if (s.topic && !(e.topics || ['UFO reports & disclosure']).includes(s.topic)) return false;
    if (s.entity && ![...e.people, ...e.institutions, ...(e.entityIds || [])].includes(s.entity) && !data.entities?.find(n => n.id === s.entity || n.name===s.entity || n.aliases.includes(s.entity))?.eventIds.includes(e.id)) return false;
    if (s.evidence && !e.evidenceTypes.includes(s.evidence)) return false;
    const haystack = searchText(e, data.sources, data.entities);
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
  if (!['story', 'history', 'recent', 'core'].includes(s.view)) s.view = 'story';
  if (!['', 'core', 'contextual'].includes(s.layer)) s.layer='';
  if (s.era && !eras.some(e=>e.id===s.era)) s.era='';
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
  check(data.contentModelVersion === undefined || [1,2,3].includes(data.contentModelVersion), 'Unsupported content model version');
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
    check(Boolean(sourceKindLabels[s.kind]), 'Invalid source kind: ' + id);
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
    check(Boolean(dateRoles[e.date?.role]), 'Invalid date role: ' + e.id);
    if (e.date?.approximate !== undefined || e.date?.label !== undefined) check(e.date.approximate === true && precision === 'range' && e.date.start.length === 4 && e.date.end?.length === 4 && string(e.date.label) && string(e.dateNotes), 'Unqualified approximate date: ' + e.id);
    for (const k of ['incidentDate', 'disclosureDate', 'publicationDate']) check(e[k] === null || date(e[k]), 'Invalid ' + k + ': ' + e.id);
    for (const k of ['addedAt', 'revisedAt', 'lastVerifiedAt']) check(stamp(e[k]), 'Invalid ' + k + ': ' + e.id);
    check(e.revisedAt >= e.addedAt, 'Revision predates addition: ' + e.id);
    for (const k of ['established','limitations','openQuestions','categories','people','institutions','evidenceTypes','tags','relatedEventIds','correctionHistory']) check(Array.isArray(e[k]), 'Missing array ' + k + ': ' + e.id);
    check(e.established?.length && e.limitations?.length, 'Missing evidence boundary: ' + e.id);
    check(e.categories?.length && e.categories.every(c => categories.includes(c)), 'Invalid category: ' + e.id);
    check(e.evidenceTypes?.length && e.evidenceTypes.every(k => evidenceDefinitions[k]), 'Invalid evidence type: ' + e.id);
    if (e.topics) check(e.topics.length && e.topics.every(t => topics.includes(t)), 'Invalid topic: ' + e.id);
    if (e.claimDate) check(date(e.claimDate.start) && string(e.claimDate.attribution) && string(e.claimDate.note), 'Unattributed or invalid claimed date: ' + e.id);
    if (e.dateNotes) check(string(e.dateNotes), 'Invalid date note: ' + e.id);
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
  const entityIds = new Set();
  for (const n of data.entities || []) {
    check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(n.id || '') && !entityIds.has(n.id), 'Invalid/duplicate entity: ' + n.id); entityIds.add(n.id);
    check(string(n.name) && string(n.description) && ['person','organization','program','place','claimed organization','work / collection'].includes(n.type), 'Invalid entity record: ' + n.id);
    check(Array.isArray(n.aliases) && n.aliases.every(string), 'Invalid aliases: ' + n.id);
    check(n.eventIds?.length && n.eventIds.every(id => ids.has(id)), 'Unknown entity event: ' + n.id);
    check(n.sources?.length && n.sources.every(r => data.sources[r.sourceId] && r.supports?.length && r.supports.every(string)), 'Unsourced entity: ' + n.id);
  }
  for (const e of data.events) if (e.entityIds) check(e.entityIds.every(id => entityIds.has(id)), 'Unknown event entity: ' + e.id);
  const relationIds = new Set();
  for (const r of data.relationships || []) {
    check(string(r.id) && !relationIds.has(r.id), 'Duplicate/invalid relationship'); relationIds.add(r.id);
    check(entityIds.has(r.from) && entityIds.has(r.to) && r.from !== r.to, 'Unknown/self relationship entity: ' + r.id);
    check(['Documented','Attributed','Historical context'].includes(r.status) && string(r.description) && string(r.limitations), 'Missing relationship boundary: ' + r.id);
    check(date(r.date?.start) && (r.date.end === null || (date(r.date.end) && r.date.end >= r.date.start)), 'Invalid relationship dates: ' + r.id);
    check(r.eventIds?.length && r.eventIds.every(id => ids.has(id)), 'Unknown relationship event: ' + r.id);
    check(r.sources?.length && r.sources.every(ref => data.sources[ref.sourceId] && ref.supports?.length && ref.supports.every(string)), 'Unsourced relationship: ' + r.id);
  }
  check(Array.isArray(data.changeLog), 'Missing public change log');
  for (const c of data.changeLog || []) check(string(c.id) && date(c.date) && string(c.title) && string(c.detail) && c.eventIds?.every(id => ids.has(id)), 'Invalid change-log entry');
  // Version 3 is additive: older importer payloads remain readable; a migrated dataset is strict.
  for (const [id, source] of Object.entries(data.sources)) {
    for (const field of ['documentDate','publicReleasedAt']) if (source[field] !== undefined) check(source[field] === null || date(source[field]), 'Invalid source '+field+': '+id);
    if (source.supersedes) check(source.supersedes !== id && Boolean(data.sources[source.supersedes]), 'Invalid source version: '+id);
  }
  for (const [id, review] of Object.entries(data.sourceReviews || {})) {
    check(Boolean(data.sources[id]), 'Unknown reviewed source: '+id);
    check(date(review.inspectedOn) && ['supporting-text','automatic-transcript','audiovisual','catalogue'].includes(review.mode) && ['scope','basis','originGroup','accessStatus'].every(k=>string(review[k])), 'Incomplete inspection record: '+id);
  }
  const occurrences = new Map();
  for (const e of data.events) {
    if (data.contentModelVersion >= 3) check(['core','contextual'].includes(e.layer) && string(e.occurrenceKey) && string(e.claimStatus), 'Missing layer, occurrence or claim status: '+e.id);
    for (const field of ['documentDate','publicReleasedAt']) if (e[field] !== undefined) check(e[field] === null || date(e[field]), 'Invalid '+field+': '+e.id);
    for (const field of ['geography','scientificStage']) if (e[field] !== undefined && e[field] !== null) check(string(e[field]), 'Invalid '+field+': '+e.id);
    for (const field of ['observedDomain','reportedDomain']) if (e[field] !== undefined && e[field] !== null) check(Array.isArray(e[field]) && e[field].every(x=>['air','space','water','ground','radio','laboratory'].includes(x)), 'Invalid '+field+': '+e.id);
    for (const link of e.relatedLinks || []) check(ids.has(link.eventId) && link.eventId!==e.id && string(link.type) && string(link.note) && link.sourceIds?.length && link.sourceIds.every(id=>data.sources[id]), 'Invalid typed event link: '+e.id);
    for (const c of e.correctionHistory || []) if(c.sourceIds) check(c.sourceIds.every(id=>data.sources[id]), 'Unknown correction source: '+e.id);
    const videoURLs = eventYouTubeURLs(e, data.sources);
    const selected=e.selectedVideo;
    if (selected) {
      check(['title','channel','url','inspectionMode','usefulTimestamp','selectionReason','scopeNote'].every(k=>string(selected[k])) && date(selected.uploadDate), 'Incomplete selected video: '+e.id);
      if(selected.runtime) check(/^\d+:\d{2}(?::\d{2})?$/.test(selected.runtime), 'Invalid video runtime: '+e.id);
    }
    const occurrence=e.occurrenceKey || e.id, videos=occurrences.get(occurrence) || new Set();
    for (const url of videoURLs) {
      const video=normalizeYouTubeURL(url);
      check(Boolean(video), 'Invalid YouTube selection or playlist: '+e.id);
      if(video) {videos.add(video.id);check(selected && normalizeYouTubeURL(selected.url)?.id===video.id, 'Unannotated supplementary YouTube video: '+e.id);}
    }
    occurrences.set(occurrence,videos);
  }
  for (const [occurrence,videos] of occurrences) check(videos.size<=1, 'Multiple YouTube videos for occurrence: '+occurrence);
  const relationTypes=['listed-shareholder','described-role','represented-by-firm','authored','reported-collaboration','chaired','donated-to','succeeded','commissioned','assessed','responds-to','testified','planned-exchange'];
  if(data.contentModelVersion>=3) for(const r of data.relationships || []) check(relationTypes.includes(r.type), 'Invalid factual relationship type: '+r.id);
  for(const receipt of data.meta.checkReceipts || []) check(stamp(receipt.checkedAt) && string(receipt.scope) && string(receipt.mode) && string(receipt.basis) && receipt.sourceIds?.length && receipt.sourceIds.every(id=>data.sources[id]), 'Invalid check receipt');
  check(data.meta.contentUpdatedAt.slice(0,10)>=data.meta.researchCutoff, 'Research cutoff exceeds content update');
  return errors;
}

export function normalizeYouTubeURL(value) {
  try {
    const u=new URL(value), host=u.hostname.toLowerCase().replace(/^www\./,'');
    if(!['youtube.com','m.youtube.com','youtu.be','youtube-nocookie.com'].includes(host) || u.searchParams.has('list')) return null;
    const id=host==='youtu.be' ? u.pathname.slice(1) : u.pathname==='/watch' ? u.searchParams.get('v') : /^\/(embed|shorts|live)\//.test(u.pathname) ? u.pathname.split('/')[2] : null;
    return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? {id,url:'https://www.youtube.com/watch?v='+id} : null;
  } catch {return null;}
}
export function eventYouTubeURLs(event, sources) {
  const strings=[];
  const walk=value=>{if(typeof value==='string') strings.push(value); else if(Array.isArray(value)) value.forEach(walk); else if(value && typeof value==='object') for(const [k,v] of Object.entries(value)) if(k!=='correctionHistory') walk(v);};
  walk(event);
  for(const ref of event.sources || []) if(sources[ref.sourceId]) walk(sources[ref.sourceId]);
  return strings.flatMap(s=>s.match(/https?:\/\/(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be)\/[^\s<>"']+/g) || []);
}
