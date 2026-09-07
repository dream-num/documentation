/* eslint-disable no-await-in-loop -- Verify this one independent PDF export and both native pages. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-markup-export-startup')
await fs.mkdir(directory, { recursive: true })
const [entry] = JSON.parse(await fs.readFile('test-results/pdf-markup-native-export/exports.json', 'utf8'))
assert.equal(entry.slug, 'pdfs/text-markup')
const exportedCase = (await readShowcaseSources()).find((c) => c.slug === entry.slug)
const report = { passed: false, sourceFiles: 0, gates: {}, pages: [], errors: [], warnings: [], backendRequests: [] }
let server, browser
try {
  for (const [name, text] of Object.entries(exportedCase.files))
    assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), text, name)
  report.sourceFiles = Object.keys(exportedCase.files).length
  const { preview } = await import(pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js')))
  server = await preview({
    configFile: false,
    root: entry.directory,
    preview: { host: '127.0.0.1', port: 4360, strictPort: true },
  })
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
  page.setDefaultTimeout(15000)
  page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') report.errors.push(m.text())
    if (m.type() === 'warning') report.warnings.push(m.text())
  })
  page.on('request', (r) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
      r.url().includes('/universer-api/') ||
      (['fetch', 'xhr'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
    )
      report.backendRequests.push(r.url())
  })
  page.on('websocket', (s) => report.backendRequests.push(s.url()))
  await page.addInitScript(() => {
    window.pdfStartupFrames = new Map()
    const fill = CanvasRenderingContext2D.prototype.fillText,
      clear = CanvasRenderingContext2D.prototype.clearRect,
      draw = CanvasRenderingContext2D.prototype.drawImage
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      window.pdfStartupFrames.set(this.canvas, [])
      return Reflect.apply(clear, this, args)
    }
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      const texts = window.pdfStartupFrames.get(this.canvas) || []
      texts.push(String(args[0]))
      if (texts.length > 50000) texts.splice(0, texts.length - 50000)
      window.pdfStartupFrames.set(this.canvas, texts)
      return Reflect.apply(fill, this, args)
    }
    CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
      if (source !== this.canvas) {
        const texts = window.pdfStartupFrames.get(this.canvas) || []
        texts.push(...(window.pdfStartupFrames.get(source) || []))
        if (texts.length > 50000) texts.splice(0, texts.length - 50000)
        window.pdfStartupFrames.set(this.canvas, texts)
      }
      return Reflect.apply(draw, this, [source, ...args])
    }
  })
  await page.goto('http://127.0.0.1:4360', { waitUntil: 'domcontentloaded' })
  const root = page.locator('.pdf-markup')
  await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 60000 })
  await page.locator('#app [data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
  assert.equal(await root.getAttribute('data-error'), null)
  report.gates.explicitReadyAndNoSkeleton = true
  const nativeModel = await page.evaluate(() => ({
    pages: window.univerAPI.getActivePdf().getPages().length,
    marks: window.univerAPI
      .getActivePdf()
      .getPages()
      .flatMap((p) => p.getAnnotations().map((a) => ({ id: a.getId(), type: a.getAnnotationType() }))),
  }))
  assert.equal(nativeModel.pages, 2)
  assert.deepEqual(
    nativeModel.marks.map((m) => m.type),
    ['highlight', 'underline', 'strikeout'],
  )
  report.gates.nativeTwoPagesThreeMarks = true
  report.styles = await root
    .locator('[data-u-comp="workbench-layout"]')
    .evaluate((e) => ({
      background: getComputedStyle(e).backgroundColor,
      width: e.getBoundingClientRect().width,
      height: e.getBoundingClientRect().height,
    }))
  assert.equal(report.styles.background, 'rgb(255, 255, 255)')
  async function painted(index, words) {
    const id = await page.evaluate((i) => window.univerAPI.getActivePdf().getPageByIndex(i).getId(), index)
    await page.waitForFunction(
      ({ id: expectedPageId, words: expectedWords }) =>
        [...window.pdfStartupFrames.entries()].some(
          ([c, frame]) =>
            c.isConnected &&
            c.parentElement?.getAttribute('data-pdf-active-page-id') === expectedPageId &&
            expectedWords.every((w) => frame.join('').includes(w)),
        ),
      { id, words },
      { timeout: 30000 },
    )
    const canvas = root.locator('[data-pdf-active-page-id="' + id + '"] > canvas').first()
    const colors = await canvas.evaluate((c, i) => {
      const result = []
      for (const [top, color] of i === 0
        ? [
            [218, 'yellow'],
            [350, 'blue'],
          ]
        : [
            [218, 'red'],
            [248, 'red'],
          ]) {
        const sx = c.width / 595.276,
          sy = c.height / 841.89
        const data = c
          .getContext('2d')
          .getImageData(Math.round(48 * sx), Math.round(top * sy), Math.round(435 * sx), Math.round(26 * sy)).data
        let count = 0
        for (let p = 0; p < data.length; p += 4) {
          const r = data[p],
            g = data[p + 1],
            b = data[p + 2]
          if (
            color === 'yellow'
              ? r > 180 && g > 150 && b < 170
              : color === 'blue'
                ? b > 150 && r < 120 && g < 160
                : r > 150 && g < 130 && b < 130
          )
            count++
        }
        result.push({ top, color, count })
      }
      return result
    }, index)
    assert.ok(
      colors.every((c) => c.count > 40),
      'Actual annotation-colored pixels on page ' + (index + 1),
    )
    report.pages.push({ index, words, colors })
  }
  await painted(0, [
    'Dates and commercial terms',
    'Renewal review: 30 September 2027',
    'Proposed annual fee: USD 18,450.00',
  ])
  await page.screenshot({ path: path.join(directory, 'pdfs-text-markup.png') })
  report.gates.firstPageActualTextAndMarks = true
  await root.getByRole('button', { name: '2', exact: true }).click({ position: { x: 10, y: 10 } })
  await painted(1, [
    'Change-request procedure',
    'Old draft: paper-only change requests are required.',
    'Old draft: email submissions will not be accepted.',
  ])
  await page.screenshot({ path: path.join(directory, 'second-page-native.png') })
  report.gates.secondPageActualTextAndStrikeout = true
  await root.getByRole('button', { name: '1', exact: true }).click({ position: { x: 10, y: 10 } })
  await painted(0, ['Dates and commercial terms'])
  const bounds = await root.locator('[data-pdf-active-page-id] > canvas').first().boundingBox()
  await page.mouse.click(bounds.x + (170 * bounds.width) / 595.276, bounds.y + (229 * bounds.height) / 841.89)
  await page.getByRole('tab', { name: 'View', exact: true }).click()
  await page.getByRole('button', { name: 'Properties', exact: true }).click()
  const fields = await page.locator('[data-pdf-inspector] input').evaluateAll((es) => es.map((e) => e.value))
  assert.deepEqual(fields.slice(0, 4), ['64.00 px', '291.00 px', '440.00 px', '29.00 px'])
  report.gates.nativePointerSelectionAndProperties = true
  await page.screenshot({ path: path.join(directory, 'native-interactive.png') })
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await root.waitFor({ state: 'detached' })
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  report.gates.disposal = true
  // Serve the same export with Chinese page language before its module initializes.
  // No Facade setLocale call: this specifically proves the initial-language branch.
  await page.route('http://127.0.0.1:4360/', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, '<html lang="zh-CN">') })
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 60000 })
  await page.locator('#app [data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
  await painted(0, ['Dates and commercial terms', 'Renewal review: 30 September 2027'])
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN')
  await page.getByRole('tab', { name: '视图', exact: true }).click()
  await page.getByRole('button', { name: '属性', exact: true }).waitFor()
  await page.getByRole('tab', { name: '开始', exact: true }).click()
  await page.locator('[data-u-command="pdf.menu.tool.highlight"]').hover()
  await page.getByRole('tooltip').filter({ hasText: '高亮' }).waitFor()
  assert.equal(/pdfs-ui\.[\w.-]+/.test(await page.locator('body').innerText()), false)
  report.gates.initialChineseNativeLabels = true
  await page.screenshot({ path: path.join(directory, 'initial-zh-CN.png') })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser?.close()
  await server?.httpServer.close()
}
if (!report.passed) process.exitCode = 1
