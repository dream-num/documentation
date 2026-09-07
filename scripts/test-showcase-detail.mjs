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
    const product = sidebar.getByRole('button').first()
    await product.click()
    await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false')
    await product.click()
    await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
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
    await frame.locator('.base-groups[data-ready=true]').waitFor({ timeout: 120000 })
    await frame.getByRole('button', { name: 'Inspect', exact: true }).click()
    await page.waitForTimeout(250)
    const initial = JSON.parse(await frame.locator('.base-groups output').textContent())
    assert.equal(initial.sourceRecordIds.length, 90)
    await frame.getByRole('button', { name: 'Collapse Done', exact: true }).click()
    await page.waitForTimeout(250)
    const collapsed = JSON.parse(await frame.locator('.base-groups output').textContent())
    assert.equal(collapsed.expandedRecordIds.length, 69)
    assert.equal(collapsed.sourceRecordIds.length, 90)
    await frame.getByRole('button', { name: 'Reset', exact: true }).click()
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
