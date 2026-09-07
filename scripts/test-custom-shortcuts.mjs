/* eslint-disable no-await-in-loop -- Test native keypresses and reset in user order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/custom-shortcuts'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/custom-shortcuts')
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
  const root = page.locator('.custom-shortcuts-demo')
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const read = async () => JSON.parse(await root.locator('[aria-label="Shortcut SDK readback"]').textContent())
  const ready = async () => {
    await grid.waitFor({ timeout: 60000 })
    await page.waitForFunction(() => {
      const text = document.querySelector('[aria-label="Shortcut SDK readback"]')?.textContent
      return text && JSON.parse(text).values[2][4] === 252
    })
  }
  const waitCleared = () =>
    page.waitForFunction(() => {
      const state = JSON.parse(document.querySelector('[aria-label="Shortcut SDK readback"]').textContent)
      return state.values[2].every((value) => value === null)
    })
  const rowCell = { x: 390, y: 80 }
  const reset = async () => {
    await root.getByRole('button', { name: 'Reset dispatch', exact: true }).click()
    await ready()
  }
  await ready()
  const baseline = await read()
  for (let cycle = 0; cycle < 3; cycle++) {
    await root.getByRole('button', { name: 'Select C3', exact: true }).click()
    assert.equal((await read()).selected, 'C3')
    await grid.click({ position: rowCell })
    await page.keyboard.press('Delete')
    await waitCleared()
    const cleared = await read()
    assert.equal(cleared.executions, 1)
    assert.ok(cleared.formulas[2].every((formula) => formula === ''))
    assert.deepEqual(cleared.backgrounds, baseline.backgrounds)
    assert.deepEqual(cleared.values.slice(3), baseline.values.slice(3))
    await page.keyboard.press('Delete')
    await root.locator('[role="status"]').filter({ hasText: 'already empty' }).waitFor()
    assert.equal((await read()).executions, 2)
    await page.keyboard.press('Control+z')
    await ready()
    assert.deepEqual((await read()).values, baseline.values)
    assert.deepEqual((await read()).formulas, baseline.formulas)
    await page.keyboard.press('Control+y')
    await waitCleared()
    await page.keyboard.press('Control+z')
    await ready()
    await reset()
  }
  report.checks.push(
    'Native Delete at C3 clears A3:H3 and its formula, preserves fill/other rows; repeated empty action is honest; Undo and three resets restore data',
  )
  await root.getByRole('button', { name: 'Select B4:C5', exact: true }).click()
  assert.equal((await read()).selected, 'B4:C5')
  const bounds = await grid.boundingBox()
  await page.mouse.move(bounds.x + 220, bounds.y + 104)
  await page.mouse.down()
  await page.mouse.move(bounds.x + 390, bounds.y + 128, { steps: 5 })
  await page.mouse.up()
  assert.equal((await read()).selected, 'B4:C5')
  await page.keyboard.press('Delete')
  let state = await read()
  assert.deepEqual(state.values[3].slice(1, 3), [null, null])
  assert.deepEqual(state.values[4].slice(1, 3), [null, null])
  assert.deepEqual(state.values[2], baseline.values[2])
  assert.deepEqual(state.formulas, baseline.formulas)
  assert.deepEqual(state.backgrounds, baseline.backgrounds)
  await page.keyboard.press('Control+z')
  await ready()
  await reset()
  report.checks.push(
    'Native dragged B4:C5 selection clears exactly its four cells and retains formulas outside the range',
  )

  await grid.click({ position: rowCell })
  const input = root.getByRole('textbox', { name: 'Host input', exact: true })
  await input.fill('Keep this text')
  await input.press('Home')
  await input.press('Delete')
  assert.equal(await input.inputValue(), 'eep this text')
  assert.equal((await read()).executions, 0)
  assert.deepEqual((await read()).values, baseline.values)
  await grid.dblclick({ position: rowCell })
  await page.keyboard.press('Home')
  await page.keyboard.press('Delete')
  assert.equal((await read()).executions, 0)
  await page.keyboard.press('Escape')
  assert.deepEqual((await read()).values, baseline.values)
  report.checks.push('Host text input and native cell editing do not execute the custom clear command')
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((node) => getComputedStyle(node).backgroundColor),
    'rgb(255, 255, 255)',
  )
  await root.screenshot({ path: path.join(directory, 'light.png') })
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await root.getByRole('button', { name: 'Select C3', exact: true }).focus()
    await page.keyboard.press('Enter')
    assert.equal((await read()).selected, 'C3')
    await reset()
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  report.checks.push('White native workbench; host selection/reset and keyboard activation at 760/390/320px')
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.custom-shortcuts-demo[data-theme="${theme}"]`).waitFor()
      await ready()
      await grid.click({ position: rowCell })
      await page.keyboard.press('Delete')
      await waitCleared()
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    report.checks.push('Documentation theme replacement preserves functioning native custom shortcuts')
    for (const [locale, title, headings] of [
      ['en-US', 'Custom Shortcuts', ['Variants', 'Actions', 'States']],
      ['zh-CN', '自定义快捷键', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/custom-shortcuts`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const frame = page.frameLocator('iframe').first()
      await frame.getByRole('button', { name: 'Select C3', exact: true }).click()
      await frame.locator('canvas[id^="univer-sheet-main-canvas"]:visible').click({ position: rowCell })
      await page.keyboard.press('Delete')
      await frame.locator('[role="status"]').filter({ hasText: 'contents cleared by FRange.clearContent()' }).waitFor()
      const embeddedState = JSON.parse(await frame.locator('[aria-label="Shortcut SDK readback"]').textContent())
      assert.ok(embeddedState.values[2].every((value) => value === null))
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push('English/Chinese card-free detail pages and a working embedded native shortcut')
  }
  const macPage = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  })
  macPage.on('pageerror', (error) => report.errors.push(error.stack || error.message))
  macPage.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
  })
  await macPage.addInitScript(() => Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' }))
  await macPage.goto(url, { waitUntil: 'load', timeout: 180000 })
  await macPage.waitForFunction(() => {
    const text = document.querySelector('[aria-label="Shortcut SDK readback"]')?.textContent
    return text && JSON.parse(text).values[2][4] === 252
  })
  assert.match(await macPage.evaluate(() => navigator.appVersion), /Mac/)
  await macPage.locator('canvas[id^="univer-sheet-main-canvas"]:visible').click({ position: rowCell })
  await macPage.keyboard.press('Backspace')
  await macPage.waitForFunction(() =>
    JSON.parse(document.querySelector('[aria-label="Shortcut SDK readback"]').textContent).values[2].every(
      (value) => value === null,
    ),
  )
  assert.equal(JSON.parse(await macPage.locator('[aria-label="Shortcut SDK readback"]').textContent()).executions, 1)
  await macPage.close()
  report.checks.push(
    'Chromium with simulated macOS platform selects the Backspace mapping; this is not physical macOS validation',
  )
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
assert.ok(report.passed, 'Custom shortcuts must change SDK content through Facade without stealing text-input keys')
