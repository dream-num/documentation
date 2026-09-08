# Clipboard and Paste Special

Three small original bindery specimens distinguish cell contents, formulas, formatting and external clipboard data. Teal source cells and amber destinations make changes visible without a host control panel.

## Native comparisons

Use a fresh load for each comparison. On Values and formulas, copy B5:D8 and paste at G5. Ordinary paste should carry data, formatting and repositioned formulas. For values only, right-click G5, hover Paste Special and select Paste Value: formula results become values, while destination formatting remains.

For formulas only, copy D5:D8 and choose Paste Formula at I5. Relative references should change from B5*C5 to G5*H5; destination quantities and prices remain untouched.

On Formats and widths, copy B5:D8 and select Paste Format at G5. Compare teal styling against unchanged destination numbers. Paste Column Width is a separate native mode: compare source B:D widths against destination G:I.

Clipboard access depends on browser permission and a secure context (localhost or HTTPS). No demo buttons intercept or replace the native copy/paste UI. Transpose, arithmetic paste, arbitrary external application fidelity, protected-range behavior and all clipboard MIME formats are outside this gallery's claims.

## Executable external-data recipes

These invoke the public pasteIntoSheet API, not a pretend copyTo API. They demonstrate application-provided clipboard payloads; passing them does not certify native Paste Special. Run each from a fresh load.

### 1. Paste a tab-separated block

```ts
const workbook = window.univerAPI.getActiveWorkbook();
workbook.setActiveSheet('external');
workbook.getActiveSheet().getRange('G5').activate();
console.log(await window.univerAPI.pasteIntoSheet(undefined, '14\t9\t126\n3\t22\t66'));
```

G5:I6 receives two rows and three columns.

### 2. Paste a styled HTML table

```ts
const workbook = window.univerAPI.getActiveWorkbook();
workbook.setActiveSheet('external');
workbook.getActiveSheet().getRange('G5').activate();
console.log(await window.univerAPI.pasteIntoSheet('<table><tr><td style="background-color:#E0E7FF;color:#3730A3;font-weight:bold">Rush order</td><td>18</td></tr><tr><td>Standard order</td><td>7</td></tr></table>', 'Rush order\t18\nStandard order\t7'));
```

Compare the imported header styling and values in G5:H6 with the surrounding amber cells.

### 3. Paste a literal formula

```ts
const workbook = window.univerAPI.getActiveWorkbook();
workbook.setActiveSheet('external');
workbook.getActiveSheet().getRange('I5').activate();
console.log(await window.univerAPI.pasteIntoSheet(undefined, '=G5*H5'));
```

Inspect I5's formula bar and calculated result; it is an external text formula, not an internally copied formula.

### 4. Paste a vertical list

```ts
const workbook = window.univerAPI.getActiveWorkbook();
workbook.setActiveSheet('external');
workbook.getActiveSheet().getRange('F5').activate();
console.log(await window.univerAPI.pasteIntoSheet(undefined, 'Courier collection\nStudio pickup\nPostal dispatch\nGuest delivery'));
```

Only F5:F8 labels change. Existing numeric destination cells remain available for comparison.

## Implementation boundary

The factory loads the complete English core preset and official CSS with native Grid ribbon. Preview and standalone share data and initialization; no backend, dependency changes or SDK modifications are used. Native actions, public payload ingestion and strict history/snapshot checks are reported separately.

Current strict history checks retain a snapshot limitation: Undo interns the original destination's inline styles into the workbook style table, and Redo retains those extra style entries. Cell values return correctly, but the complete saved workbook is not byte-for-byte equivalent. The test preserves both failures without normalizing snapshots. Cut/move, cross-workbook copy and OS-specific clipboard behavior are not certified by these comparisons.

Capability reference: [SpreadJS Paste Special](https://developer.mescius.com/spreadjs/demos/features/cells/copy-paste/paste-special/purejs). The original Univer specimen covers the modes listed above, not the benchmark's entire feature set.
