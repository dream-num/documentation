# Validation Error Messages

Three independent six-row crate-allocation sheets use the same whole-number criterion (1–6) but different feedback. All visible dialogs, markers and validation panels are native SDK UI. The demo adds no simulated alert or custom input control.

Capability reference: [SpreadJS basic data validation gallery](https://developer.mescius.com/spreadjs/demos/features/cells/data-validation/basic-data-validator/purejs). This original Univer case covers the verified feedback paths below, not complete feature parity or unsupported input prompts.

## Try native feedback

- **Reject invalid:** select B5, type 9 and press Enter. Inspect the native rejection dialog's custom message. Dismiss it, press Escape to cancel the invalid edit, and confirm the original count remains. Then enter a valid count.
- **Keep with message:** type 9 in B5. The draft value is retained and invalid. Hover its invalid marker to inspect the custom error text; replace it with 4 to recover.
- **Default message:** enter 9 in B5 and inspect the generated numeric-rule message instead of a custom message.

Blank cells are allowed. Use **Data > Data Validation** to inspect the real criterion, rejection setting and custom-message settings. The Stop setting concerns supported native editing paths; it is not a security boundary or a promise that every programmatic write is rejected.

## Executable Facade recipes

Run these snippets using `window.univerAPI` in the browser console.

### 1. Allow draft values on the rejection sheet

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('reject');
sheet.getRange('B5:B10').setDataValidation(window.univerAPI.newDataValidation().requireNumberBetween(1, 6, true).setAllowBlank(true).setAllowInvalid(true).setOptions({ showErrorMessage: true, error: 'Draft count: use 1–6 whole crates before approval.' }).build());
```

Now test a native invalid edit: it is retained rather than blocked.

### 2. Change the review message

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('warning');
sheet.getRange('B5:B10').setDataValidation(window.univerAPI.newDataValidation().requireNumberBetween(1, 6, true).setAllowBlank(true).setAllowInvalid(true).setOptions({ showErrorMessage: true, error: 'Packing review: choose a whole count between 1 and 6.' }).build());
```

Enter 9 and inspect the updated custom text. The criterion and permissive mode have not changed.

### 3. Switch to the generated message

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('warning');
sheet.getRange('B5:B10').setDataValidation(window.univerAPI.newDataValidation().requireNumberBetween(1, 6, true).setAllowBlank(true).setAllowInvalid(true).setOptions({ showErrorMessage: false }).build());
```

The native validator supplies the numeric-rule message. Disabling the custom message does not make invalid data valid.

### 4. Recover a value and inspect its status

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('warning');
sheet.getRange('B5').setValue(4);
console.log(await sheet.getRange('B5').getValidatorStatus());
```

The status becomes `valid` and the invalid marker disappears. This is a Facade write, distinct from the native rejection tests.

## Published-option boundaries

`setAllowInvalid(false)` selects STOP; `true` selects WARNING. Although the installed SDK exports an INFO enum, this gallery does not claim a separate information-dialog workflow. Input prompt fields (`showInputMessage`, `prompt`, `promptTitle`) are explicitly marked unused in the installed public declaration. The native rejection dialog uses a fixed SDK title rather than `errorTitle`; no custom-title or input-prompt UI is faked here.

Complete English core and validation packs and official CSS are loaded. Preview/export share the factory; no backend or SDK change is required. Original datasets are independent of the date/number, list and checkbox galleries.

In the installed SDK, canceling a rejected native edit restores the original value, but leaves a generated font-style entry in the workbook style table. The focused test retains this raw-snapshot difference as a strict failure; it does not normalize or patch the SDK.
