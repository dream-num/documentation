/* eslint-disable no-await-in-loop -- One board is exercised sequentially to verify query history. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/boards-query')
const url =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/boards/search-element-query`
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch({ executablePath: chromium.executablePath() })
const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } })
await page.emulateMedia({ colorScheme: 'light' })
const errors = []
page.on('pageerror', (error) => errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const riskIds = ['supply', 'review-a', 'compliance']
const close = (a, b, label) => assert.ok(Math.abs(a - b) < 0.02, `${label}: ${a} != ${b}`)
const bounds = (state, id) => state.elements.find((element) => element.id === id).bounds
const rectEqual = (a, b, label) => {
  for (const key of ['left', 'top', 'width', 'height']) close(a[key], b[key], `${label}: ${key}`)
}
const union = (rectangles) => {
  const left = Math.min(...rectangles.map((r) => r.left))
  const top = Math.min(...rectangles.map((r) => r.top))
  return {
    left,
    top,
    width: Math.max(...rectangles.map((r) => r.left + r.width)) - left,
    height: Math.max(...rectangles.map((r) => r.top + r.height)) - top,
  }
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const demo = page.locator('.query-demo')
  await page.locator('.query-demo[data-ready="true"]').waitFor({ timeout: 90000 })
  const controls = demo.locator('fieldset')
  const input = controls.getByRole('textbox', { name: 'Search text' })
  const type = controls.getByRole('combobox', { name: 'Element type' })
  const read = async () => JSON.parse(await demo.locator('output').textContent())
  const idle = () => page.waitForFunction(() => document.querySelector('.query-demo fieldset')?.disabled === false)
  const click = async (name, expectedError = false) => {
    await controls.getByRole('button', { name, exact: true }).click()
    await idle()
    assert.equal(
      await demo.locator('[role="alert"]').isVisible(),
      expectedError,
      await demo.locator('[role="alert"]').textContent(),
    )
    return read()
  }
  const search = async (term, kind = 'shape') => {
    await input.fill(term)
    await type.selectOption(kind)
    return click('Search')
  }
  const screenshot = (name) => demo.screenshot({ path: path.join(directory, `${name}.png`) })
  const rendered = (state) => {
    for (const [id, actual] of Object.entries(state.rendered)) {
      assert.ok(actual, `${id}: render object exists`)
      rectEqual(actual, bounds(state, id), `${id}: render/model parity`)
    }
  }
  const baseline = await read()
  assert.equal(baseline.elements.filter((e) => e.type === 'shape').length, 8)
  assert.equal(baseline.elements.filter((e) => e.type === 'connector').length, 12)
  assert.equal(baseline.elements.filter((e) => e.type === 'connector' && !e.endElementId).length, 1)
  assert.deepEqual(baseline.query.ids, riskIds)
  assert.equal(baseline.query.hits.length, 3)
  rectEqual(baseline.query.bounds, { left: 310, top: 60, width: 750, height: 320 }, 'Known fixture union')
  assert.deepEqual(baseline.selection.selectedIds, [])
  assert.deepEqual(baseline.missing, { 'missing-element': null })
  rendered(baseline)
  await screenshot('risk-shapes')
  for (const term of ['risk', '  RISK  ', 'isk']) assert.deepEqual((await search(term)).query.ids, riskIds)
  await input.fill('Risk')
  await input.press('Enter')
  await idle()
  assert.deepEqual((await read()).query.ids, riskIds, 'Keyboard submit')

  const all = await search('Risk', 'all')
  assert.equal(all.query.hits.length, 5)
  assert.deepEqual(all.query.ids, ['route-3', ...riskIds])
  assert.equal(all.query.hits.filter((hit) => hit.elementId === 'route-3').length, 2)
  assert.equal(
    all.query.hits.some((hit) => hit.kind === 'connector-label'),
    true,
  )
  rectEqual(all.query.bounds, union(all.query.ids.map((id) => bounds(all, id))), 'All-type result union')
  assert.equal(await demo.locator('.query-results button').count(), 4)
  const selectedAll = await click('Select results')
  assert.deepEqual(selectedAll.selection.selectedIds, all.query.ids, 'Deduplicated real SDK selection')
  await screenshot('all-types-selected')
  await click('Clear selection')
  assert.deepEqual((await read()).selection.selectedIds, [])
  const label = await search('Approved', 'connector')
  assert.deepEqual(label.query.ids, ['route-4'])
  assert.equal(label.query.hits[0].kind, 'connector-label')
  rectEqual(label.query.bounds, bounds(label, 'route-4'), 'Connector-label union')
  assert.deepEqual((await search('Approved', 'shape')).query.ids, [])

  for (const [kind, count] of [
    ['shape', 8],
    ['connector', 12],
    ['all', 20],
  ]) {
    await type.selectOption(kind)
    await input.fill('ignored text')
    const listed = await click('List by type')
    assert.equal(listed.query.mode, 'type')
    assert.equal(listed.query.ids.length, count)
    rectEqual(listed.query.bounds, union(listed.query.ids.map((id) => bounds(listed, id))), `${kind}: query bounds`)
  }
  await click('Reset')
  const selected = await click('Select results')
  assert.deepEqual(selected.selection.selectedIds, riskIds)
  await page.keyboard.press('ArrowRight')
  const moved = await click('Refresh query')
  for (const element of baseline.elements.filter((e) => e.type === 'shape')) {
    close(
      bounds(moved, element.id).left,
      element.bounds.left + (riskIds.includes(element.id) ? 1 : 0),
      `${element.id}: native selection move`,
    )
  }
  rectEqual(moved.query.bounds, { left: 311, top: 60, width: 750, height: 320 }, 'Moved union')
  rendered(moved)
  await click('Undo')
  rectEqual((await read()).query.bounds, baseline.query.bounds, 'Move Undo')
  await demo.locator('.query-results button[data-element="compliance"]').click()
  await idle()
  const focused = await read()
  assert.deepEqual(focused.selection.selectedIds, ['compliance'])
  assert.equal(focused.selection.focusedId, 'compliance')
  await screenshot('focused-result')

  await click('Reset')
  const resolved = await click('Resolve supplier risk')
  assert.deepEqual(resolved.query.ids, ['review-a', 'compliance'])
  assert.match(resolved.elements.find((e) => e.id === 'supply').text, /Supplier cleared/)
  rectEqual(resolved.query.bounds, { left: 600, top: 70, width: 460, height: 310 }, 'Resolved union')
  assert.deepEqual((await click('Undo')).query.ids, riskIds)
  assert.deepEqual((await click('Redo')).query.ids, ['review-a', 'compliance'])
  await screenshot('resolved-query')
  await click('Reset')
  await click('Select results')
  const beforeInvalid = await read()
  await click('Try missing ID', true)
  const afterInvalid = await click('Refresh query')
  assert.deepEqual(afterInvalid.elements, beforeInvalid.elements)
  assert.deepEqual(afterInvalid.selection.selectedIds, beforeInvalid.selection.selectedIds)
  for (const term of ['', '   ', 'no-such-review', '<img src=x onerror=alert(1)>']) {
    const empty = await search(term)
    assert.deepEqual(empty.query.ids, [])
    assert.equal(empty.query.bounds, null)
    assert.equal(await demo.locator('.query-results img').count(), 0)
    assert.deepEqual((await click('Select results')).selection.selectedIds, [])
  }
  await screenshot('no-matches')
  const emptyBoard = await click('Empty board')
  assert.deepEqual(emptyBoard.elements, [])
  assert.equal(emptyBoard.query.bounds, null)
  assert.deepEqual((await click('List by type')).query.ids, [])
  await click('Resolve supplier risk', true)
  await click('Reset')
  assert.deepEqual((await read()).elements, baseline.elements)
  assert.deepEqual((await read()).query, baseline.query)
  if (url.includes('/playground/')) {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.locator('.query-demo[data-theme="dark"][data-ready="true"]').waitFor()
    assert.equal(await page.locator('.query-editor canvas').count(), 1)
    assert.deepEqual((await read()).query, baseline.query)
    assert.equal(await demo.evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(16, 24, 40)')
    await screenshot('dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await page.locator('.query-demo[data-theme="light"][data-ready="true"]').waitFor()
  }
  await page.setViewportSize({ width: 375, height: 900 })
  await click('Fit content')
  assert.equal(await demo.evaluate((e) => e.scrollWidth <= e.clientWidth), true)
  assert.ok((await demo.locator('canvas').first().boundingBox()).height >= 258)
  await controls.getByRole('button', { name: 'Reset', exact: true }).scrollIntoViewIfNeeded()
  await screenshot('narrow')
  await demo.locator('.query-editor').scrollIntoViewIfNeeded()
  const narrowEditor = await demo.locator('.query-editor').boundingBox()
  const narrowDemo = await demo.boundingBox()
  assert.ok(narrowEditor.y >= narrowDemo.y - 1, 'Canvas can be scrolled fully into view')
  assert.ok(narrowEditor.y + narrowEditor.height <= narrowDemo.y + narrowDemo.height + 1)
  await screenshot('narrow-canvas')
  await page.setViewportSize({ width: 1600, height: 1050 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.query-demo[data-ready="true"]').waitFor()
  assert.equal(await page.locator('.query-editor canvas').count(), 1)
  assert.deepEqual((await read()).query, baseline.query)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'result.json'),
    JSON.stringify(
      {
        passed: true,
        url,
        checks:
          'SDK text/label search, case/whitespace/substring, type filtering, duplicate-hit selection, exact union bounds, actual native selection movement, focus, text edit Undo/Redo, blank/missing/empty/reset, renderer parity, keyboard submit, theme/narrow/remount, browser errors',
      },
      null,
      2,
    ),
  )
  console.log('PASS Boards search and element query')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'result.json'),
    JSON.stringify({ passed: false, url, error: String(error), errors }, null, 2),
  )
  throw error
} finally {
  await browser.close()
}
