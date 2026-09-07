/* eslint-disable no-await-in-loop -- Each locale owns a separate live SDK preview. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4266'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-board-slide-tab-next')
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
    ['en-US', 'Boards in Slides / Retrospective Tab', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Boards 嵌入 Slides / 复盘白板标签', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(`${origin}/${locale}/showcase/embed/boards-in-slides-tab`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const root = page.frameLocator('iframe').first().locator('.kite-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.ok(frame)
    assert.equal(await root.locator(':scope > fieldset,:scope > details,[data-action]').count(), 0)
    await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="kite-retrospective-page"]').click()
    await root.locator('[data-embed-slides-page-list-host]').waitFor()
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
      window.univerAPI
        .getBoard('kite-shift-retrospective')
        .getShape('buddy')
        .getText()
        .setText('Buddy trial\nStart next Saturday.')
    })
    const read = () =>
      frame.evaluate(() => ({
        host: window.univerAPI.getPresentation('kite-volunteer-workshop').save(),
        child: window.univerAPI.getBoard('kite-shift-retrospective').save(),
      }))
    const snapshot = await read()
    assert.equal(
      await frame.evaluate(() =>
        window.univerAPI.getBoard('kite-shift-retrospective').getShape('buddy').getText().getPlainText(),
      ),
      'Buddy trial\nStart next Saturday.',
    )
    assert.deepEqual(snapshot.host.slideOrder, ['kickoff', 'kite-retrospective-page', 'experiments', 'checkin'])
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      const themed = await read()
      assert.equal(themed.child.theme.id, snapshot.child.theme.id)
      // Native Board theme following changes its generated palette, not authored content.
      assert.deepEqual({ ...themed, child: { ...themed.child, theme: snapshot.child.theme } }, snapshot)
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
console.log('PASS Kite EN/ZH guides, native Grid and live theme owner/data preservation')
