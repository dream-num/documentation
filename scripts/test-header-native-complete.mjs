/* eslint-disable no-await-in-loop -- Header scopes, current pixels and complete history are checked in sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/header-native-complete')
await fs.mkdir(output, { recursive: true })
const project =
  process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-header-native-')))
const viteDirectory = process.env.SHOWCASE_VITE_DIRECTORY || path.join(project, 'node_modules/vite')
const report = {
  passed: false,
  gates: {},
  errors: [],
  backendRequests: [],
  history: {},
  literals: [],
  dependencies: {},
}
let server, browser
const write = (name, data) => fs.writeFile(path.join(output, name), JSON.stringify(data, null, 2))
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
try {
  const source = (await readShowcaseSources()).find((item) => item.slug === 'sheets/custom-header')
  report.export = { slug: source.slug, directory: project }
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(project, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  const pkg = JSON.parse(source.files['/package.json'])
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const installed = await fs.realpath(name === 'vite' ? viteDirectory : path.resolve('node_modules', name))
    assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version)
    const target = path.join(project, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    if (!(await fs.lstat(target).catch(() => null))) await fs.symlink(installed, target, 'junction')
    report.dependencies[name] = version
  }
  await write('exports.json', [report.export])
  const vite = await import(pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js')))
  await vite.build({ root: project, configFile: false, logLevel: 'warn' })
  const entry = source.files['/src/index.ts']
  await fs.writeFile(
    path.join(project, 'src/index.ts'),
    entry.replace(
      'const demo = createDemo(container)',
      'const demo = window.headerController = createDemo(container)',
    ) + '\nwindow.headerCreate = createDemo\n',
  )
  await vite.build({
    root: project,
    configFile: false,
    logLevel: 'warn',
    build: { outDir: path.join(output, 'dist'), emptyOutDir: false },
  })
  await fs.writeFile(path.join(project, 'src/index.ts'), entry)
  server = await vite.preview({
    root: project,
    configFile: false,
    build: { outDir: path.join(output, 'dist') },
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
  page.setDefaultTimeout(10000)
  page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
  })
  page.on('request', (request) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
      (['fetch', 'xhr'].includes(request.resourceType()) &&
        !['127.0.0.1', 'localhost'].includes(new URL(request.url()).hostname))
    )
      report.backendRequests.push(request.url())
  })
  await page.addInitScript(() => {
    window.headerPaint = []
    const original = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      if (window.headerPaint.length < 12000)
        window.headerPaint.push({
          text: String(text),
          color: String(this.fillStyle),
          align: this.textAlign,
          font: this.font,
          x: args[0],
          y: args[1],
          canvas: this.canvas.id,
        })
      return original.call(this, text, ...args)
    }
  })
  const read = () => page.evaluate(() => window.univerAPI.getWorkbook('lumen-equipment').save())
  const clearPaint = () =>
    page.evaluate(() => {
      window.headerPaint = []
    })
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const paint = (text, color, align) =>
    page.waitForFunction(
      ({ text: expectedText, color: expectedColor, align: expectedAlign }) =>
        window.headerPaint.some(
          (item) =>
            item.text === expectedText &&
            (!expectedColor || item.color === expectedColor) &&
            (!expectedAlign || item.align === expectedAlign),
        ),
      { text, color, align },
    )
  const canvas = () => page.locator('canvas[id^="univer-sheet-main-canvas"]:visible').first()
  async function pixels() {
    return canvas().evaluate((element) => {
      const { data } = element.getContext('2d').getImageData(0, 0, element.width, element.height)
      const result = { purple: 0, blue: 0, redRow: 0 }
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 91 && data[i + 1] === 33 && data[i + 2] === 182 && data[i + 3] === 255) result.purple++
        if (data[i] === 30 && data[i + 1] === 58 && data[i + 2] === 138 && data[i + 3] === 255) result.blue++
        if (data[i] === 254 && data[i + 1] === 226 && data[i + 2] === 226 && data[i + 3] === 255) result.redRow++
      }
      return result
    })
  }
  async function ready(custom = true) {
    await page.locator('.custom-header-demo[data-ready=true]').waitFor({ timeout: 30000 })
    await page.evaluate(() => window.headerController.ready)
    await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    await page.waitForFunction(() => !document.querySelector('[data-u-comp="workbench-skeleton-content"]'))
    await paint(custom ? 'Deposit' : 'A')
    await settle()
  }
  async function capture(name) {
    await settle()
    await page.screenshot({ path: path.join(output, `${name}.png`) })
    await write(`${name}.json`, {
      snapshot: await read(),
      paint: await page.evaluate(() => window.headerPaint),
      pixels: await pixels(),
    })
  }
  async function action(name) {
    await clearPaint()
    await page.locator(`[data-action="${name}"]`).click()
    await settle()
  }
  async function apply(appearance = 'styled', scope = 'sheet') {
    await page.locator('[data-control="appearance"]').selectOption(appearance)
    await page.locator('[data-control="scope"]').selectOption(scope)
    await action('apply')
  }
  async function tab(name) {
    await clearPaint()
    await page.getByText(name, { exact: true }).click()
    await settle()
  }
  const recipeSources = [
    ...(await fs.readFile('showcase/sheets/custom-header/code/README.md', 'utf8')).matchAll(/```ts\r?\n([\s\S]*?)```/g),
  ].map((match) => match[1])
  assert.equal(recipeSources.length, 5)
  async function recipe(n) {
    await clearPaint()
    await page.evaluate(
      (code) => new Function('univerAPI', 'demo', code)(window.univerAPI, window.headerController),
      recipeSources[n - 1],
    )
    report.literals.push(n)
    await settle()
  }
  const value = (cell) =>
    page.evaluate(
      (address) => window.univerAPI.getWorkbook('lumen-equipment').getActiveSheet().getRange(address).getRawValue(),
      cell,
    )
  async function input(text) {
    await canvas().dblclick({ position: { x: 180, y: 51 } })
    await page.keyboard.press('Control+A')
    await page.keyboard.insertText(text)
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      (expected) =>
        window.univerAPI.getWorkbook('lumen-equipment').getActiveSheet().getRange('A1').getRawValue() === expected,
      text,
    )
    await settle()
  }
  await page.goto('http://127.0.0.1:4412')
  await ready()
  const original = await read()
  await gate('original-small-data-and-current-native-header-color-pixels', async () => {
    assert.equal(original.id, 'lumen-equipment')
    assert.deepEqual(original.sheetOrder, ['bookings', 'returns'])
    assert.equal(original.sheets.bookings.cellData[0][0].v, 'Portable projector')
    assert.equal(original.sheets.bookings.cellData[4][2].v, null)
    assert.equal(original.sheets.bookings.cellData[2][5].v, 0)
    assert.equal(original.sheets.returns.cellData[0][0].v, 'Field recorder')
    assert.equal(await page.locator('.custom-header-demo fieldset button').count(), 4)
    assert.equal(await page.locator('.custom-header-demo details,.custom-header-demo pre').count(), 0)
    await paint('Deposit', '#fde68a', 'right')
    await paint('Slot 3', '#991b1b', 'left')
    const fonts = await page.evaluate(() => ({
      column: window.headerPaint.findLast((item) => item.text === 'Deposit').font,
      row: window.headerPaint.findLast((item) => item.text === 'Slot 3').font,
    }))
    assert.match(fonts.column, /^13px /)
    assert.match(fonts.row, /^12px /)
    const current = await pixels()
    assert.ok(current.purple > 100 && current.blue > 1000 && current.redRow > 100)
    await capture('styled-cover')
    return current
  })
  await gate('label-only-replaces-custom-colors-without-cell-mutation', async () => {
    await apply('labels')
    await paint('Deposit')
    const current = await pixels()
    assert.equal(current.purple, 0)
    assert.equal(current.blue, 0)
    assert.deepEqual(await read(), original)
    return current
  })
  await gate('native-tabs-workbook-default-and-sheet-override-precedence', async () => {
    await action('clear-all')
    await tab('Returns')
    await paint('A')
    await apply('labels', 'workbook')
    await paint('Equipment')
    assert.equal((await pixels()).purple, 0)
    await tab('Bookings')
    await apply()
    await paint('Deposit', '#fde68a')
    await apply('labels', 'workbook')
    await paint('Deposit', '#fde68a')
    assert.ok((await pixels()).purple > 100)
    await action('clear-sheet')
    await paint('Deposit')
    assert.equal((await pixels()).purple, 0)
    await tab('Returns')
    await paint('Equipment')
    assert.equal((await pixels()).purple, 0)
    await tab('Bookings')
    assert.deepEqual(await read(), original)
  })
  await gate('literal-1-workbook-labels-not-snapshot-fields', async () => {
    await recipe(1)
    await paint('First slot')
    assert.deepEqual(await read(), original)
  })
  await gate('literal-2-native-dimensions-active-sheet-only', async () => {
    await recipe(2)
    const compact = await read()
    assert.equal(compact.sheets.bookings.rowHeader.width, 46)
    assert.equal(compact.sheets.bookings.columnHeader.height, 24)
    assert.deepEqual(compact.sheets.returns, original.sheets.returns)
    await canvas().click({ position: { x: 60, y: 12 } })
    assert.equal((await selection()).endRow, 29)
    await canvas().click({ position: { x: 20, y: 39 } })
    assert.equal((await selection()).endColumn, 7)
    await capture('compact-native-geometry')
    await action('size')
    assert.deepEqual(await read(), original)
  })
  function selection() {
    return page.evaluate(() =>
      window.univerAPI.getWorkbook('lumen-equipment').getActiveSheet().getSelection().getActiveRange().getRange(),
    )
  }
  await gate('native-header-clicks-select-full-row-and-column', async () => {
    await apply()
    await canvas().click({ position: { x: 180, y: 18 } })
    const column = await selection()
    assert.equal(column.startColumn, 0)
    assert.equal(column.endRow, 29)
    await canvas().click({ position: { x: 35, y: 111 } })
    const row = await selection()
    assert.equal(row.startRow, 2)
    assert.equal(row.endColumn, 7)
  })
  await gate('scroll-real-grid-then-repaint-sticky-styled-headers', async () => {
    await canvas().click({ position: { x: 400, y: 81 } })
    const before = await read(),
      bounds = await canvas().boundingBox()
    await page.mouse.move(bounds.x + 420, bounds.y + 300)
    await clearPaint()
    await page.mouse.wheel(0, 400)
    await settle()
    await paint('Deposit', '#fde68a')
    await capture('scrolled')
    const scrolledPixels = await pixels()
    await clearPaint()
    await page.mouse.wheel(0, -1000)
    await settle()
    await paint('Slot 1')
    assert.deepEqual(await read(), before)
    assert.ok(scrolledPixels.purple > 100)
  })
  const rowHistory = { before: await read() }
  await gate('literal-5-row-insertion-keeps-positional-native-labels', async () => {
    const beforeSlot = await page.evaluate(() => window.headerPaint.findLast((item) => item.text === 'Slot 1'))
    await recipe(5)
    await paint('Slot 1')
    assert.equal(await value('A2'), 'Portable projector')
    assert.equal(await value('A1'), undefined)
    const afterSlot = await page.evaluate(() => window.headerPaint.findLast((item) => item.text === 'Slot 1'))
    assert.equal(afterSlot.y, beforeSlot.y)
    assert.ok((await pixels()).redRow > 100)
    await capture('inserted-row-positional')
  })
  rowHistory.after = await read()
  await page.locator('[data-u-command="univer.command.undo"]').click()
  await settle()
  rowHistory.undo = await read()
  await gate('row-insertion-full-raw-undo', () => assert.deepEqual(rowHistory.undo, rowHistory.before))
  await page.locator('[data-u-command="univer.command.redo"]').click()
  await settle()
  rowHistory.redo = await read()
  await gate('row-insertion-full-raw-redo', () => assert.deepEqual(rowHistory.redo, rowHistory.after))
  report.history.rowInsertion = rowHistory
  // A fresh original owner isolates the original A1 history defect from row restructuring.
  // The complete row history above remains untouched, including any failure.
  await page.reload()
  await ready()
  const nativeHistory = { before: await read() }
  await gate('genuine-native-cell-input-and-paint', async () => {
    await input('Projector inspected')
    await paint('Projector inspected')
  })
  nativeHistory.after = await read()
  await page.keyboard.press('Control+z')
  await settle()
  nativeHistory.undo = await read()
  await gate('native-cell-full-raw-undo', () => assert.deepEqual(nativeHistory.undo, nativeHistory.before))
  await page.keyboard.press('Control+y')
  await settle()
  nativeHistory.redo = await read()
  await gate('native-cell-full-raw-redo', () => assert.deepEqual(nativeHistory.redo, nativeHistory.after))
  report.history.nativeCell = nativeHistory
  await gate('clear-all-preserves-edits-and-dimensions', async () => {
    await action('clear-all')
    await paint('A')
    assert.equal((await pixels()).purple, 0)
    assert.deepEqual(await read(), nativeHistory.redo)
    await apply()
    await paint('Deposit', '#fde68a')
    assert.deepEqual(await read(), nativeHistory.redo)
  })
  await gate('literal-3-save-complete-model', async () => {
    await recipe(3)
    assert.deepEqual(await page.evaluate(() => window.headerSaved), await read())
  })
  await gate('literal-4-same-id-restore-clears-render-config-only', async () => {
    await page.evaluate(() => {
      window.previousAPI = window.univerAPI
    })
    await recipe(4)
    await paint('A')
    assert.equal((await pixels()).purple, 0)
    assert.deepEqual(await read(), await page.evaluate(() => window.headerSaved))
    assert.ok(await page.evaluate(() => window.univerAPI === window.previousAPI))
    await capture('restored-native-headers')
    await recipe(1)
    await paint('First slot')
    assert.deepEqual(await read(), await page.evaluate(() => window.headerSaved))
  })
  await gate('restored-host-controls-target-current-native-unit', async () => {
    await apply()
    await paint('Deposit', '#fde68a')
    assert.ok((await pixels()).purple > 100)
    await action('size')
    assert.equal((await read()).sheets.bookings.rowHeader.width, 46)
    await action('size')
    await input('Projector after restore')
    await paint('Projector after restore')
  })
  const fullOwner = await read()
  await gate('same-id-complete-owner-reconstruction-no-implicit-styles', async () => {
    await clearPaint()
    await page.evaluate(async (saved) => {
      const old = window.headerController
      old.dispose()
      window.headerController = window.headerCreate(document.getElementById('app'), false, 'enUS', saved)
      await window.headerController.ready
    }, fullOwner)
    await ready(false)
    report.history.ownerRecovery = { before: fullOwner, after: await read() }
    assert.deepEqual(await read(), fullOwner)
    assert.equal((await pixels()).purple, 0)
  })
  await gate('rebuilt-rendering-config-explicit-reapply-current-pixels', async () => {
    assert.equal((await pixels()).purple, 0)
    await apply()
    await paint('Deposit', '#fde68a')
    assert.ok((await pixels()).purple > 100)
  })
  const restoredHistory = { before: await read() }
  await input('Fresh owner edit')
  restoredHistory.after = await read()
  await gate('rebuilt-owner-fresh-native-edit', () =>
    assert.equal(restoredHistory.after.sheets.bookings.cellData[0][0].v, 'Fresh owner edit'),
  )
  await page.keyboard.press('Control+z')
  await settle()
  restoredHistory.undo = await read()
  await gate('rebuilt-owner-full-undo', () => assert.deepEqual(restoredHistory.undo, restoredHistory.before))
  await page.keyboard.press('Control+y')
  await settle()
  restoredHistory.redo = await read()
  await gate('rebuilt-owner-full-redo', () => assert.deepEqual(restoredHistory.redo, restoredHistory.after))
  report.history.rebuilt = restoredHistory
  await gate('invalid-snapshot-before-owner-or-model-mutation', async () => {
    const before = await read()
    for (const kind of ['id', 'sheet', 'width', 'missing']) {
      const result = await page.evaluate((invalidKind) => {
        const api = window.univerAPI,
          copy = structuredClone(api.getActiveWorkbook().save())
        if (invalidKind === 'id') copy.id = 'other'
        if (invalidKind === 'sheet') copy.sheets.bookings.id = 'other'
        if (invalidKind === 'width') copy.sheets.bookings.rowHeader.width = 0
        if (invalidKind === 'missing') copy.sheetOrder = []
        let message = '',
          factoryMessage = ''
        try {
          window.headerController.restore(copy)
        } catch (error) {
          message = error.message
        }
        try {
          window.headerCreate(document.getElementById('app'), false, 'enUS', copy)
        } catch (error) {
          factoryMessage = error.message
        }
        return { message, factoryMessage, sameAPI: window.univerAPI === api }
      }, kind)
      assert.match(result.message, /complete lumen-equipment/)
      assert.match(result.factoryMessage, /complete lumen-equipment/)
      assert.ok(result.sameAPI)
    }
    assert.deepEqual(await read(), before)
  })
  await gate('empty-model-restore-and-exact-complete-recovery', async () => {
    const saved = await read(),
      empty = structuredClone(saved)
    empty.sheets.bookings.cellData = {}
    empty.sheets.returns.cellData = {}
    await clearPaint()
    await page.evaluate((data) => window.headerController.restore(data), empty)
    await paint('A')
    assert.deepEqual(await read(), empty)
    await input('Empty sheet entry')
    assert.equal(await value('A1'), 'Empty sheet entry')
    await page.evaluate((data) => window.headerController.restore(data), saved)
    assert.deepEqual(await read(), saved)
    await apply()
    await paint('Deposit', '#fde68a')
  })
  await gate('same-owner-theme-keeps-model-and-real-header-paint', async () => {
    const saved = await read()
    await clearPaint()
    await page.evaluate(() => {
      window.themeOwner = window.univerAPI
      window.headerController.setDarkMode(true)
    })
    await page.locator('.custom-header-demo[data-theme=dark]').waitFor()
    await paint('Deposit', undefined, 'right')
    assert.deepEqual(await read(), saved)
    await capture('dark')
    await clearPaint()
    await page.evaluate(() => window.headerController.setDarkMode(false))
    await paint('Deposit', '#fde68a')
    assert.ok(await page.evaluate(() => window.themeOwner === window.univerAPI))
    assert.deepEqual(await read(), saved)
  })
  for (const width of [760, 390, 320])
    await gate(`narrow-${width}-actual-header-and-keyboard-host-controls`, async () => {
      await page.setViewportSize({ width, height: 1100 })
      await clearPaint()
      await page.locator('[data-action=clear-all]').focus()
      await page.keyboard.press('Enter')
      await paint('A')
      await apply()
      await paint('Equipment', '#ffffff')
      assert.ok((await pixels()).blue > 100)
      await capture(`narrow-${width}`)
    })
  await page.setViewportSize({ width: 1600, height: 1000 })
  for (const locale of ['en-US', 'zh-CN']) {
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue()
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/lang="[^"]*"/, `lang="${locale}"`) })
    })
    await page.reload()
    await ready()
    await gate(`initial-${locale}-complete-native-pack-and-host-controls`, async () => {
      leaves(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import(`@univerjs/preset-sheets-core/locales/${locale}`)).default,
      )
      await page
        .getByText(locale === 'zh-CN' ? '开始' : 'Start', { exact: true })
        .first()
        .waitFor()
      await page
        .getByRole('button', { name: locale === 'zh-CN' ? '应用行列头' : 'Apply headers', exact: true })
        .waitFor()
      await page.getByLabel(locale === 'zh-CN' ? '行列头外观' : 'Header appearance').waitFor()
      await capture(`initial-${locale}`)
    })
    await page.unrouteAll({ behavior: 'wait' })
  }
  await gate('active-idempotent-disposal-removes-api-native-dom-and-controls', async () => {
    await page.evaluate(() => {
      window.headerController.dispose()
      window.headerController.dispose()
    })
    assert.equal(await page.locator('.custom-header-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
  })
  await gate('pending-startup-disposal-rejects-ready-and-leaves-no-owner', async () => {
    const result = await page.evaluate(async () => {
      const pending = window.headerCreate(document.getElementById('app'))
      pending.dispose()
      pending.dispose()
      let name = ''
      try {
        await pending.ready
      } catch (error) {
        name = error.name
      }
      return { name, roots: document.querySelectorAll('.custom-header-demo,canvas').length, hasAPI: !!window.univerAPI }
    })
    assert.deepEqual(result, { name: 'AbortError', roots: 0, hasAPI: false })
  })
  await gate('all-five-readme-literals-executed', () =>
    assert.deepEqual([...new Set(report.literals)].toSorted(), [1, 2, 3, 4, 5]),
  )
  await new Promise((resolve) => server.httpServer.close(resolve))
  server = undefined
  server = await vite.preview({
    root: project,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  await page.goto('http://127.0.0.1:4412')
  await page.locator('.custom-header-demo[data-ready=true]').waitFor()
  await paint('Deposit', '#fde68a')
  await settle()
  await gate('normal-export-source-css-current-pixels-and-pagehide', async () => {
    for (const [name, content] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(project, name.slice(1)), 'utf8'), content, name)
    assert.ok(
      await page.evaluate(
        () => !window.headerController && !document.querySelector('[data-u-comp="workbench-skeleton-content"]'),
      ),
    )
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((node) => getComputedStyle(node).backgroundColor),
      'rgb(255, 255, 255)',
    )
    assert.ok((await pixels()).purple > 100)
    await capture('normal-production-cover')
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    assert.equal(await page.locator('.custom-header-demo,canvas').count(), 0)
    return { sourceFiles: Object.keys(source.files).length }
  })
  await gate('no-runtime-errors-or-backend', () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
  })
} catch (error) {
  report.fatal = error.stack || String(error)
} finally {
  await browser?.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
  report.passed = !report.fatal && Object.values(report.gates).every((result) => result.passed)
  await write('report.json', report)
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
