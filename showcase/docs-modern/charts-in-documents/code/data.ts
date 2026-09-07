import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

// Original fictional data, frozen on 31 March 2027. No personal or fetched data.
export const DATASETS = {
  quarter: [
    ['Month', 'Repairs', 'Workshops'],
    ['Jan', 42, 18],
    ['Feb', 57, 24],
    ['Mar', 63, 31],
  ],
  corrected: [
    ['Month', 'Repairs', 'Workshops'],
    ['Jan', 42, 18],
    ['Feb', 71, 24],
    ['Mar', 63, 31],
  ],
  pause: [
    ['Month', 'Repairs', 'Workshops'],
    ['Apr', 70, 27],
    ['May', 0, 34],
    ['Jun', 86, 41],
  ],
}
export const TASKS = [
  ['Follow-up', 'Owner', 'Due'],
  ['Order bearings', 'Nadia', '04 Apr'],
  ['Calibrate stands', 'Luis', '07 Apr'],
  ['Volunteer briefing', 'Mei', '09 Apr'],
]
// Original CC0 workshop schematic, independent of chart data.
export const WORKSHOP_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="144" height="72"><rect width="144" height="72" rx="6" fill="#fff7ed"/><rect x="12" y="12" width="36" height="48" fill="#c2410c"/><rect x="60" y="12" width="72" height="16" fill="#0f766e"/><rect x="60" y="40" width="72" height="20" fill="#7c3aed"/></svg>'

export function createData(empty = false): IDocumentData {
  const normal = NamedStyleType.NORMAL_TEXT
  const rows: [string, NamedStyleType][] = empty
    ? [['', normal]]
    : [
        ['Saffron — Repair Hub Review', NamedStyleType.TITLE],
        ['31 March 2027 · Community operations · Fictional quarterly data', normal],
        ['01 · Monthly repair outcomes', NamedStyleType.HEADING_1],
        ['Completed repairs and workshop attendance', normal],
        ['', normal],
        [
          'February repairs were corrected from 57 to 71 after a late batch was counted. The repair total changes from 162 to 176; workshop attendance stays at 73.',
          normal,
        ],
        ['02 · Compare delivery plans', NamedStyleType.HEADING_1],
        ['Compare the weekday bench with the weekend pop-up before allocating volunteers.', normal],
        ['03 · Follow-up work', NamedStyleType.HEADING_1],
        [
          'The follow-up table is independent of the chart. Changing monthly values must not rewrite these tasks.',
          normal,
        ],
        ['04 · Workshop reference', NamedStyleType.HEADING_1],
        ['The orange storage bench, teal service desk and violet teaching area form the workshop schematic.', normal],
        ['05 · Review note', NamedStyleType.HEADING_1],
        [
          'Discuss repair throughput separately from attendance. A zero in May represents a planned bench closure, not a missing measurement.',
          normal,
        ],
      ]
  let offset = 0
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: 'saffron-charts',
    title: 'Saffron — Repair Hub Review',
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
      paragraphs: rows.map(([text, style], index) => {
        offset += text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'saffron-p-' + index,
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
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'saffron-section' }],
    },
  }
}
