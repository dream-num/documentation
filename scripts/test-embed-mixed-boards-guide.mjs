/* eslint-disable no-await-in-loop -- Each language owns one native workspace. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-mixed-boards-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-in-boards/README.md', 'utf8')).matchAll(
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
    ['en-US', 'Ripple / Complete Planning Workshop', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Ripple / 完整共创工作坊', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4302') + '/' + locale + '/showcase/embed/mixed-in-boards',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const root = page.frameLocator('iframe').first().locator('.ripple-workshop-embed[data-ready=true]')
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
      const close = frame.locator('[data-embed-fullscreen-close="true"]')
      if (await close.isVisible()) await close.click()
      if (index < 4) {
        const kind = ['sheet', 'doc', 'slide', 'base'][index]
        await root
          .locator('[data-u-comp="embed-float-dom"][data-embed-id="ripple-workshop-' + kind + '-float"]')
          .dblclick({ position: { x: 160, y: 90 } })
        await frame
          .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="ripple-workshop-' + kind + '-float"]')
          .getByRole('button', { name: 'Enter fullscreen', exact: true })
          .click()
        await frame.locator('[data-embed-fullscreen-shell="true"]').waitFor()
      } else {
        await root.locator('[data-board-viewport-host="true"]').click({ position: { x: 50, y: 50 } })
      }
      await frame.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      await frame.evaluate(code)
    }
    await frame.waitForFunction(
      () =>
        window.univerAPI
          .getWorkbook('ripple-wayfinding-budget')
          .getSheetByName('Workshop budget')
          .getRange('D16')
          .getRawValue() === 1817.2,
    )
    const read = () =>
      frame.evaluate(() => {
        const a = window.univerAPI
        return JSON.parse(
          JSON.stringify({
            host: a.getBoard('ripple-wayfinding-workshop').save(),
            sheet: a.getWorkbook('ripple-wayfinding-budget').save(),
            docs: a.getDocument('ripple-wayfinding-agenda').save(),
            slides: a.getPresentation('ripple-wayfinding-review').save(),
            base: a.getBase('ripple-wayfinding-observations').save(),
          }),
        )
      })
    const before = await read()
    assert.ok(before.docs.body.dataStream.includes('/ Revised'))
    assert.equal(
      await frame.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'ripple-wayfinding-workshop' }).length),
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
      for (const key of ['base', 'sheet', 'docs', 'slides'])
        assert.deepEqual(after[key], before[key], key + ' survives theme')
      assert.equal(after.host.theme.id, before.host.theme.id)
      assert.deepEqual({ ...after.host, theme: before.host.theme }, before.host)
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
console.log('PASS Ripple mixed EN/ZH guide and theme checks')
