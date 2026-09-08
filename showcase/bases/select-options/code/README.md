# Sable coastal observatory / Native select options

Run `pnpm install`, then `pnpm dev` or `pnpm build`. Only this selected example is built. Preview and standalone export use the same factory, five complete English dependency locale packs and four official SDK stylesheets. Keep native license notices intact.

The original coastal observatory retains 30 individually named survey tasks, 12 coastal projects and 18 sample handovers. Compare Priority single-select with Habitats multi-select through the native grid and field editor. Record IDs, labels, colors and option order are independent. The data includes blank choices, multiple habitats, notes, people, dates, local text attachments and linked sites. Fixed authored dates do not freeze the SDK clock.

No fixture selector, duplicate editing/history buttons, feature card, live audit panel or snapshot panel is mounted. Use native menus for editing. The following examples run literally against `window.univerAPI` in the standalone page or demo iframe; they are not additional UI buttons. Run them in order, with each block scoped separately. Reload the page to restore the original data. Theme switches preserve the current owner and edits.

## 1. Rename without changing stored IDs

High becomes Critical. Existing records continue storing high.

```ts
const field = window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getFieldById('priority')
const config = field.getConfig()
field.setConfig({ ...config, options: config.options.map(option => option.id === 'high' ? { ...option, name: 'Critical' } : option) })
```

## 2. Recolor the same option

Native chips change color; labels and record references remain independent.

```ts
const field = window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getFieldById('priority')
const config = field.getConfig()
field.setConfig({ ...config, options: config.options.map(option => option.id === 'high' ? { ...option, color: '#0f766e' } : option) })
```

## 3. Change option order

Move high to the end of its picker without changing record order.

```ts
const field = window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getFieldById('priority')
const config = field.getConfig()
field.setConfig({ ...config, options: [...config.options.filter(option => option.id !== 'high'), ...config.options.filter(option => option.id === 'high')] })
```

## 4. Add a new choice

Weather watch uses its own stable ID. Running this example twice does not create duplicates.

```ts
const field = window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getFieldById('priority')
const config = field.getConfig()
if (!config.options.some(option => option.id === 'weather')) field.setConfig({ ...config, options: [...config.options, { id: 'weather', name: 'Weather watch', color: '#db2777' }] })
```

## 5. Remove an unused choice

Seasonal is authored as unused; this example does not establish cleanup of used options.

```ts
const field = window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getFieldById('priority')
const config = field.getConfig()
field.setConfig({ ...config, options: config.options.filter(option => option.id !== 'seasonal') })
```

## 6. Choose one priority

A single-select cell stores an ID, not its display label.

```ts
window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getRecordById('surveys-01').setValue('priority', 'weather')
```

## 7. Replace multiple habitats

A multi-select cell stores an array. Existing values are replaced.

```ts
window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getRecordById('surveys-01').setValue('habitats', ['rockpool', 'dunes'])
```

## 8. Add one habitat

Read current IDs and append Shorebirds once; keep existing choices.

```ts
const record = window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getRecordById('surveys-01')
record.setValue('habitats', [...new Set([...(record.getValue('habitats') ?? []), 'birds'])])
```

## 9. Remove one habitat

Dunes is removed while Rock pools and Shorebirds stay selected.

```ts
const record = window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getRecordById('surveys-01')
record.setValue('habitats', (record.getValue('habitats') ?? []).filter(id => id !== 'dunes'))
```

## 10. Clear multiple choices

An empty array means no habitats are selected.

```ts
window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getRecordById('surveys-01').setValue('habitats', [])
```

## 11. Clear the single choice

Null is distinct from an arbitrary unknown option ID.

```ts
window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getRecordById('surveys-01').setValue('priority', null)
```

## 12. Inspect raw unknown-ID behavior

Known beta.2 defect: raw Facade writes accept an unknown ID. This deliberately exposes that behavior; it is not validated user input or a safe import recipe.

```ts
const record = window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getRecordById('surveys-01')
console.log({ accepted: record.setValue('priority', 'retired-option-probe'), actual: record.getValue('priority') })
```

## 13. Repair explicitly

Write an existing stable ID. No hidden cleanup or fallback substitutes for the SDK result.

```ts
window.univerAPI.getBase('sable-option-lab').getTableById('surveys').getRecordById('surveys-01').setValue('priority', 'normal')
```

## 14. Inspect the complete model

Save is a read-only Base snapshot, not an XLSX/CSV export or collaborative history.

```ts
console.log(window.univerAPI.getBase('sable-option-lab').save())
```

## Acceptance boundary

Earlier host-control test reports do not certify this UI. Used-option deletion and raw unknown-ID acceptance remain known beta.2 integrity defects; this demo does not silently repair them or claim raw Facades validate external input. Native Grid may paint person IDs despite supplied names. Full field-menu coverage, referenced option sources, used-option cleanup, reconstruction, lifecycle races, actual supported Exchange, accessibility/touch/cross-browser and performance remain open. Exact-version local dependency links are not a clean install; trial notices and build-size warnings remain. No backend or binary export is claimed.
