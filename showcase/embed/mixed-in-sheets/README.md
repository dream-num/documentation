# Harbor / Operations decision room

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier  English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

An original fictional reading-room pilot brings five products into one workspace:
the budget Sheet, a three-page Slides Float, and separate native Docs, Base and
Board Tabs. Four weekends, eight sessions and 96 planned places give the
discussion a concrete scope. Six suppliers have six linked follow-ups.

The saved Gamma budget-review and Notion project-brief references inform visual
hierarchy and narrative structure only. No competitor artwork is redistributed.
Deep navy/cyan briefing, warm budget inputs, lavender memo headings and mint/amber
workflow cards vary the story; official white SDK surfaces remain untouched.

## Run and explore

Run pnpm install and pnpm dev in the independent export. Start on Pilot budget.
The initial USD 6,628 direct cost plus ten-percent reserve gives USD 7,290.80,
leaving USD 709.20 against the USD 8,000 planning ceiling. Change kit quantity:

```ts
window.univerAPI.getWorkbook('harbor-room-budget').getSheetByName('Pilot budget').getRange('B7').setValue(108)
```

The new envelope should be USD 7,528.40 and headroom USD 471.60. Written numbers
in the memo and briefing intentionally remain the opening baseline. They are
not cross-product formulas. The native tabs provide room for distinct tasks:

```ts
window.univerAPI.getDocument('harbor-room-rationale').getParagraphs()[1].appendText(' Revised.')
```

```ts
window.univerAPI.getBase('harbor-room-suppliers').getTableById('suppliers').getRecordById('suppliers-3').setValue('note', 'Confirm 108 kit contents before accepting the revised quote.')
```

```ts
window.univerAPI.getBoard('harbor-room-workflow').getShape('prepare').getText().setText('Prepare materials\nMaya / In review')
```

Use native editing, Undo/Redo and tab navigation. Do not infer approval from
Ready labels or assume a workflow arrow sends an assignment. The products share
a subject, not an automatic data synchronization layer.

## Acceptance and limits

The initial production run failed with duplicate editor-service registration:
Slides already starts the root service, while Board startup also installs its
runtime dependency list. This example adds the public Board child-scope extension
after creating the Board, before its child view mounts. No SDK package is patched
and no dummy unit is added. The subsequent startup initially selected the last
native Tab; FWorkbook.setActiveSheet now returns to Pilot budget. Input cells have
explicit numeric types, and headroom rounds to cents. This preserves strict
history assertions instead of hiding numeric-type or floating-point differences.

Earlier reports remain in embed-mixed-sheets-production, scoped-editor,
budget-start, rounded, examples and history under test-results (each directory
uses the embed-mixed-sheets- prefix). Title hyphenation paints Re-/vised. across
lines; the test asserts exact stored text and accepts that visible native split.
The first Next guide probe held a detached iframe after refresh; a re-locating
frame wait and same-server recheck pass, without certifying general load reliability.

Full native menus, keyboard editing/history in every product, Slides text editing
and fullscreen, connector drag/routing in this composition, save/resource reload,
failed/empty/pending sources, repeated mounts, disposal from each active child,
small screens, accessibility and performance remain open. Selected build: 1858
modules, main JS 18629.25 kB (4590.89 kB gzip), CSS 162.97 kB (23.56 kB gzip).
Cold Next guide/playground took about 68/24 seconds with a Gzip listener warning.
Passing selected paths is not complete mixed-Embed acceptance.

All names, dates and estimates are synthetic. No bookings, orders, participant
data collection, dispatch, notifications, Exchange conversion or Print/PDF output.
No license watermark removal. Reload restores the authored data and loses edits.

The shared factory explicitly imports the official Ink UI English pack and CSS
required by the registered Boards UI dependency. Other product locale packs and
styles remain intact. This is resource coverage, not native pen acceptance.
