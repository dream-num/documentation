# Kestrel inventory: mount, dispose and remount

A reusable host card with 18 original trailworks stock records. Edit the native grid, add or rename worksheets, use native Undo/Redo, then choose a lifecycle action. The six host buttons are real integration controls, not duplicate cell editors.

- **Mount** creates a fresh default workbook only when no editor is mounted.
- **Dispose editor** unloads the workbook and releases its SDK owner; the card and mount element remain.
- **Remount content** saves the entire current workbook before replacing its owner.
- **Save checkpoint / Restore checkpoint** keep an explicit independent snapshot in host memory.
- **Download JSON** downloads the real current snapshot locally. This is not XLSX conversion.

Content, worksheet IDs and resources are supplied unchanged to reconstruction. Focus, selection, scroll and Undo/Redo history are not persisted by a workbook snapshot. Checkpoints are local and disappear when the host itself is disposed. Theme changes retain the owner, edits and checkpoint; a subsequently mounted editor uses the current theme. EN/ZH SDK packs and host labels are selected from the initial document language. The complete official Sheets Core CSS is imported by the same factory used by Preview and the standalone entry.

## Run and verify

Open `http://localhost:3030/en-US/playground/embed/mount-dispose-remount`. The independent export contains `src/create-demo.ts`, unchanged inventory data, official CSS imports and the React integration reference. Install the exact generated package versions in the exported directory, then run `npm run dev`.

Run the guide-target test with `node scripts/test-embed-kestrel-lifecycle-native.mjs`; override `SHOWCASE_DEMO_URL` or `SHOWCASE_BASE_URL` as needed. Full ownership/startup tests require the test-only standalone harness:

```powershell
$env:SHOWCASE_BUILD_STANDALONE='1'
$env:SHOWCASE_VITE_DIRECTORY='<USERPROFILE>/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
$env:SHOWCASE_RESULTS_DIR='test-results/kestrel-lifecycle-native'
node scripts/test-embed-kestrel-lifecycle-native.mjs
```

Only this selected case is built on port 4416. The test resolves individually linked dependencies against the exact exported versions; it does not install packages or use another demo's report.

## Save complete content

Each TypeScript block below is independently runnable in the preview browser console, where `univerAPI` refers to the current owner. Read it again after a remount: the previous Facade belongs to a disposed owner.

```ts
const workbook = univerAPI.getWorkbook('kestrel-inventory')
if (!workbook) throw new Error('Mount the inventory first.')
const snapshot = workbook.save()
console.log(snapshot)
```

## Stable-SKU quantity variant

The original quantity operation remains available as explicit Facade code. Change `sku` and `quantity` to try zero, a million or a fraction. Validation happens before writing. The worksheet's stable ID, not its current name or active tab, identifies the inventory. If native edits remove that sheet or SKU, this block rejects without modifying another sheet.

```ts
const sku = 'KT-103'
const quantity = 37.125
if (!Number.isFinite(quantity) || quantity < 0 || quantity > 1000000 ||
    Math.abs(quantity * 1000 - Math.round(quantity * 1000)) > 0.000001)
  throw new Error('Quantity must be 0–1,000,000 with at most three decimal places.')
const sheet = univerAPI.getWorkbook('kestrel-inventory')?.getSheetBySheetId('stock')
if (!sheet) throw new Error('The stock worksheet is missing.')
const row = sheet.getRange('A4:F36').getRawValues().findIndex((values) => values[0] === sku)
if (row < 0) throw new Error('The SKU is missing.')
sheet.getRange(row + 3, 3).setValue(quantity)
await univerAPI.getFormula().onCalculationResultApplied(10000)
```

## Locate a stock cell after native tab changes

```ts
const sheet = univerAPI.getWorkbook('kestrel-inventory')?.getSheetBySheetId('stock')
if (!sheet) throw new Error('The stock worksheet is missing.')
const row = sheet.getRange('A4:F36').getRawValues().findIndex((values) => values[0] === 'KT-103')
if (row < 0) throw new Error('The SKU is missing.')
sheet.getRange(row + 3, 3).activate()
```

## Real missing-unit result

This intentionally uses an absent ID. It is not a synthetic error fixture. A false return leaves the current workbook untouched.

```ts
const disposed = univerAPI.disposeUnit('kestrel-not-loaded')
if (disposed !== false) throw new Error('Unexpected disposal of a missing workbook.')
console.log(disposed)
```

## Download a full JSON snapshot

```ts
const workbook = univerAPI.getWorkbook('kestrel-inventory')
if (!workbook) throw new Error('Mount the inventory first.')
const url = URL.createObjectURL(new Blob([JSON.stringify(workbook.save(), null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'kestrel-inventory.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 1000)
```

## Replace an owner with its saved content

The following JavaScript blocks run in `src/index.ts` after `await demo.ready`. The `demo` and `container` variables come from that entry; these are genuine host integration functions, not invented Facade methods. In the independent test harness they are exposed solely for verification.

```js
const saved = demo.univerAPI.getWorkbook('kestrel-inventory').save()
await demo.replace(saved)
```

`replace` validates and clones the incoming snapshot **before** releasing the current editor. Duplicate sheet IDs, missing ordered worksheets, a wrong workbook ID and empty sheet orders are rejected. A user-deleted `stock` worksheet is not reinserted. A concurrent operation rejects instead of creating another owner. Native controls are disabled synchronously until settlement.

## Empty and boundary inventories

For each block, add `import { createInventory } from './data'` to the standalone entry. These preserve the original title, headers, styling and schema, without an external fixture selector.

```js
await demo.replace(createInventory('empty'))
```

```js
await demo.replace(createInventory('boundary'))
```

The boundary snapshot contains actual values 0, 1,000,000 and 0.125 in D4:D6. `createInventory('default')` restores the original 18 records. The legacy `error` data alias has the same content as default; use the real missing-unit block above to exercise the error boundary.

## Theme and final host cleanup

```js
demo.setDarkMode(true)
demo.setDarkMode(false)
await demo.dispose()
await demo.dispose()
```

Cleanup aborts pending mount readiness, waits for calculation settlement with a 10-second host deadline, calls `disposeUnit(id)`, verifies `getWorkbook(id) === null`, releases the lifecycle subscription, then calls core `Univer.dispose()`. It checks that the old canvases are disconnected instead of clearing the container to simulate disposal. Repeated host disposal shares the same cleanup promise.

On calculation-wait failure, cleanup requests `stopCalculation()`, still attempts all cleanup steps and reports the original and subsequent failures as an AggregateError. A deadline cannot interrupt synchronous SDK work, and a stop request does not prove acknowledgment from an external custom formula. Internal SDK cleanup-failure recovery remains unproven without changing the SDK. This is a frontend owner-lifecycle example, not the nested Pro Embed plugin.

## Strict verification boundaries

The native first edit of D4 followed by Undo restores the displayed quantity but leaves the SDK-inferred numeric type at `sheets.stock.cellData.3.3.t = 2`, absent in the original saved model. This is a strict full-model history **FAIL**, not normalized away. Redo and the separately tested fresh edit after checkpoint restoration retain exact full-model comparisons. Native paper-white rendering, same-ID saved remount, checkpoint restoration, empty/boundary startup, pending-click guards and pre-ready cleanup have separate checks; their success does not resolve this Undo discrepancy.

The original seed explicitly contains the defined-name resource data `'{}'`; arbitrary saved resources are never rewritten to match it. Full-model comparisons keep every field, style, inferred type and resource. Native Undo or SDK reconstruction differences must remain failures even if the visible value is correct. Runtime results and raw diffs are written independently of source/CSS checks; consult the latest dedicated lifecycle report for the exact accepted and unresolved checks.
