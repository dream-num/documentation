import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/bases-in-sheets-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-base-tab')
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
      cacheDir: path.resolve('test-results/embed-base-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4199, strictPort: true, watch: { ignored: ['**/.next/**'] } },
      plugins: [
        {
          name: 'one-embed-only',
          configureServer(vite) {
            vite.middlewares.use((request, response, next) => {
              if (request.url !== '/') return next()
              response.setHeader('Content-Type', 'text/html')
              response.end(
                `<html><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">import {createDemo} from '/${codeRoot}/create-demo.ts';window.demo=createDemo(document.getElementById('app'));window.addEventListener('pagehide',()=>window.demo.dispose(),{once:true});</script></body></html>`,
              )
            })
          },
        },
      ],
    })
await server?.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const report = { passed: false, checks: [], errors: [] }
page.on('requestfailed', (request) => report.errors.push(`${request.url()}: ${request.failure()?.errorText}`))
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
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
    const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
    const rect = this.canvas.getBoundingClientRect()
    window.paintPoints.push({
      text: String(args[0]),
      x: rect.x + (point.x * rect.width) / this.canvas.width,
      y: rect.y + (point.y * rect.height) / this.canvas.height,
    })
    if (window.paintPoints.length > 20000) window.paintPoints.splice(0, 10000)
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const tab = (name) => page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4199/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.willow-embed')
      return root?.dataset.ready === 'true' || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.locator('.willow-embed').getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'willow-landed-cost' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'sheets-sheet-tab')
  assert.equal(report.descriptor.childUnitId, 'willow-supplier-operations')
  assert.equal(report.descriptor.context.index, 1)
  assert.equal(report.descriptor.context.name, 'Supplier operations')
  assert.equal(await page.locator('[data-u-comp="embed-float-dom"],iframe').count(), 0)
  assert.equal(
    await page.locator('.willow-embed > fieldset,.willow-embed > details,.willow-embed [data-action]').count(),
    0,
  )
  await tab('Landed cost').click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('willow-landed-cost')
        .getSheetBySheetId('landed-cost')
        .getRange('G12')
        .getRawValue() === 38985,
  )
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getWorkbook('willow-landed-cost').getSheetBySheetId('landed-cost').getRange('C12').getRawValue(),
    ),
    3500,
  )
  await settle()
  await page.screenshot({ path: path.join(directory, 'landed-cost.png'), fullPage: true, timeout: 30000 })
  await page.evaluate(() => {
    window.painted = []
  })
  await tab('Supplier operations').click()
  await page.locator('[data-embed-sheets-sheet-tab-host]').waitFor()
  await page.waitForFunction(() => window.painted.join('').includes('Seabrook Looms'))
  const sdk = await page
    .locator('[data-u-comp="workbench-layout"]')
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
  assert.equal(sdk.background, 'rgb(255, 255, 255)')
  assert.equal(sdk.flex, 'flex')
  assert.deepEqual(
    await page.evaluate(() =>
      window.univerAPI
        .getBase('willow-supplier-operations')
        .getTables()
        .map((table) => table.getRecords().length),
    ),
    [6, 8],
  )
  await page.screenshot({ path: path.join(directory, 'suppliers.png'), fullPage: true, timeout: 30000 })
  report.checks.push(
    'Native SheetTab renders a real two-table Base with official CSS beside two host worksheets, not a Float or iframe substitute',
  )
  const hostBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('willow-landed-cost').save())),
  )
  await page.evaluate(() => {
    window.painted = []
    const supplier = window.univerAPI
      .getBase('willow-supplier-operations')
      .getTableById('suppliers')
      .getRecordById('suppliers-1')
    if (!supplier.setValue('title', 'Seabrook Studio')) throw new Error('Supplier rename rejected')
  })
  await page.waitForFunction(() => window.painted.join('').includes('Seabrook Studio'))
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('willow-landed-cost').save()))),
    hostBefore,
  )
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('willow-supplier-operations')
        .getTableById('suppliers')
        .getRecordById('suppliers-1')
        .getValue('title') === 'Seabrook Looms',
  )
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('willow-supplier-operations')
        .getTableById('suppliers')
        .getRecordById('suppliers-1')
        .getValue('title') === 'Seabrook Studio',
  )
  // Exercise the real cell editor, targeting its actual painted text coordinates.
  await page.evaluate(() => {
    window.paintPoints = []
  })
  await page.setViewportSize({ width: 1598, height: 1100 })
  await page.waitForFunction(() => window.paintPoints.some((point) => point.text === 'Seabrook Studio'))
  const supplierPoint = await page.evaluate(() =>
    window.paintPoints.findLast((point) => point.text === 'Seabrook Studio'),
  )
  await page.mouse.dblclick(supplierPoint.x + 20, supplierPoint.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Seabrook Cooperative')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('willow-supplier-operations')
        .getTableById('suppliers')
        .getRecordById('suppliers-1')
        .getValue('title') === 'Seabrook Cooperative',
  )
  await page.waitForFunction(() => window.painted.includes('Seabrook Cooperative'))
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('willow-landed-cost').save()))),
    hostBefore,
  )
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('willow-supplier-operations')
        .getTableById('suppliers')
        .getRecordById('suppliers-1')
        .getValue('title') === 'Seabrook Studio',
  )
  report.checks.push(
    'Native Base cell keyboard editing changes stored and painted supplier text; native Undo restores it without changing the host workbook',
  )
  await page.setViewportSize({ width: 1600, height: 1100 })
  await page.evaluate(() => {
    window.painted = []
  })
  await page.getByText('Follow-ups', { exact: true }).click()
  await page.waitForFunction(
    () =>
      window.painted.join('').includes('Request fibre evidence') && window.painted.join('').includes('Seabrook Studio'),
  )
  const linked = await page.evaluate(() =>
    window.univerAPI
      .getBase('willow-supplier-operations')
      .getTableById('followups')
      .getRecordById('followups-1')
      .getValue('supplier'),
  )
  assert.ok(JSON.stringify(linked).includes('suppliers-1'))
  assert.ok(!JSON.stringify(linked).includes('Seabrook'))
  await page.screenshot({ path: path.join(directory, 'linked-followups.png'), fullPage: true, timeout: 30000 })
  report.checks.push(
    'A real supplier edit repaints, native Undo/Redo owns the edit, and native Follow-ups navigation paints the renamed supplier through its stable record link',
  )
  const childBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getBase('willow-supplier-operations').save())),
  )
  await tab('Landed cost').click()
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('willow-landed-cost').getSheetBySheetId('landed-cost').getRange('E5').setValue(600),
  )
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('willow-landed-cost')
        .getSheetBySheetId('landed-cost')
        .getRange('G12')
        .getRawValue() === 39135,
  )
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getBase('willow-supplier-operations').save())),
    ),
    childBefore,
  )
  await tab('Release checks').click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('willow-landed-cost')
        .getSheetBySheetId('release-checks')
        .getRange('B4')
        .getRawValue() === 'Estimate: $39135',
  )
  await settle()
  await page.screenshot({ path: path.join(directory, 'release-checks.png'), fullPage: true, timeout: 30000 })
  await tab('Supplier operations').click()
  await settle()
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getBase('willow-supplier-operations').save())),
    ),
    childBefore,
  )
  await page.screenshot({ path: path.join(directory, 'returned-base.png'), fullPage: true, timeout: 30000 })
  report.checks.push(
    'Workbook tab round trips preserve the full edited Base while freight updates landed cost to 39135 and the release-check narrative',
  )
  assert.deepEqual(report.errors, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.willow-embed').count(), 0)
  assert.deepEqual(report.errors, [], 'Include asynchronous teardown errors')
  report.checks.push(
    'Selected active Base child disposal removes its root without browser errors; broader lifecycle/native typing coverage remains open',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-3000),
      painted: window.painted?.slice(-100),
      base: window.univerAPI?.getBase('willow-supplier-operations')?.save(),
      roots: [...document.querySelectorAll('[data-embed-child-render-mode]')].map((root) => ({
        tag: root.tagName,
        mode: root.getAttribute('data-embed-child-render-mode'),
        parent: root.parentElement?.outerHTML.slice(0, 400),
      })),
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true, timeout: 30000 }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Base@Sheet Tab')
