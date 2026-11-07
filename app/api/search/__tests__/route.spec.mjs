import assert from 'node:assert/strict'
import { test } from 'node:test'

const site = process.env.TEST_SITE_URL

test('search indexes remain isolated by locale and preserve reference member links', { skip: !site }, async () => {
  await Promise.all(
    ['en-US', 'zh-CN'].map(async (locale) => {
      const url = new URL('/api/search', site)
      url.search = new URLSearchParams({ locale, scope: 'reference', query: 'createWorkbook' }).toString()
      const response = await fetch(url)
      assert.equal(response.status, 200)
      const results = await response.json()
      assert.ok(results.some((result) => result.title.endsWith('.createWorkbook') && result.url.includes('#')))
      assert.equal(results[0].breadcrumbs[0], locale === 'en-US' ? 'API Reference' : 'API 参考')
      const prefix = '/reference/'
      assert.ok(results.every((result) => result.source === 'reference' && result.url.startsWith(prefix)))

      const repeated = await fetch(url)
      assert.deepEqual(await repeated.json(), results)
    }),
  )
})

test('search retains empty-query and oversized-query validation', { skip: !site }, async () => {
  const empty = await fetch(new URL('/api/search?query=', site))
  assert.equal(empty.status, 200)
  assert.deepEqual(await empty.json(), [])
  const oversized = await fetch(new URL(`/api/search?query=${'a'.repeat(201)}`, site))
  assert.equal(oversized.status, 400)
})
