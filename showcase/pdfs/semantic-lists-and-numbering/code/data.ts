import type { FUniver } from '@univerjs/core/facade'

import '@univerjs-pro/pdfs/facade'

export function createListGallery(api: FUniver) {
  const pdf = api.createPdf({ id: 'semantic-list-gallery', name: 'Semantic lists and numbering' })
  const page = pdf.getPageByIndex(0)!
  page.insertTextBox({
    id: 'title',
    text: 'Lists / structure, not typed markers',
    left: 40,
    top: 30,
    width: 520,
    height: 45,
    fontFamily: 'Arial',
    fontSize: 24,
    fill: '#274C59',
  })
  const samples = [
    {
      id: 'disc',
      label: 'Round bullets',
      left: 40,
      top: 120,
      kind: api.Enum.PdfListKind.UNORDERED,
      preset: api.Enum.PdfListPresetId.UNORDERED_DISC,
      items: ['Linen covers', 'Archival sleeves', 'Cotton gloves'],
    },
    {
      id: 'square',
      label: 'Square bullets',
      left: 320,
      top: 120,
      kind: api.Enum.PdfListKind.UNORDERED,
      preset: api.Enum.PdfListPresetId.UNORDERED_SQUARE,
      items: ['Inspect frames', 'Seal crates', 'Record weights'],
    },
    {
      id: 'numbered',
      label: 'Numbering starts at three',
      left: 40,
      top: 380,
      kind: api.Enum.PdfListKind.ORDERED,
      preset: api.Enum.PdfListPresetId.ORDERED_DECIMAL_DOT,
      items: ['Receive artwork', 'Check condition', 'Confirm storage'],
    },
    {
      id: 'nested',
      label: 'Number and letter levels',
      left: 320,
      top: 380,
      kind: api.Enum.PdfListKind.ORDERED,
      preset: api.Enum.PdfListPresetId.ORDERED_NUMBER_ALPHA,
      items: ['Prepare gallery', 'Test lighting', 'Check captions', 'Open doors'],
    },
  ]
  for (const sample of samples) {
    page.insertTextBox({
      id: sample.id + '-label',
      text: sample.label,
      left: sample.left,
      top: sample.top - 35,
      width: 235,
      height: 28,
      fontFamily: 'Arial',
      fontSize: 13,
      fill: '#7B623F',
    })
    const list = page.insertList({
      id: sample.id,
      text: sample.items[0],
      kind: sample.kind,
      preset: sample.preset,
      left: sample.left,
      top: sample.top,
      width: 235,
      height: 200,
    })
    sample.items.slice(1).forEach((text, index) =>
      list.insertItem(index + 1, {
        id: sample.id + '-item-' + (index + 2),
        text,
        level: sample.id === 'nested' && index < 2 ? 1 : 0,
      }),
    )
    if (sample.id === 'numbered') list.setStartNumber(3)
  }
  return pdf
}
