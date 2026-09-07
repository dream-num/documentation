/* eslint-disable no-await-in-loop -- Each locale owns its own demo and ordered edits. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-nova-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheet-to-slides-tab/README.md', 'utf8')).matchAll(
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
  for (const [locale, title] of [
    ['en-US', 'Nova / Live Operating Deck'],
    ['zh-CN', 'Nova / 实时经营演示'],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4322') +
        '/' +
        locale +
        '/showcase/embed/sheet-to-slides-tab',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of ['What it demonstrates', '功能说明', 'Variants', '变体', 'Expected result', '预期结果'])
      assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    await page.frameLocator('iframe').first().locator('.nova-embed[data-ready=true]').waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.nova-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    const specs = [
      ['overview', 'actual'],
      ['overview', 'target'],
      ['overview', 'attainment'],
      ['overview', 'variance'],
      ['channels', 'retail-actual'],
      ['channels', 'retail-rate'],
      ['channels', 'partners-actual'],
      ['channels', 'partners-rate'],
      ['channels', 'online-actual'],
      ['channels', 'online-rate'],
      ['decision', 'attainment-repeat'],
      ['decision', 'largest-gap'],
      ['decision', 'below-target'],
    ]
    const scenarios = [
      [77000, 70000, 1.1, 7000, 35000, 1.1666666666666667, 27500, 1.1, 14500, 0.9666666666666667, 1.1, 5000, 1],
      [
        77000, 72000, 1.0694444444444444, 5000, 35000, 1.09375, 27500, 1.1, 14500, 0.9666666666666667,
        1.0694444444444444, 3000, 1,
      ],
      [80500, 72000, 1.1180555555555556, 8500, 35000, 1.09375, 27500, 1.1, 18000, 1.2, 1.1180555555555556, 3000, 0],
      [53000, 72000, 0.7361111111111112, -19000, 35000, 1.09375, 0, 0, 18000, 1.2, 0.7361111111111112, 3000, 1],
      [53000, 72000, 0.7361111111111112, -19000, 35000, 1.09375, null, 0, 18000, 1.2, 0.7361111111111112, 3000, 1],
      [
        53000,
        72000,
        0.7361111111111112,
        -19000,
        35000,
        1.09375,
        'pending',
        '#VALUE!',
        18000,
        1.2,
        0.7361111111111112,
        '#VALUE!',
        0,
      ],
      [73500, 70000, 1.05, 3500, 31500, 1.05, 27500, 1.1, 14500, 0.9666666666666667, 1.05, 2500, 1],
      [73500, 40000, 1.8375, 33500, 31500, '#DIV/0!', 27500, 1.1, 14500, 0.9666666666666667, 1.8375, 31500, 1],
      [73500, 0, '#DIV/0!', 73500, 31500, '#DIV/0!', 27500, '#DIV/0!', 14500, '#DIV/0!', '#DIV/0!', 31500, 0],
      [73500, 70000, 1.05, 3500, 31500, 1.05, 27500, 1.1, 14500, 0.9666666666666667, 1.05, 2500, 1],
    ]
    for (const [index, code] of examples.entries()) {
      await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="nova-operating-source-page"]').click()
      await frame.locator('[data-embed-slides-page-list-host]').waitFor()
      await frame.evaluate(code)
      await frame.waitForFunction(
        ({ entries, wanted }) =>
          entries.every(([p, id], i) => {
            const r = window.univerAPI
              .getPresentation('nova-operating-deck')
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
    assert.equal(await root.locator('[data-u-comp="embed-float-dom"]').count(), 0)
    assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 4)
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            sheet: window.univerAPI.getWorkbook('nova-channel-model').save(),
            slides: window.univerAPI.getPresentation('nova-operating-deck').save(),
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
      formulaOutputs: 13,
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
