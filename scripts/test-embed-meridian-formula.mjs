/* eslint-disable no-await-in-loop -- Follow literal edits and visit each native output in sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-meridian-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-sheet-calculation-chain/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((match) => match[1])
assert.equal(examples.length, 9)
const slideSpecs = [
  ['overview', 'quantity'],
  ['overview', 'total'],
  ['overview', 'headroom'],
  ['editions', 'atlas'],
  ['editions', 'fieldnotes'],
  ['editions', 'share'],
  ['decision', 'rate'],
  ['decision', 'count'],
  ['decision', 'signal'],
]
const boardIds = ['quantity', 'rate', 'total', 'atlas', 'fieldnotes', 'signal']
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
    if (this.canvas.closest('[data-embed-sheets-sheet-tab-host]')) {
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
const tab = (name) => page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
const body = () => page.evaluate(() => window.univerAPI.getDocument('meridian-production-note').getBody())
const authored = () =>
  page.evaluate(() => {
    const api = window.univerAPI
    const snapshot = {
      slides: api.getPresentation('meridian-studio-review').save().slides,
      board: api.getBoard('meridian-production-map').save().pages,
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
          .getDocument('meridian-production-note')
          .getFormulas()
          .map((formula) => formula.getResult()),
        slides: entries.map(([id, shape]) =>
          api.getPresentation('meridian-studio-review').getSlideById(id).getShape(shape).getFormulaResult(),
        ),
        board: cards.map((id) => api.getBoard('meridian-production-map').getShape(id).getFormulaResult()),
      }
    },
    { slideSpecs, boardIds },
  )
function expected(atlas, fieldnotes, rate, count = 2) {
  const quantity = atlas + (fieldnotes || 0),
    total = quantity * rate,
    headroom = 3500 - total
  const a = atlas * rate,
    f = (fieldnotes || 0) * rate
  const share = quantity ? (fieldnotes || 0) / quantity : '#DIV/0!'
  const signal = total > 3500 ? 'Review scope' : 'Within envelope'
  return {
    doc: [quantity, rate, total, headroom, atlas, a, fieldnotes || 0, f, share, count, signal],
    slides: [quantity, total, headroom, a, f, share, rate, count, signal],
    board: [quantity, rate, total, a, f, signal],
  }
}
async function values(targets) {
  await page.waitForFunction(
    ({ targets: wanted, slideSpecs: entries, boardIds: cards }) => {
      const api = window.univerAPI
      const actual = {
        doc: api
          .getDocument('meridian-production-note')
          .getFormulas()
          .map((f) => f.getResult()),
        slides: entries.map(([p, id]) =>
          api.getPresentation('meridian-studio-review').getSlideById(p).getShape(id).getFormulaResult(),
        ),
        board: cards.map((id) => api.getBoard('meridian-production-map').getShape(id).getFormulaResult()),
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
          canvas.closest('[data-embed-sheets-sheet-tab-host]') &&
          wanted.filter(Boolean).every((text) => frame.join('').includes(text)),
      ),
    texts,
    { timeout: 20000 },
  )
}
async function outputs(name) {
  const actual = await result()
  await tab('Brief').click()
  await paint(actual.doc.map((item) => item.text))
  await page.screenshot({ path: path.join(directory, name + '-brief.png') })
  await tab('Review deck').click()
  for (const id of ['overview', 'editions', 'decision']) {
    await page.evaluate((pageId) => {
      const deck = window.univerAPI.getPresentation('meridian-studio-review')
      deck.setActiveSlide(deck.getSlideById(pageId))
    }, id)
    await paint(actual.slides.filter((_, i) => slideSpecs[i][0] === id).map((item) => item.displayText))
    await page.screenshot({ path: path.join(directory, name + '-slide-' + id + '.png') })
  }
  await tab('Production map').click()
  await paint(actual.board.map((item) => item.displayText))
  await page.screenshot({ path: path.join(directory, name + '-board.png') })
  await tab('Production model').click()
}
const bars = () =>
  page.evaluate(() => {
    const info = window.univerAPI
      .getWorkbook('meridian-production-model')
      .getSheetBySheetId('production')
      .getCharts()[0]
      .getInfo()
    const canvas = [...document.querySelectorAll('canvas[id^="univer-sheet-main-canvas"]')].find(
      (element) => !element.closest('[data-embed-sheets-sheet-tab-host]'),
    )
    if (!canvas) return []
    const x = Math.round(info.position.x),
      y = Math.round(info.position.y),
      width = Math.min(Math.round(info.size.width), canvas.width - x),
      height = Math.min(Math.round(info.size.height), canvas.height - y)
    const pixels = canvas.getContext('2d').getImageData(x, y, width, height).data
    const columns = Array.from({ length: width }, () => ({ min: height, max: 0, count: 0 }))
    for (let row = Math.ceil(height * 0.2); row < height; row++)
      for (let col = 0; col < width; col++) {
        const index = (row * width + col) * 4
        if (pixels[index + 3] > 240 && [67, 125, 145].every((value, i) => Math.abs(pixels[index + i] - value) < 4)) {
          const c = columns[col]
          c.min = Math.min(c.min, row)
          c.max = Math.max(c.max, row)
          c.count++
        }
      }
    const groups = []
    for (const [col, column] of columns.entries())
      if (column.count > 15) {
        const last = groups.at(-1)
        if (last && last.end === col - 1) {
          last.end = col
          last.top = Math.min(last.top, column.min)
          last.bottom = Math.max(last.bottom, column.max)
        } else groups.push({ start: col, end: col, top: column.min, bottom: column.max })
      }
    return groups
      .filter((group) => group.end - group.start > 8)
      .map(({ start, end, top, bottom }) => ({ start, end, top, bottom, height: bottom - top + 1 }))
  })
async function chart(inputs, name) {
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('meridian-production-model')
        .getSheetBySheetId('production')
        .getRange('D13')
        .getRawValue(),
    ),
    inputs.reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0),
    'Visible formula-backed chart range has the same total',
  )
  const positive = inputs.filter((value) => typeof value === 'number' && value > 0)
  const deadline = Date.now() + 20000
  let actual
  do {
    actual = await bars()
    if (actual.length === positive.length) {
      const scale = actual[0]?.height / positive[0]
      if (actual.every((bar, i) => Math.abs(bar.height - positive[i] * scale) <= 3)) break
    }
    await new Promise((resolve) => setTimeout(resolve, 150))
  } while (Date.now() < deadline)
  assert.equal(actual.length, positive.length, 'Native chart has the correct number of positive columns')
  const scale = actual[0]?.height / positive[0]
  actual.forEach((bar, i) =>
    assert.ok(Math.abs(bar.height - positive[i] * scale) <= 3, 'Native column geometry matches its input'),
  )
  await page.screenshot({ path: path.join(directory, name + '-sheet-chart.png') })
  return actual
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4306', { timeout: 60000 })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.meridian-embed')
      return root?.dataset.ready || root?.dataset.error
    },
    null,
    { timeout: 60000 },
  )
  assert.equal(await page.locator('.meridian-embed').getAttribute('data-error'), null)
  assert.equal(await page.locator('.meridian-embed fieldset,.meridian-embed [data-action],iframe').count(), 0)
  const descriptors = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'meridian-production-model' }).map((embed) => embed.getDescriptor()),
  )
  assert.equal(descriptors.length, 4)
  assert.ok(descriptors.every((descriptor) => descriptor.entry === 'sheets-sheet-tab' && descriptor.context.resolved))
  await values(expected(40, 60, 25))
  await outputs('baseline')
  const originalBody = await body()
  const originalAuthored = await authored()
  await chart([1000, 1500], 'baseline')
  report.checks.push(
    'Baseline: 26 live Formula results across Doc, 3 Slides and Board, plus proportional native chart columns',
  )
  const scenarios = [
    [40, 80, 25, 2],
    [40, 80, 30, 2],
    [0, 80, 30, 1],
    [0, 80, 30, 1],
    [0, null, 30, 1],
    [40, 80, 30, 2],
    [40, 80, 0, 2],
    [40, 80, 25, 2],
  ]
  for (const [i, scenario] of scenarios.entries()) {
    await tab([1, 6, 7].includes(i) ? 'Production model' : 'Edition register').click()
    await page.evaluate(examples[i])
    await values(expected(...scenario))
    assert.deepEqual(await body(), originalBody, 'Every source edit preserves authored Doc content and inline ranges')
    await outputs('example-' + (i + 1))
    assert.deepEqual(
      await authored(),
      originalAuthored,
      'Source edits preserve complete authored Slides and Board pages',
    )
    const geometry = await chart([scenario[0] * scenario[2], (scenario[1] || 0) * scenario[2]], 'example-' + (i + 1))
    report.checks.push({
      example: i + 1,
      inputs: scenario,
      formulaResults: 26,
      currentCanvases: true,
      chartBars: geometry,
    })
  }
  await page.evaluate(examples[8])
  const resources = await page.evaluate(() => {
    const api = window.univerAPI
    return [
      api.getDocument('meridian-production-note').save(),
      api.getPresentation('meridian-studio-review').save(),
      api.getBoard('meridian-production-map').save(),
    ].map((snapshot) => snapshot.resources)
  })
  assert.ok(
    resources.every(
      (resource) =>
        JSON.stringify(resource).includes('meridian-production-model') &&
        JSON.stringify(resource).includes('Meridian Model'),
    ),
  )
  report.checks.push(
    'Ninth literal example reads all five native snapshots; all three editorial targets persist the Sheet source ID and qualifier',
  )
  const sheetResources = await page.evaluate(
    () => window.univerAPI.getWorkbook('meridian-production-model').save().resources,
  )
  assert.ok(
    JSON.stringify(sheetResources).includes('meridian-edition-register') &&
      JSON.stringify(sheetResources).includes('Meridian Editions'),
  )
  await page.evaluate(() => {
    window.basePoints = []
  })
  await tab('Edition register').click()
  await page.waitForFunction(() => window.basePoints.some((p) => p.text === '80'))
  const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '80'))
  await page.mouse.dblclick(point.x - 8, point.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('100')
  await page.keyboard.press('Enter')
  await values(expected(40, 100, 25))
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI
        .getBase('meridian-edition-register')
        .getTableById('editions')
        .getRecordById('edition-2')
        .getValue('quantity'),
    ),
    100,
  )
  await outputs('native-base-input')
  await chart([1000, 2500], 'native-base-input')
  report.checks.push(
    'Native Base quantity typing 80->100 propagates through the Sheet to all 26 values and both chart columns',
  )
  const cell = await page.evaluate(() => {
    const data = window.univerAPI.getWorkbook('meridian-production-model').save().sheets.production
    const canvas = [...document.querySelectorAll('canvas[id^="univer-sheet-main-canvas"]')].find(
      (c) => !c.closest('[data-embed-sheets-sheet-tab-host]'),
    )
    const bounds = canvas.getBoundingClientRect()
    const height = (row) => data.rowData[row]?.h || data.defaultRowHeight
    return {
      x: bounds.x + (data.rowHeader.width + data.columnData[0].w + data.columnData[1].w / 2) * data.zoomRatio,
      y:
        bounds.y +
        (data.columnHeader.height + [0, 1, 2].reduce((sum, row) => sum + height(row), 0) + height(3) / 2) *
          data.zoomRatio,
    }
  })
  await page.mouse.click(cell.x, cell.y)
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('meridian-production-model').getActiveRange()?.getA1Notation() === 'B4',
  )
  await page.keyboard.type('20')
  await page.keyboard.press('Enter')
  await values(expected(40, 100, 20))
  await outputs('native-sheet-input')
  await chart([800, 2000], 'native-sheet-input')
  assert.deepEqual(await body(), originalBody)
  assert.deepEqual(await authored(), originalAuthored)
  report.checks.push(
    'Native Sheet rate typing 25->20 updates all downstream outputs without changing Base quantities or authored Doc/Slides/Board content',
  )
  await tab('Production map').click()
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await page.locator('.meridian-embed').waitFor({ state: 'detached' })
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  report.checks.push('Disposal from the active Board tab releases the owned workbench and API')
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
