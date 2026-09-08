# Vale / A decision memo beside the proposal

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier EN/ZH reports below describe historical interaction runs,
not current bilingual SDK acceptance. English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

A six-week, two-route walking pilot proposes 36 participants and an $18,600
budget. Three native slides compare a research-only option ($4,200), the pilot
and a full-scale option ($54,000). The independently editable modern document
explains recommendation, alternatives, budget exclusions, launch evidence and
stop criteria. All content and data are original and fictional.

Double-click the memo on the first slide to activate Docs. Edit text in the
native editor and scroll within it. Use native slide thumbnails to compare the
options and review criteria. This is a SlideFloating case; the separate
`embed/docs-in-slides-tab` case demonstrates a research appendix as a native
presentation page. This Float is not an iframe, screenshot, slide text box or paginated
traditional document. No generic fixture, reset or inspector panel is mounted.

## Code that matches the preview

The following Facade edit changes only the modern document title.

```ts
window.univerAPI
  .getDocument('vale-decision-memo')
  .getParagraphs()[1]
  .setText('Pilot two routes first.')
```

This independent host edit must leave the entire document unchanged.

```ts
window.univerAPI
  .getPresentation('vale-walking-pilot')
  .getSlideById('decision')
  .getShape('title')
  .getText()
  .setRichText(
    window.univerAPI.newRichText().span('A reversible first step.', {
      fontSize: 38,
      bold: true,
      color: '#35382C',
    }),
  )
```

No formula links the slide figures and prose. Changing one does not silently
rewrite the other. Reload restores the original story; theme changes should
preserve local edits.

## Integration and current limits

A self resource provider creates only the requested modern Docs unit and
honors cancellation. The same factory powers Preview and the standalone entry.
Official design, UI, Docs, Drawing, Slides, Shape Editor and Embed CSS are
imported in that factory and exported with the source. Owned React roots are
unmounted before their scoped SDK services.

## Runtime acceptance / 2026-09-06

The full native runtime gate is **failing**, not accepted:
`test-results/embed-doc-slide-float-production/report.json`.

- Native activation, all fourteen paragraphs, both verbatim README examples,
  ordinary keyboard insertion and Ctrl+Z/Ctrl+Y pass. The complete child snapshot
  restores on Undo and Redo; the complete host stays unchanged. The Docs floating
  menu has fullscreen and removal, not Relational Table-style Undo/Redo buttons.
- Native child scrolling paints the lower stop/review section. Three native
  thumbnail pages, independent host title editing, live Facade dark/light changes
  and owned active-child disposal preserve the expected models. No browser errors
  or backend requests were observed.
- **Native Enter fullscreen opens no shell.** Its direct test fails; there is no
  custom replacement button or hidden failure. Similar failures in Sheets/Relational Table
  Slides Float are related observations, not proof of the root cause here.
- The first source check combined Ctrl+Home with `Reviewed / ` typing. The caret
  did not move to the document beginning and the slash did not appear as expected.
  Its failed report and active-editor/text diagnostic remain. A separate ordinary
  `Reviewed ` insertion at a clicked caret passes with native Undo/Redo. This does
  not certify Ctrl+Home navigation or slash-menu behavior.
- `test-results/embed-doc-slide-float-next/report.json` separately passes actual
  EN/ZH guide rendering, native Grid/white CSS and media-theme changes preserving
  the same SDK API owner and edited host/document snapshots.
- `test-results/embed-doc-slide-float-export/report.json` passes eleven-file
  source/export parity and official native CSS. The standalone build installed
  206 offline packages. Main JS is about 18,056 kB / 4,480 kB gzip; CSS is 121.03 /
  17.86 kB. Performance acceptance remains open. Cold selected Next guide/playground
  requests took 54s/16.6s with a Gzip listener warning.

Remaining: fullscreen, isolated navigation/slash shortcuts, full editing/menu
coverage, empty/error/delayed resources, repeated mounts and React unmount races,
reload persistence, narrow/touch layouts and accessibility. The license watermark
is unchanged and can overlap document content. No SDK/package patch, backend,
invitations, booking, approval, persistence, Exchange conversion or print output
is provided.

Selected production diagnostic (2026-09-08):
`test-results/vale-fullscreen-keyboard-trace/report.json` still fails fullscreen.
The native menu has the correct host/embed props and a resolved descriptor.
Its button receives pointerdown, mousedown and mouseup, but no observed click;
the traced root fullscreen service never enters a session. Focusing the same
button and pressing Enter also opens no shell. Native text input/history,
scrolling, both literal examples, slide navigation, themes and disposal still
pass without observed browser errors or backend writes. This narrows the failure
to the activation path; it does not establish the exact event-interception cause.

The local SDK source has `installMissingClickFallback` in its floating-menu
container, while the installed beta.2 type declarations do not expose that
function. This is source/package divergence, not proof that upgrading fixes it.
No package version, SDK handler or replacement fullscreen control was changed.

Composition reference: the locally saved Beautiful.ai clean proposal cover,
used only to inform a calm editorial hierarchy and olive/cream palette. Its
photography and artwork are not exported.
