// The survey imports this module only when a reader explicitly opens Results.
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  timeZone: 'UTC', timeZoneName: 'short',
});
const alphabetical = new Intl.Collator('en-US', { sensitivity: 'base', numeric: true });
const utc = value => date.format(new Date(value));
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function control(label, className) {
  const button = el('button', className, label);
  button.type = 'button';
  return button;
}

function normal(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function hasDate(value) {
  return value != null && Number.isFinite(new Date(value).getTime());
}

function validReport(report) {
  return report?.version === 'priority-v2' && hasDate(report.asOf) && Array.isArray(report.ideas)
    && report.ideas.every(idea =>
      Number.isInteger(idea.id) && typeof idea.title === 'string'
      && Number.isSafeInteger(idea.n) && idea.n >= 0
      && Array.isArray(idea.counts) && idea.counts.length === 10
      && idea.counts.every(c => Number.isSafeInteger(c) && c >= 0)
      && idea.counts.reduce((sum, c) => sum + c, 0) === idea.n
      && (idea.n === 0 || [idea.median, idea.mean].every(v => Number.isFinite(v) && v >= 1 && v <= 10))
    );
}

function stat(label, key, primary = false) {
  const group = el('div', primary ? 'pr-stat pr-primary-stat' : 'pr-stat');
  const term = el('dt', '', label), value = el('dd');
  const data = el('span');
  data.dataset.stat = key;
  value.append(data);
  group.append(term, value);
  return { group, data, value };
}

function resultRow(idea, onRate) {
  const row = el('article', 'pr-row');
  row.dataset.resultIdea = String(idea.id);
  const head = el('div', 'pr-row-head'), copy = el('div', 'pr-row-copy');
  const topic = el('p', 'pr-topic'), title = el('h2', 'pr-issue-title');
  const titleLink = el('a');
  titleLink.href = '#idea-' + String(idea.id).padStart(3, '0');
  if (onRate) titleLink.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    onRate(idea.id);
  });
  title.append(titleLink);
  copy.append(topic, title);

  const nLine = el('p', 'pr-n'), nValue = el('span');
  nValue.dataset.stat = 'n';
  const nLabel = document.createTextNode('');
  nLine.append(nValue, nLabel);
  head.append(copy, nLine);
  const body = el('div', 'pr-response');
  const metrics = el('dl', 'pr-metrics');
  const median = stat('Median', 'median', true), mean = stat('Mean', 'mean'), high = stat('Rated 8–10', 'high');
  median.value.append(el('span', 'pr-scale-unit', ' / 10'));
  mean.value.append(el('span', 'pr-scale-unit', ' / 10'));
  metrics.append(median.group, mean.group, high.group);

  const figure = el('figure', 'pr-figure');
  figure.setAttribute('aria-hidden', 'true');
  figure.append(el('figcaption', '', 'Share at each score'));
  const chart = el('div', 'pr-bars');
  figure.append(chart);
  const details = el('details', 'pr-distribution');
  details.dataset.distribution = '';
  details.append(el('summary', '', 'Rating breakdown'));
  const table = el('table', 'pr-table');
  const caption = el('caption', 'pr-sr');
  const thead = el('thead'), headers = el('tr');
  for (const name of ['Score', 'Ratings', 'Share']) {
    const th = el('th', '', name);
    th.scope = 'col'; headers.append(th);
  }
  thead.append(headers);
  const tbody = el('tbody');
  table.append(caption, thead, tbody);
  details.append(table);
  const bins = [];
  for (let i = 1; i <= 10; i++) {
    const cell = el('div', 'pr-bin');
    const track = el('span', 'pr-track'), ink = el('span', 'pr-ink');
    track.append(ink); cell.append(track, el('span', 'pr-bin-label', String(i))); chart.append(cell);
    const tr = el('tr'), label = el('th', '', String(i)), count = el('td'), pct = el('td');
    tr.dataset.score = String(i); label.scope = 'row'; count.dataset.binCount = ''; pct.dataset.binPercent = '';
    tr.append(label, count, pct); tbody.append(tr);
    bins.push({ cell, ink, count, pct });
  }
  body.append(metrics, figure, details);
  row.append(head, body);
  let lastCounts = '';
  function update(i) {
    titleLink.textContent = i.title;
    topic.textContent = i.topic || '';
    caption.textContent = `Ratings for ${i.title}`;
    const signature = i.counts.join(',');
    if (signature === lastCounts) return;
    lastCounts = signature;
    nValue.textContent = number.format(i.n);
    nLabel.nodeValue = i.n === 1 ? ' rating' : ' ratings';
    body.hidden = i.n === 0;
    row.classList.toggle('pr-empty-row', i.n === 0);
    if (i.n === 0) { details.open = false; return; }
    median.data.textContent = number.format(i.median);
    mean.data.textContent = number.format(i.mean);
    const highCount = i.counts[7] + i.counts[8] + i.counts[9];
    high.data.textContent = number.format(100 * highCount / i.n) + '%';
    i.counts.forEach((count, k) => {
      const pct = (count * 100) / i.n, b = bins[k];
      const displayed = number.format(pct) + '%';
      b.count.textContent = number.format(count);
      b.pct.textContent = displayed;
      b.ink.style.height = pct + '%';
      b.cell.title = `Score ${k + 1} · ${plural(count, 'rating')} · ${displayed}`;
    });
  }
  update(idea);
  return { row, update };
}

function methodology() {
  const details = el('details', 'pr-method');
  details.append(el('summary', '', 'How to read these results'));
  const sections = el('div', 'pr-method-body');
  const section = (title, text) => {
    const block = el('section'); block.append(el('h3', '', title), el('p', '', text)); sections.append(block);
  };
  section('Who took part', 'Anyone with the link can participate and choose which issues to rate. Each issue can draw a different group. The results describe voluntary responses to that issue. We cannot use them to estimate what a town or the country thinks. The survey collects no locations or demographics, uses no weights and reports no sampling margin of error.');
  section('What people saw', 'Drew Cleaver selected the launch proposals and reviews additions. The survey shuffles the issues for each visit. Readers can also search or open a shared issue. Each issue uses the same question and the same scale. Results are available by choice. “Not sure” and skipping record no rating.');
  section('What counts', 'Each public internet address can hold one current rating per issue. People on the same Wi-Fi can change that shared rating. A changed address can count separately. Each issue uses its own private connection code, so an overall count of individual participants is unavailable.');
  section('How long a rating lasts', 'A new score or a change starts a 30-day window. Repeating the same score keeps its existing expiry. Withdrawing removes it. Earlier upvotes and downvotes belong to the previous version and are excluded from these statistics.');
  section('How to interpret the numbers', 'The median is the middle score after sorting the ratings. For an even count, it is the midpoint of the two middle scores. The mean is the arithmetic average, treating each step on the scale equally. “Rated 8–10” is the percentage of current ratings in that range. With few ratings, one response can shift the figures substantially.');
  section('How to spot disagreement', 'Imagine five ratings of 1 and five of 10. Their mean and median are both 5.5. Five ratings of 5 and five of 6 give the same summaries. The ten bars show which scores were actually chosen. Each bar’s height is its share of that issue’s ratings, up to 100%. Open the breakdown for exact counts.');
  const question = el('p', 'pr-method-question');
  const timing = el('p', 'pr-method-time');
  const learn = el('p', 'pr-source-links');
  for (const [label, url] of [
    ['AAPOR survey guidance', 'https://aapor.org/standards-and-ethics/best-practices/'],
    ['Pew Research Center on question order', 'https://www.pewresearch.org/writing-survey-questions/']
  ]) {
    const a = el('a', '', label); a.href = url; a.rel = 'noreferrer'; learn.append(a);
  }
  sections.prepend(question);
  sections.append(timing, learn);
  details.append(sections);
  return {
    details,
    update(report) {
      const low = report.anchors?.low || 'Lowest priority', high = report.anchors?.high || 'Highest priority';
      question.textContent = `“${report.question}” Scale from 1 (${low}) to 10 (${high}).`;
      const text = [];
      if (hasDate(report.startedAt)) text.push('The 1–10 survey opened ' + utc(report.startedAt) + '.');
      text.push('This view covers active ratings in the preceding 30 days as of ' + utc(report.asOf) + '.');
      if (hasDate(report.snapshotAt)) text.push('Latest Friday snapshot ' + utc(report.snapshotAt) + '.');
      timing.textContent = text.join(' ');
    },
  };
}

export function mountResults(container, { api = '', request, credentials = 'omit', onRate, onBack } = {}) {
  const scope = new AbortController();
  const endpoint = api.replace(/\/$/, '');
  const get = request || ((path, options) => fetch(endpoint + path, {
    credentials, referrerPolicy: 'no-referrer', redirect: 'error', ...options,
  }));
  const page = el('div', 'priority-results');
  const header = el('header', 'pr-header');
  const back = control('Return to survey', 'pr-back');
  if (onBack) back.addEventListener('click', onBack);
  else back.addEventListener('click', () => { location.hash = ''; });
  const heading = el('h1', 'pr-title', 'Priority results');
  heading.tabIndex = -1;
  const intro = el('p', 'pr-intro', 'These voluntary ratings show how respondents prioritized each issue in the past 30 days. Open a breakdown for exact counts.');
  const coverage = el('p', 'pr-coverage');
  header.append(back, heading, intro, coverage);

  const methods = methodology();
  const downloads = el('div', 'pr-downloads');
  const download = control('Download results CSV', 'pr-download');
  download.dataset.exportCsv = ''; download.disabled = true;
  const historic = control('Download Friday snapshots', 'pr-download'); historic.hidden = true;
  const downloadStatus = el('span', 'pr-download-status');
  downloadStatus.setAttribute('role','status');
  downloads.append(download, historic, downloadStatus);

  const bar = el('div', 'pr-filters');
  const searchLabel = el('label', 'pr-search-label','Find an issue');
  const search = el('input', 'pr-search');
  search.type = 'search'; search.placeholder = 'Search by title or topic'; search.autocomplete = 'off';
  search.dataset.resultsSearch = ''; search.disabled = true; searchLabel.append(search);
  const ratedLabel = el('label', 'pr-filter-check');
  const rated = el('input'); rated.type = 'checkbox'; rated.dataset.ratedOnly = ''; rated.disabled = true;
  ratedLabel.append(rated, document.createTextNode('Rated issues only'));
  bar.append(searchLabel, ratedLabel);
  const serviceState = el('p', 'pr-service-state', 'Loading live results…');
  const retry = control('Retry results', 'pr-retry'); retry.hidden = true;
  const countState = el('p', 'pr-search-state'); countState.setAttribute('role', 'status');
  const rows = el('div', 'pr-list');
  page.append(header, methods.details, downloads, bar, serviceState, retry, countState, rows);
  container.replaceChildren(page);
  heading.focus({ preventScroll: true });

  let current = null, etag = '', timer, busy = false, exporting = false, failures = 0, saved = '';
  let choseFilter = false;
  const records = new Map();
  let order = [], keys = new Map();

  function filter() {
    const query = normal(search.value);
    const code = /^\s*(?:idea\s*[-#]?\s*|#)?0*(\d+)\s*$/i.exec(search.value);
    const words = query.split(' ').filter(Boolean);
    let found = 0;
    for (const i of order) {
      const match = code ? i.id === Number(code[1]) : words.every(w => keys.get(i.id).includes(w));
      const visible = match && (!rated.checked || i.n > 0);
      records.get(i.id).row.hidden = !visible;
      if (visible) found++;
    }
    const active = Boolean(query || rated.checked);
    const message = active ? (found ? plural(found, 'matching issue') : 'No issues match these filters.') : '';
    if (countState.textContent !== message) countState.textContent = message;
    countState.hidden = !message;
  }

  function display(report) {
    current = report;
    const nRated = report.ideas.filter(i => i.n > 0).length;
    const total = report.ideas.length;
    if (!choseFilter) rated.checked=nRated>0;
    coverage.textContent = !total ? 'No active issues.'
      : nRated ? plural(nRated, 'issue') + ' with current ratings · ' + plural(total, 'active issue')
      : 'No 1–10 ratings yet · ' + plural(total, 'active issue');
    methods.update(report);
    download.disabled = exporting; historic.disabled = exporting; historic.hidden = !hasDate(report.snapshotAt);
    search.disabled = false; rated.disabled = false;
    const ids = new Set(report.ideas.map(i => i.id));
    for (const [id, record] of records) {
      if (!ids.has(id)) { record.row.remove(); records.delete(id); }
    }
    order = [...report.ideas].sort((a,b) => alphabetical.compare(a.title, b.title) || a.id - b.id);
    keys = new Map(order.map(i => [i.id, normal([i.title, i.topic, ...(i.aliases || [])].join(' '))]));
    let cursor = rows.firstElementChild;
    for (const i of order) {
      let record = records.get(i.id);
      if (!record) { record = resultRow(i, onRate); records.set(i.id, record); }
      else record.update(i);
      if (record.row !== cursor) rows.insertBefore(record.row, cursor);
      cursor = record.row.nextElementSibling;
    }
    filter();
  }

  function clearSaved() {
    if (saved) URL.revokeObjectURL(saved);
    saved = '';
  }
  async function exportCsv(button, path, basename) {
    if (button.disabled || exporting) return;
    exporting = true; download.disabled = true; historic.disabled = true;
    downloadStatus.textContent = 'Preparing the download…';
    try {
      const response = await get(path, {cache:'no-store', signal:scope.signal});
      if (!response.ok || !response.headers.get('content-type')?.toLowerCase().includes('csv')) throw Error();
      const blob = await response.blob();
      if (scope.signal.aborted) return;
      clearSaved();
      saved = URL.createObjectURL(blob);
      const link = el('a', 'pr-save-file', 'Save CSV file');
      link.href = saved;
      link.download = basename + '-' + new Date().toISOString().slice(0,10) + '.csv';
      downloadStatus.replaceChildren(link);
      link.click();
    } catch {
      if (!scope.signal.aborted) downloadStatus.textContent = 'The download was unavailable. Try again.';
    } finally {
      exporting = false;
      if (!scope.signal.aborted) { download.disabled = false; historic.disabled = false; }
    }
  }

  const schedule = () => {
    clearTimeout(timer);
    if (!scope.signal.aborted && !document.hidden) timer = setTimeout(refresh, failures ? Math.min(60000, 7000 * 2 ** Math.min(failures, 3)) : 7500);
  };
  async function refresh() {
    clearTimeout(timer);
    if (scope.signal.aborted || document.hidden || busy) return;
    busy = true;
    try {
      const response = await get('/survey/results', {
        signal: scope.signal, cache: 'no-cache', headers: etag ? {'If-None-Match':etag} : {},
      });
      if (scope.signal.aborted) return;
      if (response.status !== 304) {
        if (!response.ok) throw Error();
        const report = await response.json();
        if (scope.signal.aborted) return;
        if (!validReport(report)) throw Error();
        if (!current || new Date(report.asOf) >= new Date(current.asOf)) {
          display(report); etag = response.headers.get('etag') || '';
        }
      }
      if (!current) throw Error();
      failures = 0; serviceState.hidden = true; retry.hidden = true;
    } catch {
      if (scope.signal.aborted) return;
      failures++; serviceState.hidden = false; retry.hidden = false;
      serviceState.textContent = current ? 'Showing the last available results. Reconnecting…' : 'Results are temporarily unavailable. Try again.';
    } finally { busy = false; schedule(); }
  }
  const visibility = () => { if (document.hidden) clearTimeout(timer); else refresh(); };
  document.addEventListener('visibilitychange', visibility);
  search.addEventListener('input', filter); rated.addEventListener('change', () => { choseFilter=true; filter(); });
  download.addEventListener('click', () => exportCsv(download, '/survey/export.csv', '45-north-priority-ratings'));
  historic.addEventListener('click', () => exportCsv(historic, '/survey/snapshots.csv', '45-north-friday-snapshots'));
  retry.addEventListener('click', refresh);
  refresh();
  return () => {
    scope.abort(); clearTimeout(timer); clearSaved();
    document.removeEventListener('visibilitychange', visibility);
    page.remove();
  };
}
