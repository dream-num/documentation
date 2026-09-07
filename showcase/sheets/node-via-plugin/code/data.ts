import { type IWorkbookData, LocaleType } from '@univerjs/core'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'northstar-headless-workbook',
  name: 'Northstar Lab — Headless Batch Review',
  locale: LocaleType.EN_US,
  sheetOrder: ['samples', 'run-notes'],
  sheets: {
    samples: {
      id: 'samples',
      name: 'Samples',
      rowCount: 100,
      columnCount: 8,
      cellData: {
        0: {
          0: { v: 'Sample' },
          1: { v: 'Station' },
          2: { v: 'Batch' },
          3: { v: 'Flow m³/h' },
          4: { v: 'pH' },
          5: { v: 'Variance' },
          6: { v: 'Owner' },
        },
        1: {
          0: { v: 'NS-2401' },
          1: { v: 'North inlet' },
          2: { v: 'B-71' },
          3: { v: 84.25 },
          4: { v: 6.92 },
          5: { v: -0.15 },
          6: { v: 'A. Rivera' },
        },
        2: {
          0: { v: 'NS-2402' },
          1: { v: 'Wetland gate' },
          2: { v: 'B-71' },
          3: { v: 0 },
          4: {},
          5: { v: 0 },
          6: { v: 'Unassigned' },
        },
        3: {
          0: { v: 'NS-2403' },
          1: { v: 'South valve' },
          2: { v: 'B-72' },
          3: { v: 112.5 },
          4: { v: 7.08 },
          5: { v: 1.375 },
          6: { v: 'M. Chen' },
        },
        4: {
          0: { v: 'Total' },
          3: { f: '=SUM(D2:D4)' },
          5: { f: '=AVERAGE(F2:F4)' },
        },
      },
    },
    'run-notes': {
      id: 'run-notes',
      name: 'Run Notes',
      rowCount: 40,
      columnCount: 6,
      cellData: {
        0: { 0: { v: 'Checkpoint' }, 1: { v: 'Result' }, 2: { v: 'Comment' } },
        1: { 0: { v: 'Schema' }, 1: { v: 'Pass' }, 2: { v: 'Two named worksheets' } },
        2: { 0: { v: 'Missing pH' }, 1: { v: 'Retained' }, 2: { v: 'NS-2402 remains blank' } },
        3: { 0: { v: 'Snapshot' }, 1: { v: 'Ready' }, 2: { v: 'Serialized through FWorkbook.save()' } },
      },
    },
  },
}
