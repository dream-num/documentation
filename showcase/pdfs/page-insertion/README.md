# Page Insertion

A small original studio packet has square, wide and tall pages. New pages start blank, not duplicated from the adjacent page's content. Use the native page sidebar's add-page control, then select its new thumbnail. The viewer keeps its native zoom and navigation; no private runtime service fits the pages.

## Public Facade recipes

Run each block in its own scope. Reload between examples to compare the same original three-page packet.

Insert before the first page:

```ts
const pdf = window.univerAPI.getActivePdf()
const page = pdf.insertPage(0)
if (page.getIndex() !== 0) throw new Error('Unexpected insertion position')
console.log(page.getData().size)
```

Insert into the middle, then add real editable text to the new page:

```ts
const pdf = window.univerAPI.getActivePdf()
const page = pdf.insertPage(2)
page.insertTextBox({
  text: 'Installation note',
  left: 24, top: 28, width: 280, height: 60, fontSize: 22,
})
if (pdf.getPages().length !== 4) throw new Error('Unexpected page count')
```

Append without an index:

```ts
const pdf = window.univerAPI.getActivePdf()
const before = pdf.getPages().length
const page = pdf.insertPage()
if (page.getIndex() !== before) throw new Error('Page was not appended')
console.log(page.getData().size)
```

Reject an out-of-bounds index without changing the document:

```ts
const pdf = window.univerAPI.getActivePdf()
const count = pdf.getPages().length
let rejected = false
try {
  pdf.insertPage(count + 1)
} catch (error) {
  if (!(error instanceof RangeError)) throw error
  rejected = true
}
if (!rejected || pdf.getPages().length !== count) throw new Error('Invalid insertion was not rejected safely')
```

The installed public API inherits the previous page's size, rotation and PDF boxes (or the first page's when inserting at index 0). From the original packet, the three recipes produce a square 420 × 420 pt page, a wide 520 × 340 pt page and a tall 340 × 460 pt page respectively. Page IDs identify the original content even when its index changes. Use getPages() to inspect the resulting order rather than editing the saved snapshot array.

This is page insertion, not complete page lifecycle management. Delete, duplicate, reorder, imported PDF bytes and binary export are not demonstrated. Original content is authored through the public PDF snapshot helpers and text-box Facade. Full English Design/UI/Docs UI/Drawing UI/PDF UI packs and all five official CSS imports are shared by preview and export. Native licensing notices remain visible.
