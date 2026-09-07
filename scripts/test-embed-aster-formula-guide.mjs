/* eslint-disable no-await-in-loop -- Each locale owns its own demo and ordered edits. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-aster-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheet-to-traditional-doc/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 9)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Aster / Research Results', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Aster / 研究结果报告', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4318') +
        '/' +
        locale +
        '/showcase/embed/sheet-to-traditional-doc',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    await page.frameLocator('iframe').first().locator('.aster-embed[data-ready=true]').waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.aster-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    const baseline = [5, 42.5, 8.5, 8.5, 7.5, 9.5, 8.5, 0.6, 8.5, 0]
    const scenarios = [
      [5, 45, 9, 9, 8, 10, 8.5, 0.8, 9, 0.5],
      [5, 45, 9, 9, 8, 10, 9, 0.6, 9, 0],
      [4, 37, 9.25, 9.25, 8.5, 10, 9, 0.75, 9.25, 0.25],
      [5, 37, 7.4, 9, 0, 10, 9, 0.6, 7.4, -1.6],
      [4, 37, 9.25, 9.25, 8.5, 10, 9, 0.75, 9.25, 0.25],
      [0, 0, '#DIV/0!', '#NUM!', 0, 0, 9, '#DIV/0!', '#DIV/0!', '#DIV/0!'],
      baseline,
      baseline,
      baseline,
    ]
    for (const [index, code] of examples.entries()) {
      await frame.evaluate(code)
      await frame.waitForFunction((expected) => {
        const actual = window.univerAPI
          .getDocument('aster-research-report')
          .getFormulas()
          .map((f) => f.getResult())
        return (
          actual.length === 10 &&
          actual.every(
            (r, i) =>
              r &&
              !r.stale &&
              (typeof expected[i] === 'number'
                ? r.status === 'success' && Math.abs(r.value - expected[i]) < 1e-9
                : r.value === expected[i]),
          )
        )
      }, scenarios[index])
    }
    assert.equal(await root.locator('[data-u-comp="embed-float-dom"]').count(), 1)
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            sheet: window.univerAPI.getWorkbook('aster-observation-source').save(),
            doc: window.univerAPI.getDocument('aster-research-report').save(),
          }),
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
      literalExamples: 9,
      formulaOutputs: 10,
      ownerAndModelsPreserved: true,
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
