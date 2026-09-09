# Images and wrapping

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

Ten native modern-document specimens use one original embedded SVG: inline; square left, center and right; top/bottom; behind/front; resized and rotated; recorder portrait crop; horizon crop. Identical surrounding text distinguishes the layouts. No chart, table, columns, fixture, JSON readback or redundant host formatting/history controls remain.

Select images to use the native image UI. Initialization uses the installed InsertDocDrawingCommand and real image Facades for wrapping, horizontal alignment, size and rotation. Crop still uses UpdateDrawingDocTransformCommand because this version has no demonstrated crop Facade. Descriptive metadata is initialized directly; no invented alt-text setter or custom command is registered.

Known beta.2 limitation: combined source rectangle and size updates can rescale rendered crop offsets again (60 becomes 30), even though the document retains 60. Cropped specimens intentionally preserve this boundary. A model readback does not certify renderer crop correctness. Image alt text is metadata, not complete canvas screen-reader support. No claim of perfect cropping or accessibility is made.

Core and Drawing presets, complete English packs and their official stylesheets are shared by Preview and export. Native Grid controls remain visible. The modern document uses a fixed authored 820-pixel width with native viewport behavior; the old custom responsive-table/chart demo and its acceptance claims no longer apply. Theme updates preserve the instance and edits.

## Public Facade examples

Run against the same factory instance after `data-ready="true"`. These update real native images, not host overlays:

```ts
import { TextWrappingStyle } from '@univerjs/preset-docs-drawing'

const doc = univerAPI.getActiveDocument()!
doc.getImage('inline')!.setWrappingStyle(TextWrappingStyle.WRAP_TOP_AND_BOTTOM)
doc.getImage('rotated')!.setSize(180, 112.5)
doc.getImage('rotated')!.setRotate(15)
```

The original SVG and authored paragraph anchors are in `data.ts`. Internal anchor IDs are not displayed in the document text. The native crop initialization check passing does not certify post-render crop edits or the complete SDK drawing API.
