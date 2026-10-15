import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

await Promise.all(
  [
    { width: 1440, reducedMotion: 'no-preference' },
    { width: 390, reducedMotion: 'no-preference' },
    { width: 1440, reducedMotion: 'reduce' },
  ].map(({ width, reducedMotion }) =>
    test(`image preview supports keyboard, dismissal and viewport fit at ${width}px / ${reducedMotion}`, async () => {
      const browser = await chromium.launch()
      try {
        const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion })
        const errors = []
        page.on('pageerror', (error) => errors.push(error.message))
        const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
        await page.goto(`${origin}/zh-CN/guides/sheets/features/pivot-table`)
        const thumbnail = page.locator('article img').first()
        await thumbnail.waitFor()
        await thumbnail.evaluate((image) => image.decode())
        const trigger = page.getByRole('button', { name: /放大/ }).first()
        await trigger.scrollIntoViewIfNeeded()
        await trigger.focus()
        await page.keyboard.press('Enter')
        const dialog = page.getByRole('dialog')
        await dialog.waitFor()
        await dialog.locator('img').evaluate((image) => image.decode())
        await page.waitForFunction(
          () => getComputedStyle(document.querySelector('[role="dialog"]')).transform === 'none',
        )
        const bounds = await dialog.locator('img').boundingBox()
        assert.ok(bounds.x >= 0 && bounds.y >= 0)
        assert.ok(bounds.x + bounds.width <= width && bounds.y + bounds.height <= 900)
        assert.equal((await dialog.getAttribute('aria-labelledby')) !== null, true)
        await page.keyboard.press('Escape')
        await dialog.waitFor({ state: 'detached' })
        assert.ok(await trigger.evaluate((element) => element === document.activeElement))
        await trigger.click()
        await dialog.waitFor()
        await page.mouse.click(4, 4)
        await dialog.waitFor({ state: 'detached' })
        await trigger.click()
        await dialog.getByRole('button', { name: '缩小', exact: true }).click()
        await dialog.waitFor({ state: 'detached' })
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
        assert.deepEqual(errors, [])
      } finally {
        await browser.close()
      }
    }),
  ),
)
