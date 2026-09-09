import type { IWorkbookData } from '@univerjs/core'
import { LocaleType, VerticalAlign, WrapStrategy } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  return {
    id: 'cell-rich-text',
    name: 'Inline text styles',
    locale: LocaleType.EN_US,
    sheetOrder: ['rich-text'],
    sheets: {
      'rich-text': {
        id: 'rich-text',
        name: 'Inline styles',
        rowCount: 20,
        columnCount: 10,
        defaultRowHeight: 38,
        defaultColumnWidth: 150,
        columnData: { 0: { w: 210 }, 1: { w: 450 }, 2: { w: 410 } },
        rowData: { 4: { h: 80 }, 6: { h: 80 }, 8: { h: 80 }, 10: { h: 100 } },
        cellData: {
          0: { 0: { v: 'A cell can contain more than one style', s: { fs: 20, bl: 1, cl: { rgb: '#0F766E' } } } },
          1: { 0: { v: 'Compare rich text in column B with the same words in plain text in column C.' } },
          3: { 0: { v: 'VARIANT' }, 1: { v: 'RICH TEXT RUNS' }, 2: { v: 'PLAIN TEXT COMPARISON' } },
          4: {
            0: { v: 'Emphasis and color' },
            1: { s: { bg: { rgb: '#ECFDF5' }, vt: VerticalAlign.MIDDLE } },
            2: { v: 'Status: Ready for review', s: { vt: VerticalAlign.MIDDLE } },
          },
          6: {
            0: { v: 'Mixed font families' },
            1: { s: { bg: { rgb: '#EFF6FF' }, vt: VerticalAlign.MIDDLE } },
            2: { v: 'Notebook / SKU-204 / Edition 02', s: { vt: VerticalAlign.MIDDLE } },
          },
          8: {
            0: { v: 'Strike and underline' },
            1: { s: { bg: { rgb: '#FFF7ED' }, vt: VerticalAlign.MIDDLE } },
            2: { v: 'Old title -> New title', s: { vt: VerticalAlign.MIDDLE } },
          },
          10: {
            0: { v: 'Multiline rich text' },
            1: { s: { bg: { rgb: '#F5F3FF' }, vt: VerticalAlign.TOP, tb: WrapStrategy.WRAP } },
            2: {
              v: 'Field notes\nBring a pencil and a small notebook.',
              s: { vt: VerticalAlign.TOP, tb: WrapStrategy.WRAP },
            },
          },
          13: {
            0: {
              v: 'Double-click B5 to edit its text. Select characters while editing to use native rich-text formatting.',
            },
          },
        },
      },
    },
  }
}
