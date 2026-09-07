/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/cedar-lazy-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/embed/lazy-load-editor/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 4)
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(restores.length, 5)
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const port = Number(process.env.SHOWCASE_EXPORT_PORT || '4428')
assert(Number.isInteger(port) && port > 0 && port < 65536, 'Valid isolated preview port')
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? `http://127.0.0.1:${port}`
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/embed/lazy-load-editor`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-cedar-lazy-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/lazy-load-editor')
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
        name: 'cedar-lazy-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo} from '/src/create-demo.ts';import {createRoutes,validateSnapshot} from '/src/data.ts';window.createRoutes=createRoutes;window.createDemo=createDemo;window.validateSnapshot=validateSnapshot;document.documentElement.lang=new URLSearchParams(location.search).get('lang')||'en-US';window.container=document.getElementById('app');window.demo=createDemo(window.container);
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port, strictPort: true },
  })
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
page.setDefaultTimeout(15000)
const report = {
  slug: 'embed/lazy-load-editor',
  passed: false,
  sourceFiles: 11,
  literals: { ts: examples.length, js: restores.length },
  gates: {},
  checks: [],
  differences: [],
  errors: [],
  expectedNetworkErrors: [],
  requests: [],
  backendRequests: [],
}
let failingNetwork = false
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() !== 'error') return
  if (failingNetwork && /Failed to load resource|net::ERR_FAILED/.test(m.text()))
    report.expectedNetworkErrors.push(m.text())
  else report.errors.push(m.text())
})
page.on('request', (r) => {
  report.requests.push({ url: r.url(), type: r.resourceType(), time: Date.now() })
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
const root = page.locator('.lazy-load-demo')
const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]').first()
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(univerAPI.getWorkbook('cedar-routes').save())))
const values = (address) =>
  page.evaluate(
    (a) => univerAPI.getWorkbook('cedar-routes').getSheetBySheetId('routes').getRange(a).getRawValues(),
    address,
  )
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
const phase = (value) => page.locator('.lazy-load-demo[data-phase="' + value + '"]').waitFor({ timeout: 25000 })
async function ready(needle = 'Harbor loop') {
  await phase('ready')
  await root.locator('.lazy-editor-target').scrollIntoViewIfNeeded()
  await page.waitForFunction(
    (text) => {
      const c = document.querySelector('canvas[id^="univer-sheet-main-canvas"]')
      if (!c?.width || document.querySelector('[data-u-comp=workbench-skeleton-content]')) return false
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let ink = 0
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] < 100 && d[i + 1] < 100 && d[i + 2] < 100) ink++
      return ink > 1200 && window.paintedText.includes(text)
    },
    needle,
    { timeout: 20000 },
  )
  await settle()
}
async function idle() {
  await page.goto(url)
  await phase('idle')
  await settle()
}
async function activate() {
  await root.locator('[data-action=load]').click()
  await ready()
}
async function fresh() {
  await idle()
  await activate()
}
async function calculate() {
  await run('await univerAPI.getFormula().onCalculationResultApplied(10000)')
  await settle()
}
async function type(value, address = 'C4') {
  const input = root.locator('input.univer-size-full').first()
  await input.fill(address)
  await input.press('Enter')
  await page.keyboard.insertText(value)
  await page.keyboard.press('Enter')
  await calculate()
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
  await calculate()
  await exact(label + '-undo', before, await snapshot())
  await root.locator('[data-u-command="univer.command.redo"]').filter({ visible: true }).click()
  await calculate()
  await exact(label + '-redo', after, await snapshot())
}
async function gate(name, fn, standalone = false) {
  const count = report.differences.length
  try {
    if (standalone && !buildStandalone) throw Error('Requires independent selected production harness')
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
    report.gates[name].error = 'Strict raw snapshot differences retained.'
  console.log(name + ': ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
function pack(actual, expected, p = '') {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual[k] ?? {}, v, p + '.' + k)
    else assert.deepEqual(actual[k], v, 'locale ' + p + '.' + k)
  }
}
const deadline = async (p, label) => {
  let timer
  try {
    return await Promise.race([
      p,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(Error(label)), 20000)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}
const requestPattern = '**/assets/editor-*.js'
let unblock
try {
  await gate(
    'real-deferred-js-css-scroll-and-cancel-late-import',
    async () => {
      const before = report.requests.length
      // Do not await the arrival promise until after activation.
      let arrived
      const started = new Promise((r) => {
        arrived = r
      })
      await page.route(requestPattern, async (route) => {
        await new Promise((r) => {
          unblock = r
          arrived(route.request().url())
        })
        await route.continue()
      })
      try {
        await idle()
        assert.equal(await canvas.count(), 0)
        assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
        assert.equal(await root.locator('table tbody tr').count(), 12)
        assert.equal(await root.locator('details,output,select,input').count(), 0)
        const early = report.requests.slice(before)
        assert(!early.some((r) => /\/assets\/editor-.*\.(js|css)/.test(r.url)))
        await capture('deferred-manifest')
        await root.locator('.lazy-editor-target').scrollIntoViewIfNeeded()
        const asset = await deadline(started, 'Real deferred JS request never arrived')
        await phase('loading')
        await run('window.pendingLoad=demo.load()')
        assert.equal(await canvas.count(), 0)
        await capture('real-pending-import')
        await root.locator('[data-action=cancel]').click()
        await phase('idle')
        unblock()
        unblock = undefined
        await run('await window.pendingLoad')
        await settle()
        assert.equal(await canvas.count(), 0)
        assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
        await root.locator('.lazy-editor-target').scrollIntoViewIfNeeded()
        await settle()
        await phase('idle')
        await activate()
        const actual = report.requests.slice(before)
        assert(actual.some((r) => /\/assets\/editor-.*\.css/.test(r.url)))
        report.checks.push({
          name: 'No editor JS/CSS or owner before activation; real IntersectionObserver load, held JS cancellation, late completion cannot mount; explicit reload',
          asset,
          requests: actual,
        })
      } finally {
        unblock?.()
        unblock = undefined
        await page.unroute(requestPattern)
      }
    },
    true,
  )
  await gate(
    'native-formulas-css-minimal-host-and-history',
    async () => {
      await fresh()
      assert.equal((await values('A4:A15')).filter((r) => r[0]).length, 12)
      assert.equal(await root.locator('button[data-action]').count(), 4)
      const wb = await snapshot()
      assert.equal(wb.id, 'cedar-routes')
      const expected = await page.evaluate(() =>
        univerAPI.getWorkbook('cedar-routes').getSheetBySheetId('routes').getRange('F18').getDisplayValue(),
      )
      assert.equal(expected, '$486.78')
      const native = root.locator('[data-u-comp=workbench-layout]')
      assert.equal(await native.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
      assert.equal(
        await native.evaluate((el) => getComputedStyle(el).getPropertyValue('--univer-gray-0').trim()),
        '#FFFFFF',
      )
      await root.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
      await capture('native-original')
      await type('9')
      assert.equal((await values('C4'))[0][0], 9)
      assert.equal(
        await page.evaluate(() =>
          univerAPI.getWorkbook('cedar-routes').getSheetBySheetId('routes').getRange('F4').getDisplayValue(),
        ),
        '$69.93',
      )
      const edited = await snapshot()
      await capture('native-runs-edited')
      await history('native-first-runs', wb, edited)
    },
    false,
  )
  await gate('all-four-facade-literals-and-validation', async () => {
    await fresh()
    const initial = await snapshot()
    await run(examples[2])
    await exact('literal-save-no-write', initial, await snapshot())
    await run(examples[0])
    assert.equal((await values('C4'))[0][0], 8)
    await run(examples[1])
    assert.equal(
      await page.evaluate(() => univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange().getA1Notation()),
      'C4',
    )
    const edited = await snapshot()
    for (const invalid of ['-1', '10001', '1.5', 'NaN']) {
      await assert.rejects(() => run(examples[0].replace('const runs = 8', 'const runs = ' + invalid)), /integer from/)
      await exact('invalid-runs-' + invalid, edited, await snapshot())
    }
    const downloading = page.waitForEvent('download')
    await run(examples[3])
    const download = await downloading
    assert.equal(download.suggestedFilename(), 'cedar-community-routes.json')
    assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), await snapshot())
    report.checks.push({
      name: 'Four README Facade literals, actual Blob download and rejected invalid runs preserve complete model',
    })
  })
  await gate(
    'release-load-complete-same-id-recovery-and-fresh-history',
    async () => {
      await fresh()
      await type('9')
      const saved = await snapshot()
      await run(
        'window.owner=univerAPI;window.canvases=[...document.querySelectorAll("canvas")];window.mount=document.querySelector(".lazy-mount")',
      )
      await run(restores[1])
      await ready()
      assert(
        await page.evaluate(
          () =>
            owner !== univerAPI &&
            canvases.every((c) => !c.isConnected) &&
            mount === document.querySelector('.lazy-mount'),
        ),
      )
      await exact('literal-full-same-id-restore', saved, await snapshot())
      await type('11')
      const after = await snapshot()
      await history('fresh-restored-runs', saved, after)
      await capture('restored-native-edited')
      const downloading = page.waitForEvent('download')
      await root.locator('[data-action=download]').click()
      const download = await downloading
      assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), await snapshot())
      await root.locator('[data-action=release]').click()
      await phase('idle')
      assert.equal(await canvas.count(), 0)
      assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
      await root.locator('.lazy-editor-target').scrollIntoViewIfNeeded()
      await settle()
      await phase('idle')
      await run(restores[0])
      await ready()
      assert.equal((await values('C4'))[0][0], 6)
      report.checks.push({
        name: 'Actual old owner/canvases released, same mount slot and full IDs/resources restored; native post-restore edits/history, real download and fresh default reload',
      })
    },
    true,
  )
  await gate(
    'original-empty-boundary-literals-and-owner-preserving-invalid',
    async () => {
      await fresh()
      const valid = await snapshot()
      await run(`window.previous=univerAPI;const saved=univerAPI.getActiveWorkbook().save();
   for(const invalid of [null,{...saved,id:'wrong'},{...saved,sheetOrder:[]},{...saved,sheets:{}},{...saved,sheetOrder:['routes','routes']}]) {
    let rejected=false;try{validateSnapshot(invalid)}catch{rejected=true}
    if(!rejected||previous!==univerAPI)throw Error('Invalid checkpoint changed owner')
   }`)
      await exact('invalid-before-release', valid, await snapshot())
      await run(restores[2])
      await ready('Weekly route budget')
      assert.equal((await values('A4:A15')).filter((r) => r[0]).length, 0)
      assert.equal((await values('F18'))[0][0], 0)
      const empty = await snapshot()
      await assert.rejects(() => run(examples[0]), /target is absent/)
      await exact('empty-missing-target-no-write', empty, await snapshot())
      await run(restores[1])
      await ready('Weekly route budget')
      await exact('empty-full-same-id', empty, await snapshot())
      await capture('empty-native')
      await run(restores[3])
      await ready()
      assert.deepEqual(await values('C4:C5'), [[0], [10000]])
      const boundary = await snapshot()
      await run(restores[1])
      await ready()
      await exact('boundary-full-same-id', boundary, await snapshot())
      await capture('boundary-native')
      report.checks.push({
        name: 'Two original data variants preserve native SUM and original content, validated invalid snapshots and missing-target error without model writes',
      })
    },
    true,
  )
  await gate(
    'repeated-native-load-clicks-and-parent-unmount-mid-import',
    async () => {
      await idle()
      const start = report.requests.length
      let arrived
      const started = new Promise((r) => {
        arrived = r
      })
      await page.route(requestPattern, async (route) => {
        await new Promise((r) => {
          unblock = r
          arrived()
        })
        await route.continue()
      })
      try {
        await root.locator('[data-action=load]').focus()
        await page.keyboard.press('Enter')
        await deadline(started, 'Pending editor request missing')
        await run(`window.detachedLoad=document.querySelector('[data-action=load]');for(let i=0;i<20;i++)detachedLoad.click();
      window.pendingLoad=demo.load();if(pendingLoad!==demo.load())throw Error('Pending load is not shared');
      await demo.dispose();await demo.dispose();`)
        assert.equal(await root.count(), 0)
        unblock()
        unblock = undefined
        await run('await pendingLoad;detachedLoad.click()')
        await settle()
        assert.equal(await page.locator('canvas').count(), 0)
        assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
        assert.equal(report.requests.slice(start).filter((r) => /\/assets\/editor-.*\.js/.test(r.url)).length, 1)
        await run('window.demo=createDemo(container);await demo.load()')
        await ready()
        const before = await snapshot()
        for (let i = 0; i < 3; i++) {
          await run(
            'window.old=univerAPI;window.oldCanvases=[...document.querySelectorAll("canvas")];await demo.release();await demo.load()',
          )
          await ready()
          assert(
            await page.evaluate(
              () =>
                old !== univerAPI &&
                oldCanvases.every((c) => !c.isConnected) &&
                document.querySelectorAll('canvas[id^=univer-sheet-main-canvas]').length === 1,
            ),
          )
          await exact('fresh-load-cycle-' + i, before, await snapshot())
        }
        report.checks.push({
          name: '20 rapid disabled load clicks and shared Promise yield one network request; parent disposal during real held import blocks late owner; detached control inert, 3 fresh owner cycles',
        })
      } finally {
        unblock?.()
        unblock = undefined
        await page.unroute(requestPattern)
      }
    },
    true,
  )
  await gate(
    'real-network-failure-save-before-refresh-and-recovery',
    async () => {
      for (const language of ['en-US', 'zh-CN']) {
        await page.goto(url + '?lang=' + language)
        await phase('idle')
        let blocked = 0
        await page.route(requestPattern, (route) => {
          blocked++
          return route.abort('failed')
        })
        failingNetwork = true
        try {
          await root.locator('[data-action=load]').click()
          await phase('error')
          assert.equal(await canvas.count(), 0)
          assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
          const refresh = root.getByRole('button', {
            name: language === 'zh-CN' ? '需要刷新页面' : 'Page refresh required',
            exact: true,
          })
          assert.equal(await refresh.isDisabled(), true)
          const message = await root.getByRole('alert').innerText()
          assert.match(
            message,
            language === 'zh-CN' ? /请先保存.*再刷新页面/ : /Save other page work.*refresh this page/,
          )
          const currentURL = page.url()
          await run('document.querySelector("[data-action=load]").click()')
          await assert.rejects(() => run('await demo.load()'), /Save other page work before refreshing/)
          await settle()
          assert.equal(page.url(), currentURL, 'Host never automatically reloads user page state')
          assert.equal(blocked, 1, 'Disabled activation and direct rejection do not request a cached failed import')
          await capture('import-refresh-required-' + language)
          await page.unroute(requestPattern)
          await page.reload()
          await phase('idle')
          assert.equal(await canvas.count(), 0)
          await activate()
          assert.equal(
            await page.evaluate(() =>
              univerAPI.getWorkbook('cedar-routes').getSheetBySheetId('routes').getRange('F18').getDisplayValue(),
            ),
            '$486.78',
          )
          await capture('explicit-reload-recovered-' + language)
          report.checks.push({
            name: 'Real import failure: save-before-refresh guidance, disabled misleading Retry, no automatic reload; explicit browser reload recovers native formula owner',
            language,
            blocked,
          })
        } finally {
          await page.unroute(requestPattern)
          failingNetwork = false
        }
      }
    },
    true,
  )
  await gate(
    'complete-locales-stable-theme-keyboard-and-final-dispose',
    async () => {
      await fresh()
      await type('12')
      const saved = await snapshot()
      const { createRequire } = await import('node:module')
      const require = createRequire(import.meta.url)
      pack(await page.evaluate(() => univerAPI.getLocales()), require('@univerjs/preset-sheets-core/locales/en-US'))
      await run('window.same=univerAPI;demo.setDarkMode(true)')
      assert(await page.evaluate(() => same === univerAPI && univerAPI.isDarkMode()))
      await exact('dark-same-owner', saved, await snapshot())
      await run('demo.setDarkMode(false)')
      await exact('light-same-owner', saved, await snapshot())
      for (const width of [760, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        await run('await demo.release()')
        await phase('idle')
        assert(await root.evaluate((el) => el.scrollWidth <= el.clientWidth + 1))
        await root.locator('[data-action=load]').focus()
        await page.keyboard.press('Enter')
        await ready()
        assert.equal((await values('C4'))[0][0], 6)
      }
      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.goto(url + '?lang=zh-CN')
      await phase('idle')
      assert.equal(await root.getByRole('button', { name: '打开路线编辑器', exact: true }).count(), 1)
      await activate()
      assert.equal(await page.evaluate(() => univerAPI.getCurrentLocale()), 'zhCN')
      pack(await page.evaluate(() => univerAPI.getLocales()), require('@univerjs/preset-sheets-core/locales/zh-CN'))
      await capture('initial-zh')
      await run(restores[4])
      await settle()
      assert.equal(await root.count(), 0)
      assert.equal(await page.locator('canvas').count(), 0)
      report.checks.push({
        name: 'Complete SDK EN/ZH, translated host labels, owner-stable themes, 760/390/320 keyboard activation and idempotent final host dispose',
      })
    },
    true,
  )
  await gate(
    'normal-production-export-source-parity-real-chunk-and-paint',
    async () => {
      await new Promise((r) => server.httpServer.close(r))
      server = undefined
      const [entry] = JSON.parse(await fs.readFile(path.join(directory, 'exports.json'), 'utf8'))
      const source = (await readShowcaseSources()).find((item) => item.slug === report.slug)
      assert.equal(Object.keys(source.files).length, 11)
      for (const [name, content] of Object.entries(source.files))
        assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
      assert(!/import\s+\{[^}]*createUniver/.test(source.files['/src/create-demo.ts']))
      assert(source.files['/src/editor.ts'].includes('@univerjs/preset-sheets-core/lib/index.css'))
      const { build, preview } = await import(
        pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js'))
      )
      await build({ root: entry.directory, configFile: false, logLevel: 'warn' })
      server = await preview({
        root: entry.directory,
        configFile: false,
        preview: { host: '127.0.0.1', port, strictPort: true },
      })
      const before = report.requests.length
      await idle()
      assert.equal(await page.evaluate(() => typeof window.demo), 'undefined')
      assert(!report.requests.slice(before).some((r) => /\/assets\/editor-.*\.(js|css)/.test(r.url)))
      await root.locator('.lazy-editor-target').scrollIntoViewIfNeeded()
      await ready()
      assert(report.requests.slice(before).some((r) => /\/assets\/editor-.*\.js/.test(r.url)))
      assert(report.requests.slice(before).some((r) => /\/assets\/editor-.*\.css/.test(r.url)))
      await capture('normal-export-cover')
      await type('10')
      assert.equal((await values('C4'))[0][0], 10)
      await capture('normal-export-native-edited')
      const assets = await fs.readdir(path.join(entry.directory, 'dist/assets'))
      report.checks.push({
        name: 'Eleven current source files; true production entry, delayed JS and CSS, settled SDK paint and real native input',
        assets,
      })
    },
    true,
  )
  report.passed =
    Object.values(report.gates).every((g) => g.passed) && !report.errors.length && !report.backendRequests.length
} finally {
  unblock?.()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        ...report,
        checks: report.checks.length,
        requests: report.requests.length,
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
