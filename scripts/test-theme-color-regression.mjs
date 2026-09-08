import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
try {
  await page.goto(`${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/en-US/playground/theme-customizer`, {
    waitUntil: 'networkidle', timeout: 120000,
  })
  const field = page.getByPlaceholder('#000000').first()
  const initial = await field.inputValue()
  await field.fill('#000000')
  await field.press('Tab')
  assert.equal((await field.inputValue()).toUpperCase(), '#000000')
  await page.getByRole('button', { name: /Choose color.*gray\.0/i }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  assert.ok(await dialog.locator('input').evaluateAll(inputs => inputs.some(input => /^(#)?000000$/i.test(input.value))))
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Reset default', exact: true }).click()
  await page.waitForFunction(value => document.querySelector('input[placeholder="#000000"]')?.value === value, initial)
  await field.fill('not-a-color')
  await field.press('Tab')
  assert.equal(await field.inputValue(), initial)
  assert.deepEqual(errors, [])
  console.log('PASS black color initialization, invalid draft recovery, parent reset and theme page runtime')
} finally {
  await browser.close()
}
