import type { IWorkbookData } from '@univerjs/presets'

export const PROFILES = [
  ['worksheet', 'Sheet locked'],
  ['locked', 'Range locked'],
  ['hidden', 'Not viewable'],
  ['editable', 'Editable rule'],
  ['mixed', 'Mixed ranges'],
  ['none', 'Unprotected'],
] as const

export function createData(_legacyChinese = false): Partial<IWorkbookData> {
  return {
    id: 'permission-gallery',
    name: 'Local permission comparisons',
    sheetOrder: PROFILES.map(([id]) => id),
    sheets: Object.fromEntries(
      PROFILES.map(([id, en]) => [
        id,
        {
          id,
          name: en,
          rowCount: 30,
          columnCount: 10,
          defaultRowHeight: 32,
          defaultColumnWidth: 130,
          columnData: { 0: { w: 95 }, 1: { w: 200 }, 2: { w: 140 }, 3: { w: 170 }, 4: { w: 150 } },
          cellData: {
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
