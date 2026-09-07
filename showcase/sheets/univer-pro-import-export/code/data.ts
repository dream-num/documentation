import type { IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'regional-sales-exchange-demo',
  name: 'August Regional Sales',
  locale: LocaleType.EN_US,
  sheetOrder: ['sales'],
  styles: {
    header: { bg: { rgb: '#DBEAFE' }, bl: 1, cl: { rgb: '#1E3A8A' } },
    currency: { n: { pattern: '$#,##0.00' } },
    total: { bg: { rgb: '#DCFCE7' }, bl: 1, n: { pattern: '$#,##0.00' } },
  },
  sheets: {
    sales: {
      id: 'sales',
      name: 'Regional Sales',
      rowCount: 30,
      columnCount: 8,
      columnData: { 0: { w: 110 }, 1: { w: 170 }, 2: { w: 105 }, 3: { w: 85 }, 4: { w: 105 }, 5: { w: 120 } },
      cellData: {
        0: {
          0: { v: 'Region', s: 'header' },
          1: { v: 'Account', s: 'header' },
          2: { v: 'Segment', s: 'header' },
          3: { v: 'Orders', s: 'header' },
          4: { v: 'Average order', s: 'header' },
          5: { v: 'Net revenue', s: 'header' },
        },
        1: {
          0: { v: 'North' },
          1: { v: 'Aurora Outfitters' },
          2: { v: 'Retail' },
          3: { v: 82 },
          4: { v: 146.2, s: 'currency' },
          5: { f: '=D2*E2', s: 'currency' },
        },
        2: {
          0: { v: 'West' },
          1: { v: 'Juniper Labs' },
          2: { v: 'Technology' },
          3: { v: 31 },
          4: { v: 612.5, s: 'currency' },
          5: { f: '=D3*E3', s: 'currency' },
        },
        3: {
          0: { v: 'South' },
          1: { v: 'Bluebird Foods' },
          2: { v: 'Hospitality' },
          3: { v: 118 },
          4: { v: 84.75, s: 'currency' },
          5: { f: '=D4*E4', s: 'currency' },
        },
        4: {
          0: { v: 'East' },
          1: { v: 'Atlas Health' },
          2: { v: 'Healthcare' },
          3: { v: 44 },
          4: { v: 388.1, s: 'currency' },
          5: { f: '=D5*E5', s: 'currency' },
        },
        5: {
          0: { v: 'Central' },
          1: { v: 'Prairie Transit' },
          2: { v: 'Public sector' },
          3: { v: 16 },
          4: { v: 1040, s: 'currency' },
          5: { f: '=D6*E6', s: 'currency' },
        },
        7: { 0: { v: 'Portfolio total', s: 'header' }, 3: { f: '=SUM(D2:D6)' }, 5: { f: '=SUM(F2:F6)', s: 'total' } },
        10: { 0: { v: 'August review · five regions, five customer segments.' } },
      },
    },
  },
}
