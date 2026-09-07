/* eslint-disable no-await-in-loop -- Follow literal edits and visit each native output in sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-kestrel-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-to-many-products/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((match) => match[1])
assert.equal(examples.length, 17)
const slideSpecs = [
  ['overview', 'plan'],
  ['overview', 'actual'],
  ['overview', 'gap'],
  ['workstreams', 'learning'],
  ['workstreams', 'fabrication'],
  ['workstreams', 'access'],
  ['decision', 'coverage'],
  ['decision', 'draft'],
  ['decision', 'signal'],
]
const boardIds = ['plan', 'actual', 'gap', 'learning', 'fabrication', 'access', 'signal']
const report = { passed: false, checks: [], knownIssues: [], errors: [], backendRequests: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, colorScheme: 'light' })
page.setDefaultTimeout(20000)
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
  window.framesPaint = new Map()
  window.basePoints = []
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect,
    draw = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.framesPaint.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const texts = window.framesPaint.get(this.canvas) || []
    texts.push(String(args[0]))
    window.framesPaint.set(this.canvas, texts)
    if (this.canvas.id.startsWith('univer-base-main-canvas')) {
      const bounds = this.canvas.getBoundingClientRect()
      const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
      if (bounds.width > 300)
        window.basePoints.push({
          text: String(args[0]),
          x: bounds.x + (point.x * bounds.width) / this.canvas.width,
          y: bounds.y + (point.y * bounds.height) / this.canvas.height,
        })
    }
    return Reflect.apply(fill, this, args)
  }
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const texts = window.framesPaint.get(this.canvas) || []
    texts.push(...(window.framesPaint.get(source) || []))
    window.framesPaint.set(this.canvas, texts)
    return Reflect.apply(draw, this, [source, ...args])
  }
})
const root = page.locator('.kestrel-embed')
async function activate(name) {
  const ids = {
    Expenses: 'expenses',
    'Plan & chart': 'kestrel-sheet-tab',
    Brief: 'kestrel-doc-tab',
    'Review deck': 'kestrel-slide-tab',
    'Variance map': 'kestrel-board-tab',
  }
  if ((await page.evaluate(() => window.univerAPI.getBaseUI().getActiveTableId())) !== ids[name])
    await root.getByText(name, { exact: true }).click()
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}
const body = () => page.evaluate(() => window.univerAPI.getDocument('kestrel-planning-note').getBody())
const authored = () =>
  page.evaluate(() => {
    const api = window.univerAPI
    const snapshot = {
      slides: api.getPresentation('kestrel-review').save().slides,
      board: api.getBoard('kestrel-variance-map').save().pages,
    }
    // Only the SDK's persisted calculation cache may change. Keep formulas,
    // formats, all text/style data, transforms, connectors and ordering intact.
    const copy = structuredClone(snapshot)
    for (const pages of Object.values(copy))
      for (const item of Object.values(pages))
        for (const element of Object.values(item.elements || {}))
          if (element.shapeData?.formulaBinding) delete element.shapeData.formulaBinding.lastValue
    return copy
  })
const result = () =>
  page.evaluate(
    ({ slideSpecs: entries, boardIds: cards }) => {
      const api = window.univerAPI
      return {
        doc: api
          .getDocument('kestrel-planning-note')
          .getFormulas()
          .map((formula) => formula.getResult()),
        slides: entries.map(([id, shape]) =>
          api.getPresentation('kestrel-review').getSlideById(id).getShape(shape).getFormulaResult(),
        ),
        board: cards.map((id) => api.getBoard('kestrel-variance-map').getShape(id).getFormulaResult()),
      }
    },
    { slideSpecs, boardIds },
  )
function expected(plans, actuals, posted = 6, draft = 2500) {
  const plan = plans.reduce((a, b) => a + b, 0),
    actual = actuals.reduce((a, b) => a + b, 0)
  const gap = plan - actual,
    ratio = plan ? actual / plan : '#DIV/0!',
    signal = gap < 0 ? 'Over plan' : 'Within plan'
  const differences = plans.map((value, index) => value - actuals[index])
  return {
    doc: [plan, actual, gap, ratio, posted, draft, ...differences, signal],
    slides: [plan, actual, gap, ...differences, ratio, draft, signal],
    board: [plan, actual, gap, ...differences, signal],
  }
}
async function values(targets) {
  await page.waitForFunction(
    ({ targets: wanted, slideSpecs: entries, boardIds: cards }) => {
      const api = window.univerAPI
      const actual = {
        doc: api
          .getDocument('kestrel-planning-note')
          .getFormulas()
          .map((f) => f.getResult()),
        slides: entries.map(([p, id]) =>
          api.getPresentation('kestrel-review').getSlideById(p).getShape(id).getFormulaResult(),
        ),
        board: cards.map((id) => api.getBoard('kestrel-variance-map').getShape(id).getFormulaResult()),
      }
      return Object.entries(wanted).every(
        ([key, items]) =>
          items.length === actual[key].length &&
          items.every(
            (value, i) =>
              !actual[key][i].stale &&
              (typeof value === 'number'
                ? Math.abs(actual[key][i].value - value) < 1e-9
                : actual[key][i].value === value),
          ),
      )
    },
    { targets, slideSpecs, boardIds },
    { timeout: 30000 },
  )
  const actual = await result()
  for (const [product, results] of Object.entries(actual))
    for (const [index, item] of results.entries()) {
      if (String(item.value).startsWith('#') && item.status !== 'error')
        report.knownIssues.push({ gate: 'native-error-status', product, index, result: item })
    }
  return actual
}
async function paint(texts) {
  await page.waitForFunction(
    (wanted) =>
      [...window.framesPaint.entries()].some(
        ([canvas, frame]) =>
          canvas.isConnected &&
          canvas.width > 500 &&
          canvas.height > 300 &&
          canvas.closest('[data-embed-bases-table-list-host]') &&
          wanted.filter(Boolean).every((text) => frame.join('').includes(text)),
      ),
    texts,
    { timeout: 20000 },
  )
}
async function outputs(name) {
  const actual = await result()
  await activate('Brief')
  await paint(actual.doc.map((item) => item.text))
  await page.screenshot({ path: path.join(directory, name + '-brief.png') })
  await activate('Review deck')
  for (const id of ['overview', 'workstreams', 'decision']) {
    await page.evaluate((pageId) => {
      const deck = window.univerAPI.getPresentation('kestrel-review')
      deck.setActiveSlide(deck.getSlideById(pageId))
    }, id)
    await paint(actual.slides.filter((_, i) => slideSpecs[i][0] === id).map((item) => item.displayText))
    await page.screenshot({ path: path.join(directory, name + '-slide-' + id + '.png') })
  }
  await activate('Variance map')
  await paint(actual.board.map((item) => item.displayText))
  await page.screenshot({ path: path.join(directory, name + '-board.png') })
  await activate('Plan & chart')
}
const bars = () =>
  page.evaluate(() => {
    const info = window.univerAPI.getWorkbook('kestrel-plan').getSheetBySheetId('plan').getCharts()[0].getInfo()
    const canvas = [...document.querySelectorAll('[data-embed-bases-table-list-host] canvas')].find(
      (c) => c.getBoundingClientRect().width > 500 && c.height > 300,
    )
    if (!canvas) return []
    const x = Math.round(info.position.x),
      y = Math.round(info.position.y),
      width = Math.min(Math.round(info.size.width), canvas.width - x),
      height = Math.min(Math.round(info.size.height), canvas.height - y)
    const pixels = canvas.getContext('2d').getImageData(x, y, width, height).data
    return [
      [82, 109, 157],
      [38, 149, 138],
    ].map((rgb) => {
      const columns = Array.from({ length: width }, () => ({ min: height, max: 0, count: 0 }))
      for (let row = Math.ceil(height * 0.2); row < height; row++)
        for (let col = 0; col < width; col++) {
          const offset = (row * width + col) * 4
          if (pixels[offset + 3] > 240 && rgb.every((v, j) => Math.abs(pixels[offset + j] - v) < 4)) {
            const c = columns[col]
            c.min = Math.min(c.min, row)
            c.max = Math.max(c.max, row)
            c.count++
          }
        }
      const groups = []
      for (const [col, c] of columns.entries())
        if (c.count > 12) {
          const last = groups.at(-1)
          if (last && last.end === col - 1) {
            last.end = col
            last.top = Math.min(last.top, c.min)
            last.bottom = Math.max(last.bottom, c.max)
          } else groups.push({ start: col, end: col, top: c.min, bottom: c.max })
        }
      return groups
        .filter((g) => g.end - g.start > 8)
        .map(({ start, end, top, bottom }) => ({ start, end, top, bottom, height: bottom - top + 1 }))
    })
  })
async function chart(plans, actuals, name) {
  const targets = [plans, actuals].map((series) => series.filter((v) => v > 0))
  const deadline = Date.now() + 20000
  let geometry
  do {
    geometry = await bars()
    if (geometry.length === 2 && geometry.every((series, i) => series.length === targets[i].length)) {
      const first = geometry.flat()[0],
        value = targets.flat()[0],
        scale = first.height / value
      if (geometry.every((series, i) => series.every((bar, j) => Math.abs(bar.height - targets[i][j] * scale) <= 3)))
        break
    }
    await new Promise((resolve) => setTimeout(resolve, 150))
  } while (Date.now() < deadline)
  assert.equal(geometry.length, 2)
  geometry.forEach((series, i) => assert.equal(series.length, targets[i].length, 'Native series column count'))
  const scale = geometry.flat()[0].height / targets.flat()[0]
  geometry.forEach((series, i) =>
    series.forEach((bar, j) =>
      assert.ok(Math.abs(bar.height - targets[i][j] * scale) <= 3, 'Native series bar height matches source'),
    ),
  )
  const totals = await page.evaluate(() =>
    window.univerAPI.getWorkbook('kestrel-plan').getSheetBySheetId('plan').getRange('B9:C9').getRawValues(),
  )
  assert.deepEqual(totals, [[plans.reduce((a, b) => a + b, 0), actuals.reduce((a, b) => a + b, 0)]])
  await page.screenshot({ path: path.join(directory, name + '-chart.png') })
  return geometry
}

try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4304', { timeout: 60000 })
  await page.waitForFunction(
    () =>
      document.querySelector('.kestrel-embed')?.dataset.ready ||
      document.querySelector('.kestrel-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  const descriptors = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'kestrel-actuals' }).map((x) => x.getDescriptor()),
  )
  assert.equal(descriptors.length, 4)
  assert.ok(descriptors.every((d) => d.entry === 'bases-table-list-block' && d.context.resolved))
  const baseline = [[18000, 16000, 14000], [17000, 14500, 14000], 6, 2500]
  await values(expected(...baseline))
  await outputs('baseline')
  const originalBody = await body(),
    originalAuthored = await authored()
  await chart(...baseline.slice(0, 2), 'baseline')
  report.checks.push('Baseline: 26 native results on five current output canvases and two actual chart series')
  const scenarios = [
    ['Expenses', [18000, 16000, 14000], [18500, 14500, 14000], 6, 2500],
    ['Plan & chart', [18000, 16000, 16000], [18500, 14500, 14000], 6, 2500],
    ['Expenses', [18000, 16000, 16000], [20000, 14500, 14000], 7, 1000],
    ['Expenses', [18000, 16000, 16000], [20000, 14500, 14000], 7, 1000],
    ['Expenses', [18000, 16000, 16000], [10500, 14500, 14000], 7, 1000],
    ['Expenses', [18000, 16000, 16000], [10500, 14500, 14000], 7, 1000],
    ['Expenses', [18000, 16000, 16000], [20000, 14500, 14000], 7, 1000],
    ['Plan & chart', [0, 0, 0], [20000, 14500, 14000], 7, 1000],
    ['Plan & chart', [18000, 16000, 16000], [20000, 14500, 14000], 7, 1000],
    ['Expenses', [18000, 16000, 16000], [20000, 14500, 14000], 7, 1000],
    ['Expenses', [18000, 16000, 16000], [20000, 14500, 14500], 7, 1000],
    ['Expenses', [18000, 16000, 16000], [20000, 14500, 14500], 7, 1000],
    ['Expenses', [18000, 16000, 16000], [20000, 14500, 14500], 7, 1000],
    ['Plan & chart', [18000, 17000, 16000], [20000, 14500, 14500], 7, 1000],
    ['Expenses', [18000, 17000, 16000], [17000, 14500, 14000], 6, 2500],
    ['Plan & chart', ...baseline],
  ]
  for (const [index, [name, ...scenario]] of scenarios.entries()) {
    await activate(name)
    await page.evaluate(examples[index])
    await values(expected(...scenario))
    assert.deepEqual(await body(), originalBody, 'Authored Doc body remains unchanged')
    await outputs('example-' + (index + 1))
    assert.deepEqual(
      await authored(),
      originalAuthored,
      'Complete authored Slides/Board pages remain unchanged except calculation caches',
    )
    const geometry = await chart(...scenario.slice(0, 2), 'example-' + (index + 1))
    report.checks.push({
      example: index + 1,
      inputs: scenario,
      nativeResults: 26,
      currentCanvases: true,
      chartBars: geometry,
    })
  }
  await page.evaluate(examples[16])
  const resources = await page.evaluate(() => {
    const a = window.univerAPI
    return [
      a.getDocument('kestrel-planning-note').save(),
      a.getPresentation('kestrel-review').save(),
      a.getBoard('kestrel-variance-map').save(),
    ].map((x) => JSON.stringify(x.resources))
  })
  assert.ok(
    resources.every((value) =>
      ['kestrel-plan', 'kestrel-actuals', 'Kestrel Plan', 'Kestrel Actuals'].every((id) => value.includes(id)),
    ),
  )
  report.checks.push(
    'Seventeenth literal example reads five native snapshots; all three output units persist both source identities after rename',
  )
  await page.evaluate(() => {
    window.basePoints = []
  })
  await activate('Expenses')
  const point = await page.evaluate(
    () => window.basePoints.filter((p) => p.text === '8,000').toSorted((a, b) => a.y - b.y)[0],
  )
  assert.ok(point, 'Locate the currently rendered first posted amount')
  await page.mouse.dblclick(point.x - 15, point.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('10000')
  await page.keyboard.press('Enter')
  await values(expected([18000, 16000, 14000], [19000, 14500, 14000]))
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI
        .getBase('kestrel-actuals')
        .getTableById('expenses')
        .getRecordById('expense-1')
        .getValue('amount'),
    ),
    10000,
  )
  await outputs('native-base-input')
  await chart([18000, 16000, 14000], [19000, 14500, 14000], 'native-base-input')
  const cell = await page.evaluate(() => {
    const data = window.univerAPI.getWorkbook('kestrel-plan').save().sheets.plan
    const canvas = [...document.querySelectorAll('[data-embed-bases-table-list-host] canvas')].find(
      (c) => c.getBoundingClientRect().width > 500 && c.height > 300,
    )
    const rect = canvas.getBoundingClientRect()
    const height = (row) => data.rowData[row]?.h || data.defaultRowHeight
    return {
      x: rect.x + (data.rowHeader.width + data.columnData[0].w + data.columnData[1].w / 2) * data.zoomRatio,
      y:
        rect.y +
        (data.columnHeader.height + [0, 1, 2, 3, 4, 5].reduce((sum, row) => sum + height(row), 0) + height(6) / 2) *
          data.zoomRatio,
    }
  })
  await page.mouse.click(cell.x, cell.y)
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('kestrel-plan').getActiveRange()?.getA1Notation() === 'B7',
  )
  await page.keyboard.type('15000')
  await page.keyboard.press('Enter')
  await values(expected([18000, 16000, 15000], [19000, 14500, 14000]))
  await outputs('native-sheet-input')
  await chart([18000, 16000, 15000], [19000, 14500, 14000], 'native-sheet-input')
  assert.deepEqual(await body(), originalBody)
  assert.deepEqual(await authored(), originalAuthored)
  report.checks.push(
    'Native Base amount input and Sheet B7 input independently update all 26 current values and both chart series without changing authored content',
  )
  await activate('Variance map')
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await root.waitFor({ state: 'detached' })
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  report.checks.push('Active-Board disposal releases the native workbench and API')
  // Keep the unsupported off-page path observable on a fresh owner, separate
  // from the documented native activation workflow above. Never force the click.
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4304')
  await page.waitForFunction(() => document.querySelector('.kestrel-embed')?.dataset.ready)
  await activate('Plan & chart')
  await page.evaluate(() => window.univerAPI.getBase('kestrel-actuals').setName('Kestrel / off-page rename probe'))
  try {
    await root.getByText('Brief', { exact: true }).click({ timeout: 3000 })
    await paint(['$48,000', '$45,500'])
    report.checks.push('Off-page Base rename leaves native navigation usable')
  } catch (error) {
    report.knownIssues.push({ gate: 'off-page-base-rename-navigation', failure: error.message })
    await page.screenshot({ path: path.join(directory, 'off-page-rename-failure.png') })
  }
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0
} catch (error) {
  report.failure = error.stack
  report.currentResults = await result().catch(() => null)
  report.bars = await bars().catch(() => null)
  report.frames = await page
    .evaluate(() =>
      [...window.framesPaint.entries()]
        .filter(([canvas]) => canvas.isConnected)
        .map(([canvas, texts]) => ({ width: canvas.width, height: canvas.height, text: texts.join('') })),
    )
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
