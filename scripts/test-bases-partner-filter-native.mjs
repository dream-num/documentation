/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/partner-filter-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/bases/filter-builder/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 12)
const restore = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)][0][1]
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4368'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/bases/filter-builder`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-partner-filter-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'bases/filter-builder')
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
        name: 'partner-filter-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo} from '/src/create-demo.ts';import {DATA} from '/src/data.ts';window.createDemo=createDemo;window.DATA=DATA;window.container=document.getElementById('app');window.demo=createDemo(window.container);
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4368, strictPort: true },
  })
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true })
page.setDefaultTimeout(15000)
const report = {
  slug: 'bases/filter-builder',
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
const root = page.locator('.base-filter')
const panel = page.locator('[data-u-comp="base-filter-panel"]')
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('filter-builder-base').save())))
const projection = () =>
  page.evaluate(() =>
    window.univerAPI
      .getBase('filter-builder-base')
      .getTableById('records')
      .getViewById('working')
      .getProjection()
      .rows.map((r) => r.recordId),
  )
const ready = async () => {
  await page.waitForFunction(
    () =>
      document.querySelector('.base-filter')?.dataset.ready || document.querySelector('.base-filter')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
const paint = async (text) =>
  page.waitForFunction(
    (w) =>
      [...window.framesByCanvas].some(
        ([c, t]) => c.isConnected && c.getBoundingClientRect().width > 300 && t.includes(w),
      ),
    text,
  )
const capture = async (name) => page.screenshot({ path: path.join(directory, name + '.png') })
function differences(a, b, p = '') {
  if (Object.is(a, b)) return []
  if (a && b && typeof a === 'object' && typeof b === 'object')
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((k) => differences(a[k], b[k], p + '.' + k))
  return [{ path: p, before: a === undefined ? { absent: true } : a, after: b === undefined ? { absent: true } : b }]
}
async function exact(name, before, after) {
  const diff = differences(before, after)
  await fs.writeFile(
    path.join(directory, name + '.json'),
    JSON.stringify({ before, after, differences: diff }, null, 2),
  )
  if (diff.length) report.knownIssues.push({ name, differences: diff })
  else report.checks.push({ name, exact: true })
}
async function gate(name, action, standalone = false) {
  if (standalone && !buildStandalone) {
    report.gates[name] = {
      passed: false,
      skipped: true,
      reason: 'Use SHOWCASE_BUILD_STANDALONE=1 for factory reconstruction.',
    }
    return
  }
  const issues = report.knownIssues.length,
    errors = report.errors.length
  try {
    await action()
    report.gates[name] = { passed: issues === report.knownIssues.length && errors === report.errors.length }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await fs.writeFile(
      path.join(directory, name + '-state.json'),
      JSON.stringify(
        {
          snapshot: await snapshot().catch(() => null),
          body: await page
            .locator('body')
            .innerText()
            .catch(() => null),
          panel: await panel.evaluate((element) => element.outerHTML).catch(() => null),
        },
        null,
        2,
      ),
    )
    await capture(name + '-failure').catch(() => {})
  }
  console.log(name + ' ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
async function expectRows(ids) {
  await page.waitForFunction((expected) => {
    const p = window.univerAPI
      .getBase('filter-builder-base')
      .getTableById('records')
      .getViewById('working')
      .getProjection()
    return p.type !== 'invalid' && JSON.stringify(p.rows.map((r) => r.recordId)) === JSON.stringify(expected)
  }, ids)
  assert.deepEqual(await projection(), ids)
  const data = await snapshot()
  assert.equal(Object.keys(data.tables.records.records).length, 10)
  for (const id of ids) await paint(data.tables.records.records[id].values.company)
  await page.waitForFunction(
    ({ expected, records }) => {
      const text = new Set(
        [...window.framesByCanvas]
          .filter(([canvas]) => canvas.isConnected && canvas.getBoundingClientRect().width > 300)
          .flatMap(([, texts]) => texts),
      )
      const visible = Object.entries(records)
        .filter(([, record]) => text.has(record.values.company))
        .map(([id]) => id)
      return JSON.stringify(visible) === JSON.stringify(expected)
    },
    { expected: ids, records: data.tables.records.records },
  )
}
const clear = () =>
  run("window.univerAPI.getBase('filter-builder-base').getTableById('records').getViewById('working').setFilter(null)")
async function openFilter() {
  if (await panel.isVisible()) await closeFilter()
  await root
    .locator('[data-u-comp="base-toolbar"]')
    .getByText(/^(\d+ )?Filter$/)
    .click()
  await panel.waitFor()
}
async function closeFilter() {
  await page.keyboard.press('Escape')
  if (await panel.isVisible()) await page.mouse.click(1100, 850)
  await panel.waitFor({ state: 'hidden' })
}
function includesPack(actual, pack) {
  for (const [k, v] of Object.entries(pack))
    if (v && typeof v === 'object') includesPack(actual?.[k], v)
    else assert.equal(actual?.[k], v, k)
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await paint('Aster Instruments')
  const initial = await snapshot()
  assert.equal(Object.keys(initial.tables.records.records).length, 10)
  assert.equal(
    await root
      .locator('fieldset,output,[data-action],.base-feature-controls,.base-feature-activity,.base-feature-editor')
      .count(),
    0,
  )
  assert.equal(await root.locator('[data-u-comp="base-workbench-layout"]').count(), 1)
  await capture('baseline')
  await gate('literal-facade-variants', async () => {
    const expected = {
      1: ['r01', 'r05', 'r09'],
      2: ['r01', 'r05', 'r06', 'r09'],
      3: ['r02', 'r04', 'r07', 'r10'],
      4: ['r03', 'r06'],
      5: ['r02'],
      6: [],
      7: ['r04', 'r05', 'r10'],
      9: Object.keys(initial.tables.records.records),
    }
    for (const [i, example] of examples.entries()) {
      const before = await snapshot(),
        download = i === 11 ? page.waitForEvent('download') : null
      await run(example)
      if (expected[i]) await expectRows(expected[i])
      if ([0, 8, 10].includes(i)) await exact('literal-' + (i + 1) + '-unchanged', before, await snapshot())
      if (i === 2) assert.equal((await snapshot()).tables.records.records.r06.values.budget, 140000)
      if (download) {
        const d = await download
        assert.equal(d.suggestedFilename(), 'partner-opportunities.base.json')
        const target = path.join(directory, 'downloaded.base.json')
        await d.saveAs(target)
        assert.deepEqual(JSON.parse(await fs.readFile(target, 'utf8')), await snapshot())
      }
      report.checks.push({ literal: i + 1, passed: true })
    }
  })
  await gate('native-text-filter-and-clear', async () => {
    await clear()
    await openFilter()
    await panel.getByRole('button', { name: 'New condition', exact: true }).click()
    await panel.getByText('is', { exact: true }).click()
    await page.getByText('contains', { exact: true }).last().click()
    await panel.getByPlaceholder('Enter here').fill('labs')
    await expectRows(['r02'])
    await closeFilter()
    await capture('native-labs-filter')
    const filtered = await snapshot()
    await openFilter()
    await panel.getByRole('button', { name: 'Delete', exact: true }).click()
    await closeFilter()
    await expectRows(Object.keys(initial.tables.records.records))
    const cleared = await snapshot()
    await root.getByRole('button', { name: 'Undo', exact: true }).click()
    await expectRows(['r02'])
    await exact('native-filter-undo', filtered, await snapshot())
    await root.getByRole('button', { name: 'Redo', exact: true }).click()
    await expectRows(Object.keys(initial.tables.records.records))
    await exact('native-filter-redo', cleared, await snapshot())
  })
  await gate('native-numeric-filter-and-input-history', async () => {
    await clear()
    await openFilter()
    await panel.getByRole('button', { name: 'New condition', exact: true }).click()
    await panel.getByText('Company', { exact: true }).click()
    await page.getByText('Budget', { exact: true }).last().click()
    await panel.getByText('is', { exact: true }).click()
    await page.getByText('greater than', { exact: true }).last().click()
    await panel.locator('input').fill('100000')
    await closeFilter()
    await expectRows(['r01', 'r04', 'r05', 'r06', 'r09', 'r10'])
    await clear()
    await expectRows(Object.keys(initial.tables.records.records))
    const p = await page.evaluate(() => {
      const row = window.paintPoints.findLast((item) => item.text === 'Fjord Robotics')
      return window.paintPoints.findLast((item) => item.text === '140,000.00' && Math.abs(item.y - row.y) < 5)
    })
    assert.ok(p, 'Find the actual Fjord budget canvas cell')
    const before = await snapshot()
    await page.mouse.dblclick(p.x - 20, p.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('175000')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('filter-builder-base')
          .getTableById('records')
          .getRecordById('r06')
          .getValue('budget') === 175000,
    )
    await paint('175,000.00')
    const edited = await snapshot()
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('filter-builder-base')
          .getTableById('records')
          .getRecordById('r06')
          .getValue('budget') === 140000,
    )
    await exact('native-cell-undo', before, await snapshot())
    await page.keyboard.press('Control+y')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('filter-builder-base')
          .getTableById('records')
          .getRecordById('r06')
          .getValue('budget') === 175000,
    )
    await exact('native-cell-redo', edited, await snapshot())
    await capture('native-budget-edited')
  })
  await gate('native-panel-preserves-facade-or-and-threshold', async () => {
    await run(examples[3])
    const before = await snapshot()
    await openFilter()
    await exact('or-open-panel', before, await snapshot())
    await panel.locator('input').fill('210000')
    await capture('native-or-edited-panel')
    await closeFilter()
    const after = await snapshot(),
      f = after.tables.records.views.working.filter
    await fs.writeFile(
      path.join(directory, 'native-or-edit.json'),
      JSON.stringify(
        {
          before: before.tables.records.views.working.filter,
          after: f,
          rows: await projection(),
          snapshotBefore: before,
          snapshotAfter: after,
          differences: differences(before, after),
        },
        null,
        2,
      ),
    )
    if (
      f.conjunction !== before.tables.records.views.working.filter.conjunction ||
      f.conditions[1].operator !== before.tables.records.views.working.filter.conditions[1].operator
    )
      report.knownIssues.push({
        name: 'native-or-threshold-preservation',
        before: before.tables.records.views.working.filter,
        after: f,
      })
  })
  await gate('complete-locales-and-theme', async () => {
    await closeFilter().catch(() => {})
    const factory = await fs.readFile('showcase/bases/filter-builder/code/create-demo.ts', 'utf8'),
      packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 5)
    const before = await snapshot()
    await page.evaluate(() => {
      window.previousAPI = window.univerAPI
    })
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
      assert.equal(await page.evaluate(() => window.previousAPI === window.univerAPI), true)
      await exact(locale + '-theme', before, await snapshot())
      await capture(locale + '-native')
    }
  })
  await gate(
    'exact-edited-reconstruction',
    async () => {
      const before = await snapshot()
      await page.evaluate(() => {
        window.oldAPI = window.univerAPI
        window.oldRoot = document.querySelector('.base-filter')
      })
      await run(restore)
      await ready()
      assert.equal(await page.evaluate(() => window.oldAPI === window.univerAPI || window.oldRoot.isConnected), false)
      assert.equal(await root.count(), 1)
      await exact('edited-roundtrip', before, await snapshot())
      await clear()
      await run(
        "window.univerAPI.getBase('filter-builder-base').getTableById('records').getRecordById('r06').setValue('company','Fjord / restored and live')",
      )
      await paint('Fjord / restored and live')
      await capture('fresh-after-restore')
    },
    true,
  )
  await gate(
    'initial-chinese-and-disposal',
    async () => {
      await page.evaluate(async () => {
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
      await paint('Aster Instruments')
      await capture('initial-chinese')
      await page.evaluate(() => window.demo.dispose())
      await root.waitFor({ state: 'detached' })
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
} catch (e) {
  report.failure = e.stack
  await capture('failure').catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
