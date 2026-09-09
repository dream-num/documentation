# Conditional Format Visuals

Three original field-station datasets compare live conditional-formatting visuals. Columns B and C are independent copies for comparison, not synchronized data. The data cells have no prefilled colours, bars or icon images.

Capability reference: [SpreadJS conditional-format rules gallery](https://developer.mescius.com/spreadjs/demos/features/cells/conditional-format/conditional-rules/purejs). The fixtures and implementation here are original Univer demos, not a claim of complete API or feature parity.

## Native comparisons

- **Colour scales:** B5:B10 interpolates between colours at 0 and 100. C5:C10 adds a third colour at 50. Edit B5 from 0 to 100: its colour moves to the opposite endpoint; C5 stays at 0.
- **Signed data bars:** B uses solid fills and C uses gradients, both with fixed bounds -100 and 100. Negative values extend left of zero; positives extend right. Edit B5 from -80 to 80 to compare sign and direction; the zero row has no magnitude bar.
- **Icon thresholds:** green arrow at 80 or above, yellow at 50 or above, red below 50. Rows include 49/50 and 79/80 boundaries. Column C hides numbers visually, but the formula bar and saved cells retain them. Edit B5 from 30 to 80 and compare the icon with unchanged C5.

Open **Data > Conditional Formatting > Manage Conditional Formatting**, choose a rule, inspect the range and visual settings, and submit a change. These are native SDK rule editors, not custom demo controls.

## Executable Facade recipes

Run each snippet in the browser console. They operate on the same rules and cells seen in the native sheets.

### 1. Reverse the two-colour endpoints

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('scales');
const rule = sheet.getConditionalFormattingRules().find(rule => rule.ranges[0].startColumn === 1);
const replacement = sheet.newConditionalFormattingRule().setColorScale([
  { index: 0, color: '#8CCABB', value: { type: 'num', value: 0 } },
  { index: 1, color: '#FCE6BB', value: { type: 'num', value: 100 } },
]).setRanges(rule.ranges).build();
sheet.setConditionalFormattingRule(rule.cfId, { ...replacement, cfId: rule.cfId });
```

Only column B reverses. The data and three-colour rule remain unchanged.

### 2. Hide the values under the solid bars

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('bars');
const rule = sheet.getConditionalFormattingRules().find(rule => rule.ranges[0].startColumn === 1);
const replacement = sheet.newConditionalFormattingRule().setDataBar({
  min: { type: 'num', value: -100 }, max: { type: 'num', value: 100 },
  positiveColor: '#277D80', nativeColor: '#BD546E', isGradient: false, isShowValue: false,
}).setRanges(rule.ranges).build();
sheet.setConditionalFormattingRule(rule.cfId, { ...replacement, cfId: rule.cfId });
console.log(sheet.getRange('B5:B10').getValues());
```

Only the display changes. The stored numbers and gradient comparison remain intact.

### 3. Reveal values beside the icon-only column

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('icons');
const rule = sheet.getConditionalFormattingRules().find(rule => rule.ranges[0].startColumn === 2);
const replacement = sheet.newConditionalFormattingRule().setIconSet({ iconConfigs: rule.rule.config, isShowValue: true }).setRanges(rule.ranges).build();
sheet.setConditionalFormattingRule(rule.cfId, { ...replacement, cfId: rule.cfId });
```

Column C now shows its original scores without changing threshold membership.

### 4. Cross both icon boundaries

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('icons');
sheet.getRange('B6').setValue(50);
sheet.getRange('B8').setValue(80);
```

The original 49 and 79 scores move into the next category. Their independent comparison values in column C stay unchanged.

## Scope

The factory includes complete English core and conditional-formatting packs, official CSS and the native Grid ribbon. Preview and export share the factory. No backend, external images or SDK modifications are needed.

This case uses fixed numeric endpoints and thresholds. Percentile/percentage scaling, custom icon assets, automatic bounds, rule priority and interaction with highlight rules are outside its scope. Hiding a number is presentation, not removal. Native rule editing may introduce the editor's default style choices; inspect its preview before submitting.

On the installed SDK, undoing the first native value edit restores its number and visual, but retains a generated font-style entry in the workbook style table. The focused test keeps that raw-snapshot mismatch as a strict failure rather than normalizing it away. Redo is checked separately.
