# Beacon / Architecture diagram inside a Slides Float

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier EN/ZH reports below describe historical interaction runs,
not current bilingual SDK acceptance. English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

Three original slides propose offline ingestion for twelve fictional observation
stations. The independently editable Board separates a field station, local
buffer, ingest gateway, validation, accepted archive and quarantine review.
Six bound connectors carry the sample, upload, validation and recheck paths.
The 24-hour buffer is a design target, not a measured reliability guarantee.

Double-click the native floating Board to edit it. It is not a tab, iframe,
static drawing or screenshot. Use the SDK's own selection and editing tools;
no fixture selector, reset panel or duplicate host toolbar is mounted.

## Code that matches the preview

Change the quarantine decision without altering the presentation:

```ts
window.univerAPI
  .getBoard('beacon-ingestion-boundaries')
  .getShape('quarantine')
  .getText()
  .setText('Quarantine\nReview today')
```

Change the host headline without altering the Board:

```ts
window.univerAPI
  .getPresentation('beacon-observatory-review')
  .getSlideById('architecture')
  .getShape('title')
  .getText()
  .setRichText(
    window.univerAPI.newRichText().span('Preserve evidence before retry.', {
      fontSize: 38,
      bold: true,
      color: '#F3F6F3',
    }),
  )
```

The slide labels and Board nodes are independent, not formula-linked.
Reload restores authored data. Theme changes should preserve edits.

## Integration and current acceptance

A self resource provider creates only the requested Board. The public Embed
Facade creates a SlideFloating anchor and loads it with an abort signal.
Preview and standalone source use the same factory and all eight official
Design, UI, Docs, Drawing, Slides, Shape Editor, Boards and Embed styles.

The full native runtime gate is FAILING: Enter fullscreen does not open a shell.
The native button is retained; no replacement control hides this failure.
The root cause has not been independently established for this Board case.

Selected independent production at 1220px passes native activation, both literal
README examples, keyboard Undo/Redo, pointer selection and ArrowRight movement
with Undo restoring the serialized Board, all six connector snapshots, three
host pages, theme changes and owned active-child disposal. No browser errors or
backend requests were observed. Report: test-results/embed-board-slide-float-production-final/report.json.

BoardSettingsService.syncFollowUniverTheme regenerates the native theme palette
when the UI theme changes. The test permits only that field to change; every
other serialized field, including explicit element colors and resources, is
compared strictly. Native movement Undo can add undefined flipX/flipY fields;
JSON save snapshots omit them. Initial raw-snapshot and per-character canvas
locator failures remain recorded. A long edited label wrapped with hyphenation;
the example now uses the shorter Review today label, matching its visible text.

EN/ZH Next guides preserve the same owner and edited content across media-theme
changes (test-results/embed-board-slide-float-next-label/report.json).
Eleven-file standalone source and official CSS parity are checked separately
(test-results/embed-board-slide-float-export-final/report.json).
The architecture, responsibility and recovery slides were visually reviewed;
shorter node labels and card copy avoid observed text overflow.

Full native menus/text editing, empty/error/delayed providers, repeated mounts,
React unmount races, resource reload/persistence, accessibility and narrow/touch
layouts remain open. Performance is not accepted: 206 offline packages, main JS
18,127.49 kB / 4,503.00 kB gzip, CSS 125.98 / 18.53 kB; cold selected Next guide
and playground requests took 64s / 11s, with a Gzip listener warning.
This case is partially verified, not fully accepted.

No backend, sensor connection, delivery, deployment, approval, Exchange
conversion or print output is provided. SDK packages are not patched.
The saved Gamma dark engineering reference informs the navy editorial palette
only; all diagrams, labels and data are original. No reference artwork is exported.

The shared factory explicitly imports the official Ink UI English pack and CSS
required by the registered Boards UI dependency. Other product locale packs and
styles remain intact. This is resource coverage, not native pen acceptance.
