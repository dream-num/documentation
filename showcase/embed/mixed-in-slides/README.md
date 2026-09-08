# Beacon / Complete executive review

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier EN/ZH reports below describe historical interaction runs,
not current bilingual SDK acceptance. English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

An original neighborhood repair-network pilot: three hubs, twelve clinics and
144 planned places. Four authored slides use ocean navy/cyan, warm white with
three colored hub cards, a pale cost page, and a plum checkpoint with mint/coral
panels. The reference Gamma deal-review composition informs hierarchy only; no
competitor artwork is redistributed. Native SDK UI stays white and Grid.

## Native composition

- Cover, scope, economics and decision are editable 1000 × 562.5 Slides pages.
- The economics page owns a native Sheet Float.
- Decision memo, readiness register and delivery map are native page-list entries,
  not iframes or flattened screenshots.
- Six readiness gates link to three hubs. The Board has seven cards, eight bound
  connectors and two revision paths. Nothing schedules clinics or sends orders.
- Preview and standalone entry import the displayed `create-demo.ts`. Its official
  host/child/Embed CSS imports travel with the independent source export.

The beta.2 native Slides page-list path follows `slides-embed-local`: prepare a
descriptor, materialize its child, then restore the native page anchor.
`createEmbed().loadAsync()` is used directly for the floating Sheet. The page-list
setup uses exported SDK services, not a claimed Facade-only implementation.
All five editing examples below use actual Facade methods. Use native ribbon
controls for operations already available there; there is no fixture panel.

## Try it

Use the left native page list, then inspect the economics Sheet. Eight cost lines
sum to USD 7,286; a 7% reserve produces USD 7,796.02. Change B8 from 144 to 156:
the requested kit cost increases by USD 114 and the envelope becomes USD 7,918.00.
Written figures and Slides claims are independent authored content, not Formula
Shapes or cross-product formulas.

Open each native product page before running its literal example in the browser
console. `window.univerAPI` is this demo's API owner.

### 1. Revise replacement-kit quantity

```ts
const sheet = window.univerAPI.getWorkbook('beacon-repair-costs').getSheetByName('Pilot costs')
sheet.getRange('B8').setValue(156)
```

### 2. Update the decision memo

```ts
window.univerAPI.getDocument('beacon-repair-memo').getParagraphs()[1].appendText(' / Revised')
```

### 3. Revise a readiness note

```ts
window.univerAPI.getBase('beacon-repair-readiness').getTableById('gates').getRecordById('gates-2').setValue('note', 'Inventory count requested for eighteen shared tool sets.')
```

### 4. Revise a workflow card

```ts
window.univerAPI.getBoard('beacon-repair-delivery').getShape('kits').getText().setText('Count tools and kits\nSana / In review')
```

### 5. Revise the host headline

```ts
window.univerAPI.getPresentation('beacon-repair-review').getSlideById('cover').getShape('title').getText().setText('Repair together.\nLearn locally.')
```

## Selected evidence / not complete

The strict runner `scripts/test-embed-mixed-slides.mjs` retains failed gates and
continues independent checks. Its async-print run verifies the seven-entry native
page order, four distinct slide layouts, all four children, five literal Facade
examples with five-model isolation, native Docs/Base/Board/Slides Undo/Redo,
native Sheet input from 156 to 168 and full history after initialization, page
round trips and selected active-Board disposal. No browser errors or backend
requests were observed in that independent build.

Two gates remain failing: first Sheet Undo serializes empty validation data as
`{resources:[]}` instead of `{}`, and the native Sheet Float fullscreen button
does not open its shell. Values restore in the first case; data loss is not
established. The fullscreen behavior also occurs in Tamar's independent
Sheet@Slides case; no replacement button or SDK package patch is used.

For Print preview, activate the Sheet and call the public asynchronous Facade
command: `await window.univerAPI.executeCommand('sheet.operation.print-open')`.
The selected check observes the correct workbook/sheet, one page and native
Cancel. This is not a produced PDF. In beta.2, `openPrintDialog()` dispatches its
async handler synchronously and throws; `print()` confirms printing rather than
opening preview. Both initial probes are retained in the test reports.

After the print source is captured, the demo calls the SDK's scoped
`EmbedActivationService.clearFloating()` for its own Sheet. This removes the
floating editor toolbar from the print preview without overriding SDK CSS.
Cancel and subsequent native editing are checked; an empty chrome positioning
container may remain, but the actual editor menu must be hidden.

The EN/ZH guide/theme check passes after opening each product before its example.
Trying to mutate the as-yet-unmounted Sheet from the cover hits an SDK auto-height
render dependency; the README workflow requires activating the corresponding
product. All five edited models and the API owner survive theme changes, except
the native Board palette regeneration with its same theme ID. The independent
export checks eleven exact files and all official CSS imports.

The native keyboard probe initially appended text or lost characters. Explicit
cell editing and selection, then returning focus to a neutral Sheet cell before
history shortcuts, verifies the intended edit without bypassing native input.
Initial failed reports remain. Fullscreen, every editing/selection/menu path,
saved reload, failures, repeated/racing mounts, all disposal paths, small screens,
accessibility and performance still need acceptance. Cold Next compilation was
about 58s for the guide and 19s for the playground, with a Gzip listener warning;
the selected production build is about 18.8 MB JS / 4.65 MB gzip. Not performance
acceptance.

Sheet Print is registered; generated PDF and whole-presentation printing are not
claimed. No Exchange conversion is registered in this case. Browser reload resets
the authored snapshots. No backend, participant data, collaboration history or
cross-product Formula binding is part of this review.

The shared factory explicitly imports the official Ink UI English pack and CSS
required by the registered Boards UI dependency. Other product locale packs and
styles remain intact. This is resource coverage, not native pen acceptance.
