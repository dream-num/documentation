import type { IWorkbookData } from '@univerjs/presets'
import { LocaleType } from '@univerjs/presets'

export const QUOTE_DATA: Partial<IWorkbookData> = {
  id: 'embedded-quote-calculator',
  name: 'Northstar Robotics Quote',
  locale: LocaleType.EN_US,
  sheetOrder: ['quote'],
  styles: {
    header: { bg: { rgb: '#E0E7FF' }, bl: 1, cl: { rgb: '#312E81' } },
    currency: { n: { pattern: '$#,##0.00' } },
    percent: { n: { pattern: '0%' } },
    input: { bg: { rgb: '#EFF6FF' }, cl: { rgb: '#1D4ED8' } },
    inputCurrency: { bg: { rgb: '#EFF6FF' }, cl: { rgb: '#1D4ED8' }, n: { pattern: '$#,##0.00' } },
    inputPercent: { bg: { rgb: '#EFF6FF' }, cl: { rgb: '#1D4ED8' }, n: { pattern: '0.00%' } },
    total: { bg: { rgb: '#DCFCE7' }, bl: 1, cl: { rgb: '#166534' }, n: { pattern: '$#,##0.00' } },
  },
  sheets: {
    quote: {
      id: 'quote',
      name: 'Quote Builder',
      rowCount: 24,
      columnCount: 8,
      columnData: {
        0: { w: 200 },
        1: { w: 90 },
        2: { w: 115 },
        3: { w: 95 },
        4: { w: 170 },
        5: { w: 95 },
        6: { w: 120 },
      },
      mergeData: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 4 }],
      cellData: {
        0: { 0: { v: 'Northstar Robotics · Embedded quote', s: 'header' } },
        2: {
          0: { v: 'Plan', s: 'header' },
          1: { v: 'Seats', s: 'header' },
          2: { v: 'Monthly USD', s: 'header' },
          3: { v: 'Discount', s: 'header' },
          4: { v: 'Subscription / year', s: 'header' },
          5: { v: 'Currency', s: 'header' },
          6: { v: 'FX / USD', s: 'header' },
        },
        3: {
          0: { v: 'Business', s: 'input' },
          1: { v: 48, s: 'input' },
          2: { v: 32, s: 'inputCurrency' },
          3: { v: 0.12, s: 'inputPercent' },
          4: { f: '=B4*C4*12*(1-D4)*G4', s: 'total' },
          5: { v: 'USD', s: 'input' },
          6: { v: 1, s: 'input' },
        },
        6: {
          0: { v: 'Implementation services', s: 'header' },
          1: { v: 'Hours', s: 'header' },
          2: { v: 'Rate / USD', s: 'header' },
          4: { v: 'Subtotal', s: 'header' },
        },
        7: {
          0: { v: 'Data migration' },
          1: { v: 18, s: 'input' },
          2: { v: 145, s: 'inputCurrency' },
          4: { f: '=B8*C8*$G$4', s: 'currency' },
        },
        8: {
          0: { v: 'Workflow design' },
          1: { v: 12, s: 'input' },
          2: { v: 165, s: 'inputCurrency' },
          4: { f: '=B9*C9*$G$4', s: 'currency' },
        },
        10: { 0: { v: 'First-year contract', s: 'header' }, 4: { f: '=E4+SUM(E8:E9)', s: 'total' } },
        13: {
          0: { v: 'Edit blue cells for a revised quote; migration and workflow design remain separate services.' },
        },
        15: { 0: { v: 'Fictional quote · 2027-03-31 · FX is illustrative, not a live market rate.' } },
      },
    },
  },
}

export const CURRENCIES = {
  USD: { rate: 1, pattern: '$#,##0.00' },
  EUR: { rate: 0.92, pattern: '€#,##0.00' },
  JPY: { rate: 150, pattern: '¥#,##0' },
}
export type Currency = keyof typeof CURRENCIES
