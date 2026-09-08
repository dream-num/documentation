# Calibration queue — native multi-field sorting

Native UI and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged. Bilingual runtime reports below describe earlier revisions, not acceptance of this English-only revision.

The preview contains only the native Base workbench. The original ten instruments retain distinct readiness scores, zones and calibration dates, including zero, a negative score, nulls and exact ties. There are no fixture selectors, custom sort/Inspect/Reset/Undo controls, limitation banners or audit panels. Native trial UI remains visible.

Preview and standalone share one factory, four official SDK stylesheets and all five English dependency packs. The runtime is always English; theme changes preserve the current owner and edits. No backend, custom comparator or SDK modification is used.

## Ten executable Facade examples

Run these literal blocks in order in the loaded demo console. For interactive editing, use the native Sort toolbar, field selector and direction buttons. The examples expose integration variants without duplicating the native panel.

### 1. Inspect actual source and projection

Compare ordered projection IDs with unchanged source record order. No host comparator rearranges the result.

```ts
const api = window.univerAPI
const table = api.getBase('multi-field-sort-base').getTableById('records')
const view = table.getViewById('working')
console.log(view.getSort(), view.getProjection(), table.getRecords().map(record => record.getId()))
```

### 2. Readiness: highest first

95-point Atlas, Flux and Indigo keep their source order. Elm's null is last; zero and negative values remain numeric.

```ts
const api = window.univerAPI
const table = api.getBase('multi-field-sort-base').getTableById('records')
const view = table.getViewById('working')
view.setSort([
  { fieldId: 'score', direction: api.Enum.BaseSortDirection.DESC },
])
```

### 3. Readiness: lowest first

Null comes first, followed by −5, zero and positive numbers. Null is not converted into zero in the source.

```ts
const api = window.univerAPI
const table = api.getBase('multi-field-sort-base').getTableById('records')
const view = table.getViewById('working')
view.setSort([
  { fieldId: 'score', direction: api.Enum.BaseSortDirection.ASC },
])
```

### 4. Zone first, readiness second

Priority follows the array order: Zone ascending, then Readiness descending. Beacon and Cobalt remain stable ties.

```ts
const api = window.univerAPI
const table = api.getBase('multi-field-sort-base').getTableById('records')
const view = table.getViewById('working')
view.setSort([
  { fieldId: 'zone', direction: api.Enum.BaseSortDirection.ASC },
  { fieldId: 'score', direction: api.Enum.BaseSortDirection.DESC },
])
```

### 5. Date first, readiness second

Delta's empty date sorts first. Beacon/Cobalt and Flux/Indigo tie on both keys and retain source order.

```ts
const api = window.univerAPI
const table = api.getBase('multi-field-sort-base').getTableById('records')
const view = table.getViewById('working')
view.setSort([
  { fieldId: 'next', direction: api.Enum.BaseSortDirection.ASC },
  { fieldId: 'score', direction: api.Enum.BaseSortDirection.DESC },
])
```

### 6. Instrument: Z to A

Text ordering uses the actual SDK projection, with Meridian first and Atlas last.

```ts
const api = window.univerAPI
const table = api.getBase('multi-field-sort-base').getTableById('records')
const view = table.getViewById('working')
view.setSort([
  { fieldId: 'instrument', direction: api.Enum.BaseSortDirection.DESC },
])
```

### 7. Clear sorting

An empty sort list restores authored record order without resetting any field values.

```ts
const api = window.univerAPI
const table = api.getBase('multi-field-sort-base').getTableById('records')
const view = table.getViewById('working')
view.setSort([])
```

### 8. Edit a live sort key

Set descending readiness, then change Meridian from 82 to 98. Correct live sorting would put it above Atlas's 95; beta.2's known invalidation defect is tested strictly.

```ts
const api = window.univerAPI
const table = api.getBase('multi-field-sort-base').getTableById('records')
const view = table.getViewById('working')
view.setSort([
  { fieldId: 'score', direction: api.Enum.BaseSortDirection.DESC },
])
table.getRecordById('r01').setValue('score', 98)
```

### 9. Native command history

The APIs share real SDK history. Native toolbar history is used for sorting and keyboard history is checked with the edited grid focused.

```ts
await window.univerAPI.undo()
await window.univerAPI.redo()
```

### 10. Download a complete local snapshot

Includes unchanged source order, every record and view criteria. JSON is not PDF/image conversion and no server receives it.

```ts
const data = window.univerAPI.getBase('multi-field-sort-base').save()
const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'calibration-queue.base.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 0)
```

## Save and really reconstruct edited content

In the application entry, retain imported createDemo, mount container and a replaceable `let demo = createDemo(container)`. After `await demo.ready`, run this code. It actually disposes the old owner and compares the complete saved model; no fields are stripped to force equality. Undo history and pointer focus do not survive. Reset separately disposes and constructs with the original imported `DATA`; it is not a custom Reset button.

```js
const saved = JSON.parse(JSON.stringify(demo.univerAPI.getBase('multi-field-sort-base').save()))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
await demo.ready
```

## Acceptance boundaries

Changing sort criteria, editing a sort key and reconstructing saved content are separate paths. A fresh owner may correctly calculate order even when a live update leaves stale positions; that does not make live re-sorting pass. The earlier beta.2 defect remains a strict regression target. Null model values and their actual native presentation are checked separately. Native UI registration alone is not acceptance.

Selected native verification on SDK `1.0.0-beta.2` confirms two defects without changing the SDK:

- **Live sort remains strict FAIL in both native and Facade paths.** Meridian's stored score and actual painted cell become 98, but both projection and canvas keep it fourth, after Atlas/Flux/Indigo at 95. The expected position is first. Full saved models and actual painted row order are retained in the report.
- **Null presentation remains strict FAIL.** Elm's score remains `null` in the complete model but its native numeric cell paints `0.00`, visually conflating it with Delta's actual zero. Null still participates distinctly in sorting: first ascending and last descending.

Passing checks cover all six original sort variants, native numeric/multiple-field criteria, stable Beacon/Cobalt and Flux/Indigo ties, clearing criteria without changing source data, native toolbar sort Undo/Redo and native grid-keyboard cell Undo/Redo with complete-model comparisons. All ten literal snippets execute; the live-sort snippet is not marked functionally passed. Source record order stays unchanged. Complete edited-owner destruction/reconstruction preserves every serialized field and correctly recalculates the 98-point order in a fresh owner; a subsequent fresh edit paints. Five complete EN/ZH packs, initial Chinese language, same-owner theme changes, local download parity and owned disposal also pass. These scoped results are not 100% SDK acceptance.

## Maintainer checks

From documentation, `node scripts/test-bases-calibration-sort-native.mjs` targets `http://localhost:3030/en-US/playground/bases/multi-field-sort`. Override `SHOWCASE_DEMO_URL` or `SHOWCASE_BASE_URL` as appropriate. The guide route does not expose application lifecycle handles; standalone-only reconstruction is explicitly marked unverified there.

For a complete selected-only harness, first check port 4376 is free. Set `SHOWCASE_BUILD_STANDALONE=1` and supply this case's installed `SHOWCASE_EXPORT_DIRECTORY`, or an exact installed `SHOWCASE_VITE_DIRECTORY`. Run the same script. It creates individual exact-version dependency junctions, never a whole node_modules junction, never installs packages and never reads another case's report to find Vite. Results default to `test-results/calibration-sort-native`; its `exports.json` identifies this selected export.

Build only that export with `pnpm build`, then from documentation run `node scripts/test-showcase-export-ui.mjs test-results/calibration-sort-native/exports.json` with `SHOWCASE_EXPORT_PORT=4376` and `SHOWCASE_RESULTS_DIR=test-results/calibration-sort-native-export-ui`. Keep this UI result directory separate from static source/CSS reports. The normal export entry and harness lifecycle handles are verified separately.

Full operator/locale/browser/touch/accessibility matrices, pending-operation teardown and performance remain separate work. The factory has no host startup timeout; the test enforces a 60-second readiness deadline. Any SDK defect remains strict FAIL, without normalized snapshots or host-side sorting.
