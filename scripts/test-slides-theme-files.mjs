/* eslint-disable no-await-in-loop -- Exercise the same native flow in both locales. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-theme-frontend-only')
await fs.mkdir(directory, { recursive: true })
const manifest = JSON.parse(await fs.readFile(process.env.SHOWCASE_EXPORT_MANIFEST, 'utf8'))
const entry = manifest.find((item) => item.slug === 'slides/theme-and-background')
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
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true })
    page.on('pageerror', (e) => report.errors.push(e.message))
    page.on('console', (e) => {
      if (e.type() === 'error') report.errors.push(e.text())
    })
    page.on('request', (r) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) report.networkWrites.push(r.url())
    })
    await page.addInitScript((lang) => {
      new MutationObserver(() => {
        document.documentElement.lang = lang
      }).observe(document, { childList: true })
    }, locale)
    const result = { locale }
    report.locales.push(result)
    try {
      await page.goto('http://127.0.0.1:4427', { timeout: 120000 })
      const root = page.locator('.slide-theme-demo[data-ready=true]')
      await root.waitFor({ timeout: 90000 })
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), locale === 'zh-CN' ? 'zhCN' : 'enUS')
      assert.equal(await root.evaluate((el) => getComputedStyle(el).fontFamily), 'Arial, sans-serif')
      const snapshot = await page.evaluate(() => window.univerAPI.getActivePresentation().save())
      assert.equal(snapshot.slideOrder.length, 8)
      await page.screenshot({ path: path.join(directory, locale + '-native.png') })
      assert.equal(await root.locator('[data-u-command="slides-exchange-client.operation.exchange"]').count(), 0)
      assert.equal(
        await root
          .locator('[data-u-comp="workbench-layout"]')
          .first()
          .evaluate((el) => getComputedStyle(el).backgroundColor),
        'rgb(255, 255, 255)',
      )
      result.frontendOnly = true
    } catch (error) {
      result.failure = error.stack
      await page.screenshot({ path: path.join(directory, locale + '-failure.png') }).catch(() => {})
    }
    try {
      await page.keyboard.press('Escape')
      await page.locator('[data-u-command="slide.operation.print-open"]').click()
      await page.getByText(locale === 'zh-CN' ? '打印范围' : 'Print range', { exact: true }).waitFor({ timeout: 60000 })
      result.printText = await page.locator('body').innerText()
      assert.ok(result.printText.includes(locale === 'zh-CN' ? '共 8 页' : 'Total 8 pages'))
      assert.doesNotMatch(result.printText, /slides-print\.|slides-exchange-client\.|shape-editor\./)
      await page.screenshot({ path: path.join(directory, locale + '-print.png') })
      await page.getByRole('button', { name: locale === 'zh-CN' ? '取消' : 'Cancel', exact: true }).click()
      result.printSettings = true
    } catch (error) {
      result.printFailure = error.stack
    }
    await page.close()
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.networkWrites, [])
  assert.ok(report.locales.every((item) => item.frontendOnly && item.printSettings))
  report.passed = true
} catch (error) {
  report.failure = error.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.equal(report.passed, true, report.failure)
console.log('PASS frontend-only Slides and native print settings')
