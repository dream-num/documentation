/* eslint-disable no-await-in-loop -- Exercise each live component's stylesheet and lifecycle in order. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const product = process.env.SHOWCASE_LIT_PRODUCT || 'sheets'
assert.ok(['sheets', 'docs'].includes(product))
const url = process.env.SHOWCASE_DEMO_URL || `http://localhost:3030/en-US/playground/${product}/lit`
const tag = `univer-${product}-lit-demo`
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || `test-results/${product}-lit-css`)
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
const errors = [],
  results = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const component = page.locator(tag)
  const ready = async () => {
    await page.locator(`${tag}[data-ready=true]`).waitFor({ timeout: 120000 })
    await page.waitForFunction((selector) => {
      const root = document.querySelector(selector)?.shadowRoot
      return (
        root?.querySelector('link')?.sheet &&
        [...root.querySelectorAll('canvas')].some((canvas) => canvas.width > 100 && canvas.height > 100)
      )
    }, tag)
  }
  const inspect = async () => {
    await ready()
    const state = await component.evaluate((element) => {
      const root = element.shadowRoot,
        link = root.querySelector('link')
      const flex = root.querySelector('.univer-flex')
      return {
        stylesheet: link.href,
        rules: link.sheet.cssRules.length,
        flexDisplay: flex && getComputedStyle(flex).display,
        hostHeight: element.clientHeight,
        editorHeight: root.querySelector('#editor').clientHeight,
        canvases: [...root.querySelectorAll('canvas')].map((canvas) => ({
          width: canvas.width,
          height: canvas.height,
        })),
        darkMode: element.darkMode,
      }
    })
    assert.equal(new URL(state.stylesheet).origin, new URL(url).origin, 'Shadow styles are local bundled assets')
    assert.ok(state.rules > 50)
    assert.equal(state.flexDisplay, 'flex', 'SDK utility CSS applies inside Shadow DOM')
    assert.ok(state.hostHeight >= 600)
    assert.equal(state.editorHeight, state.hostHeight)
    assert.ok(state.canvases.some((canvas) => canvas.width > 100 && canvas.height > 100))
    results.push(state)
    return state
  }
  const baseline = await inspect()
  const asset = await page.request.get(baseline.stylesheet)
  assert.equal(asset.status(), 200)
  assert.match(asset.headers()['content-type'], /^text\/css/)
  const bytes = await asset.body()
  const installedCss = await fs.readFile(`node_modules/@univerjs/preset-${product}-core/lib/index.css`)
  assert.deepEqual(bytes, installedCss, 'The shadow asset must contain the installed SDK CSS, not a JS loader proxy')
  results.push({ cssBytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') })
  await component.screenshot({ path: path.join(directory, 'initial.png') })
  // Real DOM removal/reconnection must dispose and remount, not duplicate a global custom-element registration.
  await component.evaluate((element) => {
    const parent = element.parentElement
    element.remove()
    parent.append(element)
  })
  assert.equal((await inspect()).canvases.length, baseline.canvases.length)
  for (const width of [760, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    await inspect()
    await component.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  if (new URL(url).pathname.includes('/playground/')) {
    for (const dark of [true, false]) {
      await page.emulateMedia({ colorScheme: dark ? 'dark' : 'light' })
      await page.waitForFunction(({ selector, expected }) => document.querySelector(selector)?.darkMode === expected, {
        selector: tag,
        expected: dark,
      })
      assert.equal((await inspect()).canvases.length, baseline.canvases.length)
    }
  }
  await page.reload({ waitUntil: 'load' })
  await inspect()
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: 'passed', product, errors, results }, null, 2),
  )
  console.log(`PASS ${product} Lit bundled shadow CSS, dimensions, reconnect, resize and reload`)
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify({ message: error.message, errors, results }, null, 2),
  )
  throw error
} finally {
  await browser.close()
}
