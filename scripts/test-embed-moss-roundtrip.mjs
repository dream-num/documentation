/* eslint-disable no-await-in-loop -- Reconstruct each native owner before exercising its next source edit. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const [{ directory: exportDirectory }] = JSON.parse(
  await fs.readFile('test-results/embed-moss-formula/exports.json', 'utf8'),
)
const source = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/base-to-chart')
for (const [name, content] of Object.entries(source.files)) {
  const target = path.join(exportDirectory, name.slice(1))
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content)
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-moss-roundtrip')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/embed/base-to-chart/README.md', 'utf8')
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)]
assert.equal(restores.length, 1)
const restore = restores[0][1]
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((m) => m[1])
assert.equal(examples.length, 20)
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
      name: 'moss-roundtrip-harness',
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
  preview: { host: '127.0.0.1', port: 4310, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(20000)
const report = { passed: false, checks: [], errors: [], warnings: [], backendRequests: [] }
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
const root = page.locator('.moss-embed')
const tab = (name) => root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
async function ready() {
  await page.waitForFunction(
    () => document.querySelector('.moss-embed')?.dataset.ready || document.querySelector('.moss-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
const snapshots = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        host: window.univerAPI.getWorkbook('moss-demand-comparison').save(),
        source: window.univerAPI.getBase('moss-demand-register').save(),
      }),
    ),
  )
const chartInfo = () =>
  page.evaluate(() =>
    window.univerAPI
      .getWorkbook('moss-demand-comparison')
      .getSheetBySheetId('comparison')
      .getCharts()
      .map((chart) => chart.getInfo()),
  )
async function values(selected, comparison) {
  await page.waitForFunction(
    ({ selected: wanted, comparison: prior }) => {
      const sheet = window.univerAPI.getWorkbook('moss-demand-comparison').getSheetBySheetId('comparison')
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
        .getWorkbook('moss-demand-comparison')
        .getSheetBySheetId('comparison')
        .getCharts()[0]
        .getInfo()
      const canvas = [...document.querySelectorAll('.moss-embed canvas[id^="univer-sheet-main-canvas"]')].find(
        (c) => !c.closest('[data-embed-sheets-sheet-tab-host]'),
      )
      if (!canvas) return []
      const width = Math.round(chart.size.width),
        height = Math.round(chart.size.height)
      const data = canvas
        .getContext('2d')
        .getImageData(Math.round(chart.position.x), Math.round(chart.position.y), width, height).data
      return [
        [57, 125, 105],
        [194, 155, 83],
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
    if (series.length === 2 && series.every((bars) => bars.length === 3)) {
      const measured = series.flatMap((bars, i) =>
        bars.map((height, j) => ({ height, value: [selected, comparison][i][j] })),
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
  const previousTime = originalEmbed.embeds['moss-demand-tab'].updatedAt
  const restoredTime = restoredEmbed.embeds['moss-demand-tab'].updatedAt
  assert.ok(restoredTime >= previousTime)
  restoredEmbed.embeds['moss-demand-tab'].updatedAt = previousTime
  restoredResource.data = JSON.stringify(restoredEmbed)
  const originalNames = before.host.resources.find((r) => r.name === 'SHEET_DEFINED_NAME_PLUGIN')
  const restoredNames = after.host.resources.find((r) => r.name === 'SHEET_DEFINED_NAME_PLUGIN')
  // DefinedNameDataController parses the initial empty string as {}, registers it,
  // then serializes that empty map as '{}'. Do not normalize populated name maps.
  const emptyNamesCanonicalized = originalNames.data === '' && restoredNames.data === '{}'
  if (emptyNamesCanonicalized) restoredNames.data = ''
  assert.deepEqual(
    after.host,
    before.host,
    'Only embed activation time and the exact empty-name serialization may differ',
  )
  assert.equal(
    await page.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'moss-demand-comparison' }).length),
    1,
  )
  report.checks.push({
    name,
    fullSnapshotsPreservedExceptRecordedMetadata: true,
    previousTime,
    restoredTime,
    emptyNamesCanonicalized,
    chartCount: chart.length,
  })
}
try {
  await page.goto('http://127.0.0.1:4310', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await values([18, 12, 6], [14, 10, 6])
  await painted([18, 12, 6], [14, 10, 6], 'baseline')
  const original = await snapshots()
  const rejected = await page.evaluate(() => {
    const owner = window.univerAPI
    const pair = {
      host: owner.getWorkbook('moss-demand-comparison').save(),
      source: owner.getBase('moss-demand-register').save(),
    }
    return ['host-id', 'source-id', 'sheet', 'table', 'missing-host', 'missing-source'].map((kind) => {
      const saved = structuredClone(pair)
      if (kind === 'host-id') saved.host.id = 'another-workbook'
      if (kind === 'source-id') saved.source.id = 'another-base'
      if (kind === 'sheet') delete saved.host.sheets.comparison
      if (kind === 'table') delete saved.source.tables.demand
      if (kind === 'missing-host') delete saved.host
      if (kind === 'missing-source') delete saved.source
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
        roots: document.querySelectorAll('.moss-embed').length,
      }
    })
  })
  for (const result of rejected) {
    assert.match(result.message, /Restore both original Moss unit IDs/)
    assert.equal(result.sameOwner, true)
    assert.equal(result.roots, 1)
  }
  assert.deepEqual(await snapshots(), original)
  report.checks.push({ rejected })
  await tab('Demand register').click()
  await page.evaluate(examples[10])
  await page.evaluate(() => {
    const api = window.univerAPI
    const base = api.getBase('moss-demand-register')
    const table = base.getTableById('demand')
    table.getRecordById('week-35-email').setValue('requests', 24)
    table.getRecordById('week-35-chat').setValue('topic', 'Saved context: workshop and accessibility support')
    table.getViewById('demand-grid').setFilter({
      conjunction: api.Enum.BaseFilterConjunction.AND,
      conditions: [{ fieldId: 'week', operator: api.Enum.BaseFilterOperator.IS, operand: 'Week 34' }],
    })
  })
  await tab('Demand comparison').click()
  await values([24, 12, 6], [14, 10, 6])
  await page.evaluate(() => {
    const sheet = window.univerAPI.getWorkbook('moss-demand-comparison').getSheetBySheetId('comparison')
    sheet.getRange('D4').setValue('Week 35')
    sheet.getRange('D11').setValue('=B11-C11+7')
    sheet.getCharts()[0].setTitle('Moss / Retained chart configuration')
  })
  await values([24, 12, 6], [24, 12, 6])
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('moss-demand-comparison')
        .getSheetBySheetId('comparison')
        .getRange('D11')
        .getRawValue() === 7,
  )
  await painted([24, 12, 6], [24, 12, 6], 'edited')
  // Dispose with the Base UI active, not only from the easier host-sheet path.
  await tab('Demand register').click()
  await reconstruct('edited-owner')
  await values([24, 12, 6], [24, 12, 6])
  await painted([24, 12, 6], [24, 12, 6], 'restored')
  await tab('Demand register').click()
  assert.equal(
    await page.evaluate(
      () =>
        window.univerAPI
          .getBase('moss-demand-register')
          .getTableById('demand')
          .getViewById('demand-grid')
          .getProjection().rows.length,
    ),
    3,
  )
  await page.evaluate(() =>
    window.univerAPI
      .getBase('moss-demand-register')
      .getTableById('demand')
      .getRecordById('week-35-email')
      .setValue('requests', 28),
  )
  await tab('Demand comparison').click()
  await values([28, 12, 6], [28, 12, 6])
  await painted([28, 12, 6], [28, 12, 6], 'fresh-source-edit')
  const cell = await page.evaluate(() => {
    const data = window.univerAPI.getWorkbook('moss-demand-comparison').save().sheets.comparison
    const canvas = [...document.querySelectorAll('canvas[id^="univer-sheet-main-canvas"]')].find(
      (c) => !c.closest('[data-embed-sheets-sheet-tab-host]'),
    )
    const bounds = canvas.getBoundingClientRect()
    const width = (col) => data.columnData[col]?.w || data.defaultColumnWidth
    const height = (row) => data.rowData[row]?.h || data.defaultRowHeight
    return {
      x:
        bounds.x +
        (data.rowHeader.width + [0, 1, 2].reduce((sum, col) => sum + width(col), 0) + width(3) / 2) * data.zoomRatio,
      y:
        bounds.y +
        (data.columnHeader.height + [0, 1, 2].reduce((sum, row) => sum + height(row), 0) + height(3) / 2) *
          data.zoomRatio,
    }
  })
  await page.mouse.click(cell.x, cell.y)
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('moss-demand-comparison').getActiveRange()?.getA1Notation() === 'D4',
  )
  await page.keyboard.type('Week 34')
  await page.keyboard.press('Enter')
  await values([28, 12, 6], [14, 10, 6])
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('moss-demand-comparison')
        .getSheetBySheetId('comparison')
        .getRange('D11')
        .getRawValue() === 23,
  )
  await painted([28, 12, 6], [14, 10, 6], 'fresh-criterion-edit')
  await page.evaluate(() =>
    window.univerAPI.getFormula().upsertExternalReference({
      unitId: 'moss-demand-comparison',
      qualifier: 'Moss / Reviewed demand register',
      sourceUnitId: 'moss-unavailable-register',
      sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE,
    }),
  )
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('moss-demand-comparison')
        .getSheetBySheetId('comparison')
        .getRange('B7')
        .getRawValue() === '#VALUE!',
  )
  await reconstruct('unavailable-binding')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('moss-demand-comparison')
        .getSheetBySheetId('comparison')
        .getRange('B7')
        .getRawValue() === '#VALUE!',
  )
  await page.evaluate(() =>
    window.univerAPI.getFormula().upsertExternalReference({
      unitId: 'moss-demand-comparison',
      qualifier: 'Moss / Reviewed demand register',
      sourceUnitId: 'moss-demand-register',
      sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE,
    }),
  )
  await values([28, 12, 6], [14, 10, 6])
  await painted([28, 12, 6], [14, 10, 6], 'repaired-after-reload')
  await page.evaluate(() => {
    window.univerAPI.setLocale('zhCN')
    window.univerAPI.toggleDarkMode(true)
  })
  await reconstruct('chinese-dark-owner')
  await values([28, 12, 6], [14, 10, 6])
  await painted([28, 12, 6], [14, 10, 6], 'chinese-dark-restored')
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getWorkbook('moss-demand-comparison').getSheetBySheetId('comparison').getCharts()[0].remove(),
    ),
    true,
  )
  await reconstruct('removed-chart')
  await values([28, 12, 6], [14, 10, 6])
  assert.deepEqual(await chartInfo(), [])
  await page.evaluate(() => window.demo.dispose())
  await root.waitFor({ state: 'detached' })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.models = await snapshots().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, models: undefined }, null, 2))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
