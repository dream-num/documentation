# Value and condition filters

Six native worksheets compare twelve original records. Filtering hides rows; it
does not delete or sort the source. Each sheet is an independent copy. English
runtime, full Core/Filter English packs and official CSS are shared by Preview
and export. Theme changes retain the owner; browser reload starts again.

Use the native header filter popups to change the initial criteria. There are no
host controls duplicating the SDK. R07/R11 have empty Units; R01/R12 contain zero.
The text condition `kit*` is a wildcard, whereas a value list containing
`kit*` selects the literal stored value in R05.

## Public Facade recipes

Run one block at a time after the demo is ready. These are API examples, not
claims of native pointer interaction.

Read the current visible record IDs without modifying source data:

```ts
const sheet = univerAPI.getWorkbook('filter-gallery').getSheetBySheetId('values')
const excluded = new Set(sheet.getFilter().getFilteredOutRows())
const visible = sheet.getRange('A5:A16').getValues()
  .filter((_, index) => !excluded.has(index + 4)).map(([id]) => id)
console.log(visible)
```

Change the Region value list:

```ts
univerAPI.getWorkbook('filter-gallery').getSheetBySheetId('values').getFilter()
  .setColumnFilterCriteria(1, { colId: 1, filters: { filters: ['West'] } })
```

Use a numeric inclusive AND band:

```ts
const operators = univerAPI.Enum.CustomFilterOperator
univerAPI.getWorkbook('filter-gallery').getSheetBySheetId('band').getFilter()
  .setColumnFilterCriteria(3, { colId: 3, customFilters: {
    and: 1,
    customFilters: [
      { operator: operators.GREATER_THAN_OR_EQUAL, val: 10 },
      { operator: operators.LESS_THAN_OR_EQUAL, val: 40 },
    ],
  } })
```

Compare a wildcard condition with an exact value list:

```ts
const filter = univerAPI.getWorkbook('filter-gallery').getSheetBySheetId('text').getFilter()
filter.setColumnFilterCriteria(2, { colId: 2, customFilters: { customFilters: [{ val: 'kit*' }] } })
// Run this next to retain only the literal "kit*" value:
filter.setColumnFilterCriteria(2, { colId: 2, filters: { filters: ['kit*'] } })
```

Include only blanks, not numeric zero:

```ts
univerAPI.getWorkbook('filter-gallery').getSheetBySheetId('blank').getFilter()
  .setColumnFilterCriteria(3, { colId: 3, filters: { blank: true, filters: [] } })
```

Clear all conditions without removing the filter arrows:

```ts
univerAPI.getWorkbook('filter-gallery').getSheetBySheetId('none').getFilter().removeFilterCriteria()
```

## Verification boundary

The feature comparison references MESCIUS's
[Custom Filters](https://developer.mescius.com/spreadjs/demos/features/filters/custom-filter/react)
and [Basic Filter](https://developer.mescius.com/spreadjs/demos/features/filters/basic-filter/vue3)
examples for capability scope only. Data, implementation and layout here are
original; no competitor code, assets or host radio controls are copied.
