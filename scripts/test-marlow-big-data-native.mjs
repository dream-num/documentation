/* eslint-disable no-await-in-loop -- Native capacity/window/history checks are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { isDeepStrictEqual } from 'node:util'

import { chromium } from 'playwright'

import { createRows, HEADERS } from '../showcase/sheets/big-data/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const slug = 'sheets/big-data',
  manifestPath = 'test-results/marlow-big-data-native-export/manifest.json'
if (process.argv.includes('--prepare')) {
  const source = (await readShowcaseSources()).find((s) => s.slug === slug)
  const previous = await fs
    .readFile(manifestPath, 'utf8')
    .then(JSON.parse)
    .catch(() => null)
  const directory = previous?.directory || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-marlow-native-')))
  for (const [name, code] of Object.entries(source.files)) {
    const target = path.join(directory, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, code)
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
    if (!(await fs.lstat(destination).catch(() => null))) await fs.symlink(target, destination, 'junction')
    links.push({ name, version, target })
  }
  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.writeFile(
    manifestPath,
    JSON.stringify({ slug, directory, links, sourceFiles: Object.keys(source.files).length }, null, 2),
  )
  console.log(directory)
  process.exit(0)
}
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/marlow-big-data-native')
await fs.mkdir(output, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/' + slug
const recipes = [
  ...(await fs.readFile('showcase/sheets/big-data/code/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
const report = { passed: false, url, gates: {}, errors: [], requests: [], literals: [], history: {} }
const browser = await chromium.launch(),
  context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true })
await context.addInitScript(() => {
  window.marlowGlyphs = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (value, ...args) {
    window.marlowGlyphs.push(String(value))
    return fill.call(this, value, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(15000)
let current = 'startup'
page.on('pageerror', (e) => report.errors.push({ gate: current, error: e.stack }))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push({ gate: current, error: m.text() })
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) || r.url().includes('/universer-api/'))
    report.requests.push(r.url())
})
const root = page.locator('.big-data-demo'),
  canvas = page.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
const capture = (n) => page.screenshot({ path: path.join(output, n + '.png'), animations: 'disabled' })
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const ready = async () => {
  await page.locator('.big-data-demo[data-ready=true]').waitFor()
  await page.waitForFunction(() => !document.querySelector('[data-u-comp="workbench-skeleton-content"]'))
  await settle()
}
const fresh = async () => {
  await page.goto(url)
  await ready()
}
const snapshot = () => page.evaluate(() => structuredClone(window.univerAPI.getWorkbook('marlow-million-grid').save()))
const choose = (label, value) => root.getByLabel(label, { exact: true }).selectOption(String(value))
const action = async (name) => {
  await root.locator('[data-action=' + name + ']').click()
  await ready()
  assert.doesNotMatch(await root.getByRole('status').textContent(), /Action rejected/)
}
const run = (n) => {
  report.literals.push(n)
  return page.evaluate('(async()=>{' + recipes[n - 1] + '})()')
}
const rowValues = (row) =>
  page.evaluate(
    (r) =>
      window.univerAPI
        .getWorkbook('marlow-million-grid')
        .getSheetBySheetId('samples')
        .getRange(r, 0, 1, 10)
        .getRawValues()[0],
    row,
  )
const populatedBeyond = (saved, rows) =>
  Object.entries(saved.sheets.samples.cellData)
    .filter(
      ([r, cells]) =>
        Number(r) >= rows && Object.values(cells).some((c) => c?.v != null || c?.f || c?.p || c?.si != null),
    )
    .map(([r]) => Number(r))
const state = () =>
  page.evaluate(() => {
    const sheet = window.univerAPI.getWorkbook('marlow-million-grid').getSheetBySheetId('samples')
    return {
      capacity: sheet.getMaxRows(),
      active: sheet.getActiveRange()?.getA1Notation(),
      visible: sheet.getVisibleRange(),
      last: sheet.getLastRow(),
    }
  })
const nativeCell = async (address, text) => {
  const nameBox = root.locator('.big-data-editor input.univer-size-full').first()
  await nameBox.fill(address)
  await nameBox.press('Enter')
  await page.keyboard.type(text)
  await page.keyboard.press('Enter')
  await settle()
}
async function gate(name, fn) {
  current = name
  try {
    await fn()
    report.gates[name] = { pass: true }
    console.log('PASS', name)
  } catch (e) {
    report.gates[name] = { pass: false, error: e.stack }
    await capture(name + '-failed').catch(() => {})
    await fs.writeFile(
      path.join(output, name + '-actual.json'),
      JSON.stringify(await snapshot().catch(() => null), null, 2),
    )
    console.log('FAIL', name, e.message.slice(0, 260))
  }
}
async function history(name, edit) {
  await gate(name, async () => {
    await fresh()
    const before = await snapshot()
    await edit()
    await settle()
    const edited = await snapshot()
    await canvas.click({ position: { x: 250, y: 80 } })
    await page.keyboard.press('Control+z')
    await settle()
    const undone = await snapshot()
    await page.keyboard.press('Control+y')
    await settle()
    const redone = await snapshot()
    report.history[name] = { undo: isDeepStrictEqual(undone, before), redo: isDeepStrictEqual(redone, edited) }
    await fs.writeFile(
      path.join(output, name + '-history.json'),
      JSON.stringify({ before, edited, undone, redone }, null, 2),
    )
    assert.deepEqual(undone, before)
    assert.deepEqual(redone, edited)
  })
}
try {
  await fresh()
  await gate('original-million-capacity-100-records-native-paint', async () => {
    const saved = await snapshot()
    assert.equal(saved.id, 'marlow-million-grid')
    assert.equal(saved.sheets.samples.rowCount, 1000000)
    assert.equal(Object.keys(saved.sheets.samples.cellData).length, 101)
    assert.deepEqual(await rowValues(0), HEADERS)
    const rows = await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('marlow-million-grid')
        .getSheetBySheetId('samples')
        .getRange(1, 0, 100, 10)
        .getRawValues(),
    )
    assert.deepEqual(
      rows,
      createRows(1, 100).map((row) => row.map((c) => c.v ?? null)),
    )
    await page.waitForFunction(() => window.marlowGlyphs.includes('MR-0000001'))
    assert.equal(await root.locator('pre,details').count(), 0)
    assert.equal(await root.locator('[data-action]').count(), 4)
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await capture('opening-settled')
  })
  await gate('normal-source-one-CSS-full-Core-ENZH', async () => {
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')),
      source = (await readShowcaseSources()).find((s) => s.slug === slug)
    for (const [n, c] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(manifest.directory, n.slice(1)), 'utf8'), c, n)
    report.sourceFiles = Object.keys(source.files).length
    assert.match(source.files['/src/create-demo.ts'], /mergeLocales\(coreEnUS\)/)
    assert.match(source.files['/src/create-demo.ts'], /mergeLocales\(coreZhCN\)/)
    assert.equal([...source.files['/src/create-demo.ts'].matchAll(/import '@[^']+\.css'/g)].length, 1)
  })
  for (const [position, count, start] of [
    ['top', 250, 1],
    ['middle', 1000, 500000],
    ['bottom', 5000, 995000],
  ])
    await gate('native-' + position + '-' + count, async () => {
      await choose('Window position', position)
      await choose('Chunk size', count)
      await page.evaluate(() => {
        window.marlowGlyphs = []
      })
      await action('load')
      assert.deepEqual(
        await rowValues(start),
        createRows(start, 1)[0].map((c) => c.v ?? null),
      )
      assert.deepEqual(
        await rowValues(start + count - 1),
        createRows(start + count - 1, 1)[0].map((c) => c.v ?? null),
      )
      const s = await state()
      assert.equal(s.active, 'A' + (start + 1))
      assert.ok(s.visible.startRow <= start && s.visible.endRow >= start)
      await page.waitForFunction(
        (expected) => window.marlowGlyphs.includes(expected),
        'MR-' + String(start).padStart(7, '0'),
      )
      await capture(position + '-' + count)
    })
  await gate('zero-missing-negative-values', async () => {
    assert.equal((await rowValues(97))[3], 0)
    assert.equal((await rowValues(211))[4], undefined)
    assert.equal((await rowValues(1))[7], -1)
  })
  await gate('same-start-large-small-and-more-than-eight-loads-shrink', async () => {
    await choose('Window position', 'custom')
    await choose('Chunk size', 5000)
    await root.getByLabel('Start row', { exact: true }).fill('9501')
    await action('load')
    await choose('Chunk size', 250)
    await action('load')
    assert.equal((await rowValues(14499))[0], 'MR-0014499')
    for (let i = 0; i < 10; i++) {
      await root.getByLabel('Start row', { exact: true }).fill(String(20001 + i * 1000))
      await action('load')
    }
    await nativeCell('B40001', 'UNTRACKED-NATIVE')
    assert.equal((await rowValues(40000))[1], 'UNTRACKED-NATIVE')
    await choose('Worksheet capacity', 10000)
    await action('capacity')
    const saved = await snapshot()
    assert.equal(saved.sheets.samples.rowCount, 10000)
    assert.deepEqual(populatedBeyond(saved, 10000), [])
    assert.equal((await rowValues(9999))[0], 'MR-0009999')
    assert.equal((await rowValues(0))[0], 'Sample')
    await choose('Worksheet capacity', 100000)
    await action('capacity')
    await choose('Worksheet capacity', 1000000)
    await action('capacity')
    assert.equal((await state()).capacity, 1000000)
    await choose('Worksheet capacity', 10000)
    await action('capacity')
    assert.deepEqual(populatedBeyond(await snapshot(), 10000), [])
  })
  await gate('custom-start-invalid-preserves-model-and-near-end-clamps', async () => {
    await choose('Window position', 'custom')
    const before = await snapshot()
    for (const value of ['', '1', '-5', '1.5', '10001']) {
      await root.getByLabel('Start row', { exact: true }).fill(value)
      await root.locator('[data-action=load]').click()
      await ready()
      assert.match(await root.getByRole('status').textContent(), /Action rejected/)
      assert.deepEqual(await snapshot(), before)
    }
    await root.getByLabel('Start row', { exact: true }).fill('10000')
    await action('jump')
    assert.equal((await state()).active, 'A9751')
    assert.deepEqual(await snapshot(), before)
  })
  await fresh()
  await gate('jump-only-no-population', async () => {
    const before = await snapshot()
    await choose('Window position', 'middle')
    await action('jump')
    assert.equal((await state()).active, 'A500001')
    assert.deepEqual(await snapshot(), before)
  })
  await history('native-keyboard-full-history', async () => {
    await nativeCell('C2', 'NATIVE-BATCH')
    assert.equal((await rowValues(1))[2], 'NATIVE-BATCH')
    await page.waitForFunction(() => window.marlowGlyphs.includes('NATIVE-BATCH'))
  })
  await history('bulk-overwrite-full-history', async () => {
    await choose('Chunk size', 250)
    await action('load')
  })
  await history('native-empty-data-window-full-history', async () => {
    const nameBox = root.locator('.big-data-editor input.univer-size-full').first()
    await nameBox.fill('A2:J101')
    await nameBox.press('Enter')
    await page.keyboard.press('Delete')
    await settle()
    const saved = await snapshot()
    assert.deepEqual(populatedBeyond(saved, 1), [])
    assert.deepEqual(await rowValues(0), HEADERS)
    report.gates['native-empty-data-header-preserved'] = { pass: true }
    await capture('native-empty-window')
  })
  await gate('overlap-reloads-overwrite-native-cell', async () => {
    await fresh()
    await nativeCell('C2', 'EDITED')
    await choose('Chunk size', 250)
    await action('load')
    assert.equal((await rowValues(1))[2], 'B1001')
  })
  await gate('four-literals-real-Facade-effects-and-JSON', async () => {
    await fresh()
    await run(1)
    assert.equal((await state()).capacity, 10000)
    await run(2)
    await settle()
    assert.equal((await rowValues(2000))[0], 'MR-0002000')
    assert.equal((await rowValues(2249))[0], 'MR-0002249')
    const before = await snapshot()
    await run(3)
    await settle()
    assert.equal((await state()).active, 'A5001')
    assert.deepEqual(await snapshot(), before)
    const download = page.waitForEvent('download')
    await run(4)
    const file = await download
    await file.saveAs(path.join(output, 'literal-sparse.json'))
    assert.deepEqual(
      JSON.parse(await fs.readFile(path.join(output, 'literal-sparse.json'), 'utf8')),
      JSON.parse(JSON.stringify(await snapshot())),
    )
  })
  await gate('native-edit-host-JSON-and-same-owner-theme', async () => {
    await fresh()
    await nativeCell('C2', 'JSON-EDIT')
    const before = await snapshot()
    const download = page.waitForEvent('download')
    await action('json')
    await (await download).saveAs(path.join(output, 'host-sparse.json'))
    assert.deepEqual(
      JSON.parse(await fs.readFile(path.join(output, 'host-sparse.json'), 'utf8')),
      JSON.parse(JSON.stringify(before)),
    )
    assert.ok((await fs.stat(path.join(output, 'host-sparse.json'))).size < 500000)
    assert.equal(
      await page.evaluate(() => {
        const old = window.marlowDemo,
          api = window.univerAPI
        old.setDarkMode(true)
        old.setDarkMode(false)
        return old === window.marlowDemo && api === window.univerAPI
      }),
      true,
    )
    assert.deepEqual(await snapshot(), before)
  })
  await gate('native-narrow-760-390-320-content', async () => {
    const before = await snapshot()
    for (const width of [760, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      await choose('Window position', 'top')
      await action('jump')
      assert.ok(await root.evaluate((e) => e.scrollWidth <= e.clientWidth + 1))
      assert.deepEqual(await snapshot(), before)
      await capture('narrow-' + width)
    }
  })
  await gate('initial-Chinese-full-Core-host-labels', async () => {
    await page.setViewportSize({ width: 1440, height: 1100 })
    await page.evaluate(async () => {
      const old = window.marlowDemo
      old.dispose()
      await Promise.resolve()
      document.documentElement.lang = 'zh-CN'
      old.createDemo(old.container)
    })
    await ready()
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
    assert.equal(await root.getByLabel('工作表容量', { exact: true }).count(), 1)
    assert.equal(await root.getByRole('button', { name: '载入窗口', exact: true }).count(), 1)
    await capture('initial-zh')
  })
  await gate('pending-and-double-disposal', async () => {
    await page.evaluate(async () => {
      const old = window.marlowDemo
      window.marlowFactory = old
      old.dispose()
      old.dispose()
      await Promise.resolve()
      const pending = old.createDemo(old.container)
      pending.dispose()
      pending.dispose()
      await Promise.resolve()
    })
    await settle()
    assert.equal(await root.count(), 0)
    assert.equal(await page.evaluate(() => !!window.univerAPI || !!window.marlowDemo), false)
  })
  await gate('dispose-after-real-bulk-command-before-host-promise-settles', async () => {
    await page.evaluate(() => window.marlowFactory.createDemo(window.marlowFactory.container))
    await ready()
    await page.evaluate(() => {
      const c = window.marlowDemo
      c.univerAPI.addEvent(c.univerAPI.Event.CommandExecuted, ({ id }) => {
        if (id !== 'sheet.command.set-range-values') return
        queueMicrotask(() => {
          const book = c.univerAPI.getWorkbook('marlow-million-grid')
          window.marlowDisposedLoad = book.getSheetBySheetId('samples').getRange(1000, 0).getRawValue()
          c.dispose()
          c.dispose()
        })
      })
    })
    await root.locator('[data-action=load]').click()
    await page.waitForFunction(() => !document.querySelector('.big-data-demo'))
    await settle()
    assert.equal(await page.evaluate(() => window.marlowDisposedLoad), 'MR-0001000')
    assert.equal(await page.evaluate(() => !!window.univerAPI || !!window.marlowDemo), false)
  })
  await gate('four-literals-zero-errors-no-backend', async () => {
    assert.deepEqual([...new Set(report.literals)].toSorted(), [1, 2, 3, 4])
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.requests, [])
  })
} finally {
  report.passed = Object.values(report.gates).every((g) => g.pass) && report.errors.length === 0
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
