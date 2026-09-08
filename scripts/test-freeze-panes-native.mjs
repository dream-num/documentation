/* eslint-disable no-await-in-loop -- Verify localized native interactions in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const output = 'test-results/freeze-panes-native'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const report = { passed: false, locales: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto(
      `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/sheets/freeze-panes`,
      { waitUntil: 'domcontentloaded', timeout: 120000 },
    )
    const root = page.locator('.freeze-panes-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await root.locator('canvas').first().waitFor()
    const getState = () =>
      page.evaluate(() =>
        window.univerAPI
          .getActiveWorkbook()
          .getSheets()
          .map((sheet) => ({ id: sheet.getSheetId(), rows: sheet.getFrozenRows(), columns: sheet.getFrozenColumns() })),
      )
    assert.deepEqual(await getState(), [
      { id: 'rows', rows: 2, columns: 0 },
      { id: 'columns', rows: 0, columns: 2 },
      { id: 'both', rows: 2, columns: 2 },
    ])
    assert.equal(await root.locator('fieldset').count(), 0)
    const label = locale === 'en-US' ? 'Header rows' : '冻结标题行'
    await root.getByText(label, { exact: true }).first().click()
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId()), 'rows')
    const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]').first()
    await page.evaluate(() => window.scrollTo(0, 0))
    await canvas.hover({ position: { x: 400, y: 150 } })
    await page.mouse.wheel(0, 620)
    await page.waitForTimeout(350)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: `${output}/rows-scrolled-${locale}.png` })
    await page.evaluate(() => {
      const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
      sheet.cancelFreeze()
    })
    assert.equal((await getState())[0].rows, 0)
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().setFrozenRows(2))
    assert.equal((await getState())[0].rows, 2)
    await root
      .getByText(locale === 'en-US' ? 'Rows and columns' : '行列同时冻结', { exact: true })
      .first()
      .click()
    await page.evaluate(() => window.scrollTo(0, 0))
    await canvas.hover({ position: { x: 400, y: 150 } })
    await page.mouse.wheel(650, 450)
    await page.waitForTimeout(350)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: `${output}/both-scrolled-${locale}.png` })
    report.locales.push({ locale, tabs: true, freezeReadback: true, cancelAndRestore: true, scrollScreenshots: true })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
