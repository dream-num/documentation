import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })
export function createWorkbookData(): Partial<IWorkbookData> {
  const visibility: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Visibility changes the aggregation, not the source') },
    1: { 0: text('Filter Region to North; then hide row 5 using its native row menu.') },
    3: { 0: text('Dispatch'), 1: text('Region'), 2: text('Units') },
    12: { 4: text('Calculation'), 5: text('Result') },
    14: { 0: text('9 includes manually hidden rows.') },
    16: { 0: text('109 excludes manually hidden rows.') },
  }
  const deliveries: (string | number)[][] = [
    ['Print proofs', 'North', 12],
    ['Display stands', 'South', 25],
    ['Replacement labels', 'North', 0],
    ['Studio packs', 'South', 18],
    ['Return adjustment', 'North', -3],
    ['Window graphics', 'North', 40],
  ]
  deliveries.forEach((row, r) => {
    visibility[r + 4] = Object.fromEntries(row.map((v, c) => [c, typeof v === 'string' ? text(v) : { v }]))
  })
  const comparisons = [
    ['SUM · all source rows', '=SUM(C5:C10)'],
    ['SUBTOTAL 9 · include hidden', '=SUBTOTAL(9,C5:C10)'],
    ['SUBTOTAL 109 · skip hidden', '=SUBTOTAL(109,C5:C10)'],
    ['AGGREGATE 0 · include hidden', '=AGGREGATE(9,0,C5:C10)'],
    ['AGGREGATE 1 · skip hidden', '=AGGREGATE(9,1,C5:C10)'],
    ['AGGREGATE 4 · include hidden', '=AGGREGATE(9,4,C5:C10)'],
    ['AGGREGATE 5 · skip hidden', '=AGGREGATE(9,5,C5:C10)'],
  ]
  comparisons.forEach(([label, f], r) => {
    visibility[r + 13] ??= {}
    visibility[r + 13][4] = text(label)
    visibility[r + 13][5] = { f }
  })
  const errors: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Errors, hidden rows and nested totals') },
    1: { 0: text('Hide row 5 to compare options 2/3 and 6/7. Errors below are intentional.') },
    3: {
      0: text('Reading'),
      1: text('Value'),
    },
    13: {
      3: text('Option'),
      4: text('Skip hidden'),
      5: text('Skip errors'),
      6: text('Skip nested'),
      7: text('SUM result'),
    },
    4: { 0: text('Large batch'), 1: { v: 20 } },
    5: { 0: text('Small batch'), 1: { v: 8 } },
    6: { 0: text('Awaiting measurement'), 1: { f: '=NA()' } },
    7: { 0: text('Zero quantity'), 1: { v: 0 } },
    8: { 0: text('Missing sample'), 1: {} },
    9: { 0: text('Operator note'), 1: text('pending') },
    10: { 0: text('Invalid ratio'), 1: { f: '=1/0' } },
    11: { 0: text('Nested subtotal'), 1: { f: '=SUBTOTAL(9,B5:B6)' } },
    23: { 3: text('Second largest · option 6'), 7: { f: '=AGGREGATE(14,6,B5:B12,2)' } },
    16: { 0: text('2: skip errors and nested totals.') },
    18: { 0: text('6: skip errors, keep nested totals.') },
  }
  for (let option = 0; option <= 7; option++) {
    errors[option + 14] ??= {}
    Object.assign(errors[option + 14], {
      3: { v: option },
      4: text(option % 2 ? 'Yes' : 'No'),
      5: text([2, 3, 6, 7].includes(option) ? 'Yes' : 'No'),
      6: text(option < 4 ? 'Yes' : 'No'),
      7: { f: `=AGGREGATE(9,${option},B5:B12)` },
    })
  }
  for (const data of [visibility, errors]) {
    for (const cell of Object.values(data[3])) cell.s = { bl: 1, bg: { rgb: '#CCFBF1' } }
    data[0][0].s = { fs: 19, bl: 1, cl: { rgb: '#0F766E' } }
  }
  return {
    id: 'aggregate-subtotal-workbook',
    name: 'Aggregation choices',
    locale: LocaleType.EN_US,
    sheetOrder: ['visibility', 'errors'],
    sheets: {
      visibility: {
        id: 'visibility',
        name: 'Visibility',
        cellData: visibility,
        rowCount: 25,
        columnCount: 8,
        defaultRowHeight: 32,
        defaultColumnWidth: 110,
        columnData: { 0: { w: 205 }, 1: { w: 100 }, 2: { w: 95 }, 3: { w: 25 }, 4: { w: 275 }, 5: { w: 120 } },
      },
      errors: {
        id: 'errors',
        name: 'Error options',
        cellData: errors,
        rowCount: 25,
        columnCount: 9,
        defaultRowHeight: 32,
        defaultColumnWidth: 110,
        columnData: {
          0: { w: 205 },
          1: { w: 100 },
          2: { w: 25 },
          3: { w: 100 },
          4: { w: 115 },
          5: { w: 115 },
          6: { w: 115 },
          7: { w: 130 },
        },
      },
    },
  }
}
