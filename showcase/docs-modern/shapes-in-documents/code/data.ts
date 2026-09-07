import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export const BADGE_ID = 'aster-decision-badge'
export const BACKDROP_ID = 'aster-review-window'
export const TASKS = [
  ['Workstream', 'Owner', 'Days'],
  ['Ramp survey', 'Inez', '3'],
  ['Signage trial', 'Omar', '5'],
  ['Quiet route', 'Priya', '2'],
]
export const COUNTS = [
  ['Route', 'Trial visitors'],
  ['North', 18],
  ['Garden', 31],
  ['Gallery', 24],
]
// Original CC0 route sketch. This image is independent from the editable native Shapes.
export const MAP_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="144" height="72"><rect width="144" height="72" fill="#ecfdf5"/><path d="M12 55H56V18H128" fill="none" stroke="#059669" stroke-width="8"/><circle cx="12" cy="55" r="7" fill="#f59e0b"/><rect x="119" y="9" width="18" height="18" fill="#7c3aed"/></svg>'

export function createData(empty = false): IDocumentData {
  const normal = NamedStyleType.NORMAL_TEXT
  const rows: [string, NamedStyleType][] = empty
    ? [['', normal]]
    : [
        ['Aster — Museum Access Decision', NamedStyleType.TITLE],
        ['31 March 2027 · Visitor experience team · Fictional planning data', normal],
        ['01 · Decision: garden pilot', NamedStyleType.HEADING_1],
        [
          'Approve a two-week trial of the garden entrance before changing the permanent visitor route. The status badge belongs to this decision, not to an absolute page number. Move and restyle it, insert a note above this heading, then reload the snapshot to check its paragraph anchor. The pale review window is a second native shape: use the two overlapping objects to compare drawing order with placement behind document text. Those are different controls. Keep this briefing readable while exploring intentional foreground overlays.',
          normal,
        ],
        ['02 · Compare access plans', NamedStyleType.HEADING_1],
        ['Compare the garden entrance with the north entrance before assigning the survey team.', normal],
        ['03 · Trial workstreams', NamedStyleType.HEADING_1],
        ['Independent workstream data must survive shape edits.', normal],
        ['04 · Route sketch and trial visitors', NamedStyleType.HEADING_1],
        ['The green route sketch and visitor chart are independent reference objects.', normal],
        ['Trial visitors by entrance', normal],
        ['', normal],
        ['05 · Review checkpoint', NamedStyleType.HEADING_1],
        [
          'Inez records step-free access; Omar tests sign visibility; Priya checks the quieter route. Review the trial together on 14 April.',
          normal,
        ],
      ]
  let offset = 0
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: 'aster-shapes',
    title: 'Aster — Museum Access Decision',
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
          paragraphId: 'aster-paragraph-' + i,
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
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'aster-section' }],
    },
  }
}
