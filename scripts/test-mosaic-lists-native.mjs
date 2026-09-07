/* eslint-disable no-await-in-loop -- Published examples and native history are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/mosaic-lists-native')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/docs-modern/lists-task-items'
const examples = [
  ...(await fs.readFile('showcase/docs-modern/lists-task-items/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 27)
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } })
await context.addInitScript(() => {
  window.mosaicPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.mosaicPaint.length < 20000) window.mosaicPaint.push(String(text))
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
  await page.locator('.list-demo[data-ready=true]').waitFor()
  await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
  await page.waitForFunction(
    () =>
      !document.querySelector('[data-u-comp=workbench-skeleton-content]') &&
      window.mosaicPaint.join('').includes('Mosaic'),
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
      item: doc.findListItemByText(needle)?.describe(),
      symbol: line?.divides.flatMap((d) => d.glyphGroup).find((g) => g.glyphType === 2)?.content,
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
      const source = (await readShowcaseSources()).find((c) => c.slug === 'docs-modern/lists-task-items')
      assert.equal(manifest.slug, source.slug)
      for (const [name, content] of Object.entries(source.files))
        assert.equal(await fs.readFile(path.join(manifest.directory, name.slice(1)), 'utf8'), content, name)
      report.export = manifest
    })
  await fresh()
  await gate('native-startup-content-css', async () => {
    const model = await snapshot()
    assert.equal(model.body.paragraphs.length, 27)
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().describeListItems().length), 13)
    assert.deepEqual(model.body.blockRanges.map((b) => b.blockType).toSorted(), ['callout', 'code', 'quote'])
    assert.equal(model.body.customRanges[0].properties.url, 'https://example.org/mosaic-handling')
    assert.equal(
      await page
        .locator('.list-demo > fieldset,.list-demo > nav,.list-demo details,.list-demo output,[data-action]')
        .count(),
      0,
    )
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    const label = await typography('[LABEL]'),
      light = await typography('[LIGHT]'),
      floor = await typography('[FLOOR]')
    assert.equal(label.item.nestingLevel, 1)
    assert.equal(light.item.nestingLevel, 1)
    assert.ok(label.textLeft > floor.textLeft)
    assert.equal(label.symbol, 'a.')
    assert.equal(light.symbol, 'b.')
    report.typography.push(label, light, floor)
    await page.screenshot({ path: path.join(directory, 'opening.png') })
  })
  for (const [n, marker, property, value] of [
    [2, '[LABEL]', 'nestingLevel', 0],
    [3, '[LABEL]', 'nestingLevel', 2],
    [4, '[LIGHT]', 'nestingLevel', 2],
    [5, '[OPEN]', 'nestingLevel', 1],
    [6, '[WALK]', 'glyphType', 2],
    [7, '[LIGHT]', 'glyphType', 4],
    [9, '[COAT]', 'glyphSymbol', '◆'],
    [10, '[WALK]', 'startNumber', 6],
    [13, '[EXIT]', 'listType', 'CHECK_LIST_CHECKED'],
    [14, '[KEYS]', 'listType', 'CHECK_LIST'],
  ])
    await gate('literal-' + n, async () => {
      await fresh()
      const before = await snapshot()
      await run(n)
      await settle()
      const actual = await typography(marker)
      assert.equal(actual.item[property], value)
      assert.deepEqual((await snapshot()).body.dataStream, before.body.dataStream)
      assert.ok(actual.symbol)
      if (n === 9) assert.equal(actual.symbol, '◆')
      if (n === 10) assert.equal(actual.symbol, '7.')
      report.typography.push({ example: n, ...actual })
    })
  await gate('literal-8-strict-single-item-scope', async () => {
    await fresh()
    await run(7)
    await run(8)
  })
  await gate('literal-11-continue-visible-numbering', async () => {
    await fresh()
    await run(11)
    await settle()
    const prior = await typography('[OPEN]'),
      after = await typography('[EMAIL]')
    assert.equal(parseInt(after.symbol), parseInt(prior.symbol) + 1)
    report.typography.push({ example: 11, prior, after })
  })
  await gate('literal-12-visible-prefix-suffix', async () => {
    await fresh()
    await run(12)
    await settle()
    for (const marker of ['[FLOOR]', '[LABEL]', '[LIGHT]', '[OPEN]']) {
      const actual = await typography(marker)
      assert.match(actual.symbol, /^Step .+:$/)
      report.typography.push({ example: 12, ...actual })
    }
    await page.screenshot({ path: path.join(directory, 'step-markers.png') })
  })
  for (const n of [15, 16, 17, 21])
    await gate('literal-' + n, async () => {
      await fresh()
      await run(n)
      if (n !== 21) {
        const selection = await page.evaluate(() => {
          const i = window.univerAPI._injector
          const manager = [...i.resolvedDependencyCollection.resolvedDependencies.keys()]
            .map((k) => i.get(k))
            .find((v) => typeof v?.getTextRanges === 'function' && typeof v?.getRectRanges === 'function')
          return manager?.getTextRanges()
        })
        const expected = await page.evaluate((example) => {
          const markers =
            example === 15
              ? ['[LABEL]']
              : example === 16
                ? ['[LABEL]', '[LIGHT]']
                : ['[FLOOR]', '[LABEL]', '[LIGHT]', '[WALK]', '[OPEN]']
          return markers.map((marker) => {
            const item = window.univerAPI.getActiveDocument().findListItemByText(marker).describe()
            return { startOffset: item.startOffset, endOffset: item.endOffset }
          })
        }, n)
        assert.deepEqual(
          selection?.map(({ startOffset, endOffset }) => ({ startOffset, endOffset })),
          expected,
        )
      }
    })
  await gate('literal-edit-full-history', async () => {
    await fresh()
    const before = await snapshot()
    await run(18)
    const edited = await snapshot()
    assert.ok(edited.body.dataStream.includes('matched to the loan register'))
    await run(19)
    assert.deepEqual(await snapshot(), before)
    await run(20)
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('literal-22-reconstruction-model-canvas', async () => {
    await fresh()
    await run(13)
    const before = await snapshot()
    await page.evaluate(() => (window.mosaicPaint = []))
    await run(22)
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.waitForFunction(() => window.mosaicPaint.join('').includes('Mosaic'))
    assert.equal((await typography('[LABEL]')).symbol, 'a.')
    await page.screenshot({ path: path.join(directory, 'reconstructed.png') })
  })
  await gate('literal-23-24-empty-restore-model-canvas', async () => {
    await fresh()
    const before = await snapshot()
    await run(23)
    await settle()
    assert.equal((await snapshot()).body.dataStream, '\r\n')
    await page.evaluate(() => (window.mosaicPaint = []))
    await run(24)
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.waitForFunction(() => window.mosaicPaint.join('').includes('Mosaic'))
  })
  await gate('literal-25-invalid-start-preserves-full-model', async () => {
    await fresh()
    await run(25)
    const before = await snapshot()
    for (const number of [0, 1.5, NaN, 100]) {
      const rejected = await page.evaluate((n) => {
        try {
          window.mosaicRestart(n)
          return false
        } catch {
          return true
        }
      }, number)
      assert.equal(rejected, true)
      assert.deepEqual(await snapshot(), before)
    }
    await page.evaluate(() => window.mosaicRestart(9))
    await settle()
    assert.equal((await typography('[WALK]')).symbol, '9.')
  })
  await gate('literal-26-level-prefix-suffix', async () => {
    await fresh()
    const floor = await typography('[FLOOR]')
    await run(26)
    await settle()
    assert.match((await typography('[LABEL]')).symbol, /^Prep .+\)$/)
    assert.match((await typography('[LIGHT]')).symbol, /^Prep .+\)$/)
    assert.equal((await typography('[FLOOR]')).symbol, floor.symbol)
  })
  await gate('literal-27-explicit-boundaries-two-real-commands', async () => {
    await fresh()
    await run(27)
    const before = await snapshot()
    assert.equal(await page.evaluate(() => window.mosaicMove('[FLOOR]', 'promote')), 'boundary')
    assert.deepEqual(await snapshot(), before)
    for (const marker of ['[LABEL]', '[LIGHT]']) {
      assert.equal(await page.evaluate((m) => window.mosaicMove(m, 'demote'), marker), 'changed')
      assert.equal((await typography(marker)).item.nestingLevel, 2)
    }
    await run(19)
    await run(19)
    assert.deepEqual(await snapshot(), before)
    for (let level = 1; level < 8; level++)
      assert.equal(await page.evaluate(() => window.mosaicMove('[LABEL]', 'demote')), 'changed')
    const maximum = await snapshot()
    assert.equal(await page.evaluate(() => window.mosaicMove('[LABEL]', 'demote')), 'boundary')
    assert.deepEqual(await snapshot(), maximum)
  })
  await gate('native-input-full-history', async () => {
    await fresh()
    await canvas.click({ position: { x: 500, y: 100 } })
    await run(15)
    await page.keyboard.press('ArrowRight')
    const before = await snapshot()
    await page.keyboard.type(' native confirmed')
    await page.waitForFunction(() =>
      window.univerAPI.getActiveDocument().save().body.dataStream.includes('native confirmed'),
    )
    await page.waitForTimeout(500)
    const edited = await snapshot()
    assert.ok((await typography('[LABEL]')).text.includes('native confirmed'))
    report.gates['native-keyboard-render'] = { passed: true }
    await page.screenshot({ path: path.join(directory, 'native-input.png') })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-bullet-menu-full-history', async () => {
    await fresh()
    await canvas.click({ position: { x: 500, y: 100 } })
    await run(15)
    const before = await snapshot()
    await page.locator('[data-u-command="doc.command.bullet-list"]').click()
    await settle()
    const actual = await typography('[LABEL]')
    assert.equal(actual.item.listType, 'BULLET_LIST')
    assert.ok(actual.symbol)
    report.gates['native-bullet-menu-render'] = { passed: true }
    report.typography.push({ nativeBullet: true, ...actual })
    const edited = await snapshot()
    await page.screenshot({ path: path.join(directory, 'native-bullet.png') })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-checkbox-full-history', async () => {
    await fresh()
    const before = await snapshot()
    // The opening screenshot at this fixed viewport places the native EXIT checkbox at (463,1037).
    await page.mouse.click(463, 1037)
    await settle()
    assert.equal((await typography('[EXIT]')).item.listType, 'CHECK_LIST_CHECKED')
    report.gates['native-checkbox-render'] = { passed: true }
    const edited = await snapshot()
    await page.screenshot({ path: path.join(directory, 'native-checkbox.png') })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('complete-locales-edited-theme-owner', async () => {
    await fresh()
    await run(18)
    const saved = await snapshot()
    await page.evaluate(() => (window.mosaicOwner = window.univerAPI))
    const source = await fs.readFile('showcase/docs-modern/lists-task-items/code/create-demo.ts', 'utf8')
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
        assert.equal(await page.evaluate(() => window.mosaicOwner === window.univerAPI), true)
        assert.deepEqual(await snapshot(), saved)
      }
      await page.screenshot({ path: path.join(directory, locale + '.png') })
    }
  })
  await gate('disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await page.locator('.list-demo').waitFor({ state: 'detached' })
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
    const source = await fs.readFile('showcase/docs-modern/lists-task-items/code/create-demo.ts', 'utf8')
    for (const [, prefix] of source.matchAll(/^import \w+ZhCN from '([^']+)zh-CN'/gm))
      pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + 'zh-CN')).default)
    await page.screenshot({ path: path.join(directory, 'initial-zh.png') })
  })
  await gate('no-runtime-errors-or-backend', async () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, typography: report.typography.length }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
