# Harbor / Slides in Sheets Float

Original fictional community-ferry operating budget with a two-page decision brief.
The twelve monthly costs total $29,700. The host SUM formula is real; the child
presentation is intentionally independent, not a linked formula demonstration.

## Runtime

`create-demo.ts` is shared by Preview and standalone `index.ts`. It imports eleven
official SDK stylesheets, registers a local Slides resource provider, and creates
a `SheetFloating` embed after Steady. Sheets Drawing mounts the native child;
calling generic `EmbedMountService.mount` here cannot resolve the floating host.
The native floating controls handle activation and page navigation. There is no
generic fixture panel or duplicate host formatting toolbar. Keep trial watermarks.

## Verification and remaining scope

The independent Vite build transforms 1,844 modules. Its main JS is 18,124.96 kB
(4,493.77 kB gzip), CSS 129.64 kB (19.27 kB gzip); the large-chunk warning remains.
`embed-guides-client-settled/report.json` now also passes real EN/ZH guides and
native previews (2 variants, 3 actions, 3 states), official white/flex CSS and zero
browser errors. It does not certify all lifecycle paths. The native Embed UI's
module-time Path2D dependency must not execute during server prerendering: the
Preview uses `next/dynamic` with `ssr: false` in its Client Component entry.
The export includes both entry and React adapter as reference text, without
adding Next.js dependencies to the independent Vite project.

The native menu lives in a body portal, not under the host root. beta.2 schedules
its React unmount after disposing the scoped LocaleService. This demo explicitly
unmounts its own native content and ID-scoped menu with `@univerjs/design.unmount`
before releasing the workbench and core. It neither alters SDK packages nor
suppresses console errors. Broad lifecycle fault acceptance remains open.

Full-screen, native keyboard text editing and history ownership, touch/accessibility,
reloading preserved resources, failure recovery, pending-load disposal and export
performance remain separate acceptance items. Exchange and Print are not registered
in this case. The calendar is authored data, not a globally frozen SDK clock.

## Reference provenance

The internal Gamma budget-review reference informed the side-by-side decision story.
All prose, amounts and presentation content are authored originals. No competitor
artwork or screenshots are distributed in this export.
# Current locale follow-up

The SDK always uses its complete registered English locale packs. Earlier
`test-embed-locales-native` bilingual runs remain historical evidence; they do
not describe the current English-only runtime.
