/* eslint-disable no-await-in-loop -- Each locale owns a separate live SDK preview. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4262'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-lifecycle-native-next')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Slide Lifecycle and Independent Copies', ['Variants', 'Actions', 'States']],
    ['zh-CN', '页面生命周期与独立副本', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(`${origin}/${locale}/showcase/slides/slide-lifecycle`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const root = page.frameLocator('iframe').first().locator('.slide-lifecycle[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.ok(frame)
    assert.equal(await root.locator(':scope > fieldset,:scope > details,[data-action]').count(), 0)
    await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    assert.equal(await frame.evaluate(() => window.univerAPI.getActivePresentation().getSlides().length), 8)
    await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="studio"]').click()
    await frame.waitForFunction(() => window.univerAPI.getActivePresentation().getActiveSlide().getId() === 'studio')
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
      window.univerAPI
        .getActivePresentation()
        .getActiveSlide()
        .getShape('title')
        .getText()
        .setRichText(
          window.univerAPI
            .newRichText()
            .span('Studio / Quiet making hour', { fontSize: 34, bold: true, color: '#233D49' }),
        )
    })
    const snapshot = await frame.evaluate(() => window.univerAPI.getActivePresentation().save())
    assert.equal(
      snapshot.slides.studio.elements.title.shapeData.shapeText.dataModel.doc.body.dataStream.trim(),
      'Studio / Quiet making hour',
    )
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      assert.deepEqual(await frame.evaluate(() => window.univerAPI.getActivePresentation().save()), snapshot)
    }
    const bounds = await root.boundingBox()
    await page.evaluate((top) => window.scrollBy(0, top - 112), bounds.y)
    await root.screenshot({ path: path.join(directory, `${locale}.png`) })
    report.checks.push({
      locale,
      nativeGrid: true,
      redundantGuideCardRemoved: true,
      themePreservesOwnerAndEditedSnapshot: true,
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
console.log('PASS Northlight EN/ZH guides, native Grid and live theme owner/data preservation')
