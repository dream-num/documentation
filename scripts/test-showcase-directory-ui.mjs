/* eslint-disable no-await-in-loop -- Verify localized navigation and deliberate empty folders in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'
const output = 'test-results/showcase-directory'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const report = { passed: false, locales: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const response = await page.goto(`${origin}/${locale}/showcase/sheets/custom-canvas`, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    })
    assert.equal(response.status(), 200)
    const sidebar = page.locator('aside')
    await sidebar
      .getByRole('link', { name: locale === 'en-US' ? 'Custom Canvas Rendering' : '自定义 Canvas 绘制', exact: true })
      .waitFor()
    await page.frameLocator('iframe').locator('.seed-canvas-demo[data-ready=true]').waitFor({ timeout: 120000 })
    const closed = sidebar.locator('button[aria-expanded=false]')
    while (await closed.count()) await closed.first().click()
    const links = await sidebar
      .getByRole('link')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))
    assert.equal(links.length, 165)
    assert.equal(new Set(links).size, 165)
    assert.ok(links.every((href) => href.startsWith(`/${locale}/showcase/`)))
    const empty = sidebar.getByText(locale === 'en-US' ? 'No demos yet' : '暂无案例', { exact: true })
    assert.ok((await empty.count()) > 0)
    const integration = sidebar
      .getByRole('button', {
        name: locale === 'en-US' ? /^Customization & Integration/ : /^定制化与系统接入/,
      })
      .locator('..')
    assert.equal(await integration.getByRole('link').count(), 28)
    const scopeButtons = integration.locator(':scope > div > button')
    assert.equal(await scopeButtons.count(), 8)
    const crossProduct = integration
      .getByRole('button', {
        name: locale === 'en-US' ? /^Cross-product/ : /^综合（跨产品）/,
      })
      .locator('..')
    assert.equal(await crossProduct.getByRole('link').count(), 0)
    assert.equal(
      await crossProduct.getByText(locale === 'en-US' ? 'No demos yet' : '暂无案例', { exact: true }).count(),
      2,
    )
    await integration.getByRole('button').first().scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${output}/integration-products-${locale}.png` })
    const search = sidebar.getByRole('textbox')
    await search.fill('Cross-file Formula References')
    await page.waitForFunction(() => document.querySelectorAll('aside a').length === 27)
    assert.equal(await sidebar.getByRole('link').count(), 27)
    await sidebar
      .getByRole('button', { name: locale === 'en-US' ? /^Compose & Embed/ : /^组合与嵌套/ })
      .scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${output}/formula-hosts-${locale}.png` })
    await search.fill('unlikely-directory-search-no-match')
    await sidebar.getByText(locale === 'en-US' ? 'No matching demos' : '没有匹配的案例', { exact: true }).waitFor()
    assert.equal(await sidebar.getByRole('link').count(), 0)
    report.locales.push({ locale, routes: links.length, formulaRoutes: 27, emptyFolders: true })
  }
  await page.goto(`${origin}/en-US/showcase?filter=bases&category=performance`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await page.getByRole('button', { name: 'Performance · 0', exact: true }).waitFor()
  assert.equal(
    await page.getByRole('button', { name: 'Performance · 0', exact: true }).getAttribute('aria-pressed'),
    'true',
  )
  assert.equal(await page.locator('a[href^="/showcase/bases/"]').count(), 0)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Performance · 0', exact: true }).scrollIntoViewIfNeeded()
  await page.waitForTimeout(400) // Let the existing reveal/resize transition settle before visual evidence.
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  const sectionsBox = await page.getByRole('group', { name: 'Demo sections' }).boundingBox()
  const performanceBox = await page.getByRole('button', { name: 'Performance · 0', exact: true }).boundingBox()
  assert.ok(
    performanceBox.y >= sectionsBox.y + sectionsBox.height,
    'Wrapped section filters must not overlap category filters',
  )
  await page.screenshot({ path: `${output}/empty-performance-mobile.png` })
  await page.goto(`${origin}/en-US/showcase?filter=embed&category=cross-file-formulas&host=bases`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  const host = page.getByRole('combobox', { name: 'Host product' })
  await host.waitFor()
  assert.equal(await host.inputValue(), 'bases')
  assert.equal(await page.locator('a[href^="/showcase/embed/"]').count(), 0)
  await page.waitForLoadState('networkidle')
  await host.selectOption('slides')
  await page.waitForFunction(() => document.querySelectorAll('a[href^="/showcase/embed/"]').length > 0)
  await page.goto(`${origin}/en-US/showcase?filter=customization-integration&product=docs-modern`, {
    waitUntil: 'networkidle',
    timeout: 120000,
  })
  const productScope = page.getByRole('combobox', { name: 'Product scope' })
  assert.equal(await productScope.inputValue(), 'docs-modern')
  assert.ok((await page.locator('a[href^="/showcase/docs/"]').count()) > 0)
  assert.equal(await page.locator('a[href^="/showcase/sheets/"]').count(), 0)
  await productScope.selectOption('cross-product')
  await page.waitForFunction(() => new URL(location.href).searchParams.get('product') === 'cross-product')
  assert.equal(await page.locator('a[href^="/showcase/docs/"]').count(), 0)
  await page.screenshot({ path: `${output}/integration-empty-mobile.png` })
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.message
  throw error
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
