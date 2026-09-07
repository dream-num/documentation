/* eslint-disable no-await-in-loop -- Each language owns one native workspace. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-mixed-bases-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-in-bases/README.md', 'utf8')).matchAll(
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
    ['en-US', 'Acorn / Complete Operating Workspace', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Acorn / 完整运营工作区', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4300') + '/' + locale + '/showcase/embed/mixed-in-bases',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const root = page.frameLocator('iframe').first().locator('.acorn-workspace-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
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
      const tabName = ['Weighted forecast', 'Delivery playbook', 'Studio review', 'Service blueprint', 'Follow-ups'][
        index
      ]
      await root.getByText(tabName, { exact: true }).click()
      if (index < 4) await root.locator('[data-embed-bases-table-list-host]').filter({ visible: true }).waitFor()
      await frame.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      await frame.evaluate(code)
    }
    await frame.waitForFunction(
      () =>
        window.univerAPI
          .getWorkbook('acorn-studio-forecast')
          .getSheetByName('Forecast')
          .getRange('E15')
          .getRawValue() === 231000,
    )
    const read = () =>
      frame.evaluate(() => {
        const a = window.univerAPI
        return JSON.parse(
          JSON.stringify({
            host: a.getBase('acorn-studio-operations').save(),
            sheet: a.getWorkbook('acorn-studio-forecast').save(),
            docs: a.getDocument('acorn-studio-playbook').save(),
            slides: a.getPresentation('acorn-studio-review').save(),
            board: a.getBoard('acorn-studio-workflow').save(),
          }),
        )
      })
    const before = await read()
    assert.ok(before.docs.body.dataStream.includes('/ Revised'))
    assert.equal(
      await frame.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'acorn-studio-operations' }).length),
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
      for (const key of ['host', 'sheet', 'docs', 'slides'])
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
console.log('PASS Acorn mixed EN/ZH guide and theme checks')
