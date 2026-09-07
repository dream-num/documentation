import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  type ISlideData,
  type ISlidePage,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { LocaleType } from '@univerjs/core'

export const FROZEN_CLOCK = '2027-03-31T09:00:00Z'
export const VARIANTS = [
  { id: 'field-brief', label: 'Field briefing · eight layouts' },
  { id: 'review-order', label: 'Review first · reordered deck' },
  { id: 'notes-free', label: 'Audience copy · no notes' },
  { id: 'empty', label: 'Empty presentation' },
] as const
export type Variant = (typeof VARIANTS)[number]['id']
function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  fontSize = 24,
  color = '#243746',
  bold = false,
): ISlidePageElement {
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
function shape(id: string, left: number, top: number, width: number, height: number, color: string): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: { shapeType: ShapeTypeEnum.RoundRect, fill: { color }, stroke: { color, width: 0 } },
  }
}

// Original fictional field briefing; all facts, identifiers and dates are deterministic.
// The bar comparison is composed of slide shapes, not a claim about a chart plugin.
export function createData(variant: Variant = 'field-brief'): ISlideData {
  const specifications: [string, string, string, ISlidePageElement[]][] = [
    [
      'opening',
      'Tern coastal observatory',
      'Welcome the six field leads. All readings in this briefing are fictional.',
      [
        shape('opening-band', 0, 0, 1200, 170, '#0F5260'),
        text('opening-kicker', 'FIELD BRIEFING / 31 MAR 2027', 70, 66, 1050, 50, 26, '#FFFFFF'),
        text('opening-subtitle', 'Six stations. One shared sampling plan.', 75, 345, 1000, 70, 32),
        text('opening-date', 'Cycle 08 · Prepared at 09:00 UTC', 75, 495, 1000, 50, 21, '#526873'),
      ],
    ],
    [
      'mission',
      '01 / Observe the changing coast',
      'Pause here. Ask which sites need paired observers.',
      [
        shape('mission-panel', 60, 345, 1080, 180, '#D8ECE9'),
        text(
          'mission-copy',
          'Collect repeatable readings\nKeep a visible chain of custody\nPublish uncertainty with every result',
          90,
          365,
          1000,
          150,
          26,
        ),
      ],
    ],
    [
      'stations',
      'Three habitats, six stations',
      'Estuary E2 has limited access. Reserve a second visit window.',
      ['Estuary / E1 + E2', 'Dunes / D1 + D2', 'Harbor / H1 + H2'].flatMap((label, i) => [
        shape('stations-card-' + i, 70 + i * 365, 340, 330, 180, ['#D8ECE9', '#F3E4C8', '#DCE6F4'][i]),
        text('stations-label-' + i, label, 90 + i * 365, 395, 285, 70, 25),
      ]),
    ],
    [
      'sampling',
      'A repeatable sampling sequence',
      'Do not skip the reference blank. Label containers before collecting water.',
      [
        text(
          'sampling-steps',
          '01  Label the container\n02  Collect the reference blank\n03  Take paired samples\n04  Log the handoff',
          80,
          335,
          1030,
          230,
          30,
        ),
      ],
    ],
    [
      'comparison',
      'Morning and afternoon windows',
      'Compare exposure, not team performance. Both windows are required.',
      [
        shape('comparison-am', 70, 330, 515, 245, '#D8ECE9'),
        shape('comparison-pm', 615, 330, 515, 245, '#F3E4C8'),
        text(
          'comparison-am-copy',
          'MORNING\n07:30–09:00\nLower foot traffic\nTwo paired observers',
          100,
          350,
          455,
          210,
          26,
        ),
        text(
          'comparison-pm-copy',
          'AFTERNOON\n15:00–16:30\nHigher surface temperature\nRepeat the same route',
          645,
          350,
          455,
          210,
          26,
        ),
      ],
    ],
    [
      'counts',
      'Accepted samples by habitat',
      'Total accepted samples: 126. These are fictional observations, not live measurements.',
      [
        ['Estuary', 42],
        ['Dunes', 31],
        ['Harbor', 53],
      ].flatMap(([label, count], i) => [
        text('counts-label-' + i, String(label), 75, 340 + i * 78, 185, 45, 26),
        shape('counts-bar-' + i, 265, 340 + i * 78, Number(count) * 12, 44, ['#147D83', '#B98B40', '#446A9A'][i]),
        text('counts-value-' + i, String(count), 280 + Number(count) * 12, 340 + i * 78, 80, 45, 26),
      ]),
    ],
    [
      'quote',
      'What the field team noticed',
      'Read the observation as a prompt, not a causal conclusion.',
      [
        shape('quote-line', 80, 340, 10, 200, '#147D83'),
        text('quote-copy', '“The best comparison is the one\nwe can repeat next month.”', 125, 350, 950, 130, 34),
        text('quote-credit', 'Mina / fictional field coordinator', 125, 510, 950, 45, 22, '#526873'),
      ],
    ],
    [
      'closing',
      'Next visit / make the handoff clear',
      'Confirm the next visit date, observer pairs, and the named dataset reviewer.',
      [
        text('closing-date', '14 APR 2027', 80, 350, 1000, 75, 44, '#147D83', true),
        text('closing-actions', 'Pair the observers · Check the kit · Confirm the reviewer', 80, 460, 1040, 90, 28),
      ],
    ],
  ]
  const slides = Object.fromEntries(
    specifications.map(([id, title, speakerNotes, body], i) => {
      const elements = [
        ...body,
        text(id + '-title', title, 70, 210, 1060, 105, 42, '#173A47', true),
        text(id + '-folio', `TERN / ${String(i + 1).padStart(2, '0')}`, 80, 615, 1000, 30, 16, '#526873'),
      ]
      const page: ISlidePage = {
        id,
        name: title,
        pageType: PageTypeEnum.Slide,
        speakerNotes: variant === 'notes-free' ? undefined : speakerNotes,
        background: {
          type: SlideBackgroundTypeEnum.Solid,
          color: ['#FFF3DF', '#D8EBDD', '#FAFCFB', '#DCE6F4', '#FAFCFB', '#FFF3DF', '#F5D4C5', '#D8EBDD'][i],
        },
        elements: Object.fromEntries(elements.map((element) => [element.id, element])),
        elementOrder: elements.map((element) => element.id),
      }
      return [id, page]
    }),
  )
  const slideOrder =
    variant === 'empty'
      ? []
      : variant === 'review-order'
        ? ['counts', 'comparison', 'opening', 'mission', 'stations', 'sampling', 'quote', 'closing']
        : specifications.map(([id]) => id)
  return {
    id: 'tern-deck',
    name: 'Tern / Coastal field briefing',
    appVersion: '1.0.0-beta.2',
    rev: 1,
    locale: LocaleType.EN_US,
    defaultPageSize: { width: 1200, height: 675 },
    slideOrder,
    slides: variant === 'empty' ? {} : slides,
    activeSlideId: slideOrder[0],
  }
}
