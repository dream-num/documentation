# Mosaic lists/tasks native verification

Final result: **32/35 gates passed; 3 strict failures retained**. Test: `scripts/test-mosaic-lists-native.mjs`; full results: `report.json`. All 27 README code blocks were executed in their documented order/independent contexts, including the intentionally strict failing scope regression.

## Changes

- Preserved the complete original 27-paragraph, six-section pop-up museum brief, 13 list/task items, three borrowed objects, five installation steps, two handoff steps and three tasks (one completed), plus real callout/code/quote/hyperlink blocks.
- LABEL and LIGHT now start as meaningful nested preparation steps. Native named styles replace direct heading font overrides.
- Removed the entire host fixture/format/edit/history/reset/readback interface and handlers. Native Grid, document canvas, task checkboxes and menu controls are the interaction surface.
- Shared factory/export imports six official CSS files and all six complete EN/ZH packs. Initial language follows page lang. React Preview retains its owner across theme effects; the runtime test verifies same-owner theme changes with an edited document. A separate full Next/React navigation test was not run.
- README documents 27 literal Facade examples; item/level/list scope, four marker variants, level/list prefix-suffix, restart/continue, task states, native selection, text history, snapshots, empty/restore and explicit integration input/nesting guards remain available without a second toolbar. Metadata retains bilingual variants/actions/states.

## Passing evidence

Native white workbench/Grid; all original blocks and list items; a/b nested markers and indentation; decimal/letter/diamond markers; visible restart 7 and continuation; visible Step n: and Prep n) formats; exact selection ranges for one item, two same-level items and all five installation items; task complete/reopen; literal text edit complete-model Undo/Redo; guarded invalid numbers and level boundaries; two real nesting commands with two Undo calls; edited snapshot recreation and empty/restore with complete-model and canvas checks; actual native keyboard input with full Undo/Redo; actual native bullet menu and native canvas checkbox rendering; full EN/ZH pack comparison, initial Chinese UI, edited theme owner preservation and disposal. Runtime errors and backend requests are both empty.

## Strict remaining failures

1. `literal-8-strict-single-item-scope`: uppercase same-level edit followed by a Roman single-item edit also changes LIGHT's marker definition. The README snippet throws rather than claiming success.
2. `native-bullet-menu-full-history`: native conversion renders, but Undo changes OPEN's `para_mosaic_12` ID to a generated paragraph ID.
3. `native-checkbox-full-history`: the native EXIT checkbox visibly checks/strikes through; Undo changes KEYS' `para_mosaic_20` ID to a generated paragraph ID.

Full snapshots are compared without deleting empty arrays, repairing paragraph IDs or replacing SDK results. Same-unit-ID edited reconstruction (snippet 22) and captured-baseline restoration (snippet 24) both pass exact equality including the unit ID, plus a newly rendered native canvas. Snippet 23 uses the fixed separate ID `mosaic-empty`. No timestamp-derived IDs or test-side ID substitutions remain. Redo after the two failing native Undo assertions remains unaccepted because those strict checks stop at the mismatch. No SDK/node_modules changes or hidden repair code were added.

## Build and commands

- Normal selected-case source export: `test-results/mosaic-lists-export/manifest.json`, **9 files**.
- Standalone directory: `C:/Users/wbfsa/AppData/Local/Temp/univer-mosaic-lists-VfwGuR`.
- **14 separate exact-version package junctions**, including Vite 8.2.2 and SDK beta.2. No whole-node_modules junction, installation or dependency copying.
- Selected-only production build: `node C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite/bin/vite.js build` in that directory: PASS (bundle-size warning only).
- Runtime: set `SHOWCASE_DEMO_URL=http://127.0.0.1:4392/`, then `node scripts/test-mosaic-lists-native.mjs test-results/mosaic-lists-export/manifest.json`: exits 1 intentionally for the three retained failures.
- Targeted TypeScript with `--ignoreConfig --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution bundler --jsx react-jsx`, existing Vite `client.d.ts`, and this case's factory/data/Preview: PASS.
- `node node_modules/oxlint/bin/oxlint showcase/docs-modern/lists-task-items scripts/test-mosaic-lists-native.mjs`: PASS; targeted `oxfmt` and `git diff --check`: PASS.
- Port 4392 was verified free before both runs. Original preview session 98489 and follow-up same-ID verification session 5503 were stopped; final listener queries found no 4392 listener. Other services were not touched. The follow-up only updated the exported README source; the normal production bundle did not change.

## Screenshots actually inspected

- `opening.png` (also initial `../mosaic-lists-export/opening-probe.png`): original native white document, Grid toolbar, object bullets, a/b nested installation steps and opening task.
- `native-checkbox.png`: actual checked/struck-through EXIT task.
- `step-markers.png`: actual Step 1:/a:/b:/2:/3: glyphs.
- `operating-notes.png`: lower-document native scroll, all three task states, sunlight callout, highlighted operating code, quotation and guide link.
- `reconstructed.png`: same-unit-ID edited reconstruction with the original list structure and completed EXIT task visibly rendered again.

`opening.png` is the cover candidate; no shared/public cover or metadata.image was changed. Only this case, its dedicated new test and its unique result/export directories were edited. Shared ledgers, package scripts and SDK sources remain the parent's responsibility. Nothing was committed.
