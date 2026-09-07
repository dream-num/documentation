import type { IWorkbookData } from '@univerjs/core'

export type Fixture = 'default' | 'empty' | 'boundary'

export function validateSnapshot(data: Partial<IWorkbookData>) {
  if (
    !data ||
    data.id !== 'cedar-routes' ||
    !Array.isArray(data.sheetOrder) ||
    !data.sheetOrder.length ||
    !data.sheets ||
    new Set(data.sheetOrder).size !== data.sheetOrder.length ||
    data.sheetOrder.some((id) => data.sheets?.[id]?.id !== id)
  )
    throw new Error('Invalid Cedar workbook snapshot. Current owner retained.')
  return structuredClone(data)
}

// Original fictional community delivery routes. This module imports no SDK runtime.
export const ROUTES = [
  ['Harbor loop', 'Quay', 6, 18.5, 0.42],
  ['Hilltop pantry', 'North', 3, 27.8, 0.51],
  ['Orchard schools', 'West', 5, 12.4, 0.38],
  ['Riverside clinic', 'Quay', 4, 31.2, 0.47],
  ['Cedar apartments', 'North', 7, 9.6, 0.36],
  ['Willow shelter', 'West', 2, 43.7, 0.56],
  ['East market', 'Quay', 6, 15.9, 0.41],
  ['Station lockers', 'North', 5, 7.3, 0.35],
  ['Meadow library', 'West', 1, 36.5, 0.49],
  ['Canal gardens', 'Quay', 3, 22.1, 0.44],
  ['Pine community hall', 'North', 2, 29.4, 0.52],
  ['Lakeside kitchens', 'West', 4, 48.6, 0.58],
] as const

export function createRoutes(fixture: Fixture): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'Cedar Community Logistics · weekly routes', s: 'title' } },
    1: { 0: { v: 'Illustrative USD costs · planning week 2027-03-29' } },
    2: Object.fromEntries(
      ['Route', 'Hub', 'Runs / week', 'km / run', 'USD / km', 'Weekly USD'].map((v, i) => [i, { v, s: 'header' }]),
    ),
    17: { 0: { v: 'Weekly route budget', s: 'header' }, 5: { f: '=SUM(F4:F15)', s: 'money' } },
  }
  if (fixture !== 'empty')
    ROUTES.forEach((route, index) => {
      cellData[index + 3] = Object.fromEntries(
        route.map((v, column) => [column, { v, ...(column === 2 ? { s: 'input' } : {}) }]),
      )
      if (fixture === 'boundary' && index === 0) cellData[3][2].v = 0
      if (fixture === 'boundary' && index === 1) cellData[4][2].v = 10000
      const row = index + 4
      cellData[index + 3][5] = { f: `=C${row}*D${row}*E${row}`, s: 'money' }
    })
  return {
    id: 'cedar-routes',
    name: 'Cedar community routes',
    sheetOrder: ['routes'],
    resources: [{ name: 'SHEET_DEFINED_NAME_PLUGIN', data: '{}' }],
    styles: {
      title: { bg: { rgb: '#14532D' }, cl: { rgb: '#FFFFFF' }, bl: 1 },
      header: { bg: { rgb: '#DCFCE7' }, cl: { rgb: '#14532D' }, bl: 1 },
      input: { bg: { rgb: '#EFF6FF' }, cl: { rgb: '#1D4ED8' } },
      money: { n: { pattern: '$#,##0.00' } },
    },
    sheets: {
      routes: {
        id: 'routes',
        name: 'Delivery routes',
        rowCount: 30,
        columnCount: 8,
        defaultRowHeight: 26,
        columnData: { 0: { w: 220 }, 1: { w: 90 }, 2: { w: 120 }, 3: { w: 110 }, 4: { w: 110 }, 5: { w: 160 } },
        mergeData: [
          { startRow: 0, endRow: 0, startColumn: 0, endColumn: 5 },
          { startRow: 1, endRow: 1, startColumn: 0, endColumn: 5 },
        ],
        cellData,
      },
    },
  }
}
