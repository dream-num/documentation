/* eslint-disable no-await-in-loop -- Run the published examples in their documented order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-cobalt-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-to-traditional-doc/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 20)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(15000)
const report = {
  passed: false,
  checks: [],
  results: [],
  knownIssues: [],
  errors: [],
  warnings: [],
  backendRequests: [],
}
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
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
  window.basePoints = []
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
    if (this.canvas.closest('[data-embed-fullscreen-shell="true"]')) {
      const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
      const bounds = this.canvas.getBoundingClientRect()
      if (bounds.width > 300)
        window.basePoints.push({
          text: String(args[0]),
          x: bounds.x + (point.x * bounds.width) / this.canvas.width,
          y: bounds.y + (point.y * bounds.height) / this.canvas.height,
        })
    }
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.cobalt-embed')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const body = () => page.evaluate(() => window.univerAPI.getDocument('cobalt-operating-review').save().body)
const source = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('cobalt-revenue-plan').save())))
const results = () =>
  page.evaluate(() =>
    window.univerAPI
      .getDocument('cobalt-operating-review')
      .getFormulas()
      .map((f) => f.getResult()),
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

const sum = (a) => a.reduce((n, v) => n + (typeof v === 'number' ? v : 0), 0)
// Independent test oracle; never imported by the runtime.
function expected(
  revenues = [24000, 28000, 34000],
  costs = [18500, 14200, 9700, 15100, 3200],
  target = 0.3,
  allIncluded = false,
) {
  const revenue = sum(revenues),
    included = sum(costs.slice(0, allIncluded ? 5 : 4)),
    balance = revenue - included
  const ratio = revenue ? balance / revenue : '#DIV/0!',
    headroom = balance - revenue * target
  return [
    revenue,
    included,
    balance,
    ratio,
    5,
    allIncluded ? 5 : 4,
    allIncluded ? 0 : costs[4],
    revenue,
    included,
    balance,
    target,
    typeof ratio === 'number' ? ratio - target : ratio,
    headroom,
    headroom >= 0 ? 'Room within the scenario' : 'Revisit the assumptions',
  ]
}
const baseline = expected()
const scenarios = [
  expected([26000, 28000, 34000]),
  expected([26000, 28000, 34000], [18500, 15700, 9700, 15100, 3200]),
  expected([26000, 28000, 34000], [18500, 15700, 9700, 15100, 3200], 0.4),
  expected([26000, 28000, 34000], [18500, 15700, 9700, 15100, 6000], 0.4),
  expected([26000, 28000, 34000], [18500, 15700, 9700, 15100, 6000], 0.4, true),
  expected([26000, 28000, 34000], [18500, 15700, 9700, 15100, 6000], 0.4, true),
  expected([26000, 28000, 34000], [18500, 15700, 9700, 15100, 6000], 0.4, true),
  expected([26000, 28000, 34000], [18500, 15700, 10700, 15100, 6000], 0.4, true),
  expected([26000, 28000, 34000], [18500, 15700, 10700, null, 6000], 0.4, true),
  expected([26000, 28000, 34000], [18500, 15700, 10700, 0, 6000], 0.4, true),
  expected([26000, 'pending', 34000], [18500, 15700, 10700, 0, 6000], 0.4, true),
  baseline,
  baseline,
  expected([0, 0, 0]),
  baseline,
  baseline.map((v, i) => ([1, 4, 5, 6, 8].includes(i) ? v : '#')),
  baseline,
  baseline.map((v, i) => ([0, 7, 10].includes(i) ? v : '#')),
  baseline,
  baseline,
]
async function values(wanted) {
  await page.waitForFunction(
    (targets) => {
      const actual = window.univerAPI
        .getDocument('cobalt-operating-review')
        .getFormulas()
        .map((f) => f.getResult())
      return (
        actual.length === 14 &&
        actual.every(
          (r, i) =>
            r &&
            !r.stale &&
            (targets === null
              ? typeof r.value === 'string' && r.value.startsWith('#')
              : typeof targets[i] === 'number'
                ? typeof r.value === 'number' && Math.abs(r.value - targets[i]) < 1e-9
                : targets[i] === '#'
                  ? String(r.value).startsWith('#')
                  : r.value === targets[i]),
        )
      )
    },
    wanted,
    { timeout: 30000 },
  )
  const actual = await results()
  for (const [i, r] of actual.entries()) {
    const status = wanted === null || (typeof wanted[i] === 'string' && wanted[i].startsWith('#')) ? 'error' : 'success'
    if (r.status !== status)
      report.knownIssues.push({ gate: 'native-result-status', formulaIndex: i, expected: status, actual: r })
  }
  report.results.push(actual)
}
async function showSummary(name) {
  for (const chapter of [0, 3]) {
    await page.mouse.move(1400, 500)
    await page.mouse.wheel(0, -20000)
    await settle()
    if (chapter) {
      await page.mouse.wheel(0, 3450)
      await settle()
    }
    const all = await results(),
      texts = (chapter ? all.slice(7) : all.slice(0, 7)).map((r) => r.text)
    await page.waitForFunction(
      ({ targets, token }) =>
        [...window.docFrames.entries()].some(([canvas, glyphs]) => {
          const text = glyphs.join('')
          return (
            canvas.isConnected &&
            canvas.width > 700 &&
            !canvas.closest('[data-embed-id]') &&
            text.includes(token) &&
            targets.every((v) => text.includes(v))
          )
        }),
      { targets: texts, token: chapter ? 'RECONCILIATION' : 'POSITION' },
    )
    await page.screenshot({ path: path.join(directory, name + (chapter ? '-reconcile' : '') + '.png') })
  }
}
async function expand(kind = 'sheet') {
  if (await shell.count()) return
  const id = 'cobalt-' + kind + '-block'
  const block = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="' + id + '"]')
  for (let i = 0; i < 20; i++) {
    const rect = await block.boundingBox()
    assert.ok(rect)
    if (rect.y >= 180 && rect.y + 180 < 1000) break
    await page.mouse.move(1400, 500)
    await page.mouse.wheel(0, rect.y - 280)
    await settle()
  }
  const rect = await block.boundingBox()
  // DocBlock activates on one pointer click. A double-click also starts a
  // native cell editor; leaving that editor for fullscreen can commit a blank.
  if ((await block.getAttribute('data-embed-float-stage')) !== 'stage2')
    await page.mouse.click(rect.x + 160, rect.y + 100)
  await page.waitForFunction(
    (embedId) =>
      document
        .querySelector('[data-embed-id="' + embedId + '"][data-u-comp="embed-float-dom"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
    id,
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="' + id + '"]')
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
function includesPack(actual, pack) {
  for (const [key, value] of Object.entries(pack))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}

try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4326', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () =>
      document.querySelector('.cobalt-embed')?.dataset.ready || document.querySelector('.cobalt-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  assert.equal(await root.locator('[data-u-comp="embed-float-dom"]').count(), 2)
  await values(baseline)
  const originalBody = await body()
  report.documentStyle = await page.evaluate(
    () => window.univerAPI.getDocument('cobalt-operating-review').save().documentStyle,
  )
  assert.equal(report.documentStyle.documentFlavor, (await import('@univerjs/core')).DocumentFlavor.TRADITIONAL)
  assert.equal(originalBody.paragraphs.filter((p) => p.paragraphStyle?.pageBreakBefore).length, 3)
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
      api.setCurrent('cobalt-operating-review')
    } finally {
      injector.get = get
    }
    const doc = api.getDocument('cobalt-operating-review').save()
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
  })
  assert.equal(report.pagination.length, 4)
  for (const p of report.pagination) assert.deepEqual([p.pageWidth, p.pageHeight], [794, 1123])
  assert.ok(report.pagination[1].text.startsWith('02 /'))
  assert.ok(report.pagination[1].text.includes('\b'))
  assert.ok(report.pagination[2].text.startsWith('03 /'))
  assert.ok(report.pagination[2].text.includes('\b'))
  assert.ok(report.pagination[3].text.startsWith('04 /'))
  report.checks.push('Four actual A4 pages; source blocks stay in their own chapters')
  await showSummary('baseline')
  const base = () => page.evaluate(() => window.univerAPI.getBase('cobalt-cost-register').save())
  for (const [i, wanted] of scenarios.entries()) {
    const sheetBefore = await source(),
      baseBefore = await base()
    // Literal Facade contracts are separate from pointer/fullscreen acceptance.
    // Repeatedly double-clicking an empty native Base hits its add-record row.
    await page.evaluate(examples[i])
    await values(wanted)
    await page.evaluate(() => window.univerAPI.setCurrent('cobalt-operating-review'))
    assert.deepEqual(await body(), originalBody)
    if ([0, 2, 10, 13, 14].includes(i)) assert.deepEqual(await base(), baseBefore, 'Sheet edits preserve complete Base')
    if ([1, 3, 4, 5, 6, 7, 8, 9, 12].includes(i))
      assert.deepEqual(await source(), sheetBefore, 'Base edits preserve complete Sheet')
    if (i === 8) assert.equal((await base()).tables.costs.records['cost-4'].values.amount, null)
    if (i === 9) assert.equal((await base()).tables.costs.records['cost-4'].values.amount, 0)
    if (i === 6 || i === 7)
      assert.deepEqual(
        await page.evaluate(
          () =>
            window.univerAPI
              .getBase('cobalt-cost-register')
              .getTableById('costs')
              .getViewById('costs-grid')
              .getProjection().rows,
        ),
        [],
      )
    await showSummary('example-' + (i + 1))
    report.checks.push({ example: i + 1, bodyPreserved: true })
    console.log('Cobalt example ' + (i + 1) + ' current canvas PASS')
  }
  await gate('native-source-keyboard-history', async () => {
    const beforeActivation = await source()
    await expand()
    assert.deepEqual(await source(), beforeActivation, 'Fullscreen activation preserves every Sheet cell/style')
    for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
      await shell.getByRole('tab', { name, exact: true }).click()
      assert.ok(await shell.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
    }
    await shell.getByRole('tab', { name: 'Start', exact: true }).click()
    const point = await page.evaluate(() => {
      const sheet = window.univerAPI.getWorkbook('cobalt-revenue-plan').save().sheets.revenue
      const rect = document
        .querySelector('[data-embed-fullscreen-shell="true"] [data-embed-canvas-root="true"] canvas')
        .getBoundingClientRect()
      const height = (i) => sheet.rowData[i]?.h || sheet.defaultRowHeight
      return {
        x: rect.x + (sheet.rowHeader.width + sheet.columnData[0].w + sheet.columnData[1].w / 2) * sheet.zoomRatio,
        y:
          rect.y +
          (sheet.columnHeader.height + [0, 1, 2, 3].reduce((n, i) => n + height(i), 0) + height(4) / 2) *
            sheet.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('cobalt-revenue-plan').getActiveRange()?.getA1Notation() === 'B5',
    )
    const before = await source()
    await page.keyboard.type('26000')
    await page.keyboard.press('Enter')
    await values(scenarios[0])
    const after = await source()
    await page.keyboard.press('Control+z')
    await values(baseline)
    assert.deepEqual(await source(), before)
    await page.keyboard.press('Control+y')
    await values(scenarios[0])
    assert.deepEqual(await source(), after)
    assert.deepEqual(await body(), originalBody)
    await page.screenshot({ path: path.join(directory, 'native-source.png') })
    await collapse()
    await showSummary('native-updated')
  })
  await gate('native-base-keyboard-history', async () => {
    const beforeActivation = await base()
    await page.evaluate(() => {
      window.basePoints = []
    })
    await expand('base')
    assert.deepEqual(await base(), beforeActivation, 'Fullscreen activation preserves every Base record')
    await page.waitForFunction(() => window.basePoints.some((p) => /^14,?200(?:\.00)?$/.test(p.text)))
    const point = await page.evaluate(() => window.basePoints.findLast((p) => /^14,?200(?:\.00)?$/.test(p.text)))
    const before = await base(),
      sheetBefore = await source()
    await page.mouse.dblclick(point.x - 8, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('15700')
    await page.keyboard.press('Enter')
    await values(scenarios[1])
    const after = await base()
    assert.equal(after.tables.costs.records['cost-2'].values.amount, 15700)
    await page.keyboard.press('Control+z')
    await values(scenarios[0])
    assert.deepEqual(await base(), before)
    await page.keyboard.press('Control+y')
    await values(scenarios[1])
    assert.deepEqual(await base(), after)
    assert.deepEqual(await source(), sheetBefore)
    assert.deepEqual(await body(), originalBody)
    await page.screenshot({ path: path.join(directory, 'native-base.png') })
    await collapse()
    await showSummary('native-base-updated')
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
      workbook: 'cobalt-revenue-plan',
      sheet: 'revenue',
    })
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await cancel.click()
  })
  const factory = await fs.readFile('showcase/embed/mixed-to-traditional-doc/code/create-demo.ts', 'utf8')
  for (const locale of ['enUS', 'zhCN']) {
    await page.evaluate((value) => window.univerAPI.setLocale(value), locale)
    const language = locale === 'enUS' ? 'en-US' : 'zh-CN'
    const paths = [...factory.matchAll(/import \w+ from '([^']+\/locales?\/(?:en-US|zh-CN))'/g)]
      .map((m) => m[1])
      .filter((p) => p.endsWith(language))
    assert.equal(paths.length, 23)
    const actualLocales = await page.evaluate(() => window.univerAPI.getLocales())
    for (const p of paths) includesPack(actualLocales, (await import(p)).default)
    report.checks.push({ locale, wholeDependencyPacks: paths.length })
    const before = await page.evaluate(() => ({
      host: window.univerAPI.getDocument('cobalt-operating-review').save(),
      sheet: window.univerAPI.getWorkbook('cobalt-revenue-plan').save(),
      base: window.univerAPI.getBase('cobalt-cost-register').save(),
    }))
    await page.evaluate(() => {
      window.cobaltOwner = window.univerAPI
      window.univerAPI.toggleDarkMode(true)
    })
    await settle()
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.equal(await page.evaluate(() => window.cobaltOwner === window.univerAPI), true)
    assert.deepEqual(
      await page.evaluate(() => ({
        host: window.univerAPI.getDocument('cobalt-operating-review').save(),
        sheet: window.univerAPI.getWorkbook('cobalt-revenue-plan').save(),
        base: window.univerAPI.getBase('cobalt-cost-register').save(),
      })),
      before,
    )
    await showSummary('locale-' + locale)
    report.checks.push({ locale, completeModelsPreserved: true })
  }
  await page.evaluate(() => window.univerAPI.setLocale('enUS'))
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
  report.passed = report.knownIssues.length === 0 && report.warnings.length === 0
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
  console.log(JSON.stringify({ ...report, results: undefined, canvasFrames: undefined }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
