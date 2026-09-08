/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/univer-events-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/embed/univer-events-to-host/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 9)
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4416'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/embed/univer-events-to-host`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-univer-events-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/univer-events-to-host')
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
        name: 'univer-events-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo} from '/src/create-demo.ts';import {createMilestones,MILESTONES} from '/src/data.ts';window.createDemo=createDemo;window.createMilestones=createMilestones;window.MILESTONES=MILESTONES;window.container=document.getElementById('app');window.demo=createDemo(window.container);
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
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
page.setDefaultTimeout(12000)
const report = {
  slug: 'embed/univer-events-to-host',
  passed: false,
  gates: {},
  checks: [],
  knownIssues: [],
  errors: [],
  warnings: [],
  backendRequests: [],
}
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['fetch', 'xhr'].includes(r.resourceType()) && !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.paintedText = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    window.paintedText.push(String(text))
    return Reflect.apply(fill, this, [text, ...args])
  }
})
const root = page.locator('.host-events-demo'),
  canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]').first()
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('juniper-milestones').save())))
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
const feed = () =>
  root.locator('ol li').evaluateAll((items) =>
    items.map((item) => {
      const match = item.textContent.match(/^(\d+)\. (.*?): ([\s\S]*)$/)
      return { sequence: Number(match[1]), source: match[2], detail: JSON.parse(match[3]) }
    }),
  )
async function ready() {
  await page.locator('.host-events-demo[data-ready=true]').waitFor()
  await settle()
}
async function fresh() {
  await page.goto(url)
  await ready()
}
async function typed(address, value) {
  const name = root.locator('.host-events-editor input.univer-size-full').first()
  await name.fill(address)
  await name.press('Enter')
  await page.keyboard.insertText(String(value))
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    ({ a, v }) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getRawValue() === v,
    { a: address, v: value },
  )
  await settle()
}
async function clear() {
  if (await root.locator('[data-action=clear]').isEnabled()) await root.locator('[data-action=clear]').click()
  await settle()
}
async function toggle() {
  await root.locator('[data-action=subscription]').click()
  await settle()
}
async function nativeSelect(row) {
  await canvas.click({ position: { x: 710, y: 121 + 28 * (row - 4) } })
  await settle()
}
function differences(a, b, p = '$', out = []) {
  if (Object.is(a, b)) return out
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
    out.push({ path: p, before: a, after: b })
    return out
  }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) differences(a[k], b[k], p + '.' + k, out)
  return out
}
async function exact(name, before, after) {
  const diff = differences(before, after)
  await fs.writeFile(
    path.join(directory, name + '.json'),
    JSON.stringify({ before, after, differences: diff }, null, 2),
  )
  report.checks.push({ name, passed: !diff.length })
  if (diff.length) {
    report.knownIssues.push({ name, differences: diff })
    return false
  }
  return true
}
async function gate(name, fn, standalone = false) {
  if (standalone && !buildStandalone) {
    report.gates[name] = { passed: false, error: 'Requires standalone harness' }
    return
  }
  const issues = report.knownIssues.length
  try {
    await fn()
    report.gates[name] = { passed: issues === report.knownIssues.length }
  } catch (e) {
    report.gates[name] = { passed: false, error: e.stack || String(e) }
    await capture(name + '-failure').catch(() => {})
  }
  if (!report.gates[name].passed && !report.gates[name].error)
    report.gates[name].error = 'Strict whole-model differences retained'
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
}
function pack(actual, want, p = '') {
  for (const [k, v] of Object.entries(want)) {
    if (v && typeof v === 'object') pack(actual?.[k], v, p + k + '.')
    else assert.equal(actual?.[k], v, p + k)
  }
}
try {
  await gate('native-grid-value-and-selection-payloads', async () => {
    await fresh()
    assert.equal(await root.locator('.host-events-controls button').count(), 2)
    assert.equal(
      await root
        .locator('select,input[type=number],pre,output,[data-action=reset],[data-action=write],[data-action=save]')
        .count(),
      0,
    )
    assert.equal(
      await page.evaluate(
        () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('A4:E11').getRawValues().length,
      ),
      8,
    )
    await page.waitForFunction(
      () =>
        window.paintedText.some((t) => t.includes('Accessibility audit')) &&
        window.paintedText.some((t) => t.includes('Launch readiness')),
    )
    await capture('cover')
    await clear()
    await typed('C4', 47)
    assert(
      (await feed()).some(
        (e) =>
          e.source === 'SDK SheetValueChanged' &&
          e.detail.some((r) => r.sheet === 'milestones' && r.range === 'C4' && r.values[0][0] === 47),
      ),
    )
    await nativeSelect(5)
    await nativeSelect(4)
    const events = await feed()
    assert(
      events.some(
        (e) =>
          e.source === 'SDK onSelectionChange' &&
          e.detail.sheet === 'milestones' &&
          e.detail.selections.some((r) => r.startRow === 3 && r.startColumn === 4),
      ),
    )
    await fs.writeFile(path.join(directory, 'native-events.json'), JSON.stringify(events, null, 2))
    await capture('native-events')
  })
  await gate('native-edit-history-complete-model-and-event-content', async () => {
    await fresh()
    const before = await snapshot()
    await typed('E4', 'Keyboard review complete — north region')
    const after = await snapshot()
    await page.keyboard.press('Control+z')
    await settle()
    await exact('native-undo', before, await snapshot())
    assert(
      (await feed()).some(
        (e) =>
          e.source === 'SDK SheetValueChanged' &&
          e.detail.some((r) => r.range === 'E4' && r.values[0][0] === 'Review keyboard paths'),
      ),
    )
    await page.keyboard.press('Control+y')
    await settle()
    await exact('native-redo', after, await snapshot())
    await capture('native-edited')
  })
  await gate('unsubscribe-rebind-no-replay-no-duplicates-and-clear', async () => {
    await fresh()
    await typed('C4', 41)
    const first = (await feed()).at(-1).sequence
    await toggle()
    const stopped = await feed()
    await typed('C4', 42)
    await nativeSelect(6)
    assert.deepEqual(await feed(), stopped)
    assert.equal(
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').getRawValue()),
      42,
    )
    await toggle()
    for (const value of [43, 44, 45]) {
      await clear()
      await typed('C4', value)
      const entries = await feed(),
        changed = entries.filter(
          (e) =>
            e.source === 'SDK SheetValueChanged' && e.detail.some((r) => r.range === 'C4' && r.values[0][0] === value),
        )
      assert.equal(changed.length, 1, 'Exactly one real value notification after rebinding')
      assert(entries.every((e) => e.sequence > first))
      await toggle()
      await toggle()
    }
    assert(
      !(await feed()).some((e) => e.source === 'SDK SheetValueChanged' && e.detail.some((r) => r.values[0][0] === 42)),
    )
    const before = await snapshot()
    await clear()
    assert.equal((await feed()).length, 0)
    await exact('clear-no-model-write', before, await snapshot())
    await capture('rebound-feed')
  })
  await gate('bounded-feed-payload-safety-and-retained-values', async () => {
    await fresh()
    await typed('E4', '<img src=x onerror=alert(1)>')
    assert.equal(await root.locator('ol img').count(), 0)
    assert(
      (await feed()).some(
        (e) =>
          e.source === 'SDK SheetValueChanged' &&
          e.detail.some((r) => r.values[0][0] === '<img src=x onerror=alert(1)>'),
      ),
    )
    for (let value = 1; value <= 16; value++) await typed('C4', value)
    const entries = await feed()
    assert.equal(entries.length, 12)
    assert(entries[0].sequence > 1)
    const values = entries
      .filter((e) => e.source === 'SDK SheetValueChanged')
      .flatMap((e) => e.detail.filter((r) => r.range === 'C4').map((r) => r.values[0][0]))
    assert(values.includes(16))
    assert(new Set(values).size > 1)
    for (let i = 1; i < entries.length; i++) assert(entries[i].sequence > entries[i - 1].sequence)
    await fs.writeFile(path.join(directory, 'bounded-feed.json'), JSON.stringify(entries, null, 2))
    await capture('bounded-feed')
  })
  await gate('nine-literal-subscriptions-validation-save-and-disposal', async () => {
    await fresh()
    await page.evaluate(
      'window.literalIterator=(async function*(){\n' +
        examples
          .map(
            (code, index) =>
              code +
              '\nyield {received:[...received.entries()],checkpoint:' +
              (index >= 4 ? 'structuredClone(checkpoint)' : 'null') +
              '};',
          )
          .join('\n') +
        '\n})()',
    )
    let afterWrite
    for (let index = 0; index < examples.length; index++) {
      const before = await snapshot()
      const result = await page.evaluate(() => window.literalIterator.next())
      await settle()
      if (index === 1) {
        afterWrite = await snapshot()
        assert(
          result.value.received.some(
            ([, e]) =>
              e.source === 'SDK SheetValueChanged' && e.detail.some((r) => r.range === 'C4' && r.values[0][0] === 50),
          ),
        )
      }
      if (index === 2) await exact('invalid-literal-inputs', afterWrite, await snapshot())
      if (index >= 4) await exact('host-memory-checkpoint-' + (index + 1), afterWrite, result.value.checkpoint)
      if ([0, 3, 5, 7, 8].includes(index) && ![5].includes(index)) {
        // Activation affects runtime selection, not the persisted model.
        await exact('literal-no-model-write-' + (index + 1), before, await snapshot())
      }
      report.checks.push({ name: 'literal-' + (index + 1), passed: true })
    }
    await page.evaluate(() => window.literalIterator.return())
  })
  await gate(
    'other-workbook-native-value-and-selection-filter',
    async () => {
      await fresh()
      await page.evaluate(() => {
        window.univerAPI.createWorkbook({
          id: 'juniper-other-owner',
          name: 'Separate host workbook',
          sheetOrder: ['other'],
          sheets: {
            other: {
              id: 'other',
              name: 'Other owner',
              rowCount: 25,
              columnCount: 8,
              cellData: { 0: { 0: { v: 'OTHER WORKBOOK — must not enter Juniper feed' } } },
            },
          },
        })
      })
      await page.locator('canvas[id^="univer-sheet-main-canvas_juniper-other-owner"]').waitFor()
      await settle()
      await clear()
      await typed('B2', 'Other owner edit')
      const activeCanvas = root.locator('canvas[id^="univer-sheet-main-canvas_juniper-other-owner"]')
      await activeCanvas.click({ position: { x: 210, y: 110 } })
      await settle()
      assert.equal((await feed()).length, 0)
      await capture('other-owner-filter')
    },
    true,
  )
  await gate(
    'same-id-full-owner-restore-fresh-events-history-and-no-ghost-dom',
    async () => {
      await fresh()
      await typed('C4', 67)
      const before = await snapshot()
      await page.evaluate(() => {
        window.oldAPI = window.univerAPI
        window.oldRoot = document.querySelector('.host-events-demo')
        window.oldHTML = window.oldRoot.innerHTML
      })
      await run(restores[0])
      await ready()
      assert(await page.evaluate(() => window.oldAPI !== window.univerAPI && !window.oldRoot.isConnected))
      await page.evaluate(() => {
        window.oldHTML = window.oldRoot.innerHTML
      })
      await exact('complete-owner-restore', before, await snapshot())
      const baseline = await snapshot()
      await clear()
      await typed('E4', 'Fresh restored owner')
      const after = await snapshot(),
        entries = await feed()
      assert.equal(
        entries.filter(
          (e) =>
            e.source === 'SDK SheetValueChanged' &&
            e.detail.some((r) => r.range === 'E4' && r.values[0][0] === 'Fresh restored owner'),
        ).length,
        1,
      )
      await page.keyboard.press('Control+z')
      await settle()
      await exact('fresh-owner-undo', baseline, await snapshot())
      await page.keyboard.press('Control+y')
      await settle()
      await exact('fresh-owner-redo', after, await snapshot())
      assert(await page.evaluate(() => window.oldRoot.innerHTML === window.oldHTML))
      await capture('restored-native-events')
    },
    true,
  )
  await gate(
    'empty-boundary-default-original-variants',
    async () => {
      await fresh()
      await run(restores[1])
      await ready()
      await capture('empty')
      assert.equal(
        await page.evaluate(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('A4').getRawValue() == null,
        ),
        true,
      )
      const beforeGuard = await snapshot(),
        beforeFeed = await feed()
      await assert.rejects(
        run('const workbook = window.univerAPI.getActiveWorkbook();\n' + examples[1]),
        /Audit milestone absent/,
      )
      await exact('empty-guard-no-write', beforeGuard, await snapshot())
      assert.deepEqual(await feed(), beforeFeed)
      await typed('E4', 'Empty-template native note')
      assert((await feed()).some((e) => e.source === 'SDK SheetValueChanged'))
      await run(restores[2])
      await ready()
      assert.deepEqual(
        await page.evaluate(() =>
          window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4:C5').getRawValues(),
        ),
        [[0], [100]],
      )
      await capture('boundary')
      await page.evaluate(async () => {
        window.demo.dispose()
        window.demo = window.createDemo(window.container, false, undefined, window.createMilestones('default'))
        await window.demo.ready
      })
      await ready()
      assert.equal(
        await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').getRawValue()),
        35,
      )
    },
    true,
  )
  await gate(
    'complete-english-css-same-owner-theme-and-feed',
    async () => {
      await fresh()
      await typed('E4', 'Theme retained')
      const before = await snapshot(),
        entries = await feed()
      await page.evaluate(() => (window.ownerAPI = window.univerAPI))
      const src = (await readShowcaseSources()).find((s) => s.slug === report.slug),
        factory = src.files['/src/create-demo.ts']
      assert.equal(Object.keys(src.files).length, 10)
      assert.equal([...factory.matchAll(/import '@[^']+\/lib\/index.css'/g)].length, 1)
      for (const lang of ['en-US', 'zh-CN']) {
        await page.evaluate((l) => {
          document.documentElement.lang = l
        }, lang)
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        pack(
          await page.evaluate(() => window.univerAPI.getLocales()),
          (await import('@univerjs/preset-sheets-core/locales/en-US')).default,
        )
        for (const dark of [true, false]) {
          await page.evaluate((d) => window.demo.setDarkMode(d), dark)
          await settle()
          assert(await page.evaluate(() => window.ownerAPI === window.univerAPI))
          await exact('theme-' + lang + '-' + dark, before, await snapshot())
          assert.deepEqual(await feed(), entries)
        }
      }
      await capture('zh-edited')
    },
    true,
  )
  await gate(
    'initial-zh-invalid-preready-and-narrow-controls',
    async () => {
      await fresh()
      await page.evaluate(async () => {
        const api = window.univerAPI,
          saved = api.getActiveWorkbook().save()
        let rejected = false
        try {
          window.createDemo(window.container, false, undefined, { ...saved, id: '' })
        } catch {
          rejected = true
        }
        if (!rejected || window.univerAPI !== api) throw Error('Invalid snapshot changed owner')
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        const pending = window.createDemo(window.container)
        pending.dispose()
        pending.dispose()
        await pending.ready
        if (window.univerAPI || document.querySelector('.host-events-demo')) throw Error('Pending owner leaked')
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await ready()
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'zh-CN')
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      assert.equal(await root.getByRole('button', { name: 'Unsubscribe', exact: true }).count(), 1)
      await capture('initial-zh')
      for (const width of [760, 390, 320]) {
        await page.setViewportSize({ width, height: 1050 })
        await settle()
        assert(await root.locator('.host-events-controls').evaluate((n) => n.scrollWidth <= n.clientWidth + 1))
        const toggleButton = root.locator('[data-action=subscription]')
        await toggleButton.focus()
        await page.keyboard.press('Enter')
        await settle()
        assert.equal(await root.getAttribute('data-listening'), 'false')
        await page.keyboard.press('Enter')
        await settle()
        assert.equal(await root.getAttribute('data-listening'), 'true')
        await capture('width-' + width)
      }
      await page.evaluate(() => {
        window.demo.dispose()
        window.demo.dispose()
      })
      assert.equal(await root.count(), 0)
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
        knownIssues: report.knownIssues.map((i) => ({ name: i.name, count: i.differences.length })),
      },
      null,
      2,
    ),
  )
  await browser.close()
  if (server) await new Promise((r) => server.httpServer.close(r))
}
if (!report.passed) process.exitCode = 1
