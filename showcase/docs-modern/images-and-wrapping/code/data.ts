import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export const ALT_TEXT = 'Orange recorder on a tripod beside a blue sea and yellow sunrise.'
// Original local illustration; no external image requests.
export const COAST_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150" viewBox="0 0 240 150"><rect width="240" height="150" fill="#e0f2fe"/><circle cx="201" cy="31" r="17" fill="#fbbf24"/><path d="M0 75Q40 60 80 75T160 75T240 75V150H0Z" fill="#0284c7"/><path d="M0 114Q70 98 140 123T240 122V150H0Z" fill="#d6d3d1"/><path d="m100 75-24 62m24-62 28 62m-28-62v62" stroke="#334155" stroke-width="5"/><rect x="78" y="40" width="45" height="35" rx="5" fill="#ea580c"/><circle cx="101" cy="57" r="10" fill="#fff7ed"/><path d="M99 31v-14m-9 5 9 9 9-9" fill="none" stroke="#334155" stroke-width="3"/></svg>'
export const VARIANTS = [
  { id: 'inline', en: 'Inline · 240 × 150' },
  { id: 'square-left', en: 'Square wrapping · left' },
  { id: 'square-center', en: 'Square wrapping · center' },
  { id: 'square-right', en: 'Square wrapping · right' },
  { id: 'top-bottom', en: 'Top and bottom' },
  { id: 'behind', en: 'Behind text' },
  { id: 'front', en: 'In front of text' },
  { id: 'rotated', en: 'Resized · 180 × 112.5 · rotated 15°' },
  { id: 'recorder-crop', en: 'Recorder crop · SDK boundary' },
  { id: 'horizon-crop', en: 'Horizon crop · SDK boundary' },
] as const
export function createData(empty = false, _legacyLocale = false): IDocumentData {
  const paragraph =
    'The orange recorder, blue sea and yellow sunrise provide one consistent image reference. This text stays the same across wrapping modes. Square wrapping reserves horizontal space beside the image; top and bottom keeps text above or below. Front and behind modes intentionally overlap the text. Select the native image to continue adjusting its position and size.'
  const rows = empty
    ? [{ id: 'empty', text: '', heading: false }]
    : [
        { id: 'title', text: 'Image layout specimens', heading: true },
        ...VARIANTS.flatMap((v) => [
          { id: v.id + '-heading', text: v.en, heading: true },
          { id: v.id + '-anchor', text: paragraph, heading: false },
        ]),
      ]
  let offset = 0
  const dataStream = rows.map((row) => row.text).join('\r') + '\r\n'
  return {
    id: 'image-wrapping-gallery',
    title: 'Image layout specimens',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 820, height: 1123 },
      marginTop: 24,
      marginBottom: 24,
      marginLeft: 40,
      marginRight: 40,
    },
    body: {
      dataStream,
      textRuns: [],
      paragraphs: rows.map((row) => {
        offset += row.text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: row.id,
          paragraphStyle: {
            namedStyleType: row.heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
            spaceBelow: { v: row.heading ? 12 : 150 },
            lineSpacing: 1.3,
            textStyle: { fs: row.heading ? 20 : 13, bl: row.heading ? BooleanNumber.TRUE : BooleanNumber.FALSE },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'image-section' }],
    },
  }
}
