/* eslint-disable no-await-in-loop -- Exercise one local workbook graph and its native history in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { REFERENCES } from '../showcase/sheets/cross-workbook-formula/code/data.ts'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/cross-workbook-formula'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/cross-workbook')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(20000)
const report = { passed: false, errors: [], failures: [], checks: [], networkWrites: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  if (!['GET', 'HEAD'].includes(request.method()))
    report.networkWrites.push({
      url: request.url(),
      method: request.method(),
      nextAction: !!request.headers()['next-action'],
      frame: request.frame().url(),
    })
})
await page.addInitScript(() => {
  window.crossWorkbookPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (value, ...args) {
    window.crossWorkbookPaint.push(String(value))
    if (window.crossWorkbookPaint.length > 20000) window.crossWorkbookPaint.splice(0, 10000)
    return fillText.call(this, value, ...args)
  }
})
const root = page.locator('.cross-workbook-demo')
const read = async () => JSON.parse(await root.locator('pre').textContent())
const controls = async () => {
  if (!(await root.locator('.cross-workbook-controls').evaluate((el) => el.open)))
    await root.locator('.cross-workbook-controls > summary').click()
}
const wait = (predicate, argument) =>
  page.waitForFunction(
    ({ expression, argument: expected }) => {
      const text = document.querySelector('.cross-workbook-demo pre')?.textContent
      return text && new Function('s', 'a', `return (${expression})(s,a)`)(JSON.parse(text), expected)
    },
    { expression: predicate.toString(), argument },
    { timeout: 15000 },
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const action = async (name) => {
  await controls()
  await root.locator(`[data-action="${name}"]`).click()
  await page.locator('.cross-workbook-demo[data-busy="false"]').waitFor()
  await settle()
  assert.doesNotMatch(await root.getByRole('status').textContent(), /Action failed/)
}
const baseline = () =>
  wait(
    (s) =>
      s.loaded.length === 4 && s.books.summary.rawValues[9][1] === 2160 && s.books.summary.rawValues[10][1] === 975,
  )
const reset = async () => {
  await action('reset')
  await baseline()
}
const write = async (key, number) => {
  await controls()
  await root.getByLabel('Source field', { exact: true }).selectOption(key)
  await root.getByLabel('Source value', { exact: true }).fill(String(number))
  await action('write')
}
const view = async (key) => {
  await controls()
  await root.getByLabel('Viewed workbook', { exact: true }).selectOption(key)
  await wait((s, expected) => s.active === expected, key)
  await settle()
}
const check = async (name, fn) => {
  try {
    await fn()
    report.checks.push(name)
  } catch (error) {
    report.failures.push({ name, error: error.stack || String(error), state: await read().catch(() => null) })
  }
}
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await root.locator('pre').waitFor({ state: 'attached', timeout: 90000 })
  await baseline()
  await check('Four original workbooks, exact dependency results, native CSS and rendered totals', async () => {
    const state = await read()
    assert.deepEqual(
      state.books.summary.rawValues.slice(3, 11).map((row) => row[1]),
      [1500, 2700, 780, 1920, 2400, 240, 2160, 975],
    )
    assert.equal(state.books.summary.rawValues[12][1], 42)
    assert.equal(state.books.income.rawValues[5][1], 0)
    assert.equal(state.books.costs.rawValues[5][1], -25.5)
    assert.equal(state.books.summary.formulas[3][1], REFERENCES.single)
    assert.equal(
      state.books.summary.values[9][1],
      '2160.00',
      'Display formatting is separate from the raw numeric result',
    )
    const native = await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      white: getComputedStyle(el).getPropertyValue('--univer-gray-0').trim(),
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
    assert.deepEqual(native, { background: 'rgb(255, 255, 255)', white: '#FFFFFF', flex: 'flex' })
    await page.waitForFunction(() => window.crossWorkbookPaint.includes('2160.00'))
    await root.screenshot({ path: path.join(directory, 'initial.png') })
  })
  await check('Background source edit, transitive update, per-source native Undo/Redo and canvas paint', async () => {
    await write('tickets', 180)
    await wait((s) => s.books.summary.rawValues[9][1] === 3003.75)
    const changed = await read()
    assert.equal(changed.active, 'summary')
    assert.equal(changed.books.income.rawValues[3][3], 2250)
    assert.equal(changed.books.summary.rawValues[4][1], 3450)
    await page.waitForFunction(() => window.crossWorkbookPaint.includes('3003.75'))
    await action('undo')
    await baseline()
    await action('redo')
    await wait((s) => s.books.summary.rawValues[9][1] === 3003.75)
    await view('summary')
    await root.screenshot({ path: path.join(directory, 'source-edit.png') })
  })
  for (const [variant, expected] of [
    ['single', 1500],
    ['range', 2700],
    ['multiple', 1920],
    ['local', 42],
    ['missing-workbook', '#REF!'],
    ['missing-sheet', '#NAME?'],
  ]) {
    await check(variant + ': exact native formula expression and value', async () => {
      await reset()
      await controls()
      await root.getByLabel('Reference variant', { exact: true }).selectOption(variant)
      await action('reference')
      await wait((s, a) => s.books.summary.rawValues[3][1] === a, expected)
      assert.equal((await read()).books.summary.formulas[3][1], REFERENCES[variant])
      assert.equal((await read()).books.summary.rawValues[9][1], 2160, 'Independent net calculation stays unchanged')
      if (variant !== 'single') {
        await action('undo')
        await wait((s) => s.books.summary.rawValues[3][1] === 1500)
      }
    })
  }
  await check('Zero, blank and text inputs propagate native results; invalid host value preserves data', async () => {
    await reset()
    await write('fx', 0)
    await wait((s) => s.books.summary.rawValues[9][1] === 0 && s.books.summary.rawValues[10][1] === 0)
    await action('clear')
    await wait((s) => s.books.fx.rawValues[3][1] === null)
    assert.equal((await read()).books.summary.rawValues[9][1], 0)
    await action('invalid')
    await wait((s) => s.books.summary.rawValues[9][1] === '#VALUE!' && s.books.summary.rawValues[10][1] === '#VALUE!')
    assert.equal((await read()).books.fx.rawValues[3][1], 'pending')
    await action('restore-fx')
    await baseline()
    const before = (await read()).books
    await root.getByLabel('Source value', { exact: true }).fill('')
    await root.locator('[data-action="write"]').click()
    await expectFailure()
    assert.deepEqual((await read()).books, before)
    await root.getByLabel('Source value', { exact: true }).fill('1000001')
    await root.locator('[data-action="write"]').click()
    await expectFailure()
    assert.deepEqual((await read()).books, before)
  })
  await check('Unload costs invalidates dependent references; restore original ID recovers values', async () => {
    await reset()
    await write('refund', -100.5)
    await wait((s) => s.books.summary.rawValues[9][1] === 2244.375)
    await action('source')
    await wait((s) => s.loaded.length === 3 && s.books.summary.rawValues[5][1] === '#REF!')
    assert.equal((await read()).books.summary.rawValues[9][1], '#REF!')
    assert.equal(
      await root
        .getByLabel('Viewed workbook', { exact: true })
        .locator('option[value="costs"]')
        .evaluate((option) => option.disabled),
      true,
    )
    await action('source')
    await wait((s) => s.loaded.length === 4 && s.books.summary.rawValues[9][1] === 2244.375)
    assert.equal((await read()).books.costs.rawValues[5][1], -100.5)
    assert.equal((await read()).books.costs.id, 'tern-costs')
  })
  await check('All-workbook JSON download and edited snapshot reload preserve native dependency graph', async () => {
    await reset()
    await write('reserve', 0.2)
    await wait((s) => s.books.summary.rawValues[9][1] === 1920)
    const before = (await read()).books
    const downloading = page.waitForEvent('download')
    await action('download')
    const download = await downloading
    await download.saveAs(path.join(directory, download.suggestedFilename()))
    const snapshots = JSON.parse(await fs.readFile(await download.path(), 'utf8'))
    assert.deepEqual(snapshots.map((item) => item.id).toSorted(), [
      'tern-costs',
      'tern-fx',
      'tern-income',
      'tern-summary',
    ])
    assert.equal(snapshots.find((item) => item.id === 'tern-summary').sheets.main.cellData[3][1].f, REFERENCES.single)
    await page.evaluate(() => {
      window.crossWorkbookPaint = []
    })
    await action('reload')
    await wait((s) => s.books.summary?.rawValues[9][1] === 1920)
    assert.deepEqual((await read()).books, before)
    // A 640px documentation host retains a 430px editor with a 289px grid, unlike the taller standalone page.
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('canvas')].some((canvas) => canvas.width > 500 && canvas.height > 200) &&
        window.crossWorkbookPaint.includes('1920.00'),
    )
    await action('undo')
    await settle()
    assert.equal((await read()).books.summary.rawValues[9][1], 1920, 'Reload clears prior editing history')
  })
  await check('Explicit recalculation delivers SDK events; inspection preserves workbook data', async () => {
    await reset()
    const before = await read()
    await action('recalculate')
    await wait((s, count) => s.applied > count, before.applied)
    await action('inspect')
    assert.match(await root.getByRole('status').textContent(), /Read fresh Facade/)
    assert.deepEqual((await read()).books, before.books)
  })
  await check('Empty inputs retain formulas; repeated resets and workbook switching remain usable', async () => {
    await action('empty')
    await wait((s) => s.books.summary?.rawValues[9][1] === 0 && s.books.summary.rawValues[4][1] === 0)
    assert.equal((await read()).books.summary.formulas[3][1], REFERENCES.single)
    for (const key of ['fx', 'income', 'costs', 'summary']) await view(key)
    for (let index = 0; index < 3; index++) {
      await reset()
      await write('tickets', 180)
      await wait((s) => s.books.summary.rawValues[9][1] === 3003.75)
    }
    await reset()
  })
  await check('Native source cell editing drives background dependencies', async () => {
    await reset()
    await view('income')
    const nameBox = root.locator('.cross-workbook-editor input.univer-size-full')
    await nameBox.fill('B4')
    await nameBox.press('Enter')
    await page.keyboard.type('160')
    await page.keyboard.press('Enter')
    await wait((s) => s.books.income.rawValues[3][1] === 160 && s.books.summary.rawValues[9][1] === 2722.5)
    await view('summary')
    await page.waitForFunction(() => window.crossWorkbookPaint.includes('2722.50'))
    await root.screenshot({ path: path.join(directory, 'native-edit.png') })
  })
  await check('Keyboard host action and 760/390/320px layouts retain native white editor', async () => {
    await reset()
    for (const width of [760, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      await settle()
      await controls()
      await root.getByLabel('Source value', { exact: true }).fill('180')
      await root.locator('[data-action="write"]').focus()
      await page.keyboard.press('Enter')
      await wait((s) => s.books.summary.rawValues[9][1] === 3003.75)
      const bounds = await root.evaluate((el) => ({
        width: el.clientWidth,
        scroll: el.scrollWidth,
        editor: el.querySelector('.cross-workbook-editor').getBoundingClientRect().height,
        white: getComputedStyle(el.querySelector('[data-u-comp="workbench-layout"]')).backgroundColor,
      }))
      assert.ok(bounds.scroll <= bounds.width + 1)
      assert.ok(bounds.editor >= 430)
      assert.equal(bounds.white, 'rgb(255, 255, 255)')
      if (width < 600) {
        await root.locator('.cross-workbook-controls > summary').click()
        const nameBox = root.locator('.cross-workbook-editor input.univer-size-full')
        await nameBox.fill('B10')
        await nameBox.press('Enter')
        await settle()
        assert.equal(await nameBox.inputValue(), 'B10')
        assert.equal((await read()).books.summary.rawValues[9][1], 3003.75)
      }
      await root.screenshot({ path: path.join(directory, 'width-' + width + '.png') })
      await reset()
    }
    assert.equal(await root.locator('.cross-workbook-controls').evaluate((el) => el.open), false)
    assert.ok((await root.locator('canvas[id^="univer-sheet-main-canvas"]:visible').boundingBox()).y < 420)
  })
  if (url.includes('/playground/'))
    await check('EN/ZH guides, live iframe source edit, theme replacement and hydrated tree', async () => {
      await page.setViewportSize({ width: 1440, height: 1100 })
      for (const theme of ['dark', 'light']) {
        await page.emulateMedia({ colorScheme: theme })
        await page.locator('.cross-workbook-demo[data-theme="' + theme + '"][data-ready="true"]').waitFor()
        await baseline()
        await write('tickets', 180)
        await wait((s) => s.books.summary.rawValues[9][1] === 3003.75)
        await root.screenshot({ path: path.join(directory, 'theme-' + theme + '.png') })
      }
      for (const [locale, title, headings] of [
        ['en-US', 'Cross-workbook formulas', ['Variants', 'Actions', 'States']],
        ['zh-CN', '跨工作簿公式', ['变体', '操作', '状态']],
      ]) {
        await page.goto(new URL(url).origin + '/' + locale + '/showcase/sheets/cross-workbook-formula', {
          waitUntil: 'domcontentloaded',
          timeout: 180000,
        })
        await page.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
        for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
        await page.locator('iframe').first().scrollIntoViewIfNeeded()
        const embedded = page.frameLocator('iframe').first()
        await embedded.locator('.cross-workbook-demo[data-ready="true"]').waitFor()
        const panel = embedded.locator('.cross-workbook-controls')
        if (!(await panel.evaluate((el) => el.open))) await panel.locator('summary').click()
        await embedded.getByLabel('Source value', { exact: true }).fill('180')
        await embedded.locator('[data-action="write"]').click()
        const frame = page.frames().find((item) => item.url().includes('/playground/'))
        await frame.waitForFunction(
          () =>
            JSON.parse(document.querySelector('.cross-workbook-demo pre').textContent).books.summary.rawValues[9][1] ===
            3003.75,
        )
        const branch = page.locator('aside button').first()
        await branch.click()
        await page.waitForFunction(
          () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
        )
        await branch.click()
        await page.waitForFunction(
          () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true',
        )
      }
    })
  report.passed =
    !report.failures.length &&
    !report.errors.length &&
    !report.networkWrites.some((item) => !item.nextAction || !item.frame.includes('/showcase/'))
} catch (error) {
  report.failures.push({ name: 'setup', error: error.stack || String(error), state: await read().catch(() => null) })
} finally {
  await page.screenshot({ path: path.join(directory, 'final.png') }).catch(() => {})
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        errors: report.errors,
        checks: report.checks,
        failures: report.failures.map(({ name, error }) => ({ name, error })),
      },
      null,
      2,
    ),
  )
  await browser.close()
}
assert.equal(
  report.passed,
  true,
  'Cross-workbook results must match actual native state, paint, history and lifecycle behavior',
)

async function expectFailure() {
  await page.locator('.cross-workbook-demo[data-busy="false"]').waitFor()
  assert.match(await root.getByRole('status').textContent(), /Action failed: Enter a finite number/)
}
