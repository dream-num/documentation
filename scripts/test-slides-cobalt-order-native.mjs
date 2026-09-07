/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { ShapeFillEnum, ShapeLineTypeEnum } from '@univerjs-pro/engine-shape'
import { chromium } from 'playwright'

import { createData, sectionOrder, sections } from '../showcase/slides/reorder-and-sections/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-cobalt-order-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/slides/reorder-and-sections/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 12)
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(restores.length, 1)
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4394'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/slides/reorder-and-sections`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY ||
    (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-slides-cobalt-order-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'slides/reorder-and-sections')
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
        name: 'slides-cobalt-order-native-harness',
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
    preview: { host: '127.0.0.1', port: 4394, strictPort: true },
  })
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true })
page.setDefaultTimeout(15000)
const report = {
  slug: 'slides/reorder-and-sections',
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
const root = page.locator('.slide-order')
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getPresentation('cobalt-deck').save())))
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
async function ready() {
  await page.waitForFunction(
    () =>
      document.querySelector('.slide-order')?.dataset.ready === 'true' ||
      document.querySelector('.slide-order')?.dataset.error,
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
          nativeDom: await page.evaluate(() => ({
            focus: document.activeElement?.outerHTML.slice(0, 500),
            thumbnails: [...document.querySelectorAll('[data-u-comp="slide-thumbnail-item"]')].map((node) => ({
              id: node.getAttribute('data-page-id'),
              role: node.getAttribute('role'),
              tabIndex: node.getAttribute('tabindex'),
            })),
            buttons: [...document.querySelectorAll('button,[role=button]')].map((node) => ({
              text: node.textContent,
              label: node.getAttribute('aria-label'),
              title: node.getAttribute('title'),
              component: node.getAttribute('data-u-comp'),
              html: node.outerHTML.slice(0, 500),
            })),
          })),
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
    const canvas = [...document.querySelectorAll('.slide-order canvas')].find(
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
    (wanted) => window.univerAPI.getPresentation('cobalt-deck').getActiveSlide()?.getId() === wanted,
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
          .getPresentation('cobalt-deck')
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
      (slideId) => window.univerAPI.getPresentation('cobalt-deck').getSlideById(slideId).getSpeakerNotes(),
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
          .getPresentation('cobalt-deck')
          .setActiveSlide(window.univerAPI.getPresentation('cobalt-deck').getSlideById(id)),
      expected.activeSlideId || expected.slideOrder[0],
    )
    await settle()
  }
}
async function restoreCheckpoint(name, key) {
  await page.evaluate((k) => {
    window.checkpoint = window[k]
    window.oldOwner = window.univerAPI
    window.oldRoot = document.querySelector('.slide-order')
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
    key = 'title'
  const frame = await rendered(),
    box = frame.elements[key].screen,
    before = await snapshot(),
    text = 'Cobalt / ' + name + ' native review'
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
        const presentation = window.univerAPI.getPresentation('cobalt-deck')
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
        .getPresentation('cobalt-deck')
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

const original = createData()
const reviewFirst = ['opening', 'context', 'review', 'observations', 'quote', 'roadmap', 'planting', 'decision']
assert.deepEqual(sectionOrder(original, 'review', 'roadmap'), reviewFirst)
assert.deepEqual(createData('review-first').slides, original.slides)
assert.throws(() => sectionOrder(original, 'review', 'review'), /different/)
assert.throws(() => sectionOrder(createData('empty'), 'review', 'roadmap'), /contain pages/)
const thumbnail = (id) => root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')
async function order(expected) {
  await page.waitForFunction(
    (ids) => JSON.stringify(window.univerAPI.getPresentation('cobalt-deck').save().slideOrder) === JSON.stringify(ids),
    expected,
  )
  assert.deepEqual(
    await root
      .locator('[data-u-comp="slide-thumbnail-item"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-page-id'))),
    expected,
  )
  assert.deepEqual(
    await page.evaluate(() =>
      window.univerAPI
        .getPresentation('cobalt-deck')
        .getSlides()
        .map((slide) => slide.getId()),
    ),
    expected,
  )
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await gate('original-eight-page-paint', async () => {
    const initial = await snapshot()
    assert.equal(initial.slideOrder.length, 8)
    assert.equal(await root.locator('fieldset,details,output,[data-action],.order-editor').count(), 0)
    assert.ok(await root.locator('[data-u-comp="ribbon-grid-toolbar"]').count())
    for (const slide of Object.values(initial.slides))
      for (const element of Object.values(slide.elements))
        if (element.shapeData?.isTextBox) {
          assert.equal(element.shapeData.fill.fillType, ShapeFillEnum.NoFill)
          assert.equal(element.shapeData.stroke.lineStrokeType, ShapeLineTypeEnum.NoLine)
        }
    await gallery('original', initial)
    await thumbnail('opening').scrollIntoViewIfNeeded()
    await capture('cover')
  })
  await gate('native-drag-and-keyboard-history', async () => {
    await thumbnail('context').click()
    await settle()
    const before = await snapshot()
    await thumbnail('context').dragTo(thumbnail('opening'), { targetPosition: { x: 100, y: 10 } })
    await order(['context', 'opening', ...original.slideOrder.slice(2)])
    await page.waitForTimeout(350)
    const edited = await snapshot()
    assert.deepEqual(edited.slides, before.slides)
    assert.equal(edited.activeSlideId, 'context')
    await painted('Three streets, different needs')
    await capture('native-drag')
    await page.keyboard.press('Control+z')
    await settle()
    await exact('native-drag-undo', before, await snapshot())
    await page.keyboard.press('Control+y')
    await settle()
    await exact('native-drag-redo', edited, await snapshot())
  })
  await gate('native-keyboard-navigation', async () => {
    for (const [id, key] of [
      ['roadmap', 'Enter'],
      ['planting', 'Space'],
    ]) {
      await thumbnail(id).focus()
      const focus = await thumbnail(id).evaluate((node) => ({
        focused: document.activeElement === node,
        role: node.getAttribute('role'),
        tabIndex: node.getAttribute('tabindex'),
      }))
      await page.keyboard.press(key)
      await settle()
      const active = (await snapshot()).activeSlideId
      const check = { name: 'native-' + key, target: id, active, focus }
      report.checks.push(check)
      if (active !== id) report.knownIssues.push(check)
    }
    await capture('native-keyboard-navigation')
  })
  await gate('native-context-menu-and-history', async () => {
    await thumbnail('decision').click({ button: 'right' })
    await settle()
    const before = await snapshot()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await order(before.slideOrder.filter((id) => id !== 'decision'))
    const removed = await snapshot()
    assert.equal(removed.slides.decision, undefined)
    await capture('native-menu-delete')
    await page.keyboard.press('Control+z')
    await settle()
    await exact('native-menu-delete-undo', before, await snapshot())
    await page.keyboard.press('Control+y')
    await settle()
    await exact('native-menu-delete-redo', removed, await snapshot())
    await page.keyboard.press('Control+z')
    await settle()
  })
  await gate(
    'native-toolbar-after-canvas-focus',
    async () => {
      await page.evaluate(async () => {
        window.demo.dispose()
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await ready()
      await thumbnail('context').click()
      await settle()
      const before = await snapshot()
      await thumbnail('context').dragTo(thumbnail('opening'), { targetPosition: { x: 100, y: 10 } })
      await order(['context', 'opening', ...original.slideOrder.slice(2)])
      const edited = await snapshot()
      const canvas = await root.locator('[data-slide-canvas-host] canvas').first().boundingBox()
      const initiallyDisabled = await root.locator('[data-u-command="univer.command.undo"]').isDisabled()
      await page.mouse.click(canvas.x + 20, canvas.y + 20)
      await settle()
      report.checks.push({
        name: 'toolbar-focus',
        initiallyDisabled,
        afterCanvasDisabled: await root.locator('[data-u-command="univer.command.undo"]').isDisabled(),
      })
      await root.locator('[data-u-command="univer.command.undo"]').click()
      await settle()
      await exact('toolbar-drag-undo', before, await snapshot())
      await root.locator('[data-u-command="univer.command.redo"]').click()
      await settle()
      await exact('toolbar-drag-redo', edited, await snapshot())
      await capture('toolbar-drag-redone')
    },
    true,
  )
  await gate('twelve-literal-facade-variants', async () => {
    // Start from a real clean owner, not a host normalization of previous interactions.
    if (buildStandalone) {
      await page.evaluate(async () => {
        window.demo.dispose()
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await ready()
    } else {
      for (const [index, id] of original.slideOrder.entries())
        await page.evaluate(
          ({ id: pageId, index: position }) => {
            const deck = window.univerAPI.getPresentation('cobalt-deck')
            deck.moveSlide(deck.getSlideById(pageId), position)
          },
          { id, index },
        )
    }
    // Match the README's visible focus prerequisite; preserve separate thumbnail-only FAIL gates.
    const nativeCanvas = await root.locator('[data-slide-canvas-host] canvas').first().boundingBox()
    await page.mouse.click(nativeCanvas.x + 20, nativeCanvas.y + 20)
    await settle()
    const baseline = await snapshot()
    let groupAfter
    for (const [i, example] of examples.entries()) {
      const before = await snapshot()
      await run(example)
      await settle()
      const after = await snapshot()
      await fs.writeFile(
        path.join(directory, 'literal-' + (i + 1) + '.json'),
        JSON.stringify({ source: example, before, after }, null, 2),
      )
      await order(after.slideOrder)
      if (i === 0) assert.equal(after.activeSlideId, 'planting')
      if (i === 1) assert.equal(after.slideOrder.indexOf('planting'), 2)
      if (i === 2) assert.equal(after.slideOrder.indexOf('planting'), 3)
      if (i === 3) assert.equal(after.slideOrder[0], 'decision')
      if (i === 4) assert.equal(after.slideOrder.at(-1), 'decision')
      if (i === 5) assert.equal(after.slideOrder[2], 'planting')
      if (i === 6) {
        assert.deepEqual(after.slideOrder, sectionOrder(before, 'review', 'roadmap'))
        assert.equal(sections(after).find((g) => g.id === 'review').contiguous, true)
        assert.equal(await page.evaluate(() => window.cobaltMoves), 3)
        groupAfter = after
      }
      if (i === 7) assert.notDeepEqual(after.slideOrder, groupAfter.slideOrder)
      if (i === 8) await exact('literal-group-redo', groupAfter, after)
      if (i === 9) assert.equal(sections(after).find((g) => g.id === 'review').contiguous, false)
      if (i === 10) assert.deepEqual(await page.evaluate(() => window.cobaltCheckpoint), after)
      if (i === 11) {
        assert.deepEqual(await page.evaluate(() => window.cobaltCheckpoint), before)
        assert.equal(
          await page.evaluate(() =>
            window.univerAPI
              .getPresentation('cobalt-deck')
              .getSlideById('decision')
              .getElementById('title')
              .getText()
              .getPlainText(),
          ),
          'Decision / review before expanding',
        )
      } else assert.deepEqual(after.slides, baseline.slides)
      report.checks.push({
        name: 'literal-' + (i + 1),
        source: example,
        beforeOrder: before.slideOrder,
        afterOrder: after.slideOrder,
      })
    }
    const stable = await snapshot()
    for (const position of [0, -1, 1.5, 99]) {
      await assert.rejects(
        () => run(examples[5].replace('const position = 3', 'const position = ' + position)),
        /whole-number/,
      )
      await exact('invalid-position-' + position, stable, await snapshot())
    }
    await capture('literal-split-group')
  })
  await gate(
    'full-owner-reconstruction-and-paint',
    async () => {
      const saved = await restoreCheckpoint('reordered-owner', 'cobaltCheckpoint')
      assert.equal(sections(saved).find((g) => g.id === 'review').contiguous, false)
      await gallery('restored', saved)
      await exact('restored-all-pages', saved, await snapshot())
    },
    true,
  )
  await gate(
    'fresh-native-edit-and-history',
    async () => {
      await freshNativeEdit('restored')
    },
    true,
  )
  await gate(
    'invalid-before-dispose',
    async () => {
      const saved = await snapshot()
      const rejected = await page.evaluate(() => {
        const owner = window.univerAPI,
          invalid = structuredClone(owner.getPresentation('cobalt-deck').save())
        invalid.activeSlideId = 'missing'
        try {
          window.createDemo(window.container, false, 'enUS', invalid)
          return false
        } catch {
          return window.univerAPI === owner && document.querySelectorAll('.slide-order').length === 1
        }
      })
      assert.equal(rejected, true)
      await exact('invalid-owner-preserved', saved, await snapshot())
    },
    true,
  )
  await gate('complete-locales-and-theme-owner', async () => {
    const factory = await fs.readFile('showcase/slides/reorder-and-sections/code/create-demo.ts', 'utf8'),
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
  for (const variant of ['roadmap-first', 'review-first', 'repeated-names', 'single', 'empty'])
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
          if (variant === 'repeated-names') assert.equal(saved.slides.roadmap.name, saved.slides.review.name)
          if (variant === 'single') assert.deepEqual(saved.slideOrder, ['decision'])
          await gallery('startup-' + variant, saved)
        }
        await page.evaluate(() => {
          window.startupSnapshot = structuredClone(window.univerAPI.getPresentation('cobalt-deck').save())
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
        if (window.univerAPI || document.querySelector('.slide-order')) throw new Error('Pre-ready owner leaked')
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
