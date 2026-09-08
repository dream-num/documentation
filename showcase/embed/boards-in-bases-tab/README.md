# Cove / Boards in a native Base tab

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier  English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

The fictional equipment lending desk tracks eight different requests through
four linked touchpoints: Reserve, Collect, Use and Return. Open Service blueprint
from the native Base sidebar to see twelve editable responsibility cards in
three lanes: borrower, front desk and backstage. Seventeen native bound
connectors show sequences and handoffs. The map has 41 elements in total.

## Run and explore

Use pnpm install and pnpm dev in the standalone export. Board uses its native
floating tools; Base keeps its native table controls. There are no fixture
selectors, diagnostics panels or duplicate editing buttons.

This exact README example updates one handoff card. It does not change any Base
request or touchpoint:

```ts
window.univerAPI
  .getBoard('cove-service-blueprint')
  .getShape('desk-collect')
  .getText()
  .setText('A clear handoff\nConfirm the return desk.')
```

Use native Board Undo/Redo, edit the card directly, or move it with an arrow
key. Bound connectors should keep their endpoints attached. Return to Requests:

```ts
window.univerAPI
  .getBase('cove-lending-desk')
  .getTableById('requests')
  .getRecordById('requests-1')
  .setValue('next', 'Confirm microphone and spare battery')
```

In Touchpoints, rename Reserve to Plan a loan. Three linked request labels
should change while retaining the same record ID. The Board must stay unchanged:
its headings and arrows are a service design, not live Base fields or workflow
automation. Moving a card does not transfer ownership or change its stage.

## Integration and acceptance

One createDemo factory powers the Preview and independent export. official stylesheets cover Design, UI, Docs, Drawing, Bases, Boards, Shape
editor, Slides editor and Embed. The SDK chrome remains native; blue-gray, lavender and sand
differentiate the authored responsibilities. The local provider validates the
Board unit type and exact source ID. Prepare, materialize and restore create a
BasesTableListBlock anchor. Owned child content roots are released before SDK
teardown; SDK packages and license watermarks are not patched.

Board Embed mounts the floating editor exported by Slides UI. In beta.2,
registering the Slides plugin does not start it without a Slides unit. This
example uses UniverBoardsUIPlugin.registerRuntimeScopedDependencies with the
SDK's real EditorUIService, following the SDK's child-scoped service extension
and isolation test. No substitute editor or unrelated Slides document is created.
Boards do not accept Slides' pageId display target; activePageId selects the page.

Full menus, failed/empty/delayed providers,
repeat mounts, resource persistence, narrow/touch layouts, accessibility and
performance remain open. No Exchange conversion or Print output is claimed.

The saved Miro diagram reference informs the visible sequence and handoff
structure. All content and geometry are original; no competitor artwork is
exported. This frontend demo does not reserve equipment, contact borrowers,
process payments, approve condition checks or synchronize models. All request
IDs, people and circumstances are fictional. Reload loses local edits.

The shared factory explicitly imports the official Ink UI English pack and CSS
required by the registered Boards UI dependency. Other product locale packs and
styles remain intact. This is resource coverage, not native pen acceptance.
