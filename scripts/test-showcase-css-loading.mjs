/* eslint-disable no-await-in-loop -- Revisit one selected route while retaining the first page for HMR diagnostics. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const slug = process.argv[2]
assert.match(slug ?? '', /^[a-z-]+\/[a-z-]+$/, 'Pass exactly one selected demo slug')
const origin = process.env.SHOWCASE_ORIGIN || 'http://localhost:3030'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/showcase-css-loading')
const visits = Number(process.env.SHOWCASE_CSS_VISITS || 3)
assert.ok(Number.isInteger(visits) && visits > 0 && visits <= 20)
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const report = { slug, passed: false, visits: [], errors: [] }
const contexts = []
const probe = process.env.SHOWCASE_CSS_PROBE

async function inspect(page) {
  return page.evaluate(() => {
    const workbench = document.querySelector('[data-u-comp="workbench-layout"], [data-u-comp="app-layout"]')
    const flex = workbench?.querySelector('.univer-flex')
    return {
      background: workbench && getComputedStyle(workbench).backgroundColor,
      sdkWhite: workbench && getComputedStyle(workbench).getPropertyValue('--univer-gray-0').trim(),
      flexDisplay: flex && getComputedStyle(flex).display,
      probe:
        document.querySelector('[data-ready]') &&
        getComputedStyle(document.querySelector('[data-ready]')).getPropertyValue('--showcase-css-probe').trim(),
      sheets: [...document.styleSheets].map((sheet) => ({ href: sheet.href, disabled: sheet.disabled })),
      links: [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => ({
        href: link.href,
        loaded: !!link.sheet,
        disabled: link.disabled,
        media: link.media,
      })),
      mutations: window.cssLoadingTrace,
    }
  })
}
try {
  for (let visit = 0; visit < visits; visit++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
    contexts.push(context)
    await context.addInitScript(() => {
      window.cssLoadingTrace = []
      // Passive diagnostics only: forward the original DOM operation unchanged.
      const removeChild = Node.prototype.removeChild
      Node.prototype.removeChild = function (child) {
        if (child instanceof Element && ['LINK', 'STYLE'].includes(child.tagName))
          window.cssLoadingTrace.push({ type: 'remove', html: child.outerHTML.slice(0, 500), stack: new Error().stack })
        return removeChild.call(this, child)
      }
    })
    const page = await context.newPage()
    const result = { visit, passed: false, responses: [], requestFailures: [], refreshes: [], errors: [] }
    report.visits.push(result)
    const pending = []
    page.on('pageerror', (error) => result.errors.push(error.stack || error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
      if (message.text().includes('[Fast Refresh] done')) result.refreshes.push(message.text())
    })
    page.on('requestfailed', (request) => {
      const failure = { url: request.url(), type: request.resourceType(), failure: request.failure() }
      result.requestFailures.push(failure)
      // HMR may cancel an obsolete RSC request. Preserve it, but this gate concerns executable/style assets.
      if (['script', 'stylesheet'].includes(failure.type)) result.errors.push(failure)
    })
    page.on('response', (response) => {
      if (!new URL(response.url()).pathname.endsWith('.css')) return
      pending.push(
        (async () => {
          const text = await response.text().catch(() => '')
          result.responses.push({
            url: response.url(),
            status: response.status(),
            length: text.length,
            hasSdkTheme: text.includes('--univer-gray-0'),
          })
        })(),
      )
    })
    try {
      const response = await page.goto(`${origin}/en-US/playground/${slug}`, { waitUntil: 'load', timeout: 180000 })
      assert.equal(response.status(), 200)
      if (process.env.SHOWCASE_REQUIRE_NATIVE_CSS_INSERT === '1') {
        const runtimeUrl = await page.locator('script[src*="/chunks/webpack.js"]').getAttribute('src')
        assert.ok(runtimeUrl, 'The selected webpack development runtime must be present')
        const runtimeResponse = await page.request.get(new URL(runtimeUrl, origin).href)
        assert.ok(runtimeResponse.ok())
        const runtime = await runtimeResponse.text()
        result.runtime = {
          nativeInsertion: runtime.includes('document.head.appendChild(linkTag)'),
          reactRegistration: runtime.includes('_N_E_STYLE_LOAD'),
        }
        assert.deepEqual(result.runtime, { nativeInsertion: true, reactRegistration: false })
      }
      await page.waitForFunction(
        () => {
          const node = document.querySelector('[data-u-comp="workbench-layout"], [data-u-comp="app-layout"]')
          const flex = node?.querySelector('.univer-flex')
          return (
            node &&
            flex &&
            getComputedStyle(node).backgroundColor === 'rgb(255, 255, 255)' &&
            getComputedStyle(flex).display === 'flex'
          )
        },
        undefined,
        { timeout: 30000 },
      )
      result.passed = true
    } catch (error) {
      result.failure = error.stack || String(error)
      await page.screenshot({ path: path.join(directory, `visit-${visit}-failure.png`), fullPage: true })
    }
    await Promise.all(pending)
    result.styles = await inspect(page)
    if (result.errors.length) result.passed = false
    console.log(
      JSON.stringify({
        visit,
        passed: result.passed,
        responses: result.responses,
        styles: {
          background: result.styles.background,
          flexDisplay: result.styles.flexDisplay,
        },
      }),
    )
    await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
    // Optional manual HMR boundary: the caller edits source, then sends Enter. No test rewrites user files.
    if (visit === 0 && process.env.SHOWCASE_CSS_PAUSE === '1') {
      const refreshCount = result.refreshes.length
      console.log('CSS observation ready. Apply the selected source edit, then press Enter to continue.')
      await new Promise((resolve) => process.stdin.once('data', resolve))
      process.stdin.pause()
      if (result.refreshes.length === refreshCount)
        await page.waitForEvent('console', {
          predicate: (message) => message.text().includes('[Fast Refresh] done'),
          timeout: 60000,
        })
    }
  }
  report.retained = []
  for (const context of contexts) {
    const page = context.pages()[0]
    const styles = await inspect(page)
    report.retained.push(styles)
    if (styles.background !== 'rgb(255, 255, 255)' || styles.flexDisplay !== 'flex')
      report.errors.push('A retained page lost its native SDK styling')
    if (probe !== undefined && styles.probe !== probe)
      report.errors.push('A retained page did not apply the changed host CSS probe')
  }
  report.passed = report.visits.every((visit) => visit.passed && !visit.errors.length) && !report.errors.length
} catch (cause) {
  report.failure = cause.stack || String(cause)
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.ok(report.passed, 'Selected fresh/retained pages must load the actual SDK styles without fallback CSS')
