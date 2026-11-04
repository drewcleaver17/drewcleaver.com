import {
  families,
  hardware,
  utopia,
  guide99,
  guide109,
  paths,
  productUrl,
  cableUrl,
  money,
} from './catalog.mjs'
const searchItems = [
  {
    terms: 'focal utopia focal utopia 2022 headphone headphones',
    key: 'headphone',
    name: hardware[utopia].name,
    desc: 'Headphones · ' + money(hardware[utopia].price),
    href: productUrl(utopia),
  },
  {
    terms:
      'focal utopia focal utopia 2022 blue dragon universal cable ifi zen dac 3',
    key: 'cable',
    name: 'Blue Dragon for Focal Utopia',
    desc: 'Compatible cable · 5 ft from ' + money(families.blue.prices[5]),
    href: cableUrl('blue') + '?fit=utopia',
  },
  ...[guide99, guide109].map((sku) => ({
    terms: hardware[sku].name.toLowerCase() + ' headphones',
    key: 'headphone',
    name: hardware[sku].name,
    desc: hardware[sku].profile + ' · ' + money(hardware[sku].price),
    href: productUrl(sku),
  })),
]
export function results(query) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const list = searchItems.filter((p) =>
    terms.every((t) => p.terms.includes(t)),
  )
  if (!list.length)
    return `<p class="small">That model needs a fit check.</p><a class="result" href="${paths.fit}">Ask a cable advisor ↗</a>`
  return list
    .map(
      (p) =>
        `<a class="result" href="${p.href}"><span><strong>${p.name}</strong><small>${p.desc}</small></span><span aria-hidden="true">↗</span></a>`,
    )
    .join('')
}
