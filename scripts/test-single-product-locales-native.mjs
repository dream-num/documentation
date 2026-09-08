/* eslint-disable no-await-in-loop -- Exercise only two selected native demos in each language. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const directory = 'test-results/single-product-locales-native'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const report = { passed: false, cases: [], errors: [] }
try {
  for (const slug of ['slides/theme-and-background', 'sheets/basic-via-preset']) {
    for (const locale of ['en-US', 'zh-CN']) {
      const zh = locale === 'zh-CN'
      const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } })
      page.on('pageerror', (error) => report.errors.push({ slug, locale, error: error.message }))
      page.on('console', (message) => {
        if (message.type() === 'error') report.errors.push({ slug, locale, error: message.text() })
      })
      await page.goto(`${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/${slug}`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('tab', { name: zh ? '开始' : 'Start', exact: true }).waitFor({ timeout: 120000 })
      await page
        .getByRole('tab', {
          name: slug.startsWith('slides/') ? (zh ? '视图' : 'View') : zh ? '插入' : 'Insert',
          exact: true,
        })
        .click()
      assert.ok(await page.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
      await page.getByRole('tab', { name: zh ? '开始' : 'Start', exact: true }).click()
      if (slug.startsWith('slides/')) {
        const root = page.locator('.slide-theme-demo[data-ready=true]')
        await root.waitFor()
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), zh ? 'zhCN' : 'enUS')
        assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 8)
        await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="closing"]').click()
        await page.waitForFunction(
          () => window.univerAPI.getActivePresentation().getActiveSlide().getId() === 'closing',
        )
        await root.screenshot({ path: `${directory}/slides-${locale}.png` })
        assert.equal(await root.locator('[data-u-command="slides-exchange-client.operation.exchange"]').count(), 0)
        await root.locator('[data-u-command="slide.operation.print-open"]').click()
        await page.getByText(zh ? '打印范围' : 'Print range', { exact: true }).waitFor({ timeout: 60000 })
        await page.screenshot({ path: `${directory}/slides-${locale}-print.png` })
        await page.getByRole('button', { name: zh ? '取消' : 'Cancel', exact: true }).click()
      } else {
        await page.locator('[data-sdk-ready="true"]').waitFor()
        await page
          .locator('[data-u-comp="render-canvas"][id^="univer-sheet-main-canvas_"]')
          .first()
          .click({ position: { x: 200, y: 120 } })
        await page.getByRole('tab', { name: zh ? '数据' : 'Data', exact: true }).click()
        await page.locator('[data-u-command="ui.operation.open-find-dialog"]').click()
        const find = page.getByPlaceholder(zh ? '输入查找内容' : 'Find', { exact: true })
        await find.waitFor()
        await find.fill('Univer')
        await find.press('Control+h')
        await page.getByPlaceholder(zh ? '输入替换内容' : 'Input Replace String', { exact: true }).waitFor()
        await page.screenshot({ path: `${directory}/sheets-${locale}-find.png` })
        await page.keyboard.press('Escape')
      }
      report.cases.push({
        slug,
        locale,
        nativeMenus: true,
        selectedInteraction: slug.startsWith('slides/')
          ? 'thumbnail, absent backend conversion entry and print settings/cancel (no print job)'
          : 'native Find/Replace fields (no replacement)',
      })
      await page.close()
    }
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  await fs.writeFile(`${directory}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
