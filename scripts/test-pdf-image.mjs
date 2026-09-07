/* eslint-disable no-await-in-loop -- Exercise one real PDF editor in user-action order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { REVIEW_DATE, source } from '../showcase/pdfs/image-placement-crop/code/data.ts'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-image')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/pdfs/image-placement-crop'
const root = page.locator('.pdf-image')
const read = async () => JSON.parse(await root.locator('output').textContent())
const idle = () =>
  root.locator('.image-controls > fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
const click = async (action, error) => {
  if (process.env.SHOWCASE_TRACE === '1') console.log(`Action: ${action}`)
  await root.locator(`[data-action=${action}]`).click()
  await idle()
  if (error) assert.match(await root.locator(':scope > [role=alert]').textContent(), error)
  else
    assert.equal(
      await root.locator(':scope > [role=alert]').isVisible(),
      false,
      await root.locator(':scope > [role=alert]').textContent(),
    )
  return read()
}
const fill = (name, value) => root.locator(`[data-input=${name}]`).fill(String(value))
const choose = (name, value) => root.locator(`[data-input=${name}]`).selectOption(value)
const disabled = async (name) => assert.equal(await root.locator(`[data-action=${name}]`).isDisabled(), true, name)
const colors = () =>
  root
    .locator('[data-pdf-active-page-id] > canvas')
    .first()
    .evaluate((element) => {
      const pixels = element.getContext('2d').getImageData(0, 0, element.width, element.height).data
      let red = 0,
        violet = 0,
        teal = 0
      for (let n = 0; n < pixels.length; n += 4) {
        if (pixels[n + 3] < 200) continue
        if (pixels[n] > 180 && pixels[n + 1] < 90 && pixels[n + 2] < 90) red++
        if (pixels[n] > 90 && pixels[n] < 160 && pixels[n + 1] < 95 && pixels[n + 2] > 180) violet++
        if (pixels[n] < 40 && pixels[n + 1] > 100 && pixels[n + 1] < 180 && pixels[n + 2] > 80) teal++
      }
      return { red, violet, teal }
    })
const waitColors = async (predicate) => {
  for (let n = 0; n < 100; n++) {
    const value = await colors()
    if (predicate(value)) return value
    await page.waitForTimeout(50)
  }
  assert.fail(`Native image paint did not reach expected state: ${JSON.stringify(await colors())}`)
}
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await idle()
  const initial = await read()
  assert.equal(initial.snapshot.metadata.reviewDate, REVIEW_DATE)
  assert.equal(initial.image.source, source('summer'))
  assert.equal(initial.image.crop, null)
  await waitColors((value) => value.red > 50 && value.teal > 50)
  assert.equal(
    await root.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  await root.locator('.image-controls > summary').click()
  await page.waitForTimeout(250)
  const initialPaint = await waitColors((value) => value.red > 50 && value.teal > 50)
  for (const action of ['insert', 'source', 'transform', 'crop', 'opacity', 'undo', 'redo']) await disabled(action)
  await choose('source', 'winter')
  let state = await click('source')
  assert.equal(state.image.source, source('winter'))
  assert.deepEqual(state.image.transform, initial.image.transform)
  assert.deepEqual(state.text, initial.text)
  await waitColors((value) => value.violet > 50 && value.red === 0)
  await disabled('source')
  await click('undo')
  assert.equal((await read()).image.source, source('summer'))
  await waitColors((value) => value.red > 50 && value.violet === 0)
  await click('redo')
  assert.equal((await read()).image.source, source('winter'))
  await click('reset')
  for (const side of ['left', 'right', 'full']) {
    await choose('crop', side)
    state = await click('crop')
    assert.deepEqual(state.image.crop, {
      left: side === 'right' ? 225 : 0,
      top: 0,
      right: side === 'left' ? 225 : 450,
      bottom: 270,
    })
    assert.equal(state.image.source, initial.image.source)
    assert.deepEqual(state.text, initial.text)
    await disabled('crop')
    // The SDK scales the cropped source window into the unchanged placement.
    if (side === 'left') await waitColors((value) => value.red > initialPaint.red * 1.6)
    if (side === 'right') await waitColors((value) => value.red === 0 && value.teal > 50)
    if (side === 'full') await waitColors((value) => value.red > 50 && value.teal > initialPaint.teal * 0.9)
  }
  await click('undo')
  assert.equal((await read()).image.crop.left, 225)
  await click('redo')
  const beforePlacementPaint = await root
    .locator('[data-pdf-active-page-id] > canvas')
    .first()
    .evaluate((e) => e.toDataURL())
  await fill('left', 96)
  await fill('top', 165)
  await fill('width', 360)
  await fill('height', 216)
  await fill('rotation', 15)
  state = await click('transform')
  for (const [key, expected] of Object.entries({ left: 96, top: 165, width: 360, height: 216, rotation: 15 }))
    assert.ok(Math.abs(state.image.transform[key] - expected) < 0.001, key)
  await page.waitForFunction(
    (before) => document.querySelector('.pdf-image [data-pdf-active-page-id] > canvas').toDataURL() !== before,
    beforePlacementPaint,
  )
  await disabled('transform')
  const positioned = state.snapshot
  const positionedImage = state.image
  await fill('width', 0)
  await click('transform', /positive/)
  assert.deepEqual((await read()).snapshot, positioned)
  await fill('width', '')
  await click('transform', /required/)
  assert.deepEqual((await read()).snapshot, positioned)
  await click('undo')
  assert.deepEqual((await read()).image.transform, initial.image.transform)
  await click('redo')
  // Native history restores content while advancing SDK revision/timestamps.
  assert.deepEqual((await read()).image, positionedImage)
  assert.deepEqual((await read()).text, initial.text)
  await click('reset')
  await fill('opacity', 0)
  state = await click('opacity')
  assert.equal(state.image.opacity, 0)
  await waitColors((value) => value.red === 0 && value.teal === 0)
  await disabled('opacity')
  await fill('opacity', 1.1)
  await click('opacity', /between 0 and 1/)
  assert.deepEqual((await read()).snapshot, state.snapshot)
  await click('undo')
  assert.equal((await read()).image.opacity, 1)
  await waitColors((value) => value.red > 50)
  await click('redo')
  assert.equal((await read()).image.opacity, 0)
  await fill('opacity', 0.5)
  await click('opacity')
  const faded = (await read()).snapshot
  await click('invalid', /positive width and height/)
  assert.deepEqual((await read()).snapshot, faded)
  state = await click('remove')
  assert.equal(state.image, null)
  assert.deepEqual(state.text, initial.text)
  for (const action of ['source', 'transform', 'crop', 'opacity', 'remove', 'invalid']) await disabled(action)
  await click('undo')
  assert.equal((await read()).image.opacity, 0.5)
  await click('redo')
  await choose('source', 'winter')
  await click('insert')
  assert.equal((await read()).image.source, source('winter'))
  await waitColors((value) => value.violet > 50)
  report.checks.push(
    'Actual source, crop, transform, opacity and removal Facades; native image pixels; unchanged captions; no-op guards; SDK errors and history',
  )
  const edited = (await read()).snapshot
  await click('reload')
  assert.deepEqual((await read()).snapshot, edited)
  const downloading = page.waitForEvent('download')
  await click('download')
  const download = await downloading
  assert.equal(download.suggestedFilename(), 'ridgeway-image-proof.json')
  const file = path.join(directory, download.suggestedFilename())
  await download.saveAs(file)
  assert.deepEqual(JSON.parse(await fs.readFile(file, 'utf8')), edited)
  await root.locator('.image-controls > summary').click()
  // Disclosure resizing fits the native page asynchronously; wait for the actual canvas geometry.
  await page.waitForFunction(() => {
    const area = document.querySelector('.pdf-image [data-pdf-scroll-container]')
    const canvas = document.querySelector('.pdf-image [data-pdf-active-page-id] > canvas')
    const expected = Math.min((841.89 * 4) / 3, ((area.clientWidth - 48) * 841.89) / 595.276, area.clientHeight - 48)
    return Math.abs(canvas.getBoundingClientRect().height - expected) < 3
  })
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    )
  })
  await root.screenshot({ path: path.join(directory, 'native-image-proof.png') })
  await root.locator('.image-controls > summary').click()
  for (const fixture of ['default', 'empty', 'boundary', 'error']) {
    await choose('fixture', fixture)
    const first = await click('fixture', fixture === 'error' ? /positive width and height/ : undefined)
    const second = await click('fixture', fixture === 'error' ? /positive width and height/ : undefined)
    assert.deepEqual(second.snapshot, first.snapshot)
    if (fixture === 'empty') assert.equal(second.image, null)
    if (fixture === 'boundary') assert.equal(second.image.opacity, 0)
    if (fixture === 'default' || fixture === 'error') assert.deepEqual(second.snapshot, initial.snapshot)
  }
  await click('reset')
  assert.deepEqual((await read()).snapshot, initial.snapshot)
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    assert.ok(await root.evaluate((e) => e.scrollWidth <= e.clientWidth + 1))
    await root.locator('[data-action=remove]').focus()
    await page.keyboard.press('Enter')
    await idle()
    assert.equal((await read()).image, null)
    await click('reset')
  }
  report.checks.push(
    'Exact snapshot reload/download, four repeatable fixtures, complete Reset and narrow keyboard actions',
  )
  if (process.env.SHOWCASE_DETAILS === '1') {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const [locale, title, labels] of [
      ['en-US', 'Image Placement and Cropping', ['Variants', 'Actions', 'States']],
      ['zh-CN', '图片排版与裁剪', ['变体', '操作', '状态']],
    ]) {
      const response = await page.goto(`${new URL(url).origin}/${locale}/showcase/pdfs/image-placement-crop`, {
        waitUntil: 'load',
        timeout: 180000,
      })
      assert.equal(response.status(), 200)
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of labels) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      assert.equal(await page.locator('aside').getByRole('button', { expanded: true }).count(), 3)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first().locator('.pdf-image')
      const ready = () =>
        embedded.locator('.image-controls > fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
      await ready()
      await embedded.locator('.image-controls > summary').click()
      await embedded.locator('[data-action=remove]').click()
      await ready()
      assert.equal(JSON.parse(await embedded.locator('output').textContent()).image, null)
      await embedded.locator('[data-action=undo]').click()
      await ready()
      assert.equal(JSON.parse(await embedded.locator('output').textContent()).image.source, source('summer'))
      await embedded.locator('.image-controls > summary').click()
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push('Localized detailed variants/actions/states, four-level tree and real iframe Facade history')
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  throw error
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
