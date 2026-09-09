# Formula Errors and Recovery

Three native Sheets tabs use original workshop calculations. Formula cells have no authored result values: the installed calculation engine produces the errors and recoveries. Amber cells are source inputs; teal cells contain formulas or repair instructions, not conditional error highlighting.

## Native comparisons

- **Six formula errors:** D5:D10 demonstrate division by zero, missing exact match, incompatible text arithmetic, an indirect reference to a missing sheet, an intentionally unknown function, and a negative square root. Follow the repair instruction in column E. Select a result to read its real formula in the native formula bar.
- **IFERROR versus IFNA:** both catch a missing match. Only IFERROR catches division by zero. Both preserve a healthy result. Enter `Maple` in B5 and `4` in C6 to repair the sources; the raw and wrapped formulas recalculate together.
- **Dependent results:** C5 starts at zero. Enter `6` to change D5 to 16, E5 to 24 and F5 to 24. The dependency chain uses ordinary native formulas, with no host-side recalculation.

Use the native name box to select an address, type the replacement, then press Enter. Native Undo and Redo restore the calculated results, but the tested runtime retains/interns style entries (and an explicit numeric cell type on Undo), so strict full-snapshot equality fails. The test records both raw differences independently without normalization.

## Executable Facade recipes

Run each block independently after reloading. These blocks use the same workbook and native cells as the Preview; calculation completes asynchronously.

### 1. Repair division at its source

```ts
const book = window.univerAPI.getActiveWorkbook()
book.setActiveSheet('errors')
book.getActiveSheet().getRange('C5').setValue(7)
book.getActiveSheet().getRange('D5').activate()
```

D5 becomes 12; its formula remains `=B5/C5`.

### 2. Recover a missing item without hiding the raw error

```ts
const book = window.univerAPI.getActiveWorkbook()
book.setActiveSheet('recovery')
book.getActiveSheet().getRange('F5').setValue('=IFNA(D5,"Order material")')
book.getActiveSheet().getRange('F5').activate()
```

F5 shows `Order material`, while D5 remains #N/A. IFNA in F6 still leaves #DIV/0! visible.

### 3. Replace the intentionally unknown function

```ts
const book = window.univerAPI.getActiveWorkbook()
book.setActiveSheet('errors')
book.getActiveSheet().getRange('D9').setValue('=SUM(B9,3)')
book.getActiveSheet().getRange('D9').activate()
```

D9 changes from #NAME? to 15. The initial unknown function is deliberately invalid, not an SDK extension API.

### 4. Repair a shared dependency

```ts
const book = window.univerAPI.getActiveWorkbook()
book.setActiveSheet('propagation')
book.getActiveSheet().getRange('C5').setValue(6)
book.getActiveSheet().getRange('F5').activate()
```

D5:F5 become 16, 24, 24. IFERROR returns the successful result rather than its fallback string.

## Scope and limits

The gallery uses the complete English core preset locale, official preset CSS and native Grid ribbon. Preview and standalone export share `create-demo.ts` and an independent workbook-data factory. Theme changes keep the same owner; disposal removes that owner and its root.

This is error inspection and recovery, **not trace precedents/dependents parity**. No published trace-arrow Facade was found in the installed formula packages. Formula-bar inspection and native dependency recalculation are shown; no custom trace service or host arrows are fabricated. Other error types, circular-reference diagnostics, parser errors, cross-file failures and exhaustive formula auditing are outside this gallery.

Capability references: [SpreadJS resultant error values](https://developer.mescius.com/spreadjs/docs/formulareference/formulaoverview/resulterror), [IFERROR](https://developer.mescius.com/spreadjs/docs/formulareference/FormulaFunctions/logical-functions/IFERROR), and [formula auditing](https://developer.mescius.com/spreadjs/docs/features/formulas/formula-auditing). The fixture and Univer implementation are original; the references do not imply full feature parity.
