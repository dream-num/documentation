# Independent regional editors

North has six workshop maintenance items; South has six different garden items.
Native formulas calculate each budget. North stays light and South dark, with
separate iframe documents, JavaScript realms and stable workbook IDs. This is
trusted same-origin HTML embedding, not a sandbox security boundary or a Pro Embed
plugin example. Both use Grid, complete English Sheets Core resources and official CSS.
Native UI and host controls stay English on every host language.

Run `pnpm install`, then `pnpm dev`, or `pnpm build` and `pnpm preview`.
The same entry serves the parent and children. The `isolatedRegion` query is
`north` or `south`; other values are rejected.

## Actual host controls

Release destroys only the chosen region's core owner and listeners. Mount creates
that region's authored budget again, not its discarded edits. Download JSON exports
the complete current `FWorkbook.save()`, not XLSX. No fixed-price, fixed-selection,
Reset, fixture selector or raw snapshot panel surrounds the native editor.
Edit quantities and prices directly in the native grid. The total is already in D14.

## Literal source edits

Run the following in the North iframe's console after it is ready. In the parent
console, select the North frame execution context first; these are independent APIs.

### A guarded air-filter price revision

```ts
const api = window.regionalDemo.univerAPI
const sheet = api.getWorkbook('regional-budget-north').getSheetBySheetId('budget')
const price = 21.5
if (!Number.isFinite(price) || price < 0 || price > 100000) throw new Error('Price must be from 0 to 100000')
if (sheet.getRange('A4').getRawValue() !== 'Air filters') throw new Error('Expected air-filter row')
sheet.getRange('C4').setValue(price)
await api.getFormula().onCalculationResultApplied(10000)
console.log(sheet.getRange('D14').getDisplayValue())
```

North's total increases by 33; South must remain unchanged. Change `price` to -1
to exercise host validation without a write. This guard belongs to this recipe,
not native cell protection or an SDK-thrown validation error.

### Inspect the complete native model

```ts
const snapshot = window.regionalDemo.univerAPI.getWorkbook('regional-budget-north').save()
window.regionalSaved = structuredClone(snapshot)
console.log(snapshot)
```

### Empty and boundary source variants

In the child branch of `create-demo.ts`, replace its one initialization line with
either literal below. Build that selected demo. Each region still owns its own
data. Empty retains headers and native zero SUM; boundary sets the first two
prices to zero and 100000 without changing the other four original items.

```ts
const child = createRegion(container, region, 'empty')
```

```ts
const child = createRegion(container, region, 'boundary')
```

### Restore the saved region with its original identity

After running the save recipe, the following replaces only North's SDK owner.
Unlike Mount, it restores the complete edited native model, not authored defaults.
Run it in the same North child context; South keeps its API, theme and full model.
Invalid region/workbook/sheet identities and non-positive dimensions are rejected
before the current owner is released. This is local JSON recovery, not file conversion.

```ts
await window.regionalDemo.restore(window.regionalSaved)
```

`createRegion(container, region, variant, savedSnapshot)` also accepts the same
validated complete model on initial construction. `regionalDemo.ready` resolves
after native rendering lifecycle and calculation, or rejects on startup failure;
the host alert retains that error. Native canvas paint is checked separately.

## Ownership and verification scope

Parent teardown requests both child cleanups before removing the iframes.
A child that has not initialized is removed with its browsing context. Browser
page unload cannot guarantee awaiting asynchronous cleanup. The React Preview
keeps its cancellable passive-effect mount and layout-effect cleanup, so child
windows still exist when owner disposal is requested. Forced teardown aborts
startup waits, stops calculation and synchronously releases listeners and SDK.
Ordinary Release still awaits calculation with a ten-second deadline.

Below 1000px the host stacks two 640px editors. Iframe isolation is not reduced
payload/memory. Cross-origin messaging, imported data and all mobile native menus
are not certified.

The earlier `test-isolated-regions.mjs` and ownership reports exercised removed
fixture/input panels. They are historical, not acceptance of this revised version.
The intermediate `test-isolated-native-cleanup.mjs` report retains the original
strict history failure and is superseded for the broader scope below.

Run `node scripts/test-isolated-native-complete.mjs` for selected-only acceptance.
`test-results/isolated-native-complete/report.json` records the five literal recipes:
three execute in the real child and both empty/boundary replacements are separately
built and opened. Native default/empty/boundary formula values and actual canvas
text are checked; default content and independent white/dark official CSS are retained.

The same suite checks full opposite-owner snapshots, both real JSON downloads,
saved same-ID owner recovery and fresh native edits, invalid-input guards before
owner mutation, full English packs on both host languages, independent theme changes,
320/390/760px stacked hosts and genuine native text editing. It mounts the exact
React Preview under development StrictMode, observes one SDK owner per child and
none in the parent, then tests teardown during native writes, Release, Mount and
initial pending startup. The actual pagehide handler and repeated disposal run too.

**Strict full-history acceptance remains partial:** native South Undo restores
34.6 but adds cell type `t: 2` in C4; full Redo matches. Complete before/after/Undo/Redo
models remain in the report, with no field normalization. The already-edited North
checkpoint's subsequent Undo/Redo passes; that does not erase the original South
failure. The test exits with failure while this discrepancy remains.

These checks do not certify cross-origin isolation/security, reduced memory use,
all mobile native menus, cross-frame messaging or binary file conversion.
