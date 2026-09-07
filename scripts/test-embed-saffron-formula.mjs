/* eslint-disable no-await-in-loop -- Exercise published snippets in order against one native owner. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-saffron-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/docs-in-sheets-formula-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 21)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1150 } })
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

const root = page.locator('.saffron-embed')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const snapshot = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        host: window.univerAPI.getWorkbook('saffron-kitchen-budget').save(),
        doc: window.univerAPI.getDocument('saffron-budget-explanation').save(),
      }),
    ),
  )
const results = () =>
  page.evaluate(() =>
    window.univerAPI
      .getDocument('saffron-budget-explanation')
      .getFormulas()
      .map((f) => f.getResult()),
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
function expected({
  tickets = 6200,
  grant = 3000,
  venue = 2400,
  food = 3100,
  staff = 2100,
  guests = 80,
  rate = 0.1,
} = {}) {
  const income = tickets + grant,
    cost = venue + (typeof food === 'number' ? food : 0) + staff,
    balance = income - cost
  const reserve = typeof rate === 'number' ? income * rate : '#VALUE!'
  return [
    income,
    cost,
    balance,
    reserve,
    typeof reserve === 'number' ? balance - reserve : '#VALUE!',
    typeof reserve === 'number' ? (balance >= reserve ? 'Reserve covered' : 'Revisit the scope') : '#VALUE!',
    guests,
    guests ? cost / guests : '#DIV/0!',
    income ? cost / income : '#DIV/0!',
    venue,
    food,
    staff,
  ]
}
const baseline = expected()
const scenarios = [
  expected({ food: 3600 }),
  expected({ food: 3600, tickets: 6700 }),
  expected({ food: 3600, tickets: 6700, rate: 0.2 }),
  expected({ food: 3600, tickets: 6700, rate: 0.2, guests: 90 }),
  expected({ food: 3600, tickets: 6700, rate: 0.2, guests: 0 }),
  expected({ food: null, tickets: 6700, rate: 0.2, guests: 0 }),
  expected({ food: 0, tickets: 6700, rate: 0.2, guests: 0 }),
  expected({ food: 'pending', tickets: 6700, rate: 0.2, guests: 0 }),
  baseline,
  expected({ tickets: 0, grant: 0 }),
  baseline,
  expected({ rate: 'pending' }),
  baseline,
  baseline,
  expected({ venue: 2600 }),
  null,
  expected({ venue: 2600 }),
]
async function values(wanted) {
  await page.waitForFunction(
    (targets) => {
      const actual = window.univerAPI
        .getDocument('saffron-budget-explanation')
        .getFormulas()
        .map((f) => f.getResult())
      return (
        actual.length === 12 &&
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
          canvas.closest('[data-embed-id="saffron-doc-float"]') &&
          joined.includes('Protect the programme') &&
          targets.every((t) => joined.includes(t))
        )
      }),
    texts,
    { timeout: 12000 },
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function gate(name, run) {
  try {
    await run()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
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
function includesPack(actual, pack) {
  for (const [key, value] of Object.entries(pack))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
async function expand() {
  const float = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="saffron-doc-float"]')
  const rect = await float.boundingBox()
  await page.mouse.dblclick(rect.x + 220, rect.y + 180)
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="saffron-doc-float"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await shell.waitFor()
  await settle()
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4338')
  await page.waitForSelector('.saffron-embed[data-ready="true"]', { timeout: 60000 })
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  assert.equal(await root.locator('[data-u-comp="ribbon-grid-toolbar"]').count(), 1)
  const originalBody = (await snapshot()).doc.body
  assert.ok(originalBody.paragraphs.every((p) => !p.paragraphStyle?.pageBreakBefore))
  await values(baseline)
  await rendered('baseline')
  for (const [i, wanted] of scenarios.entries()) {
    await page.evaluate(examples[i])
    const actual = await values(wanted)
    assert.deepEqual((await snapshot()).doc.body, originalBody, 'Source edits retain the entire authored body')
    if (i === 5) assert.ok((await snapshot()).host.sheets.budget.cellData[9][1]?.v == null)
    if (i === 6) assert.equal((await snapshot()).host.sheets.budget.cellData[9][1].v, 0)
    await rendered('example-' + (i + 1))
    report.checks.push({ example: i + 1, values: actual.map((r) => r.value), bodyPreserved: true, currentCanvas: true })
    console.log('Saffron example ' + (i + 1) + ' PASS')
  }
  await gate('literal-print', async () => {
    await page.evaluate(() =>
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printOwner = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      }),
    )
    await page.evaluate(examples[17])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
    await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printOwner), {
      workbook: 'saffron-kitchen-budget',
      sheet: 'budget',
    })
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await page.evaluate(examples[18])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
  })
  await page.evaluate(examples[19])
  report.checks.push({ examples: [18, 19, 20], printGate: report.gates['literal-print'].passed })
  await gate('native-sheet-input-history', async () => {
    const point = await page.evaluate(() => {
      const sheet = window.univerAPI.getWorkbook('saffron-kitchen-budget').save().sheets.budget
      const canvas = [...document.querySelectorAll('.saffron-embed canvas')].find(
        (c) => c.width > 1300 && c.height > 500 && !c.closest('[data-embed-id]'),
      )
      const rect = canvas.getBoundingClientRect(),
        h = (i) => sheet.rowData?.[i]?.h || sheet.defaultRowHeight
      return {
        x: rect.x + (sheet.rowHeader.width + sheet.columnData[0].w + sheet.columnData[1].w / 2) * sheet.zoomRatio,
        y:
          rect.y +
          (sheet.columnHeader.height +
            Array.from({ length: 8 }, (_, i) => h(i)).reduce((a, b) => a + b, 0) +
            h(8) / 2) *
            sheet.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('saffron-kitchen-budget').getActiveRange()?.getA1Notation() === 'B9',
    )
    const before = await snapshot()
    await page.keyboard.type('2800')
    await page.keyboard.press('Enter')
    await values(expected({ venue: 2800 }))
    const after = await snapshot()
    await rendered('native-input')
    await page.keyboard.press('Control+z')
    await values(expected({ venue: 2600 }))
    assert.deepEqual((await snapshot()).host, before.host)
    await page.keyboard.press('Control+y')
    await values(expected({ venue: 2800 }))
    assert.deepEqual((await snapshot()).host, after.host)
    assert.deepEqual((await snapshot()).doc.body, originalBody)
  })
  await gate('complete-locales-themes-and-formula-dialog', async () => {
    const source = await fs.readFile('showcase/embed/docs-in-sheets-formula-float/code/create-demo.ts', 'utf8')
    const packs = [...source.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 14)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      const actual = await page.evaluate(() => window.univerAPI.getLocales())
      for (const [, prefix] of packs) includesPack(actual, (await import(prefix + locale)).default)
      const before = await snapshot()
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.deepEqual(await snapshot(), before)
      }
      report.checks.push({ locale, completePacks: 14, completeModelsPreserved: true })
      const labels = (await import('@univerjs-pro/shape-editor-ui/locale/' + locale)).default['shape-editor-ui']
        .formulaBinding
      assert.equal(
        await page.evaluate(() =>
          window.univerAPI.executeCommand('docs-formula.operation.open-editor', {
            unitId: 'saffron-budget-explanation',
            rangeId: window.univerAPI.getDocument('saffron-budget-explanation').getFormulas()[0].getId(),
          }),
        ),
        true,
      )
      await page.getByRole('button', { name: labels.confirm, exact: true }).waitFor()
      await page.evaluate(() => {
        window.saffronDialogBounds = undefined
      })
      await page.waitForFunction(
        () => {
          const dialogs = document.querySelectorAll('[role="dialog"]')
          const rect = dialogs[dialogs.length - 1]?.getBoundingClientRect()
          if (!rect) return false
          const bounds = JSON.stringify(rect.toJSON())
          if (bounds !== window.saffronDialogBounds) {
            window.saffronDialogBounds = bounds
            window.saffronDialogStableSince = performance.now()
          }
          return performance.now() - window.saffronDialogStableSince > 600
        },
        null,
        { polling: 100, timeout: 10000 },
      )
      await page.getByRole('button', { name: labels.numberFormat, exact: true }).click()
      await page.getByText(labels.formats.more, { exact: true }).click()
      await page.getByText(labels.formatTypes, { exact: true }).waitFor()
      const visible = await page.locator('body').innerText()
      assert.equal(/(?:docs-formula-ui|shape-editor-ui|embed-unit-ui)\.[\w.]+/.test(visible), false)
      await page.screenshot({ path: path.join(directory, locale + '-formula-format.png') })
      await page.getByRole('button', { name: labels.cancel, exact: true }).last().click()
      await page.evaluate(() => window.univerAPI.executeCommand('docs-formula.operation.close-popup'))
      await page.getByRole('dialog').waitFor({ state: 'detached' })
      assert.deepEqual((await snapshot()).doc, before.doc)
      report.checks.push({ locale, completePacks: 14, formulaEditor: true, numberFormat: true })
    }
    await page.evaluate(() => window.univerAPI.setLocale('enUS'))
  })
  await gate('native-doc-edit', async () => {
    await page.evaluate(() => {
      window.univerAPI.setLocale('enUS')
      window.univerAPI.executeCommand('docs-formula.operation.close-popup')
    })
    const float = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="saffron-doc-float"]')
    await float.dblclick({ position: { x: 220, y: 180 } })
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-embed-id="saffron-doc-float"][data-u-comp="embed-float-dom"]')
          ?.getAttribute('data-embed-float-stage') === 'stage2',
    )
    const before = await snapshot()
    const beforeResults = await results()
    await page.evaluate(examples[20])
    await page.waitForFunction(() =>
      window.univerAPI
        .getDocument('saffron-budget-explanation')
        .getBody()
        .dataStream.includes('Budget explanation / Reviewed by Noor'),
    )
    await rendered('edited-document')
    const after = await snapshot()
    assert.deepEqual(after.host, before.host)
    assert.deepEqual(await results(), beforeResults)
    report.checks.push({ example: 21, sourcePreserved: true, resultsPreserved: true, currentCanvas: true })
    await fs.writeFile(path.join(directory, 'doc-edit-before.json'), JSON.stringify(before, null, 2))
    await fs.writeFile(path.join(directory, 'doc-edit-after.json'), JSON.stringify(after, null, 2))
    await gate('native-doc-keyboard-undo', async () => {
      await page.keyboard.press('Control+z')
      await settle()
      const undone = await snapshot()
      await fs.writeFile(path.join(directory, 'doc-keyboard-undo.json'), JSON.stringify(undone, null, 2))
      assert.deepEqual(undone.doc, before.doc)
      assert.deepEqual(undone.host, before.host)
    })
    await gate('explicit-doc-facade-history', async () => {
      report.historyRecoveryStep = 'inspect-after-keyboard'
      if (!report.gates['native-doc-keyboard-undo'].passed) {
        // Keep the failed keyboard gate and its raw snapshots. Restore only the
        // wrongly targeted host edit before testing explicit document history.
        const afterKeyboard = await snapshot()
        if (JSON.stringify(afterKeyboard.host) !== JSON.stringify(before.host)) {
          assert.equal(afterKeyboard.host.sheets.budget.cellData[8][1].v, 2600)
          report.historyRecoveryStep = 'host-facade-redo'
          // FWorkbook.redo returns its Facade for chaining, not a boolean. Never
          // serialize that live injector graph through the browser test bridge.
          await page.evaluate(() => {
            window.univerAPI.getWorkbook('saffron-kitchen-budget').redo()
          })
          report.historyRecoveryStep = 'host-redo-results'
          await values(expected({ venue: 2800 }))
          assert.deepEqual((await snapshot()).host, before.host)
        }
        report.historyRecoveryStep = 'doc-facade-undo'
        assert.equal(await page.evaluate(() => window.univerAPI.getDocument('saffron-budget-explanation').undo()), true)
        await settle()
      }
      report.historyRecoveryStep = 'doc-undo-snapshot'
      const afterUndo = await snapshot()
      await fs.writeFile(path.join(directory, 'doc-facade-undo.json'), JSON.stringify(afterUndo, null, 2))
      await gate('doc-undo-full-snapshot', async () => {
        assert.deepEqual(afterUndo.doc, before.doc)
      })
      // A separate authored-state gate does not turn the strict cache mismatch
      // above into full-state success. Keep IDs, formula syntax and formatting.
      assert.deepEqual(authored(afterUndo.doc), authored(before.doc))
      assert.deepEqual(afterUndo.host, before.host)
      report.historyRecoveryStep = 'doc-facade-redo'
      assert.equal(await page.evaluate(() => window.univerAPI.getDocument('saffron-budget-explanation').redo()), true)
      await settle()
      const afterRedo = await snapshot()
      await fs.writeFile(path.join(directory, 'doc-facade-redo.json'), JSON.stringify(afterRedo, null, 2))
      await gate('doc-redo-full-snapshot', async () => {
        assert.deepEqual(afterRedo.doc, after.doc)
      })
      assert.deepEqual(authored(afterRedo.doc), authored(after.doc))
      assert.deepEqual(afterRedo.host, before.host)
      await values(expected({ venue: 2800 }))
      await rendered('doc-facade-redo')
      report.historyRecoveryStep = 'complete'
    })
  })
  await gate('active-doc-disposal', async () => {
    await page.evaluate(() => window.univerAPI.setLocale('enUS'))
    await expand()
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await shell.waitFor({ state: 'detached' })
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
        .map(([c, text]) => ({
          width: c.width,
          height: c.height,
          embed: c.closest('[data-embed-id]')?.getAttribute('data-embed-id'),
          text: text.join(''),
        })),
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
