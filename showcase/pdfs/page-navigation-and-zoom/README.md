# Page navigation and zoom

Four original shore-notebook pages contrast tall, wide, square and narrow geometry.
Unlike the mixed-content viewer, this gallery focuses on navigation state: click a
native thumbnail's page-number area to fit that page; use the footer page number to navigate without
requesting a new fit. Native zoom presets change magnification, not document geometry.
Try 100% on the tall itinerary, jump to page 2 through the footer, then click its
page-number area beneath its thumbnail to fit the wide route strip. The native sidebar can scroll to page 4.
The blue overlay on an active thumbnail is a draggable viewport indicator, not the
page-selection target. Use the zoom dropdown presets for the 100% and 50% comparison.

There is no custom viewer, navigation bar or host zoom button. Initial fitting uses
the installed exported `IPdfEditorRuntimeService`; that service is not a PDF Facade.
No standalone Fit width menu is claimed. The thumbnail fit has SDK zoom limits.

## Literal Facade readback

Navigation and zoom are native UI operations. These three independent recipes inspect
the durable document rather than pretending that a navigation Facade exists.

```ts
const pdf = univerAPI.getActivePdf()
console.log(pdf.getPages().map(page => [page.getIndex(), page.getId()]))
```

```ts
const pdf = univerAPI.getActivePdf()
console.log(pdf.getPages().map(page => ({ id: page.getId(), size: page.getData().size })))
```

```ts
const pdf = univerAPI.getActivePdf()
console.log(pdf.getPageById('route').getTextBoxes().map(text => text.getText()))
```

## Scope

Five complete English packs and five official stylesheets accompany the independent
factory shared by Preview and export. Grid is configured; the PDF workbench owns its
toolbar, thumbnails and footer. Theme changes preserve the owner. Trial notices remain.

The document is an editable SDK snapshot, not imported PDF bytes. Binary import/export,
print, OCR, bookmarks, fit-width, pinch gestures and keyboard accessibility are not
certified. Native interactions and exact saved-content preservation require separate
runtime acceptance; configured pages alone do not prove viewport behavior.
