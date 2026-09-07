/* eslint-disable no-await-in-loop -- Check bootstrap, hydration and replacement in browser order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

const { ThemeProvider } = createRequire(import.meta.url)('next-themes')

const { createServer } = await import(
  process.env.SHOWCASE_VITE_MODULE ? pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href : 'vite'
)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/theme-script')
await fs.mkdir(directory, { recursive: true })
const props = { attribute: 'class', defaultTheme: 'system', enableSystem: true, scriptProps: { id: 'theme-bootstrap' } }
const children = [
  createElement('button', { id: 'toggle', key: 'toggle' }, 'Toggle theme'),
  createElement('output', { id: 'theme-state', key: 'state' }),
]
const report = { passed: false, checks: [], errors: [], recoverable: [] }
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  cacheDir: path.join(directory, '.vite'),
  appType: 'custom',
  server: { host: '127.0.0.1', port: 4248, strictPort: true },
  optimizeDeps: { noDiscovery: true, include: ['react', 'react-dom/client', 'next-themes'] },
  plugins: [
    {
      name: 'theme-script-regression',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?')) return next()
          const params = new URL(req.url, 'http://localhost').searchParams
          const hydrate = params.get('mode') !== 'client'
          const options = { ...props, ...(params.get('forced') ? { forcedTheme: params.get('forced') } : {}) }
          const markup = hydrate ? renderToString(createElement(ThemeProvider, options, ...children)) : ''
          if (hydrate) assert.match(markup, /id="theme-bootstrap"/, 'SSR must retain its no-flash bootstrap')
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<!doctype html><html><head><link rel="icon" href="data:,"></head><body><div id="root">${markup}</div><script type="module" src="/theme-harness.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (id === '/theme-harness.jsx') return id
      },
      load(id) {
        if (id !== '/theme-harness.jsx') return
        return `import React, { useEffect, useState } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { ThemeProvider, useTheme } from 'next-themes';
const e = React.createElement;
const params = new URL(location.href).searchParams;
const props = ${JSON.stringify(props)};
if (params.get('forced')) props.forcedTheme = params.get('forced');
function Probe() {
  const { resolvedTheme, theme, forcedTheme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return [
    e('button', { id: 'toggle', key: 'toggle', onClick: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark') }, 'Toggle theme'),
    e('output', { id: 'theme-state', key: 'state' }, ready ? JSON.stringify({ resolvedTheme, theme, forcedTheme }) : '')
  ];
}
function App() { return e(ThemeProvider, props, e(Probe)); }
const target = document.getElementById('root');
window.themeRecoverable = [];
const options = { onRecoverableError: error => window.themeRecoverable.push(String(error)) };
let root = params.get('mode') === 'client' ? createRoot(target, options) : hydrateRoot(target, e(App), options);
if (params.get('mode') === 'client') root.render(e(App));
window.replaceThemeOwner = () => { root.unmount(); root = createRoot(target, options); root.render(e(App)); };
window.removeThemeOwner = () => root.unmount();
`
      },
    },
  ],
})
const browser = await chromium.launch()
try {
  await server.listen()
  for (const scenario of [
    { mode: 'hydrate', system: 'light', saved: 'dark', expected: 'dark' },
    { mode: 'hydrate', system: 'dark', saved: null, expected: 'dark' },
    { mode: 'hydrate', system: 'dark', saved: 'light', expected: 'light' },
    { mode: 'hydrate', system: 'light', saved: 'dark', forced: 'light', expected: 'light' },
    { mode: 'client', system: 'light', saved: 'dark', expected: 'dark' },
  ]) {
    const context = await browser.newContext({ colorScheme: scenario.system })
    try {
      await context.addInitScript((saved) => {
        if (saved === null) localStorage.removeItem('theme')
        else localStorage.setItem('theme', saved)
      }, scenario.saved)
      const page = await context.newPage()
      page.on('pageerror', (error) => report.errors.push(String(error)))
      page.on('console', (message) => {
        if (message.type() === 'error') report.errors.push(message.text())
      })
      let release
      const gate = new Promise((resolve) => {
        release = resolve
      })
      await page.route('**/theme-harness.jsx', async (route) => {
        await gate
        await route.continue()
      })
      await page.goto(`http://127.0.0.1:4248/?mode=${scenario.mode}&forced=${scenario.forced || ''}`, {
        waitUntil: 'commit',
      })
      if (scenario.mode === 'hydrate') {
        await page.locator('#theme-bootstrap').waitFor({ state: 'attached' })
        assert.equal(
          await page.locator('html').getAttribute('class'),
          scenario.expected,
          'Theme before any hydration JS',
        )
        assert.equal(await page.locator('html').evaluate((node) => node.style.colorScheme), scenario.expected)
      }
      release()
      await page.waitForFunction(() => document.querySelector('#theme-state')?.textContent)
      await page.waitForFunction((expected) => document.documentElement.className === expected, scenario.expected)
      await page.waitForFunction(() => !document.querySelector('#theme-bootstrap'))
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.evaluate(() => window.replaceThemeOwner())
        await page.waitForFunction(() => document.querySelector('#theme-state')?.textContent)
        assert.equal(await page.locator('#theme-bootstrap').count(), 0, 'Client-only mounts insert no inert bootstrap')
        assert.equal(await page.locator('html').getAttribute('class'), scenario.expected)
      }
      if (!scenario.forced) {
        const next = scenario.expected === 'dark' ? 'light' : 'dark'
        await page.locator('#toggle').click()
        await page.waitForFunction((expected) => document.documentElement.className === expected, next)
        assert.equal(await page.evaluate(() => localStorage.getItem('theme')), next)
        await page.evaluate(() => {
          localStorage.setItem('theme', 'system')
          window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'system' }))
        })
        await page.emulateMedia({ colorScheme: 'dark' })
        await page.waitForFunction(() => document.documentElement.className === 'dark')
        await page.emulateMedia({ colorScheme: 'light' })
        await page.waitForFunction(() => document.documentElement.className === 'light')
      }
      report.recoverable.push(...(await page.evaluate(() => window.themeRecoverable)))
      await page.evaluate(() => window.removeThemeOwner())
      assert.equal(await page.locator('#root').textContent(), '')
      report.checks.push(scenario)
    } finally {
      await context.close()
    }
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.recoverable, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server.close()
}
console.log(JSON.stringify(report))
assert.ok(
  report.passed,
  'Theme bootstrap, hydration and client replacement must remain correct without suppressing errors',
)
