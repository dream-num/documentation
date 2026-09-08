import type { IWorkbookData } from '@univerjs/presets'
import { LocaleType } from '@univerjs/presets'

export function createWorkbookData(_legacyChinese = false): Partial<IWorkbookData> {
  const pages = [
    ['geometry', 'Geometry & fills', 'Select a shape to edit with the native toolbar.'],
    ['text', 'Text & strokes', 'Compare text alignment, strokes, rotation and layering.'],
    ['connectors', 'Bound connectors', 'Drag a node and watch its bound connector follow.'],
    ['placement', 'Cell anchoring', 'Resize rows 1 and 3 to compare position and size changes.'],
  ]
  return {
    id: 'shape-gallery',
    name: 'Shape variants',
    locale: LocaleType.EN_US,
    sheetOrder: pages.map(([id]) => id),
    sheets: Object.fromEntries(
      pages.map(([id, name, instruction]) => [
        id,
        {
          id,
          name,
          rowCount: 35,
          columnCount: 16,
          defaultRowHeight: 28,
          defaultColumnWidth: 95,
          cellData: { 0: { 0: { v: instruction, s: { bl: 1, cl: { rgb: '#075985' } } } } },
        },
      ]),
    ),
  }
}
