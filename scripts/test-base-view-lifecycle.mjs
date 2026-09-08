/* eslint-disable no-await-in-loop -- Native lifecycle transitions must be ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const manifestPath = process.argv[2]
const entry = JSON.parse(await fs.readFile(manifestPath, 'utf8')).find((item) => item.slug === 'bases/view-lifecycle')
assert.ok(entry?.passed)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-view-lifecycle')
await fs.mkdir(output, { recursive: true })
const recipes = [
  ...(await fs.readFile('showcase/bases/view-lifecycle/README.md', 'utf8')).matchAll(/```ts\r?\n([\s\S]*?)```/g),
].map((match) => match[1])
assert.equal(recipes.length, 4)
const vite = entry.links.find((item) => item.name === 'vite')
const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4452, strictPort: true },
})
const browser = await chromium.launch()
const results = []
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, locale })
    await page.addInitScript(() => {
      window.viewRecordPaint = []
      const original = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        window.viewRecordPaint.push(String(text))
        return original.call(this, text, ...args)
      }
    })
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
    const snap = () => page.evaluate(() => window.univerAPI.getActiveBase().save())
    const shot = (name) => page.screenshot({ path: path.join(output, `${locale}-${name}.png`) })
    const menu = async (id) => {
      const tab = page.locator(`[data-u-comp="base-view-tab"][data-view-id="${id}"]`)
      await tab.click()
      await tab.locator('[data-u-comp="base-view-tab-more"]').click()
    }
    try {
      await page.goto('http://127.0.0.1:4452/')
      await page.locator('[data-ready=true]').waitFor({ timeout: 60000 })
      await page.waitForTimeout(300)
      const initial = await snap()
      const records = initial.tables.items.records
      assert.equal(Object.keys(records).length, 6)
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      for (const id of ['all', 'dispatch', 'scratch']) {
        await page.locator(`[data-u-comp="base-view-tab"][data-view-id="${id}"]`).click()
        await page.waitForFunction((viewId) => window.univerAPI.getBaseUI().getActiveViewId() === viewId, id)
        await page.waitForTimeout(150)
        assert.deepEqual((await snap()).tables.items.records, records)
        await shot(id)
      }
      result.gates.push('three native tab activations preserve exact shared records')
      await menu('scratch')
      await page.getByText('Rename View', { exact: true }).click()
      const rename = page.locator('[data-u-comp="base-view-tab-rename-panel"] input')
      await rename.fill('Volunteer scratch')
      await rename.press('Enter')
      await page.waitForFunction(
        () =>
          window.univerAPI.getActiveBase().getTableById('items').getViewById('scratch').getName() ===
          'Volunteer scratch',
      )
      await menu('scratch')
      await page.getByText('Duplicate view', { exact: true }).waitFor({ state: 'visible' })
      await page.waitForTimeout(150)
      await shot('native-menu')
      await page.getByText('Duplicate view', { exact: true }).click()
      await page.waitForFunction(() => window.univerAPI.getActiveBase().save().tables.items.viewOrder.length === 4)
      const duplicateState = await snap()
      const copyId = duplicateState.tables.items.viewOrder.find((id) => !initial.tables.items.viewOrder.includes(id))
      assert.ok(copyId)
      const original = duplicateState.tables.items.views.scratch,
        copy = duplicateState.tables.items.views[copyId]
      result.strictProjectionCopy = true
      for (const key of ['config', 'fieldSettings', 'fieldOrder', 'filter', 'sort', 'group']) {
        try {
          assert.deepEqual(copy[key], original[key])
        } catch (error) {
          result.strictProjectionCopy = false
          result.projectionDifference = {
            key,
            original: original[key],
            copyHasKey: Object.hasOwn(copy, key),
            failure: String(error),
          }
        }
      }
      assert.deepEqual(duplicateState.tables.items.records, records)
      await shot('native-duplicate')
      result.gates.push(
        'real native Rename and Duplicate preserve records; strict projection comparison reported separately',
      )
      await menu(copyId)
      await page.getByText('Delete view', { exact: true }).click()
      await page.getByRole('button', { name: 'Delete', exact: true }).click()
      await page.waitForFunction((id) => !window.univerAPI.getActiveBase().save().tables.items.views[id], copyId)
      assert.deepEqual((await snap()).tables.items.records, records)
      result.gates.push('native Delete removes only duplicate view')
      await page.getByRole('button', { name: 'Add view', exact: true }).click()
      await page.getByRole('button', { name: 'Grid', exact: true }).waitFor({ state: 'visible' })
      await page.waitForTimeout(200)
      await shot('native-add-menu')
      await page.getByRole('button', { name: 'Grid', exact: true }).click()
      await page.waitForFunction(() => window.univerAPI.getActiveBase().save().tables.items.viewOrder.length === 4)
      assert.deepEqual((await snap()).tables.items.records, records)
      result.gates.push('native Add Grid creates projection without records copy')
      await page.reload()
      await page.locator('[data-ready=true]').waitFor({ timeout: 60000 })
      for (const [index, code] of recipes.entries()) {
        await page.evaluate((snippet) => {
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
          return new AsyncFunction('univerAPI', snippet)(window.univerAPI)
        }, code)
        const current = (await snap()).tables.items
        assert.deepEqual(current.records, records)
        assert.deepEqual(current.views.dispatch, initial.tables.items.views.dispatch)
        if (index === 0) assert.ok(Object.values(current.views).some((view) => view.name === 'Packing review'))
        if (index === 1) assert.ok(Object.values(current.views).some((view) => view.name === 'Volunteer handover'))
        if (index === 2)
          assert.equal(
            Object.values(current.views).find((view) => view.name === 'Dispatch experiment').fieldSettings.note.hidden,
            false,
          )
        if (index === 3) assert.ok(!Object.values(current.views).some((view) => view.name === 'Dispatch experiment'))
        await page.waitForTimeout(150)
        await shot(`recipe-${index + 1}`)
        result.gates.push(`literal recipe ${index + 1}; shared records and source projection unchanged`)
      }
      const saved = await snap()
      await page.evaluate(() => {
        window.viewLifecycleOwner = window.univerAPI
        window.univerAPI.toggleDarkMode(true)
      })
      await page.waitForTimeout(200)
      await shot('dark')
      assert.deepEqual(await snap(), saved)
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await page.waitForTimeout(200)
      assert.deepEqual(await snap(), saved)
      assert.equal(await page.evaluate(() => window.viewLifecycleOwner === window.univerAPI), true)
      assert.doesNotMatch(await page.locator('body').innerText(), /[\u3400-\u9fff]/)
      assert.deepEqual(result.errors, [])
      result.gates.push('same owner and exact full model through dark/light')
      // Observed All items canvas, 1500x1000: first Library item cell centered near 410/149.
      await page.mouse.dblclick(410, 149)
      await page.keyboard.press('Control+A')
      await page.keyboard.type('Brass desk lamp serviced')
      await page.keyboard.press('Enter')
      await page.waitForFunction(
        () =>
          window.univerAPI.getActiveBase().save().tables.items.records['item-1'].values.item ===
          'Brass desk lamp serviced',
      )
      const editedRecords = (await snap()).tables.items.records
      for (const recordId of Object.keys(records)) {
        if (recordId !== 'item-1') assert.deepEqual(editedRecords[recordId], records[recordId])
      }
      assert.deepEqual(editedRecords['item-1'].values, {
        ...records['item-1'].values,
        item: 'Brass desk lamp serviced',
      })
      for (const viewId of ['dispatch', 'scratch']) {
        await page.evaluate(() => {
          window.viewRecordPaint = []
        })
        await page.locator(`[data-u-comp="base-view-tab"][data-view-id="${viewId}"]`).click()
        await page.waitForFunction(() => window.viewRecordPaint.join('').includes('Brass desk lamp serviced'))
        assert.deepEqual((await snap()).tables.items.records, editedRecords)
        await shot(`shared-edit-${viewId}`)
      }
      result.gates.push(
        'real native first-cell edit repaints Dispatch and Scratch; all other records exactly unchanged',
      )
      assert.deepEqual(result.errors, [])
      result.interactionsPassed = true
      result.passed = result.strictProjectionCopy
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
