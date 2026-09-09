import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

const cell = (v: string | number): ICellData => ({ v })

export function createWorkbookData(): Partial<IWorkbookData> {
  const scalar: Record<number, Record<number, ICellData>> = {
    0: { 0: { v: 'Name a calculation, then parameterize it', s: { fs: 19, bl: 1, cl: { rgb: '#4338CA' } } } },
    1: { 0: cell('LET binds local values; LAMBDA accepts arguments. Both examples add a fixed packing charge of 2.') },
    3: Object.fromEntries(
      ['Print kit', 'Quantity', 'Unit cost', '', 'LET total', 'LAMBDA total'].map((v, col) => [
        col,
        { v, s: { bl: 1, bg: { rgb: '#E0E7FF' } } },
      ]),
    ),
    10: { 0: cell('Edit B5 from 2 to 4: E5 and F5 change from 18 to 34. Select either formula to compare syntax.') },
    12: { 0: cell('These are local formula names, not workbook named ranges or a JavaScript custom function.') },
  }
  const lines: (string | number)[][] = [
    ['Cyanotype set', 2, 8],
    ['Stencil set', 3, 5],
    ['Spare roller', 0, 12],
  ]
  lines.forEach((row, index) => {
    const r = index + 5
    scalar[r - 1] = Object.fromEntries(
      row.map((v, col) => [col, { v, s: { bg: { rgb: col ? '#FEF3C7' : '#FFFFFF' } } }]),
    )
    scalar[r - 1][4] = { f: '=LET(qty,B' + r + ',price,C' + r + ',qty*price+2)', s: { bg: { rgb: '#EEF2FF' } } }
    scalar[r - 1][5] = { f: '=LAMBDA(qty,price,qty*price+2)(B' + r + ',C' + r + ')', s: { bg: { rgb: '#F5F3FF' } } }
  })
  const arrays: Record<number, Record<number, ICellData>> = {
    0: { 0: { v: 'Pass a calculation into another function', s: { fs: 19, bl: 1, cl: { rgb: '#0F766E' } } } },
    1: { 0: cell('MAP pairs two input columns; BYROW receives each row; REDUCE accumulates the mapped costs.') },
    3: Object.fromEntries(
      [
        'Print kit',
        'Quantity',
        'Unit cost',
        '',
        'MAP costs',
        '',
        'BYROW costs',
        '',
        'Nested REDUCE',
        '',
        'Spill-range REDUCE',
      ].map((v, col) => [col, { v, s: { bl: 1, bg: { rgb: '#CCFBF1' } } }]),
    ),
    4: {
      4: { f: '=MAP(B5:B8,C5:C8,LAMBDA(qty,price,qty*price))', s: { bg: { rgb: '#CCFBF1' } } },
      6: { f: '=BYROW(B5:C8,LAMBDA(pair,PRODUCT(pair)))', s: { bg: { rgb: '#E0F2FE' } } },
      8: {
        f: '=REDUCE(0,MAP(B5:B8,C5:C8,LAMBDA(qty,price,qty*price)),LAMBDA(total,cost,total+cost))',
        s: { bg: { rgb: '#FEF3C7' } },
      },
      10: { f: '=REDUCE(0,E5:E8,LAMBDA(total,cost,total+cost))', s: { bg: { rgb: '#FEE2E2' } } },
    },
    11: { 0: cell('Edit B5 from 2 to 4: MAP and BYROW start with 32; REDUCE changes from 39 to 55.') },
    13: { 0: cell('E5 and G5 own four-cell spills. Edit the anchors, not the calculated spill children.') },
    15: {
      0: cell(
        'Spill-range REDUCE is a compatibility check: it should equal Nested REDUCE. See the README for the installed SDK result.',
      ),
    },
  }
  ;[...lines, ['Label bundle', 4, 2]].forEach((row, index) => {
    arrays[index + 4] ??= {}
    row.forEach((v, col) => {
      arrays[index + 4][col] = { v, s: { bg: { rgb: col ? '#FEF3C7' : '#FFFFFF' } } }
    })
    for (const col of [4, 6]) arrays[index + 4][col] ??= { s: { bg: { rgb: '#F0FDFA' } } }
  })
  return {
    id: 'let-lambda-workbook',
    name: 'LET and LAMBDA',
    locale: LocaleType.EN_US,
    sheetOrder: ['local', 'higher-order'],
    sheets: Object.fromEntries(
      (
        [
          ['local', 'Local names and arguments', scalar],
          ['higher-order', 'MAP BYROW REDUCE', arrays],
        ] as const
      ).map(([id, name, cellData]) => [
        id,
        {
          id,
          name,
          cellData,
          rowCount: 26,
          columnCount: 12,
          defaultRowHeight: 35,
          defaultColumnWidth: 125,
          columnData: {
            0: { w: 185 },
            1: { w: 100 },
            2: { w: 110 },
            3: { w: 25 },
            4: { w: 145 },
            5: { w: id === 'local' ? 170 : 25 },
            6: { w: 145 },
            7: { w: 25 },
            8: { w: 165 },
            9: { w: 25 },
            10: { w: 195 },
          },
        },
      ]),
    ),
  }
}
