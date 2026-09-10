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
import { HorizontalAlign, LocaleType, RichTextBuilder, SpacingRule, VerticalAlign } from '@univerjs/core'

type ParagraphOptions = Parameters<RichTextBuilder['paragraph']>[0]

const ALIGN_COPY = [
  'Leave the gate open until dusk. Lanterns mark the path beside the pond.',
  'Bring one sketch. Share one detail you noticed.',
]
const SPACE_COPY = ['Check the paper grain before folding.', 'Keep the offcuts for the next binding.']

function text(
  id: string,
  lines: string[],
  left: number,
  top: number,
  width: number,
  height: number,
  style: ParagraphOptions = {},
  size = 16,
  box = true,
): ISlidePageElement {
  const rich = RichTextBuilder.create()
  for (const line of lines) {
    rich
      .paragraph({
        align: HorizontalAlign.LEFT,
        lineHeight: 1,
        lineHeightRule: SpacingRule.AUTO,
        spaceBefore: 0,
        spaceAfter: 0,
        ...style,
      })
      .span(line, { fontFamily: 'Arial', fontSize: size, color: '#27384B' })
  }
  const doc = rich.getData()
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
      fill: box ? { fillType: ShapeFillEnum.SolidFill, color: '#FFFFFF' } : { fillType: ShapeFillEnum.NoFill },
      stroke: box
        ? { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#BFCAD5', width: 1 }
        : { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      textRectPadding: { left: box ? 12 : 0, right: box ? 12 : 0, top: box ? 12 : 0, bottom: box ? 12 : 0 },
      shapeText: {
        dataModel: { doc, va: VerticalAlign.TOP },
        isHorizontal: true,
        autoFitType: ShapeTextAutoFitType.NoAutoFit,
        textWrap: ShapeTextWrapType.Square,
      },
    },
  }
}

export function createData(): ISlideData {
  const alignment = [
    { id: 'left', label: 'Left', align: HorizontalAlign.LEFT },
    { id: 'center', label: 'Center', align: HorizontalAlign.CENTER },
    { id: 'right', label: 'Right', align: HorizontalAlign.RIGHT },
    { id: 'justified', label: 'Justified', align: HorizontalAlign.JUSTIFIED },
  ]
  const spacing: { id: string; label: string; style: ParagraphOptions }[] = [
    { id: 'baseline', label: 'Baseline · 1.0 lines', style: {} },
    { id: 'line-height', label: 'Line height · 1.5', style: { lineHeight: 1.5 } },
    { id: 'before', label: 'Before paragraph · 12 pt', style: { spaceBefore: 12 } },
    { id: 'after', label: 'After paragraph · 12 pt', style: { spaceAfter: 12 } },
    { id: 'first-line', label: 'First-line indent · 24 pt', style: { firstLineIndent: 24 } },
    { id: 'leading', label: 'Leading indent · 24 pt', style: { indentStart: 24 } },
  ]
  const pages = [
    {
      id: 'alignment',
      name: 'Paragraph alignment',
      elements: [
        text('alignment-title', ['Paragraph alignment'], 35, 30, 850, 45, {}, 30, false),
        text(
          'alignment-hint',
          ['Same copy, font and box width. Change only the paragraph alignment.'],
          35,
          88,
          850,
          35,
          {},
          17,
          false,
        ),
        ...alignment.flatMap((item, i) => [
          text(item.id + '-label', [item.label], 35 + i * 220, 145, 195, 35, {}, 19, false),
          text(item.id, ALIGN_COPY, 35 + i * 220, 195, 195, 300, { align: item.align }, 19),
        ]),
      ],
    },
    {
      id: 'spacing',
      name: 'Paragraph spacing and indents',
      elements: [
        text('spacing-title', ['Space changes the reading rhythm'], 35, 25, 850, 45, {}, 30, false),
        text(
          'spacing-hint',
          ['Compare each box with Baseline. The text and container dimensions stay identical.'],
          35,
          80,
          850,
          35,
          {},
          16,
          false,
        ),
        ...spacing.flatMap((item, i) => {
          const left = 35 + (i % 3) * 295
          const top = 135 + Math.floor(i / 3) * 220
          return [
            text(item.id + '-label', [item.label], left, top, 270, 30, {}, 17, false),
            text(item.id, SPACE_COPY, left, top + 38, 270, 165, item.style),
          ]
        }),
      ],
    },
  ]
  return {
    id: 'paragraph-layout-deck',
    name: 'Paragraph alignment and spacing',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 920, height: 590 },
    activeSlideId: 'alignment',
    slideOrder: pages.map((p) => p.id),
    slides: Object.fromEntries(
      pages.map((p) => [
        p.id,
        {
          id: p.id,
          name: p.name,
          pageType: PageTypeEnum.Slide,
          background: { type: SlideBackgroundTypeEnum.Solid, color: p.id === 'alignment' ? '#EFF3F8' : '#F6F0E8' },
          elements: Object.fromEntries(p.elements.map((e) => [e.id, e])),
          elementOrder: p.elements.map((e) => e.id),
        },
      ]),
    ),
  }
}
