import type { IWorkbookData } from '@univerjs/core'
import { HorizontalAlign, VerticalAlign } from '@univerjs/core'

export function createWorkbookData(_legacyChinese = false): Partial<IWorkbookData> {
  const dimensions = {
    rowCount: 24,
    columnCount: 9,
    defaultRowHeight: 34,
    defaultColumnWidth: 116,
    rowHeader: { width: 46 },
    columnHeader: { height: 28 },
  }
  return {
    id: 'merge-cells-gallery',
    name: 'Merged-cell layouts',
    sheetOrder: ['gallery', 'practice'],
    styles: {
      title: { bg: { rgb: '#143E49' }, cl: { rgb: '#FFFFFF' }, fs: 20, bl: 1 },
      label: { cl: { rgb: '#365A67' }, fs: 11, bl: 1 },
      ocean: { bg: { rgb: '#DCEEF0' }, cl: { rgb: '#174E59' }, ht: HorizontalAlign.CENTER, vt: VerticalAlign.MIDDLE },
      sand: { bg: { rgb: '#FAE9CC' }, cl: { rgb: '#77522D' }, ht: HorizontalAlign.CENTER, vt: VerticalAlign.MIDDLE },
      violet: { bg: { rgb: '#E9E2F3' }, cl: { rgb: '#5A4379' }, ht: HorizontalAlign.CENTER, vt: VerticalAlign.MIDDLE },
      green: { bg: { rgb: '#DFEFE4' }, cl: { rgb: '#285C40' }, ht: HorizontalAlign.CENTER, vt: VerticalAlign.MIDDLE },
    },
    sheets: {
      gallery: {
        ...dimensions,
        id: 'gallery',
        name: 'Layout gallery',
        mergeData: [
          { startRow: 1, endRow: 1, startColumn: 1, endColumn: 7 },
          { startRow: 4, endRow: 4, startColumn: 1, endColumn: 3 },
          ...[8, 9, 10].map((row) => ({ startRow: row, endRow: row, startColumn: 1, endColumn: 3 })),
          ...[5, 6].map((column) => ({ startRow: 4, endRow: 6, startColumn: column, endColumn: column })),
          { startRow: 9, endRow: 11, startColumn: 5, endColumn: 7 },
        ],
        cellData: {
          1: { 1: { v: 'One range, four layout choices', s: 'title' } },
          3: {
            1: { v: 'HORIZONTAL · B5:D5', s: 'label' },
            5: { v: 'VERTICAL · F5:G7', s: 'label' },
          },
          4: {
            1: { v: 'Exhibition programme', s: 'ocean' },
            5: { v: 'Gallery A', s: 'violet' },
            6: { v: 'Gallery B', s: 'green' },
          },
          7: { 1: { v: 'ACROSS ROWS · B9:D11', s: 'label' } },
          8: {
            1: { v: '09:00 · Opening', s: 'ocean' },
            5: { v: 'RECTANGLE · F10:H12', s: 'label' },
          },
          9: {
            1: { v: '11:00 · Workshop', s: 'sand' },
            5: { v: 'Welcome desk', s: 'sand' },
          },
          10: { 1: { v: '14:00 · Guided tour', s: 'green' } },
          14: {
            1: {
              v: 'Edit a merged cell, or switch to Try it for native merge / unmerge.',
            },
          },
        },
      },
      practice: {
        ...dimensions,
        id: 'practice',
        name: 'Try it',
        cellData: {
          0: { 1: { v: 'Select B3:D4, then use the native Merge menu.' } },
          2: { 1: { v: 'Keep this label', s: 'ocean' }, 2: { s: 'ocean' }, 3: { s: 'ocean' } },
          3: { 1: { s: 'ocean' }, 2: { s: 'ocean' }, 3: { s: 'ocean' } },
          6: {
            1: {
              v: 'Only the upper-left value is retained when merging populated cells.',
            },
          },
        },
      },
    },
  }
}
