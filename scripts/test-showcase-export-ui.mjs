/* eslint-disable no-await-in-loop -- Inspect selected independent builds sequentially on one port. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

// The explicit manifest lists already exported, installed and built projects.
// This checks original source parity and live SDK styling, not every feature.
assert.ok(process.argv[2], 'Pass an export manifest containing slug and directory for each selected project')
const exports = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
assert.ok(Array.isArray(exports) && exports.length > 0)
const sources = await readShowcaseSources()
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/showcase-export-ui')
const previewPort = Number(process.env.SHOWCASE_EXPORT_PORT || 4190)
const englishHostCheck = process.env.SHOWCASE_ENGLISH_ONLY === '1'
assert.ok(Number.isInteger(previewPort) && previewPort > 0 && previewPort <= 65535, 'Valid preview port required')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const results = []
try {
  for (const entry of exports) {
    const source = sources.find(({ slug }) => slug === entry.slug)
    assert.ok(source, `Unknown case: ${entry.slug}`)
    const result = { slug: entry.slug, directory: entry.directory, errors: [], passed: false }
    results.push(result)
    let server, context
    try {
      for (const [name, expected] of Object.entries(source.files))
        assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), expected, name)
      result.sourceFiles = Object.keys(source.files).length
      const viteLink = entry.links?.find(({ name }) => name === 'vite')
      const viteDirectory = viteLink?.target || path.join(entry.directory, 'node_modules/vite')
      const vitePackage = JSON.parse(await fs.readFile(path.join(viteDirectory, 'package.json'), 'utf8'))
      const exportedPackage = JSON.parse(source.files['/package.json'])
      assert.equal(vitePackage.version, exportedPackage.devDependencies.vite, 'Exact exported Vite runtime')
      const { preview } = await import(pathToFileURL(path.join(viteDirectory, 'dist/node/index.js')))
      server = await preview({
        configFile: false,
        root: entry.directory,
        preview: { host: '127.0.0.1', port: previewPort, strictPort: true },
      })
      context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
      await context.addInitScript(() => {
        window.sdkPaint = { watermark: false, texts: [] }
        const fillText = CanvasRenderingContext2D.prototype.fillText
        CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
          if (String(text).includes('Hello, Univer!')) window.sdkPaint.watermark = true
          if (window.sdkPaint.texts.length < 1000) window.sdkPaint.texts.push(String(text))
          return fillText.call(this, text, ...args)
        }
      })
      const page = await context.newPage()
      if (englishHostCheck) {
        await page.route(`http://127.0.0.1:${previewPort}/`, async (route) => {
          const response = await route.fetch()
          await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, '<html lang="zh-CN">') })
        })
      }
      page.setDefaultTimeout(30000)
      page.on('pageerror', (error) => result.errors.push(error.stack || error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') result.errors.push(message.text())
      })
      const collaborationRequests = []
      page.on('request', (request) => {
        if (request.url().includes('/universer-api/')) collaborationRequests.push(request.url())
      })
      page.on('websocket', (socket) => collaborationRequests.push(socket.url()))
      await page.goto(`http://127.0.0.1:${previewPort}/`, { waitUntil: 'load' })
      if (entry.slug === 'embed/lazy-load-editor') await page.locator('.lazy-editor-target').scrollIntoViewIfNeeded()
      const workbench = page.locator(
        entry.slug === 'sheets/mobile-via-plugin' ? '[data-u-comp="app-layout"]' : '[data-u-comp="workbench-layout"]',
      )
      await workbench.waitFor()
      // The formula-bar canvas can appear before the actual sheet grid.
      await page.waitForFunction(() =>
        [...document.querySelectorAll('#app canvas')].some((canvas) => {
          const bounds = canvas.getBoundingClientRect()
          return bounds.width > 100 && bounds.height > 100 && canvas.width > 100 && canvas.height > 100
        }),
      )
      await page.waitForFunction(() => window.sdkPaint.texts.length > 0)
      await page.waitForFunction(() => {
        const api = window.univerAPI
        return !api?.getCurrentLifecycleStage || api.getCurrentLifecycleStage() >= api.Enum.LifecycleStages.Steady
      })
      await page.waitForFunction(() =>
        [...document.querySelectorAll('#app [data-ready]')].every(
          (element) => element.getAttribute('data-ready') === 'true',
        ),
      )
      if (entry.slug === 'sheets/custom-formula')
        await page.waitForFunction(() => {
          const sheet = window.univerAPI?.getActiveWorkbook()?.getActiveSheet()
          return (
            sheet?.getRange('B13').getValue() === 35 &&
            sheet.getRange('F11').getValue() === 18 &&
            Number(document.querySelector('[data-source="pending"]')?.textContent) === 0
          )
        })
      if (['sheets/watermark', 'docs/watermark', 'sheets/basic-via-preset'].includes(entry.slug))
        await page.waitForFunction(() => window.sdkPaint.watermark)
      await page.evaluate(async () => {
        await document.fonts.ready
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      })
      // Native canvases can paint underneath the startup overlay. Neither their
      // existence nor an empty data-ready query proves that users can see them.
      await page.waitForFunction(() => !document.querySelector('#app [data-u-comp="workbench-skeleton-content"]'))
      result.startupOverlayAbsent = true
      result.styles = await workbench.evaluate((element) => {
        const styles = getComputedStyle(element)
        const flex = element.querySelector('.univer-flex')
        return {
          background: styles.backgroundColor,
          width: element.getBoundingClientRect().width,
          height: element.getBoundingClientRect().height,
          flexDisplay: flex && getComputedStyle(flex).display,
          sdkWhite: styles.getPropertyValue('--univer-gray-0').trim(),
          canvases: [...element.querySelectorAll('canvas')].map((canvas) => ({
            width: canvas.width,
            height: canvas.height,
          })),
        }
      })
      if (
        [
          'embed/slides-in-sheets-float',
          'embed/slides-in-sheets-tab',
          'embed/boards-in-sheets-float',
          'embed/boards-in-sheets-tab',
          'embed/bases-in-sheets-float',
          'embed/bases-in-sheets-tab',
          'embed/docs-in-sheets-float',
          'embed/docs-in-sheets-tab',
          'slides/layouts-and-placeholders',
          'docs-modern/incident-postmortem',
          'docs-modern/product-brief',
          'docs-modern/company-knowledge-base',
          'docs-traditional/research-paper',
          'docs-traditional/services-agreement',
          'sheets/basic-via-plugin',
          'sheets/basic-via-preset',
        ].includes(entry.slug)
      ) {
        result.nativeFont = await workbench.evaluate((element) => getComputedStyle(element).fontFamily)
        assert.match(result.nativeFont, /Arial/, 'Independent Embed UI must not inherit browser-default serif fonts')
      }
      assert.equal(await workbench.count(), 1)
      assert.equal(result.styles.background, 'rgb(255, 255, 255)', 'Native light workbench is opaque white')
      assert.equal(result.styles.flexDisplay, 'flex', 'Native SDK layout utilities are loaded')
      assert.ok(result.styles.sdkWhite, 'SDK theme variables are loaded')
      if (entry.slug === 'sheets/mobile-via-plugin') assert.equal(result.styles.width, 390)
      assert.ok(result.styles.height >= 600)
      assert.ok(result.styles.canvases.some(({ width, height }) => width > 100 && height > 100))
      if (entry.slug === 'sheets/univer-pro-collaboration') {
        result.collaborationRequests = collaborationRequests
        assert.deepEqual(collaborationRequests, [], 'Frontend-only default must not contact Universer')
        assert.equal(await page.locator('.collaboration-demo').getAttribute('data-mode'), 'local-fallback')
      }
      result.paint = await page.evaluate(() => ({
        watermark: window.sdkPaint.watermark,
        textDraws: window.sdkPaint.texts.length,
      }))
      if (englishHostCheck) {
        assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN')
        const visibleText = await page.locator('#app').innerText()
        const paintedText = await page.evaluate(() => window.sdkPaint.texts.join('\n'))
        assert.doesNotMatch(
          visibleText + paintedText,
          /[\u3400-\u9fff]/,
          'Native startup stays English on a Chinese host',
        )
        result.englishOnChineseHost = true
        // This inspects the initial visible UI and first canvas text batch, not every menu or page.
      }
      if (entry.slug === 'sheets/permission') {
        await page.getByText('Unprotected', { exact: true }).last().click()
        const box = page.locator('.permission-shadow-editor input.univer-size-full')
        await box.fill('C4')
        await box.press('Enter')
        assert.ok(await page.evaluate(() => document.getSelection().rangeCount > 0), 'Export has a native caret')
        await page.keyboard.type('17')
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getSheetBySheetId('none').getRange('C4').getValue() === 17,
        )
        result.nativeInput = true
      }
      await page.screenshot({ path: path.join(directory, `${entry.slug.replace('/', '-')}.png`) })
      assert.deepEqual(result.errors, [])
      result.passed = true
    } catch (error) {
      result.failure = error.stack || String(error)
    } finally {
      await context?.close()
      await server?.close()
      await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(results, null, 2))
      console.log(JSON.stringify(result))
    }
  }
} finally {
  await browser.close()
}
assert.ok(
  results.every(({ passed }) => passed),
  'Every selected independent build must preserve source and native SDK styling',
)
