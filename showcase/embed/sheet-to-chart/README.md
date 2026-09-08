# Tide / Channel comparison

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

An original fictional community programme tracks three acquisition channels. Two distinct workbooks demonstrate the full chain: source inputs -> host external-reference formulas -> native column chart. The visible `A4:C7` source range belongs to the host; application code never rebuilds chart series after an input edit.

Actual confirmations start at **120 / 180 / 90**, totaling **390**. The separate plan is **140 / 160 / 100**, totaling **400**. These are illustrative RSVPs, not attendance, conversions or real personal records. The chart preserves native identity, configuration and source mapping when values change.

## Seven literal examples

Run these exact snippets with the demo's `univerAPI`, in order. The explicit workbook IDs matter: host and source are different Sheets instances. Native Float activation, keyboard focus and printing are separate acceptance gates, not implied by a working Facade mutation.

### 1. Change actual confirmations only

Partners actual becomes 210; actual total is 420. Plan values and total remain unchanged. Only the teal Partners column should change relative to the other categories; the native axis may rescale.

```ts
univerAPI.getWorkbook('tide-channel-source').getSheetBySheetId('channels').getRange('B6').setValue(210)
```

### 2. Revise the plan independently

Partners plan becomes 230; plan total is 470. Actual remains 120 / 210 / 90. Only the gold Partners series value changes; rescaling can change the apparent height of other bars.

```ts
univerAPI.getWorkbook('tide-channel-source').getSheetBySheetId('channels').getRange('C6').setValue(230)
```

### 3. A genuine zero category

Community actual becomes zero. Actual total is 300; all three category labels and all plan values remain. A zero value is not a missing category.

```ts
univerAPI.getWorkbook('tide-channel-source').getSheetBySheetId('channels').getRange('B5').setValue(0)
```

### 4. All actual values are zero

Actual total is zero; the gold plan series remains 140 / 230 / 100. The host's separate Actual share column exposes native #DIV/0! results. Those share cells are deliberately outside the chart's A4:C7 range; chart values remain valid zeros.

```ts
univerAPI.getWorkbook('tide-channel-source').getSheetBySheetId('channels').getRange('B5:B7').setValues([[0], [0], [0]])
```

### 5. Recover both series

Restore all six source inputs. The existing chart should show its original values without replacement, a manual refresh button or a JavaScript chart-array update.

```ts
univerAPI.getWorkbook('tide-channel-source').getSheetBySheetId('channels').getRange('B5:C7').setValues([[120, 140], [180, 160], [90, 100]])
```

### 6. Inspect the chart and visible calculated range

```ts
const sheet = univerAPI.getWorkbook('tide-channel-comparison').getSheetBySheetId('comparison')
const chart = sheet.getCharts()[0]
console.log({ chartId: chart.getId(), chart: chart.getInfo(), sourceRange: sheet.getRange('A4:C7').getValues() })
```

### 7. Export the native chart image

```ts
(async () => {
  const chart = univerAPI.getWorkbook('tide-channel-comparison').getSheetBySheetId('comparison').getCharts()[0]
  const png = await chart.exportImage({ format: 'png' })
  if (!png?.startsWith('data:image/png')) throw new Error('Native chart PNG is unavailable')
  const link = document.createElement('a')
  link.href = png
  link.download = 'tide-channel-comparison.png'
  link.click()
})()
```

This uses the native chart renderer, not a screenshot of the surrounding application. It is not XLSX/PDF conversion or an Exchange import/export claim.

## Presentation and acceptance

The saved Gamma Budget Review informs the ink/ochre contrast. Original teal Actual and gold Plan series sit in an official white SDK workbench. No competitor artwork, fixture controls, duplicate ribbon buttons or iframe source substitute is exported. The Grid ribbon uses its real matching feature plugins. Required SDK CSS is imported by the shared factory used in both Preview and standalone source. Native license notices remain visible.

**Partial evidence, not a completed demo.** All seven literal examples pass selected independent-production and EN/ZH guide checks. Tests compare the actual native canvas bar heights with all six source values, verify independent series and zero/recovery, preserve chart configuration/mapping/geometry, and check all three native share errors. Native PNG export produces a 1240 x 700 image (75,985 bytes in the selected baseline run), not an application screenshot. Theme switching preserves the same API owner, both workbook snapshots and chart configuration. Selected active-source fullscreen disposal passes with no observed browser errors or backend requests.

Image export requires the explicit `@univerjs-pro/chart-ui/facade` import in the shared factory. The initial build's preset-only import did not expose `exportImage` on the live chart. Adding the direct dependency/import fixes the selected runtime; no SDK package was patched. An incremental standalone install produced a broken chart-ui junction, so the accepted build uses a fresh 218-package offline installation from the actual exporter. Eleven-file source/CSS parity and official white SDK styles pass.

Native source keyboard/history, Print, unavailable/invalid/blank sources, resource-preserving reload/rebind, every menu, narrow/touch layouts and performance remain separate gates. The selected 1923-module build has an 18,277.85 kB entry (4,531.33 kB gzip) and 128.30 kB CSS (19.56 kB gzip). Cold selected Next guide/playground requests took 93s/31.8s and emitted a Gzip listener warning; this is not performance acceptance.
