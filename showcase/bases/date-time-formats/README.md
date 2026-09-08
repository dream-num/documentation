# Date and Time Formats

Six fictional studio appointments compare four native Date fields. Each row initially stores the same serial in all four date columns; these are separate editable fields, not linked or calculated copies. Morning, afternoon, midnight, leap-day, new-year and empty values make the formatting differences visible. This is a concise feature gallery, not a scheduling application.

Use the native field editor to change a format, or open a date cell to edit its value. There are no demo-only controls or explanation cards. The four examples below run in the browser console after the workbench loads. Reload the page for the original data.

## Native calendar and time editing

Double-click the first appointment's 24-hour cell. Selecting 28 February changes the date while retaining 09:30. Open the cell again, enter 10:45 in the native time input and press Enter: the displayed and stored time changes without changing the day. The other three date fields stay unchanged because they are independent columns. If a selected cell does not reopen immediately after Escape, select another row before returning to it.

The native regression test exercises these two submissions separately from the four Facade recipes, in English on both English- and Chinese-language host pages with Shanghai and UTC browser timezones. It checks actual canvas text, other-field preservation and the complete edited Base model through themes. This is not a claim of exhaustive calendar navigation, date-field settings or keyboard accessibility coverage.

## 1. Show the existing time without changing it

```ts
const table = window.univerAPI.getBase('studio-date-formats').getTableById('appointments')
const record = table.getRecordById('appointment-1')
const before = record.getValue('iso')
if (!table.getFieldById('iso').setConfig({ pattern: 'yyyy-mm-dd', includeTime: true, hourCycle: 'h24' })) throw new Error('Format rejected')
if (record.getValue('iso') !== before) throw new Error('Formatting changed the stored date')
```

The first column reveals 09:30. Date-only formatting hid the fractional day; it did not remove it.

## 2. Switch the clock to 12-hour display

```ts
const table = window.univerAPI.getBase('studio-date-formats').getTableById('appointments')
if (!table.getFieldById('clock24').setConfig({ pattern: 'dd/mm/yyyy', includeTime: true, hourCycle: 'h12' })) throw new Error('Format rejected')
```

The afternoon appointment displays 2:15 pm with a day-first date. Column labels are authored labels; this API changes the format, not their names. No timezone conversion is performed.

## 3. Write a known date and time

```ts
const table = window.univerAPI.getBase('studio-date-formats').getTableById('appointments')
const value = Number(table.getRecordById('appointment-1').getValue('clock12')) + 7 / 24 // Seven hours after the authored 09:30 appointment
const record = table.getRecordById('appointment-2')
if (!record.setValue('clock24', value)) throw new Error('Date rejected')
if (record.getValue('clock24') !== value) throw new Error('Unexpected stored date')
```

Only the selected field changes. This does not synchronize the other three columns.

## 4. Clear a date explicitly

```ts
const table = window.univerAPI.getBase('studio-date-formats').getTableById('appointments')
const record = table.getRecordById('appointment-3')
if (!record.setValue('clock12', null)) throw new Error('Clear rejected')
if (record.getValue('clock12') !== null) throw new Error('The date was not cleared')
```

`null` means an empty date, not serial zero or midnight. The last authored appointment already demonstrates all four fields empty.

## Standalone export

Run `pnpm install` and `pnpm dev` in the exported project. Preview and export share the same factory with Grid configuration, complete Design/UI/Docs UI/Bases/Bases UI English locale packs, and all four official CSS imports. Theme changes retain the existing SDK owner and edited values. Original synthetic data needs no external assets, backend, or upload service. Native license notices remain visible.

The data factory converts explicit local calendar components with the installed public `dateToExcelSerial(new Date(year, monthIndex, day, hour, minute))`. In beta.2, native formatting applies the browser timezone: a raw UTC-midnight serial is not a timezone-independent local date. Fresh owners author the same local clock labels in each browser timezone; saved snapshots are not promised to retain those labels when moved between timezones. The sample does not promise timezone scheduling, recurrence, or date-system switching. These source examples use public installed Facades; actual native picker, rendered format, locale and export acceptance must be checked separately from type checking.
