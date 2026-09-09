# Multi-column layout

Four traditional document sections compare the same original seed-library text. Each section starts on a new page: one column, two equal columns with a 24 px gap, three equal columns with 18 px gaps, and two unequal columns of 180 and 396 px separated by 24 px. These labels describe the initial layout.

The three-column and unequal-column sections request separators. In the installed SDK the separator flag is retained, but no vertical separator line is visible, including after the public setter is called again. The sample keeps this configuration to expose that limitation; no replacement line is drawn by the host.

The page is 696 × 650 with 48 px side margins, so its content width is 600 px. Column widths and gaps use 96-DPI layout pixels. The body is one native document flow; there are no shapes, tables, manual column-break characters or CSS columns. Scroll through the document to compare sections. Adding text may change the page count and where later paragraphs flow.

## Change the second section

```ts
const section = window.univerAPI.getActiveDocument().getSection(1)
if (!section.setColumns(2, { gap: 40, separator: true })) throw new Error('Columns rejected')
console.log(section.getColumns())
```

Two equal columns now use widths of 280 px with a 40 px gap. The text is unchanged.

## Set unequal widths explicitly

```ts
const section = window.univerAPI.getActiveDocument().getSection(3)
if (!section.setColumns(2, { widths: [240, 336], gap: 24, separator: false })) throw new Error('Columns rejected')
console.log(section.describe())
```

Only the fourth section changes. Its two columns still fit the same 600 px content width.

## Restore normal single-column flow

```ts
const section = window.univerAPI.getActiveDocument().getSection(2)
if (!section.setColumns(1)) throw new Error('Columns rejected')
console.log(section.getColumns())
```

An empty explicit column array represents normal single-column layout. Reload restores all four original variants. These APIs require Traditional document flavor; modern document column groups are a different model. Column widths, gaps and text flow are rendered natively; separator rendering remains limited as described above. Preview and exported source share the same factory, complete official English locale and CSS.
