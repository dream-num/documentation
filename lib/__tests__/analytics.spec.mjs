import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { mock, test } from 'node:test'

const capture = mock.fn()
globalThis.__analyticsCapture = capture
const root = new URL('../../', import.meta.url)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'posthog-js') {
      return {
        url: `data:text/javascript,${encodeURIComponent('export const posthog = {capture: (...args) => globalThis.__analyticsCapture(...args)}')}`,
        shortCircuit: true,
      }
    }
    if (specifier.startsWith('@/')) return nextResolve(new URL(`${specifier.slice(2)}.ts`, root).href, context)
    return nextResolve(specifier, context)
  },
})
const { getAnalyticsPage, enrichAnalyticsEvent, captureDocumentationLink, captureDocsEvent } =
  await import('../analytics.ts')

test('custom events stay disabled without browser configuration', () => {
  const savedKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  delete process.env.NEXT_PUBLIC_POSTHOG_KEY
  capture.mock.resetCalls()
  captureDocsEvent('docs_search')
  assert.equal(capture.mock.callCount(), 0)
  if (savedKey !== undefined) process.env.NEXT_PUBLIC_POSTHOG_KEY = savedKey
})

test('groups translations by content path while retaining the locale and content type', () => {
  for (const locale of ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES']) {
    const page = getAnalyticsPage(`/${locale}/guides/sheets/get-started/`)
    assert.equal(page.content_path, '/guides/sheets/get-started')
    assert.equal(page.locale, locale)
    assert.equal(page.content_type, 'documentation')
  }
  assert.equal(getAnalyticsPage('/blog/action-recorder').content_type, 'blog')
  assert.equal(getAnalyticsPage('/server/import-export').content_type, 'documentation')
  assert.equal(getAnalyticsPage('/tools').content_type, 'other')
  assert.equal(getAnalyticsPage('/').locale, 'en-US')
  assert.equal(getAnalyticsPage('/zh-CN').content_path, '/')
})

test('pageviews retain the actual previous page and strip URL parameters from browser and identity properties', () => {
  const event = {
    event: '$pageview',
    $set_once: { $initial_current_url: 'https://docs.univer.ai/?token=private' },
    properties: {
      $current_url: 'https://docs.univer.ai/zh-CN/blog/action-recorder?token=secret#section',
      $referrer: 'https://univer.ai/pricing?secret=1',
      $prev_pageview_pathname: '/zh-CN/guides/sheets/get-started',
      $set_once: { $initial_current_url: 'https://docs.univer.ai/?query=private' },
    },
  }
  const properties = enrichAnalyticsEvent(event).properties
  assert.equal(properties.site, 'documentation')
  assert.equal(properties.content_type, 'blog')
  assert.equal(properties.from_path, '/zh-CN/guides/sheets/get-started')
  assert.equal(properties.from_content_path, '/guides/sheets/get-started')
  assert.equal(properties.$referrer, 'https://univer.ai/pricing')
  assert.equal(properties.$set_once.$initial_current_url, 'https://docs.univer.ai/')
  assert.equal(event.$set_once.$initial_current_url, 'https://docs.univer.ai/')
  assert.doesNotMatch(JSON.stringify(properties), /secret|private|#section/)
  assert.equal(enrichAnalyticsEvent(null), null)
  assert.equal(enrichAnalyticsEvent({ event: '$pageview', properties: { $current_url: 'http://[' } }), null)
})

test('search requests and selections retain explicit search content while URL parameters are removed', () => {
  for (const event of ['docs_search', 'docs_search_result_click']) {
    const properties = enrichAnalyticsEvent({
      event,
      properties: {
        $current_url: 'https://docs.univer.ai/zh-CN/overview?token=private',
        search_query: '如何开启协同编辑？',
        search_id: 'search-request-id',
      },
    }).properties
    assert.equal(properties.search_query, '如何开启协同编辑？')
    assert.equal(properties.search_id, 'search-request-id')
    assert.equal(properties.$current_url, 'https://docs.univer.ai/zh-CN/overview')
  }
})

test('delegated link tracking preserves cross-page entry points and ignores same-page links', () => {
  process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test'
  process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://analytics.example'
  globalThis.window = { location: { href: 'https://docs.univer.ai/zh-CN/guides/start' } }
  globalThis.Element = class {
    constructor(href, location = '[data-docs-body]') {
      this.href = href
      this.location = location
    }
    closest(selector) {
      if (selector === 'a[href]') return this
      return selector === this.location ? {} : null
    }
    getAttribute() {
      return null
    }
  }
  capture.mock.resetCalls()
  captureDocumentationLink({ button: 0, target: new Element('https://docs.univer.ai/zh-CN/guides/start#install') })
  captureDocumentationLink({ button: 0, target: new Element('https://docs.univer.ai/zh-CN/guides/start?tab=api') })
  assert.equal(capture.mock.callCount(), 0)
  captureDocumentationLink({ button: 0, target: new Element('https://docs.univer.ai/zh-CN/guides/next#install') })
  assert.equal(capture.mock.calls[0].arguments[0], 'docs_link_click')
  const internal = capture.mock.calls[0].arguments[1]
  assert.equal(internal.link_kind, 'internal')
  assert.equal(internal.from_path, '/zh-CN/guides/start')
  assert.equal(internal.to_path, '/zh-CN/guides/next')
  assert.equal(internal.to_content_path, '/guides/next')
  assert.equal(internal.to_content_type, 'documentation')
  assert.equal(internal.to_locale, 'zh-CN')
  assert.equal(internal.to_anchor, 'install')
  assert.equal(internal.link_location, 'article')
  captureDocumentationLink({
    button: 0,
    target: new Element('https://docs.univer.ai/zh-CN/guides/next#install', 'header'),
  })
  assert.equal(capture.mock.calls[1].arguments[1].link_location, 'header')
  assert.equal(capture.mock.calls[1].arguments[1].to_path, internal.to_path)
  captureDocumentationLink({ button: 1, target: new Element('https://univer.ai/pricing?token=private') })
  assert.equal(capture.mock.calls[2].arguments[0], 'docs_link_click')
  const outbound = capture.mock.calls[2].arguments[1]
  assert.equal(outbound.link_kind, 'outbound')
  assert.equal(outbound.to_host, 'univer.ai')
  assert.equal(outbound.to_path, '/pricing')
  assert.equal(outbound.to_content_type, 'external')
  assert.equal(outbound.opens_new_context, true)
  assert.doesNotMatch(JSON.stringify(outbound), /private/)
  captureDocumentationLink({ button: 2, target: new Element('https://univer.ai') })
  captureDocumentationLink({ button: 0, defaultPrevented: true, target: new Element('https://univer.ai') })
  captureDocumentationLink({ button: 0, target: new Element('mailto:developer@univer.ai') })
  captureDocumentationLink({ button: 0, target: new Element('http://[') })
  assert.equal(capture.mock.callCount(), 3)
})
