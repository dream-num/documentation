# Willow / Capacity map

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

A fictional exhibition studio plans one week of Editorial, Production and Access work. The native Board embeds its source Sheet as a real BoardFloating object. Eight native Formula Shapes read stable external references to that Sheet: available hours, planned hours, remaining hours, utilization, three team balances and a scope signal. The application never calculates displayed totals itself.

## Read the whole map

The initial capacities are 128 / 112 / 80 hours; planned work is 92 / 104 / 80. Totals are **320 available, 276 planned, 44 remaining, 86.25% utilization**. Team headroom is **36 / 8 / 0**. The signal says **Within capacity**, but this is an aggregate, not a guarantee that every team has room.

The three bound connectors explain the shared source. They are not workflow automation. Moving a card does not allocate staff. The text and geometry stay authored while native formulas recalculate. Formula count-up animation is disabled through the public API so comparison values remain legible.

Composition: Sheet@Board Float. Dependency: Sheet -> Board. There is no implicit write-back from a result card to its source. Double-click the Sheet and use the native fullscreen control to edit. Board uses its own native floating tools; the embedded Sheet uses the default Grid ribbon with its matching plugins.

## Nine literal examples

Use the running demo's `univerAPI`. Run these exact snippets in order; they are not simplified substitutes for the executing source.

### 1. A local overload hidden by the total

Production planned hours become 128. Total planned hours are 300, remaining hours 20, utilization 93.75%. Team balances are 36 / -16 / 0. The aggregate signal remains Within capacity: look at the team cards too.

```ts
univerAPI.getWorkbook('willow-studio-capacity').getSheetBySheetId('capacity').getRange('C6').setValue(128)
```

### 2. Revise the capacity assumption

Production available hours become 144. Total capacity is 352, planned hours 300, remaining hours 52, utilization 85.23%. Production has 16 hours left; Editorial and Access are unchanged. This is a model assumption, not an overtime instruction.

```ts
univerAPI.getWorkbook('willow-studio-capacity').getSheetBySheetId('capacity').getRange('B6').setValue(144)
```

### 3. Expose a studio-wide overload

Access planned hours become 148. Total planned hours of 368 exceed capacity of 352: remaining hours -16, utilization 104.55%, Access balance -68. The native IF formula changes its signal to Rebalance scope.

```ts
univerAPI.getWorkbook('willow-studio-capacity').getSheetBySheetId('capacity').getRange('C7').setValue(148)
```

### 4. Zero capacity is not silently replaced

Capacity becomes zero. Planned hours remain 368, total balance is -368, team balances -92 / -128 / -148. Utilization shows the native #DIV/0! result. No JavaScript fallback or manual refresh is applied.

```ts
univerAPI.getWorkbook('willow-studio-capacity').getSheetBySheetId('capacity').getRange('B5:B7').setValues([[0], [0], [0]])
```

### 5. Recover the original assumptions

All eight outputs return to the baseline. Only the six Sheet inputs change; the authored Board text, card layout and connector bindings remain intact.

```ts
univerAPI.getWorkbook('willow-studio-capacity').getSheetBySheetId('capacity').getRange('B5:C7').setValues([[128, 92], [112, 104], [80, 80]])
```

### 6. A blank input is not an invalid string

Clear the Production planned input without clearing its formatting. SUM treats the blank as zero: planned hours 172, remaining hours 148, utilization 53.75%. The direct Production balance is 112. Missing workload is not proof of available people; inspect the source before using this result.

```ts
univerAPI.getWorkbook('willow-studio-capacity').getSheetBySheetId('capacity').getRange('C6').clearContent()
```

### 7. Text can hide behind a plausible aggregate

SUM ignores the non-numeric text, so the total still says 172 planned and 148 remaining. However, the Production subtraction displays native #VALUE!. This intentionally demonstrates why a successful aggregate does not certify source data quality.

```ts
univerAPI.getWorkbook('willow-studio-capacity').getSheetBySheetId('capacity').getRange('C6').setValue('pending')
```

### 8. Repair the input

Restore the numeric value. All eight outputs return to their initial values without resetting the Board or refreshing the application.

```ts
univerAPI.getWorkbook('willow-studio-capacity').getSheetBySheetId('capacity').getRange('C6').setValue(104)
```

### 9. Inspect formulas and save native models

```ts
const board = univerAPI.getBoard('willow-capacity-map')
const results = ['available', 'planned', 'remaining', 'utilization', 'editorial-free', 'production-free', 'access-free', 'capacity-signal'].map(id => ({ id, result: board.getShape(id).getFormulaResult() }))
const boardSnapshot = board.save()
const sheetSnapshot = univerAPI.getWorkbook('willow-studio-capacity').save()
console.log({ results, boardSnapshot, sheetSnapshot })
```

Native snapshots preserve editable model resources; this is not an Exchange file conversion. Browser reload recreates the authored scenario and discards local edits. Saved-resource reload/rebinding requires its own acceptance test.

## Presentation and acceptance

The saved Miro diagram-library reference informs branching relationships, not artwork or product claims. Navy title, blue/lavender/amber/teal cards and original English content use the SDK's native rendering. EN/ZH guide metadata is included. No competitor assets, fixture panel, duplicated custom ribbon buttons, iframe child substitutes or backend services are exported. Required SDK CSS travels with the standalone source, and Preview calls the same createDemo factory. SDK license notices are not hidden; published use needs the applicable Pro license.

Partial, not full acceptance. Selected browser checks verify the nine literal examples, all eight final native rendered results, shared versus isolated dependencies, unchanged authored text/geometry/connector bindings, zero/blank/non-numeric inputs, native error statuses and recovery. Native fullscreen Sheet canvas typing, exact workbook Undo/Redo, five populated Grid tabs and active-fullscreen disposal pass. No browser errors or backend requests were observed.

Native Print opens the correct Capacity plan in a one-page preview and cancels successfully. This is not a generated PDF, actual printer output, Board printing or Exchange conversion claim. EN/ZH guide examples and theme changes preserve the API owner and both models except the Board's native palette regeneration; the theme ID and all authored content remain unchanged. Eleven-file independent export contains twenty official SDK CSS imports and a white native workbench.
