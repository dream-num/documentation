/* eslint-disable no-await-in-loop -- Native owners, literal source builds and teardown are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { ITEMS } from '../showcase/embed/multiple-isolated-instances/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/isolated-native-complete')
await fs.mkdir(output, { recursive: true })
const project = process.env.SHOWCASE_EXPORT_DIRECTORY
  ? path.resolve(process.env.SHOWCASE_EXPORT_DIRECTORY)
  : await fs.mkdtemp(path.join(os.tmpdir(), 'univer-isolated-native-'))
const report = {
  passed: false,
  gates: {},
  errors: [],
  backendRequests: [],
  history: {},
  literals: [],
  dependencies: {},
}
let server, browser
const write = (name, value) => fs.writeFile(path.join(output, name), JSON.stringify(value, null, 2))
async function gate(name, action) {
  try {
    const result = await action()
    report.gates[name] = { passed: true, ...(result === undefined ? {} : { result }) }
  } catch (error) {
    report.gates[name] = { passed: false, error: error.stack || String(error) }
  }
  console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
}
function compareLeaves(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') compareLeaves(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
  }
}
try {
  const source = (await readShowcaseSources()).find((item) => item.slug === 'embed/multiple-isolated-instances')
  report.export = { slug: source.slug, directory: project }
  report.sourceFiles = Object.keys(source.files).length
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(project, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  const pkg = JSON.parse(source.files['/package.json'])
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies }
  // React DOM is an existing exact-version harness-only dependency for the actual Preview.
  for (const name of ['react', 'react-dom'])
    dependencies[name] = JSON.parse(await fs.readFile(`node_modules/${name}/package.json`, 'utf8')).version
  for (const [name, version] of Object.entries(dependencies)) {
    const installed = await fs.realpath(
      name === 'vite'
        ? process.env.SHOWCASE_VITE_DIR || path.resolve('node_modules/vite')
        : path.resolve('node_modules', name),
    )
    assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version)
    const link = path.join(project, 'node_modules', name)
    await fs.mkdir(path.dirname(link), { recursive: true })
    if (!(await fs.lstat(link).catch(() => null))) await fs.symlink(installed, link, 'junction')
    report.dependencies[name] = version
  }
  await write('exports.json', [report.export])
  const vite = await import(pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js')))
  const readme = await fs.readFile('showcase/embed/multiple-isolated-instances/code/README.md', 'utf8')
  const recipes = [...readme.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
  assert.equal(recipes.length, 5)
  await vite.build({ root: project, configFile: false, logLevel: 'warn' })
  const dirs = { default: path.join(project, 'dist') }
  for (const [variant, n] of [
    ['empty', 3],
    ['boundary', 4],
  ]) {
    const original = source.files['/src/create-demo.ts']
    assert.ok(original.includes('const child = createRegion(container, region)'))
    await fs.writeFile(
      path.join(project, 'src/create-demo.ts'),
      original.replace('const child = createRegion(container, region)', recipes[n - 1].trim()),
    )
    dirs[variant] = path.join(output, `${variant}-dist`)
    await vite.build({
      root: project,
      configFile: false,
      logLevel: 'warn',
      build: { outDir: dirs[variant], emptyOutDir: false },
    })
    await fs.writeFile(path.join(project, 'src/create-demo.ts'), original)
    report.literals.push({ number: n, kind: 'exact source replacement and independent selected build' })
  }
  async function closeServer() {
    if (!server) return
    if (server.close) await server.close()
    else await new Promise((resolve) => server.httpServer.close(resolve))
    server = undefined
  }
  async function serve(variant = 'default') {
    await closeServer()
    server = await vite.preview({
      root: project,
      configFile: false,
      build: { outDir: dirs[variant] },
      preview: { host: '127.0.0.1', port: 4412, strictPort: true },
    })
  }
  await serve()
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } })
  page.setDefaultTimeout(15000)
  page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
  })
  page.on('request', (request) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
      (['fetch', 'xhr'].includes(request.resourceType()) &&
        !['127.0.0.1', 'localhost'].includes(new URL(request.url()).hostname))
    )
      report.backendRequests.push(request.url())
  })
  await page.addInitScript(() => {
    window.nativePaint = []
    const original = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (value, ...args) {
      if (window.nativePaint.length < 100000) window.nativePaint.push(String(value))
      return original.call(this, value, ...args)
    }
  })
  let frames = {}
  async function ready() {
    for (const side of ['north', 'south']) {
      const iframe = page.locator(`iframe[data-region="${side}"]`)
      await iframe.waitFor()
      frames[side] = await (await iframe.elementHandle()).contentFrame()
      await frames[side].locator('.isolated-region[data-ready=true][data-mounted=true]').waitFor({ timeout: 60000 })
      await frames[side].evaluate(() => window.regionalDemo.ready)
      await frames[side].locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
      await frames[side].waitForFunction(
        () =>
          !document.querySelector('[data-u-comp="workbench-skeleton-content"]') &&
          [...document.querySelectorAll('canvas')].some((canvas) => canvas.width > 250 && canvas.height > 250),
      )
      await frames[side].waitForFunction(() => window.nativePaint.join('').includes('Regional total'))
      assert.equal(await frames[side].locator('[role="alert"]').textContent(), '')
    }
  }
  const snapshot = (side) => frames[side].evaluate(() => window.regionalDemo.univerAPI.getActiveWorkbook().save())
  const calc = (side) =>
    frames[side].evaluate(() => window.regionalDemo.univerAPI.getFormula().onCalculationResultApplied(10000))
  const value = (side, cell) =>
    frames[side].evaluate(
      (address) => window.regionalDemo.univerAPI.getActiveWorkbook().getActiveSheet().getRange(address).getRawValue(),
      cell,
    )
  const recipe = (side, n, code = recipes[n - 1]) =>
    frames[side].evaluate(
      async (sourceCode) => await new (Object.getPrototypeOf(async function () {}).constructor)(sourceCode)(),
      code,
    )
  async function capture(name) {
    await page.screenshot({ path: path.join(output, `${name}.png`) })
    await write(`${name}.json`, {
      north: await snapshot('north').catch(() => null),
      south: await snapshot('south').catch(() => null),
    })
  }
  async function typeCell(side, text, x = 366, y = 111) {
    await frames[side]
      .locator('[data-u-comp="render-canvas"]:not(#univer-doc-main-canvas):visible')
      .first()
      .dblclick({ position: { x, y } })
    await page.keyboard.press('Control+A')
    await page.keyboard.insertText(text)
    await page.keyboard.press('Enter')
    await calc(side)
  }
  await page.goto('http://127.0.0.1:4412')
  await ready()
  const original = { north: await snapshot('north'), south: await snapshot('south') }
  await gate('original-data-native-formulas-paint-and-independent-css', async () => {
    for (const [name, content] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(project, name.slice(1)), 'utf8'), content, name)
    const surfaces = {}
    for (const side of ['north', 'south']) {
      assert.equal(original[side].id, `regional-budget-${side}`)
      assert.equal(original[side].locale, 'enUS')
      for (const [i, row] of ITEMS[side].entries()) {
        for (const [col, expected] of row.entries())
          assert.equal(original[side].sheets.budget.cellData[i + 3][col].v, expected)
        assert.ok(Math.abs((await value(side, `D${i + 4}`)) - row[1] * row[2]) < 1e-7)
      }
      assert.ok(
        Math.abs((await value(side, 'D14')) - ITEMS[side].reduce((sum, row) => sum + row[1] * row[2], 0)) < 1e-7,
      )
      assert.equal(await frames[side].locator('.region-controls button').count(), 3)
      assert.equal(
        await frames[side]
          .locator('.region-controls input,.region-controls select,.region-controls details,.region-controls pre')
          .count(),
        0,
      )
      const style = await frames[side].locator('[data-u-comp="workbench-layout"]').evaluate((node) => ({
        background: getComputedStyle(node).backgroundColor,
        flex: getComputedStyle(node.querySelector('.univer-flex')).display,
        sdkWhite: getComputedStyle(node).getPropertyValue('--univer-gray-0').trim(),
        width: node.getBoundingClientRect().width,
        height: node.getBoundingClientRect().height,
        startupOverlayAbsent: !document.querySelector('[data-u-comp="workbench-skeleton-content"]'),
        textDraws: window.nativePaint.length,
      }))
      assert.equal(style.flex, 'flex')
      assert.ok(
        style.sdkWhite && style.width > 500 && style.height >= 600 && style.startupOverlayAbsent && style.textDraws > 0,
      )
      surfaces[side] = style
      if (side === 'north') assert.equal(style.background, 'rgb(255, 255, 255)')
      else assert.notEqual(style.background, 'rgb(255, 255, 255)')
      await frames[side].waitForFunction((item) => window.nativePaint.join('').includes(item), ITEMS[side][0][0])
    }
    await capture('normal-production-cover')
    const parity = {
      passed: true,
      sourceFiles: report.sourceFiles,
      surfaces,
      manifest: report.export,
      note: 'Normal independent export, exact ten-file readback and real iframe-local native UI. Generic single-root UI locator is not applicable to the zero-owner parent.',
    }
    await write('export-parity.json', parity)
    return parity
  })
  await gate('literal-1-price-formula-and-full-other-model', async () => {
    await recipe('north', 1)
    report.literals.push({ number: 1, kind: 'live original literal' })
    assert.equal(await value('north', 'C4'), 21.5)
    const initialTotal = ITEMS.north.reduce((sum, row) => sum + row[1] * row[2], 0)
    assert.ok(Math.abs((await value('north', 'D14')) - initialTotal - 33) < 1e-7)
    await frames.north.waitForFunction(() => window.nativePaint.join('').includes('21.50'))
    assert.deepEqual(await snapshot('south'), original.south)
    await capture('literal-price-painted')
  })
  await gate('guard-invalid-price-and-missing-row-before-any-write', async () => {
    const before = await snapshot('north')
    for (const invalid of ['-1', '100001', 'NaN'])
      await assert.rejects(
        recipe('north', 1, recipes[0].replace('const price = 21.5', `const price = ${invalid}`)),
        /Price must be/,
      )
    assert.deepEqual(await snapshot('north'), before)
    assert.deepEqual(await snapshot('south'), original.south)
  })
  await gate('literal-2-complete-saved-checkpoint', async () => {
    await recipe('north', 2)
    report.literals.push({ number: 2, kind: 'live original literal' })
    assert.deepEqual(await frames.north.evaluate(() => window.regionalSaved), await snapshot('north'))
  })
  await frames.north.getByRole('button', { name: 'Release', exact: true }).click()
  await frames.north.waitForFunction(() => document.querySelector('.isolated-region')?.dataset.mounted === 'false')
  await gate('release-one-native-edit-other-with-original-content', async () => {
    assert.equal(await frames.north.locator('canvas').count(), 0)
    assert.deepEqual(await snapshot('south'), original.south)
    await typeCell('south', '40')
    assert.equal(await value('south', 'C4'), 40)
  })
  const history = { before: original.south, after: await snapshot('south') }
  await page.keyboard.press('Control+z')
  await calc('south')
  history.undo = await snapshot('south')
  await gate('strict-native-undo-full-raw-model', () => assert.deepEqual(history.undo, history.before))
  await page.keyboard.press('Control+y')
  await calc('south')
  history.redo = await snapshot('south')
  report.history.nativeSouth = history
  await gate('strict-native-redo-full-raw-model', () => assert.deepEqual(history.redo, history.after))
  await frames.north.getByRole('button', { name: 'Mount', exact: true }).click()
  await ready()
  await gate('selective-default-remount-full-other-owner', async () => {
    assert.deepEqual(await snapshot('north'), original.north)
    assert.deepEqual(await snapshot('south'), history.redo)
  })
  await gate('literal-5-same-id-owner-restore-exact-model', async () => {
    await frames.north.evaluate(() => {
      window.previousAPI = window.regionalDemo.univerAPI
      window.previousCanvas = document.querySelector('canvas')
    })
    await recipe('north', 5)
    report.literals.push({ number: 5, kind: 'live original literal' })
    await ready()
    assert.deepEqual(await snapshot('north'), await frames.north.evaluate(() => window.regionalSaved))
    assert.deepEqual(await snapshot('south'), history.redo)
    assert.ok(
      await frames.north.evaluate(
        () => window.previousAPI !== window.regionalDemo.univerAPI && !window.previousCanvas.isConnected,
      ),
    )
  })
  const savedHistory = { before: await snapshot('north') }
  await typeCell('north', '24.75')
  savedHistory.after = await snapshot('north')
  await gate('restored-owner-fresh-native-edit-and-other-model', async () => {
    assert.equal(await value('north', 'C4'), 24.75)
    assert.deepEqual(await snapshot('south'), history.redo)
  })
  await page.keyboard.press('Control+z')
  await calc('north')
  savedHistory.undo = await snapshot('north')
  await gate('restored-owner-full-native-undo', () => assert.deepEqual(savedHistory.undo, savedHistory.before))
  await page.keyboard.press('Control+y')
  await calc('north')
  savedHistory.redo = await snapshot('north')
  await gate('restored-owner-full-native-redo', () => assert.deepEqual(savedHistory.redo, savedHistory.after))
  report.history.restoredNorth = savedHistory
  await gate('invalid-saved-identity-dimensions-before-owner-change', async () => {
    const before = await snapshot('north')
    for (const kind of ['id', 'sheet', 'dimension', 'missing']) {
      await assert.rejects(
        frames.north.evaluate(async (type) => {
          const controller = window.regionalDemo,
            api = controller.univerAPI
          const saved = structuredClone(api.getActiveWorkbook().save())
          if (type === 'id') saved.id = 'regional-budget-south'
          if (type === 'sheet') saved.sheets.budget.id = 'other'
          if (type === 'dimension') saved.sheets.budget.rowCount = 0
          if (type === 'missing') saved.sheetOrder = []
          try {
            await controller.restore(saved)
          } catch (error) {
            if (controller.univerAPI !== api) throw new Error('Owner changed before rejection', { cause: error })
            throw error
          }
        }, kind),
        /Restore a complete/,
      )
    }
    assert.deepEqual(await snapshot('north'), before)
    assert.deepEqual(await snapshot('south'), history.redo)
  })
  await gate('both-real-json-downloads-match-full-models', async () => {
    for (const side of ['north', 'south']) {
      const before = await snapshot(side)
      const pending = page.waitForEvent('download')
      await frames[side].getByRole('button', { name: 'Download JSON', exact: true }).click()
      const download = await pending
      assert.equal(download.suggestedFilename(), `${side}-maintenance.json`)
      assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), before)
      assert.deepEqual(await snapshot(side), before)
    }
  })
  await gate('same-owner-independent-theme-and-English-full-models', async () => {
    const before = { north: await snapshot('north'), south: await snapshot('south') }
    await frames.north.evaluate(() => {
      window.themeAPI = window.regionalDemo.univerAPI
      window.themeAPI.toggleDarkMode(true)
    })
    await frames.north.getByText('Start', { exact: true }).first().waitFor()
    await frames.south.getByText('Start', { exact: true }).first().waitFor()
    assert.ok(await frames.south.evaluate(() => document.documentElement.classList.contains('univer-dark')))
    await frames.north.evaluate(() => window.regionalDemo.univerAPI.toggleDarkMode(false))
    for (const side of ['north', 'south'])
      assert.equal(await frames[side].evaluate(() => window.regionalDemo.univerAPI.getCurrentLocale()), 'enUS')
    assert.ok(await frames.north.evaluate(() => window.themeAPI === window.regionalDemo.univerAPI))
    assert.deepEqual(await snapshot('north'), before.north)
    assert.deepEqual(await snapshot('south'), before.south)
  })
  for (const width of [760, 390, 320]) {
    await gate(`narrow-${width}-stacked-host-and-real-native-edit`, async () => {
      await page.setViewportSize({ width, height: 1100 })
      const rects = await page
        .locator('iframe[data-region]')
        .evaluateAll((nodes) =>
          nodes.map((node) => ({ top: node.getBoundingClientRect().top, left: node.getBoundingClientRect().left })),
        )
      assert.equal(rects[0].left, rects[1].left)
      assert.ok(rects[1].top > rects[0].top)
      assert.ok(
        await frames.north.locator('.region-controls').evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      )
      const other = await snapshot('south')
      await typeCell('north', `Air filters ${width}`, 130)
      assert.equal(await value('north', 'A4'), `Air filters ${width}`)
      assert.deepEqual(await snapshot('south'), other)
      await capture(`narrow-${width}`)
    })
  }
  await page.setViewportSize({ width: 1920, height: 1000 })
  for (const locale of ['en-US', 'zh-CN']) {
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue()
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/lang="[^"]*"/, `lang="${locale}"`) })
    })
    await page.reload()
    await ready()
    await gate(`initial-${locale}-both-full-core-packs-and-host-labels`, async () => {
      const expected = (await import('@univerjs/preset-sheets-core/locales/en-US')).default
      for (const side of ['north', 'south']) {
        compareLeaves(await frames[side].evaluate(() => window.regionalDemo.univerAPI.getLocales()), expected)
        assert.equal(await frames[side].evaluate(() => document.documentElement.lang), locale)
        assert.equal(await frames[side].evaluate(() => window.regionalDemo.univerAPI.getCurrentLocale()), 'enUS')
        await frames[side].getByText('Start', { exact: true }).first().waitFor()
        await frames[side].getByRole('button', { name: 'Release', exact: true }).waitFor()
      }
      await capture(`initial-${locale}`)
    })
    await page.unrouteAll({ behavior: 'wait' })
  }
  await gate('active-child-idempotent-disposal-and-real-pagehide', async () => {
    await frames.south.evaluate(async () => {
      const controller = window.regionalDemo,
        first = controller.dispose()
      if (first !== controller.dispose()) throw new Error('Disposal promise identity changed')
      await first
      if (controller.univerAPI || document.querySelector('canvas,.isolated-region')) throw new Error('Owner remains')
    })
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    await page.waitForFunction(() => document.querySelectorAll('iframe').length === 0)
  })
  for (const variant of ['empty', 'boundary']) {
    await serve(variant)
    await page.goto('http://127.0.0.1:4412')
    await ready()
    await gate(`literal-${variant}-compiled-source-both-real-formulas-and-paint`, async () => {
      for (const side of ['north', 'south']) {
        if (variant === 'empty') {
          assert.equal(await value(side, 'D14'), 0)
          assert.equal(await value(side, 'A4'), undefined)
        } else {
          assert.equal(await value(side, 'C4'), 0)
          assert.equal(await value(side, 'C5'), 100000)
          assert.equal(await value(side, 'D5'), ITEMS[side][1][1] * 100000)
          const model = await snapshot(side)
          for (let i = 2; i < 6; i++)
            for (const [col, expected] of ITEMS[side][i].entries())
              assert.equal(model.sheets.budget.cellData[i + 3][col].v, expected)
        }
      }
      await capture(`source-${variant}`)
    })
    if (variant === 'empty') {
      await gate('empty-source-missing-target-guard-full-model-preserved', async () => {
        const before = await snapshot('north')
        await assert.rejects(recipe('north', 1), /Expected air-filter row/)
        assert.deepEqual(await snapshot('north'), before)
      })
      await gate('empty-saved-recovery-and-fresh-native-edit', async () => {
        const before = await snapshot('north'),
          other = await snapshot('south')
        await frames.north.evaluate(async (saved) => window.regionalDemo.restore(saved), before)
        assert.deepEqual(await snapshot('north'), before)
        await typeCell('north', 'First new item', 130)
        assert.equal(await value('north', 'A4'), 'First new item')
        await frames.north.evaluate(async (saved) => window.regionalDemo.restore(saved), before)
        assert.deepEqual(await snapshot('north'), before)
        assert.deepEqual(await snapshot('south'), other)
      })
    }
  }
  await closeServer()

  // Development React intentionally exercises StrictMode's double effect setup.
  // The probe observes actual Univer owner disposal; it never changes its result.
  const actualPreview = await fs.readFile('showcase/embed/multiple-isolated-instances/preview/main.tsx', 'utf8')
  await fs.mkdir(path.join(project, 'preview'), { recursive: true })
  await fs.writeFile(path.join(project, 'preview/main.tsx'), actualPreview)
  report.preview = {
    exactSource: 'showcase/embed/multiple-isolated-instances/preview/main.tsx',
    mode: 'development React StrictMode, real native SDK owners',
  }
  server = await vite.createServer({
    root: project,
    configFile: false,
    cacheDir: path.join(output, '.vite'),
    appType: 'custom',
    server: { host: '127.0.0.1', port: 4412, strictPort: true },
    oxc: { jsx: { runtime: 'automatic' } },
    optimizeDeps: {
      noDiscovery: true,
      include: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client',
        'react-dom',
        '@univerjs/core',
        '@univerjs/presets',
        '@univerjs/preset-sheets-core',
        '@univerjs/preset-sheets-core/locales/en-US',
        '@univerjs/sheets/facade',
        '@univerjs/engine-formula/facade',
      ],
    },
    plugins: [
      {
        name: 'actual-isolated-preview',
        configureServer(dev) {
          dev.middlewares.use((request, response, next) => {
            if (new URL(request.url, 'http://127.0.0.1:4412').pathname !== '/') return next()
            response.setHeader('Content-Type', 'text/html')
            response.end(
              '<html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="test-root"></div><script type="module" src="/isolated-probe.jsx"></script></body></html>',
            )
          })
        },
        resolveId(id) {
          if (id === '/isolated-probe.jsx') return '\0isolated-probe.jsx'
          if (id === '../code/create-demo') return path.join(project, 'src/create-demo.ts')
        },
        load(id) {
          if (id !== '\0isolated-probe.jsx') return
          return `import React,{StrictMode,useState} from 'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';import{Univer}from'@univerjs/core';
const stats=[],seen=new WeakSet(),register=Univer.prototype.registerPlugin;
Univer.prototype.registerPlugin=function(...args){if(!seen.has(this)){seen.add(this);const record={disposed:false};stats.push(record);this.onDispose(()=>record.disposed=true);queueMicrotask(()=>{const parent=window.parent.probe;if(parent?.stopOnStartup){parent.stopOnStartup=false;parent.retained=[stats];parent.pendingReady=document.querySelector('.isolated-region')?.dataset.ready;parent.unmount();}});}return register.apply(this,args)};
window.probe={stats,retained:[]};
const {default:Preview}=await import('/preview/main.tsx');
window.probe.createRegion=(await import('/src/region.ts')).createRegion;
window.probe.createDemo=(await import('/src/create-demo.ts')).createDemo;
const style=document.createElement('style');style.textContent='.h-full{height:100%}.min-h-0{min-height:0}';document.head.append(style);
function Host(){const[mounted,setMounted]=useState(true);window.probe.unmount=()=>flushSync(()=>setMounted(false));window.probe.mount=()=>flushSync(()=>setMounted(true));return React.createElement('div',{id:'preview',style:{height:'950px'}},mounted&&React.createElement(Preview));}
createRoot(document.getElementById('test-root')).render(React.createElement(StrictMode,null,React.createElement(Host)));`
        },
      },
    ],
  })
  await server.listen()
  await page.goto('http://127.0.0.1:4412', { waitUntil: 'domcontentloaded', timeout: 180000 })
  await ready()
  async function ownershipReady() {
    await ready()
    assert.equal(await page.evaluate(() => window.probe.stats.length), 0)
    for (const side of ['north', 'south'])
      assert.deepEqual(await frames[side].evaluate(() => window.probe.stats), [{ disposed: false }])
  }
  await gate('actual-preview-strictmode-one-owner-per-child-no-parent-owner', async () => {
    await ownershipReady()
    await capture('strictmode-preview')
  })
  for (const pending of ['none', 'native-write', 'release', 'mount']) {
    await gate(`actual-preview-unmount-during-${pending}-all-owners-disposed`, async () => {
      if (pending === 'mount') {
        await frames.north.getByRole('button', { name: 'Release', exact: true }).click()
        await frames.north.waitForFunction(
          () => document.querySelector('.isolated-region')?.dataset.mounted === 'false',
        )
      }
      const result = await page.evaluate((action) => {
        const children = [...document.querySelectorAll('#preview iframe')].map((frame) => frame.contentWindow)
        window.probe.retained = children.map((child) => child.probe.stats)
        const child = children[0]
        if (action === 'native-write')
          child.regionalDemo.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').setValue(41.25)
        if (action === 'release' || action === 'mount')
          child.document.querySelector(`[data-action="${action === 'release' ? 'dispose' : 'mount'}"]`).click()
        const pendingReady = child.document.querySelector('.isolated-region').dataset.ready
        window.probe.unmount()
        return { pendingReady }
      }, pending)
      if (pending === 'release' || pending === 'mount') assert.equal(result.pendingReady, 'false')
      await page.waitForFunction(() => window.probe.retained.every((owners) => owners.every((owner) => owner.disposed)))
      assert.equal(await page.locator('#preview iframe').count(), 0)
      return { ...result, owners: await page.evaluate(() => window.probe.retained) }
    })
    await page.evaluate(() => window.probe.mount())
    await ownershipReady()
  }
  await gate('initial-factory-guards-invalid-region-variant-and-saved-input', async () => {
    const before = await snapshot('north')
    const result = await frames.north.evaluate(() => {
      const container = document.createElement('div'),
        saved = window.regionalDemo.univerAPI.getActiveWorkbook().save()
      let rejected = 0
      for (const args of [
        [container, 'east'],
        [container, 'north', 'unknown'],
        [container, 'north', 'default', { ...saved, id: 'regional-budget-south' }],
      ]) {
        try {
          window.probe.createRegion(...args)
        } catch {
          rejected++
        }
      }
      return { rejected, descendants: container.childElementCount }
    })
    assert.deepEqual(result, { rejected: 3, descendants: 0 })
    assert.deepEqual(await snapshot('north'), before)
  })
  await gate('invalid-parent-query-rejected-without-owner-or-dom-mutation', async () => {
    const result = await page.evaluate(() => {
      const before = location.href,
        container = document.createElement('div')
      let message = ''
      history.replaceState(null, '', '?isolatedRegion=unknown')
      try {
        window.probe.createDemo(container)
      } catch (error) {
        message = error.message
      }
      history.replaceState(null, '', before)
      return { message, count: container.childElementCount, owners: window.probe.stats.length }
    })
    assert.deepEqual(result, { message: 'Unknown isolated region', count: 0, owners: 0 })
  })
  await gate('initial-fourth-saved-argument-complete-recovery-and-fresh-edit', async () => {
    const saved = await snapshot('north'),
      other = await snapshot('south')
    await frames.north.evaluate(async (checkpoint) => {
      const container = document.querySelector('.isolated-region').parentElement
      const previous = window.regionalDemo
      await previous.dispose()
      window.regionalDemo = window.probe.createRegion(container, 'north', 'default', checkpoint)
      await window.regionalDemo.ready
    }, saved)
    assert.deepEqual(await snapshot('north'), saved)
    await typeCell('north', '25.25')
    assert.equal(await value('north', 'C4'), 25.25)
    assert.deepEqual(await snapshot('south'), other)
  })
  await gate('actual-preview-parent-removal-during-initial-startup', async () => {
    await page.evaluate(() => {
      window.probe.unmount()
      window.probe.stopOnStartup = true
      window.probe.mount()
    })
    await page.waitForFunction(
      () =>
        window.probe.pendingReady === 'false' &&
        window.probe.retained.every((owners) => owners.every((owner) => owner.disposed)),
    )
    assert.equal(await page.locator('#preview iframe').count(), 0)
    return await page.evaluate(() => ({ pendingReady: window.probe.pendingReady, owners: window.probe.retained }))
  })
  await gate('all-five-literal-recipes-built-or-executed', () =>
    assert.deepEqual([...new Set(report.literals.map((item) => item.number))].toSorted(), [1, 2, 3, 4, 5]),
  )
  await gate('no-runtime-errors-or-backend-requests', () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
  })
} catch (error) {
  report.fatal = error.stack || String(error)
} finally {
  await browser?.close()
  if (server?.close) await server.close()
  else if (server) await new Promise((resolve) => server.httpServer.close(resolve))
  report.passed = !report.fatal && Object.values(report.gates).every((item) => item.passed)
  await write('report.json', report)
  console.log(
    JSON.stringify(
      {
        output,
        passed: report.passed,
        gates: Object.fromEntries(Object.entries(report.gates).map(([key, result]) => [key, result.passed])),
        fatal: report.fatal,
      },
      null,
      2,
    ),
  )
}
if (!report.passed) process.exitCode = 1
