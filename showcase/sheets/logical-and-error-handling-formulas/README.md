# Logical Decisions and Error Handling

Two small workflows focus on deciding what should happen, not conditional aggregation or a catalogue of error codes. All results are native formulas, including intentional errors.

## Dispatch decisions

IF + AND requires positive units, payment and NOT hold. IF + OR flags an express request or unavailable stock. NOT exposes the hold inversion; XOR compares paid and express flags. With two inputs XOR means exactly one is true; OR also accepts both.

Rows 5:10 release decisions are Release, Wait, Wait, Wait, Release, Wait. Attention decisions are Routine followed by five Attention results. NOT hold is TRUE except row 7. XOR is TRUE in rows 5 and 8 only. B10 is genuinely blank, not zero or an empty-string formula; the explicit numeric comparisons treat it like zero here.

## Policy coverage

IFS evaluates thresholds in order: at least 80 gets Priority before the overlapping at-least-50 Standard branch. D deliberately has no default. SWITCH maps E to Express and S to Standard, with Unknown for other or missing codes.

| Row / score | Partial IFS | IFERROR | IFNA | Complete policy |
| --- | --- | --- | --- | --- |
| 5 / 85 | Priority | Priority | Priority | Priority |
| 6 / 60 | Standard | Standard | Standard | Standard |
| 7 / 0 | #N/A | Review | Unassigned | Basic |
| 8 / blank | #N/A | Review | Unassigned | Await score |
| 9 / pending | #VALUE! | Review | #VALUE! | #VALUE! |
| 10 / 100 | Priority | Priority | Priority | Priority |

Adding zero requires a numeric score, so the text pending produces an actual arithmetic error. IFNA handles only an unmatched #N/A decision, while IFERROR also masks malformed input. Neither repairs the source. H explicitly distinguishes missing scores from valid zero, then uses a final TRUE branch. This extends the generic Formula Errors and Recovery example with policy completeness and input semantics.

## Public Facade recipes

Run each independently on the initial workbook. The native name box and cell editor make the same changes. Wait for asynchronous recalculation before inspecting results.

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('dispatch')
sheet.getRange('D7').setValue(0)
// F7 changes Wait -> Release; H7 changes FALSE -> TRUE. I7 stays FALSE.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('routing')
sheet.getRange('B9').setValue(55)
// D9:F9 and H9 all become Standard; G9 remains Express.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('routing')
sheet.getRange('B8').setValue(0)
// H8 changes Await score -> Basic. D8 remains #N/A; E8 = Review; F8 = Unassigned.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('routing')
sheet.getRange('G7').setFormula('=SWITCH(C7,"E","Express","S","Standard")')
// Removing SWITCH's default exposes #N/A for the unknown X code.
```

The source factory supplies complete English preset locale, official CSS and Grid Ribbon. There are no JavaScript decisions, custom result panels or SDK patches.
