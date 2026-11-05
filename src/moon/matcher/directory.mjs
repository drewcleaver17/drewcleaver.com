// Catalog membership comes from the retail listing. Fit comes from a separate
// model/revision record, never from search similarity or a connector diameter.
import { inventory } from './inventory.mjs'
import { listeners } from './listeners.mjs'
import { players } from './players.mjs'
import { systemMatches, systemPortMatches } from './systems.mjs'

export const categoryNames = {
  headphones: 'Headphones',
  earphones: 'Earphones & IEMs',
  amplifiers: 'Amplifiers',
  players: 'Music players',
  sources: 'DACs & sources',
  speakers: 'Speakers',
  other: 'Other equipment',
}
export function normalized(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/\ba\s*&\s*k\b/g, 'astell and kern')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
const slug = (name) => normalized(name).replaceAll(' ', '-')
const retail = new Map(inventory.map((item) => [item.url, item]))
const byListing = new Map()
const byName = new Map()
export const gear = new Map()

function displayName(brand, model) {
  return normalized(model).startsWith(normalized(brand) + ' ')
    ? model
    : brand + ' ' + model
}
function addGear(id, name, brand, listing, category, aliases = []) {
  if (gear.has(id)) throw Error('Repeated equipment ID: ' + id)
  const item = retail.get(listing)
  const g = {
    id,
    name,
    brand,
    listing,
    item,
    category: item?.category ?? category,
    aliases,
  }
  gear.set(id, g)
  if (listing) {
    const entries = byListing.get(listing) ?? []
    entries.push(g)
    byListing.set(listing, entries)
  }
  for (const n of [name, ...aliases]) {
    const key = normalized(n)
    const entries = byName.get(key) ?? []
    entries.push(g)
    byName.set(key, entries)
  }
  return g
}
for (const l of listeners) {
  const g = addGear(
    l.id,
    displayName(l.brand, l.model),
    l.brand,
    l.listing,
    l.category || 'headphones',
    l.aliases,
  )
  g.listener = l
}
for (const p of players) {
  const existing = gear.get(p.id)
  const g =
    existing && existing.listing && p.listing === existing.listing
      ? existing
      : addGear(
          p.id,
          displayName(p.brand, p.model),
          p.brand,
          p.listing,
          'amplifiers',
          p.aliases,
        )
  g.player = p
}
const endpoints = new Map()
function systemGear(endpoint, side) {
  const name = displayName(endpoint.brand, endpoint.model)
  const key = name + '|' + (endpoint.listing || '')
  let g = endpoints.get(key)
  if (!g) {
    const exact = byName.get(normalized(name)) ?? []
    // Two records for a chassis with different revisions must stay distinct.
    g =
      exact.find((x) => endpoint.listing && x.listing === endpoint.listing) ??
      (exact.length === 1 && (!endpoint.listing || !exact[0].listing)
        ? exact[0]
        : null)
    if (!g)
      g = addGear(
        'sys-' + slug(name),
        name,
        endpoint.brand,
        endpoint.listing,
        'sources',
      )
    endpoints.set(key, g)
  }
  g[side] = true
  return g.id
}
export const connections = new Map()
for (const match of systemMatches) {
  if (connections.has(match.id))
    throw Error('Repeated system connection: ' + match.id)
  const from = systemGear(match.from, 'canSend')
  const to = systemGear(match.to, 'canReceive')
  connections.set(match.id, { ...match, fromId: from, toId: to })
}
// Connector-only routes require explicit signal type and direction. Their
// generic endpoints are deliberately excluded from equipment search and counts.
export const portEnds = { from: new Map(), to: new Map() }
export const portConnections = new Map()
for (const match of systemPortMatches) {
  const ids = {}
  for (const side of ['from', 'to']) {
    const port = match[side].port
    const id = side + '-' + slug(port)
    portEnds[side].set(id, port)
    ids[side + 'Id'] = id
  }
  if (portConnections.has(match.id))
    throw Error('Repeated port route: ' + match.id)
  portConnections.set(match.id, { ...match, ...ids })
}
for (const item of inventory) {
  if (byListing.has(item.url)) continue
  addGear(
    'shop-' + item.handle,
    displayName(item.brand, item.title),
    item.brand,
    item.url,
    item.category,
  )
}
const prepared = [...gear.values()].map((record) => {
  const terms = [
    record.name,
    ...(record.aliases || []),
    record.item?.title,
    record.item && displayName(record.brand, record.item.title),
  ]
    .filter(Boolean)
    .map(normalized)
  const compact = terms.map((v) => v.replaceAll(' ', ''))
  const tokens = new Set(terms.join(' ').split(' '))
  return { record, terms, compact, tokens, keywords: terms.join(' ') }
})
export const phoneSide = (g) =>
  Boolean(
    g &&
    (g.listener ||
      (!g.player && ['headphones', 'earphones'].includes(g.category))),
  )
export const ampSide = (g) =>
  Boolean(
    g &&
    (g.player ||
      (!g.listener &&
        ['amplifiers', 'players', 'sources'].includes(g.category))),
  )
export const hasEvidence = (g) =>
  Boolean(
    g.listener?.cables?.length ||
    g.player?.outputs.length ||
    g.canSend ||
    g.canReceive,
  )
export function accepts(g, side) {
  if (side === 'h') return phoneSide(g)
  if (side === 'a') return ampSide(g)
  if (side === 'from' || side === 'to') return Boolean(g)
  return Boolean(g)
}
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
export function searchGear(
  query = '',
  { side, category, scope, documented, preferred } = {},
) {
  const q = normalized(query),
    compact = q.replaceAll(' ', ''),
    words = q.split(' ').filter(Boolean)
  const hits = []
  for (const row of prepared) {
    const g = row.record
    if (
      !accepts(g, side) ||
      (category && g.category !== category) ||
      (scope === 'catalog' && !g.item) ||
      (scope === 'extended' && g.item) ||
      (documented && !hasEvidence(g))
    )
      continue
    let rank = 0
    if (q) {
      if (row.compact.includes(compact)) rank = 6
      else if (words.length > 1 && row.terms.some((t) => t.endsWith(' ' + q)))
        rank = 5
      else if (row.compact.some((t) => t.includes(compact))) rank = 4
      else if (
        words.every((w) =>
          w.length === 1 ? row.tokens.has(w) : row.keywords.includes(w),
        )
      )
        rank = 3
      else continue
    }
    // Among equally relevant results, carry the known second end and the
    // actual retail catalog to the front without hiding unsupported equipment.
    hits.push({
      g,
      rank,
      paired: preferred?.has(g.id) ? 1 : 0,
      evidence: (
        side === 'from'
          ? g.canSend
          : side === 'to'
            ? g.canReceive
            : hasEvidence(g)
      )
        ? 1
        : 0,
    })
  }
  hits.sort(
    (a, b) =>
      b.rank - a.rank ||
      b.paired - a.paired ||
      Number(!!b.g.item) - Number(!!a.g.item) ||
      b.evidence - a.evidence ||
      collator.compare(a.g.name, b.g.name),
  )
  return hits.map((x) => x.g)
}
export const inventoryCovered = new Set(
  [...gear.values()]
    .filter((g) => g.item && hasEvidence(g))
    .map((g) => g.item.url),
)
export const counts = {
  catalog: inventory.length,
  documentedCatalog: inventoryCovered.size,
  gear: gear.size,
  listeners: listeners.filter((x) => x.fit && x.cables.length && !x.mode)
    .length,
  players: players.filter((x) => x.outputs.length).length,
  systems: new Set(
    [...connections.values()].map((x) => x.fromId + '>' + x.toId),
  ).size,
}
export function roleFor(g) {
  if (phoneSide(g)) return 'h'
  if (g.player?.outputs.length) return 'a'
  if (g.canReceive) return 'to'
  if (g.canSend) return 'from'
  if (ampSide(g)) return 'a'
  return 'to'
}
export function entryUrl(g, side = roleFor(g)) {
  const params = new URLSearchParams()
  if (side === 'from' || side === 'to') params.set('mode', 'system')
  params.set(side, g.id)
  return '/moon/match/#m1?' + params
}
