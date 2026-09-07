/* eslint-disable no-await-in-loop -- Real load/release cycles depend on their preceding state. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { ROUTES } from '../showcase/embed/lazy-load-editor/code/data.ts'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/embed/lazy-load-editor'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/lazy-editor')
const standalone = !new URL(url).pathname.includes('/playground/')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
page.setDefaultTimeout(45000)
const report = { passed: false, checks: [], errors: [], writes: [], requests: [] }
const root = page.locator('.lazy-load-demo')
const state = async () => JSON.parse(await root.getByLabel('Lazy editor state').textContent())
const phase = (value) => page.locator(`.lazy-load-demo[data-phase="${value}"]`).waitFor()
const click = async (action) => root.locator(`[data-action="${action}"]`).click()
const total = (runs) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    ROUTES.reduce((sum, row, i) => sum + (i === 0 ? runs : row[2]) * row[3] * row[4], 0),
  )
const settle = () =>
  page.waitForFunction(() => {
    const value = JSON.parse(document.querySelector('[aria-label="Lazy editor state"]').textContent)
    return value.phase === 'ready' && !value.writing
  })
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  report.requests.push(request.url())
  if (
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method()) &&
    !request.headers()['next-action'] &&
    !new URL(request.url()).pathname.startsWith('/__nextjs_')
  )
    report.writes.push(request.url())
})
let releaseImport
let held = false
let importHeld
const importStarted = new Promise((resolve) => {
  importHeld = resolve
})
try {
  if (standalone)
    await page.route('**/assets/editor-*.js', async (route) => {
      if (!held) {
        held = true
        await new Promise((resolve) => {
          releaseImport = resolve
          importHeld()
        })
      }
      await route.continue()
    })
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await phase('idle')
  assert.equal((await state()).attempts, 0)
  assert.equal(await root.locator('canvas').count(), 0)
  assert.equal(await root.locator('.lazy-summary > article').count(), 2)
  if (standalone)
    assert.equal(
      report.requests.some((entry) => /\/assets\/editor-/.test(entry)),
      false,
      'No SDK JS or CSS requested before activation',
    )
  await root.screenshot({ path: path.join(directory, 'overview.png') })
  await root.locator('.lazy-editor-target').scrollIntoViewIfNeeded()
  if (standalone) {
    await phase('loading')
    let timeout
    try {
      await Promise.race([
        importStarted,
        new Promise((_, reject) => {
          timeout = setTimeout(() => reject(new Error('Deferred editor request did not start')), 45000)
        }),
      ])
    } finally {
      clearTimeout(timeout)
    }
    await click('cancel')
    await phase('idle')
    releaseImport()
    await page.waitForFunction(
      () => JSON.parse(document.querySelector('[aria-label="Lazy editor state"]').textContent).ignoredLoads === 1,
    )
    assert.equal((await state()).mounts, 0)
    assert.equal(await root.locator('canvas').count(), 0)
    report.checks.push(
      'Production entry requests no editor JS/CSS before activation; cancelling a held real import prevents late owner creation',
    )
    await click('load')
  }
  await phase('ready')
  const initial = (await state()).sdk.snapshot
  assert.equal((await state()).sdk.runs, 6)
  assert.equal((await state()).sdk.weeklyCost, total(6))
  const native = root.locator('[data-u-comp="workbench-layout"]')
  const styles = await native.evaluate((node) => ({
    background: getComputedStyle(node).backgroundColor,
    white: getComputedStyle(node).getPropertyValue('--univer-gray-0').trim(),
    flex: getComputedStyle(node.querySelector('.univer-flex')).display,
  }))
  assert.deepEqual(styles, { background: 'rgb(255, 255, 255)', white: '#FFFFFF', flex: 'flex' })
  await native.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  await root.locator('.lazy-editor-target').screenshot({ path: path.join(directory, 'editor.png') })
  const input = root.locator('[name="runs"]')
  await input.fill('8')
  await click('apply')
  await settle()
  assert.equal((await state()).sdk.runs, 8)
  assert.equal((await state()).sdk.weeklyCost, total(8))
  const eight = (await state()).sdk.snapshot
  await click('select')
  const canvas = root.locator('[data-u-comp="render-canvas"]:not(#univer-doc-main-canvas):visible').first()
  await canvas.dblclick({ position: { x: 46 + 220 + 90 + 60, y: 20 + 3 * 26 + 13 } })
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText('9')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    (expected) =>
      JSON.parse(document.querySelector('[aria-label="Lazy editor state"]').textContent).sdk?.weeklyCost === expected,
    total(9),
  )
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    (expected) =>
      JSON.parse(document.querySelector('[aria-label="Lazy editor state"]').textContent).sdk?.weeklyCost === expected,
    total(8),
  )
  assert.deepEqual((await state()).sdk.snapshot, eight)
  await page.keyboard.press('Control+y')
  await page.waitForFunction(
    (expected) =>
      JSON.parse(document.querySelector('[aria-label="Lazy editor state"]').textContent).sdk?.weeklyCost === expected,
    total(9),
  )
  const edited = (await state()).sdk.snapshot
  const downloading = page.waitForEvent('download')
  await click('download')
  const download = await downloading
  assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), edited)
  for (const invalid of ['-1', '10001', '1.5', '']) {
    await input.fill(invalid)
    await click('apply')
    await settle()
    assert.match((await state()).error, /integer/)
    assert.deepEqual((await state()).sdk.snapshot, edited)
  }
  report.checks.push(
    'Official CSS/native Grid, SDK formula totals, range targeting, native typing and Undo/Redo, exact JSON download and invalid-input preservation',
  )
  const oldCanvas = await canvas.elementHandle()
  await click('release')
  await phase('idle')
  assert.equal(await oldCanvas.evaluate((node) => node.isConnected), false)
  assert.equal(await root.locator('canvas').count(), 0)
  const attempts = (await state()).attempts
  await root.locator('.lazy-editor-target').scrollIntoViewIfNeeded()
  await page.waitForTimeout(200) // An absence check needs an observation window after IntersectionObserver delivery.
  assert.equal((await state()).attempts, attempts)
  await click('load')
  await phase('ready')
  assert.deepEqual((await state()).sdk.snapshot, initial)
  for (const fixture of ['empty', 'boundary', 'error', 'default']) {
    await root.locator('[name="fixture"]').selectOption(fixture)
    await phase('idle')
    const before = (await state()).mounts
    await click('load')
    if (fixture === 'error') {
      await phase('error')
      assert.match((await state()).error, /Simulated first loader failure/)
      assert.equal((await state()).mounts, before)
      await click('load')
    }
    await phase('ready')
    if (fixture === 'empty') {
      assert.equal((await state()).sdk.weeklyCost, '$0.00')
      assert.equal(await root.locator('[data-action="apply"]').isDisabled(), true)
    } else if (fixture === 'boundary') {
      assert.equal((await state()).sdk.runs, 0)
      assert.equal((await state()).sdk.snapshot.sheets.routes.cellData[4][2].v, 10000)
    } else assert.deepEqual((await state()).sdk.snapshot, initial)
  }
  await click('reset')
  await phase('idle')
  await click('load')
  await phase('ready')
  assert.deepEqual((await state()).sdk.snapshot, initial)
  report.checks.push(
    'Real owner release without automatic remount, explicit reload, four fixtures, one host-failure retry and exact deferred Reset',
  )
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await click('reset')
    await phase('idle')
    assert.ok(await root.evaluate((node) => node.scrollWidth <= node.clientWidth + 1))
    await root.locator('[data-action="load"]').focus()
    await page.keyboard.press('Enter')
    await phase('ready')
    await input.fill('10')
    await root.locator('[data-action="apply"]').focus()
    await page.keyboard.press('Enter')
    await settle()
    assert.equal((await state()).sdk.weeklyCost, total(10))
  }
  report.checks.push('760/390/320px host layout, keyboard loading and meaningful keyboard Facade writes')
  if (!standalone) {
    await page.setViewportSize({ width: 1440, height: 1000 })
    for (const [locale, title, headings] of [
      ['en-US', 'Lazy-load an Editor', ['Variants', 'Actions', 'States']],
      ['zh-CN', '按需加载编辑器', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/embed/lazy-load-editor`, {
        waitUntil: 'load',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      const frame = page.frameLocator('iframe').first()
      await frame.locator('.lazy-load-demo[data-phase="idle"]').waitFor()
      assert.equal(await frame.locator('canvas').count(), 0)
      await frame.locator('[data-action="load"]').click()
      await frame.locator('.lazy-load-demo[data-phase="ready"]').waitFor()
      await frame.locator('[name="runs"]').fill('12')
      await frame.locator('[data-action="apply"]').click()
      await frame.getByText(`Weekly cost: ${total(12)}`, { exact: true }).waitFor()
    }
    report.checks.push('EN/ZH 4/8/4 guides and actual deferred iframe loading, writing and calculated totals')
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.writes, [])
  report.passed = true
} catch (cause) {
  report.failure = cause.stack || String(cause)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  releaseImport?.()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, requests: report.requests.length }))
  await browser.close()
}
assert.ok(report.passed, report.failure)
