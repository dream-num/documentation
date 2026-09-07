/* eslint-disable no-await-in-loop -- Each locale owns its own demo and ordered edits. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-atlas-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/slides-in-sheets-formula-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 5)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Atlas / Floating Quote Decision', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Atlas / 浮动报价决策', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4306') +
        '/' +
        locale +
        '/showcase/embed/slides-in-sheets-formula-float',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.atlas-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    for (const [i, code] of examples.entries()) {
      await frame.evaluate(code)
      await frame.waitForFunction(
        ({ quote, cost, margin }) => {
          const deck = window.univerAPI.getPresentation('atlas-quote-decision')
          return [
            ['decision', 'quote-value', quote],
            ['decision', 'cost-value', cost],
            ['decision', 'contribution-value', quote - cost],
            ['decision', 'margin-value', margin],
            ['review', 'review-cost', cost],
            ['review', 'review-margin', margin],
          ].every(([p, id, v]) => {
            const r = deck.getSlideById(p).getShape(id).getFormulaResult()
            return r && !r.stale && (typeof v === 'string' ? r.value === v : Math.abs(r.value - v) < 1e-9)
          })
        },
        {
          quote: [12000, 13200, 0, 12000, 12000][i],
          cost: [9000, 9000, 9000, 9000, 8400][i],
          margin: [0.25, 4200 / 13200, '#DIV/0!', 0.25, 0.3][i],
        },
      )
    }
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            sheet: window.univerAPI.getWorkbook('atlas-quote-model').save(),
            slides: window.univerAPI.getPresentation('atlas-quote-decision').save(),
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
      literalExamples: 5,
      formulaOutputs: 6,
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
