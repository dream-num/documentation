/* eslint-disable no-await-in-loop -- Compare render modes sequentially on one live workbook. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/list-validation')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [], writes: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method())) report.writes.push(request.url())
})
await page.addInitScript(() => {
  window.listPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    window.listPaint.push(String(text))
    if (window.listPaint.length > 10000) window.listPaint.splice(0, 5000)
    return fillText.call(this, text, ...args)
  }
})
const root = page.locator('.list-validation-demo')
const button = (action) => root.locator(`[data-action="${action}"]`)
const read = () => root.locator('pre').evaluate((el) => JSON.parse(el.textContent))
const downloadSnapshot = async (name) => {
  const pending = page.waitForEvent('download')
  await button('download').click()
  const download = await pending
  assert.equal(download.suggestedFilename(), 'morrow-museum-validation.json')
  const filename = path.join(directory, `${name}.json`)
  await download.saveAs(filename)
  return JSON.parse(await fs.readFile(filename, 'utf8'))
}
// Reapplying a builder creates a new rule UID. Retain every other saved field,
// including ranges, rendering, geometry, styles, cells and all other resources.
const withoutRuleIds = (snapshot) => {
  const copy = structuredClone(snapshot)
  for (const resource of copy.resources ?? []) {
    if (resource.name !== 'SHEET_DATA_VALIDATION_PLUGIN') continue
    const data = JSON.parse(resource.data)
    for (const rules of Object.values(data)) for (const rule of rules) delete rule.uid
    resource.data = data
  }
  return copy
}
const until = (predicate) =>
  page.waitForFunction(
    `(() => { const el = document.querySelector('.list-validation-readback pre'); if (!el?.textContent) return false; const s = JSON.parse(el.textContent); return (${predicate}); })()`,
  )
const selectAddress = async (address) => {
  const box = root.locator('.list-validation-editor input.univer-size-full').first()
  await box.fill(address)
  await box.press('Enter')
}
const nativeEdit = async (address, value) => {
  await selectAddress(address)
  await page.keyboard.type(value)
  await page.keyboard.press('Enter')
}
const settleAnimations = () =>
  page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    )
  })
try {
  await page.goto(process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/list-validation', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.locator('.list-validation-demo[data-ready=true]').waitFor({ timeout: 120000 })
  await until('s.validation.flat().length === 30')
  const initial = await read()
  assert.equal(initial.values.length, 31)
  assert.equal(new Set(initial.values.slice(1).map((row) => row[0])).size, 30)
  assert.equal(initial.validation.flat()[2], 'invalid')
  assert.equal(initial.validation.flat()[3], 'valid')
  assert.equal(initial.validation.flat()[29], 'invalid')
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  )
  report.checks.push('Thirty distinct records, blank/invalid/multi-value boundaries and native white workbench')
  const initialSnapshot = await downloadSnapshot('snapshot-initial')
  assert.equal(initialSnapshot.sheets.intake.cellData[33][1].v, initial.reviewDate)

  const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]')
  await canvas.click({ position: { x: 459, y: 66 } })
  await page.getByText('Select an item', { exact: true }).waitFor()
  await settleAnimations()
  report.dropdownStyle = await page.getByText('Select an item', { exact: true }).evaluate((el) => ({
    background: getComputedStyle(el.parentElement).backgroundColor,
    opacity: getComputedStyle(el.closest('section')).opacity,
  }))
  assert.deepEqual(report.dropdownStyle, { background: 'rgb(255, 255, 255)', opacity: '1' })
  await page.screenshot({ path: path.join(directory, 'native-dropdown.png') })
  await page.getByText('Paper', { exact: true }).last().click()
  await until('s.values[1][1] === "Paper" && s.validation.flat()[0] === "valid"')
  await page.waitForFunction(() => window.listPaint.includes('Paper'))
  report.checks.push('Real native dropdown selection changes the Facade value and renders the selected material')
  await selectAddress('B2')
  await page.keyboard.press('Control+z')
  await until('s.values[1][1] === "Ceramics"')
  await page.keyboard.press('Control+y')
  await until('s.values[1][1] === "Paper"')
  report.checks.push('Native single-dropdown selection supports Undo and Redo')
  if (process.argv.includes('--clipboard')) {
    const beforePaste = (await read()).values
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.evaluate(() => navigator.clipboard.writeText('Wood\nNot a material\nPaper'))
    report.clipboardInput = await page.evaluate(() => navigator.clipboard.readText())
    assert.deepEqual(report.clipboardInput.split(/\r?\n/), ['Wood', 'Not a material', 'Paper'])
    await page.keyboard.press('Control+v')
    await until('s.values[3][1] === "Paper" && s.values[2][1].startsWith("Not a material")')
    const pasted = await read()
    report.clipboardValues = pasted.values.slice(1, 4).map((row) => row[1])
    await page.screenshot({ path: path.join(directory, 'native-paste-warning.png') })
    assert.deepEqual(
      report.clipboardValues,
      ['Wood', 'Not a material', 'Paper'],
      'Native paste must preserve exact cell text, including no invented trailing spaces',
    )
    assert.deepEqual(
      ['B2', 'B3', 'B4'].map((address) => pasted.validationByCell[address]),
      ['valid', 'invalid', 'valid'],
    )
    await page.keyboard.press('Control+z')
    await until('s.values[1][1] === "Paper" && s.values[2][1] === "Textiles" && s.values[3][1] === "Unknown"')
    assert.deepEqual((await read()).values, beforePaste)
    report.checks.push(
      'Native dropdown Undo/Redo and real three-row clipboard paste; warning-mode validation and one-step paste Undo preserve all other cells',
    )
  }

  await root.getByLabel('List selection', { exact: true }).selectOption('multiple')
  await button('apply').click()
  await until('s.rules[0].type === "listMultiple" && s.validation.flat()[29] === "valid"')
  assert.equal((await read()).values[30][1], 'Paper,Textiles')
  await canvas.click({ position: { x: 470, y: 65 } })
  await page.getByText('Select items', { exact: true }).waitFor()
  await page.getByText('Metal', { exact: true }).last().click()
  await until(
    's.values[1][1].includes("Metal") && s.values[1][1].includes("Paper") && s.validationByCell.B2 === "valid"',
  )
  await settleAnimations()
  await page.screenshot({ path: path.join(directory, 'native-multiple.png') })
  await page.getByText('Paper', { exact: true }).last().click()
  await until('JSON.stringify(JSON.parse(s.values[1][1])) === JSON.stringify(["Metal"])')
  await root.locator('.list-validation-controls summary').click()
  await root.locator('.list-validation-controls summary').click()
  await button('valid').click()
  await until('s.values[1][1].includes("Textiles") && s.validation.flat()[0] === "valid"')
  await root.getByLabel('List selection', { exact: true }).selectOption('single')
  await button('apply').click()
  await until('s.rules[0].type === "list" && s.validation.flat()[0] === "invalid"')
  report.checks.push(
    'Native multi-select adds and removes individual options; switching rules revalidates existing values without sanitizing them',
  )

  await root.getByLabel('Allow invalid input', { exact: true }).uncheck()
  await button('apply').click()
  await until('s.rules[0].errorStyle === 1') // DataValidationErrorStyle.STOP
  await nativeEdit('B4', 'Not a material')
  await page.getByText('Choose a material from the configured list.', { exact: true }).waitFor()
  await settleAnimations()
  await page.screenshot({ path: path.join(directory, 'native-reject.png') })
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await until('s.values[3][1] === "Unknown"')
  await root.getByLabel('Allow invalid input', { exact: true }).check()
  await button('apply').click()
  await until('s.rules[0].errorStyle === 2') // DataValidationErrorStyle.WARNING
  await nativeEdit('B4', 'Not a material')
  await until('s.values[3][1] === "Not a material" && s.validationByCell.B4 === "invalid"')
  await root.getByLabel('Target cell', { exact: true }).selectOption('B4')
  await button('invalid').click()
  await until('s.values[3][1] === "Unknown"')
  assert.equal(await button('invalid').isDisabled(), true)
  report.checks.push(
    'Native STOP rejects invalid typing; WARNING retains and marks it; repeated identical sample writes are disabled',
  )

  for (const render of ['1', '0', '2']) {
    await root.getByLabel('List appearance', { exact: true }).selectOption(render)
    await button('apply').click()
    await until(`s.rules[0].renderMode === ${render}`)
    await page.screenshot({ path: path.join(directory, `render-${render}.png`) })
  }
  await root.getByLabel('Target cell', { exact: true }).selectOption('B5')
  await button('select').click()
  await root.getByLabel('Allow blank', { exact: true }).uncheck()
  await button('apply').click()
  await until('s.rules[0].allowBlank === false && s.validation.flat()[3] === "invalid"')
  await button('valid').click()
  await until('s.values[4][1] === "Paper" && s.validation.flat()[3] === "valid"')
  await button('invalid').click()
  await until('s.values[4][1] === "Unknown" && s.validation.flat()[3] === "invalid"')
  await button('blank').click()
  await until('!s.values[4][1] && s.validation.flat()[3] === "invalid"')
  report.checks.push('All three render modes and allowBlank policy; valid/invalid/clear Facade operations')

  await root.getByLabel('List source', { exact: true }).selectOption('range')
  await button('apply').click()
  await until('s.rules[0].formula1.startsWith("=")')
  await nativeEdit('H2', 'Unknown')
  await until('s.sourceValues[0][0] === "Unknown" && s.validation.flat()[2] === "valid"')
  await nativeEdit('B34', '2028-08-19T12:00:00Z')
  await until('s.reviewDate === "2028-08-19T12:00:00Z"')
  const beforeReload = await read()
  const savedBeforeReload = await downloadSnapshot('snapshot-edited')
  await button('reload').click()
  await until(
    's.sourceValues[0][0] === "Unknown" && s.rules[0].formula1.startsWith("=") && s.validation.flat()[2] === "valid"',
  )
  assert.deepEqual((await read()).values, beforeReload.values)
  assert.deepEqual((await read()).rules, beforeReload.rules)
  assert.equal((await read()).reviewDate, beforeReload.reviewDate)
  assert.deepEqual(await downloadSnapshot('snapshot-reloaded'), savedBeforeReload)
  report.checks.push('Native edits of H2:H6 update range-source validation; save/reload retains values and exact rules')

  await button('remove').click()
  await until('s.rules.length === 0')
  assert.deepEqual((await read()).values, beforeReload.values)
  assert.equal(await button('remove').isDisabled(), true)
  await button('apply').click()
  await until('s.rules.length === 1')
  await button('empty').click()
  await until('s.values.slice(1).every(row => !row[1])')
  assert.equal(await button('empty').isDisabled(), true)
  await nativeEdit('B5', '0')
  await until('s.values[4][1] === 0')
  assert.equal(await button('blank').isDisabled(), false, 'Numeric zero is not an empty cell')
  assert.equal(await button('empty').isDisabled(), false, 'Numeric zero keeps the category range nonempty')
  await button('blank').click()
  await until('s.values[4][1] === "" || s.values[4][1] == null')
  assert.equal(await button('blank').isDisabled(), true)
  report.checks.push(
    'A native numeric-zero category remains clearable; only null, undefined and empty text disable clear',
  )
  assert.deepEqual(
    (await read()).values.map((row) => row.filter((_, index) => index !== 1)),
    initial.values.map((row) => row.filter((_, index) => index !== 1)),
  )
  await button('reset').focus()
  await page.keyboard.press('Enter')
  await until('s.values[1][1] === "Ceramics" && s.rules[0].type === "list" && s.rules[0].allowBlank')
  assert.deepEqual((await read()).values, initial.values)
  assert.equal((await read()).reviewDate, initial.reviewDate)
  assert.deepEqual(withoutRuleIds(await downloadSnapshot('snapshot-reset')), withoutRuleIds(initialSnapshot))
  report.checks.push(
    'Rule removal preserves values; empty keeps object records; keyboard Reset restores all seeded cells and review date',
  )
  for (const state of ['empty', 'error', 'removed', 'default']) {
    await root.getByLabel('Fixture to load', { exact: true }).selectOption(state)
    await button('state').focus()
    await page.keyboard.press('Enter')
    await until(`s.loadedFixture === '${state}'`)
    const loaded = await read()
    assert.equal(loaded.reviewDate, initial.reviewDate)
    assert.deepEqual(loaded.sourceValues, initial.sourceValues)
    assert.deepEqual(
      loaded.values.map((row) => row.filter((_, i) => i !== 1)),
      initial.values.map((row) => row.filter((_, i) => i !== 1)),
    )
    if (state === 'empty') {
      assert.ok(loaded.values.slice(1).every((row) => row[1] === ''))
      assert.ok(loaded.validation.flat().every((value) => value === 'valid'))
    } else if (state === 'error') {
      assert.equal(loaded.values[1][1], 'Glass')
      assert.equal(loaded.values[2][1], 'ceramic')
      assert.equal(loaded.values[5][1], 0)
      for (const address of ['B2', 'B3', 'B4', 'B5', 'B6', 'B31'])
        assert.equal(loaded.validationByCell[address], 'invalid')
      assert.equal(loaded.rules[0].allowBlank, false)
    } else if (state === 'removed') {
      assert.equal(loaded.rules.length, 0)
      assert.deepEqual(loaded.values, initial.values)
    } else {
      assert.deepEqual(withoutRuleIds(await downloadSnapshot('snapshot-default')), withoutRuleIds(initialSnapshot))
    }
    await page.screenshot({ path: path.join(directory, `fixture-${state}.png`) })
  }
  report.checks.push(
    'Four executable fixture states restore non-category data and the live B34 date; full downloaded snapshots survive reload exactly and reset except new rule UIDs',
  )
  await page.screenshot({ path: path.join(directory, 'list-validation.png') })
  await page.setViewportSize({ width: 390, height: 900 })
  await root.locator('.list-validation-controls summary').click()
  assert.ok((await canvas.evaluate((el) => el.getBoundingClientRect().height)) > 200)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await page.screenshot({ path: path.join(directory, 'narrow.png') })
  if (process.env.SHOWCASE_DETAILS === '1') {
    const detail = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
    detail.on('pageerror', (error) => report.errors.push(error.message))
    detail.on('console', (message) => {
      if (message.type() === 'error') report.errors.push(message.text())
    })
    for (const [locale, title, sections] of [
      ['en-US', 'List Data Validation', ['Variants', 'Actions', 'States']],
      ['zh-CN', '下拉列表数据验证', ['变体', '操作', '状态']],
    ]) {
      const origin = new URL(process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030').origin
      const response = await detail.goto(`${origin}/${locale}/showcase/sheets/list-validation`, {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      })
      assert.equal(response.status(), 200)
      await detail.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
      for (const name of sections) assert.equal(await detail.getByRole('heading', { name, exact: true }).count(), 0)
      const sidebar = detail.locator('aside')
      assert.equal(await sidebar.getByRole('link', { name: title, exact: true }).count(), 1)
      assert.equal(await sidebar.getByRole('button', { expanded: true }).count(), 3)
      const frame = detail.frameLocator('iframe').first()
      await frame.locator('.list-validation-demo[data-ready=true]').waitFor({ timeout: 120000 })
      await frame.getByLabel('Allow blank', { exact: true }).uncheck()
      await frame.locator('[data-action=apply]').click()
      await frame.locator('pre').filter({ hasText: '"allowBlank": false' }).waitFor({ state: 'attached' })
      assert.equal(JSON.parse(await frame.locator('pre[aria-label]').textContent()).validationByCell.B5, 'invalid')
      for (const width of [390, 320]) {
        await detail.setViewportSize({ width, height: 900 })
        assert.ok(await detail.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      }
      await detail.screenshot({ path: path.join(directory, `detail-${locale}.png`) })
      await detail.setViewportSize({ width: 1440, height: 1000 })
    }
    await detail.close()
    report.checks.push(
      'English/Chinese card-free detail pages, four-level navigation and actual iframe rule changes; no page overflow at 390/320px',
    )
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.writes, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.lastReadback = await read().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await browser.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
}
console.log(JSON.stringify(report, null, 2))
assert.equal(report.passed, true)
