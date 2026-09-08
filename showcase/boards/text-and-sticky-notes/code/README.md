# Text and sticky notes

One native Board compares standalone heading/body typography with three real sticky shapes: short, multiline and wide. No HTML cards, fixture selectors or duplicate formatting controls. Double-click text to enter the native editor; the Board's own floating tools remain available. The original English content is intentionally not a business workflow.

Preview and standalone share the factory, eight complete English locale packs and eight official stylesheets, including the transitive Shape Editor, Embed Unit and Ink UI dependencies. Native UI remains English on Chinese host pages. Themes update the existing owner. Trial notices are not hidden. Startup fitting uses the published BoardViewportService; text edits below use public Facades.

## Four literal recipes

Run these in order after startup. Standalone text and sticky shape text are different SDK paths.

```ts
const board = window.univerAPI.getBoard('text-sticky-gallery')
if (!board.setTextContent('body', 'Standalone text can be revised without changing its bounds.')) throw new Error('Text update rejected')
```

```ts
const board = window.univerAPI.getBoard('text-sticky-gallery')
board.getShape('yellow').getText().setText('One clear idea\nReady to discuss.')
```

```ts
const board = window.univerAPI.getBoard('text-sticky-gallery')
board.getShape('blue').getText().setFontSize(24).setBold(true).setColor('#174A74')
```

```ts
const board = window.univerAPI.getBoard('text-sticky-gallery')
board.getShape('pink').getText().setText('Wide note\nA revised explanation stays inside the original sticky.')
```

These are local front-end edits, not persistence or collaboration. No auto-layout, spell checking or rich clipboard support is claimed.

## Observed native editing limit

Native standalone text replacement passes. In this beta.2 gallery, double-clicking the yellow sticky, pressing Ctrl+A and typing replaces only its final paragraph: the actual text is `One idea\nNative yellow revised`, not the requested `Native yellow revised`. The strict native replacement check remains failed; the public `FShapeText.setText()` recipe replaces the full text separately. This is an observed behavior, not a proven SDK root-cause diagnosis. The native renderer also hyphenates wrapped words. No SDK patch or error suppression is applied.
