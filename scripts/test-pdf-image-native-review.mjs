/* eslint-disable no-await-in-loop -- One native PDF export, tested in literal user-action order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-image-native-verified')
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
  const exported = (await readShowcaseSources()).find((c) => c.slug === 'pdfs/image-placement-crop')
  const project = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-image-native-'))
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
    preview: { host: '127.0.0.1', port: 4380, strictPort: true },
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
    window.imageFrames = new Map()
    const fill = CanvasRenderingContext2D.prototype.fillText
    const clear = CanvasRenderingContext2D.prototype.clearRect
    const draw = CanvasRenderingContext2D.prototype.drawImage
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      window.imageFrames.set(this.canvas, [])
      return Reflect.apply(clear, this, args)
    }
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      const words = window.imageFrames.get(this.canvas) || []
      words.push(String(args[0]))
      window.imageFrames.set(this.canvas, words.slice(-50000))
      return Reflect.apply(fill, this, args)
    }
    CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
      if (source !== this.canvas)
        window.imageFrames.set(
          this.canvas,
          [...(window.imageFrames.get(this.canvas) || []), ...(window.imageFrames.get(source) || [])].slice(-50000),
        )
      return Reflect.apply(draw, this, [source, ...args])
    }
  })

  const root = page.locator('.pdf-image')
  const canvas = () => root.locator('[data-pdf-active-page-id] > canvas').first()
  const settle = () =>
    page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    })
  const snapshot = () => page.evaluate(() => window.univerAPI.getActivePdf().save())
  const images = () =>
    page.evaluate(() =>
      window.univerAPI
        .getActivePdf()
        .getPageByIndex(0)
        .getImages()
        .map((i) => ({
          id: i.getId(),
          source: i.getSource(),
          transform: i.getTransform(),
          crop: i.getCrop(),
          opacity: i.getOpacity(),
        })),
    )
  const textContent = () =>
    page.evaluate(() =>
      window.univerAPI
        .getActivePdf()
        .getPageByIndex(0)
        .getTextBoxes()
        .map((t) => ({ text: t.getText(), transform: t.getTransform() })),
    )
  const imageSource = await fs.readFile('showcase/pdfs/image-placement-crop/code/data.ts', 'utf8')
  const artwork = Object.fromEntries(
    ['summer', 'winter'].map((name) => [
      name,
      'data:image/svg+xml;base64,' +
        Buffer.from(imageSource.match(new RegExp(name + ': \x60([\\s\\S]*?)\x60'))[1]).toString('base64'),
    ]),
  )
  async function ready() {
    await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 60000 })
    await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
    await page.waitForFunction(() =>
      [...window.imageFrames].some(
        ([c, words]) =>
          c.isConnected &&
          c.parentElement?.hasAttribute('data-pdf-active-page-id') &&
          words.join('').includes('Ridgeway / Trail guide proof'),
      ),
    )
    await settle()
  }
  const point = async (x, y) => {
    const b = await canvas().boundingBox()
    return { x: b.x + (x * b.width) / 595.276, y: b.y + (y * b.height) / 841.89 }
  }
  const heroBox = [50, 125, 495, 325]
  async function pixels() {
    await settle()
    return canvas().evaluate(async (c, box) => {
      const sx = c.width / 595.276,
        sy = c.height / 841.89
      const bytes = c
        .getContext('2d')
        .getImageData(
          Math.round(box[0] * sx),
          Math.round(box[1] * sy),
          Math.round(box[2] * sx),
          Math.round(box[3] * sy),
        ).data
      const colors = { red: 0, teal: 0, violet: 0 }
      for (let p = 0; p < bytes.length; p += 4) {
        if (bytes[p] > 180 && bytes[p + 1] < 100 && bytes[p + 2] < 100) colors.red++
        if (bytes[p] < 50 && bytes[p + 1] > 100 && bytes[p + 1] < 180 && bytes[p + 2] > 90 && bytes[p + 2] < 180)
          colors.teal++
        if (bytes[p] > 80 && bytes[p] < 170 && bytes[p + 1] < 100 && bytes[p + 2] > 180) colors.violet++
      }
      const digest = await crypto.subtle.digest('SHA-256', bytes)
      return {
        hash: Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join(''),
        colors,
      }
    }, heroBox)
  }
  async function paintState() {
    return pixels()
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
  const history = async (direction) => {
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator('[data-u-command="univer.command.' + direction + '"]').click()
    await settle()
  }
  const selectHero = async () => {
    await page.keyboard.press('Escape')
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator('[data-u-command="pdf.menu.tool.mode"]').click()
    await page.getByText('Selection mode', { exact: true }).last().click()
    await settle()
    const i = (await images())[0].transform
    const p = await point(i.left + i.width / 2, i.top + i.height / 2)
    await page.mouse.click(p.x, p.y)
    await settle()
  }
  await page.goto('http://127.0.0.1:4380/', { waitUntil: 'domcontentloaded' })
  await ready()
  for (let frame = 0; frame < 12; frame++) await settle()
  const originalText = await textContent(),
    baseline = (await images())[0],
    initialPaint = await paintState()
  report.baseline = { image: baseline, paint: initialPaint }
  await gate('native-baseline-no-skeleton', async () => {
    assert.equal(await root.locator(':scope > details, :scope > fieldset, :scope > output').count(), 0)
    assert.equal((await images()).length, 1)
    assert.equal(baseline.source, artwork.summer)
    assert.equal((await snapshot()).metadata.reviewDate, '2027-03-31T09:00:00Z')
    assert.equal(
      await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    assert.ok(
      initialPaint.colors.red > 100 && initialPaint.colors.teal > 100,
      'Actual red sun and teal landscape must paint',
    )
    await page.screenshot({ path: path.join(directory, 'baseline.png') })
  })
  const snippets = [
    ...(await fs.readFile('showcase/pdfs/image-placement-crop/code/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ].map((m) => m[1])
  assert.equal(snippets.length, 16)
  report.literals = []
  for (let i = 0; i < snippets.length; i++)
    await gate('literal-' + (i + 1), async () => {
      if (i === 15)
        assert.equal(report.gates['literal-15'].passed, true, 'Undo-removal requires the removal block to succeed')
      const before = await snapshot(),
        prior = await images(),
        beforePaint = await paintState()
      const run = () => page.evaluate('(async () => {\n' + snippets[i] + '\n})()')
      if (i === 13) {
        await assert.rejects(run, /positive width and height/)
        assert.deepEqual(await snapshot(), before)
      } else await run()
      for (let frame = 0; frame < 8; frame++) await settle()
      const after = await images(),
        painted = await paintState()
      assert.deepEqual(await textContent(), originalText)
      if (i !== 0 && i !== 13) assert.notEqual(painted.hash, beforePaint.hash)
      if ([1, 3].includes(i)) {
        assert.equal(after[0].source, artwork.winter)
        assert.ok(painted.colors.violet > 100 && painted.colors.red === 0)
      }
      if ([2, 4].includes(i)) {
        assert.equal(after[0].source, artwork.summer)
        assert.deepEqual(after[0].transform, baseline.transform)
      }
      if (i === 5) {
        assert.deepEqual(after[0].crop, { left: 0, top: 0, right: 225, bottom: 270 })
        assert.ok(painted.colors.red > initialPaint.colors.red * 1.6)
      }
      if (i === 6) {
        assert.deepEqual(after[0].crop, { left: 225, top: 0, right: 450, bottom: 270 })
        assert.equal(painted.colors.red, 0)
      }
      if (i === 7) assert.deepEqual(after[0].crop, { left: 0, top: 0, right: 450, bottom: 270 })
      if (i === 8) assert.equal(after[0].transform.rotation, 10)
      if (i === 9) assert.deepEqual(after[0].transform, baseline.transform)
      if (i === 10) assert.equal(after[0].opacity, 0.35)
      if (i === 11) {
        assert.equal(after[0].opacity, 0)
        assert.equal(painted.colors.red + painted.colors.teal, 0)
      }
      if (i === 12) assert.equal(after[0].opacity, 1)
      if (i === 14) assert.equal(after.length, 0)
      if (i === 15) assert.equal(after[0].source, baseline.source)
      if (i >= 5 && i <= 13) assert.equal(after[0].source, prior[0].source)
      report.literals.push({ number: i + 1, paint: painted, image: after.map(({ source: _source, ...rest }) => rest) })
      if ([1, 5, 6, 8, 11].includes(i))
        await page.screenshot({ path: path.join(directory, 'literal-' + (i + 1) + '.png') })
    })
  // Independent native interaction acceptance starts from a fresh authored document.
  // Failed literal operations remain failed; do not let an unrelated Undo change its starting opacity.
  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready()
  for (let frame = 0; frame < 12; frame++) await settle()
  await gate('native-selection-properties', async () => {
    await selectHero()
    await page.getByRole('tab', { name: 'View', exact: true }).click()
    await page.getByRole('button', { name: 'Properties', exact: true }).click()
    await page.locator('[data-pdf-inspector] input').first().waitFor()
    report.properties = await page.locator('[data-pdf-inspector] input').evaluateAll((es) =>
      es.map((e) => ({
        value: e.value,
        aria: e.getAttribute('aria-label'),
        placeholder: e.getAttribute('placeholder'),
      })),
    )
    assert.deepEqual(
      report.properties.slice(0, 4).map((e) => e.value),
      ['96.00 px', '193.00 px', '600.00 px', '360.00 px'],
    )
    await page.screenshot({ path: path.join(directory, 'native-selected.png') })
  })
  await gate('native-property-position-history', async () => {
    const prior = await images(),
      beforePaint = await paintState()
    await page.locator('[data-pdf-inspector] input').first().fill('120')
    await page.locator('[data-pdf-inspector] input').first().press('Enter')
    await page.waitForFunction(
      () => window.univerAPI.getActivePdf().getPageByIndex(0).getImages()[0].getTransform().left === 90,
    )
    const moved = await images(),
      movedPaint = await paintState()
    await page.screenshot({ path: path.join(directory, 'native-position.png') })
    await history('undo')
    assert.deepEqual(await images(), prior)
    await history('redo')
    assert.deepEqual(await images(), moved)
    report.nativePosition = { beforePaint, movedPaint, undoRedoRestored: true }
    await history('undo')
    assert.deepEqual(await images(), prior)
    assert.notEqual(movedPaint.hash, beforePaint.hash, 'Native X change must repaint the image')
  })
  await gate('native-drag-history', async () => {
    await page.getByRole('button', { name: 'Close sidebar', exact: true }).click()
    await selectHero()
    const prior = await images(),
      beforePaint = await paintState(),
      t = prior[0].transform
    const beforeSnapshot = await snapshot()
    const start = await point(t.left + 180, t.top + 120),
      end = await point(t.left + 202, t.top + 143)
    await page.mouse.move(start.x, start.y)
    await page.mouse.down()
    await page.mouse.move(end.x, end.y, { steps: 20 })
    await page.mouse.up()
    for (let frame = 0; frame < 20; frame++) await settle()
    const moved = await images(),
      movedPaint = await paintState()
    report.nativeDrag = { before: t, after: moved[0].transform, beforePaint, movedPaint }
    await fs.writeFile(
      path.join(directory, 'native-drag-model.json'),
      JSON.stringify({ before: beforeSnapshot, after: await snapshot() }, null, 2),
    )
    assert.notEqual(movedPaint.hash, beforePaint.hash)
    await page.screenshot({ path: path.join(directory, 'native-dragged.png') })
    await history('undo')
    assert.deepEqual(await images(), prior)
    report.nativeDrag.undoPaint = await paintState()
    await history('redo')
    assert.deepEqual(await images(), moved)
    report.nativeDrag.redoPaint = await paintState()
    assert.ok(
      Math.abs(moved[0].transform.left - t.left - 22) < 2,
      'Native drag paints movement but must also update the image Facade transform',
    )
    assert.ok(Math.abs(moved[0].transform.top - t.top - 23) < 2)
  })
  await gate('native-crop-and-history', async () => {
    await selectHero()
    await page.getByRole('tab', { name: 'View', exact: true }).click()
    await page.getByRole('button', { name: 'Properties', exact: true }).click()
    await fs.writeFile(path.join(directory, 'inspector.html'), await page.locator('[data-pdf-inspector]').innerHTML())
    const t0 = (await images())[0].transform
    const menuPoint = await point(t0.left + 100, t0.top + 100)
    await page.mouse.click(menuPoint.x, menuPoint.y, { button: 'right' })
    await page.getByText('Delete', { exact: true }).waitFor()
    await settle()
    await fs.writeFile(path.join(directory, 'native-context-menu.html'), await page.locator('body').innerHTML())
    report.nativeCropAvailable = (await page.getByText('Crop image', { exact: true }).count()) > 0
    assert.equal(
      report.nativeCropAvailable,
      true,
      'Installed SDK exposes no Crop image control in selected-image Properties or its native context menu',
    )
    await page.getByText('Crop image', { exact: true }).click()
    await page.screenshot({ path: path.join(directory, 'native-crop-mode.png') })
    report.cropControls = await page
      .locator('[data-pdf-inspector] input')
      .evaluateAll((es) =>
        es.map((e) => ({ value: e.value, aria: e.getAttribute('aria-label'), outer: e.parentElement.outerHTML })),
      )
    await fs.writeFile(path.join(directory, 'crop-dom.html'), await root.innerHTML())
    const prior = await images(),
      t = prior[0].transform,
      beforePaint = await paintState()
    const start = await point(t.left, t.top + t.height / 2),
      end = await point(t.left + 70, t.top + t.height / 2)
    await page.mouse.move(start.x, start.y)
    await page.mouse.down()
    await page.mouse.move(end.x, end.y, { steps: 20 })
    await page.mouse.up()
    await page.keyboard.press('Enter')
    await settle()
    const cropped = await images(),
      cropPaint = await paintState()
    report.nativeCrop = { before: prior[0], after: cropped[0], beforePaint, cropPaint }
    assert.notDeepEqual(cropped[0].crop, prior[0].crop, 'Native crop handle must change image crop')
    assert.notEqual(cropPaint.hash, beforePaint.hash)
    await page.screenshot({ path: path.join(directory, 'native-cropped.png') })
    await history('undo')
    assert.deepEqual(await images(), prior)
    await history('redo')
    assert.deepEqual(await images(), cropped)
  })
  await gate('theme-owner-source-and-packs', async () => {
    const before = await snapshot()
    await page.evaluate(() => {
      window.originalPdfModel = window.univerAPI.getActivePdf().getModel()
      window.univerAPI.toggleDarkMode(true)
    })
    await settle()
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.equal(
      await page.evaluate(() => window.originalPdfModel === window.univerAPI.getActivePdf().getModel()),
      true,
    )
    assert.deepEqual(await snapshot(), before)
    assert.deepEqual(await textContent(), originalText)
    const factory = await fs.readFile('showcase/pdfs/image-placement-crop/code/create-demo.ts', 'utf8')
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 5)
    assert.equal([...factory.matchAll(/^import '.+\/lib\/index.css'/gm)].length, 5)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const [, p] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(p + locale)).default)
      assert.deepEqual(await snapshot(), before)
    }
  })
  await gate('disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('initial-chinese-native-ui', async () => {
    await page.route('http://127.0.0.1:4380/', async (r) => {
      const response = await r.fetch()
      await r.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, '<html lang="zh-CN">') })
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await ready()
    const p = await point(200, 250)
    await page.mouse.click(p.x, p.y)
    await page.getByRole('tab', { name: '视图', exact: true }).click()
    await page.getByRole('button', { name: '属性', exact: true }).click()
    await page.getByText('位置和大小', { exact: true }).waitFor()
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
  console.log(
    JSON.stringify(
      {
        ...report,
        baseline: undefined,
        dependencyVersions: undefined,
        literals: report.literals?.length,
        nativeCrop: report.nativeCrop
          ? { before: report.nativeCrop.before.crop, after: report.nativeCrop.after.crop }
          : undefined,
        cropControls: undefined,
      },
      null,
      2,
    ),
  )
  await browser?.close()
  await server?.httpServer.close()
}
if (!report.passed) process.exitCode = 1
