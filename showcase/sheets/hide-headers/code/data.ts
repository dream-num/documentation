import type { IWorkbookData } from '@univerjs/core'
import { BooleanNumber } from '@univerjs/core'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'workbook-01',
  sheetOrder: ['sheet-01'],
  name: 'Hide Headers Demo',
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: 'Sheet 1',
      rowCount: 20,
      columnCount: 10,
      rowHeader: {
        width: 46,
        hidden: BooleanNumber.TRUE,
      },
      columnHeader: {
        height: 20,
        hidden: BooleanNumber.TRUE,
      },
      cellData: {
        0: {
          0: { v: 'A1' },
          1: { v: 'B1' },
          2: { v: 'C1' },
        },
        1: {
          0: { v: 'A2' },
          1: { v: 'B2' },
          2: { v: 'C2' },
        },
      },
    },
  },
}
