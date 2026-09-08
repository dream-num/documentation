/* eslint-disable no-await-in-loop -- Locale checks share one browser sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const output = 'test-results/doc-shapes-native-gallery'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
const report = { passed: false, locales: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto(
      `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/docs-modern/shapes-in-documents`,
      { waitUntil: 'domcontentloaded', timeout: 120000 },
    )
    const root = page.locator('.shapes-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await root.locator('canvas').first().waitFor()
    assert.equal(
      await root.locator(':scope > fieldset, :scope > details, :scope > output, :scope > [role=alert]').count(),
      0,
    )
    await root
      .getByText(locale === 'zh-CN' ? '插入' : 'Insert', { exact: true })
      .first()
      .click()
    await root
      .getByText(locale === 'zh-CN' ? '开始' : 'Start', { exact: true })
      .first()
      .click()
    const initial = await page.evaluate(() => {
      const doc = window.univerAPI.getActiveDocument()
      return {
        snapshot: doc.save(),
        shapes: doc.getShapes().map((shape) => ({
          id: shape.getId(),
          type: shape.getShapeType(),
          text: shape.getText().getPlainText(),
          data: shape.getShapeData(),
          transform: shape.getTransform(),
        })),
      }
    })
    assert.equal(initial.shapes.length, 6)
    assert.equal(new Set(initial.shapes.map((shape) => shape.type)).size, 4)
    assert.ok(initial.shapes[1].text.includes(locale === 'zh-CN' ? '圆角矩形' : 'Rounded rectangle'))
    assert.equal(Object.keys(initial.snapshot.tableSource || {}).length, 0)
    assert.equal(initial.snapshot.body.columnGroups?.length || 0, 0)
    assert.equal(Object.keys(initial.snapshot.drawings).length, 6)
    const editing = await page.evaluate(async () => {
      const api = window.univerAPI
      const doc = api.getActiveDocument()
      const shape = doc.getShapes()[1]
      const before = shape.getText().getPlainText()
      shape.getText().setText('Edited shape')
      const after = shape.getText().getPlainText()
      const undo = await api.executeCommand('univer.command.undo')
      const restored = shape.getText().getPlainText()
      const redo = await api.executeCommand('univer.command.redo')
      const redone = shape.getText().getPlainText()
      await api.executeCommand('univer.command.undo')
      return { before, after, undo, restored, redo, redone, count: doc.getShapes().length }
    })
    assert.ok(editing.after.includes('Edited shape'))
    assert.ok(editing.undo)
    assert.equal(editing.restored, editing.before)
    assert.ok(editing.redo)
    assert.equal(editing.redone, editing.after)
    assert.equal(editing.count, 6)
    await page.screenshot({ path: `${output}/${locale}.png` })
    await page.setViewportSize({ width: 540, height: 900 })
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${output}/${locale}-narrow.png` })
    await page.setViewportSize({ width: 1440, height: 1100 })
    report.locales.push({
      locale,
      shapeCount: initial.shapes.length,
      hostPanelsRemoved: true,
      nativeGrid: true,
      facadeTextAndHistoryCommands: true,
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
