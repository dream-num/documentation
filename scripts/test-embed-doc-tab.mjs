import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/docs-in-sheets-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-doc-tab')
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
      cacheDir: path.resolve('test-results/embed-doc-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4195, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const tab = (name) => page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4195/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.juniper-embed')
      return root?.dataset.ready === 'true' || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.locator('.juniper-embed').getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'juniper-repair-capacity' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'sheets-sheet-tab')
  assert.equal(report.descriptor.childUnitId, 'juniper-capacity-assumptions')
  assert.equal(report.descriptor.context.index, 1)
  assert.equal(report.descriptor.context.name, 'Assumptions')
  assert.equal(await page.locator('[data-u-comp="embed-float-dom"]').count(), 0)
  assert.equal(
    await page.locator('.juniper-embed > fieldset, .juniper-embed > details, .juniper-embed [data-action]').count(),
    0,
  )
  const sums = await page.evaluate(() => {
    const sheet = window.univerAPI.getWorkbook('juniper-repair-capacity').getSheetBySheetId('weekly-capacity')
    return ['E11', 'F11', 'G11', 'G6'].map((address) => sheet.getRange(address).getRawValue())
  })
  assert.deepEqual(sums, [89, 77, 12, -2])
  await tab('Weekly capacity').click()
  await settle()
  await page.screenshot({ path: path.join(directory, 'capacity.png'), fullPage: true, timeout: 30000 })
  await tab('Assumptions').click()
  await page.locator('[data-embed-sheets-sheet-tab-host]').waitFor()
  await page.waitForFunction(() => window.painted.join('').includes('Capacity is not a promise.'))
  const sdk = await page
    .locator('[data-u-comp="workbench-layout"]')
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
  assert.equal(sdk.background, 'rgb(255, 255, 255)')
  assert.equal(sdk.flex, 'flex')
  report.checks.push(
    'Native SheetTab at index 1 renders an independent modern Docs child with official CSS, not a floating or iframe substitute',
  )
  await page.screenshot({ path: path.join(directory, 'assumptions.png'), fullPage: true, timeout: 30000 })
  const baseline = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getDocument('juniper-capacity-assumptions').save().body)),
  )
  await page.evaluate(() => {
    window.painted = []
    window.univerAPI
      .getDocument('juniper-capacity-assumptions')
      .getParagraphs()[1]
      .setText('Capacity needs the right skills.')
  })
  // The native document can hyphenate the edited title across two painted lines.
  await page.waitForFunction(() =>
    window.painted.join('').replaceAll('-', '').includes('Capacity needs the right skills.'),
  )
  assert.ok(
    await page.evaluate(() =>
      window.univerAPI
        .getDocument('juniper-capacity-assumptions')
        .getBody()
        .dataStream.includes('Capacity needs the right skills.'),
    ),
  )
  const edited = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getDocument('juniper-capacity-assumptions').save().body)),
  )
  await page.locator('[data-u-command="univer.command.undo"]').click()
  await settle()
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getDocument('juniper-capacity-assumptions').save().body)),
    ),
    baseline,
  )
  await page.locator('[data-u-command="univer.command.redo"]').click()
  await settle()
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getDocument('juniper-capacity-assumptions').save().body)),
    ),
    edited,
  )
  report.checks.push('A real Docs paragraph edit repaints; native Undo/Redo restores the entire document body')
  const childBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getDocument('juniper-capacity-assumptions').save())),
  )
  await tab('Weekly capacity').click()
  await page.evaluate(() =>
    window.univerAPI
      .getWorkbook('juniper-repair-capacity')
      .getSheetBySheetId('weekly-capacity')
      .getRange('B6')
      .setValue(5),
  )
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('juniper-repair-capacity')
        .getSheetBySheetId('weekly-capacity')
        .getRange('E11')
        .getRawValue() === 92,
  )
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('juniper-repair-capacity')
        .getSheetBySheetId('weekly-capacity')
        .getRange('G6')
        .getRawValue(),
    ),
    1,
  )
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getDocument('juniper-capacity-assumptions').save())),
    ),
    childBefore,
  )
  await tab('Readiness').click()
  await page.waitForFunction(() => {
    const host = window.univerAPI.getWorkbook('juniper-repair-capacity')
    return (
      host.getSheetBySheetId('readiness').getRange('C4').getRawValue() === 'Available slots: 1' &&
      host.getSheetBySheetId('weekly-capacity').getRange('A16').getRawValue() ===
        'Electronics available slots: 1. Skills are not interchangeable.'
    )
  })
  await settle()
  await page.screenshot({ path: path.join(directory, 'readiness.png'), fullPage: true, timeout: 30000 })
  await tab('Assumptions').click()
  await settle()
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.univerAPI.getDocument('juniper-capacity-assumptions').save().body)),
    ),
    edited,
  )
  report.checks.push(
    'Round trips through both host worksheets preserve the edited document; staffing recalculates total capacity to 92 and Electronics availability to 1',
  )
  await page.screenshot({ path: path.join(directory, 'edited-return.png'), fullPage: true, timeout: 30000 })
  assert.deepEqual(report.errors, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.juniper-embed').count(), 0)
  assert.deepEqual(report.errors, [], 'Include asynchronous cleanup errors')
  report.checks.push(
    'Selected active-child disposal removes its root without browser errors; complete fault coverage remains open',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      painted: window.painted?.slice(-120),
      body: window.univerAPI?.getDocument('juniper-capacity-assumptions')?.save().body,
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true, timeout: 30000 }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Doc@Sheet Tab')
