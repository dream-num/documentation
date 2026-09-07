/* eslint-disable no-await-in-loop -- Ordered checks exercise one real presentation. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { createData } from '../showcase/slides/save-restore-deck/code/data.ts'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/slides/save-restore-deck'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-roundtrip')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const errors = [],
  failures = [],
  results = []
const content = ({ id: _id, ...snapshot }) => snapshot
function assertPageVisible(state) {
  const bounds = state.pageBounds
  assert.ok(bounds, 'Inspect actual native page rectangle and viewport, not just model dimensions')
  assert.ok(bounds.width >= 220, 'A contained but microscopic native slide is not usable: ' + JSON.stringify(bounds))
  assert.ok(
    bounds.left >= -1 &&
      bounds.top >= -1 &&
      bounds.left + bounds.width <= bounds.canvasWidth + 1 &&
      bounds.top + bounds.height <= bounds.canvasHeight + 1,
    JSON.stringify(bounds),
  )
}
const check = (name, action) => {
  try {
    action()
  } catch (error) {
    failures.push({ name, message: error.message })
  }
}
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
await page.addInitScript(() => {
  globalThis.__slidePaint = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    globalThis.__slidePaint.push(String(args[0]))
    return Reflect.apply(fill, this, args)
  }
})
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  const root = page.locator('.deck-roundtrip')
  await page.locator('.deck-roundtrip[data-ready=true]').waitFor({ timeout: 120000 })
  const idle = () => page.waitForFunction(() => document.querySelector('.deck-roundtrip fieldset')?.disabled === false)
  const read = async () => JSON.parse(await root.locator('output').textContent())
  const click = async (name, error) => {
    await root.getByRole('button', { name, exact: true }).click()
    await idle()
    if (error) assert.match(await root.locator('[role=alert]').textContent(), error)
    else
      assert.equal(
        await root.locator('[role=alert]').isVisible(),
        false,
        await root.locator('[role=alert]').textContent(),
      )
    return read()
  }
  const choose = async (id) => {
    await root.getByRole('combobox', { name: 'Fixture', exact: true }).selectOption(id)
    return click('Load fixture')
  }
  const baseline = await click('Inspect')
  await fs.writeFile(path.join(directory, 'baseline.json'), JSON.stringify(baseline, null, 2))
  assert.equal(baseline.snapshot.slideOrder.length, 8)
  assert.deepEqual(baseline.snapshot.slideOrder, createData().slideOrder)
  assert.equal(baseline.savedChecksum, null)
  assertPageVisible(baseline)
  await click('Restore saved', /Save a snapshot first/)
  await click('Previous', /No slide in that direction/)
  for (const id of baseline.snapshot.slideOrder) {
    await root.getByRole('combobox', { name: 'Slide', exact: true }).selectOption(id)
    await page.evaluate(() => {
      globalThis.__slidePaint = []
    })
    const state = await click('Show slide')
    assert.equal(state.activeSlideId, id)
    assert.equal(state.snapshot.activeSlideId, id)
    assertPageVisible(state)
    assert.equal(state.snapshot.slides[id].speakerNotes, createData().slides[id].speakerNotes)
    assert.equal(
      await root.locator('.deck-editor textarea[aria-label="Speaker notes"]').inputValue(),
      createData().slides[id].speakerNotes,
    )
    await page.waitForTimeout(350)
    const paint = await page.evaluate(() => globalThis.__slidePaint.join(''))
    await fs.writeFile(path.join(directory, id + '-paint.txt'), paint)
    await root.screenshot({ path: path.join(directory, id + '.png') })
    results.push({ slide: id, paintedCharacters: paint.length })
    check('native title paint: ' + id, () =>
      assert.ok(paint.replace(/\s/g, '').includes(createData().slides[id].name.replace(/\s/g, ''))),
    )
    for (const element of Object.values(createData().slides[id].elements))
      if (element.text)
        check('native body paint: ' + element.id, () =>
          assert.ok(paint.replace(/\s/g, '').includes(element.text.replace(/\s/g, ''))),
        )
  }
  await click('Next', /No slide in that direction/)
  await root.getByRole('combobox', { name: 'Slide', exact: true }).selectOption('counts')
  await click('Show slide')
  await root.getByRole('textbox', { name: 'Slide title', exact: true }).fill('Tern / Validated sample counts')
  await click('Apply title')
  await root.locator('fieldset').getByRole('textbox', { name: 'Speaker notes', exact: true }).fill('')
  // The SDK clears the optional property and hides its inline editor when notes are absent.
  assert.equal((await click('Apply notes')).snapshot.slides.counts.speakerNotes, undefined)
  assert.equal(await root.locator('.deck-editor textarea[aria-label="Speaker notes"]').count(), 0)
  await root
    .locator('fieldset')
    .getByRole('textbox', { name: 'Speaker notes', exact: true })
    .fill('126 accepted samples. Check paired labels before handoff.')
  await click('Apply notes')
  const saved = await click('Save snapshot')
  assert.equal(saved.matchesSaved, true)
  assert.equal(saved.activeSlideId, 'counts')
  assert.equal(saved.snapshot.slides.counts.elements['counts-title'].text, 'Tern / Validated sample counts')
  assert.equal(saved.snapshot.slides.counts.elements['counts-title'].textData.body.textRuns[0].ts.fs, 42)
  assert.equal(
    await root.locator('.deck-editor textarea[aria-label="Speaker notes"]').inputValue(),
    '126 accepted samples. Check paired labels before handoff.',
  )
  assert.equal(saved.snapshot.slides.counts.speakerNotes, '126 accepted samples. Check paired labels before handoff.')
  const download = page.waitForEvent('download')
  await click('Download saved JSON')
  const file = await download
  await file.saveAs(path.join(directory, file.suggestedFilename()))
  assert.deepEqual(JSON.parse(await fs.readFile(await file.path(), 'utf8')), saved.snapshot)
  await click('Next')
  await root.getByRole('textbox', { name: 'Slide title', exact: true }).fill('Unsaved alternate observation')
  let state = await click('Apply title')
  assert.equal(state.matchesSaved, false)
  const beforeInvalid = state.checksum
  state = await click('Try invalid restore', /Saved active slide is absent/)
  assert.equal(state.checksum, beforeInvalid)
  await page.evaluate(() => {
    globalThis.__slidePaint = []
  })
  state = await click('Restore saved')
  check('snapshot restore checksum', () => assert.equal(state.matchesSaved, true))
  check('snapshot full content', () => assert.deepEqual(content(state.snapshot), content(saved.snapshot)))
  check('restored active page', () => assert.equal(state.activeSlideId, 'counts'))
  check('restored native page bounds', () => assertPageVisible(state))
  assert.equal(
    await root.locator('.deck-editor textarea[aria-label="Speaker notes"]').inputValue(),
    saved.snapshot.slides.counts.speakerNotes,
  )
  await page.waitForTimeout(350)
  assert.ok(
    await page.evaluate(() =>
      globalThis.__slidePaint.join('').replace(/\s/g, '').includes('Tern/Validatedsamplecounts'),
    ),
    'The restored title must paint on the native canvas',
  )
  await root.screenshot({ path: path.join(directory, 'restored.png') })
  await fs.writeFile(path.join(directory, 'restored.json'), JSON.stringify(state, null, 2))
  state = await choose('review-order')
  assert.deepEqual(state.snapshot.slideOrder, createData('review-order').slideOrder)
  state = await choose('notes-free')
  assert.ok(Object.values(state.snapshot.slides).every((slide) => !slide.speakerNotes))
  state = await choose('empty')
  check('empty deck', () => assert.equal(state.snapshot.slideOrder.length, 0))
  if (state.snapshot.slideOrder.length === 0) await click('Apply notes', /No active slide/)
  state = await click('Restore saved')
  check('restore after fixture replacement', () => assert.equal(state.matchesSaved, true))
  await choose('empty')
  const emptySaved = await click('Save snapshot')
  await choose('field-brief')
  state = await click('Restore saved')
  assert.equal(state.matchesSaved, true)
  assert.deepEqual(content(state.snapshot), content(emptySaved.snapshot))
  assert.equal(state.activeSlideId, null)
  state = await click('Reset')
  assert.equal(state.savedChecksum, null)
  assert.equal(
    await root.getByRole('textbox', { name: 'Slide title', exact: true }).inputValue(),
    'Tern / Revised field briefing',
  )
  assert.equal(await root.getByRole('combobox', { name: 'Slide', exact: true }).inputValue(), 'opening')
  assert.deepEqual(state.snapshot.slideOrder, baseline.snapshot.slideOrder)
  for (const id of baseline.snapshot.slideOrder)
    assert.equal(state.snapshot.slides[id].speakerNotes, baseline.snapshot.slides[id].speakerNotes)
  await root.getByRole('textbox', { name: 'Slide title', exact: true }).fill('   ')
  await click('Apply title', /non-empty title/)
  await click('Reset')
  const focusable = root.locator('fieldset').locator('button,select,input')
  await focusable.first().focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  for (let i = 0; i < (await focusable.count()); i++) {
    assert.equal(
      await focusable
        .nth(i)
        .evaluate((el) => el === document.activeElement && getComputedStyle(el).outlineWidth === '2px'),
      true,
    )
    await page.keyboard.press('Tab')
  }
  results.push({ keyboardControls: await focusable.count() })
  const noteInput = root.locator('fieldset').getByRole('textbox', { name: 'Speaker notes', exact: true })
  await noteInput.focus()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('Keyboard handoff confirmed.')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await idle()
  state = await click('Inspect')
  assert.equal(state.snapshot.slides.opening.speakerNotes, 'Keyboard handoff confirmed.')
  await click('Reset')
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    const fitted = await click('Fit slide')
    assertPageVisible(fitted)
    const rootWidth = await root.evaluate((element) => element.clientWidth)
    assert.ok(fitted.pageBounds.canvasWidth >= rootWidth - 40, 'Native thumbnails must yield to the narrow canvas')
    results.push({ viewportWidth: width, rootWidth, pageBounds: fitted.pageBounds })
    await root.getByRole('combobox', { name: 'Slide', exact: true }).selectOption('counts')
    assert.equal((await click('Show slide')).activeSlideId, 'counts')
    await root.screenshot({ path: path.join(directory, 'width-' + width + '.png') })
  }
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.deck-roundtrip[data-ready=true]').waitFor({ timeout: 120000 })
  assertPageVisible(await click('Inspect'))
  await page.setViewportSize({ width: 1600, height: 1200 })
  await click('Fit slide')
  if (new URL(url).pathname.includes('/playground/'))
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.deck-roundtrip[data-theme=${theme}][data-ready=true]`).waitFor({ timeout: 120000 })
      state = await click('Inspect')
      assert.deepEqual(state.snapshot.slideOrder, baseline.snapshot.slideOrder)
      assert.equal(state.savedChecksum, null)
      await root.screenshot({ path: path.join(directory, theme + '.png') })
    }
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.deck-roundtrip[data-ready=true]').waitFor({ timeout: 120000 })
  await click('Inspect')
  assert.equal(await root.count(), 1)
  if (new URL(url).pathname.includes('/playground/')) {
    for (const [locale, title, variants, actions, states] of [
      ['en-US', 'Save and Restore a Deck', 'Variants', 'Actions', 'States'],
      ['zh-CN', '保存与恢复演示文稿', '变体', '操作', '状态'],
    ]) {
      const response = await page.goto(new URL(`/${locale}/showcase/slides/save-restore-deck`, url).href, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      assert.equal(response.status(), 200)
      await page.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
      for (const name of [variants, actions, states])
        assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.waitForLoadState('networkidle')
      const sidebar = page.locator('aside')
      const product = sidebar.getByRole('button').first()
      await product.click()
      await page.waitForFunction(
        () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
      )
      await product.click()
      await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
      assert.equal(await sidebar.getByRole('link', { name: title, exact: true }).count(), 1)
      assert.equal(await sidebar.getByRole('button', { expanded: true }).count(), 3)
      await page.screenshot({ path: path.join(directory, `detail-${locale}.png`) })
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first().locator('.deck-roundtrip')
      await embedded.locator('fieldset:not([disabled])').waitFor({ timeout: 120000 })
      await embedded.getByRole('button', { name: 'Save snapshot', exact: true }).click()
      await embedded.locator('fieldset:not([disabled])').waitFor()
      assert.equal(JSON.parse(await embedded.locator('output').textContent()).matchesSaved, true)
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        await embedded.getByRole('button', { name: 'Fit slide', exact: true }).click()
        await embedded.locator('fieldset:not([disabled])').waitFor()
        const embeddedState = JSON.parse(await embedded.locator('output').textContent())
        const rootWidth = await embedded.evaluate((element) => element.clientWidth)
        assert.ok(embeddedState.pageBounds.canvasWidth >= rootWidth - 40)
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
        await page.screenshot({ path: path.join(directory, `detail-${locale}-${width}.png`) })
      }
      results.push({ localizedDetail: locale, redundantGuideCardRemoved: true, treeLevels: 4 })
      await page.setViewportSize({ width: 1600, height: 1200 })
    }
  }
  check('browser errors', () => assert.deepEqual(errors, []))
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: failures.length ? 'failed' : 'passed', failures, errors, results }, null, 2),
  )
  assert.deepEqual(failures, [])
  console.log('PASS Slides snapshot round trip, layouts, checkpoints, source download and lifecycle')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify({ message: error.message, errors, failures, results }, null, 2),
  )
  throw error
} finally {
  await browser.close()
}
