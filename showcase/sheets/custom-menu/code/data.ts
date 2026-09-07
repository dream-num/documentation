import type { IWorkbookData } from '@univerjs/presets'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'harbor-orders',
  name: 'Harbor procurement',
  sheetOrder: ['orders'],
  styles: {
    title: { bl: 1, fs: 18 },
    header: { bl: 1, bg: { rgb: '#DBEAFE' } },
    money: { n: { pattern: '$#,##0.00' } },
  },
  sheets: {
    orders: {
      id: 'orders',
      name: 'Orders',
      rowCount: 30,
      columnCount: 8,
      columnData: { 0: { w: 130 }, 1: { w: 200 }, 2: { w: 120 }, 3: { w: 135 }, 4: { w: 180 } },
      cellData: {
        0: { 0: { v: 'Harbor procurement · review queue', s: 'title' } },
        1: { 0: { v: 'Fictional orders · review date 2027-03-31 · actions affect selected order rows only' } },
        2: {
          0: { v: 'Order', s: 'header' },
          1: { v: 'Supplier', s: 'header' },
          2: { v: 'Amount · USD', s: 'header' },
          3: { v: 'Due date', s: 'header' },
          4: { v: 'Approval', s: 'header' },
        },
        3: {
          0: { v: 'PO-1042' },
          1: { v: 'Pine Workshop' },
          2: { v: 12960, s: 'money' },
          3: { v: '2027-03-24' },
          4: { v: 'Pending' },
        },
        4: {
          0: { v: 'PO-1043' },
          1: { v: 'Lumen Packaging' },
          2: { v: 3280, s: 'money' },
          3: { v: '2027-04-02' },
          4: { v: 'Needs changes' },
        },
        5: {
          0: { v: 'PO-1044' },
          1: { v: 'Kestrel Logistics' },
          2: { v: 7440, s: 'money' },
          3: { v: '2027-03-29' },
          4: { v: 'Pending' },
        },
        6: {
          0: { v: 'PO-1045' },
          1: { v: 'Tern Studio' },
          2: { v: 1580, s: 'money' },
          3: { v: '2027-04-09' },
          4: { v: 'Approved' },
        },
      },
    },
  },
}
