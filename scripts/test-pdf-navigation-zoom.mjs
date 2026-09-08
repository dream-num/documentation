/* eslint-disable no-await-in-loop -- Native navigation and zoom checks are sequential. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'
const manifestPath = process.argv[2]
const entry = JSON.parse(await fs.readFile(manifestPath, 'utf8')).find(
  (item) => item.slug === 'pdfs/page-navigation-and-zoom',
)
assert.ok(entry?.passed)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-navigation-zoom')
await fs.mkdir(output, { recursive: true })
const recipes = [
  ...(await fs.readFile('showcase/pdfs/page-navigation-and-zoom/README.md', 'utf8')).matchAll(
    /```ts\r?\n([\s\S]*?)```/g,
  ),
].map((match) => match[1])
assert.equal(recipes.length, 3)
const vite = entry.links.find((item) => item.name === 'vite')
const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4452, strictPort: true },
})
const browser = await chromium.launch()
const results = []
const shapes = [
  ['itinerary', 420, 900],
  ['route', 1000, 360],
  ['legend', 520, 520],
  ['receipt', 340, 620],
]
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, locale })
    page.setDefaultTimeout(12000)
    const result = { locale, passed: false, gates: [], errors: [] }
    results.push(result)
    page.on('pageerror', (error) => result.errors.push(String(error)))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.route('http://127.0.0.1:4452/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${locale}">`) })
    })
    const snapshot = () => page.evaluate(() => window.univerAPI.getActivePdf().save())
    const shot = (name) => page.screenshot({ path: path.join(output, `${locale}-${name}.png`) })
    const zoom = () => page.locator('[data-pdf-footer] input').nth(1)
    const active = (id) => page.locator(`[data-pdf-active-page-id="${id}"] > canvas`).first()
    try {
      await page.goto('http://127.0.0.1:4452/')
      await page.locator('[data-ready=true]').waitFor({ timeout: 60000 })
      await page.waitForTimeout(300)
      const saved = await snapshot()
      const initialBox = await active('itinerary').boundingBox()
      const scrollBox = await page.locator('[data-pdf-scroll-container]').boundingBox()
      assert.ok(initialBox.x >= scrollBox.x && initialBox.y >= scrollBox.y)
      assert.ok(initialBox.x + initialBox.width <= scrollBox.x + scrollBox.width + 1)
      assert.ok(initialBox.y + initialBox.height <= scrollBox.y + scrollBox.height + 1)
      await shot('initial-fit')
      result.gates.push('initial page fits the settled sidebar viewport')
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      result.fitGeometry = []
      for (const [id, width, height] of shapes) {
        const thumbnail = page.locator(`[data-pdf-thumbnail-page-id="${id}"]`)
        const button = page.locator('[data-pdf-page-thumbnail-active]').filter({ has: thumbnail })
        await button.click({ position: { x: 10, y: 190 } })
        await active(id).waitFor()
        await page.waitForTimeout(250)
        const box = await active(id).boundingBox()
        const viewport = await page
          .locator('[data-pdf-scroll-container]')
          .evaluate((node) => ({ width: node.clientWidth, height: node.clientHeight }))
        const expected = Math.min(
          4,
          Math.max(
            0.35,
            Math.min((viewport.width - 48) / ((width * 4) / 3), (viewport.height - 48) / ((height * 4) / 3)),
          ),
        )
        const actual = box.width / ((width * 4) / 3)
        assert.ok(Math.abs(actual - expected) < 0.005, `${id}: actual ${actual}, expected ${expected}`)
        assert.ok(Math.abs(box.height / box.width - height / width) < 0.005)
        assert.deepEqual(await snapshot(), saved)
        result.fitGeometry.push({ id, expected, actual, box })
        await shot(`thumbnail-${id}`)
      }
      result.gates.push('four real thumbnail clicks fit geometry and preserve exact PDF snapshot')
      await page.locator('[data-pdf-footer] section button').last().click()
      await page.getByText('100%', { exact: true }).click()
      const pageInput = page.locator('[data-pdf-footer] input').first()
      await pageInput.fill('2')
      await pageInput.press('Enter')
      await active('route').waitFor()
      await page.waitForTimeout(250)
      assert.equal(await zoom().inputValue(), '100%')
      const full = await active('route').boundingBox()
      assert.ok(Math.abs(full.width - (1000 * 4) / 3) < 1)
      await shot('footer-preserves-100')
      result.gates.push('native footer page jump preserves 100 percent zoom on wide route')
      // Published ZoomInput places its native preset button beside the second footer input.
      await page.locator('[data-pdf-footer] section button').last().click()
      await page.getByText('50%', { exact: true }).click()
      await page.waitForTimeout(250)
      assert.equal(await zoom().inputValue(), '50%')
      const half = await active('route').boundingBox()
      assert.ok(Math.abs(half.width - full.width / 2) < 1)
      assert.deepEqual(await snapshot(), saved)
      await shot('native-50-preset')
      result.gates.push('native 50 percent preset halves rendered page dimensions without changing content')
      for (const code of recipes)
        await page.evaluate((snippet) => {
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
          return new AsyncFunction('univerAPI', snippet)(window.univerAPI)
        }, code)
      assert.deepEqual(await snapshot(), saved)
      result.gates.push('three literal Facade readbacks leave full snapshot unchanged')
      await page.evaluate(() => {
        window.pdfNavigationOwner = window.univerAPI
        window.univerAPI.toggleDarkMode(true)
      })
      await page.waitForTimeout(200)
      await shot('dark')
      assert.deepEqual(await snapshot(), saved)
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await page.waitForTimeout(200)
      assert.deepEqual(await snapshot(), saved)
      assert.equal(await page.evaluate(() => window.pdfNavigationOwner === window.univerAPI), true)
      result.gates.push('same owner and exact document through dark/light')
      assert.doesNotMatch(await page.locator('body').innerText(), /[\u3400-\u9fff]/)
      assert.deepEqual(result.errors, [])
      result.passed = true
    } catch (error) {
      result.failure = error.stack || String(error)
      await shot('failure')
      await fs.writeFile(path.join(output, `${locale}-failure-dom.txt`), await page.locator('body').innerText())
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ manifestPath, results }, null, 2))
}
console.log(JSON.stringify(results, null, 2))
assert.ok(results.every((result) => result.passed))
