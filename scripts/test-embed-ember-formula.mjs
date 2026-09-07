/* eslint-disable no-await-in-loop -- Exercise published snippets in order against one native owner. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-ember-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/docs-in-bases-formula-tab/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 20)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1120 } })
page.setDefaultTimeout(12000)
const report = {
  passed: false,
  checks: [],
  gates: {},
  knownIssues: [],
  errors: [],
  expectedRejections: [],
  warnings: [],
  backendRequests: [],
}
let testingNumericRejection = false
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') {
    if (testingNumericRejection && m.text().includes('[BaseField]: invalid number value.'))
      report.expectedRejections.push(m.text())
    else report.errors.push(m.text())
  }
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
  window.basePoints = []
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
    if (this.canvas.closest('.ember-embed') && !this.canvas.closest('[data-embed-bases-table-list-host]')) {
      const p = this.getTransform().transformPoint({ x: args[1], y: args[2] }),
        b = this.canvas.getBoundingClientRect()
      if (b.width > 0 && b.height > 0)
        window.basePoints.push({
          text: String(args[0]),
          x: b.x + (p.x * b.width) / this.canvas.width,
          y: b.y + (p.y * b.height) / this.canvas.height,
        })
    }
    if (frame.length > 50000) frame.splice(0, frame.length - 50000)
    window.docFrames.set(this.canvas, frame)
    return Reflect.apply(fill, this, args)
  }
})

const root = page.locator('.ember-embed')
const tab = (name) => page.getByText(name, { exact: true })
// Execute the exact published body without returning a live Facade graph.
const run = (literal) => page.evaluate('(() => {\n' + literal + '\n})()')
const snapshot = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        host: window.univerAPI.getBase('ember-release-register').save(),
        doc: window.univerAPI.getDocument('ember-release-notes').save(),
      }),
    ),
  )
const results = () =>
  page.evaluate(() =>
    window.univerAPI
      .getDocument('ember-release-notes')
      .getFormulas()
      .map((f) => f.getResult()),
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
function expected({
  reviewComplete = false,
  migration = 8,
  migrationStage = 'Blocked',
  reopenGuide = false,
  guideHours = 1.5,
  allComplete = false,
} = {}) {
  const complete = allComplete ? 12 : 9 + Number(reviewComplete) - Number(reopenGuide)
  const review = allComplete
    ? 0
    : 2 - Number(reviewComplete) + Number(reopenGuide) + Number(migrationStage === 'Review')
  const blocked = allComplete ? 0 : Number(migrationStage === 'Blocked')
  const numeric = typeof migration === 'number' ? migration : 0
  const remaining = allComplete ? 0 : (reviewComplete ? 0 : 3) + numeric + (guideHours ?? 0)
  return [
    12,
    complete,
    review,
    blocked,
    complete / 12,
    remaining,
    blocked ? numeric : 0,
    complete === 12 ? '#DIV/0!' : remaining / (12 - complete),
    blocked ? 'Resolve the release blocker' : review ? 'Finish the review queue' : 'Ready for editorial sign-off',
    allComplete ? 5 : 4,
    allComplete || reviewComplete ? 4 : 3,
    allComplete ? 3 : reopenGuide ? 1 : 2,
  ]
}
const baseline = expected()
const revised = { reviewComplete: true, migration: 13, migrationStage: 'Review' }
const scenarios = [
  expected({ reviewComplete: true }),
  expected({ reviewComplete: true, migration: 13 }),
  expected(revised),
  expected(revised),
  expected(revised),
  expected({ ...revised, reopenGuide: true }),
  expected({ ...revised, reopenGuide: true }),
  expected({ ...revised, reopenGuide: true, guideHours: null }),
  expected({ ...revised, reopenGuide: true, guideHours: 0 }),
  baseline,
  expected({ allComplete: true }),
  baseline,
  baseline,
  expected({ migration: 10 }),
  [1, ...Array(11).fill('#VALUE!')],
  expected({ migration: 10 }),
  expected({ migration: 10 }),
  baseline,
]
async function values(wanted) {
  await page.waitForFunction(
    (targets) => {
      const actual = window.univerAPI
        .getDocument('ember-release-notes')
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
          canvas.width > 700 &&
          joined.includes('Ready to explain. Not yet to ship.') &&
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
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4342')
  await page.waitForSelector('.ember-embed[data-ready="true"]', { timeout: 60000 })
  assert.equal(await root.locator('fieldset,[data-action],iframe,[data-u-comp="embed-float-dom"]').count(), 0)
  const descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'ember-release-register' })[0].getDescriptor(),
  )
  assert.equal(descriptor.entry, 'bases-table-list-block')
  assert.equal(descriptor.childUnitId, 'ember-release-notes')
  const originalBody = (await snapshot()).doc.body
  assert.ok(originalBody.paragraphs.every((p) => !p.paragraphStyle?.pageBreakBefore))
  assert.equal(originalBody.dataStream.indexOf('\n'), originalBody.dataStream.length - 1)
  await values(baseline)
  await tab('Changes').click()
  await page.screenshot({ path: path.join(directory, 'source.png') })
  await tab('Release notes').click()
  await rendered('baseline')
  for (const [i, wanted] of scenarios.entries()) {
    const selected = i % 2 === 0 ? 'Changes' : 'Release notes'
    await tab(selected).click()
    testingNumericRejection = i === 16
    const beforeWrite = testingNumericRejection ? await snapshot() : undefined
    await run(examples[i])
    const actual = await values(wanted)
    if (testingNumericRejection) {
      assert.deepEqual(await snapshot(), beforeWrite)
      assert.equal(report.expectedRejections.length, 1)
    }
    testingNumericRejection = false
    assert.deepEqual((await snapshot()).doc.body, originalBody)
    if (i >= 4 && i <= 6) {
      const ids = await page.evaluate(() =>
        window.univerAPI
          .getBase('ember-release-register')
          .getTableById('changes')
          .getViewById('changes-grid')
          .getProjection()
          .rows.map((r) => r.recordId),
      )
      assert.deepEqual(
        ids,
        i === 4
          ? ['change-11', 'change-12']
          : i === 5
            ? ['change-9', 'change-11', 'change-12']
            : Array.from({ length: 12 }, (_, n) => 'change-' + (n + 1)),
      )
      report.checks.push({ example: i + 1, projectedRecordIds: ids })
    }
    if (i === 7) assert.equal((await snapshot()).host.tables.changes.records['change-12'].values.hours, null)
    if (i === 8) assert.equal((await snapshot()).host.tables.changes.records['change-12'].values.hours, 0)
    await tab('Release notes').click()
    await rendered('example-' + (i + 1))
    report.checks.push({
      example: i + 1,
      selectedDuringWrite: selected,
      values: actual.map((r) => r.value),
      bodyPreserved: true,
      currentCanvas: true,
    })
    console.log('Ember example ' + (i + 1) + ' PASS')
  }
  await gate('native-base-input-history', async () => {
    await tab('Changes').click()
    await page.waitForFunction(() => window.basePoints.some((p) => p.text === '8.0' || p.text === '8'))
    const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '8.0' || p.text === '8'))
    const before = await snapshot()
    await page.mouse.dblclick(point.x - 6, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('11')
    await page.keyboard.press('Enter')
    await values(expected({ migration: 11 }))
    const after = await snapshot()
    assert.equal(after.host.tables.changes.records['change-11'].values.hours, 11)
    assert.deepEqual(after.doc.body, before.doc.body)
    await page.keyboard.press('Control+z')
    await values(baseline)
    assert.deepEqual((await snapshot()).host, before.host)
    await page.keyboard.press('Control+y')
    await values(expected({ migration: 11 }))
    assert.deepEqual((await snapshot()).host, after.host)
    await tab('Release notes').click()
    await rendered('native-input')
  })
  await gate('native-doc-edit-history', async () => {
    await tab('Release notes').click()
    const before = await snapshot(),
      beforeResults = await results()
    await run(examples[18])
    await page.waitForFunction(() =>
      window.univerAPI
        .getDocument('ember-release-notes')
        .getBody()
        .dataStream.includes('Editorial draft / Reviewed by Noor'),
    )
    await rendered('edited-document')
    const after = await snapshot()
    assert.deepEqual(after.host, before.host)
    assert.deepEqual(await results(), beforeResults)
    report.checks.push({ example: 19, sourceAndResultsPreserved: true })
    await fs.writeFile(path.join(directory, 'doc-edit-before.json'), JSON.stringify(before, null, 2))
    await fs.writeFile(path.join(directory, 'doc-edit-after.json'), JSON.stringify(after, null, 2))
    await gate('unfocused-doc-keyboard-preserves-owners', async () => {
      await page.keyboard.press('Control+z')
      await settle()
      const unchanged = await snapshot()
      await fs.writeFile(path.join(directory, 'doc-unfocused-undo.json'), JSON.stringify(unchanged, null, 2))
      assert.deepEqual(unchanged, after)
    })
    await gate('explicit-doc-facade-history', async () => {
      assert.equal(await page.evaluate(() => window.univerAPI.getDocument('ember-release-notes').undo()), true)
      await settle()
      const undone = await snapshot()
      await fs.writeFile(path.join(directory, 'doc-undo.json'), JSON.stringify(undone, null, 2))
      await gate('doc-undo-full-snapshot', async () => {
        assert.deepEqual(undone.doc, before.doc)
      })
      assert.deepEqual(authored(undone.doc), authored(before.doc))
      assert.deepEqual(undone.host, before.host)
      assert.equal(await page.evaluate(() => window.univerAPI.getDocument('ember-release-notes').redo()), true)
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
  await gate('focused-doc-native-keyboard-history', async () => {
    await tab('Release notes').click()
    // The verified 1600x1120 document screenshot places its review line here.
    // Select actual document content, not merely the Base navigation item.
    await page.mouse.click(720, 304)
    await page.keyboard.press('End')
    const before = await snapshot()
    // Avoid invoking the modern Doc slash-command menu during this text-history check.
    await page.keyboard.type(' Final review')
    await page.waitForFunction(() =>
      window.univerAPI.getDocument('ember-release-notes').getBody().dataStream.includes(' Final review'),
    )
    const after = await snapshot()
    assert.deepEqual(after.host, before.host)
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      () => !window.univerAPI.getDocument('ember-release-notes').getBody().dataStream.includes(' Final review'),
    )
    assert.deepEqual((await snapshot()).doc.body, before.doc.body)
    assert.deepEqual((await snapshot()).host, before.host)
    await page.keyboard.press('Control+y')
    await page.waitForFunction(() =>
      window.univerAPI.getDocument('ember-release-notes').getBody().dataStream.includes(' Final review'),
    )
    assert.deepEqual((await snapshot()).doc.body, after.doc.body)
    assert.deepEqual((await snapshot()).host, before.host)
    await rendered('focused-native-doc-edit')
  })
  await run(examples[19])
  report.checks.push({ example: 20 })
  await gate('complete-locales-and-themes', async () => {
    const source = await fs.readFile('showcase/embed/docs-in-bases-formula-tab/code/create-demo.ts', 'utf8')
    const packs = [...source.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 10)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      await tab('Release notes').click()
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      const before = await snapshot()
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.deepEqual(await snapshot(), before)
      }
      report.checks.push({ locale, completePacks: 10, modelsPreserved: true })
      await gate('formula-ui-' + locale, async () => {
        const labels = (await import('@univerjs-pro/shape-editor-ui/locale/' + locale)).default['shape-editor-ui']
          .formulaBinding
        await page.evaluate(() => {
          window.univerAPI.executeCommand('docs-formula.operation.open-editor', {
            unitId: 'ember-release-notes',
            rangeId: window.univerAPI.getDocument('ember-release-notes').getFormulas()[0].getId(),
          })
        })
        await page.getByRole('button', { name: labels.confirm, exact: true }).waitFor()
        await page.evaluate(() => {
          window.emberDialogBounds = undefined
        })
        await page.waitForFunction(
          () => {
            const ds = document.querySelectorAll('[role="dialog"]'),
              r = ds[ds.length - 1]?.getBoundingClientRect()
            if (!r) return false
            const b = JSON.stringify(r.toJSON())
            if (b !== window.emberDialogBounds) {
              window.emberDialogBounds = b
              window.emberStableSince = performance.now()
            }
            return performance.now() - window.emberStableSince > 600
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
    await tab('Release notes').click()
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
