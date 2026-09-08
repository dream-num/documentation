/* eslint-disable no-await-in-loop -- Observe native drawing updates sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:4336/en-US/playground/docs-modern/charts-in-documents'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/doc-charts-native-gallery')
await fs.mkdir(directory, { recursive: true })
const report = { revision: 'native-gallery-v2', passed: false, checks: [], errors: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const root = page.locator('.charts-demo')
const read = () =>
  page.evaluate(() => {
    const doc = window.univerAPI.getActiveDocument()
    return {
      id: doc.getId(),
      text: doc.save().body.dataStream,
      charts: doc.getCharts().map((chart) => ({ id: chart.getId(), type: chart.getType(), info: chart.getInfo() })),
      snapshot: doc.save(),
    }
  })
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  await page.locator('.charts-demo[data-ready="true"]').waitFor({ timeout: 120000 })
  assert.deepEqual(
    JSON.parse(await root.getAttribute('data-errors')),
    [],
    'Every requested variant must insert successfully',
  )
  assert.equal(await root.locator('fieldset, pre, output, .hint').count(), 0)
  assert.equal(await root.locator('button[data-action]').count(), 0)
  const zh = new URL(url).pathname.startsWith('/zh')
  await root.getByRole('tab', { name: zh ? '开始' : 'Start', exact: true }).waitFor()
  await root.getByRole('tab', { name: zh ? '插入' : 'Insert', exact: true }).click()
  assert.ok(await root.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
  await root.getByRole('tab', { name: zh ? '开始' : 'Start', exact: true }).click()
  const initial = await read()
  assert.deepEqual(
    initial.charts.map((chart) => chart.type),
    ['column', 'line', 'area', 'bar', 'columnStacked', 'pie', 'donut'],
  )
  assert.equal(new Set(initial.charts.map((chart) => chart.id)).size, 7)
  assert.equal(Object.keys(initial.snapshot.tableSource || {}).length, 0)
  assert.equal(initial.snapshot.body.columnGroups?.length || 0, 0)
  assert.equal(new Set(initial.charts.map((chart) => JSON.stringify(chart.info.dataSource.values))).size, 7)
  assert.ok(initial.charts.every((chart) => chart.info.size.width === 560 && chart.info.size.height === 280))
  await page.screenshot({ path: path.join(directory, 'gallery-top.png') })
  report.checks.push(
    'Seven distinct native chart types and datasets, Grid menu visible, no host panels or unrelated tables/columns',
  )

  // Mutate the first chart through the installed public facade, not a fake host button.
  await page.evaluate(async () => {
    const chart = window.univerAPI.getActiveDocument().getCharts()[0]
    const values = chart.getInfo().dataSource.values.map((row) => row.slice())
    values[1][1] = 84
    await chart.setDataSource(values)
  })
  await page.waitForFunction(
    () => window.univerAPI.getActiveDocument().getCharts()[0].getInfo().dataSource.values[1][1] === 84,
  )
  const edited = await read()
  assert.equal(edited.charts[0].id, initial.charts[0].id)
  assert.deepEqual(
    edited.charts.slice(1),
    initial.charts.slice(1),
    'Updating one chart must leave six independent charts unchanged',
  )
  assert.equal(edited.text, initial.text)
  report.checks.push(
    'Real setDataSource changes one chart, preserving chart identity, surrounding text and other six charts',
  )
  const canvas = root.locator('canvas').first()
  for (let step = 1; step <= 5; step++) {
    await canvas.hover({ position: { x: 400, y: 250 } })
    await page.mouse.wheel(0, 550)
    await page.waitForTimeout(250)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: path.join(directory, 'gallery-scroll-' + step + '.png') })
  }
  // Screenshot review is separate: these captures do not prove native resize-frame correctness.
  report.knownLimits = [
    'beta.2 FChart.setSize and drawing-size Undo may leave stale visible frame',
    'Native resize-frame, narrow-screen, and lifecycle acceptance remain incomplete',
  ]
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.state = await read().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
assert.equal(report.passed, true)
