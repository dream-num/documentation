# Aster / Native text-markup review

An original, fictional two-page review: a renewal date, an annual fee of
USD 18,450.00, and a two-line obsolete procedure. This is SDK demonstration
content, not a legal agreement. The original words, review date and page layout
are deliberately preserved. No source binary PDF is imported in this example:
the editable PDF unit is authored with the native PDF Facade.

The initial yellow highlight, blue underline and red two-line strikeout use
known PDF-point quadrilaterals. They are native annotations, not colored HTML
overlays and not redaction. The native Highlight tool additionally lets you drag
over actual text. Use the native selection tool, page rail and properties panel;
there is no separate fixture picker, duplicate markup toolbar or live JSON panel.

## Literal Facade examples

Run these snippets in order in the standalone preview or demo iframe console.
Use the page rail to inspect page 1 or 2. Code and Preview use the same factory;
no result is simulated. These API variants complement the native tools.

### 1. Inspect the three different marks

```ts
console.log(window.univerAPI.getActivePdf().getPages().map(page => ({
  page: page.getIndex(),
  marks: page.getAnnotations().map(mark => ({
    id: mark.getId(), type: mark.getAnnotationType(),
    style: mark.getStyle(), geometry: mark.getMarkup(),
  })),
})))
```

### 2. A quieter renewal highlight

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'renewal-mark').setStyle({ fill: { color: '#72a88a' }, opacity: 0.35 })
```

### 3. Invisible is not removed

Opacity zero preserves the annotation and underlying text.

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'renewal-mark').setStyle({ opacity: 0 })
```

### 4. Compare the opaque boundary

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'renewal-mark').setStyle({ opacity: 1 })
```

### 5. Invalid opacity must be rejected

The native setter throws a RangeError. Do not clamp the value or replace the
document; the complete snapshot must remain unchanged.

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'renewal-mark').setStyle({ opacity: 1.5 })
```

### 6. Restore the review highlight

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'renewal-mark').setStyle({ fill: { color: '#f5bd34' }, opacity: 0.5 })
```

### 7. Give the commercial question a different color

The fee stays USD 18,450.00; the underline is an annotation, not text decoration.

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'fee-mark').setStyle({ fill: { color: '#7651a8' }, opacity: 0.9 })
```

### 8. Remove one two-line review mark

Both old-procedure lines remain readable; this is not deletion of source text.

```ts
window.univerAPI.getActivePdf().getPageByIndex(1).getAnnotations().find(mark => mark.getId() === 'obsolete-mark').remove()
```

### 9. Discuss rather than strike out

One native squiggly annotation covers two separate line quadrilaterals.

```ts
window.univerAPI.getActivePdf().getPageByIndex(1).insertAnnotation({
  id: 'obsolete-mark', annotationType: window.univerAPI.Enum.PdfAnnotationType.SQUIGGLY,
  left: 48, top: 218, width: 435, height: 52,
  markup: { color: '#a65a35', opacity: 1, quadPoints: [
    [[48, 218], [483, 218], [48, 240], [483, 240]],
    [[48, 248], [483, 248], [48, 270], [483, 270]],
  ] },
})
```

### 10. Restore the two-line strikeout

```ts
const page = window.univerAPI.getActivePdf().getPageByIndex(1)
page.getAnnotations().find(mark => mark.getId() === 'obsolete-mark').remove()
page.insertAnnotation({
  id: 'obsolete-mark', annotationType: window.univerAPI.Enum.PdfAnnotationType.STRIKEOUT,
  left: 48, top: 218, width: 435, height: 52,
  markup: { color: '#dc2626', opacity: 1, quadPoints: [
    [[48, 218], [483, 218], [48, 240], [483, 240]],
    [[48, 248], [483, 248], [48, 270], [483, 270]],
  ] },
})
```

### 11. A single mark can link two separated review targets

This demonstration intentionally overlaps the existing date/fee marks, so the
combined opacity differs from either individual annotation.

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).insertAnnotation({
  id: 'review-pair', annotationType: window.univerAPI.Enum.PdfAnnotationType.HIGHLIGHT,
  left: 48, top: 218, width: 350, height: 154,
  markup: { color: '#72b5c8', opacity: 0.25, quadPoints: [
    [[48, 218], [378, 218], [48, 240], [378, 240]],
    [[48, 350], [398, 350], [48, 372], [398, 372]],
  ] },
})
```

### 12. Remove the paired mark without touching the originals

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'review-pair').remove()
```

## Runtime and export boundaries

Five official SDK CSS imports and five complete English locale packs are included
in the exported factory. The default ribbon is Grid. Theme changes toggle the
existing instance instead of rebuilding the PDF and losing edits. Initial SDK
language is always English, independently of `document.documentElement.lang`.
Earlier bilingual reports below are historical, not acceptance of this English-only revision.

There is no custom JSON-download button masquerading as PDF export. This selected
demo does not register a proven client-only binary PDF converter or PDF Print
provider. Registering Exchange elsewhere does not establish PDF conversion
support here; no conversion-service request is sent. Native controls are not
replaced with browser print, handcrafted PDF output or fake success messages.

Selected acceptance passes in `test-results/pdf-markup-native-final/report.json`
and independent export parity in `test-results/pdf-markup-native-export-ui/report.json`.
The original generic export check was insufficient: its screenshot still showed
the SDK startup skeleton despite a PASS report. That superseded evidence is kept
in `test-results/pdf-markup-export-skeleton-history/`; it must not be used as proof
of a rendered PDF. The factory now publishes `data-ready="false"` immediately,
waits for the actual PDF viewport and removal of the startup skeleton, and only
then publishes readiness.

`node scripts/test-pdf-markup-export-startup.mjs` independently checks the exported
10 files, explicit readiness, absence of the skeleton, the current main-canvas
page titles/date/fee/old-procedure text, colored pixels for all three annotations,
native pointer selection with Properties readback, white SDK background and
disposal. Its strict report and real PDF screenshots are in
`test-results/pdf-markup-export-startup/`. The corrected generic export check also
records `startupOverlayAbsent: true`; any-canvas readiness alone is not accepted.
The startup test also loads a fresh Chinese-language document before SDK
initialization, checks native Highlight and Properties labels without calling
`setLocale`, and captures `initial-zh-CN.png`. This is separate from the edited
instance language/theme preservation checks in the 12-snippet regression.

The runtime report has 17 passing gates: all 12 literal snippets, native page
navigation and initial marks, pointer selection with native Properties readback,
native Highlight rectangle drag, complete EN/ZH packs with edited-snapshot theme
preservation, and selected disposal. Annotation-region pixels prove real changes
to highlight, underline, strikeout, squiggly and paired-target appearances; all
original text/geometry and the review date remain unchanged. Console errors,
warnings and backend requests are zero. Initial authoring is excluded from the
native Undo stack; user operations still use the SDK's own history normally.

This is selected runtime evidence, not full product coverage. Binary PDF import/export, native Print,
save/reopen roundtrip, all annotation property controls, browser lifecycle,
mobile, accessibility and performance remain separate acceptance work.
