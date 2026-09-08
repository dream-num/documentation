/* eslint-disable no-await-in-loop -- Native tabs and README recipes are exercised in sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find(({ slug }) => slug === 'bases/kanban-cards-and-columns')
assert.ok(entry?.passed)
const readme = await fs.readFile('showcase/bases/kanban-cards-and-columns/README.md', 'utf8')
const recipes = [...readme.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 6)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-kanban-cards')
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
  preview: { host: '127.0.0.1', port: 4444, strictPort: true },
})
const browser = await chromium.launch()
const results = []
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, passed: false, errors: [], writes: [], checks: [], gates: {}, views: {} }
    results.push(result)
    const page = await browser.newPage({ viewport: { width: 1800, height: 1050 }, timezoneId: 'Asia/Shanghai' })
    page.setDefaultTimeout(15000)
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.writes.push(request.url())
    })
    await page.route('http://127.0.0.1:4444/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    await page.addInitScript(() => {
      window.kanbanPaint = []
      window.kanbanImages = []
      window.kanbanPoints = []
      const fillText = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        if (window.kanbanPaint.length < 30000) window.kanbanPaint.push(String(text))
        if (this.canvas.isConnected) {
          const point = this.getTransform().transformPoint({ x: args[0], y: args[1] })
          const rect = this.canvas.getBoundingClientRect()
          window.kanbanPoints.push({
            text: String(text),
            x: rect.x + (point.x * rect.width) / this.canvas.width,
            y: rect.y + (point.y * rect.height) / this.canvas.height,
          })
          window.kanbanPoints = window.kanbanPoints.slice(-20000)
        }
        return fillText.call(this, text, ...args)
      }
      const drawImage = CanvasRenderingContext2D.prototype.drawImage
      CanvasRenderingContext2D.prototype.drawImage = function (image, ...args) {
        if (image instanceof HTMLImageElement && image.src.startsWith('data:image/svg+xml')) {
          const size =
            args.length === 8 ? args.slice(6, 8) : args.length === 4 ? args.slice(2, 4) : [image.width, image.height]
          if (window.kanbanImages.length < 20000) window.kanbanImages.push({ source: image.src, size })
        }
        return drawImage.call(this, image, ...args)
      }
    })
    const read = () => page.evaluate(() => window.univerAPI.getBase('repair-kanban').save())
    const settle = () =>
      page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const clearPaint = () =>
      page.evaluate(() => {
        window.kanbanPaint = []
        window.kanbanImages = []
      })
    const paint = () =>
      page.evaluate(() => ({
        text: [...new Set(window.kanbanPaint)],
        images: [...new Map(window.kanbanImages.map((image) => [JSON.stringify(image), image])).values()],
      }))
    const screenshot = (name) => page.screenshot({ path: path.join(output, lang + '-' + name + '.png') })
    const gate = async (name, action) => {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, failure: error.stack }
        await screenshot(name + '-failure').catch(() => {})
      }
    }
    const repaint = async () => {
      await clearPaint()
      await page.evaluate(() => {
        window.kanbanPoints = []
      })
      await page.setViewportSize({ width: 1801, height: 1050 })
      await settle()
      await page.setViewportSize({ width: 1800, height: 1050 })
      await page.waitForFunction(() => window.kanbanPaint.some((text) => text.includes('Replace violin bridge')))
      await settle()
    }
    const switchView = async (id, label) => {
      await page.getByText(label, { exact: true }).click()
      await page.waitForFunction((viewId) => window.univerAPI.getBaseUI().getActiveViewId() === viewId, id)
      await repaint()
    }
    try {
      await page.goto('http://127.0.0.1:4444/')
      await page.locator('.base-kanban-cards[data-ready=true]').waitFor()
      await page.waitForFunction(
        () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      const initial = await read()
      await gate('english-startup', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        assert.equal(await page.locator('html').getAttribute('lang'), lang)
        assert.doesNotMatch(await page.locator('#app').innerText(), /[\u3400-\u9fff]/)
        assert.equal(Object.keys(initial.tables.jobs.records).length, 6)
        assert.equal(Object.values(initial.tables.jobs.records).filter(({ values }) => values.cover.length).length, 2)
        assert.equal(
          Object.values(initial.tables.jobs.records).filter(({ values }) => values.status === 'ready').length,
          0,
        )
      })
      for (const [id, label] of [
        ['compact', 'Compact cards'],
        ['detailed', 'Labeled repair cards'],
        ['covers', 'Cover cards'],
        ['source', 'Source records'],
      ]) {
        await gate('view-' + id, async () => {
          await switchView(id, label)
          result.views[id] = await paint()
          assert.deepEqual((await read()).tables.jobs.records, initial.tables.jobs.records)
          if (id !== 'source') {
            for (const heading of ['Intake', 'On bench', 'Play test', 'Ready for collection'])
              assert.ok(result.views[id].text.includes(heading), 'Missing column ' + heading)
          }
          if (id === 'compact') assert.ok(!result.views[id].text.includes('Bench hours'))
          if (id === 'detailed') {
            assert.ok(result.views[id].text.includes('Bench hours'))
            assert.ok(result.views[id].text.includes('Repair note'))
          }
          if (id === 'covers') {
            const sources = [...new Set(result.views[id].images.map(({ source }) => source))]
            assert.equal(sources.length, 2, 'Only the two authored native image covers render')
          }
          await screenshot(id)
        })
      }
      await gate('native-drag-status-writeback', async () => {
        await switchView('compact', 'Compact cards')
        const points = await page.evaluate(() => window.kanbanPoints)
        const start = points.findLast(({ text }) => text === 'Clean trumpet valves')
        const destination = points.findLast(({ text }) => text === 'Ready for collection')
        assert.ok(start && destination, 'Observed native card and target lane headings')
        await page.mouse.move(start.x + 45, start.y - 4)
        await page.mouse.down()
        await page.mouse.move(start.x + 55, start.y + 5, { steps: 5 })
        await page.mouse.move(destination.x + 60, start.y, { steps: 30 })
        await page.mouse.up()
        await page.waitForFunction(
          () =>
            window.univerAPI.getBase('repair-kanban').getTableById('jobs').getRecordById('job-5').getValue('status') ===
            'ready',
          null,
          { timeout: 5000 },
        )
        const changed = await read()
        assert.equal(changed.tables.jobs.records['job-5'].values.status, 'ready')
        assert.deepEqual(changed.tables.jobs.records['job-5'].values, {
          ...initial.tables.jobs.records['job-5'].values,
          status: 'ready',
        })
        for (const id of Object.keys(initial.tables.jobs.records).filter((recordId) => recordId !== 'job-5'))
          assert.deepEqual(changed.tables.jobs.records[id], initial.tables.jobs.records[id])
        assert.deepEqual(changed.tables.jobs.views, initial.tables.jobs.views)
        await screenshot('native-drag')
      })
      // Fresh owner keeps literal recipe expectations independent of successful or failed drag.
      await page.reload()
      await page.locator('.base-kanban-cards[data-ready=true]').waitFor()
      await page.waitForFunction(
        () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      for (let index = 0; index < recipes.length; index++) {
        await gate('literal-' + (index + 1) + (index === 3 ? '-config-only' : ''), async () => {
          const before = await read()
          if (index === 3)
            result.collapseBefore = await page.evaluate(() =>
              window.univerAPI.getBase('repair-kanban').getTableById('jobs').getViewById('compact').getProjection(),
            )
          await page.evaluate((source) => new Function(source)(), recipes[index])
          await repaint()
          const after = await read(),
            table = after.tables.jobs
          if (index !== 4) assert.deepEqual(table.records, before.tables.jobs.records)
          if (index === 0) {
            assert.equal(table.views.compact.config.cardLayout, 'normal')
            assert.ok((await paint()).text.includes('Bench hours'))
          }
          if (index === 1) {
            assert.deepEqual(table.views.detailed.config.card.fieldIds, ['note', 'instrument'])
            const points = await page.evaluate(() => window.kanbanPoints)
            const note = points.findLast(({ text }) => text === 'Repair note')
            const instrument = points.findLast(({ text }) => text === 'Instrument')
            assert.ok(note && instrument, 'Both labels paint')
            assert.ok(note.y < instrument.y, 'Repair note appears before instrument')
            assert.ok(!(await paint()).text.includes('Bench hours'))
          }
          if (index === 2) {
            assert.equal(
              table.fields.status.config.options.find((option) => option.id === 'bench').name,
              'Repair bench',
            )
            assert.ok((await paint()).text.includes('Repair bench'), 'Native column title updates')
          }
          if (index === 3) {
            assert.equal(table.views.compact.config.columnSettings.ready.collapsed, true)
            result.collapsedPaint = await paint()
            result.collapseAfter = await page.evaluate(() =>
              window.univerAPI.getBase('repair-kanban').getTableById('jobs').getViewById('compact').getProjection(),
            )
            result.collapseLimitation =
              'Stored collapsed=true verified; native lane-width/collapse presentation is not accepted by this gate.'
          }
          if (index === 4) {
            assert.equal(table.records['job-5'].values.status, 'ready')
            assert.deepEqual(table.records['job-1'], before.tables.jobs.records['job-1'])
          }
          if (index === 5) {
            assert.equal(table.views.covers.config.coverFieldId, null)
            assert.equal((await paint()).images.length, 0, 'No native image covers after hiding')
            assert.equal(table.records['job-1'].values.cover.length, 1)
          }
          await screenshot('literal-' + (index + 1))
        })
        if (index === 3)
          await gate('native-column-collapse-effect', async () => {
            assert.notDeepEqual(
              result.collapseAfter,
              result.collapseBefore,
              'Native projected lanes remain identical after collapsed=true; no native collapse effect is accepted',
            )
          })
      }
      await gate('same-model-themes', async () => {
        const before = await read()
        await page.evaluate(() => {
          window.kanbanOwner = window.univerAPI.getBase('repair-kanban').getBase()
        })
        for (const dark of [true, false]) {
          await page.evaluate((darkMode) => window.univerAPI.toggleDarkMode(darkMode), dark)
          await settle()
          assert.deepEqual(await read(), before)
          assert.equal(
            await page.evaluate(() => window.kanbanOwner === window.univerAPI.getBase('repair-kanban').getBase()),
            true,
          )
        }
      })
      await gate('no-errors-or-backend-writes', async () => {
        assert.deepEqual(result.errors, [])
        assert.deepEqual(result.writes, [])
      })
      result.passed = Object.values(result.gates).every(({ passed }) => passed)
    } catch (error) {
      result.failure = error.stack
      await screenshot('startup-failure').catch(() => {})
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
    results.map(({ lang, passed, gates, failure }) => ({ lang, passed, gates, failure })),
    null,
    2,
  ),
)
assert.ok(results.length === 2 && results.every(({ passed }) => passed))
