# Material samples / Gallery covers and card layout

Six fictional samples share one native Base: Oat linen, Clay tile, Lagoon glass, Shell terrazzo, Ash veneer and Graphite felt. Five original geometric SVG swatches are stored as native attachment data URLs; Graphite felt deliberately has no attachment. No remote image, upload service or host-rendered card is used.

Use the native view list to compare Small cards, Medium cards, Large cards and Source grid. Medium cards is the opening view. Small cards requests compact composed cards without field labels; Medium cards orders Finish, Family and Proposed use; Large cards includes the Sample note and begins with Proposed use. Each view uses the Material primary field as its title and Sample cover as its attachment cover. Native rendering determines the actual card geometry and empty-cover treatment.

Open a native card to inspect its record details and edit its Sample note. Then switch to Source grid and the other Gallery views to check that they show the same record. View configuration belongs to its view; record edits belong to the shared Materials table.

## Literal public Facade examples

Run these in the preview frame or standalone page console. They exercise the installed public Facades; successful configuration writes alone do not prove native painting or pointer interactions.

Change only the Medium cards size, then inspect Small cards and Large cards to compare their independent settings:

```ts
window.univerAPI.getBase('material-library').getTableById('materials').getViewById('medium').updateConfig({ cardSize: 'large' })
```

Restore Medium cards and hide its field labels:

```ts
window.univerAPI.getBase('material-library').getTableById('materials').getViewById('medium').updateConfig({ cardSize: 'medium', showFieldNames: false })
```

Restore labels:

```ts
window.univerAPI.getBase('material-library').getTableById('materials').getViewById('medium').updateConfig({ showFieldNames: true })
```

Edit a shared source value, then compare the Large cards and Source grid views:

```ts
window.univerAPI.getBase('material-library').getTableById('materials').getRecordById('sample-1').setValue('note', 'Reviewed for the west-facing window.')
await window.univerAPI.getBaseUI().activateView('large')
```

Remove Clay tile's cover to compare a second native missing-cover state. Reload restores authored attachments and other local edits:

```ts
window.univerAPI.getBase('material-library').getTableById('materials').getRecordById('sample-2').setValue('cover', [])
```

Inspect the Medium cards configuration:

```ts
console.log(window.univerAPI.getBase('material-library').getTableById('materials').getViewById('medium').getConfig())
```

## Export and verification boundary

The preview and standalone entry use the same independent factory. The export includes all five English locale packs used by Design, UI, Docs UI, Bases and Bases UI, plus their four official CSS imports. Native UI and data stay English regardless of the documentation language. Grid ribbon and the native sidebar provide controls; there is no custom host panel.

The factory follows installed beta.2 Gallery and attachment declarations. Source data and public API types are checked separately from browser acceptance. Card sizes, composed layout, field labels/order, SVG rendering, missing-cover appearance, record-detail editing, view independence, native switching and theme/model preservation need selected runtime evidence before they can be called accepted. No attachment upload, server persistence or SDK patch is provided. Reload discards edits. The SDK license notice is retained.
