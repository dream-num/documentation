/* eslint-disable no-await-in-loop -- Native views and literal recipes are exercised in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find(({ slug }) => slug === 'bases/gantt-timeline-and-working-days')
assert.ok(entry?.passed)
const readme = await fs.readFile('showcase/bases/gantt-timeline-and-working-days/README.md', 'utf8')
const recipes = [...readme.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 5)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-gantt-native')
await fs.mkdir(output, { recursive: true })
const viteLink = entry.links.find(({ name }) => name === 'vite')
assert.ok(viteLink?.target)
assert.equal(
  JSON.parse(await fs.readFile(path.join(viteLink.target, 'package.json'), 'utf8')).version,
  viteLink.version,
)
const { preview } = await import(pathToFileURL(path.join(viteLink.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4438, strictPort: true },
})
const browser = await chromium.launch()
const results = []
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, passed: false, errors: [], writes: [], checks: [], native: {} }
    results.push(result)
    const page = await browser.newPage({ viewport: { width: 1600, height: 1050 }, timezoneId: 'Asia/Shanghai' })
    page.setDefaultTimeout(30000)
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.writes.push(request.url())
    })
    await page.route('http://127.0.0.1:4438/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    await page.addInitScript(() => {
      window.ganttPaint = []
      window.ganttPoints = []
      const original = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        if (window.ganttPaint.length < 20000) window.ganttPaint.push(String(text))
        const point = this.getTransform().transformPoint({ x: args[0], y: args[1] })
        const rect = this.canvas.getBoundingClientRect()
        if (rect.width && rect.height)
          window.ganttPoints.push({
            text: String(text),
            x: rect.x + (point.x * rect.width) / this.canvas.width,
            y: rect.y + (point.y * rect.height) / this.canvas.height,
          })
        return original.call(this, text, ...args)
      }
    })
    const read = () => page.evaluate(() => window.univerAPI.getBase('exhibition-gantt').save())
    const settle = () =>
      page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    try {
      await page.goto('http://127.0.0.1:4438/')
      await page.locator('.base-gantt-timeline[data-ready="true"]').waitFor()
      await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'hidden' })
      const initial = await read()
      const table = initial.tables.installation
      assert.equal(Object.keys(table.records).length, 8)
      assert.equal(table.views.overview.config.scale, 'quarter')
      assert.equal(table.views['working-week'].config.scale, 'week')
      assert.doesNotMatch(await page.locator('#app').innerText(), /[\u3400-\u9fff]/)
      await page.waitForFunction(() => window.ganttPaint.some((text) => text.includes('Visitor access')))
      result.initialPaint = [...new Set(await page.evaluate(() => window.ganttPaint))]
      await page.screenshot({ path: path.join(output, `${lang}-overview.png`) })
      const year = await page.evaluate(() => window.ganttPoints.findLast(({ text }) => text === 'Year'))
      assert.ok(year, 'Native canvas Year control was painted')
      await page.mouse.click(year.x + 10, year.y - 4)
      await page.waitForFunction(
        () =>
          window.univerAPI.getBase('exhibition-gantt').save().tables.installation.views.overview.config.scale ===
          'year',
      )
      assert.deepEqual((await read()).tables.installation.records, table.records)
      const quarter = await page.evaluate(() => window.ganttPoints.findLast(({ text }) => text === 'Quarter'))
      await page.mouse.click(quarter.x + 10, quarter.y - 4)
      await page.getByText('Working week', { exact: true }).click()
      await settle()
      await page.screenshot({ path: path.join(output, `${lang}-working-week.png`) })
      await page.getByText('Source records', { exact: true }).click()
      await settle()
      await page.screenshot({ path: path.join(output, `${lang}-source.png`) })
      assert.deepEqual((await read()).tables.installation.records, table.records)
      result.checks.push('Native scale control and three view tabs preserve all eight records')
      for (const [operation, hitType, edge] of [
        ['move', 'gantt-bar', null],
        ['resize', 'gantt-bar-resize', 'end'],
        ['progress', 'grid-progress-bar', null],
      ]) {
        try {
          await page.reload()
          await page.locator('.base-gantt-timeline[data-ready=true]').waitFor()
          await page.waitForFunction(
            () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
          )
          await settle()
          const before = await read()
          const point = await page.evaluate(
            ({ type, edgeValue }) => {
              const canvas = document.querySelector('.base-gantt-timeline canvas')
              const rect = canvas.getBoundingClientRect()
              const titles = window.ganttPoints.filter(({ text }) => text === 'Build modular plinths')
              const title = titles.toSorted((a, b) => b.x - a.x)[0]
              if (!title) return null
              const y = title.y - 4
              const row = canvas
                .getContext('2d')
                .getImageData(0, Math.round(((y - rect.y) * canvas.height) / rect.height), canvas.width, 1).data
              const found = []
              for (let pixel = 0; pixel < canvas.width; pixel++) {
                const x = rect.x + (pixel * rect.width) / canvas.width
                const [r, g, b] = row.slice(pixel * 4, pixel * 4 + 3)
                const matches =
                  type === 'grid-progress-bar'
                    ? x < title.x - 200 && r < 40 && g > 70 && b > 60
                    : x > title.x - 20 && r > g + 20 && g > b + 10
                if (matches) found.push(x)
              }
              return found.length
                ? {
                    x: edgeValue === 'end' ? Math.max(...found) - 2 : found[Math.floor(found.length / 2)],
                    y,
                    count: found.length,
                    minX: Math.min(...found),
                    maxX: Math.max(...found),
                    origin:
                      'Observed canvas label and rendered bar pixels; public getRenderedView returns null in installed runtime',
                  }
                : null
            },
            { type: hitType, edgeValue: edge },
          )
          assert.ok(point, 'No rendered bar pixels for ' + operation)
          result.native[operation] = { passed: false, point }
          await page.mouse.move(point.x, point.y)
          await page.mouse.down()
          await page.mouse.move(operation === 'progress' ? point.minX + 5 : point.x + 48, point.y, { steps: 24 })
          await page.mouse.up()
          await page
            .waitForFunction(
              ({ operation: kind, original }) => {
                const values = window.univerAPI
                  .getBase('exhibition-gantt')
                  .getTableById('installation')
                  .getRecordById('task-3')
                  .getValues()
                return kind === 'progress' ? values.progress !== original.progress : values.end !== original.end
              },
              { operation, original: before.tables.installation.records['task-3'].values },
              { timeout: 5000 },
            )
            .catch(() => {})
          const after = await read(),
            original = before.tables.installation.records['task-3'].values,
            current = after.tables.installation.records['task-3'].values
          result.native[operation] = { ...result.native[operation], before: original, after: current }
          await page.screenshot({ path: path.join(output, `${lang}-native-${operation}-observed.png`) })
          for (const id of Object.keys(before.tables.installation.records).filter((recordId) => recordId !== 'task-3'))
            assert.deepEqual(after.tables.installation.records[id], before.tables.installation.records[id])
          assert.deepEqual(after.tables.installation.views, before.tables.installation.views)
          if (operation === 'move') {
            assert.notEqual(current.start, original.start)
            assert.equal(current.end - current.start, original.end - original.start)
            assert.equal(current.progress, original.progress)
          } else if (operation === 'resize') {
            assert.equal(current.start, original.start)
            assert.ok(current.end > original.end)
            assert.equal(current.progress, original.progress)
          } else {
            assert.notEqual(current.progress, original.progress)
            assert.ok(current.progress >= 0 && current.progress <= 100)
            assert.equal(current.start, original.start)
            assert.equal(current.end, original.end)
          }
          result.native[operation] = { ...result.native[operation], passed: true, before: original, after: current }
          await page.screenshot({ path: path.join(output, `${lang}-native-${operation}.png`) })
        } catch (error) {
          result.native[operation] = { ...result.native[operation], passed: false, failure: error.stack }
          await page.screenshot({ path: path.join(output, `${lang}-native-${operation}-failure.png`) })
        }
      }
      await page.reload()
      await page.locator('.base-gantt-timeline[data-ready=true]').waitFor()
      await page.waitForFunction(
        () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      for (const [index, recipe] of recipes.entries()) {
        const before = await read()
        await page.evaluate((code) => new Function(code)(), recipe)
        await settle()
        const after = await read()
        const next = after.tables.installation
        if ([0, 1, 4].includes(index)) assert.deepEqual(next.records, before.tables.installation.records)
        if (index === 0) {
          assert.equal(next.views.overview.config.scale, 'month')
          assert.deepEqual(next.views['working-week'], before.tables.installation.views['working-week'])
        }
        if (index === 1)
          assert.equal(
            next.views['working-week'].config.workingDays.exceptions[0].name,
            'Gallery electrical inspection',
          )
        if (index === 2) assert.equal(next.records['task-3'].values.progress, 80)
        if (index === 3) {
          assert.equal(next.records['task-4'].values.end, before.tables.installation.records['task-4'].values.end + 2)
          assert.equal(next.records['task-4'].values.start, before.tables.installation.records['task-4'].values.start)
        }
        if (index === 4) assert.equal(next.views.overview.config.leftPaneCollapsed, true)
        await page.screenshot({ path: path.join(output, `${lang}-recipe-${index + 1}.png`) })
      }
      result.checks.push(
        'Five README recipes execute verbatim with exact configuration/data effects; not native drag acceptance',
      )
      await page.evaluate(() => {
        window.ganttOwner = window.univerAPI.getBase('exhibition-gantt').getBase()
      })
      const edited = await read()
      for (const dark of [true, false]) {
        await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
        await settle()
        assert.deepEqual(await read(), edited)
        assert.equal(
          await page.evaluate(() => window.ganttOwner === window.univerAPI.getBase('exhibition-gantt').getBase()),
          true,
        )
      }
      result.checks.push('Same underlying Base owner and complete edited snapshot through both themes')
      assert.deepEqual(result.errors, [])
      assert.deepEqual(result.writes, [])
      result.passed = Object.values(result.native).every(({ passed }) => passed)
    } catch (error) {
      result.failure = error.stack
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
console.log(JSON.stringify(results))
assert.ok(results.every(({ passed }) => passed))
