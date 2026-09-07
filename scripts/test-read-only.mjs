/* eslint-disable no-await-in-loop -- Compare native editing against viewer mode in user order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/read-only'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/read-only')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin })
const page = await context.newPage()
const report = { passed: false, errors: [], checks: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.read-only-demo')
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const booked = { x: 665, y: 104 }
  const read = async () => JSON.parse(await root.locator('[aria-label="Read-only SDK readback"]').textContent())
  const ready = async (mode) => {
    await page.waitForFunction((expected) => {
      const node = document.querySelector('.read-only-demo')
      const text = node?.querySelector('[aria-label="Read-only SDK readback"]')?.textContent
      return node?.getAttribute('data-ready') === 'true' && text && JSON.parse(text).requestedMode === expected
    }, mode)
    await grid.waitFor()
    assert.equal(
      await root.locator('.read-only-editor').evaluate((node) => node.inert),
      false,
      'Steady read-only must not be faked by inert',
    )
  }
  const setMode = async (mode) => {
    await root.locator(`[data-mode="${mode}"]`).click()
    await ready(mode)
  }
  const waitValue = (value, available) =>
    page.waitForFunction(
      (expected) => {
        const text = document.querySelector('[aria-label="Read-only SDK readback"]')?.textContent
        if (!text) return false
        const values = JSON.parse(text).values
        return values[3][4] === expected.value && values[3][5] === expected.available
      },
      { value, available },
    )
  const settle = () => page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 200)))
  const reset = async () => {
    await root.getByRole('button', { name: 'Reset timetable', exact: true }).click()
    await ready('display')
    await waitValue(18, 6)
  }
  await ready('display')
  await waitValue(18, 6)
  const baseline = await read()
  assert.equal(baseline.canEdit, false)
  await grid.click({ position: booked })
  await page.keyboard.type('999')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Delete')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowDown')
  await settle()
  assert.equal((await read()).selected, baseline.selected)
  assert.deepEqual((await read()).values, baseline.values)
  assert.equal(await root.locator('[data-mode="display"]').isDisabled(), true)
  report.checks.push(
    'Display-only viewer mode blocks selection changes and native typing/Delete without an inert overlay',
  )

  await setMode('selectable')
  await grid.click({ position: booked })
  await page.waitForFunction(
    () => JSON.parse(document.querySelector('[aria-label="Read-only SDK readback"]').textContent).selected === 'E4',
  )
  await page.keyboard.type('999')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Delete')
  await page.evaluate(() => navigator.clipboard.writeText('7'))
  await grid.click({ position: booked })
  await page.keyboard.press('Control+v')
  await settle()
  assert.equal((await read()).canEdit, false)
  assert.deepEqual((await read()).values, baseline.values)
  await root.screenshot({ path: path.join(directory, 'selectable-read-only.png') })
  report.checks.push(
    'Selectable viewer mode changes selection but native typing, Delete and real clipboard paste preserve all data',
  )

  await setMode('editable')
  assert.equal((await read()).canEdit, true)
  await grid.click({ position: booked })
  await page.keyboard.press('F2')
  await page.keyboard.press('Control+a')
  await page.keyboard.type('7')
  await page.keyboard.press('Enter')
  await waitValue(7, 17)
  await root.screenshot({ path: path.join(directory, 'editable.png') })
  await page.keyboard.press('Control+z')
  await waitValue(18, 6)
  await setMode('selectable')
  await grid.click({ position: booked })
  await page.keyboard.press('Control+y')
  await settle()
  await waitValue(18, 6)
  assert.match(await root.locator('[role="status"]').textContent(), /BeforeUndo\/BeforeRedo guard/)
  await setMode('editable')
  await grid.click({ position: booked })
  await page.keyboard.press('Control+y')
  await waitValue(7, 17)
  await setMode('selectable')
  await grid.click({ position: booked })
  await page.keyboard.press('Delete')
  await page.keyboard.press('Control+z')
  await page.keyboard.type('999')
  await page.keyboard.press('Enter')
  await settle()
  assert.equal((await read()).values[3][4], 7)
  assert.equal((await read()).values[3][5], 17)
  await setMode('editable')
  await grid.click({ position: booked })
  await page.keyboard.press('Delete')
  await waitValue(null, 24)
  await page.keyboard.press('Control+v')
  await waitValue(7, 17)
  report.checks.push(
    'Same hidden-chrome editor permits native edits/Delete/paste and SDK formulas; switching to viewer preserves edits and blocks further input/Undo',
  )

  for (let cycle = 0; cycle < 3; cycle++) {
    await reset()
    assert.deepEqual((await read()).values, baseline.values)
    assert.equal((await read()).canEdit, false)
    const selected = (await read()).selected
    await grid.click({ position: { x: 220, y: 128 } })
    assert.equal((await read()).selected, selected)
    await setMode('selectable')
    await grid.click({ position: booked })
    await settle()
    assert.equal((await read()).selected, 'E4')
    await setMode('editable')
    await grid.click({ position: booked })
    // Rapid re-clicks can enter native double-click editing (append semantics).
    // Explicitly select the cell editor's contents before replacing the value.
    await page.keyboard.press('F2')
    await page.keyboard.press('Control+a')
    await page.keyboard.type(String(8 + cycle))
    await page.keyboard.press('Enter')
    await waitValue(8 + cycle, 16 - cycle)
  }
  await reset()
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((node) => getComputedStyle(node).backgroundColor),
    'rgb(255, 255, 255)',
  )
  assert.equal(await root.locator('.read-only-editor').getByRole('button', { name: 'Start', exact: true }).count(), 0)
  await grid.click({ button: 'right', position: booked })
  await settle()
  assert.equal(await page.getByText('Copy', { exact: true }).filter({ visible: true }).count(), 0)
  await root.screenshot({ path: path.join(directory, 'light.png') })
  report.checks.push(
    'Three resets restore fixture and display policy; native light workbench remains white with no context menu',
  )
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await root.locator('[data-mode="selectable"]').focus()
    await page.keyboard.press('Enter')
    await ready('selectable')
    await grid.click({ position: { x: 220, y: 104 } })
    await page.keyboard.type('Changed')
    await page.keyboard.press('Enter')
    await settle()
    assert.deepEqual((await read()).values, baseline.values)
    await reset()
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  report.checks.push('Keyboard mode controls and read-only native input protection at 760/390/320px')
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.read-only-demo[data-theme="${theme}"]`).waitFor()
      await ready('display')
      await waitValue(18, 6)
      await setMode('selectable')
      await grid.click({ position: booked })
      await page.keyboard.press('Delete')
      await settle()
      assert.deepEqual((await read()).values, baseline.values)
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    report.checks.push('Documentation theme replacement restores a working viewer, not an editable fallback')
    for (const [locale, title, headings] of [
      ['en-US', 'Read Only Demo', ['Variants', 'Actions', 'States']],
      ['zh-CN', '只读示例', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/read-only`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('[data-mode="editable"]').click()
      await embedded.locator('.read-only-demo[data-ready="true"]').waitFor()
      await embedded.locator('canvas[id^="univer-sheet-main-canvas"]:visible').click({ position: booked })
      await page.keyboard.press('F2')
      await page.keyboard.press('Control+a')
      await page.keyboard.type('7')
      await page.keyboard.press('Enter')
      await embedded
        .locator('[aria-label="Read-only SDK readback"]')
        .filter({ hasText: /24,\s+7,\s+17,/ })
        .waitFor({ state: 'attached' })
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push('English/Chinese card-free detail pages with native-editable counterexamples in both iframes')
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png') })
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
assert.ok(report.passed, 'Read-only must be enforced by SDK permissions, with an editable native-input counterexample')
