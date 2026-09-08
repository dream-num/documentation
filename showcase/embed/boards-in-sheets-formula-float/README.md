# Delta / Resource allocation map

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

A Sheet owns six editable capacity/allocation inputs. Its native floating Board reads thirteen Formula Shapes and three bound connectors. **Board@Sheet Float** describes placement; **Sheet -> Board** describes calculation. This is not the reverse Sheet@Board example or a Tab surface.

A fictional product studio has 480 hours of capacity and 425 assigned. Its 55-hour overall buffer hides a 10-hour Build overload. Original teal, clay, sage and amber artwork uses a clear title/contrast hierarchy inspired by the saved Gamma Budget Review cover; no competitor artwork is redistributed.

Double-click the native Board to activate its editing tools. Use its own fullscreen control for more room. No custom feature card, fixture panel, duplicate ribbon buttons or JavaScript aggregation is included. The source uses native Grid ribbon; the Board retains its native floating tools. Full English dependency packs and official CSS accompany the standalone source.

## Twenty-one literal examples

Run these in order in the standalone page or demo iframe. Source values, not application-maintained totals, drive every Formula Shape. These are illustrative planning hours, not employee records or an automatic allocation/approval service.

### 1. Increase the Quality allocation

Assigned becomes 450, total buffer 30. Build remains overloaded by 10 hours.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('C7').setValue(130)
```

### 2. Relieve the Build bottleneck

Build drops to 190. Total assigned is 430 and no team is over capacity; the prompt changes.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('C6').setValue(190)
```

### 3. Lose availability without changing scope

Build capacity falls to 170. Total buffer is still positive at 20, but Build is overloaded by 20.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('B6').setValue(170)
```

### 4. Expose a second local overload

Design allocation rises to 150: 2 teams overloaded and total buffer -20.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('C5').setValue(150)
```

### 5. Add capacity to only one team

Design capacity 160 resolves Design overload, not Build. The positive total buffer is not a staffing recommendation.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('B5').setValue(160)
```

### 6. Leave an allocation blank

The source stores null. SUM excludes it and arithmetic treats it as zero, but the direct Build Formula Shape remains blank; do not call it measured zero.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('C6').setValue({v:null})
```

### 7. Record explicit zero

The Build card now displays 0 h. Compare its stored value with the previous blank.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('C6').setValue(0)
```

### 8. Restore the original model

Capacity 480, allocation 425, total buffer 55; Build is still overloaded.

```ts
const sheet = window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation')
sheet.getRange('B5:C7').setValues([[120,110],[200,210],[160,105]])
```

### 9. Set one capacity to zero

Build utilization has no denominator; the peak-utilization shape exposes native #DIV/0! while other totals remain meaningful.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('B6').setValue(0)
```

### 10. Set all capacity to zero

Both total utilization and peak utilization expose division errors. All three teams have positive load against zero capacity.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('B5:B7').setValues([[0],[0],[0]])
```

### 11. Recover from zero capacity

Restore the six inputs; errors must clear without manual refresh.

```ts
const sheet = window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation')
sheet.getRange('B5:C7').setValues([[120,110],[200,210],[160,105]])
```

### 12. Inspect text in a numeric Sheet cell

A Sheet cell can store text. SUM ignores pending while arithmetic and division expose native #VALUE!. Compare direct text, totals and local failures rather than coercing a successful result.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('C6').setValue('pending')
```

### 13. Recover the numeric allocation

Build allocation returns to 210 and every baseline result returns.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('C6').setValue(210)
```

### 14. Rename a display label

Changing the visible team label does not relocate cell-based references. The authored Board heading remains Build; it is intentionally not a formula-linked label.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('A6').setValue('Engineering')
```

### 15. Rename the workbook

The original qualifier Delta Capacity remains mapped to the same stable source unit.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').setName('Delta / Capacity review')
```

### 16. Prove live calculation after rename

Quality allocation becomes 130 and the Board reports 450 assigned and 30 total buffer.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('C7').setValue(130)
```

### 17. Bind an unavailable source

Deliberately use a missing source ID. Preserve native reference errors, not last-good totals.

```ts
window.univerAPI.getFormula().upsertExternalReference({unitId:'delta-allocation-map',qualifier:'Delta Capacity',sourceUnitId:'delta-unavailable-source',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET})
```

### 18. Repair the same source

Current values must return without replacing Board text, formulas or connectors.

```ts
window.univerAPI.getFormula().upsertExternalReference({unitId:'delta-allocation-map',qualifier:'Delta Capacity',sourceUnitId:'delta-studio-capacity',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET})
```

### 19. Preview Sheet Print

Click the source Sheet first. This registered frontend plugin previews the Sheet; it is not a claim of embedded-Board print fidelity or PDF conversion.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').setActiveSheet('allocation')
window.univerAPI.executeCommand('sheet.operation.print-open')
```

### 20. Close Print

Do not submit a print job.

```ts
window.univerAPI.getWorkbook('delta-studio-capacity').closePrintDialog()
```

### 21. Inspect independent owners

Read-only snapshots preserve source and Board resources. They are not durable storage or a collaboration history.

```ts
console.log({sheet:window.univerAPI.getWorkbook('delta-studio-capacity').save(),board:window.univerAPI.getBoard('delta-allocation-map').save()})
```

## Reconstruct both native owners

In the standalone entry module use `let demo = createDemo(container)` so the application can replace its handle. Keep the imported factory and mount element. Wait for calculation to settle before saving. The Sheet contains a reference to its floating Board, not the Board's complete snapshot.

```js
const saved = JSON.parse(JSON.stringify({
  host: demo.univerAPI.getWorkbook('delta-studio-capacity').save(),
  board: demo.univerAPI.getBoard('delta-allocation-map').save(),
}))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
await demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
```

Both snapshots are cloned before use. Restore retains edited formulas, notes, connector bindings, drawing placement and external reference resources; it does not reseed starter Formula Shapes or silently repair an unavailable source. Invalid unit IDs, missing owner pages and missing native Float resources/anchors are rejected before mounting another owner. This is in-memory reconstruction, not durable storage, Exchange import or collaboration history. The awaited disposal also releases an active native fullscreen session before rebuilding.

## Acceptance boundary

Partial native runtime: test-results/embed-delta-formula-native/report.json passes twenty-one literal examples and six selected gates. Eighteen source steps alternate active Sheet/Board contexts and update thirteen current-canvas results while preserving authored shapes, text, formulas and connector bindings. Three rendered connector routes resolve to the expected shape sites. Native Sheet keyboard input with exact serialized Undo/Redo, native Board text Facade editing with exact history/source isolation, host-owned Print preview/cancel, fifteen complete EN/ZH dependency packs, light-dark-light whole-model preservation, fullscreen source updates and active-fullscreen disposal pass. No unexpected browser errors, warnings, native error-status mismatches or backend requests occur.

The earlier source-input test selected its canvas while the Board was active and failed before typing. The current test first leaves the Board and excludes embedded canvases before clicking the real Sheet cell. This is a test targeting correction, not an SDK patch. Whole-table and local calculations remain native, including blank direct values, SUM text exclusion and division/value/reference errors.

Independent source/CSS evidence is in test-results/delta-formula-export-ui/report.json: eleven files match the published source, including fourteen official stylesheets. Both visible workbenches retain SDK styling. Dependencies were exact-version checked and locally linked, not freshly installed; trial notices and selected-build large-chunk warnings remain.

The additional test-results/delta-roundtrip-native/report.json is deliberately **strict FAIL**, not a full-roundtrip acceptance. Three real owner reconstructions pass edited-fullscreen disposal, unavailable-binding retention, and Chinese/dark appearance retention. Source cells, the entire Board page including edited notes/formulas and all three connectors, the saved theme, and the external-reference resource remain unchanged. Thirteen current-canvas results survive restoration and respond to fresh source edits; restoring a missing source keeps native errors until the published binding-repair API is called. Nine malformed owner/resource/anchor combinations are rejected without affecting the existing instance. There are no browser errors, warnings or backend requests.

The exact complete-model comparison retains every difference without normalization: the first reconstruction adds native Sheet Drawing transform defaults (`flipX`/`flipY` false; `angle`/`skewX`/`skewY` zero), changes the empty defined-name resource from an empty string to `{}`, and updates the Embed activation timestamp. The subsequent two reconstructions change only that timestamp. The report saves both complete snapshots and field-level differences; authored content preservation is not mislabeled byte-for-byte equality. The illustrative edited buffer formula adds seven hours only to prove that restoration retains user-authored formulas; the baseline demo does not add this adjustment.

The updated standalone factory also passes test-results/delta-roundtrip-export-ui/report.json: all eleven exported files match the current source, the native workbench background is white, and no browser errors occur. Only this selected demo was built; existing preview services were not replaced.

Different valid-source rebinding, native Board pointer editing/movement and formula-editor/menu paths in both languages, all Sheet menus, actual embedded-Board print/conversion fidelity, supported Exchange, Next guides, responsive/accessibility and performance remain open. Print is only verified as a host Sheet preview and cancel; no job was submitted. Do not interpret a passing selected report or registered route as full SDK acceptance. No backend, publishing, automated work reassignment or SDK/package patch.
