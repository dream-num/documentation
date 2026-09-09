# Conditional Coloring

Three native Grid views share eight research shipments. Switch views in the sidebar and open **Conditional Coloring** to inspect the rules.

- **Row / risk bands:** risk greater than 80 colors the entire row coral; risk greater than 50 colors it amber. Critical comes first, so 81 and 92 use coral, while 51, 68 and 80 use amber. Exactly 50 and zero do not match.
- **Cell / risk bands:** the same comparisons color only the Risk score cells.
- **Column / destination:** every Destination cell is teal. COLUMN is unconditional: its stored operator and operand are ignored, even though “Not a route” matches no record.

Edit Seagrass seed trays from 34 to 85 to cross both thresholds. This changes the shared record, so both risk views reflect the edit; coloring does not alter the cargo, crate count or other fields.

## Public Facade recipes

Run these snippets in the preview console after initialization. Each snippet defines its own variables; execute it as a separate block.

### Reverse overlapping priority

The first matching rule has higher visual priority. Reversing the Cell rules makes scores above 80 amber too. The Row view keeps its original order.

```ts
const api = window.univerAPI
const table = api.getBase('cold-chain-colors').getTableById('shipments')
const view = table.getViewById('cells')
view.setConditionalColorRules([...view.getConditionalColorRules()].reverse())
await api.getBaseUI().activateView('cells')
```

### Recolor an entire column

COLUMN does not evaluate the condition; all eight destinations change color without editing their values.

```ts
const api = window.univerAPI
const view = api.getBase('cold-chain-colors').getTableById('shipments').getViewById('columns')
view.setConditionalColorRules([{
  id: 'route-column',
  fieldId: 'route',
  target: api.Enum.BaseConditionalColorTarget.COLUMN,
  operator: api.Enum.BaseConditionalColorOperator.IS,
  operand: 'Not a route',
  color: '#DDD9F0',
}])
await api.getBaseUI().activateView('columns')
```

### Filter without replacing coloring

Only North pier records remain: Kelp (92), Oyster (81) and Algae (80). Filtering changes the visible projection, not the records or coloring rules.

```ts
const api = window.univerAPI
const view = api.getBase('cold-chain-colors').getTableById('shipments').getViewById('rows')
view.setFilter({
  conjunction: api.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'route', operator: api.Enum.BaseFilterOperator.IS, operand: 'North pier' }],
})
await api.getBaseUI().activateView('rows')
```

### Clear the filter and cross a threshold

All eight records return. Seagrass becomes coral in the Row view. The Cell view follows its current rule order, including any earlier reversal.

```ts
const api = window.univerAPI
const table = api.getBase('cold-chain-colors').getTableById('shipments')
table.getViewById('rows').setFilter(null)
table.getRecordById('seagrass').setValue('risk', 85)
await api.getBaseUI().activateView('rows')
```

Reload to restore the original records, colors, rule order and filters. Rules are view-local; record values are shared.
