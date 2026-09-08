// Historical mixed-content fixture retained only for SDK child-resource regressions.
import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export const GROUP_ID = 'juniper-workstations'
export const TABLE_ID = 'juniper-bookings'
export const COLUMN_TEXT = [
  'Welcome desk\rAsk visitors what they want to repair. Label each item and record the time available before assigning a workstation.',
  'Diagnosis\rTest one symptom at a time. Keep the owner involved and stop when a specialist or replacement part is needed.',
  'Parts bench\rSeparate reusable screws, zips and cables. Check the donated stock before opening a new packet.',
  'Repair station\rPair an experienced volunteer with a learner. Photograph the finished repair only with the visitor’s permission.',
  'Return desk\rExplain what changed and what still needs attention. Give the visitor a short care note before closing the ticket.',
] as const
export const BOOKINGS = [
  ['Slot', 'Seats'],
  ['09:00', '8'],
  ['10:30', '6'],
  ['13:00', '10'],
] as const
export const CHART_VALUES = [
  ['Work', 'Completed'],
  ['Textiles', 16],
  ['Bikes', 9],
  ['Small items', 12],
] as const
// Original source-authored CC0 diagram. Distributed inline with the runnable demo.
export const TOOLS_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60" viewBox="0 0 100 60"><rect width="100" height="60" rx="8" fill="#fff7ed"/><path d="M20 12h18v10H20zm7 10h5v26h-5z" fill="#9a3412"/><path d="m63 11 9 9-24 24 7 7 24-24 9 9V11z" fill="#0369a1"/><circle cx="81" cy="48" r="5" fill="#ca8a04"/></svg>'

export function createData(empty = false): IDocumentData {
  const body = NamedStyleType.NORMAL_TEXT,
    heading = NamedStyleType.HEADING_1
  const rows: readonly (readonly [string, NamedStyleType])[] = empty
    ? [['', body]]
    : [
        ['Juniper — Repair Café Weekend', NamedStyleType.TITLE],
        ['31 March 2027 · Volunteer operations · Fictional planning memo', body],
        ['01 · The weekend brief', heading],
        [
          'Juniper turns a neighborhood hall into a shared repair workshop. The layout below compares workstations without turning the whole memo into a spreadsheet.',
          body,
        ],
        ['02 · Workstation comparison', heading],
        ['03 · Booking notes', heading],
        [
          'The compact booking table belongs to the final original column. The toolbox illustration belongs to the welcome column. Added columns must not steal either child.',
          body,
        ],
        ['04 · Previous workshop', heading],
        ['Completed repairs by work type', body],
        ['', body],
        ['These original fictional counts are an independent chart, not a calculation from the booking table.', body],
        ['05 · Handoff', heading],
        [
          'Keep the intake and return paths clear. A separate handoff comparison must remain unchanged when the workstation group is edited.',
          body,
        ],
        ['06 · Closeout', heading],
        ['At 16:00 the coordinator checks unresolved tickets and returns borrowed tools to their owners.', body],
      ]
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'juniper-columns-demo',
    title: 'Juniper — Repair Café Weekend',
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
      customRanges: [],
      paragraphs: rows.map(([text, style], index) => {
        offset += text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'para_juniper_' + index,
          paragraphStyle: {
            namedStyleType: style,
            spaceBelow: { v: 8 },
            lineSpacing: 1,
            textStyle: {
              fs: style === NamedStyleType.TITLE ? 24 : style === heading ? 18 : 12,
              bl: style === body ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'juniper-section' }],
    },
  }
}
