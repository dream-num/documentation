import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

await Promise.all(
  [1440, 390].map((width) =>
    test(`fragment links replace the current anchor and survive reload at ${width}px`, async () => {
      const browser = await chromium.launch()
      try {
        const page = await browser.newPage({ viewport: { width, height: 900 } })
        const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
        await page.goto(`${origin}/zh-CN/guides/sheets/features/core/range-selection#keyboard-navigation`)
        const eventLink = page.locator('article a[href="#events"]').first()
        await eventLink.click()
        await page.waitForURL(/#events$/)
        assert.equal(new URL(page.url()).hash, '#events')
        await page.reload()
        const eventHeading = page.locator('#events')
        await eventHeading.waitFor()
        await page.waitForFunction(() => {
          const bounds = document.getElementById('events').getBoundingClientRect()
          return bounds.top >= 0 && bounds.bottom <= window.innerHeight
        })
        await page.locator('article a[href="#keyboard-navigation"]').first().click()
        await page.waitForURL(/#keyboard-navigation$/)
        await page.goBack()
        await page.waitForURL(/#events$/)
        assert.equal(new URL(page.url()).hash, '#events')
      } finally {
        await browser.close()
      }
    }),
  ),
)
