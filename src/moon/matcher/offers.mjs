// A price belongs to a specific, available native variant plus each selected
// retail form modifier. An earcup selector label is joined exactly, by product.
import book from './offer-data/pricebook.json' with { type: 'json' }
import { listeners } from './listeners.mjs'

export const offerDate = book.checked
const productUrl = (handle) => 'https://www.moon-audio.com/products/' + handle
const models = new Map(listeners.map((model) => [model.id, model]))
const variantHandles = new Map()
for (const [handle, product] of Object.entries(book.products)) {
  for (const row of product.variants) variantHandles.set(row.id, handle)
}
const earLabel = (value) => (value || '').replace(/\s*\(\$[\d.]+\)$/, '').replace(/\s+/g, ' ').trim()
const readablePlug = (value) => value.replace(/\s*\(\$[\d.]+\)/g, '').trim()
const sorted = (a, b) => a.usd - b.usd || a.feet - b.feet || a.finish.localeCompare(b.finish)
const feet = (label) => Number.parseInt(label, 10) / (label.endsWith(' in') ? 12 : 1)

// Changing a length, earcup group, native plug or form choice retires the old
// link even if the retailer kept its numeric variant ID and merchandise price.
function signature(strings) {
  const text = JSON.stringify(strings)
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function fitRows(listener, handle) {
  const product = book.products[handle]
  if (!listener?.fit || listener.mode || !listener.cables.includes(handle) || !product) return []
  const selectedEar = earLabel(listener.earOptions?.[handle])
  if (product.ear && !Object.hasOwn(product.ear.choices, selectedEar)) return []
  return product.variants.filter(row => !row.ear || earLabel(row.ear) === selectedEar)
}

function offerGroup(listener, handle) {
  const rows = fitRows(listener, handle)
  if (!rows.length) return []
  const product = book.products[handle]
  const source = productUrl(handle)
  const selectedEar = earLabel(listener.earOptions?.[handle])
  const result = []
  for (const row of rows) {
    const options = product.amp
      ? Object.entries(product.amp.choices)
      : [[row.amp, { plug: row.plug, usd: 0 }]]
    for (const [amp, choice] of options) {
      if (listener.plugs && !listener.plugs.includes(choice.plug)) continue
      const selections = []
      const baseLabel = row.length + ' cable' + (row.ear ? ' · ' + earLabel(row.ear) : '')
      const parts = [{ label: baseLabel, usd: row.usd }]
      if (product.ear) {
        selections.push({ label: product.ear.label, value: selectedEar })
        parts.push({ label: selectedEar, usd: product.ear.choices[selectedEar] })
      }
      if (product.amp) {
        selections.push({ label: product.amp.label, value: amp })
        parts.push({ label: amp, usd: choice.usd })
      }
      const identity = [handle, listener.fit, row.length, row.ear || '', amp, selections]
      if (product.policy) identity.push(product.policy)
      const key = signature(identity)
      result.push({
        id: [listener.id, row.id, key].join('~'),
        handle, listener: listener.id, plug: choice.plug,
        feet: feet(row.length), length: row.length, finish: readablePlug(amp),
        variant: row.id, source, url: source + '?variant=' + row.id,
        kind: selections.length ? 'configured' : 'variant',
        selections, parts, policy: product.policy ?? '',
        ...(product.rushUsd ? { rushUsd: product.rushUsd } : {}),
        usd: Math.round(parts.reduce((sum, part) => sum + part.usd, 0) * 100) / 100,
      })
    }
  }
  return result.sort(sorted)
}

// Materialize only the selected listener/cable. Many models share variants.
// The headline search and device browse do not expand the whole price matrix.
const groups = new Map()
function group(listener, handle) {
  if (!Object.hasOwn(book.products, handle) || !listener.cables.includes(handle)) return []
  const key = listener.id + '/' + handle
  if (!groups.has(key)) groups.set(key, offerGroup(listener, handle))
  return groups.get(key)
}

export function offersFor(listenerId, handle, plug) {
  const listener = models.get(listenerId)
  if (!listener) return []
  const offers = handle ? group(listener, handle) : listener.cables.flatMap(h => group(listener, h)).sort(sorted)
  return plug ? offers.filter(offer => offer.plug === plug) : offers
}
export function offerById(id) {
  if (typeof id !== 'string' || id.length > 180) return null
  const parts = id.split('~')
  if (parts.length !== 3) return null
  const handle = variantHandles.get(parts[1])
  if (!handle) return null
  return offersFor(parts[0], handle).find(offer => offer.id === id) ?? null
}
export function handlesFor(listenerId) {
  const listener = models.get(listenerId)
  return listener ? listener.cables.filter(handle => group(listener, handle).length) : []
}

// A retailer URL can preserve a native earcup variant (or a fixed earcup).
// Omit URLs that would open with a required, unselected on-page earcup field.
export function fitLinksFor(listenerId, selectedHandle, plug) {
  const listener = models.get(listenerId)
  if (!listener) return []
  const handles = selectedHandle ? [selectedHandle] : listener.cables
  return handles.flatMap(handle => {
    if (!Object.hasOwn(book.products, handle) || book.products[handle].ear) return []
    const rows = fitRows(listener, handle).filter(row => !plug || !row.plug || row.plug === plug)
    if (!rows.length) return []
    const row = rows.reduce((shortest, r) => feet(r.length) < feet(shortest.length) ? r : shortest)
    return [{
      listener: listenerId, handle, variant: row.id,
      url: productUrl(handle) + '?variant=' + row.id,
      optionLabel: row.ear ?? listener.fit,
    }]
  })
}

export function* allOffers() {
  for (const listener of listeners) {
    for (const handle of listener.cables) yield* offerGroup(listener, handle)
  }
}
