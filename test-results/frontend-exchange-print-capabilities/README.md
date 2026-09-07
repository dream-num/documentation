# Frontend Exchange and Print: local source audit

Date: 2026-09-07. Evidence level: **source inspection only; not runtime acceptance**.

No file was uploaded, no conversion endpoint was requested, no SDK code was executed, no dependency was installed or modified, and no server was started. Only this report directory was written.

## Conclusion

Registering Exchange makes its file picker, import/export actions and Facade available to a frontend application. In the inspected implementation it does **not** supply an offline Office/PDF file converter: the default conversion service is HTTP-backed. Registering Print is materially different: five product implementations render the current model in the browser and invoke the browser print dialog. They do not use the Exchange conversion endpoints for the print compositor itself.

“Frontend application with no application backend” can still use an externally hosted conversion service; that is not the same requirement as “no backend/network conversion.” A relative `/universer-api` URL or a development proxy still requires a service. Returning a snapshot instead of a persisted unit does not eliminate that service.

## Six-product matrix

Paths below are relative to the inspected `univer-pro` checkout. Line references identify the implementation, not a claim of successful execution.

| Product | Exchange file path | Print path | Minimal entry after the product editor is initialized |
| --- | --- | --- | --- |
| Sheets | XLS/XLSX/CSV/TSV import; XLSX/CSV/TSV export. Default HTTP-backed, including snapshot APIs. | Browser canvas pages + `window.print()`; native preview/configuration. | Register `UniverSheetsExchangeClientPlugin` and shared Exchange; load both `/facade` modules. `importSheetToSnapshotAsync(file)` / `exportSheetBySnapshotAsync(snapshot, format, sheetId)`. For print register `UniverSheetsPrintPlugin`, load its `/facade`, then `getActiveWorkbook()?.openPrintDialog()`. |
| Docs, modern and traditional | DOC/DOCX import; DOCX export. Default HTTP-backed. Import supports `{ docType: ExchangeDocType.MODERN }` or `TRADITIONAL`. | Browser document layout/canvas + `window.print()`; modern document pagination is handled in the print service. | `UniverDocsExchangeClientPlugin`; `importDocToSnapshotAsync(file, options)` / `exportDocBySnapshotAsync(snapshot)`. `UniverDocsPrintPlugin`, native print menu or `executeCommand('docs.operation.print')`. |
| Slides | PPT/PPTX import; PPTX export. Default HTTP-backed. | Browser slide/handout layout, iframe + `printWindow.print()`. | `UniverSlidesExchangeClientPlugin`; `importSlideToSnapshotAsync(file)` / `exportSlideBySnapshotAsync(snapshot)`. `UniverSlidesPrintPlugin`; native dialog or `executeCommand('slide.operation.print-open')`. |
| Boards | Current product service/Facade exposes **PPTX export only**, by unit ID or snapshot. No file import method in the inspected Board Exchange API. | Browser active-board-page canvas and iframe print; **PNG/JPEG export is also browser-local** in Boards Print, not Exchange. | `UniverBoardsExchangeClientPlugin`; `exportBoardBySnapshotAsync(snapshot)`. `UniverBoardsPrintPlugin`; `executeCommand('boards-print.operation.print')` or `executeCommand('boards-print.operation.export-image', { format: 'png' })`. |
| Bases | XLS/XLSX/CSV/TSV import; XLSX/CSV/TSV export. Default HTTP-backed. Structure mode, formula policy, name-row handling and table selection are conversion options, not local converters. | No dedicated `bases-print` package or Base native print command/Facade found in inspected Base/Base UI source. **Unverified/not established**, not a claim that every possible Base printing integration is impossible. | `UniverBasesExchangeClientPlugin`; `importBaseToSnapshotAsync(file)` / `exportBaseBySnapshotAsync(snapshot, format, tableId)`. No proven standalone Base Print hookup to recommend. |
| PDFs | PDF file import/export uses the same remote Exchange chain. Local `IPdfUnitData` and qpdf JSON conversion/providers are separate capabilities. | Complete materialized PDF model, local canvas compositor, iframe + `printWindow.print()`. | `UniverPdfsExchangeClientPlugin`; `importPdfToSnapshotAsync(file)` / `exportPdfBySnapshotAsync(snapshot)`. `UniverPdfsPrintPlugin`; `executeCommand('pdf.operation.print')`. |

These are incremental entry points, not complete initialization bundles. Keep the normal product model/render/UI plugins, official CSS/locales and applicable licensing configuration. Package registration alone does not prove asset availability, permissions, print fidelity or offline readiness.

Input extensions above follow the shared file-picker mapping at `packages/exchange-client/src/services/utils/content-type.ts:13` (including legacy DOC/PPT). They are not a file-format fidelity acceptance result; the Docs Facade documentation specifically describes DOCX.

### Product evidence

- Sheets: `packages/sheets-exchange-client/src/services/sheet-exchange.service.ts:46,53,69,84`; Facade `src/facade/f-univer.ts:140,144,148,156`. Print: `packages/sheets-print/src/services/sheet-print.service.ts:43,60,103`; `src/facade/f-workbook.ts:149,153`.
- Docs: `packages/docs-exchange-client/src/services/doc-exchange.service.ts:57,64,74,81`; Facade `src/facade/f-univer.ts:91,95,99,103`. Print: `packages/docs-print/src/services/doc-print.service.ts:101,132,135,224,289`; command `src/commands/operations/doc-print.operation.ts:11`.
- Slides: `packages/slides-exchange-client/src/services/slide-exchange.service.ts:54,57,66,73`; Facade `src/facade/f-univer.ts:100,104,108,112`. Print: `packages/slides-print/src/services/slide-print.service.ts:41,61,107,160,169`; command `src/commands/operations/slide-print-dialog.operation.ts:7`.
- Boards: complete file-facing interface/service `packages/boards-exchange-client/src/services/board-exchange.service.ts:34,47,55`; complete Facade `src/facade/f-univer.ts:7,70,74,78,82`. Print/image: `packages/boards-print/src/commands/operations/board-output.operation.ts:11,44`; compositor `src/services/board-print.service.ts:80,114,172,463,502`.
- Bases: `packages/bases-exchange-client/src/services/base-exchange.service.ts:47,54,70,78,136`; Facade `src/facade/f-univer.ts:112,116,120,128`. The negative print finding is bounded to package-directory inventory, Base Facade, `bases-ui/src` and `examples/src/bases-advanced/main.ts`; it has no affirmative runtime test.
- PDFs: `packages/pdfs-exchange-client/src/services/pdf-exchange.service.ts:49,53,61,69`; Facade `src/facade/f-univer.ts:100,104,108,112`. Print `packages/pdfs-print/src/services/pdf-print.service.ts:44,63,94,190`; command `src/commands/operations/pdf-print.operation.ts:7`.

## Exact HTTP chain

`packages/exchange-client/src/services/request.service.ts`:

| Operation | Default endpoint | Evidence |
| --- | --- | --- |
| Upload file or compressed snapshot | `/universer-api/stream/file/upload` | constant line 12; FormData upload method line 238; POST line 260 |
| Start import | `/universer-api/exchange/{type}/import` | constant line 14; POST line 287 |
| Start export | `/universer-api/exchange/{type}/export` | constant line 16; POST line 310 |
| Poll task | `/universer-api/exchange/task/{taskID}` | constant line 18; GET line 335 |
| Resolve artifact URL | `/universer-api/file/{fileID}/sign-url` | constant line 20; GET line 371 |
| Read converted JSON/artifact | signed URL returned by service | JSON GET line 382; `exchange.service.ts:335` resolves output then downloads it |

`packages/exchange-client/src/services/exchange.service.ts:201` implements snapshot import: upload at 206, poll at 217, sign URL at 242, then download/parse JSON. Snapshot export at 268 serializes and compresses locally but **uploads** at 282, starts remote export at 296, polls at 316 and downloads the signed artifact at 335. Unit-ID import at 123 uploads too. `getFileById` at 112 also signs/fetches a remote resource.

Supported URL configuration is in `packages/exchange-client/src/config/config.ts:5`: `uploadFileServerUrl`, `importServerUrl`, `exportServerUrl`, `getTaskServerUrl`, `signUrlServerUrl`, `downloadEndpointUrl`, `maxTimeoutTime`. The first five change server routes, not execution location. The plugin installs the network dependency and concrete default services at `packages/exchange-client/src/plugin.ts:23,46,51,52`.

### Minimal service-backed example (not offline)

The existing product editor and a reachable, authorized Exchange service are prerequisites. The inspected `examples/src/sheets-advanced/main.ts:187` configures all six endpoint URLs explicitly.

```ts
import { UniverExchangeClientPlugin } from '@univerjs-pro/exchange-client';
import { UniverSheetsExchangeClientPlugin } from '@univerjs-pro/sheets-exchange-client';
import '@univerjs-pro/exchange-client/facade';
import '@univerjs-pro/sheets-exchange-client/facade';

univer.registerPlugin(UniverExchangeClientPlugin, {
    // Defaults use same-origin /universer-api routes; configure actual service URLs when needed.
    maxTimeoutTime: 120_000,
});
univer.registerPlugin(UniverSheetsExchangeClientPlugin);

// This sends file content to the configured Exchange service.
const snapshot = await univerAPI.importSheetToSnapshotAsync(file);
if (!snapshot) throw new Error('Exchange did not return a workbook');
univerAPI.createWorkbook(snapshot);
```

## Is there an official local provider?

No browser Office/PDF **file conversion provider** was found in the inspected Exchange package configurations, implementations, public exports, installed type declarations, or advanced/local examples. A bounded search across checkout package/example TypeScript for `LocalProvider`, `localProvider`, `ExchangeProvider`, `LocalExchange`, `local-exchange`, `localImport`, `importProvider`, and `converterProvider` found no such adapter. This is a finding about this checkout/install, not all future releases or private distributions.

- `IExchangeService` is publicly exported (`packages/exchange-client/src/index.ts:4`) and describes an injectable service boundary. That does not supply a local converter. The stock plugin unconditionally registers the HTTP implementation; its config exposes no documented local-provider/override option. No untested DI override recipe is claimed here.
- `ClientSnapshotServerService` (`packages/exchange-client/src/services/utils/snapshot.ts:137,139,230`) caches snapshot blocks for model/protocol serialization. Despite its name it is **not** an XLSX/DOCX/PPTX/PDF parser or exporter.
- PDF has real official in-memory page/resource providers: `packages/pdfs/src/providers.ts:41,42` accepts an already materialized `IPdfUnitData`; `packages/pdfs/src/index.ts:479` exports it. `convertQpdfJsonToPdfDocument` (`src/index.ts:50`, `src/converters/qpdf-json.ts:151,157`) accepts parsed qpdf JSON, not PDF bytes. A local preprocessed PDF model can be opened with `createPdf(data)` (`src/facade/f-univer.ts:70`).
- PDF resource I/O is a distinct extension point. `packages/pdfs-exchange-client/src/plugin.ts:40` installs `PdfExchangeResourceIoService` only when `IPdfResourceIoService` is absent. This permits supplying resource URL resolution, not file conversion. Its stock loader calls Exchange `getFileById` (`src/services/pdf-exchange-resource-io.service.ts:40`) and creates a blob URL after download; blob URLs do **not** prove offline conversion.
- Slides advanced imports `examples/src/embed/embed-demo-local-fixture-provider.ts`; its functions at lines 29,33,47 provide **embed resource references/data**, not Exchange conversion. Do not relabel them as an import/export local provider.

## Print is browser-local, but offline is a separate acceptance gate

The five print compositors above create canvas/DOM/iframes and invoke browser printing. Saving to PDF from the operating system/browser print dialog is not the same as `exportPdfBySnapshotAsync`, editable Office-file export, or a returned programmatic PDF `File`.

Print preparation can load embedded content and images. Shared contributions run at `packages/print/src/services/print-preparation.service.ts:33,38`; `packages/embed-ui/src/services/embed-print.service.ts:105,249,263,685` prepares embeds and preloads image sources. PDF uses resource resolvers (`packages/pdfs-print/src/services/pdf-print.service.ts:74`). Therefore remote image/font/resource URLs or server-backed embed data may still make a document network-dependent even when the print compositor is local. Browser dialog permission, page counts, watermark/license behavior, glyph completeness, asset readiness, edited-state fidelity and actual generated output require separate runtime tests.

## Installed beta.2 versus checkout

Checkout root: `<USERPROFILE>/Documents/GitHub/office_document/univer-pro`.
Checkout HEAD: `a58c4237e86bf8fcaad7863aa1d1919a647624f7`. Working tree source was inspected as present; HEAD alone does not identify uncommitted content.
Installed root: `<USERPROFILE>/Documents/GitHub/office_document/documentation/node_modules/@univerjs-pro`.

| Package | Directly installed here | Checkout package |
| --- | --- | --- |
| exchange-client | 1.0.0-beta.2 | 1.0.0-beta.2 |
| sheets-exchange-client | 1.0.0-beta.2 | 1.0.0-beta.2 |
| docs-exchange-client | absent | 1.0.0-beta.2 |
| slides-exchange-client | 1.0.0-beta.2 | 1.0.0-beta.2 |
| boards-exchange-client | absent | 1.0.0-beta.2 |
| bases-exchange-client | absent | 1.0.0-beta.2 |
| pdfs-exchange-client | 1.0.0-beta.2 | 1.0.0-beta.2 |
| sheets-print | 1.0.0-beta.2 | 1.0.0-beta.2 |
| docs-print | absent | 1.0.0-beta.2 |
| slides-print | 1.0.0-beta.2 | 1.0.0-beta.2 |
| boards-print | absent | 1.0.0-beta.2 |
| bases-print | absent | absent |
| pdfs-print | absent | 1.0.0-beta.2 |

“Absent” means no package.json at that exact direct installation path, not unavailable from the registry or another selected-export directory. No installation was attempted.

Installed `exchange-client/lib/types/config/config.d.ts:3` and `lib/types/index.d.ts:3` expose the same inspected URL config/service boundary. Installed obfuscated `exchange-client/lib/index.js:1` contains all five exact default `/universer-api` routes plus `HTTPService` and `FormData`; it was read as text, never imported/executed. Installed Sheets Exchange Facade declarations describe XLS/XLSX/CSV/TSV and snapshot APIs; installed Slides Print declares `SlidePrintOperation`. Equal version strings do not prove byte-for-byte implementation equality, and checkout-only product capabilities must not be presented as already installed/verified.

## Recommendation for the frontend-only showcase

Keep native snapshot save/load, native print and local image export runnable using bundled data/assets. Label standard Office/PDF conversion examples **service-backed** until an actual official local converter is supplied and accepted. Do not silently replace real file conversion with fake JSON import or claim `import...ToSnapshotAsync` is offline. For Bases Print and raw file local conversion, keep the evidence gap explicit. No capability in this report has been counted as runtime PASS.

Report validation: JSON parsed successfully; all 24 source references in `report.json` resolve to existing files and valid line numbers. This validates the report structure, not the runtime capabilities.
