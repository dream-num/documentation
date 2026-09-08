import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

export const BOOKINGS = [
  ['R01', 'West', 30, 'Desk lamp', 1],
  ['R02', 'East', 45, 'Canvas backpack', 2],
  ['R03', 'East', 20, 'Kitchen timer', 3],
  ['R04', 'West', 60, 'Portable radio', 4],
  ['R05', 'North', 15, 'Garden secateurs', 5],
  ['R06', 'East', 45, 'Wool cardigan', 6],
  ['R07', 'North', 15, 'Bicycle bell', 7],
  ['R08', 'West', 10, 'Travel umbrella', 8],
] as const

export function createWorkbookData(): Partial<IWorkbookData> {
  return {
    id: 'repair-booking-sort',
    name: 'Repair café · native sort',
    locale: LocaleType.EN_US,
    sheetOrder: ['single', 'multiple', 'blank'],
    sheets: Object.fromEntries(
      [
        ['single', 'Single key', '#164E63', 'Select A5:E12. Custom Sort: Column C ascending or descending.'],
        ['multiple', 'Multiple keys', '#754153', 'Custom Sort: Column B ascending, then Column C descending.'],
        ['blank', 'Blank estimates', '#16645A', 'R07 has no estimate; R08 is explicitly empty. Sort the whole table.'],
      ].map(([id, name, accent, instruction]) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: name, s: { bl: 1, fs: 18, cl: { rgb: accent } } } },
          1: { 0: { v: instruction } },
          3: Object.fromEntries(
            ['Booking', 'Repair bay', 'Minutes', 'Item', 'Intake order'].map((v, index) => [
              index,
              { v, t: CellValueType.STRING, s: { bg: { rgb: accent }, cl: { rgb: '#FFFFFF' }, bl: 1 } },
            ]),
          ),
          14: { 0: { v: 'Header row 4 stays outside the sorted A5:E12 range.' } },
          16: { 0: { v: 'Keep all five columns together: each booking belongs to one complete row.' } },
          18: {
            0: {
              v:
                id === 'multiple'
                  ? 'Equal keys: R02 before R06; R05 before R07 in the original intake order.'
                  : 'Use native Undo to restore the previous order, not a regenerated fixture.',
            },
          },
        }
        BOOKINGS.forEach((values, index) => {
          cellData[index + 4] = Object.fromEntries(
            values.map((value, column) => [
              column,
              { v: value, t: typeof value === 'number' ? CellValueType.NUMBER : CellValueType.STRING },
            ]),
          )
          if (id === 'blank' && index === 6) delete cellData[index + 4][2]
          if (id === 'blank' && index === 7) cellData[index + 4][2] = { v: '', t: CellValueType.STRING }
        })
        return [
          id,
          {
            id,
            name,
            rowCount: 28,
            columnCount: 9,
            defaultRowHeight: 34,
            columnData: { 0: { w: 115 }, 1: { w: 140 }, 2: { w: 130 }, 3: { w: 240 }, 4: { w: 140 } },
            cellData,
          },
        ]
      }),
    ),
  }
}
