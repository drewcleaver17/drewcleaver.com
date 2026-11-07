import { ideaCode, signed, tally, findIdeas, VisitDeck, voteMessage, statuses } from './model.mjs';

const app = document.querySelector('[data-north]');
if (app) start(app);

function start(root) {
  const $ = s => root.querySelector(s);
  const slot = (node, name) => node.querySelector('[data-role="' + name + '"]');
  const chart = $('#chart-view'), list = $('#chart-list'), single = $('#shared-view');
  const deck = $('#deck-view'), receipt = $('#status-view'), suggest = $('#suggest-view');
  const search = $('#search'), template = document.querySelector('#north-card');
  const seed = JSON.parse(document.querySelector('#north-catalog').textContent);
  const api = (root.dataset.api || '').replace(/\/$/, '');
  const preview = Boolean(root.dataset.preview && root.dataset.preview !== 'false');
  // Only the explicitly private reviewer site needs its existing same-origin login.
  const ownerReview = preview && root.dataset.ownerSession === 'required'
    && api && new URL(api,location.href).origin === location.origin;
  const requestCredentials = ownerReview ? 'same-origin' : 'omit';
  const publicBase = new URL('/45north/', preview ? location.origin : 'https://drewcleaver.com');
  const pageBase = new URL(location.pathname, location.origin);
  const cardLink = id => new URL('#idea-' + ideaCode(id), publicBase).href;
  const localLink = id => '#idea-' + ideaCode(id);
  let ideas = seed, byId = new Map(seed.map(i => [i.id,i])), mode = '', routeId = null;
  let live = false, offline = false, etag = '', feedAt = -1, latestWrite = -1;
  let pinned = null, more = false, pollTimer, failureCount = 0, inFlight = false;
  let routeVersion = 0, scrollBack = 0, returnFocus = null, lastSnapshot = null;
  let session = [], cardIndex = 0, revealed = false, awaitingDeck = false;
  const draw = new VisitDeck(), rowMap = new Map();
  const pending = new Set(), retry = new Map(), own = new Map(), rowAsOf = new Map(), drafts = new Map();
  const boundForms = new WeakSet();
  const text = (n, s) => { if (n && n.textContent !== s) n.textContent = s; };
  const visible = (n, yes) => { if (n && n.hidden === yes) n.hidden = !yes; };
  const element = (tag, value, cls) => {
    const n = document.createElement(tag);
    if (value) n.textContent = value;
    if (cls) n.className = cls;
    return n;
  };
  const button = (name, value) => {
    const n = element('button', value);
    n.type = 'button'; n.dataset.action = name;
    return n;
  };
  const randomHex = size => Array.from(crypto.getRandomValues(new Uint8Array(size)), n => n.toString(16).padStart(2, '0')).join('');
  const labelDate = ms => new Intl.DateTimeFormat(undefined, {dateStyle:'medium',timeStyle:'short'}).format(new Date(ms));
  const dateOnly = value => {
    if (!value) return '';
    const ms = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00Z') : new Date(value);
    return Number.isNaN(ms.valueOf()) ? String(value) : new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeZone:'UTC'}).format(ms);
  };
  const controls = row => row.querySelectorAll('[data-vote], [data-action="remove"]');
  function focus(n) { if (n) n.focus({preventScroll:true}); }
  function focusHeading(parent) {
    const heading = parent.querySelector('h1,h2,h3,[data-role=title]');
    if (heading) { heading.tabIndex = -1; focus(heading); }
  }
  function safeFetch(path, opts) {
    if (!api) throw new Error('The live service is unavailable.');
    return fetch(api + path, {credentials:requestCredentials,referrerPolicy:'no-referrer',redirect:'error',...opts,
      signal:typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(16000) : undefined});
  }
  async function post(path, data) {
    const response = await safeFetch(path, {method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const e = new Error(typeof body.error === 'string' ? body.error : 'The service could not confirm this request.');
      e.status = response.status; throw e;
    }
    return body;
  }
  function feedMessage() {
    if (!api) return 'Reading the launch catalog. Live standings and voting are unavailable.';
    if (offline && !live) return 'Live standings are unavailable. Showing the launch catalog. Retrying…';
    if (offline) return 'Showing the last confirmed standings. Reconnecting…';
    if (!live) return 'Checking live standings…';
    if (!ideas.length) return 'There are no active ideas right now.';
    if (ideas.every(i => i.higher === 0 && i.lower === 0)) return 'All ideas are tied at zero. Permanent idea numbers break ties.';
    return 'Ranked by net upvotes over the past 30 days.';
  }
  function updateState() {
    text($('#chart-state'), feedMessage());
    const sn = $('[data-role="snapshot"]');
    if (sn) {
      visible(sn, Boolean(lastSnapshot));
      if (lastSnapshot) text(sn,'Movement since ' + labelDate(lastSnapshot) + '.');
    }
  }
  function schedule(delay = failureCount ? Math.min(60000, 7000 * 2 ** Math.min(failureCount,3)) : 6500) {
    clearTimeout(pollTimer);
    if (api && !document.hidden && mode !== 'status') pollTimer = setTimeout(refresh, delay);
  }
  async function refresh() {
    if (!api || document.hidden || mode === 'status' || inFlight) return;
    inFlight = true;
    try {
      const res = await safeFetch('/feed', {cache:'no-cache',headers:etag ? {'If-None-Match':etag} : {}});
      if (res.status !== 304) {
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!Array.isArray(data.ideas) || !Number.isFinite(data.asOf)) throw new Error();
        if (data.asOf >= Math.max(feedAt,latestWrite)) {
          ideas = data.ideas;
          byId = new Map(ideas.map(i => [i.id,i]));
          feedAt = data.asOf; clockSample = {server:data.asOf,local:performance.now()}; lastSnapshot = data.snapshotAt;
          etag = res.headers.get('ETag') || '';
          live = true;
          updateChart();
          if (mode === 'single') updateSingle();
          if (mode === 'deck') updateDeck();
        }
      }
      offline = false; failureCount = 0;
    } catch {
      offline = true; failureCount++;
      if (mode==='deck' && awaitingDeck) text(deck.querySelector('p'),'The full list of active ideas is unavailable. Retrying…');
    }
    finally { inFlight = false; updateState(); schedule(); }
  }

  function paintNote(box, note) {
    if (!box) return;
    const signature = JSON.stringify(note || null);
    if (box.dataset.note === signature) return;
    box.dataset.note = signature; box.replaceChildren(); visible(box, Boolean(note));
    if (!note) return;
    const heading = element('h4','What happened'), time = element('time',dateOnly(note.date));
    time.dateTime = note.date;
    box.append(heading,time);
    for (const [label, value] of [['Who can act',note.actor],['Next step or decision',note.next],['Evidence or result',note.evidence]]) {
      if (!value) continue;
      const p = element('p'); p.append(element('strong',label + '. '),document.createTextNode(value)); box.append(p);
    }
    if (note.opening) box.append(element('p',note.deadline ? 'Verified opening through ' + dateOnly(note.deadline) + '.' : 'Verified opening.'));
  }

  function paint(row, idea) {
    if (!row || !idea) return;
    const id = idea.id, blind = row.dataset.mode === 'deck' && !revealed;
    const countKnown = Number.isInteger(idea.higher) && Number.isInteger(idea.lower);
    const rank = slot(row,'rank'), tallyEl = slot(row,'tally'), breakdown = slot(row,'breakdown');
    for (const k of ['title','topic','action','question','measure']) text(slot(row,k),idea[k] || '');
    const codeEl = slot(row,'id') || slot(row,'code');
    if (codeEl) text(codeEl, 'Idea ' + ideaCode(id));
    const example = slot(row,'example');
    if (example) { text(example, idea.example || ''); visible(example.closest('[data-example]') || example, Boolean(idea.example)); }
    visible(rank,!blind); visible(tallyEl,!blind); visible(breakdown,!blind);
    if (!blind) {
      text(rank,idea.rank ? '#' + idea.rank : '—');
      rank?.setAttribute('aria-label',idea.rank ? 'Chart position ' + idea.rank : countKnown ? 'Outside the top 250' : 'Rank unavailable');
      text(tallyEl,tally(idea));
      text(breakdown,countKnown ? idea.higher + (idea.higher === 1 ? ' upvote' : ' upvotes') + ' · ' + idea.lower + (idea.lower === 1 ? ' downvote' : ' downvotes') + (idea.rank == null ? ' · Outside the top 250' : '') : 'The live vote breakdown is unavailable.');
    }
    const movement = slot(row,'movement');
    const compared = !blind && Number.isInteger(idea.previousRank) && Number.isInteger(idea.rank);
    visible(movement,compared);
    if (compared) {
      const d = idea.previousRank - idea.rank;
      text(movement,d === 0 ? 'Same rank as Friday' : (d > 0 ? 'Up ' : 'Down ') + Math.abs(d) + ' since Friday');
    }
    paintNote(slot(row,'updates'),idea.note);
    const current = own.get(id), expired = current?.expiresAt && current.expiresAt <= approximateClock();
    for (const b of controls(row)) {
      b.disabled = !api || row.dataset.archived === 'true';
      b.setAttribute('aria-disabled', String(b.disabled || pending.has(id)));
      if (b.hasAttribute('data-vote')) {
        if (!current || blind) b.removeAttribute('aria-pressed');
        else b.setAttribute('aria-pressed',String(!expired && current.state === Number(b.dataset.vote)));
      }
    }
    if (blind) visible(slot(row,'receipt'),row.dataset.unconfirmed === 'true');
    else visible(slot(row,'receipt'),true);
  }
  function makeCard(idea, type) {
    const row = template.content.firstElementChild.cloneNode(true);
    // A permanent ID belongs to the chart row only. Focused copies have no global IDs.
    for (const n of [row,...row.querySelectorAll('[id]')]) n.removeAttribute('id');
    row.dataset.id = String(idea.id); row.dataset.mode = type;
    if (type === 'chart') row.id = 'idea-' + ideaCode(idea.id);
    else {
      const details = row.querySelector('details.idea-details');
      if (details) details.open = true;
      if (type === 'single') {
        const old = slot(row,'title'), heading = element('h1',null,old.className);
        heading.dataset.role='title'; old.replaceWith(heading);
      }
      const privacy = element('p', (ownerReview ? 'The public chart: ' : '') + 'No cookies. No Google or ad tracking. No account needed.','privacy-short');
      privacy.classList.add('mode-privacy'); row.append(privacy);
    }
    paint(row,idea);
    return row;
  }
  function sortChart(ordered) {
    // Moving a focused card can throw away keyboard focus. Its rank text still updates in place.
    if (pinned != null && mode === 'chart') return;
    let next = list.firstElementChild;
    for (const id of ordered) {
      const row = rowMap.get(id);
      if (row === next) next = next.nextElementSibling;
      else list.insertBefore(row,next);
    }
  }
  function updateChart() {
    for (const idea of ideas) {
      let row = rowMap.get(idea.id);
      if (!row) { row = makeCard(idea,'chart'); rowMap.set(idea.id,row); list.append(row); }
      else paint(row,idea);
    }
    for (const [id,row] of rowMap) if (!byId.has(id)) { row.remove(); rowMap.delete(id); if(pinned === id) pinned = null; }
    filterChart();
  }
  function filterChart() {
    const q = search?.value.trim() || '';
    const matches = q ? findIdeas(ideas,q) : ideas;
    const shown = matches.filter(i => q || more || !live || i.rank != null);
    const ids = new Set(shown.map(i => i.id));
    for (const [id,row] of rowMap) visible(row,ids.has(id));
    sortChart([...ids,...[...rowMap.keys()].filter(id => !ids.has(id))]);
    const contenderCount = live ? ideas.filter(i => i.rank == null).length : 0;
    const extra = $('#more-ideas'); visible(extra,Boolean(!q && contenderCount));
    if (extra) { text(extra,more ? 'Show top 250 only' : 'More ideas (' + contenderCount + ')'); extra.setAttribute('aria-expanded',String(more)); }
    visible($('#search-suggest'),Boolean(q));
    const summary = $('#search-summary');
    visible(summary,Boolean(q)); text(summary,!q ? '' : shown.length ? shown.length + (shown.length === 1 ? ' matching idea' : ' matching ideas') : 'No matching ideas. Suggest this in your own words.');
  }
  for (const row of list.querySelectorAll('.idea-row[data-id]')) rowMap.set(Number(row.dataset.id),row);
  function focusPin(n) {
    const row = n?.closest?.('#chart-list .idea-row');
    const next = row ? Number(row.dataset.id) : null;
    if (next === pinned) return;
    const previously = pinned; pinned = next;
    if (previously != null && next == null && mode === 'chart') filterChart();
  }
  root.addEventListener('focusin', e => focusPin(e.target));
  root.addEventListener('pointerdown',e => focusPin(e.target));
  list.addEventListener('focusout',e => {
    if (e.relatedTarget && !list.contains(e.relatedTarget)) focusPin(e.relatedTarget);
  });

  function viewTop(box, title) {
    const top = element('div',null,'north-focus-head');
    const leave = element('a','See the chart'); leave.dataset.action = 'leave'; leave.href = pageBase.href;
    top.append(leave); box.append(top);
    if (title) box.append(element('h1',title,'north-mode-heading'));
  }
  function singleNotice(message) {
    const n=slot(single,'notice'); text(n,message); visible(n,Boolean(message));
  }
  function updateSingle() {
    const active = byId.get(routeId);
    if (!active) {
      if (live) {
        const found=single.querySelector('.idea-row');
        if (found) { found.dataset.archived='true'; for (const b of controls(found)) b.disabled=true; }
      }
      if (!live && api && !single.querySelector('.idea-row')) singleNotice('Loading this idea…');
      if (api && !single.dataset.lookup && (live || !seed.some(i => i.id === routeId))) {
        single.dataset.lookup = '1'; lookupSingle(routeId, routeVersion);
      }
      return;
    }
    let row = single.querySelector('.idea-row');
    if (!row || Number(row.dataset.id) !== active.id) {
      singleNotice(''); row?.remove();
      row = makeCard(active,'single'); single.append(row);
    } else { singleNotice(''); delete row.dataset.archived; paint(row,active); }
  }
  async function lookupSingle(id, version) {
    try {
      const idea = await post('/idea',{id});
      if (version !== routeVersion || mode !== 'single' || routeId !== id || byId.has(id)) return;
      single.querySelector('.idea-row')?.remove(); const row = makeCard(idea,'single');
      if (!idea.active) {
        row.dataset.archived = 'true'; paint(row,idea);
        singleNotice('This idea is archived. Its public wording is available below.');
      } else singleNotice('Loading live standings…');
      single.append(row);
    } catch (err) {
      if (version !== routeVersion || byId.has(id)) return;
      if (err.status === 404) singleNotice('This idea could not be found.');
      else { singleNotice('Unable to load this idea. Try again.'); delete single.dataset.lookup; }
    }
  }
  function updateDeck() {
    if (awaitingDeck && live) { beginDeck(); return; }
    const row = deck.querySelector('.idea-row');
    if (row) {
      const idea = byId.get(Number(row.dataset.id));
      if (idea) paint(row,idea);
      else if (live) nextCard();
    }
  }
  function renderDeck() {
    deck.replaceChildren(); viewTop(deck,'Rate 3 ideas');
    while (cardIndex < session.length && !byId.has(session[cardIndex])) cardIndex++;
    if (cardIndex >= session.length) {
      deck.append(element('p',session.length ? 'You’ve reached the end of this set.' : 'There are no ideas to rate right now.'));
      if (ideas.length) deck.append(button('again','Rate another set'));
      focusHeading(deck); return;
    }
    const id = session[cardIndex], idea = byId.get(id);
    draw.show(id); revealed = false;
    deck.append(element('p','Idea ' + (cardIndex + 1) + ' of ' + session.length,'north-progress'));
    const row = makeCard(idea,'deck'), actions = slot(row,'vote-actions');
    actions.classList.add('north-blind-actions'); actions.append(button('skip','Skip'));
    // Keep the directions and skip equally available before revealing any score.
    visible(row.querySelector('[data-action=remove]'),false);
    deck.append(row);
    const nav = element('div',null,'north-nav-actions'); nav.append(button('reveal','See result')); deck.append(nav);
    focusHeading(row);
  }
  function revealDeck() {
    revealed = true;
    const row = deck.querySelector('.idea-row');
    if (!row) return;
    const idea = byId.get(Number(row.dataset.id));
    if (idea) paint(row,idea);
    visible(row.querySelector('[data-action=remove]'),true);
    const skip = row.querySelector('[data-action=skip]'); visible(skip,false);
    const nav = deck.querySelector('.north-nav-actions');
    const toggle = nav.querySelector('[data-action=reveal]');
    if (toggle) {
      const hadFocus = document.activeElement === toggle;
      toggle.dataset.action='next'; text(toggle,cardIndex + 1 === session.length ? 'Finish' : 'Next idea');
      if (hadFocus) focus(toggle);
    }
  }
  function nextCard() { cardIndex++; renderDeck(); }
  function beginDeck() {
    if (!live) {
      // The launch list can differ from today's approvals, including contenders. Wait for all of them.
      awaitingDeck=true; deck.replaceChildren(); viewTop(deck,'Rate 3 ideas');
      deck.append(element('p',api ? 'Loading the full list of active ideas…' : 'The shuffled set needs live standings. You can still read the launch ideas on the chart.'));
      if (api) schedule(0);
      return;
    }
    awaitingDeck=false; session=draw.begin(ideas.map(i => i.id)); cardIndex=0; renderDeck();
  }

  const secretError = err => err.status ? err.message : 'The connection was interrupted.';
  function tell(row, message, expiresAt, retryState) {
    const out = slot(row,'receipt'); if (!out) return;
    row.dataset.unconfirmed=String(retryState != null);
    if (out.contains(document.activeElement)) focus(row.querySelector('[data-vote="1"]'));
    out.replaceChildren(); visible(out,true);
    out.append(element('span',message));
    if (expiresAt) {
      const details = element('details');
      details.append(element('summary','Vote expiry'),element('p','This vote counts until ' + labelDate(expiresAt) + '.'));
      out.append(details);
    }
    if (retryState != null) {
      const again = button('retry-vote','Retry'); again.dataset.state = String(retryState); out.append(again);
    }
  }
  let clockSample = null;
  const approximateClock = () => clockSample ? clockSample.server + Math.max(0,performance.now()-clockSample.local) : Date.now();
  async function cast(row, state) {
    const id = Number(row.dataset.id);
    if (!api || pending.has(id) || !byId.has(id) || ![-1,0,1].includes(state)) return;
    const previous = retry.get(id);
    const op = previous?.state === state ? previous : {state,operation:randomHex(16),issuedAt:Math.floor(approximateClock())};
    retry.set(id,op); pending.add(id); paint(row,byId.get(id));
    // Leave the action focused while the service commits it.
    const messageAt = slot(row,'receipt');
    if (messageAt) { visible(messageAt,true); text(messageAt,'Recording…'); }
    try {
      const r = await post('/ballot',{id,...op});
      if (r.idea?.id !== id || !Number.isFinite(r.asOf) || ![-1,0,1].includes(r.state)) throw new Error();
      retry.delete(id);
      latestWrite = Math.max(latestWrite,r.asOf); clockSample = {server:r.asOf,local:performance.now()};
      if (r.asOf >= Math.max(feedAt,rowAsOf.get(id) || -1)) {
        byId.set(id,r.idea); rowAsOf.set(id,r.asOf);
        ideas = ideas.map(i => i.id === id ? r.idea : i);
      }
      own.set(id,{state:r.state,expiresAt:r.expiresAt});
      if (row.isConnected && row.dataset.mode === 'deck' && deck.contains(row)) revealDeck();
      const current = r.idea;
      const phrase = voteMessage(r) + ' ' + (current.rank == null ? 'Outside the top 250' : 'Rank #' + current.rank) + ' · ' + signed(current.net) + ' net.';
      if (row.isConnected) tell(row,phrase,r.expiresAt);
      // Hidden copies do not announce a duplicate receipt.
      for (const node of root.querySelectorAll('.idea-row[data-id="' + id + '"]')) paint(node,byId.get(id) || current);
      etag = ''; schedule(160);
    } catch (err) {
      if (row.isConnected) tell(row,'Couldn’t confirm your vote. ' + secretError(err),null,state);
      if (err.status && err.status !== 429 && err.status < 500) retry.delete(id);
    } finally {
      pending.delete(id);
      for (const node of root.querySelectorAll('.idea-row[data-id="' + id + '"]')) paint(node,byId.get(id));
      if (row.dataset.mode === 'deck' && !revealed && row.isConnected && slot(row,'receipt')?.textContent) visible(slot(row,'receipt'),true);
    }
  }

  function selectionFallback(box,value,label) {
    const field = element('textarea'); field.className='north-manual-copy';
    field.readOnly=true; field.rows=2; field.value=value; field.setAttribute('aria-label',label);
    const hint=element('p','Select and copy this link.'); box.replaceChildren(hint,field); focus(field); field.select();
  }
  async function copy(box,value,label,manualValue=value) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error();
      await navigator.clipboard.writeText(value);
      box.replaceChildren(element('p',label + ' copied.'));
    } catch { selectionFallback(box,manualValue,label); }
  }
  async function share(row) {
    const id=Number(row.dataset.id);
    const idea = byId.get(id), title=idea?.title || slot(row,'title')?.textContent;
    if (!title || !Number.isSafeInteger(id)) return;
    const url=cardLink(id), question='How high a priority should this be?', box=slot(row,'share-result');
    if (!box) return;
    visible(box,true);
    if (navigator.share) {
      try { await navigator.share({title,text:title + ' — ' + question,url}); return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    await copy(box,title + '\n' + question + '\n' + url,'Public idea link',url);
  }
  function sameInput(a,b) { return a?.text === b.text && a?.id === b.id && a?.type === b.type; }
  function receiptPanel(out,type,id,token,expiresAt) {
    const details=element('details',null,'north-private-receipt');
    const heading=element('summary','Save a private status link');
    const url=new URL('#status-' + token,pageBase).href;
    const link=element('a','Open private status'); link.href=url; link.dataset.statusLink='';
    const copyButton=button('copy-status','Copy private link');
    const result=element('div'); result.setAttribute('role','status');
    copyButton.addEventListener('click',() => copy(result,url,'Private status link'));
    details.append(heading,element('p','Anyone with this link can see the status through ' + labelDate(expiresAt) + '.'),link,copyButton,result);
    out.replaceChildren(element('p',type === 'idea' ? 'Suggestion received.' : 'Opening received.'),details);
    if (type === 'opportunity') {
      const idea=byId.get(id);
      if (idea && root.dataset.email) {
        const mail = element('a','Email Drew about this pilot'); mail.dataset.role='email-pilot';
        mail.href = 'mailto:' + root.dataset.email + '?subject=' + encodeURIComponent('Pilot introduction · Idea ' + ideaCode(id) + ' · ' + idea.title);
        out.append(mail);
      }
    }
  }
  function formMatches(form, value) {
    const box = slot(form,'matches'); if (!box) return;
    box.replaceChildren();
    if (value.trim().length < 3) return;
    const matches = findIdeas(ideas,value).slice(0,2); if (!matches.length) return;
    box.append(element('p','Related ideas'));
    for (const idea of matches) {
      const a=element('a',idea.title); a.href=localLink(idea.id); box.append(a);
    }
  }
  function setupForm(form,type,id) {
    if (!form || boundForms.has(form)) return;
    boundForms.add(form);
    const key=type === 'idea' ? 'idea' : 'opportunity-' + id;
    const d=drafts.get(key) || {value:'',pending:false}; drafts.set(key,d);
    const field=form.elements.namedItem('text'), out=slot(form,'form-result'), submitButton=form.querySelector('button[type=submit]');
    if (!field || !out || !submitButton) return;
    field.maxLength=500; field.required=true; field.value=d.value;
    submitButton.disabled=!api;
    const prior=()=>{ if (d.success) receiptPanel(out,type,id,d.success.token,d.success.expiresAt); };
    if (d.success) prior();
    else if (!api) text(out,'Sending is unavailable while the live service is offline.');
    field.addEventListener('input',()=>{
      d.value=field.value;
      if(type === 'idea') formMatches(form,field.value);
    });
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!api || d.pending) return;
      const value=field.value.trim();
      if (!value || value.length>500) { field.setCustomValidity('Enter between 1 and 500 characters.'); field.reportValidity(); field.setCustomValidity(''); return; }
      const input={type,...(type === 'opportunity' ? {id} : {}),text:value};
      const attempt=sameInput(d.attempt,input) ? d.attempt : {...input,token:randomHex(32)};
      d.attempt=attempt; d.pending=true; submitButton.setAttribute('aria-disabled','true');
      text(out,'Sending…');
      try {
        const r=await post('/submit',attempt); if(!Number.isFinite(r.expiresAt)) throw new Error();
        d.success={token:attempt.token,expiresAt:r.expiresAt};
        if(field.value.trim()===value){ field.value=''; d.value=''; if(type === 'idea') formMatches(form,''); }
        prior();
      } catch(err) { text(out,'Couldn’t confirm receipt. ' + secretError(err) + ' Your text is here. You can send it again.'); }
      finally { d.pending=false; submitButton.removeAttribute('aria-disabled'); }
    });
  }
  function openOpportunity(row) {
    const box=slot(row,'opportunity-form'); if (!box) return;
    visible(box,true);
    if (!box.firstElementChild) {
      const form=element('form',null,'north-inline-form');
      const label=element('label','Where could someone try this?');
      const field=element('textarea'); field.name='text'; field.rows=3; field.required=true; field.maxLength=500;
      label.append(field);
      const hint=element('p','A workplace, organization or public meeting is enough. A public source or deadline can help.');
      const submitButton=element('button','Send opening'); submitButton.type='submit';
      const out=element('div'); out.dataset.role='form-result'; out.setAttribute('aria-live','polite');
      form.append(label,hint,submitButton,out); box.append(form); setupForm(form,'opportunity',Number(row.dataset.id));
    }
    focus(box.querySelector('textarea'));
  }
  async function checkReceipt(token,version) {
    receipt.replaceChildren(); viewTop(receipt,'Private submission status');
    const state = element('p','Checking status…'); state.setAttribute('role','status'); receipt.append(state);
    if (!/^[0-9a-f]{64}$/.test(token)) { text(state,'This private status link is invalid or has expired.'); return; }
    if (!api) { text(state,'The live status service is unavailable. Keep your link and try again.'); return; }
    try {
      const result = await post('/status',{token});
      if (version !== routeVersion) return;
      const label=statuses[result.status]; if (!label || !Number.isFinite(result.expiresAt)) throw new Error();
      text(state,label); receipt.append(element('p','This link expires ' + labelDate(result.expiresAt) + '.'));
      if (['published','merged'].includes(result.status) && Number.isInteger(result.ideaId)) {
        const link=element('a','Open Idea ' + ideaCode(result.ideaId)); link.href=localLink(result.ideaId); link.dataset.role='public-result'; receipt.append(link);
      }
    } catch(e) {
      if (version !== routeVersion) return;
      if (e.status === 404 || e.status === 410) text(state,'This private status link is invalid or has expired.');
      else { text(state,'The status service could not confirm this request.'); receipt.append(button('retry-status','Try again')); }
    }
  }
  const chartParts = [...new Set([$('#north-intro'),chart,suggest,...root.querySelectorAll('[data-chart-only]')].filter(Boolean))];
  function route(initial=false) {
    const hash=location.hash;
    const target=hash.match(/^#idea-(\d+)$/), statusMatch=hash.match(/^#status-(.*)$/);
    const next=target?'single':statusMatch?'status':hash==='#rate-3'?'deck':'chart';
    if(!initial && next==='chart' && mode==='chart') return;
    if(mode==='chart' && next!=='chart') { scrollBack=window.scrollY; returnFocus=document.activeElement; }
    mode=next; routeVersion++;
    for(const part of chartParts) visible(part,next==='chart');
    visible(single,next==='single'); visible(deck,next==='deck'); visible(receipt,next==='status');
    root.dataset.view=next;
    if(next==='single'){
      routeId=Number(target[1]); delete single.dataset.lookup;
      single.replaceChildren(); viewTop(single,'');
      const msg=element('p'); msg.dataset.role='notice'; single.append(msg);
      if(!byId.has(routeId)) text(msg, api ? 'Loading this idea…' : 'This idea is unavailable in the offline catalog.');
      updateSingle(); window.scrollTo(0,0);
      focusHeading(single);
    } else if(next==='status'){
      clearTimeout(pollTimer); checkReceipt(statusMatch[1],routeVersion); window.scrollTo(0,0); focusHeading(receipt);
    } else if(next==='deck'){
      beginDeck(); window.scrollTo(0,0);
    } else {
      pinned=null; filterChart();
      if(!initial) { window.scrollTo(0,scrollBack || 0); if(returnFocus?.isConnected) focus(returnFocus); else focusHeading(chart); }
    }
    if(next!=='status') schedule(live?6500:0);
  }
  function navigate(hash) { history.pushState(null,'',hash || pageBase.href); lastLocation=location.href; route(); }
  // Popstate also fires on fragment navigation. Hashchange covers native hash updates.
  let lastLocation = location.href;
  function fromHistory() {
    if (lastLocation === location.href) return;
    lastLocation = location.href; route();
  }
  window.addEventListener('popstate',fromHistory); window.addEventListener('hashchange',fromHistory);
  search?.addEventListener('input',()=>{pinned=null; filterChart();});
  $('#search-suggest')?.addEventListener('click',()=>{
    const field=$('#suggest-form textarea[name=text]'); if(!field) return;
    if(suggest) suggest.open=true;
    field.value=search.value;
    field.dispatchEvent(new Event('input',{bubbles:true}));
    field.focus(); field.setSelectionRange(field.value.length,field.value.length);
  });
  $('#rate-three')?.addEventListener('click',e=>{e.preventDefault(); navigate('#rate-3');});
  $('#more-ideas')?.addEventListener('click',()=>{more=!more; pinned=null; filterChart();});
  root.addEventListener('click',e=>{
    if(e.defaultPrevented || !(e.target instanceof Element)) return;
    const target=e.target.closest('button,a'); if(!target) return;
    const row=target.closest('.idea-row'), action=target.dataset.action;
    if(row && target.hasAttribute('data-vote')) { e.preventDefault(); cast(row,Number(target.dataset.vote)); return; }
    if(row && action==='retry-vote'){ cast(row,Number(target.dataset.state)); return; }
    if(row && action==='remove'){ e.preventDefault(); cast(row,0); return; }
    if(row && action==='share'){ e.preventDefault(); share(row); return; }
    if(row && action==='opportunity'){ e.preventDefault(); openOpportunity(row); return; }
    if(action==='leave'){ e.preventDefault(); navigate(''); return; }
    if(action==='skip' || action==='next'){ nextCard(); return; }
    if(action==='again'){ beginDeck(); return; }
    if(action==='reveal'){ revealDeck(); return; }
    if(action==='retry-status'){ route(); return; }
  });
  document.addEventListener('visibilitychange',()=>{
    clearTimeout(pollTimer); if(!document.hidden && mode!=='status') refresh();
  });
  window.addEventListener('online',()=>{ failureCount=0; refresh(); });
  window.addEventListener('pagehide',()=>clearTimeout(pollTimer));
  window.addEventListener('pageshow',e=>{ if(e.persisted) refresh(); });
  setupForm($('#suggest-form'),'idea');
  const rate=$('#rate-three'); if(rate) rate.disabled=false;
  updateChart(); updateState(); route(true);
}
