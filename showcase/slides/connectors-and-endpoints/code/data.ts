import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  type ISlideData,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

function text(id: string, value: string, top: number, size: number): ISlidePageElement {
  const doc = RichTextBuilder.create().span(value, { fontSize: size, color: '#243B45' }).getData()
  doc.id = id + '-doc'
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left: 60, top, width: 910, height: 65, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      shapeText: { dataModel: { doc } },
    },
  }
}
function card(id: string, left: number, top: number, color: string): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width: 200, height: 140, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.RoundRect,
      fill: { fillType: ShapeFillEnum.SolidFill, color },
      stroke: { lineStrokeType: ShapeLineTypeEnum.SolidLine, width: 3, color: '#243B45' },
    },
  }
}
export function createData(): ISlideData {
  const specs = [
    [
      'straight',
      '01 / Straight, both ends bound',
      'Initially: both endpoints attach to the facing shape sites. Drag either shape.',
    ],
    ['elbow', '02 / Elbow, both ends bound', 'Initially: a bent connector follows the same pair of bound shapes.'],
    [
      'free',
      '03 / One free endpoint',
      'Initially: only the coral endpoint is bound. The other endpoint is a free point.',
    ],
  ]
  const slides = specs.map(([id, title, caption]) => {
    const elements = [
      text(id + '-title', title, 40, 34),
      text(id + '-caption', caption, 110, 20),
      card(id + '-a', 120, 220, '#EAA58C'),
      card(id + '-b', 700, 330, '#8FCBB8'),
      {
        id: id + '-connector',
        type: PageElementTypeEnum.Shape,
        transform: { left: 320, top: 290, width: 380, height: 110, rotation: 0 },
        shapeData: {
          shapeType: id === 'elbow' ? ShapeTypeEnum.BentConnector3 : ShapeTypeEnum.StraightConnector1,
          stroke: { lineStrokeType: ShapeLineTypeEnum.SolidLine, width: 4, color: '#315AB6' },
        },
      } as ISlidePageElement,
    ]
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: '#FFFFFF' },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
    }
  })
  return {
    id: 'connector-gallery',
    name: 'Connectors and endpoints',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1024, height: 576 },
    activeSlideId: 'straight',
    slides: Object.fromEntries(slides.map((s) => [s.id, s])),
    slideOrder: slides.map((s) => s.id),
  }
}
