# Page Management

Four original garden-walk pages have different text and colored vector bands. All pages are created through public PDF APIs; no external PDF, page screenshot or re-created document substitutes for native page operations.

## Native page-thumbnail actions

Open the target thumbnail's native context menu in the page sidebar. Reload between these independent comparisons.

- Move Route up: the order becomes route, welcome, materials, closing. The route page keeps its ID and content; only its position changes. The printed 02 is authored text, not an automatic page number.
- Copy Route: a new page appears after Route. The copy has a new page ID and independent content object IDs, while its text and purple band match the source. Its copied printed ID caption describes the source content, not the new page identity.
- Delete Materials: only materials disappears; welcome, route and closing remain in their existing order. This deletes a reloadable sample page, not a file on disk.

Use the native viewer to inspect the affected page, then reload to restore the original packet. No dedicated Facade methods for move/copy/delete are exposed by the installed SDK; these operations are demonstrated through the native thumbnail menu, not invented methods or private context injection.

## Inspect page identity and content

Run before and after a native action:

```ts
const pdf = window.univerAPI.getActivePdf()
console.table(pdf.getPages().map(page => ({
  id: page.getId(),
  index: page.getIndex(),
  title: page.getTextBoxes()[0]?.getText(),
})))
```

## Verify a native copy

Reload, copy Route once in the thumbnail menu, then run:

```ts
const pdf = window.univerAPI.getActivePdf()
const originalIds = ['welcome', 'route', 'materials', 'closing']
const source = pdf.getPageById('route')
const copy = pdf.getPages().find(page => !originalIds.includes(page.getId()))
if (!source || !copy) throw new Error('Copy Route once before running this check')
const sourceText = source.getTextBoxes().map(box => box.getText())
const copiedText = copy.getTextBoxes().map(box => box.getText())
if (JSON.stringify(sourceText) !== JSON.stringify(copiedText)) {
  throw new Error('Copied text differs from its source')
}
if (copy.getIndex() !== source.getIndex() + 1) throw new Error('Unexpected copy position')
console.log(copy.getId(), copy.getDividers()[0].getStroke())
```

The copy should retain the purple stroke and 22-point width. `pdf.save()` returns the current public unit snapshot for inspection; it is not a binary PDF export. Initial and copied captions are ordinary editable content, so use Facade IDs to track page identity. Preview and standalone share the factory, official CSS and complete English locale packs. Native licensing notices remain visible.
