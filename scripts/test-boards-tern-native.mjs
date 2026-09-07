/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/tern-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/boards/create-save-and-restore-board/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 9)
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(restores.length, 2)
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4362'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/boards/create-save-and-restore-board`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-tern-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'boards/create-save-and-restore-board')
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
        name: 'tern-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo} from '/src/create-demo.ts';import {createData} from '/src/data.ts';window.createDemo=createDemo;window.createData=createData;window.container=document.getElementById('app');window.demo=createDemo(window.container);
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4362, strictPort: true },
  })
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true })
page.setDefaultTimeout(18000)
const report = {
  passed: false,
  checks: [],
  gates: {},
  knownIssues: [],
  errors: [],
  errorContexts: [],
  warnings: [],
  backendRequests: [],
}
let currentGate = 'startup'
page.on('pageerror', (error) => {
  report.errors.push(error.stack || error.message)
  report.errorContexts.push({ gate: currentGate, error: error.stack || error.message })
})
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
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
  window.boardFrames = new Map()
  const proto = CanvasRenderingContext2D.prototype,
    fill = proto.fillText,
    clear = proto.clearRect,
    draw = proto.drawImage
  proto.fillText = function (...args) {
    const texts = window.boardFrames.get(this.canvas) || []
    texts.push(String(args[0]))
    window.boardFrames.set(this.canvas, texts.slice(-50000))
    return Reflect.apply(fill, this, args)
  }
  proto.clearRect = function (...args) {
    window.boardFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  proto.drawImage = function (source, ...args) {
    if (source !== this.canvas)
      window.boardFrames.set(
        this.canvas,
        (window.boardFrames.get(this.canvas) || []).concat(window.boardFrames.get(source) || []).slice(-50000),
      )
    return Reflect.apply(draw, this, [source, ...args])
  }
})
const root = page.locator('.board-lifecycle')
const run = (code) => page.evaluate('(async () => {\n' + code + '\n})()')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('tern-station-lifecycle').save())))
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
async function ready() {
  await page.waitForFunction(
    () =>
      document.querySelector('.board-lifecycle')?.dataset.ready ||
      document.querySelector('.board-lifecycle')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
async function paint(text) {
  await page.waitForFunction(
    (wanted) =>
      [...window.boardFrames].some(
        ([canvas, texts]) =>
          canvas.isConnected &&
          canvas.getBoundingClientRect().width > 500 &&
          canvas.closest('[data-board-viewport-host]') &&
          texts.join('').includes(wanted),
      ),
    text,
  )
}
async function capture(name) {
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function gate(name, action, standalone = false) {
  if (standalone && !buildStandalone) {
    report.gates[name] = {
      passed: false,
      skipped: true,
      reason: 'Use SHOWCASE_BUILD_STANDALONE=1 for actual factory reconstruction.',
    }
    return
  }
  try {
    currentGate = name
    const issues = report.knownIssues.length,
      errors = report.errors.length
    await action()
    report.gates[name] = { passed: report.knownIssues.length === issues && report.errors.length === errors }
    if (!report.gates[name].passed)
      report.gates[name].failure =
        'Strict snapshot/content difference or SDK runtime error; see knownIssues/errorContexts.'
  } catch (error) {
    report.gates[name] = { passed: false, failure: error.stack }
    await capture(name + '-failure').catch(() => {})
  }
  console.log('Tern ' + name + ' ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
function diff(before, after, location = '') {
  if (Object.is(before, after)) return []
  if (before && after && typeof before === 'object' && typeof after === 'object')
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap((key) =>
      diff(before[key], after[key], location + '.' + key),
    )
  return [
    {
      path: location,
      before: before === undefined ? { absent: true } : before,
      after: after === undefined ? { absent: true } : after,
    },
  ]
}
async function exact(name, before, after) {
  const differences = diff(before, after)
  await fs.writeFile(
    path.join(directory, name + '-snapshots.json'),
    JSON.stringify({ before, after, differences }, null, 2),
  )
  try {
    assert.deepEqual(after, before)
    report.checks.push({ name, exact: true })
  } catch (error) {
    report.knownIssues.push({ name, gate: 'exact-whole-snapshot', differences, failure: error.message })
  }
}
async function point(id) {
  const value = await page.evaluate((elementId) => {
    const position = window.univerAPI.getBoard('tern-station-lifecycle').getElementViewportPoint(elementId)
    const canvas = document.querySelector('.board-lifecycle [data-board-viewport-host] canvas')
    const rect = canvas?.getBoundingClientRect()
    return position && rect ? { x: rect.x + position.x, y: rect.y + position.y } : null
  }, id)
  assert.ok(value, 'The existing native Board element has a viewport point')
  return value
}
function includesPack(actual, pack) {
  for (const [key, value] of Object.entries(pack))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
async function reconstruct(name, code) {
  const before = await snapshot()
  const appearance = await page.evaluate(() => ({
    locale: window.univerAPI.getCurrentLocale(),
    dark: window.univerAPI.isDarkMode(),
  }))
  await page.evaluate(() => {
    window.oldAPI = window.univerAPI
    window.oldRoot = document.querySelector('.board-lifecycle')
  })
  await run(code)
  await ready()
  assert.equal(await page.evaluate(() => window.oldAPI === window.univerAPI || window.oldRoot.isConnected), false)
  assert.equal(await root.count(), 1)
  assert.deepEqual(
    await page.evaluate(() => ({ locale: window.univerAPI.getCurrentLocale(), dark: window.univerAPI.isDarkMode() })),
    appearance,
  )
  const after = await snapshot()
  await exact(name, before, after)
  assert.equal(
    await page.evaluate(() => window.univerAPI.getBoard('tern-station-lifecycle').undo()),
    false,
    'Reconstruction has a fresh local history',
  )
  assert.deepEqual(await snapshot(), after)
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await paint('Tern field station / Opening plan')
  const initial = await snapshot()
  assert.deepEqual(initial.pageOrder, ['plan', 'review'])
  assert.equal(initial.activePageId, 'plan')
  assert.equal(initial.pages.plan.elementOrder.length, 8)
  assert.equal(initial.pages.review.elementOrder.length, 3)
  assert.equal(
    await root
      .locator('fieldset,[data-action],output,.board-lifecycle-controls,.board-lifecycle-editor,iframe')
      .count(),
    0,
  )
  await capture('baseline')
  await gate('literal-facade-variants', async () => {
    for (const [i, example] of examples.entries()) {
      const before = await snapshot(),
        download = i === 8 ? page.waitForEvent('download') : null
      await run(example)
      await settle()
      const after = await snapshot()
      if (i === 1) {
        assert.equal(
          after.pages.plan.elements.supplies.transform.left,
          before.pages.plan.elements.supplies.transform.left + 120,
        )
        assert.equal(
          after.pages.plan.elements.supplies.transform.top,
          before.pages.plan.elements.supplies.transform.top + 60,
        )
        assert.deepEqual(after.pages.review, before.pages.review)
      }
      if (i === 2) await exact('opposite-relative-moves', initial, after)
      if (i === 3) {
        assert.equal(after.pages.plan.elements.title.text, 'Tern field station / Ready for opening')
        await paint('Ready for opening')
      }
      if (i === 4) {
        assert.equal(
          await page.evaluate(() =>
            window.univerAPI.getBoard('tern-station-lifecycle').getShape('supplies').getText().getPlainText(),
          ),
          'Mina / Ready for dispatch\n12 sampling kits sealed\nDock pickup 08:45',
        )
        await paint('Dock pickup 08:45')
      }
      if ([0, 5, 6, 7].includes(i)) assert.deepEqual(after, before)
      if (download) {
        const file = await download
        assert.equal(file.suggestedFilename(), 'tern-station.board.json')
        const target = path.join(directory, 'downloaded.board.json')
        await file.saveAs(target)
        assert.deepEqual(JSON.parse(await fs.readFile(target, 'utf8')), after)
      }
      report.checks.push({ literal: i + 1, passed: true })
    }
  })
  await gate('native-pointer-drag-and-history', async () => {
    const before = await snapshot(),
      p = await point('supplies')
    await page.mouse.move(p.x, p.y)
    await page.mouse.down()
    await page.mouse.move(p.x + 72, p.y + 43, { steps: 8 })
    await page.mouse.up()
    await page.waitForFunction(
      (left) => window.univerAPI.getBoard('tern-station-lifecycle').getElementBounds('supplies').left !== left,
      before.pages.plan.elements.supplies.transform.left,
    )
    const moved = await snapshot()
    assert.notDeepEqual(moved.pages.plan.elements.supplies.transform, before.pages.plan.elements.supplies.transform)
    assert.deepEqual(moved.pages.review, before.pages.review)
    await run("window.univerAPI.getBoard('tern-station-lifecycle').undo()")
    await exact('pointer-undo', before, await snapshot())
    await run("window.univerAPI.getBoard('tern-station-lifecycle').redo()")
    await exact('pointer-redo', moved, await snapshot())
    await capture('native-pointer-drag')
  })
  await gate('native-arrow-key-and-history', async () => {
    await page.waitForTimeout(600) // Separate native clicks from the preceding drag's click/double-click window.
    const p = await point('supplies')
    await page.mouse.click(p.x, p.y)
    await settle()
    await capture('native-arrow-selection')
    const before = await snapshot()
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(
      (left) => window.univerAPI.getBoard('tern-station-lifecycle').getElementBounds('supplies').left !== left,
      before.pages.plan.elements.supplies.transform.left,
    )
    const moved = await snapshot()
    await run("window.univerAPI.getBoard('tern-station-lifecycle').undo()")
    await exact('arrow-undo', before, await snapshot())
    await run("window.univerAPI.getBoard('tern-station-lifecycle').redo()")
    await exact('arrow-redo', moved, await snapshot())
  })
  await gate('native-sticky-text-and-history', async () => {
    await page.waitForTimeout(600)
    const before = await snapshot(),
      p = await point('supplies')
    await page.mouse.dblclick(p.x, p.y)
    await page.waitForFunction(
      () =>
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true',
    )
    await page.waitForTimeout(350) // Wait for the native rich-text editor's initialization and selection.
    await page.keyboard.press('Control+A')
    await page.keyboard.insertText('Mina / Native text review')
    await page.keyboard.press('Enter')
    await page.keyboard.insertText('12 sealed kits')
    await page.keyboard.press('Enter')
    await page.keyboard.insertText('Pickup confirmed 09:10')
    await capture('native-sticky-text-editing')
    await page.waitForTimeout(350) // Native editing ignores external focus for its initial 300 ms.
    await page.mouse.click(30, 100)
    await page.waitForFunction(() =>
      window.univerAPI
        .getBoard('tern-station-lifecycle')
        .getShape('supplies')
        .getText()
        .getPlainText()
        .includes('Pickup confirmed 09:10'),
    )
    await page.waitForTimeout(350) // Let native editor completion detach before invoking history.
    const actual = await page.evaluate(() =>
      window.univerAPI.getBoard('tern-station-lifecycle').getShape('supplies').getText().getPlainText(),
    )
    const expected = 'Mina / Native text review\n12 sealed kits\nPickup confirmed 09:10'
    if (actual !== expected) report.knownIssues.push({ name: 'native-sticky-select-all-replacement', expected, actual })
    await paint('Pickup confirmed 09:10')
    const edited = await snapshot()
    assert.deepEqual(edited.pages.review, before.pages.review)
    await run("window.univerAPI.getBoard('tern-station-lifecycle').undo()")
    await exact('native-sticky-text-undo', before, await snapshot())
    await run("window.univerAPI.getBoard('tern-station-lifecycle').redo()")
    await exact('native-sticky-text-redo', edited, await snapshot())
    await capture('native-sticky-text')
  })
  await gate('native-standalone-heading-and-history', async () => {
    await page.waitForTimeout(600)
    const before = await snapshot(),
      p = await point('title')
    await page.mouse.dblclick(p.x, p.y)
    await page.waitForFunction(
      () =>
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true',
    )
    await page.waitForTimeout(350)
    await page.keyboard.press('Control+A')
    await page.keyboard.insertText('Tern / Native heading confirmed')
    await capture('native-heading-editing')
    await page.waitForTimeout(350) // Commit by leaving the native editor; Escape cancels.
    await page.mouse.click(30, 100)
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('tern-station-lifecycle').save().pages.plan.elements.title.text ===
        'Tern / Native heading confirmed',
    )
    await page.waitForTimeout(350)
    await paint('Tern / Native heading confirmed')
    const edited = await snapshot()
    await run("window.univerAPI.getBoard('tern-station-lifecycle').undo()")
    await exact('native-heading-undo', before, await snapshot())
    await run("window.univerAPI.getBoard('tern-station-lifecycle').redo()")
    await exact('native-heading-redo', edited, await snapshot())
  })
  await gate(
    'checkpoint-and-current-reconstruction',
    async () => {
      await reconstruct('edited-checkpoint', restores[0])
      await reconstruct('current-reload', restores[1])
      const before = await snapshot()
      await run(
        "window.univerAPI.getBoard('tern-station-lifecycle').setTextContent('title','Tern / Fresh edit after reconstruction')",
      )
      assert.equal((await snapshot()).pages.plan.elements.title.text, 'Tern / Fresh edit after reconstruction')
      assert.deepEqual((await snapshot()).pages.review, before.pages.review)
      await paint('Fresh edit after reconstruction')
      await capture('fresh-after-reconstruction')
    },
    true,
  )
  await gate('complete-locales-and-theme-preservation', async () => {
    const factory = await fs.readFile('showcase/boards/create-save-and-restore-board/code/create-demo.ts', 'utf8'),
      packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 7)
    const before = await snapshot()
    await page.evaluate(() => {
      window.originalAPI = window.univerAPI
    })
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((value) => window.univerAPI.setLocale(value), code)
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) {
        await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
        await settle()
      }
      assert.equal(await page.evaluate(() => window.originalAPI === window.univerAPI), true)
      await exact(locale + '-theme-cycle', before, await snapshot())
      await capture(locale + '-native')
      assert.equal(/(?:shape-editor-ui|ink-ui|boards-ui)\.[\w.]+/.test(await page.locator('body').innerText()), false)
    }
  })
  await gate(
    'data-variants-and-boundary-reconstruction',
    async () => {
      for (const state of ['boundary', 'empty', 'error', 'default']) {
        await page.evaluate(async (value) => {
          window.demo.dispose()
          window.demo = window.createDemo(window.container, false, 'enUS', window.createData(value))
          await window.demo.ready
        }, state)
        await ready()
        const data = await snapshot()
        if (state === 'boundary') {
          assert.deepEqual(data.pageOrder, ['review', 'plan'])
          assert.equal(data.activePageId, 'review')
          assert.equal(data.pages.review.elements.handover.transform.rotation, 12)
          assert.equal(data.pages.review.elements.handover.transform.left, -120)
          await paint('Archive 36 samples')
        }
        if (state === 'empty') {
          assert.equal(data.pages.plan.elementOrder.length, 0)
          await page.evaluate(() => window.demo.fit())
          assert.deepEqual(await snapshot(), data)
        }
        if (state === 'error') {
          await run(examples[6])
          assert.deepEqual(await snapshot(), data)
        }
        await reconstruct(state + '-roundtrip', restores[1])
        assert.equal((await snapshot()).activePageId, data.activePageId)
        report.checks.push({
          state,
          pageOrder: data.pageOrder,
          activePage: data.activePageId,
          elementOrder: data.pages[data.activePageId].elementOrder,
        })
      }
      await paint('Tern field station / Opening plan')
      await capture('reset-original-pages')
    },
    true,
  )
  await gate(
    'initial-chinese-locale-and-disposal',
    async () => {
      await page.evaluate(async () => {
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
      await paint('Tern field station / Opening plan')
      await page.evaluate(() => window.demo.dispose())
      await root.waitFor({ state: 'detached' })
      await settle()
      assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    },
    true,
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0 && Object.values(report.gates).every((result) => result.passed)
} catch (error) {
  report.failure = error.stack
  await capture('failure').catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      { ...report, knownIssues: report.knownIssues.map((issue) => ({ ...issue, failure: undefined })) },
      null,
      2,
    ),
  )
  await browser.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
