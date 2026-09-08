# Cedar Community Logistics: lazy route editor

The first screen is a lightweight planning manifest, using the original twelve route names, hubs and weekly runs. It is authored planning data, not a live SDK readback. Scrolling to the editor uses the browser's `IntersectionObserver`; **Open route editor** provides keyboard activation. Only then does the host dynamically import `editor.ts`, including the installed SDK and its complete official Sheets Core CSS. The workbook retains all original formulas, monetary formats, route IDs and business data.

The host contains no SDK runtime imports, fixture selector, synthetic failure, fixed cell editor or raw snapshot panel. The host and deferred SDK editor always use English, including on Chinese-language host pages. Legacy locale argument positions are retained but ignored; the complete official English Sheets Core pack stays in the deferred module. Preview and the independent entry call the same factory. Theme changes preserve the current owner and edits, and also apply to a future lazy mount.

## Run and inspect delivery

Open `http://localhost:3030/en-US/playground/embed/lazy-load-editor`. Install the exact generated dependencies in the independent export, then run `npm run dev`. Use a production build to inspect real asset splitting; an import statement alone is not evidence that network bytes were deferred.

Run `node scripts/test-cedar-lazy-native.mjs` against the guide, with optional `SHOWCASE_DEMO_URL` or `SHOWCASE_BASE_URL`. Full independent network and owner-lifecycle checks use:

```powershell
$env:SHOWCASE_BUILD_STANDALONE='1'
$env:SHOWCASE_VITE_DIRECTORY='<USERPROFILE>/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
$env:SHOWCASE_RESULTS_DIR='test-results/cedar-lazy-native'
$env:SHOWCASE_EXPORT_PORT='4428'
node scripts/test-cedar-lazy-native.mjs
```

The test builds only this case on isolated port 4428 (override with `SHOWCASE_EXPORT_PORT`), links each installed dependency at its exact exported version, and records actual requests. It creates its own temporary export unless `SHOWCASE_EXPORT_DIRECTORY` is explicitly set; never point it at a running user preview. It holds or aborts real deferred asset requests using browser network interception, not a modified SDK or fake loader. The normal production entry is separately tested without the harness.

## Host loading, cancellation and retry

- **Cancel loading** invalidates the current load generation. A late import may finish downloading/evaluating, but cannot create an abandoned SDK owner. Browser module downloads are not abortable through this host API.
- **Release editor** disposes the real workbook and owner. Explicit activation loads a fresh original workbook; release does not rearm automatic scrolling.
- **Retry editor load** remains available after initialization errors. A rejected module import instead disables loading and displays **Page refresh required**, because the browser may retain that rejected import. Save other work on the host page before refreshing. The host never automatically reloads or discards page state.
- **Download JSON** saves the full current workbook locally; it is not XLSX conversion.

The following JavaScript blocks run in `src/index.ts`, where `demo` is the shared host returned by `createDemo(container)`. These are explicit host functions, not invented SDK loading Facades.

```js
await demo.load()
```

Opening repeatedly while a load is pending shares that pending operation. A different workbook is not silently queued; release the active owner first.

## Native edit and calculated budget

Type directly into the native grid and use its Grid ribbon for Undo/Redo. TypeScript snippets below are independently runnable in the loaded browser console via the current `univerAPI`. No owner exists before activation; after release the old API must not be reused.

This retains the original Harbor loop integer-run variant. Change the literal `runs` to an integer from 0 through 10,000. The explicit worksheet ID and route check prevent writing another sheet if native edits removed the target. It does not infer arbitrary row reordering.

```ts
const runs = 8
if (!Number.isInteger(runs) || runs < 0 || runs > 10000)
  throw new Error('Runs must be an integer from 0 to 10000. No cell was written.')
const sheet = univerAPI.getWorkbook('cedar-routes')?.getSheetBySheetId('routes')
if (sheet?.getRange('A4').getValue() !== 'Harbor loop') throw new Error('Harbor loop target is absent.')
sheet.getRange('C4').setValue(runs)
await univerAPI.getFormula().onCalculationResultApplied(10000)
console.log(sheet.getRange('F18').getDisplayValue())
```

The total is the SDK's real SUM result, not a host calculation. A calculation timeout after a write does not undo that write.

```ts
const sheet = univerAPI.getWorkbook('cedar-routes')?.getSheetBySheetId('routes')
if (sheet?.getRange('A4').getValue() !== 'Harbor loop') throw new Error('Harbor loop target is absent.')
sheet.getRange('C4').activate()
```

## Save and restore complete content

```ts
const workbook = univerAPI.getWorkbook('cedar-routes')
if (!workbook) throw new Error('Load the route editor first.')
const snapshot = workbook.save()
console.log(snapshot)
```

For this host block add `import { validateSnapshot } from './data'` to the standalone entry. Validation runs before releasing the current editor; it does not rewrite IDs, styles, types or resources. Reconstruction does not promise to preserve selection, focus, scroll or Undo/Redo stacks.

```js
const snapshot = validateSnapshot(demo.univerAPI.getWorkbook('cedar-routes').save())
await demo.release()
await demo.load(snapshot)
```

## Empty and boundary variants

For these blocks add `import { createRoutes } from './data'` to the entry. They preserve the original data variants without a fixture panel.

```js
await demo.release()
await demo.load(createRoutes('empty'))
```

```js
await demo.release()
await demo.load(createRoutes('boundary'))
```

Empty keeps the title, headers and real zero SUM. Boundary sets the original two runs cells to 0 and 10,000. Default retains twelve distinct routes, three hubs, varied decimal distances and illustrative USD rates for the fixed planning week March 29, 2027. There is no simulated error data variant.

## Real JSON download

```ts
const workbook = univerAPI.getWorkbook('cedar-routes')
if (!workbook) throw new Error('Load the route editor first.')
const url = URL.createObjectURL(new Blob([JSON.stringify(workbook.save(), null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'cedar-community-routes.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 1000)
```

## Theme and final unmount

```js
demo.setDarkMode(true)
demo.setDarkMode(false)
await demo.dispose()
await demo.dispose()
```

Final host disposal invalidates pending imports and disconnects visibility observation. An already created editor aborts readiness waits, settles formula work with a 10-second host deadline, calls real `disposeUnit(id)` and verifies `getWorkbook(id) === null`, releases its lifecycle subscription and core owner, and checks that old canvases are disconnected. The host does not erase DOM nodes to simulate SDK cleanup.

Calculation teardown failures request `stopCalculation()`, then still attempt all cleanup steps and preserve errors. Failed cleanup does not enable creation of another owner over an unresolved previous owner. Browser module/CSS caches remain after release. A host deadline cannot interrupt synchronous SDK work or prove acknowledgment by arbitrary external asynchronous formulas.

## Evidence and remaining boundaries

Native C4 editing followed by Undo restores the displayed runs but leaves `sheets.routes.cellData.3.2.t = 2`, absent in the baseline full snapshot. This remains a strict history failure. Redo and separately tested editing/history after full saved restoration compare exactly. Historical reports also retain the original same-URL Retry failure after a genuine aborted editor JavaScript request. The corrected host no longer offers that ineffective action: it tells users to save other page work and explicitly refresh. The current full test checks this guidance and browser reload recovery with English UI independently on English and Chinese host pages. No synthetic failure toggle, automatic reload or cache-busting module URL masks the boundary.

The seed's existing explicit defined-name `'{}'` resource is unchanged. Tests compare full raw snapshots without normalizing SDK-inferred types/styles, resource strings or IDs. Historical fault-injection reports patched Facade methods and do not establish production network behavior; they are retained as historical evidence, not reused as current acceptance. Internal core-disposal failure recovery and external formula-stop acknowledgment remain unverified without modifying the SDK. This is frontend HTML integration, not the Pro Embed plugin or an iframe bridge.

The host now distinguishes import failure from initialization failure instead of offering a known ineffective same-URL Retry after import rejection. The earlier strict network report is retained. `scripts/test-cedar-import-recovery.mjs` verifies an actually aborted production editor chunk, disabled retry, save-before-refresh instructions and successful explicit browser reload with a real workbook/formula result and official white SDK workbench. See `test-results/cedar-import-recovery/report.json`. This selected recovery check does not resolve the separate native Undo failure or certify every initialization-error path.
