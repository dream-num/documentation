/* eslint-disable no-await-in-loop -- Exercise one real presentation and native history in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { createData, sectionOrder, sections } from '../showcase/slides/reorder-and-sections/code/data.ts'

const baselineData = createData()
const reviewFirst = ['opening', 'context', 'review', 'observations', 'quote', 'roadmap', 'planting', 'decision']
assert.deepEqual(sectionOrder(baselineData, 'review', 'roadmap'), reviewFirst)
assert.deepEqual(createData('review-first').slides, baselineData.slides)
assert.deepEqual(
  sections(baselineData).map((group) => [group.id, group.pages.length, group.contiguous]),
  [
    ['intro', 2, true],
    ['roadmap', 2, true],
    ['review', 3, true],
    ['decision', 1, true],
  ],
)
assert.throws(() => sectionOrder(baselineData, 'review', 'review'), /different/)
assert.throws(() => sectionOrder(createData('empty'), 'review', 'roadmap'), /contain pages/)
assert.deepEqual(sectionOrder(baselineData, 'intro', 'decision'), [
  'roadmap',
  'planting',
  'review',
  'observations',
  'quote',
  'opening',
  'context',
  'decision',
])
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/slides/reorder-and-sections'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-order')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
const errors = [],
  failures = [],
  results = []
const check = (name, action) => {
  try {
    action()
  } catch (error) {
    failures.push({ name, message: error.message })
  }
}
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
await page.addInitScript(() => {
  globalThis.__pagePaint = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    globalThis.__pagePaint.push(String(args[0]))
    return Reflect.apply(fill, this, args)
  }
})
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  const root = page.locator('.slide-order')
  await page.locator('.slide-order[data-ready=true]').waitFor({ timeout: 120000 })
  const idle = () => page.waitForFunction(() => document.querySelector('.slide-order fieldset')?.disabled === false)
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
  const show = async (id) => {
    await root.getByRole('combobox', { name: 'Slide', exact: true }).selectOption(id)
    return click('Show slide')
  }
  const fixture = async (id) => {
    await root.getByRole('combobox', { name: 'Fixture', exact: true }).selectOption(id)
    return click('Load fixture')
  }
  const native = (id) => root.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${id}"]`)
  const order = async (expected) => {
    const state = await read()
    assert.deepEqual(state.snapshot.slideOrder, expected)
    assert.deepEqual(state.facadeOrder, expected)
    await page.waitForTimeout(150)
    assert.deepEqual(
      await root
        .locator('[data-u-comp="slide-thumbnail-item"]')
        .evaluateAll((items) => items.map((item) => item.getAttribute('data-page-id'))),
      expected,
    )
    const highlighted = await root
      .locator('[data-u-comp="slide-thumbnail-item"]')
      .evaluateAll((items) =>
        items
          .filter((item) => item.firstElementChild?.classList.contains('univer-border-primary-500'))
          .map((item) => item.getAttribute('data-page-id')),
      )
    assert.deepEqual(highlighted, state.activeId ? [state.activeId] : [])
    return state
  }
  const baseline = await click('Inspect')
  await order(baselineData.slideOrder)
  await click('Undo', /No undo entry/)
  for (const id of baseline.snapshot.slideOrder) {
    await page.evaluate(() => {
      globalThis.__pagePaint = []
    })
    await native(id).click()
    const state = await click('Inspect')
    assert.equal(state.activeId, id)
    await page.waitForTimeout(250)
    const painted = await page.evaluate(() => globalThis.__pagePaint.join('').replace(/\s/g, ''))
    for (const element of Object.values(baselineData.slides[id].elements))
      if (element.text)
        check(`native paint ${id}/${element.id}`, () => assert.ok(painted.includes(element.text.replace(/\s/g, ''))))
    assert.equal(
      await root.locator('textarea[aria-label="Speaker notes"]').inputValue(),
      baselineData.slides[id].speakerNotes,
    )
    await root.screenshot({ path: path.join(directory, `${id}.png`) })
  }
  await click('Reset')
  await native('opening').scrollIntoViewIfNeeded()
  assert.equal(await native('context').getAttribute('draggable'), 'true')
  await native('context').dragTo(native('opening'), { targetPosition: { x: 100, y: 10 } })
  await page.waitForTimeout(350)
  let state = await click('Inspect')
  await order(['context', 'opening', ...baselineData.slideOrder.slice(2)])
  assert.deepEqual(state.snapshot.slides, baseline.snapshot.slides)
  assert.equal(state.activeId, 'context')
  await root.screenshot({ path: path.join(directory, 'native-drag.png') })
  await click('Undo')
  await order(baselineData.slideOrder)
  await click('Redo')
  await order(['context', 'opening', ...baselineData.slideOrder.slice(2)])
  results.push({ nativeDrag: 'context before opening', history: 'undo and redo' })
  await click('Reset')
  await show('planting')
  state = await click('Move earlier')
  const earlier = ['opening', 'context', 'planting', 'roadmap', 'review', 'observations', 'quote', 'decision']
  await order(earlier)
  assert.equal(state.activeId, 'planting')
  assert.deepEqual(state.snapshot.slides, baseline.snapshot.slides)
  await click('Undo')
  await order(baselineData.slideOrder)
  await click('Redo')
  await order(earlier)
  await click('Move later')
  await order(baselineData.slideOrder)
  await show('review')
  state = await click('Move to end')
  await order(['opening', 'context', 'roadmap', 'planting', 'observations', 'quote', 'decision', 'review'])
  assert.equal(state.sections.find((group) => group.id === 'review').contiguous, false)
  await click('Move to start')
  await order(['review', 'opening', 'context', 'roadmap', 'planting', 'observations', 'quote', 'decision'])
  await root.getByRole('spinbutton', { name: 'Position', exact: true }).fill('3')
  await click('Move to position')
  await order(['opening', 'context', 'review', 'roadmap', 'planting', 'observations', 'quote', 'decision'])
  const beforeInvalid = (await read()).snapshot
  for (const invalid of ['0', '-2', '1.5', '99', '']) {
    await root.getByRole('spinbutton', { name: 'Position', exact: true }).fill(invalid)
    await click('Move to position', /whole-number position/)
    assert.deepEqual((await read()).snapshot, beforeInvalid)
  }
  await click('Reset')
  state = await click('Move section')
  await order(reviewFirst)
  assert.equal(state.lastOperation.moves, 3)
  assert.deepEqual(state.snapshot.slides, baseline.snapshot.slides)
  assert.equal(state.activeId, 'opening')
  assert.deepEqual(
    state.sections.map((group) => [group.id, group.positions, group.contiguous]),
    [
      ['intro', [1, 2], true],
      ['review', [3, 4, 5], true],
      ['roadmap', [6, 7], true],
      ['decision', [8], true],
    ],
  )
  await root.locator('summary').click()
  await click('Fit slide')
  assert.match(
    await root.getByRole('list', { name: 'Host sections' }).innerText(),
    /Review: 3 pages · positions 3, 4, 5 · contiguous/,
  )
  await root.screenshot({ path: path.join(directory, 'section-move.png') })
  await root.locator('summary').click()
  for (let i = 0; i < 3; i++) await click('Undo')
  await order(baselineData.slideOrder)
  for (let i = 0; i < 3; i++) await click('Redo')
  await order(reviewFirst)
  state = await click('Move section')
  assert.equal(state.lastOperation.moves, 0)
  await show('observations')
  state = await click('Move to end')
  assert.equal(state.sections.find((group) => group.id === 'review').contiguous, false)
  state = await click('Move section')
  await order(['opening', 'context', 'review', 'quote', 'observations', 'roadmap', 'planting', 'decision'])
  assert.equal(state.sections.find((group) => group.id === 'review').contiguous, true)
  assert.deepEqual(state.snapshot.slides, baseline.snapshot.slides)
  const saved = state.snapshot
  state = await click('Reload snapshot')
  const { id: _oldId, ...oldContent } = saved,
    { id: _newId, ...newContent } = state.snapshot
  assert.deepEqual(newContent, oldContent)
  await order(saved.slideOrder)
  await click('Undo', /No undo entry/)
  await root.getByRole('combobox', { name: 'Before section', exact: true }).selectOption('review')
  await click('Move section', /different sections/)
  assert.deepEqual((await read()).snapshot, state.snapshot)
  await fixture('repeated-names')
  state = await show('roadmap')
  assert.equal(state.snapshot.slides.roadmap.name, state.snapshot.slides.review.name)
  state = await click('Move to end')
  assert.equal(state.snapshot.slideOrder.at(-1), 'roadmap')
  assert.equal(state.activeId, 'roadmap')
  await fixture('review-first')
  await order(reviewFirst)
  await fixture('single')
  for (const name of ['Move earlier', 'Move later', 'Move to start', 'Move to end']) {
    assert.equal((await click(name)).lastOperation.moves, 0)
    await order(['decision'])
  }
  await click('Undo', /No undo entry/)
  await root.getByRole('combobox', { name: 'Before section', exact: true }).selectOption('roadmap')
  await click('Move section', /contain pages/)
  await fixture('empty')
  await order([])
  await click('Move earlier', /No active page/)
  await click('Show slide', /No page selected/)
  await click('Move section', /contain pages/)
  await click('Reset')
  await order(baselineData.slideOrder)
  assert.equal(await root.getByRole('spinbutton', { name: 'Position', exact: true }).inputValue(), '3')
  assert.equal(await root.getByRole('combobox', { name: 'Section', exact: true }).inputValue(), 'review')
  const controls = root.locator('fieldset').locator('button,select,input')
  await controls.first().focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  for (let i = 0; i < (await controls.count()); i++) {
    assert.ok(
      await controls
        .nth(i)
        .evaluate((element) => element === document.activeElement && getComputedStyle(element).outlineWidth === '2px'),
    )
    await page.keyboard.press('Tab')
  }
  await root.getByRole('button', { name: 'Move later', exact: true }).focus()
  await page.keyboard.press('Enter')
  await idle()
  await order(['context', 'opening', ...baselineData.slideOrder.slice(2)])
  results.push({ keyboardControls: await controls.count(), keyboardOrdering: true })
  await click('Reset')
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    state = await click('Fit slide')
    assert.ok(state.bounds.width >= 220)
    assert.ok(state.bounds.canvasWidth >= (await root.evaluate((element) => element.clientWidth)) - 40)
    results.push({ viewportWidth: width, bounds: state.bounds })
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.slide-order[data-ready=true]').waitFor({ timeout: 120000 })
  assert.ok((await click('Inspect')).bounds.width >= 220)
  await page.setViewportSize({ width: 1600, height: 1200 })
  await click('Fit slide')
  await order(baselineData.slideOrder)
  if (new URL(url).pathname.includes('/playground/')) {
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.slide-order[data-theme=${theme}][data-ready=true]`).waitFor({ timeout: 120000 })
      await click('Inspect')
      await order(baselineData.slideOrder)
      assert.equal(await root.count(), 1)
      await root.screenshot({ path: path.join(directory, `${theme}.png`) })
    }
    for (const [locale, title, variants, actions, states] of [
      ['en-US', 'Slide Order and Section-aware Moves', 'Variants', 'Actions', 'States'],
      ['zh-CN', '页面排序与按章节移动', '变体', '操作', '状态'],
    ]) {
      const response = await page.goto(new URL(`/${locale}/showcase/slides/reorder-and-sections`, url).href, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      assert.equal(response.status(), 200)
      await page.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
      for (const name of [variants, actions, states])
        assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.waitForLoadState('networkidle')
      const sidebar = page.locator('aside'),
        product = sidebar.getByRole('button').first()
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
      const embedded = page.frameLocator('iframe').first().locator('.slide-order')
      await embedded.locator('fieldset:not([disabled])').waitFor({ timeout: 120000 })
      await embedded.getByRole('button', { name: 'Move section', exact: true }).click()
      await embedded.locator('fieldset:not([disabled])').waitFor()
      assert.deepEqual(JSON.parse(await embedded.locator('output').textContent()).snapshot.slideOrder, reviewFirst)
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        await embedded.getByRole('button', { name: 'Fit slide', exact: true }).click()
        await embedded.locator('fieldset:not([disabled])').waitFor()
        const embeddedState = JSON.parse(await embedded.locator('output').textContent())
        assert.ok(embeddedState.bounds.canvasWidth >= (await embedded.evaluate((element) => element.clientWidth)) - 40)
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
    JSON.stringify(
      {
        status: failures.length ? 'failed' : 'passed-host-integration',
        limitations: [
          'Native SDK sections and native thumbnail accessibility are not established by host section tags or controls.',
        ],
        failures,
        errors,
        results,
      },
      null,
      2,
    ),
  )
  assert.deepEqual(failures, [])
  console.log(
    'PASS Slides native page ordering, host section integration, history, source-backed content and lifecycle',
  )
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
