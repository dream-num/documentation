/* eslint-disable no-await-in-loop -- Native keyboard, focus and history checks must run in user order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { WORKBOOK_DATA } from '../showcase/sheets/custom-shortcuts/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'
const manifestPath = 'test-results/swift-shortcuts-native-export/manifest.json'
if (process.argv.includes('--prepare')) {
  const source = (await readShowcaseSources()).find((s) => s.slug === 'sheets/custom-shortcuts')
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-swift-shortcuts-native-'))
  for (const [n, c] of Object.entries(source.files)) {
    const target = path.join(directory, n.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, c)
  }
  const pkg = JSON.parse(source.files['/package.json']),
    links = []
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const target =
      name === 'vite'
        ? 'C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
        : path.resolve('node_modules', name)
    assert.equal(JSON.parse(await fs.readFile(path.join(target, 'package.json'), 'utf8')).version, version)
    const destination = path.join(directory, 'node_modules', name)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.symlink(target, destination, 'junction')
    links.push({ name, version, target })
  }
  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.writeFile(
    manifestPath,
    JSON.stringify({ slug: source.slug, directory, links, sourceFiles: Object.keys(source.files).length }, null, 2),
  )
  console.log(directory)
  process.exit(0)
}

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/swift-shortcuts-native')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/sheets/custom-shortcuts'
const examples = [
  ...(await fs.readFile('showcase/sheets/custom-shortcuts/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 13)
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
await context.addInitScript(() => {
  window.swiftGlyphs = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (value, ...args) {
    window.swiftGlyphs.push(String(value))
    return fill.call(this, value, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(15000)
const report = { passed: false, url, gates: {}, errors: [], requests: [], literals: [], history: {} }
let currentGate = 'startup'
page.on('pageerror', (e) => report.errors.push({ gate: currentGate, error: e.stack }))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push({ gate: currentGate, error: m.text() })
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) || r.url().includes('/universer-api/'))
    report.requests.push(r.url())
})
const root = page.locator('.custom-shortcuts-demo')
const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
const snapshot = () => page.evaluate(() => structuredClone(window.univerAPI.getActiveWorkbook().save()))
const read = () =>
  page.evaluate(() => {
    const s = window.univerAPI.getActiveWorkbook().getActiveSheet(),
      r = s.getRange('A1:H5')
    return {
      selected: s.getActiveRange()?.getA1Notation(),
      values: r.getRawValues(),
      formulas: r.getFormulas(),
      backgrounds: r.getBackgrounds(),
      commands: window.swiftCommands,
    }
  })
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const waitCost = (n) =>
  page.waitForFunction(
    (v) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('E3').getRawValues()[0][0] === v,
    n,
  )
const ready = async () => {
  await root.locator('[data-u-comp="workbench-layout"]').waitFor()
  await page.locator('.custom-shortcuts-demo[data-ready=true]').waitFor()
  await grid.waitFor()
  await settle()
}
const run = async (n) => {
  report.literals.push(n)
  return page.evaluate('(async()=>{' + examples[n - 1] + '})()')
}
const capture = async (name) => page.screenshot({ path: path.join(directory, name + '.png'), animations: 'disabled' })
const fresh = async () => {
  await page.goto(url)
  await ready()
  await waitCost(252)
  await page.evaluate(() => {
    window.swiftCommands = []
    window.univerAPI.addEvent(window.univerAPI.Event.CommandExecuted, (e) => window.swiftCommands.push(e.id))
  })
  await run(1)
}
const count = async () =>
  ((await read()).commands || []).filter((id) => id === 'sheet.command.swift-clear-selection').length
const c3 = { x: 390, y: 80 }
const selectRow = async () => {
  await grid.click({ position: c3 })
  assert.equal((await read()).selected, 'C3')
}
const cleared = () =>
  page.waitForFunction(() =>
    window.univerAPI
      .getActiveWorkbook()
      .getActiveSheet()
      .getRange('A3:H3')
      .getRawValues()[0]
      .every((v) => v === undefined),
  )
async function gate(name, fn) {
  currentGate = name
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await capture(name + '-failure').catch(() => {})
    await fs.writeFile(
      path.join(directory, name + '-actual.json'),
      JSON.stringify(await snapshot().catch(() => null), null, 2),
    )
  }
}
async function history(before, edited, native = true) {
  if (native) await page.keyboard.press('Control+z')
  else await run(6)
  await settle()
  let undoFailure, redoFailure
  try {
    assert.deepEqual(await snapshot(), before)
  } catch (e) {
    undoFailure = e
  }
  if (native) await page.keyboard.press('Control+y')
  else await run(7)
  await settle()
  try {
    assert.deepEqual(await snapshot(), edited)
  } catch (e) {
    redoFailure = e
  }
  report.history[currentGate] = {
    undoExact: !undoFailure,
    redoExact: !redoFailure,
    undoFailure: undoFailure?.stack,
    redoFailure: redoFailure?.stack,
  }
  if (undoFailure || redoFailure) throw undoFailure || redoFailure
}
function pack(actual, expected) {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual?.[k], v)
    else assert.deepEqual(actual?.[k], v, k)
  }
}
const pixels = () =>
  grid.evaluate((c) => {
    const k = c.width / c.clientWidth,
      p = c.getContext('2d').getImageData(340 * k, 70 * k, 110 * k, 19 * k).data
    return Array.from(p)
  })
try {
  await gate('normal-export-source-parity', async () => {
    const m = JSON.parse(await fs.readFile(manifestPath, 'utf8')),
      s = (await readShowcaseSources()).find((v) => v.slug === m.slug)
    for (const [n, c] of Object.entries(s.files))
      assert.equal(await fs.readFile(path.join(m.directory, n.slice(1)), 'utf8'), c, n)
    report.export = m
  })
  await gate('original-minimal-data-native-ui-and-pixels', async () => {
    await fresh()
    const s = await snapshot(),
      r = await read()
    assert.equal(s.id, WORKBOOK_DATA.id)
    assert.deepEqual(s.sheetOrder, WORKBOOK_DATA.sheetOrder)
    pack(s.sheets.dispatch.cellData, WORKBOOK_DATA.sheets.dispatch.cellData)
    assert.deepEqual(
      r.values.slice(2).map((v) => v[4]),
      [252, 171, 360],
    )
    await page.waitForFunction(() => window.swiftGlyphs.join('').includes('SW-014'))
    assert.ok(await page.evaluate(() => window.swiftGlyphs.join('').includes('$252.00')))
    assert.equal(await root.locator('fieldset,details,pre,[data-action]').count(), 0)
    assert.equal(await root.getByRole('textbox', { name: 'Host input', exact: true }).count(), 1)
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    assert.ok((await pixels()).some((v) => v !== 255))
    await capture('opening')
  })
  await gate('native-C3-row-clear-empty-noop-complete-history', async () => {
    await fresh()
    await run(2)
    await selectRow()
    const before = await snapshot(),
      r = await read(),
      p = await pixels()
    await page.keyboard.press('Delete')
    await cleared()
    await settle()
    const edited = await snapshot(),
      after = await read()
    assert.equal(await count(), 1)
    assert.deepEqual(after.backgrounds, r.backgrounds)
    assert.deepEqual(edited.styles, before.styles)
    for (const column of ['2', '3', '4'])
      assert.equal(edited.sheets.dispatch.cellData[2][column].s, before.sheets.dispatch.cellData[2][column].s)
    assert.deepEqual(after.values.slice(3), r.values.slice(3))
    assert.ok(after.formulas[2].every((v) => v === ''))
    assert.notDeepEqual(await pixels(), p)
    await capture('row-cleared')
    report.gates['native-row-clear-real-effect'] = { passed: true }
    await page.keyboard.press('Delete')
    await settle()
    assert.match(await root.getByRole('status').textContent(), /already empty/)
    assert.deepEqual(await snapshot(), edited)
    assert.equal(await count(), 2)
    report.gates['empty-shortcut-full-model-noop'] = { passed: true }
    await history(before, edited)
  })
  await gate('native-drag-range-and-complete-history', async () => {
    await fresh()
    await run(3)
    const b = await grid.boundingBox()
    await page.mouse.move(b.x + 220, b.y + 104)
    await page.mouse.down()
    await page.mouse.move(b.x + 390, b.y + 128, { steps: 6 })
    await page.mouse.up()
    assert.equal((await read()).selected, 'B4:C5')
    const before = await snapshot(),
      r = await read()
    await page.keyboard.press('Delete')
    await settle()
    const edited = await snapshot(),
      after = await read()
    assert.deepEqual(after.values[3].slice(1, 3), [undefined, undefined])
    assert.deepEqual(after.values[4].slice(1, 3), [undefined, undefined])
    assert.deepEqual(after.values[2], r.values[2])
    assert.deepEqual(after.formulas, r.formulas)
    assert.deepEqual(after.backgrounds, r.backgrounds)
    assert.deepEqual(edited.styles, before.styles)
    assert.equal(await count(), 1)
    await capture('range-cleared')
    report.gates['native-range-clear-real-effect'] = { passed: true }
    await history(before, edited)
  })
  await gate('host-input-and-active-cell-editing-focus-exclusion', async () => {
    await fresh()
    await selectRow()
    const before = await snapshot(),
      r = await read(),
      input = root.getByRole('textbox', { name: 'Host input', exact: true })
    await input.fill('Keep this text')
    await input.press('Home')
    await input.press('Delete')
    assert.equal(await input.inputValue(), 'eep this text')
    assert.equal(await count(), 0)
    assert.deepEqual(await snapshot(), before)
    await grid.dblclick({ position: c3 })
    await page.keyboard.press('Home')
    await page.keyboard.press('Delete')
    assert.equal(await count(), 0)
    await page.keyboard.press('Escape')
    await settle()
    assert.deepEqual((await read()).values, r.values)
    assert.deepEqual(await snapshot(), before)
    await capture('host-focus')
  })
  await gate('literal-clear-read-native-undo-redo', async () => {
    await fresh()
    await selectRow()
    const before = await snapshot()
    await run(4)
    await settle()
    await run(5)
    const observed = await page.evaluate(() => window.swiftObserved)
    assert.deepEqual(observed.values[1].slice(1, 3), [undefined, undefined])
    await history(before, await snapshot(), false)
  })
  await gate('registration-release-built-in-fallback', async () => {
    await fresh()
    await selectRow()
    await run(8)
    await page.keyboard.press('Delete')
    await settle()
    const r = await read()
    assert.equal(r.values[2][2], undefined)
    assert.equal(r.values[2][0], 'SW-014')
    assert.equal(r.formulas[2][4], '=C3*D3')
    assert.equal(await count(), 0)
    await capture('released-native-delete')
    await run(12)
    await page.keyboard.press('Delete')
    await cleared()
    assert.equal(await count(), 1)
    await run(13)
  })
  await gate('same-id-edited-owner-full-model-and-fresh-shortcut', async () => {
    await fresh()
    await run(11)
    await waitCost(294)
    const before = await snapshot()
    await run(9)
    await ready()
    await waitCost(294)
    let recoveryFailure
    try {
      assert.deepEqual(await snapshot(), before)
    } catch (error) {
      recoveryFailure = error
    }
    await selectRow()
    await page.keyboard.press('Delete')
    await cleared()
    await capture('same-id-fresh-shortcut')
    report.gates['same-id-owner-fresh-native-shortcut'] = { passed: true }
    if (recoveryFailure) throw recoveryFailure
  })
  await gate('baseline-recovery-and-empty-content-reconstruction', async () => {
    await fresh()
    const before = await snapshot()
    await selectRow()
    await page.keyboard.press('Delete')
    await cleared()
    await run(10)
    await ready()
    await waitCost(252)
    let recoveryFailure
    try {
      assert.deepEqual(await snapshot(), before)
    } catch (error) {
      recoveryFailure = error
    }
    await page.evaluate(() => window.swiftSheet().getRange('A1:H30').clearContent())
    await settle()
    const empty = await snapshot()
    await run(9)
    await ready()
    await gate('empty-content-same-id-complete-model', async () => assert.deepEqual(await snapshot(), empty))
    await run(10)
    await ready()
    await waitCost(252)
    try {
      assert.deepEqual(await snapshot(), before)
    } catch (error) {
      recoveryFailure ??= error
    }
    if (recoveryFailure) throw recoveryFailure
  })
  await gate('same-owner-themes-complete-locales-and-official-css', async () => {
    await fresh()
    await run(11)
    await waitCost(294)
    const before = await snapshot()
    await page.evaluate(() => (window.swiftOwner = window.univerAPI))
    const source = await fs.readFile('showcase/sheets/custom-shortcuts/code/create-demo.ts', 'utf8')
    assert.equal([...source.matchAll(/^import '@[^']+\/lib\/index.css'/gm)].length, 1)
    for (const [lang, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      pack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs/preset-sheets-core/locales/' + lang)).default,
      )
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.equal(await page.evaluate(() => window.swiftOwner === window.univerAPI), true)
        assert.deepEqual(await snapshot(), before)
      }
      await capture(lang)
    }
  })
  await gate('initial-chinese-packs-and-host-copy', async () => {
    await page.addInitScript(() => {
      const o = new MutationObserver(() => {
        if (document.documentElement) {
          document.documentElement.lang = 'zh-CN'
          o.disconnect()
        }
      })
      o.observe(document, { childList: true, subtree: true })
    })
    await fresh()
    assert.equal(await root.getByRole('textbox', { name: '宿主输入框', exact: true }).count(), 1)
    pack(
      await page.evaluate(() => window.univerAPI.getLocales()),
      (await import('@univerjs/preset-sheets-core/locales/zh-CN')).default,
    )
    await selectRow()
    await page.keyboard.press('Delete')
    await cleared()
    assert.match(await root.getByRole('status').textContent(), /已清除/)
    await capture('initial-zh')
  })
  await gate('invalid-pending-double-dispose-and-current-owner-pagehide', async () => {
    await fresh()
    const before = await snapshot()
    const bad = await page.evaluate(() => {
      try {
        window.swiftDemo.createDemo(window.swiftDemo.container, false, {
          id: 'bad',
          sheets: {},
          sheetOrder: ['missing'],
        })
        return false
      } catch {
        return true
      }
    })
    assert.equal(bad, true)
    assert.deepEqual(await snapshot(), before)
    await run(9)
    await ready()
    await page.evaluate(() => {
      const d = window.swiftDemo
      d.dispose()
      d.dispose()
      const next = d.createDemo(d.container, false, window.swiftSaved)
      next.dispose()
      next.dispose()
      d.createDemo(d.container, false, window.swiftSaved)
    })
    await ready()
    await waitCost(252)
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    assert.equal(await root.count(), 0)
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('simulated-macos-backspace-native-mapping', async () => {
    const mac = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36',
    })
    try {
      await mac.addInitScript(() => Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' }))
      await mac.goto(url)
      await mac.waitForFunction(
        () => window.univerAPI?.getActiveWorkbook()?.getActiveSheet().getRange('E3').getRawValues()[0][0] === 252,
      )
      await mac.locator('canvas[id^="univer-sheet-main-canvas"]:visible').click({ position: c3 })
      await mac.keyboard.press('Backspace')
      await mac.waitForFunction(() =>
        window.univerAPI
          .getActiveWorkbook()
          .getActiveSheet()
          .getRange('A3:H3')
          .getRawValues()[0]
          .every((v) => v === undefined),
      )
      await mac.screenshot({ path: path.join(directory, 'simulated-mac.png') })
    } finally {
      await mac.close()
    }
  })
  await gate('all-literals-zero-runtime-errors', async () => {
    assert.equal(new Set(report.literals).size, 13)
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.requests, [])
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(
  JSON.stringify(
    {
      passed: Object.values(report.gates).filter((g) => g.passed).length,
      total: Object.keys(report.gates).length,
      failures: Object.entries(report.gates)
        .filter(([, g]) => !g.passed)
        .map(([n, g]) => [n, g.failure.slice(0, 500)]),
    },
    null,
    2,
  ),
)
if (!report.passed) process.exitCode = 1
