/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheets-print-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/sheets/print/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 11)
const restore = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)][0][1]
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4416'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/sheets/print`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-sheets-print-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'sheets/print')
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
        name: 'sheets-print-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createPrintDemo} from '/src/create-demo.ts';import {WORKBOOK_DATA} from '/src/data.ts';window.createPrintDemo=createPrintDemo;window.WORKBOOK_DATA=WORKBOOK_DATA;window.container=document.getElementById('app');window.demo=createPrintDemo(window.container);
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
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  timezoneId: 'UTC',
  acceptDownloads: true,
})
page.setDefaultTimeout(15000)
const report = {
  slug: 'sheets/print',
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
    (['xhr', 'fetch'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.framesByCanvas = new Map()
  window.paintPoints = []
  const p = CanvasRenderingContext2D.prototype,
    fill = p.fillText,
    clear = p.clearRect
  p.clearRect = function (...args) {
    window.framesByCanvas.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  p.fillText = function (text, ...args) {
    const texts = window.framesByCanvas.get(this.canvas) || []
    texts.push(String(text))
    window.framesByCanvas.set(this.canvas, texts.slice(-20000))
    if (this.canvas.isConnected) {
      const point = this.getTransform().transformPoint({ x: args[0], y: args[1] }),
        rect = this.canvas.getBoundingClientRect()
      window.paintPoints.push({
        text: String(text),
        x: rect.x + (point.x * rect.width) / this.canvas.width,
        y: rect.y + (point.y * rect.height) / this.canvas.height,
      })
      window.paintPoints = window.paintPoints.slice(-20000)
    }
    return Reflect.apply(fill, this, [text, ...args])
  }
})

const root = page.locator('.print-demo')
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveWorkbook().save())))
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
async function ready() {
  await page.locator('.print-demo[data-ready=true]').waitFor()
  await page.waitForFunction(() =>
    [...window.framesByCanvas.values()].some((t) => t.some((x) => x.includes('Michael Wang'))),
  )
  await settle()
}
async function fresh() {
  await page.goto(url)
  await ready()
}
async function gate(name, fn, standalone = false) {
  if (standalone && !buildStandalone) {
    report.gates[name] = { passed: false, error: 'Requires standalone harness' }
    return
  }
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, error: e.stack || String(e) }
    await capture(name + '-failure').catch(() => {})
  }
  console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
}
function differences(a, b, p = '$', out = []) {
  if (Object.is(a, b)) return out
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
    out.push({ path: p, before: a, after: b })
    return out
  }
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) differences(a[key], b[key], p + '.' + key, out)
  return out
}
async function exact(name, a, b) {
  const diff = differences(a, b)
  await fs.writeFile(
    path.join(directory, name + '.json'),
    JSON.stringify({ before: a, after: b, differences: diff }, null, 2),
  )
  report.checks.push({ name, passed: !diff.length })
  if (diff.length) {
    report.knownIssues.push({ name, differences: diff })
    throw new Error(name + ': ' + diff.length + ' complete snapshot differences')
  }
}
async function edit(value) {
  const name = root.locator('input.univer-size-full').first()
  await name.fill('B2')
  await name.press('Enter')
  await page.keyboard.type(value)
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    (v) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').getValue() === v,
    value,
  )
  await settle()
}
async function cancel() {
  await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
  await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
  await settle()
}
async function waitPreview() {
  await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('canvas')].filter(
        (c) => c.width > 300 && c.height > 300 && c.getBoundingClientRect().width > 50,
      ).length >= 2,
  )
  await settle()
}
function pack(actual, want, p = '') {
  for (const [k, v] of Object.entries(want)) {
    if (v && typeof v === 'object') pack(actual[k], v, p + k + '.')
    else assert.equal(actual?.[k], v, p + k)
  }
}
try {
  await gate('sdk-convenience-open-print', async () => {
    await fresh()
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().openPrintDialog())
    await waitPreview()
    await cancel()
  })
  await gate('native-ribbon-print-paper-and-cancel', async () => {
    await fresh()
    assert.equal(await root.locator('.print-controls,output,[data-action]').count(), 0)
    const native = page.getByText('Print', { exact: true })
    await fs.writeFile(path.join(directory, 'initial-dom.txt'), await page.locator('body').innerText())
    await capture('cover')
    await native.first().click()
    await native.last().click()
    await waitPreview()
    await fs.writeFile(path.join(directory, 'preview-dom.txt'), await page.locator('body').innerText())
    await capture('native-print-default')
    assert.match(await page.locator('body').innerText(), /Total:\s*2\s*pages/)
    const paperCanvases = page.locator('.univer-shadow-lg canvas')
    assert.equal(await paperCanvases.count(), 2)
    for (let index = 0; index < 2; index++) {
      const canvas = paperCanvases.nth(index)
      await canvas.scrollIntoViewIfNeeded()
      await canvas.screenshot({ path: path.join(directory, 'native-page-' + (index + 1) + '.png') })
      // Export the actual SDK canvas too: a viewport screenshot can overlap the sticky dialog header.
      const rendered = await canvas.evaluate((c) => c.toDataURL('image/png'))
      await fs.writeFile(
        path.join(directory, 'native-page-' + (index + 1) + '-render.png'),
        Buffer.from(rendered.split(',')[1], 'base64'),
      )
      const ink = await canvas.evaluate(
        (c) =>
          [...c.getContext('2d').getImageData(0, 0, c.width, 300).data].filter(
            (v, i) => i % 4 !== 3 && v > 0 && v < 240,
          ).length,
      )
      assert(ink > 100, 'Printed page ' + (index + 1) + ' has real glyph pixels')
      report.checks.push({ name: 'native-paper-page-' + (index + 1), passed: true })
    }
    const before = await snapshot()
    await cancel()
    await exact('cancel-preserves-model', before, await snapshot())
  })
  await gate('native-paper-orientation-scale-range-and-margins', async () => {
    await fresh()
    const name = root.locator('input.univer-size-full').first()
    await name.fill('A1:F3')
    await name.press('Enter')
    const menu = page.getByText('Print', { exact: true })
    await menu.first().click()
    await menu.last().click()
    await waitPreview()
    const papers = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('canvas')]
          .filter((c) => !c.id && c.closest('.univer-shadow-lg') && c.width > 300 && c.height > 300)
          .map((c) => ({
            width: c.width,
            height: c.height,
            bounds: { width: c.getBoundingClientRect().width, height: c.getBoundingClientRect().height },
            text: window.framesByCanvas.get(c) || [],
            ink: [...c.getContext('2d').getImageData(0, 0, c.width, Math.min(350, c.height)).data].filter(
              (v, i) => i % 4 !== 3 && v > 0 && v < 240,
            ).length,
          })),
      )
    const baseline = await papers()
    await page.getByText('Landscape', { exact: true }).click()
    await settle()
    await page.getByText('Normal (100%)', { exact: true }).click()
    await page.getByText('Fit to page', { exact: true }).click()
    await page.getByText('Total: 1pages', { exact: true }).waitFor()
    await settle()
    const landscape = await papers()
    await capture('native-landscape-fit')
    await fs.writeFile(
      path.join(directory, 'paper-debug.json'),
      JSON.stringify(
        {
          baseline,
          landscape,
          canvases: await page.locator('canvas').evaluateAll((cs) =>
            cs.map((c) => ({
              id: c.id,
              width: c.width,
              height: c.height,
              parent: c.parentElement.outerHTML.slice(0, 300),
            })),
          ),
        },
        null,
        2,
      ),
    )
    assert(
      landscape.some((p) => p.width > p.height),
      'Actual landscape paper dimensions',
    )
    assert(
      landscape.some((p) => p.ink > 100),
      'Actual printed glyph pixels',
    )
    await page.getByText('A4 (8.27" x 11.69")', { exact: true }).click()
    await page.getByText('Letter (8.5" x 11")', { exact: true }).click()
    await page.getByText('Normal', { exact: true }).click()
    await page.getByText('Narrow', { exact: true }).click()
    await page.getByText('Current sheet', { exact: true }).click()
    await page.getByText('Selected cells', { exact: true }).click()
    // SDK layoutInfos$ debounces native changes by 300ms; wait for the new paper paint, not only the select label.
    await page.waitForFunction(() =>
      [...window.framesByCanvas].some(
        ([c, t]) =>
          c.isConnected &&
          !c.id &&
          c.closest('.univer-shadow-lg') &&
          t.includes('Michael Wang') &&
          !t.includes('Lisa Zhang'),
      ),
    )
    await settle()
    await capture('native-letter-selection')
    const selected = await papers()
    assert(
      selected.some((p) => Math.abs(p.width / p.height - 11 / 8.5) < 0.01),
      'Letter landscape aspect ratio',
    )
    await fs.writeFile(
      path.join(directory, 'native-paper-models.json'),
      JSON.stringify({ baseline, landscape, selected }, null, 2),
    )
    assert(
      selected.some((p) => p.text.some((t) => t.includes('Michael Wang'))),
      'Selected holding is painted on print canvas',
    )
    assert(
      !selected.some((p) => p.text.some((t) => t.includes('Lisa Zhang'))),
      'Unselected holding omitted from print canvas',
    )
    await page.getByText('Selected cells', { exact: true }).click()
    await page.getByText('Workbook', { exact: true }).click()
    await page.waitForFunction(() =>
      [...window.framesByCanvas].some(
        ([c, t]) => c.isConnected && !c.id && c.closest('.univer-shadow-lg') && t.includes('Lisa Zhang'),
      ),
    )
    await settle()
    await capture('native-workbook')
    await cancel()
  })
  await gate('native-input-complete-history', async () => {
    await fresh()
    const before = await snapshot()
    await edit('Portfolio review owner')
    const changed = await snapshot()
    await capture('native-edited')
    await page.keyboard.press('Control+z')
    await settle()
    await exact('native-undo', before, await snapshot())
    await page.keyboard.press('Control+y')
    await settle()
    await exact('native-redo', changed, await snapshot())
  })
  await gate('literal-facade-configuration-and-download', async () => {
    await fresh()
    for (let i = 0; i < examples.length; i++) {
      const download = i === 10 ? page.waitForEvent('download') : null
      await run(examples[i])
      await settle()
      if ([1, 3, 4, 5].includes(i)) {
        await waitPreview()
        await capture('literal-' + (i + 1) + '-preview')
        await cancel()
      }
      if (download) {
        const d = await download
        const output = path.join(directory, 'portfolio.json')
        await d.saveAs(output)
        await exact('download-full-model', await snapshot(), JSON.parse(await fs.readFile(output, 'utf8')))
      }
      report.checks.push({ name: 'literal-' + (i + 1), passed: true })
    }
  })
  await gate(
    'same-id-full-owner-recovery-and-fresh-history',
    async () => {
      await fresh()
      await edit('Checkpoint reviewer')
      const before = await snapshot()
      await run(restore)
      await ready()
      const after = await snapshot()
      await capture('restored')
      // Preserve the full failed checkpoint while still exercising the fresh owner.
      let mismatch
      try {
        await exact('owner-restore', before, after)
      } catch (e) {
        mismatch = e
      }
      await edit('Fresh restored reviewer')
      const edited = await snapshot()
      await page.keyboard.press('Control+z')
      await settle()
      await exact('fresh-owner-undo', after, await snapshot())
      await page.keyboard.press('Control+y')
      await settle()
      await exact('fresh-owner-redo', edited, await snapshot())
      await run(examples[1])
      await waitPreview()
      await capture('restored-print')
      await cancel()
      if (mismatch) throw mismatch
    },
    true,
  )
  await gate('complete-locales-css-same-owner-themes', async () => {
    await fresh()
    await edit('Theme retained')
    const before = await snapshot()
    await page.evaluate(() => (window.ownerAPI = window.univerAPI))
    const source = (await readShowcaseSources()).find((s) => s.slug === report.slug),
      factory = source.files['/src/create-demo.ts']
    assert.equal(Object.keys(source.files).length, 9)
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 3)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((l) => window.univerAPI.setLocale(l), code)
      for (const [, prefix] of packs)
        pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) {
        await page.evaluate((d) => window.univerAPI.toggleDarkMode(d), dark)
        await settle()
        assert(await page.evaluate(() => window.ownerAPI === window.univerAPI))
        await exact('theme-' + code + '-' + dark, before, await snapshot())
      }
    }
    assert.equal([...factory.matchAll(/import '@[^']+\/lib\/index.css'/g)].length, 3)
    await capture('zh-same-owner')
  })
  await gate(
    'initial-zh-invalid-and-idempotent-preready-disposal',
    async () => {
      await page.evaluate(async () => {
        const api = window.univerAPI,
          saved = api.getActiveWorkbook().save()
        let rejected = false
        try {
          window.createPrintDemo(window.container, false, undefined, { ...saved, id: '' })
        } catch {
          rejected = true
        }
        if (!rejected || window.univerAPI !== api) throw Error('Invalid snapshot touched owner')
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        const pending = window.createPrintDemo(window.container)
        pending.dispose()
        pending.dispose()
        await pending.ready
        if (window.univerAPI || document.querySelector('.print-demo')) throw Error('Disposed owner leaked')
        window.demo = window.createPrintDemo(window.container)
        await window.demo.ready
      })
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
      await capture('initial-zh')
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
