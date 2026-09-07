/* eslint-disable no-await-in-loop -- One active native product and history owner at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-mixed-boards')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-in-boards/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 5)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
page.setDefaultTimeout(12000)
const report = { passed: false, checks: [], gates: {}, historyFailures: [], errors: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['fetch', 'xhr'].includes(r.resourceType()) && !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.painted = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    if (window.painted.length > 30000) window.painted.splice(0, 10000)
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.ripple-workshop-embed')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const kinds = ['sheet', 'doc', 'slide', 'base', 'host']
const float = (kind) =>
  root.locator('[data-u-comp="embed-float-dom"][data-embed-id="ripple-workshop-' + kind + '-float"]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const snapshot = () =>
  page.evaluate(() => {
    const a = window.univerAPI
    return JSON.parse(
      JSON.stringify({
        host: a.getBoard('ripple-wayfinding-workshop').save(),
        sheet: a.getWorkbook('ripple-wayfinding-budget').save(),
        doc: a.getDocument('ripple-wayfinding-agenda').save(),
        slide: a.getPresentation('ripple-wayfinding-review').save(),
        base: a.getBase('ripple-wayfinding-observations').save(),
      }),
    )
  })
const resultIs = (value) =>
  page.waitForFunction(
    (v) =>
      window.univerAPI
        .getWorkbook('ripple-wayfinding-budget')
        .getSheetByName('Workshop budget')
        .getRange('D16')
        .getRawValue() === v,
    value,
  )
async function exitFullscreen() {
  const close = page.locator('[data-embed-fullscreen-close="true"]')
  if (await close.isVisible()) await close.click()
  await shell.waitFor({ state: 'detached' })
  await settle()
}
async function activate(kind) {
  await exitFullscreen()
  if (kind === 'host') {
    await root.locator('[data-board-viewport-host="true"]').click({ position: { x: 50, y: 50 } })
    await page.keyboard.press('Escape')
    return
  }
  await float(kind).dblclick({ position: { x: 160, y: 90 } })
  await page.waitForFunction(
    (k) =>
      document
        .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="ripple-workshop-' + k + '-float"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
    kind,
  )
  await settle()
}
async function fullscreen(kind) {
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="ripple-workshop-' + kind + '-float"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await shell.waitFor()
  await settle()
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
    const cancel = page.getByRole('button', { name: 'CANCEL', exact: true })
    if (await cancel.isVisible()) await cancel.click()
    await page.keyboard.press('Escape')
  }
}
async function history(kind, before, after) {
  for (const [action, expected] of [
    ['undo', before],
    ['redo', after],
  ]) {
    if (kind === 'sheet') {
      await shell
        .locator('[data-embed-canvas-root="true"] canvas')
        .first()
        .click({ position: { x: 100, y: 90 } })
      await page.keyboard.press('Escape')
      await page.keyboard.press(action === 'undo' ? 'Control+z' : 'Control+y')
    } else if (kind === 'doc' || kind === 'slide') {
      await shell
        .locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command="univer.command.' + action + '"]')
        .click()
    } else {
      await (kind === 'host' ? root : shell)
        .getByRole('button', { name: action === 'undo' ? 'Undo' : 'Redo', exact: true })
        .filter({ visible: true })
        .click()
    }
    await settle()
    try {
      if (kind === 'sheet') await resultIs(expected.sheet.sheets.resources.cellData[15][3].v)
      assert.deepEqual(await snapshot(), expected, kind + ' native ' + action + ' strict five-model equality')
    } catch (e) {
      report.historyFailures.push({ kind, action, failure: e.message })
    }
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4270', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await page.waitForFunction(
    () => {
      const e = document.querySelector('.ripple-workshop-embed')
      return e?.dataset.ready || e?.dataset.error
    },
    {},
    { timeout: 90000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('iframe,fieldset,details,[data-action]').count(), 0)
  report.descriptors = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'ripple-wayfinding-workshop' }).map((e) => e.getDescriptor()),
  )
  assert.equal(report.descriptors.length, 4)
  assert.ok(report.descriptors.every((d) => d.entry === 'boards-floating-object' && d.context.resolved))
  assert.equal(await root.locator('[data-u-comp="embed-float-dom"]').count(), 4)
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  const initial = await snapshot()
  assert.equal(Object.keys(initial.base.tables.observations.records).length, 8)
  assert.equal(Object.keys(initial.base.tables.locations.records).length, 3)
  assert.equal(initial.slide.slideOrder.length, 3)
  await page.screenshot({ path: path.join(directory, 'overview.png') })
  report.checks.push(
    'Four resolved native Board Floats, three-slide review, eight observations linked to three locations; official white UI and no iframe/fixture controls',
  )
  await gate('three-native-slide-layouts', async () => {
    await activate('slide')
    await fullscreen('slide')
    for (const id of ['places', 'checkpoint', 'cover']) {
      await shell.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
      await settle()
      assert.equal((await snapshot()).slide.activeSlideId, id)
      await page.screenshot({ path: path.join(directory, 'slide-' + id + '.png') })
    }
    report.checks.push('Three distinct Slides layouts are reachable through native thumbnails')
  })
  for (const [index, kind] of kinds.entries()) {
    await gate(kind + '-literal-and-native-history', async () => {
      await activate(kind)
      if (kind !== 'host') {
        await fullscreen(kind)
        if (kind !== 'base') await shell.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
      }
      if (kind === 'sheet') await resultIs(1795.2)
      const before = await snapshot()
      await page.evaluate(examples[index])
      await settle()
      if (kind === 'sheet') await resultIs(1817.2)
      const after = await snapshot()
      assert.notDeepEqual(after[kind], before[kind])
      for (const other of kinds.filter((k) => k !== kind))
        assert.deepEqual(after[other], before[other], kind + ' preserves ' + other)
      await page.screenshot({ path: path.join(directory, kind + '-edited.png') })
      report.checks.push(kind + ' literal README example changes only its own complete model')
      await history(kind, before, after)
      assert.equal(report.historyFailures.filter((f) => f.kind === kind).length, 0, kind + ' strict history must pass')
    })
  }
  await gate('sheet-native-input-and-print', async () => {
    await activate('sheet')
    await fullscreen('sheet')
    await resultIs(1817.2)
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('ripple-wayfinding-budget').save().sheets.resources
      const b = document
        .querySelector('[data-embed-fullscreen-shell="true"] [data-embed-canvas-root="true"] canvas')
        .getBoundingClientRect()
      return {
        x: b.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w / 2) * s.zoomRatio,
        y: b.y + (s.columnHeader.height + s.rowData[0].h + 3.5 * s.defaultRowHeight) * s.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('ripple-wayfinding-budget').getActiveRange()?.getA1Notation() === 'B5',
    )
    const before = await snapshot()
    await page.keyboard.type('48')
    await page.keyboard.press('Enter')
    await resultIs(1839.2)
    const after = await snapshot()
    for (const k of kinds.filter((kind) => kind !== 'sheet')) assert.deepEqual(after[k], before[k])
    await history('sheet', before, after)
    await page.screenshot({ path: path.join(directory, 'sheet-typed.png') })
    report.checks.push('Native keyboard B5=48 recalculates to1839.20; other four models remain unchanged')
    await page.evaluate(() =>
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      }),
    )
    await page.evaluate(() => window.univerAPI.executeCommand('sheet.operation.print-open'))
    const cancel = page.getByRole('button', { name: 'CANCEL', exact: true })
    await cancel.waitFor()
    assert.deepEqual(await page.evaluate(() => window.printSource), {
      workbook: 'ripple-wayfinding-budget',
      sheet: 'resources',
    })
    await page.getByText('Total: 1pages', { exact: true }).waitFor()
    await page.screenshot({ path: path.join(directory, 'print.png') })
    await cancel.click()
    await cancel.waitFor({ state: 'detached' })
    report.checks.push('Native one-page budget Print preview/cancel uses the child Sheet; no produced PDF claim')
  })
  await gate('native-board-movement', async () => {
    await activate('host')
    const before = await snapshot()
    const point = await page.evaluate(() =>
      window.univerAPI.getBoard('ripple-wayfinding-workshop').getElementViewportPoint('revise'),
    )
    assert.ok(point)
    const bounds = await root.locator('[data-board-viewport-host="true"]').boundingBox()
    await page.mouse.click(bounds.x + point.x, bounds.y + point.y)
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(
      (left) =>
        window.univerAPI.getBoard('ripple-wayfinding-workshop').save().pages.planning.elements.revise.transform.left >
        left,
      before.host.pages.planning.elements.revise.transform.left,
    )
    const after = await snapshot()
    for (const kind of kinds.filter((k) => k !== 'host')) assert.deepEqual(after[kind], before[kind])
    await page.screenshot({ path: path.join(directory, 'board-moved.png') })
    await history('host', before, after)
    report.checks.push('Native Board arrow movement changes its process card only; full five-model history assessed')
  })
  await gate('native-navigation-and-fullscreen-disposal', async () => {
    for (const kind of ['doc', 'slide', 'base', 'sheet']) {
      await activate(kind)
      await fullscreen(kind)
      await exitFullscreen()
    }
    await activate('base')
    await fullscreen('base')
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await shell.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    report.checks.push('All four native fullscreen round-trips and active Base fullscreen disposal release the owner')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  assert.deepEqual(report.historyFailures, [])
  assert.ok(Object.values(report.gates).every((g) => g.passed))
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.diagnostic = await page
    .evaluate(() => ({
      root: document.querySelector('.ripple-workshop-embed')?.outerHTML.slice(0, 2200),
      painted: window.painted?.slice(-100),
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
