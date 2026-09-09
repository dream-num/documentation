# Linked Record Calculations

Two tables combine native RecordLink selection with Formula fields. Storage lookup uses XLOOKUP against the source Record ID column. Additional cost splits multiple linked IDs, looks up each cost, and sums the results. There are no separate Lookup or Rollup field types in this sample, and no host-calculated results.

## Initial results

The request rows Dawn, Pond, Night, Canopy, Volunteer and Stream have additional costs 25, 60, 0, 15, 0 and 50. Their storage lookups are North cupboard, Drawer 3, South cupboard, Blue case, empty and Equipment rack. Two equipment records share the Field recorder name but have different IDs, models and locations; lookup uses identity, not display text.

Use the native association picker to change Primary equipment or Additional equipment. In Equipment, change the Light meter cost from 35 to 50: Pond becomes 75 and Stream becomes 65, while other totals stay unchanged. Return to Requests to inspect the dependent values. Blank primary links return empty text; blank multiple links return zero via the explicit IF guard.

## Update source data

```ts
const base = window.univerAPI.getActiveBase()
const meter = base.getTableById('equipment').getRecordById('meter')
if (!meter.setValue('cost', 50)) throw new Error('Source update was rejected')
```

## Change linked identities

```ts
const base = window.univerAPI.getActiveBase()
const request = base.getTableById('requests').getRecordById('training')
request.setLinkedRecordIds('primary', ['recorder-south'])
request.setLinkedRecordIds('extras', ['lens', 'tripod'])
```

Volunteer training now looks up South cupboard and totals 40. Both values are native formula results. In the installed SDK, pressing Delete on selected association cells does not clear their links. Use the public Facade recipe below to clear both links and restore empty storage and zero cost:

```ts
const base = window.univerAPI.getActiveBase()
const request = base.getTableById('requests').getRecordById('training')
request.setLinkedRecordIds('primary', [])
request.setLinkedRecordIds('extras', [])
```

Read the result after asynchronous dependency recalculation:

```ts
const request = window.univerAPI.getActiveBase()
  .getTableById('requests').getRecordById('training')
console.log(request.getValue('storage'), request.getValue('total'))
```

These are same-Base cross-table formulas, not remote data loading or cross-file references. Preview and exported source share the factory, complete English locale packs and official CSS. Native formula fields remain calculated rather than manually edited.
