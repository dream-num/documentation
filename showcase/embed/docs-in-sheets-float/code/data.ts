import type { IDocumentData, IWorkbookData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType } from '@univerjs/core'

export const HOST_ID = 'cedar-supplier-review'
export const SHEET_ID = 'supplier-quotes'
export const CHILD_ID = 'cedar-exception-memo'
export const SUPPLIERS = [
  ['Alder Standard', 18400, 28],
  ['Moss Workshop', 19750, 12],
  ['Oak Local', 22100, 8],
] as const

export function createHostData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'CEDAR / Supplier review', s: 'title' } },
    1: { 0: { v: 'Library workshop fit-out · 14 May 2027 · fictional USD quotes', s: 'muted' } },
    3: { 0: { v: 'Supplier', s: 'header' }, 1: { v: 'Quote / USD', s: 'header' }, 2: { v: 'Days', s: 'header' } },
    8: { 0: { v: 'Lowest quote', s: 'label' }, 1: { f: '=MIN(B5:B7)', s: 'money' } },
    9: { 0: { v: 'Selected / Moss', s: 'header' }, 1: { f: '=B6', s: 'money' } },
    10: { 0: { v: 'Premium / USD', s: 'label' }, 1: { f: '=B10-B9', s: 'premium' } },
    11: { 0: { v: 'Premium / %', s: 'label' }, 1: { f: '=B11/B9', s: 'percent' } },
    13: { 0: { v: 'Delivery limit / days', s: 'label' }, 1: { v: 16 } },
    14: { 0: { v: 'Selected lead time', s: 'label' }, 1: { f: '=C6' } },
    15: { 0: { v: 'Days of contingency', s: 'header' }, 1: { f: '=B14-B15' } },
    18: { 0: { v: 'WHY PAY MORE?', s: 'title' } },
    20: { 0: { v: 'Alder misses the 16-day limit.', s: 'muted' } },
    21: { 0: { v: 'Moss leaves four days for inspection.', s: 'muted' } },
    22: { 0: { v: 'Oak is faster, but costs $2,350 more.', s: 'muted' } },
    25: { 0: { v: 'Edit the native memo beside the quotes.', s: 'muted' } },
    26: { 0: { v: 'Quoted narrative is not formula-linked.', s: 'muted' } },
  }
  SUPPLIERS.forEach(([name, quote, days], i) => {
    cellData[i + 4] = { 0: { v: name, s: i === 1 ? 'header' : 'label' }, 1: { v: quote, s: 'money' }, 2: { v: days } }
  })
  return {
    id: HOST_ID,
    name: 'Cedar / Procurement exception',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 20, bl: 1, cl: { rgb: '#244A3D' } },
      header: { bg: { rgb: '#E7F0E6' }, bl: 1, cl: { rgb: '#244A3D' } },
      label: { cl: { rgb: '#34433C' } },
      muted: { cl: { rgb: '#6B7169' }, fs: 11 },
      money: { n: { pattern: '"$"#,##0' }, cl: { rgb: '#315D4D' } },
      premium: { bg: { rgb: '#FAEAD8' }, n: { pattern: '"$"#,##0' }, cl: { rgb: '#8A4F2A' }, bl: 1 },
      percent: { n: { pattern: '0.0%' }, cl: { rgb: '#8A4F2A' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Supplier quotes',
        rowCount: 65,
        columnCount: 18,
        defaultRowHeight: 28,
        defaultColumnWidth: 90,
        cellData,
        columnData: { 0: { w: 220 }, 1: { w: 125 }, 2: { w: 80 } },
        mergeData: [
          { startRow: 0, endRow: 0, startColumn: 0, endColumn: 10 },
          { startRow: 1, endRow: 1, startColumn: 0, endColumn: 10 },
        ],
      },
    },
  }
}

export const MEMO = [
  ['Cedar Library / Procurement', 'kicker'],
  ['Protect opening day.', 'title'],
  ['Exception request · 14 May 2027 · Owner: Priya Shah', 'meta'],
  ['01 / The request', 'heading'],
  [
    'Choose Moss Workshop for the accessible workbenches. Its $19,750 quote is $1,350 above the lowest offer, but the promised 12-day delivery fits our 16-day limit.',
    'body',
  ],
  ['02 / Evidence and trade-off', 'heading'],
  [
    'Alder Standard quotes $18,400 with a 28-day lead time. Oak Local can deliver in eight days for $22,100. Moss leaves four days for delivery inspection without paying the further $2,350 rush premium.',
    'body',
  ],
  ['03 / Conditions before purchase', 'heading'],
  [
    'Confirm the accessible bench heights and written delivery date. Request a sample finish before payment. Keep the existing tables until the new installation passes inspection.',
    'body',
  ],
  ['04 / Approval is still pending', 'warning'],
  [
    'Finance reviews the premium; facilities signs off the dimensions. If the delivery promise changes, reopen the supplier decision instead of silently accepting the delay.',
    'body',
  ],
  [
    'Scope: 24 workbenches, delivery and installation. Tax and electrical work excluded. Original fictional case; quote figures in this memo do not auto-update from the sheet.',
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
      paragraphId: `cedar-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `cedar-section-${index}` } : {}),
        spaceAbove: { v: heading ? 14 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 8 },
        lineSpacing: 1.15,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 30 : heading ? 16 : kind === 'meta' || kind === 'kicker' ? 11 : 13,
          bl: kind === 'title' || heading ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#9C572F'
                : kind === 'meta'
                  ? '#72766E'
                  : heading || kind === 'title' || kind === 'kicker'
                    ? '#315D4D'
                    : '#34433C',
          },
        },
      },
    }
  })
  const dataStream = MEMO.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: CHILD_ID,
    title: 'Cedar / Procurement exception memo',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 700, height: 1000 },
      marginTop: 28,
      marginBottom: 28,
      marginLeft: 34,
      marginRight: 34,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'cedar-memo-section' }],
    },
  }
}
