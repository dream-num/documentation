/* eslint-disable no-await-in-loop -- Exercise the live SDK document and its native history sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import {
  createData,
  LAYOUTS,
  layoutSlot,
  rebuildLayout,
} from '../showcase/slides/layouts-and-placeholders/code/data.ts'

const fixtureData = createData()
assert.equal(Object.keys(LAYOUTS).length, 7)
assert.equal(new Set(Object.values(fixtureData.slides).map((slide) => slide.layoutPageId)).size, 7)
assert.throws(() => rebuildLayout(fixtureData, 'opening', 'missing'), /invalid/)
assert.throws(() => rebuildLayout(fixtureData, 'missing', 'comparison'), /invalid/)
for (const damage of ['master', 'type', 'index']) {
  const malformed = structuredClone(fixtureData)
  if (damage === 'master') malformed.layoutPages.comparison.masterPageId = 'missing'
  else malformed.layoutPages.comparison.elements['layout-a'].placeholder[damage] = damage === 'type' ? 'title' : 99
  const before = structuredClone(malformed)
  assert.throws(() => rebuildLayout(malformed, 'handoff', 'comparison'), /invalid|No matching/)
  assert.deepEqual(malformed, before, 'Validation must not mutate even the input snapshot')
}
const rebuilt = rebuildLayout(fixtureData, 'handoff', 'comparison')
assert.equal(fixtureData.slides.handoff.layoutPageId, 'briefing')
assert.equal(rebuilt.slides.handoff.layoutPageId, 'comparison')
assert.equal(rebuilt.slides.handoff.elements['body-a'].text, fixtureData.slides.handoff.elements['body-a'].text)
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/slides/layouts-and-placeholders'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-layouts')
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
  const root = page.locator('.slide-layout')
  await page.locator('.slide-layout[data-ready=true]').waitFor({ timeout: 120000 })
  const idle = () => page.waitForFunction(() => document.querySelector('.slide-layout fieldset')?.disabled === false)
  const read = async () => JSON.parse(await root.locator('output').textContent())
  const clearPaint = () =>
    page.evaluate(() => {
      globalThis.__pagePaint = []
    })
  const painted = async () => {
    await page.waitForTimeout(250)
    return page.evaluate(() => globalThis.__pagePaint.join('').replace(/\s/g, ''))
  }
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
  const choose = (name, value) => root.getByRole('combobox', { name, exact: true }).selectOption(value)
  const show = async (id) => {
    await choose('Slide', id)
    return click('Show slide')
  }
  const fixture = async (id) => {
    await choose('Fixture', id)
    return click('Load fixture')
  }
  const geometry = (state) => {
    for (const item of state.actual) {
      check(`render exists ${state.activeId}/${item.id}`, () => assert.ok(item.rendered))
      if (item.rendered)
        for (const field of ['left', 'top', 'width', 'height'])
          check(`render geometry ${state.activeId}/${item.id}/${field}`, () =>
            assert.ok(Math.abs(item.rendered[field] - item.requested[field]) < 0.01, JSON.stringify(item)),
          )
    }
  }
  const order = async (expected) => {
    assert.deepEqual((await read()).snapshot.slideOrder, expected)
    assert.deepEqual(
      await root
        .locator('[data-u-comp="slide-thumbnail-item"]')
        .evaluateAll((items) => items.map((item) => item.getAttribute('data-page-id'))),
      expected,
    )
  }
  const baseline = await click('Inspect')
  await order(fixtureData.slideOrder)
  assert.equal(baseline.resolved.masterLayer.length, 2)
  assert.equal(baseline.resolved.layoutLayer.length, 1)
  assert.equal(baseline.resolved.slideLayer.length, 3)
  assert.deepEqual(
    baseline.resolved.slideLayer.map((element) => [element.placeholder.type, element.placeholder.index]),
    [
      ['title', 0],
      ['body', 1],
      ['body', 2],
    ],
  )
  await click('Undo', /No undo entry/)
  // Start elsewhere so the first thumbnail also triggers a real canvas redraw.
  await show('closing')
  for (const id of fixtureData.slideOrder) {
    await clearPaint()
    await root.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${id}"]`).click()
    const state = await click('Inspect')
    assert.equal(state.activeId, id)
    geometry(state)
    const text = await painted()
    for (const element of Object.values(fixtureData.slides[id].elements))
      check(`paint ${id}/${element.id}`, () => assert.ok(text.includes(element.text.replace(/\s/g, ''))))
    check(`master footer ${id}`, () => assert.ok(text.includes('ASTER/Communityradio/Volunteeredition')))
    assert.equal(
      await root.locator('textarea[aria-label="Speaker notes"]').inputValue(),
      fixtureData.slides[id].speakerNotes,
    )
    await root.screenshot({ path: path.join(directory, `${id}.png`) })
  }
  await show('handoff')
  let before = (await read()).snapshot
  for (const layout of ['comparison', 'section', 'title', 'data', 'quote', 'closing', 'briefing']) {
    await choose('Layout', layout)
    await clearPaint()
    let state = await click('Rebuild with layout')
    const expected = rebuildLayout(before, 'handoff', layout)
    const { id: _old, ...oldContent } = expected,
      { id: _new, ...newContent } = state.snapshot
    assert.deepEqual(newContent, oldContent)
    assert.equal(state.activeId, 'handoff')
    geometry(state)
    const text = await painted()
    for (const element of Object.values(before.slides.handoff.elements))
      check(`rebuild paint ${layout}/${element.id}`, () => assert.ok(text.includes(element.text.replace(/\s/g, ''))))
    await root.screenshot({ path: path.join(directory, `layout-${layout}.png`) })
    await click('Undo', /No undo entry/)
    before = state.snapshot
  }
  await choose('Layout', 'comparison')
  await click('Rebuild with layout')
  await choose('Placeholder', 'body-a')
  const original = (await read()).snapshot.slides.handoff.elements['body-a']
  let state = await click('Offset placement')
  const offset = state.snapshot.slides.handoff.elements['body-a']
  assert.equal(offset.transform.left, original.transform.left + 36)
  assert.equal(offset.transform.top, original.transform.top + 24)
  geometry(state)
  state = await click('Undo')
  check('offset Undo restores complete element', () =>
    assert.deepEqual(state.snapshot.slides.handoff.elements['body-a'], original),
  )
  geometry(state)
  state = await click('Redo')
  geometry(state)
  assert.deepEqual(state.snapshot.slides.handoff.elements['body-a'], offset)
  state = await click('Restore layout placement')
  geometry(state)
  assert.deepEqual(
    state.snapshot.slides.handoff.elements['body-a'].transform,
    layoutSlot(state.snapshot, 'handoff', 'body-a').transform,
  )
  await click('Undo')
  geometry(await read())
  assert.deepEqual((await read()).snapshot.slides.handoff.elements['body-a'], offset)
  state = await click('Redo')
  geometry(state)
  const beforeText = state.snapshot.slides.handoff.elements['body-a'],
    referenceBody = state.snapshot.slides.handoff.elements['body-b']
  await clearPaint()
  state = await click('Apply text')
  assert.equal(state.snapshot.slides.handoff.elements['body-a'].text, 'Aster / Revised handoff')
  assert.deepEqual(state.snapshot.slides.handoff.elements['body-b'], referenceBody)
  assert.ok((await painted()).includes('Aster/Revisedhandoff'))
  await clearPaint()
  state = await click('Undo')
  check('text Undo restores placeholder', () =>
    assert.deepEqual(state.snapshot.slides.handoff.elements['body-a'], beforeText),
  )
  const undoText = await painted()
  check('text Undo original canvas text', () => assert.ok(undoText.includes(beforeText.text.replace(/\s/g, ''))))
  await click('Redo')
  const contentBeforeHide = (await read()).snapshot.slides.handoff.elements
  await clearPaint()
  state = await click('Hide inherited graphics')
  assert.equal(state.snapshot.slides.handoff.showMasterSp, false)
  assert.equal(state.resolved.masterLayer.length, 0)
  assert.equal(state.resolved.layoutLayer.length, 0)
  assert.equal(state.resolved.slideLayer.length, 3)
  assert.deepEqual(state.snapshot.slides.handoff.elements, contentBeforeHide)
  const hiddenPaint = await painted()
  check('hidden master footer does not paint', () =>
    assert.ok(!hiddenPaint.includes('ASTER/Communityradio/Volunteeredition')),
  )
  assert.ok(hiddenPaint.includes('Aster/Revisedhandoff'))
  geometry(state)
  await root.screenshot({ path: path.join(directory, 'hidden-graphics.png') })
  await clearPaint()
  state = await click('Undo')
  geometry(state)
  assert.equal(state.snapshot.slides.handoff.showMasterSp, true)
  assert.ok((await painted()).includes('ASTER/Communityradio/Volunteeredition'))
  await click('Redo')
  state = await click('Show inherited graphics')
  geometry(state)
  assert.equal(state.snapshot.slides.handoff.showMasterSp, true)
  const saved = state.snapshot
  state = await click('Reload snapshot')
  const { id: _saved, ...savedContent } = saved,
    { id: _loaded, ...loadedContent } = state.snapshot
  assert.deepEqual(loadedContent, savedContent)
  geometry(state)
  await click('Try invalid layout', /reference is invalid/)
  assert.deepEqual((await read()).snapshot, state.snapshot)
  await clearPaint()
  state = await fixture('inherited')
  assert.deepEqual(state.snapshot.slides.opening.elementOrder, [])
  assert.equal(state.resolved.masterLayer.length, 2)
  assert.equal(state.resolved.layoutLayer.length, 4)
  assert.equal(state.resolved.slideLayer.length, 0)
  geometry(state)
  const inheritedText = await painted()
  for (const prompt of ['Add a program title', 'Add the first talking point', 'Add the second talking point'])
    check(`inherited paint ${prompt}`, () => assert.ok(inheritedText.includes(prompt.replace(/\s/g, ''))))
  await root.screenshot({ path: path.join(directory, 'inherited.png') })
  await click('Offset placement', /No slide-owned placeholder/)
  await click('Apply text', /No slide-owned placeholder/)
  await choose('Layout', 'comparison')
  state = await click('Rebuild with layout')
  geometry(state)
  assert.deepEqual(state.snapshot.slides.opening.elements, {})
  await fixture('comparison')
  await order(fixtureData.slideOrder)
  assert.equal((await read()).layoutId, 'comparison')
  await show('closing')
  for (const id of fixtureData.slideOrder) {
    await clearPaint()
    await root.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${id}"]`).click()
    state = await click('Inspect')
    geometry(state)
    const text = await painted()
    for (const element of Object.values(fixtureData.slides[id].elements))
      check(`comparison paint ${id}/${element.id}`, () => assert.ok(text.includes(element.text.replace(/\s/g, ''))))
    await root.screenshot({ path: path.join(directory, `comparison-${id}.png`) })
  }
  await fixture('empty')
  await order([])
  assert.equal((await read()).activeId, null)
  await click('Rebuild with layout', /No active page/)
  await click('Hide inherited graphics', /No active page/)
  await click('Reset')
  assert.deepEqual((await read()).snapshot.slides, baseline.snapshot.slides)
  await root.getByRole('textbox', { name: 'Placeholder text', exact: true }).fill(' ')
  await click('Apply text', /non-empty placeholder text/)
  await click('Reset')
  assert.equal(
    await root.getByRole('textbox', { name: 'Placeholder text', exact: true }).inputValue(),
    'Aster / Revised handoff',
  )
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
  await root.getByRole('button', { name: 'Offset placement', exact: true }).focus()
  await page.keyboard.press('Enter')
  await idle()
  assert.equal((await read()).snapshot.slides.opening.elements.title.transform.left, 101)
  results.push({ keyboardControls: await controls.count(), keyboardPlacement: true })
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
  await page.locator('.slide-layout[data-ready=true]').waitFor({ timeout: 120000 })
  assert.ok((await click('Inspect')).bounds.width >= 220)
  await page.setViewportSize({ width: 1600, height: 1200 })
  await click('Fit slide')
  assert.equal(await root.count(), 1)
  if (new URL(url).pathname.includes('/playground/'))
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.slide-layout[data-theme=${theme}][data-ready=true]`).waitFor({ timeout: 120000 })
      await click('Inspect')
      await order(fixtureData.slideOrder)
      geometry(await read())
      await root.screenshot({ path: path.join(directory, `${theme}.png`) })
    }
  if (new URL(url).pathname.includes('/playground/')) {
    for (const [locale, title, variants, actions, states] of [
      ['en-US', 'Layouts, Masters and Placeholder Placement', 'Variants', 'Actions', 'States'],
      ['zh-CN', '布局、母版与占位符位置', '变体', '操作', '状态'],
    ]) {
      const response = await page.goto(new URL(`/${locale}/showcase/slides/layouts-and-placeholders`, url).href, {
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
      const embedded = page.frameLocator('iframe').first().locator('.slide-layout')
      await embedded.locator('fieldset:not([disabled])').waitFor({ timeout: 120000 })
      await embedded.getByRole('combobox', { name: 'Layout', exact: true }).selectOption('comparison')
      await embedded.getByRole('button', { name: 'Rebuild with layout', exact: true }).click()
      await embedded.locator('fieldset:not([disabled])').waitFor()
      const embeddedRebuild = JSON.parse(await embedded.locator('output').textContent())
      assert.equal(embeddedRebuild.layoutId, 'comparison')
      assert.equal(embeddedRebuild.snapshot.slides.opening.elements['body-a'].transform.width, 420)
      geometry(embeddedRebuild)
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
        status: failures.length ? 'failed' : 'passed-host-layout-rebuild',
        limitations: ['Layout change is explicit snapshot reconstruction, not a native layout-change/reset command.'],
        failures,
        errors,
        results,
      },
      null,
      2,
    ),
  )
  assert.deepEqual(failures, [])
  console.log('PASS Slides layers, placeholder geometry, content, native history and explicit host rebuild')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  const state = await page
    .locator('.slide-layout output')
    .textContent()
    .catch(() => null)
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      { message: error.message, errors, failures, results, state: state ? JSON.parse(state) : null },
      null,
      2,
    ),
  )
  throw error
} finally {
  await browser.close()
}
