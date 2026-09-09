import type { FUniver } from '@univerjs/core/facade'
import { createPdfDocument, createPdfPage, ptToEmu } from '@univerjs-pro/pdfs'

import '@univerjs-pro/pdfs/facade'

export function createNavigationGallery(api: FUniver) {
  const samples = [
    {
      id: 'itinerary',
      title: '01 / Field itinerary',
      width: 420,
      height: 900,
      color: '#216C61',
      rows: [
        '08:30 / Collect the tide kit',
        '09:10 / North quay observations',
        '10:40 / Reed channel samples',
        '12:15 / Sheltered lunch stop',
        '14:00 / Return sample bottles',
      ],
      note: 'Footer jumps keep zoom. Thumbnails fit.',
    },
    {
      id: 'route',
      title: '02 / Shore route strip',
      width: 1000,
      height: 360,
      color: '#946126',
      rows: [
        'NORTH QUAY  →  REED CHANNEL  →  OLD LIGHTHOUSE  →  SHELTER',
        'Walk 1.2 km     /     Boardwalk 0.8 km     /     Return 1.6 km',
      ],
      note: 'Click the thumbnail to fit this route strip.',
    },
    {
      id: 'legend',
      title: '03 / Sample key',
      width: 520,
      height: 520,
      color: '#694D91',
      rows: ['A / Water bottle with blue seal', 'B / Sediment jar with amber seal', 'C / Reed cutting in paper sleeve'],
      note: 'Compare thumbnail fit with the 100% preset.',
    },
    {
      id: 'receipt',
      title: '04 / Kit return',
      width: 340,
      height: 620,
      color: '#315F8D',
      rows: ['Returned / 6 bottles', 'Returned / 3 jars', 'Returned / 1 tide gauge', 'Pending / Dry the canvas bag'],
      note: 'Page 1 returns to the itinerary.',
    },
  ]
  const pdf = api.createPdf({
    id: 'pdf-navigation-gallery',
    name: 'Shore notebook / navigation and zoom',
    document: createPdfDocument({
      id: 'pdf-navigation-gallery',
      pages: samples.map((sample, index) =>
        createPdfPage({
          id: sample.id,
          index,
          label: String(index + 1),
          size: { width: ptToEmu(sample.width), height: ptToEmu(sample.height) },
        }),
      ),
    }),
  })
  for (const [index, sample] of samples.entries()) {
    const page = pdf.getPageByIndex(index)!
    page
      .insertTextBox({
        id: 'title-' + sample.id,
        text: sample.title,
        left: 28,
        top: 30,
        width: sample.width - 56,
        height: 44,
        fontSize: 23,
        fill: sample.color,
      })
      .setTextStyle({ bold: true })
    page.insertTextBox({
      id: 'dimensions-' + sample.id,
      text: `${sample.width} × ${sample.height} pt / original field notes`,
      left: 28,
      top: 84,
      width: sample.width - 56,
      height: 30,
      fontSize: 12,
      fill: '#64748B',
    })
    for (const [row, text] of sample.rows.entries())
      page.insertTextBox({
        id: `entry-${sample.id}-${row}`,
        text,
        left: 28,
        top: 140 + row * (sample.id === 'itinerary' ? 125 : 64),
        width: sample.width - 56,
        height: 44,
        fontSize: sample.id === 'route' ? 19 : 16,
        fill: sample.color,
      })
    page.insertTextBox({
      id: 'note-' + sample.id,
      text: sample.note,
      left: 28,
      top: sample.height - 96,
      width: sample.width - 56,
      height: 66,
      fontSize: 12,
      fill: '#52616C',
    })
  }
  return pdf
}
