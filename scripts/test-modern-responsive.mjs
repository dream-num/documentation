/* eslint-disable no-await-in-loop -- Exercise resize and zoom on the same live SDK unit. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url =
  process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/docs-modern/responsive-width-and-zoom'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-responsive')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1500, height: 1300 }, colorScheme: 'light' })
const errors = [],
  failures = [],
  results = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const check = (name, action) => {
  try {
    action()
  } catch (error) {
    failures.push({ name, message: error.message })
  }
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const root = page.locator('.responsive-demo')
  await page.locator('.responsive-demo[data-ready=true]').waitFor({ timeout: 120000 })
  const read = async () => JSON.parse(await root.locator('output').textContent())
  const click = async (name) => {
    await root.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.responsive-demo fieldset')?.disabled === false)
    return read()
  }
  const capture = (name) => root.screenshot({ path: path.join(directory, name + '.png') })
  await page.waitForTimeout(800)
  const baseline = await click('Inspect')
  await fs.writeFile(path.join(directory, 'baseline.json'), JSON.stringify(baseline, null, 2))
  await capture('baseline')
  assert.equal(baseline.charts.length, 1)
  assert.equal(baseline.tables.length, 1)
  assert.equal(baseline.columns.length, 1)
  assert.equal(baseline.drawings.length, 2)
  assert.deepEqual(baseline.charts[0].dataSource.values, [
    ['Site', 'Seedlings'],
    ['Dune', 84],
    ['Creek', 126],
    ['Ridge', 53],
  ])
  let state = await click('Select handover text')
  assert.equal(state.selection.text, 'Keep the blue path clear.')
  await capture('selection')
  const originalSelection = state.selection
  const verify = (name, current) => {
    check(name + ': same unit', () => assert.equal(current.unitId, baseline.unitId))
    check(name + ': layout error', () => assert.equal(current.layoutFailure, null))
    check(name + ': tables unchanged', () => assert.deepEqual(current.tables, baseline.tables))
    check(name + ': data unchanged', () =>
      assert.deepEqual(current.charts[0].dataSource.values, baseline.charts[0].dataSource.values),
    )
    check(name + ': selection retained', () => assert.deepEqual(current.selection, originalSelection))
    check(name + ': actual zoom', () => {
      assert.equal(current.sceneScale.x, current.zoom)
      assert.equal(current.sceneScale.y, current.zoom)
    })
    check(name + ': page fits', () =>
      assert.ok(
        current.pageWidth * current.zoom <= current.hostWidth,
        JSON.stringify({ page: current.pageWidth, zoom: current.zoom, host: current.hostWidth }),
      ),
    )
    check(name + ': actual page', () => assert.equal(current.layout[0].width, current.pageWidth))
    for (const drawing of current.drawings)
      check(name + ': drawing ' + drawing.id, () => {
        assert.ok(drawing.rendered?.visible)
        assert.ok(Math.abs(drawing.rendered.width * drawing.rendered.scaleX - drawing.size.width) < 1)
        assert.ok(Math.abs(drawing.rendered.height * drawing.rendered.scaleY - drawing.size.height) < 1)
      })
    check(name + ': selection first line geometry', () => {
      assert.ok(current.selectionScreen, 'Native selection must have screen geometry')
      const { start, end } = current.selectionScreen
      assert.ok(start.x >= -1 && end.x <= current.hostWidth + 1, JSON.stringify(current.selectionScreen))
    })
    check(name + ': wrapped selection visibility', () => {
      assert.ok(current.selectionPolygons.length > 0)
      const ys = current.selectionPolygons.flat().map((p) => p.y)
      const fitsVertically = Math.max(...ys) - Math.min(...ys) <= current.editorHeight
      for (const polygon of current.selectionPolygons)
        for (const point of polygon) {
          assert.ok(
            point.x >= -1 && point.x <= current.hostWidth + 1,
            'Selected text is horizontally clipped: ' + JSON.stringify(point),
          )
          if (fitsVertically)
            assert.ok(
              point.y >= -1 && point.y <= current.editorHeight + 1,
              'Selected text is vertically clipped: ' + JSON.stringify(point),
            )
        }
      if (!fitsVertically) {
        // A selection taller than the viewport cannot fit at once; its final line
        // must be reachable and visible, without shortening the selected range.
        for (const point of current.selectionPolygons.at(-1))
          assert.ok(point.y >= -1 && point.y <= current.editorHeight + 1, 'Tall selection endpoint must be visible')
      }
    })
  }
  for (const host of ['960', '600', '390', '320']) {
    await root.getByRole('combobox', { name: 'Host width', exact: true }).selectOption(host)
    await click('Resize host')
    for (const zoom of [100, 150, 200, 50]) {
      await root.getByRole('spinbutton', { name: 'Zoom percent' }).fill(String(zoom))
      await click('Apply zoom')
      await page.waitForTimeout(250)
      state = await click('Inspect')
      const name = `host-${host}-zoom-${zoom}`
      results.push({ name, state, alert: await root.locator('[role=alert]').textContent() })
      verify(name, state)
      await capture(name)
    }
  }
  await root.getByRole('combobox', { name: 'Host width', exact: true }).selectOption('fluid')
  await click('Resize host')
  await root.getByRole('spinbutton', { name: 'Zoom percent' }).fill('100')
  await click('Apply zoom')
  for (const width of ['640', '1040', '820']) {
    await root.getByRole('combobox', { name: 'Reading width', exact: true }).selectOption(width)
    state = await click('Apply width')
    await page.waitForTimeout(300)
    state = await click('Inspect')
    for (
      let attempt = 0;
      attempt < 30 &&
      state.drawings.some((d) => !d.rendered || Math.abs(d.rendered.width * d.rendered.scaleX - d.size.width) >= 1);
      attempt++
    ) {
      await page.waitForTimeout(100)
      state = await click('Inspect')
    }
    results.push({ name: 'reading width ' + width, state })
    check('reading width ' + width, () => assert.equal(state.pageWidth, Number(width)))
    verify('reading width ' + width, state)
  }
  await click('Reset')
  await click('Add field note')
  await page.waitForTimeout(500)
  await root.getByRole('combobox', { name: 'Host width', exact: true }).selectOption('600')
  await click('Resize host')
  state = await click('Undo')
  check('text undo after reflow', () => assert.ok(!state.paragraphs.some((p) => p.text.includes('Field note: Ridge'))))
  state = await click('Redo')
  check('text redo after reflow', () => assert.ok(state.paragraphs.some((p) => p.text.includes('Field note: Ridge'))))
  const edited = state.paragraphs
  state = await click('Reload snapshot')
  check('reload retains content', () => assert.deepEqual(state.paragraphs, edited))
  await root.getByRole('spinbutton', { name: 'Zoom percent' }).fill('0')
  state = await click('Apply zoom')
  assert.match(await root.locator('[role=alert]').textContent(), /50 to 200/)
  assert.equal(state.zoom, 1)
  state = await click('Empty document')
  assert.equal(state.charts.length, 0)
  assert.equal(state.tables.length, 0)
  assert.equal(state.drawings.length, 0)
  await click('Select handover text')
  assert.match(await root.locator('[role=alert]').textContent(), /absent or ambiguous/)
  state = await click('Reset')
  assert.deepEqual(state.tables, baseline.tables)
  assert.deepEqual(state.paragraphs, baseline.paragraphs)
  assert.equal(await root.locator('canvas').count(), 1)
  const controls = root.locator('fieldset').locator('input, select, button')
  await controls.first().focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  for (let i = 0; i < (await controls.count()); i++) {
    assert.equal(
      await controls
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
  results.push({ keyboard: await controls.count() })
  const zoomInput = root.getByRole('spinbutton', { name: 'Zoom percent' })
  await zoomInput.focus()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('150')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => document.querySelector('.responsive-demo fieldset')?.disabled === false)
  state = await click('Inspect')
  assert.equal(state.zoom, 1.5)
  assert.equal(state.sceneScale.x, 1.5)
  await click('Reset')
  if (new URL(url).pathname.includes('/playground/')) {
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.responsive-demo[data-theme=${theme}][data-ready=true]`).waitFor({ timeout: 120000 })
      state = await click('Inspect')
      assert.deepEqual(state.tables, baseline.tables)
      assert.equal(state.zoom, 1)
      assert.equal(await root.locator('canvas').count(), 1)
      await capture(theme)
    }
  }
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.responsive-demo[data-ready=true]').waitFor({ timeout: 120000 })
  state = await click('Inspect')
  assert.equal(state.charts.length, 1)
  assert.equal(await root.count(), 1)
  assert.equal(await root.locator('canvas').count(), 1)
  check('no uncaught errors', () => assert.deepEqual(errors, []))
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ url, status: failures.length ? 'failed' : 'passed', failures, errors, results }, null, 2),
  )
  assert.deepEqual(failures, [], 'All responsive acceptance checks must pass')
  console.log('PASS responsive width, zoom, native selection readback, history and reset')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify({ message: error.message, failures, errors, results }, null, 2),
  )
  throw error
} finally {
  await browser.close()
}
