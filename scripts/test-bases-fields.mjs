/* eslint-disable no-await-in-loop -- Follow native field/history transitions and explicit fixture loads in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-fields')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/bases/text-number-currency`
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(45000)
const report = {
  passed: false,
  errors: [],
  expectedDiagnostics: [],
  defects: [],
  checks: [],
  writes: [],
  documentationRequests: [],
  developmentDiagnostics: [],
}
let expectingDiagnostic = false,
  details = false
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() !== 'error') return
  if (
    expectingDiagnostic &&
    /Failed to create update cell operation: Error: \[BaseField\]: (invalid number value|negative numbers are disabled)\./.test(
      message.text(),
    )
  )
    report.expectedDiagnostics.push(message.text())
  else report.errors.push(message.text())
})
page.on('request', (request) => {
  if (!['GET', 'HEAD'].includes(request.method())) {
    const target = new URL(request.url())
    if (
      request.method() === 'POST' &&
      target.origin === new URL(url).origin &&
      target.pathname === '/__nextjs_original-stack-frames'
    )
      report.developmentDiagnostics.push(request.url())
    else if (details && request.frame() === page.mainFrame()) report.documentationRequests.push(request.url())
    else report.writes.push(request.url())
  }
})
await page.addInitScript(() => {
  window.fieldPaint = []
  window.fieldPoints = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    const point = this.getTransform().transformPoint({ x: args[0], y: args[1] })
    const rect = this.canvas.getBoundingClientRect()
    window.fieldPoints.push({
      text: String(text),
      x: rect.x + (point.x * rect.width) / this.canvas.width,
      y: rect.y + (point.y * rect.height) / this.canvas.height,
    })
    if (window.fieldPoints.length > 20000) window.fieldPoints.splice(0, 10000)
    window.fieldPaint.push(String(text))
    if (window.fieldPaint.length > 20000) window.fieldPaint.splice(0, 10000)
    return fillText.call(this, text, ...args)
  }
})
const root = page.locator('.base-fields')
const read = async () => JSON.parse(await root.locator('output').textContent())
const idle = () =>
  page.waitForFunction(
    () =>
      document.querySelector('.base-fields')?.dataset.ready === 'true' &&
      document.querySelector('.base-fields fieldset')?.disabled === false,
  )
const input = (name) => root.locator(`[data-input="${name}"]`)
const click = async (action, error = false, diagnostic = false) => {
  expectingDiagnostic = diagnostic
  await root.locator(`[data-action="${action}"]`).click()
  await idle()
  assert.equal(await root.locator('[role=alert]').isVisible(), error, await root.locator('[role=alert]').textContent())
  expectingDiagnostic = false
  return read()
}
const field = (state) => state.fields.find((item) => item.id === state.fieldId)
const value = (state) => state.records.find((item) => item.id === state.recordId)?.values[state.fieldId]
const choose = async (id) => {
  await input('field').selectOption(id)
  await idle()
}
const expectPaint = (text) => page.waitForFunction((expected) => window.fieldPaint.includes(expected), text)
try {
  await page.goto(url, { waitUntil: 'load', timeout: 300000 })
  await idle()
  const initial = await read()
  assert.equal(initial.records.length, 30)
  assert.equal(Object.keys(initial.snapshot.tables.stations.records).length, 12)
  assert.equal(Object.keys(initial.snapshot.tables.checks.records).length, 18)
  await expectPaint('Replace kettle handle')
  const workbench = root.locator('[data-u-comp="workbench-layout"]')
  assert.equal(await workbench.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
  await root.locator('.base-fields-controls > summary').click()
  const added = await click('add')
  const spare = field(added).id
  assert.equal(field(added).name, 'Spare units')
  assert.equal(field(added).defaultValue, 2)
  assert.ok(added.records.every((row) => !Object.hasOwn(row.values, spare)))
  assert.equal(await root.locator('[data-action=add]').isDisabled(), true)
  await input('value').fill('8.5')
  await input('representation').selectOption('number')
  const written = await click('write')
  assert.equal(value(written), 8.5)
  const converted = await click('convert')
  assert.equal(field(converted).type, 'currency')
  assert.equal(value(converted), 8.5)
  assert.deepEqual(converted.snapshot.tables.repairs.records, written.snapshot.tables.repairs.records)
  assert.equal(converted.lastOperation.nonNumericStoredValues, 0)
  await expectPaint('$8.50')
  const undone = await click('undo')
  assert.deepEqual(undone.snapshot, written.snapshot)
  const redone = await click('redo')
  assert.deepEqual(redone.snapshot, converted.snapshot)
  await input('decimals').selectOption('1')
  await input('separator').selectOption('periodComma')
  await input('symbol').selectOption('€')
  const formatted = await click('format')
  assert.equal(field(formatted).config.currencySymbol, '€')
  assert.deepEqual(formatted.snapshot.tables.repairs.records, converted.snapshot.tables.repairs.records)
  await expectPaint('€8,5')
  await input('value').fill('1250.75')
  await input('representation').selectOption('text')
  const parsed = await click('write')
  assert.equal(value(parsed), 1250.75)
  assert.equal(typeof value(parsed), 'number')
  await expectPaint('€1.250,8')
  await input('value').fill('12kg')
  const rejected = await click('write', true, true)
  assert.deepEqual(rejected.snapshot, parsed.snapshot)
  await input('negative').uncheck()
  const noNegative = await click('format')
  await input('value').fill('-1')
  const negative = await click('write', true, true)
  assert.deepEqual(negative.snapshot, noNegative.snapshot)
  await input('representation').selectOption('clear')
  assert.equal(value(await click('write')), null)
  report.checks.push(
    'Three typed fields, no backfill, numeric parsing, actual currency/separator painting, schema Undo/Redo and unchanged-snapshot invalid/negative rejection',
  )

  await input('default').fill('3.25')
  const typedDefault = await click('default')
  assert.equal(field(typedDefault).defaultValue, 3.25)
  const omitted = await click('record')
  assert.equal(value(omitted), 3.25)
  await input('new-record').selectOption('null')
  assert.equal(value(await click('record')), null)
  await input('new-record').selectOption('zero')
  assert.equal(value(await click('record')), 0)
  const beforeUnsafe = await read()
  await input('default').fill('not a number')
  assert.deepEqual(
    (await click('default', true)).snapshot,
    beforeUnsafe.snapshot,
    'Host validation is explicitly separate and does not mutate the SDK',
  )
  await input('default-mode').selectOption('raw')
  const unsafe = await click('default', true)
  assert.equal(field(unsafe).defaultValue, 'not a number')
  assert.equal(unsafe.lastOperation.invalidNumericDefault, true)
  await input('new-record').selectOption('omitted')
  const unsafeRecord = await click('record')
  assert.equal(value(unsafeRecord), 'not a number')
  report.defects.push('beta.2 accepts a raw string numeric default and copies it into a new record')
  await click('clear-default')
  const beforeReload = await read()
  assert.deepEqual((await click('reload')).snapshot, beforeReload.snapshot)
  await choose('quote')
  await input('type').selectOption('number')
  const oldText = await read()
  const textNumber = await click('convert')
  assert.equal(field(textNumber).type, 'number')
  assert.equal(textNumber.records.find((row) => row.id === 'repairs-01').values.quote, '1250.75')
  assert.deepEqual(textNumber.snapshot.tables.repairs.records, oldText.snapshot.tables.repairs.records)
  assert.ok(textNumber.lastOperation.nonNumericStoredValues > 0)
  assert.equal(await root.locator('.base-fields-comparison').isVisible(), true)
  report.defects.push('beta.2 schema conversion keeps old numeric strings instead of converting stored types')
  await fs.writeFile(
    path.join(directory, 'conversion-and-defaults.json'),
    JSON.stringify({ typedDefault, unsafeRecord, beforeReload, oldText, textNumber }, null, 2),
  )
  const downloadEvent = page.waitForEvent('download')
  await click('download')
  const download = await downloadEvent
  assert.equal(download.suggestedFilename(), 'bracken-field-lab.base.json')
  const downloaded = path.join(directory, 'downloaded.base.json')
  await download.saveAs(downloaded)
  assert.deepEqual(JSON.parse(await fs.readFile(downloaded, 'utf8')), (await read()).snapshot)
  assert.deepEqual((await click('reset')).snapshot, initial.snapshot)
  await root.locator('.base-fields-controls > summary').click()
  await page.evaluate(() => {
    window.fieldPoints = []
  })
  await page.setViewportSize({ width: 1598, height: 1100 })
  await page.waitForFunction(() => window.fieldPoints.some((item) => item.text === 'Replace kettle handle'))
  const titlePoint = await page.evaluate(() =>
    window.fieldPoints.findLast((item) => item.text === 'Replace kettle handle'),
  )
  const numberPoint = await page.evaluate(
    (y) => window.fieldPoints.findLast((item) => item.text === '1,250.750' && Math.abs(item.y - y) < 5),
    titlePoint.y,
  )
  assert.ok(numberPoint, 'Target the first row using native canvas paint coordinates')
  await page.mouse.dblclick(numberPoint.x - 20, numberPoint.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('18.625')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () =>
      JSON.parse(document.querySelector('.base-fields output').textContent).records.find(
        (item) => item.id === 'repairs-01',
      ).values.units === 18.625,
  )
  await expectPaint('18.625')
  await root.locator('.base-fields-controls > summary').click()
  const native = await read()
  assert.deepEqual((await click('undo')).snapshot, initial.snapshot)
  assert.deepEqual((await click('redo')).snapshot, native.snapshot)
  assert.deepEqual((await click('reload')).snapshot, native.snapshot)
  assert.deepEqual((await click('reset')).snapshot, initial.snapshot)
  await page.setViewportSize({ width: 1600, height: 1100 })
  report.checks.push(
    'Native numeric cell typing changes stored precision and paint; full Undo/Redo/reload/Reset snapshots agree',
  )
  report.checks.push(
    'Typed defaults versus null/zero/omitted values, separate host rejection, unsafe SDK-default disclosure, conversion report, exact reload/download and full Reset',
  )

  for (const [decimals, separator, grouping, abbreviation, expected] of [
    ['0', 'commaPeriod', true, 'none', '1,251'],
    ['1', 'commaPeriod', true, 'none', '1,250.8'],
    ['2', 'periodComma', true, 'none', '1.250,75'],
    ['3', 'spaceComma', true, 'none', '1 250,750'],
    ['4', 'spacePeriod', true, 'none', '1 250.7500'],
    ['2', 'commaPeriod', false, 'none', '1250.75'],
    ['2', 'commaPeriod', true, 'K', '1.25K'],
    ['2', 'commaPeriod', true, 'M', '0.00M'],
  ]) {
    await input('decimals').selectOption(decimals)
    await input('separator').selectOption(separator)
    await input('thousands').setChecked(grouping)
    await input('abbreviation').selectOption(abbreviation)
    await page.evaluate(() => {
      window.fieldPaint = []
    })
    const appearance = await click('format')
    assert.deepEqual(appearance.snapshot.tables.repairs.records, initial.snapshot.tables.repairs.records)
    await expectPaint(expected)
  }
  assert.deepEqual((await click('reset')).snapshot, initial.snapshot)
  report.checks.push(
    'Native paint covers all 0–4 decimal choices, four separators, grouping off and K/M, without changing stored record values',
  )

  for (const state of ['empty', 'boundary', 'error', 'default']) {
    await input('state').selectOption(state)
    const loaded = await click('load')
    assert.equal(loaded.records.length, state === 'empty' ? 0 : 30)
    if (state === 'empty') {
      assert.equal(await root.locator('[data-action=write]').isDisabled(), true)
      await input('default-mode').selectOption('safe')
      await input('default').fill('0')
      await click('default')
      assert.equal(value(await click('record')), 0)
    }
    if (state === 'boundary') {
      assert.equal(loaded.records[0].values.units, 0.0001)
      assert.equal(loaded.records[1].values.units, 9999999.875)
      assert.ok(loaded.records[2].values.note.includes('Thread colour — café repair'))
    }
    if (state === 'error') assert.equal(loaded.records[0].values.quote, 'not a number')
    await input('state').selectOption(state)
    assert.deepEqual((await click('load')).snapshot, loaded.snapshot, 'A repeated fixture load is deterministic')
  }
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await input('add').selectOption('number')
    await root.locator('[data-action=add]').focus()
    await page.keyboard.press('Enter')
    await idle()
    assert.equal(field(await read()).name, 'Spare units')
    await click('reset')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  }
  await page.setViewportSize({ width: 1600, height: 1100 })
  await root.locator('.base-fields-controls > summary').click()
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    )
  })
  await root.screenshot({ path: path.join(directory, 'native-fields.png') })
  report.checks.push(
    'Four repeated fixtures, host keyboard field creation/reset at 760/390/320px, bounded page width and native white editor',
  )
  if (process.env.SHOWCASE_DETAILS === '1') {
    details = true
    for (const [locale, title, headings] of [
      ['en-US', 'Text, Number and Currency Fields', ['Variants', 'Actions', 'States']],
      ['zh-CN', '文本、数字与货币字段', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/bases/text-number-currency`, {
        waitUntil: 'load',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const frame = page.frameLocator('iframe').first()
      await frame.locator('.base-fields[data-ready=true]').waitFor()
      await frame.locator('.base-fields-controls > summary').click()
      await frame.locator('[data-action=add]').click()
      await frame.locator('[data-action=add]:disabled').waitFor()
      const state = JSON.parse(await frame.locator('output').textContent())
      assert.equal(field(state).name, 'Spare units')
    }
    report.checks.push('EN/ZH card-free detail pages; real iframe field creation works')
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.writes, [])
  assert.equal(report.expectedDiagnostics.length, 2)
  report.status = report.defects.length ? 'known-sdk-defects-observed' : 'passed'
  report.passed = observe || report.defects.length === 0
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png') })
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
assert.ok(
  report.passed,
  'Field acceptance remains strict: inspect missing normalization/default validation and all other checks',
)
