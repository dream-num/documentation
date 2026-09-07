/* eslint-disable no-await-in-loop -- Verify the ordered published examples and native rendered columns. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-moss-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-to-chart/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 20)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(15000)
const report = { passed: false, checks: [], gates: {}, errors: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['xhr', 'fetch'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
const root = page.locator('.moss-embed')
const tab = (name) => root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
const chartInfo = () =>
  page.evaluate(() =>
    window.univerAPI.getWorkbook('moss-demand-comparison').getSheetBySheetId('comparison').getCharts()[0].getInfo(),
  )
const cells = () =>
  page.evaluate(() =>
    window.univerAPI
      .getWorkbook('moss-demand-comparison')
      .getSheetBySheetId('comparison')
      .getRange('B7:C9')
      .getRawValues(),
  )
async function values(actual, plan) {
  const expected = actual.map((v, i) => [v, plan[i]])
  await page.waitForFunction(
    (targets) => {
      const sheet = window.univerAPI.getWorkbook('moss-demand-comparison').getSheetBySheetId('comparison')
      return (
        JSON.stringify(sheet.getRange('B7:C9').getRawValues()) === JSON.stringify(targets) &&
        sheet.getRange('B11').getRawValue() === targets.reduce((s, r) => s + r[0], 0) &&
        sheet.getRange('C11').getRawValue() === targets.reduce((s, r) => s + r[1], 0)
      )
    },
    expected,
    { timeout: 30000 },
  )
}
// Inspect exact palette-colored bars on the real host sheet canvas, not a chart data array.
const bars = () =>
  page.evaluate(() => {
    const chart = window.univerAPI
      .getWorkbook('moss-demand-comparison')
      .getSheetBySheetId('comparison')
      .getCharts()[0]
      .getInfo()
    const canvas = [...document.querySelectorAll('.moss-embed canvas[id^="univer-sheet-main-canvas"]')].find(
      (c) => !c.closest('[data-embed-sheets-sheet-tab-host]'),
    )
    if (!canvas) throw new Error('Host Sheet canvas missing')
    const x = Math.round(chart.position.x),
      y = Math.round(chart.position.y),
      width = Math.min(Math.round(chart.size.width), canvas.width - x),
      height = Math.min(Math.round(chart.size.height), canvas.height - y)
    const data = canvas.getContext('2d').getImageData(x, y, width, height).data
    return {
      position: { x, y, width, height },
      series: [
        [57, 125, 105],
        [194, 155, 83],
      ].map((color) => {
        const columns = Array.from({ length: width }, () => ({ min: height, max: 0, count: 0 }))
        // The title and legend occupy the top 20%; legend swatches share the bar palette.
        for (let row = Math.ceil(height * 0.2); row < height; row++)
          for (let col = 0; col < width; col++) {
            const i = (row * width + col) * 4
            if (data[i + 3] > 240 && color.every((v, c) => Math.abs(data[i + c] - v) < 4)) {
              const item = columns[col]
              item.min = Math.min(item.min, row)
              item.max = Math.max(item.max, row)
              item.count++
            }
          }
        const groups = []
        for (let col = 0; col < width; col++)
          if (columns[col].count > 18) {
            let end = col
            while (end + 1 < width && columns[end + 1].count > 18) end++
            const group = columns.slice(col, end + 1)
            const min = Math.min(...group.map((v) => v.min)),
              max = Math.max(...group.map((v) => v.max))
            if (end - col > 10 && max - min > 20)
              groups.push({ left: col, width: end - col + 1, top: min, bottom: max, height: max - min + 1 })
            col = end
          }
        return groups
      }),
    }
  })
async function rendered(actual, plan, name) {
  const deadline = Date.now() + 15000
  let geometry
  while (Date.now() < deadline) {
    geometry = await bars()
    const expected = [actual, plan].map((a) => a.filter((v) => v > 0))
    if (geometry.series.every((series, i) => series.length === expected[i].length)) {
      const measurements = geometry.series.flatMap((series, i) =>
        series.map((bar, j) => ({ height: bar.height, value: expected[i][j] })),
      )
      const scale = measurements.reduce((s, m) => s + m.height / m.value, 0) / measurements.length
      if (measurements.every((m) => Math.abs(m.height - m.value * scale) < 3)) {
        await page.screenshot({ path: path.join(directory, name + '.png') })
        return geometry
      }
    }
    await page.waitForTimeout(150)
  }
  throw new Error('Native bar geometry disagrees with the calculated source: ' + JSON.stringify(geometry))
}

await page.addInitScript(() => {
  window.basePoints = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    if (this.canvas.closest('[data-embed-sheets-sheet-tab-host]')) {
      const bounds = this.canvas.getBoundingClientRect()
      const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
      if (bounds.width > 300)
        window.basePoints.push({
          text: String(args[0]),
          x: bounds.x + (point.x * bounds.width) / this.canvas.width,
          y: bounds.y + (point.y * bounds.height) / this.canvas.height,
        })
    }
    return Reflect.apply(fill, this, args)
  }
})
const snapshot = () =>
  page.evaluate(() => ({
    base: window.univerAPI.getBase('moss-demand-register').save(),
    sheet: window.univerAPI.getWorkbook('moss-demand-comparison').save(),
  }))
async function derived(selected, comparison) {
  const total = selected.reduce((a, b) => a + b, 0)
  const results = await page.evaluate(() =>
    window.univerAPI
      .getWorkbook('moss-demand-comparison')
      .getSheetBySheetId('comparison')
      .getRange('D7:F9')
      .getRawValues(),
  )
  for (let i = 0; i < 3; i++) {
    assert.equal(results[i][0], selected[i] - comparison[i])
    const share = total ? selected[i] / total : '#DIV/0!'
    if (typeof share === 'number') assert.ok(Math.abs(results[i][1] - share) < 1e-9)
    else assert.equal(results[i][1], share)
    assert.ok(Math.abs(results[i][2] - (selected[i] - comparison[i]) / comparison[i]) < 1e-9)
  }
}
function includesPack(actual, expected) {
  for (const [key, value] of Object.entries(expected))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4308', { timeout: 60000 })
  await page.waitForFunction(
    () => document.querySelector('.moss-embed')?.dataset.ready || document.querySelector('.moss-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  await values([18, 12, 6], [14, 10, 6])
  report.baseline = await rendered([18, 12, 6], [14, 10, 6], 'baseline')
  const originalChart = await chartInfo()
  assert.equal(originalChart.dataSource.range.startRow, 5)
  assert.equal(originalChart.dataSource.range.endRow, 8)
  const originalCells = (await snapshot()).sheet.sheets.comparison.cellData
  const scenarios = [
    [
      [22, 12, 6],
      [14, 10, 6],
    ],
    [
      [22, 12, 6],
      [16, 10, 6],
    ],
    [
      [22, 12, 6],
      [16, 10, 6],
    ],
    [
      [22, 12, 6],
      [16, 10, 6],
    ],
    [
      [22, 15, 6],
      [16, 10, 6],
    ],
    [
      [22, 15, 6],
      [16, 10, 6],
    ],
    [
      [22, 15, 0],
      [16, 10, 6],
    ],
    [
      [22, 15, 0],
      [16, 10, 6],
    ],
    [
      [0, 0, 0],
      [16, 10, 6],
    ],
    [
      [18, 12, 6],
      [16, 10, 6],
    ],
    [
      [20, 12, 6],
      [16, 10, 6],
    ],
    [
      [16, 10, 6],
      [16, 10, 6],
    ],
    [
      [0, 0, 0],
      [16, 10, 6],
    ],
    [
      [20, 12, 6],
      [16, 10, 6],
    ],
  ]
  for (const [i, [selected, comparison]] of scenarios.entries()) {
    await tab(i < 11 ? 'Demand register' : 'Demand comparison').click()
    await page.evaluate(examples[i])
    await values(selected, comparison)
    if (i === 3 || i === 4 || i === 5) {
      const records = await page.evaluate(() =>
        window.univerAPI
          .getBase('moss-demand-register')
          .getTableById('demand')
          .getViewById('demand-grid')
          .getProjection()
          .rows.map((row) => row.recordId),
      )
      assert.equal(records.length, i === 5 ? 6 : 3)
      if (i !== 5) assert.ok(records.every((id) => id.startsWith('week-34-')))
      await page.screenshot({ path: path.join(directory, 'view-example-' + (i + 1) + '.png') })
    }
    if (i === 6) assert.equal((await snapshot()).base.tables.demand.records['week-35-community'].values.requests, null)
    if (i === 7) assert.equal((await snapshot()).base.tables.demand.records['week-35-community'].values.requests, 0)
    await tab('Demand comparison').click()
    await derived(selected, comparison)
    const geometry = await rendered(selected, comparison, 'example-' + (i + 1))
    assert.deepEqual(await chartInfo(), originalChart, 'Native chart identity, source and configuration stay unchanged')
    const current = (await snapshot()).sheet.sheets.comparison.cellData
    for (const [r, row] of Object.entries(originalCells))
      for (const [c, cell] of Object.entries(row))
        if (cell.f) {
          const renamed = cell.f.replaceAll('[Moss Support]', '[Moss / Reviewed demand register]')
          assert.ok(
            current[r][c].f === cell.f || (i >= 10 && current[r][c].f === renamed),
            'Only the native source display-name rewrite may change formula text',
          )
        }
    report.checks.push({ example: i + 1, selected, comparison, geometry })
  }
  await page.evaluate(() =>
    window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
      window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
    }),
  )
  await page.evaluate(examples[14])
  await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
  await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('[aria-busy="false"] canvas')].some((canvas) => {
        if (canvas.width < 300 || canvas.height < 300) return false
        const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
        let green = 0,
          gold = 0
        for (let i = 0; i < pixels.length; i += 4) {
          if ([57, 125, 105].every((v, j) => Math.abs(pixels[i + j] - v) < 4)) green++
          if ([194, 155, 83].every((v, j) => Math.abs(pixels[i + j] - v) < 4)) gold++
        }
        return green > 1000 && gold > 1000
      }),
    null,
    { timeout: 20000 },
  )
  assert.deepEqual(await page.evaluate(() => window.printSource), {
    workbook: 'moss-demand-comparison',
    sheet: 'comparison',
  })
  await page.screenshot({ path: path.join(directory, 'native-print.png') })
  await page.evaluate(examples[15])
  await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
  report.checks.push('Literal examples15/16: native Print preview renders the correct host Sheet and closes')
  const [download] = await Promise.all([page.waitForEvent('download'), page.evaluate(examples[16])])
  const pngPath = path.join(directory, 'native-chart.png')
  await download.saveAs(pngPath)
  const png = await fs.readFile(pngPath)
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.ok(png.length > 3000)
  report.png = { bytes: png.length, width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
  await page.evaluate(examples[17])
  assert.ok(JSON.stringify((await snapshot()).sheet.resources).includes('moss-demand-register'))
  await page.evaluate(examples[18])
  await page.waitForFunction(
    () =>
      String(
        window.univerAPI
          .getWorkbook('moss-demand-comparison')
          .getSheetBySheetId('comparison')
          .getRange('B7')
          .getRawValue(),
      ).startsWith('#'),
    null,
    { timeout: 30000 },
  )
  report.missingBinding = await cells()
  report.missingSourceGeometry = await rendered([0, 0, 0], [0, 0, 0], 'missing-source-chart')
  await page.screenshot({ path: path.join(directory, 'missing-binding.png') })
  await page.evaluate(examples[19])
  await values([20, 12, 6], [16, 10, 6])
  await rendered([20, 12, 6], [16, 10, 6], 'binding-repaired')
  report.checks.push(
    'All20 literal examples: native PNG, native snapshots, unavailable-source binding and same-source repair',
  )
  await page.evaluate(() => {
    window.basePoints = []
  })
  await tab('Demand register').click()
  await page.waitForFunction(() => window.basePoints.some((p) => p.text === '20'))
  const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '20'))
  await page.mouse.dblclick(point.x - 8, point.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('24')
  await page.keyboard.press('Enter')
  await values([24, 12, 6], [16, 10, 6])
  await tab('Demand comparison').click()
  await rendered([24, 12, 6], [16, 10, 6], 'native-base-input')
  report.checks.push('Native Base keyboard editing changes Email20->24 and selected total38->42')
  for (const [locale, code] of [
    ['en-US', 'enUS'],
    ['zh-CN', 'zhCN'],
  ]) {
    await page.evaluate((value) => window.univerAPI.setLocale(value), code)
    for (const pack of ['bases-ui', 'sheets-chart-ui', 'chart-ui', 'sheets-print', 'embed-unit-ui']) {
      const expected = (await import('@univerjs-pro/' + pack + '/locale/' + locale)).default
      includesPack(await page.evaluate(() => window.univerAPI.getLocales()), expected)
    }
    const before = await snapshot()
    await page.evaluate(() => window.univerAPI.toggleDarkMode(true))
    await page.screenshot({ path: path.join(directory, locale + '-dark.png') })
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    assert.deepEqual(await snapshot(), before)
    await rendered([24, 12, 6], [16, 10, 6], locale + '-light')
    report.checks.push({ locale, officialPacks: 5, themePreservesBothModels: true })
  }
  await tab('Demand register').click()
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await root.waitFor({ state: 'detached' })
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  report.checks.push('Active Base tab disposal releases both native units and their owner')
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.cells = await cells().catch(() => null)
  report.chart = await chartInfo().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
