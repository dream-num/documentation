import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, CustomRangeType, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export const PRIMARY_ID = 'harbor-voice'
export const COMPARISON_ID = 'harbor-comparison'
export const ATTRIBUTION = '— Mira Bell, fictional route steward'
export const ROWS = [
  ['Harbor Night Routes — Pilot Brief', NamedStyleType.TITLE],
  ['31 March 2027 · Community mobility lab · Walking pilot', NamedStyleType.NORMAL_TEXT],
  ['01 · Pilot purpose', NamedStyleType.HEADING_1],
  [
    'A neighborhood route guide connects the evening ferry, library, and tram stop with clear walking directions.',
    NamedStyleType.NORMAL_TEXT,
  ],
  ['02 · A steward’s perspective', NamedStyleType.HEADING_1],
  [
    '[VOICE] A visible route gives every traveler clear directions before they reach a difficult crossing.',
    NamedStyleType.NORMAL_TEXT,
  ],
  [
    '[CONTEXT] During the evening walk, the group preferred landmarks and short instructions over a map crowded with symbols.',
    NamedStyleType.NORMAL_TEXT,
  ],
  ['[ATTR] ' + ATTRIBUTION, NamedStyleType.NORMAL_TEXT],
  [
    '[COMPARE] A daytime map answers where; an evening guide must also explain what to look for.',
    NamedStyleType.NORMAL_TEXT,
  ],
  ['03 · Route package', NamedStyleType.HEADING_1],
  [
    '[COMMUNITY] Let the ferry shelter be the first landmark; it is familiar to residents and easy to name in conversation.',
    NamedStyleType.NORMAL_TEXT,
  ],
  [
    '[ACCESS] Keep the accessible detour beside the main instruction, not in a separate appendix that travelers might miss.',
    NamedStyleType.NORMAL_TEXT,
  ],
  [
    '[RESEARCH] Readers paused longest when two crossings shared the same label. Distinct landmarks made the next step easier to recall.',
    NamedStyleType.NORMAL_TEXT,
  ],
  [
    '[METHOD] The pilot compared two printed prototypes during a supervised evening workshop; observations describe this fictional study only.',
    NamedStyleType.NORMAL_TEXT,
  ],
  ['[OBSERVATION] — Harbor mobility research workshop, fictional field note', NamedStyleType.NORMAL_TEXT],
  ['Ferry to library: three crossings and one sheltered waiting point', NamedStyleType.NORMAL_TEXT],
  ['Library to tram: two landmarks and an accessible detour', NamedStyleType.NORMAL_TEXT],
  ['04 · Pilot checks', NamedStyleType.HEADING_1],
  ['Walk both routes after sunset with two volunteer stewards', NamedStyleType.NORMAL_TEXT],
  ['Review the large-print directions with the accessibility group', NamedStyleType.NORMAL_TEXT],
  ['[CAUTION] This fictional guide is a product demo, not real-world navigation advice.', NamedStyleType.NORMAL_TEXT],
  ['05 · Guide configuration', NamedStyleType.HEADING_1],
  ['const guide = { routes: 2, mode: "landmarks" };', NamedStyleType.NORMAL_TEXT],
  ['await routeGuide.prepare(guide);', NamedStyleType.NORMAL_TEXT],
  ['06 · Review handoff', NamedStyleType.HEADING_1],
  ['Use the \u001Froute review checklist\u001E to record observations before publishing.', NamedStyleType.NORMAL_TEXT],
] as const
export const STYLES = [
  { id: 'editorial', label: 'Editorial blue', lineColor: '#2563EB', textColor: '#1E3A8A' },
  { id: 'community', label: 'Community green', lineColor: '#16A34A', textColor: '#14532D' },
  { id: 'research', label: 'Research violet', lineColor: '#7C3AED', textColor: '#4C1D95' },
  { id: 'contrast', label: 'High contrast', lineColor: '#111827', textColor: '#111827' },
] as const

// Original fictional content with stable dates, IDs, and overlapping inline emphasis.
export function createData(empty = false): IDocumentData {
  const rows = empty ? [['', NamedStyleType.NORMAL_TEXT] as const] : ROWS
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  let offset = 0
  const bold = dataStream.indexOf('clear directions before')
  const mixed = dataStream.indexOf('visible route')
  return {
    id: 'harbor-quote-demo',
    title: ROWS[0][0],
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
      paragraphs: rows.map(([text, style], index) => {
        offset += text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'para_harbor_' + index,
          paragraphStyle: {
            namedStyleType: style,
            lineSpacing: 1,
            spaceBelow: { v: 8 },
          },
        }
      }),
      textRuns: empty
        ? []
        : [
            { st: mixed, ed: mixed + 'visible route'.length, ts: { bl: BooleanNumber.TRUE, it: BooleanNumber.TRUE } },
            { st: bold, ed: bold + 'clear directions'.length, ts: { bl: BooleanNumber.TRUE } },
          ],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'harbor-section' }],
      customRanges: empty
        ? []
        : [
            {
              rangeId: 'harbor-checklist',
              rangeType: CustomRangeType.HYPERLINK,
              startIndex: dataStream.indexOf('\u001F'),
              endIndex: dataStream.indexOf('\u001E'),
              properties: { url: 'https://example.org/harbor-review' },
            },
          ],
    },
  }
}
