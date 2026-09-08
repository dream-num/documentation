/* eslint-disable no-await-in-loop -- Native interactions are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const entry = JSON.parse(await fs.readFile(process.argv[2], 'utf8')).find(
  ({ slug }) => slug === 'bases/attachment-fields',
)
assert.ok(entry?.passed)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-attachment-native')
const port = Number(process.env.SHOWCASE_EXPORT_PORT || 4452)
await fs.mkdir(output, { recursive: true })
const recipes = [
  ...(await fs.readFile('showcase/bases/attachment-fields/README.md', 'utf8')).matchAll(/```ts\r?\n([\s\S]*?)```/g),
].map((match) => match[1])
assert.equal(recipes.length, 4)
const { preview } = await import(
  pathToFileURL(path.join(entry.links.find(({ name }) => name === 'vite').target, 'dist/node/index.js'))
)
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port, strictPort: true },
})
const browser = await chromium.launch()
const results = []
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const result = { locale, passed: false, gates: [], errors: [] }
    results.push(result)
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, locale })
    page.setDefaultTimeout(12000)
    page.on('pageerror', (error) => result.errors.push(String(error)))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.route(`http://127.0.0.1:${port}/`, async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${locale}">`) })
    })
    await page.addInitScript(() => {
      window.attachmentPaint = []
      const fillText = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        const p = this.getTransform().transformPoint({ x: args[0], y: args[1] })
        const rect = this.canvas.getBoundingClientRect()
        window.attachmentPaint.push({
          text: String(text),
          x: rect.x + (p.x * rect.width) / this.canvas.width,
          y: rect.y + (p.y * rect.height) / this.canvas.height,
        })
        window.attachmentPaint = window.attachmentPaint.slice(-20000)
        return fillText.call(this, text, ...args)
      }
    })
    const snap = () => page.evaluate(() => window.univerAPI.getActiveBase().save())
    const shot = (name) => page.screenshot({ path: path.join(output, `${locale}-${name}.png`) })
    try {
      await page.goto(`http://127.0.0.1:${port}/`)
      await page.locator('[data-ready=true]').waitFor({ timeout: 60000 })
      await page.waitForFunction(() => window.attachmentPaint.some(({ text }) => text === 'Kitchen wall clock'))
      await page.waitForTimeout(500)
      const initial = await snap()
      const readFiles = () =>
        page.evaluate(() =>
          Object.fromEntries(
            window.univerAPI
              .getActiveBase()
              .getTableById('packets')
              .getRecords()
              .map((record) => [record.getId(), record.getValue('files')]),
          ),
        )
      const initialFiles = await readFiles()
      assert.deepEqual(
        Object.values(initialFiles).map((files) => files.length),
        [1, 2, 1, 2, 0],
      )
      assert.equal(Object.keys(initial.tables.packets.records).length, 5)
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      assert.doesNotMatch(await page.locator('#app').innerText(), /[\u3400-\u9fff]/)
      await shot('initial')
      result.gates.push('five native rows, English under host locale')
      for (const [index, code] of recipes.entries()) {
        await page.evaluate((snippet) => {
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
          return new AsyncFunction('univerAPI', snippet)(window.univerAPI)
        }, code)
        const currentFiles = await readFiles()
        for (const id of ['lamp', 'chair', 'pouch']) assert.deepEqual(currentFiles[id], initialFiles[id])
        if (index === 0) assert.deepEqual(await snap(), initial)
        if (index === 1) assert.equal(currentFiles.clock[0].source, initialFiles.lamp[0].source)
        if (index >= 2) {
          assert.equal(currentFiles.radio[0].name, 'radio-checklist.txt')
          assert.equal(
            Buffer.from(currentFiles.radio[0].source.split(',')[1], 'base64').toString(),
            'Check contacts. Test tuning. Return with batteries removed.',
          )
        }
        if (index === 3) assert.deepEqual(currentFiles.clock, [])
        const current = await snap()
        for (const [id, record] of Object.entries(initial.tables.packets.records)) {
          assert.equal(current.tables.packets.records[id].values.item, record.values.item)
          assert.equal(current.tables.packets.records[id].values.kind, record.values.kind)
        }
        await page.waitForTimeout(150)
        await shot(`recipe-${index + 1}`)
      }
      result.gates.push('four literal recipes executed')
      await page.reload()
      await page.locator('[data-ready=true]').waitFor({ timeout: 60000 })
      await page.waitForTimeout(300)
      const beforeNative = await snap()
      await page.evaluate(() => window.univerAPI.getBaseUI().openRecordDetail('chair'))
      const drawer = page.locator('[data-u-comp=base-record-detail-drawer]')
      await drawer.waitFor()
      await page.waitForTimeout(250)
      await fs.writeFile(path.join(output, `${locale}-drawer.html`), await drawer.evaluate((node) => node.outerHTML))
      await shot('detail')
      result.drawerText = await drawer.innerText()
      await drawer.getByRole('img', { name: 'chair-front.svg', exact: true }).click()
      await page.waitForTimeout(300)
      await shot('image-open')
      await fs.writeFile(path.join(output, `${locale}-image-open.html`), await page.content())
      const gallery = page.locator('[data-u-comp=gallery]')
      await gallery.waitFor()
      await gallery.getByRole('button', { name: 'Next', exact: true }).click()
      await page.waitForTimeout(150)
      await shot('image-next')
      result.galleryImages = await gallery
        .locator('img')
        .evaluateAll((images) =>
          images.map((img) => ({ src: img.src, width: img.naturalWidth, height: img.naturalHeight })),
        )
      assert.equal(result.galleryImages.length, 1)
      assert.equal(result.galleryImages[0].src, initialFiles.chair[1].source)
      assert.equal(result.galleryImages[0].width, 320)
      assert.equal(result.galleryImages[0].height, 200)
      assert.deepEqual(await snap(), beforeNative)
      result.gates.push('real image click, Next and decoded original second image; full model unchanged')
      await page.locator('[data-u-comp=gallery-close]').click()
      await drawer.getByRole('button', { name: 'Close record detail', exact: true }).click()
      await page.waitForTimeout(200)
      const point = await page.evaluate(() =>
        window.attachmentPaint.findLast(({ text, y }) => text === 'Oak folding chair' && y > 120),
      )
      assert.ok(point)
      await page.mouse.dblclick(740, point.y - 4)
      await page.waitForTimeout(250)
      await shot('cell-editor')
      await fs.writeFile(path.join(output, `${locale}-cell-editor.html`), await page.content())
      await page.keyboard.press('Escape')
      await page.keyboard.press('Delete')
      await page.waitForTimeout(250)
      result.nativeDelete = await page.evaluate(() =>
        window.univerAPI.getActiveBase().getTableById('packets').getRecordById('chair').getValue('files'),
      )
      assert.deepEqual(result.nativeDelete, [])
      const afterDelete = await snap()
      for (const id of ['lamp', 'radio', 'pouch', 'clock'])
        assert.deepEqual(afterDelete.tables.packets.records[id], beforeNative.tables.packets.records[id])
      assert.equal(
        afterDelete.tables.packets.records.chair.values.item,
        beforeNative.tables.packets.records.chair.values.item,
      )
      assert.deepEqual(afterDelete.tables.packets.views, beforeNative.tables.packets.views)
      await shot('native-delete')
      result.gates.push('native cell Delete clears attachments')
      await page.evaluate(() => window.univerAPI.getBaseUI().openRecordDetail('radio'))
      await drawer.waitFor()
      const fileOpen = page.waitForEvent('download', { timeout: 15000 })
      await drawer.locator('[data-u-comp=base-record-detail-attachment-item]').click()
      const download = await fileOpen
      result.fileOpen = {
        filename: download.suggestedFilename(),
        bytes: await fs.readFile(await download.path(), 'utf8'),
      }
      assert.equal(result.fileOpen.filename, 'radio-service.txt')
      assert.equal(
        result.fileOpen.bytes,
        'Pocket radio service note\nClean battery contacts. Retain the original tuning knob.\n',
      )
      await shot('text-file-open')
      result.gates.push('native text attachment click downloads exact original bytes')
      await drawer.getByRole('button', { name: 'Close record detail', exact: true }).click()
      const saved = await snap()
      await page.evaluate(() => {
        window.attachmentOwner = window.univerAPI
        window.univerAPI.toggleDarkMode(true)
      })
      await page.waitForTimeout(200)
      await shot('dark')
      assert.deepEqual(await snap(), saved)
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await page.waitForTimeout(200)
      assert.deepEqual(await snap(), saved)
      assert.equal(await page.evaluate(() => window.attachmentOwner === window.univerAPI), true)
      await shot('light-restored')
      result.gates.push('same owner and exact complete saved model through dark/light themes')
      await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
      await page.waitForFunction(() => !window.univerAPI && !document.querySelector('.base-attachment-fields'))
      result.gates.push('real pagehide releases owner and root')
      assert.deepEqual(result.errors, [])
      result.passed = true
    } catch (error) {
      result.failure = String(error)
      await shot('failure')
      await fs.writeFile(path.join(output, `${locale}-failure.html`), await page.content())
    } finally {
      await page.close()
      await fs.writeFile(
        path.join(output, 'report.json'),
        JSON.stringify({ manifest: process.argv[2], results }, null, 2),
      )
    }
  }
} finally {
  await browser.close()
  await server.close()
}
console.log(
  JSON.stringify(
    results.map(({ locale, passed, failure, gates }) => ({ locale, passed, failure, gates })),
    null,
    2,
  ),
)
assert.ok(results.every(({ passed, errors }) => passed && !errors.length))
