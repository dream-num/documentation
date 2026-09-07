/* eslint-disable no-await-in-loop -- Run the published examples in their documented order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-pollen-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheet-to-modern-doc/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 17)
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
const root = page.locator('.pollen-embed')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const body = () => page.evaluate(() => window.univerAPI.getDocument('pollen-campaign-brief').save().body)
const source = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('pollen-channel-source').save())))
const results = () =>
  page.evaluate(() =>
    window.univerAPI
      .getDocument('pollen-campaign-brief')
      .getFormulas()
      .map((f) => f.getResult()),
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

const sum = (a) => a.reduce((n, v) => n + (typeof v === 'number' ? v : 0), 0)
const baseline = expected()
function expected(
  spends = [4800, 2200, 5000],
  revenues = [8640, 5280, 4680],
  visits = [2400, 1600, 3000],
  orders = [96, 88, 78],
  target = 0.5,
) {
  const spend = sum(spends),
    revenue = sum(revenues),
    count = sum(visits),
    order = sum(orders)
  const rate = spend ? (revenue - spend) / spend : '#DIV/0!'
  return [
    spend,
    revenue,
    revenue - spend,
    rate,
    count,
    order,
    count ? order / count : '#DIV/0!',
    ...spends.map((v, i) => (typeof v === 'string' ? '#VALUE!' : v ? (revenues[i] - v) / v : '#DIV/0!')),
    target,
    typeof rate === 'number' ? rate - target : rate,
    typeof rate === 'number' ? (rate >= target ? 'Keep learning' : 'Review the channel mix') : rate,
  ]
}
const scenarios = [
  expected([6300, 2200, 5000]),
  expected([6300, 2200, 5000], [8640, 6000, 4680]),
  expected([6300, 2200, 5000], [8640, 6000, 4680], [2400, 1600, 3000], [96, 88, 78], 0.6),
  expected([6300, 2200, 5000], [8640, 6000, 4680], [2400, 1600, 3000], [96, 88, 78], 0.6),
  expected([6300, 2200, 5000], [8640, 6000, 4680], [2400, 1600, 3000], [120, 88, 78], 0.6),
  expected([6300, 2200, 5000], [8640, 6000, 4680], [2400, 0, 3000], [120, 88, 78], 0.6),
  expected([6300, 2200, 5000], [8640, 6000, 4680], [2400, 0, 3000], [120, 88, 78], 0.6),
  expected([6300, 2200, 0], [8640, 6000, 4680], [2400, 0, 3000], [120, 88, 78], 0.6),
  expected([6300, 2200, 'pending'], [8640, 6000, 4680], [2400, 0, 3000], [120, 88, 78], 0.6),
  baseline,
  expected([0, 0, 0]),
  baseline,
  expected([5100, 2200, 5000]),
  null,
  expected([5100, 2200, 5000]),
  expected([5100, 2200, 5000]),
  expected([5100, 2200, 5000]),
]
async function values(wanted) {
  await page.waitForFunction(
    (targets) => {
      const actual = window.univerAPI
        .getDocument('pollen-campaign-brief')
        .getFormulas()
        .map((f) => f.getResult())
      return (
        actual.length === 13 &&
        actual.every(
          (r, i) =>
            r &&
            !r.stale &&
            (targets === null
              ? typeof r.value === 'string' && r.value.startsWith('#')
              : typeof targets[i] === 'number'
                ? typeof r.value === 'number' && Math.abs(r.value - targets[i]) < 1e-9
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
  await page.mouse.move(1400, 500)
  await page.mouse.wheel(0, -20000)
  await settle()
  const texts = (await results()).map((r) => r.text)
  await page.waitForFunction(
    (targets) =>
      [...window.docFrames.entries()].some(([canvas, glyphs]) => {
        const joined = glyphs.join('')
        return (
          canvas.isConnected &&
          canvas.width > 700 &&
          !canvas.closest('[data-embed-id]') &&
          joined.includes('A good total') &&
          targets.every((v) => joined.includes(v))
        )
      }),
    texts,
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function expand() {
  if (await shell.count()) return
  const block = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="pollen-sheet-block"]')
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
        .querySelector('[data-embed-id="pollen-sheet-block"][data-u-comp="embed-float-dom"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="pollen-sheet-block"]')
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
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4324', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () =>
      document.querySelector('.pollen-embed')?.dataset.ready || document.querySelector('.pollen-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  assert.equal(await root.locator('[data-u-comp="embed-float-dom"]').count(), 1)
  await values(baseline)
  const originalBody = await body()
  report.documentStyle = await page.evaluate(
    () => window.univerAPI.getDocument('pollen-campaign-brief').save().documentStyle,
  )
  assert.equal(report.documentStyle.documentFlavor, (await import('@univerjs/core')).DocumentFlavor.MODERN)
  assert.ok(originalBody.paragraphs.every((p) => !p.paragraphStyle?.pageBreakBefore))
  await showSummary('baseline')
  for (const [i, wanted] of scenarios.entries()) {
    await page.evaluate(examples[i])
    await values(wanted)
    assert.deepEqual(
      await body(),
      originalBody,
      'Every authored character, paragraph style and custom range stays intact',
    )
    if (i === 5) assert.equal((await source()).sheets.channels.cellData[5][3]?.v, undefined)
    if (i === 6) assert.equal((await source()).sheets.channels.cellData[5][3].v, 0)
    await showSummary('example-' + (i + 1))
    report.checks.push({ example: i + 1, bodyPreserved: true })
    console.log('Pollen example ' + (i + 1) + ' current canvas PASS')
  }
  const projection = await page.evaluate(() => {
    const doc = window.univerAPI.getDocument('pollen-campaign-brief')
    const before = doc.save(),
      display = doc.saveFormulaDisplayTextSnapshot()
    return { before, after: doc.save(), display }
  })
  assert.deepEqual(projection.after, projection.before)
  assert.ok(projection.display.body.dataStream.includes('$12,300'))
  report.checks.push('Detached reading copy does not mutate live bindings')
  await gate('native-source-keyboard-history', async () => {
    await expand()
    for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
      await shell.getByRole('tab', { name, exact: true }).click()
      assert.ok(await shell.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
    }
    await shell.getByRole('tab', { name: 'Start', exact: true }).click()
    const point = await page.evaluate(() => {
      const sheet = window.univerAPI.getWorkbook('pollen-channel-source').save().sheets.channels
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
      () => window.univerAPI.getWorkbook('pollen-channel-source').getActiveRange()?.getA1Notation() === 'B5',
    )
    const before = await source()
    await page.keyboard.type('6300')
    await page.keyboard.press('Enter')
    await values(scenarios[0])
    const after = await source()
    await page.keyboard.press('Control+z')
    await values(expected([5100, 2200, 5000]))
    assert.deepEqual(await source(), before)
    await page.keyboard.press('Control+y')
    await values(scenarios[0])
    assert.deepEqual(await source(), after)
    assert.deepEqual(await body(), originalBody)
    await page.screenshot({ path: path.join(directory, 'native-source.png') })
    await collapse()
    await showSummary('native-updated')
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
      workbook: 'pollen-channel-source',
      sheet: 'channels',
    })
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await cancel.click()
  })
  const factory = await fs.readFile('showcase/embed/sheet-to-modern-doc/code/create-demo.ts', 'utf8')
  for (const locale of ['enUS', 'zhCN']) {
    await page.evaluate((value) => window.univerAPI.setLocale(value), locale)
    const language = locale === 'enUS' ? 'en-US' : 'zh-CN'
    const paths = [...factory.matchAll(/import \w+ from '([^']+\/locales?\/(?:en-US|zh-CN))'/g)]
      .map((m) => m[1])
      .filter((p) => p.endsWith(language))
    assert.equal(paths.length, 21)
    const actualLocales = await page.evaluate(() => window.univerAPI.getLocales())
    for (const p of paths) includesPack(actualLocales, (await import(p)).default)
    report.checks.push({ locale, wholeDependencyPacks: paths.length })
    const before = await page.evaluate(() => ({
      host: window.univerAPI.getDocument('pollen-campaign-brief').save(),
      sheet: window.univerAPI.getWorkbook('pollen-channel-source').save(),
    }))
    await page.evaluate(() => {
      window.pollenOwner = window.univerAPI
      window.univerAPI.toggleDarkMode(true)
    })
    await settle()
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.equal(await page.evaluate(() => window.pollenOwner === window.univerAPI), true)
    assert.deepEqual(
      await page.evaluate(() => ({
        host: window.univerAPI.getDocument('pollen-campaign-brief').save(),
        sheet: window.univerAPI.getWorkbook('pollen-channel-source').save(),
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
