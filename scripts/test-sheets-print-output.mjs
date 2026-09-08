/* eslint-disable no-await-in-loop -- Inspect both real localized print flows. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheets-print-output')
await fs.mkdir(directory, { recursive: true })
const manifest = JSON.parse(await fs.readFile(process.env.SHOWCASE_EXPORT_MANIFEST, 'utf8'))
const entry = manifest.find((item) => item.slug === 'sheets/print')
assert.ok(entry?.passed)
const { preview } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const server = await preview({
  configFile: false,
  root: entry.directory,
  preview: { host: '127.0.0.1', port: 4427, strictPort: true },
})
const browser = await chromium.launch()
const report = { passed: false, locales: [], errors: [], networkWrites: [] }
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
    page.setDefaultTimeout(30000)
    let phase = 'startup'
    page.on('pageerror', (error) => report.errors.push({ locale, phase, stack: error.stack || error.message }))
    page.on('console', (message) => {
      if (message.type() === 'error') report.errors.push(message.text())
    })
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) report.networkWrites.push(request.url())
    })
    await page.addInitScript((lang) => {
      new MutationObserver(() => {
        document.documentElement.lang = lang
      }).observe(document, { childList: true })
      window.printPaint = new Map()
      const original = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (...args) {
        const values = window.printPaint.get(this.canvas) || []
        values.push(String(args[0]))
        window.printPaint.set(this.canvas, values)
        return original.apply(this, args)
      }
      // Preserve SDK onbeforeprint rendering. Only suppress the operating-system dialog.
      window.print = () => {
        window.dispatchEvent(new Event('beforeprint'))
        window.printInvocations = (window.printInvocations || 0) + 1
      }
    }, locale)
    const result = { locale }
    report.locales.push(result)
    try {
      await page.goto('http://127.0.0.1:4427', { timeout: 120000 })
      await page.locator('.print-demo[data-ready=true]').waitFor({ timeout: 90000 })
      const snapshot = await page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
      const label = locale === 'zh-CN' ? '打印' : 'Print'
      phase = 'default-settings'
      await page.getByText(label, { exact: true }).first().click()
      await page.getByText(label, { exact: true }).last().click()
      await fs.writeFile(path.join(directory, locale + '-settings.txt'), await page.locator('body').innerText())
      phase = 'default-next-beforeprint'
      await page.getByRole('button', { name: locale === 'zh-CN' ? '下一步' : 'NEXT', exact: true }).click()
      await page.waitForFunction(() => window.printInvocations === 1, undefined, { timeout: 60000 })
      phase = 'default-rendered-pages'
      result.pages = await page.locator('.printing-canvas-container canvas').evaluateAll((canvases) =>
        canvases.map((canvas) => ({
          width: canvas.width,
          height: canvas.height,
          text: window.printPaint.get(canvas) || [],
          image: canvas.toDataURL('image/png'),
          ink: [...canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data].filter(
            (v, i) => i % 4 !== 3 && v > 0 && v < 240,
          ).length,
        })),
      )
      for (const [index, paper] of result.pages.entries()) {
        await fs.writeFile(
          path.join(directory, `${locale}-output-${index + 1}.png`),
          Buffer.from(paper.image.split(',')[1], 'base64'),
        )
        delete paper.image
      }
      result.printStyles = await page.locator('style.offline-printing-css').textContent()
      assert.equal(result.pages.length, 2)
      assert.ok(result.pages.every((paper) => paper.ink > 100 && paper.height > paper.width))
      const text = result.pages.flatMap((paper) => paper.text).join('\n')
      for (const value of ['Michael Wang', 'Ray Li', 'Lisa Zhang', 'Portfolio review', 'Market Value', 'Profit/Loss'])
        assert.ok(text.includes(value), value)
      assert.match(result.printStyles, /page-break-after:\s*always/)
      phase = 'default-print-media'
      await page.emulateMedia({ media: 'print' })
      await page
        .locator('.printing-canvas-container')
        .screenshot({ path: path.join(directory, locale + '-print-dom.png') })
      await page.emulateMedia({ media: 'screen' })
      phase = 'default-afterprint'
      await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
      await page.locator('.printing-canvas-container').waitFor({ state: 'detached' })
      assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveWorkbook().save()), snapshot)
      phase = 'fit-width-settings'
      await page.getByText(label, { exact: true }).first().click()
      await page.getByText(label, { exact: true }).last().click()
      await page.getByText(locale === 'zh-CN' ? '正常 (100%)' : 'Normal (100%)', { exact: true }).click()
      await page.getByText(locale === 'zh-CN' ? '适合宽度' : 'Fit to width', { exact: true }).click()
      await page.getByText(locale === 'zh-CN' ? '打印页数：1页' : 'Total: 1pages', { exact: true }).waitFor()
      phase = 'fit-width-next-beforeprint'
      await page.getByRole('button', { name: locale === 'zh-CN' ? '下一步' : 'NEXT', exact: true }).click()
      await page.waitForFunction(() => window.printInvocations === 2, undefined, { timeout: 60000 })
      phase = 'fit-width-rendered-pages'
      const fitted = page.locator('.printing-canvas-container canvas')
      assert.equal(await fitted.count(), 1)
      result.fitWidth = await fitted.evaluate((canvas) => ({
        width: canvas.width,
        height: canvas.height,
        text: window.printPaint.get(canvas) || [],
        image: canvas.toDataURL('image/png'),
        ink: [...canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data].filter(
          (v, i) => i % 4 !== 3 && v > 0 && v < 240,
        ).length,
      }))
      await fs.writeFile(
        path.join(directory, locale + '-fit-width.png'),
        Buffer.from(result.fitWidth.image.split(',')[1], 'base64'),
      )
      delete result.fitWidth.image
      assert.ok(result.fitWidth.ink > 100)
      assert.equal(result.fitWidth.width, 794)
      assert.equal(result.fitWidth.height, 1124)
      for (const value of [
        'Account Name',
        'Michael Wang',
        'Lisa Zhang',
        'Portfolio review',
        'Profit/Loss',
        'Update Time',
      ]) {
        assert.ok(result.fitWidth.text.includes(value), value)
      }
      phase = 'fit-width-afterprint'
      await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
      await page.locator('.printing-canvas-container').waitFor({ state: 'detached' })
      assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveWorkbook().save()), snapshot)
      result.passed = true
    } catch (error) {
      result.failure = error.stack
      await fs.writeFile(path.join(directory, locale + '-failure-dom.txt'), await page.locator('body').innerText())
      await page.screenshot({ path: path.join(directory, locale + '-failure.png') })
    }
    phase = 'page-close'
    await page.close()
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.networkWrites, [])
  assert.ok(report.locales.every((result) => result.passed))
  report.passed = true
} catch (error) {
  report.failure = error.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.equal(report.passed, true, report.failure)
console.log('PASS native Sheets final print pages in EN/ZH; no system print job')
