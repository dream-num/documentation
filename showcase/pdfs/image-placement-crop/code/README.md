# Image placement and cropping

Run `pnpm install`, `pnpm dev`; verify production with `pnpm build` and `pnpm preview`.
The documentation Preview and independent export use the same factory, all five official SDK CSS imports,
and five complete English locale packs. Native UI and authored data remain English regardless of host language. Bilingual evidence below is historical, not current English-only acceptance.
Changing theme preserves the current document owner and edits.

## Native editing workflow

The Ridgeway trail-guide proof embeds an original summer illustration with editable captions.
A different original winter illustration is included in `data.ts` and the executable source-replacement blocks below.
No borrowed photographs, external image services or AI substitutions are needed.

Select the illustration in native Selection mode, then use View > Properties to inspect its geometry.
Edit its native position fields and use native Undo/Redo to compare the result. Native dragging is exposed,
but its Facade readback currently does not track the painted movement. The installed SDK does not expose
Crop image / Reset crop in this image's Properties or context menu; use the real Facade crop blocks below.
There are no host-side property, fixture, history or audit controls.

Positions and dimensions are PDF points; rotation is clockwise degrees. Facade crop edges describe a visible window
relative to the current placement, not percentages. A half-width crop scales the chosen detail into the existing frame.
Cropping is not redaction: complete source bytes remain in the snapshot. Opacity zero also preserves the image object.

## Executable Facade variants

Run the following blocks in order on a fresh demo, using DevTools against the live `window.univerAPI`.
Each block is independently executable at its documented step. Block 14 intentionally throws a native validation error.
The original source strings below match `data.ts` exactly; this makes code and rendered output directly comparable.

### 1. Inspect the authored image

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').getData()
```

### 2. Replace summer with the original winter illustration

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setSource('data:image/svg+xml;base64,' + btoa("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"900\" height=\"540\" viewBox=\"0 0 900 540\"><rect width=\"900\" height=\"540\" fill=\"#dbeafe\"/><circle cx=\"725\" cy=\"135\" r=\"72\" fill=\"#7c3aed\"/><path d=\"M0 540V330L190 160 400 395 590 230 900 410V540Z\" fill=\"#475569\"/><path d=\"M92 245L190 160 292 274 203 249 173 276Z M490 317L590 230 692 288 578 280Z\" fill=\"#fff\"/><path d=\"M0 540V480L250 410 470 500 750 360 900 400V540Z\" fill=\"#1e3a8a\"/><g fill=\"#1e3a8a\" font-family=\"Arial\" font-size=\"28\"><text x=\"34\" y=\"40\">WINTER / VIOLET MOON</text><text x=\"32\" y=\"90\">SNOW / WEST</text></g></svg>"))
```

### 3. Undo the seasonal replacement

```ts
await window.univerAPI.undo()
```

### 4. Redo the winter proof

```ts
await window.univerAPI.redo()
```

### 5. Return to the original summer artwork

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setSource('data:image/svg+xml;base64,' + btoa("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"900\" height=\"540\" viewBox=\"0 0 900 540\"><rect width=\"900\" height=\"540\" fill=\"#fef3c7\"/><circle cx=\"180\" cy=\"145\" r=\"80\" fill=\"#dc2626\"/><path d=\"M0 540V410L190 290 360 440 530 220 710 330 900 170V540Z\" fill=\"#0d9488\"/><path d=\"M0 540V480L250 410 470 500 750 360 900 400V540Z\" fill=\"#115e59\"/><g fill=\"#164e63\" font-family=\"Arial\" font-size=\"28\"><text x=\"34\" y=\"40\">SUMMER / RED SUN</text><text x=\"580\" y=\"80\">RIDGE / EAST</text></g><path d=\"M430 535L510 470 455 410 530 355\" fill=\"none\" stroke=\"#fff\" stroke-width=\"12\"/></svg>"))
```

### 6. Crop to the left half: retain the red sun

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setCrop({ left: 0, top: 0, right: 225, bottom: 270 })
```

### 7. Crop to the right half: emphasize the east ridge

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setCrop({ left: 225, top: 0, right: 450, bottom: 270 })
```

### 8. Restore the full image window

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setCrop({ left: 0, top: 0, right: 450, bottom: 270 })
```

### 9. Move, resize and rotate the proof illustration

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setTransform({ left: 110, top: 170, width: 360, height: 216, rotation: 10, flipX: false, flipY: false })
```

### 10. Restore its original placement

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setTransform({ left: 72, top: 145, width: 450, height: 270, rotation: 0, flipX: false, flipY: false })
```

### 11. Fade the illustration for editorial comparison

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setOpacity(0.35)
```

### 12. Hide its paint while retaining the object

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setOpacity(0)
```

### 13. Restore opaque artwork

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setOpacity(1)
```

### 14. Reject a zero-width crop without changing the snapshot

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').setCrop({ left: 0, top: 0, right: 0, bottom: 100 })
```

### 15. Attempt to remove only the illustration (known SDK failure)

The installed SDK currently throws an atomic mutation batch error for this sequence. This is retained
as a failing example, not claimed as working removal.

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getImages().find(image => image.getId() === 'trail-hero').remove()
```

### 16. Restore the illustration with native history (requires successful removal)

Do not run this block if block 15 failed: it would undo the previous successful operation instead.

```ts
await window.univerAPI.undo()
```

## Evidence and boundaries

Run `node scripts/test-pdf-image-native-review.mjs` for the selected independent build and strict checks.
Evidence is stored in `test-results/pdf-image-native-verified/`.
Read its actual PASS/FAIL gates: they cover literal operations, original source/text preservation, real page pixels,
native selection/property/drag/crop/history, initial Chinese UI, complete locale packs, theme owner and disposal.
Screenshots must show a painted PDF with the startup skeleton absent. Current strict failures include
the removal block and its dependent undo, native drag/Facade-transform parity, and unavailable native crop UI.
Facade seasonal replacement, three crop windows, transform, opacity and invalid crop rejection are checked separately.

This is a locally authored PDF model, not proof of binary PDF import. No client-only binary Exchange/Print provider
is registered or claimed; no backend conversion, fake PDF download or host browser-print replacement is used.
Native arbitrary-file insertion/replacement, all crop/rotation combinations, save/reopen, binary import/export,
Print, cross-browser, touch, accessibility and performance require separate acceptance.
