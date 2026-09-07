/* eslint-disable no-await-in-loop -- Native edits and complete history snapshots are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/research-paper-native-acceptance')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, gates: {}, errors: [], backendRequests: [], history: {}, literals: [] }
let browser, server
function pack(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') pack(actual?.[key], value)
    else assert.deepEqual(actual?.[key], value)
  }
}
try {
  const source = (await readShowcaseSources()).find((s) => s.slug === 'docs-traditional/research-paper')
  const project =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-research-native-')))
  report.export = { slug: source.slug, directory: project }
  report.dependencies = {}
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(project, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  const pkg = JSON.parse(source.files['/package.json'])
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const installed = await fs.realpath(
      name === 'vite'
        ? process.env.SHOWCASE_VITE_DIR || path.resolve('node_modules/vite')
        : path.resolve('node_modules', name),
    )
    assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version)
    const target = path.join(project, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    if (!(await fs.lstat(target).catch(() => null))) await fs.symlink(installed, target, 'junction')
    report.dependencies[name] = version
  }
  await fs.writeFile(path.join(directory, 'exports.json'), JSON.stringify([report.export], null, 2))
  const vite = await import(pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js')))
  await vite.build({ root: project, configFile: false, logLevel: 'warn' })
  const entry = source.files['/src/index.ts']
  await fs.writeFile(
    path.join(project, 'src/index.ts'),
    entry.replace(
      'const demo = createResearchPaperDemo(container)',
      'const demo = window.researchController = createResearchPaperDemo(container)',
    ) + '\nwindow.researchCreate = createResearchPaperDemo\n',
  )
  await vite.build({
    root: project,
    configFile: false,
    logLevel: 'warn',
    build: { outDir: path.join(directory, 'dist'), emptyOutDir: false },
  })
  await fs.writeFile(path.join(project, 'src/index.ts'), entry)
  report.harness = {
    outDir: path.join(directory, 'dist'),
    difference: 'Only exposes the actual factory/controller; preserves full normal entry layout, no additional UI.',
  }
  server = await vite.preview({
    root: project,
    configFile: false,
    build: { outDir: report.harness.outDir },
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
  page.setDefaultTimeout(9000)
  page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') report.errors.push(m.text())
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
  await page.addInitScript(() => {
    window.researchPaint = []
    const fill = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      if (window.researchPaint.length < 200000) window.researchPaint.push(String(text))
      return fill.call(this, text, ...args)
    }
  })
  const examples = [...source.files['/README.md'].matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map(
    (m) => m[1],
  )
  assert.equal(examples.length, 14)
  const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveDocument().save())))
  const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  const clearPaint = () =>
    page.evaluate(() => {
      window.researchPaint = []
    })
  const painted = (text) => page.waitForFunction((t) => window.researchPaint.join('').includes(t), text)
  const ready = async (title = 'Latency-Aware') => {
    await page.locator('.research-paper-demo[data-ready=true]').waitFor()
    await page.locator('[data-u-comp=workbench-skeleton-content]').waitFor({ state: 'detached' })
    await page.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
    await painted(title)
    await settle()
  }
  const fresh = async () => {
    await page.goto('http://127.0.0.1:4412', { waitUntil: 'domcontentloaded' })
    await ready()
  }
  const run = async (n) => {
    report.literals.push(n)
    return page.evaluate('(async()=>{\n' + examples[n - 1] + '\n})()')
  }
  const capture = async (name) => {
    await fs.writeFile(path.join(directory, name + '.json'), JSON.stringify(await snapshot(), null, 2))
    await page.screenshot({ path: path.join(directory, name + '.png') })
  }
  async function gate(name, fn) {
    try {
      const result = await fn()
      report.gates[name] = { passed: true, result }
    } catch (error) {
      report.gates[name] = { passed: false, error: error.stack || String(error) }
      await capture(name + '-failure').catch(() => {})
    }
    console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
  }
  async function history(name, before, after) {
    const evidence = { before, after }
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await settle()
    evidence.undo = await snapshot()
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await settle()
    evidence.redo = await snapshot()
    report.history[name] = evidence
    assert.deepEqual(evidence.undo, before)
    assert.deepEqual(evidence.redo, after)
  }
  async function nativeInput(text) {
    const box = await page.locator('#univer-doc-main-canvas').boundingBox()
    await page.mouse.click(box.x + box.width / 2, box.y + 110)
    await page.keyboard.press('Control+Home')
    await page.keyboard.press('End')
    const before = await snapshot()
    await clearPaint()
    await page.keyboard.type(text)
    await page.waitForFunction((t) => window.univerAPI.getActiveDocument().save().body.dataStream.includes(t), text)
    await page.waitForTimeout(700)
    await settle()
    await painted(text.trim())
    const after = await snapshot()
    assert.notDeepEqual(after, before)
    return { before, after }
  }

  const layout = () =>
    page.evaluate(() => {
      const api = window.univerAPI,
        doc = api.getActiveDocument(),
        injector = api._injector
      const key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      )
      const render = injector.get(key).getRenderUnitById(doc.getId()),
        skeleton = render.mainComponent._skeleton,
        pages = skeleton._skeletonData.pages
      return {
        pages: pages.map((p) => ({
          width: p.pageWidth,
          height: p.pageHeight,
          marginLeft: p.marginLeft,
          marginTop: p.marginTop,
        })),
        paragraphs: doc.getParagraphs().map((p) => {
          const glyph = skeleton.findNodeByCharIndex(p.getRange().startOffset)
          let owner = glyph
          while (owner && !pages.includes(owner)) owner = owner.parent
          return {
            id: p.getId(),
            text: p.getText(),
            page: pages.indexOf(owner),
            font: glyph?.fontStyle,
            color: glyph?.ts?.cl,
          }
        }),
        scrollY: render.scene.getViewport('viewMain').viewportScrollY,
      }
    })
  async function show(text) {
    await clearPaint()
    await page.mouse.move(1120, 740)
    for (let n = 0; n < 7; n++) {
      await page.mouse.wheel(0, 580)
      await page.waitForTimeout(140)
      await settle()
      if (await page.evaluate((t) => window.researchPaint.join('').includes(t), text)) {
        await page.mouse.wheel(0, 500)
        await page.waitForTimeout(140)
        await settle()
        return
      }
    }
    await painted(text)
  }
  await fresh()
  await gate('original-facts-native-grid-current-ink', async () => {
    const m = await snapshot()
    assert.equal(m.id, 'research-paper')
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().isTraditional()), true)
    for (const text of [
      'Latency-Aware Reconciliation for Offline Collaborative Documents',
      'A. Rivera · M. Chen · S. Okafor — Univer Systems Research',
      '12,480',
      '37%',
      '80 ms, 240 ms, and 1,200 ms',
      '142 ms',
      '611 ms',
      '0.8%',
      '2.6%',
      '25 MB',
      '[1] Univer Systems Group. Deterministic Operation Replay, 2026.',
      '[2] Open Collaboration Institute. Paginated Review Benchmarks, 2025.',
      'Seed: UDOC-2026-09-03 · Sessions: 12,480 · Frozen clock: 2026-08-31T09:00:00Z · Retry schedule: 1 s / 3 s / 10 s.',
    ])
      assert.ok(m.body.dataStream.includes(text), text)
    for (const text of ['Latency-Aware Reconciliation for Offline Collaborative Documents', 'Abstract', 'Introduction', 'Method']) await painted(text)
    for (const text of ['Add appendix', 'Reset'])
      assert.equal(await page.getByRole('button', { name: text, exact: true }).count(), 0)
    assert.equal(
      await page
        .locator(
          '.research-paper-demo > fieldset,.research-paper-demo > nav,.research-paper-demo output,.research-paper-demo details',
        )
        .count(),
      0,
    )
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await page.waitForFunction(() => {
      const c = document.getElementById('univer-doc-main-canvas')
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let ink = 0
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] < 100 && d[i + 1] < 100 && d[i + 2] < 150) ink++
      return ink > 2500
    })
    await capture('baseline')
  })
  await gate('native-pagination-original-appendix-and-geometry', async () => {
    const actual = await layout()
    assert.ok(actual.pages.length >= 2)
    for (const p of actual.pages) {
      assert.equal(p.width, 794)
      assert.equal(p.height, 1123)
      assert.equal(p.marginLeft, 72)
    }
    const appendix = actual.paragraphs.find((p) => p.text === 'Appendix A. Reproduction Parameters')
    const refs = actual.paragraphs.find((p) => p.text.startsWith('[2]'))
    assert.ok(appendix.page > refs.page)
    assert.ok(actual.paragraphs.every((p) => p.page >= 0))
    assert.ok(actual.paragraphs.some((p) => JSON.stringify(p.font).includes('Times New Roman')))
    await fs.writeFile(path.join(directory, 'original-layout.json'), JSON.stringify(actual, null, 2))
    await show('Appendix A.')
    await capture('appendix-a')
    return { pages: actual.pages.length, appendixPage: appendix.page }
  })
  await fresh()
  let typed
  await gate('native-keyboard-model-and-paint', async () => {
    typed = await nativeInput(' Reviewed')
    await capture('native-input')
  })
  await gate('native-keyboard-complete-history', async () => {
    assert.ok(typed)
    await history('native-typing', typed.before, typed.after)
  })
  await fresh()
  const baseline = await snapshot(),
    literalStates = {}
  for (let n = 1; n <= 14; n++)
    await gate('literal-' + n, async () => {
      const before = await snapshot()
      await clearPaint()
      if (n === 4) {
        await assert.rejects(run(n), /Reviewer appendix already exists/)
        assert.deepEqual(await snapshot(), before)
        return 'Expected repeat request rejected from live model'
      }
      if (n === 7) {
        await page.mouse.click(760, 500)
      }
      await run(n)
      if (n === 14) await ready()
      await settle()
      const after = await snapshot()
      literalStates[n] = { before, after }
      if (n === 1) assert.deepEqual(await page.evaluate(() => window.researchSaved), baseline)
      if (n === 3) {
        assert.equal(after.body.dataStream.split('Appendix B. Reviewer Checklist').length - 1, 1)
        const a = await layout()
        const appendixA = a.paragraphs.find((p) => p.text.startsWith('Appendix A.'))
        const appendixB = a.paragraphs.find((p) => p.text.startsWith('Appendix B.'))
        assert.ok(appendixB.page > appendixA.page)
        await show('Appendix B.')
        await capture('appendix-b')
      }
      if (n === 5) assert.ok(after.body.dataStream.includes('Reviewer note: compare the tail latency with the median'))
      if (n === 6) {
        const actual = await layout()
        const method = actual.paragraphs.find((p) => p.text === '2. Method')
        assert.equal(method.color.rgb, '#735195')
      }
      if (n === 8) {
        const a = await layout()
        assert.ok(a.pages.every((p) => p.marginLeft === 100))
        assert.ok(after.body.dataStream.includes('142 ms'))
      }
      if (n === 11) {
        assert.deepEqual(after, before)
        await painted('Latency-Aware')
        await capture('literal-restored-edits')
      }
      if (n === 12) {
        assert.equal(after.id, before.id)
        assert.equal(after.body.dataStream, '\r\n')
        await capture('literal-empty')
      }
      if (n === 13) {
        assert.deepEqual(after, baseline)
        await painted('Latency-Aware')
        await capture('literal-original-restored')
      }
      if (n === 14) assert.deepEqual(after, baseline)
    })
  await gate('all-14-literals-executed', async () => assert.equal(new Set(report.literals).size, 14))
  await gate('literal-margins-complete-history', async () => {
    report.history.margins = {
      before: literalStates[8].before,
      after: literalStates[8].after,
      undo: literalStates[9].after,
      redo: literalStates[10].after,
    }
    assert.deepEqual(literalStates[9].after, literalStates[8].before)
    assert.deepEqual(literalStates[10].after, literalStates[8].after)
  })
  await gate('literal-appendix-preserves-original-paragraph-identities', async () => {
    const before = literalStates[3].before.body.paragraphs.map((p) => p.paragraphId)
    assert.deepEqual(
      literalStates[3].after.body.paragraphs.slice(0, before.length).map((p) => p.paragraphId),
      before,
    )
  })
  await gate('literal-heading-preserves-paragraph-identity', async () => {
    assert.deepEqual(
      literalStates[6].after.body.paragraphs.map((p) => p.paragraphId),
      literalStates[6].before.body.paragraphs.map((p) => p.paragraphId),
    )
  })
  await gate('same-id-full-owner-recovery', async () => {
    await nativeInput(' Retained')
    const before = await snapshot()
    await clearPaint()
    await page.evaluate(() => {
      const saved = structuredClone(window.univerAPI.getActiveDocument().save())
      window.oldResearchOwner = window.univerAPI
      window.oldResearchRoot = document.querySelector('.research-paper-demo')
      window.researchController.dispose()
      window.researchController.dispose()
      window.researchController = window.researchCreate(document.getElementById('app'), false, saved)
    })
    await ready()
    assert.equal(
      await page.evaluate(() => window.oldResearchOwner !== window.univerAPI && !window.oldResearchRoot.isConnected),
      true,
    )
    assert.deepEqual(await snapshot(), before)
    await capture('owner-restored')
  })
  let rebuilt
  await gate('rebuilt-owner-native-fresh-edit', async () => {
    rebuilt = await nativeInput(' Verified')
    await capture('rebuilt-edited')
  })
  await gate('rebuilt-owner-native-complete-history', async () => {
    assert.ok(rebuilt)
    await history('rebuilt-typing', rebuilt.before, rebuilt.after)
  })
  await gate('same-owner-theme-exact-snapshot', async () => {
    const before = await snapshot()
    await page.evaluate(() => {
      window.sameOwner = window.univerAPI
      window.sameRoot = document.querySelector('.research-paper-demo')
    })
    for (const dark of [true, false]) {
      await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
      await settle()
      assert.equal(
        await page.evaluate(
          () =>
            window.sameOwner === window.univerAPI && window.sameRoot === document.querySelector('.research-paper-demo'),
        ),
        true,
      )
      assert.deepEqual(await snapshot(), before)
    }
  })
  await gate('invalid-snapshot-before-owner-mutation', async () => {
    const before = await snapshot()
    for (const invalid of ['id', 'width']) {
      assert.equal(
        await page.evaluate((key) => {
          const saved = structuredClone(window.univerAPI.getActiveDocument().save())
          if (key === 'id') saved.id = 'replacement-id'
          else saved.documentStyle.pageSize.width = 0
          try {
            window.researchCreate(document.getElementById('app'), false, saved)
            return false
          } catch {
            return true
          }
        }, invalid),
        true,
      )
      assert.deepEqual(await snapshot(), before)
      assert.equal(await page.locator('.research-paper-demo').count(), 1)
    }
  })
  await gate('empty-owner-and-complete-same-id-recovery', async () => {
    const before = await snapshot()
    await page.evaluate(() => {
      window.researchCheckpoint = structuredClone(window.univerAPI.getActiveDocument().save())
      const empty = structuredClone(window.researchCheckpoint)
      empty.body = {
        dataStream: '\r\n',
        paragraphs: [{ startIndex: 0, paragraphId: 'research-empty' }],
        textRuns: [],
        sectionBreaks: [{ startIndex: 1 }],
      }
      window.researchController.dispose()
      window.researchController = window.researchCreate(document.getElementById('app'), false, empty)
    })
    await page.locator('.research-paper-demo[data-ready=true]').waitFor()
    await page.locator('[data-u-comp=workbench-skeleton-content]').waitFor({ state: 'detached' })
    assert.equal((await snapshot()).body.dataStream, '\r\n')
    await capture('empty-owner')
    await clearPaint()
    await page.evaluate(() => {
      window.researchController.dispose()
      window.researchController = window.researchCreate(
        document.getElementById('app'),
        false,
        window.researchCheckpoint,
      )
    })
    await ready()
    assert.deepEqual(await snapshot(), before)
    await capture('empty-owner-restored')
  })
  for (const locale of ['en-US', 'zh-CN'])
    await gate('initial-' + locale + '-full-locale-and-css', async () => {
      await page.route('**/*', async (route) => {
        if (route.request().resourceType() === 'document') {
          const response = await route.fetch()
          await route.fulfill({
            response,
            body: (await response.text()).replace(/<html[^>]*>/, '<html lang="' + locale + '">'),
          })
        } else await route.continue()
      })
      await fresh()
      pack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs/preset-docs-core/locales/' + locale)).default,
      )
      assert.ok(source.files['/src/create-demo.ts'].includes("import '@univerjs/preset-docs-core/lib/index.css'"))
      await page
        .getByText(locale === 'zh-CN' ? '页面设置' : 'Page Setup', { exact: true })
        .first()
        .waitFor()
      await capture('initial-' + locale)
      await page.unrouteAll({ behavior: 'wait' })
    })
  await gate('active-disposal-idempotent', async () => {
    await page.mouse.click(780, 380)
    await page.evaluate(() => {
      window.researchController.dispose()
      window.researchController.dispose()
    })
    assert.equal(await page.locator('.research-paper-demo').count(), 0)
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('normal-production-current-canvas-and-wordcount', async () => {
    await new Promise((resolve) => server.httpServer.close(resolve))
    server = await vite.preview({
      root: project,
      configFile: false,
      preview: { host: '127.0.0.1', port: 4412, strictPort: true },
    })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await fresh()
    await page.waitForFunction(() => {
      const c = document.getElementById('univer-doc-main-canvas'),
        d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let ink = 0
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] < 100 && d[i + 1] < 100 && d[i + 2] < 150) ink++
      return ink > 2500 && /\b[1-9]\d* words\b/.test(document.body.innerText)
    })
    assert.equal(await page.evaluate(() => typeof window.researchController), 'undefined')
    await capture('normal-production-settled')
    return {
      normalFiles: Object.keys(source.files).length,
      currentCanvasInk: true,
      nativeWordCount: true,
      noSkeleton: true,
    }
  })
  await gate('no-runtime-errors-or-backend', async () => {
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.backendRequests, [])
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} catch (error) {
  report.fatal = error.stack || String(error)
} finally {
  await browser?.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        directory,
        passed: report.passed,
        fatal: report.fatal,
        gates: Object.fromEntries(Object.entries(report.gates).map(([k, v]) => [k, v.passed])),
      },
      null,
      2,
    ),
  )
}
if (!report.passed) process.exitCode = 1
