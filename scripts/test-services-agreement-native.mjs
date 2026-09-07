/* eslint-disable no-await-in-loop -- Native edits and complete history snapshots are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/services-agreement-native-acceptance')
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
  const source = (await readShowcaseSources()).find((s) => s.slug === 'docs-traditional/services-agreement')
  const project =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-services-native-')))
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
      'const demo = createServicesAgreementDemo(container)',
      'const demo = window.agreementController = createServicesAgreementDemo(container)',
    ) + '\nwindow.agreementCreate = createServicesAgreementDemo\n',
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
    window.agreementPaint = []
    const fill = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      if (window.agreementPaint.length < 200000) window.agreementPaint.push(String(text))
      return fill.call(this, text, ...args)
    }
  })
  const examples = [...source.files['/README.md'].matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map(
    (m) => m[1],
  )
  assert.equal(examples.length, 12)
  const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveDocument().save())))
  const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  const clearPaint = () =>
    page.evaluate(() => {
      window.agreementPaint = []
    })
  const painted = (text) => page.waitForFunction((t) => window.agreementPaint.join('').includes(t), text)
  const ready = async (title = 'Professional Services Agreement') => {
    await page.locator('.services-agreement-demo[data-ready=true]').waitFor()
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

  const { AGREEMENT } = await import('../showcase/docs-traditional/services-agreement/code/data.ts')
  async function goPage(index, offset = 0) {
    const actual = await layout()
    const target = actual.pages.slice(0, index).reduce((sum, p) => sum + p.height + 20, 0) + offset
    await clearPaint()
    await page.mouse.move(1130, 730)
    await page.mouse.wheel(0, target - actual.scrollY)
    await page.waitForTimeout(240)
    await settle()
  }
  await fresh()
  await gate('original-sixteen-clause-body-and-native-grid', async () => {
    const m = await snapshot()
    assert.equal(m.id, 'services-agreement-v3-2')
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveDocument().isTraditional()), true)
    for (const text of [
      AGREEMENT.title,
      AGREEMENT.parties,
      ...AGREEMENT.clauses.flat(),
      ...AGREEMENT.limitationBefore,
      AGREEMENT.referenceBefore,
      '16. Signatures',
      'Provider: ____________________',
      'Customer: ____________________',
    ])
      assert.ok(m.body.dataStream.includes(text), text)
    for (const text of ['Professional Services Agreement', '1. Services', '2. Fees']) await painted(text)
    for (const text of ['Accept Clause 15', 'Reset'])
      assert.equal(await page.getByRole('button', { name: text, exact: true }).count(), 0)
    assert.equal(
      await page
        .locator('.services-agreement-demo output,.services-agreement-demo fieldset,.services-agreement-demo > nav')
        .count(),
      0,
    )
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await capture('baseline')
  })
  await gate('native-pages-signature-break-and-clause-keep-rules', async () => {
    const a = await layout(),
      m = await snapshot()
    assert.ok(a.pages.length >= 2)
    for (const p of a.pages) {
      assert.equal(p.width, 794)
      assert.equal(p.height, 1123)
      assert.equal(p.marginLeft, 78)
    }
    const sign = a.paragraphs.find((p) => p.text === '16. Signatures'),
      reference = a.paragraphs.find((p) => p.text === AGREEMENT.referenceBefore)
    assert.ok(sign.page > reference.page)
    for (const [heading] of AGREEMENT.clauses) {
      const paragraph = await page.evaluate(
        (t) => window.univerAPI.getActiveDocument().findParagraphByText(t).getInfo().paragraph,
        heading,
      )
      assert.equal(paragraph.paragraphStyle.keepNext, 1)
    }
    assert.ok(JSON.stringify(m.footers).includes('SERVICES AGREEMENT · VERSION 3.2'))
    await fs.writeFile(path.join(directory, 'original-layout.json'), JSON.stringify(a, null, 2))
    await goPage(sign.page)
    await painted('16. Signatures')
    await capture('signature-page')
    return { pages: a.pages.length, signaturePage: sign.page }
  })
  await gate('native-version-footer-paint', async () => {
    await goPage(0, 450)
    await painted('VERSION 3.2')
    await capture('version-footer')
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
  const original = await snapshot(),
    states = {}
  for (let n = 1; n <= 12; n++)
    await gate('literal-' + n, async () => {
      const before = await snapshot()
      await clearPaint()
      if (n === 4) await page.mouse.click(780, 500)
      await run(n)
      if (n === 12) await ready()
      await settle()
      const after = await snapshot()
      states[n] = { before, after }
      if (n === 1) {
        for (const t of [...AGREEMENT.limitationAfter, AGREEMENT.referenceAfter])
          assert.ok(after.body.dataStream.includes(t), t)
        const a = await layout(),
          p = a.paragraphs.find((paragraph) => paragraph.text === AGREEMENT.limitationAfter[0])
        await goPage(p.page, 240)
        await painted('Clause 15 accepted')
        await capture('accepted-clause')
      }
      if (n === 2) assert.deepEqual(await page.evaluate(() => window.agreementSaved), after)
      if (n === 3) assert.ok(after.body.dataStream.includes('Reviewed against Version 3.2.'))
      if (n === 6) assert.ok((await layout()).pages.every((p) => p.marginLeft === 100))
      if (n === 9) {
        assert.deepEqual(after, before)
        assert.ok(JSON.stringify(after.footers).includes('VERSION 3.2'))
        await capture('literal-recreated')
      }
      if (n === 10) {
        assert.equal(after.id, before.id)
        assert.equal(after.body.dataStream, '\r\n')
        assert.deepEqual(after.footers, before.footers)
        await capture('literal-empty')
      }
      if (n === 11) {
        assert.deepEqual(after, states[2].after)
        await painted('Professional Services Agreement')
        await capture('literal-checkpoint-restored')
      }
      if (n === 12) {
        assert.equal(after.id, original.id)
        assert.equal(after.body.dataStream, original.body.dataStream)
        assert.equal(after.body.dataStream.includes('Clause 15 accepted'), false)
      }
    })
  await gate('all-12-literals-executed', async () => assert.equal(new Set(report.literals).size, 12))
  await gate('clause-recipe-repeat-no-op-and-original-identities', async () => {
    await fresh()
    const before = await snapshot()
    await run(1)
    const after = await snapshot()
    assert.deepEqual(
      after.body.paragraphs.map((p) => p.paragraphId),
      before.body.paragraphs.map((p) => p.paragraphId),
    )
    assert.deepEqual(after.footers, before.footers)
    await run(1)
    assert.deepEqual(await snapshot(), after)
  })
  await gate('clause-recipe-rejects-user-edited-target-before-mutation', async () => {
    await fresh()
    await page.evaluate(() => {
      const p = window.univerAPI.getActiveDocument().findParagraphByText('Commercial approval:')
      if (!p.setText('Commercial approval: requested bespoke review.')) throw new Error('Could not prepare user edit')
    })
    const before = await snapshot()
    await assert.rejects(run(1), /Expected one unchanged clause/)
    assert.deepEqual(await snapshot(), before)
    await capture('unexpected-edit-rejected')
  })
  await gate('clause-three-step-complete-undo-redo', async () => {
    await fresh()
    const before = await snapshot()
    await run(1)
    await settle()
    const after = await snapshot(),
      evidence = { before, after, undo: [], redo: [] }
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-u-command="univer.command.undo"]').click()
      await settle()
      evidence.undo.push(await snapshot())
    }
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-u-command="univer.command.redo"]').click()
      await settle()
      evidence.redo.push(await snapshot())
    }
    report.history.clause = evidence
    assert.deepEqual(evidence.undo.at(-1), before)
    assert.deepEqual(evidence.redo.at(-1), after)
  })
  await gate('literal-margins-complete-history', async () => {
    report.history.margins = {
      before: states[6].before,
      after: states[6].after,
      undo: states[7].after,
      redo: states[8].after,
    }
    assert.deepEqual(states[7].after, states[6].before)
    assert.deepEqual(states[8].after, states[6].after)
  })
  await gate('same-id-full-owner-recovery-footer-and-fresh-state', async () => {
    await fresh()
    await run(1)
    await nativeInput(' Retained')
    const before = await snapshot()
    await clearPaint()
    await page.evaluate(() => {
      const saved = structuredClone(window.univerAPI.getActiveDocument().save())
      window.oldAgreementOwner = window.univerAPI
      window.oldAgreementRoot = document.querySelector('.services-agreement-demo')
      window.agreementController.dispose()
      window.agreementController.dispose()
      window.agreementController = window.agreementCreate(document.getElementById('app'), false, undefined, saved)
    })
    await ready()
    assert.equal(
      await page.evaluate(() => window.oldAgreementOwner !== window.univerAPI && !window.oldAgreementRoot.isConnected),
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
  await gate('rebuilt-owner-complete-native-history', async () => {
    assert.ok(rebuilt)
    await history('rebuilt-typing', rebuilt.before, rebuilt.after)
  })
  await gate('same-owner-theme-preserves-complete-document', async () => {
    const before = await snapshot()
    await page.evaluate(() => {
      window.sameOwner = window.univerAPI
      window.sameRoot = document.querySelector('.services-agreement-demo')
    })
    for (const dark of [true, false]) {
      await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
      await settle()
      assert.equal(
        await page.evaluate(
          () =>
            window.sameOwner === window.univerAPI &&
            window.sameRoot === document.querySelector('.services-agreement-demo'),
        ),
        true,
      )
      assert.deepEqual(await snapshot(), before)
    }
  })
  await gate('invalid-restore-before-owner-mutation', async () => {
    const before = await snapshot()
    for (const kind of ['id', 'width']) {
      assert.equal(
        await page.evaluate((k) => {
          const saved = structuredClone(window.univerAPI.getActiveDocument().save())
          if (k === 'id') saved.id = 'replacement-id'
          else saved.documentStyle.pageSize.width = 0
          try {
            window.agreementCreate(document.getElementById('app'), false, undefined, saved)
            return false
          } catch {
            return true
          }
        }, kind),
        true,
      )
      assert.deepEqual(await snapshot(), before)
      assert.equal(await page.locator('.services-agreement-demo').count(), 1)
    }
  })
  await gate('empty-owner-footer-and-exact-recovery', async () => {
    const before = await snapshot()
    await page.evaluate(() => {
      window.agreementCheckpoint = structuredClone(window.univerAPI.getActiveDocument().save())
      const empty = structuredClone(window.agreementCheckpoint)
      empty.body = {
        dataStream: '\r\n',
        paragraphs: [{ startIndex: 0, paragraphId: 'agreement-empty' }],
        textRuns: [],
        sectionBreaks: [{ startIndex: 1 }],
      }
      window.agreementController.dispose()
      window.agreementController = window.agreementCreate(document.getElementById('app'), false, undefined, empty)
    })
    await page.locator('.services-agreement-demo[data-ready=true]').waitFor()
    await page.locator('[data-u-comp=workbench-skeleton-content]').waitFor({ state: 'detached' })
    assert.equal((await snapshot()).body.dataStream, '\r\n')
    assert.deepEqual((await snapshot()).footers, before.footers)
    await capture('empty-owner')
    await clearPaint()
    await page.evaluate(() => {
      window.agreementController.dispose()
      window.agreementController = window.agreementCreate(
        document.getElementById('app'),
        false,
        undefined,
        window.agreementCheckpoint,
      )
    })
    await ready()
    assert.deepEqual(await snapshot(), before)
    await capture('empty-owner-restored')
  })
  for (const locale of ['en-US', 'zh-CN'])
    await gate('initial-' + locale + '-full-core-locale-and-css', async () => {
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
      window.agreementController.dispose()
      window.agreementController.dispose()
    })
    assert.equal(await page.locator('.services-agreement-demo').count(), 0)
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
    assert.equal(await page.evaluate(() => typeof window.agreementController), 'undefined')
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
