/* eslint-disable no-await-in-loop -- Each lifecycle cycle depends on its previous owner and snapshot. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/embed/mount-dispose-remount'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-lifecycle')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(45000)
const report = { passed: false, checks: [], errors: [], writes: [], documentationRequests: [], diagnosticRequests: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
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
  else report.writes.push(entry)
})
await page.addInitScript(() => {
  window.inventoryPaint = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.inventoryPaint.push(String(args[0]))
    if (window.inventoryPaint.length > 20000) window.inventoryPaint.splice(0, 10000)
    return Reflect.apply(original, this, args)
  }
})
const root = page.locator('.embed-lifecycle')
const read = async () => JSON.parse(await root.getByLabel('Inventory lifecycle readback').textContent())
const idle = () => root.locator(':scope[data-ready="true"]').waitFor({ timeout: 60000 })
const click = async (action, error = false) => {
  await root.locator(`[data-action="${action}"]`).click()
  await idle()
  assert.equal(
    await root.locator('[role="alert"]').isVisible(),
    error,
    await root.locator('[role="alert"]').textContent(),
  )
  return read()
}
const open = async () => {
  const panel = root.locator('.embed-lifecycle-controls')
  if (!(await panel.evaluate((node) => node.open))) await panel.locator(':scope > summary').click()
}
const snapshot = async () => (await read()).snapshot
const quantity = root.locator('[name="quantity"]')
const choose = async (sku) => root.locator('[name="record"]').selectOption(sku)
const nativeQuantity = async (text) => {
  await choose('KT-101')
  await click('select')
  assert.equal((await read()).selectedRange, 'D4')
  const canvas = root.locator('[data-u-comp="render-canvas"]:not(#univer-doc-main-canvas):visible').first()
  // The native grid canvas excludes its ribbon/formula bar. D4 is after A/B/C widths and three 26px rows.
  await canvas.dblclick({ position: { x: 46 + 100 + 225 + 125 + 60, y: 20 + 3 * 26 + 13 } })
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText(text)
  await page.keyboard.press('Enter')
  await page.waitForFunction((value) => {
    const state = JSON.parse(document.querySelector('[aria-label="Inventory lifecycle readback"]').textContent)
    return state.rows[0][3] === value
  }, Number(text))
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  await idle()
  await page.evaluate(() => {
    window.inventorySlot = document.querySelector('.mount-slot')
  })
  const baseline = await snapshot()
  assert.equal((await read()).rows.length, 18)
  assert.equal(new Set((await read()).rows.map((row) => row[1])).size, 18)
  await page.waitForFunction(
    () => window.inventoryPaint.includes('Folding trail saw') && window.inventoryPaint.includes('24.000'),
  )
  const styles = await root.locator('[data-u-comp="workbench-layout"]').evaluate((node) => ({
    background: getComputedStyle(node).backgroundColor,
    white: getComputedStyle(node).getPropertyValue('--univer-gray-0').trim(),
    flex: getComputedStyle(node.querySelector('.univer-flex')).display,
  }))
  assert.equal(styles.background, 'rgb(255, 255, 255)')
  assert.equal(styles.white.toUpperCase(), '#FFFFFF')
  assert.equal(styles.flex, 'flex')
  await root.screenshot({ path: path.join(directory, 'initial.png') })
  await open()
  assert.equal(await root.locator('fieldset button').count(), 10)
  assert.equal(await root.locator('[data-action="mount"]').isDisabled(), true)
  assert.equal(await root.locator('[data-action="restore"]').isDisabled(), true)
  assert.equal(await root.locator('[data-action="apply"]').isDisabled(), true)
  await click('checkpoint')
  assert.deepEqual((await read()).checkpoint, baseline)
  assert.deepEqual(await snapshot(), baseline)
  assert.equal(await root.locator('[data-action="checkpoint"]').isDisabled(), true)
  await quantity.fill('37.125')
  await click('apply')
  await page.waitForFunction(() => window.inventoryPaint.includes('37.125'))
  assert.equal((await read()).rows[0][3], 37.125)
  assert.equal(await root.locator('[data-action="apply"]').isDisabled(), true)
  const edited = await snapshot()
  assert.notDeepEqual(edited, baseline)
  assert.equal(await root.locator('[data-action="checkpoint"]').isEnabled(), true)
  const oldGeneration = (await read()).generation
  const oldCanvas = await root.locator('canvas:visible').first().elementHandle()
  await click('remount')
  assert.ok((await read()).generation > oldGeneration)
  assert.equal(await oldCanvas.evaluate((node) => node.isConnected), false)
  assert.deepEqual(await snapshot(), edited, 'Remount preserves all snapshot fields, not just quantities')
  assert.equal(await page.evaluate(() => window.inventorySlot === document.querySelector('.mount-slot')), true)
  assert.deepEqual((await read()).lastDisposal, {
    generation: oldGeneration,
    unitId: 'kestrel-inventory',
    unloaded: true,
    removedCanvases: true,
  })
  report.checks.push(
    'Real owner remount retains all edited snapshot fields in the same mount element and removes old canvases',
  )

  await nativeQuantity('41')
  const native = await snapshot()
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    () =>
      JSON.parse(document.querySelector('[aria-label="Inventory lifecycle readback"]').textContent).rows[0][3] ===
      37.125,
  )
  assert.deepEqual(await snapshot(), edited)
  await page.keyboard.press('Control+y')
  await page.waitForFunction(
    () =>
      JSON.parse(document.querySelector('[aria-label="Inventory lifecycle readback"]').textContent).rows[0][3] === 41,
  )
  assert.deepEqual(await snapshot(), native)
  const downloadEvent = page.waitForEvent('download')
  await click('download')
  const download = await downloadEvent
  assert.equal(download.suggestedFilename(), 'kestrel-inventory.json')
  assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), native)
  report.checks.push(
    'Native quantity editing and native Undo/Redo preserve complete snapshots; JSON download matches current SDK content',
  )

  await click('dispose')
  assert.equal((await read()).mounted, false)
  assert.equal((await read()).workbookId, null)
  assert.equal(await root.locator('canvas').count(), 0)
  assert.equal(await root.locator('.mount-placeholder').isVisible(), true)
  assert.equal(await root.locator('[data-action="dispose"]').isDisabled(), true)
  assert.equal(await root.locator('[data-action="apply"]').isDisabled(), true)
  assert.equal(await root.locator('[data-action="mount"]').isEnabled(), true)
  await root.screenshot({ path: path.join(directory, 'disposed.png') })
  await click('restore')
  assert.deepEqual(await snapshot(), baseline)
  await click('dispose')
  await click('mount')
  assert.deepEqual(await snapshot(), baseline)
  await nativeQuantity('29')
  await click('reset')
  assert.deepEqual(await snapshot(), baseline)
  assert.equal((await read()).checkpoint, null)
  report.checks.push(
    'Disposal removes the workbook and all canvases; checkpoint restore, fresh mount and full Reset remain editable',
  )

  for (const value of ['-1', '1000001', '1.0001', '']) {
    await quantity.fill(value)
    await click('apply', true)
    assert.match((await read()).error, /Invalid quantity/)
    assert.deepEqual(await snapshot(), baseline)
  }
  await choose('KT-103')
  await quantity.fill('0.125')
  await click('apply')
  assert.equal((await read()).rows[2][3], 0.125)
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await click('reset')
    assert.deepEqual(await snapshot(), baseline)
    await click('dispose')
    assert.equal(await root.locator('canvas').count(), 0)
    await click('mount')
    assert.deepEqual(await snapshot(), baseline)
    assert.equal(await page.evaluate(() => window.inventorySlot === document.querySelector('.mount-slot')), true)
  }
  report.checks.push(
    'Four invalid quantities cause no mutation; three full reset/dispose/mount cycles reuse the exact host slot',
  )

  // Use the native + tab, not a test-only worksheet factory. Host commands must not follow the active tab.
  await choose('KT-101')
  await root.locator('[data-u-comp="sheet-bar-append-button"]').first().click()
  await root.getByRole('tab', { name: 'Sheet1', exact: true }).waitFor()
  await quantity.fill('55.125')
  const withScratch = await snapshot()
  const scratchId = withScratch.sheetOrder.find((id) => id !== 'stock')
  assert.ok(scratchId, 'The native tab creates a real second worksheet')
  await click('apply')
  assert.equal((await read()).rows[0][3], 55.125, 'Host quantity targets stock even when another sheet is active')
  assert.deepEqual(
    (await snapshot()).sheets[scratchId],
    withScratch.sheets[scratchId],
    'No scratch-sheet cell was written',
  )
  await click('select')
  assert.equal(await root.getByRole('tab', { name: 'Depot stock', exact: true }).getAttribute('aria-selected'), 'true')
  assert.equal((await read()).selectedRange, 'D4')
  await root.getByRole('tab', { name: 'Depot stock', exact: true }).dblclick()
  await root.getByRole('tab').locator('[contenteditable="true"]').fill('North and river stock')
  await page.keyboard.press('Enter')
  await root.getByRole('tab', { name: 'North and river stock', exact: true }).waitFor()
  await root.getByRole('tab', { name: 'Sheet1', exact: true }).click()
  await quantity.fill('61.5')
  await click('apply')
  assert.equal((await read()).rows[0][3], 61.5, 'Renaming the inventory sheet retains its stable target identity')
  assert.deepEqual((await snapshot()).sheets[scratchId], withScratch.sheets[scratchId])
  await click('select')
  assert.equal(
    await root.getByRole('tab', { name: 'North and river stock', exact: true }).getAttribute('aria-selected'),
    'true',
  )
  const twoSheets = await snapshot()
  await click('remount')
  assert.deepEqual(await snapshot(), twoSheets, 'Both complete worksheet snapshots survive remount')
  await click('checkpoint')
  await root.getByRole('tab', { name: 'North and river stock', exact: true }).click({ button: 'right' })
  await page.getByText('Delete', { exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'OK', exact: true }).click()
  await page.waitForFunction(
    () =>
      JSON.parse(document.querySelector('[aria-label="Inventory lifecycle readback"]').textContent).rows.length === 0,
  )
  assert.equal(await root.locator('[data-action="apply"]').isDisabled(), true)
  assert.equal(await root.locator('[data-action="select"]').isDisabled(), true)
  assert.equal(await quantity.isDisabled(), true)
  const deletedStock = await snapshot()
  assert.equal(deletedStock.sheets.stock, undefined)
  assert.deepEqual(deletedStock.sheets[scratchId], twoSheets.sheets[scratchId])
  await click('remount')
  assert.deepEqual(await snapshot(), deletedStock, 'Remount must not silently recreate a deleted inventory sheet')
  await click('restore')
  assert.deepEqual(await snapshot(), twoSheets, 'Explicit checkpoint restoration recovers the deleted sheet')
  await click('reset')
  assert.deepEqual(await snapshot(), baseline)
  report.checks.push(
    'Native second-sheet creation/rename preserve stock targeting; deleted stock disables writes, full remount retains both sheets or the deletion, and explicit checkpoint restoration recovers stock',
  )

  for (const fixture of ['default', 'empty', 'boundary', 'error']) {
    let first
    for (let repeat = 0; repeat < 2; repeat += 1) {
      await root.locator('[name="fixture"]').selectOption(fixture)
      const state = await click('load', fixture === 'error')
      assert.equal(state.fixture, fixture)
      assert.equal(state.rows.length, fixture === 'empty' ? 0 : 18)
      if (fixture === 'empty') assert.equal(await root.locator('[data-action="select"]').isDisabled(), true)
      if (fixture === 'boundary')
        assert.deepEqual(
          state.rows.slice(0, 3).map((row) => row[3]),
          [0, 1000000, 0.125],
        )
      if (fixture === 'error') {
        assert.match(state.error, /returned false/)
        assert.deepEqual(state.snapshot, baseline, 'Missing-unit disposal must leave the real inventory unchanged')
      }
      if (repeat === 0) first = state.snapshot
      else assert.deepEqual(state.snapshot, first, 'Every complete fixture must be repeatable')
    }
    await root.screenshot({ path: path.join(directory, `fixture-${fixture}.png`) })
  }
  report.checks.push(
    'All four fixtures load twice with exact full snapshots; missing-unit false result is real and recoverable',
  )
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await click('reset')
    assert.ok(await root.evaluate((node) => node.scrollWidth <= node.clientWidth + 1))
    await quantity.fill('52')
    await root.locator('[data-action="apply"]').focus()
    await page.keyboard.press('Enter')
    await idle()
    assert.equal((await read()).rows[0][3], 52)
    await click('remount')
    assert.equal((await read()).rows[0][3], 52)
    await click('dispose')
    assert.equal(await root.locator('canvas').count(), 0)
    await click('mount')
    assert.deepEqual(await snapshot(), baseline)
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  report.checks.push('760/390/320px keyboard quantity edits and real remount/dispose/mount cycles remain usable')
  if (new URL(url).pathname.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.embed-lifecycle[data-theme="${theme}"][data-ready="true"]`).waitFor()
      await open()
      assert.deepEqual(await snapshot(), baseline)
      await quantity.fill('33')
      await click('apply')
      assert.equal((await read()).rows[0][3], 33)
      await click('dispose')
      await click('mount')
    }
    for (const [locale, title, headings] of [
      ['en-US', 'Mount, Dispose and Remount', ['Variants', 'Actions', 'States']],
      ['zh-CN', '挂载、销毁与重新挂载', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/embed/mount-dispose-remount`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const frame = page.frameLocator('iframe').first()
      await frame.locator('.embed-lifecycle[data-ready="true"]').waitFor({ timeout: 60000 })
      await frame.locator('.embed-lifecycle-controls > summary').click()
      await frame.getByRole('button', { name: 'Dispose editor', exact: true }).click()
      await frame.locator('.embed-lifecycle[data-state="disposed"]').waitFor()
      assert.equal(await frame.locator('canvas').count(), 0)
      await frame.getByRole('button', { name: 'Mount inventory', exact: true }).click()
      await frame.locator('.embed-lifecycle[data-state="mounted"]').waitFor()
      await page
        .getByRole('heading', { name: headings[0], exact: true })
        .locator('../..')
        .screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push(
      'Documentation light/dark replacement and EN/ZH 5/10/4 guides with working native iframe disposal/remount',
    )
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.writes, [])
  report.passed = true
} catch (cause) {
  report.failure = cause.stack || String(cause)
  report.failureStyles = await page
    .evaluate(() => {
      const host = document.querySelector('.embed-lifecycle')
      const workbench = host?.querySelector('[data-u-comp="workbench-layout"]')
      const flex = workbench?.querySelector('.univer-flex')
      return {
        hostDisplay: host && getComputedStyle(host).display,
        background: workbench && getComputedStyle(workbench).backgroundColor,
        sdkWhite: workbench && getComputedStyle(workbench).getPropertyValue('--univer-gray-0'),
        flexDisplay: flex && getComputedStyle(flex).display,
        stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => ({
          href: link.href,
          disabled: link.disabled,
          media: link.media,
          loaded: !!link.sheet,
        })),
        cssRequests: performance
          .getEntriesByType('resource')
          .filter((entry) => entry.name.includes('.css'))
          .map((entry) => ({ url: entry.name, duration: entry.duration, status: entry.responseStatus })),
      }
    })
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  throw cause
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
