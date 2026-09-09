/* eslint-disable no-await-in-loop -- Native edits and their history are sequential. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const manifest = JSON.parse(
  await fs.readFile(process.argv[2] || 'test-results/postmortem-native-export/exports.json', 'utf8'),
)
const entry = manifest.find((item) => item.slug === 'docs-modern/incident-postmortem')
assert.ok(entry)
const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/postmortem-native'
await fs.mkdir(output, { recursive: true })
const source = (await readShowcaseSources()).find((item) => item.slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content, name)
const { preview } = await import(pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js')))
const server = await preview({
  configFile: false,
  root: entry.directory,
  preview: { host: '127.0.0.1', port: 4418, strictPort: true },
})
const browser = await chromium.launch()
const report = {
  passed: false,
  sourceFiles: Object.keys(source.files).length,
  gates: {},
  errors: [],
  backendRequests: [],
}
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
await context.addInitScript(() => {
  const addEventListener = window.addEventListener
  window.addEventListener = function (type, listener, options) {
    if (type === 'pagehide') window.incidentPagehide = listener
    return addEventListener.call(this, type, listener, options)
  }
  window.incidentPaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    window.incidentPaint.push(String(text))
    return fillText.call(this, text, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(30000)
page.on('pageerror', (error) => report.errors.push(String(error)))
page.on('request', (request) => {
  if (request.url().includes('/universer-api/') || !['GET', 'HEAD', 'OPTIONS'].includes(request.method()))
    report.backendRequests.push(request.url())
})
const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveDocument().save())))
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const examples = [
  ...(await fs.readFile('showcase/docs-modern/incident-postmortem/code/README.md', 'utf8')).matchAll(
    /```ts\r?\n([\s\S]*?)```/g,
  ),
].map((match) => match[1])
assert.equal(examples.length, 2)
async function gate(name, check) {
  try {
    await check()
    report.gates[name] = { passed: true }
  } catch (error) {
    report.gates[name] = { passed: false, error: String(error) }
  }
}
async function paint(text) {
  await page.waitForFunction((value) => window.incidentPaint.join('').includes(value), text, { timeout: 10000 })
  await page.waitForFunction(() => {
    const canvas = document.getElementById('univer-doc-main-canvas')
    if (!canvas?.width || !canvas.height) return false
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
    let ink = 0
    for (let offset = 0; offset < pixels.length; offset += 4)
      if (pixels[offset + 3] > 200 && pixels[offset] < 180 && pixels[offset + 1] < 180 && pixels[offset + 2] < 180)
        ink++
    return ink > 2000
  })
  await settle()
}
try {
  await page.goto('http://127.0.0.1:4418')
  await paint('A-04')
  await gate('original-report-and-native-grid', async () => {
    const model = await snapshot()
    assert.equal(model.id, 'incident-postmortem-sev-1')
    for (const text of ['42 minutes', '18%', '09:46', 'EVT-203', 'A-04 · OPEN'])
      assert.ok(model.body.dataStream.includes(text), text)
    await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
    assert.match(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((node) => getComputedStyle(node).fontFamily),
      /Arial/,
    )
    for (const heading of [
      'Containment decision',
      'Customer communication',
      'Validation and release gate',
      'What remains uncertain',
    ])
      assert.ok(model.body.dataStream.includes(heading), heading)
    assert.equal(await page.getByRole('button', { name: 'Reset postmortem', exact: true }).count(), 0)
    await page.screenshot({ path: path.join(output, 'baseline.png') })
  })
  const baseline = await snapshot()
  await gate('literal-remediation-current-paint', async () => {
    await page.evaluate(() => {
      window.incidentPaint = []
    })
    await page.evaluate('(async () => {' + examples[0] + '})()')
    await paint('COMPLETE')
    const model = await snapshot()
    assert.equal(
      model.body.dataStream,
      baseline.body.dataStream.replace(
        'A-04 · OPEN · Add retry-budget alert · Owner: Priya · Due: 2027-01-19',
        'A-04 · COMPLETE · Retry-budget alert shipped · Owner: Priya · Completed: 2027-01-15',
      ),
    )
    await page.screenshot({ path: path.join(output, 'completed.png') })
  })
  const completed = await snapshot()
  await gate('repeat-is-idempotent-without-hidden-state', async () => {
    await page.evaluate('(async () => {' + examples[0] + '})()')
    assert.deepEqual(await snapshot(), completed)
  })
  await gate('literal-save-no-mutation', async () => {
    await page.evaluate('(async () => {' + examples[1] + '})()')
    assert.deepEqual(await snapshot(), completed)
  })
  await gate('same-owner-theme-retains-complete-model', async () => {
    await page.evaluate(() => {
      window.incidentOwner = window.univerAPI
      window.univerAPI.toggleDarkMode(true)
    })
    await settle()
    assert.deepEqual(await snapshot(), completed)
    await page.screenshot({ path: path.join(output, 'dark.png') })
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.equal(await page.evaluate(() => window.incidentOwner === window.univerAPI), true)
    assert.deepEqual(await snapshot(), completed)
  })
  await gate('native-title-input', async () => {
    await page.mouse.dblclick(520, 235)
    await page.keyboard.press('Home')
    await page.keyboard.type('Reviewed ')
    await settle()
    const model = await snapshot()
    assert.ok(model.body.dataStream.includes('Reviewed '))
    await page.screenshot({ path: path.join(output, 'native-input.png') })
  })
  const edited = await snapshot()
  await gate('native-undo-full-model', async () => {
    await page.keyboard.press('Control+z')
    await settle()
    const actual = await snapshot()
    await fs.writeFile(path.join(output, 'undo-model.json'), JSON.stringify(actual, null, 2))
    assert.deepEqual(actual, completed)
  })
  await gate('native-redo-full-model', async () => {
    await page.keyboard.press('Control+y')
    await settle()
    assert.deepEqual(await snapshot(), edited)
  })
  await gate('native-follow-up-review-navigation', async () => {
    await page.keyboard.press('Control+End')
    await paint('What remains uncertain')
    assert.deepEqual(await snapshot(), edited, 'Navigating the report must not rewrite it')
    await page.screenshot({ path: path.join(output, 'follow-up-review.png') })
  })
  await gate('actual-entry-idempotent-disposal', async () => {
    assert.equal(await page.evaluate(() => typeof window.incidentPagehide), 'function')
    await page.evaluate(() => {
      window.incidentPagehide()
      window.incidentPagehide()
    })
    await settle()
    assert.equal(await page.locator('.incident-postmortem-demo').count(), 0)
    assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
    assert.equal(await page.locator('canvas').count(), 0)
  })
  await gate('initial-chinese-native-ui-and-original-content', async () => {
    await page.route('http://127.0.0.1:4418/', async (route) => {
      const response = await route.fetch()
      const html = await response.text()
      assert.ok(html.includes('lang="en"'))
      await route.fulfill({ response, body: html.replace('lang="en"', 'lang="zh-CN"') })
    })
    await page.goto('http://127.0.0.1:4418/')
    await paint('A-04')
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'zh-CN')
    const toolbar = await page.locator('[data-u-comp=ribbon-grid-toolbar]').innerText()
    await fs.writeFile(path.join(output, 'chinese-toolbar.txt'), toolbar)
    await page.screenshot({ path: path.join(output, 'initial-zh.png') })
    assert.ok(toolbar.includes('正文') && toolbar.includes('页面设置'))
    assert.equal((await snapshot()).body.dataStream, baseline.body.dataStream)
    await page.screenshot({ path: path.join(output, 'initial-zh.png') })
  })
  await gate('no-runtime-or-backend-errors', async () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
  })
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
  report.passed = Object.values(report.gates).every((result) => result.passed)
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
}
assert.ok(report.passed, 'All scoped gates must pass; this is not full capability acceptance')
