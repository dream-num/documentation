/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/lumen-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/bases/create-base-and-tables/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 20)
const restore = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)][0][1]
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4366'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/bases/create-base-and-tables`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-lumen-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'bases/create-base-and-tables')
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
        name: 'lumen-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo} from '/src/create-demo.ts';import {createData} from '/src/data.ts';window.createDemo=createDemo;window.createData=createData;window.container=document.getElementById('app');window.demo=createDemo(window.container);
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4366, strictPort: true },
  })
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true })
page.setDefaultTimeout(15000)
const report = { passed: false, checks: [], gates: {}, knownIssues: [], errors: [], warnings: [], backendRequests: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
  if (message.type() === 'warning') report.warnings.push(message.text())
})
page.on('request', (request) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
    request.url().includes('/universer-api/') ||
    (['fetch', 'xhr'].includes(request.resourceType()) &&
      !['localhost', '127.0.0.1'].includes(new URL(request.url()).hostname))
  )
    report.backendRequests.push(request.url())
})
page.on('websocket', (socket) => report.backendRequests.push(socket.url()))
await page.addInitScript(() => {
  window.lumenFrames = new Map()
  const proto = CanvasRenderingContext2D.prototype,
    fill = proto.fillText,
    clear = proto.clearRect
  proto.clearRect = function (...args) {
    window.lumenFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  proto.fillText = function (...args) {
    const items = window.lumenFrames.get(this.canvas) || [],
      rect = this.canvas.getBoundingClientRect()
    const canvasPoint = this.getTransform().transformPoint({ x: args[1], y: args[2] })
    items.push({
      text: String(args[0]),
      x: rect.x + (canvasPoint.x * rect.width) / this.canvas.width,
      y: rect.y + (canvasPoint.y * rect.height) / this.canvas.height,
    })
    window.lumenFrames.set(this.canvas, items.slice(-20000))
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.base-lifecycle')
const run = (code) => page.evaluate('(async () => {\n' + code + '\n})()')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('lumen-base-lifecycle').save())))
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
async function ready() {
  await page.waitForFunction(
    () =>
      document.querySelector('.base-lifecycle')?.dataset.ready ||
      document.querySelector('.base-lifecycle')?.dataset.error,
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
async function paint(text) {
  await page.waitForFunction(
    (wanted) =>
      [...window.lumenFrames].some(
        ([canvas, items]) =>
          canvas.isConnected &&
          canvas.getBoundingClientRect().width > 300 &&
          items.some((item) => item.text === wanted),
      ),
    text,
  )
}
async function point(wantedText, wantedRow) {
  return page.evaluate(
    ({ text, sameRow }) => {
      const items = [...window.lumenFrames]
        .filter(([canvas]) => canvas.isConnected && canvas.getBoundingClientRect().width > 300)
        .flatMap(([, p]) => p)
      const row = sameRow && items.findLast((item) => item.text === sameRow)
      return items.findLast((item) => item.text === text && (!sameRow || (row && Math.abs(item.y - row.y) < 5)))
    },
    { text: wantedText, sameRow: wantedRow },
  )
}
async function gate(name, action, needsFactory = false) {
  if (needsFactory && !buildStandalone) {
    report.gates[name] = {
      passed: false,
      skipped: true,
      reason: 'Requires SHOWCASE_BUILD_STANDALONE=1 factory harness.',
    }
    return
  }
  try {
    await action()
    report.gates[name] = { passed: true }
  } catch (error) {
    report.gates[name] = { passed: false, failure: error.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
  console.log('Lumen ' + name + ' ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
function includesPack(actual, pack) {
  for (const [key, value] of Object.entries(pack))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
const named = (data, name) => Object.values(data.tables).find((table) => table.name === name)
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await paint('Foyer accessibility')
  const initial = await snapshot()
  assert.deepEqual(initial.tableOrder, ['projects', 'tasks', 'milestones'])
  assert.deepEqual(
    initial.tableOrder.map((id) => Object.keys(initial.tables[id].records).length),
    [12, 30, 18],
  )
  assert.equal(await root.locator('fieldset,output,[data-action],[data-input],.base-controls,iframe').count(), 0)
  assert.equal(await root.locator('[data-u-comp="base-workbench-layout"]').count(), 1)
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  )
  await root.screenshot({ path: path.join(directory, 'baseline.png') })
  report.checks.push('Original 3 tables, 60 records; native white workbench without fixture/control/audit panels')
  await gate('native-title-keyboard-and-exact-history', async () => {
    const p = await point('Foyer accessibility')
    assert.ok(p)
    await page.mouse.dblclick(p.x + 45, p.y - 5)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Foyer access / reviewed')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('lumen-base-lifecycle')
          .getTableById('projects')
          .getRecordById('projects-01')
          .getValue('title') === 'Foyer access / reviewed',
    )
    await paint('Foyer access / reviewed')
    const edited = await snapshot()
    await run('await window.univerAPI.undo()')
    assert.deepEqual(await snapshot(), initial)
    await run('await window.univerAPI.redo()')
    assert.deepEqual(await snapshot(), edited)
    await run('await window.univerAPI.undo()')
    assert.deepEqual(await snapshot(), initial)
  })
  await gate('native-sidebar-and-current-table-paint', async () => {
    for (const [name, id, text] of [
      ['Work packages', 'tasks', 'Measure foyer turning circle'],
      ['Acceptance milestones', 'milestones', 'Lighting bridge · site review'],
      ['Renovation projects', 'projects', 'Foyer accessibility'],
    ]) {
      await root.getByText(name, { exact: true }).click()
      await page.waitForFunction((tableId) => window.univerAPI.getBaseUI().getActiveTableId() === tableId, id)
      await paint(text)
    }
    assert.deepEqual(await snapshot(), initial)
  })
  await gate('native-person-picker-and-history', async () => {
    await run(examples[2])
    await paint('Foyer accessibility')
    const p =
      (await point('nia, imani', 'Foyer accessibility')) || (await point('Nia Park, Imani Cole', 'Foyer accessibility'))
    assert.ok(p, 'Locate the actual person cell on the first project row')
    const before = await snapshot()
    await page.mouse.dblclick(p.x + 10, p.y - 5)
    await page.getByText('Sora Chen', { exact: true }).last().click()
    await page.keyboard.press('Escape')
    await settle()
    const after = await snapshot()
    assert.deepEqual(after.tables.projects.records['projects-01'].values.owner, ['nia', 'imani', 'sora'])
    await run('await window.univerAPI.undo()')
    assert.deepEqual(await snapshot(), before)
    await run('await window.univerAPI.redo()')
    assert.deepEqual(await snapshot(), after)
    await run('await window.univerAPI.undo()')
    assert.deepEqual(await snapshot(), before)
  })
  await gate('native-person-display-names', async () => {
    await run(examples[2])
    const names = await page.evaluate(() => window.univerAPI.getBaseUI().getPersonOptions())
    assert.ok(names.some((person) => person.id === 'nia' && person.name === 'Nia Park'))
    await paint('Foyer accessibility')
    const raw = await point('nia, imani', 'Foyer accessibility')
    if (raw)
      report.knownIssues.push({
        gate: 'native-person-display-names',
        expected: 'Nia Park / Imani Cole',
        actual: raw,
        names,
      })
    assert.equal(raw, undefined, 'The current native Grid must paint directory display names, not stored IDs')
    assert.ok(
      await point('Nia Park, Imani Cole', 'Foyer accessibility'),
      'Visible display names are required; absence of raw IDs alone is not a pass',
    )
  })
  let beforeDelete, afterDelete
  for (let i = 0; i < examples.length; i++) {
    await gate('literal-' + String(i + 1).padStart(2, '0'), async () => {
      const before = await snapshot()
      const download = i === 18 ? page.waitForEvent('download') : null
      await run(examples[i])
      await settle()
      const after = await snapshot()
      for (const id of initial.tableOrder)
        assert.deepEqual(after.tables[id], initial.tables[id], 'Original table remains unchanged: ' + id)
      if (i <= 2)
        assert.equal(
          await page.evaluate(() => window.univerAPI.getBaseUI().getActiveTableId()),
          ['tasks', 'milestones', 'projects'][i],
        )
      if (i === 3) assert.equal(after.tables[after.tableOrder[0]].name, 'Arrival checks')
      if (i === 4)
        assert.equal(after.tables[after.tableOrder[after.tableOrder.indexOf('projects') + 1]].name, 'Access reviews')
      if (i === 5) {
        const t = named(after, 'Finish checklist')
        assert.equal(after.tableOrder.at(-1), t.id)
        assert.equal(t.recordOrder.length, 3)
        assert.deepEqual(
          t.recordOrder.map((id) => t.records[id].values[t.primaryFieldId]),
          ['Collect paint colour samples', 'Approve recycled timber finish', 'Publish volunteer shift handover'],
        )
      }
      if (i === 6) {
        const old = named(before, 'Finish checklist'),
          renamed = named(after, 'Finish and handover')
        assert.equal(renamed.id, old.id)
        assert.equal(renamed.formulaName, old.formulaName)
      }
      if (i === 7 || i === 8) {
        const source = named(after, 'Finish and handover'),
          copy = named(after, i === 7 ? 'Next season template' : 'Second-stage handover')
        assert.notEqual(copy.id, source.id)
        assert.ok(copy.viewOrder.every((id) => !source.viewOrder.includes(id)))
        assert.equal(copy.recordOrder.length, i === 7 ? 0 : 3)
        assert.deepEqual(copy.fields, source.fields)
        if (i === 8)
          assert.deepEqual(
            copy.recordOrder.map((id) => copy.records[id].values[copy.primaryFieldId]),
            source.recordOrder.map((id) => source.records[id].values[source.primaryFieldId]),
          )
      }
      if (i === 9) {
        const original = named(after, 'Finish and handover'),
          copy = named(after, 'Second-stage handover')
        assert.equal(
          original.records[original.recordOrder[0]].values[original.primaryFieldId],
          'Collect paint colour samples',
        )
        assert.equal(
          copy.records[copy.recordOrder[0]].values[copy.primaryFieldId],
          'Compare foyer colour samples in daylight',
        )
      }
      if (i === 10) await paint('Compare foyer colour samples in daylight')
      if (i === 11) {
        beforeDelete = before
        afterDelete = after
        assert.equal(named(after, 'Next season template'), undefined)
      }
      if (i === 12) assert.deepEqual(after, beforeDelete)
      if (i === 13) assert.deepEqual(after, afterDelete)
      if (i >= 14) assert.deepEqual(after, before)
      if (download) {
        const file = await download,
          target = path.join(directory, 'downloaded.base.json')
        assert.equal(file.suggestedFilename(), 'lumen-theatre.base.json')
        await file.saveAs(target)
        assert.deepEqual(JSON.parse(await fs.readFile(target, 'utf8')), after)
      }
      report.checks.push({ example: i + 1, passed: true })
    })
  }
  await gate('complete-english-packs-and-same-owner-themes', async () => {
    const before = await snapshot()
    await run('window.originalAPI = window.univerAPI')
    for (const locale of ['en-US']) {
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      for (const name of [
        '@univerjs/design',
        '@univerjs/ui',
        '@univerjs/docs-ui',
        '@univerjs-pro/bases',
        '@univerjs-pro/bases-ui',
      ])
        includesPack(
          await page.evaluate(() => window.univerAPI.getLocales()),
          (await import(name + '/locale/' + locale)).default,
        )
      for (const dark of [true, false]) {
        await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
        await settle()
        assert.deepEqual(await snapshot(), before)
        assert.equal(await page.evaluate(() => window.originalAPI === window.univerAPI), true)
      }
      assert.doesNotMatch(await root.innerText(), /(?:bases-ui|base.field|base.toolbar)\.[\w.-]+/)
      await paint('Foyer accessibility')
      await root.screenshot({ path: path.join(directory, locale + '.png') })
    }
  })
  await gate(
    'whole-owner-reconstruction-and-fresh-native-edit',
    async () => {
      await run(
        "const t=window.univerAPI.getBase('lumen-base-lifecycle').getTableByName('Second-stage handover'); await window.univerAPI.getBaseUI().activateTable(t.getId()); await window.univerAPI.getBaseUI().activateView(t.getViews()[0].getId())",
      )
      const before = await snapshot(),
        active = await page.evaluate(() => ({
          table: window.univerAPI.getBaseUI().getActiveTableId(),
          view: window.univerAPI.getBaseUI().getActiveViewId(),
        }))
      await run('window.oldRoot = document.querySelector(".base-lifecycle"); window.oldAPI = window.univerAPI')
      await run(restore)
      await ready()
      assert.deepEqual(await snapshot(), before)
      assert.deepEqual(
        await page.evaluate(() => ({
          table: window.univerAPI.getBaseUI().getActiveTableId(),
          view: window.univerAPI.getBaseUI().getActiveViewId(),
        })),
        active,
      )
      assert.equal(await page.evaluate(() => window.oldRoot.isConnected || window.oldAPI === window.univerAPI), false)
      await paint('Compare foyer colour samples in daylight')
      const p = await point('Compare foyer colour samples in daylight')
      await page.mouse.dblclick(p.x + 50, p.y - 5)
      await page.keyboard.press('Control+A')
      await page.keyboard.type('Daylight check / restored owner')
      await page.keyboard.press('Enter')
      await paint('Daylight check / restored owner')
      const edited = await snapshot()
      assert.notDeepEqual(edited, before)
      await run('await window.univerAPI.undo()')
      assert.deepEqual(await snapshot(), before)
      await fs.writeFile(path.join(directory, 'restored.base.json'), JSON.stringify(before, null, 2))
    },
    true,
  )
  await gate(
    'detached-checkpoint',
    async () => {
      const before = await snapshot()
      await page.evaluate(() => {
        window.checkpoint = JSON.parse(JSON.stringify(window.univerAPI.getBase('lumen-base-lifecycle').save()))
      })
      await run(
        "window.univerAPI.getBase('lumen-base-lifecycle').getTableById('projects').getRecordById('projects-02').setValue('budget', 4321)",
      )
      assert.notDeepEqual(await snapshot(), before)
      await page.evaluate(async () => {
        window.demo.dispose()
        window.demo = window.createDemo(window.container, false, 'enUS', window.checkpoint)
        await window.demo.ready
      })
      await ready()
      assert.deepEqual(await snapshot(), before)
      await run(examples[2])
      await paint('Foyer accessibility')
    },
    true,
  )
  await gate(
    'separate-empty-boundary-error-default',
    async () => {
      for (const state of ['empty', 'boundary', 'error', 'default']) {
        await page.evaluate(async (stateName) => {
          window.demo.dispose()
          window.demo = window.createDemo(window.container, false, 'enUS', window.createData(stateName))
          await window.demo.ready
        }, state)
        await ready()
        const data = await snapshot()
        if (state === 'empty') {
          assert.deepEqual(data.tableOrder, ['projects'])
          assert.equal(data.tables.projects.recordOrder.length, 0)
          await run(
            "window.univerAPI.getBase('lumen-base-lifecycle').getTableById('projects').addRecord({ title: 'First access review', budget: 0 })",
          )
          await paint('First access review')
        } else {
          assert.equal(
            Object.values(data.tables).reduce((n, table) => n + table.recordOrder.length, 0),
            60,
          )
          if (state === 'boundary') {
            assert.deepEqual(data.tableOrder, ['milestones', 'tasks', 'projects'])
            assert.equal(data.tables.projects.records['projects-01'].values.budget, 0)
            assert.equal(data.tables.projects.records['projects-12'].values.budget, 999999.99)
            assert.equal(await page.evaluate(() => window.univerAPI.getBaseUI().getActiveTableId()), 'milestones')
            await paint('Lighting bridge · site review')
          }
          if (state === 'error') {
            await run(examples[14])
            assert.deepEqual(await snapshot(), data)
          }
        }
        report.checks.push({ dataVariant: state, passed: true })
      }
      assert.deepEqual(await snapshot(), initial)
    },
    true,
  )
  await gate(
    'invalid-restore-keeps-current-owner',
    async () => {
      const before = await snapshot()
      for (const kind of ['identity', 'empty', 'missing']) {
        const result = await page.evaluate((probeKind) => {
          const saved = structuredClone(window.univerAPI.getBase('lumen-base-lifecycle').save()),
            api = window.univerAPI
          if (probeKind === 'identity') saved.id = 'another-base'
          if (probeKind === 'empty') saved.tableOrder = []
          if (probeKind === 'missing') saved.tableOrder.push('missing-table')
          let message
          try {
            window.createDemo(window.container, false, 'enUS', saved)
          } catch (error) {
            message = error.message
          }
          return {
            message,
            ownerPreserved: window.univerAPI === api,
            roots: document.querySelectorAll('.base-lifecycle').length,
          }
        }, kind)
        assert.match(result.message, /original Lumen Base/)
        assert.equal(result.ownerPreserved, true)
        assert.equal(result.roots, 1)
        assert.deepEqual(await snapshot(), before)
      }
    },
    true,
  )
  await gate(
    'active-and-pre-ready-disposal',
    async () => {
      await page.evaluate(() => {
        window.demo.dispose()
        window.demo.dispose()
      })
      assert.equal(await root.count(), 0)
      assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
      await page.evaluate(async () => {
        const early = window.createDemo(window.container)
        early.dispose()
        await early.ready
      })
      assert.equal(await root.count(), 0)
      assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    },
    true,
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = !report.knownIssues.length && Object.values(report.gates).every((g) => g.passed)
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
