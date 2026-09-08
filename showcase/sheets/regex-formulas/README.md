# Regex Formulas

Inputs and patterns are editable native cells. The engine calculates every result; no regex processing happens in the host page.

The authored string cells explicitly use `CellValueType.STRING`, so the formula engine reads their complete input and pattern text.

- **D5:D6:** REGEXTEST validates the entire identifier because the pattern is anchored. PK-2048 matches; PK-20 does not.
- **D7:D9:** REGEXEXTRACT returns the first matched code, #N/A for no match, or #REF! for the deliberately invalid pattern. IFNA and IFERROR illustrate distinct recovery paths.
- **D10:D12:** REGEXREPLACE normalizes repeated separators, redacts every digit, or preserves an unmatched input. E10:E12 report the resulting text lengths.

Initial replacements are `studio west wing`, `Call ###-####, ext ##` and `No digits here`. The guarded missing result is `No code found`; the guarded invalid pattern is `Check pattern`.

## Native edits

Enter PK-7310 in B6: D6 becomes TRUE and E6 becomes Valid code. Enter Order PK-7310 in B8: D8 and E8 both become PK-7310. Set C9 to PK-[0-9]{4}: the raw error and recovery text both become PK-2048.

## Public Facade recipe

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
sheet.getRange('B8').setValue('Order PK-7310')
sheet.getRange('C9').setValue('PK-[0-9]{4}')
sheet.getRange('D8').activate()
```

Calculation is asynchronous. D8 becomes PK-7310, D9 becomes PK-2048, and their formulas remain unchanged.

The installed engine registers REGEXTEST as a REGEXMATCH alias. This example uses its supported two-argument test/extract and three-argument replace signatures; it does not claim optional Excel regex flags or return-mode parity. Patterns use the installed engine's regex implementation, not a security validator for untrusted input.

Preview and standalone source share the factory, complete English core preset locale, official CSS and Grid ribbon.
