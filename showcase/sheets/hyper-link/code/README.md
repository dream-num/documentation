# Driftwood / Native hyperlinks

Native UI and authored data are English-only. Earlier bilingual/native reports below are historical evidence, not acceptance of this migration.

Use native link popups and the native editor. The original route index includes
external query/fragment, whole-sheet, range, defined-name and two-span links.
There is no fixture selector, Reset, host link form or raw snapshot panel.
The external navigation callback accepts only absolute HTTP(S) without credentials,
preserves the entire supplied URL and uses noopener/noreferrer. This policy controls
opening links, not what the native editor can store. Browser popup blocking remains.

Run these snippets in order after readiness with window.univerAPI as univerAPI.

## Insert into the original empty target

```ts
const book = univerAPI.getWorkbook('driftwood-links')!
const target = book.getSheetBySheetId('index')!.getRange('B7')
const inserted = await target.setHyperLink(book.getSheetBySheetId('workshop')!.getRange('B3:D4').getUrl(), 'Repair window')
if (!inserted) throw new Error('SDK did not insert the link')
```

## Update the first link

```ts
const updated = await target.updateHyperLink(book.getUrlOfDefineName('ReservedLamps'), 'Reserved lamps')
if (!updated) throw new Error('SDK did not update the link')
```

## Request actual internal navigation

```ts
const link = target.getHyperLinks()[0]
if (!link) throw new Error('The target has no reported link')
book.navigateToSheetHyperlink(link.url)
```

Inspect the native active worksheet and selected range. This method returns void;
the return is not evidence that navigation and paint completed. Read
getSelection().getActiveRangeList() after navigation: a range-only selection can
have no primary cell, so getActiveRange() can legitimately return null.

## Remove the reported link

```ts
const removed = target.cancelHyperLink(link)
if (!removed) throw new Error('SDK did not remove the link')
```

Check that native text remains and use native Undo/Redo. On multi-cell targets,
insertion/update address the top-left cell. getHyperLinks() reports only the first
span per cell in beta.2; B6 contains two spans and must not be treated as fully
enumerated by that result. Missing defined-name lookup can throw before a write.

Both official core/link stylesheets and full English preset packs are exported.
Theme changes retain the same owner. createDemo(container, darkMode, saved) accepts
a saved Driftwood workbook with its original workbook and sheet IDs; invalid IDs,
dimensions and cell maps are rejected before mounting. This is JSON snapshot
restoration, not binary XLSX conversion. No generation ID replacement or synthetic
navigation result is used.

## Native acceptance and boundaries

Two strict SDK limitations remain, without model normalization:

- getHyperLinks() reports one of B6's two authored spans.
- Undo of the first native insertion into B7 removes its original { v: null }
  cell record. The visual empty cell returns, but the complete snapshot differs.
  Redo is exact; subsequent native update/removal histories are exact.
