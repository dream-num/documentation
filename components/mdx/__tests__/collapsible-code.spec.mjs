import assert from 'node:assert/strict'

import { chromium } from 'playwright'

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.goto(`${process.env.DOCS_TEST_URL ?? 'http://localhost:3030'}/zh-CN/server/collaboration/quick-start`)
  const expand = page.getByRole('button', { name: '展开代码', exact: true }).first()
  await expand.waitFor()
  const contentId = await expand.getAttribute('aria-controls')
  const content = page.locator(`[id="${contentId}"]`)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  const fullCode = await content.locator('pre').textContent()
  assert.equal(await expand.getAttribute('aria-expanded'), 'false')
  assert.ok((await content.boundingBox()).height <= 320)
  const block = expand.locator('xpath=ancestor::*[@data-code-block][1]')
  const expectedCopy = await content.locator('pre .line').allTextContents()
  await block.getByRole('button', { name: '复制代码', exact: true }).click()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expectedCopy.join('\n').trim())
  await expand.click()
  const collapse = page.getByRole('button', { name: '收起代码', exact: true }).first()
  assert.equal(await collapse.getAttribute('aria-expanded'), 'true')
  assert.ok((await content.boundingBox()).height > 320)
  assert.equal(await content.locator('pre').textContent(), fullCode)
  await collapse.focus()
  await page.keyboard.press('Enter')
  assert.equal(await expand.getAttribute('aria-expanded'), 'false')
  assert.ok((await content.boundingBox()).height <= 320)
  console.log('Code expands and collapses by pointer and keyboard without truncating content.')
} finally {
  await browser.close()
}
