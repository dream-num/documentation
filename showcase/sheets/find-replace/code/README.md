# Pelican / Native find and replace

Open native Find with Ctrl/Cmd+F while the sheet has focus. The existing two small
seed-library tables distinguish mixed case, repeated occurrences, zero, Unicode,
missing notes and formula text versus calculated results. No host search engine,
fixture picker, Reset or inspector is rendered. Both official CSS imports and
complete EN/ZH core/find packs ship in the exported factory. Themes retain edits.

In Advanced Searching & Replace, changing Match the Whole Cell invalidates the
old results. Wait for that native state change, then click Find to run the
configured search. Case Sensitive also triggers a native search. The pager
highlight is independent of the editing selection.

Run the following literals against `window.univerAPI`, with native Find closed.
Do not use an old finder after editing its source or switching sheets. Finish
pending operations and dispose the finder before disposing its owning SDK.

## Current-sheet search

The explicit single-cell selection avoids inheriting a prior rectangular search
scope. Match counts are cells, not occurrences: E2 contains draft twice.

```ts
window.univerAPI.getWorkbook('pelican-seeds').getActiveSheet().getRange('A1').activate()
window.pelicanFinder?.dispose()
window.pelicanFinder = await window.univerAPI.createTextFinderAsync('draft')
console.log(window.pelicanFinder?.findAll().map(range => range.getA1Notation()))
```

## Case-sensitive and entire-cell variants

```ts
await window.pelicanFinder.matchCaseAsync(true)
console.log(window.pelicanFinder.findAll().map(range => range.getA1Notation()))
```

```ts
await window.pelicanFinder.matchEntireCellAsync(true)
console.log(window.pelicanFinder.findAll().map(range => range.getA1Notation()))
```

## Move the actual native selection

```ts
window.pelicanFinder.findNext()?.activate()
```

```ts
window.pelicanFinder.findPrevious()?.activate()
```

## Replace only the case-sensitive whole-cell label

Run after the preceding configuration. In the original Current stock sheet this
targets C3. Other case variants and the previous season remain unchanged.

```ts
console.log(await window.pelicanFinder.replaceAllWithAsync('Reviewed'))
window.pelicanFinder.dispose()
```

## Formula text, not its displayed result

```ts
window.univerAPI.getWorkbook('pelican-seeds').getActiveSheet().getRange('A1').activate()
window.pelicanFinder = await window.univerAPI.createTextFinderAsync('UPPER')
await window.pelicanFinder.matchFormulaTextAsync(true)
console.log(window.pelicanFinder.findAll().map(range => range.getA1Notation()))
console.log(await window.pelicanFinder.replaceAllWithAsync('LOWER'))
window.pelicanFinder.dispose()
```

This changes B9's real formula; no JavaScript result is substituted. Calculated
results are searchable but value-mode replacement must not be assumed to edit a
formula. Inspect the native formula bar and use native Undo/Redo.

## Another worksheet

```ts
const book = window.univerAPI.getWorkbook('pelican-seeds')
book.setActiveSheet('archive')
book.getActiveSheet().getRange('A1').activate()
window.pelicanFinder = await window.univerAPI.createTextFinderAsync('draft')
console.log(window.pelicanFinder.findAll().map(range => range.getA1Notation()))
window.pelicanFinder.dispose()
```

## Replace the current actual match with empty text

On Current stock, this removes only the matched Unicode fragment in E8.

```ts
window.univerAPI.getWorkbook('pelican-seeds').setActiveSheet('current')
window.univerAPI.getWorkbook('pelican-seeds').getActiveSheet().getRange('A1').activate()
window.pelicanFinder = await window.univerAPI.createTextFinderAsync('海岸')
window.pelicanFinder.getCurrentMatch()?.activate()
console.log(await window.pelicanFinder.replaceWithAsync(''))
window.pelicanFinder.dispose()
```

## Save and reconstruct the same original owner ID

`window.pelicanDemo` is the shared demo controller, not an SDK Facade addition.
Await outstanding finder operations and release your finder first.

```ts
window.pelicanFinder?.dispose()
const old=window.pelicanDemo,saved=structuredClone(window.univerAPI.getWorkbook('pelican-seeds').save())
window.pelicanSaved=saved
old.dispose()
old.createDemo(old.container,false,saved)
```

## Recover the exact saved workbook

```ts
window.pelicanFinder?.dispose()
const old=window.pelicanDemo
old.dispose()
old.createDemo(old.container,false,structuredClone(window.pelicanSaved))
```

Try `0`, `海岸`, `A.B`, `A*B` and an unmatched term in the native panel. Empty
replacement removes matched text; the SDK trims query whitespace. **Do not use
a whitespace-only query for replacement:** in this SDK it matches all 43 non-empty
cells of Current stock, unlike an empty string. Partial `0` also matches batch
IDs (A2, A3, A7) as well as numeric D3; whole-cell matching is needed to isolate
the numeric zero. No external
address validator or fake success counter is needed. Native keyboard/panel scope,
replacement, complete history, empty/errors, fresh saved-owner recovery and
pending teardown require runtime checks; source parity alone does not certify them.

Strict acceptance currently retains complete-model Undo differences (added cell
type fields), the saved empty-name resource changing from an empty string to '{}',
and an asynchronous SDK callback after disposed-finder owner replacement. These
are not normalized or replaced with new IDs. Same-ID recipes demonstrate the
actual API path, not a guarantee that those SDK lifecycle/resource issues are fixed.
