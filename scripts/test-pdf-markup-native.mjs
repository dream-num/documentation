/* eslint-disable no-await-in-loop -- Validate the literal guide and native gestures sequentially. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const dir = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-markup-native')
await fs.mkdir(dir, { recursive: true })
const snippets = [
  ...(await fs.readFile('showcase/pdfs/text-markup/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(snippets.length, 12)
const report = { passed: false, checks: [], gates: {}, errors: [], warnings: [], backendRequests: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(12000)
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['fetch', 'xhr'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
const root = page.locator('.pdf-markup')
const settle = () =>
  page.evaluate(async () => {
    await document.fonts.ready
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  })
const run = (code) => page.evaluate('(() => {\n' + code + '\n})()')
const snapshot = () => page.evaluate(() => window.univerAPI.getActivePdf().save())
const marks = () =>
  page.evaluate(() =>
    window.univerAPI
      .getActivePdf()
      .getPages()
      .flatMap((p) =>
        p.getAnnotations().map((a) => ({
          id: a.getId(),
          page: p.getIndex(),
          type: a.getAnnotationType(),
          style: a.getStyle(),
          markup: a.getMarkup(),
          transform: a.getTransform(),
        })),
      ),
  )
const content = () =>
  page.evaluate(() =>
    window.univerAPI
      .getActivePdf()
      .getPages()
      .map((p) => ({
        index: p.getIndex(),
        text: p.getTextBoxes().map((t) => ({ id: t.getId(), text: t.getText(), transform: t.getTransform() })),
      })),
  )
const canvas = () => root.locator('[data-pdf-active-page-id] > canvas').first()
async function go(index) {
  // The center is the native draggable viewport indicator; the page-button margin navigates.
  await root.getByRole('button', { name: String(index + 1), exact: true }).click({ position: { x: 10, y: 10 } })
  const id = await page.evaluate((i) => window.univerAPI.getActivePdf().getPageByIndex(i).getId(), index)
  await root
    .locator('[data-pdf-active-page-id="' + id + '"] > canvas')
    .first()
    .waitFor()
  await settle()
}
async function region(top, height = 26) {
  await settle()
  const pixels = await canvas().evaluate(
    (c, { top: regionTop, height: regionHeight }) => {
      const sx = c.width / 595.276,
        sy = c.height / 841.89
      return [
        ...c
          .getContext('2d')
          .getImageData(
            Math.round(48 * sx),
            Math.round(regionTop * sy),
            Math.round(435 * sx),
            Math.round(regionHeight * sy),
          ).data,
      ]
    },
    { top, height },
  )
  return createHash('sha256').update(Buffer.from(pixels)).digest('hex')
}
async function point(x, y) {
  return canvas().evaluate(
    (c, { x: pageX, y: pageY }) => {
      const b = c.getBoundingClientRect()
      return { x: b.x + (pageX * b.width) / 595.276, y: b.y + (pageY * b.height) / 841.89 }
    },
    { x, y },
  )
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(dir, name + '-failure.png') }).catch(() => {})
  }
  await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify(report, null, 2))
}
function includesPack(actual, expected, prefix = '') {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') includesPack(actual[k], v, prefix + k + '.')
    else assert.equal(actual?.[k], v, prefix + k)
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || process.env.SHOWCASE_DEMO_URL || 'http://127.0.0.1:4360', {
    waitUntil: 'domcontentloaded',
  })
  await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 60000 })
  const original = await content()
  const beforeDate = (await snapshot()).metadata.reviewDate
  let initialHighlight, initialStrike
  await gate('native-baseline', async () => {
    assert.equal(await root.locator('fieldset,details,[data-action],output').count(), 0)
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    assert.deepEqual(
      (await marks()).map((m) => m.type),
      ['highlight', 'underline', 'strikeout'],
    )
    assert.equal(await root.locator('[data-u-command="univer.command.undo"]').isDisabled(), true)
    assert.equal(beforeDate, '2027-03-31T09:00:00Z')
    await go(0)
    initialHighlight = await region(218)
    await page.screenshot({ path: path.join(dir, 'page-1.png') })
    await canvas().screenshot({ path: path.join(dir, 'page-1-full.png') })
    await go(1)
    initialStrike = [await region(218), await region(248)]
    await page.screenshot({ path: path.join(dir, 'page-2.png') })
    await canvas().screenshot({ path: path.join(dir, 'page-2-full.png') })
  })
  const digests = {}
  for (const [i, code] of snippets.entries()) {
    await gate('literal-' + (i + 1), async () => {
      await go(i >= 7 && i <= 9 ? 1 : 0)
      const before = await snapshot()
      if (i === 4) {
        await assert.rejects(() => run(code), /opacity must be between 0 and 1/)
        assert.deepEqual(await snapshot(), before)
      } else await run(code)
      await settle()
      const actual = await marks()
      const renewal = actual.find((m) => m.id === 'renewal-mark'),
        obsolete = actual.find((m) => m.id === 'obsolete-mark')
      if (i === 1) {
        assert.equal(renewal.style.opacity, 0.35)
        assert.equal(renewal.style.fill.color, '#72a88a')
      }
      if (i === 2) assert.equal(renewal.style.opacity, 0)
      if (i === 3) assert.equal(renewal.style.opacity, 1)
      if (i === 5) {
        assert.equal(renewal.style.opacity, 0.5)
        assert.equal(renewal.style.fill.color, '#f5bd34')
      }
      if (i === 6) assert.equal(actual.find((m) => m.id === 'fee-mark').style.fill.color, '#7651a8')
      if (i === 7) assert.equal(obsolete, undefined)
      if (i === 8) {
        assert.equal(obsolete.type, 'squiggly')
        assert.equal(obsolete.markup.quadPoints.length, 2)
      }
      if (i === 9) {
        assert.equal(obsolete.type, 'strikeout')
        assert.equal(obsolete.markup.quadPoints.length, 2)
      }
      if (i === 10) {
        assert.equal(actual.length, 4)
        assert.equal(actual.find((m) => m.id === 'review-pair').markup.quadPoints.length, 2)
      }
      if (i === 11) assert.equal(actual.length, 3)
      assert.deepEqual(await content(), original, 'All original source words and text geometry are unchanged')
      assert.equal((await snapshot()).metadata.reviewDate, beforeDate)
      digests[i] = [await region(218), await region(i >= 7 && i <= 9 ? 248 : 350)]
      if (i === 1) assert.notEqual(digests[i][0], initialHighlight)
      if (i === 2) assert.notEqual(digests[i][0], digests[1][0])
      if (i === 3) assert.notEqual(digests[i][0], digests[2][0])
      if (i === 5) assert.equal(digests[i][0], initialHighlight)
      if (i === 6) assert.notEqual(digests[i][1], digests[5][1])
      if (i === 7) {
        assert.notEqual(digests[i][0], initialStrike[0])
        assert.notEqual(digests[i][1], initialStrike[1])
      }
      if (i === 8) {
        assert.notEqual(digests[i][0], digests[7][0])
        assert.notEqual(digests[i][1], digests[7][1])
      }
      if (i === 9) assert.deepEqual(digests[i], initialStrike)
      if (i === 10) {
        assert.notEqual(digests[i][0], initialHighlight)
        assert.notEqual(digests[i][1], digests[6][1])
      }
      if (i === 11) {
        assert.equal(digests[i][0], initialHighlight)
        assert.equal(digests[i][1], digests[6][1])
      }
      await page.screenshot({ path: path.join(dir, 'literal-' + (i + 1) + '.png') })
      report.checks.push({ example: i + 1, annotations: actual, regionHashes: digests[i] })
    })
  }
  await gate('native-selection-properties', async () => {
    await go(0)
    const p = await point(170, 229)
    await page.mouse.click(p.x, p.y)
    await page.getByRole('tab', { name: 'View', exact: true }).click()
    await page.getByRole('button', { name: 'Properties', exact: true }).click()
    const inspector = page.locator('[data-pdf-inspector]')
    await inspector.waitFor()
    const fields = await inspector.locator('input').evaluateAll((es) => es.map((e) => e.value))
    assert.deepEqual(
      fields.slice(0, 4),
      ['64.00 px', '291.00 px', '440.00 px', '29.00 px'],
      'Native selection targets the 330-point annotation, not the wider source text box',
    )
    assert.deepEqual(await content(), original)
    await page.screenshot({ path: path.join(dir, 'native-selected-annotation.png') })
    await page.getByRole('button', { name: 'Close sidebar', exact: true }).click()
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
  })
  await gate('native-highlight-drag', async () => {
    await go(0)
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    const prior = await marks()
    const before = await region(465, 35)
    await page.locator('[data-u-command="pdf.menu.tool.highlight"]').click()
    const from = await point(51, 468),
      to = await point(475, 484)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 20 })
    await page.mouse.up()
    await page.waitForFunction(
      (n) =>
        window.univerAPI
          .getActivePdf()
          .getPages()
          .flatMap((p) => p.getAnnotations()).length ===
        n + 1,
      prior.length,
    )
    const after = await marks(),
      inserted = after.find((m) => !prior.some((a) => a.id === m.id))
    assert.equal(inserted.type, 'highlight')
    assert.ok(inserted.markup.quadPoints.length >= 1)
    assert.deepEqual(await content(), original)
    assert.notEqual(await region(465, 35), before)
    await page.screenshot({ path: path.join(dir, 'native-drag-highlight.png') })
    report.checks.push({ nativeDrag: inserted })
  })
  await gate('complete-locales-and-theme-preservation', async () => {
    const factory = await fs.readFile('showcase/pdfs/text-markup/code/create-demo.ts', 'utf8')
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 5)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      const before = await snapshot()
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
      }
      assert.deepEqual(await snapshot(), before)
      assert.equal(/pdfs-ui\.[\w.-]+/.test(await page.locator('body').innerText()), false)
      await page.screenshot({ path: path.join(dir, locale + '-preserved.png') })
      report.checks.push({ locale, completePacks: 5, editedSnapshotPreserved: true })
    }
  })
  await gate('selected-disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  report.passed =
    Object.values(report.gates).every((g) => g.passed) &&
    !report.errors.length &&
    !report.warnings.length &&
    !report.backendRequests.length
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, checks: report.checks.length }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
