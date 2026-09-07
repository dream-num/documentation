/* eslint-disable no-await-in-loop -- Verify each documentation locale independently. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-aurora-formula-next')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1400 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const literal = [
  ...(await fs.readFile('showcase/embed/sheet-to-many-products/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
][0][1]
try {
  for (const [locale, code, editLabel, confirmLabel] of [
    ['en-US', 'enUS', 'Edit formula', 'Confirm'],
    ['zh-CN', 'zhCN', '编辑公式', '确定'],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4332') +
        '/' +
        locale +
        '/showcase/embed/sheet-to-many-products',
      { timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    const root = page.frameLocator('iframe').locator('.aurora-embed[data-ready="true"]')
    await root.waitFor({ timeout: 180000 })
    const frame = await (await page.locator('iframe').elementHandle()).contentFrame()
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    assert.equal(await page.locator('[data-showcase-guide]').count(), 0)
    const snapshot = () =>
      frame.evaluate(() => {
        const api = window.univerAPI
        return JSON.parse(
          JSON.stringify({
            sheet: api.getWorkbook('aurora-budget-model').save(),
            doc: api.getDocument('aurora-budget-note').save(),
            slides: api.getPresentation('aurora-review-deck').save(),
            board: api.getBoard('aurora-allocation-map').save(),
          }),
        )
      })
    const labels = await frame.evaluate(() => {
      const api = window.univerAPI,
        packs = api.getLocales()
      return {
        current: api.getCurrentLocale(),
        edit: packs['docs-formula-ui'].menu.edit,
        confirm: packs['shape-editor-ui'].formulaBinding.confirm,
        source: packs['embed-unit-ui'].referencedUnitViewer.sheet,
      }
    })
    assert.equal(labels.current, code)
    assert.equal(labels.edit, editLabel)
    assert.equal(labels.confirm, confirmLabel)
    await frame.evaluate(literal)
    await frame.waitForFunction(
      () => {
        const api = window.univerAPI
        const doc = api
          .getDocument('aurora-budget-note')
          .getFormulas()
          .map((formula) => formula.getResult())
        const slide = api
          .getPresentation('aurora-review-deck')
          .getSlideById('overview')
          .getShape('total')
          .getFormulaResult()
        const board = api.getBoard('aurora-allocation-map').getShape('total').getFormulaResult()
        return (
          doc.length === 8 &&
          [doc[0], slide, board].every((result) => result.value === 10500 && !result.stale) &&
          api.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation').getRange('B9').getRawValue() === 10500
        )
      },
      null,
      { timeout: 30000 },
    )
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    const before = await snapshot()
    for (const scheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: scheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        scheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      assert.deepEqual(await snapshot(), before)
    }
    assert.equal(
      await root
        .locator('[data-u-comp="workbench-layout"]')
        .first()
        .evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await root.screenshot({ path: path.join(directory, locale + '-sheet.png') })
    report.checks.push({
      locale,
      labels,
      firstLiteralExample: true,
      sourceAndThreeFormulaTargets: true,
      ownerAndModelsPreserved: true,
      officialWhiteUI: true,
      redundantControlsAbsent: true,
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
