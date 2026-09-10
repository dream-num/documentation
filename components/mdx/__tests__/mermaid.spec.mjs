import assert from 'node:assert/strict'

import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(`${process.env.DOCS_TEST_ORIGIN ?? 'http://localhost:3030'}/ja-JP/ai`)
  const diagram = page.locator('[data-mermaid]').first()
  const svg = diagram.locator('svg[id]')
  await svg.waitFor()
  const initialWidth = (await svg.boundingBox()).width
  await diagram.getByRole('button', { name: '拡大', exact: true }).click()
  assert.equal(await diagram.locator('output').textContent(), '125%')
  assert.ok((await svg.boundingBox()).width > initialWidth * 1.2)
  await diagram.getByRole('button', { name: '拡大', exact: true }).click({ clickCount: 7, delay: 50 })
  assert.equal(await diagram.locator('output').textContent(), '300%')
  assert.ok(await diagram.getByRole('button', { name: '拡大', exact: true }).isDisabled())
  const region = diagram.getByRole('region')
  assert.ok(await region.evaluate((element) => element.scrollWidth > element.clientWidth))
  await region.evaluate((element) => {
    element.scrollLeft = element.scrollWidth
  })
  assert.ok(await region.evaluate((element) => element.scrollLeft > 0))
  await diagram.getByRole('button', { name: 'ズームをリセット' }).click()
  assert.equal(await diagram.locator('output').textContent(), '100%')
  assert.ok(Math.abs((await svg.boundingBox()).width - initialWidth) < 2)
  await diagram.getByRole('button', { name: '縮小', exact: true }).click({ clickCount: 2, delay: 50 })
  assert.equal(await diagram.locator('output').textContent(), '50%')
  assert.ok(await diagram.getByRole('button', { name: '縮小', exact: true }).isDisabled())
  await diagram.getByRole('button', { name: 'ズームをリセット' }).click()
  await diagram.screenshot({ path: '/tmp/docs-mermaid-desktop.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await diagram.getByRole('button', { name: '拡大', exact: true }).click()
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await diagram.screenshot({ path: '/tmp/docs-mermaid-mobile.png' })
  await page.goto(`${process.env.DOCS_TEST_ORIGIN ?? 'http://localhost:3030'}/ja-JP/server/import-export`)
  assert.ok((await page.locator('body').innerText()).includes('インポートとエクスポート'))
  assert.ok(!(await page.locator('body').innerText()).includes('Import & export'))
  assert.deepEqual(errors, [])
  console.log('Mermaid zoom bounds, overflow, reset, mobile layout, and Japanese navigation passed.')
} finally {
  await browser.close()
}
