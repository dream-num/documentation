import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

export const SAMPLES = [
  {
    id: 'reject',
    name: 'Reject invalid',
    hint: 'Type 9 in B5. The native rejection dialog uses a custom message; dismiss and cancel the invalid edit.',
    rows: [
      ['Ceramic bowls', 2, 'Foam dividers'],
      ['Glass jars', 4, 'Lidded crate'],
      ['Serving boards', 1, 'Corner guards'],
      ['Cutlery rolls', 6, 'Board sleeves'],
      ['Water pitchers', 3, 'Padded carton'],
      ['Linen bundles', 5, 'Dry shelf'],
    ],
  },
  {
    id: 'warning',
    name: 'Keep with message',
    hint: 'Type 9 in B5. The value stays, with an invalid marker and the custom tip. Replace it with 4.',
    rows: [
      ['Drawing kits', 3, 'Studio A'],
      ['Print portfolios', 1, 'Flat rack'],
      ['Clay samples', 5, 'Workshop'],
      ['Brush caddies', 2, 'Wash station'],
      ['Apron packs', 6, 'Peg rail'],
      ['Paper bundles', 4, 'Dry cabinet'],
    ],
  },
  {
    id: 'default',
    name: 'Default message',
    hint: 'Type 9 in B5 and inspect the invalid cell. The SDK generates a message from the numeric rule.',
    rows: [
      ['Field notebooks', 4, 'Walk leaders'],
      ['Hand lenses', 2, 'Nature trail'],
      ['Rain ponchos', 6, 'Welcome tent'],
      ['Map folders', 1, 'Route desk'],
      ['Sample trays', 3, 'Discovery hut'],
      ['Clipboards', 5, 'Survey team'],
    ],
  },
] as const

export function createWorkbookData(): Partial<IWorkbookData> {
  return {
    id: 'crate-validation-messages',
    name: 'Workshop crates · validation feedback',
    locale: LocaleType.EN_US,
    sheetOrder: SAMPLES.map(({ id }) => id),
    sheets: Object.fromEntries(
      SAMPLES.map(({ id, name, hint, rows }) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: name, s: { fs: 18, bl: 1, cl: { rgb: '#164E63' } } } },
          1: { 0: { v: hint } },
          3: Object.fromEntries(
            ['Supply', 'Crates (1–6)', 'Destination / packing'].map((v, column) => [
              column,
              { v, s: { bg: { rgb: '#164E63' }, cl: { rgb: '#FFFFFF' }, bl: 1 } },
            ]),
          ),
          12: { 0: { v: 'All three tabs require a whole number from 1 through 6. Blank cells are allowed.' } },
          14: { 0: { v: 'Data > Data Validation: inspect the rule and its advanced feedback settings.' } },
          16: {
            0: {
              v: 'No simulated warnings or custom dialogs. Input prompts and custom alert titles are not demonstrated.',
            },
          },
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
            columnCount: 13,
            defaultRowHeight: 38,
            columnData: { 0: { w: 250 }, 1: { w: 185 }, 2: { w: 255 } },
            cellData,
          },
        ]
      }),
    ),
  }
}
