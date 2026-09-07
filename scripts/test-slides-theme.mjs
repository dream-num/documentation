/* eslint-disable no-await-in-loop -- One native presentation is exercised sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import {
  BACKGROUND_PAGES,
  CONTENT,
  FIXED_COLOR,
  MASTER_COLOR,
  THEMES,
} from '../showcase/slides/theme-and-background/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:4262/en-US/playground/slides/theme-and-background'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-theme-native-only')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [] }
if (process.env.SHOWCASE_EXPORT_MANIFEST) {
  const manifest = JSON.parse(await fs.readFile(process.env.SHOWCASE_EXPORT_MANIFEST, 'utf8'))
  const source = (await readShowcaseSources()).find((item) => item.slug === 'slides/theme-and-background')
  for (const [name, content] of Object.entries(source.files))
    assert.equal(await fs.readFile(path.join(manifest.directory, name.slice(1)), 'utf8'), content, name)
  report.exportFiles = Object.keys(source.files).length
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const root = page.locator('.slide-theme-demo')
await page.addInitScript(() => {
  window.__slidePaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.__slidePaint.push(String(args[0]))
    return Reflect.apply(fillText, this, args)
  }
})
const settle = async () => {
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    )
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}
const read = () => page.evaluate(() => window.univerAPI.getActivePresentation().save())
const show = async (id) => {
  await root.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${id}"]`).click()
  await page.waitForFunction(
    (pageId) => window.univerAPI.getActivePresentation().getActiveSlide().getId() === pageId,
    id,
  )
  await settle()
  return read()
}
const pixels = () =>
  root.locator('canvas').evaluateAll((canvases) => {
    const canvas = canvases.toSorted((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0]
    if (!canvas || !canvas.clientWidth || !canvas.clientHeight) throw new Error('Missing real editor canvas')
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
    const colors = {}
    for (let i = 0; i < data.length; i += 16) {
      const hex = '#' + Array.from(data.slice(i, i + 3), (v) => v.toString(16).padStart(2, '0')).join('')
      colors[hex] = (colors[hex] || 0) + 1
    }
    return { width: canvas.clientWidth, height: canvas.clientHeight, colors }
  })
const native = async (command) => {
  await root.locator(`[data-u-command="${command}"]`).click()
  await settle()
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  await root.locator(':scope[data-ready=true]').waitFor({ timeout: 120000 })
  await settle()
  assert.equal(await root.locator(':scope > fieldset, :scope > details, :scope > button, :scope > select').count(), 0)
  assert.equal(await root.locator('[data-action]').count(), 0, 'No fixture toolbar or host action buttons')
  const baseline = await read()
  assert.equal(baseline.slideOrder.length, 8)
  assert.equal(baseline.theme.id, 'lumen-deep-ocean')
  await show('closing')
  for (const [id, title, card, body] of CONTENT) {
    await page.evaluate(() => {
      window.__slidePaint = []
    })
    await show(id)
    const painted = await page.evaluate(() => window.__slidePaint.join('').replace(/\s/g, ''))
    for (const text of [title, card, body, 'LUMEN / Signal Cyan / Arial'])
      assert.ok(painted.includes(text.replace(/\s/g, '')), `Native text paints: ${id}/${text}`)
    const image = await pixels()
    assert.ok(image.colors[FIXED_COLOR.toLowerCase()] > 100, 'Signal Cyan identity is painted')
    assert.ok(image.colors['#6688ff'] > 100, 'Electric Blue theme card is painted')
    await root.screenshot({ path: path.join(directory, `page-${id}.png`) })
  }
  report.checks.push('Eight authored slides, native thumbnails, exact Deep Ocean brand colors, zero host controls')
  await show('pilot')
  const beforeThemes = await read()
  for (const theme of THEMES) {
    await native('slide.operation.change-theme')
    await page.locator(`button[title="${theme.name}"]`).click()
    await root.locator('[data-u-command="slide.operation.change-theme"]').press('Escape')
    await settle()
    const snapshot = await read()
    assert.equal(snapshot.theme.id, theme.id)
    assert.deepEqual(snapshot.slides, beforeThemes.slides)
    const image = await pixels()
    assert.ok(image.colors[theme.fmtScheme.fillStyleLst[1].color.toLowerCase()] > 100)
    assert.ok(image.colors[FIXED_COLOR.toLowerCase()] > 100)
  }
  assert.equal(await root.locator('[data-u-command="univer.command.undo"]').isDisabled(), true)
  report.checks.push('Twelve native themes preserve authored overrides; navigation and themes add no Undo entries')
  await native('slide.operation.contextmenu.open-background-panel')
  await root.locator('[data-u-comp="sidebar"][aria-expanded=true]').waitFor()
  for (const [id, kind] of Object.entries(BACKGROUND_PAGES)) {
    const original = (await show(id)).slides[id].background
    const originalPixels = await pixels()
    await root.getByRole('button', { name: 'Reset Background', exact: true }).click()
    await settle()
    assert.equal((await read()).slides[id].background, undefined)
    assert.ok((await pixels()).colors[MASTER_COLOR.toLowerCase()] > 100)
    await native('univer.command.undo')
    assert.deepEqual((await read()).slides[id].background, original)
    const restoredPixels = await pixels()
    for (const color of Object.keys(originalPixels.colors).filter(
      (candidate) => originalPixels.colors[candidate] > 1000,
    ))
      assert.ok(restoredPixels.colors[color] > 100, `Restore visible ${kind} color ${color}`)
    await native('univer.command.redo')
    assert.equal((await read()).slides[id].background, undefined)
    await native('univer.command.undo')
  }
  await root.locator('[data-u-comp="sidebar"]').getByRole('button', { name: 'Close sidebar', exact: true }).click()
  await root.locator('[data-u-comp="sidebar"][aria-expanded=false]').waitFor({ state: 'attached' })
  report.checks.push('Four background Reset/Undo/Redo operations preserve real snapshot and canvas colors')
  await native('slides-exchange-client.operation.exchange')
  assert.equal(await page.getByText('Open(File)', { exact: true }).count(), 1)
  assert.equal(await page.getByText('Save As', { exact: true }).count(), 1)
  await page.screenshot({ path: path.join(directory, 'native-file-menu.png') })
  await root.locator('[data-u-command="slides-exchange-client.operation.exchange"]').press('Escape')
  report.checks.push(
    'Native client File menu registered; full conversion round-trip still requires separate acceptance',
  )
  await native('slide.operation.print-open')
  await page.getByText('Print range', { exact: true }).waitFor({ timeout: 60000 })
  await settle()
  await page.screenshot({ path: path.join(directory, 'native-print-settings.png') })
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  report.checks.push('Native print settings open and cancel; no physical print job was sent')
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.waitForFunction((expectedWidth) => {
      const canvases = [...document.querySelectorAll('.slide-theme-demo canvas')]
      return canvases.some((canvas) => canvas.clientWidth >= expectedWidth - 42 && canvas.clientHeight >= 360)
    }, width)
    await settle()
    const image = await pixels()
    assert.ok(image.width >= width - 42)
    assert.ok(image.height >= 360)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
  }
  report.checks.push('Native-only canvas at 760/390/320px')
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS native-only Deep Ocean Slides')
