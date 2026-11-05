// Maintainer command. The public matcher never imports this file or contacts Moon.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { JSDOM } from 'jsdom'
import { inventory } from '../inventory.mjs'
import { listeners, listenerCableSpecs } from '../listeners.mjs'

const args = process.argv.slice(2)
const live = args.length === 1 && args[0] === '--live'
const snapshot = args.length === 2 && args[0] === '--snapshot' && args[1]
assert(
  !args.length || live || snapshot,
  'Use --live or --snapshot DIRECTORY, or omit both for the offline check.',
)

// A 3.5 mm balanced jack, a four-pin mini-XLR, and a pair of stereo outputs
// each require a different connection from the five conventional types below.
const ampLabels = {
  3.5: /^3\.5mm (?:trs\b|moon audio (?:straight )?male\b)/i,
  6.35: /^1\/4(?:[-" ]|in)/i,
  4.4: /^4\.4mm (?:trrrs\b|moon audio (?:balanced|male))/i,
  2.5: /^2\.5mm trrs\b/i,
  xlr4: /^4[- ]pin\s*(?!.*(?:mini|female))(?=.*\b(?:neutrik|moon audio|furutech|xlr)\b)(?=.*\bxlr\b)/i,
}

function checkedListings() {
  const wanted = inventory.filter((item) =>
    ['headphones', 'earphones'].includes(item.category),
  )
  const listed = listeners.filter((row) => row.listing)
  assert.deepEqual(
    listed.map((row) => row.listing).sort(),
    wanted.map((row) => row.url).sort(),
    'Reconcile models with the US listing index',
  )
  const models = new Map(listeners.map((row) => [row.id, row]))
  assert.equal(models.size, listeners.length, 'Duplicate listener ID')
  for (const row of listeners) {
    assert.equal(new URL(row.source).protocol, 'https:', row.id)
    assert(['headphones', 'earphones'].includes(row.category), row.id)
    const complete = row.fit && !row.mode
    assert.equal(Boolean(row.cables.length), Boolean(complete), row.id)
    assert.equal(new Set(row.cables).size, row.cables.length, row.id)
    for (const handle of row.cables)
      assert(Object.hasOwn(listenerCableSpecs, handle), row.id + '/' + handle)
    for (const handle of Object.keys(row.earOptions))
      assert(row.cables.includes(handle), row.id)
    for (const plug of [
      ...(row.plugs || []),
      ...Object.keys(row.included || {}),
    ])
      assert(Object.hasOwn(ampLabels, plug), row.id)
    for (const revision of row.revisions || []) {
      const target = models.get(revision.id)
      assert(
        target?.cables.length && target.brand === row.brand,
        row.id + '/' + revision.id,
      )
    }
  }
  return listed.length
}

function selectorValues(document, label) {
  const values = new Set()
  for (const element of document.querySelectorAll('select')) {
    const name =
      element.dataset.name || element.getAttribute('aria-label') || ''
    if (!label.test(name)) continue
    for (const option of element.options) {
      const value = option.dataset.value || option.value
      if (value && !option.disabled) values.add(value.trim())
    }
  }
  return values
}

async function productHtml(handle, url) {
  if (snapshot) return readFile(join(snapshot, handle + '.html'), 'utf8')
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  assert(response.ok, url + ' returned HTTP ' + response.status)
  return response.text()
}

async function checkSelectors(handle, cable) {
  const html = await productHtml(handle, cable.source)
  // The order form is present in the initial HTML. Ignore executable snippets.
  const formHtml = html.replace(
    /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    '',
  )
  const dom = new JSDOM(formHtml, { url: cable.source })
  try {
    const doc = dom.window.document
    const title = doc.querySelector('meta[property="og:title"]')?.content
    assert.equal(
      title?.trim().replace(/\s+/g, ' '),
      cable.name,
      'Review current product title for ' + handle,
    )
    const outputs = [...selectorValues(doc, /\b(?:amplifier|amp)\b/i)]
    for (const plug of cable.plugs) {
      assert(
        outputs.some((value) => ampLabels[plug]?.test(value)),
        handle + ' has no current ' + plug + ' selection',
      )
    }
    const earcups = selectorValues(doc, /^(?:Headphone Connection|IEM)/i)
    for (const row of listeners.filter((record) =>
      record.cables.includes(handle),
    )) {
      const selected = row.earOptions[handle]
      if (selected || earcups.size > 1) {
        assert(
          earcups.has(selected),
          row.id + '/' + handle + ': review exact earcup selector ' + selected,
        )
      }
    }
  } finally {
    dom.window.close()
  }
}

const listed = checkedListings()
const matched = listeners.filter((row) => row.cables.length)
const associations = matched.reduce(
  (count, row) => count + row.cables.length,
  0,
)
const selectors = matched.reduce(
  (count, row) => count + Object.keys(row.earOptions).length,
  0,
)
console.log(
  `${listeners.length} models, ${listed} US listings, ${matched.length} with named cables, ${associations} associations, ${selectors} explicit selector values.`,
)
if (live || snapshot) {
  for (const [handle, cable] of Object.entries(listenerCableSpecs))
    await checkSelectors(handle, cable)
  console.log(
    `${Object.keys(listenerCableSpecs).length} retail order forms passed. Model wiring and new package contents also require human review.`,
  )
}
