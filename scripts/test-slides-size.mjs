/* eslint-disable no-await-in-loop -- Validate a single live presentation and native history in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import {
  CONTENT,
  createData,
  dimensions,
  FROZEN_CLOCK,
  overflow,
  scaleElements,
  WIDE,
} from '../showcase/slides/page-size-and-overflow/code/data.ts'

const fixtureData = createData()
assert.equal(fixtureData.slideOrder.length, 8)
assert.equal(new Set(CONTENT.map((item) => item[5])).size, 7)
for (const value of ['0', '-1', '120.5', '2401', '', 'NaN', 'Infinity'])
  assert.throws(() => dimensions('custom', value, '600'), /whole dimensions/)
assert.deepEqual(overflow({ left: 0, top: 0, right: 960, bottom: 540 }, WIDE), [])
assert.deepEqual(overflow({ left: -2, top: -3, right: 961, bottom: 542 }, WIDE), ['left', 'top', 'right', 'bottom'])
const scaled = scaleElements(fixtureData.slides.opening, WIDE, dimensions('standard'))
assert.equal(scaled.factor, 0.75)
const scaledTitle = scaled.elements.find((item) => item.id === 'title')
assert.equal(scaledTitle.textStyle.fontSize, 24)
assert.equal(scaledTitle.transform.left, 37.5)
assert.equal(scaledTitle.transform.top, 120)
assert.equal(fixtureData.slides.opening.elements.title.textStyle.fontSize, 32)
const rich = structuredClone(fixtureData.slides.opening)
rich.elements.title.textData = { id: 'edited', body: { dataStream: 'Changed\r\n' } }
const richBefore = structuredClone(rich)
assert.throws(() => scaleElements(rich, WIDE, dimensions('standard')), /document-aware/)
assert.deepEqual(rich, richBefore)

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/slides/page-size-and-overflow'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-size')
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
  globalThis.__sizePaint = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    globalThis.__sizePaint.push({ text: String(args[0]), font: this.font })
    return Reflect.apply(fill, this, args)
  }
})
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  const root = page.locator('.slide-size-demo')
  await page.locator('.slide-size-demo[data-ready=true]').waitFor({ timeout: 120000 })
  const styles = await page.evaluate(() => {
    const sheets = [...document.styleSheets]
    const css = sheets.flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText)).join('\n')
    return {
      urls: sheets.map((sheet) => sheet.href).filter(Boolean),
      sdk: css.includes('.univer-pointer-events-none'),
      host: css.includes('.slide-size-demo'),
      layout: getComputedStyle(document.querySelector('.slide-size-demo')).display,
    }
  })
  assert.equal(styles.sdk, true, 'SDK CSS must load in the actual preview and independent project')
  assert.equal(styles.host, true)
  assert.equal(styles.layout, 'flex')
  results.push({ styles })
  const idle = () => page.waitForFunction(() => document.querySelector('.slide-size-demo fieldset')?.disabled === false)
  const read = async () => JSON.parse(await root.locator('output').textContent())
  const choose = (name, value) => root.getByRole('combobox', { name, exact: true }).selectOption(value)
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
    await choose('Slide', id)
    return click('Show slide')
  }
  const fixture = async (id) => {
    await choose('Fixture', id)
    return click('Load fixture')
  }
  const clearPaint = () =>
    page.evaluate(() => {
      globalThis.__sizePaint = []
    })
  const painted = async () => {
    await page.waitForTimeout(250)
    return page.evaluate(() => globalThis.__sizePaint)
  }
  const sizeCheck = (state, width, height) => {
    assert.equal(state.size.width, width)
    assert.equal(state.size.height, height)
    check('actual page width', () => assert.equal(state.bounds.logicalWidth, width))
    check('actual page height', () => assert.equal(state.bounds.logicalHeight, height))
    assert.equal(state.frozenClock, FROZEN_CLOCK)
  }
  const frames = async (state) => {
    for (const item of state.actual) {
      assert.ok(item.frame, `${item.id}: actual renderer object`)
      if (!(item.requested.angle ?? 0)) {
        for (const [field, expected] of [
          ['left', item.requested.left],
          ['top', item.requested.top],
          ['right', item.requested.left + item.requested.width],
          ['bottom', item.requested.top + item.requested.height],
        ])
          check(`frame ${state.activeId}/${item.id}/${field}`, () =>
            assert.ok(Math.abs(item.frame[field] - expected) < 0.01, JSON.stringify(item)),
          )
      }
      assert.deepEqual(item.overflow, overflow(item.frame, state.size))
      if (item.overflow.length)
        assert.ok((await root.getByRole('list', { name: 'Overflow report' }).innerText()).includes(item.id))
    }
  }
  let state = await click('Inspect')
  const baseline = state.snapshot
  sizeCheck(state, 960, 540)
  await click('Undo', /No undo entry/)
  await show('closing')
  for (const [id, title, first, second, notes] of CONTENT) {
    await clearPaint()
    await root.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${id}"]`).click()
    state = await click('Inspect')
    assert.equal(state.activeId, id)
    sizeCheck(state, 960, 540)
    assert.equal(state.actual.length, 5)
    assert.ok(state.actual.every((item) => item.overflow.length === 0))
    await frames(state)
    const pagePaint = await painted()
    const text = pagePaint
      .map((item) => item.text)
      .join('')
      .replace(/\s/g, '')
    for (const value of [title, first, second])
      check(`paint ${id}/${value}`, () => assert.ok(text.includes(value.replace(/\s/g, ''))))
    assert.equal(await root.locator('textarea[aria-label="Speaker notes"]').inputValue(), notes)
    await root.screenshot({ path: path.join(directory, `${id}.png`) })
  }
  await click('Reset')
  await choose('Target size', 'standard')
  state = await click('Apply deck size')
  sizeCheck(state, 720, 540)
  assert.deepEqual(state.snapshot.slides, baseline.slides)
  await frames(state)
  assert.deepEqual(
    state.actual
      .filter((item) => item.overflow.length)
      .map((item) => item.id)
      .toSorted(),
    ['first', 'panel', 'second', 'title'],
  )
  const master = state.actual.find((item) => item.id === 'master-rule')
  assert.equal(master.frame.right, 720)
  await click('Fit slide')
  await root.screenshot({ path: path.join(directory, 'size-only-standard.png') })
  state = await click('Undo')
  sizeCheck(state, 960, 540)
  assert.deepEqual(state.snapshot.defaultPageSize, baseline.defaultPageSize)
  await click('Redo')
  await click('Reset')
  await choose('Target size', 'standard')
  await clearPaint()
  state = await click('Resize and scale page')
  sizeCheck(state, 720, 540)
  await frames(state)
  check('scaled frames fit inside standard page', () =>
    assert.ok(state.actual.every((item) => item.overflow.length === 0)),
  )
  const expected = Object.fromEntries(scaled.elements.map((element) => [element.id, element]))
  check('scaled complete elements', () => assert.deepEqual(state.snapshot.slides.opening.elements, expected))
  const scaledPaint = (await painted())
    .map((item) => item.text)
    .join('')
    .replace(/\s/g, '')
  for (const value of CONTENT[0].slice(1, 4))
    check(`scaled paint ${value}`, () => assert.ok(scaledPaint.includes(value.replace(/\s/g, ''))))
  await click('Fit slide')
  await root.screenshot({ path: path.join(directory, 'scaled-standard.png') })
  state = await click('Undo')
  sizeCheck(state, 720, 540)
  check('first Undo restores complete content', () =>
    assert.deepEqual(state.snapshot.slides.opening.elements, baseline.slides.opening.elements),
  )
  await frames(state)
  state = await click('Undo')
  sizeCheck(state, 960, 540)
  assert.deepEqual(state.snapshot.slides, baseline.slides)
  await click('Redo')
  state = await click('Redo')
  check('second Redo restores scaled content', () => assert.deepEqual(state.snapshot.slides.opening.elements, expected))
  await frames(state)
  await click('Reset')
  await choose('Target size', 'portrait')
  state = await click('Apply page size')
  sizeCheck(state, 540, 960)
  assert.deepEqual(state.snapshot.defaultPageSize, baseline.defaultPageSize)
  await choose('Target size', 'standard')
  state = await click('Apply deck size')
  sizeCheck(state, 540, 960)
  await frames(state)
  state = await show('kits')
  sizeCheck(state, 720, 540)
  await frames(state)
  state = await show('opening')
  sizeCheck(state, 540, 960)
  state = await click('Use deck size')
  sizeCheck(state, 720, 540)
  assert.equal(state.snapshot.slides.opening.pageSize, undefined)
  state = await click('Undo')
  sizeCheck(state, 540, 960)
  await click('Redo')
  for (const kind of ['square', 'portrait', 'custom']) {
    await click('Reset')
    await choose('Target size', kind)
    state = await click('Resize and scale page')
    const requested = dimensions(kind)
    sizeCheck(state, requested.width, requested.height)
    await frames(state)
    check(`scaled ${kind} frame containment`, () => assert.ok(state.actual.every((item) => !item.overflow.length)))
    state = await click('Fit slide')
    assert.ok(state.bounds.width <= state.bounds.canvasWidth - 39)
    assert.ok(state.bounds.height <= state.bounds.canvasHeight - 39)
    await root.screenshot({ path: path.join(directory, `scaled-${kind}.png`) })
  }
  const saved = state.snapshot
  state = await click('Reload snapshot')
  const { id: _old, ...oldContent } = saved,
    { id: _new, ...newContent } = state.snapshot
  assert.deepEqual(newContent, oldContent)
  await frames(state)
  await click('Undo', /No undo entry/)
  await click('Try invalid size', /SDK rejected zero width/)
  assert.deepEqual((await read()).snapshot, state.snapshot)
  await root.getByRole('spinbutton', { name: 'Custom width', exact: true }).fill('0')
  await click('Apply page size', /whole dimensions/)
  assert.deepEqual((await read()).snapshot, state.snapshot)
  state = await fixture('bounds')
  sizeCheck(state, 960, 540)
  await frames(state)
  assert.deepEqual(
    state.actual
      .filter((item) => item.overflow.length)
      .map((item) => item.id)
      .toSorted(),
    ['outside-bottom', 'outside-left', 'outside-right', 'rotated-left'],
  )
  assert.deepEqual(state.actual.find((item) => item.id === 'touching-edge').overflow, [])
  const rotated = state.actual.find((item) => item.id === 'rotated-left')
  check('rotated frame detects left corner', () =>
    assert.ok(Math.abs(rotated.frame.left - (40 - Math.sqrt(2) * 40)) < 0.01),
  )
  await root.screenshot({ path: path.join(directory, 'boundary-markers.png') })
  state = await fixture('standard')
  sizeCheck(state, 720, 540)
  assert.deepEqual(state.snapshot.slides, baseline.slides)
  await frames(state)
  state = await fixture('empty')
  assert.equal(state.activeId, null)
  assert.deepEqual(state.snapshot.slideOrder, [])
  await choose('Target size', 'wide')
  await click('Apply page size', /No active page/)
  await click('Use deck size', /No active page/)
  await click('Resize and scale page', /No active page/)
  await choose('Target size', 'square')
  state = await click('Apply deck size')
  assert.equal(state.snapshot.defaultPageSize.width, 600)
  await click('Reset')
  await choose('Target size', 'standard')
  await click('Apply deck size')
  for (const [id] of CONTENT) {
    state = await show(id)
    sizeCheck(state, 720, 540)
    await frames(state)
    assert.deepEqual(state.snapshot.slides[id].elements, baseline.slides[id].elements)
    assert.ok(
      state.actual.some((item) => item.overflow.length),
      `${id}: unchanged wide content is reported`,
    )
  }
  await click('Reset')
  await choose('Target size', 'standard')
  for (const [id, title, first, second] of CONTENT) {
    await show(id)
    await clearPaint()
    state = await click('Resize and scale page')
    sizeCheck(state, 720, 540)
    await frames(state)
    assert.ok(
      state.actual.every((item) => !item.overflow.length),
      `${id}: scaled frames fit`,
    )
    const scaledPage = scaleElements(baseline.slides[id], WIDE, dimensions('standard'))
    assert.deepEqual(
      state.snapshot.slides[id].elements,
      Object.fromEntries(scaledPage.elements.map((element) => [element.id, element])),
    )
    const pagePaint = await painted()
    const text = pagePaint
      .map((item) => item.text)
      .join('')
      .replace(/\s/g, '')
    for (const value of [title, first, second])
      check(`scaled ${id}/${value}`, () => assert.ok(text.includes(value.replace(/\s/g, ''))))
    // Native document fonts use points; Canvas font strings use pixels (96 / 72).
    for (const [value, points] of [
      [title, 24],
      [first, 19.5],
      [second, 18],
    ]) {
      const atSize = pagePaint
        .filter((item) => Math.abs(Number(item.font.match(/([\d.]+)px/)?.[1]) - (points * 96) / 72) < 0.001)
        .map((item) => item.text)
        .join('')
        .replace(/\s/g, '')
      check(`scaled font ${id}/${points}pt`, () => assert.ok(atSize.includes(value.replace(/\s/g, ''))))
    }
    await root.screenshot({ path: path.join(directory, `scaled-page-${id}.png`) })
  }
  state = await click('Reset')
  assert.deepEqual(state.snapshot.slides, baseline.slides)
  assert.equal(await root.getByRole('spinbutton', { name: 'Custom width', exact: true }).inputValue(), '800')
  const controls = root.locator('fieldset').locator('button,select,input')
  assert.equal(await controls.count(), 18)
  await controls.first().focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  for (let i = 0; i < 18; i++) {
    assert.ok(
      await controls
        .nth(i)
        .evaluate((element) => element === document.activeElement && getComputedStyle(element).outlineWidth === '2px'),
    )
    await page.keyboard.press('Tab')
  }
  await choose('Target size', 'standard')
  await root.getByRole('button', { name: 'Apply page size', exact: true }).focus()
  await page.keyboard.press('Enter')
  await idle()
  sizeCheck(await read(), 720, 540)
  results.push({ keyboardControls: 18, variants: 4, pages: 8, targetSizes: 5 })
  await click('Reset')
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    state = await click('Fit slide')
    assert.ok(state.bounds.width >= 220)
    assert.ok(state.bounds.canvasWidth >= (await root.evaluate((element) => element.clientWidth)) - 40)
    await frames(state)
    results.push({ viewportWidth: width, bounds: state.bounds })
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.slide-size-demo[data-ready=true]').waitFor({ timeout: 120000 })
  assert.ok((await click('Inspect')).bounds.width >= 220)
  await page.setViewportSize({ width: 1600, height: 1200 })
  await click('Fit slide')
  if (new URL(url).pathname.includes('/playground/')) {
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.slide-size-demo[data-theme=${theme}][data-ready=true]`).waitFor({ timeout: 120000 })
      state = await click('Inspect')
      sizeCheck(state, 960, 540)
      await frames(state)
      assert.deepEqual(state.snapshot.slides, baseline.slides)
      await root.screenshot({ path: path.join(directory, `${theme}.png`) })
    }
  }
  if (new URL(url).pathname.includes('/playground/')) {
    for (const [locale, title, variants, actions, states] of [
      ['en-US', 'Page Size, Scaling and Overflow', 'Variants', 'Actions', 'States'],
      ['zh-CN', '页面尺寸、缩放与越界', '变体', '操作', '状态'],
    ]) {
      const response = await page.goto(new URL(`/${locale}/showcase/slides/page-size-and-overflow`, url).href, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      assert.equal(response.status(), 200)
      await page.getByRole('heading', { name: title, exact: true, level: 1 }).waitFor()
      for (const name of [variants, actions, states])
        assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      const embedded = page.frameLocator('iframe').first().locator('.slide-size-demo')
      await embedded.locator('fieldset:not([disabled])').waitFor({ timeout: 120000 })
      await page.waitForLoadState('load')
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
      assert.equal(await embedded.locator('fieldset').locator('button,select,input').count(), 18)
      await embedded.getByRole('combobox', { name: 'Target size', exact: true }).selectOption('standard')
      await embedded.getByRole('button', { name: 'Resize and scale page', exact: true }).click()
      await embedded.locator('fieldset:not([disabled])').waitFor()
      const embeddedState = JSON.parse(await embedded.locator('output').textContent())
      sizeCheck(embeddedState, 720, 540)
      assert.deepEqual(embeddedState.snapshot.slides.opening.elements, expected)
      assert.ok(embeddedState.actual.every((item) => item.frame && !item.overflow.length))
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        await embedded.getByRole('button', { name: 'Fit slide', exact: true }).click()
        await embedded.locator('fieldset:not([disabled])').waitFor()
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
        const resized = JSON.parse(await embedded.locator('output').textContent())
        assert.ok(resized.bounds.canvasWidth >= (await embedded.evaluate((element) => element.clientWidth)) - 40)
        await page.screenshot({ path: path.join(directory, `detail-${locale}-${width}.png`) })
      }
      results.push({ localizedDetail: locale, redundantGuideCardRemoved: true, treeLevels: 4 })
      await page.setViewportSize({ width: 1600, height: 1200 })
    }
  }
  check('browser errors', () => assert.deepEqual(errors, []))
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: failures.length ? 'failed' : 'passed', errors, failures, results }, null, 2),
  )
  assert.deepEqual(failures, [])
  console.log('PASS Slides page size, actual overflow frames, scaled content and native history')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  const state = await page
    .locator('.slide-size-demo output')
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
