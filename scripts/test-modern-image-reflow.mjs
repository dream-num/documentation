/* eslint-disable no-await-in-loop -- Resize one live document and verify its history. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { ALT_TEXT, IMAGE_ID } from '../showcase/docs-modern/images-and-wrapping/code/data.ts'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-image-reflow')
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/docs-modern/images-and-wrapping'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1600, height: 1400 } })
page.setDefaultTimeout(15000)
const errors = [],
  results = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const image = (s) => s.images.find((i) => i.id === IMAGE_ID)
const content = (s) => ({
  paragraphs: s.paragraphs,
  groups: s.groups,
  tables: s.tables.map((t) => ({ id: t.id, values: t.values })),
  charts: s.charts.map((c) => ({ id: c.id, values: c.info.dataSource.values })),
})
const group = (s) => s.layout.flatMap((p) => p.groups).find((g) => g.id === 'kestrel-methods')
const briefingLines = (s) => {
  const range = s.paragraphs.find((p) => p.text.includes('The orange recorder')).range
  return s.layout
    .flatMap((p) => p.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)))
    .filter((line) => line.divides.some((d) => d.end >= range.startOffset && d.start < range.endOffset))
    .map((line) => line.divides.map(({ start, end }) => ({ start, end })))
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const demo = page.locator('.images-demo'),
    controls = demo.locator('fieldset')
  await page.locator('.images-demo[data-ready=true]').waitFor({ timeout: 90000 })
  const read = async () => JSON.parse(await demo.locator('output').textContent())
  const click = async (name) => {
    await controls.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.images-demo fieldset')?.disabled === false)
    assert.equal(
      await demo.locator('[role=alert]').isVisible(),
      false,
      await demo.locator('[role=alert]').textContent(),
    )
    return read()
  }
  const capture = async (name) => {
    await demo.screenshot({ path: path.join(directory, name + '.png') })
  }
  const baseline = await click('Inspect'),
    originalContent = content(baseline)
  assert.equal(baseline.viewport.pageWidth, 820)
  assert.equal(baseline.viewport.viewScale, 1)
  assert.equal(group(baseline).columns[0].top, group(baseline).columns[1].top)
  assert.ok(group(baseline).columns[1].left > group(baseline).columns[0].left)
  await click('Set alt text')
  const unitId = image(await read()).data.unitId
  let previous = baseline
  for (const width of [760, 520, 390, 320]) {
    await page.setViewportSize({ width, height: 1400 })
    await page.waitForTimeout(300)
    const state = await click('Inspect')
    assert.equal(state.viewport.mode, 'reflow')
    assert.equal(state.viewport.viewScale, 1, 'Reflow must not secretly shrink glyphs by zoom')
    assert.equal(state.viewport.pageWidth, Math.min(820, Math.max(240, Math.floor(state.viewport.containerWidth) - 8)))
    assert.ok(state.viewport.pageWidth < previous.viewport.pageWidth)
    assert.deepEqual(content(state), originalContent, 'Viewport changes preserve text, IDs and business data')
    assert.equal(image(state).data.unitId, unitId, 'Resize must not recreate the document')
    assert.deepEqual(image(state).size, image(baseline).size, 'Explicit user image dimensions stay intact')
    assert.equal(image(state).data.description, ALT_TEXT)
    const available = state.viewport.pageWidth - 2 * 66.66666666666667
    const columns = group(state).columns
    if (available < 456) {
      assert.equal(columns[0].left, columns[1].left)
      assert.ok(columns[1].top >= columns[0].top + columns[0].height, 'Native columns stack vertically')
      assert.ok(columns.every((c) => c.width <= available + 0.1))
    }
    const table = state.layout.flatMap((p) => p.tables).find((t) => t.id === 'kestrel-schedule')
    const chart = state.layout.flatMap((p) => p.drawings).find((d) => d.id === 'kestrel-chart')
    assert.ok(table.width <= available + 0.1, 'Actual table fits the new text width')
    assert.ok(chart.width <= available + 0.1, 'Actual chart fits the new text width')
    assert.equal(chart.height, 240)
    assert.ok(
      briefingLines(state).length > briefingLines(baseline).length,
      'Text actually gains lines at narrower widths',
    )
    const demoBox = await demo.boundingBox(),
      editorBox = await demo.locator('.images-editor').boundingBox()
    assert.ok(
      Math.min(demoBox.y + demoBox.height, editorBox.y + editorBox.height) - Math.max(demoBox.y, editorBox.y) >= 250,
      'At least 250 pixels of editor remain visible; controls cannot occupy the entire demo',
    )
    await click('Show image')
    await capture('reflow-' + width)
    await click('Show chart')
    await capture('chart-' + width)
    results.push({
      width,
      viewport: state.viewport,
      group: group(state),
      table,
      chart,
      briefingLines: briefingLines(state).length,
    })
    previous = state
  }
  assert.equal(
    image(await click('Undo')).data.description,
    '',
    'Window resize does not consume or clear image-edit history',
  )
  assert.equal(image(await click('Redo')).data.description, ALT_TEXT)
  const reloaded = await click('Reload snapshot')
  assert.deepEqual(content(reloaded), originalContent)
  assert.equal(reloaded.viewport.pageWidth, previous.viewport.pageWidth)
  await controls.getByRole('combobox', { name: 'Document layout', exact: true }).selectOption('fixed')
  await page.waitForTimeout(300)
  const fixed = await click('Inspect')
  assert.equal(fixed.viewport.mode, 'fixed')
  assert.equal(fixed.viewport.pageWidth, 820)
  assert.ok(fixed.viewport.viewScale < 0.5, 'Fixed layout scales down instead of reflowing')
  assert.deepEqual(briefingLines(fixed), briefingLines(baseline))
  assert.equal(group(fixed).columns[0].top, group(fixed).columns[1].top)
  await capture('fixed-320')
  await controls.getByRole('combobox', { name: 'Document layout', exact: true }).selectOption('reflow')
  await page.waitForTimeout(300)
  const returned = await click('Inspect')
  assert.equal(returned.viewport.viewScale, 1)
  assert.deepEqual(briefingLines(returned), briefingLines(previous))
  await page.setViewportSize({ width: 1600, height: 1400 })
  await page.waitForTimeout(300)
  const wide = await click('Inspect')
  assert.deepEqual(content(wide), originalContent)
  assert.deepEqual(briefingLines(wide), briefingLines(baseline))
  assert.equal(group(wide).columns[0].top, group(wide).columns[1].top)
  assert.equal(wide.layout.flatMap((p) => p.tables).find((t) => t.id === 'kestrel-schedule').width, 520)
  assert.equal(wide.layout.flatMap((p) => p.drawings).find((d) => d.id === 'kestrel-chart').width, 560)
  await capture('restored-wide')
  await click('Empty document')
  await page.setViewportSize({ width: 390, height: 1400 })
  await page.waitForTimeout(300)
  const empty = await click('Inspect')
  assert.equal(empty.images.length, 0)
  assert.equal(empty.groups.length, 0)
  assert.equal(empty.tables.length, 0)
  const reset = await click('Reset')
  assert.deepEqual(content(reset), originalContent)
  assert.equal(reset.viewport.mode, 'reflow')
  assert.equal(reset.viewport.viewScale, 1)
  assert.equal(await demo.locator('.images-editor canvas').count(), 1)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: 'passed', url, results, errors }, null, 2),
  )
  console.log(
    'PASS true text reflow, native column stacking, table/chart widths, fixed-zoom comparison and history across resize',
  )
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      {
        message: error.stack,
        errors,
        results,
        readback: await page
          .locator('.images-demo output')
          .textContent({ timeout: 1000 })
          .catch(() => null),
      },
      null,
      2,
    ),
  )
  throw error
} finally {
  await browser.close()
}
