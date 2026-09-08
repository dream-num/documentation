/* eslint-disable no-await-in-loop -- Native view and recipe evidence is sequential. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const entry = JSON.parse(await fs.readFile(process.argv[2], 'utf8')).find(
  ({ slug }) => slug === 'bases/calendar-month-week-day',
)
assert.ok(entry?.passed)
const readme = await fs.readFile('showcase/bases/calendar-month-week-day/README.md', 'utf8')
const recipes = [...readme.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 6)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-calendar-views')
await fs.mkdir(output, { recursive: true })
const { preview } = await import(pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4443, strictPort: true },
})
const browser = await chromium.launch()
const results = []
try {
  for (const timezoneId of ['Asia/Shanghai', 'UTC'])
    for (const lang of ['en-US', 'zh-CN']) {
      const key = timezoneId.replace('/', '-') + '-' + lang
      const result = { timezoneId, lang, passed: false, gates: {}, views: {}, errors: [], writes: [] }
      results.push(result)
      const page = await browser.newPage({ viewport: { width: 1600, height: 1050 }, timezoneId })
      page.setDefaultTimeout(10000)
      page.on('pageerror', (error) => result.errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') result.errors.push(message.text())
      })
      page.on('request', (request) => {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.writes.push(request.url())
      })
      await page.route('http://127.0.0.1:4443/', async (route) => {
        const response = await route.fetch()
        await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
      })
      await page.addInitScript(() => {
        window.calendarPaint = []
        const fillText = CanvasRenderingContext2D.prototype.fillText
        CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
          if (this.canvas.isConnected) {
            const point = this.getTransform().transformPoint({ x: args[0], y: args[1] })
            const rect = this.canvas.getBoundingClientRect()
            window.calendarPaint.push({
              text: String(text),
              x: rect.x + (point.x * rect.width) / this.canvas.width,
              y: rect.y + (point.y * rect.height) / this.canvas.height,
            })
            window.calendarPaint = window.calendarPaint.slice(-30000)
          }
          return fillText.call(this, text, ...args)
        }
      })
      const read = () => page.evaluate(() => window.univerAPI.getBase('repair-studio-calendar').save())
      const project = (id) =>
        page.evaluate(
          (viewId) =>
            window.univerAPI
              .getBase('repair-studio-calendar')
              .getTableById('appointments')
              .getViewById(viewId)
              .getProjection(),
          id,
        )
      const settle = () =>
        page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      const paint = () =>
        page.evaluate(() => [...new Map(window.calendarPaint.map((point) => [JSON.stringify(point), point])).values()])
      async function freshPaint() {
        await settle()
        await page.evaluate(() => {
          window.calendarPaint = []
        })
        await page.setViewportSize({ width: 1601, height: 1050 })
        await settle()
        await page.setViewportSize({ width: 1600, height: 1050 })
        await settle()
      }
      async function activate(id, name) {
        await page.getByText(name, { exact: true }).click()
        await page.waitForFunction((viewId) => window.univerAPI.getBaseUI().getActiveViewId() === viewId, id)
        await freshPaint()
      }
      async function showTime(text, screenshot) {
        for (let attempt = 0; attempt < 12; attempt++) {
          const points = await paint()
          const tick = points.findLast((point) => point.text === text && point.x < 320)
          assert.ok(tick, text + ' native time-axis tick exists')
          if (tick.y >= 250 && tick.y <= 450) break
          await page.mouse.move(850, 700)
          await page.mouse.wheel(0, Math.max(-3000, Math.min(3000, tick.y - 300)))
          await settle()
          await freshPaint()
        }
        await capture(screenshot)
        return paint()
      }
      async function capture(name) {
        await page.screenshot({ path: path.join(output, key + '-' + name + '.png') })
      }
      async function gate(name, fn) {
        try {
          await fn()
          result.gates[name] = { passed: true }
        } catch (error) {
          result.gates[name] = { passed: false, failure: error.stack }
          await capture(name + '-failure').catch(() => {})
        }
      }
      try {
        await page.goto('http://127.0.0.1:4443/')
        await page.locator('.base-calendar-modes[data-ready=true]').waitFor()
        await page.locator('[data-u-comp=workbench-skeleton-content]').waitFor({ state: 'hidden' })
        const initial = await read()
        const initialTable = initial.tables.appointments
        await gate('native-four-views-english-and-record-preservation', async () => {
          assert.equal(Object.keys(initialTable.records).length, 7)
          for (const [id, name] of [
            ['month', 'Month schedule'],
            ['week', 'Week schedule'],
            ['day', 'Day schedule'],
            ['grid', 'Source grid'],
          ]) {
            await activate(id, name)
            result.views[id] = { paint: await paint(), projection: await project(id) }
            await capture(id)
            assert.deepEqual((await read()).tables.appointments.records, initialTable.records)
            assert.doesNotMatch(
              (await page.locator('#app').innerText()) + result.views[id].paint.map(({ text }) => text).join(' '),
              /[\u3400-\u9fff]/,
            )
          }
        })
        await gate('projection-local-clocks-and-undated-exclusion', async () => {
          for (const id of ['month', 'week', 'day']) {
            const projection = result.views[id]?.projection || (await project(id))
            assert.equal(projection.events.length, 6)
            assert.ok(!projection.events.some(({ recordId }) => recordId === 'appointment-7'))
            const actual = await page.evaluate(
              (events) =>
                events.map((event) => {
                  // eslint-disable-next-line unicorn/consistent-function-scoping -- Runs inside the browser's timezone context.
                  const parts = (ms) => {
                    const d = new Date(ms)
                    return [d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]
                  }
                  return { id: event.recordId, start: parts(event.startMs), end: parts(event.endMs) }
                }),
              projection.events,
            )
            result.localClockParts = actual
            assert.deepEqual(actual.find(({ id: recordId }) => recordId === 'appointment-1').start, [2026, 8, 8, 9, 0])
            assert.deepEqual(actual.find(({ id: recordId }) => recordId === 'appointment-1').end, [2026, 8, 8, 10, 30])
            assert.deepEqual(actual.find(({ id: recordId }) => recordId === 'appointment-3').start, [2026, 8, 8, 14, 0])
            assert.deepEqual(actual.find(({ id: recordId }) => recordId === 'appointment-5').start, [2026, 8, 7, 15, 0])
            assert.deepEqual(actual.find(({ id: recordId }) => recordId === 'appointment-5').end, [2026, 8, 9, 10, 0])
          }
        })
        await gate('month-weekday-alignment', async () => {
          const points = result.views.month.paint
          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          const headers = weekdays.map((text) => points.findLast((point) => point.text === text))
          assert.ok(headers.every(Boolean), 'Seven weekday labels painted')
          const eighth = points.findLast(
            ({ text, y }) => text === '8' && y > Math.max(...headers.map((header) => header.y)),
          )
          assert.ok(eighth, 'September 8 date number painted')
          // Weekday labels are at each column's left edge; date numbers are right aligned.
          const nearest = headers.findLast((header) => header.x <= eighth.x)
          result.weekday = { eighth, headers, actual: nearest.text, expected: 'Tue' }
          assert.equal(nearest.text, 'Tue', 'September 8, 2026 must occupy Tuesday column')
        })
        await gate('native-calendar-event-and-time-paint', async () => {
          const month = result.views.month.paint.map(({ text }) => text).join('\n')
          assert.match(month, /Lamp diagnosis/)
          assert.match(month, /Glaze curing/)
          assert.doesNotMatch(month, /Radio assessment/)
          const grid = result.views.grid.paint.map(({ text }) => text).join('\n')
          assert.match(grid, /Radio assessment/)
          assert.match(grid, /2026\/09\/08 09:00/)
        })
        await gate('day-native-morning-clock-position', async () => {
          await activate('day', 'Day schedule')
          const points = await showTime('09:00', 'day-nine-am')
          result.morningPaint = points
          const start = points.findLast(({ text, x }) => text === '09:00' && x < 320)
          const hour = points.findLast(({ text, x }) => text === '10:00' && x < 320)
          const lamp = points.findLast(({ text, y }) => text === 'Lamp diagnosis' && y > 150 && y < 1030)
          assert.ok(lamp, 'Lamp diagnosis must be visible at the authored morning interval')
          const hourHeight = hour.y - start.y
          result.dayHourHeight = hourHeight
          assert.ok(hourHeight > 0 && hourHeight <= 100, 'Compact Day default fits several hours in the viewport')
          assert.ok(
            lamp.y >= start.y && lamp.y <= start.y + hourHeight * 1.5,
            'Lamp title lies in native 09:00–10:30 interval',
          )
        })
        await gate('day-native-afternoon-clock-position', async () => {
          await activate('day', 'Day schedule')
          // Native titles are vertically centered in the full two-hour event; reveal its center.
          const points = await showTime('15:00', 'day-afternoon')
          result.afternoonPaint = points
          const start = points.findLast(({ text, x }) => text === '14:00' && x < 320)
          const end = points.findLast(({ text, x }) => text === '16:00' && x < 320)
          const textile = points.findLast(({ text, y }) => text === 'Textile patch lesson' && y > 150 && y < 1030)
          assert.ok(textile, 'Textile workshop must be visible at the authored afternoon interval')
          assert.ok(textile.y >= start.y && textile.y <= end.y, 'Workshop title lies in native 14:00–16:00 interval')
        })
        await gate('native-local-timezone-caption', async () => {
          const caption = result.views.day.paint.find(({ text }) => text.startsWith('GMT'))?.text
          result.timezoneCaption = { actual: caption, expected: timezoneId === 'UTC' ? 'GMT+00' : 'GMT+08' }
          assert.equal(
            caption,
            result.timezoneCaption.expected,
            'Native local calendar timezone caption matches browser timezone',
          )
        })
        await gate('six-verbatim-recipes-model-effects', async () => {
          await activate('day', 'Day schedule')
          for (const [index, recipe] of recipes.entries()) {
            const before = await read()
            await page.evaluate(async (code) => {
              const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
              await new AsyncFunction(code)()
            }, recipe)
            await freshPaint()
            const after = (await read()).tables.appointments
            if ([0, 1, 5].includes(index)) assert.deepEqual(after.records, before.tables.appointments.records)
            if (index === 0) assert.equal(after.views.day.config.timeslotSize, 'medium')
            if (index === 1) {
              assert.equal(after.views.day.config.timeslotSize, 'short')
              assert.deepEqual(after.views.day.config.displayColor, { type: 'selectField', fieldId: 'kind' })
            }
            if (index === 2) {
              assert.equal(
                after.records['appointment-1'].values.end,
                before.tables.appointments.records['appointment-1'].values.end + 30 / (24 * 60),
              )
              assert.equal(
                after.records['appointment-1'].values.start,
                before.tables.appointments.records['appointment-1'].values.start,
              )
            }
            if (index === 3) {
              assert.equal(after.records['appointment-2'].values.kind, 'Repair')
              assert.equal(
                after.records['appointment-2'].values.start,
                before.tables.appointments.records['appointment-2'].values.start,
              )
              assert.equal(
                after.records['appointment-2'].values.end,
                before.tables.appointments.records['appointment-2'].values.end,
              )
            }
            if (index === 4)
              assert.equal(
                after.records['appointment-3'].values.note,
                'Bring a clean cotton garment for patch practice.',
              )
            result['recipe' + (index + 1)] = { paint: await paint(), projection: await project('day') }
            await capture('recipe-' + (index + 1))
          }
        })
        await gate('edited-native-time-paint', async () => {
          const points = result.recipe3?.paint.map(({ text }) => text).join('\n') || ''
          assert.match(points, /11:00/, 'Extended lamp interval must visibly end at 11:00')
          await activate('grid', 'Source grid')
          await capture('edited-source-grid')
          result.editedGrid = await paint()
          assert.match(result.editedGrid.map(({ text }) => text).join('\n'), /2026\/09\/08 11:00/)
        })
        await gate('same-owner-complete-save-theme-preservation', async () => {
          await page.evaluate(() => {
            window.calendarOwner = window.univerAPI.getBase('repair-studio-calendar').getBase()
          })
          const edited = await read()
          for (const dark of [true, false]) {
            await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
            await settle()
            assert.deepEqual(await read(), edited)
            assert.equal(
              await page.evaluate(
                () => window.calendarOwner === window.univerAPI.getBase('repair-studio-calendar').getBase(),
              ),
              true,
            )
            await capture(dark ? 'dark' : 'light')
          }
        })
        await gate('no-errors-or-backend-writes', async () => {
          assert.deepEqual(result.errors, [])
          assert.deepEqual(result.writes, [])
        })
        result.passed = Object.values(result.gates).every(({ passed }) => passed)
      } catch (error) {
        result.startupFailure = error.stack
        await capture('startup-failure').catch(() => {})
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
    results.map(({ timezoneId, lang, passed, gates, startupFailure }) => ({
      timezoneId,
      lang,
      passed,
      gates,
      startupFailure,
    })),
  ),
)
assert.ok(results.every(({ passed }) => passed))
