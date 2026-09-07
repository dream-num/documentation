# Willow responsive width and native zoom — strict acceptance

Final selected run: **23 / 28 gates PASS, 5 strict FAIL; all 6 README literals execute**.
The process exits 1 deliberately. No SDK/dependency files, shared catalog,
package scripts or public covers were changed. The original data.ts is unchanged.

## Scope and source

The native-only cleanup removes the host zoom input and unused fixture/inspect
styles. Only host width and reading width controls remain; the real SDK footer
owns zoom. Its SetDocZoomRatioOperation event drives reflow, which reads the actual
document model settings instead of a separate host zoom variable. Reflow is the
existing lower-level JSONX RichTextEditingMutation with noHistory, explicitly
described as such, not a made-up FDocument setter.

Five official CSS files and complete core, drawing, chart, column and table EN/ZH
packs are imported in the shared factory. Chinese host labels and all 12 variant,
3 action and 3 state labels are present. Preview themes use the current same
container owner and do not reload the fixture. Same-ID saved factory input skips
original initialization, validates before ownership, and displays its saved
reading width. The lifecycle controller is available as window.willowDemo;
it is not advertised as a Facade API.

## Verified positive evidence

- Original 14 nursery paragraphs and their IDs survive initialization. The two
  original shift columns, all 4×3 TASKS values, COUNTS values (84,126,53), chart and
  exact original CC0 SVG map source are checked against data.ts. Unit ID remains
  willow-responsive. No generated replacement ID is used for recovery.
- Native Grid toolbar/footer and canvas appear in normal export. The opening
  screenshot waits for the actual statistics to report **163 words**; Chinese
  initial UI reports **字数 163**. No timer or patched counter supplies this value.
- Real host controls at 960/600/390/320, focused/comfortable/wide reading values,
  native footer 50/100/150/200 input and native 150% menu selection are exercised.
  Empty and invalid footer inputs retain the complete previous model.
- Real keyboard selection retains its exact offsets and native screen polygon
  bounds during the four host-width changes. No preset selection button, custom
  selection renderer or raw geometry panel exists in the demo.
- Real keyboard text is observed in both the document and native fillText calls.
  Native text Undo and Redo both pass complete structuredClone/deep equality.
- Same-owner dark/light changes preserve the complete edited model. A recreated
  same-ID owner responds to fresh native zoom and text input; those interaction
  gates are independent from full saved equality failures.
- Invalid saved input rejects without mutating the live owner. Double dispose,
  immediately pending owner disposal and disposal during the actual asynchronous
  initialization boundary pass. For the latter, the real chart command event
  schedules disposal before the continuation inserts the map: one column group
  and one chart drawing exist; willow-map does not; two frames later no root or
  global owner remains. No SDK method is replaced to force that timing.
- Widening the failed phone/150% host and using native 100% restores the actual
  page and drawing widths. This does not make the narrow/high-zoom case pass.
- Normal runtime console/page errors and backend requests arrays are empty.
  The caught layout error remains visibly reported and fails its own gate.

## Five strict failures retained

1. **Phone 390px / 150% layout**: after the host operation actually finishes,
   the visible alert says `Cannot read properties of undefined (reading 'breakType')`.
   The model width is approximately 249.33 while the native skeleton retains
   its previous 374 width. Native content is visibly clipped; not accepted.
2. **Focused reading chart frame**: at reading width 640, the drawing model
   width is approximately 506.67 but the actual visible frame width stays 520.
3. **Literal text edit → resize cycle → full history**: text body Undo/Redo is
   correct, but DOC_DRAWING_PLUGIN's serialized resource string changes object
   field ordering (including width/height). Both complete resource comparisons
   differ. The test does not parse/reorder this opaque resource to claim equality.
4. **Same-ID saved whole-owner recovery**: recreated drawing transform objects
   omit explicit undefined clipBounds/flipX/flipY properties present in the saved
   model. Full deep equality fails even though content and fresh editing work.
5. **Empty same-ID document → complete saved restoration**: the same optional
   transform property difference fails complete equality again.

The live checks preserve undefined properties via structuredClone and strict
deep equality. JSON report files are serialization artifacts, not inputs used to
normalize those assertions. Test-side render-manager/skeleton observation is
read-only and is not presented as a public Facade recipe.

## Commands, export and screenshots

Dedicated script: scripts/test-willow-responsive-native.mjs. It defaults to
http://localhost:3030/en-US/playground/docs-modern/responsive-width-and-zoom and
accepts SHOWCASE_DEMO_URL, SHOWCASE_BASE_URL and SHOWCASE_RESULTS_DIR.

Preparation: `node scripts/test-willow-responsive-native.mjs --prepare`.
Normal selected export manifest: test-results/willow-responsive-native-export/manifest.json.
Directory: C:/Users/wbfsa/AppData/Local/Temp/univer-willow-native-wSL6yT.
All **10 normal source files** match exactly, including README and Preview source.
Only individual, exact-version package junctions are used; no installation or
whole-node_modules link. No harness-only renderer or bundle is involved.

Selected Vite 8.2.2 build PASS: 1,824 modules, CSS 96.96 kB, main JS 15,199.10 kB
(index-CU4MWPNd.js). Existing chunk-size/module-type warnings were not hidden.
Scoped `node node_modules/typescript/bin/tsc --project test-results/willow-responsive-native/tsconfig.json`
and `node node_modules/oxlint/bin/oxlint showcase/docs-modern/responsive-width-and-zoom scripts/test-willow-responsive-native.mjs`
both PASS without diagnostics in the final scoped check.

Actually viewed: opening-settled.png (cover candidate, 163 words),
map-chart-handover.png, phone-150.png (including the settled visible failure),
selection-320.png, initial-zh.png. These are actual SDK canvas/UI, not mockups.
The normal export still shows the SDK's native trial-license watermark; it was
not removed. Parent owns public cover, package entry and coverage integration.

Own preview service session 20097 / PID 84304 was stopped after final testing;
port 4414 was checked and has no listener. Other services were not touched.

Ponytail influenced the implementation by deleting the duplicate zoom control and
reusing native operation/events and the existing reflow path. It did not relax
validation, lifecycle handling or strict SDK failure gates.
