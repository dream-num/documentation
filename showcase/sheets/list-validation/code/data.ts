import type { ICellData, IWorkbookData, IWorksheetData } from '@univerjs/core'
import { serializeListOptions } from '@univerjs/preset-sheets-core'

export function getCategories(_legacyChinese = false) {
  return ['Ceramics', 'Textiles', 'Paper', 'Metal', 'Wood']
}

export function createWorkbookData(_legacyChinese = false): Partial<IWorkbookData> {
  const categories = getCategories()
  const objects = [
    'Blue glaze bowl',
    'Linen sampler',
    'Harbour map',
    'Brass compass',
    'Carved spoon',
    'Mixed donation box',
  ]
  const sheets: Record<string, Partial<IWorksheetData>> = {}
  for (const [id, name, accent] of [
    ['single', 'Single and appearance', '#164E63'],
    ['multiple', 'Multiple materials', '#7C3F58'],
    ['source', 'Live source', '#16645A'],
  ]) {
    const values = [categories[0], categories[1], 'Unknown', '', categories[4]]
    if (id === 'multiple') values[0] = serializeListOptions([categories[2], categories[1]])
    const headers =
      id === 'single'
        ? ['Object', 'Chips', 'Arrow', 'Plain text']
        : ['Object', id === 'multiple' ? 'Multiple materials' : 'Source H2:H6']
    const cellData: Record<number, Record<number, ICellData>> = {
      0: Object.fromEntries(
        headers.map((v, c) => [c, { v, s: { bg: { rgb: accent }, cl: { rgb: '#FFFFFF' }, bl: 1 } }]),
      ),
    }
    for (let row = 1; row <= objects.length; row++) {
      cellData[row] = { 0: { v: objects[row - 1] } }
      // B5 is explicitly blank; B7 has no stored value. Both retain the list rule.
      if (row < objects.length) {
        for (const column of id === 'single' ? [1, 2, 3] : [1]) cellData[row][column] = { v: values[row - 1] }
      }
    }
    if (id === 'source') {
      cellData[0][7] = { v: 'Editable options', s: { bl: 1 } }
      categories.forEach((v, index) => {
        cellData[index + 1][7] = { v, s: { bg: { rgb: '#E7F3EF' } } }
      })
    }
    sheets[id] = {
      id,
      name,
      rowCount: 25,
      columnCount: 10,
      defaultRowHeight: 36,
      columnData: { 0: { w: 205 }, 1: { w: 230 }, 2: { w: 170 }, 3: { w: 170 }, 7: { w: 185 } },
      cellData,
    }
  }
  return {
    id: 'museum-list-validation',
    name: 'Museum material validation',
    sheetOrder: ['single', 'multiple', 'source'],
    sheets,
  }
}
