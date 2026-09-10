import { ShapeFillEnum, ShapeGradientTypeEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  type ISlideData,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

function shape(
  id: string,
  left: number,
  color: string,
  options: {
    outline?: number
    empty?: boolean
    type?: ShapeTypeEnum
    rotation?: number
    gradient?: ShapeGradientTypeEnum
    angle?: number
  } = {},
): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top: 220, width: 220, height: 150, rotation: options.rotation ?? 0 },
    shapeData: {
      shapeType: options.type ?? ShapeTypeEnum.Rect,
      fill: options.gradient
        ? {
            fillType: ShapeFillEnum.GradientFill,
            gradientType: options.gradient,
            gradientAngle: options.angle,
            gradientStops: [
              { position: 0, color },
              { position: 1, color: '#8C77BD' },
            ],
          }
        : { fillType: options.empty ? ShapeFillEnum.NoFill : ShapeFillEnum.SolidFill, color },
      stroke: {
        lineStrokeType: options.outline ? ShapeLineTypeEnum.SolidLine : ShapeLineTypeEnum.NoLine,
        color: '#24385B',
        width: options.outline ?? 0,
      },
    },
  }
}

function text(id: string, value: string, left: number, top: number, width: number, size = 22): ISlidePageElement {
  const doc = RichTextBuilder.create().span(value, { fontSize: size, color: '#24385B' }).getData()
  doc.id = `shape-gallery-${id}`
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  doc.body?.paragraphs?.forEach((paragraph, index) => {
    paragraph.paragraphId = `${id}-p-${index}`
  })
  doc.body?.sectionBreaks?.forEach((section, index) => {
    section.sectionId = `${id}-s-${index}`
  })
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height: size === 34 ? 60 : 42, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      shapeText: { dataModel: { doc } },
    },
  }
}

export function createData(): ISlideData {
  const rows = [
    {
      id: 'fills',
      title: '01 / Fill and outline',
      caption: 'Same geometry. Change only the paint.',
      labels: ['Solid fill', 'No fill + outline', 'Fill + outline'],
      shapes: [
        shape('solid', 70, '#3BA7C8'),
        shape('empty', 400, '#3BA7C8', { empty: true, outline: 3 }),
        shape('combined', 730, '#BDE9E0', { outline: 3 }),
      ],
    },
    {
      id: 'outlines',
      title: '02 / Outline weight',
      caption: 'Same fill and geometry. Compare 1, 4 and 8 pt.',
      labels: ['1 pt', '4 pt', '8 pt'],
      shapes: [1, 4, 8].map((width, index) =>
        shape(`weight-${width}`, 70 + index * 330, '#F3CDAD', { outline: width }),
      ),
    },
    {
      id: 'geometry',
      title: '03 / Shape and rotation',
      caption: 'Same fill. Compare the silhouette and angle.',
      labels: ['Rectangle / 0°', 'Rounded rectangle / 0°', 'Rectangle / 15°'],
      shapes: [
        shape('rectangle', 70, '#C9C1EA'),
        shape('rounded', 400, '#C9C1EA', { type: ShapeTypeEnum.RoundRect }),
        shape('rotated', 730, '#C9C1EA', { rotation: 15 }),
      ],
    },
  ]
  rows.push({
    id: 'gradients',
    title: '04 / Gradient direction',
    caption: 'Same two stops. Compare linear direction and radial fill.',
    labels: ['Linear / 0°', 'Linear / 90°', 'Radial'],
    shapes: [
      shape('linear-0', 70, '#8DE1D4', { gradient: ShapeGradientTypeEnum.Linear, angle: 0 }),
      shape('linear-90', 400, '#8DE1D4', { gradient: ShapeGradientTypeEnum.Linear, angle: 90 }),
      shape('radial', 730, '#8DE1D4', { gradient: ShapeGradientTypeEnum.Radial }),
    ],
  })
  const slides = rows.map((row) => {
    const elements = [
      text(`${row.id}-title`, row.title, 60, 45, 930, 34),
      text(`${row.id}-caption`, row.caption, 65, 120, 930),
      ...row.shapes,
      ...row.labels.map((label, index) => text(`${row.id}-label-${index}`, label, 65 + index * 330, 415, 320)),
      text(`${row.id}-footer`, 'Select a shape to explore the native formatting tools.', 65, 510, 930),
    ]
    return {
      id: row.id,
      name: row.title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: '#F6F8FC' },
      elements: Object.fromEntries(elements.map((element) => [element.id, element])),
      elementOrder: elements.map((element) => element.id),
    }
  })
  return {
    id: 'shape-gallery',
    name: 'Shape / Fill and outline',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1024, height: 576 },
    activeSlideId: 'fills',
    slides: Object.fromEntries(slides.map((slide) => [slide.id, slide])),
    slideOrder: slides.map((slide) => slide.id),
  }
}
