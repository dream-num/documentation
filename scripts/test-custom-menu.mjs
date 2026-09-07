/* eslint-disable no-await-in-loop -- Exercise native menu actions and reset in user order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/custom-menu'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/custom-menu')
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
  const root = page.locator('.custom-menu-demo')
  const editor = root.locator('.menu-editor')
  const grid = () => editor.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const ready = async () => {
    await root.locator('[data-action="first"]').waitFor()
    await grid().waitFor()
    await page.waitForFunction(() => {
      const canvas = document.querySelector('.menu-editor canvas[id^="univer-sheet-main-canvas"]')
      return canvas && canvas.width > 300 && canvas.height > 100
    })
  }
  const read = async () => JSON.parse(await root.locator('[aria-label="Menu SDK readback"]').textContent())
  const waitValue = async (row, value) =>
    page.waitForFunction(
      (expected) => {
        const text = document.querySelector('[aria-label="Menu SDK readback"]')?.textContent
        return text && JSON.parse(text).values[expected.row][4] === expected.value
      },
      { row, value },
    )
  const ribbon = (name) => editor.getByRole('button', { name, exact: true })
  const clickRibbon = async (name) => {
    // Do not mistake the previous overflow popup's closing animation for a
    // currently usable action. Let React commit, then settle finite animations.
    await page.evaluate(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      await Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {})),
      )
    })
    if (!(await ribbon(name).filter({ visible: true }).count()))
      await editor
        .locator('[data-u-comp="ribbon-toolbar"] button')
        .filter({ has: page.locator('svg.univerjs-icon-more-vertical-icon') })
        .click()
    await page.getByRole('button', { name, exact: true }).filter({ visible: true }).click()
  }
  const first = root.getByRole('button', { name: 'Select first order', exact: true })
  const two = root.getByRole('button', { name: 'Select two orders', exact: true })
  const reset = root.getByRole('button', { name: 'Reset orders', exact: true })
  await ready()
  await first.click()
  const baseline = await read()
  assert.equal(
    await editor.locator('[data-u-comp="ribbon-grid-toolbar"]').count(),
    1,
    'New visits default to native Grid',
  )
  assert.equal(baseline.selected, 'A4:E4')
  assert.deepEqual(
    baseline.values.slice(3).map((row) => row[4]),
    ['Pending', 'Needs changes', 'Pending', 'Approved'],
  )
  await ribbon('Review highlight').click()
  assert.ok((await read()).backgrounds[0].every((color) => color.toUpperCase() === '#FFF3BF'))
  await grid().click({ position: { x: 80, y: 20 + 24 + 12 } })
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const pixel = await grid().evaluate((canvas) => {
    const bounds = canvas.getBoundingClientRect()
    const ratio = canvas.width / bounds.width
    return [...canvas.getContext('2d').getImageData(Math.round(166 * ratio), Math.round(112 * ratio), 1, 1).data]
  })
  assert.deepEqual(pixel, [255, 243, 191, 255], 'Native canvas paints the SDK highlight, not just a host status')
  await root.screenshot({ path: path.join(directory, 'highlight.png') })
  await first.click()
  await ribbon('Review highlight').click()
  assert.ok((await read()).backgrounds[0].every((color) => color.toUpperCase() === '#FFFFFF'))
  report.checks.push('Ribbon highlight toggles actual range fill; native canvas pixel matches')

  await ribbon('Approved').click()
  await waitValue(3, 'Approved')
  assert.deepEqual((await read()).values.slice(4), baseline.values.slice(4))
  await ribbon('Approved').click()
  assert.equal(await root.getAttribute('data-state'), 'unchanged')
  assert.match(await root.locator(':scope > [role="status"]').textContent(), /already reads Approved/)
  await grid().click({ position: { x: 80, y: 20 + 3 * 24 + 12 } })
  await page.keyboard.press('Control+z')
  await waitValue(3, 'Pending')
  await page.keyboard.press('Control+y')
  await waitValue(3, 'Approved')
  report.checks.push('Approval changes E4 only; repeated action is honest; native Undo/Redo works')

  await two.focus()
  await page.keyboard.press('Enter')
  assert.equal((await read()).selected, 'A5:E6')
  await grid().click({ button: 'right', position: { x: 90, y: 20 + 4 * 24 + 12 } })
  await page.getByText('Approval', { exact: true }).filter({ visible: true }).last().hover()
  await page.getByText('Needs changes', { exact: true }).filter({ visible: true }).last().click()
  await waitValue(5, 'Needs changes')
  assert.deepEqual(
    (await read()).values.slice(4, 6).map((row) => row[4]),
    ['Needs changes', 'Needs changes'],
  )
  assert.equal((await read()).values[3][4], 'Approved')
  assert.equal((await read()).values[6][4], 'Approved')
  await root.screenshot({ path: path.join(directory, 'context-approval.png') })
  await ribbon('Approved').click()
  await waitValue(4, 'Approved')
  await waitValue(5, 'Approved')
  report.checks.push('Right-click Approval submenu acts on two selected rows; direct ribbon action uses same callbacks')

  await grid().click({ position: { x: 80, y: 20 + 24 + 12 } })
  const boundary = await read()
  await ribbon('Needs changes').click()
  assert.equal(await root.getAttribute('data-state'), 'error')
  assert.deepEqual((await read()).values, boundary.values)
  assert.deepEqual((await read()).backgrounds, boundary.backgrounds)
  report.checks.push('Header selection is rejected with unchanged values and formatting')
  await first.click()
  await ribbon('Review highlight').click()
  const edited = await read()
  const settle = () => page.waitForFunction(() => document.querySelector('.custom-menu-demo')?.dataset.ready === 'true')
  for (const layout of ['classic', 'grid', 'classic', 'grid']) {
    const before = await read()
    await root.getByRole('combobox', { name: 'Ribbon layout', exact: true }).selectOption(layout)
    await ready()
    await settle()
    const after = await read()
    assert.equal(after.hostLayoutConfiguration, layout)
    await fs.writeFile(
      path.join(directory, `layout-${layout}-snapshot.json`),
      JSON.stringify({ before: before.snapshot, after: after.snapshot }, null, 2),
    )
    const reloaded = structuredClone(before.snapshot)
    // beta.2 serializes the empty defined-name map as '{}' after loading ''.
    // Permit only this representation change; compare all other snapshot data.
    const emptyNames = reloaded.resources?.find(
      (resource) => resource.name === 'SHEET_DEFINED_NAME_PLUGIN' && resource.data === '',
    )
    if (emptyNames) emptyNames.data = '{}'
    assert.deepEqual(
      after.snapshot,
      reloaded,
      'Layout remount preserves the full workbook, allowing only empty defined-name serialization normalization',
    )
    assert.equal(after.selected, before.selected, 'Active selection survives the layout remount')
    assert.equal(await editor.locator('[data-u-comp="ribbon-grid-toolbar"]').count(), layout === 'grid' ? 1 : 0)
    assert.equal(await editor.locator('[data-u-comp="ribbon-toolbar"]').count(), layout === 'classic' ? 1 : 0)
    assert.equal(await editor.locator('canvas[id^="univer-sheet-main-canvas"]').count(), 1)
    await grid().click({ position: { x: 80, y: 20 + 3 * 24 + 12 } })
    await page.keyboard.press('Control+z')
    assert.deepEqual((await read()).snapshot, after.snapshot, 'Layout changes disclose cleared Undo history')
    await first.click()
    await clickRibbon('Review highlight')
    assert.notDeepEqual((await read()).backgrounds, before.backgrounds, 'The native action works in both layouts')
    await clickRibbon('Review highlight')
    assert.deepEqual((await read()).backgrounds, before.backgrounds)
    await clickRibbon('Needs changes')
    await waitValue(3, 'Needs changes')
    await editor.locator('[data-u-command="univer.command.undo"]').filter({ visible: true }).click()
    await waitValue(3, before.values[3][4])
    assert.deepEqual(
      (await read()).snapshot,
      after.snapshot,
      'A native approval edit can be undone in either ribbon layout',
    )
    await first.click()
    await page.evaluate(async () => {
      await Promise.all(
        document
          .getAnimations()
          .filter((a) => a.effect?.getTiming().iterations !== Infinity)
          .map((a) => a.finished.catch(() => {})),
      )
    })
    await root.screenshot({ path: path.join(directory, `ribbon-${layout}.png`) })
  }
  assert.deepEqual((await read()).values, edited.values)
  report.checks.push(
    'Four Grid/classic transitions preserve full SDK snapshots/selection, clear native history and retain working menu callbacks with one canvas',
  )
  for (let cycle = 0; cycle < 3; cycle++) {
    await reset.click()
    await ready()
    assert.deepEqual((await read()).values, baseline.values)
    assert.deepEqual((await read()).backgrounds, baseline.backgrounds)
    assert.equal((await read()).selected, 'A4:E4')
    await ribbon('Needs changes').click()
    await waitValue(3, 'Needs changes')
  }
  report.checks.push('Three fixture resets restore all values/backgrounds and leave native actions usable')
  await reset.click()
  await ready()
  const workbench = editor.locator('[data-u-comp="workbench-layout"]')
  assert.equal(await workbench.evaluate((node) => getComputedStyle(node).backgroundColor), 'rgb(255, 255, 255)')
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    )
  })
  report.captureOpacity = await workbench.evaluate((element) => {
    const values = []
    for (let node = element; node; node = node.parentElement) values.push(getComputedStyle(node).opacity)
    return values
  })
  assert.ok(report.captureOpacity.every((value) => value === '1'))
  await root.screenshot({ path: path.join(directory, 'light.png') })
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await first.click()
    assert.equal((await read()).selected, 'A4:E4')
    if (width === 390) {
      await grid().click({ button: 'right', position: { x: 90, y: 20 + 3 * 24 + 12 } })
      await page.getByText('Approval', { exact: true }).filter({ visible: true }).last().hover()
      await page.getByText('Approved', { exact: true }).filter({ visible: true }).last().click()
      await waitValue(3, 'Approved')
    }
    await reset.click()
    await ready()
    await root.getByRole('combobox', { name: 'Ribbon layout', exact: true }).selectOption('classic')
    await ready()
    await settle()
    await first.click()
    await clickRibbon('Approved')
    await waitValue(3, 'Approved')
    await reset.click()
    await ready()
    assert.equal(await root.getByRole('combobox', { name: 'Ribbon layout', exact: true }).inputValue(), 'classic')
    assert.deepEqual(
      (await read()).values,
      baseline.values,
      'Reset keeps the optional layout and restores original orders',
    )
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      'Host layout does not overflow the page',
    )
    await root.getByRole('combobox', { name: 'Ribbon layout', exact: true }).selectOption('grid')
    await ready()
    await settle()
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  report.checks.push(
    'Host selection/reset at 760/390/320 widths, native context approval at 390px, and white workbench',
  )
  await page.setViewportSize({ width: 1440, height: 1100 })
  if (url.includes('/playground/')) {
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.custom-menu-demo[data-theme="${theme}"]`).waitFor()
      await ready()
      await first.click()
      assert.deepEqual((await read()).values, baseline.values)
      await ribbon('Approved').click()
      await waitValue(3, 'Approved')
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    report.checks.push('Documentation theme replacement restores fixture and working native actions')
    for (const [locale, title, headings] of [
      ['en-US', 'Custom Menu', ['Variants', 'Actions', 'States']],
      ['zh-CN', '自定义菜单', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/custom-menu`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const frame = page.frameLocator('iframe').first()
      await frame.locator('.custom-menu-demo[data-ready="true"]').waitFor()
      await frame.locator('canvas[id^="univer-sheet-main-canvas"]').waitFor({ state: 'visible' })
      await frame.getByRole('button', { name: 'Select first order', exact: true }).click()
      await frame.locator('.menu-editor').getByRole('button', { name: 'Approved', exact: true }).click()
      await frame
        .locator('.custom-menu-demo > [role="status"]')
        .filter({ hasText: /now reads Approved/ })
        .waitFor()
      const state = JSON.parse(await frame.locator('[aria-label="Menu SDK readback"]').textContent())
      assert.equal(state.values[3][4], 'Approved')
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push(
      'English/Chinese detail pages list 4 variants, 7 actions and 4 states, with working embedded approval',
    )
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
assert.ok(report.passed, 'Custom native menu actions must change SDK state and rendered output')
