# Grouping and stacking

Three original slides compare two independent cards, the same pair in a real native group, and two overlapping cards. All editing uses the native Grid editor; there are no host buttons. English locale packs and official CSS for Design, UI, Docs UI, Shape Editor UI, Embed Unit UI and Slides UI travel with the shared factory. The actual Preview preserves the owner and edits through theme changes.

Shift-click the two cards on the first slide, then use Shape Format → Group. On the second slide, select the group and use Shape Format → Ungroup. On the third, select the visible coral edge and use the native Bring to Front or Send to Back ribbon button. Hover the icon buttons to read their labels. Static captions describe the initial state only.

## Public Facade recipes

Run these blocks in order in the browser console. Use the native thumbnails to inspect the named slide. The grouping recipes operate on actual group records, not a host list of IDs.

```ts
const slide = window.univerAPI.getActivePresentation().getSlideById('independent')
slide.group(slide.getElements().filter(element => ['independent-a', 'independent-b'].includes(element.getId())))
```

```ts
const slide = window.univerAPI.getActivePresentation().getSlideById('independent')
slide.getGroups()[0].ungroup()
```

```ts
const slide = window.univerAPI.getActivePresentation().getSlideById('stacking')
slide.getShapes().find(shape => shape.getId() === 'stacking-a').bringToFront()
```

```ts
const slide = window.univerAPI.getActivePresentation().getSlideById('stacking')
slide.getShapes().find(shape => shape.getId() === 'stacking-a').sendToBack()
```

## Boundaries

No native slide-table API or element alignment/distribution Facade was found in the inspected installed declarations. This gallery does not imitate either with drawn cells or host coordinate calculations. It does not claim nested-group scaling, atomic multi-command history or file conversion. Native behavior and actual paint need runtime evidence; model records alone are not full visual acceptance. SDK code and license notices are unchanged.

In the selected runtime, right-click and Shift+F10 did not open the expected object context menu after group selection. The native Shape Format ribbon is the verified route; the missing context-menu behavior is not patched or hidden.

The shared factory fits the editor with the exported `SetSlideZoomRatioOperation` and render/instance services, as in the existing image gallery. That viewport integration is separate from the four public Facade editing recipes above.
