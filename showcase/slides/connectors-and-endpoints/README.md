# Connectors and endpoints

Three concise native Slides compare a straight connector, an elbow connector, and a connector with only its start bound. Coral and mint are real shapes; blue lines are real connector shapes, not text arrows or host SVG overlays. The first two bind both endpoints to actual connection-site indices. Drag a connected shape with the native pointer tool to observe the resolved route.

The native Grid ribbon is the only control surface. Preview and standalone share six complete English locale packs and official CSS, including transitive Shape Editor and Embed Unit UI. Native UI stays English on Chinese host pages. Theme changes preserve the owner and edited presentation. Trial notices remain visible. Initial canvas fitting uses the exported SetSlideZoomRatioOperation and render services, separate from these public Facade edits.

## Four literal recipes

Run after startup in order. Navigate to the named slide using its native thumbnail to see each effect.

### 1. Move the bound target on the straight slide

```ts
const slide = window.univerAPI.getActivePresentation().getSlideById('straight')
slide.getShape('straight-b').setTransform({left:700,top:220})
console.log(slide.getShape('straight-connector').getEndEndpoint())
```

### 2. Bind the free endpoint to the mint shape

```ts
const slide = window.univerAPI.getActivePresentation().getSlideById('free')
const target = slide.getShape('free-b')
const site = target.getConnectionSites().toSorted((a,b)=>a.x-b.x)[0]
if (!site) throw new Error('No native connection site')
slide.getShape('free-connector').bindEnd(target.getId(),site.index)
```

### 3. Release that endpoint and choose a free position

```ts
const slide = window.univerAPI.getActivePresentation().getSlideById('free')
slide.getShape('free-connector').unbindEnd().setEndPoint({x:570,y:460})
```

### 4. Change the elbow arrowhead

```ts
const api = window.univerAPI
const slide = api.getActivePresentation().getSlideById('elbow')
slide.getShape('elbow-connector').setEndArrow(api.Enum.ShapeArrowTypeEnum.DiamondArrow)
console.log(slide.getShape('elbow-connector').getRoutePoints())
```

`getRoutePoints()` returns interior route points in this version: an empty array for a straight connector, and two bend points for this elbow. Read `getStartEndpoint()` and `getEndEndpoint()` separately for its ends; do not interpret an empty interior route as an invisible connector.

The first recipe makes the connected sites horizontal. This SDK keeps connector transform height at least 1, so the resolved ends are at y=289.5 and y=290.5 rather than both exactly y=290. The binding IDs remain intact; this half-pixel geometry limit is not corrected in demo code.

These examples do not claim obstacle avoidance, diagram auto-layout or automatic semantics. A free endpoint deliberately does not follow the mint shape. Native pointer movement, public binding readback and literal recipe paint are separate acceptance checks; unsupported behavior is not emulated in host code.
