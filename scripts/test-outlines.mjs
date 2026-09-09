/* eslint-disable no-await-in-loop -- Verify one selected native workbook and its history in sequence. */
// Historical host-panel harness; current gallery acceptance is test-sheet-outline-native-gallery.mjs.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const normalize = (state) => ({
  groups: state.outlines.map(({ axis, start, end, collapsed, depth }) => ({ axis, start, end, collapsed, depth })),
  values: state.values,
  hiddenRows: state.hiddenRows,
  hiddenColumns: state.hiddenColumns,
  clock: state.fixtureClock,
})
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/outline'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/outlines')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
await context.addInitScript(() => {
  window.outlinePaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.outlinePaint.length < 40000) window.outlinePaint.push(String(text))
    return fillText.call(this, text, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(30000)
const report = { passed: false, errors: [], checks: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.outline-demo')
  await page.locator('.outline-demo[data-ready="true"]').waitFor({ timeout: 90000 })
  const read = async () => JSON.parse(await root.locator('pre').textContent())
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const wait = (check, arg) =>
    page.waitForFunction(
      ({ predicate, arg: value }) => {
        const text = document.querySelector('.outline-demo pre')?.textContent
        return text && new Function('s', 'a', `return (${predicate})(s,a)`)(JSON.parse(text), value)
      },
      { predicate: check.toString(), arg },
    )
  const css = async () => {
    const styles = await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      white: getComputedStyle(el).getPropertyValue('--univer-gray-0').trim(),
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
    if ((await root.getAttribute('data-theme')) === 'light') assert.equal(styles.background, 'rgb(255, 255, 255)')
    assert.ok(styles.white)
    assert.equal(styles.flex, 'flex')
  }
  const action = async (name) => {
    await root.locator(`[data-action="${name}"]`).click()
    await settle()
    assert.doesNotMatch(await root.getByRole('status').textContent(), /Action failed:/)
    await css()
  }
  const select = async (axis, start, end) => {
    const g = (await read()).outlines.find(
      (candidate) => candidate.axis === axis && candidate.start === start && candidate.end === end,
    )
    assert.ok(g, `${axis} ${start}:${end} exists`)
    await root.getByRole('combobox', { name: 'Outline target' }).selectOption(g.id)
    await wait((s, id) => s.target === id, g.id)
    return g.id
  }
  const detail = async (mode, visible) => {
    await root.getByRole('combobox', { name: 'Detail level' }).selectOption(mode)
    await wait((s, n) => s.visiblePopulatedRows === n, visible)
    await css()
  }
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const history = async (key) => {
    if (key === 'Control+z') {
      await grid.click({ position: { x: 200, y: 95 } })
      // Rapid repeated cell clicks can enter native edit mode; cancel without committing a value.
      await page.keyboard.press('Escape')
    }
    await page.keyboard.press(key)
    await settle()
  }
  await wait((s) => s.values[1][6] === 31156)
  const baseline = await read()
  assert.equal(baseline.visiblePopulatedRows, 5)
  assert.equal(baseline.outlines.length, 18)
  assert.equal(baseline.outlines.filter((g) => g.axis === 'row').length, 16)
  const orders = baseline.values.filter((row) => String(row[0]).startsWith('AL-'))
  assert.equal(orders.length, 120)
  assert.equal(new Set(orders.map((r) => r[1])).size, 4)
  assert.equal(new Set(orders.map((r) => r[2])).size, 6)
  assert.equal(new Set(orders.map((r) => r[3])).size, 2)
  assert.ok(orders.some((r) => r[4] === 0))
  for (const row of orders) assert.equal(row[6], row[4] * row[5])
  assert.ok(baseline.outlineResource)
  await page.waitForFunction(() => window.outlinePaint.includes('Q1 · 2027') && window.outlinePaint.includes('31156'))
  await root.screenshot({ path: path.join(directory, 'quarter-summary.png') })
  await css()
  report.checks.push(
    '120 varied orders, 4 regions / 6 categories / 12 months / 2 scenarios, native formulas, 16 row and 2 column groups, white SDK workbench',
  )

  // Native row level-1 button, based on the visible two-level gutter (20px per level).
  await grid.click({ position: { x: 10, y: 58 } })
  await wait((s) => s.hiddenRows.length === 0)
  assert.equal((await read()).visiblePopulatedRows, 137)
  await detail('months', 17)
  await detail('q2', 38)
  assert.equal((await read()).hiddenRows.includes(37), false)
  assert.equal((await read()).hiddenRows.includes(3), true)
  await root.screenshot({ path: path.join(directory, 'q2-detail.png') })
  await detail('all', 137)
  await detail('all', 137)
  assert.equal(await root.getByRole('combobox', { name: 'Detail level' }).inputValue(), '')
  assert.deepEqual((await read()).values, baseline.values)
  report.checks.push(
    'Native canvas level control updates real groups; quarter/month/Q2/all detail counts are 5/17/38/137 without changing data',
  )

  await select('column', 4, 5)
  await action('toggle')
  assert.deepEqual((await read()).hiddenColumns, [4, 5])
  await history('Control+z')
  await wait((s) => s.hiddenColumns.length === 0)
  await history('Control+y')
  await wait((s) => s.hiddenColumns.length === 2)
  await select('column', 3, 5)
  await action('toggle')
  assert.deepEqual((await read()).hiddenColumns, [3, 4, 5])
  await action('toggle')
  assert.deepEqual((await read()).hiddenColumns, [4, 5])
  await select('column', 4, 5)
  await action('toggle')
  assert.deepEqual((await read()).hiddenColumns, [])
  report.checks.push(
    'Nested column visibility preserves collapsed children; native Undo/Redo restores actual hidden dimensions',
  )

  await action('add')
  assert.equal((await read()).outlines.length, 19)
  assert.equal((await read()).outlines.find((g) => g.axis === 'row' && g.start === 3 && g.end === 7).depth, 3)
  assert.equal(await root.locator('[data-action="add"]').isDisabled(), true)
  await history('Control+z')
  await wait((s) => s.outlines.length === 18)
  await history('Control+y')
  await wait((s) => s.outlines.length === 19)
  await select('row', 3, 7)
  await action('remove')
  assert.equal((await read()).outlines.length, 18)
  await action('clear')
  const cleared = (await read()).outlines
  assert.equal(cleared.length, 15)
  assert.ok(cleared.some((g) => g.axis === 'row' && g.start === 36 && g.end === 68))
  assert.equal(cleared.filter((g) => g.axis === 'row' && g.start >= 37 && g.end <= 68).length, 0)
  await history('Control+z')
  await wait((s) => s.outlines.length === 18)
  await select('row', 2, 34)
  await action('remove')
  assert.equal((await read()).outlines.length, 17)
  assert.ok((await read()).outlines.some((g) => g.axis === 'row' && g.start === 3 && g.end === 12))
  assert.deepEqual((await read()).values, baseline.values)
  report.checks.push(
    'Nested custom group, duplicate guard, native group Undo/Redo; inclusive clear removes Q2 children only and parent removal retains children/data',
  )

  await action('reset')
  await wait((s) => s.values[1][6] === 31156)
  for (const [value, message] of [
    ['crossing', 'overlapping groups'],
    ['bounds', 'outside the sheet'],
    ['zero', 'range is invalid'],
  ]) {
    await root.getByRole('combobox', { name: 'Boundary request' }).selectOption(value)
    await action('reject')
    assert.equal((await read()).lastOperation.changed, false)
    assert.deepEqual(normalize(await read()), normalize(baseline))
    await page.getByText(new RegExp(message)).first().waitFor()
  }
  await detail('q2', 38)
  await select('column', 4, 5)
  await action('toggle')
  const saved = normalize(await read())
  await action('reload')
  await wait((s) => s.values[1][6] === 31156)
  assert.deepEqual(normalize(await read()), saved)
  assert.equal(JSON.parse((await read()).outlineResource.data).orders.outlineList.length, 18)
  await action('empty')
  await wait((s) => s.outlines.length === 0 && s.populatedRows === 1)
  assert.equal((await read()).hiddenRows.length, 0)
  assert.equal(await root.locator('[data-action="toggle"]').isDisabled(), true)
  await root.getByRole('spinbutton', { name: 'Group count' }).fill('2')
  await action('add')
  await root.getByRole('spinbutton', { name: 'Group start' }).fill('6')
  await action('add')
  assert.equal((await read()).outlines.length, 1)
  assert.equal((await read()).outlines[0].start, 3)
  assert.equal((await read()).outlines[0].end, 6)
  await root.getByRole('combobox', { name: 'Group axis' }).selectOption('column')
  await root.getByRole('spinbutton', { name: 'Group start' }).fill('2')
  await action('add')
  await select('column', 1, 2)
  await action('toggle')
  assert.deepEqual((await read()).hiddenColumns, [1, 2])
  await action('remove')
  assert.deepEqual(
    (await read()).hiddenColumns,
    [1, 2],
    'Removing a collapsed group does not automatically unhide its columns',
  )
  report.checks.push(
    'Real crossing/out-of-bounds/zero rejection with unchanged data, resource round-trip, empty table and native adjacent-group merging',
  )

  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await action('reset')
    await wait((s) => s.values[1][6] === 31156)
    assert.deepEqual(normalize(await read()), normalize(baseline))
    await root.locator('.outline-controls > summary').click()
    await settle()
    assert.equal(await root.locator('.outline-controls').evaluate((el) => el.open), false)
    assert.ok(await grid.evaluate((el) => el.getBoundingClientRect().width > 200))
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
    await root.locator('.outline-controls > summary').click()
    const selectView = root.getByRole('combobox', { name: 'Detail level' })
    await selectView.focus()
    await page.keyboard.press('End')
    await page.keyboard.press('Enter')
    await wait((s) => s.visiblePopulatedRows === 137)
  }
  report.checks.push(
    'Three fixed-clock fixture resets, 760/390/320 layouts, collapsible controls and keyboard-operated Facade detail selection',
  )
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await page.locator('.outline-demo[data-ready="true"]').waitFor()
  assert.equal(await root.locator('.outline-controls').evaluate((el) => el.open), false)
  assert.ok(await grid.evaluate((el) => el.getBoundingClientRect().top < 400))
  await root.locator('.outline-controls > summary').click()
  await detail('q2', 38)
  await root.screenshot({ path: path.join(directory, 'fresh-mobile.png') })

  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.outline-demo[data-theme="${theme}"][data-ready="true"]`).waitFor()
      await wait((s) => s.values[1][6] === 31156)
      assert.deepEqual(normalize(await read()), normalize(baseline))
      await detail('q2', 38)
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    for (const [locale, title, headings] of [
      ['en-US', 'Row and column outlines', ['Variants', 'Actions', 'States']],
      ['zh-CN', '行列分组与大纲', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/outline`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.outline-demo[data-ready="true"]').waitFor()
      const branch = page.locator('aside button').first()
      await branch.click()
      await page.waitForFunction(
        () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
      )
      await branch.click()
      await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
      await embedded.getByRole('combobox', { name: 'Detail level' }).selectOption('q2')
      const frame = page.frames().find((f) => f.url().includes('/playground/'))
      await frame.waitForFunction(
        () => JSON.parse(document.querySelector('.outline-demo pre').textContent).visiblePopulatedRows === 38,
      )
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push(
      'Light/dark re-creation, EN/ZH card-free detail pages, hydrated tree and actual Q2 detail inside iframe',
    )
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.readback = await page
    .locator('.outline-demo pre')
    .textContent({ timeout: 1000 })
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify({ ...report, readback: undefined }, null, 2))
assert.ok(report.passed)
