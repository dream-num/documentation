/* eslint-disable no-await-in-loop -- Exercise one document and its history sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-headings')
const url =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/docs-modern/paragraph-heading-blocks`
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1250 } })
await page.emulateMedia({ colorScheme: 'light' })
const errors = []
page.on('pageerror', (e) => errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
const paragraph = (s, marker) => s.paragraphs.find((p) => p.text.includes(marker))
const typography = (s, marker) => Object.entries(s.typography).find(([key]) => key.includes(marker))?.[1]
const content = (s) => s.paragraphs.map((p) => p.text)
const semantic = (s) => ({
  paragraphs: s.paragraphs.map(({ text, style }) => ({ text, style })),
  blocks: s.blocks,
  lists: s.lists,
  links: s.links,
})
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const demo = page.locator('.heading-demo')
  const ready = () => page.locator('.heading-demo[data-ready="true"]').waitFor({ timeout: 90000 })
  await ready()
  const controls = demo.locator('fieldset')
  const read = async () => JSON.parse(await demo.locator('output').textContent())
  const click = async (name, expectedError = false) => {
    await controls.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.heading-demo fieldset')?.disabled === false)
    assert.equal(
      await demo.locator('[role="alert"]').isVisible(),
      expectedError,
      await demo.locator('[role="alert"]').textContent(),
    )
    return read()
  }
  const capture = async (name) => {
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
    await demo.screenshot({ path: path.join(directory, `${name}.png`) })
  }
  const baseline = await click('Inspect')
  assert.equal(baseline.flavor, 2)
  assert.equal(baseline.headings.length, 6)
  assert.equal(baseline.lists.length, 3)
  assert.deepEqual(
    baseline.blocks.map((b) => b.blockType),
    ['code', 'callout', 'quote'],
  )
  assert.equal(baseline.code.config.language, 'typescript')
  assert.match(baseline.code.text, /await fieldNotes/)
  assert.match(baseline.callout.text, /RISK NOTE/)
  assert.match(baseline.quote.text, /A useful note/)
  assert.equal(baseline.links[0].properties.url, 'https://example.org/lumen-protocol')
  assert.equal(typography(baseline, '[SCOPE]').fontSize, 18)
  await demo.locator('summary').click()
  await capture('baseline')
  await demo.locator('.heading-editor canvas').hover()
  await page.mouse.wheel(0, 680)
  await capture('supporting-blocks')
  for (const marker of ['[SCOPE]', '[PLAN]']) {
    await controls.getByRole('combobox', { name: 'Marked section', exact: true }).selectOption(marker)
    const promoted = await click('Promote')
    assert.equal(paragraph(promoted, marker).style.namedStyleType, 4)
    assert.equal(typography(promoted, marker).fontSize, 22)
    assert.deepEqual(content(promoted), content(baseline))
    const unchanged = await click('Promote', true)
    assert.deepEqual(semantic(unchanged), semantic(promoted), 'Invalid promotion is atomic')
    const demoted = await click('Demote')
    assert.equal(paragraph(demoted, marker).style.namedStyleType, 5)
    assert.equal(typography(demoted, marker).fontSize, 18)
    for (const [level, size] of [
      [1, 22],
      [2, 18],
      [3, 15],
      [4, 13],
      [5, 12],
      [0, 12],
    ]) {
      await controls.getByRole('combobox', { name: 'Heading level', exact: true }).selectOption(String(level))
      const applied = await click('Apply level')
      assert.equal(paragraph(applied, marker).style.namedStyleType, level ? level + 3 : 1)
      assert.equal(typography(applied, marker).fontSize, size)
      assert.equal(applied.headings.length, level ? 6 : 5)
      assert.equal(await demo.locator('nav li[data-level]').count(), level ? 6 : 5)
      assert.deepEqual(
        await demo.locator('nav li[data-level]').allTextContents(),
        applied.headings.map((h) => `H${h.level} · ${h.text}`),
      )
      if (level === 5) await click('Demote', true)
    }
    await click('Reset')
  }
  const edited = await click('Append section note')
  assert.match(paragraph(edited, '[SCOPE]').text, /reviewed$/)
  const editedHeading = await click('Promote')
  assert.equal(paragraph(editedHeading, '[SCOPE]').text, paragraph(edited, '[SCOPE]').text)
  const undone = await click('Undo')
  assert.equal(paragraph(undone, '[SCOPE]').style.namedStyleType, 5)
  assert.equal(paragraph(undone, '[SCOPE]').text, paragraph(edited, '[SCOPE]').text)
  assert.equal(paragraph(await click('Redo'), '[SCOPE]').style.namedStyleType, 4)
  assert.deepEqual(
    semantic(await click('Reload snapshot')),
    semantic(editedHeading),
    'Snapshot round trip retains all blocks and text',
  )
  await click('Reset')
  for (const [variant, spacing, align, indent] of [
    ['comfortable', 1.5, 1, 24],
    ['centered', 1.25, 2, 0],
    ['hanging', 1, 1, 36],
    ['compact', 1, 1, 0],
  ]) {
    await controls.getByRole('combobox', { name: 'Paragraph layout', exact: true }).selectOption(variant)
    const styled = await click('Apply paragraph layout')
    assert.equal(paragraph(styled, '[SUMMARY]').style.lineSpacing, spacing)
    assert.equal(paragraph(styled, '[SUMMARY]').style.horizontalAlign, align)
    assert.equal(paragraph(styled, '[SUMMARY]').style.indentStart.v, indent)
    assert.deepEqual(content(styled), content(baseline))
    if (variant === 'comfortable')
      assert.ok(typography(styled, '[SUMMARY]').lineHeight > typography(baseline, '[SUMMARY]').lineHeight)
    if (variant !== 'compact')
      assert.ok(
        typography(styled, '[SUMMARY]').textLeft > typography(baseline, '[SUMMARY]').textLeft,
        `${variant}: rendered text origin moves`,
      )
    else assert.equal(typography(styled, '[SUMMARY]').textLeft, typography(baseline, '[SUMMARY]').textLeft)
    await capture(variant)
  }
  const selected = await click('Select marked heading')
  assert.equal(selected.selection[0].startOffset, paragraph(selected, '[SCOPE]').startOffset)
  assert.equal(selected.selection[0].endOffset, paragraph(selected, '[SCOPE]').endOffset)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.type(' native')
  const native = await click('Inspect')
  assert.match(paragraph(native, '[SCOPE]').text, /native$/)
  await click('Reset')
  const removed = await click('Remove marked heading')
  assert.equal(paragraph(removed, '[SCOPE]'), undefined)
  await click('Promote', true)
  assert.deepEqual(semantic(await read()), semantic(removed))
  assert.equal((await click('Undo')).headings.length, 6)
  const empty = await click('Empty document')
  assert.equal(empty.headings.length, 0)
  assert.equal(empty.paragraphs.length, 1)
  assert.equal(await demo.locator('nav').textContent(), 'No headings')
  await click('Apply level', true)
  assert.deepEqual(semantic(await click('Reset')), semantic(baseline))
  assert.equal(await demo.locator('.heading-editor canvas').count(), 1)
  if (!process.env.SHOWCASE_DEMO_URL) {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.locator('.heading-demo[data-theme="dark"][data-ready="true"]').waitFor()
    await click('Inspect')
    await capture('dark')
    assert.equal(await demo.locator('.heading-editor canvas').count(), 1)
    await page.emulateMedia({ colorScheme: 'light' })
    await page.locator('.heading-demo[data-theme="light"][data-ready="true"]').waitFor()
  }
  await page.setViewportSize({ width: 390, height: 844 })
  const narrow = await click('Reset')
  assert.ok(narrow.zoomRatio >= 0.1 && narrow.zoomRatio < 1, 'SDK fit-width zoom on narrow screens')
  assert.ok(await demo.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'No horizontal host overflow')
  await capture('narrow')
  await demo.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await capture('narrow-editor')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready()
  assert.equal((await click('Inspect')).headings.length, 6)
  assert.equal(await demo.locator('.heading-editor canvas').count(), 1)
  assert.deepEqual(errors, [], 'Browser errors')
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(
      {
        status: 'passed',
        url,
        checks:
          'Real block fixture, six heading levels, promotion boundaries, paragraph variants, render font/line height, content preservation, Undo/Redo, native edit, SDK selection, missing marker, empty/reset, snapshot round trip, theme, narrow, remount, browser errors',
      },
      null,
      2,
    ),
  )
  console.log('PASS modern paragraph and heading blocks')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      {
        error: String(error.stack),
        errors,
        readback: await page
          .locator('.heading-demo output')
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
