/* eslint-disable no-await-in-loop -- Follow ordered option mutations, native history and explicit fixtures. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-options')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/bases/select-options`
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
const report = { passed: false, errors: [], defects: [], checks: [], writes: [], documentationRequests: [] }
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(45000)
let details = false
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  if (!['GET', 'HEAD'].includes(request.method())) {
    if (details && request.frame() === page.mainFrame()) report.documentationRequests.push(request.url())
    else report.writes.push(request.url())
  }
})
await page.addInitScript(() => {
  window.optionPaint = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const point = this.getTransform().transformPoint({ x: args[1], y: args[2] }),
      rect = this.canvas.getBoundingClientRect()
    window.optionPaint.push({
      text: String(args[0]),
      x: rect.x + (point.x * rect.width) / this.canvas.width,
      y: rect.y + (point.y * rect.height) / this.canvas.height,
    })
    if (window.optionPaint.length > 20000) window.optionPaint.splice(0, 10000)
    return Reflect.apply(original, this, args)
  }
})
const root = page.locator('.base-options')
const read = async () => JSON.parse(await root.locator('output').textContent())
const idle = () =>
  page.waitForFunction(
    () =>
      document.querySelector('.base-options')?.dataset.ready === 'true' &&
      document.querySelector('.base-options fieldset')?.disabled === false,
  )
const input = (name) => root.locator(`[data-input="${name}"]`)
const click = async (name, error = false) => {
  await root.locator(`[data-action="${name}"]`).click()
  await idle()
  assert.equal(await root.locator('[role=alert]').isVisible(), error, await root.locator('[role=alert]').textContent())
  return read()
}
const choose = async (name, value) => {
  await input(name).selectOption(value)
  await idle()
}
const expectPaint = (text) =>
  page.waitForFunction((expected) => window.optionPaint.some((item) => item.text === expected), text)
const value = (state) => state.audit.rows.find((row) => row.id === state.recordId)?.value
const clearPaint = () =>
  page.evaluate(() => {
    window.optionPaint = []
  })
const chipPixels = async (label) => {
  await expectPaint(label)
  return page.evaluate((text) => {
    const point = window.optionPaint.find((item) => item.text === text)
    const canvas = document.querySelector('.base-options-editor canvas'),
      rect = canvas.getBoundingClientRect()
    const x = Math.round(((point.x - rect.x - 4) * canvas.width) / rect.width),
      y = Math.round(((point.y - rect.y - 14) * canvas.height) / rect.height)
    return [...canvas.getContext('2d').getImageData(x, y, 45, 22).data]
  }, label)
}
try {
  await page.goto(url, { waitUntil: 'load', timeout: 300000 })
  await idle()
  const initial = await read()
  assert.equal(initial.audit.rows.length, 30)
  assert.equal(Object.keys(initial.snapshot.tables.sites.records).length, 12)
  assert.equal(Object.keys(initial.snapshot.tables.samples.records).length, 18)
  assert.equal(initial.audit.orphanReferences, 0)
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  )
  await expectPaint('Map Lantern Cove rock pools')
  await root.locator('.base-options-controls > summary').click()
  await clearPaint()
  const renamed = await click('rename')
  assert.equal(renamed.options.find((item) => item.id === 'high').name, 'Critical')
  assert.deepEqual(renamed.snapshot.tables.surveys.records, initial.snapshot.tables.surveys.records)
  assert.equal(await root.locator('[data-action=rename]').isDisabled(), true)
  await expectPaint('Critical')
  const oldPixels = await chipPixels('Critical')
  await input('color').fill('#db2777')
  await clearPaint()
  const colored = await click('color')
  assert.equal(colored.options.find((item) => item.id === 'high').color, '#db2777')
  assert.notDeepEqual(await chipPixels('Critical'), oldPixels, 'Native option chip pixels change, not just config text')
  assert.deepEqual(colored.snapshot.tables.surveys.records, initial.snapshot.tables.surveys.records)
  const later = await click('down')
  assert.deepEqual(
    later.options.map((item) => item.id),
    ['normal', 'high', 'low', 'seasonal'],
  )
  assert.deepEqual((await click('up')).snapshot, colored.snapshot)
  assert.equal(await root.locator('[data-action=up]').isDisabled(), true)
  const added = await click('add')
  assert.equal(added.optionId, 'weather')
  assert.equal(await root.locator('[data-action=add]').isDisabled(), true)
  assert.equal(await root.locator('[data-action=down]').isDisabled(), true)
  assert.equal(await root.locator('[data-action=delete]').isDisabled(), true)
  await input('confirm').check()
  assert.deepEqual((await click('delete')).snapshot, colored.snapshot)
  await choose('option', 'seasonal')
  await input('confirm').check()
  const unused = await click('delete')
  assert.equal(unused.audit.orphanReferences, 0)
  assert.deepEqual(unused.snapshot.tables.surveys.records, initial.snapshot.tables.surveys.records)
  assert.deepEqual((await click('undo')).snapshot, colored.snapshot)
  assert.deepEqual((await click('redo')).snapshot, unused.snapshot)
  await choose('option', 'normal')
  await input('confirm').check()
  const beforeUsed = await read(),
    deleted = await click('delete', true)
  assert.ok(deleted.audit.orphanReferences > 0)
  assert.deepEqual(deleted.audit.unknownDefaultIds, ['normal'])
  assert.deepEqual(deleted.snapshot.tables.surveys.records, beforeUsed.snapshot.tables.surveys.records)
  report.defects.push('Used single-select option deletion leaves record IDs and the field default dangling')
  assert.deepEqual((await click('undo')).snapshot, beforeUsed.snapshot)
  assert.deepEqual((await click('redo')).snapshot, deleted.snapshot)
  await click('undo')
  report.checks.push(
    'Stable-ID rename, native label/color paint, earlier/later config ordering, unused deletion and full native option history',
  )

  await choose('choices', ['high', 'normal'])
  const beforeInvalid = await read()
  assert.deepEqual(
    (await click('write', true)).snapshot,
    beforeInvalid.snapshot,
    'Host cardinality validation makes no SDK write',
  )
  await choose('record', 'surveys-02')
  await choose('choices', ['high'])
  assert.equal(value(await click('write')), 'high')
  await choose('write', 'clear')
  assert.equal(value(await click('write')), null)
  const beforeUnknown = await read(),
    unknown = await click('invalid', true)
  assert.equal(value(unknown), 'retired-option-probe')
  assert.equal(await root.locator('[data-action=invalid]').isDisabled(), true)
  report.defects.push('Raw single-select writes accept unknown option IDs')
  assert.deepEqual((await click('undo')).snapshot, beforeUnknown.snapshot)
  await click('reset')
  await choose('field', 'habitats')
  await choose('record', 'surveys-01')
  await choose('write', 'replace')
  await choose('choices', ['dunes', 'birds'])
  assert.deepEqual(value(await click('write')), ['dunes', 'birds'])
  await choose('option', 'rockpool')
  await choose('write', 'add')
  assert.deepEqual(value(await click('write')), ['dunes', 'birds', 'rockpool'])
  assert.equal(await root.locator('[data-action=write]').isDisabled(), true)
  await choose('write', 'remove')
  assert.deepEqual(value(await click('write')), ['dunes', 'birds'])
  await choose('write', 'clear')
  assert.deepEqual(value(await click('write')), [])
  const beforeMultiUnknown = await read(),
    unknownMulti = await click('invalid', true)
  assert.deepEqual(value(unknownMulti), ['retired-option-probe'])
  report.defects.push('Raw multi-select writes accept unknown option IDs')
  assert.deepEqual((await click('undo')).snapshot, beforeMultiUnknown.snapshot)
  await choose('option', 'rockpool')
  await input('confirm').check()
  const beforeMultiDelete = await read(),
    deletedMulti = await click('delete', true)
  assert.ok(deletedMulti.audit.orphanReferences > 0)
  assert.deepEqual(deletedMulti.audit.unknownDefaultIds, ['rockpool'])
  report.defects.push('Used multi-select option deletion leaves record arrays and the default dangling')
  assert.deepEqual((await click('undo')).snapshot, beforeMultiDelete.snapshot)
  const beforeReload = await read()
  assert.deepEqual((await click('reload')).snapshot, beforeReload.snapshot)
  const pending = page.waitForEvent('download')
  await click('download')
  const download = await pending
  assert.equal(download.suggestedFilename(), 'sable-option-lab.base.json')
  await download.saveAs(path.join(directory, 'downloaded.base.json'))
  assert.deepEqual(
    JSON.parse(await fs.readFile(path.join(directory, 'downloaded.base.json'), 'utf8')),
    beforeReload.snapshot,
  )
  assert.deepEqual((await click('reset')).snapshot, initial.snapshot)
  await fs.writeFile(
    path.join(directory, 'option-integrity.json'),
    JSON.stringify({ beforeUsed, deleted, unknown, unknownMulti, beforeMultiDelete, deletedMulti }, null, 2),
  )
  report.checks.push(
    'Single/multi replacement, append/remove/clear, host cardinality checks, actual unknown/default integrity readbacks and exact reload/download/Reset',
  )

  await root.locator('.base-options-controls > summary').click()
  await clearPaint()
  await page.setViewportSize({ width: 1598, height: 1100 })
  await expectPaint('Map Lantern Cove rock pools')
  const nativePoint = async (label) =>
    page.evaluate((text) => {
      const title = window.optionPaint.findLast((item) => item.text === 'Map Lantern Cove rock pools')
      return window.optionPaint.findLast((item) => item.text === text && Math.abs(item.y - title.y) < 5)
    }, label)
  const priorityPoint = await nativePoint('High')
  assert.ok(priorityPoint)
  await page.mouse.dblclick(priorityPoint.x + 10, priorityPoint.y - 4)
  await page.getByText('Normal', { exact: true }).last().click()
  await page.waitForFunction(
    () =>
      JSON.parse(document.querySelector('.base-options output').textContent).snapshot.tables.surveys.records[
        'surveys-01'
      ].values.priority === 'normal',
  )
  await page.keyboard.press('Escape')
  await root.locator('.base-options-controls > summary').click()
  const nativeSingle = await read()
  assert.deepEqual((await click('undo')).snapshot, initial.snapshot)
  assert.deepEqual((await click('redo')).snapshot, nativeSingle.snapshot)
  await choose('field', 'habitats')
  await root.locator('.base-options-controls > summary').click()
  await clearPaint()
  await page.setViewportSize({ width: 1596, height: 1100 })
  await expectPaint('Map Lantern Cove rock pools')
  const habitatsPoint = await nativePoint('Rock pools')
  assert.ok(habitatsPoint)
  await page.mouse.dblclick(habitatsPoint.x + 10, habitatsPoint.y - 4)
  await page.getByText('Shorebirds', { exact: true }).last().click()
  await page.waitForFunction(() =>
    JSON.parse(document.querySelector('.base-options output').textContent).snapshot.tables.surveys.records[
      'surveys-01'
    ].values.habitats.includes('birds'),
  )
  await page.keyboard.press('Escape')
  await root.locator('.base-options-controls > summary').click()
  const nativeMulti = await read()
  assert.deepEqual(nativeMulti.snapshot.tables.surveys.records['surveys-01'].values.habitats, [
    'rockpool',
    'eelgrass',
    'birds',
  ])
  assert.deepEqual((await click('undo')).snapshot, nativeSingle.snapshot)
  assert.deepEqual((await click('redo')).snapshot, nativeMulti.snapshot)
  assert.deepEqual((await click('reload')).snapshot, nativeMulti.snapshot)
  assert.deepEqual((await click('reset')).snapshot, initial.snapshot)
  await page.setViewportSize({ width: 1600, height: 1100 })
  report.checks.push(
    'Actual native single/multi pickers store stable IDs; complete native Undo/Redo and reload preserve choices',
  )

  for (const state of ['empty', 'boundary', 'error', 'default']) {
    await choose('state', state)
    const loaded = await click('load')
    assert.equal(loaded.audit.rows.length, state === 'empty' ? 0 : 30)
    if (state === 'empty') {
      assert.equal(await root.locator('[data-action=write]').isDisabled(), true)
      assert.equal(await root.locator('[data-action=invalid]').isDisabled(), true)
      await click('add')
    }
    if (state === 'boundary')
      assert.deepEqual(loaded.snapshot.tables.surveys.records['surveys-01'].values.habitats, [
        'rockpool',
        'eelgrass',
        'dunes',
        'birds',
      ])
    if (state === 'error') {
      assert.equal(loaded.audit.orphanReferences, 1)
      await choose('field', 'habitats')
      assert.equal((await read()).audit.orphanReferences, 1)
    }
    assert.deepEqual((await click('load')).snapshot, loaded.snapshot)
  }
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await root.locator('[data-action=add]').focus()
    await page.keyboard.press('Enter')
    await idle()
    assert.ok((await read()).options.some((item) => item.id === 'weather'))
    await input('confirm').check()
    await root.locator('[data-action=delete]').focus()
    await page.keyboard.press('Enter')
    await idle()
    assert.deepEqual((await click('reset')).snapshot, initial.snapshot)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  }
  await page.setViewportSize({ width: 1600, height: 1100 })
  await root.locator('.base-options-controls > summary').click()
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    )
  })
  await root.screenshot({ path: path.join(directory, 'native-options.png') })
  report.checks.push(
    'Four repeatable fixtures, empty-target disabling, orphan audits and host keyboard actions at 760/390/320px',
  )
  if (process.env.SHOWCASE_DETAILS === '1') {
    details = true
    for (const [locale, title, headings] of [
      ['en-US', 'Select and Multi-select Options', ['Variants', 'Actions', 'States']],
      ['zh-CN', '单选与多选选项', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/bases/select-options`, {
        waitUntil: 'load',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const frame = page.frameLocator('iframe').first()
      await frame.locator('.base-options[data-ready=true]').waitFor()
      await frame.locator('.base-options-controls > summary').click()
      await frame.locator('[data-action=rename]').click()
      await frame.locator('[data-action=rename]:disabled').waitFor()
      assert.equal(JSON.parse(await frame.locator('output').textContent()).options[0].name, 'Critical')
    }
    report.checks.push('EN/ZH card-free detail pages; real iframe rename works')
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.writes, [])
  report.status = report.defects.length ? 'known-sdk-defects-observed' : 'passed'
  report.passed = observe || report.defects.length === 0
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png') })
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
assert.ok(
  report.passed,
  'Strict option acceptance requires deletion cleanup and unknown-ID rejection, in addition to all UI checks',
)
