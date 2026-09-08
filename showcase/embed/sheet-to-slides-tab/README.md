# Nova / Live operating deck

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

Three original operating-review slides read a real Sheet inserted as a fourth
entry in the native Slides page list. This is **Sheet@Slide Tab**, implemented
by the SDK's SlidesPageListBlock surface, not a Float or a custom bottom tab.
Data flows **Sheet -> Slides**; editing a slide result does not write back to the
Sheet. Thirteen native Formula Shapes read channel actuals, targets, ratios,
signed variances and a below-target count.

The fictional stationery collective starts with Retail 31,500 / 30,000, Partners
27,500 / 25,000 and Online 14,500 / 15,000 (actual / target). Overall attainment
is 73,500 / 70,000 = 105%, but one channel is below target. There are no business
transactions, backend calls or claims about real company performance.

## Literal source examples

Open **Operating data** before each snippet, then inspect all three result pages.
Use the explicit workbook ID; native focus and embedding direction are distinct
from formula dependencies. No custom JavaScript totals or refresh button is used.
Examples run in the order below in the demo iframe or standalone preview.

### 1. Retail actual / Strengthen one channel

Overall actual becomes 77,000, attainment 110%. Other channels stay unchanged.

```ts
window.univerAPI.getWorkbook('nova-channel-model').getSheetByName('Channel plan').getRange('C5').setValue(35000)
```

### 2. Retail target / Change the comparison independently

Target becomes 72,000. Actual remains 77,000; only the Retail and overall ratios
change. Overall attainment is 106.94%.

```ts
window.univerAPI.getWorkbook('nova-channel-model').getSheetByName('Channel plan').getRange('B5').setValue(32000)
```

### 3. Online actual / Remove a local shortfall

Overall actual becomes 80,500; every channel now meets its own target.

```ts
window.univerAPI.getWorkbook('nova-channel-model').getSheetByName('Channel plan').getRange('C7').setValue(18000)
```

### 4. Partners actual / Explicit zero

Overall actual becomes 53,000. Partners is the only below-target channel.

```ts
window.univerAPI.getWorkbook('nova-channel-model').getSheetByName('Channel plan').getRange('C6').setValue(0)
```

### 5. Partners actual / Blank is not an observed zero

The direct Partners card becomes blank. Arithmetic may coerce the blank to zero,
while SUM ignores it. Inspect both the source and the direct native result.

```ts
window.univerAPI.getWorkbook('nova-channel-model').getSheetByName('Channel plan').getRange('C6').clearContent()
```

### 6. Invalid text / Aggregates do not certify clean input

The direct card displays pending. SUM ignores text but arithmetic on that text
reports errors. A plausible total is not proof that all source records are valid.

```ts
window.univerAPI.getWorkbook('nova-channel-model').getSheetByName('Channel plan').getRange('C6').setValue('pending')
```

### 7. Recover / Restore all channel inputs

```ts
window.univerAPI.getWorkbook('nova-channel-model').getSheetByName('Channel plan').getRange('B5:C7').setValues([[30000, 31500], [25000, 27500], [15000, 14500]])
```

### 8. One zero target / Isolate a local ratio error

Retail's ratio divides by zero. Other channel ratios remain valid; overall
attainment still calculates because the other targets total 40,000.

```ts
window.univerAPI.getWorkbook('nova-channel-model').getSheetByName('Channel plan').getRange('B5').setValue(0)
```

### 9. All zero targets / Expose the overall error

All channel ratios and the repeated overall ratio must expose native errors.
Actual amounts and signed variances remain meaningful numeric values.

```ts
window.univerAPI.getWorkbook('nova-channel-model').getSheetByName('Channel plan').getRange('B5:B7').setValues([[0], [0], [0]])
```

### 10. Recover / Restore target values

```ts
window.univerAPI.getWorkbook('nova-channel-model').getSheetByName('Channel plan').getRange('B5:B7').setValues([[30000], [25000], [15000]])
```

## Native implementation and source export

The factory follows the existing SDK local Tab example: prepare the descriptor,
materialize its real Sheet and restore it into the Slides page list. It then
binds known Formula Shapes with stable source IDs and readable qualifiers.
Every result stays native; surrounding prose, speaker notes and geometry are
authored. Formula animation is disabled through the public Facade to show final
comparison values. No iframe stand-in, fixture panel or duplicate toolbar is added.

Preview and standalone export use the same factory and official SDK CSS. Grid
is the default ribbon. Native Sheet Print is registered; this alone does not
prove correct-source printing. The cached Gamma budget-review hierarchy and
Deep Ocean palette inform original navy, warm-coral and plum page designs;
competitor artwork is not redistributed.

## Acceptance status

Native Operating data typing, value Undo/Redo, exact Redo, five populated Grid
groups, correct-source Print menu preview/Cancel and active-source disposal pass.
Two failures remain: writing to the source while a result slide is active throws
in AutoHeightController because the source render is absent; first exact Undo
retains an extra resolved input style in the workbook style pool. Values do undo.
Neither failure is hidden by focus switching, normalization or an SDK patch.
