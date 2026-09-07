/* eslint-disable no-await-in-loop -- Independent source scenarios and native pages are verified in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/beacon-formula-native')
await fs.mkdir(directory, { recursive: true })
const sourcePath = 'showcase/embed/formula-shape/'
const snippets = [
  ...(await fs.readFile(sourcePath + 'README.md', 'utf8')).matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g),
].map((m) => m[1])
assert.equal(snippets.length, 18)
const cards = [
  ['overview', 'revenue-value'],
  ['overview', 'cost-value'],
  ['overview', 'surplus-value'],
  ['overview', 'margin-value'],
  ['revenue', 'revenue-detail'],
  ['costs', 'cost-detail'],
  ['bridge', 'surplus-detail'],
  ['bridge', 'margin-detail'],
]
const report = { passed: false, checks: [], gates: {}, errors: [], warnings: [], backendRequests: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } })
page.setDefaultTimeout(12000)
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['fetch', 'xhr'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.beaconFrames = new Map()
  window.beaconPoints = new Map()
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect,
    draw = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.beaconFrames.set(this.canvas, [])
    window.beaconPoints.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const texts = window.beaconFrames.get(this.canvas) || []
    texts.push(String(args[0]))
    if (texts.length > 50000) texts.splice(0, texts.length - 50000)
    window.beaconFrames.set(this.canvas, texts)
    const p = this.getTransform().transformPoint({ x: args[1], y: args[2] }),
      b = this.canvas.getBoundingClientRect()
    const points = window.beaconPoints.get(this.canvas) || []
    points.push({
      text: String(args[0]),
      x: b.x + (p.x * b.width) / this.canvas.width,
      y: b.y + (p.y * b.height) / this.canvas.height,
    })
    if (points.length > 50000) points.splice(0, points.length - 50000)
    window.beaconPoints.set(this.canvas, points)
    return Reflect.apply(fill, this, args)
  }
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    if (source !== this.canvas) {
      const texts = window.beaconFrames.get(this.canvas) || []
      texts.push(...(window.beaconFrames.get(source) || []))
      if (texts.length > 50000) texts.splice(0, texts.length - 50000)
      window.beaconFrames.set(this.canvas, texts)
    }
    return Reflect.apply(draw, this, [source, ...args])
  }
})
const root = page.locator('.beacon-impact-embed')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const run = (code) => page.evaluate('(() => {\n' + code + '\n})()')
const snapshot = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        sheet: window.univerAPI.getWorkbook('beacon-learning-revenue').save(),
        base: window.univerAPI.getBase('beacon-learning-costs').save(),
        slides: window.univerAPI.getPresentation('beacon-learning-impact').save(),
      }),
    ),
  )
const results = () =>
  page.evaluate(
    (keys) =>
      Object.fromEntries(
        keys.map(([p, id]) => [
          id,
          window.univerAPI.getPresentation('beacon-learning-impact').getSlideById(p).getShape(id).getFormulaResult(),
        ]),
      ),
    cards,
  )
function expected(revenue, cost) {
  const bad = typeof revenue === 'string',
    surplus = bad ? revenue : revenue - cost,
    margin = bad ? revenue : revenue === 0 ? '#DIV/0!' : surplus / revenue
  return [revenue, cost, surplus, margin, revenue, cost, surplus, margin]
}
async function values(revenue, cost) {
  await page.waitForFunction(
    ({ keys, target }) =>
      keys.every(([p, id], i) => {
        const r = window.univerAPI
          .getPresentation('beacon-learning-impact')
          .getSlideById(p)
          .getShape(id)
          .getFormulaResult()
        return (
          r &&
          !r.stale &&
          (typeof target[i] === 'number' ? Math.abs(r.value - target[i]) < 1e-9 : r.value === target[i])
        )
      }),
    { keys: cards, target: expected(revenue, cost) },
    { timeout: 30000 },
  )
  const actual = await results()
  for (const [i, [, id]] of cards.entries())
    assert.equal(
      actual[id].status,
      typeof expected(revenue, cost)[i] === 'string' ? 'error' : 'success',
      id + ' native status',
    )
  return actual
}
function preserved(before, after, source) {
  if (source === 'sheet') assert.deepEqual(after.base, before.base, 'Sheet change preserves Base snapshot')
  else assert.deepEqual(after.sheet, before.sheet, 'Base change preserves Sheet snapshot')
  for (const [id, slide] of Object.entries(after.slides.slides)) {
    const previous = before.slides.slides[id]
    assert.deepEqual(slide.elementOrder, previous.elementOrder)
    for (const [key, e] of Object.entries(slide.elements)) {
      assert.deepEqual(e.transform, previous.elements[key].transform, 'Authored geometry ' + key)
      if (!cards.some(([, shape]) => shape === key))
        assert.deepEqual(e, previous.elements[key], 'Authored element ' + key)
    }
  }
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
}
async function load() {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4350', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 60000 })
  assert.equal(await root.getAttribute('data-error'), null)
  await values(10090, 5600)
}
async function go(id) {
  const thumbnail = root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')
  assert.equal(await thumbnail.count(), 1, 'Native Slides host must remain mounted: ' + id)
  await thumbnail.click()
  await settle()
}
async function rendered(name) {
  const actual = await results()
  for (const id of ['overview', 'revenue', 'costs', 'bridge']) {
    await go(id)
    const targets = cards.filter(([p]) => p === id).map(([, key]) => actual[key].displayText)
    await page.waitForFunction(
      (texts) =>
        [...window.beaconFrames.entries()].some(
          ([c, frame]) =>
            c.isConnected &&
            c.closest('[data-slide-canvas-host="true"]') &&
            c.width > 700 &&
            texts.every((t) => frame.join('').includes(t)),
        ),
      targets,
      { timeout: 15000 },
    )
    await page.screenshot({ path: path.join(directory, name + '-' + id + '.png') })
  }
}
function includesPack(actual, pack, prefix = '') {
  for (const [k, v] of Object.entries(pack)) {
    if (v && typeof v === 'object') includesPack(actual[k], v, prefix + k + '.')
    else assert.equal(actual?.[k], v, 'Locale ' + prefix + k)
  }
}
try {
  await load()
  await gate('baseline-four-pages', async () => {
    assert.equal(await root.locator('fieldset,details,[data-action],iframe').count(), 0)
    assert.equal(
      await root
        .locator('[data-u-comp="workbench-layout"]')
        .first()
        .evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await rendered('baseline')
  })
  const states = [
    [10290, 5600],
    [10290, 5900],
    [0, 5900],
    [10290, 5900],
    [10290, 3800],
    [10290, 5900],
    [8965, 5600],
    [10190, 5600],
    [8290, 5600],
    [10090, 5600],
    ['#VALUE!', 5600],
    [10090, 5600],
    [10090, 3800],
    [10090, 5600],
    [10090, 5625.5],
    [10090, 5600],
    [10090, 0],
    [10090, 5600],
  ]
  const fresh = new Set([6, 7, 8, 10, 12, 14, 15, 16])
  for (const [i, code] of snippets.entries()) {
    if (fresh.has(i)) await load()
    const source = [1, 4, 5, 12, 13, 14, 15, 16, 17].includes(i) ? 'base' : 'sheet'
    await gate('literal-' + (i + 1) + '-model', async () => {
      if (
        source === 'sheet' &&
        (await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="revenue"]').count())
      )
        await go('revenue')
      const before = await snapshot()
      let commandError
      try {
        await run(code)
      } catch (error) {
        commandError = error.stack
      }
      const actual = await values(...states[i])
      const after = await snapshot()
      preserved(before, after, source)
      // Sheets removes the serialized value property when a cell is cleared.
      if (i === 8) assert.equal(after.sheet.sheets.revenue.cellData[4][2].v, undefined)
      if (i === 12) assert.equal(after.base.tables.costs.records['cost-1'].values.amount, null)
      report.checks.push({ example: i + 1, source, expected: states[i], results: actual, commandError })
      assert.equal(commandError, undefined, 'A source write must not mutate successfully and then throw')
    })
    await gate('literal-' + (i + 1) + '-four-page-paint', async () => {
      await values(...states[i])
      await rendered('example-' + (i + 1))
    })
  }
  await load()
  await gate('complete-locales-and-themes', async () => {
    const factory = await fs.readFile(sourcePath + 'code/create-demo.ts', 'utf8')
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 22)
    await rendered('locale-warmup')
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await go('overview')
      const before = await snapshot()
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
      }
      assert.deepEqual(await snapshot(), before)
      await rendered(locale)
      report.checks.push({ locale, completePacks: 22, modelsPreserved: true })
    }
  })
  await load()
  await gate('native-sheet-input', async () => {
    await go('revenue')
    const embed = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="beacon-impact-sheet-float"]')
    await embed.dblclick({ position: { x: 180, y: 90 } })
    await settle()
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('beacon-learning-revenue').save().sheets.revenue
      const canvas = [...document.querySelectorAll('[data-embed-id="beacon-impact-sheet-float"] canvas')].find(
        (c) => c.width > 700,
      )
      const b = canvas.getBoundingClientRect(),
        h = (i) => s.rowData?.[i]?.h || s.defaultRowHeight
      return {
        x: b.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w + s.columnData[2].w / 2) * s.zoomRatio,
        y:
          b.y +
          (s.columnHeader.height + Array.from({ length: 4 }, (_, i) => h(i)).reduce((a, v) => a + v, 0) + h(4) / 2) *
            s.zoomRatio,
      }
    })
    const before = await snapshot()
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('beacon-learning-revenue').getActiveRange()?.getA1Notation() === 'C5',
    )
    await page.keyboard.type('52')
    await page.keyboard.press('Enter')
    await values(10370, 5600)
    const after = await snapshot()
    assert.equal(after.sheet.sheets.revenue.cellData[4][2].v, 52)
    preserved(before, after, 'sheet')
    report.checks.push({ nativeSheetInput: true, results: await results() })
    await page.screenshot({ path: path.join(directory, 'native-sheet-edited.png') })
    await rendered('native-sheet-result')
  })
  await load()
  await gate('native-base-input', async () => {
    await go('costs')
    const embed = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="beacon-impact-base-float"]')
    await embed.dblclick({ position: { x: 180, y: 90 } })
    await settle()
    await page.screenshot({ path: path.join(directory, 'native-base-activated.png') })
    await page.waitForFunction(() =>
      [...window.beaconPoints.entries()].some(
        ([c, ps]) => c.isConnected && ps.some((p) => ['1,800', '1800', '1,800.00'].includes(p.text)),
      ),
    )
    const point = await page.evaluate(() =>
      [...window.beaconPoints.entries()]
        .filter(([c]) => c.isConnected)
        .flatMap(([, ps]) => ps)
        .find((p) => ['1,800', '1800', '1,800.00'].includes(p.text)),
    )
    const before = await snapshot()
    await page.mouse.dblclick(point.x + 5, point.y - 5)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('2250')
    await page.keyboard.press('Enter')
    await values(10090, 6050)
    const after = await snapshot()
    assert.equal(after.base.tables.costs.records['cost-1'].values.amount, 2250)
    preserved(before, after, 'base')
    report.checks.push({ nativeBaseInput: true, results: await results() })
    await page.screenshot({ path: path.join(directory, 'native-base-edited.png') })
    await rendered('native-base-result')
  })
  await load()
  await gate('selected-disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  report.passed =
    Object.values(report.gates).every((g) => g.passed) &&
    !report.errors.length &&
    !report.warnings.length &&
    !report.backendRequests.length
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        checks: report.checks.length,
        gates: report.gates,
        errors: report.errors,
        warnings: report.warnings,
        backendRequests: report.backendRequests,
        failure: report.failure,
      },
      null,
      2,
    ),
  )
  await browser.close()
}
if (!report.passed) process.exitCode = 1
