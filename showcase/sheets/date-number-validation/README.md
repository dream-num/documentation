# Date and number validation

Two native worksheets compare six validation rules using short boundary samples.
Amber cells remain editable; intentionally invalid values stay in the sheet and
receive native validation markers. This is permissive validation, not rejection
or host-side input sanitization. Empty input is allowed in all six ranges.

Numbers compares whole numbers 1–12, decimals 0–1 and numbers strictly above zero.
Dates compares September 1–30, 2027 (inclusive), strictly before September 1 and
September 1 onward. Dates are numeric spreadsheet serials with `yyyy-mm-dd`
formatting; formatting alone is not validation. Rule dates use local calendar
constructors rather than parsing an ambiguous text date.

Use the native Data > Data validation menu to inspect the rules. Try 2.5 in B4
on Numbers, then 2; compare the same fraction with decimal column C. Try zero in
D4 and then 0.5. On Dates, compare the opening day across all three columns and
enter 2027-08-31, then 2027-09-01. Delete a value to exercise allowed blank input.
Static captions describe the initial rules; native edits can change them.

## Executable Facade recipes

Run one block at a time against the live `window.univerAPI` after initialization.
These read actual SDK validation results; no custom error list is manufactured.

`getValues()` can return the formatted date text; use `getRawValues()` to inspect
the stored numeric date serials. In the installed SDK, `getValidatorStatus()`
groups results by intersected validation rule, not a row-major cell matrix when
the requested range crosses rules. For example, B4:D4 returns three one-cell
groups. Query a single rule's column when a simple sequence is needed.

```ts
const sheet = univerAPI.getWorkbook('validation-boundaries').getSheetBySheetId('numbers')
sheet.getRange('B4').setValue(2.5)
console.log(await sheet.getRange('B4').getValidatorStatus()) // invalid: not an integer
sheet.getRange('B4').setValue(2)
console.log(await sheet.getRange('B4').getValidatorStatus()) // valid
```

```ts
const sheet = univerAPI.getWorkbook('validation-boundaries').getSheetBySheetId('numbers')
sheet.getRange('C4').setValue(0.25)
sheet.getRange('D4').setValue(0)
console.log(await sheet.getRange('C4:D4').getValidatorStatus()) // valid, invalid
sheet.getRange('D4').setValue(0.5)
console.log(await sheet.getRange('D4').getValidatorStatus()) // valid
```

```ts
const sheet = univerAPI.getWorkbook('validation-boundaries').getSheetBySheetId('dates')
console.log(await sheet.getRange('B4:D4').getValidatorStatus()) // opening day: valid, invalid, valid
console.log(await sheet.getRange('B6:D6').getValidatorStatus()) // previous day: invalid, valid, invalid
```

```ts
const sheet = univerAPI.getWorkbook('validation-boundaries').getSheetBySheetId('dates')
sheet.getRange('B9:D9').clearContent()
console.log(await sheet.getRange('B9:D9').getValidatorStatus()) // all valid: blanks allowed
console.log(await sheet.getRange('B4:D9').getDataValidationErrorAsync())
```

## Scope

Preview and export share one factory, full English Core/Validation locales, both
official preset styles and the Grid ribbon. Native markers and editing need
browser acceptance separately from Facade status. This does not demonstrate
Stop/Warning/Information dialogs, date pickers, Office conversion or collaboration.
Timezones, locale-specific typed dates, clipboard behavior and all rule editors
must be checked before claiming broader compatibility. No SDK changes are used.

Capability contrasts reference [SpreadJS validation examples](https://developer.mescius.com/spreadjs/demos/features/cells/data-validation/custom-data-validator/vue3).
All sample data and Univer implementation are original; no competitor code or
host validation-control panel is copied.
