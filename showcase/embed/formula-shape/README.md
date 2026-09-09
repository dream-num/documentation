# Beacon / Live impact cards

Native UI and authored data are English-only, including on Chinese documentation pages. The legacy third locale argument is ignored; the factory does not change the host page language. Historical bilingual reports below remain evidence of earlier revisions, not acceptance of this English-only revision.

Four native Slides pages demonstrate a data dependency, not copied KPI text:
Sheet workshop fees and Base delivery costs drive eight native Formula Shapes.
The revenue and costs pages contain the two real source Floats. Overview and
Bridge show separate-source totals, contribution and margin in authored layouts.

All figures are fictional planning assumptions, not transactions or advice.
Opening revenue is 10090, costs 5600, contribution 4490 and margin 44.50%.
Editing source fee C5 from 45 to 50 adds 200 revenue. Increasing Studio rooms from 1800
to 2100 adds 300 cost. With both changes, contribution is 4390 and margin 42.66%.

## Literal source examples

Run each snippet in the demo iframe or standalone preview. No copy of the data,
manual refresh button or JavaScript calculation is involved. Use explicit source
IDs, not whichever unit happens to own focus. Examples below run in order.

Known beta.2 limitation: the Base write in example 2 recalculates the model but
can replace the Slides workbench with an empty surface. The sequence below is
therefore not yet an accepted end-to-end walkthrough. Do not add a custom refresh
or focus-restoration button to disguise this failure.

### 1. Sheet / Raise the printmaking fee

```ts
window.univerAPI.getWorkbook('beacon-learning-revenue').getSheetByName('Workshop revenue').getRange('C5').setValue(50)
```

### 2. Base / Revise room allocation

```ts
window.univerAPI.getBase('beacon-learning-costs').getTableById('costs').getRecordById('cost-1').setValue('amount', 2100)
```

### 3. Sheet / Exercise zero revenue

All six quantities become zero. Native margin formulas must expose division by
zero, not a fabricated 0% or previous result. Cost-only cards must stay unchanged.

```ts
window.univerAPI.getWorkbook('beacon-learning-revenue').getSheetByName('Workshop revenue').getRange('B5:B10').setValues([[0], [0], [0], [0], [0], [0]])
```

### 4. Sheet / Recover source quantities

```ts
window.univerAPI.getWorkbook('beacon-learning-revenue').getSheetByName('Workshop revenue').getRange('B5:B10').setValues([[40], [28], [36], [22], [30], [18]])
```

### 5. Base / A deliberate zero-cost allocation

```ts
window.univerAPI.getBase('beacon-learning-costs').getTableById('costs').getRecordById('cost-1').setValue('amount', 0)
```

### 6. Base / Restore the allocation

```ts
window.univerAPI.getBase('beacon-learning-costs').getTableById('costs').getRecordById('cost-1').setValue('amount', 2100)
```

## Additional source boundaries

Reload before examples 7, 8, 9, 11, 13, 15, 16 and 17. Examples 10, 12, 14
and 18 repair the preceding change. These are independent workshop scenarios,
not additional commands in the original six-step sequence. All changes use the
real source Facades; a successful calculation does not imply the host UI works.

### 7. Sheet / A smaller printmaking cohort

Fifteen places produce total revenue 8965; delivery costs remain 5600.

```ts
window.univerAPI.getWorkbook('beacon-learning-revenue').getSheetByName('Workshop revenue').getRange('B5').setValue(15)
```

### 8. Sheet / A fractional workshop fee

A fee of 47.50 produces revenue 10190 without rounding source precision.

```ts
window.univerAPI.getWorkbook('beacon-learning-revenue').getSheetByName('Workshop revenue').getRange('C5').setValue(47.5)
```

### 9. Sheet / An unpriced workshop

A blank fee is distinct source data from an explicit zero. Native multiplication
treats the blank as zero here; total revenue becomes 8290.

```ts
window.univerAPI.getWorkbook('beacon-learning-revenue').getSheetByName('Workshop revenue').getRange('C5').setValue({ v: null })
```

### 10. Sheet / Price the workshop again

```ts
window.univerAPI.getWorkbook('beacon-learning-revenue').getSheetByName('Workshop revenue').getRange('C5').setValue(45)
```

### 11. Sheet / Text cannot become a fee

The source row and dependent revenue/contribution/margin cards must retain the
native error. The two Base-only cost cards remain 5600.

```ts
window.univerAPI.getWorkbook('beacon-learning-revenue').getSheetByName('Workshop revenue').getRange('C5').setValue('pending')
```

### 12. Sheet / Repair the invalid fee

```ts
window.univerAPI.getWorkbook('beacon-learning-revenue').getSheetByName('Workshop revenue').getRange('C5').setValue(45)
```

### 13. Base / Remove an undecided room allowance

The room amount becomes null, not zero. SUM excludes it: total cost 3800.

```ts
window.univerAPI.getBase('beacon-learning-costs').getTableById('costs').getRecordById('cost-1').setValue('amount', null)
```

### 14. Base / Recover the room allowance

```ts
window.univerAPI.getBase('beacon-learning-costs').getTableById('costs').getRecordById('cost-1').setValue('amount', 1800)
```

### 15. Base / Preserve allocation precision

The room allowance 1825.50 produces cost 5625.50 and contribution 4464.50.

```ts
window.univerAPI.getBase('beacon-learning-costs').getTableById('costs').getRecordById('cost-1').setValue('amount', 1825.5)
```

### 16. Base / Edit context without changing a total

Changing a planning note must preserve all eight Formula Shape values.

```ts
window.univerAPI.getBase('beacon-learning-costs').getTableById('costs').getRecordById('cost-1').setValue('note', 'Room allocation reviewed; quantities remain illustrative.')
```

### 17. Base / Fully donated delivery

All six allocations are explicitly zero. Revenue and contribution are 10090;
margin is 100%. This differs from the zero-revenue division boundary.

```ts
const costs = window.univerAPI.getBase('beacon-learning-costs').getTableById('costs')
for (let i = 1; i <= 6; i++) costs.getRecordById('cost-' + i).setValue('amount', 0)
```

### 18. Base / Restore the six allocations

```ts
const costs = window.univerAPI.getBase('beacon-learning-costs').getTableById('costs')
for (const [i, amount] of [1800, 2100, 650, 420, 380, 250].entries()) costs.getRecordById('cost-' + (i + 1)).setValue('amount', amount)
```

## How the native binding works

The displayed create-demo.ts uses FShape.setFormula({ formula, externalReferences })
on each known native slide shape. Each write includes both stable source IDs and
the corresponding readable qualifiers. FShape.getFormulaResult() reports the
native value, displayText and status. No formula result is copied into a text box.

Formula expression examples are SUM of the external Sheet revenue range,
SUM of the Base Costs[Amount] field, their difference and the ratio. The Sheet
range itself contains quantity-times-fee formulas, so this includes a real
Sheet calculation -> slide Formula Shape chain.

The original narrative and geometry do not change when a source changes.
Navy/cyan overview, warm revenue page, blue-gray cost page and plum bridge page
are inspired by cached presentation hierarchy references, with original content.
Official SDK CSS is imported in the same entry used by Preview and independent
export. Grid ribbon is the default. There is no generic fixture panel.

## Acceptance status

The new check separates eight native calculation results from actual rendering
on each of the four main slide canvases. It checks opposite-source snapshots and
every authored non-formula element/shape geometry. It never accepts a thumbnail
or a historical paint as evidence of a current-page result.

- The baseline and independent Sheet changes have current four-page painting
  evidence, including smaller cohorts, fractional fees, blank fees, invalid text
  and repair. Open the revenue source page before a Sheet Facade write. A passive
  source with no render may mutate and recalculate, then throw in native
  auto-height; explicit unit IDs do not remove that beta.2 limitation.
- Root Base Facade writes update the eight native results and preserve the Sheet
  and authored slide layout, but remove the Slides workbench. Later navigation
  failures in the same sequence are downstream effects, not separate defects.
  The zero-revenue/recovery writes after this failure also throw from the missing
  Sheet render. No forced-focus listener or refresh button hides the problem.
- Editing the real Base Float grid is a distinct path: entering 2250 for Studio
  rooms produces cost 6050, contribution 4040 and 40.04% margin; all four main
  slide canvases update. This does not establish that the root Facade path works.
- The native Sheet Float input also passes: typing 52 into C5 produces revenue
  10370 while Base costs remain 5600, with all eight results and four main slide
  canvases checked. This input test does not require fullscreen to work.
- All 22 dependency locale packs are checked leaf-by-leaf for EN/ZH. Locale and
  light/dark/light changes preserve all three serialized owners after native
  source views have initialized. Original authored content stays English.
- Owned units are disposed before the shared Univer command services. The
  selected shutdown no longer emits the previous disposed-command warnings.
  The observed final errors, warnings and backend requests are recorded in the
  report rather than suppressed.

Native Float fullscreen remains unaccepted: the earlier activation test clicked
Enter fullscreen without producing a shell. Opening Sheet Print, Exchange
import/export, whole-deck printing, saved three-unit reconstruction, missing and
different valid source rebinding, full native formula-editor/menu interactions,
browser/navigation lifecycle, mobile, accessibility and performance still need
their own acceptance evidence. Selected production build, TypeScript and source
parity checks do not replace those runtime gates. No SDK package was patched.
