/* eslint-disable no-await-in-loop -- Each iframe owns an independent editor. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

function compareLeaves(actual, pack) {
  for (const [key, value] of Object.entries(pack)) {
    if (value && typeof value === 'object') compareLeaves(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
  }
}

const [entry] = JSON.parse(await fs.readFile('test-results/isolated-native-export/exports.json', 'utf8'))
const source = (await readShowcaseSources()).find((x) => x.slug === entry.slug)
for (const [name, data] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), data, name)
const { preview } = await import(pathToFileURL(entry.directory + '/node_modules/vite/dist/node/index.js'))
const server = await preview({
  configFile: false,
  root: entry.directory,
  preview: { host: '127.0.0.1', port: 4418, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } })
const report = {
  passed: false,
  sourceFiles: Object.keys(source.files).length,
  errors: [],
  checks: [],
  historyFailures: [],
}
const output = 'test-results/isolated-native-lifecycle'
await fs.mkdir(output, { recursive: true })
page.on('pageerror', (e) => report.errors.push(e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  await page.goto('http://127.0.0.1:4418')
  const frames = {}
  for (const side of ['north', 'south']) {
    const locator = page.frameLocator(`iframe[data-region="${side}"]`)
    await locator.locator('.isolated-region[data-ready=true][data-mounted=true]').waitFor({ timeout: 60000 })
    frames[side] = await (await page.locator(`iframe[data-region="${side}"]`).elementHandle()).contentFrame()
    assert.equal(await locator.locator('.region-controls button').count(), 3)
    assert.equal(
      await locator.locator('.region-controls input,.region-controls select,.region-controls details').count(),
      0,
    )
    assert.equal(
      await frames[side].evaluate(() => document.documentElement.classList.contains('univer-dark')),
      side === 'south',
    )
    await frames[side].waitForFunction(() => [...document.querySelectorAll('canvas')].some((c) => c.width > 500))
  }
  report.checks.push('Two original independent themes; only lifecycle/download host controls')
  const save = (side) => frames[side].evaluate(() => window.regionalDemo.univerAPI.getActiveWorkbook().save())
  const south = await save('south')
  const recipes = [
    ...(await fs.readFile('showcase/embed/multiple-isolated-instances/code/README.md', 'utf8')).matchAll(
      /```ts\r?\n([\s\S]*?)```/g,
    ),
  ]
  await frames.north.evaluate(
    async (code) => await new (Object.getPrototypeOf(async function () {}).constructor)(code)(),
    recipes[0][1],
  )
  assert.deepEqual(await save('south'), south)
  assert.equal(
    await frames.north.evaluate(() =>
      window.regionalDemo.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').getRawValue(),
    ),
    21.5,
  )
  report.checks.push('Literal guarded North edit preserves entire South snapshot')
  await page.frameLocator('iframe[data-region="north"]').getByRole('button', { name: 'Release', exact: true }).click()
  await frames.north.waitForFunction(() => document.querySelector('.isolated-region')?.dataset.mounted === 'false')
  assert.deepEqual(await save('south'), south)
  const nativeCanvas = frames.south
    .locator('[data-u-comp="render-canvas"]:not(#univer-doc-main-canvas):visible')
    .first()
  await nativeCanvas.dblclick({ position: { x: 366, y: 111 } })
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText('40')
  await page.keyboard.press('Enter')
  const waitSouthPrice = (value) =>
    frames.south.waitForFunction(
      (expected) =>
        window.regionalDemo.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').getRawValue() === expected,
      value,
    )
  await waitSouthPrice(40)
  await frames.south.evaluate(() => window.regionalDemo.univerAPI.getFormula().onCalculationResultApplied(10000))
  const edited = await save('south')
  await page.keyboard.press('Control+z')
  await waitSouthPrice(34.6)
  await frames.south.evaluate(() => window.regionalDemo.univerAPI.getFormula().onCalculationResultApplied(10000))
  const undone = await save('south')
  try {
    assert.deepEqual(undone, south)
  } catch (error) {
    report.historyFailures.push({ operation: 'Undo', failure: error.message })
  }
  await page.keyboard.press('Control+y')
  await waitSouthPrice(40)
  await frames.south.evaluate(() => window.regionalDemo.univerAPI.getFormula().onCalculationResultApplied(10000))
  try {
    assert.deepEqual(await save('south'), edited)
  } catch (error) {
    report.historyFailures.push({ operation: 'Redo', failure: error.message })
  }
  await fs.writeFile(
    output + '/native-history.json',
    JSON.stringify({ before: south, edited, undone, redone: await save('south') }, null, 2),
  )
  report.checks.push(
    'South native double-click/typing and numeric Undo/Redo while North is released; full history checked separately',
  )
  await page.frameLocator('iframe[data-region="north"]').getByRole('button', { name: 'Mount', exact: true }).click()
  await frames.north.waitForFunction(
    () => document.querySelector('.isolated-region')?.dataset.ready === 'true' && !!window.regionalDemo.univerAPI,
  )
  assert.equal(
    await frames.south.evaluate(() =>
      window.regionalDemo.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').getRawValue(),
    ),
    40,
  )
  report.checks.push('Selective release and remount preserve surviving owner edit')
  for (const side of ['north', 'south']) {
    const before = await save(side)
    const pending = page.waitForEvent('download')
    await page
      .frameLocator(`iframe[data-region="${side}"]`)
      .getByRole('button', { name: 'Download JSON', exact: true })
      .click()
    const download = await pending
    assert.equal(download.suggestedFilename(), `${side}-maintenance.json`)
    assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), before)
    assert.deepEqual(await save(side), before)
  }
  report.checks.push('Both real JSON downloads match complete native snapshots without mutation')
  const northBeforeLocale = await save('north')
  const southBeforeLocale = await save('south')
  await frames.north.evaluate(() => window.regionalDemo.univerAPI.setLocale('zhCN'))
  await frames.north.getByText('开始', { exact: true }).first().waitFor()
  await frames.south.getByText('Start', { exact: true }).first().waitFor()
  assert.deepEqual(await save('north'), northBeforeLocale)
  assert.deepEqual(await save('south'), southBeforeLocale)
  report.checks.push('Native Chinese North and English South preserve both complete models')
  await page.screenshot({ path: output + '/current.png' })
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue()
    const response = await route.fetch()
    const html = await response.text()
    await route.fulfill({ response, body: html.replace(/lang="[^"]*"/, 'lang="zh-CN"') })
  })
  await page.reload()
  for (const side of ['north', 'south']) {
    const child = page.frameLocator(`iframe[data-region="${side}"]`)
    await child.locator('.isolated-region[data-ready=true][data-mounted=true]').waitFor({ timeout: 60000 })
    await child.getByRole('button', { name: '释放', exact: true }).waitFor()
    await child.getByRole('button', { name: '下载 JSON', exact: true }).waitFor()
    await child.getByText('开始', { exact: true }).first().waitFor()
    const nativeFrame = await (await page.locator(`iframe[data-region="${side}"]`).elementHandle()).contentFrame()
    const expected = (await import('@univerjs/preset-sheets-core/locales/zh-CN')).default
    const locales = await nativeFrame.evaluate(() => window.regionalDemo.univerAPI.getLocales())
    compareLeaves(locales, expected)
  }
  report.checks.push('Initial Chinese host buttons and native Grid with every official Chinese core locale leaf')
  await page.screenshot({ path: output + '/initial-zh.png' })
  const southFrame = await (await page.locator('iframe[data-region="south"]').elementHandle()).contentFrame()
  await southFrame.evaluate(async () => {
    const owner = window.regionalDemo
    const first = owner.dispose()
    if (owner.dispose() !== first) throw new Error('Disposal must return the same promise')
    await first
    if (owner.univerAPI || document.querySelector('.isolated-region') || document.querySelector('canvas'))
      throw new Error('Disposed region retains owner or native DOM')
  })
  report.checks.push('Child double disposal releases API and native canvases')
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
  await page.waitForFunction(() => document.querySelectorAll('iframe').length === 0)
  report.checks.push('Actual standalone pagehide cleanup removes both frames after owner cleanup')
  assert.deepEqual(report.errors, [])
  report.passed = report.historyFailures.length === 0
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: output + '/failure.png' }).catch(() => {})
} finally {
  await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
