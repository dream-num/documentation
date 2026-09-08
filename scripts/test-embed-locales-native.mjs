/* eslint-disable no-await-in-loop -- Compile and exercise only the selected Embed cases. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const directory = 'test-results/embed-locales-native'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const report = { passed: false, cases: [], errors: [] }
try {
  for (const [slug, rootClass, hostId, childId, entry] of [
    [
      'bases-in-docs-block',
      'orchard-embed',
      'orchard-launch-brief',
      'orchard-launch-responsibilities',
      'docs-custom-block',
    ],
    ['slides-in-sheets-float', 'harbor-embed', 'harbor-budget', 'harbor-decision', 'sheets-floating-object'],
  ]) {
    for (const locale of ['en-US', 'zh-CN']) {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
      page.on('pageerror', (error) => report.errors.push({ slug, locale, error: error.message }))
      page.on('console', (message) => {
        if (message.type() === 'error') report.errors.push({ slug, locale, error: message.text() })
      })
      await page.goto(`${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/embed/${slug}`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      const root = page.locator('.' + rootClass)
      await page.waitForFunction(
        (name) => {
          const element = document.querySelector('.' + name)
          return element?.dataset.ready === 'true' || element?.dataset.error
        },
        rootClass,
        { timeout: 120000 },
      )
      assert.equal(await root.getAttribute('data-error'), null)
      const state = await page.evaluate((selectedHostId) => {
        const api = window.univerAPI
        return {
          locale: api.getCurrentLocale(),
          descriptor: api.listEmbeds({ hostUnitId: selectedHostId })[0].getDescriptor(),
        }
      }, hostId)
      assert.equal(state.locale, locale === 'zh-CN' ? 'zhCN' : 'enUS')
      assert.equal(state.descriptor.childUnitId, childId)
      assert.equal(state.descriptor.entry, entry)
      assert.equal(state.descriptor.context.resolved, true)
      const insert = page.getByRole('tab', { name: locale === 'zh-CN' ? '插入' : 'Insert', exact: true })
      await insert.click()
      assert.ok(await root.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
      await page.getByRole('tab', { name: locale === 'zh-CN' ? '开始' : 'Start', exact: true }).click()
      await root.screenshot({ path: `${directory}/${slug}-${locale}-host.png` })
      if (entry === 'docs-custom-block') {
        await page.mouse.move(850, 400)
        await page.mouse.wheel(0, 400)
      }
      const child = root.locator('[data-u-comp="embed-float-dom"]').first()
      if (entry === 'docs-custom-block') await child.click({ position: { x: 180, y: 130 } })
      else await child.dblclick({ position: { x: 300, y: 180 } })
      await page.waitForFunction(
        () =>
          document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') ===
          'stage2',
      )
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      await root.screenshot({ path: `${directory}/${slug}-${locale}-child.png` })
      if (entry === 'sheets-floating-object') {
        await page.getByRole('button', { name: locale === 'zh-CN' ? '下一张幻灯片' : 'Next page', exact: true }).click()
        await page.waitForFunction(
          () => window.univerAPI.getPresentation('harbor-decision').getActiveSlide().getId() === 'review',
        )
        await root.screenshot({ path: `${directory}/${slug}-${locale}-next.png` })
        await page.getByRole('button', { name: locale === 'zh-CN' ? '上一页' : 'Previous page', exact: true }).click()
        await page.waitForFunction(
          () => window.univerAPI.getPresentation('harbor-decision').getActiveSlide().getId() === 'decision',
        )
      }
      report.cases.push({
        slug,
        locale,
        sdkLocale: state.locale,
        entry,
        childId,
        nativeInsertMenu: true,
        childActivated: true,
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
