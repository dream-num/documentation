/* eslint-disable no-await-in-loop -- CSV reads and native history are checked in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const directory = process.env.CSV_EXPORT_DIRECTORY
assert.ok(
  directory,
  'Build sheets/csv-import-plugin with build-selected-showcase-exports.mjs and set CSV_EXPORT_DIRECTORY',
)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/csv-file-native-edit')
await fs.mkdir(output, { recursive: true })
const { preview } = await import(pathToFileURL(path.join(directory, 'node_modules/vite/dist/node/index.js')).href)
const server = await preview({
  root: directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4426, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
page.setDefaultTimeout(15000)
const report = { passed: false, errors: [], checks: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
await page.addInitScript(() => {
  const original = File.prototype.arrayBuffer
  File.prototype.arrayBuffer = async function () {
    File.prototype.arrayBuffer = original
    window.csvReadHeld = true
    await new Promise((resolve) => (window.releaseCsvRead = resolve))
    return original.call(this)
  }
})
const values = () =>
  page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('A1:F15').getRawValues())
try {
  await page.goto('http://127.0.0.1:4426', { waitUntil: 'networkidle' })
  const root = page.locator('.csv-demo')
  await page.locator('.csv-demo[data-ready=true][data-busy=false]').waitFor()
  await page.waitForFunction(
    () =>
      window.univerAPI.getActiveWorkbook().getActiveSheet().getSelection()?.getActiveRangeList()[0]?.getA1Notation() ===
      'B4',
  )
  const beforeRead = await values()
  report.beforeReadSelection = await page.evaluate(() =>
    window.univerAPI
      .getActiveWorkbook()
      .getActiveSheet()
      .getSelection()
      .getActiveRangeList()
      .map((r) => r.getA1Notation()),
  )
  const chooser = page.waitForEvent('filechooser')
  await root.getByRole('button', { name: 'Open CSV', exact: true }).click()
  await (
    await chooser
  ).setFiles({ name: 'native-edit.csv', mimeType: 'text/csv', buffer: Buffer.from('Part,Count\nCable,12') })
  await page.waitForFunction(() => window.csvReadHeld === true)
  assert.equal(await root.getAttribute('data-busy'), 'true')
  assert.equal(await root.locator('[data-action=import]').isDisabled(), true)
  await page.keyboard.type('UNWANTED')
  await page.keyboard.press('Enter')
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  assert.deepEqual(await values(), beforeRead)
  report.heldSelection = await page.evaluate(() =>
    window.univerAPI
      .getActiveWorkbook()
      .getActiveSheet()
      .getSelection()
      .getActiveRangeList()
      .map((r) => r.getA1Notation()),
  )
  assert.deepEqual(report.heldSelection, report.beforeReadSelection, 'Busy file read must preserve the import target')
  report.checks.push('Actual browser file selection; held byte read leaves workbook unchanged')
  await page.evaluate(() => window.releaseCsvRead())
  await page.locator('.csv-demo[data-busy=false]').waitFor()
  report.afterReadSelection = await page.evaluate(() =>
    window.univerAPI
      .getActiveWorkbook()
      .getActiveSheet()
      .getSelection()
      .getActiveRangeList()
      .map((r) => r.getA1Notation()),
  )
  assert.deepEqual(
    report.afterReadSelection,
    report.beforeReadSelection,
    'Completed file read preserves the import target',
  )
  assert.equal(await root.locator('textarea').inputValue(), 'Part,Count\nCable,12')
  assert.deepEqual(await values(), beforeRead)
  await root.locator('[data-action=import]').click()
  assert.deepEqual(
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B4:C5').getRawValues()),
    [
      ['Part', 'Count'],
      ['Cable', '12'],
    ],
  )
  const beforeEdit = await values()
  const fullBefore = await page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
  const name = root.locator('.csv-editor input.univer-size-full').first()
  await name.click()
  await name.fill('B5')
  await name.press('Enter')
  await page.keyboard.press('F2')
  await page.waitForFunction(() => document.activeElement?.getAttribute('contenteditable') === 'true')
  report.caret = await page.evaluate(() => ({
    rangeCount: document.getSelection().rangeCount,
    active: document.activeElement.id,
  }))
  assert.ok(report.caret.rangeCount > 0, 'Native browser caret must survive file-read busy state')
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Edited cable')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B5').getValue() === 'Edited cable',
  )
  await root.screenshot({ path: path.join(output, 'edited.png') })
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B5').getValue() === 'Cable',
  )
  assert.deepEqual(await values(), beforeEdit, 'Native Undo restores every sampled value')
  const fullAfter = await page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
  report.fullSnapshotUndoExact = JSON.stringify(fullBefore) === JSON.stringify(fullAfter)
  report.historyScope =
    'Passed checks cover native input and value restoration, not exact snapshot restoration; the existing full CSV history suite remains authoritative.'
  await fs.writeFile(
    path.join(output, 'undo-snapshots.json'),
    JSON.stringify({ before: fullBefore, after: fullAfter }, null, 2),
  )
  report.checks.push('Real local CSV staged/imported; native B5 edit and native Undo restore values')
  await root.screenshot({ path: path.join(output, 'undo.png') })
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {})
  process.exitCode = 1
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
