import assert from 'node:assert/strict'
import { test } from 'node:test'

const site = process.env.TEST_SITE_URL

test('on-demand Markdown preserves its content, language and digest when cached', { skip: !site }, async () => {
  const url = new URL('/zh-CN/overview.md', site)
  const first = await fetch(url)
  assert.equal(first.status, 200)
  assert.equal(first.headers.get('content-language'), 'zh-CN')
  assert.match(first.headers.get('content-type'), /^text\/markdown/)
  const markdown = await first.text()
  assert.match(markdown, /^# /)
  assert.match(markdown, /Agent Markdown:/)

  const cached = await fetch(url)
  assert.equal(cached.headers.get('x-nextjs-cache'), 'HIT')
  assert.equal(cached.headers.get('etag'), first.headers.get('etag'))
  assert.equal(await cached.text(), markdown)
})

test('unknown Markdown remains a 404', { skip: !site }, async () => {
  const response = await fetch(new URL('/zh-CN/overview/nonexistent-performance-test.md', site))
  assert.equal(response.status, 404)
  assert.equal(await response.text(), 'Not Found\n')
})
