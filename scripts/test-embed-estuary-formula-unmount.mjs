import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const directory = process.env.SHOWCASE_RESULTS_DIR || 'test-results/estuary-formula-unmount'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } })
const report = { passed: false, errors: [], traces: [], ownerPreserved: false }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
await page.addInitScript(() => {
  Error.stackTraceLimit = 40
  window.__errorTraces = []
  const original = console.error
  console.error = (...args) => {
    window.__errorTraces.push({ message: args.map(String).join(' '), stack: new Error('Console error origin').stack })
    original(...args)
  }
})
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4427')
  await page.locator('.estuary-embed[data-ready=true]').waitFor({ timeout: 90000 })
  await page.evaluate(async () => {
    window.__originalOwner = window.univerAPI
    const doc = window.univerAPI.getDocument('estuary-field-brief')
    await window.univerAPI.executeCommand('docs-formula.operation.open-editor', {
      unitId: doc.getId(),
      rangeId: doc.getFormulas()[0].getId(),
    })
  })
  await page.getByRole('dialog').last().locator('canvas').first().waitFor()
  await page.screenshot({ path: directory + '/native-editor.png' })
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.getByRole('dialog').waitFor({ state: 'detached' })
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  report.ownerPreserved = await page.evaluate(() => window.__originalOwner === window.univerAPI)
  report.traces = await page.evaluate(() => window.__errorTraces)
  assert.equal(report.ownerPreserved, true)
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.traces = await page.evaluate(() => window.__errorTraces).catch(() => [])
  process.exitCode = 1
} finally {
  await fs.writeFile(directory + '/report.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
