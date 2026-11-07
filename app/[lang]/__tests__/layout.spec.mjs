import assert from 'node:assert/strict'
import { test } from 'node:test'

// Run against a production server with TEST_SITE_URL=http://localhost:3031 node --test.
const site = process.env.TEST_SITE_URL

test('cached documents use the URL locale regardless of the visitor cookie or platform', { skip: !site }, async () => {
  await Promise.all(
    ['zh-CN', 'ja-JP'].map(async (locale) => {
      const url = new URL(`/${locale}/overview`, site)
      const first = await fetch(url, { headers: { cookie: 'FD_LOCALE=en-US', 'user-agent': 'Macintosh' } })
      assert.equal(first.status, 200)
      assert.match(await first.text(), new RegExp(`<html[^>]*lang="${locale}"`))

      const cached = await fetch(url, { headers: { cookie: 'FD_LOCALE=fr-FR', 'user-agent': 'Windows' } })
      assert.equal(cached.status, 200)
      assert.equal(cached.headers.get('x-nextjs-cache'), 'HIT')
      assert.match(await cached.text(), new RegExp(`<html[^>]*lang="${locale}"`))
    }),
  )
})

test('unknown documents still return a not-found response', { skip: !site }, async () => {
  const response = await fetch(new URL('/zh-CN/overview/nonexistent-performance-test', site))
  assert.equal(response.status, 404)
  assert.match(await response.text(), /Page Not Found/)
})

test('missing static assets do not enter a document route with an invalid locale', { skip: !site }, async () => {
  const response = await fetch(new URL('/_next/static/nonexistent-performance-test.js', site), { redirect: 'manual' })
  assert.equal(response.status, 404)
})
