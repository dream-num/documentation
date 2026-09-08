# Kestrel / Planning and Actuals Workspace

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

An original fictional community maker lab: eight expense records in a native
Relational Table host, an editable Sheet plan, a modern brief, three review slides and a
connected variance Canvas. Four native table-list embeds share one workbench.
There is no custom product switcher, fixture panel, manual refresh or backend.

## Two sources, four outputs

Posted actuals come directly from Relational Table structured references. Plan totals come
from the Sheet. The ten Doc inline formulas, nine Slide Formula Shapes and seven
Canvas Formula Shapes read both sources. The native two-series chart reads the
visible Sheet range A4:C7, including the three Relational Table-backed actual formulas.

Baseline: plan 18,000 + 16,000 + 14,000 = 48,000. Six posted amounts total 45,500;
two drafts total 2,500 and are excluded. Remaining amounts are Learning 1,000,
Fabrication 1,500 and Access 0. Overall remaining is 2,500 and usage is 94.8%.

## Literal examples

Run in order against window.univerAPI. Use Expenses for Relational Table changes and
Plan & chart for Sheet changes. Native source interaction and off-page writes
are separate acceptance paths; neither is assumed from snapshot values alone.

### 1. Correct a posted amount

Workshop mentors becomes 9,500. Posted actuals become 47,000, remaining 1,000.
Learning alone is 500 over plan, although the whole model is still within plan.

```ts
window.univerAPI.getBase('kestrel-actuals').getTableById('expenses').getRecordById('expense-1').setValue('amount', 9500)
```

### 2. Change the independent plan

Increase Access to 16,000. Plan becomes 50,000, remaining 3,000; actuals stay
47,000. Access remaining becomes 2,000.

```ts
window.univerAPI.getWorkbook('kestrel-plan').getSheetBySheetId('plan').getRange('B7').setValue(16000)
```

### 3. Post a draft

Additional mentors moves into actuals: posted count 7, actuals 48,500, drafts
1,000 and remaining 1,500. Learning is now 2,000 over plan.

```ts
window.univerAPI.getBase('kestrel-actuals').getTableById('expenses').getRecordById('expense-7').setValue('status', 'Posted')
```

### 4. Change context without changing totals

The owner changes; numbers and chart geometry should not.

```ts
window.univerAPI.getBase('kestrel-actuals').getTableById('expenses').getRecordById('expense-1').setValue('owner', 'Mina / next workshop cycle')
```

### 5. Leave an amount unknown

Null is stored in the record. Native SUMIF ignores it, leaving actuals 39,000
and remaining 11,000. Seven posted records still exist; this is not proof of
zero cost for the unknown record.

```ts
window.univerAPI.getBase('kestrel-actuals').getTableById('expenses').getRecordById('expense-1').setValue('amount', null)
```

### 6. Record an explicit zero

The same aggregate now has a different source meaning: zero instead of unknown.

```ts
window.univerAPI.getBase('kestrel-actuals').getTableById('expenses').getRecordById('expense-1').setValue('amount', 0)
```

### 7. Restore the posted amount

Actuals return to 48,500 and remaining to 1,500.

```ts
window.univerAPI.getBase('kestrel-actuals').getTableById('expenses').getRecordById('expense-1').setValue('amount', 9500)
```

### 8. Read a zero plan honestly

All plan inputs become zero. Remaining is -48,500, the signal is Over plan and
the native usage ratio must expose division by zero, not a fabricated 0%.

```ts
window.univerAPI.getWorkbook('kestrel-plan').getSheetBySheetId('plan').getRange('B5:B7').setValues([[0], [0], [0]])
```

### 9. Recover the plan

Restore 18,000, 16,000 and 16,000. The ratio recovers to 97.0%.

```ts
window.univerAPI.getWorkbook('kestrel-plan').getSheetBySheetId('plan').getRange('B5:B7').setValues([[18000], [16000], [16000]])
```

### 10. Filter the view, not the whole-table calculation

Only the remaining Draft record is visible. All seven Posted records still
contribute to the outputs.

```ts
window.univerAPI.getBase('kestrel-actuals').getTableById('expenses').getViewById('expense-grid').setFilter({
  conjunction: window.univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'status', operator: window.univerAPI.Enum.BaseFilterOperator.IS, operand: 'Draft' }],
})
```

### 11. Edit a hidden posted record

Travel support is hidden but remains part of the source. Change it from 6,000
to 6,500: actuals become 49,000, remaining 1,000 and usage 98.0%.

```ts
window.univerAPI.getBase('kestrel-actuals').getTableById('expenses').getRecordById('expense-5').setValue('amount', 6500)
```

### 12. Reveal the full register

The view returns to all eight records without changing results.

```ts
window.univerAPI.getBase('kestrel-actuals').getTableById('expenses').getViewById('expense-grid').setFilter(null)
```

### 13. Rename the Relational Table display on its own page

Open Expenses first. Unit IDs and saved external-reference qualifiers should
remain stable; renaming alone must not change the results. Do not rename the
Relational Table from an active embedded Sheet: that native beta.2 path currently creates
an overlapping Relational Table canvas and blocks the table-list navigation.

```ts
window.univerAPI.getBase('kestrel-actuals').setName('Kestrel / July posted register')
```

### 14. Rename the Sheet display and make a fresh edit

Open Plan & chart. Changing the Fabrication plan to 17,000 makes plan 51,000
and remaining 2,000. Both original source qualifiers should still resolve.

```ts
const plan = window.univerAPI.getWorkbook('kestrel-plan')
plan.setName('Kestrel / Revised workshop plan')
plan.getSheetBySheetId('plan').getRange('B6').setValue(17000)
```

### 15. Restore the actuals on the Relational Table page

Open Expenses. Keep the changed owner and source display names. Posted actuals
return to 45,500; plan stays 51,000 and remaining becomes 5,500.

```ts
const table = window.univerAPI.getBase('kestrel-actuals').getTableById('expenses')
table.getRecordById('expense-1').setValue('amount', 8000)
table.getRecordById('expense-5').setValue('amount', 6000)
table.getRecordById('expense-7').setValue('status', 'Draft')
```

### 16. Restore the plan on its Sheet page

Open Plan & chart. Plan returns to 48,000 and remaining to 2,500. No source
data, authored content or display name is replaced by this reset.

```ts
window.univerAPI.getWorkbook('kestrel-plan').getSheetBySheetId('plan').getRange('B5:B7').setValues([[18000], [16000], [14000]])
```

### 17. Inspect the five native snapshots

Reading snapshots does not implement save/reload or file conversion.

```ts
const api = window.univerAPI
console.log({
  actuals: api.getBase('kestrel-actuals').save(),
  plan: api.getWorkbook('kestrel-plan').save(),
  brief: api.getDocument('kestrel-planning-note').save(),
  slides: api.getPresentation('kestrel-review').save(),
  board: api.getBoard('kestrel-variance-map').save(),
})
```

## Composition and reference

The native Relational Table list contains Plan & chart, Brief, Review deck and Variance
map. Formula bindings are registered explicitly with FFormula.upsertExternalReference.
The chart is native, not JavaScript-computed series. Source and preview use the same
factory, official CSS imports and English plugin locale packs.
The cached Gamma Budget Review reference informs the spacious dark/gold opening;
all content, data and layouts are original. Other pages use blue, teal and amber.

Grid ribbon is the default. Embedded Sheets retains the native feature plugins
its ribbon requires, following the existing local embed example. No generic
buttons duplicate native editing. Sheet print is registered; actual print behavior,
Exchange, persistence and collaboration are not claimed as accepted here.

## Acceptance status

Partial, not fully accepted. test-results/embed-kestrel-formula-native/report.json
records seventeen literal examples, 26 live values on the current Doc, three
Slides and Canvas editores, visible Sheet totals and the actual heights of both
native chart series. Independent source changes, posted versus draft, unrelated
context, null/zero, zero-plan errors/recovery, filtered-view isolation, hidden
record edits and saved identities after source display renames pass selected checks.

Native keyboard input changes the first Relational Table amount to 10,000, then Sheet B7
to 15,000. All 26 dependent values and chart geometry update; complete authored
Doc content and Slides/Canvas pages remain unchanged except the SDK's persisted
formulaBinding.lastValue calculation cache. Active-Canvas disposal passes.
The run observes no browser errors or backend requests.

The strict report remains FAIL. Doc usage displays #DIV/0! but reports
success/string, not an error result. A separate fresh-owner probe reproduces
off-page Relational Table rename covering native navigation with a Relational Table canvas. The documented
workflow activates each source through its native table-list entry before editing.
It does not force clicks, remove canvases or automatically repair SDK focus.

test-results/embed-kestrel-formula-next/report.json passes selected EN/ZH guide
checks: the first exact snippet, initial locale labels, native white UI, absence
of redundant controls and theme changes preserving the owner and all five models.
The guide check does not execute all seventeen snippets in both languages.

test-results/docs-formula-locales-kestrel-actions/report.json is a strict FAIL on
the number-format dropdown. Both locales supply every leaf of the three official
Formula editor dependency packs. Native Edit formula actions, editor labels,
desktop dialog bounds and cancellation preserving the owner/full document pass.
However, the visible Number format button has pointer-events none and cannot be
clicked in either locale. No raw locale keys were observed; language completeness
does not imply that all editor interactions work. No CSS override hides this issue.

The independent export retains eleven files and 25 explicit official SDK CSS
imports. The selected build transforms 2,008 modules; its combined SDK bundle is
large (about 19.9 MB JS, 4.88 MB gzip, plus language chunks). This is not a delivery
performance acceptance claim. Remaining: native error metadata, off-page ownership,
the Formula dropdown, actual five-model save/reload, missing/different sources,
every editor action, Print, responsive/accessibility and delivery performance.
