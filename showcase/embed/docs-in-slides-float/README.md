# Vale / A decision memo beside the proposal

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier  English-only source/CSS/startup checks do
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

Remaining: fullscreen, isolated navigation/slash shortcuts, full editing/menu
coverage, empty/error/delayed resources, repeated mounts and React unmount races,
reload persistence, narrow/touch layouts and accessibility. The license watermark
is unchanged and can overlap document content. No SDK/package patch, backend,
invitations, booking, approval, persistence, Exchange conversion or print output
is provided.

The local SDK source has `installMissingClickFallback` in its floating-menu
container, while the installed beta.2 type declarations do not expose that
function. This is source/package divergence, not proof that upgrading fixes it.
No package version, SDK handler or replacement fullscreen control was changed.

Composition reference: the locally saved Beautiful.ai clean proposal cover,
used only to inform a calm editorial hierarchy and olive/cream palette. Its
photography and artwork are not exported.
