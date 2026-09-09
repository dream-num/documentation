import {
  ShapeFillEnum,
  ShapeLineTypeEnum,
  ShapeTextAutoFitType,
  ShapeTextWrapType,
  ShapeTypeEnum,
} from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  type ISlideData,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { HorizontalAlign, LocaleType, RichTextBuilder, VerticalAlign } from '@univerjs/core'

const COPY = 'Fold the field guide. Leave a clear margin for notes. Keep a pencil beside the walking map.'

function text(
  id: string,
  copy: string,
  left: number,
  top: number,
  width: number,
  height: number,
  va: VerticalAlign,
  padding: { left: number; right: number; top: number; bottom: number },
  box = true,
): ISlidePageElement {
  const doc = RichTextBuilder.create()
    .paragraph({ align: HorizontalAlign.LEFT, spaceAfter: 0 })
    .span(copy, { fontFamily: 'Arial', fontSize: box ? 20 : 22, color: '#493740' })
    .getData()
  doc.id = id + '-text'
  doc.body?.paragraphs?.forEach((p, i) => {
    p.paragraphId = id + '-p-' + i
  })
  doc.body?.sectionBreaks?.forEach((s, i) => {
    s.sectionId = id + '-s-' + i
  })
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      isTextBox: !box,
      fill: box ? { fillType: ShapeFillEnum.SolidFill, color: '#FFF9F2' } : { fillType: ShapeFillEnum.NoFill },
      stroke: box
        ? { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#BE8C9D', width: 1 }
        : { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      textRectPadding: padding,
      shapeText: {
        dataModel: { doc, va },
        isHorizontal: true,
        autoFitType: ShapeTextAutoFitType.NoAutoFit,
        textWrap: ShapeTextWrapType.Square,
      },
    },
  }
}

export function createData(): ISlideData {
  const zero = { left: 0, right: 0, top: 0, bottom: 0 }
  const even = { left: 20, right: 20, top: 20, bottom: 20 }
  const pages = [
    {
      id: 'vertical',
      name: 'Vertical alignment',
      variants: [
        { id: 'top', label: 'Top', va: VerticalAlign.TOP, padding: even },
        { id: 'middle', label: 'Middle', va: VerticalAlign.MIDDLE, padding: even },
        { id: 'bottom', label: 'Bottom', va: VerticalAlign.BOTTOM, padding: even },
      ],
    },
    {
      id: 'insets',
      name: 'Text box insets',
      variants: [
        { id: 'zero', label: 'No inset', va: VerticalAlign.TOP, padding: zero },
        { id: 'symmetric', label: '20 on every side', va: VerticalAlign.TOP, padding: even },
        {
          id: 'asymmetric',
          label: 'L36 / R12 / T12 / B28',
          va: VerticalAlign.TOP,
          padding: { left: 36, right: 12, top: 12, bottom: 28 },
        },
      ],
    },
  ]
  return {
    id: 'text-box-layout-deck',
    name: 'Text box insets and vertical alignment',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 960, height: 600 },
    activeSlideId: 'vertical',
    slideOrder: pages.map((p) => p.id),
    slides: Object.fromEntries(
      pages.map((p) => {
        const elements = [
          text(p.id + '-title', p.name, 35, 28, 890, 42, VerticalAlign.TOP, zero, false),
          text(
            p.id + '-hint',
            'Same text and fixed boxes. Labels describe the initial settings.',
            35,
            80,
            890,
            42,
            VerticalAlign.TOP,
            zero,
            false,
          ),
          ...p.variants.flatMap((v, i) => [
            text(v.id + '-label', v.label, 35 + i * 305, 145, 280, 38, VerticalAlign.TOP, zero, false),
            text(v.id, COPY, 35 + i * 305, 195, 280, 335, v.va, v.padding),
          ]),
        ]
        return [
          p.id,
          {
            id: p.id,
            name: p.name,
            pageType: PageTypeEnum.Slide,
            background: { type: SlideBackgroundTypeEnum.Solid, color: p.id === 'vertical' ? '#F3E8ED' : '#EEE9F4' },
            elements: Object.fromEntries(elements.map((e) => [e.id, e])),
            elementOrder: elements.map((e) => e.id),
          },
        ]
      }),
    ),
  }
}
