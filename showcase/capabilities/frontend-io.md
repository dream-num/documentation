# Frontend file I/O and print boundary

Checked against the documentation project's installed `1.0.0-beta.2` packages
and the local univer-pro advanced/local examples. This is a capability boundary,
not approval to send user files to an external service.

| Operation | Current execution path | Acceptance status |
| --- | --- | --- |
| Native Sheets / Slides file picker | Exchange client UI in the browser | Registration provides UI, not an offline converter |
| Office import/export, including Sheets CSV/TSV through Exchange | Upload, conversion task, polling, signed download | Not completed under the no-backend constraint |
| `import*ToSnapshotAsync` | Server converts to JSON; browser creates the unit | JSON output avoids unit persistence, not HTTP conversion |
| `transform*DataToSnapshotJsonAsync` | Local model/protocol encoding | Not an XLSX/PPTX/CSV file |
| `downloadFile(Blob)` | Browser downloads supplied bytes | Does not prove those bytes were generated offline |
| CSV import in `sheets/csv-import-plugin` | Explicit local CSV parser plus SDK workbook APIs | Separate from Exchange; not Office-format fidelity |
| Sheets Print | SDK renders paper canvases, then browser print | Actual generated pages verified; physical printer/PDF driver not certified |

## Source evidence

The shared Exchange configuration exposes upload, import, export, task and signed
download URLs; it does not advertise a WASM/offline runtime switch. The installed
shared/Sheets/Slides packages use the `/universer-api/` request pipeline. In
univer-pro, `packages/exchange-client/src/services/exchange.service.ts` implements
snapshot import as upload → import task → polling → signed JSON download.
`request.service.ts` uses HTTP POST for upload/conversion and GET for task/results.
Local protocol serialization is a different method from this file conversion.

`examples/src/sheets-advanced/main.ts` explicitly configures these endpoints.
`sheets-local` does not register Exchange. `slides-advanced` uses the shared and
Slides clients with default endpoints. `traditional-local` registers Docs
Exchange, whose plugin depends on the shared client; that example is not evidence
of offline DOCX conversion. Docs Exchange is not installed in documentation, so
the Docs conclusion is source-level, not a tested published-package runtime.

Existing browser-service doubles are historical protocol tests, not conversion
fidelity evidence. The current local native report retains Office conversion as
unmet: `test-results/sheets-exchange-local-native-r3/report.json`. No mock response,
renamed JSON file, hidden menu or success toast satisfies that requirement.

## Print evidence

`scripts/test-sheets-print-output.mjs` executes native Print → NEXT on a selected
production export in EN/ZH. It suppresses only the OS print call, dispatches the
browser print lifecycle events and preserves the SDK's actual page renderer.
It captures every generated canvas plus print-media DOM, verifies paper dimensions,
page-break CSS and populated pixels, and checks complete workbook preservation
after `afterprint` cleanup. Board text calls can include clipped text; reviewed
page images, not those calls alone, establish visible content.

## Authority still needed for Exchange

“No custom backend code” and “no backend service” are different requirements.
The current task requires the latter. Enabling a production-compatible Exchange
service would require an explicit decision about endpoint, authentication,
licensing and permitted file uploads. Until then, real Office conversion remains
open; other SDK demos and browser printing can continue without that authority.
