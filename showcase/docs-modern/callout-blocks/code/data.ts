import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, CustomRangeType, DashStyleType, DocumentFlavor, NamedStyleType } from '@univerjs/core'

// Original fictional localization product brief; dates, content, and fixture IDs are fixed.
export const PRIMARY_ID = 'tide-risk'
export const COMPARISON_ID = 'tide-note'
export const ROWS = [
  ['Tide Language Kit — Rollout Brief', NamedStyleType.TITLE],
  ['31 March 2027 · Localization team · Community edition', NamedStyleType.NORMAL_TEXT],
  ['01 · Product scope', NamedStyleType.HEADING_1],
  [
    'A lightweight phrase guide helps volunteer hosts welcome visitors in eight languages without a network connection.',
    NamedStyleType.NORMAL_TEXT,
  ],
  ['02 · Release decision', NamedStyleType.HEADING_1],
  [
    '[RISK] The offline pack must include every reviewed phrase before the community launch. A missing translation must show its source language, never an empty label.',
    NamedStyleType.NORMAL_TEXT,
  ],
  [
    '[NOTE] Audio pronunciation is optional in this edition; the text guide remains fully usable without it.',
    NamedStyleType.NORMAL_TEXT,
  ],
  ['03 · Content package', NamedStyleType.HEADING_1],
  [
    '[READY] Native-speaker reviewers have approved the arrival glossary; the signed phrase register is ready for packaging.',
    NamedStyleType.NORMAL_TEXT,
  ],
  [
    '[STOP] Do not publish a language pack with missing fallback labels. Keep that edition in review until the small-screen check passes.',
    NamedStyleType.NORMAL_TEXT,
  ],
  ['Arrival, directions, and accessibility phrases', NamedStyleType.NORMAL_TEXT],
  ['A short glossary reviewed by native speakers', NamedStyleType.NORMAL_TEXT],
  ['04 · Acceptance checks', NamedStyleType.HEADING_1],
  ['Confirm all eight language packs are available offline', NamedStyleType.NORMAL_TEXT],
  ['Review fallback labels on a small-screen device', NamedStyleType.NORMAL_TEXT],
  ['05 · Delivery configuration', NamedStyleType.HEADING_1],
  ['const release = { languages: 8, audio: false };', NamedStyleType.NORMAL_TEXT],
  ['await languageKit.cache(release);', NamedStyleType.NORMAL_TEXT],
  ['06 · Design rationale', NamedStyleType.HEADING_1],
  ['A useful translation preserves intent before it polishes the sentence.', NamedStyleType.NORMAL_TEXT],
  ['— Tide editorial workshop, fictional attribution', NamedStyleType.NORMAL_TEXT],
  ['Read the \u001Ftranslation review checklist\u001E before approving a phrase.', NamedStyleType.NORMAL_TEXT],
] as const
export const STYLES = [
  {
    id: 'warning',
    label: 'Warning',
    icon: '!',
    backgroundColor: '#FEF0C7',
    borderColor: '#D97706',
    textColor: '#78350F',
  },
  {
    id: 'information',
    label: 'Information',
    icon: 'i',
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
    textColor: '#1E3A8A',
  },
  {
    id: 'success',
    label: 'Success',
    icon: '✓',
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
    textColor: '#14532D',
  },
  {
    id: 'critical',
    label: 'Critical',
    icon: '×',
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
    textColor: '#7F1D1D',
  },
] as const
export const BORDERS = [
  { id: 'solid', label: 'Solid / 1 px', style: DashStyleType.SOLID, width: 1 },
  { id: 'dashed', label: 'Dashed / 2 px', style: DashStyleType.DASH, width: 2 },
  { id: 'dotted', label: 'Dotted / 3 px', style: DashStyleType.DOT, width: 3 },
  { id: 'none', label: 'No border', style: DashStyleType.SOLID, width: 0 },
] as const
export function createData(empty = false): IDocumentData {
  const rows = empty ? [['', NamedStyleType.NORMAL_TEXT] as const] : ROWS
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  let offset = 0
  const emphasis = dataStream.indexOf('offline pack')
  return {
    id: 'tide-callout-demo',
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
          paragraphId: 'para_tide_' + index,
          paragraphStyle: {
            namedStyleType: style,
            lineSpacing: 1,
            spaceBelow: { v: 8 },
          },
        }
      }),
      textRuns:
        emphasis < 0 ? [] : [{ st: emphasis, ed: emphasis + 'offline pack'.length, ts: { bl: BooleanNumber.TRUE } }],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'tide-section' }],
      customRanges: empty
        ? []
        : [
            {
              rangeId: 'tide-checklist-link',
              rangeType: CustomRangeType.HYPERLINK,
              startIndex: dataStream.indexOf('\u001F'),
              endIndex: dataStream.indexOf('\u001E'),
              properties: { url: 'https://example.org/tide-review-checklist' },
            },
          ],
    },
  }
}
