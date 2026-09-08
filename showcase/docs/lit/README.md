# Docs in a Lit custom element

This minimal example mounts the official Docs Core preset inside an open Shadow DOM. The same installed preset CSS is imported globally for SDK portals and bundled as a local stylesheet asset inside the shadow root. No CDN stylesheet or copied approximation is used.

`createDemo()` creates one `univer-docs-lit-demo` element. `setDarkMode(boolean)` updates that element's existing Univer owner; it does not recreate the document. Removing the element disposes its captured owner in a microtask so an enclosing React commit can finish safely. Reconnecting creates a fresh document, as expected for a new mount. The custom element is registered only once.

The SDK Facade is available as `window.univerAPI` while mounted. The Preview uses the same factory and preserves native document edits across next-themes updates. The complete official English preset locale is included; the SDK stays English regardless of the host page language. The legacy third locale argument is accepted but ignored.

Run `scripts/test-docs-lit-watermark-theme.mjs` with `SHOWCASE_MODE=lit` and `SHOWCASE_VITE_MODULE` pointing to the installed Vite module for selected EN/ZH native typing, full saved-document equality, owner identity, CSS and teardown checks. `scripts/test-showcase-lit-css.mjs` additionally verifies the bundled shadow CSS bytes and reconnect behavior.

Earlier EN/ZH runtime reports describe the old bilingual setup, not acceptance of the current English-only requirement. Shadow-root and portal styles remain official CSS; this change does not replace native editing or reconnect checks.
