import {
  root,
  paths,
  hardware,
  families,
  fees,
  money,
  catalogDate,
  productUrl,
  cableUrl,
  ears,
  names,
  estimate,
  complete,
  price,
  linePrice,
  pack,
  silverAttachment,
} from './catalog.mjs'
import {
  art,
  arrow,
  btn,
  cap,
  crumb,
  pricing,
  parts,
  fitSummary,
} from './shop.mjs'

export function invalidLink() {
  return `<section class="wrap single">${cap('Build link')}<h1>This link needs<br><em>a fresh copy.</em></h1><p>The saved build is incomplete, invalid or uses a different price list. Ask for the original link or start a new fit check.</p>${btn(root, 'Return to the workshop →')}</section>`
}
export const buildCode = (b) => `MW-${b.id.slice(0, 4)}-${b.id.slice(4)}`
const sampleImages = [
  {
    bit: 1,
    src: 'utopia.svg',
    name: 'Headphone earcups',
    alt: 'Utopia headphone sample',
    w: 640,
    h: 440,
  },
  {
    bit: 2,
    src: 'zen-front.svg',
    name: 'Amplifier front panel',
    alt: 'ZEN DAC 3 front-panel sample',
    w: 660,
    h: 235,
  },
]
function photoPicker(b) {
  return `<fieldset class="photo-picker"><legend>Choose example gear photos</legend><p class="small">Two local illustration cards stand in for gear photos. Choose either or both.</p><div>${sampleImages.map((p) => `<label class="photo"><span>${art(p.src, p.alt, p.w, p.h)}</span><span><input type="checkbox" data-photo="${p.bit}" ${b.photos & p.bit ? 'checked' : ''}>${p.name}</span></label>`).join('')}</div></fieldset>`
}
function photos(b) {
  return b.photos
    ? `<div class="thumbs">${sampleImages
        .filter((p) => p.bit & b.photos)
        .map(
          (p) =>
            `<figure>${art(p.src, p.alt, p.w, p.h)}<figcaption>${p.name}</figcaption></figure>`,
        )
        .join('')}</div>`
    : '<p class="small">No example photos attached.</p>'
}
export function ticket(b) {
  return `<article class="ticket"><div class="ticket-top"><span class="mono">BUILD CARD</span><span class="code">${buildCode(b)}</span></div><h2>${families[b.family].name}</h2><p class="ticket-sub">${b.feet} ft &nbsp;·&nbsp; ${families[b.family].finish} &nbsp;·&nbsp; ${b.rush ? 'Rush requested' : 'Standard processing'}</p>
<div class="sumline"><span>${complete(b) ? 'Merchandise total' : 'Partial estimate'}</span><strong>${pricing(b)}</strong></div>${fitSummary(b)}${parts(b)}
${!complete(b) ? '<p class="small">Final fit and price depend on confirming the headphone output.</p>' : ''}</article>`
}
export function fitView(b, open, receipt = '') {
  return `<div class="wrap">${crumb('Audio Concierge')}<div class="service-heading">${cap('Consumer fit advice / Cary cable desk')}<h1>Let’s check <em>the fit.</em></h1><p class="intro">Bring the two names on your gear, or let a cable advisor identify the jack. Your choices travel with the request.</p></div>
<div class="service-grid"><section class="buildcard"><div class="desk-indicator"><i class="${open ? 'on' : ''}"></i>${open ? 'Desk open' : 'After hours'} · sample staffing</div><h2>${open ? 'Talk through your build.' : 'Leave your build with the desk.'}</h2>
<p><strong>Sample desk hours</strong> · Mon–Fri, 10 am–6 pm Eastern Time. Real advisor coverage and response times are unverified.</p>
${open ? `<div class="channel"><h3>Call a cable advisor</h3><p>Use build code <b class="code">${buildCode(b)}</b> so the advisor can pick up where you left off.</p><button class="button" data-contact="call">Try a demo call</button></div>` : ''}
<div class="channel"><h3>Send a photo for fit advice</h3><p>Show the earcups and the panel with the headphone socket.</p>${photoPicker(b)}<button class="outline" data-contact="photos">Share sample photos</button></div>
<div class="channel"><h3>Request a callback</h3><label class="field" for="slot">Sample weekday slot · Eastern Time<select id="slot"><option>Next weekday · 10 am ET</option><option>Next weekday · 2 pm ET</option></select></label><button class="outline" data-contact="callback">Request demo callback</button></div>
<p class="fine">Calls, photo messages and callbacks run locally. No contact details are collected.</p><p id="fit-error" class="error" role="alert" hidden></p><div id="receipt" role="status" tabindex="-1">${receipt}</div></section>
<aside>${ticket(b)}<a class="textlink" href="${cableUrl(b.family) + pack(b)}">Continue configuring this build ${arrow}</a></aside></div></div>`
}
export function advisorView(b, request) {
  if (!b)
    return `<section class="wrap single">${cap('Sample advisor workspace')}<h1>The cable <em>desk.</em></h1><p>Submit a local demo call, photo review or callback first. The shopper’s saved build will appear here.</p>${btn(paths.fit, 'Open consumer fit help →')}</section>`
  return `<div class="wrap">${crumb('Advisor workspace')}<div class="service-heading">${cap('Sample advisor workspace')}<h1>Check the <em>output.</em></h1><p class="intro">Original customer build · ${buildCode(b)}</p></div><div class="service-grid"><section>${ticket(b)}<div class="buildcard after"><h3>Attached example photos</h3>${photos(b)}${request ? `<p class="small">Channel · ${request}</p>` : ''}</div></section><section class="buildcard">
${cap('Advisor fit check')}<h2>Return a priced quote.</h2><p>Confirm the shopper’s equipment and the actual headphone socket. The rear line output is for connecting other equipment.</p>
<label class="field" for="confirm-hp">Headphone earcups<select id="confirm-hp"><option value="">Confirm the headphones</option><option value="utopia">Focal Utopia 2022 · two 2-pin LEMO plugs</option></select></label>
<label class="field" for="confirm-jack">Verified headphone output<select id="confirm-jack"><option value="">Select the confirmed output</option><option value="front44">iFi ZEN DAC 3 · front 4.4 mm balanced</option><option value="direct44">Verified 4.4 mm balanced headphone jack by connector</option></select></label>
<p id="advisor-error" class="error" role="alert" hidden></p><button id="issue" class="button">Create editable demo quote →</button><div id="quote-result" role="status" tabindex="-1"></div></section></div></div>`
}
export function quoteResult(b) {
  const url = paths.quote + pack(b, 'quote')
  return `<div class="success"><span class="mono">QUOTE READY · ${buildCode(b)}</span><p><strong>${money(price(b))}</strong> · Both ends and workshop options travel with this link.</p><div class="buttons">${btn(url, 'Open returned quote →')}<button class="outline" id="copy-quote" data-url="${url}">Copy quote link</button></div><label class="field" for="quote-address">Portable quote link<input id="quote-address" readonly></label></div>`
}
export function quoteView(b) {
  if (!b) return invalidLink()
  return `<div class="wrap quote-page">${crumb('Advisor-checked quote')}<div class="quote-heading">${cap('Returned by the sample cable desk')}<h1>Your checked <em>quote.</em></h1><p>Both ends are matched. Your build is ready to edit or add to the demo bag.</p></div>${ticket(b)}<div class="buttons"><button class="button" id="accept-quote">Add this quote to bag →</button>${btn(cableUrl(b.family) + pack(b), 'Edit this build ' + arrow, 'outline')}</div><p id="quote-error" class="error" role="alert" hidden></p><p class="fine">USD merchandise · ${catalogDate} · demo quote</p></div>`
}
export function presenter(open, request) {
  return `<div class="wrap single">${cap('Presenter controls / Local demo')}<h1>Workshop <em>controls.</em></h1><section class="buildcard"><h2>Sample staffing</h2><p>Mon–Fri, 10 am–6 pm Eastern Time. This switch changes the sample desk in this browser.</p><div class="switch"><button data-roster="open" aria-pressed="${open}">Desk open</button><button data-roster="closed" aria-pressed="${!open}">After hours</button></div><div class="channel"><h3>Latest fit request</h3>${request ? `<p>Build ${buildCode(request)} · ${families[request.family].name}</p>${btn(paths.advisor + pack(request, 'request'), 'Open local advisor view →')}` : '<p>Try a sample call, photo review or callback to create a request.</p>'}</div><div class="buttons">${btn(root, 'Enter shopper experience ' + arrow, 'outline')}${btn(paths.fit, 'Open Audio Concierge ' + arrow, 'textlink')}</div></section></div>`
}
export function cartView(lines, review = false, broken = false) {
  const heading = review
    ? 'Guest order <em>review.</em>'
    : 'Your workshop <em>bag.</em>'
  const title = `<div class="wrap bag-page">${crumb(review ? 'Guest review' : 'Shopping bag')}<div class="service-heading">${cap(review ? 'Final step / Local review' : 'Your selections')}<h1>${heading}</h1></div>`
  if (broken)
    return (
      title +
      `<div class="buildcard"><h2>A saved item needs another look.</h2><p>The saved bag uses an unknown or invalid configuration. Clear it to start again. Order review is unavailable for these items.</p><button id="clear-bag" class="outline">Clear invalid bag</button></div></div>`
    )
  if (!lines.length)
    return (
      title +
      `<div class="buildcard"><h2>Your bag is empty.</h2><p>Start with the names on your gear. Your finished build will appear here.</p>${btn(root, 'Find my cable →')}</div></div>`
    )
  const total = lines.reduce((v, l) => v + linePrice(l), 0)
  return (
    title +
    `<div class="bag-grid"><div>${lines
      .map((l) => {
        const b = l.kind === 'cable' ? l.build : null,
          h = b ? null : hardware[l.sku]
        const url = b
          ? cableUrl(b.family) + pack(b)
          : productUrl(l.sku) + '?edit=' + l.id
        return `<article class="bag-item"><div class="bag-item-head"><span class="mono">${b ? 'CABLE BUILD' : 'NEW HEADPHONES'}</span><span class="code">${buildCode(l)}</span></div><div class="bag-name"><h2>${b ? families[b.family].name : h.name}</h2><strong>${money(b ? price(b) : h.price)}</strong></div>${b ? `<p>${b.feet} ft · ${families[b.family].finish} · ${b.rush ? 'Rush requested' : 'Standard processing'}</p>${fitSummary(b)}${parts(b)}` : `<p>Includes the factory cables and supplied accessories.</p>${l.option === 'silver' ? `<div class="attachment"><b>Silver Dragon Universal</b><strong>+${money(price(silverAttachment(l.id)))}</strong><p>15 ft · two 2-pin LEMO earcup plugs · straight gold 4.4 mm balanced headphone plug · standard processing</p></div>` : ''}`}
 <div class="buttons">${btn(url, b ? 'Edit cable build' : 'Edit headphone setup', 'textlink')}${!review ? `<button class="linkbutton" data-remove="${l.id}">Remove</button>` : ''}</div></article>`
      })
      .join('')}</div>
 <aside class="buildcard bag-total">${cap(review ? 'Guest review' : 'Merchandise summary')}<div class="sumline"><h3>Subtotal</h3><strong>${money(total)}</strong></div><p class="small">USD merchandise before tax and shipping. Prices dated ${catalogDate}.</p>
 ${review ? `<p class="fit-note">✓ Local guest review reached. No payment or shipping information is collected and no order is placed.</p>${btn(paths.cart, 'Back to bag', 'outline')}` : btn(paths.review, 'Continue to guest review →')}
 </aside></div></div>`
  )
}
