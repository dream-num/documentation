# Ripple / Complete Planning Workshop

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier EN/ZH reports below describe historical interaction runs,
not current bilingual SDK acceptance. English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

A fictional riverfront wayfinding workshop plans for 32 participants, four tables
and 90 minutes. Four native Canvas Floats contain a resource Sheet, a modern agenda
Doc, three review Slides, and a Relational Table with eight observations linked to three
locations. A four-step native connector loop describes the conversation.

## Explore the native workshop

Start with the Canvas overview. Double-click a floating product for native editing
tools and use its native fullscreen action for detailed work. Return to the Canvas
to compare budget, narrative, review and evidence. The Canvas keeps its native
floating toolbar; child Grid ribbons appear where applicable. There is no custom
product switcher, fixture panel or iframe child substitute.

The resource model starts at USD 1,632 direct cost plus USD 163.20 reserve, for a
USD 1,795.20 envelope. Change B5 from 32 to 40 feedback cards: direct cost becomes
1,652 and the total becomes 1,817.20. Written totals in Docs and Slides are authored
baselines, not live Formula Shapes. Each product owns independent local data.

## Five literal Facade examples

Open the named product with its native tools before running each example in the
preview frame or standalone demo console. For the Canvas example, exit fullscreen
and focus the host. These examples add no redundant toolbar controls.

### 1. Workshop budget / Revise feedback-card quantity

```ts
window.univerAPI.getWorkbook('ripple-wayfinding-budget').getSheetByName('Workshop budget').getRange('B5').setValue(40)
```

### 2. Facilitation agenda / Revise the narrative

```ts
window.univerAPI.getDocument('ripple-wayfinding-agenda').getParagraphs()[1].appendText(' / Revised')
```

### 3. Wayfinding review / Revise the headline

```ts
window.univerAPI.getPresentation('ripple-wayfinding-review').getSlideById('cover').getShape('title').getText().setRichText(window.univerAPI.newRichText().span('Name the turn.\nShare the route.', { fontSize: 45, color: '#F5F7FF', bold: true }))
```

### 4. Observations / Clarify a next question

```ts
window.univerAPI.getBase('ripple-wayfinding-observations').getTableById('observations').getRecordById('observations-2').setValue('next', 'Compare two return-direction labels using the same landmark.')
```

### 5. Workshop Canvas / Refine the discussion loop

```ts
window.univerAPI.getBoard('ripple-wayfinding-workshop').getShape('revise').getText().setRichText(window.univerAPI.newRichText().span('REVISE / 20 MIN\nCompare the next draft', { fontSize: 18, color: '#344C59', bold: true }))
```

## Source, styling and ownership

Preview and independent export use the same create-demo.ts and data.ts, with all
official SDK CSS imports and a minimal container stylesheet. Navy/cyan, warm
paper, mint and plum belong to authored content, not overrides of native UI.
No license marks are removed. The cached miro-diagrams-library.png informs flow
and visual hierarchy only; all scenario content is original and no reference
artwork is redistributed.

FUniver.createEmbed and FEmbed.loadAsync create all four BoardFloating anchors.
Local resource providers match exact IDs and types, honor cancellation and reject
unknown resources. Native viewport and activation services handle fitting,
focus and cleanup; the setup is not claimed to be Facade-only. The five editing
examples above use public Facade APIs.

The Sheet Print plugin is registered. After activating the budget, the public
async command is `await window.univerAPI.executeCommand('sheet.operation.print-open')`.
The native preview captures its Sheet source before leaving fullscreen. The
selected runtime check confirms the budget source, one A4 page and native Cancel.
This case does not claim Exchange conversion, produced PDFs, cross-product formula
binding, collaborative history, bookings, purchases, installed signs or approvals.

## Acceptance status

Selected evidence is partial, not complete acceptance:

- `test-results/embed-mixed-boards-final/report.json` checks all four real native
  Float/fullscreen paths, three distinct slide layouts, all five literal examples
  and complete-model isolation. Keyboard input B5=48 recalculates the total to
  USD 1,839.20. One-page budget Print/cancel, native Canvas card movement, four
  fullscreen round-trips and selected active-Relational Table-fullscreen disposal are checked.
  No browser errors or backend requests were observed in this production run.
- The strict report remains FAIL: the first Sheet Undo adds an empty validation
  array for resources. Values restore, but the full snapshot is not identical.
  No normalization hides the difference. Docs, Slides, Relational Table and Canvas literal
  history pass; subsequent Sheet keyboard history passes after initialization.
- `test-results/embed-mixed-boards-next-layout/report.json` checks EN/ZH guide
  content, all five literal examples and theme changes without replacing the API
  owner or losing edits. Only native Canvas palette regeneration with the same
  theme ID is allowed; the other four models are compared exactly.
- Independent export is checked separately for eleven exact source files,
  official white SDK background and all official CSS imports.

Earlier reports are retained. Initial setText-only examples lost the slide
headline's rich styling; the current single-mutation setRichText examples include
font size, color and weight. The first documentation check found the Relational Table menu
clipped at the right preview edge. Relational Table now sits on the left with enough room
for native menu controls; no forced click, CSS workaround or SDK patch is used.

Still required: repair/resolve strict first-Undo serialization, complete native
menus and editing paths for every child, rendered connector-following measurement,
saved resource reload, provider failure/delay/empty states, racing and background
disposal, smaller viewports, accessibility and performance. The selected build
contains 1,944 modules, approximately 18.83 MB main JS / 4.65 MB gzip; cold Next
guide/playground compilation took about 54/30 seconds with a Gzip listener warning.
These are observations, not performance acceptance. No Exchange conversion,
actual PDF file or collaborative history is claimed.

The shared factory explicitly imports the official Ink UI English pack and CSS
required by the registered Canvases UI dependency. Other product locale packs and
styles remain intact. This is resource coverage, not native pen acceptance.
