# Conditional Formatting Priority

Three native worksheets compare rule ordering, style composition and stop-if-true. All data-cell formatting comes from actual conditional rules targeting B5:B10, not ordinary cell fills. The native Grid ribbon uses the complete English Core and Conditional Formatting locale packs and official CSS.

Numeric snapshot cells explicitly use `CellValueType.NUMBER`, which the numeric conditional comparisons require. A JavaScript number in `v` alone does not supply that cell-type metadata.

Open the native conditional-formatting manager to inspect the two rules. The text beside the scores describes the initial order; it is an explanation, not a custom interactive rule manager. The Facade recipes below perform explicit rule reordering and updates without changing source scores.

## Comparisons

- **Background priority:** >80 mint precedes >50 amber. Scores 49/50 have no highlight, 51/80 use amber, 81/95 use mint. When both match the same background property, the higher rule wins.
- **Style merge:** >80 supplies only mint fill; >50 supplies burgundy font. Scores 60/80 have burgundy text; 90/100 combine burgundy text with mint fill. Neither rule stops evaluation.
- **Stop if true:** the >80 mint rule has `stopIfTrue: true`. Scores 65/80 use the lower burgundy font rule; 85/98 have mint fill and no lower-rule burgundy font. A stop rule blocks later rules only when it matches that cell.

The examples deliberately include exact 50/80 boundaries. Edit the same source score across a boundary to compare styling without changing the stored rule definitions. Formatting is presentation, not data removal or access protection.

## Public Facade recipes

Reload before each independent recipe. Wait for conditional formatting to repaint before comparing the native cells. Rule IDs identify this example's authored rules; range and style properties remain visible in `getConditionalFormattingRules()`.

### Put the broad background first

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('priority')
sheet.moveConditionalFormattingRule('priority-low', 'priority-high', 'before')
```

B9/B10 change from mint to amber; B7/B8 remain amber and B5/B6 remain unformatted. Moving the high rule before the low rule restores the initial order.

### Stop an otherwise composable rule

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('merge')
const rule = sheet.getConditionalFormattingRules().find(rule => rule.cfId === 'merge-high')
sheet.setConditionalFormattingRule(rule.cfId, { ...rule, stopIfTrue: true })
```

B9/B10 retain mint fill but lose the lower-rule burgundy text. B7/B8 still use burgundy text because the stop rule does not match them. `stopIfTrue` is a public rule property; there is no special builder setter in this example.

### Re-enable lower-rule composition

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('stop')
const rule = sheet.getConditionalFormattingRules().find(rule => rule.cfId === 'stop-high')
sheet.setConditionalFormattingRule(rule.cfId, { ...rule, stopIfTrue: false })
```

B9/B10 gain burgundy text while keeping their mint fill. All scores stay unchanged.

### Cross the stop boundary using source data

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('stop')
sheet.getRange('B9').setValue(80)
```

The original score 85 becomes 80: mint disappears and burgundy text becomes visible. B10 remains a matching mint stop case. The stored rule order and definitions are unchanged.
