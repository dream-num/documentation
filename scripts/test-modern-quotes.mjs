/* eslint-disable no-await-in-loop -- Exercise one SDK document in history order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-quotes')
const url =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/docs-modern/quote-blocks`
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
await page.addInitScript(() => {
  window.quotePaint = []
  for (const method of ['stroke', 'fillText']) {
    const original = CanvasRenderingContext2D.prototype[method]
    CanvasRenderingContext2D.prototype[method] = function (...args) {
      if (window.quotePaint.length < 50000)
        window.quotePaint.push({
          method,
          stroke: this.strokeStyle,
          fill: this.fillStyle,
          width: this.lineWidth,
          font: this.font,
          text: method === 'fillText' ? String(args[0]) : undefined,
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
  textRuns: s.textRuns,
  blocks: s.blocks,
  links: s.links,
})
const comparison = (s) => ({ style: s.comparison.style, text: s.comparison.text })
const inside = (s) =>
  s.paragraphs.filter((p) => p.range.startOffset >= s.primary.startIndex && p.range.endOffset <= s.primary.endIndex)
const emphasis = (s) => {
  const voice = s.paragraphs.find((p) => p.text.includes('[VOICE]'))
  for (const [phrase, italic] of [
    ['visible route', true],
    ['clear directions', false],
  ]) {
    const start = voice.range.startOffset + voice.text.indexOf(phrase)
    assert.ok(
      s.textRuns.some(
        (r) => r.st <= start && r.ed >= start + phrase.length && r.ts.bl === 1 && (!italic || r.ts.it === 1),
      ),
      `Preserve ${phrase} inline marks`,
    )
  }
  assert.equal(s.typography.mixedStyle.bl, 1)
  assert.equal(s.typography.mixedStyle.it, 1)
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const demo = page.locator('.quote-demo')
  const ready = () => page.locator('.quote-demo[data-ready="true"]').waitFor({ timeout: 90000 })
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
        window.quotePaint = []
      })
    await controls.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.quote-demo fieldset')?.disabled === false)
    await settle()
    assert.equal(
      await demo.locator('[role="alert"]').isVisible(),
      expectedError,
      await demo.locator('[role="alert"]').textContent(),
    )
    return read()
  }
  const choose = (name, value) => controls.getByRole('combobox', { name, exact: true }).selectOption(value)
  const paint = () => page.evaluate(() => window.quotePaint)
  const painted = async (line, text) => {
    const calls = await paint()
    assert.ok(
      calls.some((c) => c.method === 'stroke' && c.stroke === line.toLowerCase()),
      'Actual quote rule color',
    )
    assert.ok(
      calls.some((c) => c.method === 'fillText' && c.fill === text.toLowerCase()),
      'Actual quote text color',
    )
    assert.ok(
      calls.some(
        (c) =>
          c.method === 'fillText' && c.fill === text.toLowerCase() && /italic/.test(c.font) && /bold|700/.test(c.font),
      ),
      'Actual bold italic glyph paint',
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
  assert.deepEqual(baseline.allIds, ['harbor-voice', 'harbor-comparison'])
  assert.deepEqual(baseline.queryIds, ['harbor-voice'])
  assert.equal(baseline.quoteAtVoice, 'harbor-voice')
  assert.equal(inside(baseline).length, 1)
  assert.equal(baseline.blocks.length, 4)
  emphasis(baseline)
  await painted('#2563EB', '#1E3A8A')
  await capture('baseline')
  for (const [id, lineColor, textColor] of [
    ['community', '#16A34A', '#14532D'],
    ['research', '#7C3AED', '#4C1D95'],
    ['contrast', '#111827', '#111827'],
    ['editorial', '#2563EB', '#1E3A8A'],
  ]) {
    const before = await read()
    await choose('Quote style', id)
    const styled = await click('Apply style')
    assert.deepEqual(styled.primary.style, { lineColor, textColor })
    assert.deepEqual(content(styled), content(baseline))
    assert.deepEqual(comparison(styled), comparison(baseline))
    assert.deepEqual(styled.blocks, baseline.blocks)
    emphasis(styled)
    await painted(lineColor, textColor)
    const undone = await click('Undo', observeKnownDefects)
    if (observeKnownDefects)
      assert.deepEqual(
        semantic(undone),
        semantic(styled),
        'Observe disclosed failed style Undo without changing ranges',
      )
    else {
      assert.deepEqual(semantic(undone), semantic(before), 'One style Undo restores both colors')
      assert.deepEqual(semantic(await click('Redo')), semantic(styled))
    }
  }
  const lineInput = controls.getByRole('textbox', { name: 'Line color', exact: true })
  const textInput = controls.getByRole('textbox', { name: 'Text color', exact: true })
  await lineInput.fill('#DB2777')
  const pinkLine = await click('Apply line color')
  assert.equal(pinkLine.primary.style.lineColor, '#DB2777')
  assert.equal(pinkLine.primary.style.textColor, '#1E3A8A')
  await painted('#DB2777', '#1E3A8A')
  await textInput.fill('#9D174D')
  const pink = await click('Apply text color')
  assert.equal(pink.primary.style.lineColor, '#DB2777')
  assert.equal(pink.primary.style.textColor, '#9D174D')
  await painted('#DB2777', '#9D174D')
  for (const invalid of ['red', '#FFF', '#GGGGGG', '']) {
    await lineInput.fill(invalid)
    await click('Apply line color', true)
    await textInput.fill(invalid)
    await click('Apply text color', true)
    assert.deepEqual(semantic(await read()), semantic(pink))
  }
  const attributed = await click('Append attribution')
  assert.match(attributed.primary.text, /Mira Bell, fictional route steward/)
  assert.ok(attributed.primary.endIndex > pink.primary.endIndex)
  assert.equal(attributed.primary.startIndex, pink.primary.startIndex)
  assert.deepEqual(comparison(attributed), comparison(baseline))
  emphasis(attributed)
  assert.deepEqual(semantic(await click('Append attribution')), semantic(attributed))
  assert.deepEqual(semantic(await click('Reload snapshot')), semantic(attributed))
  await capture('attributed')
  for (const [scope, count] of [
    ['context', 2],
    ['attribution', 3],
  ]) {
    await click('Reset')
    const plain = await click('Convert to plain text')
    assert.equal(plain.primary, null)
    assert.deepEqual(content(plain), content(baseline))
    emphasis(plain)
    assert.ok(plain.typography.textLeft < baseline.typography.textLeft, 'Unwrap removes the quote inset')
    await choose('Quote scope', scope)
    const wrapped = await click('Wrap selected scope')
    assert.equal(inside(wrapped).length, count)
    assert.equal(wrapped.primary.blockId, 'harbor-voice')
    assert.deepEqual(comparison(wrapped), comparison(baseline))
    assert.deepEqual(content(wrapped), content(baseline))
    emphasis(wrapped)
    assert.deepEqual(semantic(await click('Wrap selected scope')), semantic(wrapped))
    await choose('Quote style', 'research')
    const styledMulti = await click('Apply style')
    for (const paragraph of inside(styledMulti)) {
      assert.ok(
        styledMulti.textRuns.some(
          (run) =>
            run.st <= paragraph.range.startOffset &&
            run.ed > paragraph.range.startOffset &&
            run.ts.cl?.rgb === '#4C1D95',
        ),
        'Multi-paragraph style reaches every quoted paragraph',
      )
    }
    emphasis(styledMulti)
    await painted('#7C3AED', '#4C1D95')
    assert.deepEqual(semantic(await click('Reload snapshot')), semantic(styledMulti))
    await capture(scope)
  }
  const multi = await read()
  assert.match(multi.primary.text, /\[ATTR\]/)
  assert.deepEqual(semantic(await click('Append attribution')), semantic(multi))
  const removed = await click('Delete quote and text')
  assert.equal(removed.primary, null)
  assert.ok(content(removed).every((p) => !/\[VOICE\]|\[CONTEXT\]|\[ATTR\]/.test(p)))
  assert.deepEqual(comparison(removed), comparison(baseline))
  const restored = await click('Undo')
  assert.equal(restored.primary.text, multi.primary.text)
  emphasis(restored)
  await click('Try missing ID', true)
  assert.deepEqual(semantic(await read()), semantic(restored))
  await click('Reset')
  const selected = await click('Select quote text')
  assert.equal(selected.selection[0].startOffset, selected.primary.startIndex + 1)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.type(' native')
  assert.match((await click('Inspect')).primary.text, /native/)
  const empty = await click('Empty document')
  assert.deepEqual(empty.allIds, [])
  assert.equal(empty.paragraphs.length, 1)
  await click('Apply style', true)
  await click('Wrap selected scope', true)
  assert.deepEqual(semantic(await click('Reset')), semantic(baseline))
  if (!process.env.SHOWCASE_DEMO_URL) {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.locator('.quote-demo[data-theme="dark"][data-ready="true"]').waitFor()
    await click('Inspect')
    await capture('dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await page.locator('.quote-demo[data-theme="light"][data-ready="true"]').waitFor()
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
  assert.equal(await demo.locator('.quote-editor canvas').count(), 1)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(
      {
        status: observeKnownDefects ? 'passed-with-known-sdk-defect' : 'passed',
        knownDefects: observeKnownDefects
          ? [
              'Quote style Undo returns false and leaves both colors unchanged; strict default browser and test-docs-quote-undo-sdk.mjs remain failing.',
            ]
          : [],
        url,
        checks:
          'Three quote scopes; four styles; independent colors; real rule/text/bold-italic canvas paint; comparison isolation; inline marks; stable IDs and content boundaries; attribution; one-step style Undo/Redo; unwrap/delete; snapshot; native typing; empty/error/reset; theme/narrow/remount; browser errors',
      },
      null,
      2,
    ),
  )
  console.log(
    observeKnownDefects
      ? 'PASS observed Quote interactions; strict style Undo gate remains failing'
      : 'PASS modern Quote capability',
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
          .locator('.quote-demo output')
          .textContent({ timeout: 1000 })
          .catch(() => null),
        paint: await page.evaluate(() => window.quotePaint?.slice(-500)).catch(() => null),
      },
      null,
      2,
    ),
  )
  throw error
} finally {
  await browser.close()
}
