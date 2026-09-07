/* eslint-disable no-await-in-loop -- Browser actions and selected-demo compilation must remain sequential. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const slugs = process.argv.slice(2)
const selected = slugs.length ? slugs : ['filter-builder', 'multi-field-sort', 'view-field-layout']
for (const slug of selected) assert.ok(['filter-builder', 'multi-field-sort', 'view-field-layout'].includes(slug))
const baseURL = process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'
const directory = path.resolve('test-results/bases-features')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch({ executablePath: chromium.executablePath() })
const results = []
const allIds = (count) => Array.from({ length: count }, (_, index) => 'r' + String(index + 1).padStart(2, '0'))

try {
  for (const slug of selected) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
    try {
      const errors = []
      // Observe actual canvas text calls without changing SDK output or exposing app internals.
      await page.addInitScript(() => {
        globalThis.__basePaint = []
        const fillText = CanvasRenderingContext2D.prototype.fillText
        CanvasRenderingContext2D.prototype.fillText = function (...args) {
          globalThis.__basePaint.push({ text: String(args[0]), x: args[1], y: args[2] })
          return Reflect.apply(fillText, this, args)
        }
      })
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      await page.goto(`${baseURL}/en-US/playground/bases/${slug}`, { waitUntil: 'domcontentloaded', timeout: 300000 })
      await page.locator('.base-feature[data-ready="true"]').waitFor({ state: 'attached', timeout: 90000 })
      await page.locator('.base-feature-editor canvas').first().waitFor({ state: 'visible' })
      const assertOneCanvas = async () =>
        assert.equal(
          await page.locator('.base-feature-editor [data-u-comp="render-canvas"]').count(),
          1,
          'Only one active canvas: a disposed Strict Mode mount must not cover the current renderer',
        )
      await assertOneCanvas()
      const controls = page.locator('.base-feature-controls')
      const output = page.locator('.base-feature output')
      const model = async () => JSON.parse(await output.textContent())
      const idle = () =>
        page.waitForFunction(() => document.querySelector('.base-feature-controls')?.disabled === false)
      const clearPaint = () =>
        page.evaluate(() => {
          globalThis.__basePaint = []
        })
      const click = async (name) => {
        await clearPaint()
        await controls.getByRole('button', { name, exact: true }).click()
        await idle()
      }
      const choose = async (variant) => {
        await clearPaint()
        await controls.getByRole('combobox', { name: 'Variant', exact: true }).selectOption(variant)
        await idle()
        assert.equal(
          await page.locator('.base-feature [role="alert"]').isVisible(),
          false,
          await page.locator('.base-feature [role="alert"]').textContent(),
        )
        return model()
      }
      const capture = async (variant) => {
        await page.evaluate(async () => {
          await document.fonts.ready
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        })
        await page.locator('.base-feature').screenshot({ path: path.join(directory, `${slug}-${variant}.png`) })
      }
      const painted = async (text) => {
        await page.waitForFunction((value) => globalThis.__basePaint.some((entry) => entry.text === value), text)
        return page.evaluate((value) => globalThis.__basePaint.findLast((entry) => entry.text === value), text)
      }
      const baseline = await model()
      assert.deepEqual(baseline.visibleRecordIds, allIds(slug === 'view-field-layout' ? 8 : 10))
      await capture('baseline')

      if (slug === 'filter-builder') {
        assert.deepEqual((await choose('and')).visibleRecordIds, ['r01', 'r05', 'r09'])
        await click('Qualify Fjord budget')
        assert.deepEqual((await model()).visibleRecordIds, ['r01', 'r05', 'r06', 'r09'])
        assert.equal((await model()).sourceValues.find((record) => record.id === 'r06').values.budget, 140000)
        await capture('and-after-edit')
        await painted('Fjord Robotics')
        await painted('140,000.00')
        assert.deepEqual((await choose('or')).visibleRecordIds, ['r02', 'r04', 'r07', 'r10'])
        assert.deepEqual((await choose('blank')).visibleRecordIds, ['r03', 'r06'])
        assert.deepEqual((await choose('contains')).visibleRecordIds, ['r02'])
        assert.deepEqual((await choose('empty')).visibleRecordIds, [])
        assert.deepEqual((await model()).sourceRecordIds, allIds(10), 'Filtering never deletes source records')
        await capture('empty')
        await painted('0 records')
        await controls.getByRole('spinbutton', { name: 'Minimum budget', exact: true }).fill('180000')
        await click('Apply budget threshold')
        assert.deepEqual((await model()).visibleRecordIds, ['r04', 'r10'])
        const valid = await model()
        await controls.getByRole('spinbutton', { name: 'Minimum budget', exact: true }).fill('')
        await click('Apply budget threshold')
        assert.match(await page.locator('.base-feature [role="alert"]').innerText(), /non-negative budget/)
        assert.deepEqual(await model(), valid, 'Invalid threshold leaves the model intact')
      } else if (slug === 'multi-field-sort') {
        const high = await choose('score-desc')
        const scored = high.visibleRows.filter((row) => row.values.score !== null)
        assert.deepEqual(
          scored.map((row) => row.recordId),
          ['r02', 'r07', 'r10', 'r01', 'r03', 'r04', 'r08', 'r05', 'r09'],
        )
        assert.equal(high.visibleRecordIds.length, 10, 'Null-score record must remain present')
        assert.deepEqual(high.sourceRecordIds, baseline.sourceRecordIds)
        await click('Raise Meridian score to 98')
        assert.equal((await model()).visibleRows.find((row) => row.values.score !== null).recordId, 'r01')
        await capture('score-after-edit')
        const low = (await choose('score-asc')).visibleRows.filter((row) => row.values.score !== null)
        assert.deepEqual(
          low.map((row) => row.recordId),
          ['r09', 'r05', 'r08', 'r03', 'r04', 'r02', 'r07', 'r10', 'r01'],
        )
        const grouped = await choose('zone-score')
        assert.deepEqual(
          grouped.visibleRows.filter((row) => row.values.zone === 'East').map((row) => row.recordId),
          ['r02', 'r07', 'r10', 'r05'],
        )
        assert.deepEqual(
          grouped.visibleRows.filter((row) => row.values.zone === 'West').map((row) => row.recordId),
          ['r01', 'r03', 'r04', 'r09'],
        )
        const dates = (await choose('date-score')).visibleRows.filter((row) => row.values.next !== null)
        assert.deepEqual(
          dates.map((row) => row.recordId),
          ['r03', 'r04', 'r07', 'r10', 'r02', 'r08', 'r01', 'r06', 'r09'],
        )
        assert.deepEqual((await choose('name-desc')).visibleRecordIds, [
          'r01',
          'r10',
          'r09',
          'r08',
          'r07',
          'r06',
          'r05',
          'r04',
          'r03',
          'r02',
        ])
        assert.deepEqual((await choose('original')).visibleRecordIds, baseline.sourceRecordIds)
      } else {
        assert.deepEqual(baseline.visibleFieldIds, ['sample', 'habitat', 'temperature', 'ph', 'notes', 'batch'])
        const review = await choose('review')
        assert.deepEqual(review.visibleFieldIds, ['sample', 'notes', 'habitat', 'temperature', 'ph', 'batch'])
        assert.equal(review.config.rowHeight, 'extraTall')
        assert.equal(review.config.frozenFieldCount, 2)
        assert.equal(review.fieldWidths.sample, 280)
        assert.deepEqual(review.reference, baseline.reference, 'Changing working view must not modify reference view')
        await capture('notes-review')
        const noteHeader = await painted('Field notes')
        const habitatHeader = await painted('Habitat')
        assert.ok(noteHeader.x < habitatHeader.x, 'The canvas, not just the projection, moves notes before habitat')
        await controls.getByRole('combobox', { name: 'Active view', exact: true }).selectOption('reference')
        await idle()
        assert.deepEqual((await model()).visibleFieldIds, baseline.visibleFieldIds)
        assert.equal((await model()).config.rowHeight, 'medium')
        await controls.getByRole('combobox', { name: 'Active view', exact: true }).selectOption('working')
        await idle()
        assert.deepEqual(await model(), review)
        assert.deepEqual((await choose('compact')).visibleFieldIds, ['sample', 'habitat', 'temperature', 'ph'])
        assert.deepEqual((await choose('lab')).visibleFieldIds, ['sample', 'batch', 'ph', 'temperature'])
        await click('Toggle field notes')
        assert.ok((await model()).visibleFieldIds.includes('notes'))
        await controls.getByRole('spinbutton', { name: 'Sample width', exact: true }).fill('360')
        await click('Apply width')
        const valid = await model()
        assert.equal(valid.fieldWidths.sample, 360)
        await controls.getByRole('spinbutton', { name: 'Sample width', exact: true }).fill('20')
        await click('Apply width')
        assert.match(await page.locator('.base-feature [role="alert"]').innerText(), /80 and 640/)
        assert.deepEqual(await model(), valid)
        assert.deepEqual(valid.tableFieldOrder, baseline.tableFieldOrder)
        assert.deepEqual(valid.sourceValues, baseline.sourceValues, 'View changes must preserve all cell values')
      }

      await click('Reset')
      assert.deepEqual(await model(), baseline, `${slug}: exact reset`)
      await assertOneCanvas()
      await click('Reset')
      assert.deepEqual(await model(), baseline, `${slug}: repeat reset`)
      await assertOneCanvas()
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.locator('.base-feature[data-ready="true"]').waitFor({ state: 'attached' })
      assert.deepEqual(await model(), baseline, `${slug}: clean remount`)
      await assertOneCanvas()
      assert.deepEqual(errors, [], `${slug}: browser errors`)
      results.push({
        slug,
        passed: true,
        checks:
          'variants, SDK projection, source preservation, invalid input, reset twice, remount, single canvas, sampled canvas text, console',
      })
      console.log(`PASS ${slug}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      results.push({ slug, passed: false, error: message })
      console.error(`FAIL ${slug}: ${message}`)
      process.exitCode = 1
      await page.screenshot({ path: path.join(directory, `${slug}-failure.png`) }).catch(() => {})
    } finally {
      await page.close()
    }
  }
  await fs.writeFile(path.join(directory, 'results.json'), JSON.stringify(results, null, 2))
} finally {
  await browser.close()
}
