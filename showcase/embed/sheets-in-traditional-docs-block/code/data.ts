import type { IDocumentData, IWorkbookData } from '@univerjs/core'
import { BooleanNumber, CellValueType, DocumentFlavor, LocaleType, NamedStyleType } from '@univerjs/core'

export const HOST_ID = 'estuary-grant-memorandum'
export const CHILD_ID = 'estuary-archive-costs'
export const SHEET_ID = 'costs'
export const BLOCK_MARKER = '03 / Review gates and responsibilities'
export const BRIEF = [
  ['ESTUARY / Community archive programme', 'kicker'],
  ['A record worth keeping.', 'title'],
  ['Grant memorandum E-28-05 / 30 May 2028 / Draft for review', 'meta'],
  ['01 / Purpose and proposed scope', 'heading'],
  [
    'This fictional grant proposal supports a small community archive: eight recording days, eighteen scanning days and a cataloguing schedule for donated material. The estimate is a planning instrument, not a supplier quote or an award notice. No material has been collected and no participant has been recruited.',
    'body',
  ],
  [
    'The pilot would document how recordings, scanned items and descriptive records move through review. It does not promise publication of every item. Contributors would need a separate, appropriate rights process before any real release; this demo neither collects consent nor makes a legal determination.',
    'body',
  ],
  [
    'The budget is deliberately separated from the narrative decision. Reviewers can compare scope assumptions in the embedded workbook while the memorandum keeps its purpose, exclusions and decision boundaries in a conventional paginated form.',
    'body',
  ],
  ['02 / Cost schedule and funding ceiling', 'heading'],
  [
    'Schedule A uses six work packages, indicative daily rates and a 7.5% reserve. Edit the sand-colored Days cells to compare scope. The Phasing worksheet allocates the total across preparation, capture and handover; those allocations do not authorize payment.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKER, 'heading'],
  [
    'GATE 1 / Preparation. Anika reviews the item-selection criteria and the proposed descriptive fields. Keep a record of exclusions and unresolved rights questions before confirming the capture schedule.',
    'body',
  ],
  [
    'GATE 2 / Capture. Mateo checks sample recordings and scans against the agreed description, not merely a file count. A larger budget does not establish that the material meets the review criteria.',
    'body',
  ],
  [
    'GATE 3 / Handover. Elise checks the catalog manifest, storage inventory and unresolved-item register. Any real release decision would require a separate review outside this demonstration.',
    'body',
  ],
  ['04 / Limitations and decision', 'heading'],
  [
    'Rates exclude tax, equipment purchases, travel and ongoing hosting. The reserve is an illustrative planning choice, not an accounting rule. Dates, roles and quantities are original fictional data. No payments, legal approvals, preservation guarantees or external notifications are produced.',
    'body',
  ],
  ['Decision: draft only; no funds released.', 'warning'],
  ['Appendix A / Reading this memorandum', 'heading'],
  [
    'The report is a traditional A4 document with deliberate chapter breaks, not an infinite modern page. The native Sheets block remains anchored in its body. The cost model and the written decision have independent state; a reviewer must deliberately reconcile them. Reloading the local demo discards edits.',
    'body',
  ],
] as const

export function createHostData(): IDocumentData {
  let offset = 0
  const paragraphs = BRIEF.map(([text, kind], index) => {
    offset += text.length + 1
    const heading = kind === 'heading' || kind === 'warning'
    return {
      startIndex: offset - 1,
      paragraphId: `estuary-p-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(text.startsWith('02 /') || text.startsWith('03 /') ? { pageBreakBefore: BooleanNumber.TRUE } : {}),
        ...(heading ? { headingId: `estuary-section-${index}` } : {}),
        spaceAbove: { v: heading ? 16 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 9 },
        lineSpacing: 1.2,
        textStyle: {
          ff: heading || kind === 'kicker' || kind === 'meta' ? 'Arial' : 'Georgia',
          fs: kind === 'title' ? 30 : heading ? 16 : kind === 'meta' || kind === 'kicker' ? 10 : 12,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#956729'
                : heading || kind === 'title' || kind === 'kicker'
                  ? '#245F63'
                  : kind === 'meta'
                    ? '#74808D'
                    : '#3F4E5B',
          },
        },
      },
    }
  })
  const dataStream = BRIEF.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Estuary / Archive grant memorandum',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 72,
      marginBottom: 72,
      marginLeft: 72,
      marginRight: 72,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      customBlocks: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'estuary-brief-section' }],
    },
    drawings: {},
    drawingsOrder: [],
  }
}

const EFFORT = [
  ['Recording sessions', 8, 360, 'Eight supervised recording days'],
  ['Cataloguing', 14, 300, 'Descriptions and item relationships'],
  ['Scanning', 18, 220, 'Selected community-donated material'],
  ['Rights review', 5, 420, 'Resolve questions before any release'],
  ['Community review', 4, 280, 'Review samples, not just counts'],
  ['Preservation handover', 6, 260, 'Inventory and unresolved-item register'],
] as const

export function createChildData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'ESTUARY / Schedule A', s: 'title' } },
    1: { 0: { v: 'Original planning model · USD · effort in person-days', s: 'muted' } },
    3: {
      0: { v: 'Workstream', s: 'header' },
      1: { v: 'Days', s: 'header' },
      2: { v: '$ / day', s: 'header' },
      3: { v: 'Estimate', s: 'header' },
      4: { v: 'Scope boundary', s: 'header' },
    },
    11: { 0: { v: 'Delivery subtotal', s: 'header' }, 3: { f: '=SUM(D5:D10)', s: 'money' } },
    12: { 0: { v: 'Reserve / 7.5%', s: 'body' }, 3: { f: '=ROUND(D12*7.5%,2)', s: 'money' } },
    13: { 0: { v: 'Planning envelope', s: 'header' }, 3: { f: '=ROUND(D12+D13,2)', s: 'total' } },
    15: { 0: { v: 'Funding ceiling', s: 'body' }, 3: { v: 20000, s: 'money' } },
    16: { 0: { v: 'Unallocated headroom', s: 'header' }, 3: { f: '=D16-D14', s: 'total' } },
    19: { 0: { v: 'Change effort in column B. Reserve and phasing update; the draft decision does not.', s: 'muted' } },
  }
  EFFORT.forEach(([name, days, rate, scope], index) => {
    const row = index + 4
    cellData[row] = {
      0: { v: name, s: index % 2 ? 'stripe' : 'body' },
      1: { v: days, t: CellValueType.NUMBER, s: 'input' },
      2: { v: rate, s: 'money' },
      3: { f: `=B${row + 1}*C${row + 1}`, s: 'money' },
      4: { v: scope, s: 'muted' },
    }
  })
  return {
    id: CHILD_ID,
    name: 'Estuary / Archive cost schedule',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-rc.0',
    sheetOrder: [SHEET_ID, 'phasing'],
    styles: {
      title: { fs: 20, bl: 1, cl: { rgb: '#245F63' } },
      header: { bg: { rgb: '#DCEDEA' }, cl: { rgb: '#245F63' }, bl: 1 },
      body: { cl: { rgb: '#3F4E5B' } },
      stripe: { bg: { rgb: '#F0F5F8' } },
      muted: { fs: 10, cl: { rgb: '#697887' } },
      input: { bg: { rgb: '#F4E3C6' }, cl: { rgb: '#805F26' }, n: { pattern: '0' } },
      money: { n: { pattern: '#,##0.00' }, cl: { rgb: '#3F4E5B' } },
      total: { n: { pattern: '#,##0.00' }, bg: { rgb: '#E9E2F1' }, cl: { rgb: '#655579' }, bl: 1 },
      percent: { n: { pattern: '0%' }, bg: { rgb: '#F4E3C6' }, cl: { rgb: '#805F26' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Costs',
        rowCount: 22,
        columnCount: 8,
        defaultRowHeight: 27,
        defaultColumnWidth: 90,
        columnData: { 0: { w: 205 }, 1: { w: 70 }, 2: { w: 80 }, 3: { w: 110 }, 4: { w: 300 } },
        cellData,
        mergeData: [0, 1, 19].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
      phasing: {
        id: 'phasing',
        name: 'Phasing',
        rowCount: 22,
        columnCount: 8,
        defaultRowHeight: 32,
        defaultColumnWidth: 95,
        columnData: { 0: { w: 220 }, 1: { w: 90 }, 2: { w: 125 }, 3: { w: 325 } },
        cellData: {
          0: { 0: { v: 'ESTUARY / Phased funding', s: 'title' } },
          2: {
            0: { v: 'Delivery gate', s: 'header' },
            1: { v: 'Share', s: 'header' },
            2: { v: 'Envelope', s: 'header' },
            3: { v: 'Evidence before release', s: 'header' },
          },
          3: {
            0: { v: 'Prepare / Anika', s: 'body' },
            1: { v: 0.25, s: 'percent' },
            2: { f: '=ROUND(Costs!D14*B4,2)', s: 'money' },
            3: { v: 'Item scope and descriptive fields', s: 'muted' },
          },
          4: {
            0: { v: 'Capture / Mateo', s: 'stripe' },
            1: { v: 0.5, s: 'percent' },
            2: { f: '=ROUND(Costs!D14*B5,2)', s: 'money' },
            3: { v: 'Sample recordings and scan review', s: 'muted' },
          },
          5: {
            0: { v: 'Handover / Elise', s: 'body' },
            1: { f: '=1-SUM(B4:B5)', s: 'percent' },
            2: { f: '=ROUND(Costs!D14-SUM(C4:C5),2)', s: 'money' },
            3: { v: 'Catalog manifest and unresolved items', s: 'muted' },
          },
          7: {
            0: { v: 'Allocated', s: 'header' },
            1: { f: '=SUM(B4:B6)', s: 'percent' },
            2: { f: '=SUM(C4:C6)', s: 'total' },
          },
          9: { 0: { v: 'Unallocated envelope', s: 'header' }, 2: { f: '=Costs!D14-C8', s: 'total' } },
          12: {
            0: { v: 'Edit the first two shares; handover balances the cents. No release is approved.', s: 'muted' },
          },
        },
        mergeData: [0, 12].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 3 })),
      },
    },
  }
}
