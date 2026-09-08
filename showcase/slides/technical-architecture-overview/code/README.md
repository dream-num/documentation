# Technical Architecture Overview

The runtime is English-only on every host page. Complete official English SDK packs
and styles are retained. A legacy locale argument, where present, is ignored without
shifting the saved-snapshot argument.

Three authored slides explain component boundaries, host-to-Facade intent and local
snapshot ownership. The original Host Application, Univer Runtime, Render Engine
and Local Data Layer remain, with editable labels and speaker notes. Navy, teal,
violet and warm paper distinguish the pages. These are conceptual integration
diagrams, not an automatically discovered SDK call graph.

Use native Grid tools for position, alignment, text and styling. No external move,
reset, fixture or raw-readback panel remains. Arrows are authored text, not bound
connectors: moving a component does not reroute them automatically.

## Literal Facade recipes

Run these in sequence inside the demo frame. All objects are actual SDK shapes.

### 1. Move the local data layer

```ts
window.univerAPI.getPresentation('technical-architecture').getSlideById('component-map').getElementById('data-layer').setAbsolutePosition(735, 405)
```

### 2. Move its separate flow label

```ts
window.univerAPI.getPresentation('technical-architecture').getSlideById('component-map').getElementById('data-flow').setTransform({ left: 735, top: 350 })
```

### 3. Explain the authored change

```ts
window.univerAPI.getPresentation('technical-architecture').getSlideById('component-map').getElementById('validation').getText().setText('Layout: Local Data Layer and label moved')
```

### 4. Record a review note

```ts
window.univerAPI.getPresentation('technical-architecture').getSlideById('component-map').setSpeakerNotes('Review the host command boundary before discussing local model ownership. Arrows are independent labels.')
```

### 5. Read the recovery page

```ts
window.univerAPI.getPresentation('technical-architecture').setActiveSlide(window.univerAPI.getPresentation('technical-architecture').getSlideById('recovery'))
```

### 6. Save the complete model

```ts
window.architectureSaved = window.univerAPI.getPresentation('technical-architecture').save()
```

## Owner reconstruction

Keep your controller in the host. Capture the edited model, dispose the old owner,
and recreate from the same snapshot identity. This is local SDK JSON, not binary
office import/export. The previous Undo stack is not included in that promise.

```js
import { createArchitectureOverviewDemo } from './src/create-demo'
const container = document.getElementById('app')
let controller = createArchitectureOverviewDemo(container)
await controller.ready
const saved = controller.univerAPI.getPresentation('technical-architecture').save()
controller.dispose()
controller = createArchitectureOverviewDemo(container, false, undefined, saved)
await controller.ready
```

## Delivery and verification

Preview and standalone use the same factory, five official CSS files and five
complete English locale packs. Theme changes update the existing owner. No backend,
custom diagram renderer, fake command dispatcher or SDK patch is used. Selected
rendering and all six literal snippets pass. The native interaction report is strict
16/17: actual rendered shape positions and label changes, native text/full history,
same-ID whole-owner reconstruction with fresh editing, empty restore, initial EN/ZH
packs and idempotent disposal pass. The nine-file standalone CSS/source check passes.

Known boundary: Ctrl+Z/Y directly after Save in the notes area does not route to the
presentation. Selecting a native slide shape first passes complete notes history;
the demo adds no custom focus or history workaround. Mobile, exhaustive editor
paths and binary conversion are not accepted by these selected checks.
