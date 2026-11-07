import { findIdeas, ideaCode, statuses } from './model.mjs';
import { ratingMessage } from './survey-model.mjs';

const root = document.querySelector('[data-north]');
if (root) start(root);

function start(root) {
  const $ = selector => root.querySelector(selector);
  const role = (node, key) => node.querySelector('[data-role="' + key + '"]');
  const list = $('#issue-list');
  const landing = $('#list-view');
  const template = $('#issue-row-template');
  const search = $('#search');
  const more = $('#more-issues');
  const suggest = $('#suggest-panel');
  const statusView = $('#status-view');
  const toggle = $('#show-results');
  const tools = $('#results-tools');
  const seed = JSON.parse($('#north-catalog').textContent);
  const launch = new Map(seed.map(i => [i.id, i]));
  const api = (root.dataset.api || '').replace(/\/$/, '');
  const preview = root.dataset.preview === 'true';
  const ownerSession = preview && root.dataset.ownerSession === 'required' &&
    api && new URL(api, location.href).origin === location.origin;
  const canonical = new URL('/45north/', preview ? location.origin : 'https://drewcleaver.com');
  const pageBase = new URL(location.pathname, location.origin);
  const issueHash = id => '#idea-' + ideaCode(id);

  const rows = new Map([...list.querySelectorAll('article[data-id]')].map(row => [Number(row.dataset.id), row]));
  const order = [...rows.keys()];
  const seen = new Set(order);
  const own = new Map();
  const retries = new Map();
  const pending = new Set();
  const feedback = new Map();
  const archived = new Map();
  const drafts = new Map();
  const rowCopy = new Map();
  const fetchedArchives = new Map();
  let items = seed, byId = new Map(launch), shortlist = new Set(order.slice(0,45));
  let catalogReady = false, offline = false, catalogWait, pollTimer, etag = '', lastCatalog = -1;
  let clock = null, allShown = false, target = null, pinned = null, routeSeq = 0, lastLocation = '';
  let privateToken = null, routeNote = '', results = null, resultsSeq = 0, compare = null;
  let catalogError = '';

  const text = (node, value) => {
    const copy = String(value ?? '');
    if (node && node.textContent !== copy) node.textContent = copy;
  };
  const visible = (node, value) => { if (node && node.hidden === value) node.hidden = !value; };
  const element = (tag, value, cls) => {
    const node = document.createElement(tag);
    if (value != null) node.textContent = value;
    if (cls) node.className = cls;
    return node;
  };
  const button = (action, label, cls = 'text-action') => {
    const control = element('button', label, cls);
    control.type = 'button'; control.dataset.action = action;
    return control;
  };
  const focus = node => node?.focus({preventScroll:true});
  const when = ms => new Intl.DateTimeFormat(undefined, {dateStyle:'medium', timeStyle:'short'}).format(new Date(ms));
  const day = value => new Intl.DateTimeFormat(undefined, {dateStyle:'medium', timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
  const randomHex = bytes => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), b=>b.toString(16).padStart(2,'0')).join('');
  const known = id => byId.get(id) || archived.get(id) || launch.get(id);
  const serverNow = () => clock ? clock.ms + performance.now() - clock.at : Date.now();
  const setClock = ms => {
    if (Number.isFinite(ms) && (!clock || ms >= clock.ms)) clock = {ms, at:performance.now()};
  };

  // The inline first paint already shuffles the server-rendered rows. Fall back to the same draw if needed.
  if (list.dataset.shuffled !== 'true') {
    for (let i=order.length-1; i>0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [order[i],order[j]] = [order[j],order[i]];
    }
    for (const id of order) list.append(rows.get(id));
    list.dataset.shuffled = 'true';
  }

  function request(path, options = {}) {
    if (!api) throw Error('The service is unavailable.');
    return fetch(api+path, {...options, credentials:ownerSession ? 'same-origin' : 'omit',
      referrerPolicy:'no-referrer', redirect:'error',
      signal:options.signal || (typeof AbortSignal.timeout==='function' ? AbortSignal.timeout(14000) : undefined)});
  }

  async function post(path, body) {
    const res = await request(path,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data = await res.json().catch(()=>({}));
    if (!res.ok) {
      const error = Error(data.error || 'The service could not confirm your request.');
      error.status = res.status; throw error;
    }
    return data;
  }

  function paintNotice() {
    const node = $('#catalog-notice'), message = routeNote || catalogError;
    visible(node,Boolean(message));
    if (node.dataset.notice === message) return;
    node.dataset.notice = message; node.replaceChildren();
    if (message) node.append(document.createTextNode(message));
    if (catalogError && !routeNote && api) node.append(' ',button('reload-catalog','Try again'));
  }

  function rememberOrder(id) {
    if (seen.has(id)) return;
    seen.add(id);
    order.splice(Math.floor(Math.random()*(order.length+1)),0,id);
  }

  function paintNote(box,note) {
    if (!box) return;
    const key = JSON.stringify(note || null);
    if (box.dataset.note === key) return;
    box.dataset.note = key; box.replaceChildren(); visible(box,Boolean(note));
    if (!note) return;
    const date = element('time',day(note.date)); date.dateTime = note.date;
    box.append(element('h3','What happened'),date);
    for (const [key,value] of [['Who can act',note.actor],['Next step or decision',note.next],['Evidence or result',note.evidence]]) {
      if (!value) continue;
      const p = element('p'); p.append(element('strong',key+'. '),document.createTextNode(value)); box.append(p);
    }
    if (note.opening) box.append(element('p',note.deadline ? 'Verified opening through '+day(note.deadline)+'.' : 'Verified opening.'));
  }

  function bindRow(idea) {
    let row = rows.get(idea.id);
    if (!row) {
      row = template.content.querySelector('article').cloneNode(true);
      rows.set(idea.id,row); rememberOrder(idea.id);
    }
    const code = ideaCode(idea.id), titleId = 'title-'+code;
    row.id = issueHash(idea.id).slice(1); row.dataset.id = String(idea.id);
    row.setAttribute('aria-labelledby',titleId);
    role(row,'title').id = titleId;
    role(row,'scale').setAttribute('aria-labelledby','rating-label '+titleId);
    const closed = idea.active === false;
    row.dataset.archived = String(closed);
    const signature = JSON.stringify([idea.topic,idea.title,idea.action,idea.example,idea.question,idea.measure,closed]);
    if (rowCopy.get(idea.id) !== signature) {
      rowCopy.set(idea.id,signature);
      for (const field of ['topic','title','action','example','question','measure']) text(role(row,field),idea[field]);
      visible(row.querySelector('[data-example]'),Boolean(idea.example));
      visible(row.querySelector('[data-action=opportunity]'),!closed);
      visible(row.querySelector('[data-action=remove]'),!closed);
      visible(role(row,'archive-notice'),closed);
    }
    paintNote(role(row,'updates'),idea.note);
    paintChoice(row,idea.id);
    return row;
  }

  function setTabStop(row, num) {
    row.dataset.tabScore = String(num);
    for (const b of role(row,'scale').querySelectorAll('[data-score]')) b.tabIndex = Number(b.dataset.score) === num ? 0 : -1;
  }

  function paintChoice(row,id) {
    const chosen = own.get(id);
    if (chosen?.expiresAt <= serverNow()) { own.delete(id); feedback.delete(id); }
    const selected = own.get(id);
    const unavailable = !api || row.dataset.archived === 'true' || !byId.has(id) || (offline && !catalogReady);
    const busy = pending.has(id);
    const scale = role(row,'scale'); scale.disabled = unavailable;
    for (const b of scale.querySelectorAll('[data-score]')) {
      b.setAttribute('aria-pressed',String(selected?.score===Number(b.dataset.score)));
      b.setAttribute('aria-disabled',String(unavailable || busy));
    }
    setTabStop(row,Number(row.dataset.tabScore) || selected?.score || 1);
    const remove = row.querySelector('[data-action=remove]');
    if (remove) { remove.disabled = unavailable; remove.setAttribute('aria-disabled',String(unavailable||busy)); }
    const out = role(row,'receipt'), confirmation = feedback.get(id);
    const key = busy ? 'pending' : JSON.stringify(confirmation || null);
    if (out.dataset.state === key) return;
    out.dataset.state = key; out.replaceChildren();
    if (busy) { out.append(document.createTextNode('Saving your rating…')); return; }
    if (!confirmation) return;
    out.append(element('span',confirmation.message,confirmation.error ? 'status-error' : ''));
    if (confirmation.error) out.append(' ',button('retry-rating','Retry'));
    else if (selected) {
      out.append(' ',button('remove','Remove rating','text-action receipt-remove'));
      const detail = element('details',null,'rating-expiry');
      detail.append(element('summary','Rating expiry'),element('p','This rating counts through '+when(selected.expiresAt)+'.'));
      out.append(detail);
    }
  }

  function activeInteraction() {
    return pinned != null || list.contains(document.activeElement) || pending.size > 0;
  }

  // Keep the same elements while filtering, including every textarea, expanded description and live receipt.
  function display({explicit=false}={}) {
    const q = search.value.trim();
    const found = q ? findIdeas(items,q) : items;
    const match = new Set(found.map(i=>i.id));
    const eligible = new Set([...match].filter(id=>Boolean(q)||allShown||shortlist.has(id)));
    if (target!=null && rows.has(target) && !q) eligible.add(target);
    const limit = Math.min(45,items.length);
    text($('#list-count'),limit);
    const extra = Math.max(0,items.length - shortlist.size);
    visible(more,Boolean(extra&&!q));
    if (more) {
      more.setAttribute('aria-expanded',String(allShown));
      text(more,allShown ? 'Show the Top 45 only' : 'Show '+extra+(extra===1?' more issue':' more issues'));
    }
    const n = found.length;
    text($('#search-summary'),q ? (n ? n+(n===1?' matching issue':' matching issues') : 'No matching issues.') : '');
    const suggestSearch = $('#search-suggest');
    visible(suggestSearch,Boolean(q));
    if (suggestSearch) text(suggestSearch,'Suggest this issue');

    const protect = !explicit && activeInteraction() && !q;
    let anchored = pinned ?? Number(document.activeElement?.closest?.('article[data-id]')?.dataset.id);
    if (protect && anchored && rows.has(anchored)) eligible.add(anchored);
    for (const [id,row] of rows) {
      if (!row.parentNode) list.append(row);
      // A change to the shortlist must not hide/remove an item above the reader’s active control.
      if (!protect || row.hidden || !anchored) visible(row,eligible.has(id));
    }
    if (!protect) {
      const ids = order.filter(id=>rows.has(id));
      if (compare) ids.sort(compare);
      let cursor = list.firstElementChild;
      for (const id of ids) {
        const row = rows.get(id);
        if (row !== cursor) list.insertBefore(row,cursor);
        cursor = row.nextElementSibling;
      }
    }
    results?.syncRows();
  }

  function reportCatalog(v) {
    if (v.version!=='priority-v2' || !Array.isArray(v.ideas) || !v.ideas.every(i=>
      Number.isSafeInteger(i.id)&&i.id>0&&typeof i.title==='string'&&typeof i.action==='string')) throw Error('Invalid catalog');
    if (Number.isFinite(v.asOf) && v.asOf < lastCatalog) return;
    lastCatalog = v.asOf ?? lastCatalog; setClock(v.asOf);
    items = v.ideas; byId = new Map(items.map(i=>[i.id,i]));
    const named = Array.isArray(v.landingIds) ? [...new Set(v.landingIds)].filter(id=>byId.has(id)) : [];
    shortlist = new Set(named.length === Math.min(45,items.length) ? named : items.slice(0,45).map(i=>i.id));
    catalogReady = true; offline = false; catalogError = '';
    for (const i of items) bindRow(i);
    for (const [id,row] of rows) if (!byId.has(id)) {
      row.dataset.archived = 'true'; paintChoice(row,id);
    }
    if (!privateToken) display();
    if (target!=null && !byId.has(target)) lookupTarget(target,routeSeq);
    if (target!=null && byId.has(target) && !jumped) jump(target);
    paintNotice();
  }

  function scheduleCatalog(delay = catalogError ? 15000 : 45000) {
    clearTimeout(pollTimer);
    if (api && !document.hidden && privateToken===null) pollTimer=setTimeout(loadCatalog,delay);
  }

  async function loadCatalog() {
    if (catalogWait || privateToken!==null || document.hidden) return catalogWait;
    if (!api) {
      catalogError='Live ratings are unavailable. You can still read the launch proposals.';paintNotice();return;
    }
    catalogWait=(async()=>{
      try {
        const res=await request('/survey/catalog',{cache:'no-cache',headers:etag ? {'If-None-Match':etag}:{}});
        if (res.status!==304) {
          if (!res.ok) throw Error();
          reportCatalog(await res.json()); etag=res.headers.get('etag')||'';
        } else {
          offline=false; catalogError=''; paintNotice();
        }
      } catch {
        offline = true;
        catalogError = catalogReady ? 'Showing the last available issue list. Reconnecting…' :
          'The live survey is unavailable. Showing the saved launch proposals.';
        paintNotice();
        if (!catalogReady) for (const [id,row] of rows) paintChoice(row,id);
      } finally { catalogWait=null; scheduleCatalog(); }
    })();
    return catalogWait;
  }

  async function rate(row,score) {
    const id = Number(row.dataset.id);
    if (!api||!byId.has(id)||pending.has(id)||role(row,'scale').disabled||
        !(score===null||Number.isInteger(score)&&score>=1&&score<=10)) return;
    const prior = retries.get(id);
    const attempt = prior?.score===score ? prior : {score,operation:randomHex(16),issuedAt:Math.floor(serverNow())};
    retries.set(id,attempt); pending.add(id); paintChoice(row,id);
    let time=0;
    try {
      const answer=await post('/survey/rating',{id,...attempt});
      if (!['recorded','changed','unchanged','removed','empty'].includes(answer.outcome) ||
          !(answer.score===null||Number.isInteger(answer.score)&&answer.score>=1&&answer.score<=10) ||
          !Number.isFinite(answer.asOf)||(answer.score!==null&&!Number.isFinite(answer.expiresAt))) throw Error();
      setClock(answer.asOf);time=answer.asOf;retries.delete(id);
      if (answer.score===null) own.delete(id);
      else {
        own.set(id,{score:answer.score,expiresAt:answer.expiresAt});
        setTabStop(row,answer.score);
      }
      feedback.set(id,{message:ratingMessage(answer),expiresAt:answer.expiresAt});
    } catch (e) {
      feedback.set(id,{error:true,score,message:'Couldn’t confirm this rating. '+(e.status?e.message:'Check your connection and try again.')});
      if (e.status && e.status<500 && e.status!==429) retries.delete(id);
    } finally {
      pending.delete(id); paintChoice(row,id);
      if (time) {
        results?.refresh({force:true,after:time});
        if (items.length>45) scheduleCatalog(200);
      }
    }
  }

  async function copy(box,value,label,manual=value) {
    try {
      if (!navigator.clipboard?.writeText) throw Error();
      await navigator.clipboard.writeText(value);
      box.replaceChildren(element('p',label+' copied.'));
    } catch {
      const field=element('textarea',null,'manual-copy');
      field.readOnly=true;field.rows=2;field.value=manual;field.setAttribute('aria-label',label);
      box.replaceChildren(element('p','Select and copy this link.'),field);
      focus(field); field.select();
    }
  }

  async function share(row) {
    const i=known(Number(row.dataset.id)); if (!i) return;
    const url=new URL(issueHash(i.id),canonical).href;
    const question='How much of a priority should this change be in your community?';
    if (navigator.share) {
      try { await navigator.share({title:i.title,text:i.title+'\n'+question,url}); return; }
      catch(e) { if (e.name==='AbortError') return; }
    }
    await copy(role(row,'share-result'),i.title+'\n'+question+'\n'+url,'Public issue link',url);
  }

  function receiptPanel(out,type,id,token,expiresAt) {
    const detail=element('details',null,'private-receipt');
    const url=new URL('#status-'+token,pageBase).href;
    const link=element('a','Open private status'); link.href=url; link.dataset.statusLink='';
    const save=button('copy-status','Copy private link');
    const message=element('div'); message.setAttribute('role','status');
    save.addEventListener('click',()=>copy(message,url,'Private status link'));
    detail.append(element('summary','Save a private status link'),
      element('p','Anyone with this link can check the decision through '+when(expiresAt)+'.'),link,save,message);
    out.replaceChildren(element('p',type==='idea'?'Suggestion received.':'Opening received.'),detail);
    if (type==='opportunity' && root.dataset.email) {
      const i=known(id);
      if (i) {
        const mail=element('a','Email Drew about this pilot'); mail.dataset.role='email-pilot';
        mail.href='mailto:'+root.dataset.email+'?subject='+encodeURIComponent('Pilot introduction · Idea '+ideaCode(id)+' · '+i.title);
        out.append(mail);
      }
    }
  }

  function localMatches(form,value) {
    const box=role(form,'matches'); if (!box) return;
    box.replaceChildren();
    if (value.trim().length<3) return;
    const matches=findIdeas(items,value).slice(0,2);
    if (!matches.length) return;
    box.append(element('p','Related issues'));
    for (const i of matches) {
      const a=element('a',i.title);a.href=issueHash(i.id);box.append(a);
    }
  }

  function wireForm(form,type,id) {
    const key=type==='idea'?'idea':'opportunity-'+id;
    const draft=drafts.get(key)||{value:'',sending:false};drafts.set(key,draft);draft.form=form;
    const field=form.elements.namedItem('text'),submit=form.querySelector('[type=submit]');
    field.value=draft.value;submit.disabled=!api;
    const paint=()=>{
      const out=role(form,'form-result');
      submit.setAttribute('aria-disabled',String(!api||draft.sending));
      if (draft.sending) { text(out,'Sending…'); return; }
      if (draft.error) { text(out,draft.error); return; }
      if (draft.success) { receiptPanel(out,type,id,draft.success.token,draft.success.expiresAt); return; }
      if (!api) text(out,'Sending is unavailable right now.');
    };
    paint();
    field.addEventListener('input',()=>{
      draft.value=field.value;
      if (type==='idea') localMatches(form,field.value);
    });
    form.addEventListener('submit',async e=>{
      e.preventDefault(); if (!api||draft.sending) return;
      const value=field.value.trim();
      if (!value||value.length>500) {
        field.setCustomValidity('Enter between 1 and 500 characters.');field.reportValidity();field.setCustomValidity('');return;
      }
      const prior=draft.attempt;
      const attempt=prior?.text===value?prior:{type,...(type==='opportunity'?{id}:{}),text:value,token:randomHex(32)};
      draft.attempt=attempt;draft.sending=true;draft.error=null;paint();
      try {
        const saved=await post('/submit',attempt);
        if (!Number.isFinite(saved.expiresAt)) throw Error();
        draft.success={token:attempt.token,expiresAt:saved.expiresAt};
        if (draft.value.trim()===value) {
          draft.value='';field.value='';
          if (type==='idea') localMatches(form,'');
        }
      } catch(err) {
        draft.error='Couldn’t confirm receipt. '+(err.status?err.message:'Please try again.')+' Your text is here.';
      } finally { draft.sending=false;paint(); }
    });
  }

  function opportunity(row) {
    const id=Number(row.dataset.id);
    if (!byId.has(id)||row.dataset.archived==='true') return;
    const box=role(row,'opportunity-form');
    if (!box.firstElementChild) {
      const form=element('form',null,'suggest-form');
      const field=element('textarea');field.id='pilot-text-'+ideaCode(id);field.name='text';field.rows=3;field.required=true;field.maxLength=500;
      const label=element('label','Where could someone try this?');label.htmlFor=field.id;
      const hint=element('p','A workplace, organization or public meeting is enough. A public source or deadline can help.','form-hint');
      const submit=element('button','Send opening','primary-action');submit.type='submit';
      const out=element('div',null,'form-result');out.dataset.role='form-result';out.setAttribute('aria-live','polite');
      form.append(label,hint,field,submit,out);box.append(form);wireForm(form,'opportunity',id);
    }
    visible(box,true);box.querySelector('textarea').focus();
  }

  function goSuggestion(fromSearch) {
    const field=$('#suggest-text');
    if (fromSearch && !field.value.trim() && search.value.trim()) {
      field.value=search.value;field.dispatchEvent(new Event('input',{bubbles:true}));
    }
    suggest.open=true;
    requestAnimationFrame(()=>{field.focus({preventScroll:true});suggest.scrollIntoView({block:'nearest'});});
  }

  async function checkStatus(token,version) {
    const heading=element('h1','Private submission status');heading.tabIndex=-1;
    const state=element('p','Checking status…'); state.setAttribute('role','status');
    const back=element('a','Return to the issues','text-action');back.href='#rate';
    statusView.replaceChildren(heading,state,back);
    if (!/^[a-f0-9]{64}$/.test(token)) {text(state,'This private link is invalid or has expired.');return;}
    try {
      const r=await post('/status',{token});if(version!==routeSeq)return;
      if (!Object.hasOwn(statuses,r.status)||!Number.isFinite(r.expiresAt)) throw Error();
      text(state,statuses[r.status]);
      back.before(element('p','This link expires '+when(r.expiresAt)+'.'));
      if (['published','merged'].includes(r.status)&&Number.isSafeInteger(r.ideaId)) {
        const a=element('a','Open the published issue','primary-action');a.href=issueHash(r.ideaId);a.dataset.role='public-result';back.before(a);
      }
    } catch(e) {
      if (version!==routeSeq) return;
      if (e.status===404 || e.status===410) text(state,'This private link is invalid or has expired.');
      else {text(state,'The service could not confirm the status. Keep your link and try again.');back.before(button('retry-status','Try again'));}
    }
  }

  let jumped=false;
  function jump(id) {
    const row=rows.get(id);
    if (!row || !row.isConnected || row.hidden || id!==target || jumped) return;
    jumped=true; const version=routeSeq;
    requestAnimationFrame(()=>{
      if (version!==routeSeq || target!==id || !row.isConnected) return;
      focus(role(row,'title'));row.scrollIntoView({block:'start'});
    });
  }

  async function lookupTarget(id,version) {
    if (archived.has(id)) {display({explicit:true});jump(id);return;}
    const key=id+'-'+version;if(fetchedArchives.has(key))return;
    fetchedArchives.set(key,true);
    try {
      const item=await post('/idea',{id});
      if (version!==routeSeq || target!==id || byId.has(id)) return;
      if (item.id!==id||typeof item.title!=='string') throw Error();
      if (item.active===false) {
        const original=launch.get(id);
        const frozen=original?{...item,title:original.title,action:original.action}:item;
        archived.set(id,frozen);
        bindRow(frozen);routeNote='This linked issue is archived and closed for ratings.';
        display({explicit:true});jump(id);
      } else {
        // Publication completed between the catalog and details requests. The catalog supplies the frozen survey wording.
        routeNote='This issue was just updated. Refreshing the list…';scheduleCatalog(250);
      }
    } catch(e) {
      if (version!==routeSeq || target!==id || byId.has(id)) return;
      routeNote=e.status===404?'This issue could not be found. The active issues are listed below.':'The linked issue could not be loaded. Please try again.';
      if(e.status!==404) fetchedArchives.delete(key);
    } finally { if(version===routeSeq)paintNotice(); }
  }

  function hideResults() {
    resultsSeq++;
    if (results) results.destroy();
    results=null;compare=null;toggle.checked=false;tools.hidden=true;tools.replaceChildren();
    for (const row of rows.values()) {
      const box=role(row,'results');if(box){box.hidden=true;box.replaceChildren();}
    }
  }

  async function showResults() {
    if (results) return;
    const version=++resultsSeq;
    toggle.checked=true;tools.hidden=false;tools.replaceChildren(element('p','Loading community results…'));
    try {
      const {mountInlineResults}=await import('./issue-list-results.mjs');
      if(version!==resultsSeq||!toggle.checked||privateToken!==null)return;
      results=mountInlineResults({
        tools,
        getRows:()=>[...rows].map(([id,row])=>[id,role(row,'results')]),
        request,
        onSort:(mode,sort)=>{
          const changed=sort===null?compare!==null:mode!==tools.dataset.order;
          tools.dataset.order=mode;compare=sort;
          display({explicit:changed});
        }
      });
    } catch {
      if (version===resultsSeq&&toggle.checked) tools.replaceChildren(element('p','Community results are temporarily unavailable.'),button('retry-results','Try again'));
    }
  }

  function navigate(hash) {
    if(location.hash!==hash) history.pushState(null,'',new URL(hash||location.pathname,pageBase));
    route();
  }

  function route(initial=false) {
    const version=++routeSeq;lastLocation=location.href;
    const hash=location.hash,match=hash.match(/^#idea-(\d+)$/),status=hash.match(/^#status-(.*)$/);
    jumped=false;routeNote='';target=match?Number(match[1]):null;
    privateToken=status?status[1]:null;
    landing.hidden=Boolean(status);statusView.hidden=!status;
    if(status){
      pinned=null;hideResults();clearTimeout(pollTimer);checkStatus(status[1],version);
      statusView.scrollIntoView({block:'start'});return;
    }
    statusView.replaceChildren();
    if (target!==null) {
      pinned=null;search.value='';
      if(byId.has(target)){
        display({explicit:true});jump(target);
      }else if(archived.has(target)){
        display({explicit:true});jump(target);
      }else if(catalogReady){
        lookupTarget(target,version);
      }else {routeNote='Loading the linked issue…';display({explicit:true});}
    } else {
      display({explicit:true});
      if(hash==='#results'){
        showResults();
        if(!initial){focus(toggle);toggle.scrollIntoView({block:'nearest'});}
      }else if(hash==='#browse'){
        focus(search);search.scrollIntoView({block:'nearest'});
      }else if(hash==='#suggest'){
        goSuggestion(false);
      }else if(!initial && (hash==='#rate'||!hash)){
        focus($('#list-title'));window.scrollTo(0,0);
      }
    }
    paintNotice();
    if (!catalogReady) loadCatalog(); else scheduleCatalog();
  }

  for (const i of items) bindRow(i);

  list.addEventListener('keydown',e=>{
    const selected=e.target.closest?.('button[data-score]');
    if (!selected || e.altKey||e.metaKey||e.ctrlKey) return;
    const current=Number(selected.dataset.score);
    const to={ArrowRight:Math.min(10,current+1),ArrowDown:Math.min(10,current+1),
      ArrowLeft:Math.max(1,current-1),ArrowUp:Math.max(1,current-1),Home:1,End:10}[e.key];
    if (!to) return;
    e.preventDefault();
    const row=selected.closest('article[data-id]');
    setTabStop(row,to);focus(role(row,'scale').querySelector('[data-score="'+to+'"]'));
  });

  list.addEventListener('click',e=>{
    if(!(e.target instanceof Element))return;
    const row=e.target.closest('article[data-id]');if(!row)return;
    const control=e.target.closest('button[data-score],button[data-action]');if(!control)return;
    if(control.hasAttribute('data-score')){
      setTabStop(row,Number(control.dataset.score));rate(row,Number(control.dataset.score));return;
    }
    const id=Number(row.dataset.id);
    switch(control.dataset.action){
      case 'remove': rate(row,null);break;
      case 'retry-rating': {
        const value=feedback.get(id);if(value?.error)rate(row,value.score);
        break;
      }
      case 'share': share(row);break;
      case 'opportunity': opportunity(row);break;
    }
  });

  function pinFrom(node) {
    const row=node?.closest?.('article[data-id]'),next=row?Number(row.dataset.id):null;
    if(next===pinned)return;
    const old=pinned;pinned=next;
    if(old!=null&&next===null&&!privateToken)display();
  }
  document.addEventListener('focusin',e=>pinFrom(e.target));
  document.addEventListener('pointerdown',e=>pinFrom(e.target),{passive:true});

  search.addEventListener('input',()=>{
    pinned=null;target=null;
    if(/^#idea-\d+$/.test(location.hash)){
      history.replaceState(null,'',location.pathname+location.search);lastLocation=location.href;
    }
    display({explicit:true});
  });

  more?.addEventListener('click',()=>{
    allShown=!allShown;pinned=null;display({explicit:true});
    if(allShown&&!search.value.trim()){
      const first=order.find(id=>!shortlist.has(id)&&byId.has(id));
      if(first!=null)focus(role(rows.get(first),'title'));
    }
  });

  toggle.addEventListener('change',()=>{
    if(toggle.checked)showResults();
    else{
      hideResults();
      if(location.hash==='#results'){history.replaceState(null,'',location.pathname+location.search);lastLocation=location.href;}
      display({explicit:true});
    }
  });

  root.addEventListener('click',e=>{
    if(!(e.target instanceof Element)||e.defaultPrevented)return;
    const control=e.target.closest('button[data-action]');
    if(control?.dataset.action==='reload-catalog'){loadCatalog();return;}
    if(control?.dataset.action==='retry-results'){showResults();return;}
    if(control?.dataset.action==='retry-status'&&privateToken!==null){checkStatus(privateToken,++routeSeq);return;}
    const a=e.target.closest('a');
    if(!a||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.button!==0)return;
    const url=new URL(a.href,location.href);
    if(url.origin!==location.origin || url.pathname!==location.pathname || !url.hash)return;
    if(url.hash==='#main'){e.preventDefault();focus($('#main'));$('#main').scrollIntoView({block:'start'});return;}
    if(a.id==='search-suggest'){
      e.preventDefault();navigate('#suggest');goSuggestion(true);return;
    }
    if(/^#(?:idea-\d+|status-.*|rate|browse|results|suggest)$/.test(url.hash)){
      e.preventDefault();navigate(url.hash);
    }
  });

  wireForm($('#suggest-form'),'idea');
  window.addEventListener('hashchange',()=>{if(lastLocation!==location.href)route();});
  window.addEventListener('popstate',()=>{if(lastLocation!==location.href)route();});
  window.addEventListener('pagehide',()=>clearTimeout(pollTimer));
  window.addEventListener('pageshow',e=>{if(e.persisted&&privateToken===null)loadCatalog();});
  window.addEventListener('online',()=>{if(privateToken===null)loadCatalog();});
  document.addEventListener('visibilitychange',()=>{
    clearTimeout(pollTimer);
    if(!document.hidden&&privateToken===null)loadCatalog();
  });
  route(true);
}
