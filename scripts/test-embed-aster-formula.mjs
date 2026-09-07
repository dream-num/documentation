/* eslint-disable no-await-in-loop -- Run the published examples in their documented order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-aster-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheet-to-traditional-doc/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 9)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(15000)
const report = { passed: false, checks: [], results: [], knownIssues: [], errors: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
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
  window.docFrames = new Map()
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect
  const drawImage = CanvasRenderingContext2D.prototype.drawImage
  // The native document renderer caches text on offscreen canvases before composition.
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const texts = window.docFrames.get(this.canvas) || []
    texts.push(...(window.docFrames.get(source) || []))
    window.docFrames.set(this.canvas, texts)
    return Reflect.apply(drawImage, this, [source, ...args])
  }
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.docFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const frame = window.docFrames.get(this.canvas) || []
    frame.push(String(args[0]))
    window.docFrames.set(this.canvas, frame)
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.aster-embed')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const body = () => page.evaluate(() => window.univerAPI.getDocument('aster-research-report').save().body)
const source = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('aster-observation-source').save())))
const results = () =>
  page.evaluate(() =>
    window.univerAPI
      .getDocument('aster-research-report')
      .getFormulas()
      .map((f) => f.getResult()),
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const baseline = [5, 42.5, 8.5, 8.5, 7.5, 9.5, 8.5, 0.6, 8.5, 0]
const scenarios = [
  [5, 45, 9, 9, 8, 10, 8.5, 0.8, 9, 0.5],
  [5, 45, 9, 9, 8, 10, 9, 0.6, 9, 0],
  [4, 37, 9.25, 9.25, 8.5, 10, 9, 0.75, 9.25, 0.25],
  [5, 37, 7.4, 9, 0, 10, 9, 0.6, 7.4, -1.6],
  [4, 37, 9.25, 9.25, 8.5, 10, 9, 0.75, 9.25, 0.25],
  [0, 0, '#DIV/0!', '#NUM!', 0, 0, 9, '#DIV/0!', '#DIV/0!', '#DIV/0!'],
  baseline,
  baseline,
  baseline,
]
async function values(expected) {
  await page.waitForFunction(
    (wanted) => {
      const actual = window.univerAPI
        .getDocument('aster-research-report')
        .getFormulas()
        .map((f) => f.getResult())
      return (
        actual.length === 10 &&
        actual.every(
          (r, i) =>
            r &&
            !r.stale &&
            (typeof wanted[i] === 'number'
              ? r.status === 'success' && Math.abs(r.value - wanted[i]) < 1e-9
              : r.value === wanted[i]),
        )
      )
    },
    expected,
    { timeout: 30000 },
  )
  const actual = await results()
  for (const [i, value] of expected.entries()) {
    if (typeof value === 'string' && actual[i].status !== 'error')
      report.knownIssues.push({ gate: 'native-error-status', formulaIndex: i, expected: 'error', actual: actual[i] })
  }
  report.results.push(actual)
}
async function showChapter(chapter, name) {
  await page.mouse.move(1400, 500)
  await page.mouse.wheel(0, -20000)
  await settle()
  if (chapter === 2) {
    await page.mouse.wheel(0, 2350)
    await settle()
  }
  const all = await results()
  const texts = (chapter === 0 ? all.slice(0, 8) : all.slice(8)).map((r) => r.text)
  await page.waitForFunction(
    ({ targets, chapter: wantedChapter }) =>
      [...window.docFrames.entries()].some(([canvas, text]) => {
        const joined = text.join('')
        return (
          canvas.isConnected &&
          canvas.width > 700 &&
          joined.includes(wantedChapter === 0 ? 'ABSTRACT' : 'current mean') &&
          targets.every((value) => joined.includes(value))
        )
      }),
    { targets: texts, chapter },
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function expand() {
  if (await shell.count()) return
  const block = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="aster-sheet-block"]')
  for (let i = 0; i < 20; i++) {
    const rect = await block.boundingBox()
    assert.ok(rect)
    if (rect.y >= 180 && rect.y + 180 < 1000) break
    await page.mouse.move(1400, 500)
    await page.mouse.wheel(0, rect.y - 280)
    await settle()
  }
  const rect = await block.boundingBox()
  await page.mouse.dblclick(rect.x + 160, rect.y + 100)
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-embed-id="aster-sheet-block"][data-u-comp="embed-float-dom"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="aster-sheet-block"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await shell.waitFor()
  await settle()
}
async function collapse() {
  await shell.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
  await shell.waitFor({ state: 'detached' })
  await settle()
}
async function gate(name, run) {
  try {
    await run()
    report.checks.push({ gate: name, passed: true })
  } catch (error) {
    report.knownIssues.push({ gate: name, error: error.stack })
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
    if (await shell.count()) await collapse().catch(() => {})
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4290', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.aster-embed')
      return r?.dataset.ready || r?.dataset.error
    },
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  assert.equal(await root.locator('[data-u-comp="embed-float-dom"]').count(), 1)
  await values(baseline)
  const originalBody = await body()
  report.pagination = await page.evaluate(() => {
    const api = window.univerAPI,
      injector = api._injector,
      get = injector.get
    let manager
    injector.get = function (id, ...args) {
      const value = Reflect.apply(get, this, [id, ...args])
      if (id.decoratorName === 'engine-render.render-manager.service') manager = value
      return value
    }
    try {
      api.setCurrent('aster-research-report')
    } finally {
      injector.get = get
    }
    window.readAsterPages = () => {
      const doc = api.getDocument('aster-research-report').save()
      return manager
        .getRenderUnitById(doc.id)
        .mainComponent.getSkeleton()
        .getSkeletonData()
        .pages.map(({ pageWidth, pageHeight, st, ed }) => ({
          pageWidth,
          pageHeight,
          st,
          ed,
          text: doc.body.dataStream.slice(st, ed + 1),
        }))
    }
    return window.readAsterPages()
  })
  assert.equal(report.pagination.length, 3)
  for (const p of report.pagination) assert.deepEqual([p.pageWidth, p.pageHeight], [794, 1123])
  assert.ok(report.pagination[1].text.startsWith('02 /'))
  assert.ok(report.pagination[1].text.includes('\b'))
  assert.ok(report.pagination[2].text.startsWith('03 /'))
  await showChapter(0, 'baseline')
  await showChapter(2, 'interpretation')
  const sourceBlock = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="aster-sheet-block"]')
  await page.mouse.move(1400, 500)
  await page.mouse.wheel(0, (await sourceBlock.boundingBox()).y - 300)
  await settle()
  const sourceBounds = await sourceBlock.boundingBox()
  assert.ok(sourceBounds.y >= 160 && sourceBounds.y + sourceBounds.height < 1050)
  const tableWidth = await page.evaluate(() => {
    const sheet = window.univerAPI.getWorkbook('aster-observation-source').save().sheets.observations
    return (
      (sheet.rowHeader.width + [0, 1, 2, 3, 4].reduce((sum, i) => sum + sheet.columnData[i].w, 0)) * sheet.zoomRatio
    )
  })
  assert.ok(tableWidth <= sourceBounds.width, 'The target column fits the native embedded preview')
  await page.waitForFunction(() =>
    [...window.docFrames.entries()].some(
      ([canvas, text]) =>
        canvas.isConnected &&
        canvas.closest('[data-embed-id="aster-sheet-block"]') &&
        text.join('').includes('ASTER / Rebound observations'),
    ),
  )
  await page.screenshot({ path: path.join(directory, 'observation-chapter.png') })
  report.checks.push('Native embedded observation Sheet is painted and all input columns fit its preview')
  for (const [i, expected] of scenarios.entries()) {
    await page.evaluate(examples[i])
    await values(expected)
    assert.deepEqual(await body(), originalBody, 'Every authored body character, style and custom range is unchanged')
    assert.deepEqual(
      await page.evaluate(() => window.readAsterPages()),
      report.pagination,
      'Page boundaries and complete chapter contents remain unchanged',
    )
    await showChapter(0, 'example-' + (i + 1))
    await showChapter(2, 'interpretation-' + (i + 1))
    report.checks.push({ example: i + 1, expected, bodyAndPaginationPreserved: true })
  }
  const projection = await page.evaluate(() => {
    const doc = window.univerAPI.getDocument('aster-research-report')
    const before = doc.save()
    const display = doc.saveFormulaDisplayTextSnapshot()
    return { before, after: doc.save(), display }
  })
  assert.deepEqual(projection.after, projection.before)
  assert.ok(projection.display.body.dataStream.includes('42.50'))
  assert.equal(projection.display.body.dataStream.split('8.50').length - 1, 4)
  report.checks.push('Detached reading snapshot preserves live native bindings')
  await gate('native-source-keyboard-history', async () => {
    await expand()
    for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
      await shell.getByRole('tab', { name, exact: true }).click()
      assert.ok(await shell.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
    }
    await shell.getByRole('tab', { name: 'Start', exact: true }).click()
    const point = await page.evaluate(() => {
      const sheet = window.univerAPI.getWorkbook('aster-observation-source').save().sheets.observations
      const bounds = document
        .querySelector('[data-embed-fullscreen-shell="true"] [data-embed-canvas-root="true"] canvas')
        .getBoundingClientRect()
      const height = (i) => sheet.rowData[i]?.h || sheet.defaultRowHeight
      return {
        x: bounds.x + (sheet.rowHeader.width + sheet.columnData[0].w + sheet.columnData[1].w / 2) * sheet.zoomRatio,
        y:
          bounds.y +
          (sheet.columnHeader.height + [0, 1, 2, 3].reduce((sum, i) => sum + height(i), 0) + height(4) / 2) *
            sheet.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('aster-observation-source').getActiveRange()?.getA1Notation() === 'B5',
    )
    const before = await source()
    await page.keyboard.type('10')
    await page.keyboard.press('Enter')
    await values(scenarios[0])
    const edited = await source()
    await page.keyboard.press('Control+z')
    await values(baseline)
    assert.deepEqual(await source(), before)
    await page.keyboard.press('Control+y')
    await values(scenarios[0])
    assert.deepEqual(await source(), edited)
    assert.deepEqual(await body(), originalBody)
    await page.screenshot({ path: path.join(directory, 'native-source.png') })
    await collapse()
    await showChapter(0, 'native-summary')
    await showChapter(2, 'native-interpretation')
  })
  await gate('native-source-print-preview', async () => {
    await expand()
    await page.evaluate(() =>
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      }),
    )
    await shell.locator('[data-u-command="sheet.menu.print"]').click()
    await page.getByRole('menuitem', { name: 'Print', exact: true }).click()
    const cancel = page.getByRole('button', { name: 'CANCEL', exact: true })
    await cancel.waitFor()
    await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printSource), {
      workbook: 'aster-observation-source',
      sheet: 'observations',
    })
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await cancel.click()
  })
  await gate('active-source-disposal', async () => {
    await expand()
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    assert.equal(await shell.count(), 0)
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0
} catch (error) {
  report.failure = error.stack
  report.currentResults = await results().catch(() => [])
  report.canvasFrames = await page
    .evaluate(() =>
      [...window.docFrames.entries()].map(([canvas, text]) => ({
        connected: canvas.isConnected,
        width: canvas.width,
        height: canvas.height,
        text: text.join(''),
      })),
    )
    .catch(() => [])
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
