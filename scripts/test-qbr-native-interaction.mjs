/* eslint-disable no-await-in-loop -- Native interactions and owner transitions are deliberately sequential. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/qbr-native-interaction-current')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, gates: {}, errors: [], backendRequests: [], evidence: {} }
let server, browser
function pack(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') pack(actual?.[key], value)
    else assert.deepEqual(actual?.[key], value)
  }
}
try {
  const original = JSON.parse(await fs.readFile('test-results/qbr-native-verified/exports.json', 'utf8'))[0]
  const source = (await readShowcaseSources()).find((s) => s.slug === original.slug)
  const project = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-qbr-interaction-'))
  report.originalExport = original
  report.harness = project
  for (const [name, content] of Object.entries(source.files)) {
    assert.equal(await fs.readFile(path.join(original.directory, name.slice(1)), 'utf8'), content, name)
    const target = path.join(project, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  const manifest = JSON.parse(source.files['/package.json'])
  report.dependencyVersions = {}
  for (const [name, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
    const installed = await fs.realpath(path.join(original.directory, 'node_modules', name))
    assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version)
    const target = path.join(project, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.symlink(installed, target, 'junction')
    report.dependencyVersions[name] = version
  }
  await fs.writeFile(
    path.join(project, 'src/index.ts'),
    source.files['/src/index.ts']
      .replace(
        'import { createQuarterlyBusinessReviewDemo }',
        'import { createQuarterlyBusinessReviewDemo, validateSnapshot }',
      )
      .replace(
        'const demo = createQuarterlyBusinessReviewDemo(container)',
        'window.qbrController = createQuarterlyBusinessReviewDemo(container)',
      )
      .replace('() => demo.dispose()', '() => window.qbrController.dispose()') +
      '\nwindow.qbrCreate = createQuarterlyBusinessReviewDemo\nwindow.qbrValidate = validateSnapshot\n',
  )
  report.harnessDifference =
    'Only src/index.ts exposes the unchanged factory/controller/validator; no additional UI. Normal export/dist untouched.'
  await fs.writeFile(
    path.join(directory, 'harness-manifest.json'),
    JSON.stringify(
      { original, project, sourceFiles: Object.keys(source.files).length, harnessDifference: report.harnessDifference },
      null,
      2,
    ),
  )
  const vite = await import(pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js')))
  await vite.build({
    root: project,
    configFile: false,
    logLevel: 'warn',
    build: { outDir: path.join(directory, 'dist'), emptyOutDir: false },
  })
  server = await vite.preview({
    root: project,
    configFile: false,
    build: { outDir: path.join(directory, 'dist') },
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1700, height: 1100 }, colorScheme: 'light' })
  page.setDefaultTimeout(8000)
  page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
  })
  page.on('request', (request) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
      request.url().includes('/universer-api/') ||
      (['fetch', 'xhr'].includes(request.resourceType()) &&
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
      window.slideFrames.set(
        this.canvas,
        [...(window.slideFrames.get(this.canvas) || []), String(args[0])].slice(-50000),
      )
      return Reflect.apply(fill, this, args)
    }
    proto.clearRect = function (...args) {
      window.slideFrames.set(this.canvas, [])
      return Reflect.apply(clear, this, args)
    }
    proto.drawImage = function (imageSource, ...args) {
      if (imageSource !== this.canvas)
        window.slideFrames.set(
          this.canvas,
          [...(window.slideFrames.get(this.canvas) || []), ...(window.slideFrames.get(imageSource) || [])].slice(
            -50000,
          ),
        )
      return Reflect.apply(draw, this, [imageSource, ...args])
    }
  })
  const root = page.locator('.qbr-demo'),
    run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
  const snapshot = () =>
    run("return JSON.parse(JSON.stringify(window.univerAPI.getPresentation('qbr-fy2027-q2').save()))")
  const settle = async () => {
    await page.waitForTimeout(350)
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  }
  const shot = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
  async function paint(text) {
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
  async function ready() {
    await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 30000 })
    assert.equal(await root.getAttribute('data-error'), null)
    assert.equal(await root.locator('[data-u-comp="workbench-skeleton-content"]').count(), 0)
    await settle()
  }
  async function fresh() {
    await page.goto('http://127.0.0.1:4412')
    await ready()
    await paint('A resilient quarter. A gap to close.')
  }
  async function gate(name, fn) {
    try {
      report.gates[name] = { passed: true, result: await fn() }
    } catch (error) {
      report.gates[name] = { passed: false, error: error.stack || String(error) }
      await shot(name + '-FAIL').catch(() => {})
      await fs.writeFile(
        path.join(directory, name + '-state.json'),
        JSON.stringify(
          {
            snapshot: await snapshot().catch(() => null),
            body: await page
              .locator('body')
              .innerText()
              .catch(() => null),
            editors: await page
              .locator('textarea,[contenteditable]')
              .evaluateAll((nodes) =>
                nodes.map((n) => ({
                  tag: n.tagName,
                  editable: n.getAttribute('contenteditable'),
                  component: n.getAttribute('data-u-comp'),
                  value: n.value,
                  text: n.textContent,
                })),
              )
              .catch(() => []),
          },
          null,
          2,
        ),
      )
    }
    await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
    console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
  }
  async function nativeText(key, text) {
    report.evidence[key] = { before: await snapshot() }
    const box = await page.evaluate(() => {
      const api = window.univerAPI,
        deck = api.getActivePresentation(),
        slide = deck.getActiveSlide(),
        injector = api._injector
      const token = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      )
      const render = injector.get(token).getRenderUnitById(deck.getId()),
        viewport = render.scene.getViewport('viewMain')
      const object = render.scene.getObject('slide-drawing-' + deck.getId() + '-' + slide.getId() + '-title')
      const canvas = [...document.querySelectorAll('.qbr-demo canvas')].find(
          (c) =>
            c.closest('[data-slide-canvas-host]') &&
            !c.closest('[data-u-comp="slide-thumbnail-item"]') &&
            c.width > 300,
        ),
        bounds = canvas.getBoundingClientRect()
      return {
        x: bounds.x + (object.left - viewport.viewportScrollX) * render.scene.scaleX,
        y: bounds.y + (object.top - viewport.viewportScrollY) * render.scene.scaleY,
        width: object.width * render.scene.scaleX,
        height: object.height * render.scene.scaleY,
      }
    })
    report.evidence[key].bounds = box
    await page.mouse.dblclick(box.x + 80, box.y + 30)
    await page.waitForFunction(
      () =>
        document.activeElement?.getAttribute('contenteditable') === 'true' ||
        (document.activeElement?.tagName === 'TEXTAREA' &&
          !document.activeElement?.closest('[data-u-comp="slide-speaker-notes-display"]')),
    )
    await page.waitForTimeout(350)
    await page.keyboard.press('Control+a')
    await page.keyboard.type(text)
    await page.mouse.click(box.x - 10, box.y - 20)
    await settle()
    report.evidence[key].after = await snapshot()
    assert.equal(
      await run(
        "return window.univerAPI.getActivePresentation().getActiveSlide().getElementById('title').getText().getPlainText()",
      ),
      text,
    )
    await paint(text)
    await shot(key + '-edited')
  }
  async function fullHistory(key) {
    await page.keyboard.press('Control+z')
    await settle()
    report.evidence[key].undo = await snapshot()
    await shot(key + '-undo')
    await page.keyboard.press('Control+y')
    await settle()
    report.evidence[key].redo = await snapshot()
    assert.deepEqual(report.evidence[key].undo, report.evidence[key].before)
    assert.deepEqual(report.evidence[key].redo, report.evidence[key].after)
  }
  async function rebuild(data) {
    await page.evaluate((saved) => {
      window.qbrOldOwner = window.univerAPI
      window.qbrOldRoot = document.querySelector('.qbr-demo')
      window.qbrController.dispose()
      window.qbrController.dispose()
      window.qbrController = window.qbrCreate(document.getElementById('app'), false, undefined, saved)
    }, data)
    await ready()
    assert.equal(await run('return window.qbrOldOwner === window.univerAPI || window.qbrOldRoot.isConnected'), false)
    assert.equal(await root.count(), 1)
  }
  await fresh()
  await gate('normal-entry-layout-parity', async () => {
    const geometry = await page.evaluate(() => ({
      innerHeight,
      documentHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.getBoundingClientRect().height,
      appHeight: document.getElementById('app').getBoundingClientRect().height,
      rootHeight: document.querySelector('.qbr-demo').getBoundingClientRect().height,
      bodyMargin: getComputedStyle(document.body).margin,
    }))
    assert.equal(geometry.documentHeight, geometry.innerHeight)
    assert.equal(geometry.appHeight, geometry.innerHeight)
    assert.equal(geometry.rootHeight, geometry.innerHeight)
    assert.equal(geometry.bodyMargin, '0px')
    return geometry
  })
  await gate('startup-original-paint', async () => {
    report.original = await snapshot()
    assert.equal(report.original.slideOrder.length, 8)
    await shot('baseline')
  })
  await gate('native-text-input', () => nativeText('nativeText', 'Northstar / Native leadership review'))
  await gate('native-text-full-undo-redo', () => fullHistory('nativeText'))
  await fresh()
  await gate('speaker-notes-native-textarea-save', async () => {
    report.evidence.notes = { before: await snapshot() }
    const text = 'Mira: native leadership decision.\nRecheck renewal exposure in September. 复查'
    const notes = root.locator('[data-u-comp="slide-speaker-notes-display"]')
    await notes.getByRole('textbox', { name: 'Speaker notes', exact: true }).fill(text)
    await notes.getByRole('button', { name: 'Save', exact: true }).click()
    await settle()
    report.evidence.notes.after = await snapshot()
    assert.equal(report.evidence.notes.after.slides.scorecard.speakerNotes, text)
    assert.equal(await notes.locator('textarea').inputValue(), text)
    await shot('speaker-notes-saved')
  })
  await gate('speaker-notes-full-undo-redo', () => fullHistory('notes'))
  await gate('speaker-notes-canvas-focus-full-history', async () => {
    report.evidence.notesCanvas = { before: report.evidence.notes.before, after: report.evidence.notes.after }
    await page.evaluate(() => window.scrollTo(0, 0))
    const box = report.evidence.nativeText.bounds
    await page.mouse.click(box.x + 80, box.y + 30)
    report.evidence.notesCanvas.focus = await page.evaluate(() => ({
      tag: document.activeElement.tagName,
      component: document.activeElement.getAttribute('data-u-comp'),
      scrollY: window.scrollY,
    }))
    await shot('notes-selected-title-before-undo')
    await fullHistory('notesCanvas')
    assert.equal(
      await root.locator('[data-u-comp="slide-speaker-notes-display"] textarea').inputValue(),
      report.evidence.notes.after.slides.scorecard.speakerNotes,
    )
  })
  await gate('same-id-full-owner-reconstruction', async () => {
    report.saved = await snapshot()
    await rebuild(report.saved)
    report.restored = await snapshot()
    assert.deepEqual(report.restored, report.saved)
    await paint('A resilient quarter. A gap to close.')
    await shot('restored')
  })
  await gate('rebuilt-owner-fresh-native-input', () =>
    nativeText('rebuiltText', 'Northstar / Restored native decision'),
  )
  await gate('rebuilt-owner-full-undo-redo', () => fullHistory('rebuiltText'))
  await gate('empty-owner-and-full-restore', async () => {
    report.beforeEmpty = await snapshot()
    const empty = { ...report.beforeEmpty, slideOrder: [], slides: {}, activeSlideId: undefined }
    await rebuild(empty)
    report.empty = await snapshot()
    assert.equal(report.empty.id, report.beforeEmpty.id)
    assert.equal(report.empty.slideOrder.length, 0)
    assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 0)
    await shot('empty')
    await rebuild(report.beforeEmpty)
    report.afterEmptyRestore = await snapshot()
    assert.deepEqual(report.afterEmptyRestore, report.beforeEmpty)
    await shot('empty-restored')
  })
  await gate('invalid-snapshot-preserves-active-owner', async () => {
    const before = await snapshot()
    await assert.rejects(
      run(
        "window.qbrCreate(document.getElementById('app'), false, undefined, { id:'broken', slides:{}, slideOrder:['missing'], defaultPageSize:{width:0,height:675} })",
      ),
      /valid page identities/,
    )
    assert.deepEqual(await snapshot(), before)
    assert.equal(await root.count(), 1)
  })
  const packs = [...source.files['/src/create-demo.ts'].matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
  assert.equal(packs.length, 5)
  for (const [lang, locale, noteLabel, saveLabel] of [
    ['en-US', 'enUS', 'Speaker notes', 'Save'],
    ['zh-CN', 'zhCN', '备注', '保存'],
  ]) {
    await gate('initial-' + lang + '-native-and-all-packs', async () => {
      await page.route('http://127.0.0.1:4412/', async (route) => {
        const response = await route.fetch()
        await route.fulfill({
          response,
          body: (await response.text()).replace(/<html[^>]*>/, '<html lang="' + lang + '">'),
        })
      })
      await fresh()
      assert.equal(await run('return window.univerAPI.getCurrentLocale()'), locale)
      for (const [, prefix] of packs)
        pack(await run('return window.univerAPI.getLocales()'), (await import(prefix + lang)).default)
      assert.equal([...source.files['/src/create-demo.ts'].matchAll(/^import '.+\/lib\/index.css'/gm)].length, 5)
      const notes = root.locator('[data-u-comp="slide-speaker-notes-display"]')
      await notes.getByRole('textbox', { name: noteLabel, exact: true }).waitFor()
      await notes.getByRole('button', { name: saveLabel, exact: true }).waitFor()
      assert.doesNotMatch(await root.innerText(), /slides-ui\.|shape-editor-ui\./)
      await shot('initial-' + lang)
      await page.unroute('http://127.0.0.1:4412/')
    })
  }
  await gate('active-owner-idempotent-disposal', async () => {
    await root.locator('[data-u-comp="slide-speaker-notes-display"] textarea').fill('Unsaved native draft at disposal')
    await run('window.qbrController.dispose(); window.qbrController.dispose(); await window.qbrController.ready')
    assert.equal(await root.count(), 0)
    assert.equal(await run('return typeof window.univerAPI'), 'undefined')
    await settle()
  })
  await gate('no-backend-or-runtime-errors', async () => {
    assert.deepEqual(report.backendRequests, [])
    assert.deepEqual(report.errors, [])
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (error) {
  report.fatal = error.stack || String(error)
} finally {
  await browser?.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        directory,
        passed: report.passed,
        fatal: report.fatal,
        gates: Object.fromEntries(Object.entries(report.gates).map(([k, v]) => [k, v.passed])),
      },
      null,
      2,
    ),
  )
  if (!report.passed) process.exitCode = 1
}
