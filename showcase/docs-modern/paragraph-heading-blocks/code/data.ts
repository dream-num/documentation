import type { IDocumentData, IParagraphStyle } from '@univerjs/core'
import {
  BooleanNumber,
  CustomRangeType,
  DocumentFlavor,
  HorizontalAlign,
  NamedStyleType,
  SpacingRule,
} from '@univerjs/core'

// Original fictional product brief. All dates, paragraph IDs, block IDs, and content are fixed.
export const TITLE = 'Lumen Field Notes — Product Brief'
export const ROWS = [
  { text: TITLE, level: -1 },
  { text: 'Decision draft · 31 March 2027 · Product and field operations', level: 0 },
  { text: '01 · Purpose', level: 1 },
  { text: 'Capture field observations once, then keep evidence and decisions together during a site visit.', level: 0 },
  { text: '02 · Audience', level: 1 },
  { text: 'Field researchers working across three time zones', level: 0 },
  { text: 'Reviewers comparing observation quality, not volume', level: 0 },
  { text: '03 · [SCOPE] Pilot scope', level: 2 },
  {
    text: '[SUMMARY] The pilot covers twelve coastal sites with uneven connectivity. Teams record a short observation, attach supporting evidence, and assign one reviewer. A shared vocabulary reduces duplicate notes while preserving uncertainty. The summary remains editable when paragraph layout changes.',
    level: 0,
  },
  { text: 'Confirm consent language before the first field visit', level: 0 },
  { text: '04 · [PLAN] Delivery plan', level: 2 },
  { text: 'const pilot = { sites: 12, offline: true };', level: 0 },
  { text: 'await fieldNotes.start(pilot);', level: 0 },
  { text: '05 · Risks', level: 1 },
  { text: 'RISK NOTE: sync conflicts must never silently discard accepted evidence.', level: 0 },
  { text: '06 · Evidence', level: 1 },
  { text: 'A useful note explains what changed and why the team trusts it.', level: 0 },
  { text: '— Lumen research team, fictional workshop', level: 0 },
  { text: 'Read the \u001Flumen.example research protocol\u001E before collecting evidence.', level: 0 },
] as const
export const LEVELS = [
  NamedStyleType.NORMAL_TEXT,
  NamedStyleType.HEADING_1,
  NamedStyleType.HEADING_2,
  NamedStyleType.HEADING_3,
  NamedStyleType.HEADING_4,
  NamedStyleType.HEADING_5,
] as const
export const BASE_STYLE: IParagraphStyle = {
  spacingRule: SpacingRule.AUTO,
  lineSpacing: 1,
  spaceAbove: { v: 0 },
  spaceBelow: { v: 8 },
  indentStart: { v: 0 },
  indentEnd: { v: 0 },
  indentFirstLine: { v: 0 },
  hanging: { v: 0 },
  horizontalAlign: HorizontalAlign.LEFT,
  snapToGrid: BooleanNumber.FALSE,
}
export function createData(empty = false): IDocumentData {
  const rows = empty ? [{ text: '', level: 0 }] : ROWS
  const dataStream = rows.map((row) => row.text).join('\r') + '\r\n'
  let offset = 0
  const paragraphs = rows.map((row, index) => {
    offset += row.text.length + 1
    const level = Math.max(0, row.level)
    return {
      startIndex: offset - 1,
      paragraphId: 'para_lumen_' + index,
      paragraphStyle: {
        ...structuredClone(BASE_STYLE),
        namedStyleType: row.level === -1 ? NamedStyleType.TITLE : LEVELS[level],
        ...(level ? { headingId: 'lumen-heading-' + index } : {}),
      },
    }
  })
  const linkStart = dataStream.indexOf('\u001F')
  return {
    id: 'lumen-paragraph-heading-demo',
    title: TITLE,
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
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'lumen-section' }],
      customRanges:
        linkStart < 0
          ? []
          : [
              {
                rangeId: 'lumen-protocol-link',
                rangeType: CustomRangeType.HYPERLINK,
                startIndex: linkStart,
                endIndex: dataStream.indexOf('\u001E'),
                properties: { url: 'https://example.org/lumen-protocol' },
              },
            ],
    },
  }
}
