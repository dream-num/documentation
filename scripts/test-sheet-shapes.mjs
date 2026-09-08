/* eslint-disable no-await-in-loop -- Verify each native worksheet in both locales. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const base = process.env.SHOWCASE_BASE_URL || 'http://127.0.0.1:4336'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheet-shapes-native')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, locales: [], errors: [] }
const browser = await chromium.launch()
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
    page.on('pageerror', (error) => report.errors.push({ locale, message: error.message }))
    await page.goto(base + '/' + locale + '/playground/sheets/shapes', {
      waitUntil: 'domcontentloaded',
      timeout: 240000,
    })
    const root = page.locator('.sheet-shapes-demo')
    await page.locator('.sheet-shapes-demo[data-ready="true"]').waitFor({ timeout: 180000 })
    assert.equal(await root.locator('fieldset, pre, [data-action]').count(), 0)
    const read = () =>
      page.evaluate(() => {
        const workbook = window.univerAPI.getActiveWorkbook()
        return {
          id: workbook.getId(),
          active: workbook.getActiveSheet().getSheetId(),
          sheets: workbook.getSheets().map((sheet) => ({
            id: sheet.getSheetId(),
            name: sheet.getSheetName(),
            shapes: sheet.getShapes().map((shape) => ({
              id: shape.getId(),
              type: shape.getShapeType(),
              data: shape.getShapeData(),
              text: shape.getText().getPlainText(),
              placement: typeof shape.getPlacement === 'function' ? shape.getPlacement() : null,
              start: typeof shape.getStartEndpoint === 'function' ? shape.getStartEndpoint() : null,
              end: typeof shape.getEndEndpoint === 'function' ? shape.getEndEndpoint() : null,
            })),
          })),
        }
      })
    const initial = await read()
    assert.deepEqual(
      initial.sheets.map((sheet) => [sheet.id, sheet.shapes.length]),
      [
        ['geometry', 9],
        ['text', 6],
        ['connectors', 9],
        ['placement', 3],
      ],
    )
    assert.equal(new Set(initial.sheets[0].shapes.slice(0, 8).map((shape) => shape.type)).size, 8)
    assert.ok(initial.sheets[0].shapes[8].data.customGeometry)
    const connectors = initial.sheets[2].shapes.filter((shape) => shape.start)
    assert.equal(connectors.length, 3)
    assert.equal(new Set(connectors.map((shape) => shape.type)).size, 3)
    for (const sheet of initial.sheets) {
      await root.getByText(sheet.name, { exact: true }).click()
      assert.equal((await read()).active, sheet.id)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ path: path.join(directory, locale + '-' + sheet.id + '.png') })
    }
    // Public API readback verifies exported data, not extra demo controls.
    const changed = await page.evaluate(() => {
      const api = window.univerAPI
      const workbook = api.getActiveWorkbook()
      const shape = workbook.getSheetBySheetId('geometry').getShapes()[0]
      shape.getText().setText('Edited shape')
      api.toggleDarkMode(true)
      const darkId = api.getActiveWorkbook().getId()
      api.toggleDarkMode(false)
      return { id: darkId, text: shape.getText().getPlainText() }
    })
    assert.equal(changed.id, initial.id)
    assert.match(changed.text, /Edited shape/)
    report.locales.push({
      locale,
      counts: initial.sheets.map((sheet) => sheet.shapes.length),
      nativeTabs: true,
      themeIdentity: true,
    })
    await page.close()
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
