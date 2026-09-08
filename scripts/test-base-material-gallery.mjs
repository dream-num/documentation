/* eslint-disable no-await-in-loop -- Native tabs and README recipes are exercised in sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find(({ slug }) => slug === 'bases/gallery-covers-and-card-layout')
assert.ok(entry?.passed)
const readme = await fs.readFile('showcase/bases/gallery-covers-and-card-layout/README.md', 'utf8')
const recipes = [...readme.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 6)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-gallery-native-detail')
await fs.mkdir(output, { recursive: true })
const { preview } = await import(pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4439, strictPort: true },
})
const browser = await chromium.launch()
const results = []
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, passed: false, errors: [], writes: [], checks: [], views: {} }
    results.push(result)
    const page = await browser.newPage({ viewport: { width: 1600, height: 1050 }, timezoneId: 'Asia/Shanghai' })
    page.setDefaultTimeout(15000)
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.writes.push(request.url())
    })
    await page.route('http://127.0.0.1:4439/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    await page.addInitScript(() => {
      window.galleryPaint = []
      window.galleryImages = []
      window.galleryPoints = []
      const fillText = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        if (window.galleryPaint.length < 30000) window.galleryPaint.push(String(text))
        if (this.canvas.isConnected) {
          const point = this.getTransform().transformPoint({ x: args[0], y: args[1] })
          const rect = this.canvas.getBoundingClientRect()
          window.galleryPoints.push({
            text: String(text),
            x: rect.x + (point.x * rect.width) / this.canvas.width,
            y: rect.y + (point.y * rect.height) / this.canvas.height,
          })
          window.galleryPoints = window.galleryPoints.slice(-20000)
        }
        return fillText.call(this, text, ...args)
      }
      const drawImage = CanvasRenderingContext2D.prototype.drawImage
      CanvasRenderingContext2D.prototype.drawImage = function (image, ...args) {
        if (image instanceof HTMLImageElement && image.src.startsWith('data:image/svg+xml')) {
          const size =
            args.length === 8 ? args.slice(6, 8) : args.length === 4 ? args.slice(2, 4) : [image.width, image.height]
          if (window.galleryImages.length < 20000) window.galleryImages.push({ source: image.src, size })
        }
        return drawImage.call(this, image, ...args)
      }
    })
    const read = () => page.evaluate(() => window.univerAPI.getBase('material-library').save())
    const settle = () =>
      page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const clearPaint = () =>
      page.evaluate(() => {
        window.galleryPaint = []
        window.galleryImages = []
      })
    const paint = () =>
      page.evaluate(() => ({
        text: [...new Set(window.galleryPaint)],
        images: [...new Map(window.galleryImages.map((image) => [JSON.stringify(image), image])).values()],
      }))
    try {
      await page.goto('http://127.0.0.1:4439/')
      await page.locator('.base-material-gallery[data-ready="true"]').waitFor()
      await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'hidden' })
      await page.waitForFunction(() => window.galleryPaint.some((text) => text.includes('Oat linen')))
      const initial = await read()
      const table = initial.tables.materials
      assert.equal(Object.keys(table.records).length, 6)
      assert.equal(Object.values(table.records).filter(({ values }) => values.cover.length).length, 5)
      assert.deepEqual(table.records['sample-6'].values.cover, [])
      assert.doesNotMatch(await page.locator('#app').innerText(), /[\u3400-\u9fff]/)
      for (const [id, name] of [
        ['small', 'Small cards'],
        ['medium', 'Medium cards'],
        ['large', 'Large cards'],
        ['grid', 'Source grid'],
      ]) {
        await clearPaint()
        await page.getByText(name, { exact: true }).click()
        await page.waitForFunction((viewId) => window.univerAPI.getBaseUI().getActiveViewId() === viewId, id)
        await settle()
        await clearPaint()
        await page.setViewportSize({ width: 1601, height: 1050 })
        await settle()
        await page.setViewportSize({ width: 1600, height: 1050 })
        await page.waitForFunction(() => window.galleryPaint.some((text) => text.includes('Oat linen')))
        await settle()
        const currentPaint = await paint()
        assert.doesNotMatch(currentPaint.text.join(' '), /[\u3400-\u9fff]/)
        result.views[id] = currentPaint
        assert.deepEqual((await read()).tables.materials.records, table.records)
        if (id !== 'grid') assert.ok(currentPaint.images.length, id + ' renders native SVG attachment covers')
        await page.screenshot({ path: path.join(output, `${lang}-${id}.png`) })
      }
      assert.ok(!result.views.small.text.includes('Family'), 'Small cards omit field labels')
      assert.ok(result.views.medium.text.includes('Family'), 'Medium cards paint field labels')
      assert.ok(result.views.large.text.includes('Sample note'), 'Large cards paint notes label')
      assert.ok(
        result.views.large.text.some((text) => text.includes('Soft open weave')),
        'Large cards paint authored note',
      )
      const coverWidths = ['small', 'medium', 'large'].map((id) => {
        assert.equal(
          new Set(result.views[id].images.map(({ source }) => source)).size,
          5,
          id + ' paints five distinct original covers',
        )
        return Math.max(...result.views[id].images.map(({ size }) => size[0]))
      })
      assert.ok(
        coverWidths[0] < coverWidths[1] && coverWidths[1] < coverWidths[2],
        'Native attachment draw widths increase with card size',
      )
      result.coverWidths = coverWidths
      result.checks.push(
        'Four native view tabs preserve all six records; Gallery covers and view-specific labels/notes paint on native canvas',
      )
      await page.getByText('Medium cards', { exact: true }).click()
      for (const [index, recipe] of recipes.entries()) {
        const before = await read()
        await clearPaint()
        await page.evaluate(async (code) => {
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
          await new AsyncFunction(code)()
        }, recipe)
        await settle()
        const next = (await read()).tables.materials
        if ([0, 1, 2, 5].includes(index)) assert.deepEqual(next.records, before.tables.materials.records)
        if (index === 0) {
          assert.equal(next.views.medium.config.cardSize, 'large')
          assert.deepEqual(next.views.small, before.tables.materials.views.small)
          assert.deepEqual(next.views.large, before.tables.materials.views.large)
        }
        if (index === 1) {
          assert.equal(next.views.medium.config.cardSize, 'medium')
          assert.equal(next.views.medium.config.showFieldNames, false)
        }
        if (index === 2) assert.equal(next.views.medium.config.showFieldNames, true)
        if (index === 3) {
          assert.equal(next.records['sample-1'].values.note, 'Reviewed for the west-facing window.')
          await page.waitForFunction(() => window.galleryPaint.some((text) => text.includes('Reviewed for the west')))
        }
        if (index === 4) {
          assert.deepEqual(next.records['sample-2'].values.cover, [])
          for (const id of ['sample-1', 'sample-3', 'sample-4', 'sample-5', 'sample-6'])
            assert.deepEqual(next.records[id], before.tables.materials.records[id])
        }
        await page.screenshot({ path: path.join(output, `${lang}-recipe-${index + 1}.png`) })
      }
      result.checks.push(
        'Six README recipes execute verbatim, including await; configuration preserves records, note edit paints and attachment removal updates only its record',
      )
      await page.getByText('Source grid', { exact: true }).click()
      await clearPaint()
      await page.getByText('Large cards', { exact: true }).click()
      await page.waitForFunction(() => window.galleryPaint.some((text) => text.includes('Reviewed for the west')))
      result.editedPaint = await paint()
      const cardPoint = await page.evaluate(() =>
        window.galleryPoints.findLast(({ text, y }) => text === 'Oat linen' && y > 100 && y < 950),
      )
      assert.ok(cardPoint, 'Oat linen native card title has an observed canvas location')
      await page.mouse.dblclick(cardPoint.x + 25, cardPoint.y - 4)
      const drawer = page.locator('[data-u-comp=base-record-detail-drawer]')
      await drawer.waitFor()
      await fs.writeFile(path.join(output, `${lang}-drawer-dom.html`), await drawer.evaluate((node) => node.outerHTML))
      await page.screenshot({ path: path.join(output, `${lang}-native-detail.png`) })
      assert.doesNotMatch(await drawer.innerText(), /[\u3400-\u9fff]/)
      const beforeNative = await read()
      const nativeNote = 'Native detail review: approved for the west window.'
      const noteEditor = drawer.getByRole('textbox', { name: 'Sample note', exact: true })
      assert.equal(await noteEditor.inputValue(), 'Reviewed for the west-facing window.')
      await noteEditor.click()
      await page.keyboard.press('Control+A')
      await page.keyboard.type(nativeNote)
      await page.keyboard.press('Tab')
      await page.waitForFunction(
        (note) =>
          window.univerAPI.getBase('material-library').save().tables.materials.records['sample-1'].values.note === note,
        nativeNote,
      )
      const afterNative = await read()
      const beforeRecords = beforeNative.tables.materials.records
      const afterRecords = afterNative.tables.materials.records
      assert.deepEqual(afterRecords['sample-1'].values, { ...beforeRecords['sample-1'].values, note: nativeNote })
      for (const id of Object.keys(beforeRecords).filter((recordId) => recordId !== 'sample-1'))
        assert.deepEqual(afterRecords[id], beforeRecords[id])
      assert.deepEqual(afterNative.tables.materials.views, beforeNative.tables.materials.views)
      await page.screenshot({ path: path.join(output, `${lang}-native-detail-edited.png`) })
      await drawer.getByRole('button', { name: 'Close record detail', exact: true }).click()
      await drawer.waitFor({ state: 'hidden' })
      for (const [id, name] of [
        ['grid', 'Source grid'],
        ['large', 'Large cards'],
      ]) {
        await clearPaint()
        await page.getByText(name, { exact: true }).click()
        await page.waitForFunction((viewId) => window.univerAPI.getBaseUI().getActiveViewId() === viewId, id)
        await page.waitForFunction(() => window.galleryPaint.some((text) => text.includes('Native detail review:')))
        assert.deepEqual((await read()).tables.materials.records, afterRecords)
        await page.screenshot({ path: path.join(output, `${lang}-native-note-${id}.png`) })
      }
      const reopenPoint = await page.evaluate(() =>
        window.galleryPoints.findLast(({ text, y }) => text === 'Oat linen' && y > 100 && y < 950),
      )
      await page.mouse.dblclick(reopenPoint.x + 25, reopenPoint.y - 4)
      await drawer.waitFor()
      assert.equal(await drawer.getByRole('textbox', { name: 'Sample note', exact: true }).inputValue(), nativeNote)
      await page.screenshot({ path: path.join(output, `${lang}-native-detail-reopened.png`) })
      await drawer.getByRole('button', { name: 'Close record detail', exact: true }).click()
      await drawer.waitFor({ state: 'hidden' })
      result.checks.push(
        'Observed canvas card double-click opens native details; real keyboard note edit preserves other fields/records/views, repaints in Source grid and Large cards, and persists when reopened',
      )
      await page.evaluate(() => {
        window.galleryOwner = window.univerAPI.getBase('material-library').getBase()
      })
      const edited = await read()
      for (const dark of [true, false]) {
        await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
        await settle()
        assert.deepEqual(await read(), edited)
        assert.equal(
          await page.evaluate(() => window.galleryOwner === window.univerAPI.getBase('material-library').getBase()),
          true,
        )
        await page.screenshot({ path: path.join(output, `${lang}-theme-${dark ? 'dark' : 'light'}.png`) })
      }
      result.checks.push('Same underlying Base owner and complete edited save through dark/light themes')
      result.notAccepted = ['Attachment uploads', 'Card geometry measurement beyond captured native draw sizes']
      assert.deepEqual(result.errors, [])
      assert.deepEqual(result.writes, [])
      result.passed = true
    } catch (error) {
      result.failure = error.stack
      result.failurePaint = await paint()
      await page.screenshot({ path: path.join(output, `${lang}-failure.png`) }).catch(() => {})
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
  await server.close()
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(results, null, 2))
}
console.log(
  JSON.stringify(
    results.map(({ lang, passed, checks, errors, failure }) => ({ lang, passed, checks, errors, failure })),
  ),
)
assert.ok(results.every(({ passed }) => passed))
