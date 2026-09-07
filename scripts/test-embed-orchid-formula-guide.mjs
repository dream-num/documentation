/* eslint-disable no-await-in-loop -- Each locale owns its own demo and ordered edits. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-orchid-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-to-slides-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 12)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title] of [
    ['en-US', 'Orchid / Pipeline Review'],
    ['zh-CN', 'Orchid / 商机预测复盘'],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4326') +
        '/' +
        locale +
        '/showcase/embed/base-to-slides-float',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of ['What it demonstrates', '功能说明', 'Variants', '变体', 'Expected result', '预期结果'])
      assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    await page.frameLocator('iframe').first().locator('.orchid-embed[data-ready=true]').waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.orchid-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    const specs = [
      ['pipeline', 'nominal'],
      ['pipeline', 'weighted'],
      ['forecast', 'nominal'],
      ['forecast', 'weighted'],
      ['forecast', 'coverage'],
      ['forecast', 'gap'],
      ['review', 'discovery'],
      ['review', 'proposal'],
      ['review', 'negotiation'],
      ['review', 'active'],
      ['review', 'weighted'],
      ['review', 'signal'],
    ]
    const scenarios = [
      [84000, 27000, 84000, 27000, 0.32142857142857145, 57000, 18000, 36000, 30000, 3, 27000, 'Develop the pipeline'],
      [84000, 30000, 84000, 30000, 0.35714285714285715, 54000, 18000, 36000, 30000, 3, 30000, 'Coverage improved'],
      [84000, 30000, 84000, 30000, 0.35714285714285715, 54000, 8000, 46000, 30000, 3, 30000, 'Coverage improved'],
      [84000, 23000, 84000, 23000, 0.27380952380952384, 61000, 8000, 46000, 30000, 2, 23000, 'Develop the pipeline'],
      [84000, 23000, 84000, 23000, 0.27380952380952384, 61000, 8000, 46000, 30000, 2, 23000, 'Develop the pipeline'],
      [80000, 25000, 80000, 25000, 0.3125, 55000, 18000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
      [80000, 25000, 80000, 25000, 0.3125, 55000, 18000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
      [80000, 25000, 80000, 25000, 0.3125, 55000, 18000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
      [82000, 25000, 82000, 25000, 0.3048780487804878, 57000, 20000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
      [82000, 25000, 82000, 25000, 0.3048780487804878, 57000, 20000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
      [0, 0, 0, 0, '#DIV/0!', 0, 0, 0, 0, 3, 0, 'Develop the pipeline'],
      [80000, 25000, 80000, 25000, 0.3125, 55000, 18000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
    ]
    for (const [index, code] of examples.entries()) {
      await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="pipeline"]').click()
      await frame.locator('[data-u-comp="embed-float-dom"][data-embed-id="orchid-base-float"]').waitFor()
      await frame
        .locator('[data-u-comp="embed-float-dom"][data-embed-id="orchid-base-float"]')
        .dblclick({ position: { x: 150, y: 95 } })
      await frame.waitForFunction(
        () =>
          document
            .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="orchid-base-float"]')
            ?.getAttribute('data-embed-float-stage') === 'stage2',
      )
      await frame.evaluate(code)
      await frame.waitForFunction(
        ({ entries, wanted }) =>
          entries.every(([p, id], i) => {
            const r = window.univerAPI
              .getPresentation('orchid-pipeline-deck')
              .getSlideById(p)
              .getShape(id)
              .getFormulaResult()
            const error = ['#DIV/0!', '#VALUE!'].includes(wanted[i])
            return (
              r &&
              !r.stale &&
              r.status === (error ? 'error' : 'success') &&
              (typeof wanted[i] === 'number'
                ? typeof r.value === 'number' && Math.abs(r.value - wanted[i]) < 1e-9
                : r.value === wanted[i])
            )
          }),
        { entries: specs, wanted: scenarios[index] },
      )
    }
    assert.equal(await root.locator('[data-u-comp="embed-float-dom"]').count(), 1)
    assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 3)
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            sheet: window.univerAPI.getBase('orchid-opportunity-register').save(),
            slides: window.univerAPI.getPresentation('orchid-pipeline-deck').save(),
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
      literalExamples: 12,
      formulaOutputs: 12,
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
