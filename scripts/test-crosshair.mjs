/* eslint-disable no-await-in-loop -- Inspect one native selection and palette at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/crosshair-highlighting'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/crosshair')
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
const overWhite = (rgba) => rgba.slice(0, 3).map((channel) => (channel * rgba[3]) / 255 + 255 - rgba[3])
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
const report = { passed: false, status: 'not-run', errors: [], checks: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.crosshair-demo')
  const ready = () => page.locator('.crosshair-demo[data-ready="true"]').waitFor({ timeout: 90000 })
  const read = async () => JSON.parse(await root.locator('pre').textContent())
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const wait = (check, arg) =>
    page.waitForFunction(
      ({ predicate, arg: value }) => {
        const text = document.querySelector('.crosshair-demo pre')?.textContent
        return text && new Function('s', 'a', `return (${predicate})(s,a)`)(JSON.parse(text), value)
      },
      { predicate: check.toString(), arg },
    )
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const pixel = async (x, y) =>
    grid.evaluate(
      (canvas, { x: sampleX, y: sampleY }) => {
        const box = canvas.getBoundingClientRect()
        return [
          ...canvas
            .getContext('2d')
            .getImageData(
              Math.floor((sampleX * canvas.width) / box.width),
              Math.floor((sampleY * canvas.height) / box.height),
              1,
              1,
            ).data,
        ]
      },
      { x, y },
    )
  const css = async () => {
    const native = await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      white: getComputedStyle(el).getPropertyValue('--univer-gray-0').trim(),
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
    if ((await root.getAttribute('data-theme')) === 'light') assert.equal(native.background, 'rgb(255, 255, 255)')
    assert.ok(native.white)
    assert.equal(native.flex, 'flex')
  }
  const action = async (name, rejected = false) => {
    await root.locator(`[data-action="${name}"]`).click()
    await ready()
    await settle()
    const status = await root.getByRole('status').textContent()
    if (rejected) assert.match(status, /Action rejected:/)
    else assert.doesNotMatch(status, /Action rejected:/)
    await css()
  }
  const sample = async (value) => {
    await root.getByRole('combobox', { name: 'Selection sample' }).selectOption(value)
    const canonical = { '4:4': 'A4:H4', 'C:C': 'C1:C24' }[value] || value
    await wait((s, a) => s.selections[0]?.address === a, canonical)
    await settle()
  }
  await ready()
  await wait((s) => s.sheets[0].values[1][6] === 11)
  const baseline = (await read()).sheets
  assert.equal((await read()).enabled, true)
  assert.equal((await read()).eventCount, 1)
  assert.equal(await root.locator('[data-action="enable"]').isDisabled(), true)
  const band = await pixel(250, 140),
    selected = await pixel(365, 140),
    outside = await pixel(250, 175)
  await root.screenshot({ path: path.join(directory, 'initial.png') })
  await action('disable')
  const noBand = await pixel(250, 140)
  assert.notDeepEqual(band, noBand, 'Native row band disappears')
  assert.deepEqual(await pixel(365, 140), selected, 'Active cell is not tinted by crosshair')
  assert.deepEqual(await pixel(250, 175), outside, 'Unrelated cell is unchanged')
  assert.deepEqual((await read()).sheets, baseline)
  assert.equal((await read()).enabledEvents.at(-1).enabled, false)
  await action('enable')
  assert.deepEqual(await pixel(250, 140), band)
  assert.equal((await read()).eventCount, 3)
  report.checks.push(
    'Native band pixels toggle while active/outside pixels, two-sheet data, formulas and styles remain unchanged; actual enabled events',
  )

  for (const value of ['C4:E6', 'A11:B11', 'A1', 'H24', '4:4', 'C:C', 'C4']) {
    await sample(value)
    assert.deepEqual((await read()).sheets, baseline)
    if (value === 'H24') await wait((s) => s.viewport && s.viewport.endRow >= 23 && s.viewport.endColumn >= 7)
    if (value === '4:4' || value === 'C:C') {
      const on = await grid.screenshot()
      await action('disable')
      const off = await grid.screenshot()
      assert.deepEqual(on, off, 'Full-dimension selections suppress the crosshair render')
      await action('enable')
    }
  }
  // Native drag and arrow keys, not a synthetic host selection display.
  await grid.click({ position: { x: 390, y: 140 } })
  await page.keyboard.press('Escape')
  await page.keyboard.press('ArrowRight')
  await wait((s) => s.selections[0]?.address === 'D4')
  const box = await grid.boundingBox()
  await page.mouse.move(box.x + 370, box.y + 140)
  await page.mouse.down()
  await page.mouse.move(box.x + 580, box.y + 200, { steps: 8 })
  await page.mouse.up()
  await wait((s) => s.selections[0]?.address === 'C4:E6')
  await sample('C4')
  report.checks.push(
    'Single, rectangular, merged, edge and full-dimension selections; actual far-cell viewport, native drag/arrow selection and preserved cells',
  )

  await action('disable')
  await root.getByRole('combobox', { name: 'Worksheet' }).selectOption('archive')
  await wait((s) => s.activeSheet === 'archive')
  assert.equal((await read()).enabled, false)
  await action('enable')
  await root.getByRole('combobox', { name: 'Worksheet' }).selectOption('rooms')
  await wait((s) => s.activeSheet === 'rooms')
  assert.equal((await read()).enabled, true)
  await page.getByRole('tab', { name: 'View', exact: true }).click()
  const menu = root.locator(
    '[data-u-comp="ribbon-toolbar"] [data-u-command="sheet.operation.toggle-crosshair-highlight"]:visible',
  )
  await menu.locator('.univer-toolbar-button-selector-main').click()
  await wait((s) => s.enabled === false)
  const beforePalette = await read()
  await menu.locator('.univer-toolbar-button-selector-trigger').click()
  const swatches = page.locator('[role="menu"] .univer-grid-cols-8 > div')
  await swatches.first().waitFor()
  assert.equal(await swatches.count(), 16)
  report.palette = await swatches.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundColor))
  await swatches.nth(1).click()
  await page.keyboard.press('Escape')
  await swatches.first().waitFor({ state: 'hidden' })
  await wait((s) => s.enabled === true)
  await settle()
  assert.notDeepEqual(await pixel(250, 140), band, 'Native red palette changes band pixels')
  assert.deepEqual((await read()).sheets, baseline)
  const afterPalette = await read()
  report.paletteEnableEvent = {
    beforeEnabled: beforePalette.enabled,
    afterEnabled: afterPalette.enabled,
    beforeCount: beforePalette.eventCount,
    afterCount: afterPalette.eventCount,
  }
  await root.screenshot({ path: path.join(directory, 'native-palette.png') })
  if (observe)
    assert.equal(
      afterPalette.eventCount,
      beforePalette.eventCount,
      'Known beta.2 palette path omits EnabledChanged; do not count a synthetic event',
    )
  else
    assert.equal(
      afterPalette.eventCount,
      beforePalette.eventCount + 1,
      'Native palette auto-enable must deliver the advertised EnabledChanged notification',
    )
  report.checks.push(
    'Shared instance state, native toolbar toggle, sixteen palette presets and real recoloring; palette-enabled event omission explicitly observed',
  )

  const red = await pixel(250, 140)
  await menu.locator('.univer-toolbar-button-selector-trigger').click()
  await swatches.nth(9).click()
  await page.keyboard.press('Escape')
  await swatches.first().waitFor({ state: 'hidden' })
  await settle()
  const paleRed = await pixel(250, 140)
  report.opacityPixels = { red, paleRed }
  assert.notDeepEqual(paleRed, red, 'Native 15% red differs from 30% red')
  // Canvas pixels retain alpha; the native white workbench is behind the canvas.
  assert.ok(
    overWhite(paleRed)[1] > overWhite(red)[1] && overWhite(paleRed)[2] > overWhite(red)[2],
    'Lower opacity approaches the white workbench background',
  )
  assert.deepEqual(await pixel(365, 140), selected)
  assert.deepEqual((await read()).sheets, baseline)
  await menu.locator('.univer-toolbar-button-selector-trigger').click()
  await swatches.nth(1).click()
  await page.keyboard.press('Escape')
  await swatches.first().waitFor({ state: 'hidden' })
  await settle()
  assert.deepEqual(await pixel(250, 140), red)
  assert.equal(
    (await read()).eventCount,
    afterPalette.eventCount,
    'Recoloring an enabled instance is not an enable event',
  )
  report.checks.push(
    'Native 30%/15% opacity presets change actual pixels without tinting the active cell or changing cell data',
  )

  await grid.click({ position: { x: 390, y: 140 } })
  await page.keyboard.press('Escape')
  await page.keyboard.press('F2')
  await page.keyboard.press('Control+a')
  await page.keyboard.type('6.25')
  await page.keyboard.press('Enter')
  await wait((s) => s.sheets[0].values[3][2] === 6.25 && s.sheets[0].values[3][6] === 14.75)
  const edited = (await read()).sheets
  assert.deepEqual(edited[1], baseline[1], 'Editing this week preserves last week')
  await sample('C4:E6')
  await action('reload')
  await wait((s) => s.sheets[0].values[1][6] === 11 && s.selections[0]?.address === 'C4')
  assert.equal((await read()).enabled, true)
  assert.deepEqual(await pixel(250, 140), red)
  assert.deepEqual((await read()).sheets, edited)
  const selection = (await read()).selections
  for (const address of ['nonsense', 'A0', 'I1', 'C25', 'E6:C4', 'Other!C4']) {
    await root.getByRole('textbox', { name: 'Range address' }).fill(address)
    await action('go', true)
    assert.deepEqual((await read()).selections, selection)
    assert.deepEqual((await read()).sheets, edited)
  }
  await root.getByRole('textbox', { name: 'Range address' }).fill('D5:F6')
  await action('go')
  await wait((s) => s.selections[0]?.address === 'D5:F6')
  await action('empty')
  await wait((s) => s.sheets.length === 1 && s.sheets[0].values[1].every((v) => v === null))
  assert.equal((await read()).enabled, true)
  assert.equal((await read()).eventCount, 1)
  assert.equal(await root.getByRole('combobox', { name: 'Worksheet' }).isDisabled(), true)
  await action('disable')
  await action('reload')
  assert.equal((await read()).enabled, false)
  await action('reset')
  await wait((s) => s.sheets[0].values[1][6] === 11)
  assert.deepEqual((await read()).sheets, baseline)
  assert.equal((await read()).eventCount, 1)
  assert.deepEqual(await pixel(250, 140), band, 'Full owner reset restores default palette')
  report.checks.push(
    'Native edit and recalculated formula survive snapshot reload with palette/enabled state; full owner reset restores defaults; rejected host ranges retain edited data/selection; genuine empty table',
  )

  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await action('reset')
    await wait((s) => s.sheets[0].values[1][6] === 11)
    if (width < 600) await wait((s) => s.viewport?.startColumn === 2 && s.selections[0]?.address === 'C4')
    assert.deepEqual((await read()).sheets, baseline)
    await root.locator('[data-action="disable"]').focus()
    await page.keyboard.press('Enter')
    await wait((s) => s.enabled === false)
    await root.locator('.crosshair-controls > summary').click()
    assert.ok((await grid.boundingBox()).y < 450)
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
    await root.locator('.crosshair-controls > summary').click()
    await root.locator('[data-action="enable"]').focus()
    await page.keyboard.press('Enter')
    await wait((s) => s.enabled === true)
  }
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await ready()
  await wait((s) => s.viewport?.startColumn === 2 && s.selections[0]?.address === 'C4')
  assert.equal(await root.locator('.crosshair-controls').evaluate((el) => el.open), false)
  assert.ok((await grid.boundingBox()).y < 450)
  await root.locator('.crosshair-controls > summary').click()
  await action('disable')
  await action('enable')
  report.checks.push(
    'Three owner resets, 760/390/320 keyboard controls, collapsed panel and functional fresh-mobile entry',
  )
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.crosshair-demo[data-theme="${theme}"][data-ready="true"]`).waitFor()
      await wait((s) => s.sheets[0].values[1][6] === 11)
      assert.deepEqual((await read()).sheets, baseline)
      await action('disable')
      await action('enable')
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    for (const [locale, title, headings] of [
      ['en-US', 'Crosshair highlighting', ['Variants', 'Actions', 'States']],
      ['zh-CN', '十字高亮', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/crosshair-highlighting`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.crosshair-demo[data-ready="true"]').waitFor()
      const branch = page.locator('aside button').first()
      await branch.click()
      await page.waitForFunction(
        () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
      )
      await branch.click()
      await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
      await embedded.locator('[data-action="disable"]').click()
      const frame = page.frames().find((f) => f.url().includes('/playground/'))
      await frame.waitForFunction(
        () => JSON.parse(document.querySelector('.crosshair-demo pre').textContent).enabled === false,
      )
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push('Light/dark, EN/ZH card-free detail pages, hydrated tree and real iframe toggle')
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
  report.status = observe ? 'passed-with-known-sdk-defect' : 'passed'
} catch (error) {
  report.failure = error.stack || String(error)
  report.status = 'failed'
  report.readback = await page
    .locator('.crosshair-demo pre')
    .textContent({ timeout: 1000 })
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify({ ...report, readback: undefined }, null, 2))
assert.ok(report.passed)
