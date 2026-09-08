# Formula fields

Six original ceramic batches share one Relational Table. Three native Grid views expose the same calculated records: Numeric cost, Text and dates, and Empty and error. Edit Units, Rate, Hours or Due using the native cell editor; the installed formula engine owns calculated fields. No output values are prefilled or computed in host JavaScript.

The same-row syntax `[@[Units]]` selects that record's field. Batch cost multiplies units by rate; Batch label combines text and IF; Days after Mar 1 subtracts a fixed date; Quantity check distinguishes missing from zero; Units per hour exposes division by zero alongside an IFERROR alternative. The blank Test tiles sources are intentional. Authored date-only values use UTC-midnight inputs to `dateToExcelSerial()`, giving integer March 2028 serials independent of the browser timezone. They are not today's date or local appointment times.

The installed Number renderer displays a null Units cell as 0, but the public value remains null and Quantity check correctly returns Missing quantity. A true zero returns Not scheduled. This native display distinction is retained, not patched or replaced by host formatting.

Integer serials do not guarantee timezone-independent Date-field display. The published date configuration exposes pattern, includeTime and hourCycle, but no timezone override. In America/Los_Angeles, the installed native Date renderer shows the mug's serial 46815 as 2028-03-02 although the authored date is March 3 and the date formula still returns 2. The strict Los Angeles date-paint regression remains failing; no offset shim, display substitution or SDK patch masks it. UTC and Shanghai show March 3.

## 1. Read the formula and its current result

```ts
const table = univerAPI.getActiveBase().getTableById('batches')
console.log(table.getFieldById('cost').getConfig().formula)
console.log(table.getRecordById('mug').getValue('cost'))
```

Initially the expression is `=[@[Units]]*[@[Rate]]`; Speckled mugs calculates 96.

## 2. Edit a numeric source

```ts
univerAPI.getActiveBase().getTableById('batches').getRecordById('mug').setValue('units', 15)
```

Batch cost recalculates to 120 and Units per hour to 5. The other five records keep their source values.

## 3. Repair a zero divisor

```ts
univerAPI.getActiveBase().getTableById('batches').getRecordById('vase').setValue('hours', 2)
```

Both ratio fields become 2.5. The unguarded error and the IFERROR message disappear because the source is now valid.

## 4. Change a local formula field

```ts
const field = univerAPI.getActiveBase().getTableById('batches').getFieldById('cost')
field.setConfig({ ...field.getConfig(), formula: '=[@[Units]]*[@[Rate]]*1.1' }, { externalReferences: [] })
```

A 10% allowance applies to every batch. Formula writes explicitly declare an empty external-reference list because all references stay inside this Relational Table. This replaces a field formula, not cached output values.

## Scope and acceptance

The factory explicitly registers the installed Pro formula engine for in-browser calculation, with six complete English locale packs and four official CSS files. Relational Table owns its native toolbar and Grid view tabs. Preview and export share the independent factory. No workers, server, cross-file bindings, custom functions or host calculation panel are added.

Selected native tests verify all calculated results and visible numeric/text/date/error paint under English/UTC and Chinese/Shanghai hosts, with English editor UI in both. A real keyboard edit changes the mug quantity from 12 to 16 and repaints its cost as 128.00 while the other five records remain exact. Four literal recipes, complete saved models across theme changes, same-owner identity and teardown are checked separately. Writes trigger asynchronous recalculation; wait for the calculated result before reading it immediately after a write.

Formula editor syntax assistance, every spreadsheet function, volatile dates, dependency cycles, cross-browser behavior and formula-resource Undo fidelity are not certified by this gallery. Reload restores the authored data.
