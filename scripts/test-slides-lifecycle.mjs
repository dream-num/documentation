/* eslint-disable no-await-in-loop -- Native menu tabs share one active ribbon and must be visited sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/slides/slide-lifecycle/code'
// Execute the displayed example verbatim so documentation/API drift fails the real preview test.
const facadeExample = (await fs.readFile('showcase/slides/slide-lifecycle/README.md', 'utf8')).match(
  /```ts\n([\s\S]*?)```/,
)?.[1]
assert.ok(facadeExample, 'README must include the executable Facade example')
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-lifecycle-native')
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
      cacheDir: path.resolve('test-results/slides-lifecycle-native/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4221, strictPort: true, watch: { ignored: ['**/.next/**'] } },
      plugins: [
        {
          name: 'one-embed-only',
          configureServer(vite) {
            vite.middlewares.use((request, response, next) => {
              if (request.url !== '/') return next()
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
    const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
    const rect = this.canvas.getBoundingClientRect()
    window.paintPoints.push({
      text: String(args[0]),
      child: Boolean(this.canvas.closest('[data-embed-slides-page-list-host]')) && rect.width > 400,
      x: rect.x + (point.x * rect.width) / this.canvas.width,
      y: rect.y + (point.y * rect.height) / this.canvas.height,
    })
    if (window.paintPoints.length > 20000) window.paintPoints.splice(0, 10000)
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

const read = () => page.evaluate(() => window.univerAPI.getActivePresentation().save())
const root = page.locator('.slide-lifecycle')
const item = (id) => root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')
const show = async (id) => {
  await item(id).click()
  await page.waitForFunction(
    (pageId) => window.univerAPI.getActivePresentation().getActiveSlide().getId() === pageId,
    id,
  )
  await settle()
}
const menu = async (id, label) => {
  await item(id).click({ button: 'right' })
  await page.getByRole('button', { name: label, exact: true }).click()
  await settle()
}
const native = async (command) => {
  await root.locator('[data-u-command="' + command + '"]').click()
  await settle()
}
const orderIs = (expected) =>
  page.waitForFunction(
    (order) => JSON.stringify(window.univerAPI.getActivePresentation().save().slideOrder) === JSON.stringify(order),
    expected,
  )
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4221/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 120000 })
  await settle()
  assert.equal(await root.locator(':scope > fieldset,:scope > details,[data-action]').count(), 0)
  const styles = await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => ({
    background: getComputedStyle(el).backgroundColor,
    flex: getComputedStyle(el.querySelector('.univer-flex')).display,
  }))
  assert.equal(styles.background, 'rgb(255, 255, 255)')
  assert.equal(styles.flex, 'flex')
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  const baseline = await read()
  assert.equal(baseline.slideOrder.length, 8)
  await show('closing')
  for (const id of baseline.slideOrder) {
    await page.evaluate(() => {
      window.painted = []
    })
    await show(id)
    const title = baseline.slides[id].elements.title.shapeData.shapeText.dataModel.doc.body.dataStream.trim()
    await page.waitForFunction(
      (text) => window.painted.join('').replace(/\s/g, '').includes(text.replace(/\s/g, '')),
      title,
    )
    assert.equal(
      await root.getByRole('textbox', { name: 'Speaker notes', exact: true }).inputValue(),
      baseline.slides[id].speakerNotes,
    )
    await root.screenshot({ path: path.join(directory, id + '.png') })
  }
  report.checks.push(
    'Eight original museum-night pages render with distinct content/notes, white official CSS and native Grid controls; no fixture/diagnostic toolbar',
  )
  await show('atrium')
  const beforeCopy = await read()
  await menu('atrium', 'Copy')
  await menu('atrium', 'Paste')
  await page.waitForFunction(() => window.univerAPI.getActivePresentation().save().slideOrder.length === 9)
  const copied = await read()
  const copyId = copied.slideOrder.find((id) => !baseline.slideOrder.includes(id))
  assert.ok(copyId)
  assert.equal(copied.slideOrder.indexOf(copyId), copied.slideOrder.indexOf('atrium') + 1)
  assert.equal(copied.slides[copyId].speakerNotes, beforeCopy.slides.atrium.speakerNotes)
  assert.deepEqual(copied.slides.atrium, beforeCopy.slides.atrium)
  assert.deepEqual(copied.slides[copyId].elements, beforeCopy.slides.atrium.elements)
  report.copyId = copyId
  assert.equal(await page.evaluate(() => window.univerAPI.getActivePresentation().getActiveSlide().getId()), copyId)
  await page.evaluate(facadeExample)
  await page.waitForFunction(() => window.painted.join('').includes('Quiet arrival option'))
  const edited = await read()
  assert.deepEqual(edited.slides.atrium, beforeCopy.slides.atrium)
  assert.notDeepEqual(edited.slides[copyId].elements.title, beforeCopy.slides.atrium.elements.title)
  await root.screenshot({ path: path.join(directory, 'independent-copy.png') })
  report.checks.push(
    'Native thumbnail Copy/Paste inserts a distinct page with equal original elements/notes; the verbatim README Facade example paints only on the copy',
  )
  await menu(copyId, 'Delete')
  await orderIs(baseline.slideOrder)
  await native('univer.command.undo')
  await orderIs(copied.slideOrder)
  assert.deepEqual((await read()).slides[copyId], edited.slides[copyId])
  await native('univer.command.redo')
  await orderIs(baseline.slideOrder)
  assert.deepEqual((await read()).slides.atrium, beforeCopy.slides.atrium)
  report.checks.push(
    'Native Delete and ribbon Undo/Redo preserve the edited copy on restoration and never mutate the original page',
  )
  await show('atrium')
  await menu('atrium', 'Add slide below')
  await page.getByRole('button', { name: 'Blank', exact: true }).click()
  await page.waitForFunction(() => window.univerAPI.getActivePresentation().save().slideOrder.length === 9)
  const added = await read()
  const addedId = added.slideOrder.find((id) => !baseline.slideOrder.includes(id))
  assert.equal(added.slideOrder.indexOf(addedId), 3)
  assert.notEqual(addedId, copyId)
  await native('univer.command.undo')
  await orderIs(baseline.slideOrder)
  report.insertionUndoActivePage = (await read()).activeSlideId
  await native('univer.command.redo')
  await orderIs(added.slideOrder)
  assert.deepEqual((await read()).slides[addedId], added.slides[addedId])
  report.checks.push(
    'Native Add slide below creates a blank page at the requested position; Undo/Redo restores identity/order, not certified prior selection',
  )
  await show('atrium')
  const beforeTheme = await read()
  for (const dark of [true, false]) {
    await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
    await page.waitForFunction((value) => document.documentElement.classList.contains('univer-dark') === value, dark)
    assert.deepEqual(await read(), beforeTheme)
  }
  await native('slides-exchange-client.operation.exchange')
  await page.getByText('Open(File)', { exact: true }).waitFor()
  await page.getByText('Save As', { exact: true }).waitFor()
  await page.keyboard.press('Escape')
  await native('slide.operation.print-open')
  await page.getByText('Print range', { exact: true }).waitFor()
  await page.screenshot({ path: path.join(directory, 'print-settings.png'), fullPage: true })
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  report.checks.push(
    'Native File menu and Print settings open; live Facade theme switching preserves the complete model. No conversion or physical print claim',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => window.univerAPI === undefined && window.univer === undefined), true)
  assert.deepEqual(report.errors, [])
  report.checks.push('Owned SDK teardown removes DOM and globals without observed browser errors')
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-4000),
      painted: window.painted?.slice(-100),
      snapshot: window.univerAPI?.getActivePresentation()?.save(),
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS native-only Slides lifecycle; strict rich-text Undo and selection remain separate gates')
