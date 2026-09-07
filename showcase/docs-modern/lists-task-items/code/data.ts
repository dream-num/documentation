import type { IDocumentData, NamedStyleType } from '@univerjs/core'
import { CustomRangeType, DocumentFlavor } from '@univerjs/core'

// Original fictional museum brief. Content, dates, paragraph IDs, and list IDs are deterministic.
export const ROWS = [
  ['Mosaic Pop-up Museum — Opening Brief', 2],
  ['31 March 2027 · Opening team · Pier 8 community hall', 1],
  ['01 · Visitor promise', 4],
  ['A twenty-minute exhibition connects everyday objects to the people who repaired, shared, and saved them.', 1],
  ['02 · Object shortlist', 4],
  ['[RADIO] Portable radio with a handwritten repair log', 1],
  ['[MAP] Ferry map annotated by three generations', 1],
  ['[COAT] Raincoat patched with sailcloth', 1],
  ['03 · Installation sequence', 4],
  ['[FLOOR] Mark the accessible visitor route', 1],
  ['[LABEL] Match labels to the object inventory', 1],
  ['[LIGHT] Check glare from a seated visitor height', 1],
  ['[WALK] Rehearse the twenty-minute visitor walk', 1],
  ['[OPEN] Hand over the gallery to the welcome team', 1],
  ['04 · Partner handoff', 4],
  ['[EMAIL] Send the partner preview invitation', 1],
  ['[SIGNS] Place the street signs after the morning market', 1],
  ['05 · Opening checks', 4],
  ['[EXIT] Confirm the emergency exit is unobstructed', 1],
  ['[AUDIO] Download the offline audio guide', 1],
  ['[KEYS] Collect the community hall keys', 1],
  ['[RISK] Keep borrowed objects away from the afternoon sun.', 1],
  ['06 · Operating notes', 4],
  ['const opening = { capacity: 36, audio: "offline" };', 1],
  ['An object becomes a story when someone explains why it mattered.', 1],
  ['— Mosaic volunteer workshop, fictional attribution', 1],
  ['Read the \u001Fexhibition handling guide\u001E before unpacking.', 1],
] as const
export function createData(empty = false): IDocumentData {
  const rows = empty ? [['', 1] as const] : ROWS
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'mosaic-list-demo',
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
          paragraphId: 'para_mosaic_' + index,
          paragraphStyle: {
            namedStyleType: style as NamedStyleType,
            lineSpacing: 1,
            spaceBelow: { v: 8 },
          },
        }
      }),
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'mosaic-section' }],
      customRanges: empty
        ? []
        : [
            {
              rangeId: 'mosaic-handling-guide',
              rangeType: CustomRangeType.HYPERLINK,
              startIndex: dataStream.indexOf('\u001F'),
              endIndex: dataStream.indexOf('\u001E'),
              properties: { url: 'https://example.org/mosaic-handling' },
            },
          ],
    },
  }
}
