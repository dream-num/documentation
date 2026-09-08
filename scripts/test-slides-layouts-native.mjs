/* eslint-disable no-await-in-loop -- Each native slide and locale is inspected sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

assert.ok(process.env.SHOWCASE_VITE_MODULE, 'Set SHOWCASE_VITE_MODULE to the selected Vite runtime dist/node/index.js')
const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-layouts-native')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(
    ['create-demo.ts', 'data.ts'].map((name) =>
      fs.readFile('showcase/slides/layouts-and-placeholders/code/' + name, 'utf8'),
    ),
  )
).join('\n')
const dependencies = [
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
  cacheDir: path.join(directory, '.vite'),
  server: { host: '127.0.0.1', port: 4429, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
      name: 'selected-layout-preview',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?locale=')) return next()
          const locale = new URL(req.url, 'http://localhost').searchParams.get('locale') === 'zh-CN' ? 'zh-CN' : 'en-US'
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${locale}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}.min-h-0{min-height:0}</style></head><body><div id="app"></div><script type="module" src="/layout-theme.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (id === '/layout-theme.jsx') return '\0layout-theme.jsx'
      },
      load(id) {
        if (id !== '\0layout-theme.jsx') return
        return `import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/slides/layouts-and-placeholders/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const results = []
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
    page.setDefaultTimeout(30000)
    const result = { locale, passed: false, errors: [], pages: [] }
    results.push(result)
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.addInitScript(() => {
      window.paintPoints = []
      const original = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (...args) {
        const bounds = this.canvas.getBoundingClientRect()
        const p = this.getTransform().transformPoint({ x: args[1], y: args[2] })
        if (bounds.width > 800)
          window.paintPoints.push({
            text: String(args[0]),
            x: bounds.x + (p.x * bounds.width) / this.canvas.width,
            y: bounds.y + (p.y * bounds.height) / this.canvas.height,
          })
        return Reflect.apply(original, this, args)
      }
    })
    const snapshot = () => page.evaluate(() => window.univerAPI.getActivePresentation().save())
    try {
      await page.goto('http://127.0.0.1:4429/?locale=' + locale, { timeout: 180000 })
      await page.waitForFunction(
        () => document.querySelector('.slide-layout')?.dataset.ready === 'true',
        {},
        { timeout: 120000 },
      )
      await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
      assert.equal(
        await page.locator('.slide-layout').evaluate((el) => getComputedStyle(el).fontFamily),
        'Arial, sans-serif',
      )
      assert.equal(
        await page
          .locator(
            '.slide-layout > fieldset,.slide-layout > details,.slide-layout > output,.slide-layout [data-action]',
          )
          .count(),
        0,
      )
      const original = await snapshot()
      assert.equal(original.slideOrder.length, 8)
      assert.equal(new Set(Object.values(original.slides).map((slide) => slide.layoutPageId)).size, 7)
      const thumbnail = (id) => page.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${id}"]`)
      await thumbnail('closing').click()
      for (const id of original.slideOrder) {
        await page.evaluate(() => {
          window.paintPoints = []
        })
        await thumbnail(id).click()
        await page.waitForFunction(
          (pageId) => window.univerAPI.getActivePresentation().getActiveSlide().getId() === pageId,
          id,
        )
        await page.waitForFunction(() => window.paintPoints.length > 0)
        const text = await page.evaluate(() =>
          window.paintPoints
            .map((p) => p.text)
            .join('')
            .replace(/\s/g, ''),
        )
        assert.ok(text.includes(original.slides[id].elements.title.text.replace(/\s/g, '')), id + ' title is painted')
        assert.ok(text.includes('ASTER/Communityradio/Volunteeredition'), id + ' inherited master footer is painted')
        result.pages.push(id)
        await page.screenshot({ path: path.join(directory, `${locale}-${id}.png`) })
      }
      await page.evaluate(() => {
        window.paintPoints = []
      })
      await thumbnail('opening').click()
      await page.waitForFunction(() => window.univerAPI.getActivePresentation().getActiveSlide().getId() === 'opening')
      // Fixed-viewport coordinates verified in the native screenshot; revisiting a slide may reuse its texture.
      await page.mouse.dblclick(570, 346)
      await page.locator('[data-u-comp="shape-text-editor-content"]').filter({ visible: true }).waitFor()
      await page.keyboard.press('Control+End')
      await page.keyboard.type(' / Retained')
      await page.mouse.click(1350, 770)
      await thumbnail('schedule').click()
      await page.waitForFunction(() =>
        JSON.stringify(window.univerAPI.getActivePresentation().save().slides.opening.elements.title).includes(
          'Retained',
        ),
      )
      await thumbnail('opening').click()
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      result.nativePlaceholderEdit = true
      const edited = await snapshot()
      await page.evaluate(() => {
        window.originalAPI = window.univerAPI
        window.originalRoot = document.querySelector('.slide-layout')
      })
      for (const theme of ['dark', 'light']) {
        await page.evaluate((value) => {
          localStorage.setItem('theme', value)
          window.dispatchEvent(
            new StorageEvent('storage', { key: 'theme', newValue: value, storageArea: localStorage }),
          )
        }, theme)
        await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        assert.equal(
          await page.evaluate(
            () =>
              window.originalAPI === window.univerAPI &&
              window.originalRoot === document.querySelector('.slide-layout'),
          ),
          true,
        )
        assert.deepEqual(await snapshot(), edited)
        await page.screenshot({ path: path.join(directory, `${locale}-edited-${theme}.png`) })
      }
      result.fullEditedSnapshotAndOwnerPreserved = true
      await page.evaluate(() => window.unmountPreview())
      await page.waitForTimeout(250)
      assert.equal(await page.locator('.slide-layout').count(), 0)
      assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
      assert.deepEqual(result.errors, [])
      result.passed = true
    } catch (error) {
      result.failure = error.stack
      await page.screenshot({ path: path.join(directory, `${locale}-failure.png`) }).catch(() => {})
    } finally {
      await page.close()
      await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(results, null, 2))
    }
  }
} finally {
  await browser.close()
  await server.close()
}
console.log(JSON.stringify(results))
assert.ok(results.every((result) => result.passed))
