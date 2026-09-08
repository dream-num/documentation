/* eslint-disable no-await-in-loop -- Native view transitions checked sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'
const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-field-layout-native'
let server
if (process.argv[2]) {
  const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
  const entry = manifest.find(({ slug }) => slug === 'bases/view-field-layout')
  assert.ok(entry?.passed)
  const { preview } = await import(pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js')))
  server = await preview({
    root: entry.directory,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4441, strictPort: true },
  })
}
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1050 } })
const report = { passed: false, locales: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const variants = [
  {
    id: 'full',
    names: ['Full record', '完整记录'],
    width: 240,
    height: 'medium',
    frozen: 1,
    order: ['sample', 'habitat', 'temperature', 'ph', 'notes', 'batch'],
  },
  {
    id: 'compact',
    names: ['Compact fieldwork', '紧凑采样'],
    width: 180,
    height: 'short',
    frozen: 1,
    order: ['sample', 'habitat', 'temperature', 'ph'],
  },
  {
    id: 'review',
    names: ['Notes-first review', '笔记优先'],
    width: 280,
    height: 'extraTall',
    frozen: 2,
    order: ['sample', 'notes', 'habitat', 'temperature', 'ph', 'batch'],
  },
  {
    id: 'lab',
    names: ['Lab handover', '实验室交接'],
    width: 220,
    height: 'tall',
    frozen: 2,
    order: ['sample', 'batch', 'ph', 'temperature'],
  },
]
try {
  for (const locale of ['en-US', 'zh-CN']) {
    if (server) {
      await page.unroute('http://127.0.0.1:4441/')
      await page.route('http://127.0.0.1:4441/', async (route) => {
        const response = await route.fetch()
        await route.fulfill({
          response,
          body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${locale}">`),
        })
      })
    }
    await page.goto(
      server
        ? 'http://127.0.0.1:4441/'
        : `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/bases/view-field-layout`,
      { waitUntil: 'domcontentloaded', timeout: 120000 },
    )
    const root = page.locator('.base-field-layout-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator(':scope > fieldset, :scope > details, :scope > output').count(), 0)
    const records = () => page.evaluate(() => window.univerAPI.getActiveBase().save().tables.records.records)
    const before = await records()
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    assert.doesNotMatch(await root.innerText(), /[\u3400-\u9fff]/)
    assert.equal(Object.keys(before).length, 8)
    assert.equal(await root.locator('[data-u-comp="render-canvas"]').count(), 1)
    const checks = []
    for (const variant of variants) {
      await root.getByText(variant.names[0], { exact: true }).first().click()
      await page.waitForFunction((id) => window.univerAPI.getBaseUI().getActiveViewId() === id, variant.id)
      const settings = await page.evaluate((id) => {
        const view = window.univerAPI.getActiveBase().getTableById('records').getViewById(id)
        return {
          width: view.getFieldSettings('sample').width,
          config: view.getConfig(),
          visible: view.getVisibleFields().map((field) => field.getId()),
        }
      }, variant.id)
      assert.equal(settings.width, variant.width)
      assert.equal(settings.config.rowHeight, variant.height)
      assert.equal(settings.config.frozenFieldCount, variant.frozen)
      assert.deepEqual(settings.visible, variant.order)
      assert.deepEqual(await records(), before)
      await page.screenshot({ path: `${output}/${locale}-${variant.id}.png` })
      checks.push({ id: variant.id, ...settings })
    }
    report.locales.push({ locale, views: checks, recordsUnchanged: true })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
  await server?.close()
}
