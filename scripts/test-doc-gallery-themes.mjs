/* eslint-disable no-await-in-loop -- Each selected document keeps one owner across theme changes. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const roots = {
  'images-and-wrapping': '.images-demo',
  'shapes-in-documents': '.shapes-demo',
  'charts-in-documents': '.charts-demo',
  'column-layouts': '.columns-demo',
}
const selected = [...new Set(process.argv.slice(2))]
assert.ok(
  selected.length && selected.every((slug) => roots[slug]),
  'Pass explicitly selected Modern Docs gallery names',
)
const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/doc-gallery-themes'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const report = { passed: false, cases: [], errors: [] }
try {
  for (const slug of selected) {
    for (const locale of ['en-US', 'zh-CN']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
      page.on('pageerror', (error) => report.errors.push({ slug, locale, message: error.message }))
      page.on('console', (message) => {
        if (message.type() === 'error') report.errors.push({ slug, locale, message: message.text() })
      })
      await page.addInitScript(() => localStorage.setItem('theme', 'light'))
      await page.goto(
        `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/docs-modern/${slug}`,
        { waitUntil: 'domcontentloaded', timeout: 180000 },
      )
      const root = page.locator(roots[slug] + '[data-ready=true]')
      await root.waitFor({ timeout: 120000 })
      await page.waitForFunction(
        () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      const before = await page.evaluate(() => {
        window.__themeOwner = window.univerAPI
        const doc = window.univerAPI.getActiveDocument()
        if (!doc.insertText(0, 'Theme persistence probe\r')) throw new Error('Native document edit failed')
        return doc.save()
      })
      for (const theme of ['dark', 'light']) {
        // Exercise the installed next-themes storage listener and Preview effects,
        // not a direct toggleDarkMode call that would bypass the owner adapter.
        await page.evaluate((value) => {
          localStorage.setItem('theme', value)
          window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value }))
        }, theme)
        await page.waitForFunction((dark) => window.univerAPI?.isDarkMode() === dark, theme === 'dark')
        const after = await page.evaluate(() => ({
          sameOwner: window.__themeOwner === window.univerAPI,
          snapshot: window.univerAPI.getActiveDocument().save(),
        }))
        assert.equal(after.sameOwner, true, `${slug}: theme must not replace the SDK owner`)
        assert.deepEqual(after.snapshot, before, `${slug}: full edited snapshot must survive ${theme}`)
        await root.screenshot({ path: `${output}/${slug}-${locale}-${theme}.png` })
      }
      report.cases.push({ slug, locale, sameOwner: true, editedSnapshotPreserved: true })
      await page.close()
    }
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
