import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:4210/en-US/playground/sheets/print'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/print')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [], networkWrites: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
await page.addInitScript(() => {
  window.printPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.printPaint.length < 5000) window.printPaint.push(String(text))
    return fillText.call(this, text, ...args)
  }
})
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()))
    report.networkWrites.push({ method: request.method(), url: request.url() })
})

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  const root = page.locator('.print-demo[data-ready="true"]')
  await root.waitFor({ timeout: 120000 })
  const workbench = root.locator('[data-u-comp="workbench-layout"]')
  assert.equal(await workbench.evaluate((element) => getComputedStyle(element).backgroundColor), 'rgb(255, 255, 255)')
  assert.equal(await root.locator('.print-controls button').count(), 2)
  report.checks.push('Shared controls, native canvas and opaque-white official SDK workbench')

  await root.getByRole('button', { name: 'Open print dialog', exact: true }).click()
  await page.getByText('Total: 2pages', { exact: true }).waitFor()
  assert.equal(await root.locator('output').textContent(), 'SDK print dialog opened for Sheet1')
  await page.screenshot({ path: path.join(directory, 'print-dialog.png') })
  await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
  report.checks.push('Host button executes SheetPrintOpenOperation and receives the public SheetPrintOpen event')

  const nameBox = root.locator('.print-editor input.univer-size-full').first()
  await nameBox.fill('B2')
  await nameBox.press('Enter')
  await page.keyboard.type('Changed Owner')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => window.printPaint.includes('Changed Owner'))
  await page.evaluate(() => {
    window.printPaint = []
  })
  await root.getByRole('button', { name: 'Reset portfolio', exact: true }).click()
  await page.waitForFunction(() => window.printPaint.includes('Michael Wang'))
  assert.equal(await root.locator('output').textContent(), 'Portfolio reset through the Facade API')
  report.checks.push(
    'Native edit paints, then public disposeUnit/createWorkbook reset restores the original model and paint',
  )

  assert.deepEqual(report.networkWrites, [])
  assert.deepEqual(report.errors, [])
  await page.screenshot({ path: path.join(directory, 'print.png') })
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
} finally {
  await browser.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
}

console.log(JSON.stringify(report, null, 2))
assert.equal(report.passed, true)
