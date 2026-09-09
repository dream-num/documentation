# Conditional Format Rules

Four small seed-library sheets use actual conditional rules, not prefilled data-cell colours. Both the site Preview and standalone export call the same factory, with complete English core and conditional-formatting locale packs and official CSS. No backend is required.

## Try the native sheets

- **Numeric threshold:** B5:B10 is highlighted when greater than 8. Edit B6 from 4 to 11 and back; 8 is not highlighted.
- **Text contains:** B5:B10 contains `Check`. Edit B6 to `Check label`, then remove the word.
- **Duplicate labels:** B5 and B7 share SEED-24. Change B7 to SEED-99: both cells stop matching. The SEED-31 pair is unaffected.
- **Relative formula:** `=$B5<$C5` covers A5:C10. Each row compares its own available stock with its own minimum. Edit B6 from 12 to 1: the whole second data row should highlight. Equality on row 7 does not match.

Open **Data > Conditional Formatting > Manage Conditional Formatting**, then select a rule to inspect its condition, style and range. Change a threshold and press Submit to compare the resulting fill. Native Undo/Redo act on real edits. The formatting never rewrites data or moves rows.

## Executable Facade recipes

Run each snippet in the browser console with `window.univerAPI`. Replacing a rule here uses the worksheet's public builder; it does not set ordinary cell fills.

### 1. Change the numeric boundary

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('numbers');
sheet.clearConditionalFormatRules();
sheet.addConditionalFormattingRule(sheet.newConditionalFormattingRule().whenNumberGreaterThanOrEqualTo(8).setBackground('#FDE3B6').setRanges([sheet.getRange('B5:B10').getRange()]).build());
```

Row 8 now matches because its value equals 8.

### 2. Change the text condition

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('text');
sheet.clearConditionalFormatRules();
sheet.addConditionalFormattingRule(sheet.newConditionalFormattingRule().whenTextContains('Ready').setBackground('#D8EEF5').setRanges([sheet.getRange('B5:B10').getRange()]).build());
```

Rows 6 and 8 match; the Check rows no longer match.

### 3. Resolve one duplicate pair

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('duplicates');
sheet.getRange('B7').setValue('SEED-99');
console.log(sheet.getConditionalFormattingRules());
```

The stored rule is unchanged. Only the remaining SEED-31 pair matches.

### 4. Include equality in the row formula

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('formula');
sheet.clearConditionalFormatRules();
sheet.addConditionalFormattingRule(sheet.newConditionalFormattingRule().whenFormulaSatisfied('=$B5<=$C5').setBackground('#CDEDE3').setRanges([sheet.getRange('A5:C10').getRange()]).build());
```

The equal-stock row 7 now highlights across all three columns. `$B` and `$C` lock columns; the unprefixed row number remains relative to the rule's top-left range.

## Scope

This gallery isolates four highlight-rule families. Data bars, colour scales, icon sets, rule overlap/priority and cross-sheet formula references are not demonstrated here. Original seed-library fixtures are independent of other demos. Saving the workbook preserves both data and conditional-rule resources; theme changes should preserve the same workbook owner.

The installed SDK retains a generated font-style entry in the workbook style table after undoing the first native numeric edit. The focused test preserves this strict raw-snapshot failure separately from restored values and visible formatting; it does not normalize the saved workbook or patch the SDK.
