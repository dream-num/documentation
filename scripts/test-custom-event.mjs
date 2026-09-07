/* eslint-disable no-await-in-loop -- Exercise subscriptions and native actions in user order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/custom-event'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/custom-event')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
const report = { passed: false, errors: [], checks: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.custom-event-demo')
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const read = async () => JSON.parse(await root.locator('[aria-label="Event SDK readback"]').textContent())
  const click = (action) => root.locator(`[data-action="${action}"]`).click()
  const ready = async () => {
    await root.locator('[data-action="protected"]').waitFor({ timeout: 60000 })
    await grid.waitFor()
    await page.waitForFunction(
      () => document.querySelector('.custom-event-demo')?.getAttribute('data-ready') === 'true',
    )
  }
  const waitColumns = (count) =>
    page.waitForFunction((expected) => {
      const text = document.querySelector('[aria-label="Event SDK readback"]')?.textContent
      return text && JSON.parse(text).columns === expected
    }, count)
  await ready()
  const baseline = await read()
  assert.equal(baseline.columns, 8)
  assert.equal(baseline.values[1][2], 7.2)
  await click('protected')
  let state = await read()
  assert.deepEqual(state.values, baseline.values)
  assert.equal(state.columns, 8)
  assert.deepEqual(state.events, [
    'Before: Samples columns 3–3.',
    'Blocked: deletion overlaps C–E; no after-delete event should follow.',
  ])
  await click('allowed')
  state = await read()
  assert.equal(state.columns, 7)
  assert.equal(state.values[0][5], null)
  assert.deepEqual(state.events.slice(-2), ['Before: Samples columns 6–6.', 'After: Samples columns 6–6 removed.'])
  await grid.click({ position: { x: 95, y: 55 } })
  await page.keyboard.press('Control+z')
  await waitColumns(8)
  assert.deepEqual((await read()).values, baseline.values)
  report.checks.push(
    'Guard cancels actual Facade deletion with unchanged data; allowed delete emits Before/After; native Undo restores values',
  )

  await click('listener')
  assert.equal((await read()).guard, false)
  await click('protected')
  state = await read()
  assert.equal(state.columns, 7)
  assert.equal(state.values[0][2], 'Temp °C')
  assert.deepEqual(state.events.slice(-2), ['Before: Samples columns 3–3.', 'After: Samples columns 3–3 removed.'])
  await click('listener')
  const restored = await read()
  await click('protected')
  assert.equal((await read()).columns, 7)
  assert.deepEqual((await read()).values, restored.values)
  report.checks.push(
    'Explicit unsubscribe permits guarded deletion; resubscribe restores cancellation without duplicate listeners',
  )

  for (let cycle = 0; cycle < 3; cycle++) {
    await click('reset')
    await ready()
    assert.equal((await read()).guard, true)
    assert.deepEqual((await read()).values, baseline.values)
    await click('protected')
    assert.equal((await read()).events.filter((entry) => entry.startsWith('Before:')).length, 1)
    await grid.click({ button: 'right', position: { x: 85, y: 32 } })
    await root.locator('[role="status"]').filter({ hasText: 'Right-click A1: menu suppressed.' }).waitFor()
    await page.getByText('Copy', { exact: true }).filter({ visible: true }).waitFor({ state: 'hidden' })
    await grid.click({ button: 'right', position: { x: 215, y: 56 } })
    await root.locator('[role="status"]').filter({ hasText: 'Right-click B2: menu allowed.' }).waitFor()
    await page.getByText('Copy', { exact: true }).filter({ visible: true }).last().waitFor()
    await page.keyboard.press('Escape')
  }
  report.checks.push('Three resets preserve event registration; native A1 context menu is suppressed and B2 is allowed')
  await grid.click({ position: { x: 85, y: 32 } })
  await page.keyboard.down('Shift')
  await grid.click({ position: { x: 215, y: 56 } })
  await page.keyboard.up('Shift')
  await grid.click({ button: 'right', position: { x: 215, y: 56 } })
  await root.locator('[role="status"]').filter({ hasText: 'Right-click B2: menu allowed.' }).waitFor()
  await page.getByText('Copy', { exact: true }).filter({ visible: true }).last().waitFor()
  await page.keyboard.press('Escape')
  report.checks.push('Right-click B2 inside an A1:B2 selection uses the actual pointed cell')
  await root.getByText('Archive', { exact: true }).click()
  await page.waitForFunction(
    () => JSON.parse(document.querySelector('[aria-label="Event SDK readback"]').textContent).sheet === 'Archive',
  )
  await grid.click({ button: 'right', position: { x: 150, y: 56 } })
  await root.locator('[role="status"]').filter({ hasText: 'Right-click B2: menu allowed.' }).waitFor()
  await page.keyboard.press('Escape')
  await grid.click({ button: 'right', position: { x: 80, y: 32 } })
  await root.locator('[role="status"]').filter({ hasText: 'Right-click A1: menu suppressed.' }).waitFor()
  await page.keyboard.press('Escape')
  await click('protected')
  assert.equal((await read()).columns, 8)
  report.checks.push('Right-click and deletion guard use the newly active worksheet, not a captured previous sheet')

  await click('reset')
  for (let i = 0; i < 3; i++) await click('allowed')
  const depleted = await read()
  assert.equal(depleted.columns, 5)
  await click('allowed')
  assert.deepEqual((await read()).values, depleted.values)
  await root.locator('[role="status"]').filter({ hasText: 'That column no longer exists' }).waitFor()
  await click('reset')
  const workbench = root.locator('[data-u-comp="workbench-layout"]')
  assert.equal(await workbench.evaluate((node) => getComputedStyle(node).backgroundColor), 'rgb(255, 255, 255)')
  await root.screenshot({ path: path.join(directory, 'light.png') })
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await root.locator('[data-action="listener"]').focus()
    await page.keyboard.press('Enter')
    assert.equal((await read()).guard, false)
    await click('protected')
    assert.equal((await read()).columns, 7)
    await click('reset')
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  report.checks.push(
    'Missing-column error preserves data; white native SDK workbench; keyboard listener toggle and real deletion at 760/390/320px',
  )
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.custom-event-demo[data-theme="${theme}"]`).waitFor()
      await ready()
      assert.deepEqual((await read()).values, baseline.values)
      await click('protected')
      assert.equal((await read()).columns, 8)
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    report.checks.push('Documentation theme replacement restores fixture and working guard')
    for (const [locale, title, headings] of [
      ['en-US', 'Custom Event', ['Variants', 'Actions', 'States']],
      ['zh-CN', '自定义事件', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/custom-event`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const frame = page.frameLocator('iframe').first()
      await frame.getByRole('button', { name: 'Delete F (allowed)', exact: true }).click()
      const embeddedState = JSON.parse(await frame.locator('[aria-label="Event SDK readback"]').textContent())
      assert.equal(embeddedState.columns, 7)
      assert.equal(embeddedState.events.at(-1), 'After: Samples columns 6–6 removed.')
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push('English/Chinese card-free detail pages with working iframe deletion')
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
assert.ok(report.passed, 'Custom events must correspond to actual SDK actions and native menus')
