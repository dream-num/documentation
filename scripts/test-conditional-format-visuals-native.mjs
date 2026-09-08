/* eslint-disable no-await-in-loop -- Keep independent feature acceptance gates. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find(({ slug }) => slug === 'sheets/conditional-format-visuals')
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 4)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/conditional-format-visuals-native')
await fs.mkdir(output, { recursive: true })
const vite = entry.links.find(({ name }) => name === 'vite')
const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4454, strictPort: true },
})
const browser = await chromium.launch()
const report = { passed: false, sourceFiles: Object.keys(source.files).length, hosts: [] }
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, gates: {}, errors: [] }
    report.hosts.push(result)
    const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } })
    page.setDefaultTimeout(10000)
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.route('http://127.0.0.1:4454/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    const values = (address) =>
      page.evaluate((cell) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(cell).getValues(), address)
    async function select(address) {
      const box = page.locator('input.univer-size-full')
      await box.fill(address)
      await box.press('Enter')
    }
    async function settle() {
      await page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        await Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
            .map((animation) => animation.finished.catch(() => {})),
        )
      })
    }
    async function shot(name) {
      await settle()
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
      await fs.writeFile(path.join(output, `${lang}-${name}.txt`), await page.locator('body').innerText())
    }
    async function gate(name, action) {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
        await shot(`failure-${name}`)
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function raster(address) {
      await select('G1')
      await settle()
      return page.evaluate((cell) => {
        const rect = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(cell).getCellRect()
        const canvas = [...document.querySelectorAll('canvas')].toSorted((a, b) => b.clientHeight - a.clientHeight)[0]
        const ratio = canvas.width / canvas.clientWidth
        const width = Math.floor(rect.width * ratio)
        const height = Math.floor(rect.height * ratio)
        const data = canvas
          .getContext('2d')
          .getImageData(Math.floor(rect.x * ratio), Math.floor(rect.y * ratio), width, height).data
        const pixel = (x, y) => {
          const i = (y * width + x) * 4
          return [0, 1, 2].map((c) => Math.round((data[i + c] * data[i + 3]) / 255 + 255 - data[i + 3]))
        }
        const left = []
        let text = 0
        let positive = 0
        let negative = 0
        let px = 0
        let nx = 0
        const shades = new Set()
        for (let y = 5; y < height - 5; y++)
          for (let x = 5; x < width - 5; x++) {
            const rgb = pixel(x, y)
            if (x < 35) left.push(...rgb)
            if (x > width - 60 && rgb.every((v) => v < 180) && Math.max(...rgb) - Math.min(...rgb) < 20) text++
            if (rgb[1] > rgb[0] + 25 && rgb[2] > rgb[0] + 25) {
              positive++
              px += x
            }
            if (rgb[0] > rgb[1] + 35 && rgb[0] > rgb[2] + 20) {
              negative++
              nx += x
            }
            if (y === 10) shades.add(rgb.join(','))
          }
        return {
          corner: pixel(width - 7, 5),
          left,
          text,
          positive,
          negative,
          positiveX: positive ? px / positive : 0,
          negativeX: negative ? nx / negative : 0,
          width,
          shades: shades.size,
        }
      }, address)
    }
    async function edit(address, value) {
      await select(address)
      await page.keyboard.type(String(value))
      await page.keyboard.press('Enter')
      assert.deepEqual(await values(address), [[value]])
    }
    async function waitRaster(address, predicate) {
      const deadline = Date.now() + 10000
      let actual
      do {
        actual = await raster(address)
        if (predicate(actual)) return actual
      } while (Date.now() < deadline)
      assert.fail(`Paint did not settle for ${address}`)
    }
    async function tab(name) {
      await page.getByText(name, { exact: true }).first().click()
      await settle()
    }
    try {
      await page.goto('http://127.0.0.1:4454/')
      await page.waitForFunction(
        () => window.univerAPI?.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      await gate('English-real-rules-no-fake-data-styles', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        assert.deepEqual(
          await page.evaluate(() =>
            ['scales', 'bars', 'icons'].map(
              (id) => window.univerAPI.getActiveWorkbook().getSheetBySheetId(id).getConditionalFormattingRules().length,
            ),
          ),
          [2, 2, 2],
        )
        for (const sheet of Object.values((await save()).sheets))
          for (let row = 4; row < 10; row++)
            for (const cell of Object.values(sheet.cellData[row])) assert.equal(cell.s, undefined)
      })
      await gate('two-three-scale-endpoints-midpoint-paint', async () => {
        assert.deepEqual((await raster('B5')).corner, [252, 230, 187])
        assert.deepEqual((await raster('B10')).corner, [140, 202, 187])
        assert.deepEqual((await raster('C8')).corner, [255, 243, 206])
        await shot('scales-initial')
      })
      const history = { before: await save() }
      await gate('native-scale-edit-paint', async () => {
        await edit('B5', 100)
        assert.deepEqual((await raster('B5')).corner, [140, 202, 187])
        assert.deepEqual(await values('C5'), [[0]])
        history.after = await save()
        await shot('scales-edited')
      })
      await gate('native-Undo-values-paint', async () => {
        await page.keyboard.press('Control+z')
        history.undo = await save()
        assert.deepEqual(await values('B5'), [[0]])
        assert.deepEqual((await raster('B5')).corner, [252, 230, 187])
      })
      await gate('native-Undo-strict-snapshot', async () => assert.deepEqual(history.undo, history.before))
      await gate('native-Redo-strict-snapshot', async () => {
        await page.keyboard.press('Control+y')
        history.redo = await save()
        assert.deepEqual(history.redo, history.after)
      })
      await fs.writeFile(path.join(output, `${lang}-history.json`), JSON.stringify(history, null, 2))
      await gate('solid-gradient-signed-bars-paint', async () => {
        await tab('Signed data bars')
        const negative = await raster('B5')
        const positive = await raster('B10')
        const zero = await raster('B7')
        const gradient = await raster('C5')
        result.bars = { negative, positive, zero, gradient }
        delete result.bars.negative.left
        delete result.bars.positive.left
        delete result.bars.zero.left
        delete result.bars.gradient.left
        assert.ok(negative.negative > 100 && negative.negativeX < negative.width / 2)
        assert.ok(positive.positive > 100 && positive.positiveX > positive.width / 2)
        assert.equal(zero.negative + zero.positive, 0)
        assert.ok(gradient.shades > negative.shades)
        await shot('bars-initial')
      })
      await gate('native-bar-sign-edit-paint', async () => {
        await edit('B5', 80)
        const actual = await raster('B5')
        assert.ok(actual.positive > 100 && actual.positiveX > actual.width / 2)
        assert.equal(actual.negative, 0)
        assert.deepEqual(await values('C5'), [[-80]])
        await shot('bars-edited')
      })
      await gate('icon-boundaries-values-hidden-paint', async () => {
        await tab('Icon thresholds')
        const red = await raster('B5')
        const red49 = await raster('B6')
        const yellow = await raster('B7')
        const yellow79 = await raster('B8')
        const green = await raster('B9')
        const hidden = await raster('C5')
        assert.deepEqual(red.left, red49.left)
        assert.deepEqual(yellow.left, yellow79.left)
        assert.notDeepEqual(red.left, yellow.left)
        assert.notDeepEqual(yellow.left, green.left)
        assert.deepEqual(red.left, hidden.left)
        assert.ok(red.text > 0)
        assert.equal(hidden.text, 0)
        assert.deepEqual(await values('C5:C10'), [[30], [49], [50], [79], [80], [95]])
        await shot('icons-initial')
      })
      await gate('native-icon-threshold-edit-paint', async () => {
        const green = await raster('B9')
        await edit('B5', 80)
        assert.deepEqual((await raster('B5')).left, green.left)
        assert.deepEqual(await values('C5'), [[30]])
        await shot('icons-edited')
      })
      for (const [index, recipe] of recipes.entries())
        await gate(`literal-${index + 1}`, async () => {
          await page.evaluate(async (code) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            await new AsyncFunction(code)()
          }, recipe)
          await tab(['Colour scales', 'Signed data bars', 'Icon thresholds', 'Icon thresholds'][index])
          if (index === 0) assert.deepEqual((await raster('B10')).corner, [252, 230, 187])
          if (index === 1) {
            assert.equal((await raster('B10')).text, 0)
            assert.deepEqual(await values('B10'), [[100]])
          }
          if (index === 2) assert.ok((await raster('C5')).text > 0)
          if (index === 3) {
            const yellow = JSON.stringify((await raster('B7')).left)
            const green = JSON.stringify((await raster('B9')).left)
            await waitRaster('B6', (actual) => JSON.stringify(actual.left) === yellow)
            await waitRaster('B8', (actual) => JSON.stringify(actual.left) === green)
          }
          await shot(`recipe-${index + 1}`)
        })
      await gate('same-owner-themes-full-save-reload', async () => {
        const before = await save()
        await page.evaluate(() => {
          window.visualOwner = window.univerAPI.getActiveWorkbook().getWorkbook()
          window.univerAPI.toggleDarkMode(true)
        })
        await shot('dark')
        await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
        assert.equal(
          await page.evaluate(() => window.visualOwner === window.univerAPI.getActiveWorkbook().getWorkbook()),
          true,
        )
        assert.deepEqual(await save(), before)
        await page.evaluate((data) => {
          window.univerAPI.disposeUnit(data.id)
          window.univerAPI.createWorkbook(data)
        }, before)
        assert.deepEqual(await save(), before)
      })
      await gate('native-data-bar-rule-editor', async () => {
        await tab('Signed data bars')
        await page.getByRole('tab', { name: 'Data', exact: true }).click()
        await page.getByText('Conditional Formatting', { exact: true }).first().click()
        await page.getByText('Manage Conditional Formatting', { exact: true }).click()
        await page.getByText('B5:B10', { exact: true }).first().click()
        await page.getByText('Data Bar', { exact: true }).first().waitFor()
        await page.getByText('Only Show Data Bars', { exact: true }).waitFor()
        await shot('native-bar-editor')
        const onlyBars = page.getByRole('checkbox')
        assert.equal(await onlyBars.isChecked(), true)
        await page.locator('label[data-u-comp="checkbox"]').filter({ has: onlyBars }).click()
        assert.equal(await onlyBars.isChecked(), false)
        await page.getByText('Submit', { exact: true }).click()
        await waitRaster('B10', (actual) => actual.text > 0)
        assert.deepEqual(await values('B10'), [[100]])
        await shot('native-bar-values-restored')
      })
      await gate('no-runtime-errors', async () => assert.deepEqual(result.errors, []))
    } catch (error) {
      result.fatal = error.stack || String(error)
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((g) => g.passed)
  }
  report.passed = report.hosts.every((host) => host.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.ok(report.passed, `See ${output}/report.json`)
