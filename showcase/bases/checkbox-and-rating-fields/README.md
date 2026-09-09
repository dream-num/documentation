# Checkbox and Rating Fields

Six original print reviews compare two independent checkbox fields and two native rating fields. Approved uses a check; Follow up uses a flag. Craft has five stars, while Appeal has three hearts. Click the native cell controls to change individual values; no host controls or drawn substitutes are added.

Cobalt tide starts approved with 5/5 and 3/3. Fern shadow is not approved, needs follow-up and has 2/5 and 1/3. Silver rain contains explicit zero ratings and false checkboxes; Rose window contains nulls. Empty and zero ratings can look alike: they differ in storage, not a promised third visual state. The note explains this distinction.

## Public Facade recipes

Run each block separately after the workbench loads. These are record values, not text pretending to be checkboxes or stars.

```ts
const table = window.univerAPI.getBase('print-review-fields').getTableById('samples')
const record = table.getRecordById('sample-2')
if (!record.setValue('approved', true)) throw new Error('Checkbox update rejected')
if (record.getValue('approved') !== true) throw new Error('Checkbox value did not persist')
```

Set the two ratings independently, respecting each field's authored range:

```ts
const table = window.univerAPI.getBase('print-review-fields').getTableById('samples')
const record = table.getRecordById('sample-2')
if (!record.setValue('craft', 4)) throw new Error('Craft rating rejected')
if (!record.setValue('appeal', 2)) throw new Error('Appeal rating rejected')
if (record.getValue('craft') !== 4 || record.getValue('appeal') !== 2) throw new Error('Rating values did not persist')
```

Clear an existing rating explicitly. This is not the same stored value as zero:

```ts
const table = window.univerAPI.getBase('print-review-fields').getTableById('samples')
const record = table.getRecordById('sample-3')
if (!record.setValue('craft', null)) throw new Error('Clear rejected')
if (record.getValue('craft') !== null) throw new Error('Rating was not cleared')
```

Change the native rating icon without changing scores:

```ts
const table = window.univerAPI.getBase('print-review-fields').getTableById('samples')
const field = table.getFieldById('craft')
const before = table.getRecordById('sample-1').getValue('craft')
if (!field.setConfig({ min: 0, max: 5, icon: 'heart' })) throw new Error('Rating config rejected')
if (table.getRecordById('sample-1').getValue('craft') !== before) throw new Error('Icon change altered the score')
```

The factory uses complete Design, UI, Docs UI, Bases and Bases UI English locales, all four official stylesheets and Grid Ribbon configuration. Preview and export share the same native Base. No backend or SDK modifications are required; existing license notices remain visible.
