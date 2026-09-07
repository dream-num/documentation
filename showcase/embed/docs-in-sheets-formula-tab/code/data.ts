import type { IDocumentData, IWorkbookData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType } from '@univerjs/core'
export const HOST_ID = 'cypress-cash-forecast'
export const CHILD_ID = 'cypress-forecast-notebook'
export const SHEET_ID = 'forecast'
export const SOURCE_NAME = 'Cypress Forecast'
const source = "'[Cypress Forecast]Cash forecast'!"
const opening = source + 'B5'
const incoming = 'SUM(' + source + 'B8:B9)'
const outgoing = 'SUM(' + source + 'B12:B14)'
const closing = '(' + opening + '+' + incoming + '-' + outgoing + ')'
const floor = source + 'B17'
const rate = source + 'B18'
const stressed = '(' + opening + '+' + incoming + '*' + rate + '-' + outgoing + ')'
export const INLINE_FORMULAS = [
  { marker: '{{opening}}', formula: '=' + opening, pattern: '$#,##0' },
  { marker: '{{incoming}}', formula: '=' + incoming, pattern: '$#,##0' },
  { marker: '{{outgoing}}', formula: '=' + outgoing, pattern: '$#,##0' },
  { marker: '{{net}}', formula: '=' + incoming + '-' + outgoing, pattern: '+$#,##0;-$#,##0;$0' },
  { marker: '{{closing}}', formula: '=' + closing, pattern: '$#,##0;-$#,##0' },
  { marker: '{{floor}}', formula: '=' + floor, pattern: '$#,##0' },
  { marker: '{{headroom}}', formula: '=' + closing + '-' + floor, pattern: '$#,##0;-$#,##0' },
  { marker: '{{rate}}', formula: '=' + rate, pattern: '0.0%' },
  { marker: '{{stressed}}', formula: '=' + stressed, pattern: '$#,##0;-$#,##0' },
  { marker: '{{delaygap}}', formula: '=' + stressed + '-' + floor, pattern: '$#,##0;-$#,##0' },
  { marker: '{{later}}', formula: '=' + incoming + '*(1-' + rate + ')', pattern: '$#,##0' },
  { marker: '{{coverage}}', formula: '=' + incoming + '/' + outgoing, pattern: '0.00"x"' },
  {
    marker: '{{signal}}',
    formula: '=IF(' + stressed + '>=' + floor + ',"Timing buffer covered","Confirm collection dates")',
    pattern: 'General',
  },
] as const
export function createHostData(): Partial<IWorkbookData> {
  const cells: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'CYPRESS / A surplus is not a payment date.', s: 'title' } },
    1: { 0: { v: 'Independent press / October 2029 planning / Original fictional USD amounts', s: 'muted' } },
    3: {
      0: { v: 'OPENING POSITION', s: 'header' },
      1: { v: 'Amount / $', s: 'header' },
      2: { v: 'Assumption', s: 'header' },
    },
    6: { 0: { v: 'EXPECTED COLLECTIONS', s: 'header' }, 1: { v: 'Amount / $', s: 'header' } },
    10: { 0: { v: 'PLANNED PAYMENTS', s: 'header' }, 1: { v: 'Amount / $', s: 'header' } },
    15: { 0: { v: 'TIMING POLICY', s: 'header' }, 1: { v: 'Input', s: 'header' } },
    20: { 0: { v: 'Total collections', s: 'label' }, 1: { f: '=SUM(B8:B9)', s: 'income' } },
    21: { 0: { v: 'Total payments', s: 'label' }, 1: { f: '=SUM(B12:B14)', s: 'payment' } },
    22: { 0: { v: 'Net movement', s: 'label' }, 1: { f: '=B21-B22', s: 'money' } },
    23: { 0: { v: 'Expected closing', s: 'header' }, 1: { f: '=B5+B23', s: 'total' } },
    24: { 0: { v: 'Above reserve floor', s: 'label' }, 1: { f: '=B24-B17', s: 'money' } },
    26: { 0: { v: 'Balance at payment date', s: 'header' }, 1: { f: '=B5+B21*B18-B22', s: 'stress' } },
    27: { 0: { v: 'Timing balance minus floor', s: 'label' }, 1: { f: '=B27-B17', s: 'stress' } },
    29: { 0: { v: 'Read Forecast notebook in the native tab below.', s: 'muted' } },
    30: { 0: { v: 'Change collection timing without inventing extra income.', s: 'muted' } },
  }
  const inputs = [
    [4, 'Opening balance', 4000, 'money', 'Illustrative starting cash, not a live bank feed.'],
    [7, 'Subscriptions', 8500, 'income', 'Expected renewal collections.'],
    [8, 'Commissioned editions', 4000, 'income', 'Expected project receipts.'],
    [11, 'Paper and materials', 4300, 'payment', 'Planned supplier payment.'],
    [12, 'Print production', 3500, 'payment', 'Planned production payment.'],
    [13, 'Freight and fulfilment', 2000, 'payment', 'Planned distribution payment.'],
    [16, 'Reserve floor', 5000, 'policy', 'An editable internal threshold, not a recommendation.'],
    [17, 'Collected before payment', 0.75, 'rate', 'A scenario assumption; not a probability or discount.'],
  ] as const
  for (const [row, label, value, style, note] of inputs)
    cells[row] = { 0: { v: label, s: 'label' }, 1: { v: value, s: style }, 2: { v: note, s: 'muted' } }
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 24, bl: 1, bg: { rgb: '#573C62' }, cl: { rgb: '#F5EAD4' } },
      header: { bl: 1, bg: { rgb: '#EFE8F0' }, cl: { rgb: '#573C62' } },
      label: { cl: { rgb: '#465750' } },
      muted: { fs: 11, cl: { rgb: '#7A8277' } },
      income: { bg: { rgb: '#E4EEE3' }, cl: { rgb: '#486B45' }, n: { pattern: '$#,##0' } },
      payment: { bg: { rgb: '#F7EBD9' }, cl: { rgb: '#946A31' }, n: { pattern: '$#,##0' } },
      money: { cl: { rgb: '#465750' }, n: { pattern: '$#,##0;-$#,##0' } },
      policy: { bg: { rgb: '#EEE7F0' }, cl: { rgb: '#755080' }, n: { pattern: '$#,##0' } },
      rate: { bg: { rgb: '#EEE7F0' }, cl: { rgb: '#755080' }, n: { pattern: '0.0%' } },
      total: { bg: { rgb: '#573C62' }, cl: { rgb: '#F5EAD4' }, bl: 1, n: { pattern: '$#,##0;-$#,##0' } },
      stress: { bg: { rgb: '#F7EBD9' }, cl: { rgb: '#946A31' }, bl: 1, n: { pattern: '$#,##0;-$#,##0' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Cash forecast',
        rowCount: 60,
        columnCount: 12,
        defaultRowHeight: 28,
        defaultColumnWidth: 110,
        cellData: cells,
        columnData: { 0: { w: 300 }, 1: { w: 170 }, 2: { w: 540 } },
        rowData: { 0: { h: 44 } },
        mergeData: [0, 1, 29, 30].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 2 })),
      },
    },
  }
}
export const MEMO = [
  ['CYPRESS / FORECAST NOTEBOOK', 'kicker'],
  ['The total is only half the story.', 'title'],
  ['Planning note / 26 September 2029 / Fictional independent press', 'meta'],
  ['01 / Follow the movement', 'heading'],
  [
    'Opening cash {{opening}}, expected collections {{incoming}}, and planned payments {{outgoing}} imply a net movement of {{net}}. Expected closing cash is {{closing}}. These are estimates, not recorded bank transactions.',
    'body',
  ],
  ['02 / Keep the threshold separate', 'heading'],
  [
    'Against an editable reserve floor of {{floor}}, the expected closing balance leaves {{headroom}}. Changing this threshold does not create cash or change a supplier payment.',
    'body',
  ],
  ['03 / Test the payment date', 'heading'],
  [
    'If {{rate}} of expected collections arrive before payment, the timing balance is {{stressed}}. Its difference from the floor is {{delaygap}}; {{later}} of collections would arrive later. This shifts timing, not total income.',
    'body',
  ],
  [
    'Expected collections cover planned payments {{coverage}}. That total-period ratio cannot prove the payment-date balance is sufficient.',
    'body',
  ],
  ['Discussion prompt: {{signal}}.', 'warning'],
  ['04 / What to confirm next', 'heading'],
  [
    'Confirm subscription settlement dates, project acceptance dates and supplier terms. Do not treat a blank estimate as zero, or a timing assumption as a guarantee. The current model has two collection rows and three payment rows; it does not expand automatically.',
    'body',
  ],
  [
    'Edit Cash forecast, then return to this native document tab. Formula ranges update without rewriting the explanation. No external bank, backend, automated payment or financing recommendation.',
    'meta',
  ],
] as const
export function createChildData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([text, kind], index) => {
    offset += text.length + 1
    const heading = kind === 'heading' || kind === 'warning'
    return {
      startIndex: offset - 1,
      paragraphId: `cypress-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `cypress-section-${index}` } : {}),
        spaceAbove: { v: heading ? 14 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 8 },
        lineSpacing: 1.15,
        textStyle: {
          ff: kind === 'title' ? 'Georgia' : 'Arial',
          fs: kind === 'title' ? 30 : heading ? 16 : kind === 'meta' || kind === 'kicker' ? 11 : 13,
          bl: kind === 'title' || heading ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#9B7034'
                : kind === 'meta'
                  ? '#72766E'
                  : heading || kind === 'title' || kind === 'kicker'
                    ? '#573C62'
                    : '#465750',
          },
        },
      },
    }
  })
  const dataStream = MEMO.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: CHILD_ID,
    title: 'Cypress / Forecast notebook',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 1040, height: 1100 },
      marginTop: 28,
      marginBottom: 28,
      marginLeft: 64,
      marginRight: 64,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'cypress-memo-section' }],
    },
  }
}
