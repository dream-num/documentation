# Acorn / A forecast tab inside a sales Base

Ten fictional opportunities cover refill stations, library lockers, clinic
storage, lab benches and other modular installations. The Base holds four
linked customer groups, owners, stages and distinct next conversations.
Open **Weighted forecast** from the native Base table list to work in Sheets.
This is a real embedded workbook, not an iframe or a screenshot.

The workbook starts from the same authored deals but is an independent what-if
snapshot. Changing Base records does not synchronize it, and workbook edits
do not change the Base. Cross-product formulas are a separate demonstration.
Within the workbook, real VLOOKUP and ROUND formulas calculate stage-weighted
values; SUM totals them. Assumptions links back to the forecast and subtracts
it from an editable USD 210,000 working target. No cached result fakes a formula.

## Code that matches the preview

Raise Qualified-stage probability from 40% to 50%. Three opportunities update:

```ts
window.univerAPI
  .getWorkbook('acorn-weighted-forecast')
  .getSheetBySheetId('assumptions')
  .getRange('B5')
  .setValue(0.5)
```

Update the Base follow-up without changing the workbook:

```ts
window.univerAPI
  .getBase('acorn-sales-pipeline')
  .getTableById('deals')
  .getRecordById('deals-1')
  .setValue('next', 'Confirm site count on Friday')
```

Try 0% as a downside variant, or edit a sand-colored deal value. Native Sheets
Undo/Redo should affect only the workbook. Rename a customer group in Accounts
and revisit Opportunities: linked labels should follow the same record ID.
Use the native table list to return to the forecast without replacing its data.

## Integration and acceptance

The same factory powers Preview and the standalone export, including official
Base, Sheets, Embed and feature-plugin CSS. Default Sheets ribbon is Grid;
Base uses its native sidebar and controls. There is no fixture selector or
duplicate toolbar. Prepare, materialize and restore create the native
BasesTableListBlock anchor, using the SDK local example's tableIndex/tableName
context. The local source provider accepts only this workbook ID.

Selected independent production at 1600px passes both literal README examples,
native Sheets typing and Undo/Redo, all three probability variants, five Grid
menu tabs, native host/child navigation, and complete edited snapshot/theme
preservation. Native Accounts keyboard rename and Base Undo/Redo restore the
complete Base snapshots without changing the workbook. Two linked opportunity
labels follow the unchanged account ID. Active-child disposal removes the owned
UI and API without observed browser errors or backend requests.

The authored pipeline totals USD 338,500 before weighting. Qualified at 40%,
50% and 0% gives weighted totals of 215,125, 222,725 and 184,725. Typing 40,000
in Forecast C5 at 50% gives 226,725. The test checks recalculated row values,
totals and the target gap, not only formula strings.

The native Print command opens one populated Assumptions page and cancels
without changing the Base. This proves browser preview, not physical output
or Exchange conversion. EN/ZH Next guides preserve the same API owner and full
edited snapshots across actual media-theme changes. The standalone exports
the same eleven files with the official white SDK CSS.

Evidence: `test-results/embed-sheet-base-tab-production-history/report.json`,
`test-results/embed-sheet-base-tab-next-ready/report.json`, and
`test-results/embed-sheet-base-tab-export-final/report.json`.
An earlier source run reloaded while files were being formatted and the test
server did not serve Base query URLs; the source harness now accepts them.
Another test waited for an untruncated linked label; original shorter account
names now fit the native chips and both visible linked labels are checked.
The first Next test held a pre-hydration frame; the final test waits for the
live preview before resolving its frame. Failed reports remain available.

This remains partial acceptance. Full menu dialogs, delayed/error/empty
sources, repeated mounting, persistence, accessibility and narrow/touch layouts
remain open. Loading performance is not accepted: 218 offline packages, main
JS 18,592.50 kB / 4,573.81 kB gzip, CSS 158.78 / 23.38 kB. Cold selected Next
guide/playground requests took 61s/38.5s, with a Gzip listener warning.

The saved Feishu sales-template catalog informs the workflow, not the artwork.
All names, values and text are original and fictional. Indigo, teal, apricot
and pale lavender distinguish headings, calculated results and editable inputs.
No customer communication, invoices, approvals, backend or live CRM sync is
provided. Reload restores authored data and loses local changes. The SDK
license watermark is unchanged; SDK packages are not patched.
