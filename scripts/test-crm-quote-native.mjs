/* eslint-disable no-await-in-loop -- One selected native document, tested in documented edit order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/crm-quote-native')
await fs.mkdir(output, { recursive: true })
const report = { passed: false, gates: {}, errors: [], warnings: [], backendRequests: [] }
function pack(actual, expected, prefix = '') {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') pack(actual?.[key], value, prefix + key + '.')
    else assert.deepEqual(actual?.[key], value, prefix + key)
  }
}
const source = (await readShowcaseSources()).find((item) => item.slug === 'embed/crm-quote-calculator')
const examples = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1])
assert.equal(examples.length, 14)
const project = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-crm-quote-native-'))
for (const [name, content] of Object.entries(source.files)) {
  const file = path.join(project, name.slice(1))
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, content)
  assert.equal(await fs.readFile(file, 'utf8'), content)
}
const pkg = JSON.parse(source.files['/package.json'])
const vite =
  process.env.SHOWCASE_VITE_PACKAGE || 'C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
report.dependencies = {}
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  const installed = name === 'vite' ? vite : path.resolve('node_modules', name)
  assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version, name)
  const target = path.join(project, 'node_modules', name)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.symlink(await fs.realpath(installed), target, 'junction')
  report.dependencies[name] = version
}
await fs.writeFile(
  path.join(output, 'exports.json'),
  JSON.stringify([{ slug: source.slug, directory: project }], null, 2),
)
const { build, preview } = await import(pathToFileURL(path.join(vite, 'dist/node/index.js')))
let server, browser
try {
  await build({ configFile: false, root: project, logLevel: 'warn' })
  server = await preview({
    configFile: false,
    root: project,
    preview: { host: '127.0.0.1', port: 4408, strictPort: true },
  })
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1600, height: 1050 }, colorScheme: 'light' })
  page.setDefaultTimeout(12000)
  page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
    if (message.type() === 'warning') report.warnings.push(message.text())
  })
  page.on('request', (request) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
      request.url().includes('/universer-api/') ||
      (['xhr', 'fetch'].includes(request.resourceType()) &&
        !['localhost', '127.0.0.1'].includes(new URL(request.url()).hostname))
    )
      report.backendRequests.push(request.url())
  })
  page.on('websocket', (socket) => report.backendRequests.push(socket.url()))
  await page.addInitScript(() => {
    window.quoteFrames = new Map()
    const fill = CanvasRenderingContext2D.prototype.fillText
    const clear = CanvasRenderingContext2D.prototype.clearRect
    const draw = CanvasRenderingContext2D.prototype.drawImage
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      const texts = window.quoteFrames.get(this.canvas) || []
      texts.push(String(args[0]))
      window.quoteFrames.set(this.canvas, texts.slice(-50000))
      return Reflect.apply(fill, this, args)
    }
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      window.quoteFrames.set(this.canvas, [])
      return Reflect.apply(clear, this, args)
    }
    CanvasRenderingContext2D.prototype.drawImage = function (imageSource, ...args) {
      if (imageSource !== this.canvas)
        window.quoteFrames.set(
          this.canvas,
          [...(window.quoteFrames.get(this.canvas) || []), ...(window.quoteFrames.get(imageSource) || [])].slice(
            -50000,
          ),
        )
      return Reflect.apply(draw, this, [imageSource, ...args])
    }
  })

  const root = page.locator('.crm-quote')
  const apply = root.locator('[data-action=apply]')
  const sync = root.locator('[data-action=sync]')
  const input = (name) => root.locator('[name="' + name + '"]')
  const snapshot = () => page.evaluate(() => window.univerAPI.getWorkbook('embedded-quote-calculator').save())
  const state = () =>
    page.evaluate(() => {
      const sheet = window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
      return {
        inputs: sheet.getRange('A4:G4').getRawValues()[0],
        values: ['E4', 'E11'].map((cell) => sheet.getRange(cell).getRawValue()),
        displays: ['E4', 'E11'].map((cell) => sheet.getRange(cell).getDisplayValue()),
        formulas: ['E4', 'E8', 'E9', 'E11'].map((cell) => sheet.getRange(cell).getFormulas()[0][0]),
      }
    })
  const ready = () => root.locator('fieldset:not([disabled])').waitFor()
  const settle = () =>
    page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
  const run = (n) => page.evaluate('(async()=>{\n' + examples[n - 1] + '\n})()')
  async function totals(subscription, contract, paint = true) {
    await page.waitForFunction(
      ([a, b]) => {
        const sheet = window.univerAPI.getWorkbook('embedded-quote-calculator')?.getSheetBySheetId('quote')
        return (
          [a, b].every((expected, i) => Math.abs(sheet?.getRange(i ? 'E11' : 'E4').getRawValue() - expected) < 1e-8) &&
          document.querySelector('.crm-quote').dataset.ready === 'true' &&
          !document.querySelector('.crm-quote fieldset').disabled &&
          ['Subscription subtotal', 'First-year contract'].every(
            (label, i) =>
              document.querySelector('output[aria-label="' + label + '"]').textContent ===
              sheet.getRange(i ? 'E11' : 'E4').getDisplayValue(),
          )
        )
      },
      [subscription, contract],
    )
    if (paint) {
      const expected = (await state()).displays
      await page.waitForFunction((texts) => {
        const canvases = [...document.querySelectorAll('.quote-editor canvas')].filter((c) => {
          const r = c.getBoundingClientRect()
          return r.width > 300 && r.height > 200
        })
        const painted = new Set(canvases.flatMap((c) => window.quoteFrames.get(c) || []))
        return texts.every((text) => painted.has(text))
      }, expected)
    }
  }
  async function fresh() {
    await page.goto('http://127.0.0.1:4408/', { waitUntil: 'load' })
    await ready()
    await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
    await page.locator('[data-u-comp=workbench-skeleton-content]').waitFor({ state: 'detached' })
    await totals(16220.16, 20810.16)
    await settle()
  }
  async function gate(name, check) {
    try {
      await check()
      report.gates[name] = { passed: true }
    } catch (error) {
      report.gates[name] = { passed: false, failure: error.stack }
      await page.screenshot({ path: path.join(output, name + '-failure.png') }).catch(() => {})
    }
  }
  async function fillDraft(values) {
    for (const [name, value] of Object.entries(values))
      if (['plan', 'currency'].includes(name)) await input(name).selectOption(value)
      else await input(name).fill(String(value))
  }
  await fresh()
  const baseline = await snapshot()
  await gate('native-grid-two-host-actions-source-parity', async () => {
    assert.equal(Object.keys(source.files).length, 9)
    assert.deepEqual(await root.locator('.quote-sidebar button').allTextContents(), [
      'Apply host inputs',
      'Read sheet into form',
    ])
    assert.equal(await root.locator('details, pre, [name=fixture]').count(), 0)
    assert.equal(await apply.isDisabled(), true)
    assert.equal(await sync.isDisabled(), true)
    assert.deepEqual((await state()).formulas, ['=B4*C4*12*(1-D4)*G4', '=B8*C8*$G$4', '=B9*C9*$G$4', '=E4+SUM(E8:E9)'])
    const previewCode = await fs.readFile('showcase/embed/crm-quote-calculator/preview/main.tsx', 'utf8')
    assert.match(previewCode, /demoRef.current\?\.univerAPI.toggleDarkMode/)
    assert.doesNotMatch(previewCode, /<button|<output|resetKey/)
    await page.screenshot({ path: path.join(output, 'baseline.png') })
  })
  for (const [n, a, b] of [
    [1, 16220.16, 20810.16],
    [2, 19837.44, 24427.44],
    [3, 19837.44, 25297.44],
    [4, 18250.4448, 23273.6448],
    [5, 18250.4448, 23273.6448],
    [6, 0, 5023.2],
    [7, 0, 0],
    [8, 0, 688500],
  ])
    await gate('literal-' + n, async () => {
      await run(n)
      await totals(a, b)
    })
  await gate('literal-9-native-error-no-cached-total', async () => {
    await run(9)
    await page.waitForFunction(() => document.querySelector('.crm-quote').dataset.state === 'error')
    const result = await state()
    assert.deepEqual(result.values, ['#VALUE!', '#VALUE!'])
    assert.equal(await root.getByRole('alert').isVisible(), true)
    assert.equal(await root.locator('output[aria-label="First-year contract"]').textContent(), '#VALUE!')
    await page.screenshot({ path: path.join(output, 'native-error.png') })
  })
  for (const n of [10, 11, 12])
    await gate('literal-' + n, async () => {
      await run(n)
      await totals(16220.16, 20810.16)
      assert.deepEqual(
        (await state()).displays,
        n === 11 ? ['$16,220.160', '$20,810.160'] : ['$16,220.16', '$20,810.16'],
      )
    })
  await gate('literal-13-complete-json-download', async () => {
    const before = await snapshot()
    const event = page.waitForEvent('download')
    await run(13)
    const download = await event
    assert.equal(download.suggestedFilename(), 'northstar-quote.json')
    assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), before)
  })
  await gate('literal-14-full-snapshot-reconstruction', async () => {
    const before = await snapshot()
    await run(14)
    await totals(16220.16, 20810.16)
    report.beforeReload = before
    report.afterReload = await snapshot()
    assert.deepEqual(report.afterReload, before)
    await run(2)
    await totals(19837.44, 24427.44)
  })
  await fresh()
  await gate('host-eur-six-inputs-and-formulas', async () => {
    await fillDraft({ plan: 'Starter', seats: 15, monthlyRate: 19.5, discount: 7.5, currency: 'EUR' })
    assert.equal(await input('fx').inputValue(), '0.92')
    assert.deepEqual(await snapshot(), baseline, 'Draft alone must not change the workbook')
    await apply.click()
    await totals(2987.01, 7209.81)
    assert.equal(await apply.isDisabled(), true)
    assert.equal(await sync.isDisabled(), true)
    await page.screenshot({ path: path.join(output, 'eur-host-quote.png') })
  })
  await gate('host-jpy-custom-fx-and-display', async () => {
    await fillDraft({ currency: 'JPY', fx: 150.5 })
    await apply.click()
    await totals(488635.875, 1179430.875)
    assert.deepEqual((await state()).displays, ['¥488,636', '¥1,179,431'])
  })
  await gate('invalid-host-inputs-before-any-write', async () => {
    await fresh()
    for (const [name, value] of [
      ['seats', ''],
      ['seats', '-1'],
      ['seats', '1.5'],
      ['seats', '1000001'],
      ['monthlyRate', '-1'],
      ['monthlyRate', '1.001'],
      ['monthlyRate', '1000001'],
      ['discount', '101'],
      ['discount', '-1'],
      ['discount', '1.001'],
      ['fx', '0'],
      ['fx', '-1'],
      ['fx', '1000001'],
    ]) {
      const initial = await input(name).inputValue()
      const before = await snapshot()
      await input(name).fill(value)
      await apply.click()
      assert.equal(await root.getByRole('alert').isVisible(), true, name + value)
      assert.match(await root.getByRole('alert').textContent(), /No workbook values were written/)
      assert.deepEqual(await snapshot(), before, name + value)
      await input(name).fill(initial)
    }
    for (const name of ['plan', 'currency']) {
      const before = await snapshot()
      await input(name).evaluate((select) => select.add(new Option('Unsupported', 'unsupported')))
      await input(name).selectOption('unsupported')
      await apply.click()
      assert.match(await root.getByRole('alert').textContent(), /supported product and currency/)
      assert.deepEqual(await snapshot(), before)
      await input(name).selectOption(name === 'plan' ? 'Business' : 'USD')
    }
  })
  await fresh()
  await gate('native-cell-edit-preserves-unapplied-draft', async () => {
    await input('seats').fill('120')
    report.nativeBefore = await snapshot()
    const canvas = root
      .locator('canvas[data-u-comp="render-canvas"]:not(#univer-doc-main-canvas):visible')
      .filter({ visible: true })
      .first()
    await canvas.dblclick({ position: { x: 46 + 200 + 45, y: 20 + 3 * 24 + 12 } })
    await page.keyboard.press('Control+a')
    await page.keyboard.insertText('60')
    await page.keyboard.press('Enter')
    await totals(20275.2, 24865.2)
    assert.equal(await input('seats').inputValue(), '120')
    report.nativeEdited = await snapshot()
    assert.equal(report.nativeEdited.sheets.quote.cellData[3][1].v, 60)
    await page.screenshot({ path: path.join(output, 'native-seats-draft.png') })
  })
  await gate('native-complete-undo', async () => {
    assert.ok(report.nativeEdited)
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await totals(16220.16, 20810.16)
    report.nativeUndo = await snapshot()
    assert.deepEqual(report.nativeUndo, report.nativeBefore)
  })
  await gate('native-complete-redo', async () => {
    assert.ok(report.nativeEdited)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await totals(20275.2, 24865.2)
    report.nativeRedo = await snapshot()
    assert.deepEqual(report.nativeRedo, report.nativeEdited)
  })
  await gate('explicit-readback-is-read-only', async () => {
    const before = await snapshot()
    await sync.click()
    assert.equal(await input('seats').inputValue(), '60')
    assert.deepEqual(await snapshot(), before)
    assert.equal(await sync.isDisabled(), true)
  })
  await fresh()
  await gate('different-active-tab-does-not-retarget-host', async () => {
    await page.evaluate(() => {
      const book = window.univerAPI.getWorkbook('embedded-quote-calculator')
      const other = book.insertSheet('Other work', { sheet: { id: 'other-work' } })
      other.getRange('A4').setValue('Do not change this tab')
      book.setActiveSheet(other)
      book.getSheetBySheetId('quote').setName('Reviewed quote')
    })
    const other = await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('embedded-quote-calculator')
        .getSheetBySheetId('other-work')
        .getRange('A1:G12')
        .getRawValues(),
    )
    await input('seats').fill('60')
    await apply.click()
    await totals(20275.2, 24865.2, false)
    assert.deepEqual(
      await page.evaluate(() =>
        window.univerAPI
          .getWorkbook('embedded-quote-calculator')
          .getSheetBySheetId('other-work')
          .getRange('A1:G12')
          .getRawValues(),
      ),
      other,
    )
    await page.evaluate(() => window.univerAPI.getWorkbook('embedded-quote-calculator').setActiveSheet('quote'))
    await totals(20275.2, 24865.2)
  })
  await fresh()
  await gate('source-missing-clears-results-and-same-id-repair', async () => {
    await page.evaluate(() => {
      const book = window.univerAPI.getWorkbook('embedded-quote-calculator')
      window.quoteRecovery = book.save()
      book.insertSheet('Remaining tab')
      book.deleteSheet('quote')
    })
    await root.getByText('Source unavailable', { exact: true }).first().waitFor()
    assert.equal(await root.locator('fieldset').evaluate((node) => node.disabled), true)
    assert.equal(await input('seats').isDisabled(), true)
    assert.equal(await root.locator('output[aria-label="First-year contract"]').textContent(), 'Source unavailable')
    await page.evaluate(() => {
      window.univerAPI.disposeUnit('embedded-quote-calculator')
      window.univerAPI.createWorkbook(window.quoteRecovery)
    })
    await totals(16220.16, 20810.16)
  })
  await fresh()
  await gate('full-locales-and-same-owner-theme-draft-preservation', async () => {
    await run(2)
    await totals(19837.44, 24427.44)
    await input('seats').fill('123')
    const before = await snapshot()
    await page.evaluate(() => {
      window.quoteOwner = window.univerAPI
    })
    report.hostThemes = []
    for (const [locale, native] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((value) => window.univerAPI.setLocale(value), native)
      pack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs/preset-sheets-core/locales/' + locale)).default,
      )
      for (const dark of [true, false]) {
        await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
        await settle()
        assert.deepEqual(await snapshot(), before)
        assert.equal(await page.evaluate(() => window.univerAPI === window.quoteOwner), true)
        assert.equal(await input('seats').inputValue(), '123')
        const color = await root.evaluate((node) => getComputedStyle(node).backgroundColor)
        assert.equal(color, dark ? 'rgb(16, 26, 52)' : 'rgb(255, 255, 255)')
        report.hostThemes.push({ locale, dark, color })
        await page.screenshot({ path: path.join(output, locale + (dark ? '-dark' : '-light') + '.png') })
      }
    }
  })
  await gate('responsive-host-actions-760-390-320', async () => {
    for (const width of [760, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.ok(await root.evaluate((node) => node.scrollWidth <= node.clientWidth + 1))
      await input('seats').fill('80')
      if (width === 760) await apply.click()
      await totals(27033.6, 31623.6, false)
      await input('seats').fill('90')
      await sync.click()
      assert.equal(await input('seats').inputValue(), '80')
      await page.screenshot({ path: path.join(output, 'width-' + width + '.png') })
    }
  })
  await gate('disposal-and-newer-global-owner', async () => {
    await page.evaluate(() => {
      window.newQuoteOwner = { marker: 'do-not-remove-newer-owner' }
      window.univerAPI = window.newQuoteOwner
      window.dispatchEvent(new Event('pagehide'))
      window.dispatchEvent(new Event('pagehide'))
    })
    await root.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => window.univerAPI === window.newQuoteOwner), true)
    assert.equal(await page.locator('[data-u-comp=workbench-layout]').count(), 0)
  })
  await gate('initial-chinese-pack-and-native-grid', async () => {
    await page.setViewportSize({ width: 1600, height: 1050 })
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
    pack(
      await page.evaluate(() => window.univerAPI.getLocales()),
      (await import('@univerjs/preset-sheets-core/locales/zh-CN')).default,
    )
    await page.screenshot({ path: path.join(output, 'initial-zh.png') })
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('no-backend-or-browser-errors', async () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.warnings, [])
    assert.deepEqual(report.backendRequests, [])
  })
  report.passed = Object.values(report.gates).every((result) => result.passed)
} catch (error) {
  report.failure = error.stack
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, gates: report.gates, failure: report.failure, output }, null, 2))
  await browser?.close()
  await server?.close()
}
if (!report.passed) process.exitCode = 1
