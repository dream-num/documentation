/* eslint-disable no-await-in-loop -- Check the two host languages and fullscreen transitions in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

// Real parent/child components and one real SDK Preview; no Next or all-demo build.
const vitePath = process.env.SHOWCASE_VITE_DIR || path.resolve('node_modules/vite')
const { build, preview, transformWithOxc } = await import(pathToFileURL(path.join(vitePath, 'dist/node/index.js')))
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/playground-fullscreen')
const port = Number(process.env.SHOWCASE_EXPORT_PORT || 4456)
const slug = 'sheets/formula-errors-and-recovery'
await fs.mkdir(directory, { recursive: true })
const output = process.env.SHOWCASE_FULLSCREEN_BUILD || (await fs.mkdtemp(path.join(directory, 'build-')))
const harness = `import React from 'react';import {createRoot} from 'react-dom/client';
import {NextIntlClientProvider} from 'next-intl';import {ThemeProvider} from 'next-themes';
import {PlaygroundFrame} from '/components/playground/playground-frame.tsx';
import {Playground} from '/components/playground/playground.tsx';
import {LayoutProvider} from '/app/[lang]/playground/layout.client.tsx';
import Preview from '/showcase/${slug}/preview/main.tsx';
import '/app/global.css';
const child=location.pathname.includes('/playground/');
const lang=location.pathname.includes('zh-CN')?'zh-CN':'en-US';
const messages={playground:{preview:'Preview','fullscreen-preview':'Fullscreen preview','click-to-show':'Show demo','click-to-hide':'Hide demo'}};
createRoot(document.getElementById('app')).render(<NextIntlClientProvider locale={lang} messages={messages}><ThemeProvider attribute="class">
{child?<LayoutProvider><Playground preview={<Preview/>} previewHeight={1000} files={{'/src/index.ts':'// SOURCE MUST NOT APPEAR IN FULLSCREEN'}} dependencies={{}}/></LayoutProvider>:<>
<header style={{height:160}}>Documentation navigation</header><main style={{padding:24}}><PlaygroundFrame slug="${slug}" lang={lang} clickToShow={lang==='zh-CN'}/></main><footer style={{height:800}}>Documentation footer</footer>
</>}
</ThemeProvider></NextIntlClientProvider>);`
if (!process.env.SHOWCASE_FULLSCREEN_BUILD)
  await build({
    configFile: false,
    root: process.cwd(),
    logLevel: 'error',
    resolve: { alias: { '@': process.cwd() } },
    build: {
      outDir: output,
      emptyOutDir: false,
      cssCodeSplit: false,
      rollupOptions: { input: 'virtual:fullscreen-harness', output: { entryFileNames: 'assets/harness.js' } },
    },
    plugins: [
      {
        name: 'selected-fullscreen-harness',
        resolveId(id) {
          if (id === 'virtual:fullscreen-harness') return '\0fullscreen-harness'
        },
        load(id) {
          if (id === '\0fullscreen-harness') return harness
        },
        async transform(source, id) {
          if (id === '\0fullscreen-harness') {
            return transformWithOxc(source, 'fullscreen-harness.tsx', { jsx: { runtime: 'automatic' } })
          }
        },
      },
    ],
  })
// CSS is emitted after Rollup's ordinary generateBundle hooks in this Vite version.
const stylesheets = (await fs.readdir(path.join(output, 'assets'))).filter((name) => name.endsWith('.css'))
assert.ok(stylesheets.length, 'Include actual application, CSS module and official SDK styles')
await fs.writeFile(
  path.join(output, 'index.html'),
  `<!doctype html><html><head><link rel="icon" href="data:,">${stylesheets.map((name) => `<link rel="stylesheet" href="/assets/${name}">`).join('')}</head><body style="margin:0"><div id="app"></div><script type="module" src="/assets/harness.js"></script></body></html>`,
)
const server = await preview({
  configFile: false,
  root: process.cwd(),
  build: { outDir: output },
  preview: { host: '127.0.0.1', port, strictPort: true },
})
console.log('Built only the fullscreen shell and ' + slug)
const browser = await chromium.launch()
const report = {
  passed: false,
  scope: 'Actual PlaygroundFrame, Playground, LayoutProvider, CSS and one selected SDK Preview',
  results: [],
  errors: [],
}
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    page.on('pageerror', (e) => report.errors.push(e.message))
    await page.goto(`http://127.0.0.1:${port}/${locale}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    const iframe = page.locator('[data-playground-frame] iframe')
    if (locale === 'zh-CN') await page.getByRole('button', { name: 'Show demo', exact: true }).click()
    await iframe.scrollIntoViewIfNeeded()
    const frame = await (await iframe.elementHandle()).contentFrame()
    await frame.waitForFunction(
      () => document.querySelector('[data-ready="true"]') && window.univerAPI,
      {},
      { timeout: 120000 },
    )
    await frame.evaluate(() => {
      window.fullscreenOwner = window.univerAPI
      window.fullscreenCanvas = document.querySelector('canvas')
      window.univerAPI.getActiveWorkbook().getSheetBySheetId('errors').getRange('C5').setValue(7)
    })
    await frame.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getSheetBySheetId('errors').getRange('D5').getValue() === 12,
    )
    let snapshot = await frame.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    const originalHeight = await iframe.evaluate((el) => el.clientHeight)
    await page.getByRole('button', { name: 'Fullscreen preview', exact: true }).click()
    await page.waitForFunction(() => Boolean(document.fullscreenElement))
    await frame.waitForFunction(() => document.documentElement.hasAttribute('data-showcase-preview-only'))
    assert.equal(await iframe.count(), 1, 'No second editor/iframe')
    const checkFit = async () => {
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-playground-frame]')
        return Math.abs(el.getBoundingClientRect().height - innerHeight) < 2
      })
      await frame.waitForFunction(
        () =>
          Math.abs(document.querySelector('[data-showcase-preview]').getBoundingClientRect().height - innerHeight) < 2,
      )
      assert.equal(await frame.locator('[data-showcase-code]').isVisible(), false)
      assert.ok(
        await frame.evaluate(
          () =>
            document.documentElement.scrollHeight <= innerHeight + 1 &&
            document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      )
      assert.ok(
        await frame.evaluate(
          () =>
            window.univerAPI === window.fullscreenOwner && document.querySelector('canvas') === window.fullscreenCanvas,
        ),
      )
      assert.deepEqual(await frame.evaluate(() => window.univerAPI.getActiveWorkbook().save()), snapshot)
    }
    await checkFit()
    const nameBox = frame.locator('input.univer-size-full')
    await nameBox.fill('C5')
    await nameBox.press('Enter')
    await page.keyboard.type('6')
    await page.keyboard.press('Enter')
    await frame.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getSheetBySheetId('errors').getRange('D5').getValue() === 14,
    )
    snapshot = await frame.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    await checkFit()
    await frame.evaluate(() => parent.postMessage({ type: 'setHeight', height: 9000 }, location.origin))
    await checkFit()
    await page.screenshot({ path: path.join(directory, `${locale}-fullscreen.png`) })
    // Change the viewport without asking Windows to resize a native fullscreen window.
    const viewport = await page.context().newCDPSession(page)
    await viewport.send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await checkFit()
    await frame.evaluate(() => window.scrollTo(0, 9000))
    assert.equal(await frame.evaluate(() => window.scrollY), 0, 'No outer document scrolling')
    await page.getByRole('button', { name: locale === 'zh-CN' ? '退出全屏' : 'Exit fullscreen', exact: true }).click()
    await page.waitForFunction(() => !document.fullscreenElement)
    await frame.waitForFunction(() => !document.documentElement.hasAttribute('data-showcase-preview-only'))
    assert.ok(await frame.locator('[data-showcase-code]').isVisible())
    assert.deepEqual(await frame.evaluate(() => window.univerAPI.getActiveWorkbook().save()), snapshot)
    assert.equal(await iframe.evaluate((el) => el.clientHeight), originalHeight)
    // Native browser exit (the same fullscreenchange path used by Escape).
    await page.getByRole('button', { name: 'Fullscreen preview', exact: true }).click()
    await page.waitForFunction(() => Boolean(document.fullscreenElement))
    await page.evaluate(() => document.exitFullscreen())
    await frame.waitForFunction(() => !document.documentElement.hasAttribute('data-showcase-preview-only'))
    assert.ok(await frame.locator('[data-showcase-code]').isVisible())
    report.results.push({
      locale,
      sameOwnerAndCanvas: true,
      editedSnapshotPreserved: true,
      nativeEditingInFullscreen: true,
      previewOnly: true,
      resize: true,
      exitRestoresCodeAndHeight: true,
    })
    await page.close()
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.dimensions = []
  for (const context of browser.contexts())
    for (const page of context.pages()) {
      await page.screenshot({ path: path.join(directory, 'failure.png') })
      for (const frame of page.frames())
        report.dimensions.push(
          await frame.evaluate(() => ({
            url: location.href,
            viewport: [innerWidth, innerHeight],
            scroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
            mode: document.documentElement.hasAttribute('data-showcase-preview-only'),
            elements: [
              ...document.querySelectorAll(
                '[data-showcase-preview],.sp-layout,.sp-wrapper,section,[data-showcase-code],iframe,[data-playground-frame]',
              ),
            ].map((e) => ({
              tag: e.tagName,
              class: e.className,
              height: e.getBoundingClientRect().height,
              display: getComputedStyle(e).display,
              overflow: getComputedStyle(e).overflow,
            })),
          })),
        )
    }
  throw error
} finally {
  await browser.close()
  await server.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
}
