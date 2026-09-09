import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  type ISlideData,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

const workshop = [
  ['Session', 'Room', 'Seats'],
  ['Lettering', 'North', '12'],
  ['Binding', 'West', '8'],
  ['Riso', 'East', '16'],
]
const stock = [
  ['Paper', 'Weight', 'Sheets'],
  ['Ivory', '120 gsm', '240'],
  ['Kraft', '180 gsm', '90'],
  ['Slate', '160 gsm', '150'],
]
export const TABLES = [
  {
    page: 0,
    name: 'Dark header',
    left: 35,
    width: 390,
    height: 240,
    header: '#254B5A',
    headerText: '#FFFFFF',
    accent: false,
    values: workshop,
  },
  {
    page: 0,
    name: 'Light header and accent cell',
    left: 495,
    width: 390,
    height: 240,
    header: '#D8E6DE',
    headerText: '#233D48',
    accent: true,
    values: workshop,
  },
  {
    page: 1,
    name: 'Compact rows',
    left: 35,
    width: 350,
    height: 180,
    header: '#254B5A',
    headerText: '#FFFFFF',
    accent: false,
    values: stock,
  },
  {
    page: 1,
    name: 'Wider columns and taller rows',
    left: 455,
    width: 430,
    height: 280,
    header: '#254B5A',
    headerText: '#FFFFFF',
    accent: false,
    values: stock,
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
      id: 'styles',
      title: 'Native tables / headers and cells',
      hint: 'Same values and sizes. Compare headers and one highlighted cell.',
    },
    {
      id: 'dimensions',
      title: 'Table dimensions / compact or spacious',
      hint: 'Same values and styling. Compare column widths and row heights.',
    },
  ].map((page, index) => {
    const elements = [
      label(page.id + '-title', page.title, 35, 25, 850, 30),
      label(page.id + '-hint', page.hint, 35, 85, 850, 17),
      ...TABLES.filter((t) => t.page === index).map((t, i) =>
        label(page.id + '-label-' + i, t.name, t.left, 125, t.width, 19),
      ),
      label(
        page.id + '-footer',
        'Double-click a native table cell to edit its text. Table controls belong to the SDK.',
        35,
        500,
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
    id: 'native-tables-deck',
    name: 'Native slide tables',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 920, height: 570 },
    activeSlideId: 'styles',
    slideOrder: pages.map((p) => p.id),
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
  }
}
