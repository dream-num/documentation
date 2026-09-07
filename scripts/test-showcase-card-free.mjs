/* eslint-disable no-await-in-loop -- Verify each localized layout and its isolated negative control in sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/showcase-card-free')
const origin = process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4324'
await fs.mkdir(directory, { recursive: true })
const route = await fs.readFile('app/[lang]/(home)/showcase/[...slug]/page.tsx', 'utf8')
assert.ok(!route.includes('ShowcaseGuide'), 'The shared route must not reintroduce the explanation card')
assert.ok(route.includes('<PlaygroundFrame'), 'Retain the runnable preview and its source editor')
const removedHeadings = [
  'What it demonstrates',
  '功能说明',
  'Try it',
  '操作步骤',
  'Expected result',
  '预期结果',
  'Packages and plugins',
  '所需插件与包',
  'Related APIs',
  '相关 API',
  'Variants',
  '变体',
  'Actions',
  '操作',
  'States',
  '状态',
]
const report = { passed: false, checks: [], errors: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
async function cardAbsent() {
  for (const name of removedHeadings)
    assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0, name)
}
try {
  for (const [locale, title] of [
    ['en-US', 'Violet / Editorial Review'],
    ['zh-CN', 'Violet / 编辑选题复盘'],
  ]) {
    await page.setViewportSize({ width: 1440, height: 1000 })
    const response = await page.goto(`${origin}/${locale}/showcase/embed/base-to-slides-tab`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    assert.equal(response.status(), 200)
    const heading = page.getByRole('heading', { level: 1, name: title, exact: true })
    await heading.waitFor()
    await cardAbsent()
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    // Resolve through the locator while Next hydrates/replaces its initial iframe.
    await page.frameLocator('iframe').first().locator('.violet-embed[data-ready=true]').waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    await frame.locator('.violet-embed[data-ready=true]').waitFor({ timeout: 120000 })
    assert.equal(await frame.locator('.violet-embed [data-u-comp="slide-thumbnail-item"]').count(), 4)
    const readModels = () =>
      frame.evaluate(() => {
        const models = JSON.parse(
          JSON.stringify({
            source: window.univerAPI.getBase('violet-editorial-register').save(),
            slides: window.univerAPI.getPresentation('violet-editorial-deck').save(),
          }),
        )
        // Native fit-to-width persists zoomRatio; only this view setting may change.
        delete models.slides.zoomRatio
        return models
      })
    const before = await readModels()
    await frame.evaluate(() => {
      window.layoutOwner = window.univerAPI
    })
    // Prove the absence assertion is not vacuous. This probe is outside the SDK.
    await page.evaluate(() => {
      const probe = document.createElement('h2')
      probe.dataset.testGuideProbe = 'true'
      probe.textContent = 'What it demonstrates'
      document.body.append(probe)
    })
    await assert.rejects(cardAbsent, /What it demonstrates/)
    await page.locator('[data-test-guide-probe]').evaluate((node) => node.remove())
    await cardAbsent()
    assert.deepEqual(await readModels(), before)
    const files = frame.locator('.sp-file-explorer')
    await files.getByText('README.md', { exact: true }).click()
    await frame.locator('.sp-code-editor').filter({ hasText: 'Violet / Editorial review' }).waitFor()
    assert.ok((await files.innerText()).includes('create-demo.ts'))
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      await heading.scrollIntoViewIfNeeded()
      await cardAbsent()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
      assert.equal(await frame.evaluate(() => window.layoutOwner === window.univerAPI), true)
      assert.deepEqual(await readModels(), before)
      await page.screenshot({ path: path.join(directory, `${locale}-${width}.png`) })
    }
    report.checks.push({
      locale,
      cardAbsent: true,
      negativeControlDetected: true,
      sourceReaderPreserved: true,
      nativePages: 4,
      modelExceptViewZoomAndOwnerPreserved: true,
      widths: [1440, 390, 320],
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
