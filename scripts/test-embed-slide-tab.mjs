/* eslint-disable no-await-in-loop -- Native page navigation must be verified sequentially in one workbench. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/slides-in-sheets-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-slide-tab')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(['create-demo.ts', 'data.ts'].map((name) => fs.readFile(`${codeRoot}/${name}`, 'utf8')))
).join('\n')
const dependencies = [
  ...new Set(
    [...sources.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
      .map((match) => match[1])
      .filter((name) => !name.endsWith('.css')),
  ),
]
const server = process.env.SHOWCASE_ORIGIN
  ? null
  : await createServer({
      configFile: false,
      root: process.cwd(),
      appType: 'custom',
      cacheDir: path.resolve('test-results/embed-slide-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4191, strictPort: true, watch: { ignored: ['**/.next/**'] } },
      plugins: [
        {
          name: 'one-embed-only',
          configureServer(vite) {
            vite.middlewares.use((request, response, next) => {
              if (request.url !== '/') return next()
              response.setHeader('Content-Type', 'text/html')
              response.end(
                `<html><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">import {createDemo} from '/${codeRoot}/create-demo.ts';window.demo=createDemo(document.getElementById('app'));window.addEventListener('pagehide',()=>window.demo.dispose(),{once:true});</script></body></html>`,
              )
            })
          },
        },
      ],
    })
await server?.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
await page.addInitScript(() => {
  window.startupFailure = null
  window.addEventListener('error', (event) => {
    window.startupFailure = event.message
  })
  window.painted = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const tab = (name) => page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4191/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () =>
      document.querySelector('.marigold-embed')?.getAttribute('data-ready') === 'true' ||
      document.querySelector('.marigold-embed')?.getAttribute('data-error') ||
      window.startupFailure,
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  assert.equal(await page.locator('.marigold-embed').getAttribute('data-error'), null)
  const descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'marigold-monthly-review' })[0].getDescriptor(),
  )
  report.descriptor = descriptor
  assert.equal(descriptor.entry, 'sheets-sheet-tab')
  assert.equal(descriptor.childUnitId, 'marigold-board-deck')
  assert.equal(descriptor.context.name, 'Board review')
  assert.equal(descriptor.context.index, 1)
  assert.equal(await page.locator('[data-u-comp="embed-float-dom"]').count(), 0)
  assert.deepEqual(await page.locator('[data-u-comp="slide-tab-item"]').allTextContents(), [
    'Cost ledger',
    'Board review',
    'Assumptions',
  ])
  await page.waitForFunction(() => window.painted.join('').includes('$42,480'))
  await page.screenshot({ path: path.join(directory, 'ledger.png'), fullPage: true })
  report.checks.push('Real native SheetTab inserted between Cost ledger and Assumptions; no floating substitute')
  // The first child slide may already be painted into the SDK's cached canvas during loadAsync.
  // Keep that paint record; verify the mounted native viewport and screenshot separately below.
  await tab('Board review').click()
  await page.locator('[data-embed-sheets-sheet-tab-host]').waitFor({ timeout: 30000 })
  await settle()
  report.paintOnTab = await page.evaluate(() => [...new Set(window.painted)].slice(0, 160))
  await page.waitForFunction(() => window.painted.join('').includes('Keep access at the'), {}, { timeout: 30000 })
  await settle()
  await page.screenshot({ path: path.join(directory, 'board-review.png'), fullPage: true })
  report.checks.push('Native host tab opens the original three-page Slides child')
  for (const [id, color] of [
    ['overview', '#fbf5e8'],
    ['costs', '#f2eefa'],
    ['decision', '#fbeae2'],
  ]) {
    await page.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${id}"]`).click()
    await page.waitForFunction(
      (pageId) => window.univerAPI.getPresentation('marigold-board-deck').getActiveSlide().getId() === pageId,
      id,
    )
    await settle()
    const pixels = await page.locator('[data-embed-sheets-sheet-tab-host]').evaluate((root, expected) => {
      const canvas = [...root.querySelectorAll('canvas')].find((item) => item.width > 700 && item.height > 300)
      if (!canvas) return 0
      const rgba = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
      let count = 0
      for (let i = 0; i < rgba.length; i += 64) {
        const pixelColor =
          '#' + Array.from(rgba.slice(i, i + 3), (value) => value.toString(16).padStart(2, '0')).join('')
        if (pixelColor === expected) count++
      }
      return count
    }, color)
    assert.ok(pixels > 1000, `${id}: authored palette must paint in the native child viewport`)
    await page.screenshot({ path: path.join(directory, `${id}.png`), fullPage: true })
  }
  await page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="overview"]').click()
  await settle()
  report.checks.push(
    'Native thumbnails open all three authored pages; cream, lilac and coral are verified in canvas pixels',
  )
  const baseline = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getPresentation('marigold-board-deck').save())),
  )
  await page.evaluate(() => {
    window.painted = []
    const text = window.univerAPI
      .getPresentation('marigold-board-deck')
      .getActiveSlide()
      .getShape('cover-title')
      .getText()
    const rich = text.getRichText().copy()
    rich.getParagraphs()[0].getTextRuns()[0].setText('Keep participation open.')
    text.setRichText(rich)
  })
  await page.waitForFunction(() => window.painted.join('').includes('Keep participation open.'))
  const edited = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getPresentation('marigold-board-deck').save())),
  )
  assert.notDeepEqual(edited.slides.overview, baseline.slides.overview)
  assert.deepEqual(edited.slides.costs, baseline.slides.costs)
  await page.locator('[data-u-command="univer.command.undo"]').click()
  await settle()
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getPresentation('marigold-board-deck').save().slides)),
    ),
    baseline.slides,
  )
  await page.locator('[data-u-command="univer.command.redo"]').click()
  await settle()
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getPresentation('marigold-board-deck').save().slides)),
    ),
    edited.slides,
  )
  report.checks.push('Native Undo/Redo target the child rich-text edit and preserve all other child pages')
  await tab('Cost ledger').click()
  await settle()
  await page.evaluate(() => {
    window.painted = []
    window.univerAPI.getWorkbook('marigold-monthly-review').getSheetByName('Cost ledger').getRange('C5').setValue(7500)
  })
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('marigold-monthly-review')
        .getSheetByName('Cost ledger')
        .getRange('C14')
        .getRawValue() === 42580,
  )
  await page.waitForFunction(() => window.painted.join('').includes('$42,580'))
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getPresentation('marigold-board-deck').save())),
    ),
    edited,
  )
  await tab('Assumptions').click()
  await page.waitForFunction(() => window.painted.join('').includes('Review scope'))
  await tab('Board review').click()
  await page.waitForFunction(() => window.painted.join('').includes('Keep participation open.'))
  report.checks.push(
    'Native round-trip through both host sheets retains child edits; host cost recalculation leaves child data unchanged',
  )
  await page.screenshot({ path: path.join(directory, 'edited-return.png'), fullPage: true })
  assert.deepEqual(report.errors, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.marigold-embed').count(), 0)
  assert.deepEqual(report.errors, [])
  report.checks.push('Selected teardown from active child tab leaves no browser errors')
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.painted = await page.evaluate(() => [...new Set(window.painted)].slice(0, 200)).catch(() => [])
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Slide@Sheet Tab')
