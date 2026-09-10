# Freeze Rows and Columns

Three worksheets compare two frozen header rows, two frozen identity columns,
and their intersection. Scroll both axes, then use the native View ribbon to
unfreeze or freeze at the selected cell. The rainfall data are synthetic.

`create-demo.ts` calls `setFrozenRows(2)`, `setFrozenColumns(2)` and
`setFreeze({ startRow: 2, startColumn: 2, xSplit: 2, ySplit: 2 })`.
Use `getFreeze()` to inspect and `cancelFreeze()` to remove the configuration.
The preview and standalone entry import the same factory, official core preset
CSS and the complete English locale bundle. The demo stays English on either
host language; legacy locale arguments are ignored. Ribbon defaults to Grid;
no extra action panel.

This is a focused navigation example, not a large-data benchmark. Hiding,
resizing and split panes are separate capabilities, not claimed here.

## Native menu and scrolling acceptance

In installed `1.0.0-rc.0`, native **Freeze first row/column** targets the first visible row/column after scrolling, not necessarily worksheet row 1/column A. `getFreeze().ySplit/xSplit` gives the frozen count; `getFrozenRows()/getFrozenColumns()` return the ending boundary for offset panes. Return to the top-left before selecting these commands if worksheet row 1/column A is intended. This is the installed SDK behavior, not a demo approximation.
