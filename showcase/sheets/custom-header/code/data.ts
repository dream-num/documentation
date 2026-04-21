import type { IWorkbookData } from '@univerjs/presets'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'workbook-01',
  sheetOrder: ['sheet-01'],
  name: 'Custom Header',
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: 'Sheet1',
      rowCount: 20,
      columnCount: 10,
      cellData: {
        0: {
          0: { v: 'Alice', t: 1 },
          1: { v: 24, t: 2 },
          2: { v: 'Engineering', t: 1 },
          3: { v: 8000, t: 2 },
        },
        1: {
          0: { v: 'Bob', t: 1 },
          1: { v: 30, t: 2 },
          2: { v: 'Product', t: 1 },
          3: { v: 9500, t: 2 },
        },
        2: {
          0: { v: 'Charlie', t: 1 },
          1: { v: 28, t: 2 },
          2: { v: 'Design', t: 1 },
          3: { v: 8800, t: 2 },
        },
        3: {
          0: { v: 'Diana', t: 1 },
          1: { v: 35, t: 2 },
          2: { v: 'Marketing', t: 1 },
          3: { v: 9200, t: 2 },
        },
      },
    },
  },
}
