const places = ['first', 'second', 'third', 'fourth', 'fifth'];
const ordinals = ['1st', '2nd', '3rd', '4th', '5th'];
const integers = new Intl.NumberFormat(undefined, {maximumFractionDigits: 0});
const averages = new Intl.NumberFormat(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1});
const expiryDate = new Intl.DateTimeFormat(undefined, {month: 'short', day: 'numeric'});
const equal = (a, b) => a === b || (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((id, i) => id === b[i]));
const permutation = (order, ids) => Array.isArray(order) && order.length === 5 && new Set(order).size === 5 && order.every(id => ids.includes(id));
const nonce = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
function setText(node, value) {
  if (node.textContent !== value) node.textContent = value;
}
function element(doc, name, className, value) {
  const node = doc.createElement(name);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}
function action(doc, name, title, className = 'go-secondary') {
  const button = element(doc, 'button', className, title);
  button.type = 'button';
  button.dataset.orderAction = name;
  return button;
}
function safeFocus(node) {
  if (node && !node.disabled && !node.hidden) node.focus({preventScroll: true});
}

function groupView(entry, props, handleAction) {
  const {group, mount, ideas} = props;
  const doc = mount.ownerDocument;
  const root = element(doc, 'div', 'group-order');
  const heading = element(doc, 'h3', 'go-heading', 'Of these five changes, which should come first in your community?');
  heading.id = 'order-heading-' + group.id;
  root.setAttribute('role', 'group');
  root.setAttribute('aria-labelledby', heading.id);
  const hint = element(doc, 'p', 'go-hint');
  const choices = element(doc, 'ul', 'go-choices');
  choices.setAttribute('aria-label', 'Choices in ' + group.label);
  const byId = new Map();
  for (const idea of ideas) {
    const row = element(doc, 'li', 'go-row');
    const pick = element(doc, 'button', 'go-pick');
    pick.type = 'button';
    pick.dataset.orderPick = String(idea.id);
    const badge = element(doc, 'span', 'go-position');
    badge.setAttribute('aria-hidden', 'true');
    const title = element(doc, 'span', 'go-title', idea.title);
    pick.append(badge, title);
    const moves = element(doc, 'span', 'go-moves');
    const up = action(doc, 'up', '↑', 'go-move');
    const down = action(doc, 'down', '↓', 'go-move');
    up.setAttribute('aria-label', 'Move ' + idea.title + ' up one place');
    down.setAttribute('aria-label', 'Move ' + idea.title + ' down one place');
    moves.append(up, down);
    row.dataset.orderItem = String(idea.id);
    row.append(pick, moves);
    choices.append(row);
    byId.set(idea.id, {row, pick, badge, moves, up, down, title: idea.title});
  }
  const progress = element(doc, 'p', 'go-progress');
  progress.dataset.orderProgress = '';
  progress.setAttribute('aria-live', 'off');
  progress.setAttribute('aria-atomic', 'true');
  const actions = element(doc, 'div', 'go-actions');
  const buttons = {};
  for (const [name, label, style] of [
    ['save', 'Save order', 'go-primary'], ['edit', 'Edit order', 'go-primary'],
    ['undo', 'Undo'], ['clear', 'Start over'], ['cancel', 'Cancel edits'],
    ['remove', 'Remove order'], ['retry', 'Retry'], ['retry-own', 'Check for a saved order']
  ]) {
    buttons[name] = action(doc, name, label, style);
    actions.append(buttons[name]);
  }
  const feedback = element(doc, 'p', 'go-feedback');
  feedback.dataset.orderStatus = '';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'off');
  const stats = element(doc, 'div', 'go-results');
  stats.dataset.orderResults = '';
  stats.hidden = true;
  root.append(heading, hint, choices, progress, actions, feedback, stats);
  mount.replaceChildren(root);
  root.addEventListener('click', event => {
    const button = event.target.closest?.('button');
    if (!button || button.disabled || !root.contains(button)) return;
    progress.setAttribute('aria-live', 'polite');
    feedback.setAttribute('aria-live', 'polite');
    const id = Number(button.closest('[data-order-item]')?.dataset.orderItem);
    handleAction(entry, button.dataset.orderPick ? 'pick' : button.dataset.orderAction, id, button);
  });
  return {root, hint, choices, byId, progress, buttons, feedback, stats, doc, resultSignature: null};
}

function updateView(entry, status) {
  const {view, saved, draft, editing, group, busy, retry} = entry;
  if (!view) return;
  const {root, hint, choices, byId, buttons, progress, feedback, doc} = view;
  if (group.ids.length !== 5) {
    root.hidden = true;
    return;
  }
  root.dataset.orderSaved = String(Boolean(saved));
  root.dataset.orderEditing = String(editing);
  const locked = busy || Boolean(retry) || entry.stale || !status.ready || !status.available || !status.active;
  const order = editing ? draft : saved?.order || [];
  const complete = order.length === 5;
  const previouslyFocused = root.contains(doc.activeElement) ? doc.activeElement : null;
  setText(hint, editing
    ? 'Tap all five from first to fifth. You can give them all a 10 and still put one first.'
    : 'Your saved priority order for this group.');
  const displayed = complete ? order : entry.neutral;
  // Keep the actual buttons so picking, changing position and background reads retain focus.
  let cursor = choices.firstElementChild;
  for (const id of displayed) {
    const item = byId.get(id);
    if (!item) continue;
    if (item.row !== cursor) choices.insertBefore(item.row, cursor);
    cursor = item.row.nextElementSibling;
    const position = order.indexOf(id);
    const marked = position !== -1;
    item.row.classList.toggle('go-chosen', marked);
    item.row.classList.toggle('go-readonly', !editing);
    setText(item.badge, marked ? ordinals[position] : '');
    if (marked) item.pick.dataset.position = String(position + 1);
    else delete item.pick.dataset.position;
    item.pick.setAttribute('aria-pressed', String(marked));
    item.pick.setAttribute('aria-label', marked
      ? ordinals[position] + '. ' + item.title + (editing ? '. Tap to clear this choice.' : '')
      : 'Choose ' + item.title);
    item.pick.disabled = !editing || locked;
    item.moves.hidden = !editing || !complete;
    item.up.disabled = locked || item.moves.hidden || position === 0;
    item.down.disabled = locked || item.moves.hidden || position === 4;
  }
  progress.hidden = !editing;
  setText(progress, complete ? 'All five are ordered. Review and save.' :
    (order.length ? order.length + ' of 5 chosen. ' : '') + 'Choose your ' + places[order.length] + ' priority.');
  buttons.save.hidden = !editing;
  buttons.save.disabled = locked || !editing || !complete || !status.ownReady;
  buttons.undo.hidden = !editing || !entry.history.length;
  buttons.clear.hidden = !editing || !order.length;
  buttons.cancel.hidden = !editing || !saved;
  buttons.edit.hidden = editing || !saved;
  buttons.remove.hidden = editing || !saved;
  for (const name of ['undo', 'clear', 'cancel', 'edit', 'remove']) buttons[name].disabled = locked || buttons[name].hidden;
  buttons['retry-own'].hidden = !status.ownFailed || !status.available;
  buttons['retry-own'].disabled = buttons['retry-own'].hidden;
  buttons.retry.hidden = !retry;
  buttons.retry.disabled = buttons.retry.hidden || busy || !status.ready || !status.available || entry.stale;
  const message = entry.message || (!status.available
    ? 'Ordering is unavailable while the survey is offline.'
    : !status.ready ? 'Checking the current five issues…'
    : status.ownFailed ? 'Couldn’t check this connection’s saved orders.'
    : !status.ownReady ? 'Checking for a saved order…'
    : !editing && saved ? 'Saved for this connection through ' + expiryDate.format(saved.expiresAt) + '.' : '');
  setText(feedback, message);
  if (previouslyFocused && doc.activeElement === doc.body && !previouslyFocused.closest('[hidden]')) safeFocus(previouslyFocused);
}

function isGroupReport(group) {
  if (!Array.isArray(group?.ids) || group.ids.length > 5 || !Number.isSafeInteger(group.n) || group.n < 0 ||
      typeof group.key !== 'string' || !Array.isArray(group.items) || group.items.length !== group.ids.length) return false;
  const ids = group.items.map(i => i.id);
  if (new Set(ids).size !== ids.length || ids.some(id => !group.ids.includes(id))) return false;
  return group.items.every(i => Array.isArray(i.counts) && i.counts.length === 5 &&
    i.counts.every(n => Number.isSafeInteger(n) && n >= 0) && i.counts.reduce((a, b) => a + b, 0) === group.n &&
    (group.n === 0 ? i.meanRank === null : Number.isFinite(i.meanRank) && i.meanRank >= 1 && i.meanRank <= 5));
}

function showComparison(entry, visible, report, resultStatus) {
  const {view, group} = entry;
  if (!view) return;
  const {stats, doc} = view;
  const sig = visible ? JSON.stringify([report || null, resultStatus]) : '';
  if (view.resultSignature === sig) return;
  view.resultSignature = sig;
  stats.replaceChildren();
  stats.hidden = !visible || group.ids.length !== 5;
  if (stats.hidden) return;
  stats.append(element(doc, 'h4', 'go-result-heading', 'Community order in this group'));
  if (!report) {
    stats.append(element(doc, 'p', '', resultStatus === 'failed' ? 'Group results are currently unavailable.' : 'Loading group results…'));
    return;
  }
  const n = report.n;
  const count = element(doc, 'p', 'go-sample', integers.format(n) + (n === 1 ? ' complete order' : ' complete orders') + ' in the past 30 days.');
  count.dataset.orderCount = String(n);
  stats.append(count);
  if (resultStatus === 'failed') stats.append(element(doc, 'p', 'go-freshness', 'Showing the last confirmed results.'));
  if (resultStatus === 'updating') stats.append(element(doc, 'p', 'go-freshness', 'Updating after your change…'));
  if (!n) return;
  const table = element(doc, 'table', 'go-table');
  table.append(element(doc, 'caption', 'sr-only', 'Priority within ' + group.label + '. First picks and average place out of five.'));
  const head = table.createTHead().insertRow();
  for (const title of ['Issue', 'First picks', 'Avg. place']) {
    const th = element(doc, 'th', '', title);
    th.scope = 'col';
    head.append(th);
  }
  const body = table.createTBody();
  const data = new Map(report.items.map(i => [i.id, i]));
  for (const id of entry.neutral) {
    const item = data.get(id);
    if (!item) continue;
    const row = body.insertRow();
    row.dataset.orderResultId = String(id);
    const title = element(doc, 'th', '', view.byId.get(id).title);
    title.scope = 'row';
    row.append(title);
    const first = row.insertCell();
    first.dataset.firstPicks = String(item.counts[0]);
    first.textContent = integers.format(item.counts[0]) + ' (' + integers.format(100 * item.counts[0] / n) + '%)';
    row.insertCell().textContent = averages.format(item.meanRank);
  }
  stats.append(table, element(doc, 'p', 'go-freshness', 'An average place of 1 means everyone who ordered these five put that issue first.'));
}

export function createGroupOrders({request, onStale = () => {}}) {
  const entries = new Map();
  let ready = false, available = false, active = true, ownReady = false, ownFailed = false;
  let ownGeneration = 0, ownPending = false, roster = '', ownReadAt = 0;
  let clock = null, writeCount = 0;
  let resultsVisible = false, resultsGeneration = 0, resultStatus = '', resultPending = false;
  let resultTimer, resultMap = new Map(), resultAsOf = 0, neededAsOf = 0, pendingRefresh = false, etag = '';
  let exportMount = null, exportView = null, downloadURL = null, exportPending = false;
  let listening = null, destroyed = false;

  const serverNow = () => clock ? Math.round(clock.at + performance.now() - clock.tick) : Date.now();
  function clockAt(value) {
    if (Number.isFinite(value) && (!clock || value >= clock.at)) clock = {at: value, tick: performance.now()};
  }
  function draw(entry) {
    updateView(entry, {ready, available, active, ownFailed, ownReady});
    showComparison(entry, active && resultsVisible, resultMap.get(entry.group.key), resultStatus);
  }
  function drawAll() {
    for (const entry of entries.values()) draw(entry);
  }
  function rememberOrder(entry, saved) {
    const changed = !equal(entry.saved?.order ?? null, saved?.order ?? null);
    entry.saved = saved;
    // A background read may update the saved answer while this reader is actively editing a draft.
    if (!entry.dirty && !entry.busy && !entry.retry && (!entry.editing || !entry.draft.length)) {
      entry.draft = saved ? [...saved.order] : [];
      entry.editing = !saved;
      if (changed) entry.message = '';
    }
  }
  function expire() {
    for (const entry of entries.values()) {
      if (entry.saved && entry.saved.expiresAt <= serverNow()) {
        rememberOrder(entry, null);
        if (!entry.dirty) entry.message = 'The previous order has expired.';
      }
    }
  }
  async function getJson(path, options) {
    const r = await request(path, options);
    const data = await r.json().catch(() => null);
    if (!r.ok) {
      const error = Error(data?.error || 'The survey could not confirm the request.');
      error.status = r.status;
      throw error;
    }
    return data;
  }
  const jsonPost = body => ({method: 'POST', cache: 'no-store', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  async function loadOwn(force = false) {
    if (!request || !ready || !available || !active || ownPending || (ownReady && !force) || destroyed) return;
    const generation = ownGeneration, revision = writeCount;
    ownPending = true;
    try {
      const data = await getJson('/survey/my-group-orders', jsonPost({}));
      if (generation !== ownGeneration || destroyed) return;
      if (!Array.isArray(data?.orders) || !Number.isFinite(data.asOf)) throw Error();
      const fresh = new Map(data.orders.map(x => [x.key, x]));
      for (const entry of entries.values()) {
        if (entry.revision > revision || entry.busy || entry.retry || entry.lastWrite > data.asOf) continue;
        const saved = fresh.get(entry.group.key);
        if (saved && (!permutation(saved.order, entry.group.ids) || !Number.isFinite(saved.expiresAt))) throw Error();
        rememberOrder(entry, saved && saved.expiresAt > data.asOf ? saved : null);
      }
      clockAt(data.asOf);
      ownReady = true;
      ownFailed = false;
      ownReadAt = performance.now();
    } catch {
      if (generation === ownGeneration && !destroyed) { ownFailed = true; ownReadAt = performance.now(); }
    } finally {
      if (generation === ownGeneration && !destroyed) { ownPending = false; drawAll(); }
    }
  }
  function resetReads() {
    ownGeneration++;
    ownReady = ownFailed = ownPending = false;
    ownReadAt = 0;
  }
  function rememberDraft(entry, next) {
    entry.history.push([...entry.draft]);
    if (entry.history.length > 40) entry.history.shift();
    entry.draft = next;
    entry.dirty = true;
    entry.message = '';
  }
  function act(entry, name, id, origin) {
    if (name === 'retry-own') { loadOwn(true); return; }
    if (!active || !available || !ready || entry.stale || entry.busy || destroyed) return;
    if (name === 'retry' && entry.retry) {
      submit(entry, entry.retry, origin);
      return;
    }
    if (entry.retry) return;
    if (name === 'save' || name === 'remove') {
      if (!ownReady || (name === 'save' && !permutation(entry.draft, entry.group.ids))) return;
      const order = name === 'remove' ? null : [...entry.draft];
      submit(entry, {key: entry.group.key, order, operation: nonce(), issuedAt: serverNow()}, origin);
      return;
    }
    if (name === 'edit' || name === 'cancel') {
      entry.editing = name === 'edit';
      entry.dirty = name === 'edit';
      entry.draft = entry.saved ? [...entry.saved.order] : [];
      entry.history = [];
      entry.message = '';
    } else if (!entry.editing) return;
    else if (name === 'pick') {
      const next = entry.draft.includes(id) ? entry.draft.filter(x => x !== id) : [...entry.draft, id];
      rememberDraft(entry, next);
    } else if (name === 'clear') rememberDraft(entry, []);
    else if (name === 'undo' && entry.history.length) {
      entry.draft = entry.history.pop();
      entry.dirty = true;
      entry.message = '';
    } else if (name === 'up' || name === 'down') {
      const from = entry.draft.indexOf(id), to = from + (name === 'up' ? -1 : 1);
      if (from < 0 || to < 0 || to >= entry.draft.length) return;
      const next = [...entry.draft];
      [next[from], next[to]] = [next[to], next[from]];
      rememberDraft(entry, next);
    }
    draw(entry);
    if (name === 'edit' || name === 'clear') safeFocus(entry.view.byId.get(entry.draft[0] || entry.neutral[0])?.pick);
    if (name === 'cancel') safeFocus(entry.view.buttons.edit);
    if (name === 'undo' && entry.view.buttons.undo.hidden) safeFocus(entry.view.byId.get(entry.neutral[0])?.pick);
    if (origin.disabled && (name === 'up' || name === 'down')) safeFocus(entry.view.byId.get(id)?.pick);
  }
  async function submit(entry, attempt, origin) {
    entry.busy = true;
    entry.retry = null;
    entry.revision = ++writeCount;
    entry.message = attempt.order ? 'Saving your order…' : 'Removing your order…';
    const view = entry.view;
    draw(entry);
    try {
      const response = await getJson('/survey/group-order', jsonPost(attempt));
      if (destroyed || entries.get(entry.group.id) !== entry) return;
      if (response?.key !== entry.group.key || !Number.isFinite(response.asOf) ||
          (response.order !== null && (!permutation(response.order, entry.group.ids) || !Number.isFinite(response.expiresAt)))) throw Error();
      entry.saved = response.order ? {order: [...response.order], expiresAt: response.expiresAt} : null;
      entry.draft = entry.saved ? [...entry.saved.order] : [];
      entry.editing = !entry.saved;
      entry.dirty = false;
      entry.history = [];
      entry.lastWrite = response.asOf;
      clockAt(response.asOf);
      entry.message = !equal(attempt.order, response.order)
        ? 'Showing the current order for this connection.'
        : response.order ? 'Order saved for this connection through ' + expiryDate.format(response.expiresAt) + '.'
        : 'Order removed for this connection.';
      if (active && resultsVisible) {
        neededAsOf = Math.max(neededAsOf, response.asOf);
        resultStatus = 'updating';
        refreshResults(true);
      }
    } catch (e) {
      if (destroyed || entries.get(entry.group.id) !== entry) return;
      if (e.status === 409) {
        entry.stale = true;
        entry.message = 'The service requested a fresh comparison. Checking whether these five issues changed…';
        onStale();
      } else {
        entry.retry = attempt;
        entry.message = e.status === 429 ? 'This connection reached its request limit. Retry in ten minutes.'
          : 'Your change could not be confirmed. Retry to check it.';
      }
    } finally {
      entry.busy = false;
      if (!destroyed && entries.get(entry.group.id) === entry) {
        const keepFocus = view === entry.view && active &&
          (view.doc.activeElement === origin || view.doc.activeElement === view.doc.body);
        draw(entry);
        if (keepFocus) safeFocus(entry.retry ? view.buttons.retry : entry.saved ? view.buttons.edit : view.byId.get(entry.neutral[0])?.pick);
      }
    }
  }
  function scheduleResults(ms) {
    clearTimeout(resultTimer);
    if (active && resultsVisible && ready && available && !destroyed && !listening?.hidden) {
      resultTimer = setTimeout(() => refreshResults(), ms);
      resultTimer.unref?.();
    }
  }
  async function refreshResults(force = false) {
    if (!request || !active || !resultsVisible || !available || !ready || destroyed || listening?.hidden) return;
    if (resultPending) { if (force) pendingRefresh = true; return; }
    const generation = resultsGeneration;
    resultPending = true;
    clearTimeout(resultTimer);
    try {
      const headers = !force && !neededAsOf && etag ? {'If-None-Match': etag} : {};
      const res = await request('/survey/group-results', {cache: 'no-cache', headers});
      if (generation !== resultsGeneration || destroyed) return;
      if (res.status !== 304) {
        if (!res.ok) throw Error();
        const data = await res.json();
        if (generation !== resultsGeneration || destroyed) return;
        if (data?.version !== 'group-order-v1' || !Number.isFinite(data.asOf) || !Array.isArray(data.groups) || !data.groups.every(isGroupReport)) throw Error();
        if (data.asOf >= resultAsOf && data.asOf >= neededAsOf) {
          resultMap = new Map(data.groups.map(group => [group.key, group]));
          resultAsOf = data.asOf;
          neededAsOf = 0;
          etag = res.headers.get('etag') || '';
        }
      } else if (!resultAsOf) throw Error();
      resultStatus = neededAsOf ? 'updating' : 'ready';
    } catch {
      if (generation === resultsGeneration && !destroyed) resultStatus = 'failed';
    } finally {
      if (generation === resultsGeneration && !destroyed) {
        resultPending = false;
        drawAll();
        drawExport();
        const delay = pendingRefresh ? 0 : resultStatus === 'updating' ? 2300 : resultStatus === 'failed' ? 15000 : 8000;
        pendingRefresh = false;
        scheduleResults(delay);
      }
    }
  }
  function revoke() {
    if (downloadURL) URL.revokeObjectURL(downloadURL);
    downloadURL = null;
  }
  async function exportCsv(view) {
    if (exportPending || !active || !resultsVisible) return;
    const generation = resultsGeneration;
    exportPending = true;
    view.button.disabled = true;
    setText(view.output, 'Preparing download…');
    try {
      const r = await request('/survey/group-export.csv', {cache: 'no-store'});
      if (!r.ok || !r.headers.get('content-type')?.toLowerCase().includes('csv')) throw Error();
      const blob = await r.blob();
      if (generation !== resultsGeneration || destroyed) return;
      revoke();
      downloadURL = URL.createObjectURL(blob);
      const link = element(exportMount.ownerDocument, 'a', 'go-save-file', 'Save group-order CSV');
      link.download = '45-north-group-orders-' + new Date().toISOString().slice(0, 10) + '.csv';
      link.href = downloadURL;
      view.output.replaceChildren(link);
      link.click();
    } catch {
      if (generation === resultsGeneration && !destroyed) setText(view.output, 'The download could not be opened. Try again.');
    } finally {
      if (generation === resultsGeneration && !destroyed) { exportPending = false; drawExport(); }
    }
  }
  function drawExport() {
    if (!exportMount) return;
    if (!active || !resultsVisible) {
      exportMount.hidden = true;
      exportMount.replaceChildren();
      exportView = null;
      revoke();
      return;
    }
    exportMount.hidden = false;
    if (!exportView) {
      const doc = exportMount.ownerDocument;
      const button = action(doc, 'export', 'Download group orders CSV');
      const retry = action(doc, 'retry-results', 'Retry group results');
      const output = element(doc, 'span', 'go-export-status');
      output.setAttribute('role', 'status');
      const view = {button, retry, output};
      button.addEventListener('click', () => exportCsv(view));
      retry.addEventListener('click', () => refreshResults(true));
      exportMount.replaceChildren(button, retry, output);
      exportView = view;
    }
    exportView.button.disabled = exportPending || !request || !available || !ready;
    exportView.retry.hidden = resultStatus !== 'failed';
  }
  function resetResults() {
    clearTimeout(resultTimer);
    resultsGeneration++;
    resultPending = pendingRefresh = exportPending = false;
    resultMap = new Map();
    resultAsOf = neededAsOf = 0;
    resultStatus = '';
    etag = '';
    revoke();
  }
  function visibility() {
    if (listening?.hidden) clearTimeout(resultTimer);
    else if (!destroyed && active) {
      expire();
      drawAll();
      if (performance.now() - ownReadAt > 45000) loadOwn(true);
      refreshResults();
    }
  }
  return {
    sync(specs, flags = {}) {
      if (destroyed) return;
      const keys = specs.map(s => s.group.key).sort().join('|');
      const changed = roster !== keys;
      const previouslyReady = ready && available;
      ready = Boolean(flags.ready);
      available = Boolean(flags.available && request);
      if (changed) { roster = keys; resetReads(); }
      const mounted = new Set();
      for (const props of specs) {
        const {group, mount, ideas} = props;
        if (!mount) continue;
        mounted.add(group.id);
        let entry = entries.get(group.id);
        const replacement = entry && entry.group.key !== group.key;
        if (!entry || replacement) {
          entry = {group, neutral: ideas.map(i => i.id), saved: null, draft: [], dirty: false, editing: true,
            busy: false, stale: false, retry: null, history: [], revision: 0, lastWrite: 0,
            message: replacement ? 'This group changed. Choose an order for the current five issues.' : ''};
          entries.set(group.id, entry);
        } else if (ready && entry.stale) {
          // The server can also reject a day-old operation while the exact five remain eligible.
          entry.stale = false;
          entry.message = 'The current five are confirmed. Review your order and save again.';
        }
        if (group.ids.length !== 5) {
          if (mount.dataset.orderIncomplete !== group.key) {
            mount.dataset.orderIncomplete = group.key;
            mount.replaceChildren(element(mount.ownerDocument, 'p', 'go-incomplete', 'Ordering opens when this group has five issues.'));
          }
          entry.view = null;
          continue;
        }
        delete mount.dataset.orderIncomplete;
        if (!entry.view || entry.view.root.parentNode !== mount) entry.view = groupView(entry, props, act);
        if (!listening) {
          listening = mount.ownerDocument;
          listening.addEventListener('visibilitychange', visibility);
        }
      }
      for (const id of entries.keys()) if (!mounted.has(id)) entries.delete(id);
      expire();
      drawAll();
      drawExport();
      if (changed || !previouslyReady || (!ownReady && !ownFailed) || (ownFailed && performance.now() - ownReadAt > 45000)) loadOwn();
      if (active && resultsVisible && (changed || !previouslyReady)) refreshResults(true);
    },
    setResults(show, mount) {
      if (destroyed) return;
      if (mount && exportMount !== mount) { exportMount = mount; exportView = null; }
      const changed = resultsVisible !== Boolean(show);
      resultsVisible = Boolean(show);
      if (changed) resetResults();
      drawAll();
      drawExport();
      if (changed && resultsVisible) refreshResults(true);
    },
    setActive(value) {
      if (destroyed || active === Boolean(value)) return;
      active = Boolean(value);
      resetReads();
      resetResults();
      drawAll();
      drawExport();
      if (active) { loadOwn(); refreshResults(true); }
    },
    destroy() {
      destroyed = true;
      resetReads();
      resetResults();
      listening?.removeEventListener('visibilitychange', visibility);
      for (const entry of entries.values()) entry.view?.root.remove();
      entries.clear();
      if (exportMount) { exportMount.replaceChildren(); exportMount.hidden = true; }
    }
  };
}
