import type { IWorkbookData } from '@univerjs/presets'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'juniper-deliveries',
  name: 'Juniper cycle deliveries',
  sheetOrder: ['routes'],
  styles: {
    title: { bl: 1, fs: 18 },
    header: { bl: 1, bg: { rgb: '#DCFCE7' } },
    input: { bg: { rgb: '#FEF3C7' } },
  },
  sheets: {
    routes: {
      id: 'routes',
      name: 'Routes',
      rowCount: 35,
      columnCount: 8,
      columnData: { 0: { w: 230 }, 1: { w: 220 }, 2: { w: 26 }, 3: { w: 26 }, 4: { w: 220 }, 5: { w: 120 } },
      cellData: {
        0: { 0: { v: 'Juniper cycle deliveries', s: 'title' } },
        1: { 0: { v: 'Fictional local data · custom functions run in the browser' } },
        3: { 0: { v: 'Route key' }, 1: { v: 'NORTH', s: 'input' } },
        4: { 0: { v: 'Loaded status' }, 1: { f: '=CUSTOM_ASYNC_OBJECT(B4)' } },
        5: { 0: { v: 'Status is an SDK error' }, 1: { f: '=ISERROR(B5)' } },
        6: { 4: { v: 'Asynchronous stop table', s: 'header' } },
        7: { 0: { v: 'Trip', s: 'header' }, 1: { v: 'Minutes', s: 'header' }, 4: { f: '=CUSTOM_ASYNC_ARRAY(B4)' } },
        8: { 0: { v: 'Glasshouse' }, 1: { v: 12, s: 'input' } },
        9: { 0: { v: 'Water tower' }, 1: { v: 0, s: 'input' } },
        10: { 0: { v: 'Hill depot' }, 1: { v: 18, s: 'input' } },
        12: { 0: { v: 'Strict custom sum + 5' }, 1: { f: '=CUSTOMSUM(B9:B11,5)' } },
        13: { 0: { v: 'Dependent doubled' }, 1: { f: '=B13*2' } },
        14: { 0: { v: 'Text is rejected' }, 1: { f: '=CUSTOMSUM("late",5)' } },
        15: { 0: { v: 'Intentional error check' }, 1: { f: '=ISERROR(B15)' } },
      },
    },
  },
}
