/* eslint-disable no-await-in-loop -- Native actions and literal examples require ordered observations. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheets-notes-native')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, gates: {}, errors: [], backendRequests: [], warnings: [] }
const note = (data, sheet = 'intake', row = 1, col = 1) =>
  JSON.parse(data.resources.find((r) => r.name === 'SHEET_NOTE_PLUGIN').data)[sheet]?.[row]?.[col]
function includesPack(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') includesPack(actual[key], value)
    else assert.equal(actual[key], value)
  }
}
let browser, server
try {
  const exported = (await readShowcaseSources()).find((c) => c.slug === 'sheets/notes')
  const project =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-sheets-notes-native-')))
  for (const [name, source] of Object.entries(exported.files)) {
    const target = path.join(project, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, source)
    assert.equal(await fs.readFile(target, 'utf8'), source)
  }
  const manifest = JSON.parse(exported.files['/package.json'])
  report.dependencyVersions = {}
  for (const [name, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
    const installed =
      name === 'vite'
        ? process.env.SHOWCASE_VITE_DIR || path.resolve('node_modules/vite')
        : path.resolve('node_modules', name)
    assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version)
    const target = path.join(project, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    if (!(await fs.lstat(target).catch(() => null))) await fs.symlink(await fs.realpath(installed), target, 'junction')
    report.dependencyVersions[name] = version
  }
  report.sourceFiles = Object.keys(exported.files).length
  await fs.writeFile(
    path.join(directory, 'exports.json'),
    JSON.stringify([{ slug: exported.slug, directory: project }], null, 2),
  )
  const vite = await import(
    pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js'))
  )
  await vite.build({ root: project, configFile: false, logLevel: 'warn' })
  server = await vite.preview({
    root: project,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
  page.setDefaultTimeout(7000)
  page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') report.errors.push(m.text())
    if (m.type() === 'warning') report.warnings.push(m.text())
  })
  page.on('request', (r) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
      r.url().includes('/universer-api/') ||
      (['fetch', 'xhr'].includes(r.resourceType()) && !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname))
    )
      report.backendRequests.push(r.url())
  })
  page.on('websocket', (s) => report.backendRequests.push(s.url()))
  const root = page.locator('.notes-demo'),
    popup = page.locator('[data-u-comp="note-textarea"]:visible'),
    canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const run = (code) => page.evaluate('(async () => {\n' + code + '\n})()')
  const snapshot = () => run('return JSON.parse(JSON.stringify(window.univerAPI.getActiveWorkbook().save()))')
  const settle = async () => {
    await page.waitForTimeout(400)
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  }
  const shot = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
  async function ready() {
    await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 90000 })
    await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
    await popup.first().waitFor()
    await page.waitForFunction(
      () => document.querySelector('[data-u-comp="note-textarea"]')?.value === 'Humidity check before unpacking.',
    )
    await settle()
  }
  async function fresh() {
    await page.goto('http://127.0.0.1:4412')
    await ready()
  }
  async function gate(name, fn) {
    try {
      report.gates[name] = { passed: true, result: await fn() }
    } catch (e) {
      report.gates[name] = { passed: false, error: e.stack || String(e) }
      await shot(name + '-FAIL').catch(() => {})
    }
    await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  }
  async function history(key) {
    await canvas.click({ position: { x: 100, y: 76 } })
    await page.keyboard.press('Control+z')
    await settle()
    report[key].undo = await snapshot()
    report[key].undoPopup = await popup.first().inputValue()
    await shot(key + '-undo')
    await page.keyboard.press('Control+y')
    await settle()
    report[key].redo = await snapshot()
    report[key].redoPopup = await popup.first().inputValue()
    assert.deepEqual(report[key].undo, report[key].before)
    assert.deepEqual(report[key].redo, report[key].after)
  }
  await fresh()
  await gate('original-business-native-paint', async () => {
    report.original = await snapshot()
    assert.equal(report.original.id, 'riverside-textiles')
    assert.deepEqual(report.original.sheetOrder, ['intake', 'storage'])
    assert.equal(note(report.original).id, 'linen-humidity')
    assert.equal(note(report.original, 'intake', 2, 1).id, 'silk-light')
    assert.equal(note(report.original, 'intake', 3, 2).id, 'lining-boundary')
    assert.equal(note(report.original, 'storage').id, 'box-monitor')
    assert.equal(report.original.sheets.intake.cellData[4][3].v, 0)
    assert.equal(await root.locator(':scope > section, :scope > aside, :scope > pre, :scope > button').count(), 0)
    const colors = await canvas.evaluate((c) => {
      const bytes = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let teal = 0,
        ink = 0
      for (let i = 0; i < bytes.length; i += 4) {
        if (bytes[i] === 204 && bytes[i + 1] === 251 && bytes[i + 2] === 241) teal++
        if (bytes[i] < 100 && bytes[i + 1] < 100 && bytes[i + 2] < 100 && bytes[i + 3]) ink++
      }
      return { teal, ink }
    })
    assert.ok(colors.teal > 1000 && colors.ink > 1000, JSON.stringify(colors))
    assert.equal(await popup.first().inputValue(), note(report.original).note)
    await shot('baseline')
    return { colors, noSkeleton: true }
  })
  await gate('native-text-edit-model-and-pixels', async () => {
    report.nativeText = {
      before: await snapshot(),
      beforePixels: (await popup.first().screenshot()).toString('base64'),
    }
    await popup.first().fill('Humidity 47%; native conservator edit.\n复查 in 24 hours.')
    await page.waitForFunction(() =>
      window.univerAPI
        .getActiveWorkbook()
        .getSheetBySheetId('intake')
        .getRange('B2')
        .getNote()
        .note.includes('Humidity 47%'),
    )
    report.nativeText.after = await snapshot()
    assert.equal(note(report.nativeText.after).id, 'linen-humidity')
    assert.equal(await popup.first().inputValue(), note(report.nativeText.after).note)
    assert.notEqual((await popup.first().screenshot()).toString('base64'), report.nativeText.beforePixels)
    delete report.nativeText.beforePixels
    await shot('native-text')
  })
  await gate('native-text-complete-history', () => history('nativeText'))
  await gate('native-text-history-visible-popup', async () => {
    assert.equal(report.nativeText.undoPopup, note(report.nativeText.before).note)
    assert.equal(report.nativeText.redoPopup, note(report.nativeText.after).note)
  })
  await fresh()
  await gate('native-resize-model-and-actual-layout', async () => {
    const bounds = await popup.first().boundingBox()
    report.nativeResize = { before: await snapshot(), beforeBounds: bounds }
    await page.mouse.move(bounds.x + bounds.width - 3, bounds.y + bounds.height - 3)
    await page.mouse.down()
    await page.mouse.move(bounds.x + bounds.width + 77, bounds.y + bounds.height + 47, { steps: 16 })
    await page.mouse.up()
    await settle()
    report.nativeResize.after = await snapshot()
    report.nativeResize.afterBounds = await popup.first().boundingBox()
    assert.ok(note(report.nativeResize.after).width > note(report.nativeResize.before).width)
    assert.ok(note(report.nativeResize.after).height > note(report.nativeResize.before).height)
    assert.equal(report.nativeResize.afterBounds.width, note(report.nativeResize.after).width)
    assert.equal(report.nativeResize.afterBounds.height, note(report.nativeResize.after).height)
    await shot('native-resize')
  })
  await gate('native-resize-complete-history', async () => {
    await history('nativeResize')
  })
  await gate('native-resize-undo-visible-layout', async () => {
    await run('window.univerAPI.getActiveWorkbook().undo()')
    await settle()
    report.nativeResize.undoBounds = await popup.first().boundingBox()
    assert.equal(report.nativeResize.undoBounds.width, note(report.nativeResize.before).width)
    assert.equal(report.nativeResize.undoBounds.height, note(report.nativeResize.before).height)
  })
  await fresh()
  const examples = [...exported.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1])
  assert.equal(examples.length, 25)
  report.literalCount = examples.length
  for (let i = 0; i < examples.length; i++) {
    await gate('literal-' + (i + 1), async () => {
      const before = await snapshot()
      if (i === 13) {
        await assert.rejects(run(examples[i]), /Enter non-empty note text/)
        assert.deepEqual(await snapshot(), before)
        return 'Expected application rejection; no mutation'
      }
      await run(examples[i])
      await settle()
      if (i === 24) {
        await ready()
        assert.deepEqual(await snapshot(), report.original)
        return
      }
      const after = await snapshot()
      if ([2, 7].includes(i)) assert.equal(note(after).show, false)
      if ([3, 8].includes(i)) {
        assert.equal(note(after).show, true)
        await popup.first().waitFor()
      }
      if (i === 4) {
        assert.equal(note(after).note, 'Humidity 48%; inspected by River team.\n复查 tomorrow.')
        report.directText = { before, after, popup: await popup.first().inputValue() }
        await shot('facade-text-live')
      }
      if (i === 5) {
        assert.equal(note(after).width, 320)
        assert.equal(note(after).height, 180)
        report.directSize = { after, popup: await popup.first().boundingBox() }
        await shot('facade-size-live')
      }
      if (i === 6) assert.equal(note(after).width, 220)
      if (i === 9) {
        assert.equal(note(after, 'intake', 2, 1).note, 'Covered storage until Friday.\nNo direct sunlight.')
        assert.deepEqual(note(after, 'intake', 3, 2), note(before, 'intake', 3, 2))
      }
      if (i === 10) {
        assert.equal(note(after, 'intake', 2, 1), undefined)
        assert.deepEqual(note(after, 'intake', 3, 2), note(before, 'intake', 3, 2))
      }
      if (i === 11) {
        assert.equal(note(after, 'intake', 5, 4).note, 'Mount reserved — no object assigned yet.')
        assert.equal(after.sheets.intake.cellData[5]?.[4]?.v, undefined)
      }
      if ([12, 14].includes(i)) assert.equal(note(after, 'intake', 5, 4), undefined)
      if (i === 16) {
        assert.equal(note(after, 'storage').show, true)
        assert.equal(await popup.first().inputValue(), note(after, 'storage').note)
        await shot('storage-native')
      }
      if (i === 17) assert.equal(note(after, 'storage').show, false)
      if (i === 19) {
        report.saved = after
        report.events = await run('return window.riversideEvents')
      }
      if ([20, 22].includes(i)) {
        assert.equal(after.id, report.saved.id)
        report[i === 20 ? 'reloaded' : 'restored'] = after
        assert.deepEqual(after.sheets.intake.cellData, report.saved.sheets.intake.cellData)
        assert.deepEqual(note(after), note(report.saved))
      }
      if (i === 21) {
        assert.equal(after.id, report.saved.id)
        assert.equal(await popup.count(), 0)
        assert.deepEqual(after.sheets.intake.cellData, {})
        await shot('empty')
      }
      if (i === 23) assert.equal(await run('return window.riversideSubscriptions.length'), 0)
      if (i < 19) {
        assert.deepEqual(after.sheets.intake.cellData, report.original.sheets.intake.cellData)
        assert.deepEqual(after.sheets.storage.cellData, report.original.sheets.storage.cellData)
      }
    })
  }
  await gate('direct-text-live-popup', async () =>
    assert.equal(report.directText.popup, note(report.directText.after).note),
  )
  await gate('direct-size-live-popup', async () => {
    assert.equal(report.directSize.popup.width, 320)
    assert.equal(report.directSize.popup.height, 180)
  })
  await gate('same-id-reload-full-snapshot', async () => assert.deepEqual(report.reloaded, report.saved))
  await gate('empty-restore-full-snapshot', async () => assert.deepEqual(report.restored, report.saved))
  await gate('literal-events-real-payloads', async () => {
    assert.deepEqual(
      [...new Set(report.events.map((e) => e.name))].toSorted(),
      ['SheetNoteAdd', 'SheetNoteDelete', 'SheetNoteHide', 'SheetNoteShow', 'SheetNoteUpdate'].toSorted(),
    )
    assert.ok(report.events.some((e) => e.sheet === 'storage' && e.row === 1 && e.col === 1))
    assert.ok(report.events.some((e) => e.name === 'SheetNoteAdd' && e.row === 5 && e.col === 4))
  })
  await fresh()
  await gate('direct-write-complete-history', async () => {
    report.directHistory = { before: await snapshot() }
    await run(examples[4])
    await settle()
    report.directHistory.after = await snapshot()
    await history('directHistory')
  })
  await fresh()
  await gate('native-hover-unpinned-popup', async () => {
    await run(examples[2])
    await page.mouse.move(1100, 800)
    await settle()
    assert.equal(await popup.count(), 0)
    await canvas.hover({ position: { x: 260, y: 76 } })
    await popup.first().waitFor()
    await settle()
    assert.equal(await popup.first().inputValue(), note(await snapshot()).note)
    assert.equal(note(await snapshot()).show, false)
    await shot('native-hover')
  })
  await fresh()
  await gate('native-context-menu-and-sheet-tabs', async () => {
    await canvas.click({ position: { x: 260, y: 108 }, button: 'right' })
    await settle()
    await shot('native-context-menu')
    assert.match(await page.locator('body').innerText(), /note/i)
    await page.keyboard.press('Escape')
    await page.getByText('Storage', { exact: true }).last().click()
    await settle()
    assert.equal(await run('return window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId()'), 'storage')
    await page.getByText('Intake', { exact: true }).last().click()
    await settle()
    assert.equal(await run('return window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId()'), 'intake')
  })
  await fresh()
  await gate('native-context-pin-note', async () => {
    report.nativePin = { before: await snapshot() }
    await canvas.click({ position: { x: 260, y: 108 }, button: 'right' })
    await page.getByText('Show/Hide Note', { exact: true }).click()
    await page.mouse.move(1100, 800)
    await settle()
    report.nativePin.after = await snapshot()
    assert.equal(note(report.nativePin.after, 'intake', 2, 1).show, true)
    assert.ok(
      (await popup.evaluateAll((elements) => elements.map((element) => element.value))).includes(
        note(report.nativePin.after, 'intake', 2, 1).note,
      ),
    )
    await shot('native-pin')
  })
  await gate('native-context-pin-complete-history', async () => {
    await canvas.click({ position: { x: 100, y: 76 } })
    await page.keyboard.press('Control+z')
    await settle()
    report.nativePin.undo = await snapshot()
    await page.keyboard.press('Control+y')
    await settle()
    report.nativePin.redo = await snapshot()
    assert.deepEqual(report.nativePin.undo, report.nativePin.before)
    assert.deepEqual(report.nativePin.redo, report.nativePin.after)
  })
  await fresh()
  await gate('native-context-delete-note', async () => {
    report.nativeDelete = { before: await snapshot() }
    await canvas.click({ position: { x: 260, y: 108 }, button: 'right' })
    await page.getByText('Delete Note', { exact: true }).click()
    await settle()
    report.nativeDelete.after = await snapshot()
    assert.equal(note(report.nativeDelete.after, 'intake', 2, 1), undefined)
    assert.deepEqual(note(report.nativeDelete.after, 'intake', 3, 2), note(report.nativeDelete.before, 'intake', 3, 2))
    await shot('native-delete')
  })
  await gate('native-context-delete-complete-history', async () => {
    await page.keyboard.press('Control+z')
    await settle()
    report.nativeDelete.undo = await snapshot()
    await page.keyboard.press('Control+y')
    await settle()
    report.nativeDelete.redo = await snapshot()
    assert.deepEqual(report.nativeDelete.undo, report.nativeDelete.before)
    assert.deepEqual(report.nativeDelete.redo, report.nativeDelete.after)
  })
  await fresh()
  await gate('same-owner-theme-keeps-edits', async () => {
    await run('window.riversideOwner = window.univerAPI; window.riversideModel = window.univerAPI.getActiveWorkbook()')
    await run(examples[4])
    const before = await snapshot()
    await run('window.univerAPI.toggleDarkMode(true)')
    await settle()
    await shot('dark')
    await run('window.univerAPI.toggleDarkMode(false)')
    await settle()
    assert.deepEqual(await snapshot(), before)
    assert.equal(await run('return window.riversideOwner === window.univerAPI'), true)
    assert.deepEqual(await run('return JSON.parse(JSON.stringify(window.riversideModel.save()))'), before)
  })
  await gate('initial-chinese-complete-packs-official-css', async () => {
    await page.route('http://127.0.0.1:4412/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, '<html lang="zh-CN">') })
    })
    await fresh()
    await page.getByText('开始', { exact: true }).first().waitFor()
    assert.match(await popup.first().getAttribute('placeholder'), /[\u4e00-\u9fff]/)
    await canvas.click({ position: { x: 260, y: 108 }, button: 'right' })
    await settle()
    await shot('initial-zh')
    assert.match(await page.locator('body').innerText(), /删除批注/)
    assert.doesNotMatch(await page.locator('body').innerText(), /sheets-note-ui\./)
    await page.keyboard.press('Escape')
    const factory = exported.files['/src/create-demo.ts'],
      packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 2)
    assert.equal([...factory.matchAll(/^import '.+\/lib\/index.css'/gm)].length, 2)
    const before = await snapshot()
    for (const [lang, locale] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((value) => window.univerAPI.setLocale(value), locale)
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + lang)).default)
      assert.deepEqual(await snapshot(), before)
    }
  })
  await gate('dispose-owner', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    assert.equal(await run('return typeof window.univerAPI'), 'undefined')
  })
  await gate('no-backend-or-runtime-errors', async () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.fatal = e.stack || String(e)
} finally {
  await browser?.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        directory,
        passed: report.passed,
        fatal: report.fatal,
        gates: Object.fromEntries(Object.entries(report.gates).map(([k, v]) => [k, v.passed])),
      },
      null,
      2,
    ),
  )
  if (!report.passed) process.exitCode = 1
}
