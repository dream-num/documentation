/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheets-exchange-local-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/sheets/univer-pro-import-export/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 8)
const restore = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].at(-1)[1]
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4416'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/sheets/univer-pro-import-export`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY ||
    (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-sheets-exchange-local-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'sheets/univer-pro-import-export')
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
        name: 'sheets-exchange-local-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createImportExportDemo} from '/src/create-demo.ts';import {WORKBOOK_DATA} from '/src/data.ts';window.createImportExportDemo=createImportExportDemo;window.WORKBOOK_DATA=WORKBOOK_DATA;window.container=document.getElementById('app');window.demo=createImportExportDemo(window.container);
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
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true })
page.setDefaultTimeout(15000)
const report = {
  slug: 'sheets/univer-pro-import-export',
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
// Abort unexpected conversion traffic. No file is ever sent to any converter, even on regression.
await page.route('**/*', async (route) => {
  const r = route.request()
  if (
    r.url().includes('/universer-api/') ||
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    (['fetch', 'xhr'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  ) {
    report.backendRequests.push({ url: r.url(), method: r.method(), blocked: true })
    await route.abort()
    return
  }
  await route.continue()
})
await page.addInitScript(() => {
  window.paintedText = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    window.paintedText.push(String(text))
    return Reflect.apply(original, this, [text, ...args])
  }
})
const root = page.locator('.exchange-demo')
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveWorkbook().save())))
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
async function ready() {
  await page.locator('.exchange-demo[data-ready=true]').waitFor()
  await page.waitForFunction(
    () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('F2').getRawValue() > 0,
  )
  await settle()
}
async function fresh() {
  await page.goto(url)
  await ready()
}
async function typed(address, value) {
  const name = root.locator('input.univer-size-full').first()
  await name.fill(address)
  await name.press('Enter')
  await page.keyboard.type(String(value))
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    ({ address: a, value: v }) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getRawValue() === v,
    { address, value },
  )
  await settle()
}
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
    throw Error(name + ': ' + diff.length + ' complete differences')
  }
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
function pack(actual, want, p = '') {
  for (const [k, v] of Object.entries(want)) {
    if (v && typeof v === 'object') pack(actual?.[k], v, p + k + '.')
    else assert.equal(actual?.[k], v, p + k)
  }
}
try {
  await gate('original-office-conversion-requirements', async () => {
    const pkgs = {}
    for (const p of ['@univerjs-pro/exchange-client', '@univerjs-pro/sheets-exchange-client'])
      pkgs[p] = JSON.parse(await fs.readFile('node_modules/' + p + '/package.json', 'utf8')).version
    const transport = await fs.readFile(
      '../univer-pro/packages/exchange-client/src/services/request.service.ts',
      'utf8',
    )
    const exchange = await fs.readFile(
      '../univer-pro/packages/sheets-exchange-client/src/services/sheet-exchange.service.ts',
      'utf8',
    )
    const advanced = await fs.readFile('../univer-pro/examples/src/sheets-advanced/main.ts', 'utf8')
    assert.match(transport, /HTTPService/)
    assert.match(transport, /\.post(?:<[^>]+>)?\(/)
    assert.match(exchange, /importFileToJson/)
    assert.match(exchange, /exportFileBySnapshot/)
    assert.match(advanced, /universer-api\/exchange/)
    await fs.writeFile(
      path.join(directory, 'conversion-boundary.json'),
      JSON.stringify(
        {
          packages: pkgs,
          unavailable: [
            'XLSX import',
            'XLS import',
            'CSV import via Exchange',
            'TSV import via Exchange',
            'XLSX export',
            'active-sheet CSV export',
          ],
          source:
            'SDK upload/import/export/task/signed URL requires HTTP; no conversion was attempted; JSON is not XLSX',
          oldMockTest: 'six bytes beginning PK are not a valid XLSX',
        },
        null,
        2,
      ),
    )
    throw Error(
      'BLOCKED: installed Exchange requires HTTP conversion. Native editing, protocol JSON and JSON downloads are partial evidence, not completion of original Office conversion requirements.',
    )
  })
  await gate('native-workbook-formulas-and-painted-grid', async () => {
    await fresh()
    assert.equal(await root.locator(':scope > button,:scope > input,:scope > pre,[data-action]').count(), 0)
    const data = await snapshot()
    assert.equal(data.id, 'regional-sales-exchange-demo')
    assert.equal(data.sheetOrder.length, 1)
    assert.deepEqual(
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('A2:C6').getValues()),
      [
        ['North', 'Aurora Outfitters', 'Retail'],
        ['West', 'Juniper Labs', 'Technology'],
        ['South', 'Bluebird Foods', 'Hospitality'],
        ['East', 'Atlas Health', 'Healthcare'],
        ['Central', 'Prairie Transit', 'Public sector'],
      ],
    )
    await page.waitForFunction(
      () =>
        window.paintedText.some((t) => t.includes('Aurora')) && window.paintedText.some((t) => t.includes('Prairie')),
    )
    const paint = await root.locator('canvas[id^="univer-sheet-main-canvas"]').evaluate((c) => {
      const ctx = c.getContext('2d'),
        pixels = ctx.getImageData(0, 0, c.width, c.height).data
      let colored = 0
      for (let i = 0; i < pixels.length; i += 4)
        if (pixels[i + 3] > 0 && (pixels[i] < 245 || pixels[i + 1] < 245 || pixels[i + 2] < 245)) colored++
      return { width: c.width, height: c.height, colored }
    })
    assert(paint.colored > 1000)
    await fs.writeFile(path.join(directory, 'paint.json'), JSON.stringify(paint, null, 2))
    await capture('cover')
    await typed('D2', 95)
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('F2').getRawValue() === 95 * 146.2,
    )
    assert.equal(
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('F8').getRawValue()),
      76593.4,
    )
    await capture('native-edited')
  })
  await gate('native-edit-complete-undo-redo', async () => {
    await fresh()
    const before = await snapshot()
    await typed('B2', 'Aurora Native Review')
    const after = await snapshot()
    let failure
    await page.keyboard.press('Control+z')
    await settle()
    try {
      await exact('native-undo', before, await snapshot())
    } catch (e) {
      failure = e
    }
    await page.keyboard.press('Control+y')
    await settle()
    await exact('native-redo', after, await snapshot())
    if (failure) throw failure
  })
  await gate('eight-literal-examples-and-genuine-json-download', async () => {
    await fresh()
    for (const [index, code] of examples.entries()) {
      const pending = index === 5 ? page.waitForEvent('download') : undefined
      await run(code)
      if (index === 1)
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('F2').getRawValue() === 95 * 146.2,
        )
      if (pending) {
        const download = await pending
        assert.equal(download.suggestedFilename(), 'regional-sales.json')
        const json = JSON.parse(await fs.readFile(await download.path(), 'utf8'))
        await exact('download-full-json', await snapshot(), json)
        await download.saveAs(path.join(directory, 'regional-sales.json'))
      }
      report.checks.push({ name: 'literal-' + (index + 1), passed: true })
    }
  })
  await gate('local-protocol-encoding-without-conversion', async () => {
    await fresh()
    const result = await page.evaluate(async () => {
      const api = window.univerAPI,
        original = api.getActiveWorkbook().save()
      const protocol = await api.transformWorkbookDataToSnapshotJsonAsync(original)
      return { original, protocol }
    })
    assert(result.protocol.snapshot.workbook)
    assert.equal(typeof result.protocol.snapshot.workbook.originalMeta, 'string')
    assert(Object.keys(result.protocol.sheetBlocks).length > 0)
    await fs.writeFile(path.join(directory, 'local-protocol.json'), JSON.stringify(result, null, 2))
    await exact('encoding-no-write', result.original, await snapshot())
    assert.equal(report.backendRequests.length, 0)
  })
  await gate(
    'same-id-complete-owner-and-fresh-native-history',
    async () => {
      await fresh()
      await typed('D2', 95)
      await page.waitForFunction(
        () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('F2').getRawValue() === 95 * 146.2,
      )
      const before = await snapshot()
      await page.evaluate(() => (window.oldAPI = window.univerAPI))
      await run(restore)
      await ready()
      assert(await page.evaluate(() => window.oldAPI !== window.univerAPI))
      const after = await snapshot()
      let failure
      try {
        await exact('complete-owner-restore', before, after)
      } catch (e) {
        failure = e
      }
      await capture('restored')
      await typed('B2', 'Restored Regional Review')
      const changed = await snapshot()
      await page.keyboard.press('Control+z')
      await settle()
      try {
        await exact('fresh-owner-undo', after, await snapshot())
      } catch (e) {
        failure = e
      }
      await page.keyboard.press('Control+y')
      await settle()
      await exact('fresh-owner-redo', changed, await snapshot())
      await capture('fresh-native-edited')
      if (failure) throw failure
    },
    true,
  )
  await gate(
    'complete-nine-locales-seven-css-and-same-owner-theme',
    async () => {
      await fresh()
      await typed('B2', 'Locale Proof 北区')
      const before = await snapshot()
      await page.evaluate(() => (window.ownerAPI = window.univerAPI))
      const src = (await readShowcaseSources()).find((s) => s.slug === report.slug),
        factory = src.files['/src/create-demo.ts']
      assert.equal(Object.keys(src.files).length, 11)
      assert.equal([...factory.matchAll(/import '@[^']+\/lib\/index.css'/g)].length, 7)
      assert.equal([...factory.matchAll(/from '@[^']+\/locale\/en-US'/g)].length, 9)
      assert.equal([...factory.matchAll(/from '@[^']+\/locale\/zh-CN'/g)].length, 9)
      const names = [
        '@univerjs/design',
        '@univerjs-pro/exchange-client',
        '@univerjs-pro/sheets-exchange-client',
        '@univerjs/ui',
        '@univerjs/docs-ui',
        '@univerjs/sheets',
        '@univerjs/sheets-ui',
        '@univerjs/sheets-formula-ui',
        '@univerjs/sheets-numfmt-ui',
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
          saved = api.getActiveWorkbook().save()
        let rejected = false
        try {
          window.createImportExportDemo(window.container, false, undefined, { ...saved, id: '' })
        } catch {
          rejected = true
        }
        if (!rejected || window.univerAPI !== api) throw Error('Invalid snapshot changed live owner')
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        const pending = window.createImportExportDemo(window.container)
        pending.dispose()
        pending.dispose()
        await pending.ready
        if (window.univerAPI || document.querySelector('.exchange-demo')) throw Error('Pending owner leaked')
        window.demo = window.createImportExportDemo(window.container)
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
