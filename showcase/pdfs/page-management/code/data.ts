import type { FUniver } from '@univerjs/core/facade'
import { createPdfDocument, createPdfPage, ptToEmu } from '@univerjs-pro/pdfs'

import '@univerjs-pro/pdfs/facade'

export function createPageGallery(api: FUniver) {
  const samples = [
    {
      id: 'welcome',
      title: '01 / Welcome',
      color: '#0F766E',
      note: 'A neighborhood garden walk',
      detail: 'Meet beside the cedar gate.\nBring a notebook and comfortable shoes.',
    },
    {
      id: 'route',
      title: '02 / Route',
      color: '#7C3AED',
      note: 'Three stops, one quiet afternoon',
      detail: 'Herb beds, rain garden, orchard.\nPause at each stop to observe the light.',
    },
    {
      id: 'materials',
      title: '03 / Materials',
      color: '#B45309',
      note: 'A short preparation list',
      detail: 'Paper tags, pencils and string.\nReturn shared tools to the timber shelf.',
    },
    {
      id: 'closing',
      title: '04 / Closing',
      color: '#BE185D',
      note: 'Leave the garden ready for tomorrow',
      detail: 'Collect the temporary signs.\nRecord one idea for the next walk.',
    },
  ]
  const pdf = api.createPdf({
    id: 'garden-page-management',
    name: 'Garden walk / page management',
    document: createPdfDocument({
      id: 'garden-page-management',
      pages: samples.map((sample, index) =>
        createPdfPage({
          id: sample.id,
          index,
          label: String(index + 1),
          size: { width: ptToEmu(420), height: ptToEmu(420) },
        }),
      ),
    }),
  })
  for (const sample of samples) {
    const page = pdf.getPageById(sample.id)!
    page
      .insertTextBox({
        id: sample.id + '-title',
        text: sample.title,
        left: 28,
        top: 30,
        width: 360,
        height: 48,
        fontSize: 27,
        fill: sample.color,
      })
      .setTextStyle({ bold: true })
    page.insertDivider({
      id: sample.id + '-band',
      left: 28,
      top: 102,
      width: 360,
      strokeColor: sample.color,
      strokeWidth: 22,
    })
    page.insertTextBox({
      id: sample.id + '-note',
      text: sample.note,
      left: 28,
      top: 145,
      width: 360,
      height: 58,
      fontSize: 19,
      fill: '#1E293B',
    })
    page.insertTextBox({
      id: sample.id + '-detail',
      text: sample.detail,
      left: 28,
      top: 225,
      width: 360,
      height: 88,
      fontSize: 16,
      fill: '#475569',
    })
    page.insertTextBox({
      id: sample.id + '-id',
      text: 'Original source key: ' + sample.id,
      left: 28,
      top: 360,
      width: 360,
      height: 30,
      fontSize: 12,
      fill: sample.color,
    })
  }
  return pdf
}
