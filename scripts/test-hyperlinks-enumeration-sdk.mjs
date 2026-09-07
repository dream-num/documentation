import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

// Strict counterexample to the installed Facade's documented "all hyperlinks" contract.
// The selected demo reads getHyperLinks() and getCellDataGrid() directly, without synthesizing links.
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/hyperlinks-enumeration-sdk')
const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/hyper-link'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const report = { passed: false, errors: [] }
try {
  const page = await browser.newPage()
  page.on('pageerror', (error) => report.errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
  })
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await page.locator('.hyperlink-demo[data-ready="true"]').waitFor({ timeout: 90000 })
  const state = JSON.parse(await page.locator('.hyperlink-demo pre').textContent())
  report.cellSpans = state.sheets[0].cells[5][1].p.body.customRanges
  report.facadeLinks = state.sheets[0].links.filter((link) => link.row === 5 && link.column === 1)
  assert.equal(report.cellSpans.length, 2, 'B6 fixture must actually contain two hyperlink spans')
  assert.deepEqual(report.errors, [])
  assert.equal(
    report.facadeLinks.length,
    report.cellSpans.length,
    'getHyperLinks() must enumerate every linked span, not only the first per cell',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
assert.ok(report.passed)
