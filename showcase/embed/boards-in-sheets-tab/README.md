# Ember / Incident review tab

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but does not change the runtime language. All registered English locale packs and
official SDK styles remain shared by preview and export. Earlier EN/ZH reports
below are historical interaction evidence, not current bilingual SDK acceptance.

A fictional checkout incident pairs an assumption-led cost workbook with a
native Board SheetTab. Four recovery milestones sit above an unconfirmed cause
and two owned follow-ups. Review gates separates recovery from closure.
The saved Beautiful.ai incident-report cover informed the topic only: all text,
data, cards and composition are original; competitor artwork is not exported.

The shared factory uses Grid, a local Board provider honoring createOptions,
and thirteen official SDK stylesheets. Preview and standalone import the same
factory and data. The browser-only Next adapter is exported as reference text.
There is no fixture panel, iframe substitute or duplicate history toolbar.
The Board uses the official child-scoped EditorUIService via Boards UI's runtime
dependency extension point, without creating a dummy Slides unit or patching SDK.

The six line items distinguish contribution at risk, response hours, prospective
credits and follow-up costs. USD rates are authored assumptions, not booked loss,
an insurance claim or a live incident feed. Cause and action cards are independently
editable; cost edits must not silently change their text. Reload loses edits.

## Acceptance in progress

The selected runner is scripts/test-embed-board-tab.mjs. The first source run
passes native tabs, Shape text edit and paint, native keyboard Undo/Redo,
linked worksheet recalculation and full child preservation across tab switches.
The initial drag harness incorrectly parsed the SDK's comma-separated pan
attribute as JSON; its failure is retained. The corrected native-drag run also
passes real pointer movement and full snapshot restoration through native Undo.

Independent production passes the same interactions. The current
embed-board-tab-production-1220 report additionally exercises the revised
section-heading geometry at 1220px; its screenshot was reviewed. B5 340 to 400
changes D16 from 8268.50 to 9096.50 and updates Review gates B3 without changing
the Board. Active-child teardown emits no browser errors in these selected runs.
These checks do not certify all native editing or lifecycle boundaries.

The independent export installs 206 offline packages and builds 1847 modules.
Current main JS index-wV5Rx9at.js is 18,157.15 kB / 4,504.30 kB gzip; CSS
index-ChSHi-6Q.css is 134.46 kB / 19.89 kB gzip. The large-chunk warning remains.
The first eleven-file source/CSS parity pass predates the last heading-width
change. embed-board-tab-export-current passes the updated eleven files, actual
canvas paint and official white/flex CSS. Final README-only evidence additions
are covered by embed-board-tab-export-final; runtime assets are unchanged.

embed-board-tab-next passes both EN/ZH guides, three variants/actions/states,
the real native Board tab and official CSS with zero browser errors. The English
preview screenshot was visually reviewed. Only this demo was compiled, with
zero document MDX modules. First guide/playground responses took 95s/9.5s;
successful integration does not certify acceptable cold-start performance.

Native typing, connector routing assertions, broader focus/history, accessibility,
narrow layouts, failed sources, repeated mounting, cold-start and bundle-size
acceptance remain open. No backend or Exchange/Print conversion is claimed.

### Preview theme and export follow-up

The preview updates its existing owner with `toggleDarkMode`. EN/ZH checks in
`embed-sheet-board-themes-diagnostic` retain edits, permit native shape dragging
after dark/light changes and cleanly unmount. However, the SDK's native theme
follower rewrites the saved Board color/format schemes. The strict full-snapshot
check therefore remains failed; content outside `theme` and the host snapshot
are unchanged. No SDK theme restoration or error suppression is used.
The independent root declares Arial/sans-serif and has English-only startup errors,
with the same official SDK CSS as the preview.

Ink UI is a transitive Boards UI dependency. Its official stylesheet is imported
explicitly: the other SDK stylesheets do not supply all pen-toolbar positioning
and dark-state rules. This source/CSS correction is not native pen acceptance.
