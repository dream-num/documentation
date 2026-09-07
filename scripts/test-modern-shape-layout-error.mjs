/* eslint-disable no-await-in-loop -- Check the same live document before/after viewport recovery. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/docs-modern/shapes-in-documents'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-shape-layout-error')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1600, height: 1400 } })
const errors = [],
  results = []
page.on('pageerror', (error) => errors.push(error.message))
const shape = (state) => state.shapes.find((item) => item.id === 'aster-decision-badge')
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const root = page.locator('.shapes-demo')
  await root.locator('[data-action=inspect]').waitFor()
  await page.locator('.shapes-demo[data-ready=true]').waitFor({ timeout: 90000 })
  const read = async () => JSON.parse(await root.locator('output').textContent())
  const click = async (name) => {
    await root.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.shapes-demo fieldset')?.disabled === false)
    return read()
  }
  for (const withShapes of [true, false]) {
    await page.setViewportSize({ width: 1600, height: 1400 })
    await page.waitForTimeout(300)
    await click('Reset')
    if (!withShapes) {
      for (const id of ['aster-decision-badge', 'aster-review-window']) {
        await root.getByRole('combobox', { name: 'Target', exact: true }).selectOption(id)
        await click('Delete shape')
      }
    }
    const baseline = await click('Inspect')
    assert.equal(baseline.shapes.length, withShapes ? 2 : 0)
    await page.setViewportSize({ width: 520, height: 1400 })
    await page.waitForTimeout(300)
    const first = await click('Inspect')
    assert.equal(first.layoutFailure, null)
    assert.equal(first.pageWidth, first.layout[0].width)
    await page.setViewportSize({ width: 390, height: 1400 })
    await root.getByRole('alert').waitFor({ state: 'visible' })
    for (let attempt = 0; attempt < 3; attempt++) {
      const failed = await click('Inspect')
      assert.match(await root.getByRole('alert').textContent(), /SDK layout failed:.*breakType/)
      assert.match(failed.layoutFailure, /breakType/)
      assert.equal(failed.unitId, baseline.unitId)
      assert.ok(failed.pageWidth < first.pageWidth)
      assert.equal(failed.layout[0].width, first.layout[0].width)
      assert.ok(failed.modelTableWidth < failed.layout[0].tables[0].width)
    }
    const failure = await read()
    await root.screenshot({ path: path.join(directory, withShapes ? 'visible-error.png' : 'error-without-shapes.png') })
    await page.setViewportSize({ width: 1600, height: 1400 })
    await page.waitForTimeout(300)
    const recovered = await click('Inspect')
    assert.equal(recovered.layoutFailure, null)
    assert.equal(await root.getByRole('alert').isVisible(), false)
    assert.equal(recovered.pageWidth, recovered.layout[0].width)
    assert.equal(recovered.unitId, baseline.unitId)
    assert.deepEqual(recovered.paragraphs, baseline.paragraphs)
    assert.deepEqual(recovered.tables, baseline.tables)
    if (withShapes) assert.deepEqual(shape(recovered).transform, shape(baseline).transform)
    results.push({
      withShapes,
      modelWidth: failure.pageWidth,
      failedLayoutWidth: failure.layout[0].width,
      recoveredWidth: recovered.pageWidth,
    })
  }
  // A direct narrow entry must expose recovery controls, not remain in "Starting" state.
  await page.setViewportSize({ width: 390, height: 1400 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.shapes-demo[data-ready=true]').waitFor({ timeout: 90000 })
  await page.waitForFunction(() => document.querySelector('.shapes-demo fieldset')?.disabled === false)
  const narrowEntry = await click('Inspect')
  assert.match(narrowEntry.layoutFailure, /breakType/)
  const empty = await click('Empty document')
  assert.equal(empty.layoutFailure, null)
  assert.equal(empty.shapes.length, 0)
  assert.equal(empty.pageWidth, empty.layout[0].width)
  await page.setViewportSize({ width: 1600, height: 1400 })
  await page.waitForTimeout(300)
  const reset = await click('Reset')
  assert.equal(reset.layoutFailure, null)
  assert.equal(reset.shapes.length, 2)
  results.push({ narrowEntry: 'visible SDK error with enabled controls', emptyRecovery: 'passed', reset: 'passed' })
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: 'passed-error-handling-only', url, results, errors }, null, 2),
  )
  console.log('PASS persistent layout error and same-unit recovery, with/without shapes; SDK reflow remains broken')
} catch (cause) {
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  throw cause
} finally {
  await browser.close()
}
