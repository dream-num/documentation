import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const output = 'test-results/atlas-preview-ready'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
try {
  const origin = process.env.SHOWCASE_ORIGIN || 'http://localhost:4334'
  const response = await page.goto(`${origin}/en-US/playground/embed/slides-in-sheets-formula-float`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  assert.equal(response.status(), 200)
  // Host canvases exist before the asynchronous embedded presentation is ready.
  await page.locator('.atlas-embed[data-ready=true]').waitFor({ timeout: 60000 })
  const embed = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="atlas-slide-float"]')
  await embed.waitFor({ state: 'visible' })
  const bounds = await embed.boundingBox()
  assert.ok(bounds.width > 700 && bounds.height > 400)
  await page.screenshot({ path: `${output}/ready.png` })
  report.checks.push('HTTP 200, completed initialization and visible native Slide Float')
  const before = await page.evaluate(() =>
    window.univerAPI
      .getPresentation('atlas-quote-decision')
      .getSlideById('decision')
      .getShape('margin-value')
      .getFormulaResult(),
  )
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('atlas-quote-model').getSheetBySheetId('quote').getRange('B8').setValue(3000),
  )
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('atlas-quote-model')
        .getSheetBySheetId('quote')
        .getRange('B16')
        .getRawValues()[0][0] === 0.25,
  )
  await page.waitForFunction(
    (previous) =>
      JSON.stringify(
        window.univerAPI
          .getPresentation('atlas-quote-decision')
          .getSlideById('decision')
          .getShape('margin-value')
          .getFormulaResult(),
      ) !== previous,
    JSON.stringify(before),
  )
  report.result = await page.evaluate(() =>
    window.univerAPI
      .getPresentation('atlas-quote-decision')
      .getSlideById('decision')
      .getShape('margin-value')
      .getFormulaResult(),
  )
  assert.equal(before.value, 0.3)
  assert.equal(report.result.status, 'success')
  assert.equal(report.result.value, 0.25)
  assert.equal(report.result.displayText, '25.00%')
  assert.equal(report.result.stale, false)
  await page.screenshot({ path: `${output}/updated.png` })
  report.checks.push('Sheet cost edit recalculates margin to 25% and changes native Slide formula result')
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  process.exitCode = 1
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
