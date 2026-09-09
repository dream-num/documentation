/* eslint-disable no-await-in-loop -- Native menu tabs share one active ribbon and must be visited sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/sheets-in-docs-block/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-doc-block')
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
      cacheDir: path.resolve('test-results/embed-sheet-doc-block/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4205, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
const page = await browser.newPage({
  viewport: { width: Number(process.env.SHOWCASE_VIEWPORT_WIDTH || 1600), height: 1100 },
})
const report = { passed: false, checks: [], errors: [], backendRequests: [] }
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) || request.url().includes('/universer-api/'))
    report.backendRequests.push({ method: request.method(), url: request.url() })
})
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
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4205/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.northstar-embed')
      return root?.dataset.ready === 'true' || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  assert.equal(await page.locator('.northstar-embed').getAttribute('data-error'), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'northstar-investment-brief' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'docs-custom-block')
  assert.equal(report.descriptor.childUnitId, 'northstar-pilot-budget')
  assert.equal(report.descriptor.context.resolved, true)
  const block = page.locator('[data-u-comp="embed-docs-custom-block"]')
  await block.waitFor()
  const child = block.locator('[data-u-comp="embed-float-dom"]')
  await page.waitForFunction(() => window.painted.join('').includes('A smaller pilot.'))
  assert.equal(
    await page
      .locator('iframe,.northstar-embed > fieldset,.northstar-embed > details,.northstar-embed [data-action]')
      .count(),
    0,
  )
  await page.screenshot({ path: path.join(directory, 'investment-brief.png'), fullPage: true })
  await page.mouse.move(850, 400)
  await page.mouse.wheel(0, 400)
  await settle()
  await child.click({ position: { x: 180, y: 130 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Resident research'))
  const styles = await page
    .locator('[data-u-comp="workbench-layout"]')
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
  assert.equal(styles.background, 'rgb(255, 255, 255)')
  assert.equal(styles.flex, 'flex')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('northstar-pilot-budget')
        .getSheetBySheetId('investment')
        .getRange('D14')
        .getRawValue() === 38852,
  )
  report.checks.push(
    'Native modern DocBlock paints the original brief and editable two-sheet investment model with official CSS and no fixture panel',
  )
  await page.screenshot({ path: path.join(directory, 'active-workbook.png'), fullPage: true })
  const hostBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getDocument('northstar-investment-brief').save())),
  )
  await page.evaluate(() => {
    window.painted = []
    window.univerAPI.getWorkbook('northstar-pilot-budget').getSheetBySheetId('investment').getRange('B7').setValue(34)
  })
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('northstar-pilot-budget')
        .getSheetBySheetId('investment')
        .getRange('D14')
        .getRawValue() === 41492,
  )
  await page.waitForFunction(() => window.painted.join('').includes('20,400'))
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getDocument('northstar-investment-brief').save())),
    ),
    hostBefore,
  )
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('northstar-pilot-budget')
        .getSheetBySheetId('investment')
        .getRange('D17')
        .getRawValue(),
    ),
    3508,
  )
  report.checks.push(
    'Embedded effort edit recalculates the envelope to 41492 and headroom to 3508 while preserving the full host document',
  )
  await page.screenshot({ path: path.join(directory, 'edited-investment.png'), fullPage: true })
  // Select a different cell; clicking the already selected A3 can enter its text editor.
  await child.click({ position: { x: 350, y: 210 } })
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('northstar-pilot-budget')
        .getSheetBySheetId('investment')
        .getRange('D14')
        .getRawValue() === 38852,
  )
  await page.keyboard.press('Control+y')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('northstar-pilot-budget')
        .getSheetBySheetId('investment')
        .getRange('D14')
        .getRawValue() === 41492,
  )
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getDocument('northstar-investment-brief').save())),
    ),
    hostBefore,
  )
  report.checks.push(
    'Native keyboard Undo/Redo belongs to the embedded workbook and leaves the host document unchanged',
  )
  await page
    .locator('[data-u-comp="sheet-embed-floating-menu"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await page.locator('[data-embed-fullscreen-shell="true"]').waitFor()
  const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
  await fullscreen.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(await fullscreen.locator('[data-u-comp="ribbon-toolbar"]').count(), 0)
  report.ribbonTabs = []
  // Each native ribbon page realizes its own factories; merely expanding Start missed dependencies.
  for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
    await fullscreen.getByRole('tab', { name, exact: true }).click()
    await settle()
    const commands = await fullscreen
      .locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-u-command')))
    assert.ok(commands.length > 0, `${name} has real native commands`)
    report.ribbonTabs.push({ name, commands })
    assert.deepEqual(report.errors, [], `${name} menu factories have their real plugin dependencies`)
  }
  await fullscreen.getByRole('tab', { name: 'Start', exact: true }).click()
  report.checks.push('Expanded Grid ribbon exposes five populated native tabs without missing plugin dependencies')
  await page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Phasing' }).click()
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('northstar-pilot-budget').getActiveSheet().getSheetId() === 'phasing',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Release funds by evidence'))
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getWorkbook('northstar-pilot-budget').getSheetBySheetId('phasing').getRange('C8').getRawValue(),
    ),
    41492,
  )
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getWorkbook('northstar-pilot-budget').getSheetBySheetId('phasing').getRange('C10').getRawValue(),
    ),
    0,
  )
  await page.screenshot({ path: path.join(directory, 'fullscreen-phasing.png'), fullPage: true })
  if (process.env.SHOWCASE_PRINT === '1') {
    await page.evaluate(() => {
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      })
    })
    await fullscreen.locator('[data-u-command="sheet.menu.print"]').click()
    await page.getByRole('menuitem', { name: 'Print', exact: true }).click()
    await fullscreen.waitFor({ state: 'detached' })
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printSource), {
      workbook: 'northstar-pilot-budget',
      sheet: 'phasing',
    })
    await page.getByText('Total: 1pages', { exact: true }).waitFor()
    await page.screenshot({ path: path.join(directory, 'print-phasing.png'), fullPage: true })
    await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
    report.checks.push(
      'Native print preview opens and cancels from the embedded Phasing sheet without a backend request',
    )
    await child.click({ position: { x: 180, y: 130 } })
    await page
      .locator('[data-u-comp="sheet-embed-floating-menu"]')
      .getByRole('button', { name: 'Enter fullscreen', exact: true })
      .click()
    await fullscreen.waitFor()
  }
  await page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Investment' }).click()
  await page.locator('[data-embed-fullscreen-close="true"]').click()
  await page.locator('[data-embed-fullscreen-shell="true"]').waitFor({ state: 'detached' })
  await child.waitFor()
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getDocument('northstar-investment-brief').save())),
    ),
    hostBefore,
  )
  report.checks.push(
    'Native fullscreen exposes the Phasing sheet with linked allocations and returns to the DocBlock without changing the host',
  )
  const workbookBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('northstar-pilot-budget').save())),
  )
  const anchorBefore = report.descriptor.context.startIndex
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getDocument('northstar-investment-brief').getParagraphs()[1].appendText(' Revised.'),
    ),
    true,
  )
  await page.waitForFunction(() =>
    window.univerAPI
      .getDocument('northstar-investment-brief')
      .getBody()
      .dataStream.includes('A smaller pilot. A clearer decision. Revised.'),
  )
  const anchorAfter = await page.evaluate(
    () =>
      window.univerAPI.listEmbeds({ hostUnitId: 'northstar-investment-brief' })[0].getDescriptor().context.startIndex,
  )
  assert.equal(anchorAfter, anchorBefore + ' Revised.'.length)
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('northstar-pilot-budget').save())),
    ),
    workbookBefore,
  )
  report.checks.push(
    'Editing narrative above the block moves its native UTF-16 anchor while preserving the entire child workbook',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.northstar-embed').count(), 0)
  assert.deepEqual(report.errors, [], 'Include asynchronous teardown errors')
  report.checks.push(
    'Selected active-child disposal releases the owner without browser errors; full lifecycle acceptance remains open',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-2500),
      painted: window.painted?.slice(-150),
      roots: [...document.querySelectorAll('.northstar-embed')].map((el) => ({
        ready: el.dataset.ready,
        error: el.dataset.error,
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
console.log('PASS selected native Sheet@Docs Block')
