import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

await test('cell backgrounds override both row and column defaults', async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(
      `${process.env.DOCS_ORIGIN || 'http://localhost:3030'}/zh-CN/guides/sheets/features/core/default-style`,
    )
    const demo = page.getByRole('region', { name: '背景色优先级示意' })
    const background = (address) =>
      demo
        .getByText(address, { exact: true })
        .evaluate((element) => getComputedStyle(element.parentElement).backgroundColor)
    assert.equal(await background('B2'), await background('B1'))
    await demo.getByRole('checkbox', { name: '行样式优先', exact: true }).check()
    assert.equal(await background('B2'), await background('A2'))
    await demo.getByRole('checkbox', { name: '为 B2 设置单元格背景' }).check()
    const cellBackground = await background('B2')
    assert.notEqual(cellBackground, await background('A2'))
    assert.notEqual(cellBackground, await background('B1'))
    await demo.getByRole('checkbox', { name: '行样式优先', exact: true }).uncheck()
    assert.equal(await background('B2'), cellBackground)
    assert.match(await demo.getByRole('status').innerText(), /单元格/)
    await demo.getByRole('checkbox', { name: '为 B2 设置单元格背景' }).uncheck()
    assert.equal(await background('B2'), await background('B1'))
    assert.ok(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth))
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
