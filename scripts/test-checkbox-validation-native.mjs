/* eslint-disable no-await-in-loop -- Keep independent native checks and strict failures for both host languages. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find(({ slug }) => slug === 'sheets/checkbox-validation')
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content, name)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 3)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/checkbox-validation-native')
await fs.mkdir(output, { recursive: true })
const vite = entry.links.find(({ name }) => name === 'vite')
assert.equal(JSON.parse(await fs.readFile(path.join(vite.target, 'package.json'), 'utf8')).version, vite.version)
const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4454, strictPort: true },
})
const browser = await chromium.launch()
const report = { passed: false, sourceFiles: Object.keys(source.files).length, hosts: [] }
function compareLeaves(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') compareLeaves(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
  }
}
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, errors: [], networkWrites: [], gates: {} }
    report.hosts.push(result)
    const page = await browser.newPage({ viewport: { width: 1550, height: 950 } })
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    page.setDefaultTimeout(12000)
    page.on('pageerror', (error) => result.errors.push(error.stack || error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.networkWrites.push(request.url())
    })
    await page.route('http://127.0.0.1:4454/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    const calc = () => page.evaluate(() => window.univerAPI.getFormula().onCalculationResultApplied(10000))
    const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    const values = (address) =>
      page.evaluate((a) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getValues(), address)
    const shot = async (name) => {
      await page.locator('[data-u-comp^="workbench-skeleton-"]').waitFor({ state: 'detached' })
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
    }
    async function gate(name, action) {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function toggle(address, expected) {
      const rect = await page.evaluate((a) => {
        const { x, y, width, height } = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getCellRect()
        const canvas = [...document.querySelectorAll('canvas')]
          .toSorted((left, right) => right.clientHeight - left.clientHeight)[0]
          .getBoundingClientRect()
        return { x: x + canvas.x, y: y + canvas.y, width, height }
      }, address)
      assert.ok(rect.width > 10 && rect.height > 10)
      await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2)
      await page.waitForFunction(
        ({ a, v }) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getValue() === v,
        { a: address, v: expected },
      )
      await calc()
    }
    try {
      await page.goto('http://127.0.0.1:4454/')
      await page.locator('.checkbox-validation-demo[data-ready="true"]').waitFor()
      await page.getByRole('tab', { name: 'Start', exact: true }).waitFor()
      await calc()
      await gate('English-full-packs-official-CSS-initial-values', async () => {
        assert.equal(await page.evaluate(() => document.documentElement.lang), lang)
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        const locales = await page.evaluate(() => window.univerAPI.getLocales())
        compareLeaves(locales, (await import('@univerjs/preset-sheets-core/locales/en-US')).default)
        compareLeaves(locales, (await import('@univerjs/preset-sheets-data-validation/locales/en-US')).default)
        assert.equal(
          await page
            .locator('[data-u-comp="workbench-layout"]')
            .evaluate((node) => getComputedStyle(node).backgroundColor),
          'rgb(255, 255, 255)',
        )
        assert.deepEqual(await values('B2:C3'), [
          [1, 1],
          [0, 0],
        ])
        await shot('numeric-initial')
      })
      const history = { before: await save() }
      await gate('native-numeric-toggle', async () => {
        await toggle('B2', 0)
        assert.deepEqual(await values('B2:C2'), [[0, 0]])
        await shot('numeric-toggled')
      })
      history.after = await save()
      await gate('native-Undo-full-model', async () => {
        await page.keyboard.press('Control+z')
        await calc()
        history.undo = await save()
        assert.deepEqual(await values('B2:C2'), [[1, 1]])
        assert.deepEqual(history.undo, history.before)
      })
      await gate('native-Redo-full-model', async () => {
        await page.keyboard.press('Control+y')
        await calc()
        assert.deepEqual(await save(), history.after)
      })
      await gate('native-second-numeric-toggle', async () => {
        await toggle('B3', 1)
        assert.deepEqual(await values('B3:C3'), [[1, 1]])
      })
      await gate('native-five-distinct-task-rows', async () => {
        await toggle('B4', 0)
        await toggle('B5', 1)
        await toggle('B6', 1)
        assert.deepEqual(await values('B2:C6'), [
          [0, 0],
          [1, 1],
          [0, 0],
          [1, 1],
          [1, 1],
        ])
        assert.deepEqual(await values('B10'), [[4]])
        await shot('five-rows-toggled')
      })
      await page.getByText('Packed and Open', { exact: true }).first().click()
      await page.waitForFunction(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === 'custom')
      await calc()
      await gate('native-custom-two-way-toggle', async () => {
        assert.deepEqual(await values('B2:C3'), [
          ['Packed', 'Packed'],
          ['Open', 'Open'],
        ])
        await shot('custom-initial')
        await toggle('B2', 'Open')
        await toggle('B3', 'Packed')
        assert.deepEqual(await values('B2:C3'), [
          ['Open', 'Open'],
          ['Packed', 'Packed'],
        ])
        await shot('custom-toggled')
      })
      await gate('native-invalid-text-remains-visible', async () => {
        const box = page.locator('input.univer-size-full')
        await box.fill('B7')
        await box.press('Enter')
        await page.keyboard.type('Review')
        await page.keyboard.press('Enter')
        await calc()
        assert.deepEqual(await values('B7:C7'), [['Review', 'Review']])
        assert.deepEqual(
          await page.evaluate(() =>
            window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B7').getValidatorStatus(),
          ),
          [['invalid']],
        )
        await shot('invalid-text')
      })
      await gate('native-Delete-blank-and-checkbox-recovery', async () => {
        const box = page.locator('input.univer-size-full')
        await box.fill('B7')
        await box.press('Enter')
        await page.keyboard.press('Delete')
        await calc()
        assert.equal((await values('B7'))[0][0], null)
        assert.deepEqual(
          await page.evaluate(() =>
            window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B7').getValidatorStatus(),
          ),
          [['valid']],
        )
        await shot('allowed-blank')
        await toggle('B7', 'Packed')
        assert.deepEqual(await values('B7:C7'), [['Packed', 'Packed']])
        await shot('blank-recovered')
      })
      await gate('native-invalid-clipboard-paste-and-recovery', async () => {
        const box = page.locator('input.univer-size-full')
        await box.fill('B7')
        await box.press('Enter')
        await page.evaluate(() => navigator.clipboard.writeText('Needs review'))
        await page.keyboard.press('Control+v')
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B7').getValue() === 'Needs review',
        )
        await calc()
        assert.deepEqual(await values('B7:C7'), [['Needs review', 'Needs review']])
        assert.deepEqual(
          await page.evaluate(() =>
            window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B7').getValidatorStatus(),
          ),
          [['invalid']],
        )
        await shot('invalid-paste')
        await page.keyboard.press('Delete')
        await calc()
        await toggle('B7', 'Packed')
        assert.deepEqual(
          await page.evaluate(() =>
            window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B7').getValidatorStatus(),
          ),
          [['valid']],
        )
        await shot('paste-recovered')
      })
      await gate('same-owner-and-full-model-through-themes', async () => {
        const before = await save()
        await page.evaluate(() => {
          window.checkboxOwner = window.univerAPI.getActiveWorkbook().getWorkbook()
          window.univerAPI.toggleDarkMode(true)
        })
        await calc()
        await shot('dark')
        await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
        await calc()
        assert.equal(
          await page.evaluate(() => window.checkboxOwner === window.univerAPI.getActiveWorkbook().getWorkbook()),
          true,
        )
        assert.deepEqual(await save(), before)
      })
      await gate('saved-values-and-rules-reload', async () => {
        const snapshot = await save()
        await page.evaluate((data) => {
          window.univerAPI.disposeUnit(data.id)
          window.univerAPI.createWorkbook(data)
        }, snapshot)
        await calc()
        assert.deepEqual(await save(), snapshot)
      })
      for (const [index, recipe] of recipes.entries())
        await gate(`literal-recipe-${index + 1}`, async () => {
          await page.evaluate(async (code) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            await new AsyncFunction('univerAPI', code)(window.univerAPI)
          }, recipe)
          await calc()
          if (index < 2)
            assert.deepEqual(
              await page.evaluate(
                (id) => window.univerAPI.getActiveWorkbook().getSheetBySheetId(id).getRange('B2:B3').getValues(),
                index === 0 ? 'numeric' : 'custom',
              ),
              index === 0 ? [[1], [0]] : [['Open'], ['Packed']],
            )
        })
      await gate('native-custom-validation-panel', async () => {
        await page.getByText('Packed and Open', { exact: true }).first().click()
        const box = page.locator('input.univer-size-full')
        await box.fill('B2')
        await box.press('Enter')
        await page.getByRole('tab', { name: 'Data', exact: true }).click()
        await fs.writeFile(path.join(output, `${lang}-data-toolbar.txt`), await page.locator('body').innerText())
        await shot('data-toolbar')
        await page.getByText('Data validation', { exact: true }).first().click()
        await page.getByText('Data validation management', { exact: true }).click()
        await page.getByText('B2:B7', { exact: true }).click()
        await fs.writeFile(path.join(output, `${lang}-validation-panel.txt`), await page.locator('body').innerText())
        await shot('validation-panel')
        await page.getByText('Use custom values within cells', { exact: true }).waitFor()
        assert.equal(
          await page.locator('input').evaluateAll((inputs) => inputs.some((input) => input.value === 'Packed')),
          true,
        )
        assert.equal(
          await page.locator('input').evaluateAll((inputs) => inputs.some((input) => input.value === 'Open')),
          true,
        )
      })
      await gate('no-errors-or-network-writes', async () => {
        assert.deepEqual(result.errors, [])
        assert.deepEqual(result.networkWrites, [])
      })
      await fs.writeFile(path.join(output, `${lang}-history.json`), JSON.stringify(history, null, 2))
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
assert.ok(report.passed, `Strict native failures remain; see ${output}/report.json`)
