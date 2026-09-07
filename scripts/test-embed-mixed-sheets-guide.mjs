/* eslint-disable no-await-in-loop -- Each language owns one native workspace. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-mixed-sheets-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-in-sheets/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 4)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Harbor / Operations Decision Room', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Harbor / 运营决策工作台', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4292') + '/' + locale + '/showcase/embed/mixed-in-sheets',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const root = page.frameLocator('iframe').first().locator('.harbor-room-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    for (const name of ['Decision memo', 'Supplier operations', 'Delivery workflow', 'Pilot budget']) {
      await frame.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name }).click()
      await frame.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    }
    assert.equal(
      await frame
        .locator('[data-u-comp="workbench-layout"]')
        .first()
        .evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    for (const code of examples) await frame.evaluate(code)
    await frame.waitForFunction(
      () =>
        window.univerAPI
          .getWorkbook('harbor-room-budget')
          .getSheetByName('Pilot budget')
          .getRange('D16')
          .getRawValue() === 7528.4,
    )
    const read = () =>
      frame.evaluate(() => {
        const a = window.univerAPI
        return JSON.parse(
          JSON.stringify({
            host: a.getWorkbook('harbor-room-budget').save(),
            docs: a.getDocument('harbor-room-rationale').save(),
            slides: a.getPresentation('harbor-room-briefing').save(),
            base: a.getBase('harbor-room-suppliers').save(),
            board: a.getBoard('harbor-room-workflow').save(),
          }),
        )
      })
    const before = await read()
    assert.ok(before.docs.body.dataStream.includes('Revised.'))
    assert.equal(
      await frame.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'harbor-room-budget' }).length),
      4,
    )
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      const after = await read()
      for (const key of ['host', 'docs', 'slides', 'base'])
        assert.deepEqual(after[key], before[key], key + ' survives theme')
      assert.equal(after.board.theme.id, before.board.theme.id)
      assert.deepEqual({ ...after.board, theme: before.board.theme }, before.board)
    }
    await root.screenshot({ path: path.join(directory, locale + '.png') })
    report.checks.push({
      locale,
      redundantGuideCardRemoved: true,
      literalExamples: 4,
      nativeEmbeds: 4,
      ownerAndFiveModelsPreserved: true,
    })
    assert.deepEqual(report.errors, [])
  }
  report.passed = true
} catch (e) {
  report.failure = e.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS Harbor mixed EN/ZH guide and theme checks')
