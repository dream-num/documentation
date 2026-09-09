# Ripple / Sheets floating on a Board

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier  English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

A fictional community repair workshop plans 24 attendees, four tables and two
facilitators. The Board carries three activity cards and an access-support
decision; its native floating Sheet contains eight cost lines, a reserve,
a spending ceiling and a second worksheet comparing reserve rates.
The baseline is USD 1,433 direct costs, 1,576.30 including 10% reserve,
and 223.70 remaining below the 1,800 ceiling.

## Run and explore

Run pnpm install and pnpm dev in the standalone export. Double-click the
budget to activate its native editor. Board keeps its floating tools; Sheets
uses native Grid menus where the SDK exposes them. No fixture or reset panels,
duplicate editing buttons, backend or iframe stand-ins.

Execute this exact example to include six spare material kits:

```ts
window.univerAPI
  .getWorkbook('ripple-workshop-budget')
  .getSheetBySheetId('budget')
  .getRange('B5')
  .setValue(30)
```

Direct costs become 1,541, the planned total 1,695.10 and remaining room 104.90.
Attendance and refreshments do not automatically change. Native Undo/Redo restores
the workbook while preserving every Board note. Expand using the native floating
menu to see the five Grid tabs and Budget / Sensitivity worksheet navigation.
Compare 5%, 10% and 20% reserves: planned totals are 1,618.05, 1,695.10 and
1,849.20, so the last scenario exceeds the ceiling. Click B5 and type 36 to
budget twelve spare kits: planned cost becomes 1,813.90 and remaining room -13.90.

Return focus to the Board and update the pending decision independently:

```ts
window.univerAPI
  .getBoard('ripple-repair-workshop')
  .getShape('decision-note')
  .getText()
  .setText('READY TO TEST?\nConfirm the access contact.')
```

Selected native history checks affect the focused product only. Board text is not a
Formula Shape and does not synchronize with workbook cells. The diagram describes
an intended workshop; it does not invite people, book rooms or buy materials.

## Integration and acceptance

The same createDemo factory powers the Preview and eleven-file standalone export.
official host, child, Embed and feature CSS imports travel with the source. The native
BoardFloating anchor owns the floating geometry, while the workbook owns its
cells, formulas, sheet selection and history. A local provider accepts only the
authored workbook ID and Sheet type. Grid menu contributions use real matching
feature plugins, as in SDK local Embed examples.

Selected independent production at 1600px passes both literal examples, actual
mouse selection and keyboard input, whole-workbook Undo/Redo, five native Grid
tabs with commands, reserve-sheet navigation, independent Board text history and
card movement/history, themes and active-child disposal. Print opens the actual
one-page Budget preview and cancels successfully; no completed printer output or
PDF download is claimed. The public print event leaves Embed fullscreen so the
native host print dialog remains visible. No backend requests or browser errors
were observed in that test.

The selected standalone build installs 218 packages offline and builds 1,925
modules. Main JS is 18,292.79 kB / 4,541.73 kB gzip; CSS is 133.87 / 20.46 kB.
This is not an optimized delivery-size result. Independent eleven-file source
and official-CSS parity are tracked separately from behavioral acceptance.

The saved Gamma Budget Review informs the dark/lime emphasis; activity cards
use sage and apricot, with a warm-white worksheet. All geometry, names and
data are original. No competitor artwork is exported. Reload loses local edits.

The shared factory explicitly imports the official Ink UI English pack and CSS
required by the registered Boards UI dependency. Other product locale packs and
styles remain intact. This is resource coverage, not native pen acceptance.
