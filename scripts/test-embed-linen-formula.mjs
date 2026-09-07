/* eslint-disable no-await-in-loop -- Exercise the published source examples in sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-linen-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-to-traditional-doc/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 15)
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
  window.basePoints = []
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect,
    draw = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.docFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const texts = window.docFrames.get(this.canvas) || []
    texts.push(...(window.docFrames.get(source) || []))
    window.docFrames.set(this.canvas, texts)
    return Reflect.apply(draw, this, [source, ...args])
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const texts = window.docFrames.get(this.canvas) || []
    texts.push(String(args[0]))
    window.docFrames.set(this.canvas, texts)
    if (this.canvas.closest('[data-embed-fullscreen-shell="true"]')) {
      const point = this.getTransform().transformPoint({ x: args[1], y: args[2] }),
        bounds = this.canvas.getBoundingClientRect()
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
const root = page.locator('.linen-embed')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const body = () => page.evaluate(() => window.univerAPI.getDocument('linen-services-schedule').save().body)
const source = () => page.evaluate(() => window.univerAPI.getBase('linen-service-register').save())
const results = () =>
  page.evaluate(() =>
    window.univerAPI
      .getDocument('linen-services-schedule')
      .getFormulas()
      .map((f) => f.getResult()),
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
// Independent arithmetic oracle, never imported by the demo or used to render it.
const expected = (fees, optional = true, hours = 24) => {
  const total = fees.slice(0, optional ? 3 : 4).reduce((a, b) => a + b, 0)
  const delivery = fees[1] + (optional ? 0 : fees[3])
  return [
    4,
    optional ? 3 : 4,
    total,
    optional ? fees[3] : 0,
    hours,
    total / (optional ? 3 : 4),
    fees[0],
    delivery,
    fees[2],
    total,
    total ? delivery / total : '#DIV/0!',
    optional ? 'Optional work excluded' : 'No optional lines',
  ]
}
const baseline = expected([1200, 850, 450, 300])
const states = [
  expected([1200, 1000, 450, 300]),
  expected([1200, 1000, 450, 300], false, 27),
  expected([1200, 1000, 450, 300], false, 27),
  expected([1200, 1000, 450, 300], false, 27),
  expected([1350, 1000, 450, 300], false, 27),
  expected([1350, 1000, 0, 300], false, 27),
  expected([1350, 1000, 0, 300], false, 27),
  expected([0, 0, 0, 0], false, 27),
  baseline,
  baseline,
  expected([1200, 850, 450, 300], true, 26),
  expected([1200, 850, 500, 300], true, 26),
  null,
  expected([1200, 850, 500, 300], true, 26),
  expected([1200, 850, 500, 300], true, 26),
]
async function values(wanted) {
  await page.waitForFunction(
    (targets) => {
      const actual = window.univerAPI
        .getDocument('linen-services-schedule')
        .getFormulas()
        .map((f) => f.getResult())
      return (
        actual.length === 12 &&
        actual.every(
          (r, i) =>
            r &&
            !r.stale &&
            (targets === null
              ? String(r.value).startsWith('#')
              : typeof targets[i] === 'number'
                ? r.status === 'success' && Math.abs(r.value - targets[i]) < 1e-9
                : r.value === targets[i]),
        )
      )
    },
    wanted,
    { timeout: 30000 },
  )
  const actual = await results()
  for (const [i, value] of actual.entries())
    if (String(value.value).startsWith('#') && value.status !== 'error')
      report.knownIssues.push({ gate: 'native-error-status', index: i, actual: value })
  report.results.push(actual)
}
async function chapter(number, name) {
  await page.mouse.move(1400, 500)
  await page.mouse.wheel(0, -20000)
  await settle()
  if (number === 3) {
    await page.mouse.wheel(0, 2200)
    await settle()
  }
  const texts = (number === 1 ? (await results()).slice(0, 6) : (await results()).slice(6)).map((r) => r.text)
  await page.waitForFunction(
    ({ labels, token }) =>
      [...window.docFrames.entries()].some(
        ([canvas, frame]) =>
          canvas.isConnected &&
          !canvas.closest('[data-u-comp="embed-float-dom"]') &&
          canvas.width > 700 &&
          frame.join('').includes(token) &&
          labels.every((s) => frame.join('').includes(s)),
      ),
    { labels: texts, token: number === 1 ? 'SCOPE' : 'ALLOCATION' },
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function expand() {
  if (await shell.count()) return
  const block = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="linen-base-block"]')
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
        .querySelector('[data-embed-id="linen-base-block"][data-u-comp="embed-float-dom"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="linen-base-block"]')
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
function includesPack(actual, pack) {
  for (const [key, value] of Object.entries(pack))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4312', { timeout: 60000 })
  await page.waitForFunction(
    () =>
      document.querySelector('.linen-embed')?.dataset.ready || document.querySelector('.linen-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
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
      api.setCurrent('linen-services-schedule')
    } finally {
      injector.get = get
    }
    window.readLinenPages = () => {
      const doc = api.getDocument('linen-services-schedule').save()
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
    return window.readLinenPages()
  })
  assert.equal(report.pagination.length, 3)
  for (const p of report.pagination) assert.deepEqual([p.pageWidth, p.pageHeight], [794, 1123])
  assert.ok(report.pagination[1].text.startsWith('02 /') && report.pagination[1].text.includes('\b'))
  assert.ok(report.pagination[2].text.startsWith('03 /'))
  await chapter(1, 'baseline')
  await chapter(3, 'allocation')
  for (const [i, wanted] of states.entries()) {
    if (i < 12) await expand()
    await page.evaluate(examples[i])
    await values(wanted)
    if (i === 5 || i === 6)
      assert.equal((await source()).tables.services.records['service-3'].values.fee, i === 5 ? null : 0)
    if (i >= 3 && i <= 8)
      assert.deepEqual(
        await page.evaluate(() =>
          window.univerAPI
            .getBase('linen-service-register')
            .getTableById('services')
            .getViewById('services-grid')
            .getProjection()
            .rows.map((r) => r.recordId),
        ),
        ['service-2', 'service-4'],
      )
    if (await shell.count()) await collapse()
    assert.deepEqual(await body(), originalBody)
    await chapter(1, 'example-' + (i + 1))
    await chapter(3, 'allocation-' + (i + 1))
    assert.deepEqual(await page.evaluate(() => window.readLinenPages()), report.pagination)
    report.checks.push({ example: i + 1, values: wanted, nativeCanvasAndPagination: true })
  }
  const projection = await page.evaluate(() => {
    const doc = window.univerAPI.getDocument('linen-services-schedule'),
      before = doc.save(),
      display = doc.saveFormulaDisplayTextSnapshot()
    return { before, after: doc.save(), display }
  })
  assert.deepEqual(projection.after, projection.before)
  for (const text of ['$2,550.00', '$300.00', '26.0', 'Optional work excluded'])
    assert.ok(projection.display.body.dataStream.includes(text), text)
  report.checks.push('Detached display-text projection preserves the entire live document')
  await page.evaluate(() => {
    window.basePoints = []
  })
  await expand()
  await page.waitForFunction(() => window.basePoints.some((p) => /^850(?:\.00)?$/.test(p.text)))
  const point = await page.evaluate(() => window.basePoints.findLast((p) => /^850(?:\.00)?$/.test(p.text)))
  await page.mouse.dblclick(point.x - 8, point.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('925')
  await page.keyboard.press('Enter')
  await values(expected([1200, 925, 500, 300], true, 26))
  assert.equal((await source()).tables.services.records['service-2'].values.fee, 925)
  await page.screenshot({ path: path.join(directory, 'native-base-input.png') })
  await collapse()
  await chapter(1, 'native-summary')
  await chapter(3, 'native-allocation')
  assert.deepEqual(await body(), originalBody)
  report.checks.push('Native Base keyboard input changes fee850->925 and both report chapters without replacing prose')
  for (const [locale, code] of [
    ['en-US', 'enUS'],
    ['zh-CN', 'zhCN'],
  ]) {
    await page.evaluate((value) => window.univerAPI.setLocale(value), code)
    for (const pack of ['docs-formula-ui', 'shape-editor-ui', 'embed-unit-ui', 'bases-ui'])
      includesPack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs-pro/' + pack + '/locale/' + locale)).default,
      )
    const before = await page.evaluate(() => ({
      doc: window.univerAPI.getDocument('linen-services-schedule').save(),
      base: window.univerAPI.getBase('linen-service-register').save(),
    }))
    await page.evaluate(() => window.univerAPI.toggleDarkMode(true))
    await settle()
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.deepEqual(
      await page.evaluate(() => ({
        doc: window.univerAPI.getDocument('linen-services-schedule').save(),
        base: window.univerAPI.getBase('linen-service-register').save(),
      })),
      before,
    )
    report.checks.push({ locale, wholeOfficialPacks: 4, themePreservesBothModels: true })
  }
  await page.evaluate(() => window.univerAPI.setLocale('enUS'))
  await expand()
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await root.waitFor({ state: 'detached' })
  await shell.waitFor({ state: 'detached' })
  await settle()
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  report.checks.push('Active Base fullscreen disposal releases owner, shell and global API')
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0
} catch (e) {
  report.failure = e.stack
  report.lastResults = await results().catch(() => [])
  report.lastSource = await source().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, results: undefined, lastSource: undefined }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
