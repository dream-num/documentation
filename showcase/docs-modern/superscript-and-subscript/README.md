# Superscript and Subscript

The document uses ordinary characters: x2, H2O, CO2, a2 + b2 = c2 and 1st. Native `ITextStyle.va` changes their baseline positions; there are no Unicode superscript substitutes or host-drawn labels.

The comparison line keeps one digit at the normal baseline, raises one and lowers one. Chemistry uses lowered digits, powers use raised digits, and the ordinal raises both letters of its suffix. The final N0 combines a lowered zero with amber color, bold and a 20-point base font size. Baseline positioning can also affect the rendered glyph size.

Select a styled digit using the native editor and change its formatting. Edit the final practice sentence to confirm that ordinary typing remains available and earlier styled ranges stay intact.

## Reset only the baseline

On a fresh document, the following public recipe returns the colored zero to the normal baseline without replacing its text or clearing its color, bold or font size.

```ts
const doc = window.univerAPI.getActiveDocument()
const text = doc.save().body.dataStream
const start = text.indexOf('N0 uses') + 1
if (start < 1) throw new Error('The sample phrase is missing')
const changed = doc.getTextRange(start, start + 1)
  .setTextStyle({ va: window.univerAPI.Enum.BaselineOffset.NORMAL })
if (!changed) throw new Error('The document rejected the style update')
```

## Change the same character to superscript

```ts
const doc = window.univerAPI.getActiveDocument()
const text = doc.save().body.dataStream
const start = text.indexOf('N0 uses') + 1
if (start < 1) throw new Error('The sample phrase is missing')
const changed = doc.getTextRange(start, start + 1)
  .setTextStyle({ va: window.univerAPI.Enum.BaselineOffset.SUPERSCRIPT })
if (!changed) throw new Error('The document rejected the style update')
```

Use `BaselineOffset.SUBSCRIPT` to restore the lowered position. Recompute offsets after editing text. These are character styles, not an equation editor or generated footnote references. Preview and standalone use the same factory, complete English Docs core locale, official CSS and Grid ribbon.
