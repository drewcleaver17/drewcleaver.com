import assert from 'node:assert/strict'
import test from 'node:test'
import { systemMatches, systemPortMatches } from './systems.mjs'

const pair = (from, to) =>
  systemMatches.filter((row) => row.from.model === from && row.to.model === to)

test('model connections have unique share IDs and cite both ends and the Dragon', () => {
  assert.equal(new Set(systemMatches.map((r) => r.id)).size, systemMatches.length)
  for (const row of systemMatches) {
    const url = new URL(row.url)
    assert.equal(url.origin, 'https://www.moon-audio.com')
    assert.match(url.pathname, /^\/products\/[a-z0-9-]+$/)
    assert.match(url.searchParams.get('variant'), /^\d+$/)
    assert.ok(row.id.endsWith('-' + url.searchParams.get('variant')), 'a changed variant must retire the old share ID')
    assert.ok(row.sources.includes(url.origin + url.pathname))
    assert.ok(row.sources.length >= 2)
    assert.ok(row.from.port && row.to.port)
  }
})

test('a desktop USB link, directional portable OTG and dual-BNC need different cables', () => {
  const desktop = pair('MacBook Air (M1, 2020)', 'Qutest')
  assert.equal(desktop.length, 1)
  assert.match(desktop[0].url, /50068172996922$/)
  const portable = pair('A&ultima SP3000', 'Hugo 2')
  assert.equal(portable.length, 1)
  assert.match(portable[0].url, /49787930706234$/)
  const dual = pair('Hugo M Scaler', 'Qutest').find((row) => row.to.port.includes('Dual-data'))
  assert.match(dual.note, /two matching BNC-to-BNC cables/)
  const mini = pair('Hugo M Scaler', 'Hugo 2')
  assert.equal(mini.length, 1)
  assert.match(mini[0].url, /black-mini-coax-hugo-2-hugo-m-scaler/)
})

test('signals and power cannot be inferred from the socket shape', () => {
  assert.equal(pair('Qutest', 'XA25').length, 0, 'fixed DAC to volume-less power amp')
  assert.equal(pair('Lina Master Clock', 'Qutest').length, 0, 'BNC clock to audio')
  assert.equal(pair('Hugo M Scaler', 'Lina Master Clock').length, 0)
  assert.equal(pair('Qutest', 'Huei').length, 0, 'line-level RCA into phono input')
  assert.equal(pair('AT-LPA2', 'C 3050').length, 0, 'factory MC into MM-only phono')
  assert.equal(pair('AT-LPA2', 'Huei').length, 1)
  assert.equal(pair('TOT Max (North America)', 'HYPSOS (US model)').length, 1)
  assert.equal(pair('NT-507T', 'GO bar Kensei').length, 0, 'unconfirmed USB bus power')
  assert.equal(pair('Aria Evo X N°1', 'INT-25').length, 0, 'reversed speaker direction')
})

test('generic ports stay separate from names and omit specialist, power and speaker paths', () => {
  assert.ok(systemPortMatches.length)
  for (const row of systemPortMatches) {
    assert.equal(row.from.brand, 'By port')
    assert.equal(row.to.brand, 'By port')
    assert.ok(!['Power', 'Speaker'].includes(row.category))
    assert.doesNotMatch(row.id, /dual-data|phono|word-clock|preamp/)
  }
  assert.ok(systemMatches.every((row) => row.from.brand !== 'By port'))
})

test('power range and channel assignment constrain speaker wiring', () => {
  assert.equal(pair('INT-25', 'Sopra N°3').length, 0)
  assert.equal(pair('INT-250', 'Sopra N°3').length, 1)
  assert.equal(pair('INT-250', 'Kanta Center').length, 0)
  assert.equal(pair('INT-250', 'AE1 40th Anniversary Edition').length, 0)
  assert.match(pair('RX-V6A (US model)', 'Kanta Center')[0].from.port, /CENTER/)
  assert.match(pair('RX-V6A (US model)', 'AE1 40th Anniversary Edition')[0].note, /6-ohm/)
})

test('docks, phono variants and proprietary outputs keep model-specific limitations', () => {
  assert.match(pair('PD10', 'Lina Headphone Amplifier')[0].from.port, /attached.*Cradle/)
  assert.equal(pair('AT-LPA2', 'Oasis').length, 1, 'MC cartridge to MC phono stage')
  assert.equal(pair('AT-LPA2', 'Madison Phono').length, 0, 'unknown phono edition')
  assert.equal(pair('AT-LPA2', 'SC-CX700').length, 0, 'MC cartridge to MM-only active system')
  assert.equal(pair('MacBook Air (M1, 2020)', 'SC-CX700').length, 1)
  assert.match(pair('XP-12', 'S-05XE').find((item) => item.to.port.includes('XLR')).to.port, /standard XLR inputs/)
  assert.equal(pair('M21', 'XA160.8').length, 0, 'fixed output to a power amp')
})
