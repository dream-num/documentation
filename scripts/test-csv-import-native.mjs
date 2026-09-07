/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { parseCsv, MAX_BYTES } from '../showcase/sheets/csv-import-plugin/code/csv-plugin/utils.ts'
import { CSV_SAMPLES } from '../showcase/sheets/csv-import-plugin/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/csv-import-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/sheets/csv-import-plugin/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 13)
const restore = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].at(-1)[1]
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4416'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/sheets/csv-import-plugin`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-csv-import-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'sheets/csv-import-plugin')
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
        name: 'csv-import-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo} from '/src/create-demo.ts';import {CSV_SAMPLES} from '/src/data.ts';import {parseCsv,readCsvFile} from '/src/csv-plugin/utils.ts';window.createDemo=createDemo;window.CSV_SAMPLES=CSV_SAMPLES;window.parseCsv=parseCsv;window.readCsvFile=readCsvFile;window.container=document.getElementById('app');window.demo=createDemo(window.container);
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
  slug: 'sheets/csv-import-plugin',
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
  window.csvLines = []
  const p = CanvasRenderingContext2D.prototype,
    fill = p.fillText,
    clear = p.clearRect
  p.clearRect = function (...args) {
    window.framesByCanvas.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  p.fillText = function (text, ...args) {
    if (String(text).includes('Cable') || String(text).includes('Fuse')) {
      const point = this.getTransform().transformPoint({ x: args[0], y: args[1] })
      window.csvLines.push({ text: String(text), y: point.y, width: this.canvas.width, height: this.canvas.height })
    }
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

const root = page.locator('.csv-demo'),
  source = root.locator('textarea'),
  input = root.locator('input[type=file]')
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveWorkbook().save())))
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
async function ready() {
  await page.locator('.csv-demo[data-ready=true][data-busy=false]').waitFor()
  await page.waitForFunction(
    () => window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('C4').getValue() === 5,
  )
  await settle()
}
async function fresh() {
  await page.goto(url)
  await ready()
}
async function options() {
  if (!(await root.locator('details').evaluate((d) => d.open))) await root.locator('summary').click()
}
async function action(name, rejected = false) {
  await root.locator('[data-action=' + name + ']').click()
  await settle()
  const s = await root.getByRole('status').textContent()
  if (rejected) assert.match(s, /Rejected:/)
  else assert.doesNotMatch(s, /Rejected:/)
}
async function load(id) {
  await options()
  await root.locator('select[aria-label="CSV sample"]').selectOption(id)
  await action('sample')
}
async function selectTarget(address) {
  const name = root.locator('.csv-editor input.univer-size-full').first()
  await name.fill(address)
  await name.press('Enter')
  await settle()
}
async function typed(value, address = 'B4') {
  await selectTarget(address)
  await page.keyboard.type(value)
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    ({ a, v }) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getValue() === v,
    { a: address, v: value },
  )
  await settle()
}
async function checkImport(rows, row = 3, column = 1) {
  const result = await page.evaluate(
    ({ r, c, h, w }) => {
      const range = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(r, c, h, w)
      return { values: range.getRawValues(), cells: range.getCellDataGrid() }
    },
    { r: row, c: column, h: rows.length, w: rows[0].length },
  )
  assert.deepEqual(result.values, rows)
  for (const record of result.cells)
    for (const cell of record) {
      assert.equal(cell.t, 1)
      assert(!cell.f && !cell.si && !cell.p)
    }
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
    if (v && typeof v === 'object') pack(actual[k], v, p + k + '.')
    else assert.equal(actual?.[k], v, p + k)
  }
}
try {
  await gate('native-file-picker-download-import-and-multiline', async () => {
    await fresh()
    assert.equal(await root.locator('pre,[data-action=reset],[data-action=target]').count(), 0)
    assert.equal(await root.locator('details').evaluate((d) => d.open), false)
    const before = await snapshot()
    await capture('cover')
    await options()
    await action('validate')
    await exact('validate-no-write', before, await snapshot())
    const download = page.waitForEvent('download')
    await action('download')
    const d = await download
    assert.equal(await fs.readFile(await d.path(), 'utf8'), CSV_SAMPLES[0].text)
    const chooser = page.waitForEvent('filechooser')
    await root.getByRole('button', { name: 'Open CSV', exact: true }).click()
    await (
      await chooser
    ).setFiles({ name: 'intake.csv', mimeType: 'text/csv', buffer: Buffer.from(CSV_SAMPLES[0].text) })
    await page.locator('.csv-demo[data-busy=false]').waitFor()
    assert.equal(await source.inputValue(), CSV_SAMPLES[0].text.replaceAll('\r\n', '\n'))
    await exact('file-staging-no-write', before, await snapshot())
    await action('import')
    await checkImport(parseCsv(CSV_SAMPLES[0].text.replaceAll('\r\n', '\n')))
    await page.waitForFunction(() => window.csvLines.some((p) => p.text.includes('Fuse pending')))
    const lines = await page.evaluate(() =>
      window.csvLines.filter((p) => p.text.includes('Cable checked') || p.text.includes('Fuse pending')),
    )
    assert(lines.find((p) => p.text.includes('Fuse')).y > lines.find((p) => p.text.includes('Cable')).y)
    await fs.writeFile(path.join(directory, 'multiline-paint.json'), JSON.stringify(lines, null, 2))
    await capture('imported-intake')
    const after = await snapshot()
    assert.deepEqual(after.sheets.reference, before.sheets.reference)
    assert.deepEqual(after.sheets.intake.cellData[3][1].s, before.sheets.intake.cellData[3][1].s)
    for (let r = 0; r < 40; r++)
      for (let c = 0; c < 12; c++)
        if (r < 3 || r >= 8 || c < 1 || c >= 6)
          assert.deepEqual(
            after.sheets.intake.cellData[r]?.[c],
            before.sheets.intake.cellData[r]?.[c],
            'Outside cell ' + r + ',' + c,
          )
  })
  await gate('import-complete-native-history', async () => {
    await fresh()
    const before = await snapshot()
    await action('import')
    const changed = await snapshot()
    await selectTarget('B4')
    await page.keyboard.press('Escape')
    await page.keyboard.press('Control+z')
    await settle()
    let mismatch
    try {
      await exact('import-undo-full', before, await snapshot())
    } catch (e) {
      mismatch = e
    }
    await page.keyboard.press('Control+y')
    await settle()
    await exact('import-redo-full', changed, await snapshot())
    if (mismatch) throw mismatch
  })
  await gate('all-distinct-samples-and-literal-types', async () => {
    for (const id of ['semicolon', 'tab', 'literal', 'ragged']) {
      await fresh()
      await load(id)
      const sample = CSV_SAMPLES.find((s) => s.id === id)
      await action('import')
      await checkImport(parseCsv(sample.text, sample.delimiter))
      await capture('sample-' + id)
      report.checks.push({ name: 'sample-' + id, passed: true })
    }
    await fresh()
    await load('ragged')
    await root.locator('[aria-label="Skip empty lines"]').uncheck()
    await action('import')
    await checkImport(parseCsv(CSV_SAMPLES.find((s) => s.id === 'ragged').text, ',', false))
  })
  await gate('invalid-files-text-cancel-reselection-and-bounds', async () => {
    await fresh()
    const baseline = await snapshot()
    await load('malformed')
    await action('import', true)
    await exact('malformed-no-write', baseline, await snapshot())
    await load('empty')
    assert(await root.locator('[data-action=import]').isDisabled())
    await load('quoted')
    const draft = await source.inputValue()
    for (const [name, buffer] of [
      ['utf16.csv', Buffer.from([255, 254, 65, 0])],
      ['oversize.csv', Buffer.alloc(MAX_BYTES + 1, 65)],
    ]) {
      await input.setInputFiles({ name, mimeType: 'text/csv', buffer })
      await page.locator('.csv-demo[data-busy=false]').waitFor()
      assert.match(await root.getByRole('status').textContent(), /^Rejected:/)
      assert.equal(await source.inputValue(), draft)
      report.checks.push({ name: 'reject-' + name, passed: true })
    }
    await input.dispatchEvent('cancel')
    assert.match(await root.getByRole('status').textContent(), /canceled/)
    assert.equal(await source.inputValue(), draft)
    for (let i = 0; i < 2; i++) {
      await input.setInputFiles({ name: 'repeat.csv', mimeType: 'text/csv', buffer: Buffer.from('A,B\n001,=1+1') })
      await page.locator('.csv-demo[data-busy=false]').waitFor()
      assert.equal(await source.inputValue(), 'A,B\n001,=1+1')
      await source.fill('changed')
    }
    await source.fill(Array(41).fill('x,y').join('\n'))
    await action('import', true)
    await load('quoted')
    await selectTarget('L40')
    await action('import', true)
    await exact('all-rejections-no-write', baseline, await snapshot())
    await selectTarget('D10:E11')
    await action('import')
    await checkImport(parseCsv(CSV_SAMPLES[0].text.replaceAll('\r\n', '\n')), 9, 3)
    assert.equal(
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('A14').getValue()),
      'Keep this footer',
    )
  })
  await gate('native-edit-complete-history', async () => {
    await fresh()
    const before = await snapshot()
    await typed('Updated intake note', 'A2')
    const changed = await snapshot()
    await page.keyboard.press('Control+z')
    await settle()
    let mismatch
    try {
      await exact('edit-undo-full', before, await snapshot())
    } catch (e) {
      mismatch = e
    }
    await page.keyboard.press('Control+y')
    await settle()
    await exact('edit-redo-full', changed, await snapshot())
    if (mismatch) throw mismatch
  })
  await gate(
    'literal-examples-and-json-download',
    async () => {
      await fresh()
      for (let i = 0; i < examples.length; i++) {
        const download = i === 12 ? page.waitForEvent('download') : null
        await run(examples[i])
        await settle()
        if (download) {
          const d = await download
          await d.saveAs(path.join(directory, 'kestrel-workbook.json'))
          await exact(
            'json-download-full',
            await snapshot(),
            JSON.parse(await fs.readFile(path.join(directory, 'kestrel-workbook.json'), 'utf8')),
          )
        }
        report.checks.push({ name: 'literal-' + (i + 1), passed: true })
      }
    },
    true,
  )
  await gate(
    'same-id-full-owner-recovery-and-fresh-edit',
    async () => {
      await fresh()
      await action('import')
      const before = await snapshot()
      await run(restore)
      await page.locator('.csv-demo[data-ready=true]').waitFor()
      await settle()
      const after = await snapshot()
      let mismatch
      try {
        await exact('complete-owner-restore', before, after)
      } catch (e) {
        mismatch = e
      }
      await capture('restored')
      await typed('Restored owner edit', 'A2')
      const changed = await snapshot()
      await page.keyboard.press('Control+z')
      await settle()
      try {
        await exact('fresh-owner-undo', after, await snapshot())
      } catch (e) {
        mismatch = e
      }
      await page.keyboard.press('Control+y')
      await settle()
      await exact('fresh-owner-redo', changed, await snapshot())
      if (mismatch) throw mismatch
    },
    true,
  )
  await gate(
    'complete-locales-css-same-owner-theme-and-draft',
    async () => {
      await fresh()
      await action('import')
      await options()
      await source.fill('Uncommitted,草稿\n001,=2+3')
      const before = await snapshot()
      await page.evaluate(() => (window.ownerAPI = window.univerAPI))
      const sourceFiles = (await readShowcaseSources()).find((s) => s.slug === report.slug),
        factory = sourceFiles.files['/src/create-demo.ts']
      assert.equal(Object.keys(sourceFiles.files).length, 10)
      assert.equal([...factory.matchAll(/import '@[^']+\/lib\/index.css'/g)].length, 1)
      for (const [l, code] of [
        ['en-US', 'enUS'],
        ['zh-CN', 'zhCN'],
      ]) {
        await page.evaluate((localeCode) => window.univerAPI.setLocale(localeCode), code)
        pack(
          await page.evaluate(() => window.univerAPI.getLocales()),
          (await import('@univerjs/preset-sheets-core/locales/' + l)).default,
        )
        for (const dark of [true, false]) {
          await page.evaluate((d) => window.demo.setDarkMode(d), dark)
          await settle()
          assert(await page.evaluate(() => window.ownerAPI === window.univerAPI))
          assert.equal(await source.inputValue(), 'Uncommitted,草稿\n001,=2+3')
          await exact('theme-' + code + '-' + dark, before, await snapshot())
        }
      }
      await capture('zh-edited-draft')
    },
    true,
  )
  await gate(
    'initial-zh-preready-and-invalid-disposal',
    async () => {
      await fresh()
      await page.evaluate(async () => {
        const api = window.univerAPI,
          saved = api.getActiveWorkbook().save()
        let rejected = false
        try {
          window.createDemo(window.container, false, undefined, { ...saved, id: '' })
        } catch {
          rejected = true
        }
        if (!rejected || window.univerAPI !== api) throw Error('Invalid snapshot changed owner')
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        const pending = window.createDemo(window.container)
        pending.dispose()
        pending.dispose()
        await pending.ready
        if (window.univerAPI || document.querySelector('.csv-demo')) throw Error('Pending owner leaked')
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
      await root.getByRole('button', { name: '导入到选区', exact: true }).click()
      await checkImport(parseCsv(CSV_SAMPLES[0].text.replaceAll('\r\n', '\n')))
      await capture('initial-zh-import')
    },
    true,
  )
  await gate('narrow-native-keyboard-import', async () => {
    for (const width of [760, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      await fresh()
      await options()
      const chooser = page.waitForEvent('filechooser')
      await input.click()
      await (
        await chooser
      ).setFiles({ name: 'intake.csv', mimeType: 'text/csv', buffer: Buffer.from(CSV_SAMPLES[0].text) })
      await page.locator('.csv-demo[data-busy=false]').waitFor()
      await root.locator('[data-action=import]').focus()
      await page.keyboard.press('Enter')
      await checkImport(parseCsv(CSV_SAMPLES[0].text.replaceAll('\r\n', '\n')))
      assert((await root.locator('canvas[id^="univer-sheet-main-canvas"]').boundingBox()).y < 450)
      await capture('width-' + width)
    }
  })
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
