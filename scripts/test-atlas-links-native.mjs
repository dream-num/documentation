/* eslint-disable no-await-in-loop -- Native popup, navigation and full model histories run sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/atlas-links-native')
const reuseBuild = process.env.SHOWCASE_REUSE_EXACT_BUILD === '1'
await fs.mkdir(output, { recursive: true })
const old = await fs.readFile(path.join(output, 'exports.json'), 'utf8').catch(() => null)
const project = old
  ? JSON.parse(old)[0].directory
  : await fs.mkdtemp(path.join(os.tmpdir(), 'univer-atlas-links-native-'))
const external = 'https://example.org/atlas/manual?edition=2#care'
const report = { passed: false, gates: {}, history: {}, errors: [], network: [], literals: [] }
let server, browser, page
async function gate(name, action) {
  try {
    report.gates[name] = { passed: true, result: await action() }
  } catch (error) {
    report.gates[name] = { passed: false, error: error.stack || String(error) }
    await page?.screenshot({ path: path.join(output, `${name}-failure.png`) }).catch(() => {})
  }
  console.log(name, report.gates[name].passed ? 'PASS' : 'FAIL')
}
function leaves(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') leaves(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
  }
}
try {
  const source = (await readShowcaseSources()).find((item) => item.slug === 'docs-modern/links-and-bookmarks')
  report.export = { slug: source.slug, directory: project }
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(project, name.slice(1))
    if (reuseBuild) {
      assert.equal(await fs.readFile(target, 'utf8'), content, name)
      continue
    }
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  const pkg = JSON.parse(source.files['/package.json'])
  report.dependencies = {}
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const installed = await fs.realpath(
      name === 'vite'
        ? 'C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
        : path.resolve('node_modules', name),
    )
    assert.equal(JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version, version)
    const target = path.join(project, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    if (!(await fs.lstat(target).catch(() => null))) await fs.symlink(installed, target, 'junction')
    report.dependencies[name] = { version, installed }
  }
  await fs.writeFile(path.join(output, 'exports.json'), JSON.stringify([report.export], null, 2))
  const vite = await import(pathToFileURL(path.join(project, 'node_modules/vite/dist/node/index.js')))
  if (!reuseBuild) await vite.build({ root: project, configFile: false, logLevel: 'warn' })
  const entry = source.files['/src/index.ts']
  await fs.writeFile(
    path.join(project, 'src/index.ts'),
    entry.replace('const demo = createDemo(container)', 'const demo = window.atlasController = createDemo(container)') +
      '\nimport { validateAddress } from "./create-demo"\nwindow.atlasCreate=createDemo\nwindow.atlasHttpUrl=validateAddress\nimport {CustomRangeType,IUniverInstanceService} from "@univerjs/core"\nimport {addCustomRangeBySelectionFactory,deleteCustomRangeFactory,DocSelectionManagerService} from "@univerjs/docs"\nimport {createData} from "./data"\nwindow.atlasSDK={CustomRangeType,IUniverInstanceService,addCustomRangeBySelectionFactory,deleteCustomRangeFactory,DocSelectionManagerService,createData}\n',
  )
  try {
    if (!reuseBuild)
      await vite.build({
        root: project,
        configFile: false,
        logLevel: 'warn',
        build: { outDir: path.join(output, 'dist'), emptyOutDir: false },
      })
  } finally {
    await fs.writeFile(path.join(project, 'src/index.ts'), entry)
  }
  server = await vite.preview({
    root: project,
    configFile: false,
    build: { outDir: path.join(output, 'dist') },
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
      report.network.push({ url: route.request().url(), intercepted: true })
      return route.fulfill({ contentType: 'text/html', body: '<title>Intercepted native external destination</title>' })
    }
    return route.continue()
  })
  await context.addInitScript(() => {
    window.atlasPaint = []
    window.atlasOpened = []
    const draw = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      window.atlasPaint.push(String(text))
      return draw.call(this, text, ...args)
    }
    const open = window.open
    window.open = function (...args) {
      window.atlasOpened.push(args)
      return open.apply(this, args)
    }
  })
  page = await context.newPage()
  page.setDefaultTimeout(10000)
  page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(message.text())
  })
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const ready = async () => {
    await page.locator('.links-demo[data-ready=true]').waitFor()
    await page.waitForFunction(
      () =>
        !document.querySelector('[data-u-comp="workbench-skeleton-content"]') &&
        window.atlasPaint.join('').includes('Atlas'),
    )
    await settle()
  }

  const read = () => page.evaluate(() => window.univerAPI.getActiveDocument().save())
  const capture = async (name) => {
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime))
          .map((a) => a.finished.catch(() => {})),
      ),
    )
    return page.screenshot({ path: path.join(output, name + '.png') })
  }
  const select = async (id) => {
    await page.evaluate((rangeId) => {
      const doc = window.univerAPI.getActiveDocument()
      const link = doc.save().body.customRanges.find((r) => r.rangeId === rangeId)
      window.atlasController.univer.__getInjector().get(window.atlasSDK.IUniverInstanceService).focusUnit(doc.getId())
      doc.setSelection(link.startIndex, link.endIndex + 1)
    }, id)
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowRight')
    await settle()
  }
  const selection = () =>
    page.evaluate(() =>
      window.atlasController.univer.__getInjector().get(window.atlasSDK.DocSelectionManagerService).getTextRanges(),
    )
  const popup = async (url) => {
    await page.getByText(url, { exact: true }).waitFor()
    return page.getByText(url, { exact: true }).locator('xpath=ancestor::div[contains(@class,"univer-max-w-80")]')
  }
  const history = async (command) => {
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator('button[data-u-command="univer.command.' + command + '"]:visible').click()
    await settle()
  }
  const restore = async (saved) => {
    await page.evaluate((snapshot) => {
      window.univerAPI.disposeUnit(snapshot.id)
      window.univerAPI.createDocument(snapshot)
    }, saved)
    await settle()
  }
  await page.goto('http://127.0.0.1:4412')
  await ready()
  const original = await read()
  await gate('original-authored-links-bookmark-blocks-native-paint', async () => {
    assert.equal(original.id, 'atlas-links-demo')
    assert.equal(original.body.customRanges.filter((r) => r.rangeType === 4).length, 0) // Record actual enum below; no guessed link enum.
    report.history.original = original
    const typed = await page.evaluate(() => ({
      links: window.atlasSDK.CustomRangeType.HYPERLINK,
      bookmark: window.atlasSDK.CustomRangeType.BOOKMARK,
    }))
    assert.equal(original.body.customRanges.filter((r) => r.rangeType === typed.links).length, 3)
    assert.equal(original.body.customRanges.filter((r) => r.rangeType === typed.bookmark).length, 1)
    assert.equal(original.body.blockRanges.length, 3)
    assert.equal(await page.locator('.links-navigation button').count(), 1)
    assert.equal(await page.locator('.links-demo fieldset,.links-demo pre,.links-demo select').count(), 0)
    await capture('baseline')
  })
  await gate('native-external-popup-real-new-window-query-fragment-noopener', async () => {
    await select('atlas-manual')
    await popup(external)
    const next = context.waitForEvent('page')
    await page.getByText(external, { exact: true }).click()
    const tab = await next
    await tab.waitForLoadState()
    assert.equal(tab.url(), external)
    assert.equal(await tab.evaluate(() => window.opener), null)
    await tab.close()
    assert.deepEqual(await read(), original)
  })
  await gate('native-link-popup-edit-label-and-address', async () => {
    await select('atlas-manual')
    const info = await popup(external)
    await info.locator('div.univer-ml-2').nth(1).click()
    const inputs = page.locator('input:visible').filter({ visible: true })
    report.history.inputCount = await inputs.count()
    await inputs.nth(0).fill('Repair-kit guide — edition 3')
    await inputs.nth(1).fill('https://example.org/atlas/repair?edition=3#inventory')
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await settle()
    assert.match((await read()).body.dataStream, /Repair-kit guide/)
    assert.equal(
      (await read()).body.customRanges.find((r) => r.rangeId === 'atlas-manual').properties.url,
      'https://example.org/atlas/repair?edition=3#inventory',
    )
    await capture('native-link-edit')
  })
  const edited = await read()
  await gate('strict-native-update-full-undo', async () => {
    await history('undo')
    report.history.update = { before: original, after: edited, undo: await read() }
    assert.deepEqual(await read(), original)
  })
  await gate('strict-native-update-full-redo', async () => {
    await history('redo')
    report.history.update.redo = await read()
    assert.deepEqual(await read(), edited)
  })
  await gate('native-popup-remove-preserves-text-and-other-reference', async () => {
    await select('atlas-manual')
    const info = await popup('https://example.org/atlas/repair?edition=3#inventory')
    await info.locator('div.univer-ml-2').nth(2).click()
    await settle()
    assert.equal(
      (await read()).body.customRanges.some((r) => r.rangeId === 'atlas-manual'),
      false,
    )
    assert.equal((await read()).body.dataStream, edited.body.dataStream)
    assert.deepEqual(
      (await read()).body.customRanges.find((r) => r.rangeId === 'atlas-comparison'),
      edited.body.customRanges.find((r) => r.rangeId === 'atlas-comparison'),
    )
  })
  const removed = await read()
  await gate('strict-native-remove-full-undo', async () => {
    await history('undo')
    report.history.remove = { before: edited, after: removed, undo: await read() }
    assert.deepEqual(await read(), edited)
  })
  await gate('strict-native-remove-full-redo', async () => {
    await history('redo')
    report.history.remove.redo = await read()
    assert.deepEqual(await read(), removed)
  })
  await gate('native-keyboard-link-insertion-allocates-real-range-id', async () => {
    await page.evaluate(() => {
      const doc = window.univerAPI.getActiveDocument()
      const range = doc
        .getParagraphs()
        .find((p) => p.getText().startsWith('Workshop reference: '))
        .getRange()
      doc.setSelection(range.startOffset + 'Workshop reference: '.length, range.endOffset)
    })
    await page.keyboard.press('Control+k')
    await page.locator('input:visible').last().fill(external)
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await settle()
    const added = (await read()).body.customRanges.find((r) => r.properties?.url === external)
    assert.ok(added)
    assert.notEqual(added.rangeId, 'atlas-manual')
  })
  const added = await read()
  await gate('strict-native-add-full-undo', async () => {
    await history('undo')
    report.history.add = { before: removed, after: added, undo: await read() }
    assert.deepEqual(await read(), removed)
  })
  await gate('strict-native-add-full-redo', async () => {
    await history('redo')
    report.history.add.redo = await read()
    assert.deepEqual(await read(), added)
  })
  await restore(original)
  await gate('host-selected-bookmark-navigates-live-range-and-paints', async () => {
    await select('atlas-summary')
    await page.getByRole('button', { name: 'Open selected link (host)', exact: true }).click()
    const bookmark = (await read()).body.customRanges.find((r) => r.rangeId === 'atlas-returns')
    const ranges = await selection()
    assert.equal(ranges[0].startOffset, bookmark.startIndex)
    assert.equal(ranges[0].endOffset, bookmark.endIndex + 1)
    assert.deepEqual(await read(), original)
    await capture('host-bookmark-navigation')
  })
  await gate('strict-native-bookmark-popup-routes-current-document', async () => {
    await select('atlas-summary')
    await popup('#bookmark=atlas-returns')
    const next = context.waitForEvent('page')
    await page.getByText('#bookmark=atlas-returns', { exact: true }).click()
    const tab = await next
    await tab.waitForLoadState()
    report.history.nativeBookmark = { opened: tab.url(), selection: await selection() }
    await tab.close()
    const bookmark = (await read()).body.customRanges.find((r) => r.rangeId === 'atlas-returns')
    assert.equal(report.history.nativeBookmark.selection[0].startOffset, bookmark.startIndex)
  })
  await restore(original)
  await gate('all-nine-readme-literals-run-with-live-model-and-bookmark-shifts', async () => {
    const snippets = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) =>
      stripTypeScriptTypes(m[1]).replace(/^import .*$/gm, ''),
    )
    assert.equal(snippets.length, 9)
    const code = snippets
      .map(
        (s, i) =>
          s +
          ';await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));steps.push({index:' +
          i +
          ',snapshot:structuredClone(univerAPI.getActiveDocument().save())});',
      )
      .join('\n')
    report.literals = await page.evaluate(
      (code) =>
        new Function(
          'demo',
          'CustomRangeType',
          'addCustomRangeBySelectionFactory',
          'deleteCustomRangeFactory',
          'return(async()=>{const steps=[];' + code + ';return steps})()',
        )(
          window.atlasController,
          window.atlasSDK.CustomRangeType,
          window.atlasSDK.addCustomRangeBySelectionFactory,
          window.atlasSDK.deleteCustomRangeFactory,
        ),
      code,
    )
    const handoff = (r) => r.body.customRanges.find((x) => x.rangeId === 'atlas-handoff')
    assert.ok(handoff(report.literals[4].snapshot))
    assert.ok(handoff(report.literals[6].snapshot).startIndex > handoff(report.literals[5].snapshot).startIndex)
    assert.equal(handoff(report.literals[7].snapshot), undefined)
    assert.deepEqual(report.literals[8].snapshot, report.literals[7].snapshot)
    await capture('literal-variants')
  })
  await restore(original)
  await gate('native-text-input-and-real-render', async () => {
    await select('atlas-manual')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.type(' revised', { delay: 35 })
    await settle()
    assert.match((await read()).body.dataStream, /revised/)
    await capture('native-text')
  })
  const typed = await read()
  await gate('strict-native-text-full-undo', async () => {
    await history('undo')
    report.history.text = { before: original, after: typed, undo: await read() }
    assert.deepEqual(await read(), original)
  })
  await gate('strict-native-text-full-redo', async () => {
    await history('redo')
    report.history.text.redo = await read()
    assert.deepEqual(await read(), typed)
  })
  await gate('same-owner-theme-preserves-complete-edited-snapshot', async () => {
    await page.evaluate(() => {
      window.atlasOwner = window.univerAPI
      window.univerAPI.toggleDarkMode(true)
    })
    await settle()
    assert.deepEqual(await read(), typed)
    await capture('dark')
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.ok(await page.evaluate(() => window.atlasOwner === window.univerAPI))
    assert.deepEqual(await read(), typed)
  })
  await gate('strict-same-id-owner-restore-and-fresh-native-input', async () => {
    const saved = await read()
    await page.evaluate((snapshot) => {
      window.atlasController.dispose()
      window.atlasPaint = []
      window.atlasController = window.atlasCreate(document.getElementById('app'), false, snapshot)
    }, saved)
    await ready()
    report.history.owner = { before: saved, after: await read() }
    assert.deepEqual(await read(), saved)
    await select('atlas-manual')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.type(' fresh')
    await settle()
    assert.match((await read()).body.dataStream, /fresh/)
  })
  await gate('invalid-address-missing-target-no-model-mutation', async () => {
    const before = await read()
    for (const value of [
      '',
      'javascript:alert(1)',
      'https://user:secret@example.org/',
      'data:text/html,hello',
      '#bookmark=atlas-missing',
      'https://example.org/\n',
    ])
      assert.ok(
        await page.evaluate((url) => {
          try {
            window.atlasController.navigate(url)
            return false
          } catch {
            return true
          }
        }, value),
      )
    assert.deepEqual(await read(), before)
  })
  await gate('invalid-snapshot-rejected-before-owner-mutation', async () => {
    const before = await read()
    for (const kind of ['id', 'body', 'paragraphs']) {
      const state = await page.evaluate((kind) => {
        const api = window.univerAPI,
          saved = structuredClone(api.getActiveDocument().save())
        if (kind === 'id') saved.id = 'other'
        if (kind === 'body') saved.body.dataStream = ''
        if (kind === 'paragraphs') saved.body.paragraphs = null
        let rejected = false
        try {
          window.atlasCreate(document.getElementById('app'), false, saved)
        } catch {
          rejected = true
        }
        return { rejected, same: api === window.univerAPI, roots: document.querySelectorAll('.links-demo').length }
      }, kind)
      assert.deepEqual(state, { rejected: true, same: true, roots: 1 })
    }
    assert.deepEqual(await read(), before)
  })
  await gate('empty-same-id-recovery-fresh-native-input', async () => {
    await page.evaluate(() => {
      const saved = window.atlasSDK.createData(true)
      window.univerAPI.disposeUnit(saved.id)
      window.univerAPI.createDocument(saved)
    })
    await settle()
    assert.equal((await read()).id, 'atlas-links-demo')
    assert.equal((await read()).body.dataStream, '\r\n')
    await page.evaluate(() => {
      const doc = window.univerAPI.getActiveDocument()
      window.atlasController.univer.__getInjector().get(window.atlasSDK.IUniverInstanceService).focusUnit(doc.getId())
      doc.setSelection(0, 0)
    })
    await page.keyboard.type('Empty recovered')
    await settle()
    assert.match((await read()).body.dataStream, /Empty recovered/)
  })
  for (const locale of ['en-US', 'zh-CN']) {
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue()
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/lang="[^"]*"/, 'lang="' + locale + '"') })
    })
    await page.reload()
    await ready()
    await gate('initial-' + locale + '-six-complete-packs-and-native-popup', async () => {
      const actual = await page.evaluate(() => window.univerAPI.getLocales())
      for (const preset of ['preset-docs-core', 'preset-docs-hyper-link'])
        leaves(actual, (await import('@univerjs/' + preset + '/locales/' + locale)).default)
      for (const block of ['callout', 'code', 'list', 'quote'])
        leaves(actual, (await import('@univerjs-pro/docs-' + block + '-ui/locale/' + locale)).default)
      await select('atlas-manual')
      await popup(external)
      await capture('initial-' + locale)
    })
    await page.unrouteAll({ behavior: 'wait' })
  }
  await gate('390px-native-fit-width-no-host-overflow', async () => {
    await page.setViewportSize({ width: 390, height: 844 })
    await settle()
    await page.waitForFunction(() => window.univerAPI.getActiveDocument().save().settings.zoomRatio < 1)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390)
    await capture('narrow')
    await page.setViewportSize({ width: 1440, height: 1000 })
    await settle()
  })
  await gate('active-double-disposal-no-stale-api-or-dom', async () => {
    await page.evaluate(() => {
      window.atlasController.dispose()
      window.atlasController.dispose()
    })
    assert.equal(await page.locator('.links-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
  })
  await gate('pending-startup-double-disposal-no-late-owner', async () => {
    const stage = await page.evaluate(() => {
      const pending = window.atlasCreate(document.getElementById('app'))
      const stage = pending.univerAPI.getCurrentLifecycleStage()
      pending.dispose()
      pending.dispose()
      return stage
    })
    assert.ok(stage < 3)
    await page.waitForTimeout(3500)
    assert.equal(await page.locator('.links-demo,canvas').count(), 0)
  })
  await new Promise((resolve) => server.httpServer.close(resolve))
  server = await vite.preview({
    root: project,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  await page.goto('http://127.0.0.1:4412')
  await ready()
  await gate('normal-export-exact-source-official-css-native-paint-pagehide', async () => {
    for (const [name, content] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(project, name.slice(1)), 'utf8'), content, name)
    assert.ok(await page.evaluate(() => !window.atlasController))
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await capture('normal-production-cover')
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    assert.equal(await page.locator('.links-demo,canvas').count(), 0)
    return { sourceFiles: Object.keys(source.files).length, startupOverlayAbsent: true }
  })
  await gate('no-runtime-errors-or-unintercepted-remote-requests', () => {
    assert.deepEqual(report.errors, [])
    assert.ok(report.network.every((r) => r.intercepted))
  })
} catch (error) {
  report.fatal = error.stack || String(error)
  await page?.screenshot({ path: path.join(output, 'fatal.png') }).catch(() => {})
} finally {
  await browser?.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
  report.passed = !report.fatal && Object.values(report.gates).every((r) => r.passed)
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        output,
        pass: Object.values(report.gates).filter((r) => r.passed).length,
        total: Object.keys(report.gates).length,
        fatal: report.fatal,
      },
      null,
      2,
    ),
  )
}
if (!report.passed) process.exitCode = 1
