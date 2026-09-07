/* eslint-disable no-await-in-loop -- Native selections, pixels and complete histories are deliberately sequential. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/crosshair-native-complete')
const project =
  process.env.SHOWCASE_EXPORT_DIRECTORY || 'C:/Users/wbfsa/AppData/Local/Temp/univer-crosshair-native-LVqoeR'
const report = { passed: false, gates: {}, history: {}, literals: [], errors: [], backendRequests: [] }
let browser, server
await fs.mkdir(output, { recursive: true })
async function gate(name, action) {
  try {
    report.gates[name] = { passed: true, result: await action() }
  } catch (error) {
    report.gates[name] = { passed: false, error: error.stack || String(error) }
  }
  console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
}
function leaves(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') leaves(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
  }
}
const overWhite = (rgba) => rgba.slice(0, 3).map((value) => (value * rgba[3]) / 255 + 255 - rgba[3])
try {
  const source = (await readShowcaseSources()).find((item) => item.slug === 'sheets/crosshair-highlighting')
  report.export = { slug: source.slug, directory: project }
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(project, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  const pkg = JSON.parse(source.files['/package.json'])
  report.dependencies = {}
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const actual = await fs.realpath(path.join(project, 'node_modules', name))
    assert.equal(JSON.parse(await fs.readFile(path.join(actual, 'package.json'), 'utf8')).version, version)
    report.dependencies[name] = { version, actual }
  }
  await fs.writeFile(path.join(output, 'exports.json'), JSON.stringify([report.export], null, 2))
  const vite = await import(pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js')))
  await vite.build({ root: project, configFile: false, logLevel: 'warn' })
  const entry = source.files['/src/index.ts']
  await fs.writeFile(
    path.join(project, 'src/index.ts'),
    entry.replace(
      'const demo = createDemo(container)',
      'const demo = window.crosshairController = createDemo(container)',
    ) +
      '\nimport { createFixture } from "./data"\nwindow.crosshairCreate = createDemo\nwindow.crosshairFixture = createFixture\n',
  )
  try {
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
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(10000)
  page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
  })
  page.on('request', (request) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
      (['xhr', 'fetch'].includes(request.resourceType()) &&
        !['127.0.0.1', 'localhost'].includes(new URL(request.url()).hostname))
    )
      report.backendRequests.push(request.url())
  })
  await page.addInitScript(() => {
    window.crosshairPaint = []
    const original = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      window.crosshairPaint.push(String(text))
      return original.call(this, text, ...args)
    }
  })
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const ready = async () => {
    await page.locator('.crosshair-demo[data-ready=true]').waitFor()
    await page.waitForFunction(
      () =>
        !document.querySelector('[data-u-comp="workbench-skeleton-content"]') && window.crosshairPaint.includes('Room'),
    )
    await settle()
  }
  const grid = page.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const read = () => page.evaluate(() => window.univerAPI.getWorkbook('oriole-rehearsals').save())
  const range = () =>
    page.evaluate(() =>
      window.univerAPI
        .getWorkbook('oriole-rehearsals')
        .getActiveSheet()
        .getSelection()
        .getActiveRange()
        .getA1Notation(),
    )
  const activate = async (a1) => {
    await page.evaluate(
      (value) => window.univerAPI.getWorkbook('oriole-rehearsals').getActiveSheet().getRange(value).activate(),
      a1,
    )
    await settle()
  }
  const enabled = () => page.evaluate(() => window.univerAPI.getCrosshairHighlightEnabled())
  const enable = async (value) => {
    await page.evaluate((requested) => window.univerAPI.setCrosshairHighlightEnabled(requested), value)
    await settle()
  }
  const pixel = (x, y) =>
    grid.evaluate(
      (canvas, [sampleX, sampleY]) => {
        const box = canvas.getBoundingClientRect()
        return [
          ...canvas
            .getContext('2d')
            .getImageData(
              Math.floor((sampleX * canvas.width) / box.width),
              Math.floor((sampleY * canvas.height) / box.height),
              1,
              1,
            ).data,
        ]
      },
      [x, y],
    )
  const capture = (name) => page.screenshot({ path: path.join(output, `${name}.png`) })
  const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
  const literal = async (index) => {
    await page.evaluate((code) => new Function(code)(), recipes[index])
    report.literals.push(index + 1)
    await settle()
  }
  const input = async (value) => {
    await grid.click({ position: { x: 390, y: 140 } })
    await page.keyboard.press('F2')
    await page.keyboard.press('Control+A')
    await page.keyboard.type(value)
    await page.keyboard.press('Enter')
    await settle()
  }
  const cell = (a1) =>
    page.evaluate(
      (address) => window.univerAPI.getWorkbook('oriole-rehearsals').getActiveSheet().getRange(address).getValue(),
      a1,
    )
  const history = async (command) => {
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator(`button[data-u-command="univer.command.${command}"]:visible`).click()
    await settle()
  }
  await page.goto('http://127.0.0.1:4412')
  await ready()
  await page.waitForFunction(
    () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('G2').getValue() === 11,
  )
  const original = await read()
  await gate('original-two-small-schedules-formulas-merged-and-native-paint', async () => {
    assert.deepEqual(original.sheetOrder, ['rooms', 'archive'])
    assert.equal(original.sheets.rooms.cellData[3][2].v, 2.5)
    assert.equal(original.sheets.rooms.cellData[3][6].f, '=SUM(B4:F4)')
    assert.equal(original.sheets.archive.cellData[4][0].v, 'Guest room')
    assert.ok(
      await page.evaluate(() =>
        ['Blackbird studio', 'Evening programme', 'Quartet', 'Noé'].every((text) =>
          window.crosshairPaint.includes(text),
        ),
      ),
    )
    assert.equal(
      await page.locator('.crosshair-demo > section,.crosshair-demo > details,.crosshair-demo pre').count(),
      0,
    )
    await capture('baseline')
  })
  await literal(3)
  await gate('literal-toggle-current-band-selected-and-outside-pixels-model-and-events', async () => {
    const on = await pixel(250, 140),
      selected = await pixel(365, 140),
      outside = await pixel(250, 175)
    await literal(0)
    assert.notDeepEqual(await pixel(250, 140), on)
    assert.deepEqual(await pixel(365, 140), selected)
    assert.deepEqual(await pixel(250, 175), outside)
    await literal(1)
    assert.deepEqual(await pixel(250, 140), on)
    assert.deepEqual(await read(), original)
    assert.deepEqual(await page.evaluate(() => window.crosshairEvents), [false, true])
    return { band: on, selected, outside }
  })
  await gate('literal-rectangle-and-actual-drag-same-selection', async () => {
    await literal(2)
    assert.equal(await range(), 'C4:E6')
    const on = await pixel(250, 175)
    await enable(false)
    assert.notDeepEqual(await pixel(250, 175), on)
    await enable(true)
    const box = await grid.boundingBox()
    await page.mouse.move(box.x + 370, box.y + 140)
    await page.mouse.down()
    await page.mouse.move(box.x + 580, box.y + 200, { steps: 8 })
    await page.mouse.up()
    assert.equal(await range(), 'C4:E6')
    await capture('native-rectangle')
  })
  await gate('merged-and-first-cell-real-band-pixels', async () => {
    await activate('A11:B11')
    assert.equal(await range(), 'A11:B11')
    const merged = await pixel(370, 365)
    await enable(false)
    assert.notDeepEqual(await pixel(370, 365), merged)
    await enable(true)
    await capture('native-merged')
    await activate('A1')
    assert.equal(await range(), 'A1')
    const first = await pixel(250, 45)
    await enable(false)
    assert.notDeepEqual(await pixel(250, 45), first)
    await enable(true)
  })
  for (const [label, a1, expected, position] of [
    ['row', '4:4', 'A4:H4', { x: 20, y: 140 }],
    ['column', 'C:C', 'C1:C24', { x: 390, y: 12 }],
  ]) {
    await gate(`native-whole-${label}-suppresses-bands-without-model-mutation`, async () => {
      await grid.click({ position })
      assert.equal(await range(), a1)
      await settle()
      const on = await grid.screenshot()
      await enable(false)
      assert.deepEqual(await grid.screenshot(), on)
      await enable(true)
      await activate(a1)
      assert.equal(await range(), expected)
      assert.deepEqual(await read(), original)
    })
  }
  await gate('last-cell-native-scroll-visible-band', async () => {
    await page.setViewportSize({ width: 760, height: 650 })
    await activate('H24')
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().scrollToCell(20, 5, 0))
    await settle()
    assert.equal(await range(), 'H24')
    report.history.lastCellScroll = await page.evaluate(() =>
      window.univerAPI.getActiveWorkbook().getActiveSheet().getScrollState(),
    )
    await capture('last-cell-before-toggle')
    const on = await grid.screenshot()
    await enable(false)
    assert.notDeepEqual(await grid.screenshot(), on)
    await enable(true)
    await capture('last-cell-scrolled')
  })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().scrollToCell(0, 0, 0))
  await activate('C4')
  await gate('native-click-and-arrow', async () => {
    await grid.click({ position: { x: 390, y: 140 } })
    await page.keyboard.press('ArrowRight')
    assert.equal(await range(), 'D4')
  })
  await activate('C4')
  await page.getByRole('tab', { name: 'View', exact: true }).click()
  const menu = page
    .locator('[data-u-command="sheet.operation.toggle-crosshair-highlight"]:visible')
    .filter({ hasText: 'Crosshair Highlight' })
  const palette = async (index) => {
    await menu.locator('.univer-toolbar-button-selector-trigger').click()
    const swatches = page.locator('[role="menu"] .univer-grid-cols-8 > div')
    await swatches.first().waitFor()
    assert.equal(await swatches.count(), 16)
    const color = await swatches.nth(index).evaluate((node) => getComputedStyle(node).backgroundColor)
    await swatches.nth(index).click()
    await page.keyboard.press('Escape')
    await swatches.first().waitFor({ state: 'hidden' })
    await settle()
    return color
  }
  await menu.locator('.univer-toolbar-button-selector-main').click()
  const eventBefore = await page.evaluate(() => window.crosshairEvents.length)
  const strongColor = await palette(1)
  await gate('strict-native-palette-auto-enable-notification', async () => {
    assert.equal(await enabled(), true)
    const eventAfter = await page.evaluate(() => window.crosshairEvents.length)
    report.history.paletteEvent = { before: eventBefore, after: eventAfter, expected: eventBefore + 1 }
    assert.equal(eventAfter, eventBefore + 1)
  })
  await gate('native-sixteen-presets-two-opacity-current-band-pixels', async () => {
    const strong = await pixel(250, 140),
      selected = await pixel(365, 140)
    const paleColor = await palette(9),
      pale = await pixel(250, 140)
    assert.notEqual(strongColor, paleColor)
    assert.ok(overWhite(pale)[1] > overWhite(strong)[1])
    assert.ok(overWhite(pale)[2] > overWhite(strong)[2])
    assert.deepEqual(await pixel(365, 140), selected)
    assert.deepEqual(await read(), original)
    await capture('native-pale-palette')
    return { strongColor, paleColor, strong, pale, selected }
  })
  await literal(4)
  await gate('native-second-sheet-distinct-content-shared-palette', async () => {
    const before = await pixel(250, 140)
    await page.getByText('Last week', { exact: true }).click()
    assert.equal(
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId()),
      'archive',
    )
    await activate('C4')
    assert.equal(await cell('A5'), 'Guest room')
    assert.equal(await cell('G5'), 6.5)
    assert.deepEqual(await pixel(250, 140), before)
    assert.ok(await enabled())
    await capture('native-second-sheet')
    await page.getByText('This week', { exact: true }).click()
    await activate('C4')
  })
  const beforeEdit = await read()
  await input('6.25')
  await page.waitForFunction(
    () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('G4').getValue() === 14.75,
  )
  const afterEdit = await read()
  await gate('native-keyboard-edit-and-dependent-native-formula', async () => {
    assert.equal(await cell('C4'), 6.25)
    assert.equal(await cell('G4'), 14.75)
    assert.deepEqual(afterEdit.sheets.archive, beforeEdit.sheets.archive)
  })
  await history('undo')
  const undo = await read()
  report.history.keyboard = { before: beforeEdit, after: afterEdit, undo }
  await gate('strict-native-keyboard-complete-raw-undo', () => assert.deepEqual(undo, beforeEdit))
  await history('redo')
  const redo = await read()
  report.history.keyboard.redo = redo
  await gate('strict-native-keyboard-complete-raw-redo', () => assert.deepEqual(redo, afterEdit))
  await gate('same-owner-theme-full-model-and-current-band-pixels', async () => {
    await activate('C4')
    const before = await read(),
      pixelBefore = await pixel(250, 140)
    await page.evaluate(() => {
      window.crosshairOwner = window.univerAPI
      window.univerAPI.toggleDarkMode(true)
    })
    await settle()
    assert.deepEqual(await read(), before)
    await capture('dark')
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.ok(await page.evaluate(() => window.crosshairOwner === window.univerAPI))
    assert.deepEqual(await read(), before)
    assert.deepEqual(await pixel(250, 140), pixelBefore)
  })
  const beforeReload = await read(),
    paletteBeforeReload = await pixel(250, 140)
  await literal(5)
  await settle()
  const afterReload = await read()
  report.history.unitRecovery = { before: beforeReload, after: afterReload }
  await gate('strict-literal-same-id-unit-full-snapshot-recovery', () => assert.deepEqual(afterReload, beforeReload))
  await gate('unit-reload-instance-palette-and-fresh-native-edit', async () => {
    await activate('C4')
    assert.deepEqual(await pixel(250, 140), paletteBeforeReload)
    await input('7.25')
    assert.equal(await cell('C4'), 7.25)
  })
  const ownerBefore = await read()
  await page.evaluate((saved) => {
    window.crosshairController.dispose()
    window.crosshairPaint = []
    window.crosshairController = window.crosshairCreate(document.getElementById('app'), false, saved)
  }, ownerBefore)
  await ready()
  const ownerAfter = await read()
  report.history.ownerRecovery = { before: ownerBefore, after: ownerAfter }
  await gate('strict-same-id-new-owner-full-snapshot-recovery', () => assert.deepEqual(ownerAfter, ownerBefore))
  await gate('new-owner-default-bands-and-fresh-native-input', async () => {
    assert.ok(await enabled())
    assert.notDeepEqual(await pixel(250, 140), paletteBeforeReload)
    await input('8.25')
    assert.equal(await cell('C4'), 8.25)
    await capture('restored-fresh-input')
  })
  const restoredEdit = await read()
  await history('undo')
  const restoredUndo = await read()
  report.history.restoredKeyboard = { before: ownerAfter, after: restoredEdit, undo: restoredUndo }
  await gate('strict-restored-owner-fresh-input-full-undo', () => assert.deepEqual(restoredUndo, ownerAfter))
  await history('redo')
  const restoredRedo = await read()
  report.history.restoredKeyboard.redo = restoredRedo
  await gate('strict-restored-owner-fresh-input-full-redo', () => assert.deepEqual(restoredRedo, restoredEdit))
  await gate('invalid-saved-model-rejected-before-root-or-owner-mutation', async () => {
    const before = await read()
    for (const kind of [
      'id',
      'empty-order',
      'unknown-sheet',
      'sheet-id',
      'zero-rows',
      'nan-columns',
      'missing-cells',
    ]) {
      const result = await page.evaluate((invalidKind) => {
        const api = window.univerAPI,
          saved = structuredClone(api.getActiveWorkbook().save())
        if (invalidKind === 'id') saved.id = 'other'
        if (invalidKind === 'empty-order') saved.sheetOrder = []
        if (invalidKind === 'unknown-sheet') saved.sheetOrder = ['rooms', 'unknown']
        if (invalidKind === 'sheet-id') saved.sheets.rooms.id = 'other'
        if (invalidKind === 'zero-rows') saved.sheets.rooms.rowCount = 0
        if (invalidKind === 'nan-columns') saved.sheets.rooms.columnCount = Number.NaN
        if (invalidKind === 'missing-cells') delete saved.sheets.rooms.cellData
        let message = ''
        try {
          window.crosshairCreate(document.getElementById('app'), false, saved)
        } catch (error) {
          message = error.message
        }
        return {
          message,
          sameOwner: api === window.univerAPI,
          roots: document.querySelectorAll('.crosshair-demo').length,
        }
      }, kind)
      assert.match(result.message, /original sheet IDs/)
      assert.equal(result.sameOwner, true)
      assert.equal(result.roots, 1)
    }
    assert.deepEqual(await read(), before)
  })
  await gate('original-header-only-source-variant-native-bands-and-input', async () => {
    await page.evaluate(() => {
      window.crosshairController.dispose()
      window.crosshairPaint = []
      window.crosshairController = window.crosshairCreate(
        document.getElementById('app'),
        false,
        window.crosshairFixture(true),
      )
    })
    await ready()
    const empty = await read()
    assert.deepEqual(empty.sheetOrder, ['rooms'])
    assert.deepEqual(Object.keys(empty.sheets.rooms.cellData), ['0'])
    await page.evaluate((snapshot) => {
      window.univerAPI.disposeUnit(snapshot.id)
      window.univerAPI.createWorkbook(snapshot)
    }, empty)
    await settle()
    report.history.emptyUnitRecovery = { before: empty, after: await read() }
    await gate('strict-empty-full-snapshot-same-id-unit-recovery', () =>
      assert.deepEqual(report.history.emptyUnitRecovery.after, empty),
    )
    await activate('C4')
    const on = await pixel(250, 140)
    await enable(false)
    assert.notDeepEqual(await pixel(250, 140), on)
    await enable(true)
    await input('2.75')
    assert.equal(await cell('C4'), 2.75)
    await capture('empty-native-input')
  })
  for (const width of [760, 390, 320])
    await gate(`narrow-${width}-native-scroll-selection-and-band-pixels`, async () => {
      await page.setViewportSize({ width, height: 850 })
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().scrollToCell(2, 2, 0))
      await activate('C4')
      const on = await grid.screenshot()
      await enable(false)
      assert.notDeepEqual(await grid.screenshot(), on)
      await enable(true)
      assert.equal(await range(), 'C4')
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
    await gate(`initial-${locale}-both-complete-native-packs-and-palette-label`, async () => {
      const actual = await page.evaluate(() => window.univerAPI.getLocales())
      leaves(actual, (await import(`@univerjs/preset-sheets-core/locales/${locale}`)).default)
      const crosshair = (await import(`@univerjs/sheets-crosshair-highlight/locale/${locale}`)).default
      leaves(actual, crosshair)
      await page.getByRole('tab', { name: locale === 'zh-CN' ? '视图' : 'View', exact: true }).click()
      const nativeMenu = page
        .locator('[data-u-command="sheet.operation.toggle-crosshair-highlight"]:visible')
        .filter({ hasText: crosshair['sheets-crosshair-highlight'].button.tooltip })
      await nativeMenu.locator('.univer-toolbar-button-selector-trigger').click()
      await page.locator('[role="menu"] .univer-grid-cols-8 > div').nth(15).waitFor()
      await page.keyboard.press('Escape')
      await page.locator('[role="menu"] .univer-grid-cols-8 > div').first().waitFor({ state: 'hidden' })
      await settle()
      await capture(`initial-${locale}`)
    })
    await page.unrouteAll({ behavior: 'wait' })
  }
  await gate('active-idempotent-disposal-removes-owner-dom', async () => {
    await page.evaluate(() => {
      window.crosshairController.dispose()
      window.crosshairController.dispose()
    })
    assert.equal(await page.locator('.crosshair-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
  })
  await gate('before-steady-idempotent-disposal-has-no-late-initialization', async () => {
    const stage = await page.evaluate(() => {
      const pending = window.crosshairCreate(document.getElementById('app'))
      const currentStage = pending.univerAPI.getCurrentLifecycleStage()
      const steady = pending.univerAPI.Enum.LifecycleStages.Steady
      pending.dispose()
      pending.dispose()
      return { stage: currentStage, steady }
    })
    assert.ok(stage.stage < stage.steady)
    await page.waitForTimeout(3500)
    assert.equal(await page.locator('.crosshair-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
    return stage
  })
  await gate('six-readme-literals-executed-verbatim', () =>
    assert.deepEqual([...new Set(report.literals)].toSorted(), [1, 2, 3, 4, 5, 6]),
  )
  await new Promise((resolve) => server.httpServer.close(resolve))
  server = await vite.preview({
    root: project,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  await page.goto('http://127.0.0.1:4412')
  await ready()
  await gate('normal-production-source-official-css-real-band-paint-and-pagehide', async () => {
    for (const [name, content] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(project, name.slice(1)), 'utf8'), content, name)
    assert.ok(
      await page.evaluate(() => !window.crosshairController && window.crosshairPaint.includes('Blackbird studio')),
    )
    const css = await page.locator('[data-u-comp=workbench-layout]').evaluate((node) => ({
      bg: getComputedStyle(node).backgroundColor,
      white: getComputedStyle(node).getPropertyValue('--univer-gray-0').trim(),
    }))
    assert.deepEqual(css, { bg: 'rgb(255, 255, 255)', white: '#FFFFFF' })
    const on = await pixel(250, 140)
    await enable(false)
    assert.notDeepEqual(await pixel(250, 140), on)
    await enable(true)
    await capture('normal-production-cover')
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    assert.equal(await page.locator('.crosshair-demo,canvas').count(), 0)
    return { sourceFiles: Object.keys(source.files).length, startupOverlayAbsent: true, band: on }
  })
  await gate('no-runtime-errors-or-backend-requests', () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
  })
} catch (error) {
  report.fatal = error.stack || String(error)
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
