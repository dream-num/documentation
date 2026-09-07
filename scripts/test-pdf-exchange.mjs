import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { inflateRawSync } from 'node:zlib'

import { chromium } from 'playwright'

// Real service acceptance by default; --service-errors only tests rejected requests, never conversion success.
// Only the original fictional report and its own exported PDF are sent to Exchange.
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-exchange')
await fs.mkdir(directory, { recursive: true })
const serviceErrors = process.argv.includes('--service-errors')
const report = {
  mode: serviceErrors ? 'service-error-injection' : 'real-service',
  passed: false,
  checks: [],
  requests: [],
  responses: [],
  errors: [],
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
const rejectedUploads = []
if (serviceErrors)
  await page.route('**/universer-api/**', (route) => {
    rejectedUploads.push(route.request())
    return route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 7, message: 'Test service authorization denied' } }),
    })
  })
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  const url = new URL(request.url())
  if (url.pathname.startsWith('/universer-api/')) report.requests.push({ method: request.method(), path: url.pathname })
})
page.on('response', (response) => {
  const url = new URL(response.url())
  if (url.pathname.startsWith('/universer-api/'))
    report.responses.push({ status: response.status(), path: url.pathname })
})
const root = page.locator('.financial-report')
const read = async () => JSON.parse(await root.locator('output').textContent())
const idle = (timeout = 120000) => root.locator('fieldset:not([disabled])').waitFor({ state: 'attached', timeout })
const error = () => root.locator(':scope > [role=alert]')
const click = async (action, expectedError) => {
  await root.locator(`[data-action=${action}]`).click()
  await idle(action === 'export-pdf' ? 990000 : 120000)
  if (expectedError) assert.match(await error().textContent(), expectedError)
  else assert.equal(await error().isVisible(), false, await error().textContent())
}
try {
  await page.goto(process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/pdfs/financial-report', {
    waitUntil: 'load',
    timeout: 180000,
  })
  await idle()
  const original = (await read()).snapshot
  await root.locator('.financial-controls > summary').click()
  assert.equal(await root.locator('[data-action=import-pdf]').isDisabled(), true)
  assert.equal(await root.locator('[data-action=export-pdf]').isDisabled(), true)
  assert.equal(report.requests.length, 0, 'Loading the report must not upload it')
  const fileInput = root.locator('[data-input=pdf-file]')
  await fileInput.setInputFiles({
    name: 'no-consent.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.7\n'),
  })
  await idle()
  assert.match(await error().textContent(), /Allow the conversion service/)
  assert.equal(report.requests.length, 0)
  assert.deepEqual((await read()).snapshot, original)
  await root.locator('[data-input=exchange-consent]').check()
  await fileInput.setInputFiles({ name: 'invalid.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') })
  await idle()
  assert.match(await error().textContent(), /non-empty PDF/)
  assert.equal(report.requests.length, 0)
  assert.deepEqual((await read()).snapshot, original)
  report.checks.push('Consent and header validation prevent upload and preserve the current report')
  await click('highlight')
  const reviewed = (await read()).snapshot
  if (serviceErrors) {
    const downloads = []
    page.on('download', (download) => downloads.push(download.suggestedFilename()))
    await click('export-pdf', /authentication and service availability/)
    assert.deepEqual((await read()).snapshot, reviewed)
    assert.deepEqual(downloads, [])
    // Inspect the actual SDK request before the injected rejection. No successful conversion is fabricated.
    const upload = rejectedUploads[0]
    assert.equal(new URL(upload.url()).searchParams.get('flate'), 'true')
    const form = await new Response(upload.postDataBuffer(), {
      headers: { 'content-type': upload.headers()['content-type'] },
    }).formData()
    const compressed = Buffer.from(await form.get('file').arrayBuffer())
    const payload = JSON.parse(inflateRawSync(compressed).toString('utf8'))
    const transmitted = JSON.parse(Buffer.from(payload.snapshot.pdf.originalMeta, 'base64').toString('utf8'))
    assert.deepEqual(transmitted, reviewed, 'The actual upload must contain the complete live annotated snapshot')
    assert.equal(payload.snapshot.pdf.unitID, reviewed.id)
    assert.equal(payload.snapshot.pdf.name, reviewed.name)
    report.exportUpload = { compressedBytes: compressed.length, exactSnapshot: true }
    report.checks.push('Actual compressed SDK export upload preserves every live snapshot field and the review mark')
    await fileInput.setInputFiles({
      name: 'rejected.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.7\n'),
    })
    await idle()
    assert.match(await error().textContent(), /current report has not been replaced/)
    assert.deepEqual((await read()).snapshot, reviewed)
    assert.equal(await root.locator('[data-action=import-pdf]').isDisabled(), false)
    assert.equal(await root.locator('[data-action=export-pdf]').isDisabled(), false)
    assert.equal(report.responses.length, 2)
    assert.ok(report.responses.every((response) => response.status === 401))
    const importRequest = rejectedUploads[1]
    const importForm = await new Response(importRequest.postDataBuffer(), {
      headers: { 'content-type': importRequest.headers()['content-type'] },
    }).formData()
    assert.equal(importForm.get('file').name, 'rejected.pdf')
    assert.equal(await importForm.get('file').text(), '%PDF-1.7\n')
    report.checks.push('Actual SDK import upload carries the selected file bytes and filename unchanged')
    report.checks.push(
      'Injected 401 import/export errors preserve the annotated report, restore controls and never download a substitute file',
    )
  } else {
    const pendingDownload = page.waitForEvent('download', { timeout: 990000 }).catch((failure) => ({ failure }))
    await click('export-pdf')
    const download = await pendingDownload
    assert.ok(!download.failure, String(download.failure))
    assert.equal(download.suggestedFilename(), 'asteria-annual-review.pdf')
    const exported = path.join(directory, 'asteria-annual-review.pdf')
    await download.saveAs(exported)
    const bytes = await fs.readFile(exported)
    assert.match(bytes.subarray(0, 1024).toString(), /%PDF-\d\.\d/)
    assert.ok(bytes.length > 1000)
    assert.deepEqual((await read()).snapshot, reviewed, 'Export must not mutate the current report')
    report.export = { bytes: bytes.length, filename: path.basename(exported) }
    report.checks.push(
      'Real Exchange export returns a binary PDF through the Facade download API without changing the snapshot',
    )
    await fileInput.setInputFiles(exported)
    await idle(990000)
    assert.equal(await error().isVisible(), false, await error().textContent())
    await page.waitForFunction(
      () => {
        const state = JSON.parse(document.querySelector('.financial-report output').textContent)
        return state.loadedFixture === 'imported' && state.nativeText.join(' ').includes('Annual performance')
      },
      undefined,
      { timeout: 120000 },
    )
    const imported = await read()
    assert.equal(imported.pages.length, 14)
    assert.equal(await root.locator('[data-action=fixture]').isDisabled(), true)
    assert.equal(
      await root.locator('[data-action=find]').isDisabled(),
      true,
      'Imported binary text is not the seeded paragraph ID',
    )
    await fs.writeFile(path.join(directory, 'imported.json'), JSON.stringify(imported.snapshot, null, 2))
    await root.locator('.financial-controls > summary').click()
    await page.screenshot({ path: path.join(directory, 'imported.png') })
    await root.locator('.financial-controls > summary').click()
    report.checks.push(
      'Real exported PDF imports through the Facade into fourteen native pages with visible text readback',
    )
  }
  await click('reset')
  assert.deepEqual((await read()).snapshot, original)
  await root.locator('[data-input=exchange-consent]').uncheck()
  assert.equal(await root.locator('[data-action=import-pdf]').isDisabled(), true)
  assert.equal(await root.locator('[data-action=export-pdf]').isDisabled(), true)
  report.checks.push(
    'Reset restores the complete seeded report and withdrawing consent disables both conversion actions',
  )
  if (serviceErrors) {
    assert.ok(report.errors.length >= 2)
    assert.ok(
      report.errors.every((message) => /401 \(Unauthorized\)|\[XHRHTTPImplementation\]: network error/.test(message)),
      JSON.stringify(report.errors),
    )
  } else assert.deepEqual(report.errors, [])
  report.passed = true
} catch (failure) {
  report.failure = failure.stack || String(failure)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  throw failure
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
