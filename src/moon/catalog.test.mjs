import test from 'node:test'
import assert from 'node:assert/strict'
import {
  blank,
  complete,
  estimate,
  price,
  fees,
  families,
  validBuild,
  validLine,
  linePrice,
  silverAttachment,
  utopia,
  guide99,
  guide109,
  pack,
  unpack,
  breakdown,
} from './catalog.mjs'

const id = '5190A04F'
function fitted(family = 'blue', feet = '15') {
  return {
    ...blank(family, id),
    hp: 'utopia',
    amp: 'zen',
    jack: 'front44',
    feet,
  }
}
test('Universal prices compare the same earcups, amp output, finish and length', () => {
  const expected = { blue: 560, black: 660, bronze: 725, silver: 1125 }
  for (const [family, total] of Object.entries(expected)) {
    const b = fitted(family)
    assert.equal(validBuild(b), true)
    assert.equal(price(b), total)
    assert.equal(families[family].finish, 'Straight gold')
  }
  assert.equal(price(fitted('blue', '5')), 460)
  assert.equal(families.blue.base, 360)
  assert.match(families.blue.material, /copper/i)
  assert.equal(estimate({ ...blank('silver', id), hp: 'other' }), null)
})
test('Premium price breakdown survives a portable, independently decoded quote', () => {
  const b = { ...fitted('blue-premium'), rush: true, photos: 3 }
  assert.deepEqual(
    breakdown(b).map((row) => row[1]),
    [580, 100, 45],
  )
  const result = unpack(pack(b, 'quote'), 'quote')
  assert.deepEqual(result, b)
  assert.equal(price(result), 725)
  assert.equal(linePrice({ id, kind: 'cable', build: result }), 725)
})
test('Partial, stale, unknown and wrong-output builds cannot become an order or quote', () => {
  for (const b of [
    { ...fitted(), hp: 'other' },
    { ...fitted(), amp: '', jack: '' },
    { ...fitted(), jack: 'front63' },
    { ...fitted(), jack: 'rear44' },
    { ...fitted(), amp: 'other', jack: 'unknown' },
  ]) {
    assert.equal(complete(b), false)
    assert.ok(unpack(pack(b, 'request'), 'request'))
    assert.throws(() => pack(b, 'quote'))
    assert.equal(validLine({ kind: 'cable', id, build: b }), false)
  }
  const good = pack(fitted('silver'), 'quote')
  for (const unsafe of [
    good.replace('us261104', 'old'),
    good.replace('front44', 'rear44'),
    good.replace('.15.', '.5.'),
    good + '.USD',
    good.replace('silver', 'constructor'),
    good.replace(id, 'name@example.com'),
    good.replace('quote', 'request'),
  ])
    assert.equal(unpack(unsafe, 'quote'), null)
})
test('Hardware attachment price requires the matched Utopia SKU and excludes external adapters', () => {
  assert.equal(
    linePrice({ id, kind: 'hardware', sku: utopia, option: 'included' }),
    4999,
  )
  assert.equal(
    linePrice({ id, kind: 'hardware', sku: utopia, option: 'silver' }),
    6124,
  )
  assert.equal(
    validLine({ id, kind: 'hardware', sku: guide99, option: 'silver' }),
    false,
  )
  assert.equal(price(silverAttachment(id)), 1125)
  assert.equal(
    linePrice({ id, kind: 'hardware', sku: guide109, option: 'included' }) +
      fees.usbAdapter,
    808,
  )
  assert.equal(
    linePrice({ id, kind: 'hardware', sku: guide99, option: 'included' }),
    349,
  )
  assert.equal(
    validLine({ id: 'DEADBEEF', kind: 'cable', build: fitted() }),
    false,
  )
})
