# Financial Cash Flow Formulas

Ten native formula comparisons share three editable inputs: principal B5, annual interest B6, and monthly periods B7. This synthetic loan has no fees, taxes or irregular dates. It illustrates SDK calculation behavior, not a lending quotation.

- PMT compares payments at the end and start of each month.
- IPMT + PPMT reconstructs the payment; E9 should be zero within floating-point precision.
- FV reports the signed remaining balance after twelve payments.
- PV, NPER and RATE recover principal, period count and annual rate from the payment.
- A separate zero-rate PMT illustrates repayment without interest.

Cash received is positive and cash paid is negative. Monthly functions use annual rate / 12, and RATE is multiplied by 12 for comparison. Number formatting rounds presentation only; formulas keep full precision.

## Try the native editor

Change B5 from 12000 to 18000: cash amounts scale by 1.5, while the recovered period count and annual rate stay at 24 and 6%. Change B6 to 0: both timing variants become -500 on the original 12000 principal and interest becomes zero. Reload before independent comparisons.

## Public Facade recipe

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
sheet.getRange('B5').setValue(18000)
```

After recalculation, E11 (PV) is 18000, E12 (NPER) is 24 and E14 (zero-rate PMT) is -750. Select a result to inspect its formula; do not replace its formula with a calculated JavaScript value.

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
sheet.getRange('B5').setValue(12000)
sheet.getRange('B6').setValue(0)
```

After recalculation, E5 and E6 are -500, E7 is zero and E8 is -500. Native edits and Facade writes use the same calculation engine. Preview and exported source share the factory, official CSS and full English core locale.
