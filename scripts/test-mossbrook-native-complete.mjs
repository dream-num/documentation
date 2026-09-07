/* eslint-disable no-await-in-loop -- Canvas geometry, history and extension lifetimes are sequential. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/mossbrook-native-complete')
assert.ok(
  process.env.SHOWCASE_EXPORT_DIRECTORY,
  'Set SHOWCASE_EXPORT_DIRECTORY to a dedicated sheets/custom-canvas export with its exact-version dependencies already available in node_modules. This test uses that export for builds and temporary harness writes.',
)
const project = path.resolve(process.env.SHOWCASE_EXPORT_DIRECTORY)
const reuseBuild = process.env.SHOWCASE_REUSE_EXACT_BUILD === '1'
const report = { passed: false, gates: {}, history: {}, errors: [], requests: [], literals: [] }
let browser, page, server
await fs.mkdir(output, { recursive: true })
async function gate(name, action) {
  try {
    report.gates[name] = { passed: true, result: await action() }
  } catch (error) {
    report.gates[name] = { passed: false, error: error.stack || String(error) }
    await page?.screenshot({ path: path.join(output, `${name}-failure.png`) }).catch(() => {})
  }
  console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
}
function leaves(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') leaves(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
  }
}
try {
  const source = (await readShowcaseSources()).find((item) => item.slug === 'sheets/custom-canvas')
  report.export = { slug: source.slug, directory: project }
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(project, name.slice(1))
    if (reuseBuild) {
      assert.equal(await fs.readFile(target, 'utf8'), content, name)
      continue
    }
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  report.dependencies = {}
  const pkg = JSON.parse(source.files['/package.json'])
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const actual = await fs.realpath(path.join(project, 'node_modules', name))
    assert.equal(JSON.parse(await fs.readFile(path.join(actual, 'package.json'), 'utf8')).version, version)
    report.dependencies[name] = { actual, version }
  }
  await fs.writeFile(path.join(output, 'exports.json'), JSON.stringify([report.export], null, 2))
  const vite = await import(pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js')))
  if (!reuseBuild) await vite.build({ root: project, configFile: false, logLevel: 'warn' })
  const entry = source.files['/src/index.ts']
  await fs.writeFile(
    path.join(project, 'src/index.ts'),
    entry.replace('const demo = createDemo(container)', 'const demo = window.mossController = createDemo(container)') +
      '\nwindow.mossCreate = createDemo\n',
  )
  try {
    if (!reuseBuild)
      await vite.build({
        root: project,
        configFile: false,
        logLevel: 'warn',
        build: { outDir: path.join(output, 'dist'), emptyOutDir: false },
      })
  } finally {
    await fs.writeFile(path.join(project, 'src/index.ts'), entry)
  }
  server = await vite.preview({
    root: project,
    configFile: false,
    build: { outDir: path.join(output, 'dist') },
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  browser = await chromium.launch()
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(10000)
  page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
  })
  page.on('request', (request) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) report.requests.push(request.url())
  })
  await page.addInitScript(() => {
    window.mossPaint = []
    const original = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      window.mossPaint.push(String(text))
      return original.call(this, text, ...args)
    }
  })
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const ready = async () => {
    await page.locator('.seed-canvas-demo[data-ready=true]').waitFor()
    await page.waitForFunction(
      () => !document.querySelector('[data-u-comp="workbench-skeleton-content"]') && window.mossPaint.includes('M-041'),
    )
    await settle()
  }
  const grid = page.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const read = () => page.evaluate(() => window.univerAPI.getWorkbook('mossbrook-seed-bank').save())
  const pixel = (x, y) =>
    grid.evaluate((canvas, [px, py]) => [...canvas.getContext('2d').getImageData(px, py, 1, 1).data], [x, y])
  const paint = () =>
    grid.evaluate((canvas) => {
      const rgba = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
      const colors = {
        teal: [13, 148, 136],
        amber: [217, 119, 6],
        rose: [190, 18, 60],
        invalid: [225, 29, 72],
        violet: [124, 58, 237],
        track: [203, 213, 225],
      }
      const count = Object.fromEntries(Object.keys(colors).map((key) => [key, 0]))
      for (let i = 0; i < rgba.length; i += 4)
        for (const [key, rgb] of Object.entries(colors))
          if (rgb.every((value, channel) => Math.abs(rgba[i + channel] - value) <= 1) && rgba[i + 3] === 255)
            count[key]++
      return count
    })
  const capture = (name) => page.screenshot({ path: path.join(output, `${name}.png`) })
  const apply = async (layers = 'all', style = 'bar') => {
    await page.locator('[data-control=style]').selectOption(style)
    await page.locator('[data-control=layers]').selectOption(layers)
    await page.locator('[data-action=apply]').click()
    await settle()
    assert.equal(await page.locator('.seed-canvas-controls [role=status]').textContent(), '')
  }
  const activate = async (a1) => {
    await page.evaluate(
      (address) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(address).activate(),
      a1,
    )
    await settle()
  }
  const history = async (command) => {
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator(`button[data-u-command="univer.command.${command}"]:visible`).click()
    await settle()
  }
  const input = async (value, x = 390) => {
    await grid.click({ position: { x, y: 150 } })
    await page.keyboard.press('F2')
    await page.keyboard.press('Control+A')
    await page.keyboard.type(value)
    await page.keyboard.press('Enter')
    await settle()
  }
  const reload = async (saved) => {
    await page.evaluate((snapshot) => {
      window.univerAPI.disposeUnit(snapshot.id)
      window.univerAPI.createWorkbook(snapshot)
    }, saved)
    await settle()
    await apply()
    await activate('A1')
  }
  await page.goto('http://127.0.0.1:4412')
  await ready()
  await page.waitForFunction(
    () => typeof window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D29').getValue() === 'number',
  )
  const original = await read()
  await gate('original-24-lots-boundaries-native-text-and-exact-bar-pixels', async () => {
    assert.deepEqual(
      await page.evaluate(() =>
        window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4:C12').getRawValues().flat(),
      ),
      [87, 25, 100, 0, 52.5, undefined, 'pending', -10, 120],
    )
    assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255])
    assert.deepEqual(await pixel(330, 282), [203, 213, 225, 255])
    assert.ok((await paint()).invalid > 20)
    assert.equal(await page.locator('.seed-canvas-controls button').count(), 1)
    assert.equal(await page.locator('.seed-canvas-controls input,.seed-canvas-controls pre').count(), 0)
    await capture('baseline')
    return await paint()
  })
  await page.evaluate(() => {
    window.mossHandles = { live: 0, registered: 0, disposed: 0 }
    for (const method of [
      'registerSheetMainExtension',
      'registerSheetRowHeaderExtension',
      'registerSheetColumnHeaderExtension',
    ]) {
      const register = window.univerAPI[method].bind(window.univerAPI)
      window.univerAPI[method] = (...args) => {
        const handle = register(...args),
          dispose = handle.dispose.bind(handle)
        let released = false
        window.mossHandles.live++
        window.mossHandles.registered++
        handle.dispose = () => {
          if (!released) {
            released = true
            window.mossHandles.live--
            window.mossHandles.disposed++
          }
          return dispose()
        }
        return handle
      }
    }
  })
  await gate('all-layer-combinations-repeated-registration-real-pixels-and-handles', async () => {
    for (const [layers, count] of [
      ['none', 0],
      ['main', 1],
      ['headers', 2],
      ['all', 3],
      ['all', 3],
    ]) {
      await apply(layers)
      const pixels = await paint()
      assert.equal(await page.evaluate(() => window.mossHandles.live), count)
      if (layers === 'none')
        for (const key of ['teal', 'amber', 'rose', 'invalid', 'violet']) assert.equal(pixels[key], 0)
      if (layers === 'main') {
        assert.ok(pixels.teal > 100)
        assert.equal(pixels.violet, 0)
      }
      if (layers === 'headers') {
        assert.equal(pixels.track, 0)
        assert.ok(pixels.violet > 100)
      }
      assert.deepEqual(await read(), original)
    }
    const before = await paint()
    await apply()
    assert.deepEqual(await paint(), before)
    return await page.evaluate(() => window.mossHandles)
  })
  await gate('dots-round-display-only-preserving-whole-model', async () => {
    const before = await paint()
    await apply('all', 'dots')
    const after = await paint()
    assert.ok(after.violet > before.violet)
    assert.ok(after.teal < before.teal)
    assert.deepEqual(await read(), original)
    await capture('dots')
    return { before, after }
  })
  await apply()
  const snippets = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) =>
    stripTypeScriptTypes(m[1]),
  )
  const code = snippets
    .map(
      (snippet, index) =>
        `${snippet}\nawait new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); checkpoints.push({index:${index + 1}, snapshot:structuredClone(workbook.save()), pixel:[...document.querySelector('canvas[id^="univer-sheet-main-canvas"]').getContext('2d').getImageData(330,168,1,1).data]});`,
    )
    .join('\n')
  await gate('six-readme-literals-executed-with-intermediate-model-and-paint', async () => {
    report.literals = await page.evaluate(
      (body) => new Function(`return (async () => {const checkpoints=[];${body};return checkpoints})()`)(),
      code,
    )
    assert.equal(report.literals.length, 6)
    assert.deepEqual(report.literals[0].pixel, [217, 119, 6, 255])
    assert.equal(report.literals[0].snapshot.sheets.lots.cellData[3][2].v, 65)
    assert.equal(report.literals[1].snapshot.sheets.lots.cellData[4][2].v, 'pending')
    assert.equal(report.literals[2].snapshot.sheets.lots.cellData[3][2].v, 87)
    assert.equal(report.literals[4].snapshot.sheets.lots.columnData[2].w, 220)
    assert.equal(report.literals[4].snapshot.sheets.lots.rowData[3].h, 52)
  })
  await reload(original)
  await input('43')
  await activate('A1')
  const afterEdit = await read()
  await gate('native-C4-input-repaints-exact-bar-pixels', async () => {
    assert.equal(afterEdit.sheets.lots.cellData[3][2].v, 43)
    assert.deepEqual(await pixel(330, 168), [217, 119, 6, 255])
    await capture('native-edit')
  })
  await history('undo')
  report.history.keyboard = { before: original, after: afterEdit, undo: await read() }
  await gate('strict-native-input-full-raw-undo', () => assert.deepEqual(report.history.keyboard.undo, original))
  await history('redo')
  report.history.keyboard.redo = await read()
  await gate('strict-native-input-full-raw-redo', () => assert.deepEqual(report.history.keyboard.redo, afterEdit))
  await gate('real-formula-result-and-native-input-repaint', async () => {
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').setValue('=D4/10'))
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').getRawValue() === 64,
    )
    await activate('A1')
    assert.deepEqual(await pixel(330, 168), [217, 119, 6, 255])
    await input('920', 550)
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').getRawValue() === 92,
    )
    await activate('A1')
    assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255])
    assert.equal((await read()).sheets.lots.cellData[3][2].f, '=D4/10')
    await capture('formula-native-repaint')
  })
  await reload(original)
  await gate('resize-geometry-current-pixel-and-two-distinct-native-history-steps', async () => {
    await page.evaluate(() => {
      const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
      sheet.setColumnWidth(2, 220)
      sheet.setRowHeightsForced(3, 24, 52)
    })
    await settle()
    const large = await read()
    assert.deepEqual(await pixel(330, 182), [13, 148, 136, 255])
    await capture('large-geometry')
    await history('undo')
    const one = await read()
    assert.equal(one.sheets.lots.columnData[2].w, 220)
    assert.notEqual(one.sheets.lots.rowData[3]?.h, 52)
    await history('undo')
    const two = await read()
    report.history.geometry = { before: original, after: large, undoFirst: one, undoSecond: two }
    await gate('strict-two-step-geometry-full-raw-undo', () => assert.deepEqual(two, original))
    await history('redo')
    await history('redo')
    report.history.geometry.redo = await read()
    await gate('strict-two-step-geometry-full-raw-redo', () => assert.deepEqual(report.history.geometry.redo, large))
  })
  await reload(original)
  await gate('compact-cell-clipping-follows-real-native-size', async () => {
    await page.evaluate(() => {
      const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
      sheet.setColumnWidth(2, 90)
      sheet.setRowHeightsForced(3, 24, 24)
    })
    await activate('A1')
    assert.deepEqual(await pixel(330, 154), [13, 148, 136, 255])
    assert.deepEqual(await pixel(403, 154), [203, 213, 225, 255])
    await capture('compact-geometry')
  })
  await reload(original)
  await gate('hidden-row-cumulative-bar-geometry-and-hidden-column-removes-track', async () => {
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().hideRows(3, 1))
    await activate('A1')
    assert.deepEqual(await pixel(330, 168), [190, 18, 60, 255])
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().showRows(3, 1))
    await activate('A1')
    assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255])
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().hideColumns(2, 1))
    await activate('A1')
    assert.equal((await paint()).track, 0)
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().showColumns(2, 1))
    await activate('A1')
    assert.ok((await paint()).track > 100)
    await capture('shown-geometry')
  })
  await gate('scrolled-frozen-source-row24-geometry-real-pixels', async () => {
    await page.evaluate(() => {
      const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
      sheet.setFreeze({ startRow: 3, startColumn: 0, ySplit: 3, xSplit: 0 })
      sheet.scrollToCell(23, 0, 0)
    })
    await settle()
    const state = await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getScrollState())
    assert.ok(state.sheetViewStartRow > 0)
    assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255])
    assert.deepEqual(await pixel(450, 168), [203, 213, 225, 255])
    await capture('frozen-scrolled')
    return state
  })
  for (const zoom of [0.75, 1.5])
    await gate(`zoom-${zoom}-native-viewport-retains-real-extension-pixels`, async () => {
      await page.evaluate((value) => window.univerAPI.getActiveWorkbook().getActiveSheet().zoom(value), zoom)
      await settle()
      assert.equal(await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getZoom()), zoom)
      assert.ok((await paint()).track > 50)
      await capture(`zoom-${zoom}`)
    })
  await gate('native-other-sheet-tab-has-no-leaked-overlay', async () => {
    await page.getByText('Reference', { exact: true }).click()
    await settle()
    assert.equal(
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').getValue()),
      87,
    )
    const other = await paint()
    assert.equal(other.violet, 0)
    assert.equal(other.track, 0)
    await capture('reference')
    await page.getByText('Seed lots', { exact: true }).click()
    await settle()
    assert.ok((await paint()).track > 50)
  })
  await reload(original)
  await gate('same-owner-theme-preserves-full-model-and-pixels', async () => {
    const before = await read(),
      beforePaint = await paint()
    await page.evaluate(() => {
      window.mossOwner = window.univerAPI
      window.mossController.setDarkMode(true)
    })
    await settle()
    assert.deepEqual(await read(), before)
    await capture('dark')
    await page.evaluate(() => window.mossController.setDarkMode(false))
    await settle()
    assert.deepEqual(await read(), before)
    assert.deepEqual(await paint(), beforePaint)
    assert.ok(await page.evaluate(() => window.mossOwner === window.univerAPI))
  })
  const saved = await read()
  await reload(saved)
  report.history.unitRecovery = { before: saved, after: await read() }
  await gate('strict-same-id-unit-recovery-explicit-reattachment-and-full-model', async () => {
    assert.deepEqual(report.history.unitRecovery.after, saved)
    assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255])
  })
  await input('55')
  await activate('A1')
  await gate('recreated-unit-fresh-native-input-uses-new-model-not-stale-facade', async () => {
    assert.equal((await read()).sheets.lots.cellData[3][2].v, 55)
    assert.deepEqual(await pixel(330, 168), [217, 119, 6, 255])
  })
  const ownerSaved = await read()
  await page.evaluate((snapshot) => {
    window.mossController.dispose()
    window.mossPaint = []
    window.mossController = window.mossCreate(document.getElementById('app'), false, snapshot)
  }, ownerSaved)
  await ready()
  const ownerAfter = await read()
  report.history.ownerRecovery = { before: ownerSaved, after: ownerAfter }
  await gate('strict-same-id-new-owner-full-model-recovery', () => assert.deepEqual(ownerAfter, ownerSaved))
  await gate('new-owner-default-extensions-and-fresh-native-edit', async () => {
    assert.deepEqual(await pixel(330, 168), [217, 119, 6, 255])
    await input('93')
    await activate('A1')
    assert.equal((await read()).sheets.lots.cellData[3][2].v, 93)
    assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255])
  })
  const restoredEdit = await read()
  await history('undo')
  report.history.restoredInput = { before: ownerAfter, after: restoredEdit, undo: await read() }
  await gate('strict-restored-owner-fresh-edit-full-undo', () =>
    assert.deepEqual(report.history.restoredInput.undo, ownerAfter),
  )
  await history('redo')
  report.history.restoredInput.redo = await read()
  await gate('strict-restored-owner-fresh-edit-full-redo', () =>
    assert.deepEqual(report.history.restoredInput.redo, restoredEdit),
  )
  await gate('empty-percentage-snapshot-native-dashes-and-fresh-edit', async () => {
    const empty = await read()
    for (let row = 3; row <= 26; row++) empty.sheets.lots.cellData[row][2] = {}
    await reload(empty)
    assert.deepEqual(await read(), empty)
    assert.deepEqual(await pixel(330, 168), [100, 116, 139, 255])
    assert.equal((await read()).sheets.lots.cellData[30][0].v, original.sheets.lots.cellData[30][0].v)
    await input('85')
    await activate('A1')
    assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255])
    await capture('empty-fresh-input')
  })
  await gate('invalid-saved-input-rejected-before-mount', async () => {
    const before = await read()
    for (const kind of ['id', 'sheet', 'dimensions', 'cells']) {
      const result = await page.evaluate((invalid) => {
        const api = window.univerAPI,
          snapshot = structuredClone(api.getActiveWorkbook().save())
        if (invalid === 'id') snapshot.id = 'other'
        if (invalid === 'sheet') snapshot.sheetOrder = ['lots']
        if (invalid === 'dimensions') snapshot.sheets.lots.rowCount = 0
        if (invalid === 'cells') snapshot.sheets.lots.cellData = []
        let message = ''
        try {
          window.mossCreate(document.getElementById('app'), false, snapshot)
        } catch (error) {
          message = error.message
        }
        return { message, same: api === window.univerAPI, roots: document.querySelectorAll('.seed-canvas-demo').length }
      }, kind)
      assert.match(result.message, /both original sheet IDs/)
      assert.ok(result.same)
      assert.equal(result.roots, 1)
    }
    assert.deepEqual(await read(), before)
  })
  for (const width of [760, 390, 320])
    await gate(`narrow-${width}-native-C4-scroll-and-extension-controls`, async () => {
      await page.setViewportSize({ width, height: 1000 })
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().scrollToCell(0, 2, 0))
      await activate('A1')
      await apply('main')
      assert.ok((await paint()).track > 50)
      assert.ok(await page.locator('.seed-canvas-demo').evaluate((el) => el.scrollWidth <= el.clientWidth + 1))
      await capture(`narrow-${width}`)
    })
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const locale of ['en-US', 'zh-CN']) {
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue()
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/lang="[^"]*"/, `lang="${locale}"`) })
    })
    await page.reload()
    await ready()
    await gate(`initial-${locale}-complete-core-pack-host-language-and-native-paint`, async () => {
      leaves(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import(`@univerjs/preset-sheets-core/locales/${locale}`)).default,
      )
      await page.getByRole('tab', { name: locale === 'zh-CN' ? '开始' : 'Start', exact: true }).waitFor()
      await page.getByLabel(locale === 'zh-CN' ? '绘制样式' : 'Render style').waitFor()
      await page
        .getByRole('button', { name: locale === 'zh-CN' ? '应用绘制扩展' : 'Apply renderers', exact: true })
        .waitFor()
      assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255])
      await capture(`initial-${locale}`)
    })
    await page.unrouteAll({ behavior: 'wait' })
  }
  await gate('active-double-disposal-clears-native-dom-and-api', async () => {
    await page.evaluate(() => {
      window.mossController.dispose()
      window.mossController.dispose()
    })
    assert.equal(await page.locator('.seed-canvas-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
  })
  await gate('pending-before-steady-double-disposal-no-late-formula-errors', async () => {
    const state = await page.evaluate(() => {
      const pending = window.mossCreate(document.getElementById('app'))
      const stage = pending.univerAPI.getCurrentLifecycleStage(),
        steady = pending.univerAPI.Enum.LifecycleStages.Steady
      pending.dispose()
      pending.dispose()
      return { stage, steady }
    })
    assert.ok(state.stage < state.steady)
    await page.waitForTimeout(3500)
    assert.equal(await page.locator('.seed-canvas-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
    return state
  })
  await gate('disposal-during-native-formula-recalculation-no-late-errors', async () => {
    await page.evaluate(() => {
      window.mossController = window.mossCreate(document.getElementById('app'))
    })
    await ready()
    const errorsBefore = report.errors.length
    await page.evaluate(() => {
      window.mossDuring = { started: false, states: [], disposedBeforeCompletion: false }
      const formula = window.univerAPI.getFormula()
      const end = formula.calculationEnd((state) => window.mossDuring.states.push(state))
      const start = formula.calculationStart(() => {
        window.mossDuring.started = true
        start.dispose()
        queueMicrotask(() => {
          window.mossDuring.disposedBeforeCompletion = !window.mossDuring.states.includes(3)
          end.dispose()
          window.mossController.dispose()
          window.mossController.dispose()
        })
      })
      window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D4').setValue(999)
    })
    await page.waitForFunction(() => window.mossDuring.started)
    await page.waitForTimeout(3500)
    report.history.disposalDuringCalculation = await page.evaluate(() => window.mossDuring)
    assert.ok(report.history.disposalDuringCalculation.disposedBeforeCompletion)
    assert.equal(await page.locator('.seed-canvas-demo,canvas').count(), 0)
    assert.deepEqual(report.errors.slice(errorsBefore), [])
  })
  await new Promise((resolve) => server.httpServer.close(resolve))
  server = await vite.preview({
    root: project,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  await page.goto('http://127.0.0.1:4412')
  await ready()
  await gate('normal-selected-export-exact-source-css-current-paint-and-pagehide', async () => {
    for (const [name, content] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(project, name.slice(1)), 'utf8'), content, name)
    assert.ok(await page.evaluate(() => !window.mossController))
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255])
    await capture('normal-production-cover')
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    assert.equal(await page.locator('.seed-canvas-demo,canvas').count(), 0)
    return { sourceFiles: Object.keys(source.files).length, startupOverlayAbsent: true }
  })
  await gate('no-runtime-errors-or-network-writes', () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.requests, [])
  })
} catch (error) {
  report.fatal = error.stack || String(error)
  await page?.screenshot({ path: path.join(output, 'fatal.png') }).catch(() => {})
} finally {
  await browser?.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
  report.passed = !report.fatal && Object.values(report.gates).every((result) => result.passed)
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        output,
        passed: report.passed,
        gates: Object.fromEntries(Object.entries(report.gates).map(([name, result]) => [name, result.passed])),
        fatal: report.fatal,
      },
      null,
      2,
    ),
  )
}
if (!report.passed) process.exitCode = 1
