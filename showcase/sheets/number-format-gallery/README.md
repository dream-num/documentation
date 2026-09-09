# Number Format Gallery

Native Sheets feature example with 20 comparisons and eight capability variants. The original 14 comparisons are unchanged. No custom fixture panel or duplicate ribbon controls. Original sample data; no third-party assets.

- `code/create-demo.ts` creates the preview and exported example, registers the complete English core preset locale and imports official `@univerjs/preset-sheets-core/lib/index.css`. Native UI and specimen labels stay English regardless of the host language; the data factory ignores its legacy language argument.
- `FRange.setNumberFormat(pattern)` applies each pattern after the SDK steady lifecycle stage. The installed beta.2 Facade declares this method and `getNumberFormat()`, `getDisplayValue()`, `getRawValue()` for inspection.
- B5:B24 and C5:C24 begin with identical numeric values. C cells are independently editable, not formula-linked to B. D is an initial-pattern reference and intentionally does not track later edits.
- C19:C21 use one accepted accounting pattern with positive, negative-parentheses and zero-dash sections. The installed beta.2 renderer keeps the currency symbol beside the amount instead of expanding `*` padding to the left cell edge. Accounting fill alignment remains a visible limitation, not a completed capability.
- C22:C24 show mixed `2 3/8`, fixed-denominator `2 6/16`, and approximate `1/3` values using native patterns. The underlying decimals remain unchanged.
- Currency symbols do not convert currencies; date formats do not convert timezones; display rounding does not change stored precision. Elapsed `[h]:mm` is contrasted with wrapping `hh:mm`.
- Native ribbon defaults to Grid. Only the container receives local CSS; no SDK style overrides. Theme changes use `toggleDarkMode()` without recreating the workbook.
- This is a formatting demo, not an Exchange/Print, snapshot lifecycle, performance or collaboration example.
