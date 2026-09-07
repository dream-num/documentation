/* eslint-disable no-await-in-loop -- One active host/child and theme state must be exercised in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/docs-in-bases-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-doc-base-tab')
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
      cacheDir: path.resolve('test-results/embed-doc-base-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4237, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
const root = page.locator('.fern-embed')
const readHost = () => page.evaluate(() => window.univerAPI.getBase('fern-editorial-desk').save())
const readChild = () => page.evaluate(() => window.univerAPI.getDocument('fern-editorial-playbook').save())
const table = (name) => root.getByText(name, { exact: true })
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4237/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.fern-embed')
      return el?.dataset.ready || el?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'fern-editorial-desk' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'bases-table-list-block')
  assert.equal(report.descriptor.childUnitId, 'fern-editorial-playbook')
  assert.equal(report.descriptor.hostAnchorId, 'fern-playbook-tab')
  assert.equal(
    await root
      .locator('iframe,:scope > fieldset,:scope > details,[data-action],[data-u-comp="embed-float-dom"]')
      .count(),
    0,
  )
  assert.deepEqual((await readHost()).tableOrder, ['assignments', 'fern-playbook-tab', 'editions'])
  assert.equal((await readHost()).tables.assignments.recordOrder.length, 8)
  assert.equal((await readHost()).tables.editions.recordOrder.length, 3)
  await page.waitForFunction(() => window.painted.includes('Water before work'))
  await root.screenshot({ path: path.join(directory, 'assignments.png') })
  await table('Editorial playbook').click()
  const child = root.locator('[data-embed-bases-table-list-host="fern-playbook-tab"]')
  await child.waitFor()
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(await child.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
  const initial = await readChild()
  assert.equal(initial.body.paragraphs.length, 16)
  assert.ok(initial.body.dataStream.includes('next three issues'))
  await page.waitForFunction(() => window.painted.join('').includes('Useful stories, carefully told.'))
  await root.screenshot({ path: path.join(directory, 'editorial-playbook.png') })
  report.checks.push(
    'Native BasesTableListBlock opens sixteen modern Docs paragraphs beside eight assignments and three linked issues; native Grid and official white CSS, no float/iframe/fixture',
  )
  const hostBefore = await readHost()
  const examples = [
    ...(await fs.readFile('showcase/embed/docs-in-bases-tab/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
  })
  await page.evaluate(examples[0][1])
  assert.ok((await readChild()).body.dataStream.includes('Leave the next editor a clear trail.'))
  await page.waitForFunction(() => window.painted.join('').includes('Leave the next editor a clear trail.'))
  assert.deepEqual(await readHost(), hostBefore)
  report.checks.push(
    'The first literal README example edits and repaints the playbook title without changing the complete host',
  )
  await root.screenshot({ path: path.join(directory, 'edited-playbook.png') })
  try {
    const afterFacade = await readChild()
    // Native Grid icon buttons expose command IDs, but currently no accessible name.
    await root
      .locator('[data-u-comp="ribbon-grid-toolbar"] button[data-u-command="univer.command.undo"]')
      .click({ timeout: 5000 })
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getDocument('fern-editorial-playbook')
          .getBody()
          .dataStream.includes('Useful stories, carefully told.'),
      {},
      { timeout: 5000 },
    )
    // Undo materializes these omitted empty collections; retain strict checks on every other field.
    assert.deepEqual(await readChild(), {
      ...initial,
      body: { ...initial.body, customBlocks: [], customDecorations: [], customRanges: [] },
    })
    await root
      .locator('[data-u-comp="ribbon-grid-toolbar"] button[data-u-command="univer.command.redo"]')
      .click({ timeout: 5000 })
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getDocument('fern-editorial-playbook')
          .getBody()
          .dataStream.includes('Leave the next editor a clear trail.'),
      {},
      { timeout: 5000 },
    )
    assert.deepEqual(await readHost(), hostBefore)
    assert.deepEqual(await readChild(), afterFacade)
    report.gates.nativeRibbonHistory = { passed: true }
  } catch (error) {
    report.gates.nativeRibbonHistory = { passed: false, failure: error.message }
  }
  try {
    await child
      .locator('canvas')
      .first()
      .click({ position: { x: 350, y: 260 } })
    const beforeTyping = await readChild()
    await page.keyboard.type('Reviewed ', { delay: 35 })
    await page.waitForFunction(
      () => window.univerAPI.getDocument('fern-editorial-playbook').getBody().dataStream.includes('Reviewed '),
      {},
      { timeout: 5000 },
    )
    const typed = await readChild()
    assert.deepEqual(await readHost(), hostBefore)
    report.gates.nativeKeyboard = { passed: true }
    try {
      await page.keyboard.press('Control+z')
      await page.waitForFunction(
        () => !window.univerAPI.getDocument('fern-editorial-playbook').getBody().dataStream.includes('Reviewed '),
        {},
        { timeout: 5000 },
      )
      assert.deepEqual(await readChild(), beforeTyping)
      await page.keyboard.press('Control+y')
      await page.waitForFunction(
        () => window.univerAPI.getDocument('fern-editorial-playbook').getBody().dataStream.includes('Reviewed '),
        {},
        { timeout: 5000 },
      )
      assert.deepEqual(await readChild(), typed)
      assert.deepEqual(await readHost(), hostBefore)
      report.gates.nativeHistory = { passed: true }
    } catch (error) {
      report.gates.nativeHistory = { passed: false, failure: error.message }
    }
  } catch (error) {
    report.gates.nativeKeyboard = { passed: false, failure: error.message }
    report.gates.nativeHistory = { passed: false, failure: 'Not reached after native typing failed' }
    report.keyboardDiagnostic = await page.evaluate(() => ({
      active: document.activeElement?.outerHTML.slice(0, 1000),
      text: window.univerAPI.getDocument('fern-editorial-playbook').getBody().dataStream,
    }))
  }
  const edited = await readChild()
  try {
    const bounds = await child.boundingBox()
    await page.evaluate(() => {
      window.painted = []
    })
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height - 100)
    await page.mouse.wheel(0, 1050)
    await page.waitForFunction(
      () => window.painted.join('').includes('Handoff with the open questions'),
      {},
      { timeout: 5000 },
    )
    assert.deepEqual(await readChild(), edited)
    assert.deepEqual(await readHost(), hostBefore)
    await root.screenshot({ path: path.join(directory, 'handoff-scroll.png') })
    report.gates.nativeScroll = { passed: true }
  } catch (error) {
    report.gates.nativeScroll = { passed: false, failure: error.message }
  }
  await table('Assignments').click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'assignments')
  await page.evaluate(examples[1][1])
  assert.equal(
    (await readHost()).tables.assignments.records['assignments-1'].values.next,
    'Confirm opening times with the editor',
  )
  assert.deepEqual(await readChild(), edited)
  await table('Editions').click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'editions')
  await page.setViewportSize({ width: 1598, height: 1200 })
  await settle()
  await page.evaluate(() => {
    window.paintPoints = []
  })
  await page.setViewportSize({ width: 1600, height: 1200 })
  await page.waitForFunction(() => window.paintPoints.some((p) => p.text === 'Everyday Water'))
  const point = await page.evaluate(() => window.paintPoints.findLast((p) => p.text === 'Everyday Water'))
  const beforeRename = await readHost()
  await page.mouse.dblclick(point.x + 18, point.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Water Stories')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('fern-editorial-desk')
        .getTableById('editions')
        .getRecordById('editions-1')
        .getValue('title') === 'Water Stories',
  )
  const afterRename = await readHost()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('fern-editorial-desk')
        .getTableById('editions')
        .getRecordById('editions-1')
        .getValue('title') === 'Everyday Water',
  )
  assert.deepEqual(await readHost(), beforeRename)
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('fern-editorial-desk')
        .getTableById('editions')
        .getRecordById('editions-1')
        .getValue('title') === 'Water Stories',
  )
  assert.deepEqual(await readHost(), afterRename)
  assert.deepEqual(await readChild(), edited)
  await root.screenshot({ path: path.join(directory, 'editions.png') })
  await page.evaluate(() => {
    window.painted = []
  })
  await table('Assignments').click()
  await page.waitForFunction(() => window.painted.filter((text) => text === 'Water Stories').length >= 3)
  const links = await page.evaluate(() =>
    ['assignments-1', 'assignments-2', 'assignments-3'].map((id) =>
      window.univerAPI.getBase('fern-editorial-desk').getTableById('assignments').getRecordById(id).getValue('edition'),
    ),
  )
  assert.ok(links.every((v) => JSON.stringify(v).includes('editions-1') && !JSON.stringify(v).includes('Water')))
  assert.deepEqual(await readChild(), edited)
  await table('Editorial playbook').click()
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
    'Literal README Base edit, native edition keyboard rename with complete Undo/Redo snapshot restoration, three stable linked labels, tab navigation and live themes preserve both independent models',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.checks.push(
    'Owned active-document disposal releases DOM and API without observed browser errors or backend requests',
  )
  assert.ok(
    Object.values(report.gates).every((gate) => gate.passed),
    'Native Ribbon history, keyboard/history and scroll gates must all pass',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({ text: document.body.innerText.slice(-2500), painted: window.painted?.slice(-100) }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Docs@Bases Tab')
