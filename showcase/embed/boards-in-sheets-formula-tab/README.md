# Juniper / Sensitivity workshop

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

A real Board tab lives beside its host Sheet in the native SheetBar. Six independent inputs drive fifteen Formula Shapes and three shape-bound connectors. **Board@Sheet Tab** describes composition; **Sheet -> Board** describes dependency. This is not a Float, manually regenerated dashboard or write-back service.

The fictional community making studio compares low, base and high equivalent-unit volumes. Fixed cost is shared, unit contribution is after variable costs, and multipliers are scenarios rather than probabilities. Original plum, pale-gold, sage, slate and peach artwork borrows title/contrast hierarchy from the saved Gamma Budget Review cover, not its artwork.

## Twenty-two literal examples

Switch between Assumptions and Sensitivity workshop using the native SheetBar. Run each snippet as printed in the standalone page or demo iframe. The same factory, official CSS and complete English packs are exported. No fixture panel, manual refresh button, duplicate ribbon tools, backend or JavaScript totals are added.

### 1. Increase unit contribution

18 becomes 20. Base contribution rises from 2700 to 3000; every scenario changes, but its volume does not.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B6').setValue(20)
```

### 2. Increase only fixed cost

Fixed cost becomes 2400. All after-cost values fall by 600; contributions and quantities remain unchanged.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B7').setValue(2400)
```

### 3. Increase reference volume

150 becomes 180. Scenario quantities become 144, 180 and 216; break-even volume stays 120.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B5').setValue(180)
```

### 4. Change only the high scenario

High multiplier becomes 1.4: 252 equivalent units, 5040 contribution, 2640 after fixed cost. Low and base results stay fixed.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B13').setValue(1.4)
```

### 5. Move only the downside

Low multiplier becomes 0.6: 108 units, 2160 contribution, -240 after cost. The spread increases.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B11').setValue(0.6)
```

### 6. Change the base scenario independently

Base multiplier 0.9 gives 162 units, 3240 contribution and 840 after fixed cost. The reference-volume input is still 180.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B12').setValue(0.9)
```

### 7. Set reference volume to zero

All scenario volumes and contributions are zero; each after-cost result is -2400. Break-even volume remains a separate 120.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B5').setValue(0)
```

### 8. Expose zero contribution

Contribution per unit zero makes break-even undefined. Preserve native #DIV/0!; other scenario values are still zero minus fixed cost.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B6').setValue(0)
```

### 9. Restore all initial assumptions

Return to 150 units, contribution 18, fixed cost 1800 and 80% / 100% / 120% multipliers.

```ts
const sheet=window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions')
sheet.getRange('B5:B7').setValues([[150],[18],[1800]])
sheet.getRange('B11:B13').setValues([[0.8],[1],[1.2]])
```

### 10. Leave contribution blank

Store null, not zero. The direct input Shape is blank while multiplication uses zero and break-even exposes its native division error.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B6').setValue({v:null})
```

### 11. Record explicit zero

The direct contribution Shape now displays $0.00 / unit, distinguishing it from blank.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B6').setValue(0)
```

### 12. Keep invalid text visible

A Sheet cell can hold pending. Direct text remains visible, while arithmetic, break-even and the conditional prompt expose native errors.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B6').setValue('pending')
```

### 13. Repair the numeric input

Restore 18. All baseline outputs should recover without reloading or reinserting shapes.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B6').setValue(18)
```

### 14. Rename the workbook label

Source identity remains the original unit ID; the Juniper Model qualifier must keep resolving.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').setName('Juniper / Reviewed model')
```

### 15. Prove a post-rename change

Reference volume 175 updates all scenarios. Low / base / high units become 140 / 175 / 210.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B5').setValue(175)
```

### 16. Bind an unavailable source

Temporarily map the existing qualifier to a missing unit. Preserve native errors, not last-good results.

```ts
window.univerAPI.getFormula().upsertExternalReference({unitId:'juniper-sensitivity-workshop',qualifier:'Juniper Model',sourceUnitId:'juniper-unavailable-source',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET})
```

### 17. Repair the same source

Current 175-unit scenario results return; surrounding shapes and connectors stay authored.

```ts
window.univerAPI.getFormula().upsertExternalReference({unitId:'juniper-sensitivity-workshop',qualifier:'Juniper Model',sourceUnitId:'juniper-workshop-model',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET})
```

### 18. Stress only the high case

Multiplier 2 gives 350 equivalent units and 4500 after cost. It is an assumption, not a forecast or probability.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').getSheetBySheetId('assumptions').getRange('B13').setValue(2)
```

### 19. Edit the authored workshop note

Select Sensitivity workshop first. This native Board text edit does not write back to the Sheet or alter formulas.

```ts
window.univerAPI.getBoard('juniper-sensitivity-workshop').getShape('scenario-note-1').getText().setText('Reviewed / Keep the contribution assumption explicit.')
```

### 20. Preview source Sheet Print

Select the actual Sheet before opening its registered frontend Print plugin. This does not establish Board-to-PDF conversion fidelity.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').setActiveSheet('assumptions')
window.univerAPI.executeCommand('sheet.operation.print-open')
```

### 21. Close Print

Cancel without submitting a job.

```ts
window.univerAPI.getWorkbook('juniper-workshop-model').closePrintDialog()
```

### 22. Inspect both owners

Read-only local snapshots retain models/resources, not durable storage or collaborative history.

```ts
console.log({sheet:window.univerAPI.getWorkbook('juniper-workshop-model').save(),board:window.univerAPI.getBoard('juniper-sensitivity-workshop').save()})
```

## Acceptance boundary

Partial native runtime evidence: test-results/embed-juniper-formula-paper/report.json passes all twenty-two literal snippets and six selected gates, without browser errors, warnings or backend requests. Baseline quantities are 120 / 150 / 180, contributions 2160 / 2700 / 3240, after-cost values 360 / 900 / 1440, break-even 100 units and high-minus-low spread 1080. Values do not round equivalent units to whole products.

Eighteen source steps alternate active Sheet and Board tabs. All fifteen current-canvas results, authored layout preservation, rendered shape-site connector routes, independent assumptions, blank/zero/text, native errors, rename and unavailable-source repair pass. Native Sheet keyboard input and exact Undo/Redo, separate Board text Facade history, fifteen complete EN/ZH dependency packs, whole-model light-dark-light and active-Board Tab disposal also pass. Source Print verifies the actual A4 paper with edited 175/22 inputs before cancellation, not just the dialog owner. Eleven-file standalone source/CSS parity is recorded in test-results/juniper-formula-export-ui/report.json.

The original source history probe exposed an implicit font-color entry after editing; explicit authored input colors now preserve the complete Sheet snapshots. The early Print screenshot was captured before paper paint, while the next test incorrectly excluded a Print portal inside the demo root. The corrected test targets the paper canvas itself. Neither correction patches SDK behavior or suppresses errors.

Edited two-unit reconstruction, different valid-source rebinding, complete native pointer/shape/connector/formula-editor menus, supported Exchange and actual conversion fidelity, Next guide integration, responsive/accessibility and delivery performance remain open. Fifteen locale packs are checked completely, but that does not prove every menu action. Fourteen official stylesheets ship with exact-version local dependencies, not a fresh install; native trial notices and the selected-build chunk warning remain. There is no automated pricing recommendation, approval, sale or printing job. A registered route is not full SDK acceptance.
