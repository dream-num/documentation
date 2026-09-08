# Native Docs watermark

The official Watermark plugin paints the repeated `Hello, Univer!` text with the configuration in `create-demo.ts`. Content, opacity, font size, position and repeat spacing are plugin settings, not a host overlay. Edit the native document normally underneath it.

The Preview and export share one factory and official Docs Core CSS. The complete official English preset locale is included; the SDK stays English regardless of the host page language. The legacy third locale argument is accepted but ignored. The Preview keeps the same Univer owner when next-themes changes; edited document snapshots are not restored from a fixture or recreated. `window.univerAPI` exposes the real Facade while mounted. Disposal is idempotent and removes only this demo's root and owner.

The Watermark Facade also exposes `addWatermark()` and `deleteWatermark()` for application integration; no duplicate host controls are added here. This example is a visual watermark, not a data-security or copy-protection guarantee.

Run `scripts/test-docs-lit-watermark-theme.mjs` with `SHOWCASE_MODE=watermark` and `SHOWCASE_VITE_MODULE` pointing to the installed Vite module. It verifies actual watermark canvas paint, native typing, the complete edited document and same owner across dark/light updates in EN/ZH, then clean unmount with strict console and network-write checks.

Earlier EN/ZH runtime reports describe the previous bilingual setup, not acceptance of the current English-only requirement.
