# Kite / A retrospective Board as a native Slides page

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier EN/ZH reports below describe historical interaction runs,
not current bilingual SDK acceptance. English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

A fictional community makerspace runs a 45-minute volunteer retrospective:
five minutes to frame the question, twenty-five to capture and cluster, and
fifteen to choose small experiments. Seven contributors share nine authored
observations. The follow-up proposes a two-shift buddy trial, one loan shelf
and a five-minute closing checklist, reviewed after two weeks.

Open **Retrospective Board** in the native page list. It is a complete Board
page, not a floating card, iframe or screenshot. Nine editable native shape
cards sit in Keep / Change / Try columns. Dragging a card changes its position,
not an underlying category field. No voting, automatic clustering or task
assignment is simulated. There is no fixture selector or duplicate toolbar.

## Code that matches the preview

Change the proposed buddy experiment without changing the host presentation:

```ts
window.univerAPI
  .getBoard('kite-shift-retrospective')
  .getShape('buddy')
  .getText()
  .setText('Buddy trial\nStart next Saturday.')
```

Change the host heading without replacing the Board:

```ts
window.univerAPI
  .getPresentation('kite-volunteer-workshop')
  .getSlideById('kickoff')
  .getShape('title')
  .getText()
  .setRichText(
    window.univerAPI.newRichText().span('A better shift\nstarts together.', {
      fontSize: 55,
      bold: true,
      color: '#F5F1E8',
    }),
  )
```

Slide commitments and Board notes remain independent, not formula-linked.
Native history affects the focused child. Typing can create multiple history
entries: the verified ` Reviewed.` insertion took three Undo steps to restore
the complete pre-edit snapshot, and three Redo steps restored the committed edit.
Click outside the text editor to commit; Escape cancels editing. Reload restores
initial data, not persisted changes.

## Integration and current acceptance

The self resource provider creates only the requested Board. Native page setup
follows the SDK local Slides example: prepareCreateEmbed, materializeDescriptor,
then restoreEmbed. The same factory powers Preview and standalone source, with
official Design, UI, Docs, Drawing, Slides, Shape Editor, Boards and Embed
styles. Host slides use Grid; the child uses native Board tools.

Selected production verification at 1220px passes native menu Undo/Redo,
keyboard history, card selection and ArrowRight movement with Undo, direct
text insertion with multi-step Undo/Redo, both literal README examples, all
three host pages, theme ownership and active-child disposal. Full serialized
host/child snapshots are compared, with only the regenerated Board theme
palette allowed during theme changes. No browser errors or backend requests
were observed in that run. The owned Board content React root is unmounted
before native host teardown to avoid accessing its disposed scoped injector.

EN/ZH Next guides and live media-theme changes preserve the same API owner and
edited content. Independent export contains the same eleven source files and
official styles. Earlier failed disposal, Escape-as-commit and single-Undo
reports remain as diagnostics; the final runtime check includes typing, full
Undo/Redo snapshot restoration and cleanup, not just Facade text replacement.

This is still partial acceptance. Full menus, failed/empty/delayed providers,
repeated mounts, React unmount races, resource persistence, narrow/touch layouts
and accessibility remain open. Performance is not accepted: the selected main
bundle is about 18.1 MB (4.5 MB gzip), with about 126 kB CSS. The Next preview
also emitted a Gzip listener warning. The SDK license watermark is unchanged.

All people, observations and dates are fictional. No attendance tracking,
invitations, voting, reminders, team messages, approvals, backend, Exchange
conversion or print output is provided. SDK packages are not patched.
The saved Gamma team-retrospective reference informs the charcoal/teal editorial
framing; mint, lilac and warm yellow distinguish the original working material.
No competitor artwork is exported.

The shared factory explicitly imports the official Ink UI English pack and CSS
required by the registered Boards UI dependency. Other product locale packs and
styles remain intact. This is resource coverage, not native pen acceptance.
