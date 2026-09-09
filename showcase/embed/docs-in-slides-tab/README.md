# Mosaic / Research appendix as a native Slides page

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier  English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

Three original slides ask what helps a visitor return to a repair workshop.
The fictional study has 18 interviews across three workshops, 24 observed visits
and eight follow-up notes. Four primary barrier counts are 7, 5, 4 and 2.
The separately editable modern document explains the research question, method,
sample, coding decisions, limitations and next learning step.

Open **Research appendix** in the native page list. It uses a real
SlidesPageListBlock document host, not a float, iframe, image, traditional
paginated document or slide text box. Return to the other thumbnails to see
the research narrative. No fixture selector, reset panel or diagnostic toolbar
is mounted.

## Code that matches the preview

This changes the appendix title without modifying the host slide models:

```ts
window.univerAPI
  .getDocument('mosaic-methods-appendix')
  .getParagraphs()[1]
  .setText('Keep the methods visible.')
```

This changes the host headline without modifying the document:

```ts
window.univerAPI
  .getPresentation('mosaic-repair-research')
  .getSlideById('question')
  .getShape('title')
  .getText()
  .setRichText(
    window.univerAPI.newRichText().span('Make repair easier\nto revisit.', {
      fontSize: 54,
      bold: true,
      color: '#203B32',
    }),
  )
```

Slide counts and document prose are independent, not formula-linked. Keyboard
history should affect the active document only. Reload restores the authored
study; theme changes should preserve edits.

## Integration and current acceptance

The self resource provider creates only the requested Docs unit. Following the
SDK local Slides example, prepareCreateEmbed, materializeDescriptor and
restoreEmbed create the native document page after loading the child. The same
factory powers Preview and standalone source. Official Design, UI, Docs,
Drawing, Slides, Shape Editor and Embed styles are imported and exported.

Selected independent production verification at 1220px passes native Ribbon
Undo/Redo, ordinary keyboard insertion and Ctrl+Z/Ctrl+Y, lower-section scrolling,
three-page host navigation, both literal examples above, theme preservation and
active-child disposal. Host and child snapshots are checked independently.
Undo materializes omitted empty customBlocks, customDecorations and customRanges
collections as empty arrays; every other snapshot field is compared strictly.
No browser errors or backend requests were observed in this run.

The initial role/name selector failed because native Grid icon buttons have no
accessible name. The corrected test clicks their actual command-ID buttons;
it does not invoke a replacement Facade undo. The earlier selector and raw
serialization comparison failures are retained. Missing accessible names remain
an accessibility issue, not a completed accessibility check.

Full menus, empty/error/delayed providers, repeated mounts and React unmount races,
resource reload/persistence, narrow/touch layouts and accessibility remain open.
Performance is not accepted: the selected bundle has about 18,057 kB main JS
(4,480 kB gzip) and 121 kB CSS (17.86 kB gzip); first selected Next requests took
53s for the guide and 15.8s for the playground, with a Gzip listener warning.
No backend, participant contact, approval, consent collection, persistence,
Exchange conversion, print output or SDK/package patch is provided.
This case is partially verified, not fully accepted.

The saved Beautiful.ai sustainability-research cover informed the green editorial
palette. All shapes, narrative and data are original; no reference photography or
artwork is exported.
