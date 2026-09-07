/* eslint-disable no-await-in-loop -- Each locale owns its own demo and ordered edits. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-flint-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-to-boards-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 13)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [], failedResponses: [] }
page.on('response', (response) => {
  if (response.status() >= 400) report.failedResponses.push({ url: response.url(), status: response.status() })
})
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Flint / Delivery Control Room', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Flint / 交付控制室', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4316') +
        '/' +
        locale +
        '/showcase/embed/base-to-boards-float',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    await page.frameLocator('iframe').first().locator('.flint-embed[data-ready=true]').waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.flint-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    for (const [i, code] of examples.entries()) {
      await frame.evaluate(code)
      const baseline = [25, 3, 2, 0.4, 12, 8, 5, 35, 'Unblock first']
      const scenarios = [
        [17, 2, 1, 0.6, 12, 0, 5, 35, 'Unblock first'],
        [17, 2, 1, 0.6, 12, 0, 5, 47, 'Unblock first'],
        [17, 2, 0, 0.6, 12, 0, 5, 47, 'Review next step'],
        [23, 2, 0, 0.6, 18, 0, 5, 53, 'Review next step'],
        [5, 2, 0, 0.6, 0, 0, 5, 35, 'Review next step'],
        [0, 2, 0, 0.6, 0, 0, 0, 30, 'Review next step'],
        baseline,
        baseline,
        baseline,
        baseline,
        baseline,
        [31, 3, 2, 0.4, 18, 8, 5, 41, 'Unblock first'],
        [31, 3, 2, 0.4, 18, 8, 5, 41, 'Unblock first'],
      ]
      await frame.waitForFunction((expected) => {
        const ids = [
          'remaining',
          'open',
          'blocked',
          'completion',
          'content-remaining',
          'build-remaining',
          'access-remaining',
          'retained',
          'signal',
        ]
        return ids.every((id, index) => {
          const r = window.univerAPI.getBoard('flint-delivery-control').getShape(id).getFormulaResult()
          const v = expected[index]
          return r && !r.stale && (typeof v === 'number' ? Math.abs(r.value - v) < 1e-9 : r.value === v)
        })
      }, scenarios[i])
      if (i >= 9) {
        const projection = await frame.evaluate(() =>
          window.univerAPI
            .getBase('flint-delivery-register')
            .getTableById('tasks')
            .getViewById('tasks-grid')
            .getProjection(),
        )
        assert.equal(projection.rows.length, [5, 2, 2, 5][i - 9])
      }
    }
    assert.equal(await root.locator('[data-u-comp="embed-float-dom"]').count(), 1)
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            sheet: window.univerAPI.getBase('flint-delivery-register').save(),
            board: window.univerAPI.getBoard('flint-delivery-control').save(),
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
      const actual = await read()
      assert.deepEqual(actual.sheet, before.sheet)
      assert.equal(actual.board.theme.id, before.board.theme.id)
      assert.deepEqual({ ...actual.board, theme: before.board.theme }, before.board)
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
      literalExamples: 13,
      formulaOutputs: 9,
      ownerAndModelsPreservedExceptNativePalette: true,
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
