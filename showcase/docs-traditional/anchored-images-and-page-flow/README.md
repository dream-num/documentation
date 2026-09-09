# Anchored Images and Page Flow

Three original field-report specimens share the same paragraphs and 210 × 140 image. Each begins on a new physical page using paragraph page-break-before. These are independent specimens, not linked header/footer sections. The illustration is a small original inline SVG with no external image request.

Compare how native line flow treats the image: inline participates in its text line; square wrapping permits text beside the image; top-and-bottom wrapping reserves vertical space across the column. The SDK paginates the report. Page count and line boundaries depend on editing and fonts, so no fixed page count is promised.

Each image is inserted after "The survey team " inside its anchor paragraph, not at the preceding paragraph boundary. Square wrapping uses the larger available side (`WrapTextType.LARGEST`). In the tested SDK, margin-left alignment leaves the floating image inset from the text edge; this example does not compensate with a negative offset.

## Change the square specimen to top-and-bottom

Scroll to Square wrapping, then run this public recipe. Observe the native text moving away from the image's side. The image source, ID and dimensions remain the same.

```ts
const image = window.univerAPI.getActiveDocument().getImage('square')
if (!image.setWrappingStyle(window.univerAPI.Enum.TextWrappingStyle.WRAP_TOP_AND_BOTTOM)) throw new Error('Wrapping rejected')
```

## Restore square wrapping and shift horizontally

Only the square specimen changes. The horizontal offset is 180 px relative to the SDK margin reference. Compare the space available to its paragraphs and the continuation page after reflow.

```ts
const image = window.univerAPI.getActiveDocument().getImage('square')
if (!image.setWrappingStyle(window.univerAPI.Enum.TextWrappingStyle.WRAP_SQUARE)) throw new Error('Wrapping rejected')
if (!image.setPositionH({ relativeFrom: window.univerAPI.Enum.DocsImageRelativeFromH.MARGIN, posOffset: 180 })) throw new Error('Position rejected')
```

## Read the current anchor after native editing

Add several sentences to the lead-in immediately before an image, using the native editor. Then read the live paragraph range and image. The body positions must be re-resolved after editing, not cached as permanent character offsets. This read-only recipe does not reposition the image or substitute a host layout.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphs({ paragraphId: 'square-anchor' })[0]
if (!paragraph) throw new Error('Anchor paragraph no longer exists')
console.log(paragraph.getRange(), doc.getImage('square').getId())
```

The factory inserts each image through exported `InsertDocDrawingCommand` at its actual paragraph range, then uses public image Facades. Preview and source share full official English locales and CSS. Reload restores the report. This does not certify tight-contour wrapping, every floating-image anchor option, footnotes/endnotes, or print/export fidelity; it is not a manual page renderer.
