import type { IDocumentData, IWorkbookData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType } from '@univerjs/core'

export const HOST_ID = 'juniper-repair-capacity'
export const CHILD_ID = 'juniper-capacity-assumptions'
export const SHEET_ID = 'weekly-capacity'
export const TEAMS = [
  ['Mending', 6, 3, 2, 29],
  ['Electronics', 4, 3, 1, 14],
  ['Bicycles', 5, 4, 1, 18],
  ['Woodwork', 3, 3, 1, 6],
  ['Small appliances', 4, 3, 1, 10],
] as const

export function createChildData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([text, kind], index) => {
    offset += text.length + 1
    const heading = kind === 'heading' || kind === 'warning'
    return {
      startIndex: offset - 1,
      paragraphId: `juniper-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `juniper-section-${index}` } : {}),
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
                ? '#9E5845'
                : kind === 'meta'
                  ? '#777286'
                  : heading || kind === 'title' || kind === 'kicker'
                    ? '#50466B'
                    : '#393649',
          },
        },
      },
    }
  })
  const dataStream = MEMO.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: CHILD_ID,
    title: 'Juniper / Capacity assumptions',
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
      customBlocks: [],
      customRanges: [],
      customDecorations: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'juniper-memo-section' }],
    },
  }
}

export function createHostData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'JUNIPER / Repair capacity', s: 'title' } },
    1: { 0: { v: 'Neighbourhood repair weekend · 28 May 2027 · original fictional plan', s: 'muted' } },
    3: Object.fromEntries(
      ['Workshop', 'Volunteers', 'Hours each', 'Slots / hour', 'Capacity', 'Booked', 'Available'].map((v, i) => [
        i,
        { v, s: 'header' },
      ]),
    ),
    10: {
      0: { v: 'All workshops', s: 'header' },
      4: { f: '=SUM(E5:E9)', s: 'total' },
      5: { f: '=SUM(F5:F9)', s: 'total' },
      6: { f: '=E11-F11', s: 'total' },
    },
    13: { 0: { v: 'Open slots do not solve every queue.', s: 'title' } },
    15: { 0: { f: '="Electronics available slots: "&G6&". Skills are not interchangeable."', s: 'muted' } },
    17: { 0: { v: 'Open the native Assumptions tab before changing the staffing plan.', s: 'muted' } },
    18: { 0: { v: 'Readiness tracks unresolved checks. Neither tab is an approval system.', s: 'muted' } },
  }
  TEAMS.forEach(([label, volunteers, hours, rate, booked], i) => {
    const row = i + 4
    cellData[row] = {
      0: { v: label, s: i % 2 ? 'stripe' : 'body' },
      1: { v: volunteers },
      2: { v: hours },
      3: { v: rate },
      4: { f: `=B${row + 1}*C${row + 1}*D${row + 1}`, s: 'capacity' },
      5: { v: booked },
      6: { f: `=E${row + 1}-F${row + 1}`, s: i === 1 ? 'shortage' : 'capacity' },
    }
  })
  return {
    id: HOST_ID,
    name: 'Juniper / Repair weekend',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-rc.0',
    sheetOrder: [SHEET_ID, 'readiness'],
    styles: {
      title: { fs: 21, bl: 1, cl: { rgb: '#453A65' } },
      header: { bg: { rgb: '#EAE5F4' }, bl: 1, cl: { rgb: '#453A65' } },
      body: { cl: { rgb: '#393649' } },
      stripe: { bg: { rgb: '#F7F4FB' }, cl: { rgb: '#393649' } },
      muted: { cl: { rgb: '#777286' }, fs: 11 },
      total: { bg: { rgb: '#EEEAF7' }, bl: 1, cl: { rgb: '#50466B' } },
      capacity: { cl: { rgb: '#43666C' } },
      shortage: { bg: { rgb: '#F9E4DA' }, cl: { rgb: '#984C35' }, bl: 1 },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Weekly capacity',
        rowCount: 50,
        columnCount: 14,
        defaultRowHeight: 30,
        defaultColumnWidth: 110,
        columnData: { 0: { w: 200 } },
        cellData,
        mergeData: [0, 1, 13, 15, 17, 18].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 6 })),
      },
      readiness: {
        id: 'readiness',
        name: 'Readiness',
        rowCount: 40,
        columnCount: 10,
        defaultRowHeight: 34,
        defaultColumnWidth: 170,
        columnData: { 0: { w: 240 }, 1: { w: 160 }, 2: { w: 180 }, 3: { w: 420 } },
        cellData: {
          0: { 0: { v: 'JUNIPER / Before bookings open', s: 'title' } },
          2: {
            0: { v: 'Check', s: 'header' },
            1: { v: 'Owner', s: 'header' },
            2: { v: 'State', s: 'header' },
            3: { v: 'Evidence needed', s: 'header' },
          },
          3: {
            0: { v: 'Electronics queue' },
            1: { v: 'Omar' },
            2: { f: '= "Available slots: "&\'Weekly capacity\'!G6', s: 'shortage' },
            3: { v: 'Confirm another trained volunteer or contact two bookings.' },
          },
          4: {
            0: { v: 'Safety briefing' },
            1: { v: 'Avery' },
            2: { v: 'Scheduled' },
            3: { v: 'Attendance before any mains-powered repair.' },
          },
          5: {
            0: { v: 'Spare parts' },
            1: { v: 'Nina' },
            2: { v: 'Awaiting inventory' },
            3: { v: 'Do not promise repair completion without the required part.' },
          },
          6: {
            0: { v: 'Access support' },
            1: { v: 'Lee' },
            2: { v: 'Two requests noted' },
            3: { v: 'Confirm quiet waiting space and step-free workbench access.' },
          },
        },
        mergeData: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 3 }],
      },
    },
  }
}

export const MEMO = [
  ['Juniper / Neighbourhood repair weekend', 'kicker'],
  ['Capacity is not a promise.', 'title'],
  ['Assumptions register · 28 May 2027 · Coordinator: Avery Reed', 'meta'],
  ['01 / What a slot means', 'heading'],
  [
    'A slot is one initial assessment, not a guaranteed repair. The current plan offers 89 assessments for 77 bookings. Parts, safety and complexity can change what is achievable.',
    'body',
  ],
  ['02 / Skilled time cannot move freely', 'heading'],
  [
    'Mending can assess two items per volunteer-hour. The other workshops use one. Electronics has 14 bookings for 12 planned slots; spare mending capacity cannot replace electrical training.',
    'body',
  ],
  ['03 / Read the columns consistently', 'heading'],
  [
    'Hours each means usable repair time after the briefing and breaks. Capacity multiplies volunteers, hours and assessment rate. Available subtracts bookings; a negative value is a queue problem, not a negative appointment.',
    'body',
  ],
  ['04 / Before increasing capacity', 'warning'],
  [
    'Confirm a trained volunteer, tools and bench space. Otherwise contact the affected bookings. Readiness records the safety, spare-parts and access checks that still need an owner response.',
    'body',
  ],
  ['05 / Keep the narrative honest', 'heading'],
  [
    'This document is independently editable. Changing staffing in Weekly capacity recalculates the sheet but does not rewrite these assumptions. Update the explanation deliberately when the plan changes.',
    'body',
  ],
  [
    'Scope: one fictional weekend; no booking backend, approval workflow or live roster. Reload restores authored data. These figures are not Formula CustomRange bindings.',
    'meta',
  ],
] as const
