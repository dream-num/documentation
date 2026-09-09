# Text Cleaning Formulas

Two native sheets compare text functions using editable inputs and calculated outputs. Pink cells are inputs; purple cells contain formulas without prefilled results. Select a result to inspect its native formula bar.

## Clean and normalize

- `TRIM` removes leading/trailing ordinary spaces and collapses repeated spaces.
- `CLEAN` removes control characters. The tab and newline in B6 disappear; the result is `PaperStudio`, not two words separated by a new space.
- `SUBSTITUTE` replaces nonbreaking spaces before trimming, or replaces all matches versus only the second match.
- The final row combines `CLEAN` and `TRIM`. Column D joins a fixed category with each cleaned result.

Edit B5 to `  Grace   Hopper  `: C5 becomes `Grace Hopper` and D5 becomes `Guest | Grace Hopper`.

## Join optional fields

E5 uses `=TEXTJOIN(" / ",TRUE,B5:D5)`; F5 uses the same range with `FALSE`. Initially E5 is `Ada / Lovelace`, while F5 is `Ada /  / Lovelace`. Enter `Byron` in C5 and both become `Ada / Byron / Lovelace`.

## Facade example

```ts
const workbook = window.univerAPI.getActiveWorkbook()
workbook.setActiveSheet('cleaning')
const sheet = workbook.getActiveSheet()
sheet.getRange('B5').setValue('  Grace   Hopper  ')
sheet.getRange('C5').activate()
```

The calculation engine updates the dependent results asynchronously. The example does not implement host-side text transformations.

Preview and exported source share the same factory and workbook data. The core preset supplies the Grid ribbon, complete English locale and official CSS. No additional plugin or external service is required.
