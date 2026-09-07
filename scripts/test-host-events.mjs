/* eslint-disable no-await-in-loop -- State transitions must be checked in sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const url = process.env.SHOWCASE_DEMO_URL || 'http://127.0.0.1:4258/'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/host-events')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [], writes: [] }
if (process.env.SHOWCASE_EXPORT_MANIFEST) {
  const [entry] = JSON.parse(await fs.readFile(process.env.SHOWCASE_EXPORT_MANIFEST, 'utf8'))
  const source = (await readShowcaseSources()).find((item) => item.slug === entry.slug)
  for (const [name, content] of Object.entries(source.files))
    assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content, name)
  report.sourceFiles = Object.keys(source.files).length
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, colorScheme: 'light' })
page.setDefaultTimeout(45000)
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) &&
    !request.headers()['next-action'] &&
    !new URL(request.url()).pathname.startsWith('/__nextjs_')
  )
    report.writes.push(request.url())
})
const root = page.locator('.host-events-demo')
const read = async () => JSON.parse(await root.getByLabel('Host event SDK state').textContent())
const click = (action) => root.locator(`[data-action="${action}"]`).click()
const waitProgress = (value) =>
  page.waitForFunction(
    (expected) =>
      JSON.parse(document.querySelector('[aria-label="Host event SDK state"]').textContent).progress === expected,
    value,
  )
const write = async (value) => {
  await root.locator('.host-events-controls input').fill(String(value))
  await click('write')
  await waitProgress(value)
}
const waitEntry = (source) =>
  page.waitForFunction(
    (expected) =>
      JSON.parse(document.querySelector('[aria-label="Host event SDK state"]').textContent).activity.some(
        (entry) => entry.source === expected,
      ),
    source,
  )
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await page.locator('.host-events-demo[data-ready="true"]').waitFor()
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  await waitProgress(35)
  const initial = (await read()).snapshot
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((node) => getComputedStyle(node).backgroundColor),
    'rgb(255, 255, 255)',
  )
  await page.screenshot({ path: path.join(directory, 'default.png') })
  await write(50)
  await waitEntry('SDK SheetValueChanged')
  let state = await read()
  assert.ok(
    state.activity.some(
      (entry) =>
        entry.source === 'SDK SheetValueChanged' &&
        entry.detail.some((range) => range.range === 'C4' && range.values[0][0] === 50),
    ),
  )
  assert.equal(await root.locator('[data-action="write"]').isDisabled(), true)
  await click('select')
  assert.equal((await read()).selection, 'E4')
  const canvas = root.locator('[data-u-comp="render-canvas"]:not(#univer-doc-main-canvas):visible').first()
  await canvas.click({ position: { x: 710, y: 149 } })
  await canvas.click({ position: { x: 710, y: 121 } })
  await page.waitForFunction(() =>
    JSON.parse(document.querySelector('[aria-label="Host event SDK state"]').textContent).activity.some(
      (entry) =>
        entry.source === 'SDK onSelectionChange' &&
        entry.detail.selections.some((range) => range.startRow === 3 && range.startColumn === 4),
    ),
  )
  state = await read()
  assert.ok(
    state.activity.some(
      (entry) =>
        entry.source === 'SDK onSelectionChange' &&
        entry.detail.selections.some((range) => range.startRow === 3 && range.startColumn === 4),
    ),
  )
  report.checks.push(
    'Official white Grid; host writes emit actual value ranges/raw values; activation reads E4 and native selection emits actual coordinates',
  )

  // Native editing is exercised on E4 after the real Facade selection, not through a test-only SDK global.
  await canvas.dblclick({ position: { x: 710, y: 121 } })
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText('Keyboard review complete')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () =>
      JSON.parse(document.querySelector('[aria-label="Host event SDK state"]').textContent).snapshot.sheets.milestones
        .cellData[3][4].v === 'Keyboard review complete',
  )
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    () =>
      JSON.parse(document.querySelector('[aria-label="Host event SDK state"]').textContent).snapshot.sheets.milestones
        .cellData[3][4].v === 'Review keyboard paths',
  )
  report.checks.push('Native cell editing and Undo update the SDK snapshot and activity feed')

  await click('subscription')
  assert.equal((await read()).listening, false)
  const stopped = (await read()).activity
  await write(60)
  await click('select')
  await canvas.click({ position: { x: 710, y: 149 } })
  await page.waitForFunction(
    () => JSON.parse(document.querySelector('[aria-label="Host event SDK state"]').textContent).selection === 'E5',
  )
  assert.deepEqual((await read()).activity, stopped)
  await click('save')
  const saved = (await read()).saved
  assert.deepEqual(saved, (await read()).snapshot)
  assert.equal((await read()).activity.at(-1).source, 'Host save()')
  await write(70)
  assert.deepEqual((await read()).saved, saved)
  await click('subscription')
  await write(80)
  await page.waitForFunction(
    () =>
      JSON.parse(document.querySelector('[aria-label="Host event SDK state"]').textContent).activity.findLast(
        (entry) => entry.source === 'SDK SheetValueChanged',
      )?.detail[0].values[0][0] === 80,
  )
  assert.equal(
    (await read()).activity.findLast((entry) => entry.source === 'SDK SheetValueChanged').detail[0].values[0][0],
    80,
  )
  report.checks.push(
    'Unsubscribe stops SDK feed but not editing/readback; explicit host save captures full independent content; resubscribe receives future writes',
  )

  const beforeInvalid = (await read()).snapshot
  const beforeEvents = (await read()).activity
  for (const invalid of ['-1', '101', '1.5', '']) {
    await root.locator('.host-events-controls input').fill(invalid)
    await click('write')
    assert.match((await read()).error, /integer from 0 to 100/)
    assert.deepEqual((await read()).snapshot, beforeInvalid)
    assert.deepEqual((await read()).activity, beforeEvents)
  }
  await click('clear')
  assert.equal((await read()).activity.length, 0)
  assert.deepEqual((await read()).saved, saved)
  for (let value = 1; value <= 15; value++) await write(value)
  await page.waitForFunction(
    () => JSON.parse(document.querySelector('[aria-label="Host event SDK state"]').textContent).activity.length === 12,
  )
  state = await read()
  assert.equal(state.activity.length, 12)
  assert.ok(state.activity[0].sequence > 1)
  assert.equal(state.activity.at(-1).detail[0].values[0][0], 15)
  await click('reset')
  await waitProgress(35)
  assert.deepEqual((await read()).snapshot, initial)
  assert.equal((await read()).saved, null)
  assert.equal((await read()).listening, true)
  report.checks.push(
    'Invalid host values preserve complete data/feed; clear keeps saved content; bounded feed retains latest 12; Reset restores exact initial snapshot',
  )

  for (const fixture of ['empty', 'boundary', 'default']) {
    await root.locator('.host-events-controls select').selectOption(fixture)
    await waitProgress(fixture === 'empty' ? null : fixture === 'boundary' ? 0 : 35)
    if (fixture === 'empty') {
      assert.equal(await root.locator('[data-action="write"]').isDisabled(), true)
      assert.equal(await root.locator('[data-action="select"]').isDisabled(), true)
    } else if (fixture === 'boundary') assert.equal((await read()).snapshot.sheets.milestones.cellData[4][2].v, 100)
    else assert.deepEqual((await read()).snapshot, initial)
  }
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1050 })
    assert.ok(await root.locator('.host-events-controls').evaluate((node) => node.scrollWidth <= node.clientWidth + 1))
    await root.locator('.host-events-controls input').fill(String(width / 10))
    await root.locator('[data-action="write"]').focus()
    await page.keyboard.press('Enter')
    await waitProgress(width / 10)
  }
  report.checks.push(
    'Empty and Boundary fixtures; 760/390/320px fitting host controls and keyboard-activated real writes',
  )
  if (new URL(url).pathname.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1050 })
    for (const [locale, title, headings] of [
      ['en-US', 'Univer Events to Host', ['Variants', 'Actions', 'States']],
      ['zh-CN', 'Univer 事件通知宿主', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/embed/univer-events-to-host`, {
        waitUntil: 'load',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      const preview = page.frameLocator('iframe').first()
      await preview.locator('.host-events-demo[data-ready="true"]').waitFor()
      await preview.locator('.host-events-controls input').fill('67')
      await preview.locator('[data-action="write"]').click()
      await preview.getByRole('status').filter({ hasText: 'audit progress: 67' }).waitFor()
      const guideState = JSON.parse(await preview.getByLabel('Host event SDK state').textContent())
      assert.equal(guideState.snapshot.sheets.milestones.cellData[3][2].v, 67)
      assert.ok(guideState.activity.some((entry) => entry.source === 'SDK SheetValueChanged'))
      assert.equal(
        await preview
          .locator('[data-u-comp="workbench-layout"]')
          .evaluate((node) => getComputedStyle(node).backgroundColor),
        'rgb(255, 255, 255)',
      )
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push('EN/ZH 4/7/4 guides contain a working SDK editor, real writes/events and official white CSS')
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.writes, [])
  report.passed = true
} catch (cause) {
  report.failure = cause.stack || String(cause)
  report.state = await read().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, state: undefined }))
  await browser.close()
}
assert.ok(report.passed, report.failure)
