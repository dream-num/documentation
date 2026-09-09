# Create and Resize Tables

Three concise material-studio sheets distinguish ordinary cell data from native table membership. The table preset supplies the actual table model, filter headers, styling and native UI; the demo does not imitate tables with HTML or prefilled cell backgrounds.

## Native comparisons

- **Expand a table:** Deliveries initially covers A4:C8. Select a table cell and use its native Update Table Range control to extend to A4:C10. Two existing deliveries join the table; no worksheet rows are inserted.
- **Create from cells:** select A4:C10, open the Data ribbon and click its Table icon, then Confirm the range. Compare the resulting native header controls and table membership with the original cells.
- **Shrink a table:** Pigments initially covers A4:C10. Update its range to A4:C8. The last two data rows remain on the worksheet but leave the table.

Keep the top header row on row 4. These are table-boundary edits, not worksheet row/column resizing. The two initialized tables intentionally use different built-in themes.

The Update Table Range menu is on the coloured table-name pill above the header. Select the existing range text and replace it with the complete address, then confirm.

## Executable Facade recipes

Run recipe 1 on a fresh load before creating a table on Create from cells. The remaining recipes work on the initialized tables and keep their IDs.

### 1. Create a table from the raw specimen

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('create');
await sheet.addTable('Tools', sheet.getRange('A4:C10').getRange(), 'tools', { tableStyleId: 'table-default-3' });
console.log(sheet.getTableByCell(4, 0));
```

### 2. Include the waiting deliveries

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('expand');
await sheet.setTableRange('deliveries', sheet.getRange('A4:C10').getRange());
console.log(sheet.getTableByCell(9, 0));
```

The last row is now a member of Deliveries. Cell coordinates passed to getTableByCell are zero-based.

### 3. Exclude the last two pigment rows without deleting them

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('shrink');
await sheet.setTableRange('pigments', sheet.getRange('A4:C8').getRange());
console.log(sheet.getRange('A9:C10').getValues(), sheet.getTableByCell(9, 0));
```

The cell values remain; the last cell no longer belongs to Pigments.

### 4. Rename without replacing table identity

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('expand');
await sheet.setTableName('deliveries', 'StudioDeliveries');
console.log(sheet.getSubTableInfos());
```

## Scope and boundaries

The installed public options mark header hiding, footer and total-row options as not supported yet. This gallery does not advertise them or structured-reference formulas. It does not claim all Excel/SpreadJS table features, automatic expansion on typing, arbitrary moves, or overlapping table ranges.

Complete English core/table locales and official CSS are loaded with native Grid ribbon. Preview and standalone export share the same factory. No backend, dependency changes or SDK modifications are required.

Current runtime checks retain two strict limitations: Undo after a native range expansion does not restore the original saved range, and save/recreate generates different range-theme resource IDs. Redo, table data preservation and same-instance theme changes are checked separately. No snapshot normalization or SDK fixes hide these differences.

Capability reference: [SpreadJS table creation and resizing](https://developer.mescius.com/spreadjs/demos/features/tables/custom-table/purejs). This original Univer specimen verifies the native range dialog, not a dragged resize handle or full table-feature parity.
