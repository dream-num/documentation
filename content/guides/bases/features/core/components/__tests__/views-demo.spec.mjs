import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

await test('editing a record is reflected in grid, kanban and calendar without copying it', async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${process.env.DOCS_ORIGIN || 'http://localhost:3030'}/zh-CN/guides/bases/features/core/views`)
    const demo = page.getByRole('region', { name: '同一张表，多种视图' })
    await demo.getByRole('combobox', { name: 'Sheets 课程状态' }).click()
    await page.getByRole('option', { name: '已完成', exact: true }).click()
    assert.match(await demo.getByRole('row').filter({ hasText: 'Sheets' }).innerText(), /已完成/)
    await demo.getByRole('button', { name: '看板', exact: true }).click()
    const board = demo.getByRole('region', { name: '看板', exact: true })
    assert.equal(
      await board
        .getByRole('region', { name: '已完成', exact: true })
        .getByRole('article', { name: 'Sheets', exact: true })
        .count(),
      1,
    )
    assert.equal(await board.getByRole('article').count(), 4)
    await demo.getByRole('combobox', { name: 'Sheets 课程状态' }).click()
    await page.getByRole('option', { name: '进行中', exact: true }).click()
    assert.equal(
      await board
        .getByRole('region', { name: '已完成', exact: true })
        .getByRole('article', { name: 'Sheets', exact: true })
        .count(),
      0,
    )
    assert.equal(
      await board
        .getByRole('region', { name: '进行中', exact: true })
        .getByRole('article', { name: 'Sheets', exact: true })
        .count(),
      1,
    )
    await demo.getByRole('button', { name: '日历', exact: true }).click()
    const calendar = demo.getByRole('region', { name: '日历', exact: true })
    assert.match(
      await calendar
        .getByRole('region', { name: '09 / 02', exact: true })
        .getByRole('article', { name: 'Sheets', exact: true })
        .innerText(),
      /进行中/,
    )
    assert.equal(await calendar.getByRole('article').count(), 4)
    assert.ok(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth))
    await demo.getByRole('button', { name: '网格', exact: true }).click()
    assert.match(await demo.getByRole('row').filter({ hasText: 'Sheets' }).innerText(), /进行中/)
    assert.equal(await demo.locator('tbody tr').count(), 4)
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
