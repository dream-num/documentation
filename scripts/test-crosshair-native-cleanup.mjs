/* eslint-disable no-await-in-loop -- Exercise native selections and palette in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/crosshair-native-cleanup')
await fs.mkdir(directory, { recursive: true })
const [entry] = JSON.parse(
  await fs.readFile(
    process.env.SHOWCASE_EXPORT_MANIFEST || 'test-results/crosshair-native-export/exports.json',
    'utf8',
  ),
)
assert.equal(entry.slug, 'sheets/crosshair-highlighting')
const source = (await readShowcaseSources()).find((s) => s.slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content, name)
const { preview } = await import(pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4418, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const report = { passed: false, sourceFiles: Object.keys(source.files).length, checks: [], errors: [], failures: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  await page.goto('http://127.0.0.1:4418', { waitUntil: 'load' })
  await page.locator('.crosshair-demo[data-ready=true]').waitFor()
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('oriole-rehearsals').getActiveSheet().getRange('G2').getValue() === 11,
  )
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const grid = page.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const pixel = (x, y) =>
    grid.evaluate(
      (canvas, [sampleX, sampleY]) => {
        const box = canvas.getBoundingClientRect()
        return [
          ...canvas
            .getContext('2d')
            .getImageData(
              Math.floor((sampleX * canvas.width) / box.width),
              Math.floor((sampleY * canvas.height) / box.height),
              1,
              1,
            ).data,
        ]
      },
      [x, y],
    )
  const cells = () =>
    page.evaluate(() =>
      window.univerAPI
        .getWorkbook('oriole-rehearsals')
        .getSheets()
        .map((sheet) => sheet.getRange(0, 0, 24, 8).getCellDataGrid()),
    )
  const original = await cells()
  assert.equal(
    await page.locator('.crosshair-demo > section, .crosshair-demo > details, .crosshair-demo pre').count(),
    0,
  )
  const css = await page.locator('[data-u-comp=workbench-layout]').evaluate((node) => ({
    bg: getComputedStyle(node).backgroundColor,
    white: getComputedStyle(node).getPropertyValue('--univer-gray-0').trim(),
    flex: getComputedStyle(node.querySelector('.univer-flex')).display,
  }))
  assert.deepEqual(css, { bg: 'rgb(255, 255, 255)', white: '#FFFFFF', flex: 'flex' })
  const recipes = [
    ...(await fs.readFile('showcase/sheets/crosshair-highlighting/code/README.md', 'utf8')).matchAll(
      /```ts\r?\n([\s\S]*?)```/g,
    ),
  ].map((m) => m[1])
  assert.equal(recipes.length, 6)
  const run = (index) => page.evaluate((code) => new Function(code)(), recipes[index])
  await settle()
  const band = await pixel(250, 140),
    selected = await pixel(365, 140),
    outside = await pixel(250, 175)
  await page.screenshot({ path: path.join(directory, 'baseline.png') })
  await run(3)
  await run(0)
  await settle()
  assert.notDeepEqual(await pixel(250, 140), band)
  assert.deepEqual(await pixel(365, 140), selected)
  assert.deepEqual(await pixel(250, 175), outside)
  await run(1)
  await settle()
  assert.deepEqual(await pixel(250, 140), band)
  assert.deepEqual(await cells(), original)
  assert.deepEqual(await page.evaluate(() => window.crosshairEvents), [false, true])
  report.checks.push(
    'Literal toggles change real row-band pixels, not active/outside pixels or either sheet cells; actual events delivered',
  )
  await run(2)
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('oriole-rehearsals')
        .getActiveSheet()
        .getSelection()
        .getActiveRange()
        .getA1Notation(),
    ),
    'C4:E6',
  )
  await grid.click({ position: { x: 390, y: 140 } })
  await page.keyboard.press('ArrowRight')
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('oriole-rehearsals')
        .getActiveSheet()
        .getSelection()
        .getActiveRange()
        .getA1Notation(),
    ),
    'D4',
  )
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('oriole-rehearsals').getActiveSheet().getRange('C4').activate(),
  )
  await page.getByRole('tab', { name: 'View', exact: true }).click()
  const menu = page
    .locator('[data-u-command="sheet.operation.toggle-crosshair-highlight"]:visible')
    .filter({ hasText: 'Crosshair Highlight' })
  await menu.locator('.univer-toolbar-button-selector-main').click()
  assert.equal(await page.evaluate(() => window.univerAPI.getCrosshairHighlightEnabled()), false)
  const beforeEvents = await page.evaluate(() => window.crosshairEvents.length)
  await menu.locator('.univer-toolbar-button-selector-trigger').click()
  const swatches = page.locator('[role="menu"] .univer-grid-cols-8 > div')
  await swatches.first().waitFor()
  assert.equal(await swatches.count(), 16)
  await swatches.nth(1).click()
  await page.keyboard.press('Escape')
  await settle()
  assert.equal(await page.evaluate(() => window.univerAPI.getCrosshairHighlightEnabled()), true)
  assert.notDeepEqual(await pixel(250, 140), band)
  assert.deepEqual(await cells(), original)
  const afterEvents = await page.evaluate(() => window.crosshairEvents.length)
  if (afterEvents !== beforeEvents + 1)
    report.failures.push({ gate: 'native-palette-enable-event', beforeEvents, afterEvents, expected: beforeEvents + 1 })
  report.checks.push(
    'Native cell click/arrow, toolbar toggle and sixteen-swatch palette genuinely change selection and painted bands',
  )
  await page.screenshot({ path: path.join(directory, 'native-palette.png') })
  await run(4)
  await page.evaluate(() => {
    window.crosshairOwner = window.univerAPI
    window.crosshairSaved = structuredClone(window.univerAPI.getWorkbook('oriole-rehearsals').save())
  })
  for (const dark of [true, false]) {
    await page.evaluate((enabled) => window.univerAPI.toggleDarkMode(enabled), dark)
    await settle()
    assert.equal(await page.evaluate(() => window.crosshairOwner === window.univerAPI), true)
    assert.deepEqual(await cells(), original)
  }
  await run(5)
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('oriole-rehearsals')?.getActiveSheet().getRange('G2').getValue() === 11,
  )
  assert.deepEqual(await cells(), original)
  assert.equal(await page.evaluate(() => window.univerAPI.getCrosshairHighlightEnabled()), true)
  report.checks.push(
    'All six literal recipes execute; same-owner themes and same-ID unit reload retain cells and enabled state (not full snapshot acceptance)',
  )
  assert.deepEqual(report.errors, [])
  report.passed = report.failures.length === 0
} catch (error) {
  report.failures.push({ gate: 'unexpected', message: error.stack || String(error) })
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exitCode = 1
