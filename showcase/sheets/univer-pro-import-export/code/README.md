# Regional sales: Exchange integration boundary

This frontend-only sample preserves the original August regional sales workbook: five accounts across five regions and segments, numeric orders and prices, six revenue formulas, totals and currency styling. Use the native Grid, name box, formula bar, formatting and history. There are no host reset, conversion, audit or readback panels.

**Office conversion is not implemented under the frontend-only constraint.** XLSX/XLS/CSV/TSV import, XLSX workbook export and active-sheet CSV export remain original, open requirements. Registering the installed `@univerjs-pro/exchange-client` and `@univerjs-pro/sheets-exchange-client` **1.0.0-beta.2** supplies an HTTP client, not a browser Office converter. Their HTTP menu entries are hidden through public menu configuration. No conversion API is invoked, no files are uploaded and no development service origin is configured. Do not mistake a native workbook, JSON download or protocol snapshot codec for XLSX support.

## Run and native interaction

Run the generated project's `npm install` and `npm run dev`, or open `/en-US/playground/sheets/univer-pro-import-export` in the documentation app. Select D2 with the native name box, type `95`, press Enter: F2 becomes 13889 and F8 becomes 76593.4. Use native Undo/Redo and verify both formulas. Edit an account name, format a number or resize a column through the SDK UI. This workbook has no original Print plugin; none is added here.

Preview and standalone both use `createImportExportDemo`. All eleven complete English dependency locale packs are merged, including formula engine and formula model messages; the SDK stays English on every host language. All seven available official dependency stylesheets are imported from this same factory. Changing theme calls `toggleDarkMode` on the existing owner; it does not discard edits. `ready` has a 20-second canvas/skeleton bound and startup failure is visible. Disposal is idempotent, removes only its own DOM and disposes its workbook and owner.

## Literal Facade examples

Run these snippets in order after the native canvas loads. Every `ts` block below is executed verbatim by the dedicated test. The standard entry sets `window.univerAPI`; variables declared inside each block are intentionally independent.

### 1. Inspect the original heterogeneous sales rows

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
console.assert(sheet.getRange('A2:C6').getValues().length === 5)
console.assert(sheet.getRange('B2').getRawValue() === 'Aurora Outfitters')
console.assert(sheet.getRange('D2').getRawValue() === 82)
console.assert(sheet.getRange('F2').getRawValue() === 11988.4)
```

### 2. Change orders; preserve the formula rather than replacing its result

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
sheet.getRange('D2').setValue(95)
console.assert(sheet.getRange('D2').getRawValue() === 95)
```

Formula calculation is asynchronous; observe formatted F2 = $13,889.00 and F8 = $76,593.40 after calculation completes. Numeric tests use `getRawValue()` and the same floating-point expression `95 * 146.2`; `getValue()` includes currency formatting. Complete snapshot comparisons retain the original floating-point values unchanged.

### 3. Rename one account with Unicode content

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
sheet.getRange('B2').setValue('Aurora Outfitters · North — reviewed')
console.assert(sheet.getRange('B2').getRawValue() === 'Aurora Outfitters · North — reviewed')
```

### 4. Undo and redo the account change

```ts
const api = window.univerAPI
await api.undo()
console.assert(api.getActiveWorkbook().getActiveSheet().getRange('B2').getRawValue() === 'Aurora Outfitters')
await api.redo()
console.assert(api.getActiveWorkbook().getActiveSheet().getRange('B2').getRawValue() === 'Aurora Outfitters · North — reviewed')
```

### 5. Encode the live workbook into Exchange protocol JSON locally

```ts
const api = window.univerAPI
const data = api.getActiveWorkbook().save()
const protocol = await api.transformWorkbookDataToSnapshotJsonAsync(data)
console.assert(Boolean(protocol.snapshot.workbook))
console.assert(Object.keys(protocol.sheetBlocks).length > 0)
```

This encodes metadata and sheet blocks; it does **not** produce an XLSX/CSV/TSV file. The reverse method accepts `ISnapshotBlockJsonResponse`, whereas this encoder returns `ISnapshotBlockJson`. These are different published types; this sample does not cast one into the other or supply an invented converter.

### 6. Download an honestly named workbook JSON file

```ts
const api = window.univerAPI
const data = api.getActiveWorkbook().save()
api.downloadFile(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'regional-sales', 'json')
```

### 7. Change theme on the same owner

```ts
const api = window.univerAPI
const dark = api.isDarkMode()
api.toggleDarkMode(!dark)
console.assert(window.univerAPI === api)
api.toggleDarkMode(dark)
```

### 8. Keep the workbook and sheet identities in a complete snapshot

```ts
const workbook = window.univerAPI.getActiveWorkbook()
const saved = workbook.save()
console.assert(saved.id === 'regional-sales-exchange-demo')
console.assert(saved.sheetOrder[0] === 'sales')
console.assert(saved.sheets.sales.id === 'sales')
```

### 9. Destroy and rebuild the complete owner

In the generated `/src/index.ts`, `demo`, `container` and `createImportExportDemo` already exist. The standalone test exposes exactly these bindings. Validate before disposing so invalid input cannot destroy the live workbook. Compare every saved field; do not normalize generated resources or cell types to force equality.

```js
const saved = structuredClone(demo.univerAPI.getActiveWorkbook().save())
if (!saved.id || !saved.sheetOrder?.length || !saved.sheetOrder.every((id) => saved.sheets?.[id]?.id === id)) throw new Error('Invalid workbook snapshot')
const locale = demo.univerAPI.getCurrentLocale()
const dark = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createImportExportDemo(container, dark, locale, saved)
await demo.ready
console.assert(demo.univerAPI.getActiveWorkbook().getId() === saved.id)
```

## Original conversion requirements and exact source evidence

The package source paths above are in the sibling local `univer-pro` checkout; installed versions are separately recorded by the test. No SDK, conversion algorithm or HTTP service is patched. A future integration must resolve the actual frontend converter or explicitly change the no-backend requirement, then test valid files and errors end to end. The original binary requirements remain open until then.

## Maintainer verification

### Retained acceptance gaps

The dedicated run records **5 of 8 gates passing, 19 individual checks**, zero browser errors and zero conversion requests. Passing native input/formula paint, eight literal examples including a real JSON download, local protocol encoding, historical nine bilingual packs/seven CSS/same-owner themes, and initial Chinese/invalid/pre-ready/idempotent lifecycle are only partial evidence.

Three gates remain strict failures: (1) the six original Office conversion requirements need HTTP and remain blocked; (2) native account Undo leaves one generated style entry and adds `t: 1` to B2; (3) complete owner restoration changes `SHEET_DEFINED_NAME_PLUGIN` resource data from an empty string to `'{}'`, and fresh-owner account Undo adds `t: 1` to B2. Both native Redo comparisons pass exactly. All fields, including styles, resources, cell types and floating-point values, remain in the comparison. The UI can appear restored while its full model is not identical.

Early test reports are retained separately: the first used formatted `getValue()` as a number, and the second incorrectly expected the rounded integer instead of the exact floating-point expression. The corrected checks use actual public raw-value access without modifying or normalizing the workbook.

Default guide test target is `http://localhost:3030/en-US/playground/sheets/univer-pro-import-export`; override `SHOWCASE_BASE_URL` or `SHOWCASE_DEMO_URL`. Complete owner lifecycle and literal reconstruction need the standalone test-only harness; normal exported source contains no test globals or test panels.

The script builds this case only, uses per-package exact-version junctions, records the full source export manifest and closes its own port 4416. Keep failure artifacts: partial native/JSON passes never satisfy the blocked Office conversion gate. Full model history and restore are checked without field normalization.
