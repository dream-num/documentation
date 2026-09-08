/* eslint-disable no-await-in-loop -- Preserve separate native acceptance failures for each host. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find(({ slug }) => slug === 'bases/linked-record-picker')
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 5)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-linked-record-picker')
await fs.mkdir(output, { recursive: true })
const vite = entry.links.find(({ name }) => name === 'vite')
const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4454, strictPort: true },
})
const browser = await chromium.launch()
const report = { passed: false, sourceFiles: Object.keys(source.files).length, hosts: [] }
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, gates: {}, errors: [] }
    report.hosts.push(result)
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
    page.setDefaultTimeout(10000)
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.route('http://127.0.0.1:4454/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    await page.addInitScript(() => {
      window.linkPaint = []
      const original = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (...args) {
        const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
        const rect = this.canvas.getBoundingClientRect()
        if (rect.width && rect.height)
          window.linkPaint.push({
            text: String(args[0]),
            x: rect.x + (point.x * rect.width) / this.canvas.width,
            y: rect.y + (point.y * rect.height) / this.canvas.height,
          })
        if (window.linkPaint.length > 30000) window.linkPaint.splice(0, 15000)
        return Reflect.apply(original, this, args)
      }
    })
    const save = () => page.evaluate(() => window.univerAPI.getBase('equipment-record-links').save())
    const ids = (record, field) =>
      page.evaluate(
        ([r, f]) =>
          window.univerAPI
            .getBase('equipment-record-links')
            .getTableById('requests')
            .getRecordById(r)
            .getLinkedRecordIds(f),
        [record, field],
      )
    const shot = async (name) => {
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
      await fs.writeFile(path.join(output, `${lang}-${name}.txt`), await page.locator('body').innerText())
    }
    async function gate(name, action) {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
        await shot(`failure-${name}`)
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function repaint(label) {
      await page.evaluate(() => {
        window.linkPaint = []
      })
      await page.setViewportSize({ width: page.viewportSize().width === 1600 ? 1598 : 1600, height: 1000 })
      await page.waitForFunction((text) => window.linkPaint.some((point) => point.text === text), label)
    }
    async function editCell(row, column) {
      const point = await page.evaluate(
        ([label, field]) => {
          const r = window.linkPaint.findLast((p) => p.text === label)
          const c = window.linkPaint.findLast((p) => p.text === field)
          return { x: c.x + (field === 'Additional equipment' ? 270 : 200), y: r.y - 5 }
        },
        [row, column],
      )
      await page.mouse.click(point.x, point.y)
      await page.keyboard.press('F2')
      await page.getByPlaceholder('Search records').waitFor()
    }
    try {
      await page.goto('http://127.0.0.1:4454/')
      await page.locator('.base-linked-record-picker[data-ready="true"]').waitFor()
      await repaint('Dawn bird survey')
      await gate('English-and-original-records', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        const data = await save()
        assert.equal(Object.keys(data.tables.requests.records).length, 6)
        assert.equal(Object.keys(data.tables.equipment.records).length, 5)
        assert.deepEqual(await ids('dawn', 'primary'), ['recorder-north'])
        await shot('initial')
      })
      await gate('native-single-picker-context-and-replacement', async () => {
        await editCell('Dawn bird survey', 'Primary equipment')
        await shot('single-picker')
        assert.match(await page.locator('body').innerText(), /Model: R-12 stereo · Storage: North cupboard/)
        await page.getByText('Model: R-24 directional · Storage: South cupboard', { exact: true }).click()
        await page.keyboard.press('Escape')
        await page.waitForFunction(
          () =>
            window.univerAPI
              .getBase('equipment-record-links')
              .getTableById('requests')
              .getRecordById('dawn')
              .getLinkedRecordIds('primary')[0] === 'recorder-south',
        )
        await repaint('Dawn bird survey')
        await shot('single-selected')
      })
      await gate('native-multiple-picker-and-removal', async () => {
        await editCell('Dawn bird survey', 'Additional equipment')
        await shot('multiple-picker')
        await page.getByText('Hand lens', { exact: true }).last().click()
        await page.getByText('Light meter', { exact: true }).last().click()
        await page.keyboard.press('Escape')
        assert.deepEqual(await ids('dawn', 'extras'), ['tripod', 'lens', 'meter'])
        await repaint('Dawn bird survey')
        await editCell('Dawn bird survey', 'Additional equipment')
        await page.getByText('Travel tripod', { exact: true }).last().click()
        await page.keyboard.press('Escape')
        assert.deepEqual(await ids('dawn', 'extras'), ['lens', 'meter'])
        await repaint('Dawn bird survey')
        await shot('multiple-selected')
      })
      await gate('native-target-rename-keeps-ids', async () => {
        const before = await ids('dawn', 'primary')
        await page.getByText('Equipment', { exact: true }).first().click()
        await repaint('R-24 directional')
        const point = await page.evaluate(() => {
          const r = window.linkPaint.findLast((p) => p.text === 'R-24 directional')
          const c = window.linkPaint.findLast((p) => p.text === 'Equipment')
          return { x: c.x + 80, y: r.y - 5 }
        })
        await page.mouse.dblclick(point.x, point.y)
        await page.keyboard.press('Control+a')
        await page.keyboard.type('Night recorder')
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          () =>
            window.univerAPI
              .getBase('equipment-record-links')
              .getTableById('equipment')
              .getRecordById('recorder-south')
              .getValue('name') === 'Night recorder',
        )
        await page.getByText('Requests', { exact: true }).first().click()
        await repaint('Night recorder')
        assert.deepEqual(await ids('dawn', 'primary'), before)
        await shot('target-renamed')
      })
      await gate('native-empty-link-select-and-Delete', async () => {
        await page.getByText('Requests', { exact: true }).first().click()
        await repaint('Volunteer training')
        await editCell('Volunteer training', 'Primary equipment')
        await page.getByText('Hand lens', { exact: true }).last().click()
        await page.keyboard.press('Escape')
        assert.deepEqual(await ids('training', 'primary'), ['lens'])
        await repaint('Volunteer training')
        const point = await page.evaluate(() => {
          const row = window.linkPaint.findLast((p) => p.text === 'Volunteer training')
          const column = window.linkPaint.findLast((p) => p.text === 'Primary equipment')
          return { x: column.x + 180, y: row.y - 5 }
        })
        await page.mouse.click(point.x, point.y - 42)
        await page.mouse.click(point.x, point.y)
        await fs.writeFile(
          path.join(output, `${lang}-before-clear.json`),
          JSON.stringify(
            await page.evaluate(() => ({
              selection: window.univerAPI.getBaseUI().getSelection(),
              activeElement: document.activeElement?.outerHTML,
            })),
            null,
            2,
          ),
        )
        await page.keyboard.press('Delete')
        await page.waitForFunction(
          () =>
            window.univerAPI
              .getBase('equipment-record-links')
              .getTableById('requests')
              .getRecordById('training')
              .getLinkedRecordIds('primary').length === 0,
        )
        assert.deepEqual(await ids('training', 'primary'), [])
        await shot('cleared')
      })
      await gate('native-context-menu-clear', async () => {
        await page.keyboard.press('Escape')
        await repaint('Volunteer training')
        const point = await page.evaluate(() => {
          const row = window.linkPaint.findLast((p) => p.text === 'Volunteer training')
          const column = window.linkPaint.findLast((p) => p.text === 'Primary equipment')
          return { x: column.x + 180, y: row.y - 5 }
        })
        await page.mouse.click(point.x, point.y, { button: 'right' })
        await shot('clear-menu')
        await page.getByText('Clear content', { exact: true }).click()
        await page.waitForFunction(
          () =>
            window.univerAPI
              .getBase('equipment-record-links')
              .getTableById('requests')
              .getRecordById('training')
              .getLinkedRecordIds('primary').length === 0,
        )
        await repaint('Volunteer training')
        await shot('context-cleared')
      })
      await gate('same-owner-themes-and-complete-save', async () => {
        const before = await save()
        await page.evaluate(() => {
          window.linkOwner = window.univerAPI.getBase('equipment-record-links').getBase()
          window.univerAPI.toggleDarkMode(true)
        })
        await repaint('Volunteer training')
        await shot('dark')
        await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
        await repaint('Volunteer training')
        assert.equal(
          await page.evaluate(() => window.linkOwner === window.univerAPI.getBase('equipment-record-links').getBase()),
          true,
        )
        assert.deepEqual(await save(), before)
        await page.evaluate((snapshot) => {
          window.univerAPI.disposeUnit(snapshot.id)
          window.univerAPI.createBase(snapshot)
        }, before)
        assert.deepEqual(await save(), before)
      })
      for (const [index, recipe] of recipes.entries())
        await gate(`literal-${index + 1}`, async () => {
          await page.evaluate(async (code) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            await new AsyncFunction(code)()
          }, recipe)
          if (index === 0) assert.deepEqual(await ids('dawn', 'primary'), ['recorder-south'])
          if (index === 1) assert.deepEqual(await ids('pond', 'extras'), ['tripod', 'meter'])
          if (index === 2) assert.deepEqual(await ids('pond', 'extras'), ['meter'])
          if (index === 3) assert.deepEqual(await ids('training', 'primary'), [])
          if (index === 4)
            assert.equal((await save()).tables.equipment.records['recorder-north'].values.name, 'Dawn recorder')
        })
      await gate('no-runtime-errors', async () => assert.deepEqual(result.errors, []))
    } catch (error) {
      result.fatal = error.stack || String(error)
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((value) => value.passed)
  }
  report.passed = report.hosts.every((host) => host.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.ok(report.passed, `Inspect strict failures in ${output}/report.json`)
