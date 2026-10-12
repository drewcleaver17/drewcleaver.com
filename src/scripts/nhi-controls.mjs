// Directory facets remain independent of the timeline. Native selects adapt existing forms.
const choiceBindings=new WeakMap();
export function exposeChoices(form) {
  if(!form || form.dataset.choicesReady)return;
  form.dataset.choicesReady='true';const bindings=[];choiceBindings.set(form,bindings);
  for(const select of form.querySelectorAll('select[multiple]')) {
    const label=select.closest('label'),group=document.createElement('fieldset');group.className='visible-choices filter-group';group.id='choices-'+select.name;
    const legend=document.createElement('legend');legend.textContent=label.firstChild.textContent.trim();group.append(legend);
    const hint=document.createElement('p');hint.className='search-scope';hint.textContent='Choose one or more. Results can match any choice in this group.';group.append(hint);
    const clear=document.createElement('button');clear.type='button';clear.className='underlined';clear.textContent='Clear '+legend.textContent.toLowerCase();
    clear.addEventListener('click',()=>{for(const option of select.options)option.selected=false;select.dispatchEvent(new Event('change',{bubbles:true}));});group.append(clear);
    const choices=document.createElement('div');choices.className='choice-list';let expanded=false;const rows=[];
    for(const option of select.options) {
      if(!option.value)continue;
      const item=document.createElement('label');item.className='choice';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.value=option.value;checkbox.dataset.choiceFor=select.name;
      const text=document.createElement('span');text.textContent=option.textContent;item.append(checkbox,text);choices.append(item);rows.push(item);bindings.push({checkbox,option,select});
      checkbox.addEventListener('change',()=>{option.selected=checkbox.checked;select.dispatchEvent(new Event('change',{bubbles:true}));});
    }
    group.append(choices);
    const refresh=()=>rows.forEach((row,i)=>row.hidden=!expanded && rows.length>12 && i>=8 && !row.querySelector('input').checked);
    if(rows.length>12){const more=document.createElement('button');more.type='button';more.className='underlined';more.textContent='Show all '+rows.length;more.setAttribute('aria-expanded','false');more.addEventListener('click',()=>{expanded=!expanded;more.textContent=expanded?'Show fewer':'Show all '+rows.length;more.setAttribute('aria-expanded',String(expanded));refresh();});group.append(more);}
    select.addEventListener('change',refresh);group.refreshChoices=refresh;label.after(group);label.hidden=true;select.dataset.choiceAdapter='true';
  }
  syncChoices(form);
}
export function syncChoices(form) {
  for(const {checkbox,option,select} of choiceBindings.get(form) || []){checkbox.checked=option.selected;checkbox.disabled=select.disabled;}
  for(const group of form?.querySelectorAll('.visible-choices') || [])group.refreshChoices?.();
}
export function focusChoice(form,key) {
  const options=[...form.querySelectorAll('[data-choice-for]')].filter(n=>n.dataset.choiceFor===key);
  (options.find(n=>n.checked) || options[0] || form.elements.namedItem(key))?.focus({preventScroll:true});
}
for(const form of document.querySelectorAll('#people-filters,#institution-filters'))exposeChoices(form);
for(const form of document.querySelectorAll('#people-filters,#institution-filters')) {
  form.addEventListener('change',()=>syncChoices(form));form.addEventListener('reset',()=>queueMicrotask(()=>syncChoices(form)));
}
window.addEventListener('popstate',()=>{for(const form of document.querySelectorAll('[data-choices-ready]'))syncChoices(form);});
const buttons=[...document.querySelectorAll('button[data-nhi-theme]')];
function setTheme(theme) {
  document.documentElement.dataset.nhiTheme=theme;
  for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.nhiTheme===theme));
  try{localStorage.setItem('nhi.reading.appearance',theme);}catch{}
}
for(const button of buttons)button.addEventListener('click',()=>setTheme(button.dataset.nhiTheme));
for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.nhiTheme===(document.documentElement.dataset.nhiTheme || 'light')));

// Printing the current view includes its evidence/source trail without altering screen state.
let printOpened=[];
window.addEventListener('beforeprint',()=>{
  if(!document.documentElement.hasAttribute('data-nhi'))return;
  printOpened=[...document.querySelectorAll('.ufo-event:not([hidden]) .event-detail,.person-profile .profile-sources')].filter(n=>!n.open && !n.closest('[hidden]'));
  for(const details of printOpened)details.open=true;
});
window.addEventListener('afterprint',()=>{for(const details of printOpened)details.open=false;printOpened=[];});
