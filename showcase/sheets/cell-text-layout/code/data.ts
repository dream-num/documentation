import type { ICellData, IWorkbookData } from '@univerjs/core'
import { HorizontalAlign, LocaleType, VerticalAlign, WrapStrategy } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const alignment: Record<number, Record<number, ICellData>> = {
    0: { 0: { v: 'Nine ways to align a cell', s: { fs: 20, bl: 1, cl: { rgb: '#115E59' } } } },
    1: { 0: { v: 'Select B5:D7 and compare native horizontal and vertical alignment controls.' } },
    3: { 1: { v: 'LEFT' }, 2: { v: 'CENTER' }, 3: { v: 'RIGHT' } },
  }
  const vertical = [VerticalAlign.TOP, VerticalAlign.MIDDLE, VerticalAlign.BOTTOM]
  const horizontal = [HorizontalAlign.LEFT, HorizontalAlign.CENTER, HorizontalAlign.RIGHT]
  vertical.forEach((vt, row) => {
    alignment[row + 4] = { 0: { v: ['TOP', 'MIDDLE', 'BOTTOM'][row] } }
    horizontal.forEach((ht, col) => {
      alignment[row + 4][col + 1] = {
        v: 'Field notes',
        s: { ht, vt, bg: { rgb: ['#D1FAE5', '#CCFBF1', '#E0F2FE'][row] } },
      }
    })
  })
  const sentence = 'A compact field notebook for sketches, observations and small discoveries.'
  return {
    id: 'cell-text-layout',
    name: 'Cell text layout',
    locale: LocaleType.EN_US,
    sheetOrder: ['alignment', 'wrapping', 'rotation'],
    sheets: {
      alignment: {
        id: 'alignment',
        name: 'Alignment',
        rowCount: 20,
        columnCount: 10,
        defaultColumnWidth: 200,
        defaultRowHeight: 36,
        cellData: alignment,
        rowData: { 4: { h: 86 }, 5: { h: 86 }, 6: { h: 86 } },
      },
      wrapping: {
        id: 'wrapping',
        name: 'Wrap, clip, overflow',
        rowCount: 20,
        columnCount: 10,
        defaultColumnWidth: 180,
        defaultRowHeight: 36,
        columnData: { 0: { w: 220 }, 1: { w: 205 } },
        rowData: { 4: { h: 104 }, 6: { h: 62 }, 8: { h: 62 }, 10: { h: 62 } },
        cellData: {
          0: { 0: { v: 'One sentence, three strategies', s: { fs: 20, bl: 1, cl: { rgb: '#9A3412' } } } },
          1: { 0: { v: 'Edit B5, B7 or B9. C9 is empty: type BLOCK there to stop the overflow, then delete it.' } },
          3: { 0: { v: 'STRATEGY' }, 1: { v: 'NATIVE CELL TEXT' } },
          4: {
            0: { v: 'WRAP' },
            1: { v: sentence, s: { tb: WrapStrategy.WRAP, vt: VerticalAlign.TOP, bg: { rgb: '#FFEDD5' } } },
          },
          6: {
            0: { v: 'CLIP' },
            1: { v: sentence, s: { tb: WrapStrategy.CLIP, vt: VerticalAlign.MIDDLE, bg: { rgb: '#FEF3C7' } } },
          },
          8: {
            0: { v: 'OVERFLOW / empty neighbor' },
            1: { v: sentence, s: { tb: WrapStrategy.OVERFLOW, vt: VerticalAlign.MIDDLE, bg: { rgb: '#FFF7ED' } } },
          },
          10: {
            0: { v: 'OVERFLOW / occupied neighbor' },
            1: { v: sentence, s: { tb: WrapStrategy.OVERFLOW, vt: VerticalAlign.MIDDLE, bg: { rgb: '#FFF7ED' } } },
            2: { v: 'BLOCK', s: { bl: 1, cl: { rgb: '#9A3412' } } },
          },
          13: {
            0: {
              v: 'Clipping changes display only. Select B7 to read the complete unchanged value in the formula bar.',
            },
          },
        },
      },
      rotation: {
        id: 'rotation',
        name: 'Text rotation',
        rowCount: 20,
        columnCount: 10,
        defaultColumnWidth: 190,
        defaultRowHeight: 36,
        rowData: { 4: { h: 150 } },
        cellData: {
          0: { 0: { v: 'Angle comparison', s: { fs: 20, bl: 1, cl: { rgb: '#3730A3' } } } },
          1: { 0: { v: 'Select an angle specimen and use the native text rotation menu to change its presentation.' } },
          3: { 0: { v: '0 degrees' }, 1: { v: '45 degrees' }, 2: { v: '-45 degrees' }, 3: { v: '90 degrees' } },
          4: Object.fromEntries(
            [0, 45, -45, 90].map((a, col) => [
              col,
              {
                v: 'FIELD NOTES',
                s: { tr: { a }, ht: HorizontalAlign.CENTER, vt: VerticalAlign.MIDDLE, bg: { rgb: '#E0E7FF' } },
              },
            ]),
          ),
        },
      },
    },
  }
}
