import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/bases-in-traditional-docs-block/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-base-traditional-block')
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
      cacheDir: path.resolve('test-results/embed-base-traditional-block/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4253, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getDocument('rowan-readiness-review').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('rowan-station-evidence').save())))
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4253/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.rowan-embed')
      return root?.dataset.ready || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  assert.equal(await page.locator('.rowan-embed').getAttribute('data-error'), null)
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
      api.setCurrent('rowan-readiness-review')
    } finally {
      injector.get = get
    }
    window.readRowanPages = () => {
      const doc = api.getDocument('rowan-readiness-review').save()
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
    return window.readRowanPages()
  })
  assert.equal(report.pagination.length, 3, 'Three authored A4 chapters, not overflow or blank pages')
  for (const p of report.pagination) assert.deepEqual([p.pageWidth, p.pageHeight], [794, 1123])
  assert.ok(report.pagination[1].text.startsWith('02 / Evidence register'))
  assert.ok(report.pagination[1].text.includes('\b'), 'The Base shares the evidence chapter page')
  assert.ok(report.pagination[2].text.startsWith('03 / Conditions'))
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'rowan-readiness-review' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'docs-custom-block')
  assert.equal(report.descriptor.childUnitId, 'rowan-station-evidence')
  assert.equal(report.descriptor.context.resolved, true)
  assert.deepEqual(
    await page.evaluate(() =>
      window.univerAPI
        .getBase('rowan-station-evidence')
        .getTables()
        .map((table) => table.getRecords().length),
    ),
    [7, 4],
  )
  const child = page.locator('[data-u-comp="embed-docs-custom-block"] [data-u-comp="embed-float-dom"]')
  await child.waitFor()
  await page.waitForFunction(() => window.painted.join('').includes('Evidence before deployment'))
  await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  await page.getByRole('tab', { name: 'Insert', exact: true }).click()
  await settle()
  assert.ok(
    await page.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count(),
    'Host Insert exposes native commands',
  )
  assert.deepEqual(report.errors, [], 'Host Insert menu dependencies are present')
  await page.getByRole('tab', { name: 'Start', exact: true }).click()
  assert.equal(
    await page.locator('iframe,.rowan-embed > fieldset,.rowan-embed > details,.rowan-embed [data-action]').count(),
    0,
  )
  await page.screenshot({ path: path.join(directory, 'review-report.png'), fullPage: true })
  await page.mouse.move(850, 400)
  await page.mouse.wheel(0, 1150)
  await settle()
  await child.click({ position: { x: 180, y: 130 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Calibration trace'))
  const styles = await page
    .locator('[data-u-comp="workbench-layout"]')
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
  assert.equal(styles.background, 'rgb(255, 255, 255)')
  assert.equal(styles.flex, 'flex')
  await page.screenshot({ path: path.join(directory, 'active-evidence.png'), fullPage: true })
  report.checks.push(
    'Native traditional DocBlock paints the authored brief and seven linked evidence records with official white CSS, populated Start/Insert Grid host menus and no fixture panels',
  )
  const hostBefore = await hostSnapshot()
  const examples = [
    ...(await fs.readFile('showcase/embed/bases-in-traditional-docs-block/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  const beforeEdit = await childSnapshot()
  await page.evaluate(() => {
    window.painted = []
  })
  assert.equal(await page.evaluate(examples[0][1]), true)
  await page.waitForFunction(() => window.painted.join('').includes('Calibration source'))
  assert.deepEqual(await hostSnapshot(), hostBefore)
  const afterEdit = await childSnapshot()
  const menu = page.locator('[data-u-comp="base-embed-floating-menu"]')
  await menu.getByRole('button', { name: 'Undo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('rowan-station-evidence')
        .getTableById('evidence')
        .getRecordById('evidence-1')
        .getValue('title') === 'Calibration trace',
  )
  assert.deepEqual(await childSnapshot(), beforeEdit)
  await menu.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('rowan-station-evidence')
        .getTableById('evidence')
        .getRecordById('evidence-1')
        .getValue('title') === 'Calibration source and trace',
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  assert.deepEqual(await childSnapshot(), afterEdit)
  report.checks.push(
    'Facade record edit repaints; native Undo/Redo changes the Base without modifying the entire host document',
  )
  await menu.getByRole('button', { name: 'Enter fullscreen', exact: true }).click()
  const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
  await fullscreen.waitFor()
  await page.evaluate(() => {
    window.paintPoints = []
  })
  await fullscreen.getByText('Owners', { exact: true }).click()
  await page.waitForFunction(() => window.painted.includes('Imani Cole'))
  await page.waitForFunction(() => window.paintPoints.some((point) => point.text === 'Imani Cole' && point.fullscreen))
  // Edit the rendered primary Name cell, not an unrelated DOM input.
  const person = await page.evaluate(
    () =>
      window.paintPoints
        .filter((point) => point.text === 'Imani Cole' && point.fullscreen)
        .toSorted((a, b) => a.x - b.x)[0],
  )
  assert.ok(person, 'Owner primary name is painted in the visible fullscreen Base')
  const beforeTyping = await childSnapshot()
  await page.mouse.dblclick(person.x + 20, person.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Imani Brooks')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('rowan-station-evidence')
        .getTableById('people')
        .getRecordById('people-1')
        .getValue('title') === 'Imani Brooks',
  )
  await page.waitForFunction(() => window.painted.includes('Imani Brooks'))
  const typed = await childSnapshot()
  await fullscreen.getByRole('button', { name: 'Undo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('rowan-station-evidence')
        .getTableById('people')
        .getRecordById('people-1')
        .getValue('title') === 'Imani Cole',
  )
  assert.deepEqual(await childSnapshot(), beforeTyping)
  await fullscreen.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('rowan-station-evidence')
        .getTableById('people')
        .getRecordById('people-1')
        .getValue('title') === 'Imani Brooks',
  )
  assert.deepEqual(await childSnapshot(), typed)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.screenshot({ path: path.join(directory, 'people-directory.png'), fullPage: true })
  await page.evaluate(() => {
    window.painted = []
  })
  await fullscreen.getByText('Evidence', { exact: true }).click()
  await page.waitForFunction(
    () => window.painted.includes('Weather exposure') && window.painted.includes('Imani Brooks'),
  )
  const links = await page.evaluate(() =>
    ['evidence-1', 'evidence-7'].map((id) =>
      window.univerAPI.getBase('rowan-station-evidence').getTableById('evidence').getRecordById(id).getValue('owner'),
    ),
  )
  assert.ok(links.every((link) => JSON.stringify(link).includes('people-1') && !JSON.stringify(link).includes('Imani')))
  await page.screenshot({ path: path.join(directory, 'linked-evidence.png'), fullPage: true })
  report.checks.push(
    'Native fullscreen Owners navigation and keyboard editing/history rename a person; Evidence paints the new name through unchanged stable record links',
  )
  await page.locator('[data-embed-fullscreen-close="true"]').click()
  await fullscreen.waitFor({ state: 'detached' })
  assert.deepEqual(await hostSnapshot(), hostBefore)
  const childBefore = await childSnapshot()
  assert.equal(await page.evaluate(examples[1][1]), true)
  const anchorAfter = await page.evaluate(
    () => window.univerAPI.listEmbeds({ hostUnitId: 'rowan-readiness-review' })[0].getDescriptor().context.startIndex,
  )
  assert.equal(anchorAfter, report.descriptor.context.startIndex + ' Revised.'.length)
  assert.deepEqual(await childSnapshot(), childBefore)
  assert.equal((await page.evaluate(() => window.readRowanPages())).length, 3)
  report.checks.push('Narrative editing moves the native block anchor while preserving the entire edited Base snapshot')
  await child.click({ position: { x: 180, y: 130 } })
  await settle()
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.rowan-embed').count(), 0)
  assert.deepEqual(report.errors, [], 'Include asynchronous teardown errors')
  report.checks.push(
    'Selected active-child disposal removes the owned root without browser errors; no backend requests occurred',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-4000),
      painted: window.painted?.slice(-100),
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
console.log('PASS selected native Base@Docs Block')
