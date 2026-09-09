# AutoFill Series

Four independent seed pairs compare numeric steps, descending values, weekly dates and repeating values. Only rows 5–6 contain initial values; rows 7–10 have empty styled targets. No host code fills the results.

Select B5:B6 using the native name box, then drag the selection's bottom-right fill handle down to B10. Repeat for columns D and F. For H, choose **Copy Cell** from the native fill options after dragging to repeat the pair instead of continuing its step. Native Undo lets you retry.

## Public Facade recipes

The target includes the original seed. Run these statements after the demo is ready:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('series')
if (!await sheet.getRange('B5:B6').autoFill(sheet.getRange('B5:B10'), 'SERIES')) throw new Error('Ascending fill rejected')
// B5:B10: 10, 15, 20, 25, 30, 35

if (!await sheet.getRange('D5:D6').autoFill(sheet.getRange('D5:D10'), 'SERIES')) throw new Error('Descending fill rejected')
// D5:D10: 12, 9, 6, 3, 0, -3

if (!await sheet.getRange('F5:F6').autoFill(sheet.getRange('F5:F10'), 'SERIES')) throw new Error('Date fill rejected')
// F5:F10: Sep 7, 14, 21, 28; Oct 5, 12, 2026
// Raw serials: 46272, 46279, 46286, 46293, 46300, 46307

if (!await sheet.getRange('H5:H6').autoFill(sheet.getRange('H5:H10'), 'COPY')) throw new Error('Copy fill rejected')
// H5:H10: 10, 15, 10, 15, 10, 15
```

Dates are actual numeric serials with a native date format. The installed date rule uses arithmetic progression, so this weekly interval is seven days, not a weekday-only or month-end calendar feature. Those modes are not claimed here.

Formula-reference translation has its own demo. This case contains no formulas: it teaches actual value-series inference and the difference between SERIES and COPY. Full English preset locale, Grid Ribbon and official preset CSS are shared by preview and exported factory.
