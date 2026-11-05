// A match is a join of exact device records, output function and a documented
// cable option. Search strings and URL-provided prices never enter this join.
import {
  gear,
  connections,
  portConnections,
  portEnds,
  accepts,
} from './directory.mjs'
import { listenerCableSpecs } from './listeners.mjs'
import { offersFor, offerById, fitLinksFor } from './offers.mjs'
import { cautions } from './cautions.mjs'
import { paths, validId } from '../catalog.mjs'

export const plugNames = {
  3.5: '3.5 mm stereo headphone jack',
  6.35: '6.35 mm (¼ in) stereo headphone jack',
  2.5: '2.5 mm balanced headphone jack',
  4.4: '4.4 mm balanced headphone jack',
  xlr4: '4-pin XLR balanced headphone output',
}
export const byConnector = 'by-connector'
export const retailMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)
const fields = [
  'mode',
  'h',
  'a',
  'port',
  'cable',
  'offer',
  'rush',
  'from',
  'to',
  'system',
]
const selectionKeys = [...fields, 'rev']
export const emptySelection = (mode = 'headphones') => ({
  mode,
  h: '',
  a: '',
  port: '',
  cable: '',
  offer: '',
  rush: '',
  from: '',
  to: '',
  system: '',
})
export function caution(g) {
  return g?.item && Object.hasOwn(cautions, g.item.handle)
    ? cautions[g.item.handle]
    : null
}
export function outputChoices(s) {
  const amp = gear.get(s.a)
  if (caution(amp)?.blockAmp) return []
  const options =
    s.a === byConnector
      ? Object.entries(plugNames).map(([plug, label]) => ({ plug, label }))
      : (amp?.player?.outputs ?? [])
  return options.map((o) => ({
    value: o.plug,
    label: o.label,
    selected: s.port === o.plug,
  }))
}
export function selectOutput(s, value) {
  if (value === s.port) return s
  if (value && !outputChoices(s).some((o) => o.value === value))
    throw Error('Unlisted output')
  return { ...s, port: value, cable: '', offer: '', rush: '' }
}
export function chooseGear(s, side, id) {
  if (!['h', 'a', 'from', 'to'].includes(side))
    throw Error('Unknown equipment role')
  if (s.mode === 'ports' && (side === 'from' || side === 'to')) {
    if (id && !portEnds[side].has(id)) throw Error('Unknown signal port')
    return { ...s, [side]: id, system: '' }
  }
  if (
    id &&
    !(side === 'a' && id === byConnector) &&
    !accepts(gear.get(id), side)
  )
    throw Error('Unknown equipment')
  if (side === 'from' || side === 'to') {
    const next = s.mode === 'system' ? s : emptySelection('system')
    return { ...next, [side]: id, system: '' }
  }
  const next = s.mode === 'headphones' ? s : emptySelection()
  const selected = { ...next, [side]: id, cable: '', offer: '', rush: '' }
  if (side === 'a') {
    const ports = outputChoices(selected)
    selected.port = ports.length === 1 ? ports[0].value : ''
  }
  return selected
}
export function choicesFor(s) {
  const g = gear.get(s.h),
    l = g?.listener
  if (
    !l?.fit ||
    l.mode ||
    caution(g)?.blockHeadphone ||
    (s.port && l.plugs && !l.plugs.includes(s.port))
  )
    return []
  return l.cables.flatMap((handle) => {
    const spec =
      Object.hasOwn(listenerCableSpecs, handle) && listenerCableSpecs[handle]
    if (!spec) return []
    const offers = s.port ? offersFor(l.id, handle, s.port) : []
    // A cable page can list a plug for a different earcup option. Require
    // an actual offer joined to this model, fitting, and port to complete a match.
    if (s.port && !offers.length) return []
    const links = fitLinksFor(l.id, handle, s.port || undefined)
    return [
      {
        handle,
        ...spec,
        offers,
        url: links[0]?.url ?? spec.source,
        fitLink: links[0],
        earOption: l.earOptions?.[handle],
      },
    ]
  })
}
export function systemChoices(s) {
  if (!s.from || !s.to || s.from === s.to) return []
  return [
    ...(s.mode === 'ports' ? portConnections : connections).values(),
  ].filter((row) => row.fromId === s.from && row.toId === s.to)
}
export function preferredPartners(s, side) {
  const isSender = side === 'from'
  if (!['from', 'to'].includes(side) || !(isSender ? s.to : s.from))
    return undefined
  const result = new Set()
  for (const row of connections.values()) {
    if (isSender && row.toId === s.to) result.add(row.fromId)
    if (!isSender && row.fromId === s.from) result.add(row.toId)
  }
  return result
}
export function selectedOffer(s) {
  if (!s.offer || !s.port || !s.a || !s.h || !s.cable) return null
  const o = offerById(s.offer)
  if (
    !o ||
    o.listener !== s.h ||
    o.handle !== s.cable ||
    o.plug !== s.port ||
    !Number.isFinite(o.usd) ||
    o.usd <= 0
  )
    return null
  if (!s.rush) return o
  if (s.rush !== '1' || !Number.isFinite(o.rushUsd) || o.rushUsd <= 0)
    return null
  return {
    ...o,
    usd: Math.round((o.usd + o.rushUsd) * 100) / 100,
    parts: [...o.parts, { label: 'Optional workshop rush', usd: o.rushUsd }],
    selections: [
      ...o.selections,
      {
        label: 'Workshop processing',
        value: 'Select rush processing (+' + retailMoney(o.rushUsd) + ')',
      },
    ],
  }
}
function priceRevision(o) {
  // Covers native variant, exact add-on option identity, and merchandise total.
  // Changing any of them retires an old offer link instead of repricing it silently.
  return 'p1-' + Math.round(o.usd * 100) + '-' + o.variant
}
export function matchHash(s) {
  const p = new URLSearchParams()
  for (const key of fields) {
    if (!s[key] || (key === 'mode' && s.mode === 'headphones')) continue
    p.set(key, s[key])
  }
  if (s.offer) {
    const o = selectedOffer(s)
    if (!o) throw Error('Unknown priced configuration')
    p.set('rev', priceRevision(o))
  }
  return '#m1' + (p.size ? '?' + p : '')
}
export const matchUrl = (s) => paths.match + matchHash(s)
export function readSelection(hash = '') {
  if (!hash || hash === '#m1') return emptySelection()
  if (!hash.startsWith('#m1?') || hash.length > 2400) return null
  const p = new URLSearchParams(hash.slice(4))
  for (const [key, value] of p) {
    if (
      !selectionKeys.includes(key) ||
      p.getAll(key).length !== 1 ||
      !value ||
      value.length > 500
    )
      return null
  }
  const s = emptySelection(p.get('mode') ?? 'headphones')
  if (!['headphones', 'system', 'ports'].includes(s.mode)) return null
  for (const f of fields.slice(1)) s[f] = p.get(f) || ''
  if (s.mode !== 'headphones') {
    if (s.h || s.a || s.port || s.cable || s.offer || s.rush || p.has('rev'))
      return null
    if (
      (s.from && !(s.mode === 'ports' ? portEnds.from : gear).has(s.from)) ||
      (s.to && !(s.mode === 'ports' ? portEnds.to : gear).has(s.to))
    )
      return null
    if (s.system && !systemChoices(s).some((x) => x.id === s.system))
      return null
  } else {
    if (s.from || s.to || s.system) return null
    if (
      (s.h && !accepts(gear.get(s.h), 'h')) ||
      (s.a && s.a !== byConnector && !accepts(gear.get(s.a), 'a'))
    )
      return null
    if (s.port && !outputChoices(s).some((x) => x.value === s.port)) return null
    if (s.cable && !choicesFor(s).some((x) => x.handle === s.cable)) return null
    if (s.offer || s.rush || p.has('rev')) {
      const o = selectedOffer(s)
      if (!o || p.get('rev') !== priceRevision(o)) return null
    }
  }
  return s
}
const sourceLink = (label, url) => (url ? [{ label, url }] : [])
function deviceEvidence(g, role) {
  if (!g) return []
  return [
    ...sourceLink(role + ' listing', g.listing),
    ...sourceLink(role + ' connection', g.listener?.source ?? g.player?.source),
    ...sourceLink('Cable fitting reference', g.listener?.fitSource),
    ...sourceLink(role + ' requirements', caution(g)?.source),
  ]
}
const distinctSources = (links) =>
  links.filter(
    (link, i, a) => a.findIndex((other) => other.url === link.url) === i,
  )
export function summarize(s) {
  const lines = [],
    sources = []
  let title, status, recommendation
  if (s.mode !== 'headphones') {
    const byPort = s.mode === 'ports'
    const end = (side) =>
      byPort
        ? s[side]
          ? { id: s[side], name: portEnds[side].get(s[side]) }
          : null
        : gear.get(s[side])
    const from = end('from'),
      to = end('to'),
      route = (byPort ? portConnections : connections).get(s.system)
    if (from) lines.push(['Signal source', from.name])
    if (to) lines.push(['Receiving device', to.name])
    sources.push(
      ...deviceEvidence(from, 'Source'),
      ...deviceEvidence(to, 'Receiving device'),
    )
    if (route) {
      title = route.name
      status = 'Documented connection'
      recommendation = route.note
      lines.push(
        ['Output', route.from.port],
        ['Input', route.to.port],
        ['Cable', route.name],
      )
      sources.push(
        ...sourceLink('Dragon cable and options', route.url),
        ...route.sources.map((url, i) => ({
          url,
          label: 'Connection reference ' + (i + 1),
        })),
      )
    } else if (from && to && !systemChoices(s).length) {
      title = 'This connection needs a fit check.'
      status = 'Connection to verify'
      recommendation =
        from.id === to.id
          ? 'Choose two different pieces of equipment.'
          : 'There is no documented Dragon route for these devices in this direction. Check the output, input and signal format with the cable desk.'
    } else {
      title =
        from && to
          ? 'Choose a documented connection.'
          : 'Which components are you connecting?'
      status = from && to ? 'Connections available' : 'Choose equipment'
      recommendation =
        'Follow the signal from the output of one component to an input on the other.'
    }
  } else {
    const hi = gear.get(s.h),
      amp = gear.get(s.a),
      l = hi?.listener,
      p = amp?.player
    const manual = s.a === byConnector
    const j = outputChoices(s).find((x) => x.value === s.port)
    const cable = s.cable
      ? choicesFor(s).find((x) => x.handle === s.cable)
      : null
    const o = selectedOffer(s)
    const included = j && l?.included?.[s.port]
    if (hi) lines.push(['Headphones', hi.name])
    if (l?.fit) lines.push(['Headphone end', l.fit])
    if (amp || manual)
      lines.push([
        'Amp or player',
        amp?.name ?? 'Specified by its headphone jack',
      ])
    if (j) lines.push(['Output', j.label])
    sources.push(
      ...deviceEvidence(hi, 'Headphones'),
      ...deviceEvidence(amp, 'Amp or player'),
    )
    if (included) lines.push(['Included cable', included])
    if (cable) {
      lines.push(['Dragon cable', cable.name])
      sources.push(...sourceLink('Cable options', cable.url))
    }
    if (o) {
      lines.push(
        ['Length', o.length],
        ['Plug finish / style', o.finish],
        ['Processing', s.rush ? 'Workshop rush' : 'Standard'],
        ['Merchandise', retailMoney(o.usd)],
      )
      if (o.policy) lines.push(['Return terms', o.policy])
      sources.push(
        ...sourceLink('Selected retail variant', o.url),
        ...sourceLink('Pricing reference', o.source),
      )
    }
    if (
      hi &&
      (!l?.fit || l.mode || !l.cables.length || caution(hi)?.blockHeadphone)
    ) {
      title = included
        ? 'Your supplied cable fits.'
        : l?.revisions
          ? 'Which earcup socket do you have?'
          : 'Check the headphone connection.'
      status = included
        ? 'Included connection available'
        : 'Headphone fit to verify'
      recommendation =
        caution(hi)?.note ||
        l?.note ||
        'This model is listed, but an exact Dragon fitting has yet to be confirmed.'
    } else if (amp && (!p?.outputs.length || caution(amp)?.blockAmp)) {
      title = 'Check the amplifier output.'
      status = 'Output to verify'
      recommendation =
        caution(amp)?.note ||
        p?.note ||
        'Confirm a headphone output on this exact model. A line output can have the same shape.'
    } else if (!hi || !s.a || !j) {
      title =
        !hi && !s.a
          ? 'Choose the two names on your gear.'
          : !hi
            ? 'Which headphones will you use?'
            : !s.a
              ? 'What will you plug these into?'
              : 'Choose the headphone output.'
      status = l?.fit ? 'Headphone end identified' : 'Waiting for equipment'
      recommendation =
        !s.a || !hi
          ? 'The two model names determine which plugs to build onto the cable.'
          : 'Use the socket marked for headphones. Pick the one you intend to use.'
    } else if (!choicesFor(s).length) {
      title = 'This combination needs a fit check.'
      status = 'No documented Dragon combination'
      recommendation =
        'There is no checked build with these two ends in the price catalog. Try another documented headphone output or request a fit check.'
    } else {
      title = o
        ? cable.name
        : cable
          ? cable.name
          : 'Both ends have a documented fit.'
      status = o ? 'Priced cable fit' : 'Documented cable fit'
      recommendation = o
        ? 'The selected headphone end, amp plug and length are included in the displayed merchandise price.'
        : 'Choose a Dragon cable offered with both connections. This checks the cable wiring and plugs. Amplifier power is a separate specification.'
    }
  }
  return {
    title,
    status,
    recommendation,
    lines,
    sources: distinctSources(sources),
  }
}
export function matchLineDetails(line) {
  if (
    line?.kind !== 'match' ||
    !validId(line.id) ||
    typeof line.hash !== 'string'
  )
    return null
  const state = readSelection(line.hash)
  if (!state) return null
  const o = selectedOffer(state)
  if (!o) return null
  return {
    ...summarize(state),
    price: o.usd,
    edit: paths.match + '?edit=' + line.id + matchHash(state),
    variant: o.variant,
    parts: o.parts,
    kind: o.kind,
  }
}
