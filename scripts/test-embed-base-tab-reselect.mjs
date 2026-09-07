import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'
const directory = 'test-results/embed-base-tab-reselect'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const report = { passed: false, errors: [] }
page.on('pageerror', (e) => report.errors.push(e.message))
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4268')
  await page.locator('.acorn-workspace-embed[data-ready=true]').waitFor()
  await page.getByText('Weighted forecast', { exact: true }).click()
  await page.locator('[data-embed-bases-table-list-host="acorn-workspace-sheet-tab"]').waitFor()
  await page.getByText('Weighted forecast', { exact: true }).click()
  report.canvasParent = await page
    .locator('#univer-base-main-canvas_acorn-studio-operations')
    .evaluate((e) => e.parentElement.outerHTML.slice(0, 400))
    .catch(() => null)
  await page.getByText('Delivery playbook', { exact: true }).click({ timeout: 5000 })
  await page.locator('[data-embed-bases-table-list-host="acorn-workspace-doc-tab"]').waitFor()
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
  await page.screenshot({ path: directory + '/failure.png' })
} finally {
  await fs.writeFile(directory + '/report.json', JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
