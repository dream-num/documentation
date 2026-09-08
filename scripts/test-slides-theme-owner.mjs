/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const slug = 'theme-and-background'
const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-theme-owner')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(
    ['create-demo.ts', 'data.ts'].map((name) => fs.readFile('showcase/slides/' + slug + '/code/' + name, 'utf8')),
  )
).join('\n')
const dependencies = [
  ...new Set(
    [...sources.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
      .map((match) => match[1])
      .filter((name) => !name.endsWith('.css')),
  ),
]
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  appType: 'custom',
  cacheDir: path.join(directory, '.vite'),
  server: { host: '127.0.0.1', port: 4427, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
      name: 'selected-docblock-theme',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?locale=')) return next()
          const locale = new URL(req.url, 'http://localhost').searchParams.get('locale')
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${locale === 'zh-CN' ? 'zh-CN' : 'en-US'}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}.min-h-0{min-height:0}</style></head><body><div id="app"></div><script type="module" src="/docblock-theme.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (id === '/docblock-theme.jsx') return '\0docblock-theme.jsx'
      },
      load(id) {
        if (id !== '\0docblock-theme.jsx') return
        return `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ThemeProvider} from 'next-themes'; import Preview from '/showcase/slides/${slug}/preview/main.tsx'; const root=createRoot(document.getElementById('app')); root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview))); window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const report = { passed: false, locales: [], errors: [], networkWrites: [] }
page.on('pageerror', (e) => report.errors.push(e.message))
page.on('console', (e) => {
  if (e.type() === 'error') report.errors.push(e.text())
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) report.networkWrites.push(r.url())
})
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto('http://127.0.0.1:4427/?locale=' + locale, { timeout: 180000 })
    await page.locator('.slide-theme-demo[data-ready=true]').waitFor({ timeout: 120000 })
    await page.evaluate(() => {
      window.__owner = window.univerAPI
    })
    const notes = page.locator('textarea').first()
    await notes.fill('Edited native notes / retained theme owner')
    await page.getByRole('button', { name: locale === 'zh-CN' ? '保存' : 'Save', exact: true }).click()
    const edited = await page.evaluate(() => window.univerAPI.getActivePresentation().save())
    assert.equal(edited.slides.opening.speakerNotes, 'Edited native notes / retained theme owner')
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        localStorage.setItem('theme', value)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value, storageArea: localStorage }))
      }, theme)
      await page.waitForFunction((value) => document.documentElement.classList.contains(value), theme)
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      assert.equal(await page.evaluate(() => window.__owner === window.univerAPI), true)
      assert.deepEqual(await page.evaluate(() => window.univerAPI.getActivePresentation().save()), edited)
      await page.screenshot({ path: path.join(directory, locale + '-' + theme + '.png') })
    }
    await page.evaluate(() => window.unmountPreview())
    await page.waitForFunction(() => !window.univerAPI && !document.querySelector('.slide-theme-demo'))
    report.locales.push({ locale, nativeNotes: true, ownerAndFullSnapshot: true, teardown: true })
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.networkWrites, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS actual Slides Preview theme owner')
