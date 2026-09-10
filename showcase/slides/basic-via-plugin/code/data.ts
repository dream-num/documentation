import type { ISlideData, ISlidePage, ISlideShapeElement } from '@univerjs-pro/slides'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum } from '@univerjs-pro/slides'
import { LocaleType } from '@univerjs/core'

function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  fontSize: number,
  color: string,
  bold = false,
): ISlideShapeElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      isTextBox: true,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      textRectPadding: { left: 0, top: 0, right: 0, bottom: 0 },
      shapeText: { isHorizontal: true, isRichText: false, text: value, fontFamily: 'Arial', fontSize, color, bold },
    },
  }
}
function shape(
  id: string,
  left: number,
  top: number,
  width: number,
  height: number,
  color: string,
  type = ShapeTypeEnum.RoundRect,
  rotation = 0,
): ISlideShapeElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation },
    shapeData: {
      shapeType: type,
      ...(type === ShapeTypeEnum.RoundRect ? { adjustValues: { adj: 6500 } } : {}),
      fill: { color },
      stroke: { color, width: 0 },
    },
  }
}
function page(
  id: string,
  name: string,
  color: string,
  speakerNotes: string,
  elements: ISlideShapeElement[],
): ISlidePage {
  return {
    id,
    name,
    pageType: PageTypeEnum.Slide,
    background: { type: SlideBackgroundTypeEnum.Solid, color },
    speakerNotes,
    elementOrder: elements.map((element) => element.id),
    elements: Object.fromEntries(elements.map((element) => [element.id, element])),
  }
}
function metricCard(id: string, left: number, color: string, value: string, label: string): ISlideShapeElement {
  const card = shape(id, left, 292, 260, 190, color)
  card.shapeData.shapeText = {
    isHorizontal: true,
    isRichText: false,
    text: `${value}\n${label}`,
    fontFamily: 'Arial',
    fontSize: 23,
    color: '#FFFFFF',
    bold: true,
  }
  return card
}

export const SUMMARY_SLIDE = page(
  'summary',
  'Quarterly summary',
  '#101A34',
  'Q3 product momentum: pipeline growth +31%, customer retention 94%, and seven feature launches. These are three independent authored signals, not Formula or Chart outputs.',
  [
    text('summary-title', 'Q3 product momentum', 110, 88, 960, 72, 40, '#F5F7FF', true),
    text(
      'summary-copy',
      'A generated summary slide with three deliberately different business signals.',
      112,
      174,
      976,
      76,
      21,
      '#C8D0E4',
    ),
    metricCard('metric-growth', 112, '#496BD8', '+31%', 'Pipeline growth'),
    metricCard('metric-retention', 424, '#178871', '94%', 'Customer\nretention'),
    metricCard('metric-launches', 736, '#AD6817', '7', 'Feature launches'),
    text('summary-footnote', 'Independent signals / edit each value intentionally', 112, 552, 976, 36, 19, '#91A3C2'),
  ],
)

const cover = page(
  'cover',
  'Cover',
  '#F5F7FF',
  'Plugin-mode introduction: edit the native title, then inspect the feature and Q3 summary pages. No backend or simulated analytics is required.',
  [
    shape('hero-bg', 72, 72, 1056, 528, '#101A34'),
    shape('accent', 112, 120, 8, 410, '#50C8B0', ShapeTypeEnum.Rect),
    text('eyebrow', 'BUILD / EDIT / EXTEND', 150, 128, 860, 36, 18, '#58C8FF', true),
    text('title', 'Web SDK Slides', 150, 205, 900, 92, 46, '#F5F7FF', true),
    text(
      'subtitle',
      'A minimal plugin-mode setup powered by @univerjs-pro/slides and @univerjs-pro/slides-ui.',
      154,
      316,
      870,
      86,
      23,
      '#C8D0E4',
    ),
    {
      ...shape('badge', 154, 444, 280, 58, '#DDE5FF'),
      shapeData: {
        shapeType: ShapeTypeEnum.RoundRect,
        fill: { color: '#DDE5FF' },
        stroke: { color: '#DDE5FF', width: 0 },
        shapeText: {
          isHorizontal: true,
          isRichText: false,
          text: '@univerjs-pro',
          fontFamily: 'Arial',
          fontSize: 24,
          color: '#172B52',
          bold: true,
        },
      },
    },
  ],
)
const feature = page(
  'feature',
  'Feature',
  '#FFF8ED',
  'Register the core UI, Docs, Drawing, License, Slides Pro and Slides Pro UI plugins before creating a slide unit. The ellipse and hexagon are native editable shapes.',
  [
    shape('panel', 96, 96, 1008, 480, '#EAE2FF'),
    text('heading', 'Plugin mode', 150, 150, 630, 64, 34, '#111A2E', true),
    text(
      'copy',
      'Register core UI, Docs, Drawing, License, Slides Pro and Slides Pro UI plugins before creating a slide unit.',
      152,
      246,
      610,
      170,
      22,
      '#42526C',
    ),
    shape('shape-a', 815, 178, 140, 140, '#50C8B0', ShapeTypeEnum.Ellipse, 8),
    shape('shape-b', 900, 348, 150, 112, '#D98C5F', ShapeTypeEnum.Hexagon, -8),
    text('feature-footnote', 'Native text and geometry / one editable presentation', 150, 502, 900, 36, 19, '#536078'),
  ],
)

export const SLIDE_DATA: ISlideData = {
  id: 'slides-pro-demo',
  name: 'Web SDK Slides',
  appVersion: '1.0.0-beta.2',
  rev: 1,
  locale: LocaleType.EN_US,
  defaultPageSize: { width: 1200, height: 675 },
  slideOrder: ['cover', 'feature', 'summary'],
  activeSlideId: 'cover',
  slides: { cover, feature, summary: SUMMARY_SLIDE },
}
