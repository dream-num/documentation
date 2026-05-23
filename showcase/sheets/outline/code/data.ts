import type { IWorkbookData } from '@univerjs/presets'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'workbook-01',
  sheetOrder: [
    'sheet-01',
  ],
  name: 'Sheets Outline Demo',
  styles: {
    title: {
      fs: 18,
      bl: 1,
      cl: {
        rgb: '#0f172a',
      },
    },
    header: {
      bg: {
        rgb: '#2563eb',
      },
      cl: {
        rgb: '#ffffff',
      },
      bl: 1,
      ht: 2,
      vt: 2,
    },
    section: {
      bg: {
        rgb: '#e0f2fe',
      },
      bl: 1,
      ht: 2,
      vt: 2,
    },
    text: {
      ht: 2,
      vt: 2,
    },
    number: {
      ht: 2,
      vt: 2,
      n: {
        pattern: '#,##0',
      },
    },
  },
  sheets: {
    'sheet-01': {
      id: 'sheet-01',
      name: 'Outline',
      rowCount: 30,
      columnCount: 12,
      defaultRowHeight: 28,
      defaultColumnWidth: 96,
      showGridlines: 1,
      columnData: {
        0: {
          w: 150,
        },
        1: {
          w: 120,
        },
        2: {
          w: 120,
        },
        3: {
          w: 120,
        },
        4: {
          w: 120,
        },
      },
      mergeData: [
        {
          startRow: 0,
          startColumn: 0,
          endRow: 0,
          endColumn: 4,
          rangeType: 0,
          unitId: 'workbook-01',
          sheetId: 'sheet-01',
        },
      ],
      cellData: {
        0: {
          0: {
            v: 'Quarterly Department Budget',
            t: 1,
            s: 'title',
          },
        },
        2: {
          0: {
            v: 'Department',
            t: 1,
            s: 'header',
          },
          1: {
            v: 'Owner',
            t: 1,
            s: 'header',
          },
          2: {
            v: 'Q1',
            t: 1,
            s: 'header',
          },
          3: {
            v: 'Q2',
            t: 1,
            s: 'header',
          },
          4: {
            v: 'Total',
            t: 1,
            s: 'header',
          },
        },
        3: {
          0: {
            v: 'Operations',
            t: 1,
            s: 'section',
          },
          1: {
            v: 'Mina',
            t: 1,
            s: 'section',
          },
          2: {
            v: 18000,
            t: 2,
            s: 'number',
          },
          3: {
            v: 21000,
            t: 2,
            s: 'number',
          },
          4: {
            v: 39000,
            t: 2,
            s: 'number',
          },
        },
        4: {
          0: {
            v: 'Facilities',
            t: 1,
            s: 'text',
          },
          1: {
            v: 'Mina',
            t: 1,
            s: 'text',
          },
          2: {
            v: 7200,
            t: 2,
            s: 'number',
          },
          3: {
            v: 8100,
            t: 2,
            s: 'number',
          },
          4: {
            v: 15300,
            t: 2,
            s: 'number',
          },
        },
        5: {
          0: {
            v: 'Support',
            t: 1,
            s: 'text',
          },
          1: {
            v: 'Noah',
            t: 1,
            s: 'text',
          },
          2: {
            v: 5400,
            t: 2,
            s: 'number',
          },
          3: {
            v: 6200,
            t: 2,
            s: 'number',
          },
          4: {
            v: 11600,
            t: 2,
            s: 'number',
          },
        },
        6: {
          0: {
            v: 'Logistics',
            t: 1,
            s: 'text',
          },
          1: {
            v: 'Ava',
            t: 1,
            s: 'text',
          },
          2: {
            v: 5400,
            t: 2,
            s: 'number',
          },
          3: {
            v: 6700,
            t: 2,
            s: 'number',
          },
          4: {
            v: 12100,
            t: 2,
            s: 'number',
          },
        },
        8: {
          0: {
            v: 'Product',
            t: 1,
            s: 'section',
          },
          1: {
            v: 'Kai',
            t: 1,
            s: 'section',
          },
          2: {
            v: 26000,
            t: 2,
            s: 'number',
          },
          3: {
            v: 28500,
            t: 2,
            s: 'number',
          },
          4: {
            v: 54500,
            t: 2,
            s: 'number',
          },
        },
        9: {
          0: {
            v: 'Research',
            t: 1,
            s: 'text',
          },
          1: {
            v: 'Kai',
            t: 1,
            s: 'text',
          },
          2: {
            v: 9000,
            t: 2,
            s: 'number',
          },
          3: {
            v: 10200,
            t: 2,
            s: 'number',
          },
          4: {
            v: 19200,
            t: 2,
            s: 'number',
          },
        },
        10: {
          0: {
            v: 'Design',
            t: 1,
            s: 'text',
          },
          1: {
            v: 'Leah',
            t: 1,
            s: 'text',
          },
          2: {
            v: 8200,
            t: 2,
            s: 'number',
          },
          3: {
            v: 9300,
            t: 2,
            s: 'number',
          },
          4: {
            v: 17500,
            t: 2,
            s: 'number',
          },
        },
        11: {
          0: {
            v: 'Engineering',
            t: 1,
            s: 'text',
          },
          1: {
            v: 'Sam',
            t: 1,
            s: 'text',
          },
          2: {
            v: 8800,
            t: 2,
            s: 'number',
          },
          3: {
            v: 9000,
            t: 2,
            s: 'number',
          },
          4: {
            v: 17800,
            t: 2,
            s: 'number',
          },
        },
      },
    },
  },
}
