# Native slide themes and backgrounds

The runtime is English-only on every host page. Complete official English SDK packs
and styles are retained. A legacy locale argument, where present, is ignored without
shifting the saved-snapshot argument. EN/ZH reports below are historical evidence
from before this language change, not current bilingual-runtime acceptance.

Eight original fictional night-market slides compare theme-bound and explicit colors with solid, gradient, pattern and original SVG image backgrounds. Use the native thumbnails, Themes, Format Background, Undo/Redo and Print controls. The installed background panel does not offer a pattern-selection radio; that variant is supplied in the snapshot.

The Preview and export share one factory and official SDK styles. Light/dark chrome changes retain the same Univer owner and edited presentation. Native slide theme presets are separate from editor light/dark mode. Trial license watermarks remain visible.

## Frontend-only boundary

PPTX import/export is deliberately not registered. In installed `1.0.0-beta.2`, `exchange-client` is a client of a conversion service, not a browser-only PPTX converter. Native Save As attempted `POST /universer-api/stream/file/upload` and returned 404 in both English and Chinese. No file was downloaded. The original strict failure is preserved at `test-results/slides-theme-files/report.json`; import and roundtrip were consequently not verified. No fake PPTX, JSON substitution, mocked successful request or SDK patch is used.

Add the official Exchange and Slides Exchange clients only in an application with configured supported conversion endpoints and appropriate licensing. This demo does not provide those endpoints.

## Acceptance

`scripts/test-slides-theme-owner.mjs` mounts the actual Preview with next-themes, edits native speaker notes and compares the full edited snapshot and owner across light/dark StorageEvents in EN/ZH, then unmounts with strict console and network-write checks.

`scripts/test-slides-theme-files.mjs` checks the frontend-only export: no HTTP-backed File control, native localized eight-page Print settings and cancellation, official canvas CSS, no console errors or network writes. It does not submit a physical print job or certify browser/driver print fidelity.
