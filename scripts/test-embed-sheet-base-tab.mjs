/* eslint-disable no-await-in-loop -- Native menu tabs share one active ribbon and must be visited sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/sheets-in-bases-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-base-tab')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(['create-demo.ts', 'data.ts'].map((name) => fs.readFile(`${codeRoot}/${name}`, 'utf8')))
).join('\n')
const dependencies = [
  ...new Set(
    [...sources.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
      .map((match) => match[1])
      .filter((name) => !name.endsWith('.css')),
  ),
]
const server = process.env.SHOWCASE_ORIGIN
  ? null
  : await createServer({
      configFile: false,
      root: process.cwd(),
      appType: 'custom',
      cacheDir: path.resolve('test-results/embed-sheet-base-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4235, strictPort: true, watch: { ignored: ['**/.next/**'] } },
      plugins: [
        {
          name: 'one-embed-only',
          configureServer(vite) {
            vite.middlewares.use((request, response, next) => {
              if (request.url?.split('?')[0] !== '/') return next()
              response.setHeader('Content-Type', 'text/html')
              response.end(
                `<html><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">import {createDemo} from '/${codeRoot}/create-demo.ts';window.createDemo=createDemo;window.demo=createDemo(document.getElementById('app'));window.addEventListener('pagehide',()=>window.demo.dispose(),{once:true});</script></body></html>`,
              )
            })
          },
        },
      ],
    })
await server?.listen()
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(process.env.SHOWCASE_VIEWPORT_WIDTH || 1600), height: 1100 },
})
const report = { passed: false, checks: [], errors: [], warnings: [], backendRequests: [] }
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) || request.url().includes('/universer-api/'))
    report.backendRequests.push({ method: request.method(), url: request.url() })
})
page.on('requestfailed', (request) => report.errors.push(`${request.url()}: ${request.failure()?.errorText}`))
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
  if (message.type() === 'warning') report.warnings.push(message.text())
})
await page.addInitScript(() => {
  window.startupFailure = null
  window.addEventListener('error', (event) => {
    window.startupFailure = event.message
  })
  window.painted = []
  window.paintPoints = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    const p = this.getTransform().transformPoint({ x: args[1], y: args[2] })
    const bounds = this.canvas.getBoundingClientRect()
    if (bounds.width > 300)
      window.paintPoints.push({
        text: String(args[0]),
        x: bounds.x + (p.x * bounds.width) / this.canvas.width,
        y: bounds.y + (p.y * bounds.height) / this.canvas.height,
      })
    if (window.paintPoints.length > 10000) window.paintPoints.splice(0, 5000)
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

const root = page.locator('.acorn-embed')
const hostSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('acorn-sales-pipeline').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('acorn-weighted-forecast').save())))
const resultIs = (value) =>
  page.waitForFunction(
    (expected) =>
      window.univerAPI
        .getWorkbook('acorn-weighted-forecast')
        .getSheetBySheetId('forecast')
        .getRange('E15')
        .getRawValue() === expected,
    value,
  )
const worksheet = (name) => page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
const table = (name) => page.getByText(name, { exact: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheets-in-bases-tab/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
]
assert.equal(examples.length, 2)
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4235/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const element = document.querySelector('.acorn-embed')
      return element?.dataset.ready || element?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'acorn-sales-pipeline' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'bases-table-list-block')
  assert.equal(report.descriptor.childUnitId, 'acorn-weighted-forecast')
  assert.equal(report.descriptor.context.index, 1)
  const initialHost = await hostSnapshot()
  assert.deepEqual(initialHost.tableOrder, ['deals', 'acorn-forecast-tab', 'accounts'])
  assert.equal(initialHost.tables.deals.recordOrder.length, 10)
  assert.equal(initialHost.tables.accounts.recordOrder.length, 4)
  assert.equal(await root.locator('iframe,fieldset,[data-action]').count(), 0)
  assert.equal(await page.locator('[data-u-comp="embed-float-dom"]').count(), 0)
  await page.waitForFunction(() => window.painted.includes('Maple / Refill stations'))
  await page.screenshot({ path: path.join(directory, 'opportunities.png'), fullPage: true })
  await table('Weighted forecast').click()
  const child = page.locator('[data-embed-bases-table-list-host="acorn-forecast-tab"]')
  await child.waitFor()
  await worksheet('Forecast').waitFor()
  await resultIs(215125)
  await page.waitForFunction(() => window.painted.join('').includes('A forecast, not a promise'))
  report.checks.push(
    'Native Base table-list anchor opens a real two-sheet workbook beside ten opportunities and four customer groups, without float/iframe/fixture controls',
  )
  await page.screenshot({ path: path.join(directory, 'forecast.png'), fullPage: true })
  const hostBefore = await hostSnapshot()
  await worksheet('Assumptions').click()
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('acorn-weighted-forecast').getActiveSheet().getSheetId() === 'assumptions',
  )
  await page.evaluate(examples[0][1])
  await resultIs(222725)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  assert.deepEqual(
    await page.evaluate(() =>
      ['E5', 'E10', 'E14'].map((a) =>
        window.univerAPI.getWorkbook('acorn-weighted-forecast').getSheetBySheetId('forecast').getRange(a).getRawValue(),
      ),
    ),
    [16000, 13750, 8250],
  )
  await child.click({ position: { x: 350, y: 300 } })
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+z')
  await resultIs(215125)
  await page.keyboard.press('Control+y')
  await resultIs(222725)
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('acorn-weighted-forecast').getSheetBySheetId('assumptions').getRange('B5').setValue(0),
  )
  await resultIs(184725)
  assert.deepEqual(
    await page.evaluate(() =>
      ['E5', 'E10', 'E14'].map((a) =>
        window.univerAPI.getWorkbook('acorn-weighted-forecast').getSheetBySheetId('forecast').getRange(a).getRawValue(),
      ),
    ),
    [0, 0, 0],
  )
  await child.click({ position: { x: 350, y: 300 } })
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+z')
  await resultIs(222725)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push(
    'Literal README example and native Undo/Redo exercise Qualified probabilities 40%, 50%, 0%; three row formulas and totals 215125/222725/184725 agree',
  )
  await worksheet('Forecast').click()
  await child.click({ position: { x: 350, y: 300 } })
  await page.keyboard.press('Escape')
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('acorn-weighted-forecast').getSheetBySheetId('forecast').getRange('C5').activate(),
  )
  await page.keyboard.type('40000')
  await page.keyboard.press('Enter')
  await resultIs(226725)
  await page.keyboard.press('Control+z')
  await resultIs(222725)
  await page.keyboard.press('Control+y')
  await resultIs(226725)
  await page.keyboard.press('Control+z')
  await resultIs(222725)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push(
    'Native keyboard input commits C5=40000 and recalculates 226725; Undo/Redo preserves the complete Base',
  )
  report.ribbonTabs = []
  for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
    await page.getByRole('tab', { name, exact: true }).click()
    await settle()
    const commands = await page
      .locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-u-command')))
    assert.ok(commands.length, name)
    report.ribbonTabs.push({ name, commands })
    assert.deepEqual(report.errors, [])
  }
  await page.getByRole('tab', { name: 'Start', exact: true }).click()
  await worksheet('Assumptions').click()
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('acorn-weighted-forecast').getActiveSheet().getSheetId() === 'assumptions',
  )
  assert.deepEqual(
    await page.evaluate(() =>
      ['B10', 'B11', 'B12'].map((a) =>
        window.univerAPI
          .getWorkbook('acorn-weighted-forecast')
          .getSheetBySheetId('assumptions')
          .getRange(a)
          .getRawValue(),
      ),
    ),
    [222725, 210000, -12725],
  )
  await page.screenshot({ path: path.join(directory, 'assumptions.png'), fullPage: true })
  await page.evaluate(() => {
    window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet: printSheet }) => {
      window.printSource = { workbook: workbook.getId(), sheet: printSheet.getSheetId() }
    })
  })
  await page.locator('[data-u-command="sheet.menu.print"]').click()
  await page.getByRole('menuitem', { name: 'Print', exact: true }).click()
  await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
  await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
  report.printPages = await page.getByText(/^Total: [1-9]\d*pages$/).innerText()
  assert.deepEqual(await page.evaluate(() => window.printSource), {
    workbook: 'acorn-weighted-forecast',
    sheet: 'assumptions',
  })
  await page.screenshot({ path: path.join(directory, 'print-assumptions.png'), fullPage: true })
  await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
  await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push(
    'Five native Grid tabs expose commands; Assumptions shows -12725 target gap and a populated native print preview that can be canceled',
  )
  const childBefore = await childSnapshot()
  await table('Opportunities').click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'deals')
  await page.evaluate(examples[1][1])
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('acorn-sales-pipeline')
        .getTableById('deals')
        .getRecordById('deals-1')
        .getValue('next') === 'Confirm site count on Friday',
  )
  assert.deepEqual(await childSnapshot(), childBefore)
  await table('Accounts').click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'accounts')
  await page.setViewportSize({ width: 1598, height: 1100 })
  await settle()
  await page.evaluate(() => {
    window.paintPoints = []
  })
  await page.setViewportSize({ width: 1600, height: 1100 })
  await page.waitForFunction(() => window.paintPoints.some((p) => p.text === 'Local Retail'))
  const point = await page.evaluate(() => window.paintPoints.findLast((p) => p.text === 'Local Retail'))
  const beforeRename = await hostSnapshot()
  await page.mouse.dblclick(point.x + 18, point.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Local Partners')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('acorn-sales-pipeline')
        .getTableById('accounts')
        .getRecordById('accounts-1')
        .getValue('title') === 'Local Partners',
  )
  const afterRename = await hostSnapshot()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('acorn-sales-pipeline')
        .getTableById('accounts')
        .getRecordById('accounts-1')
        .getValue('title') === 'Local Retail',
  )
  assert.deepEqual(await hostSnapshot(), beforeRename)
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('acorn-sales-pipeline')
        .getTableById('accounts')
        .getRecordById('accounts-1')
        .getValue('title') === 'Local Partners',
  )
  assert.deepEqual(await hostSnapshot(), afterRename)
  assert.deepEqual(await childSnapshot(), childBefore)
  await page.screenshot({ path: path.join(directory, 'accounts.png'), fullPage: true })
  await page.evaluate(() => {
    window.painted = []
  })
  await table('Opportunities').click()
  await page.waitForFunction(() => window.painted.filter((text) => text === 'Local Partners').length >= 2)
  const links = await page.evaluate(() =>
    ['deals-1', 'deals-7'].map((id) =>
      window.univerAPI.getBase('acorn-sales-pipeline').getTableById('deals').getRecordById(id).getValue('account'),
    ),
  )
  assert.ok(links.every((v) => JSON.stringify(v).includes('accounts-1') && !JSON.stringify(v).includes('Local')))
  assert.deepEqual(await childSnapshot(), childBefore)
  report.checks.push(
    'Literal Base follow-up example, native Accounts keyboard rename with complete Undo/Redo snapshot restoration and stable linked customer IDs preserve the entire workbook',
  )
  const hostEdited = await hostSnapshot()
  await table('Weighted forecast').click()
  await child.waitFor()
  await resultIs(222725)
  assert.deepEqual(await childSnapshot(), childBefore)
  const canvas = await child.locator('canvas').first().elementHandle()
  for (const dark of [true, false]) {
    await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
    await settle()
    assert.deepEqual(await hostSnapshot(), hostEdited)
    assert.deepEqual(await childSnapshot(), childBefore)
    assert.equal(await canvas.evaluate((el) => el.isConnected), true)
  }
  report.checks.push(
    'Native host/child navigation and dark/light theme changes retain the same child canvas and complete edited snapshots',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.checks.push(
    'Active-child disposal releases owned UI and API without observed browser errors or backend requests',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({ text: document.body.innerText.slice(-6000), painted: window.painted?.slice(-70) }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
console.log(report.passed ? 'PASS selected native Sheets@Bases Tab' : report.failure)
process.exitCode = report.passed ? 0 : 1
