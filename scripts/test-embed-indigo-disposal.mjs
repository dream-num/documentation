/* eslint-disable no-await-in-loop -- Check each native ownership phase before creating the next instance. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const [{ directory: exportDirectory }] = JSON.parse(
  await fs.readFile('test-results/indigo-formula-export/exports.json', 'utf8'),
)
const source = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/slides-in-bases-formula-tab')
for (const [name, content] of Object.entries(source.files))
  await fs.writeFile(path.join(exportDirectory, name.slice(1)), content)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-indigo-disposal')
await fs.mkdir(directory, { recursive: true })
const outDir = path.join(directory, 'harness-dist')
const { build, preview } = await import(
  pathToFileURL(path.join(exportDirectory, 'node_modules/vite/dist/node/index.js'))
)
// Only the test entry changes: exercise the exact exported factory, native CSS and data.
await build({
  root: exportDirectory,
  configFile: false,
  logLevel: 'warn',
  build: { outDir, emptyOutDir: false },
  plugins: [
    {
      name: 'indigo-disposal-harness',
      transformIndexHtml: {
        order: 'pre',
        handler: () => `
    <!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0">
    <div id="app" style="height:100vh"></div><aside id="unrelated">Unrelated content</aside><script type="module">
      import {createDemo} from '/src/create-demo.ts';
      window.disposals = [];
      window.createOwned = (locale = 'enUS') => {
        const demo = createDemo(document.getElementById('app'), false, locale);
        const original = demo.univerAPI.disposeUnit.bind(demo.univerAPI);
        demo.univerAPI.disposeUnit = (id) => {
          const removed = original(id);
          window.disposals.push({id, removed});
          return removed;
        };
        return demo;
      };
      window.demo = window.createOwned();
    </script></body></html>`,
      },
    },
  ],
})
const server = await preview({
  root: exportDirectory,
  configFile: false,
  build: { outDir },
  preview: { host: '127.0.0.1', port: 4316, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
const report = { passed: false, checks: [], errors: [], warnings: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['xhr', 'fetch'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.amountPoint = null
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (String(text) === '22,000' && this.canvas.id === 'univer-base-main-canvas_indigo-community-portfolio') {
      const p = this.getTransform().transformPoint({ x: args[0], y: args[1] }),
        b = this.canvas.getBoundingClientRect()
      if (b.width > 300)
        window.amountPoint = {
          x: b.x + (p.x * b.width) / this.canvas.width,
          y: b.y + (p.y * b.height) / this.canvas.height,
        }
    }
    return Reflect.apply(original, this, [text, ...args])
  }
})
const ready = async () => {
  await page.waitForFunction(
    () =>
      document.querySelector('.indigo-embed')?.dataset.ready || document.querySelector('.indigo-embed')?.dataset.error,
    null,
    { timeout: 45000 },
  )
  assert.equal(await page.locator('.indigo-embed').getAttribute('data-error'), null)
}
const units = ['indigo-allocation-review', 'indigo-community-portfolio']
async function assertDisposed(before, expected) {
  await page.locator('.indigo-embed').waitFor({ state: 'detached' })
  assert.equal(await page.locator('#unrelated').innerText(), 'Unrelated content')
  const trace = await page.evaluate(() => window.disposals)
  assert.deepEqual(
    trace.slice(before),
    units.map((id, i) => ({ id, removed: expected[i] })),
  )
  assert.equal(await page.locator('#app canvas, [data-embed-child-render-mode]').count(), 0)
  report.checks.push({ phase: 'owned unit disposal order', trace: trace.slice(before) })
}
try {
  await page.goto('http://127.0.0.1:4316', { waitUntil: 'domcontentloaded' })
  await ready()
  await page.getByText('Portfolio review', { exact: true }).click()
  await page.locator('[data-u-comp="slide-thumbnail-item"]').first().waitFor()
  await page.evaluate(() => {
    // An older owner must not erase a later global API assignment.
    window.newerOwner = { sentinel: true }
    window.univerAPI = window.newerOwner
    window.demo.dispose()
    window.demo.dispose()
  })
  await assertDisposed(0, [true, true])
  assert.equal(await page.evaluate(() => window.univerAPI === window.newerOwner), true)
  report.checks.push('Active Slides child: idempotent disposal, unrelated DOM and later global owner preserved')

  await page.evaluate(() => {
    window.amountPoint = null
    window.demo = window.createOwned('zhCN')
  })
  await ready()
  await page.waitForFunction(() => window.amountPoint)
  const point = await page.evaluate(() => window.amountPoint)
  await page.mouse.dblclick(point.x - 20, point.y - 4)
  await page.locator('input[inputmode="decimal"]').waitFor()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('26000')
  await page.screenshot({ path: path.join(directory, 'active-native-editor.png') })
  // Deliberately do not commit: disposal must release the in-progress editor too.
  await page.evaluate(() => {
    window.demo.dispose()
    window.demo.dispose()
  })
  await assertDisposed(2, [true, true])
  assert.equal(await page.locator('input[inputmode="decimal"]').count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  report.checks.push('ZH native Base edit in progress: editor, both units and API released')

  await page.evaluate(() => {
    window.demo = window.createOwned()
    window.demo.dispose()
    window.demo.dispose()
  })
  await assertDisposed(4, [false, true])
  // Pass the native Steady delay; no provider or late callback may resurrect a unit.
  await page.waitForTimeout(4000)
  assert.equal(await page.locator('.indigo-embed, #app canvas, [data-embed-child-render-mode]').count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.equal((await page.evaluate(() => window.disposals)).length, 6)
  report.checks.push('Immediate pre-Steady disposal remains terminal after native lifecycle timers')
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  await server.httpServer.close()
}
if (!report.passed) process.exitCode = 1
