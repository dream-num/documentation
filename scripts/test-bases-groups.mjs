/* eslint-disable no-await-in-loop -- Check ordered mutations on the same live Base. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/bases/group-records'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/bases-groups')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1600, height: 1300 }, colorScheme: 'light' })
const failures = [],
  errors = [],
  results = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
await page.addInitScript(() => {
  globalThis.__groupPaint = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
    const rect = this.canvas.getBoundingClientRect()
    globalThis.__groupPaint.push({
      text: String(args[0]),
      x: rect.x + (point.x * rect.width) / this.canvas.width,
      y: rect.y + (point.y * rect.height) / this.canvas.height,
    })
    return Reflect.apply(original, this, args)
  }
})
const check = (name, action) => {
  try {
    action()
  } catch (error) {
    failures.push({ name, message: error.message })
  }
}
const topTotals = (state) =>
  Object.fromEntries(
    state.totals
      .filter((g) => g.level === 0)
      .map((g) => [g.key, { count: g.count, numericCount: g.numericCount, subtotal: g.subtotal }]),
  )
const expectedTotals = {
  '': { count: 7, numericCount: 6, subtotal: 276 },
  Done: { count: 21, numericCount: 19, subtotal: 5257 },
  Inspecting: { count: 21, numericCount: 18, subtotal: 5214 },
  Queued: { count: 21, numericCount: 19, subtotal: 4549 },
  Repair: { count: 20, numericCount: 18, subtotal: 3784 },
}
function verifyGroups(state) {
  const source = new Map(state.sourceValues.map((r) => [r.id, r.values]))
  const visit = (groups, candidates, level) => {
    const field = state.rules[level]?.fieldId
    if (!field) {
      assert.deepEqual(groups, [])
      return
    }
    const buckets = Object.groupBy(candidates, (id) => String(source.get(id)[field] ?? ''))
    const keys = Object.keys(buckets).toSorted((a, b) => a.localeCompare(b))
    if (state.rules[level].direction === 'desc') keys.reverse()
    assert.deepEqual(
      groups.map((g) => g.key),
      keys,
    )
    for (const group of groups) {
      assert.deepEqual(group.recordIds, buckets[group.key])
      assert.equal(group.level, level)
      assert.equal(group.fieldId, field)
      visit(group.children ?? [], group.recordIds, level + 1)
    }
  }
  visit(state.groups, state.projectedRecordIds, 0)
  for (const total of state.totals) {
    const numbers = total.recordIds.map((id) => source.get(id).amount).filter((n) => typeof n === 'number')
    assert.equal(total.numericCount, numbers.length)
    assert.equal(
      total.subtotal,
      numbers.reduce((sum, n) => sum + n, 0),
    )
  }
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const root = page.locator('.base-groups'),
    controls = root.locator('fieldset')
  await page.locator('.base-groups[data-ready=true]').waitFor({ timeout: 120000 })
  const idle = () => page.waitForFunction(() => document.querySelector('.base-groups fieldset')?.disabled === false)
  const read = async () => JSON.parse(await root.locator('output').textContent())
  const click = async (name, expectedError) => {
    await controls.getByRole('button', { name, exact: true }).click()
    await idle()
    if (expectedError) assert.match(await root.locator('[role=alert]').textContent(), expectedError)
    else
      assert.equal(
        await root.locator('[role=alert]').isVisible(),
        false,
        await root.locator('[role=alert]').textContent(),
      )
    return read()
  }
  const select = (name, value) => controls.getByRole('combobox', { name, exact: true }).selectOption(value)
  const choose = async (value) => {
    await select('Grouping', value)
    return click('Apply grouping')
  }
  const capture = (name) => root.screenshot({ path: path.join(directory, name + '.png') })
  await page.waitForTimeout(700)
  const baseline = await click('Inspect')
  await fs.writeFile(path.join(directory, 'baseline.json'), JSON.stringify(baseline, null, 2))
  assert.equal(baseline.sourceRecordIds.length, 90)
  assert.equal(baseline.projectedRecordIds.length, 90)
  assert.equal(new Set(baseline.expandedRecordIds).size, 90)
  assert.deepEqual(topTotals(baseline), expectedTotals)
  assert.deepEqual(baseline.referenceRules, [])
  verifyGroups(baseline)
  await root.locator('.totals summary').click()
  assert.equal(await root.locator('tbody tr').count(), baseline.totals.length)
  await capture('baseline')
  await root.locator('.totals summary').click()
  await choose('none')
  for (const recordId of ['r011', 'r001']) {
    await select('Return record', recordId)
    await page.evaluate(() => {
      globalThis.__groupPaint = []
    })
    const numericState = await click('Reveal record')
    await page.waitForTimeout(250)
    const row = numericState.sourceValues.find((record) => record.id === recordId)
    const painted = await page.evaluate(() => globalThis.__groupPaint)
    const title = painted.findLast((item) => item.text === row.values.item)
    assert.ok(title, 'Readback must be paired with actual native record paint: ' + recordId)
    const numberLabels = painted
      .filter((item) => Math.abs(item.y - title.y) < 1 && item.x > 900 && /^-?[0-9]/.test(item.text))
      .map((item) => item.text)
    results.push({ numericPaint: recordId, source: row.values.amount, numberLabels })
    if (recordId === 'r011') {
      assert.equal(row.values.amount, 0)
      assert.ok(numberLabels.includes('0.00'))
    } else {
      assert.equal(row.values.amount, null)
      check('blank estimate is not a displayed zero', () =>
        assert.deepEqual(numberLabels, [], 'A null numeric cell must not paint 0.00'),
      )
    }
    await capture(recordId + '-numeric-value')
  }
  await click('Reset')
  let state = await click('Collapse Done')
  assert.equal(state.expandedRecordIds.length, 69)
  assert.deepEqual(state.sourceValues, baseline.sourceValues)
  assert.deepEqual(topTotals(state), expectedTotals)
  const donePath = state.groups.find((g) => g.key === 'Done').path
  assert.ok(state.collapsedPaths.includes(donePath))
  const collapsed = state.expandedRecordIds
  assert.deepEqual((await click('Collapse Done')).expandedRecordIds, collapsed)
  await select('Group', donePath)
  await click('Show group')
  await page.waitForTimeout(250)
  await capture('done-collapsed')
  state = await click('Toggle group')
  assert.equal(state.expandedRecordIds.length, 90)
  const child = state.groups.find((g) => g.key === 'Done').children[0]
  await select('Group', child.path)
  state = await click('Toggle group')
  assert.equal(state.expandedRecordIds.length, 90 - child.recordIds.length)
  assert.ok(child.recordIds.every((id) => !state.expandedRecordIds.includes(id)))
  assert.deepEqual(state.sourceValues, baseline.sourceValues)
  state = await click('Expand all')
  assert.equal(state.expandedRecordIds.length, 90)
  for (const variant of ['none', 'status', 'reverse', 'nested', 'region']) {
    state = await choose(variant)
    verifyGroups(state)
    assert.deepEqual(state.sourceValues, baseline.sourceValues)
    assert.deepEqual(state.referenceRules, [])
    results.push({ variant, groups: state.groups, totals: state.totals })
    await capture(variant)
  }
  state = await choose('status')
  await select('Group', state.groups.find((g) => g.key === 'Done').path)
  await page.evaluate(() => {
    globalThis.__groupPaint = []
  })
  await click('Show group')
  await page.waitForTimeout(250)
  const paint = await page.evaluate(() => globalThis.__groupPaint)
  await fs.writeFile(path.join(directory, 'native-group-paint.json'), JSON.stringify(paint, null, 2))
  assert.ok(
    paint.some((p) => p.text.includes('Done')),
    'Native renderer must paint the selected group',
  )
  const target = paint.findLast((p) => p.text === 'Done' && p.x < 200)
  if (target) {
    await page.mouse.click(target.x - 16, target.y - 4)
    await page.waitForTimeout(250)
    state = await click('Inspect')
    check('native group-header collapse', () => assert.ok(state.collapsedPaths.some((p) => p.endsWith('/status:Done'))))
    await click('Expand all')
  } else
    failures.push({
      name: 'native group-header hit target',
      message: 'No observed Done header paint coordinate available',
    })
  await choose('nested')
  state = await click('Change status')
  const moved = topTotals(state)
  assert.deepEqual(moved.Done, { count: 22, numericCount: 20, subtotal: 5504 })
  assert.deepEqual(moved.Repair, { count: 19, numericCount: 17, subtotal: 3537 })
  assert.deepEqual(
    await root
      .locator('tbody tr')
      .evaluateAll((rows) =>
        Array.from(rows.find((row) => row.cells[0].textContent === '/status:Done').cells).map(
          (cell) => cell.textContent,
        ),
      ),
    ['/status:Done', '22', '20', '5504'],
  )
  verifyGroups(state)
  await page.waitForTimeout(300)
  state = await click('Undo')
  check('record move Undo', () => assert.deepEqual(topTotals(state), expectedTotals))
  state = await click('Redo')
  check('record move Redo', () => assert.deepEqual(topTotals(state), moved))
  await click('Collapse Done')
  await page.evaluate(() => {
    globalThis.__groupPaint = []
  })
  state = await click('Reveal record')
  assert.ok(state.expandedRecordIds.includes('r007'))
  await page.waitForTimeout(250)
  assert.ok(
    await page.evaluate(() => globalThis.__groupPaint.some((p) => p.text.includes('LED wash'))),
    'Revealed record must be painted by the native Grid',
  )
  await capture('moved-record')
  await select('View', 'reference')
  state = await click('Activate view')
  assert.deepEqual(state.groups, [])
  assert.equal(state.sourceValues.find((r) => r.id === 'r007').values.status, 'Done')
  await select('View', 'working')
  state = await click('Activate view')
  assert.equal(state.rules.length, 2)
  const editedValues = state.sourceValues
  state = await click('Reload snapshot')
  assert.deepEqual(state.sourceValues, editedValues)
  assert.deepEqual(state.collapsedPaths, [])
  verifyGroups(state)
  state = await choose('empty-shown')
  check('unused option as empty group', () =>
    assert.ok(
      state.groups.some((g) => g.key === 'Archived' && g.recordIds.length === 0),
      'hideEmptyGroup=false must expose the unused Archived option',
    ),
  )
  results.push({ variant: 'empty-shown', state })
  state = await choose('empty-hidden')
  assert.ok(
    !state.groups.some((g) => g.key === 'Archived'),
    'Unused Archived option is not shown when empty groups are hidden',
  )
  assert.equal(
    state.groups.find((g) => g.key === '').recordIds.length,
    7,
    'A populated blank-value group is not a zero-record group',
  )
  results.push({ variant: 'empty-hidden', state })
  state = await click('Empty table')
  assert.deepEqual(state.sourceRecordIds, [])
  assert.deepEqual(state.groups, [])
  await click('Change status', /absent/)
  await click('Collapse Done', /absent/)
  await capture('empty-error')
  state = await click('Reset')
  assert.deepEqual(state.sourceValues, baseline.sourceValues)
  assert.deepEqual(topTotals(state), expectedTotals)
  await select('Grouping', 'none')
  await click('Apply grouping')
  await click('Toggle group', /absent/)
  await click('Reset')
  const focusable = controls.locator('select,button')
  await focusable.first().focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  for (let i = 0; i < (await focusable.count()); i++) {
    assert.equal(
      await focusable
        .nth(i)
        .evaluate(
          (el) =>
            el === document.activeElement &&
            el.matches(':focus-visible') &&
            getComputedStyle(el).outlineWidth === '2px',
        ),
      true,
    )
    await page.keyboard.press('Tab')
  }
  results.push({ keyboardControls: await focusable.count() })
  await controls.getByRole('combobox', { name: 'Record status', exact: true }).focus()
  await page.keyboard.press('Home')
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await idle()
  state = await click('Inspect')
  assert.equal(state.sourceValues.find((r) => r.id === 'r007').values.status, 'Done')
  await click('Reset')
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    state = await click('Inspect')
    assert.equal(state.sourceRecordIds.length, 90)
    verifyGroups(state)
    await capture('viewport-' + width)
  }
  await page.setViewportSize({ width: 1600, height: 1300 })
  if (new URL(url).pathname.includes('/playground/'))
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.base-groups[data-theme=${theme}][data-ready=true]`).waitFor({ timeout: 120000 })
      state = await click('Inspect')
      assert.deepEqual(topTotals(state), expectedTotals)
      await capture(theme)
    }
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.base-groups[data-ready=true]').waitFor({ timeout: 120000 })
  state = await click('Inspect')
  assert.deepEqual(topTotals(state), expectedTotals)
  assert.equal(await root.count(), 1)
  assert.equal(await root.locator('[data-u-comp="render-canvas"]').count(), 1)
  check('no browser errors', () => assert.deepEqual(errors, []))
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ url, status: failures.length ? 'failed' : 'passed', failures, errors, results }, null, 2),
  )
  assert.deepEqual(failures, [], 'All grouping acceptance checks must pass')
  console.log('PASS native Base grouping, collapse, subtotals, record movement and lifecycle')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      {
        message: error.message,
        failures,
        errors,
        results,
        readback: await page
          .locator('.base-groups output')
          .textContent()
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
