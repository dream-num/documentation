/* eslint-disable no-await-in-loop -- Each locale owns its own demo and ordered edits. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-solstice-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/slides-in-sheets-formula-tab/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 6)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Solstice / Scenario Review Deck', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Solstice / 多情景复盘演示', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4308') +
        '/' +
        locale +
        '/showcase/embed/slides-in-sheets-formula-tab',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    await page.frameLocator('iframe').first().locator('.solstice-embed[data-ready=true]').waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.solstice-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    for (const [i, code] of examples.entries()) {
      await frame.evaluate(code)
      await frame.waitForFunction(
        ({ price, unitCost, expanded }) => {
          const deck = window.univerAPI.getPresentation('solstice-scenario-deck')
          return ['conservative', 'baseline', 'expanded'].every((p, index) => {
            const q = [80, 100, expanded][index]
            const expected = {
              volume: q,
              revenue: q * price,
              contribution: q * (price - unitCost) - 600,
              margin: price === 0 ? '#DIV/0!' : (q * (price - unitCost) - 600) / (q * price),
            }
            return Object.entries(expected).every(([id, v]) => {
              const r = deck.getSlideById(p).getShape(id).getFormulaResult()
              return r && !r.stale && (typeof v === 'string' ? r.value === v : Math.abs(r.value - v) < 1e-9)
            })
          })
        },
        {
          price: [35, 35, 35, 0, 35, 32][i],
          unitCost: [18, 18, 20, 20, 20, 18][i],
          expanded: [125, 140, 140, 140, 140, 125][i],
        },
      )
    }
    await root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Scenario deck' }).click()
    await root.locator('[data-embed-sheets-sheet-tab-host]').waitFor()
    assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 3)
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            sheet: window.univerAPI.getWorkbook('solstice-scenario-model').save(),
            slides: window.univerAPI.getPresentation('solstice-scenario-deck').save(),
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
      literalExamples: 6,
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
