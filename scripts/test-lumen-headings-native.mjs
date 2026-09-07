/* eslint-disable no-await-in-loop -- Published examples and native history are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/lumen-headings-native')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/docs-modern/paragraph-heading-blocks'
const examples = [
  ...(await fs.readFile('showcase/docs-modern/paragraph-heading-blocks/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 21)
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } })
await context.addInitScript(() => {
  window.lumenPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.lumenPaint.length < 20000) window.lumenPaint.push(String(text))
    return fillText.call(this, text, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(12000)
const report = { passed: false, url, gates: {}, errors: [], backendRequests: [], typography: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['xhr', 'fetch'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveDocument().save())))
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const run = (n) => page.evaluate('(async () => {\n' + examples[n - 1] + '\n})()')
const canvas = page.locator('#univer-doc-main-canvas')
async function ready() {
  await page.locator('.heading-demo[data-ready=true]').waitFor()
  await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
  await page.waitForFunction(
    () =>
      !document.querySelector('[data-u-comp=workbench-skeleton-content]') &&
      window.lumenPaint.join('').includes('Lumen'),
  )
  await settle()
  await page.waitForFunction(() => {
    const surface = document.getElementById('univer-doc-main-canvas')
    if (!surface?.width || !surface.height) return false
    const pixels = surface.getContext('2d').getImageData(0, 0, surface.width, surface.height).data
    let ink = 0
    for (let i = 0; i < pixels.length; i += 4)
      if (pixels[i + 3] > 200 && pixels[i] < 80 && pixels[i + 1] < 80 && pixels[i + 2] < 80) ink++
    return ink > 1200
  })
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
}
async function fresh() {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await ready()
  await run(1)
}
// Read installed render geometry only; no production diagnostic adapter, synthetic canvas or alternative model.
const typography = (marker) =>
  page.evaluate((needle) => {
    const api = window.univerAPI,
      doc = api.getActiveDocument()
    const p = doc.getParagraphs().find((item) => item.getText().includes(needle))
    const i = api._injector
    const key = [...i.resolvedDependencyCollection.resolvedDependencies.keys()].find(
      (k) => String(k) === 'engine-render.render-manager.service',
    )
    const render = i.get(key).getRenderUnitById(doc.getId())
    const glyph = render.mainComponent._skeleton.findNodeByCharIndex(p.getRange().startOffset)
    const lastGlyph = render.mainComponent._skeleton.findNodeByCharIndex(p.getRange().endOffset - 2)
    const line = glyph?.parent?.parent
    return {
      text: p.getText(),
      style: p.getInfo().paragraph.paragraphStyle,
      glyph: glyph?.content,
      fontSize: glyph?.fontStyle?.fontSize,
      textLeft: glyph?.left + (glyph?.parent?.left || 0) + (glyph?.parent?.paddingLeft || 0),
      lineHeight: line?.lineHeight,
      lastLineLeft: (lastGlyph?.parent?.left || 0) + (lastGlyph?.parent?.paddingLeft || 0),
      canvas: render.engine.getCanvasElement().getBoundingClientRect().toJSON(),
    }
  }, marker)
function pack(actual, expected, prefix = '') {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual?.[k], v, prefix + k + '.')
    else assert.deepEqual(actual?.[k], v, prefix + k)
  }
}
try {
  if (process.argv[2])
    await gate('selected-export-source-parity', async () => {
      const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
      assert.equal(manifest.slug, 'docs-modern/paragraph-heading-blocks')
      const source = (await readShowcaseSources()).find((c) => c.slug === manifest.slug)
      for (const [name, expected] of Object.entries(source.files))
        assert.equal(await fs.readFile(path.join(manifest.directory, name.slice(1)), 'utf8'), expected, name)
      report.export = { ...manifest, sourceFiles: Object.keys(source.files).length }
    })
  await fresh()
  await gate('native-startup-content-css', async () => {
    const data = await snapshot()
    assert.equal(data.documentStyle.documentFlavor, 2)
    assert.equal(data.body.paragraphs.filter((p) => p.paragraphStyle?.headingId).length, 6)
    assert.deepEqual(
      data.body.blockRanges.map((b) => b.blockType),
      ['code', 'callout', 'quote'],
    )
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().describeListItems().length), 3)
    assert.equal(data.body.customRanges[0].properties.url, 'https://example.org/lumen-protocol')
    assert.equal(
      await page
        .locator(
          '.heading-demo > fieldset,.heading-demo > nav,.heading-demo details,.heading-demo output,[data-action]',
        )
        .count(),
      0,
    )
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    assert.equal((await typography('[SCOPE]')).fontSize, 18)
    await page.screenshot({ path: path.join(directory, 'opening.png') })
  })
  const baseline = await snapshot()
  for (const [n, named, font] of [
    [2, 4, 20],
    [3, 5, 18],
    [4, 6, 16],
    [5, 7, 14],
    [6, 8, 12],
    [7, 1, 11],
  ])
    await gate('literal-heading-' + n, async () => {
      await run(n)
      await settle()
      const actual = await typography('[SCOPE]')
      assert.equal(actual.style.namedStyleType, named)
      assert.equal(actual.fontSize, font)
      assert.deepEqual((await snapshot()).body.dataStream, baseline.body.dataStream)
      report.typography.push({ example: n, ...actual })
    })
  const initialSummary = await typography('[SUMMARY]')
  for (const [n, spacing, align, indent] of [
    [8, 1, 1, 0],
    [9, 1.5, 1, 24],
    [10, 1.25, 2, 0],
    [11, 1, 1, 36],
  ])
    await gate('literal-layout-' + n, async () => {
      await run(n)
      await settle()
      const actual = await typography('[SUMMARY]')
      assert.equal(actual.style.lineSpacing, spacing)
      assert.equal(actual.style.horizontalAlign, align)
      assert.equal(actual.style.indentStart.v, indent)
      assert.equal((await snapshot()).body.dataStream, baseline.body.dataStream)
      if (n === 9) assert.ok(actual.lineHeight > initialSummary.lineHeight)
      if (n === 10)
        assert.ok(
          actual.lastLineLeft > initialSummary.lastLineLeft,
          'Centered final line moves; a full first line can begin at zero',
        )
      else if (n !== 8) assert.ok(actual.textLeft > initialSummary.textLeft)
      report.typography.push({ example: n, ...actual })
      await page.screenshot({ path: path.join(directory, 'layout-' + n + '.png') })
    })
  await gate('literal-append-history-full', async () => {
    const before = await snapshot()
    await run(12)
    await settle()
    const edited = await snapshot()
    assert.match(edited.body.dataStream, /Delivery plan · reviewed/)
    await canvas.click({ position: { x: 500, y: 100 } })
    await run(13)
    await settle()
    assert.deepEqual(await snapshot(), before)
    await run(14)
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('literal-removal-history-full', async () => {
    await run(15)
    const before = await snapshot()
    await run(16)
    await settle()
    assert.ok(!(await snapshot()).body.dataStream.includes('[SCOPE]'))
    await run(17)
    await settle()
    assert.deepEqual(await snapshot(), before)
  })
  await run(18)
  await gate('literal-reconstruction-native', async () => {
    await page.evaluate(() => {
      window.lumenPaint = []
    })
    await run(19)
    await settle()
    assert.deepEqual({ ...(await snapshot()), id: baseline.id }, baseline)
    await page.waitForFunction(() => document.getElementById('univer-doc-main-canvas')?.width > 300)
    await page.waitForFunction(() => window.lumenPaint.join('').includes('Lumen'))
    assert.equal((await typography('[SCOPE]')).fontSize, 18)
    await page.screenshot({ path: path.join(directory, 'reconstructed.png') })
  })
  await gate('literal-empty-and-restore-native', async () => {
    await run(20)
    await settle()
    assert.equal((await snapshot()).body.dataStream, '\r\n')
    await page.evaluate(() => {
      window.lumenPaint = []
    })
    await run(21)
    await settle()
    await page.waitForFunction(() => window.lumenPaint.join('').includes('Lumen'))
    assert.deepEqual({ ...(await snapshot()), id: baseline.id }, baseline)
    assert.equal((await typography('[SCOPE]')).fontSize, 18)
  })
  await fresh()
  await gate('native-heading-input-full-history', async () => {
    await canvas.click({ position: { x: 500, y: 100 } })
    await run(15)
    await page.keyboard.press('ArrowRight')
    const before = await snapshot()
    await page.keyboard.type(' native reviewed')
    await page.waitForFunction(() =>
      window.univerAPI.getActiveDocument().save().body.dataStream.includes('native reviewed'),
    )
    await page.waitForTimeout(500) // Native text history debounce, not a substitute for an assertion.
    const edited = await snapshot()
    await page.screenshot({ path: path.join(directory, 'native-edited.png') })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-heading-format-full-history', async () => {
    await canvas.click({ position: { x: 500, y: 100 } })
    await run(15)
    const before = await snapshot()
    await page.locator('[data-u-command="doc.command.set-paragraph-named-style"]').click()
    await page.getByText('Heading 3', { exact: true }).click()
    await settle()
    const actual = await typography('[SCOPE]')
    assert.equal(actual.style.namedStyleType, 6)
    assert.equal(actual.fontSize, 16)
    report.gates['native-heading-format-render'] = { passed: true }
    report.typography.push({ nativeHeadingMenu: true, ...actual })
    const edited = await snapshot()
    await page.screenshot({ path: path.join(directory, 'native-heading-3.png') })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('complete-locales-edited-theme-owner', async () => {
    const source = await fs.readFile('showcase/docs-modern/paragraph-heading-blocks/code/create-demo.ts', 'utf8')
    const packs = [...source.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 6)
    assert.equal([...source.matchAll(/^import '@[^']+\/lib\/index.css'/gm)].length, 6)
    const saved = await snapshot()
    await page.evaluate(() => {
      window.lumenOwner = window.univerAPI
    })
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const [, prefix] of packs)
        pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.equal(await page.evaluate(() => window.lumenOwner === window.univerAPI), true)
        assert.deepEqual(await snapshot(), saved)
      }
      await page.screenshot({ path: path.join(directory, locale + '.png') })
    }
  })
  await gate('disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await page.locator('.heading-demo').waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('initial-zh-language', async () => {
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        if (document.documentElement) {
          document.documentElement.lang = 'zh-CN'
          observer.disconnect()
        }
      })
      observer.observe(document, { childList: true, subtree: true })
    })
    await fresh()
    const source = await fs.readFile('showcase/docs-modern/paragraph-heading-blocks/code/create-demo.ts', 'utf8')
    for (const [, prefix] of source.matchAll(/^import \w+ZhCN from '([^']+)zh-CN'/gm))
      pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + 'zh-CN')).default)
    await page.screenshot({ path: path.join(directory, 'initial-zh.png') })
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, typography: report.typography.length }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
