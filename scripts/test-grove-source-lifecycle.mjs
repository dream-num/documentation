/* eslint-disable no-await-in-loop -- Probe one source lifecycle in two English-UI hosts. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'
const manifestPath = process.argv[2]
const entry = JSON.parse(await fs.readFile(manifestPath, 'utf8')).find((item) => item.slug === 'embed/mixed-to-boards')
assert.ok(entry?.passed)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/grove-source-lifecycle')
await fs.mkdir(output, { recursive: true })
const vite = entry.links.find((item) => item.name === 'vite')
const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4452, strictPort: true },
})
const browser = await chromium.launch()
const report = { manifestPath, hosts: [] }
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1780, height: 1200 }, locale: lang })
    const result = { lang, passed: false, gates: {}, errors: [] }
    report.hosts.push(result)
    page.on('pageerror', (error) => result.errors.push(String(error)))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.route('http://127.0.0.1:4452/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    const state = () =>
      page.evaluate(() => {
        const api = window.univerAPI
        const board = api.getBoard('grove-exhibition-readiness')
        return {
          board: board.save(),
          sheet: api.getWorkbook('grove-budget-plan').save(),
          base: api.getBase('grove-readiness-register')?.save(),
          results: Object.fromEntries(
            ['budget', 'cost', 'balance', 'ready-count'].map((id) => [id, board.getShape(id).getFormulaResult()]),
          ),
        }
      })
    async function capture(name) {
      await fs.writeFile(path.join(output, `${lang}-${name}.json`), JSON.stringify(await state(), null, 2))
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
    }
    try {
      await page.goto('http://127.0.0.1:4452/')
      await page.locator('.grove-embed[data-ready=true]').waitFor({ timeout: 120000 })
      await page.waitForTimeout(400)
      await capture('initial')
      const initial = await state()
      assert.equal(initial.results.cost.value, 14600)
      assert.equal(initial.results.budget.value, 18000)
      await page.evaluate(() =>
        window.univerAPI
          .getBase('grove-readiness-register')
          .getTableById('gates')
          .getRecordById('gate-1')
          .setValue('cost', 4400),
      )
      await page.waitForTimeout(600)
      await capture('edited')
      const edited = await state()
      assert.equal(edited.results.cost.value, 15800)
      assert.equal(edited.results.balance.value, 2200)
      assert.deepEqual(edited.sheet, initial.sheet)
      result.gates.sourcePropagation = true
      await page.evaluate(() => {
        window.groveLifecycleOwner = window.univerAPI
        window.univerAPI.toggleDarkMode(true)
      })
      await page.waitForTimeout(200)
      assert.deepEqual(await state(), edited)
      await capture('dark')
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await page.waitForTimeout(200)
      assert.deepEqual(await state(), edited)
      assert.equal(await page.evaluate(() => window.groveLifecycleOwner === window.univerAPI), true)
      result.gates.exactModelsThroughThemes = true
      result.removeReturned = await page.evaluate(() => {
        window.groveSourceSaved = window.univerAPI.getBase('grove-readiness-register').save()
        return window.univerAPI.removeEmbed({ hostUnitId: 'grove-exhibition-readiness', embedId: 'grove-base-float' })
      })
      assert.equal(result.removeReturned, true)
      await page.waitForTimeout(400)
      result.remainingEmbeds = await page.evaluate(() =>
        window.univerAPI.listEmbeds({ hostUnitId: 'grove-exhibition-readiness' }).map((embed) => embed.getId()),
      )
      await capture('detached')
      assert.deepEqual(result.remainingEmbeds, ['grove-sheet-float'])
      result.gates.onlyBaseFloatDetached = true
      result.disposeReturned = await page.evaluate(() => window.univerAPI.disposeUnit('grove-readiness-register'))
      await page.waitForTimeout(1000)
      await capture('unloaded')
      const unloaded = await state()
      assert.deepEqual(unloaded.sheet, initial.sheet)
      result.sourceAfterDispose = {
        present: Boolean(unloaded.base),
        cost: unloaded.results.cost,
        budget: unloaded.results.budget,
        firstCost: unloaded.base?.tables.gates.records['gate-1'].values.cost,
      }
      result.gates.sourceStayedUnloaded = !unloaded.base
      await page.evaluate(() => window.univerAPI.createBase(structuredClone(window.groveSourceSaved)))
      await page.evaluate(async () => {
        const api = window.univerAPI
        const embed = api.createEmbed({
          embedId: 'grove-base-float-restored',
          host: {
            unitId: 'grove-exhibition-readiness',
            surface: api.Enum.FEmbedHostSurface.BoardFloating,
            context: { subUnitId: 'readiness', left: 820, top: 620, width: 820, height: 380 },
          },
          content: {
            unitType: api.Enum.UniverInstanceType.UNIVER_BASE,
            ref: '#unit=grove-readiness-register&type=base',
          },
          displayTarget: { tableId: 'gates', viewId: 'gates-grid' },
        })
        await embed.loadAsync()
      })
      await page.waitForTimeout(1000)
      await capture('restored')
      await page.evaluate(() =>
        window.univerAPI
          .getBase('grove-readiness-register')
          .getTableById('gates')
          .getRecordById('gate-1')
          .setValue('cost', 4000),
      )
      await page.waitForTimeout(600)
      await capture('fresh-edit')
      result.passed = true
    } catch (error) {
      result.failure = error.stack || String(error)
    } finally {
      try {
        await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
        await page.waitForFunction(() => !window.univerAPI, null, { timeout: 15000 })
        assert.deepEqual(result.errors, [])
        result.gates.teardown = true
      } catch (error) {
        result.gates.teardown = false
        result.teardownFailure = String(error)
      }
      await page.close()
    }
  }
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
}
console.log(JSON.stringify(report, null, 2))
assert.ok(
  report.hosts.every((result) => result.passed),
  'Source unload/restore remains unaccepted; inspect retained failures',
)
