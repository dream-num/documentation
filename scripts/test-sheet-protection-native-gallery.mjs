/* eslint-disable no-await-in-loop -- Compare independent localized native sheets sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'
const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheet-protection-native-gallery'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const report = { passed: false, locales: [], errors: [], nativeFailures: [] }
page.setDefaultTimeout(30000)
await page.addInitScript(() => localStorage.setItem('theme', 'light'))
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const read = () =>
  page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('A1:E10').getRawValues())
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto(
      `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/sheets/permission`,
      { waitUntil: 'domcontentloaded', timeout: 120000 },
    )
    const root = page.locator('.permission-shadow-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await page.evaluate(() => {
      window.nativeCommands = []
      window.univerAPI.addEvent(window.univerAPI.Event.CommandExecuted, (e) => window.nativeCommands.push(e.id))
    })
    const zh = locale === 'zh-CN'
    await root
      .getByText(zh ? '视图' : 'View', { exact: true })
      .first()
      .click()
    await root
      .getByText(zh ? '开始' : 'Start', { exact: true })
      .first()
      .click()
    assert.equal(await root.locator(':scope > label select').count(), 1)
    assert.equal(await root.locator(':scope > section, :scope > details, :scope > button, pre').count(), 0)
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    const shadow = root.locator(':scope > label select')
    const selectCell = async (address) => {
      const x = { A: 90, B: 240, C: 410 }[address[0]]
      await root
        .locator('canvas[id^="univer-sheet-main-canvas"]:visible')
        .click({ position: { x, y: 20 + (Number(address.slice(1)) - 1) * 32 + 16 } })
      await settle()
    }
    const native = async (address, value, expected) => {
      await selectCell(address)
      let buffer
      if (expected === value) {
        await page.keyboard.press('F2')
        await page.waitForFunction(() => document.activeElement?.getAttribute('contenteditable') === 'true')
        assert.ok(
          await page.evaluate(() => document.getSelection().rangeCount > 0),
          'Native browser caret exists; focused contenteditable alone is insufficient',
        )
        await page.keyboard.press('Control+A')
        await page.keyboard.type(String(value))
        buffer = await page.evaluate(() => ({
          commands: window.nativeCommands.slice(-25),
          body: window.univerAPI.getDocument('__INTERNAL_EDITOR__DOCS_NORMAL')?.getBody(),
          focusedEditor: document.activeElement?.id,
          nativeEditor: Array.from(document.querySelectorAll('[data-u-comp="editor"]')).map((e) => ({
            id: e.id,
            rect: e.getBoundingClientRect().toJSON(),
          })),
        }))
      } else await page.keyboard.type(String(value))
      await page.keyboard.press('Enter')
      await settle()
      if (expected === value)
        await page
          .waitForFunction(
            ({ address: cell, value: nextValue }) =>
              window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(cell).getValue() === nextValue,
            { address, value },
            { timeout: 3000 },
          )
          .catch(() => {})
      const actual = (await read())[Number(address.slice(1)) - 1][address.charCodeAt(0) - 65]
      if (actual !== expected)
        report.nativeFailures.push({
          locale,
          sheet: await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId()),
          address,
          expected,
          actual,
          buffer,
        })
      await page.keyboard.press('Escape')
    }
    const cases = []
    for (const [id, en, cn] of [
      ['none', 'Unprotected', '无保护'],
      ['worksheet', 'Sheet locked', '整表只读'],
      ['locked', 'Range locked', '区域只读'],
      ['hidden', 'Not viewable', '不可查看'],
      ['editable', 'Editable rule', '可编辑规则'],
      ['mixed', 'Mixed ranges', '混合区域'],
    ]) {
      await root
        .getByText(zh ? cn : en, { exact: true })
        .last()
        .click()
      await page.waitForFunction(
        (sheetId) => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === sheetId,
        id,
      )
      await shadow.selectOption('none')
      await selectCell('A1')
      const state = await page.evaluate(async () => {
        const p = window.univerAPI.getActiveWorkbook().getActiveSheet().getWorksheetPermission()
        return {
          rules: (await p.listRangeProtectionRules({ ignoreCollaborators: true })).length,
          edit: p.canEditCell(3, 2),
          view: p.canViewCell(3, 2),
          outside: p.canEditCell(3, 1),
        }
      })
      assert.equal(state.rules, id === 'mixed' ? 2 : ['locked', 'hidden', 'editable'].includes(id) ? 1 : 0)
      assert.equal(state.edit, ['editable', 'mixed', 'none'].includes(id))
      assert.equal(state.view, id !== 'hidden')
      assert.equal(state.outside, id !== 'worksheet')
      const failureCount = report.nativeFailures.length
      await native('C4', 17, state.edit ? 17 : 6.5)
      await native('C8', 12, ['editable', 'none'].includes(id) ? 12 : undefined)
      await native('B4', 19, id === 'worksheet' ? 'A' : 19)
      await selectCell('A1')
      const baseline = await root
        .locator('canvas[id^="univer-sheet-main-canvas"]:visible')
        .evaluate((c) => Array.from(c.getContext('2d').getImageData(350, 122, 16, 8).data))
      const values = await read()
      for (const strategy of ['always', 'non-editable', 'non-viewable', 'none']) {
        console.log(locale, id, strategy)
        await shadow.selectOption(strategy)
        assert.equal(await page.evaluate(() => window.univerAPI.getProtectedRangeShadowStrategy()), strategy)
        const visible =
          id !== 'none' &&
          strategy !== 'none' &&
          (strategy === 'always' ||
            (strategy === 'non-editable' && !['editable', 'mixed'].includes(id)) ||
            (strategy === 'non-viewable' && id === 'hidden'))
        await page.waitForFunction(
          ({ baseline: original, visible: shouldShow }) => {
            const c = document.querySelector('canvas[id^="univer-sheet-main-canvas"]')
            return (
              (JSON.stringify(Array.from(c.getContext('2d').getImageData(350, 122, 16, 8).data)) !==
                JSON.stringify(original)) ===
              shouldShow
            )
          },
          { baseline, visible },
        )
        assert.deepEqual(await read(), values)
      }
      await shadow.selectOption('always')
      await settle()
      await root.screenshot({ path: `${output}/${locale}-${id}.png` })
      cases.push({ id, ...state, nativeInput: report.nativeFailures.length === failureCount, shadowPixels: true })
    }
    await shadow.selectOption('non-editable')
    await page.evaluate(() => {
      const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('none')
      if (sheet.getRange('C4').getValue() !== 17 || sheet.getRange('C8').getValue() !== 12)
        throw new Error('Theme checks require the actual native input edits')
      window.protectionOwner = window.univerAPI
      window.protectionSnapshot = JSON.stringify(window.univerAPI.getActiveWorkbook().save())
    })
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        localStorage.setItem('theme', value)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value }))
      }, theme)
      await page.locator(`.permission-shadow-demo[data-theme="${theme}"][data-ready=true]`).waitFor()
      await settle()
      assert.deepEqual(
        await page.evaluate(() => ({
          owner: window.univerAPI === window.protectionOwner,
          data: JSON.stringify(window.univerAPI.getActiveWorkbook().save()) === window.protectionSnapshot,
          strategy: window.univerAPI.getProtectedRangeShadowStrategy(),
        })),
        { owner: true, data: true, strategy: 'non-editable' },
      )
      await root.screenshot({ path: `${output}/${locale}-${theme}.png` })
    }
    report.locales.push({ locale, cases, themePreserved: true, themeEdit: 'native input edits across six sheets' })
  }
  assert.deepEqual(report.errors, [])
  assert.equal(report.nativeFailures.length, 0, 'Native input failures are retained; SDK acceptance is not passing')
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: output + '/failure.png' }).catch(() => {})
  process.exitCode = 1
} finally {
  await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
