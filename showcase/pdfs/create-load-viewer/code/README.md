# PDF viewer lifecycle

Run `pnpm install`, then `pnpm dev`. Use `pnpm build` and `pnpm preview` for the independent production build.

`src/create-demo.ts` is shared with the documentation Preview. It registers the installed PDF editor plugins and imports five official SDK stylesheets; `src/styles.css` styles the host controls only. The four-page Kestrel audit in `src/data.ts` is fictional, with distinct cover, findings table, embedded original schematic and sign-off pages. No upload or backend is required.

## Operations and outcomes

Expand **Demo controls / Viewer lifecycle** to operate the host actions. It starts collapsed to leave room for the native toolbar, page canvas and footer; this does not hide or restyle SDK controls.

- **Load audit packet / Reset:** recreates the original cached snapshot with `createPdf()`, replacing edits and history.
- **New blank PDF:** creates one empty page, not an absent viewer. Repeated loads use the cached blank snapshot.
- **Set review decision:** calls `FPdfTextBox.setText()` on the sign-off object. It is disabled if the target is missing or already contains that exact text. Page navigation uses the public PDF runtime service, not a search Facade.
- **Undo / Redo:** calls the SDK Facades. Button availability and the review decision are read from current SDK state. Double-click native sign-off text to try custom editing and history.
- **Dispose viewer:** saves the current snapshot in memory, then disposes the owning `Univer` and removes its canvases.
- **Remount saved snapshot:** uses a new owner in the same container, retaining text, tables and image bytes but not viewport, selection or Undo history. It is available only while no viewer is mounted.
- **Reject invalid snapshot:** demonstrates a host check for a missing document before disposal; the existing viewer, snapshot and history remain unchanged. This is not validation of arbitrary untrusted JSON or binary files.
- **Download snapshot:** downloads the actual `save()` result as JSON. This is not a binary PDF export; Exchange conversion is a separate capability.

Live SDK readback refreshes automatically. Startup and remount readiness wait for the SDK Rendered lifecycle. The authored audit date is fixed, but SDK-generated timestamps and IDs are not globally frozen. Full snapshot equality is checked within the current session.

Theme changes reset the original packet. Closing this browser session loses the in-memory saved snapshot; download JSON first if needed. Typed review text is not an electronic signature. Trial watermarks remain, and cross-browser, assistive-technology and every pending-operation race are not yet certified.
