import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/slides-in-sheets-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-slide-float')
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
      cacheDir: path.resolve('test-results/embed-slide-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4187, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4187/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.harbor-embed')
      return root?.dataset.ready || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.locator('.harbor-embed').getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  const descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'harbor-budget' })[0].getDescriptor(),
  )
  assert.equal(descriptor.entry, 'sheets-floating-object')
  assert.equal(descriptor.childUnitId, 'harbor-decision')
  assert.equal(descriptor.context.resolved, true)
  report.descriptor = descriptor
  await page.locator('[data-u-comp="embed-float-dom-content"]').first().waitFor({ timeout: 30000 })
  await page.waitForFunction(() => window.painted.join('').includes('A smaller launch.'), {}, { timeout: 30000 })
  assert.equal(await page.locator('.harbor-embed > fieldset, .harbor-embed [data-action]').count(), 0)
  report.checks.push(
    'Real Sheet floating anchor, loaded Slides child, visible native child title and zero host fixture controls',
  )
  await page.screenshot({ path: path.join(directory, 'native-float.png'), fullPage: true })
  const child = page.locator('[data-u-comp="embed-float-dom"]')
  await child.dblclick({ position: { x: 300, y: 180 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page.evaluate(() => {
    window.painted = []
    const text = window.univerAPI.getPresentation('harbor-decision').getActiveSlide().getShape('decision-0').getText()
    const rich = text.getRichText().copy()
    rich.getParagraphs()[0].getTextRuns()[0].setText('Harbor / Service comes first')
    text.setRichText(rich)
  })
  await page.waitForFunction(() => window.painted.join('').includes('Service comes first'))
  report.checks.push(
    'Native double-click enters child editing; real Slides Facade text mutation repaints the embedded child',
  )
  await page.screenshot({ path: path.join(directory, 'child-edit.png'), fullPage: true })
  await page.evaluate(() => {
    window.painted = []
    const embed = window.univerAPI.listEmbeds({ hostUnitId: 'harbor-budget' })[0]
    if (!embed.setDisplayTarget({ pageId: 'review' })) throw new Error('Display target rejected')
  })
  await page.waitForFunction(() => window.painted.join('').includes('Protect the service'))
  report.checks.push('FEmbed.setDisplayTarget switches to the distinct mint review slide')
  await page.screenshot({ path: path.join(directory, 'review.png'), fullPage: true })
  await page.evaluate(() => {
    window.painted = []
  })
  await page.getByRole('button', { name: 'Previous page', exact: true }).click()
  await page.waitForFunction(() => window.painted.join('').includes('Service comes first'))
  report.checks.push('Native Previous page control returns to the edited decision slide')
  const childBeforeHostEdit = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getPresentation('harbor-decision').save())),
  )
  await page.evaluate(() => {
    window.painted = []
    window.univerAPI.getWorkbook('harbor-budget').getSheetByName('Operating plan').getRange('B5').setValue(13000)
  })
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('harbor-budget')
        .getSheetByName('Operating plan')
        .getRange('B18')
        .getDisplayValue() === '$30,100',
  )
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getWorkbook('harbor-budget').getSheetByName('Operating plan').getRange('B18').getRawValue(),
    ),
    30100,
  )
  await page.waitForFunction(() => window.painted.join('').includes('$30,100'))
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getPresentation('harbor-decision').save()))),
    childBeforeHostEdit,
  )
  report.checks.push('Host cost edit recalculates and paints $30,100 without changing the child presentation')
  assert.deepEqual(report.errors, [])
  report.cleanupRoots = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('[data-embed-floating-menu-entry], [data-u-comp="embed-float-dom-live-content"]'),
      (element) => ({
        html: element.outerHTML.slice(0, 350),
        owned: Boolean(element.closest('.harbor-embed')),
        parent: element.parentElement?.outerHTML.slice(0, 200),
      }),
    ),
  )
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  assert.equal(await page.locator('.harbor-embed').count(), 0)
  assert.deepEqual(report.errors, [], 'Include asynchronous native cleanup errors')
  report.checks.push('Selected owner disposal removes host root; full fault matrix remains open')
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.hostDiagnostic = await page
    .evaluate(() => ({
      value: window.univerAPI
        ?.getWorkbook('harbor-budget')
        ?.getSheetByName('Operating plan')
        ?.getRange('B18')
        .getValue(),
      painted: window.painted?.slice(-120),
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Slide@Sheet Float')
