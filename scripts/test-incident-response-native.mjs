/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/incident-response-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/boards/incident-response/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 9)
const restore = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].at(-1)[1]
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4416'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/boards/incident-response`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY ||
    (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-incident-response-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'boards/incident-response')
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
        name: 'incident-response-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createIncidentResponseDemo} from '/src/create-demo.ts';window.createIncidentResponseDemo=createIncidentResponseDemo;window.container=document.getElementById('app');window.demo=createIncidentResponseDemo(window.container);
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4416, strictPort: true },
  })
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true })
page.setDefaultTimeout(12000)
const report = {
  slug: 'boards/incident-response',
  passed: false,
  gates: {},
  checks: [],
  knownIssues: [],
  errors: [],
  warnings: [],
  backendRequests: [],
}
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['fetch', 'xhr'].includes(r.resourceType()) && !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.boardFrames = new Map()
  const p = CanvasRenderingContext2D.prototype,
    fill = p.fillText,
    clear = p.clearRect,
    draw = p.drawImage
  p.fillText = function (...args) {
    window.boardFrames.set(this.canvas, [...(window.boardFrames.get(this.canvas) || []), String(args[0])].slice(-50000))
    return Reflect.apply(fill, this, args)
  }
  p.clearRect = function (...args) {
    window.boardFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  p.drawImage = function (source, ...args) {
    if (source !== this.canvas)
      window.boardFrames.set(
        this.canvas,
        [...(window.boardFrames.get(this.canvas) || []), ...(window.boardFrames.get(source) || [])].slice(-50000),
      )
    return Reflect.apply(draw, this, [source, ...args])
  }
})
const root = page.locator('.incident-board'),
  canvas = root.locator('[data-board-viewport-host] canvas').first()
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveBoard().save())))
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
async function paint(text) {
  await page.waitForFunction(
    (wanted) =>
      [...window.boardFrames].some(
        ([c, words]) => c.isConnected && c.closest('[data-board-viewport-host]') && words.join('').includes(wanted),
      ),
    text,
  )
}
async function ready() {
  await page.locator('.incident-board[data-ready=true]').waitFor()
  await paint('DETECT')
  await settle()
}
async function fresh() {
  await page.goto(url)
  await ready()
}
const point = (id) =>
  page.evaluate((elementId) => {
    const p = window.univerAPI.getActiveBoard().getElementViewportPoint(elementId)
    const r = document.querySelector('[data-board-viewport-host] canvas').getBoundingClientRect()
    if (!p) throw Error('No native viewport point for ' + elementId)
    return { x: r.x + p.x, y: r.y + p.y }
  }, id)
function differences(a, b, p = '$', out = []) {
  if (Object.is(a, b)) return out
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
    out.push({ path: p, before: a, after: b })
    return out
  }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) differences(a[k], b[k], p + '.' + k, out)
  return out
}
async function exact(name, before, after) {
  const diff = differences(before, after)
  await fs.writeFile(
    path.join(directory, name + '.json'),
    JSON.stringify({ before, after, differences: diff }, null, 2),
  )
  report.checks.push({ name, passed: !diff.length })
  if (diff.length) {
    report.knownIssues.push({ name, differences: diff })
    return false
  }
  return true
}
async function gate(name, fn, standalone = false) {
  if (standalone && !buildStandalone) {
    report.gates[name] = { passed: false, error: 'Requires standalone harness' }
    return
  }
  const issues = report.knownIssues.length
  try {
    await fn()
    report.gates[name] = { passed: issues === report.knownIssues.length }
  } catch (e) {
    report.gates[name] = { passed: false, error: e.stack || String(e) }
    await capture(name + '-failure').catch(() => {})
  }
  if (!report.gates[name].passed && !report.gates[name].error)
    report.gates[name].error = 'Strict complete snapshot or native content differences retained'
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
}
function pack(actual, want, p = '') {
  for (const [k, v] of Object.entries(want)) {
    if (v && typeof v === 'object') pack(actual?.[k], v, p + k + '.')
    else assert.equal(actual?.[k], v, p + k)
  }
}
async function nativeText(id, text) {
  const p = await point(id)
  await page.mouse.dblclick(p.x, p.y)
  await page.waitForFunction(
    () =>
      document.activeElement?.tagName === 'TEXTAREA' ||
      document.activeElement?.getAttribute('contenteditable') === 'true',
  )
  await page.waitForTimeout(350)
  await page.keyboard.press('Control+a')
  for (const [index, line] of text.split('\n').entries()) {
    if (index) await page.keyboard.press('Enter')
    await page.keyboard.insertText(line)
  }
  await capture('native-text-editing')
  await page.waitForTimeout(350)
  const rect = await canvas.boundingBox()
  await page.mouse.click(rect.x + rect.width - 80, rect.y + rect.height - 120)
  await page.waitForTimeout(350)
  await paint(text.split('\n')[0])
  const actual = await page.evaluate(
    (elementId) => window.univerAPI.getActiveBoard().getShape(elementId).getText().getPlainText(),
    id,
  )
  report.checks.push({ name: 'native-text-exact-' + id, passed: actual === text })
  if (actual !== text)
    report.knownIssues.push({ name: 'native-text-exact-' + id, differences: [{ expected: text, actual }] })
}
async function nativeDrag(id, dx, dy) {
  const p = await point(id),
    before = await page.evaluate((elementId) => window.univerAPI.getActiveBoard().getElementBounds(elementId), id)
  await page.mouse.move(p.x, p.y)
  await page.mouse.down()
  await page.mouse.move(p.x + dx, p.y + dy, { steps: 8 })
  await page.mouse.up()
  await page.waitForFunction(
    ({ id: elementId, left }) => window.univerAPI.getActiveBoard().getElementBounds(elementId).left !== left,
    { id, left: before.left },
  )
  await settle()
}
async function history(name, before, after) {
  await page.keyboard.press('Control+z')
  await settle()
  await exact(name + '-undo', before, await snapshot())
  await page.keyboard.press('Control+y')
  await settle()
  await exact(name + '-redo', after, await snapshot())
}
try {
  await gate('original-seven-elements-native-paint-and-free-endpoints', async () => {
    await fresh()
    assert.equal(await root.locator('[data-action],fieldset,output,pre,:scope > button').count(), 0)
    const model = await snapshot(),
      p = model.pages[model.activePageId]
    assert.deepEqual(p.elementOrder, [
      'response-frame',
      'detect',
      'contain',
      'recover',
      'risk-note',
      'detect-contain',
      'contain-recover',
    ])
    for (const text of [
      'Payment error rate',
      'Disable retry fan-out',
      'Drain delayed queue',
      '214 duplicate',
      '17:00 UTC',
    ])
      await paint(text)
    const connections = await page.evaluate(() =>
      ['detect-contain', 'contain-recover'].map((id) => window.univerAPI.getActiveBoard().getConnectorConnection(id)),
    )
    assert.deepEqual(
      connections.map((c) => [c.start.kind, c.end.kind]),
      [
        ['free', 'free'],
        ['free', 'free'],
      ],
    )
    await fs.writeFile(path.join(directory, 'original-model.json'), JSON.stringify(model, null, 2))
    await fs.writeFile(path.join(directory, 'original-connections.json'), JSON.stringify(connections, null, 2))
    const bytes = await canvas.screenshot()
    assert(bytes.length > 10000)
    await capture('cover')
  })
  await gate('nine-literal-variants-and-real-download', async () => {
    await fresh()
    for (const [index, code] of examples.entries()) {
      const pending = index === 8 ? page.waitForEvent('download') : undefined
      await run(code)
      await settle()
      if (index === 3) await paint('193 cleared')
      if (index === 4) {
        assert.equal(
          await page.evaluate(() => window.univerAPI.getActiveBoard().getElementBounds('risk-note').width),
          400,
        )
        await capture('reconciliation-variant')
      }
      if (pending) {
        const file = await pending
        assert.equal(file.suggestedFilename(), 'payments-incident.board.json')
        await exact('literal-json-download', await snapshot(), JSON.parse(await fs.readFile(await file.path(), 'utf8')))
        await file.saveAs(path.join(directory, 'payments-incident.board.json'))
      }
      report.checks.push({ name: 'literal-' + (index + 1), passed: true })
    }
  })
  await gate('response-only-variant-paint-and-full-history', async () => {
    await fresh()
    const before = await snapshot()
    await run("window.univerAPI.getActiveBoard().removeElements(['risk-note'])")
    await settle()
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveBoard().getElementOrder().length), 6)
    await paint('Drain delayed queue')
    await capture('response-only')
    const after = await snapshot()
    await run('window.univerAPI.getActiveBoard().undo()')
    await settle()
    await exact('response-only-undo', before, await snapshot())
    await run('window.univerAPI.getActiveBoard().redo()')
    await settle()
    await exact('response-only-redo', after, await snapshot())
  })
  await gate('native-pointer-move-free-arrows-and-full-history', async () => {
    await fresh()
    const before = await snapshot(),
      pixels = await canvas.screenshot()
    const connections = await page.evaluate(() =>
      ['detect-contain', 'contain-recover'].map((id) => window.univerAPI.getActiveBoard().getConnectorConnection(id)),
    )
    await nativeDrag('detect', 45, 25)
    const after = await snapshot()
    assert.notDeepEqual(await canvas.screenshot(), pixels)
    assert.deepEqual(
      await page.evaluate(() =>
        ['detect-contain', 'contain-recover'].map((id) => window.univerAPI.getActiveBoard().getConnectorConnection(id)),
      ),
      connections,
    )
    await history('native-pointer', before, after)
    await capture('native-moved')
  })
  await gate('native-resize-handle-and-full-history', async () => {
    await fresh()
    const before = await snapshot()
    const center = await point('risk-note')
    const a = await point('detect'),
      b = await point('contain')
    const scale = (b.x - a.x) / 280
    await page.mouse.click(center.x, center.y)
    await settle()
    await page.mouse.move(center.x + 180 * scale, center.y)
    await page.mouse.down()
    await page.mouse.move(center.x + 245 * scale, center.y, { steps: 8 })
    await page.mouse.up()
    await page.waitForFunction(() => window.univerAPI.getActiveBoard().getElementBounds('risk-note').width > 360)
    const resized = await snapshot()
    await capture('native-resized')
    await history('native-resize', before, resized)
  })
  await gate('native-card-text-replacement-and-full-history', async () => {
    await fresh()
    const before = await snapshot()
    await nativeText('risk-note', 'NATIVE FOLLOW-UP\n214 attempts under review\nFinance owner confirmed')
    const after = await snapshot()
    await history('native-text', before, after)
    await capture('native-text-committed')
  })
  await gate(
    'same-id-complete-owner-recovery-and-fresh-native-edit',
    async () => {
      await fresh()
      await nativeDrag('detect', 35, 20)
      await run(examples[3])
      await paint('193 cleared')
      const before = await snapshot()
      await page.evaluate(() => {
        window.oldAPI = window.univerAPI
        window.oldRoot = document.querySelector('.incident-board')
      })
      await run(restore)
      await ready()
      await paint('193 cleared')
      assert(await page.evaluate(() => window.oldAPI !== window.univerAPI && !window.oldRoot.isConnected))
      const after = await snapshot()
      await exact('complete-owner-restore', before, after)
      assert.equal(await page.evaluate(() => window.univerAPI.getActiveBoard().undo()), false)
      await exact('restored-empty-history', after, await snapshot())
      await capture('restored')
      await nativeDrag('recover', -30, 20)
      const edited = await snapshot()
      await history('fresh-owner-pointer', after, edited)
      await capture('fresh-native-edited')
    },
    true,
  )
  await gate(
    'seven-complete-locales-css-and-same-owner-theme',
    async () => {
      await fresh()
      await run(examples[3])
      await paint('193 cleared')
      const before = await snapshot()
      await page.evaluate(() => (window.ownerAPI = window.univerAPI))
      const src = (await readShowcaseSources()).find((s) => s.slug === report.slug),
        factory = src.files['/src/create-demo.ts']
      assert.equal(Object.keys(src.files).length, 9)
      assert.equal([...factory.matchAll(/import '@[^']+\/lib\/index.css'/g)].length, 7)
      for (const lang of ['en-US', 'zh-CN'])
        assert.equal([...factory.matchAll(new RegExp("from '@[^']+/locale/" + lang + "'", 'g'))].length, 7)
      const names = [
        '@univerjs/design',
        '@univerjs/ui',
        '@univerjs/docs-ui',
        '@univerjs/drawing-ui',
        '@univerjs-pro/boards-ui',
        '@univerjs-pro/shape-editor-ui',
        '@univerjs-pro/ink-ui',
      ]
      const { mergeLocales } = await import('@univerjs/core')
      for (const [lang, locale] of [
        ['en-US', 'enUS'],
        ['zh-CN', 'zhCN'],
      ]) {
        const packs = await Promise.all(names.map(async (n) => (await import(n + '/locale/' + lang)).default))
        await page.evaluate((l) => window.univerAPI.setLocale(l), locale)
        pack(await page.evaluate(() => window.univerAPI.getLocales()), mergeLocales(...packs))
        for (const dark of [true, false]) {
          await page.evaluate((d) => window.univerAPI.toggleDarkMode(d), dark)
          await settle()
          assert(await page.evaluate(() => window.ownerAPI === window.univerAPI))
          await exact('theme-' + locale + '-' + dark, before, await snapshot())
        }
      }
      await capture('zh-edited')
    },
    true,
  )
  await gate(
    'initial-zh-invalid-before-dispose-and-idempotent-lifecycle',
    async () => {
      await fresh()
      await page.evaluate(async () => {
        const api = window.univerAPI,
          saved = api.getActiveBoard().save()
        let rejected = false
        try {
          window.createIncidentResponseDemo(window.container, false, undefined, { ...saved, id: '' })
        } catch {
          rejected = true
        }
        if (!rejected || window.univerAPI !== api) throw Error('Invalid snapshot changed live owner')
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        const pending = window.createIncidentResponseDemo(window.container)
        pending.dispose()
        pending.dispose()
        await pending.ready
        if (window.univerAPI || document.querySelector('.incident-board')) throw Error('Pending owner leaked')
        window.demo = window.createIncidentResponseDemo(window.container)
        await window.demo.ready
      })
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
      await capture('initial-zh')
      await page.evaluate(() => {
        window.demo.dispose()
        window.demo.dispose()
      })
      assert.equal(await root.count(), 0)
    },
    true,
  )
  report.passed =
    Object.values(report.gates).every((g) => g.passed) && !report.errors.length && !report.backendRequests.length
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        ...report,
        checks: report.checks.length,
        knownIssues: report.knownIssues.map((i) => ({ name: i.name, count: i.differences.length })),
      },
      null,
      2,
    ),
  )
  await browser.close()
  if (server) await new Promise((r) => server.httpServer.close(r))
}
if (!report.passed) process.exitCode = 1
