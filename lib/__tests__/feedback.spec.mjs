import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { mock, test } from 'node:test'

const root = new URL('../../', import.meta.url)
globalThis.__feedbackHeaders = new Headers({ host: 'docs.univer.ai' })
const capture = mock.fn(async () => {})
globalThis.__feedbackCapture = capture
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'next/headers') {
      return {
        url: 'data:text/javascript,export async function headers(){return globalThis.__feedbackHeaders}',
        shortCircuit: true,
      }
    }
    if (specifier === 'posthog-node') {
      const actual = nextResolve(specifier, context).url
      const source = `export {cookieStateToProperties,cookieStoreFromHeader,readPostHogCookie,serializePostHogCookie,getPostHogCookieName} from '${actual}';
        export class PostHog {async captureImmediate(event){await globalThis.__feedbackCapture(event)}}`
      return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true }
    }
    if (specifier.startsWith('@/')) return nextResolve(new URL(`${specifier.slice(2)}.ts`, root).href, context)
    return nextResolve(specifier, context)
  },
})
const { feedbackSchema, storedFeedbackSchema } = await import('../feedback.ts')
const { submitFeedback } = await import('../feedback-action.ts')
const { serializePostHogCookie, getPostHogCookieName } = await import('posthog-node')
const key = 'phc_feedback_test'
const vote = {
  kind: 'vote',
  url: '/zh-CN/guides/sheets/get-started',
  feedback_id: '01902a9b-79e9-7000-97ce-bfa4c46437cf',
  feedback_revision: 1,
  opinion: 'unhelpful',
  message: '',
  distinct_id: 'browser-visitor',
  session_id: '01902a9b-79e9-7000-97ce-bfa4c46437c1',
  pageview_id: '01902a9b-79e9-7000-97ce-bfa4c46437c2',
}

function configure(cookie = '') {
  process.env.NODE_ENV = 'production'
  process.env.NEXT_PUBLIC_POSTHOG_KEY = key
  process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://ingestion.example'
  globalThis.__feedbackHeaders = new Headers({ host: 'docs.univer.ai', cookie })
  capture.mock.resetCalls()
}

test('validates public feedback input, optional details, and old browser storage', () => {
  assert.equal(feedbackSchema.safeParse(vote).success, true)
  for (const url of [
    '//example.com',
    '/\\example.com',
    '/page?q=private',
    '/page#anchor',
    'https://example.com',
    '/page\n',
  ]) {
    assert.equal(feedbackSchema.safeParse({ ...vote, url }).success, false, url)
  }
  for (const value of [
    { ...vote, opinion: 'normal' },
    { ...vote, reason: 'other' },
    { ...vote, opinion: 'helpful', reason: 'missing' },
    { ...vote, kind: 'details' },
    { ...vote, message: 'x'.repeat(2001) },
    { ...vote, feedback_revision: 0 },
    { ...vote, session_id: 'invalid' },
  ])
    assert.equal(feedbackSchema.safeParse(value).success, false)
  assert.equal(feedbackSchema.parse({ ...vote, kind: 'details', message: '  Version 1.3  ' }).message, 'Version 1.3')
  assert.equal(feedbackSchema.safeParse({ ...vote, kind: 'details', reason: 'missing' }).success, true)
  assert.equal(storedFeedbackSchema.safeParse({ opinion: 'normal', message: 'Legacy feedback' }).success, false)
})

test('votes retain page and visitor/session identity; details do not count as another vote', async () => {
  configure(`${getPostHogCookieName(key)}=${encodeURIComponent(serializePostHogCookie('cookie-visitor'))}`)
  assert.deepEqual(await submitFeedback(vote), { ok: true })
  const event = capture.mock.calls[0].arguments[0]
  assert.equal(event.event, 'on_rate_docs')
  assert.equal(event.distinctId, 'cookie-visitor')
  assert.equal(event.properties.content_path, '/guides/sheets/get-started')
  assert.equal(event.properties.locale, 'zh-CN')
  assert.equal(event.properties.$session_id, vote.session_id)
  assert.equal(event.properties.$pageview_id, vote.pageview_id)
  assert.equal(event.properties.$current_url, `https://docs.univer.ai${vote.url}`)
  assert.equal(event.properties.reporting_side, 'server')
  assert.equal(event.properties.$process_person_profile, false)
  assert.equal(event.properties.opinion, 'unhelpful')
  assert.deepEqual(
    await submitFeedback({ ...vote, kind: 'details', reason: 'example_error', message: '  Formula throws  ' }),
    { ok: true },
  )
  const details = capture.mock.calls[1].arguments[0]
  assert.equal(details.event, 'docs_feedback_detail')
  assert.equal(details.properties.feedback_id, event.properties.feedback_id)
  assert.equal(details.properties.feedback_revision, event.properties.feedback_revision)
  assert.equal(details.properties.reason, 'example_error')
  assert.equal(details.properties.message, 'Formula throws')
})

test('uses a browser identity without cookies and an isolated fallback without the browser SDK', async () => {
  configure()
  await submitFeedback({ ...vote, url: '/blog/action-recorder' })
  assert.equal(capture.mock.calls[0].arguments[0].distinctId, 'browser-visitor')
  assert.equal(capture.mock.calls[0].arguments[0].properties.content_type, 'blog')
  await submitFeedback({ ...vote, distinct_id: undefined })
  assert.equal(capture.mock.calls[1].arguments[0].distinctId, vote.feedback_id)
})

test('waits for delivery and returns a retryable error when ingestion fails', async () => {
  configure()
  let complete
  capture.mock.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        complete = resolve
      }),
  )
  let settled = false
  const pending = submitFeedback(vote).then((value) => {
    settled = true
    return value
  })
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(settled, false)
  complete()
  assert.deepEqual(await pending, { ok: true })
  const log = mock.method(console, 'error', () => {})
  capture.mock.mockImplementationOnce(async () => {
    throw new Error('Test ingestion unavailable')
  })
  assert.deepEqual(await submitFeedback(vote), { ok: false })
  log.mock.restore()
})

test('does not send malformed, unconfigured, or development feedback', async () => {
  configure()
  assert.deepEqual(await submitFeedback({ ...vote, url: '//evil.example' }), { ok: false })
  delete process.env.NEXT_PUBLIC_POSTHOG_KEY
  assert.deepEqual(await submitFeedback(vote), { ok: false })
  process.env.NODE_ENV = 'development'
  assert.deepEqual(await submitFeedback(vote), { ok: true })
  assert.equal(capture.mock.callCount(), 0)
})
