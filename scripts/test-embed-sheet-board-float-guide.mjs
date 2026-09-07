/* eslint-disable no-await-in-loop -- Each locale owns one live editor and theme sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4276'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-board-float-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheets-in-boards-float/README.md', 'utf8')).matchAll(
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
    ['en-US', 'Sheets in Boards / Workshop Budget', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Sheets 嵌入 Boards / 工作坊预算', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(`${origin}/${locale}/showcase/embed/sheets-in-boards-float`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const root = page.frameLocator('iframe').first().locator('.ripple-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.ok(frame)
    const child = root.locator('[data-u-comp="embed-float-dom"]')
    await child.dblclick({ position: { x: 220, y: 130 } })
    await frame.waitForFunction(
      () =>
        document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
    )
    assert.equal(await root.locator('fieldset,[data-action]').count(), 0)
    // The native interaction wrapper is deliberately transparent; the live canvas owns the surface.
    assert.equal(
      await child
        .locator('[data-u-comp="embed-float-dom-live-canvas"]')
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
          .getWorkbook('ripple-workshop-budget')
          .getSheetBySheetId('budget')
          .getRange('E16')
          .getRawValue() === 1695.1,
    )
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            host: window.univerAPI.getBoard('ripple-repair-workshop').save(),
            child: window.univerAPI.getWorkbook('ripple-workshop-budget').save(),
          }),
        ),
      )
    const before = await read()
    assert.equal(before.host.pages.planning.elementOrder.length, 10)
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      const actual = await read()
      assert.equal(actual.host.theme.id, before.host.theme.id)
      assert.deepEqual({ ...actual.host, theme: before.host.theme }, before.host)
      assert.deepEqual(actual.child, before.child)
    }
    await root.screenshot({ path: path.join(directory, `${locale}.png`) })
    report.checks.push({
      locale,
      redundantGuideCardRemoved: true,
      nativeBoardFloating: true,
      whiteChildCSS: true,
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
console.log('PASS Ripple EN/ZH native preview and theme preservation')
