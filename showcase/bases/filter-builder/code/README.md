# Partner opportunities — native typed filters

Only the native Base workbench is mounted: no fixture selector, duplicated budget input, Inspect/Reset controls or audit panel. The original ten-company pipeline retains distinct company, region, budget, stage and owner values, including zero, null and empty-string boundaries.

Preview and standalone use the same factory, four official SDK stylesheets and all five English locale packs. The runtime is always English; theme toggles preserve the current owner and edits. Native trial UI is retained. No backend or external assets are required.

## Twelve executable Facade examples

Run each block in order in the loaded demo's console. The native Filter toolbar is the primary editing surface. These literal snippets demonstrate integration variants without recreating the native UI.

### 1. Inspect source versus projection

A filter changes visible rows, not source record ownership.

```ts
const api = window.univerAPI
const table = api.getBase('filter-builder-base').getTableById('records')
const view = table.getViewById('working')
console.log(view.getFilter(), view.getProjection(), table.getRecords().map(record => record.getValues()))
```

### 2. EMEA AND budget ≥ 100,000

Aster, Ember and Ion match. The source retains all ten records.

```ts
const api = window.univerAPI
const table = api.getBase('filter-builder-base').getTableById('records')
const view = table.getViewById('working')
view.setFilter({ conjunction: api.Enum.BaseFilterConjunction.AND, conditions: [
  { fieldId: 'region', operator: api.Enum.BaseFilterOperator.IS, operand: 'EMEA' },
  { fieldId: 'budget', operator: api.Enum.BaseFilterOperator.GREATER_THAN_OR_EQUAL, operand: 100000 },
] })
```

### 3. Qualify a previously excluded opportunity

Fjord's real budget changes from 90,000 to 140,000 and enters the preceding filtered view.

```ts
const api = window.univerAPI
const table = api.getBase('filter-builder-base').getTableById('records')
const view = table.getViewById('working')
table.getRecordById('r06').setValue('budget', 140000)
```

### 4. APAC OR a large budget

Bluefin, Dune, Grove and Juniper match. OR is a Facade variant; the current native panel is AND-only.

```ts
const api = window.univerAPI
const table = api.getBase('filter-builder-base').getTableById('records')
const view = table.getViewById('working')
view.setFilter({ conjunction: api.Enum.BaseFilterConjunction.OR, conditions: [
  { fieldId: 'region', operator: api.Enum.BaseFilterOperator.IS, operand: 'APAC' },
  { fieldId: 'budget', operator: api.Enum.BaseFilterOperator.GREATER_THAN_OR_EQUAL, operand: 200000 },
] })
```

### 5. Missing owners

Both Cedar's null and Fjord's empty string are blank. Neither becomes a missing record.

```ts
const api = window.univerAPI
const table = api.getBase('filter-builder-base').getTableById('records')
const view = table.getViewById('working')
view.setFilter({ conjunction: api.Enum.BaseFilterConjunction.AND, conditions: [
  { fieldId: 'owner', operator: api.Enum.BaseFilterOperator.IS_EMPTY },
] })
```

### 6. Case-insensitive company text

The lowercase operand labs matches Bluefin Labs.

```ts
const api = window.univerAPI
const table = api.getBase('filter-builder-base').getTableById('records')
const view = table.getViewById('working')
view.setFilter({ conjunction: api.Enum.BaseFilterConjunction.AND, conditions: [
  { fieldId: 'company', operator: api.Enum.BaseFilterOperator.CONTAINS, operand: 'labs' },
] })
```

### 7. No matches

An empty projection is not an empty Base. All ten source records remain editable after clearing the filter.

```ts
const api = window.univerAPI
const table = api.getBase('filter-builder-base').getTableById('records')
const view = table.getViewById('working')
view.setFilter({ conjunction: api.Enum.BaseFilterConjunction.AND, conditions: [
  { fieldId: 'budget', operator: api.Enum.BaseFilterOperator.GREATER_THAN, operand: 1000000000 },
] })
```

### 8. A custom numeric threshold

Use a finite non-negative threshold. Zero is meaningful and is not a blank budget.

```ts
const api = window.univerAPI
const table = api.getBase('filter-builder-base').getTableById('records')
const view = table.getViewById('working')
const raw = '150000'
const minimum = Number(raw)
if (!raw.trim() || !Number.isFinite(minimum) || minimum < 0) throw new Error('Enter a finite non-negative budget.')
view.setFilter({ conjunction: api.Enum.BaseFilterConjunction.AND, conditions: [
  { fieldId: 'budget', operator: api.Enum.BaseFilterOperator.GREATER_THAN_OR_EQUAL, operand: minimum },
] })
```

### 9. Reject blank and negative host inputs

This explicitly validates host input before any SDK write. It is not a fabricated SDK error.

```ts
const api = window.univerAPI
const table = api.getBase('filter-builder-base').getTableById('records')
const view = table.getViewById('working')
for (const raw of ['', '-1', 'not a number']) {
  const before = JSON.stringify(view.getFilter())
  const value = Number(raw)
  if (!raw.trim() || !Number.isFinite(value) || value < 0) console.log('Rejected host input', raw)
  else throw new Error('Expected invalid input')
  if (JSON.stringify(view.getFilter()) !== before) throw new Error('A rejected input changed the filter')
}
```

### 10. Clear conditions

This restores all ten visible opportunities without resetting edits.

```ts
const api = window.univerAPI
const table = api.getBase('filter-builder-base').getTableById('records')
const view = table.getViewById('working')
view.setFilter(null)
```

### 11. Local history

Native toolbar/keyboard history and these public APIs share the real command history. Restoration starts a fresh history.

```ts
await window.univerAPI.undo()
await window.univerAPI.redo()
```

### 12. Download the edited Base

A local JSON download preserves fields, records and view settings; it is not spreadsheet/PDF conversion.

```ts
const data = window.univerAPI.getBase('filter-builder-base').save()
const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'partner-opportunities.base.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 0)
```

## Real destruction and reconstruction

In an application entry, retain the imported createDemo, mount container, and a replaceable `let demo = createDemo(container)`. After `await demo.ready`, run the following. All serialized fields are compared without normalization; reconstruction does not retain Undo stacks or pointer focus. Reset instead passes the original imported `DATA` to the same factory after disposal. There is no host Reset button.

```js
const saved = JSON.parse(JSON.stringify(demo.univerAPI.getBase('filter-builder-base').save()))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
await demo.ready
```

## Native panel boundaries

The installed SDK's native panel builds flat AND conditions; the Facade also accepts flat OR and greater-than-or-equal conditions. Nested condition groups are not demonstrated. Native panel editing must be checked against the actual saved filter, especially when opening a Facade-authored configuration. Do not claim a condition is preserved merely because its label appears. Registered examples and a visible toolbar are not full acceptance; strict runtime results are recorded separately.

On SDK `1.0.0-beta.2`, the selected native check remains **strict FAIL** for preservation of a Facade-authored OR/greater-than-or-equal filter. Merely opening the panel leaves the complete model unchanged. Editing its numeric operand from 200,000 to 210,000 changes the actual saved conjunction from `or` to `and` and the budget operator from `greaterThanOrEqual` to `is`. Thus APAC OR a large budget becomes APAC AND exactly 210,000. This is recorded with before/after complete snapshots and native panel screenshots, not corrected in the demo.

Passing checks cover all twelve literal examples, exact visible record IDs and current canvas membership (including no matches), real native text and numeric filters, native condition deletion with toolbar Undo/Redo, actual budget cell typing with keyboard Undo/Redo, local JSON download parity, complete EN/ZH packs, same-owner theme changes, edited-owner destruction/reconstruction and fresh edits afterwards. The original ten source records remain intact. Toolbar history is tested for filter configuration; keyboard history is tested with the grid focused after an actual cell edit. These are scoped checks, not a claim that every operator or keyboard focus context is accepted.

## Maintainer checks

Full menu/operator matrices, accessibility, browser/touch coverage, pending-operation disposal and performance are separate acceptance work. The factory waits for the SDK Rendered lifecycle without its own startup timeout; the runtime test enforces a 60-second readiness deadline. Timeout/retry UX remains future integration work. SDK failures remain failures; no SDK modifications or snapshot normalization are used.
