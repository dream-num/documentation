/* eslint-disable no-await-in-loop -- Native interactions and literal examples execute in authored order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/connector-native')
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
  const exported = (await readShowcaseSources()).find((c) => c.slug === 'boards/connector-routing')
  const project =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-connector-native-')))
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
  const { build, preview } = await import(pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js')))
  await build({ root: project, configFile: false, logLevel: 'warn' })
  server = await preview({
    root: project,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4396, strictPort: true },
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
  await page.addInitScript(() => {
    window.boardFrames = new Map()
    const proto = CanvasRenderingContext2D.prototype,
      fill = proto.fillText,
      clear = proto.clearRect,
      draw = proto.drawImage
    proto.fillText = function (...args) {
      window.boardFrames.set(
        this.canvas,
        [...(window.boardFrames.get(this.canvas) || []), String(args[0])].slice(-50000),
      )
      return Reflect.apply(fill, this, args)
    }
    proto.clearRect = function (...args) {
      window.boardFrames.set(this.canvas, [])
      return Reflect.apply(clear, this, args)
    }
    proto.drawImage = function (source, ...args) {
      if (source !== this.canvas)
        window.boardFrames.set(
          this.canvas,
          [...(window.boardFrames.get(this.canvas) || []), ...(window.boardFrames.get(source) || [])].slice(-50000),
        )
      return Reflect.apply(draw, this, [source, ...args])
    }
  })
  const root = page.locator('.connector-routing')
  const canvas = root.locator('[data-board-viewport-host] canvas').first()
  const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveBoard().save())))
  const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  const run = (code) => page.evaluate('(async () => {\n' + code + '\n})()')
  const pixels = () => canvas.screenshot()
  async function paint(text) {
    await page.waitForFunction(
      (wanted) =>
        [...window.boardFrames].some(
          ([c, words]) =>
            c.isConnected &&
            c.closest('[data-board-viewport-host]') &&
            c.clientWidth > 500 &&
            words.join('').includes(wanted),
        ),
      text,
    )
  }
  async function ready() {
    await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 90000 })
    await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
    await paint('Signed commit')
    await paint('Promotion (detached)')
    await settle()
  }
  async function fresh() {
    await page.goto('http://127.0.0.1:4396')
    await ready()
  }
  async function shot(name) {
    await page.screenshot({ path: path.join(directory, name + '.png') })
  }
  async function gate(name, fn) {
    try {
      report.gates[name] = { passed: true, result: await fn() }
    } catch (e) {
      report.gates[name] = { passed: false, error: e.stack || String(e) }
      await shot(name + '-FAIL').catch(() => {})
    }
    await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  }
  const point = (id) =>
    page.evaluate((elementId) => {
      const p = window.univerAPI.getActiveBoard().getElementViewportPoint(elementId)
      const r = document.querySelector('[data-board-viewport-host] canvas').getBoundingClientRect()
      return { x: r.x + p.x, y: r.y + p.y }
    }, id)
  async function routes() {
    await settle()
    return page.evaluate(() =>
      window.univerAPI.executeCommand('board-ui.command.analyze-rendered-layout', {
        unitId: 'connector-routing-board',
        subUnitId: 'workflow',
      }),
    )
  }
  async function endpoints() {
    const actual = await routes()
    assert.equal(actual.source, 'rendered')
    const info = await page.evaluate(() => {
      const b = window.univerAPI.getActiveBoard()
      return {
        elements: b.describeElements({ includeHidden: true }),
        connections: Object.fromEntries(
          b
            .getElementOrder()
            .filter((id) => b.getConnectorConnection(id))
            .map((id) => [id, b.getConnectorConnection(id)]),
        ),
      }
    })
    assert.equal(actual.routes.length, 12)
    for (const route of actual.routes) {
      assert.equal(route.resolved, true, route.connectorId)
      for (const [side, p] of [
        ['start', route.points[0]],
        ['end', route.points.at(-1)],
      ]) {
        const endpoint = info.connections[route.connectorId][side]
        let expected = endpoint
        if (endpoint.kind === 'shapeSite') {
          const b = info.elements.find((e) => e.id === endpoint.shapeId).bounds
          expected = [
            { x: b.left + b.width / 2, y: b.top },
            { x: b.left + b.width, y: b.top + b.height / 2 },
            { x: b.left + b.width / 2, y: b.top + b.height },
            { x: b.left, y: b.top + b.height / 2 },
          ][Number(endpoint.connectionSiteId)]
        }
        assert.ok(
          Math.abs(p.x - expected.x) < 0.1 && Math.abs(p.y - expected.y) < 0.1,
          route.connectorId + ':' + side + JSON.stringify({ p, expected }),
        )
      }
    }
    return actual
  }
  await fresh()
  await gate('startup-native-story', async () => {
    assert.equal(await root.locator(':scope > header, :scope > aside').count(), 0)
    const data = await snapshot()
    assert.equal(data.pages.workflow.elementOrder.length, 20)
    await paint('Pass')
    await paint('Retry')
    await shot('baseline')
    return { noSkeleton: true, elements: 20, paintedStory: true }
  })
  await gate('rendered-route-endpoints', endpoints)
  await gate('native-node-drag-route-history', async () => {
    const before = await snapshot(),
      oldRoutes = await routes(),
      image = await pixels(),
      p = await point('tests')
    await page.mouse.move(p.x, p.y)
    await page.mouse.down()
    await page.mouse.move(p.x + 84, p.y + 56, { steps: 14 })
    await page.mouse.up()
    await settle()
    const changed = await snapshot()
    assert.notDeepEqual(changed.pages.workflow.elements.tests.transform, before.pages.workflow.elements.tests.transform)
    const newRoutes = await endpoints()
    for (const id of ['lint-tests', 'tests-package', 'tests-quarantine', 'staging-tests'])
      assert.notDeepEqual(
        newRoutes.routes.find((r) => r.connectorId === id).points,
        oldRoutes.routes.find((r) => r.connectorId === id).points,
      )
    assert.notDeepEqual(await pixels(), image)
    await shot('native-drag')
    await page.keyboard.press('Control+z')
    await settle()
    assert.deepEqual(
      (await snapshot()).pages.workflow.elements.tests.transform,
      before.pages.workflow.elements.tests.transform,
    )
    await page.keyboard.press('Control+y')
    await settle()
    assert.deepEqual(
      (await snapshot()).pages.workflow.elements.tests.transform,
      changed.pages.workflow.elements.tests.transform,
    )
    return { incidentRoutes: 4, nativeUndoRedo: true }
  })
  await fresh()
  async function connectorPoint(id) {
    const layout = await routes(),
      route = layout.routes.find((r) => r.connectorId === id)
    const a = await point('source'),
      b = await point('lint'),
      zoom = (b.x - a.x) / 200
    const segment = route.points
      .slice(1)
      .map((p, i) => ({
        a: route.points[i],
        b: p,
        length: Math.hypot(p.x - route.points[i].x, p.y - route.points[i].y),
      }))
      .toSorted((x, y) => y.length - x.length)[0]
    return {
      x: a.x + ((segment.a.x + segment.b.x) / 2 - 120) * zoom,
      y: a.y + ((segment.a.y + segment.b.y) / 2 - 105) * zoom,
    }
  }
  await gate('native-connector-select-routing', async () => {
    const p = await connectorPoint('tests-quarantine')
    await page.mouse.click(p.x, p.y)
    const toolbar = page.locator('[data-board-connector-floating-toolbar="true"]')
    await toolbar.waitFor()
    await shot('native-connector-selected')
    await toolbar.getByRole('button', { name: /^Line settings/ }).click()
    await page.getByRole('button', { name: 'Curve', exact: true }).click()
    await settle()
    assert.equal(
      await run("return window.univerAPI.getActiveBoard().getConnectorConnection('tests-quarantine').routing"),
      'curve',
    )
    await endpoints()
    await shot('native-curve')
  })
  await fresh()
  await gate('native-free-endpoint-drag-history', async () => {
    const pick = await connectorPoint('staging-release')
    await page.mouse.click(pick.x, pick.y)
    await page.locator('[data-board-connector-floating-toolbar="true"]').waitFor()
    const origin = await point('source'),
      zoom = ((await point('lint')).x - origin.x) / 200
    const p = { x: origin.x + (750 - 120) * zoom, y: origin.y + (285 - 105) * zoom }
    const before = await run("return window.univerAPI.getActiveBoard().getConnectorConnection('staging-release')")
    const beforeModel = await snapshot()
    const beforePaint = await pixels()
    await page.mouse.move(p.x, p.y)
    await page.mouse.down()
    await page.mouse.move(p.x + 35 * zoom, p.y - 35 * zoom, { steps: 14 })
    await page.mouse.up()
    await settle()
    const changed = await run("return window.univerAPI.getActiveBoard().getConnectorConnection('staging-release')")
    const changedModel = await snapshot()
    assert.equal(changed.end.kind, 'free')
    assert.ok(Math.abs(changed.end.x - 785) < 1 && Math.abs(changed.end.y - 250) < 1, JSON.stringify(changed.end))
    for (const key of ['kind', 'shapeId', 'connectionSiteId']) assert.equal(changed.start[key], before.start[key])
    // Native drag may materialize the derived fallback point; binding identity must remain intact.
    if (changed.start.fallbackPoint) assert.deepEqual(changed.start.fallbackPoint, { x: 390, y: 355 })
    await endpoints()
    assert.notDeepEqual(await pixels(), beforePaint)
    await shot('native-free-endpoint-drag')
    await page.keyboard.press('Control+z')
    await settle()
    const undone = await run("return window.univerAPI.getActiveBoard().getConnectorConnection('staging-release')")
    const undoneModel = await snapshot()
    assert.deepEqual(undone.end, before.end)
    for (const key of ['kind', 'shapeId', 'connectionSiteId']) assert.equal(undone.start[key], before.start[key])
    await endpoints()
    await page.keyboard.press('Control+y')
    await settle()
    const redone = await run("return window.univerAPI.getActiveBoard().getConnectorConnection('staging-release')")
    const redoneModel = await snapshot()
    assert.deepEqual(redone, changed)
    return { before, changed, undone, redone, beforeModel, changedModel, undoneModel, redoneModel, nativeHistory: true }
  })
  await gate('native-free-endpoint-full-model-history', async () => {
    const evidence = report.gates['native-free-endpoint-drag-history'].result
    assert.deepEqual(evidence.undone, evidence.before)
    assert.deepEqual(evidence.redone, evidence.changed)
    assert.deepEqual(evidence.undoneModel, evidence.beforeModel)
    assert.deepEqual(evidence.redoneModel, evidence.changedModel)
    return { fullSerializedModelUndoRedo: true }
  })
  await fresh()
  await gate('native-label-edit-history', async () => {
    report.nativeLabelGeometry = {
      before: (await snapshot()).pages.workflow.elements['source-lint'].connectorData.label,
    }
    const p = await connectorPoint('source-lint')
    p.y -= (58 * ((await point('lint')).x - (await point('source')).x)) / 200
    await page.mouse.dblclick(p.x, p.y)
    await page.waitForFunction(
      () =>
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true',
    )
    await page.waitForTimeout(400)
    await page.keyboard.press('Control+a')
    await page.keyboard.insertText('Analyze securely')
    await page.waitForTimeout(400)
    await page.mouse.click(1450, 800)
    await settle()
    const actual = await run(
      "return window.univerAPI.getActiveBoard().getConnectorLabelText('source-lint').toPlainText()",
    )
    assert.equal(actual.trim(), 'Analyze securely')
    report.nativeLabelGeometry.after = (await snapshot()).pages.workflow.elements['source-lint'].connectorData.label
    await paint('Analyze securely')
    await shot('native-label-edited')
    await page.keyboard.press('Control+z')
    await settle()
    assert.equal(
      (await run("return window.univerAPI.getActiveBoard().getConnectorLabelText('source-lint').toPlainText()")).trim(),
      'Analyze',
    )
    await page.keyboard.press('Control+y')
    await paint('Analyze securely')
  })
  await gate('native-label-offset-preservation', async () => {
    assert.deepEqual(report.nativeLabelGeometry.after.offset, report.nativeLabelGeometry.before.offset)
    assert.deepEqual(report.nativeLabelGeometry.after.style, report.nativeLabelGeometry.before.style)
  })
  await fresh()
  const readme = await fs.readFile('showcase/boards/connector-routing/code/README.md', 'utf8')
  const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((m) => m[1])
  assert.equal(examples.length, 19)
  for (let i = 0; i < examples.length; i++)
    await gate('literal-' + String(i + 1).padStart(2, '0'), async () => {
      const before = await snapshot()
      const beforePaint = await pixels()
      if (i === 13) {
        await assert.rejects(run(examples[i]), /SDK rejected missing-target/)
        assert.deepEqual(await snapshot(), before)
        return { invalidRejected: true }
      }
      const result = await run(examples[i])
      await settle()
      if (i > 0 && i < 16) {
        assert.notDeepEqual(await snapshot(), before, 'The literal must change the actual document')
        assert.notDeepEqual(await pixels(), beforePaint, 'The literal must change the actual canvas pixels')
      }
      if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(i)) await endpoints()
      if (i === 12) await paint('Approved')
      if (i === 17) {
        assert.equal((await snapshot()).pages.workflow.elementOrder.length, 0)
        assert.notDeepEqual(await pixels(), beforePaint)
        await shot('literal-empty')
      }
      if (i === 18) {
        assert.equal((await snapshot()).pages.workflow.elementOrder.length, 20)
        await paint('Approved')
      }
      return { executed: true, result }
    })
  await gate('same-owner-theme', async () => {
    await page.evaluate(() => {
      window.previousOwner = window.univerAPI
      window.previousBoard = window.univerAPI.getActiveBoard()
    })
    const before = await snapshot()
    await run('window.univerAPI.toggleDarkMode(true)')
    await settle()
    await run('window.univerAPI.toggleDarkMode(false)')
    await settle()
    assert.deepEqual(await snapshot(), before)
    assert.equal(
      await page.evaluate(
        () =>
          window.previousOwner === window.univerAPI &&
          JSON.stringify(window.previousBoard.save()) === JSON.stringify(window.univerAPI.getActiveBoard().save()),
      ),
      true,
    )
  })
  await gate('chinese-host-english-native-locale', async () => {
    await page.route('http://127.0.0.1:4396/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, '<html lang="zh-CN">') })
    })
    await fresh()
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'zh-CN')
    const p = await connectorPoint('tests-quarantine')
    await page.mouse.click(p.x, p.y)
    await page.locator('[data-board-connector-floating-toolbar="true"]').waitFor()
    const labels = await page
      .locator('button[aria-label]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('aria-label')))
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
    assert.ok(labels.some((s) => s.startsWith('Line settings')))
    assert.ok(labels.every((s) => !/(?:shape-editor-ui|ink-ui|boards-ui)\.[\w.]+/.test(s)))
    await shot('initial-zh')
    return { labels }
  })
  await gate('complete-english-css-packs', async () => {
    const factory = exported.files['/src/create-demo.ts']
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 7)
    assert.equal([...factory.matchAll(/^import '.+\/lib\/index.css'/gm)].length, 7)
    const before = await snapshot()
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
    assert.equal(factory.includes('/locale/zh-CN'), false)
    for (const [, prefix] of packs)
      includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + 'en-US')).default)
    assert.deepEqual(await snapshot(), before)
    return { officialCss: 7, enPacks: 7 }
  })
  await gate('disposal', async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('no-backend-or-runtime-errors', async () => {
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
