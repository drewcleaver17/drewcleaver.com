// URL facets use repeated parameters. Legacy scalar values remain accepted at the API boundary.
export const facetKeys = ['topic','category','evidence','region','layer','entity'];
export const valuesOf = value => [...new Set((Array.isArray(value) ? value : value ? [value] : []).filter(v=>typeof v==='string' && v))];
export const matchesAny = (selected, available) => !valuesOf(selected).length || valuesOf(selected).some(value=>available.includes(value));
export const fold = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const encodeYear = year => (year<0?'-':'')+String(Math.abs(year)).padStart(4,'0');
export function validBoundary(value) {
  const match=String(value || '').match(/^(-?\d{4,})(?:-(\d{2})-(\d{2}))?$/);
  if(!match || !Number.isSafeInteger(Number(match[1])*372) || Number(match[1])===0)return false;
  if(!match[2])return true;
  const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
  const leap=year%4===0 && (year%100!==0 || year%400===0);
  return month>=1 && month<=12 && day>=1 && day<=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][month-1];
}
export function boundaryYear(value) { return Number(String(value).match(/^-?\d+/)?.[0]); }
export function validateDateDraft(draft) {
  const bounds={},errors={};
  for(const key of ['from','to']) {
    const value=String(draft[key] || '').trim();
    if(!value){bounds[key]='';continue;}
    if(!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)*372))errors[key]='Enter a whole year using digits, or leave it blank.';
    else if(Number(value)===0)errors[key]='There is no year zero. Use 1 BCE or 1 CE.';
    else bounds[key]=encodeYear(Number(value)*(draft[key+'Era']==='BCE'?-1:1));
  }
  if(!Object.keys(errors).length && bounds.from && bounds.to && boundaryYear(bounds.from)>boundaryYear(bounds.to))errors.to='The To year must be the same as or later than the From year. Check BCE/CE too.';
  return {valid:!Object.keys(errors).length,bounds,errors};
}
export const boundaryLabel=value=>`${Math.abs(boundaryYear(value))} ${boundaryYear(value)<0?'BCE':'CE'}`;
export function rangeLabel(from,to) {
  // Preserve precision in older, day-specific shared links until the reader edits them.
  if([from,to].some(v=>v && /^-?\d{4,}-\d{2}-\d{2}$/.test(v)))return [from&&`From ${from}`,to&&`through ${to}`].filter(Boolean).join(' ');
  if(!from && !to)return 'Any date';
  if(!from)return `Through ${boundaryLabel(to)} (inclusive)`;
  if(!to)return `From ${boundaryLabel(from)} onward`;
  if(from===to)return boundaryLabel(from);
  if((boundaryYear(from)<0)===(boundaryYear(to)<0))return `${Math.abs(boundaryYear(from))}–${boundaryLabel(to)}`;
  return `${boundaryLabel(from)}–${boundaryLabel(to)}`;
}
export const quickRanges=(year=new Date().getUTCFullYear())=>[
  {id:'bce',label:'Before 1 CE (BCE)',from:'',to:'-0001'},
  {id:'early',label:'1–1499 CE',from:'0001',to:'1499'},
  {id:'1500',label:'1500–1799 CE',from:'1500',to:'1799'},
  {id:'1800',label:'1800–1899 CE',from:'1800',to:'1899'},
  {id:'1900',label:'1900–1945 CE',from:'1900',to:'1945'},
  {id:'1946',label:'1946–1999 CE',from:'1946',to:'1999'},
  {id:'2000',label:`2000–present (${year} CE)`,from:'2000',to:encodeYear(year)}
];

const catalogs=new WeakMap();
export function subjectCatalog(data) {
  if(catalogs.has(data))return catalogs.get(data);
  const catalog=(data.entities || []).map(n=>({...n,aliases:[...(n.aliases || []),...(n.legacySearchLabels || [])],eventIds:[...(n.eventIds || [])]}));
  const byLabel=new Map();
  for(const n of catalog)for(const label of [n.name,...n.aliases]){if(!byLabel.has(label))byLabel.set(label,[]);byLabel.get(label).push(n);}
  for(const e of data.events) {
    for(const label of [...(e.people || []),...(e.institutions || [])]) {
      // These are exact, explicit legacy relationship fields, never prose or inferred aliases.
      if(!byLabel.has(label)) {
        const n={id:'entry-name:'+label,name:label,aliases:[],type:'subject',description:'Named in the entry’s people or institutions field; no separate typed profile.',eventIds:[]};
        catalog.push(n);byLabel.set(label,[n]);
      }
      for(const n of byLabel.get(label))if(!n.eventIds.includes(e.id))n.eventIds.push(e.id);
    }
    for(const n of catalog)if(e.entityIds?.includes(n.id) && !n.eventIds.includes(e.id))n.eventIds.push(e.id);
  }
  catalog.sort((a,b)=>a.name.localeCompare(b.name,'en') || a.id.localeCompare(b.id));
  catalogs.set(data,catalog);return catalog;
}
export const subjectType = n => ({person:'Person',organization:'Organization',program:'Program',place:'Place','claimed organization':'Claimed organization'}[n.type] || 'Subject');
export function searchSubjects(catalog,query) {
  const q=fold(query).trim();if(!q)return catalog;
  return catalog.map(n=>{const labels=[n.name,...(n.aliases || [])].map(fold);const rank=labels.some(t=>t===q)?0:labels.some(t=>t.startsWith(q))?1:labels.some(t=>q.split(/\s+/).every(word=>t.includes(word)))?2:3;return {n,rank};})
    .filter(x=>x.rank<3).sort((a,b)=>a.rank-b.rank || a.n.name.localeCompare(b.n.name,'en') || a.n.id.localeCompare(b.n.id)).map(x=>x.n);
}
