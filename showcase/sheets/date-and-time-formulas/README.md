# Date and Time Formulas

Two worksheets build dates and clock times from editable numeric components. DATE, TIME, YEAR, MONTH, DAY, HOUR, MINUTE, SECOND and EOMONTH all run in the native formula engine. This is calendar arithmetic, not the holiday/weekend scheduling covered by Working Day Formulas.

## Calendar components

| Row | DATE arguments | Result | EOMONTH + 0 |
| --- | --- | --- | --- |
| 5 | 2024, 2, 29 | 2024-02-29 | 2024-02-29 |
| 6 | 2025, 2, 29 | 2025-03-01 | 2025-03-31 |
| 7 | 2026, 13, 1 | 2027-01-01 | 2027-01-31 |
| 8 | 2026, 3, 0 | 2026-02-28 | 2026-02-28 |
| 9 | 2026, 4, 31 | 2026-05-01 | 2026-05-31 |
| 10 | 2026, 12, 31 | 2026-12-31 | 2026-12-31 |

F:H extract the normalized year, month and day. E13 displays E5 as the raw serial 45351; I13 uses EOMONTH(E5,1) to return 2024-03-31. No text parsing or host Date conversion is involved.

## Clock components

E5:E10 display 08:30:15, 12:00:00, 23:59:59, 01:00:00, 01:30:00 and 00:01:30. F contains the same numeric values with a six-decimal number format; noon equals 0.5. G:I extract the normalized clock components. TIME wraps 25 hours to 1 hour; it does not preserve a 25-hour elapsed duration.

E13 combines DATE(2026,9,9) with the first row's TIME, initially 2026-09-09 08:30:15. These serials have no timezone or daylight-saving interpretation. This fixed-data example does not use TODAY, NOW or the host clock.

## Public Facade recipes

Run each independently on the initial workbook. Native name-box navigation and cell editing make the same changes. Recalculation is asynchronous: wait for the displayed result before reading stored values with getCellDatas().

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('dates')
sheet.getRange('B5').setValue(2025)
// E5 = 2025-03-01; F5:H5 = 2025, 3, 1; I5 = 2025-03-31.
// E13 raw serial = 45717; I13 = 2025-04-30.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('times')
sheet.getRange('B5').setValue(9)
// E5 = 09:30:15; G5:I5 = 9, 30, 15.
// E13 = 2026-09-09 09:30:15; F5 equals 34215 / 86400.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('dates')
sheet.getRange('I13').setFormula('=EOMONTH(E5,-1)')
// Initial E5 = 2024-02-29: I13 becomes 2024-01-31.
```

The formula bar retains native DATE/TIME expressions. Number formats change only presentation; getValue() may return formatted text. Small floating-point differences are normal when representing fractions of a day. Preview and exported code use the same factory, complete English preset locale, official CSS and Grid Ribbon.
