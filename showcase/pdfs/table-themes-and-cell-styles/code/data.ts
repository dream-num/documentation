import type { FUniver } from '@univerjs/core/facade'
import { createPdfDocument, createPdfPage, ptToEmu } from '@univerjs-pro/pdfs'
import { HorizontalAlign } from '@univerjs/core'

import '@univerjs-pro/pdfs/facade'

export function createTableGallery(api: FUniver) {
  const samples = [
    {
      id: 'plain',
      title: 'Plain grid / field library',
      styleId: 'univerNeutralPlainGrid',
      options: {},
      cells: ['Collection', 'Crates', 'Shelf', 'Botany', '12', 'A2', 'Geology', '8', 'B1', 'Maps', '5', 'C3'],
      note: 'A quiet neutral grid gives every cell equal emphasis.',
    },
    {
      id: 'rows',
      title: 'Header and row bands / workshop',
      styleId: 'univerGreenHeaderBandedRows',
      options: { firstRow: true, bandRow: true },
      cells: [
        'Session',
        'Seats',
        'Room',
        'Bookbinding',
        '16',
        'Studio',
        'Screenprint',
        '10',
        'Annex',
        'Ceramics',
        '12',
        'Kiln',
      ],
      note: 'A header and alternating rows support horizontal scanning.',
    },
    {
      id: 'header',
      title: 'Strong header / seed exchange',
      styleId: 'univerPurpleStrongHeader',
      options: { firstRow: true },
      cells: [
        'Seed',
        'Packets',
        'Origin',
        'Marigold',
        '24',
        'East plot',
        'Sage',
        '18',
        'Herb bed',
        'Lupin',
        '9',
        'North plot',
      ],
      note: 'The strong header separates labels from the editable entries.',
    },
    {
      id: 'columns',
      title: 'Column emphasis / archive rooms',
      styleId: 'univerBlueMediumFirstColumn',
      options: { firstCol: true, bandCol: true },
      cells: [
        'Room',
        'Morning',
        'Afternoon',
        'Reading',
        'Open',
        'Open',
        'Catalog',
        'Review',
        'Open',
        'Conservation',
        'Booked',
        'Review',
      ],
      note: 'First-column emphasis and column bands support vertical scanning.',
    },
    {
      id: 'exception',
      title: 'Cell override / repair queue',
      styleId: 'univerPrimaryHeaderBandedRows',
      options: { firstRow: true, bandRow: true },
      cells: [
        'Item',
        'Status',
        'Desk',
        'Map case',
        'Ready',
        'West',
        'Lamp',
        'Hold',
        'North',
        'Book press',
        'Ready',
        'East',
      ],
      note: 'One amber status cell overrides the table theme. It is not conditional formatting.',
    },
  ]
  const pdf = api.createPdf({
    id: 'pdf-table-gallery',
    name: 'Table themes and cell styles',
    document: createPdfDocument({
      id: 'pdf-table-gallery',
      pages: samples.map(({ id }, index) =>
        createPdfPage({ id, index, label: String(index + 1), size: { width: ptToEmu(680), height: ptToEmu(460) } }),
      ),
    }),
  })
  for (const [index, sample] of samples.entries()) {
    const page = pdf.getPageByIndex(index)!
    page
      .insertTextBox({
        id: 'title-' + sample.id,
        text: sample.title,
        left: 36,
        top: 34,
        width: 610,
        height: 40,
        fontSize: 24,
        fill: '#193547',
      })
      .setTextStyle({ bold: true })
    const table = page.insertTable({
      id: 'table-' + sample.id,
      left: 36,
      top: 104,
      width: 608,
      height: 208,
      rowCount: 4,
      columnCount: 3,
      cellTexts: sample.cells,
      styleId: sample.styleId,
      options: sample.options,
    })
    if (sample.id === 'exception')
      table
        .getCell(2, 1)
        .setStyle({ fill: { color: '#FDE6A8' }, fontColor: '#8B3C16', horizontalAlignment: HorizontalAlign.CENTER })
    page.insertTextBox({
      id: 'note-' + sample.id,
      text: `Initially: ${sample.note}`,
      left: 36,
      top: 344,
      width: 608,
      height: 40,
      fontSize: 13,
      fill: '#475569',
    })
    page.insertTextBox({
      id: 'footer-' + sample.id,
      text: `${index + 1} / 5 · Select the table, then View > Properties. Double-click a cell to edit.`,
      left: 36,
      top: 406,
      width: 608,
      height: 24,
      fontSize: 10,
      fill: '#64748B',
    })
  }
  return pdf
}
