import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

await test('number formats change the display without changing the input and reject empty values', async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${process.env.DOCS_ORIGIN || 'http://localhost:3030'}/zh-CN/guides/sheets/features/core/numfmt`)
    const demo = page.getByRole('region', { name: '数字格式示意' })
    const input = demo.getByRole('spinbutton', { name: '存储数值' })
    const output = demo.getByRole('status')
    assert.match(await output.innerText(), /1,234\.57/)
    await demo.getByRole('combobox', { name: '格式地区' }).click()
    await page.getByRole('option', { name: 'Deutsch', exact: true }).click()
    assert.match(await output.innerText(), /1\.234,57/)
    assert.equal(await input.inputValue(), '1234.567')
    await demo.getByRole('combobox', { name: '格式地区' }).click()
    await page.getByRole('option', { name: 'English', exact: true }).click()
    await input.fill('0.25')
    await demo.getByRole('combobox', { name: '格式代码' }).click()
    await page.getByRole('option', { name: '0.00%', exact: true }).click()
    assert.match(await output.innerText(), /25\.00%/)
    assert.equal(await input.inputValue(), '0.25')
    await input.fill('45658')
    await demo.getByRole('combobox', { name: '格式代码' }).click()
    await page.getByRole('option', { name: 'yyyy-mm-dd', exact: true }).click()
    assert.match(await output.innerText(), /2025-01-01/)
    await input.fill('')
    assert.equal(await input.getAttribute('aria-invalid'), 'true')
    assert.match(await output.innerText(), /—/)
    await input.fill('0')
    await demo.getByRole('combobox', { name: '格式代码' }).click()
    await page.getByRole('option', { name: 'General', exact: true }).click()
    assert.equal(await input.getAttribute('aria-invalid'), 'false')
    assert.equal(await output.locator('p').nth(1).innerText(), '0')
    assert.ok(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth))
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
