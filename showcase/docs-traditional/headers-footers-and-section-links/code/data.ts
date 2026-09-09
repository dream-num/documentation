import { BooleanNumber, LocaleType, type IDocumentData } from '@univerjs/core'

export const PAGES = [
  [
    'Opening leaf',
    'Initially: a first-page header and footer replace the regular running text. Double-click the top or bottom margin to edit the real segment.',
  ],
  [
    'Even leaf',
    'Initially: the even-page header and footer identify the left-hand leaf. The page body is independent of its running text.',
  ],
  [
    'Default leaf',
    'Initially: the default header and footer return on the next odd leaf. Editing this header updates other pages that share its segment.',
  ],
  [
    'Second section',
    'Initially: this section inherits the first-page and even-page segments. Its default header is unlinked; all three footer variants remain linked.',
  ],
  [
    'Independent default leaf',
    'Initially: this odd leaf uses the second section’s independent default header. Its footer still uses the first section’s default footer.',
  ],
  [
    'Inherited even leaf',
    'Initially: the even header and footer are shared with the preceding section. Page parity continues across the boundary; the native Link to previous switch controls inheritance.',
  ],
] as const

export function createData(): Partial<IDocumentData> {
  let offset = 0
  const paragraphs = PAGES.flatMap(([title, text], index) => [
    { text: title, id: `leaf-${index}`, title: true, page: index > 0 },
    { text, id: `body-${index}`, title: false, page: false },
  ]).map((row) => {
    offset += row.text.length + 1
    return {
      startIndex: offset - 1,
      paragraphId: row.id,
      paragraphStyle: {
        textStyle: { fs: row.title ? 23 : 13, ff: 'Arial', bl: row.title ? BooleanNumber.TRUE : BooleanNumber.FALSE },
        spaceAbove: { v: row.title ? 16 : 0 },
        spaceBelow: { v: 18 },
        lineSpacing: 1.35,
        pageBreakBefore: row.page ? BooleanNumber.TRUE : BooleanNumber.FALSE,
      },
    }
  })
  const dataStream = PAGES.flat().join('\r') + '\r\n'
  return {
    id: 'header-footer-gallery',
    title: 'Running text and section links',
    locale: LocaleType.EN_US,
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'running-section' }],
    },
  }
}
