/* eslint-disable no-await-in-loop -- Exercise literal examples and their dependent states in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const dir = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/record-lifecycle-native')
await fs.mkdir(dir, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/bases/record-lifecycle/code/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 20)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1050 }, acceptDownloads: true })
page.setDefaultTimeout(12000)
const report = { passed: false, checks: [], gates: {}, errors: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['xhr', 'fetch'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.recordPaint = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const point = this.getTransform().transformPoint({ x: args[1], y: args[2] }),
      rect = this.canvas.getBoundingClientRect()
    window.recordPaint.push({
      text: String(args[0]),
      x: rect.x + (point.x * rect.width) / this.canvas.width,
      y: rect.y + (point.y * rect.height) / this.canvas.height,
    })
    if (window.recordPaint.length > 10000) window.recordPaint.splice(0, 5000)
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.base-records')
const run = (i) => page.evaluate('(async () => {\n' + examples[i - 1] + '\n})()')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('harbour-record-lifecycle').save())))
const rows = (d) => d.tables.tasks.records
const ids = () =>
  page.evaluate(() => ({ single: window.harbourSingle, batch: window.harbourBatch, copy: window.harbourCopy }))
function includesPack(actual, pack, prefix = '') {
  for (const [key, value] of Object.entries(pack)) {
    if (value && typeof value === 'object') includesPack(actual?.[key], value, prefix + key + '.')
    else assert.deepEqual(actual?.[key], value, prefix + key)
  }
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(dir, name + '-failure.png') }).catch(() => {})
  }
}
try {
  await page.goto(
    process.env.SHOWCASE_DEMO_URL ||
      process.env.SHOWCASE_ORIGIN ||
      (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/bases/record-lifecycle',
    { waitUntil: 'domcontentloaded' },
  )
  await root.locator(':scope[data-ready=true]').waitFor()
  assert.equal(await root.locator('fieldset,details,output,[data-action],.base-records-controls').count(), 0)
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  const initial = await snapshot()
  assert.deepEqual(
    initial.tableOrder.map((id) => Object.keys(initial.tables[id].records).length),
    [30, 12, 18],
  )
  await page.waitForFunction(() => window.recordPaint.some((p) => p.text.includes('Test lantern suspension')))
  await page.screenshot({ path: path.join(dir, 'baseline.png') })
  await run(1)
  await run(2)
  const single = (await ids()).single
  assert.ok(single && !rows(initial)[single])
  assert.equal(rows(await snapshot())[single].values.hours, 1.5)
  const beforeBatch = await snapshot()
  await run(3)
  const batch = (await ids()).batch,
    inserted = await snapshot()
  assert.equal(new Set(batch).size, 3)
  assert.equal(Object.keys(rows(inserted)).length, 34)
  assert.deepEqual(inserted.tables.tasks.recordOrder.slice(0, 3), batch)
  await run(4)
  const undone = await snapshot()
  await fs.writeFile(
    path.join(dir, 'native-resource-history.json'),
    JSON.stringify({ beforeBatch, inserted, undone }, null, 2),
  )
  assert.equal(Object.keys(rows(undone)).length, 31)
  await gate('full-resource-insertion-undo', async () => {
    assert.deepEqual(undone, beforeBatch)
  })
  await run(5)
  assert.deepEqual(await snapshot(), inserted)
  await run(6)
  assert.deepEqual(rows(await snapshot())[single].values, {
    ...rows(inserted)[single].values,
    status: 'review',
    hours: 6.5,
  })
  await run(7)
  let current = await snapshot()
  assert.deepEqual(
    batch.map((id) => [rows(current)[id].values.status, rows(current)[id].values.hours]),
    [
      ['active', 1],
      ['review', 2],
      ['done', 3],
    ],
  )
  await run(8)
  assert.equal((await snapshot()).tables.tasks.recordOrder[0], single)
  await run(9)
  const copy = (await ids()).copy
  assert.notEqual(copy, single)
  assert.equal(rows(await snapshot())[copy].values.title, 'Lantern fallback checklist')
  await run(10)
  current = await snapshot()
  assert.equal(rows(current)['tasks-01'].values.title, rows(current)['tasks-02'].values.title)
  assert.equal(rows(current)['tasks-01'].values.hours, -0.5)
  assert.equal(rows(current)['tasks-02'].values.hours, 99999.5)
  await run(11)
  assert.equal(rows(await snapshot())['tasks-01'].values.hours, 0)
  await run(12)
  assert.equal(rows(await snapshot())['tasks-01'].values.hours, null)
  current = await snapshot()
  await assert.rejects(() => run(13), /exceeds range/)
  assert.deepEqual(await snapshot(), current)
  await run(14)
  assert.equal(rows(await snapshot())[copy], undefined)
  await run(15)
  for (const id of batch) assert.equal(rows(await snapshot())[id], undefined)
  await run(16)
  current = await snapshot()
  assert.equal(Object.keys(rows(current)).length, 0)
  assert.deepEqual(current.tables.projects, initial.tables.projects)
  assert.deepEqual(current.tables.milestones, initial.tables.milestones)
  await run(17)
  assert.deepEqual(await snapshot(), initial)
  await run(18)
  assert.deepEqual(await page.evaluate(() => window.harbourSaved), initial)
  await run(19)
  assert.deepEqual(await snapshot(), initial)
  const downloaded = page.waitForEvent('download')
  await run(20)
  const download = await downloaded
  const downloadedPath = path.join(dir, download.suggestedFilename())
  await download.saveAs(downloadedPath)
  assert.deepEqual(JSON.parse(await fs.readFile(downloadedPath)), initial)
  report.checks.push({
    literalExamples: 20,
    realUndoRedo: true,
    checkpointAndReloadExact: true,
    downloadedSnapshotExact: true,
  })

  await gate('reconstructed-native-view', async () => {
    await page.waitForFunction(() => document.querySelector('[data-u-comp="base-footer"]')?.textContent.includes('30'))
  })
  // Recreate a fresh browser owner so a failed snapshot-view gate cannot obscure native editing.
  await page.reload({ waitUntil: 'domcontentloaded' })
  await root.locator(':scope[data-ready=true]').waitFor()
  await gate('native-sidebar-and-record-entry', async () => {
    for (const [title, id] of [
      ['Festival installations', 'projects'],
      ['Opening checkpoints', 'milestones'],
      ['Production checklist', 'tasks'],
    ]) {
      await page.getByText(title, { exact: true }).click()
      assert.equal(await page.evaluate(() => window.univerAPI.getBaseUI().getActiveTableId()), id)
    }
    await page.getByRole('button', { name: 'Add Record', exact: true }).click()
    await page.getByRole('textbox', { name: 'Work item', exact: true }).fill('Lantern visitor route / native intake')
    await page.getByRole('textbox', { name: 'Work item', exact: true }).press('Tab')
    await page.getByRole('button', { name: 'Submit', exact: true }).click()
    await page.waitForFunction(
      () => window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRecords().length === 31,
    )
  })
  await gate('native-cell-edit-and-history', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await root.locator(':scope[data-ready=true]').waitFor()
    await settle()
    await page.waitForFunction(() => window.recordPaint.some((p) => p.text === 'Test lantern suspension'))
    const point = await page.evaluate(() => window.recordPaint.findLast((p) => p.text === 'Test lantern suspension'))
    await page.mouse.dblclick(point.x + 25, point.y - 5)
    await page.keyboard.press('Control+a')
    await page.keyboard.type('Lantern suspension / native review')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('harbour-record-lifecycle')
          .getTableById('tasks')
          .getRecordById('tasks-01')
          .getValue('title') === 'Lantern suspension / native review',
    )
    const typed = await snapshot()
    await page.getByRole('button', { name: 'Undo', exact: true }).click()
    assert.deepEqual(await snapshot(), initial)
    await page.getByRole('button', { name: 'Redo', exact: true }).click()
    assert.deepEqual(await snapshot(), typed)
    await page.screenshot({ path: path.join(dir, 'native-edited.png') })
  })
  await gate('complete-english-packs-and-theme-owner', async () => {
    const factory = await fs.readFile('showcase/bases/record-lifecycle/code/create-demo.ts', 'utf8')
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 5)
    await page.evaluate(() => {
      window.recordOwner = window.univerAPI
    })
    const before = await snapshot()
    for (const locale of ['en-US']) {
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
      }
      assert.equal(await page.evaluate(() => window.recordOwner === window.univerAPI), true)
      assert.deepEqual(await snapshot(), before)
      await page.screenshot({ path: path.join(dir, locale + '-native.png') })
      report.checks.push({ locale, completePacks: 5, sameOwnerAndSnapshot: true })
    }
  })
  await gate('native-disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
  await page.screenshot({ path: path.join(dir, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
