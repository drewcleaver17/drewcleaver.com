import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, relative, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { routes } from './catalog.mjs'

const dist = fileURLToPath(new URL('../../dist/', import.meta.url))
const text = (filename) => readFileSync(join(dist, filename), 'utf8')
test('Every workshop route is a standalone, noindex static document with local interaction assets', () => {
  for (const route of routes) {
    const path = '/moon/' + (route ? route + '/' : '')
    const html = text(path.slice(1) + 'index.html')
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/)
    assert.ok(html.includes('href="https://drewcleaver.com' + path + '"'))
    assert.match(html, /Independent concept by Drew Cleaver/)
    assert.doesNotMatch(
      html,
      /<form[^>]+action=|href="(?:sms|tel|mailto):|googletagmanager|analytics\.js/i,
    )
    for (const match of html.matchAll(
      /(?:src|href)="(\/(?:_astro|moon)\/[^"#?]+)(?:[?#][^"]*)?"/g,
    )) {
      const rel = match[1].slice(1)
      assert.ok(
        readFileSync(join(dist, rel.endsWith('/') ? rel + 'index.html' : rel))
          .length > 0,
        'Missing ' + rel,
      )
    }
  }
})
test('Outside the workshop, the sitemap, feeds, search files and HTML have no workshop destinations', () => {
  assert.ok(text('sitemap.xml').includes('https://drewcleaver.com/about/'))
  assert.doesNotMatch(
    text('index.html'),
    /<meta name="robots" content="noindex/,
  )
  let count = 0
  for (const item of readdirSync(dist, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!item.isFile()) continue
    const file = relative(resolve(dist), join(item.parentPath, item.name))
    if (
      file.startsWith('moon/') ||
      !/(?:\.html?|\.xml|(?:search|feed|rss)[^/]*\.json)$/i.test(file)
    )
      continue
    assert.doesNotMatch(
      text(file),
      /(?:href=["'](?:https?:\/\/drewcleaver\.com)?\/moon(?:\/|["'?#])|https?:\/\/drewcleaver\.com\/moon(?:\/|<))/i,
      file,
    )
    count++
  }
  assert.ok(count > 100)
})
