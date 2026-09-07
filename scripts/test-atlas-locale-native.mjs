/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/atlas-locale-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/embed/slides-in-sheets-formula-float/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 5)
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const port = Number(process.env.SHOWCASE_EXPORT_PORT || '4428')
assert(Number.isInteger(port) && port > 0 && port < 65536, 'Valid isolated preview port')
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? `http://127.0.0.1:${port}`
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/embed/slides-in-sheets-formula-float`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-atlas-locale-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/slides-in-sheets-formula-float')
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(exportDirectory, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  // Use exact installed package versions; never mutate another preview's dependency directory.
  const manifest = JSON.parse(source.files['/package.json'])
  const viteDirectory = process.env.SHOWCASE_VITE_DIRECTORY || path.join(exportDirectory, 'node_modules', 'vite')
  const vitePackage = await fs.realpath(viteDirectory).catch(() => {
    throw new Error(
      `Vite ${manifest.devDependencies.vite} is unavailable at ${viteDirectory}. Reuse SHOWCASE_EXPORT_DIRECTORY with its installed node_modules/vite, set SHOWCASE_VITE_DIRECTORY to that exact installed Vite package directory, or run pnpm install in the generated selected export ${exportDirectory} and reuse it. No other demo's output is required.`,
    )
  })
  const linkedVersions = {}
  for (const [name, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
    const installed = name === 'vite' ? vitePackage : await fs.realpath(path.join(process.cwd(), 'node_modules', name))
    const actual = JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version
    assert.equal(actual, version, 'Use the exact exported version of ' + name)
    const target = path.join(exportDirectory, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    if (await fs.lstat(target).catch(() => null)) assert.equal(await fs.realpath(target), installed)
    else await fs.symlink(installed, target, 'junction')
    linkedVersions[name] = actual
  }
  await fs.writeFile(path.join(directory, 'linked-versions.json'), JSON.stringify(linkedVersions, null, 2))
  await fs.writeFile(
    path.join(directory, 'exports.json'),
    JSON.stringify([{ slug: source.slug, directory: exportDirectory }], null, 2),
  )
  const { build, preview } = await import(
    pathToFileURL(path.join(exportDirectory, 'node_modules/vite/dist/node/index.js')).href
  )
  await build({ root: exportDirectory, configFile: false, logLevel: 'warn' })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    preview: { host: '127.0.0.1', port, strictPort: true },
  })
}

const { createRequire } = await import('node:module')
const require = createRequire(import.meta.url)
const packageNames = [
  '@univerjs/design',
  '@univerjs/ui',
  '@univerjs/docs-ui',
  '@univerjs/sheets',
  '@univerjs/sheets-ui',
  '@univerjs/sheets-formula-ui',
  '@univerjs/sheets-numfmt-ui',
  '@univerjs-pro/shape-editor-ui',
  '@univerjs-pro/slides-ui',
  '@univerjs-pro/embed-ui',
  '@univerjs/drawing-ui',
  '@univerjs/sheets-drawing-ui',
  '@univerjs/engine-formula',
  '@univerjs/sheets-formula',
  '@univerjs-pro/slides',
  '@univerjs-pro/embed-unit-ui',
]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1050 }, colorScheme: 'light' })
page.setDefaultTimeout(20000)
const report = {
  slug: 'embed/slides-in-sheets-formula-float',
  passed: false,
  sourceFiles: 12,
  localePacks: packageNames.length,
  officialCSS: 12,
  literals: 5,
  gates: {},
  checks: [],
  errors: [],
  backendRequests: [],
}
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) report.backendRequests.push(r.url())
})
await page.addInitScript(() => {
  window.painted = []
  window.childPainted = []
  const clear = CanvasRenderingContext2D.prototype.clearRect
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    if (this.canvas.closest('[data-u-comp="embed-float-dom"]')) window.childPainted = []
    return Reflect.apply(clear, this, args)
  }
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    if (this.canvas.closest('[data-u-comp="embed-float-dom"]')) {
      window.childPainted.push(String(args[0]))
      if (window.childPainted.length > 10000) window.childPainted.splice(0, 5000)
    }
    if (window.painted.length > 20000) window.painted.splice(0, 10000)
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.atlas-embed')
const float = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="atlas-slide-float"]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
async function paintedValues(ids) {
  const current = await results()
  const title = ids[0].startsWith('review-') ? 'Keep the model in the conversation.' : 'A quote with room to deliver.'
  await page.waitForFunction(
    (values) => values.every((v) => window.childPainted.join('').includes(v)),
    [title, ...ids.map((id) => current[id].displayText)],
  )
}
const results = () =>
  page.evaluate(() => {
    const deck = window.univerAPI.getPresentation('atlas-quote-decision')
    return Object.fromEntries(
      [
        ['decision', 'quote-value'],
        ['decision', 'cost-value'],
        ['decision', 'contribution-value'],
        ['decision', 'margin-value'],
        ['review', 'review-cost'],
        ['review', 'review-margin'],
      ].map(([p, id]) => [id, deck.getSlideById(p).getShape(id).getFormulaResult()]),
    )
  })
const authored = () =>
  page.evaluate(() => {
    const slides = window.univerAPI.getPresentation('atlas-quote-decision').save().slides
    return JSON.parse(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(slides).map(([id, p]) => [
            id,
            {
              text: ['kicker', 'title', 'footer', ...(id === 'review' ? ['explanation'] : [])].map(
                (k) => p.elements[k],
              ),
              geometry: Object.fromEntries(p.elementOrder.map((k) => [k, p.elements[k].transform])),
            },
          ]),
        ),
      ),
    )
  })
async function checkValues(expectedQuote, expectedCost, expectedMargin) {
  await page.waitForFunction(
    ({ quote, cost, margin }) => {
      const deck = window.univerAPI.getPresentation('atlas-quote-decision')
      const specs = [
        ['decision', 'quote-value', quote],
        ['decision', 'cost-value', cost],
        ['decision', 'contribution-value', quote - cost],
        ['decision', 'margin-value', margin],
        ['review', 'review-cost', cost],
        ['review', 'review-margin', margin],
      ]
      return specs.every(([p, id, v]) => {
        const r = deck.getSlideById(p).getShape(id).getFormulaResult()
        return (
          r &&
          !r.stale &&
          (typeof v === 'string'
            ? r.value === v && r.status === 'error'
            : Math.abs(r.value - v) < 1e-9 && r.status === 'success')
        )
      })
    },
    { quote: expectedQuote, cost: expectedCost, margin: expectedMargin },
    { timeout: 30000 },
  )
}

function merge(target, ...sources) {
  for (const src of sources)
    for (const [k, v] of Object.entries(src)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) target[k] = merge(target[k] ?? {}, v)
      else target[k] = v
    }
  return target
}
function pack(actual, expected, p = '') {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') pack(actual[k] ?? {}, v, p + '.' + k)
    else assert.deepEqual(actual[k], v, 'Complete merged locale ' + p + '.' + k)
  }
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, error: e.stack || String(e) }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
    await fs.writeFile(
      path.join(directory, name + '-dom.txt'),
      await page
        .locator('body')
        .innerText()
        .catch(() => ''),
    )
  }
  console.log(name + ': ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
const shot = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
const models = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        sheet: univerAPI.getWorkbook('atlas-quote-model').save(),
        slides: univerAPI.getPresentation('atlas-quote-decision').save(),
      }),
    ),
  )
async function noKeys(label) {
  const text = await page.locator('body').innerText()
  assert(
    !/(?:shape-editor-ui|slides-ui|embed-ui|embed-unit-ui|drawing-ui|sheets-formula-ui)\.[A-Za-z]/.test(text),
    'Untranslated key in ' + label,
  )
  report.checks.push({ name: label + ' visible labels contain no localization keys' })
}
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const zh = lang === 'zh-CN'
    if (buildStandalone) {
      // Language is a document-level integration input; use the unchanged normal entry.
      // Only the HTTP test response's html lang attribute changes, never SDK/source code.
      await page.route(url + '/', async (route) => {
        const response = await route.fetch()
        const html = await response.text()
        await route.fulfill({ response, body: html.replace(/<html[^>]*>/, '<html lang="' + lang + '">') })
      })
    }
    await gate(lang + '-complete-locale-white-grid-six-formulas', async () => {
      await page.goto(buildStandalone ? url : url.replace('/en-US/', '/' + lang + '/'), {
        waitUntil: 'domcontentloaded',
      })
      await root.locator(':scope[data-ready=true]').waitFor({ timeout: 60000 })
      assert.equal(await root.getAttribute('data-error'), null)
      await checkValues(12000, 8400, 0.3)
      await paintedValues(['quote-value', 'cost-value', 'contribution-value', 'margin-value'])
      assert.equal(await page.evaluate(() => univerAPI.getCurrentLocale()), zh ? 'zhCN' : 'enUS')
      const expected = merge({}, ...packageNames.map((name) => require(name + '/locale/' + lang)))
      pack(await page.evaluate(() => univerAPI.getLocales()), expected)
      assert.equal(await root.locator('fieldset,details,[data-action],iframe').count(), 0)
      assert.equal(
        await root
          .locator('[data-u-comp=workbench-layout]')
          .first()
          .evaluate((el) => getComputedStyle(el).backgroundColor),
        'rgb(255, 255, 255)',
      )
      await root.locator('[data-u-comp=ribbon-grid-toolbar]').waitFor()
      assert.deepEqual((await models()).slides.slideOrder, ['decision', 'review'])
      const descriptor = await page.evaluate(() =>
        univerAPI.listEmbeds({ hostUnitId: 'atlas-quote-model' })[0].getDescriptor(),
      )
      assert.equal(descriptor.childUnitId, 'atlas-quote-decision')
      assert.equal(descriptor.entry, 'sheets-floating-object')
      assert.equal(descriptor.context.resolved, true)
      await noKeys(lang + ' settled native workbench')
      await shot(lang + '-cover')
      report.checks.push({
        name:
          lang + ' initial document language, 16 complete merged SDK packs, original two pages and six live formulas',
        results: await results(),
        descriptor,
      })
    })
    await gate(lang + '-literal-formulas-and-native-source-input', async () => {
      const original = await authored()
      const expected = [
        [12000, 9000, 0.25],
        [13200, 9000, 4200 / 13200],
        [0, 9000, '#DIV/0!'],
        [12000, 9000, 0.25],
        [12000, 8400, 0.3],
      ]
      for (const [i, code] of examples.entries()) {
        await page.evaluate(code)
        await checkValues(...expected[i])
        await paintedValues(['quote-value', 'cost-value', 'contribution-value', 'margin-value'])
        assert.deepEqual(await authored(), original)
        report.checks.push({ name: lang + ' literal ' + (i + 1), results: await results() })
      }
      const box = root.locator('[data-u-comp=defined-name] input')
      await box.fill('B8')
      await box.press('Enter')
      await page.keyboard.type('3000')
      await page.keyboard.press('Enter')
      await checkValues(12000, 9000, 0.25)
      await paintedValues(['cost-value', 'margin-value'])
      assert.deepEqual(await authored(), original)
      await shot(lang + '-native-source-3000')
    })
    await gate(lang + '-native-float-pages-and-formula-menu', async () => {
      await float.dblclick({ position: { x: 210, y: 115 } })
      await page.getByRole('button', { name: zh ? '下一张幻灯片' : 'Next page', exact: true }).click()
      await paintedValues(['review-cost', 'review-margin'])
      await noKeys(lang + ' review page controls')
      await shot(lang + '-review-page')
      await page.getByRole('button', { name: zh ? '上一页' : 'Previous page', exact: true }).click()
      await paintedValues(['quote-value', 'cost-value', 'contribution-value', 'margin-value'])
      // The displayed first formula occupies x44..366, y193..243 on the 800×450 page.
      const rect = await float.boundingBox()
      assert(rect)
      await float.click({ position: { x: (150 / 800) * rect.width, y: (218 / 450) * rect.height }, button: 'right' })
      await settle()
      await noKeys(lang + ' native formula context menu')
      await shot(lang + '-formula-context-menu')
      // Formula editing is the actual fx floating-toolbar button, not a text context-menu item.
      await page.keyboard.press('Escape')
      const edit = page
        .getByRole('button', { name: zh ? '编辑公式' : 'Edit formula', exact: true })
        .filter({ visible: true })
      await edit.click()
      await page.getByRole('dialog').waitFor()
      await page.waitForFunction(
        () => {
          const dialog = document.querySelector('[role=dialog]')
          const source = dialog?.querySelector('canvas[id^="univer-sheet-main-canvas"]')
          if (!source?.width || dialog.querySelector('[data-u-comp=workbench-skeleton-content]')) return false
          const pixels = source.getContext('2d').getImageData(0, 0, source.width, source.height).data
          let ink = 0
          for (let i = 0; i < pixels.length; i += 4)
            if (pixels[i + 3] > 200 && pixels[i] < 100 && pixels[i + 1] < 100 && pixels[i + 2] < 100) ink++
          return ink > 300
        },
        undefined,
        { timeout: 30000 },
      )
      await page.evaluate(async () => {
        await Promise.all(
          document
            .getAnimations()
            .filter((a) => a.effect?.getTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => {})),
        )
      })
      await noKeys(lang + ' native formula editor')
      await shot(lang + '-formula-editor')
      await page
        .getByRole('button', { name: zh ? '取消' : 'Cancel', exact: true })
        .filter({ visible: true })
        .click()
      await checkValues(12000, 9000, 0.25)
      report.checks.push({ name: lang + ' real Float page navigation and native formula menu/editor translated' })
    })
    await gate(lang + '-theme-same-owner-and-full-model-preservation', async () => {
      await page.keyboard.press('Escape')
      const before = await models()
      await page.evaluate(() => {
        window.oldOwner = univerAPI
        univerAPI.toggleDarkMode(true)
      })
      await settle()
      assert(await page.evaluate(() => oldOwner === univerAPI && univerAPI.isDarkMode()))
      assert.deepEqual(await models(), before)
      await page.evaluate(() => univerAPI.toggleDarkMode(false))
      await settle()
      assert.deepEqual(await models(), before)
      await checkValues(12000, 9000, 0.25)
      report.checks.push({
        name: lang + ' same owner and complete Sheet/Slides snapshots unchanged across both theme transitions',
      })
    })
    await gate(lang + '-owner-disposal', async () => {
      await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
      await root.waitFor({ state: 'detached' })
      await settle()
      assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    })
    if (buildStandalone) await page.unroute(url + '/')
  }
  await gate('normal-export-all-files-official-css-and-source-parity', async () => {
    assert(buildStandalone, 'Requires selected standalone export')
    const [entry] = JSON.parse(await fs.readFile(path.join(directory, 'exports.json'), 'utf8'))
    const source = (await readShowcaseSources()).find((x) => x.slug === report.slug)
    report.sourceFiles = Object.keys(source.files).length
    for (const [name, content] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
    const imports = [...source.files['/src/create-demo.ts'].matchAll(/import ['"](@[^'"]+\/lib\/index.css)['"]/g)].map(
      (m) => m[1],
    )
    assert.equal(imports.length, 12)
    await fs.writeFile(
      path.join(directory, 'source-parity.json'),
      JSON.stringify(
        { slug: report.slug, sourceFiles: report.sourceFiles, imports, files: Object.keys(source.files) },
        null,
        2,
      ),
    )
    report.checks.push({
      name: 'Unchanged normal production entry, complete exported authored/reference files and 12 official CSS imports',
      imports,
    })
  })
  report.passed =
    Object.values(report.gates).every((x) => x.passed) && !report.errors.length && !report.backendRequests.length
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, checks: report.checks.length }, null, 2))
  await browser.close()
  if (server) await new Promise((r) => server.httpServer.close(r))
}
if (!report.passed) process.exitCode = 1
