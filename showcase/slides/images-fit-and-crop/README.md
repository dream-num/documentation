# Images: aspect ratio, crop and replacement

Three native slides use original self-contained SVG artwork. Edge markers expose
cropping; a second source changes the sun and background. No upload server,
remote asset, custom image renderer or duplicate host controls are involved.

Fit here means proportional frame dimensions, not an automatic object-fit API:
600 × 400 artwork becomes 360 × 240 or 240 × 160. The crop page trims 25% from
each horizontal edge and uses a 180 × 240 frame for the remaining 300 × 400
source. The image Facade crop fields are logical frame offsets, not percentages:
left/right 90 with visible width 180 expand to a 360-wide image before clipping.
This avoids stretching. Replacement retains the original frame.
English UI and data also apply on Chinese host pages. Preview and export share
the same factory, complete required English locale packs and official CSS.

Select an image and use the native Format Shape panel, Position, Start Crop.
Drag a crop handle and click outside to apply. Source replacement below is a
public Facade recipe, not a claim that a native replacement button exists.

## Public Facade recipes

Run each complete block after startup. The focused browser test executes these
literal code fences and checks model readback plus screenshots.

Resize proportionally:

```ts
const slide = univerAPI.getActivePresentation().getSlideById('fit')
slide.getImages()[1].setSize(300, 200)
```

Change the source crop and its matching frame:

```ts
const slide = univerAPI.getActivePresentation().getSlideById('crop')
slide.getImages()[1].setSize(288, 240).setCrop({ left: 36, right: 36, top: 0, bottom: 0 })
```

Replace the first source with the second without moving the frame:

```ts
const slide = univerAPI.getActivePresentation().getSlideById('replace')
const [before, after] = slide.getImages()
before.setSource(after.getSource(), univerAPI.Enum.ImageSourceType.URL)
```

Insert a small copy with the image builder:

```ts
const slide = univerAPI.getActivePresentation().getSlideById('fit')
slide.insertImage(slide.newImage('inserted-copy')
  .setSource(slide.getImages()[0].getSource(), univerAPI.Enum.ImageSourceType.URL)
  .setAbsolutePosition(855, 290).setSize(120, 80).build())
```

## Verification boundary

Native thumbnail navigation and crop editing require actual browser acceptance;
a saved crop field alone is insufficient. The focused check keeps page/console
errors visible, compares image draw calls, executes the recipes, and checks full
edited snapshots and owner retention through host theme changes. Reload starts
over; persistence, image effects, conversion and backend upload are out of scope.
No SDK patches or license hiding.
