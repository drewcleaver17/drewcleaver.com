import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {filterEvents,facetCounts,stateFromParams,paramsFromState,initialState} from '../src/lib/ufos.mjs';
import {facetKeys,subjectCatalog,searchSubjects,subjectType,validateDateDraft,quickRanges,rangeLabel} from '../src/lib/nhi-filtering.mjs';
const data=JSON.parse(readFileSync(new URL('../src/data/ufos/timeline.json',import.meta.url)));
const ids=state=>filterEvents(data,{view:'history',...state}).map(e=>e.id);
const a='Scientific research',b='Institutional history';
test('categories union without duplicates; other facets and dates intersect; one group clears independently',()=>{
 const both=ids({category:[a,b]});assert.deepEqual(new Set(both),new Set([...ids({category:[a]}),...ids({category:[b]})]));assert.equal(both.length,new Set(both).size);
 const state={category:[a,b],evidence:['Scientific assessment','Historical record'],region:['brazil-amazon'],from:'2000',to:'2026'};
 const results=filterEvents(data,{view:'history',...state});assert.ok(results.length>0);
 for(const e of results){assert.ok(e.categories.some(c=>[a,b].includes(c)));assert.ok(e.evidenceTypes.some(t=>state.evidence.includes(t)));assert.equal(e.region,'brazil-amazon');}
 assert.ok(ids({...state,region:[]}).length>=results.length);assert.ok(ids({...state,category:[]}).every(id=>ids({evidence:state.evidence,region:state.region,from:state.from,to:state.to}).includes(id)));
});
const draft=(from,to,fromEra='CE',toEra='CE')=>validateDateDraft({from,to,fromEra,toEra});
test('date editor supports open, same-year, BCE/CE and rejects fractional, incomplete, zero and reversed bounds',()=>{
 assert.deepEqual(draft('500','500','BCE','CE').bounds,{from:'-0500',to:'0500'});
 for(const [from,to,fromEra,toEra] of [['0',''],['12.5',''],['-',''],['1947','1946'],['500','1000','BCE','BCE'],['1','1','CE','BCE']])assert.equal(draft(from,to,fromEra,toEra).valid,false);
 for(const args of [['',''],['500','','BCE'],['','500'],['1947','1947'],['1000','500','BCE','BCE'],['1','1','BCE','CE']])assert.ok(draft(...args).valid);
 assert.equal(rangeLabel('-0500','0500'),'500 BCE–500 CE');assert.equal(rangeLabel('1947','2026'),'1947–2026 CE');
 assert.equal(quickRanges(2031).at(-1).to,'2031');
});
const fixture=()=>{
 const base=structuredClone(data.events[10]);const record=(id,start,end=null,extra={})=>({...base,id,entityIds:[],people:[],institutions:[],date:{precision:end?'range':'year',start,end,...extra}});
 return {sources:data.sources,entities:[],events:[record('span','1200','1400'),record('year','1300'),record('bce','-0500','-0100',{approximate:true,label:'c. 500–100 BCE'}),record('transition','-0001','0001'),record('undated',null),record('modern-discovery','2013')]};
};
test('inclusive interval overlap, BCE ordering/transition, approximate and undated records use timeline dates',()=>{
 const f=fixture(),select=(from='',to='')=>filterEvents(f,{view:'history',from,to}).map(e=>e.id);
 assert.deepEqual(select('1300','1350'),['span','year']);assert.deepEqual(select('1400','1400'),['span']);assert.deepEqual(select('1401','1500'),[]);
 assert.deepEqual(select('-0500','0500'),['bce','transition']);assert.deepEqual(select('-0100','-0100'),['bce']);assert.deepEqual(select('-0001','0001'),['transition']);
 assert.ok(select().includes('undated'));assert.ok(!select('0001').includes('undated'));assert.ok(!select('1200','1400').includes('modern-discovery'));assert.equal(f.events[2].date.label,'c. 500–100 BCE');
 assert.deepEqual(select('1300','1300'),['span','year']);assert.deepEqual(select('1400','1200'),[]);
});
test('repeated URL parameters preserve result IDs, accents and legacy singleton/era/day links',()=>{
 const state={...initialState,view:'history',category:[a,b],entity:['carl-sagan','jacques-vallee'],from:'-0500',to:'2026',q:'',sort:'newest'};
 const params=paramsFromState(state);assert.equal(params.getAll('category').length,2);const restored=stateFromParams(params);assert.deepEqual(restored,state);assert.deepEqual(ids(restored),ids(state));
 assert.deepEqual(stateFromParams(new URLSearchParams('category=Scientific+research')).category,[a]);
 assert.deepEqual(stateFromParams(new URLSearchParams('view=history&era=archives')).from,'1996');
 assert.equal(stateFromParams(new URLSearchParams('from=1947-06-01&to=1947-07-31')).from,'1947-06-01');
 for(const query of ['from=0000','from=2026&to=1947','from=2026-02-30'])assert.equal(stateFromParams(new URLSearchParams(query)).from,'');
 assert.deepEqual(stateFromParams(new URLSearchParams('region=removed&category=removed')).region,[]);
});
test('full catalog search finds last subject, verified aliases and accents, with exact/prefix ordering',()=>{
 const catalog=subjectCatalog(data),last=catalog.at(-1);assert.ok(catalog.length>500);assert.equal(searchSubjects(catalog,last.name)[0].id,last.id);
 const alias=catalog.find(n=>n.aliases.length && n.aliases[0]!==n.name);assert.ok(searchSubjects(catalog,alias.aliases[0]).some(n=>n.id===alias.id));
 assert.equal(searchSubjects(catalog,'Jean-Francois Champollion')[0].id,'jean-francois-champollion');
 assert.equal(searchSubjects(catalog,'ALH84001')[0].type,'work / collection');assert.equal(subjectType(searchSubjects(catalog,'ALH84001')[0]),'Subject');
 const matches=searchSubjects([{id:'b',name:'Alpha beta',aliases:[]},{id:'c',name:'Other Alpha',aliases:[]},{id:'a',name:'Alpha',aliases:[]}],'alpha');assert.deepEqual(matches.map(n=>n.id),['a','b','c']);
 assert.deepEqual(ids({entity:[last.id]}),filterEvents(data,{view:'history',entity:last.id}).map(e=>e.id));
 const legacy=catalog.find(n=>n.id.startsWith('entry-name:'));assert.ok(ids({entity:[legacy.id]}).length>0);assert.deepEqual(ids({entity:[legacy.name]}),ids({entity:[legacy.id]}));
});
test('contextual counts omit only their own facet and keep zero-count selected choices',()=>{
 const state={view:'history',category:[a,b],region:['egypt'],from:'1800'};
 const counts=facetCounts(data,state,'category');for(const category of [a,b])assert.equal(counts.get(category)||0,ids({...state,category:[category]}).length);
 assert.deepEqual([...facetCounts(data,{...state,category:[]},'category')],[...counts]);
});
test('full-dataset predicates and all contextual counts stay inexpensive after indexing',()=>{
 ids({});const start=performance.now();for(let i=0;i<20;i++){ids({category:[a,b],q:'science'});for(const facet of facetKeys)facetCounts(data,{view:'history',category:[a,b]},facet);}
 const elapsed=performance.now()-start;console.log(`Full dataset: ${data.events.length} entries, ${subjectCatalog(data).length} subjects; 20 filter/count cycles ${elapsed.toFixed(1)}ms`);assert.ok(elapsed<3000);
});

test('People roles and institutional facets also union values without inheriting timeline constraints',async()=>{
 const {directoryIndex,filterPeople,peopleParams,peopleStateFromParams}=await import('../src/lib/ufo-people.mjs');const index=directoryIndex(data);
 const roles={role:['science','research'],sort:'az',q:'',featured:false,person:''};assert.deepEqual(peopleStateFromParams(peopleParams(roles)),roles);
 assert.deepEqual(new Set(filterPeople(index,roles).map(n=>n.id)),new Set([...filterPeople(index,{role:'science'}),...filterPeople(index,{role:'research'})].map(n=>n.id)));
 const {filterInstitutions,institutionStateFromParams}=await import('../src/lib/ufo-institutions.mjs');const state=institutionStateFromParams(new URLSearchParams('idomain=naval&idomain=space&itype=Program&itype=Sensor+system'));
 const results=filterInstitutions(data.entities,state);assert.ok(results.length>0);assert.ok(results.every(n=>['naval','space'].includes(n.institutionalProfile.domain) && ['Program','Sensor system'].includes(n.institutionalProfile.entityType)));
});
