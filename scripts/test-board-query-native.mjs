/* eslint-disable no-await-in-loop -- Localized browser cases run sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/board-query-native'
let server
if (process.argv[2]) {
  const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
  const entry = manifest.find(({ slug }) => slug === 'boards/search-element-query')
  assert.ok(entry?.passed)
  const { preview } = await import(pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js')))
  server = await preview({
    root: entry.directory,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4442, strictPort: true },
  })
}
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const report = {
  passed: false,
  themeMode: server ? 'standalone-facade' : 'site-storage-event',
  locales: [],
  errors: [],
}
await page.addInitScript(() => localStorage.setItem('theme', 'light'))
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  for (const locale of ['en-US', 'zh-CN']) {
    if (server) {
      await page.unroute('http://127.0.0.1:4442/')
      await page.route('http://127.0.0.1:4442/', async (route) => {
        const response = await route.fetch()
        await route.fulfill({
          response,
          body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${locale}">`),
        })
      })
    }
    await page.goto(
      server
        ? 'http://127.0.0.1:4442/'
        : `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/boards/search-element-query`,
      { waitUntil: 'domcontentloaded', timeout: 120000 },
    )
    const root = page.locator('.query-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await root.locator('canvas').first().waitFor()
    assert.equal(await root.locator(':scope > details, :scope > output, :scope > .hint').count(), 0)
    assert.equal(await root.locator('fieldset button').count(), 2, 'Keep only meaningful query actions')
    assert.ok((await root.locator('.query-editor button').count()) > 0, 'Native Board controls must remain')
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    assert.doesNotMatch(await root.innerText(), /[\u3400-\u9fff]/)
    const input = root.getByLabel('Search text', { exact: true })
    const type = root.getByLabel('Element type', { exact: true })
    const search = root.getByRole('button', { name: 'Search', exact: true })
    const cases = []
    for (const [text, filter, count] of [
      ['Risk', 'shape', 3],
      [' risk ', 'shape', 3],
      ['RISK', 'all', 4],
      ['Approved', 'connector', 1],
      ['', 'all', 0],
      ['not-found-xyz', 'all', 0],
    ]) {
      await input.fill(text)
      await type.selectOption(filter)
      await search.click()
      const expected = await page.evaluate(
        ({ text: queryText, filter: queryType }) => {
          const api = window.univerAPI
          const board = api.getActiveBoard()
          const elementType =
            queryType === 'shape'
              ? api.Enum.BoardElementType.Shape
              : queryType === 'connector'
                ? api.Enum.BoardElementType.Connector
                : undefined
          const allowed = new Set(board.describeElements({ elementType }).map((item) => item.id))
          const hits = board.findElementsByText(queryText).filter((hit) => allowed.has(hit.elementId))
          const ids = [...new Set(hits.map((hit) => hit.elementId))]
          return { ids, hitCount: hits.length, bounds: board.getElementsBoundingRectByIds(ids) }
        },
        { text, filter },
      )
      const actual = await root
        .locator('.query-results button')
        .evaluateAll((buttons) => buttons.map((button) => button.dataset.element))
      assert.equal(actual.length, count)
      assert.deepEqual(actual, expected.ids)
      if (!count) assert.equal(expected.bounds, null)
      if (text === 'RISK')
        assert.ok(expected.hitCount > expected.ids.length, 'Connector name and label produce duplicate hits')
      cases.push({ text, filter, count, hitCount: expected.hitCount })
    }
    for (const [filter, count] of [
      ['shape', 4],
      ['connector', 2],
      ['all', 6],
    ]) {
      await type.selectOption(filter)
      await root.getByRole('button', { name: 'List by type', exact: true }).click()
      assert.equal(await root.locator('.query-results button').count(), count)
    }
    await root.locator('.query-results button[data-element="card-d"]').click()
    const focused = await page.evaluate(() => {
      const rect = document.querySelector('.query-editor').getBoundingClientRect()
      return {
        actual: window.univerAPI.getActiveBoard().getElementViewportPoint('card-d'),
        target: { x: rect.width / 2, y: rect.height / 2 },
      }
    })
    assert.ok(focused.actual)
    assert.ok(
      Math.abs(focused.actual.x - focused.target.x) < 2 && Math.abs(focused.actual.y - focused.target.y) < 2,
      'Clicking a result must pan it to the requested viewport point',
    )
    await page.screenshot({ path: `${output}/${locale}.png` })
    await page.waitForFunction(
      () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
    )
    await page.evaluate(() => {
      window.__queryThemeOwner = window.univerAPI
      window.univerAPI.getActiveBoard().getShape('card-d').getText().setText('Theme probe')
    })
    await input.fill('Theme probe')
    await search.click()
    const beforeTheme = await page.evaluate(() => ({
      snapshot: window.univerAPI.getActiveBoard().save(),
      input: document.querySelector('.query-demo input').value,
      type: document.querySelector('.query-demo select').value,
      results: document.querySelector('.query-results').textContent,
    }))
    for (const theme of ['dark', 'light']) {
      if (server) await page.evaluate((dark) => window.univerAPI.toggleDarkMode(dark), theme === 'dark')
      else
        await page.evaluate((value) => {
          localStorage.setItem('theme', value)
          window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value }))
        }, theme)
      await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
      const afterTheme = await page.evaluate(() => ({
        sameOwner: window.__queryThemeOwner === window.univerAPI,
        state: {
          snapshot: window.univerAPI.getActiveBoard().save(),
          input: document.querySelector('.query-demo input').value,
          type: document.querySelector('.query-demo select').value,
          results: document.querySelector('.query-results').textContent,
        },
      }))
      assert.ok(afterTheme.sameOwner)
      assert.deepEqual(afterTheme.state, beforeTheme)
      await page.screenshot({ path: `${output}/${locale}-${theme}.png` })
    }
    report.locales.push({
      locale,
      cases,
      typeCounts: [4, 2, 6],
      publicFocus: focused,
      nativeBoardControls: true,
      sameThemeOwner: true,
      themePreservesEditedBoardAndQuery: true,
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  if (!report.passed) await page.screenshot({ path: `${output}/failure.png` }).catch(() => {})
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
  await server?.close()
}
