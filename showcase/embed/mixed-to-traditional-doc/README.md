# Cobalt / Annual operating review

A traditional paginated document hosts two real DocBlocks: a revenue Sheet and
an independently maintained cost Base. Fourteen native inline formulas connect
the executive reading and final reconciliation. A fictional community arts
workshop supplies original, varied assumptions; no live accounts or backend.

Baseline: revenue $86,000; Included costs $57,500; difference $28,500; retained
share 33.1%; target 30%; target headroom $2,700. Optional work is $3,200 across one
of five records. This simplified planning scenario is not financial statements,
an audit opinion, investment advice or an authorization to spend.

## Twenty literal examples

Run these in order in the standalone console or demo iframe. Sources are always
addressed by stable unit IDs, never by whichever product currently has focus.
Single-click a native DocBlock, then use Enter fullscreen for normal editing and
return to the report. Base commands in beta.2 may change global focus; visual
return and native keyboard behavior are separate acceptance gates.

### 1. Increase workshop revenue

Revenue becomes $88,000; costs stay $57,500; difference becomes $30,500.

```ts
window.univerAPI.getWorkbook('cobalt-revenue-plan').getSheetBySheetId('revenue').getRange('B5').setValue(26000)
```

### 2. Revise the venue independently

Included costs become $59,000; revenue stays $88,000; difference becomes $29,000.

```ts
window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getRecordById('cost-2').setValue('amount',15700)
```

### 3. Raise the retained-share target

A 40% target changes only target, gap, headroom and signal. Headroom becomes -$6,200.

```ts
window.univerAPI.getWorkbook('cobalt-revenue-plan').getSheetBySheetId('revenue').getRange('E5').setValue(0.4)
```

### 4. Revise optional work

Optional costs become $6,000. Included costs and the difference do not change.

```ts
window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getRecordById('cost-5').setValue('amount',6000)
```

### 5. Include the residency

All five lines are now Included: costs $65,000; difference $23,000; optional sum zero.

```ts
window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getRecordById('cost-5').setValue('scope','Included')
```

### 6. Context is not arithmetic

No formula changes. Authored report prose is not regenerated from source notes.

```ts
window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getRecordById('cost-1').setValue('note','Review facilitator availability before confirming the programme.')
```

### 7. Filter out every record

The Optional projection is empty. Whole-table formulas remain unchanged; filtering is not changing Scope.

```ts
window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getViewById('costs-grid').setFilter({conjunction:window.univerAPI.Enum.BaseFilterConjunction.AND,conditions:[{fieldId:'scope',operator:window.univerAPI.Enum.BaseFilterOperator.IS,operand:'Optional'}]})
```

### 8. Edit a hidden included record

Materials become $10,700 and included costs $66,000, despite the empty visible projection.

```ts
window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getRecordById('cost-3').setValue('amount',10700)
```

### 9. An unknown amount

Partner services is stored as null, not measured zero. SUMIF omits it; included costs become $50,900.

```ts
window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getRecordById('cost-4').setValue('amount',null)
```

### 10. A measured zero

The total is unchanged, but the stored amount is now numeric zero.

```ts
window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getRecordById('cost-4').setValue('amount',0)
```

### 11. An invalid revenue input

SUM ignores text: recorded numeric revenue becomes $60,000. This does not validate the input or silently replace it with a measured zero.

```ts
window.univerAPI.getWorkbook('cobalt-revenue-plan').getSheetBySheetId('revenue').getRange('B6').setValue('pending')
```

### 12. Restore both measured sources

Baseline numeric results return. The changed note and Optional view filter remain.

```ts
const sheet=window.univerAPI.getWorkbook('cobalt-revenue-plan').getSheetBySheetId('revenue')
sheet.getRange('B5:B7').setValues([[24000],[28000],[34000]])
sheet.getRange('E5').setValue(0.3)
const table=window.univerAPI.getBase('cobalt-cost-register').getTableById('costs')
;[18500,14200,9700,15100,3200].forEach((amount,i)=>table.getRecordById('cost-'+(i+1)).setValue('amount',amount))
table.getRecordById('cost-5').setValue('scope','Optional')
```

### 13. Clear the view filter

All five records are visible again; no formula value changes.

```ts
window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getViewById('costs-grid').setFilter(null)
```

### 14. No planned revenue

Retained share and gap expose native division errors. Costs remain defined; target headroom is -$57,500 and the signal asks to revisit assumptions.

```ts
window.univerAPI.getWorkbook('cobalt-revenue-plan').getSheetBySheetId('revenue').getRange('B5:B7').setValues([[0],[0],[0]])
```

### 15. Restore revenue

The original calculations recover without replacing the document or Base.

```ts
window.univerAPI.getWorkbook('cobalt-revenue-plan').getSheetBySheetId('revenue').getRange('B5:B7').setValues([[24000],[28000],[34000]])
```

### 16. Disconnect only the Sheet binding

Base-only costs and scope counts remain meaningful. Sheet-dependent calculations must not retain stale successful totals.

```ts
window.univerAPI.getFormula().upsertExternalReference({unitId:'cobalt-operating-review',qualifier:'Cobalt Revenue',sourceUnitId:'cobalt-unavailable-sheet',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET})
```

### 17. Repair the Sheet binding

Reconnect the same source ID. This does not prove rebinding to a different valid Sheet.

```ts
window.univerAPI.getFormula().upsertExternalReference({unitId:'cobalt-operating-review',qualifier:'Cobalt Revenue',sourceUnitId:'cobalt-revenue-plan',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET})
```

### 18. Disconnect only the Base binding

Sheet-only revenue and target remain meaningful. Base-dependent calculations expose native errors.

```ts
window.univerAPI.getFormula().upsertExternalReference({unitId:'cobalt-operating-review',qualifier:'Cobalt Costs',sourceUnitId:'cobalt-unavailable-base',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE})
```

### 19. Repair the Base binding

Reconnect the same cost register without resetting either source.

```ts
window.univerAPI.getFormula().upsertExternalReference({unitId:'cobalt-operating-review',qualifier:'Cobalt Costs',sourceUnitId:'cobalt-cost-register',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE})
```

### 20. Inspect all three native snapshots

The host's embed references are not the full source data. Durable reconstruction must retain all three owners and needs separate verification.

```ts
console.log({host:window.univerAPI.getDocument('cobalt-operating-review').save(),sheet:window.univerAPI.getWorkbook('cobalt-revenue-plan').save(),base:window.univerAPI.getBase('cobalt-cost-register').save()})
```

## Reconstruct the same three-unit workspace

In an application that imports createDemo, keep its returned handle as demo and
reuse the original container. Save only after native calculation has settled.
The fourth factory argument restores this example's own bundle, including user
formula edits and removals; it does not reseed default formulas or repair an
intentionally unavailable reference.

```js
const saved = JSON.parse(JSON.stringify({
  host: demo.univerAPI.getDocument('cobalt-operating-review').save(),
  sheet: demo.univerAPI.getWorkbook('cobalt-revenue-plan').save(),
  base: demo.univerAPI.getBase('cobalt-cost-register').save(),
}))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
await demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
```

This is native snapshot reconstruction, not arbitrary uploaded-file import,
browser-restart storage, Exchange conversion or persistence of Undo/Redo stacks.
The example requires both original DocBlock anchors and sources. Invalid IDs or
missing units/resources are rejected before a new factory owner is created.
Applications accepting external files also need validation, durable storage and
a failed-load recovery strategy; do not discard the only saved copy.

## Layout, calculations and references

The report uses traditional A4-sized pages, explicit chapter breaks, Georgia
body/title text and blue, teal, amber and lavender details inspired by the saved
Deep Ocean reference. The cached Typst Universe and original corporate-report
reference guide typography and reading order only; their artwork is not copied.

Sheet rows 5:7 are a fixed revenue range; E5 is an independent target. Base
aggregates cover the entire Costs table, not its view. Scope is an explicit
Included/Optional value. All arithmetic is performed by the native formula
engine; application code does not compute totals or regenerate prose.

Preview and standalone call the same factory. All twenty-three official CSS
imports and twenty-three complete EN/ZH dependency packs are included. Grid menus
are native; there is no fixture panel, redundant button toolbar or collaboration
history suite. The registered Sheet Print plugin does not by itself prove every
Print option. No Exchange conversion success is claimed.

## Acceptance status

Partial, not fully accepted. The current strict report is
test-results/embed-cobalt-formula-recovery-regression/report.json. Twenty literal
snippets update all fourteen results on the current first/final-page canvas,
preserving every authored body character, style and custom range. The baseline
has four actual A4 pages, with each native source in its own chapter. Independent
inputs, target/scope isolation, an empty view projection, hidden edits, stored
null versus zero, ignored text, zero revenue and independent binding repair pass.

Single-click fullscreen activation preserves the complete source models. Native
Sheet B5 and Base venue-amount typing, complete serialized source Undo/Redo,
Grid menus, correct-source Sheet Print preview/cancel, twenty-three whole EN/ZH
packs, all three model snapshots across theme changes and active-source disposal
pass selected checks. There are no browser errors, warnings or backend requests.

Strict runtime remains FAIL: twenty-two native division/missing-source errors
display correctly, but beta.2 returns success/string instead of error status.
The runtime does not override these results. EN/ZH native Edit formula and
number-format dialogs/cancellation pass separately in
test-results/docs-formula-locales-cobalt-recovery/report.json. Source/CSS parity is checked
in test-results/cobalt-recovery-export-ui/report.json. Only this demo was built;
every dependency version was checked before linking existing installed packages
into its temporary standalone export. This is not a fresh dependency installation.

Earlier automation double-clicked DocBlocks. That also entered a native Sheet
cell editor and could commit an empty title when leaving for fullscreen; in an
empty Base it hit Add record. The current test uses the SDK's single-click
DocBlock activation and checks complete source preservation across entry. Empty
Base re-entry, double-click/editor-exit behavior and other pointer paths remain
unaccepted; literal-code tests explicitly return focus to the report separately.
Explicit amber/purple input text colors also avoid creating a redundant default
color style during Sheet editing, allowing exact history checks. No SDK package
was patched.

The reconstruction test at test-results/embed-cobalt-roundtrip-layout/report.json
creates five fresh owners: edited formula/format/prose with an empty Base filter;
missing Sheet binding while leaving fullscreen; Chinese dark appearance;
missing Base binding; and a formula replaced with authored reading text.
All five preserve authored content, formula IDs/configuration, source data and
four actual A4 pages with identical page boundaries. Ten invalid bundles leave
the original owner and complete models untouched. Fresh native Sheet typing,
value Undo/Redo, exact Base typing/history, hidden Base writes and fresh writes
after formula removal pass. The removed formula is not reseeded. No errors,
warnings or backend requests occur.

This is not exact serialized-state acceptance: the strict report retains four
full-snapshot mismatches and one Sheet Undo snapshot mismatch. Empty validation
state changes between {"revenue":[]} and {}; native formula lastValue caches
change to errors after error-state reconstruction and back to numbers after
repair/reconstruction. Forty error-result observations also retain the known
success/string status defect. These failures are not normalized away in the
strict gate; separate authored-content assertions do not certify cached values.
Only native embed reactivation timestamps are explicitly allowed to change.

Different-valid-source rebinding, durable persistence and strict cache recovery, every native
action, Exchange, all Print options, Next integration, accessibility,
responsiveness and delivery performance remain open. Native SDK failures must
remain visible rather than being replaced with JavaScript results or screenshots.
The SDK trial watermark and production-license requirement remain intact.
