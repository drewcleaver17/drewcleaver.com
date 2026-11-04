// Dated US merchandise examples. Only the explicitly priced combinations can be ordered.
export const catalogDate = 'November 4, 2026'
export const root = '/moon/'
export const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
export const fees = { rush: 45, usbAdapter: 9 }
export const families = {
  blue: {
    name: 'Blue Dragon Universal',
    material: 'UP-OCC copper',
    finish: 'Straight gold',
    base: 360,
    prices: { 5: 460, 15: 560 },
    color: '#375a80',
  },
  black: {
    name: 'Black Dragon Universal',
    material: 'UP-OCC copper',
    finish: 'Straight gold',
    prices: { 15: 660 },
    color: '#3b3838',
  },
  bronze: {
    name: 'Bronze Dragon Universal',
    material: 'Graphene and UP-OCC copper',
    finish: 'Straight gold',
    prices: { 15: 725 },
    color: '#966c46',
  },
  silver: {
    name: 'Silver Dragon Universal',
    material: 'UP-OCC silver',
    finish: 'Straight gold',
    prices: { 15: 1125 },
    color: '#8a8a83',
  },
  'blue-premium': {
    name: 'Blue Dragon Premium for Focal',
    material: 'UP-OCC copper',
    finish: 'Premium rhodium',
    prices: { 5: 580, 15: 680 },
    color: '#375a80',
  },
}
export const hardware = {
  'focal-utopia-2022': {
    name: 'Focal Utopia 2022',
    price: 4999,
    image: 'utopia.svg',
    profile: 'Open-back · France',
    short: 'Open honeycomb cups · Two-pin LEMO earcups',
  },
  'meze-99-classics': {
    name: 'Meze 99 Classics 2nd Gen',
    price: 349,
    image: 'meze-99.svg',
    profile: 'Closed-back · Walnut',
    short: 'USB-C DAC/amp and 3.5 mm cable included',
  },
  'meze-109-pro': {
    name: 'Meze 109 Pro',
    price: 799,
    image: 'meze-109.svg',
    profile: 'Open-back · Walnut',
    short: 'Velour pads · Supplied 3.5 mm cables',
  },
}
export const utopia = 'focal-utopia-2022'
export const guide99 = 'meze-99-classics'
export const guide109 = 'meze-109-pro'
export const productUrl = (sku) => root + 'products/' + sku + '/'
export const cableUrl = (family) => root + 'cables/' + family + '/'
export const paths = {
  entry: root,
  desk: root + 'guides/desk/',
  home: root + 'guides/home/',
  fit: root + 'fit/',
  advisor: root + 'advisor/',
  presenter: root + 'presenter/',
  cart: root + 'cart/',
  review: root + 'review/',
  quote: root + 'quote/',
}
export const routes = [
  '',
  ...Object.keys(families).map((x) => 'cables/' + x),
  ...Object.keys(hardware).map((x) => 'products/' + x),
  'guides/desk',
  'guides/home',
  'fit',
  'advisor',
  'presenter',
  'cart',
  'review',
  'quote',
]
export const names = {
  hp: {
    '': 'Headphones to confirm',
    utopia: 'Focal Utopia 2022',
    other: 'Headphone model to check',
  },
  amp: {
    '': 'Amp or player to confirm',
    zen: 'iFi ZEN DAC 3',
    other: 'Other amp or player',
    direct: 'Specified by connector',
  },
  jack: {
    '': 'Output to confirm',
    front44: 'Front 4.4 mm balanced headphone jack',
    front63: 'Front 6.35 mm headphone jack',
    rear44: 'Rear 4.4 mm line output',
    direct44: '4.4 mm balanced headphone jack',
    unknown: 'Jack to identify',
  },
}
export function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}
export function blank(family = 'blue', id = '00000000') {
  return {
    id,
    family,
    hp: '',
    amp: '',
    jack: '',
    feet: Object.keys(families[family].prices)[0],
    rush: false,
    photos: 0,
    expert: false,
  }
}
export const ears = (b) =>
  b.hp === 'utopia' ? 'Two 2-pin LEMO plugs' : 'Earcup plugs to confirm'
export const complete = (b) =>
  b.hp === 'utopia' &&
  ((b.amp === 'zen' && b.jack === 'front44') ||
    (b.amp === 'direct' && b.jack === 'direct44'))
export function price(b) {
  const f = families[b.family],
    fit = f.prices[b.feet]
  return fit + (b.rush ? fees.rush : 0)
}
export function estimate(b) {
  const f = families[b.family]
  return b.hp === 'utopia'
    ? price(b)
    : f.base && b.feet === '5'
      ? f.base + (b.rush ? fees.rush : 0)
      : null
}
export function breakdown(b) {
  const f = families[b.family],
    base = f.prices['5'],
    parts = []
  if (b.hp !== 'utopia') return []
  if (base !== undefined) {
    parts.push([
      '5 ft · Utopia fit + ' + f.finish.toLowerCase() + ' plug',
      base,
    ])
    if (b.feet !== '5')
      parts.push([
        'Length upgrade to ' + b.feet + ' ft',
        f.prices[b.feet] - base,
      ])
  } else
    parts.push([
      b.feet + ' ft · Utopia fit + ' + f.finish.toLowerCase() + ' plug',
      f.prices[b.feet],
    ])
  if (b.rush) parts.push(['Optional workshop rush', fees.rush])
  return parts
}
const owns = (obj, key) => typeof key === 'string' && Object.hasOwn(obj, key)
export const validId = (id) =>
  typeof id === 'string' && /^[A-F0-9]{8}$/.test(id)
export function validBuild(b) {
  if (
    !b ||
    !validId(b.id) ||
    !owns(families, b.family) ||
    !owns(families[b.family].prices, b.feet) ||
    !owns(names.hp, b.hp) ||
    !owns(names.amp, b.amp) ||
    !owns(names.jack, b.jack) ||
    typeof b.rush !== 'boolean' ||
    typeof b.expert !== 'boolean' ||
    !Number.isInteger(b.photos) ||
    b.photos < 0 ||
    b.photos > 3
  )
    return false
  const allowed = {
    '': ['', 'unknown'],
    zen: ['', 'unknown', 'front44', 'front63', 'rear44'],
    direct: ['', 'unknown', 'direct44'],
    other: ['', 'unknown'],
  }
  return allowed[b.amp].includes(b.jack)
}
// The fragment has no user text, prices, addresses or file data. A new pricebook requires a new version.
export function pack(b, kind = 'build') {
  if (
    !validBuild(b) ||
    !['build', 'request', 'quote'].includes(kind) ||
    (kind === 'quote' && !complete(b))
  )
    throw Error('Unverified build')
  return (
    '#' +
    [
      'w1',
      'us261104',
      kind,
      b.id,
      b.family,
      b.hp || '-',
      b.amp || '-',
      b.jack || '-',
      b.feet,
      +b.rush,
      b.photos,
      +b.expert,
    ].join('.')
  )
}
export function unpack(hash, kind) {
  const s = hash.startsWith('#') ? hash.slice(1) : hash,
    a = s.split('.')
  if (
    a.length !== 12 ||
    a[0] !== 'w1' ||
    a[1] !== 'us261104' ||
    a[2] !== kind ||
    !/^[01]$/.test(a[9]) ||
    !/^[0-3]$/.test(a[10]) ||
    !/^[01]$/.test(a[11])
  )
    return null
  const empty = (x) => (x === '-' ? '' : x)
  const b = {
    id: a[3],
    family: a[4],
    hp: empty(a[5]),
    amp: empty(a[6]),
    jack: empty(a[7]),
    feet: a[8],
    rush: a[9] === '1',
    photos: Number(a[10]),
    expert: a[11] === '1',
  }
  return validBuild(b) && (kind !== 'quote' || complete(b)) ? b : null
}
export function silverAttachment(id) {
  return {
    ...blank('silver', id),
    hp: 'utopia',
    amp: 'direct',
    jack: 'direct44',
    expert: true,
  }
}
export function validLine(line) {
  if (!line || !validId(line.id)) return false
  if (line.kind === 'cable')
    return (
      validBuild(line.build) &&
      complete(line.build) &&
      line.build.id === line.id
    )
  return (
    line.kind === 'hardware' &&
    owns(hardware, line.sku) &&
    (line.option === 'included' ||
      (line.sku === utopia && line.option === 'silver'))
  )
}
export const linePrice = (line) =>
  line.kind === 'cable'
    ? price(line.build)
    : hardware[line.sku].price +
      (line.option === 'silver' ? price(silverAttachment(line.id)) : 0)
export const source = {
  blue: 'https://www.moon-audio.com/products/blue-dragon-headphone-cable-v3',
  premium:
    'https://www.moon-audio.com/products/blue-dragon-premium-cable-for-focal-headphones',
  black: 'https://www.moon-audio.com/products/black-dragon-headphone-cable-v2',
  bronze: 'https://www.moon-audio.com/products/bronze-dragon-headphone-cable',
  silver:
    'https://www.moon-audio.com/products/silver-dragon-headphone-cable-v3',
  returns: 'https://www.moon-audio.com/pages/returns',
  warranty: 'https://www.moon-audio.com/pages/dragon-cables-limited-warranty',
  workshop:
    'https://www.moon-audio.com/blogs/expert-advice/behind-the-scenes-handcrafted-dragon-audio-cables',
  ifi: 'https://ifi-audio.com/wp-content/uploads/2024/04/ZEN-DAC-3-User-Manual_Ver1.0-1.pdf',
}
