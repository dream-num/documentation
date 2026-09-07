/* eslint-disable no-await-in-loop -- Compare actual native chart paint after each public Facade action. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://127.0.0.1:4208'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheet-charts')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [], networkWrites: [], images: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()))
    report.networkWrites.push({ url: request.url(), nextAction: !!request.headers()['next-action'] })
})
const root = page.locator('.sheet-charts-demo')
const ready = () => page.locator('.sheet-charts-demo[data-ready="true"]').waitFor()
const read = async () => JSON.parse(await root.locator('pre').textContent())
const controls = async () => {
  const panel = root.locator('.chart-controls')
  if (!(await panel.evaluate((e) => e.open))) await panel.locator('summary').click()
}
const action = async (name) => {
  await controls()
  await root.locator(`[data-action="${name}"]`).click()
  await ready()
  assert.doesNotMatch(await root.getByRole('status').textContent(), /Action failed/)
}
const wait = (check, arg) =>
  page.waitForFunction(
    ({ predicate, arg: value }) => {
      const text = document.querySelector('.sheet-charts-demo pre')?.textContent
      return text && new Function('s', 'a', `return (${predicate})(s,a)`)(JSON.parse(text), value)
    },
    { predicate: check.toString(), arg },
  )
// Read pixels from the native main canvas, not a host chart or data-only stand-in.
const paint = () =>
  root.locator('canvas[id^="univer-sheet-main-canvas"]').evaluate((canvas) => {
    const { charts } = JSON.parse(document.querySelector('.sheet-charts-demo pre').textContent)
    const info = charts[0]?.info
    if (!info) return { hash: 0, colored: 0 }
    const x = Math.round(info.position.x + 5),
      y = Math.round(info.position.y + 5)
    const width = Math.min(Math.round(info.size.width - 10), canvas.width - x)
    const height = Math.min(Math.round(info.size.height - 10), canvas.height - y)
    const bytes = canvas.getContext('2d').getImageData(x, y, width, height).data
    let hash = 2166136261,
      colored = 0
    for (let i = 0; i < bytes.length; i += 4) {
      for (let c = 0; c < 4; c++) hash = Math.imul(hash ^ bytes[i + c], 16777619) >>> 0
      if (
        bytes[i + 3] > 100 &&
        Math.max(bytes[i], bytes[i + 1], bytes[i + 2]) - Math.min(bytes[i], bytes[i + 1], bytes[i + 2]) > 70
      )
        colored++
    }
    return { hash, colored }
  })
async function settledPaint(previous) {
  const deadline = Date.now() + 15000
  let last,
    stable = 0
  while (Date.now() < deadline) {
    const current = await paint()
    if (current.colored > 80 && current.hash !== previous && last?.hash === current.hash) stable++
    else stable = 0
    if (stable >= 2) return current
    last = current
    await page.waitForTimeout(150)
  }
  throw new Error(
    `Native chart did not settle to changed non-empty paint: ${JSON.stringify(last)}, previous=${previous}`,
  )
}
const capture = (name) => root.screenshot({ path: path.join(directory, name + '.png') })
async function png(name) {
  await controls()
  const pending = page.waitForEvent('download')
  await action('png')
  const downloaded = await pending
  const destination = path.join(directory, name + '.png')
  await downloaded.saveAs(destination)
  const bytes = await fs.readFile(destination)
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  const dimensions = { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
  assert.ok(dimensions.width >= 450 && dimensions.height >= 250)
  assert.ok(bytes.length > 3000)
  report.images.push({ name, bytes: bytes.length, ...dimensions })
  return bytes
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  await ready()
  await controls()
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  let state = await read()
  const original = state.monthly,
    quarters = state.quarters,
    id = state.charts[0].id
  const canvasSize = await root
    .locator('canvas[id^="univer-sheet-main-canvas"]')
    .evaluate((canvas) => ({ width: canvas.width, height: canvas.height }))
  assert.ok(
    state.charts[0].info.position.x + state.charts[0].info.size.width <= canvasSize.width,
    'Initial chart fits horizontally',
  )
  assert.ok(
    state.charts[0].info.position.y + state.charts[0].info.size.height <= canvasSize.height,
    'Initial chart is not vertically clipped in the preview',
  )
  assert.equal(original.length, 25)
  assert.deepEqual(
    original.slice(5, 10).map((row) => row[1]),
    [-18, -42, 0, null, 37.5],
  )
  let pixels = await settledPaint()
  const originalPng = await png('initial-column-native-export')
  await capture('column')
  report.checks.push(
    'Native opaque-white CSS, original 24-month edge-case fixture, actual chart paint and PNG signature/dimensions',
  )

  await root.getByLabel('Chart variant', { exact: true }).selectOption('line')
  await action('variant')
  await wait((s) => s.charts[0].type === 'line')
  report.fullUpdateUndo = []
  for (let step = 0; step < 3; step++) {
    await action('undo')
    report.fullUpdateUndo.push((await read()).charts[0].type)
    if (process.argv.includes('--atomic-history') && step === 0)
      assert.equal(
        (await read()).charts[0].type,
        'column',
        'FChart.update promises one history item: one Undo must restore the prior type',
      )
  }
  assert.deepEqual(
    report.fullUpdateUndo,
    ['line', 'line', 'column'],
    'Track the beta.2 three-step defect explicitly; a future SDK fix requires updating this boundary test',
  )
  for (let step = 0; step < 3; step++) await action('redo')
  assert.equal((await read()).charts[0].type, 'line')
  for (let step = 0; step < 3; step++) await action('undo')
  assert.equal((await read()).charts[0].type, 'column')
  await root.getByLabel('Chart variant', { exact: true }).selectOption('column')
  pixels = await settledPaint()
  report.checks.push(
    'Observed SDK limitation: full update needs three Undo steps; --atomic-history strictly checks the unmet one-step contract',
  )

  await action('write')
  await wait((s) => s.monthly[1][1] === 210)
  pixels = await settledPaint(pixels.hash)
  const editedPng = await png('column-edited-native-export')
  assert.notDeepEqual(editedPng, originalPng, 'Native image export follows source edits')
  await action('undo')
  await wait((s) => s.monthly[1][1] === 142)
  pixels = await settledPaint(pixels.hash)
  await action('redo')
  await wait((s) => s.monthly[1][1] === 210)
  pixels = await settledPaint(pixels.hash)
  await root.getByLabel('MWh', { exact: true }).fill('501')
  await root.locator('[data-action="write"]').click()
  await ready()
  assert.match(await root.getByRole('status').textContent(), /between -500 and 500/)
  assert.equal((await read()).monthly[1][1], 210)
  await root.getByLabel('MWh', { exact: true }).fill('0')
  await action('write')
  await wait((s) => s.monthly[1][1] === 0)
  pixels = await settledPaint(pixels.hash)
  await action('clear')
  await wait((s) => s.monthly[1][1] === null)
  // Zero and blank both have zero-height bars; they must remain different in data.
  report.checks.push(
    'Source edit changes native paint and export; Undo/Redo, zero/blank distinction and invalid-input rejection',
  )

  for (const variant of ['line', 'bar', 'area', 'theme', 'multilevel', 'column']) {
    pixels = await settledPaint()
    await root.getByLabel('Chart variant', { exact: true }).selectOption(variant)
    await action('variant')
    await wait((s, a) => s.charts[0].type === a, ['theme', 'multilevel'].includes(variant) ? 'column' : variant)
    state = await read()
    assert.equal(state.charts[0].id, id)
    assert.deepEqual(state.quarters, quarters)
    if (variant === 'multilevel') {
      assert.equal(state.charts[0].info.dataSource.range.startRow, 30)
      assert.match(JSON.stringify(state.charts[0].info.config), /multiLevel/)
    }
    if (variant === 'theme') assert.match(JSON.stringify(state.charts[0].info.config), /aster-warm/)
    await settledPaint(pixels.hash)
    await png(variant + '-native-export')
    await capture(variant)
  }
  report.checks.push('Six native variants preserve chart ID and source cells; each repaints and exports PNG')

  for (const period of ['2025', '2026', 'all']) {
    pixels = await settledPaint()
    await root.getByLabel('Source period', { exact: true }).selectOption(period)
    await action('source')
    const source = (await read()).charts[0].info.dataSource
    if (period === 'all') assert.equal(source.range.endRow, 26)
    else {
      assert.equal(source.ranges.length, 4)
      assert.equal(source.ranges[0].range.startRow, period === '2025' ? 3 : 15)
    }
    await settledPaint(pixels.hash)
  }
  const prior = structuredClone((await read()).charts[0].info)
  pixels = await settledPaint()
  await action('style')
  await wait((s) => s.charts[0].info.config.title.text === 'Aster · source-linked comparison')
  await settledPaint(pixels.hash)
  assert.deepEqual((await read()).charts[0].info.dataSource, prior.dataSource)
  await action('undo')
  await wait((s, a) => s.charts[0].info.config.title.text === a, prior.config.title.text)
  await action('redo')
  await wait((s) => s.charts[0].info.config.title.text === 'Aster · source-linked comparison')
  for (const property of ['palette', 'legend']) {
    pixels = await settledPaint()
    const before = (await read()).charts[0].info.config
    await root.getByLabel('Style property', { exact: true }).selectOption(property)
    await action('style')
    await settledPaint(pixels.hash)
    const after = (await read()).charts[0].info.config
    assert.notDeepEqual(after[property], before[property])
    await action('undo')
    assert.deepEqual((await read()).charts[0].info.config[property], before[property])
    await action('redo')
    assert.deepEqual((await read()).charts[0].info.config[property], after[property])
  }
  await action('size')
  await wait((s) => s.charts[0].info.size.width === 480 && s.charts[0].info.size.height === 280)
  await settledPaint()
  await png('resized-native-export')
  report.checks.push('Three real source mappings, style update/history and size with native export')

  // A genuine native grid edit, not only a host button mutating the data.
  const nameBox = root.locator('.charts-editor input.univer-size-full')
  await nameBox.fill('B4')
  await nameBox.press('Enter')
  await page.keyboard.type('88')
  await page.keyboard.press('Enter')
  await action('inspect')
  await wait((s) => s.monthly[1][1] === 88)
  await root.getByLabel('Chart variant', { exact: true }).selectOption('line')
  await action('create')
  await wait((s) => s.charts.length === 2)
  const secondId = (await read()).target
  assert.notEqual(secondId, id)
  await action('remove')
  await wait((s) => s.charts.length === 1)
  await action('undo')
  await wait((s) => s.charts.length === 2)
  await action('redo')
  await wait((s) => s.charts.length === 1)
  const download = page.waitForEvent('download')
  await action('json')
  const file = await download
  const jsonPath = path.join(directory, 'workbook.json')
  await file.saveAs(jsonPath)
  const snapshot = JSON.parse(await fs.readFile(jsonPath, 'utf8'))
  assert.equal(snapshot.sheets.energy.cellData[3][1].v, 88)
  assert.ok(snapshot.resources.some((r) => r.data.includes(id)))
  await action('empty')
  await wait((s) => s.monthly.slice(1).every((row) => row.slice(1).every((v) => v === null)))
  assert.deepEqual((await read()).quarters, quarters)
  const beforeReset = (await read()).unitId
  await action('reset')
  await wait((s) => s.charts.length === 1 && s.monthly[1][1] === 142)
  state = await read()
  assert.notEqual(state.unitId, beforeReset)
  assert.deepEqual(state.monthly, original)
  await settledPaint()
  await action('remove')
  await wait((s) => s.charts.length === 0)
  assert.equal(await root.locator('[data-action="png"]').isDisabled(), true)
  await action('create')
  await wait((s) => s.charts.length === 1)
  report.checks.push(
    'Native grid input, multiple chart IDs, remove/history, downloaded snapshot bytes, Empty and fresh-unit Reset',
  )

  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await action('reveal')
    assert.ok(await root.locator('[data-u-comp="workbench-layout"]').isVisible())
    assert.ok(await root.evaluate((e) => e.scrollWidth <= e.clientWidth + 1))
    await capture('narrow-' + width)
  }
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator('.sheet-charts-demo[data-theme="' + theme + '"][data-ready="true"]').waitFor()
      await wait((s) => s.charts.length === 1 && s.monthly[1][1] === 142)
      await capture('theme-' + theme)
    }
    for (const [locale, heading, labels] of [
      ['en-US', 'Charts', ['Variants', 'Actions', 'States']],
      ['zh-CN', '图表', ['变体', '操作', '状态']],
    ]) {
      await page.goto(new URL(url).origin + '/' + locale + '/showcase/sheets/charts', {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { name: heading, level: 1, exact: true }).waitFor()
      for (const name of labels) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.sheet-charts-demo[data-ready="true"]').waitFor()
      const panel = embedded.locator('.chart-controls')
      if (!(await panel.evaluate((e) => e.open))) await panel.locator('summary').click()
      await embedded.getByLabel('MWh', { exact: true }).fill('123')
      await embedded.locator('[data-action="write"]').focus()
      await page.keyboard.press('Space')
      const frame = page.frames().find((item) => item.url().includes('/playground/'))
      await frame.waitForFunction(
        () => JSON.parse(document.querySelector('.sheet-charts-demo pre').textContent).monthly[1][1] === 123,
      )
      const branch = page.locator('aside button').first()
      await branch.click()
      await page.waitForFunction(
        () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
      )
      await branch.click()
      await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
    }
    report.checks.push(
      'Both themes, EN/ZH card-free detail pages, hydrated tree and keyboard Facade writes inside real iframes',
    )
  }
  assert.deepEqual(report.errors, [])
  assert.ok(
    report.networkWrites.every((r) => r.nextAction),
    'Demo controls must not send remote writes',
  )
  report.checks.push('390/320/760 host layout and native chart reveal; no browser errors or demo network writes')
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await capture('failure').catch(() => {})
  report.state = await read().catch(() => null)
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
assert.equal(report.passed, true)
