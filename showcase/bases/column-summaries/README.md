# Column Summaries

Six original studio-ledger records use the native grid summary bar. Click a column's summary to select a supported statistic or None. View settings are independent; records are shared. No host code calculates or draws summary values.

## Initial comparisons

- Totals and maximum: 6 records, 2 unique studios, amount sum 300, maximum units 3, and 3 empty receipt notes.
- Average and minimum: amount average 60, minimum units 0, and 3 filled receipt notes.
- Filled and unique: 4 unique amounts, 5 filled unit values and 2 unique receipt notes.
- Grouped records, overall totals: the same 6 records grouped by studio, with amount sum 300 and units sum 8. This is an overall summary, not authored subtotal rows.

Amount values are 120, -20, 0, null, 80 and 120. Zero contributes to the five numeric observations; null does not. Numeric minimum is -20 and maximum is 120. Native Count records includes all six records, while Filled is five and Empty is one. Unique excludes empty values and counts the repeated 120 once. Receipt notes include null, an empty string and a whitespace-only string, all empty for statistics.

In the installed UI, an empty numeric cell can display as 0.00 even though its stored value is null. The Pending quote amount and Materials recharge units demonstrate this display limitation: their empty values remain excluded from numeric averages and Filled counts.

Change the zero amount to 40 in the native grid: sum becomes 340 and average 68. Select the North studio using the native filter: its three records sum to 180 with average 60. Clearing the filter restores the overall result. Changing grouping is not itself a filter.

## Public record edit

```ts
const table = window.univerAPI.getActiveBase().getTableById('ledger')
const changed = table.getRecordById('entry-3').setValue('amount', 40)
if (!changed) throw new Error('The record update was rejected')
```

## Public summary configuration

On the Totals and maximum view, switch only the amount statistic to average while retaining the other column choices.

```ts
const table = window.univerAPI.getActiveBase().getTableById('ledger')
const view = table.getViewById('totals')
const config = view.getConfig()
const stats = 'fieldStats' in config && typeof config.fieldStats === 'object'
  ? config.fieldStats
  : {}
const changed = view.updateConfig({
  fieldStats: { ...stats, amount: 'average' },
})
if (!changed) throw new Error('The summary configuration was unchanged')
```

After the preceding record edit, average is 68; on fresh data it is 60. Statistics are persisted in each view's fieldStats configuration and rendered by the official Bases UI plugin. Available choices depend on field type; this sample does not imply all statistics are valid for every field.
