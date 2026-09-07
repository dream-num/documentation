/* eslint-disable no-await-in-loop -- Published examples and native history are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/tide-callouts-native')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/docs-modern/callout-blocks'
const examples = [
  ...(await fs.readFile('showcase/docs-modern/callout-blocks/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 32)
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } })
await context.addInitScript(() => {
  const addEventListener = window.addEventListener
  window.addEventListener = function (type, listener, options) {
    // Capture the exported entry's closure, which owns the actual createDemo controller.
    if (type === 'pagehide') window.tidePagehide = listener
    return addEventListener.call(this, type, listener, options)
  }
  window.tidePaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.tidePaint.length < 20000) window.tidePaint.push(String(text))
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
  await page.locator('.callout-demo[data-ready=true]').waitFor()
  await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
  await page.waitForFunction(
    () =>
      !document.querySelector('[data-u-comp=workbench-skeleton-content]') && window.tidePaint.join('').includes('Tide'),
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
// Read-only installed renderer geometry and real canvas bytes; mutations use published Facades/native UI.
const geometry = (blockId = 'tide-risk') =>
  page.evaluate((id) => {
    const api = window.univerAPI,
      doc = api.getActiveDocument(),
      block = doc.getCallout(id)
    const p = doc.getParagraphs().find((item) => item.getText().includes(id === 'tide-risk' ? '[RISK]' : '[NOTE]'))
    const i = api._injector
    const key = [...i.resolvedDependencyCollection.resolvedDependencies.keys()].find(
      (k) => String(k) === 'engine-render.render-manager.service',
    )
    const render = i.get(key).getRenderUnitById(doc.getId())
    const glyph = p && render.mainComponent._skeleton.findNodeByCharIndex(p.getRange().startOffset)
    const fragment = render.mainComponent
      .getExtensionByKey('DocsCalloutBackgroundExtension')
      .getFragments()
      .find((f) => f.rect.blockId === id)
    return {
      block: block?.describe(),
      glyph: glyph?.content,
      color: glyph?.ts?.cl,
      textLeft: glyph?.left + (glyph?.parent?.left || 0) + (glyph?.parent?.paddingLeft || 0),
      lineTop: glyph?.parent?.parent?.top,
      rect: fragment && {
        left: fragment.rect.left,
        top: fragment.rect.top,
        width: fragment.rect.width,
        height: fragment.rect.height,
      },
    }
  }, blockId)
const pixels = () =>
  canvas.evaluate((c) => {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
    let hash = 2166136261
    for (let n = 0; n < d.length; n++) hash = Math.imul(hash ^ d[n], 16777619) >>> 0
    return hash
  })
async function backgroundPixels(actual) {
  // Installed background renderer alpha is 0.45. At the fixed 1600px viewport,
  // opening.png establishes document-to-canvas translation (390,20).
  const count = await canvas.evaluate(
    (c, { rect, color }) => {
      const values = color.startsWith('#')
        ? color
            .slice(1)
            .match(/../g)
            .map((v) => parseInt(v, 16))
        : color.match(/[\d.]+/g).map(Number)
      const alpha = 0.45 * (values[3] ?? 1)
      const expected = values.slice(0, 3).map((v) => Math.round(v * alpha + 255 * (1 - alpha)))
      const d = c
        .getContext('2d')
        .getImageData(
          Math.ceil(rect.left + 392),
          Math.ceil(rect.top + 22),
          Math.floor(rect.width - 4),
          Math.floor(rect.height - 4),
        ).data
      let matching = 0
      for (let n = 0; n < d.length; n += 4) if (expected.every((v, k) => Math.abs(d[n + k] - v) <= 1)) matching++
      return { expected, matching }
    },
    { rect: actual.rect, color: actual.block.config.backgroundColor },
  )
  assert.ok(count.matching > 1000, JSON.stringify(count))
  return count
}
function pack(actual, expected, prefix = '') {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual?.[k], v, prefix + k + '.')
    else assert.deepEqual(actual?.[k], v, prefix + k)
  }
}
const bold = (m) => m.body.textRuns.filter((r) => r.ts.bl === 1).map((r) => ({ st: r.st, ed: r.ed }))
const paragraphTexts = () =>
  page.evaluate(() =>
    window.univerAPI
      .getActiveDocument()
      .getParagraphs()
      .map((p) => p.getText()),
  )
const boldText = (m) => m.body.textRuns.filter((r) => r.ts.bl === 1).map((r) => m.body.dataStream.slice(r.st, r.ed))
try {
  if (process.argv[2])
    await gate('selected-export-source-parity', async () => {
      const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
      const source = (await readShowcaseSources()).find((c) => c.slug === 'docs-modern/callout-blocks')
      assert.equal(manifest.slug, source.slug)
      for (const [name, content] of Object.entries(source.files))
        assert.equal(await fs.readFile(path.join(manifest.directory, name.slice(1)), 'utf8'), content, name)
      report.export = manifest
    })
  if (process.env.SHOWCASE_TIDE_FINISH_ONLY === '1') {
    await fresh()
    await gate('native-settled-word-count', async () => {
      await page.waitForFunction(() => /\b[1-9]\d* words\b/.test(document.body.innerText))
      report.wordCount = await page.evaluate(() => document.body.innerText.match(/\b([1-9]\d*) words\b/)[0])
      await page.screenshot({ path: path.join(directory, 'opening-settled.png') })
    })
    await gate('same-controller-double-dispose', async () => {
      assert.equal(await page.evaluate(() => typeof window.tidePagehide), 'function')
      await page.evaluate(() => {
        const dispose = window.tidePagehide
        const event = new Event('pagehide')
        dispose(event)
        dispose(event)
      })
      assert.equal(await page.locator('.callout-demo').count(), 0)
      assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
      assert.deepEqual(report.errors, [])
    })
    report.passed = Object.values(report.gates).every((g) => g.passed)
  } else {
    await fresh()
    await gate('native-startup-content-css', async () => {
      const model = await snapshot()
      assert.equal(model.body.paragraphs.length, 22)
      assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().describeListItems().length), 4)
      assert.deepEqual(model.body.blockRanges.map((b) => b.blockType).toSorted(), [
        'callout',
        'callout',
        'callout',
        'callout',
        'code',
        'quote',
      ])
      assert.equal(model.body.customRanges[0].properties.url, 'https://example.org/tide-review-checklist')
      assert.equal(
        await page
          .locator(
            '.callout-demo > fieldset,.callout-demo > nav,.callout-demo details,.callout-demo output,[data-action]',
          )
          .count(),
        0,
      )
      assert.equal(
        await page.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
        'rgb(255, 255, 255)',
      )
      const descriptions = await page.evaluate(() =>
        window.univerAPI
          .getActiveDocument()
          .getCallouts()
          .map((c) => c.describe()),
      )
      assert.equal(new Set(descriptions.map((c) => c.config.backgroundColor)).size, 4)
      assert.equal(descriptions.filter((c) => c.text.includes('[RISK]')).length, 1)
      assert.ok((await geometry()).rect.height > 40)
      report.geometry.push({ startupBackground: await backgroundPixels(await geometry()) })
      await page.screenshot({ path: path.join(directory, 'opening.png') })
    })
    for (const [n, key, value] of [
      [2, 'backgroundColor', '#FEF0C7'],
      [3, 'backgroundColor', '#DBEAFE'],
      [4, 'backgroundColor', '#DCFCE7'],
      [5, 'backgroundColor', '#FEE2E2'],
      [6, 'icon', 'i'],
      [7, 'icon', '💡'],
      [8, 'showIcon', false],
      [9, 'showIcon', true],
      [10, 'backgroundColor', '#EDE9FE'],
      [11, 'borderStyle', 1],
      [12, 'borderStyle', 3],
      [13, 'borderStyle', 2],
      [14, 'borderWidth', 0],
      [15, 'paddingTop', 16],
      [16, 'paddingTop', 6],
      [17, 'paddingTop', 24],
    ])
      await gate('literal-' + n + '-config-canvas-scope', async () => {
        await fresh()
        if (n === 9) await run(8)
        const before = await snapshot(),
          other = await geometry('tide-note'),
          beforePixels = await pixels()
        await run(n)
        await settle()
        const actual = await geometry()
        assert.equal(actual.block.config[key], value)
        assert.equal((await snapshot()).body.dataStream, before.body.dataStream)
        assert.deepEqual(await geometry('tide-note'), other)
        if (![2, 15].includes(n)) assert.notEqual(await pixels(), beforePixels)
        if (n >= 2 && n <= 5) assert.equal(actual.color.rgb, ['#78350F', '#1E3A8A', '#14532D', '#7F1D1D'][n - 2])
        if ([2, 3, 4, 5, 10].includes(n))
          report.geometry.push({ literal: n, background: await backgroundPixels(actual) })
        report.geometry.push({ literal: n, ...actual })
        if ([5, 7, 13, 17].includes(n)) await page.screenshot({ path: path.join(directory, 'literal-' + n + '.png') })
      })
    await gate('literal-16-17-strict-density-layout', async () => {
      await fresh()
      await run(16)
      await settle()
      const compact = await geometry()
      await run(17)
      await settle()
      const roomy = await geometry()
      report.geometry.push({ compact, roomy })
      assert.ok(roomy.textLeft > compact.textLeft, 'Roomier left padding must move actual glyphs')
      assert.ok(
        roomy.rect.height > compact.rect.height,
        'Roomier vertical padding must increase actual fragment height',
      )
    })
    await gate('literal-18-reset-glyph-color-preserves-bold', async () => {
      await fresh()
      const before = await snapshot()
      await run(18)
      await settle()
      assert.notDeepEqual((await geometry()).color, { rgb: '#78350F' })
      const after = await snapshot()
      assert.deepEqual(bold(after), bold(before))
    })
    await gate('literal-19-24-25-append-full-history', async () => {
      await fresh()
      const before = await snapshot()
      await run(19)
      await settle()
      const edited = await snapshot()
      assert.ok((await geometry()).block.text.includes('eight-language editorial panel'))
      await run(24)
      assert.deepEqual(await snapshot(), before)
      await run(25)
      assert.deepEqual(await snapshot(), edited)
    })
    await gate('literal-10-24-25-config-full-history', async () => {
      await fresh()
      const before = await snapshot()
      await run(10)
      const edited = await snapshot()
      await run(24)
      assert.deepEqual(await snapshot(), before)
      await run(25)
      assert.deepEqual(await snapshot(), edited)
    })
    await gate('literal-21-22-unwrap-guard-preserves-content', async () => {
      await fresh()
      const before = await snapshot()
      const prose = await paragraphTexts()
      await run(21)
      await settle()
      assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().getCallout('tide-risk')), null)
      // Unwrap intentionally removes two block sentinels and shifts ranges; compare unchanged prose/emphasis.
      // Full snapshot equality remains mandatory for history and restoration gates.
      assert.deepEqual(await paragraphTexts(), prose)
      assert.deepEqual(boldText(await snapshot()), boldText(before))
      await run(22)
      const wrapped = await snapshot()
      await run(22)
      assert.deepEqual(await snapshot(), wrapped)
      assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().getCallouts().length), 4)
      await settle()
      assert.ok((await geometry()).rect)
    })
    await gate('literal-23-delete-full-history', async () => {
      await fresh()
      const before = await snapshot()
      await run(23)
      const deleted = await snapshot()
      assert.ok(!deleted.body.dataStream.includes('[RISK]'))
      assert.ok(deleted.body.dataStream.includes('[NOTE]'))
      await run(24)
      assert.deepEqual(await snapshot(), before)
      await run(25)
      assert.deepEqual(await snapshot(), deleted)
    })
    await gate('literal-26-27-28-query-invalid-policy', async () => {
      await fresh()
      const before = await snapshot()
      await run(26)
      await run(27)
      await run(28)
      for (const value of ['red', '#fff', 'invalid', '#GG0000']) {
        assert.equal(
          await page.evaluate((v) => {
            try {
              window.tideBackground(v)
              return false
            } catch {
              return true
            }
          }, value),
          true,
        )
        assert.deepEqual(await snapshot(), before)
      }
      await page.evaluate(() => window.tideBackground('#EDE9FE'))
      assert.equal((await geometry()).block.config.backgroundColor, '#EDE9FE')
    })
    await gate('literal-29-same-id-edited-reconstruction', async () => {
      await fresh()
      await run(19)
      const before = await snapshot()
      await page.evaluate(() => (window.tidePaint = []))
      await run(29)
      await settle()
      assert.deepEqual(await snapshot(), before)
      await page.waitForFunction(() => window.tidePaint.join('').includes('Tide'))
      assert.ok((await geometry()).rect)
      await page.screenshot({ path: path.join(directory, 'reconstructed.png') })
    })
    await gate('literal-30-31-empty-exact-baseline', async () => {
      await fresh()
      const before = await snapshot()
      await run(30)
      await settle()
      assert.equal((await snapshot()).body.dataStream, '\r\n')
      await page.evaluate(() => (window.tidePaint = []))
      await run(31)
      await settle()
      assert.deepEqual(await snapshot(), before)
      await page.waitForFunction(() => window.tidePaint.join('').includes('Tide'))
      assert.ok((await geometry()).rect)
    })
    await gate('literal-32-text-color-full-history', async () => {
      await fresh()
      const before = await snapshot()
      await run(32)
      await settle()
      assert.equal((await geometry()).color.rgb, '#14532D')
      const edited = await snapshot()
      report.gates['literal-32-color-render'] = { passed: true }
      await run(24)
      assert.deepEqual(await snapshot(), before)
      await run(25)
      assert.deepEqual(await snapshot(), edited)
    })
    await gate('native-floating-menu-background-full-history', async () => {
      await fresh()
      const before = await snapshot(),
        oldPixels = await pixels()
      // Coordinates observed on the actual opening screenshot at this viewport, within the RISK text.
      await page.mouse.click(760, 550)
      await page.getByRole('button', { name: 'Callout', exact: true }).click()
      const preset = page.getByRole('button', { name: 'Background color: rgba(144,97,249,0.15)', exact: true })
      await preset.click()
      await settle()
      assert.equal((await geometry()).block.config.backgroundColor, 'rgba(144,97,249,0.15)')
      assert.notEqual(await pixels(), oldPixels)
      report.gates['native-floating-menu-render'] = { passed: true }
      await page.screenshot({ path: path.join(directory, 'native-menu.png') })
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
      await page.mouse.click(760, 550)
      await run(20)
      await page.keyboard.press('ArrowRight')
      const before = await snapshot()
      await page.keyboard.type(' native reviewed')
      await page.waitForFunction(() =>
        window.univerAPI.getActiveDocument().save().body.dataStream.includes('native reviewed'),
      )
      await page.waitForTimeout(500)
      await settle()
      const edited = await snapshot()
      assert.ok((await geometry()).block.text.includes('native reviewed'))
      assert.ok(await page.evaluate(() => window.tidePaint.join('').includes('native')))
      report.gates['native-keyboard-render'] = { passed: true }
      await page.screenshot({ path: path.join(directory, 'native-input.png') })
      await page.locator('[data-u-command="univer.command.undo"]').click()
      await settle()
      assert.deepEqual(await snapshot(), before)
      await page.locator('[data-u-command="univer.command.redo"]').click()
      await settle()
      assert.deepEqual(await snapshot(), edited)
    })
    await gate('complete-locales-edited-theme-owner', async () => {
      await fresh()
      await run(19)
      const saved = await snapshot()
      await page.evaluate(() => (window.tideOwner = window.univerAPI))
      const source = await fs.readFile('showcase/docs-modern/callout-blocks/code/create-demo.ts', 'utf8')
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
          assert.equal(await page.evaluate(() => window.tideOwner === window.univerAPI), true)
          assert.deepEqual(await snapshot(), saved)
        }
        await page.screenshot({ path: path.join(directory, locale + '.png') })
      }
    })
    await gate('disposal', async () => {
      await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
      await page.locator('.callout-demo').waitFor({ state: 'detached' })
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
      const source = await fs.readFile('showcase/docs-modern/callout-blocks/code/create-demo.ts', 'utf8')
      for (const [, prefix] of source.matchAll(/^import \w+ZhCN from '([^']+)zh-CN'/gm))
        pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + 'zh-CN')).default)
      await page.screenshot({ path: path.join(directory, 'initial-zh.png') })
    })
    await gate('no-runtime-errors-or-backend', async () => {
      assert.deepEqual(report.errors, [])
      assert.deepEqual(report.backendRequests, [])
    })
    await gate('all-32-literals-executed', async () => {
      assert.deepEqual(
        [...new Set(report.literals)].toSorted((a, b) => a - b),
        Array.from({ length: 32 }, (_, n) => n + 1),
      )
    })
    report.passed = Object.values(report.gates).every((g) => g.passed)
  }
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, geometry: report.geometry.length }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
