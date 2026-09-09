import type { ICellData, IWorkbookData } from '@univerjs/core'
import type { IRangeThemeStyleJSON } from '@univerjs/sheets'
import { LocaleType } from '@univerjs/core'

const headerRowStyle = { bg: { rgb: '#183B4E' }, cl: { rgb: '#FFFFFF' }, bl: 1 as const }
export const THEMES: Record<string, (IRangeThemeStyleJSON | null)[]> = {
  rows: [
    {
      name: 'studio-row-bands',
      headerRowStyle,
      firstRowStyle: { bg: { rgb: '#FFFFFF' } },
      secondRowStyle: { bg: { rgb: '#E0EDF0' } },
    },
    { name: 'studio-uniform', headerRowStyle, wholeStyle: { bg: { rgb: '#F5F0E7' } } },
  ],
  columns: [
    {
      name: 'studio-column-bands',
      headerRowStyle,
      firstColumnStyle: { bg: { rgb: '#FAE5D2' } },
      secondColumnStyle: { bg: { rgb: '#FFFFFF' } },
    },
    {
      name: 'studio-edge-columns',
      headerRowStyle,
      wholeStyle: { bg: { rgb: '#FFFFFF' } },
      headerColumnStyle: { bg: { rgb: '#E0EDF0' }, bl: 1 },
      lastColumnStyle: { bg: { rgb: '#FAE5D2' }, bl: 1 },
    },
  ],
  defaults: [null, null],
}

const SAMPLES = [
  {
    id: 'rows',
    name: 'Row bands',
    labels: ['Alternating rows', 'Uniform body'],
    rows: [
      ['Linen', 'Natural', 18, 12],
      ['Velvet', 'Moss', 7, 26],
      ['Canvas', 'Ink', 24, 9],
      ['Twill', 'Ochre', 13, 15],
      ['Felt', 'Stone', 9, 8],
      ['Silk', 'Rose', 5, 34],
    ],
  },
  {
    id: 'columns',
    name: 'Columns and edges',
    labels: ['Alternating columns', 'First and last column emphasis'],
    rows: [
      ['Oak', 'Warm', 22, 46],
      ['Ash', 'Pale', 15, 38],
      ['Walnut', 'Dark', 8, 72],
      ['Cork', 'Soft', 30, 14],
      ['Maple', 'Light', 11, 52],
      ['Bamboo', 'Gold', 19, 29],
    ],
  },
  {
    id: 'defaults',
    name: 'Built-in themes',
    labels: ['Built-in theme 0', 'Built-in theme 5'],
    rows: [
      ['Vase', 'Clay', 14, 32],
      ['Bowl', 'Cream', 23, 18],
      ['Jug', 'Blue', 9, 42],
      ['Plate', 'Slate', 28, 16],
      ['Cup', 'Sand', 36, 11],
      ['Tray', 'Rust', 12, 27],
    ],
  },
]

export function createWorkbookData(): Partial<IWorkbookData> {
  return {
    id: 'table-style-lab',
    name: 'Material library · native table styles',
    locale: LocaleType.EN_US,
    sheetOrder: SAMPLES.map(({ id }) => id),
    sheets: Object.fromEntries(
      SAMPLES.map(({ id, name, labels, rows }) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: name, s: { fs: 19, bl: 1, cl: { rgb: '#183B4E' } } } },
          1: { 0: { v: labels[0], s: { bl: 1 } }, 5: { v: labels[1], s: { bl: 1 } } },
          12: { 0: { v: 'Open the menu beside a table name, then choose Set Table Theme.' } },
          14: { 0: { v: 'The two tables share values so only the native theme changes.' } },
        }
        for (const offset of [0, 5]) {
          for (const [row, values] of [['Material', 'Finish', 'Stock', 'Price'], ...rows].entries()) {
            cellData[row + 3] ??= {}
            values.forEach((v, col) => {
              cellData[row + 3][col + offset] = { v }
            })
          }
        }
        return [
          id,
          {
            id,
            name,
            rowCount: 24,
            columnCount: 12,
            defaultRowHeight: 38,
            columnData: {
              0: { w: 145 },
              1: { w: 120 },
              2: { w: 95 },
              3: { w: 95 },
              4: { w: 40 },
              5: { w: 145 },
              6: { w: 120 },
              7: { w: 95 },
              8: { w: 95 },
            },
            cellData,
          },
        ]
      }),
    ),
  }
}
