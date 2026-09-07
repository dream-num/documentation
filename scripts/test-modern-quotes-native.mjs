/* eslint-disable no-await-in-loop -- Published examples and native history are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-quotes-native')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/docs-modern/quote-blocks'
const examples = [
  ...(await fs.readFile('showcase/docs-modern/quote-blocks/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 23)
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } })
await context.addInitScript(() => {
  const addEventListener = window.addEventListener
  window.addEventListener = function (type, listener, options) {
    // Capture the exported entry's closure, which owns the actual createDemo controller.
    if (type === 'pagehide') window.harborPagehide = listener
    return addEventListener.call(this, type, listener, options)
  }
  window.harborStrokes = []
  const stroke = CanvasRenderingContext2D.prototype.stroke
  CanvasRenderingContext2D.prototype.stroke = function (...args) {
    if (window.harborStrokes.length < 10000)
      window.harborStrokes.push({ color: this.strokeStyle, width: this.lineWidth })
    return stroke.apply(this, args)
  }
  window.harborPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.harborPaint.length < 200000) window.harborPaint.push(String(text))
    return fillText.call(this, text, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(12000)
const report = { passed: false, url, gates: {}, errors: [], backendRequests: [], geometry: [], literals: [] }
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
const run = (n) => {
  report.literals.push(n)
  return page.evaluate('(async () => {\n' + examples[n - 1] + '\n})()')
}
const canvas = page.locator('#univer-doc-main-canvas')
async function ready() {
  await page.locator('.quote-demo[data-ready=true]').waitFor()
  await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
  await page.waitForFunction(
    () =>
      !document.querySelector('[data-u-comp=workbench-skeleton-content]') &&
      window.harborPaint.join('').includes('Harbor'),
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
    await fs.writeFile(path.join(directory, name + '-snapshot.json'), JSON.stringify(await snapshot(), null, 2))
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
}
async function fresh() {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await ready()
  await run(1)
}
// Test-only renderer inspection: actual glyphs, hit geometry, draw calls and canvas; no production adapter.
const geometry = (marker = '[VOICE]') =>
  page.evaluate((needle) => {
    const api = window.univerAPI,
      doc = api.getActiveDocument(),
      p = doc.getParagraphs().find((item) => item.getText().includes(needle))
    const i = api._injector,
      key = [...i.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      )
    const render = i.get(key).getRenderUnitById(doc.getId())
    const glyph = render.mainComponent._skeleton.findNodeByCharIndex(p.getRange().startOffset)
    const mixed = render.mainComponent._skeleton.findNodeByCharIndex(
      p.getRange().startOffset + Math.max(0, p.getText().indexOf('visible route')),
    )
    const quote = doc.getQuoteAt(p.getRange().startOffset)
    const controller = [...render._injector.resolvedDependencyCollection.resolvedDependencies.keys()]
      .map((k) => render._injector.get(k))
      .find((v) => Array.isArray(v?._hitRects))
    return {
      quote: quote?.describe(),
      text: p.getText(),
      range: p.getRange(),
      glyph: glyph?.content,
      color: glyph?.ts?.cl,
      mixed: mixed?.ts,
      font: mixed?.fontStyle,
      textLeft: glyph?.left + (glyph?.parent?.left || 0) + (glyph?.parent?.paddingLeft || 0),
      rect: controller?._hitRects.find((r) => r.blockId === quote?.getId()),
    }
  }, marker)
const paragraphTexts = () =>
  page.evaluate(() =>
    window.univerAPI
      .getActiveDocument()
      .getParagraphs()
      .map((p) => p.getText()),
  )
const markedText = (m) =>
  m.body.textRuns
    .filter((r) => r.ts.bl === 1 || r.ts.it === 1)
    .map((r) => ({ text: m.body.dataStream.slice(r.st, r.ed), bold: r.ts.bl, italic: r.ts.it }))
const pixels = () =>
  canvas.evaluate((c) => {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
    let hash = 2166136261
    for (let n = 0; n < d.length; n++) hash = Math.imul(hash ^ d[n], 16777619) >>> 0
    return hash
  })
async function verifyRenderedStyle(actual) {
  assert.equal(actual.color.rgb, actual.quote.style.textColor)
  assert.equal(
    await page.evaluate(
      (color) => window.harborStrokes.some((s) => s.color.toLowerCase() === color.toLowerCase() && s.width > 0),
      actual.quote.style.lineColor,
    ),
    true,
  )
  assert.ok(actual.rect.bottom > actual.rect.top)
}
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
      const source = (await readShowcaseSources()).find((c) => c.slug === 'docs-modern/quote-blocks')
      assert.equal(manifest.slug, source.slug)
      for (const [name, content] of Object.entries(source.files))
        assert.equal(await fs.readFile(path.join(manifest.directory, name.slice(1)), 'utf8'), content, name)
      report.export = manifest
    })
  await fresh()
  await gate('native-startup-settled-content-css', async () => {
    const m = await snapshot()
    assert.equal(m.body.paragraphs.length, 26)
    assert.deepEqual(m.body.blockRanges.map((b) => b.blockType).toSorted(), [
      'callout',
      'code',
      'quote',
      'quote',
      'quote',
      'quote',
    ])
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().describeListItems().length), 4)
    assert.equal(m.body.customRanges[0].properties.url, 'https://example.org/harbor-review')
    assert.equal(
      await page
        .locator('.quote-demo > fieldset,.quote-demo > nav,.quote-demo details,.quote-demo output,[data-action]')
        .count(),
      0,
    )
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    const actual = await geometry()
    await verifyRenderedStyle(actual)
    assert.equal(actual.mixed.bl, 1)
    assert.equal(actual.mixed.it, 1)
    assert.equal((await geometry('[COMMUNITY]')).quote.blockId, (await geometry('[ACCESS]')).quote.blockId)
    assert.equal((await geometry('[RESEARCH]')).quote.blockId, (await geometry('[OBSERVATION]')).quote.blockId)
    await page.waitForFunction(() => /\b[1-9]\d* words\b/.test(document.body.innerText))
    report.wordCount = await page.evaluate(() => document.body.innerText.match(/\b[1-9]\d* words\b/)[0])
    await page.screenshot({ path: path.join(directory, 'opening-settled.png') })
    await page.mouse.move(1100, 960)
    await page.mouse.wheel(0, 570)
    await settle()
    await page.screenshot({ path: path.join(directory, 'community-research.png') })
    await page.mouse.wheel(0, 750)
    await settle()
    await page.screenshot({ path: path.join(directory, 'neighboring-blocks.png') })
  })
  for (const [n, count] of [
    [2, 1],
    [3, 2],
    [4, 3],
  ])
    await gate('literal-' + n + '-quote-scope-guard', async () => {
      await fresh()
      const text = await paragraphTexts(),
        marks = markedText(await snapshot())
      await run(5)
      assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().getQuote('harbor-voice')), null)
      assert.deepEqual(await paragraphTexts(), text)
      assert.deepEqual(markedText(await snapshot()), marks)
      await run(n)
      await settle()
      const wrapped = await snapshot()
      await run(n)
      assert.deepEqual(await snapshot(), wrapped)
      const actual = await geometry()
      assert.equal(
        await page.evaluate(() => {
          const d = window.univerAPI.getActiveDocument(),
            r = window.harborVoice().getRange()
          return d
            .getParagraphs()
            .filter((p) => p.getRange().startOffset >= r.startIndex && p.getRange().endOffset <= r.endIndex).length
        }),
        count,
      )
      assert.deepEqual(await paragraphTexts(), text)
      assert.deepEqual(markedText(await snapshot()), marks)
      assert.ok(actual.rect)
      report.geometry.push({ literal: n, ...actual })
      if (n === 4) await page.screenshot({ path: path.join(directory, 'attributed-scope.png') })
    })
  for (const [n, line, text] of [
    [6, '#2563EB', '#1E3A8A'],
    [7, '#16A34A', '#14532D'],
    [8, '#7C3AED', '#4C1D95'],
    [9, '#111827', '#111827'],
    [10, '#B45309', '#1E3A8A'],
    [11, '#2563EB', '#0F766E'],
  ])
    await gate('literal-' + n + '-style-glyph-pixel-isolation', async () => {
      await fresh()
      const before = await snapshot(),
        other = await geometry('[COMPARE]'),
        oldPixels = await pixels()
      await page.evaluate(() => (window.harborStrokes = []))
      await run(n)
      await settle()
      const actual = await geometry()
      assert.deepEqual(actual.quote.style, { lineColor: line, textColor: text })
      assert.equal(actual.mixed.bl, 1)
      assert.equal(actual.mixed.it, 1)
      await verifyRenderedStyle(actual)
      assert.deepEqual(await geometry('[COMPARE]'), other)
      assert.equal((await snapshot()).body.dataStream, before.body.dataStream)
      if (n !== 6) assert.notEqual(await pixels(), oldPixels)
      report.geometry.push({ literal: n, ...actual })
    })
  for (const [n, label] of [
    [7, 'combined-style'],
    [10, 'line-color'],
    [11, 'text-color'],
    [23, 'append-observation'],
  ])
    await gate('literal-' + n + '-' + label + '-full-history', async () => {
      await fresh()
      const before = await snapshot()
      await run(n)
      await settle()
      const edited = await snapshot()
      await fs.writeFile(path.join(directory, 'literal-' + n + '-before.json'), JSON.stringify(before, null, 2))
      await run(15)
      assert.deepEqual(await snapshot(), before)
      await run(16)
      assert.deepEqual(await snapshot(), edited)
    })
  await gate('literal-12-attribution-guard-and-boundary', async () => {
    await fresh()
    await run(12)
    await settle()
    assert.ok((await geometry()).quote.text.includes('Mira Bell'))
    const attributed = await snapshot()
    await run(12)
    assert.deepEqual(await snapshot(), attributed)
    await fresh()
    await run(5)
    await run(4)
    const inside = await snapshot()
    await run(12)
    assert.deepEqual(await snapshot(), inside)
  })
  await gate('literal-14-delete-full-history', async () => {
    await fresh()
    const before = await snapshot()
    await run(14)
    const deleted = await snapshot()
    assert.ok(!deleted.body.dataStream.includes('[VOICE]'))
    assert.ok(deleted.body.dataStream.includes('[CONTEXT]'))
    assert.ok(deleted.body.dataStream.includes('[COMPARE]'))
    await run(15)
    assert.deepEqual(await snapshot(), before)
    await run(16)
    assert.deepEqual(await snapshot(), deleted)
  })
  await gate('literal-17-18-19-query-validation-policy', async () => {
    await fresh()
    await run(17)
    await run(18)
    await run(19)
    const before = await snapshot()
    for (const input of [
      ['line', 'red'],
      ['text', '#fff'],
      ['line', '#gg0000'],
      ['other', '#123456'],
    ]) {
      assert.equal(
        await page.evaluate(([channel, color]) => {
          try {
            window.harborColor(channel, color)
            return false
          } catch {
            return true
          }
        }, input),
        true,
      )
      assert.deepEqual(await snapshot(), before)
    }
    await page.evaluate(() => window.harborColor('line', '#B45309'))
    assert.equal((await geometry()).quote.style.lineColor, '#B45309')
  })
  await gate('literal-20-same-id-edited-model-canvas', async () => {
    await fresh()
    await run(23)
    const before = await snapshot()
    await page.evaluate(() => (window.harborPaint = []))
    await run(20)
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.waitForFunction(() => window.harborPaint.join('').includes('Harbor'))
    await verifyRenderedStyle(await geometry())
    await page.screenshot({ path: path.join(directory, 'reconstructed.png') })
  })
  await gate('literal-21-22-empty-exact-baseline', async () => {
    await fresh()
    const before = await snapshot()
    await run(21)
    await settle()
    assert.equal((await snapshot()).body.dataStream, '\r\n')
    await page.evaluate(() => (window.harborPaint = []))
    await run(22)
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.waitForFunction(() => window.harborPaint.join('').includes('Harbor'))
    await verifyRenderedStyle(await geometry())
  })
  await gate('native-floating-line-menu-full-history', async () => {
    await fresh()
    const before = await snapshot()
    // Opening screenshot: VOICE text at (650,508), within real hit geometry, not a host control.
    await page.mouse.click(650, 508)
    await page.getByRole('button', { name: 'Left line color', exact: true }).click({ timeout: 3000 })
    await page.screenshot({ path: path.join(directory, 'native-color-menu.png') })
    // Read the native color picker DOM before selecting; a missing menu remains a strict failure.
    const options = page.locator('[data-u-comp="docs-quote-ui.floating-toolbar"] [title^="#"]')
    assert.ok(await options.count(), 'Native palette must expose a color option')
    const selected = options.first(),
      color = await selected.getAttribute('title')
    await selected.click()
    await settle()
    assert.equal((await geometry()).quote.style.lineColor.toLowerCase(), color.toLowerCase())
    await verifyRenderedStyle(await geometry())
    const edited = await snapshot()
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-keyboard-full-history', async () => {
    await fresh()
    await page.mouse.click(650, 508)
    await run(13)
    await page.keyboard.press('ArrowRight')
    const before = await snapshot()
    await page.evaluate(() => (window.harborPaint = []))
    await page.keyboard.type(' native reviewed')
    await page.waitForFunction(() =>
      window.univerAPI.getActiveDocument().save().body.dataStream.includes('native reviewed'),
    )
    await page.waitForTimeout(500)
    await settle()
    const edited = await snapshot()
    assert.ok((await geometry()).quote.text.includes('native reviewed'))
    // Native layout hyphenates "native" as "na-" / "tive" at this line wrap.
    // Check the unbroken painted tail; complete source text remains asserted above.
    assert.ok(await page.evaluate(() => window.harborPaint.join('').includes('reviewed')))
    report.gates['native-keyboard-render'] = { passed: true }
    await page.screenshot({ path: path.join(directory, 'native-input.png') })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-grid-quote-insertion-full-history', async () => {
    await fresh()
    await page.mouse.click(650, 580)
    await page.evaluate(() => {
      const range = window.harborParagraph('[CONTEXT]').getRange()
      window.univerAPI.getActiveDocument().setSelection(range.startOffset, range.endOffset)
    })
    const before = await snapshot()
    await page.getByText('Insert', { exact: true }).first().click()
    await page.locator('[data-u-command="docs-quote.command.insert"]').click()
    await settle()
    const actual = await geometry('[CONTEXT]')
    assert.ok(actual.quote)
    assert.ok(actual.rect)
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().getQuotes().length), 5)
    report.gates['native-grid-quote-render'] = { passed: true }
    await page.screenshot({ path: path.join(directory, 'native-grid-quote.png') })
    const edited = await snapshot()
    await page.getByText('Start', { exact: true }).first().click()
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('complete-locales-edited-theme-owner', async () => {
    await fresh()
    await run(23)
    const saved = await snapshot()
    await page.evaluate(() => (window.harborOwner = window.univerAPI))
    const source = await fs.readFile('showcase/docs-modern/quote-blocks/code/create-demo.ts', 'utf8')
    const packs = [...source.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 6)
    assert.equal([...source.matchAll(/^import '@[^']+\/lib\/index.css'/gm)].length, 6)
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
        assert.equal(await page.evaluate(() => window.harborOwner === window.univerAPI), true)
        assert.deepEqual(await snapshot(), saved)
      }
      await page.screenshot({ path: path.join(directory, locale + '.png') })
    }
  })
  await gate('disposal', async () => {
    await page.evaluate(() => {
      const dispose = window.harborPagehide
      dispose(new Event('pagehide'))
      dispose(new Event('pagehide'))
    })
    await page.locator('.quote-demo').waitFor({ state: 'detached' })
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
    const source = await fs.readFile('showcase/docs-modern/quote-blocks/code/create-demo.ts', 'utf8')
    for (const [, prefix] of source.matchAll(/^import \w+ZhCN from '([^']+)zh-CN'/gm))
      pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + 'zh-CN')).default)
    await page.screenshot({ path: path.join(directory, 'initial-zh.png') })
  })
  await gate('no-runtime-errors-or-backend', async () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
  })
  await gate('all-23-literals-executed', async () => assert.equal(new Set(report.literals).size, 23))
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, geometry: report.geometry.length }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
