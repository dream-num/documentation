import type { ICellData, IWorkbookData } from '@univerjs/presets'

const volunteers = [
  ['R-101', 'Bicycle repairs', 6.5, 'Mina', 'Confirmed'],
  ['R-102', 'Textile mending', 3, 'Owen', 'Draft'],
  ['R-103', 'Small appliances', 0, 'Iris', 'Waiting'],
  ['R-104', 'Furniture clinic', 8, 'Noah', 'Confirmed'],
  ['R-105', 'Tool sharpening', null, 'Zara', 'Unassigned'],
  ['R-106', 'Reception', 2.25, 'Leo', 'Draft'],
]
const cellData: Record<number, Record<number, ICellData>> = {
  0: { 0: { v: 'HARBOR REPAIR CAFÉ', s: { bl: 1, cl: { rgb: '#0f766e' } } } },
  1: { 0: { v: 'Fictional volunteer hours · local permission visualization, not access security' } },
  2: Object.fromEntries(
    ['Task', 'Workshop', 'Hours', 'Coordinator', 'Status'].map((v, c) => [
      c,
      { v, s: { bl: 1, bg: { rgb: '#e2e8f0' } } },
    ]),
  ),
  11: { 1: { v: 'Total hours' }, 2: { f: '=SUM(C4:C9)' } },
  13: { 0: { v: 'C4:C9 is the range-profile target. Other cells remain a comparison.' } },
}
for (const [index, row] of volunteers.entries())
  cellData[index + 3] = Object.fromEntries(row.map((v, c) => [c, v == null ? {} : { v }]))
export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'harbor-repair-cafe',
  name: 'Harbor repair café',
  sheetOrder: ['rota', 'notes'],
  sheets: {
    rota: {
      id: 'rota',
      name: 'Volunteer rota',
      rowCount: 40,
      columnCount: 12,
      defaultRowHeight: 32,
      defaultColumnWidth: 130,
      columnData: { 0: { w: 95 }, 1: { w: 200 }, 2: { w: 140 }, 3: { w: 170 }, 4: { w: 150 } },
      cellData,
    },
    notes: {
      id: 'notes',
      name: 'Unprotected notes',
      rowCount: 20,
      columnCount: 8,
      defaultColumnWidth: 180,
      cellData: { 0: { 0: { v: 'Independent editable worksheet' } }, 3: { 2: { v: 19 } } },
    },
  },
}
