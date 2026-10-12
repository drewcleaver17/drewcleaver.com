// Institutional dossiers use the canonical entity registry; no second identity store.
export const institutionDomains = { naval:'Navy & undersea', space:'Space & reconnaissance', intelligence:'Intelligence', research:'Research centers', nuclear:'Energy & nuclear institutions', oversight:'Oversight & UAP offices' };
export const uapStatusLabels = { 'context-only':'Institutional context', 'documented-role':'Documented UAP role', 'attributed-claim':'Attributed UAP claim', unverified:'UAP association unverified' };
export const institutionParamKeys = ['iq','itype','idomain','iuap','idesignation'];
export const institutionTypes = ['Federal department','Federal agency','Independent agency','Intelligence component','Military service','Military command','Military office','Government laboratory','Interagency arrangement','Research center','Nonprofit operator','University','Private contractor','Program','Sensor system','Facility','Oversight body','Claimed entity','Directorate','Federal office','Research organization','Governance framework'];
const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function institutionStateFromParams(params) {
  return Object.fromEntries(institutionParamKeys.map(key=>[key,(params.get(key)||'').slice(0,500)]));
}
export function filterInstitutions(entities,state={}) {
  const terms=normalize(state.iq).trim().split(/\s+/).filter(Boolean);
  return entities.filter(n=>{
    const p=n.institutionalProfile;
    if(!p || (state.itype && state.itype!==p.entityType) || (state.idomain && state.idomain!==p.domain) || (state.iuap && state.iuap!==p.uapStatus) || (state.idesignation && !p.attributes.includes(state.idesignation))) return false;
    const text=normalize([n.name,...n.aliases,p.acronym,p.entityType,...p.attributes,p.mission,p.relevance,p.uapNote,...p.questions,...Object.values(p.rosterRecord||{})].join(' '));
    return terms.every(term=>text.includes(term));
  }).sort((a,b)=>a.name.localeCompare(b.name));
}
export const institutionMilestone = (data,event) => Boolean(event.institutionalHistory) || (data.entities||[]).some(n=>n.institutionalProfile?.milestoneIds.includes(event.id));
