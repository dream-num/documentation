/* eslint-disable no-await-in-loop -- Verify the same live PDF owner across native navigation and theme changes. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'
const origin = new URL(process.env.SHOWCASE_DEMO_URL || 'http://localhost:4336').origin
let server
if (process.argv[2]) {
  const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
  const entry = manifest.find(({ slug }) => slug === 'pdfs/create-load-viewer')
  assert.ok(entry?.passed, 'Use a successfully built selected viewer export')
  const runtime = entry.links.find(({ name }) => name === 'vite')
  assert.equal(
    JSON.parse(await fs.readFile(path.join(runtime.target, 'package.json'), 'utf8')).version,
    runtime.version,
  )
  const { preview } = await import(pathToFileURL(path.join(runtime.target, 'dist/node/index.js')))
  server = await preview({
    root: entry.directory,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4449, strictPort: true },
  })
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-viewer-native-gallery')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const report = {
  passed: false,
  themeMode: server ? 'standalone-facade' : 'documentation-storage-event',
  locales: [],
  errors: [],
  networkWrites: [],
}
const page = await browser.newPage({ viewport: { width: 1500, height: 1050 }, colorScheme: 'light' })
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) && !r.headers()['next-action'])
    report.networkWrites.push(r.url())
})
const root = page.locator('.pdf-lifecycle')
function includesPack(actual, expected, prefix) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') includesPack(actual?.[key], value, prefix + '.' + key)
    else assert.equal(actual?.[key], value, prefix + '.' + key)
  }
}
try {
  for (const locale of ['en-US', 'zh-CN']) {
    if (server) {
      await page.unrouteAll()
      await page.route('http://127.0.0.1:4449/', async (route) => {
        const response = await route.fetch()
        await route.fulfill({
          response,
          body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${locale}">`),
        })
      })
    }
    await page.goto(server ? 'http://127.0.0.1:4449/' : origin + '/' + locale + '/playground/pdfs/create-load-viewer', {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    await page.locator('.pdf-lifecycle[data-ready="true"]').waitFor({ timeout: 90000 })
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    const locales = await page.evaluate(() => window.univerAPI.getLocales())
    for (const packageName of [
      '@univerjs/design',
      '@univerjs/ui',
      '@univerjs/docs-ui',
      '@univerjs/drawing-ui',
      '@univerjs-pro/pdfs-ui',
    ]) {
      includesPack(locales, (await import(packageName + '/locale/en-US')).default, packageName)
    }
    assert.equal(await root.locator('fieldset,output,pre,.lifecycle-controls,button[data-action]').count(), 0)
    const initial = await page.evaluate(() => {
      const pdf = window.univerAPI.getActivePdf()
      window.__pdfOwner = window.univerAPI
      return pdf.getPages().map((p) => ({
        id: p.getId(),
        size: p.getData().size,
        text: p.getTextBoxes().map((t) => t.getText()),
        tables: p.getTables().length,
        images: p.getImages().length,
        bounds: p.getElements().map((element) => element.getTransform()),
      }))
    })
    assert.deepEqual(
      initial.map((p) => p.id),
      ['portrait', 'landscape', 'square'],
    )
    assert.ok(initial[0].size.height > initial[0].size.width)
    assert.ok(initial[1].size.width > initial[1].size.height)
    assert.equal(initial[2].size.height, initial[2].size.width)
    assert.equal(initial[1].tables, 1)
    assert.equal(initial[2].images, 1)
    for (const item of initial) {
      for (const bounds of item.bounds) {
        assert.ok(bounds.left >= 0 && bounds.top >= 0)
        assert.ok(
          (bounds.left + bounds.width) * 12700 <= item.size.width + 1,
          item.id + ': element fits PDF-point page width',
        )
        assert.ok(
          (bounds.top + bounds.height) * 12700 <= item.size.height + 1,
          item.id + ': element fits PDF-point page height',
        )
      }
    }
    assert.match(initial[0].text.join(' '), /Portrait · editable text/)
    assert.doesNotMatch(initial.flatMap(({ text }) => text).join(' '), /[\u3400-\u9fff]/)
    for (const [index, id] of ['portrait', 'landscape', 'square'].entries()) {
      const input = root.locator('[data-pdf-footer] input').first()
      await input.fill(String(index + 1))
      await input.press('Enter')
      const canvas = root.locator('[data-pdf-active-page-id="' + id + '"] > canvas').first()
      await canvas.waitFor()
      await page.waitForTimeout(250)
      assert.ok(await canvas.evaluate((e) => e.width > 100 && e.height > 100))
      await page.screenshot({ path: path.join(directory, locale + '-' + id + '.png') })
    }
    const input = root.locator('[data-pdf-footer] input').first()
    await input.fill('1')
    await input.press('Enter')
    await root.locator('[data-pdf-active-page-id="portrait"]').waitFor()
    const editedText = 'Edited text survives the theme change'
    await page.evaluate(
      (text) =>
        window.univerAPI
          .getActivePdf()
          .getPageByIndex(0)
          .getTextBoxes()
          .find((t) => t.getId() === 'editable-text')
          .setText(text),
      editedText,
    )
    await page.waitForFunction(
      (text) =>
        window.univerAPI
          .getActivePdf()
          .getPageByIndex(0)
          .getTextBoxes()
          .find((t) => t.getId() === 'editable-text')
          .getText() === text,
      editedText,
    )
    const snapshot = await page.evaluate(() => window.univerAPI.getActivePdf().save())
    for (const theme of ['dark', 'light']) {
      if (server) {
        await page.evaluate((value) => window.univerAPI.toggleDarkMode(value === 'dark'), theme)
      } else {
        await page.evaluate((value) => {
          const oldValue = localStorage.getItem('theme')
          localStorage.setItem('theme', value)
          window.dispatchEvent(
            new StorageEvent('storage', { key: 'theme', oldValue, newValue: value, storageArea: localStorage }),
          )
        }, theme)
        await page.waitForFunction((value) => document.documentElement.classList.contains(value), theme)
      }
      await page.waitForTimeout(200)
      assert.equal(
        await page.evaluate(() => window.__pdfOwner === window.univerAPI),
        true,
        'Theme must preserve the SDK owner',
      )
      assert.deepEqual(
        await page.evaluate(() => window.univerAPI.getActivePdf().save()),
        snapshot,
        'Theme must preserve the entire edited snapshot',
      )
      await page.screenshot({ path: path.join(directory, locale + '-' + theme + '.png') })
    }
    report.locales.push({
      locale,
      pages: 3,
      nativePageNavigation: true,
      completeEnglishPacks: 5,
      facadeTextEdit: true,
      themeOwnerAndSnapshotPreserved: true,
    })
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.networkWrites, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true)
