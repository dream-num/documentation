# Named Ranges and Formulas

Three workbook-scoped definitions use the public DefinedName Builder:

- TicketSales refers to Inputs!$B$5:$B$7.
- ServiceRate refers to Inputs!$B$10.
- NetRevenue is SUM(TicketSales)*(1-ServiceRate), a reusable named formula rather than a stored result.

On Summary, B5 uses an ordinary address and B6 uses TicketSales. Both initially equal 540. B7 is the service fee (54); B8 evaluates NetRevenue (486). On Inputs, change B5 from 120 to 220: Summary B5:B8 become 640, 640, 64 and 576. Change the rate in Inputs B10 to 0.2: the fee becomes 128 and net revenue becomes 512.

## Public Facade

```ts
const book = window.univerAPI.getActiveWorkbook()
const definition = book.newDefinedNameBuilder()
  .setName('EveningIncome')
  .setRef('Inputs!$B$7')
  .setScopeToWorkbook()
  .build()
book.insertDefinedNameBuilder(definition)
book.getSheetBySheetId('summary').getRange('B15').setValue('=EveningIncome')
```

B15 becomes 240 after calculation. Inspect a formula by selecting its cell. The names are real workbook definitions, not JavaScript variables. This example does not demonstrate worksheet-local name shadowing. Preview and export share one factory, official preset CSS, the complete English locale and the native Grid ribbon.
