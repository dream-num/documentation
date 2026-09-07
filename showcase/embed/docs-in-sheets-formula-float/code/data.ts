import type { IDocumentData, IWorkbookData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType } from '@univerjs/core'

export const HOST_ID = 'saffron-kitchen-budget'
export const SHEET_ID = 'budget'
export const CHILD_ID = 'saffron-budget-explanation'
export const SOURCE_NAME = 'Saffron Budget'
const source = "'[Saffron Budget]Kitchen budget'!"
const income = 'SUM(' + source + 'B5:B6)'
const costs = 'SUM(' + source + 'B9:B11)'
const balance = '(' + income + '-' + costs + ')'
const reserve = '(' + income + '*' + source + 'B14)'
export const INLINE_FORMULAS = [
  { marker: '{{income}}', formula: '=' + income, pattern: '$#,##0' },
  { marker: '{{costs}}', formula: '=' + costs, pattern: '$#,##0' },
  { marker: '{{balance}}', formula: '=' + balance, pattern: '$#,##0;-$#,##0' },
  { marker: '{{reserve}}', formula: '=' + reserve, pattern: '$#,##0' },
  { marker: '{{after}}', formula: '=' + balance + '-' + reserve, pattern: '$#,##0;-$#,##0' },
  { marker: '{{guests}}', formula: '=' + source + 'B13', pattern: '#,##0' },
  { marker: '{{perguest}}', formula: '=' + costs + '/' + source + 'B13', pattern: '$#,##0.00' },
  { marker: '{{share}}', formula: '=' + costs + '/' + income, pattern: '0.0%' },
  { marker: '{{venue}}', formula: '=' + source + 'B9', pattern: '$#,##0' },
  { marker: '{{food}}', formula: '=' + source + 'B10', pattern: '$#,##0' },
  { marker: '{{staff}}', formula: '=' + source + 'B11', pattern: '$#,##0' },
  {
    marker: '{{signal}}',
    formula: '=IF(' + balance + '>=' + reserve + ',"Reserve covered","Revisit the scope")',
    pattern: 'General',
  },
] as const

export function createHostData(): Partial<IWorkbookData> {
  const rows: Array<[number, string, number | string, string]> = [
    [4, 'Workshop tickets', 6200, 'income'],
    [5, 'Community grant', 3000, 'income'],
    [8, 'Kitchen hire', 2400, 'cost'],
    [9, 'Ingredients', 3100, 'cost'],
    [10, 'Facilitators', 2100, 'cost'],
    [12, 'Participants', 80, 'input'],
    [13, 'Reserve / income', 0.1, 'rate'],
  ]
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'SAFFRON / A budget worth explaining.', s: 'title' } },
    1: { 0: { v: 'Community kitchen / 25 September 2029 / Fictional USD amounts', s: 'muted' } },
    3: { 0: { v: 'FUNDING', s: 'header' }, 1: { v: 'Amount / $', s: 'header' } },
    7: { 0: { v: 'PROGRAMME COST', s: 'header' }, 1: { v: 'Amount / $', s: 'header' } },
    15: { 0: { v: 'Total income', s: 'label' }, 1: { f: '=SUM(B5:B6)', s: 'income' } },
    16: { 0: { v: 'Planned spending', s: 'label' }, 1: { f: '=SUM(B9:B11)', s: 'cost' } },
    17: { 0: { v: 'Headroom', s: 'header' }, 1: { f: '=B16-B17', s: 'total' } },
    18: { 0: { v: 'Protected reserve', s: 'label' }, 1: { f: '=B16*B14', s: 'money' } },
    19: { 0: { v: 'After reserve', s: 'label' }, 1: { f: '=B18-B19', s: 'money' } },
    20: { 0: { v: 'Cost per participant', s: 'label' }, 1: { f: '=B17/B13', s: 'decimal' } },
    23: { 0: { v: 'EDIT THE ASSUMPTION.', s: 'header' } },
    24: { 0: { v: 'Keep the explanation connected.', s: 'muted' } },
    26: { 0: { v: 'Ingredients 3,100 → 3,600:', s: 'muted' } },
    27: { 0: { v: 'headroom 1,600 → 1,100.', s: 'muted' } },
    29: { 0: { v: 'Separate inputs, one live story.', s: 'muted' } },
  }
  for (const [r, label, v, s] of rows) cellData[r] = { 0: { v: label, s: 'label' }, 1: { v, s } }
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 24, bl: 1, bg: { rgb: '#1D354D' }, cl: { rgb: '#F3CE76' } },
      header: { bl: 1, bg: { rgb: '#E8EDF2' }, cl: { rgb: '#1D354D' } },
      label: { cl: { rgb: '#465664' } },
      muted: { fs: 11, cl: { rgb: '#6E7F8D' } },
      income: { bg: { rgb: '#E4EFEB' }, cl: { rgb: '#296F63' }, n: { pattern: '$#,##0' } },
      cost: { bg: { rgb: '#F7E7DE' }, cl: { rgb: '#A45538' }, n: { pattern: '$#,##0' } },
      input: { bg: { rgb: '#FBF0D5' }, cl: { rgb: '#876319' } },
      rate: { bg: { rgb: '#FBF0D5' }, cl: { rgb: '#876319' }, n: { pattern: '0.0%' } },
      total: { bg: { rgb: '#1D354D' }, cl: { rgb: '#F3CE76' }, bl: 1, n: { pattern: '$#,##0;-$#,##0' } },
      money: { cl: { rgb: '#1D354D' }, n: { pattern: '$#,##0;-$#,##0' } },
      decimal: { cl: { rgb: '#1D354D' }, n: { pattern: '$#,##0.00' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Kitchen budget',
        rowCount: 70,
        columnCount: 20,
        defaultRowHeight: 28,
        defaultColumnWidth: 88,
        cellData,
        columnData: { 0: { w: 255 }, 1: { w: 155 } },
        rowData: { 0: { h: 42 } },
        mergeData: [0, 1].map((r) => ({ startRow: r, endRow: r, startColumn: 0, endColumn: 11 })),
      },
    },
  }
}

export const MEMO = [
  ['SAFFRON / COMMUNITY KITCHEN', 'kicker'],
  ['Protect the programme, not just the total.', 'title'],
  ['Budget explanation / 25 September 2029 / Owner: Noor', 'meta'],
  ['01 / What the numbers leave us', 'heading'],
  [
    'Funding of {{income}} covers planned spending of {{costs}}, leaving {{balance}} before reserve. These are programme estimates, not settled cash.',
    'body',
  ],
  ['02 / Keep a deliberate buffer', 'heading'],
  [
    'The selected reserve is {{reserve}} of income. Headroom after that buffer is {{after}}. Discussion prompt: {{signal}}.',
    'body',
  ],
  ['03 / Scale and composition', 'heading'],
  [
    'For {{guests}} participants, planned cost is {{perguest}} each. Spending uses {{share}} of funding. A changed headcount does not automatically change fixed source costs.',
    'body',
  ],
  [
    'Kitchen hire {{venue}}, ingredients {{food}}, and facilitators {{staff}} remain separately editable. Raising ingredients must not rewrite ticket income or reserve policy.',
    'body',
  ],
  ['04 / Before committing', 'warning'],
  [
    'Confirm accessibility, dietary needs and facilitator availability. Blank amounts mean unknown, not free. A positive balance does not itself approve a purchase.',
    'body',
  ],
  [
    'Native Sheet → Doc inline formulas. The prose stays authored; only the linked ranges recalculate. Original fictional example, no external account or automated spending.',
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
      paragraphId: `saffron-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `saffron-section-${index}` } : {}),
        spaceAbove: { v: heading ? 14 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 8 },
        lineSpacing: 1.15,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 27 : heading ? 16 : kind === 'meta' || kind === 'kicker' ? 11 : 13,
          bl: kind === 'title' || heading ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#A45538'
                : kind === 'meta'
                  ? '#72766E'
                  : heading || kind === 'title' || kind === 'kicker'
                    ? '#1D354D'
                    : '#465664',
          },
        },
      },
    }
  })
  const dataStream = MEMO.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: CHILD_ID,
    title: 'Saffron / Budget explanation',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 780, height: 1100 },
      marginTop: 28,
      marginBottom: 28,
      marginLeft: 34,
      marginRight: 34,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'saffron-memo-section' }],
    },
  }
}
