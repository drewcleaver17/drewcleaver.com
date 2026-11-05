import {
  hardware,
  utopia,
  guide99,
  guide109,
  paths,
  productUrl,
  cableUrl,
  money,
  families,
} from './catalog.mjs'
import { searchGear, entryUrl } from './matcher/directory.mjs'
import { esc } from './matcher/view.mjs'
const demoPages = new Map([
  [utopia, utopia],
  ['meze-99-classics-2nd-gen', guide99],
  [guide109, guide109],
])
function result(href, title, desc) {
  return (
    '<a class="result" href="' +
    esc(href) +
    '"><span><strong>' +
    esc(title) +
    '</strong><small>' +
    esc(desc) +
    '</small></span><span aria-hidden="true">↗</span></a>'
  )
}
export function results(query) {
  const hits = searchGear(query)
  if (!hits.length)
    return (
      '<p class="small">That model needs a fit check.</p><a data-unlisted class="result" href="' +
      paths.match +
      'help/#m1">Ask a cable advisor ↗</a>'
    )
  const top = hits[0]
  const exactDemo = demoPages.get(top.id)
  const isExact =
    query.trim() &&
    (top.name.toLowerCase() === query.trim().toLowerCase() ||
      (top.aliases || []).some(
        (x) => x.toLowerCase() === query.trim().toLowerCase(),
      ))
  if (exactDemo && isExact) {
    const h = hardware[exactDemo]
    return (
      result(productUrl(exactDemo), h.name, 'Headphones · ' + money(h.price)) +
      '<a class="match-more" href="' +
      esc(entryUrl(top)) +
      '">Match ' +
      esc(h.name) +
      ' to my amp →</a>' +
      (exactDemo === utopia
        ? result(
            cableUrl('blue') + '?fit=utopia',
            'Blue Dragon for Focal Utopia',
            'Compatible cable · 5 ft from ' + money(families.blue.prices[5]),
          )
        : '')
    )
  }
  return (
    hits
      .slice(0, 6)
      .map((g) =>
        result(
          entryUrl(g),
          g.name,
          g.listener?.fit ||
            (g.player?.outputs.length
              ? 'See headphone jacks and cables'
              : g.canSend || g.canReceive
                ? 'Find a component connection'
                : 'See listing and fit information'),
        ),
      )
      .join('') +
    '<a class="match-more" href="' +
    paths.match +
    'directory/">Browse the equipment directory →</a>'
  )
}
