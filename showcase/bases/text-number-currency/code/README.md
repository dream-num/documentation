# Bracken repair café — native field types

Native UI and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged. Bilingual runtime reports below describe earlier revisions, not acceptance of this English-only revision.

The entire preview is the native Base Grid editor, with its own compact toolbar and native left sidebar. The UI plugin is configured for Grid ribbon; Bases renders its product-specific toolbar rather than a Sheets-style ribbon. There are no fixture controls, duplicated ribbon buttons, comparison cards or snapshot panels. The original 30 repair jobs, 12 workshop projects and 18 return checks retain their structure, including varied amounts, submitted quotes, Unicode English notes, local people, dates, original text attachments and real record links.

Install with `pnpm install`, then `pnpm dev` or `pnpm build`. Build only this selected case. Preview and standalone export use the same factory and all four official Design/UI/Docs UI/Bases UI CSS imports. Complete English dependency locales are registered. Theme switching updates the existing SDK owner instead of resetting edits. Keep native license notices intact.

## Twenty-three executable Facade examples

Run in order in the standalone page console. Await asynchronous examples. Source methods are the installed Facades; inspect console output instead of a host-generated UI panel. Use the native ribbon for local Undo/Redo. This is editing history, not a collaboration/history-record demo.

### 1. Create three field types

Run once. Existing records keep missing values in these new fields; defaults apply only to later records. The current native numeric renderer can display those missing values as zero (see the acceptance boundary). Each add is one native command.

```ts
const api = window.univerAPI, table = api.getBase('bracken-field-lab').getTableById('repairs')
table.addField('Intake note', api.Enum.BaseFieldType.Text, { field: { defaultValue: 'Needs triage' }, index: 2 })
table.addField('Spare units', api.Enum.BaseFieldType.Number, { field: { config: { decimalPlaces: 2, allowNegative: true }, defaultValue: 2 }, index: 3 })
table.addField('Parts reserve', api.Enum.BaseFieldType.Currency, { field: { config: { decimalPlaces: 2, currencySymbol: '$', allowNegative: true }, defaultValue: 12.5 }, index: 4 })
```

### 2. Write a typed fractional value

The saved value is a number, not a formatted string.

```ts
const table = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs')
table.getRecordById('repairs-01').setValue(table.getFieldByName('Spare units').getId(), 8.5)
```

### 3. Change Number to Currency

Currency is display semantics, not an exchange-rate calculation. 8.5 remains 8.5.

```ts
const api = window.univerAPI, field = api.getBase('bracken-field-lab').getTableById('repairs').getFieldByName('Spare units')
field.changeType(api.Enum.BaseFieldType.Currency, { ...field.getConfig(), currencySymbol: '$', decimalPlaces: 2 })
```

### 4. Compare precision and grouping

Set one combination at a time to inspect native rendering. The loop exercises all eight configurations; it finishes on M abbreviation. Stored values never change.

```ts
const field = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getFieldById('units')
for (const [decimalPlaces, separatorStyle, useThousands, abbreviation] of [
  [0, 'commaPeriod', true, 'none'], [1, 'commaPeriod', true, 'none'],
  [2, 'periodComma', true, 'none'], [3, 'spaceComma', true, 'none'],
  [4, 'spacePeriod', true, 'none'], [2, 'commaPeriod', false, 'none'],
  [2, 'commaPeriod', true, 'K'], [2, 'commaPeriod', true, 'M'],
]) field.setConfig({ ...field.getConfig(), decimalPlaces, separatorStyle, useThousands, abbreviation })
```

### 5. Compare currency symbols

Use each symbol separately for visual comparison. This changes no amount or FX rate.

```ts
const field = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getFieldByName('Spare units')
for (const currencySymbol of ['$', '€', '£']) field.setConfig({ ...field.getConfig(), currencySymbol })
```

### 6. Change quote schema without pretending to normalize

Known beta.2 gap: old numeric strings, blanks and invalid text remain stored unchanged after schema conversion. Inspect real types; the SDK returns a boolean, not a conversion report.

```ts
const api = window.univerAPI, table = api.getBase('bracken-field-lab').getTableById('repairs')
table.getFieldById('quote').changeType(api.Enum.BaseFieldType.Number, { decimalPlaces: 2, allowNegative: true })
console.log(table.getRecords().map(record => ({ id: record.getId(), value: record.getValue('quote'), type: typeof record.getValue('quote') })))
```

### 7. Let the SDK parse one numeric string

A subsequent cell write parses numeric text independently of schema conversion.

```ts
window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getRecordById('repairs-01').setValue('quote', '1250.75')
```

### 8. Reject unparseable cell input

Expected SDK diagnostic. Both 12kg and comma-grouped numeric text are rejected; the full snapshot remains unchanged.

```ts
const record = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getRecordById('repairs-01')
console.log(record.setValue('quote', '12kg'), record.setValue('quote', '1,250.75'))
```

### 9. Clear with explicit null

A missing observation is not measured zero.

```ts
window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getRecordById('repairs-01').setValue('units', null)
```

### 10. Restrict future negative writes

This is a field rule, not retrospective cleanup. Existing negative values are not rewritten.

```ts
const table = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs'), field = table.getFieldById('units')
field.setConfig({ ...field.getConfig(), allowNegative: false })
console.log(table.getRecordById('repairs-01').setValue('units', -1))
```

### 11. Allow a negative adjustment

Restore normal numeric display and permit a signed fractional value.

```ts
const table = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs'), field = table.getFieldById('units')
field.setConfig({ ...field.getConfig(), decimalPlaces: 3, separatorStyle: 'commaPeriod', useThousands: true, abbreviation: 'none', allowNegative: true })
table.getRecordById('repairs-01').setValue('units', -8.25)
```

### 12. Set a safely typed default

The finite/negative guard is explicit application validation, not an SDK guarantee. Change the input to inspect rejected host input; do not silently coerce bad strings.

```ts
const field = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getFieldByName('Spare units')
const input = '2', value = Number(input)
if (!input.trim() || !Number.isFinite(value) || (field.getConfig().allowNegative === false && value < 0)) throw new Error('Enter a finite permitted number; no SDK write was made.')
field.setDefaultValue(value)
```

### 13. Compare omitted, null and zero

Only an omitted field inherits its default. Other new field defaults also apply normally. Inspect stored values: beta.2 can paint an explicit numeric null as zero, so equal-looking cells do not prove equal observations.

```ts
const table = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs'), id = table.getFieldByName('Spare units').getId()
table.addRecord({ title: 'Default check / omitted' })
table.addRecord({ title: 'Default check / explicitly blank', [id]: null })
table.addRecord({ title: 'Default check / measured zero', [id]: 0 })
```

### 14. Clear a default without backfilling

Existing records keep their values. Later omitted values remain blank.

```ts
window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getFieldByName('Spare units').setDefaultValue(null)
```

### 15. Expose the unsafe raw-default gap

Deliberate SDK probe, not a recommended input path: beta.2 accepts an invalid numeric default and copies it to a new record. This remains strict failing acceptance.

```ts
const table = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs'), field = table.getFieldByName('Spare units')
console.log(field.setDefaultValue('not a number'))
const added = table.addRecord({ title: 'Unsafe raw default / SDK probe' })
console.log(added.getId(), added.getValue(field.getId()))
```

### 16. Repair schema default and the affected record explicitly

Clearing a default alone does not rewrite records. This repair deliberately uses a real numeric cell write.

```ts
const table = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs'), field = table.getFieldByName('Spare units')
field.setDefaultValue(2)
const probe = table.getRecords().find(record => record.getValue('title') === 'Unsafe raw default / SDK probe')
if (probe) probe.setValue(field.getId(), 2)
```

### 17. Change Currency to Number, then Text and back

Schema changes preserve existing storage values in this SDK; do not label that automatic text conversion.

```ts
const api = window.univerAPI, field = api.getBase('bracken-field-lab').getTableById('repairs').getFieldByName('Spare units')
field.changeType(api.Enum.BaseFieldType.Number, { decimalPlaces: 2, allowNegative: true })
field.changeType(api.Enum.BaseFieldType.Text, {})
field.changeType(api.Enum.BaseFieldType.Number, { decimalPlaces: 2, allowNegative: true })
```

### 18. Keep Unicode English notes

English notes retain Unicode punctuation, accented words and long-text boundaries.

```ts
window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getRecordById('repairs-03').setValue('note', 'Thread colour — café repair; retain the original.')
```

### 19. Read fields, defaults and storage

This is read-only Facade inspection; there is no duplicate inspector panel.

```ts
const table = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs')
console.log(table.getFields().map(field => ({ field: field.getField(), config: field.getConfig(), defaultValue: field.getDefaultValue() })))
console.log(table.getRecordById('repairs-01').getValues())
```

### 20. Download the complete local snapshot

Application download of FBase.save(), not XLSX/CSV conversion. No upload or backend is called.

```ts
const data = window.univerAPI.getBase('bracken-field-lab').save()
const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'bracken-field-lab.base.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 0)
```

### 21. Open workshop projects

The native left sidebar exposes all three supporting tables. This Facade is useful when the surrounding application needs to navigate.

```ts
await window.univerAPI.getBaseUI().activateTable('stations')
await window.univerAPI.getBaseUI().activateView('stations-grid')
```

### 22. Open return checks

Eighteen different checks retain their real station record links.

```ts
await window.univerAPI.getBaseUI().activateTable('checks')
await window.univerAPI.getBaseUI().activateView('checks-grid')
```

### 23. Return to repair intake

Native ribbon and cells remain the main interaction surface.

```ts
await window.univerAPI.getBaseUI().activateTable('repairs')
await window.univerAPI.getBaseUI().activateView('repairs-grid')
```

## Reconstruct the current owner

In the application entry use `let demo = createDemo(container)` and keep the imported factory and mount element. Wait for `demo.ready`, then replace the handle. This saves the current snapshot, including any malformed values; reload is not cleanup.

```js
const saved = JSON.parse(JSON.stringify(demo.univerAPI.getBase('bracken-field-lab').save()))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
await demo.ready
```

To inspect the original data variants, import `createData` from `./data` in that same application entry. After disposing the previous owner, pass `createData('empty')`, `createData('boundary')`, `createData('error')` or `createData()` as the fourth factory argument. Empty preserves 30 supporting records and all field schemas. Boundary includes 0.0001, 9999999.875 and a long Unicode English note. Error retains unparseable and grouped submitted quote strings. The default factory resets to all 60 original records. These separate constructed datasets replace the old fixture panel without removing its scenarios. Reset/reconstruction starts a new local edit history.

## Acceptance boundary

`scripts/test-bases-number-preview.mjs` verifies the actual React Preview in an
isolated selected server. EN/ZH both pass native first-record Number and Currency
keyboard edits to 4321.125 and 98.25, three real numeric format paints
(`4.321,13`, `4 321.125`, `4.32K`) without changing stored records, and exact full
edited-snapshot/same-owner retention through dark/light next-themes storage
events. Independent supporting tables, official white CSS, locales and active
React unmount are checked with no browser errors. The reviewed screenshots and
report are in `test-results/bases-number-preview-first-row`; the initial repeated
value locator failure is retained in `bases-number-preview`. This focused pass
does not clear the strict SDK defects below or certify language-route retention.

Maintainer verification (from the documentation repository, not this exported project's folder): `node scripts/test-bases-bracken-native.mjs` targets `http://localhost:3030/en-US/playground/bases/text-number-currency` by default. `SHOWCASE_BASE_URL` changes the documentation origin; `SHOWCASE_DEMO_URL` selects an exact page. The ordinary documentation target exercises the native UI and literal examples; lifecycle-only checks are explicitly marked not run because the application owns its factory handle.

For the complete selected standalone harness, set `SHOWCASE_BUILD_STANDALONE=1`, `SHOWCASE_DEMO_URL=http://127.0.0.1:4356`, and `SHOWCASE_RESULTS_DIR=test-results/bracken-native-final`, then run the same script. This builds only this case and closes its 4356 server afterward. Set `SHOWCASE_EXPORT_DIRECTORY` to this case's existing selected export directory with an installed `node_modules/vite` to reuse it when disk space is limited. Alternatively set `SHOWCASE_VITE_DIRECTORY` to the exact installed Vite package directory (the folder containing its `package.json`); the version must match the exported dependency. If neither exists, the script prints the generated export path and installation guidance without installing anything. No other demo or its test report is needed. The strict test exits nonzero while the SDK gaps below remain; do not turn those observations into a passing result.

The selected browser report at `test-results/bracken-native-final/report.json` exercises nine runtime checks, all 23 literal examples and eight native numeric-format paints. It verifies real numeric cell keyboard input with exact full-snapshot Undo/Redo, native three-table sidebar navigation, no host control/inspector panels, five complete EN/ZH packs, same-owner light-dark-light data preservation, exact edited-snapshot reconstruction and fresh post-reload edits. All four separate data variants retain the supporting tables; the original 60 records return on reset. The downloaded JSON exactly matches `FBase.save()`. Active-owner disposal leaves no browser errors, unexpected warnings or backend requests. Three expected SDK rejection diagnostics remain visible and separately recorded.

The report remains **strict FAIL** for three genuine SDK acceptance gaps: Text-to-Number changes the schema but leaves the old numeric string `1250.75` as a string; an invalid numeric default `not a number` is accepted and copied into a record; and the native numeric renderer paints an explicit stored null as `0.00`. The null-rendering probe records the exact row/column canvas coordinates alongside the original snapshot, not just unrelated zero text elsewhere. Complete before/after and canvas evidence are in the report directory; the example does not silently normalize values or override native rendering. Native person-ID display is also still visible despite the supplied local names. There is no SDK patch or claim of full product acceptance.

Standalone export/CSS parity passes in `test-results/bracken-native-export-ui/report.json`: all nine exported files match the published source, all four official stylesheets are included, and the native workbench background is white with no browser errors. The eleven dependency versions were checked exactly and locally linked; this was not a fresh install. Only this demo was built. The large-chunk warning remains a performance follow-up. Field creation uses generated IDs; authored dates are fixed but the SDK clock is not frozen. No backend, upload service, binary Office conversion, artificial Undo stack or SDK patch is included. Full keyboard-menu coverage, touch, screen-reader, cross-browser, pending-operation teardown and bundle performance require further acceptance. This native-only migration reused the existing story and removed the control framework instead of adding a second interaction layer.
