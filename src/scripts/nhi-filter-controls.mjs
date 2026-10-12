import { facetKeys, valuesOf, subjectCatalog, subjectType, searchSubjects, validateDateDraft, boundaryYear, rangeLabel, quickRanges } from '../lib/nhi-filtering.mjs';
import { facetCounts, regions } from '../lib/ufos.mjs';
const facetLabels={topic:'Topic',category:'Category',evidence:'Evidence',region:'Regional collection',layer:'Layer',entity:'Subject'};
export function initTimelineFilterControls(data,getState,update) {
  const form=document.getElementById('timeline-filters'),catalog=subjectCatalog(data),byId=new Map(catalog.map(n=>[n.id,n]));
  const subjectInput=document.getElementById('entity-search'),list=document.getElementById('entity-choices'),selected=document.getElementById('selected-entities');
  const chips=document.getElementById('active-filters'),moreChips=document.getElementById('more-filters');
  const rangeStatus=document.getElementById('date-status'),preset=document.getElementById('date-preset');
  let limit=10,subjectQuery='',subjectTimer,expandedChips=false,draftDirty=false,renderedIDs='',counts=new Map();
  const ranges=quickRanges();
  for(const range of ranges){const option=document.createElement('option');option.value=range.id;option.textContent=range.label;preset.append(option);}
  const input=key=>form.elements.namedItem(key);
  const focusFacet=key=>{const target=key==='entity'?subjectInput:key==='date'?input('from'):form.querySelector(`[name="${key}"]`);target?.focus({preventScroll:true});};
  function fillDates() {
    const state=getState();draftDirty=false;
    for(const key of ['from','to']){input(key).value=state[key]?Math.abs(boundaryYear(state[key])):'';input(key+'Era').value=state[key] && boundaryYear(state[key])<0?'BCE':'CE';input(key).removeAttribute('aria-invalid');document.getElementById(key+'-error').hidden=true;}
    preset.value=ranges.find(r=>r.from===state.from && r.to===state.to)?.id || '';
    rangeStatus.textContent=[state.from,state.to].some(v=>/^-?\d{4,}-\d{2}-\d{2}$/.test(v))?'This older link uses exact day bounds. Apply date range to switch to whole years.':'';
  }
  function dateDraft() { return Object.fromEntries(['from','to','fromEra','toEra'].map(key=>[key,input(key).value])); }
  function checkDraft() {
    const result=validateDateDraft(dateDraft());
    for(const key of ['from','to']){const error=document.getElementById(key+'-error');error.textContent=result.errors[key] || '';error.hidden=!result.errors[key];input(key).setAttribute('aria-invalid',String(Boolean(result.errors[key])));}
    rangeStatus.textContent=result.valid?'Date edits not applied. Select Apply date range.':'Date edits not applied. Previous results are unchanged.';
    return result;
  }
  function applyDate() {
    const result=checkDraft();if(!result.valid){focusFacet('date');return;}
    draftDirty=false;update(result.bounds);fillDates();rangeStatus.textContent='Date range applied.';
  }
  function clearDate(){draftDirty=false;update({from:'',to:''});fillDates();}
  for(const key of ['from','to','fromEra','toEra'])input(key).addEventListener(key.endsWith('Era')?'change':'input',()=>{draftDirty=true;preset.value='';checkDraft();});
  document.getElementById('apply-date').addEventListener('click',applyDate);
  document.getElementById('clear-date').addEventListener('click',clearDate);
  document.getElementById('empty-date').addEventListener('click',()=>{clearDate();document.getElementById('results-summary').focus({preventScroll:true});});
  preset.addEventListener('change',()=>{const range=ranges.find(r=>r.id===preset.value);if(range){draftDirty=false;update({from:range.from,to:range.to});fillDates();}});
  form.addEventListener('keydown',event=>{if(event.key==='Enter' && event.target.closest('#date-range')){event.preventDefault();applyDate();}});
  const remove=(key,value)=>{
    if(key==='date'){clearDate();return;}
    update({[key]:facetKeys.includes(key)?valuesOf(getState()[key]).filter(v=>v!==value):key==='context'?false:''});
  };
  function chip(key,value,label) {
    const button=document.createElement('button');button.type='button';button.className='filter-chip';button.dataset.removeFacet=key;button.dataset.removeValue=value;
    button.textContent=label+' ×';button.setAttribute('aria-label','Remove '+label);return button;
  }
  for(const container of [chips,selected])container.addEventListener('click',event=>{
    const button=event.target.closest('[data-remove-facet]');if(!button)return;
    const key=button.dataset.removeFacet;remove(key,button.dataset.removeValue);focusFacet(key);
  });
  for(const button of form.querySelectorAll('[data-clear-facet]'))button.addEventListener('click',()=>update({[button.dataset.clearFacet]:[]}));
  form.addEventListener('change',event=>{
    const key=event.target.dataset.choiceFor;
    if(!facetKeys.includes(key))return;
    const current=valuesOf(getState()[key]);update({[key]:event.target.checked?[...current,event.target.value]:current.filter(v=>v!==event.target.value)});
  });
  function renderSubjects() {
    const matches=searchSubjects(catalog,subjectQuery),visible=matches.slice(0,limit),state=getState();
    const signature=visible.map(n=>n.id).join('|');
    if(signature!==renderedIDs) {
      list.replaceChildren();
      for(const n of visible) {
        const row=document.createElement('div');row.className='subject-row';const label=document.createElement('label');label.className='choice';
        const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.name='entity';checkbox.value=n.id;checkbox.dataset.choiceFor='entity';
        const text=document.createElement('span');text.textContent=n.name;
        const detail=document.createElement('small');detail.textContent=subjectType(n)+(n.role?' · '+n.role:'');
        if(catalog.some(other=>other.id!==n.id && other.name===n.name))detail.textContent+=' · '+(n.description || n.id);
        text.append(detail);const count=document.createElement('span');count.className='option-count';count.dataset.subjectCount=n.id;count.setAttribute('aria-label','Matching entries');label.append(checkbox,text,count);row.append(label);
        if(n.type==='person'){const link=document.createElement('a');link.href='/nhi/people/'+encodeURIComponent(n.id)+'/';link.textContent='Profile ↗';link.setAttribute('aria-label','Open profile: '+n.name);link.dataset.peopleEntry='';row.append(link);}
        list.append(row);
      }
      renderedIDs=signature;
    }
    for(const checkbox of list.querySelectorAll('input'))checkbox.checked=state.entity.includes(checkbox.value);
    for(const count of list.querySelectorAll('[data-subject-count]'))count.textContent=String(counts.get(count.dataset.subjectCount)||0);
    document.getElementById('entity-match-count').textContent=matches.length?`Showing ${visible.length} of ${matches.length} names and subjects${subjectQuery?' matching your search':''}.`:'No matching names or subjects.';
    const more=document.getElementById('more-entities');more.hidden=visible.length>=matches.length;more.textContent=`Show ${Math.min(20,matches.length-visible.length)} more (${matches.length} total)`;
    selected.replaceChildren(...state.entity.map(id=>{const n=byId.get(id);return chip('entity',id,`${subjectType(n || {})}: ${n?.name || id}`);}));
  }
  subjectInput.addEventListener('input',()=>{clearTimeout(subjectTimer);subjectTimer=setTimeout(()=>{subjectQuery=subjectInput.value;limit=10;renderSubjects();},150);});
  document.getElementById('clear-entity-search').addEventListener('click',()=>{clearTimeout(subjectTimer);subjectInput.value='';subjectQuery='';limit=10;renderSubjects();subjectInput.focus({preventScroll:true});});
  document.getElementById('more-entities').addEventListener('click',()=>{
    const previous=limit;limit+=20;renderSubjects();list.querySelectorAll('input')[previous]?.focus({preventScroll:true});
  });
  moreChips.addEventListener('click',()=>{expandedChips=!expandedChips;syncChips();});
  function syncChips() {
    const state=getState(),items=[];
    if(state.q)items.push(chip('q',state.q,'Search: '+state.q));
    if(state.from || state.to)items.push(chip('date','','Date: '+rangeLabel(state.from,state.to)));
    for(const key of facetKeys)for(const value of state[key]) {
      const n=key==='entity'?byId.get(value):null;
      const label=key==='entity'?subjectType(n || {}):facetLabels[key];
      const text=key==='region'?regions[value]:key==='entity'?n?.name || value:key==='layer'?value==='core'?'Core UFO timeline':'Contextual history':value;
      items.push(chip(key,value,label+': '+text));
    }
    if(state.context)items.push(chip('context','','Supporting / earlier context'));
    chips.replaceChildren(...items);items.forEach((node,i)=>node.hidden=!expandedChips && i>=6);
    moreChips.hidden=items.length<=6;moreChips.textContent=expandedChips?'Show fewer selected filters':`Show all ${items.length} selected filters`;moreChips.setAttribute('aria-expanded',String(expandedChips));
    if(!items.length){const p=document.createElement('p');p.className='search-scope';p.textContent='No filters applied to this view.';chips.append(p);}
    document.getElementById('persistent-state').textContent=`${items.length} active filter${items.length===1?'':'s'}`;
  }
  function sync() {
    const state=getState();
    for(const key of facetKeys) {
      const count=facetCounts(data,state,key);if(key==='entity')counts=count;
      for(const checkbox of form.querySelectorAll(`input[data-choice-for="${key}"]`))checkbox.checked=state[key].includes(checkbox.value);
      for(const node of form.querySelectorAll(`[data-count-for="${key}"]`))node.textContent=String(count.get(node.dataset.value)||0);
      form.querySelector(`[data-selection-summary="${key}"]`).textContent=state[key].length?`${state[key].length} selected`:'Any choice';
    }
    if(!draftDirty)fillDates();
    document.getElementById('date-summary').textContent='Applied: '+rangeLabel(state.from,state.to);
    document.getElementById('empty-date').hidden=!state.from && !state.to;
    renderSubjects();syncChips();
  }
  return {sync,focusFacet,resetDraft:fillDates,clearLocalSearch:()=>{clearTimeout(subjectTimer);subjectQuery='';subjectInput.value='';limit=10;}};
}
