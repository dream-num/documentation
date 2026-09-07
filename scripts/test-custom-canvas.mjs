/* eslint-disable no-await-in-loop -- Exercise one real native canvas state at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/custom-canvas')
const url = process.env.SHOWCASE_DEMO_URL || 'http://127.0.0.1:4206'
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [], networkWrites: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()))
    report.networkWrites.push({
      url: request.url(),
      method: request.method(),
      nextAction: !!request.headers()['next-action'],
      frame: request.frame().url(),
    })
})
const root = page.locator('.seed-canvas-demo')
const read = async () => JSON.parse(await root.locator('pre').textContent())
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const ready = () => page.locator('.seed-canvas-demo[data-ready="true"]').waitFor()
const controls = async () => {
  if (!(await root.locator('.seed-canvas-controls').evaluate((e) => e.open)))
    await root.locator('.seed-canvas-controls > summary').click()
}
const action = async (name) => {
  await controls()
  await root.locator(`[data-action="${name}"]`).click()
  await ready()
  await settle()
  assert.doesNotMatch(await root.getByRole('status').textContent(), /Action failed/)
}
const wait = (check, arg) =>
  page.waitForFunction(
    ({ predicate, arg: value }) => {
      const text = document.querySelector('.seed-canvas-demo pre')?.textContent
      return text && new Function('s', 'a', `return (${predicate})(s,a)`)(JSON.parse(text), value)
    },
    { predicate: check.toString(), arg },
  )
const drawing = () =>
  root.locator('canvas[id^="univer-sheet-main-canvas"]:visible').evaluate((canvas) => {
    const colors = {
      teal: [13, 148, 136],
      amber: [217, 119, 6],
      rose: [190, 18, 60],
      invalid: [225, 29, 72],
      violet: [124, 58, 237],
      track: [203, 213, 225],
    }
    const counts = Object.fromEntries(Object.keys(colors).map((key) => [key, 0]))
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
    for (let i = 0; i < data.length; i += 4)
      for (const [key, color] of Object.entries(colors))
        // Header cache compositing may round a channel by one; reject translucent edge pixels.
        if (
          Math.abs(data[i] - color[0]) <= 1 &&
          Math.abs(data[i + 1] - color[1]) <= 1 &&
          Math.abs(data[i + 2] - color[2]) <= 1 &&
          data[i + 3] === 255
        )
          counts[key]++
    return counts
  })
const pixel = (x, y) =>
  root
    .locator('canvas[id^="univer-sheet-main-canvas"]:visible')
    .evaluate(
      (canvas, [sampleX, sampleY]) => [...canvas.getContext('2d').getImageData(sampleX, sampleY, 1, 1).data],
      [x, y],
    )
const css = async () => {
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  assert.equal(
    await root
      .locator('.univer-flex')
      .first()
      .evaluate((e) => getComputedStyle(e).display),
    'flex',
  )
}
const capture = (name) => root.screenshot({ path: path.join(directory, `${name}.png`) })
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await ready()
  await wait((s) => typeof s.rawValues[28][3] === 'number')
  await settle()
  await css()
  const baseline = (await read()).rawValues
  assert.deepEqual(
    baseline.slice(3, 12).map((row) => row[2]),
    [87, 25, 100, 0, 52.5, null, 'pending', -10, 120],
  )
  assert.equal((await read()).displayValues[0][0], '87.0%')
  assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255], 'C4 bar uses actual cumulative row/column geometry')
  assert.deepEqual(await pixel(330, 282), [203, 213, 225, 255], 'Zero C7 has track, no value fill')
  const initial = await drawing()
  report.initialPaint = initial
  assert.ok(initial.teal > 100 && initial.violet > 100 && initial.invalid > 20)
  await capture('initial')
  report.checks.push('Varied raw/display data, exact C4/zero pixels and native white CSS')
  await controls()
  await root.getByLabel('Render layers', { exact: true }).selectOption('none')
  await action('apply')
  const native = await drawing()
  for (const name of ['teal', 'amber', 'rose', 'invalid', 'violet']) assert.equal(native[name], 0, name + ' removed')
  assert.deepEqual((await read()).rawValues, baseline)
  await root.getByLabel('Render layers', { exact: true }).selectOption('main')
  await action('apply')
  assert.equal((await drawing()).violet, 0)
  assert.ok((await drawing()).teal > 100)
  await root.getByLabel('Render layers', { exact: true }).selectOption('headers')
  await action('apply')
  assert.equal((await drawing()).track, 0)
  assert.ok((await drawing()).violet > 100)
  await root.getByLabel('Render layers', { exact: true }).selectOption('all')
  await action('apply')
  const reapplied = await drawing()
  await action('apply')
  assert.deepEqual(await drawing(), reapplied, 'Repeated registration in the same viewport does not duplicate painting')
  report.checks.push('All four layer combinations actually repaint; registration preserves data')
  await root.getByLabel('Render style', { exact: true }).selectOption('dots')
  await action('apply')
  assert.ok((await drawing()).violet > initial.violet)
  assert.deepEqual((await read()).rawValues, baseline)
  await capture('dots')
  report.checks.push('Dot variant changes real canvas without changing values')
  await root.getByLabel('Render style', { exact: true }).selectOption('bar')
  await action('apply')
  await root.getByLabel('Germination value', { exact: true }).fill('52.5')
  await action('write')
  await wait((s) => s.rawValues[3][2] === 52.5)
  assert.deepEqual(await pixel(330, 168), [217, 119, 6, 255])
  await action('undo')
  await wait((s) => s.rawValues[3][2] === 87)
  await action('redo')
  await wait((s) => s.rawValues[3][2] === 52.5)
  await action('clear')
  await wait((s) => s.rawValues[3][2] === null)
  await action('invalid')
  await wait((s) => s.rawValues[3][2] === 'pending')
  assert.deepEqual(await pixel(330, 168), [225, 29, 72, 255])
  for (const value of ['0', '100', '-10', '120']) {
    await root.getByLabel('Germination value', { exact: true }).fill(value)
    await action('write')
    await wait((s, a) => s.rawValues[3][2] === a, Number(value))
  }
  await root.getByLabel('Germination value', { exact: true }).fill('1000001')
  await root.locator('[data-action="write"]').click()
  assert.match(await root.getByRole('status').textContent(), /Action failed/)
  assert.equal((await read()).rawValues[3][2], 120)
  report.checks.push('Write/clear/text/boundary values, rejected host input and native Undo/Redo')
  await action('reset')
  await controls()
  await root.getByLabel('Cell geometry', { exact: true }).selectOption('compact')
  await action('geometry')
  await wait((s) => s.row4Height === 24 && s.columnCWidth === 90)
  await capture('compact')
  await action('undo')
  await wait((s) => s.columnCWidth === 170 && s.row4Height === 24)
  await action('undo')
  await wait((s) => s.row4Height === 38)
  await root.getByLabel('Cell geometry', { exact: true }).selectOption('large')
  await action('geometry')
  await wait((s) => s.row4Height === 52 && s.columnCWidth === 220)
  await capture('large')
  await root.getByLabel('Cell geometry', { exact: true }).selectOption('normal')
  await action('geometry')
  await action('row')
  await wait((s) => s.row8Hidden)
  await action('row')
  await wait((s) => !s.row8Hidden)
  await action('column')
  await wait((s) => s.columnCHidden)
  assert.equal((await drawing()).track, 0)
  await action('column')
  await wait((s) => !s.columnCHidden)
  // showColumns selects C:C; remove its translucent selection overlay before sampling renderer colors.
  await root.locator('.seed-canvas-editor input.univer-size-full').fill('A1')
  await root.locator('.seed-canvas-editor input.univer-size-full').press('Enter')
  await settle()
  assert.ok((await drawing()).track > 100)
  report.checks.push('Two-step geometry Undo and row/column hide/show')
  await action('far')
  await wait((s) => s.scroll.sheetViewStartRow > 0)
  await capture('scrolled')
  assert.ok((await drawing()).track > 100)
  await action('top')
  await action('freeze')
  await wait((s) => s.freeze.ySplit === 3)
  await action('far')
  await capture('frozen-scrolled')
  assert.ok((await drawing()).track > 100)
  assert.deepEqual(await pixel(330, 168), [13, 148, 136, 255], 'First unfrozen row C24 starts below the frozen labels')
  assert.deepEqual(await pixel(450, 168), [203, 213, 225, 255], 'C24 74% bar ends before the track end')
  for (const value of ['75', '150']) {
    await root.getByLabel('Canvas zoom', { exact: true }).selectOption(value)
    await action('zoom')
    await wait((s, a) => s.zoom === a, Number(value) / 100)
    assert.ok((await drawing()).track > 50)
    await capture('zoom-' + value)
  }
  report.checks.push('Scrolled/frozen viewports and 75%/150% zoom retain native painting')
  await action('sheet')
  await wait((s) => s.activeSheet === 'reference')
  assert.equal((await drawing()).violet, 0)
  assert.equal((await drawing()).track, 0)
  await action('sheet')
  await wait((s) => s.activeSheet === 'lots')
  assert.ok((await drawing()).track > 50)
  report.checks.push('Other worksheet has no leaked overlay')
  await action('reset')
  await controls()
  const namebox = root.locator('.seed-canvas-editor input.univer-size-full')
  await namebox.fill('C4')
  await namebox.press('Enter')
  await page.keyboard.type('43')
  await page.keyboard.press('Enter')
  await wait((s) => s.rawValues[3][2] === 43)
  await settle()
  assert.deepEqual(await pixel(330, 168), [217, 119, 6, 255])
  await capture('native-edit')
  report.checks.push('Native keyboard edit repaints custom extension')
  const downloadPromise = page.waitForEvent('download')
  await action('download')
  const download = await downloadPromise
  const savedPath = path.join(directory, download.suggestedFilename())
  await download.saveAs(savedPath)
  const saved = JSON.parse(await fs.readFile(savedPath, 'utf8'))
  assert.equal(saved.sheets.lots.cellData[3][2].v, 43)
  assert.ok(!JSON.stringify(saved).includes('hostRenderConfiguration'))
  await root.getByLabel('Render layers', { exact: true }).selectOption('none')
  await action('apply')
  await action('reload')
  await wait((s) => s.rawValues[3][2] === 43 && s.hostRenderConfiguration.handleCount === 3)
  await action('undo')
  assert.equal((await read()).rawValues[3][2], 43)
  await action('empty')
  await wait((s) => s.rawValues.slice(3, 27).every((row) => row[2] === null))
  assert.equal((await read()).rawValues[30][0], baseline[30][0])
  await action('reset')
  await wait((s) => s.rawValues[3][2] === 87)
  report.checks.push('Actual download, reload default extensions with preserved data, cleared history, Empty and Reset')
  for (const width of [320, 390, 760]) {
    await page.setViewportSize({ width, height: 900 })
    await settle()
    if (await root.locator('.seed-canvas-controls').evaluate((e) => e.open))
      await root.locator('.seed-canvas-controls > summary').click()
    await namebox.fill('C4')
    await namebox.press('Enter')
    await settle()
    await css()
    await capture('width-' + width)
    assert.ok(await root.evaluate((e) => e.scrollWidth <= e.clientWidth + 1))
  }
  report.checks.push('320/390/760 widths: native C4 navigation, white editor and no host horizontal overflow')
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator('.seed-canvas-demo[data-theme="' + theme + '"][data-ready="true"]').waitFor()
      await wait((s) => s.rawValues[3][2] === 87)
      await controls()
      await root.getByLabel('Germination value', { exact: true }).fill('63')
      await action('write')
      await wait((s) => s.rawValues[3][2] === 63)
      await capture('theme-' + theme)
    }
    for (const [locale, title, headings] of [
      ['en-US', 'Custom Canvas Rendering', ['Variants', 'Actions', 'States']],
      ['zh-CN', '自定义 Canvas 绘制', ['变体', '操作', '状态']],
    ]) {
      await page.goto(new URL(url).origin + '/' + locale + '/showcase/sheets/custom-canvas', {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.seed-canvas-demo[data-ready="true"]').waitFor()
      const panel = embedded.locator('.seed-canvas-controls')
      if (!(await panel.evaluate((e) => e.open))) await panel.locator('summary').click()
      await embedded.getByLabel('Germination value', { exact: true }).fill('63')
      // A real keyboard activation, not a synthetic handler call.
      await embedded.locator('[data-action="write"]').focus()
      await page.keyboard.press('Space')
      const frame = page.frames().find((item) => item.url().includes('/playground/'))
      await frame.waitForFunction(
        () => JSON.parse(document.querySelector('.seed-canvas-demo pre').textContent).rawValues[3][2] === 63,
      )
      const branch = page.locator('aside button').first()
      await branch.click()
      await page.waitForFunction(
        () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
      )
      await branch.click()
      await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
    }
    report.checks.push('EN/ZH 8/6/5 guides, hydrated tree, keyboard-activated iframe writes and both themes')
  }
  assert.deepEqual(report.errors, [])
  assert.ok(
    report.networkWrites.every((item) => item.nextAction && item.frame.includes('/showcase/')),
    'Only documentation shell server actions may write to the network',
  )
  report.passed = true
} catch (error) {
  report.lastState = await read().catch(() => null)
  await capture('failure').catch(() => {})
  report.failure = error.stack || String(error)
  process.exitCode = 1
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
