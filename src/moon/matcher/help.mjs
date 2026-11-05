import { newId, paths, root } from '../catalog.mjs'
import { esc as escape, external } from './view.mjs'
import { portEnds, searchGear } from './directory.mjs'
import { getLocal, getSession, keys, saveSession } from '../state.mjs'
import {
  byConnector,
  chooseGear,
  choicesFor,
  matchHash,
  matchUrl,
  outputChoices,
  preferredPartners,
  readSelection,
  retailMoney,
  selectOutput,
  selectedOffer,
  summarize,
  systemChoices,
} from './engine.mjs'

const localRequestKey = 'moon.match.request.1'
const unknownKey = 'moon.match.unknown.1'
const fields = ['view', 'ref', 'via', 'slot', 'samples']
const channels = {
  call: 'Demo call',
  photos: 'Example photo review',
  callback: 'Demo callback',
}
const samples = [
  { bit: 1, name: 'Earcup socket', file: 'utopia.svg', model: 'Focal Utopia' },
  {
    bit: 2,
    name: 'Output panel',
    file: 'zen-front.svg',
    model: 'iFi ZEN DAC 3',
  },
]
const deskHours = 'Sample hours · Mon–Fri, 10 am–6 pm Eastern Time'
const isOpen = () => getLocal(keys.desk) !== 'closed'
const helpPath = () => paths.match + 'help/'

function getExtra(search) {
  const params = new URLSearchParams(search)
  if (
    [...params.keys()].some(
      (key) => !fields.includes(key) || params.getAll(key).length !== 1,
    )
  )
    return null
  if (!params.size) return { view: 'ask' }
  const view = params.get('view')
  const ref = params.get('ref') || ''
  if (!view && params.size === 1 && /^[0-9A-F]{8}$/.test(ref))
    return { view: 'ask', ref }
  if (!['desk', 'return'].includes(view) || !/^[0-9A-F]{8}$/.test(ref))
    return null
  if (view === 'return') return params.size === 2 ? { view, ref } : null
  const via = params.get('via')
  const slot = params.get('slot')
  const sampleMask = params.get('samples') || '0'
  if (!Object.hasOwn(channels, via) || !/^[0-3]$/.test(sampleMask)) return null
  if (via === 'callback' ? !['am', 'pm'].includes(slot) : slot !== null)
    return null
  if (via === 'photos' && sampleMask === '0') return null
  return { view, ref, via, slot, sampleMask: Number(sampleMask) }
}

function handoffUrl(extra, state) {
  const p = new URLSearchParams({ view: extra.view, ref: extra.ref })
  if (extra.view === 'desk') {
    p.set('via', extra.via)
    if (extra.via === 'callback') p.set('slot', extra.slot)
    if (extra.sampleMask) p.set('samples', String(extra.sampleMask))
  }
  return helpPath() + '?' + p + matchHash(state)
}

function jsonSession(key) {
  try {
    return JSON.parse(getSession(key))
  } catch {
    return null
  }
}

function localTerm(state, extra) {
  if (extra.view === 'return') return ''
  const hash = matchHash(state)
  const record = jsonSession(unknownKey)
  if (record?.hash === hash && typeof record.term === 'string')
    return record.term.slice(0, 160)
  const request = jsonSession(localRequestKey)
  if (
    extra.ref &&
    request?.ref === extra.ref &&
    request.hash === hash &&
    typeof request.term === 'string'
  )
    return request.term.slice(0, 160)
  return ''
}

function sourceLinks(sources) {
  const links = sources
    .map(({ url, label }) => external(url, label))
    .filter(Boolean)
  return links.length
    ? `<details class="notes"><summary>Check the fit sources</summary><ul>${links.map((link) => '<li>' + link + '</li>').join('')}</ul></details>`
    : ''
}

function gearCard(state, ref, term) {
  const card = summarize(state)
  const rows = card.lines
    .map(
      ([label, value]) =>
        `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`,
    )
    .join('')
  const offer = selectedOffer(state)
  const parts =
    offer?.parts.length > 1
      ? `<details class="notes"><summary>See the price components</summary>${offer.parts
          .map(
            (part) =>
              `<div class="row"><span>${escape(part.label)}</span><b>${part.usd ? retailMoney(part.usd) : 'Included'}</b></div>`,
          )
          .join('')}</details>`
      : ''
  return `<article class="ticket"><div class="ticket-top"><span class="mono">Gear &amp; connections</span>${ref ? `<span class="code">MF-${escape(ref)}</span>` : ''}</div>
    <h2>${escape(card.title)}</h2><p class="fit-note">${escape(card.status)}</p><dl class="specs">${rows}</dl>
    ${term ? `<p class="small"><strong>Unlisted gear entered on this device</strong><br>${escape(term)}</p>` : ''}
    <p>${escape(card.recommendation)}</p>${parts}${sourceLinks(card.sources)}</article>`
}

function matcherDestination(state, ref) {
  return ref ? paths.match + '?ref=' + ref + matchHash(state) : matchUrl(state)
}

function frame(heading, intro, body, state, ref) {
  return `<div class="wrap match-help"><nav class="crumb" aria-label="Breadcrumb"><a href="${escape(state ? matcherDestination(state, ref) : paths.match)}">Cable finder</a><span aria-hidden="true">/</span>Fit advice</nav>
    <div class="service-heading"><p class="eyebrow">Audio Concierge</p><h1>${heading}</h1><p class="intro">${intro}</p></div>${body}</div>`
}

export function helpShell() {
  return frame(
    'Check <em>this fit.</em>',
    'Opening your saved gear and connections…',
    '',
    null,
  )
}

function examplePicker() {
  return `<fieldset class="photo-picker"><legend>Sample images</legend><div>${samples
    .map(
      ({ file, bit, name, model }) =>
        `<label class="photo"><span><img src="${root}art/${file}" width="320" height="180" loading="lazy" alt="Example illustration of ${model}"></span><span><input type="checkbox" data-sample value="${bit}">${name}</span></label>`,
    )
    .join('')}</div></fieldset>`
}

function requestIntro(state, term) {
  const { lines } = summarize(state)
  const roles = [
    'Headphones',
    'Amp or player',
    'Signal source',
    'Receiving device',
  ]
  const names = lines
    .filter(([label]) => roles.includes(label))
    .map(([, value]) => value)
  if (term) names.push(term)
  if (!names.length)
    return 'Bring the model names printed on your gear so the desk can identify the connection.'
  const money = lines.find(([label]) => label === 'Merchandise')?.[1]
  return (
    'Your request includes <strong>' +
    names.map(escape).join(' and ') +
    '</strong>. ' +
    (money
      ? 'The selected build is ' + escape(money) + ' before tax and shipping.'
      : 'The desk can check the socket or an unconfirmed cable option.')
  )
}

function askView(state, ref, term) {
  const open = isOpen()
  return frame(
    'Check <em>this fit.</em>',
    requestIntro(state, term),
    `
    <div class="service-grid"><section class="buildcard"><div class="desk-indicator"><i class="${open ? 'on' : ''}"></i>${open ? 'Desk open' : 'After hours'} · sample staffing</div>
    <h2>${open ? 'Ask the cable desk.' : 'Leave a fit request.'}</h2><p><strong>${deskHours}</strong><br>These actions run locally as a demonstration.</p>
    ${open ? `<div class="channel"><h3>Call with your gear card</h3><p>Quote <strong class="code">MF-${ref}</strong> to pick up from this selection.</p><button type="button" class="button" data-channel="call">Try a demo call</button></div>` : ''}
    <div class="channel"><h3>Arrange a callback</h3><label class="field" for="fit-slot">Sample time · Eastern Time<select id="fit-slot"><option value="am">Next weekday · 10 am ET</option><option value="pm">Next weekday · 2 pm ET</option></select></label><button type="button" class="${open ? 'outline' : 'button'}" data-channel="callback">Request demo callback</button></div>
    <div class="channel"><h3>Show the sockets</h3><p>Try a photo review with illustrations of example gear. You can select the earcup, the output panel, or both.</p>${examplePicker()}<button type="button" class="outline" data-channel="photos">Share sample photos</button></div>
    <p class="error" data-error role="alert" tabindex="-1" hidden></p><div data-response role="status" tabindex="-1"></div></section>
    <aside>${gearCard(state, ref, term)}<a class="textlink" href="${escape(matcherDestination(state, ref))}">Edit gear and connections →</a></aside></div>`,
    state,
    ref,
  )
}

function linkPanel(url, anchor, heading, copyLabel) {
  return `<div class="success"><h3>${heading}</h3><div class="buttons"><a class="button" href="${escape(url)}">${anchor} →</a><button class="outline" type="button" data-copy>${copyLabel}</button></div>
  <label class="field">Portable link<input data-address readonly type="text" value="${escape(new URL(url, location.origin).href)}"></label><p class="small" data-copy-result role="status"></p></div>`
}

function selectField(id, label, options, placeholder, requireChoice = false) {
  if (!options.length) return ''
  const blank =
    '<option value=""' +
    (requireChoice ? ' disabled' : '') +
    (options.some((o) => o.selected) ? '' : ' selected') +
    '>' +
    placeholder +
    '</option>'
  return `<label class="field" for="${id}">${label}<select data-fit-choice id="${id}">${blank}${options
    .map(
      (o) =>
        `<option value="${escape(o.value)}"${o.selected ? ' selected' : ''}>${escape(o.label)}</option>`,
    )
    .join('')}</select></label>`
}

const roleNames = {
  h: 'Headphones or earphones',
  a: 'Amp or player',
  from: 'Signal source',
  to: 'Receiving equipment',
}
function missingGear(state) {
  const sides = state.mode === 'headphones' ? ['h', 'a'] : ['from', 'to']
  return sides
    .filter((side) => !state[side])
    .map((side) => {
      const options =
        state.mode === 'ports'
          ? Array.from(portEnds[side], ([value, label]) => ({ value, label }))
          : searchGear('', {
              side,
              preferred: preferredPartners(state, side),
            }).map((g) => ({ value: g.id, label: g.name }))
      if (side === 'a')
        options.unshift({
          value: byConnector,
          label: 'Identify by confirmed headphone jack',
        })
      return selectField(
        'fit-model-' + side,
        roleNames[side],
        options,
        state.mode === 'ports'
          ? 'Choose the confirmed port'
          : 'Choose the model on the label',
      )
    })
    .join('')
}

function deskControls(state) {
  if (state.mode !== 'headphones') {
    const systems = systemChoices(state).map((route) => ({
      value: route.id,
      label: route.name + ' · ' + route.from.port + ' → ' + route.to.port,
      selected: route.id === state.system,
    }))
    return selectField(
      'fit-system',
      'Cable and signal path',
      systems,
      'Leave the cable choice open',
    )
  }
  const ports = selectField(
    'fit-output',
    'Headphone output on this device',
    outputChoices(state),
    'Choose the confirmed headphone socket',
    true,
  )
  const cables = state.h && state.a && state.port ? choicesFor(state) : []
  const chosen = cables.find((c) => c.handle === state.cable)
  const models = cables.map((c) => ({
    value: c.handle,
    label: c.name,
    selected: c.handle === state.cable,
  }))
  const prices = (chosen?.offers || []).map((o) => ({
    value: o.id,
    label: [o.length, o.finish, retailMoney(o.usd)].filter(Boolean).join(' · '),
    selected: o.id === state.offer,
  }))
  return (
    ports +
    selectField(
      'fit-cable',
      'Dragon cable for these plugs',
      models,
      'Leave the cable choice open',
    ) +
    selectField(
      'fit-offer',
      'Length, plug and merchandise price',
      prices,
      'Return the fit without a price',
    ) +
    (selectedOffer(state)?.rushUsd
      ? selectField(
          'fit-rush',
          'Workshop processing',
          [
            {
              value: '1',
              label:
                'Rush workshop processing (+' +
                retailMoney(selectedOffer(state).rushUsd) +
                ')',
              selected: state.rush === '1',
            },
          ],
          'Standard processing',
        )
      : '')
  )
}

function returnActions(state) {
  const canHold =
    state.mode === 'headphones' &&
    state.a &&
    !state.port &&
    outputChoices(state).length
  return `<div class="buttons"><button class="button" type="button" data-return>${state.offer ? 'Prepare priced return link' : 'Prepare return link'}</button>
    ${canHold ? '<button class="linkbutton" type="button" data-return data-unresolved>Return with the jack still unknown</button>' : ''}</div>`
}

function applyDeskChoice(state, id, value) {
  let next
  if (id.startsWith('fit-model-'))
    next = chooseGear(state, id.slice('fit-model-'.length), value)
  else if (id === 'fit-output') next = selectOutput(state, value)
  else if (id === 'fit-rush') next = { ...state, rush: value }
  else if (id === 'fit-system') next = { ...state, system: value }
  else if (id === 'fit-cable')
    next = { ...state, cable: value, offer: '', rush: '' }
  else if (id === 'fit-offer') next = { ...state, offer: value, rush: '' }
  else return null
  return readSelection(matchHash(next))
}

function deskView(state, extra, term) {
  const images = samples.filter((x) => x.bit & extra.sampleMask)
  return frame(
    'Review the <em>connection.</em>',
    'Sample advisor workspace. Check the model names and the jack on the customer’s gear before preparing their return link.',
    `
    <div class="service-grid"><section class="buildcard"><p class="eyebrow">${escape(channels[extra.via])}${extra.slot ? ' · ' + (extra.slot === 'am' ? '10 am' : '2 pm') + ' ET' : ''}</p>
    <h2>Check the connection.</h2>
    <div data-controls>${missingGear(state) + deskControls(state)}</div>
    <p>Use the sources on the gear card to review the connection. If a fit or price needs confirmation, the returned card will carry that status.</p>
    ${images.length ? `<div class="channel"><h3>Attached examples</h3><div class="thumbs">${images.map(({ file, name, model }) => `<figure><img src="${root}art/${file}" width="320" height="180" loading="lazy" alt="Illustration of ${model}"><figcaption>${name} · example</figcaption></figure>`).join('')}</div></div>` : ''}
    <div class="channel" data-return-actions>${returnActions(state)}</div><p class="error" data-error role="alert" tabindex="-1" hidden></p><div data-response role="status" tabindex="-1"></div></section>
    <aside><div data-card>${gearCard(state, extra.ref, term)}</div><a data-edit class="textlink" href="${escape(matcherDestination(state, extra.ref))}">Open this selection in the finder →</a></aside></div>`,
    state,
    extra.ref,
  )
}

function returnedView(state, ref) {
  return frame(
    'Your returned <em>fit card.</em>',
    'The sample cable desk returned these connections. Open the selection to change your gear or configure an available build.',
    `
    <section class="quote-page">${gearCard(state, ref, '')}<div class="buttons"><a class="button" href="${escape(matcherDestination(state, ref))}">Open this selection in the finder →</a><a class="textlink" href="${escape(helpPath() + '?ref=' + ref + matchHash(state))}">Ask a follow-up</a></div></section>`,
    state,
    ref,
  )
}

function invalidView() {
  return frame(
    'This gear link <em>needs a fresh copy.</em>',
    'Part of the fit request is missing or belongs to an older catalog. Ask for the original link or choose the gear again.',
    `<p class="single"><a class="button" href="${paths.match}">Open the cable finder →</a></p>`,
    null,
  )
}

export function mountHelp(main) {
  let state, extra, ref, term
  function keepHelpWithGear() {
    if (!state) return
    document.querySelectorAll('[data-help]').forEach((link) => {
      link.href = helpPath() + '?ref=' + ref + matchHash(state)
    })
  }
  function render() {
    extra = getExtra(location.search)
    state =
      location.hash || extra?.view === 'ask'
        ? readSelection(location.hash)
        : null
    if (!state || !extra) main.innerHTML = invalidView()
    else {
      term = localTerm(state, extra)
      if (extra.ref) ref = extra.ref
      else {
        const last = jsonSession(localRequestKey)
        ref =
          last?.hash === matchHash(state) && /^[0-9A-F]{8}$/.test(last.ref)
            ? last.ref
            : newId()
      }
      if (extra.view === 'ask') main.innerHTML = askView(state, ref, term)
      else if (extra.view === 'desk')
        main.innerHTML = deskView(state, extra, term)
      else main.innerHTML = returnedView(state, ref)
    }
    keepHelpWithGear()
    main.dataset.ready = 'true'
    main.removeAttribute('inert')
    delete document.documentElement.dataset.restoring
  }
  function error(message) {
    const alert = main.querySelector('[data-error]')
    alert.hidden = false
    alert.textContent = message
    alert.focus()
  }
  function feedback(html) {
    main.querySelector('[data-error]').hidden = true
    const result = main.querySelector('[data-response]')
    result.innerHTML = html
    result.focus()
  }
  main.addEventListener('change', (event) => {
    if (extra?.view !== 'desk' || !event.target.matches('[data-fit-choice]'))
      return
    const id = event.target.id
    const value = event.target.value
    main.querySelector('[data-response]').replaceChildren()
    main.querySelector('[data-error]').hidden = true
    try {
      const next = applyDeskChoice(state, id, value)
      if (!next) throw Error('Invalid fit')
      state = next
    } catch {
      return error(
        'This option needs another fit check. Choose one of the documented connections.',
      )
    }
    saveSession(
      localRequestKey,
      JSON.stringify({ hash: matchHash(state), ref, term }),
    )
    history.replaceState(null, '', handoffUrl(extra, state))
    main.querySelector('[data-card]').innerHTML = gearCard(state, ref, term)
    main.querySelector('[data-controls]').innerHTML =
      missingGear(state) + deskControls(state)
    main.querySelector('[data-return-actions]').innerHTML = returnActions(state)
    const nextControl =
      main.querySelector('#' + id) ||
      main.querySelector('[data-fit-choice], [data-return]')
    nextControl?.focus({ preventScroll: true })
    main.querySelector('[data-edit]').href = matcherDestination(state, ref)
    main.querySelector('.crumb a').href = matcherDestination(state, ref)
    keepHelpWithGear()
  })
  main.addEventListener('click', async (event) => {
    const button = event.target.closest('button')
    if (!button || !extra || !state) return
    if (button.hasAttribute('data-copy')) {
      const address = main.querySelector('[data-address]')
      const result = main.querySelector('[data-copy-result]')
      try {
        await navigator.clipboard.writeText(address.value)
        result.textContent = 'Link copied.'
      } catch {
        address.focus()
        address.select()
        result.textContent = 'Select Copy to share this link.'
      }
    } else if (extra.view === 'ask' && button.dataset.channel) {
      const via = button.dataset.channel
      if (via === 'call' && !isOpen()) return render()
      const sampleMask = [
        ...main.querySelectorAll('[data-sample]:checked'),
      ].reduce((mask, input) => mask | Number(input.value), 0)
      if (via === 'photos' && !sampleMask)
        return error('Choose an example image to include in the photo review.')
      const slot =
        via === 'callback' ? main.querySelector('#fit-slot').value : null
      const request = { view: 'desk', via, slot, sampleMask, ref }
      saveSession(
        localRequestKey,
        JSON.stringify({ hash: matchHash(state), ref, term }),
      )
      const heading =
        via === 'callback'
          ? 'Sample callback saved · ' +
            (slot === 'am' ? '10 am' : '2 pm') +
            ' ET'
          : via === 'photos'
            ? 'Example photo review ready'
            : 'Demo call ready'
      feedback(
        linkPanel(
          handoffUrl(request, state),
          'Open local advisor view',
          heading,
          'Copy advisor link',
        ) +
          (term
            ? '<p class="small">An unlisted model name stays on this device. Share the name printed on your gear when using another device.</p>'
            : ''),
      )
    } else if (extra.view === 'desk' && button.hasAttribute('data-return')) {
      const choice = main.querySelector('#fit-output')
      if (choice && !choice.value && !button.hasAttribute('data-unresolved'))
        return error(
          'Select the headphone socket you confirmed before returning the fit card.',
        )
      const href = handoffUrl({ view: 'return', ref }, state)
      feedback(
        linkPanel(
          href,
          'Open returned fit card',
          'Fit card ready',
          'Copy return link',
        ),
      )
    }
  })
  window.addEventListener('hashchange', render)
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) render()
  })
  window.addEventListener('storage', (e) => {
    if (e.key === keys.desk && extra?.view === 'ask') render()
  })
  render()
}
