/* eslint-disable no-await-in-loop -- Verify each localized route and its own iframe in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_ORIGIN || 'http://localhost:3030'
const directory = path.resolve('test-results/bases-groups-detail')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const results = [],
  errors = []
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  for (const [locale, title, variants, actions, states] of [
    ['en-US', 'Group Records', 'Variants', 'Actions', 'States'],
    ['zh-CN', '记录分组', '变体', '操作', '状态'],
  ]) {
    const started = Date.now()
    const response = await page.goto(`${origin}/${locale}/showcase/bases/group-records`, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
    for (const name of [variants, actions, states])
      assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const sidebar = page.locator('aside')
    await page.waitForLoadState('networkidle')
    // Exercise hydration before screenshots: Playwright's hidden-caret styling can
    // otherwise race React's first render and create a test-induced mismatch.
    const product = sidebar.getByRole('button', { expanded: true }).first()
    const productElement = await product.elementHandle()
    await product.click()
    await page.waitForFunction((button) => button.getAttribute('aria-expanded') === 'false', productElement)
    await productElement.click()
    await page.waitForFunction((button) => button.getAttribute('aria-expanded') === 'true', productElement)
    assert.equal(await sidebar.getByRole('link', { name: title, exact: true }).count(), 1)
    assert.equal(
      await sidebar.getByRole('button', { expanded: true }).count(),
      3,
      'Product, category and feature family give a four-level tree with the leaf',
    )
    await page.screenshot({ path: path.join(directory, `detail-${locale}.png`) })
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const frame = page.frameLocator('iframe').first()
    const editor = frame.locator('.base-groups-demo[data-ready=true]')
    await editor.waitFor({ timeout: 120000 })
    assert.equal(await editor.locator(':scope > fieldset, :scope > details, :scope > output').count(), 0)
    const initial = await editor.evaluate(() => window.univerAPI.getActiveBase().save().tables.returns.records)
    assert.equal(Object.keys(initial).length, 16)
    await editor
      .getByText(locale === 'zh-CN' ? '状态 → 负责人' : 'Status → owner', { exact: true })
      .first()
      .click()
    await editor.evaluate(async () => {
      const api = window.univerAPI
      const deadline = performance.now() + 10000
      while (api.getBaseUI().getActiveViewId() !== 'nested') {
        if (performance.now() > deadline) throw new Error('Native nested view did not activate')
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
    })
    const nested = await editor.evaluate(() => {
      const table = window.univerAPI.getActiveBase().getTableById('returns')
      return {
        rules: table.getViewById('nested').getGroup(),
        records: window.univerAPI.getActiveBase().save().tables.returns.records,
      }
    })
    assert.deepEqual(
      nested.rules.map((rule) => rule.fieldId),
      ['status', 'owner'],
    )
    assert.deepEqual(nested.records, initial, 'Native view switching must preserve the source records')
    await iframe.screenshot({ path: path.join(directory, `${locale}-native-iframe.png`) })
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      await page.getByRole('heading', { name: title, level: 1, exact: true }).scrollIntoViewIfNeeded()
      await page.screenshot({ path: path.join(directory, `${locale}-${width}.png`) })
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `No page overflow at ${width}px`,
      )
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
    results.push({ locale, status: 'passed', elapsedMs: Date.now() - started })
    console.log('PASS localized detail, four-level sidebar and real iframe: ' + locale)
  }
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: 'passed', results, errors }, null, 2),
  )
} catch (error) {
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: 'failed', message: error.message, results, errors }, null, 2),
  )
  throw error
} finally {
  await browser.close()
}
