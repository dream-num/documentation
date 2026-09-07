/* eslint-disable no-await-in-loop -- Verify one live SDK table in history order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import {
  COLLECTION,
  COMPARISON,
  NARRATIVE,
  PACKAGING_SVG,
  OWNER_ROW,
  SAMPLES,
} from '../showcase/docs-modern/document-tables/code/data.ts'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-tables')
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/docs-modern/document-tables'
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1250 } })
page.setDefaultTimeout(15000)
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
await page.addInitScript(() => {
  window.tablePaint = []
  window.tableImages = []
  const drawImage = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.drawImage = function (...args) {
    const source = args[0]?.src
    if (source && !window.tableImages.includes(source)) window.tableImages.push(source)
    return drawImage.apply(this, args)
  }
  for (const method of ['fill', 'fillRect']) {
    const original = CanvasRenderingContext2D.prototype[method]
    CanvasRenderingContext2D.prototype[method] = function (...args) {
      if (window.tablePaint.length < 20000) window.tablePaint.push(String(this.fillStyle).toLowerCase())
      return original.apply(this, args)
    }
  }
})
const primary = (s) => s.tables.find((t) => t.description.id === 'cedar-decisions')
const reference = (s) => s.tables.find((t) => t.description.id === 'cedar-comparison')
const tableSemantic = (t) => t && { description: t.description, source: t.source, values: t.values }
const mixedSemantic = (s) => ({
  columns: s.columns.map((g) => ({ columns: g.description.columns, gap: g.description.gap })),
  charts: s.charts,
  drawings: s.drawings.map((d) => ({
    id: d.drawingId,
    type: d.drawingType,
    source: d.source,
    title: d.title,
    description: d.description,
    size: d.docTransform.size,
    layout: d.layoutType,
  })),
})
const semantic = (s) => ({ tables: s.tables.map(tableSemantic), paragraphs: s.paragraphs, mixed: mixedSemantic(s) })
try {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const demo = page.locator('.table-demo')
  const ready = () => page.locator('.table-demo[data-ready="true"]').waitFor({ timeout: 90000 })
  await ready()
  const controls = demo.locator('fieldset')
  const read = async () => JSON.parse(await demo.locator('output').textContent())
  const click = async (name, expectedError = false) => {
    if (name !== 'Inspect')
      await page.evaluate(() => {
        window.tablePaint = []
      })
    await controls.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.table-demo fieldset')?.disabled === false)
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    assert.equal(
      await demo.locator('[role="alert"]').isVisible(),
      expectedError,
      await demo.locator('[role="alert"]').textContent(),
    )
    return read()
  }
  const fill = (name, value) => controls.getByRole('spinbutton', { name, exact: true }).fill(String(value))
  const capture = async (name) => {
    await demo.locator('details').evaluate((el) => {
      el.open = false
    })
    await demo.screenshot({ path: path.join(directory, name + '.png') })
  }
  const baseline = await click('Inspect')
  assert.deepEqual(primary(baseline).values, SAMPLES[0].rows)
  assert.deepEqual(reference(baseline).values, COMPARISON)
  assert.equal(baseline.columns.length, 1)
  assert.deepEqual(
    baseline.columns[0].description.columns.map((c) => c.text),
    NARRATIVE.map((text) => text.replaceAll('\r', '\n')),
  )
  const narrativeLayout = baseline.columns[0].layout[0].columns
  assert.equal(narrativeLayout.length, 2)
  assert.ok(narrativeLayout.every((c) => c.width > 250 && c.height > 30))
  assert.ok(narrativeLayout[1].left >= narrativeLayout[0].width + 23.9, 'Real side-by-side columns with 24pt gap')
  assert.equal(narrativeLayout[0].top, narrativeLayout[1].top)
  assert.deepEqual(baseline.charts[0].info.dataSource.values, COLLECTION.packing)
  assert.equal(baseline.charts[0].info.config.type, 'column')
  const illustration = baseline.drawings.find((d) => d.drawingId === 'cedar-packaging-image')
  assert.equal(Buffer.from(illustration.source.split(',')[1], 'base64').toString(), PACKAGING_SVG)
  assert.deepEqual(
    baseline.drawingLayout.map((d) => [d.id, d.width, d.height]),
    [
      ['cedar-packaging-image', 640, 200],
      ['cedar-collection-drawing', 640, 280],
    ],
  )
  assert.equal(primary(baseline).description.headerRowCount, 1)
  assert.ok(primary(baseline).source.tableRows[0].tableCells.every((c) => c.backgroundColor.rgb === '#DBEAFE'))
  assert.ok(await page.evaluate(() => window.tablePaint.includes('#dbeafe')), 'Actual header background paint')
  assert.deepEqual(
    primary(baseline).layout[0].rows[0].cells.map((c) => c.width),
    [220, 140, 120, 220],
  )
  await capture('baseline')
  await click('Show comparison')
  await capture('narrative-columns')
  await click('Show image')
  await page.waitForFunction(() => window.tableImages.some((s) => s.startsWith('data:image/svg+xml')), null, {
    timeout: 15000,
  })
  await capture('mixed-image')
  await click('Show chart')
  await page.waitForFunction(() => window.tableImages.some((s) => s.startsWith('data:image/png')), null, {
    timeout: 15000,
  })
  await capture('mixed-chart')
  await click('Reset')
  await controls.getByRole('textbox', { name: 'Cell text', exact: true }).fill('Mara Chen — coordinator')
  const edited = await click('Set cell text')
  assert.equal(primary(edited).values[1][1], 'Mara Chen — coordinator')
  assert.deepEqual(tableSemantic(reference(edited)), tableSemantic(reference(baseline)))
  assert.deepEqual(
    mixedSemantic(edited),
    mixedSemantic(baseline),
    'Cell edits preserve image, chart and narrative content',
  )
  if (observe) assert.deepEqual(semantic(await click('Undo', true)), semantic(edited), 'Observe failed cell-edit Undo')
  else {
    assert.deepEqual(semantic(await click('Undo')), semantic(baseline))
    assert.deepEqual(semantic(await click('Redo')), semantic(edited))
  }
  await controls.getByRole('textbox', { name: 'Cell text', exact: true }).fill('')
  assert.equal(primary(await click('Set cell text')).values[1][1], '')
  if (observe) {
    await click('Undo', true)
    await controls.getByRole('textbox', { name: 'Cell text', exact: true }).fill('Mara Chen — coordinator')
    await click('Set cell text')
  } else await click('Undo')
  await click('Read cell')
  assert.equal(
    await controls.getByRole('textbox', { name: 'Cell text', exact: true }).inputValue(),
    'Mara Chen — coordinator',
  )
  const owner = await click('Add owner row')
  assert.deepEqual(primary(owner).values.at(-1), OWNER_ROW)
  assert.equal(primary(owner).description.rowCount, 5)
  assert.deepEqual(semantic(await click('Add owner row')), semantic(owner))
  const deleted = await click('Delete body row')
  assert.equal(primary(deleted).description.rowCount, 4)
  assert.deepEqual(semantic(await click('Undo')), semantic(owner))
  await fill('Row', 1)
  await fill('Column', 1)
  const resized = await click('Set column width')
  assert.equal(primary(resized).source.tableColumns[1].size.width.v, 180)
  assert.equal(primary(resized).layout[0].rows[0].cells[1].width, 180, 'Actual rendered column width')
  const taller = await click('Set row height')
  assert.equal(primary(taller).source.tableRows[1].trHeight.val.v, 72)
  assert.ok(primary(taller).layout[0].rows[1].height >= 72, 'Actual rendered minimum row height')
  await controls.locator('[aria-label="Header fill"]').fill('#fef3c7')
  const styled = await click('Style header')
  assert.ok(
    primary(styled).source.tableRows[0].tableCells.every((c) => c.backgroundColor.rgb.toLowerCase() === '#fef3c7'),
  )
  assert.ok(await page.evaluate(() => window.tablePaint.includes('#fef3c7')), 'Changed header color actually paints')
  assert.deepEqual(tableSemantic(reference(styled)), tableSemantic(reference(baseline)))
  const distributed = await click('Distribute columns')
  const widths = primary(distributed).layout[0].rows[0].cells.map((c) => c.width)
  assert.ok(widths.every((w) => Math.abs(w - widths[0]) < 0.01))
  for (const [input, button, value] of [
    ['Row', 'Set cell text', '-1'],
    ['Row', 'Set cell text', '99'],
    ['Column', 'Set cell text', '9'],
    ['Column', 'Set cell text', '1.5'],
    ['Column width', 'Set column width', '0'],
    ['Column width', 'Set column width', '361'],
    ['Row height', 'Set row height', ''],
    ['Row height', 'Set row height', '161'],
  ]) {
    await fill('Row', 1)
    await fill('Column', 1)
    await fill('Column width', 180)
    await fill('Row height', 72)
    await fill(input, value)
    await click(button, true)
    assert.deepEqual(semantic(await read()), semantic(distributed))
  }
  await fill('Row', 0)
  await fill('Column', 0)
  await click('Delete body row', true)
  await click('Try missing table', true)
  assert.deepEqual(semantic(await read()), semantic(distributed))
  assert.deepEqual(semantic(await click('Reload snapshot')), semantic(distributed))
  const absent = await click('Delete decision table')
  assert.equal(absent.tables.length, 1)
  assert.deepEqual(tableSemantic(reference(absent)), tableSemantic(reference(baseline)))
  await click('Undo')
  assert.deepEqual(semantic(await read()), semantic(distributed))
  await click('Delete decision table')
  const reinserted = await click('Insert decision table')
  assert.deepEqual(primary(reinserted).values, SAMPLES[0].rows)
  assert.deepEqual(semantic(await click('Insert decision table')), semantic(reinserted))
  for (const sample of SAMPLES) {
    await controls.getByRole('combobox', { name: 'Dataset', exact: true }).selectOption(sample.id)
    const loaded = await click('Load dataset')
    assert.deepEqual(primary(loaded).values, sample.rows)
    assert.deepEqual(reference(loaded).values, COMPARISON)
    assert.deepEqual(loaded.charts[0].info.dataSource.values, COLLECTION[sample.id])
    assert.deepEqual(loaded.columns[0].description.columns, baseline.columns[0].description.columns)
    assert.deepEqual(semantic(await click('Reload snapshot')), semantic(loaded))
    await capture(sample.id)
  }
  await click('Reset')
  await click('Select cell text')
  await page.keyboard.type('Native owner', { delay: 30 })
  const native = await click('Inspect')
  assert.equal(primary(native).values[1][1], 'Native owner')
  assert.deepEqual(tableSemantic(reference(native)), tableSemantic(reference(baseline)))
  assert.deepEqual(semantic(await click('Reload snapshot')), semantic(native))
  const empty = await click('Empty document')
  assert.deepEqual(empty.tables, [])
  assert.deepEqual(empty.columns, [])
  assert.deepEqual(empty.charts, [])
  assert.deepEqual(empty.drawings, [])
  await click('Insert decision table', true)
  await click('Set cell text', true)
  assert.deepEqual(semantic(await click('Reset')), semantic(baseline))
  if (!process.env.SHOWCASE_DEMO_URL) {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.locator('.table-demo[data-theme="dark"][data-ready="true"]').waitFor()
    await capture('dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await page.locator('.table-demo[data-theme="light"][data-ready="true"]').waitFor()
  }
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok((await click('Inspect')).zoomRatio < 1)
  assert.ok(await demo.evaluate((el) => el.scrollWidth <= el.clientWidth + 1))
  assert.ok(
    await demo.evaluate((el) => el.getBoundingClientRect().width <= window.innerWidth),
    'Preview grid must not expand to intrinsic canvas or source width after theme remount',
  )
  await demo.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await capture('narrow')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready()
  assert.deepEqual(semantic(await click('Inspect')), semantic(baseline))
  assert.equal(await demo.locator('.table-editor canvas').count(), 1)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(
      {
        status: observe ? 'passed-with-known-sdk-defect' : 'passed-table-interactions',
        url,
        checks:
          'Three distinct table and chart matrices; real narrative column geometry; original inline image and real chart paint; mixed-content preservation; real cell text editing with disclosed Undo failure; empty cells; idempotent owner row; deletion/history; rendered width and height; actual header paint; independent comparison; roundtrip; native typing; invalid inputs; empty/reset; theme/narrow/remount',
        knownDefects: observe
          ? ['Facade cell text edits do not undo; strict SDK-only and default browser gates fail.']
          : [],
        remaining: 'Facade cell-text Undo must pass the strict gate before full blueprint acceptance.',
      },
      null,
      2,
    ),
  )
  console.log('PASS mixed-content document table interactions; strict cell Undo remains separate')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true, timeout: 5000 }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      {
        error: String(error.stack),
        errors,
        readback: await page
          .locator('.table-demo output')
          .textContent({ timeout: 1000 })
          .catch(() => null),
        paint: await page.evaluate(() => window.tablePaint?.slice(-50)).catch(() => null),
      },
      null,
      2,
    ),
  )
  throw error
} finally {
  await browser.close()
}
