# Lumen / Launch economics

A fictional desk-lamp launch demonstrates **Sheet@Slide Float**, with **Sheet ->
Slides** calculation. The presentation owns the workspace; the real pricing Sheet
is embedded on its first page. Nine native Formula Shapes across three pages read
the same source. This is the opposite hosting direction to Atlas and Solstice,
not a reverse-writeback example.

Initial assumptions: 240 units, price $45, unit cost $18 and fixed cost $3,600.
Revenue is $10,800, variable cost $4,320, contribution $2,880, margin 26.67%,
break-even 134 whole units and headroom 106 units. Figures are original fictional
planning data, not transactions or business advice. Break-even assumes a positive
price-cost spread; the simplified model excludes taxes, returns and financing.

## Literal source examples

Run these exact snippets in order inside the demo iframe or standalone preview.
Return to the Pricing page before each edit, then inspect all three result pages.
Known beta.2 limitation: writing the source while its containing slide is inactive
throws in getUndoRedoParamsOfAutoHeight. The strict off-page test retains this
failure; no custom focus-restoration or refresh button hides it.
Each source edit recalculates the Sheet and all dependent native Formula Shapes.
There is no manual refresh, JavaScript total, copied text or custom fixture panel.

### 1. Price / Raise the selling price

Revenue becomes $11,520 and contribution $3,600. Volume and costs stay unchanged.

```ts
window.univerAPI.getWorkbook('lumen-pricing-model').getSheetByName('Launch model').getRange('B6').setValue(48)
```

### 2. Unit cost / Revise component costs

Variable cost becomes $4,800, contribution $3,120. Revenue stays $11,520.

```ts
window.univerAPI.getWorkbook('lumen-pricing-model').getSheetByName('Launch model').getRange('B7').setValue(20)
```

### 3. Fixed cost / Add launch preparation

Contribution becomes $2,520; break-even is 150 units. Variable cost stays fixed.

```ts
window.univerAPI.getWorkbook('lumen-pricing-model').getSheetByName('Launch model').getRange('B8').setValue(4200)
```

### 4. Volume / Plan a smaller first run

Revenue becomes $8,640, variable cost $3,600 and contribution $840. Fixed cost and
break-even stay unchanged; planned headroom becomes 30 units.

```ts
window.univerAPI.getWorkbook('lumen-pricing-model').getSheetByName('Launch model').getRange('B5').setValue(180)
```

### 5. Zero sales / Keep committed fixed cost

Revenue and variable cost become zero. Contribution is -$4,200; the margin must
expose the native division-by-zero error, not a fabricated 0%.

```ts
window.univerAPI.getWorkbook('lumen-pricing-model').getSheetByName('Launch model').getRange('B5').setValue(0)
```

### 6. Blank / Remove the quantity input

The direct quantity reference becomes null and its card is blank; arithmetic
coerces the blank quantity to zero. This differs from an observed numeric zero.
Inspect both the source cell and the empty quantity card.

```ts
window.univerAPI.getWorkbook('lumen-pricing-model').getSheetByName('Launch model').getRange('B5').clearContent()
```

### 7. Invalid text / Do not hide calculation errors

The direct quantity reference displays pending; dependent arithmetic reports
native errors. Fixed cost and break-even do not depend on the quantity input.

```ts
window.univerAPI.getWorkbook('lumen-pricing-model').getSheetByName('Launch model').getRange('B5').setValue('pending')
```

### 8. Recover / Restore all assumptions

```ts
window.univerAPI.getWorkbook('lumen-pricing-model').getSheetByName('Launch model').getRange('B5:B8').setValues([[240], [45], [18], [3600]])
```

### 9. Zero unit spread / Inspect break-even errors

Price now equals unit cost. Revenue is $4,320 and contribution -$3,600. The
break-even and headroom formulas must report native errors: this model cannot
recover fixed cost with no per-unit contribution.

```ts
window.univerAPI.getWorkbook('lumen-pricing-model').getSheetByName('Launch model').getRange('B6').setValue(18)
```

### 10. Recover / Restore the selling price

```ts
window.univerAPI.getWorkbook('lumen-pricing-model').getSheetByName('Launch model').getRange('B6').setValue(45)
```

## Native binding and export

### Native source Print preview

On Pricing, double-click the real Sheet to activate it, then run the public async
command below. Cancel the native preview to return. This is not whole-deck print
or a claim that the fullscreen toolbar works. The installed synchronous
FWorkbook.openPrintDialog wrapper is unsuitable for this async operation.

```js
await window.univerAPI.executeCommand('sheet.operation.print-open')
```

The shared Preview/export factory creates one native Sheet Float, registers a
stable external source ID, and calls FShape.setFormula for each authored shape.
Its visible calculated range remains in the Sheet. Repeated revenue on pages one
and three demonstrates one result consumed twice. FShape.getFormulaResult exposes
the native value, displayText and status. Formula animation is explicitly disabled
through its public Facade so comparison pages show current final values.

Grid ribbon and official SDK CSS are included in the standalone source export.
No competitor artwork is redistributed: the cached Gamma budget-review reference
informs presentation hierarchy, while Deep Ocean colors inform the navy, warm-white
and teal authored pages. The SDK workbench retains its native styling.

## Acceptance status

Partial evidence, not completed acceptance. The strict production report remains
FAIL: test-results/embed-lumen-formula-print/report.json. Ten literal examples
update all nine native results and the actual current canvas on all three pages;
authored prose, layout and element order remain unchanged. The source preview is
painted, and blank quantity returns null while zero returns numeric zero.
Invalid quantity and zero spread expose native errors and recover correctly.

Native inline B6 typing changes 45 to 48. Undo/Redo restores the checked values,
and the Redo snapshot is exact, but the first Undo leaves an extra style-pool
entry. The complete snapshot comparison intentionally fails. No normalization
or data-loss claim is made from the retained style alone.

Off-page source writes throw in AutoHeightController. The native fullscreen
button does not open a shell, so fullscreen keyboard/Grid and active-fullscreen
disposal are not accepted. These failures remain separate strict checks.
The async Print command opens a one-page native preview of the correct pricing
workbook/sheet and Cancel works. Ordinary owned-demo disposal removes its API,
root and floating chrome. No observed browser errors or backend requests occur
outside the explicitly captured failed API operation.

Both EN/ZH guides execute all ten snippets and preserve the same API owner and
complete models through dark/light changes: test-results/embed-lumen-formula-next/report.json.
Independent eleven-file source/CSS parity and native white UI pass:
test-results/lumen-formula-export-ui-final/report.json. The selected build contains
1933 modules, JS 18,370.71 kB / 4,559.09 kB gzip and CSS 137.60 kB / 20.89 kB gzip;
cold Next routes take 66 s / 18.6 s and emit a Gzip listener warning. These figures
are not performance acceptance. No SDK patch or root dependency was added.

Complete source identity/missing/rebind/reload, exact history, all native menus,
fullscreen, Exchange conversion, whole-deck printing, accessibility and delivery
performance before full acceptance. No collaborative-history claim is made.
