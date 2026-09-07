/* eslint-disable no-await-in-loop -- Capture only explicitly selected demos, one at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import scopeLoader from './showcase-scope-loader.cjs'

// This is a capture gate, not a substitute for each demo's interaction/paint tests.
export async function captureShowcase(page, { slug, origin, directory, timeout = 60000 }) {
  const result = { slug, passed: false, errors: [] }
  const onError = (error) => result.errors.push(error.stack || error.message)
  const onConsole = (message) => {
    if (message.type() === 'error') result.errors.push(message.text())
  }
  page.on('pageerror', onError)
  page.on('console', onConsole)
  page.setDefaultTimeout(timeout)
  try {
    result.url = new URL(`/en-US/playground/${slug}`, origin).href
    const response = await page.goto(result.url, { waitUntil: 'load', timeout })
    assert.equal(response?.status(), 200, 'The selected playground must load successfully')
    const preview = page.locator('[data-showcase-preview]').first()
    await preview.waitFor()
    if (slug === 'embed/lazy-load-editor') await preview.locator('.lazy-editor-target').scrollIntoViewIfNeeded()
    const workbench = preview.locator('[data-u-comp="workbench-layout"], [data-u-comp="app-layout"]')
    await workbench.first().waitFor()
    assert.equal(await workbench.count(), 1, 'Capture exactly one native editor, not a fallback page')
    await page.waitForFunction(
      () => {
        const root = document.querySelector('[data-showcase-preview]')
        return root && [...root.querySelectorAll('[data-ready]')].every((el) => el.dataset.ready === 'true')
      },
      undefined,
      { timeout },
    )
    // The formula bar can appear before the full editor; wait instead of taking a partial capture.
    await page.waitForFunction(
      (element) =>
        [...element.querySelectorAll('canvas')].some((canvas) => {
          const bounds = canvas.getBoundingClientRect()
          return canvas.width > 100 && canvas.height > 100 && bounds.width > 100 && bounds.height > 100
        }),
      await workbench.elementHandle(),
      { timeout },
    )
    // A full-size canvas may already exist underneath the SDK's loading overlay.
    await preview.locator('[data-u-comp="workbench-skeleton-toolbar"]').waitFor({ state: 'hidden' })
    await workbench.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {})),
      )
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
    result.styles = await workbench.evaluate((element) => {
      const css = getComputedStyle(element)
      const opacity = []
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement || ancestor.getRootNode().host)
        opacity.push(getComputedStyle(ancestor).opacity)
      const flex = element.querySelector('.univer-flex')
      return {
        background: css.backgroundColor,
        sdkWhite: css.getPropertyValue('--univer-gray-0').trim(),
        flexDisplay: flex && getComputedStyle(flex).display,
        opacity,
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
      }
    })
    assert.equal(result.styles.background, 'rgb(255, 255, 255)', 'Native light workbench must be opaque white')
    assert.equal(result.styles.sdkWhite.toUpperCase(), '#FFFFFF', 'SDK light theme must be loaded')
    assert.equal(result.styles.flexDisplay, 'flex', 'SDK layout CSS must apply')
    assert.ok(
      result.styles.opacity.every((value) => value === '1'),
      'No transparent editor ancestor',
    )
    assert.ok(result.styles.width > 100 && result.styles.height > 100, 'Editor geometry must be usable')
    const png = await preview.screenshot({ omitBackground: false })
    assert.deepEqual(result.errors, [], 'Browser errors invalidate the capture')
    result.image = `${slug.replaceAll('/', '-')}.png`
    await fs.writeFile(path.join(directory, result.image), png)
    result.passed = true
  } catch (error) {
    result.failure = error.stack || String(error)
  } finally {
    page.off('pageerror', onError)
    page.off('console', onConsole)
  }
  return result
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const slugs = [...new Set(process.argv.slice(2))]
  scopeLoader.filterRegistry(await fs.readFile('showcase/data.ts', 'utf8'), slugs)
  const origin = process.env.SHOWCASE_ORIGIN || 'http://localhost:3030'
  // Never overwrite catalog images automatically, or mix a failed run with stale images.
  const parent = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results')
  await fs.mkdir(parent, { recursive: true })
  const directory = await fs.mkdtemp(path.join(parent, 'showcase-screenshots-'))
  console.log(`Capturing from ${origin}; start it with pnpm dev:showcase ${slugs.join(' ')}`)
  console.log(`Evidence: ${directory}`)
  const results = []
  const browser = await chromium.launch()
  try {
    for (const slug of slugs) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
      try {
        results.push(await captureShowcase(await context.newPage(), { slug, origin, directory, timeout: 180000 }))
      } finally {
        await context.close()
        await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(results, null, 2))
      }
      console.log(JSON.stringify(results.at(-1)))
    }
  } finally {
    await browser.close()
  }
  assert.ok(
    results.every(({ passed }) => passed),
    'Every selected capture must pass; no fallback images were saved',
  )
}
