/* eslint-disable no-await-in-loop -- Published examples and native history are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { SAMPLES, COMPARISON_LINES } from '../showcase/docs-modern/code-blocks/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-code-native')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/docs-modern/code-blocks'
const examples = [
  ...(await fs.readFile('showcase/docs-modern/code-blocks/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 32)
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } })
await context.grantPermissions(['clipboard-read', 'clipboard-write'])
await context.addInitScript(() => {
  const addEventListener = window.addEventListener
  window.addEventListener = function (type, listener, options) {
    // Capture the exported entry's closure, which owns the actual createDemo controller.
    if (type === 'pagehide') window.beaconPagehide = listener
    return addEventListener.call(this, type, listener, options)
  }
  window.beaconStrokes = []
  const stroke = CanvasRenderingContext2D.prototype.stroke
  CanvasRenderingContext2D.prototype.stroke = function (...args) {
    if (window.beaconStrokes.length < 10000)
      window.beaconStrokes.push({ color: this.strokeStyle, width: this.lineWidth })
    return stroke.apply(this, args)
  }
  window.beaconDraw = []
  window.beaconPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.beaconPaint.length < 200000) {
      window.beaconPaint.push(String(text))
      window.beaconDraw.push({ text: String(text), color: this.fillStyle, font: this.font })
    }
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
  await page.locator('.code-demo[data-ready=true]').waitFor()
  await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
  await page.waitForFunction(
    () =>
      !document.querySelector('[data-u-comp=workbench-skeleton-content]') &&
      window.beaconPaint.join('').includes('Beacon'),
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
// Read-only actual SDK glyph geometry and canvas. All edits execute published Facades or native input.
const codeState = (id = 'beacon-ingest') =>
  page.evaluate((blockId) => {
    const api = window.univerAPI,
      doc = api.getActiveDocument(),
      code = doc.getCode(blockId),
      range = code.getRange()
    const i = api._injector,
      key = [...i.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      )
    const render = i.get(key).getRenderUnitById(doc.getId())
    const controller = [...render._injector.resolvedDependencyCollection.resolvedDependencies.keys()]
      .map((k) => render._injector.get(k))
      .find((v) => Array.isArray(v?._languageHitRects))
    const paragraphs = doc
      .getParagraphs()
      .filter((p) => p.getRange().startOffset >= range.startIndex && p.getRange().endOffset <= range.endIndex)
      .map((p) => {
        const r = p.getRange(),
          tops = new Set()
        for (let index = r.startOffset; index < r.endOffset; index++) {
          const g = render.mainComponent._skeleton.findNodeByCharIndex(index)
          if (g?.parent?.parent) tops.add(g.parent.parent.top)
        }
        const offset = Math.max(0, p.getText().search(/\S/)),
          glyph = render.mainComponent._skeleton.findNodeByCharIndex(r.startOffset + offset)
        return {
          text: p.getText(),
          range: r,
          lineTops: [...tops],
          firstTextLeft: glyph?.left + (glyph?.parent?.left || 0) + (glyph?.parent?.paddingLeft || 0),
          glyph: glyph?.content,
          font: glyph?.fontStyle,
        }
      })
    const source = doc
      .save()
      .body.dataStream.slice(range.startIndex + 1, range.endIndex)
      .replace(/\r$/, '')
      .replaceAll('\r', '\n')
    return {
      description: code.describe(),
      range,
      source,
      paragraphs,
      rect: controller?._blockHitRects.find((r) => r.blockId === blockId),
      languageRect: controller?._languageHitRects.find((r) => r.blockId === blockId),
    }
  }, id)
const paragraphTexts = () =>
  page.evaluate(() =>
    window.univerAPI
      .getActiveDocument()
      .getParagraphs()
      .map((p) => p.getText()),
  )
const pixels = () =>
  canvas.evaluate((c) => {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
    let h = 2166136261
    for (let n = 0; n < d.length; n++) h = Math.imul(h ^ d[n], 16777619) >>> 0
    return h
  })
const expectedSource = SAMPLES[0].lines.join('\n')
const colors = () =>
  page.evaluate(() => [...new Set(window.beaconDraw.filter((d) => d.font.includes('monospace')).map((d) => d.color))])
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
      const source = (await readShowcaseSources()).find((c) => c.slug === 'docs-modern/code-blocks')
      assert.equal(manifest.slug, source.slug)
      for (const [name, content] of Object.entries(source.files))
        assert.equal(await fs.readFile(path.join(manifest.directory, name.slice(1)), 'utf8'), content, name)
      report.export = manifest
    })
  await fresh()
  await gate('native-startup-settled-business-content-css', async () => {
    const model = await snapshot()
    assert.equal(model.body.paragraphs.length, 48)
    assert.deepEqual(model.body.blockRanges.map((b) => b.blockType).toSorted(), [
      'callout',
      'code',
      'code',
      'code',
      'code',
      'code',
      'quote',
    ])
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().describeListItems().length), 4)
    assert.equal(model.body.customRanges[0].properties.url, 'https://example.org/beacon-review')
    assert.equal(
      await page
        .locator('.code-demo > fieldset,.code-demo > nav,.code-demo details,.code-demo output,[data-action]')
        .count(),
      0,
    )
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    for (const sample of SAMPLES) {
      const state = await codeState(sample.id === 'typescript' ? 'beacon-ingest' : 'beacon-' + sample.id)
      assert.equal(state.source, sample.lines.join('\n'))
      assert.equal(state.description.config.language, sample.id)
      assert.equal(state.paragraphs.length, sample.lines.length)
      report.geometry.push({ sample: sample.id, ...state })
    }
    assert.equal((await codeState('beacon-query')).source, COMPARISON_LINES.join('\n'))
    assert.ok((await colors()).length > 2)
    await page.waitForFunction(() => /\b[1-9]\d* words\b/.test(document.body.innerText))
    report.wordCount = await page.evaluate(() => document.body.innerText.match(/\b[1-9]\d* words\b/)[0])
    await page.screenshot({ path: path.join(directory, 'opening-settled.png') })
    for (const [offset, name] of [
      [950, 'comparison-json'],
      [720, 'python-sql'],
      [1100, 'neighboring-blocks'],
    ]) {
      await page.mouse.move(1100, 950)
      await page.mouse.wheel(0, offset)
      await settle()
      await page.screenshot({ path: path.join(directory, name + '.png') })
    }
  })
  for (const [n, language] of ['typescript', 'javascript', 'json', 'python', 'sql', 'plaintext'].map((value, index) => [
    index + 2,
    value,
  ])) {
    await gate('literal-' + n + '-language-source-isolation', async () => {
      await fresh()
      const before = await snapshot(),
        other = await codeState('beacon-query')
      await run(n)
      await settle()
      const state = await codeState()
      assert.equal(state.description.config.language, language)
      assert.equal(state.source, expectedSource)
      assert.deepEqual(await codeState('beacon-query'), other)
      assert.equal((await snapshot()).body.dataStream, before.body.dataStream)
      report.geometry.push({ literal: n, colors: await colors(), ...state })
    })
  }
  await gate('typescript-plaintext-real-syntax-drawing', async () => {
    await fresh()
    const originalPixels = await pixels(),
      originalColors = await colors()
    await page.evaluate(() => {
      window.beaconDraw = []
      window.beaconPaint = []
    })
    await run(7)
    await settle()
    const plainColors = await colors()
    assert.notDeepEqual(plainColors, originalColors)
    assert.notEqual(await pixels(), originalPixels)
    assert.equal((await codeState()).source, expectedSource)
    await page.screenshot({ path: path.join(directory, 'plaintext.png') })
  })
  for (const [n, key, value] of [
    [8, 'wrap', true],
    [9, 'wrap', false],
    [10, 'showLineNumbers', true],
    [11, 'showLineNumbers', false],
    [12, 'tabSize', 1],
    [13, 'tabSize', 8],
  ])
    await gate('literal-' + n + '-config-source', async () => {
      await fresh()
      await run(n)
      assert.equal((await codeState()).description.config[key], value)
      assert.equal((await codeState()).source, expectedSource)
    })
  await gate('strict-wrap-real-layout', async () => {
    await fresh()
    await run(8)
    await settle()
    const wrapped = (await codeState()).paragraphs.at(-1)
    assert.ok(wrapped.lineTops.length > 1)
    await run(9)
    await settle()
    const unwrapped = (await codeState()).paragraphs.at(-1)
    report.geometry.push({ wrapped, unwrapped })
    assert.equal(unwrapped.lineTops.length, 1, 'Wrap=false must remove soft-wrapped lines')
  })
  await gate('strict-line-number-render', async () => {
    await fresh()
    await run(11)
    await settle()
    const before = await codeState()
    await run(10)
    await settle()
    const after = await codeState()
    report.geometry.push({ lineNumbersOff: before, lineNumbersOn: after })
    assert.ok(
      after.paragraphs[0].firstTextLeft > before.paragraphs[0].firstTextLeft,
      'Visible line-number gutter must reserve space',
    )
  })
  await gate('strict-tab-width-real-layout', async () => {
    await fresh()
    await run(12)
    await settle()
    const narrow = (await codeState()).paragraphs.find((p) => p.text.includes('station: "north"'))
    await run(13)
    await settle()
    const wide = (await codeState()).paragraphs.find((p) => p.text.includes('station: "north"'))
    report.geometry.push({ narrow, wide })
    assert.ok(wide.firstTextLeft > narrow.firstTextLeft, 'Eight-column tabs must move the first code glyph')
  })
  await gate('literal-14-validation-no-mutation', async () => {
    await fresh()
    await run(14)
    const before = await snapshot()
    for (const n of [0, 9, 1.5, NaN]) {
      assert.equal(
        await page.evaluate((value) => {
          try {
            window.beaconTab(value)
            return false
          } catch {
            return true
          }
        }, n),
        true,
      )
      assert.deepEqual(await snapshot(), before)
    }
    assert.equal(
      await page.evaluate(() => {
        try {
          window.beaconLanguage('unknown')
          return false
        } catch {
          return true
        }
      }),
      true,
    )
    assert.deepEqual(await snapshot(), before)
    await page.evaluate(() => window.beaconTab(4))
    assert.equal((await codeState()).description.config.tabSize, 4)
  })
  for (const [n, label] of [
    [7, 'language'],
    [15, 'blank-line'],
    [32, 'comment-edit'],
  ])
    await gate('literal-' + n + '-' + label + '-full-history', async () => {
      await fresh()
      const before = await snapshot()
      await fs.writeFile(path.join(directory, 'literal-' + n + '-before.json'), JSON.stringify(before, null, 2))
      await run(n)
      await settle()
      const edited = await snapshot()
      if (n === 15) assert.equal((await codeState()).source, expectedSource + '\n')
      await run(20)
      assert.deepEqual(await snapshot(), before)
      await run(21)
      assert.deepEqual(await snapshot(), edited)
    })
  await gate('literal-17-18-unwrap-guard-whitespace', async () => {
    await fresh()
    const prose = await paragraphTexts()
    await run(17)
    assert.deepEqual(await paragraphTexts(), prose)
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().getCode('beacon-ingest')), null)
    await run(18)
    await settle()
    const wrapped = await snapshot()
    await run(18)
    assert.deepEqual(await snapshot(), wrapped)
    assert.equal((await codeState()).source, expectedSource)
    assert.ok((await codeState()).rect)
  })
  await gate('literal-19-delete-full-history', async () => {
    await fresh()
    const before = await snapshot()
    await run(19)
    const deleted = await snapshot()
    assert.ok(!deleted.body.dataStream.includes('// Beacon batch:'))
    assert.equal((await codeState('beacon-query')).source, COMPARISON_LINES.join('\n'))
    await run(20)
    assert.deepEqual(await snapshot(), before)
    await run(21)
    assert.deepEqual(await snapshot(), deleted)
  })
  await gate('literal-22-23-31-query-business-blocks', async () => {
    await fresh()
    const before = await snapshot()
    await run(22)
    await run(23)
    await run(31)
    assert.deepEqual(await snapshot(), before)
  })
  await gate('literal-24-getText-strict-whitespace', async () => {
    await fresh()
    await run(24)
    assert.equal(await page.evaluate(() => window.beaconCode().getText()), expectedSource)
  })
  await gate('literal-25-facade-clipboard-strict-whitespace', async () => {
    await fresh()
    await run(25)
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expectedSource)
  })
  await gate('literal-26-27-explicit-snapshot-clipboard', async () => {
    await fresh()
    await run(26)
    assert.equal(await page.evaluate(() => window.beaconSource()), expectedSource)
    await run(27)
    // Windows native clipboard converts LF to CRLF; compare the unmodified result exactly.
    const clipboardSource = process.platform === 'win32' ? expectedSource.replaceAll('\n', '\r\n') : expectedSource
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), clipboardSource)
    await run(32)
    const editedSource = expectedSource.replace('blank lines.', 'blank lines. Review pending.')
    assert.equal(await page.evaluate(() => window.beaconSource()), editedSource)
    await run(27)
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      process.platform === 'win32' ? editedSource.replaceAll('\n', '\r\n') : editedSource,
    )
  })
  await gate('literal-28-same-id-edited-reconstruction', async () => {
    await fresh()
    await run(32)
    const before = await snapshot()
    await page.evaluate(() => (window.beaconPaint = []))
    await run(28)
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.waitForFunction(() => window.beaconPaint.join('').includes('Beacon'))
    assert.ok((await codeState()).rect)
    await page.screenshot({ path: path.join(directory, 'reconstructed.png') })
  })
  await gate('literal-29-30-empty-exact-baseline', async () => {
    await fresh()
    const before = await snapshot()
    await run(29)
    await settle()
    assert.equal((await snapshot()).body.dataStream, '\r\n')
    await page.evaluate(() => (window.beaconPaint = []))
    await run(30)
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.waitForFunction(() => window.beaconPaint.join('').includes('Beacon'))
    assert.equal((await codeState()).source, expectedSource)
  })
  await gate('native-language-picker-full-history', async () => {
    await fresh()
    const before = await snapshot()
    await page.mouse.move(900, 580)
    await settle()
    // Native canvas hover should expose its own language button.
    const languageRect = (await codeState()).languageRect
    assert.ok(languageRect, 'Native hover language button must be available')
    await page.mouse.click(
      (languageRect.left + languageRect.right) / 2,
      (languageRect.top + languageRect.bottom) / 2 + 124,
    )
    const picker = page.locator('[data-u-comp="docs-code-ui.language-picker"]')
    await picker.waitFor()
    await page.screenshot({ path: path.join(directory, 'native-language-picker.png') })
    const previousColors = await colors()
    await page.evaluate(() => {
      window.beaconDraw = []
      window.beaconPaint = []
    })
    await picker.getByRole('button', { name: 'Plain text', exact: true }).click()
    await settle()
    assert.equal((await codeState()).description.config.language, 'plaintext')
    assert.equal((await codeState()).source, expectedSource)
    assert.notDeepEqual(await colors(), previousColors)
    assert.ok(await page.evaluate(() => window.beaconPaint.join('').includes('Beacon')))
    await page.screenshot({ path: path.join(directory, 'native-language-plaintext.png') })
    report.gates['native-language-picker-render'] = { passed: true }
    const edited = await snapshot()
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-grid-code-insertion-full-history', async () => {
    await fresh()
    await page.mouse.click(700, 370)
    await page.evaluate(() => {
      const r = window.beaconParagraph('Beacon gathers').getRange()
      window.univerAPI.getActiveDocument().setSelection(r.startOffset, r.endOffset)
    })
    const before = await snapshot()
    await page.getByText('Insert', { exact: true }).first().click()
    await page.locator('[data-u-command="docs-code.command.insert"]').click()
    await settle()
    const id = await page.evaluate(() => {
      const doc = window.univerAPI.getActiveDocument()
      const r = window.beaconParagraph('Beacon gathers').getRange()
      return doc.getCodeAt(r.startOffset)?.getId()
    })
    assert.ok(id)
    assert.ok((await codeState(id)).rect)
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().getCodes().length), 6)
    report.gates['native-grid-code-render'] = { passed: true }
    await page.screenshot({ path: path.join(directory, 'native-grid-code.png') })
    const edited = await snapshot()
    await page.getByText('Start', { exact: true }).first().click()
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-comment-typing-full-history', async () => {
    await fresh()
    await page.mouse.click(750, 518)
    await run(16)
    await page.evaluate(() => {
      const r = window.beaconParagraph('// Beacon batch:').getRange()
      window.univerAPI.getActiveDocument().setSelection(r.endOffset, r.endOffset)
      window.beaconPaint = []
    })
    const before = await snapshot()
    await page.keyboard.type(' reviewed')
    await page.waitForFunction(() => window.univerAPI.getActiveDocument().save().body.dataStream.includes(' reviewed'))
    await page.waitForTimeout(500)
    await settle()
    const edited = await snapshot()
    assert.ok(await page.evaluate(() => window.beaconPaint.join('').includes('reviewed')))
    assert.ok((await codeState()).source.includes(' reviewed'))
    report.gates['native-comment-render'] = { passed: true }
    await page.screenshot({ path: path.join(directory, 'native-input.png') })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-code-slash-literal-character', async () => {
    await fresh()
    await page.mouse.click(750, 518)
    await page.evaluate(() => {
      const r = window.beaconParagraph('// Beacon batch:').getRange()
      window.univerAPI.getActiveDocument().setSelection(r.endOffset, r.endOffset)
    })
    const before = (await codeState()).source
    await page.keyboard.type('/')
    await settle()
    assert.equal((await codeState()).source, before.replace('\n', '/\n'))
  })
  await gate('complete-locales-edited-theme-owner', async () => {
    await fresh()
    await run(32)
    const saved = await snapshot()
    await page.evaluate(() => (window.beaconOwner = window.univerAPI))
    const source = await fs.readFile('showcase/docs-modern/code-blocks/code/create-demo.ts', 'utf8')
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
        assert.equal(await page.evaluate(() => window.beaconOwner === window.univerAPI), true)
        assert.deepEqual(await snapshot(), saved)
      }
      await page.screenshot({ path: path.join(directory, locale + '.png') })
    }
  })
  await gate('disposal', async () => {
    await page.evaluate(() => {
      const dispose = window.beaconPagehide
      dispose(new Event('pagehide'))
      dispose(new Event('pagehide'))
    })
    await page.locator('.code-demo').waitFor({ state: 'detached' })
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
    const source = await fs.readFile('showcase/docs-modern/code-blocks/code/create-demo.ts', 'utf8')
    for (const [, prefix] of source.matchAll(/^import \w+ZhCN from '([^']+)zh-CN'/gm))
      pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + 'zh-CN')).default)
    await page.screenshot({ path: path.join(directory, 'initial-zh.png') })
  })
  await gate('no-runtime-errors-or-backend', async () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
  })
  await gate('all-32-literals-executed', async () => assert.equal(new Set(report.literals).size, 32))
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, geometry: report.geometry.length }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
