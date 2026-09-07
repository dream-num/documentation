/* eslint-disable no-await-in-loop -- Exercise a single document in history order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import {
  ALT_TEXT,
  CHART_VALUES,
  COAST_SVG,
  IMAGE_ID,
  SCHEDULE,
} from '../showcase/docs-modern/images-and-wrapping/code/data.ts'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-images')
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/docs-modern/images-and-wrapping'
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1600, height: 1250 } })
page.setDefaultTimeout(15000)
const errors = [],
  results = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
await page.addInitScript(() => {
  window.imagePaints = []
  const original = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.drawImage = function (...args) {
    const source = args[0]?.src
    if (source?.startsWith('data:image/')) {
      const record = { source, args: args.slice(1) }
      if (window.imagePaints.length > 500) window.imagePaints.shift()
      window.imagePaints.push(record)
    }
    return original.apply(this, args)
  }
})
const image = (s) => s.images.find((i) => i.id === IMAGE_ID)
const bounds = (s) => s.layout.flatMap((p) => p.drawings).find((d) => d.id === IMAGE_ID)
const independent = (s) => ({ groups: s.groups, tables: s.tables, charts: s.charts })
const semanticImage = (s) => {
  const i = image(s)
  return (
    i && {
      size: i.size,
      angle: i.angle,
      positionH: i.positionH,
      positionV: i.positionV,
      description: i.data.description,
      crop: i.data.srcRect ?? null,
      layout: i.data.layoutType,
      behind: i.data.behindDoc,
      source: i.data.source,
    }
  )
}
try {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const demo = page.locator('.images-demo'),
    controls = demo.locator('fieldset')
  await page.locator('.images-demo[data-ready=true]').waitFor({ timeout: 90000 })
  const read = async () => JSON.parse(await demo.locator('output').textContent())
  const click = async (name, expectedError = false) => {
    await controls.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.images-demo fieldset')?.disabled === false)
    assert.equal(
      await demo.locator('[role=alert]').isVisible(),
      expectedError,
      await demo.locator('[role=alert]').textContent(),
    )
    return read()
  }
  const capture = async (name) => {
    await demo.screenshot({ path: path.join(directory, name + '.png') })
  }
  const history = async (before, after, label) => {
    await page.waitForTimeout(400)
    assert.deepEqual(semanticImage(await click('Undo')), semanticImage(before), label + ' undo')
    assert.deepEqual(semanticImage(await click('Redo')), semanticImage(after), label + ' redo')
    results.push(label + ' history')
  }
  const baseline = await click('Inspect')
  assert.equal(baseline.images.length, 1)
  assert.equal(baseline.groups.length, 1)
  assert.equal(baseline.groups[0].columnCount, 2)
  assert.ok(
    baseline.groupRanges[0].range.endOffset <=
      baseline.paragraphs.find((p) => p.text.includes('03 · Station schedule')).range.startOffset,
    'Method comparison stays before the station-schedule heading',
  )
  assert.deepEqual(baseline.tables[0].values, SCHEDULE)
  assert.deepEqual(baseline.charts[0].info.dataSource.values, CHART_VALUES)
  assert.equal(Buffer.from(image(baseline).data.source.split(',')[1], 'base64').toString(), COAST_SVG)
  assert.equal(image(baseline).data.description, '')
  await page.waitForFunction(() => window.imagePaints.some((p) => p.source.startsWith('data:image/svg+xml')))
  await capture('inline')
  assert.deepEqual(semanticImage(await click('Insert image')), semanticImage(baseline))
  await click('Align floating image', true)
  await controls.getByRole('spinbutton', { name: 'Width', exact: true }).fill('0')
  await click('Resize', true)
  assert.deepEqual(semanticImage(await read()), semanticImage(baseline))
  await controls.getByRole('spinbutton', { name: 'Width', exact: true }).fill('240')
  await controls.getByRole('textbox', { name: 'Alt text', exact: true }).fill('   ')
  await click('Set alt text', true)
  await controls.getByRole('textbox', { name: 'Alt text', exact: true }).fill(ALT_TEXT)
  const described = await click('Set alt text')
  assert.equal(image(described).data.description, ALT_TEXT)
  await history(baseline, described, 'alt text')
  await click('Reset')
  await controls.getByRole('spinbutton', { name: 'Width', exact: true }).fill('300')
  await controls.getByRole('spinbutton', { name: 'Height', exact: true }).fill('180')
  const resized = await click('Resize')
  assert.deepEqual(image(resized).size, { width: 300, height: 180 })
  await history(baseline, resized, 'size')
  await click('Reset')
  await controls.getByRole('combobox', { name: 'Wrapping', exact: true }).selectOption('WRAP_SQUARE')
  const square = await click('Apply wrapping')
  assert.notDeepEqual(
    square.layout.map((p) => p.sections),
    baseline.layout.map((p) => p.sections),
    'Square wrapping changes real text lines, not only image bounds',
  )
  await history(baseline, square, 'square wrap')
  await capture('square-left')
  const aligned = []
  for (const align of ['LEFT', 'CENTER', 'RIGHT']) {
    await controls.getByRole('combobox', { name: 'Alignment', exact: true }).selectOption(align)
    const state = await click('Align floating image')
    assert.deepEqual(independent(state), independent(baseline))
    aligned.push(state)
    await capture('square-' + align.toLowerCase())
  }
  assert.ok(
    bounds(aligned[0]).left < bounds(aligned[1]).left && bounds(aligned[1]).left < bounds(aligned[2]).left,
    'Actual image layout moves left, center and right',
  )
  assert.notDeepEqual(aligned[0].layout, aligned[1].layout)
  for (const wrap of ['WRAP_TOP_AND_BOTTOM', 'BEHIND_TEXT', 'IN_FRONT_OF_TEXT', 'INLINE']) {
    await controls.getByRole('combobox', { name: 'Wrapping', exact: true }).selectOption(wrap)
    const state = await click('Apply wrapping')
    assert.deepEqual(independent(state), independent(baseline))
    await capture(wrap.toLowerCase())
    results.push({ wrap, layout: state.layout, image: semanticImage(state) })
  }
  await click('Reset')
  for (const [crop, expectedSize, expectedRect] of [
    ['recorder', { width: 120, height: 150 }, { left: 60, right: 60, top: 0, bottom: 0 }],
    ['horizon', { width: 240, height: 75 }, { left: 0, right: 0, top: 30, bottom: 45 }],
    ['full', { width: 240, height: 150 }, null],
  ]) {
    const before = await read()
    await controls.getByRole('combobox', { name: 'Crop', exact: true }).selectOption(crop)
    const state = await click('Apply crop')
    assert.deepEqual(image(state).size, expectedSize)
    assert.deepEqual(image(state).data.srcRect ?? null, expectedRect)
    const renderedCrop = state.renderedImages.find((i) => i.id === IMAGE_ID)?.crop
    assert.equal(state.renderedImages.find((i) => i.id === IMAGE_ID)?.exists, true)
    if (observe && crop !== 'full') {
      assert.deepEqual(
        renderedCrop,
        {
          left: (expectedRect.left * expectedSize.width) / image(before).size.width,
          right: (expectedRect.right * expectedSize.width) / image(before).size.width,
          top: (expectedRect.top * expectedSize.height) / image(before).size.height,
          bottom: (expectedRect.bottom * expectedSize.height) / image(before).size.height,
        },
        'Observe the specific beta.2 double-scaling defect, not an arbitrary mismatch',
      )
      results.push({ knownDefect: 'crop-render-mismatch', crop, expectedRect, renderedCrop })
    } else
      assert.deepEqual(
        renderedCrop,
        expectedRect,
        'Actual render image must receive the crop, not just document metadata',
      )
    assert.deepEqual(independent(state), independent(baseline))
    await history(before, state, crop + ' crop')
    results.push({ crop, afterRedo: (await read()).renderedImages })
    const paintWidth = expectedSize.width + (renderedCrop?.left ?? 0) + (renderedCrop?.right ?? 0)
    const paintHeight = expectedSize.height + (renderedCrop?.top ?? 0) + (renderedCrop?.bottom ?? 0)
    await page.waitForFunction(
      ({ width, height }) =>
        window.imagePaints.some(
          (p) =>
            p.source.startsWith('data:image/svg+xml') &&
            p.args.length === 4 &&
            Math.abs(p.args[2] - width) < 0.01 &&
            Math.abs(p.args[3] - height) < 0.01,
        ),
      { width: paintWidth, height: paintHeight },
    )
    await capture(crop + '-crop')
    let cropReloaded = await click('Reload snapshot')
    for (
      let attempt = 0;
      attempt < 30 && !cropReloaded.renderedImages.find((i) => i.id === IMAGE_ID)?.exists;
      attempt++
    ) {
      await page.waitForTimeout(100)
      cropReloaded = await click('Inspect')
    }
    assert.equal(
      cropReloaded.renderedImages.find((i) => i.id === IMAGE_ID)?.exists,
      true,
      'Reloaded image finishes asynchronous creation',
    )
    assert.deepEqual(
      cropReloaded.renderedImages.find((i) => i.id === IMAGE_ID)?.crop,
      expectedRect,
      'A freshly loaded render image must use the persisted crop exactly',
    )
    assert.deepEqual(semanticImage(cropReloaded), semanticImage(state))
    assert.deepEqual(independent(cropReloaded), independent(baseline))
    results.push({ crop, afterReload: cropReloaded.renderedImages })
    await capture(crop + '-reloaded')
  }
  await click('Reset')
  const rotated = await click('Rotate 15°')
  assert.equal(image(rotated).angle, 15)
  await history(baseline, rotated, 'rotation')
  await click('Set alt text')
  const beforeRoundtrip = await click('Inspect'),
    reloaded = await click('Reload snapshot')
  assert.deepEqual(semanticImage(reloaded), semanticImage(beforeRoundtrip))
  assert.deepEqual(independent(reloaded), independent(baseline))
  const removed = await click('Delete image')
  assert.equal(removed.images.length, 0)
  assert.equal(
    removed.blocks.some((b) => b.blockId === IMAGE_ID),
    false,
  )
  await history(beforeRoundtrip, removed, 'remove')
  await click('Resize', true)
  assert.equal((await click('Insert image')).images.length, 1)
  assert.equal((await click('Insert image')).images.length, 1)
  await click('Show chart')
  await page.waitForFunction(() => window.imagePaints.some((p) => p.source.startsWith('data:image/png')))
  await capture('chart')
  const empty = await click('Empty document')
  assert.equal(empty.images.length, 0)
  assert.equal(empty.tables.length, 0)
  assert.equal(empty.groups.length, 0)
  assert.equal(empty.charts.length, 0)
  await click('Apply crop', true)
  const emptyImage = await click('Insert image')
  assert.equal(emptyImage.images.length, 1)
  await click('Set alt text')
  await click('Reload snapshot')
  const reset = await click('Reset')
  assert.deepEqual(semanticImage(reset), semanticImage(baseline))
  assert.deepEqual(independent(reset), independent(baseline))
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.waitForTimeout(700)
  await page.locator('.images-demo[data-ready=true]').waitFor()
  if (new URL(url).pathname.includes('/playground/')) {
    assert.equal(await demo.getAttribute('data-theme'), 'dark', 'Documentation theme recreates the dark SDK runtime')
    results.push('documentation dark theme')
  } else {
    assert.equal(await demo.getAttribute('data-theme'), 'light')
    results.push('standalone uses its documented default light theme; theme integration is tested in documentation')
  }
  await click('Inspect')
  await capture('dark')
  await page.setViewportSize({ width: 760, height: 1000 })
  await page.waitForTimeout(500)
  await click('Inspect')
  assert.ok((await demo.boundingBox()).width <= 760, 'No intrinsic grid expansion')
  await capture('narrow')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.images-demo[data-ready=true]').waitFor({ timeout: 90000 })
  assert.equal(await demo.count(), 1)
  assert.equal(await demo.locator('.images-editor canvas').count(), 1, 'Remount leaves one live editor canvas')
  assert.deepEqual(semanticImage(await click('Inspect')), semanticImage(baseline))
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: observe ? 'passed-with-known-sdk-defect' : 'passed', url, results, errors }, null, 2),
  )
  console.log(
    observe
      ? 'PASS observed-defect image checks; crop rendering remains a strict failure'
      : 'PASS image rendering, wrapping, alignment, crop, metadata, history, mixed-content isolation, reset and remount',
  )
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true })
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      {
        message: error.message,
        errors,
        results,
        readback: await page
          .locator('.images-demo output')
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
