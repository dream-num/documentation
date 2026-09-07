import type { IWorkbookData, IWorksheetData } from '@univerjs/presets'

// Original fictional fixtures; header labels describe fields, not an extra data row.
function sheet(id: string, name: string, rows: (string | number | null)[][]): Partial<IWorksheetData> {
  return {
    id,
    name,
    rowCount: 30,
    columnCount: 8,
    defaultRowHeight: 30,
    rowHeader: { width: 88 },
    columnHeader: { height: 36 },
    columnData: { 0: { w: 220 }, 1: { w: 115 }, 2: { w: 140 }, 3: { w: 140 }, 4: { w: 140 }, 5: { w: 120 } },
    cellData: Object.fromEntries(
      rows.map((values, row) => [
        row,
        Object.fromEntries(
          values.map((v, column) => [
            column,
            { v, ...(column === 4 ? { s: { bg: { rgb: v === 'Ready' ? '#dcfce7' : '#fef3c7' } } } : {}) },
          ]),
        ),
      ]),
    ),
  }
}
export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'lumen-equipment',
  name: 'Lumen cinema equipment desk',
  sheetOrder: ['bookings', 'returns'],
  sheets: {
    bookings: sheet('bookings', 'Bookings', [
      ['Portable projector', 'PJ-042', '2026-09-04', '2026-09-06', 'On location', 250],
      ['Wireless microphone', 'AU-108', '2026-09-04', '2026-09-05', 'Ready', 75],
      ['Tripod stand', 'ST-015', '2026-09-03', '2026-09-04', 'Overdue', 0],
      ['LED panel kit', 'LT-031', '2026-09-05', '2026-09-07', 'Reserved', 120],
      ['Caption display', 'AC-009', null, null, 'Ready', 0],
    ]),
    returns: sheet('returns', 'Returns', [
      ['Field recorder', 'AU-022', '2026-09-01', '2026-09-03', 'Inspection', 80],
      ['Projection screen', 'SC-006', '2026-09-02', '2026-09-03', 'Ready', 150],
      ['Hearing loop kit', 'AC-012', '2026-09-02', '2026-09-04', 'Ready', 0],
    ]),
  },
}
