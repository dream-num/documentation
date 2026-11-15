import assert from 'node:assert/strict'
import { test } from 'node:test'

const site = process.env.TEST_SITE_URL
let requestId = 0

async function rpc(method, params) {
  const id = ++requestId
  const response = await fetch(new URL('/mcp/docs', site), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  })
  const body = await response.text()
  assert.equal(response.status, 200, body)
  const messages = response.headers.get('content-type').includes('text/event-stream')
    ? body
        .split('\n')
        .filter((line) => line.startsWith('data: '))
        .map((line) => JSON.parse(line.slice(6)))
    : [JSON.parse(body)]
  const message = messages.find((item) => item.id === id)
  assert.ok(message, body)
  return message
}

async function callTool(name, args) {
  const message = await rpc('tools/call', { name, arguments: args })
  assert.equal(message.error, undefined, JSON.stringify(message.error))
  return message.result
}

test('SDK MCP initializes and exposes callable read-only development tools', { skip: !site }, async () => {
  const initialized = await rpc('initialize', {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'documentation-tests', version: '1.0.0' },
  })
  assert.equal(initialized.result.serverInfo.name, 'univer-docs')
  assert.ok(initialized.result.capabilities.tools)
  const listed = await rpc('tools/list', {})
  for (const name of ['search_docs', 'get_doc', 'list_features', 'generate_setup']) {
    const tool = listed.result.tools.find((item) => item.name === name)
    assert.ok(tool, `Missing public tool ${name}`)
    assert.equal(tool.annotations.readOnlyHint, true)
  }
})

test('API search results can be read through MCP and match published Markdown', { skip: !site }, async () => {
  await Promise.all(
    ['en-US', 'zh-CN'].map(async (locale) => {
      const search = await callTool('search_docs', { query: 'createWorkbook', scope: 'reference', locale, limit: 3 })
      assert.equal(search.isError, undefined)
      const result = search.structuredContent.results.find((item) => item.title.endsWith('.createWorkbook'))
      assert.ok(result)
      assert.match(result.path, /^\/reference\/.*#/)
      assert.equal(new URL(result.url).pathname.startsWith('/zh-CN/'), locale === 'zh-CN')
      const page = await callTool('get_doc', { path: result.path, locale, lineCount: 40 })
      assert.equal(page.isError, undefined)
      const markdownUrl = new URL(page.structuredContent.markdownUrl)
      const published = await fetch(new URL(markdownUrl.pathname, site))
      assert.equal(published.status, 200)
      const lines = (await published.text()).trimEnd().split('\n')
      assert.equal(page.structuredContent.markdown, lines.slice(0, 40).join('\n'))
      assert.equal(page.structuredContent.totalLines, lines.length)
    }),
  )
})

test(
  'default search discovers integration guidance across the documentation collections',
  { skip: !site },
  async () => {
    const search = await callTool('search_docs', { query: 'Next.js' })
    assert.equal(search.isError, undefined)
    const result = search.structuredContent.results.find((item) => item.path.includes('/integrations/nextjs'))
    assert.ok(result)
    const page = await callTool('get_doc', { path: result.path })
    assert.equal(page.isError, undefined)
    assert.match(page.structuredContent.markdown, /ssr: false/)
  },
)

test('Markdown pagination preserves the entire localized page without gaps', { skip: !site }, async () => {
  const first = await callTool('get_doc', { path: '/overview/mcp.md', locale: 'zh-CN', lineCount: 15 })
  assert.equal(first.isError, undefined)
  assert.equal(first.structuredContent.locale, 'zh-CN')
  assert.ok(first.structuredContent.nextLine > first.structuredContent.startLine)
  const remaining = await callTool('get_doc', {
    path: '/overview/mcp.md',
    locale: 'zh-CN',
    startLine: first.structuredContent.nextLine,
    lineCount: 400,
  })
  assert.equal(remaining.isError, undefined)
  assert.equal(remaining.structuredContent.nextLine, null)
  const published = await fetch(new URL('/zh-CN/overview/mcp.md', site))
  assert.equal(
    `${first.structuredContent.markdown}\n${remaining.structuredContent.markdown}`,
    (await published.text()).trimEnd(),
  )
})

test('feature discovery supplies IDs that generate a version-aligned editor setup', { skip: !site }, async () => {
  const listed = await callTool('list_features', { product: 'sheets' })
  const feature = listed.structuredContent.features.find((item) => item.id === 'sheets-data-validation')
  assert.ok(feature)
  assert.equal(feature.unavailableReason, null)
  await Promise.all(
    ['plugin', 'preset'].map(async (mode) => {
      const result = await callTool('generate_setup', {
        product: 'sheets',
        mode,
        locale: 'zh-CN',
        features: [feature.id],
      })
      assert.equal(result.isError, undefined)
      const { files, version, requirements } = result.structuredContent
      const manifest = JSON.parse(files['package.json'])
      const dependencies = Object.entries(manifest.dependencies).filter(([name]) => name.startsWith('@univerjs/'))
      assert.ok(dependencies.length > 0)
      assert.ok(dependencies.every(([, dependencyVersion]) => dependencyVersion === version))
      assert.match(files['src/univer.js'], /DataValidation/)
      assert.match(files['src/univer.js'], /zh-CN/)
      assert.match(files['src/univer.js'], /\/lib\/index\.css/)
      assert.match(files['src/univer.js'], /dispose: \(\) => univer\.dispose\(\)/)
      assert.equal(requirements.collaboration, false)
    }),
  )
})

test('invalid paths, pages and setup combinations produce recoverable tool errors', { skip: !site }, async () => {
  await Promise.all(
    ['/guides/not-a-real-mcp-page', '/guides/../../package.json', '//example.com/private', '/api/search'].map(
      async (path) => {
        const result = await callTool('get_doc', { path })
        assert.equal(result.isError, true, path)
      },
    ),
  )
  const beyondPage = await callTool('get_doc', { path: '/overview/mcp', startLine: 999999 })
  assert.equal(beyondPage.isError, true)
  await Promise.all(
    [
      { product: 'slides', mode: 'preset' },
      { product: 'docs', mobile: true },
      { product: 'sheets', features: ['not-a-feature'] },
    ].map(async (args) => {
      const result = await callTool('generate_setup', args)
      assert.equal(result.isError, true)
    }),
  )
  const invalid = await rpc('tools/call', { name: 'search_docs', arguments: { query: 'a'.repeat(201) } })
  assert.ok(invalid.error || invalid.result?.isError)
})

test('MCP rejects untrusted origins before invoking tools', { skip: !site }, async () => {
  const response = await fetch(new URL('/mcp/docs', site), {
    method: 'POST',
    headers: {
      Origin: 'https://untrusted.example',
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
  })
  assert.equal(response.status, 403)
})
