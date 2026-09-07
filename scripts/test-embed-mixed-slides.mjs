/* eslint-disable no-await-in-loop -- One native active page and history owner at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-mixed-slides')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-in-slides/README.md', 'utf8')).matchAll(
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
  fullscreenFailures: [],
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
  window.painted = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    if (window.painted.length > 20000) window.painted.splice(0, 10000)
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.beacon-review-embed')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const pageItem = (id) => root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')
const nativePage = () => root.locator('[data-embed-slides-page-list-host]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const snapshot = () =>
  page.evaluate(() => {
    const a = window.univerAPI
    return JSON.parse(
      JSON.stringify({
        host: a.getPresentation('beacon-repair-review').save(),
        sheet: a.getWorkbook('beacon-repair-costs').save(),
        docs: a.getDocument('beacon-repair-memo').save(),
        base: a.getBase('beacon-repair-readiness').save(),
        board: a.getBoard('beacon-repair-delivery').save(),
      }),
    )
  })
async function activate(kind) {
  if (kind === 'sheet') {
    await pageItem('economics').click()
    const float = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="beacon-review-sheet-float"]')
    await float.waitFor()
    const rect = await float.boundingBox()
    await page.mouse.dblclick(rect.x + 180, rect.y + 110)
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-embed-id="beacon-review-sheet-float"][data-u-comp="embed-float-dom"]')
          ?.getAttribute('data-embed-float-stage') === 'stage2',
    )
  } else {
    await pageItem(kind === 'host' ? 'cover' : 'beacon-review-' + (kind === 'docs' ? 'doc' : kind) + '-page').click()
    if (kind !== 'host') await nativePage().waitFor()
  }
  await settle()
}
async function history(kind, before, after) {
  if (kind === 'sheet')
    await root
      .locator('[data-u-comp="embed-float-dom"][data-embed-id="beacon-review-sheet-float"]')
      .locator('canvas')
      .filter({ visible: true })
      .last()
      .click({ position: { x: 100, y: 90 } })
  if (kind === 'sheet') await page.keyboard.press('Escape')
  if (kind === 'board')
    await nativePage()
      .locator('[data-board-viewport-host="true"]')
      .click({ position: { x: 20, y: 30 } })
  for (const [action, expected] of [
    ['undo', before],
    ['redo', after],
  ]) {
    if (kind === 'sheet' || kind === 'board') await page.keyboard.press(action === 'undo' ? 'Control+z' : 'Control+y')
    else if (kind === 'base')
      await nativePage()
        .getByRole('button', { name: action === 'undo' ? 'Undo' : 'Redo', exact: true })
        .click()
    else
      await root
        .locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command="univer.command.' + action + '"]')
        .filter({ visible: true })
        .click()
    await settle()
    try {
      if (kind === 'sheet')
        await page.waitForFunction(
          (value) =>
            window.univerAPI
              .getWorkbook('beacon-repair-costs')
              .getSheetByName('Pilot costs')
              .getRange('D16')
              .getRawValue() === value,
          expected.sheet.sheets.resources.cellData[15][3].v,
          { timeout: 5000 },
        )
      assert.deepEqual(await snapshot(), expected, kind + ' native ' + action + ' strict five-model equality')
    } catch (e) {
      report.historyFailures.push({ kind, action, failure: e.message })
    }
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4266', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await page.waitForFunction(
    () => {
      const e = document.querySelector('.beacon-review-embed')
      return e?.dataset.ready || e?.dataset.error
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(await root.locator('iframe,fieldset,[data-action]').count(), 0)
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  report.descriptors = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'beacon-repair-review' }).map((e) => e.getDescriptor()),
  )
  assert.equal(report.descriptors.length, 4)
  assert.deepEqual(
    report.descriptors.map((d) => d.childUnitId).toSorted(),
    ['beacon-repair-costs', 'beacon-repair-memo', 'beacon-repair-readiness', 'beacon-repair-delivery'].toSorted(),
  )
  const initial = await snapshot()
  assert.deepEqual(initial.host.slideOrder, [
    'cover',
    'scope',
    'economics',
    'beacon-review-doc-page',
    'beacon-review-base-page',
    'beacon-review-board-page',
    'decision',
  ])
  assert.deepEqual(initial.host.defaultPageSize, { width: 1000, height: 562.5 })
  for (const id of ['cover', 'scope', 'economics', 'decision']) {
    await pageItem(id).click()
    await settle()
    assert.equal((await snapshot()).host.activeSlideId, id)
    await page.screenshot({ path: path.join(directory, id + '.png') })
  }
  for (const [kind, text] of [
    ['docs', 'bounded trial'],
    ['base', 'Tool inventory'],
    ['board', 'Prepare, run, review.'],
    ['sheet', 'Pilot cost model'],
  ]) {
    await page.evaluate(() => {
      window.painted = []
    })
    await activate(kind)
    await page.waitForFunction((t) => window.painted.join('').includes(t), text)
    await page.screenshot({ path: path.join(directory, kind + '.png') })
  }
  report.checks.push(
    'Four different authored layouts and all four real native children render through the seven-entry Slides page list and Sheet Float; official white/Grid UI and no fixture or iframe',
  )
  for (const [index, kind] of ['sheet', 'docs', 'base', 'board', 'host'].entries()) {
    await activate(kind)
    const before = await snapshot()
    await page.evaluate(examples[index])
    await settle()
    if (kind === 'sheet')
      await page.waitForFunction(
        () =>
          window.univerAPI
            .getWorkbook('beacon-repair-costs')
            .getSheetByName('Pilot costs')
            .getRange('D16')
            .getRawValue() === 7918,
      )
    const after = await snapshot()
    assert.notDeepEqual(after[kind], before[kind])
    for (const key of Object.keys(before))
      if (key !== kind) assert.deepEqual(after[key], before[key], kind + ' leaves ' + key + ' unchanged')
    await history(kind, before, after)
    await page.screenshot({ path: path.join(directory, kind + '-edited.png') })
    report.checks.push(kind + ' literal README example changes only its own model; native history assessed separately')
  }
  await activate('sheet')
  await page.evaluate(() =>
    window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
      window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
    }),
  )
  try {
    await page.evaluate(() => window.univerAPI.executeCommand('sheet.operation.print-open'))
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printSource), {
      workbook: 'beacon-repair-costs',
      sheet: 'resources',
    })
    await page.getByText('Total: 1pages', { exact: true }).waitFor()
    await page
      .locator(
        '[data-u-comp="embed-float-dom-chrome"][data-embed-id="beacon-review-sheet-float"] [data-u-comp="sheet-embed-floating-menu"]',
      )
      .waitFor({ state: 'hidden' })
    await page.screenshot({ path: path.join(directory, 'sheet-print.png') })
    await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
    report.checks.push(
      'Async Facade executeCommand opens one-page native child-Sheet Print preview and cancellation; no produced PDF or whole-deck printing claim',
    )
  } catch (e) {
    report.printFailures.push(e.message)
    await page.screenshot({ path: path.join(directory, 'print-failure.png') })
    if (await page.getByRole('button', { name: 'CANCEL', exact: true }).isVisible())
      await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
  }
  // Keep the failing fullscreen gate independent so it cannot hide other evidence.
  await activate('sheet')
  try {
    await page
      .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="beacon-review-sheet-float"]')
      .getByRole('button', { name: 'Enter fullscreen', exact: true })
      .click()
    await shell.waitFor()
    await shell.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
    await shell.waitFor({ state: 'detached' })
  } catch (e) {
    report.fullscreenFailures.push(e.message)
    await page.screenshot({ path: path.join(directory, 'fullscreen-failure.png') })
  }
  await activate('sheet')
  try {
    const beforeTyping = await snapshot()
    await root
      .locator('[data-u-comp="embed-float-dom"][data-embed-id="beacon-review-sheet-float"] canvas')
      .filter({ visible: true })
      .last()
      .dblclick({ position: { x: 320, y: 220 } })
    await page.keyboard.press('Control+a')
    await settle()
    await page.keyboard.type('168', { delay: 100 })
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getWorkbook('beacon-repair-costs')
          .getSheetByName('Pilot costs')
          .getRange('B8')
          .getRawValue() === 168,
    )
    const afterTyping = await snapshot()
    for (const key of ['host', 'docs', 'base', 'board']) assert.deepEqual(afterTyping[key], beforeTyping[key])
    await history('sheet', beforeTyping, afterTyping)
    await page.keyboard.press('Control+z')
    await settle()
    assert.deepEqual(await snapshot(), beforeTyping)
    report.checks.push(
      'Native Sheet keyboard input 156 to 168 and final Undo verified; intermediate strict Undo/Redo outcomes are retained in historyFailures',
    )
  } catch (e) {
    report.nativeInputFailures.push(e.message)
    report.nativeInputValues = await page.evaluate(() =>
      window.univerAPI.getWorkbook('beacon-repair-costs').getSheetByName('Pilot costs').getRange('B8:D8').getValues(),
    )
    await page.screenshot({ path: path.join(directory, 'native-input-failure.png') })
  }
  await activate('board')
  const before = await snapshot()
  await pageItem('decision').click()
  await activate('board')
  assert.deepEqual(await snapshot(), before, 'Native page round-trip preserves all five edited models')
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await root.waitFor({ state: 'detached' })
  await settle()
  assert.deepEqual(report.errors, [])
  report.checks.push(
    'Native page round-trip and selected active-Board disposal preserve ownership with no observed browser errors or backend requests',
  )
  assert.deepEqual(report.historyFailures, [], 'Strict native history gates must pass')
  assert.deepEqual(report.fullscreenFailures, [], 'Native fullscreen must open and exit')
  assert.deepEqual(report.nativeInputFailures, [], 'Native Sheet typing must pass')
  assert.deepEqual(report.printFailures, [], 'Native Sheet Print preview must pass')
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.diagnostic = await page
    .evaluate(() => ({ text: document.body.innerText.slice(-4000), painted: window.painted?.slice(-150) }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected Beacon mixed Slides native checks')
