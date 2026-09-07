/* eslint-disable no-await-in-loop -- Exercise invalid resize events in order on one live frame. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

// Test the real documentation frame with a deterministic same-origin child, not the SDK.
// No child resize notification models a first notification missed before parent hydration.
const origin = process.env.SHOWCASE_ORIGIN || 'http://localhost:3030'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/playground-frame')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [] }
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
  page.on('pageerror', (error) => report.errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
  })
  await page.route('**/playground/pdfs/text-markup', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><body style="margin:0"><main style="height:850px">Loaded child without a resize message</main></body></html>',
    }),
  )
  await page.goto(`${origin}/en-US/showcase/pdfs/text-markup`, { waitUntil: 'load', timeout: 120000 })
  const iframe = page.locator('iframe').first()
  await iframe.scrollIntoViewIfNeeded()
  await page.waitForFunction(
    () => {
      const frame = document.querySelector('iframe')
      return frame?.clientHeight === 850 && getComputedStyle(frame).opacity === '1'
    },
    undefined,
    { timeout: 30000 },
  )
  report.checks.push('The real frame becomes visible and measures its loaded child without any resize notification')
  const frame = await (await iframe.elementHandle()).contentFrame()
  await frame.evaluate(() => parent.postMessage({ type: 'setHeight', height: 920 }, location.origin))
  await page.waitForFunction(() => document.querySelector('iframe')?.clientHeight === 920)
  report.checks.push('A valid message from the owned same-origin child updates height')
  const unchangedHeight = async () => {
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    assert.equal(await iframe.evaluate((element) => element.clientHeight), 920)
  }
  await page.evaluate(() => {
    const child = document.querySelector('iframe').contentWindow
    window.postMessage({ type: 'setHeight', height: 17 }, location.origin)
    window.dispatchEvent(
      new MessageEvent('message', {
        source: child,
        origin: 'https://unrelated.example',
        data: { type: 'setHeight', height: 18 },
      }),
    )
  })
  await unchangedHeight()
  for (const data of [
    null,
    'setHeight',
    { type: 'other', height: 19 },
    ...[0, -1, NaN, Infinity, '53'].map((height) => ({ type: 'setHeight', height })),
  ]) {
    await frame.evaluate((payload) => parent.postMessage(payload, location.origin), data)
    await unchangedHeight()
  }
  assert.deepEqual(report.errors, [])
  report.checks.push('Foreign source/origin and malformed messages are ignored without runtime errors')
  await page.screenshot({ path: path.join(directory, 'loaded-frame.png') })
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  throw error
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
