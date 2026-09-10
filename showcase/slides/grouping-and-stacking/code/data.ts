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
    transform: { left, top, width: 240, height: 180, rotation: 0 },
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
      'independent',
      '01 / Independent objects',
      'Initially: separate coral and mint cards. Shift-click both; use Shape Format → Group.',
    ],
    ['grouped', '02 / One real group', 'Initially: one native group. Select it and use Shape Format → Ungroup.'],
    [
      'stacking',
      '03 / Stacking order',
      'Initially: mint covers coral. Select coral, then use Shape Format → Bring to Front.',
    ],
  ]
  const slides = specs.map(([id, title, caption]) => {
    const elements = [
      text(id + '-title', title, 40, 34),
      text(id + '-caption', caption, 110, 20),
      card(id + '-a', 180, 230, '#EAA58C'),
      card(id + '-b', id === 'stacking' ? 350 : 550, id === 'stacking' ? 290 : 230, '#8FCBB8'),
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
    id: 'grouping-gallery',
    name: 'Grouping and stacking',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1024, height: 576 },
    activeSlideId: 'independent',
    slides: Object.fromEntries(slides.map((s) => [s.id, s])),
    slideOrder: slides.map((s) => s.id),
  }
}
