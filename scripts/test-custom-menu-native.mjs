/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/custom-menu-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/sheets/custom-menu/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 6)
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(restores.length, 2)
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4416'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/sheets/custom-menu`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-custom-menu-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'sheets/custom-menu')
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
        name: 'custom-menu-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo,validateSnapshot} from '/src/create-demo.ts';import {MessageType} from '@univerjs/preset-sheets-core';import en from '@univerjs/preset-sheets-core/locales/en-US';window.MessageType=MessageType;window.packs={en};window.createDemo=createDemo;window.validateSnapshot=validateSnapshot;document.documentElement.lang=new URLSearchParams(location.search).get('lang')||'en-US';window.container=document.getElementById('app');window.demo=createDemo(window.container);
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
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
page.setDefaultTimeout(12000)
const report = {
  slug: 'sheets/custom-menu',
  passed: false,
  sourceFiles: 10,
  literals: { ts: examples.length, js: restores.length },
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
const root = page.locator('.custom-menu-demo')
const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]').first()
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('harbor-orders').save())))
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
const settle = () =>
  page.evaluate(async () => {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    )
  })
async function ready() {
  await canvas.waitFor()
  await page.waitForFunction(
    () => {
      const c = document.querySelector('canvas[id^="univer-sheet-main-canvas"]')
      if (!c?.width || !c.height || document.querySelector('[data-u-comp=workbench-skeleton-content]')) return false
      const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let ink = 0
      for (let i = 0; i < data.length; i += 4)
        if (data[i + 3] > 200 && data[i] < 100 && data[i + 1] < 100 && data[i + 2] < 100) ink++
      return (
        ink > 2000 &&
        window.paintedText.includes('PO-1042') &&
        window.univerAPI?.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Rendered
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
  if (!report.gates[name].passed && !report.gates[name].error)
    report.gates[name].error =
      'Strict full native model differences retained in the report and individual JSON evidence.'
  console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
}
function pack(actual, expected, p = '') {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') pack(actual?.[key], value, p + '.' + key)
    else assert.deepEqual(actual?.[key], value, p + '.' + key)
  }
}
async function select(address) {
  const box = root.locator('input.univer-size-full').first()
  await box.fill(address)
  await box.press('Enter')
  await settle()
  assert.equal(
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange()?.getA1Notation()),
    address,
  )
}
const values = (address) =>
  page.evaluate(
    (a) => window.univerAPI.getWorkbook('harbor-orders').getSheetBySheetId('orders').getRange(a).getRawValues(),
    address,
  )
const fills = (address) =>
  page.evaluate(
    (a) => window.univerAPI.getWorkbook('harbor-orders').getSheetBySheetId('orders').getRange(a).getBackgrounds(),
    address,
  )
async function clickRibbon(name) {
  await settle()
  const button = page.getByRole('button', { name, exact: true }).filter({ visible: true })
  if (!(await button.count())) {
    await root
      .locator('[data-u-comp="ribbon-toolbar"] button')
      .filter({ has: page.locator('svg.univerjs-icon-more-vertical-icon') })
      .click()
    await page.getByRole('button', { name, exact: true }).filter({ visible: true }).waitFor()
    await settle()
    await capture('classic-native-overflow')
  }
  await page.getByRole('button', { name, exact: true }).filter({ visible: true }).click()
  await settle()
}
async function contextAction(name) {
  await canvas.click({ button: 'right', position: { x: 90, y: 128 } })
  await page.getByText('Approval', { exact: true }).filter({ visible: true }).last().hover()
  const submenuItem = page.locator('[data-u-context-menu-submenu="true"]').getByRole('button', { name, exact: true })
  await submenuItem.waitFor()
  await settle()
  await capture('context-menu-open')
  await submenuItem.click()
  await settle()
}
async function history(name, before, after) {
  await root.locator('[data-u-command="univer.command.undo"]').filter({ visible: true }).click()
  await settle()
  await exact(name + '-undo', before, await snapshot())
  await root.locator('[data-u-command="univer.command.redo"]').filter({ visible: true }).click()
  await settle()
  await exact(name + '-redo', after, await snapshot())
}
async function typed(value, name) {
  await select('B4')
  const before = await snapshot()
  await page.keyboard.insertText(value)
  await page.keyboard.press('Enter')
  await settle()
  assert.equal((await values('B4'))[0][0], value)
  const after = await snapshot()
  await capture(name)
  await history(name, before, after)
}
try {
  await gate('native-grid-original-four-orders', async () => {
    await fresh()
    assert.equal(await root.locator('[data-u-comp=ribbon-grid-toolbar]').count(), 1)
    assert.equal(
      await root.locator(':scope > p,:scope > fieldset,:scope > details,:scope > button,:scope > select').count(),
      0,
    )
    assert.deepEqual((await values('E4:E7')).flat(), ['Pending', 'Needs changes', 'Pending', 'Approved'])
    assert.deepEqual((await values('C4:C7')).flat(), [12960, 3280, 7440, 1580])
    assert.equal(
      await root.locator('[data-u-comp=workbench-layout]').evaluate((n) => getComputedStyle(n).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await capture('cover')
    report.checks.push({ name: 'Original four orders, genuine Grid menu and settled native glyphs; no host panels' })
  })
  await gate('native-highlight-pixel-toggle-and-complete-history', async () => {
    await fresh()
    await select('A4:E4')
    const before = await snapshot()
    await clickRibbon('Review highlight')
    assert((await fills('A4:E4')).flat().every((c) => c.toUpperCase() === '#FFF3BF'))
    const changed = await snapshot()
    await select('A2')
    const pixel = await canvas.evaluate((c) => {
      const ratio = c.width / c.getBoundingClientRect().width
      return [...c.getContext('2d').getImageData(Math.round(166 * ratio), Math.round(112 * ratio), 1, 1).data]
    })
    assert.deepEqual(pixel, [255, 243, 191, 255])
    await capture('native-highlight')
    await history('highlight', before, changed)
    await select('A4:E4')
    await clickRibbon('Review highlight')
    assert((await fills('A4:E4')).flat().every((c) => c.toUpperCase() === '#FFFFFF'))
    report.checks.push({ name: 'Actual yellow canvas pixel and native toggle white' })
  })
  await gate('native-approval-focus-repeat-and-history', async () => {
    await fresh()
    await select('A4:E4')
    const before = await snapshot()
    const approve = page.getByRole('button', { name: 'Approved', exact: true })
    await approve.focus()
    await page.keyboard.press('Enter')
    await settle()
    assert.equal((await values('E4'))[0][0], 'Approved')
    const after = await snapshot()
    await clickRibbon('Approved')
    await exact('repeat-approval-no-write', after, await snapshot())
    await history('approval', before, after)
    report.checks.push({
      name: 'Keyboard-focus Enter executes native custom menu; repeated matching approval does not write',
    })
  })
  await gate('native-context-multiple-rows-and-history', async () => {
    await fresh()
    await select('A5:E6')
    const before = await snapshot()
    await contextAction('Needs changes')
    assert.deepEqual((await values('E5:E6')).flat(), ['Needs changes', 'Needs changes'])
    assert.equal((await values('E4'))[0][0], 'Pending')
    assert.equal((await values('E7'))[0][0], 'Approved')
    const after = await snapshot()
    await capture('native-context-changed')
    await history('context-approval', before, after)
  })
  await gate('native-invalid-empty-and-read-only-rejection', async () => {
    await fresh()
    for (const address of ['A3:E3', 'A8:E8', 'F4']) {
      await select(address)
      const before = await snapshot()
      await clickRibbon('Approved')
      await page.getByText('Select one contiguous range inside A4:E7.', { exact: true }).first().waitFor()
      await exact('guard-' + address.replace(':', '-'), before, await snapshot())
    }
    await select('A4:E4')
    await run(examples[3])
    const before = await snapshot()
    assert.equal(
      await page.evaluate(() => window.univerAPI.getWorkbook('harbor-orders').getWorkbookPermission().canEdit()),
      false,
    )
    await clickRibbon('Needs changes')
    await page.getByText('This workbook is read-only.', { exact: true }).waitFor()
    await exact('read-only-no-write', before, await snapshot())
    await run(examples[4])
    await clickRibbon('Approved')
    assert.equal((await values('E4'))[0][0], 'Approved')
    await capture('native-boundary-message')
    await run("const wb=univerAPI.getWorkbook('harbor-orders');wb.setActiveSheet(wb.insertSheet('Other sheet'))")
    const otherSheet = await snapshot()
    await clickRibbon('Approved')
    await page.getByText('Return to the Orders sheet.', { exact: true }).first().waitFor()
    await exact('other-sheet-no-write', otherSheet, await snapshot())
  })
  await gate('native-disabled-affordance', async () => {
    await fresh()
    await select('A3:E3')
    assert.equal(
      await page.getByRole('button', { name: 'Approved', exact: true }).isDisabled(),
      true,
      'Installed IFacadeMenuItem/FMenu has no disabled observable. The callback guard is real, but the native item remains enabled; this requirement stays open.',
    )
  })
  await gate('six-literal-facade-recipes', async () => {
    await fresh()
    await run(examples[0])
    await run(examples[1])
    await settle()
    await clickRibbon('Highlight example')
    assert((await fills('A4:E4')).flat().every((c) => c.toUpperCase() === '#FFF3BF'))
    await canvas.click({ button: 'right', position: { x: 90, y: 104 } })
    await page.getByText('Review example', { exact: true }).filter({ visible: true }).last().hover()
    await page
      .locator('[data-u-context-menu-submenu="true"]')
      .getByRole('button', { name: 'Highlight example', exact: true })
      .click()
    await settle()
    assert((await fills('A4:E4')).flat().every((c) => c.toUpperCase() === '#FFFFFF'))
    await run(examples[2])
    assert.deepEqual((await values('E5:E6')).flat(), ['Approved', 'Approved'])
    const before = await snapshot()
    await run(examples[2])
    await exact('literal-repeat-no-write', before, await snapshot())
    await run(examples[3])
    await run(examples[4])
    const saved = await snapshot()
    await run(examples[5])
    await exact('literal-save-no-write', saved, await snapshot())
    report.checks.push({ name: 'Six independent literal recipes, actual registered menu and nested context item' })
  })
  await gate('native-typing-complete-history', async () => {
    await fresh()
    await typed('Reviewed supplier 北区', 'native-edited')
  })
  for (const [index, layout] of ['grid', 'classic'].entries())
    await gate(
      'same-id-' + layout + '-restore-and-fresh-native-menu',
      async () => {
        await fresh()
        await select('A5:E6')
        await clickRibbon('Approved')
        const before = await snapshot()
        await run(restores[index])
        await ready()
        await exact(layout + '-owner-reconstruction', before, await snapshot())
        assert.equal(
          await page.evaluate(() =>
            window.univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange()?.getA1Notation(),
          ),
          'A5:E6',
        )
        assert.equal(await root.locator('[data-u-comp=ribbon-grid-toolbar]').count(), layout === 'grid' ? 1 : 0)
        assert.equal(await root.locator('[data-u-comp=ribbon-toolbar]').count(), layout === 'classic' ? 1 : 0)
        await select('A4:E4')
        await clickRibbon('Needs changes')
        assert.equal((await values('E4'))[0][0], 'Needs changes')
        await capture('restored-' + layout)
        await typed('Restored ' + layout, 'restored-' + layout + '-native-edited')
      },
      true,
    )
  await gate(
    'owner-menu-release-without-ghost-callbacks',
    async () => {
      await fresh()
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.getByRole('button', { name: 'Review highlight', exact: true }).evaluate((node) => {
          window.detachedMenuButton = node
        })
        await page.evaluate(() => {
          window.demo.dispose()
          if (window.detachedMenuButton.isConnected) throw Error('Disposed menu is still attached')
          window.demo = window.createDemo(window.container)
        })
        await ready()
        const before = await snapshot()
        await page.evaluate(() => window.detachedMenuButton.click())
        await settle()
        await exact('detached-menu-no-ghost-' + cycle, before, await snapshot())
        assert.equal(await page.getByRole('button', { name: 'Review highlight', exact: true }).count(), 1)
        await clickRibbon('Review highlight')
        assert((await fills('A4:E4')).flat().every((color) => color.toUpperCase() === '#FFF3BF'))
      }
      report.checks.push({
        name: 'Three owner-release cycles: detached real native buttons do not mutate the new owner; exactly one live callback remains',
      })
    },
    true,
  )
  await gate(
    'complete-locales-css-same-owner-theme-and-disposal',
    async () => {
      await fresh()
      await select('A4:E4')
      await clickRibbon('Approved')
      const before = await snapshot()
      pack(await page.evaluate(() => window.univerAPI.getLocales()), await page.evaluate(() => window.packs.en))
      await run('window.oldOwner=univerAPI;univerAPI.toggleDarkMode(true)')
      assert(await page.evaluate(() => window.oldOwner === window.univerAPI && window.univerAPI.isDarkMode()))
      await exact('dark-same-owner', before, await snapshot())
      await run('univerAPI.toggleDarkMode(false)')
      await exact('light-same-owner', before, await snapshot())
      await page.evaluate(() => {
        const saved = window.univerAPI.getWorkbook('harbor-orders').save(),
          activeOwner = window.univerAPI
        for (const invalid of [
          { ...saved, id: 'wrong' },
          { ...saved, sheetOrder: [] },
          { ...saved, sheets: {} },
        ]) {
          let rejected = false
          try {
            window.createDemo(window.container, false, undefined, invalid)
          } catch {
            rejected = true
          }
          if (
            !rejected ||
            window.univerAPI !== activeOwner ||
            document.querySelectorAll('.custom-menu-demo').length !== 1
          )
            throw Error('Invalid checkpoint changed owner')
        }
        window.demo.dispose()
        window.demo.dispose()
        const pending = window.createDemo(window.container)
        pending.dispose()
        pending.dispose()
        if (window.univerAPI || document.querySelector('.custom-menu-demo')) throw Error('Immediate disposal leaked')
      })
      await settle()
      await page.goto(url + '?lang=zh-CN')
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      pack(await page.evaluate(() => window.univerAPI.getLocales()), await page.evaluate(() => window.packs.en))
      await select('A4:E4')
      await clickRibbon('Approved')
      assert.equal((await values('E4'))[0][0], 'Approved')
      await capture('initial-zh')
      await run('demo.dispose();demo.dispose()')
      await settle()
      assert.equal(await canvas.count(), 0)
      report.checks.push({
        name: 'Complete English core and custom labels on both host languages, theme owner identity, invalid/pre-ready/idempotent disposal',
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
      assert.equal(Object.keys(source.files).length, 10)
      assert(source.files['/src/create-demo.ts'].includes('@univerjs/preset-sheets-core/lib/index.css'))
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
      assert.equal(await page.evaluate(() => typeof window.demo), 'undefined')
      await capture('normal-export-cover')
      await select('A4:E4')
      await clickRibbon('Approved')
      assert.equal((await values('E4'))[0][0], 'Approved')
      await typed('Production supplier', 'normal-export-native-edited')
      report.checks.push({
        name: 'Ten same-source files, normal entry without harness globals, settled ink, real native menu and typing',
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
