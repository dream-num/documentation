# Native canvas extensions

The only host controls register or dispose cell, row-header and column-header
extensions. Edit data, resize, hide, freeze, zoom and switch sheets in the native
Grid. There is no fixture, Reset, history or snapshot inspector panel.

The original 24 seed lots include zero, decimals, blank, text and out-of-range
values. Bars preserve exact percentages; dots round only their visual count.
Drawing uses SheetExtension and the three public Facade registration methods.
It is not a custom editor, validation rule or conditional formatting rule.

Run these snippets in order after the editor is ready. The same API is exposed
as window.univerAPI in the preview and standalone export.

## Change a real percentage

```ts
const workbook = univerAPI.getWorkbook('mossbrook-seed-bank')!
const sheet = workbook.getSheetBySheetId('lots')!
sheet.getRange('C4').setValue(65)
```

The first bar becomes amber and 65% long. Dots show seven markers, while the
native cell remains 65.0%.

## Blank versus invalid

```ts
sheet.getRange('C4').clearContent()
sheet.getRange('C5').setValue('pending')
```

C4 shows a gray dash; C5 shows two red marks. Neither rendering substitutes a
valid number for missing or invalid data.

## Restore valid source values

```ts
sheet.getRange('C4').setValue(87)
sheet.getRange('C5').setValue(25)
```

## Worksheet scope

```ts
workbook.setActiveSheet('reference')
```

Reference C4 contains 87 but has no overlay. Return with the native Seed lots tab.

## Geometry on the original source

```ts
workbook.setActiveSheet('lots')
sheet.setColumnWidth(2, 220)
sheet.setRowHeightsForced(3, 24, 52)
```

The extension follows native cumulative cell geometry. These are two separate
native edits, not one atomic history transaction. Rendering registration itself
is not workbook Undo history.

## Save data, not rendering functions

```ts
const saved = workbook.save()
```

The snapshot contains workbook data, not extension functions or the selected
host style/layers. A new owner must register its extensions again. JSON snapshots
are not XLSX export. Editor-only drawing does not establish Print or image/file
export fidelity. No Exchange or backend conversion is claimed here.

For a complete saved model, the exported factory accepts
`createDemo(container, darkMode, saved)` after disposing the previous controller.
It validates the original workbook and both sheet IDs and positive dimensions
before mounting, and clones the snapshot without rewriting resources or styles.
A same-owner `disposeUnit()` / `createWorkbook(saved)` reload requires **Apply
renderers** after the new renderer has attached. The callback resolves the current
workbook, not the disposed Facade captured by the previous unit. Reload resets unit
history; a new owner starts with the default three bar extensions.

The factory imports official core CSS and complete EN/ZH core locale packs.
Both native UI and the two host selectors/button follow the initial page language.
Theme changes retain the same owner and complete model.

## Strict native evidence

`scripts/test-mossbrook-native-complete.mjs` checks this selected export; see
`test-results/mossbrook-native-complete/report.json`. All six literal recipes run
in their original order, with intermediate models and actual pixels. Checks cover
native percentage editing, real formula recalculation and repaint, complete raw
Undo/Redo, continuous/dot layers and registration handles, resizing, hide/show,
frozen/scrolled row 24, 75%/150% zoom, native sheet switching, same-ID reattachment,
fresh restored input, empty/invalid data, initial EN/ZH, narrow viewports and
disposal before Steady and after calculationStart but before completion. Normal
export source/CSS and screenshots require real native paint without a skeleton.

Four strict SDK boundaries remain: initial numeric Undo changes inline styles to
style IDs and adds a type; Redo retains the extra style; row-height Undo leaves
empty row records instead of restoring an empty rowData object; new-owner recovery
changes the empty defined-name resource from `''` to `'{}'`. Visual success is not
complete snapshot equality. Same-owner reload and restored-owner fresh input
history are checked independently. No field, ID or resource is normalized to hide
these failures. The data and drawing semantics remain original.
