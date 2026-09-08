/* eslint-disable no-await-in-loop -- Preserve independent strict native gates on both host languages. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const manifestPath = process.argv[2]
const entry = JSON.parse(await fs.readFile(manifestPath, 'utf8')).find(
  ({ slug }) => slug === 'sheets/date-number-validation',
)
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content, name)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 4)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/date-number-validation-native')
const port = Number(process.env.SHOWCASE_EXPORT_PORT || 4452)
await fs.mkdir(output, { recursive: true })
const vite = entry.links.find(({ name }) => name === 'vite')
assert.equal(JSON.parse(await fs.readFile(path.join(vite.target, 'package.json'), 'utf8')).version, vite.version)
const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port, strictPort: true },
})
const browser = await chromium.launch()
const report = { manifestPath, passed: false, sourceFiles: Object.keys(source.files).length, hosts: [] }
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
    result.timezone = lang === 'en-US' ? 'UTC' : 'Asia/Shanghai'
    const page = await browser.newPage({
      viewport: { width: 1550, height: 950 },
      locale: lang,
      timezoneId: result.timezone,
    })
    page.setDefaultTimeout(10000)
    page.on('pageerror', (error) => result.errors.push(error.stack || error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.networkWrites.push(request.url())
    })
    await page.addInitScript(() => {
      window.painted = []
      const fill = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        window.painted.push(String(text))
        return fill.call(this, text, ...args)
      }
    })
    await page.route(`http://127.0.0.1:${port}/`, async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    const save = () => page.evaluate(() => window.univerAPI.getWorkbook('validation-boundaries').save())
    const values = (address) =>
      page.evaluate((a) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getRawValues(), address)
    const statuses = (address) =>
      page.evaluate(
        (a) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getValidatorStatus(),
        address,
      )
    const settle = () =>
      page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const shot = async (name) => {
      await page.locator('[data-u-comp^="workbench-skeleton-"]').waitFor({ state: 'detached' })
      await settle()
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
    }
    async function gate(name, action) {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
        await shot(name + '-failure')
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function type(address, text, expected, status) {
      const box = page.locator('input.univer-size-full')
      await box.fill(address)
      await box.press('Enter')
      if (text === null) await page.keyboard.press('Delete')
      else {
        await page.keyboard.type(text)
        await page.keyboard.press('Enter')
      }
      await page.waitForFunction(
        ({ a, v }) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getRawValue() === v,
        { a: address, v: expected },
      )
      assert.deepEqual(await statuses(address), [[status]])
    }
    async function tab(id) {
      await page.evaluate(() => {
        window.painted = []
      })
      await page
        .getByText(id === 'numbers' ? 'Numbers' : 'Dates', { exact: true })
        .first()
        .click()
      await page.waitForFunction(
        (sheetId) => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === sheetId,
        id,
      )
      await settle()
    }
    async function marker(address) {
      await page.waitForFunction((a) => {
        const rect = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getCellRect()
        const canvas = document.querySelector('canvas[id^="univer-sheet-main-canvas"]')
        const scale = canvas.width / canvas.clientWidth
        const data = canvas
          .getContext('2d')
          .getImageData(
            Math.floor((rect.x + rect.width - 8) * scale),
            Math.floor(rect.y * scale),
            Math.ceil(8 * scale),
            Math.ceil(8 * scale),
          ).data
        for (let i = 0; i < data.length; i += 4)
          if (data[i] === 254 && data[i + 1] === 75 && data[i + 2] === 75 && data[i + 3] > 200) return true
        return false
      }, address)
    }
    async function errorCells(id, expected) {
      const errors = await page.evaluate(() =>
        window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B4:D9').getDataValidationErrorAsync(),
      )
      result[id + 'InitialErrors'] = errors
      assert.deepEqual(
        errors.map(({ row, column }) => String.fromCharCode(65 + column) + (row + 1)).toSorted(),
        expected,
      )
    }
    try {
      await page.goto(`http://127.0.0.1:${port}/`)
      await page.locator('.date-number-validation-demo[data-ready="true"]').waitFor()
      await page.getByRole('tab', { name: 'Start', exact: true }).waitFor()
      await gate('English-complete-packs-and-official-CSS', async () => {
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
        assert.doesNotMatch(await page.locator('body').innerText(), /[\u3400-\u9fff]|sheets-data-validation-ui\./)
      })
      result.initial = await save()
      await gate('initial-numeric-values-statuses-and-native-red-marker', async () => {
        assert.deepEqual(await values('B4:D9'), [
          [1, 0, 0],
          [12, 1, 1],
          [0, -0.1, -1],
          [13, 1.1, 12],
          [2.5, 0.25, 0.5],
          [undefined, undefined, undefined],
        ])
        assert.deepEqual(await statuses('B4:D9'), [
          ['valid', 'valid', 'invalid', 'invalid', 'invalid', 'valid'],
          ['valid', 'valid', 'invalid', 'invalid', 'valid', 'valid'],
          ['invalid', 'valid', 'invalid', 'valid', 'valid', 'valid'],
        ])
        await errorCells('numbers', ['B6', 'B7', 'B8', 'C6', 'C7', 'D4', 'D6'])
        await marker('B6')
        await shot('numbers-initial')
      })
      await tab('dates')
      await gate('initial-date-values-statuses-native-render-and-marker', async () => {
        assert.deepEqual(
          await values('B4:D9'),
          [46631, 46660, 46630, 46661, 46645, undefined].map((value) => [value, value, value]),
        )
        assert.deepEqual(await statuses('B4:D9'), [
          ['valid', 'valid', 'invalid', 'invalid', 'valid', 'valid'],
          ['invalid', 'invalid', 'valid', 'invalid', 'invalid', 'valid'],
          ['valid', 'valid', 'invalid', 'valid', 'valid', 'valid'],
        ])
        await errorCells('dates', ['B6', 'B7', 'C4', 'C5', 'C7', 'C8', 'D6'])
        await page.waitForFunction(() =>
          ['2027-09-01', '2027-09-30', '2027-08-31', '2027-10-01', '2027-09-15'].every((text) =>
            window.painted.includes(text),
          ),
        )
        await marker('C4')
        await shot('dates-initial')
      })
      await gate('native-date-inclusive-exclusive-boundaries-and-blank', async () => {
        for (const [text, serial, status] of [
          ['2027-08-31', 46630, 'invalid'],
          ['2027-09-01', 46631, 'valid'],
          ['2027-09-30', 46660, 'valid'],
          ['2027-10-01', 46661, 'invalid'],
        ])
          await type('B4', text, serial, status)
        await shot('date-outside-window')
        await type('B4', null, undefined, 'valid')
        await shot('date-allowed-blank')
        await type('B4', '2027-09-01', 46631, 'valid')
        await type('C4', '2027-08-31', 46630, 'valid')
        await type('C4', '2027-09-01', 46631, 'invalid')
        await type('C4', '2027-08-31', 46630, 'valid')
        await type('D4', '2027-08-31', 46630, 'invalid')
        await type('D4', '2027-09-01', 46631, 'valid')
        await shot('dates-recovered')
        await type('C4', '2027-09-01', 46631, 'invalid')
      })
      await tab('numbers')
      await gate('native-integer-boundaries-fraction-and-blank', async () => {
        for (const [text, status] of [
          ['0', 'invalid'],
          ['1', 'valid'],
          ['12', 'valid'],
          ['13', 'invalid'],
          ['1.5', 'invalid'],
          ['6', 'valid'],
        ])
          await type('B4', text, Number(text), status)
        await type('B4', null, undefined, 'valid')
        await shot('integer-allowed-blank')
        await type('B4', '1', 1, 'valid')
      })
      await gate('native-decimal-and-positive-boundaries', async () => {
        for (const [text, status] of [
          ['-0.1', 'invalid'],
          ['0', 'valid'],
          ['1', 'valid'],
          ['1.1', 'invalid'],
          ['0.5', 'valid'],
        ])
          await type('C4', text, Number(text), status)
        for (const [text, status] of [
          ['-1', 'invalid'],
          ['0', 'invalid'],
          ['0.1', 'valid'],
        ])
          await type('D4', text, Number(text), status)
        await shot('numbers-recovered')
      })
      await gate('same-owner-full-model-through-themes', async () => {
        const before = await save()
        await page.evaluate(() => {
          window.validationOwner = window.univerAPI.getWorkbook('validation-boundaries').getWorkbook()
        })
        for (const dark of [true, false]) {
          await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
          await settle()
          assert.equal(
            await page.evaluate(
              () => window.validationOwner === window.univerAPI.getWorkbook('validation-boundaries').getWorkbook(),
            ),
            true,
          )
          assert.deepEqual(await save(), before)
          await shot(dark ? 'dark' : 'light-restored')
        }
      })
      await gate('saved-values-and-rules-reload-exact', async () => {
        const snapshot = await save()
        await page.evaluate((data) => {
          window.univerAPI.disposeUnit(data.id)
          window.univerAPI.createWorkbook(data)
        }, snapshot)
        await settle()
        assert.deepEqual(await save(), snapshot)
      })
      for (const [index, recipe] of recipes.entries())
        await gate(`literal-recipe-${index + 1}`, async () => {
          const logs = await page.evaluate(async (code) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            const captured = []
            await new AsyncFunction('univerAPI', 'console', code)(window.univerAPI, {
              log: (...args) => captured.push(args),
            })
            return captured
          }, recipe)
          result['recipe' + (index + 1)] = logs
          if (index === 0) assert.deepEqual(logs, [[[['invalid']]], [[['valid']]]])
          if (index === 1) assert.deepEqual(logs, [[[['valid'], ['invalid']]], [[['valid']]]])
          if (index === 2)
            assert.deepEqual(logs, [[[['valid'], ['invalid'], ['valid']]], [[['invalid'], ['valid'], ['invalid']]]])
          if (index === 3) assert.deepEqual(logs[0], [[['valid'], ['valid'], ['valid']]])
        })
      await gate('native-existing-validation-panel', async () => {
        await tab('numbers')
        const box = page.locator('input.univer-size-full')
        await box.fill('B4')
        await box.press('Enter')
        await page.getByRole('tab', { name: 'Data', exact: true }).click()
        await page.getByText('Data validation', { exact: true }).first().click()
        await page.getByText('Data validation management', { exact: true }).click()
        await page.getByText('B4:B9', { exact: true }).click()
        const body = await page.locator('body').innerText()
        await fs.writeFile(path.join(output, `${lang}-validation-panel.txt`), body)
        assert.doesNotMatch(body, /[\u3400-\u9fff]|sheets-data-validation-ui\./)
        await shot('validation-panel')
        result.validationPanelInputs = await page
          .locator('input')
          .evaluateAll((inputs) => inputs.map((input) => ({ value: input.value, placeholder: input.placeholder })))
        assert.ok(result.validationPanelInputs.some(({ value }) => value === '1'))
        assert.ok(result.validationPanelInputs.some(({ value }) => value === '12'))
      })
      await gate('no-errors-or-network-writes', async () => {
        assert.deepEqual(result.errors, [])
        assert.deepEqual(result.networkWrites, [])
      })
    } catch (error) {
      result.fatal = error.stack || String(error)
      await shot('fatal').catch(() => {})
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((item) => item.passed)
  }
  report.passed = report.hosts.every((host) => host.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.ok(report.passed, `Strict native failures remain; see ${output}/report.json`)
