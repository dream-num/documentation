/* eslint-disable no-await-in-loop -- Exercise the source changes in documented order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-formula-shape')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/formula-shape/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
]
  .map((m) => m[1])
  .slice(0, 6)
// Keep the original six-step regression; test-embed-beacon-formula.mjs covers the expanded guide.
assert.equal(examples.length, 6)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } })
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
    (['xhr', 'fetch'].includes(r.resourceType()) && !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.painted = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    if (window.painted.length > 30000) window.painted.splice(0, 10000)
    return Reflect.apply(original, this, args)
  }
})
const root = page.locator('.beacon-impact-embed')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const result = () =>
  page.evaluate(() => {
    const deck = window.univerAPI.getPresentation('beacon-learning-impact')
    return Object.fromEntries(
      [
        ['overview', 'revenue-value'],
        ['overview', 'cost-value'],
        ['overview', 'surplus-value'],
        ['overview', 'margin-value'],
        ['revenue', 'revenue-detail'],
        ['costs', 'cost-detail'],
        ['bridge', 'surplus-detail'],
        ['bridge', 'margin-detail'],
      ].map(([p, id]) => [id, deck.getSlideById(p).getShape(id).getFormulaResult()]),
    )
  })
const snapshot = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        sheet: window.univerAPI.getWorkbook('beacon-learning-revenue').save(),
        base: window.univerAPI.getBase('beacon-learning-costs').save(),
        slides: window.univerAPI.getPresentation('beacon-learning-impact').save(),
      }),
    ),
  )
async function valueIs(id, expected) {
  await page.waitForFunction(
    ({ id: key, expected: value }) => {
      const r = window.univerAPI
        .getPresentation('beacon-learning-impact')
        .getSlideById('overview')
        .getShape(key)
        .getFormulaResult()
      return r?.value === value && !r.stale
    },
    { id, expected },
    { timeout: 30000 },
  )
}
async function go(id) {
  await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
  await settle()
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
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4274', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.beacon-impact-embed')
      return r?.dataset.ready || r?.dataset.error
    },
    {},
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,details,[data-action],iframe').count(), 0)
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  report.descriptors = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'beacon-learning-impact' }).map((e) => e.getDescriptor()),
  )
  assert.equal(report.descriptors.length, 2)
  assert.ok(report.descriptors.every((d) => d.entry === 'slides-floating-object' && d.context.resolved))
  await gate('opening-native-results', async () => {
    await valueIs('revenue-value', 10090)
    await valueIs('cost-value', 5600)
    await valueIs('surplus-value', 4490)
    report.opening = await result()
    assert.equal(Object.keys(report.opening).length, 8)
    assert.ok(Object.values(report.opening).every((r) => r.status === 'success' && !r.stale))
    assert.equal(report.opening['margin-value'].displayText, '44.50%')
    assert.equal(report.opening['revenue-detail'].value, 10090)
    assert.equal(report.opening['cost-detail'].value, 5600)
    assert.equal(report.opening['surplus-detail'].value, 4490)
    await page.screenshot({ path: path.join(directory, 'overview.png') })
  })
  for (const id of ['revenue', 'costs', 'bridge', 'overview'])
    await gate('native-page-' + id, async () => {
      await go(id)
      await page.screenshot({ path: path.join(directory, id + '.png') })
    })
  const expected = [
    [10290, 5600, 4690],
    [10290, 5900, 4390],
    [0, 5900, -5900],
    [10290, 5900, 4390],
    [10290, 3800, 6490],
    [10290, 5900, 4390],
  ]
  for (const [i, code] of examples.entries())
    await gate('literal-example-' + (i + 1), async () => {
      await go([0, 2, 3].includes(i) ? 'revenue' : 'costs')
      const nativeBaseEditing = process.env.SHOWCASE_BASE_FULLSCREEN === '1' && [1, 4, 5].includes(i)
      if (nativeBaseEditing) {
        await root
          .locator('[data-u-comp="embed-float-dom"][data-embed-id="beacon-impact-base-float"]')
          .dblclick({ position: { x: 180, y: 90 } })
        await page
          .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="beacon-impact-base-float"]')
          .getByRole('button', { name: 'Enter fullscreen', exact: true })
          .click()
        await page.locator('[data-embed-fullscreen-shell="true"]').waitFor()
        await settle()
      }
      const before = await snapshot()
      await page.evaluate(code)
      for (const [j, id] of ['revenue-value', 'cost-value', 'surplus-value'].entries())
        await valueIs(id, expected[i][j])
      const after = await snapshot()
      if ([0, 2, 3].includes(i)) assert.deepEqual(after.base, before.base, 'Sheet edit preserves Base')
      else assert.deepEqual(after.sheet, before.sheet, 'Base edit preserves Sheet')
      for (const id of ['overview', 'revenue', 'costs', 'bridge']) {
        const a = after.slides.slides[id],
          b = before.slides.slides[id]
        for (const key of ['kicker', 'title', 'footer'])
          assert.deepEqual(a.elements[key], b.elements[key], 'Formula update preserves authored ' + key)
        for (const key of a.elementOrder)
          assert.deepEqual(
            a.elements[key].transform,
            b.elements[key].transform,
            'Formula update preserves native layout',
          )
      }
      if (i === 2) {
        await valueIs('margin-value', '#DIV/0!')
        assert.equal((await result())['margin-value'].status, 'error')
      }
      if (i === 3) assert.equal((await result())['margin-value'].status, 'success')
      report.checks.push({ example: i + 1, expected: expected[i], results: await result() })
      if (nativeBaseEditing) {
        await page.locator('[data-embed-fullscreen-close="true"]').click()
        await page.locator('[data-embed-fullscreen-shell="true"]').waitFor({ state: 'detached' })
        await settle()
      }
      await go('overview')
      await page.screenshot({ path: path.join(directory, 'example-' + (i + 1) + '.png') })
    })
  await gate('selected-disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  assert.ok(Object.values(report.gates).every((g) => g.passed))
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.results = await result().catch(() => null)
  report.diagnostic = await page
    .evaluate(() => ({ text: document.body.innerText.slice(-3000), painted: window.painted?.slice(-100) }))
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
