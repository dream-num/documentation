# Table merge and borders

Seven native slide tables on two slides. The first slide compares a three-column merge, a two-row merge, and a range merged then split during initialization. The second compares border edges, widths, colors and dash patterns with identical cell values.

All tables use the model and Table UI plugins, with official CSS and complete English locales. Select cells to use native table controls; double-click a cell to edit its text. Row and column indexes below are zero-based and range ends are inclusive.

In the installed SDK version, the native **Unmerge cells** context-menu action reports an unregistered `slide-table.menu.unmerge-cells` command. The public `unmergeCell()` recipe below works independently; this demo does not patch SDK commands or claim that menu action works. Border clearing uses `Dash.None` with `Preset.All`; `Preset.None` currently returns false without clearing the grid.

## Public Facade recipes

Split the first table's merged header into three cells:

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(0)
const table = slide.getTableAt(0)
table.unmergeCell(0, 0)
```

Merge that header again:

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(0)
const table = slide.getTableAt(0)
table.mergeCells({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 })
```

The samples intentionally leave covered cells empty. Merging is a structural edit, not a text-concatenation recipe; splitting does not invent text for the newly separate cells.

Clear the dotted table's grid and apply a thick outer frame. Cell text stays unchanged:

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(1)
const table = slide.getTableAt(3)
const { SlideTableBorderDashEnum: Dash, SlideTableBorderPresetEnum: Preset } = univerAPI.Enum
table.setTableBorder({ dash: Dash.None }, Preset.All)
table.setTableBorder({ color: '#254B5A', width: 3, dash: Dash.Solid }, Preset.Outer)
```

Add a dashed separator below the header of the full-grid table without changing other rows:

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(1)
const table = slide.getTableAt(1)
const { SlideTableBorderDashEnum: Dash, SlideTableBorderPresetEnum: Preset } = univerAPI.Enum
table.setBorder(
  { startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 },
  { color: '#AD6C39', width: 2, dash: Dash.Dash },
  Preset.Bottom,
)
```

Border presets select edges; dash patterns describe their strokes. Each initial comparison first clears existing borders so an outer-only or horizontal-only specimen is not layered over a hidden default grid. This example does not claim spreadsheet formulas or PowerPoint export fidelity.
