// Preserve the existing single-choice state model and URL serialization.
// Selects remain private adapters; native radios expose every labeled choice.
const choiceBindings=new WeakMap();
export function exposeChoices(form) {
  if(!form || form.dataset.choicesReady)return;
  form.dataset.choicesReady='true';
  const bindings=[];choiceBindings.set(form,bindings);
  for(const select of form.querySelectorAll('select')) {
    const label=select.closest('label');
    const group=document.createElement('fieldset');group.className='visible-choices';
    const legend=document.createElement('legend');legend.textContent=label.firstChild.textContent.trim();group.append(legend);
    const choices=document.createElement('div');choices.className='choice-list';
    if(select.options.length>40) {
      group.classList.add('long-choices');
      const note=document.createElement('p');note.className='catalog-note';
      note.textContent=`${select.options.length-1} named choices. All remain available. On a small screen this long catalog scrolls; Tab into it, then use arrow keys or scroll. Browser Find can locate a label.`;
      group.append(note);choices.setAttribute('tabindex','0');choices.setAttribute('role','region');choices.setAttribute('aria-label',legend.textContent+' — complete choice catalog');
    }
    const name='choice-'+(select.name || select.id);
    for(const option of select.options) {
      const item=document.createElement('label');item.className='choice';
      const radio=document.createElement('input');radio.type='radio';radio.name=name;radio.value=option.value;
      radio.dataset.choiceFor=select.name || select.id;radio.checked=option.value===select.value;bindings.push({radio,select});
      const text=document.createElement('span');text.textContent=option.textContent;item.append(radio,text);choices.append(item);
      radio.addEventListener('change',()=>{select.value=radio.value;select.dispatchEvent(new Event('change',{bubbles:true}));});
    }
    group.append(choices);label.after(group);label.hidden=true;select.dataset.choiceAdapter='true';
  }
  syncChoices(form);
}
export function syncChoices(form) {
  for(const {radio,select} of choiceBindings.get(form) || []) {
    radio.checked=radio.value===select.value;radio.disabled=select.disabled;
  }
}
export function focusChoice(form,key) {
  const radios=[...form.querySelectorAll('[data-choice-for]')].filter(n=>n.dataset.choiceFor===key);
  (radios.find(n=>n.checked) || radios[0] || form.elements.namedItem(key))?.focus({preventScroll:true});
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
