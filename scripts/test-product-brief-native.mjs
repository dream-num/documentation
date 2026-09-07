/* eslint-disable no-await-in-loop -- One selected native document, tested in documented edit order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/product-brief-native')
await fs.mkdir(output, { recursive: true })
const report = { passed: false, gates: {}, errors: [], warnings: [], backendRequests: [] }
const PRODUCT_TITLE = 'Atlas Offline Review — Product Brief'
function pack(actual, expected, prefix = '') {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') pack(actual?.[key], value, prefix + key + '.')
    else assert.deepEqual(actual?.[key], value, prefix + key)
  }
}
const source = (await readShowcaseSources()).find((item) => item.slug === 'docs-modern/product-brief')
const examples = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1])
assert.equal(examples.length, 8)
const project = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-product-brief-native-'))
for (const [name, content] of Object.entries(source.files)) {
  const file = path.join(project, name.slice(1))
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, content)
  assert.equal(await fs.readFile(file, 'utf8'), content)
}
const pkg = JSON.parse(source.files['/package.json'])
const vite =
  process.env.SHOWCASE_VITE_PACKAGE || 'C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
report.dependencies = {}
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  const installed = name === 'vite' ? vite : path.resolve('node_modules', name)
  assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version, name)
  const target = path.join(project, 'node_modules', name)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.symlink(await fs.realpath(installed), target, 'junction')
  report.dependencies[name] = version
}
await fs.writeFile(
  path.join(output, 'exports.json'),
  JSON.stringify([{ slug: source.slug, directory: project }], null, 2),
)
const { build, preview } = await import(pathToFileURL(path.join(vite, 'dist/node/index.js')))
let server, browser
try {
  await build({ configFile: false, root: project, logLevel: 'warn' })
  server = await preview({
    configFile: false,
    root: project,
    preview: { host: '127.0.0.1', port: 4398, strictPort: true },
  })
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, colorScheme: 'light' })
  page.setDefaultTimeout(12000)
  page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
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
    window.briefFrames = new Map()
    const fill = CanvasRenderingContext2D.prototype.fillText
    const clear = CanvasRenderingContext2D.prototype.clearRect
    const draw = CanvasRenderingContext2D.prototype.drawImage
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      const texts = window.briefFrames.get(this.canvas) || []
      texts.push(String(args[0]))
      window.briefFrames.set(this.canvas, texts.slice(-50000))
      return Reflect.apply(fill, this, args)
    }
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      window.briefFrames.set(this.canvas, [])
      return Reflect.apply(clear, this, args)
    }
    CanvasRenderingContext2D.prototype.drawImage = function (imageSource, ...args) {
      if (imageSource !== this.canvas)
        window.briefFrames.set(
          this.canvas,
          [...(window.briefFrames.get(this.canvas) || []), ...(window.briefFrames.get(imageSource) || [])].slice(
            -50000,
          ),
        )
      return Reflect.apply(draw, this, [imageSource, ...args])
    }
  })
  const snapshot = () => page.evaluate(() => structuredClone(window.univerAPI.getActiveDocument().save()))
  const settle = () =>
    page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
  const run = (n) => page.evaluate('(async()=>{\n' + examples[n - 1] + '\n})()')
  const canvas = page.locator('#univer-doc-main-canvas')
  async function painted(text) {
    await page.waitForFunction(
      (needle) =>
        (window.briefFrames.get(document.getElementById('univer-doc-main-canvas')) || []).join('').includes(needle),
      text,
    )
  }
  async function fresh() {
    await page.goto('http://127.0.0.1:4398/', { waitUntil: 'load' })
    await page.locator('.product-brief-demo[data-ready=true]').waitFor()
    await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
    await page.locator('[data-u-comp=workbench-skeleton-content]').waitFor({ state: 'detached' })
    await painted('Atlas Offline Review')
    await settle()
  }
  async function reveal(marker) {
    await canvas.click({ position: { x: 500, y: 100 } })
    await page.evaluate((needle) => {
      const doc = window.univerAPI.getActiveDocument()
      const paragraph = doc.getParagraphs().find((p) => p.getText().includes(needle))
      if (!paragraph) throw new Error('Missing paragraph: ' + needle)
      const range = paragraph.getRange()
      doc.setSelection(range.startOffset, range.endOffset)
    }, marker)
    await page.keyboard.press('ArrowRight')
    await settle()
    await painted(marker)
  }
  async function gate(name, check) {
    try {
      await check()
      report.gates[name] = { passed: true }
    } catch (error) {
      report.gates[name] = { passed: false, failure: error.stack }
      await page.screenshot({ path: path.join(output, name + '-failure.png') }).catch(() => {})
    }
  }
  await fresh()
  const baseline = await snapshot()
  await gate('source-parity-and-no-preview-strip', async () => {
    assert.equal(Object.keys(source.files).length, 9)
    const previewCode = await fs.readFile('showcase/docs-modern/product-brief/preview/main.tsx', 'utf8')
    assert.doesNotMatch(previewCode, /<button|<output|resetKey|addDecision/)
    assert.match(previewCode, /toggleDarkMode/)
    assert.match(source.files['/src/create-demo.ts'], /preset-docs-core\/lib\/index.css/)
    assert.equal(await page.getByRole('button', { name: 'Add decision log', exact: true }).count(), 0)
    assert.equal(await page.getByRole('button', { name: 'Reset', exact: true }).count(), 0)
  })
  await gate('baseline-and-literal-1', async () => {
    await run(1)
    const paragraphs = await page.evaluate(() =>
      window.univerAPI
        .getActiveDocument()
        .getParagraphs()
        .map((p) => p.getText()),
    )
    assert.equal(paragraphs.length, 18)
    for (const text of [
      'Problem',
      'Outcome',
      'Success metrics',
      'Launch plan',
      'Open questions',
      'Pilot boundaries',
      'Readiness and owners',
      'Evidence for the next review',
    ])
      assert.ok(
        paragraphs.some((p) => p.trim() === text),
        text,
      )
    assert.match(baseline.body.dataStream, /95% successful offline opens/)
    await page.screenshot({ path: path.join(output, 'baseline.png') })
  })
  await gate('all-eight-sections-painted', async () => {
    for (const heading of [
      'Problem',
      'Outcome',
      'Success metrics',
      'Launch plan',
      'Open questions',
      'Pilot boundaries',
      'Readiness and owners',
      'Evidence for the next review',
    ])
      await reveal(heading)
    await page.screenshot({ path: path.join(output, 'review-evidence.png') })
    assert.deepEqual(await snapshot(), baseline)
  })
  let edited
  await gate('literal-2-current-paint-and-isolation', async () => {
    await run(2)
    edited = await snapshot()
    assert.equal(
      edited.body.dataStream,
      baseline.body.dataStream.replace('six design partners', 'eight design partners'),
    )
    await reveal('Start with eight design partners')
  })
  await gate('literal-3-exact-undo', async () => {
    await run(3)
    await settle()
    assert.deepEqual(await snapshot(), baseline)
  })
  await gate('literal-4-exact-redo', async () => {
    await run(4)
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('literal-5-current-decision-and-idempotency', async () => {
    await run(5)
    await reveal('Decision log')
    await reveal('Approved for design-partner pilot')
    const once = await snapshot()
    assert.match(once.body.dataStream, /250 MB offline workspace limit/)
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().getParagraphs().length), 20)
    await run(5)
    assert.deepEqual(await snapshot(), once)
    await page.screenshot({ path: path.join(output, 'decision.png') })
  })
  await gate('literal-6-independent-owner-edit', async () => {
    const before = await snapshot()
    await run(6)
    assert.equal(
      (await snapshot()).body.dataStream,
      before.body.dataStream.replace('Owner: Maya Chen', 'Owner: Imani Brooks'),
    )
    await reveal('Owner: Imani Brooks')
  })
  await gate('literal-7-real-local-download', async () => {
    const expected = await snapshot()
    const downloading = page.waitForEvent('download')
    await run(7)
    const download = await downloading
    assert.equal(download.suggestedFilename(), 'atlas-product-brief.json')
    const file = path.join(output, 'downloaded-brief.json')
    await download.saveAs(file)
    assert.deepEqual(JSON.parse(await fs.readFile(file, 'utf8')), expected)
  })
  await gate('literal-8-full-reconstruction-and-paint', async () => {
    const before = await snapshot()
    await run(8)
    await settle()
    await reveal('Owner: Imani Brooks')
    assert.deepEqual(await snapshot(), before)
  })
  await fresh()
  await gate('native-title-input-and-current-paint', async () => {
    await reveal('Atlas Offline Review')
    const docBefore = await snapshot()
    await page.keyboard.type(' - Pilot review')
    report.nativeBefore = docBefore
    report.nativeEdited = await snapshot()
    assert.equal(
      report.nativeEdited.body.dataStream,
      docBefore.body.dataStream.replace(PRODUCT_TITLE, PRODUCT_TITLE + ' - Pilot review'),
    )
    // Native hyphenation paints "re-" at the end of the first title line and
    // "view" on the next. Keep exact model text and check that real paint too.
    await page.waitForFunction(() =>
      /Pilot re-?view/.test((window.briefFrames.get(document.getElementById('univer-doc-main-canvas')) || []).join('')),
    )
    await page.screenshot({ path: path.join(output, 'native-edited.png') })
  })
  await gate('native-full-undo', async () => {
    assert.ok(report.nativeEdited, 'Native input must complete first')
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), report.nativeBefore)
  })
  await gate('native-full-redo', async () => {
    assert.ok(report.nativeEdited, 'Native input must complete first')
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), report.nativeEdited)
  })
  await gate('complete-locales-and-edited-owner-themes', async () => {
    const before = await snapshot()
    await page.evaluate(() => {
      window.briefOwner = window.univerAPI
    })
    for (const [locale, native] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((value) => window.univerAPI.setLocale(value), native)
      pack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs/preset-docs-core/locales/' + locale)).default,
      )
      for (const dark of [true, false]) {
        await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
        await settle()
        assert.deepEqual(await snapshot(), before)
        assert.equal(await page.evaluate(() => window.univerAPI === window.briefOwner), true)
      }
      await page.screenshot({ path: path.join(output, locale + '.png') })
    }
  })
  await gate('disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await page.locator('.product-brief-demo').waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    assert.equal(await page.locator('[data-u-comp=workbench-layout]').count(), 0)
  })
  await gate('initial-chinese', async () => {
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        if (document.documentElement) {
          document.documentElement.lang = 'zh-CN'
          observer.disconnect()
        }
      })
      observer.observe(document, { childList: true, subtree: true })
    })
    await fresh()
    pack(
      await page.evaluate(() => window.univerAPI.getLocales()),
      (await import('@univerjs/preset-docs-core/locales/zh-CN')).default,
    )
    await page.screenshot({ path: path.join(output, 'initial-zh.png') })
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  })
  await gate('no-backend-or-browser-errors', async () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.warnings, [])
    assert.deepEqual(report.backendRequests, [])
  })
  report.passed = Object.values(report.gates).every((result) => result.passed)
} catch (error) {
  report.failure = error.stack
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, gates: report.gates, failure: report.failure, output }, null, 2))
  await browser?.close()
  await server?.close()
}
if (!report.passed) process.exitCode = 1
