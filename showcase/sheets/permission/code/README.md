# Local protection comparisons

## Initialization and native input

Wait for local permission initialization before editing. The factory blocks interaction only while rules are being applied; steady-state protection comes from SDK permissions. Avoid initializing the editor inside an `inert` container, which can prevent its hidden text editor from establishing a native caret.

Native worksheet tabs compare six independent states. C4:C9 contains decimals, zero and a blank; B4 is outside the range. Mixed ranges allow C4:C6 and deny C7:C9. Use the native editor to test input. The only host control is the global shadow strategy, which has no equivalent native menu.

The seventh tab, **Protected formulas**, adds editable quantities in C4:C6 and protected formulas in D4:D6. Initial fees are 210, 112 and 126. Change C4 from 6 to 8: D4 should recalculate to 280 without replacing its formula. Direct edits to D4 are denied by SDK range permissions, not a custom input interceptor. Protection prevents user replacement; it does not freeze calculation.

A two-column paste starting at C4 crosses into protected D4 and is rejected as a whole; a single value pasted into C4 remains editable and recalculates D4. This was checked by delivering demo-owned DataTransfer text to the native paste handler, not an end-to-end system clipboard/Ctrl+V test. The installed SDK reports `have no permission` as an uncaught error for the rejected cross-boundary paste. The demo does not suppress or patch this SDK error.

Inspect the formula profile with public APIs:

```ts
const sheet = univerAPI.getActiveWorkbook().getSheetBySheetId('formulas')
console.log(sheet.getWorksheetPermission().canEditCell(3, 2)) // C4: true
console.log(sheet.getWorksheetPermission().canEditCell(3, 3)) // D4: false
console.log(sheet.getRange('D4:D6').getFormulas())
console.log(sheet.getRange('D4:D6').getRawValues())
```

Its configuration, used during initialization on a fresh worksheet, is:

```ts
const rule = await sheet.getRange('D4:D6').getRangePermission().protect({ name: 'Calculated workshop fees' })
await rule.setPoint(univerAPI.Enum.RangePermissionPoint.Edit, false)
```

Do not create this rule again on the initialized preview; it already protects that range.

These are frontend permissions, not server authorization, encryption or confidential-data removal. View=false does not remove locally loaded values from SDK readback or workbook snapshots. No password, backend collaborator security, permission-history or portable permission-snapshot guarantee is claimed.

## Public Facade recipes

Create protection before changing its points:

```ts
const workbook = univerAPI.getActiveWorkbook()!
const sheet = workbook.getSheetBySheetId('worksheet')!
const permission = sheet.getWorksheetPermission()
await permission.protect()
await permission.setPoint(univerAPI.Enum.WorksheetPermissionPoint.Edit, false)
```

Protect a range on an otherwise editable worksheet:

```ts
const range = workbook.getSheetBySheetId('locked')!.getRange('C4:C9')
const rule = await range.getRangePermission().protect({ name: 'C4:C9' })
await rule.setPoint(univerAPI.Enum.RangePermissionPoint.Edit, false)
```

Set independent edit and view points on an existing rule:

```ts
await rule.setPoint(univerAPI.Enum.RangePermissionPoint.Edit, false)
await rule.setPoint(univerAPI.Enum.RangePermissionPoint.View, false)
```

Read effective permissions without treating them as server security:

```ts
permission.canEditCell(3, 2) // C4, zero-based
permission.canViewCell(3, 2)
await permission.listRangeProtectionRules({ ignoreCollaborators: true })
```

Change native rendering without changing permission rules or data:

```ts
univerAPI.setProtectedRangeShadowStrategy('non-editable')
univerAPI.getProtectedRangeShadowStrategy()
sheet.refreshCanvas()
univerAPI.toggleDarkMode(true)
```

Preview and export share one factory, complete English Core locale packs and official Core CSS. Initialization awaits each protection operation and verifies its effective points before enabling native input; failure remains visible and the event gate stays closed. Theme changes use the existing owner. No SDK internals or renderer patches are used.
