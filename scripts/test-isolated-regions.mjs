/* eslint-disable no-await-in-loop -- Region changes and comparisons are deliberately ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { ITEMS } from '../showcase/embed/multiple-isolated-instances/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const url = process.env.SHOWCASE_DEMO_URL || 'http://127.0.0.1:4256/'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/isolated-regions')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [], writes: [] }
if (process.env.SHOWCASE_EXPORT_MANIFEST) {
  const [entry] = JSON.parse(await fs.readFile(process.env.SHOWCASE_EXPORT_MANIFEST, 'utf8'))
  const source = (await readShowcaseSources()).find((item) => item.slug === entry.slug)
  for (const [name, content] of Object.entries(source.files))
    assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content, name)
  report.sourceFiles = Object.keys(source.files).length
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1000 }, colorScheme: 'light' })
page.setDefaultTimeout(45000)
const frame = (side) => page.frameLocator(`iframe[data-region="${side}"]`)
const root = (side) => frame(side).locator('.isolated-region')
const read = async (side) => JSON.parse(await frame(side).getByLabel('Regional SDK state').textContent())
const ready = (side) => frame(side).locator('.isolated-region[data-ready="true"]').waitFor()
const click = async (side, action) => {
  await root(side).locator(`[data-action="${action}"]`).click()
  await ready(side)
}
const total = (side, price = ITEMS[side][0][2]) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    ITEMS[side].reduce((sum, row, i) => sum + row[1] * (i ? row[2] : price), 0),
  )
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  if (
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method()) &&
    !request.headers()['next-action'] &&
    !new URL(request.url()).pathname.startsWith('/__nextjs_')
  )
    report.writes.push(request.url())
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const initial = {}
  report.themes = {}
  for (const side of ['north', 'south']) {
    await ready(side)
    initial[side] = (await read(side)).snapshot
    assert.equal((await read(side)).price, ITEMS[side][0][2])
    assert.equal(await root(side).locator('.region-controls input').inputValue(), String(ITEMS[side][0][2]))
    assert.equal(await root(side).locator('[data-action="write"]').isDisabled(), true)
    await root(side)
      .getByText(`Total: ${total(side)}`, { exact: true })
      .waitFor()
    await frame(side).locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    report.themes[side] = await frame(side)
      .locator('[data-u-comp="workbench-layout"]')
      .evaluate(async (node) => {
        await document.fonts.ready
        return {
          background: getComputedStyle(node).backgroundColor,
          flex: getComputedStyle(node.querySelector('.univer-flex')).display,
        }
      })
  }
  assert.equal(report.themes.north.background, 'rgb(255, 255, 255)')
  assert.notEqual(report.themes.south.background, report.themes.north.background)
  assert.equal(report.themes.north.flex, 'flex')
  assert.equal(report.themes.south.flex, 'flex')
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('univer-dark')), false)
  assert.notEqual(initial.north.id, initial.south.id)
  await page.screenshot({ path: path.join(directory, 'two-regions.png') })
  await root('north').locator('.region-controls input').fill('25.5')
  await click('north', 'write')
  await root('north')
    .getByText(`Total: ${total('north', 25.5)}`, { exact: true })
    .waitFor()
  const editedNorth = (await read('north')).snapshot
  assert.deepEqual((await read('south')).snapshot, initial.south)
  await root('south').locator('.region-controls input').fill('45.75')
  await click('south', 'write')
  await root('south')
    .getByText(`Total: ${total('south', 45.75)}`, { exact: true })
    .waitFor()
  const downloading = page.waitForEvent('download')
  await click('south', 'download')
  const download = await downloading
  assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), (await read('south')).snapshot)
  await click('south', 'reset')
  assert.deepEqual((await read('south')).snapshot, initial.south)
  assert.deepEqual((await read('north')).snapshot, editedNorth)
  report.checks.push(
    'Distinct regional data, official CSS and independent Grid themes; actual writes/formula totals, full JSON download and region-only exact Reset',
  )
  for (const invalid of ['-1', '100001', '']) {
    await root('north').locator('.region-controls input').fill(invalid)
    await click('north', 'write')
    assert.match((await read('north')).error, /finite number/)
    assert.deepEqual((await read('north')).snapshot, editedNorth)
  }
  const oldCanvas = await frame('north').locator('canvas').first().elementHandle()
  await click('north', 'dispose')
  assert.equal(await oldCanvas.evaluate((node) => node.isConnected), false)
  assert.equal(await frame('north').locator('canvas').count(), 0)
  await click('south', 'select')
  const canvas = frame('south').locator('[data-u-comp="render-canvas"]:not(#univer-doc-main-canvas):visible').first()
  await canvas.dblclick({ position: { x: 366, y: 111 } })
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText('40')
  await page.keyboard.press('Enter')
  await root('south')
    .getByText(`Total: ${total('south', 40)}`, { exact: true })
    .waitFor()
  await page.keyboard.press('Control+z')
  await root('south')
    .getByText(`Total: ${total('south')}`, { exact: true })
    .waitFor()
  await click('north', 'mount')
  assert.deepEqual((await read('north')).snapshot, initial.north)
  report.checks.push(
    'Invalid input preserves all data; North release removes its real canvases while South native editing/Undo remains functional; Mount restores North',
  )
  for (const side of ['north', 'south']) {
    const other = side === 'north' ? 'south' : 'north'
    const opposite = (await read(other)).snapshot
    for (const fixture of ['empty', 'boundary', 'default']) {
      await root(side).locator('select').selectOption(fixture)
      await ready(side)
      const current = await read(side)
      assert.equal(current.fixture, fixture)
      assert.deepEqual((await read(other)).snapshot, opposite)
      if (fixture === 'empty') {
        await root(side).getByText('Total: $0.00', { exact: true }).waitFor()
        assert.equal(await root(side).locator('[data-action="write"]').isDisabled(), true)
      } else if (fixture === 'boundary') {
        assert.equal(current.price, 0)
        assert.equal(current.snapshot.sheets.budget.cellData[4][2].v, 100000)
      } else assert.deepEqual(current.snapshot, initial[side])
    }
  }
  report.checks.push('Empty, boundary and default fixtures in either child preserve the opposite full workbook')
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    const bounds = await page
      .locator('iframe[data-region]')
      .evaluateAll((nodes) =>
        nodes.map((node) => ({ top: node.getBoundingClientRect().top, left: node.getBoundingClientRect().left })),
      )
    assert.equal(bounds[0].left, bounds[1].left)
    assert.ok(bounds[1].top > bounds[0].top)
    assert.ok(
      await root('north')
        .locator('.region-controls')
        .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      'Host controls must fit the child viewport',
    )
    const southBefore = (await read('south')).snapshot
    const value = 20 + width / 100
    await root('north').locator('.region-controls input').fill(String(value))
    await root('north').locator('[data-action="write"]').focus()
    await page.keyboard.press('Enter')
    await ready('north')
    await root('north')
      .getByText(`Total: ${total('north', value)}`, { exact: true })
      .waitFor()
    assert.deepEqual((await read('south')).snapshot, southBefore)
  }
  report.checks.push(
    '760/390/320px stacked frames, fitting host controls and keyboard-activated Facade writes preserve the other region',
  )
  if (new URL(url).pathname.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1000 })
    for (const [locale, title, headings] of [
      ['en-US', 'Multiple Isolated Instances', ['Variants', 'Actions', 'States']],
      ['zh-CN', '多个独立实例', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/embed/multiple-isolated-instances`, {
        waitUntil: 'load',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      const preview = page.frameLocator('iframe').first()
      const north = preview.frameLocator('iframe[data-region="north"]')
      const south = preview.frameLocator('iframe[data-region="south"]')
      for (const child of [north, south]) await child.locator('.isolated-region[data-ready="true"]').waitFor()
      const southBefore = JSON.parse(await south.getByLabel('Regional SDK state').textContent()).snapshot
      await north.locator('.region-controls input').fill('33.25')
      await north.locator('[data-action="write"]').click()
      await north.getByText(`Total: ${total('north', 33.25)}`, { exact: true }).waitFor()
      assert.deepEqual(JSON.parse(await south.getByLabel('Regional SDK state').textContent()).snapshot, southBefore)
      assert.equal(
        await north
          .locator('[data-u-comp="workbench-layout"]')
          .evaluate((node) => getComputedStyle(node).backgroundColor),
        'rgb(255, 255, 255)',
      )
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push(
      'EN/ZH 4/7/4 guides contain working nested regional frames; real North edits and white CSS preserve the complete South snapshot',
    )
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.writes, [])
  report.passed = true
} catch (cause) {
  report.failure = cause.stack || String(cause)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
assert.ok(report.passed, report.failure)
