/* eslint-disable no-await-in-loop -- Verify edits, recalculation and resets in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/embed/crm-quote-calculator'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/crm-quote')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
const errors = []
page.on('pageerror', (error) => errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const report = { errors, checks: [], passed: false, documentationRequests: [], diagnosticRequests: [] }
const writes = []
page.on('request', (request) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) return
  const entry = { method: request.method(), url: request.url() }
  if (new URL(request.url()).pathname.startsWith('/__nextjs_')) report.diagnosticRequests.push(entry)
  else if (
    request.frame() === page.mainFrame() &&
    request.headers()['next-action'] &&
    new URL(request.url()).pathname.includes('/showcase/')
  )
    report.documentationRequests.push(entry)
  else writes.push(entry)
})
report.writes = writes
await page.addInitScript(() => {
  window.quotePaint = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.quotePaint.push(String(args[0]))
    if (window.quotePaint.length > 20000) window.quotePaint.splice(0, 10000)
    return Reflect.apply(original, this, args)
  }
})
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  const root = page.locator('.crm-quote')
  const read = async () => JSON.parse(await root.locator('[aria-label="SDK quote readback"]').textContent())
  const ready = async () => page.locator('.crm-quote[data-ready="true"]').waitFor({ timeout: 30000 })
  const checkTotals = async (subscription, firstYear, code = 'USD') => {
    await page.waitForFunction(
      (expected) => {
        const output = document.querySelector('[aria-label="SDK quote readback"]')
        if (!output?.textContent) return false
        const state = JSON.parse(output.textContent)
        return (
          !state.pending &&
          Math.abs(state.subscription - expected.subscription) < 0.000001 &&
          Math.abs(state.firstYear - expected.firstYear) < 0.000001
        )
      },
      { subscription, firstYear },
    )
    const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: code })
    assert.equal(
      await root.locator('[aria-label="Subscription subtotal"]').textContent(),
      currency.format(subscription),
    )
    assert.equal(await root.locator('[aria-label="First-year contract"]').textContent(), currency.format(firstYear))
    assert.equal(await root.locator('[role="alert"]').isVisible(), false)
    const state = await read()
    assert.equal(state.displays.subscription, await root.locator('[aria-label="Subscription subtotal"]').textContent())
    assert.equal(state.displays.firstYear, await root.locator('[aria-label="First-year contract"]').textContent())
  }
  const capture = async (name) => root.screenshot({ path: path.join(directory, `${name}.png`) })
  const apply = root.getByRole('button', { name: 'Apply Enterprise scenario', exact: true })
  const focus = root.getByRole('button', { name: 'Select quote inputs', exact: true })
  const reset = root.getByRole('button', { name: 'Reset embedded quote', exact: true })
  await ready()
  await checkTotals(16220.16, 20810.16)
  const baseline = await read()
  assert.deepEqual(baseline.inputs, ['Business', 48, 32, 0.12])
  assert.deepEqual(baseline.formulas, { subscription: '=B4*C4*12*(1-D4)*G4', firstYear: '=E4+SUM(E8:E9)' })
  assert.equal(await root.locator('fieldset button').count(), 9)
  const applyHost = root.getByRole('button', { name: 'Apply host inputs', exact: true })
  const sync = root.getByRole('button', { name: 'Read sheet into form', exact: true })
  assert.equal(await applyHost.isDisabled(), true)
  assert.equal(await sync.isDisabled(), true)
  assert.ok(
    await applyHost.evaluate((button) => {
      const bounds = button.getBoundingClientRect()
      const sidebar = button.closest('.quote-sidebar').getBoundingClientRect()
      return bounds.top >= sidebar.top && bounds.bottom <= sidebar.bottom
    }),
    'Apply must be fully inside the initial desktop sidebar without scrolling',
  )
  const input = (name) => root.locator(`[name="${name}"]`)
  await capture('business')
  await apply.click()
  await checkTotals(19837.44, 24427.44)
  assert.deepEqual((await read()).inputs, ['Enterprise', 72, 28, 0.18])
  assert.equal(await apply.isDisabled(), true)
  report.checks.push('Facade input write, SDK totals and disabled repeated action')
  await focus.focus()
  await page.keyboard.press('Enter')
  assert.equal((await read()).selectedRange, 'A4:D4')
  await capture('enterprise-selected')
  report.checks.push('Keyboard activates the real A4:D4 range via Facade')

  async function editSeats(value) {
    const canvas = root
      .locator('.quote-editor canvas[data-u-comp="render-canvas"]:not(#univer-doc-main-canvas):visible')
      .first()
    // Fixture geometry: row header 46px, column A 200px, column B 90px;
    // column header 20px and default row height 24px. Click B4 in the native canvas.
    await canvas.dblclick({ position: { x: 46 + 200 + 45, y: 20 + 3 * 24 + 12 } })
    await page.keyboard.press('Control+A')
    await page.keyboard.insertText(value)
    await page.keyboard.press('Enter')
  }
  await editSeats('100')
  await checkTotals(27552, 32142)
  assert.equal((await read()).inputs[1], 100)
  assert.equal(await apply.isEnabled(), true)
  assert.equal(await input('seats').inputValue(), '72', 'Native edits must not overwrite the host draft')
  const nativeSnapshot = (await read()).snapshot
  await sync.click()
  assert.equal(await input('seats').inputValue(), '100')
  assert.deepEqual((await read()).snapshot, nativeSnapshot, 'Read sheet into form must not write cells')
  assert.equal(await sync.isDisabled(), true)
  await capture('native-edited')
  report.checks.push('Native B4 edit recalculates E4/E11 and updates the host without clicking a host button')
  await editSeats('invalid')
  await page.waitForFunction(() => document.querySelector('.crm-quote')?.getAttribute('data-state') === 'error')
  assert.equal(await root.locator('[role="alert"]').isVisible(), true)
  const invalid = await read()
  assert.equal(invalid.inputs[1], 'invalid')
  assert.equal(typeof invalid.firstYear, 'string')
  assert.notEqual(await root.locator('[aria-label="First-year contract"]').textContent(), '$32,142.00')
  await capture('formula-error')
  report.checks.push('Real SDK formula error replaces stale CRM total')
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await reset.click()
    await checkTotals(16220.16, 20810.16)
    const restored = await read()
    assert.equal(restored.workbookId, baseline.workbookId)
    assert.deepEqual(restored.values, baseline.values)
    assert.deepEqual(restored.formulas, baseline.formulas)
    assert.deepEqual(restored.snapshot, baseline.snapshot, 'Reset must restore the entire default SDK snapshot')
    assert.equal(await apply.isEnabled(), true)
    await apply.click()
    await checkTotals(19837.44, 24427.44)
  }
  report.checks.push('Three full fixture resets restore the entire default snapshot, stable ID and usable buttons')
  await reset.click()
  await checkTotals(16220.16, 20810.16)
  await input('plan').selectOption('Starter')
  await applyHost.click()
  await checkTotals(16220.16, 20810.16)
  assert.equal((await read()).inputs[0], 'Starter')
  assert.equal(await applyHost.isDisabled(), true)
  await reset.click()
  await checkTotals(16220.16, 20810.16)
  report.checks.push('Label-only SDK pass with NOT_EXECUTED settles readiness without inventing formula results')
  for (const [name, value] of [
    ['seats', '-1'],
    ['seats', '1.5'],
    ['monthlyRate', '-0.01'],
    ['discount', '101'],
    ['fx', '0'],
    ['seats', ''],
  ]) {
    await input(name).fill(value)
    await applyHost.click()
    await root
      .getByRole('alert')
      .getByText(/Invalid/)
      .waitFor()
    assert.deepEqual((await read()).snapshot, baseline.snapshot, 'Invalid host input must preserve the full workbook')
    await sync.click()
  }
  report.checks.push(
    'Six invalid host inputs rejected before any write; explicit sync restores the draft without mutation',
  )
  await input('plan').selectOption('Starter')
  await input('seats').fill('15')
  await input('monthlyRate').fill('19.5')
  await input('discount').fill('7.5')
  await input('currency').selectOption('EUR')
  assert.equal(await input('fx').inputValue(), '0.92')
  assert.deepEqual((await read()).snapshot, baseline.snapshot, 'Unapplied draft does not mutate the SDK')
  await applyHost.click()
  await checkTotals(2987.01, 7209.81, 'EUR')
  await page.waitForFunction(() =>
    ['€2,987.01', '€7,209.81', '7.50%'].every((text) => window.quotePaint.includes(text)),
  )
  assert.deepEqual((await read()).inputs, ['Starter', 15, 19.5, 0.075])
  assert.equal(await applyHost.isDisabled(), true)
  await root.getByRole('button', { name: 'Select calculated total', exact: true }).focus()
  await page.keyboard.press('Enter')
  assert.equal((await read()).selectedRange, 'E11')
  await capture('eur-total-selected')
  const editedSnapshot = (await read()).snapshot
  const downloadEvent = page.waitForEvent('download')
  await root.getByRole('button', { name: 'Download snapshot JSON', exact: true }).click()
  const download = await downloadEvent
  assert.equal(download.suggestedFilename(), 'northstar-quote.json')
  assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), editedSnapshot)
  await root.getByRole('button', { name: 'Save & reload workbook', exact: true }).click()
  await checkTotals(2987.01, 7209.81, 'EUR')
  assert.deepEqual((await read()).snapshot, editedSnapshot, 'Reload preserves all snapshot fields and resources')
  report.checks.push(
    'Six host fields drive real EUR formulas/formatting; E11 selection, full JSON download and reload preserve actual SDK content',
  )
  await input('currency').selectOption('JPY')
  await input('fx').fill('150.5')
  await applyHost.click()
  await checkTotals(488635.875, 1179430.875, 'JPY')
  await apply.click()
  await checkTotals(2985534.72, 3676329.72, 'JPY')
  assert.equal((await read()).currency, 'JPY')
  assert.equal((await read()).fx, 150.5)
  await input('currency').selectOption('USD')
  await applyHost.click()
  await checkTotals(19837.44, 24427.44)
  report.checks.push('JPY integer display, custom FX, preset retention of currency/FX and roundtrip to USD')
  for (const fixture of ['default', 'empty', 'boundary', 'error']) {
    let firstSnapshot
    for (let cycle = 0; cycle < 2; cycle += 1) {
      await input('fixture').selectOption(fixture)
      await root.getByRole('button', { name: 'Load fixture', exact: true }).click()
      await ready()
      const state = await read()
      assert.equal(state.fixture, fixture)
      if (fixture === 'default') await checkTotals(16220.16, 20810.16)
      if (fixture === 'empty') await checkTotals(0, 0)
      if (fixture === 'boundary') await checkTotals(0, 688500, 'JPY')
      if (fixture === 'error') {
        assert.equal(state.inputs[1], 'not-a-quantity')
        assert.equal(typeof state.firstYear, 'string')
        assert.equal(await root.getByRole('alert').isVisible(), true)
      }
      if (cycle === 0) firstSnapshot = state.snapshot
      else assert.deepEqual(state.snapshot, firstSnapshot, 'Each complete fixture must be repeatable')
    }
    await capture(`fixture-${fixture}`)
  }
  report.checks.push('Default, empty, boundary and real SDK error fixtures loaded twice with full-snapshot equality')
  const beforeUnknown = (await read()).snapshot
  await input('fixture').evaluate((select) => select.add(new Option('Unknown', 'unknown')))
  await input('fixture').selectOption('unknown')
  await root.getByRole('button', { name: 'Load fixture', exact: true }).click()
  assert.match((await read()).hostError, /Unknown fixture/)
  assert.deepEqual((await read()).snapshot, beforeUnknown)
  report.checks.push('Unknown fixture rejected before workbook disposal')
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await ready()
    assert.ok(
      await root.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      'Host must not overflow horizontally',
    )
    await reset.click()
    await checkTotals(16220.16, 20810.16)
    await apply.click()
    await checkTotals(19837.44, 24427.44)
    await capture(`width-${width}`)
    if (width === 390) {
      await root.evaluate((node) => {
        node.scrollTop = node.scrollHeight
      })
      await editSeats('100')
      await checkTotals(27552, 32142)
      await capture('width-390-native-edit')
    }
  }
  report.checks.push('Working host controls at 760, 390 and 320px')
  if (new URL(url).pathname.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.crm-quote[data-theme="${theme}"][data-ready="true"]`).waitFor()
      await checkTotals(16220.16, 20810.16)
      await apply.click()
      await checkTotals(19837.44, 24427.44)
      await capture(`theme-${theme}`)
    }
    report.checks.push('Documentation light/dark recreation resets data and preserves working buttons')
    for (const [locale, title, variants, actions, states] of [
      ['en-US', 'CRM Quote Calculator', 'Variants', 'Actions', 'States'],
      ['zh-CN', 'CRM 报价计算器', '变体', '操作', '状态'],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/embed/crm-quote-calculator`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of [variants, actions, states])
        assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const frame = page.frameLocator('iframe').first()
      await frame.locator('.crm-quote[data-ready="true"]').waitFor({ timeout: 60000 })
      await frame.getByRole('button', { name: 'Apply Enterprise scenario', exact: true }).click()
      await frame.getByText('$24,427.44', { exact: true }).waitFor()
      assert.equal(
        await frame.getByRole('button', { name: 'Apply Enterprise scenario', exact: true }).isDisabled(),
        true,
      )
      await page.screenshot({ path: path.join(directory, `detail-${locale}.png`) })
    }
    report.checks.push('English/Chinese card-free detail pages and working embedded iframe')
  }
  assert.deepEqual(errors, [])
  assert.deepEqual(writes, [], 'The demo is frontend-only')
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  throw error
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
