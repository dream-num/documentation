/* eslint-disable no-await-in-loop -- Exercise different-fragment and same-fragment interactions on the same browser page. */
import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

test('category links reveal filtered content before scrolling, including the current fragment', async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
    await page.goto(`${origin}/zh-CN/docs/features/sheets`)
    const heading = page.locator('.feature-comparison h2').first()
    const id = await heading.getAttribute('id')
    assert.ok(id)
    const link = page
      .locator('[data-toc-link]')
      .filter({ hasText: await heading.innerText() })
      .first()
    const category = page.locator('article select').first()
    const rows = page.locator('.feature-comparison tbody tr:visible')
    await page.waitForFunction(() => document.querySelectorAll('.feature-comparison tbody tr').length === 83)
    const search = page.locator('article input[type="search"]')
    await link.click()
    await search.fill('工作表')
    await page.waitForFunction(
      () => document.querySelectorAll('.feature-comparison tbody tr:not([hidden])').length < 83,
    )
    const searchBounds = await search.boundingBox()
    assert.ok(
      searchBounds && searchBounds.y >= 0,
      'An ordinary TOC click must not queue a scroll for the next filter edit',
    )
    await search.fill('')
    await page.waitForFunction(
      () => document.querySelectorAll('.feature-comparison tbody tr:not([hidden])').length === 83,
    )

    for (const sameFragment of [false, true]) {
      if (!sameFragment) {
        const otherHeading = page.locator('.feature-comparison h2').nth(1)
        await page
          .locator('[data-toc-link]')
          .filter({ hasText: await otherHeading.innerText() })
          .first()
          .click()
      }
      await category.selectOption('1')
      await heading.waitFor({ state: 'hidden' })
      if (sameFragment) assert.equal(decodeURIComponent(new URL(page.url()).hash), `#${id}`)
      await link.click()
      await page.waitForFunction((target) => {
        const element = document.getElementById(target)
        const bounds = element.getBoundingClientRect()
        return !element.hidden && bounds.top >= 0 && bounds.bottom <= window.innerHeight
      }, id)
      assert.equal(await category.inputValue(), 'all')
      assert.equal(await rows.count(), 83)
    }

    await search.fill('no-matching-feature-782')
    await heading.waitFor({ state: 'hidden' })
    assert.equal(await rows.count(), 0)
    await link.click()
    await heading.waitFor({ state: 'visible' })
    assert.equal(await search.inputValue(), '')
    assert.equal(await rows.count(), 83)
  } finally {
    await browser.close()
  }
})
