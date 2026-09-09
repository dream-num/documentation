# Headers, footers, and section links

Six short English leaves compare real first/even/default header and footer segments across two sections. The second section inherits first/even headers and all footers, but has an independent default header. Static body descriptions say “Initially” because native edits can change the comparison.

Double-click the top/bottom page margin to enter header/footer editing. The native Header & Footer button opens its panel, but its settings are disabled while editing the body. The panel provides Different first page, Different odd and even pages and, in a following section, Link to previous. No additional host controls are present. The actual Preview and standalone export share the factory, complete English Docs Core preset locale and official preset CSS. Theme changes retain the editor and its edits; dispose releases the owner.

## Public Facade recipes

Run each block in the browser console. These change real document segments, not an overlay. The first recipe edits the shared default footer; scroll to its odd pages to see it.

```ts
const doc = window.univerAPI.getActiveDocument()
doc.insertText(0, 'REVIEWED / ', doc.getSection(0).ensureFooter('default'))
```

Disable the first-page exception in the opening section.

```ts
const doc = window.univerAPI.getActiveDocument()
if (!doc.getSection(0).setHeaderFooterOptions({ useFirstPageHeaderFooter: window.univerAPI.Enum.BooleanNumber.FALSE })) throw new Error('Options rejected')
```

Link the second section’s default header back to the first.

```ts
const doc = window.univerAPI.getActiveDocument()
if (!doc.getSection(1).setHeaderLinkedToPrevious(true, 'default')) throw new Error('Link rejected')
```

Unlinking clones the inherited segment. This prefix then belongs only to the second section.

```ts
const doc = window.univerAPI.getActiveDocument()
const section = doc.getSection(1)
if (!section.setHeaderLinkedToPrevious(false, 'default')) throw new Error('Unlink rejected')
doc.insertText(0, 'SECOND SECTION / ', section.getHeaderId('default'))
```

## Limits

This is not automatic page numbering, numbering-format selection, a table of contents or a complete implementation of blueprint 003. Physical pages and their actual header/footer paint require native runtime verification; segment configuration alone is insufficient. Header margin units are described inconsistently in installed declarations, so this example does not advertise a unit-conversion recipe. No SDK code or license notices are changed.

The focused native check verifies all six physical pages, first/even switches, double-click header typing, all four literal recipes, same-owner full-model theme retention and unmount under English and Chinese host pages. Link/unlink is verified through the public Facade, not the native Link to previous checkbox; history is not covered. Reviewed dark-mode screenshots show low-contrast native ribbon labels/icons, so this is not full dark-theme visual acceptance.
