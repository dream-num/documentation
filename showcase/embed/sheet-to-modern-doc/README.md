# Pollen / Campaign pulse

Current language contract: the native UI, startup alerts and authored data are English under either host language. The legacy third locale argument remains accepted but is ignored. Complete English dependency packs, official CSS, native Grid menus and the distinct source/document story are preserved. Earlier bilingual evidence below is historical; this migration does not resolve its recorded SDK limitations.

A modern document hosts a real Sheet DocBlock. Three fictional campaign channels
drive thirteen native inline formulas: total spend/revenue, their difference,
blended and per-channel attributed returns, visits/orders, conversion, an
independent learning target, gap and prompt. The target is not another data source.

The blended ratio is calculated from totals, not an unweighted average of channel
percentages. Attribution excludes other costs and is not net profit or evidence
of causation. Original prose remains editable; no JavaScript totals or narrative
regeneration is used. The fixed source range is Channels rows 5:7.

## Seventeen literal examples

Run these in order in the demo iframe or standalone console. To edit normally,
activate the native Sheet block and use Enter fullscreen. Return to the brief to
read the updated values. Use native Grid menus, not a separate fixture panel.

### 1. Increase Search spend

Total spend becomes $13,500; revenue stays $18,600. Blended return falls to about 37.8%, below the 50% learning target.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('B5').setValue(6300)
```

### 2. Revise Email revenue independently

Email revenue becomes $6,000, total revenue $19,320. Spend, visits and orders do not change.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('C6').setValue(6000)
```

### 3. Change the learning target

The target becomes 60%; only the target, gap and dependent prompt can change.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('G5').setValue(0.6)
```

### 4. Context is not arithmetic

No formula changes; narrative prose is authored, not regenerated from this note.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('F7').setValue('Compare two placements before another pilot.')
```

### 5. More recorded orders

Search orders become 120. Total orders become 286; conversion changes independently of attributed revenue.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('E5').setValue(120)
```

### 6. An unknown visit count

Email visits are blank, not measured zero. SUM ignores the missing value; the displayed ratio is based on only the remaining recorded visits.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('D6').clearContent()
```

### 7. A measured zero

The aggregate is unchanged, but D6 now contains a numeric zero.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('D6').setValue(0)
```

### 8. One channel has no spend

The Partners ratio has no denominator and must expose a native division error. Other channel results and the nonzero blended denominator remain meaningful.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('B7').setValue(0)
```

### 9. An invalid channel input

SUM ignores text in the source range, but the direct Partners arithmetic exposes a native value error. No fallback estimate replaces it.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('B7').setValue('pending')
```

### 10. Restore the measured inputs

Baseline numeric results return; the changed context note remains.

```ts
const sheet = window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels')
sheet.getRange('B5:E7').setValues([[4800,8640,2400,96],[2200,5280,1600,88],[5000,4680,3000,78]])
sheet.getRange('G5').setValue(0.5)
```

### 11. No campaign spend

Every return denominator is zero. Orders and visits remain intact; return, target gap and conditional prompt should propagate native errors.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('B5:B7').setValues([[0],[0],[0]])
```

### 12. Restore spend

The original spend and return measures recover without replacing the document.

```ts
window.univerAPI.getWorkbook('pollen-channel-source').getSheetBySheetId('channels').getRange('B5:B7').setValues([[4800],[2200],[5000]])
```

### 13. Rename and prove a fresh result

Keep the original workbook ID and explicitly retain its qualifier mapping. Search spend becomes $5,100, total spend $12,300.

```ts
const workbook = window.univerAPI.getWorkbook('pollen-channel-source')
workbook.setName('Pollen / Reviewed channels')
window.univerAPI.getFormula().upsertExternalReference({unitId:'pollen-campaign-brief',qualifier:'Pollen Channels',sourceUnitId:'pollen-channel-source',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET})
workbook.getSheetBySheetId('channels').getRange('B5').setValue(5100)
```

### 14. Unavailable binding

The real Sheet stays intact. Change the document's qualifier mapping; native error text must replace stale results.

```ts
window.univerAPI.getFormula().upsertExternalReference({unitId:'pollen-campaign-brief',qualifier:'Pollen Channels',sourceUnitId:'pollen-unavailable-source',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET})
```

### 15. Repair the original mapping

Reconnect the same Sheet; this is not yet a different-valid-source rebind example.

```ts
window.univerAPI.getFormula().upsertExternalReference({unitId:'pollen-campaign-brief',qualifier:'Pollen Channels',sourceUnitId:'pollen-channel-source',sourceUnitType:window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET})
```

### 16. A detached reading copy

This projects display text without modifying live bindings. It is not PDF/DOCX export.

```ts
console.log(window.univerAPI.getDocument('pollen-campaign-brief').saveFormulaDisplayTextSnapshot())
```

### 17. Inspect both native snapshots

The host contains an embed reference, not the complete source workbook. Saving to durable storage and reconstruction require both units and separate verification.

```ts
console.log({host:window.univerAPI.getDocument('pollen-campaign-brief').save(),sheet:window.univerAPI.getWorkbook('pollen-channel-source').save()})
```

## Integration and references

The cached Notion project-brief screenshot informs reading order and the clear
section hierarchy only. Navy, teal, amber and lavender follow the supplied Deep
Ocean palette. All prose, channel data and styling are original; no competitor
template artwork is redistributed.

Preview and standalone use the same factory and official CSS imports. Full English
dependency packs include Docs Formula, Shape Editor and Embed Unit labels. The
Sheet feature registrations follow the SDK local DocBlock example because its
native ribbon invokes those feature factories. There is no collaboration backend
or history-record panel. Print uses the registered native Sheet plugin; merely
registering it does not establish runtime acceptance. No import/export success is
claimed without Exchange verification.

## Acceptance status

Full persistence/reconstruction, another valid source, every native action,
Exchange conversion, all Print options, Next integration, accessibility/
responsiveness and delivery performance remain open.
