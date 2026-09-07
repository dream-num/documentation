/* eslint-disable no-await-in-loop -- Verify the ordered published examples and native rendered columns. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-prism-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-to-chart/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 25)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(15000)
const report = { passed: false, checks: [], gates: {}, errors: [], warnings: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
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
const root = page.locator('.prism-embed')
const tab = (name) => root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
const chartInfo = () =>
  page.evaluate(() =>
    window.univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('comparison').getCharts()[0].getInfo(),
  )
const cells = () =>
  page.evaluate(() =>
    window.univerAPI
      .getWorkbook('prism-income-comparison')
      .getSheetBySheetId('comparison')
      .getRange('B7:C9')
      .getRawValues(),
  )
async function values(actual, plan) {
  const expected = actual.map((v, i) => [v, plan[i]])
  await page.waitForFunction(
    (targets) => {
      const sheet = window.univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('comparison')
      return (
        JSON.stringify(sheet.getRange('B7:C9').getRawValues()) === JSON.stringify(targets) &&
        sheet.getRange('B11').getRawValue() === targets.reduce((s, r) => s + r[0], 0) &&
        sheet.getRange('C11').getRawValue() === targets.reduce((s, r) => s + (typeof r[1] === 'number' ? r[1] : 0), 0)
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
      .getWorkbook('prism-income-comparison')
      .getSheetBySheetId('comparison')
      .getCharts()[0]
      .getInfo()
    const canvas = [...document.querySelectorAll('.prism-embed canvas[id^="univer-sheet-main-canvas"]')].find(
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
        [40, 139, 149],
        [199, 154, 67],
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
          if (columns[col].count > 2) {
            let end = col
            while (end + 1 < width && columns[end + 1].count > 2) end++
            const group = columns.slice(col, end + 1)
            const min = Math.min(...group.map((v) => v.min)),
              max = Math.max(...group.map((v) => v.max))
            if (end - col > 10 && max - min > 2)
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
      // Fit one shared pixel scale without amplifying rounding in a very short draft bar.
      const scale =
        measurements.reduce((sum, m) => sum + m.height * m.value, 0) /
        measurements.reduce((sum, m) => sum + m.value * m.value, 0)
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
    base: window.univerAPI.getBase('prism-income-register').save(),
    sheet: window.univerAPI.getWorkbook('prism-income-comparison').save(),
  }))
async function derived(actual, targets) {
  const sum = actual.reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0)
  const cellsNow = await page.evaluate(() =>
    window.univerAPI
      .getWorkbook('prism-income-comparison')
      .getSheetBySheetId('comparison')
      .getRange('D7:F9')
      .getRawValues(),
  )
  for (let i = 0; i < 3; i++) {
    const wanted = [
      typeof targets[i] === 'number' ? targets[i] - actual[i] : '#VALUE!',
      typeof targets[i] !== 'number' ? '#VALUE!' : targets[i] ? actual[i] / targets[i] : '#DIV/0!',
      sum ? actual[i] / sum : '#DIV/0!',
    ]
    for (let j = 0; j < 3; j++)
      if (typeof wanted[j] === 'number') assert.ok(Math.abs(cellsNow[i][j] - wanted[j]) < 1e-9)
      else assert.equal(cellsNow[i][j], wanted[j])
  }
}
function includesPack(actual, expected) {
  for (const [key, value] of Object.entries(expected))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
}
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
let actual = [21800, 18700, 14000],
  targets = [24000, 21000, 15000]
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4332', { timeout: 60000 })
  await page.waitForFunction(
    () =>
      document.querySelector('.prism-embed')?.dataset.ready || document.querySelector('.prism-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  const descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'prism-income-comparison' })[0].getDescriptor(),
  )
  assert.equal(descriptor.childUnitId, 'prism-income-register')
  assert.equal(descriptor.entry, 'sheets-sheet-tab')
  await values(actual, targets)
  await derived(actual, targets)
  report.baseline = await rendered(actual, targets, 'baseline')
  const originalChart = await chartInfo()
  assert.equal(originalChart.dataSource.range.startRow, 5)
  assert.equal(originalChart.dataSource.range.endRow, 8)
  for (const [i, code] of examples.slice(0, 21).entries()) {
    const before = await snapshot()
    await page.evaluate(code)
    switch (i + 1) {
      case 1:
        actual[0] = 25300
        break
      case 2:
        targets[1] = 23000
        break
      case 3:
        actual[1] = 21600
        break
      case 4:
        actual = [0, 0, 1700]
        break
      case 5:
        actual = [9600, 0, 0]
        break
      case 6:
        actual = [25300, 21600, 14000]
        break
      case 8:
        actual[2] = 14900
        break
      case 10:
        actual[0] = 12800
        break
      case 12:
        targets[1] = 0
        break
      case 13:
        actual = [0, 0, 0]
        break
      case 14:
        actual = [21800, 18700, 14000]
        targets = [24000, 21000, 15000]
        break
      case 17:
        actual[0] = 22100
        break
      case 20:
        targets[0] = 'pending'
        break
      case 21:
        targets[0] = 24000
        break
    }
    if (i + 1 === 18) {
      await page.waitForFunction(
        () =>
          window.univerAPI
            .getWorkbook('prism-income-comparison')
            .getSheetBySheetId('comparison')
            .getRange('B7:B9')
            .getRawValues()
            .every((r) => String(r[0]).startsWith('#')),
        null,
        { timeout: 30000 },
      )
      assert.deepEqual(
        (await cells()).map((r) => r[1]),
        targets,
      )
      report.missingSource = await cells()
      await gate('missing-base-keeps-target-series', async () => {
        report.missingGeometry = await rendered([0, 0, 0], targets, 'missing-source')
      })
    } else {
      await values(actual, targets)
      await derived(actual, targets)
      await rendered(actual, targets, 'example-' + (i + 1))
    }
    const after = await snapshot()
    if ([2, 4, 5, 6, 12, 13, 20, 21].includes(i + 1)) assert.deepEqual(after.base, before.base)
    if ([1, 3, 7, 8, 9, 10, 11, 15, 16, 17, 18, 19].includes(i + 1))
      assert.deepEqual(after.sheet.sheets.targets, before.sheet.sheets.targets)
    if ([10, 11].includes(i + 1))
      assert.equal(after.base.tables.income.records['member-new'].values.amount, i === 9 ? null : 0)
    if (i + 1 === 7) {
      const projection = await page.evaluate(() =>
        window.univerAPI
          .getBase('prism-income-register')
          .getTableById('income')
          .getViewById('income-grid')
          .getProjection(),
      )
      assert.deepEqual(
        projection.rows.map((row) => row.recordId),
        ['draft-edition'],
      )
    }
    assert.deepEqual(await chartInfo(), originalChart, 'Source changes preserve the chart identity and configuration')
    report.checks.push({
      example: i + 1,
      actual: structuredClone(actual),
      targets: structuredClone(targets),
      source: await cells(),
    })
  }
  await gate('literal-native-print', async () => {
    await page.evaluate(() =>
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      }),
    )
    await page.evaluate(examples[21])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
    await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printSource), {
      workbook: 'prism-income-comparison',
      sheet: 'comparison',
    })
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('[aria-busy="false"] canvas')].some((canvas) => {
          if (canvas.width < 300 || canvas.height < 300) return false
          const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
          let actualPixels = 0,
            targetPixels = 0
          for (let i = 0; i < data.length; i += 4) {
            if ([40, 139, 149].every((v, j) => Math.abs(data[i + j] - v) < 4)) actualPixels++
            if ([199, 154, 67].every((v, j) => Math.abs(data[i + j] - v) < 4)) targetPixels++
          }
          return actualPixels > 1000 && targetPixels > 1000
        }),
      null,
      { timeout: 20000 },
    )
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await page.evaluate(examples[22])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
    report.checks.push({ examples: [22, 23], nativePrint: true })
  })
  await gate('literal-native-png', async () => {
    const [download] = await Promise.all([page.waitForEvent('download'), page.evaluate(examples[23])])
    const filename = path.join(directory, 'native-chart.png')
    await download.saveAs(filename)
    const png = await fs.readFile(filename)
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
    assert.ok(png.length > 3000)
    report.png = { bytes: png.length, width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
    await page.evaluate(examples[24])
    report.checks.push({ examples: [24, 25], nativePNG: true })
  })
  await gate('native-target-sheet-typing-history', async () => {
    await tab('Target plan').click()
    await settle()
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('prism-income-comparison').save().sheets.targets
      const canvas = [...document.querySelectorAll('.prism-embed canvas[id^="univer-sheet-main-canvas"]')].find(
        (c) => !c.closest('[data-embed-sheets-sheet-tab-host]'),
      )
      const b = canvas.getBoundingClientRect()
      return {
        x: b.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w / 2) * s.zoomRatio,
        y:
          b.y +
          (s.columnHeader.height +
            [0, 1, 2, 3].reduce((a, i) => a + (s.rowData[i]?.h || s.defaultRowHeight), 0) +
            s.defaultRowHeight / 2) *
            s.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('prism-income-comparison').getActiveRange()?.getA1Notation() === 'B5',
    )
    const before = JSON.parse(JSON.stringify(await snapshot()))
    await page.keyboard.type('26000')
    await page.keyboard.press('Enter')
    targets[0] = 26000
    await values(actual, targets)
    const after = JSON.parse(JSON.stringify(await snapshot()))
    assert.deepEqual(after.base, before.base)
    await page.keyboard.press('Control+z')
    targets[0] = 24000
    await values(actual, targets)
    assert.deepEqual(JSON.parse(JSON.stringify(await snapshot())), before)
    await page.keyboard.press('Control+y')
    targets[0] = 26000
    await values(actual, targets)
    assert.deepEqual(JSON.parse(JSON.stringify(await snapshot())), after)
    await page.screenshot({ path: path.join(directory, 'native-targets.png') })
    await tab('Plan versus actual').click()
    await rendered(actual, targets, 'target-input-chart')
  })
  await gate('native-base-typing-history', async () => {
    await page.evaluate(() => {
      window.basePoints = []
    })
    await tab('Income register').click()
    await page.waitForFunction(() => window.basePoints.some((p) => p.text === '9,300.00'))
    const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '9,300.00'))
    const before = JSON.parse(JSON.stringify(await snapshot()))
    await page.mouse.dblclick(point.x - 15, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('9700')
    await page.keyboard.press('Enter')
    actual[0] = 22500
    await values(actual, targets)
    const after = JSON.parse(JSON.stringify(await snapshot()))
    assert.deepEqual(after.sheet.sheets.targets, before.sheet.sheets.targets)
    for (const [name, wanted, value] of [
      ['Undo', before, 22100],
      ['Redo', after, 22500],
    ]) {
      await root.getByRole('button', { name, exact: true }).click()
      await settle()
      actual[0] = value
      await values(actual, targets)
      assert.deepEqual(JSON.parse(JSON.stringify((await snapshot()).base)), wanted.base)
    }
    await page.screenshot({ path: path.join(directory, 'native-base.png') })
    await tab('Plan versus actual').click()
    await rendered(actual, targets, 'native-base-chart')
  })
  await gate('complete-locales-and-themes', async () => {
    await tab('Plan versus actual').click()
    const source = await fs.readFile('showcase/embed/mixed-to-chart/code/create-demo.ts', 'utf8')
    const packs = [...source.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 16)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((value) => window.univerAPI.setLocale(value), code)
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      const before = JSON.parse(JSON.stringify(await snapshot()))
      for (const dark of [true, false]) {
        await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
        await settle()
        assert.deepEqual(JSON.parse(JSON.stringify(await snapshot())), before)
      }
      await rendered(actual, targets, locale + '-light')
    }
  })
  await gate('active-base-disposal', async () => {
    await tab('Income register').click()
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  assert.ok(Object.values(report.gates).every((g) => g.passed))
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.cells = await cells().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  try {
    await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
    console.log(
      JSON.stringify(
        {
          passed: report.passed,
          checks: report.checks.length,
          gates: report.gates,
          errors: report.errors,
          warnings: report.warnings,
          failure: report.failure,
        },
        null,
        2,
      ),
    )
  } finally {
    await browser.close()
  }
}
if (!report.passed) process.exitCode = 1
