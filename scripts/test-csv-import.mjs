/* eslint-disable no-await-in-loop -- Exercise one draft and native workbook history at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { parseCsv } from '../showcase/sheets/csv-import-plugin/code/csv-plugin/utils.ts'
import { CSV_SAMPLES } from '../showcase/sheets/csv-import-plugin/code/data.ts'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/csv-import-plugin'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/csv-import')
const imported = (state, rows) =>
  rows.every((record, r) => record.every((value, c) => state.sheets[0].values[r + 3][c + 1] === value))
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
await page.addInitScript(() => {
  window.csvPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, x, y, ...args) {
    if (String(text).includes('Cable') || String(text).includes('Fuse')) {
      const point = new DOMPoint(x, y).matrixTransform(this.getTransform())
      if (window.csvPaint.length < 200) window.csvPaint.push({ text: String(text), y: point.y })
    }
    return fillText.call(this, text, x, y, ...args)
  }
})
const report = { passed: false, errors: [], writesToNetwork: [], checks: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  if (request.method() !== 'GET' && request.method() !== 'HEAD')
    report.writesToNetwork.push({
      method: request.method(),
      url: request.url(),
      frame: request.frame().url(),
      nextAction: !!request.headers()['next-action'],
    })
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.csv-demo')
  const ready = () => page.locator('.csv-demo[data-ready="true"][data-busy="false"]').waitFor({ timeout: 90000 })
  const read = async () => JSON.parse(await root.locator('pre').textContent())
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const wait = (check, arg) =>
    page.waitForFunction(
      ({ predicate, value }) => {
        const text = document.querySelector('.csv-demo pre')?.textContent
        return text && new Function('s', 'a', `return (${predicate})(s,a)`)(JSON.parse(text), value)
      },
      { predicate: check.toString(), value: arg },
    )
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const action = async (name, rejected = false) => {
    await root.locator(`[data-action="${name}"]`).click()
    await ready()
    await settle()
    const status = await root.getByRole('status').textContent()
    if (rejected) assert.match(status, /^Rejected:/)
    else assert.doesNotMatch(status, /^Rejected:/)
    const native = await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      white: getComputedStyle(el).getPropertyValue('--univer-gray-0').trim(),
    }))
    if ((await root.getAttribute('data-theme')) === 'light') assert.equal(native.background, 'rgb(255, 255, 255)')
    assert.ok(native.white)
  }
  const load = async (id) => {
    await root.getByRole('combobox', { name: 'CSV sample' }).selectOption(id)
    await action('sample')
  }
  const text = root.getByRole('textbox', { name: 'CSV source' })
  const file = root.getByLabel('CSV file', { exact: true })
  const checkImport = async (rows) => {
    await wait(imported, rows)
    const state = await read()
    for (let r = 0; r < rows.length; r++)
      for (let c = 0; c < rows[0].length; c++) {
        const cell = state.sheets[0].cells[r + 3][c + 1]
        assert.equal(cell.t, 1, 'Imported cell is explicitly text')
        assert.ok(!cell.f && !cell.si && !cell.p, 'No formula/shared formula/rich text remains')
      }
    return state
  }
  await ready()
  await wait((s) => s.sheets[0].values[3][2] === 5)
  const baseline = (await read()).sheets
  // HTML textarea.value normalizes CRLF to LF; the downloaded fixture keeps its original bytes.
  const rows = parseCsv(CSV_SAMPLES[0].text.replaceAll('\r\n', '\n'))
  await action('validate')
  assert.deepEqual((await read()).sheets, baseline)
  assert.deepEqual((await read()).parserPreview, { rows: 5, columns: 5, firstRows: rows.slice(0, 4) })
  const [download] = await Promise.all([page.waitForEvent('download'), action('download')])
  assert.equal(download.suggestedFilename(), 'kestrel-intake.csv')
  assert.equal(await fs.readFile(await download.path(), 'utf8'), CSV_SAMPLES[0].text)
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    root.getByRole('button', { name: 'Open CSV', exact: true }).click(),
  ])
  await chooser.setFiles({ name: 'kestrel-intake.csv', mimeType: 'text/csv', buffer: Buffer.from(CSV_SAMPLES[0].text) })
  await ready()
  assert.equal(await text.inputValue(), CSV_SAMPLES[0].text.replaceAll('\r\n', '\n'))
  assert.deepEqual((await read()).sheets, baseline)
  await action('import')
  const after = await checkImport(rows)
  await page.waitForFunction(() => window.csvPaint.some((entry) => entry.text.includes('Fuse')))
  report.multilinePaint = await page.evaluate(() => window.csvPaint)
  const firstLine = report.multilinePaint.find((entry) => entry.text.includes('Cable'))
  const secondLine = report.multilinePaint.find((entry) => entry.text.includes('Fuse'))
  assert.ok(secondLine.y > firstLine.y, 'Multiline CSV text paints on separate native canvas lines')
  assert.deepEqual(after.sheets[1], baseline[1])
  assert.deepEqual(after.sheets[0].cells[3][1].s, baseline[0].cells[3][1].s)
  for (let r = 0; r < 40; r++)
    for (let c = 0; c < 12; c++)
      if (r < 3 || r >= 8 || c < 1 || c >= 6)
        assert.deepEqual(after.sheets[0].cells[r][c], baseline[0].cells[r][c], `Outside cell ${r},${c}`)
  await root.screenshot({ path: path.join(directory, 'imported.png') })
  await grid.click({ position: { x: 160, y: 180 } })
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+z')
  await wait((s) => s.sheets[0].values[3][2] === 5)
  const undone = (await read()).sheets
  for (const [i, original] of baseline.entries()) {
    assert.deepEqual(undone[i].values, original.values)
    assert.deepEqual(undone[i].backgrounds, original.backgrounds)
    assert.deepEqual(
      undone[i].cells.map((row) => row.map((cell) => cell?.f || '')),
      original.cells.map((row) => row.map((cell) => cell?.f || '')),
    )
    assert.equal(undone[i].rows, original.rows)
    assert.equal(undone[i].columns, original.columns)
  }
  await page.keyboard.press('Control+y')
  await checkImport(rows)
  report.checks.push(
    'Actual native Open CSV file chooser, byte-exact sample download, local staging, typed range write, outside/styles preservation and native Undo/Redo',
  )

  for (const id of ['semicolon', 'tab', 'literal', 'ragged']) {
    await action('reset')
    await load(id)
    await action('import')
    const sample = CSV_SAMPLES.find((item) => item.id === id)
    const state = await checkImport(parseCsv(sample.text, sample.delimiter))
    assert.deepEqual(state.sheets[1], baseline[1])
  }
  await action('reset')
  await load('ragged')
  await root.getByRole('checkbox', { name: 'Skip empty lines' }).uncheck()
  await action('import')
  await checkImport(parseCsv(CSV_SAMPLES.find((s) => s.id === 'ragged').text, ',', false))
  report.checks.push(
    'Semicolon/BOM, TSV, quoted CRLF, empty-line policy and ragged padding; formulas, booleans, dates and long/zero-prefixed identifiers remain literal text',
  )

  await action('reset')
  await wait((s) => s.sheets[0].values[3][2] === 5)
  await load('malformed')
  await action('import', true)
  assert.deepEqual((await read()).sheets, baseline)
  await load('empty')
  assert.equal(await root.locator('[data-action="import"]').isDisabled(), true)
  assert.deepEqual((await read()).sheets, baseline)
  await load('quoted')
  const beforeDraft = await text.inputValue()
  await file.setInputFiles({ name: 'utf16.csv', mimeType: 'text/csv', buffer: Buffer.from([0xff, 0xfe, 65, 0]) })
  await ready()
  assert.match(await root.getByRole('status').textContent(), /^Rejected:/)
  assert.equal(await text.inputValue(), beforeDraft)
  await file.setInputFiles({ name: 'oversize.csv', mimeType: 'text/csv', buffer: Buffer.alloc(1024 * 1024 + 1, 65) })
  await ready()
  assert.match(await root.getByRole('status').textContent(), /MiB/)
  assert.equal(await text.inputValue(), beforeDraft)
  // Browser cancel-event contract, not automation of a physical OS dialog cancel.
  await file.dispatchEvent('cancel')
  assert.match(await root.getByRole('status').textContent(), /canceled/)
  assert.equal(await text.inputValue(), beforeDraft)
  for (let i = 0; i < 2; i++) {
    await file.setInputFiles({ name: 'repeat.csv', mimeType: 'text/csv', buffer: Buffer.from('A,B\n001,=1+1') })
    await ready()
    assert.equal(await text.inputValue(), 'A,B\n001,=1+1')
    await text.fill('Changed draft')
  }
  assert.deepEqual((await read()).sheets, baseline)
  await text.fill(Array(41).fill('x,y').join('\n'))
  await action('import', true)
  assert.deepEqual((await read()).sheets, baseline)
  await load('quoted')
  const nameBox = root.locator('.csv-editor input.univer-size-full')
  await nameBox.fill('L40')
  await nameBox.press('Enter')
  await wait((s) => s.selections[0] === 'L40')
  await action('import', true)
  assert.deepEqual((await read()).sheets, baseline)
  await nameBox.fill('D10:E11')
  await nameBox.press('Enter')
  await wait((s) => s.selections[0] === 'D10:E11')
  await action('import')
  await wait((s) => s.lastImport?.address === 'D10:H14')
  const shifted = await read()
  for (const [r, record] of rows.entries())
    for (const [c, value] of record.entries()) assert.equal(shifted.sheets[0].values[r + 9][c + 3], value)
  assert.equal(shifted.sheets[0].values[13][0], 'Keep this footer')
  assert.deepEqual(shifted.sheets[1], baseline[1])
  report.checks.push(
    'Malformed/empty/encoding/size/bounds rejection preserves workbook; rejected files preserve draft; cancel handler and repeated same-file selection',
  )
  report.checks.push(
    'Native name-box navigation to last-cell boundary and rectangular target; import anchors to its top-left without filling the original selection',
  )

  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await action('reset')
    await wait((s) => s.sheets[0].values[3][2] === 5)
    await root.locator('[data-action="import"]').focus()
    await page.keyboard.press('Enter')
    await checkImport(rows)
    await root.locator('.csv-controls > summary').click()
    assert.ok((await grid.boundingBox()).y < 450)
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
    await root.locator('.csv-controls > summary').click()
  }
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await ready()
  assert.equal(await root.locator('.csv-controls').evaluate((el) => el.open), false)
  await wait((s) => s.viewport?.startColumn === 1)
  await root.locator('.csv-controls > summary').click()
  await action('import')
  await checkImport(rows)
  report.checks.push('Three resets, 760/390/320 keyboard import and visible fresh-mobile target')
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.csv-demo[data-theme="${theme}"][data-ready="true"]`).waitFor()
      await action('import')
      await checkImport(rows)
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    for (const [locale, title, headings] of [
      ['en-US', 'CSV import with Facade', ['Variants', 'Actions', 'States']],
      ['zh-CN', 'CSV 导入与 Facade', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/csv-import-plugin`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.csv-demo[data-ready="true"]').waitFor()
      await embedded.locator('[data-action="import"]').click()
      const frame = page.frames().find((f) => f.url().includes('/playground/'))
      await frame.waitForFunction(
        () => JSON.parse(document.querySelector('.csv-demo pre').textContent).lastImport?.address === 'B4:F8',
      )
      const branch = page.locator('aside button').first()
      await branch.click()
      await page.waitForFunction(
        () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
      )
      await branch.click()
      await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
    }
    report.checks.push('Both themes, EN/ZH 8/7/5 guides, hydrated tree and actual iframe import')
  }
  assert.deepEqual(report.errors, [])
  // Documentation source/tree rendering can call Next server actions. Keep these
  // visible in the report; no editor/iframe or unrecognized write request is allowed.
  assert.deepEqual(
    report.writesToNetwork.filter((request) => !(request.nextAction && request.frame.includes('/showcase/'))),
    [],
    'CSV import does not upload file data',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.readback = await page
    .locator('.csv-demo pre')
    .textContent({ timeout: 1000 })
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify({ ...report, readback: undefined }, null, 2))
assert.ok(report.passed)
