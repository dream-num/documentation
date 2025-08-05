import type { IWorkbookData } from '@univerjs/presets'
import { CellValueType } from '@univerjs/presets'

export const WORKBOOK_DATA_1: Partial<IWorkbookData> = {
  id: 'workbook1',
  sheetOrder: ['sheet-01'],
  resources: [
  ],
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: 'Sheet 01',
      rowCount: 20,
      columnCount: 40,
      cellData: {
        0: {
          0: { t: CellValueType.NUMBER, v: 10 },
        },
        1: {
          0: { t: CellValueType.STRING, v: 'TOTAL:' },
          1: {
            f: '=\'[workbook1]Sheet 01\'!A1 + \'[workbook2]Sheet 01\'!A1 + \'[workbook3]Sheet 01\'!A1 + \'[workbook4]Sheet 01\'!A1',
          },
        },
        3: {
          0: {
            t: CellValueType.STRING,
            v: 'FROM WORKSHEET "foobar"',
          },
        },
        4: {
          0: {
            f: '=0.04 + foobar!A1',
            v: 3.14,
            t: CellValueType.NUMBER,
          },
        },
      },
    },
    'sheet-02': {
      id: 'sheet-02',
      name: 'foobar',
      rowCount: 20,
      columnCount: 40,
      cellData: {
        0: {
          0: {
            t: CellValueType.NUMBER,
            v: 3.1,
          },
        },
      },
    },
  },
}

export const WORKBOOK_DATA_2: Partial<IWorkbookData> = {
  id: 'workbook2',
  sheetOrder: ['sheet-01'],
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: 'Sheet 01',
      rowCount: 20,
      columnCount: 40,
      cellData: {
        0: {
          0: { v: 20 },
        },
      },
    },
    'sheet-02': {
      id: 'sheet-02',
      name: 'foobar',
      rowCount: 20,
      columnCount: 40,
      cellData: {
        5: {
          0: {
          },
        },
      },
    },
  },
}

export const WORKBOOK_DATA_3: Partial<IWorkbookData> = {
  id: 'workbook3',
  sheetOrder: ['sheet-01'],
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: 'Sheet 01',
      rowCount: 20,
      columnCount: 40,
      cellData: {
        0: {
          0: { v: 33 },
        },
      },
    },
    'sheet-02': {
      id: 'sheet-02',
      name: 'foobar',
      rowCount: 20,
      columnCount: 40,
      cellData: {
        5: {
          0: {
          },
        },
      },
    },
  },
}

export const WORKBOOK_DATA_4: Partial<IWorkbookData> = {
  id: 'workbook4',
  sheetOrder: ['sheet-01'],
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: 'Sheet 01',
      rowCount: 20,
      columnCount: 40,
      cellData: {
        0: {
          0: { v: 7.1 },
        },
      },
    },
  },
}
