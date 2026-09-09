/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/annual-report-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/docs-traditional/corporate-annual-report/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 3)
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(restores.length, 1)
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4416'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/docs-traditional/corporate-annual-report`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-annual-report-native-')))
  const source = (await readShowcaseSources()).find(
    (entry) => entry.slug === 'docs-traditional/corporate-annual-report',
  )
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
        name: 'annual-report-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createAnnualReportDemo,validateSnapshot} from '/src/create-demo.ts';import en from '@univerjs/preset-docs-core/locales/en-US';import zh from '@univerjs/preset-docs-core/locales/zh-CN';window.packs={en,zh};window.createAnnualReportDemo=createAnnualReportDemo;window.validateSnapshot=validateSnapshot;document.documentElement.lang=new URLSearchParams(location.search).get('lang')||'en-US';window.container=document.getElementById('app');window.demo=createAnnualReportDemo(window.container);
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4416, strictPort: true },
  })
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
page.setDefaultTimeout(12000)
const report = {
  slug: 'docs-traditional/corporate-annual-report',
  passed: false,
  sourceFiles: 10,
  literalCounts: { ts: examples.length, js: restores.length },
  gates: {},
  checks: [],
  differences: [],
  errors: [],
  backendRequests: [],
}
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) report.backendRequests.push(r.url())
})
await page.addInitScript(() => {
  window.paintedText = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    window.paintedText.push(String(text))
    return Reflect.apply(original, this, [text, ...args])
  }
})
const canvas = page.locator('#univer-doc-main-canvas')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getDocument('atlas-fy2027-report').save())))
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
async function ready() {
  await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
  await page.waitForFunction(
    () => {
      const c = document.getElementById('univer-doc-main-canvas')
      if (!c?.width || !c.height || document.querySelector('[data-u-comp=workbench-skeleton-content]')) return false
      const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let ink = 0
      for (let i = 0; i < data.length; i += 4)
        if (data[i + 3] > 200 && data[i] < 100 && data[i + 1] < 100 && data[i + 2] < 100) ink++
      const label = window.univerAPI.getLocales()['docs-ui'].statistics.open
      const button = [...document.querySelectorAll('[aria-label]')].find((n) => n.getAttribute('aria-label') === label)
      return (
        ink > 2000 && button && /[1-9]\d*/.test(button.textContent) && !button.querySelector('.univer-animate-spin')
      )
    },
    undefined,
    { timeout: 20000 },
  )
  await settle()
}
async function fresh() {
  await page.goto(url)
  await ready()
}
function diff(a, b, p = '$') {
  if (Object.is(a, b)) return []
  if (a && b && typeof a === 'object' && typeof b === 'object')
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((k) => diff(a[k], b[k], p + '.' + k))
  return [{ path: p, before: a === undefined ? { absent: true } : a, after: b === undefined ? { absent: true } : b }]
}
async function exact(name, before, after) {
  const differences = diff(before, after)
  await fs.writeFile(path.join(directory, name + '.json'), JSON.stringify({ before, after, differences }, null, 2))
  report.checks.push({ name, differences: differences.length })
  if (differences.length) report.differences.push({ name, differences })
}
async function gate(name, fn, standalone = false) {
  const count = report.differences.length
  try {
    if (standalone && !buildStandalone) throw Error('Requires standalone harness')
    await fn()
    report.gates[name] = { passed: report.differences.length === count }
  } catch (e) {
    report.gates[name] = { passed: false, error: e.stack || String(e) }
    await capture(name + '-failure').catch(() => {})
    await fs.writeFile(
      path.join(directory, name + '-dom.txt'),
      await page
        .locator('body')
        .innerText()
        .catch(() => ''),
    )
  }
  console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
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
        headerId: p.headerId,
        footerId: p.footerId,
        naturalOverflow: p.isNaturalPageOverflow,
      })),
      glyphs: doc.getParagraphs().map((p) => {
        const range = p.getRange(),
          glyph = skeleton.findNodeByCharIndex(range.startOffset)
        let owner = glyph
        while (owner && !pages.includes(owner)) owner = owner.parent
        return {
          text: p.getText(),
          font: glyph?.fontStyle,
          page: pages.indexOf(owner),
          lineHeight: glyph?.parent?.parent?.lineHeight,
        }
      }),
      scrollY: render.scene.getViewport('viewMain').viewportScrollY,
    }
  })
async function geometry(name, width, height) {
  await settle()
  const result = await layout()
  await fs.writeFile(path.join(directory, name + '-layout.json'), JSON.stringify(result, null, 2))
  assert(result.pages.length > 0)
  for (const p of result.pages) {
    assert.equal(p.width, width)
    assert.equal(p.height, height)
  }
  assert(result.glyphs.every((g) => !g.text || (g.page >= 0 && g.lineHeight > 0)))
  report.checks.push({ name, pages: result.pages.length, glyphs: result.glyphs.length })
  await capture(name)
  return result
}
async function nativeType(prefix, name) {
  await canvas.click({ position: { x: 650, y: 220 } })
  await page.evaluate(() => window.univerAPI.getActiveDocument().setSelection(0, 0))
  const before = await snapshot()
  await page.keyboard.type(prefix)
  await page.waitForFunction((p) => window.univerAPI.getActiveDocument().save().body.dataStream.startsWith(p), prefix)
  const edited = await snapshot()
  await capture(name)
  await page.keyboard.press('Control+z')
  await settle()
  await exact(name + '-undo', before, await snapshot())
  await page.keyboard.press('Control+y')
  await settle()
  await exact(name + '-redo', edited, await snapshot())
}
function pack(actual, expected, p = '') {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') pack(actual?.[key], value, p + '.' + key)
    else assert.deepEqual(actual?.[key], value, p + '.' + key)
  }
}
try {
  await gate('original-financial-facts-native-type-and-page-paint', async () => {
    await fresh()
    const original = await snapshot()
    await fs.writeFile(path.join(directory, 'original.json'), JSON.stringify(original, null, 2))
    for (const value of ['$37.4M', '$42.8M', '$45.0M', '18.6%', '$9.2M', 'Risk and outlook'])
      assert(original.body.dataStream.includes(value), value)
    for (const heading of [
      'Business model and customer journey',
      'Service reliability and delivery',
      'Capital allocation priorities',
      'Governance and review responsibilities',
      'Reporting basis and reading the figures',
    ])
      assert(original.body.dataStream.includes(heading), heading)
    assert(original.body.dataStream.includes('Fictional, unaudited SDK sample'))
    assert.equal(
      await page.locator('.annual-report').evaluate((root) => getComputedStyle(root).fontFamily),
      'Arial, sans-serif',
    )
    assert.equal(Object.keys(original.headers).length, 1)
    assert.equal(Object.keys(original.footers).length, 1)
    assert(Object.values(original.headers)[0].body.dataStream.includes('ATLAS SYSTEMS · ANNUAL REPORT 2027'))
    assert(Object.values(original.footers)[0].body.dataStream.includes('PUBLIC SAMPLE · LOCAL FIXTURE'))
    assert.equal(
      await page.locator('.annual-report > button,.annual-report > aside,.annual-report > header').count(),
      0,
    )
    const current = await geometry('cover', 794, 1123)
    assert(current.pages.length >= 2, 'The full annual narrative spans real A4 pages')
    for (const g of current.glyphs.filter((glyph) =>
      /^(FY202[567] Revenue · \$[\d.]+M$|Operating margin)/.test(glyph.text),
    )) {
      assert.equal(g.font.fontFamily, 'Georgia')
      assert.equal(g.font.fontSize, 10.5)
    }
    await canvas.hover()
    await page.mouse.wheel(0, 900)
    await settle()
    assert((await layout()).scrollY > current.scrollY)
    await capture('original-footer')
    const text = await page.evaluate(() => window.paintedText.join(''))
    await fs.writeFile(path.join(directory, 'painted-text.txt'), text)
    assert(text.includes('ATLAS SYSTEMS · ANNUAL REPORT 2027'), 'Actual header paint')
    assert(text.includes('PUBLIC SAMPLE · LOCAL FIXTURE'), 'Actual footer paint')
  })
  await gate('two-literal-recipes-repeat-save-and-guard', async () => {
    await fresh()
    const original = await snapshot()
    await run(examples[0])
    await ready()
    const revised = await snapshot()
    assert.equal(revised.body.dataStream.match(/\$46\.5M/g)?.length, 2)
    assert(!revised.body.dataStream.includes('$45.0M'))
    for (const value of ['$37.4M', '$42.8M', '18.6%', '$9.2M']) assert(revised.body.dataStream.includes(value))
    await run(examples[0])
    await exact('repeat-no-write', revised, await snapshot())
    await run(examples[1])
    await exact('save-no-write', revised, await snapshot())
    assert.deepEqual(revised.headers, original.headers)
    assert.deepEqual(revised.footers, original.footers)
    await capture('revised')
    await run(
      "univerAPI.getActiveDocument().getParagraphs().find(p=>p.getText()==='FY2027 Revenue · $46.5M').setText('FY2027 Revenue · pending review')",
    )
    const guarded = await snapshot()
    await assert.rejects(run(examples[0]), /Expected one original disclosure and headline/)
    await exact('unexpected-edit-guard-no-write', guarded, await snapshot())
    report.checks.push({ name: 'Two README literals executed verbatim, including repeat and guard' })
  })
  await gate('literal-two-mutation-complete-history', async () => {
    await fresh()
    const before = await snapshot()
    await run(examples[0])
    const after = await snapshot()
    await run('univerAPI.getActiveDocument().undo();univerAPI.getActiveDocument().undo()')
    await settle()
    await exact('revision-two-undo', before, await snapshot())
    await run('univerAPI.getActiveDocument().redo();univerAPI.getActiveDocument().redo()')
    await settle()
    await exact('revision-two-redo', after, await snapshot())
  })
  await gate('native-typing-complete-history', async () => {
    await fresh()
    await nativeType('Reviewed ', 'native-edited')
  })
  await gate('native-paper-margin-menu-and-complete-history', async () => {
    await fresh()
    const before = await snapshot()
    await page.locator('[data-u-command="docs.operation.open-page-setting"]').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByText('Paper size', { exact: true }).waitFor()
    await dialog.evaluate(async (n) => Promise.all(n.getAnimations({ subtree: true }).map((a) => a.finished)))
    await capture('native-page-dialog')
    await dialog.locator('[data-u-comp=select]').click()
    await page.getByRole('menuitemradio', { name: 'Letter', exact: true }).click()
    const inputs = dialog.locator('input')
    assert.equal(await inputs.count(), 4)
    for (const [index, value] of ['80', '85', '84', '84'].entries()) {
      await inputs.nth(index).fill(value)
      await inputs.nth(index).press('Tab')
    }
    await dialog.getByRole('button', { name: 'Confirm', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    await ready()
    await geometry('native-letter', 816, 1056)
    const after = await snapshot()
    for (const [key, value] of Object.entries({ marginTop: 80, marginBottom: 85, marginLeft: 84, marginRight: 84 }))
      assert.equal(after.documentStyle[key], value)
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    await exact('native-paper-undo', before, await snapshot())
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    await exact('native-paper-redo', after, await snapshot())
  })
  await gate('compact-pagination-recurring-segments', async () => {
    await fresh()
    await run(examples[2])
    await ready()
    const current = await geometry('compact-first-page', 560, 560)
    assert(current.pages.length >= 2)
    const saved = await snapshot()
    assert.equal(Object.keys(saved.headers).length, 1)
    assert.equal(Object.keys(saved.footers).length, 1)
    for (const p of current.pages) {
      assert.equal(p.headerId, Object.keys(saved.headers)[0])
      assert.equal(p.footerId, Object.keys(saved.footers)[0])
    }
    for (const heading of [
      'Letter to shareholders',
      'Business overview',
      'Financial performance',
      'Cash flows',
      'Risk and outlook',
      'Business model and customer journey',
      'Service reliability and delivery',
      'Capital allocation priorities',
      'Governance and review responsibilities',
      'Reporting basis and reading the figures',
    ]) {
      const index = current.glyphs.findIndex((g) => g.text === heading)
      assert.equal(current.glyphs[index].page, current.glyphs[index + 1].page, heading + ': keep with next paragraph')
    }
    for (let i = 1; i < current.pages.length; i++) {
      await canvas.hover()
      await page.mouse.wheel(0, 650)
      await settle()
      await capture('compact-page-' + (i + 1))
    }
    report.checks.push({ name: 'Genuine multi-page layout retaining header/footer IDs', pages: current.pages.length })
    report.checks.push({
      name: 'Third literal uses real section page setup; every heading stays with its following paragraph',
    })
  })
  await gate(
    'same-id-complete-owner-recovery-and-fresh-edit',
    async () => {
      await fresh()
      await run(examples[0])
      await run(examples[2])
      await ready()
      const before = await snapshot()
      await run(restores[0])
      await ready()
      await exact('saved-full-owner-reconstruction', before, await snapshot())
      await geometry('restored', 560, 560)
      await nativeType('Restored ', 'restored-native-edited')
    },
    true,
  )
  await gate(
    'complete-locales-official-css-theme-and-disposal',
    async () => {
      await fresh()
      await run(examples[0])
      const before = await snapshot()
      pack(await page.evaluate(() => window.univerAPI.getLocales()), await page.evaluate(() => window.packs.en))
      await run('window.oldOwner=univerAPI;univerAPI.toggleDarkMode(true)')
      assert(await page.evaluate(() => window.oldOwner === window.univerAPI && window.univerAPI.isDarkMode()))
      await exact('dark-same-owner', before, await snapshot())
      await run('univerAPI.toggleDarkMode(false)')
      await exact('light-same-owner', before, await snapshot())
      await page.evaluate(() => {
        const saved = window.univerAPI.getActiveDocument().save(),
          activeOwner = window.univerAPI
        for (const invalid of [
          { ...saved, id: 'wrong' },
          { ...saved, body: { dataStream: 'missing terminator' } },
          { ...saved, documentStyle: { pageSize: { width: 0, height: 720 } } },
        ]) {
          let rejected = false
          try {
            window.createAnnualReportDemo(window.container, false, undefined, invalid)
          } catch {
            rejected = true
          }
          if (!rejected || window.univerAPI !== activeOwner || document.querySelectorAll('.annual-report').length !== 1)
            throw Error('Invalid checkpoint changed active owner')
        }
        window.demo.dispose()
        window.demo.dispose()
        const pending = window.createAnnualReportDemo(window.container)
        pending.dispose()
        pending.dispose()
        if (window.univerAPI || document.querySelector('.annual-report')) throw Error('Pre-ready disposal leaked')
      })
      await settle()
      await page.goto(url + '?lang=zh-CN')
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
      pack(await page.evaluate(() => window.univerAPI.getLocales()), await page.evaluate(() => window.packs.zh))
      await capture('initial-zh')
      const source = (await readShowcaseSources()).find((s) => s.slug === report.slug)
      assert.equal(Object.keys(source.files).length, 10)
      assert(source.files['/src/create-demo.ts'].includes('@univerjs/preset-docs-core/lib/index.css'))
      assert(source.files['/reference/Preview.tsx'].includes('toggleDarkMode'))
      assert(!source.files['/reference/Preview.tsx'].includes('Reset'))
      await run('demo.dispose();demo.dispose()')
      await settle()
      assert.equal(await canvas.count(), 0)
      report.checks.push({
        name: 'Full EN/ZH preset packs, CSS, same-owner themes, invalid/pre-ready/idempotent disposal',
      })
    },
    true,
  )
  await gate(
    'normal-production-export-settled-paint-and-source-parity',
    async () => {
      await new Promise((resolve) => server.httpServer.close(resolve))
      server = undefined
      const [entry] = JSON.parse(await fs.readFile(path.join(directory, 'exports.json'), 'utf8'))
      const source = (await readShowcaseSources()).find((item) => item.slug === report.slug)
      for (const [name, content] of Object.entries(source.files))
        assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
      const { build, preview } = await import(
        pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js'))
      )
      await build({ root: entry.directory, configFile: false, logLevel: 'warn' })
      server = await preview({
        root: entry.directory,
        configFile: false,
        preview: { host: '127.0.0.1', port: 4416, strictPort: true },
      })
      await fresh()
      assert.equal(
        await page.evaluate(() => typeof window.demo),
        'undefined',
        'The normal entry has no injected test harness',
      )
      await geometry('normal-export-settled-cover', 794, 1123)
      await nativeType('Export ', 'normal-export-native-edited')
      report.checks.push({
        name: 'Normal production export: ten identical files, real settled native glyphs, genuine input and complete history',
      })
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
  if (server) await new Promise((r) => server.httpServer.close(r))
}
if (!report.passed) process.exitCode = 1
