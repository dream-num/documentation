/* eslint-disable no-await-in-loop -- Keep browser interactions ordered and compile only one selected demo at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

// Use an already-running dev server. Only these selected routes are requested.
const baseURL = process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'
const cases = process.argv.slice(2)
const selected = cases.length ? cases : ['page-setup', 'paragraph-typesetting', 'pagination-rules']
for (const slug of selected) assert.ok(['page-setup', 'paragraph-typesetting', 'pagination-rules'].includes(slug))
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/traditional-features')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch({ executablePath: chromium.executablePath() })
const results = []
const rules = (value) =>
  value.paragraphs.map(({ style }) => ({
    keepNext: style.keepNext,
    keepLines: style.keepLines,
    widowControl: style.widowControl,
    pageBreakBefore: style.pageBreakBefore,
  }))

try {
  for (const slug of selected) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    const url = `${baseURL}/en-US/playground/docs-traditional/${slug}`
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
    const output = page.getByRole('status', { name: 'SDK readback' })
    await output.waitFor({ timeout: 120000 })
    const model = async () => JSON.parse(await output.textContent())
    const click = (name) => page.getByRole('button', { name, exact: true }).click()
    const choose = async (variant) => {
      await page.getByRole('combobox', { name: 'Variant', exact: true }).selectOption(variant)
      assert.equal(
        await page.locator('.docs-feature [role="alert"]').isVisible(),
        false,
        await page.locator('.docs-feature [role="alert"]').textContent(),
      )
      return model()
    }
    const capture = async (name) => {
      await page.evaluate(async () => {
        await document.fonts.ready
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      })
      await page.locator('.docs-feature').screenshot({ path: path.join(directory, `${slug}-${name}.png`) })
    }
    const baseline = await model()
    await page.locator('.docs-feature-editor canvas').first().waitFor({ state: 'visible', timeout: 30000 })
    await capture('baseline')

    if (slug === 'page-setup') {
      assert.deepEqual(baseline.pageSize, { width: 794, height: 1123 })
      assert.deepEqual(baseline.contentSize, { width: 650, height: 979 })
      const landscape = await choose('landscape')
      assert.deepEqual(landscape.pageSize, { width: 1123, height: 794 })
      assert.equal(landscape.pageOrient, 1)
      assert.equal(landscape.text, baseline.text)
      await capture('landscape')
      await click('Undo')
      assert.deepEqual(await model(), baseline)
      assert.equal(await page.getByRole('combobox', { name: 'Variant', exact: true }).inputValue(), 'a4')
      await click('Redo')
      assert.deepEqual(await model(), landscape)
      assert.deepEqual((await choose('letter')).pageSize, { width: 816, height: 1056 })
      assert.deepEqual((await choose('custom')).pageSize, { width: 560, height: 720 })
      await choose('a4')
      for (const [side, value] of Object.entries({ Top: '50', Right: '60', Bottom: '70', Left: '80' })) {
        await page.getByRole('spinbutton', { name: `${side} margin`, exact: true }).fill(value)
      }
      await click('Apply margins')
      const custom = await model()
      assert.deepEqual(custom.margins, { top: 50, right: 60, bottom: 70, left: 80 })
      assert.deepEqual(custom.contentSize, { width: 654, height: 1003 })
      await page.getByRole('spinbutton', { name: 'Left margin', exact: true }).fill('500')
      await page.getByRole('spinbutton', { name: 'Right margin', exact: true }).fill('500')
      await click('Apply margins')
      assert.match(await page.locator('.docs-feature [role="alert"]').innerText(), /positive content area/)
      assert.deepEqual(await model(), custom, 'Invalid margins must not mutate the document')
    } else if (slug === 'paragraph-typesetting') {
      assert.equal(baseline.style.lineSpacing, 1)
      const book = await choose('book')
      assert.equal(book.style.lineSpacing, 1.4)
      assert.equal(book.style.indentFirstLine.v, 28)
      assert.equal(book.style.spaceAbove.v, 8)
      assert.equal(book.style.spaceBelow.v, 14)
      assert.equal(book.text, baseline.text)
      assert.equal(book.comparison, baseline.comparison)
      await capture('book')
      await click('Undo')
      assert.deepEqual(await model(), baseline)
      assert.equal(await page.getByRole('combobox', { name: 'Variant', exact: true }).inputValue(), 'compact')
      await click('Redo')
      assert.deepEqual(await model(), book)
      const hanging = await choose('hanging')
      assert.equal(hanging.style.hanging.v, 36)
      assert.equal(hanging.style.indentStart.v, 36)
      assert.equal(hanging.style.indentFirstLine.v, 0, 'A prior variant must not leak first-line indent')
      await capture('hanging')
      const double = await choose('double')
      assert.equal(double.style.lineSpacing, 2)
      assert.equal(double.style.hanging.v, 0)
      assert.equal(double.style.indentEnd.v, 24)
      assert.deepEqual(await choose('compact'), baseline)
    } else {
      const baseRules = rules(baseline)
      assert.ok(baseRules.every((rule) => Object.values(rule).every((value) => value === 0)))
      const heading = await choose('heading')
      assert.equal(rules(heading)[0].keepNext, 1)
      assert.equal(rules(heading)[1].keepNext, 0, 'The body terminates the keep chain')
      await capture('keep-heading')
      const together = rules(await choose('together'))
      assert.equal(together[0].keepNext, 0)
      assert.equal(together[1].keepLines, 1)
      assert.equal(together[2].keepLines, 1)
      const widow = rules(await choose('widow'))
      assert.equal(widow[1].widowControl, 1)
      assert.equal(widow[1].keepLines, 0)
      const forced = await choose('break')
      assert.equal(rules(forced)[0].pageBreakBefore, 1)
      assert.equal(rules(forced)[2].widowControl, 0)
      assert.deepEqual(
        forced.paragraphs.map((p) => p.text),
        baseline.paragraphs.map((p) => p.text),
      )
      await capture('page-break')
      // Variant application is three commands; the host documents command-level Undo.
      await click('Undo')
      await click('Redo')
      assert.deepEqual(await model(), forced)
      assert.deepEqual(await choose('natural'), baseline)
    }

    await click('Reset')
    assert.deepEqual(await model(), baseline, `${slug}: reset must restore the exact model readback`)
    assert.equal(await page.locator('.docs-feature [role="alert"]').isVisible(), false)
    await click('Reset')
    assert.deepEqual(await model(), baseline, `${slug}: reset must be repeatable`)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await output.waitFor()
    assert.deepEqual(await model(), baseline, `${slug}: remount must start from the baseline`)
    assert.deepEqual(errors, [], `${slug}: browser errors`)
    results.push({
      slug,
      checks: 'variants, model readback, undo/redo, reset twice, remount, canvas present, browser errors',
      passed: true,
    })
    console.log(`PASS ${slug}`)
    await page.close()
  }
  await fs.writeFile(path.join(directory, 'results.json'), JSON.stringify(results, null, 2))
} finally {
  await browser.close()
}
