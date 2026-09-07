/* eslint-disable no-await-in-loop -- Each locale owns one editor and theme sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4286'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-base-traditional-block-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/bases-in-traditional-docs-block/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
]
assert.equal(examples.length, 2)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Bases in Traditional Docs / Evidence Review', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Bases 嵌入传统文档 / 证据评审', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(`${origin}/${locale}/showcase/embed/bases-in-traditional-docs-block`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const root = page.frameLocator('iframe').first().locator('.rowan-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.ok(frame)
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    assert.equal(
      await frame
        .locator('[data-u-comp="workbench-layout"]')
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    for (const example of examples) await frame.evaluate(example[1])
    await frame.waitForFunction(
      () =>
        window.univerAPI
          .getBase('rowan-station-evidence')
          .getTableById('evidence')
          .getRecordById('evidence-1')
          .getValue('title') === 'Calibration source and trace',
    )
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            host: window.univerAPI.getDocument('rowan-readiness-review').save(),
            child: window.univerAPI.getBase('rowan-station-evidence').save(),
          }),
        ),
      )
    const before = await read()
    assert.equal(before.host.documentStyle.documentFlavor, 1)
    assert.ok(before.host.body.dataStream.includes('Evidence before deployment. Revised.'))
    assert.equal(await frame.locator('[data-u-comp="embed-docs-custom-block"]').count(), 1)
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      assert.deepEqual(await read(), before)
    }
    await root.screenshot({ path: path.join(directory, `${locale}.png`) })
    report.checks.push({
      locale,
      redundantGuideCardRemoved: true,
      traditionalDocBlock: true,
      officialWhiteWorkbench: true,
      themePreservesOwnerAndEditedSnapshots: true,
    })
    assert.deepEqual(report.errors, [])
  }
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS Rowan EN/ZH preview and theme preservation')
