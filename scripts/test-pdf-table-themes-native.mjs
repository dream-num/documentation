/* eslint-disable no-await-in-loop -- Verify native operations in order and retain independent failures. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const manifestPath = process.argv[2]
const entry = JSON.parse(await fs.readFile(manifestPath, 'utf8')).find(
  ({ slug }) => slug === 'pdfs/table-themes-and-cell-styles',
)
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content, name)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 4)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-table-themes-native')
await fs.mkdir(output, { recursive: true })
const runtime = entry.links.find(({ name }) => name === 'vite')
const { preview } = await import(pathToFileURL(path.join(runtime.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4453, strictPort: true },
})
const browser = await chromium.launch()
const report = { manifestPath, passed: false, sourceFiles: Object.keys(source.files).length, hosts: [] }
const ids = ['plain', 'rows', 'header', 'columns', 'exception']
function compareLeaves(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') compareLeaves(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
  }
}
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, gates: {}, errors: [], networkWrites: [] }
    report.hosts.push(result)
    const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, locale: lang })
    page.setDefaultTimeout(12000)
    page.on('pageerror', (error) => result.errors.push(error.stack || String(error)))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.networkWrites.push(request.url())
    })
    await page.addInitScript(() => {
      window.painted = []
      const fill = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        window.painted.push(String(text))
        return fill.call(this, text, ...args)
      }
    })
    await page.route('http://127.0.0.1:4453/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    const canvas = () => page.locator('[data-pdf-active-page-id] > canvas').first()
    const settle = () =>
      page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const snapshot = () => page.evaluate(() => window.univerAPI.getActivePdf().save())
    const tables = () =>
      page.evaluate(() =>
        window.univerAPI
          .getActivePdf()
          .getPages()
          .map((p) => {
            const table = p.getTables()[0]
            return {
              id: table.getId(),
              theme: table.getTheme(),
              rows: Array.from({ length: table.getRowCount() }, (_, row) =>
                Array.from({ length: table.getColumnCount() }, (_cell, col) => table.getCell(row, col).getText()),
              ),
            }
          }),
      )
    const pixels = () => canvas().evaluate((node) => node.toDataURL())
    const shot = async (name) => {
      await settle()
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
    }
    async function gate(name, action) {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
        await shot(name + '-failure').catch(() => {})
        await fs.writeFile(path.join(output, `${lang}-${name}-failure.html`), await page.locator('body').innerHTML())
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function show(index) {
      const input = page.locator('[data-pdf-footer] input').first()
      await input.fill(String(index + 1))
      await input.press('Enter')
      await page.locator(`[data-pdf-active-page-id="${ids[index]}"] > canvas`).first().waitFor()
      await settle()
    }
    async function point(x, y) {
      const box = await canvas().boundingBox()
      return { x: box.x + (x * box.width) / 680, y: box.y + (y * box.height) / 460 }
    }
    try {
      await page.goto('http://127.0.0.1:4453/')
      await page.locator('.pdf-table-gallery[data-ready="true"]').waitFor({ timeout: 60000 })
      await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
      await gate('English-full-packs-and-CSS', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        assert.equal(await page.locator('html').getAttribute('lang'), lang)
        const locales = await page.evaluate(() => window.univerAPI.getLocales())
        for (const name of [
          '@univerjs/design',
          '@univerjs/ui',
          '@univerjs/docs-ui',
          '@univerjs/drawing-ui',
          '@univerjs-pro/pdfs-ui',
        ])
          compareLeaves(locales, (await import(name + '/locale/en-US')).default)
        assert.equal(
          await page
            .locator('[data-u-comp="workbench-layout"]')
            .evaluate((node) => getComputedStyle(node).backgroundColor),
          'rgb(255, 255, 255)',
        )
      })
      await gate('five-native-painted-variants', async () => {
        result.initialTables = await tables()
        assert.equal(result.initialTables.length, 5)
        assert.equal(new Set(result.initialTables.map((t) => JSON.stringify(t.rows))).size, 5)
        for (let index = 0; index < 5; index++) {
          await show(index)
          await page.waitForFunction((text) => window.painted.includes(text), result.initialTables[index].rows[1][0])
          await shot(ids[index])
        }
      })
      await show(0)
      await gate('native-table-cell-typing', async () => {
        const before = await tables()
        const p = await point(140, 181)
        await page.mouse.dblclick(p.x, p.y)
        await page.waitForFunction(() => document.activeElement?.matches('[data-pdf-text-input]'))
        await page.keyboard.press('Control+A')
        await page.keyboard.insertText('Botany revised')
        await page.getByRole('tab', { name: 'View', exact: true }).click()
        await page.waitForFunction(
          () =>
            window.univerAPI.getActivePdf().getPageByIndex(0).getTables()[0].getCell(1, 0).getText() ===
            'Botany revised',
        )
        await page.waitForFunction(() => window.painted.includes('Botany revised'))
        before[0].rows[1][0] = 'Botany revised'
        assert.deepEqual(await tables(), before)
        await shot('native-cell-typed')
      })
      await gate('native-theme-and-row-band-toggle', async () => {
        await page.keyboard.press('Escape')
        await page.getByRole('tab', { name: 'Start', exact: true }).click()
        await page.locator('[data-u-command="pdf.menu.tool.mode"]').click()
        await page.getByText('Selection mode', { exact: true }).last().click()
        const p = await point(45, 115)
        await page.mouse.click(p.x, p.y)
        await page.getByRole('tab', { name: 'View', exact: true }).click()
        await page.getByRole('button', { name: 'Properties', exact: true }).click()
        await page.getByRole('button', { name: 'Best match 5', exact: true }).waitFor()
        const before = await tables(),
          paint = await pixels()
        await page.getByRole('button', { name: 'Best match 5', exact: true }).click()
        await page.waitForFunction(
          () =>
            window.univerAPI.getActivePdf().getPageByIndex(0).getTables()[0].getTheme().styleId ===
            'univerGreenHeaderBandedRows',
        )
        await settle()
        assert.notEqual(await pixels(), paint)
        const themed = await tables()
        assert.deepEqual(themed.slice(1), before.slice(1))
        assert.deepEqual(themed[0].rows, before[0].rows)
        await shot('native-theme')
        const bandBefore = themed[0].theme.options.bandRow
        const bandPaint = await pixels()
        await page.getByText('Banded rows', { exact: true }).click()
        await page.waitForFunction(
          (value) =>
            window.univerAPI.getActivePdf().getPageByIndex(0).getTables()[0].getTheme().options.bandRow === !value,
          bandBefore,
        )
        await settle()
        assert.notEqual(await pixels(), bandPaint, 'Native band toggle changes page pixels')
        const afterBands = await tables()
        themed[0].theme.options.bandRow = !bandBefore
        assert.deepEqual(afterBands, themed, 'Only the selected table band option changes')
        await shot('native-bands-toggled')
      })
      await gate('same-owner-exact-snapshot-themes', async () => {
        const before = await snapshot()
        await page.evaluate(() => {
          window.tableOwner = window.univerAPI.getActivePdf().getModel()
        })
        for (const dark of [true, false]) {
          await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
          await settle()
          assert.equal(
            await page.evaluate(() => window.tableOwner === window.univerAPI.getActivePdf().getModel()),
            true,
          )
          assert.deepEqual(await snapshot(), before)
          await shot(dark ? 'dark' : 'light-restored')
        }
      })
      for (const [index, recipe] of recipes.entries())
        await gate('literal-recipe-' + (index + 1), async () => {
          await page.evaluate(async (code) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            await new AsyncFunction('univerAPI', code)(window.univerAPI)
          }, recipe)
          if (index === 1) assert.equal((await tables())[0].theme.styleId, 'univerGreenHeaderBandedRows')
          if (index === 2) assert.equal((await tables())[1].theme.options.bandRow, false)
          if (index === 3) {
            assert.equal((await tables())[4].rows[2][1], 'Ready')
            const style = await page.evaluate(() => {
              const pdf = window.univerAPI.getActivePdf()
              const table = pdf.getPageByIndex(4).getTables()[0]
              const data = table.getData()
              const cell = data.cells.find(
                (candidate) => candidate.rowId === data.rows[2].id && candidate.columnId === data.columns[1].id,
              )
              return {
                container: table.getCell(2, 1).getStyle(),
                story: pdf.getModel().getEditState().overlayTextStories[cell.contentStoryId],
              }
            })
            result.recipeCellStyle = style
            assert.equal(style.container.fill.color, '#D8ECDD')
            // getStyle returns container styling. Font and paragraph settings live in the owned text story.
            assert.ok(style.story.blocks.length > 0)
            assert.ok(Object.keys(style.story.runs).length > 0)
            for (const block of style.story.blocks) assert.equal(block.align, 'center')
            for (const run of Object.values(style.story.runs)) assert.equal(run.fill, '#245C39')
          }
          await show(index === 3 ? 4 : index === 2 ? 1 : 0)
          await shot('recipe-' + (index + 1))
        })
      await gate('no-runtime-errors-or-network-writes', async () => {
        assert.deepEqual(result.errors, [])
        assert.deepEqual(result.networkWrites, [])
      })
    } catch (error) {
      result.fatal = error.stack || String(error)
      await shot('fatal').catch(() => {})
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((item) => item.passed)
  }
  report.passed = report.hosts.every((host) => host.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
assert.ok(report.passed, `Strict failures retained in ${output}/report.json`)
