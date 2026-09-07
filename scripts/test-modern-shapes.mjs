/* eslint-disable no-await-in-loop -- Exercise variants on one live SDK document. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-shapes')
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/docs-modern/shapes-in-documents'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1600, height: 1400 } })
page.setDefaultTimeout(15000)
const errors = [],
  results = []
const observeKnownDefects = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
await page.addInitScript(() => {
  window.__shapePaint = []
  for (const method of ['fill', 'stroke']) {
    const original = CanvasRenderingContext2D.prototype[method]
    CanvasRenderingContext2D.prototype[method] = function (...args) {
      window.__shapePaint.push({ method, color: String(method === 'fill' ? this.fillStyle : this.strokeStyle) })
      if (window.__shapePaint.length > 12000) window.__shapePaint.splice(0, 6000)
      return original.apply(this, args)
    }
  }
})
const badge = (s) => s.shapes.find((x) => x.id === 'aster-decision-badge')
const reference = (s) => s.shapes.find((x) => x.id === 'aster-review-window')
const content = (s) => ({
  tables: s.tables,
  columns: s.columns.map(({ config, ...column }) => {
    const { startIndex: _start, endIndex: _end, ...format } = config
    return { ...column, config: format }
  }),
  charts: s.charts.map((c) => c.dataSource.values),
  image: s.images.map((i) => ({ id: i.drawingId, source: i.source, description: i.description })),
})
try {
  await page.goto(url, { timeout: 300000, waitUntil: 'domcontentloaded' })
  const demo = page.locator('.shapes-demo'),
    controls = demo.locator('fieldset')
  await page.locator('.shapes-demo[data-ready=true]').waitFor({ timeout: 90000 })
  const read = async () => JSON.parse(await demo.locator('output').textContent())
  const click = async (name, expectedError) => {
    await controls.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.shapes-demo fieldset')?.disabled === false)
    const alert = demo.locator('[role=alert]')
    if (expectedError) {
      assert.equal(await alert.isVisible(), true)
      assert.match(await alert.textContent(), expectedError)
    } else assert.equal(await alert.isVisible(), false, await alert.textContent())
    return read()
  }
  const select = (name, value) => controls.getByRole('combobox', { name, exact: true }).selectOption(value)
  const fill = (name, value) => controls.getByRole('spinbutton', { name, exact: true }).fill(String(value))
  const capture = (name) => demo.screenshot({ path: path.join(directory, name + '.png') })
  await page.waitForTimeout(1200)
  let state = await click('Inspect')
  const initial = structuredClone(state),
    independent = content(state)
  assert.equal(state.shapes.length, 2)
  assert.equal(state.tables.length, 1)
  assert.equal(state.columns.length, 1)
  assert.equal(state.charts.length, 1)
  assert.equal(state.images.length, 1)
  assert.ok(badge(state).rendered?.visible, 'Native badge must render')
  assert.ok(reference(state).rendered?.visible, 'Reference shape must render')
  assert.match(badge(state).anchor.text, /Decision:/)
  assert.notEqual(
    badge(state).drawing.drawingType,
    state.images[0].drawingType,
    'Native shapes cannot masquerade as images',
  )
  assert.deepEqual(badge(state).transform.width, 160)
  await capture('initial')
  assert.ok(
    await page.evaluate(() => window.__shapePaint.some((p) => p.color === '#d1fae5')),
    'Native shape fill must reach canvas',
  )
  const originalAnchor = badge(state).anchor.id
  await click('Insert shape')
  assert.equal((await read()).shapes.length, 2, 'Stable IDs prevent duplicate insertion')
  for (const type of ['Rect', 'Ellipse', 'Diamond', 'RoundRect']) {
    await select('Shape', type)
    state = await click('Change shape')
    results.push({ geometry: type, type: badge(state).type, rendered: badge(state).rendered })
    assert.ok(badge(state).rendered?.visible)
    assert.deepEqual(content(state), independent)
    await capture(type)
  }
  assert.equal(new Set(results.map((r) => r.type)).size, 4, 'Four real geometry types')
  const beforeSize = badge(state).transform
  await fill('Width', 210)
  await fill('Height', 88)
  state = await click('Resize')
  assert.equal(badge(state).transform.width, 210)
  assert.equal(badge(state).transform.height, 88)
  state = await click('Undo')
  assert.equal(badge(state).transform.width, beforeSize.width)
  state = await click('Redo')
  assert.equal(badge(state).transform.width, 210)
  await fill('X', 310)
  await fill('Y', 28)
  state = await click('Move')
  assert.equal(badge(state).transform.left, 310)
  assert.equal(badge(state).transform.top, 28)
  const moved = badge(state).rendered
  assert.notEqual(moved.left, badge(initial).rendered.left)
  state = await click('Rotate 15°')
  assert.equal(badge(state).transform.rotation, 15)
  await fill('Width', 0)
  await click('Resize', /Width must/)
  assert.equal(badge(await read()).transform.width, 210)
  await fill('Width', 210)
  for (const style of ['review', 'outline', 'approved']) {
    await select('Style', style)
    state = await click('Apply style')
    assert.equal(
      badge(state).data.stroke.color,
      style === 'review' ? '#d97706' : style === 'outline' ? '#7c3aed' : '#047857',
    )
    assert.deepEqual(content(state), independent)
    await capture(style)
  }
  await controls.getByRole('textbox', { name: 'Label', exact: true }).fill('TRIAL READY')
  state = await click('Set label')
  assert.match(badge(state).text, /TRIAL READY/)
  state = await click('Undo')
  assert.match(badge(state).text, /APPROVED/)
  state = await click('Redo')
  assert.match(badge(state).text, /TRIAL READY/)
  await controls.getByRole('textbox', { name: 'Label', exact: true }).fill(' ')
  await click('Set label', /Enter a label/)
  await controls.getByRole('textbox', { name: 'Label', exact: true }).fill('TRIAL READY')
  for (const order of ['sendToBack', 'bringForward', 'bringToFront', 'sendBackward']) {
    const before = await read()
    await select('Drawing order', order)
    state = await click('Arrange')
    const position = state.order.indexOf('aster-decision-badge')
    if (order === 'sendToBack') assert.equal(position, 0)
    if (order === 'bringToFront') assert.equal(position, state.order.length - 1)
    if (order === 'bringForward') assert.equal(position, before.order.indexOf('aster-decision-badge') + 1)
    if (order === 'sendBackward') assert.equal(position, before.order.indexOf('aster-decision-badge') - 1)
    assert.equal(badge(state).rendered.zIndex, position, 'Actual renderer order must match model')
  }
  for (const wrap of ['WRAP_SQUARE', 'WRAP_TOP_AND_BOTTOM', 'INLINE', 'IN_FRONT_OF_TEXT', 'BEHIND_TEXT']) {
    await select('Wrapping', wrap)
    state = await click('Apply wrapping')
    assert.ok(badge(state).rendered?.visible)
    assert.equal(badge(state).anchor.id, originalAnchor)
    assert.deepEqual(content(state), independent)
    results.push({ wrapping: wrap, drawing: badge(state).drawing, rendered: badge(state).rendered })
    if (wrap === 'INLINE') await click('Move', /Inline position follows text/)
    if (wrap === 'BEHIND_TEXT')
      assert.ok(
        badge(state).rendered.layer < reference(state).rendered.layer,
        'Behind text must change real render layer',
      )
    await click('Show target')
    await capture(wrap)
  }
  const beforeNote = badge(state).anchor.offset
  state = await click('Insert note before anchor')
  assert.equal(badge(state).anchor.id, originalAnchor)
  assert.ok(badge(state).anchor.offset > beforeNote)
  assert.equal(
    state.columns[0].config.startIndex,
    initial.columns[0].config.startIndex + 'Access review note: confirm the trial date.\r'.length,
  )
  assert.equal(
    state.columns[0].config.endIndex,
    initial.columns[0].config.endIndex + 'Access review note: confirm the trial date.\r'.length,
  )
  const saved = structuredClone(state)
  state = await click('Reload snapshot')
  await page.waitForTimeout(500)
  state = await click('Inspect')
  assert.equal(badge(state).anchor.id, originalAnchor)
  assert.deepEqual(badge(state).anchor, badge(saved).anchor)
  assert.deepEqual(badge(state).transform, badge(saved).transform)
  // Loading materializes default adjustment values; compare resolved geometry, not omitted defaults.
  assert.deepEqual(badge(state).adjustHandles, badge(saved).adjustHandles)
  const { adjustValues: _loadedDefaults, ...loadedData } = badge(state).data
  const { adjustValues: _savedDefaults, ...savedData } = badge(saved).data
  assert.deepEqual(loadedData, savedData)
  assert.equal(badge(state).rendered.layer, badge(saved).rendered.layer)
  assert.ok(badge(state).rendered.layer < reference(state).rendered.layer)
  assert.deepEqual(state.order, saved.order)
  assert.deepEqual(content(state), independent)
  await capture('reloaded-behind-text')
  // zIndex is layer-local and can be renumbered. Verify visible relative order on the same layer too.
  await select('Wrapping', 'IN_FRONT_OF_TEXT')
  await click('Apply wrapping')
  await select('Drawing order', 'sendToBack')
  state = await click('Arrange')
  assert.ok(badge(state).rendered.zIndex < reference(state).rendered.zIndex)
  const arrangedOrder = state.order
  state = await click('Reload snapshot')
  assert.deepEqual(state.order, arrangedOrder)
  assert.equal(badge(state).rendered.layer, reference(state).rendered.layer)
  assert.ok(badge(state).rendered.zIndex < reference(state).rendered.zIndex)
  state = await click('Delete shape')
  assert.equal(badge(state), undefined)
  state = await click('Undo')
  assert.ok(badge(state))
  state = await click('Redo')
  assert.equal(badge(state), undefined)
  await select('Anchor', 'review')
  state = await click('Insert shape')
  assert.match(badge(state).anchor.text, /Review checkpoint/)
  state = await click('Reset')
  assert.equal(badge(state).anchor.id, originalAnchor)
  const wide = state,
    id = state.unitId
  await controls.getByRole('textbox', { name: 'Label', exact: true }).fill('NARROW CHECK')
  await click('Set label')
  let firstNarrowWidth
  for (const w of [520, 390, 320]) {
    await page.setViewportSize({ width: w, height: 1400 })
    await page.waitForTimeout(250)
    state = await click('Inspect', observeKnownDefects && w < 520 ? /SDK layout failed:.*breakType/ : undefined)
    for (let attempt = 0; attempt < 30 && state.layout[0]?.width !== state.pageWidth; attempt++) {
      await page.waitForTimeout(100)
      state = await click('Inspect', observeKnownDefects && w < 520 ? /SDK layout failed:.*breakType/ : undefined)
    }
    if (w === 520) firstNarrowWidth = state.layout[0]?.width
    if (observeKnownDefects && w < 520 && state.layout[0]?.width !== state.pageWidth) {
      assert.equal(state.layout[0]?.width, firstNarrowWidth, 'Observe only the reproduced stale-first-width failure')
      assert.match(state.layoutFailure, /breakType/, 'The original SDK exception stays visible on repeated Inspect')
      results.push({
        knownGap: 'stale layout after repeated viewport resize',
        viewport: w,
        modelWidth: state.pageWidth,
        renderedWidth: state.layout[0]?.width,
      })
    } else
      assert.equal(state.layout[0]?.width, state.pageWidth, 'Wait for actual SDK layout, not only the resized model')
    assert.equal(state.unitId, id)
    assert.equal(state.viewScale, 1)
    assert.ok(state.pageWidth < wide.pageWidth)
    assert.deepEqual(content(state), independent)
    assert.deepEqual(badge(state).transform, badge(wide).transform, 'Explicit shape geometry is not silently rewritten')
    const columns = state.layout.flatMap((p) => p.groups)[0].columns
    assert.equal(columns[0].left, columns[1].left)
    assert.ok(columns[1].top >= columns[0].top + columns[0].height)
    assert.ok(state.layout.flatMap((p) => p.tables)[0].width <= state.layout[0].width - 133.3)
    await capture('narrow-' + w)
  }
  await page.setViewportSize({ width: 1600, height: 1400 })
  await page.waitForTimeout(300)
  state = await click('Inspect')
  assert.equal(state.layoutFailure, null)
  assert.equal(state.pageWidth, state.layout[0].width)
  assert.equal(state.unitId, id, 'Recovery must keep the same unit')
  state = await click('Undo')
  assert.match(badge(state).text, /APPROVED/)
  state = await click('Redo')
  assert.match(badge(state).text, /NARROW CHECK/)
  state = await click('Empty document')
  assert.equal(state.shapes.length, 0)
  await click('Move', /Shape is absent/)
  state = await click('Insert shape')
  assert.equal(state.shapes.length, 1)
  state = await click('Reset')
  assert.equal(state.shapes.length, 2)
  assert.deepEqual(content(state), independent)
  await click('Show chart')
  await capture('independent-chart')
  assert.equal(await demo.locator('.shapes-editor canvas').count(), 1)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(
      { status: results.some((r) => r.knownGap) ? 'passed-with-known-layout-gap' : 'passed', url, results, errors },
      null,
      2,
    ),
  )
  console.log(
    'PASS native shape interactions, anchor/layer/order persistence, history and mixed content; inspect report for reflow gaps',
  )
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      {
        error: String(error),
        stack: error.stack,
        errors,
        results,
        readback: await page
          .locator('.shapes-demo output')
          .textContent()
          .catch(() => null),
      },
      null,
      2,
    ),
  )
  throw error
} finally {
  await browser.close()
}
