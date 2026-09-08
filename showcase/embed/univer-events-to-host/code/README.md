# Juniper launch: SDK events to the host

Eight original milestones cover accessibility, migration rehearsal, translation, partners, release notes, support, load testing and final readiness. Owners, progress, dates and next steps are deliberately different. Edit the native Grid or click a cell; the compact host log below it records actual SDK callbacks. Only subscription and log clearing remain host controls. There are no fixture, fixed-write, fixed-selection, Reset or full-snapshot inspector panels.

The latest 12 events retain monotonically increasing sequence numbers. Value events contain SDK-reported sheet IDs, A1 ranges and raw values; selection callbacks contain zero-based coordinates. Payloads are cloned when received and rendered with `textContent`, never HTML. Filtering excludes other workbook owners. Unsubscribe disposes both handles without disabling editing. Resubscribe receives future events; the SDK may immediately report the current selection, but missed value changes are not replayed. Clear removes entries only, not sequence numbers, subscriptions or workbook data. No invented timestamps or synthetic SDK events are used.

## Run and use

Generated project: `npm install`, then `npm run dev`. Documentation: `/en-US/playground/embed/univer-events-to-host`. Use the native name box to choose C4, type a new progress value and press Enter. Click E4 directly to observe `onSelectionChange`; `FRange.activate()` changes selection but did not emit that move-end callback in the earlier SDK acceptance. Keep this distinction—do not synthesize a selection event.

Preview and export share the same factory, official Sheets core CSS and complete English preset locale pack. The native editor, host controls and original data stay English on either documentation language. The legacy third argument is ignored so saved snapshots remain in the fourth position. Theme changes retain the owner, edits and feed; host chrome follows the same theme. Startup is bounded to 20 seconds and requires a live Grid without the skeleton. Disposal aborts DOM listeners, cancels frames, releases activity handles and removes its own owner/DOM. There is no extra CommandExecuted readback listener now that the inspector is gone.

## Literal host integration

Run the following nine `ts` snippets sequentially in one async host module after `window.univerAPI` is ready. They create an independent host subscription, separate from the visible feed. The dedicated test executes each literal in the same retained lexical scope and checks the real received data.

### 1. Bind both real callbacks and filter workbook identity

```ts
const api = window.univerAPI
const workbook = api.getActiveWorkbook()
const received = new Map()
let eventNumber = 0
function bindEvents() {
  return [
    api.addEvent(api.Event.SheetValueChanged, ({ effectedRanges }) => {
      const ranges = effectedRanges.filter(range => range.getUnitId() === workbook.getId())
      if (ranges.length) received.set(++eventNumber, {
        source: 'SDK SheetValueChanged',
        detail: ranges.map(range => ({ sheet: range.getSheetId(), range: range.getA1Notation(), values: range.getRawValues() })),
      })
    }),
    workbook.onSelectionChange(selections => {
      if (api.getActiveWorkbook()?.getId() !== workbook.getId()) return
      received.set(++eventNumber, {
        source: 'SDK onSelectionChange',
        detail: { sheet: workbook.getActiveSheet()?.getSheetId(), selections: structuredClone(selections) },
      })
    }),
  ]
}
let binding = bindEvents()
```

### 2. Preserve the original guarded host-write capability

```ts
function applyAuditProgress(value) {
  const sheet = workbook.getSheetBySheetId('milestones')
  if (sheet?.getRange('A4').getRawValue() !== 'Accessibility audit') throw new Error('Audit milestone absent')
  if (!Number.isInteger(value) || value < 0 || value > 100) throw new Error('Progress must be an integer from 0 to 100')
  sheet.getRange('C4').setValue(value)
}
applyAuditProgress(50)
console.assert(workbook.getSheetBySheetId('milestones').getRange('C4').getRawValue() === 50)
```

This guard belongs to the host write workflow; it intentionally does not impose validation on native Grid editing.

### 3. Reject invalid host input before calling the SDK

```ts
for (const invalid of [-1, 101, 1.5, '', null]) {
  let rejected = false
  try { applyAuditProgress(invalid) } catch { rejected = true }
  console.assert(rejected)
}
console.assert(workbook.getSheetBySheetId('milestones').getRange('C4').getRawValue() === 50)
```

### 4. Activate a real range; do not fabricate a selection callback

```ts
const nextStep = workbook.getSheetBySheetId('milestones').getRange('E4')
nextStep.activate()
console.assert(workbook.getSheetBySheetId('milestones').getSelection().getActiveRange().getA1Notation() === 'E4')
```

### 5. Keep an explicit host-memory snapshot independently of later edits

```ts
const checkpoint = structuredClone(workbook.save())
applyAuditProgress(65)
console.assert(checkpoint.sheets.milestones.cellData[3][2].v === 50)
console.assert(workbook.getSheetBySheetId('milestones').getRange('C4').getRawValue() === 65)
```

This is an explicit `save()` read into host memory, not an SDK save-completed event, persistent storage, file conversion or network operation. It remains possible while the visible feed is unsubscribed.

### 6. Unsubscribe both handles without stopping the editor

```ts
binding.forEach(handle => handle.dispose())
const receivedBeforeUnsubscribe = received.size
applyAuditProgress(70)
await new Promise(resolve => requestAnimationFrame(resolve))
console.assert(received.size === receivedBeforeUnsubscribe)
```

### 7. Rebind for future changes, not replay

```ts
binding = bindEvents()
applyAuditProgress(80)
await new Promise(resolve => requestAnimationFrame(resolve))
console.assert([...received.values()].some(event => event.source === 'SDK SheetValueChanged' && event.detail.some(range => range.range === 'C4' && range.values[0][0] === 80)))
console.assert(![...received.values()].some(event => event.source === 'SDK SheetValueChanged' && event.detail.some(range => range.range === 'C4' && range.values[0][0] === 70)))
```

### 8. Clear host records only

```ts
received.clear()
console.assert(received.size === 0)
console.assert(workbook.getSheetBySheetId('milestones').getRange('C4').getRawValue() === 80)
console.assert(checkpoint.sheets.milestones.cellData[3][2].v === 50)
```

### 9. Release the independent example subscription

```ts
binding.forEach(handle => handle.dispose())
```

The visible feed keeps its own two handles. Its bounded retention policy is implemented transparently in `create-demo.ts`; the independent Map above is for the short example session, not an unbounded production log.

## Complete owner recovery and original startup variants

The generated entry owns mutable `demo` and `container`; it imports `createDemo`. For the two variant snippets also import `createMilestones` from `./data` in that entry. The standalone test-only harness supplies precisely these bindings, not alternate event implementations. Validation must precede disposal; snapshots retain all fields, IDs and resources.

### Same-ID saved recovery with fresh subscriptions

```js
const saved = structuredClone(demo.univerAPI.getActiveWorkbook().save())
if (!saved.id || !saved.sheetOrder?.length || !saved.sheetOrder.every(id => saved.sheets?.[id]?.id === id)) throw new Error('Invalid workbook snapshot')
const dark = demo.univerAPI.isDarkMode()
const locale = demo.univerAPI.getCurrentLocale()
demo.dispose()
demo = createDemo(container, dark, locale, saved)
await demo.ready
console.assert(demo.univerAPI.getActiveWorkbook().getId() === saved.id)
```

A new owner has new local Undo history, an empty host event history apart from any initial SDK selection callback, and new subscriptions. Old events are not replayed. The test must compare the complete snapshot and then exercise a fresh native edit; a similar screenshot is insufficient.

### Empty template

```js
demo.dispose()
demo = createDemo(container, false, undefined, createMilestones('empty'))
await demo.ready
console.assert(demo.univerAPI.getActiveWorkbook().getActiveSheet().getRange('A4').getRawValue() == null)
```

The eight milestone rows are absent, headers remain and the guarded audit write above must reject the missing milestone. Native editing remains available.

### Boundary template

```js
demo.dispose()
demo = createDemo(container, false, undefined, createMilestones('boundary'))
await demo.ready
console.assert(demo.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').getRawValue() === 0)
console.assert(demo.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C5').getRawValue() === 100)
```

Use `createMilestones('default')` for the original eight rows and 35/80 progress values. These are explicit startup/reconstruction choices, not a destructive Reset control.

## Verification and limits

Current English-only evidence: `test-results/univer-events-english-native/report.json`
records 8/10 strict gates and 30 checks. Full English packs on a Chinese host,
all nine literal examples, native event payloads, unsubscribe/rebind, owner
filtering, empty/boundary data and same-owner themes pass. The two complete Undo
comparisons below still fail; there are no observed browser errors or backend
requests. Independent production source/CSS/startup evidence is recorded in
`test-results/embed-integration-english/report.json`.

The historical bilingual independent native run records **8 of 10 gates passing, 30 checks**, zero browser errors/warnings and zero backend requests. Actual typing/selection payloads, three unsubscribe/rebind cycles without duplicate value events or replay, other-workbook native filtering, bounded safe text rendering, all nine literal subscription/validation/memory-save examples, empty/boundary/default variants, complete EN/ZH, same-owner theme/feed retention and 760/390/320px controls pass. All three lifecycle/startup `js` snippets execute against the shared factory. That run does not establish acceptance after the English-only migration; rerun the selected native test for current evidence.

Two gates remain strict FAIL: native E4 Undo and fresh-owner E4 Undo each leave a generated style entry and add `t: 1` to the original cell. Both Redo snapshots match exactly. The complete same-ID owner snapshot itself matches exactly, and new native edits produce one real event without observable callbacks mutating the already-disposed host DOM. That DOM check does not claim to prove all SDK-internal heap lifetimes. No snapshot fields or IDs are normalized. The first run is retained separately; its empty-value assertion and pre-disposal DOM baseline were corrected in the second run without changing the SDK.

`node scripts/test-univer-events-native.mjs` defaults to `http://localhost:3030/en-US/playground/embed/univer-events-to-host`; override `SHOWCASE_BASE_URL` or `SHOWCASE_DEMO_URL`. Lifecycle, other-owner filtering and startup variants require the standalone test-only harness:

```powershell
$env:SHOWCASE_BUILD_STANDALONE='1'
$env:SHOWCASE_VITE_DIRECTORY='<USERPROFILE>/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
$env:SHOWCASE_RESULTS_DIR='test-results/univer-events-native'
node scripts/test-univer-events-native.mjs
```

Only this case is built with exact-version package junctions and port 4416 is closed afterward. Preserve strict full-history/recovery differences and the original selection-callback boundary. The older `test-host-events.mjs` and ownership reports targeted removed controls and a theme-recreated owner; they are historical evidence, not acceptance of this migration. Callback-registration faults before a handle is returned, SDK-internal cleanup failures, concurrent overlapping owners and cross-browser behavior remain separate acceptance work. Feed retention is bounded by entry count, not payload bytes.
