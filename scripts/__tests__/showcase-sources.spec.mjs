import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from '../showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-basic-native-current')
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
  const source = (await readShowcaseSources()).find((s) => s.slug === 'slides/basic-via-plugin')
  const project =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-slides-basic-native-')))
  const original = { slug: source.slug, directory: project }
  report.originalExport = original
  report.harness = project
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(project, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  const manifest = JSON.parse(source.files['/package.json'])
  report.dependencyVersions = {}
  for (const [name, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
    const installed = await fs.realpath(
      name === 'vite'
        ? process.env.SHOWCASE_VITE_DIR || path.resolve('node_modules/vite')
        : path.resolve('node_modules', name),
    )
    assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version)
    const target = path.join(project, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    if (!(await fs.lstat(target).catch(() => null))) await fs.symlink(installed, target, 'junction')
    report.dependencyVersions[name] = version
  }
  await fs.writeFile(path.join(directory, 'exports.json'), JSON.stringify([original], null, 2))
  const vite = await import(pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js')))
  await vite.build({ root: project, configFile: false, logLevel: 'warn' })
  await fs.writeFile(
    path.join(project, 'src/index.ts'),
    source.files['/src/index.ts']
      .replace('import { createSlidesDemo }', 'import { createSlidesDemo, validateSnapshot }')
      .replace('const demo = createSlidesDemo(container)', 'window.basicController = createSlidesDemo(container)')
      .replace('() => demo.dispose()', '() => window.basicController.dispose()') +
      '\nwindow.basicCreate = createSlidesDemo\nwindow.basicValidate = validateSnapshot\n',
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
  await vite.build({
    root: project,
    configFile: false,
    logLevel: 'warn',
    build: { outDir: path.join(directory, 'dist'), emptyOutDir: false },
  })
  await fs.writeFile(path.join(project, 'src/index.ts'), source.files['/src/index.ts'])
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
  const root = page.locator('.slides-basic-demo'),
    run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
  const snapshot = () =>
    run("return JSON.parse(JSON.stringify(window.univerAPI.getPresentation('slides-pro-demo').save()))")
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
    await paint('Web SDK Slides')
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
      const canvas = [...document.querySelectorAll('.slides-basic-demo canvas')].find(
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
      window.basicOldOwner = window.univerAPI
      window.basicOldRoot = document.querySelector('.slides-basic-demo')
      window.basicController.dispose()
      window.basicController.dispose()
      window.basicController = window.basicCreate(document.getElementById('app'), false, undefined, saved)
    }, data)
    await ready()
    assert.equal(
      await run('return window.basicOldOwner === window.univerAPI || window.basicOldRoot.isConnected'),
      false,
    )
    assert.equal(await root.count(), 1)
  }
  await fresh()
  await gate('normal-entry-layout-parity', async () => {
    const geometry = await page.evaluate(() => ({
      innerHeight,
      documentHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.getBoundingClientRect().height,
      appHeight: document.getElementById('app').getBoundingClientRect().height,
      rootHeight: document.querySelector('.slides-basic-demo').getBoundingClientRect().height,
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
    assert.equal(report.original.slideOrder.length, 3)
    await shot('baseline')
  })
  await gate('native-three-page-story', async () => {
    for (const [id, text] of [
      ['cover', 'Web SDK Slides'],
      ['feature', 'Plugin mode'],
      ['summary', 'Q3 product momentum'],
    ]) {
      await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
      await settle()
      await paint(text)
      await shot('page-' + id)
    }
    assert.equal(
      report.original.slides.summary.elements['metric-growth'].shapeData.shapeText.text,
      '+31%\nPipeline growth',
    )
    assert.equal(
      report.original.slides.summary.elements['metric-retention'].shapeData.shapeText.text,
      '94%\nCustomer\nretention',
    )
    assert.equal(
      report.original.slides.summary.elements['metric-launches'].shapeData.shapeText.text,
      '7\nFeature launches',
    )
  })
  await gate('native-ellipse-drag-model-and-paint', async () => {
    await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="feature"]').click()
    await paint('Plugin mode')
    report.evidence.geometry = { before: await snapshot() }
    const point = await page.evaluate(() => {
      const api = window.univerAPI,
        deck = api.getActivePresentation(),
        injector = api._injector
      const token = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      )
      const render = injector.get(token).getRenderUnitById(deck.getId()),
        viewport = render.scene.getViewport('viewMain')
      const object = render.scene.getObject('slide-drawing-' + deck.getId() + '-feature-shape-a')
      const canvas = [...document.querySelectorAll('.slides-basic-demo canvas')].find(
        (c) =>
          c.closest('[data-slide-canvas-host]') && !c.closest('[data-u-comp="slide-thumbnail-item"]') && c.width > 300,
      )
      const box = canvas.getBoundingClientRect()
      return {
        x: box.x + (object.left + object.width / 2 - viewport.viewportScrollX) * render.scene.scaleX,
        y: box.y + (object.top + object.height / 2 - viewport.viewportScrollY) * render.scene.scaleY,
      }
    })
    const beforePaint = await page.screenshot()
    await page.mouse.move(point.x, point.y)
    await page.mouse.down()
    await page.mouse.move(point.x - 36, point.y + 28, { steps: 12 })
    await page.mouse.up()
    await settle()
    report.evidence.geometry.after = await snapshot()
    assert.notDeepEqual(
      report.evidence.geometry.after.slides.feature.elements['shape-a'].transform,
      report.evidence.geometry.before.slides.feature.elements['shape-a'].transform,
    )
    assert.notDeepEqual(await page.screenshot(), beforePaint)
    await shot('native-geometry')
  })
  await gate('native-ellipse-full-history', () => fullHistory('geometry'))
  await fresh()
  const examples = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1])
  assert.equal(examples.length, 14)
  report.literalCount = examples.length
  for (let i = 0; i < examples.length; i++) {
    await gate('literal-' + (i + 1), async () => {
      const before = await snapshot()
      if (i === 7) {
        await assert.rejects(run(examples[i]), /review summary already exists/)
        assert.deepEqual(await snapshot(), before)
        return 'Expected application rejection'
      }
      await run(examples[i])
      await settle()
      if (i === 13) {
        await ready()
        await paint('Web SDK Slides')
        assert.deepEqual(await snapshot(), report.original)
        return
      }
      const after = await snapshot()
      if (i === 1) {
        assert.equal(after.slides.cover.elements.title.shapeData.shapeText.text, 'Web SDK / Product studio')
        await paint('Web SDK / Product studio')
      }
      if (i === 2) {
        assert.equal(after.activeSlideId, 'feature')
        await paint('Plugin mode')
      }
      if (i === 3) {
        assert.equal(after.slides.feature.elements['shape-a'].transform.left, 795)
        assert.equal(after.slides.feature.elements['shape-a'].transform.rotation, 18)
      }
      if (i === 4) assert.ok(after.slides.feature.speakerNotes.includes('selected plugins'))
      if (i === 5) assert.deepEqual(await run('return window.basicSummary'), after.slides.summary)
      if (i === 6) {
        assert.equal(after.slideOrder.length, 4)
        assert.equal(after.activeSlideId, 'summary-review')
        assert.equal(
          after.slides['summary-review'].elements['metric-growth'].shapeData.shapeText.text,
          '+34%\nPipeline growth',
        )
        assert.deepEqual(after.slides.summary, before.slides.summary)
        await paint('+34%')
        report.appendCopy = after.slides['summary-review']
        report.appendLayout = after.layoutPages[report.appendCopy.layoutPageId]
        report.appendPaint = await page.evaluate(() =>
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
        await shot('literal-summary-copy')
      }
      if (i === 8) {
        assert.deepEqual(after.slideOrder, ['cover', 'feature', 'summary'])
        assert.equal(after.slides['summary-review'], undefined)
        assert.deepEqual(after.slides.summary, report.original.slides.summary)
      }
      if (i === 9) report.literalSaved = after
      if ([10, 12].includes(i)) {
        assert.deepEqual(after, report.literalSaved)
        await paint('Q3 product momentum')
      }
      if (i === 11) {
        assert.equal(after.id, 'slides-pro-demo')
        assert.equal(after.slideOrder.length, 0)
        assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 0)
        await shot('literal-empty')
      }
    })
  }
  await gate('append-copy-native-layout-and-clean-paint', async () => {
    assert.equal(report.appendLayout.layoutType, 'blank')
    assert.deepEqual(report.appendLayout.elementOrder, [])
    assert.deepEqual(report.appendCopy.pageSize, report.original.defaultPageSize)
    assert.ok(report.appendPaint.join('').replace(/\s/g, '').includes('+34%'))
    assert.doesNotMatch(report.appendPaint.join(' '), /placeholder|slides\.slide\./i)
  })
  await fresh()
  await gate('native-text-input', () => nativeText('nativeText', 'Web SDK / Native plugin review'))
  await gate('native-text-full-undo-redo', () => fullHistory('nativeText'))
  await fresh()
  await gate('speaker-notes-native-textarea-save', async () => {
    report.evidence.notes = { before: await snapshot() }
    const text = 'Plugin studio: native speaker decision.\nRecheck the selected UI plugins. 复查'
    const notes = root.locator('[data-u-comp="slide-speaker-notes-display"]')
    await notes.getByRole('textbox', { name: 'Speaker notes', exact: true }).fill(text)
    await notes.getByRole('button', { name: 'Save', exact: true }).click()
    await settle()
    report.evidence.notes.after = await snapshot()
    assert.equal(report.evidence.notes.after.slides.cover.speakerNotes, text)
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
      report.evidence.notes.after.slides.cover.speakerNotes,
    )
  })
  await gate('same-id-full-owner-reconstruction', async () => {
    report.saved = await snapshot()
    await rebuild(report.saved)
    report.restored = await snapshot()
    assert.deepEqual(report.restored, report.saved)
    await paint('Web SDK Slides')
    await shot('restored')
  })
  await gate('rebuilt-owner-fresh-native-input', () => nativeText('rebuiltText', 'Web SDK / Restored product studio'))
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
        "window.basicCreate(document.getElementById('app'), false, undefined, { id:'broken', slides:{}, slideOrder:['missing'], defaultPageSize:{width:0,height:675} })",
      ),
      /valid page identities/,
    )
    assert.deepEqual(await snapshot(), before)
    assert.equal(await root.count(), 1)
  })
  await gate('same-owner-theme-preserves-edits', async () => {
    await run(
      "window.basicOwner = window.univerAPI; window.basicModel = window.univerAPI.getPresentation('slides-pro-demo'); window.basicModel.getSlideById('cover').getElementById('title').getText().setText('Web SDK / Theme retained')",
    )
    const before = await snapshot()
    await run('window.univerAPI.toggleDarkMode(true)')
    await settle()
    await shot('dark')
    await run('window.univerAPI.toggleDarkMode(false)')
    await settle()
    assert.deepEqual(await snapshot(), before)
    assert.equal(await run('return window.univerAPI === window.basicOwner'), true)
    assert.deepEqual(await run('return JSON.parse(JSON.stringify(window.basicModel.save()))'), before)
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
    await run('window.basicController.dispose(); window.basicController.dispose(); await window.basicController.ready')
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
