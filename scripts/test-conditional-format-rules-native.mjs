/* eslint-disable no-await-in-loop -- Preserve independent native and literal checks. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find(({ slug }) => slug === 'sheets/conditional-format-rules')
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 4)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/conditional-format-rules-native')
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
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
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
    async function select(address) {
      const box = page.locator('input.univer-size-full')
      await box.fill(address)
      await box.press('Enter')
    }
    async function shot(name) {
      await page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        await Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
            .map((animation) => animation.finished.catch(() => {})),
        )
      })
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
    async function paint(address, rgb) {
      await select('G1')
      await page.waitForFunction(
        ({ address: cell, rgb: expected }) => {
          const rect = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(cell).getCellRect()
          const canvas = [...document.querySelectorAll('canvas')].toSorted((a, b) => b.clientHeight - a.clientHeight)[0]
          const ratio = canvas.width / canvas.clientWidth
          const data = canvas
            .getContext('2d')
            .getImageData(Math.floor((rect.x + rect.width - 6) * ratio), Math.floor((rect.y + 5) * ratio), 1, 1).data
          // Native cells without a fill leave the white workbench canvas transparent.
          return expected.every((value, index) => Math.round((data[index] * data[3]) / 255 + 255 - data[3]) === value)
        },
        { address, rgb },
        { timeout: 10000 },
      )
    }
    async function edit(address, value) {
      await select(address)
      await page.keyboard.type(String(value))
      await page.keyboard.press('Enter')
    }
    const white = [255, 255, 255]
    try {
      await page.goto('http://127.0.0.1:4454/')
      await page.waitForFunction(
        () => window.univerAPI?.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      await gate('initial-rules-English-no-fake-fills', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        const snapshot = await save()
        for (const sheet of Object.values(snapshot.sheets))
          for (let row = 4; row < 10; row++)
            for (const cell of Object.values(sheet.cellData[row])) assert.equal(cell.s?.bg, undefined)
        assert.deepEqual(
          await page.evaluate(() =>
            ['numbers', 'text', 'duplicates', 'formula'].map(
              (id) => window.univerAPI.getActiveWorkbook().getSheetBySheetId(id).getConditionalFormattingRules().length,
            ),
          ),
          [1, 1, 1, 1],
        )
        await paint('B5', [253, 227, 182])
        await paint('B6', white)
        await paint('B8', white)
        await shot('initial')
      })
      const history = { before: await save() }
      await gate('native-numeric-edit-paint', async () => {
        await edit('B6', 11)
        await paint('B6', [253, 227, 182])
        history.after = await save()
        assert.equal(history.after.sheets.numbers.cellData[5][1].v, 11)
        await shot('numeric-edited')
      })
      await gate('native-Undo-value-and-paint', async () => {
        await page.keyboard.press('Control+z')
        history.undo = await save()
        assert.equal(history.undo.sheets.numbers.cellData[5][1].v, 4)
        await paint('B6', white)
        await shot('numeric-undone')
      })
      await gate('native-Undo-strict-full-snapshot', async () => {
        assert.deepEqual(history.undo, history.before)
      })
      await gate('native-Redo-strict-full-snapshot-and-paint', async () => {
        await page.keyboard.press('Control+y')
        history.redo = await save()
        assert.deepEqual(history.redo, history.after)
        await paint('B6', [253, 227, 182])
        await shot('numeric-redone')
      })
      await fs.writeFile(path.join(output, `${lang}-numeric-history.json`), JSON.stringify(history, null, 2))
      await gate('native-text-edit-paint', async () => {
        await page.getByText('Text contains', { exact: true }).first().click()
        await paint('B5', [216, 238, 245])
        await edit('B6', 'Check label')
        await paint('B6', [216, 238, 245])
        await edit('B6', 'Ready to label')
        await paint('B6', white)
        await shot('text')
      })
      await gate('native-duplicate-pair-recovery', async () => {
        await page.getByText('Duplicate labels', { exact: true }).first().click()
        await paint('B5', [245, 220, 230])
        await edit('B7', 'SEED-99')
        await paint('B5', white)
        await paint('B7', white)
        await paint('B6', [245, 220, 230])
        await shot('duplicates')
      })
      await gate('native-relative-formula-row-paint', async () => {
        await page.getByText('Relative formula', { exact: true }).first().click()
        await paint('A5', [205, 237, 227])
        await paint('C5', [205, 237, 227])
        await paint('A7', white)
        await edit('B6', 1)
        await paint('A6', [205, 237, 227])
        await paint('C6', [205, 237, 227])
        await shot('formula')
      })
      for (const [index, recipe] of recipes.entries())
        await gate(`literal-${index + 1}`, async () => {
          await page.evaluate(async (code) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            await new AsyncFunction(code)()
          }, recipe)
          await page
            .getByText(['Numeric threshold', 'Text contains', 'Duplicate labels', 'Relative formula'][index], {
              exact: true,
            })
            .first()
            .click()
          await paint(
            ['B8', 'B6', 'B5', 'A7'][index],
            [[253, 227, 182], [216, 238, 245], white, [205, 237, 227]][index],
          )
          await shot(`recipe-${index + 1}`)
        })
      await gate('same-owner-theme-full-save-reload', async () => {
        const before = await save()
        await page.evaluate(() => {
          window.cfOwner = window.univerAPI.getActiveWorkbook().getWorkbook()
          window.univerAPI.toggleDarkMode(true)
        })
        await shot('dark')
        await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
        assert.equal(
          await page.evaluate(() => window.cfOwner === window.univerAPI.getActiveWorkbook().getWorkbook()),
          true,
        )
        assert.deepEqual(await save(), before)
        await page.evaluate((data) => {
          window.univerAPI.disposeUnit(data.id)
          window.univerAPI.createWorkbook(data)
        }, before)
        assert.deepEqual(await save(), before)
      })
      await gate('native-rule-UI', async () => {
        await page.getByText('Numeric threshold', { exact: true }).first().click()
        await page.getByRole('tab', { name: 'Data', exact: true }).click()
        await shot('start-toolbar')
        await page.getByText('Conditional Formatting', { exact: true }).first().click()
        await shot('rule-menu')
        await page.getByText('Manage Conditional Formatting', { exact: true }).click()
        await page.getByText('Greater than or equal to 8', { exact: true }).click()
        const threshold = page.locator('input').filter({ visible: true }).nth(1)
        assert.equal(await threshold.inputValue(), '8')
        await threshold.fill('15')
        await shot('rule-editor')
        await page.getByText('Submit', { exact: true }).click()
        await paint('B5', white)
        await paint('B7', [253, 227, 182])
        await shot('rule-edited')
      })
      await gate('no-runtime-errors', async () => assert.deepEqual(result.errors, []))
    } catch (error) {
      result.fatal = error.stack || String(error)
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((gateResult) => gateResult.passed)
  }
  report.passed = report.hosts.every((host) => host.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.ok(report.passed, `See ${output}/report.json`)
