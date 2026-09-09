# Ranking and Percentiles

Eight native statistical functions compare the same seven proposal scores: 42, 55, 68, 68, 74, 96 and 150. Amber cells are inputs; mint cells contain SDK formulas. The host does not calculate ranks or quantiles.

## Ranking

Ranking!C5:F11 compares RANK.EQ and RANK.AVG in descending and ascending order. Both 68 scores have descending EQ rank 4 and AVG rank 4.5; ascending EQ rank 3 and AVG rank 3.5. EQ leaves gaps after ties; it is not dense ranking.

I5 selects the score for PERCENTRANK.INC/EXC. At 68, I7/I8 return 0.333333 and 0.375. These functions use the first matching sorted position for a tie, not its average rank. The formulas explicitly request six decimal digits; fractional results can be truncated. The outside-range probe I10 starts at 151, so I11/I12 both show #N/A.

## Quantiles

Quantiles!A5:C12 compares PERCENTILE.INC and PERCENTILE.EXC, referencing Ranking's source cells directly.

| k | INC | EXC |
| --- | --- | --- |
| 0 | 42 | #NUM! |
| 0.125 | 51.75 | 42 |
| 0.25 | 61.5 | 55 |
| 0.5 | 68 | 68 |
| 0.75 | 85 | 96 |
| 0.875 | 109.5 | 150 |
| 1 | 150 | #NUM! |
| 0.1 | 49.8 | #NUM! |

F5:H9 compares QUARTILE.INC/EXC for quartiles 0 through 4. INC returns 42, 61.5, 68, 85 and 150; EXC returns #NUM!, 55, 68, 96 and #NUM!. With seven values, EXC percentile positions are valid from 1/8 through 7/8, not every number strictly between 0 and 1. The custom B15 input initially contains 0.9: C15 is 117.6 and D15 is #NUM!.

## Public recipes and native edits

Reload before each recipe and wait for initial calculation. The same inputs can be edited directly in the native grid. After each write, allow asynchronous recalculation before reading results with `getRawValue()`; compare decimals with a small tolerance.

### 1. Break one tie

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('ranking')
sheet.getRange('B7').setValue(70)
```

C7:F7 become 4, 4, 4, 4. The unchanged 68 in B8 now has ranks 5, 5, 3, 3. Quantiles!B7 becomes 61.5 while B8/C8 (the medians) become 70.

### 2. Interpolate a percent-rank

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('ranking')
sheet.getRange('I5').setValue(85)
```

I7/I8 become 0.75 and 0.6875: 85 lies halfway between 74 and 96. The proposal scores and their ranks are unchanged.

### 3. Recover a finite-sample boundary error

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('quantiles')
sheet.getRange('B15').setValue(0.875)
```

C15 becomes 109.5 and D15 recovers to 150. The comparison table and source scores remain unchanged.

### 4. Compare percent-rank endpoints

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('ranking')
sheet.getRange('I10').setValue(150)
```

I11/I12 recover to 1 and 0.875. INC assigns the maximum the endpoint 1; EXC keeps its percent-rank below 1.

### 5. Reduce the outlier

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('ranking')
sheet.getRange('B11').setValue(110)
```

Rank order and both tied ranks remain unchanged. Quantiles!B10/C10 change to 99.5/110, while the third quartiles remain 85/96. C15 becomes 101.6; D15 still reports the invalid exclusive percentile. The unchanged outside probe 151 remains #N/A.
