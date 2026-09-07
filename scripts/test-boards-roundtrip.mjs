/* eslint-disable no-await-in-loop -- Each action depends on the preceding saved snapshot. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/board-roundtrip')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/boards/create-save-and-restore-board`
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
page.setDefaultTimeout(45000)
const report = { passed: false, checks: [], errors: [], writes: [], documentationRequests: [] }
let reviewingDetails = false
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  if (!['GET', 'HEAD'].includes(request.method())) {
    // Keep documentation-shell requests separate; the demo/iframe must remain frontend-only.
    if (reviewingDetails && request.frame() === page.mainFrame())
      report.documentationRequests.push({
        url: request.url(),
        method: request.method(),
        nextAction: request.headers()['next-action'] ?? null,
      })
    else report.writes.push(request.url())
  }
})
await page.addInitScript(() => {
  window.boardPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    window.boardPaint.push(String(text))
    return fillText.call(this, text, ...args)
  }
})
const root = page.locator('.board-lifecycle')
const read = async () => JSON.parse(await root.locator('output').textContent())
const ready = () =>
  page.waitForFunction(
    () =>
      document.querySelector('.board-lifecycle')?.dataset.ready === 'true' &&
      document.querySelector('.board-lifecycle fieldset')?.disabled === false,
  )
const click = async (action, error = false) => {
  await root.locator(`[data-action=${action}]`).click()
  await ready()
  assert.equal(await root.locator('[role=alert]').isVisible(), error, await root.locator('[role=alert]').textContent())
  return read()
}
const rendered = (state) => {
  const active = state.snapshot.pages[state.snapshot.activePageId]
  for (const id of active.elementOrder) {
    const object = state.rendered[id]
    assert.ok(object, id + ': native render object exists')
    for (const key of ['left', 'top', 'width', 'height'])
      assert.ok(Math.abs(object[key] - active.elements[id].transform[key]) < 0.03, id + ': native ' + key)
  }
}
try {
  await page.goto(url, { waitUntil: 'load', timeout: 300000 })
  await root.locator('fieldset').waitFor({ state: 'attached', timeout: 90000 })
  await ready()
  const baseline = await read()
  rendered(baseline)
  assert.deepEqual(baseline.snapshot.pageOrder, ['plan', 'review'])
  assert.equal(baseline.snapshot.activePageId, 'plan')
  assert.equal(baseline.snapshot.defaultPageSize.width, 1920)
  assert.equal(baseline.snapshot.defaultPageSize.height, 1080)
  await page.waitForFunction(() => window.boardPaint.join('').includes('Tern'))
  const workbench = root.locator('[data-u-comp="workbench-layout"]')
  report.styles = await workbench.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    white: getComputedStyle(element).getPropertyValue('--univer-gray-0').trim(),
    flex: getComputedStyle(element.querySelector('.univer-flex')).display,
  }))
  assert.equal(report.styles.background, 'rgb(255, 255, 255)')
  assert.equal(report.styles.white.toUpperCase(), '#FFFFFF')
  assert.equal(report.styles.flex, 'flex')
  await root.screenshot({ path: path.join(directory, 'initial.png') })
  await root.locator('.board-lifecycle-controls > summary').click()
  assert.equal(await root.locator('[data-action=restore]').isDisabled(), true)
  assert.equal(await root.locator('[data-action=undo]').isDisabled(), true)
  const checkpoint = (await click('save')).checkpoint
  assert.deepEqual(checkpoint, baseline.snapshot)
  assert.equal(await root.locator('[data-action=save]').isDisabled(), true)
  const moved = await click('move')
  rendered(moved)
  assert.equal(
    moved.snapshot.pages.plan.elements.supplies.transform.left,
    baseline.snapshot.pages.plan.elements.supplies.transform.left + 120,
  )
  assert.equal(
    moved.snapshot.pages.plan.elements.supplies.transform.top,
    baseline.snapshot.pages.plan.elements.supplies.transform.top + 60,
  )
  assert.deepEqual(moved.snapshot.pages.review, baseline.snapshot.pages.review, 'Inactive page untouched')
  assert.deepEqual((await click('undo')).snapshot, baseline.snapshot)
  assert.deepEqual((await click('redo')).snapshot, moved.snapshot)
  await root.locator('[data-input=title]').fill('Tern / all crews cleared')
  const titled = await click('title')
  assert.equal(titled.snapshot.pages.plan.elements.title.text, 'Tern / all crews cleared')
  assert.equal(await root.locator('[data-action=title]').isDisabled(), true)
  await root.locator('[data-input=title]').fill('   ')
  assert.deepEqual((await click('title', true)).snapshot, titled.snapshot)
  const restored = await click('restore')
  assert.deepEqual(restored.snapshot, checkpoint, 'Restore every serialized field')
  assert.equal(await root.locator('[data-action=restore]').isDisabled(), true)
  assert.equal(await root.locator('[data-action=undo]').isDisabled(), true)
  report.checks.push('Full checkpoint restore, actual move and heading Facades, native history and no-op button states')

  await click('focus')
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(
    (left) =>
      JSON.parse(document.querySelector('.board-lifecycle output').textContent).snapshot.pages.plan.elements.supplies
        .transform.left !== left,
    baseline.snapshot.pages.plan.elements.supplies.transform.left,
  )
  const native = await read()
  rendered(native)
  assert.notDeepEqual(
    native.snapshot.pages.plan.elements.supplies.transform,
    baseline.snapshot.pages.plan.elements.supplies.transform,
  )
  const canvas = await root.locator('.board-lifecycle-editor canvas').first().boundingBox()
  const box = native.snapshot.pages.plan.elements.supplies.transform
  const zoom = native.viewport.zoomRatio,
    pan = native.viewport.panOffset
  const x = canvas.x + pan.x + (box.left + box.width / 2) * zoom
  const y = canvas.y + pan.y + (box.top + box.height / 2) * zoom
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 64 * zoom, y + 38 * zoom, { steps: 6 })
  await page.mouse.up()
  await page.waitForFunction(
    (left) =>
      JSON.parse(document.querySelector('.board-lifecycle output').textContent).snapshot.pages.plan.elements.supplies
        .transform.left !== left,
    box.left,
  )
  const dragged = await read()
  rendered(dragged)
  assert.notDeepEqual(
    dragged.snapshot.pages.plan.elements.supplies.transform,
    box,
    'Native pointer drag changes the actual Board',
  )
  const nativeCheckpoint = (await click('save')).checkpoint
  await click('move')
  assert.deepEqual((await click('restore')).snapshot, nativeCheckpoint, 'Native edits survive checkpoint recreation')
  assert.deepEqual((await click('reload')).snapshot, nativeCheckpoint)
  assert.equal(await root.locator('[data-action=undo]').isDisabled(), true)
  const downloadEvent = page.waitForEvent('download')
  await click('download')
  const download = await downloadEvent
  assert.equal(download.suggestedFilename(), 'tern-station.board.json')
  assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), nativeCheckpoint)
  assert.deepEqual((await click('invalid', true)).snapshot, nativeCheckpoint)
  report.checks.push(
    'Native keyboard and pointer movement, exact downloaded JSON, reload without history, missing-target preservation',
  )

  await root.locator('[data-input=move]').selectOption('left')
  const left = await click('move')
  assert.equal(
    left.snapshot.pages.plan.elements.supplies.transform.left,
    nativeCheckpoint.pages.plan.elements.supplies.transform.left - 120,
  )
  for (const state of ['boundary', 'empty', 'error', 'default']) {
    await root.locator('[data-input=state]').selectOption(state)
    const loaded = await click('load', state === 'error')
    rendered(loaded)
    assert.equal(loaded.checkpoint, null)
    assert.equal(await root.locator('[data-action=undo]').isDisabled(), true)
    if (state === 'boundary') {
      assert.deepEqual(loaded.snapshot.pageOrder, ['review', 'plan'])
      assert.equal(loaded.snapshot.activePageId, 'review')
      assert.deepEqual(loaded.snapshot.pages.review.elementOrder, ['follow-up', 'handover', 'review-title'])
      assert.equal(loaded.snapshot.pages.review.elements.handover.transform.rotation, 12)
      assert.equal(loaded.snapshot.pages.review.elements.handover.transform.left, -120)
    }
    if (state === 'empty') {
      assert.deepEqual(loaded.snapshot.pages.plan.elements, {})
      for (const action of ['move', 'focus', 'title', 'fit'])
        assert.equal(await root.locator(`[data-action=${action}]`).isDisabled(), true)
    }
    assert.deepEqual((await click('reload')).snapshot, loaded.snapshot, state + ': every JSON field after reload')
    await root.locator('.board-lifecycle-controls > summary').click()
    await root.screenshot({ path: path.join(directory, state + '.png') })
    await root.locator('.board-lifecycle-controls > summary').click()
  }
  assert.deepEqual((await click('reset')).snapshot, baseline.snapshot)
  await click('fit')
  report.checks.push(
    'Four states, multi-page order/active-page/layer/rotation boundaries, exact Reset and empty-state controls',
  )
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await root.locator('[data-action=move]').focus()
    await page.keyboard.press('Enter')
    await ready()
    const geometry = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      canvas: document.querySelector('.board-lifecycle-editor').getBoundingClientRect().toJSON(),
    }))
    assert.ok(geometry.scroll <= width + 1, 'No horizontal page overflow at ' + width)
    assert.ok(geometry.canvas.width > 250 && geometry.canvas.height >= 320)
    await click('fit')
    await root.locator('.board-lifecycle-controls > summary').click()
    await root.screenshot({ path: path.join(directory, 'width-' + width + '.png') })
    await root.locator('.board-lifecycle-controls > summary').click()
  }
  report.checks.push(
    'Keyboard action and usable native canvas at 760/390/320 px (not full accessibility certification)',
  )
  if (process.env.SHOWCASE_DETAILS === '1') {
    reviewingDetails = true
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const [locale, title, labels] of [
      ['en-US', 'Create, Save, and Restore a Board', ['Variants', 'Actions', 'States']],
      ['zh-CN', '创建、保存与恢复白板', ['变体', '操作', '状态']],
    ]) {
      const response = await page.goto(
        `${new URL(url).origin}/${locale}/showcase/boards/create-save-and-restore-board`,
        { waitUntil: 'load', timeout: 180000 },
      )
      assert.equal(response.status(), 200)
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of labels) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      const aside = page.locator('aside')
      assert.equal(await aside.getByRole('button', { expanded: true }).count(), 3)
      assert.equal(await aside.getByRole('link', { name: title, exact: true }).count(), 1)
      const productName = await aside.getByRole('button', { expanded: true }).first().innerText()
      const product = aside.getByRole('button', { name: productName, exact: true })
      await product.click()
      await page.waitForFunction(() =>
        [...document.querySelectorAll('aside button')].some(
          (element) => element.getAttribute('aria-expanded') === 'false',
        ),
      )
      await product.click()
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first().locator('.board-lifecycle')
      const idle = () => embedded.locator('fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
      await idle()
      await embedded.locator('.board-lifecycle-controls > summary').click()
      await embedded.locator('[data-action=save]').click()
      await idle()
      const saved = JSON.parse(await embedded.locator('output').textContent()).checkpoint
      await embedded.locator('[data-action=move]').click()
      await idle()
      await embedded.locator('[data-action=restore]').click()
      await idle()
      assert.deepEqual(JSON.parse(await embedded.locator('output').textContent()).snapshot, saved)
      await embedded.locator('.board-lifecycle-controls > summary').click()
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push(
      'English/Chinese 4 variants, 9 action groups, 4 states; interactive four-level tree and real iframe checkpoint restore',
    )
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.writes, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
assert.ok(report.passed, 'Board round trip must pass without browser errors')
