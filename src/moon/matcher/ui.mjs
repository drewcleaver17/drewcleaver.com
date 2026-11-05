import {
  gear,
  searchGear,
  categoryNames,
  counts,
  entryUrl,
  portEnds,
} from './directory.mjs'
import {
  emptySelection,
  readSelection,
  matchHash,
  matchUrl,
  chooseGear,
  outputChoices,
  selectOutput,
  choicesFor,
  selectedOffer,
  summarize,
  systemChoices,
  preferredPartners,
  byConnector,
  retailMoney,
  caution,
} from './engine.mjs'
import { esc, external } from './view.mjs'
import { paths, newId, validId, source } from '../catalog.mjs'
import { header, readBag, updateBag, saveSession } from '../state.mjs'
import { offerDate } from './offers.mjs'
import { inventoryInfo } from './inventory.mjs'

const page = document.querySelector('main')
const work = document.getElementById('match-work')
const statusEl = document.getElementById('match-status')
const directory = page.dataset.route === 'match/directory'
const params = new URLSearchParams(location.search)
const edit = params.get('edit')
const ref = params.get('ref')
let state,
  busy = false,
  orderId = edit || (validId(ref) ? ref : newId())
let searchSide = ''
const directorySize = 18
const directoryFilters = {
  query: '',
  category: '',
  scope: '',
  documented: false,
  page: 1,
}
const queryBySide = new Map()
const sideTitle = {
  h: 'Headphones or earphones',
  a: 'Amp or music player',
  from: 'Signal source',
  to: 'Receiving device',
}
const hint = {
  h: 'Search headphones or IEMs',
  a: 'Search amps, DACs or players',
  from: 'Search the device sending audio',
  to: 'Search the device receiving audio',
}
const titleFor = (id) =>
  id === byConnector ? 'I know my headphone output' : gear.get(id)?.name
const helpUrlFor = (s) =>
  paths.match +
  'help/' +
  (validId(ref || edit) ? '?ref=' + (ref || edit) : '') +
  matchHash(s)
const anchor = (href, label, cls = 'textlink') =>
  '<a class="' + cls + '" href="' + esc(href) + '">' + esc(label) + '</a>'
const option = (id, label, chosen) =>
  '<option value="' +
  esc(id) +
  '"' +
  (id === chosen ? ' selected' : '') +
  '>' +
  esc(label) +
  '</option>'
function sourceList(links) {
  return links.length
    ? '<details class="match-sources"><summary>Sources for this fit (' +
        links.length +
        ')</summary><ul>' +
        links.map((x) => '<li>' + external(x.url, x.label) + '</li>').join('') +
        '</ul></details>'
    : ''
}
function factRows(lines) {
  return (
    '<dl class="match-facts">' +
    lines
      .map(
        ([k, v]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>',
      )
      .join('') +
    '</dl>'
  )
}
function shortDescription(g) {
  const base = g.item ? 'Moon catalog' : 'Extended gear'
  const fitting =
    caution(g)?.blockHeadphone || caution(g)?.blockAmp
      ? 'Specialist fit check'
      : g.listener?.fit && g.listener.cables.length && !g.listener.mode
        ? g.listener.fit
        : g.player?.outputs?.length
          ? g.player.outputs
              .map((o) => (o.plug === 'xlr4' ? '4-pin XLR' : o.plug + ' mm'))
              .join(' / ') + ' headphone out'
          : g.canSend || g.canReceive
            ? 'Component connections'
            : categoryNames[g.category] + ' · Fit to check'
  return base + ' · ' + fitting
}
function switcher() {
  return (
    '<nav class="match-modes" aria-label="Connection type">' +
    [
      ['headphones', 'Headphones & amps'],
      ['system', 'Audio components'],
      ['ports', 'By component ports'],
    ]
      .map(
        ([key, label]) =>
          '<button type="button" data-mode="' +
          key +
          '" aria-pressed="' +
          (state.mode === key) +
          '">' +
          label +
          '</button>',
      )
      .join('') +
    '</nav>'
  )
}
function field(side) {
  const id = state[side],
    g = gear.get(id),
    label = sideTitle[side]
  if (!id) {
    const partners = preferredPartners(state, side)
    const browse = partners?.size
      ? `<p class="small">Browse to see ${partners.size} documented partner${partners.size === 1 ? '' : 's'} first.</p>`
      : ''
    return `<section class="gear-field"><label class="field" for="find-${side}">${label}</label>
      <div class="gear-input"><input type="search" id="find-${side}" data-search="${side}" autocomplete="off" placeholder="${hint[side]}" aria-controls="hits-${side}" value="${esc(queryBySide.get(side) || '')}">
        <button type="button" data-browse="${side}" aria-label="Browse ${label}">Browse</button></div>
      ${browse}<div class="gear-hits" id="hits-${side}" hidden></div>
      ${side === 'a' ? '<button class="linkbutton" data-direct>I know the headphone jack</button>' : ''}</section>`
  }
  const ordinary = state.mode === 'headphones'
  const note =
    caution(g)?.note || (ordinary ? g?.player?.note || g?.listener?.note : '')
  const revisions =
    ordinary && g?.listener?.revisions
      ? g.listener.revisions
          .map(
            (r) =>
              `<button class="outline" data-pick="h" data-id="${esc(r.id)}">${esc(r.label)}</button>`,
          )
          .join('')
      : ''
  const alternate =
    ordinary && (g?.canSend || g?.canReceive)
      ? anchor(
          entryUrl(g, g.canReceive ? 'to' : 'from'),
          'Use this model in a component system ↗',
        )
      : !ordinary && g?.player?.outputs?.length
        ? anchor(entryUrl(g, 'a'), 'Find a headphone cable for this model ↗')
        : ''
  return `<section class="gear-field"><div class="gear-top"><span>${label}</span>
    <button type="button" class="linkbutton" data-clear="${side}" aria-label="Change ${label}">Change</button></div>
    <h3>${esc(titleFor(id))}</h3>
    ${ordinary && g?.listener?.fit ? '<p>' + esc(g.listener.fit) + '</p>' : ''}
    ${note ? '<p class="device-note">' + esc(note) + '</p>' : ''}
    ${revisions ? '<div class="buttons">' + revisions + '</div>' : ''}${alternate}
    ${id === byConnector ? '<p>Choose a socket explicitly marked for headphones. Line outputs and mic inputs have different functions.</p>' : ''}</section>`
}
function searchResults(side) {
  const el = document.getElementById('hits-' + side)
  if (!el) return
  const query = queryBySide.get(side) || ''
  const hits = searchGear(query, {
    side,
    preferred: preferredPartners(state, side),
  })
  const list = hits.slice(0, 7)
  el.hidden = false
  el.innerHTML =
    list
      .map(
        (g) =>
          '<button type="button" class="gear-hit" data-pick="' +
          side +
          '" data-id="' +
          esc(g.id) +
          '"><span><b>' +
          esc(g.name) +
          '</b><small>' +
          esc(shortDescription(g)) +
          '</small></span><span aria-hidden="true">↗</span></button>',
      )
      .join('') +
    (!hits.length
      ? '<p>No listed model matches that name.</p>'
      : hits.length > list.length
        ? '<p>Showing ' +
          list.length +
          ' of ' +
          hits.length +
          '. Type more of the model name to narrow the list.</p>'
        : '') +
    '<a class="textlink" data-unknown="' +
    side +
    '" href="' +
    esc(helpUrlFor(state)) +
    '">Ask about an unlisted model ↗</a>'
  statusEl.textContent = hits.length
    ? list.length + ' model choices shown in ' + sideTitle[side]
    : 'No model found. Fit help is available.'
}
function portsField(side) {
  const options = [...portEnds[side]]
  return (
    '<section class="gear-field"><label for="port-' +
    side +
    '" class="field">' +
    (side === 'from'
      ? 'Output on the sending device'
      : 'Input on the receiving device') +
    '<select id="port-' +
    side +
    '" data-port-end="' +
    side +
    '">' +
    option(
      '',
      side === 'from'
        ? 'Choose an output and signal type'
        : 'Choose an input and signal type',
      state[side],
    ) +
    options.map(([id, label]) => option(id, label, state[side])).join('') +
    '</select></label></section>'
  )
}
function headphoneOutput() {
  if (!state.a || !outputChoices(state).length) return ''
  return (
    '<fieldset class="match-output"><legend>Which headphone output will you use?</legend><div class="port-options">' +
    outputChoices(state)
      .map(
        (o) =>
          '<label><input type="radio" name="headphone-output" value="' +
          esc(o.value) +
          '"' +
          (o.selected ? ' checked' : '') +
          '><span>' +
          esc(o.label) +
          '</span></label>',
      )
      .join('') +
    '</div></fieldset>' +
    (state.a === 'ifi-zen-dac-3'
      ? '<figure class="match-diagram"><img src="/moon/art/zen-front.svg" width="660" height="235" alt="Front panel of the iFi ZEN DAC 3 with the 4.4 mm balanced headphone socket marked"><figcaption>iFi ZEN DAC 3 · front panel illustration</figcaption></figure>'
      : '')
  )
}
function includedCable() {
  const description = gear.get(state.h)?.listener?.included?.[state.port]
  if (!description) return ''
  return (
    '<div class="included-tip"><strong>Your included cable works here.</strong><p>' +
    esc(description) +
    '</p></div>'
  )
}
function shortCable(name) {
  return name
    .replace('Headphone Cable - Universal (Fits Most)', 'Universal')
    .replace(/ (?:Headphone )?Cable for /i, ' · ')
    .replace(/ Headphones$/, '')
}
function shortFinish(o) {
  const material = /rhodium/i.test(o.finish)
    ? 'Rhodium'
    : /gold/i.test(o.finish)
      ? 'Gold'
      : o.finish
  const style = /right angle|rt angle|right angled/i.test(o.finish)
    ? 'right-angle '
    : /straight/i.test(o.finish)
      ? 'straight '
      : ''
  return style + material + (/adapter/i.test(o.finish) ? ' + ¼ in adapter' : '')
}
function cableOptions() {
  if (!state.h) return ''
  const list = choicesFor(state)
  if (!list.length) return ''
  if (!state.port) {
    return (
      '<details class="match-sources"><summary>Dragon cables for these headphones (' +
      list.length +
      ')</summary><ul>' +
      list.map((c) => '<li>' + external(c.url, c.name) + '</li>').join('') +
      '</ul><p>Choose an amp and output to check the other end.</p></details>'
    )
  }
  list.sort((a, b) => minPrice(a) - minPrice(b) || a.name.localeCompare(b.name))
  const cable = list.find((c) => c.handle === state.cable)
  return (
    '<label class="field" for="match-cable">Dragon cable<select id="match-cable">' +
    option('', 'Choose a compatible cable (' + list.length + ')', state.cable) +
    list
      .map((c) =>
        option(
          c.handle,
          shortCable(c.name) +
            (c.offers.length
              ? ' · from ' + retailMoney(minPrice(c))
              : ' · fit documented'),
          state.cable,
        ),
      )
      .join('') +
    '</select></label>' +
    (cable ? pricedOptions(cable) : '')
  )
}
function minPrice(c) {
  return c.offers.reduce((min, o) => Math.min(min, o.usd), Infinity)
}
function pricedOptions(c) {
  const options = c.offers.toSorted(
    (a, b) =>
      a.feet - b.feet || a.usd - b.usd || a.finish.localeCompare(b.finish),
  )
  const low = minPrice(c)
  const selectors = options
    .map((o) => {
      const delta = o.usd > low ? ' (+' + retailMoney(o.usd - low) + ')' : ''
      const label =
        o.length +
        ' · ' +
        shortFinish(o) +
        ' · ' +
        retailMoney(o.usd) +
        delta +
        (o.policy ? ' · final sale' : '')
      return option(o.id, label, state.offer)
    })
    .join('')
  const select = `<label class="field" for="match-offer">Length and plug finish
    <select id="match-offer">${option('', 'Choose your build', state.offer)}${selectors}</select></label>`
  const o = selectedOffer(state)
  if (!o) return '<div class="match-pricing">' + select + '</div>'
  const parts =
    o.parts.length > 1
      ? factRows(
          o.parts.map((p) => [
            p.label,
            p.usd ? retailMoney(p.usd) : 'Included',
          ]),
        )
      : ''
  const rush = o.rushUsd
    ? `<label class="check"><input id="match-rush" type="checkbox" ${state.rush ? 'checked' : ''}>
    <span>Rush workshop processing <strong>+${retailMoney(o.rushUsd)}</strong><small>Shipping time is separate.</small></span></label>`
    : ''
  const terms = o.policy
    ? '<p class="policyline"><strong>' + esc(o.policy) + '</strong></p>'
    : '<p class="fine">' +
      external(source.returns, 'Check return terms for this build') +
      '</p>'
  const reselect = o.selections.length
    ? '<div class="reselect"><strong>On Moon Audio, choose these options</strong>' +
      factRows(o.selections.map((x) => [x.label, x.value])) +
      '</div>'
    : ''
  const retailer = external(
    o.url,
    o.selections.length
      ? 'Open Moon Audio configurator'
      : 'View this variant on Moon Audio',
  )
  return `<div class="match-pricing">${select}${rush}
    <div class="match-total"><span>Merchandise before tax</span><strong>${retailMoney(o.usd)}</strong></div>
    <div class="charge-lines">${parts}</div>${terms}<p class="fine">U.S. catalog price checked ${esc(offerDate)}. Moon Audio confirms current price and availability.</p>
    <div class="buttons"><button type="button" id="match-add" class="button">${edit ? 'Save changes to bag' : 'Add to demo bag'} →</button>${retailer}</div>
    ${reselect}</div>`
}
function systemOptions() {
  const list = systemChoices(state)
  if (!list.length) return ''
  const selected = list.find((x) => x.id === state.system)
  return (
    '<label class="field" for="system-route">Cable and signal path<select id="system-route">' +
    option(
      '',
      'Choose a documented route (' + list.length + ')',
      state.system,
    ) +
    list
      .map((x) =>
        option(
          x.id,
          x.name + ' · ' + x.from.port + ' → ' + x.to.port,
          state.system,
        ),
      )
      .join('') +
    '</select></label>' +
    (selected
      ? external(selected.url, 'View this Dragon on Moon Audio', 'button')
      : '')
  )
}
function emptyAside() {
  return (
    '<aside class="match-aside empty"><figure><img src="/moon/art/blue-detail.svg" width="760" height="340" alt="Illustration of two earcup plugs and the balanced amplifier plug">' +
    '<figcaption>Dragon cable ends · workshop illustration</figcaption></figure>' +
    '<div><h2>Have an unfamiliar model?</h2><p>Search Moon’s catalog first, then gear documented in Dragon connection records. Where a fit is missing, you can take the model to the cable desk.</p>' +
    anchor(
      paths.match + 'directory/',
      'Explore ' + counts.catalog + ' catalog listings ↗',
    ) +
    '</div></aside>'
  )
}
function result() {
  if (!state.h && !state.a && !state.from && !state.to) return emptyAside()
  const summary = summarize(state)
  const offer = selectedOffer(state)
  const overview = offer
    ? `<div class="fit-overview"><strong>${retailMoney(offer.usd)}</strong><span>${esc(offer.length)} · ${esc(shortFinish(offer))}<small>${state.rush ? 'Workshop rush included' : 'Standard processing'}</small></span></div>`
    : `<p>${esc(summary.recommendation)}</p>`
  const selections =
    state.mode === 'headphones' ? cableOptions() : systemOptions()
  return (
    '<aside id="fit-result" class="match-aside fit-result" aria-label="Cable fit"><p class="eyebrow">' +
    esc(summary.status) +
    '</p><h2>' +
    esc(offer ? shortCable(summary.title) : summary.title) +
    '</h2>' +
    overview +
    factRows(
      summary.lines.filter(
        ([k]) =>
          ![
            'Dragon cable',
            'Length',
            'Plug finish / style',
            'Processing',
            'Merchandise',
            'Included cable',
            'Return terms',
          ].includes(k),
      ),
    ) +
    (state.mode === 'headphones' ? includedCable() : '') +
    selections +
    '<div class="match-actions"><a class="textlink" href="' +
    esc(helpUrlFor(state)) +
    '">Ask a cable advisor ↗</a><button type="button" class="linkbutton" id="share-match">Copy this fit</button></div>' +
    '<div id="share-status" role="status"></div>' +
    sourceList(summary.sources) +
    '</aside>'
  )
}
function redraw(focus) {
  if (!state) {
    work.innerHTML =
      '<section class="buildcard"><h2>This fit link needs a fresh copy.</h2><p>A model, output or priced choice is missing or has changed. Ask for a current link or start a new match.</p>' +
      anchor(paths.match, 'Start a new match →', 'button') +
      '</section>'
    return
  }
  const outcome = state.h && state.port && choicesFor(state).length
  const jump = outcome
    ? '<button class="outline match-jump" id="see-fits">See ' +
      outcome +
      ' compatible cable' +
      (outcome === 1 ? '' : 's') +
      ' ↓</button>'
    : ''
  const fields =
    state.mode === 'headphones'
      ? field('h') + field('a') + headphoneOutput() + jump
      : state.mode === 'ports'
        ? '<p>Read the signal label beside each socket. RCA and XLR sockets can carry different kinds of audio.</p>' +
          portsField('from') +
          portsField('to')
        : field('from') +
          field('to') +
          '<button class="linkbutton" id="swap-gear">Reverse signal direction ⇄</button>'
  work.innerHTML =
    switcher() +
    '<div class="match-grid"><section class="gear-controls" aria-label="Your gear">' +
    fields +
    '</section>' +
    result() +
    '</div>'
  const helpUrl = helpUrlFor(state)
  document.querySelectorAll('[data-help]').forEach((a) => (a.href = helpUrl))
  if (focus) document.getElementById(focus)?.focus({ preventScroll: true })
}
function change(next, focus, notice) {
  const hash = matchHash(next)
  if (hash !== location.hash)
    history.pushState(null, '', location.pathname + location.search + hash)
  state = next
  searchSide = ''
  redraw(focus)
  statusEl.textContent = notice || summarize(state).status
}
function setGear(side, id) {
  queryBySide.delete(side)
  const next = chooseGear(state, side, id)
  change(next)
  if (!id) {
    document.getElementById('find-' + side)?.focus()
  } else if (side === 'h' && !next.a) document.getElementById('find-a')?.focus()
  else if (side === 'from' && !next.to)
    document.getElementById('find-to')?.focus()
  else {
    const dest = work.querySelector(
      'input[name="headphone-output"]:not(:checked),#match-cable,#system-route',
    )
    if (dest) dest.focus({ preventScroll: true })
    else
      work
        .querySelector('[data-clear="' + side + '"]')
        ?.focus({ preventScroll: true })
  }
}
function directoryPage() {
  work.innerHTML =
    '<div class="directory-filters"><label class="field" for="dir-q">Brand or model<input id="dir-q" type="search" placeholder="Search all equipment" autocomplete="off"></label>' +
    '<label class="field" for="dir-scope">Catalog<select id="dir-scope">' +
    option('', 'All equipment', '') +
    option('catalog', 'Moon catalog', '') +
    option('extended', 'Extended gear', '') +
    '</select></label>' +
    '<label class="field" for="dir-category">Equipment type<select id="dir-category">' +
    option('', 'All types', '') +
    Object.entries(categoryNames)
      .map(([id, label]) => option(id, label, ''))
      .join('') +
    '</select></label>' +
    '<label class="dir-check"><input type="checkbox" id="dir-fit"> Has documented connections</label></div>' +
    '<div class="directory-count" id="dir-count" role="status"></div><div id="dir-hits" class="dir-hits"></div><div id="dir-pages"></div>' +
    '<details class="match-sources coverage"><summary>What the directory covers</summary><p>' +
    counts.catalog +
    ' electronics listings from Moon Audio’s public catalog, checked ' +
    esc(inventoryInfo.date) +
    '. ' +
    counts.documentedCatalog +
    ' listings have at least one documented cable connection or headphone output. Extended gear comes from published product and connector records. A listing may include multiple editions. Stock and checkout terms are confirmed by Moon Audio.</p></details>'
  directoryResults()
}
function directoryResults() {
  const list = searchGear(directoryFilters.query, directoryFilters)
  const pages = Math.max(1, Math.ceil(list.length / directorySize))
  directoryFilters.page = Math.min(pages, Math.max(1, directoryFilters.page))
  const start = (directoryFilters.page - 1) * directorySize
  document.getElementById('dir-count').textContent = list.length
    ? 'Showing ' +
      (start + 1) +
      '–' +
      Math.min(start + directorySize, list.length) +
      ' of ' +
      list.length +
      ' equipment records' +
      (directoryFilters.scope === 'catalog'
        ? ' · ' + new Set(list.map((g) => g.item.url)).size + ' Moon listings'
        : '')
    : 'No equipment records match these filters.'
  document.getElementById('dir-hits').innerHTML =
    list
      .slice(start, start + directorySize)
      .map(
        (g) =>
          '<a class="dir-row" href="' +
          esc(entryUrl(g)) +
          '"><span><strong>' +
          esc(g.name) +
          '</strong><small>' +
          esc(shortDescription(g)) +
          '</small></span><span aria-hidden="true">↗</span></a>',
      )
      .join('') ||
    '<p>Try the model without its brand, or ask the desk to identify it.</p>' +
      '<a data-dir-unknown class="textlink" href="' +
      paths.match +
      'help/#m1">Ask a cable advisor ↗</a>'
  history.replaceState({ moonDirectory: { ...directoryFilters } }, '')
  document.getElementById('dir-pages').innerHTML =
    pages < 2
      ? ''
      : '<nav aria-label="Equipment pages"><button class="outline" data-dir="-1" ' +
        (directoryFilters.page === 1 ? 'disabled' : '') +
        '>← Previous</button><span>Page ' +
        directoryFilters.page +
        ' of ' +
        pages +
        '</span><button class="outline" data-dir="1" ' +
        (directoryFilters.page === pages ? 'disabled' : '') +
        '>Next →</button></nav>'
}
function restore() {
  header()
  if (directory) {
    const saved = history.state?.moonDirectory
    if (saved) Object.assign(directoryFilters, saved)
    directoryPage()
    document.getElementById('dir-q').value = directoryFilters.query
    document.getElementById('dir-scope').value = directoryFilters.scope
    document.getElementById('dir-category').value = directoryFilters.category
    document.getElementById('dir-fit').checked = directoryFilters.documented
  } else {
    state = readSelection(location.hash)
    if (
      (edit &&
        (!validId(edit) ||
          !readBag()?.some((l) => l.id === edit && l.kind === 'match'))) ||
      (ref && (!validId(ref) || edit))
    )
      state = null
    redraw()
  }
  page.dataset.ready = 'true'
  page.inert = false
  delete document.documentElement.dataset.restoring
}
work.addEventListener('input', (e) => {
  const input = e.target
  if (input.id === 'dir-q') {
    directoryFilters.query = input.value
    directoryFilters.page = 1
    directoryResults()
  } else if (input.dataset.search) {
    searchSide = input.dataset.search
    queryBySide.set(searchSide, input.value)
    searchResults(searchSide)
  }
})
work.addEventListener('change', (e) => {
  const el = e.target
  if (directory) {
    // A search field fires change on blur. Repainting here would remove
    // the result link between pointer-down and click.
    if (!['dir-scope', 'dir-category', 'dir-fit'].includes(el.id)) return
    if (el.id === 'dir-scope') directoryFilters.scope = el.value
    if (el.id === 'dir-category') directoryFilters.category = el.value
    if (el.id === 'dir-fit') directoryFilters.documented = el.checked
    directoryFilters.page = 1
    directoryResults()
  } else if (el.name === 'headphone-output') {
    change(selectOutput(state, el.value))
    work
      .querySelector('input[name="headphone-output"]:checked')
      ?.focus({ preventScroll: true })
  } else if (el.dataset.portEnd)
    change(chooseGear(state, el.dataset.portEnd, el.value), el.id)
  else if (el.id === 'match-cable')
    change({ ...state, cable: el.value, offer: '', rush: '' }, el.id)
  else if (el.id === 'match-offer')
    change({ ...state, offer: el.value, rush: '' }, el.id)
  else if (el.id === 'match-rush')
    change({ ...state, rush: el.checked ? '1' : '' }, el.id)
  else if (el.id === 'system-route')
    change({ ...state, system: el.value }, el.id)
})
work.addEventListener('keydown', (e) => {
  if (!searchSide) return
  const hits = document.getElementById('hits-' + searchSide)
  if (!hits || hits.hidden) return
  if (e.key === 'Escape') {
    hits.hidden = true
    document.getElementById('find-' + searchSide)?.focus()
  } else if (
    (e.key === 'Enter' || e.key === 'ArrowDown') &&
    e.target.dataset.search
  ) {
    e.preventDefault()
    hits.querySelector('button,a')?.focus()
  }
})
work.addEventListener('click', async (e) => {
  const el = e.target.closest('button,a')
  if (!el) return
  if (el.dataset.dir) {
    history.pushState({ moonDirectory: { ...directoryFilters } }, '')
    directoryFilters.page += Number(el.dataset.dir)
    directoryResults()
    const count = document.getElementById('dir-count')
    count.tabIndex = -1
    count.focus()
  } else if (el.dataset.mode) {
    if (state.mode !== el.dataset.mode) {
      queryBySide.clear()
      change(emptySelection(el.dataset.mode))
      work
        .querySelector('[data-mode][aria-pressed=true]')
        ?.focus({ preventScroll: true })
    }
  } else if (el.dataset.browse) {
    searchSide = el.dataset.browse
    searchResults(searchSide)
    document.getElementById('find-' + searchSide).focus()
  } else if (el.dataset.pick) setGear(el.dataset.pick, el.dataset.id)
  else if (el.dataset.clear) setGear(el.dataset.clear, '')
  else if (el.hasAttribute('data-direct')) setGear('a', byConnector)
  else if (el.hasAttribute('data-dir-unknown')) {
    saveSession(
      'moon.match.unknown.1',
      JSON.stringify({
        term: directoryFilters.query.slice(0, 160),
        hash: '#m1',
      }),
    )
  } else if (el.dataset.unknown) {
    const term = queryBySide.get(el.dataset.unknown)?.trim()
    if (term)
      saveSession(
        'moon.match.unknown.1',
        JSON.stringify({ hash: matchHash(state), term: term.slice(0, 160) }),
      )
  } else if (el.id === 'swap-gear') {
    change({ ...state, from: state.to, to: state.from, system: '' }, el.id)
  } else if (el.id === 'see-fits') {
    const select = document.getElementById('match-cable')
    select?.focus({ preventScroll: true })
    document.getElementById('fit-result')?.scrollIntoView({ block: 'start' })
  } else if (el.id === 'share-match') {
    const url = new URL(matchUrl(state), location.origin).href
    try {
      await navigator.clipboard.writeText(url)
      document.getElementById('share-status').textContent = 'Fit link copied.'
    } catch {
      const container = document.getElementById('share-status')
      container.innerHTML =
        '<label class="field">Copy this fit link<input readonly></label>'
      const box = container.querySelector('input')
      box.value = url
      box.select()
    }
  } else if (el.id === 'match-add' && !busy) {
    const checked = readSelection(matchHash(state))
    if (!checked || !selectedOffer(checked)) return
    busy = true
    el.disabled = true
    try {
      await updateBag((lines) => {
        if (lines.some((l) => l.id === orderId && l.kind !== 'match'))
          throw Error('An unrelated item uses this reference')
        if (edit && !lines.some((x) => x.kind === 'match' && x.id === edit))
          throw Error('Edited line was removed')
        return [
          ...lines.filter((l) => l.id !== orderId),
          { id: orderId, kind: 'match', hash: matchHash(checked) },
        ]
      })
      location.assign(paths.cart)
    } catch {
      busy = false
      el.disabled = false
      statusEl.classList.remove('sr')
      statusEl.textContent =
        'The selection could not be saved. Check the bag and allow local browser storage before retrying.'
    }
  }
})
window.addEventListener(directory ? 'popstate' : 'hashchange', restore)
window.addEventListener('pageshow', (e) => {
  busy = false
  if (e.persisted) restore()
})
restore()
