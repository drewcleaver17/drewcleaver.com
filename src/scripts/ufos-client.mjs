import { eras, filterEvents, initialState, paramsFromState, stateFromParams } from '../lib/ufos.mjs';

function init() {
  const dataNode = document.getElementById('ufos-data');
  const form = document.getElementById('timeline-filters');
  if (!dataNode || !form) return;
  const data = JSON.parse(dataNode.textContent);
  const resultCount = document.getElementById('result-count');
  const chips = document.getElementById('active-filters');
  const story = document.getElementById('timeline-results');
  const flat = document.getElementById('filtered-results');
  const context = document.getElementById('context-records');
  const contextList = document.getElementById('context-list');
  const empty = document.getElementById('empty-state');
  const recentNote = document.getElementById('recent-note');
  const warning = document.getElementById('filter-warning');
  const status = document.getElementById('link-status');
  const all = filterEvents(data, { view: 'history' });
  const cards = new Map(all.map(e => [e.id, document.getElementById(e.id)]));
  const eraFor = e => eras.find(era => e.date.start.slice(0, 4) >= era.start && e.date.start.slice(0, 4) <= era.end);
  const eraList = e => document.querySelector('[data-era="' + eraFor(e).id + '"] .era-events');
  const control = key => form.elements.namedItem(key);
  let state = stateFromParams(new URLSearchParams(location.search));
  let timer;
  const syncControls = () => {
    for (const key of Object.keys(initialState)) {
      const el = control(key);
      if (key === 'context') el.checked = state.context;
      else { el.value = state[key]; if (el.tagName === 'SELECT' && !el.value) { state[key] = initialState[key]; el.value = state[key]; } }
    }
    const year = state.from.slice(0, 4);
    document.getElementById('year-shortcut').value = state.from === year + '-01-01' && (state.to === year + '-12-31' || state.to === data.meta.researchCutoff) ? year : '';
    control('sort').disabled = state.view === 'recent';
  };
  const writeURL = mode => {
    if (!mode) return;
    const url = new URL(location.href); url.search = paramsFromState(state).toString();
    history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
  };
  function render(mode) {
    syncControls();
    const filtered = ['q','from','to','category','topic','entity','evidence'].some(k => state[k]);
    const structured = !filtered && state.sort === 'oldest' && state.view !== 'recent';
    const results = filterEvents(data, state);
    // Return every existing server-rendered node to its home before changing views.
    for (const e of all) { const card = cards.get(e.id); (e.context ? contextList : eraList(e)).append(card); card.hidden = false; }
    flat.replaceChildren();
    story.hidden = !structured; context.hidden = true; flat.hidden = structured;
    if (structured) {
      for (const e of results) eraList(e).append(cards.get(e.id));
      for (const era of document.querySelectorAll('.timeline-era')) era.hidden = !era.querySelector('.era-events').children.length;
    } else for (const e of results) flat.append(cards.get(e.id));
    const total = filterEvents(data, { view: state.view, context: state.context }).length;
    resultCount.textContent = results.length + ' of ' + total + ' entries' + (state.view === 'story' && !state.context ? ' · modern disclosure' : state.view === 'recent' ? ' · ordered by site revision' : ' · full history');
    document.getElementById('scope-note').textContent = state.view === 'story' && !state.context
      ? 'Modern disclosure starts in December 2017. Choose full history to explore earlier investigations and the wider institutional context.'
      : state.view === 'recent' ? 'Historical additions and corrections appear here by the date this site changed, while each entry keeps its historical date.'
      : 'Selected historical context across distinct strands. Nearby dates, shared personnel and documented relationships do not by themselves establish a common cause.';
    for (const link of document.querySelectorAll('[data-view]')) {
      const selected = link.dataset.view === (state.context && state.view === 'story' ? 'history' : state.view);
      if (selected) link.setAttribute('aria-current','true'); else link.removeAttribute('aria-current');
    }
    empty.hidden = results.length !== 0;
    recentNote.hidden = state.view !== 'recent';
    for (const el of document.querySelectorAll('.recent-label')) el.hidden = state.view !== 'recent';
    warning.hidden = !(state.from && state.to && state.from > state.to);
    warning.textContent = warning.hidden ? '' : 'The start date is after the end date. Adjust the range to see results.';
    chips.replaceChildren();
    const labels = { q:'Search', from:'From', to:'Through', category:'Category', topic:'Strand', entity:'Name / program', evidence:'Evidence', context:'Earlier context' };
    for (const [key,label] of Object.entries(labels)) if (state[key]) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'filter-chip';
      const value = key === 'entity' ? data.entities.find(n=>n.id===state[key])?.name || state[key] : state[key];
      const text = label + (key === 'context' ? '' : ': ' + value);
      button.textContent = text + ' ×'; button.setAttribute('aria-label','Remove ' + text);
      button.addEventListener('click',()=>{state[key]=initialState[key];render('push');(key==='context'?control('view'):control(key)).focus();}); chips.append(button);
    }
    writeURL(mode);
  }
  function reset(mode='push') { clearTimeout(timer); state={...initialState}; render(mode); }
  function showHash(focus=false) {
    let id; try { id=decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (cards.has(id)) {
      const e=all.find(item=>item.id===id);
      if (!filterEvents(data,state).some(item=>item.id===id)) {
        // Explicit shared filters win on initial load. An intentional in-page link can change scope.
        if (location.search && !focus) {status.textContent='The linked entry is outside the current filters. Clear filters or select full history to see it.';return;}
        state={...initialState,view:e.context?'history':'story'};render('replace');
      }
      const card=cards.get(id);card.querySelector('.event-detail').open=true;
      if (focus) card.focus({preventScroll:true});
      card.scrollIntoView({block:'start'});
    } else if (id.startsWith('era-') && document.getElementById(id)) {
      state={...initialState,view:eras.find(e=>'era-'+e.id===id).start<'2017'?'history':'story'};render('replace');document.getElementById(id).scrollIntoView({block:'start'});
    } else {
      const target=document.getElementById(id);
      if (target) { if(target.tagName==='DETAILS')target.open=true; for(let node=target.parentElement;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true; }
    }
  }
  form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);render('push');});
  form.addEventListener('reset',e=>{e.preventDefault();reset();});
  form.addEventListener('input',e=>{if(e.target.name!=='q')return;clearTimeout(timer);state.q=e.target.value;timer=setTimeout(()=>render('replace'),150);});
  form.addEventListener('change',e=>{
    clearTimeout(timer);
    if(e.target.id==='year-shortcut') {const year=e.target.value;state.from=year?year+'-01-01':'';state.to=year?(year===data.meta.researchCutoff.slice(0,4)?data.meta.researchCutoff:year+'-12-31'):'';}
    else if(e.target.name in initialState) {state[e.target.name]=e.target.type==='checkbox'?e.target.checked:e.target.value;if(e.target.name==='view')state.context=false;}
    render('push');
  });
  for(const link of document.querySelectorAll('[data-view]'))link.addEventListener('click',e=>{e.preventDefault();clearTimeout(timer);state={...initialState,view:link.dataset.view};render('push');control('q').focus({preventScroll:true});});
  document.getElementById('empty-reset').addEventListener('click',()=>{reset();control('q').focus();});
  window.addEventListener('popstate',()=>{state=stateFromParams(new URLSearchParams(location.search));render();showHash();});
  window.addEventListener('hashchange',()=>showHash(true));
  document.getElementById('jump-latest').addEventListener('click',()=>reset('replace'));
  for(const button of document.querySelectorAll('[data-copy]')) {
    button.hidden=false;
    button.addEventListener('click',async()=>{
      const url=new URL(location.pathname,location.origin);url.hash=button.dataset.copy;
      try {await navigator.clipboard.writeText(url.href);status.textContent='Direct event link copied.';button.textContent='Copied';}
      catch {status.textContent='Clipboard unavailable. Use the adjacent Link control and copy the address from your browser.';}
    });
  }
  const download=document.getElementById('download-data');download.hidden=false;
  download.addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='ufos-timeline-'+data.meta.researchCutoff+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  render();form.hidden=false;showHash();
}
init();
