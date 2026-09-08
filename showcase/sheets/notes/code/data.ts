import type { IWorkbookData, IWorksheetData } from '@univerjs/presets'

function sheet(id: string, name: string, rows: (string | number | null)[][]): Partial<IWorksheetData> {
  return {
    id,
    name,
    rowCount: 30,
    columnCount: 8,
    defaultRowHeight: 32,
    rowHeader: { width: 46 },
    columnHeader: { height: 28 },
    columnData: { 0: { w: 120 }, 1: { w: 210 }, 2: { w: 160 }, 3: { w: 140 }, 4: { w: 150 } },
    cellData: Object.fromEntries(
      rows.map((values, row) => [
        row,
        Object.fromEntries(
          values.map((v, col) => [col, { v, ...(row === 0 ? { s: { bg: { rgb: '#ccfbf1' }, bl: 1 } } : {}) }]),
        ),
      ]),
    ),
  }
}
// Original fictional textile-conservation records and notes. No external comments/accounts.
const notes = {
  intake: {
    1: {
      1: {
        id: 'linen-humidity',
        row: 1,
        col: 1,
        note: 'Humidity check before unpacking.',
        width: 220,
        height: 110,
        show: true,
      },
    },
    2: {
      1: {
        id: 'silk-light',
        row: 2,
        col: 1,
        note: 'Light-sensitive dye.\nUse covered storage.\nRecheck — after 48 hours.',
        width: 250,
        height: 140,
        show: false,
      },
    },
    3: {
      2: {
        id: 'lining-boundary',
        row: 3,
        col: 2,
        note: 'Keep the lining attached.',
        width: 210,
        height: 100,
        show: false,
      },
    },
  },
  storage: {
    1: {
      1: {
        id: 'box-monitor',
        row: 1,
        col: 1,
        note: 'Sensor battery replaced on 2026-08-29.',
        width: 240,
        height: 100,
        show: false,
      },
    },
  },
}
export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'riverside-textiles',
  name: 'Riverside textile conservation',
  sheetOrder: ['intake', 'storage'],
  sheets: {
    intake: sheet('intake', 'Intake', [
      ['Object ID', 'Textile', 'Condition', 'Pieces', 'Location'],
      ['TX-014', 'Linen banner', 'Humidity review', 1, 'Bench A'],
      ['TX-027', 'Silk sash', 'Light sensitive', 2, 'Covered tray'],
      ['TX-033', 'Wool fragment', 'Lining retained', 5, 'Bench C'],
      ['TX-049', 'Painted cotton', 'Stable', 0, null],
    ]),
    storage: sheet('storage', 'Storage', [
      ['Container', 'Contents', 'Check', 'Sensors', 'Location'],
      ['BX-006', 'Archival box', 'Monitor monthly', 2, 'North shelf'],
      ['BX-012', 'Silk wrapping', 'Sealed', 1, 'Low-light bay'],
      ['BX-018', 'Empty mounts', 'Ready', 0, null],
    ]),
  },
  resources: [{ name: 'SHEET_NOTE_PLUGIN', data: JSON.stringify(notes) }],
}
