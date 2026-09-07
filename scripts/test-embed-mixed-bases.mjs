/* eslint-disable no-await-in-loop -- One active native product and history owner at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-mixed-bases')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-in-bases/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 5)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
page.setDefaultTimeout(15000)
const report = {
  passed: false,
  checks: [],
  historyFailures: [],
  nativeInputFailures: [],
  printFailures: [],
  errors: [],
  backendRequests: [],
}
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
  window.mountTrace = []
  const append = Node.prototype.appendChild
  Node.prototype.appendChild = function (node) {
    if (node instanceof HTMLCanvasElement && node.id.startsWith('univer-base-main-canvas'))
      window.mountTrace.push({
        phase: window.testPhase,
        parent: this.outerHTML?.slice(0, 350),
        stack: new Error().stack,
      })
    return Reflect.apply(append, this, [node])
  }
  window.painted = []
  window.paintPoints = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    if (window.painted.length > 20000) window.painted.splice(0, 10000)
    const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
    const bounds = this.canvas.getBoundingClientRect()
    if (bounds.width > 300)
      window.paintPoints.push({
        text: String(args[0]),
        x: bounds.x + (point.x * bounds.width) / this.canvas.width,
        y: bounds.y + (point.y * bounds.height) / this.canvas.height,
      })
    if (window.paintPoints.length > 10000) window.paintPoints.splice(0, 5000)
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.acorn-workspace-embed')
const names = {
  sheet: 'Weighted forecast',
  docs: 'Delivery playbook',
  slides: 'Studio review',
  board: 'Service blueprint',
  host: 'Follow-ups',
}
const kinds = ['sheet', 'docs', 'slides', 'board', 'host']
const child = () => root.locator('[data-embed-bases-table-list-host]').filter({ visible: true })
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const snapshot = () =>
  page.evaluate(() => {
    const a = window.univerAPI
    return JSON.parse(
      JSON.stringify({
        host: a.getBase('acorn-studio-operations').save(),
        sheet: a.getWorkbook('acorn-studio-forecast').save(),
        docs: a.getDocument('acorn-studio-playbook').save(),
        slides: a.getPresentation('acorn-studio-review').save(),
        board: a.getBoard('acorn-studio-workflow').save(),
      }),
    )
  })
async function activate(kind) {
  await page.evaluate((value) => {
    window.testPhase = 'activate ' + value
  }, kind)
  const tableId =
    kind === 'host'
      ? 'tasks'
      : 'acorn-workspace-' + (kind === 'docs' ? 'doc' : kind === 'slides' ? 'slide' : kind) + '-tab'
  // Reselecting an already active tab is a separate failing regression, not a prerequisite for every action.
  if ((await page.evaluate(() => window.univerAPI.getBaseUI().getActiveTableId())) !== tableId)
    await root.getByText(names[kind], { exact: true }).click()
  if (kind !== 'host') await child().waitFor()
  await settle()
}
const resultIs = (v) =>
  page.waitForFunction(
    (value) =>
      window.univerAPI.getWorkbook('acorn-studio-forecast').getSheetByName('Forecast').getRange('E15').getRawValue() ===
      value,
    v,
  )
async function history(kind, before, after) {
  await page.evaluate((value) => {
    window.testPhase = 'history ' + value
  }, kind)
  if (kind === 'sheet') {
    await child()
      .locator('canvas')
      .filter({ visible: true })
      .last()
      .click({ position: { x: 100, y: 90 } })
    await page.keyboard.press('Escape')
  }
  for (const [action, expected] of [
    ['undo', before],
    ['redo', after],
  ]) {
    if (kind === 'sheet') await page.keyboard.press(action === 'undo' ? 'Control+z' : 'Control+y')
    else if (kind === 'host' || kind === 'board')
      await (kind === 'host' ? root : child())
        .getByRole('button', { name: action === 'undo' ? 'Undo' : 'Redo', exact: true })
        .filter({ visible: true })
        .click()
    else
      await root
        .locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command="univer.command.' + action + '"]')
        .filter({ visible: true })
        .click()
    await settle()
    try {
      if (kind === 'sheet') await resultIs(expected.sheet.sheets.forecast.cellData[14][4].v)
      assert.deepEqual(await snapshot(), expected, kind + ' native ' + action + ' strict five-model equality')
    } catch (e) {
      report.historyFailures.push({ kind, action, failure: e.message })
    }
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4268', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await page.waitForFunction(
    () => {
      const e = document.querySelector('.acorn-workspace-embed')
      return e?.dataset.ready || e?.dataset.error
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('iframe,fieldset,details,[data-action],[data-u-comp="embed-float-dom"]').count(), 0)
  report.descriptors = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'acorn-studio-operations' }).map((e) => e.getDescriptor()),
  )
  assert.equal(report.descriptors.length, 4)
  assert.ok(report.descriptors.every((d) => d.entry === 'bases-table-list-block'))
  assert.deepEqual(
    report.descriptors.map((d) => d.childUnitId).toSorted(),
    ['acorn-studio-forecast', 'acorn-studio-playbook', 'acorn-studio-review', 'acorn-studio-workflow'].toSorted(),
  )
  const initial = await snapshot()
  assert.deepEqual(initial.host.tableOrder, [
    'deals',
    'tasks',
    'accounts',
    'acorn-workspace-sheet-tab',
    'acorn-workspace-doc-tab',
    'acorn-workspace-slide-tab',
    'acorn-workspace-board-tab',
  ])
  assert.deepEqual(
    ['deals', 'tasks', 'accounts'].map((id) => initial.host.tables[id].recordOrder.length),
    [10, 6, 4],
  )
  await page.waitForFunction(() => window.painted.includes('Tidal Atlas / Touring exhibition'))
  await page.screenshot({ path: path.join(directory, 'opportunities.png') })
  for (const [kind, text] of [
    ['sheet', 'A forecast, not a promise'],
    ['docs', 'Build once. Travel thoughtfully.'],
    ['slides', 'Make room for the journey'],
    ['board', 'The return journey matters.'],
  ]) {
    await page.evaluate(() => {
      window.painted = []
    })
    await activate(kind)
    await page.waitForFunction((t) => window.painted.join('').includes(t), text)
    assert.equal(await child().evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(255, 255, 255)')
    if (kind !== 'board') {
      const embedKind = kind === 'docs' ? 'doc' : kind === 'slides' ? 'slide' : kind
      await root
        .locator('[data-u-comp="ribbon-grid-toolbar"][data-embed-id="acorn-workspace-' + embedKind + '"]')
        .waitFor()
    }
    await page.screenshot({ path: path.join(directory, kind + '.png') })
  }
  report.checks.push(
    'Three linked Base tables and four real native product tabs render; official white/Grid UI, no Float, iframe or fixture controls',
  )
  await activate('slides')
  for (const id of ['portfolio', 'checkpoint', 'cover']) {
    await child()
      .locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')
      .click()
    await settle()
    assert.equal((await snapshot()).slides.activeSlideId, id)
    await page.screenshot({ path: path.join(directory, 'slide-' + id + '.png') })
  }
  await activate('sheet')
  await resultIs(228400)
  for (const [index, kind] of kinds.entries()) {
    await activate(kind)
    const before = await snapshot()
    await page.evaluate(examples[index])
    await settle()
    if (kind === 'sheet') await resultIs(231000)
    const after = await snapshot()
    assert.notDeepEqual(after[kind], before[kind])
    for (const key of kinds)
      if (key !== kind) assert.deepEqual(after[key], before[key], kind + ' leaves ' + key + ' unchanged')
    await history(kind, before, after)
    report.checks.push(
      kind + ' literal README example changes only its own model; exact native Undo/Redo assessed separately',
    )
    await page.screenshot({ path: path.join(directory, kind + '-edited.png') })
  }
  await activate('sheet')
  const beforeWeight = await snapshot()
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('acorn-studio-forecast').getSheetByName('Assumptions').getRange('B5').setValue(0.5),
  )
  await resultIs(239250)
  const afterWeight = await snapshot()
  for (const key of ['host', 'docs', 'slides', 'board']) assert.deepEqual(afterWeight[key], beforeWeight[key])
  await history('sheet', beforeWeight, afterWeight)
  report.checks.push(
    'Qualified weight changes three Forecast rows and total through VLOOKUP while all other products remain unchanged',
  )
  // Undo/Redo of an Assumptions edit activates that sheet; explicitly choose what to print.
  await child().getByText('Forecast', { exact: true }).click()
  await settle()
  try {
    await page.evaluate(() => {
      window.paintPoints = []
    })
    await page.setViewportSize({ width: 1598, height: 1100 })
    await settle()
    await page.setViewportSize({ width: 1600, height: 1100 })
    const before = await snapshot()
    // C5: row header + 245px A + 135px B; 31px authored rows below the column header.
    await child()
      .locator('canvas')
      .filter({ visible: true })
      .last()
      .dblclick({ position: { x: 500, y: 165 } })
    await page.keyboard.press('Control+a')
    await settle()
    await page.keyboard.type('56000', { delay: 100 })
    await page.keyboard.press('Enter')
    await resultIs(241850)
    const after = await snapshot()
    for (const key of ['host', 'docs', 'slides', 'board']) assert.deepEqual(after[key], before[key])
    await history('sheet', before, after)
    await page.keyboard.press('Control+z')
    await resultIs(239250)
    assert.deepEqual(await snapshot(), before)
    report.checks.push(
      'Native Sheet keyboard input 52000 to 56000 recalculates, with complete five-model Undo/Redo after initialization and final Undo',
    )
  } catch (e) {
    report.nativeInputFailures.push(e.message)
  }
  await page.evaluate(() =>
    window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
      window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
    }),
  )
  try {
    await page.evaluate(() => window.univerAPI.executeCommand('sheet.operation.print-open'))
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printSource), {
      workbook: 'acorn-studio-forecast',
      sheet: 'forecast',
    })
    await page.getByText('Total: 1pages', { exact: true }).waitFor()
    await page.screenshot({ path: path.join(directory, 'print.png') })
    await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
    report.checks.push('Actual child Sheet one-page native Print preview and Cancel; no produced PDF claim')
  } catch (e) {
    report.printFailures.push(e.message)
    await page.screenshot({ path: path.join(directory, 'print-failure.png') })
    if (await page.getByRole('button', { name: 'CANCEL', exact: true }).isVisible())
      await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
  }
  try {
    await root.getByText('Accounts', { exact: true }).click()
    await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'accounts')
    await page.setViewportSize({ width: 1598, height: 1100 })
    await settle()
    await page.evaluate(() => {
      window.paintPoints = []
    })
    await page.setViewportSize({ width: 1600, height: 1100 })
    await page.waitForFunction(() => window.paintPoints.some((p) => p.text === 'Independent Museums'))
    const point = await page.evaluate(() => window.paintPoints.findLast((p) => p.text === 'Independent Museums'))
    const before = await snapshot()
    await page.mouse.dblclick(point.x + 18, point.y - 4)
    await page.keyboard.press('Control+a')
    await page.keyboard.type('Museum Partners')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('acorn-studio-operations')
          .getTableById('accounts')
          .getRecordById('accounts-1')
          .getValue('title') === 'Museum Partners',
    )
    const after = await snapshot()
    for (const key of ['sheet', 'docs', 'slides', 'board']) assert.deepEqual(after[key], before[key])
    await history('host', before, after)
    await root.getByText('Opportunities', { exact: true }).click()
    await page.waitForFunction(() => window.painted.includes('Museum Partners'))
    const links = await page.evaluate(() =>
      ['deals-1', 'deals-4', 'deals-10'].map((id) =>
        window.univerAPI.getBase('acorn-studio-operations').getTableById('deals').getRecordById(id).getValue('account'),
      ),
    )
    assert.ok(links.every((v) => JSON.stringify(v).includes('accounts-1') && !JSON.stringify(v).includes('Museum')))
    report.checks.push(
      'Native Base keyboard rename, full-model Undo/Redo and stable linked IDs update partner labels without modifying child models',
    )
  } catch (e) {
    report.nativeInputFailures.push(e.message)
  }
  await activate('board')
  const before = await snapshot()
  await activate('host')
  await activate('board')
  assert.deepEqual(await snapshot(), before)
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await root.waitFor({ state: 'detached' })
  await settle()
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.checks.push(
    'Native tab round-trip and selected active-Board disposal preserve ownership without observed browser errors or backend requests',
  )
  assert.deepEqual(report.historyFailures, [])
  assert.deepEqual(report.nativeInputFailures, [])
  assert.deepEqual(report.printFailures, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-6000),
      painted: window.painted?.slice(-150),
      mountTrace: window.mountTrace,
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected Acorn mixed Bases native checks')
