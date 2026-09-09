# Semantic lists and numbering

Four native semantic lists compare round and square bullets, decimal numbering starting at three, and a two-level number/letter list. The text does not contain typed bullets or numbering prefixes: markers belong to the PDF list definition. Labels describe the initial specimens and do not change with the recipes.

Use native PDF selection and zoom controls. These public recipes operate on the same semantic items as the rendered page; they do not replace the lists with text boxes.

## Change the bullet preset

```ts
const list = univerAPI.getActivePdf().getPageByIndex(0).getLists().find(list => list.getId() === 'disc')
list.setPreset(univerAPI.Enum.PdfListPresetId.UNORDERED_DIAMOND)
console.log(list.getItems())
```

The item text and stable IDs remain unchanged while the bullet appearance changes.

## Change the starting ordinal

```ts
const list = univerAPI.getActivePdf().getPageByIndex(0).getLists().find(list => list.getId() === 'numbered')
list.setStartNumber(7)
```

The three decimal markers should change from 3–5 to 7–9 without editing their body text.

## Promote a nested item

```ts
const list = univerAPI.getActivePdf().getPageByIndex(0).getLists().find(list => list.getId() === 'nested')
list.changeItemLevel('nested-item-3', 0)
console.log(list.getItems())
```

Check captions becomes a top-level item. Test lighting remains a child of Prepare gallery; later numbering follows the updated structure.

## Edit one body without rewriting its marker

```ts
const list = univerAPI.getActivePdf().getPageByIndex(0).getLists().find(list => list.getId() === 'square')
list.setItemText('square-item-2', 'Seal padded crates')
```

Only that body changes; IDs, nesting and marker preset are retained. The first item cannot be indented without a preceding parent; arbitrary level jumps are not a supported shortcut for constructing a valid list. This example does not certify binary export or pagination across multiple pages.
