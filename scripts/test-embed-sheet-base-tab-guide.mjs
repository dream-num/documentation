/* eslint-disable no-await-in-loop -- Each locale owns one live editor and theme sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4268'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-base-tab-next')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Sheets in Bases / Pipeline Forecast', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Sheets 嵌入 Bases / 商机预测', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(`${origin}/${locale}/showcase/embed/sheets-in-bases-tab`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    // The localized page can replace its initial iframe during hydration.
    // Resolve the current frame only after the live SDK preview is ready.
    const root = page.frameLocator('iframe').first().locator('.acorn-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.ok(frame)
    await root.getByText('Weighted forecast', { exact: true }).click()
    const child = root.locator('[data-embed-bases-table-list-host="acorn-forecast-tab"]')
    await child.waitFor()
    await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    assert.equal(await child.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
    assert.equal(await root.locator('fieldset,[data-action]').count(), 0)
    await frame.waitForFunction(
      () =>
        window.univerAPI
          .getWorkbook('acorn-weighted-forecast')
          .getSheetBySheetId('forecast')
          .getRange('E15')
          .getRawValue() === 215125,
    )
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
      window.univerAPI
        .getWorkbook('acorn-weighted-forecast')
        .getSheetBySheetId('assumptions')
        .getRange('B5')
        .setValue(0.5)
    })
    await frame.waitForFunction(
      () =>
        window.univerAPI
          .getWorkbook('acorn-weighted-forecast')
          .getSheetBySheetId('forecast')
          .getRange('E15')
          .getRawValue() === 222725,
    )
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            host: window.univerAPI.getBase('acorn-sales-pipeline').save(),
            child: window.univerAPI.getWorkbook('acorn-weighted-forecast').save(),
          }),
        ),
      )
    const snapshot = await read()
    assert.deepEqual(snapshot.host.tableOrder, ['deals', 'acorn-forecast-tab', 'accounts'])
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      assert.deepEqual(await read(), snapshot)
    }
    await root.screenshot({ path: path.join(directory, `${locale}.png`) })
    report.checks.push({
      locale,
      redundantGuideCardRemoved: true,
      nativeGrid: true,
      whiteChildCSS: true,
      themePreservesOwnerAndEditedSnapshot: true,
    })
    assert.deepEqual(report.errors, [])
  }
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS Acorn EN/ZH guides, native Grid and theme owner/data preservation')
