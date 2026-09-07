import type { ICellData, IWorkbookData } from '@univerjs/presets'

export const HEADERS = [
  'Sample',
  'Station',
  'Batch',
  'Flow m³/h',
  'pH',
  'Turbidity NTU',
  'Temperature °C',
  'Variance',
  'Status',
  'Owner',
]

export function createRows(startRow: number, count: number): ICellData[][] {
  return Array.from({ length: count }, (_, offset) => {
    const row = startRow + offset
    const sample = row.toString().padStart(7, '0')
    const values = [
      'MR-' + sample,
      ['North inlet', 'Wetland gate', 'South valve', 'Lab return'][row % 4],
      'B' + (1000 + (row % 913)),
      row % 97 === 0 ? 0 : Math.round((82 + (row % 43) * 1.75) * 100) / 100,
      row % 211 === 0 ? null : Math.round((6.8 + (row % 17) * 0.035) * 1000) / 1000,
      Math.round(((row * 7) % 51) * 0.1 * 100) / 100,
      Math.round((11.25 + (row % 29) * 0.4) * 100) / 100,
      Math.round(((row % 19) - 9) * 0.125 * 1000) / 1000,
      row % 37 === 0 ? 'Review' : row % 13 === 0 ? 'Hold' : 'Released',
      ['A. Rowan', 'M. Chen', 'I. Okafor', 'S. Diaz', 'Unassigned'][row % 5],
    ]
    return values.map((v) => (v == null ? {} : { v }))
  })
}

export function createFixture(id = 'marlow-million-grid'): Partial<IWorkbookData> {
  const cellData = {
    0: Object.fromEntries(HEADERS.map((value, column) => [column, { v: value, s: { bl: 1, bg: { rgb: '#dbeafe' } } }])),
    ...Object.fromEntries(
      createRows(1, 100).map((values, index) => [
        index + 1,
        Object.fromEntries(values.map((v, column) => [column, v])),
      ]),
    ),
  }
  return {
    id,
    name: 'Marlow reservoir sampling grid',
    sheetOrder: ['samples'],
    sheets: {
      samples: {
        id: 'samples',
        name: 'Reservoir samples',
        rowCount: 1_000_000,
        columnCount: 10,
        defaultRowHeight: 24,
        defaultColumnWidth: 105,
        columnData: {
          0: { w: 120 },
          1: { w: 120 },
          3: { w: 90 },
          4: { w: 80 },
          5: { w: 110 },
          6: { w: 120 },
          8: { w: 90 },
          9: { w: 110 },
        },
        cellData,
      },
    },
  }
}

export const WORKBOOK_DATA = createFixture()
