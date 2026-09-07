/* eslint-disable no-await-in-loop -- Real native menus, event delivery and strict histories must run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/aster-custom-event-native')
assert.ok(
  process.env.SHOWCASE_EXPORT_DIRECTORY,
  'Set SHOWCASE_EXPORT_DIRECTORY to a dedicated sheets/custom-event export with its exact-version dependencies already available in node_modules. This test rewrites and rebuilds that export.',
)
const project = path.resolve(process.env.SHOWCASE_EXPORT_DIRECTORY)
const report = {
  passed: false,
  gates: {},
  history: {},
  literals: [],
  literalConsole: [],
  errors: [],
  backendRequests: [],
}
let browser, server, page
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
  const source = (await readShowcaseSources()).find((item) => item.slug === 'sheets/custom-event')
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
    entry.replace('const demo = createDemo(container)', 'const demo = window.asterController = createDemo(container)') +
      '\nwindow.asterCreate = createDemo\n',
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
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(10000)
  page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
    if (message.type() === 'log') report.literalConsole.push(message.text())
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
    window.asterPaint = []
    const original = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      window.asterPaint.push(String(text))
      return original.call(this, text, ...args)
    }
  })
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const ready = async (empty = false) => {
    await page.locator('.custom-event-demo[data-ready=true]').waitFor()
    await page.waitForFunction(
      (isEmpty) =>
        !document.querySelector('[data-u-comp="workbench-skeleton-content"]') &&
        window.asterPaint.includes(isEmpty ? 'A' : 'AS-021'),
      empty,
    )
    await settle()
  }
  const grid = page.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const read = () => page.evaluate(() => window.univerAPI.getWorkbook('aster-lab').save())
  const log = () => page.locator('.event-log li').allTextContents()
  const capture = (name) => page.screenshot({ path: path.join(output, `${name}.png`) })
  const columns = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getMaxColumns())
  const activate = async (address) => {
    await page.evaluate((a1) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a1).activate(), address)
    await settle()
  }
  const nativeDelete = async (x) => {
    await grid.click({ button: 'right', position: { x, y: 12 } })
    await page.getByText('Delete Selected Column', { exact: true }).filter({ visible: true }).last().click()
    await settle()
  }
  const history = async (command) => {
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator(`button[data-u-command="univer.command.${command}"]:visible`).click()
    await settle()
  }
  const keyboard = async (value) => {
    await grid.click({ position: { x: 230, y: 56 } })
    await page.keyboard.press('F2')
    await page.keyboard.press('Control+A')
    await page.keyboard.type(value)
    await page.keyboard.press('Enter')
    await settle()
  }
  const context = async (x, y, address, allowed) => {
    const before = (await log()).length
    await grid.click({ button: 'right', position: { x, y } })
    await page.waitForFunction(
      ({ cell, permit }) =>
        document.querySelector('.event-log li:last-child')?.textContent ===
        `${cell}: menu ${permit ? 'allowed' : 'suppressed'}`,
      { cell: address, permit: allowed },
    )
    const copy = page.getByText('Copy', { exact: true }).filter({ visible: true })
    await copy.last().waitFor({ state: allowed ? 'visible' : 'hidden' })
    await page.keyboard.press('Escape')
    await settle()
    assert.ok((await log()).length >= Math.min(before + 1, 12))
  }
  const observe = () =>
    page.evaluate(() => {
      window.asterObserved = []
      for (const name of ['BeforeRemoveColumnEvent', 'RemoveColumnEvent'])
        window.univerAPI.addEvent(name, (params) => {
          const delivery = {
            name,
            sheet: params.worksheet.getSheetId(),
            start: params.startColumn,
            end: params.endColumn,
            canceled: !!params.cancel,
            count: params.worksheet.getMaxColumns(),
            snapshot: structuredClone(params.workbook.save()),
          }
          window.asterObserved.push(delivery)
          // A rebound guard may run after this independent listener. Observe the
          // shared payload after synchronous delivery too, without firing events.
          queueMicrotask(() => {
            delivery.canceledAfterDelivery = !!params.cancel
          })
        })
    })
  const observed = () => page.evaluate(() => window.asterObserved)
  const clearObserved = () =>
    page.evaluate(() => {
      window.asterObserved = []
    })
  const reload = async (snapshot) => {
    await page.evaluate((saved) => {
      window.asterPaint = []
      window.univerAPI.disposeUnit(saved.id)
      window.univerAPI.createWorkbook(saved)
    }, snapshot)
    await ready()
  }
  const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
  const literal = async (index) => {
    await page.evaluate((code) => new Function(code)(), recipes[index])
    report.literals.push(index + 1)
    await settle()
  }
  await page.goto('http://127.0.0.1:4412')
  await ready()
  await observe()
  const original = await read()
  await gate('original-simple-two-sheet-data-native-paint-and-one-host-control', async () => {
    assert.deepEqual(original.sheetOrder, ['samples', 'archive'])
    assert.equal(original.sheets.samples.cellData[1][2].v, 7.2)
    assert.equal(original.sheets.samples.cellData[3][5].v, 'High flow')
    assert.ok(
      await page.evaluate(() =>
        ['AS-021', 'AS-022', 'AS-023', 'North inlet', 'Temp °C'].every((text) => window.asterPaint.includes(text)),
      ),
    )
    assert.equal(await page.locator('.custom-event-demo [data-action]').count(), 1)
    assert.equal(await page.locator('.custom-event-demo pre,.custom-event-demo details').count(), 0)
    await capture('baseline')
  })
  await gate('native-A1-menu-suppressed-B2-allowed-and-actual-pointer-inside-range', async () => {
    await context(85, 32, 'A1', false)
    await context(215, 56, 'B2', true)
    await activate('A1:B2')
    await context(215, 56, 'B2', true)
    await context(85, 32, 'A1', false)
    assert.deepEqual(await read(), original)
  })
  await gate('native-C-delete-canceled-before-event-without-after-or-model-change', async () => {
    await clearObserved()
    await nativeDelete(410)
    assert.deepEqual(await read(), original)
    const events = await observed()
    assert.equal(events.length, 1)
    assert.deepEqual(
      { name: events[0].name, start: events[0].start, end: events[0].end, canceled: events[0].canceled },
      { name: 'BeforeRemoveColumnEvent', start: 2, end: 2, canceled: true },
    )
    assert.deepEqual((await log()).slice(-2), ['Before: Samples 3–3', 'Blocked: deletion overlaps C–E.'])
    return events
  })
  await gate('native-partial-overlap-B-through-D-canceled-as-one-range', async () => {
    await clearObserved()
    await activate('B:D')
    await nativeDelete(410)
    assert.deepEqual(await read(), original)
    const events = await observed()
    assert.equal(events.length, 1)
    assert.equal(events[0].start, 1)
    assert.equal(events[0].end, 3)
    assert.equal(events[0].canceled, true)
    return events
  })
  await activate('F:F')
  await clearObserved()
  await nativeDelete(830)
  const afterDelete = await read(),
    deleteEvents = await observed()
  await gate('native-allowed-F-delete-before-after-real-model-order', async () => {
    assert.equal(await columns(), 7)
    assert.deepEqual(
      deleteEvents.map(({ name, count }) => [name, count]),
      [
        ['BeforeRemoveColumnEvent', 8],
        ['RemoveColumnEvent', 7],
      ],
    )
    assert.deepEqual(deleteEvents[0].snapshot, original)
    assert.deepEqual(deleteEvents[1].snapshot, afterDelete)
    assert.equal(afterDelete.sheets.samples.cellData[0][5], undefined)
    assert.deepEqual(afterDelete.sheets.archive, original.sheets.archive)
    assert.deepEqual((await log()).slice(-2), ['Before: Samples 6–6', 'After: Samples 6–6'])
    await capture('native-allowed-delete')
  })
  await history('undo')
  const deleteUndo = await read()
  report.history.nativeDelete = { before: original, after: afterDelete, undo: deleteUndo }
  await gate('strict-native-delete-full-raw-undo', () => assert.deepEqual(deleteUndo, original))
  await history('redo')
  report.history.nativeDelete.redo = await read()
  await gate('strict-native-delete-full-raw-redo', () =>
    assert.deepEqual(report.history.nativeDelete.redo, afterDelete),
  )
  await reload(original)
  await gate('guard-remove-native-C-delete-rebind-and-position-based-cancel', async () => {
    await page.getByRole('button', { name: 'Remove guard listener', exact: true }).click()
    await clearObserved()
    await nativeDelete(410)
    assert.equal(await columns(), 7)
    assert.equal((await read()).sheets.samples.cellData[0][2].v, 'Temp °C')
    assert.deepEqual(
      (await observed()).map(({ name }) => name),
      ['BeforeRemoveColumnEvent', 'RemoveColumnEvent'],
    )
    await page.getByRole('button', { name: 'Restore guard listener', exact: true }).click()
    const before = await read()
    await clearObserved()
    await nativeDelete(410)
    assert.deepEqual(await read(), before)
    assert.equal((await observed()).length, 1)
    assert.equal((await observed())[0].canceledAfterDelivery, true)
  })
  await reload(original)
  await gate('native-archive-pointer-and-column-cancellation-use-active-sheet', async () => {
    await page.getByText('Archive', { exact: true }).click()
    await context(150, 56, 'B2', true)
    await context(80, 32, 'A1', false)
    const before = await read()
    await clearObserved()
    await nativeDelete(240)
    assert.deepEqual(await read(), before)
    assert.equal((await observed())[0].sheet, 'archive')
    assert.equal((await observed())[0].canceledAfterDelivery, true)
    await capture('native-archive')
    await page.getByText('Samples', { exact: true }).click()
  })
  await reload(original)
  await gate('four-readme-literals-verbatim-and-independent-consumer-disposal', async () => {
    await clearObserved()
    await literal(0)
    assert.deepEqual(await read(), original)
    assert.equal((await observed())[0].canceledAfterDelivery, true)
    await literal(2)
    const consoleBefore = report.literalConsole.length
    await literal(1)
    assert.equal(await columns(), 7)
    assert.ok(report.literalConsole.slice(consoleBefore).includes('Samples 5 5'))
    await literal(3)
    const consoleAfter = report.literalConsole.length
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().deleteColumns(5, 1))
    await settle()
    assert.equal(await columns(), 6)
    assert.ok(!report.literalConsole.slice(consoleAfter).includes('Samples 5 5'))
    assert.deepEqual([...new Set(report.literals)].toSorted(), [1, 2, 3, 4])
  })
  await reload(original)
  await gate('missing-column-rejection-preserves-complete-model-without-after-event', async () => {
    for (let count = 8; count > 5; count--) {
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().deleteColumns(5, 1))
      await settle()
    }
    assert.equal(await columns(), 5)
    const before = await read()
    await clearObserved()
    await gate('literal-missing-column-check-rejects-before-native-command', async () => {
      const result = await page.evaluate((code) => {
        try {
          new Function(code)()
          return ''
        } catch (error) {
          return error.message
        }
      }, recipes[1])
      assert.equal(result, 'Column F no longer exists')
      assert.deepEqual(await read(), before)
      assert.deepEqual(await observed(), [])
    })
    const result = await page.evaluate(() => {
      try {
        window.univerAPI.getActiveWorkbook().getActiveSheet().deleteColumns(5, 1)
        return { threw: false }
      } catch (error) {
        return { threw: true, message: error.message }
      }
    })
    await settle()
    report.history.missingColumn = { before, after: await read(), events: await observed(), result }
    assert.deepEqual(report.history.missingColumn.after, before)
    assert.ok(!report.history.missingColumn.events.some(({ name }) => name === 'RemoveColumnEvent'))
  })
  await reload(original)
  await gate('bounded-twelve-delivered-messages-without-duplicate-guard-listeners', async () => {
    await clearObserved()
    for (let index = 0; index < 7; index++) {
      await page.locator('[data-action=listener]').click()
      await page.locator('[data-action=listener]').click()
      await nativeDelete(410)
    }
    assert.equal((await log()).length, 12)
    assert.equal((await observed()).length, 7)
    assert.ok((await observed()).every(({ canceledAfterDelivery }) => canceledAfterDelivery))
    assert.deepEqual(await read(), original)
  })
  await reload(original)
  await keyboard('Updated inlet')
  const afterEdit = await read()
  await gate('native-keyboard-edit-real-B2', () =>
    assert.equal(afterEdit.sheets.samples.cellData[1][1].v, 'Updated inlet'),
  )
  await history('undo')
  const editUndo = await read()
  report.history.nativeEdit = { before: original, after: afterEdit, undo: editUndo }
  await gate('strict-native-keyboard-full-raw-undo', () => assert.deepEqual(editUndo, original))
  await history('redo')
  report.history.nativeEdit.redo = await read()
  await gate('strict-native-keyboard-full-raw-redo', () => assert.deepEqual(report.history.nativeEdit.redo, afterEdit))
  await gate('same-owner-themes-keep-full-snapshot-and-working-adapter', async () => {
    const before = await read()
    await page.evaluate(() => {
      window.asterOwner = window.univerAPI
      window.asterController.setDarkMode(true)
    })
    await settle()
    assert.deepEqual(await read(), before)
    await capture('dark')
    await page.evaluate(() => window.asterController.setDarkMode(false))
    await settle()
    assert.deepEqual(await read(), before)
    assert.ok(await page.evaluate(() => window.asterOwner === window.univerAPI))
    await context(85, 32, 'A1', false)
    await context(215, 56, 'B2', true)
  })
  const saved = await read()
  await reload(saved)
  report.history.unitRecovery = { before: saved, after: await read() }
  await gate('strict-same-id-unit-full-model-recovery', () =>
    assert.deepEqual(report.history.unitRecovery.after, saved),
  )
  await gate('recreated-renderer-pointer-cancel-and-fresh-native-edit', async () => {
    await context(85, 32, 'A1', false)
    await context(215, 56, 'B2', true)
    await keyboard('Restored inlet')
    assert.equal((await read()).sheets.samples.cellData[1][1].v, 'Restored inlet')
  })
  const ownerSaved = await read()
  await page.evaluate((snapshot) => {
    window.asterController.dispose()
    window.asterPaint = []
    window.asterController = window.asterCreate(document.getElementById('app'), false, snapshot)
  }, ownerSaved)
  await ready()
  const ownerAfter = await read()
  report.history.ownerRecovery = { before: ownerSaved, after: ownerAfter }
  await gate('strict-same-id-owner-full-model-recovery', () => assert.deepEqual(ownerAfter, ownerSaved))
  await gate('new-owner-native-events-and-fresh-input', async () => {
    await context(85, 32, 'A1', false)
    await context(215, 56, 'B2', true)
    await keyboard('New owner edit')
    assert.equal((await read()).sheets.samples.cellData[1][1].v, 'New owner edit')
  })
  const restoredEdit = await read()
  await history('undo')
  report.history.restoredEdit = { before: ownerAfter, after: restoredEdit, undo: await read() }
  await gate('strict-restored-owner-fresh-input-full-undo', () =>
    assert.deepEqual(report.history.restoredEdit.undo, ownerAfter),
  )
  await history('redo')
  report.history.restoredEdit.redo = await read()
  await gate('strict-restored-owner-fresh-input-full-redo', () =>
    assert.deepEqual(report.history.restoredEdit.redo, restoredEdit),
  )
  await gate('invalid-input-rejected-before-owner-or-dom-mutation', async () => {
    const before = await read()
    for (const kind of ['id', 'missing-sheet', 'sheet-id', 'zero-rows', 'nan-columns', 'cell-data']) {
      const result = await page.evaluate((invalid) => {
        const api = window.univerAPI,
          snapshot = structuredClone(api.getActiveWorkbook().save())
        if (invalid === 'id') snapshot.id = 'other'
        if (invalid === 'missing-sheet') snapshot.sheetOrder = ['samples']
        if (invalid === 'sheet-id') snapshot.sheets.samples.id = 'other'
        if (invalid === 'zero-rows') snapshot.sheets.samples.rowCount = 0
        if (invalid === 'nan-columns') snapshot.sheets.samples.columnCount = NaN
        if (invalid === 'cell-data') snapshot.sheets.samples.cellData = []
        let message = ''
        try {
          window.asterCreate(document.getElementById('app'), false, snapshot)
        } catch (error) {
          message = error.message
        }
        return {
          message,
          sameOwner: api === window.univerAPI,
          roots: document.querySelectorAll('.custom-event-demo').length,
        }
      }, kind)
      assert.match(result.message, /both original sheet IDs/)
      assert.equal(result.sameOwner, true)
      assert.equal(result.roots, 1)
    }
    assert.deepEqual(await read(), before)
  })
  await gate('empty-same-id-snapshot-and-native-pointer-guard-fresh-input', async () => {
    const empty = await read()
    for (const sheet of Object.values(empty.sheets)) sheet.cellData = {}
    await page.evaluate((snapshot) => {
      window.asterPaint = []
      window.univerAPI.disposeUnit(snapshot.id)
      window.univerAPI.createWorkbook(snapshot)
    }, empty)
    await ready(true)
    assert.deepEqual(await read(), empty)
    await context(85, 32, 'A1', false)
    await context(215, 56, 'B2', true)
    const before = await read()
    await nativeDelete(410)
    assert.deepEqual(await read(), before)
    await keyboard('Empty sheet note')
    assert.equal((await read()).sheets.samples.cellData[1][1].v, 'Empty sheet note')
    await capture('empty-native-input')
  })
  for (const width of [760, 390, 320])
    await gate(`narrow-${width}-keyboard-subscription-control-and-native-adapter`, async () => {
      await page.setViewportSize({ width, height: 1000 })
      await page.getByRole('button', { name: 'Remove guard listener', exact: true }).focus()
      await page.keyboard.press('Enter')
      await page.getByRole('button', { name: 'Restore guard listener', exact: true }).waitFor()
      await page.keyboard.press('Enter')
      await page.getByRole('button', { name: 'Remove guard listener', exact: true }).waitFor()
      await context(85, 32, 'A1', false)
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
    await gate(`initial-${locale}-complete-pack-native-menu-and-host-language`, async () => {
      leaves(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import(`@univerjs/preset-sheets-core/locales/${locale}`)).default,
      )
      await page.getByRole('tab', { name: locale === 'zh-CN' ? '开始' : 'Start', exact: true }).waitFor()
      await page
        .getByRole('button', { name: locale === 'zh-CN' ? '移除保护监听器' : 'Remove guard listener', exact: true })
        .waitFor()
      await grid.click({ button: 'right', position: { x: 215, y: 56 } })
      await page
        .getByText(locale === 'zh-CN' ? '复制' : 'Copy', { exact: true })
        .filter({ visible: true })
        .last()
        .waitFor()
      assert.equal((await log()).at(-1), locale === 'zh-CN' ? 'B2: 允许菜单' : 'B2: menu allowed')
      await page.keyboard.press('Escape')
      await settle()
      await capture(`initial-${locale}`)
    })
    await page.unrouteAll({ behavior: 'wait' })
  }
  await gate('active-double-disposal-removes-owner-native-dom-and-host-events', async () => {
    await page.evaluate(() => {
      window.asterController.dispose()
      window.asterController.dispose()
    })
    assert.equal(await page.locator('.custom-event-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
  })
  await gate('pending-startup-double-disposal-no-late-pointer-bind-or-owner', async () => {
    const state = await page.evaluate(() => {
      const pending = window.asterCreate(document.getElementById('app'))
      const stage = pending.univerAPI.getCurrentLifecycleStage(),
        rendered = pending.univerAPI.Enum.LifecycleStages.Rendered
      pending.dispose()
      pending.dispose()
      return { stage, rendered }
    })
    assert.ok(state.stage < state.rendered)
    await page.waitForTimeout(3500)
    assert.equal(await page.locator('.custom-event-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
    return state
  })
  await new Promise((resolve) => server.httpServer.close(resolve))
  server = await vite.preview({
    root: project,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  await page.goto('http://127.0.0.1:4412')
  await ready()
  await gate('normal-selected-export-source-css-native-menu-and-pagehide', async () => {
    for (const [name, content] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(project, name.slice(1)), 'utf8'), content, name)
    assert.ok(await page.evaluate(() => !window.asterController && window.asterPaint.includes('AS-021')))
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((node) => getComputedStyle(node).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await context(85, 32, 'A1', false)
    await context(215, 56, 'B2', true)
    await nativeDelete(410)
    assert.equal(await columns(), 8)
    await capture('normal-production-cover')
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    assert.equal(await page.locator('.custom-event-demo,canvas').count(), 0)
    return { sourceFiles: Object.keys(source.files).length, startupOverlayAbsent: true }
  })
  await gate('no-runtime-errors-or-backend', () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
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
