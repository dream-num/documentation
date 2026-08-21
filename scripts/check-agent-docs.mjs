import { spawn } from 'node:child_process'
import { once } from 'node:events'
import fs from 'node:fs/promises'
import net from 'node:net'
import process from 'node:process'

const AGENT_ROUTE = '/api/agent-docs/[lang]/[...asset]'
const CONCURRENCY = 48
const DOCS_ORIGIN = 'https://docs.univer.ai'
const PRERENDER_MANIFEST = '.next/prerender-manifest.json'
const ROUTING_CONFIG = 'i18n/routing.ts'
const SERVER_ENTRY = '.next/standalone/server.js'
const SOURCE_COLLECTIONS = ['guides', 'reference', 'icons']

let defaultLocale

async function readRoutingConfig() {
  const source = await fs.readFile(ROUTING_CONFIG, 'utf8')
  const defaultMatch = source.match(/defaultLocale:\s*(['"])([^'"]+)\1/)
  const localesBlock = source.match(/locales:\s*\[([\s\S]*?)\]/)?.[1]
  const locales = localesBlock ? [...localesBlock.matchAll(/(['"])([^'"]+)\1/g)].map((match) => match[2]) : []
  assert(defaultMatch?.[2], `Could not read defaultLocale from ${ROUTING_CONFIG}`)
  assert(locales.length > 0, `Could not read locales from ${ROUTING_CONFIG}`)
  assert(new Set(locales).size === locales.length, `${ROUTING_CONFIG} contains duplicate locales`)
  assert(locales.includes(defaultMatch[2]), `${ROUTING_CONFIG} does not include its default locale`)
  return { configuredDefaultLocale: defaultMatch[2], locales }
}

async function getSourceFiles() {
  const patterns = SOURCE_COLLECTIONS.flatMap((collection) => [
    `content/${collection}/**/*.md`,
    `content/${collection}/**/*.mdx`,
  ])
  return (await Promise.all(patterns.map((pattern) => Array.fromAsync(fs.glob(pattern))))).flat()
}

async function readHumanPagePaths(locales) {
  const logicalPages = new Set()
  for (const file of await getSourceFiles()) {
    const [, collection, ...relativeParts] = file.split('/')
    assert(collection && SOURCE_COLLECTIONS.includes(collection), `Could not map source documentation file: ${file}`)
    let relativePath = relativeParts.join('/').replace(/\.mdx?$/, '')
    const sourceLocale = locales.find((locale) => relativePath.endsWith(`.${locale}`))
    if (sourceLocale) relativePath = relativePath.slice(0, -sourceLocale.length - 1)
    const slug = relativePath.split('/').filter(Boolean)
    if (slug.at(-1) === 'index') slug.pop()
    logicalPages.add(`/${collection}${slug.length > 0 ? `/${slug.join('/')}` : ''}`)
  }

  return new Set(
    locales.flatMap((locale) =>
      [...logicalPages].map((page) => `${locale === defaultLocale ? '' : `/${locale}`}${page}.md`),
    ),
  )
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function getAvailablePort() {
  const server = net.createServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  assert(address && typeof address === 'object', 'Could not determine the verification server port')
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  return address.port
}

async function readExpectedAssets() {
  const { configuredDefaultLocale, locales } = await readRoutingConfig()
  const manifest = JSON.parse(await fs.readFile(PRERENDER_MANIFEST, 'utf8'))
  const entries = Object.entries(manifest.routes).filter(([, route]) => route.srcRoute === AGENT_ROUTE)
  const paths = entries.map(([, route]) => route.initialHeaders?.['content-location'])
  assert(paths.length > 0, `No agent docs were found in ${PRERENDER_MANIFEST}`)
  assert(
    paths.every((path) => typeof path === 'string'),
    'An agent doc is missing Content-Location',
  )

  const expected = new Set(paths)
  assert(expected.size === paths.length, 'Agent docs contain duplicate Content-Location values')

  const defaultRoot = entries.find(([, route]) => route.initialHeaders['content-location'] === '/llms.txt')
  const manifestDefaultLocale = defaultRoot?.[0].match(/^\/api\/agent-docs\/([^/]+)\/llms\.txt$/)?.[1]
  assert(manifestDefaultLocale, 'Agent docs contain no default-locale llms.txt')
  assert(
    manifestDefaultLocale === configuredDefaultLocale,
    `Agent docs use default locale ${manifestDefaultLocale}, expected ${configuredDefaultLocale}`,
  )
  defaultLocale = configuredDefaultLocale

  const rootLocales = entries
    .filter(([, route]) => route.initialHeaders['content-location']?.endsWith('/llms.txt'))
    .filter(([route]) => /^\/api\/agent-docs\/[^/]+\/llms\.txt$/.test(route))
    .map(([route]) => route.match(/^\/api\/agent-docs\/([^/]+)\/llms\.txt$/)?.[1])
    .filter(Boolean)
  assert(
    rootLocales.length === locales.length,
    `Agent docs expose ${rootLocales.length} locales, expected ${locales.length}`,
  )
  assert(
    locales.every((locale) => rootLocales.includes(locale)),
    'Agent docs locale roots do not match routing config',
  )

  const humanPages = await readHumanPagePaths(locales)

  const agentPages = new Set([...expected].filter((path) => path.endsWith('.md')))
  const missingAgentPages = [...humanPages].filter((path) => !agentPages.has(path))
  const orphanedAgentPages = [...agentPages].filter((path) => !humanPages.has(path))
  assert(
    missingAgentPages.length === 0,
    `Human documentation is missing ${missingAgentPages.length} agent representations: ${missingAgentPages.slice(0, 5).join(', ')}`,
  )
  assert(
    orphanedAgentPages.length === 0,
    `Agent documentation has ${orphanedAgentPages.length} orphaned pages: ${orphanedAgentPages.slice(0, 5).join(', ')}`,
  )

  const roots = entries
    .filter(([route]) => /^\/api\/agent-docs\/[^/]+\/llms\.txt$/.test(route))
    .map(([, route]) => route.initialHeaders['content-location'])
  assert(roots.length > 0, 'Agent docs contain no root llms.txt indexes')

  return { expected, roots }
}

async function verifySourceMarkdown() {
  const files = await getSourceFiles()
  const failures = (
    await Promise.all(
      files.map(async (file) => {
        const source = await fs.readFile(file, 'utf8')
        const encodedDelimiter = source.match(/&#x(?:60|2a);/i)
        if (encodedDelimiter?.index !== undefined) {
          const line = source.slice(0, encodedDelimiter.index).split('\n').length
          return `${file}:${line}: ${encodedDelimiter[0]}`
        }
        const malformed = source.match(/\[[^\]\n]+\((?:https?:\/\/|\/|\.{1,2}\/|#)/)
        if (!malformed || malformed.index === undefined) return
        const line = source.slice(0, malformed.index).split('\n').length
        return `${file}:${line}: ${malformed[0]}`
      }),
    )
  ).filter(Boolean)
  assert(failures.length === 0, `Source documentation contains malformed Markdown links:\n${failures.join('\n')}`)
}

function startServer(port) {
  const output = []
  const server = spawn(process.execPath, [SERVER_ENTRY], {
    env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let settled = false
  let timeout
  let resolveReady
  let rejectReady
  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve
    rejectReady = reject
  })
  const capture = (data) => {
    output.push(data.toString())
    if (settled || !output.join('').includes('Ready')) return
    settled = true
    clearTimeout(timeout)
    resolveReady()
  }
  server.stdout.on('data', capture)
  server.stderr.on('data', capture)

  timeout = setTimeout(() => {
    if (settled) return
    settled = true
    rejectReady(new Error(`Standalone server did not become ready:\n${output.join('')}`))
  }, 30_000)
  server.once('exit', (code, signal) => {
    if (settled) return
    settled = true
    clearTimeout(timeout)
    rejectReady(new Error(`Standalone server exited before readiness (${code ?? signal}):\n${output.join('')}`))
  })

  return { ready, server }
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) return
  const exited = once(server, 'exit')
  server.kill('SIGTERM')
  const timeout = new Promise((resolve) => {
    const timer = setTimeout(() => resolve('timeout'), 5_000)
    timer.unref()
  })
  if ((await Promise.race([exited, timeout])) === 'timeout') {
    server.kill('SIGKILL')
    await exited
  }
}

function fetchLocal(baseUrl, path) {
  return fetch(`${baseUrl}${path}`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
  })
}

function removeInlineCode(line) {
  let delimiterLength = 0
  let result = ''

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] !== '`') {
      if (delimiterLength === 0) result += line[index]
      continue
    }

    let end = index + 1
    while (line[end] === '`') end += 1
    const runLength = end - index
    if (delimiterLength === 0) delimiterLength = runLength
    else if (runLength === delimiterLength) delimiterLength = 0
    index = end - 1
  }

  return result
}

function getAgentLinks(body) {
  const links = new Set()
  const pattern = /https:\/\/docs\.univer\.ai(\/[^\s)<>'"]+?\.(?:md|txt))(?:[?#][^\s)<>'"]*)?/g
  for (const match of body.matchAll(pattern)) links.add(match[1])
  return links
}

function assertInternalLinks(body, path) {
  const collections = new Set(['guides', 'icons', 'reference'])
  let fence
  for (const line of body.split('\n')) {
    const fenceMarker = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMarker) {
      if (!fence) fence = { length: fenceMarker[1].length, marker: fenceMarker[1][0] }
      else if (fenceMarker[1][0] === fence.marker && fenceMarker[1].length >= fence.length) fence = undefined
      continue
    }
    if (fence) continue
    if (line.startsWith('- Human documentation:')) continue

    const visibleLine = removeInlineCode(line)
    for (const match of visibleLine.matchAll(/(!?)\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)) {
      if (match[1]) continue
      const destination = match[2]
      if (destination.startsWith('#') || /^(?:mailto|tel):/i.test(destination)) continue
      if (!destination.startsWith('/') && !destination.startsWith(DOCS_ORIGIN)) {
        assert(/^[a-z][a-z\d+.-]*:/i.test(destination), `${path} contains an unresolved relative link: ${destination}`)
        continue
      }
      const url = new URL(destination, DOCS_ORIGIN)
      if (url.origin !== DOCS_ORIGIN) continue
      const segments = url.pathname.split('/').filter(Boolean)
      const collectionIndex = collections.has(segments[0]) ? 0 : collections.has(segments[1]) ? 1 : -1
      if (collectionIndex < 0) continue
      assert(
        url.pathname.endsWith('.md') || url.pathname.endsWith('/llms.txt'),
        `${path} contains an unresolved internal documentation link: ${destination}`,
      )
    }
  }
}

function assertReadableMarkdown(body, path) {
  assert(body.trim(), `${path} returned an empty body`)
  assert(!body.includes('\0'), `${path} contains a NUL placeholder`)
  assert(!body.includes('agent-image:'), `${path} contains an unresolved image placeholder`)
  assert(!/&#x(?:60|2a);/i.test(body), `${path} contains an encoded Markdown delimiter`)

  let fence
  let h1Count = 0
  for (const line of body.split('\n')) {
    if (fence) {
      const closing = line.match(/^\s*(`{3,}|~{3,})\s*$/)
      if (closing && closing[1][0] === fence.marker && closing[1].length >= fence.length) fence = undefined
      continue
    }

    if (line.startsWith('# ')) h1Count += 1
    const visibleLine = removeInlineCode(line)
    assert(!/\{\/\*|\*\/\}/.test(visibleLine), `${path} contains a raw MDX comment: ${line}`)
    const heading = visibleLine.match(/#{2,6}\s/)
    const headingPrefix = heading?.index === undefined ? undefined : visibleLine.slice(0, heading.index)
    assert(
      !heading || /^\s*(?:(?:>\s*)+)?$/.test(headingPrefix ?? ''),
      `${path} has a heading joined to another block: ${line}`,
    )
    const opening = line.match(/(`{3,}|~{3,})/)
    if (!opening) continue
    assert(
      opening.index !== undefined && line.slice(0, opening.index).trim() === '',
      `${path} has a code fence joined to prose: ${line}`,
    )
    fence = { length: opening[1].length, marker: opening[1][0] }
  }
  assert(!fence, `${path} has an unterminated code fence`)
  assert(h1Count === 1, `${path} must contain exactly one H1, received ${h1Count}`)
}

async function fetchAsset(baseUrl, path) {
  const response = await fetchLocal(baseUrl, path)
  assert(response.status === 200, `${path} returned ${response.status}`)
  assert(response.headers.get('content-location') === path, `${path} returned the wrong Content-Location`)
  assert(!response.headers.has('set-cookie'), `${path} must remain safe for shared caching`)
  assert(response.headers.has('etag'), `${path} is missing an ETag`)
  assert(response.headers.get('link')?.includes('rel="alternate"'), `${path} is missing its Link metadata`)
  const expectedType = path.endsWith('.md') ? 'text/markdown' : 'text/plain'
  assert(response.headers.get('content-type')?.startsWith(expectedType), `${path} returned the wrong Content-Type`)
  const body = await response.text()
  assertReadableMarkdown(body, path)
  assertInternalLinks(body, path)

  const contentLanguage = response.headers.get('content-language')
  const languagePattern = path.endsWith('.md') ? /^- Content language: `([^`]+)`$/m : /^- Language: `([^`]+)`$/m
  const bodyLanguage = body.match(languagePattern)?.[1]
  assert(bodyLanguage && contentLanguage === bodyLanguage, `${path} has inconsistent content-language metadata`)
  const firstSegment = path.split('/').find(Boolean)
  const expectedRequestedLanguage = /^[a-z]{2}-[A-Z]{2}$/.test(firstSegment) ? firstSegment : defaultLocale
  if (path.endsWith('.md')) {
    const requestedLanguage = body.match(/^- Requested language: `([^`]+)`$/m)?.[1]
    const sourcePath = body.match(/^- Source: \[([^\]]+)\]\(/m)?.[1]
    const sourceLanguage = sourcePath?.match(/\.([a-z]{2}-[A-Z]{2})\.mdx?$/)?.[1] ?? defaultLocale
    assert(requestedLanguage, `${path} is missing its requested language`)
    assert(sourcePath, `${path} is missing its source path`)
    assert(
      requestedLanguage === expectedRequestedLanguage,
      `${path} exposes requested language ${requestedLanguage}, expected ${expectedRequestedLanguage}`,
    )
    assert(
      bodyLanguage === sourceLanguage,
      `${path} exposes content language ${bodyLanguage}, but its physical source is ${sourceLanguage}`,
    )
    if (requestedLanguage !== bodyLanguage) {
      assert(
        body.includes(`requested \`${requestedLanguage}\`; content is \`${bodyLanguage}\``),
        `${path} does not label its language fallback`,
      )
    } else {
      assert(!body.includes('> Language fallback:'), `${path} incorrectly labels a language fallback`)
    }
  } else {
    assert(
      bodyLanguage === expectedRequestedLanguage,
      `${path} exposes language ${bodyLanguage}, expected ${expectedRequestedLanguage}`,
    )
  }
  return body
}

async function crawlAssets(baseUrl, expected, roots) {
  const queued = [...roots]
  const visited = new Set()

  async function visitNext() {
    const path = queued.shift()
    if (!path) return
    if (visited.has(path)) return visitNext()
    assert(expected.has(path), `An index links to an unexpected agent asset: ${path}`)
    visited.add(path)

    const body = await fetchAsset(baseUrl, path)
    for (const link of getAgentLinks(body)) {
      if (!visited.has(link)) queued.push(link)
    }
    return visitNext()
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => visitNext()))
  const unreachable = [...expected].filter((path) => !visited.has(path))
  assert(
    unreachable.length === 0,
    `Agent indexes do not reach ${unreachable.length} assets: ${unreachable.slice(0, 5).join(', ')}`,
  )
  return visited.size
}

async function verifySemanticProjection(baseUrl) {
  const checks = [
    ['/guides/sheets/features/core.md', ['`createUniver`', '**@univerjs/core**']],
    ['/guides/sheets/features/core/general-api.md', ['Facade API available varies']],
    ['/guides/sheets/getting-started/installation.md', ['npm', 'pnpm', 'yarn']],
    ['/guides/docs/features/watermark.md', ['@univerjs/watermark', '/playground/']],
    ['/guides/pro/api.md', ['POST', 'snapshot']],
    ['/reference/classes/univer.md', ['UniverParameter']],
    ['/guides/shared/getting-started/lifecycle.md', ['```mermaid', 'flowchart']],
    ['/icons/all-icons.md', ['Available icon components']],
  ]

  await Promise.all(
    checks.map(async ([path, snippets]) => {
      const body = await fetchAsset(baseUrl, path)
      for (const snippet of snippets) assert(body.includes(snippet), `${path} lost the semantic content: ${snippet}`)
    }),
  )
}

async function verifyNotFound(baseUrl) {
  await Promise.all(
    ['/guides/no-such-page.md', '/api/agent-docs/en-US/guides/no-such-page.md'].map(async (path) => {
      const response = await fetchLocal(baseUrl, path)
      assert(response.status === 404, `${path} must return 404, received ${response.status}`)
    }),
  )
}

async function verifyHtmlDiscovery(baseUrl) {
  const checks = [
    ['/zh-CN/guides/sheets/getting-started/installation', '/zh-CN/guides/llms.txt'],
    ['/zh-CN/reference/classes/univer', '/zh-CN/reference/llms.txt'],
    ['/zh-CN/icons/all-icons', '/zh-CN/icons/llms.txt'],
  ]

  await Promise.all(
    checks.map(async ([path, index]) => {
      const response = await fetchLocal(baseUrl, path)
      assert(response.status === 200, `${path} returned ${response.status}`)
      const html = await response.text()
      const headEnd = html.indexOf('</head>')
      assert(headEnd >= 0, `${path} returned no HTML head`)
      const head = html.slice(0, headEnd)
      const alternate = `href="${path}.md" rel="alternate" type="text/markdown"`
      const describedBy = `href="${index}" rel="describedby" type="text/plain"`
      assert(head.indexOf(alternate) >= 0, `${path} is missing its Markdown alternate`)
      assert(head.indexOf(describedBy) >= 0, `${path} is missing its agent index`)
    }),
  )
}

await verifySourceMarkdown()
await fs.access(SERVER_ENTRY)
const { expected, roots } = await readExpectedAssets()
const port = await getAvailablePort()
const baseUrl = `http://127.0.0.1:${port}`
let server

try {
  const started = startServer(port)
  server = started.server
  await started.ready
  const count = await crawlAssets(baseUrl, expected, roots)
  await Promise.all([verifySemanticProjection(baseUrl), verifyNotFound(baseUrl), verifyHtmlDiscovery(baseUrl)])
  console.log(
    `Verified ${count} reachable agent docs with readable Markdown, metadata, fallback, discovery, and 404 behavior.`,
  )
} finally {
  if (server) await stopServer(server)
}
