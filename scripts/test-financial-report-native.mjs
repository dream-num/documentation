/* eslint-disable no-await-in-loop -- One native PDF export, tested in literal user-action order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/financial-report-native')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, gates: {}, errors: [], warnings: [], backendRequests: [] }
function includesPack(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') includesPack(actual[key], value)
    else assert.equal(actual[key], value)
  }
}
let server, browser
try {
  const exported = (await readShowcaseSources()).find((c) => c.slug === 'pdfs/financial-report')
  const project = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-financial-native-'))
  for (const [name, source] of Object.entries(exported.files)) {
    const file = path.join(project, name.slice(1))
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, source)
    assert.equal(await fs.readFile(file, 'utf8'), source)
  }
  const packageJson = JSON.parse(exported.files['/package.json'])
  report.dependencyVersions = {}
  for (const [name, version] of Object.entries({ ...packageJson.dependencies, ...packageJson.devDependencies })) {
    const installed =
      name === 'vite'
        ? 'C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
        : path.resolve('node_modules', name)
    const actual = JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version
    assert.equal(version, actual, name + ' must use the exact exported version')
    const target = path.join(project, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.symlink(await fs.realpath(installed), target, 'junction')
    report.dependencyVersions[name] = actual
  }
  const manifest = [{ slug: exported.slug, directory: project }]
  await fs.writeFile(path.join(directory, 'exports.json'), JSON.stringify(manifest, null, 2))
  report.sourceFiles = Object.keys(exported.files).length
  const { build, preview } = await import(
    pathToFileURL('C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite/dist/node/index.js')
  )
  await build({ configFile: false, root: project, logLevel: 'warn' })
  server = await preview({
    configFile: false,
    root: project,
    preview: { host: '127.0.0.1', port: 4384, strictPort: true },
  })
  browser = await chromium.launch()
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
      (['fetch', 'xhr'].includes(r.resourceType()) && !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname))
    )
      report.backendRequests.push(r.url())
  })
  page.on('websocket', (s) => report.backendRequests.push(s.url()))
  await page.addInitScript(() => {
    window.financialFrames = new Map()
    const fill = CanvasRenderingContext2D.prototype.fillText
    const clear = CanvasRenderingContext2D.prototype.clearRect
    const draw = CanvasRenderingContext2D.prototype.drawImage
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      window.financialFrames.set(this.canvas, [])
      return Reflect.apply(clear, this, args)
    }
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      const words = window.financialFrames.get(this.canvas) || []
      words.push(String(args[0]))
      window.financialFrames.set(this.canvas, words.slice(-50000))
      return Reflect.apply(fill, this, args)
    }
    CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
      if (source !== this.canvas)
        window.financialFrames.set(
          this.canvas,
          [...(window.financialFrames.get(this.canvas) || []), ...(window.financialFrames.get(source) || [])].slice(
            -50000,
          ),
        )
      return Reflect.apply(draw, this, [source, ...args])
    }
  })

  const root = page.locator('.financial-report')
  const settle = async () => {
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    })
  }
  const snapshot = () => page.evaluate(() => window.univerAPI.getActivePdf().save())
  const model = () =>
    page.evaluate(() =>
      window.univerAPI
        .getActivePdf()
        .getPages()
        .map((p) => ({
          id: p.getId(),
          texts: p.getTextBoxes().map((t) => ({ id: t.getId(), text: t.getText() })),
          notes: p.getParagraphs().map((t) => ({ id: t.getId(), blocks: t.getBlocks() })),
          tables: p.getTables().map((t) => ({
            id: t.getId(),
            rows: Array.from({ length: t.getRowCount() }, (_, r) =>
              Array.from({ length: t.getColumnCount() }, (_column, c) => t.getCell(r, c).getText()),
            ),
          })),
          annotations: p.getAnnotations().map((a) => ({
            id: a.getId(),
            style: a.getStyle(),
            transform: a.getTransform(),
            type: a.getAnnotationType(),
          })),
        })),
    )
  let pageIds = []
  const canvas = (index = 0) => root.locator('[data-pdf-active-page-id="' + pageIds[index] + '"] > canvas').first()
  async function ready() {
    await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 90000 })
    await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
    pageIds = (await model()).map((p) => p.id)
    await showPage(0)
  }
  async function showPage(index) {
    const footer = root.locator('[data-pdf-footer] input').first()
    await footer.fill(String(index + 1))
    await footer.press('Enter')
    await canvas(index).waitFor()
    await settle()
  }
  async function paintText(index, expected) {
    await page.waitForFunction(
      ({ id, expected: expectedText }) =>
        [...window.financialFrames].some(
          ([paintedCanvas, words]) =>
            paintedCanvas.isConnected &&
            paintedCanvas.parentElement?.getAttribute('data-pdf-active-page-id') === id &&
            words.join('').includes(expectedText),
        ),
      { id: pageIds[index], expected },
    )
  }
  async function pixels(index, box = [40, 70, 520, 600]) {
    await settle()
    return canvas(index).evaluate(async (c, region) => {
      const sx = c.width / 595.276,
        sy = c.height / 841.89
      const data = c
        .getContext('2d')
        .getImageData(
          Math.round(region[0] * sx),
          Math.round(region[1] * sy),
          Math.round(region[2] * sx),
          Math.round(region[3] * sy),
        ).data
      let yellow = 0,
        teal = 0,
        nonwhite = 0
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, a] = data.slice(i, i + 4)
        if (a > 200 && (r < 220 || g < 220 || b < 220)) nonwhite++
        if (a > 200 && r > 225 && g > 190 && b < 200) yellow++
        if (a > 200 && g > 150 && g > r + 15 && b > r + 10) teal++
      }
      const digest = await crypto.subtle.digest('SHA-256', data)
      return {
        hash: Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join(''),
        yellow,
        teal,
        nonwhite,
      }
    }, box)
  }
  async function point(index, x, y) {
    const b = await canvas(index).boundingBox()
    return { x: b.x + (x * b.width) / 595.276, y: b.y + (y * b.height) / 841.89 }
  }
  async function gate(name, action) {
    try {
      await action()
      report.gates[name] = { passed: true }
    } catch (e) {
      report.gates[name] = { passed: false, failure: e.stack }
      await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
      await fs
        .writeFile(path.join(directory, name + '-failure.html'), await page.locator('body').innerHTML())
        .catch(() => {})
    }
    console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
  }
  async function history(direction) {
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator('[data-u-command="univer.command.' + direction + '"]').click()
    for (let i = 0; i < 4; i++) await settle()
  }
  async function selectMode() {
    await page.keyboard.press('Escape')
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator('[data-u-command="pdf.menu.tool.mode"]').click()
    await page.getByText('Selection mode', { exact: true }).last().click()
  }
  await page.goto('http://127.0.0.1:4384/', { waitUntil: 'domcontentloaded' })
  await ready()
  report.baseline = await model()
  const authored = report.baseline
  const sources = await fs.readFile('showcase/pdfs/financial-report/code/data.ts', 'utf8')
  // Recorded before this native migration; do not depend on another report being present.
  const originalHash = 'ebc06a231b4d88d5144aec5d841389bd62c269866e5bf128f0b67b808818cd6d'
  const { createHash } = await import('node:crypto')
  await gate('source-front-end-only-and-original-data', async () => {
    assert.equal(createHash('sha256').update(sources).digest('hex'), originalHash)
    assert.ok(!Object.keys(exported.files).some((f) => /config\.ts|vite\.config/.test(f)))
    const factory = exported.files['/src/create-demo.ts']
    assert.ok(!/Exchange|exchange-client|uploadFile|universer-api|dev\.univer\.plus/.test(factory))
    assert.ok(!Object.keys(packageJson.dependencies).some((p) => p.includes('exchange')))
    assert.equal(await root.locator(':scope > details, :scope > fieldset, :scope > output, :scope > button').count(), 0)
    report.originalDataSha256 = originalHash
  })
  await gate('all-fourteen-pages-painted', async () => {
    assert.equal(authored.length, 14)
    report.pages = []
    for (let i = 0; i < 14; i++) {
      await showPage(i)
      const title = authored[i].texts.find((t) => t.id === 'title-' + i).text
      await paintText(i, title)
      const actual = await pixels(i)
      assert.ok(actual.nonwhite > 1000, 'Page ' + (i + 1) + ' must actually paint its financial content')
      assert.equal(authored[i].tables.length, 1)
      report.pages.push({ index: i + 1, title, ...actual })
      if ([0, 1, 6, 13].includes(i)) await page.screenshot({ path: path.join(directory, 'page-' + (i + 1) + '.png') })
    }
    assert.equal(new Set(report.pages.map((p) => p.hash)).size, 14)
    await showPage(0)
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await page.screenshot({ path: path.join(directory, 'baseline.png') })
  })
  const readme = await fs.readFile('showcase/pdfs/financial-report/code/README.md', 'utf8')
  const snippets = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((m) => m[1])
  assert.equal(snippets.length, 15)
  report.literals = []
  for (let i = 0; i < snippets.length; i++)
    await gate('literal-' + (i + 1), async () => {
      if (i === 6) await showPage(6)
      const before = await snapshot()
      const beforePaint = i < 9 ? await pixels(i < 6 ? 0 : 6, i < 6 ? [40, 70, 520, 600] : [40, 175, 515, 90]) : null
      const run = () => page.evaluate('(async()=>{\n' + snippets[i] + '\n})()')
      if (i === 9) {
        await assert.rejects(run, /opacity/i)
        assert.deepEqual(await snapshot(), before)
      } else if (i === 11) {
        const waiting = page.waitForEvent('download')
        await run()
        const download = await waiting
        const file = path.join(directory, download.suggestedFilename())
        await download.saveAs(file)
        // JSON omits undefined properties by definition; compare every serializable field, excluding none.
        assert.deepEqual(JSON.parse(await fs.readFile(file, 'utf8')), JSON.parse(JSON.stringify(before)))
        report.localDownload = file
      } else await run()
      for (let frame = 0; frame < 6; frame++) await settle()
      const after = await model()
      if ([1, 3].includes(i)) {
        assert.equal(after[0].texts.find((t) => t.id === 'title-0').text, 'Annual performance overview - reviewed')
        await paintText(0, 'Annual performance overview - reviewed')
      }
      if (i === 2) assert.equal(after[0].texts.find((t) => t.id === 'title-0').text, 'Annual performance overview')
      if (i === 4) {
        assert.equal(after[0].tables[0].rows[6][1], '183.0')
        await paintText(0, '183.0')
      }
      if (i === 5) assert.equal(after[0].tables[0].rows[6][1], '184.0')
      if (i === 6) assert.equal(after[6].annotations.find((a) => a.id === 'margin-review').style.opacity, 0.4)
      if (i === 7) assert.equal(after[6].annotations.find((a) => a.id === 'margin-review').style.opacity, 0)
      if (i === 8) assert.equal(after[6].annotations.find((a) => a.id === 'margin-review').style.opacity, 0.45)
      if (i >= 6 && i <= 9) assert.deepEqual(after[6].notes, authored[6].notes)
      let painted
      if (i >= 1 && i <= 8) {
        painted = await pixels(i < 6 ? 0 : 6, i < 6 ? [40, 70, 520, 600] : [40, 175, 515, 90])
        assert.notEqual(painted.hash, beforePaint.hash, 'Facade edits must change actual page pixels')
        if (i === 6) assert.ok(painted.yellow > beforePaint.yellow + 500)
        if (i === 8) assert.ok(painted.teal > beforePaint.teal + 500)
      }
      if (i === 12) {
        assert.deepEqual(await snapshot(), before)
        pageIds = after.map((p) => p.id)
        await showPage(6)
        await paintText(6, 'Margin reconciliation')
      }
      if (i === 13) {
        assert.equal(after.length, 1)
        assert.equal(after[0].texts.length + after[0].notes.length + after[0].tables.length, 0)
        pageIds = after.map((p) => p.id)
        await showPage(0)
        await page.screenshot({ path: path.join(directory, 'blank-local.png') })
      }
      if (i === 14) {
        const saved = await page.evaluate(() => window.asteriaSavedSnapshot)
        assert.deepEqual(await snapshot(), saved)
        assert.equal(after.length, 14)
        pageIds = after.map((p) => p.id)
        await showPage(0)
        await paintText(0, 'Annual performance overview - reviewed')
      }
      report.literals.push({ number: i + 1, paint: painted })
      if ([6, 7, 8].includes(i)) await page.screenshot({ path: path.join(directory, 'literal-' + (i + 1) + '.png') })
    })
  // Independent native interaction checks start from the authored report, not a prior literal's failure state.
  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready()
  await gate('native-title-edit-and-history', async () => {
    await showPage(0)
    const initial = await pixels(0)
    const p = await point(0, 170, 100)
    await page.mouse.dblclick(p.x, p.y)
    await page.waitForFunction(() => document.activeElement?.matches('[data-pdf-text-input]'))
    await page.keyboard.press('Control+A')
    await page.keyboard.insertText('Annual performance overview - native review')
    await page.getByRole('tab', { name: 'View', exact: true }).click()
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getActivePdf()
          .getPageByIndex(0)
          .getTextBoxes()
          .find((t) => t.getId() === 'title-0')
          .getText() === 'Annual performance overview - native review',
    )
    await paintText(0, 'Annual performance overview - native review')
    const edited = await pixels(0)
    assert.notEqual(edited.hash, initial.hash)
    await history('undo')
    assert.equal((await model())[0].texts.find((t) => t.id === 'title-0').text, 'Annual performance overview')
    assert.equal((await pixels(0)).hash, initial.hash)
    await history('redo')
    assert.equal((await pixels(0)).hash, edited.hash)
    await page.screenshot({ path: path.join(directory, 'native-title-edit.png') })
  })
  await gate('native-table-edit-and-history', async () => {
    await showPage(0)
    await page.keyboard.press('Escape')
    const p = await point(0, 420, 335)
    await page.mouse.dblclick(p.x, p.y)
    await page.waitForFunction(() => document.activeElement?.matches('[data-pdf-text-input]'))
    await page.keyboard.press('Control+A')
    await page.keyboard.insertText('428.7')
    await page.getByRole('tab', { name: 'View', exact: true }).click()
    await page.waitForFunction(
      () => window.univerAPI.getActivePdf().getPageByIndex(0).getTables()[0].getCell(1, 1).getText() === '428.7',
    )
    await paintText(0, '428.7')
    const edited = await pixels(0)
    await history('undo')
    assert.equal((await model())[0].tables[0].rows[1][1], '428.6')
    assert.notEqual((await pixels(0)).hash, edited.hash)
    await history('redo')
    assert.equal((await pixels(0)).hash, edited.hash)
    await page.screenshot({ path: path.join(directory, 'native-table-edit.png') })
  })
  await gate('native-annotation-drag-select-properties-history', async () => {
    await showPage(6)
    await page.keyboard.press('Escape')
    const initial = await pixels(6, [40, 175, 515, 90])
    const before = (await model())[6]
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator('[data-u-command="pdf.menu.tool.highlight"]').click()
    const from = await point(6, 48, 190),
      to = await point(6, 390, 207)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 20 })
    await page.mouse.up()
    await settle()
    const after = (await model())[6]
    assert.equal(after.annotations.length, before.annotations.length + 1)
    assert.deepEqual(after.notes, before.notes)
    const edited = await pixels(6, [40, 175, 515, 90])
    assert.notEqual(edited.hash, initial.hash)
    const annotation = after.annotations.at(-1)
    await selectMode()
    const p = await point(
      6,
      annotation.transform.left + annotation.transform.width / 2,
      annotation.transform.top + annotation.transform.height / 2,
    )
    await page.mouse.click(p.x, p.y)
    await page.getByRole('tab', { name: 'View', exact: true }).click()
    await page.getByRole('button', { name: 'Properties', exact: true }).click()
    await page.locator('[data-pdf-inspector] input').first().waitFor()
    report.nativeAnnotationProperties = await page
      .locator('[data-pdf-inspector] input')
      .evaluateAll((inputs) => inputs.slice(0, 4).map((input) => input.value))
    for (const [index, key] of ['left', 'top', 'width', 'height'].entries())
      assert.ok(
        Math.abs(parseFloat(report.nativeAnnotationProperties[index]) - (annotation.transform[key] * 4) / 3) <= 1,
        'Native inspector must select the actual annotation ' + key,
      )
    await page.screenshot({ path: path.join(directory, 'native-annotation-properties.png') })
    await page.getByRole('button', { name: 'Close sidebar', exact: true }).click()
    await history('undo')
    assert.equal((await model())[6].annotations.length, before.annotations.length)
    assert.equal((await pixels(6, [40, 175, 515, 90])).hash, initial.hash)
    await history('redo')
    assert.equal((await model())[6].annotations.length, after.annotations.length)
    assert.equal((await pixels(6, [40, 175, 515, 90])).hash, edited.hash)
    report.nativeAnnotation = annotation
  })
  await gate('theme-owner-and-complete-packs', async () => {
    const before = await snapshot()
    await page.evaluate(() => {
      window.financialOwner = window.univerAPI
      window.financialModel = window.univerAPI.getActivePdf().getModel()
      window.univerAPI.toggleDarkMode(true)
    })
    await settle()
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.equal(
      await page.evaluate(
        () =>
          window.financialOwner === window.univerAPI &&
          window.financialModel === window.univerAPI.getActivePdf().getModel(),
      ),
      true,
    )
    assert.deepEqual(await snapshot(), before)
    const factory = exported.files['/src/create-demo.ts']
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 5)
    assert.equal([...factory.matchAll(/^import '.+\/lib\/index.css'/gm)].length, 5)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((value) => window.univerAPI.setLocale(value), code)
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      assert.deepEqual(await snapshot(), before)
    }
  })
  await gate('disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('initial-chinese-native-ui', async () => {
    await page.route('http://127.0.0.1:4384/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, '<html lang="zh-CN">') })
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await ready()
    await paintText(0, 'Annual performance overview')
    const p = await point(0, 150, 105)
    await page.mouse.click(p.x, p.y)
    await page.getByRole('tab', { name: '视图', exact: true }).click()
    await page.getByRole('button', { name: '属性', exact: true }).click()
    await page.getByText('位置和大小', { exact: true }).waitFor()
    assert.equal(/pdfs-ui\.[\w.-]+/.test(await page.locator('body').innerText()), false)
    await page.screenshot({ path: path.join(directory, 'initial-zh-CN.png') })
  })
  await gate('no-backend-and-no-sdk-errors', async () => {
    assert.deepEqual(report.backendRequests, [])
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.warnings, [])
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        ...report,
        baseline: undefined,
        pages: report.pages?.length,
        dependencyVersions: undefined,
        literals: report.literals?.length,
      },
      null,
      2,
    ),
  )
  await browser?.close()
  await server?.httpServer.close()
}
if (!report.passed) process.exitCode = 1
