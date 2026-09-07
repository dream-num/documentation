/* eslint-disable no-await-in-loop -- Run the published examples in order against one native Base. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sable-native')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/bases/select-options/code/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 14)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
page.setDefaultTimeout(12000)
const report = { passed: false, checks: [], gates: {}, knownIssues: [], errors: [], warnings: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) || r.url().includes('/universer-api/'))
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.sablePaint = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const point = this.getTransform().transformPoint({ x: args[1], y: args[2] }),
      rect = this.canvas.getBoundingClientRect()
    if (rect.width && rect.height)
      window.sablePaint.push({
        text: String(args[0]),
        x: rect.x + (point.x * rect.width) / this.canvas.width,
        y: rect.y + (point.y * rect.height) / this.canvas.height,
      })
    if (window.sablePaint.length > 20000) window.sablePaint.splice(0, 10000)
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.base-options')
const snapshot = () => page.evaluate(() => window.univerAPI.getBase('sable-option-lab').save())
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const run = (code) => page.evaluate('(() => {\n' + code + '\n})()')
const paint = async (label) => {
  await page.evaluate(() => {
    window.sablePaint = []
  })
  const size = page.viewportSize()
  await page.setViewportSize({ width: size.width === 1600 ? 1598 : 1600, height: 1100 })
  await page.waitForFunction((text) => window.sablePaint.some((p) => p.text === text), label)
}
const chipPixels = async () => {
  await paint('Critical')
  return page.evaluate(() => {
    const title = window.sablePaint.findLast((p) => p.text === 'Map Lantern Cove rock pools')
    const point = window.sablePaint.findLast((p) => p.text === 'Critical' && Math.abs(p.y - title.y) < 5)
    const canvas = document.querySelector('.base-options-editor canvas'),
      rect = canvas.getBoundingClientRect()
    return Array.from(
      canvas
        .getContext('2d')
        .getImageData(
          Math.round(((point.x - rect.x - 4) * canvas.width) / rect.width),
          Math.round(((point.y - rect.y - 14) * canvas.height) / rect.height),
          45,
          22,
        ).data,
    )
  })
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
  }
  console.log('Sable ' + name + ' ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
function includesPack(actual, expected, prefix) {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') includesPack(actual?.[k], v, prefix + '.' + k)
    else assert.equal(actual?.[k], v, prefix + '.' + k)
  }
}
try {
  await page.goto(
    process.env.SHOWCASE_DEMO_URL ||
      process.env.SHOWCASE_ORIGIN ||
      `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/bases/select-options`,
  )
  await root.locator(':scope').waitFor()
  await page.waitForFunction(() => document.querySelector('.base-options')?.dataset.ready === 'true')
  await paint('Map Lantern Cove rock pools')
  const initial = await snapshot()
  assert.deepEqual(initial.tableOrder, ['surveys', 'sites', 'samples'])
  assert.deepEqual(
    initial.tableOrder.map((id) => Object.keys(initial.tables[id].records).length),
    [30, 12, 18],
  )
  assert.equal(
    await root.locator(':scope > details, :scope > fieldset, :scope > output, [data-action], [data-input]').count(),
    0,
  )
  await root.screenshot({ path: path.join(directory, 'baseline.png') })
  report.checks.push('Original 60 records; no fixture, duplicate controls or audit panels')
  await gate('native-single-and-multi-pickers', async () => {
    for (const [label, choice, field, expected] of [
      ['High', 'Normal', 'priority', 'normal'],
      ['Rock pools', 'Shorebirds', 'habitats', ['rockpool', 'eelgrass', 'birds']],
    ]) {
      await paint(label)
      const before = await snapshot()
      const point = await page.evaluate((text) => {
        const title = window.sablePaint.findLast((p) => p.text === 'Map Lantern Cove rock pools')
        return window.sablePaint.findLast((p) => p.text === text && Math.abs(p.y - title.y) < 5)
      }, label)
      assert.ok(point)
      await page.mouse.dblclick(point.x + 10, point.y - 4)
      await page.getByText(choice, { exact: true }).last().click()
      await page.keyboard.press('Escape')
      await settle()
      const after = await snapshot()
      assert.deepEqual(after.tables.surveys.records['surveys-01'].values[field], expected)
      await page.evaluate(async () => {
        await window.univerAPI.undo()
      })
      await settle()
      assert.deepEqual(await snapshot(), before)
      await page.evaluate(async () => {
        await window.univerAPI.redo()
      })
      await settle()
      assert.deepEqual(await snapshot(), after)
      await page.evaluate(async () => {
        await window.univerAPI.undo()
      })
      await settle()
    }
  })
  for (let i = 0; i < examples.length; i++) {
    const beforeColor = i === 1 ? await chipPixels() : null
    await run(examples[i])
    await settle()
    const s = await snapshot(),
      config = s.tables.surveys.fields.priority.config,
      record = s.tables.surveys.records['surveys-01'].values
    assert.deepEqual(s.tables.sites, initial.tables.sites)
    assert.deepEqual(s.tables.samples, initial.tables.samples)
    assert.deepEqual(s.tables.surveys.recordOrder, initial.tables.surveys.recordOrder)
    if (i === 0) {
      assert.equal(config.options.find((x) => x.id === 'high').name, 'Critical')
      await paint('Critical')
    }
    if (i === 1) {
      assert.equal(config.options.find((x) => x.id === 'high').color, '#0f766e')
      assert.notDeepEqual(await chipPixels(), beforeColor, 'Native chip pixels change with the real option color')
    }
    if (i === 2) assert.equal(config.options.at(-1).id, 'high')
    if (i === 3) assert.equal(config.options.filter((x) => x.id === 'weather').length, 1)
    if (i === 4)
      assert.equal(
        config.options.some((x) => x.id === 'seasonal'),
        false,
      )
    if (i === 5) assert.equal(record.priority, 'weather')
    if (i === 6) assert.deepEqual(record.habitats, ['rockpool', 'dunes'])
    if (i === 7) assert.deepEqual(record.habitats, ['rockpool', 'dunes', 'birds'])
    if (i === 8) assert.deepEqual(record.habitats, ['rockpool', 'birds'])
    if (i === 9) assert.deepEqual(record.habitats, [])
    if (i === 10) assert.equal(record.priority, null)
    if (i === 11) {
      if (record.priority === 'retired-option-probe')
        report.knownIssues.push('Native raw setValue accepts unknown option ID; strict integrity acceptance fails.')
      else assert.equal(record.priority, null)
    }
    if (i === 12) assert.equal(record.priority, 'normal')
    report.checks.push({ example: i + 1, otherTablesPreserved: true })
  }
  await gate('complete-locales-and-whole-model-themes', async () => {
    const before = await snapshot()
    for (const [locale, key] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((k) => window.univerAPI.setLocale(k), key)
      const actual = await page.evaluate(() => window.univerAPI.getLocales())
      for (const name of [
        '@univerjs/design',
        '@univerjs/ui',
        '@univerjs/docs-ui',
        '@univerjs-pro/bases',
        '@univerjs-pro/bases-ui',
      ]) {
        const pack = (await import(name + '/locale/' + locale)).default
        includesPack(actual, pack, name)
      }
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.deepEqual(await snapshot(), before)
      }
      await paint('Normal')
      assert.doesNotMatch(await root.innerText(), /(?:bases-ui|shape-editor-ui)\.[\w.-]+/)
      await root.screenshot({ path: path.join(directory, locale + '.png') })
    }
  })
  await gate('active-owner-disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = !report.knownIssues.length && Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') })
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exitCode = 1
