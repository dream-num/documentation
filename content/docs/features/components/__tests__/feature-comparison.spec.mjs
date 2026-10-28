import assert from 'node:assert/strict'
import process from 'node:process'
import { after, before, test } from 'node:test'
import { chromium, expect } from 'playwright/test'

const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
let browser
before(async () => {
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
})
after(async () => {
  await browser.close()
})

test('search, category, open-source and differences filters compose and reset', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  try {
    await page.goto(`${origin}/zh-CN/overview/features/sheets`)
    const rows = page.locator('.feature-comparison tbody tr:visible')
    const total = await rows.count()
    const search = page.getByRole('searchbox')
    const category = page.locator('article select')
    const openSource = page.getByRole('checkbox').nth(0)
    const differences = page.getByRole('checkbox').nth(1)
    await category.selectOption({ label: '条件格式' })
    await openSource.check()
    await differences.check()
    await expect(rows).toHaveCount(1)
    await expect(rows).toContainText('色阶、数据条与图标集')
    await search.fill('no-matching-feature-782')
    await expect(rows).toHaveCount(0)
    await expect(page.locator('.feature-comparison h2:visible')).toHaveCount(0)
    await page.getByRole('button', { name: '重置' }).click()
    await expect(rows).toHaveCount(total)
    await expect(search).toHaveValue('')
    await expect(category).toHaveValue('all')
    await expect(openSource).not.toBeChecked()
    await expect(differences).not.toBeChecked()

    await differences.check()
    await search.fill('图形对象')
    await expect(rows).toHaveCount(1)
    await expect(rows).toContainText('内置绘图编辑器')
  } finally {
    await page.close()
  }
})

for (const sameFragment of [false, true]) {
  test(`category links reveal hidden content with ${sameFragment ? 'the current' : 'another'} fragment`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    try {
      await page.goto(`${origin}/zh-CN/overview/features/sheets`)
      const heading = page.locator('.feature-comparison h2').first()
      const category = page.locator('article select')
      const rows = page.locator('.feature-comparison tbody tr:visible')
      const total = await rows.count()
      const link = page
        .locator('[data-toc-link]')
        .filter({ hasText: await heading.innerText() })
        .first()
      if (sameFragment) await link.click()
      await category.selectOption('1')
      await expect(heading).toBeHidden()
      await link.click()
      await expect(category).toHaveValue('all')
      await expect(rows).toHaveCount(total)
      await expect(heading).toBeInViewport()

      const search = page.getByRole('searchbox')
      await search.fill('no-matching-feature-782')
      await expect(rows).toHaveCount(0)
      await link.click()
      await expect(search).toHaveValue('')
      await expect(rows).toHaveCount(total)
      await expect(heading).toBeInViewport()
      assert.equal(decodeURIComponent(new URL(page.url()).hash), `#${await heading.getAttribute('id')}`)
    } finally {
      await page.close()
    }
  })
}

test('an ordinary TOC click does not scroll a later filter edit back to the heading', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  try {
    await page.goto(`${origin}/zh-CN/overview/features/sheets`)
    await page.locator('[data-toc-link]').first().click()
    const search = page.getByRole('searchbox')
    await search.fill('工作表')
    await expect(search).toBeInViewport()
  } finally {
    await page.close()
  }
})

test('chart descriptions do not count as differences when all products support the chart type', async () => {
  const page = await browser.newPage()
  try {
    await page.goto(`${origin}/zh-CN/overview/features/charts`)
    await page.getByRole('checkbox').nth(1).check()
    const rows = page.locator('.feature-comparison tbody tr:visible')
    await expect(rows.filter({ hasText: '簇状柱形图' })).toHaveCount(0)
    await expect(rows.filter({ hasText: '三维折线图' })).toHaveCount(1)
  } finally {
    await page.close()
  }
})
