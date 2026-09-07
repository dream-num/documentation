/* eslint-disable no-await-in-loop -- Native edits and complete history snapshots are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/knowledge-space-native-acceptance')
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
  const source = (await readShowcaseSources()).find((s) => s.slug === 'docs-modern/company-knowledge-base')
  const project =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-knowledge-native-')))
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
      'const demo = createKnowledgeBaseDemo(container)',
      'const demo = window.knowledgeController = createKnowledgeBaseDemo(container)',
    ) + '\nwindow.knowledgeCreate = createKnowledgeBaseDemo\n',
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
    window.knowledgePaint = []
    const fill = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      if (window.knowledgePaint.length < 200000) window.knowledgePaint.push(String(text))
      return fill.call(this, text, ...args)
    }
  })
  const examples = [...source.files['/README.md'].matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map(
    (m) => m[1],
  )
  assert.equal(examples.length, 14)
  const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveDocument().save())))
  const space = () => page.evaluate(() => JSON.parse(JSON.stringify(window.knowledgeController.save())))
  const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  const clearPaint = () =>
    page.evaluate(() => {
      window.knowledgePaint = []
    })
  const painted = (text) => page.waitForFunction((t) => window.knowledgePaint.join('').includes(t), text)
  const ready = async (title = 'Engineering Handbook') => {
    await page.locator('.knowledge-demo[data-ready=true]').waitFor()
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
  async function navigate(id, title) {
    await clearPaint()
    await page.locator('.knowledge-navigation button[data-page="' + id + '"]').click()
    await painted(title)
    assert.equal((await snapshot()).id, 'knowledge-' + id)
    assert.equal(await page.locator('.knowledge-navigation button[aria-current]').getAttribute('data-page'), id)
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
  await fresh()
  await gate('native-grid-original-handbook-and-no-duplicate-controls', async () => {
    const saved = await snapshot()
    assert.equal(saved.id, 'knowledge-handbook')
    for (const text of [
      'Engineering Handbook',
      'Platform Enablement',
      '2027-01-08',
      'Use this handbook to make safe technical decisions',
      'Every change has an owner',
      'API Standards · Incident Response · Release Checklist',
    ])
      assert.ok(saved.body.dataStream.includes(text), text)
    for (const text of ['Engineering Handbook', 'Delivery standards', 'Related pages']) await painted(text)
    assert.equal(
      await page.locator('.knowledge-demo > fieldset,.knowledge-demo output,.knowledge-demo details').count(),
      0,
    )
    for (const text of ['Mark reviewed', 'Reset space'])
      assert.equal(await page.getByRole('button', { name: text, exact: true }).count(), 0)
    assert.equal(await page.locator('.knowledge-navigation button').count(), 3)
    const css = await page
      .locator('[data-u-comp=workbench-layout]')
      .evaluate((e) => getComputedStyle(e).backgroundColor)
    assert.equal(css, 'rgb(255, 255, 255)')
    const ink = await page.locator('#univer-doc-main-canvas').evaluate((c) => {
      const p = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let n = 0
      for (let i = 0; i < p.length; i += 4) if (p[i + 3] > 200 && p[i] < 100 && p[i + 1] < 100 && p[i + 2] < 150) n++
      return n
    })
    assert.ok(ink > 2000)
    await capture('baseline')
    return { css, ink }
  })
  await gate('all-three-original-documents-and-real-navigation-paint', async () => {
    for (const [id, title, owner, date, text] of [
      [
        'api',
        'API Standards',
        'Developer Experience',
        '2027-01-12',
        'Published APIs remain source-compatible inside a major version.',
      ],
      [
        'legacy',
        'Legacy Deployment Guide',
        'Infrastructure',
        '2026-06-30',
        'This page is retained for audit history. Use Release Checklist for current deployments.',
      ],
    ]) {
      await navigate(id, title)
      for (const marker of [title, owner, date, text])
        assert.ok((await snapshot()).body.dataStream.includes(marker), marker)
      await painted(id === 'api' ? 'Compatibility' : 'Replacement')
      await capture('page-' + id)
    }
    await navigate('handbook', 'Engineering Handbook')
  })
  let typed
  await gate('true-native-keyboard-model-and-paint', async () => {
    typed = await nativeInput(' Reviewed')
    await capture('native-input')
  })
  await gate('true-native-keyboard-complete-undo-redo', async () => {
    assert.ok(typed)
    await history('native-keyboard', typed.before, typed.after)
  })
  await gate('navigation-preserves-full-edited-document', async () => {
    const before = await snapshot()
    await navigate('api', 'API Standards')
    await navigate('handbook', 'Engineering Handbook')
    assert.deepEqual(await snapshot(), before)
    await capture('navigation-restored')
  })
  await fresh()
  const checkpoint = await snapshot()
  const literalStates = {}
  for (let n = 1; n <= examples.length; n++) {
    await gate('literal-' + n, async () => {
      if (n === 4) await navigate('legacy', 'Legacy Deployment Guide')
      if (n === 5) await navigate('handbook', 'Engineering Handbook')
      if (n === 7) {
        const box = await page.locator('#univer-doc-main-canvas').boundingBox()
        await page.mouse.click(box.x + 300, box.y + 120)
      }
      const before = await snapshot()
      await clearPaint()
      if (n === 4) {
        await assert.rejects(run(n), /Archived or unknown page cannot be reviewed/)
        assert.deepEqual(await snapshot(), before)
        return 'Expected archived application policy rejection'
      }
      await run(n)
      if (n === 14) await ready()
      await settle()
      const after = await snapshot()
      literalStates[n] = { before, after }
      if (n === 1) assert.deepEqual(await page.evaluate(() => window.knowledgeSaved), checkpoint)
      if (n === 3) {
        assert.ok(after.body.dataStream.includes('2027-01-15 · Fresh'))
        await painted('Fresh')
        await capture('literal-reviewed')
      }
      if (n === 5) {
        const p = await page.evaluate(
          () => window.univerAPI.getActiveDocument().findParagraphByText('Delivery standards').getInfo().paragraph,
        )
        assert.equal(p.paragraphStyle.textStyle.cl.rgb, '#147B73')
        await painted('Delivery standards')
      }
      if (n === 6) {
        assert.ok(after.body.dataStream.includes('Record the rollback owner before release.'))
        await painted('rollback owner')
      }
      if (n === 8) {
        assert.ok(after.body.dataStream.includes('Review observation:'))
        await painted('Review observation')
      }
      if (n === 9) assert.equal(after.body.dataStream.includes('Review observation:'), false)
      if (n === 10) assert.equal(after.body.dataStream.includes('Review observation:'), true)
      if (n === 11) {
        assert.deepEqual(after, before)
        await painted('Engineering Handbook')
        await capture('literal-same-id')
      }
      if (n === 12) {
        assert.equal(after.id, before.id)
        assert.equal(after.body.dataStream, '\r\n')
        await capture('literal-empty')
      }
      if (n === 13) {
        assert.deepEqual(after, checkpoint)
        await painted('Engineering Handbook')
        await capture('literal-restored')
      }
      if (n === 14) assert.deepEqual(after, checkpoint)
    })
  }
  await gate('literal-append-complete-undo-redo', async () => {
    assert.deepEqual(literalStates[9].after, literalStates[8].before)
    assert.deepEqual(literalStates[10].after, literalStates[8].after)
  })
  await gate('literal-review-preserves-original-paragraph-identities', async () => {
    assert.deepEqual(
      literalStates[3].after.body.paragraphs.map((p) => p.paragraphId),
      literalStates[3].before.body.paragraphs.map((p) => p.paragraphId),
    )
  })
  await gate('literal-heading-preserves-paragraph-identities', async () => {
    assert.deepEqual(
      literalStates[5].after.body.paragraphs.map((p) => p.paragraphId),
      literalStates[5].before.body.paragraphs.map((p) => p.paragraphId),
    )
  })
  await gate('literal-heading-native-glyph-and-pixels', async () => {
    await fresh()
    await run(5)
    await settle()
    const glyph = await page.evaluate(() => {
      const api = window.univerAPI,
        doc = api.getActiveDocument()
      const injector = api._injector
      const key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      )
      const render = injector.get(key).getRenderUnitById(doc.getId())
      const p = doc.findParagraphByText('Delivery standards')
      const g = render.mainComponent._skeleton.findNodeByCharIndex(p.getRange().startOffset)
      return { content: g.content, color: g.ts?.cl, font: g.fontStyle }
    })
    assert.equal(glyph.color.rgb, '#147B73')
    const pixels = await page.locator('#univer-doc-main-canvas').evaluate(c => {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let count = 0
      for (let i = 0; i < d.length; i += 4)
        if (Math.abs(d[i] - 20) < 6 && Math.abs(d[i + 1] - 123) < 6 && Math.abs(d[i + 2] - 115) < 6 && d[i + 3] > 200) count++
      return count
    })
    assert.ok(pixels > 100)
    await capture('literal-heading')
    return { glyph, pixels }
  })
  await gate('literal-review-complete-undo-redo', async () => {
    await fresh()
    await run(2)
    const before = await snapshot()
    await run(3)
    await settle()
    await history('literal-review', before, await snapshot())
  })
  await gate('all-14-literals-executed', async () => assert.equal(new Set(report.literals).size, 14))
  await gate('same-id-full-space-owner-reconstruction', async () => {
    await nativeInput(' Retained')
    await navigate('api', 'API Standards')
    await nativeInput(' Compatible')
    const before = await space()
    await clearPaint()
    await page.evaluate(() => {
      const saved = window.knowledgeController.save()
      window.oldKnowledgeOwner = window.univerAPI
      window.oldKnowledgeRoot = document.querySelector('.knowledge-demo')
      window.knowledgeController.dispose()
      window.knowledgeController.dispose()
      window.knowledgeController = window.knowledgeCreate(document.getElementById('app'), false, saved)
    })
    await ready('API Standards')
    assert.equal(
      await page.evaluate(() => window.oldKnowledgeOwner !== window.univerAPI && !window.oldKnowledgeRoot.isConnected),
      true,
    )
    assert.deepEqual(await space(), before)
    await capture('full-owner-restored')
  })
  let rebuilt
  await gate('rebuilt-owner-fresh-native-edit', async () => {
    rebuilt = await nativeInput(' Verified')
    await capture('rebuilt-edited')
  })
  await gate('rebuilt-owner-complete-native-history', async () => {
    assert.ok(rebuilt)
    await history('rebuilt-native', rebuilt.before, rebuilt.after)
  })
  await gate('same-owner-theme-all-document-snapshots', async () => {
    const before = await space()
    await page.evaluate(() => {
      window.sameKnowledgeAPI = window.univerAPI
      window.sameKnowledgeRoot = document.querySelector('.knowledge-demo')
    })
    for (const dark of [true, false]) {
      await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
      await settle()
      assert.equal(
        await page.evaluate(
          () =>
            window.sameKnowledgeAPI === window.univerAPI &&
            window.sameKnowledgeRoot === document.querySelector('.knowledge-demo'),
        ),
        true,
      )
      assert.deepEqual(await space(), before)
      await capture(dark ? 'theme-dark' : 'theme-light')
    }
  })
  await gate('full-owner-empty-and-exact-space-restore', async () => {
    const before = await space()
    await page.evaluate(() => {
      window.knowledgeSpaceCheckpoint = window.knowledgeController.save()
      const empty = structuredClone(window.knowledgeSpaceCheckpoint)
      empty.documents[empty.activePageId].body = {
        dataStream: '\r\n',
        paragraphs: [{ startIndex: 0, paragraphId: 'knowledge-empty-paragraph' }],
        textRuns: [],
        sectionBreaks: [{ startIndex: 1 }],
      }
      window.knowledgeController.dispose()
      window.knowledgeController = window.knowledgeCreate(document.getElementById('app'), false, empty)
    })
    await page.locator('.knowledge-demo[data-ready=true]').waitFor()
    await page.locator('[data-u-comp=workbench-skeleton-content]').waitFor({ state: 'detached' })
    assert.equal((await snapshot()).body.dataStream, '\r\n')
    assert.equal((await snapshot()).id, before.documents[before.activePageId].id)
    await capture('empty-owner')
    await clearPaint()
    await page.evaluate(() => {
      window.knowledgeController.dispose()
      window.knowledgeController = window.knowledgeCreate(
        document.getElementById('app'),
        false,
        window.knowledgeSpaceCheckpoint,
      )
    })
    await ready('API Standards')
    assert.deepEqual(await space(), before)
    await capture('empty-owner-restored')
  })
  await gate('invalid-navigation-and-restore-preserve-owner', async () => {
    const before = await space()
    for (const method of ['navigation', 'snapshot']) {
      assert.equal(
        await page.evaluate((m) => {
          try {
            if (m === 'navigation') window.knowledgeController.openPage('missing')
            else {
              const saved = window.knowledgeController.save()
              saved.documents.api.id = 'replacement-id'
              window.knowledgeCreate(document.getElementById('app'), false, saved)
            }
            return false
          } catch {
            return true
          }
        }, method),
        true,
      )
      assert.deepEqual(await space(), before)
      assert.equal(await page.locator('.knowledge-demo').count(), 1)
    }
  })
  for (const locale of ['en-US', 'zh-CN'])
    await gate('initial-' + locale + '-full-preset-and-css', async () => {
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
      assert.equal(
        await page.locator('.knowledge-navigation').getAttribute('aria-label'),
        locale === 'zh-CN' ? '知识库页面' : 'Knowledge pages',
      )
      assert.ok(source.files['/src/create-demo.ts'].includes("import '@univerjs/preset-docs-core/lib/index.css'"))
      assert.ok(await page.locator('[data-u-comp=ribbon-grid-toolbar]').innerText())
      await capture('initial-' + locale)
      await page.unrouteAll({ behavior: 'wait' })
    })
  await gate('native-literal-slash-input-preservation', async () => {
    await fresh()
    await nativeInput(' / Reviewed')
  })
  await gate('active-owner-idempotent-disposal', async () => {
    const box = await page.locator('#univer-doc-main-canvas').boundingBox()
    await page.mouse.click(box.x + 300, box.y + 100)
    await page.evaluate(() => {
      window.knowledgeController.dispose()
      window.knowledgeController.dispose()
    })
    assert.equal(await page.locator('.knowledge-demo').count(), 0)
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('normal-production-current-canvas-paint', async () => {
    await new Promise(resolve => server.httpServer.close(resolve))
    server = await vite.preview({ root: project, configFile: false, preview: { host: '127.0.0.1', port: 4412, strictPort: true } })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await fresh()
    await page.waitForFunction(() => {
      const c = document.getElementById('univer-doc-main-canvas')
      if (!c?.width || !c.height) return false
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
      let ink = 0
      for (let i = 0; i < d.length; i += 4)
        if (d[i + 3] > 200 && d[i] < 100 && d[i + 1] < 100 && d[i + 2] < 150) ink++
      return ink > 2000
    })
    assert.equal(await page.evaluate(() => typeof window.knowledgeController), 'undefined')
    await page.waitForFunction(() => /\b[1-9]\d* words\b/.test(document.body.innerText))
    await capture('normal-production-settled')
    report.normalSourceFiles = Object.keys(source.files).length
    return { currentCanvasInk: true, startupOverlayAbsent: true, nativeWordCount: true }
  })
  await gate('no-backend-or-runtime-errors', async () => {
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
        gates: Object.fromEntries(Object.entries(report.gates).map(([key, value]) => [key, value.passed])),
      },
      null,
      2,
    ),
  )
}
if (!report.passed) process.exitCode = 1
