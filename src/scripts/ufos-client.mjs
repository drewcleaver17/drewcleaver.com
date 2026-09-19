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
  const cards = new Map(data.events.map(e => [e.id, document.getElementById(e.id)]));
  const homes = new Map(data.events.map(e => [e.id, e.context ? contextList : document.querySelector('[data-era="' + eras.find(era => e.date.start.slice(0, 4) >= era.start && e.date.start.slice(0, 4) <= era.end).id + '"] .era-events')]));
  const control = key => form.elements.namedItem(key);
  let state = stateFromParams(new URLSearchParams(location.search));
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
    const active = Object.keys(initialState).some(k => state[k] !== initialState[k]);
    const results = filterEvents(data, state);
    // Restore server-rendered nodes before moving them; this keeps anchors and details stable.
    for (const e of filterEvents(data, { context: true })) { const card = cards.get(e.id); homes.get(e.id).append(card); card.hidden = false; }
    flat.replaceChildren();
    story.hidden = active; context.hidden = active; flat.hidden = !active;
    if (active) for (const e of results) flat.append(cards.get(e.id));
    resultCount.textContent = results.length + ' of ' + data.events.filter(e => state.context || !e.context).length + ' entries' + (!state.context ? ' · pre-2017 context separate' : '');
    empty.hidden = results.length !== 0;
    recentNote.hidden = state.view !== 'recent';
    for (const el of document.querySelectorAll('.recent-label')) el.hidden = state.view !== 'recent';
    warning.hidden = !(state.from && state.to && state.from > state.to);
    warning.textContent = warning.hidden ? '' : 'The start date is after the end date. Adjust the range to see results.';
    chips.replaceChildren();
    const labels = { q: 'Search', from: 'From', to: 'Through', category: 'Category', entity: 'Person / institution', evidence: 'Evidence', context: 'Earlier context' };
    for (const [key, label] of Object.entries(labels)) if (state[key]) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'filter-chip';
      const text = label + (key === 'context' ? '' : ': ' + state[key]);
      button.textContent = text + ' ×'; button.setAttribute('aria-label', 'Remove ' + text);
      button.addEventListener('click', () => { state[key] = initialState[key]; render('push'); control(key).focus(); }); chips.append(button);
    }
    writeURL(mode);
  }
  function reset(mode = 'push') { state = { ...initialState }; render(mode); }
  function showHash(focus = false) {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (cards.has(id)) {
      const e = data.events.find(item => item.id === id);
      if (story.hidden && !flat.contains(cards.get(id))) reset('replace');
      if (e.context && !flat.contains(cards.get(id))) { context.hidden = false; context.open = true; }
      const card = cards.get(id);
      card.querySelector('.event-detail').open = true;
      if (focus) card.focus({ preventScroll: true });
      card.scrollIntoView({ block: 'start' });
    } else if (id.startsWith('era-') && document.getElementById(id)) {
      reset('replace'); document.getElementById(id).scrollIntoView({ block: 'start' });
    } else if (id === 'evidence-key') document.getElementById(id).open = true;
  }
  form.addEventListener('submit', e => { e.preventDefault(); render('push'); });
  form.addEventListener('reset', e => { e.preventDefault(); reset(); });
  let timer;
  form.addEventListener('input', e => {
    if (e.target.name !== 'q') return;
    clearTimeout(timer); state.q = e.target.value; timer = setTimeout(() => render('replace'), 150);
  });
  form.addEventListener('change', e => {
    if (e.target.id === 'year-shortcut') {
      const year = e.target.value; state.from = year ? year + '-01-01' : ''; state.to = year ? (year === data.meta.researchCutoff.slice(0, 4) ? data.meta.researchCutoff : year + '-12-31') : '';
    } else if (e.target.name in initialState) state[e.target.name] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    render('push');
  });
  document.getElementById('empty-reset').addEventListener('click', () => { reset(); control('q').focus(); });
  window.addEventListener('popstate', () => { state = stateFromParams(new URLSearchParams(location.search)); render(); showHash(); });
  window.addEventListener('hashchange', () => showHash(true));
  document.getElementById('jump-latest').addEventListener('click', () => reset('replace'));
  for (const button of document.querySelectorAll('[data-copy]')) {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const url = new URL(location.pathname, location.origin); url.hash = button.dataset.copy;
      try { await navigator.clipboard.writeText(url.href); status.textContent = 'Direct event link copied.'; button.textContent = 'Copied'; }
      catch { status.textContent = 'Clipboard unavailable. Use the adjacent Link control and copy the address from your browser.'; }
    });
  }
  const download = document.getElementById('download-data'); download.hidden = false;
  download.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'ufos-timeline-' + data.meta.researchCutoff + '.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  render(); form.hidden = false; showHash();
}
init();
