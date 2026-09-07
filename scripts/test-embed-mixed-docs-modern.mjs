/* eslint-disable no-await-in-loop -- Native block activation and history are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-mixed-docs-modern')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-in-docs-modern/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 5)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const report = { passed: false, checks: [], historyFailures: [], errors: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (['fetch', 'xhr'].includes(r.resourceType()) && !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname))
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
        host: a.getDocument('northstar-seed-project').save(),
        sheet: a.getWorkbook('northstar-seed-budget').save(),
        base: a.getBase('northstar-seed-readiness').save(),
        slide: a.getPresentation('northstar-seed-strategy').save(),
        board: a.getBoard('northstar-seed-dependencies').save(),
      }),
    )
  })
const descriptors = () =>
  page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'northstar-seed-project' }).map((e) => e.getDescriptor()),
  )
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const block = (kind) =>
  page.locator('[data-u-comp="embed-float-dom"][data-embed-id="northstar-project-' + kind + '-block"]')
async function expand(kind) {
  const child = block(kind)
  // The document renderer owns scrolling; DOM scrollIntoView does not move its canvas viewport.
  for (let i = 0; i < 20; i++) {
    const rect = await child.boundingBox()
    assert.ok(rect, kind + ' has a native document block')
    if (rect.y >= 155 && rect.y + 180 < 1030) break
    await page.mouse.move(1350, 550)
    await page.mouse.wheel(0, rect.y - 250)
    await settle()
  }
  const rect = await child.boundingBox()
  await page.mouse.dblclick(rect.x + 180, rect.y + 110)
  await page.waitForFunction(
    (id) =>
      document
        .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="' + id + '"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
    'northstar-project-' + kind + '-block',
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="northstar-project-' + kind + '-block"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await shell.waitFor()
  await settle()
  // Return real keyboard focus to the Sheet canvas before exercising native shortcuts.
  if (kind === 'sheet') {
    await shell
      .locator('canvas')
      .filter({ visible: true })
      .last()
      .click({ position: { x: 350, y: 180 } })
    await settle()
  }
}
async function collapse() {
  await shell.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
  await shell.waitFor({ state: 'detached' })
  await settle()
}
async function history(kind, before, after) {
  if (kind === 'board') await shell.locator('[data-board-viewport-host="true"]').click({ position: { x: 20, y: 30 } })
  if (kind === 'sheet')
    await shell
      .locator('canvas')
      .filter({ visible: true })
      .last()
      .click({ position: { x: 350, y: 180 } })
  for (const [action, expected] of [
    ['undo', before],
    ['redo', after],
  ]) {
    if (kind === 'board' || kind === 'sheet') await page.keyboard.press(action === 'undo' ? 'Control+z' : 'Control+y')
    else if (kind === 'base')
      await shell.getByRole('button', { name: action === 'undo' ? 'Undo' : 'Redo', exact: true }).click()
    else
      await shell
        .locator('[data-u-command="univer.command.' + action + '"]')
        .filter({ visible: true })
        .click()
    await settle()
    try {
      assert.deepEqual(await snapshot(), expected, kind + ' native ' + action + ' preserves all five models')
    } catch (error) {
      report.historyFailures.push({ kind, action, failure: error.message })
    }
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4262', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await page.waitForFunction(
    () => {
      const e = document.querySelector('.northstar-project-embed')
      return e?.dataset.ready || e?.dataset.error
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.locator('.northstar-project-embed').getAttribute('data-error'), null)
  await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(
    await page.locator('iframe,.northstar-project-embed fieldset,.northstar-project-embed [data-action]').count(),
    0,
  )
  assert.equal(
    await page
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  report.descriptors = await descriptors()
  assert.equal(report.descriptors.length, 4)
  for (const d of report.descriptors) {
    assert.equal(d.entry, 'docs-custom-block')
    assert.equal(d.context.resolved, true)
  }
  await page.screenshot({ path: path.join(directory, 'project-brief.png') })
  // Warm native views before strict snapshots; first view creation may materialize UI metadata.
  for (const [kind, text] of [
    ['sheet', 'Resource plan'],
    ['base', 'Station host agreements'],
    ['slide', 'A library of beginnings.'],
    ['board', 'Scope, hand over, review.'],
  ]) {
    await page.evaluate(() => {
      window.painted = []
    })
    await expand(kind)
    await page.waitForFunction((expected) => window.painted.join('').includes(expected), text)
    await page.screenshot({ path: path.join(directory, kind + '.png') })
    await collapse()
  }
  report.checks.push(
    'Four native DocBlocks open through native fullscreen controls and paint original Sheet, Base, Slides and Board content; official white/Grid UI without fixture controls',
  )
  for (const [index, kind] of ['sheet', 'base', 'slide', 'board'].entries()) {
    await expand(kind)
    const before = await snapshot()
    await page.evaluate(examples[index])
    await settle()
    const after = await snapshot()
    assert.notDeepEqual(after[kind], before[kind])
    for (const key of Object.keys(before))
      if (key !== kind) assert.deepEqual(after[key], before[key], kind + ' leaves ' + key + ' unchanged')
    await history(kind, before, after)
    if (kind === 'sheet') {
      await page.waitForFunction(
        () =>
          window.univerAPI
            .getWorkbook('northstar-seed-budget')
            .getSheetByName('Resource plan')
            .getRange('D16')
            .getRawValue() === 4008.48,
      )
      const beforeTyping = await snapshot()
      await shell
        .locator('canvas')
        .filter({ visible: true })
        .last()
        .click({ position: { x: 350, y: 184 } })
      await page.keyboard.type('90')
      await page.keyboard.press('Enter')
      await page.waitForFunction(
        () =>
          window.univerAPI
            .getWorkbook('northstar-seed-budget')
            .getSheetByName('Resource plan')
            .getRange('B6')
            .getRawValue() === 90,
      )
      const afterTyping = await snapshot()
      for (const key of ['host', 'base', 'slide', 'board']) assert.deepEqual(afterTyping[key], beforeTyping[key])
      await history('sheet', beforeTyping, afterTyping)
      await page.keyboard.press('Control+z')
      await settle()
      try {
        assert.deepEqual(await snapshot(), beforeTyping)
      } catch (error) {
        report.historyFailures.push({ kind: 'sheet-native-typing', action: 'final-undo', failure: error.message })
      }
      assert.equal(
        await page.evaluate(() =>
          window.univerAPI
            .getWorkbook('northstar-seed-budget')
            .getSheetByName('Resource plan')
            .getRange('B6')
            .getRawValue(),
        ),
        84,
      )
      report.checks.push(
        'Actual native Sheet keyboard input changes packs to 90 and Undo restores 84; strict snapshot differences remain in historyFailures',
      )
    }
    if (kind === 'slide') await page.waitForFunction(() => window.painted.join('').includes('A shared beginning.'))
    if (kind === 'board') await page.waitForFunction(() => window.painted.join('').includes('In review'))
    await page.screenshot({ path: path.join(directory, kind + '-edited.png') })
    report.checks.push(kind + ' literal example mutates only the intended model; native history is assessed separately')
    await collapse()
  }
  await expand('sheet')
  await page.evaluate(() => {
    window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
      window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
    })
  })
  await shell.locator('[data-u-command="sheet.menu.print"]').click()
  await page.getByRole('menuitem', { name: 'Print', exact: true }).click()
  await shell.waitFor({ state: 'detached' })
  await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
  assert.deepEqual(await page.evaluate(() => window.printSource), {
    workbook: 'northstar-seed-budget',
    sheet: 'resources',
  })
  await page.getByText('Total: 1pages', { exact: true }).waitFor()
  await page.screenshot({ path: path.join(directory, 'resource-print.png') })
  await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
  await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
  report.checks.push(
    'Native resource-Sheet Print preview opens as one page and cancels without a backend; this does not certify whole-document PDF output',
  )
  const before = await snapshot()
  const anchorsBefore = await descriptors()
  assert.equal(await page.evaluate(examples[4]), true)
  await settle()
  const after = await snapshot()
  assert.ok(after.host.body.dataStream.includes('Start small. Share what we learn. Revised.'))
  for (const key of ['sheet', 'base', 'slide', 'board']) assert.deepEqual(after[key], before[key])
  for (const [i, d] of (await descriptors()).entries())
    assert.equal(d.context.startIndex, anchorsBefore[i].context.startIndex + 9)
  report.checks.push(
    'Literal host edit moves all four native body anchors by nine UTF-16 units without changing any edited child',
  )
  await expand('board')
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await page.locator('.northstar-project-embed').waitFor({ state: 'detached' })
  await settle()
  assert.equal(await page.locator('.northstar-project-embed').count(), 0)
  assert.deepEqual(report.errors, [])
  report.checks.push(
    'Selected active-Board disposal releases the owner without observed browser errors or backend requests',
  )
  assert.deepEqual(report.historyFailures, [], 'Every full-snapshot native history gate must pass')
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-4000),
      painted: window.painted?.slice(-150),
      blocks: [...document.querySelectorAll('[data-u-comp="embed-float-dom"]')].map((element) => ({
        id: element.dataset.embedId,
        stage: element.dataset.embedFloatStage,
        rect: element.getBoundingClientRect().toJSON(),
      })),
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected mixed native modern document')
