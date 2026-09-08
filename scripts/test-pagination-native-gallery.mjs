/* eslint-disable no-await-in-loop -- Compare localized native document layouts sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/pagination-native-gallery'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const report = { passed: false, locales: [], errors: [], failures: [] }
let server
try {
  if (process.argv[2]) {
    const entries = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
    const entry = entries.find(({ slug }) => slug === 'docs-traditional/pagination-rules')
    assert.ok(entry?.passed, 'A successfully built pagination export is required')
    const viteDirectory = entry.links.find(({ name }) => name === 'vite').target
    const vitePackage = JSON.parse(await fs.readFile(path.join(viteDirectory, 'package.json'), 'utf8'))
    const exportedPackage = JSON.parse(await fs.readFile(path.join(entry.directory, 'package.json'), 'utf8'))
    assert.equal(vitePackage.version, exportedPackage.devDependencies.vite)
    const { preview } = await import(pathToFileURL(path.join(viteDirectory, 'dist/node/index.js')))
    server = await preview({
      configFile: false,
      root: entry.directory,
      preview: { host: '127.0.0.1', port: Number(process.env.SHOWCASE_EXPORT_PORT || 4447), strictPort: true },
    })
  }
  for (const locale of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
    if (server) {
      await page.route('**/', async (route) => {
        const response = await route.fetch()
        await route.fulfill({
          response,
          body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${locale}">`),
        })
      })
    }
    await page.addInitScript(() => {
      window.paginationPaint = []
      const fillText = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        window.paginationPaint.push(String(text))
        return fillText.call(this, text, ...args)
      }
    })
    page.on('pageerror', (error) => report.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') report.errors.push(message.text())
    })
    await page.goto(
      server
        ? `http://127.0.0.1:${process.env.SHOWCASE_EXPORT_PORT || 4447}/`
        : `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/docs-traditional/pagination-rules`,
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    const root = page.locator('.pagination-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await root.locator('canvas').first().waitFor()
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
    assert.equal(await root.locator(':scope > details, :scope > fieldset, :scope > output').count(), 0)
    if (server) {
      assert.equal(await page.locator('html').getAttribute('lang'), locale)
      assert.doesNotMatch(
        await root.innerText(),
        /[\u3400-\u9fff]/,
        'Native UI stays English under either host language',
      )
    }
    const layout = await page.evaluate(() => {
      const api = window.univerAPI
      const doc = api.getActiveDocument()
      // Private geometry is diagnostic evidence only, never an exported demo dependency.
      const injector = api._injector
      const key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (candidate) => String(candidate) === 'engine-render.render-manager.service',
      )
      const skeleton = injector.get(key).getRenderUnitById(doc.getId()).mainComponent._skeleton
      const pages = skeleton._skeletonData.pages
      return {
        pageCount: pages.length,
        paragraphs: doc.getParagraphs().map((paragraph) => {
          const range = paragraph.getRange()
          const lines = new Map()
          for (let index = range.startOffset; index < range.endOffset; index++) {
            if (/\s/.test(paragraph.getText()[index - range.startOffset])) continue
            // Diagnostic boundary evidence below: this SDK maps startOffset to the prior CR;
            // startOffset + 1 maps to the first rendered glyph, not a prior-page line.
            const glyph = skeleton.findNodeByCharIndex(index + 1)
            const line = glyph?.parent?.parent
            if (!line) continue
            let owner = glyph
            while (owner && !pages.includes(owner)) owner = owner.parent
            lines.set(line, pages.indexOf(owner))
          }
          return {
            text: paragraph.getText(),
            info: paragraph.getInfo().paragraph,
            linePages: [...lines.values()],
            boundary: {
              offset: range.startOffset,
              source: doc.save().body.dataStream.slice(range.startOffset, range.startOffset + 8),
              at: skeleton.findNodeByCharIndex(range.startOffset)?.content,
              after: skeleton.findNodeByCharIndex(range.startOffset + 1)?.content,
            },
          }
        }),
      }
    })
    assert.ok(layout.pageCount >= 5)
    assert.ok(layout.paragraphs.every((p) => p.linePages.length && p.linePages.every((index) => index >= 0)))
    await fs.writeFile(`${output}/${locale}-layout.json`, JSON.stringify(layout, null, 2))
    const groups = Object.fromEntries(
      ['natural', 'heading-reference', 'heading', 'together', 'widow', 'break', 'oversized'].map((id) => {
        const index = layout.paragraphs.findIndex((p) => p.text.startsWith('[' + id + ']'))
        assert.ok(index >= 0, 'Missing native specimen: ' + id)
        return [
          id,
          {
            title: layout.paragraphs[index],
            heading: layout.paragraphs[index + 2],
            body: layout.paragraphs[index + 3],
            long: layout.paragraphs[index + 4],
          },
        ]
      }),
    )
    assert.equal(groups.heading.heading.info.paragraphStyle.keepNext, 1)
    assert.equal(groups.together.body.info.paragraphStyle.keepLines, 1)
    assert.equal(groups.widow.body.info.paragraphStyle.widowControl, 1)
    assert.equal(groups.break.heading.info.paragraphStyle.pageBreakBefore, 1)
    assert.equal(groups.oversized.long.info.paragraphStyle.keepLines, 1)
    assert.ok(
      new Set(groups.oversized.long.linePages).size > 1,
      'Oversized paragraph must remain rendered across pages',
    )
    if (groups['heading-reference'].heading.linePages[0] === groups['heading-reference'].body.linePages[0])
      report.failures.push(locale + ': heading reference does not create an orphan heading')
    if (groups.heading.heading.linePages[0] !== groups.heading.body.linePages[0])
      report.failures.push(locale + ': keepNext leaves an orphan heading')
    assert.ok(new Set(groups.natural.body.linePages).size > 1, 'Natural reference must straddle a page boundary')
    assert.equal(new Set(groups.together.body.linePages).size, 1, 'Keep-lines body must fit intact on a page')
    assert.ok(
      groups.break.heading.linePages[0] > groups.break.title.linePages[0],
      'Explicit break must move the heading',
    )
    const widowCounts = Object.values(
      groups.widow.body.linePages.reduce((counts, pageIndex) => {
        counts[pageIndex] = (counts[pageIndex] || 0) + 1
        return counts
      }, {}),
    )
    if (!widowCounts.every((count) => count >= 2))
      report.failures.push(locale + ': widowControl leaves a single line: ' + groups.widow.body.linePages.join(','))
    await root.screenshot({ path: `${output}/${locale}.png` })
    await root
      .locator('canvas')
      .first()
      .hover({ position: { x: 700, y: 250 } })
    let scroll = 0
    const navigation = []
    for (const [name, offset] of [
      ['heading-reference', groups['heading-reference'].heading.linePages[0] * 500],
      ['heading-kept', groups.heading.heading.linePages[0] * 500],
      ['keep-lines', groups.together.body.linePages[0] * 500 - 200],
      ['widow-boundary', groups.widow.body.linePages[0] * 500 - 200],
      ['oversized', groups.oversized.long.linePages[0] * 500],
    ]) {
      await page.evaluate(() => {
        window.paginationPaint = []
      })
      await page.mouse.wheel(0, offset - scroll)
      scroll = offset
      await page.waitForTimeout(500)
      await root.screenshot({ path: `${output}/${locale}-${name}.png` })
      const painted = await page.evaluate(() => window.paginationPaint.join(''))
      assert.ok(painted.length > 0, 'Native wheel navigation repaints document text: ' + name)
      if (navigation.length)
        assert.notEqual(painted, navigation.at(-1).painted, 'Native navigation changes painted pages')
      navigation.push({ name, offset, painted })
    }
    report.locales.push({ locale, layout, navigation })
    await page.close()
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.failures, [], 'Native pagination acceptance gaps')
  report.passed = true
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify({
      passed: report.passed,
      locales: report.locales.map(({ locale, layout }) => ({ locale, pages: layout.pageCount })),
      errors: report.errors,
    }),
  )
  await browser.close()
  await server?.close()
}
