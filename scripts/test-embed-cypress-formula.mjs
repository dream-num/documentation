/* eslint-disable no-await-in-loop -- Exercise published snippets in order against one native owner. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-cypress-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/docs-in-sheets-formula-tab/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 23)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1120 } })
page.setDefaultTimeout(12000)
const report = { passed: false, checks: [], gates: {}, knownIssues: [], errors: [], warnings: [], backendRequests: [] }
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
  window.docFrames = new Map()
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect
  const drawImage = CanvasRenderingContext2D.prototype.drawImage
  // The native document renderer caches text on offscreen canvases before composition.
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const texts = window.docFrames.get(this.canvas) || []
    // Preserve repeated letters. A self-copy must not concatenate its own log;
    // retain only recent paint records when cache composition repeats a frame.
    if (source !== this.canvas) {
      window.docFrames.set(this.canvas, texts.concat(window.docFrames.get(source) || []).slice(-50000))
    }
    return Reflect.apply(drawImage, this, [source, ...args])
  }
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.docFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const frame = window.docFrames.get(this.canvas) || []
    frame.push(String(args[0]))
    if (frame.length > 50000) frame.splice(0, frame.length - 50000)
    window.docFrames.set(this.canvas, frame)
    return Reflect.apply(fill, this, args)
  }
})

const root = page.locator('.cypress-embed')
const tab = (name) => page.getByText(name, { exact: true })
// Execute the exact published body without returning a live Facade graph.
const run = (literal) => page.evaluate('(() => {\n' + literal + '\n})()')
const snapshot = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        host: window.univerAPI.getWorkbook('cypress-cash-forecast').save(),
        doc: window.univerAPI.getDocument('cypress-forecast-notebook').save(),
      }),
    ),
  )
const results = () =>
  page.evaluate(() =>
    window.univerAPI
      .getDocument('cypress-forecast-notebook')
      .getFormulas()
      .map((f) => f.getResult()),
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
function expected({
  opening = 4000,
  subscriptions = 8500,
  projects = 4000,
  paper = 4300,
  printing = 3500,
  freight = 2000,
  floor = 5000,
  rate = 0.75,
} = {}) {
  const income = subscriptions + (typeof projects === 'number' ? projects : 0),
    out = paper + printing + freight
  const close = opening + income - out,
    validRate = typeof rate === 'number',
    timing = validRate ? opening + income * rate - out : '#VALUE!'
  return [
    opening,
    income,
    out,
    income - out,
    close,
    floor,
    close - floor,
    rate,
    timing,
    validRate ? timing - floor : '#VALUE!',
    validRate ? income * (1 - rate) : '#VALUE!',
    out ? income / out : '#DIV/0!',
    validRate ? (timing >= floor ? 'Timing buffer covered' : 'Confirm collection dates') : '#VALUE!',
  ]
}
const baseline = expected()
const scenarios = [
  expected({ projects: 4500 }),
  expected({ projects: 4500, rate: 0.9 }),
  expected({ projects: 4500, rate: 0.9, floor: 6500 }),
  expected({ projects: 4500, rate: 0.9, floor: 6500, paper: 4800 }),
  expected({ projects: 4500, rate: 0.9, floor: 6500, paper: 4800, opening: 5000 }),
  expected({ projects: 4500, rate: 0, floor: 6500, paper: 4800, opening: 5000 }),
  expected({ projects: 4500, rate: 1, floor: 6500, paper: 4800, opening: 5000 }),
  expected({ projects: null, rate: 1, floor: 6500, paper: 4800, opening: 5000 }),
  expected({ projects: 0, rate: 1, floor: 6500, paper: 4800, opening: 5000 }),
  expected({ projects: 'pending', rate: 1, floor: 6500, paper: 4800, opening: 5000 }),
  baseline,
  expected({ paper: 0, printing: 0, freight: 0 }),
  baseline,
  expected({ rate: 'pending' }),
  baseline,
  baseline,
  expected({ freight: 2200 }),
  null,
  expected({ freight: 2200 }),
]
async function values(wanted) {
  await page.waitForFunction(
    (targets) => {
      const actual = window.univerAPI
        .getDocument('cypress-forecast-notebook')
        .getFormulas()
        .map((f) => f.getResult())
      return (
        actual.length === 13 &&
        actual.every(
          (r, i) =>
            r &&
            !r.stale &&
            (targets === null
              ? typeof r.value === 'string' && r.value.startsWith('#')
              : typeof targets[i] === 'number'
                ? typeof r.value === 'number' && Math.abs(r.value - targets[i]) < 1e-8
                : r.value === targets[i]),
        )
      )
    },
    wanted,
    { timeout: 30000 },
  )
  const actual = await results()
  for (const [i, r] of actual.entries()) {
    const status = wanted === null || (typeof wanted[i] === 'string' && wanted[i].startsWith('#')) ? 'error' : 'success'
    if (r.status !== status)
      report.knownIssues.push({ gate: 'native-error-status', index: i, expected: status, actual: r })
  }
  return actual
}
async function rendered(name) {
  const texts = (await results()).map((r) => r.text)
  await page.waitForFunction(
    (targets) =>
      [...window.docFrames.entries()].some(([canvas, glyphs]) => {
        const joined = glyphs.join('')
        return (
          canvas.isConnected &&
          canvas.width > 700 &&
          joined.includes('The total is only half the story.') &&
          targets.every((t) => joined.includes(t))
        )
      }),
    texts,
    { timeout: 15000 },
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function gate(name, runGate) {
  try {
    await runGate()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
}
function includesPack(actual, pack) {
  for (const [key, value] of Object.entries(pack))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
function authored(doc) {
  const copy = structuredClone(doc)
  for (const resource of copy.resources)
    if (resource.name === 'DOC_FORMULA_PLUGIN') {
      const data = JSON.parse(resource.data)
      for (const formula of Object.values(data.formulas)) delete formula.lastValue
      resource.data = JSON.stringify(data)
    }
  return copy
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4340')
  await page.waitForSelector('.cypress-embed[data-ready="true"]', { timeout: 60000 })
  assert.equal(await root.locator('fieldset,[data-action],iframe,[data-u-comp="embed-float-dom"]').count(), 0)
  const descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'cypress-cash-forecast' })[0].getDescriptor(),
  )
  assert.equal(descriptor.entry, 'sheets-sheet-tab')
  assert.equal(descriptor.childUnitId, 'cypress-forecast-notebook')
  const originalBody = (await snapshot()).doc.body
  assert.ok(originalBody.paragraphs.every((p) => !p.paragraphStyle?.pageBreakBefore))
  assert.equal(originalBody.dataStream.indexOf('\n'), originalBody.dataStream.length - 1)
  await values(baseline)
  await tab('Cash forecast').click()
  await page.screenshot({ path: path.join(directory, 'source.png') })
  await tab('Forecast notebook').click()
  await rendered('baseline')
  for (const [i, wanted] of scenarios.entries()) {
    const selected = i % 2 === 0 ? 'Cash forecast' : 'Forecast notebook'
    await tab(selected).click()
    await run(examples[i])
    const actual = await values(wanted)
    assert.deepEqual((await snapshot()).doc.body, originalBody)
    if (i === 7) assert.ok((await snapshot()).host.sheets.forecast.cellData[8][1]?.v == null)
    if (i === 8) assert.equal((await snapshot()).host.sheets.forecast.cellData[8][1].v, 0)
    await tab('Forecast notebook').click()
    await rendered('example-' + (i + 1))
    report.checks.push({
      example: i + 1,
      selectedDuringWrite: selected,
      values: actual.map((r) => r.value),
      bodyPreserved: true,
      currentCanvas: true,
    })
    console.log('Cypress example ' + (i + 1) + ' PASS')
  }
  await gate('native-sheet-input-history', async () => {
    await tab('Cash forecast').click()
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('cypress-cash-forecast').save().sheets.forecast
      const c = [...document.querySelectorAll('.cypress-embed canvas')].find(
        (candidate) =>
          candidate.width > 1400 && candidate.height > 500 && !candidate.closest('[data-embed-child-unit-id]'),
      )
      const r = c.getBoundingClientRect(),
        h = (i) => s.rowData?.[i]?.h || s.defaultRowHeight
      return {
        x: r.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w / 2) * s.zoomRatio,
        y:
          r.y +
          (s.columnHeader.height + Array.from({ length: 13 }, (_, i) => h(i)).reduce((a, b) => a + b, 0) + h(13) / 2) *
            s.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('cypress-cash-forecast').getActiveRange()?.getA1Notation() === 'B14',
    )
    const before = await snapshot()
    await page.keyboard.type('2500')
    await page.keyboard.press('Enter')
    await values(expected({ freight: 2500 }))
    const after = await snapshot()
    await page.keyboard.press('Control+z')
    await values(expected({ freight: 2200 }))
    assert.deepEqual((await snapshot()).host, before.host)
    await page.keyboard.press('Control+y')
    await values(expected({ freight: 2500 }))
    assert.deepEqual((await snapshot()).host, after.host)
    assert.deepEqual((await snapshot()).doc.body, originalBody)
    await tab('Forecast notebook').click()
    await rendered('native-source-input')
  })
  await gate('literal-print', async () => {
    await page.evaluate(() => {
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printOwner = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      })
    })
    await run(examples[19])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
    await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printOwner), {
      workbook: 'cypress-cash-forecast',
      sheet: 'forecast',
    })
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await run(examples[20])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
    report.checks.push({ examples: [20, 21], sourceOwned: true })
  })
  await gate('native-doc-edit-history', async () => {
    await tab('Forecast notebook').click()
    const before = await snapshot(),
      beforeResults = await results()
    await run(examples[21])
    await page.waitForFunction(() =>
      window.univerAPI
        .getDocument('cypress-forecast-notebook')
        .getBody()
        .dataStream.includes('Planning note / Reviewed by Mae'),
    )
    await rendered('edited-document')
    const after = await snapshot()
    assert.deepEqual(after.host, before.host)
    assert.deepEqual(await results(), beforeResults)
    report.checks.push({ example: 22, sourceAndResultsPreserved: true })
    await fs.writeFile(path.join(directory, 'doc-edit-before.json'), JSON.stringify(before, null, 2))
    await fs.writeFile(path.join(directory, 'doc-edit-after.json'), JSON.stringify(after, null, 2))
    await gate('native-doc-keyboard-history', async () => {
      await page.keyboard.press('Control+z')
      await settle()
      const undone = await snapshot()
      await fs.writeFile(path.join(directory, 'doc-undo.json'), JSON.stringify(undone, null, 2))
      await gate('doc-undo-full-snapshot', async () => {
        assert.deepEqual(undone.doc, before.doc)
      })
      assert.deepEqual(authored(undone.doc), authored(before.doc))
      assert.deepEqual(undone.host, before.host)
      await page.keyboard.press('Control+y')
      await settle()
      const redone = await snapshot()
      await fs.writeFile(path.join(directory, 'doc-redo.json'), JSON.stringify(redone, null, 2))
      await gate('doc-redo-full-snapshot', async () => {
        assert.deepEqual(redone.doc, after.doc)
      })
      assert.deepEqual(authored(redone.doc), authored(after.doc))
      assert.deepEqual(redone.host, before.host)
    })
  })
  await run(examples[22])
  report.checks.push({ example: 23 })
  await gate('complete-locales-and-themes', async () => {
    const source = await fs.readFile('showcase/embed/docs-in-sheets-formula-tab/code/create-demo.ts', 'utf8')
    const packs = [...source.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 14)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      await tab('Forecast notebook').click()
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      const before = await snapshot()
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.deepEqual(await snapshot(), before)
      }
      report.checks.push({ locale, completePacks: 14, modelsPreserved: true })
      await gate('formula-ui-' + locale, async () => {
        const labels = (await import('@univerjs-pro/shape-editor-ui/locale/' + locale)).default['shape-editor-ui']
          .formulaBinding
        await page.evaluate(() => {
          window.univerAPI.executeCommand('docs-formula.operation.open-editor', {
            unitId: 'cypress-forecast-notebook',
            rangeId: window.univerAPI.getDocument('cypress-forecast-notebook').getFormulas()[0].getId(),
          })
        })
        await page.getByRole('button', { name: labels.confirm, exact: true }).waitFor()
        await page.evaluate(() => {
          window.cypressDialogBounds = undefined
        })
        await page.waitForFunction(
          () => {
            const ds = document.querySelectorAll('[role="dialog"]'),
              r = ds[ds.length - 1]?.getBoundingClientRect()
            if (!r) return false
            const b = JSON.stringify(r.toJSON())
            if (b !== window.cypressDialogBounds) {
              window.cypressDialogBounds = b
              window.cypressStableSince = performance.now()
            }
            return performance.now() - window.cypressStableSince > 600
          },
          null,
          { polling: 100, timeout: 10000 },
        )
        await page.getByRole('button', { name: labels.numberFormat, exact: true }).click()
        await page.getByText(labels.formats.more, { exact: true }).click()
        await page.getByText(labels.formatTypes, { exact: true }).waitFor()
        assert.equal(
          /(?:docs-formula-ui|shape-editor-ui|embed-unit-ui)\.[\w.]+/.test(await page.locator('body').innerText()),
          false,
        )
        await page.screenshot({ path: path.join(directory, locale + '-number-format.png') })
        await page.getByRole('button', { name: labels.cancel, exact: true }).last().click()
        await page.evaluate(() => {
          window.univerAPI.executeCommand('docs-formula.operation.close-popup')
        })
        await page.getByRole('dialog').waitFor({ state: 'detached' })
        assert.deepEqual((await snapshot()).doc, before.doc)
        report.checks.push({ locale, formulaEditor: true, numberFormat: true })
      })
      await page.evaluate(() => {
        window.univerAPI.executeCommand('docs-formula.operation.close-popup')
      })
      await page.getByRole('dialog').waitFor({ state: 'detached' })
    }
  })
  await gate('active-doc-tab-disposal', async () => {
    await page.evaluate(() => {
      window.univerAPI.executeCommand('docs-formula.operation.close-popup')
    })
    await tab('Forecast notebook').click()
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0 && Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
  report.currentResults = await results().catch(() => [])
  report.frames = await page
    .evaluate(() =>
      [...window.docFrames.entries()]
        .filter(([c]) => c.isConnected)
        .map(([c, text]) => ({ width: c.width, height: c.height, text: text.join('') })),
    )
    .catch(() => [])
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  try {
    await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
    console.log(
      JSON.stringify(
        {
          passed: report.passed,
          checks: report.checks.length,
          gates: Object.fromEntries(Object.entries(report.gates).map(([name, result]) => [name, result.passed])),
          issues: report.knownIssues.length,
          errors: report.errors,
          warnings: report.warnings,
          failure: report.failure,
        },
        null,
        2,
      ),
    )
  } finally {
    await browser.close()
  }
}
if (!report.passed) process.exitCode = 1
