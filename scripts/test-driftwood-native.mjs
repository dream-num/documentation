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

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/driftwood-native')
const reuseBuild = process.env.SHOWCASE_REUSE_EXACT_BUILD === '1'
await fs.mkdir(output, { recursive: true })
const old = await fs.readFile(path.join(output, 'exports.json'), 'utf8').catch(() => null)
const project = old
  ? JSON.parse(old)[0].directory
  : await fs.mkdtemp(path.join(os.tmpdir(), 'univer-driftwood-native-'))
const external = 'https://univer.ai/?source=showcase&topic=links#features'
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
  const source = (await readShowcaseSources()).find((item) => item.slug === 'sheets/hyper-link')
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
    entry.replace('const demo = createDemo(container)', 'const demo = window.driftController = createDemo(container)') +
      '\nimport { httpUrl } from "./create-demo"\nwindow.driftCreate=createDemo\nwindow.driftHttpUrl=httpUrl\n',
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
    window.driftPaint = []
    window.driftOpened = []
    const draw = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      window.driftPaint.push(String(text))
      return draw.call(this, text, ...args)
    }
    const open = window.open
    window.open = function (...args) {
      window.driftOpened.push(args)
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
    await page.locator('.hyperlink-demo[data-ready=true]').waitFor()
    await page.waitForFunction(
      () =>
        !document.querySelector('[data-u-comp="workbench-skeleton-content"]') &&
        window.driftPaint.join('').includes('Cedar pier'),
    )
    await settle()
  }
  const grid = page.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const read = () => page.evaluate(() => window.univerAPI.getWorkbook('driftwood-links').save())
  const links = (a1) =>
    page.evaluate(
      (address) =>
        window.univerAPI.getWorkbook('driftwood-links').getSheetBySheetId('index').getRange(address).getHyperLinks(),
      a1,
    )
  const capture = async (name) => {
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime))
          .map((animation) => animation.finished.catch(() => {})),
      ),
    )
    return page.screenshot({ path: path.join(output, `${name}.png`) })
  }
  const index = async () => {
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().setActiveSheet('index'))
    await settle()
  }
  const hover = async (row, x = 260) => {
    await index()
    await grid.hover({ position: { x, y: 38 + (row - 0.5) * 34 } })
    await page.locator('[data-u-comp=cell-link-popup-edit]').first().waitFor()
    await settle()
  }
  const history = async (command) => {
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator(`button[data-u-command="univer.command.${command}"]:visible`).click()
    await settle()
  }
  const reload = async (snapshot) => {
    await page.evaluate((saved) => {
      window.univerAPI.disposeUnit(saved.id)
      window.univerAPI.createWorkbook(saved)
    }, snapshot)
    await settle()
    await index()
  }
  const nativeInsert = async (label, url) => {
    await index()
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B7').activate())
    await grid.click({ position: { x: 260, y: 249 } })
    await page.keyboard.press('Control+k')
    await page.getByPlaceholder('Enter label', { exact: true }).fill(label)
    await page.getByPlaceholder('Enter link', { exact: true }).fill(url)
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await settle()
  }
  await page.goto('http://127.0.0.1:4412')
  await ready()
  const original = await read()
  await gate('original-link-types-two-sheets-and-native-text-paint', async () => {
    assert.deepEqual(original.sheetOrder, ['index', 'workshop'])
    assert.equal(original.sheets.index.cellData[5][1].p.body.customRanges.length, 2)
    assert.equal(original.sheets.index.cellData[6][1].v, null)
    assert.equal(original.sheets.index.cellData[7][1].v, 'Not yet linked')
    assert.equal((await links('B2'))[0].url, external)
    assert.equal(await page.locator('.hyperlink-demo pre,.hyperlink-demo select,.hyperlink-demo form').count(), 0)
    await capture('baseline')
  })
  await gate('strict-facade-enumerates-all-rich-text-spans', async () => {
    report.history.enumeration = {
      spans: original.sheets.index.cellData[5][1].p.body.customRanges,
      facade: await links('B6'),
    }
    assert.equal(report.history.enumeration.facade.length, 2)
  })
  await gate('native-external-popup-real-window-query-fragment-and-noopener', async () => {
    await hover(2)
    const dest = page.getByText(external, { exact: true })
    await dest.waitFor()
    const opened = context.waitForEvent('page')
    await dest.click()
    const tab = await opened
    await tab.waitForLoadState()
    assert.equal(tab.url(), external)
    assert.equal(await tab.evaluate(() => window.opener), null)
    await tab.close()
    assert.deepEqual((await page.evaluate(() => window.driftOpened)).at(-1), [
      external,
      '_blank',
      'noopener,noreferrer',
    ])
    assert.deepEqual(await read(), original)
  })
  for (const [row, target] of [
    [3, null],
    [4, 'B3:D4'],
    [5, 'B6:D6'],
  ])
    await gate(`native-row${row}-internal-popup-navigates-and-paints`, async () => {
      await hover(row)
      await capture(`popup-B${row}`)
      const popup = page.locator('[data-u-comp=cell-link-popup-edit]').first().locator('..').locator('..')
      await popup.locator('span.univer-truncate').first().click()
      await page.waitForFunction(
        () => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === 'workshop',
      )
      if (target)
        await page.waitForFunction(
          (expected) =>
            window.univerAPI
              .getActiveWorkbook()
              .getActiveSheet()
              .getSelection()
              ?.getActiveRangeList()
              .some((range) => range.getA1Notation() === expected),
          target,
        )
      if (target)
        assert.equal(
          await page.evaluate(() =>
            window.univerAPI
              .getActiveWorkbook()
              .getActiveSheet()
              .getSelection()
              .getActiveRangeList()[0]
              .getA1Notation(),
          ),
          target,
        )
      assert.deepEqual(await read(), original)
      await capture(`destination-B${row}`)
    })
  await index()
  await gate('native-empty-target-link-insert-and-painted-unicode-label', async () => {
    await nativeInsert('Night repair 窗口', external)
    assert.equal((await links('B7'))[0].label, 'Night repair 窗口')
    await page.waitForFunction(() => window.driftPaint.join('').includes('Night repair 窗口'))
    await capture('native-insert')
  })
  const inserted = await read()
  await history('undo')
  report.history.insert = { before: original, after: inserted, undo: await read() }
  await gate('strict-native-insert-full-snapshot-undo', () => assert.deepEqual(report.history.insert.undo, original))
  await history('redo')
  report.history.insert.redo = await read()
  await gate('strict-native-insert-full-snapshot-redo', () => assert.deepEqual(report.history.insert.redo, inserted))
  await gate('native-popup-edit-label-url', async () => {
    await hover(7)
    await page.locator('[data-u-comp=cell-link-popup-edit]').click()
    await page.getByPlaceholder('Enter label', { exact: true }).fill('Reserve check')
    await page.getByPlaceholder('Enter link', { exact: true }).fill('https://univer.ai/?updated=1#reserve')
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await settle()
    assert.equal((await links('B7'))[0].label, 'Reserve check')
    assert.equal((await links('B7'))[0].url, 'https://univer.ai/?updated=1#reserve')
  })
  const updated = await read()
  await history('undo')
  report.history.update = { before: inserted, after: updated, undo: await read() }
  await gate('strict-native-update-full-undo', () => assert.deepEqual(report.history.update.undo, inserted))
  await history('redo')
  report.history.update.redo = await read()
  await gate('strict-native-update-full-redo', () => assert.deepEqual(report.history.update.redo, updated))
  await gate('native-popup-remove-retains-rich-text', async () => {
    await hover(7)
    await page.locator('[data-u-comp=cell-link-popup-remove]').click()
    await settle()
    assert.equal((await links('B7')).length, 0)
    assert.match((await read()).sheets.index.cellData[6][1].p.body.dataStream, /Reserve check/)
  })
  const removed = await read()
  await history('undo')
  report.history.remove = { before: updated, after: removed, undo: await read() }
  await gate('strict-native-remove-full-undo', () => assert.deepEqual(report.history.remove.undo, updated))
  await history('redo')
  report.history.remove.redo = await read()
  await gate('strict-native-remove-full-redo', () => assert.deepEqual(report.history.remove.redo, removed))
  await reload(original)
  await gate('native-both-richtext-spans-have-distinct-popups', async () => {
    await hover(6, 232)
    const popup = page.locator('[data-u-comp=cell-link-popup-edit]').first().locator('..').locator('..')
    const first = await popup.innerText()
    await grid.hover({ position: { x: 286, y: 225 } })
    await page.getByText(external, { exact: true }).waitFor()
    assert.ok(!first.includes(external))
    assert.deepEqual(await read(), original)
    await capture('two-span-popup')
  })
  await gate('native-plain-text-target-insert-and-remove-preserves-label', async () => {
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B8').activate())
    await grid.click({ position: { x: 260, y: 283 } })
    await page.keyboard.press('Control+k')
    await page.getByPlaceholder('Enter link', { exact: true }).waitFor()
    assert.equal(await page.getByPlaceholder('Enter label', { exact: true }).count(), 0)
    await page.getByPlaceholder('Enter link', { exact: true }).fill(external)
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await settle()
    assert.equal((await links('B8'))[0].label, 'Not yet linked')
    await hover(8)
    await page.locator('[data-u-comp=cell-link-popup-remove]').click()
    await settle()
    assert.equal((await links('B8')).length, 0)
    assert.match((await read()).sheets.index.cellData[7][1].p.body.dataStream, /Not yet linked/)
  })
  await reload(original)
  const snippets = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) =>
    stripTypeScriptTypes(m[1]),
  )
  await gate('four-readme-literals-intermediate-model-and-real-navigation', async () => {
    const body = snippets
      .map(
        (snippet, i) =>
          `${snippet};await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));steps.push({index:${i + 1},snapshot:structuredClone(book.save()),active:book.getActiveSheet().getSheetId(),selection:book.getActiveSheet().getSelection()?.getActiveRange()?.getA1Notation()});`,
      )
      .join('\n')
    report.literals = await page.evaluate(
      (code) => new Function(`return(async()=>{const steps=[];${code};return steps})()`)(),
      body,
    )
    assert.equal(report.literals.length, 4)
    assert.equal(report.literals[2].active, 'workshop')
    assert.equal(report.literals[2].selection, 'B6:D6')
    assert.match(report.literals[3].snapshot.sheets.index.cellData[6][1].p.body.dataStream, /Reserved lamps/)
    assert.equal((await links('B7')).length, 0)
  })
  await reload(original)
  await gate('first-span-removal-preserves-other-span-and-native-text', async () => {
    await page.evaluate(() => {
      const target = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B6')
      target.cancelHyperLink(target.getHyperLinks()[0])
    })
    assert.equal((await links('B6'))[0].label, 'Routing')
    assert.equal((await read()).sheets.index.cellData[5][1].p.body.customRanges.length, 1)
    assert.match((await read()).sheets.index.cellData[5][1].p.body.dataStream, /Permits \| Routing/)
  })
  await reload(original)
  await gate('multicell-update-only-top-left-and-range-remove-text-preserving', async () => {
    await page.evaluate(() =>
      window.univerAPI
        .getActiveWorkbook()
        .getActiveSheet()
        .getRange('B2:B4')
        .updateHyperLink('https://univer.ai/#new', 'New external label'),
    )
    const changed = await read()
    assert.deepEqual(changed.sheets.index.cellData[2], original.sheets.index.cellData[2])
    assert.deepEqual(changed.sheets.index.cellData[3], original.sheets.index.cellData[3])
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2:B4').cancelHyperLink())
    assert.equal((await links('B2:B4')).length, 0)
    assert.deepEqual((await read()).sheets.workshop, original.sheets.workshop)
  })
  await reload(original)
  await gate('missing-defined-name-and-URL-policy-no-model-write', async () => {
    const before = await read()
    const missing = await page.evaluate(() => {
      try {
        window.univerAPI.getActiveWorkbook().getUrlOfDefineName('MissingHarborRange')
        return ''
      } catch (error) {
        return error.message
      }
    })
    assert.match(missing, /MissingHarborRange/)
    for (const value of [
      'javascript:alert(1)',
      'not a URL',
      'https://name:secret@example.com/',
      'data:text/html,hello',
      '/relative',
    ])
      assert.ok(
        await page.evaluate((url) => {
          try {
            window.driftHttpUrl(url)
            return false
          } catch {
            return true
          }
        }, value),
      )
    assert.equal(await page.evaluate((url) => window.driftHttpUrl(url), external), external)
    assert.deepEqual(await read(), before)
  })
  await gate('native-disallowed-external-navigation-is-blocked-by-host', async () => {
    await page.evaluate(() =>
      window.univerAPI
        .getActiveWorkbook()
        .getActiveSheet()
        .getRange('B7')
        .setHyperLink('https://name:secret@example.com/', 'Credential link'),
    )
    await hover(7)
    const count = await page.evaluate(() => window.driftOpened.length)
    await page.getByText('https://name:secret@example.com/', { exact: true }).click()
    await page.locator('.hyperlink-demo > [role=alert]').waitFor()
    assert.match(await page.locator('.hyperlink-demo > [role=alert]').textContent(), /Navigation blocked/)
    assert.equal(await page.evaluate(() => window.driftOpened.length), count)
  })
  await reload(original)
  await gate('same-owner-theme-keeps-full-model-and-native-links', async () => {
    await page.evaluate(() => {
      window.driftOwner = window.univerAPI
      window.univerAPI.toggleDarkMode(true)
    })
    await settle()
    assert.deepEqual(await read(), original)
    await capture('dark')
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.ok(await page.evaluate(() => window.driftOwner === window.univerAPI))
    assert.deepEqual(await read(), original)
  })
  const saved = await read()
  await reload(saved)
  report.history.unitRestore = { before: saved, after: await read() }
  await gate('strict-same-id-unit-full-restore', () => assert.deepEqual(report.history.unitRestore.after, saved))
  await gate('same-id-restored-native-edit-rebinds-current-richtext', async () => {
    await nativeInsert('Restored link', external)
    assert.equal((await links('B7'))[0].label, 'Restored link')
  })
  const ownerSaved = await read()
  await page.evaluate((snapshot) => {
    window.driftController.dispose()
    window.driftPaint = []
    window.driftController = window.driftCreate(document.getElementById('app'), false, snapshot)
  }, ownerSaved)
  await ready()
  report.history.ownerRestore = { before: ownerSaved, after: await read() }
  await gate('strict-new-owner-same-id-full-restore', () =>
    assert.deepEqual(report.history.ownerRestore.after, ownerSaved),
  )
  await gate('new-owner-native-popup-fresh-update', async () => {
    await hover(7)
    await page.locator('[data-u-comp=cell-link-popup-edit]').click()
    await page.getByPlaceholder('Enter label', { exact: true }).fill('Owner edit')
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await settle()
    assert.equal((await links('B7'))[0].label, 'Owner edit')
  })
  const ownerEdit = await read()
  await history('undo')
  report.history.ownerEdit = { before: ownerSaved, after: ownerEdit, undo: await read() }
  await gate('strict-restored-owner-fresh-edit-undo', () => assert.deepEqual(report.history.ownerEdit.undo, ownerSaved))
  await history('redo')
  report.history.ownerEdit.redo = await read()
  await gate('strict-restored-owner-fresh-edit-redo', () => assert.deepEqual(report.history.ownerEdit.redo, ownerEdit))
  await gate('invalid-snapshot-rejected-before-owner-mutation', async () => {
    const before = await read()
    for (const kind of ['id', 'sheet', 'dimensions', 'cells']) {
      const result = await page.evaluate((invalid) => {
        const api = window.univerAPI,
          snapshot = structuredClone(api.getActiveWorkbook().save())
        if (invalid === 'id') snapshot.id = 'other'
        if (invalid === 'sheet') snapshot.sheetOrder = ['index']
        if (invalid === 'dimensions') snapshot.sheets.index.rowCount = 0
        if (invalid === 'cells') snapshot.sheets.index.cellData = []
        let message = ''
        try {
          window.driftCreate(document.getElementById('app'), false, snapshot)
        } catch (error) {
          message = error.message
        }
        return { message, same: api === window.univerAPI, roots: document.querySelectorAll('.hyperlink-demo').length }
      }, kind)
      assert.match(result.message, /both original sheet IDs/)
      assert.ok(result.same)
      assert.equal(result.roots, 1)
    }
    assert.deepEqual(await read(), before)
  })
  await gate('empty-target-restoration-and-native-insert', async () => {
    const empty = await read()
    empty.sheets.index.cellData[6][1] = {}
    empty.sheets.index.cellData[7][1] = {}
    await reload(empty)
    assert.deepEqual(await read(), empty)
    await nativeInsert('Empty recovered', external)
    assert.equal((await links('B7'))[0].label, 'Empty recovered')
  })
  for (const locale of ['en-US', 'zh-CN']) {
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue()
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/lang="[^"]*"/, `lang="${locale}"`) })
    })
    await page.reload()
    await ready()
    await gate(`initial-${locale}-complete-two-preset-packs-and-native-popup`, async () => {
      const actual = await page.evaluate(() => window.univerAPI.getLocales())
      for (const preset of ['preset-sheets-core', 'preset-sheets-hyper-link'])
        leaves(actual, (await import(`@univerjs/${preset}/locales/${locale}`)).default)
      await hover(2)
      await page.getByText(external, { exact: true }).waitFor()
      await page.locator('[data-u-comp=cell-link-popup-edit]').click()
      const labelPlaceholder = actual['sheets-hyper-link-ui'].form.labelPlaceholder
      await page.getByPlaceholder(labelPlaceholder, { exact: true }).waitFor()
      await capture(`initial-${locale}`)
    })
    await page.unrouteAll({ behavior: 'wait' })
  }
  await gate('compact-viewport-native-grid-and-link-popup', async () => {
    await page.setViewportSize({ width: 760, height: 720 })
    await page.reload()
    await ready()
    await hover(2)
    await page.getByText(external, { exact: true }).waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 760)
    await capture('compact')
    await page.setViewportSize({ width: 1440, height: 1000 })
  })
  await gate('active-double-disposal-removes-native-dom-api', async () => {
    await page.evaluate(() => {
      window.driftController.dispose()
      window.driftController.dispose()
    })
    assert.equal(await page.locator('.hyperlink-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
  })
  await gate('pending-startup-double-disposal-no-late-workbench', async () => {
    const state = await page.evaluate(() => {
      const pending = window.driftCreate(document.getElementById('app'))
      const stage = pending.univerAPI.getCurrentLifecycleStage(),
        steady = pending.univerAPI.Enum.LifecycleStages.Steady
      pending.dispose()
      pending.dispose()
      return { stage, steady }
    })
    assert.ok(state.stage < state.steady)
    await page.waitForTimeout(3500)
    assert.equal(await page.locator('.hyperlink-demo,canvas').count(), 0)
    return state
  })
  await gate('pending-link-write-disposal-settles-without-late-owner', async () => {
    await page.evaluate(() => {
      window.driftPaint = []
      window.driftController = window.driftCreate(document.getElementById('app'))
    })
    await ready()
    const result = await page.evaluate(async (url) => {
      const api = window.univerAPI
      const pending = api
        .getActiveWorkbook()
        .getSheetBySheetId('index')
        .getRange('B7')
        .setHyperLink(url, 'Pending link')
      window.driftController.dispose()
      try {
        return { resolved: await pending }
      } catch (error) {
        return { rejected: error.message }
      }
    }, external)
    report.history.pendingWrite = result
    await page.waitForTimeout(500)
    assert.deepEqual(report.errors, [])
    assert.equal(await page.locator('.hyperlink-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
    return result
  })
  await gate('internal-navigation-immediate-disposal-no-late-callback', async () => {
    await page.evaluate(() => {
      window.driftPaint = []
      window.driftController = window.driftCreate(document.getElementById('app'))
    })
    await ready()
    await page.evaluate(() => {
      window.univerAPI.getActiveWorkbook().navigateToSheetHyperlink('#gid=workshop&range=B3:D4')
      window.driftController.dispose()
    })
    await page.waitForTimeout(500)
    assert.deepEqual(report.errors, [])
    assert.equal(await page.locator('.hyperlink-demo,canvas').count(), 0)
    assert.ok(await page.evaluate(() => !window.univerAPI))
  })
  await new Promise((resolve) => server.httpServer.close(resolve))
  server = await vite.preview({
    root: project,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4412, strictPort: true },
  })
  await page.goto('http://127.0.0.1:4412')
  await ready()
  await gate('normal-export-source-two-official-CSS-painted-native-popup-pagehide', async () => {
    for (const [name, content] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(project, name.slice(1)), 'utf8'), content, name)
    assert.ok(await page.evaluate(() => !window.driftController))
    assert.equal(
      await page.locator('[data-u-comp=workbench-layout]').evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await hover(2)
    await page.getByText(external, { exact: true }).waitFor()
    await capture('normal-production-cover')
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    assert.equal(await page.locator('.hyperlink-demo,canvas').count(), 0)
    return { sourceFiles: Object.keys(source.files).length, startupOverlayAbsent: true }
  })
  await gate('no-runtime-errors-and-external-requests-all-intercepted', () => {
    assert.deepEqual(report.errors, [])
    assert.ok(report.network.every((request) => request.intercepted))
  })
} catch (error) {
  report.fatal = error.stack || String(error)
  await page?.screenshot({ path: path.join(output, 'fatal.png') }).catch(() => {})
} finally {
  await browser?.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
  report.passed = !report.fatal && Object.values(report.gates).every((result) => result.passed)
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        output,
        passed: report.passed,
        gates: Object.fromEntries(Object.entries(report.gates).map(([name, result]) => [name, result.passed])),
        fatal: report.fatal,
      },
      null,
      2,
    ),
  )
}
if (!report.passed) process.exitCode = 1
