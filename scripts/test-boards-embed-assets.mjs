/* eslint-disable no-await-in-loop -- Check only the four explicitly patched exports. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import embedEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import { chromium } from 'playwright'

const manifestPath = process.argv[2]
const entries = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/boards-embed-assets-runtime')
await fs.mkdir(output, { recursive: true })
const targets = {
  'alignment-spacing': 'assignment',
  'create-save-and-restore-board': 'supplies',
  'connector-routing': 'tests',
  'incident-response': 'detect',
}
assert.equal(entries.length, 4)
function leaves(actual, expected) {
  let count = 0
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') count += leaves(actual?.[key], value)
    else {
      assert.equal(actual?.[key], value, key)
      count++
    }
  }
  return count
}
const browser = await chromium.launch()
const results = []
try {
  for (const entry of entries) {
    assert.ok(entry.passed)
    const name = entry.slug.split('/')[1]
    assert.ok(targets[name])
    const vite = entry.links.find(({ name: packageName }) => packageName === 'vite')
    const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
    const server = await preview({
      root: entry.directory,
      configFile: false,
      preview: { host: '127.0.0.1', port: 4453, strictPort: true },
    })
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, locale: 'zh-CN' })
    const result = { slug: entry.slug, passed: false, errors: [] }
    results.push(result)
    page.on('pageerror', (error) => result.errors.push(error.stack || String(error)))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.route('http://127.0.0.1:4453/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, '<html lang="zh-CN">') })
    })
    try {
      await page.goto('http://127.0.0.1:4453/')
      await page.locator('[data-ready="true"]').waitFor({ timeout: 60000 })
      await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      result.embedEnglishLeaves = leaves(await page.evaluate(() => window.univerAPI.getLocales()), embedEnUS)
      result.assetsPassed = true
      await page.waitForFunction(
        () => {
          const current = JSON.stringify(window.univerAPI.getActiveBoard().save())
          window.assetStableCount = window.assetLastSnapshot === current ? (window.assetStableCount || 0) + 1 : 0
          window.assetLastSnapshot = current
          return window.assetStableCount >= 5
        },
        null,
        { polling: 100 },
      )
      const before = await page.evaluate(() => window.univerAPI.getActiveBoard().save())
      const point = await page.evaluate((id) => {
        const p = window.univerAPI.getActiveBoard().getElementViewportPoint(id)
        const rect = document.querySelector('[data-board-viewport-host] canvas').getBoundingClientRect()
        return { x: p.x + rect.x, y: p.y + rect.y }
      }, targets[name])
      await page.mouse.click(point.x, point.y, { button: 'right' })
      await page.screenshot({ path: path.join(output, name + '-native-context.png') })
      const labels = await page.locator('body').innerText()
      await fs.writeFile(path.join(output, name + '-native-labels.txt'), labels)
      assert.doesNotMatch(labels, /[\u3400-\u9fff]|embed-unit-ui\./)
      const bind = page.getByText('Bind formula', { exact: true })
      if ((await bind.count()) && (await bind.first().isVisible())) {
        await bind.first().click()
        await page.screenshot({ path: path.join(output, name + '-formula-dialog.png') })
        result.formulaDialogLabels = await page.locator('body').innerText()
        await page.getByRole('button', { name: 'Cancel', exact: true }).click()
        result.nativeFormulaDialog = 'opened and cancelled; resource picker not asserted'
      } else result.nativeFormulaDialog = 'not exposed in this existing shape context; resource picker unverified'
      await page.keyboard.press('Escape')
      assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveBoard().save()), before)
      assert.deepEqual(result.errors, [])
      result.passed = true
    } catch (error) {
      result.failure = error.stack || String(error)
      await page.screenshot({ path: path.join(output, name + '-failure.png') })
    } finally {
      await page.close()
      await new Promise((resolve) => server.httpServer.close(resolve))
    }
  }
} finally {
  await browser.close()
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ manifestPath, results }, null, 2))
}
console.log(JSON.stringify(results, null, 2))
assert.ok(results.every((result) => result.passed))
