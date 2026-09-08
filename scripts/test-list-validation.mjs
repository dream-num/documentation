/* eslint-disable no-await-in-loop -- Compare native variants and locales sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/list-validation-native-gallery'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const root = page.locator('.list-validation-demo')
const read = () =>
  page.evaluate(async () => {
    const workbook = window.univerAPI.getActiveWorkbook()
    return Promise.all(
      workbook.getSheets().map(async (sheet) => ({
        id: sheet.getSheetId(),
        rules: sheet.getDataValidations().map((validation) => validation.rule),
        values: sheet.getRange('B2:B7').getRawValues(),
        statuses: (await sheet.getRange('B2:B7').getValidatorStatus()).flat(),
      })),
    )
  })
const select = async (address) => {
  const box = root.locator('input.univer-size-full').first()
  await box.fill(address)
  await box.press('Enter')
}
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const url = process.env.SHOWCASE_DEMO_URL
      ? process.env.SHOWCASE_DEMO_URL.replace(/\/(en-US|zh-CN)\//, '/' + locale + '/')
      : 'http://localhost:4336/' + locale + '/playground/sheets/list-validation'
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
    await page.locator('.list-validation-demo[data-ready=true]').waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset, .list-validation-controls, .list-validation-readback').count(), 0)
    const initial = await read()
    assert.deepEqual(
      initial.map((sheet) => sheet.id),
      ['single', 'multiple', 'source'],
    )
    assert.deepEqual(initial[0].rules.map((rule) => rule.renderMode).toSorted(), [0, 1, 2])
    assert.equal(initial[1].rules[0].type, 'listMultiple')
    assert.match(initial[2].rules[0].formula1, /H\$?2:H\$?6/)
    assert.equal(initial[0].statuses[2], 'invalid')
    assert.equal(initial[0].statuses[3], 'valid')
    assert.equal(initial[0].statuses[5], 'valid')
    assert.equal(initial[1].statuses[0], 'valid')
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await page.screenshot({ path: output + '/' + locale + '-gallery.png' })
    const geometry = await page.evaluate(() => {
      const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet().getSheet()
      return {
        x: sheet.getColumnWidth(0) + sheet.getColumnWidth(1) + 36,
        y: sheet.getRowHeight(0) + sheet.getRowHeight(1) / 2 + 20,
      }
    })
    await root.locator('canvas[id^="univer-sheet-main-canvas"]').first().click({ position: geometry })
    const paper = await page.evaluate(() =>
      window.univerAPI.getActiveWorkbook().getSheetBySheetId('source').getRange('H4').getRawValue(),
    )
    await page.getByText(paper, { exact: true }).last().click()
    await page.waitForFunction(
      (value) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').getRawValue() === value,
      paper,
    )
    await select('B2')
    await page.keyboard.press('Control+z')
    assert.equal((await read())[0].values[0][0], initial[0].values[0][0])
    await page.keyboard.press('Control+y')
    assert.equal((await read())[0].values[0][0], paper)
    if (process.argv.includes('--clipboard')) {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
      const lines = ['Wood', 'Unknown', paper]
      await page.evaluate((text) => navigator.clipboard.writeText(text), lines.join('\n'))
      await page.keyboard.press('Control+v')
      await page.waitForFunction(
        (value) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B4').getRawValue() === value,
        paper,
      )
      assert.deepEqual(
        (await read())[0].values.slice(0, 3).flat(),
        lines,
        'Native clipboard must not add trailing spaces',
      )
    }
    await root.getByText(locale === 'zh-CN' ? '多选材质' : 'Multiple materials', { exact: true }).click()
    assert.equal(
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId()),
      'multiple',
    )
    await page.evaluate(() => window.scrollTo(0, 0))
    await root.locator('canvas[id^="univer-sheet-main-canvas"]').first().click({ position: geometry })
    const metal = await page.evaluate(() =>
      window.univerAPI.getActiveWorkbook().getSheetBySheetId('source').getRange('H5').getRawValue(),
    )
    await page.getByText(metal, { exact: true }).last().click()
    await page.waitForFunction((value) => {
      const raw = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').getRawValue()
      return JSON.parse(raw).includes(value)
    }, metal)
    const added = JSON.parse((await read())[1].values[0][0])
    assert.equal(added.length, 3)
    assert.ok(added.includes(paper))
    await page.getByText(paper, { exact: true }).last().click()
    await page.waitForFunction(
      (value) =>
        !JSON.parse(window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').getRawValue()).includes(value),
      paper,
    )
    const removed = await read()
    assert.equal(JSON.parse(removed[1].values[0][0]).length, 2)
    assert.ok(JSON.parse(removed[1].values[0][0]).includes(metal))
    assert.equal(removed[1].statuses[0], 'valid')
    assert.equal(removed[0].values[0][0], paper, 'Multiple selection must not alter the single-select worksheet')
    await page.screenshot({ path: output + '/' + locale + '-multiple.png' })
    await page
      .getByText(locale === 'zh-CN' ? '编辑' : 'Edit', { exact: true })
      .last()
      .click()
    await page.getByText(locale === 'zh-CN' ? '忽略空值' : 'Allow blank values', { exact: true }).waitFor()
    await page.getByText(locale === 'zh-CN' ? '忽略空值' : 'Allow blank values', { exact: true }).click()
    assert.equal(await root.locator('input[type="checkbox"]').isChecked(), false)
    await page.getByRole('button', { name: locale === 'zh-CN' ? '确认' : 'Done', exact: true }).click()
    await page.waitForFunction(
      () =>
        window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').getDataValidation().rule.allowBlank ===
        false,
    )
    const stricter = await read()
    assert.deepEqual(stricter[1].values, removed[1].values, 'Editing validation policy must preserve existing data')
    assert.equal(stricter[1].statuses[3], 'invalid')
    await page.screenshot({ path: output + '/' + locale + '-native-rule.png' })
    await page.evaluate(() => {
      const workbook = window.univerAPI.getActiveWorkbook()
      workbook.setActiveSheet('source')
      const sheet = workbook.getActiveSheet()
      sheet.getRange('H2').setValue('Recycled')
      sheet.getRange('B2').setValue('Recycled')
    })
    await page.waitForFunction(
      async () =>
        (await window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').getValidatorStatus()).flat()[0] ===
        'valid',
    )
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('H2').setValue('Replaced'))
    await page.waitForFunction(
      async () =>
        (await window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').getValidatorStatus()).flat()[0] ===
        'invalid',
    )
    report.checks.push({
      locale,
      nativeDropdownAndUndo: true,
      nativeMultipleAddRemove: true,
      nativeRuleEditing: true,
      threeVariants: true,
      liveSourceValidation: true,
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = String(error.stack || error)
  throw error
} finally {
  await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
