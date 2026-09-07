/* eslint-disable no-await-in-loop -- Exercise native hyperlink state in one selected workbook. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/hyper-link'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/hyperlinks')
const external = 'https://univer.ai/?source=showcase&topic=links#features'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
context.setDefaultTimeout(30000)
// Exercise an actual new tab without requesting a third-party website.
await context.route('https://univer.ai/**', (route) =>
  route.fulfill({ contentType: 'text/html', body: '<title>External navigation test destination</title>' }),
)
await context.addInitScript(() => {
  window.hyperlinkPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.hyperlinkPaint.length < 20000) window.hyperlinkPaint.push(String(text))
    return fillText.call(this, text, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(30000)
const report = { passed: false, errors: [], checks: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.hyperlink-demo')
  const ready = () => root.locator('xpath=self::*[@data-ready="true"]').waitFor({ timeout: 90000 })
  const read = async () => JSON.parse(await root.locator('pre').textContent())
  const wait = (check, arg) =>
    page.waitForFunction(
      ({ predicate, arg: value }) => {
        const text = document.querySelector('.hyperlink-demo pre')?.textContent
        return text && new Function('s', 'a', `return (${predicate})(s,a)`)(JSON.parse(text), value)
      },
      { predicate: check.toString(), arg },
    )
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const action = async (name, error = false) => {
    await root.locator(`[data-action="${name}"]`).click()
    await root.locator('xpath=self::*[@data-busy="false"]').waitFor()
    await settle()
    const status = await root.getByRole('status').textContent()
    if (error) assert.match(status, /Action failed:/)
    else assert.doesNotMatch(status, /Action failed:/)
    if ((await root.getAttribute('data-theme')) === 'light')
      assert.equal(
        await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => getComputedStyle(el).backgroundColor),
        'rgb(255, 255, 255)',
      )
  }
  const select = async (value) => {
    await root.getByRole('combobox', { name: 'Link target' }).selectOption(value)
    await wait((s, a) => s.target === a && s.activeSheet === 'Field index', value)
  }
  const destination = async (value) => {
    await root.getByRole('combobox', { name: 'Link destination' }).selectOption(value)
    await settle()
  }
  const paint = (text) => page.waitForFunction((value) => window.hyperlinkPaint.join('').includes(value), text)
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  await ready()
  const baseline = (await read()).sheets
  assert.equal(baseline[0].links.length, 5)
  assert.equal(baseline[0].cells[5][1].p.body.customRanges.length, 2)
  assert.equal((await read()).links[0].url, external)
  await paint('Univer website')
  await grid.hover({ position: { x: 260, y: 89 } })
  const nativeExternal = page.getByText(external, { exact: true })
  await nativeExternal.waitFor()
  const opened = context.waitForEvent('page')
  await nativeExternal.click()
  const tab = await opened
  await tab.waitForLoadState()
  assert.equal(tab.url(), external)
  assert.equal(await tab.evaluate(() => window.opener), null)
  await tab.close()
  await wait((s, a) => s.externalRequest === a, external)
  report.checks.push(
    'Real native external popup opens a new tab with unchanged query/fragment and no opener; test network intercepted',
  )

  for (const [target, selection] of [
    ['B3', null],
    ['B4', 'B3:D4'],
    ['B5', 'B6:D6'],
  ]) {
    await select(target)
    await action('navigate')
    await wait((s, a) => s.activeSheet === 'Workshop' && (!a || s.selection === a), selection)
    await paint('DW-104')
    assert.deepEqual((await read()).sheets, baseline)
  }
  report.checks.push('Native sheet, explicit range and named-range navigation with unchanged two-sheet data')

  await select('B7')
  await destination('range')
  await root.getByRole('textbox', { name: 'Link label', exact: true }).fill('Night repair 窗口')
  await action('set')
  await wait((s) => s.links[0]?.label === 'Night repair 窗口' && s.lastResult === true)
  await paint('Night repair 窗口')
  assert.equal((await read()).links[0].url, '#gid=workshop&range=B3:D4')
  assert.equal(await root.locator('[data-action="set"]').isDisabled(), true)
  await grid.click({ position: { x: 100, y: 89 } })
  await page.keyboard.press('Control+z')
  await wait((s) => s.links.length === 0)
  await page.keyboard.press('Control+y')
  await wait((s) => s.links[0]?.label === 'Night repair 窗口')
  await destination('named')
  await root.getByRole('textbox', { name: 'Link label', exact: true }).fill('Reserve check')
  await action('update')
  await wait((s) => s.links[0]?.url === '#rangeid=reserved-lamps' && s.links[0]?.label === 'Reserve check')
  await paint('Reserve check')
  await action('remove')
  await wait((s) => s.links.length === 0)
  assert.match((await read()).sheets[0].cells[6][1].p.body.dataStream, /Reserve check/)
  assert.equal(await root.locator('[data-action="update"]').isDisabled(), true)
  report.checks.push(
    'Insert into empty cell, rendered Unicode label, actual native Undo/Redo, update and text-preserving removal',
  )

  await select('B6')
  assert.equal((await read()).links.length, 1)
  assert.equal((await read()).links[0].label, 'Permits')
  await action('remove')
  await wait((s) => s.links[0]?.label === 'Routing')
  assert.equal((await read()).sheets[0].cells[5][1].p.body.customRanges.length, 1)
  assert.match((await read()).sheets[0].cells[5][1].p.body.dataStream, /Permits \| Routing/)
  await action('range-remove')
  await wait((s) => s.links.length === 0)
  await select('B2:B4')
  const neighbors = (await read()).sheets[0].cells.slice(2, 4)
  await root.getByRole('textbox', { name: 'Link label', exact: true }).fill('New external label')
  await action('update')
  await wait((s) => s.links[0].label === 'New external label')
  assert.deepEqual((await read()).sheets[0].cells.slice(2, 4), neighbors)
  await action('range-remove')
  await wait((s) => s.links.length === 0)
  assert.match((await read()).sheets[0].cells[2][1].p.body.dataStream, /Workshop sheet/)
  assert.deepEqual((await read()).sheets[1], baseline[1])
  report.checks.push(
    'First-per-cell enumeration boundary, surviving rich-text span, top-left-only update and range cancellation',
  )

  await select('B8')
  const beforeError = (await read()).sheets
  await destination('missing')
  await action('set', true)
  assert.match(await root.getByRole('status').textContent(), /MissingHarborRange/)
  assert.deepEqual((await read()).sheets, beforeError)
  await destination('external')
  for (const invalid of ['javascript:alert(1)', 'not a URL', 'https://name:secret@example.com/']) {
    await root.getByRole('textbox', { name: 'External URL' }).fill(invalid)
    await action('set', true)
    assert.deepEqual((await read()).sheets, beforeError)
  }
  await root.getByRole('textbox', { name: 'External URL' }).fill(external)
  await root.getByRole('textbox', { name: 'Link label', exact: true }).fill('Gate reference')
  await action('set')
  await wait((s) => s.links[0]?.label === 'Gate reference')
  const beforeReload = (await read()).sheets
  await action('reload')
  await ready()
  assert.deepEqual((await read()).sheets, beforeReload)
  await select('B5')
  await action('navigate')
  await wait((s) => s.activeSheet === 'Workshop' && s.selection === 'B6:D6')
  report.checks.push(
    'Real missing-name error and host URL rejection preserve data; rich text/named resources survive reload',
  )
  for (let cycle = 0; cycle < 3; cycle++) {
    await action('reset')
    await ready()
    assert.deepEqual((await read()).sheets, baseline)
    await select('B2')
    await root.getByRole('textbox', { name: 'Link label', exact: true }).fill(`Reset ${cycle}`)
    await action('update')
  }
  await action('reset')
  await action('read')
  assert.equal(await root.getByRole('textbox', { name: 'Link label', exact: true }).inputValue(), 'Univer website')
  await root.screenshot({ path: path.join(directory, 'light.png') })
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await select('B4')
    await root.locator('[data-action="navigate"]').focus()
    await page.keyboard.press('Enter')
    await wait((s) => s.activeSheet === 'Workshop' && s.selection === 'B3:D4')
    await root.locator('.hyperlink-controls > summary').click()
    assert.ok((await grid.boundingBox()).y < 450)
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
    await root.locator('.hyperlink-controls > summary').click()
  }
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await ready()
  assert.equal(await root.locator('.hyperlink-controls').evaluate((el) => el.open), false)
  await root.locator('.hyperlink-controls > summary').click()
  await select('B5')
  await action('navigate')
  await wait((s) => s.activeSheet === 'Workshop' && s.selection === 'B6:D6')
  report.checks.push('Three deterministic resets, 760/390/320 keyboard navigation and functional fresh-mobile entry')
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.hyperlink-demo[data-theme="${theme}"][data-ready="true"]`).waitFor()
      assert.deepEqual((await read()).sheets, baseline)
      await select('B4')
      await action('navigate')
      await wait((s) => s.activeSheet === 'Workshop' && s.selection === 'B3:D4')
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    for (const [locale, title, headings] of [
      ['en-US', 'Hyperlinks', ['Variants', 'Actions', 'States']],
      ['zh-CN', '超链接', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/hyper-link`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.hyperlink-demo[data-ready="true"]').waitFor()
      const branch = page.locator('aside button').first()
      await branch.click()
      await page.waitForFunction(
        () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
      )
      await branch.click()
      await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
      await embedded.getByRole('combobox', { name: 'Link target' }).selectOption('B4')
      await embedded.locator('[data-action="navigate"]').click()
      const frame = page.frames().find((item) => item.url().includes('/playground/'))
      await frame.waitForFunction(() => {
        const s = JSON.parse(document.querySelector('.hyperlink-demo pre').textContent)
        return s.activeSheet === 'Workshop' && s.selection === 'B3:D4'
      })
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push(
      'Light/dark navigation and both localized card-free detail pages, hydrated tree and real iframe selection',
    )
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.readback = await page
    .locator('.hyperlink-demo pre')
    .textContent({ timeout: 1000 })
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify({ ...report, readback: undefined }, null, 2))
assert.ok(report.passed)
