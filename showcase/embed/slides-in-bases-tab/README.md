# Avenue / Slides in a native Base tab

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier  English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

Eight original campaign deliverables belong to three linked channels. Open
Campaign review in the native Base sidebar to present four editable slides:
the invitation, CNY 9,600 allocation, three learning weeks and readiness
questions. Nine sessions and 72 seats are planning assumptions, not results.

## Run and explore

Use the native Bases and Slides thumbnails, Grid ribbon and canvas.
There is no fixture selector, reset panel or duplicate editing toolbar.
Start the independent export with pnpm install and pnpm dev.

The deck opens at The invitation. This exact Facade example changes its first
title paragraph; it does not update any Base record:

```ts
const text = window.univerAPI
  .getPresentation('avenue-campaign-review')
  .getSlideById('brief')
  .getShape('cover-title')
  .getText()
const rich = text.getRichText().copy()
rich.getParagraphs()[0].getTextRuns()[0].setText('Start small.')
text.setRichText(rich)
```

Use native Undo and Redo, select a shape and move it with an arrow key, or edit
its text directly. Visit all four native thumbnails, then return to Deliverables:

```ts
window.univerAPI
  .getBase('avenue-campaign-operations')
  .getTableById('deliverables')
  .getRecordById('deliverables-1')
  .setValue('next', 'Confirm opening hours with each studio')
```

In Channels, rename Studio partners to Local studios. The three linked
deliverables should show the new label while retaining their channel IDs.
The deck remains unchanged: it shares authored starting assumptions, not live
formulas, record links or synchronized text. Its bars are editable native
shapes, not an interactive chart or Formula Shape integration.

## Integration and acceptance

Preview and standalone export use the same createDemo factory. Eight official
stylesheets cover Design, UI, Docs, Drawing, Bases, Slides, Shape editor and
Embed. Base keeps its native sidebar and controls; Slides uses Grid.

The local provider accepts only the exact presentation ID and slide unit type.
Prepare, materialize and restore create a BasesTableListBlock anchor with
tableIndex/tableName and an initial brief page. Owned child roots are released
before SDK teardown. SDK packages and license watermarks are unchanged.

Failed early interaction reports are retained. The first paint locator selected
small sidebar-card text rather than the title; the final locator includes the
actual font size and glyph position. The native text controller ignores pointer
focus changes for 300ms after entering editing, so the test waits 350ms before
leaving that mode. The first native text commit materializes internal document
defaults and IDs; the test enters/leaves once, then strictly compares the whole
presentation before/after typing Undo/Redo. Original-structure restoration on
the very first native text commit is not certified. The SDK is not patched.

Full menus/playback, failed/empty/delayed providers, repeat mounts, persistence,
narrow/touch layouts, accessibility and performance remain open. Grid history
icons expose command IDs but lack accessible names. Independent build: 206
offline packages, main JS 18,429.75 kB / 4,539.13 kB gzip, CSS 150.83 / 21.61 kB.
Cold selected Next guide/playground requests took 51s/30.1s and emitted a Gzip
listener warning. No Exchange conversion or Print output is claimed.

The saved Feishu marketing-plan reference informs the four-part story, while
the user-provided Deep Ocean palette informs the colors. Dark navy, sky blue,
lavender, coral, warm white and sea green vary across pages. All campaign
content and geometry are original; competitor artwork is not redistributed.
There is no backend, publishing, approval, consent workflow, advertising
purchase, messaging or visitor tracking. Reload discards local edits.
