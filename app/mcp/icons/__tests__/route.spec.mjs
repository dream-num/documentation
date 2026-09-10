import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'

import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'

test('MCP clients discover, search and use existing icons over the Next.js HTTP route', async () => {
  const endpoint = new URL('/mcp/icons', process.env.DOCS_TEST_ORIGIN ?? 'http://localhost:3030')
  const client = new Client(
    { name: 'icons-regression', version: '1.0.0' },
    { versionNegotiation: { mode: { pin: '2026-07-28' } } },
  )
  try {
    await client.connect(new StreamableHTTPClientTransport(endpoint))
    const { tools } = await client.listTools()
    for (const name of ['search_icons', 'get_icon']) {
      assert(tools.some((tool) => tool.name === name && tool.annotations?.readOnlyHint))
    }
    const search = await client.callTool({ name: 'search_icons', arguments: { query: 'duplicate', group: 'single' } })
    assert(search.structuredContent.icons.some((icon) => icon.componentName === 'CopyIcon'))

    const filtered = await client.callTool({
      name: 'search_icons',
      arguments: { query: 'boards connector', subgroup: 'diagram', limit: 1 },
    })
    assert.equal(filtered.structuredContent.icons.length, 1)
    assert(
      filtered.structuredContent.icons.every((icon) => icon.products.includes('boards') && icon.subgroup === 'diagram'),
    )
    assert(filtered.structuredContent.truncated)

    const react = await client.callTool({ name: 'get_icon', arguments: { componentName: 'CopyIcon' } })
    assert.equal(react.structuredContent.importStatement, "import { CopyIcon } from '@univerjs/icons'")
    assert.match(react.structuredContent.example, /aria-hidden="true"/)
    const vue = await client.callTool({
      name: 'get_icon',
      arguments: { componentName: 'PaintBucketDoubleIcon', framework: 'vue' },
    })
    assert.match(vue.structuredContent.example, /<script setup>/)
    assert.match(vue.structuredContent.importStatement, /@univerjs\/icons-vue/)
    assert.match(vue.structuredContent.colors, /colorChannel1/)
    assert(vue.structuredContent.source.commit)

    const missing = await client.callTool({ name: 'get_icon', arguments: { componentName: 'InventedIcon' } })
    assert(missing.isError)
    const empty = await client.callTool({ name: 'search_icons', arguments: { query: 'nonexistent-icon-xyz' } })
    assert.equal(empty.structuredContent.total, 0)
    const invalid = await client.callTool({ name: 'search_icons', arguments: { query: 'copy', limit: 1000 } })
    assert(invalid.isError)

    const forbidden = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' },
      body: '{}',
    })
    assert.equal(forbidden.status, 403)
    const malformed = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: '{',
    })
    assert.equal(malformed.status, 400)
    assert.match(malformed.headers.get('content-type'), /application\/json/)
    assert.equal((await fetch(endpoint)).status, 405)
  } finally {
    await client.close()
  }
})
