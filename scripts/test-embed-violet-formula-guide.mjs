/* eslint-disable no-await-in-loop -- Each locale owns its own demo and ordered edits. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-violet-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-to-slides-tab/README.md', 'utf8')).matchAll(
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
    ['en-US', 'Violet / Editorial Review'],
    ['zh-CN', 'Violet / 编辑选题复盘'],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4324') +
        '/' +
        locale +
        '/showcase/embed/base-to-slides-tab',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of ['What it demonstrates', '功能说明', 'Variants', '变体', 'Expected result', '预期结果'])
      assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    await page.frameLocator('iframe').first().locator('.violet-embed[data-ready=true]').waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.violet-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    const specs = [
      ['overview', 'ready'],
      ['overview', 'total'],
      ['overview', 'count-rate'],
      ['overview', 'word-rate'],
      ['sections', 'guides-ready'],
      ['sections', 'guides-total'],
      ['sections', 'essays-ready'],
      ['sections', 'essays-total'],
      ['sections', 'interviews-ready'],
      ['sections', 'interviews-total'],
      ['decision', 'ready-repeat'],
      ['decision', 'unfinished'],
      ['decision', 'signal'],
    ]
    const scenarios = [
      [6, 8, 0.75, 0.7560975609756098, 1900, 2700, 3200, 3200, 1100, 2300, 6, 2000, 'Resolve blockers'],
      [6, 8, 0.75, 0.7619047619047619, 1900, 2700, 3400, 3400, 1100, 2300, 6, 2000, 'Resolve blockers'],
      [6, 8, 0.75, 0.7619047619047619, 1900, 2700, 3400, 3400, 1100, 2300, 6, 2000, 'Review the mix'],
      [6, 8, 0.75, 0.7333333333333333, 1000, 1800, 3400, 3400, 1100, 2300, 6, 2000, 'Review the mix'],
      [6, 8, 0.75, 0.7333333333333333, 1000, 1800, 3400, 3400, 1100, 2300, 6, 2000, 'Review the mix'],
      [5, 8, 0.625, 0.5365853658536586, 1900, 2700, 1400, 3200, 1100, 2300, 5, 3800, 'Resolve blockers'],
      [5, 8, 0.625, 0.5365853658536586, 1900, 2700, 1400, 3200, 1100, 2300, 5, 3800, 'Resolve blockers'],
      [5, 8, 0.625, 0.5365853658536586, 1900, 2700, 1400, 3200, 1100, 2300, 5, 3800, 'Resolve blockers'],
      [5, 8, 0.625, 0.5176470588235295, 1900, 2700, 1400, 3200, 1100, 2600, 5, 4100, 'Resolve blockers'],
      [5, 8, 0.625, 0.5176470588235295, 1900, 2700, 1400, 3200, 1100, 2600, 5, 4100, 'Resolve blockers'],
      [5, 8, 0.625, '#DIV/0!', 0, 0, 0, 0, 0, 0, 5, 0, 'Resolve blockers'],
      [5, 8, 0.625, 0.5365853658536586, 1900, 2700, 1400, 3200, 1100, 2300, 5, 3800, 'Resolve blockers'],
    ]
    for (const [index, code] of examples.entries()) {
      await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="violet-launch-workstream-page"]').click()
      await frame.locator('[data-embed-slides-page-list-host]').waitFor()
      await frame.evaluate(code)
      await frame.waitForFunction(
        ({ entries, wanted }) =>
          entries.every(([p, id], i) => {
            const r = window.univerAPI
              .getPresentation('violet-editorial-deck')
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
            sheet: window.univerAPI.getBase('violet-editorial-register').save(),
            slides: window.univerAPI.getPresentation('violet-editorial-deck').save(),
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
