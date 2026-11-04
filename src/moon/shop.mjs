import {
  root,
  paths,
  productUrl,
  cableUrl,
  families,
  hardware,
  money,
  fees,
  utopia,
  guide99,
  guide109,
  blank,
  ears,
  names,
  complete,
  estimate,
  breakdown,
  price,
  source,
  silverAttachment,
} from './catalog.mjs'

export const art = (file, alt, w = 640, h = 440, eager = false) =>
  `<img src="${root}art/${file}" alt="${alt}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
export const arrow = '<span aria-hidden="true">↗</span>'
export const cap = (s) => `<p class="eyebrow"><i></i>${s}</p>`
export const btn = (url, s, cls = 'button') =>
  `<a class="${cls}" href="${url}">${s}</a>`
export const crumb = (section) =>
  `<nav class="crumb" aria-label="Breadcrumb"><a href="${root}">Workshop</a><span aria-hidden="true">/</span>${section}</nav>`
export const plate = (
  file,
  alt,
  caption,
  n = '01',
  w = 640,
  h = 440,
  eager = false,
) =>
  `<figure class="plate">${art(file, alt, w, h, eager)}<figcaption><span>FIG. ${n} &nbsp; / &nbsp; ORIGINAL ILLUSTRATION</span><span>${caption}</span></figcaption></figure>`
const searchIcon =
  '<svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg>'
export function landing() {
  return `
<div class="home-top wrap"><div class="sectionline"><span>FIELD GUIDE &nbsp; / &nbsp; 01</span><span>CARY, NORTH CAROLINA</span></div>
<div class="home-hero"><div class="home-copy">${cap('The cable workshop')}<h1>A Dragon Cable<br>for the gear<br><em>you own.</em></h1>
<p class="intro">Start with the names on your headphones and amp. We’ll match the plugs at both ends.</p>
<form id="search-form" class="finder" role="search"><label for="model">What headphones are you connecting?</label><div class="searchbar">${searchIcon}<input id="model" type="search" placeholder="Try Focal Utopia 2022" autocomplete="off" aria-controls="matches"><button aria-label="Search models" type="submit">→</button></div><div id="matches" aria-label="Model matches" hidden></div><span class="sr" id="search-status" role="status"></span></form>
<div class="hero-actions">${btn(cableUrl('blue') + '?mode=expert', 'I know my connectors ' + arrow, 'textlink')} ${btn(cableUrl('blue'), 'Explore Blue Dragon →', 'textlink mutedlink')}</div></div>
<div class="hero-art">${plate('hero-cable.svg', 'Illustration of a blue headphone cable, two keyed earcup plugs and a straight 4.4 mm balanced plug.', 'BLUE DRAGON &nbsp; / &nbsp; 4.4 MM', '01', 880, 500, true)}
<div class="art-legend"><span><i class="dot blue"></i> Two earcup plugs</span><span><i class="dot brass"></i> One amplifier plug</span></div></div></div></div>
<section class="shelf"><div class="wrap"><div class="sectionline"><span>LISTENING NOTES</span><span>02 GUIDES &nbsp; / &nbsp; 01 HEADPHONE</span></div><h2>Where do you listen?</h2><div class="tiles">
${tile('01', 'At your desk', 'Build a MacBook desk setup', 'Headphones, cable and USB-C audio in one box.', paths.desk, 'meze-99.svg')}
${tile('02', 'Around the house', 'Find headphones for listening at home', 'Choose how much of the room you want to hear.', paths.home, 'meze-109.svg')}
${tile('03', 'On the sales floor', 'Meet Focal Utopia 2022', 'See the included cables and a fitted Dragon option.', productUrl(utopia), 'utopia.svg')}
</div></div></section>`
}
function tile(n, kicker, name, desc, href, img) {
  return `<a href="${href}" class="tile"><div class="tile-art">${art(img, '')}</div><div class="tile-copy"><span class="mono">${n} / ${kicker}</span><h3>${name}</h3><p>${desc}</p><span class="tile-arrow" aria-hidden="true">↗</span></div></a>`
}
export const policy = `<details class="notes"><summary>Returns, build time &amp; warranty</summary><p>Regular-price standard 5, 10, 15 and 20 ft cables are eligible for return within 30 days in like-new condition with all packaging. A 10% restocking fee applies ($25 minimum). Nonstandard plugs, off-menu lengths, other custom orders, open-box and sale items are final sale.</p><p>Workshop time comes before shipping. Rush prioritizes the build. Transit time is separate. No delivery date is quoted here.</p><p>Dragon cables have a one-year limited warranty for defects in materials or workmanship.</p><p><a href="${source.returns}" target="_blank" rel="noopener noreferrer">Full return policy ↗</a> &nbsp; <a href="${source.warranty}" target="_blank" rel="noopener noreferrer">Warranty terms ↗</a></p></details>`
export const shortPolicy =
  '<p class="policyline"><strong>Before you choose.</strong> Eligible standard cables have a 30-day return window with a 10% fee ($25 minimum). Custom plugs and off-menu lengths are final sale.</p>'
export function opt(value, label, current) {
  return `<option value="${value}"${value === current ? ' selected' : ''}>${label}</option>`
}
function field(id, label, opts, current) {
  return `<label class="field" for="${id}">${label}<select id="${id}" data-field="${id}">${opts.map(([v, n]) => opt(v, n, current)).join('')}</select></label>`
}
export const pricing = (b) => {
  const value = estimate(b)
  return value === null ? 'Fit check needed' : money(value)
}
export function parts(b) {
  return breakdown(b)
    .map(
      ([s, v]) =>
        `<div class="row"><span>${s}</span><strong>${money(v)}</strong></div>`,
    )
    .join('')
}
export function fitSummary(b) {
  return `<dl class="specs">
<div><dt>Headphones</dt><dd>${names.hp[b.hp]}</dd></div><div><dt>Earcup end</dt><dd>${ears(b)}</dd></div>
<div><dt>Amp / player</dt><dd>${names.amp[b.amp]}</dd></div><div><dt>Amp end</dt><dd>${names.jack[b.jack]}${complete(b) ? ' · ' + families[b.family].finish : ''}</dd></div>
<div><dt>Build</dt><dd>${b.feet} ft · ${families[b.family].finish} · ${b.rush ? 'Rush requested' : 'Standard processing'}</dd></div></dl>`
}
export function builderHero(b) {
  const f = families[b.family],
    prem = b.family === 'blue-premium',
    selected = b.hp === 'utopia',
    shelf = f.base ?? Math.min(...Object.values(f.prices))
  const productTitle = prem
    ? 'Blue Dragon <em>Premium.</em>'
    : b.family[0].toUpperCase() +
      b.family.slice(1) +
      ' Dragon <em>Universal.</em>'
  return `<div class="product-intro"><div>${cap(prem ? 'Dragon collection / Focal edition' : 'Dragon collection / Universal series')}<h1>${productTitle}</h1>
<p class="intro">Built in Cary with ${f.material} conductors, the plugs your gear needs and the length that reaches your chair.</p>
<div class="hero-price"><strong>${selected ? pricing(b) : 'From ' + money(shelf)}</strong><span>${selected ? 'Your Utopia fit · ' + b.feet + ' ft' + (b.rush ? ' · rush' : '') : f.base ? 'Starting price · before fit and length' : 'Utopia fit · ' + Object.keys(f.prices)[0] + ' ft'}</span></div>
${!selected && f.base ? `<p class="small">Utopia’s two earcup plugs bring the 5 ft build to ${money(f.prices[5])}. Length and optional rush change the total.</p>` : '<p class="small">The earcup fit, amp plug, length and optional rush determine your total.</p>'}
<div class="buttons"><a class="button" data-jump="builder" href="#configuration">${selected ? 'Choose your amp output' : 'Choose your headphones'} ↓</a><a class="textlink" data-help href="${paths.fit}">Get fit help ${arrow}</a></div></div>
<div class="product-plate">${plate(prem ? 'premium-detail.svg' : 'blue-detail.svg', prem ? 'Illustration of a rhodium 4.4 mm plug and the two Utopia earcup plugs.' : 'Illustration of the two-pin earcup connector and straight balanced amp plug.', prem ? 'RHODIUM FINISH' : b.family === 'blue' ? 'GOLD FINISH' : 'GOLD ENDS · BLUE EXAMPLE', '02', 760, 340, true)}</div></div>`
}
export function builderPanel(b) {
  const f = families[b.family],
    lengthPrices = Object.entries(f.prices)
  const hpField = b.expert
    ? field(
        'hp',
        'Headphone end',
        [
          ['', 'Choose the earcup plugs'],
          ['utopia', 'Two 2-pin LEMO plugs · Focal Utopia'],
          ['other', 'Another earcup fitting'],
        ],
        b.hp,
      )
    : field(
        'hp',
        'Headphone model',
        [
          ['', 'Choose your headphones'],
          ['utopia', 'Focal Utopia 2022'],
          ['other', 'My model is missing'],
        ],
        b.hp,
      )
  const ampField = b.expert
    ? b.amp === 'zen'
      ? '<p class="fit-note">Known amp · iFi ZEN DAC 3</p>'
      : ''
    : field(
        'amp',
        'Amp or player model',
        [
          ['', 'Choose your amp or player'],
          ['zen', 'iFi ZEN DAC 3'],
          ['other', 'Other / unsure'],
        ],
        b.amp,
      )
  const jacks = b.expert
    ? [
        ['', 'Choose your amplifier plug'],
        [
          b.amp === 'zen' ? 'front44' : 'direct44',
          b.amp === 'zen'
            ? 'Front 4.4 mm balanced · iFi headphone output'
            : 'Straight 4.4 mm balanced · headphone output',
        ],
        ['unknown', 'I need the jack identified'],
      ]
    : [
        ['', 'Choose the jack on your amp'],
        ['front44', 'Front 4.4 mm balanced headphone jack'],
        ['front63', 'Front 6.35 mm headphone jack · ask for a price'],
        ['rear44', 'Rear 4.4 mm line output'],
        ['unknown', 'Help me identify it'],
      ]
  if (b.expert && b.amp === 'zen' && ['front63', 'rear44'].includes(b.jack))
    jacks.push([b.jack, names.jack[b.jack] + ' · needs fit check'])
  const jackField =
    b.expert || b.amp === 'zen'
      ? field(
          'jack',
          b.expert ? 'Amplifier end' : 'Which headphone output?',
          jacks,
          b.jack,
        )
      : ''
  const warn =
    b.jack === 'rear44'
      ? 'This is a line output for another amplifier or active speakers. For headphones, use a front headphone jack.'
      : b.jack === 'front63'
        ? 'This headphone output is valid. Its plug price needs an advisor check.'
        : ''
  return `<div class="panel-head">${cap('01 / Fit the ends')}<h2 id="configuration" tabindex="-1">Configure your cable.</h2></div>
<div class="switch" aria-label="Configuration method"><button id="model-mode" data-mode="model" aria-pressed="${!b.expert}">By gear model</button><button id="expert-mode" data-mode="expert" aria-pressed="${b.expert}">I know my connectors</button></div>
${hpField}${b.hp === 'utopia' ? '<p class="fit-note"><span aria-hidden="true">✓</span> Matched to Utopia · two keyed 2-pin LEMO plugs, one for each earcup.</p>' : ''}
${ampField}<a class="inline-help" data-help href="${paths.fit}">Not sure which jack? Ask a cable advisor ${arrow}</a>${jackField}
${b.amp === 'zen' ? `<figure class="diagram">${art('zen-front.svg', 'Front panel of the iFi ZEN DAC 3. The far-right jack is the 4.4 mm balanced headphone output. The larger 6.35 mm jack sits immediately to its left.', 660, 235)}<figcaption>Front panel · Plug into the far-right 4.4 mm headphone jack. The rear 4.4 mm socket is a line output for other audio equipment.</figcaption></figure>` : ''}
${warn ? `<p class="notice">${warn}</p>` : ''}
<div class="rule"></div>${cap('02 / Length & finish')}
${field(
  'feet',
  'Cable length',
  lengthPrices.map(([ft, p]) => [
    ft,
    ft + ' ft' + (b.hp === 'utopia' ? ' · ' + money(p) : ''),
  ]),
  b.feet,
)}
<p class="fit-note">Plug finish · ${f.finish}. ${b.family === 'blue-premium' ? 'Rhodium is included in this Premium configuration.' : 'Straight gold is included in this Universal configuration.'}</p>
<label class="check"><input id="rush" data-field="rush" type="checkbox" ${b.rush ? 'checked' : ''}><span>Rush workshop processing <b>+${money(fees.rush)}</b><small>Optional. Shipping time is separate.</small></span></label>
<div class="rule"></div>${cap('03 / Review your build')}<div class="sumline"><h3>${complete(b) ? 'Your cable' : 'Build so far'}</h3><strong>${pricing(b)}</strong></div>
${parts(b)}${!complete(b) ? '<p class="small">Confirm both ends to add a cable. You can take an unfinished build to the cable desk.</p>' : ''}
${shortPolicy}<p id="build-error" class="error" role="alert" hidden></p>
<div class="buttons"><button id="add-cable" class="button">Add cable to bag</button><a class="textlink" data-help href="${paths.fit}">Product Questions ${arrow}</a></div>${policy}`
}
export function compare(b) {
  const comparable = { ...b, hp: 'utopia', feet: '15', rush: false }
  return `<section class="compare"><div>${cap('Same fit, same length')}<h2>Compare the Dragon families.</h2><p>All four prices include Utopia’s two LEMO plugs, a straight gold 4.4 mm amp plug and 15 ft of cable. Standard workshop processing.</p></div><div class="families">${Object.keys(
    families,
  )
    .filter((k) => k !== 'blue-premium')
    .map((k) => {
      const f = families[k]
      return `<a href="${cableUrl(k)}?fit=utopia&amp;length=15" data-family="${k}"><i class="swatch" style="--tint:${f.color}"></i><span><b>${f.name}</b><small>${f.material}</small></span><b>${money(price({ ...comparable, family: k }))}</b>${arrow}</a>`
    })
    .join('')}</div></section>`
}
export function cablePage(b) {
  return `<div class="wrap">${crumb('Dragon cables')}<div id="builder-hero">${builderHero(b)}</div><div class="builder-grid"><section class="buildcard" id="build-panel">${builderPanel(b)}</section><aside class="bench">${cap('Notes from the bench')}<h2>Made at the<br><em>Cary workshop.</em></h2><p>Each conductor is cut and soldered to its plug. The workshop inspects joints and checks electrical continuity, resistance, capacitance and inductance.</p><p>Choose the fit and reach first. Listening impressions are personal preferences. The one-year limited warranty covers manufacturing and material defects.</p><a class="textlink" target="_blank" rel="noopener noreferrer" href="${source.workshop}">Inside the workshop ${arrow}</a></aside></div><div id="compare">${compare(b)}</div></div>`
}
export function hardwareChoices(sku, option = 'included') {
  if (sku !== utopia) return ''
  return `<fieldset class="options"><legend>Choose your cable</legend><label class="choice"><input type="radio" name="attachment" value="included" ${option === 'included' ? 'checked' : ''}><span><strong>Use the included cables</strong><small>5 ft single-ended and 10 ft balanced XLR.</small></span><b>+$0</b></label>
<label class="choice"><input type="radio" name="attachment" value="silver" ${option === 'silver' ? 'checked' : ''}><span><strong>Add a Silver Dragon</strong><small>15 ft · Utopia LEMO · straight gold 4.4 mm. Adds reach and a balanced headphone plug the stock cables omit.</small></span><b>+${money(price(silverAttachment('00000000')))}</b></label></fieldset>`
}
export function productPage(sku) {
  const h = hardware[sku],
    isUt = sku === utopia,
    classic = sku === guide99
  const copy = isUt
    ? 'An open-back headphone with two listening cables in the case. Start with the supplied pair, or add the reach and plug your amp calls for.'
    : classic
      ? 'Walnut cups, a cushioned suspension headband and USB-C audio in the box. One purchase completes a MacBook desk setup.'
      : 'An open walnut cup with velour pads and a suspension headband. A good fit when you want the room to remain audible.'
  const box = isUt
    ? '<li>5 ft cable with a 3.5 mm plug</li><li>3.5-to-6.35 mm adapter</li><li>10 ft balanced cable with a four-pin XLR plug</li><li>Two-pin LEMO earcup plugs on both cables</li>'
    : classic
      ? '<li>Detachable 3.5 mm cable</li><li>USB-C DAC/amp for a compatible MacBook or phone</li>'
      : '<li>Two supplied cables, each ending in a 3.5 mm plug</li><li>Plug straight into a compatible 3.5 mm headphone jack</li>'
  return `<div class="wrap">${crumb('Headphones')}<div class="product-intro hardware"><div>${cap(isUt ? 'Focal / New headphones' : 'Meze Audio / New headphones')}<h1>${h.name}<em>.</em></h1><p class="intro">${copy}</p><div class="hero-price"><strong>${money(h.price)}</strong><span>New · ${h.profile}</span></div><a class="textlink" data-jump="purchase" href="#purchase">Choose your setup ↓</a></div>${plate(h.image, h.name + ' original product illustration.', h.profile, '03', 640, 440, true)}</div>
<div class="builder-grid"><section class="buildcard" id="purchase" tabindex="-1">${cap('On the sales floor')}<h2>Your ${isUt ? 'Utopia' : 'listening setup'}.</h2><h3>In the box</h3><ul class="box-list">${box}</ul>${hardwareChoices(sku)}<div id="attachment-confirm"></div>
<div class="sumline"><h3>Moon Audio merchandise</h3><strong id="hardware-total">${money(h.price)}</strong></div><p id="product-error" role="alert" class="error" hidden></p><div class="buttons"><button class="button" id="buy-hardware">Guest order review →</button><button class="outline" id="add-hardware">Add to bag</button></div><p class="fine">Demo checkout · before tax and shipping.</p></section>
<aside class="bench">${cap('Listening notes')}<h2>${isUt ? 'A cable for<br><em>your chair.</em>' : classic ? 'No separate<br><em>amp needed.</em>' : 'What’s your<br><em>phone port?</em>'}</h2><p>${isUt ? 'If you want a 4.4 mm plug and more room to move, explore Blue Premium with the correct Utopia earcup fitting already selected.' : classic ? 'The included USB-C DAC/amp converts your MacBook’s digital audio and supplies power to these 16-ohm headphones. The supplied cable finishes the connection.' : 'A compatible headphone jack accepts the supplied cable. A USB-C iPhone needs an adapter unless you already own one.'}</p>
${isUt ? btn(cableUrl('blue-premium') + '?fit=utopia', 'Explore Blue Premium for Utopia ' + arrow, 'textlink') : btn(classic ? paths.desk : paths.home, classic ? 'Read the desk guide ' + arrow : 'Compare complete setup prices ' + arrow, 'textlink')}</aside></div></div>`
}
export function deskGuide() {
  const h = hardware[guide99]
  return `<div class="wrap">${crumb('Listening guides')}<div class="guide-intro">${cap('Field notes / 01')}<h1>A first premium<br><em>MacBook desk.</em></h1><p class="intro">Your USB-C MacBook, one pair of headphones and the pieces that come in its box.</p></div><div class="guide-grid"><section class="buildcard">${cap('The short buying guide')}<h2>Follow the signal.</h2><ol class="guide-steps"><li><h3>Start with USB-C.</h3><p>Your MacBook sends the music as digital data.</p></li><li><h3>Convert it, then drive the headphones.</h3><p>A DAC converts digital music into an analog signal. An amp gives that signal the power to move the headphone drivers.</p></li><li><h3>Use the included pair.</h3><p>With the 16-ohm ${btn(productUrl(guide99), h.name, 'intext')}, the supplied USB-C DAC/amp handles both jobs. Plug the included 3.5 mm cable into it.</p></li></ol></section><article class="guide-product"><a href="${productUrl(guide99)}" aria-label="Open ${h.name}">${art(h.image, h.name + ' illustration')}</a><div>${cap('Complete desk setup')}<h2><a href="${productUrl(guide99)}">${h.name}</a></h2><div class="row"><span>Headphones from Moon Audio</span><b>${money(h.price)}</b></div><div class="row"><span>Supplied cable + USB-C DAC/amp</span><b>Included</b></div><div class="row"><span>Your USB-C MacBook</span><b>Already owned</b></div><div class="sumline"><b>Complete setup before tax</b><strong>${money(h.price)}</strong></div>${btn(productUrl(guide99), 'View this setup ' + arrow)}</div></article></div></div>`
}
export function roomGuide(room = 'open', port = 'usb') {
  const sku = room === 'open' ? guide109 : guide99,
    h = hardware[sku],
    extra = room === 'open' && port === 'usb' ? fees.usbAdapter : 0
  return `<div class="wrap">${crumb('Listening guides')}<div class="guide-intro">${cap('Field notes / 02')}<h1>Listening<br><em>at home.</em></h1><p class="intro">After a sound bath or at the end of the day, choose how much of your household you want to hear.</p></div><div class="guide-grid"><section class="buildcard">${cap('The room comes first')}<h2>Want to hear your household?</h2>
<div class="switch" aria-label="Room preference"><button id="open-cups" data-room="open" aria-pressed="${room === 'open'}">Yes, stay aware</button><button id="closed-cups" data-room="closed" aria-pressed="${room === 'closed'}">I prefer privacy</button></div>
<h3>Open cups · Meze 109 Pro</h3><p>Let room sounds in and let music leak out. Someone nearby may hear it. The 375 g frame uses velour pads and a suspension headband.</p>
<h3>Closed cups · Meze 99 Classics 2nd Gen</h3><p>Reduce sound leaking into the room and dampen outside sounds. The lighter 290 g frame has padded, leatherette-covered cushions. A headrest can press either pair forward when you recline.</p>
${field(
  'port',
  'What port will you listen through?',
  [
    ['usb', 'USB-C iPhone · I need an adapter if required'],
    ['jack', 'Compatible 3.5 mm headphone jack'],
    ['owned', 'USB-C iPhone · I own the Apple adapter'],
  ],
  port,
)}</section>
<article class="guide-product"><a href="${productUrl(sku)}" aria-label="Open ${h.name}">${art(h.image, h.name + ' illustration')}</a><div>${cap('Your complete setup')}<h2><a href="${productUrl(sku)}">${h.name}</a></h2><p>${room === 'open' ? 'The supplied 3.5 mm cable is enough for a compatible headphone jack.' : 'The supplied cable and USB-C DAC/amp cover both listening options.'}</p>
<div class="row"><span>Headphones from Moon Audio</span><b>${money(h.price)}</b></div><div class="row"><span>${extra ? 'Apple USB-C to 3.5 mm adapter · buy separately' : port === 'owned' ? 'USB-C adapter you own' : 'Additional adapter'}</span><b>${extra ? money(extra) : 'No added cost'}</b></div><div class="sumline"><b>Complete setup before tax</b><strong>${money(h.price + extra)}</strong></div>
${btn(productUrl(sku), 'View the headphones ' + arrow)}</div></article></div></div>`
}
