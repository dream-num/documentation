import type { IDocumentData, IWorkbookData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType } from '@univerjs/core'

export const HOST_ID = 'northstar-investment-brief'
export const CHILD_ID = 'northstar-pilot-budget'
export const SHEET_ID = 'investment'
export const BLOCK_MARKER = '03 / Decision gates'
export const BRIEF = [
  ['NORTHSTAR / Community repair access', 'kicker'],
  ['A smaller pilot. A clearer decision.', 'title'],
  ['Investment brief · 12 April 2027 · Owner: Amira Chen · Draft for review', 'meta'],
  ['01 / Why this pilot', 'heading'],
  [
    'Test a booking service for three neighborhood repair hubs. Residents need a clear appointment window; coordinators need fewer manual calls. Start with assisted booking, not a city-wide launch.',
    'body',
  ],
  ['02 / Investment assumptions', 'heading'],
  [
    'The model below separates delivery effort, a 10% reserve and the funding ceiling. Edit the cream quantity cells to test scope changes. Expand the workbook to open Phasing and compare three delivery gates.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKER, 'heading'],
  [
    'DISCOVER / Amira checks demand with 12 residents and all three hub coordinators. Do not infer demand from page visits alone.',
    'body',
  ],
  [
    'PILOT / Noel reviews keyboard access, assisted booking and a cancellation rehearsal before inviting residents.',
    'body',
  ],
  [
    'DECIDE / Priya compares completed appointments, coordinator effort and remaining funds after four weeks. The funding ceiling is a constraint, not permission to spend.',
    'body',
  ],
  ['04 / Explicit exclusions', 'heading'],
  [
    'No payment collection, live availability feed, identity verification or automated approval is included. Rates and allocations are fictional planning inputs, not supplier quotes.',
    'body',
  ],
  ['Decision remains pending.', 'warning'],
  [
    'Changing the embedded workbook does not change this draft decision. Update the narrative deliberately after reviewing the evidence. Reloading this local demo loses unsaved edits.',
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
      paragraphId: `northstar-p-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `northstar-section-${index}` } : {}),
        spaceAbove: { v: heading ? 16 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 9 },
        lineSpacing: 1.2,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 32 : heading ? 18 : kind === 'meta' || kind === 'kicker' ? 11 : 14,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#956729'
                : heading || kind === 'title' || kind === 'kicker'
                  ? '#254F77'
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
    title: 'Northstar / Project investment brief',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 960, height: 1000 },
      marginTop: 32,
      marginBottom: 32,
      marginLeft: 64,
      marginRight: 64,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      customBlocks: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'northstar-brief-section' }],
    },
    drawings: {},
    drawingsOrder: [],
  }
}

const EFFORT = [
  ['Resident research', 8, 450, '12 resident interviews / 3 hub visits'],
  ['Service prototype', 12, 520, 'Assisted booking and cancellation flow'],
  ['Pilot implementation', 30, 600, 'One service / three neighborhood hubs'],
  ['Accessibility review', 6, 480, 'Keyboard, screen reader and assistance'],
  ['Pilot operations', 8, 400, 'Four-week supervised pilot'],
  ['Coordinator training', 4, 350, 'Practice sessions and handover notes'],
] as const

export function createChildData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'NORTHSTAR / Pilot investment', s: 'title' } },
    1: { 0: { v: 'Original planning model · USD · effort in person-days', s: 'muted' } },
    3: {
      0: { v: 'Workstream', s: 'header' },
      1: { v: 'Days', s: 'header' },
      2: { v: '$ / day', s: 'header' },
      3: { v: 'Estimate', s: 'header' },
      4: { v: 'Scope boundary', s: 'header' },
    },
    11: { 0: { v: 'Delivery subtotal', s: 'header' }, 3: { f: '=SUM(D5:D10)', s: 'money' } },
    12: { 0: { v: 'Reserve / 10%', s: 'body' }, 3: { f: '=D12*10%', s: 'money' } },
    13: { 0: { v: 'Planning envelope', s: 'header' }, 3: { f: '=D12+D13', s: 'total' } },
    15: { 0: { v: 'Funding ceiling', s: 'body' }, 3: { v: 45000, s: 'money' } },
    16: { 0: { v: 'Unallocated headroom', s: 'header' }, 3: { f: '=D16-D14', s: 'total' } },
    19: { 0: { v: 'Change effort in column B. Reserve and phasing update; the draft decision does not.', s: 'muted' } },
  }
  EFFORT.forEach(([name, days, rate, scope], index) => {
    const row = index + 4
    cellData[row] = {
      0: { v: name, s: index % 2 ? 'stripe' : 'body' },
      1: { v: days, s: 'input' },
      2: { v: rate, s: 'money' },
      3: { f: `=B${row + 1}*C${row + 1}`, s: 'money' },
      4: { v: scope, s: 'muted' },
    }
  })
  return {
    id: CHILD_ID,
    name: 'Northstar / Pilot investment',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-rc.0',
    sheetOrder: [SHEET_ID, 'phasing'],
    styles: {
      title: { fs: 20, bl: 1, cl: { rgb: '#254F77' } },
      header: { bg: { rgb: '#DCE9F2' }, cl: { rgb: '#254F77' }, bl: 1 },
      body: { cl: { rgb: '#3F4E5B' } },
      stripe: { bg: { rgb: '#F0F5F8' } },
      muted: { fs: 10, cl: { rgb: '#697887' } },
      input: { bg: { rgb: '#F8EDCC' }, cl: { rgb: '#805F26' }, n: { pattern: '0' } },
      money: { n: { pattern: '#,##0.00' }, cl: { rgb: '#3F4E5B' } },
      total: { n: { pattern: '#,##0.00' }, bg: { rgb: '#DDF0EC' }, cl: { rgb: '#326D66' }, bl: 1 },
      percent: { n: { pattern: '0%' }, bg: { rgb: '#F8EDCC' }, cl: { rgb: '#805F26' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Investment',
        rowCount: 40,
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
        rowCount: 30,
        columnCount: 8,
        defaultRowHeight: 32,
        defaultColumnWidth: 95,
        columnData: { 0: { w: 220 }, 1: { w: 90 }, 2: { w: 125 }, 3: { w: 325 } },
        cellData: {
          0: { 0: { v: 'NORTHSTAR / Release funds by evidence', s: 'title' } },
          2: {
            0: { v: 'Delivery gate', s: 'header' },
            1: { v: 'Share', s: 'header' },
            2: { v: 'Envelope', s: 'header' },
            3: { v: 'Evidence before release', s: 'header' },
          },
          3: {
            0: { v: 'Discover / Amira', s: 'body' },
            1: { v: 0.2, s: 'percent' },
            2: { f: '=Investment!D14*B4', s: 'money' },
            3: { v: 'Demand interviews and coordinator agreement', s: 'muted' },
          },
          4: {
            0: { v: 'Build and rehearse / Noel', s: 'stripe' },
            1: { v: 0.55, s: 'percent' },
            2: { f: '=Investment!D14*B5', s: 'money' },
            3: { v: 'Assisted booking and accessible cancellation', s: 'muted' },
          },
          5: {
            0: { v: 'Pilot and decide / Priya', s: 'body' },
            1: { v: 0.25, s: 'percent' },
            2: { f: '=Investment!D14*B6', s: 'money' },
            3: { v: 'Four weeks of completed appointment evidence', s: 'muted' },
          },
          7: {
            0: { v: 'Allocated', s: 'header' },
            1: { f: '=SUM(B4:B6)', s: 'percent' },
            2: { f: '=SUM(C4:C6)', s: 'total' },
          },
          9: { 0: { v: 'Unallocated envelope', s: 'header' }, 2: { f: '=Investment!D14-C8', s: 'total' } },
          12: { 0: { v: 'Shares are editable assumptions. A zero balance does not approve a release.', s: 'muted' } },
        },
        mergeData: [0, 12].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 3 })),
      },
    },
  }
}
