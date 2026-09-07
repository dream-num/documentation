import type { IWorkbookData } from '@univerjs/core'

export type Region = 'north' | 'south'
export type Fixture = 'default' | 'empty' | 'boundary'
export const ITEMS = {
  north: [
    ['Air filters', 12, 18.75],
    ['Safety lamps', 7, 42.6],
    ['Tool servicing', 3, 125],
    ['Insulation rolls', 18, 26.4],
    ['First-aid kits', 4, 58.9],
    ['Label packs', 9, 6.25],
  ],
  south: [
    ['Tap repair kits', 8, 34.6],
    ['Shade fabric', 15, 22.8],
    ['Water testing', 5, 79.5],
    ['Pump inspection', 2, 210],
    ['Storage crates', 11, 17.35],
    ['Garden gloves', 24, 4.8],
  ],
} as const

export function createBudget(region: Region, fixture: Fixture): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: `${region === 'north' ? 'North · workshop' : 'South · garden'} maintenance`, s: 'title' } },
    1: { 0: { v: 'Planning week 2027-03-29 · illustrative USD' } },
    2: Object.fromEntries(['Line item', 'Units', 'Unit price', 'Budget'].map((v, i) => [i, { v, s: 'header' }])),
    13: { 0: { v: 'Regional total', s: 'header' }, 3: { f: '=SUM(D4:D9)', s: 'money' } },
  }
  if (fixture !== 'empty')
    ITEMS[region].forEach((row, index) => {
      cellData[index + 3] = Object.fromEntries(
        row.map((v, column) => [column, { v, ...(column === 2 ? { s: 'input' } : {}) }]),
      )
      if (fixture === 'boundary' && index < 2) cellData[index + 3][2].v = index === 0 ? 0 : 100000
      cellData[index + 3][3] = { f: `=B${index + 4}*C${index + 4}`, s: 'money' }
    })
  return {
    id: `regional-budget-${region}`,
    name: `${region} maintenance budget`,
    sheetOrder: ['budget'],
    resources: [{ name: 'SHEET_DEFINED_NAME_PLUGIN', data: '{}' }],
    styles: {
      title: { bg: { rgb: region === 'north' ? '#075985' : '#14532D' }, cl: { rgb: '#FFFFFF' }, bl: 1 },
      header: { bg: { rgb: '#DBEAFE' }, cl: { rgb: '#1E3A8A' }, bl: 1 },
      input: { n: { pattern: '$#,##0.00' }, cl: { rgb: '#2563EB' }, bg: { rgb: '#EFF6FF' } },
      money: { n: { pattern: '$#,##0.00' } },
    },
    sheets: {
      budget: {
        id: 'budget',
        name: 'Maintenance',
        rowCount: 24,
        columnCount: 5,
        defaultRowHeight: 26,
        columnData: { 0: { w: 190 }, 1: { w: 75 }, 2: { w: 110 }, 3: { w: 125 } },
        mergeData: [0, 1].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 3 })),
        cellData,
      },
    },
  }
}
