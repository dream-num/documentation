# Lookup Formula Comparisons

An editable catalog compares lookup behavior without custom controls. Orange cells are inputs; blue cells contain native formulas. Select a result to inspect the formula bar.

| Result | Behavior | Initial value |
| --- | --- | --- |
| H5 | XLOOKUP exact SKU to price | 64 |
| H6 | INDEX with exact MATCH | 64 |
| H7 | XMATCH position in the SKU range | 3 |
| H8 | Missing SKU with an explicit fallback | Not stocked |
| H9 | Wildcard product name to SKU | L-102 |
| H10 | Return a column left of the lookup column | L-104 |
| H13 | Exact or next-smaller discount tier | 0.1 |
| H15 | Search duplicate SKUs from last to first | 52 |

Change C7 from 64 to 80: H5 and H6 both become 80. Change G13 to 50: H13 becomes 0.15. Change G15 to L-102: H15 becomes 72. The missing-item fallback in H8 does not mask other errors; INDEX/MATCH deliberately has no fallback wrapper.

XLOOKUP defaults to exact matching. Its fourth argument supplies the missing-item fallback; fifth argument `2` enables wildcards, while `-1` chooses an exact match or next-smaller value. The sixth argument `-1` searches last-to-first, which is different from returning a column to the left. XMATCH returns a one-based position, not the matched price.

Feature reference: [SpreadJS XLOOKUP demo](https://developer.mescius.com/spreadjs/demos/features/calculation/xlookup-function). This catalog and implementation are original.

## Facade example

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
sheet.getRange('C7').setValue(80)
sheet.getRange('H5').activate()
```

Calculation is asynchronous. The example and preview use the same workbook factory, complete English core-preset locale, official CSS and native Grid ribbon. No calculated values are prefilled and no host-side lookup implementation is used.
