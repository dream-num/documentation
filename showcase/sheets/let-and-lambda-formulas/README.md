# LET and LAMBDA Formulas

Two small worksheets demonstrate formula-level variables and callbacks, not custom JavaScript functions. LET names a quantity and price locally; the adjacent immediately invoked LAMBDA receives them as arguments. Both add 2 for packing. The second sheet compares MAP over two arrays with BYROW over a two-column range, then REDUCE totals the mapped results.

Initial local E5:F7 rows are 18/18, 17/17 and 2/2. The higher-order sheet has E5:E8 and G5:G8 values 16, 15, 0, 8, and I5 = 39. K5 is a separate spill-range consumption comparison with an initial-load limitation described below. Only the anchors contain formulas; lower MAP/BYROW cells are native spill results.

## Public Facade recipes

Run separately on the initial workbook. Native name-box navigation and cell editing perform the same source changes.

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('local')
sheet.getRange('B5').setValue(4)
// E5 and F5 recalculate from 18 to 34.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('higher-order')
sheet.getRange('B5').setValue(4)
// E5 and G5 become 32; I5 and K5 become 55. Other spill rows remain 15, 0, 8.
```

Change the accumulation's initial value without rewriting the mapped costs:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('higher-order')
sheet.getRange('I5').setFormula('=REDUCE(10,MAP(B5:B8,C5:C8,LAMBDA(qty,price,qty*price)),LAMBDA(total,cost,total+cost))')
// Initial inputs: 49. After the previous B5 edit: 65.
```

Recalculation is asynchronous. Inspect formulas through the native formula bar or FRange.getFormula(). Do not type into spill children. Recursive LAMBDA, named reusable LAMBDA functions and performance claims are outside this example.

I5 consumes a nested MAP array directly. K5 deliberately keeps the equivalent REDUCE over E5:E8. In the installed SDK, fresh loading produced K5 = 16 instead of 39 even after settling; re-entering the unchanged formula also kept 16. Editing B5 from 2 to 4 recalculated both I5 and K5 correctly to 55. This is a reproduced initial-load dependency issue, not a claim that spill-range consumption never works. No host code forces recalculation or substitutes a result. Compare the amber nested result with the red-tinted initial-load check, then edit B5 to observe recovery.

The shared factory uses Grid Ribbon, complete English preset locale and official CSS. No host precomputation, substituted engine, SDK patches or extra action panels are used.
