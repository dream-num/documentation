/* eslint-disable no-await-in-loop -- Reconstruct each native owner before exercising its next source edit. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const [{ directory: exportDirectory }] = JSON.parse(
  await fs.readFile('test-results/prism-formula-export/exports.json', 'utf8'),
)
const source = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/mixed-to-chart')
for (const [name, content] of Object.entries(source.files)) {
  const target = path.join(exportDirectory, name.slice(1))
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content)
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-prism-roundtrip')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/embed/mixed-to-chart/README.md', 'utf8')
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)]
assert.equal(restores.length, 1)
const restore = restores[0][1]
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((m) => m[1])
assert.equal(examples.length, 25)
const { build, preview } = await import(
  pathToFileURL(path.join(exportDirectory, 'node_modules/vite/dist/node/index.js')).href
)
// Only the lifecycle harness is substituted. SDK factory, CSS and data are the exact exported files.
// Production build avoids a second large dev dependency-optimizer cache.
const outDir = path.join(directory, 'harness-dist')
await build({
  root: exportDirectory,
  configFile: false,
  logLevel: 'warn',
  build: { outDir, emptyOutDir: false },
  plugins: [
    {
      name: 'prism-roundtrip-harness',
      transformIndexHtml: {
        order: 'pre',
        handler:
          () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
      import {createDemo} from '/src/create-demo.ts';
      window.createDemo = createDemo;
      window.container = document.getElementById('app');
      window.demo = createDemo(window.container);
    </script></body></html>`,
      },
    },
  ],
})
const server = await preview({
  root: exportDirectory,
  configFile: false,
  build: { outDir },
  preview: { host: '127.0.0.1', port: 4336, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(20000)
const report = { passed: false, checks: [], knownIssues: [], errors: [], warnings: [], backendRequests: [] }
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
async function ready() {
  await page.waitForFunction(
    () =>
      document.querySelector('.prism-embed')?.dataset.ready || document.querySelector('.prism-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
const snapshots = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        host: window.univerAPI.getWorkbook('prism-income-comparison').save(),
        source: window.univerAPI.getBase('prism-income-register').save(),
      }),
    ),
  )
const chartInfo = () =>
  page.evaluate(() =>
    window.univerAPI
      .getWorkbook('prism-income-comparison')
      .getSheetBySheetId('comparison')
      .getCharts()
      .map((chart) => chart.getInfo()),
  )
async function values(selected, comparison) {
  await page.waitForFunction(
    ({ selected: wanted, comparison: prior }) => {
      const sheet = window.univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('comparison')
      return (
        JSON.stringify(sheet.getRange('B7:C9').getRawValues()) === JSON.stringify(wanted.map((v, i) => [v, prior[i]]))
      )
    },
    { selected, comparison },
  )
}
async function painted(selected, comparison, name) {
  const deadline = Date.now() + 15000
  let series
  do {
    series = await page.evaluate(() => {
      const chart = window.univerAPI
        .getWorkbook('prism-income-comparison')
        .getSheetBySheetId('comparison')
        .getCharts()[0]
        .getInfo()
      const canvas = [...document.querySelectorAll('.prism-embed canvas[id^="univer-sheet-main-canvas"]')].find(
        (c) => !c.closest('[data-embed-sheets-sheet-tab-host]'),
      )
      if (!canvas) return []
      const width = Math.round(chart.size.width),
        height = Math.round(chart.size.height)
      const data = canvas
        .getContext('2d')
        .getImageData(Math.round(chart.position.x), Math.round(chart.position.y), width, height).data
      return [
        [40, 139, 149],
        [199, 154, 67],
      ].map((color) => {
        const columns = Array.from({ length: width }, () => 0)
        for (let y = Math.ceil(height * 0.2); y < height; y++)
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4
            if (data[i + 3] > 240 && color.every((v, c) => Math.abs(data[i + c] - v) < 4)) columns[x]++
          }
        const bars = []
        for (let x = 0; x < width; x++)
          if (columns[x] > 18) {
            let end = x
            while (end + 1 < width && columns[end + 1] > 18) end++
            if (end - x > 10) bars.push(Math.max(...columns.slice(x, end + 1)))
            x = end
          }
        return bars
      })
    })
    if (
      series.length === 2 &&
      series.every((bars, i) => bars.length === [selected, comparison][i].filter((v) => v > 0).length)
    ) {
      const measured = series.flatMap((bars, i) =>
        bars.map((height, j) => ({ height, value: [selected, comparison][i].filter((v) => v > 0)[j] })),
      )
      const scale = measured.reduce((sum, m) => sum + m.height / m.value, 0) / measured.length
      if (measured.every((m) => Math.abs(m.height - m.value * scale) < 3)) {
        await page.screenshot({ path: path.join(directory, name + '.png') })
        report.checks.push({ name, selected, comparison, paintedBarHeights: series })
        return
      }
    }
    await page.waitForTimeout(150)
  } while (Date.now() < deadline)
  throw new Error('Native chart paint does not match: ' + JSON.stringify(series))
}
async function reconstruct(name) {
  const before = await snapshots()
  const chart = await chartInfo()
  const appearance = await page.evaluate(() => ({
    locale: window.univerAPI.getCurrentLocale(),
    darkMode: window.univerAPI.isDarkMode(),
  }))
  await page.evaluate(() => {
    window.oldAPI = window.univerAPI
  })
  await page.evaluate(`(() => { ${restore} })()`)
  await ready()
  assert.equal(await page.evaluate(() => window.oldAPI === window.univerAPI), false)
  assert.equal(await root.count(), 1)
  assert.deepEqual(
    await page.evaluate(() => ({
      locale: window.univerAPI.getCurrentLocale(),
      darkMode: window.univerAPI.isDarkMode(),
    })),
    appearance,
  )
  const after = await snapshots()
  await fs.writeFile(path.join(directory, name + '-snapshots.json'), JSON.stringify({ before, after }, null, 2))
  assert.deepEqual(after.source, before.source, 'The entire Base snapshot must survive')
  assert.deepEqual(await chartInfo(), chart, 'Chart identity/configuration must survive')
  const originalResource = before.host.resources.find((r) => r.name === 'UNIVER_EMBED_RESOURCE_PLUGIN')
  const restoredResource = after.host.resources.find((r) => r.name === 'UNIVER_EMBED_RESOURCE_PLUGIN')
  const originalEmbed = JSON.parse(originalResource.data)
  const restoredEmbed = JSON.parse(restoredResource.data)
  const previousTime = originalEmbed.embeds['prism-income-tab'].updatedAt
  const restoredTime = restoredEmbed.embeds['prism-income-tab'].updatedAt
  assert.ok(restoredTime >= previousTime)
  restoredEmbed.embeds['prism-income-tab'].updatedAt = previousTime
  restoredResource.data = JSON.stringify(restoredEmbed)
  const originalNames = before.host.resources.find((r) => r.name === 'SHEET_DEFINED_NAME_PLUGIN')
  const restoredNames = after.host.resources.find((r) => r.name === 'SHEET_DEFINED_NAME_PLUGIN')
  // DefinedNameDataController parses the initial empty string as {}, registers it,
  // then serializes that empty map as '{}'. Do not normalize populated name maps.
  const emptyNamesCanonicalized = originalNames.data === '' && restoredNames.data === '{}'
  if (emptyNamesCanonicalized) restoredNames.data = ''
  let fullSnapshotComparisonPassed = true
  try {
    assert.deepEqual(
      after.host,
      before.host,
      'Only embed activation time and exact empty-name serialization may differ',
    )
  } catch (error) {
    fullSnapshotComparisonPassed = false
    report.knownIssues.push({ name, gate: 'full-snapshot-reconstruction', failure: error.message })
  }
  // Separate authored-state proof; the strict failure above remains in the final status.
  // Native reconstruction adds explicit zero/false transform defaults. Verify their
  // exact values before comparing the unchanged drawing geometry and other fields.
  const originalDrawing = before.host.resources.find((r) => r.name === 'SHEET_DRAWING_PLUGIN')
  const restoredDrawing = after.host.resources.find((r) => r.name === 'SHEET_DRAWING_PLUGIN')
  const originalDrawings = JSON.parse(originalDrawing.data)
  const restoredDrawings = JSON.parse(restoredDrawing.data)
  const addedDefaults = []
  for (const [sheetId, sheetDrawings] of Object.entries(originalDrawings)) {
    for (const [drawingId, drawing] of Object.entries(sheetDrawings.data)) {
      const restoredTransform = restoredDrawings[sheetId].data[drawingId].transform
      for (const [key, value] of Object.entries({ flipY: false, flipX: false, angle: 0, skewX: 0, skewY: 0 })) {
        if (!(key in drawing.transform) && key in restoredTransform) {
          assert.equal(restoredTransform[key], value)
          addedDefaults.push({ sheetId, drawingId, key, value })
          delete restoredTransform[key]
        }
      }
    }
  }
  restoredDrawing.data = JSON.stringify(restoredDrawings)
  assert.deepEqual(after.host, before.host, 'Authored values, formulas, layout and chart configuration must survive')
  assert.equal(
    await page.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'prism-income-comparison' }).length),
    1,
  )
  report.checks.push({
    name,
    fullSnapshotComparisonPassed,
    authoredStatePreserved: true,
    addedDefaults,
    previousTime,
    restoredTime,
    emptyNamesCanonicalized,
    chartCount: chart.length,
  })
}
try {
  await page.goto('http://127.0.0.1:4336', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await values([21800, 18700, 14000], [24000, 21000, 15000])
  await painted([21800, 18700, 14000], [24000, 21000, 15000], 'baseline')
  const original = await snapshots()
  const rejected = await page.evaluate(() => {
    const owner = window.univerAPI
    const pair = {
      host: owner.getWorkbook('prism-income-comparison').save(),
      source: owner.getBase('prism-income-register').save(),
    }
    return [
      'host-id',
      'source-id',
      'sheet',
      'targets',
      'table',
      'missing-host',
      'missing-source',
      'resource',
      'anchor',
      'anchor-order',
    ].map((kind) => {
      const saved = structuredClone(pair)
      if (kind === 'host-id') saved.host.id = 'another-workbook'
      if (kind === 'source-id') saved.source.id = 'another-base'
      if (kind === 'sheet') delete saved.host.sheets.comparison
      if (kind === 'targets') delete saved.host.sheets.targets
      if (kind === 'table') delete saved.source.tables.income
      if (kind === 'missing-host') delete saved.host
      if (kind === 'missing-source') delete saved.source
      if (kind === 'resource')
        saved.host.resources = saved.host.resources.filter((r) => r.name !== 'UNIVER_EMBED_RESOURCE_PLUGIN')
      if (kind === 'anchor') delete saved.host.sheets['sheets-tab:prism-income-tab']
      if (kind === 'anchor-order')
        saved.host.sheetOrder = saved.host.sheetOrder.filter((id) => id !== 'sheets-tab:prism-income-tab')
      let message = ''
      try {
        window.createDemo(window.container, false, undefined, saved)
      } catch (e) {
        message = e.message
      }
      return {
        kind,
        message,
        sameOwner: owner === window.univerAPI,
        roots: document.querySelectorAll('.prism-embed').length,
      }
    })
  })
  for (const outcome of rejected) {
    assert.match(outcome.message, /Restore.*Prism/)
    assert.equal(outcome.sameOwner, true)
    assert.equal(outcome.roots, 1)
  }
  assert.deepEqual(await snapshots(), original)
  report.checks.push({ rejected })
  await page.evaluate(examples[15])
  await page.evaluate(() => {
    const api = window.univerAPI,
      workbook = api.getWorkbook('prism-income-comparison'),
      table = api.getBase('prism-income-register').getTableById('income')
    workbook.getSheetBySheetId('targets').getRange('B5').setValue(26000)
    table.getRecordById('member-new').setValue('amount', 11000)
    table.getRecordById('edition-guide').setValue('note', 'Saved context: reviewed with the programme coordinator.')
    table.getViewById('income-grid').setFilter({
      conjunction: api.Enum.BaseFilterConjunction.AND,
      conditions: [{ fieldId: 'status', operator: api.Enum.BaseFilterOperator.IS, operand: 'Draft' }],
    })
    const sheet = workbook.getSheetBySheetId('comparison')
    sheet.getRange('D11').setValue('=C11-B11+250')
    sheet.getCharts()[0].setTitle('Prism / Retained review')
  })
  await values([23800, 18700, 14000], [26000, 21000, 15000])
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('prism-income-comparison')
        .getSheetBySheetId('comparison')
        .getRange('D11')
        .getRawValue() === 5750,
  )
  await painted([23800, 18700, 14000], [26000, 21000, 15000], 'edited')
  await tab('Income register').click()
  await reconstruct('edited-owner')
  await values([23800, 18700, 14000], [26000, 21000, 15000])
  await painted([23800, 18700, 14000], [26000, 21000, 15000], 'restored')
  const hidden = await page.evaluate(() =>
    window.univerAPI
      .getBase('prism-income-register')
      .getTableById('income')
      .getViewById('income-grid')
      .getProjection()
      .rows.map((r) => r.recordId),
  )
  assert.deepEqual(hidden, ['draft-workshop', 'draft-edition'])
  await page.evaluate(() =>
    window.univerAPI
      .getBase('prism-income-register')
      .getTableById('income')
      .getRecordById('member-new')
      .setValue('amount', 12000),
  )
  await values([24800, 18700, 14000], [26000, 21000, 15000])
  await painted([24800, 18700, 14000], [26000, 21000, 15000], 'fresh-hidden-base-edit')
  await tab('Target plan').click()
  const point = await page.evaluate(() => {
    const data = window.univerAPI.getWorkbook('prism-income-comparison').save().sheets.targets
    const canvas = [...document.querySelectorAll('canvas[id^="univer-sheet-main-canvas"]')].find(
      (c) => !c.closest('[data-embed-sheets-sheet-tab-host]'),
    )
    const bounds = canvas.getBoundingClientRect()
    return {
      x: bounds.x + (data.rowHeader.width + data.columnData[0].w + data.columnData[1].w / 2) * data.zoomRatio,
      y:
        bounds.y +
        (data.columnHeader.height +
          [0, 1, 2, 3].reduce((sum, row) => sum + (data.rowData[row]?.h || data.defaultRowHeight), 0) +
          data.defaultRowHeight / 2) *
          data.zoomRatio,
    }
  })
  await page.mouse.click(point.x, point.y)
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('prism-income-comparison').getActiveRange()?.getA1Notation() === 'B5',
  )
  await page.keyboard.type('27000')
  await page.keyboard.press('Enter')
  await values([24800, 18700, 14000], [27000, 21000, 15000])
  await tab('Plan versus actual').click()
  await painted([24800, 18700, 14000], [27000, 21000, 15000], 'fresh-native-target-edit')
  await page.evaluate(examples[17])
  await page.waitForFunction(() =>
    String(
      window.univerAPI
        .getWorkbook('prism-income-comparison')
        .getSheetBySheetId('comparison')
        .getRange('B7')
        .getRawValue(),
    ).startsWith('#'),
  )
  await reconstruct('unavailable-binding')
  await page.waitForFunction(() =>
    String(
      window.univerAPI
        .getWorkbook('prism-income-comparison')
        .getSheetBySheetId('comparison')
        .getRange('B7')
        .getRawValue(),
    ).startsWith('#'),
  )
  await painted([0, 0, 0], [27000, 21000, 15000], 'missing-base-target-retained')
  await page.evaluate(examples[18])
  await values([24800, 18700, 14000], [27000, 21000, 15000])
  await painted([24800, 18700, 14000], [27000, 21000, 15000], 'repaired-after-reload')
  await page.evaluate(() => {
    window.univerAPI.setLocale('zhCN')
    window.univerAPI.toggleDarkMode(true)
  })
  await reconstruct('chinese-dark')
  await values([24800, 18700, 14000], [27000, 21000, 15000])
  await painted([24800, 18700, 14000], [27000, 21000, 15000], 'chinese-dark-restored')
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('comparison').getCharts()[0].remove(),
    ),
    true,
  )
  await reconstruct('removed-chart')
  assert.deepEqual(await chartInfo(), [])
  await page.evaluate(() =>
    window.univerAPI
      .getBase('prism-income-register')
      .getTableById('income')
      .getRecordById('member-new')
      .setValue('amount', 12500),
  )
  await values([25300, 18700, 14000], [27000, 21000, 15000])
  assert.deepEqual(await chartInfo(), [])
  report.checks.push({ name: 'removed-chart-stays-removed-after-fresh-source-edit' })
  await page.evaluate(() => window.demo.dispose())
  await root.waitFor({ state: 'detached' })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0
} catch (e) {
  report.failure = e.stack
  report.models = await snapshots().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  try {
    await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
    console.log(JSON.stringify({ ...report, models: undefined }, null, 2))
  } finally {
    try {
      await browser.close()
    } finally {
      await new Promise((resolve) => server.httpServer.close(resolve))
    }
  }
}
if (!report.passed) process.exitCode = 1
