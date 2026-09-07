/* eslint-disable no-await-in-loop -- Ordered literal examples and native history share one document. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/north-typesetting-native')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') +
    '/en-US/playground/docs-traditional/paragraph-typesetting'
const examples = [
  ...(await fs.readFile('showcase/docs-traditional/paragraph-typesetting/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 20)
const browser = await chromium.launch(),
  context = await browser.newContext({ viewport: { width: 1600, height: 1100 } })
const page = await context.newPage()
page.setDefaultTimeout(12000)
const report = { passed: false, url, gates: {}, errors: [], backendRequests: [], layouts: [] }
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
const run = (n) => page.evaluate('(async()=>{\n' + examples[n - 1] + '\n})()')
const canvas = page.locator('#univer-doc-main-canvas')
async function ink() {
  await page.waitForFunction(() => {
    const surface = document.getElementById('univer-doc-main-canvas')
    if (!surface?.width || !surface.height) return false
    const pixels = surface.getContext('2d').getImageData(0, 0, surface.width, surface.height).data
    let count = 0
    for (let i = 0; i < pixels.length; i += 4)
      if (pixels[i + 3] > 200 && pixels[i] < 80 && pixels[i + 1] < 80 && pixels[i + 2] < 80) count++
    return count > 1200
  })
}
async function ready() {
  await page.locator('.north-typesetting[data-ready=true]').waitFor()
  await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
  await page.waitForFunction(() => !document.querySelector('[data-u-comp=workbench-skeleton-content]'))
  await ink()
  await settle()
}
async function fresh() {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await ready()
  await run(1)
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
// Private render access is read-only test evidence, never a production inspector or replacement renderer.
const layout = (marker) =>
  page.evaluate((needle) => {
    const api = window.univerAPI,
      doc = api.getActiveDocument(),
      paragraph = doc.getParagraphs().find((item) => item.getText().includes(needle)),
      range = paragraph.getRange()
    const injector = api._injector,
      key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      )
    const render = injector.get(key).getRenderUnitById(doc.getId()),
      skeleton = render.mainComponent._skeleton,
      pages = skeleton._skeletonData.pages
    const lines = [],
      seen = new Set()
    let font, pageIndex
    for (let index = range.startOffset; index < range.endOffset - 1; index++) {
      const glyph = skeleton.findNodeByCharIndex(index),
        line = glyph?.parent?.parent
      if (!glyph || !line) continue
      font ??= glyph.fontStyle
      let ancestor = glyph
      while (ancestor && !pages.includes(ancestor)) ancestor = ancestor.parent
      pageIndex ??= pages.indexOf(ancestor)
      if (!seen.has(line)) {
        seen.add(line)
        lines.push({
          left: glyph.left + (glyph.parent.left || 0) + (glyph.parent.paddingLeft || 0),
          top: line.top,
          height: line.lineHeight,
        })
      }
    }
    return {
      text: paragraph.getText(),
      style: paragraph.getInfo().paragraph.paragraphStyle,
      lines,
      font,
      pageIndex,
      pages: pages.map((p) => [p.pageWidth, p.pageHeight]),
      scrollY: render.scene.getViewport('viewMain').viewportScrollY,
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
    await gate('selected-exact-package-export', async () => {
      const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
      assert.equal(manifest.slug, 'docs-traditional/paragraph-typesetting')
      const data = (await readShowcaseSources()).find((c) => c.slug === manifest.slug)
      for (const [n, s] of Object.entries(data.files))
        assert.equal(await fs.readFile(path.join(manifest.directory, n.slice(1)), 'utf8'), s, n)
      assert.ok(
        !(await fs.lstat(path.join(manifest.directory, 'node_modules'))).isSymbolicLink(),
        'No root node_modules junction',
      )
      for (const link of manifest.links) {
        assert.equal(
          JSON.parse(await fs.readFile(path.join(manifest.directory, 'node_modules', link.name, 'package.json')))
            .version,
          link.version,
        )
        assert.ok((await fs.lstat(path.join(manifest.directory, 'node_modules', link.name))).isSymbolicLink())
      }
      report.export = { ...manifest, sourceFiles: Object.keys(data.files).length }
    })
  await fresh()
  const baseline = await snapshot()
  await gate('native-three-page-story-css', async () => {
    assert.equal(baseline.body.paragraphs.length, 24)
    assert.equal(
      await page
        .locator('.north-typesetting fieldset,.north-typesetting details,.north-typesetting output,[data-command]')
        .count(),
      0,
    )
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    const first = await layout('This small blue vessel')
    assert.deepEqual(first.pages, [
      [794, 1123],
      [794, 1123],
      [794, 1123],
    ])
    assert.equal(first.font.fontSize, 11)
    assert.equal(first.font.fontFamily, 'Georgia')
    assert.equal((await layout('02 / Provenance')).pageIndex, 1)
    assert.equal((await layout('03 / Display')).pageIndex, 2)
    await page.screenshot({ path: path.join(directory, 'opening.png') })
    await canvas.hover()
    await page.mouse.wheel(0, 1100)
    await settle()
    await ink()
    assert.ok((await layout('NG-R01')).scrollY > 700)
    await page.screenshot({ path: path.join(directory, 'evidence-page.png') })
    await page.mouse.wheel(0, 1100)
    await settle()
    await ink()
    await page.screenshot({ path: path.join(directory, 'review-page.png') })
  })
  const markers = [
    'This small blue vessel',
    'This small blue vessel',
    'NG-R01',
    'Reviewer note:',
    'A short label invites',
    'Prepared by Mira',
    'NG-R02',
    'Evidence is filed',
    'DISPLAY DRAFT:',
    'Access review:',
    'NG-R02',
    'Reviewer note:',
    'NG-R01',
  ]
  for (let n = 2; n <= 14; n++)
    await gate('literal-layout-' + n, async () => {
      await run(n)
      await settle()
      const actual = await layout(markers[n - 2])
      assert.equal((await snapshot()).body.dataStream, baseline.body.dataStream)
      assert.ok(actual.lines.length > 0 && actual.lines.every((line) => Number.isFinite(line.top) && line.height > 0))
      assert.equal(actual.font.fontSize, 11)
      report.layouts.push({ example: n, ...actual })
      if ([2, 8, 9, 14].includes(n)) assert.equal(actual.lines[0].left, 0)
      if (n === 3) {
        assert.equal(actual.lines[0].left, 28)
        assert.equal(actual.style.horizontalAlign, 4)
      }
      if (n === 4) {
        assert.equal(actual.lines[0].left, 0)
        assert.equal(actual.lines[1].left, 36)
      }
      if (n === 5) {
        assert.equal(actual.style.lineSpacing, 2)
        assert.equal(actual.lines[1].top - actual.lines[0].top, 32)
      }
      if ([6, 7].includes(n)) assert.ok(actual.lines[0].left > 0)
      if (n === 10) assert.equal(actual.lines[0].left, 24)
      if (n === 11) {
        assert.equal(actual.style.lineSpacing, 1.5)
        assert.ok(actual.lines[1].top - actual.lines[0].top > 24)
      }
      if (n === 12) assert.equal(actual.lines[0].left, 24)
      if (n === 13) assert.equal(actual.lines[1].top - actual.lines[0].top, 22)
    })
  await gate('literal-edit-full-history', async () => {
    await run(15)
    await settle()
    const edited = await snapshot()
    assert.match(edited.body.dataStream, /Final wording reviewed/)
    await canvas.click({ position: { x: 500, y: 100 } })
    await run(16)
    await settle()
    assert.deepEqual(await snapshot(), await page.evaluate(() => window.northBeforeEdit))
  })
  await gate('literal-redo-full-model', async () => {
    await run(17)
    await settle()
    assert.deepEqual(await snapshot(), await page.evaluate(() => window.northAfterEdit))
  })
  await run(18)
  await run(19)
  await gate('literal-reconstruction-render', async () => {
    await run(20)
    await settle()
    await ink()
    assert.deepEqual({ ...(await snapshot()), id: baseline.id }, baseline)
    assert.deepEqual((await layout('This small blue vessel')).pages, [
      [794, 1123],
      [794, 1123],
      [794, 1123],
    ])
    await page.screenshot({ path: path.join(directory, 'reconstructed.png') })
  })
  await fresh()
  await gate('native-paragraph-input-history', async () => {
    await canvas.click({ position: { x: 500, y: 100 } })
    await run(18)
    await page.keyboard.press('ArrowRight')
    const before = await snapshot()
    await page.keyboard.type(' Reviewed with the evidence packet.')
    await page.waitForFunction(() =>
      window.univerAPI.getActiveDocument().save().body.dataStream.includes('Reviewed with the evidence packet.'),
    )
    await page.waitForTimeout(500)
    const edited = await snapshot()
    assert.match((await layout('This small blue vessel')).text, /Reviewed with the evidence packet/)
    await ink()
    report.gates['native-paragraph-input-render'] = { passed: true }
    await page.screenshot({ path: path.join(directory, 'native-edited.png') })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-alignment-menu-history', async () => {
    await canvas.click({ position: { x: 500, y: 100 } })
    await run(18)
    const before = await snapshot()
    await page.locator('[data-u-command="doc.command.align-action"]').click()
    await page.getByRole('menuitem', { name: 'Align Center', exact: true }).click()
    await settle()
    const actual = await layout('This small blue vessel')
    assert.equal(actual.style.horizontalAlign, 2)
    assert.ok(actual.lines.at(-1).left > 0)
    report.gates['native-alignment-render'] = { passed: true }
    const edited = await snapshot()
    await page.screenshot({ path: path.join(directory, 'native-centered.png') })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), before)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('locales-theme-edited-owner', async () => {
    const before = await snapshot()
    await page.evaluate(() => {
      window.northOwner = window.univerAPI
    })
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      pack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs/preset-docs-core/locales/' + locale)).default,
      )
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.deepEqual(await snapshot(), before)
        assert.equal(await page.evaluate(() => window.univerAPI === window.northOwner), true)
      }
      await page.screenshot({ path: path.join(directory, locale + '.png') })
    }
  })
  await gate('disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await page.locator('.north-typesetting').waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('initial-zh', async () => {
    await page.addInitScript(() => {
      const o = new MutationObserver(() => {
        if (document.documentElement) {
          document.documentElement.lang = 'zh-CN'
          o.disconnect()
        }
      })
      o.observe(document, { childList: true, subtree: true })
    })
    await fresh()
    pack(
      await page.evaluate(() => window.univerAPI.getLocales()),
      (await import('@univerjs/preset-docs-core/locales/zh-CN')).default,
    )
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
  console.log(JSON.stringify({ ...report, layouts: report.layouts.length }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
