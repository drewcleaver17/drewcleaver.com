import { syncChoices } from './nhi-controls.mjs';
import { filterInstitutions, institutionParamKeys, institutionStateFromParams } from '../lib/ufo-institutions.mjs';

export function initInstitutionDirectory(data) {
  const form=document.getElementById('institution-filters');
  if(!form)return {reveal:()=>true};
  const count=document.getElementById('institution-count');
  const empty=document.getElementById('institution-empty');
  const status=document.getElementById('institution-link-status');
  const reveal=document.getElementById('reveal-institution');
  const cards=new Map([...document.querySelectorAll('[data-institution]')].map(n=>[n.dataset.institution,n]));
  let state=institutionStateFromParams(new URLSearchParams(location.search));
  let timer;
  function render(mode) {
    for(const key of institutionParamKeys) {
      const el=form.elements.namedItem(key);el.value=state[key];
      if(el.tagName==='SELECT' && !el.value)state[key]='';
    }
    const results=new Set(filterInstitutions(data.entities,state).map(n=>n.id));
    for(const [id,card] of cards)card.hidden=!results.has(id);
    count.textContent=results.size+' of '+cards.size+' institutional dossiers';
    syncChoices(form);
    empty.hidden=results.size>0;reveal.hidden=true;status.textContent='';
    if(mode) {
      const url=new URL(location.href);
      for(const key of institutionParamKeys){url.searchParams.delete(key);if(state[key])url.searchParams.set(key,state[key]);}
      history[mode==='push'?'pushState':'replaceState'](null,'',url);
    }
  }
  function reset(mode='push') {clearTimeout(timer);state=institutionStateFromParams(new URLSearchParams());render(mode);}
  function revealTarget(target,force=false) {
    if(!target?.dataset.institution || !target.hidden)return true;
    if(!force) {
      status.textContent='The linked dossier is outside the institution filters. Reveal it or keep these filters.';
      reveal.hidden=false;return false;
    }
    reset('replace');return true;
  }
  reveal.addEventListener('click',()=>{
    const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if(target?.dataset.institution){reset();target.open=true;target.focus({preventScroll:true});target.scrollIntoView({block:'start'});status.textContent='Institution filters cleared for the linked dossier.';}
  });
  form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);render('push');});
  form.addEventListener('change',e=>{if(!institutionParamKeys.includes(e.target.name))return;clearTimeout(timer);state[e.target.name]=e.target.value;render('push');});
  form.addEventListener('input',e=>{if(e.target.name!=='iq')return;clearTimeout(timer);state.iq=e.target.value;timer=setTimeout(()=>render('replace'),150);});
  form.addEventListener('reset',e=>{e.preventDefault();reset();form.elements.namedItem('iq').focus();});
  window.addEventListener('popstate',()=>{clearTimeout(timer);state=institutionStateFromParams(new URLSearchParams(location.search));render();});
  render();syncChoices(form);form.hidden=false;
  return {reveal:revealTarget};
}
