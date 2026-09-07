/* eslint-disable no-await-in-loop -- Isolation operations depend on their preceding snapshots. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

// SDK feasibility check, not a registered or completed Showcase capability.
// Use distinct unit IDs by default; opt into duplicate IDs only as a negative control.
const duplicateIds = process.env.SHOWCASE_DUPLICATE_UNIT_IDS === '1'
const isolatedFrames = process.env.SHOWCASE_ISOLATION_FRAMES === '1'
const { createServer } = await import(
  process.env.SHOWCASE_VITE_MODULE ? pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href : 'vite'
)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/instance-isolation')
await fs.mkdir(directory, { recursive: true })
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  cacheDir: path.join(directory, '.vite'),
  appType: 'custom',
  server: { host: '127.0.0.1', port: 4183, strictPort: true },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      '@univerjs/core',
      '@univerjs/presets',
      '@univerjs/preset-sheets-core',
      '@univerjs/preset-sheets-core/locales/en-US',
      '@univerjs/sheets/facade',
      '@univerjs/engine-formula/facade',
    ],
  },
  plugins: [
    {
      name: 'two-real-sdk-owners',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          const requestUrl = new URL(req.url, 'http://127.0.0.1:4183')
          if (requestUrl.pathname !== '/') return next()
          const region = requestUrl.searchParams.get('region')
          if (region && !['north', 'south'].includes(region)) {
            res.statusCode = 400
            res.end('Unknown region')
            return
          }
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html><body style="margin:0"><main style="display:grid;grid-template-columns:${region ? '1fr' : '1fr 1fr'};gap:12px">${region ? `<section id="${region}" style="height:900px;min-width:0"></section>` : isolatedFrames ? '' : '<section id="north" style="height:900px;min-width:0"></section><section id="south" style="height:900px;min-width:0"></section>'}</main><script type="module" src="/isolation-harness.js"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (id === '/isolation-harness.js') return '\0isolation-harness.js'
      },
      load(id) {
        if (id !== '\0isolation-harness.js') return
        return `import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US';
import { createUniver, LocaleType } from '@univerjs/presets';
import '@univerjs/preset-sheets-core/lib/index.css';
import '@univerjs/sheets/facade';
import '@univerjs/engine-formula/facade';
import { createRoutes } from '/showcase/embed/lazy-load-editor/code/data.ts';
function createEditor(container, fixture, darkMode) {
  const {univer, univerAPI} = createUniver({darkMode, locale:LocaleType.EN_US, locales:{[LocaleType.EN_US]:sheetsCoreEnUS}, presets:[UniverSheetsCorePreset({container, ribbonType:'grid'})]});
  const data = createRoutes(fixture);
  if (!${duplicateIds}) data.id += '-' + container.id;
  let lifecycle;
  const rendered = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Rendered deadline')), 10000);
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({stage}) => {
      if (stage >= univerAPI.Enum.LifecycleStages.Rendered) { clearTimeout(timer); lifecycle.dispose(); resolve(); }
    });
  });
  const workbook = univerAPI.createWorkbook(data);
  const sheet = () => workbook.getSheetBySheetId('routes');
  return {
    ready: rendered.then(() => univerAPI.getFormula().onCalculationResultApplied(10000)),
    read: () => ({runs:sheet().getRange('C4').getValue(), weeklyCost:sheet().getRange('F18').getDisplayValue(), snapshot:workbook.save()}),
    select: () => sheet().getRange('C4').activate(),
    async setRuns(value) { sheet().getRange('C4').setValue(value); await univerAPI.getFormula().onCalculationResultApplied(10000); },
    async dispose() { try { await univerAPI.getFormula().onCalculationResultApplied(10000); } finally { univer.dispose(); } },
  };
}
${
  isolatedFrames
    ? `
const region = new URLSearchParams(location.search).get('region');
if (region) {
  const mount = () => createEditor(document.getElementById(region), region === 'north' ? 'default' : 'boundary', region === 'south');
  window.owner = mount();
  window.resetOwner = async () => { await window.owner.dispose(); window.owner = mount(); await window.owner.ready; };
} else {
  const frames = {};
  await Promise.all(['north', 'south'].map(region => new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.id = region;
    frame.title = region + ' isolated editor';
    frame.style.cssText = 'width:100%;height:900px;border:0;min-width:0';
    frames[region] = frame;
    const timer = setTimeout(() => reject(new Error(region + ' iframe readiness deadline')), 120000);
    frame.onload = async () => { try { await frame.contentWindow.owner.ready; resolve(); } catch(error) { reject(error); } finally { clearTimeout(timer); } };
    frame.src = '/?region=' + region;
    document.querySelector('main').append(frame);
  })));
  window.isolation = {
    get north() { return frames.north.contentWindow.owner; },
    get south() { return frames.south.contentWindow.owner; },
    resetSouth: () => frames.south.contentWindow.resetOwner(),
    ready: true,
  };
}
`
    : `const north = createEditor(document.getElementById('north'), 'default', false, () => {});
let south = createEditor(document.getElementById('south'), 'boundary', true, () => {});
window.isolation = {
  north,
  get south() { return south },
  async resetSouth() {
    await south.dispose();
    south = createEditor(document.getElementById('south'), 'boundary', true, () => {});
    await south.ready;
  },
};
await Promise.all([north.ready, south.ready]);
window.isolation.ready = true;`
}`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1000 }, colorScheme: 'light' })
page.setDefaultTimeout(45000)
const report = { duplicateIds, isolatedFrames, passed: false, checks: [], errors: [] }
const surface = (side) => (isolatedFrames ? page.frameLocator(`#${side}`) : page.locator(`#${side}`))
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const read = () => page.evaluate(() => ({ north: window.isolation.north.read(), south: window.isolation.south.read() }))
try {
  await page.goto('http://127.0.0.1:4183/', { waitUntil: 'domcontentloaded', timeout: 180000 })
  await page.waitForFunction(() => window.isolation?.ready, undefined, { timeout: 120000 })
  const initial = await read()
  report.initial = initial
  assert.equal(initial.north.runs, 6)
  assert.equal(initial.south.runs, 0)
  assert.notEqual(initial.north.weeklyCost, initial.south.weeklyCost)
  if (duplicateIds) assert.equal(initial.north.snapshot.id, initial.south.snapshot.id)
  else assert.notEqual(initial.north.snapshot.id, initial.south.snapshot.id)
  for (const side of ['north', 'south']) await surface(side).locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  report.themes = await Promise.all(
    ['north', 'south'].map((side) =>
      surface(side)
        .locator('[data-u-comp="workbench-layout"]')
        .evaluate((node) => ({
          background: getComputedStyle(node).backgroundColor,
          theme: getComputedStyle(node).getPropertyValue('--univer-gray-0').trim(),
        })),
    ),
  )
  report.themeIsolation =
    report.themes[0].background === 'rgb(255, 255, 255)' && report.themes[1].background !== report.themes[0].background
  await page.screenshot({ path: path.join(directory, 'two-owners.png') })
  await page.evaluate(() => window.isolation.north.setRuns(8))
  let current = await read()
  assert.equal(current.north.runs, 8)
  assert.notEqual(current.north.weeklyCost, initial.north.weeklyCost)
  assert.deepEqual(current.south.snapshot, initial.south.snapshot)
  report.checks.push(
    'Two native Grid owners retain distinct values and calculated totals; a North Facade write leaves the entire South snapshot unchanged',
  )
  const northEdited = current.north.snapshot
  await page.evaluate(() => window.isolation.south.setRuns(12))
  current = await read()
  assert.deepEqual(current.north.snapshot, northEdited)
  assert.equal(current.south.runs, 12)
  const oldSouth = await surface('south').locator('canvas').first().elementHandle()
  await page.evaluate(() => window.isolation.resetSouth())
  assert.equal(await oldSouth.evaluate((node) => node.isConnected), false)
  current = await read()
  assert.deepEqual(current.north.snapshot, northEdited)
  assert.deepEqual(current.south.snapshot, initial.south.snapshot)
  report.checks.push('South editing and exact seeded reset preserve the entire edited North workbook')
  await page.evaluate(() => window.isolation.north.dispose())
  assert.equal(await surface('north').locator('canvas').count(), 0)
  assert.ok((await surface('south').locator('canvas').count()) > 0)
  await page.evaluate(() => window.isolation.south.setRuns(15))
  assert.equal(await page.evaluate(() => window.isolation.south.read().runs), 15)
  await page.evaluate(() => window.isolation.south.select())
  const southCanvas = surface('south')
    .locator('[data-u-comp="render-canvas"]:not(#univer-doc-main-canvas):visible')
    .first()
  await southCanvas.dblclick({ position: { x: 416, y: 111 } })
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText('16')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => window.isolation.south.read().runs === 16)
  await page.keyboard.press('Control+z')
  await page.waitForFunction(() => window.isolation.south.read().runs === 15)
  await page.evaluate(() => window.isolation.south.dispose())
  for (const side of ['north', 'south']) assert.equal(await surface(side).locator('canvas').count(), 0)
  if (isolatedFrames)
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('univer-dark')), false)
  report.checks.push(
    'Disposing North leaves South editable and calculable; disposing South removes its remaining canvases',
  )
  assert.deepEqual(report.errors, [])
  assert.ok(
    report.themeIsolation,
    'Light North and dark South must retain independent native backgrounds; do not count data-only isolation as complete',
  )
  report.passed = true
} catch (cause) {
  report.failure = cause.stack || String(cause)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify({
      ...report,
      initial: report.initial && { north: report.initial.north.weeklyCost, south: report.initial.south.weeklyCost },
    }),
  )
  await browser.close()
  await server.close()
}
assert.ok(report.passed, report.failure)
