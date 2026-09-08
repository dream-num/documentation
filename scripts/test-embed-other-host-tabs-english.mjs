/* eslint-disable no-await-in-loop -- Native tabs are checked sequentially in isolated exports. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-other-hosts-english/child-tabs')
await fs.mkdir(output, { recursive: true })
const sources = await readShowcaseSources()
const configs = [
  ['boards-in-bases-tab', 'bases', [['Service blueprint', 'A clear handoff']], 'Requests'],
  ['docs-in-bases-tab', 'bases', [['Editorial playbook', 'Useful stories, carefully told.']], 'Assignments'],
  ['slides-in-bases-tab', 'bases', [['Campaign review', 'Make room']], 'Deliverables'],
  ['sheets-in-bases-tab', 'bases', [['Weighted forecast', 'A forecast, not a promise']], 'Opportunities'],
  [
    'mixed-in-bases',
    'bases',
    [
      ['Weighted forecast', 'A forecast, not a promise'],
      ['Delivery playbook', 'Build once. Travel thoughtfully.'],
      ['Studio review', 'Make room for the journey'],
      ['Service blueprint', 'The return journey matters.'],
    ],
    'Follow-ups',
  ],
  ['bases-in-slides-tab', 'slides', [['copper-launch-workstream-page', 'Counter demonstration']], 'cover'],
  ['boards-in-slides-tab', 'slides', [['kite-retrospective-page', 'Buddy trial']], 'cover'],
  ['docs-in-slides-tab', 'slides', [['mosaic-research-appendix-page', 'Methods before conclusions.']], 'cover'],
  ['sheets-in-slides-tab', 'slides', [['aster-pilot-appendix-page', 'Eight weeks on air']], 'cover'],
  [
    'mixed-in-slides',
    'slides',
    [
      ['beacon-review-doc-page', 'bounded trial'],
      ['beacon-review-base-page', 'Tool inventory'],
      ['beacon-review-board-page', 'Prepare, run, review.'],
      ['economics', 'Pilot cost model'],
    ],
    'cover',
  ],
  [
    'mixed-in-sheets',
    'sheets',
    [
      ['Decision memo', 'A small pilot'],
      ['Supplier operations', 'Quay Rooms'],
      ['Delivery workflow', 'Prepare, deliver, learn.'],
    ],
    'Pilot budget',
  ],
]
const browser = await chromium.launch()
const results = []
try {
  for (const [name, host, targets, parent] of configs) {
    if (process.argv.length > 3 && !process.argv.slice(3).includes(name)) continue
    const result = { slug: 'embed/' + name, passed: false, children: [], errors: [] }
    results.push(result)
    let server, context, page
    try {
      const entry = manifest.find((e) => e.slug === result.slug)
      assert.ok(entry?.passed)
      const source = sources.find((e) => e.slug === result.slug)
      for (const [file, text] of Object.entries(source.files))
        assert.equal(await fs.readFile(path.join(entry.directory, file.slice(1)), 'utf8'), text, file)
      const vite = entry.links.find((e) => e.name === 'vite').target
      const { preview } = await import(pathToFileURL(path.join(vite, 'dist/node/index.js')))
      server = await preview({
        configFile: false,
        root: entry.directory,
        preview: { host: '127.0.0.1', port: 4450, strictPort: true },
      })
      context = await browser.newContext({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
      await context.addInitScript(() => {
        window.childPaint = []
        const fill = CanvasRenderingContext2D.prototype.fillText
        CanvasRenderingContext2D.prototype.fillText = function (...args) {
          // SDK text can paint through detached cache canvases. Assert the authored
          // child-specific phrase after the native click, then inspect its visible surface.
          window.childPaint.push(String(args[0]))
          if (window.childPaint.length > 20000) window.childPaint.splice(0, 10000)
          return Reflect.apply(fill, this, args)
        }
      })
      page = await context.newPage()
      page.setDefaultTimeout(10000)
      page.on('pageerror', (e) => result.errors.push(e.stack || e.message))
      page.on('console', (m) => {
        if (m.type() === 'error') result.errors.push(m.text())
      })
      await page.route('http://127.0.0.1:4450/', async (route) => {
        const response = await route.fetch()
        await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, '<html lang="zh-CN">') })
      })
      await page.goto('http://127.0.0.1:4450/', { waitUntil: 'load', timeout: 30000 })
      await page.waitForFunction(() => document.querySelector('#app [data-ready="true"]'), {}, { timeout: 30000 })
      assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN')
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      result.descriptors = await page.evaluate(() => window.univerAPI.listEmbeds().map((e) => e.getDescriptor()))
      const nativeTab = (id) =>
        host === 'slides'
          ? page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')
          : host === 'sheets'
            ? page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: id })
            : page.getByText(id, { exact: true })
      const childSelector =
        host === 'bases'
          ? '[data-embed-bases-table-list-host]'
          : host === 'slides'
            ? '[data-embed-slides-page-list-host]'
            : '[data-embed-sheets-sheet-tab-host]'
      for (const [id, phrase] of targets) {
        const childResult = { id, phrase, passed: false }
        result.children.push(childResult)
        try {
          await page.evaluate(() => {
            window.childPaint = []
          })
          await nativeTab(id).click()
          const selector = id === 'economics' ? '[data-u-comp="embed-float-dom"]' : childSelector
          const child = page.locator(selector).filter({ visible: true }).last()
          await child.waitFor()
          await page.waitForFunction((text) => window.childPaint.join('').includes(text), phrase, { timeout: 10000 })
          childResult.paint = await page.evaluate(() => window.childPaint.slice(0, 1000))
          const visibleText = await page.locator('#app').innerText()
          assert.doesNotMatch(visibleText + childResult.paint.join(''), /[\u3400-\u9fff]/)
          assert.doesNotMatch(visibleText, /\b(?:base|slides|board|sheets|docs|embed|ink)\.[a-z][\w.]+/)
          childResult.styles = await child.evaluate((e) => {
            const style = getComputedStyle(e)
            return {
              background: style.backgroundColor,
              white: style.getPropertyValue('--univer-gray-0').trim(),
              width: e.getBoundingClientRect().width,
              height: e.getBoundingClientRect().height,
              canvases: [...e.querySelectorAll('canvas')].map((c) => ({ width: c.width, height: c.height })),
            }
          })
          assert.ok(childResult.styles.white)
          assert.ok(childResult.styles.width > 300 && childResult.styles.height > 300)
          assert.ok(childResult.styles.canvases.some((c) => c.width > 300 && c.height > 300))
          childResult.screenshot = name + '-' + id.replaceAll(' ', '-') + '.png'
          await page.screenshot({ path: path.join(output, childResult.screenshot) })
          childResult.passed = true
        } catch (e) {
          childResult.failure = e.stack
          await page.screenshot({ path: path.join(output, name + '-' + id.replaceAll(' ', '-') + '-failure.png') })
        }
      }
      // Keep the existing native same-tab reselection failure observable, after child coverage.
      result.reselection = { passed: false }
      try {
        const first = targets[0][0]
        await nativeTab(first).click()
        await nativeTab(first).click()
        const returnTab =
          host === 'slides' ? page.locator('[data-u-comp="slide-thumbnail-item"]').first() : nativeTab(parent)
        await returnTab.click({ timeout: 5000 })
        await page.waitForFunction(
          (selector) =>
            ![...document.querySelectorAll(selector)].some(
              (e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0,
            ),
          childSelector,
          { timeout: 5000 },
        )
        result.reselection.passed = true
      } catch (e) {
        result.reselection.failure = e.stack
        await page.screenshot({ path: path.join(output, name + '-reselection-failure.png') })
      }
      assert.deepEqual(result.errors, [])
      assert.ok(
        result.children.every((e) => e.passed),
        'Every authored child paints after native navigation',
      )
      assert.ok(result.reselection.passed, 'Reselecting a native child must not block leaving it')
      result.passed = true
    } catch (e) {
      result.failure = e.stack
    } finally {
      await context?.close()
      await server?.close()
      await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(results, null, 2))
      console.log(
        JSON.stringify({
          slug: result.slug,
          passed: result.passed,
          children: result.children.map(({ id, passed, failure }) => ({ id, passed, failure })),
          reselection: result.reselection,
          errors: result.errors,
          failure: result.failure,
        }),
      )
    }
  }
} finally {
  await browser.close()
}
assert.ok(
  results.every((e) => e.passed),
  'All native tab checks must pass; retained failures are not normalized',
)
