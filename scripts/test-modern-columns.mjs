/* eslint-disable no-await-in-loop -- Exercise one document in editing-history order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import {
  BOOKINGS,
  CHART_VALUES,
  GROUP_ID,
  TABLE_ID,
  TOOLS_SVG,
} from '../showcase/docs-modern/column-layouts/code/data.ts'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-columns')
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/docs-modern/column-layouts'
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1600, height: 1250 } })
page.setDefaultTimeout(15000)
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
await page.addInitScript(() => {
  window.columnImages = []
  const original = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.drawImage = function (...args) {
    const source = args[0]?.src
    if (source && !window.columnImages.includes(source)) window.columnImages.push(source)
    return original.apply(this, args)
  }
})
const primary = (s) => s.groups.find((g) => g.description.columnGroupId === GROUP_ID)
const semanticGroup = (g) =>
  g && { id: g.description.columnGroupId, gap: g.description.gap, columns: g.description.columns }
const immutable = (s) => ({
  reference: semanticGroup(s.groups.find((g) => g.description.columnGroupId === 'juniper-handoff')),
  charts: s.charts,
})
const semantic = (s) => ({
  groups: s.groups.map(semanticGroup),
  tables: s.tables.map(({ id, values }) => ({ id, values })),
  drawings: s.drawings.map((d) => ({
    id: d.drawingId,
    type: d.drawingType,
    source: d.source,
    size: d.docTransform.size,
  })),
  paragraphs: s.paragraphs,
  charts: s.charts,
})
function assertOwnership(s, tableColumn = 'juniper-column-1', imageColumn = 'juniper-column-0') {
  const group = primary(s),
    table = s.tables.find((t) => t.id === TABLE_ID)
  const tableOwner = group.columns.find((c) => c.id === tableColumn)
  const imageOwner = group.columns.find((c) => c.id === imageColumn)
  assert.ok(tableOwner && imageOwner, 'Both original child owners exist')
  assert.ok(
    table.range.startOffset >= tableOwner.range.startOffset && table.range.endOffset <= tableOwner.range.endOffset,
    'Table structural range stays inside its column',
  )
  const imageBlock = s.blocks.find((block) => block.blockId === 'juniper-toolbox')
  assert.ok(
    imageBlock.startIndex >= imageOwner.range.startOffset && imageBlock.startIndex < imageOwner.range.endOffset,
    'Image anchor stays inside its column',
  )
  const rendered = group.layout[0].columns
  assert.ok(
    rendered.find((c) => c.id === tableColumn).tables.some((t) => t.id === TABLE_ID),
    'Table renders in its owning column',
  )
  assert.ok(
    rendered.find((c) => c.id === imageColumn).drawings.some((d) => d.id === 'juniper-toolbox'),
    'Image renders in its owning column',
  )
  for (const column of group.columns)
    assert.ok(
      column.insertOffset >= column.range.startOffset && column.insertOffset <= column.range.endOffset,
      'Fresh insertion offset remains inside column',
    )
}
try {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const demo = page.locator('.columns-demo'),
    controls = demo.locator('fieldset')
  const ready = () => page.locator('.columns-demo[data-ready=true]').waitFor({ timeout: 90000 })
  await ready()
  const read = async () => JSON.parse(await demo.locator('output').textContent())
  const click = async (name, expectedError = false) => {
    await controls.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.columns-demo fieldset')?.disabled === false)
    assert.equal(
      await demo.locator('[role=alert]').isVisible(),
      expectedError,
      await demo.locator('[role=alert]').textContent(),
    )
    return read()
  }
  const capture = async (name) => {
    await demo.locator('details').evaluate((el) => {
      el.open = false
    })
    await demo.screenshot({ path: path.join(directory, name + '.png') })
  }
  const baseline = await click('Inspect')
  await click('Show layout')
  assert.equal(primary(baseline).description.columnCount, 2)
  assert.deepEqual(
    primary(baseline).description.columns.map((c) => c.widthRatio),
    [2, 1],
  )
  assert.deepEqual(baseline.tables[0].values, BOOKINGS)
  assert.deepEqual(baseline.charts[0].info.dataSource.values, CHART_VALUES)
  assert.equal(
    Buffer.from(
      baseline.drawings.find((d) => d.drawingId === 'juniper-toolbox').source.split(',')[1],
      'base64',
    ).toString(),
    TOOLS_SVG,
  )
  assertOwnership(baseline)
  const initialColumns = primary(baseline).layout[0].columns
  assert.ok(Math.abs(initialColumns[0].width / initialColumns[1].width - 2) < 0.01, 'Rendered initial 2:1 widths')
  await capture('baseline')
  if (observe) {
    const imageState = await click('Inspect')
    assert.equal(
      imageState.drawings.find((d) => d.drawingId === 'juniper-toolbox').hidden,
      true,
      'Observe SDK hiding the nested image despite its layout bounds',
    )
    assert.equal(await page.evaluate(() => window.columnImages.some((s) => s.startsWith('data:image/svg+xml'))), false)
  } else
    await page.waitForFunction(() => window.columnImages.some((s) => s.startsWith('data:image/svg+xml')), null, {
      timeout: 15000,
    })
  await click('Show chart')
  await page.waitForFunction(() => window.columnImages.some((s) => s.startsWith('data:image/png')), null, {
    timeout: 15000,
  })
  await capture('chart')
  await controls.getByRole('textbox', { name: 'Width ratios' }).fill('1,2')
  const resized = await click('Apply ratios')
  assertOwnership(resized)
  assert.deepEqual(
    primary(resized).columns,
    primary(baseline).columns,
    'Changing ratios does not alter IDs, ranges, text or insertion offsets',
  )
  assert.deepEqual(immutable(resized), immutable(baseline))
  const resizedColumns = primary(resized).layout[0].columns
  assert.ok(Math.abs(resizedColumns[1].width / resizedColumns[0].width - 2) < 0.01)
  assert.deepEqual(semantic(await click('Undo')), semantic(baseline))
  assert.deepEqual(semantic(await click('Redo')), semantic(resized))
  const equal = await click('Equal widths')
  assert.ok(Math.abs(primary(equal).layout[0].columns[0].width - primary(equal).layout[0].columns[1].width) < 0.01)
  for (const value of ['', '1', '1,0', '1,-1', '1,Infinity', '1,NaN', '1,,2', '1,2,3']) {
    await controls.getByRole('textbox', { name: 'Width ratios' }).fill(value)
    await click('Apply ratios', true)
    assert.deepEqual(semantic(await read()), semantic(equal))
  }
  await click('Try missing group', true)
  await controls.getByRole('combobox', { name: 'Column', exact: true }).selectOption('juniper-column-0')
  const withNote = await click('Append handoff note')
  assertOwnership(withNote)
  assert.ok(primary(withNote).columns[0].paragraphs.some((p) => p.text.includes('Handoff: ask the coordinator')))
  assert.deepEqual(immutable(withNote), immutable(baseline))
  assert.deepEqual(semantic(await click('Undo')), semantic(equal))
  assert.deepEqual(semantic(await click('Redo')), semantic(withNote))
  const three = await click('Add right')
  assert.deepEqual(
    primary(three).description.columns.map((c) => c.columnId),
    ['juniper-column-0', 'juniper-added-1', 'juniper-column-1'],
  )
  assertOwnership(three)
  await controls.getByRole('combobox', { name: 'Column', exact: true }).selectOption('juniper-added-1')
  const removed = await click('Delete column')
  assert.equal(primary(removed).description.columnCount, 2)
  assertOwnership(removed)
  assert.deepEqual(semantic(await click('Undo')), semantic(three))
  assert.deepEqual(semantic(await click('Redo')), semantic(removed))
  await click('Delete column', true)
  assert.deepEqual(semantic(await click('Reload snapshot')), semantic(removed))
  const absent = await click('Delete group')
  assert.equal(primary(absent), undefined)
  assert.deepEqual(absent.tables, [])
  if (observe) {
    assert.ok(absent.tableResources.includes(TABLE_ID), 'Observe orphan table source retained by SDK')
    assert.equal(
      absent.drawings.some((d) => d.drawingId === 'juniper-toolbox'),
      true,
      'Observe orphan image retained by SDK',
    )
    assert.equal(
      absent.blocks.some((block) => block.blockId === 'juniper-toolbox'),
      false,
      'Image anchor was removed',
    )
  } else
    assert.equal(
      absent.drawings.some((d) => d.drawingId === 'juniper-toolbox'),
      false,
      'Deleting group removes its owned image resource',
    )
  assert.deepEqual(immutable(absent), immutable(baseline))
  assert.deepEqual(semantic(await click('Undo')), semantic(removed))
  await click('Delete group')
  const reinserted = await click('Insert column group')
  assert.deepEqual(semantic(await click('Insert column group')), semantic(reinserted))
  await click('Insert booking table', observe)
  await click('Insert toolbox image', observe)
  const restored = await read()
  if (observe)
    assert.equal(
      restored.blocks.some((block) => block.blockId === 'juniper-toolbox'),
      false,
      'No false image insertion success for an orphan resource',
    )
  else assertOwnership(restored)
  assert.deepEqual(semantic(await click('Insert booking table', observe)), semantic(restored))
  assert.deepEqual(semantic(await click('Insert toolbox image', observe)), semantic(restored))
  for (const count of [2, 3, 4, 5]) {
    await controls.getByRole('combobox', { name: 'Layout', exact: true }).selectOption(String(count))
    const loaded = await click('Load layout')
    assert.equal(primary(loaded).description.columnCount, count)
    assertOwnership(loaded, 'juniper-column-' + (count - 1))
    assert.deepEqual(immutable(loaded), immutable(baseline))
    assert.deepEqual(semantic(await click('Reload snapshot')), semantic(loaded))
    await click('Show layout')
    await capture('columns-' + count)
  }
  await click('Add left', true)
  await click('Add right', true)
  await click('Reset')
  await controls.getByRole('combobox', { name: 'Column', exact: true }).selectOption('juniper-column-1')
  const leftAdded = await click('Add left')
  assert.equal(primary(leftAdded).description.columns[1].columnId, 'juniper-added-1')
  assertOwnership(leftAdded)
  await click('Reset')
  await click('Select column heading')
  assert.equal(await controls.getByRole('combobox', { name: 'Column', exact: true }).inputValue(), 'juniper-column-0')
  await page.keyboard.type('Visitor welcome', { delay: 25 })
  const native = await click('Inspect')
  assert.equal(primary(native).columns[0].paragraphs[0].text, 'Visitor welcome')
  assertOwnership(native)
  assert.deepEqual(semantic(await click('Reload snapshot')), semantic(native))
  const empty = await click('Empty document')
  assert.deepEqual([empty.groups, empty.tables, empty.drawings, empty.charts], [[], [], [], []])
  await click('Insert column group', true)
  await click('Insert booking table', true)
  assert.deepEqual(semantic(await click('Reset')), semantic(baseline))
  if (!process.env.SHOWCASE_DEMO_URL) {
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator('.columns-demo[data-theme=' + theme + '][data-ready=true]').waitFor()
      await capture(theme)
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok((await click('Inspect')).zoomRatio < 1)
  assert.ok(
    await demo.evaluate(
      (el) => el.scrollWidth <= el.clientWidth + 1 && el.getBoundingClientRect().width <= window.innerWidth,
    ),
  )
  await demo.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await capture('narrow')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready()
  assert.deepEqual(semantic(await click('Inspect')), semantic(baseline))
  assert.equal(await demo.locator('.columns-editor canvas').count(), 1)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(
      {
        status: observe ? 'passed-with-known-sdk-defect' : 'passed',
        url,
        checks:
          '2–5 columns; actual 2:1 and 1:2 geometry; stable child ownership and fresh offsets; table/chart rendering; disclosed nested image rendering failure; insertion/deletion; strict history; native text; reference isolation; invalid input; empty/reset; roundtrip; theme/narrow/remount',
        knownDefects: observe
          ? [
              'Nested inline image has a real column anchor and layout bounds but SDK marks its drawing hidden and never paints it.',
              'Deleting its column group removes the anchor but retains the image resource. The host reports an orphan rather than claiming reinsertion succeeded.',
            ]
          : [],
      },
      null,
      2,
    ),
  )
  console.log('PASS column interactions; nested image rendering remains a strict requirement')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true, timeout: 5000 }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      {
        error: String(error.stack),
        errors,
        readback: await page
          .locator('.columns-demo output')
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
