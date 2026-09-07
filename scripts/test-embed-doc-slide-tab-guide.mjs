/* eslint-disable no-await-in-loop -- Each locale owns a separate live SDK preview. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4262'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-doc-slide-tab-next')
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
    ['en-US', 'Docs in Slides / Research Appendix Tab', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Docs 嵌入 Slides / 研究附录标签', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(`${origin}/${locale}/showcase/embed/docs-in-slides-tab`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const root = page.frameLocator('iframe').first().locator('.mosaic-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.ok(frame)
    assert.equal(await root.locator(':scope > fieldset,:scope > details,[data-action]').count(), 0)
    await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="mosaic-research-appendix-page"]').click()
    await root.locator('[data-embed-slides-page-list-host]').waitFor()
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
      window.univerAPI.getDocument('mosaic-methods-appendix').getParagraphs()[1].setText('Keep the methods visible.')
    })
    const read = () =>
      frame.evaluate(() => ({
        host: window.univerAPI.getPresentation('mosaic-repair-research').save(),
        child: window.univerAPI.getDocument('mosaic-methods-appendix').save(),
      }))
    const snapshot = await read()
    assert.ok(snapshot.child.body.dataStream.includes('Keep the methods visible.'))
    assert.deepEqual(snapshot.host.slideOrder, ['question', 'mosaic-research-appendix-page', 'patterns', 'limits'])
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      assert.deepEqual(await read(), snapshot)
    }
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
console.log('PASS Mosaic EN/ZH guides, native Grid and live theme owner/data preservation')
