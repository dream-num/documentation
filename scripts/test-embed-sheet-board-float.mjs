/* eslint-disable no-await-in-loop -- Native menu tabs share one active ribbon and must be visited sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/sheets-in-boards-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-board-float')
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
      cacheDir: path.resolve('test-results/embed-sheet-board-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4243, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
  viewport: { width: Number(process.env.SHOWCASE_VIEWPORT_WIDTH || 1600), height: 1100 },
})
const report = { passed: false, checks: [], errors: [], backendRequests: [], gates: {} }
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
    const bounds = this.canvas.getBoundingClientRect()
    if (bounds.width > 300) {
      window.paintPoints.push({
        text: String(args[0]),
        x: bounds.x + (point.x * bounds.width) / this.canvas.width,
        y: bounds.y + (point.y * bounds.height) / this.canvas.height,
      })
      if (window.paintPoints.length > 15000) window.paintPoints.splice(0, 7000)
    }
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const hostSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('ripple-repair-workshop').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('ripple-workshop-budget').save())))
const resultIs = (value) =>
  page.waitForFunction(
    (expected) =>
      window.univerAPI
        .getWorkbook('ripple-workshop-budget')
        .getSheetBySheetId('budget')
        .getRange('E16')
        .getRawValue() === expected,
    value,
    { timeout: 15000 },
  )
const root = page.locator('.ripple-embed')
const child = page.locator('[data-u-comp="embed-float-dom"]')
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (error) {
    report.gates[name] = { passed: false, failure: error.stack }
    if (name === 'nativeSheetTyping')
      report.typingDiagnostic = await page.evaluate(() => ({
        points: window.paintPoints.slice(-60),
        active: document.activeElement?.outerHTML.slice(0, 700),
      }))
    await page.keyboard.press('Escape')
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4243/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.ripple-embed')
      return r?.dataset.ready || r?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'ripple-repair-workshop' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'boards-floating-object')
  assert.equal(report.descriptor.childUnitId, 'ripple-workshop-budget')
  assert.equal(report.descriptor.context.resolved, true)
  await child.waitFor()
  await page.waitForFunction(() => window.painted.join('').includes('MAKE ROOM FOR REPAIR'))
  assert.equal(await root.locator('iframe,fieldset,details,[data-action]').count(), 0)
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  )
  assert.equal((await hostSnapshot()).pages.planning.elementOrder.length, 10)
  await page.screenshot({ path: path.join(directory, 'workshop.png'), fullPage: true })
  await child.dblclick({ position: { x: 220, y: 130 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await resultIs(1576.3)
  await page.waitForFunction(() => window.painted.join('').includes('Repair materials'))
  const hostBefore = await hostSnapshot()
  report.checks.push(
    'Native BoardFloating anchor and two-sheet workbook load beside original workshop notes, with native white CSS and no fixture or iframe',
  )
  const examples = [
    ...(await fs.readFile('showcase/embed/sheets-in-boards-float/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(examples[0][1])
  await resultIs(1695.1)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  assert.deepEqual(
    await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('ripple-workshop-budget')
        .getSheetBySheetId('budget')
        .getRange('E18:E19')
        .getRawValues(),
    ),
    [[1800], [104.9]],
  )
  report.checks.push(
    'Literal workbook README changes spare material kits from 24 to 30; direct costs 1541, planned 1695.10, remaining 104.90; whole Board unchanged',
  )
  await gate('nativeSheetHistory', async () => {
    await child.click({ position: { x: 350, y: 200 } })
    await page.keyboard.press('Escape')
    await page.keyboard.press('Control+z')
    await resultIs(1576.3)
    await page.keyboard.press('Control+y')
    await resultIs(1695.1)
    assert.deepEqual(await hostSnapshot(), hostBefore)
  })
  await page.screenshot({ path: path.join(directory, 'active-budget.png'), fullPage: true })
  await gate('nativeFullscreen', async () => {
    await page
      .locator('[data-u-comp="sheet-embed-floating-menu"]')
      .getByRole('button', { name: 'Enter fullscreen', exact: true })
      .click()
    const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
    await fullscreen.waitFor({ timeout: 8000 })
    await fullscreen.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    report.ribbonTabs = []
    for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
      await fullscreen.getByRole('tab', { name, exact: true }).click()
      await settle()
      const commands = await fullscreen
        .locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('data-u-command')))
      assert.ok(commands.length > 0, name)
      report.ribbonTabs.push({ name, commands })
    }
    await fullscreen.getByRole('tab', { name: 'Start', exact: true }).click()
    await gate('nativeSheetTyping', async () => {
      // Read the authored cell geometry and click the actual native fullscreen canvas.
      // Cached grid tiles do not necessarily emit new fillText calls after relocation.
      const point = await page.evaluate(() => {
        const sheet = window.univerAPI.getWorkbook('ripple-workshop-budget').save().sheets.budget
        const canvas = document.querySelector(
          '[data-embed-fullscreen-shell="true"] [data-embed-canvas-root="true"] canvas',
        )
        const bounds = canvas.getBoundingClientRect()
        return {
          x: bounds.x + (sheet.rowHeader.width + sheet.columnData[0].w + sheet.columnData[1].w / 2) * sheet.zoomRatio,
          y: bounds.y + (sheet.columnHeader.height + 4.5 * sheet.defaultRowHeight) * sheet.zoomRatio,
        }
      })
      await page.mouse.click(point.x, point.y)
      await page.waitForFunction(
        () => window.univerAPI.getWorkbook('ripple-workshop-budget').getActiveRange()?.getA1Notation() === 'B5',
        {},
        { timeout: 5000 },
      )
      const before = await childSnapshot()
      await page.keyboard.type('36')
      await page.keyboard.press('Enter')
      await resultIs(1813.9)
      assert.deepEqual(await hostSnapshot(), hostBefore)
      const typed = await childSnapshot()
      await page.screenshot({ path: path.join(directory, 'typed-budget.png'), fullPage: true })
      await page.keyboard.press('Control+z')
      await resultIs(1695.1)
      assert.deepEqual(await childSnapshot(), before)
      await page.keyboard.press('Control+y')
      await resultIs(1813.9)
      assert.deepEqual(await childSnapshot(), typed)
      await page.keyboard.press('Control+z')
      await resultIs(1695.1)
      assert.deepEqual(await childSnapshot(), before)
    })
    await fullscreen.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Sensitivity' }).click()
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('ripple-workshop-budget').getActiveSheet().getSheetId() === 'sensitivity',
    )
    assert.deepEqual(
      await page.evaluate(() =>
        window.univerAPI
          .getWorkbook('ripple-workshop-budget')
          .getSheetBySheetId('sensitivity')
          .getRange('C4:C6')
          .getRawValues(),
      ),
      [[1618.05], [1695.1], [1849.2]],
    )
    assert.equal(
      await page.evaluate(() =>
        window.univerAPI
          .getWorkbook('ripple-workshop-budget')
          .getSheetBySheetId('sensitivity')
          .getRange('E6')
          .getValue(),
      ),
      'Above cap',
    )
    await page.screenshot({ path: path.join(directory, 'reserve-scenarios.png'), fullPage: true })
    await fullscreen.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Budget' }).click()
    await gate('nativePrint', async () => {
      await page.evaluate(() => {
        window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
          window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
        })
      })
      await fullscreen.locator('[data-u-command="sheet.menu.print"]').click()
      await page.getByRole('menuitem', { name: 'Print', exact: true }).click()
      const cancel = page.getByRole('button', { name: 'CANCEL', exact: true })
      await cancel.waitFor()
      await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
      report.printPages = await page.getByText(/^Total: [1-9]\d*pages$/).innerText()
      assert.deepEqual(await page.evaluate(() => window.printSource), {
        workbook: 'ripple-workshop-budget',
        sheet: 'budget',
      })
      await page.screenshot({ path: path.join(directory, 'print-budget.png'), fullPage: true })
      await cancel.click()
      await cancel.waitFor({ state: 'detached' })
    })
    if (await page.locator('[data-embed-fullscreen-close="true"]').count())
      await page.locator('[data-embed-fullscreen-close="true"]').click()
    await fullscreen.waitFor({ state: 'detached' })
    assert.deepEqual(await hostSnapshot(), hostBefore)
  })
  // Keep the failed fullscreen gate visible, but inspect independent host editing too.
  const fullscreenClose = page.locator('[data-embed-fullscreen-close="true"]')
  if (await fullscreenClose.count()) await fullscreenClose.click()
  const childBefore = await childSnapshot()
  const viewport = root.locator('[data-board-viewport-host="true"]')
  await viewport.click({ position: { x: 80, y: 90 } })
  await page.evaluate(examples[1][1])
  await page.waitForFunction(() =>
    window.univerAPI
      .getBoard('ripple-repair-workshop')
      .getShape('decision-note')
      .getText()
      .getPlainText()
      .includes('access contact.'),
  )
  assert.deepEqual(await childSnapshot(), childBefore)
  await gate('nativeBoardHistory', async () => {
    const edited = await hostSnapshot()
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBoard('ripple-repair-workshop')
          .getShape('decision-note')
          .getText()
          .getPlainText()
          .includes('support first.'),
      {},
      { timeout: 5000 },
    )
    await page.keyboard.press('Control+y')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBoard('ripple-repair-workshop')
          .getShape('decision-note')
          .getText()
          .getPlainText()
          .includes('access contact.'),
      {},
      { timeout: 5000 },
    )
    assert.deepEqual(await hostSnapshot(), edited)
    assert.deepEqual(await childSnapshot(), childBefore)
  })
  report.checks.push('Literal Board README changes pending access decision without modifying any workbook cell')
  await gate('nativeBoardMovement', async () => {
    const before = await hostSnapshot()
    const point = await page.evaluate(() =>
      window.univerAPI.getBoard('ripple-repair-workshop').getElementViewportPoint('decision-note'),
    )
    assert.ok(point)
    const bounds = await viewport.boundingBox()
    await page.mouse.click(bounds.x + point.x, bounds.y + point.y)
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(
      (left) =>
        window.univerAPI
          .getBoard('ripple-repair-workshop')
          .describeElements()
          .find((el) => el.id === 'decision-note').bounds.left > left,
      before.pages.planning.elements['decision-note'].transform.left,
      { timeout: 5000 },
    )
    assert.deepEqual(await childSnapshot(), childBefore)
    await page.keyboard.press('Control+z')
    await settle()
    assert.deepEqual(await hostSnapshot(), before)
  })
  await gate('themeOwnership', async () => {
    const before = await hostSnapshot()
    for (const dark of [true, false]) {
      await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
      await settle()
      const current = await hostSnapshot()
      assert.equal(current.theme.id, before.theme.id)
      assert.deepEqual({ ...current, theme: before.theme }, before)
      assert.deepEqual(await childSnapshot(), childBefore)
    }
  })
  await child.dblclick({ position: { x: 220, y: 130 } })
  await settle()
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.checks.push(
    'Active-child disposal releases the owner, DOM and API without observed errors or backend requests',
  )
  assert.ok(
    Object.values(report.gates).every((g) => g.passed),
    'All native gates must pass',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-3500),
      painted: window.painted?.slice(-150),
      active: document.activeElement?.outerHTML.slice(0, 600),
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Sheets@Boards Float')
