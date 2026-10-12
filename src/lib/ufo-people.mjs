import { valuesOf, matchesAny } from './nhi-filtering.mjs';
/**
 * The canonical people and shared works live in timeline.json.
 * These projections are build products, never a second editorial database.
 * @typedef {'science'|'engineering'|'philosophy'|'research'|'journalism'|'witness'|'government'|'culture'} PersonRole
 * @typedef {{workId:string, role:string, relation:'by'|'primary-record'|'about'}} PersonWork
 * @typedef {{text:string,sourceIds:string[]}} Contribution
 * @typedef {{src:string,width:number,height:number,kind:string,alt:string,creator:string,license:string,licenseUrl:string,sourceUrl:string,attribution:string,modification:string,verifiedOn:string}} Portrait
 * @typedef {{identityStatus:'resolved'|'unresolved',roleGroups:PersonRole[],relevance:string,contributions:Contribution[],workRefs:PersonWork[],verifiedOn:string,verificationScope:string,identityNote?:string,portrait?:Portrait}} PersonProfile
 */
export const personRoles = {
  science: 'Science', engineering: 'Engineering & invention', philosophy: 'Philosophy',
  research: 'Research & investigation', journalism: 'Journalism', witness: 'Witnesses & participants',
  government: 'Government & military', culture: 'Texts & cultural history'
};
export const workTypes = ['Book','Academic paper','Journalism','Report','Testimony','Patent','Archival document','Interview','Correspondence','Primary text'];
export const accessLabels = ['Full text','Abstract','Preview','Publisher details','Bibliographic details','Subscription','Archival record'];
export const personURL = id => `/nhi/people/${encodeURIComponent(id)}/`;
export const personTimelineURL = id => `/nhi/?view=history&entity=${encodeURIComponent(id)}#timeline`;
export const normalisePersonSearch = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const shortDescription = text => {
  const words = text.split(/\s+/);
  return words.length > 27 ? words.slice(0,27).join(' ').replace(/[.,;:]$/,'') + '…' : text;
};
export function personInstitutions(person,data) {
  const direct = data.relationships.filter(r => r.from===person.id || r.to===person.id)
    .map(r => data.entities.find(n => n.id===(r.from===person.id?r.to:r.from)))
    .filter(n => n && ['organization','program'].includes(n.type));
  // Event-associated institutions aid retrieval; they are not asserted employers.
  const associated = data.events.filter(e => person.eventIds.includes(e.id)).flatMap(e => e.institutions);
  return [...new Set([...direct.map(n=>n.name),...associated])];
}
export function directoryIndex(data) {
  return data.entities.filter(n=>n.type==='person').sort((a,b)=>a.name.localeCompare(b.name,'en'))
    .map(n=>({id:n.id,name:n.name,featured:Boolean(n.featured),roles:n.personProfile?.roleGroups || [],
      search:normalisePersonSearch([n.name,...n.aliases,n.role,...(n.personProfile?.roleGroups || []).map(r=>personRoles[r]),
        ...(n.personProfile?.workRefs || []).map(r=>data.works?.[r.workId]?.title || ''),
        ...personInstitutions(n,data)].join(' '))}));
}
export const peopleInitialState = {q:'',role:[],featured:false,sort:'az',person:''};
export function peopleStateFromParams(params) {
  return {q:(params.get('q') || '').slice(0,500),role:valuesOf(params.getAll('role')).filter(role=>personRoles[role]),
    featured:params.get('featured')==='1',sort:params.get('sort')==='za'?'za':'az',person:params.get('person') || ''};
}
export function peopleParams(state) {
  const params = new URLSearchParams();
  for(const key of ['q','person'])if(state[key])params.set(key,state[key]);
  for(const role of valuesOf(state.role))params.append('role',role);
  if(state.featured)params.set('featured','1');if(state.sort==='za')params.set('sort','za');return params;
}
export function filterPeople(index,state={}) {
  const terms=normalisePersonSearch(state.q || '').trim().split(/\s+/).filter(Boolean);
  const result=index.filter(n=>(!state.featured || n.featured) && matchesAny(state.role,n.roles) && terms.every(t=>n.search.includes(t)));
  return state.sort==='za'?[...result].reverse():result;
}
export function timelineProjection(data) {
  const {works,...timeline}=data;
  return {...timeline,entities:data.entities.map(n=>{
    if(n.type!=='person')return n;
    const {personProfile,...entity}=n;
    return {...entity,description:shortDescription(n.description)};
  })};
}
export function validatePeople(data,now=new Date()) {
  if(data.contentModelVersion<6)return [];
  const errors=[], check=(ok,message)=>{if(!ok)errors.push(message);};
  const text=x=>typeof x==='string' && Boolean(x.trim());
  const date=x=>/^\d{4}-\d{2}-\d{2}$/.test(x || '') && Number.isFinite(Date.parse(x)) && x<=now.toISOString().slice(0,10);
  const safe=x=>{try {const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password;} catch{return false;}};
  const refs=x=>Array.isArray(x) && x.length && x.every(id=>Boolean(data.sources[id]));
  check(data.works && typeof data.works==='object' && !Array.isArray(data.works),'Missing shared works registry');
  for(const [id,w] of Object.entries(data.works || {})) {
    check(w.id===id && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id),'Invalid work ID: '+id);
    check(['title','year','publisher','blurb','inspectionScope'].every(k=>text(w[k])),'Incomplete work: '+id);
    check(workTypes.includes(w.type) && date(w.verifiedOn),'Invalid work type/check date: '+id);
    check(refs(w.sourceIds),'Unsourced work: '+id);
    check(w.links?.length && w.links.every(l=>safe(l.url) && accessLabels.includes(l.label) && w.sourceIds.includes(l.sourceId)),'Invalid work access link: '+id);
  }
  for(const n of data.entities) {
    if(n.type!=='person') {check(!n.personProfile,'Non-person has a person profile: '+n.id);continue;}
    const p=n.personProfile;
    if(!p){errors.push('Missing person profile: '+n.id);continue;}
    check(text(n.role) && ['resolved','unresolved'].includes(p.identityStatus),'Incomplete person identity: '+n.id);
    check(p.identityStatus!=='unresolved' || text(p.identityNote),'Unexplained identity exception: '+n.id);
    check(p.roleGroups?.length && p.roleGroups.every(r=>personRoles[r]) && new Set(p.roleGroups).size===p.roleGroups.length,'Invalid person roles: '+n.id);
    check(text(p.relevance) && text(p.verificationScope) && date(p.verifiedOn),'Incomplete person scope: '+n.id);
    check(p.contributions?.length && p.contributions.every(c=>text(c.text) && refs(c.sourceIds)),'Unsourced person contribution: '+n.id);
    check(Array.isArray(p.workRefs) && p.workRefs.every(r=>data.works?.[r.workId] && text(r.role) && ['by','primary-record','about'].includes(r.relation)),'Invalid person/work relationship: '+n.id);
    check(new Set(p.workRefs?.map(r=>r.workId)).size===p.workRefs?.length,'Duplicate work on person: '+n.id);
    if(p.portrait) {
      const i=p.portrait;
      check(/^\/images\/ufos\/people\/[a-z0-9-]+\.(webp|jpg|png)$/.test(i.src) && i.width>0 && i.height>0,'Invalid local portrait: '+n.id);
      check(['Photograph','Historical portrait','Later depiction'].includes(i.kind) && ['alt','creator','license','attribution','modification'].every(k=>text(i[k])),'Incomplete portrait provenance: '+n.id);
      check(safe(i.sourceUrl) && safe(i.licenseUrl) && date(i.verifiedOn),'Invalid portrait sources: '+n.id);
    }
  }
  return errors;
}
