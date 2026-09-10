import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  type ISlideData,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import {
  SlideTableBorderDashEnum as Dash,
  SlideTableBorderPresetEnum as Preset,
  type ISlideTableCellRange,
} from '@univerjs-pro/slides-table'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

const weekend = [
  ['Pass', '', ''],
  ['Day', 'Adult', 'Child'],
  ['Sat', '40', '12'],
  ['Sun', '32', '9'],
]
const inventory = [
  ['Ink', 'Size', 'Stock'],
  ['Indigo', '250 ml', '24'],
  ['Ochre', '500 ml', '18'],
]
interface TableSample {
  page: number
  name: string
  left: number
  top: number
  width: number
  height: number
  values: string[][]
  color: string
  weight: number
  dash: Dash
  preset: Preset
  merge?: ISlideTableCellRange
  split?: boolean
}
export const TABLES: TableSample[] = [
  {
    page: 0,
    name: 'Horizontal / 3 columns',
    left: 35,
    top: 180,
    width: 260,
    height: 220,
    values: weekend,
    color: '#557E7C',
    weight: 1,
    dash: Dash.Solid,
    preset: Preset.All,
    merge: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 },
  },
  {
    page: 0,
    name: 'Vertical / 2 rows',
    left: 330,
    top: 180,
    width: 260,
    height: 220,
    values: [
      ['Pass', 'Day', 'Qty'],
      ['Flex', 'Sat', '40'],
      ['', 'Sun', '32'],
      ['Night', 'Fri', '18'],
    ],
    color: '#557E7C',
    weight: 1,
    dash: Dash.Solid,
    preset: Preset.All,
    merge: { startRow: 1, endRow: 2, startColumn: 0, endColumn: 0 },
  },
  {
    page: 0,
    name: 'Merged, then split',
    left: 625,
    top: 180,
    width: 260,
    height: 220,
    values: weekend,
    color: '#557E7C',
    weight: 1,
    dash: Dash.Solid,
    preset: Preset.All,
    merge: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 },
    split: true,
  },
  {
    page: 1,
    name: 'Outer / solid 3 px',
    left: 35,
    top: 165,
    width: 390,
    height: 120,
    values: inventory,
    color: '#254B5A',
    weight: 3,
    dash: Dash.Solid,
    preset: Preset.Outer,
  },
  {
    page: 1,
    name: 'All / solid 1 px',
    left: 495,
    top: 165,
    width: 390,
    height: 120,
    values: inventory,
    color: '#557E7C',
    weight: 1,
    dash: Dash.Solid,
    preset: Preset.All,
  },
  {
    page: 1,
    name: 'Between rows / dashed 2 px',
    left: 35,
    top: 370,
    width: 390,
    height: 120,
    values: inventory,
    color: '#AD6C39',
    weight: 2,
    dash: Dash.Dash,
    preset: Preset.InnerHorizontal,
  },
  {
    page: 1,
    name: 'All / dotted 2 px',
    left: 495,
    top: 370,
    width: 390,
    height: 120,
    values: inventory,
    color: '#806680',
    weight: 2,
    dash: Dash.Dot,
    preset: Preset.All,
  },
]

function label(id: string, value: string, left: number, top: number, width: number, size = 18): ISlidePageElement {
  const doc = RichTextBuilder.create().span(value, { fontFamily: 'Arial', fontSize: size, color: '#233D48' }).getData()
  doc.id = id
  doc.body?.paragraphs?.forEach((p, i) => {
    p.paragraphId = id + '-p-' + i
  })
  doc.body?.sectionBreaks?.forEach((s, i) => {
    s.sectionId = id + '-s-' + i
  })
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height: 50, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      shapeText: { dataModel: { doc } },
    },
  }
}
export function createData(): ISlideData {
  const pages = [
    {
      id: 'merges',
      title: 'Table structure / merge and split',
      hint: 'Compare column spans, row spans and a split range.',
    },
    {
      id: 'borders',
      title: 'Table borders / edges and line styles',
      hint: 'Same cell values. Change only the border edges and strokes.',
    },
  ].map((page, index) => {
    const elements = [
      label(page.id + '-title', page.title, 35, 25, 850, 30),
      label(page.id + '-hint', page.hint, 35, 85, 850, 17),
      ...TABLES.filter((t) => t.page === index).map((t, i) =>
        label(page.id + '-label-' + i, t.name, t.left, t.top - 45, t.width, 17),
      ),
      label(
        page.id + '-footer',
        'Select cells to use native table controls. Double-click to edit text.',
        35,
        510,
        850,
        17,
      ),
    ]
    return {
      id: page.id,
      name: page.title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: '#F4F1EA' },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
    }
  })
  return {
    id: 'table-merge-borders-deck',
    name: 'Table merge and borders',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 920, height: 570 },
    activeSlideId: 'merges',
    slideOrder: pages.map((p) => p.id),
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
  }
}
