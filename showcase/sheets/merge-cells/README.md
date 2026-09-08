# Merge cells

The gallery contains one horizontal range, three independent row merges, two
independent column merges and a rectangular block. Initial geometry is authored
in `mergeData`; it does not populate the user's Undo stack with setup commands.
The second sheet is a small blank-neighbor practice area. Use the native Grid
merge dropdown; no extra buttons duplicate it.

Run one variant at a time on the practice sheet:

```ts
const sheet = univerAPI.getActiveWorkbook().getSheetBySheetId('practice')
const range = sheet.getRange('B3:D4')
range.merge()
range.isMerged()
range.breakApart()
range.mergeAcross()
range.breakApart()
range.mergeVertically()
range.breakApart()
```

These are installed Facade methods, not a mock. The default merge retains only
the upper-left value for each resulting block. Unmerge restores geometry, not
discarded values; try destructive combinations only on disposable data. Native
Undo/Redo and Facade return values should be verified separately. A fluent
return value is not proof that an operation succeeded.

Preview and standalone export share the same factory, English data, the complete
English preset locale and bundled official CSS, regardless of host language.
The data factory ignores its legacy language argument. Site theme changes retain the
same workbook; standalone sizing lives in the entry point, not global demo CSS.

## Selected verification

`scripts/test-merge-cells-native.mjs` runs the actual Preview on EN/ZH host pages and checks
all eight gallery merge ranges, native Merge all, merged-label keyboard input,
native Cancel merge and its full-snapshot Undo/Redo, the four Facade variants,
unchanged gallery data, full edited snapshot/owner across themes and teardown.
It does not certify populated-cell conflict dialogs, forced overlapping merges,
all invalid ranges, reload persistence or comprehensive accessibility. Those
boundaries are not replaced by success messages or simulated SDK operations.
Earlier bilingual results are historical. The current English-only run in
`test-results/sheets-galleries-english-native/merge/report.json` passes these
same scoped native and Facade checks on English and Chinese host pages, with
no browser errors or backend writes. The unverified boundaries above remain open.
