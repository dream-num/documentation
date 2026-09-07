/* eslint-disable no-await-in-loop -- Each language owns one native workspace. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-mixed-slides-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-in-slides/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 5)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Beacon / Complete Executive Review', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Beacon / 完整试点评审', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4298') + '/' + locale + '/showcase/embed/mixed-in-slides',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const root = page.frameLocator('iframe').first().locator('.beacon-review-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    await frame.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
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
    for (const [index, code] of examples.entries()) {
      const pageId = [
        'economics',
        'beacon-review-doc-page',
        'beacon-review-base-page',
        'beacon-review-board-page',
        'cover',
      ][index]
      await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + pageId + '"]').click()
      if (index === 0) {
        const child = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="beacon-review-sheet-float"]')
        await child.waitFor()
        await child.dblclick({ position: { x: 180, y: 110 } })
        await frame.waitForFunction(
          () =>
            document
              .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="beacon-review-sheet-float"]')
              ?.getAttribute('data-embed-float-stage') === 'stage2',
        )
      }
      await frame.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      await frame.evaluate(code)
    }
    await frame.waitForFunction(
      () =>
        window.univerAPI
          .getWorkbook('beacon-repair-costs')
          .getSheetByName('Pilot costs')
          .getRange('D16')
          .getRawValue() === 7918,
    )
    const read = () =>
      frame.evaluate(() => {
        const a = window.univerAPI
        return JSON.parse(
          JSON.stringify({
            host: a.getPresentation('beacon-repair-review').save(),
            sheet: a.getWorkbook('beacon-repair-costs').save(),
            docs: a.getDocument('beacon-repair-memo').save(),
            base: a.getBase('beacon-repair-readiness').save(),
            board: a.getBoard('beacon-repair-delivery').save(),
          }),
        )
      })
    const before = await read()
    assert.ok(before.docs.body.dataStream.includes('/ Revised'))
    assert.equal(
      await frame.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'beacon-repair-review' }).length),
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
      for (const key of ['host', 'sheet', 'docs', 'base'])
        assert.deepEqual(after[key], before[key], key + ' survives theme')
      assert.equal(after.board.theme.id, before.board.theme.id)
      assert.deepEqual({ ...after.board, theme: before.board.theme }, before.board)
    }
    await root.screenshot({ path: path.join(directory, locale + '.png') })
    report.checks.push({
      locale,
      redundantGuideCardRemoved: true,
      literalExamples: 5,
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
console.log('PASS Beacon mixed EN/ZH guide and theme checks')
