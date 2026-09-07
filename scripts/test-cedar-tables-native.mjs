/* eslint-disable no-await-in-loop -- Native edits and unmodified history snapshots are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import {
  SAMPLES,
  COMPARISON,
  COLLECTION,
  NARRATIVE,
  PACKAGING_SVG,
  OWNER_ROW,
} from '../showcase/docs-modern/document-tables/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const manifestPath = 'test-results/cedar-tables-native-export/manifest.json'
if (process.argv.includes('--prepare')) {
  const source = (await readShowcaseSources()).find((s) => s.slug === 'docs-modern/document-tables')
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-cedar-tables-native-'))
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(directory, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  const pkg = JSON.parse(source.files['/package.json']),
    links = []
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const target =
      name === 'vite'
        ? process.env.SHOWCASE_VITE_DIR || path.resolve('node_modules/vite')
        : path.resolve('node_modules', name)
    assert.equal(JSON.parse(await fs.readFile(path.join(target, 'package.json'), 'utf8')).version, version)
    const destination = path.join(directory, 'node_modules', name)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.symlink(target, destination, 'junction')
    links.push({ name, version, target })
  }
  await fs.writeFile(
    path.join(directory, 'harness.html'),
    source.files['/index.html'].replace('/src/index.ts', '/src/harness.ts'),
  )
  await fs.writeFile(
    path.join(directory, 'src/harness.ts'),
    `import {createDemo} from './create-demo';document.documentElement.style.height='100%';document.body.style.cssText='height:100%;margin:0';const container=document.getElementById('app')!;container.style.height='100%';let controller=createDemo(container);window.cedarHarness={get controller(){return controller},create(saved){controller=createDemo(container,false,saved);return controller}};window.addEventListener('pagehide',()=>controller.dispose(),{once:true});`,
  )
  await fs.writeFile(
    path.join(directory, 'vite.config.js'),
    `export default {build:{rollupOptions:{input:['index.html','harness.html']}}}`,
  )
  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.writeFile(
    manifestPath,
    JSON.stringify({ slug: source.slug, directory, links, sourceFiles: Object.keys(source.files).length }, null, 2),
  )
  console.log(directory)
  process.exit(0)
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/cedar-tables-native')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/docs-modern/document-tables'
const harnessUrl = process.env.SHOWCASE_HARNESS_URL || new URL('/harness.html', url).href
const examples = [
  ...(await fs.readFile('showcase/docs-modern/document-tables/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 25)
const browser = await chromium.launch(),
  context = await browser.newContext({ viewport: { width: 1600, height: 1200 } })
await context.addInitScript(() => {
  window.cedarPaint = []
  window.cedarFills = []
  window.cedarStrokes = []
  window.cedarImages = []
  const text = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (value, ...args) {
    if (window.cedarPaint.length < 200000) window.cedarPaint.push(String(value))
    return text.call(this, value, ...args)
  }
  for (const method of ['fill', 'fillRect']) {
    const old = CanvasRenderingContext2D.prototype[method]
    CanvasRenderingContext2D.prototype[method] = function (...args) {
      if (window.cedarFills.length < 200000) window.cedarFills.push(String(this.fillStyle).toLowerCase())
      return old.apply(this, args)
    }
  }
  const stroke = CanvasRenderingContext2D.prototype.stroke
  CanvasRenderingContext2D.prototype.stroke = function (...args) {
    if (window.cedarStrokes.length < 200000)
      window.cedarStrokes.push({ color: String(this.strokeStyle).toLowerCase(), width: this.lineWidth })
    return stroke.apply(this, args)
  }
  const image = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.drawImage = function (...args) {
    const src = args[0]?.src
    if (src && !window.cedarImages.includes(src)) window.cedarImages.push(src)
    return image.apply(this, args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(15000)
const report = { passed: false, url, harnessUrl, gates: {}, errors: [], requests: [], literals: [], geometry: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) || r.url().includes('/universer-api/'))
    report.requests.push(r.url())
})
const root = page.locator('.table-demo'),
  canvas = root.locator('#univer-doc-main-canvas')
const snapshot = () => page.evaluate(() => structuredClone(window.univerAPI.getActiveDocument().save()))
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const run = async (n) => {
  report.literals.push(n)
  return page.evaluate('(async()=>{' + examples[n - 1] + '})()')
}
const ready = async () => {
  await page.locator('.table-demo[data-ready=true]').waitFor()
  await canvas.waitFor()
  await settle()
}
const settledWords = () =>
  page.waitForFunction(() => /(?:[1-9]\d* words|字数\s*[1-9]\d*)/.test(document.body.innerText))
const fresh = async (target = url) => {
  await page.goto(target)
  await ready()
  await settledWords()
  await run(1)
}
const state = (id = 'cedar-decisions') =>
  page.evaluate((tableId) => {
    const api = window.univerAPI,
      doc = api.getActiveDocument(),
      table = doc.getTable(tableId)
    if (!table) return null
    const injector = api._injector,
      key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      ),
      manager = injector.get(key),
      render = manager.getRenderUnitById(doc.getId())
    const skeleton = render.mainComponent._skeleton
    return {
      description: table.describe(),
      source: table.getSource(),
      range: table.getRange(),
      values: Array.from({ length: table.getRowCount() }, (_, r) =>
        Array.from({ length: table.getColumnCount() }, (_cell, c) => table.getCellText(r, c)),
      ),
      layout: skeleton
        ?.getSkeletonData()
        ?.pages.flatMap((p) => Array.from(p.skeTables.values()))
        .filter((t) => t.tableId === tableId)
        .map((t) => ({
          width: t.width,
          height: t.height,
          left: t.left,
          top: t.top,
          rows: t.rows.map((r) => ({
            height: r.height,
            cells: r.cells.map((c) => ({ width: c.pageWidth, height: c.pageHeight })),
          })),
        })),
    }
  }, id)
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await fs.writeFile(
      path.join(directory, name + '-actual.json'),
      JSON.stringify(await snapshot().catch(() => null), null, 2),
    )
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
}
async function history(name, n, check) {
  await gate(name, async () => {
    await fresh()
    const before = await snapshot(),
      comparison = await state('cedar-comparison')
    await page.evaluate(() => {
      window.cedarPaint = []
      window.cedarFills = []
      window.cedarStrokes = []
    })
    await run(n)
    await settle()
    await check()
    assert.deepEqual((await state('cedar-comparison')).values, comparison.values)
    report.gates[name + '-effect'] = { passed: true }
    const edited = await snapshot()
    await run(19)
    await settle()
    assert.deepEqual(await snapshot(), before)
    await run(20)
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
}
function pack(actual, expected, prefix = '') {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual?.[k], v, prefix + k + '.')
    else assert.deepEqual(actual?.[k], v, prefix + k)
  }
}
try {
  if (process.argv[2])
    await gate('normal-export-parity', async () => {
      const m = JSON.parse(await fs.readFile(process.argv[2], 'utf8')),
        s = (await readShowcaseSources()).find((c) => c.slug === m.slug)
      assert.equal(m.slug, 'docs-modern/document-tables')
      for (const [n, c] of Object.entries(s.files))
        assert.equal(await fs.readFile(path.join(m.directory, n.slice(1)), 'utf8'), c, n)
      report.export = m
    })
  await gate('native-business-tables-columns-image-charts', async () => {
    await fresh()
    assert.equal(await root.locator('fieldset,details,output,[data-action]').count(), 0)
    await root.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
    for (const [index, sample] of SAMPLES.entries()) {
      const table = await state(index === 0 ? 'cedar-decisions' : 'cedar-' + sample.id)
      assert.deepEqual(table.values, sample.rows)
      assert.equal(table.description.headerRowCount, 1)
      assert.deepEqual(
        table.layout[0].rows[0].cells.map((c) => c.width),
        [220, 140, 120, 220],
      )
      report.geometry.push(table)
    }
    assert.deepEqual((await state('cedar-comparison')).values, COMPARISON)
    const mixed = await page.evaluate(() => {
      const d = window.univerAPI.getActiveDocument()
      return {
        charts: d.getCharts().map((c) => c.getInfo()),
        columns: d.getColumnGroups().map((c) => c.describe()),
        drawings: d.save().drawings,
      }
    })
    assert.equal(mixed.charts.length, 3)
    for (const sample of SAMPLES)
      assert.ok(mixed.charts.some((c) => JSON.stringify(c.dataSource.values) === JSON.stringify(COLLECTION[sample.id])))
    assert.deepEqual(
      mixed.columns[0].columns.map((c) => c.text),
      NARRATIVE.map((t) => t.replaceAll('\r', '\n')),
    )
    assert.equal(
      Buffer.from(mixed.drawings['cedar-packaging-image'].source.split(',')[1], 'base64').toString(),
      PACKAGING_SVG,
    )
    assert.equal(Object.keys(mixed.drawings).length, 4)
    await page.waitForFunction(() => window.cedarPaint.join('').includes('Cedar'))
    await page.waitForFunction(() => /\b[1-9]\d* words\b/.test(document.body.innerText))
    report.words = await page.evaluate(() => document.body.innerText.match(/\b[1-9]\d* words\b/)[0])
    await page.screenshot({ path: path.join(directory, 'opening-settled.png') })
  })
  await gate('native-scroll-all-business-artwork', async () => {
    await fresh()
    for (let index = 0; index < 9; index++) {
      await page.mouse.move(1100, 950)
      await page.mouse.wheel(0, 700)
      await settle()
      await page.screenshot({ path: path.join(directory, 'document-section-' + index + '.png') })
    }
    await page.waitForFunction(
      () =>
        window.cedarImages.some((s) => s.startsWith('data:image/svg+xml')) &&
        window.cedarImages.some((s) => s.startsWith('data:image/png')),
    )
  })
  await history('literal-cell-text-full-history', 2, async () => {
    assert.equal((await state()).values[1][1], 'Mara Chen — coordinator')
    assert.ok(await page.evaluate(() => window.cedarPaint.join('').includes('coordinator')))
  })
  await history('literal-empty-cell-full-history', 3, async () => assert.equal((await state()).values[1][1], ''))
  await history('literal-owner-row-full-history', 5, async () => {
    assert.deepEqual((await state()).values.at(-1), OWNER_ROW)
    const before = await snapshot()
    await run(5)
    assert.deepEqual(await snapshot(), before)
  })
  await history('literal-delete-body-row-full-history', 6, async () =>
    assert.equal((await state()).description.rowCount, 3),
  )
  await history('literal-column-width-real-layout-history', 7, async () =>
    assert.equal((await state()).layout[0].rows[0].cells[1].width, 180),
  )
  await history('literal-row-height-real-layout-history', 8, async () =>
    assert.ok((await state()).layout[0].rows[1].height >= 72),
  )
  await history('literal-header-real-fill-history', 9, async () =>
    assert.ok(await page.evaluate(() => window.cedarFills.includes('#fef3c7'))),
  )
  await history('literal-equal-columns-real-layout-history', 10, async () => {
    const widths = (await state()).layout[0].rows[0].cells.map((c) => c.width)
    assert.ok(widths.every((w) => Math.abs(w - widths[0]) < 0.01))
  })
  await history('literal-all-border-paint-history', 11, async () =>
    assert.ok(await page.evaluate(() => window.cedarStrokes.some((s) => s.color === '#176b78' && s.width === 2))),
  )
  await history('literal-header-bottom-border-history', 12, async () =>
    assert.ok(await page.evaluate(() => window.cedarStrokes.some((s) => s.color === '#b84e3a' && s.width === 3))),
  )
  await history('literal-append-column-full-history', 13, async () => {
    assert.equal((await state()).description.columnCount, 5)
    assert.equal((await state()).values[1][4], 'Desk meeting')
  })
  await history('literal-delete-column-full-history', 14, async () =>
    assert.equal((await state()).description.columnCount, 3),
  )
  await history('literal-delete-table-full-history', 15, async () => assert.equal(await state(), null))
  await gate('literal-reinsert-and-duplicate-guard', async () => {
    await fresh()
    await run(15)
    await run(16)
    assert.deepEqual((await state()).values, SAMPLES[0].rows)
    const before = await snapshot()
    await run(16)
    assert.deepEqual(await snapshot(), before)
  })
  await gate('literal-queries-and-invalid-no-mutation', async () => {
    await fresh()
    await run(6)
    await run(7)
    await run(8)
    const before = await snapshot()
    const errors = await page.evaluate(() => {
      const failures = []
      for (const fn of [
        () => window.cedarDeleteBodyRow(0),
        () => window.cedarDeleteBodyRow(-1),
        () => window.cedarWidth(1.5, 180),
        () => window.cedarWidth(0, 0),
        () => window.cedarHeight(1, 161),
      ])
        try {
          fn()
        } catch (e) {
          failures.push(e.message)
        }
      return failures
    })
    assert.equal(errors.length, 5)
    await run(17)
    await run(18)
    await run(21)
    await run(22)
    assert.deepEqual(await snapshot(), before)
  })
  await gate('native-cell-keyboard-glyph-and-full-history', async () => {
    await fresh()
    await canvas.click({ position: { x: 720, y: 420 } })
    await run(4)
    const before = await snapshot()
    await page.evaluate(() => (window.cedarPaint = []))
    await page.keyboard.type('Native owner')
    await page.waitForFunction(
      () => window.univerAPI.getActiveDocument().getTable('cedar-decisions').getCellText(1, 1) === 'Native owner',
    )
    await page.waitForTimeout(500)
    await settle()
    assert.ok(await page.evaluate(() => window.cedarPaint.join('').includes('Native')))
    report.gates['native-cell-input-paint'] = { passed: true }
    await page.screenshot({ path: path.join(directory, 'native-input.png') })
    const edited = await snapshot()
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-table-menu-opens', async () => {
    await fresh()
    await canvas.click({ position: { x: 720, y: 420 } })
    await run(4)
    await page.locator('[data-u-command="docs-table.command.set-table-border-width"]').click()
    await page.screenshot({ path: path.join(directory, 'native-table-menu.png') })
    report.menu = await page.locator('[role=menu], [data-u-comp*=menu], [data-u-comp*=popup]').allTextContents()
    assert.ok(
      report.menu.some((t) => /1.*2.*3/s.test(t)),
      'Native table border-width menu must be visible',
    )
    report.gates['native-table-menu-visible'] = { passed: true }
    await page.evaluate(() => (window.cedarStrokes = []))
    await page.getByText('3pt', { exact: true }).click()
    await page.waitForFunction(() => window.cedarStrokes.some((s) => s.width === 3))
  })
  await gate('complete-locales-css-edited-same-owner-theme', async () => {
    await fresh()
    await run(2)
    const before = await snapshot()
    await page.evaluate(() => (window.cedarOwner = window.univerAPI))
    const source = await fs.readFile('showcase/docs-modern/document-tables/code/create-demo.ts', 'utf8')
    assert.equal([...source.matchAll(/^import '@[^']+\/lib\/index.css'/gm)].length, 5)
    for (const [lang, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const [, prefix] of source.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm))
        pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + lang)).default)
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.equal(await page.evaluate(() => window.cedarOwner === window.univerAPI), true)
        assert.deepEqual(await snapshot(), before)
      }
      await page.screenshot({ path: path.join(directory, lang + '.png') })
    }
  })
  await gate('harness-same-id-edited-whole-owner-recovery', async () => {
    await fresh(harnessUrl)
    await run(2)
    const before = await snapshot()
    await page.evaluate(() => {
      const h = window.cedarHarness,
        saved = structuredClone(window.univerAPI.getActiveDocument().save())
      h.controller.dispose()
      h.controller.dispose()
      window.cedarPaint = []
      h.create(saved)
    })
    await ready()
    await page.waitForFunction(() => window.cedarPaint.join('').includes('Cedar'))
    await page.waitForFunction(() => /\b[1-9]\d* words\b/.test(document.body.innerText))
    const titleInk = await canvas.evaluate((element) => {
      const paintContext = element.getContext('2d'),
        ratio = element.width / element.getBoundingClientRect().width
      const pixels = paintContext.getImageData(450 * ratio, 90 * ratio, 500 * ratio, 45 * ratio).data
      let ink = 0
      for (let i = 0; i < pixels.length; i += 4)
        if (pixels[i + 3] > 200 && pixels[i] < 80 && pixels[i + 1] < 80 && pixels[i + 2] < 80) ink++
      return ink
    })
    report.restoredTitleInk = titleInk
    assert.ok(titleInk > 200, 'Restored current native canvas must contain title glyph pixels')
    await page.screenshot({ path: path.join(directory, 'same-id-restored.png') })
    report.gates['same-id-restored-native-paint'] = { passed: true }
    assert.deepEqual(await snapshot(), before)
  })
  await gate('harness-empty-baseline-invalid-disposal', async () => {
    await fresh(harnessUrl)
    const before = await snapshot()
    await run(23)
    const invalid = await page.evaluate(() => {
      try {
        window.cedarHarness.create({ id: '', body: { dataStream: 'bad' } })
        return false
      } catch {
        return true
      }
    })
    assert.equal(invalid, true)
    assert.deepEqual(await snapshot(), before)
    await page.evaluate(() => {
      const h = window.cedarHarness
      h.controller.dispose()
      h.create(window.cedarEmpty)
    })
    await ready()
    assert.equal((await snapshot()).body.dataStream, '\r\n')
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().getTables().length), 0)
    report.gates['empty-and-invalid-no-mutation'] = { passed: true }
    await page.evaluate((saved) => {
      const h = window.cedarHarness
      h.controller.dispose()
      h.create(saved)
    }, before)
    await ready()
    await settledWords()
    const restored = await snapshot()
    await page.evaluate(() => {
      const h = window.cedarHarness
      h.controller.dispose()
      h.create()
      h.controller.dispose()
      h.controller.dispose()
    })
    await settle()
    assert.equal(await root.count(), 0)
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    report.gates['pending-and-double-dispose'] = { passed: true }
    assert.deepEqual(restored, before)
  })
  await gate('literal-column-group-insertion', async () => {
    await fresh()
    await run(24)
    assert.equal(
      await page.evaluate(() => window.cedarDoc().getColumnGroup('cedar-followup-columns').getColumnCount()),
      2,
    )
  })
  await gate('literal-column-text-and-paint', async () => {
    await fresh()
    await run(25)
    assert.equal(
      await page.evaluate(() =>
        window.cedarDoc().getColumnGroup('cedar-packaging-narrative').getColumn('cedar-desk').getText(),
      ),
      'At the desk\nVolunteers compare labels before the Saturday seed swap.',
    )
    await page.mouse.move(1100, 950)
    await page.mouse.wheel(0, 700)
    await page.waitForFunction(() => window.cedarPaint.join('').includes('Saturday'))
    await page.screenshot({ path: path.join(directory, 'native-column-edit.png') })
  })
  await gate('initial-chinese-native-resources', async () => {
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
    const source = await fs.readFile('showcase/docs-modern/document-tables/code/create-demo.ts', 'utf8')
    for (const [, prefix] of source.matchAll(/^import \w+ZhCN from '([^']+)zh-CN'/gm))
      pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + 'zh-CN')).default)
    await page.screenshot({ path: path.join(directory, 'initial-zh.png') })
  })
  await gate('all-25-literals-and-no-runtime-errors', async () => {
    assert.equal(new Set(report.literals).size, 25)
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.requests, [])
  })
  await gate('automatic-hyphenation-column-regression', async () => {
    const regression = await context.newPage(),
      errors = []
    regression.on('pageerror', (e) => errors.push(e.stack || e.message))
    regression.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    try {
      await regression.goto(harnessUrl)
      await regression.locator('.table-demo[data-ready=true]').waitFor()
      await regression.evaluate(() => {
        const h = window.cedarHarness,
          saved = structuredClone(window.univerAPI.getActiveDocument().save())
        saved.documentStyle.autoHyphenation = 1
        h.controller.dispose()
        h.create(saved)
      })
      await regression.waitForFunction(
        () => document.querySelector('.table-demo')?.getAttribute('data-ready') !== 'false',
      )
      await regression.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
      await regression.screenshot({ path: path.join(directory, 'automatic-hyphenation-regression.png') })
      report.hyphenationErrors = errors
      assert.deepEqual(errors, [])
    } finally {
      await regression.close()
    }
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify({ ...report, geometry: report.geometry.length }, null, 2))
if (!report.passed) process.exitCode = 1
