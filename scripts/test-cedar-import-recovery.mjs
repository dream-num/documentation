import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = 'test-results/cedar-import-recovery'
await fs.mkdir(output, { recursive: true })
const manifest = JSON.parse(await fs.readFile('test-results/cedar-lazy-native-r2/exports.json', 'utf8'))[0]
const source = (await readShowcaseSources()).find((item) => item.slug === manifest.slug)
await Promise.all(
  Object.entries(source.files).map(async ([name, content]) => {
    const target = path.join(manifest.directory, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }),
)
const { build, preview } = await import(
  pathToFileURL(path.join(manifest.directory, 'node_modules/vite/dist/node/index.js'))
)
await build({ root: manifest.directory, configFile: false, logLevel: 'warn' })
const assets = await fs.readdir(path.join(manifest.directory, 'dist/assets'))
const editorAsset = assets.find((name) => /^editor-.*\.js$/.test(name))
assert.ok(editorAsset, 'Actual deferred editor chunk')
const server = await preview({
  root: manifest.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4416, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const report = { passed: false, editorAsset, checks: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
try {
  let requests = 0
  const pattern = '**/' + editorAsset
  await page.route(pattern, (route) => {
    requests++
    return route.abort('failed')
  })
  await page.goto('http://127.0.0.1:4416')
  assert.equal(requests, 0, 'Editor bytes not loaded before activation')
  await page.locator('[data-action=load]').click()
  await page.locator('.lazy-load-demo[data-phase=error]').waitFor()
  const button = page.getByRole('button', { name: 'Page refresh required', exact: true })
  assert.equal(await button.isDisabled(), true)
  assert.match(await page.getByRole('alert').innerText(), /Save other page work.*refresh/)
  assert.equal(await page.locator('canvas').count(), 0)
  assert.equal(requests, 1)
  await page.screenshot({ path: output + '/import-failed.png' })
  report.checks.push('Real aborted import: disabled retry, explicit save-before-refresh guidance, no owner')
  await page.unroute(pattern)
  await page.reload()
  await page.locator('[data-action=load]').click()
  await page.locator('.lazy-load-demo[data-phase=ready]').waitFor({ timeout: 30000 })
  await page.waitForFunction(
    () =>
      window.univerAPI?.getWorkbook('cedar-routes')?.getSheetBySheetId('routes')?.getRange('F18').getRawValues()[0][0] >
      0,
  )
  assert.equal(
    await page.locator('[data-u-comp=workbench-layout]').evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  )
  report.checks.push('Explicit browser reload recovers real SDK owner, formula result and official white workbench')
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  process.exitCode = 1
} finally {
  await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2))
  await fs.writeFile(output + '/exports.json', JSON.stringify([manifest], null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  await server.close()
}
