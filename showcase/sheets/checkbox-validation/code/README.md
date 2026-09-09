# Checkbox data validation

Six original field-kit tasks compare two native checkbox rules. Switch the native sheet tabs: **Default 1 and 0** stores numeric states; **Packed and Open** stores custom text. Column C uses ordinary cell formulas to show the stored values, and B10 counts completed tasks. These are native cell widgets, not host controls.

Click B2 and B3, compare column C, then use native Undo and Redo. Type `Review` into B7 to inspect invalid input: this example allows invalid values rather than silently cleaning them. Blank input is allowed too. Use the native Data validation UI to inspect the rules.

## Executable Facade recipes

Run these snippets against the live demo's `window.univerAPI`. Rule creation can initialize checkbox cells; set initial values after applying a rule.

### Default two-state values

```ts
const sheet = univerAPI.getActiveWorkbook().getSheetBySheetId('numeric')
sheet.getRange('B2:B7').setDataValidation(univerAPI.newDataValidation().requireCheckbox().setAllowBlank(true).setAllowInvalid(true).build())
sheet.getRange('B2:B3').setValues([[1], [0]])
console.log(sheet.getRange('B2:B3').getValues())
```

### Custom checked and unchecked text

```ts
const sheet = univerAPI.getActiveWorkbook().getSheetBySheetId('custom')
sheet.getRange('B2:B7').setDataValidation(univerAPI.newDataValidation().requireCheckbox('Packed', 'Open').setAllowBlank(true).setAllowInvalid(true).build())
sheet.getRange('B2:B3').setValues([['Open'], ['Packed']])
console.log(sheet.getRange('B2:B3').getValues())
```

### Save both sheets and their validation rules

```ts
const snapshot = univerAPI.getActiveWorkbook().save()
console.log(snapshot.sheets.numeric.cellData[1][1], snapshot.resources)
```

## Scope

The default checkbox is boolean-like but its installed SDK values are 1 and 0, not JavaScript `true` and `false`. Custom values use the public `requireCheckbox(checkedValue, uncheckedValue)` API. This is not a three-state checkbox or a form-submission workflow. Native input validation and Facade writes are separate paths; setting values through the Facade does not prove native invalid-paste rejection.

The Preview and downloadable entry use the same independent factory, both official preset styles and complete English locale bundles. Theme changes update the existing owner. No backend, SDK patches, external data or host-side checkbox implementation is required.
