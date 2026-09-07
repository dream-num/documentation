/* eslint-disable no-await-in-loop -- Each locale owns one isolated demo. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-cross-unit-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/cross-unit-formula/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 6)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, colorScheme: 'light' })
const report = {
  passed: false,
  checks: [],
  errors: [],
  scope:
    'Guide, six explicit-ID formula examples and theme ownership only; native source input remains a separate failing gate.',
}
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Harbor / Fare Sensitivity', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Harbor / 票价敏感性分析', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4304') +
        '/' +
        locale +
        '/showcase/embed/cross-unit-formula',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.harbor-fare-formula[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    for (const [i, code] of examples.entries()) {
      await frame.evaluate(code)
      await frame.waitForFunction(
        ({ i: index, expected }) =>
          window.univerAPI
            .getWorkbook('harbor-fare-budget')
            .getSheetByName(index < 4 ? 'Budget' : 'Reference lab')
            .getRange(index < 4 ? 'D15' : index === 4 ? 'B8' : 'B5')
            .getRawValue() === expected,
        { i, expected: [1003.5, 1084.5, '#VALUE!', 1084.5, 4.5, 7][i] },
      )
    }
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify(['budget', 'source'].map((id) => window.univerAPI.getWorkbook('harbor-fare-' + id).save())),
        ),
      )
    const before = await read()
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      assert.deepEqual(await read(), before)
    }
    assert.equal(
      await root
        .locator('[data-u-comp="workbench-layout"]')
        .first()
        .evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await root.screenshot({ path: path.join(directory, locale + '.png') })
    report.checks.push({
      locale,
      redundantGuideCardRemoved: true,
      literalExamples: 6,
      ownerAndTwoModelsPreserved: true,
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
