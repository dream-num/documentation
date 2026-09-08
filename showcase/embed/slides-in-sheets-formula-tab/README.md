# Solstice / Scenario review deck

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

Slide@Sheet Tab composition; Sheet -> Slides formula dependency. Three original
evening-programme scenarios share ticket price 32, variable cost 18 per guest and
fixed cost 600. Guest counts 80, 100 and 125 produce revenues 2560, 3200 and 4000.
Contributions are 520, 800 and 1150; margins 20.31%, 25% and 28.75%.

Scenario model and Decision notes are native worksheets. Scenario deck is a real
SheetTab with three native Slides pages, not three screenshots. Each page reads
four cells from its own scenario row through FShape.setFormula external references.
The three distinct teal, cream and plum layouts contain twelve formula shapes.
This comparison deck calls the public setFormulaAnimationEnabled(false) API so
figures update without count-up transitions. Atlas keeps the default animated
behavior; neither example computes or substitutes its own display numbers.

## Literal examples

Run in order in the standalone page or demo iframe. Open the native Scenario deck
tab to compare all three pages after each edit; return to Scenario model to type
the same values through the native grid. Shared inputs affect all scenarios;
changing only Expanded guests must preserve the other two pages' formula results.

### 1. Change shared ticket price

Revenues become 2800, 3500 and 4375; contributions 760, 1100 and 1525.

```ts
window.univerAPI.getWorkbook('solstice-scenario-model').getSheetByName('Scenario model').getRange('B5').setValue(35)
```

### 2. Expand only one scenario

Expanded revenue becomes 4900, contribution 1780, margin 36.33%.
Conservative and Baseline outputs must remain unchanged.

```ts
window.univerAPI.getWorkbook('solstice-scenario-model').getSheetByName('Scenario model').getRange('B13').setValue(140)
```

### 3. Revise shared variable cost

Contributions become 600, 900 and 1500. Revenue does not change.

```ts
window.univerAPI.getWorkbook('solstice-scenario-model').getSheetByName('Scenario model').getRange('B6').setValue(20)
```

### 4. Exercise zero revenue

All revenues become zero. Contributions remain -2200, -2600 and -3400;
every margin must expose the native division error instead of a fake 0%.

```ts
window.univerAPI.getWorkbook('solstice-scenario-model').getSheetByName('Scenario model').getRange('B5').setValue(0)
```

### 5. Recover the shared price

All three scenarios recover without recreating the Slides unit.

```ts
window.univerAPI.getWorkbook('solstice-scenario-model').getSheetByName('Scenario model').getRange('B5').setValue(35)
```

### 6. Restore the original planning assumptions

Restore the initial three revenues, contributions and margins.

```ts
const model = window.univerAPI.getWorkbook('solstice-scenario-model').getSheetByName('Scenario model')
model.getRange('B5:B7').setValues([[32], [18], [600]])
model.getRange('B13').setValue(125)
```

## Binding, layout and export

The source Sheet contains actual formulas for revenue, total cost, contribution
and margin. Slides read these calculated cells using the stable Sheet sourceUnitId
and the readable Solstice Model qualifier. No JavaScript-computed KPI text, manual
refresh button, custom tab control or reverse write-back is used. Authored narrative
and geometry must survive every source edit. Twelve formulas remain separate from
the surrounding text and label shapes.

Both preview and independent Vite export call create-demo.ts. Eleven official SDK
CSS imports are exported with the source. Grid ribbon is default. Trial watermarks
remain. The cached Gamma budget-review cover is an internal topic reference only;
all data, stories and slide layouts here are original and competitor artwork is
not redistributed. No ticketing, backend, collaboration, Exchange or Print claim.

## Acceptance

Partial acceptance, not full capability completion.

Initial animated screenshots showed intermediate counts in thumbnail canvases.
Scenario comparison now explicitly disables number transitions through the public
Facade API. The revised captures show the final counts in the main canvas and
thumbnail previews. No custom render override, copied result or SDK patch.

Remaining: complete native menu/editor and serialized host history matrices,
save/reload with source mappings and embedded resources, rename/rebind, blank,
invalid and unavailable source recovery, in-flight/failure lifecycle, touch and
accessibility, narrow-screen matrices and measured production performance.
Planned and partial counts are not completed capability counts.
