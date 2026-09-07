import type { IWorkbookData } from '@univerjs/presets'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'aster-lab',
  name: 'Aster field sampling',
  sheetOrder: ['samples', 'archive'],
  styles: {
    header: { bl: 1, bg: { rgb: '#DBEAFE' } },
    protected: { bl: 1, bg: { rgb: '#FEF3C7' } },
  },
  sheets: {
    samples: {
      id: 'samples',
      name: 'Samples',
      rowCount: 30,
      columnCount: 8,
      columnData: { 0: { w: 140 }, 1: { w: 170 }, 2: { w: 135 }, 3: { w: 135 }, 4: { w: 140 }, 5: { w: 160 } },
      cellData: {
        0: {
          0: { v: 'Sample', s: 'header' },
          1: { v: 'Site', s: 'header' },
          2: { v: 'pH', s: 'protected' },
          3: { v: 'Temp °C', s: 'protected' },
          4: { v: 'Reviewed by', s: 'protected' },
          5: { v: 'Field note', s: 'header' },
        },
        1: {
          0: { v: 'AS-021' },
          1: { v: 'North inlet' },
          2: { v: 7.2 },
          3: { v: 18.4 },
          4: { v: 'Mira' },
          5: { v: 'Clear water' },
        },
        2: {
          0: { v: 'AS-022' },
          1: { v: 'Reed bed' },
          2: { v: 6.8 },
          3: { v: 21.1 },
          4: { v: 'Owen' },
          5: { v: 'Repeat at dusk' },
        },
        3: {
          0: { v: 'AS-023' },
          1: { v: 'Stone bridge' },
          2: { v: 7.6 },
          3: { v: 16.9 },
          4: { v: 'Mira' },
          5: { v: 'High flow' },
        },
      },
    },
    archive: {
      id: 'archive',
      name: 'Archive',
      rowCount: 20,
      columnCount: 8,
      cellData: {
        0: { 0: { v: 'Archive: A1 also suppresses the menu' } },
        1: { 1: { v: 'Right-click B2: menu allowed' } },
      },
    },
  },
}
