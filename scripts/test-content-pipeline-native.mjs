/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/content-pipeline-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/bases/content-pipeline/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 16)
const restore = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)][0][1]
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4416'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/bases/content-pipeline`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY ||
    (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-content-pipeline-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'bases/content-pipeline')
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
        name: 'content-pipeline-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo} from '/src/create-demo.ts';import {DATA} from '/src/data.ts';window.createDemo=createDemo;window.DATA=DATA;window.container=document.getElementById('app');window.demo=createDemo(window.container);
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
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  timezoneId: 'UTC',
  acceptDownloads: true,
})
page.setDefaultTimeout(15000)
const report = {
  slug: 'bases/content-pipeline',
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
    (['xhr', 'fetch'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.framesByCanvas = new Map()
  window.paintPoints = []
  const p = CanvasRenderingContext2D.prototype,
    fill = p.fillText,
    clear = p.clearRect
  p.clearRect = function (...args) {
    window.framesByCanvas.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  p.fillText = function (text, ...args) {
    const texts = window.framesByCanvas.get(this.canvas) || []
    texts.push(String(text))
    window.framesByCanvas.set(this.canvas, texts.slice(-20000))
    if (this.canvas.isConnected) {
      const point = this.getTransform().transformPoint({ x: args[0], y: args[1] }),
        rect = this.canvas.getBoundingClientRect()
      window.paintPoints.push({
        text: String(text),
        x: rect.x + (point.x * rect.width) / this.canvas.width,
        y: rect.y + (point.y * rect.height) / this.canvas.height,
      })
      window.paintPoints = window.paintPoints.slice(-20000)
    }
    return Reflect.apply(fill, this, [text, ...args])
  }
})

const root = page.locator('.content-pipeline')
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('content-pipeline-base').save())))
const projection = (view) =>
  page.evaluate(
    (id) => window.univerAPI.getBase('content-pipeline-base').getTableById('content').getViewById(id).getProjection(),
    view,
  )
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
async function paint(text) {
  await page.waitForFunction(
    (w) =>
      [...window.framesByCanvas].some(
        ([c, t]) => c.isConnected && c.getBoundingClientRect().width > 300 && t.includes(w),
      ),
    text,
  )
}
async function ready() {
  await root.locator('[data-u-comp=workbench-skeleton-content]').waitFor({ state: 'detached' })
  await page.locator('.content-pipeline[data-ready=true]').waitFor()
  await paint('Pricing launch page')
  await settle()
}
async function fresh() {
  await page.goto(url)
  await ready()
}
async function activate(id, name) {
  await page.getByText(name, { exact: true }).first().click()
  await page.waitForFunction((viewId) => window.univerAPI.getBaseUI().getActiveViewId() === viewId, id)
  await settle()
}
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
  if (differences.length) report.knownIssues.push({ name, differences })
  else report.checks.push({ name, exact: true })
}
async function gate(name, fn, standalone = false) {
  if (standalone && !buildStandalone) {
    report.gates[name] = { passed: false, skipped: 'Standalone lifecycle harness required' }
    return
  }
  const n = report.knownIssues.length,
    e = report.errors.length
  try {
    await fn()
    report.gates[name] = { passed: n === report.knownIssues.length && e === report.errors.length }
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
function pack(actual, expected) {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual?.[k], v)
    else assert.deepEqual(actual?.[k], v, k)
  }
}
async function textPoint(text) {
  await paint(text)
  return page.evaluate(
    (needle) => window.paintPoints.findLast((p) => p.text === needle && p.x > 0 && p.y > 100 && p.y < 950),
    text,
  )
}
async function September() {
  await activate('calendar', 'Publishing calendar')
  await paint('Aug 2026')
  const next = await textPoint('>')
  await page.mouse.click(next.x, next.y)
  await page.waitForFunction(() =>
    [...window.framesByCanvas].some(([c, t]) => c.isConnected && t.some((s) => s === 'Sep 2026' || s === 'Oct 2026')),
  )
  // Explicit setup around the separately failing Aug-31 rollover gate; never count it as fixed.
  if (await page.evaluate(() => [...window.framesByCanvas].some(([c, t]) => c.isConnected && t.includes('Oct 2026')))) {
    const previous = await textPoint('<')
    await page.mouse.click(previous.x, previous.y)
  }
  await paint('Sep 2026')
}
try {
  await gate('original-story-native-grid-and-three-views', async () => {
    await fresh()
    const saved = await snapshot()
    assert.equal(saved.id, 'content-pipeline-base')
    assert.equal(saved.tables.content.recordOrder.length, 12)
    assert.deepEqual(saved.tables.content.viewOrder, ['grid', 'board', 'calendar'])
    assert.equal(saved.tables.content.records.r09.values.publishDate, null)
    assert.equal(await root.locator(':scope > button,:scope > output,:scope > header').count(), 0)
    await capture('cover')
    await fs.writeFile(
      path.join(directory, 'initial-dom.json'),
      JSON.stringify(await page.locator('body').evaluate((n) => n.innerHTML)),
    )
    await activate('board', 'Status board')
    await paint('Planned')
    await capture('native-board')
    await page.mouse.move(1100, 500)
    await page.mouse.wheel(1200, 0)
    await paint('Blocked')
    await paint('Security FAQ')
    await capture('native-board-right-lanes')
    const board = await projection('board')
    await fs.writeFile(path.join(directory, 'board-projection.json'), JSON.stringify(board, null, 2))
    await activate('calendar', 'Publishing calendar')
    await capture('native-calendar')
    const calendar = await projection('calendar')
    await fs.writeFile(path.join(directory, 'calendar-projection.json'), JSON.stringify(calendar, null, 2))
    assert.equal(calendar.events.length, 11)
    assert(!calendar.events.some((e) => e.recordId === 'r09'))
    assert.equal(calendar.events.find((e) => e.recordId === 'r03').startMs, 1788566400000)
    await paint('Partner webinar')
    await activate('grid', 'Editorial grid')
    await paint('Pricing launch page')
    await exact('view-switch-preserves-complete-model', saved, await snapshot())
  })
  await gate('native-title-input-full-history', async () => {
    await fresh()
    const before = await snapshot(),
      p = await textPoint('Pricing launch page')
    await page.mouse.dblclick(p.x + 35, p.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Pricing launch page — legal approved')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('content-pipeline-base')
          .getTableById('content')
          .getRecordById('r01')
          .getValue('asset') === 'Pricing launch page — legal approved',
    )
    const edited = await snapshot()
    await capture('native-title-edited')
    await page.keyboard.press('Control+z')
    await settle()
    await exact('native-title-undo', before, await snapshot())
    await page.keyboard.press('Control+y')
    await settle()
    await exact('native-title-redo', edited, await snapshot())
  })
  await gate('native-add-record-drawer', async () => {
    await fresh()
    const before = await snapshot()
    await page.getByRole('button', { name: 'Add Record', exact: true }).click()
    const drawer = page.locator('[data-u-comp=base-record-detail-drawer]')
    await drawer.waitFor()
    await fs.writeFile(
      path.join(directory, 'native-add-drawer-dom.json'),
      JSON.stringify(await drawer.evaluate((n) => n.outerHTML)),
    )
    await drawer.locator('[data-field-type=text]').first().click()
    const editor = drawer.locator('textarea,input').filter({ visible: true })
    await editor.first().fill('Launch office-hours recap')
    await drawer.locator('[data-u-comp=base-record-detail-footer] button').first().click()
    await page.waitForFunction(() =>
      window.univerAPI
        .getBase('content-pipeline-base')
        .getTableById('content')
        .getRecords()
        .some((r) => r.getValue('asset') === 'Launch office-hours recap'),
    )
    const added = await snapshot()
    assert.equal(added.tables.content.recordOrder.length, 13)
    await capture('native-added-record')
    await page.getByRole('button', { name: 'Undo', exact: true }).click()
    await settle()
    await exact('native-add-undo', before, await snapshot())
    await page.getByRole('button', { name: 'Redo', exact: true }).click()
    await settle()
    await exact('native-add-redo', added, await snapshot())
  })
  await gate('native-status-transition-across-board', async () => {
    await fresh()
    const before = await snapshot(),
      row = await textPoint('Pricing launch page'),
      status = await textPoint('In review')
    await page.mouse.dblclick(status.x + 30, row.y - 4)
    await page.getByText('Scheduled', { exact: true }).last().click()
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('content-pipeline-base')
          .getTableById('content')
          .getRecordById('r01')
          .getValue('status') === 'Scheduled',
    )
    const changed = await snapshot()
    await capture('native-status-selected')
    await page.keyboard.press('Escape')
    await activate('board', 'Status board')
    await paint('Scheduled')
    await capture('native-status-board')
    await fs.writeFile(
      path.join(directory, 'moved-board-projection.json'),
      JSON.stringify(await projection('board'), null, 2),
    )
    await activate('grid', 'Editorial grid')
    await page.keyboard.press('Control+z')
    await settle()
    await exact('native-status-undo', before, await snapshot())
    await page.keyboard.press('Control+y')
    await settle()
    await exact('native-status-redo', changed, await snapshot())
    await fs.writeFile(
      path.join(directory, 'status-history-focus.json'),
      JSON.stringify(
        await page.evaluate(() => ({
          focus: document.activeElement?.outerHTML,
          selection: window.univerAPI.getBaseUI().getSelection(),
        })),
        null,
        2,
      ),
    )
    const focus = await textPoint('Pricing launch page')
    await page.mouse.click(focus.x + 30, focus.y - 4)
    await page.getByRole('button', { name: 'Undo', exact: true }).click()
    await settle()
    await exact('native-status-focused-toolbar-undo', before, await snapshot())
    await page.getByRole('button', { name: 'Redo', exact: true }).click()
    await settle()
    await exact('native-status-focused-toolbar-redo', changed, await snapshot())
  })
  await gate('native-kanban-card-drag-full-history', async () => {
    await fresh()
    await activate('board', 'Status board')
    await paint('Migration playbook')
    const before = await snapshot(),
      from = await textPoint('Migration playbook'),
      column = await textPoint('In review')
    const to = { x: column.x + 120, y: column.y + 480 }
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 12 })
    await page.mouse.up()
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('content-pipeline-base')
          .getTableById('content')
          .getRecordById('r02')
          .getValue('status') === 'In review',
    )
    assert((await projection('board')).lanes.find((l) => l.key === 'In review').recordIds.includes('r02'))
    const changed = await snapshot()
    await capture('native-kanban-dragged')
    await page.keyboard.press('Control+z')
    await settle()
    await exact('kanban-drag-undo', before, await snapshot())
    await page.keyboard.press('Control+y')
    await settle()
    await exact('kanban-drag-redo', changed, await snapshot())
  })
  await gate('native-calendar-weekday-label-integrity', async () => {
    await fresh()
    await September()
    await capture('native-calendar-september')
    const evidence = await page.evaluate(() => {
      const headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((text) =>
        window.paintPoints.findLast((point) => point.text === text),
      )
      const event = window.paintPoints.findLast((p) => p.text === 'Partner webinar')
      const column = headers.findLastIndex((point) => event.x >= point.x)
      const timestamp = window.univerAPI
        .getBase('content-pipeline-base')
        .getTableById('content')
        .getRecordById('r03')
        .getValue('publishDate')
      return {
        headers,
        event,
        paintedWeekday: headers[column]?.text,
        expectedWeekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(timestamp).getUTCDay()],
        timestamp,
        date: new Date(timestamp).toISOString(),
      }
    })
    await fs.writeFile(path.join(directory, 'calendar-weekday-label.json'), JSON.stringify(evidence, null, 2))
    assert.equal(
      evidence.paintedWeekday,
      evidence.expectedWeekday,
      'Native calendar event must appear under its actual UTC weekday label',
    )
  })
  await gate('native-next-month-from-august-31', async () => {
    await fresh()
    await activate('calendar', 'Publishing calendar')
    await paint('Aug 2026')
    const point = await textPoint('>')
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(() =>
      [...window.framesByCanvas].some(([c, t]) => c.isConnected && t.some((s) => s === 'Sep 2026' || s === 'Oct 2026')),
    )
    const titles = await page.evaluate(() =>
      [...window.framesByCanvas]
        .filter(([c]) => c.isConnected)
        .flatMap(([, t]) => t)
        .filter((s) => /^(Sep|Oct) 2026$/.test(s)),
    )
    await capture('native-next-month')
    await fs.writeFile(
      path.join(directory, 'native-next-month.json'),
      JSON.stringify({ before: 'Aug 2026', after: titles }, null, 2),
    )
    assert(titles.includes('Sep 2026'), 'A single Next from August must open September, not skip to October')
  })
  await gate('native-calendar-date-drag-full-history', async () => {
    await fresh()
    await September()
    await paint('Partner webinar')
    const before = await snapshot(),
      from = await textPoint('Partner webinar'),
      day = await page.evaluate(() => window.paintPoints.findLast((p) => p.text === '6' && p.y > 120 && p.y < 250)),
      to = { x: day.x - 90, y: day.y + 60 }
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 12 })
    await page.mouse.up()
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('content-pipeline-base')
          .getTableById('content')
          .getViewById('calendar')
          .getProjection()
          .events.find((e) => e.recordId === 'r03').startMs === Date.UTC(2026, 8, 6),
    )
    assert.equal((await projection('calendar')).events.find((e) => e.recordId === 'r03').startMs, Date.UTC(2026, 8, 6))
    const changed = await snapshot()
    await capture('native-calendar-rescheduled')
    await fs.writeFile(
      path.join(directory, 'native-calendar-date-encoding.json'),
      JSON.stringify(
        {
          rawBefore: before.tables.content.records.r03.values.publishDate,
          rawAfter: changed.tables.content.records.r03.values.publishDate,
          event: (await projection('calendar')).events.find((e) => e.recordId === 'r03'),
        },
        null,
        2,
      ),
    )
    await page.keyboard.press('Control+z')
    await settle()
    await exact('calendar-drag-undo', before, await snapshot())
    await page.keyboard.press('Control+y')
    await settle()
    await exact('calendar-drag-redo', changed, await snapshot())
  })
  await gate('sixteen-literal-facade-examples', async () => {
    await fresh()
    let week, month
    for (let n = 0; n < examples.length; n++) {
      if (n === 15) {
        const downloadPromise = page.waitForEvent('download')
        await run(examples[n])
        const download = await downloadPromise
        const target = path.join(directory, download.suggestedFilename())
        await download.saveAs(target)
        await exact('download-complete-model', await snapshot(), JSON.parse(await fs.readFile(target, 'utf8')))
      } else await run(examples[n])
      await settle()
      report.checks.push({ literal: n + 1 })
      if (n === 4) assert.equal((await snapshot()).tables.content.records.r02.values.status, 'In review')
      if (n === 5)
        assert.equal(
          (await projection('calendar')).events.find((e) => e.recordId === 'r09').startMs,
          Date.UTC(2026, 8, 20),
        )
      if (n === 7) assert.equal((await snapshot()).tables.content.recordOrder.length, 13)
      if (n === 8)
        assert.deepEqual(
          (await projection('grid')).rows.map((r) => r.recordId),
          ['r04', 'r10'],
        )
      if (n === 10) {
        week = await snapshot()
        await capture('literal-calendar-week')
      }
      if (n === 11) {
        month = await snapshot()
        await capture('literal-calendar-month')
      }
      if (n === 12) await exact('literal-calendar-undo', week, await snapshot())
      if (n === 13) await exact('literal-calendar-redo', month, await snapshot())
    }
  })
  await gate(
    'complete-owner-recovery-fresh-edit-history',
    async () => {
      await fresh()
      await run(examples[4])
      await run(examples[5])
      await run(examples[7])
      await run(examples[14])
      const before = await snapshot()
      await run(restore)
      await ready()
      await exact('restored-complete-model', before, await snapshot())
      await activate('board', 'Status board')
      await paint('Planned')
      await capture('restored-board')
      await activate('calendar', 'Publishing calendar')
      await paint('Partner webinar')
      await capture('restored-calendar')
      await activate('grid', 'Editorial grid')
      await paint('Pricing launch page')
      const p = await textPoint('Pricing launch page')
      await page.mouse.dblclick(p.x + 30, p.y - 4)
      await page.keyboard.press('Control+A')
      await page.keyboard.type('Pricing page — post-restore review')
      await page.keyboard.press('Enter')
      await page.waitForFunction(
        () =>
          window.univerAPI
            .getBase('content-pipeline-base')
            .getTableById('content')
            .getRecordById('r01')
            .getValue('asset') === 'Pricing page — post-restore review',
      )
      const edited = await snapshot()
      await capture('restored-native-edit')
      await page.keyboard.press('Control+z')
      await settle()
      await exact('restored-fresh-undo', before, await snapshot())
      await page.keyboard.press('Control+y')
      await settle()
      await exact('restored-fresh-redo', edited, await snapshot())
    },
    true,
  )
  await gate('complete-locales-theme-and-source-css', async () => {
    await fresh()
    await run(examples[4])
    const before = await snapshot()
    await page.evaluate(() => (window.ownerAPI = window.univerAPI))
    const source = (await readShowcaseSources()).find((s) => s.slug === report.slug),
      factory = source.files['/src/create-demo.ts']
    assert.equal(Object.keys(source.files).length, 9)
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 5)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((localeCode) => window.univerAPI.setLocale(localeCode), code)
      for (const [, prefix] of packs)
        pack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) {
        await page.evaluate((enabled) => window.univerAPI.toggleDarkMode(enabled), dark)
        await settle()
        assert(await page.evaluate(() => window.ownerAPI === window.univerAPI))
        await exact('theme-' + code + '-' + dark, before, await snapshot())
      }
    }
    assert.equal([...factory.matchAll(/import '@[^']+\/lib\/index.css'/g)].length, 4)
    await capture('zh-edited-same-owner')
  })
  await gate(
    'initial-zh-invalid-and-pre-ready-disposal',
    async () => {
      await page.evaluate(async () => {
        const api = window.univerAPI,
          saved = api.getBase('content-pipeline-base').save()
        let rejected = false
        try {
          window.createDemo(window.container, false, undefined, { ...saved, id: '' })
        } catch {
          rejected = true
        }
        if (!rejected || window.univerAPI !== api) throw new Error('Invalid checkpoint touched the owner')
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        const pending = window.createDemo(window.container)
        pending.dispose()
        pending.dispose()
        await pending.ready
        if (window.univerAPI || document.querySelector('.content-pipeline')) throw new Error('Pre-ready owner leaked')
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
      await capture('initial-zh')
    },
    true,
  )
  report.passed =
    Object.values(report.gates).every((g) => g.passed) &&
    !report.knownIssues.length &&
    !report.errors.length &&
    !report.backendRequests.length
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
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
