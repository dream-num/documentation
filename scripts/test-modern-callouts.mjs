/* eslint-disable no-await-in-loop -- Exercise one real document in history order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-callouts')
const url =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/docs-modern/callout-blocks`
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1250 } })
page.setDefaultTimeout(15000)
await page.emulateMedia({ colorScheme: 'light' })
const errors = []
const observeKnownDefects = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
page.on('pageerror', (e) => errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
// Observe actual SDK canvas paint calls without changing rendering or model state.
await page.addInitScript(() => {
  window.calloutPaint = []
  for (const method of ['fill', 'stroke', 'fillText']) {
    const original = CanvasRenderingContext2D.prototype[method]
    CanvasRenderingContext2D.prototype[method] = function (...args) {
      if (window.calloutPaint.length < 50000)
        window.calloutPaint.push({
          method,
          fill: this.fillStyle,
          stroke: this.strokeStyle,
          alpha: this.globalAlpha,
          width: this.lineWidth,
          dash: this.getLineDash(),
          text: method === 'fillText' ? String(args[0]) : undefined,
          font: this.font,
        })
      return original.apply(this, args)
    }
  }
})
const content = (s) => s.paragraphs.map((p) => p.text)
const semantic = (s) => ({
  primary: s.primary,
  comparison: s.comparison,
  paragraphs: s.paragraphs,
  blocks: s.blocks,
  links: s.links,
  textRuns: s.textRuns,
})
const comparison = (s) => ({ config: s.comparison.config, text: s.comparison.text })
const fragment = (s) => s.fragments.find((f) => f.blockId === 'tide-risk')
const emphasis = (s) => {
  const paragraph = s.paragraphs.find((p) => p.text.includes('offline pack'))
  assert.ok(paragraph)
  const start = paragraph.range.startOffset + paragraph.text.indexOf('offline pack')
  assert.ok(
    s.textRuns.some((run) => run.st <= start && run.ed >= start + 'offline pack'.length && run.ts.bl === 1),
    'Inline emphasis survives',
  )
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const demo = page.locator('.callout-demo')
  const ready = () => page.locator('.callout-demo[data-ready="true"]').waitFor({ timeout: 90000 })
  await ready()
  const controls = demo.locator('fieldset')
  const read = async () => JSON.parse(await demo.locator('output').textContent())
  const settle = () =>
    page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
  const click = async (name, expectedError = false) => {
    if (name !== 'Inspect')
      await page.evaluate(() => {
        window.calloutPaint = []
      })
    await controls.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.callout-demo fieldset')?.disabled === false)
    await settle()
    assert.equal(
      await demo.locator('[role="alert"]').isVisible(),
      expectedError,
      await demo.locator('[role="alert"]').textContent(),
    )
    return read()
  }
  const choose = (name, value) => controls.getByRole('combobox', { name, exact: true }).selectOption(value)
  const paint = () => page.evaluate(() => window.calloutPaint)
  const paintedColor = async (color, method = 'fill') => {
    const calls = await paint()
    assert.ok(
      calls.some((c) => c.method === method && c[method === 'stroke' ? 'stroke' : 'fill'] === color.toLowerCase()),
      `Actual ${method} paint for ${color}`,
    )
  }
  const capture = async (name) => {
    await settle()
    await demo.locator('details').evaluate((el) => {
      el.open = false
    })
    await demo.screenshot({ path: path.join(directory, name + '.png') })
  }
  const baseline = await click('Inspect')
  assert.deepEqual(baseline.allIds, ['tide-risk', 'tide-note'])
  assert.deepEqual(baseline.queryIds, ['tide-risk'])
  assert.equal(baseline.primary.config.icon, '!')
  assert.equal(baseline.primary.config.backgroundColor, '#FEF0C7')
  assert.match(baseline.primary.text, /^\[RISK\]/)
  assert.equal(baseline.blocks.length, 4)
  assert.equal(baseline.links.length, 1)
  emphasis(baseline)
  assert.ok(fragment(baseline).height > 0)
  await paintedColor('#FEF0C7')
  await paintedColor('#D97706', 'stroke')
  assert.ok((await paint()).some((c) => c.method === 'fillText' && c.text === '!'))
  await capture('baseline')
  for (const [id, icon, bg, border, textColor] of [
    ['information', 'i', '#DBEAFE', '#2563EB', '#1E3A8A'],
    ['success', '✓', '#DCFCE7', '#16A34A', '#14532D'],
    ['critical', '×', '#FEE2E2', '#DC2626', '#7F1D1D'],
    ['warning', '!', '#FEF0C7', '#D97706', '#78350F'],
  ]) {
    await choose('Callout style', id)
    const styled = await click('Apply style')
    assert.equal(styled.primary.config.icon, icon)
    assert.equal(styled.primary.config.backgroundColor, bg)
    assert.deepEqual(content(styled), content(baseline))
    assert.deepEqual(comparison(styled), comparison(baseline))
    assert.equal(styled.primary.startIndex, baseline.primary.startIndex)
    assert.equal(styled.primary.endIndex, baseline.primary.endIndex)
    emphasis(styled)
    await paintedColor(bg)
    await paintedColor(border, 'stroke')
    assert.ok((await paint()).some((c) => c.method === 'fillText' && c.text === icon))
    assert.ok(
      (await paint()).some((c) => c.method === 'fillText' && c.fill === textColor.toLowerCase() && c.text !== icon),
      'Actual colored body glyphs',
    )
  }
  await choose('Callout style', 'success')
  const success = await click('Apply style')
  const undo = await click('Undo', observeKnownDefects)
  if (observeKnownDefects) {
    assert.ok(
      undo.blocks.filter((b) => b.blockId === 'tide-risk').length > 1,
      'Observe disclosed beta.2 duplicate ranges',
    )
    assert.equal(undo.primary.style.textColor, success.primary.style.textColor)
    await click('Reset')
    await choose('Callout style', 'success')
    await click('Apply style')
  } else {
    assert.deepEqual(undo.blocks, success.blocks, 'Undo must preserve callout structure (known SDK defect)')
    assert.deepEqual(semantic(await click('Undo')), semantic(baseline))
    await click('Redo')
    assert.deepEqual(semantic(await click('Redo')), semantic(success))
  }
  await capture('success')
  await choose('Icon', '💡')
  const emoji = await click('Apply icon')
  assert.equal(emoji.primary.config.icon, '💡')
  assert.ok((await paint()).some((c) => c.method === 'fillText' && c.text === '💡'))
  const hidden = await click('Toggle icon visibility')
  assert.equal(hidden.primary.config.showIcon, false)
  assert.ok(!(await paint()).some((c) => c.method === 'fillText' && c.text === '💡'))
  assert.equal(hidden.typography.textLeft, emoji.typography.textLeft)
  assert.equal((await click('Toggle icon visibility')).primary.config.showIcon, true)
  const background = controls.getByRole('textbox', { name: 'Background', exact: true })
  const beforeBackground = await read()
  await background.fill('#EDE9FE')
  const purple = await click('Apply background')
  assert.equal(purple.primary.config.backgroundColor, '#EDE9FE')
  assert.equal(purple.primary.config.borderColor, success.primary.config.borderColor)
  assert.equal(purple.primary.config.icon, '💡')
  await paintedColor('#EDE9FE')
  assert.deepEqual(semantic(await click('Undo')), semantic(beforeBackground))
  assert.deepEqual(semantic(await click('Redo')), semantic(purple))
  for (const color of ['red', '#FFF', '#ZZZZZZ', '']) {
    await background.fill(color)
    await click('Apply background', true)
    assert.deepEqual(semantic(await read()), semantic(purple))
  }
  for (const [id, width, dash] of [
    ['dashed', 2, [8, 4]],
    ['dotted', 3, [3, 6]],
    ['none', 0, []],
    ['solid', 1, []],
  ]) {
    await choose('Border', id)
    const bordered = await click('Apply border')
    assert.equal(bordered.primary.config.borderWidth, width)
    const strokes = (await paint()).filter((c) => c.method === 'stroke' && c.stroke === '#16a34a')
    if (width === 0) assert.equal(strokes.length, 0)
    else
      assert.ok(
        strokes.some((c) => c.width === width && c.alpha === 0.75 && JSON.stringify(c.dash) === JSON.stringify(dash)),
        `Painted ${id} border`,
      )
  }
  await choose('Density', 'compact')
  const compact = await click('Apply density')
  await choose('Density', 'roomy')
  const roomy = await click('Apply density')
  assert.equal(roomy.primary.config.paddingTop, 24)
  if (observeKnownDefects) {
    assert.equal(fragment(roomy).height, fragment(compact).height, 'Observe disclosed stale vertical padding')
    assert.equal(roomy.typography.textLeft, compact.typography.textLeft, 'Observe disclosed stale text inset')
  } else {
    assert.ok(fragment(roomy).height > fragment(compact).height, 'Real fragment height reflects padding')
    assert.ok(roomy.typography.textLeft > compact.typography.textLeft, 'Real text inset reflects padding')
  }
  assert.deepEqual(content(roomy), content(baseline))
  assert.deepEqual(comparison(roomy), comparison(baseline))
  await capture('roomy-emoji')
  const edited = await click('Append review note')
  assert.match(edited.primary.text, /editorial panel\./)
  assert.equal(edited.primary.blockId, 'tide-risk')
  assert.ok(edited.primary.endIndex > roomy.primary.endIndex)
  assert.equal(edited.primary.startIndex, roomy.primary.startIndex)
  assert.deepEqual(edited.queryIds, ['tide-risk'])
  assert.deepEqual(comparison(edited), comparison(baseline))
  assert.deepEqual(semantic(await click('Reload snapshot')), semantic(edited))
  const inherited = await click('Reset text color')
  assert.notDeepEqual(inherited.typography.color, edited.typography.color)
  emphasis(inherited)
  const plain = await click('Convert to plain text')
  assert.equal(plain.primary, null)
  assert.deepEqual(content(plain), content(edited))
  emphasis(plain)
  const wrapped = await click('Wrap risk paragraph')
  assert.equal(wrapped.primary.blockId, 'tide-risk')
  assert.deepEqual(content(wrapped), content(edited))
  emphasis(wrapped)
  assert.deepEqual(semantic(await click('Wrap risk paragraph')), semantic(wrapped))
  const removed = await click('Delete callout and text')
  assert.equal(removed.primary, null)
  assert.ok(content(removed).every((p) => !p.includes('[RISK]')))
  assert.deepEqual(comparison(removed), comparison(baseline))
  const restored = await click('Undo')
  assert.equal(restored.primary.text, wrapped.primary.text)
  emphasis(restored)
  await click('Try missing ID', true)
  assert.deepEqual(semantic(await read()), semantic(restored))
  const selected = await click('Select callout text')
  assert.equal(
    selected.selection[0].startOffset,
    selected.paragraphs.find((p) => p.text.includes('[RISK]')).range.startOffset,
  )
  await page.keyboard.press('ArrowRight')
  await page.keyboard.type(' native')
  assert.match((await click('Inspect')).primary.text, /native/)
  await click('Reset')
  const empty = await click('Empty document')
  assert.equal(empty.primary, null)
  assert.deepEqual(empty.allIds, [])
  assert.equal(empty.paragraphs.length, 1)
  await click('Apply style', true)
  await click('Wrap risk paragraph', true)
  assert.deepEqual(semantic(await click('Reset')), semantic(baseline))
  if (!process.env.SHOWCASE_DEMO_URL) {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.locator('.callout-demo[data-theme="dark"][data-ready="true"]').waitFor()
    await click('Inspect')
    await capture('dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await page.locator('.callout-demo[data-theme="light"][data-ready="true"]').waitFor()
  }
  await page.setViewportSize({ width: 390, height: 844 })
  const narrow = await click('Reset')
  assert.ok(narrow.zoomRatio < 1)
  assert.ok(await demo.evaluate((el) => el.scrollWidth <= el.clientWidth + 1))
  await demo.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await capture('narrow')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready()
  assert.deepEqual((await click('Inspect')).allIds, baseline.allIds)
  assert.equal(await demo.locator('.callout-editor canvas').count(), 1)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(
      {
        status: observeKnownDefects ? 'passed-with-known-sdk-defect' : 'passed',
        knownDefects: observeKnownDefects
          ? [
              'Callout text-color Undo corrupts block ranges; strict default browser test and test-docs-callout-undo-sdk.mjs remain failing.',
              'Padding config does not update actual text inset or fragment height; test-docs-callout-padding-sdk.mjs remains failing.',
            ]
          : [],
        url,
        checks:
          'Four semantic styles; real canvas background, border, text and icon paint; density geometry; comparison isolation; content and inline emphasis; stable ID and updated range; Undo/Redo; unwrap/rewrap/delete; native typing; snapshot; empty/error/reset; theme/narrow/remount; browser errors',
      },
      null,
      2,
    ),
  )
  console.log(
    observeKnownDefects
      ? 'PASS observed Callout interactions; strict Undo and padding SDK gates remain failing'
      : 'PASS modern Callout capability',
  )
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true, timeout: 5000 }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      {
        error: String(error.stack),
        errors,
        readback: await page
          .locator('.callout-demo output')
          .textContent({ timeout: 1000 })
          .catch(() => null),
        paint: await page.evaluate(() => window.calloutPaint?.slice(-500)).catch(() => null),
      },
      null,
      2,
    ),
  )
  throw error
} finally {
  await browser.close()
}
