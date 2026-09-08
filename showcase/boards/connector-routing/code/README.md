# Release workflow: native connector routing

Native UI, demo labels and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged. Earlier bilingual acceptance reports below remain historical evidence, not validation of this English-only revision.

Run `pnpm install`, `pnpm dev`; use `pnpm build` and `pnpm preview` for production.
Preview and independent export use the same factory, eight official CSS bundles and complete eight-pack English locales, including transitive Embed Unit UI.
The native runtime is always English. Theme changes preserve the current SDK owner and edits.
Canvases uses its own native floating toolbars and contextual editing, not a recreated full office ribbon.

## Business diagram

The original eight nodes, two decisions, twelve directed relationships and initial detached Promotion are retained.
The authored business labels are now real editable connector labels. Teal routes advance the release; dashed ochre routes
enter quarantine; the purple manual west-side path retries a signed commit; the blue curved path deploys to staging.
Red Promotion remains deliberately disconnected until you attach it. These are original local diagram objects, not images.

Select a connector to open the native floating toolbar. Compare its routing and endpoint markers, drag a connected
Tests decision, and observe all incident lines. Double-click a label to edit its actual text. Use native Undo/Redo or
keyboard history. No host selection/property/history/fixture/route-inspector panel is mounted.

Known SDK limitation in the pinned build: native label text editing resets the existing label offset to `{ x: 0, y: 0 }`
and drops its background/line-break style. The edited text and native Undo/Redo work, but label placement is not preserved.
The demo deliberately does not reposition the label or reconstruct its style after editing.

Straight and curved routes do not guarantee obstacle avoidance. Manual waypoints are explicit Canvas coordinates;
free endpoints are not bound to a nearby shape. Rounded elbows, labels, line styles and connection identities are
separate properties. Programmatic reads below do not replace rendered-route or pixel verification.

## Literal Facade variants

Run these blocks in order on a fresh demo in DevTools against `window.univerAPI`.
Each block is directly executable at its documented step. Block 14 intentionally throws for a missing target.
Blocks 18-19 replace the document under the same owner: save needed work first; history and viewport are not persisted.

### 1. Inspect real endpoints and routing

```ts
window.univerAPI.getActiveBoard().getConnectorConnection('tests-quarantine')
```

### 2. Take the direct failure path

```ts
if (!window.univerAPI.getActiveBoard().setConnectorConnection('tests-quarantine', { routing: 'straight', routingMode: 'auto', waypoints: [] })) throw new Error('Routing rejected')
```

### 3. Compare a curved failure path

```ts
if (!window.univerAPI.getActiveBoard().setConnectorConnection('tests-quarantine', { routing: 'curve', routingMode: 'auto', waypoints: [] })) throw new Error('Routing rejected')
```

### 4. Place explicit review waypoints

```ts
if (!window.univerAPI.getActiveBoard().setConnectorConnection('tests-quarantine', { routing: 'freePolyline', routingMode: 'manual', waypoints: [{ id: 'failure-east', x: 520, y: 240, kind: 'manual' }, { id: 'failure-west', x: 120, y: 240, kind: 'manual' }] })) throw new Error('Routing rejected')
```

### 5. Restore automatic orthogonal routing

```ts
if (!window.univerAPI.getActiveBoard().setConnectorConnection('tests-quarantine', { routing: 'orthogonal', routingMode: 'auto', waypoints: [] })) throw new Error('Routing rejected')
```

### 6. Move the Tests decision, retaining its relationships

```ts
if (!window.univerAPI.getActiveBoard().setElementTransform('tests', { left: 535, top: 180 })) throw new Error('Move rejected')
```

### 7. Undo the decision move

```ts
if (!window.univerAPI.getActiveBoard().undo()) throw new Error('Nothing to undo')
```

### 8. Redo the decision move

```ts
if (!window.univerAPI.getActiveBoard().redo()) throw new Error('Nothing to redo')
```

### 9. Detach the failure target to a deliberate free point

```ts
if (!window.univerAPI.getActiveBoard().setConnectorConnection('tests-quarantine', { end: { kind: 'free', x: 160, y: 265 } })) throw new Error('Detach rejected')
```

### 10. Reattach the quarantine upper connection site

```ts
if (!window.univerAPI.getActiveBoard().setConnectorConnection('tests-quarantine', { end: { kind: 'shapeSite', shapeId: 'quarantine', connectionSiteId: 0 } })) throw new Error('Attach rejected')
```

### 11. Connect the initially detached promotion

```ts
if (!window.univerAPI.getActiveBoard().setConnectorConnection('staging-release', { end: { kind: 'shapeSite', shapeId: 'release', connectionSiteId: 0 } })) throw new Error('Promotion connection rejected')
```

### 12. Change the Pass route's line and arrow

```ts
if (!window.univerAPI.getActiveBoard().setConnectorStyle('tests-package', { stroke: '#7C3AED', strokeWidth: 4, dash: [8, 5], endMarker: { type: 'openArrow' } })) throw new Error('Style rejected')
```

### 13. Edit the native Pass label

```ts
if (!window.univerAPI.getActiveBoard().setConnectorLabelText('tests-package', 'Approved', { width: 84, height: 24 })) throw new Error('Label rejected')
```

### 14. Reject a missing target (intentional error)

```ts
if (!window.univerAPI.getActiveBoard().setConnectorConnection('tests-package', { end: { elementId: 'missing-target', side: 'left' } })) throw new Error('SDK rejected missing-target; the graph is unchanged')
```

### 15. Remove only a connector label

```ts
if (!window.univerAPI.getActiveBoard().removeConnectorLabel('tests-package')) throw new Error('Label removal rejected')
```

### 16. Undo label removal

```ts
if (!window.univerAPI.getActiveBoard().undo()) throw new Error('Nothing to undo')
```

### 17. Save the current local document

```ts
window.releaseWorkflowSnapshot = structuredClone(window.univerAPI.getActiveBoard().save())
```

### 18. Open an empty native workflow page

```ts
{
  const api = window.univerAPI
  const data = structuredClone(api.getActiveBoard().save())
  window.releaseWorkflowSnapshot = structuredClone(data)
  api.disposeUnit(data.id)
  api.createBoard({
    id: data.id,
    name: 'Empty release workflow',
    theme: data.theme,
    activePageId: 'workflow',
    pageOrder: ['workflow'],
    pages: { workflow: { id: 'workflow', name: 'Release workflow', pageType: data.pages.workflow.pageType, elements: {}, elementOrder: [] } },
  })
}
```

This is a new blank document, not an edited persisted snapshot: the original `save()` includes serialized plugin resources and is retained intact for restoration.

### 19. Restore the saved workflow under the same SDK owner

```ts
{
  const api = window.univerAPI
  api.disposeUnit(api.getActiveBoard().getId())
  api.createBoard(structuredClone(window.releaseWorkflowSnapshot))
}
```

## Verification boundary

The dedicated `scripts/test-board-connector-native.mjs` builds only this case's independent export and checks
actual painted labels, rendered connector routes/endpoints, the literal variants, native selection/routing/drag/text,
history, initial Chinese native controls and same-owner theme. Model-only mutations are not sufficient evidence.
Any native failure or route warning remains in the strict report; no SDK or dependency patches are used.
Keyboard accessibility beyond exercised interactions, full routing collision avoidance and backend collaboration are not certified.

Current independent acceptance: `test-results/connector-native-complete/report.json` records **31 passed / 1 failed**
gates, including **19/19 literal blocks**. The failure is `native-label-offset-preservation`; the report retains complete
before/after label data, and `native-label-edited.png` shows the displacement. Native free-endpoint dragging and connected
node dragging both verify actual rendered endpoints and native history. Free-endpoint history additionally passes a separate
complete serialized-model Undo/Redo comparison, preserving all four snapshots without omitting derived fields.
Every mutating non-replacement literal also checks
changed document data and changed canvas pixels. Initial Chinese startup, all seven EN/ZH packs/CSS, owner-preserving theme,
empty/restore, disposal, and zero backend requests/runtime errors pass. The manifest is
`test-results/connector-native-complete/exports.json`; earlier `connector-native*` runs remain historical, not the latest verdict.
The separate `test-results/connector-native-export-ui/report.json` verifies all nine exported source files, official white SDK UI,
actual text paint and an absent startup skeleton; it is not a substitute for the strict native interaction report.
