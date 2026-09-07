/* eslint-disable no-await-in-loop -- One native PDF export, tested in literal user-action order. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-ink-native-review-verified')
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
  const exported = (await readShowcaseSources()).find((c) => c.slug === 'pdfs/ink-freehand-review')
  const project = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-ink-native-'))
  for (const [name, source] of Object.entries(exported.files)) {
    const file = path.join(project, name.slice(1))
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, source)
    assert.equal(await fs.readFile(file, 'utf8'), source)
  }
  await fs.mkdir(path.join(project, 'node_modules'))
  for (const name of await fs.readdir('node_modules')) {
    if (name !== 'vite' && (await fs.stat(path.join('node_modules', name))).isDirectory())
      await fs.symlink(path.resolve('node_modules', name), path.join(project, 'node_modules', name), 'junction')
  }
  await fs.symlink(
    'C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite',
    path.join(project, 'node_modules/vite'),
    'junction',
  )
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
    preview: { host: '127.0.0.1', port: 4372, strictPort: true },
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
    window.inkFrames = new Map()
    const fill = CanvasRenderingContext2D.prototype.fillText
    const clear = CanvasRenderingContext2D.prototype.clearRect
    const draw = CanvasRenderingContext2D.prototype.drawImage
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      window.inkFrames.set(this.canvas, [])
      return Reflect.apply(clear, this, args)
    }
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      const words = window.inkFrames.get(this.canvas) || []
      words.push(String(args[0]))
      window.inkFrames.set(this.canvas, words.slice(-50000))
      return Reflect.apply(fill, this, args)
    }
    CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
      if (source !== this.canvas)
        window.inkFrames.set(
          this.canvas,
          [...(window.inkFrames.get(this.canvas) || []), ...(window.inkFrames.get(source) || [])].slice(-50000),
        )
      return Reflect.apply(draw, this, [source, ...args])
    }
  })
  const root = page.locator('.pdf-ink')
  const canvas = () => root.locator('[data-pdf-active-page-id] > canvas').first()
  const settle = () =>
    page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    })
  const snapshot = () => page.evaluate(() => window.univerAPI.getActivePdf().save())
  const marks = () =>
    page.evaluate(() =>
      window.univerAPI
        .getActivePdf()
        .getPageByIndex(0)
        .getAnnotations()
        .map((m) => ({ id: m.getId(), ink: m.getInk(), style: m.getStyle(), transform: m.getTransform() })),
    )
  const original = () =>
    page.evaluate(() => {
      const p = window.univerAPI.getActivePdf().getPageByIndex(0)
      return {
        text: p.getTextBoxes().map((t) => ({ text: t.getText(), transform: t.getTransform() })),
        images: p.getImages().map((i) => i.getData()),
      }
    })
  async function ready() {
    await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 60000 })
    await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
    await page.waitForFunction(() =>
      [...window.inkFrames].some(
        ([c, words]) =>
          c.isConnected &&
          c.parentElement?.hasAttribute('data-pdf-active-page-id') &&
          words.join('').includes('Meridian studio / route review'),
      ),
    )
    await settle()
  }
  const point = async (x, y) => {
    const b = await canvas().boundingBox()
    return { x: b.x + (x * b.width) / 595.276, y: b.y + (y * b.height) / 841.89 }
  }
  async function region(box) {
    await settle()
    const pixels = await canvas().evaluate((c, a) => {
      const sx = c.width / 595.276,
        sy = c.height / 841.89
      return Array.from(
        c
          .getContext('2d')
          .getImageData(Math.round(a[0] * sx), Math.round(a[1] * sy), Math.round(a[2] * sx), Math.round(a[3] * sy))
          .data,
      )
    }, box)
    return createHash('sha256').update(Buffer.from(pixels)).digest('hex')
  }
  async function gate(name, action) {
    try {
      await action()
      report.gates[name] = { passed: true }
    } catch (e) {
      report.gates[name] = { passed: false, failure: e.stack }
      await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
    }
  }
  await page.goto('http://127.0.0.1:4372/', { waitUntil: 'domcontentloaded' })
  await ready()
  await root.getByRole('button', { name: '1', exact: true }).click({ position: { x: 10, y: 10 } })
  await settle()
  const baseline = await marks(),
    sourceContent = await original()
  await gate('native-baseline-paint', async () => {
    assert.equal(await root.locator(':scope > details, :scope > fieldset, :scope > output').count(), 0)
    assert.equal(baseline.length, 3)
    assert.deepEqual(
      baseline.map((m) => m.id),
      ['exit-circle', 'alternate-route', 'legend-check'],
    )
    assert.equal(sourceContent.images.length, 1)
    assert.equal((await snapshot()).metadata.reviewDate, '2027-03-31T09:00:00Z')
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    const counts = await canvas().evaluate((c) => {
      const a = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      const result = { red: 0, violet: 0, green: 0 }
      for (let i = 0; i < a.length; i += 4) {
        if (a[i] > 180 && a[i + 1] < 100 && a[i + 2] < 100) result.red++
        if (a[i] > 80 && a[i] < 180 && a[i + 1] < 100 && a[i + 2] > 180) result.violet++
        if (a[i] < 60 && a[i + 1] > 100 && a[i + 2] < 180) result.green++
      }
      return result
    })
    report.baselinePixels = counts
    assert.ok(
      Object.values(counts).every((n) => n > 100),
      'Actual ink plus original image routes must paint',
    )
    await page.screenshot({ path: path.join(directory, 'baseline.png') })
  })
  const snippets = [
    ...(await fs.readFile('showcase/pdfs/ink-freehand-review/code/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ].map((m) => m[1])
  assert.equal(snippets.length, 12)
  const circle = [40, 125, 120, 70],
    routeBox = [287, 157, 187, 243],
    legend = [58, 510, 85, 42]
  const initialCircle = await region(circle)
  for (let i = 0; i < snippets.length; i++)
    await gate('literal-' + (i + 1), async () => {
      const before = await snapshot(),
        prior = await marks(),
        box = i < 5 ? circle : i === 5 ? routeBox : legend
      const beforePaint = await region(box)
      const run = () => page.evaluate('(async () => {\n' + snippets[i] + '\n})()')
      if (i === 10) {
        await assert.rejects(run, /path/i)
        assert.deepEqual(await snapshot(), before)
      } else await run()
      await settle()
      const after = await marks()
      assert.deepEqual(await original(), sourceContent)
      if (i >= 1 && i <= 5) {
        assert.deepEqual(
          after.map((m) => m.ink.paths),
          prior.map((m) => m.ink.paths),
        )
        assert.notEqual(await region(box), beforePaint)
      }
      if (i === 4) assert.equal(await region(circle), initialCircle)
      if (i === 6 || i === 8) assert.equal(after.length, 2)
      if (i === 7) assert.deepEqual(after, prior.concat([baseline[2]]))
      if (i === 9) assert.equal(after.find((m) => m.id === 'legend-check').ink.paths.length, 2)
      if (i === 11) assert.equal(after.find((m) => m.id === 'legend-check').style.stroke.width, 2)
      if ([6, 7, 8, 9, 11].includes(i)) assert.notEqual(await region(box), beforePaint)
    })
  await page.screenshot({ path: path.join(directory, 'literal-variants.png') })
  await fs.writeFile(
    path.join(directory, 'native-controls.json'),
    JSON.stringify(
      await page.locator('[data-u-command]').evaluateAll((es) =>
        es.map((e) => ({
          id: e.getAttribute('data-u-command'),
          text: e.textContent,
          aria: e.getAttribute('aria-label'),
        })),
      ),
      null,
      2,
    ),
  )
  await gate('native-drawing-history', async () => {
    const prior = await marks(),
      beforePaint = await region([175, 550, 230, 65])
    await page.locator('[data-u-command="pdf.menu.tool.ink"]').click()
    const start = await point(190, 580)
    await page.mouse.move(start.x, start.y)
    await page.mouse.down()
    for (const [x, y] of [
      [210, 570],
      [235, 590],
      [265, 565],
      [300, 590],
      [340, 575],
    ]) {
      const p = await point(x, y)
      await page.mouse.move(p.x, p.y, { steps: 5 })
    }
    await page.mouse.up()
    await page.waitForFunction(
      (n) => window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().length === n + 1,
      prior.length,
    )
    const drawn = await marks(),
      inserted = drawn.find((m) => !prior.some((p) => p.id === m.id))
    assert.ok(inserted.ink.paths[0].length > 5)
    assert.notEqual(await region([175, 550, 230, 65]), beforePaint)
    report.nativeStroke = inserted
    await page.screenshot({ path: path.join(directory, 'native-drawn.png') })
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await marks(), prior)
    assert.equal(await region([175, 550, 230, 65]), beforePaint)
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    assert.deepEqual(await marks(), drawn)
    assert.notEqual(await region([175, 550, 230, 65]), beforePaint)
  })
  await gate('native-selection-properties', async () => {
    await page.keyboard.press('Escape')
    await settle()
    await page.locator('[data-u-command="pdf.menu.tool.mode"]').click()
    await page.getByText('Selection mode', { exact: true }).last().click()
    await settle()
    const p = await point(98, 139)
    await page.mouse.click(p.x, p.y)
    await page.getByRole('tab', { name: 'View', exact: true }).click()
    await page.getByRole('button', { name: 'Properties', exact: true }).click()
    report.properties = await page.locator('[data-pdf-inspector] input').evaluateAll((es) => es.map((e) => e.value))
    // Native inspector displays integer CSS pixels, while the Facade retains PDF points.
    assert.deepEqual(report.properties.slice(0, 4), ['67.00 px', '183.00 px', '128.00 px', '61.00 px'])
    await page.screenshot({ path: path.join(directory, 'native-selected.png') })
  })
  await gate('native-property-position-and-undo', async () => {
    const before = await marks(),
      beforePaint = await region([40, 125, 155, 70])
    await page.locator('[data-pdf-inspector] input').first().fill('100')
    await page.locator('[data-pdf-inspector] input').first().press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getActivePdf()
          .getPageByIndex(0)
          .getAnnotations()
          .find((m) => m.getId() === 'exit-circle')
          .getTransform().left === 75,
    )
    for (let frame = 0; frame < 20; frame++) await settle()
    const afterPaint = await region([40, 125, 155, 70])
    report.nativePropertyPosition = {
      before: before.find((m) => m.id === 'exit-circle'),
      after: (await marks()).find((m) => m.id === 'exit-circle'),
      beforePaint,
      afterPaint,
    }
    assert.deepEqual(await original(), sourceContent)
    await page.screenshot({ path: path.join(directory, 'native-property-position.png') })
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    assert.deepEqual(await marks(), before)
    assert.equal(await region([40, 125, 155, 70]), beforePaint)
    report.nativePropertyPosition.undoRestored = true
    assert.notEqual(
      afterPaint,
      beforePaint,
      'Native X property editing must move actual ink pixels, not only the selection bounds',
    )
  })
  await gate('theme-owner-and-source-preservation', async () => {
    const before = await snapshot()
    await page.evaluate(() => {
      window.inkOriginalOwner = window.univerAPI.getActivePdf().getModel()
      window.univerAPI.toggleDarkMode(true)
    })
    await settle()
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.equal(
      await page.evaluate(() => window.inkOriginalOwner === window.univerAPI.getActivePdf().getModel()),
      true,
    )
    assert.deepEqual(await snapshot(), before)
    assert.deepEqual(await original(), sourceContent)
  })
  await gate('complete-five-locale-packs', async () => {
    const factory = await fs.readFile('showcase/pdfs/ink-freehand-review/code/create-demo.ts', 'utf8')
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 5)
    assert.equal([...factory.matchAll(/^import '.+\/lib\/index.css'/gm)].length, 5)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      const before = await snapshot()
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
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
  await gate('initial-chinese-native-labels', async () => {
    await page.route('http://127.0.0.1:4372/', async (r) => {
      const response = await r.fetch()
      await r.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, '<html lang="zh-CN">') })
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await ready()
    await page.getByRole('tab', { name: '视图', exact: true }).click()
    await page.getByRole('button', { name: '属性', exact: true }).waitFor()
    await page.getByRole('tab', { name: '开始', exact: true }).click()
    await page.locator('[data-u-command="pdf.menu.tool.ink"]').hover()
    await page.getByRole('tooltip').filter({ hasText: '自由画笔' }).waitFor()
    assert.equal(/pdfs-ui\.[\w.-]+/.test(await page.locator('body').innerText()), false)
    await page.screenshot({ path: path.join(directory, 'initial-zh-CN.png') })
  })
  report.passed =
    Object.values(report.gates).every((g) => g.passed) &&
    !report.errors.length &&
    !report.warnings.length &&
    !report.backendRequests.length
} catch (e) {
  report.failure = e.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser?.close()
  await server?.httpServer.close()
}
if (!report.passed) process.exitCode = 1
