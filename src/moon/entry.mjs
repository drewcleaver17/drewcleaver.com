import { header, keys } from './state.mjs'
import { results } from './finder.mjs'

const main = document.querySelector('main')
const route = main.dataset.route
const menu = document.querySelector('.navmenu')
const search = document.getElementById('search-form')
const model = document.getElementById('model')
const matches = document.getElementById('matches')
const staticEntry = route === '' || route === 'guides/desk'

function showResults(showAll = false) {
  const query = model.value.trim()
  matches.hidden = !query && !showAll
  matches.innerHTML = matches.hidden ? '' : results(query)
  document.getElementById('search-status').textContent = matches.hidden
    ? ''
    : matches.querySelectorAll('a').length + ' choices shown'
}
search?.addEventListener('submit', (event) => {
  event.preventDefault()
  showResults(true)
  matches.querySelector('a')?.focus()
})
model?.addEventListener('input', () => showResults())
document.querySelector('.skip').addEventListener('click', (event) => {
  event.preventDefault()
  main.focus()
})
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return
  if (matches && !matches.hidden) {
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
  import('./app.mjs').catch(() => {
    main.inert = false
    delete document.documentElement.dataset.restoring
    const msg = document.createElement('p')
    msg.className = 'wrap notice'
    msg.textContent =
      'The workshop controls could not load. Refresh before configuring a build.'
    main.prepend(msg)
  })
}
