// Imported only after a reader chooses to reveal community ratings on the issue list.
const decimal = new Intl.NumberFormat('en-US', {maximumFractionDigits: 1});
const alphabetical = new Intl.Collator('en-US', {sensitivity: 'base', numeric: true});
const dateTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC', timeZoneName: 'short', month: 'short', day: 'numeric',
  year: 'numeric', hour: 'numeric', minute: '2-digit'
});

function element(tag, className = '', text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function action(label) {
  const button = element('button', 'ir-button', label);
  button.type = 'button';
  return button;
}

function setText(node, value) {
  if (node.textContent !== value) node.textContent = value;
}

function percent(count, total) {
  const value = count * 100 / total;
  if (count > 0 && value < 0.1) return '<0.1%';
  if (count < total && value > 99.9) return '>99.9%';
  return decimal.format(value) + '%';
}

function isReport(report) {
  return report?.version === 'priority-v2' && Number.isFinite(report.asOf)
    && Array.isArray(report.ideas) && report.ideas.every(issue =>
      Number.isSafeInteger(issue.id) && issue.id > 0 && typeof issue.title === 'string'
      && Number.isSafeInteger(issue.n) && issue.n >= 0
      && Array.isArray(issue.counts) && issue.counts.length === 10
      && issue.counts.every(n => Number.isSafeInteger(n) && n >= 0)
      && issue.counts.reduce((total, n) => total + n, 0) === issue.n
      && (issue.n === 0 ? issue.median === null && issue.mean === null
        : [issue.median, issue.mean].every(n => Number.isFinite(n) && n >= 1 && n <= 10))
    );
}

function methodNotes() {
  const details = element('details', 'ir-method');
  details.append(element('summary', '', 'How to read the results'));
  const body = element('div', 'ir-method-body');
  const timing = element('p');
  body.append(timing);
  const entries = [
    ['Who took part', 'Anyone with the link can choose which proposals to rate. Each issue may draw a different group. The results describe these voluntary, unweighted responses. The survey collects no demographics or locations and reports no sampling margin of error.'],
    ['How issues appear', 'Drew Cleaver selected the launch proposals and reviews additions. Issues appear together in a shuffled order for each visit. Readers may search, follow a direct link or explicitly reveal community results.'],
    ['How the Top 45 is selected', 'When more than 45 proposals are active, issues with current ratings come first. Higher median priority qualifies first. Ties go to the issue with more active ratings, then to the earlier permanent idea number. The selected issues are shuffled for display. The other issues are available on this page and through search.'],
    ['What counts', 'Each public internet address can have one active rating per issue. People sharing a public address can replace that rating. A changed address can count again. Unrated and skipped issues contribute nothing. The service keeps an issue-specific code and cannot count distinct people across issues.'],
    ['The 30-day window', 'A rating or a change counts for 30 days. Repeating the same number keeps the original expiry. Removing the rating clears it. The earlier up/down chart is archived separately.'],
    ['How to compare', 'The median is the middle rating after sorting. For an even count, the two middle ratings are averaged. The mean treats the steps from 1 to 10 as equal. “Rated 8–10” is the share of current ratings in that range. With a small count, one response can move any of these summaries.'],
    ['Where views differ', 'Two ratings of 1 and 10 have the same mean and median as two ratings of 5 and 6. The breakdown shows the count and share at each score. The CSV includes every active issue, the exact wording, the time window and all ten counts.']
  ];
  for (const [heading, text] of entries) {
    const section = element('section');
    section.append(element('h3', '', heading), element('p', '', text));
    body.append(section);
  }
  const links = element('p', 'ir-sources');
  for (const [label, href] of [
    ['AAPOR survey guidance', 'https://aapor.org/standards-and-ethics/best-practices/'],
    ['Pew Research Center on question order', 'https://www.pewresearch.org/writing-survey-questions/']
  ]) {
    const link = element('a', '', label);
    link.href = href;
    link.rel = 'noreferrer';
    links.append(link);
  }
  body.append(links);
  details.append(body);
  return {details, timing};
}

function breakdown(idea) {
  const details = element('details', 'ir-breakdown');
  details.dataset.distribution = '';
  details.append(element('summary', '', 'Rating breakdown'));
  const summary = element('p', 'ir-secondary-stats');
  const mean = element('b');
  mean.dataset.stat = 'mean';
  const high = element('b');
  high.dataset.stat = 'high';
  summary.append('Mean ', mean, ' / 10', element('span', 'ir-dot', ' · '), 'Rated 8–10 ', high);

  const table = element('table', 'ir-table');
  const caption = element('caption', 'ir-visually-hidden', 'Current rating distribution for ' + idea.title);
  const head = element('thead'), heading = element('tr');
  for (const name of ['Score', 'Ratings', 'Share']) {
    const label = element('th', '', name);
    label.scope = 'col';
    heading.append(label);
  }
  head.append(heading);
  const body = element('tbody');
  const bins = [];
  for (let index = 0; index < 10; index++) {
    const row = element('tr');
    row.dataset.score = String(index + 1);
    const score = element('th', '', String(index + 1));
    score.scope = 'row';
    const count = element('td'), share = element('td');
    count.dataset.binCount = '';
    const track = element('span', 'ir-bar-track');
    track.setAttribute('aria-hidden', 'true');
    const ink = element('span', 'ir-bar-ink');
    track.append(ink);
    const percentage = element('span', 'ir-percentage');
    percentage.dataset.binPercent = '';
    share.append(track, percentage);
    row.append(score, count, share);
    body.append(row);
    bins.push({count, percentage, ink});
  }
  table.append(caption, head, body);
  details.append(summary, table);
  return {
    details,
    update(issue) {
      setText(caption, 'Current rating distribution for ' + issue.title);
      setText(mean, decimal.format(issue.mean));
      setText(high, percent(issue.counts[7] + issue.counts[8] + issue.counts[9], issue.n));
      issue.counts.forEach((n, i) => {
        setText(bins[i].count, decimal.format(n));
        setText(bins[i].percentage, percent(n, issue.n));
        bins[i].ink.style.width = (100 * n / issue.n) + '%';
      });
    }
  };
}

function inlineIssue(slot, idea) {
  const line = element('div', 'ir-line');
  const medianGroup = element('span', 'ir-median');
  const median = element('strong');
  median.dataset.stat = 'median';
  medianGroup.append('Community median ', median, ' / 10');
  const total = element('span', 'ir-total'), count = element('span');
  count.dataset.stat = 'n';
  const label = document.createTextNode('');
  total.append(count, label);
  line.append(medianGroup, total);
  slot.replaceChildren(line);
  slot.hidden = false;
  let distribution, previous;
  function update(issue) {
    const signature = issue.counts.join(',') + '|' + issue.title;
    if (previous === signature) return;
    previous = signature;
    setText(count, decimal.format(issue.n));
    label.nodeValue = issue.n === 1 ? ' rating' : ' ratings';
    medianGroup.hidden = issue.n === 0;
    if (issue.n === 0) {
      if (distribution) {
        distribution.details.remove();
        distribution = null;
      }
      return;
    }
    setText(median, decimal.format(issue.median));
    if (!distribution) {
      distribution = breakdown(issue);
      slot.append(distribution.details);
    }
    distribution.update(issue);
  }
  update(idea);
  return {id: idea.id, slot, update};
}

// Comparators accept permanent numeric IDs so the page can reorder its existing nodes.
export function resultComparator(mode, byId) {
  if (mode === 'original') return null;
  return (aId, bId) => {
    const a = byId.get(Number(aId)), b = byId.get(Number(bId));
    if (!a || !b) return Number(Boolean(b)) - Number(Boolean(a)) || Number(aId) - Number(bId);
    if (mode === 'median') return (b.median ?? -1) - (a.median ?? -1) || b.n - a.n || a.id - b.id;
    if (mode === 'count') return b.n - a.n || alphabetical.compare(a.title, b.title) || a.id - b.id;
    return alphabetical.compare(a.title, b.title) || a.id - b.id;
  };
}

export function mountInlineResults({tools, getRows, request, onSort = () => {}, onData = () => {}}) {
  const abort = new AbortController();
  const ownerDocument = tools.ownerDocument;
  const wrap = element('div', 'ir-tools');
  const coverage = element('p', 'ir-coverage');
  const controls = element('div', 'ir-controls');
  const sortLabel = element('label', 'ir-sort-label', 'Order issues by');
  const sort = element('select', 'ir-select');
  sort.dataset.resultsSort = '';
  for (const [value, label] of [
    ['original', 'Shuffled order'], ['median', 'Highest median priority'],
    ['count', 'Most ratings'], ['name', 'Issue name (A–Z)']
  ]) {
    const option = element('option', '', label);
    option.value = value;
    sort.append(option);
  }
  sortLabel.append(sort);
  const download = action('Download results CSV');
  download.dataset.exportCsv = '';
  const archive = action('Download Friday snapshots');
  archive.dataset.snapshotCsv = '';
  archive.hidden = true;
  sort.disabled = true;
  download.disabled = true;

  const downloadFeedback = element('span', 'ir-download-feedback');
  downloadFeedback.setAttribute('role', 'status');
  controls.append(sortLabel, download, archive, downloadFeedback);
  const method = methodNotes();
  const service = element('p', 'ir-service', 'Loading community results…');
  const retry = action('Retry results');
  retry.hidden = true;
  wrap.append(coverage, controls, method.details, service, retry);
  tools.replaceChildren(wrap);
  tools.hidden = false;

  let report, byId = new Map(), etag = '', timer, inFlight = false, forceQueued = false;
  let publishedAfter = 0, fastAttempts = 0, failures = 0, exporting = false, savedFile;
  const attached = new Map();
  const disposed = () => abort.signal.aborted;

  function syncRows() {
    if (disposed() || !report) return;
    const current = new Set();
    for (const [id, mount] of getRows()) {
      if (!mount) continue;
      current.add(mount);
      const idea = byId.get(Number(id));
      let view = attached.get(mount);
      if (!idea) {
        if (view) mount.replaceChildren();
        mount.hidden = true;
        attached.delete(mount);
      } else if (view?.id === idea.id) {
        view.update(idea);
        mount.hidden = false;
      } else {
        view = inlineIssue(mount, idea);
        attached.set(mount, view);
      }
    }
    for (const mount of attached.keys()) {
      if (!current.has(mount)) {
        mount.replaceChildren();
        mount.hidden = true;
        attached.delete(mount);
      }
    }
  }

  function apply(data) {
    report = data;
    byId = new Map(data.ideas.map(i => [i.id, i]));
    const rated = data.ideas.filter(i => i.n > 0).length;
    setText(coverage, `Past 30 days · ${rated} of ${data.ideas.length} active issues have ratings`);
    const notes = [`Current ratings as of ${dateTime.format(data.asOf)}.`];
    if (Number.isFinite(data.startedAt)) notes.push(`The 1–10 survey opened ${dateTime.format(data.startedAt)}.`);
    if (Number.isFinite(data.snapshotAt)) notes.push(`Latest Friday snapshot ${dateTime.format(data.snapshotAt)}.`);
    setText(method.timing, notes.join(' '));
    sort.disabled = false;
    download.disabled = exporting;
    archive.disabled = exporting;
    archive.hidden = !Number.isFinite(data.snapshotAt);
    onData(data);
    syncRows();
    if (sort.value !== 'original') onSort(sort.value, resultComparator(sort.value, byId));
  }

  function schedule(delay) {
    clearTimeout(timer);
    if (!disposed() && !ownerDocument.hidden) timer = setTimeout(() => refresh(), delay);
  }

  async function refresh({force = false, after} = {}) {
    if (disposed()) return;
    if (force) forceQueued = true;
    if (Number.isFinite(after) && after > publishedAfter) {
      publishedAfter = after;
      fastAttempts = 0;
    }
    clearTimeout(timer);
    if (ownerDocument.hidden || inFlight) return;
    inFlight = true;
    const unconditional = forceQueued || publishedAfter > (report?.asOf ?? 0);
    forceQueued = false;
    try {
      const result = await request('/survey/results', {
        signal: abort.signal, cache: 'no-cache',
        headers: !unconditional && etag ? {'If-None-Match': etag} : {}
      });
      if (disposed()) return;
      if (result.status !== 304) {
        if (!result.ok) throw new Error('Results unavailable');
        const data = await result.json();
        if (disposed()) return;
        if (!isReport(data)) throw new Error('Unexpected report');
        if (data.asOf >= publishedAfter && (!report || data.asOf >= report.asOf)) {
          apply(data);
          etag = result.headers.get('etag') || '';
          publishedAfter = 0;
          fastAttempts = 0;
        }
      } else if (!report) {
        throw new Error('Initial report unavailable');
      }
      failures = 0;
      retry.hidden = true;
      service.hidden = Boolean(report);
      if (!report && publishedAfter) setText(service, 'Updating community results…');
    } catch {
      if (disposed()) return;
      failures++;
      service.hidden = false;
      retry.hidden = false;
      setText(service, report ? 'Showing the last confirmed results. Reconnecting…' : 'Community results are unavailable. You can try again.');
    } finally {
      inFlight = false;
      if (!disposed()) {
        let delay = failures ? Math.min(60000, 7500 * 2 ** Math.min(failures, 3)) : 7500;
        if (forceQueued && !failures) delay = 0;
        else if (publishedAfter && ++fastAttempts <= 2 && !failures) delay = 2200;
        schedule(delay);
      }
    }
  }

  function revoke() {
    if (savedFile) URL.revokeObjectURL(savedFile);
    savedFile = undefined;
  }
  async function saveCsv(button, route, basename) {
    if (disposed() || button.disabled || exporting) return;
    exporting = true;
    download.disabled = true;
    archive.disabled = true;
    setText(downloadFeedback, 'Preparing download…');
    try {
      const response = await request(route, {signal: abort.signal, cache: 'no-store'});
      if (!response.ok || !response.headers.get('content-type')?.toLowerCase().includes('csv')) throw new Error('CSV unavailable');
      const blob = await response.blob();
      if (disposed()) return;
      revoke();
      savedFile = URL.createObjectURL(blob);
      const link = element('a', 'ir-save', 'Save CSV file');
      link.href = savedFile;
      link.download = basename + '-' + new Date().toISOString().slice(0, 10) + '.csv';
      downloadFeedback.replaceChildren(link);
      link.click();
    } catch {
      if (!disposed()) setText(downloadFeedback, 'The download was unavailable. Try again.');
    } finally {
      exporting = false;
      if (!disposed()) { download.disabled = !report; archive.disabled = !report; }
    }
  }

  sort.addEventListener('change', () => onSort(sort.value, resultComparator(sort.value, byId)));
  download.addEventListener('click', () => saveCsv(download, '/survey/export.csv', '45-north-priority-ratings'));
  archive.addEventListener('click', () => saveCsv(archive, '/survey/snapshots.csv', '45-north-friday-snapshots'));
  retry.addEventListener('click', () => refresh({force: true}));
  const visibility = () => { if (ownerDocument.hidden) clearTimeout(timer); else refresh(); };
  ownerDocument.addEventListener('visibilitychange', visibility);
  refresh();

  return {
    refresh,
    syncRows,
    destroy() {
      if (disposed()) return;
      abort.abort();
      clearTimeout(timer);
      revoke();
      ownerDocument.removeEventListener('visibilitychange', visibility);
      for (const mount of attached.keys()) {
        mount.replaceChildren();
        mount.hidden = true;
      }
      attached.clear();
      tools.replaceChildren();
      tools.hidden = true;
      if (sort.value !== 'original') onSort('original', null);
    }
  };
}
