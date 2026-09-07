import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

// Isolate the known fullscreen name-box failure without weakening the pointer-edit test.
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-board-float-namebox')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const report = { passed: false, expectedAddress: 'B5', errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4244', { waitUntil: 'domcontentloaded' })
  await page.locator('.ripple-embed[data-ready=true]').waitFor()
  await page.locator('[data-u-comp="embed-float-dom"]').dblclick({ position: { x: 220, y: 130 } })
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click()
  const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
  await fullscreen.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  const nameBox = fullscreen.locator('[data-u-comp="defined-name"] input')
  await nameBox.fill('B5')
  await nameBox.press('Enter')
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('ripple-workshop-budget').getActiveRange()?.getA1Notation() === 'B5',
    {},
    { timeout: 5000 },
  )
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
} finally {
  report.actualAddress = await page
    .evaluate(() => window.univerAPI?.getWorkbook('ripple-workshop-budget').getActiveRange()?.getA1Notation())
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'namebox.png') })
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS Ripple fullscreen name-box navigation')
