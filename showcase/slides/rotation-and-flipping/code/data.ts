import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  type ISlideData,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

function text(id: string, value: string, left: number, top: number, width: number, size = 18): ISlidePageElement {
  const doc = RichTextBuilder.create().span(value, { fontSize: size, color: '#153F46' }).getData()
  doc.id = id
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
    transform: { left, top, width, height: 55, rotation: 0 },
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
      id: 'triangle',
      title: 'Rotation is not reflection',
      caption: 'The asymmetric triangle makes each transform visible.',
      type: ShapeTypeEnum.RightTriangle,
      color: '#E47A4D',
      variants: [
        { id: 'original', label: 'Original', rotation: 0, flipX: false, flipY: false },
        { id: 'quarter-turn', label: 'Rotate 90°', rotation: 90, flipX: false, flipY: false },
        { id: 'horizontal', label: 'Flip horizontally', rotation: 0, flipX: true, flipY: false },
        { id: 'vertical', label: 'Flip vertically', rotation: 0, flipX: false, flipY: true },
      ],
    },
    {
      id: 'arrow',
      title: 'Combine transforms',
      caption: 'Compare a half-turn, two reflections and a rotated reflection.',
      type: ShapeTypeEnum.BentUpArrow,
      color: '#258C87',
      variants: [
        { id: 'original', label: 'Original', rotation: 0, flipX: false, flipY: false },
        { id: 'half-turn', label: 'Rotate 180°', rotation: 180, flipX: false, flipY: false },
        { id: 'both', label: 'Flip both axes', rotation: 0, flipX: true, flipY: true },
        { id: 'combined', label: '90° + flip X', rotation: 90, flipX: true, flipY: false },
      ],
    },
  ]
  const slides = rows.map((row) => {
    const elements: ISlidePageElement[] = [
      text(row.id + '-title', row.title, 45, 30, 820, 30),
      text(row.id + '-caption', row.caption, 45, 100, 820),
      ...row.variants.flatMap<ISlidePageElement>((variant, index) => {
        const left = 55 + index * 215
        return [
          {
            id: variant.id,
            type: PageElementTypeEnum.Shape,
            transform: {
              left,
              top: 220,
              width: 145,
              height: 110,
              rotation: variant.rotation,
              flipX: variant.flipX,
              flipY: variant.flipY,
            },
            shapeData: {
              shapeType: row.type,
              fill: { fillType: ShapeFillEnum.SolidFill, color: row.color },
              stroke: { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#153F46', width: 2 },
            },
          },
          text(row.id + '-label-' + index, variant.label, left - 10, 385, 210),
        ]
      }),
      text(row.id + '-footer', 'Select a shape to rotate it. Labels are separate, upright text.', 45, 455, 820),
    ]
    return {
      id: row.id,
      name: row.title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: '#F5F3E9' },
      elements: Object.fromEntries(elements.map((element) => [element.id, element])),
      elementOrder: elements.map((element) => element.id),
    }
  })
  return {
    id: 'rotation-flip-lab',
    name: 'Rotation and reflection',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 920, height: 520 },
    activeSlideId: 'triangle',
    slides: Object.fromEntries(slides.map((slide) => [slide.id, slide])),
    slideOrder: slides.map((slide) => slide.id),
  }
}
