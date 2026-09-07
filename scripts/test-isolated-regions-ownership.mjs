/* eslint-disable no-await-in-loop -- Parent unmount/remount cycles must be observed in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(
  process.env.SHOWCASE_VITE_MODULE ? pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href : 'vite'
)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/isolated-regions-ownership')
await fs.mkdir(directory, { recursive: true })
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  cacheDir: path.join(directory, '.vite'),
  appType: 'custom',
  server: { host: '127.0.0.1', port: 4184, strictPort: true },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
      '@univerjs/core',
      '@univerjs/presets',
      '@univerjs/preset-sheets-core',
      '@univerjs/preset-sheets-core/locales/en-US',
      '@univerjs/sheets/facade',
      '@univerjs/engine-formula/facade',
    ],
  },
  oxc: { jsx: { runtime: 'automatic' } },
  plugins: [
    {
      name: 'regional-owner-probe',
      configureServer(vite) {
        vite.middlewares.use((request, response, next) => {
          if (new URL(request.url, 'http://127.0.0.1:4184').pathname !== '/') return next()
          response.setHeader('Content-Type', 'text/html')
          response.end(
            '<html><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="test-root"></div><script type="module" src="/regional-owner-probe.jsx"></script></body></html>',
          )
        })
      },
      resolveId(id) {
        if (id === '/regional-owner-probe.jsx') return '\0regional-owner-probe.jsx'
      },
      load(id) {
        if (id !== '\0regional-owner-probe.jsx') return
        return `import React,{StrictMode,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Univer} from '@univerjs/core';
const stats=[]; const seen=new WeakSet(); const register=Univer.prototype.registerPlugin;
Univer.prototype.registerPlugin=function(...args){
  if(!seen.has(this)){seen.add(this);const entry={disposed:false};stats.push(entry);this.onDispose(()=>{entry.disposed=true});}
  return register.apply(this,args);
};
window.probe={stats,retained:[]};
const {default:Preview}=await import('/showcase/embed/multiple-isolated-instances/preview/main.tsx');
const style=document.createElement('style');style.textContent='.h-full{height:100%}.min-h-0{min-height:0}';document.head.append(style);
function Host(){const [mounted,setMounted]=useState(true);window.probe.setMounted=setMounted;return React.createElement('div',{id:'preview',style:{height:'950px'}},mounted&&React.createElement(Preview));}
createRoot(document.getElementById('test-root')).render(React.createElement(StrictMode,null,React.createElement(Host)));`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } })
const report = { passed: false, cycles: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
async function ready() {
  await page.waitForFunction(
    () => {
      const frames = [...document.querySelectorAll('#preview iframe[data-region]')]
      return (
        frames.length === 2 &&
        frames.every((frame) => {
          const child = frame.contentWindow
          return (
            child?.probe?.stats.filter((owner) => !owner.disposed).length === 1 &&
            child.document.querySelector('.isolated-region')?.dataset.ready === 'true'
          )
        })
      )
    },
    undefined,
    { timeout: 120000 },
  )
}
try {
  await page.goto('http://127.0.0.1:4184/', { waitUntil: 'domcontentloaded', timeout: 180000 })
  await ready()
  assert.equal(await page.evaluate(() => window.probe.stats.length), 0, 'Parent must own no SDK editor')
  for (const pendingAction of [null, 'write', 'dispose', 'reset']) {
    await page.evaluate((pending) => {
      const frames = [...document.querySelectorAll('#preview iframe[data-region]')]
      window.probe.retained = frames.map((frame) => frame.contentWindow.probe.stats)
      if (pending) {
        const child = frames[0].contentWindow
        const input = child.document.querySelector('.region-controls input')
        input.value = '41.25'
        input.dispatchEvent(new child.Event('input', { bubbles: true }))
        child.document.querySelector(`[data-action="${pending}"]`).click()
        window.probe.wasBusy = child.document.querySelector('.isolated-region').dataset.ready === 'false'
      }
      window.probe.setMounted(false)
    }, pendingAction)
    if (pendingAction)
      assert.equal(
        await page.evaluate(() => window.probe.wasBusy),
        true,
        `${pendingAction} must still be pending at parent teardown`,
      )
    await page.waitForFunction(
      () => window.probe.retained.every((stats) => stats.every((owner) => owner.disposed)),
      undefined,
      { timeout: 15000 },
    )
    assert.equal(await page.locator('#preview iframe').count(), 0)
    const owners = await page.evaluate(() => window.probe.retained)
    report.cycles.push({ pendingAction, owners })
    await page.evaluate(() => window.probe.setMounted(true))
    await ready()
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (cause) {
  report.failure = cause.stack || String(cause)
  report.retained = await page.evaluate(() => window.probe?.retained).catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
  await server.close()
}
assert.ok(report.passed, report.failure)
