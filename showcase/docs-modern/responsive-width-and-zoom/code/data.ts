import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

// Original fictional field report; no fetched data or personal information.
export const COUNTS = [
  ['Site', 'Seedlings'],
  ['Dune', 84],
  ['Creek', 126],
  ['Ridge', 53],
]
export const TASKS = [
  ['Station', 'Trays', 'Water / L'],
  ['Dune', '7', '28'],
  ['Creek', '9', '36'],
  ['Ridge', '5', '20'],
]
export const PLANS = [
  'Morning team\rStart at the creek. Check moisture before watering. Carry nine trays along the shaded path.',
  'Evening team\rFinish at the ridge. Count returned pots and record damaged seedlings before closing the gate.',
]
export const MAP_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect width="160" height="80" rx="8" fill="#ecfdf5"/><path d="M0 56Q45 8 80 45T160 24" fill="none" stroke="#0284c7" stroke-width="12"/><circle cx="25" cy="22" r="9" fill="#d97706"/><circle cx="83" cy="24" r="9" fill="#059669"/><circle cx="138" cy="61" r="9" fill="#7c3aed"/></svg>'
export const SELECTION_MARKER = 'Keep the blue path clear.'
export function createData(empty = false): IDocumentData {
  const normal = NamedStyleType.NORMAL_TEXT
  const rows: [string, NamedStyleType][] = empty
    ? [['', normal]]
    : [
        ['Willow — Nursery Field Memo', NamedStyleType.TITLE],
        ['31 March 2027 · Restoration team · Original fictional data', normal],
        ['01 · Compare shifts', NamedStyleType.HEADING_1],
        ['Two teams share one watering cart. Read the plans side by side or stacked on a narrow screen.', normal],
        ['02 · Station supplies', NamedStyleType.HEADING_1],
        ['Tray and water allocations are independent of viewport size.', normal],
        ['03 · Seedling counts', NamedStyleType.HEADING_1],
        ['The three stations contain 263 seedlings in total.', normal],
        ['', normal],
        ['04 · Site map', NamedStyleType.HEADING_1],
        ['The original CC0 map marks the dune, creek and ridge beside a blue access path.', normal],
        ['05 · Handover', NamedStyleType.HEADING_1],
        [
          SELECTION_MARKER +
            ' Return the watering cart to the shed. Record missing trays before the evening team arrives.',
          normal,
        ],
        [
          'Review seedling counts after the next rain. A smaller viewport must not remove any station, table column or selected text.',
          normal,
        ],
      ]
  let offset = 0
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: 'willow-responsive',
    title: 'Willow — Nursery Field Memo',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 820, height: 1123 },
      marginTop: 24,
      marginBottom: 24,
    },
    body: {
      dataStream,
      textRuns: [],
      customRanges: [],
      paragraphs: rows.map(([text, style], i) => {
        offset += text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'willow-p-' + i,
          paragraphStyle: {
            namedStyleType: style,
            spaceBelow: { v: 8 },
            lineSpacing: 1.2,
            textStyle: {
              fs: style === normal ? 13 : style === NamedStyleType.TITLE ? 24 : 18,
              bl: style === normal ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'willow-section' }],
    },
  }
}
