import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export const IMAGE_ID = 'kestrel-coast'
export const ALT_TEXT = 'A coastal listening station: orange recorder on a tripod, blue sea, and a yellow sunrise.'
// Original CC0 illustration, embedded in the downloadable source; no remote asset dependency.
export const COAST_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150" viewBox="0 0 240 150"><rect width="240" height="150" fill="#e0f2fe"/><circle cx="201" cy="31" r="17" fill="#fbbf24"/><path d="M0 75Q40 60 80 75T160 75T240 75V150H0Z" fill="#0284c7"/><path d="M0 114Q70 98 140 123T240 122V150H0Z" fill="#d6d3d1"/><path d="m100 75-24 62m24-62 28 62m-28-62v62" stroke="#334155" stroke-width="5"/><rect x="78" y="40" width="45" height="35" rx="5" fill="#ea580c"/><circle cx="101" cy="57" r="10" fill="#fff7ed"/><path d="M99 31v-14m-9 5 9 9 9-9" fill="none" stroke="#334155" stroke-width="3"/></svg>'
export const SCHEDULE = [
  ['Station', 'Start', 'Minutes'],
  ['Harbor wall', '05:40', '18'],
  ['Dune path', '06:15', '24'],
  ['Tidal pool', '07:05', '12'],
] as const
export const CHART_VALUES = [
  ['Station', 'Usable clips'],
  ['Harbor', 11],
  ['Dunes', 17],
  ['Pools', 8],
] as const

export function createData(empty = false): IDocumentData {
  const normal = NamedStyleType.NORMAL_TEXT
  const rows: [string, NamedStyleType][] = empty
    ? [['', normal]]
    : [
        ['Kestrel — Coastal Listening Brief', NamedStyleType.TITLE],
        ['31 March 2027 · Field recording team · Fictional rehearsal data', normal],
        ['01 · Position the recorder', NamedStyleType.HEADING_1],
        [
          'The orange recorder is our shared visual reference. Place its tripod on firm ground above the tide line, keep the microphone clear of clothing, and ask everyone to stand quietly behind the operator. This paragraph is deliberately long enough to make square wrapping visible on both sides of a centered image. The team records waves, birds and footsteps as separate clips so that editors can compare the locations without confusing their sound signatures. Keep a written note of wind direction, unexpected voices and equipment changes. Never enter closed paths or move nesting birds for a better recording. The original illustration is supplied with this source and needs no external image host.',
          normal,
        ],
        ['02 · Compare recording methods', NamedStyleType.HEADING_1],
        ['Compare a fixed station with a walking survey before choosing the station timings.', normal],
        ['03 · Station schedule', NamedStyleType.HEADING_1],
        ['Use this small table as an independent reference while changing the image layout.', normal],
        ['04 · Rehearsal results', NamedStyleType.HEADING_1],
        ['Usable clips from the fictional rehearsal', normal],
        ['', normal],
        ['05 · Team handoff', NamedStyleType.HEADING_1],
        [
          'Mina labels the memory cards; Ellis checks the weather log. Stop at the agreed time and leave the coast as you found it.',
          normal,
        ],
      ]
  let offset = 0
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: 'kestrel-images',
    title: 'Kestrel — Coastal Listening Brief',
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
      paragraphs: rows.map(([text, style], i) => {
        offset += text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'para_kestrel_' + i,
          paragraphStyle: {
            namedStyleType: style,
            spaceBelow: { v: 8 },
            lineSpacing: 1.2,
            textStyle: {
              fs: style === NamedStyleType.TITLE ? 24 : style === normal ? 13 : 18,
              bl: style === normal ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'kestrel-section' }],
    },
  }
}
