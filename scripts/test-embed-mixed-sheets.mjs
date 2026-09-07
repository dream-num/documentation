/* eslint-disable no-await-in-loop -- Native tab interactions must be observed in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-mixed-sheets')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-in-sheets/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 4)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const report = { passed: false, checks: [], errors: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (!new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/) && ['fetch', 'xhr'].includes(r.resourceType()))
    report.backendRequests.push(r.url())
})
await page.addInitScript(() => {
  window.painted = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    if (window.painted.length > 20000) window.painted.splice(0, 10000)
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const snapshot = () =>
  page.evaluate(() => {
    const a = window.univerAPI
    return JSON.parse(
      JSON.stringify({
        host: a.getWorkbook('harbor-room-budget').save(),
        docs: a.getDocument('harbor-room-rationale').save(),
        slides: a.getPresentation('harbor-room-briefing').save(),
        base: a.getBase('harbor-room-suppliers').save(),
        board: a.getBoard('harbor-room-workflow').save(),
      }),
    )
  })
const tab = (name) => page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
const paint = async (text) => {
  await page.waitForFunction((expected) => window.painted.join('').includes(expected), text)
}
async function runExample(index, target) {
  const before = await snapshot()
  await page.evaluate(examples[index])
  await settle()
  const after = await snapshot()
  assert.notDeepEqual(after[target], before[target], target + ' changes')
  for (const key of Object.keys(before))
    if (key !== target) assert.deepEqual(after[key], before[key], key + ' stays independent')
  if (target === 'board')
    await page
      .locator('[data-embed-sheets-sheet-tab-host] [data-board-viewport-host="true"]')
      .click({ position: { x: 20, y: 30 } })
  for (const [action, expected] of [
    ['undo', before],
    ['redo', after],
  ]) {
    if (target === 'board') await page.keyboard.press(action === 'undo' ? 'Control+z' : 'Control+y')
    else if (target === 'base')
      await page.getByRole('button', { name: action === 'undo' ? 'Undo' : 'Redo', exact: true }).click()
    else await page.locator('[data-u-command="univer.command.' + action + '"]').click()
    await settle()
    const restored = await snapshot()
    for (const key of Object.keys(expected))
      assert.deepEqual(restored[key], expected[key], target + ' native ' + action + ' preserves ' + key)
  }
  report.checks.push(target + ' literal example and native Undo/Redo preserve all five full snapshots')
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4260', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await page.waitForFunction(
    () => {
      const e = document.querySelector('.harbor-room-embed')
      return e?.dataset.ready || e?.dataset.error
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.locator('.harbor-room-embed').getAttribute('data-error'), null)
  await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(await page.locator('.harbor-room-embed fieldset,.harbor-room-embed [data-action],iframe').count(), 0)
  assert.equal(
    await page
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  report.descriptors = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'harbor-room-budget' }).map((e) => e.getDescriptor()),
  )
  assert.equal(report.descriptors.length, 4)
  assert.equal(report.descriptors.filter((d) => d.entry === 'sheets-floating-object').length, 1)
  assert.equal(report.descriptors.filter((d) => d.entry === 'sheets-sheet-tab').length, 3)
  for (const d of report.descriptors) assert.equal(d.context.resolved, true)
  for (const name of ['Pilot budget', 'Decision memo', 'Supplier operations', 'Delivery workflow'])
    assert.equal(await tab(name).count(), 1)
  await tab('Pilot budget').click()
  await paint('A room to read.')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('harbor-room-budget')
        .getSheetByName('Pilot budget')
        .getRange('D16')
        .getRawValue() === 7290.8,
  )
  await page.screenshot({ path: path.join(directory, 'budget-and-briefing.png') })
  report.checks.push(
    'One native Float and three native Tabs resolve under a single workbook; Grid and official white CSS paint without fixture controls',
  )
  // First mount each child before taking cross-product snapshots; initial UI setup may create native metadata.
  for (const [name, text] of [
    ['Decision memo', 'A small pilot'],
    ['Supplier operations', null],
    ['Delivery workflow', 'Prepare, deliver, learn.'],
  ]) {
    await page.evaluate(() => {
      window.painted = []
    })
    await tab(name).click()
    await page.locator('[data-embed-sheets-sheet-tab-host]').waitFor()
    if (text) await paint(text)
    else await paint('Quay Rooms')
    await page.screenshot({ path: path.join(directory, name.toLowerCase().replaceAll(' ', '-') + '.png') })
  }
  await tab('Pilot budget').click()
  await runExample(0, 'host')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('harbor-room-budget')
        .getSheetByName('Pilot budget')
        .getRange('D16')
        .getRawValue() === 7528.4,
  )
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getWorkbook('harbor-room-budget').getSheetByName('Pilot budget').getRange('D18').getRawValue(),
    ),
    471.6,
  )
  await tab('Decision memo').click()
  await runExample(1, 'docs')
  // Native hyphenation can paint Re- and vised. on separate lines.
  assert.ok((await snapshot()).docs.body.dataStream.includes('A small pilot. Room to learn. Revised.'))
  await page.waitForFunction(() => {
    const text = window.painted.join('')
    return text.includes('Revised.') || (text.includes('Re-') && text.includes('vised.'))
  })
  await page.screenshot({ path: path.join(directory, 'edited-memo.png') })
  await tab('Supplier operations').click()
  await runExample(2, 'base')
  await paint('Confirm 108 kit contents')
  await tab('Delivery workflow').click()
  await runExample(3, 'board')
  await paint('In review')
  const beforeType = await snapshot()
  const canvas = page.locator('[data-embed-sheets-sheet-tab-host] [data-board-canvas-view="true"]')
  const view = await canvas.evaluate((e) => ({
    zoom: Number(e.getAttribute('data-zoom-ratio')),
    pan: e.getAttribute('data-pan-offset').split(',').map(Number),
  }))
  const bounds = await canvas.locator('canvas').first().boundingBox()
  assert.ok(bounds)
  const shape = beforeType.board.pages.workflow.elements.prepare.transform
  await page.mouse.dblclick(
    bounds.x + view.pan[0] + (shape.left + shape.width / 2) * view.zoom,
    bounds.y + view.pan[1] + (shape.top + shape.height / 2) * view.zoom,
  )
  await page.locator('[data-u-comp="shape-text-editor-content"]').filter({ visible: true }).waitFor()
  await page.keyboard.press('Control+End')
  await page.keyboard.down('Shift')
  for (let i = 0; i < 'In review'.length; i++) await page.keyboard.press('ArrowLeft')
  await page.keyboard.up('Shift')
  await page.keyboard.type('Reviewed')
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + 90)
  await page.waitForFunction(
    () =>
      window.univerAPI.getBoard('harbor-room-workflow').getShape('prepare').getText().getPlainText() ===
      'Prepare materials\nMaya / Reviewed',
  )
  const afterType = await snapshot()
  for (const key of ['host', 'docs', 'slides', 'base'])
    assert.deepEqual(afterType[key], beforeType[key], key + ' survives native Board typing')
  assert.deepEqual(afterType.board.pages.workflow.elements.prepare.transform, shape)
  await page.screenshot({ path: path.join(directory, 'native-board-text.png') })
  await canvas.click({ position: { x: 20, y: 90 } })
  report.nativeTextUndoSteps = 0
  while (
    report.nativeTextUndoSteps < 8 &&
    JSON.stringify((await snapshot()).board) !== JSON.stringify(beforeType.board)
  ) {
    await page.keyboard.press('Control+z')
    await settle()
    report.nativeTextUndoSteps++
  }
  assert.deepEqual(await snapshot(), beforeType)
  for (let i = 0; i < report.nativeTextUndoSteps; i++) {
    await page.keyboard.press('Control+y')
    await settle()
  }
  assert.deepEqual(await snapshot(), afterType)
  report.checks.push(
    'Native Board text editor changes the review status with stable card geometry and full five-model Undo/Redo',
  )
  report.checks.push(
    'All four literal README examples mutate their intended unit and preserve the complete other four snapshots; budget formulas recalculate to 7528.40 / 471.60',
  )
  const beforeSlide = await snapshot()
  await tab('Pilot budget').click()
  await page.locator('[data-u-comp="embed-float-dom"]').dblclick({ position: { x: 320, y: 180 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await paint('Protect the reserve.')
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await paint('Review before expanding.')
  await page.screenshot({ path: path.join(directory, 'briefing-checkpoint.png') })
  const afterSlide = await snapshot()
  for (const key of ['host', 'docs', 'base', 'board'])
    assert.deepEqual(afterSlide[key], beforeSlide[key], key + ' survives slide navigation')
  report.checks.push(
    'Native floating Slides navigation reaches allocation and checkpoint without changing any other unit',
  )
  const edited = await snapshot()
  for (const name of ['Decision memo', 'Supplier operations', 'Delivery workflow', 'Pilot budget']) {
    await tab(name).click()
    await settle()
  }
  const returned = await snapshot()
  for (const key of ['docs', 'base', 'board'])
    assert.deepEqual(returned[key], edited[key], key + ' survives round trip')
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getWorkbook('harbor-room-budget').getSheetByName('Pilot budget').getRange('B7').getRawValue(),
    ),
    108,
  )
  await tab('Delivery workflow').click()
  await page.screenshot({ path: path.join(directory, 'edited-workflow.png') })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.harbor-room-embed').count(), 0)
  assert.deepEqual(report.errors, [], 'Include asynchronous teardown errors')
  report.checks.push(
    'Selected active-Board disposal releases the shared owner without observed browser errors or backend requests',
  )
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-3500),
      painted: window.painted?.slice(-120),
      root: document.querySelector('.harbor-room-embed')?.dataset,
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected mixed native Sheet workspace')
