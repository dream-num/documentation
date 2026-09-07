/* eslint-disable no-await-in-loop -- Real native edits, histories and variants are sequential. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import {
  PRODUCT_LAUNCH_DATA,
  PRODUCT_LAUNCH_STARTER_DATA,
  PRODUCT_LAUNCH_MEDIA_DATA,
  LAUNCH_METRICS,
} from '../showcase/slides/product-launch/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const manifestPath = 'test-results/atlas-launch-native-export/manifest.json'
if (process.argv.includes('--prepare')) {
  const source = (await readShowcaseSources()).find((s) => s.slug === 'slides/product-launch')
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-atlas-launch-native-'))
  for (const [n, c] of Object.entries(source.files)) {
    const target = path.join(directory, n.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, c)
  }
  const pkg = JSON.parse(source.files['/package.json']),
    links = []
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const target =
      name === 'vite'
        ? process.env.SHOWCASE_VITE_DIR || path.resolve('node_modules/vite')
        : path.resolve('node_modules', name)
    assert.equal(JSON.parse(await fs.readFile(path.join(target, 'package.json'), 'utf8')).version, version)
    const destination = path.join(directory, 'node_modules', name)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.symlink(target, destination, 'junction')
    links.push({ name, version, target })
  }
  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.writeFile(
    manifestPath,
    JSON.stringify({ slug: source.slug, directory, links, sourceFiles: Object.keys(source.files).length }, null, 2),
  )
  console.log(directory)
  process.exit(0)
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/atlas-launch-native')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/slides/product-launch'
const examples = [
  ...(await fs.readFile('showcase/slides/product-launch/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 22)
const browser = await chromium.launch(),
  context = await browser.newContext({ viewport: { width: 1600, height: 1200 }, acceptDownloads: true })
await context.addInitScript(() => {
  window.atlasFrames = new Map()
  const p = CanvasRenderingContext2D.prototype,
    fill = p.fillText,
    clear = p.clearRect,
    draw = p.drawImage
  p.fillText = function (value, ...args) {
    window.atlasFrames.set(this.canvas, [...(window.atlasFrames.get(this.canvas) || []), String(value)].slice(-50000))
    return fill.call(this, value, ...args)
  }
  p.clearRect = function (...args) {
    window.atlasFrames.set(this.canvas, [])
    return clear.apply(this, args)
  }
  p.drawImage = function (source, ...args) {
    if (source !== this.canvas)
      window.atlasFrames.set(
        this.canvas,
        [...(window.atlasFrames.get(this.canvas) || []), ...(window.atlasFrames.get(source) || [])].slice(-50000),
      )
    return draw.call(this, source, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(15000)
const report = { passed: false, url, gates: {}, errors: [], requests: [], literals: [], pages: [] }
let currentGate = 'startup'
page.on('pageerror', (e) => report.errors.push({ gate: currentGate, error: e.stack || e.message }))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push({ gate: currentGate, error: m.text() })
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) || r.url().includes('/universer-api/'))
    report.requests.push(r.url())
})
const root = page.locator('.product-launch')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const snapshot = () => page.evaluate(() => structuredClone(window.univerAPI.getActivePresentation().save()))
const run = async (n) => {
  report.literals.push(n)
  return page.evaluate('(async()=>{' + examples[n - 1] + '})()')
}
const painted = (text) =>
  page.waitForFunction(
    (wanted) =>
      [...window.atlasFrames].some(
        ([canvas, texts]) =>
          canvas.isConnected &&
          canvas.closest('[data-slide-canvas-host]') &&
          !canvas.closest('[data-u-comp="slide-thumbnail-item"]') &&
          canvas.clientWidth > 300 &&
          texts.join('').replace(/\s/g, '').includes(wanted.replace(/\s/g, '')),
      ),
    text,
  )
const ready = async () => {
  await page.locator('.product-launch[data-ready=true]').waitFor()
  await page.locator('[data-u-comp=workbench-skeleton-content]').waitFor({ state: 'hidden' })
  await settle()
}
const fresh = async () => {
  await page.goto(url)
  await ready()
  await painted('Turn operating data')
  await focusCanvas()
  await run(1)
}
const state = () =>
  page.evaluate(() => {
    const api = window.univerAPI,
      deck = api.getActivePresentation(),
      active = deck.getActiveSlide(),
      i = api._injector
    const key = [...i.resolvedDependencyCollection.resolvedDependencies.keys()].find(
      (k) => String(k) === 'engine-render.render-manager.service',
    )
    const render = i.get(key).getRenderUnitById(deck.getId()),
      rect = render.scene.getObject('slide-page-rect'),
      viewport = render.scene.getViewport('viewMain')
    const model = deck.save(),
      canvas = [...document.querySelectorAll('[data-slide-canvas-host] canvas')].find(
        (c) => c.clientWidth === render.engine.width,
      )
    const box = canvas?.getBoundingClientRect()
    return {
      id: deck.getId(),
      active: active?.getId(),
      model,
      bounds: rect
        ? {
            x: (rect.left - viewport.viewportScrollX) * render.scene.scaleX,
            y: (rect.top - viewport.viewportScrollY) * render.scene.scaleY,
            width: rect.width * render.scene.scaleX,
            height: rect.height * render.scene.scaleY,
            scale: render.scene.scaleX,
            canvasX: box?.left,
            canvasY: box?.top,
          }
        : null,
      actual: active?.getData().elementOrder.map((id) => {
        const o = render.scene.getObject('slide-drawing-' + deck.getId() + '-' + active.getId() + '-' + id)
        return { id, left: o?.left - rect.left, top: o?.top - rect.top, width: o?.width, height: o?.height }
      }),
    }
  })
async function focusCanvas() {
  const s = await state(),
    b = s.bounds
  await page.mouse.click(b.canvasX + b.x + 12, b.canvasY + b.y + 12)
}
async function capture(name) {
  await page.screenshot({ path: path.join(directory, name + '.png'), animations: 'disabled' })
}
async function gate(name, fn) {
  currentGate = name
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await fs.writeFile(
      path.join(directory, name + '-actual.json'),
      JSON.stringify(await snapshot().catch(() => null), null, 2),
    )
    await capture(name + '-failure').catch(() => {})
  }
}
async function nav(id) {
  await page.evaluate((pageId) => {
    const d = window.univerAPI.getActivePresentation()
    d.setActiveSlide(d.getSlideById(pageId))
  }, id)
  await settle()
}
async function history(name, n, check) {
  await gate(name, async () => {
    await fresh()
    const before = await snapshot()
    await run(n)
    await settle()
    await check()
    report.gates[name + '-effect'] = { passed: true }
    const edited = await snapshot()
    await rawHistory(before, edited)
  })
}
async function rawHistory(before, edited, native = false) {
  if (native) await page.keyboard.press('Control+z')
  else await run(20)
  await settle()
  let undoFailure, redoFailure
  try {
    assert.deepEqual(await snapshot(), before)
  } catch (error) {
    undoFailure = error
  }
  if (native) await page.keyboard.press('Control+y')
  else await run(21)
  await settle()
  try {
    assert.deepEqual(await snapshot(), edited)
  } catch (error) {
    redoFailure = error
  }
  report.historyResults ??= {}
  report.historyResults[currentGate] = {
    undoExact: !undoFailure,
    redoExact: !redoFailure,
    undoFailure: undoFailure?.stack,
    redoFailure: redoFailure?.stack,
  }
  if (undoFailure) throw undoFailure
  if (redoFailure) throw redoFailure
}
function pack(actual, expected, prefix = '') {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual?.[k], v, prefix + k + '.')
    else assert.deepEqual(actual?.[k], v, prefix + k)
  }
}
try {
  await gate('normal-export-source-parity', async () => {
    const m = JSON.parse(await fs.readFile(process.argv[2] || manifestPath, 'utf8')),
      s = (await readShowcaseSources()).find((c) => c.slug === m.slug)
    for (const [n, c] of Object.entries(s.files))
      assert.equal(await fs.readFile(path.join(m.directory, n.slice(1)), 'utf8'), c, n)
    report.export = m
  })
  await gate('eleven-original-pages-native-glyphs-and-frames', async () => {
    await fresh()
    assert.equal(await root.locator('fieldset,details,output,[data-action]').count(), 0)
    await root.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
    assert.equal((LAUNCH_METRICS.pilot.active / LAUNCH_METRICS.pilot.invited) * 100, 86)
    assert.equal(LAUNCH_METRICS.reviewMinutes.before / LAUNCH_METRICS.reviewMinutes.after, 2.4)
    for (const id of PRODUCT_LAUNCH_DATA.slideOrder) {
      await nav(id)
      const source = PRODUCT_LAUNCH_DATA.slides[id]
      for (const element of Object.values(source.elements)) {
        const text = element.shapeData?.shapeText?.text
        if (text) await painted(text)
      }
      const s = await state()
      assert.equal(s.active, id)
      pack(s.model.slides[id], await page.evaluate((pageId) => window.atlasLaunch.templates.launch.slides[pageId], id))
      for (const actual of s.actual) {
        const expected = source.elements[actual.id].transform
        for (const k of ['left', 'top', 'width', 'height'])
          assert.ok(Math.abs(actual[k] - expected[k]) < 0.01, id + '/' + actual.id + '/' + k)
      }
      report.pages.push(id)
      await capture('page-' + id)
    }
    await nav('story')
    await capture('opening')
  })
  await history('literal-title-full-history', 3, async () => {
    await painted('clear and accountable')
    assert.equal(
      (await snapshot()).slides.story.elements.title.shapeData.shapeText.text,
      'Make operating decisions\nclear and accountable',
    )
  })
  await history('literal-position-full-history', 4, async () =>
    assert.equal((await state()).actual.find((e) => e.id === 'adoption').left, 720),
  )
  await gate('ga-batch-current-model-guards-paint-history', async () => {
    await fresh()
    await run(2)
    const before = await snapshot()
    await run(5)
    await painted('MAR 10')
    const edited = await snapshot()
    assert.equal(edited.slides.rollout.elements['ga-marker'].transform.left, 842)
    assert.equal(edited.slides.rollout.elements['ga-date'].transform.left, 790)
    for (const id of before.slideOrder.filter((pageId) => pageId !== 'rollout'))
      assert.deepEqual(edited.slides[id], before.slides[id])
    assert.equal(edited.slides.rollout.speakerNotes, before.slides.rollout.speakerNotes)
    await capture('ga-delayed')
    report.gates['ga-batch-native-paint'] = { passed: true }
    await assert.rejects(run(6), /already moved/)
    assert.deepEqual(await snapshot(), edited)
    await rawHistory(before, edited)
  })
  await gate('ga-manual-edit-and-missing-guards', async () => {
    await fresh()
    await run(5)
    await run(20)
    await page.evaluate(() => window.atlasElement('rollout', 'ga-date').getText().setText('MAR 04\nReadiness review'))
    const before = await snapshot()
    await assert.rejects(
      page.evaluate(() => window.atlasDelayGA()),
      /edited/,
    )
    assert.deepEqual(await snapshot(), before)
  })
  await history('literal-speaker-notes-history', 7, async () =>
    assert.match((await snapshot()).slides.rollout.speakerNotes, /readiness owner/),
  )
  await gate('literal-zoom-and-local-downloads', async () => {
    await fresh()
    await run(8)
    assert.equal((await snapshot()).zoomRatio, 0.7)
    for (const n of [9, 10]) {
      const pending = page.waitForEvent('download')
      await run(n)
      const download = await pending
      await download.saveAs(path.join(directory, download.suggestedFilename()))
    }
    assert.deepEqual(
      JSON.parse(await fs.readFile(path.join(directory, 'atlas-metrics.json'), 'utf8')).baseline,
      LAUNCH_METRICS,
    )
  })
  await gate('native-title-input-complete-history', async () => {
    await fresh()
    const s = await state(),
      e = s.model.slides.story.elements.title.transform,
      b = s.bounds
    await page.mouse.dblclick(b.canvasX + b.x + (e.left + 110) * b.scale, b.canvasY + b.y + (e.top + 30) * b.scale)
    await page.waitForFunction(
      () =>
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true',
    )
    const before = await snapshot()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Native launch promise')
    await page.mouse.click(b.canvasX + b.x + 12, b.canvasY + b.y + 12)
    await painted('Native launch promise')
    await settle()
    const edited = await snapshot()
    assert.ok(JSON.stringify(edited.slides.story.elements.title).includes('Native launch promise'))
    await capture('native-title')
    report.gates['native-title-current-canvas'] = { passed: true }
    await rawHistory(before, edited, true)
  })
  await gate('native-position-keyboard-and-history', async () => {
    await fresh()
    const s = await state(),
      e = s.model.slides.story.elements.adoption.transform,
      b = s.bounds
    await page.mouse.click(b.canvasX + b.x + (e.left + 100) * b.scale, b.canvasY + b.y + (e.top + 60) * b.scale)
    const before = await snapshot()
    await page.keyboard.press('ArrowRight')
    await settle()
    const edited = await snapshot()
    assert.ok(
      edited.slides.story.elements.adoption.transform.left > before.slides.story.elements.adoption.transform.left,
    )
    assert.equal(
      (await state()).actual.find((element) => element.id === 'adoption').left,
      edited.slides.story.elements.adoption.transform.left,
    )
    report.gates['native-position-real-frame'] = { passed: true }
    await rawHistory(before, edited, true)
  })
  await gate('starter-original-pages-empty-and-fresh-shape', async () => {
    await fresh()
    await run(11)
    await ready()
    await painted('What changes for your customer?')
    assert.equal((await snapshot()).id, PRODUCT_LAUNCH_STARTER_DATA.id)
    pack((await snapshot()).slides, await page.evaluate(() => window.atlasLaunch.templates.starter.slides))
    await capture('starter-story')
    await run(12)
    await settle()
    assert.deepEqual((await snapshot()).slides.blank.elements, {})
    await capture('starter-blank')
    await run(22)
    await painted('Name the next decision')
    await capture('starter-edited')
  })
  await gate('media-template-and-file-validation', async () => {
    await fresh()
    await run(13)
    await ready()
    await painted('MEDIA NOT PROVIDED')
    assert.equal((await snapshot()).id, PRODUCT_LAUNCH_MEDIA_DATA.id)
    pack((await snapshot()).slides, await page.evaluate(() => window.atlasLaunch.templates.media.slides))
    await capture('media-missing')
    await run(14)
    const before = await snapshot()
    const failures = await page.evaluate(async () => {
      const results = []
      const invalid = [
        new File(['bad'], 'x.txt', { type: 'text/plain' }),
        new File([], 'empty.png', { type: 'image/png' }),
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' }),
        new File(['bad'], 'fake.png', { type: 'image/png' }),
        new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], 'broken.png', { type: 'image/png' }),
      ]
      for (const file of invalid) {
        try {
          await window.atlasLaunch.readLocalImage(file)
          results.push('NOT REJECTED')
        } catch (e) {
          results.push(e.message)
        }
      }
      return results
    })
    assert.equal(failures.length, 5)
    assert.ok(failures.every((s) => s !== 'NOT REJECTED'))
    report.invalidFiles = failures
    assert.deepEqual(await snapshot(), before)
  })
  for (const [label, width, height, mime, color] of [
    ['landscape', 320, 180, 'image/png', '#dc2626'],
    ['portrait', 90, 180, 'image/jpeg', '#15803d'],
  ]) {
    await gate('local-' + label + '-pixels-and-cross-type-history', async () => {
      await fresh()
      await run(13)
      await ready()
      await painted('MEDIA NOT PROVIDED')
      await focusCanvas()
      const before = await snapshot()
      await page.evaluate(
        async ({ width: w, height: h, mime: type, color: fillColor }) => {
          const c = document.createElement('canvas')
          c.width = w
          c.height = h
          const x = c.getContext('2d')
          x.fillStyle = fillColor
          x.fillRect(0, 0, w, h)
          const blob = await new Promise((r) => c.toBlob(r, type, 0.95))
          window.atlasFile = new File([blob], 'atlas-local', { type })
        },
        { width, height, mime, color },
      )
      await run(15)
      await run(16)
      await settle()
      const edited = await snapshot(),
        image = edited.slides.closing.elements['launch-media']
      assert.equal(image.type, 'image')
      assert.equal(image.transform.height, 340)
      assert.ok(Math.abs(image.transform.width / 340 - width / height) < 0.001)
      const expectedColor = label === 'landscape' ? [220, 38, 38] : [21, 128, 61]
      await page.waitForFunction(
        ({ expectedColor: rgb, transform }) => {
          const api = window.univerAPI,
            d = api.getActivePresentation(),
            i = api._injector,
            k = [...i.resolvedDependencyCollection.resolvedDependencies.keys()].find(
              (key) => String(key) === 'engine-render.render-manager.service',
            ),
            r = i.get(k).getRenderUnitById(d.getId()),
            rect = r.scene.getObject('slide-page-rect'),
            v = r.scene.getViewport('viewMain'),
            c = [...document.querySelectorAll('[data-slide-canvas-host] canvas')].find(
              (canvas) => canvas.clientWidth === r.engine.width,
            )
          if (!c) return false
          const scale = r.scene.scaleX,
            ratio = c.width / c.clientWidth,
            p = c
              .getContext('2d')
              .getImageData(
                (rect.left - v.viewportScrollX + transform.left + transform.width * 0.25) * scale * ratio,
                (rect.top - v.viewportScrollY + transform.top + transform.height * 0.25) * scale * ratio,
                1,
                1,
              ).data
          return rgb.every((n, j) => Math.abs(p[j] - n) < 5) && p[3] === 255
        },
        { expectedColor, transform: image.transform },
      )
      await capture('media-' + label)
      report.gates['local-' + label + '-image-pixels'] = { passed: true }
      await rawHistory(before, edited)
    })
  }
  await gate('same-id-complete-edited-recreation-fresh-editing', async () => {
    await fresh()
    await run(3)
    await painted('clear and accountable')
    const before = await snapshot()
    await run(17)
    await ready()
    await painted('clear and accountable')
    assert.deepEqual(await snapshot(), before)
    await run(4)
    await settle()
    assert.equal((await state()).actual.find((e) => e.id === 'adoption').left, 720)
    await capture('same-id-restored')
    report.gates['same-id-owner-fresh-edit'] = { passed: true }
  })
  await gate('media-second-replacement-invalid-retention-and-same-id-bytes', async () => {
    await fresh()
    await run(13)
    await ready()
    await painted('MEDIA NOT PROVIDED')
    const sources = []
    for (const fill of ['#dc2626', '#15803d']) {
      await page.evaluate(async (fillStyle) => {
        const canvas = document.createElement('canvas')
        canvas.width = 180
        canvas.height = 90
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = fillStyle
        ctx.fillRect(0, 0, 180, 90)
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
        window.atlasFile = new File([blob], 'replacement.png', { type: 'image/png' })
      }, fill)
      await run(15)
      await run(16)
      await settle()
      sources.push((await snapshot()).slides.closing.elements['launch-media'].source)
    }
    assert.notEqual(sources[0], sources[1])
    const before = await snapshot()
    await page.evaluate(() => {
      window.atlasFile = new File(['not PNG'], 'broken.png', { type: 'image/png' })
    })
    await assert.rejects(run(15), /contents do not match/)
    assert.deepEqual(await snapshot(), before)
    await run(17)
    await ready()
    await painted('Show the product in context')
    assert.deepEqual(await snapshot(), before)
    await page.waitForFunction(() => {
      const canvas = [...document.querySelectorAll('[data-slide-canvas-host] canvas')].find((c) => c.clientWidth > 300)
      if (!canvas) return false
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
      let green = 0
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] === 21 && pixels[i + 1] === 128 && pixels[i + 2] === 61 && pixels[i + 3] === 255) green++
      }
      return green > 10000
    })
    const pending = page.waitForEvent('download')
    await run(9)
    const download = await pending
    const file = path.join(directory, 'atlas-media-snapshot.json')
    await download.saveAs(file)
    assert.deepEqual(JSON.parse(await fs.readFile(file, 'utf8')), JSON.parse(JSON.stringify(before)))
    await capture('media-replaced-same-id-restored')
  })
  await gate('same-id-owner-native-title-editing', async () => {
    await fresh()
    await run(17)
    await ready()
    await painted('Turn operating data')
    await focusCanvas()
    const s = await state(),
      e = s.model.slides.story.elements.title.transform,
      b = s.bounds
    await page.mouse.dblclick(b.canvasX + b.x + (e.left + 110) * b.scale, b.canvasY + b.y + (e.top + 30) * b.scale)
    await page.waitForFunction(
      () =>
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true',
    )
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Restored owner native review')
    await page.mouse.click(b.canvasX + b.x + 12, b.canvasY + b.y + 12)
    await painted('Restored owner native review')
    assert.ok(JSON.stringify((await snapshot()).slides.story.elements.title).includes('Restored owner native review'))
    await capture('same-id-native-edited')
  })
  await gate('media-dimensions-and-stale-read-protection', async () => {
    await fresh()
    await run(13)
    await ready()
    await painted('MEDIA NOT PROVIDED')
    const before = await snapshot()
    const huge = await page.evaluate(async () => {
      const c = document.createElement('canvas')
      c.width = 4097
      c.height = 1
      const blob = await new Promise((r) => c.toBlob(r, 'image/png'))
      try {
        await window.atlasLaunch.readLocalImage(new File([blob], 'wide.png', { type: 'image/png' }))
        return 'ACCEPTED'
      } catch (e) {
        return e.message
      }
    })
    assert.match(huge, /4096/)
    assert.deepEqual(await snapshot(), before)
    await page.evaluate(async () => {
      const c = document.createElement('canvas')
      c.width = 32
      c.height = 32
      const blob = await new Promise((r) => c.toBlob(r, 'image/png'))
      window.atlasFile = new File([blob], 'valid.png', { type: 'image/png' })
    })
    const result = await page.evaluate(
      '(async()=>{const pending=(async()=>{' +
        examples[14] +
        '})();' +
        'window.atlasElement("closing","launch-media").getText().setText("Media slot edited during decode");' +
        'try {await pending;return "ACCEPTED"}catch(error){return error.message}})()',
    )
    assert.match(result, /slot changed/)
    assert.equal((await snapshot()).slides.closing.elements['launch-media'].type, 'shape')
  })
  await gate('empty-baseline-invalid-and-idempotent-dispose', async () => {
    await fresh()
    const before = await snapshot()
    const invalid = await page.evaluate(() => {
      try {
        window.atlasLaunch.createDemo(window.atlasLaunch.container, false, {
          id: 'bad',
          slideOrder: ['missing'],
          slides: {},
          defaultPageSize: { width: 0, height: 1 },
        })
        return false
      } catch {
        return true
      }
    })
    assert.equal(invalid, true)
    assert.deepEqual(await snapshot(), before)
    await run(18)
    await ready()
    assert.deepEqual((await snapshot()).slideOrder, [])
    await capture('empty-deck')
    await run(19)
    await ready()
    await painted('Turn operating data')
    assert.deepEqual(await snapshot(), before)
    await page.evaluate(() => {
      const d = window.atlasLaunch
      window.atlasLastController = d
      d.dispose()
      d.dispose()
      const pending = d.createDemo(d.container)
      pending.dispose()
      pending.dispose()
    })
    await settle()
    assert.equal(await root.count(), 0)
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    await page.evaluate(() =>
      window.atlasLastController.createDemo(window.atlasLastController.container, false, window.atlasSaved),
    )
    await ready()
    await painted('Turn operating data')
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    assert.equal(await root.count(), 0)
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('complete-five-css-five-locale-pairs-same-owner-themes', async () => {
    await fresh()
    await run(3)
    await painted('clear and accountable')
    const before = await snapshot()
    await page.evaluate(() => (window.atlasOwner = window.univerAPI))
    const source = await fs.readFile('showcase/slides/product-launch/code/create-demo.ts', 'utf8')
    assert.equal([...source.matchAll(/^import '@[^']+\/lib\/index.css'/gm)].length, 5)
    for (const [lang, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const [, prefix] of source.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm))
        pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + lang)).default)
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.equal(await page.evaluate(() => window.atlasOwner === window.univerAPI), true)
        assert.deepEqual(await snapshot(), before)
      }
      await capture(lang)
    }
  })
  await gate('initial-chinese-resources', async () => {
    await page.addInitScript(() => {
      const o = new MutationObserver(() => {
        if (document.documentElement) {
          document.documentElement.lang = 'zh-CN'
          o.disconnect()
        }
      })
      o.observe(document, { childList: true, subtree: true })
    })
    await fresh()
    const source = await fs.readFile('showcase/slides/product-launch/code/create-demo.ts', 'utf8')
    for (const [, prefix] of source.matchAll(/^import \w+ZhCN from '([^']+)zh-CN'/gm))
      pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + 'zh-CN')).default)
    await capture('initial-zh')
  })
  await gate('all-literals-and-zero-runtime-errors', async () => {
    assert.equal(new Set(report.literals).size, 22)
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.requests, [])
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(
  JSON.stringify(
    {
      passed: Object.values(report.gates).filter((g) => g.passed).length,
      total: Object.keys(report.gates).length,
      failures: Object.entries(report.gates)
        .filter(([, g]) => !g.passed)
        .map(([n, g]) => [n, g.failure.slice(0, 250)]),
    },
    null,
    2,
  ),
)
if (!report.passed) process.exitCode = 1
