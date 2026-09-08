/* eslint-disable no-await-in-loop -- Exercise independent locale owners and literal recipes in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

assert.ok(process.argv[2], 'Pass the selected export manifest')
const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find((item) => item.slug === 'bases/date-time-formats')
assert.ok(entry?.passed)
const readme = await fs.readFile('showcase/bases/date-time-formats/README.md', 'utf8')
const recipes = [...readme.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 4)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-date-formats')
await fs.mkdir(directory, { recursive: true })
const { preview } = await import(pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js')))
const server = await preview({
  configFile: false,
  root: entry.directory,
  preview: { host: '127.0.0.1', port: 4435, strictPort: true },
})
const browser = await chromium.launch()
const results = []
try {
  for (const [locale, timezoneId] of [
    ['en-US', 'Asia/Shanghai'],
    ['zh-CN', 'Asia/Shanghai'],
    ['en-US', 'UTC'],
    ['zh-CN', 'UTC'],
  ]) {
    const result = { locale, timezoneId, passed: false, errors: [], backendRequests: [], checks: [] }
    const label = `${locale}-${timezoneId.replace('/', '-')}`
    results.push(result)
    const page = await browser.newPage({ viewport: { width: 1600, height: 1050 }, timezoneId })
    page.setDefaultTimeout(30000)
    await page.route('**/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace('<html', `<html lang="${locale}"`) })
    })
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) || request.url().includes('/universer-api/'))
        result.backendRequests.push(request.url())
    })
    await page.addInitScript(() => {
      window.datePaint = []
      const original = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (...args) {
        const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
        const rect = this.canvas.getBoundingClientRect()
        if (rect.width && rect.height)
          window.datePaint.push({
            text: String(args[0]),
            x: rect.x + (point.x * rect.width) / this.canvas.width,
            y: rect.y + (point.y * rect.height) / this.canvas.height,
          })
        if (window.datePaint.length > 20000) window.datePaint.splice(0, 10000)
        return Reflect.apply(original, this, args)
      }
    })
    const read = () => page.evaluate(() => window.univerAPI.getBase('studio-date-formats').save())
    const settle = () =>
      page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const repaint = async () => {
      await page.evaluate(() => {
        window.datePaint = []
      })
      await page.setViewportSize({ width: page.viewportSize().width === 1600 ? 1598 : 1600, height: 1050 })
      await page.waitForFunction(() => window.datePaint.some((item) => item.text.includes('2028')))
      await settle()
    }
    try {
      await page.goto('http://127.0.0.1:4435/')
      const root = page.locator('.base-date-formats[data-ready=true]')
      await root.waitFor()
      await page.waitForFunction(
        () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      const before = await read()
      assert.equal(Object.keys(before.tables.appointments.records).length, 6)
      for (const record of Object.values(before.tables.appointments.records)) {
        assert.equal(record.values.iso, record.values.dayFirst)
        assert.equal(record.values.iso, record.values.clock24)
        assert.equal(record.values.iso, record.values.clock12)
      }
      const expectedNewYear = await page.evaluate(
        () => (new Date(2029, 0, 1, 0, 15).getTime() - Date.UTC(1899, 11, 30)) / 86400000,
      )
      assert.ok(Math.abs(before.tables.appointments.records['appointment-5'].values.iso - expectedNewYear) < 1e-9)
      assert.equal(before.tables.appointments.records['appointment-6'].values.iso, null)
      await repaint()
      const initialPaint = await page.evaluate(() => window.datePaint.map((item) => item.text))
      result.initialPaint = [...new Set(initialPaint)]
      for (const text of ['2028-02-29', '29/02/2028', '2028/02/29 09:30', '2028/02/29 9:30 am', '2029/01/01 00:15'])
        assert.ok(initialPaint.includes(text), `Missing native paint: ${text}`)
      assert.equal(await root.locator(':scope > button, :scope > fieldset, :scope > details, [data-action]').count(), 0)
      await root.screenshot({ path: path.join(directory, `${label}-baseline.png`) })
      result.checks.push(
        'Six rows, equal stored serials, explicit empty values and five exact native date/time paint samples',
      )

      const point = await page.evaluate(() => window.datePaint.findLast((item) => item.text === '2028/02/29 09:30'))
      await page.mouse.dblclick(point.x + 20, point.y - 5)
      await settle()
      result.pickerSurface = await page.locator('body').innerText()
      assert.match(result.pickerSurface, /Feb/)
      assert.match(result.pickerSurface, /Time/)
      assert.doesNotMatch(result.pickerSurface, /[\u3400-\u9fff]/, 'Demo stays English even on a Chinese host page')
      await page.screenshot({ path: path.join(directory, `${label}-date-picker.png`) })
      // Opening is inspected separately; no picker-submission success is inferred from a Facade write.
      await page.keyboard.press('Escape')
      await settle()
      assert.deepEqual(await read(), before)
      result.checks.push(
        'Native date cell double-click and Escape preserve the complete model; screenshot records picker surface',
      )

      // Real calendar selection, not a Facade write masquerading as native input.
      await page.mouse.click(point.x + 20, point.y + 80)
      await page.mouse.dblclick(point.x + 20, point.y - 5)
      // beta.2 does not expose the newer source's base-date-cell-editor test attribute.
      await page.getByText('28', { exact: true }).click()
      const expectedDay = before.tables.appointments.records['appointment-1'].values.clock24 - 1
      await page.waitForFunction(
        (expected) =>
          window.univerAPI
            .getBase('studio-date-formats')
            .getTableById('appointments')
            .getRecordById('appointment-1')
            .getValue('clock24') === expected,
        expectedDay,
      )
      await repaint()
      assert.ok(await page.evaluate(() => window.datePaint.some((item) => item.text === '2028/02/28 09:30')))
      const nativeDay = await read()
      for (const [id, record] of Object.entries(before.tables.appointments.records)) {
        const expected = structuredClone(record.values)
        if (id === 'appointment-1') expected.clock24 = expectedDay
        assert.deepEqual(nativeDay.tables.appointments.records[id].values, expected)
      }
      await root.screenshot({ path: path.join(directory, `${label}-native-day.png`) })
      result.checks.push(
        'Native calendar day selection commits 28 February and preserves time and every other field value',
      )

      const dayPoint = await page.evaluate(() => window.datePaint.findLast((item) => item.text === '2028/02/28 09:30'))
      await page.mouse.click(dayPoint.x + 20, dayPoint.y + 80)
      await page.mouse.dblclick(dayPoint.x + 20, dayPoint.y - 5)
      const timeInput = page.locator('input[type="time"]')
      await timeInput.fill('10:45:00')
      await timeInput.press('Enter')
      const expectedTime = await page.evaluate(
        () => (new Date(2028, 1, 28, 10, 45).getTime() - Date.UTC(1899, 11, 30)) / 86400000,
      )
      await page.waitForFunction(
        (expected) =>
          Math.abs(
            window.univerAPI
              .getBase('studio-date-formats')
              .getTableById('appointments')
              .getRecordById('appointment-1')
              .getValue('clock24') - expected,
          ) < 1e-9,
        expectedTime,
      )
      await repaint()
      assert.ok(await page.evaluate(() => window.datePaint.some((item) => item.text === '2028/02/28 10:45')))
      const nativeTime = await read()
      for (const [id, record] of Object.entries(nativeDay.tables.appointments.records)) {
        const expected = structuredClone(record.values)
        if (id === 'appointment-1') expected.clock24 = nativeTime.tables.appointments.records[id].values.clock24
        assert.deepEqual(nativeTime.tables.appointments.records[id].values, expected)
      }
      await root.screenshot({ path: path.join(directory, `${label}-native-time.png`) })
      result.checks.push('Native time input and Enter commit 10:45 without changing the day or other fields')

      for (let index = 0; index < recipes.length; index++) {
        await page.evaluate((source) => new Function(source)(), recipes[index])
        await repaint()
        await root.screenshot({ path: path.join(directory, `${label}-recipe-${index + 1}.png`) })
      }
      const after = await read()
      const table = after.tables.appointments
      assert.equal(table.fields.iso.config.includeTime, true)
      assert.equal(table.fields.clock24.config.hourCycle, 'h12')
      assert.equal(
        table.records['appointment-2'].values.clock24,
        Number(before.tables.appointments.records['appointment-1'].values.clock12) + 7 / 24,
      )
      assert.equal(table.records['appointment-3'].values.clock12, null)
      assert.equal(
        table.records['appointment-1'].values.iso,
        before.tables.appointments.records['appointment-1'].values.iso,
      )
      const finalPaint = await page.evaluate(() => window.datePaint.map((item) => item.text))
      for (const text of ['2028-02-29 09:30', '29/02/2028 4:30 pm'])
        assert.ok(finalPaint.includes(text), `Missing updated native paint: ${text}`)
      result.checks.push('Four exact public README recipes and their stored/painted changes')
      await page.evaluate(() => {
        window.dateOwner = window.univerAPI.getBase('studio-date-formats').getBase()
        window.univerAPI.toggleDarkMode(true)
      })
      await settle()
      assert.deepEqual(await read(), after)
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await settle()
      assert.equal(
        await page.evaluate(() => window.dateOwner === window.univerAPI.getBase('studio-date-formats').getBase()),
        true,
      )
      assert.deepEqual(await read(), after)
      result.checks.push('Same underlying BaseDataModel owner and full edited Base survive both theme switches')
      assert.deepEqual(result.errors, [])
      assert.deepEqual(result.backendRequests, [])
      result.passed = true
    } catch (error) {
      result.failure = error.stack
      await page.screenshot({ path: path.join(directory, `${label}-failure.png`) }).catch(() => {})
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
  await server.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(results, null, 2))
}
console.log(JSON.stringify(results, null, 2))
assert.ok(results.length === 4 && results.every((result) => result.passed))
