/* eslint-disable no-await-in-loop -- Compare scopes and native input in one actual workbook. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/custom-header'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/custom-header')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
const report = { passed: false, errors: [], checks: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
await page.addInitScript(() => {
  window.headerPaint = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
    window.headerPaint.push({
      text: String(text),
      color: this.fillStyle,
      align: this.textAlign,
      font: this.font,
      canvas: this.canvas.id,
    })
    if (window.headerPaint.length > 4000) window.headerPaint.splice(0, 2000)
    return original.call(this, text, ...rest)
  }
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.custom-header-demo')
  const ready = () => root.locator('xpath=self::*[@data-ready="true"]').waitFor()
  const read = async () => JSON.parse(await root.locator('pre[aria-label]').textContent())
  const wait = (predicate, argument) =>
    page.waitForFunction(
      ({ check, expected }) => {
        const text = document.querySelector('.custom-header-demo pre[aria-label]')?.textContent
        return text && new Function('s', 'a', `return (${check})(s,a)`)(JSON.parse(text), expected)
      },
      { check: predicate.toString(), expected: argument },
    )
  const paint = (text, color, align) =>
    page.waitForFunction(
      ({ text: expectedText, color: expectedColor, align: expectedAlign }) => {
        const item = window.headerPaint.findLast((candidate) => candidate.text === expectedText)
        return (
          item && (!expectedColor || item.color === expectedColor) && (!expectedAlign || item.align === expectedAlign)
        )
      },
      { text, color, align },
    )
  const clearPaint = () =>
    page.evaluate(() => {
      window.headerPaint = []
    })
  const action = async (name) => {
    await clearPaint()
    await root.locator(`[data-action="${name}"]`).click()
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  }
  const apply = async (appearance, scope) => {
    await root.getByRole('combobox', { name: 'Header appearance' }).selectOption(appearance)
    await root.getByRole('combobox', { name: 'Header scope' }).selectOption(scope)
    await action('apply')
  }
  await ready()
  await paint('Equipment', '#ffffff')
  await paint('Deposit', '#fde68a', 'right')
  await paint('Slot 3', '#991b1b', 'left')
  const baseline = (await read()).sdk.values
  assert.equal(baseline[0][0], 'Portable projector')
  assert.equal(baseline[2][5], 0)
  assert.equal(baseline[4][2], null)
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const purplePixels = await grid.evaluate((canvas) => {
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, Math.min(canvas.height, 36))
    let count = 0
    for (let i = 0; i < data.length; i += 4)
      if (data[i] === 91 && data[i + 1] === 33 && data[i + 2] === 182 && data[i + 3] === 255) count++
    return count
  })
  assert.ok(purplePixels > 100, 'The native canvas must paint the purple individual Deposit header')
  await root.screenshot({ path: path.join(directory, 'styled.png') })
  report.checks.push(
    'Actual native Canvas text, per-header colors/alignment and purple pixels; original null/zero fixture',
  )

  await grid.click({ position: { x: 160, y: 18 } })
  await wait((s) => s.sdk.selection?.startColumn === 0 && s.sdk.selection.endRow === 29)
  await grid.click({ position: { x: 35, y: 111 } })
  await wait((s) => s.sdk.selection?.startRow === 2 && s.sdk.selection.endColumn === 7)
  report.checks.push('Native semantic row/column headers still select whole rows and columns')
  await action('switch')
  await wait((s) => s.sdk.activeSheet === 'Returns')
  await paint('A')
  assert.equal((await read()).sdk.values[0][0], 'Field recorder')
  await apply('labels', 'workbook')
  await paint('Equipment')
  assert.equal(
    await page.evaluate(() => window.headerPaint.findLast((item) => item.text === 'Deposit')?.color === '#fde68a'),
    false,
  )
  await action('switch')
  await wait((s) => s.sdk.activeSheet === 'Bookings')
  await paint('Deposit', '#fde68a', 'right')
  await action('clear-sheet')
  await paint('Equipment')
  assert.equal(
    await page.evaluate(() => window.headerPaint.findLast((item) => item.text === 'Deposit')?.color === '#fde68a'),
    false,
  )
  await apply('styled', 'sheet')
  await paint('Deposit', '#fde68a', 'right')
  await action('switch')
  await wait((s) => s.sdk.activeSheet === 'Returns')
  await paint('Equipment')
  assert.equal(
    await page.evaluate(() => window.headerPaint.findLast((item) => item.text === 'Deposit')?.color === '#fde68a'),
    false,
  )
  report.checks.push(
    'Workbook labels inherit across sheets; worksheet styles take precedence and clearing reveals defaults',
  )

  await action('size')
  await wait((s) => s.sdk.rowHeader.width === 46 && s.sdk.columnHeader.height === 24)
  await grid.click({ position: { x: 60, y: 12 } })
  await wait(
    (s) => s.sdk.selection?.startColumn === 0 && s.sdk.selection.endColumn === 0 && s.sdk.selection.endRow === 29,
  )
  await grid.click({ position: { x: 20, y: 39 } })
  await wait((s) => s.sdk.selection?.startRow === 0 && s.sdk.selection.endRow === 0 && s.sdk.selection.endColumn === 7)
  await action('switch')
  await wait(
    (s) => s.sdk.activeSheet === 'Bookings' && s.sdk.rowHeader.width === 88 && s.sdk.columnHeader.height === 36,
  )
  await action('clear-all')
  await paint('A')
  assert.deepEqual((await read()).sdk.values, baseline)
  await grid.click({ position: { x: 180, y: 51 } })
  await page.keyboard.press('F2')
  await page.keyboard.press('Control+a')
  await page.keyboard.type('Portable projector XL')
  await page.keyboard.press('Enter')
  await wait((s) => s.sdk.values[0][0] === 'Portable projector XL')
  await apply('styled', 'sheet')
  await paint('Deposit', '#fde68a')
  await action('clear-all')
  await paint('A')
  assert.equal((await read()).sdk.values[0][0], 'Portable projector XL')
  // Refocus a different cell: rapid repeated clicks on A1 can start native editing.
  await grid.click({ position: { x: 360, y: 81 } })
  await page.keyboard.press('Control+z')
  await wait((s) => s.sdk.values[0][0] === 'Portable projector')
  report.checks.push(
    'Dimensions change only the active worksheet; clearing labels preserves cells and native cell Undo',
  )
  for (let cycle = 0; cycle < 3; cycle++) {
    await apply('labels', 'workbook')
    await action('reset')
    await ready()
    await paint('Deposit', '#fde68a')
    assert.deepEqual((await read()).sdk.values, baseline)
    assert.equal((await read()).sdk.rowHeader.width, 88)
    await action('switch')
    await paint('A')
    assert.equal((await read()).sdk.columnHeader.height, 36)
    assert.equal((await read()).sdk.values[0][0], 'Field recorder')
    await action('switch')
    await paint('Deposit', '#fde68a')
  }
  report.checks.push('Three resets restore both datasets, native dimensions and the initial sheet-only styling')
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((node) => getComputedStyle(node).backgroundColor),
    'rgb(255, 255, 255)',
  )
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await clearPaint()
    await root.locator('[data-action="clear-all"]').focus()
    await page.keyboard.press('Enter')
    await paint('A')
    await apply('styled', 'sheet')
    await paint('Equipment', '#ffffff')
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  report.checks.push('Native opaque-white workspace and working keyboard controls at 760/390/320px')
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await clearPaint()
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.custom-header-demo[data-theme="${theme}"]`).waitFor()
      await ready()
      await paint('Deposit', undefined, 'right')
      // The SDK transforms authored Canvas colors in dark mode.
      const depositColor = await page.evaluate(
        () => window.headerPaint.findLast((item) => item.text === 'Deposit').color,
      )
      if (theme === 'light') assert.equal(depositColor, '#fde68a')
      else assert.notEqual(depositColor, '#fde68a')
      assert.deepEqual((await read()).sdk.values, baseline)
      await action('clear-all')
      await paint('A')
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    for (const [locale, title, headings] of [
      ['en-US', 'Custom Header', ['Variants', 'Actions', 'States']],
      ['zh-CN', '自定义行列头', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/custom-header`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.custom-header-demo[data-ready="true"]').waitFor()
      await embedded.locator('[data-action="switch"]').click()
      await embedded.locator('pre[aria-label]').filter({ hasText: 'Field recorder' }).waitFor({ state: 'attached' })
      await embedded.getByRole('combobox', { name: 'Header appearance' }).selectOption('styled')
      await embedded.locator('[data-action="apply"]').click()
      const frame = page.frames().find((item) => item.url().includes('/playground/'))
      await frame.waitForFunction(() =>
        window.headerPaint.some((item) => item.text === 'Deposit' && item.color === '#fde68a'),
      )
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push('Both themes and English/Chinese card-free detail pages with working native-header iframes')
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.lastReadback = await page
    .locator('.custom-header-demo pre[aria-label]')
    .textContent({ timeout: 1000 })
    .catch(() => null)
  report.lastPaint = await page.evaluate(() => window.headerPaint?.slice(-120)).catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') })
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify({ ...report, lastReadback: undefined, lastPaint: undefined }, null, 2))
assert.ok(report.passed, 'Header controls must change native paint/geometry while preserving cell semantics')
