/* eslint-disable no-await-in-loop -- Each locale owns its own demo and ordered edits. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-lumen-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheet-to-slides-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 10)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Lumen / Launch Economics', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Lumen / 首发定价模型', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4320') +
        '/' +
        locale +
        '/showcase/embed/sheet-to-slides-float',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    await page
      .frameLocator('iframe')
      .first()
      .locator('.lumen-launch-embed[data-ready=true]')
      .waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.lumen-launch-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    const specs = [
      ['pricing', 'revenue'],
      ['pricing', 'units'],
      ['economics', 'variable'],
      ['economics', 'fixed'],
      ['economics', 'contribution'],
      ['economics', 'margin'],
      ['decision', 'breakeven'],
      ['decision', 'headroom'],
      ['decision', 'revenue-repeat'],
    ]
    const baseline = [10800, 240, 4320, 3600, 2880, 2880 / 10800, 134, 106, 10800]
    const scenarios = [
      [11520, 240, 4320, 3600, 3600, 0.3125, 120, 120, 11520],
      [11520, 240, 4800, 3600, 3120, 3120 / 11520, 129, 111, 11520],
      [11520, 240, 4800, 4200, 2520, 0.21875, 150, 90, 11520],
      [8640, 180, 3600, 4200, 840, 840 / 8640, 150, 30, 8640],
      [0, 0, 0, 4200, -4200, '#DIV/0!', 150, -150, 0],
      [0, null, 0, 4200, -4200, '#DIV/0!', 150, -150, 0],
      ['#VALUE!', 'pending', '#VALUE!', 4200, '#VALUE!', '#VALUE!', 150, '#VALUE!', '#VALUE!'],
      baseline,
      [4320, 240, 4320, 3600, -3600, -3600 / 4320, '#DIV/0!', '#DIV/0!', 4320],
      baseline,
    ]
    for (const [index, code] of examples.entries()) {
      await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="pricing"]').click()
      await frame.evaluate(code)
      await frame.waitForFunction(
        ({ entries, wanted }) =>
          entries.every(([p, id], i) => {
            const r = window.univerAPI
              .getPresentation('lumen-launch-deck')
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
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            sheet: window.univerAPI.getWorkbook('lumen-pricing-model').save(),
            slides: window.univerAPI.getPresentation('lumen-launch-deck').save(),
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
      literalExamples: 10,
      formulaOutputs: 9,
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
