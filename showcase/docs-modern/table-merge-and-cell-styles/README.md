# Table Merge and Cell Styles

Two native modern-document tables contain the same workshop schedule. The reference is unmerged. The second table merges the first row across three columns and the Print room label across two rows. Both use the same title shading, header bottom border and centered title paragraph so the structural difference is visible.

Covered cells are deliberately empty. The merge API retains the top-left cell content; do not use this example to assume that merging nonempty neighboring cells preserves all their text. Unmerge restores the original grid, not arbitrary new subdivisions or discarded content. Other workshop cells stay independent.

Click a cell to edit its native text. Select the merged cell and inspect its native table menu for merge operations. No host controls or HTML table renderer are used.

## Unmerge the title

```ts
const table = window.univerAPI.getActiveDocument().getTable('merged')
if (!table.getCell(0, 0).unmerge()) throw new Error('Unmerge rejected')
```

The first row returns to three cells; its title stays in the first cell. The vertical room merge remains.

## Restore the horizontal merge

```ts
const table = window.univerAPI.getActiveDocument().getTable('merged')
if (!table.getCell(0, 0).mergeTo(1, 3)) throw new Error('Merge rejected')
```

## Unmerge the room label independently

```ts
const table = window.univerAPI.getActiveDocument().getTable('merged')
if (!table.getCell(2, 0).unmerge()) throw new Error('Unmerge rejected')
```

## Apply a local cell fill and boundary

```ts
const api = window.univerAPI
const table = api.getActiveDocument().getTable('merged')
const range = table.getCellRange(4, 2)
if (!table.setCellBackground(range, '#E4F1EB')) throw new Error('Fill rejected')
if (!table.setBorder(range, { preset: api.Enum.DocsTableBorderPreset.Bottom, color: '#35725A', width: 3 })) throw new Error('Border rejected')
```

Only the 14:00 cell changes its fill and bottom border. These styles do not alter its text or merge structure. Horizontal text alignment uses the cell content's native document paragraph style, not CSS alignment. No vertical-alignment API is claimed. Reload restores both tables; preview and exported source share the factory and full official English locale and CSS.
