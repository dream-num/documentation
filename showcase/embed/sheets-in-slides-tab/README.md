# Aster / Pilot appendix

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier  English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

An original community-radio team reviews an eight-week pilot. Three authored
slides frame the editorial mix and commissioning decision. A native SlidePage
embed inserted second in the page list opens the real two-sheet production
workbook. This is the Slides equivalent of a tab, not a floating object or iframe.

The saved Gamma team-retrospective cover informs the dark teal composition.
All artwork is native SDK shapes/text, with original sand and sage alternatives;
no competitor artwork is included. Names, figures and dates are fictional.

## Try the working model

Open **Pilot schedule** in the native page list. Schedule contains eight different
episodes and Resources contains shared rates, studio capacity and budget.
The baseline is 22 studio hours, 35 editing hours and $2,040 production cost.
Change Schedule!D5 from 2 to 3: studio hours become 23, production cost $2,085,
studio capacity remaining 1 hour and budget remaining $915. Native Undo/Redo
should restore/reapply only the workbook edit. Editorial slides stay independent;
they are not Formula Shapes. Editing rates also recalculates all episode costs.

With D5 still at 3, change Resources!B4 from 45 to 50: all eight episodes
recalculate and total cost becomes $2,200. Set B4 to 0 to model a sponsored
studio: editing still costs $1,050, so free studio time does not mean a free
programme. Two native Undo operations restore the $45 studio rate and $2,085
total. To test keyboard entry, select D5 and type 4, then Enter: total cost
becomes $2,130. Undo restores 3 hours. These variants use the actual worksheet
and formulas, not separate fixture controls.

Use native ribbon and worksheet tabs, without fixture panels or duplicate host
buttons. Default ribbon is Grid. Preview and standalone use the same factory,
data and official host/child/Embed CSS. The workbook is provided locally; no
backend, booking, broadcast, invoice or persistence is performed. Reload loses edits.

## Selected evidence

The earlier `production-print` and `native-print` checks accepted the initial
zero-page print shell too early. They are superseded by the stronger paginated
gate, which waits for nonzero pages. The final screenshot was visually reviewed.
The first editorial cards overflowed; shorter copy and 17pt type now fit all
three cards without overriding SDK CSS.

The first creation path, `createEmbed` then `loadAsync`, left the native page's
child ID absent and showed an empty appendix. Preloading the ResourceRef or
restoring an existing anchor did not fix this; one transient run reached a
missing-render error in the auto-height interceptor. The final setup follows
`slides-embed-local`: `prepareCreateEmbed`, materialize the descriptor, then
`restoreEmbed` to create the native page with its child ID. This public SDK
service integration is included in exported source; it is not a Facade-only
creation claim. No SDK/package file or internal model is patched. A separate
test selector initially clicked the formula-bar canvas; it now clicks the real
worksheet area. All failed reports remain available.

## Still open

Complete broader native selection/editing and menu dialogs, delayed/pending
removal, failed sources, resource reload/persistence, React unmount races,
narrow layouts, touch, accessibility and loading performance. Creating a new
factory or reloading intentionally restores authored data; a theme change does
not. Physical printing and Exchange conversion remain unverified. This is
partial capability coverage, not a fully accepted demo.
