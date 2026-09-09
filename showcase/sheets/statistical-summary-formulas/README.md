# Statistical Summary Formulas

Six numeric readings (12, 14, 14, 18, 22, 100), a truly empty B11 and a text status in B12 feed native formulas. Inputs are amber; calculated results are blue. No summary is calculated by the host.

## Compare the initial results

- E5/E6: COUNT is 6; COUNTA is 7 because it includes pending.
- E7:E9: average 30, median 16 and mode 14. The outlier changes the mean much more than the middle values.
- E10/E11: sample standard deviation is approximately 34.47898; population standard deviation is approximately 31.47486.
- E12/E13: the inclusive 75th percentile and third quartile both equal 21.
- E14:E16: tied readings rank 4 and 4; the smaller reading ranks 6. This is descending competition ranking, not dense ranking.

Counts and ranks display as integers. Other results display two to four decimal places without rounding the stored calculation.

## Native edits

Change B10 from 100 to 24. Average becomes 17.33333, sample spread approximately 4.84424 and population spread approximately 4.42217. Median remains 16, mode remains 14 and the third quartile remains 21.

Fill B11 with 0. Both COUNT and COUNTA increase by one: zero is numeric, not empty. On a fresh sample, change pending in B12 to 16: COUNT becomes 7 while COUNTA remains 7.

## Public Facade recipe

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
sheet.getRange('B10').setValue(24)
sheet.getRange('E7').activate()
```

Native dependency calculation completes asynchronously; the original formulas remain in E5:E16.

The sample demonstrates the listed functions and range handling, not exhaustive statistical-distribution or inference parity. Numeric and text inputs have explicit SDK cell types. Preview and standalone share the same factory, complete English preset locale, official CSS and Grid ribbon.
