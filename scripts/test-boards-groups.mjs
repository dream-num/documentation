/* eslint-disable no-await-in-loop -- Layer variants mutate one shared Board and must be checked sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const mediaIds = ['photo', 'caption', 'credit']
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/boards-groups')
const url =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/boards/group-lock-z-order`
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch({ executablePath: chromium.executablePath() })
const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } })
await page.emulateMedia({ colorScheme: 'light' })
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})

const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < 0.02, `${label}: ${actual} != ${expected}`)
const byId = (state, id) => state.elements.find((element) => element.id === id)
const bounds = (state, id) => byId(state, id).bounds
const expectBounds = (actual, expected, label) => {
  for (const key of ['left', 'top', 'width', 'height']) close(actual[key], expected[key], `${label} ${key}`)
}
const movedOrder = (order, id, placement) => {
  const next = order.filter((item) => item !== id)
  const index = order.indexOf(id)
  const target =
    placement === 'front'
      ? next.length
      : placement === 'back'
        ? 0
        : placement === 'forward'
          ? Math.min(index + 1, next.length)
          : Math.max(index - 1, 0)
  next.splice(target, 0, id)
  return next
}

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  await page.locator('.group-layer-demo[data-ready="true"]').waitFor({ timeout: 90000 })
  const demo = page.locator('.group-layer-demo')
  const controls = demo.locator('fieldset')
  const alert = demo.locator('[role="alert"]')
  const model = async () => JSON.parse(await demo.locator('output').textContent())
  const idle = () =>
    page.waitForFunction(() => document.querySelector('.group-layer-demo fieldset')?.disabled === false)
  const click = async (name, expectedError = false) => {
    await controls.getByRole('button', { name, exact: true }).click()
    await idle()
    assert.equal(await alert.isVisible(), expectedError, await alert.textContent())
    if (expectedError) {
      await controls.getByRole('button', { name: 'Inspect', exact: true }).click()
      await idle()
      assert.equal(await alert.isVisible(), false)
    }
    return model()
  }
  const capture = (name) => demo.screenshot({ path: path.join(directory, `${name}.png`) })
  const assertRendered = (state) => {
    for (const [id, actual] of Object.entries(state.rendered)) {
      assert.ok(actual, `${id}: render object must exist`)
      expectBounds(actual, bounds(state, id), `${id}: rendered/model parity`)
    }
  }

  const baseline = await model()
  assert.equal(baseline.elements.filter((element) => element.type === 'shape').length, 8)
  assert.equal(baseline.elements.filter((element) => element.type === 'connector').length, 12)
  assert.equal(baseline.elements.filter((element) => element.type === 'container').length, 0)
  assert.equal(baseline.elements.filter((element) => element.type === 'connector' && !element.endElementId).length, 1)
  assert.deepEqual(baseline.hierarchy.captionParentChain, [])
  assertRendered(baseline)
  await capture('baseline')

  const layerSelect = controls.getByRole('combobox', { name: 'Layer action' })
  for (const placement of ['front', 'forward', 'backward', 'back']) {
    await click('Reset')
    await layerSelect.selectOption(placement)
    const changed = await click('Apply layer action')
    assert.deepEqual(changed.order, movedOrder(baseline.order, 'priority', placement), `${placement}: exact order`)
    assertRendered(changed)
    if (placement === 'front' || placement === 'back') await capture(`layer-${placement}`)
    await click('Undo')
    assert.deepEqual((await model()).order, baseline.order, `${placement}: Undo`)
    await click('Redo')
    assert.deepEqual((await model()).order, changed.order, `${placement}: Redo`)
  }

  await click('Reset')
  const grouped = await click('Group media')
  const mediaGroupId = grouped.hierarchy.mediaGroupId
  assert.ok(mediaGroupId)
  assert.deepEqual(grouped.hierarchy.mediaChildren, mediaIds)
  assert.deepEqual(grouped.hierarchy.captionParentChain, [mediaGroupId])
  assert.equal(byId(grouped, mediaGroupId).type, 'container')
  assert.equal(byId(grouped, mediaGroupId).text, 'Media package')
  for (const id of mediaIds) {
    expectBounds(bounds(grouped, id), bounds(baseline, id), `${id}: grouping preserves world bounds`)
    assert.notDeepEqual(
      byId(grouped, id).transform,
      byId(baseline, id).transform,
      `${id}: local transform becomes relative`,
    )
  }
  assertRendered(grouped)
  await capture('grouped')
  const groupingUndone = await click('Undo')
  assert.equal(groupingUndone.hierarchy.mediaGroupId, null, 'Undo must clear the inspector group ID')
  assert.deepEqual(groupingUndone.hierarchy.mediaChildren, [])
  const groupingRedone = await click('Redo')
  assert.deepEqual(groupingRedone.hierarchy, grouped.hierarchy, 'Redo restores the SDK hierarchy')
  assert.deepEqual((await click('Group media')).elements, groupingRedone.elements, 'Grouping is idempotent after Redo')
  await demo.locator('.group-layer-editor').focus()
  await page.keyboard.press('Control+z')
  assert.equal((await click('Inspect')).hierarchy.mediaGroupId, null, 'Native Undo also clears the derived group ID')
  await demo.locator('.group-layer-editor').focus()
  await page.keyboard.press('Control+Shift+z')
  assert.deepEqual((await click('Inspect')).hierarchy, grouped.hierarchy, 'Native Redo restores the derived hierarchy')

  const locked = await click('Lock media cards')
  for (const id of mediaIds) assert.equal(byId(locked, id).locked, true, `${id}: locked`)
  const afterRejectedMove = await click('Try moving locked Caption', true)
  assert.deepEqual(afterRejectedMove.order, locked.order)
  for (const id of mediaIds) expectBounds(bounds(afterRejectedMove, id), bounds(locked, id), `${id}: blocked move`)
  const moved = await click('Unlock and move group')
  for (const id of mediaIds) {
    assert.equal(byId(moved, id).locked, false, `${id}: unlocked`)
    close(bounds(moved, id).left, bounds(grouped, id).left + 80, `${id}: group dx`)
    close(bounds(moved, id).top, bounds(grouped, id).top + 40, `${id}: group dy`)
    assert.deepEqual(byId(moved, id).transform, byId(grouped, id).transform, `${id}: local transform preserved`)
  }
  assertRendered(moved)
  await capture('unlocked-and-moved')
  const moveUndone = await click('Undo')
  for (const id of mediaIds) {
    expectBounds(bounds(moveUndone, id), bounds(grouped, id), `${id}: move Undo`)
    assert.equal(byId(moveUndone, id).locked, false, `${id}: unlock is a separate command`)
  }
  const unlockUndone = await click('Undo')
  for (const id of mediaIds) assert.equal(byId(unlockUndone, id).locked, true, `${id}: unlock Undo`)
  await click('Redo')
  const moveRedone = await click('Redo')
  for (const id of mediaIds) expectBounds(bounds(moveRedone, id), bounds(moved, id), `${id}: move Redo`)

  await click('Reset')
  await click('Group media')
  const nested = await click('Nest group + priority')
  const nestedMediaId = nested.hierarchy.mediaGroupId
  const campaignGroupId = nested.hierarchy.campaignGroupId
  assert.ok(nestedMediaId && campaignGroupId)
  assert.equal(byId(nested, nestedMediaId).text, 'Media package')
  assert.equal(byId(nested, campaignGroupId).text, 'Campaign package')
  assert.deepEqual(nested.hierarchy.mediaChildren, mediaIds)
  assert.deepEqual(nested.hierarchy.campaignChildren, [nestedMediaId, 'priority'])
  assert.deepEqual(nested.hierarchy.campaignDescendants, [nestedMediaId, ...mediaIds, 'priority'])
  assert.deepEqual(nested.hierarchy.captionParentChain, [nestedMediaId, campaignGroupId])
  for (const id of [...mediaIds, 'priority'])
    expectBounds(bounds(nested, id), bounds(baseline, id), `${id}: nesting preserves world bounds`)
  assertRendered(nested)
  await capture('nested')
  const nestingUndone = await click('Undo')
  assert.equal(nestingUndone.hierarchy.campaignGroupId, null, 'Undo must clear the outer group ID')
  assert.equal(nestingUndone.hierarchy.mediaGroupId, nestedMediaId)
  assert.deepEqual((await click('Redo')).hierarchy, nested.hierarchy)
  assert.deepEqual((await click('Nest group + priority')).elements, nested.elements, 'Nesting is idempotent after Redo')

  const focused = await click('Focus nested Caption')
  assert.deepEqual(focused.selection.selectedIds, ['caption'])
  assert.equal(focused.selection.focusedId, 'caption')
  assert.equal(
    await page.locator('.group-layer-editor').evaluate((element) => document.activeElement === element),
    true,
  )
  await page.keyboard.press('ArrowRight')
  const keyboardMoved = await click('Inspect')
  close(bounds(keyboardMoved, 'caption').left, bounds(nested, 'caption').left + 1, 'Nested keyboard move')
  const beforeUngroup = Object.fromEntries(
    [...mediaIds, 'priority'].map((id) => [id, structuredClone(bounds(keyboardMoved, id))]),
  )
  const ungrouped = await click('Ungroup all')
  assert.equal(ungrouped.elements.filter((element) => element.type === 'container').length, 0)
  assert.deepEqual(ungrouped.hierarchy.captionParentChain, [])
  for (const [id, expected] of Object.entries(beforeUngroup))
    expectBounds(bounds(ungrouped, id), expected, `${id}: ungroup preserves world bounds`)
  assertRendered(ungrouped)
  await capture('ungrouped')
  const ungroupingUndone = await click('Undo')
  assert.equal(
    ungroupingUndone.hierarchy.mediaGroupId,
    nestedMediaId,
    'Undo ungroup discovers the restored media group',
  )
  assert.deepEqual(ungroupingUndone.hierarchy.mediaChildren, mediaIds)
  assert.deepEqual(
    (await click('Group media')).elements,
    ungroupingUndone.elements,
    'Group media must reuse the restored container, not create a duplicate',
  )
  let restored = ungroupingUndone
  let undoCount = 1
  while (!restored.hierarchy.campaignGroupId && undoCount < 3) {
    restored = await click('Undo')
    undoCount += 1
  }
  assert.equal(restored.hierarchy.mediaGroupId, nestedMediaId)
  assert.equal(restored.hierarchy.campaignGroupId, campaignGroupId)
  assert.deepEqual(restored.hierarchy.captionParentChain, keyboardMoved.hierarchy.captionParentChain)
  assert.deepEqual(restored.hierarchy.mediaChildren, mediaIds)
  // Membership recovers; exact sibling z-order has a separate strict, currently failing SDK regression.
  assert.deepEqual(new Set(restored.hierarchy.campaignChildren), new Set(keyboardMoved.hierarchy.campaignChildren))
  assert.deepEqual(
    new Set(restored.hierarchy.campaignDescendants),
    new Set(keyboardMoved.hierarchy.campaignDescendants),
  )
  assertRendered(restored)
  for (let count = 0; count < undoCount; count += 1) await click('Redo')
  assert.deepEqual((await model()).hierarchy, ungrouped.hierarchy, 'Redo removes both grouping levels')

  await click('Reset')
  const beforeInvalid = await model()
  const afterInvalid = await click('Try missing element', true)
  assert.deepEqual(afterInvalid.elements, beforeInvalid.elements, 'Missing ID rejection is atomic')
  assert.deepEqual(afterInvalid.order, beforeInvalid.order)
  await click('Empty board')
  assert.equal((await model()).elements.length, 0)
  await click('Group media', true)
  assert.equal((await model()).elements.length, 0)
  await click('Reset')
  assert.deepEqual((await model()).elements, baseline.elements)

  if (url.includes('/playground/')) {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.locator('.group-layer-demo[data-theme="dark"][data-ready="true"]').waitFor()
    assert.equal(await page.locator('.group-layer-editor canvas').count(), 1)
    assert.equal(await demo.evaluate((element) => getComputedStyle(element).backgroundColor), 'rgb(16, 24, 40)')
    assert.deepEqual((await model()).elements, baseline.elements)
    await page.emulateMedia({ colorScheme: 'light' })
    await page.locator('.group-layer-demo[data-theme="light"][data-ready="true"]').waitFor()
  }

  await page.setViewportSize({ width: 375, height: 900 })
  await click('Fit content')
  assert.equal(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth), true)
  assert.equal(await demo.evaluate((element) => getComputedStyle(element).overflowY), 'auto')
  assert.ok((await page.locator('.group-layer-editor canvas').first().boundingBox()).height >= 258)
  await controls.getByRole('button', { name: 'Reset', exact: true }).scrollIntoViewIfNeeded()
  assert.equal(await controls.getByRole('button', { name: 'Reset', exact: true }).isVisible(), true)
  await capture('narrow')
  await page.setViewportSize({ width: 1600, height: 1050 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.group-layer-demo[data-ready="true"]').waitFor()
  assert.deepEqual((await model()).elements, baseline.elements)
  assert.equal(await page.locator('.group-layer-editor canvas').count(), 1)
  assert.deepEqual(errors, [], 'Browser errors')
  await fs.writeFile(
    path.join(directory, 'result.json'),
    JSON.stringify(
      {
        passed: true,
        url,
        checks:
          'four exact z-orders, group/nest/ungroup Undo/Redo with idempotent regrouping, native keyboard Undo/Redo, nested focus and keyboard move, atomic lock rejection, group move with two-step Undo/Redo, ungroup geometry, renderer parity, invalid/empty/reset/remount, theme, narrow layout',
        limitations: ['Nested disband Undo changes sibling z-order; run test:showcase:boards-group-undo-sdk.'],
      },
      null,
      2,
    ),
  )
  console.log('PASS Boards grouping interactions; nested-disband Undo z-order requires the separate strict SDK check')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'result.json'),
    JSON.stringify({ passed: false, url, error: String(error), errors }, null, 2),
  )
  throw error
} finally {
  await browser.close()
}
