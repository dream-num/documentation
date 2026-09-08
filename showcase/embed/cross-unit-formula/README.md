# Harbor / Fare Sensitivity

Native UI and authored data are English-only, including on Chinese documentation pages. The legacy third locale argument is ignored; the factory does not change the host page language. Historical bilingual reports below remain evidence of earlier revisions, not acceptance of this English-only revision.

A fictional one-day harbour shuttle plan keeps an editable Fare card inside a
native Sheet@Sheet Float. The source workbook also contains Assumptions; the
host contains Budget, Sensitivity and Reference lab. These are two distinct SDK
workbooks in one browser-owned Univer instance, not copied sheets or iframes.

## Follow the live dependency

Six fare categories include a zero-price community pass and a family pass counted
as passes, not individual riders. The opening 516 passes produce USD 2,525 gross
revenue. An illustrative 1,350 operating allowance and ten-percent revenue reserve
leave 922.50. The figures are fictional planning inputs, not transport or financial
advice, bookings, payments or a forecast of actual attendance.

Double-click the floating Fare card and edit sand-colored input cells through the
native editor. Use native fullscreen to reach the source Assumptions worksheet.
Return to the host and use its native sheet tabs for Sensitivity and Reference
lab. Grid is the default ribbon. There are no extra action panels or custom
workbook-switching controls.

VLOOKUP reads a bound external range; multiplication, SUM and ROUND remain native
formulas. Sensitivity follows the budget transitively. Reference lab includes a
single external cell, external range, local dependency and deliberately unavailable
source. No IFERROR or JavaScript calculator replaces SDK results.

## Six literal Facade examples

Run these in order in the preview-frame or standalone console. Activate the named
workbook first with its native Float/fullscreen or host canvas; the SDK owns focus
and undo history. A direct source mutation should update dependent host formulas,
not host authored inputs or source-independent values.

### 1. Source / Revise the single-crossing fare

Gross becomes 2,615 and after-reserve becomes 1,003.50 at opening pass counts.

```ts
window.univerAPI.getWorkbook('harbor-fare-source').getSheetByName('Fare card').getRange('C5').setValue(4.5)
```

### 2. Host / Change the planned pass count

With the preceding 4.50 fare, gross becomes 2,705 and after-reserve becomes 1,084.50.

```ts
window.univerAPI.getWorkbook('harbor-fare-budget').getSheetByName('Budget').getRange('B5').setValue(200)
```

### 3. Source / Expose an invalid numeric input

The source stores text. Its consuming multiplication must expose an actual SDK
formula error rather than silently substituting zero or a stale total.

```ts
window.univerAPI.getWorkbook('harbor-fare-source').getSheetByName('Fare card').getRange('C5').setValue({ v: 'pending', t: 1 })
```

### 4. Source / Recover the valid fare

```ts
window.univerAPI.getWorkbook('harbor-fare-source').getSheetByName('Fare card').getRange('C5').setValue(4.5)
```

### 5. Host / Repair an unavailable binding

The formula in Reference lab B8 stays unchanged; only its stable source binding
changes. The initial Missing Fares target does not exist. After repair it resolves
the loaded Fare card's C5. No network is requested or remote workbook invented.

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'harbor-fare-budget', qualifier: 'Missing Fares', sourceUnitId: 'harbor-fare-source', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET })
window.univerAPI.getFormula().executeCalculation()
```

### 6. Host / Build a reference with a stable identity

This changes Reference lab B5 to the return-trip fare. buildReference persists the
host-owned binding and returns a reference fragment, not a complete formula.

```ts
const reference = window.univerAPI.getFormula().buildReference({ hostUnitId: 'harbor-fare-budget', unit: { unitId: 'harbor-fare-source', formulaQualifier: 'Harbor Fares' }, target: { kind: window.univerAPI.Enum.FormulaReferenceType.SHEET_RANGE, sheetName: 'Fare card', range: { startRow: 5, endRow: 5, startColumn: 2, endColumn: 2 } } })
window.univerAPI.getWorkbook('harbor-fare-budget').getSheetByName('Reference lab').getRange('B5').setFormula('=' + reference)
```

## Binding, CSS and local ownership

create-demo.ts registers the exact-ID local Embed provider. FUniver.createEmbed
creates a genuine sheets-floating-object anchor, then the Formula Facade binds
the host qualifier Harbor Fares to the source unit ID. Names are readable labels;
the ID is the source identity. Unknown Embed unit requests are rejected.

Preview and independent export share code and snapshots, including the official
SDK CSS imports. Navy headings, sand inputs, mint formula outputs and lavender
notes distinguish authored content while the native white workbench remains intact.
All eighteen complete English dependency locale packs are registered;
the nineteen official SDK CSS imports are included in the standalone source.
The cached gamma-budget-review.png is a hierarchy/color reference only; no artwork
is redistributed. All data is original. No collaborative history plugin is used.

The Sheet Print plugin is registered. Actual preview/cancel and correct source
selection still need verification for this same-product combination. Exchange
conversion, generated PDF files, remote file loading and offline external-link
caches are not claimed by this case.

## Acceptance status

Partial, with a failing native-editing gate. Do not type into the source Float as
though it were an accepted editing example: on beta.2 the source fullscreen can
display Fare card while keyboard input changes the host Budget C5 formula instead.
Use the six explicit-workbook-ID Facade snippets to inspect formula behavior.
The original authored data is restored by browser reload.

The native Sheet-in-Sheet policy defers live mounting until stage2. Its current
inactive drawing is blank in the captured UI, so a resolved descriptor does not
prove usable rendering. Removing the demo's startup setCurrent/setActiveSheet did
not resolve keyboard ownership or the blank drawing. No SDK patch, replacement
iframe, fake screenshot or custom calculation was added. Initial diagnostics also
show that the root FWorkbook.getActiveRange reads the global selection and cannot
prove embedded-source selection; root executeCommand printed the host, not source.
Native source Print must be checked through its scoped ribbon, separately.

Still required: correct native source editing and history ownership, both workbooks'
menus and Print, readable passive Float, source/fullscreen focus, saved-resource
reload, failure/delay/empty states, racing disposal, smaller screens, accessibility
and performance. A selected export build is about 18.23 MB JS / 4.52 MB gzip plus
128 KB CSS; this is not performance acceptance or proof of actual PDF generation.
