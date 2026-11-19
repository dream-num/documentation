import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import process from 'node:process'
import { after, beforeEach, mock, test } from 'node:test'

// Run with node --experimental-test-module-mocks --test lib/docs/__tests__/page-view.spec.mjs.
const originalEnv = { NODE_ENV: process.env.NODE_ENV, NEXT_POSTHOG_APIKEY: process.env.NEXT_POSTHOG_APIKEY }
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return { url: 'data:text/javascript,', shortCircuit: true }
    if (specifier === 'next/headers' || specifier === 'next/server') return nextResolve(`${specifier}.js`, context)
    if (specifier.startsWith('@/'))
      return nextResolve(new URL(`../../../${specifier.slice(2)}.ts`, import.meta.url).href, context)
    return nextResolve(specifier, context)
  },
})

let requestHeaders
let agent
let pending
let events
let clients
let headerReads
let shutdowns

mock.module('next/headers.js', {
  namedExports: {
    headers: async () => {
      headerReads++
      return { get: (name) => requestHeaders[name] ?? null, has: (name) => name in requestHeaders }
    },
  },
})
mock.module('next/server.js', {
  namedExports: { after: (callback) => pending.push(callback), userAgent: () => agent },
})
mock.module('posthog-node', {
  namedExports: {
    PostHog: function (apiKey, options) {
      clients.push({ apiKey, options })
      return { capture: (event) => events.push(event), shutdown: async () => shutdowns++ }
    },
  },
})

const { trackDocsPageView } = await import('../page-view.ts')

beforeEach(() => {
  process.env.NODE_ENV = 'production'
  process.env.NEXT_POSTHOG_APIKEY = 'test-server-key'
  requestHeaders = { referer: 'https://docs.univer.ai/blog' }
  agent = { isBot: false, browser: { name: 'Chrome' }, os: { name: 'Windows' }, device: {} }
  pending = []
  events = []
  clients = []
  headerReads = 0
  shutdowns = 0
})

after(() => {
  hooks.deregister()
  mock.restoreAll()
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

for (const [lang, url, expected] of [
  ['en-US', '/blog', '/blog'],
  ['zh-CN', '/blog/univer-1.0', '/zh-CN/blog/univer-1.0'],
  ['ja-JP', '/guides/sheets', '/ja-JP/guides/sheets'],
]) {
  test(`defers and flushes the existing visit event for ${expected}`, async () => {
    assert.equal(await trackDocsPageView({ lang, url }), undefined)
    assert.equal(headerReads, 1)
    assert.equal(pending.length, 1)
    assert.deepEqual(events, [])
    assert.deepEqual(clients, [])
    await pending[0]()
    assert.deepEqual(clients, [
      { apiKey: 'test-server-key', options: { host: 'https://us.i.posthog.com', flushInterval: 0 } },
    ])
    assert.deepEqual(events, [
      {
        event: 'on_view_docs',
        distinctId: 'anonymous',
        properties: {
          url: expected,
          lang,
          referrer: requestHeaders.referer,
          $browser: 'Chrome',
          $os: 'Windows',
          $device_type: 'Desktop',
          $process_person_profile: false,
        },
      },
    ])
    assert.equal(shutdowns, 1)
  })
}

for (const excluded of ['bot', 'purpose', 'sec-purpose', 'next-action']) {
  test(`does not report ${excluded} requests`, async () => {
    if (excluded === 'bot') agent.isBot = true
    else requestHeaders[excluded] = excluded === 'next-action' ? 'action-id' : 'prefetch'
    await trackDocsPageView({ lang: 'en-US', url: '/blog' })
    assert.equal(headerReads, 1)
    assert.deepEqual(pending, [])
    assert.deepEqual(clients, [])
  })
}

for (const env of ['development', 'test', 'missing-key']) {
  test(`avoids request-time work with ${env}`, async () => {
    if (env === 'missing-key') delete process.env.NEXT_POSTHOG_APIKEY
    else process.env.NODE_ENV = env
    await trackDocsPageView({ lang: 'en-US', url: '/blog' })
    assert.equal(headerReads, 0)
    assert.deepEqual(pending, [])
  })
}

for (const [type, expected] of [
  ['mobile', 'Mobile'],
  ['tablet', 'Tablet'],
]) {
  test(`preserves the ${expected} device property`, async () => {
    agent.device.type = type
    delete requestHeaders.referer
    await trackDocsPageView({ lang: 'en-US', url: '/blog' })
    await pending[0]()
    assert.equal(events[0].properties.$device_type, expected)
    assert.equal(events[0].properties.referrer, null)
  })
}
