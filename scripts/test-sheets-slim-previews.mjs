/* eslint-disable no-await-in-loop -- Each selected preview owns its workbook until unmount. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'
const { createServer } = await import(
  pathToFileURL(
    process.env.SHOWCASE_VITE_MODULE ||
      'C:/Users/wbfsa/AppData/Local/Temp/univer-vite-runner/node_modules/vite/dist/node/index.js',
  ).href
)
const family = process.env.SHOWCASE_FAMILY || 'slim'
assert.ok(['slim', 'basic', 'collaboration'].includes(family), 'Select slim, basic, or collaboration initialization')
const modes = family === 'collaboration' ? ['plugin'] : ['plugin', 'preset']
const slug = (mode) => (family === 'collaboration' ? 'univer-pro-collaboration' : `${family}-via-${mode}`)
const port = Number(process.env.SHOWCASE_PORT || 4426)
const out = path.resolve(process.env.SHOWCASE_RESULTS_DIR || `test-results/sheets-${family}-previews`)
await fs.mkdir(out, { recursive: true })
const sources = (
  await Promise.all(
    modes.flatMap((mode) =>
      (family === 'collaboration'
        ? ['create-demo.ts', 'data.ts', 'function.ts', 'config.ts']
        : ['create-demo.ts', 'data.ts']
      ).map((n) => fs.readFile(`showcase/sheets/${slug(mode)}/code/${n}`, 'utf8')),
    ),
  )
).join('\n')
const deps = [
  ...new Set(
    [...sources.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
      .map((m) => m[1])
      .filter((n) => !n.endsWith('.css')),
  ),
]
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  appType: 'custom',
  cacheDir: path.join(out, '.vite'),
  server: { host: '127.0.0.1', port, strictPort: true, watch: { ignored: ['**/.next/**'] } },
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client', 'next-themes', ...deps],
  },
  oxc: { jsx: { runtime: 'automatic' } },
  plugins: [
    {
      name: 'slim-previews',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?')) return next()
          const q = new URL(req.url, 'http://localhost').searchParams
          const mode = q.get('mode') === 'plugin' ? 'plugin' : 'preset'
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${q.get('locale') === 'zh-CN' ? 'zh-CN' : 'en-US'}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}</style></head><body><div id="app"></div><script type="module" src="/${mode}.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (['/plugin.jsx', '/preset.jsx'].includes(id)) return '\0' + id
      },
      load(id) {
        if (!['\0/plugin.jsx', '\0/preset.jsx'].includes(id)) return
        const mode = id.includes('plugin') ? 'plugin' : 'preset'
        return `import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/sheets/${slug(mode)}/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const results = []
try {
  for (const mode of modes)
    for (const locale of ['en-US', 'zh-CN']) {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
      page.setDefaultTimeout(20000)
      const r = {
        family,
        mode,
        locale,
        passed: false,
        errors: [],
        networkWrites: [],
        backendRequests: [],
        webSockets: [],
      }
      results.push(r)
      page.on('pageerror', (e) => r.errors.push(e.message))
      page.on('console', (m) => {
        if (m.type() === 'error') r.errors.push(m.text())
      })
      page.on('request', (request) => {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) r.networkWrites.push(request.url())
        if (/universer-api|univer\.plus|https:\/\/univer\.ai/.test(request.url())) r.backendRequests.push(request.url())
      })
      page.on('websocket', (socket) => {
        const url = new URL(socket.url())
        const viteHmr = url.host === `127.0.0.1:${port}` && url.pathname === '/' && url.searchParams.has('token')
        if (!viteHmr) r.webSockets.push(socket.url())
      })
      try {
        await page.goto(`http://127.0.0.1:${port}/?mode=${mode}&locale=${locale}`, { timeout: 180000 })
        const root = page.locator(
          family === 'collaboration'
            ? '.collaboration-demo'
            : family === 'slim'
              ? `.slim-${mode}`
              : `.basic-${mode}-editor`,
        )
        if (family !== 'slim') await root.locator(':scope[data-ready=true]').waitFor({ timeout: 120000 })
        if (family === 'collaboration') assert.equal(await root.getAttribute('data-mode'), 'local-fallback')
        await root.locator('input.univer-size-full').first().waitFor({ timeout: 120000 })
        assert.equal(await root.evaluate((e) => getComputedStyle(e).fontFamily), 'Arial, sans-serif')
        assert.equal(
          await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
          'rgb(255, 255, 255)',
        )
        assert.equal(
          await page.evaluate(() => window.univerAPI.getCurrentLocale()),
          locale === 'zh-CN' ? 'zhCN' : 'enUS',
        )
        await root
          .locator(
            `[data-u-comp="${family === 'slim' && mode === 'plugin' ? 'ribbon-toolbar' : 'ribbon-grid-toolbar'}"]`,
          )
          .waitFor()
        const cell = family === 'collaboration' ? 'B15' : family === 'basic' ? 'B50' : 'B4'
        const name = root.locator('input.univer-size-full').first()
        await name.click()
        await name.fill(cell)
        await name.press('Enter')
        await page.waitForFunction(
          () =>
            document.activeElement?.getAttribute('contenteditable') === 'true' &&
            document.getSelection().rangeCount > 0,
        )
        await page.keyboard.type('73')
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          (address) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(address).getRawValue() === 73,
          cell,
        )
        if (family === 'basic') {
          await name.click()
          await name.fill('C50')
          await name.press('Enter')
          await page.waitForFunction(
            () =>
              document.activeElement?.getAttribute('contenteditable') === 'true' &&
              document.getSelection().rangeCount > 0,
          )
          await page.keyboard.type('=B50*2')
          await page.keyboard.press('Enter')
          await page.waitForFunction(
            () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C50').getRawValue() === 146,
          )
          r.nativeFormula = true
        }
        const snapshot = await page.evaluate(() => {
          window.originalOwner = window.univerAPI
          return window.univerAPI.getActiveWorkbook().save()
        })
        r.nativeInput = true
        for (const theme of ['dark', 'light']) {
          await page.evaluate((value) => {
            localStorage.setItem('theme', value)
            window.dispatchEvent(
              new StorageEvent('storage', { key: 'theme', newValue: value, storageArea: localStorage }),
            )
          }, theme)
          await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
          await page.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          )
          assert.equal(await page.evaluate(() => window.originalOwner === window.univerAPI), true)
          assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveWorkbook().save()), snapshot)
          await root.screenshot({ path: path.join(out, `${mode}-${locale}-${theme}.png`) })
        }
        r.fullSnapshotSameOwner = true
        if (family === 'basic') {
          await name.click()
          await name.fill('C50')
          await name.press('Enter')
          await page.keyboard.press('Control+z')
          await page.waitForFunction(
            () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C50').getFormula() === '',
          )
          await page.keyboard.press('Control+y')
          await page.waitForFunction(
            () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C50').getRawValue() === 146,
          )
          r.nativeHistoryAfterThemes = true
          await page.getByRole('tab', { name: locale === 'zh-CN' ? '数据' : 'Data', exact: true }).click()
          await page.locator('[data-u-command="ui.operation.open-find-dialog"]').click()
          await page.getByPlaceholder(locale === 'zh-CN' ? '输入查找内容' : 'Find', { exact: true }).waitFor()
          r.nativeFindLocale = true
          await page.keyboard.press('Escape')
        }
        await page.evaluate(() => window.unmountPreview())
        await page.waitForTimeout(300)
        assert.equal(await root.count(), 0)
        assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
        assert.deepEqual(r.errors, [])
        assert.deepEqual(r.networkWrites, [])
        if (family === 'collaboration') {
          assert.deepEqual(r.backendRequests, [])
          assert.deepEqual(r.webSockets, [])
        }
        r.unmount = true
        r.passed = true
      } catch (error) {
        r.failure = error.stack
        await page.screenshot({ path: path.join(out, `${mode}-${locale}-failure.png`) }).catch(() => {})
      } finally {
        await page.close()
        await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(results, null, 2))
      }
    }
} finally {
  await browser.close()
  await server.close()
}
console.log(JSON.stringify(results, null, 2))
assert.ok(results.every((r) => r.passed))
