import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { inflateRawSync, inflateSync } from 'node:zlib'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:4212/en-US/playground/sheets/univer-pro-import-export'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/import-export')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [], requests: [] }
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
let snapshotJson = ''
let failExport = false
let uploadCount = 0
const exportedFormats = []
const ok = { code: 1, message: 'success' }
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
}

const json = (route, body, status = 200) =>
  route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) })

await context.route('https://dev.univer.plus/**', async (route) => {
  const request = route.request()
  const requestUrl = new URL(request.url())
  report.requests.push({ method: request.method(), path: `${requestUrl.pathname}${requestUrl.search}` })
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })

  if (requestUrl.pathname.endsWith('/stream/file/upload')) {
    uploadCount += 1
    if (requestUrl.searchParams.get('flate') === 'true') {
      try {
        const body = request.postDataBuffer()
        assert.ok(body)
        const form = await new Response(body, {
          headers: { 'content-type': request.headers()['content-type'] },
        }).formData()
        const file = form.get('file')
        assert.ok(file instanceof Blob)
        const compressed = Buffer.from(await file.arrayBuffer())
        try {
          snapshotJson = inflateRawSync(compressed).toString()
        } catch {
          snapshotJson = inflateSync(compressed).toString()
        }
        const parsed = JSON.parse(snapshotJson)
        assert.ok(parsed.snapshot)
        assert.ok(parsed.sheetBlocks)
        report.upload = { compressedBytes: compressed.length, keys: Object.keys(parsed) }
      } catch (error) {
        report.errors.push(`Upload parser: ${error.stack || error}`)
        return json(route, { FileId: '', error: { code: 7, message: 'Mock upload parser failed' } })
      }
    }
    return json(route, { FileId: `upload-${uploadCount}`, error: ok })
  }

  if (requestUrl.pathname.endsWith('/exchange/2/export')) {
    const body = request.postDataJSON()
    exportedFormats.push(body.format)
    if (failExport) return json(route, { taskID: '', error: { code: 7, message: 'Not authorized' } })
    return json(route, { taskID: `export-${body.format}`, error: ok })
  }

  if (requestUrl.pathname.endsWith('/exchange/2/import')) {
    const body = request.postDataJSON()
    assert.equal(body.outputType, 2)
    return json(route, { taskID: 'import-roundtrip', error: ok })
  }

  if (requestUrl.pathname.endsWith('/exchange/task/import-roundtrip')) {
    return json(route, {
      taskID: 'import-roundtrip',
      status: 'done',
      error: ok,
      import: { outputType: 2, unitID: '', jsonID: 'snapshot-json' },
    })
  }

  if (requestUrl.pathname.includes('/exchange/task/export-')) {
    const format = requestUrl.pathname.endsWith('csv') ? 'csv' : 'xlsx'
    return json(route, {
      taskID: `export-${format}`,
      status: 'done',
      error: ok,
      export: { fileID: `output-${format}`, fileUrl: '' },
    })
  }

  if (requestUrl.pathname.endsWith('/file/snapshot-json/sign-url')) {
    assert.ok(snapshotJson)
    return json(route, { error: ok, url: 'https://exchange.test/snapshot.json' })
  }

  if (requestUrl.pathname.includes('/file/output-')) {
    const format = requestUrl.pathname.includes('csv') ? 'csv' : 'xlsx'
    return json(route, { error: ok, url: `https://exchange.test/output.${format}` })
  }

  return route.abort('failed')
})

await context.route('https://exchange.test/**', (route) => {
  const pathname = new URL(route.request().url()).pathname
  if (pathname === '/snapshot.json')
    return route.fulfill({ status: 200, headers: { ...cors, 'content-type': 'application/json' }, body: snapshotJson })
  if (pathname === '/output.csv')
    return route.fulfill({
      status: 200,
      headers: { ...cors, 'content-type': 'text/csv', 'content-disposition': 'attachment; filename=regional.csv' },
      body: 'Region,Account\nNorth,Roundtrip Labs\n',
    })
  return route.fulfill({
    status: 200,
    headers: {
      ...cors,
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': 'attachment; filename=regional.xlsx',
    },
    body: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]),
  })
})

const page = await context.newPage()
await page.addInitScript(() => {
  window.exchangePaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.exchangePaint.length < 5000) window.exchangePaint.push(String(text))
    return fillText.call(this, text, ...args)
  }
})
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  const root = page.locator('.exchange-demo[data-ready="true"]')
  await root.waitFor({ timeout: 120000 })
  assert.equal(await root.locator('.exchange-controls button').count(), 4)
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .evaluate((element) => getComputedStyle(element).backgroundColor),
    'rgb(255, 255, 255)',
  )
  report.checks.push('Four shared controls, real canvas and opaque-white official SDK workbench')

  const nameBox = root.locator('.exchange-editor input.univer-size-full').first()
  await nameBox.fill('B2')
  await nameBox.press('Enter')
  await page.keyboard.type('Roundtrip Labs')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => window.exchangePaint.includes('Roundtrip Labs'))

  const xlsxDownload = page.waitForEvent('download')
  await root.getByRole('button', { name: 'Export XLSX', exact: true }).click()
  const xlsx = await xlsxDownload
  const xlsxPath = path.join(directory, 'regional.xlsx')
  await xlsx.saveAs(xlsxPath)
  assert.deepEqual([...(await fs.readFile(xlsxPath))], [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00])
  await page.waitForFunction(
    () => document.querySelector('.exchange-controls output')?.textContent === 'Export XLSX complete',
  )
  assert.ok(snapshotJson.length > 1000)
  report.checks.push('XLSX button exports the live Facade snapshot and downloads the service result')

  await page.evaluate(() => {
    window.exchangePaint = []
  })
  await root.getByRole('button', { name: 'Reset workbook', exact: true }).click()
  await page.waitForFunction(() => window.exchangePaint.includes('Aurora Outfitters'))

  const chooser = page.waitForEvent('filechooser')
  await root.getByRole('button', { name: 'Import file', exact: true }).click()
  await (
    await chooser
  ).setFiles({ name: 'roundtrip.csv', mimeType: 'text/csv', buffer: Buffer.from('ignored by service') })
  await page.waitForFunction(
    () => document.querySelector('.exchange-controls output')?.textContent === 'Import roundtrip.csv complete',
  )
  await page.waitForFunction(() => window.exchangePaint.includes('Roundtrip Labs'))
  report.checks.push('Import button opens the file chooser and replaces the workbook with the Exchange snapshot')

  const csvDownload = page.waitForEvent('download')
  await root.getByRole('button', { name: 'Export active sheet CSV', exact: true }).click()
  const csv = await csvDownload
  const csvPath = path.join(directory, 'regional.csv')
  await csv.saveAs(csvPath)
  assert.equal(await fs.readFile(csvPath, 'utf8'), 'Region,Account\nNorth,Roundtrip Labs\n')
  assert.deepEqual(exportedFormats.slice(0, 2), ['xlsx', 'csv'])
  report.checks.push('CSV button sends the active-sheet format request and downloads the returned bytes')
  await page.screenshot({ path: path.join(directory, 'import-export.png') })

  failExport = true
  await root.getByRole('button', { name: 'Export XLSX', exact: true }).click()
  await page.waitForFunction(() =>
    document.querySelector('.exchange-controls output')?.textContent?.includes('returned no file'),
  )
  assert.match(await root.locator('output').textContent(), /authorization and file format/)
  report.checks.push('Unauthorized service response reports no file instead of false success')

  assert.ok(report.requests.every(({ path: requestPath }) => requestPath.startsWith('/universer-api/')))
  assert.deepEqual(report.errors, [])
  await page.screenshot({ path: path.join(directory, 'import-export-error.png') })
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
} finally {
  await context.close()
  await browser.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
}

console.log(JSON.stringify(report, null, 2))
assert.equal(report.passed, true)
