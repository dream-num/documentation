/* eslint-disable no-await-in-loop -- Exercise one editor through real user transitions. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/custom-formula'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/custom-formula')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
const report = { passed: false, errors: [], checks: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.custom-formula-demo')
  const read = async () => JSON.parse(await root.locator('pre[aria-label]').textContent())
  const wait = (predicate, argument) =>
    page.waitForFunction(
      ({ predicate: check, argument: expected }) => {
        const text = document.querySelector('.custom-formula-demo pre[aria-label]')?.textContent
        return text && new Function('s', 'a', `return (${check})(s,a)`)(JSON.parse(text), expected)
      },
      { predicate: predicate.toString(), argument },
    )
  const button = (action) => root.locator(`[data-action="${action}"]`)
  const apply = async (key) => {
    await root.getByRole('combobox', { name: 'Route key' }).selectOption(key)
    await button('apply').click()
  }
  const north = () =>
    wait(
      (s) => s.values[4][1] === 'North route · 3 stops' && s.values[10][5] === 18 && s.sourceDiagnostics.pending === 0,
    )
  await north()
  const baseline = (await read()).values
  assert.equal(baseline[12][1], 35)
  assert.equal(baseline[13][1], 70)
  assert.equal(baseline[14][1], '#VALUE!')
  assert.equal(baseline[15][1], 1, 'ISERROR must recognize the custom function result as an actual error')
  assert.equal(baseline[5][1], 0)
  assert.deepEqual(
    baseline.slice(7, 11).map((row) => row.slice(4)),
    [
      ['Stop', 'Minutes'],
      ['Glasshouse', 12],
      ['Water tower', 0],
      ['Hill depot', 18],
    ],
  )
  assert.equal((await read()).rawValues[8][4], null, 'Raw storage is not the composed spilled value')
  assert.equal(await button('apply').isDisabled(), true)
  await root.screenshot({ path: path.join(directory, 'north.png') })
  report.checks.push('Custom numeric sum/dependency, genuine error, async scalar and complete native spill')

  const cachedBefore = (await read()).sourceDiagnostics
  await button('cached').click()
  await wait((s, a) => s.sourceDiagnostics.cacheHits > a, cachedBefore.cacheHits)
  await north()
  assert.equal((await read()).sourceDiagnostics.requests, cachedBefore.requests)
  await button('reload').click()
  await wait((s) => s.sourceDiagnostics.pending > 0)
  await root.screenshot({ path: path.join(directory, 'loading.png') })
  await north()
  assert.ok((await read()).sourceDiagnostics.requests > cachedBefore.requests)
  report.checks.push('Forced recalculation uses source cache; explicit reload starts new local work')

  await apply('EAST')
  await wait((s) => s.values[4][1] === 'East route · 2 stops' && s.values[9][5] === 22 && s.values[10][4] === null)
  assert.deepEqual(
    (await read()).values.slice(7, 11).map((row) => row.slice(4)),
    [
      ['Stop', 'Minutes'],
      ['Print studio', 7],
      ['Community kitchen', 22],
      [null, null],
    ],
  )
  await root.screenshot({ path: path.join(directory, 'east.png') })
  await apply('EMPTY')
  await wait((s) => s.values[4][1] === 'No deliveries scheduled' && s.values[8][4] === null)
  assert.deepEqual(
    (await read()).values.slice(8, 11).map((row) => row.slice(4)),
    [
      [null, null],
      [null, null],
      [null, null],
    ],
  )
  report.checks.push('Shorter and empty route results remove old native spill cells')
  for (const [key, error, reason] of [
    ['MISSING', '#N/A', 'missing key'],
    ['FAULT', '#VALUE!', 'simulated source failure'],
    ['TIMEOUT', '#N/A', 'timeout after 800ms'],
  ]) {
    await apply(key)
    await wait(
      (s, a) =>
        s.values[4][1] === a.error &&
        s.values[7][4] === a.error &&
        s.values[5][1] === 1 &&
        s.sourceDiagnostics.pending === 0 &&
        s.sourceDiagnostics.events.some((e) => e.key === a.key && e.state === a.reason),
      { key, error, reason },
    )
    await root.screenshot({ path: path.join(directory, `${key.toLowerCase()}.png`) })
  }
  await apply('NORTH')
  await north()
  report.checks.push(
    'Missing/failure/timeout become SDK errors with source diagnostics and recover through a valid input',
  )

  await button('registration').click()
  await wait((s) => s.hostRegistration === 'unregistered' && s.values[4][1] === '#NAME?' && s.values[7][4] === '#NAME?')
  assert.equal((await read()).values[12][1], 35)
  await button('registration').click()
  await north()
  report.checks.push(
    'Disposing Facade registration handles produces #NAME?; re-registering and reloading the snapshot restores results',
  )
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  await grid.click({ position: { x: 330, y: 224 } })
  await page.keyboard.press('F2')
  await page.keyboard.press('Control+a')
  await page.keyboard.type('15')
  await page.keyboard.press('Enter')
  await wait((s) => s.values[12][1] === 38 && s.values[13][1] === 76)
  await page.keyboard.press('Control+z')
  await wait((s) => s.values[12][1] === 35 && s.values[13][1] === 70)
  report.checks.push('Native cell input and Undo recalculate the registered custom sum and its dependent')
  await grid.click({ position: { x: 330, y: 224 } })
  await page.keyboard.press('F2')
  await page.keyboard.press('Control+a')
  await page.keyboard.type('16')
  await page.keyboard.press('Enter')
  await wait((s) => s.values[12][1] === 39 && s.values[13][1] === 78)
  await button('registration').click()
  await wait((s) => s.values[4][1] === '#NAME?')
  await button('registration').click()
  await north()
  assert.equal((await read()).values[8][1], 16, 'Snapshot recovery preserves the authored cell edit')
  assert.equal((await read()).values[12][1], 39)
  await grid.click({ position: { x: 330, y: 224 } })
  await page.keyboard.press('Control+z')
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  assert.equal((await read()).values[8][1], 16, 'Reloaded unit does not replay discarded history')
  report.checks.push('Registration recovery preserves native cell edits and explicitly discards the old Undo history')
  for (let cycle = 0; cycle < 3; cycle++) {
    await button('reload').click()
    await wait((s) => s.sourceDiagnostics.pending > 0)
    await button('reset').click()
    await north()
    assert.deepEqual((await read()).values, baseline)
  }
  report.checks.push('Three resets during local async work restore the fixture without stale results')
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((node) => getComputedStyle(node).backgroundColor),
    'rgb(255, 255, 255)',
  )
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await button('cached').focus()
    const hits = (await read()).sourceDiagnostics.cacheHits
    await page.keyboard.press('Enter')
    await wait((s, a) => s.sourceDiagnostics.cacheHits > a, hits)
    await north()
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  report.checks.push('Opaque white native workbench and keyboard controls at 760/390/320px')
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.custom-formula-demo[data-theme="${theme}"]`).waitFor()
      await north()
      await apply('EAST')
      await wait((s) => s.values[4][1] === 'East route · 2 stops' && s.values[9][5] === 22)
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    report.checks.push('Both documentation themes recreate a working scalar/table formula example')
    for (const [locale, title, headings] of [
      ['en-US', 'Custom Formula', ['Variants', 'Actions', 'States']],
      ['zh-CN', '自定义公式', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/custom-formula`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.custom-formula-demo[data-ready="true"]').waitFor()
      await embedded.getByRole('combobox', { name: 'Route key' }).selectOption('EAST')
      await embedded.locator('[data-action="apply"]').click()
      await embedded
        .locator('pre[aria-label]')
        .filter({ hasText: 'East route · 2 stops' })
        .waitFor({ state: 'attached' })
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push('English/Chinese card-free detail pages with working iframe actions')
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.lastReadback = await page
    .locator('.custom-formula-demo pre[aria-label]')
    .textContent()
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') })
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
assert.ok(report.passed, 'Custom functions must produce native scalar/spill/error results and remain recoverable')
