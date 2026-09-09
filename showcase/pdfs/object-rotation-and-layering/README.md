# Object rotation and layering

Two native PDF pages compare six editable text transformations and two text/divider stacking arrangements. Reflections transform visual geometry; the underlying text remains `Gate B / 12`. Amber bars are native vector dividers, not CSS overlays or embedded images.

Use native page thumbnails and zoom controls; 75% shows the complete page at the preview's default height. Labels describe initial states and do not change when recipes modify the specimens. This demo does not inject a private runtime service to fit or navigate the PDF.

## Public Facade recipes

Rotate the original text without resizing:

```ts
const page = univerAPI.getActivePdf().getPageByIndex(0)
page.getElements().find(e => e.getId() === 'original').setRotation(45)
```

Reset horizontal reflection while retaining placement:

```ts
const page = univerAPI.getActivePdf().getPageByIndex(0)
const text = page.getElements().find(e => e.getId() === 'flip-x')
text.setTransform({ ...text.getTransform(), flipX: false, flipY: false, rotation: 0 })
```

Bring the lower text above its divider:

```ts
const page = univerAPI.getActivePdf().getPageByIndex(1)
page.getElements().find(e => e.getId() === 'divider-front').bringToFront()
```

Send the upper text behind its divider:

```ts
const page = univerAPI.getActivePdf().getPageByIndex(1)
page.getElements().find(e => e.getId() === 'text-front').sendToBack()
```

Coordinates are PDF points; rotation uses degrees around the element center. Layer changes alter element order, not text or geometry. These recipes do not certify native drag-to-model synchronization, which is separate from public API transforms. Native property input, API updates and pointer dragging must be checked independently. Export fidelity and general vector-shape insertion are outside this case's scope.

For native position editing, select a text specimen and open **View → Properties**. The installed panel exposes X, Y, W and H in pixels; these differ from the Facade's PDF-point units. Rotation and reflection are demonstrated through the public recipes above, not a numeric rotation field in this panel.
