import './nhi-controls.mjs';
import { initTimelineFilterControls } from './nhi-filter-controls.mjs';
import { facetKeys, valuesOf, subjectCatalog } from '../lib/nhi-filtering.mjs';
import { canonicalNhiURL } from '../lib/nhi-routes.mjs';
import { eras, eraFor, readingPathOf, filterEvents, initialState, paramsFromState, stateFromParams } from '../lib/ufos.mjs';
import { institutionParamKeys } from '../lib/ufo-institutions.mjs';
import { initInstitutionDirectory } from './ufo-institutions-client.mjs';

function init() {
  const dataNode = document.getElementById('ufos-data');
  const form = document.getElementById('timeline-filters');
  if (!dataNode || !form) return;
  const data = JSON.parse(dataNode.textContent);

  const readerTools=document.getElementById('reading-tools');
  const returnReading=document.getElementById('return-reading');
  let readingReference=null;
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
  const story = document.getElementById('timeline-results');
  const flat = document.getElementById('filtered-results');
  const context = document.getElementById('context-records');
  const contextList = document.getElementById('context-list');
  const empty = document.getElementById('empty-state');
  const recentNote = document.getElementById('recent-note');
  const status = document.getElementById('link-status');
  const all = filterEvents(data, { view: 'history' });
  const cards = new Map(all.map(e => [e.id, document.getElementById(e.id)]));
  const eraLists = new Map([...document.querySelectorAll('[data-era]')].map(node=>[node.dataset.era,node.querySelector('.era-events')]));
  const eraList = e => eraLists.get(eraFor(e).id);
  const reveal=document.getElementById('reveal-linked');
  const controls=new Map(Object.keys(initialState).map(key=>[key,form.querySelector(`[name="${key}"]`)]));
  const control = key => controls.get(key);
  const catalog=subjectCatalog(data);
  function restoredState() {
    const params=new URLSearchParams(location.search),next=stateFromParams(params),ignored=[];
    next.entity=valuesOf(next.entity.map(value=>catalog.find(n=>n.id===value)?.id || catalog.find(n=>n.name===value || n.aliases.includes(value))?.id || ''));
    for(const key of facetKeys)if(params.getAll(key).some(value=>key==='entity'?!catalog.some(n=>n.id===value || n.name===value || n.aliases.includes(value)):!next[key].includes(value)))ignored.push(key);
    if((params.has('from') && !next.from) || (params.has('to') && !next.to))ignored.push('invalid date range');
    const notice=document.getElementById('url-notice');notice.hidden=!ignored.length;notice.textContent=ignored.length?'This link contained unavailable or invalid filters ('+ignored.join(', ')+'). Those restrictions were ignored.':'';
    return next;
  }
  let state = restoredState();
  let timer,announceTimer;
  const filterControls=initTimelineFilterControls(data,()=>state,patch=>{clearTimeout(timer);state={...state,...patch};render('push');});
  const syncControls = () => {
    for(const key of ['q','view','sort'])control(key).value=state[key];
    control('context').checked=state.context;
    control('sort').disabled=state.view==='recent';
  };
  const writeURL = mode => {
    if (!mode) return;
    const url = new URL(location.href), params=paramsFromState(state);
    for(const key of institutionParamKeys)for(const value of url.searchParams.getAll(key))params.append(key,value);
    if(url.searchParams.get('via')==='people')params.set('via','people');
    url.search = params.toString();
    history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
  };
  const currentReference = () => {
    const offset=readerTools.getBoundingClientRect().height || 0;
    const visible=[...cards.values()].filter(n=>!n.hidden && !n.closest('[hidden]'));
    const node=visible.find(n=>{const r=n.getBoundingClientRect();return r.bottom>offset && r.top<window.innerHeight;});
    return node ? {id:node.id,top:node.getBoundingClientRect().top} : null;
  };
  function render(mode) {
    status.textContent='';
    const focused=document.activeElement;
    const editing=focused?.closest('#timeline-filters, #results-summary, #empty-state, #reading-tools');
    const reference=mode && !editing ? currentReference() : null;
    updatePeopleReturn();
    syncControls();
    const filtered = ['q','from','to'].some(k=>state[k]) || facetKeys.some(k=>state[k].length);
    const structured = !filtered && state.sort === 'oldest' && state.view !== 'recent';
    const results = filterEvents(data, state);
    // Reuse the server-rendered cards and move each node only to its final home.
    // Cached containers avoid hundreds of full-document selector scans per keystroke.
    const visibleIds = new Set(results.map(e=>e.id));
    const groups = new Map([...eraLists.values(),contextList,flat].map(node=>[node,[]]));
    for (const e of all) {
      const card=cards.get(e.id), shown=visibleIds.has(e.id);
      card.hidden=!shown;
      if(!shown)groups.get(readingPathOf(e)==='supporting'?contextList:eraList(e)).push(card);
    }
    for(const e of results)groups.get(structured?eraList(e):flat).push(cards.get(e.id));
    // No replacement of the reading surface: only move nodes whose home/order changed.
    for(const [container,nodes] of groups) {
      let current=container.firstElementChild;
      for(const node of nodes) {
        if(current===node)current=current.nextElementSibling;
        else container.insertBefore(node,current);
      }
    }
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
    filterControls.sync();
    document.getElementById('persistent-count').textContent=results.length+' entries';
    clearTimeout(announceTimer);announceTimer=setTimeout(()=>{document.getElementById('result-announcement').textContent=resultCount.textContent;},250);
    readerTools.hidden=false;
    reveal.hidden=true;
    writeURL(mode);
    if(mode && focused && document.activeElement!==focused && focused.isConnected)focused.focus({preventScroll:true});
    if(reference && results.length) {
      const index=all.findIndex(n=>n.id===reference.id);
      const nearest=visibleIds.has(reference.id)?reference.id:[...results].sort((a,b)=>Math.abs(all.findIndex(n=>n.id===a.id)-index)-Math.abs(all.findIndex(n=>n.id===b.id)-index))[0].id;
      const node=cards.get(nearest);
      const delta=node.getBoundingClientRect().top-reference.top;
      if(delta && Number.isFinite(delta))window.scrollBy(0,delta);
      if(!visibleIds.has(reference.id))status.textContent='The previous entry is outside these filters. Reading continues at the nearest remaining historical entry.';
    }
    if(!results.length)status.textContent='No entries match. The active constraints are listed in the filter workspace; clear search or remove a filter to broaden the view.';

  }
  function reset(mode='push') { clearTimeout(timer); state={...initialState,view:state.view,sort:state.sort};filterControls.clearLocalSearch();filterControls.resetDraft();render(mode); }
  function showHash(focus=false) {
    let id; try { id=decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (cards.has(id)) {
      const e=all.find(item=>item.id===id);
      if (!filterEvents(data,state).some(item=>item.id===id)) {
        // Explicit shared filters win on initial load. An intentional in-page link can change scope.
        if (location.search && !focus) {status.textContent='The linked entry is outside the current filters. Reveal it in full history, or keep these filters.';reveal.hidden=false;return;}
        state={...initialState,view:'history'};render('replace');status.textContent='Full history opened for this linked entry; previous filters were cleared.';
      }
      const card=cards.get(id);card.querySelector('.event-detail').open=true;
      if (focus) card.focus({preventScroll:true});
      card.scrollIntoView({block:'start'});
    } else if (id.startsWith('era-') && document.getElementById(id)) {
      state={...initialState,view:'journey'};render('replace');status.textContent='The main reading path opened for this chapter; previous filters were cleared.';document.getElementById(id).scrollIntoView({block:'start'});
    } else {
      const target=document.getElementById(id);
      if (target && institutionDirectory.reveal(target,focus)) { if(target.tagName==='DETAILS')target.open=true; for(let node=target.parentElement;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true; if(focus && target.hasAttribute('tabindex'))target.focus({preventScroll:true}); target.scrollIntoView({block:'start'}); }
    }
  }
  reveal.addEventListener('click',()=>{state={...initialState,view:'history'};render('push');showHash(true);status.textContent='Full history opened for the linked entry.';});
  form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);render('push');});
  form.addEventListener('reset',e=>{e.preventDefault();reset();});
  document.getElementById('clear-search').addEventListener('click',()=>{state.q='';render('push');control('q').focus({preventScroll:true});});
  document.getElementById('persistent-reset').addEventListener('click',()=>reset());
  document.getElementById('adjust-filters').addEventListener('click',event=>{event.preventDefault();readingReference=currentReference() || readingReference;returnReading.hidden=!readingReference;form.scrollIntoView({block:'start'});control('q').focus({preventScroll:true});});
  for(const link of document.querySelectorAll('[data-results-jump]'))link.addEventListener('click',event=>{event.preventDefault();const target=document.getElementById('results-summary');target.scrollIntoView({block:'start'});target.focus({preventScroll:true});});
  returnReading.addEventListener('click',e=>{e.preventDefault();let node=cards.get(readingReference?.id);if(node?.hidden){const index=all.findIndex(n=>n.id===readingReference.id);const remaining=filterEvents(data,state);const nearest=[...remaining].sort((a,b)=>Math.abs(all.findIndex(n=>n.id===a.id)-index)-Math.abs(all.findIndex(n=>n.id===b.id)-index))[0];node=cards.get(nearest?.id);}if(node && !node.hidden){node.scrollIntoView({block:'start'});node.focus({preventScroll:true});}else empty.scrollIntoView({block:'start'});});
  for(const button of document.querySelectorAll('[data-copy-view]'))button.addEventListener('click',async()=>{const url=new URL(location.href);url.hash='timeline';try{await navigator.clipboard.writeText(url.href);status.textContent='Filtered view link copied.';button.textContent='View copied';}catch{status.textContent='Clipboard unavailable. Copy the browser address to share these filters.';}});
  form.addEventListener('input',e=>{if(e.target.name!=='q')return;clearTimeout(timer);state.q=e.target.value;timer=setTimeout(()=>render('replace'),150);});
  form.addEventListener('change',e=>{
    if(!['q','view','sort','context'].includes(e.target.name))return;
    clearTimeout(timer);
    state[e.target.name]=e.target.type==='checkbox'?e.target.checked:e.target.value;
    if(e.target.name==='view')state.context=false;
    render('push');
  });
  for(const link of document.querySelectorAll('[data-view]'))link.addEventListener('click',e=>{e.preventDefault();clearTimeout(timer);state={...initialState,view:link.dataset.view};filterControls.resetDraft();render('push');const url=new URL(location.href);url.hash='timeline';history.replaceState(null,'',url);control('q').focus({preventScroll:true});document.getElementById('timeline').scrollIntoView({block:'start'});});
  document.getElementById('empty-reset').addEventListener('click',()=>{reset();control('q').focus();});
  window.addEventListener('popstate',()=>{clearTimeout(timer);state=restoredState();filterControls.resetDraft();render();showHash();});
  window.addEventListener('hashchange',()=>showHash(true));
  document.addEventListener('click',event=>{const link=event.target.closest?.('a[href^="#"]');if(!event.defaultPrevented && link?.getAttribute('href')===location.hash)showHash(true);});
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
