/* eslint-disable no-await-in-loop -- Sequential native worksheet checks. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheet-outline-native-gallery'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1550, height: 1150 } })
const report = { passed: false, locales: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
await page.addInitScript(() => localStorage.setItem('theme', 'light'))
const variants = [
  ['rows', 'Row groups', '行分组', 2, []],
  ['nested', 'Nested rows', '嵌套行', 3, []],
  ['parent', 'Parent collapsed', '父组折叠', 3, [2, 3, 4, 5, 6, 7, 8, 9]],
  ['child', 'Child collapsed', '子组折叠', 3, [3, 4, 5]],
  ['columns', 'Column groups', '列分组', 2, []],
]
const read = () =>
  page.evaluate(() => {
    const book = window.univerAPI.getActiveWorkbook()
    return Object.fromEntries(
      book.getSheets().map((sheet) => {
        const data = book.save().sheets[sheet.getSheetId()]
        return [
          sheet.getSheetId(),
          {
            groups: sheet.getDimensionOutlines(),
            hiddenRows: Object.entries(data.rowData || {})
              .filter(([, value]) => value.hd === 1)
              .map(([key]) => Number(key)),
            hiddenColumns: Object.entries(data.columnData || {})
              .filter(([, value]) => value.hd === 1)
              .map(([key]) => Number(key)),
            cells: data.cellData,
          },
        ]
      }),
    )
  })
try {
  for (const [language, locale] of ['en-US', 'zh-CN'].entries()) {
    await page.goto(`${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/sheets/outline`, {
      waitUntil: 'commit',
      timeout: 120000,
    })
    const root = page.locator('.outline-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator(':scope > section, :scope > fieldset, :scope > details, :scope > pre').count(), 0)
    await page.waitForFunction(
      () =>
        typeof window.univerAPI.getActiveWorkbook().getSheetBySheetId('rows').getRange('G11').getValue() === 'number',
    )
    const baseline = await read()
    assert.equal(Object.keys(baseline).length, 5)
    const initialGrid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
    await page.screenshot({ path: `${output}/${locale}-initial-untouched.png` })
    await initialGrid.click({ position: { x: 10, y: 18 } })
    await page.waitForFunction(() =>
      window.univerAPI
        .getActiveWorkbook()
        .getActiveSheet()
        .getDimensionOutlines()
        .every((group) => group.collapsed),
    )
    assert.deepEqual((await read()).rows.hiddenRows, [3, 4, 5, 7, 8, 9])
    await initialGrid.click({ position: { x: 10, y: 18 } })
    await page.waitForFunction(() =>
      window.univerAPI
        .getActiveWorkbook()
        .getActiveSheet()
        .getDimensionOutlines()
        .every((group) => !group.collapsed),
    )
    assert.deepEqual(await read(), baseline)
    for (const [id, en, zh, count, hidden] of variants) {
      await root
        .getByText(language ? zh : en, { exact: true })
        .last()
        .click()
      await page.waitForFunction(
        (sheetId) => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === sheetId,
        id,
      )
      const state = await read()
      assert.equal(state[id].groups.length, count)
      assert.deepEqual(state[id].hiddenRows, hidden)
      assert.deepEqual(state[id].hiddenColumns, [])
      assert.deepEqual(state, baseline)
      assert.ok(
        Object.values(state[id].cells).some((row) => Object.values(row).some((cell) => cell.f?.includes('SUM'))),
      )
      await page.screenshot({ path: `${output}/${locale}-${id}.png` })
    }
    await root
      .getByText(language ? '父组折叠' : 'Parent collapsed', { exact: true })
      .last()
      .click()
    await page.waitForFunction(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === 'parent')
    const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
    await grid.click({ position: { x: 10, y: 18 } })
    await page.waitForFunction(() =>
      window.univerAPI
        .getActiveWorkbook()
        .getActiveSheet()
        .getDimensionOutlines()
        .every((g) => !g.collapsed),
    )
    const expanded = await read()
    assert.deepEqual(expanded.parent.hiddenRows, [])
    assert.deepEqual(expanded.parent.cells, baseline.parent.cells)
    for (const id of ['rows', 'nested', 'child', 'columns']) assert.deepEqual(expanded[id], baseline[id])
    await page.screenshot({ path: `${output}/${locale}-native-expanded.png` })
    await grid.click({ position: { x: 10, y: 18 } })
    await page.waitForFunction(() =>
      window.univerAPI
        .getActiveWorkbook()
        .getActiveSheet()
        .getDimensionOutlines()
        .some((g) => g.collapsed),
    )
    assert.deepEqual((await read()).parent.cells, baseline.parent.cells)
    const saved = await page.evaluate(() => {
      window.__themeOwner = window.univerAPI
      const workbook = window.univerAPI.getActiveWorkbook()
      workbook.getActiveSheet().getRange('A1').setValue('Edited outline specimen')
      return workbook.save()
    })
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        localStorage.setItem('theme', value)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value }))
      }, theme)
      await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
      assert.equal(await page.evaluate(() => window.__themeOwner === window.univerAPI), true)
      assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveWorkbook().save()), saved)
      await page.screenshot({ path: `${output}/${locale}-${theme}-edited.png` })
    }
    report.locales.push({ locale, baseline, nativeGutter: true, sameOwnerEditedSnapshot: true })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  throw error
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, errors: report.errors, failure: report.failure }))
  await browser.close()
}
