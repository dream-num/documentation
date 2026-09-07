/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/kestrel-lifecycle-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/embed/mount-dispose-remount/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 5)
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(restores.length, 4)
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4416'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/embed/mount-dispose-remount`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY ||
    (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-kestrel-lifecycle-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/mount-dispose-remount')
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
        name: 'kestrel-lifecycle-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo,validateSnapshot} from '/src/create-demo.ts';import {createInventory} from '/src/data.ts';import en from '@univerjs/preset-sheets-core/locales/en-US';import zh from '@univerjs/preset-sheets-core/locales/zh-CN';window.createInventory=createInventory;window.packs={en,zh};window.createDemo=createDemo;window.validateSnapshot=validateSnapshot;document.documentElement.lang=new URLSearchParams(location.search).get('lang')||'en-US';window.container=document.getElementById('app');window.demo=createDemo(window.container);
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
page.setDefaultTimeout(15000)
const report = {
  slug: 'embed/mount-dispose-remount',
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
const root = page.locator('.embed-lifecycle')
const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]').first()
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('kestrel-inventory').save())))
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
async function ready(needle = 'KT-101') {
  await page.waitForFunction(
    () =>
      document.querySelector('.embed-lifecycle')?.dataset.ready === 'true' &&
      document.querySelector('.embed-lifecycle')?.dataset.state === 'mounted',
    undefined,
    { timeout: 25000 },
  )
  await canvas.waitFor()
  await page.waitForFunction(
    (paintedNeedle) => {
      const c = document.querySelector('canvas[id^="univer-sheet-main-canvas"]')
      if (!c?.width || document.querySelector('[data-u-comp=workbench-skeleton-content]')) return false
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let ink = 0
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] < 100 && d[i + 1] < 100 && d[i + 2] < 100) ink++
      return paintedNeedle === null
        ? ink > 400 && window.paintedText.includes('1')
        : ink > 1500 && window.paintedText.includes(paintedNeedle)
    },
    needle,
    { timeout: 20000 },
  )
  await settle()
}
async function fresh() {
  await page.goto(url)
  await ready()
}
const values = (address) =>
  page.evaluate(
    (a) => window.univerAPI.getWorkbook('kestrel-inventory').getSheetBySheetId('stock').getRange(a).getRawValues(),
    address,
  )
async function select(address) {
  const box = root.locator('input.univer-size-full').first()
  await box.fill(address)
  await box.press('Enter')
  await settle()
}
async function type(value, address = 'D4') {
  await select(address)
  await page.keyboard.insertText(value)
  await page.keyboard.press('Enter')
  await settle()
}
async function button(action, mounted = true, needle = 'KT-101') {
  await root.locator('button[data-action="' + action + '"]').click()
  if (mounted) await ready(needle)
  else {
    await page.waitForFunction(() => document.querySelector('.embed-lifecycle')?.dataset.state === 'disposed')
    await settle()
  }
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
async function history(label, before, after) {
  await root.locator('[data-u-command="univer.command.undo"]').filter({ visible: true }).click()
  await settle()
  await exact(label + '-undo', before, await snapshot())
  await root.locator('[data-u-command="univer.command.redo"]').filter({ visible: true }).click()
  await settle()
  await exact(label + '-redo', after, await snapshot())
}
async function gate(name, fn, standalone = false) {
  const count = report.differences.length
  try {
    if (standalone && !buildStandalone) throw Error('Requires independent standalone lifecycle harness')
    await fn()
    report.gates[name] = { passed: count === report.differences.length }
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
    report.gates[name].error = 'Strict full-model differences retained.'
  console.log(name + ': ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
function pack(actual, expected, p = '') {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual[k] ?? {}, v, p + '.' + k)
    else assert.deepEqual(actual[k], v, 'locale ' + p + '.' + k)
  }
}
try {
  await gate('original-native-grid-and-minimal-host', async () => {
    await fresh()
    const data = await snapshot()
    assert.equal(data.id, 'kestrel-inventory')
    assert.equal((await values('A4:A21')).filter((r) => r[0]).length, 18)
    assert.equal(await root.locator('.embed-lifecycle-controls button').count(), 6)
    assert.equal(await root.locator('output,details,select[name=fixture],input[name=quantity]').count(), 0)
    assert.equal(await root.locator('[data-u-comp=workbench-skeleton-content]').count(), 0)
    assert(
      await page.evaluate(
        () => window.paintedText.includes('Folding trail saw') && window.paintedText.includes('24.000'),
      ),
    )
    assert.equal(await root.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
    await capture('baseline')
    report.checks.push({
      name: '18 original records, real settled painted text, white SDK, six genuine lifecycle controls',
    })
  })
  await gate('native-edit-and-complete-history', async () => {
    await fresh()
    const before = await snapshot()
    await type('37.125')
    assert.equal((await values('D4'))[0][0], 37.125)
    const after = await snapshot()
    await capture('native-quantity-edited')
    await history('native-quantity', before, after)
  })
  await gate('checkpoint-remount-dispose-fresh-restore-and-download', async () => {
    await fresh()
    await type('37.125')
    const checkpoint = await snapshot()
    await button('checkpoint')
    await exact('checkpoint-does-not-write', checkpoint, await snapshot())
    await type('48.75', 'D5')
    const edited = await snapshot()
    await run(
      'window.previousOwner=univerAPI;window.previousCanvas=[...document.querySelectorAll("canvas")];window.previousSlot=document.querySelector(".mount-slot")',
    )
    await button('remount')
    assert(
      await page.evaluate(
        () =>
          previousOwner !== univerAPI &&
          previousCanvas.every((c) => !c.isConnected) &&
          previousSlot === document.querySelector('.mount-slot'),
      ),
    )
    await exact('remount-full-same-id', edited, await snapshot())
    await button('dispose', false)
    assert.equal(await canvas.count(), 0)
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    assert.equal(await root.locator('.mount-placeholder').isVisible(), true)
    await capture('disposed-card')
    await button('mount')
    assert.equal((await values('D4'))[0][0], 24)
    await button('restore')
    await exact('checkpoint-restored-after-fresh-mount', checkpoint, await snapshot())
    const downloadPromise = page.waitForEvent('download')
    await button('download')
    const download = await downloadPromise
    assert.equal(download.suggestedFilename(), 'kestrel-inventory.json')
    assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), await snapshot())
    const before = await snapshot()
    await type('59.125')
    const after = await snapshot()
    await history('fresh-restored-native', before, after)
    await capture('restored-native-edited')
    report.checks.push({
      name: 'Same host slot, old owner and canvases released; actual Blob download exactly matches current full model',
    })
  })
  await gate('literal-stable-sku-and-missing-targets', async () => {
    await fresh()
    const baseline = await snapshot()
    await run(examples[0])
    await run(examples[3])
    await exact('save-and-real-missing-unit-no-write', baseline, await snapshot())
    await run(examples[1])
    assert.equal((await values('D6'))[0][0], 37.125)
    await run(examples[2])
    assert.equal(
      await page.evaluate(() => univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange().getA1Notation()),
      'D6',
    )
    const downloadPromise = page.waitForEvent('download')
    await run(examples[4])
    const download = await downloadPromise
    assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), await snapshot())
    const valid = await snapshot()
    for (const bad of ['-1', '1000001', '1.0001', 'NaN']) {
      await assert.rejects(
        () => run(examples[1].replace('const quantity = 37.125', 'const quantity = ' + bad)),
        /Quantity must/,
      )
      await exact('literal-invalid-' + bad, valid, await snapshot())
    }
    // The SDK also keeps a second Add Sheet button in its mounted overflow portal.
    // The first is the visible left edge of the native sheet bar (verified in the failure screenshot).
    await root.locator('[data-u-comp=sheet-bar-append-button]').first().click()
    await root.getByRole('tab', { name: 'Sheet1', exact: true }).waitFor()
    const scratchId = await page.evaluate(() => univerAPI.getActiveWorkbook().getActiveSheet().getSheetId())
    const scratch = (await snapshot()).sheets[scratchId]
    await run(examples[1])
    await run(examples[2])
    assert.equal(await page.evaluate(() => univerAPI.getActiveWorkbook().getActiveSheet().getSheetId()), 'stock')
    await root.getByRole('tab', { name: 'Depot stock', exact: true }).dblclick()
    await root.getByRole('tab').locator('[contenteditable="true"]').fill('North and river stock')
    await page.keyboard.press('Enter')
    await root.getByRole('tab', { name: 'Sheet1', exact: true }).click()
    await run(examples[1])
    await run(examples[2])
    assert.deepEqual((await snapshot()).sheets[scratchId], scratch)
    const twoSheets = await snapshot()
    await button('remount')
    await exact('native-two-sheet-renamed-remount', twoSheets, await snapshot())
    await button('checkpoint')
    await root.getByRole('tab', { name: 'North and river stock', exact: true }).click({ button: 'right' })
    await page.getByText('Delete', { exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'OK', exact: true }).click()
    await page.waitForFunction(() => !univerAPI.getWorkbook('kestrel-inventory').getSheetBySheetId('stock'))
    const withoutStock = await snapshot()
    await assert.rejects(() => run(examples[1]), /stock worksheet is missing/)
    await button('remount', true, null)
    await root.getByRole('tab', { name: 'Sheet1', exact: true }).waitFor()
    await exact('deleted-stock-not-reseeded', withoutStock, await snapshot())
    await capture('deleted-stock-native-remounted')
    await button('restore')
    await exact('native-two-sheet-checkpoint-restored', twoSheets, await snapshot())
    report.checks.push({
      name: 'Five README literals, actual download, four invalid quantities, stable SKU independent of active tab, absent stock rejected',
    })
  })
  await gate(
    'literal-empty-boundary-full-owner-recovery',
    async () => {
      await fresh()
      const before = await snapshot()
      await run(restores[0])
      await ready()
      await exact('literal-same-id-full-owner', before, await snapshot())
      await run(restores[1])
      await ready('SKU')
      assert.equal((await values('A4:A21')).filter((r) => r[0]).length, 0)
      const empty = await snapshot()
      await run(restores[0])
      await ready('SKU')
      await exact('empty-full-owner', empty, await snapshot())
      await capture('empty-native')
      await run(restores[2])
      await ready()
      assert.deepEqual(await values('D4:D6'), [[0], [1000000], [0.125]])
      const boundary = await snapshot()
      await run(restores[0])
      await ready()
      await exact('boundary-full-owner', boundary, await snapshot())
      await capture('boundary-native')
      await run("await demo.replace(createInventory('error'))")
      const error = await snapshot()
      await run(examples[3])
      await exact('legacy-error-real-false', error, await snapshot())
      report.checks.push({
        name: 'Original default/empty/boundary/error data states, no fixture panel, same-ID owner recovery without ID/resource rewriting',
      })
    },
    true,
  )
  await gate(
    'pending-multiple-clicks-no-ghost-and-invalid',
    async () => {
      await fresh()
      const before = await snapshot()
      await run(`window.currentOwner=univerAPI;const data=univerAPI.getActiveWorkbook().save();
      for(const invalid of [null,{...data,id:'wrong'},{...data,sheetOrder:[]},{...data,sheets:{}},{...data,sheetOrder:['stock','stock']}]) {
        let rejected=false;try{await demo.replace(invalid)}catch{rejected=true}
        if(!rejected||currentOwner!==univerAPI)throw Error('Invalid replace changed owner')
      }`)
      await exact('invalid-before-dispose', before, await snapshot())
      for (let cycle = 0; cycle < 3; cycle++) {
        await run(`window.oldOwner=univerAPI;window.oldCanvases=[...document.querySelectorAll('canvas')];
        window.detachedButton=document.querySelector('[data-action=remount]');
        for(let i=0;i<20;i++)detachedButton.click();`)
        await ready()
        assert(
          await page.evaluate(
            () =>
              oldOwner !== univerAPI &&
              oldCanvases.every((c) => !c.isConnected) &&
              document.querySelectorAll('.embed-lifecycle').length === 1 &&
              document.querySelectorAll('canvas[id^=univer-sheet-main-canvas]').length === 1,
          ),
        )
        await exact('burst-cycle-' + cycle, before, await snapshot())
      }
      await run(`const saved=univerAPI.getActiveWorkbook().save();
      const pending=demo.replace(saved);
      let rejected=false;try{await demo.replace(saved)}catch{rejected=true}
      if(!rejected)throw Error('Concurrent replacement was accepted')
      await pending;`)
      await ready()
      await exact('concurrent-replace-rejected', before, await snapshot())
      await run(`await demo.dispose();await demo.dispose();detachedButton.click();
      if(window.univerAPI||document.querySelector('.embed-lifecycle'))throw Error('Disposed host leaked');
      const pending=createDemo(container);const finished=pending.dispose();await pending.dispose();await finished;
      if(window.univerAPI||document.querySelector('.embed-lifecycle'))throw Error('Pre-ready disposal leaked');
      window.demo=createDemo(container);await demo.ready;`)
      await ready()
      await capture('after-pending-disposal')
      report.checks.push({
        name: 'Five invalid snapshots before release, 3×20 disabled-button burst clicks, rejected concurrent replace, no ghost canvases or detached button handlers, idempotent pre-ready disposal',
      })
    },
    true,
  )
  await gate(
    'complete-locale-same-owner-theme-keyboard-responsive',
    async () => {
      await fresh()
      await type('19.625')
      const before = await snapshot()
      pack(await page.evaluate(() => univerAPI.getLocales()), await page.evaluate(() => packs.en))
      await run('window.owner=univerAPI;demo.setDarkMode(true)')
      assert(await page.evaluate(() => owner === univerAPI && univerAPI.isDarkMode()))
      await exact('theme-dark-same-owner', before, await snapshot())
      await run('demo.setDarkMode(false)')
      await exact('theme-light-same-owner', before, await snapshot())
      for (const width of [760, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        await settle()
        assert(await root.locator('.embed-lifecycle-controls').evaluate((el) => el.scrollWidth <= el.clientWidth + 1))
        const save = root.locator('[data-action=checkpoint]')
        await save.focus()
        await page.keyboard.press('Enter')
        await ready()
        await exact('keyboard-checkpoint-' + width, before, await snapshot())
      }
      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.goto(url + '?lang=zh-CN')
      await ready()
      assert.equal(await page.evaluate(() => univerAPI.getCurrentLocale()), 'zhCN')
      pack(await page.evaluate(() => univerAPI.getLocales()), await page.evaluate(() => packs.zh))
      assert.equal(await root.getByRole('button', { name: '保留内容重新挂载', exact: true }).count(), 1)
      await capture('initial-zh')
      await run(restores[3])
      await settle()
      assert.equal(await canvas.count(), 0)
      report.checks.push({
        name: 'Full EN/ZH core packs and all six translated host labels, same-owner themes, 760/390/320 keyboard checkpoint controls, fourth JS literal final disposal',
      })
    },
    true,
  )
  await gate(
    'normal-production-export-settled-source-parity',
    async () => {
      await new Promise((resolve) => server.httpServer.close(resolve))
      server = undefined
      const [entry] = JSON.parse(await fs.readFile(path.join(directory, 'exports.json'), 'utf8'))
      const source = (await readShowcaseSources()).find((item) => item.slug === report.slug)
      assert.equal(Object.keys(source.files).length, 10)
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
      await type('41.625')
      const edited = await snapshot()
      await button('remount')
      await exact('normal-export-native-remount', edited, await snapshot())
      await capture('normal-export-remounted')
      report.checks.push({
        name: 'Ten same-source files, normal production entry without harness globals, actual native edit and full-model remount',
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
