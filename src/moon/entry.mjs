import { header, keys, saveSession } from './state.mjs'

const main = document.querySelector('main')
const route = main.dataset.route
const menu = document.querySelector('.navmenu')
const search = document.getElementById('search-form')
const model = document.getElementById('model')
const matches = document.getElementById('matches')
const staticEntry = route === '' || route === 'guides/desk'

let searchRevision = 0
let finder
async function showResults(showAll = false) {
  const revision = ++searchRevision
  const query = model.value.trim()
  matches.hidden = !query && !showAll
  if (matches.hidden) {
    matches.innerHTML = ''
    document.getElementById('search-status').textContent = ''
    return
  }
  try {
    finder ||= import('./finder.mjs')
    const { results } = await finder
    if (revision !== searchRevision) return
    matches.innerHTML = results(query)
    document.getElementById('search-status').textContent =
      matches.querySelectorAll('a').length + ' choices shown'
    if (showAll) matches.querySelector('a')?.focus()
  } catch {
    matches.innerHTML =
      '<a class="result" href="/moon/match/">Open the cable finder →</a>'
    finder = null
  }
}
search?.addEventListener('submit', (event) => {
  event.preventDefault()
  showResults(true)
})
model?.addEventListener('focus', () => {
  finder ||= import('./finder.mjs')
  finder.catch(() => {
    finder = null
  })
})
model?.addEventListener('input', () => showResults())
matches?.addEventListener('click', (e) => {
  if (e.target.closest('[data-unlisted]'))
    saveSession(
      'moon.match.unknown.1',
      JSON.stringify({ term: model.value.trim().slice(0, 160), hash: '#m1' }),
    )
})
document.querySelector('.skip').addEventListener('click', (event) => {
  event.preventDefault()
  main.focus()
})
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return
  if (matches && !matches.hidden) {
    searchRevision++
    matches.hidden = true
    if (search.contains(event.target)) model.focus()
  }
  if (menu.open) {
    menu.open = false
    menu.querySelector('summary').focus()
  }
})
document.addEventListener('click', (event) => {
  if (menu.open && !menu.contains(event.target)) menu.open = false
})
if (staticEntry) {
  main.dataset.ready = 'true'
  header()
  window.addEventListener('pageshow', () => header())
  window.addEventListener('storage', (e) => {
    if (e.key === keys.bag) header()
  })
} else {
  main.inert = true
  const loaded =
    route === 'match' || route === 'match/directory'
      ? import('./matcher/ui.mjs')
      : route === 'match/help'
        ? import('./matcher/help.mjs').then(({ mountHelp }) => {
            header()
            mountHelp(main)
            main.dataset.ready = 'true'
            main.inert = false
            delete document.documentElement.dataset.restoring
          })
        : import('./app.mjs')
  loaded.catch((error) => {
    console.error('Workshop initialization failed', error)
    main.inert = false
    delete document.documentElement.dataset.restoring
    const msg = document.createElement('p')
    msg.className = 'wrap notice'
    msg.textContent =
      'The workshop controls could not load. Refresh before configuring a build.'
    main.prepend(msg)
  })
}
