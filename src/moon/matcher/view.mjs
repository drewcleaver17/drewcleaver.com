import { paths } from '../catalog.mjs'
import { crumb, cap } from '../shop.mjs'
export const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  )
export const external = (url, label, cls = 'textlink') => {
  try {
    if (new URL(url).protocol !== 'https:') return ''
    return (
      '<a class="' +
      cls +
      '" href="' +
      esc(url) +
      '" target="_blank" rel="noopener noreferrer">' +
      esc(label) +
      ' <span aria-hidden="true">↗</span></a>'
    )
  } catch {
    return ''
  }
}
export function matcherShell(directory = false) {
  return `<div class="wrap matcher">${crumb(directory ? 'Equipment directory' : 'Cable finder')}
<header class="match-heading"><div>${cap('Dragon Cable finder')}<h1>${directory ? 'Equipment <em>directory.</em>' : 'What are you <em>connecting?</em>'}</h1>
<p class="intro">${directory ? 'Look up a model, check its documented connections, or carry it to the cable desk.' : 'Start with the names on your gear. See the cable, the two plugs and the references for your fit.'}</p></div>
<a class="textlink" href="${directory ? paths.match : paths.match + 'directory/'}">${directory ? 'Open the cable finder' : 'Browse equipment'} ↗</a></header>
<div id="match-work"><p role="status">Opening the equipment index…</p></div>
<p class="sr" role="status" aria-live="polite" id="match-status"></p></div>`
}
