/* eslint-disable no-await-in-loop -- Exercise ordered real Preview lifecycle transitions. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const manifestPath =
  process.argv[2] || 'test-results/dynamic-array-exports/reviewed/selected-export-builds-j35eXn/manifest.json'
const entry = JSON.parse(await fs.readFile(manifestPath, 'utf8')).find(
  (item) => item.slug === 'sheets/dynamic-array-formulas',
)
assert.ok(entry?.passed)
const out = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/dynamic-array-preview')
const port = Number(process.env.SHOWCASE_EXPORT_PORT || 4452)
await fs.mkdir(out, { recursive: true })
const previewSource = await fs.readFile('showcase/sheets/dynamic-array-formulas/preview/main.tsx', 'utf8')
// Preview is site-owned rather than part of this export; bundle its exact current text.
await fs.writeFile(path.join(out, 'actual-Preview.tsx'), previewSource)
for (const file of ['create-demo.ts', 'data.ts', 'styles.css'])
  assert.equal(
    await fs.readFile('showcase/sheets/dynamic-array-formulas/code/' + file, 'utf8'),
    await fs.readFile(path.join(entry.directory, 'src', file), 'utf8'),
  )
const viteDirectory = entry.links.find((link) => link.name === 'vite').target
const { build, preview } = await import(pathToFileURL(path.join(viteDirectory, 'dist/node/index.js')))
const harness = `import React,{StrictMode,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
import {ThemeProvider,useTheme} from 'next-themes';import Preview from '/actual-preview.tsx';
window.probe={setups:0,cleanups:0};
function Host(){const[mounted,setMounted]=useState(true);const{setTheme}=useTheme();
window.probe.mount=()=>flushSync(()=>setMounted(true));window.probe.unmount=()=>flushSync(()=>setMounted(false));window.probe.setTheme=setTheme;
useEffect(()=>{window.probe.setups++;return()=>{window.probe.cleanups++}},[]);
return mounted?React.createElement(Preview):null;}
document.documentElement.lang=new URLSearchParams(location.search).get('lang')||'en-US';
createRoot(document.getElementById('app')).render(React.createElement(StrictMode,null,React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light',enableSystem:false},React.createElement(Host))));`
await build({
  root: entry.directory,
  configFile: false,
  logLevel: 'warn',
  // Development React is intentional: production StrictMode does not replay effects.
  define: { 'process.env.NODE_ENV': JSON.stringify('development') },
  resolve: {
    alias: {
      'react-dom': path.resolve('node_modules/react-dom'),
      react: path.resolve('node_modules/react'),
      'next-themes': path.resolve('node_modules/next-themes'),
    },
  },
  oxc: { jsx: { runtime: 'automatic' } },
  build: { outDir: path.join(out, 'dist'), emptyOutDir: false },
  plugins: [
    {
      name: 'actual-dynamic-array-preview',
      transformIndexHtml: {
        order: 'pre',
        handler: () =>
          '<html><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}.min-h-0{min-height:0}</style></head><body><div id="app"></div><script type="module" src="/preview-harness.jsx"></script></body></html>',
      },
      resolveId(id) {
        if (id === '/preview-harness.jsx' || id === '/actual-preview.tsx') return '\0' + id
        if (id === '../code/create-demo') return path.join(entry.directory, 'src/create-demo.ts')
      },
      load(id) {
        if (id === '\0/preview-harness.jsx') return harness
        if (id === '\0/actual-preview.tsx') return previewSource
      },
    },
  ],
})
const server = await preview({
  root: entry.directory,
  configFile: false,
  build: { outDir: path.join(out, 'dist') },
  preview: { host: '127.0.0.1', port, strictPort: true },
})
const browser = await chromium.launch()
const results = []
try {
  for (const language of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
    const result = { language, passed: false, errors: [], gates: {} }
    results.push(result)
    page.on('pageerror', (error) => result.errors.push(error.stack || String(error)))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.addInitScript(() => {
      window.painted = []
      const fill = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        window.painted.push(String(text))
        return fill.call(this, text, ...args)
      }
    })
    const save = () => page.evaluate(() => window.univerAPI.getWorkbook('dynamic-array-formulas').save())
    const ready = async () => {
      await page.waitForFunction(
        () =>
          window.univerAPI
            ?.getWorkbook('dynamic-array-formulas')
            ?.getSheetBySheetId('range-spill')
            ?.getRange('E3')
            .getValue() === 7,
      )
      await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
      await page.waitForFunction(
        () =>
          window.painted.includes('Orchard schools') &&
          !document.querySelector('[data-u-comp="workbench-skeleton-content"]'),
      )
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    }
    try {
      await page.goto(`http://127.0.0.1:${port}/?lang=${language}`)
      await ready()
      assert.deepEqual(await page.evaluate(() => ({ setups: window.probe.setups, cleanups: window.probe.cleanups })), {
        setups: 2,
        cleanups: 1,
      })
      assert.equal(await page.locator('.dynamic-array-demo').count(), 1)
      assert.equal(await page.locator('canvas[id^="univer-sheet-main-canvas"]').count(), 1)
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      result.gates.strictModeSettledSingleOwner = true
      await page.screenshot({ path: path.join(out, language + '-strict-mode.png') })
      // Seed one real SDK edit to make theme preservation meaningful; native typing is covered separately.
      await page.evaluate(async () => {
        window.retainedOwner = window.univerAPI
        window.retainedCanvases = [...document.querySelectorAll('canvas')]
        window.univerAPI
          .getWorkbook('dynamic-array-formulas')
          .getSheetBySheetId('range-spill')
          .getRange('B3')
          .setValue(27)
        await window.univerAPI.getFormula().onCalculationResultApplied(10000)
      })
      await page.waitForFunction(
        () =>
          window.univerAPI
            .getWorkbook('dynamic-array-formulas')
            .getSheetBySheetId('range-spill')
            .getRange('E3')
            .getValue() === 27,
      )
      const edited = await save()
      for (const [method, theme] of [
        ['storage', 'dark'],
        ['storage', 'light'],
        ['provider', 'dark'],
        ['provider', 'light'],
      ]) {
        await page.evaluate(
          ({ method: route, theme: value }) => {
            if (route === 'provider') window.probe.setTheme(value)
            else {
              localStorage.setItem('theme', value)
              window.dispatchEvent(
                new StorageEvent('storage', { key: 'theme', newValue: value, storageArea: localStorage }),
              )
            }
          },
          { method, theme },
        )
        await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        assert.equal(
          await page.evaluate(
            () =>
              window.retainedOwner === window.univerAPI &&
              window.retainedCanvases.every((canvas) => canvas.isConnected),
          ),
          true,
        )
        assert.deepEqual(await save(), edited, 'Exact edited workbook across ' + method + ' ' + theme)
        await page.screenshot({ path: path.join(out, language + '-' + method + '-' + theme + '.png') })
      }
      result.gates.storageAndProviderThemesPreserveFullEditedModel = true
      // Coordinates reviewed in the 1440x1000 native canvas screenshots, not a Facade selection.
      try {
        await page.mouse.click(274, 252)
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange().getA1Notation() === 'B3',
        )
        await page.screenshot({ path: path.join(out, language + '-theme-pointer-selected-B3.png') })
        result.toolbarBeforeClick = await page.evaluate(() => {
          const control = document.elementFromPoint(191, 99)
          const button = control?.closest('button')
          return { command: button?.getAttribute('data-u-command'), disabled: button?.disabled }
        })
        assert.deepEqual(result.toolbarBeforeClick, { command: 'sheet.command.set-range-bold', disabled: false })
        const beforeBold = await save()
        assert.deepEqual(beforeBold, edited, 'Pointer selection does not mutate the workbook')
        await page.locator('[data-u-command="sheet.command.set-range-bold"]').click()
        await page.waitForFunction(
          () => {
            const workbook = window.univerAPI.getWorkbook('dynamic-array-formulas').save()
            const style = workbook.sheets['range-spill'].cellData[2][1].s
            return (typeof style === 'string' ? workbook.styles[style] : style)?.bl === 1
          },
          null,
          { timeout: 5000 },
        )
        const afterBold = await save()
        const expected = structuredClone(beforeBold)
        const oldStyle = expected.sheets['range-spill'].cellData[2][1].s
        const newStyle = afterBold.sheets['range-spill'].cellData[2][1].s
        const boldStyle = { ...(typeof oldStyle === 'string' ? expected.styles[oldStyle] : oldStyle), bl: 1 }
        expected.sheets['range-spill'].cellData[2][1].s = newStyle
        if (typeof newStyle === 'string') expected.styles[newStyle] = boldStyle
        else assert.deepEqual(newStyle, boldStyle)
        assert.deepEqual(afterBold, expected, 'Only B3 bold style changes after real native toolbar click')
        result.gates.nativeBoldAfterThemePointerSelection = true
        await page.screenshot({ path: path.join(out, language + '-theme-native-bold-B3.png') })
      } catch (error) {
        result.gates.nativeBoldAfterThemePointerSelection = false
        result.toolbarFailure = error.stack || String(error)
        await page.screenshot({ path: path.join(out, language + '-theme-toolbar-failure.png') })
      }
      await page.evaluate(() => window.probe.unmount())
      await page.waitForFunction(() => !window.univerAPI && document.querySelectorAll('canvas').length === 0)
      assert.equal(await page.evaluate(() => window.retainedCanvases.every((canvas) => !canvas.isConnected)), true)
      result.gates.realPreviewUnmount = true
      await page.evaluate(() => {
        window.painted = []
        window.probe.mount()
      })
      await ready()
      assert.equal(await page.evaluate(() => window.retainedOwner !== window.univerAPI), true)
      assert.equal(await page.locator('.dynamic-array-demo').count(), 1)
      result.gates.freshPreviewRemount = true
      await page.evaluate(() => window.probe.unmount())
      await page.waitForFunction(() => !window.univerAPI && document.querySelectorAll('canvas').length === 0)
      assert.deepEqual(result.errors, [])
      result.passed = Object.values(result.gates).every(Boolean)
    } catch (error) {
      result.failure = error.stack || String(error)
      await page.screenshot({ path: path.join(out, language + '-failure.png') }).catch(() => {})
    } finally {
      await page.close()
      await fs.writeFile(
        path.join(out, 'report.json'),
        JSON.stringify(
          {
            manifestPath,
            scope:
              'Exact actual Preview in development React StrictMode; isolated selected build; not Next page routing or native-input history acceptance.',
            results,
          },
          null,
          2,
        ),
      )
    }
  }
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
console.log(JSON.stringify(results, null, 2))
assert.ok(results.every((result) => result.passed))
