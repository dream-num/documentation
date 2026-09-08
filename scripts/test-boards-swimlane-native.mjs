/* eslint-disable no-await-in-loop -- Two host languages and four sequential authored recipes. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const manifestPath = process.argv[2]
const entry = JSON.parse(await fs.readFile(manifestPath, 'utf8')).find(
  (item) => item.slug === 'boards/swimlane-orientation-and-lanes',
)
assert.ok(entry?.passed)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/swimlane-native')
await fs.mkdir(output, { recursive: true })
const readme = await fs.readFile('showcase/boards/swimlane-orientation-and-lanes/README.md', 'utf8')
const recipes = [...readme.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
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
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale })
    const result = { locale, passed: false, errors: [], gates: [] }
    results.push(result)
    page.on('pageerror', (error) => result.errors.push(String(error)))
    await page.addInitScript(() => {
      window.swimlanePaint = []
      const original = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        window.swimlanePaint.push(String(text))
        return original.call(this, text, ...args)
      }
    })
    await page.route('http://127.0.0.1:4452/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${locale}">`) })
    })
    const screenshot = (name) => page.screenshot({ path: path.join(output, `${locale}-${name}.png`) })
    const state = () =>
      page.evaluate(() => {
        const board = window.univerAPI.getActiveBoard()
        return {
          save: board.save(),
          lanes: Object.fromEntries(
            ['horizontal', 'vertical', 'unequal'].map((id) => [id, board.getElement(id).containerData.swimlane]),
          ),
          children: board.getContainerChildren('unequal'),
        }
      })
    try {
      await page.goto('http://127.0.0.1:4452/')
      await page.locator('[data-ready="true"]').waitFor({ timeout: 60000 })
      await page.waitForTimeout(500)
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      const initial = await state()
      await fs.writeFile(path.join(output, `${locale}-initial-model.json`), JSON.stringify(initial, null, 2))
      assert.equal(initial.lanes.horizontal.orientation, 'horizontal')
      assert.equal(initial.lanes.vertical.orientation, 'vertical')
      assert.equal(initial.lanes.unequal.lanes.find((lane) => lane.id === 'review').collapsed, true)
      assert.equal(initial.children.length, 3)
      assert.ok(initial.children.some((child) => child.id === 'unequal-review'))
      await screenshot('initial')
      result.gates.push('native geometry screenshot; collapsed lane retains all three child records')
      // Observed initial 1440x1000 canvas: unequal Review header at x250/y652.
      result.nativePoint = { x: 250, y: 652 }
      await page.mouse.click(250, 652, { button: 'right' })
      await page.getByText('Expand lane', { exact: true }).waitFor({ state: 'visible' })
      await page.waitForTimeout(200)
      result.menu = await page.locator('body').innerText()
      await screenshot('lane-menu')
      assert.doesNotMatch(result.menu, /[\u3400-\u9fff]/)
      await page.getByText('Expand lane', { exact: true }).click()
      await page.waitForTimeout(200)
      const expanded = await state()
      assert.equal(expanded.lanes.unequal.lanes.find((lane) => lane.id === 'review').collapsed, false)
      assert.deepEqual(
        expanded.children.map((child) => [child.id, child.laneId]),
        initial.children.map((child) => [child.id, child.laneId]),
      )
      await screenshot('native-expanded')
      result.gates.push('real native Expand lane preserves membership')
      await page.reload()
      await page.locator('[data-ready="true"]').waitFor({ timeout: 60000 })
      await page.waitForTimeout(500)
      for (const [index, recipe] of recipes.entries()) {
        await page.evaluate((code) => {
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
          return new AsyncFunction('univerAPI', code)(window.univerAPI)
        }, recipe)
        await page.waitForTimeout(200)
        const current = await state()
        if (index === 0) assert.equal(current.lanes.unequal.lanes.find((lane) => lane.id === 'review').collapsed, false)
        if (index === 1)
          assert.equal(current.lanes.horizontal.lanes.find((lane) => lane.id === 'review').title, 'Quality check')
        if (index === 2) assert.equal(current.lanes.vertical.lanes[0].id, 'ready')
        if (index === 3) assert.equal(current.lanes.horizontal.lanes.find((lane) => lane.id === 'intake').size, 120)
        assert.deepEqual(
          current.children.map((child) => [child.id, child.laneId]),
          initial.children.map((child) => [child.id, child.laneId]),
        )
        await screenshot(`recipe-${index + 1}`)
        result.gates.push(`literal README recipe ${index + 1}`)
      }
      const beforeTheme = await state()
      await page.evaluate(() => {
        window.swimlaneOwner = window.univerAPI
        window.swimlanePaint = []
        window.univerAPI.toggleDarkMode(true)
      })
      await page.waitForTimeout(300)
      assert.deepEqual((await state()).save, beforeTheme.save)
      assert.equal(await page.evaluate(() => window.swimlaneOwner === window.univerAPI), true)
      // Docs text is painted character by character; join calls without inserted delimiters.
      const paint = await page.evaluate(() => window.swimlanePaint.join(''))
      await fs.writeFile(path.join(output, `${locale}-fresh-paint.txt`), paint)
      assert.ok(paint.includes('Compare dyes'))
      assert.ok(paint.includes('Quality check'))
      await screenshot('dark')
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await page.waitForTimeout(200)
      assert.deepEqual((await state()).save, beforeTheme.save)
      result.gates.push('fresh edited card/lane paint; same owner and exact complete saved model through dark/light')
      assert.deepEqual(result.errors, [])
      result.passed = true
    } catch (error) {
      result.failure = error.stack || String(error)
      await screenshot('failure')
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
