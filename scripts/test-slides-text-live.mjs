/* eslint-disable no-await-in-loop -- UI actions must complete before their readback and history checks. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const { createServer } = await import(
  process.env.SHOWCASE_VITE_MODULE ? pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href : 'vite'
)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-text-live')
await fs.mkdir(directory, { recursive: true })
const codeRoot = 'showcase/slides/text-editing-and-autofit/code'
const imports = (
  await Promise.all(
    ['create-demo.ts', 'actions.ts', 'data.ts'].map((file) => fs.readFile(`${codeRoot}/${file}`, 'utf8')),
  )
).join('\n')
const dependencies = [
  ...new Set(
    [...imports.matchAll(/^\s*import\s+(?:type\s+)?(?:[\w*$,{}\s]+\s+from\s*)?['"]([^'"]+)['"]/gm)]
      .map((match) => match[1])
      .filter((name) => name.startsWith('@') && !name.endsWith('.css')),
  ),
]
const origin = process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4186/'
const server = process.env.SHOWCASE_ORIGIN
  ? null
  : await createServer({
      configFile: false,
      root: process.cwd(),
      cacheDir: path.resolve('test-results/slides-text-live/.vite'),
      appType: 'custom',
      server: { host: '127.0.0.1', port: 4186, strictPort: true },
      optimizeDeps: { noDiscovery: true, include: dependencies },
      plugins: [
        {
          name: 'saffron-selected-only',
          configureServer(vite) {
            vite.middlewares.use((request, response, next) => {
              if (request.url !== '/') return next()
              response.setHeader('Content-Type', 'text/html')
              response.end(
                `<html><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">import {createDemo} from '/${codeRoot}/create-demo.ts'; window.demo=createDemo(document.getElementById('app'));</script></body></html>`,
              )
            })
          },
        },
      ],
    })
await server?.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
const report = { passed: false, origin, checks: [], errors: [] }
if (process.env.SHOWCASE_EXPORT_MANIFEST) {
  const manifest = JSON.parse(await fs.readFile(process.env.SHOWCASE_EXPORT_MANIFEST, 'utf8'))
  const source = (await readShowcaseSources()).find((item) => item.slug === 'slides/text-editing-and-autofit')
  for (const [name, content] of Object.entries(source.files)) {
    assert.equal(await fs.readFile(path.join(manifest.directory, name.slice(1)), 'utf8'), content, name)
  }
  report.exportFiles = Object.keys(source.files).length
}
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('requestfailed', (request) => report.errors.push(`${request.url()}: ${request.failure()?.errorText}`))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
await page.addInitScript(() => {
  window.textPaint = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    if (window.textPaint.length < 20000) window.textPaint.push(String(args[0]))
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.slide-text-demo')
// Compare the serialized snapshot contract: Undo may add optional undefined keys.
const read = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActivePresentation().save())))
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
try {
  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 180000 })
  await root.locator(':scope[data-ready=true]').waitFor({ timeout: 120000 })
  await settle()
  assert.equal(await root.locator(':scope > fieldset, :scope > details, [data-action]').count(), 0)
  assert.equal(await root.getByText('Start', { exact: true }).isVisible(), true)
  const initial = await read()
  assert.equal(initial.slideOrder.length, 3)
  const css = await root.evaluate((editor) => {
    const workbench = editor.querySelector('[data-u-comp="workbench-layout"], [data-u-comp="app-layout"]')
    return {
      white: workbench && getComputedStyle(workbench).getPropertyValue('--univer-gray-0').trim(),
      flex:
        workbench?.querySelector('.univer-flex') && getComputedStyle(workbench.querySelector('.univer-flex')).display,
    }
  })
  assert.equal(css.white, '#FFFFFF')
  assert.equal(css.flex, 'flex')
  report.checks.push('Zero host controls; native Grid and official white/flex CSS')
  await root.locator('[data-page-id="invitation"][data-u-comp="slide-thumbnail-item"]').click()
  for (const id of initial.slideOrder) {
    await page.evaluate(() => {
      window.textPaint = []
    })
    await root.locator('[data-page-id="' + id + '"][data-u-comp="slide-thumbnail-item"]').click()
    const slide = initial.slides[id]
    await page.waitForFunction(
      (title) => window.textPaint.join('').replace(/\s/g, '').includes(title.replace(/\s/g, '')),
      slide.name,
    )
    await settle()
    const painted = await page.evaluate(() => window.textPaint.join('').replace(/\s/g, ''))
    const doc = slide.elements['editable-copy'].shapeData.shapeText.dataModel.doc
    for (const line of doc.body.dataStream.split(/[\r\n]/).filter((text) => text.trim())) {
      assert.ok(painted.includes(line.replace(/\s/g, '')), 'Actual rich-text paragraph paints on ' + id + ': ' + line)
    }
    const color = slide.elements['editable-copy'].shapeData.fill.color.toLowerCase()
    const pixels = await root.locator('canvas').evaluateAll((canvases, expected) => {
      const canvas = canvases.toSorted((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0]
      const rgba = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
      let count = 0
      for (let i = 0; i < rgba.length; i += 16) {
        const hex = '#' + Array.from(rgba.slice(i, i + 3), (value) => value.toString(16).padStart(2, '0')).join('')
        if (hex === expected) count++
      }
      return { count, height: canvas.clientHeight }
    }, color)
    assert.ok(pixels.count > 1000, 'Authored palette visible on ' + id)
    assert.ok(pixels.height > 400)
    await root.screenshot({ path: path.join(directory, id + '.png') })
  }
  report.checks.push('Three distinct pages paint native rich text and coral/mint/lilac fills')
  const beforeEdit = await read()
  await page.evaluate(() => {
    window.textPaint = []
    window.univerAPI
      .getActivePresentation()
      .getActiveSlide()
      .getShape('editable-copy')
      .getText()
      .setText('Saffron / One original proof')
  })
  await page.waitForFunction(() => window.textPaint.join('').includes('One original proof'))
  const edited = await read()
  assert.notDeepEqual(edited.slides.invitation, beforeEdit.slides.invitation)
  assert.deepEqual(edited.slides.welcome, beforeEdit.slides.welcome)
  await root.locator('[data-u-command="univer.command.undo"]').click()
  await settle()
  assert.deepEqual((await read()).slides, beforeEdit.slides)
  await root.locator('[data-u-command="univer.command.redo"]').click()
  await settle()
  assert.deepEqual((await read()).slides, edited.slides)
  report.checks.push(
    'Real Facade text write paints; native Undo/Redo restore all slide data (not full keyboard-edit acceptance)',
  )
  await root.locator('[data-u-command="slide.operation.print-open"]').click()
  await page.getByText('Print range', { exact: true }).waitFor({ timeout: 60000 })
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  report.checks.push('Native Print settings open/cancel; no print job submitted')
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.waitForFunction(
      (expected) =>
        [...document.querySelectorAll('.slide-text-demo canvas')].some(
          (canvas) => canvas.clientWidth >= expected - 42 && canvas.clientHeight >= 360,
        ),
      width,
    )
    await settle()
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    await root.screenshot({ path: path.join(directory, 'width-' + width + '.png') })
  }
  report.checks.push('Canvas resizes at 760/390/320px without outer horizontal overflow')
  if (process.env.SHOWCASE_GUIDE_ORIGIN) {
    await page.setViewportSize({ width: 1440, height: 1200 })
    for (const [locale, title, headings] of [
      ['en-US', 'Text Editing and Autofit Limits', ['Variants', 'Actions', 'States']],
      ['zh-CN', '文本编辑与自适应限制', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${process.env.SHOWCASE_GUIDE_ORIGIN}/${locale}/showcase/slides/text-editing-and-autofit`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { name: title, exact: true, level: 1 }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      const iframe = page.locator('iframe').first()
      await iframe.scrollIntoViewIfNeeded()
      const editor = page.frameLocator('iframe').first().locator('.slide-text-demo[data-ready=true]')
      await editor.waitFor({ timeout: 120000 })
      assert.equal(await editor.locator(':scope > fieldset, :scope > details, [data-action]').count(), 0)
      assert.equal(await editor.locator('[data-u-comp="slide-thumbnail-item"]').count(), 3)
      await editor.screenshot({ path: path.join(directory, `guide-editor-${locale}.png`) })
    }
    report.checks.push('EN/ZH card-free detail pages and native-only live iframes')
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS native-only Saffron')
