/* eslint-disable no-await-in-loop -- Locale checks share one browser sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/doc-columns-native-gallery'
await fs.mkdir(output, { recursive: true })

let server
const port = Number(process.env.SHOWCASE_PORT || 4450)
if (process.argv[2]) {
  const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
  const entry = manifest.find(({ slug }) => slug === 'docs-modern/column-layouts')
  assert.ok(entry?.passed, 'Selected production build must pass')
  const { readShowcaseSources } = await import('./showcase-sources.mjs')
  const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
  for (const [file, expected] of Object.entries(source.files))
    assert.equal(await fs.readFile(path.join(entry.directory, file.slice(1)), 'utf8'), expected, file)
  const { preview } = await import(
    pathToFileURL(path.join(entry.links.find(({ name }) => name === 'vite').target, 'dist/node/index.js'))
  )
  server = await preview({
    root: entry.directory,
    configFile: false,
    preview: { host: '127.0.0.1', port, strictPort: true },
  })
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
const report = { passed: false, locales: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  for (const locale of ['en-US', 'zh-CN']) {
    if (server) {
      await page.unroute('**/')
      await page.route(`http://127.0.0.1:${port}/`, async (route) => {
        const response = await route.fetch()
        await route.fulfill({
          response,
          body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${locale}">`),
        })
      })
    }
    await page.goto(
      server
        ? `http://127.0.0.1:${port}/`
        : `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/docs-modern/column-layouts`,
      { waitUntil: 'domcontentloaded', timeout: 120000 },
    )
    const root = page.locator('.columns-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await root.locator('canvas').first().waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.lang), locale)
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
    assert.doesNotMatch(await root.innerText(), /[\p{Script=Han}]|(?:docs|toolbar|ribbon)\.[a-z][\w.]+/u)
    assert.equal(
      await root.locator(':scope > fieldset, :scope > details, :scope > output, :scope > [role=alert]').count(),
      0,
    )
    await root.getByText('Insert', { exact: true }).first().click()
    assert.equal(await root.locator('[data-u-comp="ribbon-grid-toolbar"]').count(), 1)
    assert.ok(await root.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
    await root.getByText('Start', { exact: true }).first().click()
    const initial = await page.evaluate(() => {
      const doc = window.univerAPI.getActiveDocument()
      return {
        snapshot: doc.save(),
        groups: doc.getColumnGroups().map((group) => ({
          id: group.getId(),
          ratios: group.getWidthRatios(),
          columns: group.getColumns().map((column) => column.getText()),
        })),
      }
    })
    assert.equal(initial.groups.length, 6)
    assert.deepEqual(
      initial.groups.map((group) => group.columns.length),
      [2, 3, 4, 5, 2, 2],
    )
    for (const group of initial.groups.slice(0, 4))
      assert.ok(group.ratios.every((ratio) => Math.abs(ratio - group.ratios[0]) < 0.0001))
    assert.equal(initial.groups[4].ratios[0] / initial.groups[4].ratios[1], 2)
    assert.equal(initial.groups[5].ratios[1] / initial.groups[5].ratios[0], 2)
    assert.ok(initial.groups.every((group) => group.columns.every((text) => text.includes('Short editable text'))))
    assert.equal(Object.keys(initial.snapshot.tableSource || {}).length, 0)
    assert.equal(Object.keys(initial.snapshot.drawings || {}).length, 0)
    await page.screenshot({ path: `${output}/${locale}.png` })
    const edited = await page.evaluate(() => {
      const doc = window.univerAPI.getActiveDocument()
      const group = doc.getColumnGroup('columns-two')
      const column = group.getColumn(0)
      const before = column.getText()
      const accepted = column.setText('Edited column')
      const after = column.getText()
      const widthAccepted = group.setWidthRatios([3, 1])
      const ratios = group.getWidthRatios()
      const restored = column.setText(before)
      const widthsRestored = group.setWidthRatios([1, 1])
      return {
        accepted,
        after,
        widthAccepted,
        ratios,
        restored,
        widthsRestored,
        otherGroups: doc
          .getColumnGroups()
          .slice(1)
          .map((item) => item.getColumns().map((child) => child.getText())),
      }
    })
    assert.ok(edited.accepted && edited.widthAccepted && edited.restored && edited.widthsRestored)
    assert.ok(edited.after.includes('Edited column'))
    assert.equal(edited.ratios[0] / edited.ratios[1], 3)
    assert.deepEqual(
      edited.otherGroups,
      initial.groups.slice(1).map((group) => group.columns),
    )
    await page.evaluate(() => window.univerAPI.getActiveDocument().setSelection(0, 0))
    await root
      .locator('canvas')
      .first()
      .hover({ position: { x: 500, y: 300 } })
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(300)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: `${output}/${locale}-ratios.png` })
    await page.setViewportSize({ width: 540, height: 900 })
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${output}/${locale}-narrow.png` })
    await page.setViewportSize({ width: 1440, height: 1100 })
    report.locales.push({
      locale,
      nativeGrid: true,
      groupCount: 6,
      ratios: true,
      facadeTextAndWidths: true,
      hostPanelsRemoved: true,
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || error.message
  throw error
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
}
