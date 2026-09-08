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

Run data checks: `node scripts/test-number-format-gallery.mjs`. Runtime acceptance additionally requires native display/readback, editing, dark mode and English menu inspection on both host languages; static checks alone are not acceptance.

Historical bilingual acceptance: `test-results/number-format-gallery-expanded-verified/report.json`
passes EN/ZH actual Preview rendering, native accounting/fraction edits, unchanged
raw comparison cells, and complete workbook/owner preservation across themes.
Passive canvas text observations confirm formatted and edited values are painted;
screenshots were inspected. There are no browser errors or network writes. The
earlier `expanded-final` failure was an invalid harness assumption that offscreen
canvas text coordinates equal final worksheet coordinates; its report is retained.

The selected independent export builds and passes eight-file source parity,
official white/flex CSS and native canvas checks in
`test-results/number-format-gallery-export-ui/report.json`. Build manifest:
`test-results/number-format-gallery-export/selected-export-builds-1zIMVb/manifest.json`.
It uses exact-version local dependency junctions, not a fresh installation. Main
JS is 7,060.97 kB (1,727.67 kB gzip); the large-chunk warning remains. This does
not certify all accounting alignment, locale-specific parsing, accessibility,
mobile layout, or performance behavior.
The English-only rerun in
`test-results/sheets-galleries-english-native/number-format-final/report.json`
passes native accounting/fraction input, exact displayed values, unchanged raw
comparison cells and complete Preview owner/snapshot retention on both host
languages. Theme screenshots wait for the real toolbar skeleton to disappear,
enabled native controls and fresh canvas text; reviewed final captures are
settled. Accounting fill alignment and the other boundaries above remain open.
