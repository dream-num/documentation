/* eslint-disable no-await-in-loop -- Selected native canvas transitions are sequential. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const manifest = JSON.parse(await fs.readFile('test-results/mossbrook-native-export/exports.json', 'utf8'))[0]
const output = path.resolve('test-results/mossbrook-native-cleanup')
await fs.mkdir(output, { recursive: true })
const { preview } = await import(pathToFileURL(path.join(manifest.directory, 'node_modules/vite/dist/node/index.js')))
const server = await preview({
  root: manifest.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4418, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.message))
const root = page.locator('.seed-canvas-demo')
const snapshot = () => page.evaluate(() => window.univerAPI.getWorkbook('mossbrook-seed-bank').save())
const paint = () =>
  root.locator('canvas[id^="univer-sheet-main-canvas"]:visible').evaluate((canvas) => {
    const rgba = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
    const colors = { teal: [13, 148, 136], violet: [124, 58, 237], track: [203, 213, 225] }
    const count = { teal: 0, violet: 0, track: 0 }
    for (let i = 0; i < rgba.length; i += 4)
      for (const [key, rgb] of Object.entries(colors))
        if (rgb.every((v, j) => Math.abs(rgba[i + j] - v) <= 1) && rgba[i + 3] === 255) count[key]++
    return count
  })
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
try {
  await page.goto('http://127.0.0.1:4418', { waitUntil: 'load' })
  await root.locator(':scope[data-ready="true"]').waitFor()
  await page.waitForFunction(
    () =>
      typeof window.univerAPI
        .getWorkbook('mossbrook-seed-bank')
        .getSheetBySheetId('lots')
        .getRange('D29')
        .getRawValues()[0][0] === 'number',
  )
  await settle()
  assert.equal(
    await root.locator('.seed-canvas-controls pre, .seed-canvas-controls details, .seed-canvas-controls input').count(),
    0,
  )
  assert.equal(await root.locator('.seed-canvas-controls button').count(), 1)
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  const baseline = await snapshot()
  const bars = await paint()
  assert.ok(bars.teal > 100 && bars.track > 100)
  await root.screenshot({ path: path.join(output, 'native-bars.png') })
  report.checks.push({ name: 'Native white workbench and painted bars without fixture panels', passed: true, bars })
  await root.getByLabel('Render style').selectOption('dots')
  await root.getByRole('button', { name: 'Apply renderers' }).click()
  await settle()
  const dots = await paint()
  assert.ok(dots.violet > bars.violet && dots.teal < bars.teal)
  assert.deepEqual(await snapshot(), baseline)
  await root.getByLabel('Render layers').selectOption('none')
  await root.getByRole('button', { name: 'Apply renderers' }).click()
  await settle()
  const native = await paint()
  assert.ok(native.track < dots.track && native.violet < dots.violet)
  assert.deepEqual(await snapshot(), baseline)
  report.checks.push({
    name: 'Real dot and removal pixels with complete unchanged workbook',
    passed: true,
    dots,
    native,
  })
  const guide = await fs.readFile('showcase/sheets/custom-canvas/code/README.md', 'utf8')
  const snippets = [...guide.matchAll(/```ts\n([\s\S]*?)```/g)].map((m) => m[1])
  await page.evaluate(stripTypeScriptTypes(snippets.join('\n')))
  await settle()
  assert.equal(snippets.length, 6)
  const edited = await snapshot()
  assert.equal(edited.sheets.lots.cellData[3][2].v, 87)
  assert.equal(edited.sheets.lots.cellData[4][2].v, 25)
  assert.equal(edited.sheets.lots.columnData[2].w, 220)
  report.checks.push({ name: 'Six exported literal Facade recipes', passed: true })
  await page.evaluate(() => {
    window.originalOwner = window.univerAPI
    window.univerAPI.toggleDarkMode(true)
  })
  await settle()
  await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
  await settle()
  assert.equal(await page.evaluate(() => window.originalOwner === window.univerAPI), true)
  assert.deepEqual(await snapshot(), edited)
  report.checks.push({ name: 'Same-owner full-model theme preservation', passed: true })
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {})
  process.exitCode = 1
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  await server.close()
}
