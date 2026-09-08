import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const cellData: Record<number, Record<number, ICellData>> = {}
  const put = (row: number, col: number, value: string | number, color = '#FFFFFF') => {
    cellData[row] ??= {}
    cellData[row][col] = {
      ...(typeof value === 'string' && value.startsWith('=') ? { f: value } : { v: value }),
      s: { bg: { rgb: color }, cl: { rgb: '#172B4D' } },
    }
  }
  put(0, 0, 'Product lookup lab')
  put(1, 0, 'Edit orange inputs. Select a blue result to inspect its formula.')
  const products = [
    ['SKU', 'Product', 'Price', 'Stock'],
    ['L-101', 'Arc lamp', 48, 24],
    ['L-102', 'Task lamp', 72, 11],
    ['L-103', 'Wall lamp', 64, 18],
    ['L-104', 'Floor lamp', 128, 7],
    ['L-105', 'Clip lamp', 32, 35],
    ['L-106', 'Travel lamp', 56, 16],
  ]
  products.forEach((row, index) =>
    row.forEach((value, col) => put(index + 3, col, value, index ? '#FFF7ED' : '#DBEAFE')),
  )
  const queries = [
    ['Method', 'Input', 'Live result'],
    ['XLOOKUP · exact', 'L-103', '=XLOOKUP(G5,A5:A10,C5:C10,"Not stocked")'],
    ['INDEX + MATCH', 'L-103', '=INDEX(C5:C10,MATCH(G6,A5:A10,0),1)'],
    ['XMATCH · position', 'L-103', '=XMATCH(G7,A5:A10,0)'],
    ['XLOOKUP · missing', 'L-999', '=XLOOKUP(G8,A5:A10,B5:B10,"Not stocked")'],
    ['XLOOKUP · wildcard', 'Task*', '=XLOOKUP(G9,B5:B10,A5:A10,"Not stocked",2)'],
    ['XLOOKUP · leftward', 'Floor lamp', '=XLOOKUP(G10,B5:B10,A5:A10,"Not stocked")'],
  ]
  queries.forEach((row, index) =>
    row.forEach((value, col) => put(index + 3, col + 5, value, index && col === 1 ? '#FFEDD5' : '#DBEAFE')),
  )
  ;[
    ['Minimum units', 'Discount'],
    [0, 0],
    [10, 0.05],
    [25, 0.1],
    [50, 0.15],
  ].forEach((row, index) => {
    row.forEach((value, col) => put(index + 12, col, value, index ? '#FFF7ED' : '#DBEAFE'))
  })
  put(12, 5, 'Next smaller tier')
  put(12, 6, 32, '#FFEDD5')
  put(12, 7, '=XLOOKUP(G13,A14:A17,B14:B17,0,-1)', '#DBEAFE')
  put(14, 5, 'Last duplicate match')
  put(14, 6, 'L-101', '#FFEDD5')
  put(14, 7, '=XLOOKUP(G15,A20:A22,B20:B22,"Not stocked",0,-1)', '#DBEAFE')
  ;[
    ['Price updates', 'Price'],
    ['L-101', 48],
    ['L-102', 72],
    ['L-101', 52],
  ].forEach((row, index) => {
    row.forEach((value, col) => put(index + 18, col, value, index ? '#FFF7ED' : '#DBEAFE'))
  })
  for (const [row, columns] of [
    [3, [0, 1, 2, 3, 5, 6, 7]],
    [12, [0, 1]],
    [18, [0, 1]],
  ] as const) {
    for (const col of columns) {
      cellData[row][col].s = { bl: 1, bg: { rgb: '#17365D' }, cl: { rgb: '#FFFFFF' } }
    }
  }
  cellData[0][0].s = { fs: 22, bl: 1, cl: { rgb: '#17365D' } }
  return {
    id: 'product-lookup-lab',
    name: 'Product lookup lab',
    locale: LocaleType.EN_US,
    sheetOrder: ['catalog'],
    sheets: {
      catalog: {
        id: 'catalog',
        name: 'Lookup comparisons',
        rowCount: 30,
        columnCount: 10,
        defaultRowHeight: 32,
        defaultColumnWidth: 110,
        columnData: {
          0: { w: 130 },
          1: { w: 150 },
          2: { w: 85 },
          3: { w: 80 },
          4: { w: 24 },
          5: { w: 220 },
          6: { w: 130 },
          7: { w: 145 },
        },
        rowData: { 0: { h: 44 }, 1: { h: 36 } },
        mergeData: [
          { startRow: 0, endRow: 0, startColumn: 0, endColumn: 7 },
          { startRow: 1, endRow: 1, startColumn: 0, endColumn: 7 },
        ],
        cellData,
      },
    },
  }
}
