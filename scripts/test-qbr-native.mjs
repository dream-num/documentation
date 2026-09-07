/* eslint-disable no-await-in-loop -- Selected native pages and literal examples run sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/qbr-native-current')
await fs.mkdir(output, { recursive: true })
const source = (await readShowcaseSources()).find((entry) => entry.slug === 'slides/quarterly-business-review')
assert.ok(source)
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-qbr-native-'))
for (const [name, content] of Object.entries(source.files)) {
  const target = path.join(directory, name.slice(1))
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content)
}
const manifest = JSON.parse(source.files['/package.json'])
for (const [name, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
  const installed = await fs.realpath(
    name === 'vite'
      ? process.env.SHOWCASE_VITE_DIR || path.resolve('node_modules/vite')
      : path.join('node_modules', name),
  )
  assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version)
  const target = path.join(directory, 'node_modules', name)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.symlink(installed, target, 'junction')
}
await fs.writeFile(path.join(output, 'exports.json'), JSON.stringify([{ slug: source.slug, directory }], null, 2))
const { build, preview } = await import(pathToFileURL(path.join(directory, 'node_modules/vite/dist/node/index.js')))
await build({ configFile: false, root: directory, logLevel: 'warn' })
const server = await preview({
  configFile: false,
  root: directory,
  preview: { host: '127.0.0.1', port: 4418, strictPort: true },
})
const browser = await chromium.launch()
const report = {
  scope: 'Selected eight-page production export and six literal recipes; not full native acceptance',
  directory,
  pages: [],
  examples: [],
  errors: [],
  passed: false,
}
try {
  const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
  page.on('pageerror', (error) => report.errors.push(error.message))
  await page.addInitScript(() => {
    window.slideFrames = new Map()
    const proto = CanvasRenderingContext2D.prototype,
      fill = proto.fillText,
      clear = proto.clearRect,
      draw = proto.drawImage
    proto.fillText = function (...args) {
      const texts = window.slideFrames.get(this.canvas) || []
      texts.push(String(args[0]))
      window.slideFrames.set(this.canvas, texts.slice(-50000))
      return Reflect.apply(fill, this, args)
    }
    proto.clearRect = function (...args) {
      window.slideFrames.set(this.canvas, [])
      return Reflect.apply(clear, this, args)
    }
    proto.drawImage = function (paintSource, ...args) {
      if (paintSource !== this.canvas)
        window.slideFrames.set(
          this.canvas,
          (window.slideFrames.get(this.canvas) || []).concat(window.slideFrames.get(paintSource) || []).slice(-50000),
        )
      return Reflect.apply(draw, this, [paintSource, ...args])
    }
  })
  await page.goto('http://127.0.0.1:4418/', { waitUntil: 'load' })
  await page.locator('.qbr-demo[data-ready="true"]').waitFor()
  const initial = await page.evaluate(() => window.univerAPI.getPresentation('qbr-fy2027-q2').save())
  assert.equal(initial.slideOrder.length, 8)
  for (const id of initial.slideOrder) {
    await page.evaluate((slideId) => {
      const deck = window.univerAPI.getPresentation('qbr-fy2027-q2')
      deck.setActiveSlide(deck.getSlideById(slideId))
    }, id)
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const screenshot = path.join(output, id + '.png')
    await page.screenshot({ path: screenshot })
    const painted = await page.evaluate(() =>
      [...window.slideFrames]
        .filter(
          ([canvas]) =>
            canvas.isConnected &&
            canvas.closest('[data-slide-canvas-host]') &&
            !canvas.closest('[data-u-comp="slide-thumbnail-item"]') &&
            canvas.getBoundingClientRect().width > 300,
        )
        .flatMap(([, texts]) => texts),
    )
    report.pages.push({ id, screenshot, painted })
    assert.ok(painted.length > 0, 'Current native page must paint: ' + id)
  }
  await page.evaluate(() => {
    const deck = window.univerAPI.getPresentation('qbr-fy2027-q2')
    deck.setActiveSlide(deck.getSlideById('scorecard'))
  })
  const examples = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
  assert.equal(examples.length, 6)
  for (const [index, code] of examples.entries()) {
    await page.evaluate(code)
    report.examples.push({ index: index + 1, passed: true })
  }
  const updated = await page.evaluate(() => window.northstarSaved)
  assert.equal(updated.slides.scorecard.elements.target.shapeData.shapeText.text, '$46.5M\nRevenue target')
  assert.equal(updated.slides.scorecard.elements.gap.shapeData.shapeText.text, 'Target gap: $2.7M')
  assert.equal(updated.slides.regions.elements['north-america-bar'].transform.left, 310)
  assert.equal(
    updated.slides.decision.speakerNotes,
    'Rowan: protect renewals and approve targeted onboarding coverage. Recheck pipeline timing in September.',
  )
  await page.evaluate(() => window.univerAPI.toggleDarkMode(true))
  assert.deepEqual(await page.evaluate(() => window.univerAPI.getPresentation('qbr-fy2027-q2').save()), updated)
  await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
  assert.deepEqual(await page.evaluate(() => window.univerAPI.getPresentation('qbr-fy2027-q2').save()), updated)
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  process.exitCode = 1
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
console.log(
  JSON.stringify({
    passed: report.passed,
    pages: report.pages.length,
    examples: report.examples.length,
    failure: report.failure,
  }),
)
