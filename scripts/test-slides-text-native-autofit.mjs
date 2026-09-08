/* eslint-disable no-await-in-loop -- Compare modes on the same actual renderer. */
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
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-text-native-autofit')
const textBox = true
const wrap = process.env.SHOWCASE_TEXT_WRAP || 'square'
assert.ok(['square', 'none'].includes(wrap), 'SHOWCASE_TEXT_WRAP must be square or none')
const paintedFontSize = (mode) =>
  Math.max(...mode.paint.map((draw) => Number(draw.font.match(/([\d.]+)px/)?.[1]) * Math.abs(draw.scale)))
await fs.mkdir(directory, { recursive: true })
const source = (await readShowcaseSources()).find((entry) => entry.slug === 'slides/text-editing-and-autofit')
const dependencies = [
  ...new Set(
    Object.entries(source.files)
      .filter(([name]) => name.endsWith('.ts'))
      .flatMap(([, code]) =>
        [...code.matchAll(/^\s*import\s+(?:type\s+)?(?:[\w*$,{}\s]+\s+from\s*)?['"]([^'"]+)['"]/gm)]
          .map((match) => match[1])
          .filter((specifier) => specifier.startsWith('@') && !specifier.endsWith('.css')),
      ),
  ),
]
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  cacheDir: path.resolve('test-results/slides-text-native-autofit-first/.vite'),
  appType: 'custom',
  server: { host: '127.0.0.1', port: 4428, strictPort: true },
  optimizeDeps: { noDiscovery: true, include: dependencies },
  plugins: [
    {
      name: 'slides-text-native-autofit-probe',
      configureServer(vite) {
        vite.middlewares.use((request, response, next) => {
          if (request.url !== '/') return next()
          response.setHeader('Content-Type', 'text/html')
          response.end(
            '<html><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module" src="/text-probe.js"></script></body></html>',
          )
        })
      },
      resolveId(id) {
        if (id === '/text-probe.js') return '\0text-probe.js'
      },
      load(id) {
        if (id !== '\0text-probe.js') return
        return `
import { createDemo } from '/showcase/slides/text-editing-and-autofit/code/create-demo.ts';
const demo=createDemo(document.getElementById('app'));
const api=demo.univerAPI;
const presentation=api.getActivePresentation();
window.probe={demo, apply(mode) {
  window.textPaint=[];
  const shape=presentation.getSlideByIndex(0).getShape('editable-copy');
  if(mode==='noAutoFit') {
    shape.getText().setTextBoxOptions({autoFitType:api.Enum.ShapeTextAutoFitType.NoAutoFit,textWrap:${JSON.stringify(wrap)},padding:{left:10,right:10,top:10,bottom:10}});
    shape.setSize(250,80);
    shape.getText().setFontFamily('monospace').setFontSize(28).setText('COBALT print studio: three workshops, twelve volunteer hosts, and a place to share a technique. Bring a draft and leave room for the next person.');
  } else shape.getText().setTextBoxOptions({autoFitType:mode});
  return {options:shape.getText().getTextBoxOptions(),data:shape.getSnapshot()};
}, explicitFontSize() {
  window.textPaint=[];
  presentation.getSlideByIndex(0).getShape('editable-copy').getText().setFontSize(14);
}, read() {
  const shape=presentation.getSlideByIndex(0).getShape('editable-copy');
  return {options:shape.getText().getTextBoxOptions(),data:shape.getSnapshot(),text:shape.getText().getPlainText(),paint:window.textPaint};
}};
`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, colorScheme: 'light' })
const report = { passed: false, textBox, wrap, modes: [], errors: [], warnings: [] }
page.on('requestfailed', (request) => report.errors.push(`${request.url()}: ${request.failure()?.errorText}`))
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
  if (message.type() === 'warning') report.warnings.push(message.text())
})
await page.addInitScript(() => {
  window.textPaint = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    // Only the probe shape uses monospace; exclude unrelated slide text and compare
    // the largest scale (main canvas), not the smaller thumbnail rendering.
    if (this.font.includes('monospace') && window.textPaint.length < 2000)
      window.textPaint.push({ text: String(args[0]), font: this.font, scale: this.getTransform().a })
    return Reflect.apply(fill, this, args)
  }
})
try {
  await page.goto('http://127.0.0.1:4428/', { waitUntil: 'domcontentloaded', timeout: 180000 })
  await page.locator('.slide-text-demo[data-ready="true"]').waitFor({ timeout: 120000 })
  await page.waitForFunction(
    () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
  )
  for (const mode of ['noAutoFit', 'normAutoFit', 'spAutoFit']) {
    await page.evaluate((value) => window.probe.apply(value), mode)
    await page.waitForFunction(() => window.textPaint.length > 0, undefined, { timeout: 15000 })
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    })
    const observed = await page.evaluate(() => window.probe.read())
    assert.equal(observed.options.autoFitType, mode, 'The Facade must persist the requested mode')
    assert.equal(observed.options.textWrap, wrap)
    assert.equal(observed.data.shapeData.isTextBox, textBox)
    assert.ok(observed.text.startsWith('COBALT print studio:'), 'The target text must survive mode changes')
    report.modes.push({ mode, ...observed })
    await page.screenshot({ path: path.join(directory, `${mode}.png`) })
  }
  const [fixed, shrink, grow] = report.modes
  await page.evaluate(() => window.probe.explicitFontSize())
  await page.waitForFunction(() => window.textPaint.length > 0, undefined, { timeout: 15000 })
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  report.explicitFontSize = await page.evaluate(() => window.probe.read())
  await page.screenshot({ path: path.join(directory, 'explicit-font-size.png') })
  const growthAxis = wrap === 'none' ? 'width' : 'height'
  report.checks = [
    {
      name: 'Explicit font size visibly reduces painted text (measurement control)',
      passed: paintedFontSize(report.explicitFontSize) < paintedFontSize(grow),
    },
    { name: 'Shrink mode visibly reduces painted text', passed: paintedFontSize(shrink) < paintedFontSize(fixed) },
    { name: 'Shrink preserves box height', passed: shrink.data.transform.height === 80 },
    {
      name: `Grow mode increases box ${growthAxis}`,
      passed: grow.data.transform[growthAxis] > fixed.data.transform[growthAxis],
    },
  ]
  assert.ok(
    report.checks.every((check) => check.passed),
    report.checks
      .filter((check) => !check.passed)
      .map((check) => check.name)
      .join('; '),
  )
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (cause) {
  report.failure = cause.stack || String(cause)
  report.lastState = await page.evaluate(() => window.probe?.read()).catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await page.evaluate(() => window.probe?.demo.dispose()).catch((cause) => report.errors.push(String(cause)))
  try {
    await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  } finally {
    // A full disk must not leave the test browser/server running.
    try {
      await browser.close()
    } finally {
      await server.close()
    }
  }
  console.log(
    JSON.stringify({
      passed: report.passed,
      textBox,
      wrap,
      modes: report.modes.map((mode) => ({
        mode: mode.mode,
        transform: mode.data.transform,
        paintedFontSize: paintedFontSize(mode),
        draws: mode.paint.length,
      })),
      errors: report.errors,
      warnings: report.warnings,
      checks: report.checks,
      failure: report.failure,
      directory,
    }),
  )
}
assert.ok(report.passed && report.errors.length === 0, report.failure || 'Renderer cleanup errors')
