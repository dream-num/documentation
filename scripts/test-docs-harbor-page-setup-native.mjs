/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/harbor-page-setup-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/docs-traditional/page-setup/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 12)
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(restores.length, 1)
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4406'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/docs-traditional/page-setup`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY ||
    (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-harbor-page-setup-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'docs-traditional/page-setup')
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(exportDirectory, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  // Use exact installed package versions; never mutate another preview's dependency directory.
  const manifest = JSON.parse(source.files['/package.json'])
  const viteDirectory = process.env.SHOWCASE_VITE_DIRECTORY || path.join(exportDirectory, 'node_modules', 'vite')
  const vitePackage = await fs.realpath(viteDirectory).catch(() => {
    throw new Error(
      `Vite ${manifest.devDependencies.vite} is unavailable at ${viteDirectory}. Reuse SHOWCASE_EXPORT_DIRECTORY with its installed node_modules/vite, set SHOWCASE_VITE_DIRECTORY to that exact installed Vite package directory, or run pnpm install in the generated selected export ${exportDirectory} and reuse it. No other demo's output is required.`,
    )
  })
  const linkedVersions = {}
  for (const [name, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
    const installed = name === 'vite' ? vitePackage : await fs.realpath(path.join(process.cwd(), 'node_modules', name))
    const actual = JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version
    assert.equal(actual, version, 'Use the exact exported version of ' + name)
    const target = path.join(exportDirectory, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    if (await fs.lstat(target).catch(() => null)) assert.equal(await fs.realpath(target), installed)
    else await fs.symlink(installed, target, 'junction')
    linkedVersions[name] = actual
  }
  await fs.writeFile(path.join(directory, 'linked-versions.json'), JSON.stringify(linkedVersions, null, 2))
  await fs.writeFile(
    path.join(directory, 'exports.json'),
    JSON.stringify([{ slug: source.slug, directory: exportDirectory }], null, 2),
  )
  const { build, preview } = await import(
    pathToFileURL(path.join(exportDirectory, 'node_modules/vite/dist/node/index.js')).href
  )
  const outDir = path.join(directory, 'harness-dist')
  await build({
    root: exportDirectory,
    configFile: false,
    logLevel: 'warn',
    build: { outDir, emptyOutDir: false },
    plugins: [
      {
        name: 'harbor-page-setup-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo,validateSnapshot} from '/src/create-demo.ts';import {createData} from '/src/data.ts';window.createDemo=createDemo;window.validateSnapshot=validateSnapshot;window.createData=createData;window.container=document.getElementById('app');window.demo=createDemo(window.container);
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4406, strictPort: true },
  })
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
page.setDefaultTimeout(12000)
const report = {
  slug: 'docs-traditional/page-setup',
  passed: false,
  gates: {},
  checks: [],
  errors: [],
  differences: [],
  backendRequests: [],
}
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) report.backendRequests.push(request.url())
})
const canvas = page.locator('#univer-doc-main-canvas')
const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveDocument().save())))
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
function pack(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') pack(actual?.[key], value)
    else assert.deepEqual(actual?.[key], value, key)
  }
}
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
function diff(a, b, p = '') {
  if (Object.is(a, b)) return []
  if (a && b && typeof a === 'object' && typeof b === 'object')
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((k) => diff(a[k], b[k], p + '.' + k))
  return [{ path: p, before: a === undefined ? { absent: true } : a, after: b === undefined ? { absent: true } : b }]
}
async function exact(name, a, b) {
  const differences = diff(a, b)
  await fs.writeFile(
    path.join(directory, name + '.json'),
    JSON.stringify({ before: a, after: b, differences }, null, 2),
  )
  report.checks.push({ name, differences: differences.length })
  if (differences.length) report.differences.push({ name, differences })
}
async function ready() {
  await page.locator('.harbor-page-setup[data-ready=true]').waitFor()
  await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
  await page.waitForFunction(() => {
    const c = document.getElementById('univer-doc-main-canvas')
    if (!c?.width || !c.height) return false
    const pixels = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
    let ink = 0
    for (let i = 0; i < pixels.length; i += 4)
      if (pixels[i + 3] > 200 && pixels[i] < 80 && pixels[i + 1] < 80 && pixels[i + 2] < 80) ink++
    return ink > 1200 && !document.querySelector('[data-u-comp=workbench-skeleton-content]')
  })
  await settle()
}
async function fresh() {
  await page.goto(url)
  await ready()
}
async function gate(name, fn, standalone = false) {
  if (standalone && !buildStandalone) {
    report.gates[name] = { passed: false, skipped: 'Standalone lifecycle harness required' }
    return
  }
  const n = report.differences.length,
    e = report.errors.length
  try {
    await fn()
    report.gates[name] = { passed: n === report.differences.length && e === report.errors.length }
  } catch (error) {
    report.gates[name] = { passed: false, failure: error.stack }
    await capture(name + '-failure').catch(() => {})
    await fs.writeFile(
      path.join(directory, name + '-failure-state.json'),
      JSON.stringify(
        {
          snapshot: await snapshot().catch(() => null),
          body: await page
            .locator('body')
            .innerText()
            .catch(() => null),
          dom: await page
            .locator('body')
            .evaluate((node) => node.innerHTML)
            .catch(() => null),
        },
        null,
        2,
      ),
    )
  }
  console.log(name + ' ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
const layout = () =>
  page.evaluate(() => {
    const api = window.univerAPI,
      doc = api.getActiveDocument(),
      injector = api._injector
    const key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
      (k) => String(k) === 'engine-render.render-manager.service',
    )
    const render = injector.get(key).getRenderUnitById(doc.getId()),
      skeleton = render.mainComponent._skeleton,
      pages = skeleton._skeletonData.pages
    return {
      pages: pages.map((p) => ({
        width: p.pageWidth,
        height: p.pageHeight,
        marginLeft: p.marginLeft,
        marginTop: p.marginTop,
      })),
      glyphs: doc.getParagraphs().map((p) => {
        const range = p.getRange(),
          glyph = skeleton.findNodeByCharIndex(range.startOffset),
          lines = new Set()
        for (let i = range.startOffset; i < range.endOffset - 1; i++) {
          const line = skeleton.findNodeByCharIndex(i)?.parent?.parent
          if (line) lines.add(line)
        }
        let owner = glyph
        while (owner && !pages.includes(owner)) owner = owner.parent
        return {
          text: p.getText(),
          font: glyph?.fontStyle,
          page: pages.indexOf(owner),
          lineHeight: glyph?.parent?.parent?.lineHeight,
          lines: lines.size,
        }
      }),
      scrollY: render.scene.getViewport('viewMain').viewportScrollY,
    }
  })
async function geometry(name, width, height) {
  await settle()
  const current = await layout()
  await fs.writeFile(path.join(directory, name + '-layout.json'), JSON.stringify(current, null, 2))
  assert(current.pages.length > 0)
  for (const p of current.pages) {
    assert.equal(p.width, width)
    assert.equal(p.height, height)
  }
  assert(
    current.glyphs.every((g) => g.page >= 0 && g.lineHeight > 0),
    'Every narrative paragraph has actual laid-out glyphs',
  )
  await capture(name)
  report.checks.push({ name, pages: current.pages.length, glyphParagraphs: current.glyphs.length })
}
try {
  await gate('original-native-paper-and-glyphs', async () => {
    await fresh()
    const saved = await snapshot()
    assert.equal(saved.id, 'page-setup-fixture')
    assert.equal(saved.body.paragraphs.length, 14)
    assert.equal(
      await page.locator('.harbor-page-setup > button,.harbor-page-setup > aside,.harbor-page-setup > header').count(),
      0,
    )
    await geometry('cover', 794, 1123)
  })
  await gate('native-page-setup-dialog', async () => {
    await fresh()
    await fs.writeFile(
      path.join(directory, 'native-initial-dom.json'),
      JSON.stringify(await page.locator('body').evaluate((n) => n.innerHTML)),
    )
    await page.locator('[data-u-command="docs.operation.open-page-setting"]').click()
    await page.getByText('Paper size', { exact: true }).waitFor()
    const dialog = page.getByRole('dialog')
    await dialog.evaluate(async (node) => {
      await Promise.all(node.getAnimations({ subtree: true }).map((a) => a.finished))
    })
    await capture('native-page-dialog')
    await fs.writeFile(
      path.join(directory, 'native-dialog-dom.json'),
      JSON.stringify(await page.locator('body').evaluate((n) => n.innerHTML)),
    )
    const before = await snapshot()
    await dialog.locator('[data-u-comp=select]').click()
    await page.getByRole('menuitemradio', { name: 'Letter', exact: true }).click()
    const inputs = dialog.locator('input')
    assert.equal(await inputs.count(), 4)
    for (const [n, value] of ['50', '60', '90', '40'].entries()) {
      await inputs.nth(n).fill(value)
      await inputs.nth(n).press('Tab')
    }
    await dialog.getByRole('button', { name: 'Confirm', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    await geometry('native-letter-margins', 816, 1056)
    const changed = await snapshot()
    for (const [key, value] of Object.entries({ marginTop: 50, marginBottom: 60, marginLeft: 90, marginRight: 40 }))
      assert.equal(changed.documentStyle[key], value)
    await canvas.click({ position: { x: 700, y: 180 } })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    await exact('native-page-undo', before, await snapshot())
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    await exact('native-page-redo', changed, await snapshot())
  })
  await gate('native-orientation-control', async () => {
    await fresh()
    await page.locator('[data-u-command="docs.operation.open-page-setting"]').click()
    await page.getByText('Paper size', { exact: true }).waitFor()
    assert.equal(
      await page.getByRole('dialog').getByText('Orientation', { exact: true }).count(),
      1,
      'Installed native dialog has no orientation control; landscape remains a tested Facade/startup variant, not a fabricated native control.',
    )
  })
  await gate('twelve-literal-facade-examples', async () => {
    await fresh()
    const initialLines = (await layout()).glyphs.reduce((sum, g) => sum + g.lines, 0)
    let binding, annotation
    for (let n = 0; n < examples.length; n++) {
      const before = await snapshot()
      await run(examples[n])
      await settle()
      report.checks.push({ literal: n + 1 })
      if (n === 4) binding = await snapshot()
      if (n === 5) annotation = await snapshot()
      if (n === 6) await exact('literal-margin-undo', binding, await snapshot())
      if (n === 7) await exact('literal-margin-redo', annotation, await snapshot())
      if (n === 1) await geometry('literal-landscape', 1123, 794)
      if (n === 2) await geometry('literal-letter', 816, 1056)
      if (n === 3) {
        await geometry('literal-custom', 560, 720)
        assert(
          (await layout()).glyphs.reduce((sum, g) => sum + g.lines, 0) > initialLines,
          'Compact paper must actually wrap into more lines',
        )
      }
      if (n === 8) await exact('guard-no-mutation', before, await snapshot())
      if (n === 9) await geometry('literal-a4', 794, 1123)
    }
  })
  await gate('native-typing-and-full-history', async () => {
    await fresh()
    await canvas.click({ position: { x: 600, y: 180 } })
    await page.evaluate(() => window.univerAPI.getActiveDocument().setSelection(0, 0))
    const before = await snapshot()
    pack(
      await page.evaluate(() => window.univerAPI.getLocales()),
      (await import('@univerjs/preset-docs-core/locales/en-US')).default,
    )
    await page.keyboard.type('Reviewed ')
    await page.waitForFunction(() =>
      window.univerAPI.getActiveDocument().save().body.dataStream.startsWith('Reviewed '),
    )
    const edited = await snapshot()
    await capture('native-typed')
    await page.keyboard.press('Control+z')
    await settle()
    await exact('native-undo', before, await snapshot())
    await page.keyboard.press('Control+y')
    await settle()
    await exact('native-redo', edited, await snapshot())
  })
  await gate(
    'complete-owner-recovery-and-fresh-edit',
    async () => {
      await fresh()
      await run(examples[3])
      await run(examples[4])
      await run(examples[10])
      await run(examples[11])
      const before = await snapshot()
      await run(restores[0])
      await ready()
      await exact('restored-complete-model', before, await snapshot())
      await geometry('restored-custom', 560, 720)
      const start = (await layout()).scrollY
      await canvas.hover()
      await page.mouse.wheel(0, 1100)
      await page.waitForTimeout(250)
      assert((await layout()).scrollY > start)
      await capture('restored-later-page')
      await canvas.click({ position: { x: 700, y: 240 } })
      await page.evaluate(() => window.univerAPI.getActiveDocument().setSelection(0, 0))
      const freshBefore = await snapshot()
      await page.keyboard.type('Restored ')
      await page.waitForFunction(() =>
        window.univerAPI.getActiveDocument().save().body.dataStream.startsWith('Restored '),
      )
      const edited = await snapshot()
      await page.keyboard.press('Control+z')
      await settle()
      await exact('restored-fresh-undo', freshBefore, await snapshot())
      await page.keyboard.press('Control+y')
      await settle()
      await exact('restored-fresh-redo', edited, await snapshot())
    },
    true,
  )
  for (const [variant, width, height] of [
    ['a4', 794, 1123],
    ['landscape', 1123, 794],
    ['letter', 816, 1056],
    ['custom', 560, 720],
  ])
    await gate(
      'startup-' + variant,
      async () => {
        await page.evaluate(async (paperVariant) => {
          window.demo.dispose()
          window.demo = window.createDemo(window.container, false, undefined, window.createData(paperVariant))
          await window.demo.ready
        }, variant)
        await ready()
        await geometry('startup-' + variant, width, height)
      },
      true,
    )
  await gate(
    'locales-css-theme-invalid-and-disposal',
    async () => {
      await fresh()
      await run(examples[10])
      const before = await snapshot()
      await page.evaluate(() => {
        window.originalAPI = window.univerAPI
        window.univerAPI.toggleDarkMode(true)
      })
      assert(await page.evaluate(() => window.originalAPI === window.univerAPI && window.univerAPI.isDarkMode()))
      await exact('theme-preserves-complete-model', before, await snapshot())
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await page.evaluate(async () => {
        const saved = window.univerAPI.getActiveDocument().save()
        let rejected = false
        try {
          window.createDemo(window.container, false, undefined, { ...saved, id: '' })
        } catch {
          rejected = true
        }
        if (!rejected || window.univerAPI !== window.originalAPI)
          throw new Error('Invalid checkpoint disposed the owner')
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        const pending = window.createDemo(window.container)
        pending.dispose()
        pending.dispose()
        await pending.ready
        if (window.univerAPI || document.querySelector('.harbor-page-setup')) throw new Error('Pre-ready owner leaked')
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
      pack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs/preset-docs-core/locales/zh-CN')).default,
      )
      await capture('initial-zh')
      const source = (await readShowcaseSources()).find((s) => s.slug === report.slug)
      assert.equal(Object.keys(source.files).length, 9)
      assert(source.files['/src/create-demo.ts'].includes('@univerjs/preset-docs-core/lib/index.css'))
      assert(source.files['/src/create-demo.ts'].includes('locales/zh-CN'))
      assert(source.files['/README.md'].includes(examples[11].trim()))
    },
    true,
  )
  report.passed =
    Object.values(report.gates).every((g) => g.passed) && !report.errors.length && !report.backendRequests.length
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        ...report,
        checks: report.checks.length,
        differences: report.differences.map((d) => ({ name: d.name, count: d.differences.length })),
      },
      null,
      2,
    ),
  )
  await browser.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
