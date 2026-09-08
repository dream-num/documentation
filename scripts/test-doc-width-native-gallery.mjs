/* eslint-disable no-await-in-loop -- Width, zoom and theme cases share the same document owner. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/doc-width-native-gallery'
await fs.mkdir(output, { recursive: true })

let server
const port = Number(process.env.SHOWCASE_PORT || 4451)
if (process.argv[2]) {
  const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
  const entry = manifest.find(({ slug }) => slug === 'docs-modern/responsive-width-and-zoom')
  assert.ok(entry?.passed, 'Selected production build must pass')
  const { readShowcaseSources } = await import('./showcase-sources.mjs')
  const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
  for (const [file, expected] of Object.entries(source.files))
    assert.equal(await fs.readFile(path.join(entry.directory, file.slice(1)), 'utf8'), expected, file)
  const { createServer } = await import(
    pathToFileURL(path.join(entry.links.find(({ name }) => name === 'vite').target, 'dist/node/index.js'))
  )
  const dependencies = [
    ...new Set(
      Object.entries(source.files)
        .filter(([file]) => file.startsWith('/src/') && /\.[jt]sx?$/.test(file))
        .flatMap(([, code]) =>
          [...code.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
            .map((match) => match[1])
            .filter((id) => !id.endsWith('.css')),
        ),
    ),
  ]
  server = await createServer({
    configFile: false,
    root: process.cwd(),
    appType: 'custom',
    cacheDir: path.resolve(output, '.vite'),
    server: { host: '127.0.0.1', port, strictPort: true, watch: { ignored: ['**/.next/**'] } },
    optimizeDeps: {
      noDiscovery: true,
      include: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client',
        'next-themes',
        ...dependencies,
      ],
    },
    oxc: { jsx: { runtime: 'automatic' } },
    plugins: [
      {
        name: 'selected-width-preview',
        configureServer(vite) {
          vite.middlewares.use((req, res, next) => {
            if (!req.url?.startsWith('/?locale=')) return next()
            const locale =
              new URL(req.url, 'http://localhost').searchParams.get('locale') === 'zh-CN' ? 'zh-CN' : 'en-US'
            res.setHeader('Content-Type', 'text/html')
            res.end(
              '<html lang="' +
                locale +
                '"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}</style></head><body><div id="app"></div><script type="module" src="/width-preview.jsx"></script></body></html>',
            )
          })
        },
        resolveId(id) {
          if (id === '/width-preview.jsx') return '\0width-preview'
        },
        load(id) {
          if (id === '\0width-preview')
            return "import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/docs-modern/responsive-width-and-zoom/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();"
        },
      },
    ],
  })
  await server.listen()
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
await page.addInitScript(() => localStorage.setItem('theme', 'light'))
const report = { passed: false, locales: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const state = () =>
  page.evaluate(() => {
    const api = window.univerAPI
    const doc = api.getActiveDocument()
    // Diagnostic-only renderer reads verify actual layout, never used by the demo adapter.
    const injector = api._injector
    const key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
      (item) => String(item) === 'engine-render.render-manager.service',
    )
    const render = injector.get(key).getRenderUnitById(doc.getId())
    const pages = render.mainComponent._skeleton.getSkeletonData().pages
    return {
      snapshot: doc.save(),
      host: document.querySelector('.responsive-editor').clientWidth,
      scale: render.scene.scaleX,
      widths: pages.map((item) => item.pageWidth),
      lines: pages.flatMap((item) =>
        item.sections.flatMap((section) =>
          section.columns.flatMap((column) =>
            column.lines.map((line) => ({ start: line.st, end: line.ed, height: line.lineHeight })),
          ),
        ),
      ),
      sameOwner: window.__widthOwner === api,
    }
  })
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto(
      server
        ? `http://127.0.0.1:${port}/?locale=${locale}`
        : `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/docs-modern/responsive-width-and-zoom`,
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    const root = page.locator('.responsive-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await root.locator('canvas').first().waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.lang), locale)
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
    assert.doesNotMatch(await root.innerText(), /[\p{Script=Han}]|(?:docs|toolbar|ribbon)\.[a-z][\w.]+/u)
    await page.waitForFunction(
      () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
    )
    assert.equal(
      await root.locator(':scope > fieldset, :scope > details, :scope > output, :scope > [role=status]').count(),
      0,
    )
    await root.getByText('Insert', { exact: true }).first().click()
    await root.getByText('Start', { exact: true }).first().click()
    await page.evaluate(() => {
      window.__widthOwner = window.univerAPI
      if (!window.univerAPI.getActiveDocument().insertText(0, 'Preserved edit\r'))
        throw new Error('Facade document edit failed')
    })
    await settle()
    const baseline = (await state()).snapshot
    const width = root.getByLabel('External container width', { exact: true })
    const layouts = []
    for (const pixels of [960, 600, 390, 320]) {
      await width.selectOption(String(pixels))
      await page.waitForFunction(
        (expected) =>
          window.univerAPI.getActiveDocument().save().documentStyle.pageSize.width === Math.min(820, expected - 16),
        pixels,
      )
      await settle()
      const current = await state()
      assert.equal(current.host, pixels)
      assert.ok(current.sameOwner)
      assert.ok(
        current.widths.length > 0 &&
          current.widths.every((value) => value === current.snapshot.documentStyle.pageSize.width),
        'Rendered width must match model width',
      )
      assert.equal(current.scale, 1, 'Host resize must not shrink the text view')
      const expected = structuredClone(baseline)
      expected.documentStyle.pageSize.width = Math.min(820, pixels - 16)
      assert.deepEqual(current.snapshot, expected, 'Only logical width may change after an edited document resizes')
      layouts.push({ host: pixels, page: current.widths, lines: current.lines.length, scale: current.scale })
      await page.screenshot({ path: `${output}/${locale}-${pixels}.png` })
    }
    assert.ok(layouts[3].lines > layouts[0].lines, 'Narrow paragraphs must actually wrap into more rendered lines')
    await width.selectOption('390')
    await page.waitForFunction(() => window.univerAPI.getActiveDocument().save().documentStyle.pageSize.width === 374)
    await settle()
    const beforeZoom = await state()
    const zoom = root.locator('footer input').last()
    await zoom.click()
    await zoom.fill('150')
    await zoom.press('Enter')
    await page.waitForFunction(() => window.univerAPI.getActiveDocument().save().settings?.zoomRatio === 1.5)
    await settle()
    const afterZoom = await state()
    assert.equal(afterZoom.scale, 1.5)
    assert.deepEqual(afterZoom.widths, beforeZoom.widths)
    assert.deepEqual(afterZoom.lines, beforeZoom.lines, 'Native zoom must not rewrite logical line breaks')
    const expectedZoom = structuredClone(beforeZoom.snapshot)
    expectedZoom.settings = { ...expectedZoom.settings, zoomRatio: 1.5 }
    assert.deepEqual(afterZoom.snapshot, expectedZoom, 'Only native zoom settings may change')
    await page.screenshot({ path: `${output}/${locale}-390-zoom150.png` })
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        localStorage.setItem('theme', value)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value }))
      }, theme)
      await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
      await settle()
      const themed = await state()
      assert.ok(themed.sameOwner)
      assert.deepEqual(themed.snapshot, afterZoom.snapshot)
      assert.equal(await width.inputValue(), '390')
      await page.screenshot({ path: `${output}/${locale}-${theme}.png` })
    }
    report.locales.push({
      locale,
      layouts,
      nativeZoom: { percent: 150, pageWidth: afterZoom.widths, scale: afterZoom.scale, unchangedLines: true },
      editedModelPreserved: true,
      sameThemeOwner: true,
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || error.message
  throw error
} finally {
  if (!report.passed) await page.screenshot({ path: `${output}/failure.png` }).catch(() => {})
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
  if (server) await server.close()
}
