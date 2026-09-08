# Grove / Exhibition readiness

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

Sheet + Base → sixteen native Board Formula Shapes, in one original fictional exhibition.
Both inputs are real native Floats. There are no JavaScript-computed totals, fake
control buttons, backend requests or copied competitor artwork.

Start with $18,000 budget and $14,600 cost: $3,400 remains. Four of six gates are
Ready (66.7%), with one Blocked. Build has no spare budget even before a change.
The independent 85% spending ceiling leaves $700 before review, not $3,400.
Readiness is a record count, not cost-weighted progress. A Ready gate retains its cost.

## Run the examples in order

Use the guide code runner or `window.univerAPI` in the browser console after
`.grove-embed[data-ready="true"]`. Each snippet below runs unchanged. Wait for
native calculation before reading the result; no refresh button is needed.

### 1. Change only the Sheet budget

Build budget becomes $7,000. Total $19,000, balance $4,400, Build balance $1,000;
cost, records and readiness do not change.

```ts
univerAPI.getWorkbook('grove-budget-plan').getSheetBySheetId('budget').getRange('B5').setValue(7000)
```

### 2. A local overrun while the total has room

The frame cost becomes $4,400. Total cost $15,800 and balance $3,200, but Build
has a $200 overrun. Its two gates remain Ready. Sheet data is unchanged.

```ts
univerAPI.getBase('grove-readiness-register').getTableById('gates').getRecordById('gate-1').setValue('cost', 4400)
```

### 3. Resolve the access blocker without deleting its cost

Five gates are Ready (83.3%). Care is 100% Ready; costs remain $15,800.
The next-conversation formula changes to Continue gate review.

```ts
univerAPI.getBase('grove-readiness-register').getTableById('gates').getRecordById('gate-6').setValue('status', 'Ready')
```

### 4. Tighten the spending ceiling independently

75% of $19,000 is $14,250. Ceiling headroom is now -$1,550, while actual budget
balance remains $3,200. The signal becomes Review spending.

```ts
univerAPI.getWorkbook('grove-budget-plan').getSheetBySheetId('budget').getRange('E5').setValue(0.75)
```

### 5. Complete the programme, keeping the spending review

All six gates are Ready. Budget, costs and the financial signal do not change.

```ts
univerAPI.getBase('grove-readiness-register').getTableById('gates').getRecordById('gate-4').setValue('status', 'Ready')
```

### 6. Unknown cost is not a free gate

Store null, not a string or a computed zero. SUM/SUMIF ignore that cost: total
$11,400, Build balance $4,200. Gate counts stay six. Arithmetic alone cannot
certify that the exhibition cost is complete.

```ts
univerAPI.getBase('grove-readiness-register').getTableById('gates').getRecordById('gate-1').setValue('cost', null)
```

### 7. Known zero cost

The displayed totals are unchanged, but the underlying source now stores numeric zero.

```ts
univerAPI.getBase('grove-readiness-register').getTableById('gates').getRecordById('gate-1').setValue('cost', 0)
```

### 8. Context is not a numerical input

Changing an owner preserves all formula results and the Sheet.

```ts
univerAPI.getBase('grove-readiness-register').getTableById('gates').getRecordById('gate-4').setValue('owner', 'Mika')
```

### 9. Restore baseline amounts and status

The changed owner is deliberately retained.

```ts
const sheet = univerAPI.getWorkbook('grove-budget-plan').getSheetBySheetId('budget')
sheet.getRange('B5:B7').setValues([[6000], [7000], [5000]])
sheet.getRange('E5').setValue(0.85)
const gates = univerAPI.getBase('grove-readiness-register').getTableById('gates')
for (const [id, cost, status] of [['gate-1',3200,'Ready'],['gate-2',2800,'Ready'],['gate-3',3600,'Ready'],['gate-4',2100,'In progress'],['gate-5',1700,'Ready'],['gate-6',1200,'Blocked']]) {
  gates.getRecordById(id).setValue('cost', cost)
  gates.getRecordById(id).setValue('status', status)
}
```

### 10. A filtered view is not a different formula source

Only four Ready records are visible, but all six gates and $14,600 cost remain
in the whole-table formulas.

```ts
univerAPI.getBase('grove-readiness-register').getTableById('gates').getViewById('gates-grid').setFilter({
  conjunction: univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'status', operator: univerAPI.Enum.BaseFilterOperator.IS, operand: 'Ready' }],
})
```

### 11. Update a hidden gate

Workshop rehearsal is hidden. Its $2,600 cost still raises the total to $15,100;
Programme balance is $800, total balance $2,900, ceiling headroom $200.

```ts
univerAPI.getBase('grove-readiness-register').getTableById('gates').getRecordById('gate-4').setValue('cost', 2600)
```

### 12. Reveal the full register

```ts
univerAPI.getBase('grove-readiness-register').getTableById('gates').getViewById('gates-grid').setFilter(null)
```

### 13. Display names are not source identities

The unit IDs and table formula name Gates remain stable. A fresh Sheet edit
makes total budget $18,500 and balance $3,400, proving more than cached text.

```ts
univerAPI.getWorkbook('grove-budget-plan').setName('Grove / Reviewed budget')
univerAPI.getBase('grove-readiness-register').setName('Grove / Reviewed gates')
univerAPI.getWorkbook('grove-budget-plan').getSheetBySheetId('budget').getRange('B7').setValue(5500)
```

### 14. Unavailable Sheet mapping

The real workbook remains intact. The affected native formulas should show
errors; Base-only readiness and cost remain live. A missing mapping is not zero.

```ts
univerAPI.getFormula().upsertExternalReference({ unitId: 'grove-exhibition-readiness', qualifier: 'GroveBudget', sourceUnitId: 'grove-unavailable-budget', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_SHEET })
```

### 15. Repair the Sheet mapping

```ts
univerAPI.getFormula().upsertExternalReference({ unitId: 'grove-exhibition-readiness', qualifier: 'GroveBudget', sourceUnitId: 'grove-budget-plan', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_SHEET })
```

### 16. Unavailable Base mapping

Budget and its ceiling still have a source, but Base-dependent cost, readiness
and per-zone formulas should report native errors.

```ts
univerAPI.getFormula().upsertExternalReference({ unitId: 'grove-exhibition-readiness', qualifier: 'GroveReadiness', sourceUnitId: 'grove-unavailable-register', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 17. Repair the Base mapping

```ts
univerAPI.getFormula().upsertExternalReference({ unitId: 'grove-exhibition-readiness', qualifier: 'GroveReadiness', sourceUnitId: 'grove-readiness-register', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 18. No Care gates is not zero readiness

Move both Care records to a new zone label. Care now has zero matching gates:
its fraction is 0/0, so a native division error must remain visible. Overall
readiness and total cost are unchanged; Care's entire envelope remains unassigned.

```ts
const gates = univerAPI.getBase('grove-readiness-register').getTableById('gates')
gates.getRecordById('gate-5').setValue('zone', 'Visitor support')
gates.getRecordById('gate-6').setValue('zone', 'Visitor support')
```

### 19. Recover the zone

```ts
const gates = univerAPI.getBase('grove-readiness-register').getTableById('gates')
gates.getRecordById('gate-5').setValue('zone', 'Care')
gates.getRecordById('gate-6').setValue('zone', 'Care')
```

### 20. Inspect the actual native formula and three owners

```ts
const board = univerAPI.getBoard('grove-exhibition-readiness')
console.log(board.getShape('balance').getFormula(), board.getShape('balance').getFormulaResult())
console.log({ board: board.save(), sheet: univerAPI.getWorkbook('grove-budget-plan').save(), base: univerAPI.getBase('grove-readiness-register').save() })
```

## Native interaction and source export

Activate either Float and use its native expand control for detailed editing.
The Sheet ribbon uses Grid; Board uses its own floating drawing tools. Move the
FOLLOW BOTH SOURCES node to inspect its three bound connectors, or edit a native
shape formula. Menu behavior and source ownership must be checked, not assumed.
Sheet Print uses the registered frontend Print plugin, not browser-page printing.

Preview and standalone export use the same factory, data and official SDK CSS.
Complete English packs accompany registered feature menus, including Formula,
Shape Editor, Embed Unit and native Board text editing dependencies. Authored
business content is English. Theme changes do not recreate the three owners.

The saved Miro diagrams reference informs only the connected review composition.
Original navy, slate blue, lilac, sage, amber and terracotta distinguish the
financial inputs, readiness and decisions; there is no overlay fixture panel.

## Acceptance boundary

Selected runtime checks pass all twenty literal examples and all sixteen native
results on the current Board editor, preserving authored prose, geometry,
connectors and unmodified source owners. Native error statuses pass for each
missing source and zero-size Care zone. The total gate count uses ROWS, not
COUNTA, so a source error is not counted as a single non-empty item.

Actual Sheet/Base keyboard input and exact serialized source Undo/Redo, Grid
menus, correct-source Sheet Print preview/cancel and active-Base disposal pass.
Real Board ArrowRight movement updates all three bound rendered connector
routes; full Board Undo/Redo and English/Chinese native text typing/history
preserve both sources. Theme changes preserve all three models. Twenty-three
full EN/ZH dependency packs are included. The strict selected report has no
browser errors, warnings, backend requests or formula-status mismatches.

Evidence: `scripts/test-embed-grove-formula.mjs`,
`test-results/embed-grove-formula-native-anchor/report.json`, and
`test-results/grove-formula-export-ui/report.json`. Eleven-file source parity
and opaque native white UI pass; all twenty-three official CSS imports are
exported. Dependencies reuse exact-version-checked local package links, not a
fresh install. Initial cached-glyph Board hit tests failed; resolving coordinates
through the live Float viewport anchor fixes the test. No SDK/package edit.
The selected Vite build retains its large-chunk performance warning.

This is partial capability evidence, not complete acceptance. Save inspection
is not reload support: this factory starts a new
local baseline. Three-unit reconstruction, durable persistence, arbitrary import,
all native menus, mobile/accessibility and delivery performance remain open.
No collaboration, publishing, history-record suite or backend conversion is claimed.

### Source disposal is not a saved-source restore workflow

A focused English-UI probe in `scripts/test-grove-source-lifecycle.mjs` exposes
an additional boundary. Starting from the baseline, changing gate-1 cost to 4,400
produces native cost 15,800 and balance 2,200. Disposing the Base while the Float
is mounted causes it to reappear from this demo's baseline provider: cost becomes
14,600 and balance 3,400, not a missing-source error or a preserved edit.

Removing only `grove-base-float` first is also insufficient in the tested runtime:
`removeEmbed` returns true and only `grove-sheet-float` remains listed; Base disposal
returns true, yet the Base reappears at the same stable ID with baseline values.
Creating the saved Base at that ID then throws the native duplicate-unit-ID error.
The Sheet budget remains 18,000. This is not evidence of successful unload/restore.
The focused report retains that strict failure and the original mounted-Float probe.
No provider rewrite, substitute values or SDK change hides the behavior. Keep the
source loaded for the twenty supported examples above; save/reconstruction remains
outside their acceptance.
