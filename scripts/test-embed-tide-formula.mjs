/* eslint-disable no-await-in-loop -- Verify the ordered published examples and native rendered columns. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-tide-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheet-to-chart/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 7)
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
const root = page.locator('.tide-channel-formula')
const child = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="tide-channel-source-float"]')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const chartInfo = () =>
  page.evaluate(() =>
    window.univerAPI.getWorkbook('tide-channel-comparison').getSheetBySheetId('comparison').getCharts()[0].getInfo(),
  )
const cells = () =>
  page.evaluate(() =>
    window.univerAPI
      .getWorkbook('tide-channel-comparison')
      .getSheetBySheetId('comparison')
      .getRange('B5:C7')
      .getRawValues(),
  )
async function values(actual, plan) {
  const expected = actual.map((v, i) => [v, plan[i]])
  await page.waitForFunction(
    (targets) => {
      const sheet = window.univerAPI.getWorkbook('tide-channel-comparison').getSheetBySheetId('comparison')
      return (
        JSON.stringify(sheet.getRange('B5:C7').getRawValues()) === JSON.stringify(targets) &&
        sheet.getRange('B9').getRawValue() === targets.reduce((s, r) => s + r[0], 0) &&
        sheet.getRange('C9').getRawValue() === targets.reduce((s, r) => s + r[1], 0)
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
      .getWorkbook('tide-channel-comparison')
      .getSheetBySheetId('comparison')
      .getCharts()[0]
      .getInfo()
    const canvas = [...document.querySelectorAll('.tide-channel-formula canvas[id^="univer-sheet-main-canvas"]')].find(
      (c) => !c.closest('[data-u-comp="embed-float-dom"]'),
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
        [40, 127, 131],
        [211, 166, 72],
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
async function expand() {
  await child.dblclick({ position: { x: 180, y: 90 } })
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="tide-channel-source-float"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="tide-channel-source-float"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await shell.waitFor()
  await settle()
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    report.gates[name].models = await page
      .evaluate(() => ({
        source: window.univerAPI.getWorkbook('tide-channel-source').save().sheets.channels.cellData,
        host: window.univerAPI.getWorkbook('tide-channel-comparison').save().sheets.comparison.cellData,
      }))
      .catch(() => null)
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4286', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.tide-channel-formula')
      return r?.dataset.ready || r?.dataset.error
    },
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  await values([120, 180, 90], [140, 160, 100])
  report.baseline = await rendered([120, 180, 90], [140, 160, 100], 'baseline')
  const original = await chartInfo()
  const originalChartId = await page.evaluate(() =>
    window.univerAPI.getWorkbook('tide-channel-comparison').getSheetBySheetId('comparison').getCharts()[0].getId(),
  )
  assert.equal(original.dataSource.range.startRow, 3)
  assert.equal(original.dataSource.range.endRow, 6)
  assert.equal(original.dataSource.range.startColumn, 0)
  assert.equal(original.dataSource.range.endColumn, 2)
  const scenarios = [
    [
      [120, 210, 90],
      [140, 160, 100],
    ],
    [
      [120, 210, 90],
      [140, 230, 100],
    ],
    [
      [0, 210, 90],
      [140, 230, 100],
    ],
    [
      [0, 0, 0],
      [140, 230, 100],
    ],
    [
      [120, 180, 90],
      [140, 160, 100],
    ],
  ]
  for (const [i, [actual, plan]] of scenarios.entries()) {
    await page.evaluate(examples[i])
    await values(actual, plan)
    assert.equal(
      await page.evaluate(() =>
        window.univerAPI.getWorkbook('tide-channel-comparison').getSheetBySheetId('comparison').getCharts()[0].getId(),
      ),
      originalChartId,
    )
    assert.deepEqual(
      await chartInfo(),
      original,
      'Formula changes preserve chart ID, mapping, configuration and geometry',
    )
    const geometry = await rendered(actual, plan, 'example-' + (i + 1))
    if (i === 3)
      assert.deepEqual(
        await page.evaluate(() =>
          window.univerAPI
            .getWorkbook('tide-channel-comparison')
            .getSheetBySheetId('comparison')
            .getRange('D5:D7')
            .getRawValues(),
        ),
        [['#DIV/0!'], ['#DIV/0!'], ['#DIV/0!']],
      )
    report.checks.push({ example: i + 1, actual, plan, geometry })
  }
  await page.evaluate(examples[5])
  const [downloaded] = await Promise.all([page.waitForEvent('download'), page.evaluate(examples[6])])
  const pngPath = path.join(directory, 'native-chart.png')
  await downloaded.saveAs(pngPath)
  const png = await fs.readFile(pngPath)
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.ok(png.length > 3000)
  report.png = { bytes: png.length, width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
  report.checks.push(
    'Seven literal examples; native chart pixel geometry follows external source values; native PNG export succeeds',
  )
  await gate('native-source-preview', async () => {
    const painted = await child.locator('canvas').evaluateAll((canvases) =>
      canvases.some((canvas) => {
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
        let sand = 0
        for (let i = 0; i < data.length; i += 4)
          if (
            Math.abs(data[i] - 255) < 3 &&
            Math.abs(data[i + 1] - 240) < 3 &&
            Math.abs(data[i + 2] - 214) < 3 &&
            data[i + 3] > 240
          )
            sand++
        return sand > 1000
      }),
    )
    assert.equal(painted, true, 'Native inactive source preview paints the authored input cells')
  })
  await gate('native-source-keyboard-ownership', async () => {
    await expand()
    const beforeHost = await page.evaluate(
      () => window.univerAPI.getWorkbook('tide-channel-comparison').save().sheets.comparison.cellData,
    )
    const point = await page.evaluate(() => {
      const sheet = window.univerAPI.getWorkbook('tide-channel-source').save().sheets.channels
      const canvas = document.querySelector(
        '[data-embed-fullscreen-shell="true"] [data-embed-canvas-root="true"] canvas',
      )
      const b = canvas.getBoundingClientRect()
      return {
        x: b.x + (sheet.rowHeader.width + 170 + 65) * sheet.zoomRatio,
        y: b.y + (sheet.columnHeader.height + 42 + 4 * 28 + 14) * sheet.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.keyboard.type('210')
    await page.keyboard.press('Enter')
    await values([120, 210, 90], [140, 160, 100])
    const data = await page.evaluate(
      () => window.univerAPI.getWorkbook('tide-channel-comparison').save().sheets.comparison.cellData,
    )
    for (const [r, row] of Object.entries(beforeHost))
      for (const [c, cell] of Object.entries(row))
        if (cell.f) assert.equal(data[r][c].f, cell.f, 'Source typing must not overwrite host formulas')
    assert.equal(
      await page.evaluate(() =>
        window.univerAPI.getWorkbook('tide-channel-source').getSheetBySheetId('channels').getRange('B6').getRawValue(),
      ),
      210,
    )
    await shell.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
    await shell.waitFor({ state: 'detached' })
    await settle()
    await rendered([120, 210, 90], [140, 160, 100], 'native-source-edit')
  })
  await gate('dispose', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  assert.ok(Object.values(report.gates).every((g) => g.passed))
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.cells = await cells().catch(() => null)
  report.chart = await chartInfo().catch(() => null)
  report.bars = await bars().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
