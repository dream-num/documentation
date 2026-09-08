import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/slides-in-docs-block/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-slide-doc-block')
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
      cacheDir: path.resolve('test-results/embed-slide-doc-block/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4211, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
  window.paintPoints = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
    const rect = this.canvas.getBoundingClientRect()
    window.paintPoints.push({
      text: String(args[0]),
      fullscreen: Boolean(this.canvas.closest('[data-embed-fullscreen-shell="true"]')),
      x: rect.x + (point.x * rect.width) / this.canvas.width,
      y: rect.y + (point.y * rect.height) / this.canvas.height,
    })
    if (window.paintPoints.length > 20000) window.paintPoints.splice(0, 10000)
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

const hostSnapshot = () =>
  page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getDocument('lighthouse-strategy-announcement').save())),
  )
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getPresentation('lighthouse-strategy-deck').save())))
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4211/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.lighthouse-embed')
      return root?.dataset.ready === 'true' || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  assert.equal(await page.locator('.lighthouse-embed').getAttribute('data-error'), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'lighthouse-strategy-announcement' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'docs-custom-block')
  assert.equal(report.descriptor.childUnitId, 'lighthouse-strategy-deck')
  assert.equal(report.descriptor.context.resolved, true)
  assert.deepEqual((await childSnapshot()).slideOrder, ['strategy', 'evidence', 'learning'])
  const child = page.locator('[data-u-comp="embed-docs-custom-block"] [data-u-comp="embed-float-dom"]')
  await child.waitFor()
  await page.waitForFunction(() => window.painted.join('').includes('Make the first repair feel possible'))
  await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(
    await page
      .locator('iframe,.lighthouse-embed > fieldset,.lighthouse-embed > details,.lighthouse-embed [data-action]')
      .count(),
    0,
  )
  const styles = await page
    .locator('[data-u-comp="workbench-layout"]')
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
  assert.equal(styles.background, 'rgb(255, 255, 255)')
  assert.equal(styles.flex, 'flex')
  await page.screenshot({ path: path.join(directory, 'announcement.png'), fullPage: true })
  await page.mouse.move(850, 400)
  await page.mouse.wheel(0, 400)
  await settle()
  await child.dblclick({ position: { x: 300, y: 180 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page.waitForFunction(() => window.painted.join('').includes('useful repair'))
  await page.screenshot({ path: path.join(directory, 'active-strategy.png'), fullPage: true })
  report.checks.push(
    'Native Docs block paints an editable three-slide strategy deck with official white/Grid host CSS and no fixture panels',
  )
  await page.keyboard.press('Escape')
  await child.click({ position: { x: 680, y: 380 } })
  await page.keyboard.press('Escape')
  const hostBefore = await hostSnapshot()
  await page.evaluate(() => {
    window.painted = []
    const text = window.univerAPI
      .getPresentation('lighthouse-strategy-deck')
      .getActiveSlide()
      .getShape('strategy-title')
      .getText()
    const rich = text.getRichText().copy()
    rich.getParagraphs()[0].getTextRuns()[0].setText('Make the first')
    rich.getParagraphs()[1].getTextRuns()[0].setText('repair count.')
    text.setRichText(rich)
  })
  await page.waitForFunction(() => window.painted.join('').includes('repair count.'))
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.screenshot({ path: path.join(directory, 'edited-strategy.png'), fullPage: true })
  report.checks.push(
    'Slides rich-text Facade edit repaints the native child and preserves the entire host announcement',
  )
  await page.keyboard.press('Control+z')
  await page.waitForFunction(() =>
    window.univerAPI
      .getPresentation('lighthouse-strategy-deck')
      .getActiveSlide()
      .getShape('strategy-title')
      .getText()
      .getPlainText()
      .includes('useful repair.'),
  )
  await page.keyboard.press('Control+y')
  await page.waitForFunction(() =>
    window.univerAPI
      .getPresentation('lighthouse-strategy-deck')
      .getActiveSlide()
      .getShape('strategy-title')
      .getText()
      .getPlainText()
      .includes('repair count.'),
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push('Native keyboard Undo/Redo owns the slide text edit without modifying the host document')
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await page.waitForFunction(
    () => window.univerAPI.getPresentation('lighthouse-strategy-deck').getActiveSlide().getId() === 'evidence',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Evidence before reach'))
  await page.screenshot({ path: path.join(directory, 'evidence-cards.png'), fullPage: true })
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await page.waitForFunction(() => window.painted.join('').includes('Learn before expanding'))
  await page.screenshot({ path: path.join(directory, 'learning-timeline.png'), fullPage: true })
  report.checks.push('Native Next page visits different evidence-card and learning-timeline layouts')
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).filter({ visible: true }).click()
  const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
  await fullscreen.waitFor()
  await fullscreen.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  const thumbnails = fullscreen.locator('[data-u-comp="slide-thumbnail-item"]')
  assert.equal(await thumbnails.count(), 3)
  await thumbnails.first().click()
  await page.waitForFunction(
    () => window.univerAPI.getPresentation('lighthouse-strategy-deck').getActiveSlide().getId() === 'strategy',
  )
  await page.waitForFunction(() => window.painted.join('').includes('repair count.'))
  await page.screenshot({ path: path.join(directory, 'fullscreen-strategy.png'), fullPage: true })
  await page.locator('[data-embed-fullscreen-close="true"]').click()
  await fullscreen.waitFor({ state: 'detached' })
  report.checks.push('Native fullscreen exposes Grid and three slide thumbnails; returning preserves the edited slide')
  const childBefore = await childSnapshot()
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getDocument('lighthouse-strategy-announcement').getParagraphs()[1].appendText(' Revised.'),
    ),
    true,
  )
  const anchorAfter = await page.evaluate(
    () =>
      window.univerAPI.listEmbeds({ hostUnitId: 'lighthouse-strategy-announcement' })[0].getDescriptor().context
        .startIndex,
  )
  assert.equal(anchorAfter, report.descriptor.context.startIndex + ' Revised.'.length)
  assert.deepEqual(await childSnapshot(), childBefore)
  report.checks.push('Host title editing moves the native block anchor and preserves the full edited presentation')
  await child.click({ position: { x: 300, y: 180 } })
  await settle()
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.lighthouse-embed').count(), 0)
  assert.deepEqual(report.errors, [])
  report.checks.push('Selected active-child disposal releases the owner without browser errors or backend requests')
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-4000),
      painted: window.painted?.slice(-150),
      roots: [...document.querySelectorAll('[data-embed-child-render-mode]')].map((root) => ({
        mode: root.getAttribute('data-embed-child-render-mode'),
        parent: root.parentElement?.outerHTML.slice(0, 500),
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
console.log('PASS selected native Slides@Docs Block')
