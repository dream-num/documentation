import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

await test('freeze controls keep the selected panes stationary while other cells scroll', async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${process.env.DOCS_ORIGIN || 'http://localhost:3030'}/zh-CN/guides/sheets/features/core/freeze`)
    const demo = page.getByRole('region', { name: '冻结窗格示意', exact: true })
    const viewport = demo.getByRole('region', { name: '可滚动工作表' })
    await viewport.scrollIntoViewIfNeeded()
    const position = (address) => demo.getByRole('cell', { name: address, exact: true }).boundingBox()
    const scroll = () =>
      viewport.evaluate((element) => {
        element.scrollTo(160, 144)
        return new Promise((resolve) => requestAnimationFrame(() => resolve()))
      })
    const initial = await position('A1')
    const moving = await position('C8')
    await scroll()
    assert.deepEqual(await position('A1'), initial)
    const moved = await position('C8')
    assert.equal(moving.x - moved.x, 160)
    assert.equal(moving.y - moved.y, 144)
    assert.ok(
      await demo.getByRole('cell', { name: 'A1', exact: true }).evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return document.elementFromPoint(rect.x + 8, rect.y + 8) === element
      }),
      'the frozen intersection must not be covered by scrolling cells',
    )

    await demo.getByRole('button', { name: '第 2 行与 B 列', exact: true }).click()
    assert.equal(await demo.getByRole('cell', { name: 'A1', exact: true }).count(), 0)
    const advanced = await position('B2')
    await scroll()
    assert.deepEqual(await position('B2'), advanced)

    await demo.getByRole('button', { name: '首行', exact: true }).click()
    const rowOnly = await position('A1')
    await scroll()
    const rowOnlyAfter = await position('A1')
    assert.equal(rowOnlyAfter.y, rowOnly.y)
    assert.equal(rowOnly.x - rowOnlyAfter.x, 160)

    await demo.getByRole('button', { name: '不冻结', exact: true }).click()
    const unfrozen = await position('A1')
    await scroll()
    const unfrozenAfter = await position('A1')
    assert.equal(unfrozen.x - unfrozenAfter.x, 160)
    assert.equal(unfrozen.y - unfrozenAfter.y, 144)
    assert.ok(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth))
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
