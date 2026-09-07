/* eslint-disable no-await-in-loop -- Exercise one real SDK document in history order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { SAMPLES } from '../showcase/docs-modern/code-blocks/code/data.ts'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-code')
const url =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/docs-modern/code-blocks`
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
// Focus one strict regression while observing the earlier disclosed SDK defects.
const strictCheck = process.env.SHOWCASE_CODE_CHECK
assert.ok(!strictCheck || ['text', 'history', 'wrap', 'numbers', 'tabs', 'native'].includes(strictCheck))
const observing = (check) => observe && strictCheck !== check
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1250 } })
page.setDefaultTimeout(15000)
await page.emulateMedia({ colorScheme: 'light' })
await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin })
const errors = []
page.on('pageerror', (e) => errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
await page.addInitScript(() => {
  window.codePaint = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    if (this.font.includes('monospace') && window.codePaint.length < 60000)
      window.codePaint.push({ text: String(args[0]), x: args[1], y: args[2], font: this.font, color: this.fillStyle })
    return original.apply(this, args)
  }
})
const content = (s) => s.paragraphs.map((p) => p.text)
const comparison = (s) => ({ text: s.comparison.text, config: s.comparison.config })
const inset = (s) => s.geometry.find((p) => p.text.startsWith('\t')).firstTextLeft
const semantic = (s) => ({
  primary: s.primary,
  sourceText: s.sourceText,
  comparison: s.comparison,
  paragraphs: s.paragraphs,
  blocks: s.blocks,
  textRuns: s.textRuns,
  links: s.links,
})
const expected = SAMPLES[0].lines.join('\n')
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const demo = page.locator('.code-demo')
  const ready = () => page.locator('.code-demo[data-ready="true"]').waitFor({ timeout: 90000 })
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
        window.codePaint = []
      })
    await controls.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.code-demo fieldset')?.disabled === false)
    await settle()
    assert.equal(
      await demo.locator('[role="alert"]').isVisible(),
      expectedError,
      await demo.locator('[role="alert"]').textContent(),
    )
    return read()
  }
  const choose = (name, value) => controls.getByRole('combobox', { name, exact: true }).selectOption(value)
  const rows = async () => {
    // Canvas baselines differ by floating-point roundoff between render passes.
    const calls = await page.evaluate(() => window.codePaint)
    for (const call of calls) {
      call.x = Math.round(call.x * 1000) / 1000
      call.y = Math.round(call.y * 1000) / 1000
    }
    const glyphs = [
      ...new Map(calls.filter((c) => !/^[\r\n]+$/.test(c.text)).map((c) => [`${c.x}:${c.y}:${c.text}`, c])).values(),
    ]
    const ys = [...new Set(glyphs.map((c) => c.y))].toSorted((a, b) => a - b)
    return ys.map((y) => {
      const row = glyphs.filter((c) => c.y === y).toSorted((a, b) => a.x - b.x)
      return { y, text: row.map((c) => c.text).join(''), colors: [...new Set(row.map((c) => c.color))], glyphs: row }
    })
  }
  const capture = async (name) => {
    await settle()
    await demo.locator('details').evaluate((el) => {
      el.open = false
    })
    await demo.screenshot({ path: path.join(directory, name + '.png') })
  }
  const baseline = await click('Inspect')
  assert.equal(baseline.sourceText, expected)
  if (observing('text'))
    assert.equal(baseline.primary.text, expected.replaceAll('\n', ''), 'Observe disclosed Facade newline loss')
  else assert.equal(baseline.primary.text, expected, 'Facade text must preserve newlines')
  assert.equal(baseline.geometry.length, 8)
  assert.deepEqual(baseline.allIds, ['beacon-ingest', 'beacon-query'])
  assert.deepEqual(baseline.queryIds, ['beacon-ingest'])
  assert.equal(baseline.blocks.length, 4)
  assert.ok(baseline.geometry.every((p) => p.font.fontFamily === 'monospace'))
  assert.ok(baseline.geometry.at(-1).lineTops.length > 1)
  const typeRow = (await rows()).find((r) => r.text.includes('type Reading'))
  assert.ok(typeRow && typeRow.colors.length > 1, 'Actual TypeScript syntax glyph paint')
  await capture('baseline')
  await choose('Language', 'plaintext')
  const plainSyntax = await click('Apply language')
  assert.equal(plainSyntax.primary.config.language, 'plaintext')
  assert.equal(plainSyntax.sourceText, expected)
  assert.deepEqual(comparison(plainSyntax), comparison(baseline))
  const plainRow = (await rows()).find((r) => r.text.includes('type Reading'))
  assert.ok(plainRow)
  assert.equal(plainRow.colors.length, 1, 'Plaintext removes syntax colors from actual glyphs')
  if (observing('history')) {
    assert.deepEqual(
      semantic(await click('Undo', true)),
      semantic(plainSyntax),
      'Observe failed language Undo retaining plaintext',
    )
    await click('Reset')
  } else {
    assert.deepEqual(semantic(await click('Undo')), semantic(baseline))
    assert.deepEqual(semantic(await click('Redo')), semantic(plainSyntax))
  }
  await choose('Language', 'typescript')
  await click('Apply language')
  const wrap = controls.getByRole('checkbox', { name: 'Wrap lines', exact: true })
  const numbers = controls.getByRole('checkbox', { name: 'Line numbers', exact: true })
  const tabs = controls.getByRole('spinbutton', { name: 'Tab size', exact: true })
  await wrap.uncheck()
  const noWrap = await click('Apply layout')
  assert.equal(noWrap.primary.config.wrap, false)
  if (observing('wrap'))
    assert.deepEqual(noWrap.geometry, baseline.geometry, 'Observe unchanged geometry after wrap=false')
  else assert.equal(noWrap.geometry.at(-1).lineTops.length, 1, 'Disabling wrap must render one long line')
  await numbers.check()
  const numbered = await click('Apply layout')
  assert.equal(numbered.primary.config.showLineNumbers, true)
  const first = (await rows()).find((r) => r.text.includes('// Beacon batch'))
  assert.ok(first)
  if (observing('numbers')) assert.ok(!/^1\s*\/\//.test(first.text), 'Observe absent line-number gutter')
  else assert.match(first.text, /^1\s*\/\//, 'First code line must show its line number')
  await tabs.fill('2')
  const two = await click('Apply layout')
  await tabs.fill('8')
  const eight = await click('Apply layout')
  assert.equal(eight.primary.config.tabSize, 8)
  if (observing('tabs')) assert.equal(inset(eight), inset(two), 'Observe unchanged tab rendering')
  else assert.ok(inset(eight) > inset(two), 'A larger tab size must increase indentation')
  assert.equal(eight.sourceText, expected)
  assert.deepEqual(comparison(eight), comparison(baseline))
  for (const value of ['0', '9', '2.5', '']) {
    await tabs.fill(value)
    await click('Apply layout', true)
    assert.deepEqual(semantic(await read()), semantic(eight))
  }
  await click('Reset')
  const copy = async (wanted) => {
    const before = await read()
    await click('Copy code')
    assert.equal(
      (await page.evaluate(() => navigator.clipboard.readText())).replaceAll('\r\n', '\n'),
      wanted,
      'Real clipboard preserves SDK snapshot text (Windows clipboard may normalize LF to CRLF)',
    )
    assert.deepEqual(semantic(await read()), semantic(before))
  }
  await copy(expected)
  const appended = await click('Append blank line')
  assert.equal(appended.sourceText, expected + '\n')
  assert.ok(appended.primary.endIndex > baseline.primary.endIndex)
  assert.equal(appended.primary.blockId, baseline.primary.blockId)
  await copy(appended.sourceText)
  assert.deepEqual(semantic(await click('Reload snapshot')), semantic(appended))
  const unwrapped = await click('Convert to plain text')
  assert.equal(unwrapped.primary, null)
  assert.deepEqual(content(unwrapped), content(appended))
  const rewrapped = await click('Wrap example as code')
  assert.equal(rewrapped.sourceText, appended.sourceText)
  assert.deepEqual(semantic(await click('Wrap example as code')), semantic(rewrapped))
  await copy(rewrapped.sourceText)
  const removed = await click('Delete code and text')
  assert.equal(removed.primary, null)
  assert.ok(content(removed).every((t) => !t.includes('Beacon batch:')))
  assert.deepEqual(comparison(removed), comparison(baseline))
  const restored = await click('Undo')
  assert.equal(restored.sourceText, rewrapped.sourceText)
  await click('Try missing ID', true)
  assert.deepEqual(semantic(await read()), semantic(restored))
  for (const sample of SAMPLES) {
    await choose('Sample', sample.id)
    const loaded = await click('Load sample')
    assert.equal(loaded.sourceText, sample.lines.join('\n'))
    assert.equal(loaded.primary.config.language, sample.id)
    assert.deepEqual(comparison(loaded), comparison(baseline))
    await copy(loaded.sourceText)
    assert.deepEqual(semantic(await click('Reload snapshot')), semantic(loaded))
    await capture(sample.id)
  }
  await click('Reset')
  await click('Select code text')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.type(' native', { delay: 60 })
  const native = await click('Inspect')
  assert.equal(native.sourceText, expected + ' native', 'Native text input updates the real SDK document')
  await copy(native.sourceText)
  await click('Select code text')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.type('/')
  const slash = await click('Inspect')
  if (observing('native'))
    assert.equal(slash.sourceText, native.sourceText, 'Observe slash keystroke missing from native code input')
  else assert.equal(slash.sourceText, native.sourceText + '/', 'Native code input must preserve slash characters')
  const empty = await click('Empty document')
  assert.deepEqual(empty.allIds, [])
  assert.equal(empty.paragraphs.length, 1)
  await click('Copy code', true)
  await click('Wrap example as code', true)
  assert.deepEqual(semantic(await click('Reset')), semantic(baseline))
  const cdp = await page.context().newCDPSession(page)
  await page.context().clearPermissions()
  await cdp.send('Browser.setPermission', {
    permission: { name: 'clipboard-write', allowWithoutSanitization: false },
    setting: 'denied',
    origin: new URL(url).origin,
  })
  await click('Copy code', true)
  assert.deepEqual(semantic(await read()), semantic(baseline))
  await cdp.detach()
  if (!process.env.SHOWCASE_DEMO_URL) {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.locator('.code-demo[data-theme="dark"][data-ready="true"]').waitFor()
    await click('Inspect')
    await capture('dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await page.locator('.code-demo[data-theme="light"][data-ready="true"]').waitFor()
  }
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok((await click('Reset')).zoomRatio < 1)
  assert.ok(await demo.evaluate((el) => el.scrollWidth <= el.clientWidth + 1))
  await demo.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await capture('narrow')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready()
  assert.equal((await click('Inspect')).sourceText, expected)
  assert.equal(await demo.locator('.code-editor canvas').count(), 1)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(
      {
        status: observe ? 'passed-with-known-sdk-defects' : 'passed',
        url,
        knownDefects: observe
          ? [
              'getText drops newlines; strict test-docs-code-text-sdk.mjs fails.',
              'Language Undo returns false and retains the new language.',
              'Wrap, line numbers, and tab size update configuration without the expected rendering change.',
              'Native slash keystrokes do not insert slash characters.',
            ]
          : [],
        checks:
          'Four distinct samples; syntax/monospace canvas paint; observed language Undo failure; exact snapshot and real clipboard (OS newline normalization); blank lines, tabs and Unicode; native input with disclosed slash loss; unwrap/rewrap/delete; comparison isolation; permission denial; empty/reset; theme/narrow/remount; browser errors',
      },
      null,
      2,
    ),
  )
  console.log(
    observe
      ? 'PASS observed Code interactions; strict newline and layout acceptance remain failing'
      : 'PASS modern Code capability',
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
          .locator('.code-demo output')
          .textContent({ timeout: 1000 })
          .catch(() => null),
        paint: await page.evaluate(() => window.codePaint?.slice(-500)).catch(() => null),
      },
      null,
      2,
    ),
  )
  throw error
} finally {
  await browser.close()
}
