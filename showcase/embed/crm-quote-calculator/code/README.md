# Northstar / CRM quote calculator

A fictional Orbit CRM opportunity pairs a six-field quote draft with the real
native Sheets Grid workbench. Only two host actions remain: **Apply host inputs**
and **Read sheet into form**. Editing, selection and history belong to the native
workbench; there are no fixture, reset, inspection or feature-description panels.

The default Business quote has 48 seats at USD 32/month, a 12% subscription
discount, 18 migration hours at USD 145 and 12 workflow-design hours at USD 165.
Annual subscription is **16,220.16**; first-year contract is **20,810.16**.
All figures and FX proposals are fictional, not live prices or financial advice.

## Host workflow

Apply validates every field before writing: supported product/currency, integer
seats 0–1,000,000, USD price 0–1,000,000 (two decimal places), discount 0–100%
(two decimal places), and positive FX 0.000001–1,000,000. It calls setValues on
A4:D4 and F4:G4, then setNumberFormat on E4:E11. These are separate native
commands, not an atomic transaction or one Undo step. Product is a label: changing
it does not silently select a price. A native input is not constrained by the
host's HTML validation; invalid source data may therefore produce a real error.

The CRM displays E4/E11 using getDisplayValue after SDK calculation, never its
own arithmetic. CommandExecuted schedules a read for format-only edits even
when no calculation is needed. calculationEnd also handles NOT_EXECUTED passes.
While calculating, outputs show Calculating rather than
a stale successful amount. A source formula error remains visible.

Native edits change the live totals without overwriting an unapplied form draft.
Read sheet into form uses getRawValues and converts the discount to a percentage
for the host input; it never writes cells. Both buttons disable when their action
would be redundant. Bindings use stable workbook/sheet IDs, not the active tab.
Renaming or switching worksheets must not retarget the quote.

Currency changes in the form propose editable USD/EUR/JPY rates. Apply commits
that draft. All source prices stay in USD; G4 converts subscription and service
amounts. Editing the F4 currency label alone does not reformat results.

## Literal examples

Run each exact snippet in order in the preview iframe or independent export.
The same inputs can be edited in the native grid. These examples explain business
variations without adding more host buttons.

### 1. Inspect the actual source and formulas

A read-only inspection. It does not create an on-screen JSON panel.

```ts
const quote = window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
console.log({
  inputs: quote.getRange('A4:G4').getRawValues(),
  subscriptionFormula: quote.getRange('E4').getFormulas(),
  contractFormula: quote.getRange('E11').getFormulas(),
  subscription: quote.getRange('E4').getDisplayValue(),
  contract: quote.getRange('E11').getDisplayValue(),
})
```

### 2. Enterprise pricing / Keep implementation and currency unchanged

Subscription becomes 19,837.44 and contract 24,427.44. The host draft stays intact
until Read sheet into form is chosen.

```ts
window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
  .getRange('A4:D4').setValues([['Enterprise', 72, 28, 0.18]])
```

### 3. More migration work / Keep the subscription unchanged

Migration rises from 18 to 24 hours; contract becomes 25,297.44.

```ts
window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
  .getRange('B8').setValue(24)
```

### 4. EUR quote / Apply an illustrative conversion and native formatting

Subscription displays €18,250.44; contract €23,273.64. Raw results retain the
unrounded calculation. Source prices are still USD.

```ts
const quote = window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
quote.getRange('F4:G4').setValues([['EUR', 0.92]])
quote.getRange('E4:E11').setNumberFormat('€#,##0.00')
```

### 5. Product label / No hidden repricing

The label changes; both calculated totals stay unchanged and the host must not
remain stuck in a calculating state.

```ts
window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
  .getRange('A4').setValue('Starter')
```

### 6. Zero seats / Services remain payable

Subscription becomes zero; contract is €5,023.20.

```ts
window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
  .getRange('B4').setValue(0)
```

### 7. No billable items / Preserve the calculation template

Both totals become zero; the service lines and all four formulas remain.

```ts
const quote = window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
quote.getRange('B8:B9').setValues([[0], [0]])
```

### 8. Full subscription discount / JPY boundary

100,000 seats at USD 0.01 have a 100% subscription discount. Restore the original
service hours: subscription is zero, but the contract still displays ¥688,500.

```ts
const quote = window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
quote.getRange('A4:D4').setValues([['Business', 100000, 0.01, 1]])
quote.getRange('B8:B9').setValues([[18], [12]])
quote.getRange('F4:G4').setValues([['JPY', 150]])
quote.getRange('E4:E11').setNumberFormat('¥#,##0')
```

### 9. Invalid native input / Expose the SDK error

Text in B4 is not a quantity. Both calculated totals must expose the native error,
not the previous ¥688,500 or a fabricated zero.

```ts
window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
  .getRange('B4').setValue('not-a-quantity')
```

### 10. Recover source values / Preserve the current workbook

Restore the baseline 16,220.16 and 20,810.16 without recreating the owner or
discarding unrelated cell edits.

```ts
const quote = window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
quote.getRange('A4:D4').setValues([['Business', 48, 32, 0.12]])
quote.getRange('B8:B9').setValues([[18], [12]])
quote.getRange('F4:G4').setValues([['USD', 1]])
quote.getRange('E4:E11').setNumberFormat('$#,##0.00')
```

### 11. Display precision / Keep raw formula values

The CRM and native grid display $16,220.160 and $20,810.160.

```ts
window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
  .getRange('E4:E11').setNumberFormat('$#,##0.000')
```

### 12. Restore standard currency display

```ts
window.univerAPI.getWorkbook('embedded-quote-calculator').getSheetBySheetId('quote')
  .getRange('E4:E11').setNumberFormat('$#,##0.00')
```

### 13. Download a complete native JSON snapshot

This is a local browser download, not XLSX export, Exchange or durable storage.

```ts
const snapshot = window.univerAPI.getWorkbook('embedded-quote-calculator').save()
const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'northstar-quote.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 1000)
```

### 14. Reconstruct the source with its original identity

Preserve the full native snapshot, including formulas, styles and resources.
The existing CRM resolves the new same-ID workbook; subsequent changes must
still reach the totals. The host draft is retained, but Undo history is not
serialized. This demonstrates same-session reconstruction, not durable storage.

```ts
const api = window.univerAPI
const snapshot = api.getWorkbook('embedded-quote-calculator').save()
api.disposeUnit(snapshot.id)
api.createWorkbook(snapshot)
```

## Styling, languages and ownership

Preview and export call the same createDemo factory. Keep the complete official
@univerjs/preset-sheets-core/lib/index.css import and both official EN/ZH preset
locale packs. The initial editor language follows the page's zh-CN language,
otherwise English; original business content and host labels remain English.
Grid, formula bar and sheet tabs are visible. Core-only registration does not
imply that every optional Sheets plugin, Print or Exchange is available.

Host styling is scoped to the CRM sidebar, using Deep Ocean navy, blue and teal.
Dark appearance follows the actual native workbench class, not a separate theme
store or overrides to SDK buttons. Preview calls toggleDarkMode on the existing
owner, preserving the workbook, selection and unapplied draft.

Disposal removes listeners and the owned root; it clears window.univerAPI only
when it still owns that reference. There are no backend requests, collaboration
plugins or custom history controls.

## Acceptance

The selected standalone check is scripts/test-crm-quote-native.mjs; current
evidence is test-results/crm-quote-native-verified/report.json. All fourteen
literal examples, actual native cell editing and current canvas values, two host
actions, invalid-input preservation, same-ID full snapshot reconstruction/JSON
download, source-tab isolation, missing-source recovery, complete EN/ZH packs,
same-owner themes/drafts and 760/390/320px host actions have selected evidence.

Strict native Undo remains a failure: the value and displayed total return, but
B4 gains t: 2 in the complete snapshot. Redo exactly matches the edited snapshot.
No type-field normalization changes that result. The initial report retained a
real format-only host-readback bug, now addressed by CommandExecuted, plus two
test errors: fieldset isDisabled did not inspect its disabled property, and the
mobile assertion expected Enterprise pricing despite the intentionally preserved
Business draft. Both old screenshots/reports remain in test-results/crm-quote-native.

A route or source scan is not full acceptance. Complete Next guide/React remount,
every native editor action, in-flight lifecycle, touch/accessibility and delivery
performance remain broader acceptance work. Native Undo is tested for data
integrity, not presented as a separate history or collaboration demonstration.
