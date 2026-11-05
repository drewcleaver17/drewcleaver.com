import {
  keys,
  readBag,
  updateBag,
  getLocal,
  getSession,
  saveSession,
  header as updateHeader,
} from './state.mjs'

import {
  paths,
  blank,
  newId,
  validId,
  validLine,
  complete,
  pack,
  unpack,
  money,
  linePrice,
  cableUrl,
} from './catalog.mjs'
import { builderHero, builderPanel, cablePage, roomGuide } from './shop.mjs'
import {
  invalidLink,
  buildCode,
  fitView,
  advisorView,
  quoteResult,
  quoteView,
  presenter,
  cartView,
} from './service.mjs'

const page = document.querySelector('main')
const route = page.dataset.route
const $ = (id) => document.getElementById(id)
const params = new URLSearchParams(location.search)
const labels = {
  call: 'Demo call',
  photos: 'Sample photo review',
  callback: 'Sample callback',
}
let b,
  sku,
  orderId,
  cup = 'open',
  port = 'usb',
  busy = false,
  receipt = ''
function readRequest() {
  try {
    const r = JSON.parse(getLocal(keys.request)),
      build = unpack(r.hash, 'request')
    return build &&
      Object.hasOwn(labels, r.channel) &&
      ['am', 'pm'].includes(r.slot)
      ? {
          b: build,
          label:
            labels[r.channel] +
            (r.channel === 'callback'
              ? ' · ' + (r.slot === 'am' ? '10 am ET' : '2 pm ET')
              : ''),
        }
      : null
  } catch {
    return null
  }
}
const deskOpen = () => getLocal(keys.desk) !== 'closed'
const defaultBuild = (family = 'blue') => blank(family, newId())
function error(id, msg) {
  let el = $(id)
  if (!el) {
    el = document.createElement('p')
    el.id = id
    el.className = 'error'
    el.setAttribute('role', 'alert')
    page.prepend(el)
  }
  el.hidden = false
  el.textContent = msg
  el.setAttribute('tabindex', '-1')
  el.focus()
}
function paint(html) {
  page.innerHTML = html
}
function focusId(id) {
  if (id) $(id)?.focus({ preventScroll: true })
}
function header() {
  updateHeader(b)
}
function remember() {
  const hash = pack(b)
  saveSession(keys.draft, hash)
  history.replaceState(null, '', location.pathname + location.search + hash)
  header()
}
function setMethod(mode) {
  const expert = mode === 'expert'
  if (expert === b.expert) return
  if (expert) {
    b =
      b.amp === 'zen'
        ? { ...b, expert: true }
        : { ...b, expert: true, amp: 'direct', jack: '' }
  } else
    b =
      b.amp === 'zen'
        ? { ...b, expert: false }
        : { ...b, expert: false, amp: '', jack: '' }
}
function paintBuilder(focus) {
  if (!$('builder-hero')) page.innerHTML = cablePage(b)
  $('builder-hero').innerHTML = builderHero(b)
  $('build-panel').innerHTML = builderPanel(b)
  if (readBag()?.some((l) => l.id === b.id))
    $('add-cable').textContent = 'Save changes to bag'
  remember()
  focusId(focus)
}
function seedBuild(family) {
  b = defaultBuild(family)
  if (params.get('fit') === 'utopia') b.hp = 'utopia'
  if (params.get('length') === '15') b.feet = '15'
  if (location.hash && location.hash !== '#configuration') {
    b = unpack(location.hash, 'build')
    if (!b || b.family !== family) {
      b = null
      paint(invalidLink())
      return
    }
  }
  if (new URLSearchParams(location.search).get('mode') === 'expert')
    setMethod('expert')
  // One-time entry parameters must not undo changes after refresh.
  if (location.search)
    history.replaceState(null, '', location.pathname + pack(b))
  paintBuilder()
}
async function putLine(line, target, errorId) {
  if (busy) return
  busy = true
  try {
    await updateBag((lines) => [...lines.filter((l) => l.id !== line.id), line])
    location.assign(target)
  } catch {
    busy = false
    error(
      errorId,
      'This browser could not save the bag. Check browser storage or clear an invalid bag before continuing.',
    )
  }
}
function hardwareSelection(restore = false) {
  const selected =
    document.querySelector('input[name="attachment"]:checked')?.value ||
    'included'
  $('hardware-total').textContent = money(
    linePrice({ kind: 'hardware', id: orderId, sku, option: selected }),
  )
  $('attachment-confirm').innerHTML =
    selected === 'silver'
      ? '<label class="check"><input id="confirm-silver" type="checkbox" ' +
        (restore ? 'checked' : '') +
        '><span>I have a 4.4 mm balanced headphone output.<small>On an iFi ZEN DAC 3, use the front headphone jack.</small></span></label>'
      : ''
  $('product-error').hidden = true
}
function hardwarePage() {
  sku = route.split('/')[1]
  const edit = params.get('edit'),
    carry = params.get('item')
  if (edit) {
    const l = readBag()?.find(
      (x) => x.id === edit && x.kind === 'hardware' && x.sku === sku,
    )
    if (!l) {
      paint(invalidLink())
      return
    }
    orderId = edit
    const choice = document.querySelector(
      'input[name="attachment"][value="' + l.option + '"]',
    )
    if (choice) choice.checked = true
    $('add-hardware').textContent = 'Save changes to bag'
    hardwareSelection(l.option === 'silver')
  } else {
    orderId = validId(carry) ? carry : newId()
    history.replaceState(null, '', location.pathname + '?item=' + orderId)
    hardwareSelection()
  }
}
let bagPaint = 0
async function init() {
  if (route.startsWith('cables/')) seedBuild(route.split('/')[1])
  else if (route.startsWith('products/')) hardwarePage()
  else if (route === 'fit') {
    b = location.hash
      ? unpack(location.hash, 'build')
      : unpack(getSession(keys.draft) || '', 'build') || defaultBuild()
    if (!b) paint(invalidLink())
    else {
      paint(fitView(b, deskOpen()))
      remember()
    }
  } else if (route === 'advisor') {
    const saved = readRequest(),
      req = location.hash ? unpack(location.hash, 'request') : saved?.b
    if (location.hash && !req) paint(invalidLink())
    else {
      b = req
      paint(advisorView(b, saved?.b?.id === b?.id ? saved?.label : ''))
    }
  } else if (route === 'quote') {
    b = unpack(location.hash, 'quote')
    paint(quoteView(b))
    if (b) saveSession(keys.draft, pack(b))
  } else if (route === 'presenter')
    paint(presenter(deskOpen(), readRequest()?.b))
  else if (['cart', 'review'].includes(route)) {
    const l = readBag()
    const paintId = ++bagPaint
    const matches = new Map()
    let invalid = !l
    if (l?.some((x) => x.kind === 'match')) {
      // Older bags and ordinary build pages do not need to download the model database.
      try {
        const { matchLineDetails } = await import('./matcher/engine.mjs')
        for (const line of l.filter((x) => x.kind === 'match')) {
          const details = matchLineDetails(line)
          if (!details) invalid = true
          else matches.set(line.id, details)
        }
      } catch {
        if (paintId === bagPaint) {
          paint(
            '<section class="wrap single"><h1>Reconnect to open your bag.</h1><p>The fit catalog could not load. Refresh to check your selections and their prices.</p></section>',
          )
          page.inert = false
          delete document.documentElement.dataset.restoring
        }
        return
      }
    }
    if (paintId !== bagPaint) return
    paint(cartView(l || [], route === 'review', invalid, matches))
  } else if (route === 'guides/home') {
    cup = params.get('room') === 'closed' ? 'closed' : 'open'
    port = ['usb', 'jack', 'owned'].includes(params.get('port'))
      ? params.get('port')
      : 'usb'
    paint(roomGuide(cup, port))
  }
  header()
  page.dataset.ready = 'true'
  page.removeAttribute('inert')
  delete document.documentElement.dataset.restoring
}
function roomPaint(focus) {
  history.replaceState(
    null,
    '',
    location.pathname + '?room=' + cup + '&port=' + port,
  )
  paint(roomGuide(cup, port))
  focusId(focus)
}
page.addEventListener('change', (e) => {
  const el = e.target
  if (el.name === 'attachment') {
    hardwareSelection()
    return
  }
  if (el.dataset.photo) {
    const bit = Number(el.dataset.photo)
    b = { ...b, photos: el.checked ? b.photos | bit : b.photos & ~bit }
    remember()
    $('receipt').innerHTML = ''
    receipt = ''
    return
  }
  if (el.id === 'port') {
    port = el.value
    roomPaint(el.id)
    return
  }
  if (!el.dataset.field || !b || !route.startsWith('cables/')) return
  if (el.id === 'amp') b = { ...b, amp: el.value, jack: '' }
  else b = { ...b, [el.id]: el.id === 'rush' ? el.checked : el.value }
  paintBuilder(el.id)
})
page.addEventListener('click', async (e) => {
  const el = e.target.closest('button,a')
  if (!el) return
  if (el.dataset.jump) {
    e.preventDefault()
    const destination =
      el.dataset.jump === 'builder' ? $('configuration') : $('purchase')
    destination?.focus()
    destination?.scrollIntoView({ block: 'start' })
    return
  }
  if (el.dataset.mode) {
    setMethod(el.dataset.mode)
    paintBuilder(el.id)
    return
  }
  if (el.dataset.family && b) {
    e.preventDefault()
    const next = { ...b, family: el.dataset.family, feet: '15' }
    location.assign(cableUrl(next.family) + pack(next))
    return
  }
  if (el.id === 'add-cable') {
    if (!complete(b)) {
      error(
        'build-error',
        'Confirm your Utopia earcup plugs and a balanced headphone output, or ask the cable desk to check this build.',
      )
      return
    }
    await putLine(
      { kind: 'cable', id: b.id, build: b },
      paths.cart,
      'build-error',
    )
  } else if (el.id === 'add-hardware' || el.id === 'buy-hardware') {
    const opt =
      document.querySelector('input[name="attachment"]:checked')?.value ||
      'included'
    if (opt === 'silver' && !$('confirm-silver')?.checked) {
      error(
        'product-error',
        'Confirm your amp has a 4.4 mm balanced headphone output before adding Silver.',
      )
      return
    }
    await putLine(
      { kind: 'hardware', id: orderId, sku, option: opt },
      el.id === 'buy-hardware' ? paths.review : paths.cart,
      'product-error',
    )
  } else if (el.dataset.room) {
    cup = el.dataset.room
    roomPaint(el.id)
  } else if (el.dataset.contact) {
    const channel = el.dataset.contact
    if (channel === 'photos' && !b.photos) {
      error('fit-error', 'Choose at least one example photo for the advisor.')
      return
    }
    if (channel === 'call' && !deskOpen()) {
      paint(fitView(b, false))
      return
    }
    const slot = $('slot').selectedIndex === 1 ? 'pm' : 'am'
    try {
      localStorage.setItem(
        keys.request,
        JSON.stringify({ hash: pack(b, 'request'), channel, slot }),
      )
    } catch {
      error(
        'fit-error',
        'The local desk could not save this request. Allow browser storage and try again.',
      )
      return
    }
    $('fit-error').hidden = true
    const action =
      channel === 'callback'
        ? 'Sample callback saved for ' +
          (slot === 'am' ? '10 am ET' : '2 pm ET')
        : channel === 'photos'
          ? 'Example photos added to your local fit request'
          : 'Sample call opened with your build card'
    receipt =
      '<div class="success"><b>' +
      action +
      '.</b><p>Your advisor can use ' +
      buildCode(b) +
      ' with your current choices.</p></div>'
    $('receipt').innerHTML = receipt
    $('receipt').focus()
  } else if (el.dataset.roster) {
    try {
      localStorage.setItem(
        keys.desk,
        el.dataset.roster === 'open' ? 'open' : 'closed',
      )
    } catch {
      error('desk-error', 'This browser could not save the sample roster.')
      return
    }
    paint(presenter(deskOpen(), readRequest()?.b))
    page
      .querySelector('[data-roster="' + el.dataset.roster + '"]')
      ?.focus({ preventScroll: true })
  } else if (el.id === 'issue') {
    const hp = $('confirm-hp').value,
      jack = $('confirm-jack').value
    if (!hp || !jack) {
      error(
        'advisor-error',
        'Confirm the earcup fit and actual headphone output before creating the quote.',
      )
      return
    }
    const q = {
      ...b,
      hp,
      amp: jack === 'front44' ? 'zen' : 'direct',
      jack,
      expert: jack === 'direct44',
    }
    if (!complete(q)) {
      error('advisor-error', 'This combination needs another fit check.')
      return
    }
    $('advisor-error').hidden = true
    $('quote-result').innerHTML = quoteResult(q)
    $('quote-address').value = new URL(
      paths.quote + pack(q, 'quote'),
      location.origin,
    ).href
    $('quote-result').focus()
  } else if (el.id === 'copy-quote') {
    const box = $('quote-address')
    try {
      await navigator.clipboard.writeText(box.value)
      el.textContent = 'Link copied ✓'
    } catch {
      box.focus()
      box.select()
      el.textContent = 'Select and copy the link below'
    }
  } else if (el.id === 'accept-quote' && b) {
    await putLine(
      { kind: 'cable', id: b.id, build: b },
      paths.cart,
      'quote-error',
    )
  } else if (el.dataset.remove) {
    try {
      await updateBag((lines) =>
        lines.filter((l) => l.id !== el.dataset.remove),
      )
      init()
      page.querySelector('[data-remove],.button')?.focus()
    } catch {
      error('bag-error', 'The bag could not be updated.')
    }
  } else if (el.id === 'clear-bag') {
    try {
      localStorage.removeItem(keys.bag)
      init()
    } catch {
      error('bag-error', 'This browser could not clear the saved bag.')
    }
  }
})
window.addEventListener('storage', (e) => {
  if (e.key === keys.desk && route === 'fit' && b) {
    paint(fitView(b, deskOpen(), receipt))
    header()
  } else if (
    (route === 'presenter' && [keys.request, keys.desk].includes(e.key)) ||
    (['cart', 'review'].includes(route) && e.key === keys.bag)
  )
    init()
  else header()
})
window.addEventListener('pageshow', (e) => {
  busy = false
  if (e.persisted) {
    if (route === 'presenter' || ['cart', 'review', 'fit'].includes(route))
      init()
    else header()
  }
})
window.addEventListener('hashchange', () => {
  if (
    route === 'quote' ||
    route === 'advisor' ||
    route === 'fit' ||
    route.startsWith('cables/')
  )
    init()
})
init()
