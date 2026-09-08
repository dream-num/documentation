# Native Sparkline Types

Three original workshop specimens compare six weekly observations in compact native worksheet cells. Line charts emphasize trajectory, column charts retain magnitude, and win-loss charts emphasize positive/negative sign rather than magnitude. Each of the six rows has its own group; cells B:G remain editable source data and H contains the SDK-rendered sparkline.

## Try the native UI

Edit B5 on each tab and compare H5 before and after. Right-click H5, open Sparkline, then Edit Sparkline to open the native settings sidebar. The gallery uses actual sparkline plugins, not host canvas drawings, images or conditional formatting. Pink win-loss marks represent negative values.

## Executable Facade recipes

### 1. Change an observation

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('line');
sheet.getRange('B5').setValue(30);
```

The first point of H5 changes while other rows remain independent.

### 2. Compare the same observations as columns

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('line');
window.univerAPI.getActiveWorkbook().setActiveSheet('line');
sheet.getRange('H5').activate();
sheet.getSparklineGroupByCell(4, 7).setConfig({ type: window.univerAPI.Enum.SparklineTypeEnum.BAR_CHART });
```

Only the first row changes type. The factory creates line sparklines through the published addSparkline signature and configures other types through the public group API.

In this installed runtime, group `setConfig()` acts through the current native selection. Select the matching sheet and target cell before calling it; do not assume the facade object alone makes the operation independent of selection.

### 3. Reverse the win-loss timeline

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('winloss');
window.univerAPI.getActiveWorkbook().setActiveSheet('winloss');
sheet.getRange('H5').activate();
sheet.getSparklineGroupByCell(4, 7).setConfig({ axis: { reverse: true, visible: true, color: '#64748B' } });
```

H5 reads right-to-left without changing the source values.

### 4. Compare a shorter observation window

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('column');
sheet.getSparklineByCell(4, 7).changeDataSource(sheet.getRange('D5:G5').getRange(), sheet.getRange('H5').getRange());
```

H5 now visualizes the last four weeks; its location and source cells remain unchanged.

## Scope

Complete English core/sparkline locale packs and official CSS accompany native Grid ribbon. Preview and export share this factory; initialization failures clean up the owned editor. No backend or SDK/dependency modifications are required. This gallery does not claim pie, hidden/empty-cell policies, grouping, date axes, or full SpreadJS parity merely because an enum or configuration field exists. Those require separate native acceptance.

These are Pro plugins: the SDK may display its license watermark when no license is configured; the demo does not suppress it. Strict native Undo currently retains an added numeric type and generated font-style entry in the saved workbook. The test preserves that difference rather than normalizing snapshots; edited-value repaint, Redo, theme ownership and save/recreate are separate checks.

The current runtime opens the Sparkline Settings sidebar but leaves its contents blank in the tested unlicensed configuration; native setting controls are therefore not accepted as working. The requested amber high-point setting is also not certified by pixel checks. Neither limitation is replaced with host controls or painted markers.

Capability reference: [SpreadJS sparkline settings](https://developer.mescius.com/spreadjs/demos/features/sparklines/sparkline-setting/). This gallery uses original Univer data and verifies only the native comparisons described above, not full benchmark parity.
