/* eslint-disable no-await-in-loop -- Mount, replace and destroy one selected Preview at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

// Use Vite from an exported standalone project's node_modules when it is not installed here.
const { createServer } = await import(
  process.env.SHOWCASE_VITE_MODULE ? pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href : 'vite'
)
const slugs = process.argv.slice(2)
assert.ok(slugs.length, 'Pass explicit showcase slugs; this test never compiles the whole catalog.')
for (const slug of slugs) {
  assert.match(slug, /^[a-z-]+\/[a-z-]+$/)
  await fs.access(`showcase/${slug}/preview/main.tsx`)
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/showcase-ownership')
await fs.mkdir(directory, { recursive: true })
const results = []
const selectedSources = (await readShowcaseSources()).filter(({ slug }) => slugs.includes(slug))
assert.equal(selectedSources.length, slugs.length, 'Select registered demos only')
// Prebundle complete import specifiers together. Omitting facade subpaths can create
// a second FDoc class alongside the preset's optimized copy, invalidating this test.
const dependencies = [
  ...new Set(
    selectedSources.flatMap(({ files }) =>
      Object.entries(files)
        .filter(([name]) => /\.[jt]sx?$/.test(name))
        .flatMap(([, code]) =>
          [...code.matchAll(/^\s*import\s+(?:type\s+)?(?:[\w*$,{}\s]+\s+from\s*)?['"]([^'"]+)['"]/gm)]
            .map((match) => match[1])
            .filter(
              (specifier) => !specifier.startsWith('.') && !specifier.startsWith('/') && !specifier.endsWith('.css'),
            ),
        ),
    ),
  ),
]
let selected = slugs[0]
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  cacheDir: path.join(directory, '.vite'),
  appType: 'custom',
  server: { host: '127.0.0.1', port: 4182, strictPort: true },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
      'next-themes',
      '@univerjs/core',
      ...(slugs.some((slug) =>
        [
          'sheets/find-replace',
          'embed/mount-dispose-remount',
          'embed/lazy-load-editor',
          'embed/univer-events-to-host',
        ].includes(slug),
      )
        ? ['@univerjs/core/facade']
        : []),
      ...(slugs.some((slug) => ['sheets/hyper-link', 'sheets/images', 'sheets/charts'].includes(slug))
        ? ['@univerjs/sheets/facade']
        : []),
      ...dependencies,
    ],
  },
  oxc: { jsx: { runtime: 'automatic' } },
  plugins: [
    {
      name: 'selected-preview-ownership-test',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (req.url !== '/') return next()
          res.setHeader('Content-Type', 'text/html')
          res.end(
            '<html><body><div id="test-root"></div><script type="module" src="/ownership-harness.jsx"></script></body></html>',
          )
        })
      },
      resolveId(id) {
        if (id === '/ownership-harness.jsx') return '\0ownership-harness.jsx'
      },
      load(id) {
        if (id !== '\0ownership-harness.jsx') return
        // Instrument the actual SDK prototype before loading the actual Preview. Nothing is shipped in a demo.
        return `
import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, useTheme } from 'next-themes';
import { AuthzIoLocalService, Univer } from '@univerjs/core';
const owners = [];
const seen = new WeakSet();
const register = Univer.prototype.registerPlugin;
Univer.prototype.registerPlugin = function (...args) {
  if (!seen.has(this)) {
    seen.add(this);
    const entry = { disposed: false };
    owners.push(entry);
    this.onDispose(() => { entry.disposed = true; });
  }
  return register.apply(this, args);
};
window.ownership = { owners, holdPermissions: false, heldPermissions: [] };
${
  ['sheets/read-only', 'sheets/permission'].includes(selected)
    ? `
const updatePermission = AuthzIoLocalService.prototype.update;
AuthzIoLocalService.prototype.update = async function (...args) {
  if (window.ownership.holdPermissions)
    await new Promise(resolve => window.ownership.heldPermissions.push(resolve));
  return updatePermission.apply(this, args);
};`
    : ''
}
const { default: Preview } = await import('/showcase/${selected}/preview/main.tsx');
${
  selected === 'slides/text-editing-and-autofit'
    ? `
const { FUniver } = await import('@univerjs/core/facade');
const { createDemo } = await import('/showcase/slides/text-editing-and-autofit/code/create-demo.ts');
window.ownership.createSlides = createDemo;
window.ownership.slideFault = '';
window.ownership.slideHandles = [];
window.ownership.slideDisposedUnits = 0;
const disposeUnit = FUniver.prototype.disposeUnit;
FUniver.prototype.disposeUnit = function(...args) {
  window.ownership.slideDisposedUnits++;
  return disposeUnit.apply(this, args);
};
const addEvent = FUniver.prototype.addEvent;
FUniver.prototype.addEvent = function(event, callback) {
  if (window.ownership.slideFault === 'throw-lifecycle') throw new Error('Injected lifecycle registration failure');
  const entry = { kind: 'event', disposed: false };
  const handle = addEvent.call(this, event, callback);
  window.ownership.slideHandles.push(entry);
  return { dispose() {
    handle.dispose();
    entry.disposed = true;
    if (window.ownership.slideFault.includes('cleanup')) throw new Error('Injected listener cleanup failure');
  } };
};
const createPresentation = FUniver.prototype.createPresentation;
FUniver.prototype.createPresentation = function(...args) {
  if (window.ownership.slideFault.startsWith('throw-create')) throw new Error('Injected presentation creation failure');
  return createPresentation.apply(this, args);
};
const NativeResizeObserver = window.ResizeObserver;
window.ResizeObserver = class extends NativeResizeObserver {
  observe(target, options) {
    super.observe(target, options);
    if (target.classList.contains('slide-text-demo')) {
      this.entry = { kind: 'resize', disposed: false };
      window.ownership.slideHandles.push(this.entry);
      if (window.ownership.slideFault === 'throw-observe') throw new Error('Injected post-observe failure');
    }
  }
  disconnect() {
    super.disconnect();
    if (this.entry) this.entry.disposed = true;
  }
};
`
    : ''
}
${
  selected === 'embed/univer-events-to-host'
    ? `
const { FUniver } = await import('@univerjs/core/facade');
const { FWorkbook } = await import('@univerjs/sheets/facade');
const { createDemo } = await import('/showcase/embed/univer-events-to-host/code/create-demo.ts');
window.ownership.createHostEvents = createDemo;
window.ownership.eventHandles = [];
window.ownership.eventFault = '';
function trackEvent(kind, register) {
  const entry = { kind, disposed: false, calls: 0, lateCalls: 0 };
  const handle = register((callback, args) => {
    entry.calls++;
    if (entry.disposed) entry.lateCalls++;
    return callback(...args);
  });
  window.ownership.eventHandles.push(entry);
  return { dispose() {
    handle.dispose();
    entry.disposed = true;
    if (window.ownership.eventFault === 'throw-cleanup') throw new Error('Injected post-listener cleanup failure');
  } };
}
const addEvent = FUniver.prototype.addEvent;
FUniver.prototype.addEvent = function(event, callback) {
  if (window.ownership.eventFault === 'throw-readback' && event === this.Event.CommandExecuted) throw new Error('Injected readback registration failure');
  if (window.ownership.eventFault === 'throw-lifecycle' && event === this.Event.LifeCycleChanged) throw new Error('Injected lifecycle registration failure');
  return trackEvent(event, invoke => addEvent.call(this, event, (...args) => {
    if (window.ownership.eventFault === 'hold-steady' && event === this.Event.LifeCycleChanged && args[0].stage >= this.Enum.LifecycleStages.Steady) return;
    return invoke(callback, args);
  }));
};
const onSelectionChange = FWorkbook.prototype.onSelectionChange;
FWorkbook.prototype.onSelectionChange = function(callback) {
  if (window.ownership.eventFault === 'throw-selection') throw new Error('Injected selection registration failure');
  return trackEvent('workbook-selection', invoke => onSelectionChange.call(this, (...args) => invoke(callback, args)));
};
const createWorkbook = FUniver.prototype.createWorkbook;
FUniver.prototype.createWorkbook = function(...args) {
  if (window.ownership.eventFault === 'throw-workbook') throw new Error('Injected workbook creation failure');
  return createWorkbook.apply(this, args);
};
`
    : ''
}
${
  ['embed/mount-dispose-remount', 'embed/lazy-load-editor'].includes(selected)
    ? `
${selected === 'embed/lazy-load-editor' ? "await import('/showcase/embed/lazy-load-editor/code/editor.ts');" : ''}
// Register deferred Facade extensions before instrumenting their real methods.
// This ownership harness is not the production network-deferral test.
const { FUniver } = await import('@univerjs/core/facade');
const { FFormula } = await import('@univerjs/engine-formula/facade');
window.ownership.lifecycleFault = '';
window.ownership.stopRequests = 0;
window.ownership.activeHostEvents = 0;
const addEvent = FUniver.prototype.addEvent;
FUniver.prototype.addEvent = function(event, callback) {
  const tracked = event === this.Event.LifeCycleChanged || event === this.Event.CommandExecuted;
  const handle = addEvent.call(this, event, (...args) => {
    if (event === this.Event.LifeCycleChanged && window.ownership.lifecycleFault === 'hold-rendered') return;
    return callback(...args);
  });
  if (tracked) window.ownership.activeHostEvents++;
  let disposed = false;
  return { dispose() {
    handle.dispose();
    if (tracked && !disposed) window.ownership.activeHostEvents--;
    disposed = true;
    if (['throw-listener', 'throw-create-and-listener'].includes(window.ownership.lifecycleFault)) throw new Error('Injected listener cleanup failure');
  } };
};
const createWorkbook = FUniver.prototype.createWorkbook;
FUniver.prototype.createWorkbook = function(...args) {
  if (['throw-create', 'throw-create-and-listener'].includes(window.ownership.lifecycleFault)) throw new Error('Injected workbook creation failure');
  return createWorkbook.apply(this, args);
};
const waitApplied = FFormula.prototype.onCalculationResultApplied;
FFormula.prototype.onCalculationResultApplied = async function (...args) {
  await waitApplied.apply(this, args);
  if (window.ownership.lifecycleFault === 'hold-calculation') await new Promise(() => {});
  if (window.ownership.lifecycleFault === 'reject-calculation') throw new Error('Injected calculation-wait failure');
};
const stopCalculation = FFormula.prototype.stopCalculation;
FFormula.prototype.stopCalculation = function(...args) {
  window.ownership.stopRequests++;
  return stopCalculation.apply(this, args);
};
const disposeUnit = FUniver.prototype.disposeUnit;
FUniver.prototype.disposeUnit = function(...args) {
  const result = disposeUnit.apply(this, args);
  if (window.ownership.lifecycleFault === 'throw-unload') throw new Error('Injected post-unload failure');
  return result;
};`
    : ''
}
${
  selected === 'sheets/charts'
    ? `
const { FWorksheet } = await import('@univerjs/sheets/facade');
const insertChart = FWorksheet.prototype.insertChart;
window.ownership.heldCharts = [];
FWorksheet.prototype.insertChart = async function (...args) {
  if (window.ownership.holdChart)
    await new Promise(resolve => window.ownership.heldCharts.push(resolve));
  return insertChart.apply(this, args);
};`
    : ''
}
${
  selected === 'sheets/images'
    ? `
const { FRange } = await import('@univerjs/sheets/facade');
const insertCellImageAsync = FRange.prototype.insertCellImageAsync;
window.ownership.heldImages = [];
FRange.prototype.insertCellImageAsync = async function (...args) {
  if (window.ownership.holdImage)
    await new Promise(resolve => window.ownership.heldImages.push(resolve));
  return insertCellImageAsync.apply(this, args);
};`
    : ''
}
${
  selected === 'sheets/hyper-link'
    ? `
const { FRange } = await import('@univerjs/sheets/facade');
const setHyperLink = FRange.prototype.setHyperLink;
window.ownership.heldLinks = [];
FRange.prototype.setHyperLink = async function (...args) {
  const result = await setHyperLink.apply(this, args);
  if (window.ownership.holdLink)
    await new Promise(resolve => window.ownership.heldLinks.push(resolve));
  return result;
};`
    : ''
}
${
  selected === 'sheets/find-replace'
    ? `
const { FUniver } = await import('@univerjs/core/facade');
const createFinder = FUniver.prototype.createTextFinderAsync;
window.ownership.heldFinders = [];
FUniver.prototype.createTextFinderAsync = async function (...args) {
  const finder = await createFinder.apply(this, args);
  if (window.ownership.holdFinder)
    await new Promise(resolve => window.ownership.heldFinders.push(resolve));
  return finder;
};`
    : ''
}
const style = document.createElement('style');
style.textContent = 'body{margin:0} #preview{height:950px} .h-full{height:100%} .min-h-0{min-height:0} .flex{display:flex} .flex-col{flex-direction:column} .flex-1{flex:1} .grid{display:grid}';
document.head.append(style);
function Host() {
  const [mounted, setMounted] = useState(true);
  const { setTheme } = useTheme();
  window.ownership.setMounted = setMounted;
  window.ownership.setTheme = setTheme;
  return React.createElement('div', { id: 'preview' }, mounted && React.createElement(Preview));
}
createRoot(document.getElementById('test-root')).render(
  React.createElement(StrictMode, null, React.createElement(ThemeProvider,
    { attribute: 'class', defaultTheme: 'light', enableSystem: false }, React.createElement(Host)))
);
`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
try {
  for (const slug of slugs) {
    selected = slug
    const headless = slug.endsWith('/node-via-plugin')
    server.moduleGraph.invalidateAll()
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.stack || error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    const result = { slug, cycles: [], errors, passed: false }
    results.push(result)
    try {
      await page.goto('http://127.0.0.1:4182/', { waitUntil: 'domcontentloaded', timeout: 120000 })
      const mounted = async () => {
        if (slug === 'embed/lazy-load-editor')
          await page.locator('#preview .lazy-load-demo[data-phase="idle"] [data-action="load"]').click()
        await page.waitForFunction(() => window.ownership?.owners.filter((owner) => !owner.disposed).length === 1)
        if (headless)
          await page.waitForFunction(() => document.querySelector('#preview pre')?.textContent?.includes('"id"'))
        // Sheets may keep a hidden document-editing canvas before its visible grid canvas.
        else await page.locator('#preview canvas:visible').first().waitFor({ timeout: 60000 })
        await page.waitForFunction(() => {
          const busy = document.querySelector('#preview [data-ready]')
          return !busy || busy.getAttribute('data-ready') === 'true'
        })
        await page.evaluate(async () => {
          await document.fonts.ready
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        })
      }
      await mounted()
      result.initialCanvases = await page.locator('#preview canvas').count()
      for (const theme of ['dark', 'light', 'dark']) {
        if (slug === 'sheets/big-data') {
          const panel = page.locator('.big-data-controls')
          if (!(await panel.evaluate((element) => element.open))) await panel.locator('summary').click()
          await page.getByLabel('Chunk size', { exact: true }).selectOption('250')
          await page.locator('[data-action="load"]').click()
          await page.waitForFunction(
            () => JSON.parse(document.querySelector('.big-data-demo pre').textContent).lastPopulated.row === 251,
          )
        }
        if (slug === 'sheets/shapes') {
          await page.evaluate(() => {
            const shape = window.univerAPI
              .getActiveWorkbook()
              .getActiveSheet()
              .getShapes()
              .find((candidate) => typeof candidate.getText === 'function')
            if (!shape) throw new Error('Shape gallery has no editable native shape')
            shape.getText().setText('Lifecycle checkpoint')
          })
        }
        if (slug === 'sheets/charts') {
          await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B4').setValue(63))
        }
        if (slug === 'sheets/custom-canvas') {
          const panel = page.locator('.seed-canvas-controls')
          if (!(await panel.evaluate((element) => element.open))) await panel.locator('summary').click()
          await page.getByLabel('Germination value', { exact: true }).fill('63')
          await page.locator('[data-action="write"]').click()
          await page.waitForFunction(
            () => JSON.parse(document.querySelector('.seed-canvas-demo pre').textContent).rawValues[3][2] === 63,
          )
        }
        if (slug === 'sheets/cross-workbook-formula') {
          await page.getByLabel('Source value', { exact: true }).fill('180')
          await page.locator('[data-action="write"]').click()
          await page.waitForFunction(
            () =>
              JSON.parse(document.querySelector('.cross-workbook-demo pre').textContent).books.summary
                .rawValues[9][1] === 3003.75,
          )
        }
        if (slug === 'sheets/images') {
          await page.getByRole('combobox', { name: 'Image variant', exact: true }).selectOption('crop')
          await page.locator('[data-action="apply"]').click()
          await page.waitForFunction(() => {
            const root = document.querySelector('.sheet-images-demo')
            const state = JSON.parse(root.querySelector('pre').textContent)
            return (
              root.dataset.busy === 'false' &&
              state.drawings.inventory.data[state.hostFloatingTarget].srcRect?.left === 20
            )
          })
        }
        if (slug === 'sheets/csv-import-plugin') {
          await page.locator('[data-action="import"]').click()
          await page.waitForFunction(
            () => JSON.parse(document.querySelector('.csv-demo pre').textContent).sheets[0].values[3][1] === 'Ticket',
          )
        }
        if (slug === 'sheets/crosshair-highlighting') {
          await page.locator('[data-action="disable"]').click()
          await page.waitForFunction(
            () => JSON.parse(document.querySelector('.crosshair-demo pre').textContent).enabled === false,
          )
        }
        if (slug === 'sheets/outline') {
          await page.getByRole('combobox', { name: 'Detail level' }).selectOption('q2')
          await page.waitForFunction(
            () => JSON.parse(document.querySelector('.outline-demo pre').textContent).visiblePopulatedRows === 38,
          )
        }
        if (slug === 'sheets/hyper-link') {
          await page.getByRole('combobox', { name: 'Link target' }).selectOption('B7')
          await page.getByRole('textbox', { name: 'Link label', exact: true }).fill('Lifecycle link')
          await page.locator('[data-action="set"]').click()
          await page.waitForFunction(() => {
            const root = document.querySelector('.hyperlink-demo')
            return (
              root.dataset.busy === 'false' &&
              JSON.parse(root.querySelector('pre').textContent).links[0]?.label === 'Lifecycle link'
            )
          })
        }
        if (slug === 'sheets/notes') {
          await page.locator('[data-action="size"]').click()
          await page.waitForFunction(() => {
            const root = document.querySelector('.notes-demo')
            return root.dataset.busy === 'false' && JSON.parse(root.querySelector('pre').textContent).note.width === 320
          })
          await page.waitForFunction(() =>
            [...document.querySelectorAll('[data-u-comp="note-textarea"]')].some(
              (el) => Math.round(el.getBoundingClientRect().width) === 320,
            ),
          )
        }
        if (slug === 'sheets/find-replace') {
          await page.locator('[data-action="search"]').click()
          await page.waitForFunction(() => {
            const root = document.querySelector('.find-replace-demo')
            return (
              root.dataset.busy === 'false' && JSON.parse(root.querySelector('pre').textContent).matches.length === 6
            )
          })
        }
        const before = await page.evaluate(() => window.ownership.owners.length)
        const retainedSnapshot =
          slug === 'sheets/custom-formula'
            ? await page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
            : undefined
        await page.locator('#preview canvas').evaluateAll((nodes) => {
          window.ownership.previousCanvases = nodes
        })
        if (headless) {
          await page.evaluate(() => window.ownership.setMounted(false))
          await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
          await page.evaluate(() => window.ownership.setMounted(true))
        } else await page.evaluate((nextTheme) => window.ownership.setTheme(nextTheme), theme)
        // Deferred previews need their explicit load action before an owner can exist.
        await mounted()
        if (slug === 'sheets/custom-formula') {
          await page.locator(`.custom-formula-demo[data-theme="${theme}"]`).waitFor()
          assert.equal(await page.evaluate(() => window.ownership.owners.length), before, 'Theme retains owner')
          assert.ok(
            await page.evaluate(() => window.ownership.previousCanvases.every((node) => node.isConnected)),
            'Theme retains native canvases',
          )
          assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveWorkbook().save()), retainedSnapshot)
        } else {
          await page.waitForFunction(
            (count) =>
              window.ownership.owners.length === count + 1 &&
              window.ownership.owners.slice(0, count).every((owner) => owner.disposed),
            before,
          )
          assert.ok(
            await page.evaluate(() => window.ownership.previousCanvases.every((node) => !node.isConnected)),
            'Old canvases must be detached, not hidden behind the replacement',
          )
        }
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        assert.equal(await page.locator('#preview canvas').count(), 0)
        assert.equal(await page.locator('#preview').evaluate((node) => node.childElementCount), 0)
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        const canvasCount = await page.locator('#preview canvas').count()
        if (!headless) assert.ok(canvasCount > 0)
        result.cycles.push({
          theme,
          themeRetainsOwner: slug === 'sheets/custom-formula',
          allOldOwnersDisposed: true,
          oldCanvasesDetached: true,
          canvasCount,
        })
      }
      if (slug === 'sheets/cross-workbook-formula') {
        await page.getByLabel('Source value', { exact: true }).fill('180')
        await page.locator('[data-action="write"]').click()
        await page.waitForFunction(
          () =>
            JSON.parse(document.querySelector('.cross-workbook-demo pre').textContent).books.summary.rawValues[9][1] ===
            3003.75,
        )
        const beforeReload = await page.evaluate(() => window.ownership.owners.length)
        await page.locator('#preview canvas').evaluateAll((nodes) => {
          window.ownership.previousCanvases = nodes
        })
        await page.locator('[data-action="reload"]').click()
        await page.waitForFunction(
          (count) =>
            window.ownership.owners.length === count + 1 &&
            window.ownership.owners.slice(0, count).every((owner) => owner.disposed),
          beforeReload,
        )
        await mounted()
        await page.waitForFunction(
          () =>
            JSON.parse(document.querySelector('.cross-workbook-demo pre').textContent).books.summary.rawValues[9][1] ===
            3003.75,
        )
        assert.equal(
          await page.evaluate(() => window.ownership.previousCanvases.every((node) => !node.isConnected)),
          true,
        )
        // Trigger a real reset and route teardown in the same turn, while owner replacement is pending.
        await page.evaluate(() => {
          document.querySelector('[data-action="reset"]').click()
          window.ownership.setMounted(false)
        })
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        assert.equal(
          await page.locator('#preview').evaluate((node) => node.childElementCount),
          0,
          'An interrupted replacement must not resurrect the old demo',
        )
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        await page.waitForFunction(
          () =>
            JSON.parse(document.querySelector('.cross-workbook-demo pre').textContent).books.summary.rawValues[9][1] ===
            2160,
        )
        result.crossWorkbookReplacement = {
          oldOwnerDisposedOnReload: true,
          editsPreservedOnReload: true,
          interruptedResetDidNotRemount: true,
          freshGraphUsable: true,
        }
      }
      if (slug === 'sheets/custom-canvas') {
        await page.getByLabel('Germination value', { exact: true }).fill('63')
        await page.locator('[data-action="write"]').click()
        await page.waitForFunction(
          () => JSON.parse(document.querySelector('.seed-canvas-demo pre').textContent).rawValues[3][2] === 63,
        )
        const before = await page.evaluate(() => window.ownership.owners.length)
        await page.locator('[data-action="reload"]').click()
        await page.waitForFunction(
          (count) =>
            window.ownership.owners.length === count + 1 &&
            window.ownership.owners.slice(0, count).every((owner) => owner.disposed),
          before,
        )
        await mounted()
        await page.waitForFunction(
          () => JSON.parse(document.querySelector('.seed-canvas-demo pre').textContent).rawValues[3][2] === 63,
        )
        await page.evaluate(() => {
          document.querySelector('[data-action="reset"]').click()
          window.ownership.setMounted(false)
        })
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        assert.equal(await page.locator('#preview').evaluate((node) => node.childElementCount), 0)
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        await page.waitForFunction(
          () => JSON.parse(document.querySelector('.seed-canvas-demo pre').textContent).rawValues[3][2] === 87,
        )
        result.customCanvasReplacement = {
          editedDataPreserved: true,
          oldOwnerDisposed: true,
          interruptedResetDidNotRemount: true,
        }
      }
      await page.screenshot({ path: path.join(directory, `${slug.replace('/', '-')}.png`) })
      if (slug === 'sheets/charts') {
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        await page.evaluate(() => {
          window.ownership.holdChart = true
          window.ownership.setMounted(true)
        })
        await page.waitForFunction(() => window.ownership.heldCharts.length > 0)
        const prevented = await page
          .locator('.sheet-charts-demo')
          .evaluate(
            (editor) =>
              !editor.dispatchEvent(new KeyboardEvent('keydown', { key: '9', bubbles: true, cancelable: true })),
          )
        assert.equal(prevented, true, 'Native input must not race a pending chart insert')
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => document.querySelector('#preview').childElementCount === 0)
        assert.equal(await page.evaluate(() => window.ownership.owners.filter((owner) => !owner.disposed).length), 1)
        await page.evaluate(() => {
          window.ownership.holdChart = false
          window.ownership.heldCharts.splice(0).forEach((resolve) => resolve())
        })
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        const state = await page.evaluate(() =>
          window.univerAPI
            .getActiveWorkbook()
            .getSheets()
            .map((sheet) => ({
              charts: sheet.getCharts().length,
              id: sheet.getSheetId(),
            })),
        )
        assert.equal(state.length, 6)
        assert.ok(state.every((sheet) => sheet.charts === 1))
        result.pendingChartTeardown = {
          heldInsert: true,
          nativeInputGated: true,
          ownerRetainedUntilSettlement: true,
          remountedSixChartVariants: true,
        }
      }
      if (slug === 'sheets/images') {
        await page.evaluate(() => {
          window.ownership.holdImage = true
        })
        await page.locator('[data-action="cell"]').click()
        await page.waitForFunction(() => window.ownership.heldImages.length === 1)
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => !document.querySelector('.sheet-images-demo'))
        assert.equal(
          await page.evaluate(() => window.ownership.owners.filter((owner) => !owner.disposed).length),
          1,
          'Keep SDK owner alive for an in-flight image command',
        )
        await page.evaluate(() => {
          window.ownership.holdImage = false
          window.ownership.heldImages.splice(0).forEach((resolve) => resolve())
        })
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        const imageState = JSON.parse(await page.locator('.sheet-images-demo pre').textContent())
        assert.equal(imageState.layout.drawings.length, 3)
        result.pendingImageTeardown = { ownerRetainedUntilSdkSettled: true, remountedWithOriginalImages: true }
      }
      if (slug === 'sheets/csv-import-plugin') {
        await page.evaluate(() => {
          const original = File.prototype.arrayBuffer
          window.ownership.restoreFileRead = () => {
            File.prototype.arrayBuffer = original
          }
          File.prototype.arrayBuffer = async function () {
            const buffer = await original.call(this)
            await new Promise((resolve) => {
              window.ownership.releaseFileRead = resolve
            })
            return buffer
          }
        })
        await page
          .getByLabel('CSV file', { exact: true })
          .setInputFiles({ name: 'delayed.csv', mimeType: 'text/csv', buffer: Buffer.from('Old,Owner\nMust,NotWrite') })
        await page.waitForFunction(() => !!window.ownership.releaseFileRead)
        assert.equal(await page.locator('.csv-editor').evaluate((el) => el.inert), true)
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        assert.equal(await page.locator('#preview').evaluate((el) => el.childElementCount), 0)
        await page.evaluate(async () => {
          window.ownership.restoreFileRead()
          window.ownership.releaseFileRead()
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        })
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        assert.equal(
          await page
            .getByRole('textbox', { name: 'CSV source' })
            .inputValue()
            .then((value) => value.startsWith('Ticket,Item')),
          true,
        )
        await page.locator('[data-action="import"]').click()
        await page.waitForFunction(
          () => JSON.parse(document.querySelector('.csv-demo pre').textContent).sheets[0].values[3][1] === 'Ticket',
        )
        result.pendingFileRead = { disposedBeforeReadSettled: true, remounted: true, staleDraftIgnored: true }
      }
      if (slug === 'sheets/hyper-link') {
        await page.getByRole('combobox', { name: 'Link target' }).selectOption('B7')
        await page.evaluate(() => {
          window.ownership.holdLink = true
        })
        await page.locator('[data-action="set"]').click()
        await page.waitForFunction(() => window.ownership.heldLinks.length === 1)
        assert.equal(await page.locator('.hyperlink-editor').evaluate((el) => el.inert), true)
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => document.querySelector('#preview').childElementCount === 0)
        assert.equal(await page.evaluate(() => window.ownership.owners.filter((owner) => !owner.disposed).length), 1)
        await page.evaluate(() => {
          window.ownership.holdLink = false
          window.ownership.heldLinks.splice(0).forEach((resolve) => resolve())
        })
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        await page.waitForFunction(
          () =>
            JSON.parse(document.querySelector('.hyperlink-demo pre').textContent).links[0]?.label === 'Univer website',
        )
        result.pendingHyperlinkTeardown = {
          heldFacadeCompletion: true,
          ownerRetainedUntilSettlement: true,
          remounted: true,
        }
      }
      if (slug === 'sheets/notes') {
        // Hold only frames scheduled synchronously by this click. Disposal must release
        // the pending reopen promise even when its frame never gets to run.
        const pending = await page.evaluate(() => {
          const raf = window.requestAnimationFrame
          let held = 0
          window.requestAnimationFrame = () => -++held
          try {
            document.querySelector('[data-action="size"]').click()
          } finally {
            window.requestAnimationFrame = raf
          }
          const busy = document.querySelector('.notes-demo').dataset.busy
          window.ownership.setMounted(false)
          return { busy, held }
        })
        assert.equal(pending.busy, 'true')
        assert.ok(pending.held > 0)
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        assert.equal(await page.locator('[data-u-comp="note-textarea"]').count(), 0)
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        await page.waitForFunction(() =>
          [...document.querySelectorAll('[data-u-comp="note-textarea"]')].some(
            (el) => el.value === 'Humidity check before unpacking.',
          ),
        )
        result.pendingNoteReopenTeardown = {
          heldFrames: pending.held,
          ownerDisposedWithoutFrame: true,
          remounted: true,
        }
      }
      if (slug === 'sheets/find-replace') {
        await page.evaluate(() => {
          window.ownership.holdFinder = true
        })
        await page.locator('[data-action="search"]').click()
        await page.waitForFunction(() => window.ownership.heldFinders.length > 0)
        assert.equal(await page.locator('.find-editor').evaluate((el) => el.inert), true)
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => document.querySelector('#preview').childElementCount === 0)
        assert.equal(await page.evaluate(() => window.ownership.owners.filter((owner) => !owner.disposed).length), 1)
        await page.evaluate(() => {
          window.ownership.holdFinder = false
          window.ownership.heldFinders.splice(0).forEach((resolve) => resolve())
        })
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 750)))
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        await page.locator('[data-action="search"]').click()
        await page.waitForFunction(
          () => JSON.parse(document.querySelector('.find-replace-demo pre').textContent).matches.length === 6,
        )
        result.pendingFinderTeardown = {
          heldFacadeCompletion: true,
          ownerRetainedUntilSettlement: true,
          remounted: true,
        }
      }
      if (slug === 'sheets/read-only') {
        await page.locator('[data-mode="editable"]').click()
        await page.locator('.read-only-demo[data-ready="true"]').waitFor()
        const grid = page.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
        await grid.click({ position: { x: 665, y: 104 } })
        await page.keyboard.type('7')
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          () => JSON.parse(document.querySelector('pre[aria-label]').textContent).values[3][4] === 7,
        )
        await page.evaluate(() => {
          window.ownership.holdPermissions = true
        })
        await page.locator('[data-mode="selectable"]').click()
        await page.waitForFunction(() => window.ownership.heldPermissions.length > 0)
        assert.equal(await page.locator('.read-only-demo').getAttribute('data-ready'), 'false')
        // Old editor permissions are still true; the transition gate must stop input.
        await grid.click({ position: { x: 665, y: 104 } })
        await page.keyboard.type('999')
        await page.keyboard.press('Delete')
        await page.keyboard.press('Enter')
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const state = JSON.parse(await page.locator('pre[aria-label]').textContent())
        assert.equal(state.canEdit, true)
        assert.equal(state.values[3][4], 7)
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => document.querySelector('#preview').childElementCount === 0)
        assert.equal(await page.evaluate(() => window.ownership.owners.filter((owner) => !owner.disposed).length), 1)
        const held = await page.evaluate(() => {
          window.ownership.holdPermissions = false
          const count = window.ownership.heldPermissions.length
          window.ownership.heldPermissions.splice(0).forEach((resolve) => resolve())
          return count
        })
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        result.pendingPermissionTeardown = {
          heldUpdates: held,
          ownerRetainedUntilSettlement: true,
          transitionInputPreserved: true,
          remounted: true,
        }
      }
      if (slug === 'sheets/permission') {
        const panel = page.locator('.permission-shadow-controls')
        if (!(await panel.evaluate((e) => e.open))) await panel.locator('summary').click()
        await page.getByLabel('Protection profile', { exact: true }).selectOption('none')
        await page.locator('[data-action="profile"]').click()
        await page.locator('.permission-shadow-demo[data-ready="true"]').waitFor()
        const box = page.locator('.permission-shadow-editor input.univer-size-full')
        await box.fill('C4')
        await box.press('Enter')
        await page.keyboard.type('9')
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          () => JSON.parse(document.querySelector('.permission-shadow-demo pre').textContent).rawValues[3][2] === 9,
        )
        await page.evaluate(() => {
          window.ownership.holdPermissions = true
        })
        await page.getByLabel('Protection profile', { exact: true }).selectOption('locked')
        await page.locator('[data-action="profile"]').click()
        await page.waitForFunction(() => window.ownership.heldPermissions.length > 0)
        assert.equal(await page.locator('.permission-shadow-demo').getAttribute('data-ready'), 'false')
        const grid = page.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
        await grid.click({ position: { x: 380, y: 132 } })
        await page.keyboard.type('999')
        await page.keyboard.press('Delete')
        await page.keyboard.press('Enter')
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        assert.equal(JSON.parse(await page.locator('.permission-shadow-demo pre').textContent()).rawValues[3][2], 9)
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => document.querySelector('#preview').childElementCount === 0)
        assert.equal(await page.evaluate(() => window.ownership.owners.filter((owner) => !owner.disposed).length), 1)
        const held = await page.evaluate(() => {
          window.ownership.holdPermissions = false
          const count = window.ownership.heldPermissions.length
          window.ownership.heldPermissions.splice(0).forEach((resolve) => resolve())
          return count
        })
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
        result.permissionShadowPending = {
          heldUpdates: held,
          transitionInputPreserved: true,
          ownerRetainedUntilSettlement: true,
          remounted: true,
        }
      }
      if (slug === 'embed/univer-events-to-host') {
        const activeHandles = () =>
          page.evaluate(() =>
            window.ownership.eventHandles
              .filter((entry) => !entry.disposed)
              .map((entry) => entry.kind)
              .toSorted(),
          )
        const expected = ['CommandExecuted', 'LifeCycleChanged', 'SheetValueChanged', 'workbook-selection'].toSorted()
        assert.deepEqual(await activeHandles(), expected)
        for (const fixture of ['empty', 'boundary', 'default']) {
          await page.locator('.host-events-controls select').selectOption(fixture)
          assert.deepEqual(await activeHandles(), expected, `${fixture}: no duplicate activity listeners`)
        }
        await page.locator('[data-action="subscription"]').click()
        assert.deepEqual(await activeHandles(), ['CommandExecuted', 'LifeCycleChanged'])
        await page.locator('[data-action="subscription"]').click()
        assert.deepEqual(await activeHandles(), expected)
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        assert.deepEqual(await activeHandles(), [])
        result.hostEventFaults = []
        for (const fault of [
          'throw-readback',
          'throw-lifecycle',
          'throw-workbook',
          'throw-selection',
          'throw-cleanup',
        ]) {
          const probe = await page.evaluate(async (mode) => {
            const container = document.createElement('div')
            container.style.height = '800px'
            document.body.append(container)
            window.ownership.eventFault = mode === 'throw-cleanup' ? '' : mode
            let message = ''
            let demo
            try {
              demo = window.ownership.createHostEvents(container)
              if (mode === 'throw-cleanup') {
                await new Promise((resolve, reject) => {
                  const timer = setInterval(() => {
                    if (container.querySelector('[data-ready="true"]')) {
                      clearInterval(timer)
                      clearTimeout(timeout)
                      resolve()
                    }
                  }, 20)
                  const timeout = setTimeout(() => {
                    clearInterval(timer)
                    reject(new Error('Probe never became ready'))
                  }, 10000)
                })
                window.ownership.eventFault = mode
                demo.dispose()
              }
            } catch (cause) {
              message = String(cause)
            }
            window.ownership.eventFault = ''
            const observed = {
              message,
              allOwnersDisposed: window.ownership.owners.every((owner) => owner.disposed),
              activeHandles: window.ownership.eventHandles.filter((entry) => !entry.disposed),
              children: container.childElementCount,
            }
            container.remove()
            return observed
          }, fault)
          assert.ok(probe.message, `${fault}: failure is observable`)
          assert.equal(probe.allOwnersDisposed, true, `${fault}: actual owner released`)
          assert.deepEqual(probe.activeHandles, [], `${fault}: all returned handles released`)
          assert.equal(probe.children, 0, `${fault}: failed host removed`)
          result.hostEventFaults.push({ fault, ...probe })
        }
        await page.evaluate(() => {
          window.ownership.eventFault = 'hold-steady'
          window.ownership.setMounted(true)
        })
        await page.locator('.host-events-demo[data-ready="false"]').waitFor()
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        assert.deepEqual(await activeHandles(), [])
        await page.evaluate(() => {
          window.ownership.eventFault = ''
          window.ownership.setMounted(true)
        })
        await mounted()
        result.hostEventFaults.push({ fault: 'unmount-before-steady', released: true, recovered: true })
      }
      if (slug === 'slides/text-editing-and-autofit') {
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
        result.slideFaults = []
        for (const fault of [
          'throw-lifecycle',
          'throw-create',
          'throw-observe',
          'throw-cleanup',
          'throw-create-and-cleanup',
          'dispose-before-render',
          'dispose-during-reset',
        ]) {
          const probe = await page.evaluate(async (mode) => {
            const container = document.createElement('div')
            container.style.height = '960px'
            document.body.append(container)
            window.ownership.slideFault = mode === 'throw-cleanup' || mode.startsWith('dispose-') ? '' : mode
            let demo,
              message = '',
              causes = [],
              resetStarted = false,
              beforeRendered = false
            try {
              demo = window.ownership.createSlides(container)
              if (mode === 'throw-cleanup' || mode === 'dispose-during-reset') {
                for (
                  let frame = 0;
                  !container.querySelector('[data-ready="true"] > fieldset:not([disabled])');
                  frame++
                ) {
                  if (frame > 300) throw new Error('Probe never became ready')
                  await new Promise(requestAnimationFrame)
                }
              }
              if (mode === 'dispose-during-reset') {
                const before = window.ownership.slideDisposedUnits
                container.querySelector('[data-action="reset"]').click()
                resetStarted = window.ownership.slideDisposedUnits === before + 1
              }
              beforeRendered = !container.querySelector('[data-ready="true"]')
              if (mode === 'throw-cleanup') window.ownership.slideFault = mode
              demo.dispose()
            } catch (cause) {
              message = String(cause)
              causes = cause instanceof AggregateError ? cause.errors.map(String) : []
            }
            window.ownership.slideFault = ''
            // Repeated disposal must stay harmless, including after a cleanup error.
            demo?.dispose()
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
            const observed = {
              message,
              causes,
              resetStarted,
              beforeRendered,
              allOwnersDisposed: window.ownership.owners.every((owner) => owner.disposed),
              activeHandles: window.ownership.slideHandles.filter((entry) => !entry.disposed),
              children: container.childElementCount,
            }
            container.remove()
            return observed
          }, fault)
          assert.equal(Boolean(probe.message), fault.startsWith('throw-'), `${fault}: observable failure contract`)
          if (fault === 'throw-create-and-cleanup') assert.equal(probe.causes.length, 2, 'Preserve both errors')
          if (fault === 'dispose-during-reset') assert.equal(probe.resetStarted, true, 'Reset actually began unloading')
          if (fault === 'dispose-before-render') assert.equal(probe.beforeRendered, true, 'Dispose precedes readiness')
          assert.equal(probe.allOwnersDisposed, true, `${fault}: SDK owner released`)
          assert.deepEqual(probe.activeHandles, [], `${fault}: event and resize handles released`)
          assert.equal(probe.children, 0, `${fault}: host removed`)
          result.slideFaults.push({ fault, ...probe })
        }
        await page.evaluate(() => window.ownership.setMounted(true))
        await mounted()
      }
      if (slug === 'embed/lazy-load-editor') {
        const root = page.locator('.lazy-load-demo')
        result.lazyFaults = []
        for (const fault of [
          'hold-calculation',
          'reject-calculation',
          'throw-listener',
          'throw-create-and-listener',
          'hold-rendered',
        ]) {
          const duringLoad = ['throw-create-and-listener', 'hold-rendered'].includes(fault)
          if (duringLoad) {
            await root.locator('[data-action="release"]').click()
            await page.locator('.lazy-load-demo[data-phase="idle"]').waitFor()
          }
          await page.evaluate((value) => {
            window.ownership.lifecycleFault = value
          }, fault)
          await root.locator(`[data-action="${duringLoad ? 'load' : 'release'}"]`).click()
          await page.locator('.lazy-load-demo[data-phase="error"]').waitFor({ timeout: 25000 })
          const readback = JSON.parse(await root.getByLabel('Lazy editor state').textContent())
          assert.ok(readback.error, `${fault} must remain visible to the user`)
          assert.equal(await root.locator('canvas').count(), 0)
          assert.ok(
            await page.evaluate(() => window.ownership.owners.every((owner) => owner.disposed)),
            `${fault}: all owners released`,
          )
          assert.equal(
            await page.evaluate(() => window.ownership.activeHostEvents),
            0,
            `${fault}: host events released`,
          )
          if (fault.includes('calculation')) assert.ok(await page.evaluate(() => window.ownership.stopRequests > 0))
          await page.evaluate(() => {
            window.ownership.lifecycleFault = ''
          })
          await root.locator('[data-action="load"]').click()
          await page.locator('.lazy-load-demo[data-phase="ready"]').waitFor()
          assert.equal(JSON.parse(await root.getByLabel('Lazy editor state').textContent()).sdk.runs, 6)
          result.lazyFaults.push({ fault, released: true, recovered: true })
        }
        await root.locator('[data-action="release"]').click()
        await page.locator('.lazy-load-demo[data-phase="idle"]').waitFor()
        await page.evaluate(() => {
          window.ownership.lifecycleFault = 'hold-rendered'
        })
        await root.locator('[data-action="load"]').click()
        await page.waitForFunction(
          () =>
            document.querySelector('.lazy-load-demo')?.dataset.phase === 'loading' &&
            document.querySelector('#preview canvas'),
        )
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed), undefined, {
          timeout: 5000,
        })
        assert.equal(await page.locator('#preview canvas').count(), 0)
        assert.equal(await page.evaluate(() => window.ownership.activeHostEvents), 0)
        await page.evaluate(() => {
          window.ownership.lifecycleFault = ''
          window.ownership.setMounted(true)
        })
        await mounted()
        result.lazyFaults.push({ fault: 'unmount-during-held-rendered', released: true, recovered: true })
      }
      if (slug === 'embed/mount-dispose-remount') {
        result.lifecycleFaults = []
        for (const fault of [
          'hold-rendered',
          'reject-calculation',
          'hold-calculation',
          'throw-unload',
          'throw-listener',
          'throw-create',
        ]) {
          await page.locator('.embed-lifecycle-controls > summary').click()
          await page.evaluate((value) => {
            window.ownership.lifecycleFault = value
          }, fault)
          await page
            .locator(`[data-action="${['hold-rendered', 'throw-create'].includes(fault) ? 'reset' : 'dispose'}"]`)
            .click()
          await page.locator('.embed-lifecycle[data-ready="true"][data-state="error"]').waitFor({ timeout: 20000 })
          const state = JSON.parse(await page.getByLabel('Inventory lifecycle readback').textContent())
          assert.equal(state.mounted, false, `${fault}: a failed wait must not retain the editor owner`)
          assert.equal(await page.locator('#preview canvas').count(), 0)
          assert.ok(await page.evaluate(() => window.ownership.owners.every((owner) => owner.disposed)))
          assert.match(
            state.error,
            fault === 'hold-rendered'
              ? /Rendered.*10000/
              : fault === 'hold-calculation'
                ? /Teardown calculation.*10000/
                : /Injected/,
          )
          if (fault === 'reject-calculation') assert.ok(await page.evaluate(() => window.ownership.stopRequests > 0))
          await page.evaluate(() => {
            window.ownership.lifecycleFault = ''
          })
          await page.locator('[data-action="mount"]').click()
          await mounted()
          result.lifecycleFaults.push({ fault, released: true, recovered: true })
          // The next loop expects the default collapsed disclosure.
          await page.locator('.embed-lifecycle-controls > summary').click()
        }
        await page.locator('.embed-lifecycle-controls > summary').click()
        await page.evaluate(() => {
          window.ownership.lifecycleFault = 'hold-rendered'
        })
        await page.locator('[data-action="reset"]').click()
        await page.waitForFunction(() => {
          const state = document.querySelector('.embed-lifecycle')
          return state?.dataset.ready === 'false' && document.querySelector('#preview canvas')
        })
        await page.evaluate(() => window.ownership.setMounted(false))
        await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed), undefined, {
          timeout: 5000,
        })
        assert.equal(await page.locator('#preview canvas').count(), 0)
        await page.evaluate(() => {
          window.ownership.lifecycleFault = ''
          window.ownership.setMounted(true)
        })
        await mounted()
        result.lifecycleFaults.push({ fault: 'unmount-during-held-rendered', released: true, recovered: true })
        result.pendingLifecycleTeardown = []
        for (const action of ['apply', 'remount', 'mount']) {
          await page.locator('.embed-lifecycle-controls > summary').click()
          if (action === 'mount') {
            await page.locator('[data-action="dispose"]').click()
            await page.locator('.embed-lifecycle[data-state="disposed"]').waitFor()
          } else if (action === 'apply') {
            await page.locator('[name="quantity"]').fill('43.125')
            await page.waitForFunction(() => !document.querySelector('[data-action="apply"]').disabled)
          }
          const pending = await page.evaluate((name) => {
            document.querySelector(`[data-action="${name}"]`).click()
            const busy = document.querySelector('.embed-lifecycle').dataset.ready === 'false'
            window.ownership.setMounted(false)
            return busy
          }, action)
          assert.equal(pending, true, `${action} must still be pending at enclosing React teardown`)
          await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
          assert.equal(await page.locator('#preview canvas').count(), 0)
          await page.evaluate(() => window.ownership.setMounted(true))
          await mounted()
          assert.equal(await page.locator('.embed-lifecycle').count(), 1)
          const state = JSON.parse(await page.getByLabel('Inventory lifecycle readback').textContent())
          assert.equal(state.rows[0][3], 24)
          result.pendingLifecycleTeardown.push({
            action,
            busyAtUnmount: pending,
            allOldOwnersDisposed: true,
            remounted: true,
          })
        }
      }
      if (slug === 'sheets/custom-formula') {
        for (const request of ['reload', 'TIMEOUT']) {
          if (request === 'reload') await page.locator('[data-action="reload"]').click()
          else {
            const box = page.locator('.custom-formula-demo input.univer-size-full')
            await box.fill('B4')
            await box.press('Enter')
            await page.keyboard.type(request)
            await page.keyboard.press('Enter')
          }
          await page.waitForFunction(() => Number(document.querySelector('[data-source="pending"]')?.textContent) > 0)
          await page.evaluate(() => window.ownership.setMounted(false))
          await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
          await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 1700)))
          assert.equal(await page.locator('#preview canvas').count(), 0)
          await page.evaluate(() => window.ownership.setMounted(true))
          await mounted()
          await page.waitForFunction(
            () => window.univerAPI?.getActiveWorkbook()?.getActiveSheet()?.getRange('F11').getValue() === 18,
          )
        }
        result.pendingFormulaTeardown = {
          requests: ['reload', 'TIMEOUT'],
          localRequestPendingAtUnmount: true,
          waitedBeyondSourceDeadline: true,
          remounted: true,
        }
      }
      if (slug === 'sheets/list-validation') {
        // Keep rule mutation and React teardown in the same task: normal browser
        // round trips can accidentally wait out the SDK's 100ms auto-height buffer.
        await page.evaluate(() => {
          const api = window.univerAPI
          const sheet = api.getActiveWorkbook().getActiveSheet()
          sheet
            .getRange('B2:B7')
            .setDataValidation(api.newDataValidation().requireValueInList(['Paper', 'Textiles'], true, true).build())
          window.ownership.setMounted(false)
        })
        result.pendingValidationTeardown = { ruleChangedImmediatelyBeforeUnmount: true }
      } else await page.evaluate(() => window.ownership.setMounted(false))
      await page.waitForFunction(() => window.ownership.owners.every((owner) => owner.disposed))
      // Exercise callbacks already queued when the enclosing React tree disappears.
      await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 250)))
      result.owners = await page.evaluate(() => window.ownership.owners)
      if (slug === 'embed/univer-events-to-host') {
        result.hostEventHandles = await page.evaluate(() => window.ownership.eventHandles)
        assert.ok(result.hostEventHandles.every((entry) => entry.disposed && entry.lateCalls === 0))
      }
      assert.deepEqual(errors, [])
      result.passed = true
    } catch (error) {
      result.failure = error.stack || String(error)
      result.lastReadback = await page
        .locator('#preview pre[aria-label], #preview [aria-label="Lazy editor state"]')
        .first()
        .textContent({ timeout: 1000 })
        .catch(() => null)
      await page.screenshot({ path: path.join(directory, `${slug.replace('/', '-')}-failure.png`) }).catch(() => {})
    } finally {
      await context.close()
      await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(results, null, 2))
      console.log(JSON.stringify(result))
    }
  }
} finally {
  await browser.close()
  await server.close()
}
assert.ok(
  results.every((result) => result.passed),
  'Every selected Preview must release all owning instances and remount cleanly',
)
