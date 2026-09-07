/* eslint-disable no-await-in-loop -- Exercise the documented scenarios in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-solstice-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/slides-in-sheets-formula-tab/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 6)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(15000)
const report = { passed: false, checks: [], gates: {}, errors: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
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
  window.childFrames = new Map()
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect
  // eslint-disable-next-line unicorn/consistent-function-scoping -- This function runs in the isolated browser realm.
  const isChild = (canvas) => canvas.width > 700 && canvas.closest('[data-embed-sheets-sheet-tab-host]')
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    if (isChild(this.canvas)) window.childFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    if (isChild(this.canvas)) {
      const texts = window.childFrames.get(this.canvas) || []
      texts.push(String(args[0]))
      window.childFrames.set(this.canvas, texts)
    }
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.solstice-embed')
const tab = (name) => root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
const titles = {
  conservative: 'Start small. Learn deliberately.',
  baseline: 'Build a repeatable evening.',
  expanded: 'Grow only when the room is ready.',
}
const result = () =>
  page.evaluate(() =>
    Object.fromEntries(
      ['conservative', 'baseline', 'expanded'].map((p) => [
        p,
        Object.fromEntries(
          ['volume', 'revenue', 'contribution', 'margin'].map((id) => [
            id,
            window.univerAPI.getPresentation('solstice-scenario-deck').getSlideById(p).getShape(id).getFormulaResult(),
          ]),
        ),
      ]),
    ),
  )
const authored = () =>
  page.evaluate(() => {
    const slides = window.univerAPI.getPresentation('solstice-scenario-deck').save().slides
    return JSON.parse(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(slides).map(([id, p]) => [
            id,
            {
              text: ['title', 'kicker', 'footer', 'explanation'].map((k) => p.elements[k]),
              geometry: Object.fromEntries(p.elementOrder.map((k) => [k, p.elements[k].transform])),
            },
          ]),
        ),
      ),
    )
  })
async function values(price, unitCost, expanded = 125) {
  const expected = [80, 100, expanded].map((q) => ({
    volume: q,
    revenue: q * price,
    contribution: q * (price - unitCost) - 600,
    margin: price === 0 ? '#DIV/0!' : (q * (price - unitCost) - 600) / (q * price),
  }))
  await page.waitForFunction(
    (targets) =>
      ['conservative', 'baseline', 'expanded'].every((p, i) =>
        Object.entries(targets[i]).every(([id, value]) => {
          const r = window.univerAPI
            .getPresentation('solstice-scenario-deck')
            .getSlideById(p)
            .getShape(id)
            .getFormulaResult()
          return (
            r &&
            !r.stale &&
            (typeof value === 'string'
              ? r.value === value && r.status === 'error'
              : Math.abs(r.value - value) < 1e-9 && r.status === 'success')
          )
        }),
      ),
    expected,
    { timeout: 30000 },
  )
  return expected
}
async function showPage(id, screenshot) {
  await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
  await page.waitForFunction(
    (pageId) => window.univerAPI.getPresentation('solstice-scenario-deck').getActiveSlide().getId() === pageId,
    id,
  )
  const current = (await result())[id]
  const expected = [titles[id], ...Object.values(current).map((r) => r.displayText)]
  await page.waitForFunction(
    (targets) =>
      [...window.childFrames.entries()].some(
        ([canvas, texts]) => canvas.isConnected && targets.every((v) => texts.join('').includes(v)),
      ),
    expected,
  )
  if (screenshot) await page.screenshot({ path: path.join(directory, screenshot + '.png') })
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4278', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.solstice-embed')
      return r?.dataset.ready || r?.dataset.error
    },
    {},
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe,[data-u-comp="embed-float-dom"]').count(), 0)
  assert.deepEqual(await root.locator('[data-u-comp="slide-tab-item"]').allTextContents(), [
    'Scenario model',
    'Scenario deck',
    'Decision notes',
  ])
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'solstice-scenario-model' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.childUnitId, 'solstice-scenario-deck')
  assert.equal(report.descriptor.context.name, 'Scenario deck')
  assert.equal(report.descriptor.context.index, 1)
  await values(32, 18)
  assert.equal(
    await page.evaluate(() =>
      ['conservative', 'baseline', 'expanded'].every((p) =>
        ['volume', 'revenue', 'contribution', 'margin'].every(
          (id) =>
            !window.univerAPI
              .getPresentation('solstice-scenario-deck')
              .getSlideById(p)
              .getShape(id)
              .isFormulaAnimationEnabled(),
        ),
      ),
    ),
    true,
  )
  report.opening = await result()
  await page.screenshot({ path: path.join(directory, 'model.png') })
  const original = await authored()
  await tab('Scenario deck').click()
  await root.locator('[data-embed-sheets-sheet-tab-host]').waitFor()
  for (const id of Object.keys(titles)) await showPage(id, id)
  const expected = [
    [35, 18, 125],
    [35, 18, 140],
    [35, 20, 140],
    [0, 20, 140],
    [35, 20, 140],
    [32, 18, 125],
  ]
  for (const [i, code] of examples.entries()) {
    await tab('Scenario model').click()
    const before = await result()
    await page.evaluate(code)
    const actual = await values(...expected[i])
    assert.deepEqual(await authored(), original, 'Source edits preserve all authored text and geometry')
    if (i === 1) {
      const after = await result()
      assert.deepEqual(after.conservative, before.conservative)
      assert.deepEqual(after.baseline, before.baseline)
    }
    await tab('Scenario deck').click()
    for (const id of Object.keys(titles)) await showPage(id, 'example-' + (i + 1) + '-' + id)
    report.checks.push({ example: i + 1, expected: actual, results: await result() })
  }
  await gate('native-host-keyboard-history', async () => {
    await tab('Scenario model').click()
    const box = root.locator('[data-u-comp="defined-name"] input')
    await box.fill('B5')
    await box.press('Enter')
    await page.keyboard.type('34')
    await page.keyboard.press('Enter')
    await values(34, 18)
    await page.keyboard.press('Control+z')
    await values(32, 18)
    await page.keyboard.press('Control+y')
    await values(34, 18)
    assert.deepEqual(await authored(), original)
    await tab('Scenario deck').click()
    for (const id of Object.keys(titles)) await showPage(id, 'keyboard-' + id)
  })
  await gate('native-tab-round-trip', async () => {
    const before = await result()
    await tab('Decision notes').click()
    await tab('Scenario model').click()
    await tab('Scenario deck').click()
    assert.deepEqual(await result(), before)
    await showPage('expanded', 'round-trip')
  })
  await gate('native-child-history-ownership', async () => {
    await showPage('baseline')
    const snapshot = () =>
      page.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            sheet: window.univerAPI.getWorkbook('solstice-scenario-model').save(),
            slides: window.univerAPI.getPresentation('solstice-scenario-deck').save(),
          }),
        ),
      )
    const before = await snapshot()
    const formulasBefore = await result()
    await page.evaluate(() => {
      const text = window.univerAPI
        .getPresentation('solstice-scenario-deck')
        .getSlideById('baseline')
        .getShape('title')
        .getText()
      const rich = text.getRichText().copy()
      rich.getParagraphs()[0].getTextRuns()[0].setText('Solstice / Plan the evening together.')
      text.setRichText(rich)
    })
    await page.waitForFunction(() =>
      [...window.childFrames.values()].some((texts) =>
        texts.join('').includes('Solstice / Plan the evening together.'),
      ),
    )
    const edited = await snapshot()
    assert.notDeepEqual(edited.slides, before.slides)
    assert.deepEqual(edited.sheet, before.sheet)
    await root.locator('[data-u-command="univer.command.undo"]').click()
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    assert.deepEqual(await snapshot(), before)
    await root.locator('[data-u-command="univer.command.redo"]').click()
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    assert.deepEqual(await snapshot(), edited)
    assert.deepEqual(await result(), formulasBefore)
    await page.screenshot({ path: path.join(directory, 'child-history.png') })
  })
  await gate('active-child-disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  assert.ok(Object.values(report.gates).every((g) => g.passed))
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.results = await result().catch(() => null)
  report.paint = await page
    .evaluate(() => [...window.childFrames.values()].map((t) => t.join('').slice(-2500)))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      { ...report, checks: report.checks.map((c) => ({ example: c.example, expected: c.expected })) },
      null,
      2,
    ),
  )
  await browser.close()
}
if (!report.passed) process.exitCode = 1
