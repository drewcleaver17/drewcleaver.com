import { paths, pack, unpack, cableUrl, validLine } from './catalog.mjs'
export const keys = {
  bag: 'moon.bag.1',
  draft: 'moon.active.1',
  request: 'moon.request.1',
  desk: 'moon.desk.1',
}
export function getSession(key) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}
export function getLocal(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
export function saveSession(key, value) {
  try {
    sessionStorage.setItem(key, value)
  } catch {}
}
export function readBag() {
  const raw = getLocal(keys.bag)
  if (!raw) return []
  try {
    const items = JSON.parse(raw)
    return Array.isArray(items) &&
      items.every(validLine) &&
      new Set(items.map((x) => x.id)).size === items.length
      ? items
      : null
  } catch {
    return null
  }
}
export function header(build) {
  const bag = readBag()
  document
    .querySelectorAll('[data-bag-count]')
    .forEach((el) => (el.textContent = bag ? String(bag.length) : '!'))
  const current = build || unpack(getSession(keys.draft) || '', 'build')
  if (current) {
    document
      .querySelectorAll('[data-help]')
      .forEach((el) => (el.href = paths.fit + pack(current)))
    document.querySelectorAll('[data-expert]').forEach((el) => {
      el.href = cableUrl(current.family) + '?mode=expert' + pack(current)
    })
  }
}
