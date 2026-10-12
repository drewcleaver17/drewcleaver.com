import { facetKeys, valuesOf, matchesAny, validBoundary, subjectCatalog } from './nhi-filtering.mjs';
import { validatePeople } from './ufo-people.mjs';
import { institutionMilestone, institutionDomains, institutionTypes, uapStatusLabels } from './ufo-institutions.mjs';
export const categories = ['Encounters and observations', 'Reporting and disclosures', 'Hearings and oversight', 'Legislation and executive actions', 'Scientific research', 'Records releases', 'Corrections and case resolutions', 'Institutional history', 'Scientific and technical context', 'Business and financial history', 'Religious and esoteric history', 'Archaeology and cultural history'];
export const topics = ['UFO reports & disclosure', 'Remote viewing & consciousness', 'Intelligence & secrecy', 'Nuclear history', 'Space & SETI', 'Science & invention', 'Business & wartime finance', 'Religious texts & channeling', 'Human origins & evolution', 'Mind & philosophy', 'Ancient societies & archaeology'];
// Regional discovery groups are not evidence labels or claims of cultural identity.
export const regions = {'maya-world':'Maya world & Yucatán','mesoamerica':'Mexica & broader Mesoamerica','brazil-amazon':'Brazil & Amazon region','egypt':'Egypt & later interpretations'};
export const sourceKindLabels = { primary: 'Primary record', 'archival-history': 'Institutional or archival history', 'participant-account': 'Participant / organizational account', 'primary-mirror': 'Copy / translation of a primary record', scholarship: 'Scholarly analysis / reference', reprint: 'Reproduced announcement', 'original-reporting': 'Original reporting', reporting: 'Reporting' };
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
  { id: 'origins', label: 'Human origins / Early societies and material evidence', years: 'Deep time–1000 BCE', start: '-1000000', end: '-1000', summary: 'Read fossil ages, traces of symbolic behavior and early societies as evidence with limits. Biological evolution, cultural change and the recovery of written records are different processes.' },
  { id: 'ancient-texts', label: 'Ideas / Worlds, observation and texts', years: 'First millennium BCE–1499 CE', start: '-0999', end: '1499', summary: 'Compare arguments about the cosmos, mathematical astronomy, optical investigation and the transmission of texts. Shared questions do not establish direct influence.' },
  { id: 'foundations', label: 'Foundations / New scales and instruments', years: '1500–1939', start: '1500', end: '1939', summary: 'Follow changes in observation, physical theory, biology and communication. Credit belongs to collaborators and predecessors as well as familiar names.' },
  { id: 'war', label: 'History / War and the national-security state', years: '1940–1951', start: '1940', end: '1951', summary: 'Nuclear weapons, intelligence structures and the first postwar UFO investigations develop on different tracks.' },
  { id: 'cold-war', label: 'History / The Cold War and the space age', years: '1952–1969', start: '1952', end: '1969', summary: 'Reconnaissance, civilian spaceflight and official UFO studies expand. Their responsibilities and findings differ.' },
  { id: 'experiments', label: 'History / Experiments and contested results', years: '1970–1995', start: '1970', end: '1995', summary: 'Remote-viewing research, consciousness claims and retrospective record searches generate documents and disagreement.' },
  { id: 'archives', label: 'History / Archives and renewed attention', years: '1996–2016', start: '1996', end: '2016', summary: 'Declassification, encounters and donated collections make parts of the historical record easier to investigate.' },
  { id: 'attention', label: '01 / Renewed public attention', years: '2017–2021', start: '2017', end: '2021', summary: 'Reporting, released footage and an intelligence assessment put the question in public view.' },
  { id: 'oversight', label: '02 / Formal scrutiny', years: '2022–2024', start: '2022', end: '2024', summary: 'Hearings, scientific studies and legislation create distinct ways to ask for answers.' },
  { id: 'records', label: '03 / The expanding records trail', years: '2025 onward', start: '2025', end: '9999', summary: 'Records collections and disclosure channels grow. More material does not automatically mean more certainty.' }
];
export const dateRoles = { formation:'Formation', authorization:'Authorization', 'operational-start':'Operations begin', rename:'Name changes', transfer:'Responsibility transfers', closure:'Closure', 'public-acknowledgment':'Public acknowledgment', declassification:'Declassification', 'public-reference':'Public reference', designation:'Designation', milestone:'Milestone', incident:'Reported incident', publication:'Public publication', reporting:'Reporting date', composition:'Estimated composition', manuscript:'Estimated copying', session:'Attributed session dates', document:'Document date', research:'Research period', experiment:'Experiment', investigation:'Investigation period', 'field-campaign':'Field campaign', meeting:'Meeting dates', announcement:'Public announcement', statement:'Public statement', assessment:'Assessment date', release:'Public release', 'release-response':'Records-release response', 'evidence-age':'Estimated age of evidence', 'patent-grant':'Patent grant', demonstration:'Demonstration', submission:'Manuscript submission', presentation:'Presentation', foundation:'Institution founded', 'reported-wave-onset':'Reported wave begins', launch:'Launch', flight:'Flight', observation:'Observation', landing:'Landing' };
export const layerOf = e => e.layer || (e.context ? 'contextual' : 'core');
export const readingPathOf = e => e.readingPath || 'main';
export const calendarYear = value => Number(value?.match(/^(-?\d{4,})(?:-|$)/)?.[1]);
// Ordering coordinates only: these are not elapsed days or claimed incident precision.
export function calendarCoordinate(value, upper = false) {
  const match = String(value).match(/^(-?\d{4,})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!match) return NaN;
  return Number(match[1]) * 372 + Number(match[2] || (upper ? 12 : 1)) * 31 + Number(match[3] || (upper ? 31 : 1));
}
export function eventBounds(e) {
  if (e.date?.precision === 'age') {
    const a=e.date.age;
    return [(a.referenceYear-a.older)*372, (a.referenceYear-a.younger)*372];
  }
  return [calendarCoordinate(e.date?.start),calendarCoordinate(e.date?.end || e.date?.start,true)];
}
export const eraFor = e => eras.find(era => eventBounds(e)[0] >= calendarCoordinate(era.start) && eventBounds(e)[0] <= calendarCoordinate(era.end,true));
export const initialState = { q: '', from: '', to: '', category: [], topic: [], entity: [], evidence: [], region: [], layer: [], sort: 'oldest', view: 'journey', context: false };
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
  if (/^-\d{4,}$/.test(value)) return Math.abs(Number(value)).toLocaleString('en-US')+' BCE';
  const options = value.length === 4 ? { year: 'numeric' } : value.length === 7 ? { year: 'numeric', month: 'long' } : { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(dateBounds(value)[0] + 'T12:00:00Z'));
}
export const eventDateLabel = e => e.date.approximate ? e.date.label : formatDate(e.date.start) + (e.date.end ? ' – ' + formatDate(e.date.end) : '');
export function searchText(e, sources, entities = []) {
  const names = entities.filter(entity => e.entityIds?.includes(entity.id) || entity.eventIds.includes(e.id));
  return normalizeSearch([e.title, e.summary, e.significance, e.geography || '', e.culture || '', regions[e.region] || '', ...e.established, ...e.limitations, ...e.openQuestions, ...e.people, ...e.institutions, ...e.tags, ...e.categories, ...(e.topics || []), ...e.evidenceTypes, ...names.flatMap(n => [n.name, ...n.aliases, ...(n.legacySearchLabels || []), n.description,n.institutionalProfile?.acronym || '']), ...e.sources.map(s => sources[s.sourceId]?.title || '')].join(' '));
}
const filterIndexes=new WeakMap();
export function filterIndex(data) {
  if(filterIndexes.has(data))return filterIndexes.get(data);
  const catalog=subjectCatalog(data),subjectIds=new Map(data.events.map(e=>[e.id,[]]));
  for(const n of catalog)for(const id of n.eventIds)subjectIds.get(id)?.push(n.id);
  const records=data.events.map(e=>({event:e,bounds:eventBounds(e),text:searchText(e,data.sources,data.entities),institution:institutionMilestone(data,e),
    facets:{category:e.categories,topic:e.topics || ['UFO reports & disclosure'],evidence:e.evidenceTypes,region:e.region?[e.region]:[],layer:[layerOf(e)],entity:subjectIds.get(e.id)}}));
  const index={catalog,records};filterIndexes.set(data,index);return index;
}
function legacyEra(state) {
  const era=eras.find(e=>e.id===state.era);
  return era && !state.from && !state.to ? {...state,from:era.start,to:era.end==='9999'?'':era.end} : state;
}
export function eventMatcher(state,omitFacet='') {
  const s={...initialState,...legacyEra(state)};
  const terms=normalizeSearch(s.q.trim()).split(/\s+/).filter(Boolean);
  const selected=Object.fromEntries(facetKeys.map(key=>[key,valuesOf(s[key])]));
  const from=s.from?calendarCoordinate(s.from):-Infinity,to=s.to?calendarCoordinate(s.to,true):Infinity;
  return record=>{
    const {event:e,bounds,facets}=record;
    if(e.publicationStatus!=='published')return false;
    if(s.view==='story' && !s.context && (e.context || bounds[0]<calendarCoordinate('2017')))return false;
    if(s.view==='journey' && !s.context && readingPathOf(e)!=='main')return false;
    if(s.view==='institutions' && !record.institution)return false;
    if(s.view==='core' && layerOf(e)!=='core')return false;
    if((s.from && !validBoundary(s.from)) || (s.to && !validBoundary(s.to)))return false;
    if((s.from || s.to) && (!bounds.every(Number.isFinite) || !Number.isFinite(from) && s.from || !Number.isFinite(to) && s.to || from>to || bounds[1]<from || bounds[0]>to))return false;
    for(const key of facetKeys)if(key!==omitFacet && !matchesAny(selected[key],facets[key]))return false;
    return terms.every(term=>record.text.includes(term));
  };
}
export function filterEvents(data,state={}) {
  const index=filterIndex(data),s={...initialState,...state};
  // Accept previously shared exact names/aliases, but match through stable relationship IDs.
  s.entity=valuesOf(s.entity).map(value=>index.catalog.find(n=>n.id===value)?.id || index.catalog.find(n=>n.name===value || n.aliases.includes(value))?.id || value);
  return index.records.filter(eventMatcher(s)).map(r=>r.event).sort((a,b)=>{
    if(s.view==='recent')return b.revisedAt.localeCompare(a.revisedAt) || b.addedAt.localeCompare(a.addedAt) || a.id.localeCompare(b.id);
    const aDate=eventBounds(a)[0],bDate=eventBounds(b)[0];
    if(!Number.isFinite(aDate))return Number.isFinite(bDate)?1:a.id.localeCompare(b.id);
    if(!Number.isFinite(bDate))return -1;
    const comparison=aDate-bDate || a.id.localeCompare(b.id);
    return s.sort==='newest'?-comparison:comparison;
  });
}
// Each option count omits this facet's selected values; it is not an incremental count.
export function facetCounts(data,state,key) {
  const counts=new Map();
  for(const r of filterIndex(data).records.filter(eventMatcher(state,key)))for(const value of new Set(r.facets[key]))counts.set(value,(counts.get(value)||0)+1);
  return counts;
}
export function stateFromParams(params) {
  let s={...initialState};
  for(const key of Object.keys(s)) {
    if(facetKeys.includes(key))s[key]=valuesOf(params.getAll(key).map(v=>v.slice(0,500)));
    else if(key==='context')s.context=params.get(key)==='1';
    else if(params.has(key))s[key]=params.get(key).slice(0,500);
  }
  if(!['oldest','newest'].includes(s.sort))s.sort='oldest';
  if(!['journey','story','history','recent','core','institutions'].includes(s.view))s.view='journey';
  const allowed={category:categories,topic:topics,evidence:Object.keys(evidenceDefinitions),region:Object.keys(regions),layer:['core','contextual']};
  for(const [key,values] of Object.entries(allowed))s[key]=s[key].filter(value=>values.includes(value));
  for(const key of ['from','to'])if(!validBoundary(s[key]))s[key]='';
  s=legacyEra({...s,era:params.get('era')});delete s.era;
  // Invalid shared ranges must never be applied. The client displays an explanation.
  if(s.from && s.to && calendarCoordinate(s.from)>calendarCoordinate(s.to,true)){s.from='';s.to='';}
  return s;
}
export function paramsFromState(state) {
  const p=new URLSearchParams();
  for(const key of Object.keys(initialState)) {
    if(facetKeys.includes(key)){for(const value of valuesOf(state[key]))p.append(key,value);}
    else if(state[key] && state[key]!==initialState[key])p.set(key,key==='context'?'1':state[key]);
  }
  return p;
}
export function validateDataset(data, now = new Date()) {
  const errors = [];
  const check = (test, message) => { if (!test) errors.push(message); };
  const string = v => typeof v === 'string' && v.trim().length > 0;
  const date = v => {
    if (typeof v === 'string' && /^-\d{4}$/.test(v)) return Number(v)<0;
    if (typeof v !== 'string' || !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(v) || calendarYear(v)===0) return false;
    const [low] = dateBounds(v), d = new Date(low + 'T00:00:00Z');
    return !Number.isNaN(+d) && d.toISOString().slice(0, 10) === low && low <= now.toISOString().slice(0, 10);
  };
  const stamp = v => string(v) && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v)) && Date.parse(v) <= +now;
  check(data?.schemaVersion === 1, 'Unsupported schema version');
  check(data.contentModelVersion === undefined || [1,2,3,4,5,6].includes(data.contentModelVersion), 'Unsupported content model version');
  if (!Array.isArray(data?.events) || !data?.sources || !data?.meta) return [...errors, 'Missing events, sources or meta'];
  for (const key of ['lastCheckedAt', 'contentUpdatedAt']) check(stamp(data.meta[key]), 'Invalid meta.' + key);
  check(date(data.meta.researchCutoff), 'Invalid research cutoff');
  check(['active', 'awaiting review', 'setup incomplete', 'paused'].includes(data.meta.updateStatus), 'Invalid update status');
  for (const [id, s] of Object.entries(data.sources)) {
    check(s.id === id, 'Source ID mismatch: ' + id);
    for (const k of ['title', 'publisher', 'url', 'locator']) check(string(s[k]), 'Missing source ' + id + '.' + k);
    let safe = false; try { const u = new URL(s.url); safe = u.protocol === 'https:' && !u.username && !u.password; } catch {}
    check(safe, 'Unsafe source URL: ' + id);
    check(s.verification === 'supporting-text-read' || (data.contentModelVersion>=4 && s.verification==='metadata-and-preview-read' && data.sourceReviews?.[id]?.mode==='catalogue'), 'Source text not verified: ' + id);
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
    const age=e.date?.precision==='age';
    const a=e.date?.age;
    if(age) check(data.contentModelVersion>=4 && e.date.start===null && e.date.end===null && e.date.role==='evidence-age' && a && [a.older,a.younger,a.referenceYear,a.estimate,a.uncertainty].every(Number.isFinite) && a.older>=a.estimate && a.estimate>=a.younger && a.younger>0 && a.uncertainty>=0 && a.referenceYear>=1900 && a.referenceYear<=now.getUTCFullYear() && ['convention','uncertaintyConvention','confidence'].every(k=>string(a[k])), 'Invalid evidence age: '+e.id);
    else check(date(e.date?.start), 'Invalid event date: ' + e.id);
    check(e.date?.end === null || (date(e.date?.end) && calendarCoordinate(e.date.end,true) >= calendarCoordinate(e.date.start)), 'Invalid date range: ' + e.id);
    const precision = age ? 'age' : e.date?.end ? 'range' : /^-\d{4}$/.test(e.date?.start) ? 'year' : ({4:'year',7:'month',10:'day'})[e.date?.start?.length];
    check(e.date?.precision === precision, 'False date precision: ' + e.id);
    check(Boolean(dateRoles[e.date?.role]), 'Invalid date role: ' + e.id);
    if (age || e.date?.approximate !== undefined || e.date?.label !== undefined) check(e.date.approximate === true && (age || (precision === 'year' && /^-?\d{4}$/.test(e.date.start)) || (precision === 'range' && /^-?\d{4}$/.test(e.date.start) && /^-?\d{4}$/.test(e.date.end))) && string(e.date.label) && string(e.dateNotes), 'Unqualified approximate date: ' + e.id);
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
  if(data.contentModelVersion>=4) for(const e of data.events) {
    check(['main','supporting'].includes(e.readingPath), 'Missing reading path: '+e.id);
    if(e.institutionalHistory!==undefined)check(data.contentModelVersion>=5 && typeof e.institutionalHistory==='boolean','Invalid institutional milestone flag: '+e.id);
    if(e.supportingFor) check(e.readingPath==='supporting' && e.supportingFor.every(id=>ids.has(id) && id!==e.id), 'Invalid supporting record: '+e.id);
    for(const link of e.contextLinks || []) check(ids.has(link.eventId) && link.eventId!==e.id && link.type==='editorial-context' && string(link.note), 'Invalid contextual connection: '+e.id);
    if(e.checkReceipt) check(date(e.checkReceipt.checkedOn) && ['status','finding','limits'].every(k=>string(e.checkReceipt[k])) && e.checkReceipt.sourceIds?.length && e.checkReceipt.sourceIds.every(id=>data.sources[id]), 'Invalid event check receipt: '+e.id);
    if(e.mediaHistory) check(['title','edition','inspection'].every(k=>string(e.mediaHistory[k])) && date(e.mediaHistory.date), 'Invalid media history: '+e.id);
  }
  const entityIds = new Set(), aliasOwners = new Map();
  for (const n of data.entities || []) {
    check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(n.id || '') && !entityIds.has(n.id), 'Invalid/duplicate entity: ' + n.id); entityIds.add(n.id);
    check(string(n.name) && string(n.description) && ['person','organization','program','place','claimed organization','work / collection'].includes(n.type), 'Invalid entity record: ' + n.id);
    check(Array.isArray(n.aliases) && n.aliases.every(string), 'Invalid aliases: ' + n.id);
    if(data.contentModelVersion>=5)for(const label of [n.id,n.name,...(n.aliases||[])]) {
      const alias=normalizeSearch(label).trim(),owner=aliasOwners.get(alias);
      check(!owner || owner===n.id,'Ambiguous canonical alias: '+label+' ('+owner+', '+n.id+')');aliasOwners.set(alias,n.id);
    }
    if(n.legacySearchLabels)check(Array.isArray(n.legacySearchLabels) && n.legacySearchLabels.every(string), 'Invalid legacy search labels: '+n.id);
    check(Array.isArray(n.eventIds) && (n.eventIds.length || (data.contentModelVersion>=5 && n.institutionalProfile)) && n.eventIds.every(id => ids.has(id)), 'Unknown entity event: ' + n.id);
    check(n.sources?.length && n.sources.every(r => data.sources[r.sourceId] && r.supports?.length && r.supports.every(string)), 'Unsourced entity: ' + n.id);
    if(n.institutionalProfile) {
      const p=n.institutionalProfile;
      check(data.contentModelVersion>=5 && ['entityType','mission','relevance','uapNote'].every(k=>string(p[k])), 'Incomplete institutional profile: '+n.id);
      check(institutionTypes.includes(p.entityType) && Boolean(institutionDomains[p.domain]) && Boolean(uapStatusLabels[p.uapStatus]), 'Invalid institutional classification: '+n.id);
      check(typeof p.acronym==='string' && Array.isArray(p.attributes) && p.attributes.every(string) && Array.isArray(p.questions) && p.questions.every(string), 'Invalid institutional attributes: '+n.id);
      check(Array.isArray(p.milestoneIds) && p.milestoneIds.every(id=>ids.has(id) && n.eventIds.includes(id)), 'Unknown institutional milestone: '+n.id);
      check(p.sourceIds?.length && p.sourceIds.every(id=>data.sources[id] && n.sources.some(ref=>ref.sourceId===id)), 'Unsourced institutional profile: '+n.id);
      for(const period of p.attributePeriods || [])check(p.attributes.includes(period.attribute) && date(period.asOf) && (period.dateStart===null || date(period.dateStart)) && (period.dateEnd===null || date(period.dateEnd)) && period.sourceIds?.length && period.sourceIds.every(id=>p.sourceIds.includes(id)), 'Invalid institutional designation period: '+n.id);
      if(p.rosterRecord)check(date(p.rosterRecord.asOf) && string(p.rosterRecord.sponsor) && string(p.rosterRecord.administrator),'Incomplete dated roster snapshot: '+n.id);
    }
    if(n.featured) check(n.type==='person' && string(n.role) && string(n.contribution) && string(n.limitations), 'Incomplete featured person: '+n.id);
  }
  for (const e of data.events) if (e.entityIds) check(e.entityIds.every(id => entityIds.has(id)), 'Unknown event entity: ' + e.id);
  const relationIds = new Set();
  for (const r of data.relationships || []) {
    check(string(r.id) && !relationIds.has(r.id), 'Duplicate/invalid relationship'); relationIds.add(r.id);
    check(entityIds.has(r.from) && entityIds.has(r.to) && r.from !== r.to, 'Unknown/self relationship entity: ' + r.id);
    check(['Documented','Attributed','Historical context'].includes(r.status) && string(r.description) && string(r.limitations), 'Missing relationship boundary: ' + r.id);
    check((date(r.date?.start) || (data.contentModelVersion>=5 && r.date?.start===null && string(r.dateBasis))) && (r.date.end === null || (date(r.date.end) && (r.date.start===null || calendarCoordinate(r.date.end,true) >= calendarCoordinate(r.date.start)))), 'Invalid relationship dates: ' + r.id);
    check(Array.isArray(r.eventIds) && (r.eventIds.length || (data.contentModelVersion>=5 && string(r.dateBasis))) && r.eventIds.every(id => ids.has(id)), 'Unknown relationship event: ' + r.id);
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
    if(e.region !== undefined) check(Boolean(regions[e.region]), 'Invalid regional group: '+e.id);
    if(e.culture !== undefined) check(string(e.culture), 'Invalid culture: '+e.id);
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
  const relationTypes=['listed-shareholder','described-role','represented-by-firm','authored','reported-collaboration','chaired','donated-to','succeeded','commissioned','assessed','responds-to','testified','planned-exchange','co-authored-with','collaborated-with','acknowledged-assistance','created','supervised','funded','sponsored','operated','absorbed','renamed','contracted','collaborated','integrated'];
  if(data.contentModelVersion>=3) for(const r of data.relationships || []) check(relationTypes.includes(r.type), 'Invalid factual relationship type: '+r.id);
  for(const receipt of data.meta.checkReceipts || []) check(stamp(receipt.checkedAt) && string(receipt.scope) && string(receipt.mode) && string(receipt.basis) && receipt.sourceIds?.length && receipt.sourceIds.every(id=>data.sources[id]), 'Invalid check receipt');
  check(data.meta.contentUpdatedAt.slice(0,10)>=data.meta.researchCutoff, 'Research cutoff exceeds content update');
  return [...errors,...validatePeople(data,now)];
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
