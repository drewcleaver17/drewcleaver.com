import { canonicalNhiURL } from '../lib/nhi-routes.mjs';
import { eras, eraFor, readingPathOf, filterEvents, initialState, paramsFromState, stateFromParams } from '../lib/ufos.mjs';
import { institutionParamKeys } from '../lib/ufo-institutions.mjs';
import { initInstitutionDirectory } from './ufo-institutions-client.mjs';

function init() {
  const dataNode = document.getElementById('ufos-data');
  const form = document.getElementById('timeline-filters');
  if (!dataNode || !form) return;
  const data = JSON.parse(dataNode.textContent);
  const rememberTimeline=()=>{try{sessionStorage.setItem('ufos.timeline.return',location.pathname+location.search+location.hash);sessionStorage.setItem('ufos.timeline.scroll',String(window.scrollY));}catch{}};
  document.addEventListener('click',event=>{if(event.target.closest?.('[data-people-entry]'))rememberTimeline();});
  const backToPeople=document.getElementById('people-return');
  const updatePeopleReturn=()=>{
  backToPeople.hidden=true;
  if(new URLSearchParams(location.search).get('via')==='people') {
    try {
      const back=canonicalNhiURL(sessionStorage.getItem('ufos.people.return') || '/nhi/people/',location.origin);
      if(back && back.pathname.startsWith('/nhi/people/')) {
        backToPeople.hidden=false;backToPeople.querySelector('a').href=back.pathname+back.search+back.hash;
        backToPeople.querySelector('a').textContent='← Back to '+(sessionStorage.getItem('ufos.people.name') || 'people');
      }
    } catch {}
  }
  };
  const institutionDirectory=initInstitutionDirectory(data);
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
  const eraLists = new Map([...document.querySelectorAll('[data-era]')].map(node=>[node.dataset.era,node.querySelector('.era-events')]));
  const eraList = e => eraLists.get(eraFor(e).id);
  const reveal=document.getElementById('reveal-linked');
  const control = key => form.elements.namedItem(key);
  let state = stateFromParams(new URLSearchParams(location.search));
  let timer;
  const syncControls = () => {
    if(state.entity) {
      const canonical=data.entities.find(n=>n.id===state.entity || n.name===state.entity || n.aliases.includes(state.entity) || n.legacySearchLabels?.includes(state.entity));
      if(canonical)state.entity=canonical.id;
    }
    for (const key of Object.keys(initialState)) {
      const el = control(key);
      if (key === 'context') el.checked = state.context;
      else { el.value = state[key]; if (el.tagName === 'SELECT' && !el.value) { state[key] = initialState[key]; el.value = state[key]; } }
    }
    const year = state.from.slice(0, 4);
    document.getElementById('year-shortcut').value = state.from === year + '-01-01' && (state.to === year + '-12-31') ? year : '';
    control('sort').disabled = state.view === 'recent';
  };
  const writeURL = mode => {
    if (!mode) return;
    const url = new URL(location.href), params=paramsFromState(state);
    for(const key of institutionParamKeys)if(url.searchParams.has(key))params.set(key,url.searchParams.get(key));
    if(url.searchParams.get('via')==='people')params.set('via','people');
    url.search = params.toString();
    history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
  };
  function render(mode) {
    updatePeopleReturn();
    syncControls();
    const filtered = ['q','from','to','category','topic','entity','evidence','layer','era'].some(k => state[k]);
    const structured = !filtered && state.sort === 'oldest' && state.view !== 'recent';
    const results = filterEvents(data, state);
    // Reuse the server-rendered cards and move each node only to its final home.
    // Cached containers avoid hundreds of full-document selector scans per keystroke.
    const visibleIds = new Set(results.map(e=>e.id));
    const groups = new Map([...eraLists.values(),contextList,flat].map(node=>[node,document.createDocumentFragment()]));
    for (const e of all) {
      const card=cards.get(e.id), shown=visibleIds.has(e.id);
      card.hidden=!shown;
      if(!shown)groups.get(readingPathOf(e)==='supporting'?contextList:eraList(e)).append(card);
    }
    for(const e of results)groups.get(structured?eraList(e):flat).append(cards.get(e.id));
    for(const [container,fragment] of groups)container.replaceChildren(fragment);
    story.hidden = !structured; context.hidden = true; flat.hidden = structured;
    if (structured) {
      for (const era of document.querySelectorAll('.timeline-era')) era.hidden = !era.querySelector('.era-events .ufo-event:not([hidden])');
    }
    const total = filterEvents(data, { view: state.view, context: state.context }).length;
    resultCount.textContent = results.length + ' of ' + total + ' entries' + (state.view === 'journey' && !state.context ? ' · main reading milestones' : state.view === 'story' && !state.context ? ' · modern disclosure' : state.view === 'recent' ? ' · ordered by site revision' : state.view === 'core' ? ' · all-era core timeline' : state.view === 'institutions' ? ' · institutional chronology' : ' · full history');
    document.getElementById('scope-note').textContent = state.view === 'journey' && !state.context
      ? 'A chronological reading path through human origins, ideas, scientific discoveries, encounters and investigations. Supporting records remain in full history and at their original links.'
      : state.view === 'story' && !state.context
      ? 'Modern disclosure starts in December 2017. Core timeline includes earlier UFO cases; full history also includes contextual strands.'
      : state.view === 'core' ? 'Core UFO records and investigations across all eras. Contextual history is available in full history; a historical date does not make a case contextual.' : state.view === 'recent' ? 'Historical additions and corrections appear here by the date this site changed, while each entry keeps its historical date.'
      : state.view === 'institutions' ? 'Formation, operational starts, transitions and disclosures retain separate dates. Institutional existence and mission do not establish an alleged UAP role. Searchable dossiers below explain the source boundaries.'
      : 'Selected historical context across distinct strands. Nearby dates, shared personnel and documented relationships do not by themselves establish a common cause.';
    for (const link of document.querySelectorAll('[data-view]')) {
      const selected = link.dataset.view === (state.context && ['story','journey'].includes(state.view) ? 'history' : state.view);
      if (selected) link.setAttribute('aria-current','true'); else link.removeAttribute('aria-current');
    }
    empty.hidden = results.length !== 0;
    recentNote.hidden = state.view !== 'recent';
    for (const el of document.querySelectorAll('.recent-label')) el.hidden = state.view !== 'recent';
    warning.hidden = !(state.from && state.to && state.from > state.to);
    warning.textContent = warning.hidden ? '' : 'The start date is after the end date. Adjust the range to see results.';
    chips.replaceChildren();
    const labels = { q:'Search', from:'From', to:'Through', category:'Category', topic:'Strand', entity:'Name / program', evidence:'Evidence', layer:'Layer', era:'Era', context:'Earlier context' };
    for (const [key,label] of Object.entries(labels)) if (state[key]) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'filter-chip';
      const value = key === 'entity' ? data.entities.find(n=>n.id===state[key])?.name || state[key] : state[key];
      const text = label + (key === 'context' ? '' : ': ' + value);
      button.textContent = text + ' ×'; button.setAttribute('aria-label','Remove ' + text);
      button.addEventListener('click',()=>{state[key]=initialState[key];render('push');(key==='context'?control('view'):control(key)).focus();}); chips.append(button);
    }
    reveal.hidden=true;
    writeURL(mode);
  }
  function reset(mode='push') { clearTimeout(timer); state={...initialState}; render(mode); }
  function showHash(focus=false) {
    let id; try { id=decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (cards.has(id)) {
      const e=all.find(item=>item.id===id);
      if (!filterEvents(data,state).some(item=>item.id===id)) {
        // Explicit shared filters win on initial load. An intentional in-page link can change scope.
        if (location.search && !focus) {status.textContent='The linked entry is outside the current filters. Reveal it in full history, or keep these filters.';reveal.hidden=false;return;}
        state={...initialState,view:'history'};render('replace');
      }
      const card=cards.get(id);card.querySelector('.event-detail').open=true;
      if (focus) card.focus({preventScroll:true});
      card.scrollIntoView({block:'start'});
    } else if (id.startsWith('era-') && document.getElementById(id)) {
      state={...initialState,view:'journey'};render('replace');document.getElementById(id).scrollIntoView({block:'start'});
    } else {
      const target=document.getElementById(id);
      if (target && institutionDirectory.reveal(target,focus)) { if(target.tagName==='DETAILS')target.open=true; for(let node=target.parentElement;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true; if(focus && target.hasAttribute('tabindex'))target.focus({preventScroll:true}); target.scrollIntoView({block:'start'}); }
    }
  }
  reveal.addEventListener('click',()=>{state={...initialState,view:'history'};render('push');showHash(true);status.textContent='Full history opened for the linked entry.';});
  form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);render('push');});
  form.addEventListener('reset',e=>{e.preventDefault();reset();});
  form.addEventListener('input',e=>{if(e.target.name!=='q')return;clearTimeout(timer);state.q=e.target.value;timer=setTimeout(()=>render('replace'),150);});
  form.addEventListener('change',e=>{
    clearTimeout(timer);
    if(e.target.id==='year-shortcut') {const year=e.target.value;state.from=year?year+'-01-01':'';state.to=year?year+'-12-31':'';}
    else if(e.target.name in initialState) {state[e.target.name]=e.target.type==='checkbox'?e.target.checked:e.target.value;if(e.target.name==='view')state.context=false;}
    render('push');
  });
  for(const link of document.querySelectorAll('[data-view]'))link.addEventListener('click',e=>{e.preventDefault();clearTimeout(timer);state={...initialState,view:link.dataset.view};render('push');const url=new URL(location.href);url.hash='timeline';history.replaceState(null,'',url);control('q').focus({preventScroll:true});document.getElementById('timeline').scrollIntoView({block:'start'});});
  document.getElementById('empty-reset').addEventListener('click',()=>{reset();control('q').focus();});
  window.addEventListener('popstate',()=>{state=stateFromParams(new URLSearchParams(location.search));render();showHash();});
  window.addEventListener('hashchange',()=>showHash(true));
  document.addEventListener('click',event=>{const link=event.target.closest?.('a[href^="#"]');if(link?.getAttribute('href')===location.hash)showHash(true);});
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
  download.addEventListener('click',async()=>{
    download.disabled=true;
    try {
      const response=await fetch('/nhi/data/');if(!response.ok)throw new Error('Download failed');
      const exportedPage=new DOMParser().parseFromString(await response.text(),'text/html');
      const complete=exportedPage.getElementById('ufos-export')?.textContent;JSON.parse(complete);
      const blob=new Blob([complete],{type:'application/json'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='nhi-index-'+data.meta.edition+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      status.textContent='Complete dataset downloaded, including people and selected works.';
    }catch{status.textContent='Download unavailable. Please try again.';}
    finally{download.disabled=false;}
  });
  render();form.hidden=false;showHash();
  if(new URLSearchParams(location.search).get('resume')==='1')try{
    const position=sessionStorage.getItem('ufos.timeline.scroll');
    if(position!==null && Number.isFinite(Number(position)))requestAnimationFrame(()=>window.scrollTo(0,Number(position)));
  }catch{}
}
init();
