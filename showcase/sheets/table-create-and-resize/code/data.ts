import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

export const SAMPLES = [
  {
    id: 'expand',
    name: 'Expand a table',
    hint: 'The table covers A4:C8. Extend it to A4:C10 to include the two waiting deliveries.',
    rows: [
      ['Birch plywood', 12, 'Wood shop'],
      ['Cork tiles', 8, 'Acoustic room'],
      ['Felt rolls', 3, 'Soft studio'],
      ['Copper wire', 16, 'Electronics'],
      ['Bamboo rods', 10, 'Model bench'],
      ['Linen sheets', 6, 'Print room'],
    ],
  },
  {
    id: 'create',
    name: 'Create from cells',
    hint: 'Select A4:C10, then use the native Insert Table control to create a table from these ordinary cells.',
    rows: [
      ['Hand drill', 4, 'Assembly'],
      ['Bench clamp', 9, 'Joinery'],
      ['Steel ruler', 7, 'Drawing'],
      ['Cutting mat', 5, 'Layout'],
      ['Safety goggles', 12, 'Shared'],
      ['Detail brush', 8, 'Finishing'],
    ],
  },
  {
    id: 'shrink',
    name: 'Shrink a table',
    hint: 'The table covers A4:C10. Shrink it to A4:C8; the final two rows remain ordinary worksheet cells.',
    rows: [
      ['Indigo pigment', 2, 'Blue cabinet'],
      ['Ochre powder', 5, 'Earth shelf'],
      ['Sienna paste', 3, 'Warm drawer'],
      ['Chalk sticks', 9, 'White box'],
      ['Charcoal pencils', 7, 'Sketch tray'],
      ['Graphite blocks', 4, 'Dry cabinet'],
    ],
  },
] as const

export function createWorkbookData(): Partial<IWorkbookData> {
  return {
    id: 'studio-table-ranges',
    name: 'Material studio · table ranges',
    locale: LocaleType.EN_US,
    sheetOrder: SAMPLES.map(({ id }) => id),
    sheets: Object.fromEntries(
      SAMPLES.map(({ id, name, hint, rows }) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: name, s: { fs: 18, bl: 1, cl: { rgb: '#164E63' } } } },
          1: { 0: { v: hint } },
          3: Object.fromEntries(
            ['Item', 'Units', 'Destination'].map((v, column) => [column, { v, t: CellValueType.STRING }]),
          ),
          12: { 0: { v: 'Table membership is a native object range, not just a background colour.' } },
          14: {
            0: { v: 'Select a table cell to access native table settings. Keep the header on row 4 when resizing.' },
          },
          16: { 0: { v: 'This example does not promise total rows, header hiding or structured-reference formulas.' } },
        }
        rows.forEach((row, index) => {
          cellData[index + 4] = Object.fromEntries(
            row.map((v, column) => [
              column,
              { v, t: typeof v === 'number' ? CellValueType.NUMBER : CellValueType.STRING },
            ]),
          )
        })
        return [
          id,
          {
            id,
            name,
            rowCount: 26,
            columnCount: 12,
            defaultRowHeight: 38,
            columnData: { 0: { w: 245 }, 1: { w: 145 }, 2: { w: 250 } },
            cellData,
          },
        ]
      }),
    ),
  }
}
