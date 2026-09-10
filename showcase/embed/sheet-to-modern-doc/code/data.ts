import type { IDocumentData, IWorkbookData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType } from '@univerjs/core'

export const HOST_ID = 'pollen-campaign-brief'
export const SHEET_UNIT_ID = 'pollen-channel-source'
export const SHEET_ID = 'channels'
export const SHEET_NAME = 'Pollen Channels'
export const BLOCK_MARKERS = ['04 / Next experiment'] as const
const sheet = "'[Pollen Channels]Channels'!"
const spend = 'SUM(' + sheet + 'B5:B7)'
const revenue = 'SUM(' + sheet + 'C5:C7)'
const visits = 'SUM(' + sheet + 'D5:D7)'
const orders = 'SUM(' + sheet + 'E5:E7)'
const rate = '(' + revenue + '-' + spend + ')/' + spend
const target = sheet + 'G5'
export const INLINE_FORMULAS = [
  { marker: '{{spend}}', formula: '=' + spend, pattern: '$#,##0' },
  { marker: '{{revenue}}', formula: '=' + revenue, pattern: '$#,##0' },
  { marker: '{{surplus}}', formula: '=' + revenue + '-' + spend, pattern: '$#,##0;-$#,##0' },
  { marker: '{{return}}', formula: '=' + rate, pattern: '0.0%' },
  { marker: '{{visits}}', formula: '=' + visits, pattern: '#,##0' },
  { marker: '{{orders}}', formula: '=' + orders, pattern: '#,##0' },
  { marker: '{{conversion}}', formula: '=' + orders + '/' + visits, pattern: '0.00%' },
  ...['search', 'email', 'partners'].map((id, i) => ({
    marker: '{{' + id + '}}',
    formula: '=(' + sheet + 'C' + (i + 5) + '-' + sheet + 'B' + (i + 5) + ')/' + sheet + 'B' + (i + 5),
    pattern: '0.0%',
  })),
  { marker: '{{target}}', formula: '=' + target, pattern: '0.0%' },
  { marker: '{{gap}}', formula: '=(' + rate + ')-' + target, pattern: '+0.0%;-0.0%;0.0%' },
  {
    marker: '{{signal}}',
    formula: '=IF((' + rate + ')>=' + target + ',"Keep learning","Review the channel mix")',
    pattern: 'General',
  },
] as const
export const CHANNELS = [
  ['Search', 4800, 8640, 2400, 96, 'Compare intent groups before widening the audience.'],
  ['Email', 2200, 5280, 1600, 88, 'Test the first paragraph with a small subscriber cohort.'],
  ['Partners', 5000, 4680, 3000, 78, 'Review the offer and placement before the next pilot.'],
] as const
const paragraphs = [
  ['POLLEN / CAMPAIGN PULSE', 'kicker'],
  ['A good total can hide a weak channel.', 'title'],
  ['Learning brief / 12 September 2029 / Fictional workshop campaign', 'meta'],
  ['01 / Read the overall signal', 'heading'],
  [
    'We spent {{spend}} and recorded {{revenue}} in attributed revenue, a difference of {{surplus}}. The blended attributed return is {{return}}. It is calculated from totals, not an average of channel percentages.',
    'body',
  ],
  [
    'The campaign recorded {{visits}} visits and {{orders}} orders: a visit-to-order ratio of {{conversion}}. Attribution is illustrative; visits are not unique people, and this ratio does not establish causation.',
    'body',
  ],
  ['02 / Keep the channel differences visible', 'heading'],
  [
    'Search returns {{search}}, Email {{email}}, and Partners {{partners}}. A negative channel result remains visible even when the blended result is positive.',
    'body',
  ],
  [
    'Against our editable learning target of {{target}}, the return-minus-target gap is {{gap}}. The gap is in percentage points, not a relative growth rate.',
    'body',
  ],
  ['Discussion prompt: {{signal}}.', 'signal'],
  ['03 / Working channel sheet', 'heading'],
  [
    'Expand the native Sheet block to edit. Amber cells hold spend, teal holds revenue, and lavender holds the independent target. Visits, orders and context can change separately. No refresh button is needed.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[0], 'heading'],
  [
    'Raise Search spend from 4,800 to 6,300 without changing revenue. The blended return falls from 55.0% to 37.8%; the channel comparison explains why. Changing the target changes the prompt, not the underlying campaign results.',
    'body',
  ],
  [
    'The current source range is three authored channels, not an automatically expanding table. Notes provide context but never enter the arithmetic. Null and text are not measured zero; SUM ignores them while direct channel arithmetic exposes native errors.',
    'body',
  ],
  [
    'Before increasing the pilot, agree how attribution is measured and what information is missing. Attributed return excludes product costs, refunds and overhead; it is not net profit or a spend recommendation.',
    'body',
  ],
  ['Prepared for discussion / No live advertising account, customer data or automated budget changes.', 'meta'],
] as const
export function createHostData(): IDocumentData {
  let offset = 0
  const dataStream = paragraphs.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Pollen / Campaign pulse',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 1000, height: 1000 },
      marginTop: 32,
      marginBottom: 36,
      marginLeft: 56,
      marginRight: 56,
    },
    drawings: {},
    drawingsOrder: [],
    body: {
      dataStream,
      paragraphs: paragraphs.map(([text, kind], i) => {
        offset += text.length + 1
        const heading = kind === 'heading'
        return {
          startIndex: offset - 1,
          paragraphId: 'pollen-p-' + i,
          paragraphStyle: {
            namedStyleType:
              kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
            ...(heading ? { headingId: 'pollen-heading-' + i } : {}),
            spaceAbove: { v: heading ? 14 : 0 },
            spaceBelow: { v: 9 },
            lineSpacing: 1.3,
            textStyle: {
              ff: 'Arial',
              fs: kind === 'title' ? 31 : heading ? 17 : kind === 'meta' ? 10 : 14,
              bl: heading || kind === 'title' || kind === 'signal' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
              cl: {
                rgb:
                  kind === 'kicker'
                    ? '#99702D'
                    : kind === 'signal'
                      ? '#276C5B'
                      : heading
                        ? '#226D83'
                        : kind === 'title'
                          ? '#101A34'
                          : '#485E68',
              },
            },
          },
        }
      }),
      textRuns: [],
      customBlocks: [],
      customRanges: [],
      customDecorations: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'pollen-section' }],
    },
  }
}
export function createSheetData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'POLLEN / Three-channel pilot', s: 'title' } },
    1: { 0: { v: 'Illustrative amounts / same attribution window / edit inputs, not summaries', s: 'muted' } },
    3: Object.fromEntries(
      ['Channel', 'Spend / $', 'Revenue / $', 'Visits', 'Orders', 'Next question', 'Target'].map((v, i) => [
        i,
        { v, s: 'header' },
      ]),
    ),
    8: {
      0: { v: 'Combined', s: 'header' },
      1: { f: '=SUM(B5:B7)', s: 'total' },
      2: { f: '=SUM(C5:C7)', s: 'total' },
      3: { f: '=SUM(D5:D7)', s: 'count' },
      4: { f: '=SUM(E5:E7)', s: 'count' },
    },
    10: {
      0: { v: 'Blended return', s: 'header' },
      1: { f: '=(C9-B9)/B9', s: 'ratio' },
      3: { v: 'Order / visit', s: 'header' },
      4: { f: '=E9/D9', s: 'ratio' },
    },
    12: { 0: { v: 'No live account. Fixed source rows 5:7; notes do not enter calculations.', s: 'muted' } },
  }
  CHANNELS.forEach(([name, spendValue, revenueValue, visitsValue, orderValue, note], i) => {
    cellData[i + 4] = {
      0: { v: name, s: i % 2 ? 'stripe' : 'body' },
      1: { v: spendValue, s: 'spend' },
      2: { v: revenueValue, s: 'revenue' },
      3: { v: visitsValue, s: 'number' },
      4: { v: orderValue, s: 'number' },
      5: { v: note, s: 'muted' },
    }
  })
  cellData[4][6] = { v: 0.5, s: 'target' }
  return {
    id: SHEET_UNIT_ID,
    name: SHEET_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-rc.0',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 21, bl: 1, cl: { rgb: '#101A34' } },
      header: { bg: { rgb: '#DFEAF0' }, bl: 1, cl: { rgb: '#226D83' } },
      body: { cl: { rgb: '#3D4C60' } },
      stripe: { bg: { rgb: '#F1F4F8' } },
      muted: { fs: 10, cl: { rgb: '#60758B' } },
      spend: { bg: { rgb: '#F8E8C8' }, n: { pattern: '$#,##0' }, cl: { rgb: '#805C24' } },
      revenue: { bg: { rgb: '#DCEEE7' }, n: { pattern: '$#,##0' }, cl: { rgb: '#276C5B' } },
      number: { bg: { rgb: '#EDF3F7' }, n: { pattern: '#,##0' } },
      target: { bg: { rgb: '#EBE3F7' }, n: { pattern: '0.0%' }, cl: { rgb: '#685187' } },
      total: { bg: { rgb: '#DFEAF0' }, bl: 1, n: { pattern: '$#,##0' } },
      count: { bg: { rgb: '#DFEAF0' }, bl: 1, n: { pattern: '#,##0' } },
      ratio: { bg: { rgb: '#EBE3F7' }, bl: 1, n: { pattern: '0.0%' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Channels',
        rowCount: 17,
        columnCount: 8,
        defaultRowHeight: 29,
        defaultColumnWidth: 90,
        columnData: {
          0: { w: 110 },
          1: { w: 95 },
          2: { w: 100 },
          3: { w: 85 },
          4: { w: 80 },
          5: { w: 220 },
          6: { w: 80 },
        },
        rowData: { 0: { h: 42 }, 4: { h: 48 }, 5: { h: 48 }, 6: { h: 48 } },
        cellData,
        mergeData: [0, 1, 12].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 6 })),
      },
    },
  }
}
