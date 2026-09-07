import type { IWorkbookData } from '@univerjs/core'

export const REVIEW_DATE = '2027-03-31T09:00:00Z'
export const CATEGORIES = ['Ceramics', 'Textiles', 'Paper', 'Metal', 'Wood']
const objects = [
  'Blue glaze bowl',
  'Linen sampler',
  'Harbour map',
  'Brass compass',
  'Carved spoon',
  'Tea strainer',
  'Silk ribbon',
  'Postcard album',
  'Oak frame',
  'Stoneware jug',
  'Wool blanket',
  'Copper kettle',
  'Field notebook',
  'Beech toy',
  'Porcelain lid',
  'Cotton apron',
  'Rail ticket',
  'Iron key',
  'Maple box',
  'Clay whistle',
  'Embroidered cuff',
  'Music score',
  'Silver thimble',
  'Walnut stool',
  'Tile fragment',
  'Felt hat',
  'Survey sketch',
  'Tin lantern',
  'Cedar tray',
  'Mixed donation box',
]
const categories = [
  'Ceramics',
  'Textiles',
  'Unknown',
  '',
  'Wood',
  'Metal',
  'Textiles',
  'Paper',
  'Wood',
  'Ceramics',
  'Textiles',
  'Metal',
  'Paper',
  'Wood',
  'Ceramics',
  'Textiles',
  'Paper',
  'Metal',
  'Wood',
  'Ceramics',
  'Textiles',
  'Paper',
  'Metal',
  'Wood',
  'Ceramics',
  'Textiles',
  'Paper',
  'Metal',
  'Wood',
  'Paper,Textiles',
]

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'morrow-museum-intake',
  name: 'Morrow Museum · intake review',
  sheetOrder: ['intake'],
  styles: { heading: { bg: { rgb: '#164E63' }, cl: { rgb: '#FFFFFF' }, bl: 1 }, money: { n: { pattern: '#,##0.00' } } },
  sheets: {
    intake: {
      id: 'intake',
      name: 'Intake',
      rowCount: 40,
      columnCount: 9,
      defaultRowHeight: 30,
      columnData: {
        0: { w: 210 },
        1: { w: 220 },
        2: { w: 100 },
        3: { w: 125 },
        4: { w: 180 },
        5: { w: 25 },
        6: { w: 25 },
        7: { w: 140 },
        8: { w: 80 },
      },
      cellData: {
        0: Object.fromEntries(
          ['Object', 'Material category', 'Estimate', 'Reviewer', 'Intake note', '', '', 'List source'].map((v, c) => [
            c,
            { v, s: 'heading' },
          ]),
        ),
        ...Object.fromEntries(
          objects.map((name, i) => [
            i + 1,
            {
              0: { v: name },
              1: { v: categories[i] },
              2: { v: i === 4 ? 0 : +(18.5 + i * 7.35).toFixed(2), s: 'money' },
              3: { v: ['Amira', 'Leo', 'Nia', 'Kenji', ''][i % 5] },
              4: {
                v:
                  i === 2
                    ? 'Unknown category to review'
                    : i === 3
                      ? 'Awaiting classification'
                      : i === 29
                        ? 'Two materials in one cell'
                        : `Accession MR-${String(i + 1).padStart(3, '0')}`,
              },
              ...(i < CATEGORIES.length ? { 7: { v: CATEGORIES[i] } } : {}),
            },
          ]),
        ),
        33: { 0: { v: 'Review snapshot' }, 1: { v: REVIEW_DATE } },
      },
    },
  },
}
