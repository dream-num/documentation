import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const [entry] = JSON.parse(await fs.readFile('test-results/header-native-export/exports.json', 'utf8'))
const source = (await readShowcaseSources()).find((x) => x.slug === entry.slug)
await Promise.all(
  Object.entries(source.files).map(async ([name, text]) =>
    assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), text),
  ),
)
const { preview } = await import(pathToFileURL(entry.directory + '/node_modules/vite/dist/node/index.js'))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4418, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const output = 'test-results/header-native-interaction'
await fs.mkdir(output, { recursive: true })
const report = {
  passed: false,
  checks: [],
  errors: [],
  historyFailures: [],
  sourceFiles: Object.keys(source.files).length,
}
page.on('pageerror', (e) => report.errors.push(e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
await page.addInitScript(() => {
  window.headerPaint = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.headerPaint.length < 5000) window.headerPaint.push({ text: String(text), color: String(this.fillStyle) })
    return original.call(this, text, ...args)
  }
})
try {
  await page.goto('http://127.0.0.1:4418')
  await page.locator('.custom-header-demo[data-ready=true]').waitFor()
  const root = page.locator('.custom-header-demo')
  const read = () => page.evaluate(() => window.univerAPI.getWorkbook('lumen-equipment').save())
  await page.waitForFunction(() => window.headerPaint.some((x) => x.text === 'Deposit' && x.color === '#fde68a'))
  const original = await read()
  assert.equal(await root.locator('fieldset button').count(), 4)
  assert.equal(await root.locator('details,pre').count(), 0)
  await page.screenshot({ path: output + '/styled.png' })
  await page.getByLabel('Header appearance').selectOption('labels')
  await page.evaluate(() => {
    window.headerPaint = []
  })
  await page.getByRole('button', { name: 'Apply headers', exact: true }).click()
  await page.waitForFunction(() => window.headerPaint.some((x) => x.text === 'Deposit' && x.color !== '#fde68a'))
  assert.deepEqual(await read(), original)
  report.checks.push('Styled and label-only native paint; four meaningful controls; complete workbook unchanged')
  await page.getByRole('button', { name: 'Compact active headers', exact: true }).click()
  const compact = await read()
  assert.equal(compact.sheets.bookings.rowHeader.width, 46)
  assert.equal(compact.sheets.bookings.columnHeader.height, 24)
  assert.deepEqual(compact.sheets.returns, original.sheets.returns)
  await page.getByRole('button', { name: 'Roomy active headers', exact: true }).click()
  assert.equal((await read()).sheets.bookings.rowHeader.width, 88)
  report.checks.push('Native header dimensions toggle only active sheet')
  await page.getByLabel('Header scope').selectOption('workbook')
  await page.getByRole('button', { name: 'Apply headers', exact: true }).click()
  await page.getByRole('button', { name: 'Clear active override', exact: true }).click()
  await page.evaluate(() => {
    window.headerPaint = []
  })
  await page.getByRole('button', { name: 'Clear all headers', exact: true }).click()
  await page.waitForFunction(() => window.headerPaint.some((x) => x.text === 'A'))
  report.checks.push('Workbook/sheet setters and clears execute; native column label repaints')
  await page.screenshot({ path: output + '/native.png' })
  const recipes = [
    ...(await fs.readFile('showcase/sheets/custom-header/code/README.md', 'utf8')).matchAll(/```ts\r?\n([\s\S]*?)```/g),
  ]
  assert.equal(recipes.length, 2)
  const beforeLabels = await read()
  await page.evaluate(() => {
    window.headerPaint = []
  })
  await page.evaluate((code) => new Function('univerAPI', code)(window.univerAPI), recipes[0][1])
  await page.waitForFunction(() => window.headerPaint.some((x) => x.text === 'First slot'))
  assert.deepEqual(await read(), beforeLabels)
  await page.getByText('Returns', { exact: true }).click()
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('lumen-equipment').getActiveSheet().getSheetId() === 'returns',
  )
  await page.getByText('Bookings', { exact: true }).click()
  await page.getByLabel('Header appearance').selectOption('styled')
  await page.getByLabel('Header scope').selectOption('sheet')
  await page.getByRole('button', { name: 'Apply headers', exact: true }).click()
  await page.getByLabel('Header appearance').selectOption('labels')
  await page.getByLabel('Header scope').selectOption('workbook')
  await page.evaluate(() => {
    window.headerPaint = []
  })
  await page.getByRole('button', { name: 'Apply headers', exact: true }).click()
  await page.waitForFunction(() => window.headerPaint.some((x) => x.text === 'Deposit' && x.color === '#fde68a'))
  await page.evaluate(() => {
    window.headerPaint = []
  })
  await page.getByRole('button', { name: 'Clear active override', exact: true }).click()
  await page.waitForFunction(() => window.headerPaint.some((x) => x.text === 'Deposit' && x.color !== '#fde68a'))
  report.checks.push(
    'Literal workbook labels preserve full model; native tabs switch; styled sheet override wins over label-only workbook default until cleared',
  )
  await page.evaluate((code) => new Function('univerAPI', code)(window.univerAPI), recipes[1][1])
  assert.equal((await read()).sheets.bookings.rowHeader.width, 46)
  await page.getByRole('button', { name: 'Roomy active headers', exact: true }).click()
  const canvas = page.locator('[data-u-comp="render-canvas"]:not(#univer-doc-main-canvas):visible').first()
  await canvas.click({ position: { x: 180, y: 18 } })
  const selection = () =>
    page.evaluate(() =>
      window.univerAPI.getWorkbook('lumen-equipment').getActiveSheet().getSelection().getActiveRange().getRange(),
    )
  assert.equal((await selection()).startColumn, 0)
  assert.equal((await selection()).endRow, 29)
  await canvas.click({ position: { x: 35, y: 51 } })
  assert.equal((await selection()).startRow, 0)
  assert.equal((await selection()).endColumn, 7)
  report.checks.push('Literal native dimensions and actual custom row/column header selection')
  const beforeEdit = await read()
  await canvas.dblclick({ position: { x: 180, y: 51 } })
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText('Projector inspected')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () =>
      window.univerAPI.getWorkbook('lumen-equipment').getActiveSheet().getRange('A1').getRawValue() ===
      'Projector inspected',
  )
  const edited = await read()
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    () =>
      window.univerAPI.getWorkbook('lumen-equipment').getActiveSheet().getRange('A1').getRawValue() ===
      'Portable projector',
  )
  const undone = await read()
  try {
    assert.deepEqual(undone, beforeEdit)
  } catch (error) {
    report.historyFailures.push({ operation: 'Undo', failure: error.message })
  }
  await page.keyboard.press('Control+y')
  await page.waitForFunction(
    () =>
      window.univerAPI.getWorkbook('lumen-equipment').getActiveSheet().getRange('A1').getRawValue() ===
      'Projector inspected',
  )
  try {
    assert.deepEqual(await read(), edited)
  } catch (error) {
    report.historyFailures.push({ operation: 'Redo', failure: error.message })
  }
  await fs.writeFile(
    output + '/history.json',
    JSON.stringify({ beforeEdit, edited, undone, redone: await read() }, null, 2),
  )
  report.checks.push('Native keyboard editing and value Undo/Redo; full snapshots checked separately')
  await page.evaluate(() => {
    window.headerOwner = window.univerAPI
    window.univerAPI.toggleDarkMode(true)
  })
  assert.deepEqual(await read(), edited)
  await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
  assert.equal(await page.evaluate(() => window.univerAPI === window.headerOwner), true)
  assert.deepEqual(await read(), edited)
  report.checks.push('Theme changes retain owner and complete edited model')
  await page.screenshot({ path: output + '/edited.png' })
  assert.deepEqual(report.errors, [])
  report.passed = report.historyFailures.length === 0
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: output + '/failure.png' }).catch(() => {})
} finally {
  await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
