# Native PDF page gallery

Three feature-focused native pages: portrait editable text, landscape table, square image. The SVG is original embedded data, not a remote screenshot. Native PDF controls provide page navigation and editing. No extra lifecycle, Undo/Redo, JSON readback or fixture panel is rendered.

Preview and standalone code use the same factory, five official SDK stylesheets and five complete English UI locale packs. All three pages and the native UI remain English on every host language; legacy locale arguments are ignored. Theme changes call toggleDarkMode() on the existing owner and preserve edits.

## Actual Facade examples

```ts
const pdf = univerAPI.getActivePdf()!
const text = pdf.getPageByIndex(0)!.getTextBoxes().find(item => item.getId() === 'editable-text')!
text.setText('Edited in the native PDF model')
console.log(text.getText())
const snapshot = pdf.save()
console.log(snapshot)
```

Geometry uses exported createPdfPage(), createPdfDocument(), ptToEmu() builders. Page sizes and Facade object placement both use PDF points before conversion to EMU. Object insertion uses FPdfPage.insertTextBox(), insertTable() and insertImage(). The initial fit uses installed IPdfEditorRuntimeService; native navigation remains the user's control.

## Limits and verification

Installed @univerjs-pro/pdfs-exchange-client delegates conversion to IExchangeService, whose implementation depends on HTTPService. It is not enabled in this frontend-only example. No installed dedicated PDF print plugin was found during inspection; no browser screenshot-print substitute is added. Binary import/export/print remain unverified. Trial restrictions are never hidden.

The three pages demonstrate distinct capabilities with the real native editor, English packs and official CSS. Import/export, print, mobile interactions and assistive technology remain unverified; older bilingual test evidence is historical, not acceptance of this English-only revision.
