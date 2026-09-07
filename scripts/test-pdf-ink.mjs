/* eslint-disable no-await-in-loop -- Exercise one real PDF editor in user-action order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { PLAN_SVG, REVIEW_DATE, STROKES } from '../showcase/pdfs/ink-freehand-review/code/data.ts'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-ink')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/pdfs/ink-freehand-review'
const root = page.locator('.pdf-ink')
const read = async () => JSON.parse(await root.locator('output').textContent())
const idle = () =>
  root.locator('.ink-controls > fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
const click = async (action, expectedError) => {
  await root.locator(`[data-action=${action}]`).click()
  await idle()
  if (expectedError) assert.match(await root.locator(':scope > [role=alert]').textContent(), expectedError)
  else
    assert.equal(
      await root.locator(':scope > [role=alert]').isVisible(),
      false,
      await root.locator(':scope > [role=alert]').textContent(),
    )
  return read()
}
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const canvas = () => root.locator('[data-pdf-active-page-id] > canvas').first()
const redPixels = async () => {
  await settle()
  return canvas().evaluate((element) => {
    const sx = element.width / 595.276,
      sy = element.height / 841.89
    const pixels = element
      .getContext('2d')
      .getImageData(Math.round(43 * sx), Math.round(131 * sy), Math.round(110 * sx), Math.round(60 * sy)).data
    let count = 0
    for (let n = 0; n < pixels.length; n += 4)
      if (pixels[n] > 180 && pixels[n + 1] < 100 && pixels[n + 2] < 100 && pixels[n + 3] > 200) count++
    return count
  })
}
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await idle()
  await canvas().waitFor()
  const initial = await read()
  assert.equal(initial.imageCount, 1)
  assert.equal(initial.annotations.length, 0)
  assert.equal(initial.snapshot.metadata.reviewDate, REVIEW_DATE)
  assert.ok(JSON.stringify(initial.snapshot).includes(Buffer.from(PLAN_SVG).toString('base64')))
  assert.equal(
    await root.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  await root.locator('.ink-controls > summary').click()
  assert.equal(await root.locator('[data-action=remove]').isDisabled(), true)
  const plain = await redPixels()
  let state = await click('add')
  assert.equal(state.annotations.length, 1)
  assert.equal(state.annotations[0].id, STROKES[0].id)
  for (let n = 0; n < STROKES[0].paths[0].length; n++)
    for (let axis = 0; axis < 2; axis++)
      assert.ok(
        Math.abs(state.annotations[0].ink.paths[0][n][axis] - STROKES[0].paths[0][n][axis]) < 0.0001,
        'PDF point/EMU conversion must preserve the supplied geometry',
      )
  assert.equal(await root.locator('[data-action=add]').isDisabled(), true)
  assert.ok((await redPixels()) > plain + 100, 'The native page must paint the circle around Exit A')
  await root.locator('[data-input=width]').fill('8')
  state = await click('style')
  assert.equal(state.annotations[0].style.stroke.width, 8)
  assert.equal(await root.locator('[data-action=style]').isDisabled(), true)
  const thick = await redPixels()
  const geometry = state.annotations[0].ink.paths
  await root.locator('[data-input=color]').fill('#7c3aed')
  state = await click('style')
  assert.equal(state.annotations[0].style.stroke.color, '#7c3aed')
  assert.deepEqual(state.annotations[0].ink.paths, geometry)
  assert.ok((await redPixels()) < thick)
  await click('undo')
  assert.equal((await read()).annotations[0].style.stroke.color, '#dc2626')
  await click('undo')
  assert.ok((await redPixels()) < thick)
  await click('redo')
  await root.locator('[data-input=width]').fill('0')
  const beforeInvalid = (await read()).snapshot
  await click('style', /0.5–12/)
  assert.deepEqual((await read()).snapshot, beforeInvalid)
  await root.locator('[data-input=target]').selectOption('1')
  await click('add')
  await root.locator('[data-input=target]').selectOption('2')
  const three = await click('add')
  assert.deepEqual(
    three.annotations.map((a) => a.id),
    STROKES.map((a) => a.id),
  )
  state = await click('remove')
  assert.deepEqual(
    state.annotations.map((a) => a.id),
    STROKES.slice(0, 2).map((a) => a.id),
  )
  await click('undo')
  assert.deepEqual((await read()).annotations, three.annotations)
  await click('redo')
  assert.equal((await read()).annotations.length, 2)
  assert.deepEqual((await read()).text, initial.text)
  assert.equal((await read()).imageCount, 1)
  await click('invalid', /non-empty path/)
  report.checks.push(
    'Real ink paths, native Exit A pixels, width history, duplicate/invalid guards and last-object-only removal',
  )

  await click('reset')
  assert.deepEqual((await read()).snapshot, initial.snapshot)
  await root.locator('.ink-controls > summary').click()
  await settle()
  // The native SDK tool currently has an icon/tooltip rather than an accessible button name.
  const pen = root.locator('[data-u-comp=ribbon-grid-toolbar] .univerjs-icon-pen-icon')
  assert.equal(await pen.count(), 1)
  await pen.click()
  await settle()
  const box = await canvas().boundingBox()
  const point = (x, y) => [box.x + (x * box.width) / 595.276, box.y + (y * box.height) / 841.89]
  await page.mouse.move(...point(250, 220))
  await page.mouse.down()
  for (const [x, y] of [
    [255, 225],
    [270, 220],
    [285, 235],
    [300, 225],
  ])
    await page.mouse.move(...point(x, y), { steps: 4 })
  await page.mouse.up()
  await page.waitForFunction(
    () => JSON.parse(document.querySelector('.pdf-ink output').textContent).annotations.length === 1,
  )
  state = await read()
  assert.ok(state.annotations[0].ink.paths.flat().length >= 5)
  assert.ok(!STROKES.some((item) => item.id === state.annotations[0].id))
  await root.screenshot({ path: path.join(directory, 'native-freehand.png') })
  await root.locator('.ink-controls > summary').click()
  const nativeSnapshot = (await read()).snapshot
  await click('reload')
  assert.deepEqual((await read()).snapshot, nativeSnapshot)
  const downloading = page.waitForEvent('download')
  await click('download')
  const downloaded = await downloading
  assert.equal(downloaded.suggestedFilename(), 'meridian-ink-review.json')
  const file = path.join(directory, downloaded.suggestedFilename())
  await downloaded.saveAs(file)
  assert.deepEqual(JSON.parse(await fs.readFile(file, 'utf8')), nativeSnapshot)
  await click('remove')
  assert.equal((await read()).annotations.length, 0)
  report.checks.push(
    'Native pointer freehand creates durable Facade ink, survives exact reload/download and is independently removable',
  )

  for (const value of ['default', 'empty', 'boundary', 'error']) {
    await root.locator('[data-input=fixture]').selectOption(value)
    const first = await click('fixture', value === 'error' ? /non-empty path/ : undefined)
    await click('fixture', value === 'error' ? /non-empty path/ : undefined)
    assert.deepEqual((await read()).snapshot, first.snapshot)
    assert.equal(first.loadedFixture, value)
    if (value === 'empty') {
      assert.equal(first.imageCount, 0)
      assert.equal(first.text.length, 0)
      assert.equal(await root.locator('[data-action=add]').isDisabled(), true)
    }
    if (value === 'boundary')
      assert.deepEqual(
        first.annotations.map((a) => a.style.stroke.width),
        [0.5, 12],
      )
  }
  await click('reset')
  assert.deepEqual((await read()).snapshot, initial.snapshot)
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await settle()
    assert.ok(await root.evaluate((e) => e.scrollWidth <= e.clientWidth + 1))
    await root.locator('[data-action=add]').focus()
    await page.keyboard.press('Enter')
    await idle()
    assert.equal((await read()).annotations.length, 1)
    await click('reset')
  }
  report.checks.push(
    'Four exact repeatable fixtures, SDK empty-path rejection, complete Reset and narrow keyboard actions',
  )
  if (process.env.SHOWCASE_DETAILS === '1') {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const [locale, title, labels] of [
      ['en-US', 'Ink and Freehand Review', ['Variants', 'Actions', 'States']],
      ['zh-CN', '墨迹与自由手绘审阅', ['变体', '操作', '状态']],
    ]) {
      const response = await page.goto(`${new URL(url).origin}/${locale}/showcase/pdfs/ink-freehand-review`, {
        waitUntil: 'load',
        timeout: 180000,
      })
      assert.equal(response.status(), 200)
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of labels) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      assert.equal(await page.locator('aside').getByRole('button', { expanded: true }).count(), 3)
      assert.equal(await page.locator('aside').getByRole('link', { name: title, exact: true }).count(), 1)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first().locator('.pdf-ink')
      const ready = () =>
        embedded.locator('.ink-controls > fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
      await ready()
      await embedded.locator('.ink-controls > summary').click()
      await embedded.locator('[data-action=add]').click()
      await ready()
      assert.equal(JSON.parse(await embedded.locator('output').textContent()).annotations.length, 1)
      await embedded.locator('[data-action=undo]').click()
      await ready()
      assert.equal(JSON.parse(await embedded.locator('output').textContent()).annotations.length, 0)
      await embedded.locator('.ink-controls > summary').click()
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push('Both localized card-free detail pages run real iframe ink/history in the four-level tree')
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
