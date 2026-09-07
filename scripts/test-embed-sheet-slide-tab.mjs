/* eslint-disable no-await-in-loop -- Native menu tabs share one active ribbon and must be visited sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/sheets-in-slides-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-slide-tab')
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
      cacheDir: path.resolve('test-results/embed-sheet-slide-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4217, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

const hostSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getPresentation('aster-radio-season').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('aster-pilot-schedule').save())))
const resultIs = (value) =>
  page.waitForFunction(
    (expected) =>
      window.univerAPI
        .getWorkbook('aster-pilot-schedule')
        .getSheetBySheetId('schedule')
        .getRange('F13')
        .getRawValue() === expected,
    value,
  )

const pageItem = (id) => page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')
const worksheet = (name) => page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4217/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.aster-embed')
      return root?.dataset.ready || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  assert.equal(await page.locator('.aster-embed').getAttribute('data-error'), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'aster-radio-season' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-page-list-block')
  assert.equal(report.descriptor.childUnitId, 'aster-pilot-schedule')
  assert.equal(report.descriptor.context.index, 1)
  assert.equal(await page.locator('[data-u-comp="embed-float-dom"]').count(), 0)
  assert.equal(await page.locator('[data-u-comp="slide-thumbnail-item"]').count(), 4)
  await page.waitForFunction(() => window.painted.join('').includes('A whole neighbourhood.'))
  await page.screenshot({ path: path.join(directory, 'season.png'), fullPage: true })
  report.checks.push(
    'Native SlidePage inserts a separate workbook appendix second among four pages; no float or iframe substitute',
  )
  await pageItem(report.descriptor.hostAnchorId).click()
  const child = page.locator('[data-embed-slides-page-list-host]')
  await child.waitFor()
  await worksheet('Schedule').waitFor()
  await page.waitForFunction(() => window.painted.join('').includes('Eight weeks on air'))
  await resultIs(2040)
  assert.equal(await page.locator('.aster-embed iframe,.aster-embed > fieldset,.aster-embed [data-action]').count(), 0)
  const styles = await page
    .locator('[data-u-comp="workbench-layout"]')
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
  assert.equal(styles.background, 'rgb(255, 255, 255)')
  assert.equal(styles.flex, 'flex')
  await page.screenshot({ path: path.join(directory, 'pilot-schedule.png'), fullPage: true })
  const hostBefore = await hostSnapshot()
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('aster-pilot-schedule').getSheetBySheetId('schedule').getRange('D5').setValue(3),
  )
  await resultIs(2085)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  // Click the worksheet area, not the first canvas (which belongs to the formula bar).
  await child.click({ position: { x: 350, y: 300 } })
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+z')
  await resultIs(2040)
  await page.keyboard.press('Control+y')
  await resultIs(2085)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push(
    'The real workbook recalculates 2040 to 2085; native Undo/Redo changes only the child and preserves the whole presentation',
  )
  // Facade selects the cell; actual keyboard input must commit through the native editor.
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('aster-pilot-schedule').getSheetBySheetId('schedule').getRange('D5').activate(),
  )
  await page.keyboard.type('4')
  await page.keyboard.press('Enter')
  await resultIs(2130)
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getWorkbook('aster-pilot-schedule').getSheetBySheetId('schedule').getRange('D5').getRawValue(),
    ),
    4,
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.keyboard.press('Control+z')
  await resultIs(2085)
  await page.keyboard.press('Control+y')
  await resultIs(2130)
  await page.keyboard.press('Control+z')
  await resultIs(2085)
  report.checks.push(
    'Native keyboard typing commits D5=4, recalculates 2130 and supports Undo/Redo without mutating the host',
  )
  report.ribbonTabs = []
  for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
    await page.getByRole('tab', { name, exact: true }).click()
    await settle()
    const commands = await page
      .locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]')
      .evaluateAll((elements) => elements.map((el) => el.getAttribute('data-u-command')))
    assert.ok(commands.length > 0, name)
    report.ribbonTabs.push({ name, commands })
    assert.deepEqual(report.errors, [])
  }
  await page.getByRole('tab', { name: 'Start', exact: true }).click()
  await worksheet('Resources').click()
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('aster-pilot-schedule').getActiveSheet().getSheetId() === 'resources',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Time is the scarce resource'))
  assert.deepEqual(
    await page.evaluate(() => {
      const sheet = window.univerAPI.getWorkbook('aster-pilot-schedule').getSheetBySheetId('resources')
      return ['B8', 'B9', 'B12', 'B13'].map((range) => sheet.getRange(range).getRawValue())
    }),
    [23, 1, 2085, 915],
  )
  await page.screenshot({ path: path.join(directory, 'resources.png'), fullPage: true })
  report.checks.push(
    'Five native Grid tabs expose real commands; Resources shows 23 planned hours, 1 spare hour and 915 remaining budget',
  )
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('aster-pilot-schedule').getSheetBySheetId('resources').getRange('B4').setValue(50),
  )
  await resultIs(2200)
  assert.deepEqual(
    await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('aster-pilot-schedule')
        .getSheetBySheetId('schedule')
        .getRange('F5:F12')
        .getRawValues(),
    ),
    [[300], [270], [280], [290], [250], [270], [250], [290]],
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('aster-pilot-schedule').getSheetBySheetId('resources').getRange('B4').setValue(0),
  )
  await resultIs(1050)
  assert.deepEqual(
    await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('aster-pilot-schedule')
        .getSheetBySheetId('schedule')
        .getRange('F5:F12')
        .getRawValues(),
    ),
    [[150], [120], [180], [90], [150], [120], [150], [90]],
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.screenshot({ path: path.join(directory, 'sponsored-studio.png'), fullPage: true })
  await child.click({ position: { x: 350, y: 300 } })
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+z')
  await resultIs(2200)
  await page.keyboard.press('Control+z')
  await resultIs(2085)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push(
    'Shared studio-rate variants 50 and sponsored 0 recalculate every episode to totals 2200 and 1050; native Undo restores 45',
  )
  await page.evaluate(() => {
    window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet: printSheet }) => {
      window.printSource = { workbook: workbook.getId(), sheet: printSheet.getSheetId() }
    })
  })
  await page.locator('[data-u-command="sheet.menu.print"]').click()
  await page.getByRole('menuitem', { name: 'Print', exact: true }).click()
  await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
  assert.deepEqual(await page.evaluate(() => window.printSource), {
    workbook: 'aster-pilot-schedule',
    sheet: 'resources',
  })
  // The print shell appears before pagination; zero pages is not a rendered preview.
  await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
  report.printPages = await page.getByText(/^Total: [1-9]\d*pages$/).innerText()
  await page.screenshot({ path: path.join(directory, 'print-resources.png'), fullPage: true })
  await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
  await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
  assert.deepEqual(await hostSnapshot(), hostBefore)
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.checks.push(
    'Native Resources print preview opens and cancels without backend requests or host changes; physical printing is not claimed',
  )
  await worksheet('Schedule').click()
  const childBefore = await childSnapshot()
  for (const [id, phrase] of [
    ['editorial', 'Not every episode'],
    ['decision', 'Learn first. Renew later.'],
    ['season', 'A whole neighbourhood.'],
  ]) {
    await pageItem(id).click()
    await page.waitForFunction(
      (slideId) => window.univerAPI.getPresentation('aster-radio-season').getActiveSlide().getId() === slideId,
      id,
    )
    await page.waitForFunction((text) => window.painted.join('').includes(text), phrase)
    await settle()
    await page.screenshot({ path: path.join(directory, id + '.png'), fullPage: true })
    assert.deepEqual(await childSnapshot(), childBefore)
  }
  // Native host editing after leaving the child must not mutate the workbook.
  await page.evaluate(() => {
    const text = window.univerAPI
      .getPresentation('aster-radio-season')
      .getActiveSlide()
      .getShape('season-link')
      .getText()
    const rich = text.getRichText().copy()
    rich.getParagraphs()[0].getTextRuns()[0].setText('APPENDIX / Revised studio hours')
    text.setRichText(rich)
  })
  await page.waitForFunction(() => window.painted.join('').includes('Revised studio hours'))
  assert.deepEqual(await childSnapshot(), childBefore)
  await pageItem(report.descriptor.hostAnchorId).click()
  await child.waitFor()
  await resultIs(2085)
  assert.deepEqual(await childSnapshot(), childBefore)
  report.checks.push(
    'Three native narrative pages and host rich-text editing preserve the complete edited workbook; returning reopens the real child',
  )
  const editedHost = await hostSnapshot()
  const themeCanvas = await child.locator('canvas').first().elementHandle()
  for (const darkMode of [true, false]) {
    await page.evaluate((dark) => window.univerAPI.toggleDarkMode(dark), darkMode)
    await page.waitForFunction((dark) => document.documentElement.classList.contains('univer-dark') === dark, darkMode)
    await settle()
    assert.deepEqual(await hostSnapshot(), editedHost)
    assert.deepEqual(await childSnapshot(), childBefore)
    assert.equal(await themeCanvas.evaluate((el) => el.isConnected), true)
    await resultIs(2085)
  }
  report.checks.push(
    'Live Facade dark/light switching preserves complete edited host/child snapshots and the mounted child canvas',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.aster-embed').count(), 0)
  assert.deepEqual(report.errors, [])
  report.checks.push('Selected active-child disposal releases owned roots without browser errors or backend requests')
  if (server) {
    // Exercise the exported factory, not a replacement UI or a reset panel.
    // Actual next-themes/React transitions require their separate integration test.
    report.mounts = []
    for (const darkMode of [true, false, true, false]) {
      await page.evaluate((dark) => {
        window.painted = []
        window.demo = window.createDemo(document.getElementById('app'), dark)
      }, darkMode)
      await page.locator('.aster-embed[data-ready="true"]').waitFor({ timeout: 120000 })
      assert.equal(await page.locator('.aster-embed').count(), 1)
      assert.equal(await page.locator('[data-u-comp="slide-thumbnail-item"]').count(), 4)
      await page.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        darkMode,
      )
      await pageItem('aster-pilot-appendix-page').click()
      await child.waitFor()
      await resultIs(2040)
      await page.waitForFunction(() => window.painted.join('').includes('Eight weeks on air'))
      const freshHost = await hostSnapshot()
      assert.ok(!JSON.stringify(freshHost).includes('Revised studio hours'))
      await page.evaluate(() =>
        window.univerAPI.getWorkbook('aster-pilot-schedule').getSheetBySheetId('schedule').getRange('D5').setValue(3),
      )
      await resultIs(2085)
      assert.deepEqual(await hostSnapshot(), freshHost)
      const mountedStyle = await page
        .locator('[data-u-comp="workbench-layout"]')
        .first()
        .evaluate((el) => ({
          background: getComputedStyle(el).backgroundColor,
          flex: getComputedStyle(el.querySelector('.univer-flex')).display,
        }))
      assert.equal(mountedStyle.flex, 'flex')
      assert.notEqual(mountedStyle.background, 'rgba(0, 0, 0, 0)')
      if (!darkMode) assert.equal(mountedStyle.background, 'rgb(255, 255, 255)')
      await page.screenshot({
        path: path.join(directory, `remount-${report.mounts.length}-${darkMode ? 'dark' : 'light'}.png`),
      })
      const oldCanvas = await child.locator('canvas').first().elementHandle()
      await page.evaluate(() => {
        window.demo.dispose()
        window.demo.dispose()
      })
      await settle()
      assert.equal(await oldCanvas.evaluate((el) => el.isConnected), false)
      assert.equal(await page.locator('#app canvas,.aster-embed,[data-embed-child-render-mode]').count(), 0)
      assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
      assert.deepEqual(report.errors, [])
      report.mounts.push({ darkMode, ...mountedStyle })
    }
    assert.notEqual(report.mounts[0].background, report.mounts[1].background)
    report.checks.push(
      'Four same-container factory remounts alternate dark/light SDK chrome, reset authored data, remain editable and release old canvases/API; repeated dispose is safe',
    )
    await page.evaluate(() => {
      window.demo = window.createDemo(document.getElementById('app'))
      window.demo.dispose()
    })
    await settle()
    assert.equal(await page.locator('#app canvas,.aster-embed').count(), 0)
    assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
    report.checks.push(
      'Immediate factory disposal before readiness removes owned DOM/API without observed startup errors',
    )
  }
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-5000),
      painted: window.painted?.slice(-150),
      error: document.querySelector('.aster-embed')?.dataset.error,
      host: window.univerAPI?.getPresentation('aster-radio-season').save(),
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true, timeout: 30000 }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Sheet@Slides Tab')
