/* eslint-disable no-await-in-loop -- Keep each native sort and recipe result independent. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { BOOKINGS } from '../showcase/sheets/sort-values-and-columns/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find(({ slug }) => slug === 'sheets/sort-values-and-columns')
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 5)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheet-sort-native')
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
const expected = [
  ['R08', 'R05', 'R07', 'R03', 'R01', 'R02', 'R06', 'R04'],
  ['R04', 'R02', 'R06', 'R01', 'R03', 'R05', 'R07', 'R08'],
  ['R02', 'R06', 'R03', 'R05', 'R07', 'R04', 'R01', 'R08'],
  ['R06', 'R02', 'R03', 'R07', 'R05', 'R04', 'R01', 'R08'],
  ['R04', 'R02', 'R06', 'R01', 'R03', 'R05', 'R07', 'R08'],
]
function integrity(actual, sheetId) {
  for (const row of actual) {
    const original = [...BOOKINGS.find((booking) => booking[0] === row[0])]
    if (sheetId === 'blank' && row[0] === 'R07') original[2] = null
    if (sheetId === 'blank' && row[0] === 'R08') original[2] = ''
    assert.deepEqual(row, original)
  }
  assert.equal(new Set(actual.map((row) => row[0])).size, 8)
}

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
    const rows = (id) =>
      page.evaluate(
        (sheetId) => window.univerAPI.getActiveWorkbook().getSheetBySheetId(sheetId).getRange('A5:E12').getValues(),
        id,
      )
    const shot = async (name) => {
      await page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        await Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
            .map((animation) => animation.finished.catch(() => {})),
        )
        await new Promise(requestAnimationFrame)
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
        const cancel = page.getByText('Cancel', { exact: true })
        if (await cancel.isVisible()) await cancel.click()
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function select() {
      const box = page.locator('input.univer-size-full')
      await box.fill('A5:E12')
      await box.press('Enter')
    }
    async function nativeDialog() {
      await select()
      await page.getByRole('tab', { name: 'Data', exact: true }).click()
      await shot('data-toolbar')
      // The installed Grid ribbon renders this group as an icon-only dropdown.
      // Coordinates are from the captured native Data toolbar at this fixed viewport.
      await page.mouse.click(54, 100)
      await shot('sort-menu')
      await page.getByText('Custom Sort', { exact: true }).click()
      await page.getByText('Keep range sorting', { exact: true }).click()
      await page.getByText('Confirm', { exact: true }).click()
      await shot('sort-dialog')
    }
    try {
      await page.goto('http://127.0.0.1:4454/')
      await page.waitForFunction(
        () => window.univerAPI?.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      await gate('English-original-data', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        assert.deepEqual(await rows('single'), BOOKINGS)
        await shot('initial')
      })
      const history = { before: await save() }
      await gate('native-numeric-ascending', async () => {
        await nativeDialog()
        await page.getByText('Add condition', { exact: true }).waitFor()
        await page.getByText('Column "A"', { exact: true }).last().click()
        await page.getByText('Column "C"', { exact: true }).last().click()
        await page.getByText('Confirm', { exact: true }).click()
        assert.deepEqual(
          (await rows('single')).map((row) => row[0]),
          expected[0],
        )
        integrity(await rows('single'), 'single')
        await shot('native-ascending')
      })
      history.after = await save()
      await gate('native-Undo-full-snapshot', async () => {
        await select()
        await page.keyboard.press('Control+z')
        assert.deepEqual(await save(), history.before)
      })
      await gate('native-Redo-full-snapshot', async () => {
        await page.keyboard.press('Control+y')
        assert.deepEqual(await save(), history.after)
      })
      await gate('native-numeric-descending', async () => {
        await nativeDialog()
        await page.getByText('Column "A"', { exact: true }).last().click()
        await page.getByText('Column "C"', { exact: true }).last().click()
        await page.getByText('Descending', { exact: true }).last().click()
        await page.getByText('Confirm', { exact: true }).click()
        assert.deepEqual(
          (await rows('single')).map((row) => row[0]),
          expected[1],
        )
        integrity(await rows('single'), 'single')
        await shot('native-descending')
      })
      await gate('native-two-keys-and-stable-ties', async () => {
        await page.getByText('Multiple keys', { exact: true }).first().click()
        await nativeDialog()
        await page.getByText('Column "A"', { exact: true }).last().click()
        await page.getByText('Column "B"', { exact: true }).last().click()
        await page.getByText('Add condition', { exact: true }).click()
        await page.getByText('Column "A"', { exact: true }).last().click()
        await page.getByText('Column "C"', { exact: true }).last().click()
        await page.getByText('Descending', { exact: true }).last().click()
        await shot('two-keys-dialog')
        result.dialogFont = await page
          .getByText('Add condition', { exact: true })
          .evaluate((element) => getComputedStyle(element).fontFamily)
        assert.match(result.dialogFont, /Arial/)
        await page.getByText('Confirm', { exact: true }).click()
        assert.deepEqual(
          (await rows('multiple')).map((row) => row[0]),
          expected[2],
        )
        integrity(await rows('multiple'), 'multiple')
        await shot('native-two-keys')
      })
      for (const [index, recipe] of recipes.entries())
        await gate(`literal-${index + 1}-order-and-row-integrity`, async () => {
          await page.evaluate(async (code) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            await new AsyncFunction(code)()
          }, recipe)
          const sheetId = index < 2 ? 'single' : index < 4 ? 'multiple' : 'blank'
          const actual = await rows(sheetId)
          assert.deepEqual(
            actual.map((row) => row[0]),
            expected[index],
          )
          integrity(actual, sheetId)
          assert.deepEqual(
            await page.evaluate(
              (id) => window.univerAPI.getActiveWorkbook().getSheetBySheetId(id).getRange('A4:E4').getValues(),
              sheetId,
            ),
            [['Booking', 'Repair bay', 'Minutes', 'Item', 'Intake order']],
          )
          await page
            .getByText(
              sheetId === 'single' ? 'Single key' : sheetId === 'multiple' ? 'Multiple keys' : 'Blank estimates',
              { exact: true },
            )
            .first()
            .click()
          await shot(`recipe-${index + 1}`)
        })
      await gate('same-owner-theme-and-full-save-reload', async () => {
        const before = await save()
        await page.evaluate(() => {
          window.sortOwner = window.univerAPI.getActiveWorkbook().getWorkbook()
          window.univerAPI.toggleDarkMode(true)
        })
        await page.screenshot({ path: path.join(output, `${lang}-dark.png`) })
        await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
        assert.equal(
          await page.evaluate(() => window.sortOwner === window.univerAPI.getActiveWorkbook().getWorkbook()),
          true,
        )
        assert.deepEqual(await save(), before)
        await page.evaluate((data) => {
          window.univerAPI.disposeUnit(data.id)
          window.univerAPI.createWorkbook(data)
        }, before)
        assert.deepEqual(await save(), before)
      })
      await gate('no-runtime-errors', async () => assert.deepEqual(result.errors, []))
    } catch (error) {
      result.fatal = error.stack || String(error)
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((value) => value.passed)
  }
  report.passed = report.hosts.every((host) => host.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.ok(report.passed, `See ${output}/report.json`)
