/* eslint-disable no-await-in-loop -- Native permission/history transitions must run in user order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const exportManifest = 'test-results/read-only-native-export/manifest.json'
if (process.argv.includes('--prepare')) {
  const source = (await readShowcaseSources()).find((s) => s.slug === 'sheets/read-only')
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-read-only-native-'))
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(directory, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  const pkg = JSON.parse(source.files['/package.json'])
  const links = []
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const target =
      name === 'vite'
        ? 'C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
        : path.resolve('node_modules', name)
    const installed = JSON.parse(await fs.readFile(path.join(target, 'package.json'), 'utf8')).version
    assert.equal(installed, version)
    const destination = path.join(directory, 'node_modules', name)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.symlink(target, destination, 'junction')
    links.push({ name, version, target })
  }
  await fs.writeFile(
    path.join(directory, 'harness.html'),
    source.files['/index.html'].replace('/src/index.ts', '/src/harness.ts'),
  )
  await fs.writeFile(
    path.join(directory, 'src/harness.ts'),
    `import {createDemo} from './create-demo';
document.documentElement.style.height='100%';document.body.style.cssText='height:100%;margin:0';
const container=document.getElementById('app')!;container.style.height='100%';
let controller=createDemo(container);
window.readOnlyHarness={get controller(){return controller},create(saved,locale){controller=createDemo(container,false,locale,saved);return controller}};
window.addEventListener('pagehide',()=>controller.dispose(),{once:true});`,
  )
  await fs.writeFile(
    path.join(directory, 'vite.config.js'),
    `export default {build:{rollupOptions:{input:['index.html','harness.html']}}}`,
  )
  await fs.mkdir(path.dirname(exportManifest), { recursive: true })
  await fs.writeFile(
    exportManifest,
    JSON.stringify({ slug: source.slug, directory, links, sourceFiles: Object.keys(source.files).length }, null, 2),
  )
  console.log(directory)
  process.exit(0)
}

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/read-only-native')
await fs.mkdir(directory, { recursive: true })
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/sheets/read-only'
const harnessUrl = process.env.SHOWCASE_HARNESS_URL || new URL('/harness.html', url).href
const examples = [
  ...(await fs.readFile('showcase/sheets/read-only/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 13)
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
await context.grantPermissions(['clipboard-read', 'clipboard-write'])
await context.addInitScript(() => {
  window.tidePaint = []
  const draw = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.tidePaint.length < 200000) window.tidePaint.push(String(text))
    return draw.call(this, text, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(12000)
const report = { passed: false, url, harnessUrl, gates: {}, errors: [], requests: [], literals: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) || r.url().includes('/universer-api/'))
    report.requests.push(r.url())
})
const root = page.locator('.read-only-demo')
const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
const snapshot = () => page.evaluate(() => structuredClone(window.univerAPI.getActiveWorkbook().save()))
const read = () =>
  page.evaluate(() => {
    const w = window.univerAPI.getActiveWorkbook(),
      s = w.getActiveSheet()
    return {
      canEdit: w.getWorkbookPermission().canEdit(),
      selected: s.getActiveRange()?.getA1Notation(),
      values: s.getRange('A1:G7').getRawValues(),
      formulas: s.getRange('F4:F7').getFormulas(),
    }
  })
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const ready = async (mode = 'display') => {
  await page.locator('.read-only-demo[data-ready=true][data-mode=' + mode + ']').waitFor()
  await grid.waitFor()
  assert.equal(await root.locator('.read-only-editor').evaluate((e) => e.inert), false)
  await page.waitForFunction(
    () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('F4').getValue() !== null,
  )
  await settle()
}
const fresh = async (target = url) => {
  await page.goto(target)
  await ready()
}
const mode = async (next) => {
  await root.locator('[data-mode=' + next + ']').click()
  await ready(next)
}
const run = async (n) => {
  report.literals.push(n)
  return page.evaluate('(async()=>{' + examples[n - 1] + '})()')
}
const waitValue = async (v, a) => {
  await page.waitForFunction(
    (expected) => {
      const s = window.univerAPI.getActiveWorkbook().getActiveSheet()
      return s.getRange('E4').getValue() === expected.v && s.getRange('F4').getValue() === expected.a
    },
    { v, a },
  )
  await settle()
}
const booked = { x: 665, y: 104 }
const edit = async (value) => {
  await grid.click({ position: booked })
  await page.keyboard.press('F2')
  await page.keyboard.press('Control+a')
  await page.keyboard.type(String(value))
  await page.keyboard.press('Enter')
  await waitValue(value, 24 - value)
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await fs.writeFile(
      path.join(directory, name + '-actual.json'),
      JSON.stringify(await snapshot().catch(() => null), null, 2),
    )
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
}
function pack(actual, expected, prefix = '') {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual?.[k], v, prefix + k + '.')
    else assert.deepEqual(actual?.[k], v, prefix + k)
  }
}
try {
  if (process.argv[2])
    await gate('normal-selected-export-parity', async () => {
      const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
      const source = (await readShowcaseSources()).find((s) => s.slug === manifest.slug)
      assert.equal(manifest.slug, 'sheets/read-only')
      for (const [name, content] of Object.entries(source.files))
        assert.equal(await fs.readFile(path.join(manifest.directory, name.slice(1)), 'utf8'), content, name)
      report.export = manifest
    })
  await gate('original-native-timetable-hidden-chrome', async () => {
    await fresh()
    await waitValue(18, 6)
    const state = await read()
    assert.deepEqual(state.formulas, [['=D4-E4'], ['=D5-E5'], ['=D6-E6'], ['=D7-E7']])
    assert.deepEqual(
      state.values.slice(3).map((r) => [r[2], r[3], r[4], r[5], r[6]]),
      [
        ['A walk through the tides', 24, 18, 6, 'Open'],
        ['Build a coastal model', 12, 12, 0, 'Full'],
        ['Meet the field researchers', 30, 0, 30, 'Walk-in'],
        ['Harbor sketching', 16, 0, 16, 'Canceled'],
      ],
    )
    assert.equal(await root.locator('button[data-mode]').count(), 3)
    assert.equal(
      await root
        .locator('output,details,pre,[data-action],.read-only-editor [data-u-comp=ribbon-grid-toolbar]')
        .count(),
      0,
    )
    assert.equal(
      await root.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    assert.ok(await page.evaluate(() => window.tidePaint.join('').includes('Tide')))
    await root.screenshot({ path: path.join(directory, 'opening.png') })
  })
  await gate('display-native-selection-typing-delete-paste-shortcuts', async () => {
    await fresh()
    const before = await snapshot(),
      selection = (await read()).selected
    await grid.click({ position: booked })
    await page.keyboard.type('999')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Delete')
    await page.evaluate(() => navigator.clipboard.writeText('7'))
    await page.keyboard.press('Control+v')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowDown')
    await settle()
    assert.equal((await read()).selected, selection)
    assert.equal((await read()).canEdit, false)
    assert.deepEqual(await snapshot(), before)
  })
  await gate('selectable-native-selection-typing-delete-paste', async () => {
    await fresh()
    await mode('selectable')
    const before = await snapshot()
    await grid.click({ position: booked })
    assert.equal((await read()).selected, 'E4')
    await page.keyboard.type('999')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Delete')
    await page.evaluate(() => navigator.clipboard.writeText('7'))
    await grid.click({ position: booked })
    await page.keyboard.press('Control+v')
    await settle()
    assert.equal((await read()).canEdit, false)
    assert.deepEqual(await snapshot(), before)
    await page.keyboard.press('ArrowRight')
    assert.equal((await read()).selected, 'F4')
    await root.screenshot({ path: path.join(directory, 'selectable.png') })
  })
  await gate('editable-native-input-formula-complete-history', async () => {
    await fresh()
    await mode('editable')
    const before = await snapshot()
    await page.evaluate(() => (window.tidePaint = []))
    await edit(7)
    const edited = await snapshot()
    assert.ok(await page.evaluate(() => window.tidePaint.includes('7') && window.tidePaint.includes('17')))
    report.gates['native-edit-and-formula-glyphs'] = { passed: true }
    await root.screenshot({ path: path.join(directory, 'editable.png') })
    await page.keyboard.press('Control+z')
    await waitValue(18, 6)
    const undone = await snapshot()
    await fs.writeFile(path.join(directory, 'editable-undo-model.json'), JSON.stringify(undone, null, 2))
    await page.keyboard.press('Control+y')
    await waitValue(7, 17)
    await gate('editable-native-redo-complete-model', async () => assert.deepEqual(await snapshot(), edited))
    assert.deepEqual(undone, before)
  })
  await gate('viewer-undo-redo-guards-preserve-edits', async () => {
    await fresh()
    await mode('editable')
    await edit(7)
    await page.keyboard.press('Control+z')
    await waitValue(18, 6)
    await mode('selectable')
    const beforeRedo = await snapshot()
    await grid.click({ position: booked })
    await page.keyboard.press('Control+y')
    await settle()
    assert.deepEqual(await snapshot(), beforeRedo)
    assert.match(await root.locator('[role=status]').textContent(), /blocked/)
    await mode('editable')
    await grid.click({ position: booked })
    await page.keyboard.press('Control+y')
    await waitValue(7, 17)
    await mode('selectable')
    const beforeUndo = await snapshot()
    await grid.click({ position: booked })
    await page.keyboard.press('Control+z')
    await page.keyboard.press('Delete')
    await settle()
    assert.deepEqual(await snapshot(), beforeUndo)
    assert.match(await root.locator('[role=status]').textContent(), /blocked/)
  })
  await gate('editable-delete-real-clipboard-counterexample', async () => {
    await fresh()
    await mode('editable')
    await grid.click({ position: booked })
    await page.keyboard.press('Delete')
    await waitValue(null, 24)
    await page.evaluate(() => navigator.clipboard.writeText('7'))
    await page.keyboard.press('Control+v')
    await waitValue(7, 17)
  })
  await gate('mode-cycles-no-owner-replacement', async () => {
    await fresh()
    await page.evaluate(() => (window.tideOwner = window.univerAPI))
    await mode('editable')
    await edit(8)
    for (let i = 0; i < 3; i++) {
      await mode('display')
      const saved = await snapshot()
      await grid.click({ position: { x: 220, y: 128 } })
      await mode('selectable')
      await mode('editable')
      assert.deepEqual(await snapshot(), saved)
      assert.equal(await page.evaluate(() => window.tideOwner === window.univerAPI), true)
    }
  })
  await gate('literal-facade-13-examples', async () => {
    await fresh()
    for (let n = 1; n <= 13; n++) await run(n)
    assert.equal(new Set(report.literals).size, 13)
  })
  await gate('narrow-keyboard-controls-viewer-protection', async () => {
    for (const width of [760, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      await fresh()
      await root.locator('[data-mode=selectable]').focus()
      await page.keyboard.press('Enter')
      await ready('selectable')
      const before = await snapshot()
      await grid.click({ position: { x: 220, y: 104 } })
      await page.keyboard.type('Changed')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Delete')
      await settle()
      assert.deepEqual(await snapshot(), before)
      await root.screenshot({ path: path.join(directory, 'width-' + width + '.png') })
    }
    await page.setViewportSize({ width: 1440, height: 1100 })
  })
  await gate('complete-locales-same-owner-edited-themes', async () => {
    await fresh()
    await mode('editable')
    await edit(7)
    await page.evaluate(() => (window.tideOwner = window.univerAPI))
    const before = await snapshot()
    const factory = await fs.readFile('showcase/sheets/read-only/code/create-demo.ts', 'utf8')
    assert.equal([...factory.matchAll(/^import '@[^']+\/lib\/index.css'/gm)].length, 1)
    for (const [lang, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      pack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs/preset-sheets-core/locales/' + lang)).default,
      )
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.equal(await page.evaluate(() => window.tideOwner === window.univerAPI), true)
        assert.deepEqual(await snapshot(), before)
        await root.screenshot({ path: path.join(directory, lang + '-' + (dark ? 'dark' : 'light') + '.png') })
      }
    }
  })
  await gate('native-hidden-context-menu', async () => {
    await fresh()
    await grid.click({ position: booked, button: 'right' })
    await settle()
    assert.equal(await page.getByText('Copy', { exact: true }).filter({ visible: true }).count(), 0)
  })
  await gate('harness-invalid-mode-and-saved-input', async () => {
    await fresh(harnessUrl)
    const before = await snapshot()
    const result = await page.evaluate(() => {
      const h = window.readOnlyHarness
      const messages = []
      try {
        h.controller.setMode('unknown')
      } catch (e) {
        messages.push(e.message)
      }
      try {
        h.create({ id: '' })
      } catch (e) {
        messages.push(e.message)
      }
      return messages
    })
    assert.equal(result.length, 2)
    assert.deepEqual(await snapshot(), before)
    assert.equal(await root.count(), 1)
  })
  await gate('harness-same-id-complete-edited-recreation', async () => {
    await fresh(harnessUrl)
    await mode('editable')
    await edit(7)
    const before = await snapshot()
    await page.evaluate(async () => {
      const h = window.readOnlyHarness,
        saved = structuredClone(h.controller.univerAPI.getActiveWorkbook().save())
      await h.controller.dispose()
      await h.controller.dispose()
      window.tidePaint = []
      h.create(saved)
    })
    await ready()
    await waitValue(7, 17)
    assert.equal((await snapshot()).id, 'tide-museum')
    assert.ok(await page.evaluate(() => window.tidePaint.includes('7') && window.tidePaint.includes('17')))
    await root.screenshot({ path: path.join(directory, 'same-id-restored.png') })
    report.gates['same-id-restored-data-and-native-glyphs'] = { passed: true }
    assert.deepEqual(await snapshot(), before)
  })
  await gate('harness-pending-dispose-transition-guard', async () => {
    await fresh(harnessUrl)
    const actual = await page.evaluate(async () => {
      const h = window.readOnlyHarness,
        c = h.controller,
        editor = document.querySelector('.read-only-editor')
      const promise = c.setMode('editable'),
        pending = document.querySelector('.read-only-demo').dataset.ready
      const event = new KeyboardEvent('keydown', { key: '7', bubbles: true, cancelable: true })
      editor.dispatchEvent(event)
      const canceled = event.defaultPrevented
      const disposed = c.dispose()
      c.dispose()
      await promise
      await disposed
      return {
        pending,
        canceled,
        owner: typeof window.univerAPI,
        roots: document.querySelectorAll('.read-only-demo').length,
      }
    })
    assert.deepEqual(actual, { pending: 'false', canceled: true, owner: 'undefined', roots: 0 })
  })
  await gate('initial-chinese-native-and-three-controls', async () => {
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        if (document.documentElement) {
          document.documentElement.lang = 'zh-CN'
          observer.disconnect()
        }
      })
      observer.observe(document, { childList: true, subtree: true })
    })
    await fresh()
    assert.equal(await root.getByRole('button', { name: '仅展示', exact: true }).count(), 1)
    pack(
      await page.evaluate(() => window.univerAPI.getLocales()),
      (await import('@univerjs/preset-sheets-core/locales/zh-CN')).default,
    )
    await root.screenshot({ path: path.join(directory, 'initial-zh.png') })
  })
  await gate('no-runtime-errors-or-backend', async () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.requests, [])
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exitCode = 1
