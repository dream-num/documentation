import type { ICellData, IWorkbookData, IWorksheetData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export const DELIVERIES = [
  ['Harbor loop', 'North', 12],
  ['Orchard schools', 'West', 7],
  ['Museum shuttle', 'North', 0],
  ['River clinic', 'South', 18],
  ['Library drop', 'West', 5],
  ['Market return', 'North', 9],
  ['Canal parcels', 'South', 3],
  ['Hilltop pantry', 'West', 14],
  ['Station lockers', 'North', 6],
] as const

function sheet(
  id: string,
  name: string,
  cellData: IWorksheetData['cellData'],
  widths: number[],
  mergeData: IWorksheetData['mergeData'] = [],
): Partial<IWorksheetData> {
  return {
    id,
    name,
    cellData,
    rowCount: 32,
    columnCount: 12,
    defaultRowHeight: 30,
    columnData: Object.fromEntries(widths.map((w, i) => [i, { w }])),
    mergeData,
  }
}

export function createWorkbookData(): Partial<IWorkbookData> {
  const range: Record<number, Record<number, ICellData>> = {
    0: {
      0: { v: 'Route', s: 'header' },
      1: { v: 'Loads', s: 'header' },
      3: { f: '=A1:B10', s: 'anchor' },
      7: { v: 'One formula. Twenty cells.', s: 'title' },
    },
    2: { 7: { v: '=A1:B10', s: 'formula' } },
    4: { 7: { v: 'Edit B3: E3 follows the source.' } },
    6: { 7: { v: 'Select D1 to edit the single formula.' } },
    8: { 7: { v: 'D1:E10 is calculated, not copied.' } },
    12: { 0: { v: 'SOURCE / editable inputs', s: 'header' }, 3: { v: 'SPILL / one anchor', s: 'header' } },
  }
  DELIVERIES.forEach(([name, , loads], index) => {
    const row = (range[index + 1] ??= {})
    row[0] = { v: name }
    row[1] = { v: loads, s: 'input' }
  })
  for (let row = 0; row < 10; row++) {
    range[row] ??= {}
    for (const col of [3, 4]) range[row][col] ??= { s: 'spill' }
  }
  const functions: Record<number, Record<number, ICellData>> = {
    0: { 0: { v: 'Dynamic results / filter, sort, deduplicate', s: 'title' } },
    1: {
      4: { v: 'Region →', s: 'header' },
      5: { v: 'North', s: 'input' },
      8: { v: 'Try North, West, South or Missing' },
    },
    3: {},
    4: { 4: { f: '=FILTER(A5:C13,B5:B13=F2,"No matches")', s: 'anchor' }, 8: { f: '=SORT(A5:C13,3,-1)', s: 'anchor' } },
    15: { 0: { v: 'Edit the amber region: the filtered spill grows or shrinks.' } },
    16: { 4: { v: 'UNIQUE / region list', s: 'header' }, 8: { v: 'SEQUENCE / 3 × 3', s: 'header' } },
    17: { 4: { f: '=UNIQUE(B5:B13)', s: 'anchor' }, 8: { f: '=SEQUENCE(3,3,10,5)', s: 'anchor' } },
    22: { 4: { v: '=UNIQUE(B5:B13)', s: 'formula' }, 8: { v: '=SEQUENCE(3,3,10,5)', s: 'formula' } },
  }
  for (const start of [0, 4, 8])
    ['Route', 'Region', 'Loads'].forEach((v, index) => {
      functions[3][start + index] = { v, s: 'header' }
    })
  DELIVERIES.forEach((values, index) => {
    const row = (functions[index + 4] ??= {})
    values.forEach((v, col) => {
      row[col] = { v, s: col === 2 ? 'input' : undefined }
    })
  })
  const boundaries: Record<number, Record<number, ICellData>> = {
    0: { 0: { v: 'Spill boundaries / clear space matters', s: 'title' } },
    2: {
      0: { v: 'Clear destination', s: 'header' },
      4: { v: 'Blocked destination', s: 'header' },
      8: { v: 'No matching rows', s: 'header' },
    },
    3: {
      0: { f: '=SEQUENCE(4,2)', s: 'anchor' },
      4: { f: '=SEQUENCE(4,2)', s: 'anchor' },
      8: { f: '=FILTER(\'Filter and sort\'!A5:C13,\'Filter and sort\'!B5:B13="Missing","No matches")', s: 'anchor' },
    },
    4: { 5: { v: 'Occupied', s: 'blocked' } },
    9: {
      0: { v: 'One anchor fills A4:B7.' },
      4: { v: 'Clear F5 with native Delete.' },
      8: { v: 'The optional fallback stays readable.' },
    },
    11: { 0: { v: 'Dependent total / explicit range', s: 'header' } },
    12: { 0: { f: '=SUM(A4:B7)', s: 'anchor' } },
    14: { 0: { v: '=SUM(A4:B7)', s: 'formula' }, 4: { v: 'A blocked spill must not overwrite F5.' } },
    17: { 0: { v: 'Change A4 to =SEQUENCE(2,2): the sum follows the smaller spill.' } },
  }
  return {
    id: 'dynamic-array-formulas',
    name: 'Dynamic array formula gallery',
    locale: LocaleType.EN_US,
    sheetOrder: ['range-spill', 'functions', 'boundaries'],
    styles: {
      title: { bg: { rgb: '#152238' }, cl: { rgb: '#FFFFFF' }, bl: 1, fs: 16 },
      header: { bg: { rgb: '#DDEBF0' }, cl: { rgb: '#224E60' }, bl: 1 },
      input: { bg: { rgb: '#FFF1D6' }, cl: { rgb: '#7A511D' } },
      anchor: { bg: { rgb: '#D4EEE8' }, cl: { rgb: '#155D55' }, bl: 1 },
      spill: { bg: { rgb: '#F0F8F6' }, cl: { rgb: '#155D55' } },
      blocked: { bg: { rgb: '#FADEE3' }, cl: { rgb: '#9C3145' }, bl: 1 },
      formula: { ff: 'Courier New', cl: { rgb: '#655190' } },
    },
    sheets: {
      'range-spill': sheet(
        'range-spill',
        'Range spill',
        range,
        [185, 85, 28, 185, 85, 28, 28, 140, 110, 110, 110, 28],
        [0, 2, 4, 6, 8].map((row) => ({ startRow: row, endRow: row, startColumn: 7, endColumn: 10 })),
      ) as IWorksheetData,
      functions: sheet(
        'functions',
        'Filter and sort',
        functions,
        [180, 95, 80, 24, 180, 95, 80, 24, 180, 95, 80, 24],
        [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 10 }],
      ) as IWorksheetData,
      boundaries: sheet(
        'boundaries',
        'Spill boundaries',
        boundaries,
        [180, 90, 85, 24, 180, 95, 80, 24, 180, 95, 80, 24],
        [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 10 }],
      ) as IWorksheetData,
    },
  }
}
