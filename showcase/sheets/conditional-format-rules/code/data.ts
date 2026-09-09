import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

export const SAMPLES = [
  {
    id: 'numbers',
    name: 'Numeric threshold',
    headers: ['Seed variety', 'Packets', 'Shelf'],
    rows: [
      ['Bronze fennel', 12, 'A1'],
      ['Blue cornflower', 4, 'B2'],
      ['Lemon basil', 20, 'A3'],
      ['Scarlet runner', 8, 'C1'],
      ['Wild rocket', 9, 'B1'],
      ['Dill bouquet', 0, 'C2'],
    ],
    hint: 'B5:B10: greater than 8. Change B6 from 4 to 11; the fill appears.',
  },
  {
    id: 'text',
    name: 'Text contains',
    headers: ['Donation', 'Inspection note', 'Volunteer'],
    rows: [
      ['Sunflower envelope', 'Check moisture', 'Iris'],
      ['Marigold tin', 'Ready to label', 'Theo'],
      ['Pea parcel', 'Check seal', 'Mina'],
      ['Chive sachet', 'Ready for shelf', 'Jules'],
      ['Poppy packet', 'Check date', 'Owen'],
      ['Calendula bag', 'Dry and sorted', 'Ada'],
    ],
    hint: 'B5:B10: contains Check. Change B6 to Check label; then remove Check.',
  },
  {
    id: 'duplicates',
    name: 'Duplicate labels',
    headers: ['Tray', 'Batch label', 'Location'],
    rows: [
      ['Tray 1', 'SEED-24', 'North'],
      ['Tray 2', 'SEED-31', 'East'],
      ['Tray 3', 'SEED-24', 'South'],
      ['Tray 4', 'SEED-42', 'West'],
      ['Tray 5', 'SEED-31', 'Annex'],
      ['Tray 6', 'SEED-57', 'Loft'],
    ],
    hint: 'B5:B10: duplicate labels. Change B7 to SEED-99; both SEED-24 fills disappear.',
  },
  {
    id: 'formula',
    name: 'Relative formula',
    headers: ['Collection', 'Available', 'Minimum'],
    rows: [
      ['Salad greens', 3, 6],
      ['Climbing beans', 12, 8],
      ['Herb starters', 5, 5],
      ['Pollinator mix', 2, 4],
      ['Winter brassicas', 9, 6],
      ['Root vegetables', 1, 3],
    ],
    hint: 'A5:C10: =$B5<$C5. Columns stay fixed; each row compares its own stock and minimum.',
  },
] as const

export function createWorkbookData(): Partial<IWorkbookData> {
  return {
    id: 'seed-library-conditional-rules',
    name: 'Seed library · conditional rules',
    locale: LocaleType.EN_US,
    sheetOrder: SAMPLES.map(({ id }) => id),
    sheets: Object.fromEntries(
      SAMPLES.map(({ id, name, headers, rows, hint }) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: name, s: { bl: 1, fs: 18, cl: { rgb: '#164E63' } } } },
          1: { 0: { v: hint } },
          3: Object.fromEntries(
            headers.map((v, column) => [column, { v, s: { bg: { rgb: '#164E63' }, cl: { rgb: '#FFFFFF' }, bl: 1 } }]),
          ),
          12: { 0: { v: 'Open native Conditional Formatting to inspect or edit the actual rule.' } },
          14: {
            0: {
              v: 'Data cells have no authored fill. Conditional formatting reacts to edits; it does not change values.',
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
            columnCount: 10,
            defaultRowHeight: 36,
            columnData: { 0: { w: 240 }, 1: { w: 230 }, 2: { w: 180 } },
            cellData,
          },
        ]
      }),
    ),
  }
}
