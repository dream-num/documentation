/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { ShapeFillEnum, ShapeLineTypeEnum } from '@univerjs-pro/engine-shape'
import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-tern-roundtrip-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/slides/save-restore-deck/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 10)
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(restores.length, 2)
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4382'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/slides/save-restore-deck`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY ||
    (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-slides-tern-roundtrip-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'slides/save-restore-deck')
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
        name: 'slides-tern-roundtrip-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo,validateSnapshot} from '/src/create-demo.ts';import {createData} from '/src/data.ts';window.createDemo=createDemo;window.validateSnapshot=validateSnapshot;window.createData=createData;window.container=document.getElementById('app');window.demo=createDemo(window.container);
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4382, strictPort: true },
  })
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true })
page.setDefaultTimeout(15000)
const report = {
  slug: 'slides/save-restore-deck',
  passed: false,
  gates: {},
  checks: [],
  knownIssues: [],
  errors: [],
  warnings: [],
  backendRequests: [],
}
let currentGate = 'startup'
page.on('pageerror', (error) => report.errors.push({ gate: currentGate, error: error.stack || error.message }))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push({ gate: currentGate, error: message.text() })
  if (message.type() === 'warning') report.warnings.push(message.text())
})
page.on('request', (request) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
    request.url().includes('/universer-api/') ||
    (['xhr', 'fetch'].includes(request.resourceType()) &&
      !['localhost', '127.0.0.1'].includes(new URL(request.url()).hostname))
  )
    report.backendRequests.push(request.url())
})
page.on('websocket', (socket) => report.backendRequests.push(socket.url()))
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
  proto.drawImage = function (source, ...args) {
    if (source !== this.canvas)
      window.slideFrames.set(
        this.canvas,
        (window.slideFrames.get(this.canvas) || []).concat(window.slideFrames.get(source) || []).slice(-50000),
      )
    return Reflect.apply(draw, this, [source, ...args])
  }
})
const root = page.locator('.deck-roundtrip')
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getPresentation('tern-deck').save())))
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
async function ready() {
  await page.waitForFunction(
    () =>
      document.querySelector('.deck-roundtrip')?.dataset.ready === 'true' ||
      document.querySelector('.deck-roundtrip')?.dataset.error,
    null,
    { timeout: 30000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('[data-u-comp="workbench-skeleton-content"]').count(), 0)
}
async function painted(text) {
  await page.waitForFunction(
    (wanted) =>
      [...window.slideFrames].some(
        ([canvas, texts]) =>
          canvas.isConnected &&
          canvas.closest('[data-slide-canvas-host]') &&
          !canvas.closest('[data-u-comp="slide-thumbnail-item"]') &&
          canvas.getBoundingClientRect().width > 300 &&
          texts.join('').replace(/\s/g, '').includes(wanted.replace(/\s/g, '')),
      ),
    text,
  )
}
function diff(a, b, p = '') {
  if (Object.is(a, b)) return []
  if (a && b && typeof a === 'object' && typeof b === 'object')
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((k) => diff(a[k], b[k], p + '.' + k))
  return [{ path: p, before: a === undefined ? { absent: true } : a, after: b === undefined ? { absent: true } : b }]
}
async function exact(name, before, after) {
  const differences = diff(before, after)
  await fs.writeFile(path.join(directory, name + '.json'), JSON.stringify({ before, after, differences }, null, 2))
  if (differences.length) report.knownIssues.push({ name, differences })
  else report.checks.push({ name, exact: true })
}
async function gate(name, action, standalone = false) {
  if (standalone && !buildStandalone) {
    report.gates[name] = {
      passed: false,
      skipped: true,
      reason: 'Use SHOWCASE_BUILD_STANDALONE=1 for factory lifecycle handles.',
    }
    return
  }
  currentGate = name
  const issues = report.knownIssues.length,
    errors = report.errors.length
  try {
    await action()
    report.gates[name] = { passed: issues === report.knownIssues.length && errors === report.errors.length }
  } catch (error) {
    report.gates[name] = { passed: false, failure: error.stack }
    await fs.writeFile(
      path.join(directory, name + '-failure-state.json'),
      JSON.stringify(
        {
          snapshot: await snapshot().catch(() => null),
          body: await page
            .locator('body')
            .innerText()
            .catch(() => null),
        },
        null,
        2,
      ),
    )
    await capture(name + '-failure').catch(() => {})
  }
  console.log(name + ' ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
function pack(actual, expected) {
  for (const [k, v] of Object.entries(expected))
    if (v && typeof v === 'object') pack(actual?.[k], v)
    else assert.deepEqual(actual?.[k], v, k)
}
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
    const canvas = [...document.querySelectorAll('.deck-roundtrip canvas')].find(
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

async function pagePaint(id, name) {
  const data = (await snapshot()).slides[id]
  await page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
  await page.waitForFunction(
    (wanted) => window.univerAPI.getPresentation('tern-deck').getActiveSlide()?.getId() === wanted,
    id,
  )
  await settle()
  const frame = await rendered()
  assert.equal(frame.id, id)
  const expectedSize = data.pageSize || (await snapshot()).defaultPageSize
  assert.deepEqual([frame.width, frame.height], [expectedSize.width, expectedSize.height])
  const textElements = Object.entries(data.elements).filter(([, element]) => element.shapeData?.isTextBox)
  for (const [elementId] of textElements) {
    assert.ok(frame.elements[elementId], elementId + ' has an actual render object')
    const raw = await page.evaluate(
      ({ slideId, key }) =>
        window.univerAPI
          .getPresentation('tern-deck')
          .getSlideById(slideId)
          .getElementById(key)
          .getText()
          .getPlainText(),
      { slideId: id, key: elementId },
    )
    for (const line of raw.split(/\r?\n/).filter(Boolean)) await painted(line)
  }
  assert.equal(
    await page.evaluate(
      (slideId) => window.univerAPI.getPresentation('tern-deck').getSlideById(slideId).getSpeakerNotes(),
      id,
    ),
    data.speakerNotes,
  )
  report.checks.push({ name, page: id, textElements: textElements.length, frame })
  await capture(name + '-' + id)
}
async function gallery(name, expected) {
  assert.deepEqual((await snapshot()).slideOrder, expected.slideOrder)
  for (const id of expected.slideOrder) await pagePaint(id, name)
  if (expected.slideOrder.length) {
    await page.evaluate(
      (id) =>
        window.univerAPI
          .getPresentation('tern-deck')
          .setActiveSlide(window.univerAPI.getPresentation('tern-deck').getSlideById(id)),
      expected.activeSlideId || expected.slideOrder[0],
    )
    await settle()
  }
}
async function restoreCheckpoint(name, key) {
  await page.evaluate((k) => {
    window.checkpoint = window[k]
    window.oldOwner = window.univerAPI
    window.oldRoot = document.querySelector('.deck-roundtrip')
  }, key)
  const saved = await page.evaluate(() => JSON.parse(JSON.stringify(window.checkpoint)))
  const appearance = await page.evaluate(() => ({
    locale: window.univerAPI.getCurrentLocale(),
    dark: window.univerAPI.isDarkMode(),
  }))
  await run(restores[0])
  await ready()
  assert.equal(await page.evaluate(() => window.oldOwner === window.univerAPI || window.oldRoot.isConnected), false)
  assert.equal(await root.count(), 1)
  assert.deepEqual(
    await page.evaluate(() => ({ locale: window.univerAPI.getCurrentLocale(), dark: window.univerAPI.isDarkMode() })),
    appearance,
  )
  await exact(name + '-whole-snapshot', saved, await snapshot())
  return saved
}
async function freshNativeEdit(name) {
  const deck = await snapshot(),
    slideId = deck.activeSlideId,
    key = slideId + '-title'
  const frame = await rendered(),
    box = frame.elements[key].screen,
    before = await snapshot(),
    text = 'Tern / ' + name + ' native review'
  await page.evaluate(() => {
    window.nativeActivationEvents = []
    window.nativeActivationListener = (event) => {
      if (window.nativeActivationEvents.length < 30)
        window.nativeActivationEvents.push({
          type: event.type,
          time: event.timeStamp,
          capturedWallTime: Date.now(),
          capturedPerformanceTime: performance.now(),
          detail: event.detail,
          x: event.clientX,
          y: event.clientY,
          target: event.target.tagName,
          component: event.target.getAttribute('data-u-comp'),
        })
    }
    for (const type of ['pointerdown', 'pointerup', 'click', 'dblclick'])
      document.addEventListener(type, window.nativeActivationListener, true)
  })
  const activation = { before: frame, immediate: null, final: null, state: null }
  try {
    // One real double-click per owner. Do not retry until a native editor appears.
    await page.mouse.dblclick(box.x + Math.min(110, box.width / 3), box.y + Math.min(30, box.height / 2))
    activation.immediate = await rendered()
    await page.waitForFunction(
      () =>
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true',
    )
  } finally {
    activation.final = await rendered()
    activation.state = await page.evaluate(
      ({ slideId: activeId, key: elementKey }) => {
        // eslint-disable-next-line unicorn/consistent-function-scoping -- Runs inside the browser execution context.
        const state = (element) => {
          const style = getComputedStyle(element),
            bounds = element.getBoundingClientRect()
          return {
            tag: element.tagName,
            role: element.getAttribute('role'),
            component: element.getAttribute('data-u-comp'),
            contenteditable: element.getAttribute('contenteditable'),
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
          }
        }
        const presentation = window.univerAPI.getPresentation('tern-deck')
        const model = presentation.save().slides[activeId].elements[elementKey]
        for (const type of ['pointerdown', 'pointerup', 'click', 'dblclick'])
          document.removeEventListener(type, window.nativeActivationListener, true)
        return {
          activePage: presentation.getActiveSlide().getId(),
          type: model.type,
          shapeData: model.shapeData,
          focus: state(document.activeElement),
          events: window.nativeActivationEvents,
          editors: [...document.querySelectorAll('textarea,[contenteditable]')].map(state),
        }
      },
      { slideId, key },
    )
    await fs.writeFile(path.join(directory, name + '-native-activation.json'), JSON.stringify(activation, null, 2))
  }
  await page.waitForTimeout(350)
  await page.keyboard.press('Control+A')
  await page.keyboard.type(text)
  await page.mouse.click(box.x - 12, box.y - 20)
  await page.waitForFunction(
    ({ id, element, wanted }) =>
      window.univerAPI
        .getPresentation('tern-deck')
        .getSlideById(id)
        .getElementById(element)
        .getText()
        .getPlainText() === wanted,
    { id: slideId, element: key, wanted: text },
  )
  await painted(text)
  await page.waitForTimeout(350)
  const edited = await snapshot()
  await capture(name + '-native-edited')
  await page.keyboard.press('Control+z')
  await settle()
  await exact(name + '-native-undo', before, await snapshot())
  await page.keyboard.press('Control+y')
  await settle()
  await exact(name + '-native-redo', edited, await snapshot())
}

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  const initial = await snapshot()
  assert.equal(initial.slideOrder.length, 8)
  assert.equal(
    await root
      .locator('fieldset,details,output,[data-action],.deck-roundtrip-controls,.deck-roundtrip-inspector')
      .count(),
    0,
  )
  assert.ok(await root.locator('[data-u-comp="ribbon-grid-toolbar"]').count())
  await gate('transparent-original-eight-page-paint', async () => {
    const data = await snapshot()
    assert.ok(new Set(Object.values(data.slides).map((s) => s.background.color)).size >= 4)
    for (const slide of Object.values(data.slides))
      for (const element of Object.values(slide.elements))
        if (element.shapeData?.isTextBox) {
          assert.equal(element.shapeData.fill.fillType, ShapeFillEnum.NoFill)
          assert.equal(element.shapeData.stroke.lineStrokeType, ShapeLineTypeEnum.NoLine)
        }
    await gallery('original', data)
    await capture('baseline')
  })
  await gate('ten-literal-snapshot-and-download', async () => {
    for (const [i, example] of examples.entries()) {
      const before = await snapshot(),
        download = i === 9 ? page.waitForEvent('download') : null
      await run(example)
      await settle()
      const after = await snapshot()
      if (i === 0) assert.equal(after.activeSlideId, 'counts')
      if (i === 1) {
        assert.equal(
          await page.evaluate(() =>
            window.univerAPI
              .getPresentation('tern-deck')
              .getSlideById('counts')
              .getElementById('counts-title')
              .getText()
              .getPlainText(),
          ),
          '126 samples / ready for review',
        )
        await painted('126 samples / ready for review')
      }
      if (i === 2)
        assert.equal(
          after.slides.counts.speakerNotes,
          'Estuary 42; Dunes 31; Harbor 53. Ask Mina to review the paired readings.',
        )
      if (i === 3)
        assert.deepEqual(after.slideOrder, [
          'counts',
          'comparison',
          'opening',
          'mission',
          'stations',
          'sampling',
          'quote',
          'closing',
        ])
      if (i === 4) assert.equal(after.name, 'Tern / Reviewed coastal briefing')
      if (i === 5) assert.deepEqual(await page.evaluate(() => window.ternCheckpoint), after)
      if (i === 6) {
        assert.equal(after.slideOrder.length, 7)
        assert.equal(after.slides.closing, undefined)
        assert.equal(await page.evaluate(() => window.ternCheckpoint.slideOrder.length), 8)
      }
      if (i === 7) assert.ok(Object.values(after.slides).every((s) => !s.speakerNotes))
      if (i === 8) {
        assert.deepEqual(await page.evaluate(() => window.ternAudienceCopy), after)
        assert.equal(await page.evaluate(() => window.ternCheckpoint === window.ternAudienceCopy), false)
      }
      if ([5, 8, 9].includes(i)) await exact('literal-' + (i + 1) + '-unchanged', before, after)
      if (download) {
        const d = await download
        assert.equal(d.suggestedFilename(), 'tern-reviewed-briefing.json')
        const target = path.join(directory, 'downloaded-review.json')
        await d.saveAs(target)
        assert.deepEqual(
          JSON.parse(await fs.readFile(target, 'utf8')),
          await page.evaluate(() => window.ternCheckpoint),
        )
      }
      report.checks.push({ literal: i + 1, executed: true, pages: after.slideOrder.length })
    }
  })
  for (const [name, key, count] of [
    ['review', 'ternCheckpoint', 8],
    ['audience', 'ternAudienceCopy', 7],
  ]) {
    await gate(
      name + '-complete-owner-rebuild-and-gallery',
      async () => {
        const saved = await restoreCheckpoint(name, key)
        assert.equal(saved.slideOrder.length, count)
        if (name === 'audience') {
          assert.equal(saved.slides.closing, undefined)
          assert.ok(Object.values(saved.slides).every((s) => !s.speakerNotes))
        } else assert.ok(saved.slides.counts.speakerNotes)
        await gallery(name, saved)
        await exact(name + '-gallery-preserves-snapshot', saved, await snapshot())
      },
      true,
    )
    await gate(name + '-fresh-native-edit-and-history', () => freshNativeEdit(name), true)
  }
  await gate(
    'invalid-before-dispose-preserves-owner',
    async () => {
      const saved = await snapshot()
      await page.evaluate(() => {
        window.checkpoint = window.ternCheckpoint
        window.liveOwner = window.univerAPI
      })
      await assert.rejects(() => run(restores[1]), /valid page identities/)
      assert.equal(await page.evaluate(() => window.liveOwner === window.univerAPI), true)
      const rejected = await page.evaluate(() => {
        const source = window.univerAPI.getPresentation('tern-deck').save(),
          owner = window.univerAPI
        return [
          { ...source, id: '' },
          { ...source, slideOrder: ['absent'] },
          { ...source, activeSlideId: 'absent' },
          { ...source, slideOrder: ['counts', 'counts'] },
          { ...source, defaultPageSize: { width: 0, height: 675 } },
          { ...source, slides: {} },
        ].map((data) => {
          try {
            window.createDemo(window.container, false, 'enUS', data)
            return false
          } catch {
            return window.univerAPI === owner && document.querySelectorAll('.deck-roundtrip').length === 1
          }
        })
      })
      assert.deepEqual(rejected, Array(6).fill(true))
      await exact('invalid-preserves-current', saved, await snapshot())
    },
    true,
  )
  await gate('complete-locales-and-theme-owner', async () => {
    const factory = await fs.readFile('showcase/slides/save-restore-deck/code/create-demo.ts', 'utf8'),
      packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)],
      css = [...factory.matchAll(/^import '@[^']+\/lib\/index.css'/gm)]
    assert.equal(packs.length, 5)
    assert.equal(css.length, 5)
    const saved = await snapshot()
    await page.evaluate(() => {
      window.themeOwner = window.univerAPI
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
      assert.equal(await page.evaluate(() => window.themeOwner === window.univerAPI), true)
      await exact(locale + '-theme', saved, await snapshot())
      await capture(locale + '-native')
    }
  })
  for (const variant of ['field-brief', 'review-order', 'notes-free', 'empty'])
    await gate(
      'startup-' + variant,
      async () => {
        await page.evaluate(async (choice) => {
          window.demo.dispose()
          window.demo = window.createDemo(window.container, false, 'enUS', window.createData(choice))
          await window.demo.ready
        }, variant)
        await ready()
        const saved = await snapshot(),
          authored = await page.evaluate((v) => window.createData(v), variant)
        assert.deepEqual(saved.slideOrder, authored.slideOrder)
        if (variant === 'empty') {
          assert.equal(saved.slideOrder.length, 0)
          assert.deepEqual(saved.slides, {})
          assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 0)
          await capture('authored-empty')
        } else {
          if (variant === 'notes-free') assert.ok(Object.values(saved.slides).every((s) => !s.speakerNotes))
          await gallery('startup-' + variant, saved)
        }
        await page.evaluate(() => {
          window.startupSnapshot = structuredClone(window.univerAPI.getPresentation('tern-deck').save())
        })
        await restoreCheckpoint('startup-' + variant, 'startupSnapshot')
        if (variant === 'empty') {
          assert.equal((await snapshot()).slideOrder.length, 0)
          assert.deepEqual((await snapshot()).slides, {})
          await capture('sdk-empty-restored')
        }
      },
      true,
    )
  await gate(
    'initial-zh-and-pre-ready-disposal',
    async () => {
      await page.evaluate(async () => {
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        const pending = window.createDemo(window.container)
        pending.dispose()
        pending.dispose()
        await pending.ready
        if (window.univerAPI || document.querySelector('.deck-roundtrip')) throw new Error('Pre-ready owner leaked')
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
      await pagePaint('opening', 'initial-zh')
      await capture('initial-zh')
      await page.evaluate(() => window.demo.dispose())
      await root.waitFor({ state: 'detached' })
      await page.waitForTimeout(350)
      assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    },
    true,
  )
  report.passed =
    Object.values(report.gates).every((g) => g.passed) &&
    !report.knownIssues.length &&
    !report.errors.length &&
    !report.warnings.length &&
    !report.backendRequests.length
} catch (error) {
  report.failure = error.stack
  await capture('failure').catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, checks: report.checks.length }, null, 2))
  await browser.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
