# Custom shortcuts / Swift dispatch

This single-feature example retains three original van assignments and three SDK cost formulas. Select cells in the native grid. Delete (macOS: Backspace) clears contents, retaining formatting. **Only C3 alone expands to A3:H3**; every other selection keeps its own bounds. An already-empty target does not call clearContent. The Host input is intentional: the shortcut must leave normal text editing alone.

Registration is the existing SDK **ICommandService + IShortcutService**, with priority 9999 and **whenSheetEditorFocused**. The predicate excludes active cell editors and non-Univer focus. There is no Facade shortcut-registration method. The command resolves the current worksheet/selection and calls the real **FRange.clearContent()**. `installClearShortcut` in create-demo.ts contains the complete registration and returns a disposable for both registrations; it is demo integration code, not an SDK Facade API.

Native Grid, official Sheets Core CSS and its complete English pack share the Preview/export factory. Native UI and host messages stay English on either host language; the registration helper ignores its legacy language argument. Theme changes keep the current owner and edits. There are no fixed-selection buttons, Reset, fixture or raw-readback panels. The concise status reports actual clear/no-op/error results only. Earlier bilingual reports are historical; rerun native tests for current English-only acceptance.

## Literal recipes

Run 1 first; reload between independent experiments. `window.univerAPI` is the actual Facade. `window.swiftDemo` exposes this demo's real controller and registration, not a replacement spreadsheet API. After changing selection from the console, click that cell/range in the native grid before testing the physical key; activating a range does not itself focus the browser's native editor.

### 1. Capture the complete model and resolve current resources

```ts
window.swiftSaved=structuredClone(window.univerAPI.getActiveWorkbook().save())
window.swiftSheet=()=>window.univerAPI.getActiveWorkbook().getActiveSheet()
```

### 2. Special single-cell target

```ts
window.swiftSheet().getRange('C3').activate()
```

Press Delete in C3: all eight row contents, including =C3*D3, clear. Yellow C3 fill and currency styles remain.

### 3. Ordinary rectangular target

```ts
window.swiftSheet().getRange('B4:C5').activate()
```

Press Delete in this native selection: only those four cells clear. Cost formulas outside the selection remain and recalculate.

### 4. Direct Facade action without a synthetic keyboard event

```ts
window.swiftSheet().getRange('B4:C5').clearContent()
```

This is the command's content-clearing API, not a shortcut invocation. Unlike the custom command's empty guard, callers of this direct operation own no-op decisions.

### 5. Read the actual values, formulas and fill

```ts
window.swiftObserved={values:window.swiftSheet().getRange('A3:H5').getRawValues(),formulas:window.swiftSheet().getRange('A3:H5').getFormulas(),backgrounds:window.swiftSheet().getRange('A3:H5').getBackgrounds()}
```

### 6. Native Undo

```ts
await window.univerAPI.undo()
```

### 7. Native Redo

```ts
await window.univerAPI.redo()
```

### 8. Release this custom registration

```ts
window.swiftDemo.registration.dispose()
window.swiftDemo.registration.dispose()
```

This releases the SDK command and keyboard binding idempotently. It does not disable normal native Delete; C3 then clears only C3 using the built-in behavior. Recreate the owner (recipe 9 or 10) to install this example's registration again.

### 9. Save edited data and reconstruct the same original ID

```ts
const old=window.swiftDemo,saved=structuredClone(window.univerAPI.getActiveWorkbook().save())
window.swiftEdited=saved
old.dispose()
old.createDemo(old.container,false,saved)
```

### 10. Recover the complete captured baseline

```ts
const old=window.swiftDemo
old.dispose()
old.createDemo(old.container,false,structuredClone(window.swiftSaved))
```

### 11. Exercise native formula editing through the actual Facade

```ts
window.swiftSheet().getRange('C3').setValue(7)
```

E3 recalculates from 252 to 294 using the SDK formula engine. This small numeric variation is sufficient; no additional business dataset is loaded.

### 12. Reinstall the real service registration after releasing it

Run 8 first. This calls the same exported setup function used by createDemo.ts, with the actual Univer owner and Facade. Its implementation registers ICommandService / IShortcutService; this is not a new Facade method.

```ts
window.swiftReinstalled=window.swiftDemo.installClearShortcut(window.swiftDemo.univer,window.swiftDemo.univerAPI)
```

### 13. Release that new registration

```ts
window.swiftReinstalled.dispose()
window.swiftReinstalled.dispose()
```

## Verification boundary

The dedicated native test compares complete live snapshots without JSON normalization or replacement IDs, checks actual glyphs/canvas and keyboard focus, row/range clearing, repeated empty no-op, history, release/fallback, same-ID recovery, disposal, locales/themes and exact normal source export parity. Any SDK history/recovery differences remain strict failures. Chromium with a simulated macOS platform can verify key mapping but is not physical macOS validation.
