import { findIdeas, ideaCode, statuses } from './model.mjs';
import { IssueVisit, ratingMessage } from './survey-model.mjs';

const root = document.querySelector('[data-north]');
if (root) start(root);

function start(root) {
  const $ = selector => root.querySelector(selector);
  const role = (node, name) => node.querySelector('[data-role="' + name + '"]');
  const seed = JSON.parse($('#north-catalog').textContent);
  const api = (root.dataset.api || '').replace(/\/$/, '');
  const preview = root.dataset.preview === 'true';
  const privateSession = preview && root.dataset.ownerSession === 'required' && api &&
    new URL(api, location.href).origin === location.origin;
  const canonical = new URL('/45north/', preview ? location.origin : 'https://drewcleaver.com');
  const pageBase = new URL(location.pathname,location.origin);
  const localLink = id => '#idea-' + ideaCode(id);
  const publicLink = id => new URL(localLink(id),canonical).href;
  const card = $('#issue-card'), scale = $('#priority-scale'), alert = $('#rating-receipt');
  const search = $('#search'), browseList = $('#browse-list'), receipt = $('#status-view');
  const views = new Map(['rate','browse','suggest','status','results'].map(name => [name,$('#'+name+'-view')]));
  const visit = new IssueVisit();
  const historyOfRatings = new Map(), pending = new Set(), retries = new Map(), receipts = new Map();
  const archived = new Map(), drafts = new Map();
  let ideas = seed, byId = new Map(seed.map(i => [i.id,i]));
  let mode = '', routeVersion = 0, targetId = null, displayedId = null;
  let catalogReady = false, catalogPromise = null, refreshing, catalogTimer;
  let awaitingLookup = null, done = false, exhausted = false, stopResults;
  let clock = null;
  const serverNow = () => clock ? clock.server + performance.now() - clock.local : Date.now();
  const setClock = ms => { if (Number.isFinite(ms)) clock = {server:ms,local:performance.now()}; };
  const randomHex = size => Array.from(crypto.getRandomValues(new Uint8Array(size)), b => b.toString(16).padStart(2,'0')).join('');
  const text = (node, value) => { const val=String(value ?? ''); if(node && node.textContent !== val) node.textContent=val; };
  function element(tag, value, cls) {
    const node=document.createElement(tag);
    if (value !== undefined && value !== null) node.textContent=value;
    if (cls) node.className=cls;
    return node;
  }
  const button = (action,label,cls='text-action') => {
    const b=element('button',label,cls); b.type='button'; b.dataset.action=action; return b;
  };
  const focus = node => node?.focus({preventScroll:true});
  const when = ms => new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(ms));
  const day = value => new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
  const knownIdea = id => byId.get(id) || archived.get(id) || seed.find(i=>i.id===id);

  function safeFetch(path,opts={}) {
    if (!api) throw new Error('The service is unavailable.');
    return fetch(api + path,{...opts,credentials:privateSession?'same-origin':'omit',referrerPolicy:'no-referrer',redirect:'error',
      signal:opts.signal || (typeof AbortSignal.timeout==='function'?AbortSignal.timeout(14000):undefined)});
  }

  async function post(path,body) {
    const res=await safeFetch(path,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json().catch(()=>({}));
    if (!res.ok) {
      const error=new Error(data.error || 'The service could not confirm the request.');
      error.status=res.status; throw error;
    }
    return data;
  }

  function notice(message, retry=false) {
    const line=$('#catalog-notice');
    line.hidden=!message;
    line.replaceChildren();
    if(message)line.append(document.createTextNode(message));
    if(retry)line.append(' ',button('reload-catalog','Try again'));
  }

  function scheduleCatalog() {
    clearTimeout(catalogTimer);
    if(!api || document.hidden || !['rate','browse','suggest'].includes(mode))return;
    catalogTimer=setTimeout(()=>{loadCatalog();}, catalogReady ? 60000 : 15000);
  }

  async function loadCatalog() {
    if(catalogPromise)return catalogPromise;
    if(!api){catalogUnavailable();return;}
    refreshing=true;
    catalogPromise=(async()=>{
      try {
        const response=await safeFetch('/survey/catalog',{cache:'no-cache'});
        if(!response.ok)throw Error();
        const v=await response.json();
        if(v.version!=='priority-v2'||!Array.isArray(v.ideas)||
            !v.ideas.every(i=>Number.isSafeInteger(i.id)&&i.id>0&&typeof i.title==='string'&&typeof i.action==='string'))throw Error();
        ideas=v.ideas; byId=new Map(ideas.map(i=>[i.id,i])); catalogReady=true;
        setClock(v.asOf); notice('');
        if (mode==='rate') showIssue(false);
        if (mode==='browse') drawBrowse();
        if (mode==='suggest') localMatches($('#suggest-form'),$('#suggest-text').value);
      } catch { catalogUnavailable(); }
      finally {refreshing=false;catalogPromise=null;scheduleCatalog();}
    })();
    return catalogPromise;
  }

  function catalogUnavailable() {
    if(!catalogReady && mode==='rate') {
      $('#survey-loading').hidden=true;
      const fallback=targetId ? knownIdea(targetId) : knownIdea(visit.current);
      if(fallback) paintIssue(fallback);
      notice('The survey could not load. You can still browse the saved launch proposals.',Boolean(api));
    } else if (mode==='rate') notice('Showing the last available issue list.',true);
    if(mode==='browse')drawBrowse();
  }

  function drawBrowse() {
    const q=search.value.trim();
    const items=q ? findIdeas(ideas,q) : [...ideas].sort((a,b)=>a.title.localeCompare(b.title,'en'));
    const fragment=document.createDocumentFragment();
    for(const i of items){
      const li=element('li'),a=element('a',null,'issue-link');a.href=localLink(i.id);
      a.append(element('span',i.title,'browse-title'),element('span',i.topic,'browse-topic'));
      li.append(a);fragment.append(li);
    }
    // Keep keyboard focus in a link when a background refresh returns an unchanged list.
    const key=JSON.stringify(items.map(i=>[i.id,i.title,i.topic]));
    if(browseList.dataset.key!==key){browseList.replaceChildren(fragment);browseList.dataset.key=key;}
    text($('#search-summary'), q ? (items.length ? items.length+(items.length===1?' matching issue':' matching issues') : 'No matching issues.') :
      (catalogReady?'Alphabetical order':'Saved launch proposals · alphabetical order'));
    text($('#search-suggest'),q?'Suggest this issue':'Suggest an issue');
  }

  function paintNote(note) {
    const box=$('#issue-updates'),signature=JSON.stringify(note||null);
    if(box.dataset.note===signature)return;
    box.dataset.note=signature;box.replaceChildren();box.hidden=!note;
    if(!note)return;
    const heading=element('h3','What happened'),time=element('time',day(note.date));time.dateTime=note.date;
    box.append(heading,time);
    for(const [label,val] of [['Who can act',note.actor],['Next step or decision',note.next],['Evidence or result',note.evidence]]){
      if(val){const p=element('p');p.append(element('strong',label+'. '),document.createTextNode(val));box.append(p);}
    }
    if(note.opening)box.append(element('p',note.deadline?'Verified opening through '+day(note.deadline)+'.':'Verified opening.'));
  }

  function applyOwnState(id) {
    const saved=historyOfRatings.get(id);
    if(saved?.expiresAt && saved.expiresAt<=serverNow()){historyOfRatings.delete(id);receipts.delete(id);}
    const current=historyOfRatings.get(id);
    const closed=card.dataset.archived==='true',busy=pending.has(id);
    scale.disabled=!catalogReady||closed;
    for(const b of scale.querySelectorAll('[data-score]')){
      b.setAttribute('aria-pressed',String(current?.score===Number(b.dataset.score)));
      b.setAttribute('aria-disabled',String(scale.disabled||busy));
    }
    const next=card.querySelector('[data-action=next]'),skip=card.querySelector('[data-action=skip]');
    next.hidden=!current && !closed;skip.hidden=Boolean(current)||closed;
    for(const b of [next,skip])b.disabled=busy||!catalogReady;
    const previous=card.querySelector('[data-action=previous]');
    previous.hidden=!visit.canGoBack(byId);previous.disabled=busy;
    card.querySelector('[data-action=finish]').hidden=historyOfRatings.size===0 && visit.shown.size<2;
    $('#rating-management').hidden=closed;
    const remove=card.querySelector('[data-action=remove]');remove.setAttribute('aria-disabled',String(scale.disabled||busy));
    text($('#session-progress'),historyOfRatings.size ? historyOfRatings.size+' rated this visit':'');
  }

  function paintReceipt(id) {
    const saved=receipts.get(id);
    if(pending.has(id)){alert.replaceChildren(document.createTextNode('Saving your rating…'));return;}
    if(!saved){alert.replaceChildren();return;}
    const marker=JSON.stringify(saved);
    if(alert.dataset.receipt===marker && alert.childNodes.length)return;
    alert.dataset.receipt=marker;
    alert.replaceChildren(element('p',saved.message,saved.error?'status-error':undefined));
    if(saved.error) alert.append(button('retry-rating','Try rating again'));
    else if(saved.expiresAt){
      const details=element('details',null,'rating-expiry');
      details.append(element('summary','Rating expiry'),element('p','This rating counts through '+when(saved.expiresAt)+'.'));
      alert.append(details);
    }
  }

  function paintIssue(idea,moveFocus=false) {
    const changed=displayedId!==idea.id;
    if(changed) {
      $('#issue-details').open=false;$('#rating-management').open=false;
      role(card,'share-result').replaceChildren();
      const box=role(card,'opportunity-form');box.replaceChildren();box.hidden=true;
      alert.replaceChildren();delete alert.dataset.receipt;
    }
    displayedId=idea.id;card.dataset.id=String(idea.id);card.dataset.archived=String(idea.active===false);
    $('#survey-finished').hidden=true;$('#survey-loading').hidden=true;card.hidden=false;
    text($('#issue-topic'),idea.topic);text($('#issue-title'),idea.title);
    text($('#issue-action'),idea.action);text($('#issue-example'),idea.example);
    card.querySelector('[data-example]').hidden=!idea.example;
    text($('#issue-question'),idea.question);text($('#issue-measure'),idea.measure);
    const archiveNotice=$('#issue-notice');archiveNotice.hidden=idea.active!==false;
    text(archiveNotice,idea.active===false?'This issue is archived and closed for ratings.':'');
    card.querySelector('[data-action=opportunity]').hidden=idea.active===false;
    paintNote(idea.note);applyOwnState(idea.id);paintReceipt(idea.id);
    if(moveFocus){focus($('#issue-title'));card.scrollIntoView({block:'nearest'});}
  }

  function showFinished(endOfList=false,moveFocus=false) {
    done=true;exhausted=endOfList;displayedId=null;
    card.hidden=true;$('#survey-loading').hidden=true;$('#survey-finished').hidden=false;
    text($('#finished-heading'),endOfList?(ideas.length?'You’ve seen every issue':'No active issues'):'Finished for now');
    const n=historyOfRatings.size;
    text($('#finished-message'),n?'You rated '+n+(n===1?' issue':' issues')+' in this visit. Your confirmed ratings have been saved.':'You can browse issues individually or explore the results.');
    $('#survey-finished [data-action=resume]').hidden=endOfList;
    if(moveFocus)focus($('#finished-heading'));
  }

  async function lookup(id,version) {
    const requestKey=id+'-'+version;
    if(awaitingLookup===requestKey)return;
    awaitingLookup=requestKey;
    try {
      const i=await post('/idea',{id});
      if(version!==routeVersion||targetId!==id||mode!=='rate')return;
      if(i.id!==id||typeof i.title!=='string')throw Error();
      if(i.active===false){
        const original=seed.find(item=>item.id===id);
        const closed=original ? {...i,title:original.title,action:original.action} : i;
        archived.set(id,closed);visit.enter(id);paintIssue(closed);
      }
      else {notice('This issue was just updated. Loading its current survey wording.');}
    }catch(e){
      if(version!==routeVersion||targetId!==id)return;
      card.hidden=true;$('#survey-loading').hidden=true;
      notice(e.status===404?'This issue could not be found. Browse the survey to choose another.':'This issue could not be loaded.',e.status!==404);
    }finally{if(awaitingLookup===requestKey)awaitingLookup=null;}
  }

  function showIssue(moveFocus=false) {
    if(done && !targetId){showFinished(exhausted,moveFocus);return;}
    if(targetId){
      const active=byId.get(targetId);
      if(active){visit.enter(targetId);paintIssue(active,moveFocus);return;}
      if(archived.has(targetId)){paintIssue(archived.get(targetId),moveFocus);return;}
      card.hidden=true;$('#survey-loading').hidden=false;
      if(catalogReady)lookup(targetId,routeVersion);
      return;
    }
    if(!catalogReady){card.hidden=true;$('#survey-loading').hidden=false;return;}
    const id=byId.has(visit.current)?visit.current:visit.draw([...byId.keys()]);
    if(id==null){showFinished(true,moveFocus);return;}
    paintIssue(byId.get(id),moveFocus);
  }

  function jumpToRate() {
    if(targetId){history.replaceState(null,'','#rate');targetId=null;lastLocation=location.href;routeVersion++;}
  }

  function advance(back=false) {
    if(!catalogReady||pending.has(displayedId))return;
    jumpToRate();done=false;exhausted=false;
    const id=back?visit.back(byId):visit.draw([...byId.keys()]);
    if(id==null){showFinished(true,true);return;}
    paintIssue(byId.get(id),true);
  }

  async function rate(score) {
    const id=displayedId;
    if(!catalogReady||!id||pending.has(id)||!byId.has(id)||
        !(score===null||Number.isInteger(score)&&score>=1&&score<=10))return;
    const previous=retries.get(id);
    const attempt=previous?.score===score?previous:{score,operation:randomHex(16),issuedAt:Math.floor(serverNow())};
    retries.set(id,attempt);pending.add(id);delete alert.dataset.receipt;
    applyOwnState(id);paintReceipt(id);
    try {
      const r=await post('/survey/rating',{id,...attempt});
      if(!['recorded','changed','unchanged','removed','empty'].includes(r.outcome)||
        !(r.score===null||Number.isInteger(r.score)&&r.score>=1&&r.score<=10)||
        !Number.isFinite(r.asOf)||(r.score!==null&&!Number.isFinite(r.expiresAt)))throw Error();
      setClock(r.asOf);retries.delete(id);
      if(r.score===null)historyOfRatings.delete(id);else historyOfRatings.set(id,{score:r.score,expiresAt:r.expiresAt});
      receipts.set(id,{message:ratingMessage(r),expiresAt:r.expiresAt});
    }catch(err){
      const failed=err.status ? err.message : 'Please check your connection and try again.';
      receipts.set(id,{error:true,message:'Couldn’t confirm this rating. '+failed,score});
      if(err.status && err.status<500 && err.status!==429)retries.delete(id);
    }finally{
      pending.delete(id);
      if(mode==='rate'&&displayedId===id){applyOwnState(id);paintReceipt(id);}
      else if(mode==='rate'&&done)showFinished(exhausted);
    }
  }

  async function copy(box,value,label,manual=value) {
    try {
      if(!navigator.clipboard?.writeText)throw Error();
      await navigator.clipboard.writeText(value);
      box.replaceChildren(element('p',label+' copied.'));
    }catch{
      const field=element('textarea',null,'manual-copy');
      field.readOnly=true;field.rows=2;field.value=manual;field.setAttribute('aria-label',label);
      box.replaceChildren(element('p','Select and copy this link.'),field);
      focus(field);field.select();
    }
  }

  async function share() {
    const idea=knownIdea(displayedId);if(!idea)return;
    const url=publicLink(idea.id),title=idea.title;
    const question='How much of a priority should this change be in your community?';
    if(navigator.share){
      try{await navigator.share({title,text:title+'\n'+question,url});return;}
      catch(e){if(e.name==='AbortError')return;}
    }
    await copy(role(card,'share-result'),title+'\n'+question+'\n'+url,'Public issue link',url);
  }

  function receiptPanel(out,type,id,token,expiresAt) {
    const details=element('details',null,'private-receipt');
    const url=new URL('#status-'+token,pageBase).href;
    const a=element('a','Open private status');a.href=url;a.dataset.statusLink='';
    const copyButton=button('copy-status','Copy private link');
    const result=element('div');result.setAttribute('role','status');
    copyButton.addEventListener('click',()=>copy(result,url,'Private status link'));
    details.append(element('summary','Save a private status link'),element('p','Anyone with this link can check the decision through '+when(expiresAt)+'.'),a,copyButton,result);
    out.replaceChildren(element('p',type==='idea'?'Suggestion received.':'Opening received.'),details);
    if(type==='opportunity'){
      const idea=knownIdea(id);
      if(idea && root.dataset.email){
        const mail=element('a','Email Drew about this pilot');mail.dataset.role='email-pilot';
        mail.href='mailto:'+root.dataset.email+'?subject='+encodeURIComponent('Pilot introduction · Idea '+ideaCode(id)+' · '+idea.title);
        out.append(mail);
      }
    }
  }

  function localMatches(form,value) {
    const box=role(form,'matches');if(!box)return;
    box.replaceChildren();
    if(value.trim().length<3)return;
    const matches=findIdeas(ideas,value).slice(0,2);if(!matches.length)return;
    box.append(element('p','Related issues'));
    for(const i of matches){const a=element('a',i.title);a.href=localLink(i.id);box.append(a);}
  }

  function wireForm(form,type,id) {
    const key=type==='idea'?'idea':'opportunity-'+id;
    const draft=drafts.get(key) || {value:'',pending:false};drafts.set(key,draft);draft.form=form;
    const field=form.elements.namedItem('text'),submit=form.querySelector('button[type=submit]');
    field.value=draft.value;submit.disabled=!api;
    const repaint=()=>{
      const mounted=draft.form;if(!mounted)return;
      const out=role(mounted,'form-result');
      mounted.querySelector('button[type=submit]').setAttribute('aria-disabled',String(draft.pending||!api));
      if(draft.pending){text(out,'Sending…');return;}
      if(draft.error){text(out,draft.error);return;}
      if(draft.success){receiptPanel(out,type,id,draft.success.token,draft.success.expiresAt);return;}
      if(!api)text(out,'Sending is unavailable right now.');
    };
    repaint();
    field.addEventListener('input',()=>{
      draft.value=field.value;
      if(type==='idea')localMatches(form,field.value);
    });
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(!api||draft.pending)return;
      const value=field.value.trim();
      if(!value||value.length>500){
        field.setCustomValidity('Enter between 1 and 500 characters.');
        field.reportValidity();field.setCustomValidity('');return;
      }
      const previous=draft.attempt;
      const attempt=previous?.text===value?previous:{type,...(type==='opportunity'?{id}:{}),text:value,token:randomHex(32)};
      draft.attempt=attempt;draft.pending=true;draft.error=null;repaint();
      try{
        const saved=await post('/submit',attempt);
        if(!Number.isFinite(saved.expiresAt))throw Error();
        draft.success={token:attempt.token,expiresAt:saved.expiresAt};
        if(draft.value.trim()===value){
          draft.value='';draft.form.elements.namedItem('text').value='';
          if(type==='idea')localMatches(draft.form,'');
        }
      }catch(e){
        draft.error='Couldn’t confirm receipt. '+(e.status?e.message:'Please try again.')+' Your text is here.';
      }finally{draft.pending=false;repaint();}
    });
  }

  function openOpportunity() {
    if(!displayedId||card.dataset.archived==='true')return;
    const box=role(card,'opportunity-form');box.hidden=false;
    if(!box.firstElementChild){
      const form=element('form',null,'suggest-form'),label=element('label','Where could someone try this?');
      const field=element('textarea');field.id='pilot-text';field.name='text';field.rows=3;field.required=true;field.maxLength=500;
      label.htmlFor=field.id;
      const hint=element('p','A workplace, organization or public meeting is enough. A public source or deadline can help.','form-hint');
      const send=element('button','Send opening','primary-action');send.type='submit';
      const out=element('div',null,'form-result');out.dataset.role='form-result';out.setAttribute('aria-live','polite');
      form.append(label,hint,field,send,out);box.append(form);wireForm(form,'opportunity',displayedId);
    }
    box.querySelector('textarea').focus();
  }

  async function checkStatus(token,version) {
    receipt.replaceChildren(element('h1','Private submission status'));
    const state=element('p','Checking status…');state.setAttribute('role','status');receipt.append(state);
    if(!/^[a-f0-9]{64}$/.test(token)){
      text(state,'This private link is invalid or has expired.');return;
    }
    try{
      const r=await post('/status',{token});
      if(version!==routeVersion)return;
      if(!statuses[r.status]||!Number.isFinite(r.expiresAt))throw Error();
      text(state,statuses[r.status]);
      receipt.append(element('p','This link expires '+when(r.expiresAt)+'.'));
      if(['published','merged'].includes(r.status)&&Number.isSafeInteger(r.ideaId)){
        const link=element('a','Open the published issue','primary-action');link.href=localLink(r.ideaId);link.dataset.role='public-result';receipt.append(link);
      }
    }catch(e){
      if(version!==routeVersion)return;
      if(e.status===404||e.status===410)text(state,'This private link is invalid or has expired.');
      else{ text(state,'The service could not confirm the status. Keep your link and try again.');receipt.append(button('retry-status','Try again')); }
    }
  }

  async function openResults(version) {
    const view=$('#results-view');
    view.replaceChildren(element('p','Loading results…'));
    try{
      const {mountResults}=await import('./survey-results.mjs');
      if(version!==routeVersion || mode!=='results')return;
      stopResults=mountResults(view,{api,request:safeFetch,onRate:id=>navigate(localLink(id)),onBack:()=>navigate('#rate')});
    }catch{
      if(version===routeVersion && mode==='results'){
        view.replaceChildren(element('p','Results could not be loaded.'),button('retry-results','Try again'));
      }
    }
  }

  let lastLocation='';
  function navigate(hash) {
    if(location.hash===hash){route(false);return;}
    history.pushState(null,'',new URL(hash,pageBase));route(false);
  }

  function route(initial=false) {
    lastLocation=location.href;routeVersion++;
    const hash=location.hash, matches=hash.match(/^#idea-(\d+)$/), status=hash.match(/^#status-(.*)$/);
    targetId=matches?Number(matches[1]):null;
    const next=matches?'rate':status?'status':({'#browse':'browse','#suggest':'suggest','#results':'results'}[hash] || 'rate');
    if(typeof stopResults==='function')stopResults();
    stopResults=undefined;mode=next;root.dataset.view=mode;
    for(const [name,v] of views)v.hidden=name!==mode;
    for(const a of root.querySelectorAll('.view-nav a')){
      if(a.hash==='#'+mode)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    }
    clearTimeout(catalogTimer);
    if(mode==='rate'){
      if(targetId){done=false;exhausted=false;}
      showIssue(false);
      if(!catalogReady&&!refreshing)loadCatalog();else scheduleCatalog();
    }else if(mode==='browse'){
      drawBrowse();
      if(!catalogReady&&!refreshing)loadCatalog();else scheduleCatalog();
    }else if(mode==='suggest'){
      if(!catalogReady&&!refreshing)loadCatalog();else scheduleCatalog();
    }else if(mode==='results'){
      openResults(routeVersion);
    }else if(mode==='status')checkStatus(status[1],routeVersion);
    if(!initial){
      window.scrollTo(0,0);
      const heading=views.get(mode)?.querySelector('h1');
      if(heading){heading.tabIndex=-1;focus(heading);}
    }
  }

  document.querySelector('.skip-link')?.addEventListener('click',event=>{
    event.preventDefault();
    const main=document.querySelector('#main');focus(main);main.scrollIntoView({block:'start'});
  });
  window.addEventListener('popstate',()=>{if(lastLocation!==location.href)route();});
  window.addEventListener('hashchange',()=>{if(lastLocation!==location.href)route();});
  document.addEventListener('visibilitychange',()=>{
    clearTimeout(catalogTimer);
    if(!document.hidden&&['rate','browse','suggest'].includes(mode))loadCatalog();
  });
  window.addEventListener('online',()=>{if(['rate','browse','suggest'].includes(mode))loadCatalog();});
  window.addEventListener('pagehide',()=>clearTimeout(catalogTimer));
  window.addEventListener('pageshow',e=>{if(e.persisted&&['rate','browse','suggest'].includes(mode))loadCatalog();});
  search.addEventListener('input',drawBrowse);
  $('#search-suggest').addEventListener('click',event=>{
    if(event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return;
    event.preventDefault();
    const field=$('#suggest-text');
    // A new search handoff never overwrites an unsent suggestion already in the form.
    if(!field.value.trim()&&search.value.trim()){
      field.value=search.value;field.dispatchEvent(new Event('input',{bubbles:true}));
    }
    navigate('#suggest');field.focus();
  });
  root.addEventListener('click',event=>{
    if(event.defaultPrevented || !(event.target instanceof Element))return;
    const b=event.target.closest('[data-score],[data-action]');if(!b)return;
    if(b.hasAttribute('data-score')){rate(Number(b.dataset.score));return;}
    const action=b.dataset.action;
    if(action==='next'||action==='skip'){advance();return;}
    if(action==='previous'){advance(true);return;}
    if(action==='remove'){rate(null);return;}
    if(action==='retry-rating'){
      const state=receipts.get(displayedId);if(state?.error)rate(state.score);return;
    }
    if(action==='finish'){jumpToRate();showFinished(false,true);return;}
    if(action==='resume'){done=false;showIssue(true);return;}
    if(action==='opportunity'){openOpportunity();return;}
    if(action==='share'){share();return;}
    if(action==='retry-status'||action==='retry-results'){route();return;}
    if(action==='reload-catalog'){notice('Reconnecting…');loadCatalog();}
  });
  wireForm($('#suggest-form'),'idea');
  route(true);
}
