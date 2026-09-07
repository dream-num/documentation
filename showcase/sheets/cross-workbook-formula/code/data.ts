import type { IWorkbookData, IWorksheetData, ICellData } from '@univerjs/presets'

// Original fictional theatre data. IDs, not display names or URLs, bind workbook references.
export const IDS = { fx: 'tern-fx', income: 'tern-income', costs: 'tern-costs', summary: 'tern-summary' }
export const NAMES = { fx: 'FX & Tax', income: 'Ticket Sales', costs: 'Travel Costs', summary: 'Tour Summary' }
export type Book = keyof typeof IDS
const input = { bg: { rgb: '#FEF3C7' }, n: { pattern: '0.00' } }
const total = { bg: { rgb: '#DCFCE7' }, bl: 1, n: { pattern: '0.00' } }
const heading = { bg: { rgb: '#0F766E' }, cl: { rgb: '#FFFFFF' }, bl: 1 }
const cell = (v: string | number, editable = false): ICellData => ({ v, ...(editable ? { s: input } : {}) })
const formula = (f: string): ICellData => ({ f, s: total })
const ref = (book: Book, range: string) => "'[" + IDS[book] + ']' + NAMES[book] + "'!" + range

function sheet(id: string, name: string, rows: Record<number, Record<number, ICellData>>): Partial<IWorksheetData> {
  return {
    id,
    name,
    rowCount: 36,
    columnCount: 12,
    defaultColumnWidth: 135,
    defaultRowHeight: 30,
    columnData: { 0: { w: 260 }, 1: { w: 130 }, 2: { w: 130 }, 3: { w: 145 } },
    cellData: rows,
  }
}

export function createFixtures(): Partial<IWorkbookData>[] {
  const books: Array<[Book, string, Partial<IWorksheetData>]> = [
    [
      'fx',
      'Tern · planning rates',
      sheet('main', NAMES.fx, {
        0: { 0: { v: 'TERN / PLANNING ASSUMPTIONS', s: heading } },
        2: { 0: cell('Assumption'), 1: cell('Value') },
        3: { 0: cell('Reporting FX multiplier'), 1: cell(1.25, true) },
        4: { 0: cell('Reserve fraction'), 1: cell(0.1, true) },
        6: { 0: cell('Fictional rates, not live financial data') },
      }),
    ],
    [
      'income',
      'Tern · ticket sales',
      sheet('main', NAMES.income, {
        0: { 0: { v: 'TERN / THREE PERFORMANCES', s: heading } },
        2: { 0: cell('Performance'), 1: cell('Tickets'), 2: cell('Unit price'), 3: cell('Revenue') },
        3: { 0: cell('North Hall'), 1: cell(120, true), 2: cell(12.5, true), 3: formula('=B4*C4') },
        4: { 0: cell('Harbor Studio'), 1: cell(80, true), 2: cell(15, true), 3: formula('=B5*C5') },
        5: { 0: cell('Accessible matinee'), 1: cell(0, true), 2: cell(40, true), 3: formula('=B6*C6') },
        7: { 0: cell('Total'), 1: formula('=SUM(B4:B6)'), 3: formula('=SUM(D4:D6)') },
        9: { 0: cell('Zero attendance is intentional') },
      }),
    ],
    [
      'costs',
      'Tern · travel expenses',
      sheet('main', NAMES.costs, {
        0: { 0: { v: 'TERN / TRAVEL EXPENSES', s: heading } },
        2: { 0: cell('Expense'), 1: cell('Amount') },
        3: { 0: cell('Electric van'), 1: cell(325.5, true) },
        4: { 0: cell('Lodging · Éloïse'), 1: cell(480, true) },
        5: { 0: cell('Refunded booking fee'), 1: cell(-25.5, true) },
        7: { 0: cell('Total costs'), 1: formula('=SUM(B4:B6)') },
        9: { 0: cell('Costs in reporting currency'), 1: formula('=B8*' + ref('fx', 'B4')) },
        11: { 0: cell('Negative values represent credits') },
      }),
    ],
    [
      'summary',
      'Tern · touring plan',
      sheet('main', NAMES.summary, {
        0: { 0: { v: 'TERN / TOURING PLAN', s: heading } },
        2: { 0: cell('Metric'), 1: cell('SDK result') },
        3: { 0: cell('Reference comparison'), 1: formula('=' + ref('income', 'D4')) },
        4: { 0: cell('All ticket revenue'), 1: formula('=SUM(' + ref('income', 'D4:D6') + ')') },
        5: { 0: cell('Total travel costs'), 1: formula('=' + ref('costs', 'B8')) },
        6: { 0: cell('Net before conversion'), 1: formula('=B5-B6') },
        7: { 0: cell('Converted net'), 1: formula('=B7*' + ref('fx', 'B4')) },
        8: { 0: cell('Reserve'), 1: formula('=B8*' + ref('fx', 'B5')) },
        9: { 0: cell('After reserve'), 1: formula('=B8-B9') },
        10: { 0: cell('Transitive: converted costs'), 1: formula('=' + ref('costs', 'B10')) },
        12: { 0: cell('Same workbook, other sheet'), 1: formula("='Local Notes'!B4") },
        14: { 0: cell('Edit yellow inputs in source workbooks') },
        15: { 0: cell('All calculations run locally in one Univer') },
      }),
    ],
  ]
  return books.map(([key, name, main]) => ({
    id: IDS[key],
    name,
    appVersion: '1.0.0-beta.2',
    sheetOrder: key === 'summary' ? ['main', 'notes'] : ['main'],
    sheets: {
      main,
      ...(key === 'summary'
        ? {
            notes: sheet('notes', 'Local Notes', {
              0: { 0: cell('Local reference control') },
              3: { 0: cell('Volunteer passes'), 1: cell(42, true) },
            }),
          }
        : {}),
    },
  }))
}

export const REFERENCES = {
  single: '=' + ref('income', 'D4'),
  range: '=SUM(' + ref('income', 'D4:D6') + ')',
  multiple: '=' + ref('income', 'D8') + '-' + ref('costs', 'B8'),
  local: "='Local Notes'!B4",
  'missing-workbook': "='[tern-not-loaded]Ticket Sales'!D4",
  'missing-sheet': "='[tern-income]Unknown Stage'!D4",
}
export const FIELDS: Array<{ id: string; book: Book; address: string; label: string }> = [
  { id: 'tickets', book: 'income', address: 'B4', label: 'North Hall tickets' },
  { id: 'price', book: 'income', address: 'C4', label: 'North Hall unit price' },
  { id: 'refund', book: 'costs', address: 'B6', label: 'Refunded booking fee' },
  { id: 'fx', book: 'fx', address: 'B4', label: 'Reporting FX multiplier' },
  { id: 'reserve', book: 'fx', address: 'B5', label: 'Reserve fraction' },
]
