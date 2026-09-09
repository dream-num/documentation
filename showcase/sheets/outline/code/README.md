# Native outline gallery

Native UI and authored data are English-only. Earlier bilingual/native reports below are historical evidence, not acceptance of this migration.

Five independent worksheets share a compact six-item calculation layout, not
shared mutable cell objects. Use native sheet tabs, outline gutters and the Grid
ribbon. The factory includes official core/outline CSS and complete English locale packs.

```ts
// Zero-based start plus count: rows 4–6.
sheet.addRowOutline(3, 3)
// Parent rows 3–10; an independent child can remain expanded while hidden.
sheet.addRowOutline(2, 8)
const parent = sheet.getDimensionOutlines().find((group) => group.start === 2)!
sheet.setDimensionOutlineCollapsed(parent.id, true)
sheet.setDimensionOutlineCollapsed(parent.id, false)

// Columns B–F with B–D nested inside.
sheet.addColumnOutline(1, 5).addColumnOutline(1, 3)

// Removing the outline is NOT an unhide operation.
sheet.removeDimensionOutline(parent.id)
// Import DimensionOutlineAxis from @univerjs-pro/sheets-outline.
// Inclusive [3, 5], unlike addRowOutline(start, count).
sheet.clearDimensionOutlines(DimensionOutlineAxis.ROW, 3, 5)
```

Facade methods return the worksheet for chaining, not a success boolean. Read
getDimensionOutlines() and snapshot rowData/columnData to confirm actual results.
Adjacent groups may merge. Negative, zero-count, crossing and out-of-bounds
ranges are rejected/ignored by the SDK; do not claim success from a truthy return.
Clearing removes only groups fully contained in the inclusive range.

Collapsing a parent hides descendants regardless of a child's expanded flag.
Collapse does not delete source cells or formulas. Saving includes outline
resources and hidden dimensions; reload is a separate lifecycle operation.
The site preview changes themes on the same owner and preserves user edits.

The old 120-order host-control test is historical and not applicable to this
native gallery. It is not evidence that the SDK boundary semantics changed.
