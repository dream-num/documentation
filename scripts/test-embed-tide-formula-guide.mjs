/* eslint-disable no-await-in-loop -- Each locale owns its demo and ordered published examples. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-tide-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheet-to-chart/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 7)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Tide / Channel Comparison', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Tide / 渠道对比', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4314') + '/' + locale + '/showcase/embed/sheet-to-chart',
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
      .locator('.tide-channel-formula[data-ready=true]')
      .waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.tide-channel-formula[data-ready=true]')
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    const scenarios = [
      [
        [120, 140],
        [210, 160],
        [90, 100],
      ],
      [
        [120, 140],
        [210, 230],
        [90, 100],
      ],
      [
        [0, 140],
        [210, 230],
        [90, 100],
      ],
      [
        [0, 140],
        [0, 230],
        [0, 100],
      ],
      [
        [120, 140],
        [180, 160],
        [90, 100],
      ],
    ]
    for (const [i, expected] of scenarios.entries()) {
      await frame.evaluate(examples[i])
      await frame.waitForFunction((target) => {
        const sheet = window.univerAPI.getWorkbook('tide-channel-comparison').getSheetBySheetId('comparison')
        return JSON.stringify(sheet.getRange('B5:C7').getRawValues()) === JSON.stringify(target)
      }, expected)
      if (i === 3)
        assert.deepEqual(
          await frame.evaluate(() =>
            window.univerAPI
              .getWorkbook('tide-channel-comparison')
              .getSheetBySheetId('comparison')
              .getRange('D5:D7')
              .getRawValues(),
          ),
          [['#DIV/0!'], ['#DIV/0!'], ['#DIV/0!']],
        )
    }
    await frame.evaluate(examples[5])
    const [download] = await Promise.all([page.waitForEvent('download'), frame.evaluate(examples[6])])
    await download.saveAs(path.join(directory, locale + '-chart.png'))
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            source: window.univerAPI.getWorkbook('tide-channel-source').save(),
            host: window.univerAPI.getWorkbook('tide-channel-comparison').save(),
            chart: window.univerAPI
              .getWorkbook('tide-channel-comparison')
              .getSheetBySheetId('comparison')
              .getCharts()[0]
              .getInfo(),
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
      literalExamples: 7,
      nativeChartDownload: true,
      themeOwnerAndBothModelsPreserved: true,
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
