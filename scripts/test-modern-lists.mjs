/* eslint-disable no-await-in-loop -- One document is exercised in history order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-lists')
const url =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/docs-modern/lists-task-items`
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1250 } })
await page.emulateMedia({ colorScheme: 'light' })
const errors = []
page.on('pageerror', (e) => errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
const item = (s, marker) => s.items.find((i) => i.text.includes(marker))
const text = (s) => s.paragraphs.map((p) => p.text)
const semantic = (s) => ({
  items: s.items.map(({ rendered: _rendered, ...i }) => i),
  paragraphs: s.paragraphs,
  blocks: s.blocks,
  links: s.links,
})
const symbol = (s, marker) => item(s, marker).rendered.symbol.trim()
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const demo = page.locator('.list-demo')
  const ready = () => page.locator('.list-demo[data-ready="true"]').waitFor({ timeout: 90000 })
  await ready()
  const controls = demo.locator('fieldset')
  const read = async () => JSON.parse(await demo.locator('output').textContent())
  const click = async (name, expectedError = false) => {
    await controls.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.list-demo fieldset')?.disabled === false)
    assert.equal(
      await demo.locator('[role="alert"]').isVisible(),
      expectedError,
      await demo.locator('[role="alert"]').textContent(),
    )
    return read()
  }
  const target = (marker) => controls.getByRole('combobox', { name: 'Target item', exact: true }).selectOption(marker)
  const scope = (mode) => controls.getByRole('combobox', { name: 'Scope', exact: true }).selectOption(mode)
  const marker = (style) => controls.getByRole('combobox', { name: 'Marker style', exact: true }).selectOption(style)
  const capture = async (name) => {
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
    await demo.screenshot({ path: path.join(directory, name + '.png') })
  }
  const baseline = await click('Inspect')
  assert.equal(baseline.items.length, 13)
  assert.equal(baseline.lists.length, 4)
  assert.deepEqual(
    baseline.blocks.map((b) => b.blockType),
    ['callout', 'code', 'quote'],
  )
  assert.equal(item(baseline, '[KEYS]').listType, 'CHECK_LIST_CHECKED')
  assert.equal(item(baseline, '[EXIT]').listType, 'CHECK_LIST')
  assert.deepEqual(
    ['[FLOOR]', '[LABEL]', '[LIGHT]', '[WALK]', '[OPEN]'].map((m) => symbol(baseline, m)),
    ['1.', '2.', '3.', '4.', '5.'],
  )
  assert.equal(symbol(baseline, '[EMAIL]'), '1.')
  assert.ok(baseline.items.every((i) => i.rendered && Number.isFinite(i.rendered.textLeft)))
  await demo.locator('summary').click()
  await capture('baseline')
  const nested = await click('Nest two steps')
  for (const m of ['[LABEL]', '[LIGHT]']) {
    assert.equal(item(nested, m).nestingLevel, 1)
    assert.ok(item(nested, m).rendered.textLeft > item(baseline, m).rendered.textLeft)
  }
  assert.equal(item(nested, '[WALK]').nestingLevel, 0)
  assert.equal(symbol(nested, '[WALK]'), '2.')
  assert.deepEqual(text(nested), text(baseline))
  const undoOne = await click('Undo')
  assert.equal(item(undoOne, '[LABEL]').nestingLevel, 1)
  assert.equal(item(undoOne, '[LIGHT]').nestingLevel, 0)
  assert.deepEqual(semantic(await click('Undo')), semantic(baseline))
  await click('Redo')
  await click('Redo')
  await scope('level')
  await marker('letters')
  const letters = await click('Apply marker')
  assert.equal(item(letters, '[LABEL]').glyphType, 4)
  assert.equal(item(letters, '[LIGHT]').glyphType, 4)
  assert.equal(item(letters, '[FLOOR]').glyphType, item(nested, '[FLOOR]').glyphType)
  assert.match(symbol(letters, '[LABEL]'), /A/)
  assert.match(symbol(letters, '[LIGHT]'), /B/)
  await scope('item')
  await marker('roman')
  const roman = await click('Apply marker')
  assert.equal(item(roman, '[LABEL]').glyphType, 7)
  // Known beta.2 scope defect: the custom definition is shared. The separate strict SDK gate fails.
  assert.equal(item(roman, '[LIGHT]').glyphType, 7)
  assert.match(symbol(roman, '[LABEL]'), /i/)
  await scope('list')
  await marker('decimal')
  const decimal = await click('Apply marker')
  for (const m of ['[FLOOR]', '[LABEL]', '[LIGHT]', '[WALK]', '[OPEN]']) assert.equal(item(decimal, m).glyphType, 2)
  await target('[RADIO]')
  await marker('diamond')
  const diamonds = await click('Apply marker')
  for (const m of ['[RADIO]', '[MAP]', '[COAT]']) assert.equal(symbol(diamonds, m), '◆')
  await target('[WALK]')
  await scope('item')
  const restarted = await click('Restart numbering')
  assert.equal(symbol(restarted, '[WALK]'), '7.')
  assert.equal(symbol(restarted, '[OPEN]'), '8.')
  await target('[EMAIL]')
  const continued = await click('Continue numbering')
  assert.equal(symbol(continued, '[EMAIL]'), '9.')
  assert.equal(symbol(continued, '[SIGNS]'), '10.')
  const start = controls.getByRole('spinbutton', { name: 'Start number', exact: true })
  for (const value of ['0', '100', '2.5', '']) {
    await start.fill(value)
    await click('Restart numbering', true)
    assert.deepEqual(semantic(await read()), semantic(continued))
  }
  await target('[RADIO]')
  await start.fill('7')
  await click('Restart numbering', true)
  await target('[EMAIL]')
  await click('Use Step n: markers', true)
  await scope('list')
  const formatted = await click('Use Step n: markers')
  assert.match(symbol(formatted, '[EMAIL]'), /^Step 9:$/)
  const checked = await click('Toggle exit task')
  assert.equal(item(checked, '[EXIT]').listType, 'CHECK_LIST_CHECKED')
  assert.notEqual(symbol(checked, '[EXIT]'), symbol(baseline, '[EXIT]'))
  assert.deepEqual(text(checked), text(baseline))
  await capture('numbered-and-checked')
  assert.deepEqual(semantic(await click('Reload snapshot')), semantic(checked))
  assert.equal(symbol(await read(), '[EMAIL]'), symbol(checked, '[EMAIL]'))
  assert.equal(item(await click('Toggle exit task'), '[EXIT]').listType, 'CHECK_LIST')
  await click('Reset')
  const originalTop = await target('[FLOOR]').then(() => click('Outdent'))
  assert.deepEqual(semantic(originalTop), semantic(baseline), 'Top-level outdent is a no-op')
  await target('[LABEL]')
  for (let level = 1; level <= 8; level++) assert.equal(item(await click('Indent'), '[LABEL]').nestingLevel, level)
  assert.equal(item(await click('Indent'), '[LABEL]').nestingLevel, 8)
  await click('Nest two steps', true)
  assert.equal(item(await click('Outdent'), '[LABEL]').nestingLevel, 7)
  await click('Reset')
  const edited = await click('Append item note')
  assert.match(item(edited, '[LABEL]').text, /confirmed$/)
  assert.equal(item(await click('Indent'), '[LABEL]').text, item(edited, '[LABEL]').text)
  for (const mode of ['item', 'level', 'list']) {
    await scope(mode)
    const selected = await click('Select scope')
    assert.ok(selected.selection.length > 0)
    if (mode === 'item') assert.equal(selected.selection[0].startOffset, item(selected, '[LABEL]').startOffset)
  }
  await scope('item')
  await click('Select scope')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.type(' native')
  assert.match(item(await click('Inspect'), '[LABEL]').text, /native$/)
  await click('Reset')
  const empty = await click('Empty document')
  assert.equal(empty.items.length, 0)
  assert.equal(empty.paragraphs.length, 1)
  await click('Apply marker', true)
  await click('Toggle exit task', true)
  assert.deepEqual(semantic(await click('Reset')), semantic(baseline))
  if (!process.env.SHOWCASE_DEMO_URL) {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.locator('.list-demo[data-theme="dark"][data-ready="true"]').waitFor()
    await click('Inspect')
    await capture('dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await page.locator('.list-demo[data-theme="light"][data-ready="true"]').waitFor()
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
  assert.equal((await click('Inspect')).items.length, 13)
  assert.equal(await demo.locator('.list-editor canvas').count(), 1)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(
      {
        status: 'passed-with-known-sdk-defect',
        knownDefects: [
          'Item marker isolation still fails test-docs-list-scope-sdk.mjs; this browser check observes the disclosed spillover.',
        ],
        url,
        checks:
          'Real list/task structures, rendered numbering and indentation, three scopes, four marker styles, restart/continue, input boundaries, task toggle, Undo/Redo, snapshot reload, native selection/typing, empty/reset, theme/narrow/remount, browser errors',
      },
      null,
      2,
    ),
  )
  console.log('PASS observed modern list interactions; strict item-scope SDK gate remains failing')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      {
        error: String(error.stack),
        errors,
        readback: await page
          .locator('.list-demo output')
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
