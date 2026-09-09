/* eslint-disable no-await-in-loop -- Native chart paint and source edits must be observed sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://127.0.0.1:4336/en-US/playground/sheets/charts'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheet-charts-native')
await fs.mkdir(directory, { recursive: true })
const report = { revision: 'native-gallery-v2', passed: false, checks: [], errors: [], networkWrites: [], images: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()))
    report.networkWrites.push({ url: request.url(), nextAction: !!request.headers()['next-action'] })
})
const root = page.locator('.sheet-charts-demo')
const state = () =>
  page.evaluate(() => {
    const book = window.univerAPI.getActiveWorkbook()
    return {
      id: book.getId(),
      active: book.getActiveSheet().getSheetId(),
      sheets: book.getSheets().map((sheet) => ({
        id: sheet.getSheetId(),
        values: sheet.getRange('A3:D11').getRawValues(),
        charts: sheet.getCharts().map((chart) => ({ id: chart.getId(), type: chart.getType(), info: chart.getInfo() })),
      })),
    }
  })
async function image(name, previous) {
  let png
  for (let retry = 0; retry < 30; retry++) {
    png = await page.evaluate(() =>
      window.univerAPI.getActiveWorkbook().getActiveSheet().getCharts()[0].exportImage({ format: 'png' }),
    )
    if (png?.startsWith('data:image/png') && png !== previous) break
    await page.waitForTimeout(150)
  }
  assert.ok(png?.startsWith('data:image/png'))
  if (previous) assert.notEqual(png, previous, 'Native PNG must change after linked cell edits')
  const bytes = Buffer.from(png.split(',')[1], 'base64')
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.ok(bytes.length > 3000)
  assert.ok(bytes.readUInt32BE(16) >= 590 && bytes.readUInt32BE(20) >= 330)
  await fs.writeFile(path.join(directory, name + '.png'), bytes)
  report.images.push({ name, bytes: bytes.length })
  return png
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  const started = Date.now()
  await page.locator('.sheet-charts-demo[data-ready="true"]').waitFor({ timeout: 180000 })
  report.initializationMs = Date.now() - started
  assert.equal(await root.locator('fieldset, pre, .chart-controls').count(), 0)
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  const original = await state()
  assert.equal(original.sheets.length, 6)
  report.unavailableVariants = original.sheets.filter((sheet) => sheet.charts.length === 0).map((sheet) => sheet.id)
  const expectedTypes = ['column', 'line', 'bar', 'area', 'column', 'column']
  original.sheets.forEach((sheet, index) => {
    if (sheet.charts.length)
      assert.deepEqual(
        sheet.charts.map((chart) => chart.type),
        [expectedTypes[index]],
      )
  })
  assert.deepEqual(
    original.sheets[0].values.slice(1, 7).map((row) => row[1]),
    [142, 128, 37.5, -18, 0, undefined],
  )
  const zh = new URL(url).pathname.startsWith('/zh')
  const tabs = [
    ['column', 'Column', '柱形'],
    ['line', 'Line', '折线'],
    ['bar', 'Bar', '条形'],
    ['area', 'Area', '面积'],
    ['theme', 'Warm palette', '暖色主题'],
    ['multilevel', 'Station and quarter', '站点与季度'],
  ]
  for (const [id, en, cn] of tabs) {
    await root.getByText(zh ? cn : en, { exact: true }).click()
    await page.waitForFunction(
      (expected) => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === expected,
      id,
    )
    await page.waitForTimeout(300)
    if (!report.unavailableVariants.includes(id)) await image(id)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: path.join(directory, id + '-native-ui.png') })
  }
  report.checks.push(
    'Six native worksheet tabs; available variants have expected types and native PNG exports; unavailable variants remain failures',
  )
  await root.getByText(zh ? '柱形' : 'Column', { exact: true }).click()
  const before = await image('column-before-edit')
  const nameBox = root.locator('input.univer-size-full')
  await nameBox.fill('B4')
  await nameBox.press('Enter')
  await page.keyboard.type('210')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B4').getValue() === 210,
  )
  await image('column-after-native-edit', before)
  const edited = await state()
  assert.equal(edited.sheets[1].values[1][1], 142, 'Another chart worksheet remains independent')
  report.checks.push('Native grid edit changes actual source and native chart PNG without mutating other worksheets')

  // Retain the known SDK contract failure independently of the removed host buttons.
  await page.evaluate(async () => {
    const api = window.univerAPI,
      sheet = api.getActiveWorkbook().getActiveSheet(),
      chart = sheet.getCharts()[0]
    await chart.update(
      sheet
        .newChart(api.Enum.ChartTypeString.Line)
        .setSource({
          sheetName: sheet.getSheetName(),
          range: 'A3:D9',
          orientation: api.Enum.ChartSourceOrientation.Columns,
        })
        .setPosition({ row: 0, column: 5 })
        .setSize(600, 340)
        .setCategoryField(0)
        .setValueFields([1, 2, 3])
        .build(),
    )
  })
  report.fullUpdateUndo = []
  for (let step = 0; step < 3; step++) {
    await page.evaluate(() => window.univerAPI.undo())
    const type = (await state()).sheets[0].charts[0].type
    report.fullUpdateUndo.push(type)
    if (process.argv.includes('--atomic-history') && step === 0)
      assert.equal(type, 'column', 'FChart.update promises one history item: one Undo must restore the prior type')
  }
  assert.deepEqual(
    report.fullUpdateUndo,
    ['line', 'line', 'column'],
    'Track beta.2 three-step history defect; update this boundary only when SDK behavior changes',
  )
  report.checks.push(
    'Recorded known non-atomic full-update regression; --atomic-history fails its unmet one-step contract',
  )
  assert.deepEqual(report.errors, [])
  assert.ok(
    report.networkWrites.every((r) => r.nextAction),
    'No demo remote writes',
  )
  assert.deepEqual(
    report.unavailableVariants,
    [],
    'Every planned chart variant must be created; license-rejected variants are not accepted',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  report.state = await state().catch(() => null)
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
assert.equal(report.passed, true)
