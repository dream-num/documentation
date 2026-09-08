import type { FUniver } from '@univerjs/core/facade'
import { createPdfDocument, createPdfPage, ptToEmu } from '@univerjs-pro/pdfs'

import '@univerjs-pro/pdfs/facade'

export function createPageGallery(api: FUniver) {
  const samples = [
    {
      id: 'brief',
      width: 420,
      height: 420,
      title: 'Studio brief',
      color: '#7C3AED',
      note: 'A square opening page for the print exhibition.',
      detail: 'Theme: light through leaves.\nEdition: twelve small prints.',
    },
    {
      id: 'layout',
      width: 520,
      height: 340,
      title: 'Wall layout',
      color: '#0F766E',
      note: 'A wide page for the hanging sequence.',
      detail: 'North wall: cyanotypes.\nWest wall: relief prints.',
    },
    {
      id: 'checklist',
      width: 340,
      height: 460,
      title: 'Closing checklist',
      color: '#B45309',
      note: 'A tall final page for the handover.',
      detail: 'Return the hanging tools.\nStore the spare labels.',
    },
  ]
  const pdf = api.createPdf({
    id: 'studio-page-insertion',
    name: 'Studio packet / page insertion',
    document: createPdfDocument({
      id: 'studio-page-insertion',
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
  for (const sample of samples) {
    const page = pdf.getPageById(sample.id)!
    page
      .insertTextBox({
        id: sample.id + '-title',
        text: sample.title,
        left: 24,
        top: 28,
        width: sample.width - 48,
        height: 46,
        fontSize: 25,
        fill: sample.color,
      })
      .setTextStyle({ bold: true })
    page.insertTextBox({
      id: sample.id + '-note',
      text: sample.note,
      left: 24,
      top: 100,
      width: sample.width - 48,
      height: 65,
      fontSize: 15,
      fill: '#334155',
    })
    page.insertTextBox({
      id: sample.id + '-detail',
      text: sample.detail,
      left: 24,
      top: 190,
      width: sample.width - 48,
      height: 90,
      fontSize: 17,
      fill: sample.color,
    })
    page.insertTextBox({
      id: sample.id + '-size',
      text: sample.width + ' × ' + sample.height + ' pt',
      left: 24,
      top: sample.height - 55,
      width: sample.width - 48,
      height: 26,
      fontSize: 12,
      fill: '#64748B',
    })
  }
  return pdf
}
