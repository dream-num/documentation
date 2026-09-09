import type { IWorkbookData, IWorksheetData } from '@univerjs/presets'

export const PROFILES = [
  ['worksheet', 'Sheet locked'],
  ['locked', 'Range locked'],
  ['hidden', 'Not viewable'],
  ['editable', 'Editable rule'],
  ['mixed', 'Mixed ranges'],
  ['none', 'Unprotected'],
  ['formulas', 'Protected formulas'],
] as const

export function createData(_legacyChinese = false): Partial<IWorkbookData> {
  return {
    id: 'permission-gallery',
    name: 'Local permission comparisons',
    sheetOrder: PROFILES.map(([id]) => id),
    sheets: Object.fromEntries(
      PROFILES.map(([id, en]): [string, Partial<IWorksheetData>] => [
        id,
        {
          id,
          name: en,
          rowCount: 30,
          columnCount: 10,
          defaultRowHeight: 32,
          defaultColumnWidth: 130,
          columnData: { 0: { w: 95 }, 1: { w: 200 }, 2: { w: 140 }, 3: { w: 170 }, 4: { w: 150 } },
          cellData:
            id === 'formulas'
              ? {
                  0: { 0: { v: 'Protected formulas', s: { bl: 1 } } },
                  1: { 0: { v: 'Edit C4:C6 quantities; D4:D6 formulas are protected.' } },
                  2: { 1: { v: 'Workshop' }, 2: { v: 'Seats · editable' }, 3: { v: 'Fee · protected' } },
                  3: {
                    1: { v: 'Ceramics' },
                    2: { v: 6, s: { bg: { rgb: '#FFF0D5' } } },
                    3: { f: '=C4*35', s: { bg: { rgb: '#DDEDEC' } } },
                  },
                  4: {
                    1: { v: 'Printmaking' },
                    2: { v: 4, s: { bg: { rgb: '#FFF0D5' } } },
                    3: { f: '=C5*28', s: { bg: { rgb: '#DDEDEC' } } },
                  },
                  5: {
                    1: { v: 'Bookbinding' },
                    2: { v: 3, s: { bg: { rgb: '#FFF0D5' } } },
                    3: { f: '=C6*42', s: { bg: { rgb: '#DDEDEC' } } },
                  },
                }
              : {
                  0: { 0: { v: en, s: { bl: 1 } } },
                  1: { 0: { v: 'C4:C9 · local demo, not a security boundary' } },
                  2: { 1: { v: 'Outside range' }, 2: { v: 'Range values' } },
                  3: { 1: { v: 'A' }, 2: { v: 6.5 } },
                  4: { 1: { v: 'B' }, 2: { v: 3 } },
                  5: { 1: { v: 'C' }, 2: { v: 0 } },
                  6: { 1: { v: 'D' }, 2: { v: 8 } },
                  7: { 1: { v: 'E' }, 2: {} },
                  8: { 1: { v: 'F' }, 2: { v: 2.25 } },
                },
        },
      ]),
    ),
  }
}
