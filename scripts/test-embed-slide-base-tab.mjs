/* eslint-disable no-await-in-loop -- One active host/child and theme state must be exercised in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/slides-in-bases-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-slide-base-tab')
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
      cacheDir: path.resolve('test-results/embed-slide-base-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4239, strictPort: true, watch: { ignored: ['**/.next/**'] } },
      plugins: [
        {
          name: 'one-embed-only',
          configureServer(vite) {
            vite.middlewares.use((request, response, next) => {
              if (request.url?.split('?')[0] !== '/') return next()
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
  viewport: { width: Number(process.env.SHOWCASE_VIEWPORT_WIDTH || 1600), height: 1200 },
})
const report = { passed: false, checks: [], errors: [], backendRequests: [], gates: {} }
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
    const bounds = this.canvas.getBoundingClientRect()
    if (bounds.width > 300)
      window.paintPoints.push({
        text: String(args[0]),
        font: this.font,
        x: bounds.x + (point.x * bounds.width) / this.canvas.width,
        y: bounds.y + (point.y * bounds.height) / this.canvas.height,
      })
    if (window.paintPoints.length > 10000) window.paintPoints.splice(0, 5000)
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) || request.url().includes('/universer-api/'))
    report.backendRequests.push({ method: request.method(), url: request.url() })
})
const root = page.locator('.avenue-embed')
const readHost = () => page.evaluate(() => window.univerAPI.getBase('avenue-campaign-operations').save())
const readChild = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getPresentation('avenue-campaign-review').save())))
const table = (name) => root.getByText(name, { exact: true })
const slideTab = (id) => root.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${id}"]`)
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4239/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () =>
      document.querySelector('.avenue-embed')?.dataset.ready ||
      document.querySelector('.avenue-embed')?.dataset.error ||
      window.startupFailure,
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'avenue-campaign-operations' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'bases-table-list-block')
  assert.equal(report.descriptor.childUnitId, 'avenue-campaign-review')
  assert.equal(report.descriptor.hostAnchorId, 'avenue-campaign-tab')
  assert.equal(await root.locator('iframe,fieldset,details,[data-action],[data-u-comp="embed-float-dom"]').count(), 0)
  assert.deepEqual((await readHost()).tableOrder, ['deliverables', 'avenue-campaign-tab', 'channels'])
  assert.equal((await readHost()).tables.deliverables.recordOrder.length, 8)
  assert.equal((await readHost()).tables.channels.recordOrder.length, 3)
  assert.equal(
    Object.values((await readHost()).tables.deliverables.records).reduce((sum, row) => sum + row.values.budget, 0),
    9600,
  )
  await page.waitForFunction(() => window.painted.includes('Window story cards'))
  await root.screenshot({ path: path.join(directory, 'deliverables.png') })
  await table('Campaign review').click()
  const child = root.locator('[data-embed-bases-table-list-host="avenue-campaign-tab"]')
  await child.waitFor()
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(await child.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
  assert.deepEqual((await readChild()).slideOrder, ['brief', 'allocation', 'sequence', 'decision'])
  for (const [id, color] of [
    ['brief', '#101a34'],
    ['allocation', '#f5f7ff'],
    ['sequence', '#fff4e8'],
    ['decision', '#eaf4f0'],
  ]) {
    await slideTab(id).click()
    await page.waitForFunction(
      (pageId) => window.univerAPI.getPresentation('avenue-campaign-review').getActiveSlide().getId() === pageId,
      id,
    )
    await settle()
    const pixels = await child.evaluate((el, expectedColor) => {
      let count = 0
      for (const canvas of el.querySelectorAll('canvas')) {
        if (canvas.width < 500 || canvas.height < 300) continue
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
        for (let i = 0; i < data.length; i += 64)
          if ('#' + Array.from(data.slice(i, i + 3), (x) => x.toString(16).padStart(2, '0')).join('') === expectedColor)
            count++
      }
      return count
    }, color)
    assert.ok(pixels > 1000, `${id}: actual native canvas must show its authored palette`)
    await root.screenshot({ path: path.join(directory, `${id}.png`) })
  }
  report.checks.push(
    'Native Base tab opens four Slides pages; four distinct backgrounds verified in canvas pixels, with eight deliverables/three linked channels/CNY 9600 and no fixture or duplicate toolbar',
  )
  await slideTab('brief').click()
  await settle()
  const initial = await readChild()
  const hostBefore = await readHost()
  const examples = [
    ...(await fs.readFile('showcase/embed/slides-in-bases-tab/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
    window.paintPoints = []
  })
  await page.evaluate(examples[0][1])
  await page.waitForFunction(() => window.painted.join('').includes('Start small.'))
  const afterFacade = await readChild()
  assert.deepEqual(await readHost(), hostBefore)
  for (const [command, expected] of [
    ['undo', initial],
    ['redo', afterFacade],
  ]) {
    await root.locator(`[data-u-comp="ribbon-grid-toolbar"] button[data-u-command="univer.command.${command}"]`).click()
    await settle()
    assert.deepEqual(await readChild(), expected)
    assert.deepEqual(await readHost(), hostBefore)
  }
  report.checks.push(
    'Literal README slide rich-text edit repaints; native Ribbon Undo/Redo restores full presentation while keeping all Base data unchanged',
  )
  // Actual glyph coordinates from the live canvas, not an invisible replacement control.
  report.titlePaint = await page.evaluate(() =>
    window.paintPoints.filter((p) => p.text === 'S' || p.text.includes('Start')).slice(-20),
  )
  try {
    const point = await page.evaluate(() =>
      window.paintPoints.findLast((p) => p.text === 'S' && Number(p.font.match(/([\d.]+)px/)?.[1]) > 45),
    )
    assert.ok(point, 'Expected a rendered title glyph for native pointer selection')
    // Select blank space inside the title shape, outside its editable glyphs.
    await page.mouse.click(point.x + 400, point.y - 20)
    await settle()
    const beforeMove = await readChild()
    await page.keyboard.press('ArrowRight')
    await settle()
    const moved = await readChild()
    assert.notDeepEqual(
      moved.slides.brief.elements['cover-title'].transform,
      beforeMove.slides.brief.elements['cover-title'].transform,
    )
    assert.deepEqual(await readHost(), hostBefore)
    await page.keyboard.press('Control+z')
    await settle()
    assert.deepEqual(await readChild(), beforeMove)
    report.gates.nativeMovement = { passed: true }
    await page.mouse.dblclick(point.x + 25, point.y - 25)
    // SlideTextEditingRenderController ignores pointer focus changes for 300ms.
    await page.waitForTimeout(350)
    // Enter and leave native editing once before measuring the edit history.
    // The SDK materializes its internal rich-text document on the first commit.
    await page.mouse.click(1520, 900)
    await settle()
    const materialized = await readChild()
    assert.deepEqual(materialized.slides.allocation, beforeMove.slides.allocation)
    assert.deepEqual(materialized.slides.sequence, beforeMove.slides.sequence)
    assert.deepEqual(materialized.slides.decision, beforeMove.slides.decision)
    assert.equal(
      materialized.slides.brief.elements['cover-title'].shapeData.shapeText.text,
      'Start small.\nfor making.',
    )
    assert.deepEqual(await readHost(), hostBefore)
    const editPoint = await page.evaluate(() =>
      window.paintPoints.findLast((p) => p.text === 'S' && Number(p.font.match(/([\d.]+)px/)?.[1]) > 45),
    )
    await page.mouse.dblclick(editPoint.x + 25, editPoint.y - 25)
    await page.waitForTimeout(350)
    const beforeType = await readChild()
    await root.screenshot({ path: path.join(directory, 'before-native-text.png') })
    await page.keyboard.type('New ', { delay: 35 })
    report.typingFocus = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 1000))
    await page.mouse.click(1520, 900)
    await settle()
    const typed = await readChild()
    report.typedTitle = typed.slides.brief.elements['cover-title']
    await root.screenshot({ path: path.join(directory, 'after-native-text.png') })
    assert.ok(JSON.stringify(typed.slides.brief.elements['cover-title']).includes('New '))
    assert.deepEqual(await readHost(), hostBefore)
    await page.keyboard.press('Control+z')
    await settle()
    assert.deepEqual(await readChild(), beforeType)
    await page.keyboard.press('Control+y')
    await settle()
    assert.deepEqual(await readChild(), typed)
    report.gates.nativeTextHistory = { passed: true }
  } catch (error) {
    report.gates.nativeTextHistory = { passed: false, failure: error.stack }
    report.gates.nativeMovement ??= { passed: false, failure: error.message }
  }
  const edited = await readChild()
  await table('Deliverables').click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'deliverables')
  await page.evaluate(examples[1][1])
  assert.equal(
    (await readHost()).tables.deliverables.records['deliverables-1'].values.next,
    'Confirm opening hours with each studio',
  )
  assert.deepEqual(await readChild(), edited)
  await table('Channels').click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'channels')
  await page.setViewportSize({ width: 1598, height: 1200 })
  await settle()
  await page.evaluate(() => {
    window.paintPoints = []
  })
  await page.setViewportSize({ width: 1600, height: 1200 })
  await page.waitForFunction(() => window.paintPoints.some((p) => p.text === 'Studio partners'))
  const point = await page.evaluate(() => window.paintPoints.findLast((p) => p.text === 'Studio partners'))
  const beforeRename = await readHost()
  await page.mouse.dblclick(point.x + 18, point.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Local studios')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('avenue-campaign-operations')
        .getTableById('channels')
        .getRecordById('channels-1')
        .getValue('title') === 'Local studios',
  )
  const renamed = await readHost()
  for (const [command, expected, label] of [
    ['Undo', beforeRename, 'Studio partners'],
    ['Redo', renamed, 'Local studios'],
  ]) {
    await page.getByRole('button', { name: command, exact: true }).click()
    await page.waitForFunction(
      (expectedLabel) =>
        window.univerAPI
          .getBase('avenue-campaign-operations')
          .getTableById('channels')
          .getRecordById('channels-1')
          .getValue('title') === expectedLabel,
      label,
    )
    assert.deepEqual(await readHost(), expected)
    assert.deepEqual(await readChild(), edited)
  }
  await page.evaluate(() => {
    window.painted = []
  })
  await table('Deliverables').click()
  await page.waitForFunction(() => window.painted.filter((text) => text === 'Local studios').length >= 3)
  const links = await page.evaluate(() =>
    ['deliverables-1', 'deliverables-4', 'deliverables-8'].map((id) =>
      window.univerAPI
        .getBase('avenue-campaign-operations')
        .getTableById('deliverables')
        .getRecordById(id)
        .getValue('channel'),
    ),
  )
  assert.ok(links.every((v) => JSON.stringify(v).includes('channels-1') && !JSON.stringify(v).includes('Local')))
  assert.deepEqual(await readChild(), edited)
  await table('Campaign review').click()
  await child.waitFor()
  assert.deepEqual(await readChild(), edited)
  const beforeTheme = await readHost()
  for (const dark of [true, false]) {
    await page.evaluate((enabled) => window.univerAPI.toggleDarkMode(enabled), dark)
    await settle()
    assert.deepEqual(await readHost(), beforeTheme)
    assert.deepEqual(await readChild(), edited)
  }
  report.checks.push(
    'Literal Base example, native channel keyboard rename and complete Undo/Redo snapshots, three stable linked labels, host/child navigation and live themes preserve independent models',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.checks.push('Active-child teardown releases owned UI/API without observed browser errors or backend requests')
  assert.ok(
    Object.values(report.gates).every((g) => g.passed),
    'All native input/history/movement gates must pass',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({ text: document.body.innerText.slice(-3000), painted: window.painted?.slice(-100) }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Slides@Bases Tab')
