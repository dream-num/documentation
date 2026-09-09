import type { IPdfParagraphStyle } from '@univerjs-pro/pdfs/facade'
import type { FUniver } from '@univerjs/core/facade'
import { ptToEmu } from '@univerjs-pro/pdfs'

import '@univerjs-pro/pdfs/facade'

export function createParagraphGallery(api: FUniver) {
  const pdf = api.createPdf({ id: 'paragraph-layout', name: 'Paragraph layout / readable field notes' })
  const pages = [pdf.getPageByIndex(0)!, pdf.insertPage(), pdf.insertPage()]
  const groups: {
    title: string
    text: string
    second?: string
    samples: { id: string; label: string; style: IPdfParagraphStyle }[]
  }[] = [
    {
      title: '01 / Paragraph alignment',
      text: 'At dawn, the shoreline team maps new pools and records the tide. Each note keeps the location, weather and observation together for the next visit.',
      samples: [
        { id: 'left', label: 'Left', style: { align: 'left' } },
        { id: 'center', label: 'Center', style: { align: 'center' } },
        { id: 'right', label: 'Right', style: { align: 'right' } },
        { id: 'justify', label: 'Justify (stored; renders left)', style: { align: 'justify' } },
      ],
    },
    {
      title: '02 / Line and paragraph spacing',
      text: 'Volunteers photograph each marker before collecting a water sample. A shared log records the exact time and the equipment used.',
      second: 'The evening crew compares the readings and flags any unexpected change.',
      samples: [
        { id: 'compact', label: '1.2 line height / no paragraph gap', style: { lineHeight: 1.2 } },
        { id: 'airy', label: '1.8 line height / no paragraph gap', style: { lineHeight: 1.8 } },
        {
          id: 'paragraph-gap',
          label: '1.2 line height / before 8 pt + after 12 pt',
          style: { lineHeight: 1.2, spacingBefore: ptToEmu(8), spacingAfter: ptToEmu(12) },
        },
      ],
    },
    {
      title: '03 / Paragraph indents',
      text: 'Station notes: Keep the instrument level and allow the display to settle. Record the reading before moving to the next marked point on the survey route.',
      samples: [
        { id: 'first-line', label: 'First line +18 pt', style: { firstLineIndent: ptToEmu(18) } },
        {
          id: 'hanging',
          label: 'Left +18 pt / first line -18 pt',
          style: { indent: ptToEmu(18), firstLineIndent: ptToEmu(-18) },
        },
        { id: 'right-inset', label: 'Right inset 36 pt', style: { rightIndent: ptToEmu(36) } },
      ],
    },
  ]
  groups.forEach((group, pageIndex) => {
    const page = pages[pageIndex]
    page.insertTextBox({
      id: 'title-' + pageIndex,
      text: group.title,
      left: 40,
      top: 30,
      width: 520,
      height: 40,
      fontSize: 24,
      fill: '#284C59',
    })
    group.samples.forEach((sample, index) => {
      const left = index % 2 === 0 ? 40 : 320
      const top = index < 2 ? 120 : 390
      page.insertTextBox({
        id: sample.id + '-label',
        text: sample.label,
        left,
        top: top - 42,
        width: 235,
        height: 38,
        fontSize: 12,
        fill: '#826342',
      })
      const paragraph = page.insertParagraph({ id: sample.id, text: group.text, left, top, width: 235, height: 220 })
      paragraph.setBlockStyle(paragraph.getBlocks()[0].id, sample.style)
      if (group.second) paragraph.appendBlock({ id: sample.id + '-second', text: group.second, style: sample.style })
    })
  })
  return pdf
}
