/* eslint-disable no-await-in-loop -- Preserve the documented source-edit sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-atlas-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/slides-in-sheets-formula-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 5)
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
    (['xhr', 'fetch'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.painted = []
  window.childPainted = []
  const clear = CanvasRenderingContext2D.prototype.clearRect
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    if (this.canvas.closest('[data-u-comp="embed-float-dom"]')) window.childPainted = []
    return Reflect.apply(clear, this, args)
  }
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    if (this.canvas.closest('[data-u-comp="embed-float-dom"]')) {
      window.childPainted.push(String(args[0]))
      if (window.childPainted.length > 10000) window.childPainted.splice(0, 5000)
    }
    if (window.painted.length > 20000) window.painted.splice(0, 10000)
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.atlas-embed')
const float = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="atlas-slide-float"]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
async function paintedValues(ids) {
  const current = await results()
  const title = ids[0].startsWith('review-') ? 'Keep the model in the conversation.' : 'A quote with room to deliver.'
  await page.waitForFunction(
    (values) => values.every((v) => window.childPainted.join('').includes(v)),
    [title, ...ids.map((id) => current[id].displayText)],
  )
}
const results = () =>
  page.evaluate(() => {
    const deck = window.univerAPI.getPresentation('atlas-quote-decision')
    return Object.fromEntries(
      [
        ['decision', 'quote-value'],
        ['decision', 'cost-value'],
        ['decision', 'contribution-value'],
        ['decision', 'margin-value'],
        ['review', 'review-cost'],
        ['review', 'review-margin'],
      ].map(([p, id]) => [id, deck.getSlideById(p).getShape(id).getFormulaResult()]),
    )
  })
const authored = () =>
  page.evaluate(() => {
    const slides = window.univerAPI.getPresentation('atlas-quote-decision').save().slides
    return JSON.parse(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(slides).map(([id, p]) => [
            id,
            {
              text: ['kicker', 'title', 'footer', ...(id === 'review' ? ['explanation'] : [])].map(
                (k) => p.elements[k],
              ),
              geometry: Object.fromEntries(p.elementOrder.map((k) => [k, p.elements[k].transform])),
            },
          ]),
        ),
      ),
    )
  })
async function checkValues(expectedQuote, expectedCost, expectedMargin) {
  await page.waitForFunction(
    ({ quote, cost, margin }) => {
      const deck = window.univerAPI.getPresentation('atlas-quote-decision')
      const specs = [
        ['decision', 'quote-value', quote],
        ['decision', 'cost-value', cost],
        ['decision', 'contribution-value', quote - cost],
        ['decision', 'margin-value', margin],
        ['review', 'review-cost', cost],
        ['review', 'review-margin', margin],
      ]
      return specs.every(([p, id, v]) => {
        const r = deck.getSlideById(p).getShape(id).getFormulaResult()
        return (
          r &&
          !r.stale &&
          (typeof v === 'string'
            ? r.value === v && r.status === 'error'
            : Math.abs(r.value - v) < 1e-9 && r.status === 'success')
        )
      })
    },
    { quote: expectedQuote, cost: expectedCost, margin: expectedMargin },
    { timeout: 30000 },
  )
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
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4276', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.atlas-embed')
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
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'atlas-quote-model' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'sheets-floating-object')
  assert.equal(report.descriptor.childUnitId, 'atlas-quote-decision')
  assert.equal(report.descriptor.context.resolved, true)
  await checkValues(12000, 8400, 0.3)
  report.opening = await results()
  await page.waitForFunction(() => window.painted.join('').includes('A quote with room'))
  await paintedValues(['quote-value', 'cost-value', 'contribution-value', 'margin-value'])
  await page.screenshot({ path: path.join(directory, 'overview.png') })
  const initialAuthored = await authored()
  const expected = [
    [12000, 9000, 0.25],
    [13200, 9000, 4200 / 13200],
    [0, 9000, '#DIV/0!'],
    [12000, 9000, 0.25],
    [12000, 8400, 0.3],
  ]
  for (const [i, code] of examples.entries()) {
    await page.evaluate(() => {
      window.painted = []
      window.childPainted = []
    })
    await page.evaluate(code)
    await checkValues(...expected[i])
    assert.deepEqual(await authored(), initialAuthored, 'All source edits preserve native prose and layout')
    report.checks.push({ example: i + 1, expected: expected[i], results: await results() })
    await settle()
    await paintedValues(['quote-value', 'cost-value', 'contribution-value', 'margin-value'])
    await page.screenshot({ path: path.join(directory, 'example-' + (i + 1) + '.png') })
  }
  await gate('native-navigation', async () => {
    await float.dblclick({ position: { x: 210, y: 115 } })
    await page.evaluate(() => {
      window.childPainted = []
    })
    await page.getByRole('button', { name: 'Next page', exact: true }).click()
    await page.waitForFunction(() => window.painted.join('').includes('Keep the model'))
    await checkValues(12000, 8400, 0.3)
    await paintedValues(['review-cost', 'review-margin'])
    await page.screenshot({ path: path.join(directory, 'review.png') })
    await page.getByRole('button', { name: 'Previous page', exact: true }).click()
  })
  await gate('native-host-keyboard', async () => {
    const namebox = root.locator('[data-u-comp="defined-name"] input')
    await page.evaluate(() => {
      window.childPainted = []
    })
    await namebox.fill('B8')
    await namebox.press('Enter')
    await page.keyboard.type('3000')
    await page.keyboard.press('Enter')
    await checkValues(12000, 9000, 0.25)
    assert.deepEqual(await authored(), initialAuthored)
    await paintedValues(['cost-value', 'margin-value'])
    await page.screenshot({ path: path.join(directory, 'keyboard.png') })
    await page.keyboard.press('Control+z')
    await checkValues(12000, 8400, 0.3)
  })
  await gate('native-fullscreen', async () => {
    await float.dblclick({ position: { x: 210, y: 115 } })
    await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click()
    await page.locator('[data-embed-fullscreen-shell="true"]').waitFor()
    await checkValues(12000, 8400, 0.3)
    await page.screenshot({ path: path.join(directory, 'fullscreen.png') })
    await page.locator('[data-embed-fullscreen-close="true"]').click()
    await page.locator('[data-embed-fullscreen-shell="true"]').waitFor({ state: 'detached' })
    await root.locator('[data-u-comp="defined-name"] input').waitFor()
  })
  await gate('selected-disposal', async () => {
    if (process.env.SHOWCASE_DISPOSE_FULLSCREEN === '1') {
      await float.dblclick({ position: { x: 210, y: 115 } })
      await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click()
      await page.locator('[data-embed-fullscreen-shell="true"]').waitFor()
      report.disposedWhileFullscreen = true
    }
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
  report.results = await results().catch(() => null)
  report.childPainted = await page.evaluate(() => window.childPainted?.slice(-100)).catch(() => null)
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
