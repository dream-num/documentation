# Maple / Modern Docs floating on a Board

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier  English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

A fictional library collection desk explores arrival, desk-finding and hold-code
confusion. Three synthetic observations sit beside three distinct hypotheses;
the native floating modern document contains a seven-section interview brief.
Six planned conversations split between three new and three returning readers.
The twenty-minute agenda allocates four minutes to context, twelve to a recent
story and four to reflection. None of these notes comes from real research.

## Run and explore

Run pnpm install and pnpm dev in the standalone export. Double-click the brief
to activate native Docs editing. Use the floating menu to expand it, and scroll
through the seven sections. Board keeps its own native floating tools; Docs uses
Grid where exposed by the SDK. There are no fixture/reset panels or duplicate
editing buttons. This is native BoardFloating, not an iframe or HTML substitute.

Run this exact Facade example to refine the document title:

```ts
window.univerAPI
  .getDocument('maple-interview-brief')
  .getParagraphs()[1]
  .setText('Make the next visit easier.')
```

The Board's observation and hypothesis cards must remain unchanged. Try native
typing and Undo/Redo in the focused document, then return to the Board:

```ts
window.univerAPI
  .getBoard('maple-library-discovery')
  .getShape('decision-note')
  .getText()
  .setText('NEXT / Check the hold-code step.')
```

Only the Board decision changes. Move a card with the native Board tools and
undo it; the document should retain its text. An observation is not a hypothesis,
an edited brief is not consent, and no interview is scheduled or recorded.

## Integration and acceptance

The same createDemo factory powers Preview and the standalone export, including
the official host, child, drawing, shape, UI and Embed CSS. A local provider
accepts only the authored document ID and Doc type. This is DocumentFlavor.MODERN,
not a paginated report or a Board text box. Content and history have distinct owners.

The initial CSS assertion incorrectly expected a white DOM canvas wrapper, as in
Sheets. Docs paints its white page on Canvas instead; the corrected test checks
an actual white page pixel alongside visible text and screenshots. No CSS
override was added. The first README attempt used a nonexistent paragraph
replace method; the same literal-example test caught it, and the example now
uses the public FDocumentParagraph.setText method. Failed reports are retained.

One later guide rerun recorded a React state-update-before-mount warning; its
failed next-text report remains. The subsequent next-final run passes both
locales without console errors, but this does not establish a root-cause fix.
Repeated-mount/dev-integration reliability remains unaccepted.

Full menus, failed/empty/delayed providers, repeated mounts, persistence, complete
focus boundaries, small screens, accessibility and performance remain open.
No backend, Exchange conversion, Print output, recording, invitations, publishing
or automatic card updates are claimed. Reload loses local edits. No SDK package
or license watermark is patched.

The saved Notion Project Brief reference informs the sectioned writing, not its
copy or artwork. Original deep-purple, lavender, muted-green and apricot content
keeps native white SDK surfaces intact. All names, notes and geometry are authored
for this demo; no competitor artwork is exported.

The shared factory explicitly imports the official Ink UI English pack and CSS
required by the registered Boards UI dependency. Other product locale packs and
styles remain intact. This is resource coverage, not native pen acceptance.
