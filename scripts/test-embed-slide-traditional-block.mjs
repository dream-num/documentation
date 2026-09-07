import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/slides-in-traditional-docs-block/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-slide-traditional-block')
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
      cacheDir: path.resolve('test-results/embed-slide-traditional-block/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4255, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
const textMode = process.env.SHOWCASE_NATIVE_TEXT_MODE || 'insert'
assert.ok(['insert', 'replace-all', 'replace-line'].includes(textMode))
report.textMode = textMode
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) || request.url().includes('/universer-api/'))
    report.backendRequests.push({ method: request.method(), url: request.url() })
})
page.on('requestfailed', (request) => report.errors.push(`${request.url()}: ${request.failure()?.errorText}`))
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
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
      font: this.font,
      fullscreen: Boolean(this.canvas.closest('[data-embed-fullscreen-shell="true"]')),
      canvasWidth: rect.width,
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
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getDocument('summit-route-handout').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getPresentation('summit-shade-discussion').save())))
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4255/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.summit-embed')
      return root?.dataset.ready || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  assert.equal(await page.locator('.summit-embed').getAttribute('data-error'), null)
  const hostStyle = (await hostSnapshot()).documentStyle
  assert.equal(hostStyle.documentFlavor, 1)
  // Capture the installed renderer through an actual Facade call. No diagnostic
  // service or second SDK instance is added to the exported demo.
  report.pagination = await page.evaluate(() => {
    const api = window.univerAPI
    const injector = api._injector
    const get = injector.get
    let manager
    injector.get = function (id, ...args) {
      const result = Reflect.apply(get, this, [id, ...args])
      if (id.decoratorName === 'engine-render.render-manager.service') manager = result
      return result
    }
    try {
      api.setCurrent('summit-route-handout')
    } finally {
      injector.get = get
    }
    window.readSummitPages = () => {
      const doc = api.getDocument('summit-route-handout').save()
      return manager
        .getRenderUnitById(doc.id)
        .mainComponent.getSkeleton()
        .getSkeletonData()
        .pages.map(({ pageWidth, pageHeight, st, ed }) => ({
          pageWidth,
          pageHeight,
          st,
          ed,
          text: doc.body.dataStream.slice(st, ed + 1),
        }))
    }
    return window.readSummitPages()
  })
  assert.equal(report.pagination.length, 3, 'Three authored A4 chapters, not overflow or blank pages')
  for (const p of report.pagination) assert.deepEqual([p.pageWidth, p.pageHeight], [794, 1123])
  assert.ok(report.pagination[1].text.startsWith('02 / Four frames'))
  assert.ok(report.pagination[1].text.includes('\b'), 'The Slides share the discussion chapter page')
  assert.ok(report.pagination[2].text.startsWith('03 / Limitations'))
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'summit-route-handout' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'docs-custom-block')
  assert.equal(report.descriptor.childUnitId, 'summit-shade-discussion')
  assert.equal(report.descriptor.context.resolved, true)
  assert.deepEqual((await childSnapshot()).slideOrder, ['question', 'method', 'comparison', 'review'])
  const child = page.locator('[data-u-comp="embed-docs-custom-block"] [data-u-comp="embed-float-dom"]')
  await child.waitFor()
  await page.waitForFunction(() => window.painted.join('').includes('Shade along the way'))
  await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(
    await page.locator('iframe,.summit-embed > fieldset,.summit-embed > details,.summit-embed [data-action]').count(),
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
  await page.mouse.wheel(0, 1150)
  await settle()
  await child.dblclick({ position: { x: 300, y: 180 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Walk the route'))
  await page.screenshot({ path: path.join(directory, 'active-strategy.png'), fullPage: true })
  report.checks.push(
    'Native Docs block paints an editable four-slide discussion deck with official white/Grid host CSS and no fixture panels',
  )
  await page.keyboard.press('Escape')
  await child.click({ position: { x: 560, y: 330 } })
  await page.keyboard.press('Escape')
  const hostBefore = await hostSnapshot()
  const examples = [
    ...(await fs.readFile('showcase/embed/slides-in-traditional-docs-block/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  const beforeEdit = await childSnapshot()
  await page.evaluate(() => {
    window.painted = []
  })
  await page.evaluate(examples[0][1])
  await page.waitForFunction(() => window.painted.join('').includes('Compare the shade.'))
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.screenshot({ path: path.join(directory, 'edited-strategy.png'), fullPage: true })
  report.checks.push(
    'Slides rich-text Facade edit repaints the native child and preserves the entire host announcement',
  )
  const afterEdit = await childSnapshot()
  await page.keyboard.press('Control+z')
  await page.waitForFunction(() =>
    window.univerAPI
      .getPresentation('summit-shade-discussion')
      .getActiveSlide()
      .getShape('cover-title')
      .getText()
      .getPlainText()
      .includes('Study the shade.'),
  )
  assert.deepEqual(await childSnapshot(), beforeEdit)
  await page.keyboard.press('Control+y')
  await page.waitForFunction(() =>
    window.univerAPI
      .getPresentation('summit-shade-discussion')
      .getActiveSlide()
      .getShape('cover-title')
      .getText()
      .getPlainText()
      .includes('Compare the shade.'),
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  assert.deepEqual(await childSnapshot(), afterEdit)
  report.checks.push('Native keyboard Undo/Redo owns the slide text edit without modifying the host document')
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await page.waitForFunction(
    () => window.univerAPI.getPresentation('summit-shade-discussion').getActiveSlide().getId() === 'method',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Observe. Sketch. Compare.'))
  await page.screenshot({ path: path.join(directory, 'evidence-cards.png'), fullPage: true })
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await page.waitForFunction(() => window.painted.join('').includes('Different paths. Different questions.'))
  await page.screenshot({ path: path.join(directory, 'learning-timeline.png'), fullPage: true })
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await page.waitForFunction(
    () => window.univerAPI.getPresentation('summit-shade-discussion').getActiveSlide().getId() === 'review',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Keep the unknowns visible.'))
  await page.screenshot({ path: path.join(directory, 'review-slide.png'), fullPage: true })
  report.checks.push('Native Next page visits process, comparison and review layouts')
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).filter({ visible: true }).click()
  const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
  await fullscreen.waitFor()
  await fullscreen.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  const thumbnails = fullscreen.locator('[data-u-comp="slide-thumbnail-item"]')
  assert.equal(await thumbnails.count(), 4)
  await page.evaluate(() => {
    window.paintPoints = []
  })
  await thumbnails.first().click()
  await page.waitForFunction(
    () => window.univerAPI.getPresentation('summit-shade-discussion').getActiveSlide().getId() === 'question',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Compare the shade.'))
  await page.screenshot({ path: path.join(directory, 'fullscreen-strategy.png'), fullPage: true })
  report.titlePaint = await page.evaluate(() =>
    window.paintPoints.filter((p) => p.text === 'C' && p.fullscreen).slice(-40),
  )
  report.canvasGeometry = await fullscreen.locator('canvas').evaluateAll((els) =>
    els.map((el) => ({
      width: el.width,
      height: el.height,
      rect: el.getBoundingClientRect().toJSON(),
      parent: el.parentElement?.outerHTML.slice(0, 350) ?? null,
    })),
  )
  // The main scene can reuse cached text; fresh fillText calls can belong only
  // to thumbnails. At the initial 100% zoom, use the centered page geometry.
  const canvas = await fullscreen.locator('[data-slide-canvas-host="true"] canvas').boundingBox()
  assert.ok(canvas)
  const beforeMove = await childSnapshot()
  const title = beforeMove.slides.question.elements['cover-title'].transform
  const point = {
    x: canvas.x + (canvas.width - beforeMove.defaultPageSize.width) / 2 + title.left,
    y: canvas.y + (canvas.height - beforeMove.defaultPageSize.height) / 2 + title.top,
  }
  report.titlePoint = point
  // Select blank space inside the title shape, outside its editable glyphs.
  await page.mouse.click(point.x + title.width - 20, point.y + title.height - 15)
  await settle()
  await page.screenshot({ path: path.join(directory, 'selected-title.png') })
  await page.keyboard.press('ArrowRight')
  await settle()
  const moved = await childSnapshot()
  assert.notDeepEqual(
    moved.slides.question.elements['cover-title'].transform,
    beforeMove.slides.question.elements['cover-title'].transform,
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.keyboard.press('Control+z')
  await settle()
  assert.deepEqual(await childSnapshot(), beforeMove)
  await page.keyboard.press('Control+y')
  await settle()
  assert.deepEqual(await childSnapshot(), moved)
  await page.keyboard.press('Control+z')
  await settle()
  assert.deepEqual(await childSnapshot(), beforeMove)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push('Native shape movement and full-presentation Undo/Redo preserve the host')
  await page.mouse.dblclick(point.x + 25, point.y + 30)
  // SlideTextEditingRenderController ignores pointer focus changes for 300ms.
  await page.waitForTimeout(350)
  // Enter and leave native editing once before measuring the edit history.
  // The SDK materializes its internal rich-text document on the first commit.
  await page.mouse.click(1520, 900)
  await settle()
  const materialized = await childSnapshot()
  assert.deepEqual(materialized.slides.method, beforeMove.slides.method)
  assert.deepEqual(materialized.slides.comparison, beforeMove.slides.comparison)
  assert.deepEqual(materialized.slides.review, beforeMove.slides.review)
  assert.equal(
    materialized.slides.question.elements['cover-title'].shapeData.shapeText.text,
    'Compare the shade.\nWalk the route.',
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.mouse.dblclick(point.x + 25, point.y + 30)
  await page.waitForTimeout(350)
  const beforeType = await childSnapshot()
  await page.screenshot({ path: path.join(directory, 'before-native-text.png') })
  report.typingFocus = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 1000))
  assert.ok(report.typingFocus.includes('SLIDE_SHAPE_TEXT'))
  if (textMode === 'replace-all') {
    await page.keyboard.press('Control+a')
    await settle()
    await page.keyboard.type('Compare the shade.', { delay: 35 })
    await page.keyboard.press('Enter')
    await settle()
  } else if (textMode === 'replace-line') {
    await page.keyboard.press('Home')
    await settle()
    await page.keyboard.press('Shift+End')
    await settle()
  }
  await page.keyboard.type(textMode === 'insert' ? 'New ' : 'Walk another route.', { delay: 35 })
  await page.mouse.click(1520, 900)
  await settle()
  const typed = await childSnapshot()
  report.typedTitle = typed.slides.question.elements['cover-title']
  await page.screenshot({ path: path.join(directory, 'after-native-text.png') })
  if (textMode === 'insert') {
    assert.ok(typed.slides.question.elements['cover-title'].shapeData.shapeText.text.includes('New '))
  } else {
    assert.equal(
      typed.slides.question.elements['cover-title'].shapeData.shapeText.text,
      'Compare the shade.\nWalk another route.',
    )
  }
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.keyboard.press('Control+z')
  await settle()
  assert.deepEqual(await childSnapshot(), beforeType)
  await page.keyboard.press('Control+y')
  await settle()
  assert.deepEqual(await childSnapshot(), typed)
  report.checks.push(`Native text ${textMode} and full-presentation Undo/Redo after rich-text materialization`)
  await page.locator('[data-embed-fullscreen-close="true"]').click()
  await fullscreen.waitFor({ state: 'detached' })
  report.checks.push('Native fullscreen exposes Grid and four slide thumbnails; returning preserves the edited slide')
  const childBefore = await childSnapshot()
  assert.equal(await page.evaluate(examples[1][1]), true)
  const anchorAfter = await page.evaluate(
    () => window.univerAPI.listEmbeds({ hostUnitId: 'summit-route-handout' })[0].getDescriptor().context.startIndex,
  )
  assert.equal(anchorAfter, report.descriptor.context.startIndex + ' Revised.'.length)
  assert.equal((await page.evaluate(() => window.readSummitPages())).length, 3)
  assert.deepEqual(await childSnapshot(), childBefore)
  report.checks.push('Host title editing moves the native block anchor and preserves the full edited presentation')
  await child.click({ position: { x: 300, y: 180 } })
  await settle()
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.summit-embed').count(), 0)
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
