import assert from 'node:assert/strict'
import { test } from 'node:test'

// Run with the documentation development server on port 3030.
test('document links mark external destinations while leaving internal links unmarked', async () => {
  const response = await fetch('http://localhost:3030/zh-CN/server/license')
  assert.equal(response.status, 200)
  const html = await response.text()
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)]
  const external = links.filter(([, href]) => href.startsWith('https://univer.ai'))
  const internal = links.filter(([, href]) => href === '/zh-CN/server')

  assert.ok(external.length > 0, 'the article must link to the licensing site')
  assert.ok(internal.length > 0, 'the article must link to the local server guide')
  for (const [, href, body] of external) {
    assert.match(body, /lucide-external-link/, `${href} must have an external-link icon`)
    assert.match(body, /aria-hidden="true"/, 'the decorative icon must be hidden from assistive technology')
  }
  for (const [, , body] of internal) {
    assert.doesNotMatch(body, /lucide-external-link/)
  }
})
