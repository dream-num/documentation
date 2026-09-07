/* eslint-disable no-await-in-loop -- Native find/options/history checks are sequential. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pelican-find-native-deep')
await fs.mkdir(output, { recursive: true })
const [entry] = JSON.parse(
  await fs.readFile(process.env.SHOWCASE_EXPORT_MANIFEST || 'test-results/find-native-export/exports.json', 'utf8'),
)
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/sheets/find-replace'
const recipes = [
  ...(await fs.readFile('showcase/sheets/find-replace/code/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(recipes.length, 11)
const browser = await chromium.launch(),
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
await context.addInitScript(() => {
  window.pelicanGlyphs = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (v, ...args) {
    window.pelicanGlyphs.push(String(v))
    return fill.call(this, v, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(10000)
const report = { passed: false, url, gates: {}, errors: [], requests: [], literals: [], matches: [], history: {} }
let currentGate = 'startup'
page.on('pageerror', (e) => report.errors.push({ gate: currentGate, error: e.stack }))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push({ gate: currentGate, error: m.text() })
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) || r.url().includes('/universer-api/'))
    report.requests.push(r.url())
})
const root = page.locator('.find-replace-demo'),
  grid = page.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
const snapshot = () => page.evaluate(() => structuredClone(window.univerAPI.getWorkbook('pelican-seeds').save()))
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const capture = async (n) => page.screenshot({ path: path.join(output, n + '.png'), animations: 'disabled' })
const ready = async () => {
  await page.locator('.find-replace-demo[data-ready=true]').waitFor()
  await grid.waitFor()
  await settle()
}
const fresh = async () => {
  await page.goto(url)
  await ready()
  await page.waitForFunction(
    () =>
      window.univerAPI.getWorkbook('pelican-seeds').getSheetBySheetId('current').getRange('B9').getRawValue() ===
      'DRAFT',
  )
}
const run = async (n) => {
  report.literals.push(n)
  return page.evaluate('(async()=>{' + recipes[n - 1] + '})()')
}
const close = async () => {
  const d = page.getByRole('dialog')
  if (await d.count()) await d.getByRole('button', { name: 'Close', exact: true }).last().click()
  await settle()
}
const open = async (advanced = true) => {
  await grid.click({ position: { x: 240, y: 100 } })
  await page.keyboard.press('Control+f')
  await page.getByPlaceholder('Find', { exact: true }).waitFor()
  if (advanced) await page.getByText('Advanced Searching & Replace', { exact: true }).click()
}
const search = async (text) => {
  await page.getByPlaceholder('Find', { exact: true }).fill(text)
  await page.getByRole('button', { name: 'Find', exact: true }).click()
  await settle()
}
const total = async (n) => {
  await page.waitForFunction((count) => {
    const t = document.querySelector('[data-u-comp=pager]')?.textContent
    return new RegExp('/' + count + '$').test(t?.trim() || '')
  }, n)
}
const option = async (label) => page.getByRole('dialog').getByText(label, { exact: true }).click()
const value = async (address, sheet = 'current') =>
  page.evaluate(
    ({ a, s }) => window.univerAPI.getWorkbook('pelican-seeds').getSheetBySheetId(s).getRange(a).getRawValue(),
    { a: address, s: sheet },
  )
const untilValue = async (address, expected) =>
  page.waitForFunction(
    ({ a, v }) =>
      window.univerAPI.getWorkbook('pelican-seeds').getSheetBySheetId('current').getRange(a).getRawValue() === v,
    { a: address, v: expected },
  )
async function gate(name, fn) {
  const previous = currentGate
  currentGate = name
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await capture(name + '-failure').catch(() => {})
    await fs.writeFile(
      path.join(output, name + '-actual.json'),
      JSON.stringify(await snapshot().catch(() => null), null, 2),
    )
  } finally {
    currentGate = previous
  }
}
async function history(before, edited) {
  await grid.click({ position: { x: 60, y: 35 } })
  await page.keyboard.press('Control+z')
  await settle()
  let undoFailure, redoFailure
  try {
    assert.deepEqual(await snapshot(), before)
  } catch (e) {
    undoFailure = e
  }
  await page.keyboard.press('Control+y')
  await settle()
  try {
    assert.deepEqual(await snapshot(), edited)
  } catch (e) {
    redoFailure = e
  }
  report.history[currentGate] = {
    undoExact: !undoFailure,
    redoExact: !redoFailure,
    undoFailure: undoFailure?.stack,
    redoFailure: redoFailure?.stack,
  }
  if (undoFailure || redoFailure) throw undoFailure || redoFailure
}
function pack(a, e) {
  for (const [k, v] of Object.entries(e)) {
    if (v && typeof v === 'object') pack(a?.[k], v)
    else assert.deepEqual(a?.[k], v, k)
  }
}
const matchPixel = () =>
  grid.evaluate((c) => {
    const r = c.getBoundingClientRect()
    return [
      ...c
        .getContext('2d')
        .getImageData(Math.floor((380 * c.width) / r.width), Math.floor((135 * c.height) / r.height), 1, 1).data,
    ]
  })
async function replaceAll() {
  await page.getByRole('button', { name: 'Replace All', exact: true }).click()
  await page
    .getByRole('dialog', { name: 'Are you sure to replace all matches?' })
    .getByRole('button', { name: 'OK', exact: true })
    .click()
}
try {
  await gate('normal-source-two-css-original-native-canvas', async () => {
    const source = (await readShowcaseSources()).find((s) => s.slug === entry.slug)
    for (const [n, c] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(entry.directory, n.slice(1)), 'utf8'), c, n)
    report.export = { ...entry, sourceFiles: Object.keys(source.files).length }
    assert.equal([...source.files['/src/create-demo.ts'].matchAll(/^import '@[^']+\/lib\/index.css'/gm)].length, 2)
    await fresh()
    assert.equal(await root.locator(':scope > section, :scope > pre, :scope > fieldset').count(), 0)
    assert.equal(
      await root.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await page.waitForFunction(() => window.pelicanGlyphs.join('').includes('Beach pea'))
    assert.deepEqual((await snapshot()).sheetOrder, ['current', 'archive'])
    await capture('opening-settled')
  })
  await gate('native-CtrlF-pager-and-real-B4-highlight', async () => {
    await fresh()
    await grid.click({ position: { x: 240, y: 100 } })
    const p = await matchPixel()
    await page.keyboard.press('Control+f')
    await page.getByPlaceholder('Find', { exact: true }).fill('Beach pea')
    await page.keyboard.press('Enter')
    await total(1)
    await settle()
    assert.notDeepEqual(await matchPixel(), p)
    await capture('native-find')
    await close()
  })
  await gate('native-advanced-case-whole-replace-history', async () => {
    await fresh()
    const before = await snapshot()
    await open()
    await option('Case Sensitive')
    await option('Match the Whole Cell')
    assert.equal(await page.getByRole('checkbox', { name: 'Case Sensitive', exact: true }).isChecked(), true)
    assert.equal(await page.getByRole('checkbox', { name: 'Match the Whole Cell', exact: true }).isChecked(), true)
    await search('draft')
    await total(1)
    await page.getByPlaceholder('Input Replace String').fill('Reviewed')
    await capture('advanced-case-whole')
    await replaceAll()
    await untilValue('C3', 'Reviewed')
    await close()
    const edited = await snapshot()
    assert.deepEqual(edited.sheets.archive, before.sheets.archive)
    assert.equal(await value('C2'), 'Draft')
    assert.equal(await value('C4'), 'DRAFT')
    assert.equal(await value('E2'), 'draft label; draft insert')
    await page.waitForFunction(() => window.pelicanGlyphs.join('').includes('Reviewed'))
    report.gates['native-case-whole-replace-effect-and-archive-isolation'] = { passed: true }
    await history(before, edited)
  })
  await gate('native-live-match-options-invalidate-and-explicit-Find', async () => {
    await fresh()
    await open()
    await search('draft')
    await total(6)
    await option('Case Sensitive')
    await total(2)
    await option('Match the Whole Cell')
    await page.waitForFunction(() =>
      [...document.querySelectorAll('button')].some(
        (button) => button.textContent === 'Replace All' && button.disabled,
      ),
    )
    await page.getByRole('button', { name: 'Find', exact: true }).click()
    await total(1)
    await capture('live-options')
    await close()
  })
  await gate('native-workbook-scope-direction-and-sheet-tabs', async () => {
    await fresh()
    await open()
    await option('Current Sheet')
    await page.getByRole('menuitemradio', { name: 'Workbook', exact: true }).click()
    await option('Search by Row')
    await page.getByRole('menuitemradio', { name: 'Search by Column', exact: true }).click()
    await search('draft')
    await total(8)
    await capture('workbook-scope')
    await close()
    await page.getByRole('tab', { name: 'Last season', exact: true }).click()
    assert.equal(
      await page.evaluate(() => window.univerAPI.getWorkbook('pelican-seeds').getActiveSheet().getSheetId()),
      'archive',
    )
    await open(false)
    await page.getByPlaceholder('Find', { exact: true }).fill('Wild carrot')
    await page.keyboard.press('Enter')
    await total(1)
    await close()
  })
  await gate('native-zero-Unicode-literals-no-match-and-empty-query', async () => {
    await fresh()
    const before = await snapshot()
    await open()
    for (const text of ['0', '海岸', 'A.B', 'A*B']) {
      await search(text)
      await total(text === '0' ? 4 : 1)
    }
    await search('not-in-pelican')
    await page.waitForFunction(() => document.querySelector('[data-u-comp=pager]')?.textContent?.includes('No Result'))
    assert.equal(await page.getByRole('button', { name: 'Replace All', exact: true }).isDisabled(), true)
    await page.getByPlaceholder('Find', { exact: true }).fill('')
    assert.equal(await page.getByRole('button', { name: 'Find', exact: true }).isDisabled(), true)
    await capture('native-empty-query')
    await close()
    assert.deepEqual(await snapshot(), before)
  })
  await gate('native-current-empty-replacement-full-history', async () => {
    await fresh()
    const before = await snapshot()
    await open()
    await search('海岸')
    await total(1)
    await page.getByPlaceholder('Input Replace String').fill('')
    await page.getByRole('button', { name: 'Replace', exact: true }).click()
    await untilValue('E8', ' nursery')
    await close()
    report.gates['native-empty-replacement-effect'] = { passed: true }
    await history(before, await snapshot())
  })
  await gate('literal-eight-original-recipes-complete-history', async () => {
    await fresh()
    const before = await snapshot()
    for (const n of [1, 2, 3]) {
      await run(n)
      report.matches.push(await page.evaluate(() => window.pelicanFinder.findAll().map((r) => r.getA1Notation())))
    }
    assert.ok(report.matches[0].includes('C2'))
    assert.deepEqual(report.matches[2], ['C3'])
    for (const n of [4, 5, 6]) await run(n)
    await untilValue('C3', 'Reviewed')
    const edited = await snapshot()
    assert.deepEqual(edited.sheets.archive, before.sheets.archive)
    await gate('literal-case-replace-full-history', () => history(before, edited))
    await fresh()
    const formulaBefore = await snapshot()
    await run(7)
    await untilValue('B9', 'draft')
    assert.equal(
      await page.evaluate(() =>
        window.univerAPI.getWorkbook('pelican-seeds').getActiveSheet().getRange('B9').getFormula(),
      ),
      '=LOWER(C2)',
    )
    await gate('literal-formula-full-history', async () => history(formulaBefore, await snapshot()))
    await run(8)
    assert.equal(
      await page.evaluate(() => window.univerAPI.getWorkbook('pelican-seeds').getActiveSheet().getSheetId()),
      'archive',
    )
  })
  await gate('native-formula-mode-real-formula-replacement-history', async () => {
    await fresh()
    const before = await snapshot()
    await open()
    await option('Find by Value')
    await page.getByRole('menuitemradio', { name: 'Find Formula', exact: true }).click()
    await search('UPPER')
    await total(1)
    await page.getByPlaceholder('Input Replace String').fill('LOWER')
    await replaceAll()
    await close()
    await untilValue('B9', 'draft')
    assert.equal(
      await page.evaluate(() =>
        window.univerAPI.getWorkbook('pelican-seeds').getSheetBySheetId('current').getRange('B9').getFormula(),
      ),
      '=LOWER(C2)',
    )
    await capture('native-formula-replaced')
    report.gates['native-formula-replacement-effect'] = { passed: true }
    await history(before, await snapshot())
  })
  await gate('literal-current-replace-return-and-history', async () => {
    await fresh()
    const before = await snapshot()
    await run(9)
    await untilValue('E8', ' nursery')
    await history(before, await snapshot())
  })
  await gate('native-rectangular-selection-scope', async () => {
    await fresh()
    const b = await grid.boundingBox()
    await page.mouse.move(b.x + 240, b.y + 65)
    await page.mouse.down()
    await page.mouse.move(b.x + 450, b.y + 125, { steps: 6 })
    await page.mouse.up()
    assert.equal(
      await page.evaluate(() =>
        window.univerAPI.getWorkbook('pelican-seeds').getActiveSheet().getActiveRange().getA1Notation(),
      ),
      'B2:C4',
    )
    await page.keyboard.press('Control+f')
    await page.getByText('Advanced Searching & Replace', { exact: true }).click()
    await search('draft')
    await total(3)
    await capture('selected-range-scope')
    await close()
  })
  await gate('finder-empty-whitespace-invalid-and-no-match', async () => {
    await fresh()
    const before = await snapshot()
    const results = await page.evaluate(async () => {
      const observations = []
      for (const text of ['', '   ', 'not-in-pelican', '0', '海岸', 'A.B', 'A*B']) {
        const f = await window.univerAPI.createTextFinderAsync(text)
        observations.push({ text, matches: f.findAll().map((r) => r.getA1Notation()) })
        f.dispose()
        f.dispose()
      }
      return observations
    })
    report.boundaries = results
    assert.deepEqual(results[0].matches, [])
    assert.deepEqual(results[2].matches, [])
    assert.deepEqual(
      results.slice(3, 7).map((r) => r.matches),
      [['A2', 'A3', 'D3', 'A7'], ['E8'], ['E6'], ['E7']],
    )
    assert.deepEqual(await snapshot(), before)
    report.gates['finder-empty-zero-Unicode-literal-no-match'] = { passed: true }
    assert.deepEqual(
      results[1].matches,
      [],
      'Whitespace-only input must not broaden into all non-empty cells for safe replacement',
    )
  })
  await gate('same-id-full-edited-owner-recovery-and-fresh-native-find', async () => {
    await fresh()
    await run(9)
    const before = await snapshot()
    await run(10)
    await ready()
    let difference
    try {
      assert.deepEqual(await snapshot(), before)
    } catch (e) {
      difference = e
    }
    await open(false)
    await page.getByPlaceholder('Find', { exact: true }).fill('Beach pea')
    await page.keyboard.press('Enter')
    await total(1)
    await close()
    report.gates['same-id-owner-native-find-effect'] = { passed: true }
    await page.evaluate(() =>
      window.univerAPI.getWorkbook('pelican-seeds').getSheetBySheetId('current').getRange('C3').setValue('Changed'),
    )
    await run(11)
    await ready()
    await untilValue('C3', 'draft')
    try {
      assert.deepEqual(await snapshot(), before)
    } catch (e) {
      difference ??= e
    }
    await capture('same-id-restored')
    if (difference) throw difference
  })
  await gate('same-owner-themes-complete-packs-initial-Chinese', async () => {
    await fresh()
    await run(9)
    const before = await snapshot()
    await page.evaluate(() => (window.pelicanOwner = window.univerAPI))
    for (const [lang, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const pkg of ['preset-sheets-core', 'preset-sheets-find-replace'])
        pack(
          await page.evaluate(() => window.univerAPI.getLocales()),
          (await import('@univerjs/' + pkg + '/locales/' + lang)).default,
        )
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
        assert.equal(await page.evaluate(() => window.pelicanOwner === window.univerAPI), true)
        assert.deepEqual(await snapshot(), before)
      }
    }
    await page.addInitScript(() => {
      const o = new MutationObserver(() => {
        if (document.documentElement) {
          document.documentElement.lang = 'zh-CN'
          o.disconnect()
        }
      })
      o.observe(document, { childList: true, subtree: true })
    })
    await fresh()
    for (const pkg of ['preset-sheets-core', 'preset-sheets-find-replace'])
      pack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs/' + pkg + '/locales/zh-CN')).default,
      )
    await capture('initial-zh')
  })
  await gate('invalid-pending-owner-and-active-finder-disposal', async () => {
    await fresh()
    const before = await snapshot()
    assert.equal(
      await page.evaluate(() => {
        try {
          window.pelicanDemo.createDemo(window.pelicanDemo.container, false, {
            id: 'bad',
            sheets: {},
            sheetOrder: ['missing'],
          })
          return false
        } catch {
          return true
        }
      }),
      true,
    )
    assert.deepEqual(await snapshot(), before)
    await page.evaluate(async () => {
      const f = await window.univerAPI.createTextFinderAsync('draft')
      await f.ensureCompleteAsync()
      f.dispose()
      f.dispose()
      const d = window.pelicanDemo
      d.dispose()
      d.dispose()
      const pending = d.createDemo(d.container, false, window.pelicanSaved || undefined)
      pending.dispose()
      pending.dispose()
      d.createDemo(d.container)
    })
    await ready()
    await grid.click({ position: { x: 240, y: 100 } })
    await page.keyboard.press('Control+f')
    await page.getByRole('dialog').waitFor()
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    assert.equal(await root.count(), 0)
    assert.equal(await page.getByRole('dialog').count(), 0)
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  await gate('pending-finder-before-owner-disposal', async () => {
    await fresh()
    const result = await page.evaluate(async () => {
      const d = window.pelicanDemo,
        p = d.univerAPI.createTextFinderAsync('draft')
      const observed = p.then(
        (f) => {
          f.dispose()
          return 'resolved'
        },
        (e) => 'rejected: ' + e.message,
      )
      d.dispose()
      d.dispose()
      return Promise.race([observed, new Promise((r) => setTimeout(() => r('pending beyond 3000ms'), 3000))])
    })
    report.pendingFinder = result
    assert.notEqual(result, 'pending beyond 3000ms')
  })
  await gate('all-literals-zero-unexpected-errors', async () => {
    assert.equal(new Set(report.literals).size, 11)
    assert.deepEqual(report.errors, [])
    assert.deepEqual(report.requests, [])
  })
  await gate('invalid-nonstring-Facade-query-isolated', async () => {
    const invalidPage = await browser.newPage()
    const faults = []
    invalidPage.on('pageerror', (error) => faults.push(error.message))
    try {
      await invalidPage.goto(url)
      await invalidPage.locator('.find-replace-demo[data-ready=true]').waitFor()
      const observations = await invalidPage.evaluate(async () => {
        const results = []
        for (const input of [null, 0, {}]) {
          const operation = window.univerAPI.createTextFinderAsync(input).then(
            (f) => {
              f.dispose()
              return { accepted: true }
            },
            (error) => ({ error: error.message }),
          )
          results.push({
            input,
            ...(await Promise.race([
              operation,
              new Promise((resolve) => setTimeout(() => resolve({ pending: true }), 3000)),
            ])),
          })
        }
        return results
      })
      await invalidPage.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      )
      report.invalidInputs = { observations, faults }
      assert.ok(
        observations.every((result) => result.error),
        'Out-of-contract non-string Facade queries must reject; accepted null/zero are recorded, not counted as safe validation',
      )
      assert.deepEqual(faults, [])
    } finally {
      await invalidPage.close()
    }
  })
  report.passed = Object.values(report.gates).every((g) => g.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(
  JSON.stringify(
    {
      passed: Object.values(report.gates).filter((g) => g.passed).length,
      total: Object.keys(report.gates).length,
      failures: Object.entries(report.gates)
        .filter(([, g]) => !g.passed)
        .map(([n, g]) => [n, g.failure.slice(0, 450)]),
    },
    null,
    2,
  ),
)
if (!report.passed) process.exitCode = 1
