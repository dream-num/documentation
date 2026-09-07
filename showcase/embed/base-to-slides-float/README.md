# Orchid / Pipeline review

Six original fictional opportunities for an experience-design studio live in a
native Base Float on the Pipeline slide. This is **Base@Slides Float**, distinct
from Violet's native data-page Tab. Twelve Formula Shapes on three authored pages
read the same Base through stable external references. No hidden Sheet, backend,
JavaScript aggregation, refresh button or fixture control panel is used.

The twelve literal Base Facade examples update all three visible pages when the
source Float is first activated through native double-click. Known beta.2
limitations remain: passive/off-page writes can remove the Slides workbench;
native title Undo and fullscreen entry fail selected checks. This is a partial
SDK demo, not a production-ready workflow.

The starting face value is $80,000. Three non-zero probabilities contribute
$12,000 + $9,000 + $4,000 = $25,000 weighted value (31.25%). The other three deals
have amounts but zero probability. These are illustrative user-entered assumptions,
not booked revenue or an automatic probability model.

## Twelve literal examples

Run these in order in the standalone page or demo iframe. Before each example,
open Pipeline and double-click inside the Base Float until its native floating
toolbar appears. This enters the child-editing session; simply viewing Pipeline
does not activate it. Run the literal snippet, then inspect Forecast and Review.
Return and activate the source again before the next snippet. Probability values use
0..1 (0.5 = 50%). Stage and probability are separate fields, not an implicit rule.

### 1. Revise the proposal

Nominal value becomes $84,000; weighted value becomes $27,000. Only Proposal face value increases, to $36,000.

```ts
window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals').getRecordById('deal-2').setValue('amount', 22000)
```

### 2. Change confidence independently

Probability 0.7 means 70%. Weighted value rises to $30,000 while nominal remains $84,000. The native IF label becomes Coverage improved.

```ts
window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals').getRecordById('deal-3').setValue('probability', 0.7)
```

### 3. Move a deal between stages

Discovery falls to $8,000 and Proposal rises to $46,000. Probability is not assigned from the stage: the $30,000 forecast stays unchanged.

```ts
window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals').getRecordById('deal-3').setValue('stage', 'Proposal')
```

### 4. Leave a probability unknown

The source stores null. SUMPRODUCT treats the missing numeric entry as zero: weighted value becomes $23,000; two records have a non-zero probability. This is not a calibrated forecast.

```ts
window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals').getRecordById('deal-3').setValue('probability', null)
```

### 5. Record an explicit zero

The same totals now come from an explicit 0, not a missing value. Inspect the source value as well as the aggregate.

```ts
window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals').getRecordById('deal-3').setValue('probability', 0)
```

### 6. Recover the original assumptions

Restore all six amounts, probabilities and stages. The original $80,000 / $25,000 / 31.25% comparison returns.

```ts
const table = window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals')
for (const [i, amount, probability, stage] of [[1,24000,0.5,'Negotiation'],[2,18000,0.5,'Proposal'],[3,10000,0.4,'Discovery'],[4,8000,0,'Discovery'],[5,14000,0,'Proposal'],[6,6000,0,'Negotiation']]) {
  const record = table.getRecordById('deal-' + i)
  record.setValue('amount', amount)
  record.setValue('probability', probability)
  record.setValue('stage', stage)
}
```

### 7. Rename display labels

Keep stable unit/table IDs and formulaName Deals. Subsequent edits must still recalculate; an unchanged cached number alone is not proof.

```ts
const base = window.univerAPI.getBase('orchid-opportunity-register')
base.setName('Orchid / December opportunities')
base.getTableById('deals').setName('Studio pipeline')
```

### 8. Read only Negotiation records

The native view contains deals 1 and 6. Whole-table formulas still include all six records and keep the original totals.

```ts
const view = window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals').getViewById('deals-grid')
view.setFilter({
  conjunction: window.univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'stage', operator: window.univerAPI.Enum.BaseFilterOperator.IS, operand: 'Negotiation' }],
})
```

### 9. Revise a hidden, zero-probability opportunity

Deal 4 is hidden by the view. Nominal becomes $82,000; weighted remains $25,000. Discovery becomes $20,000. Renaming and filtering did not sever the dependency.

```ts
window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals').getRecordById('deal-4').setValue('amount', 10000)
```

### 10. Reveal the complete register

Clear the view filter. Values remain $82,000 nominal and $25,000 weighted.

```ts
window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals').getViewById('deals-grid').setFilter(null)
```

### 11. Exercise a native zero denominator

Set all amounts to zero. Weighted/nominal must expose #DIV/0!, not 0%. The non-zero probability count stays three because it counts a different field.

```ts
const table = window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals')
for (let i = 1; i <= 6; i++) table.getRecordById('deal-' + i).setValue('amount', 0)
```

### 12. Recover the monetary inputs

Restore the six amounts. Native formulas must leave the error state and return to the baseline without a refresh or custom calculation.

```ts
const table = window.univerAPI.getBase('orchid-opportunity-register').getTableById('deals')
for (const [i, amount] of [[1,24000],[2,18000],[3,10000],[4,8000],[5,14000],[6,6000]]) table.getRecordById('deal-' + i).setValue('amount', amount)
```

## Native implementation and visual references

FUniver.createEmbed uses SlideFloating and loadAsync. FShape.setFormula binds
SUM, SUMPRODUCT, SUMIF, COUNTIF and IF to [Orchid Pipeline]!Deals columns.
All twelve results use native calculation; animation is disabled through the
public Facade so comparison figures remain readable. Native errors are retained.

The cached Gamma Budget Review reference informs a dark, restrained opening and
strong visual hierarchy. Deep Ocean-inspired forest/gold, warm paper and plum
palettes distinguish the three pages. All deal names and content are original;
no reference artwork is redistributed. The Base retains its official white UI.

Preview and standalone share one factory, all eight official SDK CSS imports and
the host stylesheet. Grid ribbon is the default. There are no duplicate custom
toolbar buttons. Native Base controls own record editing and view filters.
No Base printing, Exchange conversion, collaboration or publishing is claimed.

## Acceptance status

Partial. test-results/embed-orchid-formula-activated/report.json is a strict FAIL
overall, with all twelve activated-source examples passing. They produce the
expected twelve native values/statuses on all three current visible canvases,
preserve authored layout and exercise amount/probability/stage independence,
null versus zero, renamed labels, filtered projections, hidden writes and native
zero-denominator recovery. currentCanvasVerified is true for every example.
The separate off-page write still loses the native page list. The earlier
test-results/embed-orchid-formula-native/report.json retains the passive-source
failure; its missing updated canvases are not the current activated workflow.

Separate fresh-instance checks verify native amount typing: changing $24,000 to
$26,000 gives $82,000 nominal, $26,000 weighted and 31.71% coverage, with all three
current canvases updated and authored layout preserved. Native title typing also
changes the source, but neither Ctrl+Z nor the floating toolbar Undo restores it;
Redo is therefore unverified. Enter fullscreen does not create a shell. Disposal
after an activated Float passes; fullscreen-session disposal is not proven.
No browser errors or backend calls were observed in this independent run.

The inspected local SDK UpdateBaseCellCommand calls global focusUnit after a
successful mutation. Native activation distinguishes the working root-Facade
sequence from the passive/off-page failure. Obtaining a scoped FBase alone did
not repair passive writes; no helper API, automatic refocus, hidden renderer,
error normalization or modified SDK dependency is used.
test-results/embed-orchid-formula-activated-next/report.json passes all twelve
literal examples in both EN/ZH, redundant-card absence and theme changes with
unchanged owner and full models. The earlier next report is historical, not the
current integration result. These selected checks do not certify every Next path.

The eleven-file standalone export retains all eight official SDK CSS imports and
native white UI: test-results/orchid-formula-export-ui/report.json. The selected
build has 1,845 modules, 18,435.34 kB JS (4,540.79 kB gzip) and 150.83 kB CSS
(21.30 kB gzip). Large-bundle warnings remain. These are not performance acceptance.
Source identity/rebinding, save/reload, invalid probability validation, complete
native interaction, keyboard history, fullscreen and delivery remain open.
