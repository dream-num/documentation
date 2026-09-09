import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

export const SAMPLES = [
  {
    id: 'scales',
    name: 'Colour scales',
    headers: ['Reservoir sensor', 'Two colours', 'Three colours'],
    rows: [
      ['North tank', 0],
      ['Orchard cistern', 20],
      ['Glasshouse vat', 40],
      ['Courtyard barrel', 50],
      ['Meadow basin', 75],
      ['Roof collector', 100],
    ],
    hint: 'Fixed endpoints 0 and 100; the three-colour scale adds a midpoint at 50.',
  },
  {
    id: 'bars',
    name: 'Signed data bars',
    headers: ['Energy station', 'Solid bar', 'Gradient bar'],
    rows: [
      ['Workshop tools', -80],
      ['Cold store', -40],
      ['Idle pump', 0],
      ['Solar shed', 25],
      ['Wind mast', 60],
      ['Battery bank', 100],
    ],
    hint: 'Fixed bounds -100 to 100. Negative bars extend left of zero; positive bars extend right.',
  },
  {
    id: 'icons',
    name: 'Icon thresholds',
    headers: ['Inspection zone', 'Icon and value', 'Icon only'],
    rows: [
      ['Roof walkway', 30],
      ['Loading ramp', 49],
      ['Seed archive', 50],
      ['Tool locker', 79],
      ['Potting bench', 80],
      ['Water station', 95],
    ],
    hint: 'Scores: green arrow >=80, yellow arrow >=50, red arrow below 50. Values remain stored in both columns.',
  },
] as const

export function createWorkbookData(): Partial<IWorkbookData> {
  return {
    id: 'field-station-conditional-visuals',
    name: 'Field station · visual rules',
    locale: LocaleType.EN_US,
    sheetOrder: SAMPLES.map(({ id }) => id),
    sheets: Object.fromEntries(
      SAMPLES.map(({ id, name, headers, rows, hint }) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: name, s: { fs: 18, bl: 1, cl: { rgb: '#164E63' } } } },
          1: { 0: { v: hint } },
          3: Object.fromEntries(
            headers.map((v, column) => [column, { v, s: { bg: { rgb: '#164E63' }, cl: { rgb: '#FFFFFF' }, bl: 1 } }]),
          ),
          12: { 0: { v: 'Edit B5 to compare its live visual with the unchanged value in C5.' } },
          14: {
            0: { v: 'Data > Conditional Formatting > Manage Conditional Formatting: inspect the two native rules.' },
          },
          16: { 0: { v: 'Columns B and C are independent comparison data, not synchronized copies.' } },
        }
        rows.forEach(([label, value], index) => {
          cellData[index + 4] = {
            0: { v: label, t: CellValueType.STRING },
            1: { v: value, t: CellValueType.NUMBER },
            2: { v: value, t: CellValueType.NUMBER },
          }
        })
        return [
          id,
          {
            id,
            name,
            rowCount: 26,
            columnCount: 10,
            defaultRowHeight: 40,
            columnData: { 0: { w: 245 }, 1: { w: 265 }, 2: { w: 265 } },
            cellData,
          },
        ]
      }),
    ),
  }
}
