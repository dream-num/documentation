/* eslint-disable no-await-in-loop -- Follow one selected demo from first development load to its guide. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const slug = process.argv[2] || 'sheets/custom-header'
assert.match(slug, /^[a-z-]+\/[a-z-]+$/)
const origin = process.env.SHOWCASE_ORIGIN || 'http://localhost:3030'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/showcase-cold-start')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
const page = await context.newPage()
const report = { slug, passed: false, errors: [], scriptWarnings: [], steps: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
// Diagnostic only: read React's current fiber through its development-tools hook.
// This observes component identity without pausing navigation or changing script behavior.
if (process.env.SHOWCASE_TRACE_THEME === '1') {
  await context.exposeBinding('__recordScriptWarning', ({ frame }, data) => {
    report.scriptWarnings.push({ url: frame.url(), ...data })
  })
  await context.addInitScript(() => {
    const renderers = []
    const rendererMap = new Map()
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ??= {
      supportsFiber: true,
      renderers: rendererMap,
      inject(renderer) {
        renderers.push(renderer)
        rendererMap.set(renderers.length, renderer)
        return renderers.length
      },
      onCommitFiberRoot() {},
      onCommitFiberUnmount() {},
      onPostCommitFiberRoot() {},
    }
    const original = console.error
    console.error = function (...args) {
      if (String(args[0]).includes('Encountered a script tag while rendering')) {
        for (const renderer of renderers) {
          let fiber = renderer.getCurrentFiber?.()
          if (!fiber) continue
          const props = fiber.pendingProps || {}
          const chain = []
          for (let i = 0; fiber && i < 20; i++, fiber = fiber.return) {
            const type = fiber.type
            chain.push(typeof type === 'string' ? type : type?.displayName || type?.name || String(type))
          }
          void window.__recordScriptWarning({
            chain,
            script: {
              src: props.src,
              type: props.type,
              inlinePrefix: props.dangerouslySetInnerHTML?.__html?.slice(0, 180),
            },
          })
        }
      }
      return original.apply(this, args)
    }
  })
}
try {
  const response = await page.goto(`${origin}/en-US/playground/${slug}`, { waitUntil: 'load', timeout: 180000 })
  assert.equal(response.status(), 200)
  await page.locator('[data-u-comp="workbench-layout"]').waitFor({ timeout: 60000 })
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-ready]')
    return !root || root.dataset.ready === 'true'
  })
  report.steps.push('Initial playground loaded')
  if (process.env.SHOWCASE_REQUIRE_THEME_PATCH === '1') {
    const layoutScripts = await page
      .locator('script[src]')
      .evaluateAll((scripts) =>
        scripts.map((script) => script.src).filter((src) => src.includes('/app/') && src.includes('layout')),
      )
    let patched = false
    for (const src of layoutScripts) {
      const script = await page.request.get(src)
      assert.ok(script.ok(), 'The active layout bundle must be readable')
      if ((await script.text()).includes('themeScriptClientSnapshot')) patched = true
    }
    assert.ok(patched, 'The served layout must contain the installed theme patch, not a stale webpack cache')
    report.steps.push('Served layout contains the hydration-aware theme bootstrap patch')
  }
  for (const locale of ['en-US', 'zh-CN']) {
    const result = await page.goto(`${origin}/${locale}/showcase/${slug}`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    assert.equal(result.status(), 200)
    await page.getByRole('heading', { level: 1 }).waitFor()
    // Analytics, repository metadata and dev traffic may remain active after hydration.
    // Require the real editor and CSS, then prove sidebar hydration by operating it.
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const workbench = page.frameLocator('iframe').first().locator('[data-u-comp="workbench-layout"]')
    await workbench.waitFor({ timeout: 60000 })
    assert.equal(await workbench.evaluate((node) => getComputedStyle(node).backgroundColor), 'rgb(255, 255, 255)')
    assert.equal(await page.locator('body').evaluate((node) => getComputedStyle(node).display), 'flex')
    const branch = page.locator('aside button').first()
    const expanded = await branch.getAttribute('aria-expanded')
    assert.ok(['true', 'false'].includes(expanded), 'The chosen sidebar branch exposes its real expanded state')
    await branch.click()
    await page.waitForFunction(
      (expected) => document.querySelector('aside button')?.getAttribute('aria-expanded') === expected,
      String(expanded === 'false'),
    )
    await branch.click()
    await page.waitForFunction(
      (expected) => document.querySelector('aside button')?.getAttribute('aria-expanded') === expected,
      expanded,
    )
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await page.screenshot({ path: path.join(directory, `${locale}.png`) })
    report.steps.push(`${locale}: hydrated sidebar and live iframe`)
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
assert.ok(report.passed, 'Selected cold development routes must load and hydrate without suppressed browser errors')
