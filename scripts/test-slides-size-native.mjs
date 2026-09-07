/* eslint-disable no-await-in-loop -- Ordered published examples exercise one native deck. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { ShapeFillEnum, ShapeLineTypeEnum } from '@univerjs-pro/engine-shape'
import { chromium } from 'playwright'

import {
  createGalleryData,
  scaleElements,
  dimensions,
  WIDE,
  overflow,
} from '../showcase/slides/page-size-and-overflow/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/rivet-size-native')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/slides/page-size-and-overflow/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 20)
const restoreCode = [
  ...(await fs.readFile('showcase/slides/page-size-and-overflow/README.md', 'utf8')).matchAll(
    /\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
][0][1]
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4374'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/slides/page-size-and-overflow`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-rivet-recovery-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'slides/page-size-and-overflow')
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(exportDirectory, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  // Use exact installed package versions; never mutate another preview's dependency directory.
  const manifest = JSON.parse(source.files['/package.json'])
  const viteDirectory = process.env.SHOWCASE_VITE_DIRECTORY || path.join(exportDirectory, 'node_modules', 'vite')
  const vitePackage = await fs.realpath(viteDirectory).catch(() => {
    throw new Error(
      `Vite ${manifest.devDependencies.vite} is unavailable at ${viteDirectory}. Reuse SHOWCASE_EXPORT_DIRECTORY with its installed node_modules/vite, set SHOWCASE_VITE_DIRECTORY to that exact installed Vite package directory, or run pnpm install in the generated selected export ${exportDirectory} and reuse it. No other demo's output is required.`,
    )
  })
  const linkedVersions = {}
  for (const [name, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
    const installed = name === 'vite' ? vitePackage : await fs.realpath(path.join(process.cwd(), 'node_modules', name))
    const actual = JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version
    assert.equal(actual, version, 'Use the exact exported version of ' + name)
    const target = path.join(exportDirectory, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    if (await fs.lstat(target).catch(() => null)) assert.equal(await fs.realpath(target), installed)
    else await fs.symlink(installed, target, 'junction')
    linkedVersions[name] = actual
  }
  await fs.writeFile(path.join(directory, 'linked-versions.json'), JSON.stringify(linkedVersions, null, 2))
  await fs.writeFile(
    path.join(directory, 'exports.json'),
    JSON.stringify([{ slug: source.slug, directory: exportDirectory }], null, 2),
  )
  const { build, preview } = await import(
    pathToFileURL(path.join(exportDirectory, 'node_modules/vite/dist/node/index.js')).href
  )
  const outDir = path.join(directory, 'harness-dist')
  await build({
    root: exportDirectory,
    configFile: false,
    logLevel: 'warn',
    build: { outDir, emptyOutDir: false },
    plugins: [
      {
        name: 'rivet-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo} from '/src/create-demo.ts';import {createData} from '/src/data.ts';window.createDemo=createDemo;window.createData=createData;window.container=document.getElementById('app');window.demo=createDemo(window.container);window.addEventListener('pagehide',()=>window.demo.dispose());
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4374, strictPort: true },
  })
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
page.setDefaultTimeout(12000)
const report = { passed: false, checks: [], gates: {}, errors: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['xhr', 'fetch'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
const root = page.locator('.slide-size-demo')
const run = (n) => page.evaluate('(async () => {\n' + examples[n - 1] + '\n})()')
const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActivePresentation().save())))
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
// Read the installed SDK's real render objects only. No production inspector or alternate geometry is injected.
const rendered = () =>
  page.evaluate(() => {
    const api = window.univerAPI,
      deck = api.getActivePresentation(),
      slide = deck.getActiveSlide()
    if (!slide) return null
    const injector = api._injector
    const token = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
      (k) => String(k) === 'engine-render.render-manager.service',
    )
    const render = injector.get(token).getRenderUnitById(deck.getId())
    const rect = render.scene.getObject('slide-page-rect'),
      viewport = render.scene.getViewport('viewMain')
    const canvas = [...document.querySelectorAll('.slide-size-demo canvas')].find(
      (c) => !c.closest('[data-u-comp="slide-thumbnail-item"]') && c.width > 300,
    )
    const box = canvas.getBoundingClientRect()
    const elements = Object.fromEntries(
      Object.keys(deck.save().slides[slide.getId()].elements).map((id) => {
        const object = render.scene.getObject('slide-drawing-' + deck.getId() + '-' + slide.getId() + '-' + id)
        if (!object) return [id, null]
        const [a, b, c, d, e, f] = object.transform.getMatrix()
        const points = [
          [0, 0],
          [object.width, 0],
          [object.width, object.height],
          [0, object.height],
        ].map(([x, y]) => ({ x: a * x + c * y + e - rect.left, y: b * x + d * y + f - rect.top }))
        return [
          id,
          {
            left: Math.min(...points.map((p) => p.x)),
            top: Math.min(...points.map((p) => p.y)),
            right: Math.max(...points.map((p) => p.x)),
            bottom: Math.max(...points.map((p) => p.y)),
            screen: {
              x: box.x + (object.left - viewport.viewportScrollX) * render.scene.scaleX,
              y: box.y + (object.top - viewport.viewportScrollY) * render.scene.scaleY,
              width: object.width * render.scene.scaleX,
              height: object.height * render.scene.scaleY,
            },
          },
        ]
      }),
    )
    return { id: slide.getId(), width: rect.width, height: rect.height, elements }
  })
async function size(width, height) {
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.slide-size-demo canvas')].some(
      (c) => !c.closest('[data-u-comp="slide-thumbnail-item"]') && c.width > 300,
    ),
  )
  await settle()
  const actual = await rendered()
  assert.deepEqual([actual.width, actual.height], [width, height])
  return actual
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
}
function pack(actual, expected, prefix = '') {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual?.[k], v, prefix + k + '.')
    else assert.deepEqual(actual?.[k], v, prefix + k)
  }
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await root.locator(':scope[data-ready=true]').waitFor()
  assert.equal(await root.locator('fieldset,details,output,[data-action],.hint').count(), 0)
  assert.ok(await root.locator('[data-u-comp="ribbon-grid-toolbar"]').count())
  const authored = createGalleryData()
  assert.equal((await snapshot()).slideOrder.length, 8)
  await gate('native-transparent-text-palette', async () => {
    const data = await snapshot()
    assert.ok(new Set(Object.values(data.slides).map((s) => s.background.color)).size >= 4)
    for (const slide of Object.values(data.slides)) {
      for (const id of ['title', 'first', 'second']) {
        const shape = slide.elements[id].shapeData
        assert.equal(shape.isTextBox, true)
        assert.equal(shape.fill.fillType, ShapeFillEnum.NoFill)
        assert.equal(shape.stroke.lineStrokeType, ShapeLineTypeEnum.NoLine)
        assert.equal(shape.shapeText.text, authored.slides[slide.id].elements[id].shapeData.shapeText.text)
      }
    }
  })
  await gate('native-eight-page-gallery', async () => {
    for (const id of authored.slideOrder) {
      await page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
      await settle()
      const wanted = authored.slides[id].pageSize || authored.defaultPageSize
      const actual = await size(wanted.width, wanted.height)
      assert.equal(actual.id, id)
      assert.ok(actual.elements.title)
      report.checks.push({ page: id, width: actual.width, height: actual.height, frames: actual.elements })
      await page.screenshot({ path: path.join(directory, id + '.png') })
    }
    await page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="opening"]').click()
    const actual = await size(960, 540)
    for (const [id, sides] of Object.entries({
      'outside-left': ['left'],
      'outside-right': ['right'],
      'outside-bottom': ['bottom'],
      'touching-edge': [],
      'rotated-left': ['left'],
    }))
      assert.deepEqual(overflow(actual.elements[id], WIDE), sides)
  })
  await run(1)
  const before = await snapshot()
  for (const [n, w, h] of [
    [2, 720, 540],
    [3, 540, 960],
    [4, 540, 960],
    [5, 960, 540],
    [6, 800, 600],
  ]) {
    await run(n)
    await gate('literal-' + n + '-native-size', () => size(w, h))
    assert.deepEqual((await snapshot()).slides.opening.elements, before.slides.opening.elements)
  }
  const beforeZoom = await snapshot()
  await run(7)
  const zoomed = await snapshot()
  assert.deepEqual(zoomed.slides, beforeZoom.slides)
  assert.deepEqual(zoomed.defaultPageSize, beforeZoom.defaultPageSize)
  await run(8)
  const wide = await snapshot()
  await run(9)
  const scaled = await snapshot()
  await gate('literal-9-scaled-native-frame', async () => {
    await size(720, 540)
    const expected = scaleElements(wide.slides.opening, WIDE, dimensions('standard'))
    for (const element of expected.elements) assert.deepEqual(scaled.slides.opening.elements[element.id], element)
    const current = await rendered()
    assert.equal(current.elements.title.left, 37.5)
    assert.equal(current.elements.title.top, 120)
  })
  const focusFrame = (await rendered()).elements.title.screen
  await page.mouse.click(focusFrame.x - 10, focusFrame.y - 15)
  await run(10)
  const geometryUndone = await snapshot()
  await gate('native-drawing-undo-full', async () => {
    assert.deepEqual(geometryUndone.slides.opening.elements, wide.slides.opening.elements)
    await size(720, 540)
  })
  await run(11)
  await gate('native-size-undo-full', async () => {
    assert.deepEqual(await snapshot(), wide)
    await size(960, 540)
  })
  await run(12)
  await size(720, 540)
  await run(13)
  await gate('native-redo-full', async () => assert.deepEqual(await snapshot(), scaled))
  const invalidBefore = await snapshot()
  await run(14)
  assert.equal(await page.evaluate(() => window.rivetInvalidAccepted), false)
  assert.deepEqual(await snapshot(), invalidBefore)
  await run(15)
  await run(16)
  assert.deepEqual((await snapshot()).slides.opening.elements, before.slides.opening.elements)
  await run(17)
  await gate('zero-pages', async () => assert.equal((await snapshot()).slideOrder.length, 0))
  await run(18)
  assert.equal((await snapshot()).defaultPageSize.width, 600)
  await run(19)
  await run(20)
  await gate('checkpoint-reconstruction', async () => {
    const restored = await snapshot()
    assert.deepEqual({ ...restored, id: before.id }, before)
    const actual = await size(960, 540)
    assert.equal(actual.id, 'opening')
  })
  report.checks.push({ literalExamples: 20, invalidRejected: true })
  if (buildStandalone)
    await gate('checkpoint-full-owner-recovery', async () => {
      await page.evaluate(
        '(async()=>{' +
          restoreCode.replace('demo.univerAPI.getActivePresentation().save()', 'window.rivetCheckpoint') +
          '})()',
      )
      assert.deepEqual(await snapshot(), before)
      await size(960, 540)
      for (const id of before.slideOrder) {
        await page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
        const wanted = before.slides[id].pageSize || before.defaultPageSize
        const actual = await size(wanted.width, wanted.height)
        assert.equal(actual.id, id)
        assert.ok(actual.elements.title)
      }
      await page.screenshot({ path: path.join(directory, 'checkpoint-full-owner.png') })
    })
  await gate('native-text-edit', async () => {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await root.locator(':scope[data-ready=true]').waitFor()
    await size(960, 540)
    const frame = await rendered(),
      b = frame.elements.title.screen
    const beforeEdit = await snapshot()
    await page.mouse.dblclick(b.x + Math.min(80, b.width / 3), b.y + Math.min(30, b.height / 2))
    await settle()
    await page.keyboard.press('Control+a')
    await page.keyboard.type('Rivet / Native size review')
    await page.mouse.click(b.x - 10, b.y - 20)
    await settle()
    const readText = () =>
      page.evaluate(() => JSON.stringify(window.univerAPI.getActivePresentation().save().slides.opening.elements.title))
    assert.match(await readText(), /Native size review/)
    await page.screenshot({ path: path.join(directory, 'native-edited.png') })
    const afterEdit = await snapshot()
    await gate('native-text-full-history', async () => {
      await page.keyboard.press('Control+z')
      await settle()
      assert.deepEqual(await snapshot(), beforeEdit)
      await page.keyboard.press('Control+y')
      await settle()
      assert.deepEqual(await snapshot(), afterEdit)
    })
  })
  if (buildStandalone) {
    for (const variant of ['edited-current', 'deleted-page', 'zero-pages', 'chinese-dark']) {
      await gate('full-owner-' + variant, async () => {
        await page.evaluate((choice) => {
          if (choice === 'chinese-dark') {
            window.demo.dispose()
            window.demo = window.createDemo(window.container, true, 'zhCN', window.rivetEdited)
            return
          }
          const deck = window.univerAPI.getActivePresentation()
          if (choice === 'edited-current')
            deck
              .getSlideById('opening')
              .setPageSize({ width: 800, height: 600, preset: window.univerAPI.Enum.SlidePageSizePresetEnum.Custom })
          if (choice === 'deleted-page') deck.deleteSlide(deck.getSlideById('quote'))
          if (choice === 'zero-pages') for (const id of deck.save().slideOrder) deck.deleteSlide(deck.getSlideById(id))
        }, variant)
        await page.evaluate(() => window.demo.ready)
        const saved = await snapshot()
        if (variant === 'edited-current')
          await page.evaluate(() => {
            window.rivetEdited = structuredClone(window.univerAPI.getActivePresentation().save())
          })
        await page.evaluate(() => {
          window.oldRivetOwner = window.univerAPI
        })
        await page.evaluate('(async()=>{' + restoreCode + '})()')
        assert.equal(await page.evaluate(() => window.oldRivetOwner === window.univerAPI), false)
        const restored = await snapshot()
        if (variant === 'zero-pages') {
          report.checks.push({ emptySaved: saved, emptyRestored: restored })
          await gate('empty-deck-not-replaced-with-starter', async () => {
            assert.equal(restored.slideOrder.length, 0)
            assert.deepEqual(restored.slides, {})
            assert.equal(await page.locator('[data-u-comp="slide-thumbnail-item"]').count(), 0)
            assert.equal(await root.locator(':scope[data-ready=true]').count(), 1)
            await page.screenshot({ path: path.join(directory, 'restored-empty-deck.png') })
          })
        }
        assert.deepEqual(restored, saved)
        assert.equal(await page.locator('.slide-size-demo').count(), 1)
        assert.equal(await page.locator('[data-error],[data-u-comp="workbench-skeleton-content"]').count(), 0)
        if (variant === 'zero-pages') assert.equal((await snapshot()).slideOrder.length, 0)
        else {
          const frame = await size(800, 600)
          assert.equal(frame.id, 'opening')
          const box = frame.elements.title.screen
          await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2)
          await settle()
          await page.keyboard.press('Control+a')
          await page.keyboard.type('Rivet / Reopened ' + variant)
          await page.mouse.click(box.x - 10, box.y - 20)
          await settle()
          const edited = await snapshot()
          assert.match(JSON.stringify(edited.slides.opening.elements.title), new RegExp('Reopened ' + variant))
          await page.keyboard.press('Control+z')
          await settle()
          assert.deepEqual(await snapshot(), saved)
          await page.keyboard.press('Control+y')
          await settle()
          assert.deepEqual(await snapshot(), edited)
        }
        if (variant === 'chinese-dark') {
          assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
          assert.equal(await page.evaluate(() => window.univerAPI.isDarkMode()), true)
        }
        await page.screenshot({ path: path.join(directory, 'restored-' + variant + '.png') })
      })
    }
    await gate('invalid-snapshots-preserve-owner', async () => {
      const saved = await snapshot()
      const rejected = await page.evaluate(() => {
        const owner = window.univerAPI,
          original = owner.getActivePresentation().save()
        return [
          { ...original, id: '' },
          { ...original, slideOrder: ['absent'] },
          { ...original, activeSlideId: 'absent' },
          { ...original, slideOrder: ['opening', 'opening'] },
          { ...original, defaultPageSize: { width: 0, height: 600 } },
          { ...original, slides: {} },
        ].map((data) => {
          try {
            window.createDemo(window.container, false, 'enUS', data)
            return false
          } catch {
            return window.univerAPI === owner && document.querySelectorAll('.slide-size-demo').length === 1
          }
        })
      })
      assert.deepEqual(rejected, Array(6).fill(true))
      assert.deepEqual(await snapshot(), saved)
    })
    await gate('cancel-before-ready', async () => {
      await page.evaluate(async () => {
        window.demo.dispose()
        const pending = window.createDemo(window.container)
        pending.dispose()
        pending.dispose()
        await pending.ready
        if (document.querySelector('.slide-size-demo') || window.univerAPI) throw new Error('Pending owner leaked')
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await size(960, 540)
    })
  }
  await gate('complete-locales-and-theme-owner', async () => {
    const source = await fs.readFile('showcase/slides/page-size-and-overflow/code/create-demo.ts', 'utf8')
    const packs = [...source.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 5)
    const saved = await snapshot()
    await page.evaluate(() => {
      window.rivetOwner = window.univerAPI
    })
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const [, prefix] of packs)
        pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
      }
      assert.equal(await page.evaluate(() => window.rivetOwner === window.univerAPI), true)
      assert.deepEqual(await snapshot(), saved)
      await page.screenshot({ path: path.join(directory, locale + '-native.png') })
    }
  })
  await gate('disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, checks: report.checks.length }, null, 2))
  await browser.close()
  await server?.httpServer.close()
}
if (!report.passed) process.exitCode = 1
