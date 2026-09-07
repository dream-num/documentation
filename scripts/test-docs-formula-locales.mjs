/* eslint-disable no-await-in-loop -- Verify each locale against the same live document owner. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const cases = {
  cobalt: 'cobalt-operating-review',
  pollen: 'pollen-campaign-brief',
  linen: 'linen-services-schedule',
  cinder: 'cinder-incident-brief',
  estuary: 'estuary-field-brief',
  aster: 'aster-research-report',
  kestrel: 'kestrel-planning-note',
  meridian: 'meridian-production-note',
}
const name = process.env.SHOWCASE_CASE || 'cinder'
const unitId = cases[name]
assert.ok(unitId, 'Select a case listed in the locale test')
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/docs-formula-locales-' + name)
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 }, colorScheme: 'light' })
const report = {
  passed: false,
  case: name,
  scope: 'Official locale packs and native labels, not full layout acceptance',
  checks: [],
  dialogBounds: [],
  interactionFailures: [],
  errors: [],
}
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
async function noVisibleKeys() {
  const rendered = await page
    .locator('body')
    .evaluate((body) =>
      [
        body.innerText,
        ...[...body.querySelectorAll('[aria-label],[title],[placeholder]')]
          .filter((element) => element.getClientRects().length)
          .flatMap((element) => ['aria-label', 'title', 'placeholder'].map((key) => element.getAttribute(key) || '')),
      ].join('\n'),
    )
  assert.doesNotMatch(rendered, /(?:docs-formula-ui|shape-editor-ui|embed-unit-ui)\.[\w.-]+/)
}
function includesPack(received, pack, prefix) {
  for (const [key, value] of Object.entries(pack)) {
    if (typeof value === 'object') includesPack(received?.[key], value, prefix + '.' + key)
    else assert.equal(received?.[key], value, prefix + '.' + key)
  }
}
async function settleDialog() {
  await page.evaluate(() => {
    window.localeDialogBounds = undefined
  })
  await page.waitForFunction(
    () => {
      const dialogs = document.querySelectorAll('[role="dialog"]')
      const rect = dialogs[dialogs.length - 1]?.getBoundingClientRect()
      if (!rect) return false
      const bounds = JSON.stringify(rect.toJSON())
      if (window.localeDialogBounds !== bounds) {
        window.localeDialogBounds = bounds
        window.localeDialogStableSince = performance.now()
      }
      return performance.now() - window.localeDialogStableSince > 600
    },
    null,
    { polling: 100, timeout: 10000 },
  )
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4300', { timeout: 120000 })
  await page.waitForFunction(() => window.univerAPI && document.querySelector('[data-ready="true"]'), null, {
    timeout: 90000,
  })
  if (name === 'kestrel' || name === 'meridian') await page.getByText('Brief', { exact: true }).click()
  await page.evaluate(() => {
    window.localeOwner = window.univerAPI
  })
  const snapshot = () => page.evaluate((id) => window.univerAPI.getDocument(id).save(), unitId)
  const before = await snapshot()
  for (const [locale, code] of [
    ['en-US', 'enUS'],
    ['zh-CN', 'zhCN'],
  ]) {
    await page.evaluate((value) => window.univerAPI.setLocale(value), code)
    const expected = {}
    for (const packageName of ['docs-formula-ui', 'shape-editor-ui', 'embed-unit-ui']) {
      expected[packageName] = (await import('@univerjs-pro/' + packageName + '/locale/' + locale)).default[packageName]
    }
    const actual = await page.evaluate(() => window.univerAPI.getLocales())
    // Compare every supplied leaf, not just the reported Edit formula label.
    for (const [key, pack] of Object.entries(expected)) includesPack(actual[key], pack, key)
    const labels = expected['shape-editor-ui'].formulaBinding
    const menu = expected['docs-formula-ui'].menu
    assert.equal(
      await page.evaluate(async (id) => {
        const api = window.univerAPI
        const rangeId = api.getDocument(id).getFormulas()[0].getId()
        return api.executeCommand('docs-formula.operation.open-editor', { unitId: id, rangeId })
      }, unitId),
      true,
    )
    await page.getByRole('button', { name: labels.confirm, exact: true }).waitFor()
    await settleDialog()
    await page.getByRole('dialog').last().locator('canvas').first().waitFor()
    report.dialogBounds.push(
      await page
        .getByRole('dialog')
        .last()
        .evaluate((element, selectedLocale) => {
          const rect = element.getBoundingClientRect()
          return {
            locale: selectedLocale,
            rect: rect.toJSON(),
            viewport: { width: innerWidth, height: innerHeight },
            fitsViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
          }
        }, locale),
    )
    assert.ok(report.dialogBounds.at(-1).fitsViewport, 'Stable desktop formula dialog fits the viewport')
    await noVisibleKeys()
    await page.screenshot({ path: path.join(directory, locale + '-editor.png') })
    let numberFormatChecked = false
    try {
      await page.getByRole('button', { name: labels.numberFormat, exact: true }).click({ timeout: 5000 })
      await page.getByText(labels.formats.more, { exact: true }).click()
      await page.getByText(labels.formatTypes, { exact: true }).waitFor()
      await settleDialog()
      await noVisibleKeys()
      await page.screenshot({ path: path.join(directory, locale + '-number-format.png') })
      await page.getByRole('button', { name: labels.cancel, exact: true }).last().click()
      numberFormatChecked = true
    } catch (error) {
      report.interactionFailures.push({ locale, action: 'number-format', failure: error.message })
      await page.screenshot({ path: path.join(directory, locale + '-number-format-failure.png') })
    }
    // The native close operation restores the formula selection; open its real action toolbar.
    assert.equal(await page.evaluate(() => window.univerAPI.executeCommand('docs-formula.operation.close-popup')), true)
    assert.equal(
      await page.evaluate(() => window.univerAPI.executeCommand('docs-formula.operation.open-selected-hover')),
      true,
    )
    await page.getByRole('button', { name: menu.edit, exact: true }).waitFor()
    for (const label of [menu.edit, menu.numberFormat, menu.convertToText, menu.delete])
      assert.equal(await page.getByRole('button', { name: label, exact: true }).count(), 1)
    await noVisibleKeys()
    await page.screenshot({ path: path.join(directory, locale + '-actions.png') })
    await page.getByRole('button', { name: menu.edit, exact: true }).click()
    await page.getByRole('button', { name: labels.confirm, exact: true }).waitFor()
    await noVisibleKeys()
    await page.getByRole('button', { name: labels.cancel, exact: true }).click()
    assert.deepEqual(await snapshot(), before, 'Locale changes and cancelled dialogs preserve the entire document')
    assert.equal(await page.evaluate(() => window.localeOwner === window.univerAPI), true)
    report.checks.push({
      locale,
      officialPacks: 3,
      nativeEditButton: true,
      editor: true,
      numberFormat: numberFormatChecked,
      preservedOwnerAndDocument: true,
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = report.interactionFailures.length === 0
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
