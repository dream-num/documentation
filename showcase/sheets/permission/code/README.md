# Local protection comparisons

## Initialization and native input

Do not initialize this SDK editor inside an `inert` container. In Chromium this prevented the hidden text editor from establishing a browser caret: it could receive focus later, but `document.getSelection().rangeCount` remained zero and typing produced no input event. The factory now blocks user edit events until permissions are ready while allowing SDK focus/selection initialization. No SDK patch or replacement input control is used.

The previous bilingual test checked 36 native allowed/denied input attempts across six permission setups, 48 native shadow pixel comparisons and full edited-workbook preservation across theme changes. Earlier failed reports are retained; focusing an element or reading `canEditCell()` alone is not input acceptance.

Native worksheet tabs compare six independent states. C4:C9 contains decimals, zero and a blank; B4 is outside the range. Mixed ranges allow C4:C6 and deny C7:C9. Use the native editor to test input. The only host control is the global shadow strategy, which has no equivalent native menu.

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
