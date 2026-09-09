# Custom formula gallery

This frontend-only example registers three functions through `FFormula`: strict numeric `CUSTOMSUM`, asynchronous scalar `CUSTOM_ASYNC_OBJECT`, and asynchronous spilling `CUSTOM_ASYNC_ARRAY`. The source is deterministic simulated data, not a backend or worker.

Edit B4 directly in the native grid: `NORTH`, `EAST`, `EMPTY`, `MISSING`, `FAULT`, or `TIMEOUT`. Normal source work takes 400 ms; the deadline is 800 ms. Scalar and table lookups share pending requests and successful cached results. Native cells may retain their old result until the calculation is applied.

Only three extra controls remain because they demonstrate function/source behavior beyond cell editing:

- **Recalculate with cache** calls `executeCalculation()` without clearing successful results. Requests should stay unchanged while cache hits increase.
- **Reload source** clears the local source cache and calls `executeCalculation()`. Requests increase even if cell inputs did not change.
- **Unregister lookups** disposes the two registration handles. Native cells become `#NAME?`; `CUSTOMSUM` remains registered. Re-registering requires a saved-snapshot reload in SDK beta.2 to clear stale unknown-function nodes. It preserves cell edits but **discards Undo history**, as the button explicitly states.

The counters are source diagnostics, not substitute formula results. B13:B16 demonstrate dependencies and real formula errors; B19:B24 show blank, zero, negative/fractional, numeric-text, boolean and overflow behavior. This intentionally strict function is not an implementation of all Excel `SUM` coercions.

Theme changes call `toggleDarkMode()` on the same owner and preserve edited data and native Undo/Redo. There is no fixture reset or JSON readback panel. Core CSS is imported by the exported factory, and the complete English core locale pack is registered. Native UI, data and host controls stay English on either host language; the legacy third locale argument is ignored. Earlier bilingual results are historical and need a current native rerun.

Disposal cancels local source timers and waits for the SDK to consume settled promises before releasing its owner. Arbitrary third-party promises that never settle, all concurrent registration races, clean package installation and cross-browser accessibility are not certified by this example.
