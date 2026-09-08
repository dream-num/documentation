/* eslint-disable no-await-in-loop -- Inspect selected exports and locales sequentially on one port. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

assert.ok(process.argv[2], 'Pass the selected product-launch and quarterly-business-review export manifest')
const entries = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const sources = await readShowcaseSources()
assert.deepEqual(entries.map(({ slug }) => slug).toSorted(), [
  'slides/product-launch',
  'slides/quarterly-business-review',
])
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/rich-slides-export-native')
const port = Number(process.env.SHOWCASE_EXPORT_PORT || 4427)
await fs.mkdir(output, { recursive: true })
const report = {
  scope:
    'Selected English-only production exports under EN/ZH host languages: native notes Save, root font, same-owner complete-model theme preservation and pagehide cleanup; not full history or React Preview acceptance.',
  passed: false,
  results: [],
}
const browser = await chromium.launch()
try {
  for (const entry of entries) {
    const source = sources.find(({ slug }) => slug === entry.slug)
    assert.ok(source)
    for (const [name, content] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content, name)
    const { preview } = await import(pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js')))
    const server = await preview({
      root: entry.directory,
      configFile: false,
      preview: { host: '127.0.0.1', port, strictPort: true },
    })
    try {
      for (const lang of ['en-US', 'zh-CN']) {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
        const result = { slug: entry.slug, lang, passed: false, errors: [], writes: [] }
        report.results.push(result)
        try {
          page.setDefaultTimeout(30000)
          page.on('pageerror', (error) => result.errors.push(error.message))
          page.on('console', (message) => {
            if (message.type() === 'error') result.errors.push(message.text())
          })
          page.on('request', (request) => {
            if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.writes.push(request.url())
          })
          const url = `http://127.0.0.1:${port}/`
          await page.route(url, async (route) => {
            const response = await route.fetch()
            await route.fulfill({
              response,
              body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`),
            })
          })
          await page.goto(url)
          await page.waitForFunction(
            () => window.univerAPI?.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
          )
          await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'hidden' })
          result.font = await page
            .locator('[data-u-comp="workbench-layout"]')
            .evaluate((element) => getComputedStyle(element).fontFamily)
          assert.match(result.font, /Arial/)
          const notes = page.locator('[data-u-comp="slide-speaker-notes-display"]')
          assert.equal(await page.locator('html').getAttribute('lang'), lang)
          assert.doesNotMatch(await page.locator('#app').innerText(), /[\u3400-\u9fff]/)
          const text = 'Review the decision and confirm the next accountable owner.'
          await notes.getByRole('textbox', { name: 'Speaker notes', exact: true }).fill(text)
          await notes.getByRole('button', { name: 'Save', exact: true }).click()
          const before = await page.evaluate(() => {
            window.checkedOwner = window.univerAPI
            return window.univerAPI.getActivePresentation().save()
          })
          assert.equal(before.slides[before.activeSlideId].speakerNotes, text)
          for (const dark of [true, false]) {
            await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
            await page.waitForFunction((value) => window.univerAPI.isDarkMode() === value, dark)
            await page.evaluate(
              () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
            )
            assert.equal(await page.evaluate(() => window.checkedOwner === window.univerAPI), true)
            assert.deepEqual(await page.evaluate(() => window.univerAPI.getActivePresentation().save()), before)
          }
          result.screenshot = path.join(output, `${entry.slug.replaceAll('/', '-')}-${lang}-native.png`)
          await page.screenshot({ path: result.screenshot })
          await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
          assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
          assert.equal(await page.locator('[data-u-comp="workbench-layout"]').count(), 0)
          assert.deepEqual(result.errors, [])
          assert.deepEqual(result.writes, [])
          result.passed = true
        } finally {
          await page.close()
        }
      }
    } finally {
      await new Promise((resolve) => server.httpServer.close(resolve))
    }
  }
  report.passed = true
} catch (error) {
  report.failure = error.stack
  process.exitCode = 1
} finally {
  await browser.close()
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
}
console.log(JSON.stringify(report))
