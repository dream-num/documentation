/* eslint-disable no-await-in-loop -- Independent native copy/paste comparisons on both host languages. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const entry = JSON.parse(await fs.readFile(process.argv[2], 'utf8')).find(
  ({ slug }) => slug === 'sheets/clipboard-and-paste-special',
)
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1])
assert.equal(recipes.length, 4)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/clipboard-paste-special-native')
await fs.mkdir(output, { recursive: true })
const { preview } = await import(
  pathToFileURL(path.join(entry.links.find(({ name }) => name === 'vite').target, 'dist/node/index.js'))
)
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4450, strictPort: true },
})
const browser = await chromium.launch()
const report = { passed: false, sourceFiles: Object.keys(source.files).length, hosts: [] }
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, gates: {}, errors: [] }
    report.hosts.push(result)
    const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } })
    page.setDefaultTimeout(10000)
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    page.on('pageerror', (e) => result.errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') result.errors.push(m.text())
    })
    await page.route('http://127.0.0.1:4450/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    const values = () =>
      page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('G5:I8').getValues())
    const backgrounds = () =>
      page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('G5:I8').getBackgrounds())
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
            .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => {})),
        )
      })
    }
    async function shot(name) {
      await settle()
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
      await fs.writeFile(path.join(output, `${lang}-${name}.txt`), await page.locator('body').innerText())
      await fs.writeFile(path.join(output, `${lang}-${name}.html`), await page.locator('body').innerHTML())
    }
    async function gate(name, fn) {
      try {
        await fn()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
        await shot(`failure-${name}`)
        await page.keyboard.press('Escape')
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function fresh(tab = 'Values and formulas') {
      await page.goto('http://127.0.0.1:4450/')
      await page.waitForSelector('.clipboard-gallery[data-ready="true"]')
      await page.getByText(tab, { exact: true }).first().click()
      await page.waitForFunction(
        () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D5').getValue() > 0,
      )
      await settle()
    }
    async function copy(address) {
      await select(address)
      await page.keyboard.press('Control+c')
      await page.waitForFunction(async () => !!(await navigator.clipboard.readText()))
    }
    async function paste(mode, target = 'G5') {
      await select(target)
      if (!mode) {
        await page.keyboard.press('Control+v')
        return
      }
      const point = await page.evaluate((address) => {
        const r = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(address).getCellRect()
        const c = [...document.querySelectorAll('canvas')]
          .toSorted((a, b) => b.clientHeight - a.clientHeight)[0]
          .getBoundingClientRect()
        return { x: r.x + c.x + 20, y: r.y + c.y + 20 }
      }, target)
      await page.mouse.click(point.x, point.y, { button: 'right' })
      await page.getByText('Paste Special', { exact: true }).last().hover()
      await shot(`menu-${mode.replaceAll(' ', '-')}`)
      await page.getByText(mode, { exact: true }).last().click()
      await settle()
    }
    try {
      await fresh()
      await gate('English-initial-source-formulas', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        assert.equal(
          await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D5').getValue()),
          48,
        )
        await shot('initial')
      })
      const history = {}
      await gate('native-ordinary-paste', async () => {
        history.before = await save()
        await copy('B5:D8')
        await paste()
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I5').getValue() === 48,
        )
        assert.deepEqual((await values())[0], [6, 8, 48])
        assert.equal(
          await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I5').getFormula()),
          '=G5*H5',
        )
        assert.equal((await backgrounds())[0][0], '#ECFEFF')
        history.after = await save()
        await shot('ordinary')
      })
      await gate('native-Undo-strict', async () => {
        assert.ok(history.after)
        await page.keyboard.press('Escape')
        await page.keyboard.press('Control+z')
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I5').getValue() === 900,
        )
        history.undo = await save()
        assert.deepEqual(history.undo, history.before)
      })
      await gate('native-Redo-strict', async () => {
        assert.ok(history.after)
        await page.keyboard.press('Control+y')
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I5').getValue() === 48,
        )
        history.redo = await save()
        assert.deepEqual(history.redo, history.after)
      })
      await fs.writeFile(path.join(output, `${lang}-history.json`), JSON.stringify(history, null, 2))
      await gate('native-values-only', async () => {
        await fresh()
        const bg = await backgrounds()
        await copy('B5:D8')
        await paste('Paste Value')
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I5').getValue() === 48,
        )
        assert.deepEqual(await backgrounds(), bg)
        assert.equal(
          await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I5').getFormula()),
          '',
        )
        await shot('values-only')
      })
      await gate('native-formulas-only', async () => {
        await fresh()
        await copy('D5:D8')
        await paste('Paste Formula', 'I5')
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I5').getValue() === 40,
        )
        assert.deepEqual((await values())[0], [2, 20, 40])
        assert.equal(
          await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I5').getFormula()),
          '=G5*H5',
        )
        await shot('formulas-only')
      })
      await gate('native-formats-only', async () => {
        await fresh('Formats and widths')
        const before = await values()
        await copy('B5:D8')
        await paste('Paste Format')
        assert.deepEqual(await values(), before)
        assert.equal((await backgrounds())[0][0], '#ECFEFF')
        await shot('formats-only')
      })
      await gate('native-column-width-only', async () => {
        await fresh('Formats and widths')
        const before = await values()
        await copy('B5:D8')
        await paste('Paste Column Width')
        const data = await save()
        assert.deepEqual(
          [6, 7, 8].map((c) => data.sheets.formats.columnData[c]?.w ?? data.sheets.formats.defaultColumnWidth),
          [90, 100, 145],
        )
        assert.deepEqual(await values(), before)
        await shot('column-width-only')
      })
      for (const [index, code] of recipes.entries())
        await gate(`literal-${index + 1}`, async () => {
          await fresh('External clipboard')
          await page.evaluate(async (literal) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            await new AsyncFunction(literal)()
          }, code)
          await settle()
          if (index === 0)
            assert.deepEqual((await values()).slice(0, 2), [
              [14, 9, 126],
              [3, 22, 66],
            ])
          if (index === 1) {
            assert.equal((await values())[0][0], 'Rush order')
            assert.equal((await backgrounds())[0][0], 'rgb(224,231,255)')
          }
          if (index === 2) {
            await page.waitForFunction(
              () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I5').getValue() === 40,
            )
            assert.equal(
              await page.evaluate(() =>
                window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I5').getFormula(),
              ),
              '=G5*H5',
            )
          }
          if (index === 3)
            assert.deepEqual(
              await page.evaluate(() =>
                window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('F5:F8').getValues(),
              ),
              [['Courier collection'], ['Studio pickup'], ['Postal dispatch'], ['Guest delivery']],
            )
          await shot(`recipe-${index + 1}`)
        })
      const snapshot = await save()
      await gate('same-owner-theme-full-save', async () => {
        await page.evaluate(() => {
          window.clipboardOwner = window.univerAPI.getActiveWorkbook().getWorkbook()
          window.univerAPI.toggleDarkMode(true)
        })
        await shot('dark')
        await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
        await settle()
        assert.equal(
          await page.evaluate(() => window.clipboardOwner === window.univerAPI.getActiveWorkbook().getWorkbook()),
          true,
        )
        assert.deepEqual(await save(), snapshot)
      })
      await gate('reload-strict', async () => {
        await page.evaluate((data) => {
          window.univerAPI.disposeUnit(data.id)
          window.univerAPI.createWorkbook(data)
        }, snapshot)
        await settle()
        assert.deepEqual(await save(), snapshot)
      })
      await gate('no-runtime-errors', async () => assert.deepEqual(result.errors, []))
    } catch (error) {
      result.fatal = error.stack || String(error)
      await shot('fatal')
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((g) => g.passed)
  }
  report.passed = report.hosts.every((h) => h.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.ok(report.passed, `See ${output}/report.json`)
