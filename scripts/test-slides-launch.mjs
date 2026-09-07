/* eslint-disable no-await-in-loop -- Validate one presentation's ordered edits and downloads. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { ShapeFillEnum, ShapeLineTypeEnum } from '@univerjs-pro/engine-shape'
import { chromium } from 'playwright'

import {
  LAUNCH_MEDIA_SLOT,
  LAUNCH_METRICS,
  PRODUCT_LAUNCH_DATA,
  timelineX,
} from '../showcase/slides/product-launch/code/data.ts'

assert.equal(PRODUCT_LAUNCH_DATA.slideOrder.length, 11)
assert.equal(LAUNCH_METRICS.milestones.length, 6)
assert.equal((LAUNCH_METRICS.pilot.active / LAUNCH_METRICS.pilot.invited) * 100, 86)
assert.equal(LAUNCH_METRICS.reviewMinutes.before / LAUNCH_METRICS.reviewMinutes.after, 2.4)
const whitePages = ['story', 'proof', 'capabilities', 'rollout']
for (const id of whitePages) assert.equal(PRODUCT_LAUNCH_DATA.slides[id].background.color, '#FFFFFF')
for (const slide of Object.values(PRODUCT_LAUNCH_DATA.slides)) {
  for (const element of Object.values(slide.elements)) {
    if (!element.shapeData?.isTextBox) continue
    assert.equal(element.shapeData.fill.fillType, ShapeFillEnum.NoFill)
    assert.equal(element.shapeData.stroke.lineStrokeType, ShapeLineTypeEnum.NoLine)
    assert.equal(element.shapeData.stroke.width, 0)
  }
}
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/slides/product-launch'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-launch')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
const errors = [],
  failures = [],
  results = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
await page.addInitScript(() => {
  globalThis.__launchPaint = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    globalThis.__launchPaint.push({ text: String(args[0]), font: this.font })
    return Reflect.apply(fill, this, args)
  }
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.product-launch')
  const idle = () => root.locator('fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
  await idle()
  assert.equal(await root.locator('.launch-tools').evaluate((element) => element.open), false)
  assert.equal(await root.getByRole('button', { name: 'Reset deck', exact: true }).isVisible(), false)
  await root.screenshot({ path: path.join(directory, 'editor-first.png') })
  await setToolsOpen(root, true)
  const nativeStyles = async () => {
    const styles = await root.evaluate((container) => {
      const editor = container.querySelector('.launch-editor')
      const add = [...editor.querySelectorAll('button')].find((button) => button.textContent === '+ Add slide')
      const computed = getComputedStyle(add)
      const localRules = []
      function visit(rules) {
        for (const rule of rules) {
          if (rule.selectorText?.includes('.product-launch')) localRules.push(rule.selectorText)
          if (rule.cssRules) visit(rule.cssRules)
        }
      }
      for (const sheet of document.styleSheets) visit(sheet.cssRules)
      const collisions = []
      for (const control of editor.querySelectorAll(
        'button,input,select,textarea,label,fieldset,[role=status],[role=alert]',
      ))
        for (const selector of localRules)
          if (control.matches(selector)) collisions.push({ tag: control.tagName, selector })
      const color = document.createElement('span')
      color.style.color = 'var(--univer-primary-600)'
      add.append(color)
      const primary = getComputedStyle(color).color
      color.style.color = 'var(--univer-gray-0)'
      const foreground = getComputedStyle(color).color
      color.remove()
      return {
        collisions,
        background: computed.backgroundColor,
        color: computed.color,
        primary,
        foreground,
        radius: computed.borderRadius,
        maxWidth: computed.maxWidth,
        hostRadius: getComputedStyle(container.querySelector('.launch-tools fieldset button')).borderRadius,
        workbenchBackground: getComputedStyle(editor.querySelector('[data-u-comp="workbench-layout"]')).backgroundColor,
        theme: container.dataset.theme,
      }
    })
    assert.deepEqual(styles.collisions, [], 'Demo CSS must not override native Univer controls')
    assert.equal(styles.background, styles.primary)
    assert.equal(styles.color, styles.foreground)
    assert.equal(styles.radius, '8px')
    assert.equal(styles.maxWidth, 'none')
    assert.equal(styles.hostRadius, '6px')
    if (styles.theme === 'light') assert.equal(styles.workbenchBackground, 'rgb(255, 255, 255)')
    assert.equal(await root.locator('[data-u-comp="ribbon-grid-toolbar"]').isVisible(), true)
    results.push({ nativeStyles: styles })
  }
  await nativeStyles()
  const read = async () => JSON.parse(await root.locator('output').textContent())
  const click = async (name, error) => {
    await root.getByRole('button', { name, exact: true }).click()
    await idle()
    if (error) assert.match(await root.locator('[role=alert]').textContent(), error)
    else assert.equal(await root.locator('[role=alert]').isVisible(), false)
    return read()
  }
  const baseline = (await read()).snapshot
  const expandedHeight = await root.locator('.launch-editor').evaluate((element) => element.clientHeight)
  const expandedScrollHeight = await root.evaluate((element) => element.scrollHeight)
  await setToolsOpen(root, false)
  const collapsedSnapshot = (await read()).snapshot
  // Fit changes the saved viewport zoom, but no other presentation data.
  assert.deepEqual(
    collapsedSnapshot,
    { ...baseline, zoomRatio: collapsedSnapshot.zoomRatio },
    'Disclosure changes must not recreate or reset the deck',
  )
  assert.ok(Number.isFinite(collapsedSnapshot.zoomRatio) && collapsedSnapshot.zoomRatio > 0)
  const collapsedHeight = await root.locator('.launch-editor').evaluate((element) => element.clientHeight)
  const collapsedScrollHeight = await root.evaluate((element) => element.scrollHeight)
  assert.ok(collapsedHeight >= expandedHeight)
  assert.ok(
    collapsedHeight > expandedHeight + 100 || expandedScrollHeight > collapsedScrollHeight + 100,
    'Collapsed controls must give space back to the native editor or remove host scrolling',
  )
  const summary = root.locator(':scope > .launch-tools > summary')
  await summary.focus()
  await page.keyboard.press('Enter')
  await root.locator('.launch-tools[open]').waitFor()
  await idle()
  assert.ok(await summary.evaluate((element) => getComputedStyle(element).outlineWidth === '2px'))
  results.push({
    disclosure: {
      expandedHeight,
      collapsedHeight,
      expandedScrollHeight,
      collapsedScrollHeight,
      preservesContent: true,
      keyboard: true,
    },
  })
  await click('Show rollout')
  for (const id of PRODUCT_LAUNCH_DATA.slideOrder) {
    await page.evaluate(() => {
      globalThis.__launchPaint = []
    })
    await root.getByRole('combobox', { name: 'Slide', exact: true }).selectOption(id)
    const state = await click('Show slide')
    assert.equal(state.active, id)
    frames(state)
    if (whitePages.includes(id)) {
      const pixel = await root.evaluate((container) => {
        const { bounds } = JSON.parse(container.querySelector('output').textContent)
        const canvas = [...container.querySelectorAll('.launch-editor canvas')].find(
          (element) =>
            Math.abs(element.clientWidth - bounds.canvasWidth) < 1 &&
            Math.abs(element.clientHeight - bounds.canvasHeight) < 1,
        )
        if (!canvas) throw new Error('Native main canvas unavailable')
        return [
          ...canvas
            .getContext('2d')
            .getImageData(
              Math.round(((bounds.left + 8) * canvas.width) / canvas.clientWidth),
              Math.round(((bounds.top + 8) * canvas.height) / canvas.clientHeight),
              1,
              1,
            ).data,
        ]
      })
      assert.deepEqual(pixel, [255, 255, 255, 255], `${id}: the native page paints opaque white, not transparent`)
      results.push({ page: id, paperPixel: pixel })
    }
    assert.equal(
      await root.locator('textarea[aria-label="Speaker notes"]').inputValue(),
      PRODUCT_LAUNCH_DATA.slides[id].speakerNotes,
    )
    const painted = await page.evaluate(() =>
      globalThis.__launchPaint
        .map((item) => item.text)
        .join('')
        .replace(/\s/g, ''),
    )
    for (const element of Object.values(PRODUCT_LAUNCH_DATA.slides[id].elements)) {
      const text = element.text ?? element.shapeData?.shapeText?.text
      if (text && !painted.includes(text.replace(/\s/g, ''))) failures.push(`Missing native text: ${id}/${element.id}`)
    }
    await root.screenshot({ path: path.join(directory, `${id}.png`) })
  }
  await click('Show rollout')
  const original = await read()
  await page.evaluate(() => {
    globalThis.__launchPaint = []
  })
  let state = await click('Move GA by 7 days')
  frames(state)
  const expectedSlides = structuredClone(original.snapshot.slides)
  const oldText = expectedSlides.rollout.elements['ga-date'].shapeData.shapeText
  const newText = state.snapshot.slides.rollout.elements['ga-date'].shapeData.shapeText
  assert.equal(newText.text, 'MAR 10\nGeneral availability')
  assert.equal(newText.dataModel.doc.body.dataStream, 'MAR 10\rGeneral availability\r\n')
  assert.deepEqual(newText.dataModel.doc.documentStyle, oldText.dataModel.doc.documentStyle)
  assert.deepEqual(newText.dataModel.doc.body.textRuns, oldText.dataModel.doc.body.textRuns)
  assert.equal(newText.dataModel.ha, oldText.dataModel.ha)
  assert.equal(newText.dataModel.va, oldText.dataModel.va)
  expectedSlides.rollout.elements['ga-date'].shapeData.shapeText = newText
  expectedSlides.rollout.elements['ga-date'].transform.left = timelineX(35) - 60
  expectedSlides.rollout.elements['ga-marker'].transform.left = timelineX(35) - 8
  assert.deepEqual(state.snapshot.slides, expectedSlides, 'Only GA text and marker geometry change; notes stay intact')
  assert.ok(Math.abs(state.actual.find((item) => item.id === 'ga-marker').left - 842) < 0.01)
  const movedText = await page.evaluate(() =>
    globalThis.__launchPaint
      .map((item) => item.text)
      .join('')
      .replace(/\s/g, ''),
  )
  assert.ok(movedText.includes('MAR10Generalavailability'))
  await root.screenshot({ path: path.join(directory, 'ga-moved.png') })
  await click('Move GA by 7 days', /already moved/)
  assert.deepEqual((await read()).snapshot, state.snapshot)
  for (const [button, filename] of [
    ['Download snapshot', 'snapshot.json'],
    ['Download metrics', 'launch-metrics.json'],
  ]) {
    const pending = page.waitForEvent('download')
    await click(button)
    const download = await pending
    assert.equal(download.suggestedFilename(), filename)
    const destination = path.join(directory, filename)
    await download.saveAs(destination)
    const value = JSON.parse(await fs.readFile(destination, 'utf8'))
    if (filename === 'snapshot.json') assert.deepEqual(value, state.snapshot)
    else {
      assert.deepEqual(value.baseline, LAUNCH_METRICS)
      assert.deepEqual(value.currentMilestones, state.currentMilestones)
    }
  }
  state = await click('New starter deck')
  assert.deepEqual(state.snapshot.slideOrder, ['story', 'proof', 'rollout', 'blank'])
  assert.deepEqual(Object.keys(state.snapshot.slides).toSorted(), ['blank', 'proof', 'rollout', 'story'])
  assert.equal(state.snapshot.name, 'Your Product Launch')
  assert.equal(state.active, 'story')
  const starter = structuredClone(state.snapshot)
  await root.getByRole('combobox', { name: 'Slide', exact: true }).selectOption('blank')
  state = await click('Show slide')
  assert.equal(state.active, 'blank')
  assert.deepEqual(state.snapshot.slides.blank.elements, {})
  assert.deepEqual(state.actual, [])
  assert.ok(state.bounds.width > 0 && state.bounds.height > 0)
  assert.equal(
    await root.locator('textarea[aria-label="Speaker notes"]').inputValue(),
    starter.slides.blank.speakerNotes,
  )
  await root.screenshot({ path: path.join(directory, 'starter-blank.png') })
  await click('Show rollout')
  state = await click('Move GA by 7 days')
  assert.equal(state.currentMilestones.find((item) => item.id === 'ga').text, 'MAR 10\nGeneral availability')
  for (const id of ['story', 'proof', 'blank']) assert.deepEqual(state.snapshot.slides[id], starter.slides[id])
  assert.equal(state.snapshot.slides.rollout.speakerNotes, starter.slides.rollout.speakerNotes)
  await click('New starter deck')
  assert.deepEqual((await read()).snapshot.slides, starter.slides)
  await root.screenshot({ path: path.join(directory, 'starter-story.png') })
  const imageSources = await page.evaluate(() => {
    return [
      [320, 180, '#dc2626', 'image/png'],
      [90, 180, '#15803d', 'image/jpeg'],
      [4097, 1, '#fff', 'image/png'],
    ].map(([width, height, color, type]) => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      context.fillStyle = color
      context.fillRect(0, 0, width, height)
      return canvas.toDataURL(type, 0.95)
    })
  })
  const png = file('launch-landscape.png', 'image/png', imageSources[0])
  const upload = async (value, expectedError) => {
    await root.getByLabel('Local image', { exact: true }).setInputFiles(value)
    await idle()
    if (expectedError) assert.match(await root.locator('[role=alert]').textContent(), expectedError)
    else assert.equal(await root.locator('[role=alert]').isVisible(), false)
    return read()
  }
  const beforeMissing = (await read()).snapshot
  await upload(png, /Open Missing media variant/)
  assert.deepEqual((await read()).snapshot, beforeMissing)
  state = await click('Missing media variant')
  assert.equal(state.active, 'closing')
  assert.equal(state.mediaState, 'missing')
  const missing = structuredClone(state.snapshot)
  frames(state)
  await root.screenshot({ path: path.join(directory, 'media-missing.png') })
  const invalidImages = [
    [{ name: 'document.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') }, /PNG or JPEG/],
    [{ name: 'empty.png', mimeType: 'image/png', buffer: Buffer.alloc(0) }, /non-empty/],
    [{ name: 'oversize.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) }, /5 MiB/],
    [{ name: 'renamed.png', mimeType: 'image/png', buffer: Buffer.from('not PNG') }, /contents do not match/],
    [
      { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]) },
      /cannot be decoded/,
    ],
    [file('too-wide.png', 'image/png', imageSources[2]), /4096/],
  ]
  for (const [invalid, expectedError] of invalidImages) {
    await upload(invalid, expectedError)
    assert.deepEqual((await read()).snapshot, missing, 'Rejected files must preserve every page and placeholder')
  }
  state = await upload(png)
  assert.equal(state.mediaState, 'ready')
  frames(state)
  const firstImage = structuredClone(state.snapshot.slides.closing.elements[LAUNCH_MEDIA_SLOT.id])
  assert.equal(firstImage.type, 'image')
  assert.equal(firstImage.source, imageSources[0])
  assert.equal(firstImage.imageSourceType, 'BASE64')
  assert.equal(firstImage.transform.height, 340)
  assert.ok(Math.abs(firstImage.transform.width / firstImage.transform.height - 320 / 180) < 0.001)
  const expectedMediaSlides = structuredClone(missing.slides)
  expectedMediaSlides.closing.elements[LAUNCH_MEDIA_SLOT.id] = firstImage
  assert.deepEqual(
    state.snapshot.slides,
    expectedMediaSlides,
    'Only the media slot changes, including stable notes/order',
  )
  await assertMediaPixel(root, [220, 38, 38])
  await root.screenshot({ path: path.join(directory, 'media-landscape.png') })
  await focusNativeCanvas(root)
  await root.locator('[data-u-command="univer.command.undo"]').click()
  state = await click('Inspect')
  assert.deepEqual(state.snapshot.slides, missing.slides, 'One native Undo restores the placeholder')
  await focusNativeCanvas(root)
  await root.locator('[data-u-command="univer.command.redo"]').click()
  state = await click('Inspect')
  assert.deepEqual(state.snapshot.slides, expectedMediaSlides)
  await assertMediaPixel(root, [220, 38, 38])
  state = await upload(file('launch-portrait.jpg', 'image/jpeg', imageSources[1]))
  frames(state)
  const secondImage = state.snapshot.slides.closing.elements[LAUNCH_MEDIA_SLOT.id]
  assert.equal(secondImage.source, imageSources[1])
  assert.equal(secondImage.transform.height, 340)
  assert.equal(secondImage.transform.width, 170)
  await assertMediaPixel(root, [21, 128, 61])
  const replaced = structuredClone(state.snapshot)
  await focusNativeCanvas(root)
  await root.locator('[data-u-command="univer.command.undo"]').click()
  state = await click('Inspect')
  assert.deepEqual(state.snapshot.slides, expectedMediaSlides, 'A second replacement has its own undo group')
  await assertMediaPixel(root, [220, 38, 38])
  await focusNativeCanvas(root)
  await root.locator('[data-u-command="univer.command.redo"]').click()
  state = await click('Inspect')
  assert.deepEqual(state.snapshot.slides, replaced.slides)
  await upload(invalidImages[3][0], invalidImages[3][1])
  assert.deepEqual((await read()).snapshot, replaced, 'A bad replacement must retain the valid image')
  state = await click('Reload snapshot')
  assert.deepEqual(state.snapshot.slides, replaced.slides)
  assert.equal(state.mediaState, 'ready')
  await assertMediaPixel(root, [21, 128, 61])
  const mediaDownload = page.waitForEvent('download')
  await click('Download snapshot')
  const downloadedMedia = await mediaDownload
  const mediaPath = path.join(directory, 'media-snapshot.json')
  await downloadedMedia.saveAs(mediaPath)
  assert.deepEqual(JSON.parse(await fs.readFile(mediaPath, 'utf8')), (await read()).snapshot)
  await root.screenshot({ path: path.join(directory, 'media-reloaded.png') })
  results.push({
    media: 'passed',
    invalidFiles: invalidImages.length,
    nativeUndoRedo: true,
    localSnapshotRoundtrip: true,
  })
  state = await click('Reset deck')
  assert.deepEqual(state.snapshot.slides, baseline.slides)
  assert.equal(state.active, 'story')
  const controls = root.locator('fieldset').locator('button,select,input')
  assert.equal(await controls.count(), 13)
  await controls.first().focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  for (let index = 0; index < 13; index++) {
    assert.ok(
      await controls
        .nth(index)
        .evaluate((element) => element === document.activeElement && getComputedStyle(element).outlineWidth === '2px'),
    )
    await page.keyboard.press('Tab')
  }
  await root.getByRole('button', { name: 'Show rollout', exact: true }).focus()
  await page.keyboard.press('Enter')
  await idle()
  assert.equal((await read()).active, 'rollout')
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    state = await click('Fit slide')
    assert.ok(state.bounds.canvasWidth >= (await root.evaluate((element) => element.clientWidth)) - 40)
    assert.ok(state.bounds.width >= 220)
    frames(state)
    results.push({ width, bounds: state.bounds })
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  if (new URL(url).pathname.includes('/playground/')) {
    await page.setViewportSize({ width: 1600, height: 1200 })
    await click('Fit slide')
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.product-launch[data-theme=${theme}][data-ready=true]`).waitFor({ timeout: 120000 })
      await idle()
      assert.deepEqual((await read()).snapshot.slides, baseline.slides)
      await nativeStyles()
      await setToolsOpen(root, true)
    }
    for (const [locale, title, variantHeading, actionHeading, stateHeading, starterLabel] of [
      ['en-US', 'Product Launch', 'Variants', 'Actions', 'States', 'Four-page starter deck'],
      ['zh-CN', '产品发布', '变体', '操作', '状态', '四页起始文稿'],
    ]) {
      const response = await page.goto(`${new URL(url).origin}/${locale}/showcase/slides/product-launch`, {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      })
      assert.equal(response.status(), 200)
      await page.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
      for (const name of [variantHeading, actionHeading, stateHeading])
        assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      assert.equal(await page.getByText(starterLabel, { exact: true }).isVisible(), true)
      const sidebar = page.locator('aside')
      assert.equal(await sidebar.getByRole('link', { name: title, exact: true }).count(), 1)
      assert.equal(await sidebar.getByRole('button', { expanded: true }).count(), 3)
      const iframe = page.locator('iframe').first()
      await iframe.scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first().locator('.product-launch')
      await embedded.locator('fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
      assert.equal(await embedded.locator('.launch-tools').evaluate((element) => element.open), false)
      const layout = await embedded.evaluate((element) => ({
        height: element.clientHeight,
        scrollHeight: element.scrollHeight,
        editorHeight: element.querySelector('.launch-editor').clientHeight,
      }))
      assert.ok(layout.editorHeight >= 560)
      assert.ok(
        layout.scrollHeight <= layout.height + 2,
        'Collapsed controls and native editor fit the embedded preview',
      )
      await iframe.screenshot({ path: path.join(directory, `editor-first-${locale}.png`) })
      await setToolsOpen(embedded, true)
      await embedded.getByRole('button', { name: 'New starter deck', exact: true }).click()
      await embedded.locator('fieldset:not([disabled])').waitFor()
      const starterState = JSON.parse(await embedded.locator('output').textContent())
      assert.deepEqual(starterState.snapshot.slideOrder, ['story', 'proof', 'rollout', 'blank'])
      await embedded.getByRole('combobox', { name: 'Slide', exact: true }).selectOption('blank')
      await embedded.getByRole('button', { name: 'Show slide', exact: true }).click()
      await embedded.locator('fieldset:not([disabled])').waitFor()
      assert.deepEqual(JSON.parse(await embedded.locator('output').textContent()).snapshot.slides.blank.elements, {})
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      }
      await page.setViewportSize({ width: 1600, height: 1200 })
      await page.screenshot({ path: path.join(directory, `detail-${locale}.png`) })
      await setToolsOpen(embedded, false)
      assert.deepEqual(JSON.parse(await embedded.locator('output').textContent()).snapshot.slides.blank.elements, {})
      results.push({ detailLocale: locale, sidebarDepth: 4, starterInIframe: true, narrowOverflow: false, layout })
    }
  }
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: failures.length ? 'failed' : 'passed', errors, failures, results }, null, 2),
  )
  assert.deepEqual(failures, [])
  console.log(
    'PASS eleven-slide launch, native text/frames, synchronized milestone edit, downloads and shared controls',
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

function frames(state) {
  for (const actual of state.actual) {
    const expected = state.snapshot.slides[state.active].elements[actual.id].transform
    for (const field of ['left', 'top', 'width', 'height'])
      assert.ok(
        actual[field] !== null && Math.abs(actual[field] - expected[field]) < 0.01,
        `${state.active}/${actual.id}/${field}: ${actual[field]} vs ${expected[field]}`,
      )
  }
}

async function setToolsOpen(root, open) {
  const panel = root.locator(':scope > .launch-tools')
  if ((await panel.evaluate((element) => element.open)) === open) return
  await panel.locator(':scope > summary').click()
  // The native toggle event is queued; allow its resize/fit work to start.
  await root.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await root.locator('fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
  assert.equal(await panel.evaluate((element) => element.open), open)
}

async function assertMediaPixel(root, expectedColor) {
  // Wait for the SDK's asynchronous native image decode/paint, not an HTML overlay.
  await root.page().waitForFunction(
    ({ id, color }) => {
      const container = document.querySelector('.product-launch')
      const { bounds, snapshot } = JSON.parse(container.querySelector('output').textContent)
      const image = snapshot.slides.closing.elements[id].transform
      const scale = bounds.width / snapshot.defaultPageSize.width
      const canvas = [...container.querySelectorAll('.launch-editor canvas')].find(
        (item) =>
          Math.abs(item.clientWidth - bounds.canvasWidth) < 1 && Math.abs(item.clientHeight - bounds.canvasHeight) < 1,
      )
      if (!canvas) return false
      const pixel = canvas
        .getContext('2d')
        .getImageData(
          Math.round(((bounds.left + (image.left + image.width * 0.25) * scale) * canvas.width) / canvas.clientWidth),
          Math.round(((bounds.top + (image.top + image.height * 0.25) * scale) * canvas.height) / canvas.clientHeight),
          1,
          1,
        ).data
      return color.every((value, index) => Math.abs(pixel[index] - value) <= 4) && pixel[3] === 255
    },
    { id: LAUNCH_MEDIA_SLOT.id, color: expectedColor },
    { timeout: 15000 },
  )
}

function file(name, mimeType, source) {
  return { name, mimeType, buffer: Buffer.from(source.split(',')[1], 'base64') }
}

async function focusNativeCanvas(root) {
  const position = await root.evaluate((container) => {
    const { bounds } = JSON.parse(container.querySelector('output').textContent)
    const canvas = [...container.querySelectorAll('.launch-editor canvas')].find(
      (item) =>
        Math.abs(item.clientWidth - bounds.canvasWidth) < 1 && Math.abs(item.clientHeight - bounds.canvasHeight) < 1,
    )
    const rect = canvas.getBoundingClientRect()
    return { x: rect.left + bounds.left + 8, y: rect.top + bounds.top + 8 }
  })
  await root.page().mouse.click(position.x, position.y)
}
