import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

await test('filtering preserves records and numeric sorting changes row order on both guides', async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
    await page.goto(`${origin}/zh-CN/guides/sheets/features/filter`)
    const demo = page.getByRole('region', { name: '筛选与排序学习计划' })
    const ids = () => demo.locator('tbody tr td:first-child').allTextContents()
    const original = await ids()
    await demo.getByRole('checkbox', { name: '只看进度 ≥ 70%' }).check()
    assert.equal((await ids()).length, 4)
    assert.match(await demo.getByRole('status').innerText(), /4 \/ 6/)
    await demo.getByRole('button', { name: '进度升序', exact: true }).click()
    assert.deepEqual(await ids(), ['6', '1', '4', '2'])
    await demo.getByRole('button', { name: '进度降序', exact: true }).click()
    assert.deepEqual(await ids(), ['2', '4', '1', '6'])
    await demo.getByRole('checkbox', { name: '只看进度 ≥ 70%' }).uncheck()
    assert.deepEqual(new Set(await ids()), new Set(original))
    await demo.getByRole('button', { name: '原始顺序', exact: true }).click()
    assert.deepEqual(await ids(), original)
    assert.ok(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth))
    await page.goto(`${origin}/en-US/guides/sheets/features/sort`)
    const english = page.getByRole('region', { name: 'Filter and sort a learning plan' })
    await english.getByRole('button', { name: 'Progress ↑', exact: true }).click()
    assert.equal(await english.locator('tbody tr').first().locator('td').nth(1).innerText(), 'Boards')
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
