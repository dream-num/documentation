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
import { LocaleType, PresetListType, RichTextBuilder, VerticalAlign } from '@univerjs/core'

function shape(
  id: string,
  rich: RichTextBuilder,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  box = false,
): ISlidePageElement {
  const doc = rich.getData()
  doc.id = id + '-text'
  if (doc.body) {
    doc.body.textRuns = [
      { st: 0, ed: doc.body.dataStream.length - 2, ts: { ff: 'Arial', fs: size, cl: { rgb: '#43334F' } } },
    ]
    doc.body.paragraphs?.forEach((p, i) => {
      p.paragraphId = id + '-p-' + i
    })
    doc.body.sectionBreaks?.forEach((s, i) => {
      s.sectionId = id + '-s-' + i
    })
  }
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      isTextBox: !box,
      fill: box ? { fillType: ShapeFillEnum.SolidFill, color: '#FFFFFF' } : { fillType: ShapeFillEnum.NoFill },
      stroke: box
        ? { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#D8C9DE', width: 1 }
        : { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      textRectPadding: { left: box ? 18 : 0, right: box ? 14 : 0, top: box ? 18 : 0, bottom: box ? 14 : 0 },
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
  const variants = [
    {
      id: 'bullets',
      label: 'Gather / bullet list',
      type: PresetListType.BULLET_LIST,
      lines: ['Recycled paper', 'Cotton thread', 'A clean work surface'],
      levels: [0, 0, 0],
    },
    {
      id: 'ordered',
      label: 'Make / numbered list',
      type: PresetListType.ORDER_LIST,
      lines: ['Fold the paper', 'Stitch the spine', 'Press the finished book'],
      levels: [0, 0, 0],
    },
    {
      id: 'nested',
      label: 'Review / three levels',
      type: PresetListType.BULLET_LIST,
      lines: [
        'Check the binding',
        'Inspect the stitches',
        'Check thread tension',
        'Inspect the cover',
        'Share the finished book',
      ],
      levels: [0, 1, 2, 1, 0],
    },
  ]
  const elements = [
    shape('title', RichTextBuilder.create().text('Bookbinding / lists with structure'), 35, 28, 900, 50, 30),
    shape(
      'hint',
      RichTextBuilder.create().text(
        'Markers belong to native paragraph lists, not the typed text. Double-click a list to edit.',
      ),
      35,
      90,
      900,
      45,
      16,
    ),
    ...variants.flatMap((v, i) => {
      const rich = RichTextBuilder.create()
      v.lines.forEach((line, j) =>
        rich.listItem(line, {
          type: v.type,
          listId: v.id + '-list',
          level: v.levels[j],
          paragraphStyle: { spaceAfter: 14 },
        }),
      )
      return [
        shape(v.id + '-label', RichTextBuilder.create().text(v.label), 35 + i * 315, 155, 290, 38, 18),
        shape(v.id, rich, 35 + i * 315, 205, 290, 310, 18, true),
      ]
    }),
  ]
  return {
    id: 'native-slide-lists',
    name: 'Text lists and bullets',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 980, height: 560 },
    activeSlideId: 'lists',
    slideOrder: ['lists'],
    slides: {
      lists: {
        id: 'lists',
        name: 'Bookbinding lists',
        pageType: PageTypeEnum.Slide,
        background: { type: SlideBackgroundTypeEnum.Solid, color: '#F5EFF6' },
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}
