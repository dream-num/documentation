# Prism / Slides floating on a storyboard

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier  English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

An original fictional night-sky pop-up proposal pairs four narrative notes with
a native four-page pitch deck. Eight sessions, twenty seats each, two venues and
four learning weeks define a small pilot. The USD 8,400 resource plan allocates
3,600 to facilitation, 2,400 to a portable kit, 1,600 to access support and 800 to
learning review. Capacity, costs and dates are assumptions, not measured results.

## Run and explore

Run pnpm install and pnpm dev in the standalone export. Double-click the deck
to activate Slides, then use its native fullscreen control and thumbnails.
Explore the dark cover, green visitor journey, warm resource plan and lavender
decision page. Board keeps native floating tools; Slides uses Grid where exposed.
No fixture/reset panels, duplicate editing buttons, iframe or screenshot replaces
the native child presentation.

This literal Facade example refines the first title paragraph, preserving its
rich-text styling and the Board's independent story notes:

```ts
const text = window.univerAPI
  .getPresentation('prism-night-sky-pitch')
  .getSlideById('invitation')
  .getShape('cover-title')
  .getText()
const rich = text.getRichText().copy()
rich.getParagraphs()[0].getTextRuns()[0].setText('Eight local nights.')
text.setRichText(rich)
```

Try native Undo/Redo, edit the title and move a shape. Visit the four native
thumbnails. Return to the Board and change only its pending next step:

```ts
window.univerAPI
  .getBoard('prism-pitch-storyboard')
  .getShape('decision-note')
  .getText()
  .setText('NEXT / Walk both venues before the pilot.')
```

Slide text and budget bars are independent editable shapes, not Formula Shapes
or live charts. Changing a Board card does not change deck content, spend money,
book a venue or send invitations. Reload loses local edits.

## Integration and acceptance

Preview and the eleven-file standalone export share one createDemo factory and
the official host, child, Embed, drawing and shape CSS. The local provider accepts
only the authored Slides ID and type. BoardFloating owns the embed geometry;
Slides owns its four pages and edits. The default display target is invitation.

Selected independent production passes the two literal README examples,
native rich-text input and full-snapshot Undo/Redo, shape movement/history,
four-page navigation and canvas palette checks, fullscreen Start/View Grid,
independent Board text and movement/history, theme changes and active-child
disposal. The first native text edit materializes the SDK's internal rich-text
model: the test enters and leaves editing once before measuring typing history.
First-commit restoration is not certified. Board themes may regenerate palettes;
theme ID and all authored content remain strict. No SDK package is patched.

EN/ZH guides pass three variants/actions/states and actual media-theme changes
preserving the same owner and both edited models. Source parity checks the eleven
exported files and official SDK stylesheets, including the white native
workbench and the deliberately navy slide canvas. Evidence:

Only this demo was built: 206 offline packages, 1,841 modules, main JavaScript
18,104.47 kB / 4,497.78 kB gzip and CSS 125.97 kB / 18.63 kB gzip.
Cold selected Next requests took 45s for the guide and 26.3s for the playground,
with a Gzip drain-listener warning. Performance is not accepted.

Full menus, playback, failed/empty/delayed providers, repeated mounts, persistence,
focus boundaries, accessibility, small screens and performance remain open. No backend,
Exchange conversion, Print output, publishing, tracking or booking is claimed.
No SDK package or license watermark is patched.

The saved Beautiful.ai dark-pitch reference informs the strong title contrast,
not its artwork or copy. All story text, figures and geometry are original.
Native SDK surfaces stay intact while the four slide palettes vary by purpose.

The shared factory explicitly imports the official Ink UI English pack and CSS
required by the registered Boards UI dependency. Other product locale packs and
styles remain intact. This is resource coverage, not native pen acceptance.
