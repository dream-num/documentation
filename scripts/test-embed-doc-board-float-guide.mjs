/* eslint-disable no-await-in-loop -- Each locale owns one live editor and theme sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4278'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-doc-board-float-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/docs-in-boards-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
]
assert.equal(examples.length, 2)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [], consoleDetails: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') {
    report.errors.push(m.text())
    report.consoleDetails.push({ text: m.text(), location: m.location() })
  }
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Modern Docs in Boards / Discovery Brief', ['Variants', 'Actions', 'States']],
    ['zh-CN', '现代文档嵌入 Boards / 调研提纲', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(`${origin}/${locale}/showcase/embed/docs-in-boards-float`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    const root = page.frameLocator('iframe').first().locator('.maple-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.ok(frame)
    const child = root.locator('[data-u-comp="embed-float-dom"]')
    await child.dblclick({ position: { x: 180, y: 110 } })
    await frame.waitForFunction(
      () =>
        document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
    )
    assert.equal(await root.locator('fieldset,[data-action]').count(), 0)
    // Native modern Docs paints the white page; its DOM wrapper is transparent.
    assert.deepEqual(
      await child
        .locator('[data-embed-canvas-root="true"] canvas')
        .evaluate((canvas) => [...canvas.getContext('2d').getImageData(20, 20, 1, 1).data]),
      [255, 255, 255, 255],
    )
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    for (const example of examples) await frame.evaluate(example[1])
    await frame.waitForFunction(() =>
      window.univerAPI
        .getDocument('maple-interview-brief')
        .getBody()
        .dataStream.includes('Make the next visit easier.'),
    )
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            host: window.univerAPI.getBoard('maple-library-discovery').save(),
            child: window.univerAPI.getDocument('maple-interview-brief').save(),
          }),
        ),
      )
    const before = await read()
    assert.equal(before.host.pages.discovery.elementOrder.length, 15)
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      const actual = await read()
      assert.equal(actual.host.theme.id, before.host.theme.id)
      assert.deepEqual({ ...actual.host, theme: before.host.theme }, before.host)
      assert.deepEqual(actual.child, before.child)
    }
    await root.screenshot({ path: path.join(directory, `${locale}.png`) })
    report.checks.push({
      locale,
      redundantGuideCardRemoved: true,
      nativeBoardFloating: true,
      whiteNativePagePixels: true,
      themePreservesOwnerAndEditedSnapshots: true,
    })
    assert.deepEqual(report.errors, [])
  }
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS Maple EN/ZH native preview and theme preservation')
