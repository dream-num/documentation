/* eslint-disable no-await-in-loop -- Each language and story owns one native editor at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const slugs = ['docs-modern/incident-postmortem', 'docs-modern/product-brief', 'docs-modern/company-knowledge-base']
const sources = (await readShowcaseSources()).filter(({ slug }) => slugs.includes(slug))
assert.equal(sources.length, slugs.length)
const dependencies = [
  ...new Set(
    sources.flatMap(({ files }) =>
      Object.entries(files)
        .filter(([name]) => name.startsWith('/src/') && /\.[jt]sx?$/.test(name))
        .flatMap(([, source]) =>
          [...source.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
            .map((match) => match[1])
            .filter((name) => !name.endsWith('.css')),
        ),
    ),
  ),
]
assert.ok(process.env.SHOWCASE_VITE_MODULE, 'Pass the installed Vite module path')
const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-story-previews')
await fs.mkdir(output, { recursive: true })
const port = Number(process.env.SHOWCASE_PORT || 4426)
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  appType: 'custom',
  cacheDir: path.join(output, '.vite'),
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
      name: 'selected-modern-story-previews',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?')) return next()
          const query = new URL(req.url, 'http://localhost').searchParams
          const index = Number(query.get('story'))
          if (!Number.isInteger(index) || !slugs[index]) {
            res.statusCode = 400
            res.end()
            return
          }
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${query.get('locale') === 'zh-CN' ? 'zh-CN' : 'en-US'}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}</style></head><body><div id="app"></div><script type="module" src="/story-${index}.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (/^\/story-[0-2]\.jsx$/.test(id)) return '\0' + id
      },
      load(id) {
        const match = /^\0\/story-([0-2])\.jsx$/.exec(id)
        if (!match) return
        return `import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/${slugs[Number(match[1])]}/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const results = []
try {
  for (const [index, slug] of slugs.entries())
    for (const locale of ['en-US', 'zh-CN']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
      page.setDefaultTimeout(30000)
      const result = { slug, locale, passed: false, errors: [], networkWrites: [], documents: [] }
      results.push(result)
      page.on('pageerror', (error) => result.errors.push(error.stack || error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') result.errors.push(message.text())
      })
      page.on('request', (request) => {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.networkWrites.push(request.url())
      })
      const snapshot = () => page.evaluate(() => window.univerAPI.getActiveDocument().save())
      const settle = () =>
        page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      try {
        await page.goto(`http://127.0.0.1:${port}/?story=${index}&locale=${locale}`, { timeout: 120000 })
        await page.waitForFunction(
          () =>
            window.univerAPI?.getActiveDocument() &&
            window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
        )
        await page.waitForFunction(() => !document.querySelector('[data-u-comp="workbench-skeleton-content"]'))
        await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
        await page.evaluate(() => {
          window.storyOwner = window.univerAPI
        })
        const pages = slug.endsWith('company-knowledge-base') ? ['handbook', 'api', 'legacy'] : [null]
        const saved = new Map()
        for (const id of pages) {
          if (id) await page.locator(`.knowledge-navigation [data-page="${id}"]`).click()
          await settle()
          const original = await snapshot()
          await page.mouse.dblclick(650, 235)
          await page.keyboard.press('Control+Home')
          const marker = `Reviewed ${id || 'report'} `
          await page.keyboard.type(marker)
          await page.waitForFunction(
            (value) => window.univerAPI.getActiveDocument().save().body.dataStream.includes(value),
            marker,
          )
          await page.keyboard.press('Escape')
          await settle()
          const edited = await snapshot()
          assert.equal(
            edited.body.dataStream.replace(marker, ''),
            original.body.dataStream,
            'Native input preserves all original story text',
          )
          saved.set(id, edited)
          result.documents.push({ id: edited.id, nativeInput: true, originalTextPreserved: true })
        }
        for (const theme of ['dark', 'light']) {
          await page.evaluate((value) => {
            localStorage.setItem('theme', value)
            window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value }))
          }, theme)
          await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
          await settle()
          for (const id of pages) {
            if (id) await page.locator(`.knowledge-navigation [data-page="${id}"]`).click()
            await settle()
            assert.deepEqual(
              await snapshot(),
              saved.get(id),
              'Complete edited document survives theme changes and page navigation',
            )
            assert.ok(
              await page.evaluate(() => window.storyOwner === window.univerAPI),
              'Preview must retain its owner',
            )
          }
          await page.screenshot({ path: path.join(output, `${slug.split('/')[1]}-${locale}-${theme}.png`) })
        }
        await page.evaluate(() => window.unmountPreview())
        await page.waitForFunction(
          () => window.univerAPI === undefined && document.querySelectorAll('canvas').length === 0,
        )
        await settle()
        assert.deepEqual(result.errors, [])
        assert.deepEqual(result.networkWrites, [])
        result.passed = true
      } catch (error) {
        result.failure = error.stack || String(error)
        await page
          .screenshot({ path: path.join(output, `${slug.split('/')[1]}-${locale}-failure.png`) })
          .catch(() => {})
      } finally {
        await page.close()
        await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(results, null, 2))
        console.log(JSON.stringify(result))
      }
    }
} finally {
  await browser.close()
  await server.close()
}
assert.ok(
  results.every(({ passed }) => passed),
  'Every selected story Preview must preserve native edits and release its owner',
)
