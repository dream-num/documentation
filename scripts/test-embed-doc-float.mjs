import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/docs-in-sheets-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-doc-float')
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
      cacheDir: path.resolve('test-results/embed-doc-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4193, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4193/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.cedar-embed')
      return root?.dataset.ready === 'true' || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.locator('.cedar-embed').getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'cedar-supplier-review' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'sheets-floating-object')
  assert.equal(report.descriptor.childUnitId, 'cedar-exception-memo')
  assert.equal(report.descriptor.context.resolved, true)
  const child = page.locator('[data-u-comp="embed-float-dom"]')
  await child.waitFor({ timeout: 30000 })
  await page.waitForFunction(() => window.painted.join('').includes('Protect opening day.'), {}, { timeout: 30000 })
  assert.equal(
    await page.locator('.cedar-embed > fieldset, .cedar-embed > details, .cedar-embed [data-action]').count(),
    0,
  )
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
    'Native SheetFloating anchor resolves a real modern Docs unit and paints the authored memo with official CSS',
  )
  await page.screenshot({ path: path.join(directory, 'native-float.png'), fullPage: true, timeout: 30000 })
  await child.dblclick({ position: { x: 300, y: 180 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  const hostBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('cedar-supplier-review').save())),
  )
  await page.evaluate(() => {
    window.painted = []
    window.univerAPI.getDocument('cedar-exception-memo').getParagraphs()[1].setText('Protect the opening date.')
  })
  await page.waitForFunction(() => window.painted.join('').includes('Protect the opening date.'))
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('cedar-supplier-review').save()))),
    hostBefore,
  )
  report.checks.push(
    'Native activation permits a real Docs paragraph edit and repaint without mutating the host workbook',
  )
  await page.screenshot({ path: path.join(directory, 'edited-memo.png'), fullPage: true, timeout: 30000 })
  const memoBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getDocument('cedar-exception-memo').save())),
  )
  await page.evaluate(() => {
    window.painted = []
  })
  const childBounds = await child.boundingBox()
  assert.ok(childBounds)
  await page.mouse.move(childBounds.x + 300, childBounds.y + 420)
  await page.mouse.wheel(0, 440)
  await page.waitForFunction(() => window.painted.join('').includes('Approval is still pending'))
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getDocument('cedar-exception-memo').save()))),
    memoBefore,
  )
  report.checks.push('Native child scrolling paints the lower approval section without modifying its content')
  await page.screenshot({ path: path.join(directory, 'approval-scroll.png'), fullPage: true, timeout: 30000 })
  await page.evaluate(() => {
    window.painted = []
    window.univerAPI
      .getWorkbook('cedar-supplier-review')
      .getSheetBySheetId('supplier-quotes')
      .getRange('B6')
      .setValue(20100)
  })
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('cedar-supplier-review')
        .getSheetBySheetId('supplier-quotes')
        .getRange('B11')
        .getRawValue() === 1700,
  )
  await page.waitForFunction(() => window.painted.join('').includes('$1,700'))
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getDocument('cedar-exception-memo').save()))),
    memoBefore,
  )
  report.checks.push('Host quote recalculates the premium to $1,700 while keeping the entire edited document unchanged')
  assert.deepEqual(report.errors, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  assert.equal(await page.locator('.cedar-embed').count(), 0)
  assert.deepEqual(report.errors, [], 'Include asynchronous teardown errors')
  report.checks.push(
    'Selected active-child teardown removes its owner without browser errors; full failure matrix remains open',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      roots: [...document.querySelectorAll('.cedar-embed')].map((el) => ({
        ready: el.dataset.ready,
        error: el.dataset.error,
      })),
      painted: window.painted?.slice(-150),
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true, timeout: 30000 }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Doc@Sheet Float')
