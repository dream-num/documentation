/* eslint-disable no-await-in-loop -- Exercise dependent examples in their documented order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/harbor-native')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/cross-unit-formula/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 6)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1050 } })
page.setDefaultTimeout(15000)
const report = { passed: false, checks: [], gates: {}, errors: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
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
await page.addInitScript(() => {
  window.docFrames = new Map()
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect
  const drawImage = CanvasRenderingContext2D.prototype.drawImage
  // The native document renderer caches text on offscreen canvases before composition.
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const texts = window.docFrames.get(this.canvas) || []
    // Preserve repeated letters. A self-copy must not concatenate its own log;
    // retain only recent paint records when cache composition repeats a frame.
    if (source !== this.canvas) {
      window.docFrames.set(this.canvas, texts.concat(window.docFrames.get(source) || []).slice(-50000))
    }
    return Reflect.apply(drawImage, this, [source, ...args])
  }
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.docFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const frame = window.docFrames.get(this.canvas) || []
    frame.push(String(args[0]))
    if (frame.length > 50000) frame.splice(0, frame.length - 50000)
    window.docFrames.set(this.canvas, frame)
    return Reflect.apply(fill, this, args)
  }
})

const root = page.locator('.harbor-fare-formula')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const snapshot = () =>
  page.evaluate(() =>
    Object.fromEntries(
      ['budget', 'source'].map((id) => [
        id,
        JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('harbor-fare-' + id).save())),
      ]),
    ),
  )
const value = (sheet, cell, expected) =>
  page.waitForFunction(
    (target) =>
      window.univerAPI
        .getWorkbook('harbor-fare-budget')
        .getSheetByName(target.sheet)
        .getRange(target.cell)
        .getRawValue() === target.expected,
    { sheet, cell, expected },
  )
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
    const cancel = page.getByRole('button', { name: 'CANCEL', exact: true })
    if (await cancel.isVisible()) await cancel.click()
  }
}
function includesPack(actual, pack, prefix = '') {
  for (const [key, wanted] of Object.entries(pack)) {
    if (wanted && typeof wanted === 'object') includesPack(actual?.[key], wanted, prefix + key + '.')
    else assert.deepEqual(actual?.[key], wanted, prefix + key)
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4348', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.harbor-fare-formula')
      return r?.dataset.ready || r?.dataset.error
    },
    {},
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  report.initial = await snapshot()
  report.descriptors = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'harbor-fare-budget' }).map((e) => e.getDescriptor()),
  )
  assert.equal(report.descriptors.length, 1)
  assert.equal(report.descriptors[0].entry, 'sheets-floating-object')
  assert.equal(report.descriptors[0].context.resolved, true)
  assert.equal(await root.locator('iframe,fieldset,details,[data-action]').count(), 0)
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  assert.ok(await root.locator('[data-u-comp="ribbon-grid-toolbar"]').count())
  await page.screenshot({ path: path.join(directory, 'overview.png') })
  await gate('passive-float-readable-content', async () => {
    const capture = await root.locator('[data-u-comp="embed-float-dom"]').screenshot()
    report.passiveColorSamples = await page.evaluate(async (data) => {
      const img = new Image()
      img.src = 'data:image/png;base64,' + data
      await img.decode()
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const pixels = ctx.getImageData(0, 0, c.width, c.height).data
      let colored = 0
      for (let y = 16; y < c.height - 16; y += 6)
        for (let x = 16; x < c.width - 16; x += 6) {
          const i = (y * c.width + x) * 4
          const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]]
          if (Math.max(...rgb) - Math.min(...rgb) > 25) colored++
        }
      return colored
    }, capture.toString('base64'))
    assert.ok(
      report.passiveColorSamples > 10,
      'Inactive source should show authored navy/sand content, not a blank white rectangle',
    )
  })
  await gate('opening-native-formulas', async () => {
    await value('Budget', 'D15', 922.5)
    await value('Budget', 'D12', 2525)
    await value('Budget', 'B12', 516)
    await value('Reference lab', 'B5', 4)
    await value('Reference lab', 'B6', 31)
    await value('Reference lab', 'B8', '#N/A')
    await value('Reference lab', 'B9', 2)
    report.checks.push(
      'Two real workbooks; external cell/range/VLOOKUP, transitive calculation and a native missing-source error',
    )
  })
  const expected = [1003.5, 1084.5, '#VALUE!', 1084.5, 4.5, 7]
  for (let i = 0; i < examples.length; i++) {
    await gate('literal-example-' + (i + 1), async () => {
      const before = await snapshot()
      await page.evaluate('(() => {\n' + examples[i] + '\n})()')
      await value(i < 4 ? 'Budget' : 'Reference lab', i < 4 ? 'D15' : i === 4 ? 'B8' : 'B5', expected[i])
      const after = await snapshot()
      if (i === 1 || i >= 4) assert.deepEqual(after.source, before.source, 'Host edit must not mutate source workbook')
      if ([0, 2, 3].includes(i)) {
        for (let row = 4; row <= 9; row++)
          assert.deepEqual(
            after.budget.sheets.budget.cellData[row][1],
            before.budget.sheets.budget.cellData[row][1],
            'Source edit preserves host pass counts',
          )
      }
      report.checks.push('README literal ' + (i + 1) + ' produces ' + expected[i])
    })
  }
  await fs.writeFile(path.join(directory, 'after-examples.json'), JSON.stringify(await snapshot(), null, 2))
  await gate('native-source-fullscreen', async () => {
    const float = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="harbor-fare-source-float"]')
    await float.dblclick({ position: { x: 180, y: 90 } })
    await page
      .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="harbor-fare-source-float"]')
      .getByRole('button', { name: 'Enter fullscreen', exact: true })
      .click()
    await shell.waitFor()
    await settle()
    await page.screenshot({ path: path.join(directory, 'source-fullscreen.png') })
    await gate('native-source-keyboard-and-history', async () => {
      const point = await page.evaluate(() => {
        const s = window.univerAPI.getWorkbook('harbor-fare-source').save().sheets.fares
        const b = document
          .querySelector('[data-embed-fullscreen-shell="true"] [data-embed-canvas-root="true"] canvas')
          .getBoundingClientRect()
        return {
          x: b.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w + s.columnData[2].w / 2) * s.zoomRatio,
          y: b.y + (s.columnHeader.height + s.rowData[0].h + 3.5 * s.defaultRowHeight) * s.zoomRatio,
        }
      })
      await page.mouse.click(point.x, point.y)
      const before = await snapshot()
      await page.keyboard.type('4.75')
      await page.keyboard.press('Enter')
      report.afterNativeTyping = await snapshot()
      assert.deepEqual(
        report.afterNativeTyping.budget.sheets.budget.cellData[4][2].f,
        before.budget.sheets.budget.cellData[4][2].f,
        'Source keyboard edit must not overwrite the host VLOOKUP formula',
      )
      await value('Budget', 'D15', 1129.5)
      const after = await snapshot()
      await page.keyboard.press('Control+z')
      await value('Budget', 'D15', 1084.5)
      assert.deepEqual(await snapshot(), before, 'Native source Undo preserves both complete workbook snapshots')
      await page.keyboard.press('Control+y')
      await value('Budget', 'D15', 1129.5)
      assert.deepEqual(await snapshot(), after, 'Native source Redo preserves both complete workbook snapshots')
      await page.screenshot({ path: path.join(directory, 'source-typed.png') })
    })
    await gate('source-native-print', async () => {
      await page.evaluate(() =>
        window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
          window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
        }),
      )
      await shell.locator('[data-u-command="sheet.menu.print"]').click()
      await page.getByRole('menuitem', { name: 'Print', exact: true }).click()
      const cancel = page.getByRole('button', { name: 'CANCEL', exact: true })
      await cancel.waitFor()
      assert.deepEqual(await page.evaluate(() => window.printSource), {
        workbook: 'harbor-fare-source',
        sheet: 'fares',
      })
      await page.waitForFunction(
        () =>
          [...window.docFrames.entries()].some(
            ([canvas, texts]) =>
              canvas.isConnected &&
              !canvas.closest('.harbor-fare-formula') &&
              texts.join('').replaceAll(' ', '').includes('HARBOR') &&
              texts.join('').replaceAll(' ', '').includes('SINGLE'),
          ),
        {},
        { timeout: 25000 },
      )
      await page.screenshot({ path: path.join(directory, 'source-print.png') })
      await cancel.click()
      await cancel.waitFor({ state: 'detached' })
    })
    const close = page.locator('[data-embed-fullscreen-close="true"]')
    if (await close.isVisible()) await close.click()
    await shell.waitFor({ state: 'detached' })
    await settle()
  })
  // Isolate the remaining gates from the deliberately strict native source checks.
  await page.reload({ waitUntil: 'domcontentloaded' })
  await root.locator(':scope').waitFor()
  await page.waitForFunction(() => document.querySelector('.harbor-fare-formula')?.dataset.ready)
  await gate('complete-locale-packs-and-themes', async () => {
    const factory = await fs.readFile('showcase/embed/cross-unit-formula/code/create-demo.ts', 'utf8')
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 18)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      await gate(locale + '-complete-model-theme-preservation', async () => {
        const before = await snapshot()
        for (const dark of [true, false]) {
          await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
          await settle()
        }
        assert.deepEqual(await snapshot(), before)
      })
      await page.screenshot({ path: path.join(directory, locale + '-native.png') })
      report.checks.push({ locale, completePacks: packs.length })
    }
    await page.evaluate(() => window.univerAPI.setLocale('enUS'))
  })
  await gate('native-host-worksheets', async () => {
    for (const name of ['Sensitivity', 'Reference lab', 'Budget']) {
      await root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name }).click()
      await settle()
      assert.equal(
        await page.evaluate(() => window.univerAPI.getWorkbook('harbor-fare-budget').getActiveSheet().getSheetName()),
        name,
      )
      await page.screenshot({ path: path.join(directory, name.replaceAll(' ', '-') + '.png') })
    }
    report.passiveFloat = await root.locator('[data-u-comp="embed-float-dom"]').evaluate((e) => ({
      html: e.outerHTML,
      canvases: [...e.querySelectorAll('canvas')].map((c) => ({
        width: c.width,
        height: c.height,
        rect: c.getBoundingClientRect().toJSON(),
      })),
    }))
  })
  await gate('selected-disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  assert.ok(Object.values(report.gates).every((g) => g.passed))
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.diagnostic = await snapshot().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      { ...report, initial: undefined, diagnostic: undefined, afterNativeTyping: undefined, passiveFloat: undefined },
      null,
      2,
    ),
  )
  await browser.close()
}
if (!report.passed) process.exitCode = 1
