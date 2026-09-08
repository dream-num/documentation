/* eslint-disable no-await-in-loop -- Localized browser checks run sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const output = 'test-results/doc-font-native-gallery'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
const report = { passed: false, locales: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto(
      `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/docs-traditional/fonts-fallback-and-glyphs`,
      { waitUntil: 'domcontentloaded', timeout: 120000 },
    )
    const root = page.locator('.font-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await root.locator('canvas').first().waitFor()
    assert.equal(await root.locator(':scope > details, :scope > fieldset, :scope > output').count(), 0)
    const snapshot = await page.evaluate(() => window.univerAPI.getActiveDocument().save())
    for (const id of ['EN', 'CJK', 'RTL', 'ACCENTS', 'SYMBOL', 'GLYPH'])
      assert.ok(snapshot.body.dataStream.includes('[' + id + ']'))
    for (const ff of [
      'Arial, sans-serif',
      'Georgia, serif',
      'Courier New, monospace',
      'Univer Missing Font 2027, Georgia, serif',
    ])
      assert.ok(snapshot.body.textRuns.some((run) => run.ts.ff === ff))
    assert.ok(snapshot.body.textRuns.some((run) => run.ts.fs === 12 && run.ts.bl === 0))
    assert.ok(snapshot.body.textRuns.some((run) => run.ts.fs === 18 && run.ts.bl === 1))
    const formatting = await page.evaluate(() => {
      const doc = window.univerAPI.getActiveDocument()
      const before = doc.getBody().dataStream
      const start = before.indexOf('[EN]')
      const end = before.indexOf('\r', start)
      const range = doc.getTextRange(start, end)
      const original = range.getCommonExplicitTextStyle()
      const accepted = range.setTextStyle({ ff: 'Georgia, serif', fs: 19, bl: 1 })
      const changed = range.getCommonExplicitTextStyle()
      const unchangedText = doc.getBody().dataStream === before
      range.setTextStyle(original)
      return { accepted, changed, unchangedText }
    })
    assert.ok(formatting.accepted)
    assert.equal(formatting.changed.ff, 'Georgia, serif')
    assert.equal(formatting.changed.fs, 19)
    assert.equal(formatting.changed.bl, 1)
    assert.ok(formatting.unchangedText)
    const layout = await page.evaluate(() => {
      // Diagnostic-only layout inspection, not a public demo API.
      const api = window.univerAPI
      const injector = api._injector
      const key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (candidate) => String(candidate) === 'engine-render.render-manager.service',
      )
      const render = injector.get(key).getRenderUnitById(api.getActiveDocument().getId())
      return render.mainComponent._skeleton._skeletonData.pages.map((p) => ({
        width: p.pageWidth,
        height: p.pageHeight,
      }))
    })
    assert.equal(layout.length, 2, 'Default specimens must fit two physical pages')
    await page.evaluate(() => {
      const doc = window.univerAPI.getActiveDocument()
      const start = doc.getBody().dataStream.indexOf('Regular 12 pt')
      doc.setSelection(start, start + 7)
    })
    await page.keyboard.press('Control+b')
    await page.waitForFunction(() => {
      const doc = window.univerAPI.getActiveDocument()
      const start = doc.getBody().dataStream.indexOf('Regular 12 pt')
      return doc.getTextRange(start, start + 7).getCommonExplicitTextStyle().bl === 1
    })
    await page.keyboard.press('Control+b')
    await page.waitForFunction(() => {
      const doc = window.univerAPI.getActiveDocument()
      const start = doc.getBody().dataStream.indexOf('Regular 12 pt')
      return doc.getTextRange(start, start + 7).getCommonExplicitTextStyle().bl === 0
    })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: `${output}/${locale}.png` })
    await root
      .locator('canvas')
      .first()
      .hover({ position: { x: 600, y: 250 } })
    await page.mouse.wheel(0, 1150)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${output}/${locale}-scripts.png` })
    report.locales.push({
      locale,
      nativeCanvas: true,
      fourStacks: true,
      sixScriptSamples: true,
      hostPanelsRemoved: true,
      nativeBoldShortcut: true,
      physicalPages: layout,
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
