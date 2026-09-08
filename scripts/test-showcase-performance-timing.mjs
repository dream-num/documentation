/* eslint-disable no-await-in-loop -- Keep localized route diagnostics ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const directory = process.env.SHOWCASE_RESULTS_DIR || 'test-results/showcase-performance-timing'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const report = { passed: false, routes: [] }
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const page = await browser.newPage()
    const result = { locale, errors: [], exceptions: [] }
    const session = await page.context().newCDPSession(page)
    await session.send('Debugger.enable')
    await session.send('Debugger.setPauseOnExceptions', { state: 'uncaught' })
    session.on('Debugger.paused', async (event) => {
      try {
        const frame = event.callFrames.find((candidate) => candidate.functionName === 'flushComponentPerformance')
        if (frame) {
          const value = await session.send('Debugger.evaluateOnCallFrame', {
            callFrameId: frame.callFrameId,
            expression:
              'JSON.stringify({start:startTime$jscomp$2,end:childrenEndTime$jscomp$1,name:measureName,componentError:String(error)})',
            returnByValue: true,
          })
          result.exceptions.push({
            description: event.data?.description,
            frame: frame.url,
            location: frame.location,
            values: value.result.value,
            evaluationError: value.exceptionDetails?.text,
          })
        }
      } finally {
        await session.send('Debugger.resume')
      }
    })
    page.on('pageerror', (error) => result.errors.push(error.stack))
    const response = await page.goto(
      `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/docs-traditional/pagination-rules`,
      { waitUntil: 'domcontentloaded', timeout: 120000 },
    )
    await page.locator('.pagination-demo[data-ready=true] canvas').first().waitFor({ timeout: 120000 })
    result.status = response.status()
    result.url = page.url()
    result.documentTitle = await page.evaluate(() => window.univerAPI.getActiveDocument().save().title)
    report.routes.push(result)
    await session.detach()
    await page.close()
  }
  assert.ok(report.routes.every((route) => route.status === 200 && route.documentTitle))
  if (process.argv.includes('--not-found')) {
    const page = await browser.newPage()
    const result = { kind: 'missing-route', errors: [] }
    page.on('pageerror', (error) => result.errors.push(error.stack))
    const response = await page.goto(
      `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/zh-CN/playground/__missing-pagination-probe`,
      { waitUntil: 'networkidle', timeout: 120000 },
    )
    result.status = response.status()
    result.url = page.url()
    result.heading = await page.getByRole('heading').innerText()
    assert.equal(result.status, 404)
    assert.equal(result.heading, 'Page Not Found')
    report.routes.push(result)
    await page.close()
  }
  assert.ok(
    report.routes.every((route) => route.errors.length === 0),
    'Uncaught development runtime errors; inspect diagnostic report',
  )
  report.passed = true
} finally {
  await fs.writeFile(`${directory}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
