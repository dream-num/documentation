/* eslint-disable no-await-in-loop -- Verify one native image action and exact history at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheets-images-native')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, gates: {}, errors: [], warnings: [], backendRequests: [] }
function includesPack(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') includesPack(actual[key], value)
    else assert.equal(actual[key], value)
  }
}
function drawing(data, id = 'cedar-route') {
  return JSON.parse(data.resources.find((r) => r.name === 'SHEET_DRAWING_PLUGIN').data).inventory.data[id]
}
function order(data) {
  return JSON.parse(data.resources.find((r) => r.name === 'SHEET_DRAWING_PLUGIN').data).inventory.order
}
function parsedResourceSnapshot(data) {
  return {
    ...data,
    resources: data.resources.map((resource) => {
      try {
        return { ...resource, data: JSON.parse(resource.data) }
      } catch {
        return resource
      }
    }),
  }
}
let server, browser
try {
  const exported = (await readShowcaseSources()).find((c) => c.slug === 'sheets/images')
  const project =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-sheets-images-native-')))
  for (const [name, source] of Object.entries(exported.files)) {
    const target = path.join(project, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, source)
    assert.equal(await fs.readFile(target, 'utf8'), source)
  }
  const manifest = JSON.parse(exported.files['/package.json'])
  report.dependencyVersions = {}
  for (const [name, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
    const installed =
      name === 'vite'
        ? process.env.SHOWCASE_VITE_DIR || path.resolve('node_modules/vite')
        : path.resolve('node_modules', name)
    assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version)
    const target = path.join(project, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    if (!(await fs.lstat(target).catch(() => null))) await fs.symlink(await fs.realpath(installed), target, 'junction')
    report.dependencyVersions[name] = version
  }
  report.sourceFiles = Object.keys(exported.files).length
  await fs.writeFile(
    path.join(directory, 'exports.json'),
    JSON.stringify([{ slug: exported.slug, directory: project }], null, 2),
  )
  const { build, preview } = await import(
    pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js'))
  )
  await build({ root: project, configFile: false, logLevel: 'warn' })
  server = await preview({
    root: project,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4402, strictPort: true },
  })
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
  page.setDefaultTimeout(10000)
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

  const root = page.locator('.sheet-images-demo')
  const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const run = (code) => page.evaluate('(async () => {\n' + code + '\n})()')
  const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveWorkbook().save())))
  const settle = async () => {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    await page.waitForTimeout(100)
  }
  const pixels = () => canvas.screenshot()
  const layout = () =>
    run("return window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getDrawingLayout()")
  async function colors() {
    return canvas.evaluate((c) => {
      const rgba = c.getContext('2d').getImageData(0, 0, c.width, c.height).data,
        counts = { teal: 0, amber: 0, purple: 0 }
      for (let i = 0; i < rgba.length; i += 4) {
        if (rgba[i] === 15 && rgba[i + 1] === 118 && rgba[i + 2] === 110) counts.teal++
        if (rgba[i] === 180 && rgba[i + 1] === 83 && rgba[i + 2] === 9) counts.amber++
        if (rgba[i] === 126 && rgba[i + 1] === 34 && rgba[i + 2] === 206) counts.purple++
      }
      return counts
    })
  }
  async function ready() {
    await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 90000 })
    await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
    await settle()
    assert.ok(
      Object.values(await colors()).every((n) => n > 500),
      'Actual three image sources must paint',
    )
  }
  async function fresh() {
    await page.goto('http://127.0.0.1:4402')
    await ready()
  }
  const shot = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
  async function gate(name, fn) {
    try {
      report.gates[name] = { passed: true, result: await fn() }
    } catch (e) {
      report.gates[name] = { passed: false, error: e.stack || String(e) }
      await shot(name + '-FAIL').catch(() => {})
      await fs.writeFile(path.join(directory, name + '-FAIL.html'), await page.content()).catch(() => {})
    }
    await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  }
  async function point(id = 'cedar-route') {
    const bounds = (await layout()).drawings.find((d) => d.drawingId === id).bounds,
      c = await canvas.boundingBox()
    return { x: c.x + bounds.left + bounds.width / 3, y: c.y + bounds.top + bounds.height / 3 }
  }
  await fresh()
  await gate('startup-original-artwork', async () => {
    const model = await snapshot(),
      data = model.sheets.inventory.cellData
    assert.deepEqual(model.sheetOrder, ['inventory', 'checks'])
    assert.equal((await layout()).drawings.length, 3)
    for (const row of [3, 4, 5]) assert.equal(Object.keys(data[row][0].p.drawings).length, 1)
    assert.equal(data[4][3].v, 0)
    assert.equal(data[5][1].v, 'Safety tag · Éloïse')
    assert.equal(data[8][2].f, '=SUMPRODUCT(C4:C6,D4:D6)')
    assert.equal(await root.locator(':scope > section, :scope > aside').count(), 0)
    await shot('baseline')
    return { colors: await colors(), ids: (await layout()).drawings.map((d) => d.drawingId), noSkeleton: true }
  })
  await gate('native-select-drag-pixels', async () => {
    const before = await snapshot(),
      oldPaint = await pixels(),
      p = await point()
    await page.mouse.move(p.x, p.y)
    await page.mouse.down()
    await page.mouse.move(p.x + 48, p.y + 32, { steps: 12 })
    await page.mouse.up()
    await settle()
    const after = await snapshot()
    report.nativeDrag = { before, after }
    const selected = await run(
      "return window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getActiveImages().map(i => i.getId())",
    )
    assert.ok(selected.includes('cedar-route'), JSON.stringify(selected))
    assert.notDeepEqual(drawing(after).transform, drawing(before).transform)
    assert.notDeepEqual(await pixels(), oldPaint)
    await shot('native-drag')
  })
  await gate('native-drag-full-history', async () => {
    await page.keyboard.press('Control+z')
    await settle()
    report.nativeDrag.undo = await snapshot()
    await page.keyboard.press('Control+y')
    await settle()
    report.nativeDrag.redo = await snapshot()
    assert.deepEqual(report.nativeDrag.undo, report.nativeDrag.before)
    assert.deepEqual(report.nativeDrag.redo, report.nativeDrag.after)
  })
  await gate('native-drag-parsed-resource-history', async () => {
    assert.deepEqual(parsedResourceSnapshot(report.nativeDrag.undo), parsedResourceSnapshot(report.nativeDrag.before))
    assert.deepEqual(parsedResourceSnapshot(report.nativeDrag.redo), parsedResourceSnapshot(report.nativeDrag.after))
    return { allFieldsAndIdsCompared: true, rawSerializationGateRetained: true }
  })
  await fresh()
  await gate('native-image-properties', async () => {
    const p = await point()
    await page.mouse.click(p.x, p.y)
    await settle()
    await page.locator('.univerjs-icon-autofill-double-icon').click()
    await page.getByRole('menuitem', { name: 'Edit', exact: true }).click()
    await page.getByText('Edit Image', { exact: true }).waitFor()
    await shot('native-properties')
    const width = page.getByText('Width (px)', { exact: true }).locator('..').locator('input')
    const before = await snapshot(),
      oldPaint = await pixels()
    await width.fill('200')
    await width.press('Enter')
    // Native DrawingTransform debounces its property command by 300ms.
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getActiveWorkbook()
          .getSheetBySheetId('inventory')
          .getDrawingLayout()
          .drawings.find((image) => image.drawingId === 'cedar-route').bounds.width === 200,
    )
    await settle()
    const after = await snapshot()
    report.nativeProperties = { before, after }
    assert.equal(drawing(after).transform.width, 200)
    assert.notDeepEqual(await pixels(), oldPaint)
    await shot('native-properties-edited')
  })
  await gate('native-properties-full-history', async () => {
    await run('window.univerAPI.getActiveWorkbook().undo()')
    await settle()
    const undo = await snapshot()
    await run('window.univerAPI.getActiveWorkbook().redo()')
    await settle()
    const redo = await snapshot()
    report.nativePropertiesHistory = { undo, redo }
    assert.deepEqual(undo, report.nativeProperties.before)
    assert.deepEqual(redo, report.nativeProperties.after)
  })
  await gate('native-properties-parsed-resource-history', async () => {
    assert.deepEqual(
      parsedResourceSnapshot(report.nativePropertiesHistory.undo),
      parsedResourceSnapshot(report.nativeProperties.before),
    )
    assert.deepEqual(
      parsedResourceSnapshot(report.nativePropertiesHistory.redo),
      parsedResourceSnapshot(report.nativeProperties.after),
    )
    return { allFieldsAndIdsCompared: true, rawSerializationGateRetained: true }
  })
  const readme = await fs.readFile('showcase/sheets/images/code/README.md', 'utf8')
  const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((m) => m[1])
  assert.equal(examples.length, 37)
  await fresh()
  let cellDownload
  for (let i = 0; i < examples.length; i++)
    await gate('literal-' + String(i + 1).padStart(2, '0'), async () => {
      const before = await snapshot(),
        oldPaint = await pixels()
      let result
      if (i === 27) {
        const pending = page.waitForEvent('download')
        result = await run(examples[i])
        cellDownload = await pending
        await cellDownload.saveAs(path.join(directory, 'original-cell-image.download'))
        report.cellDownload = {
          filename: cellDownload.suggestedFilename(),
          bytes: (await fs.stat(path.join(directory, 'original-cell-image.download'))).size,
        }
      } else if (i === 31) {
        const source = await page.evaluate(async () => {
          const image = new Image()
          image.src = window.cedarSources[0]
          await image.decode()
          const c = document.createElement('canvas')
          c.width = image.width
          c.height = image.height
          c.getContext('2d').drawImage(image, 0, 0)
          return c.toDataURL('image/png').split(',')[1]
        })
        const chooser = page.waitForEvent('filechooser'),
          pending = run(examples[i])
        await (
          await chooser
        ).setFiles({ name: 'cedar-route.png', mimeType: 'image/png', buffer: Buffer.from(source, 'base64') })
        result = await pending
        assert.deepEqual(await snapshot(), before, 'File selection only stages a source')
      } else result = await run(examples[i])
      await settle()
      const after = await snapshot()
      if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 19, 20, 21, 22, 23, 24, 26, 29, 30, 32].includes(i)) {
        assert.notDeepEqual(after, before, 'Real SDK document must change')
        assert.notDeepEqual(await pixels(), oldPaint, 'Actual canvas pixels must change')
      }
      if (i === 1 || i === 2) assert.equal(drawing(after).transform.width, i === 1 ? 120 : 240)
      if (i === 3) {
        assert.equal(drawing(after).sheetTransform.from.row, 5)
        assert.equal(drawing(after).sheetTransform.from.column, 6)
      }
      if (i === 4 || i === 5)
        assert.deepEqual(drawing(after).srcRect, {
          top: i === 4 ? 20 : 0,
          left: i === 4 ? 20 : 0,
          bottom: i === 4 ? 20 : 0,
          right: i === 4 ? 20 : 0,
        })
      if (i === 6 || i === 7) assert.equal(drawing(after).transform.angle, i === 6 ? 30 : 0)
      if (i === 8 || i === 9)
        assert.equal(drawing(after).source, await run('return window.cedarSources[' + (i === 8 ? 1 : 0) + ']'))
      if ([10, 13, 16].includes(i)) assert.equal(drawing(after).anchorType, { 10: '0', 13: '1', 16: '2' }[i])
      if ([11, 14, 17].includes(i)) assert.equal(after.sheets.inventory.rowData[5].h, 150)
      if ([20, 21, 22, 23].includes(i)) {
        assert.notDeepEqual(order(after), order(before))
      }
      if ([4, 6, 8].includes(i)) {
        const evidence = { before, after }
        await run('window.univerAPI.getActiveWorkbook().undo()')
        await settle()
        evidence.undo = await snapshot()
        await run('window.univerAPI.getActiveWorkbook().redo()')
        await settle()
        evidence.redo = await snapshot()
        report['builder-' + { 4: 'crop', 6: 'rotation', 8: 'source' }[i]] = evidence
      }
      if (i === 24) assert.deepEqual(after.sheets.inventory.cellData[4][1], before.sheets.inventory.cellData[4][1])
      if (i === 25) assert.equal(Object.keys(after.sheets.inventory.cellData[35][11].p.drawings).length, 1)
      if (i === 26) assert.ok(!after.sheets.inventory.cellData[35]?.[11]?.p)
      if (i === 34 || i === 36) assert.equal(after.id, await run('return window.cedarSnapshot.id'))
      if (i === 35) {
        assert.equal((await layout()).drawings.length, 0)
        await shot('literal-empty')
      }
      return { executed: true, result }
    })
  for (const operation of ['crop', 'rotation', 'source']) {
    await gate('builder-' + operation + '-raw-history', async () => {
      const evidence = report['builder-' + operation]
      assert.deepEqual(evidence.undo, evidence.before)
      assert.deepEqual(evidence.redo, evidence.after)
    })
    await gate('builder-' + operation + '-parsed-resource-history', async () => {
      const evidence = report['builder-' + operation]
      assert.deepEqual(parsedResourceSnapshot(evidence.undo), parsedResourceSnapshot(evidence.before))
      assert.deepEqual(parsedResourceSnapshot(evidence.redo), parsedResourceSnapshot(evidence.after))
    })
  }
  await gate('download-extension-matches-bytes', async () => {
    const bytes = await fs.readFile(path.join(directory, 'original-cell-image.download'))
    assert.ok(bytes.toString().includes('<svg'), 'Original SVG bytes retained')
    assert.match(cellDownload.suggestedFilename(), /\.svg$/i, 'Preserved SVG bytes must not be presented as PNG')
  })
  await gate('local-invalid-input-preserves-state', async () => {
    const before = await snapshot(),
      oldSource = await run('return window.cedarLocalSource')
    for (const [name, mimeType, buffer, error] of [
      ['empty.png', 'image/png', Buffer.alloc(0), /non-empty/],
      ['corrupt.png', 'image/png', Buffer.from('not a png'), /signature/],
      ['unsupported.svg', 'image/svg+xml', Buffer.from('<svg/>'), /non-empty/],
      ['oversized.png', 'image/png', Buffer.alloc(2 * 1024 * 1024 + 1), /non-empty/],
    ]) {
      const chooser = page.waitForEvent('filechooser'),
        pending = run(examples[31])
      const rejected = assert.rejects(pending, error)
      await (await chooser).setFiles({ name, mimeType, buffer })
      await rejected
      assert.deepEqual(await snapshot(), before)
      assert.equal(await run('return window.cedarLocalSource'), oldSource)
    }
  })
  for (const operation of ['crop', 'rotation', 'source']) {
    await fresh()
    await gate('direct-' + operation + '-paint', async () => {
      const before = await snapshot(),
        paint = await pixels()
      const code =
        operation === 'crop'
          ? 'image.setCrop(20,20,20,20)'
          : operation === 'rotation'
            ? 'image.setRotate(30)'
            : "image.setSource(sheet.getImageById('cedar-sensor').toBuilder().getSource(),window.univerAPI.Enum.ImageSourceType.BASE64)"
      const result = await run(
        "{const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory'); const image = sheet.getImageById('cedar-route'); return " +
          code +
          '}',
      )
      await settle()
      const after = await snapshot()
      report['direct-' + operation] = { before, after, result }
      assert.notDeepEqual(drawing(after), drawing(before))
      assert.notDeepEqual(await pixels(), paint, 'Direct setter must actually repaint')
    })
    await gate('direct-' + operation + '-full-history', async () => {
      const evidence = report['direct-' + operation]
      await run('window.univerAPI.getActiveWorkbook().undo()')
      await settle()
      evidence.undo = await snapshot()
      await run('window.univerAPI.getActiveWorkbook().redo()')
      await settle()
      evidence.redo = await snapshot()
      assert.deepEqual(evidence.undo, evidence.before)
      assert.deepEqual(evidence.redo, evidence.after)
    })
    await gate('direct-' + operation + '-parsed-resource-history', async () => {
      const evidence = report['direct-' + operation]
      assert.deepEqual(parsedResourceSnapshot(evidence.undo), parsedResourceSnapshot(evidence.before))
      assert.deepEqual(parsedResourceSnapshot(evidence.redo), parsedResourceSnapshot(evidence.after))
    })
  }
  await fresh()
  await gate('absolute-reload-authored-content', async () => {
    await run(examples[0])
    await run(examples[16])
    report.absolute = { before: await snapshot(), beforeLayout: await layout() }
    await run(examples[33])
    await run(examples[34])
    await settle()
    report.absolute.after = await snapshot()
    report.absolute.afterLayout = await layout()
    assert.equal(report.absolute.after.id, report.absolute.before.id)
    assert.deepEqual(report.absolute.after.sheetOrder, report.absolute.before.sheetOrder)
    assert.deepEqual(report.absolute.after.sheets.inventory.cellData, report.absolute.before.sheets.inventory.cellData)
    assert.deepEqual(report.absolute.after.sheets.checks.cellData, report.absolute.before.sheets.checks.cellData)
    await shot('absolute-reload')
  })
  await gate('absolute-reload-rendered-bounds', async () => {
    assert.deepEqual(report.absolute.afterLayout, report.absolute.beforeLayout)
  })
  await gate('absolute-reload-full-model-ids', async () => {
    assert.deepEqual(report.absolute.after, report.absolute.before)
  })
  await fresh()
  await gate('same-owner-theme', async () => {
    await run(
      "window.cedarOwner = window.univerAPI; window.cedarModel = window.univerAPI.getActiveWorkbook(); window.cedarModel.getActiveSheet().getRange('B4').setValue('Ridge route / reviewed')",
    )
    const before = await snapshot()
    await run('window.univerAPI.toggleDarkMode(true)')
    await settle()
    await run('window.univerAPI.toggleDarkMode(false)')
    await settle()
    assert.deepEqual(await snapshot(), before)
    assert.equal(await run('return window.univerAPI === window.cedarOwner'), true)
    assert.deepEqual(await run('return JSON.parse(JSON.stringify(window.cedarModel.save()))'), before)
  })
  await gate('initial-zh-packs-css', async () => {
    await page.route('http://127.0.0.1:4402/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, '<html lang="zh-CN">') })
    })
    await fresh()
    await page.getByText('开始', { exact: true }).first().waitFor()
    const p = await point()
    await page.mouse.click(p.x, p.y)
    await settle()
    await page.locator('.univerjs-icon-autofill-double-icon').click()
    await page.getByRole('menuitem', { name: '编辑', exact: true }).click()
    await page.getByText('编辑图片', { exact: true }).waitFor()
    await shot('initial-zh')
    const factory = exported.files['/src/create-demo.ts']
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 2)
    assert.equal([...factory.matchAll(/^import '.+\/lib\/index.css'/gm)].length, 2)
    const before = await snapshot()
    for (const [lang, locale] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((value) => window.univerAPI.setLocale(value), locale)
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + lang)).default)
      assert.deepEqual(await snapshot(), before)
    }
    assert.doesNotMatch(await root.innerText(), /drawing-ui\.|sheets-drawing-ui\./)
  })
  await gate('dispose-owner', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('no-backend-runtime-errors', async () => {
    assert.deepEqual(report.backendRequests, [])
    assert.deepEqual(report.errors, [])
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.fatal = e.stack || String(e)
} finally {
  await browser?.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        gates: Object.fromEntries(Object.entries(report.gates).map(([k, v]) => [k, v.passed])),
        fatal: report.fatal,
        directory,
      },
      null,
      2,
    ),
  )
  if (!report.passed) process.exitCode = 1
}
