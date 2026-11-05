import assert from 'node:assert/strict'
import test from 'node:test'
import { allOffers, fitLinksFor, offerById, offersFor } from '../offers.mjs'

test('Utopia needs the specific earcup group and every selected surcharge', () => {
  const build = handle => offersFor('focal-utopia-2022', handle, '4.4').find(o => o.length === '15 ft')
  const blue = build('blue-dragon-headphone-cable-v3')
  assert.equal(blue.usd, 560)
  assert.deepEqual(blue.parts.map(p => p.usd), [460, 100, 0])
  assert.deepEqual(blue.selections.map(p => p.label), ['Headphone Connection Type', 'Amplifier Connection Options'])
  const premium = build('blue-dragon-premium-cable-for-focal-headphones')
  assert.equal(premium.kind, 'configured')
  assert.equal(premium.usd, 680)
  assert.deepEqual(premium.parts.map(p => p.usd), [660, 20])
  assert.equal(premium.variant, '51610371129658')
  assert.equal(premium.selections.length, 1)
  assert.equal(fitLinksFor('focal-utopia-2022', premium.handle)[0].optionLabel, 'Utopia')
  assert.deepEqual(fitLinksFor('focal-utopia-2022', blue.handle), [])
})

test('a native premium amp plug already includes its selected price increment', () => {
  const handle = 'silver-dragon-cable-audeze-headphones'
  const o = offersFor('audeze-lcd-2', handle, '4.4').find(row => row.length === '15 ft')
  assert.equal(o.usd, 1145)
  assert.equal(o.kind, 'variant')
  assert.equal(o.variant, '53134844428602')
  assert.deepEqual(o.selections, [])
  const link = fitLinksFor('audeze-lcd-2', handle, '4.4')[0]
  assert.ok(offersFor('audeze-lcd-2', handle, '4.4').some(offer => offer.url === link.url))
})

test('a discounted Meze ALBA option retains its policy and both native ends', () => {
  const o = offersFor('meze-alba', 'silver-dragon-iem-cable', '4.4').find(row => row.length === '48 in')
  assert.equal(o.variant, '51605410414906')
  assert.equal(o.usd, 205)
  assert.equal(o.kind, 'variant')
  assert.equal(offerById(o.id).policy, 'Sale cable · final sale')
})

test('rush is a separately sourced opt-in and preserves standard merchandise totals', () => {
  const focal = offersFor('focal-utopia-2022', 'blue-dragon-premium-cable-for-focal-headphones', '4.4')
    .find(o => o.length === '15 ft')
  assert.equal(focal.usd, 680)
  assert.equal(focal.rushUsd, 45)
  assert.equal(focal.usd + focal.rushUsd, 725)
  assert.equal(offerById(focal.id).usd, 680)
  const iem = offersFor('64-audio-u12t', 'bronze-dragon-iem-cable-v2-for-64-audio', '4.4')[0]
  assert.equal(iem.rushUsd, 25)
  const bathys = offersFor('focal-bathys', 'bronze-dragon-portable-headphone-cable-for-focal-bathys', '3.5')[0]
  assert.equal(bathys.rushUsd, undefined)
})

test('single-entry stereo and unresolved earcup fittings cannot generate a balanced offer', () => {
  assert.deepEqual(offersFor('focal-bathys', undefined, '4.4'), [])
  assert.deepEqual(offersFor('sennheiser-hd-620s'), [])
  assert.deepEqual(offersFor('unlisted-headphones'), [])
  assert.equal(offerById('focal-utopia-2022~51610371129658~00000000'), null)
})

test('every priced build has a unique resolvable identity and exact component sum', () => {
  const seen = new Set()
  for (const o of allOffers()) {
    assert.ok(!seen.has(o.id), o.id)
    seen.add(o.id)
    assert.equal(offerById(o.id)?.id, o.id)
    assert.ok(Number.isFinite(o.usd) && o.usd > 0)
    assert.equal(Math.round(o.parts.reduce((sum, p) => sum + p.usd, 0) * 100), Math.round(o.usd * 100), o.id)
    assert.equal(new URL(o.url).searchParams.get('variant'), o.variant)
    assert.ok(o.kind === 'variant' ? !o.selections.length : o.selections.length > 0)
    if (o.policy) assert.equal(o.kind, 'variant')
  }
  assert.ok(seen.size > 0)
})
