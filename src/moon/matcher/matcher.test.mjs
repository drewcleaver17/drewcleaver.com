import assert from 'node:assert/strict'
import test from 'node:test'
import {
  entryUrl,
  searchGear,
  gear,
  connections,
  portConnections,
} from './directory.mjs'
import { inventory } from './inventory.mjs'
import { listeners } from './listeners.mjs'
import { players } from './players.mjs'
import { allOffers, offersFor } from './offers.mjs'
import {
  readSelection,
  matchHash,
  emptySelection,
  chooseGear,
  selectOutput,
  choicesFor,
  selectedOffer,
  outputChoices,
  matchLineDetails,
  systemChoices,
  summarize,
  byConnector,
} from './engine.mjs'

const listener = 'sennheiser-hd-800-s'
const zen = 'ifi-zen-dac-3'
function setup(h = listener, a = zen, port = '4.4') {
  return selectOutput(
    chooseGear(chooseGear(emptySelection(), 'h', h), 'a', a),
    port,
  )
}
test('Every inventoried retail title is searchable and every directory entry opens its own retained device', () => {
  for (const item of inventory)
    assert.ok(
      searchGear(item.title, { scope: 'catalog' }).some(
        (g) => g.item?.url === item.url,
      ),
      item.title,
    )
  for (const g of gear.values()) {
    const s = readSelection(new URL(entryUrl(g), 'https://example.test').hash)
    assert.ok(s, g.id)
    assert.ok(Object.values(s).includes(g.id), g.id)
  }
  assert.equal(searchGear('hd800s')[0].id, listener)
  assert.equal(searchGear('FiiO K7')[0].id, 'fiio-k7')
  assert.ok(searchGear('Torus Power TOT Max', { scope: 'catalog' }).length)
  assert.equal(searchGear('unknown private model 01876543210').length, 0)
})
test('All named player choices come from the documented headphone panel and invalid panels fail closed', () => {
  for (const p of players) {
    const s = chooseGear(emptySelection(), 'a', p.id)
    for (const o of outputChoices(s)) {
      assert.ok(p.outputs.some((x) => x.plug === o.value))
      assert.deepEqual(
        readSelection(matchHash(selectOutput(s, o.value))),
        selectOutput(s, o.value),
      )
    }
  }
  assert.equal(
    readSelection('#m1?h=' + listener + '&a=' + zen + '&port=rear44'),
    null,
  )
  assert.equal(readSelection('#m1?h=' + listener + '&port=4.4'), null)
  assert.deepEqual(choicesFor(setup('audeze-crbn2')), [])
  assert.deepEqual(choicesFor(setup('focal-bathys-mg')), [])
  assert.deepEqual(choicesFor(setup('sony-wf-1000xm6', byConnector)), [])
  assert.ok(summarize(setup()).lines.find(([k]) => k === 'Included cable'))
})
test('Every offered headphone build can be reconstructed with its exact fitting, jack, option and price', () => {
  const seen = new Set()
  for (const o of allOffers()) {
    const key = [o.listener, o.handle, o.plug].join('|')
    if (seen.has(key)) continue
    seen.add(key)
    const s = {
      ...setup(o.listener, byConnector, o.plug),
      cable: o.handle,
      offer: o.id,
    }
    const h = matchHash(s)
    assert.deepEqual(readSelection(h), s, h)
    assert.equal(
      matchLineDetails({ id: '123456AF', kind: 'match', hash: h }).price,
      o.usd,
    )
  }
  assert.ok(seen.size > 100)
})
test('Miswired, stale, unpriced, cross-model or duplicated URL fields cannot become a line item', () => {
  const s = setup(),
    c = choicesFor(s)[0],
    o = c.offers[0]
  const h = matchHash({ ...s, cable: c.handle, offer: o.id })
  for (const bad of [
    h.replace('rev=p1-', 'rev=p1-9'),
    h.replace('port=4.4', 'port=6.35'),
    h.replace(listener, 'meze-109-pro'),
    h + '&h=' + listener,
    h + '&name=Drew',
    h.replace('m1?', 'm0?'),
    h + '&to=anything',
    h.replace(c.handle, 'constructor'),
    '#m1?h=' + listener + '&a=' + zen,
    '#m1',
  ])
    assert.equal(
      matchLineDetails({ id: '123456AF', hash: bad, kind: 'match' }),
      null,
    )
  assert.equal(readSelection('#m1?mode=ports&h=' + listener), null)
  assert.equal(readSelection('#m1?h=__proto__'), null)
  assert.ok(offersFor(listener).length)
})
test('Short links for every named and explicitly chosen port route preserve direction and exact cable', () => {
  for (const [mode, set] of [
    ['system', connections],
    ['ports', portConnections],
  ]) {
    for (const row of set.values()) {
      const s = {
        ...emptySelection(mode),
        from: row.fromId,
        to: row.toId,
        system: row.id,
      }
      assert.deepEqual(readSelection(matchHash(s)), s)
      assert.equal(
        readSelection(matchHash({ ...s, from: s.to, to: s.from })),
        null,
      )
    }
  }
  assert.equal(systemChoices(emptySelection('system')).length, 0)
})
test('Every linked revision exists and includes its own fit', () => {
  for (const l of listeners)
    for (const rev of l.revisions ?? [])
      assert.ok(gear.get(rev.id)?.listener.fit)
})

test('Optional rush uses this product’s fee, survives the portable card, and cannot be forged', () => {
  const s = setup('focal-utopia-2022')
  const handle = 'blue-dragon-premium-cable-for-focal-headphones'
  const o = offersFor(s.h, handle, s.port).find(
    (row) => row.feet === 15 && row.usd === 680,
  )
  const rush = { ...s, cable: handle, offer: o.id, rush: '1' }
  assert.equal(selectedOffer(rush).usd, 725)
  assert.deepEqual(readSelection(matchHash(rush)), rush)
  assert.equal(
    readSelection(matchHash(rush).replace('p1-72500', 'p1-68000')),
    null,
  )
  assert.equal(readSelection('#m1?h=focal-utopia-2022&rush=1'), null)
  assert.equal(chooseGear(rush, 'h', 'sennheiser-hd-800-s').rush, '')
  assert.equal(selectedOffer({ ...rush, rush: '2' }), null)
})
