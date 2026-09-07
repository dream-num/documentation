import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/bases-in-sheets-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-base-float')
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
      cacheDir: path.resolve('test-results/embed-base-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4197, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4197/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.atlas-embed')
      return root?.dataset.ready || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.locator('.atlas-embed').getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'atlas-campaign-spend' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'sheets-floating-object')
  assert.equal(report.descriptor.childUnitId, 'atlas-campaign-work')
  assert.equal(report.descriptor.context.resolved, true)
  const child = page.locator('[data-u-comp="embed-float-dom"]')
  await child.waitFor({ timeout: 30000 })
  await page.waitForFunction(
    () => window.painted.join('').includes('Approve search landing copy'),
    {},
    { timeout: 30000 },
  )
  assert.equal(
    await page.locator('.atlas-embed > fieldset, .atlas-embed > details, .atlas-embed [data-action]').count(),
    0,
  )
  assert.equal(await page.locator('iframe').count(), 0)
  const styles = await page
    .locator('[data-u-comp="workbench-layout"]')
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
  assert.equal(styles.background, 'rgb(255, 255, 255)')
  assert.equal(styles.flex, 'flex')
  const initial = await page.evaluate(() => {
    const host = window.univerAPI.getWorkbook('atlas-campaign-spend').getSheetBySheetId('campaign-budget')
    const table = window.univerAPI.getBase('atlas-campaign-work').getTableById('deliverables')
    return {
      totals: ['B12', 'C12', 'B14'].map((address) => host.getRange(address).getRawValue()),
      records: table.getRecords().length,
    }
  })
  assert.deepEqual(initial, { totals: [15000, 12170, 2830], records: 8 })
  report.checks.push(
    'Real native SheetFloating Base paints authored deliverables beside calculated campaign commitments, with official CSS and no substitute controls',
  )
  await page.screenshot({ path: path.join(directory, 'native-float.png'), fullPage: true, timeout: 30000 })
  await child.dblclick({ position: { x: 300, y: 180 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  const hostBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('atlas-campaign-spend').save())),
  )
  await page.evaluate(() => {
    window.painted = []
    const record = window.univerAPI
      .getBase('atlas-campaign-work')
      .getTableById('deliverables')
      .getRecordById('deliverable-1')
    if (!record.setValue('task', 'Approve accessible landing copy')) throw new Error('Base record edit rejected')
  })
  // The native Base cell ellipsizes long values; verify its fresh visible prefix and exact Facade value.
  await page.waitForFunction(() => window.painted.join('').includes('Approve accessible'))
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI
        .getBase('atlas-campaign-work')
        .getTableById('deliverables')
        .getRecordById('deliverable-1')
        .getValue('task'),
    ),
    'Approve accessible landing copy',
  )
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('atlas-campaign-spend').save()))),
    hostBefore,
  )
  report.checks.push(
    'Native activation and a real Base record Facade edit repaint the deliverable without mutating the host workbook',
  )
  const toolbar = page.locator('[data-u-comp="base-embed-actions-surface"]')
  await toolbar.getByRole('button', { name: 'Undo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('atlas-campaign-work')
        .getTableById('deliverables')
        .getRecordById('deliverable-1')
        .getValue('task') === 'Approve search landing copy',
  )
  await toolbar.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('atlas-campaign-work')
        .getTableById('deliverables')
        .getRecordById('deliverable-1')
        .getValue('task') === 'Approve accessible landing copy',
  )
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('atlas-campaign-spend').save()))),
    hostBefore,
  )
  report.checks.push('Native Base floating-menu Undo/Redo owns the task edit without changing the host workbook')
  await page.screenshot({ path: path.join(directory, 'edited-base.png'), fullPage: true, timeout: 30000 })
  const childBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getBase('atlas-campaign-work').save())),
  )
  const bounds = await child.boundingBox()
  assert.ok(bounds)
  await page.evaluate(() => {
    window.painted = []
  })
  await page.mouse.move(bounds.x + 500, bounds.y + 250)
  await page.mouse.wheel(650, 0)
  await page.waitForFunction(() => window.painted.join('').includes('Legal must approve'))
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('atlas-campaign-work').save()))),
    childBefore,
  )
  await page.screenshot({ path: path.join(directory, 'evidence-scroll.png'), fullPage: true, timeout: 30000 })
  report.checks.push('Native horizontal scrolling reveals authored next-evidence text without altering Base data')
  await page.evaluate(() =>
    window.univerAPI
      .getWorkbook('atlas-campaign-spend')
      .getSheetBySheetId('campaign-budget')
      .getRange('C7')
      .setValue(4000),
  )
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('atlas-campaign-spend')
        .getSheetBySheetId('campaign-budget')
        .getRange('B14')
        .getRawValue() === 2580,
  )
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('atlas-campaign-work').save()))),
    childBefore,
  )
  report.checks.push(
    'Host commitments recalculate available budget to 2580 while preserving the entire edited Base snapshot',
  )
  assert.deepEqual(report.errors, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.atlas-embed').count(), 0)
  assert.deepEqual(report.errors, [], 'Include asynchronous teardown errors')
  report.checks.push(
    'Selected active-child disposal removes the root without browser errors; full lifecycle and native keyboard/history acceptance remain open',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-2500),
      painted: window.painted?.slice(-150),
      roots: [...document.querySelectorAll('.atlas-embed')].map((el) => ({
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
console.log('PASS selected native Base@Sheet Float')
