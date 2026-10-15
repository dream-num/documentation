import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

await test('wrapping modes change text flow beside, in line with, or below the image', async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${process.env.DOCS_ORIGIN || 'http://localhost:3030'}/zh-CN/guides/docs/features/images`)
    const demo = page.getByRole('region', { name: '图文环绕示意' })
    const geometry = () =>
      demo.getByRole('img').evaluate((element) => {
        const range = document.createRange()
        range.selectNodeContents(element.nextElementSibling)
        const lines = [...range.getClientRects()]
        return { image: element.getBoundingClientRect().toJSON(), text: lines[0].toJSON(), last: lines.at(-1).toJSON() }
      })
    const square = await geometry()
    assert.ok(square.text.x >= square.image.right)
    assert.ok(square.text.y < square.image.bottom - 40)
    assert.equal(square.last.x, square.image.x)
    assert.ok(square.last.y > square.image.bottom)
    await demo.getByRole('button', { name: '嵌入型', exact: true }).click()
    const inline = await geometry()
    assert.ok(inline.text.x >= inline.image.right)
    assert.ok(inline.text.y > inline.image.top + inline.image.height / 2)
    await demo.getByRole('button', { name: '上下型', exact: true }).click()
    const topAndBottom = await geometry()
    assert.ok(topAndBottom.text.y > topAndBottom.image.bottom)
    assert.equal(topAndBottom.text.x, topAndBottom.image.x)
    await page.setViewportSize({ width: 390, height: 900 })
    await demo.getByRole('button', { name: '四周型', exact: true }).click()
    const mobile = await geometry()
    assert.ok(mobile.text.x >= mobile.image.right)
    assert.ok(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth))
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
